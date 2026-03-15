import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import DeckGL from '@deck.gl/react'
import { Map } from 'react-map-gl/dist/es5/exports-maplibre'
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers'
import { GeoParquetReader } from '../utils/geoparquet'
import Supercluster from 'supercluster'
import 'maplibre-gl/dist/maplibre-gl.css'

const GeoParquetMapViewerCore = ({
	dataUrl,
	osmUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
	initialViewState = {
		longitude: 118,
		latitude: -2,
		zoom: 5
	},
	initialExtent = null, // { minLon, maxLon, minLat, maxLat } - overrides initialViewState
	width = '100%',
	height = 600,
	sqlFilter,
	getRadius = 100,
	getFillColor = [0, 140, 255],
	tooltipColumns = ['name'],
	// Clustering configuration
	enableClustering = true,
	clusterZoomThreshold = 10, // Show individual points at zoom >= this value
	minClusterZoom = 3, // Minimum zoom for smallest clusters
	clusterRadiusMultiplier = 1000, // Base cluster radius multiplier
	// Geometry rendering configuration
	enableGeometryRendering = true,
	getLineColor = [255, 140, 0, 200],
	getLineWidth = 2,
	getPolygonFillColor = null, // Uses getFillColor if not specified
	// Query customization
	// Set to true if parquet file has pre-computed lon/lat columns (much faster!)
	usePrecomputedCoordinates = false,
	longitudeColumn = 'lon', // Column name for longitude if usePrecomputedCoordinates=true
	latitudeColumn = 'lat', // Column name for latitude if usePrecomputedCoordinates=true
	// Advanced: Custom query builder function
	// (bounds, parquetUrl, geometryEnabled, sqlFilter) => string
	customQueryBuilder = null
}) => {
	// Calculate initial view state from extent if provided
	const calculateViewFromExtent = (extent, viewportWidth = 1280, viewportHeight = 600) => {
		const { minLon, maxLon, minLat, maxLat } = extent

		// Calculate center
		const longitude = (minLon + maxLon) / 2
		const latitude = (minLat + maxLat) / 2

		// Calculate required zoom to fit extent
		// Account for Web Mercator distortion at different latitudes
		const latRad = (latitude * Math.PI) / 180
		const lonDiff = maxLon - minLon
		const latDiff = maxLat - minLat

		// Calculate zoom based on longitude span
		const zoomLon = Math.log2(360 / lonDiff) - 1

		// Calculate zoom based on latitude span (accounting for Mercator projection)
		const zoomLat = Math.log2(170.1022 / (latDiff * Math.cos(latRad))) - 1

		// Use the smaller zoom to ensure entire extent fits
		const zoom = Math.min(zoomLon, zoomLat, 18) // Cap at zoom 18

		return { longitude, latitude, zoom }
	}

	const computedInitialViewState = initialExtent
		? calculateViewFromExtent(initialExtent, typeof width === 'number' ? width : 1280, typeof height === 'number' ? height : 600)
		: initialViewState
	const [mapData, setMapData] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [viewState, setViewState] = useState(computedInitialViewState)
	const [isClustered, setIsClustered] = useState(false)
	const [superclusterIndex, setSuperclusterIndex] = useState(null)
	const [rawPoints, setRawPoints] = useState(null)
	const [arrowData, setArrowData] = useState(null)
	const [isRefetching, setIsRefetching] = useState(false)
	const [geoJsonFeatures, setGeoJsonFeatures] = useState(null) // Full geometries
	const [geometryEnabled, setGeometryEnabled] = useState(enableGeometryRendering)

	const readerRef = useRef(null)
	const loadingTimeoutRef = useRef(null)
	const pendingRequestRef = useRef(null)

	// Convert Arrow table to GeoJSON features for Supercluster
	const arrowToGeoJSON = useCallback((arrowTable, tooltipCols = []) => {
		const features = []
		const longitudeCol = arrowTable.getChild('longitude')
		const latitudeCol = arrowTable.getChild('latitude')

		// Extract tooltip columns for properties
		const attributeCols = tooltipCols.map(col => ({
			name: col,
			column: arrowTable.getChild(col)
		}))

		for (let i = 0; i < arrowTable.numRows; i++) {
			const lon = longitudeCol.get(i)
			const lat = latitudeCol.get(i)

			// Skip invalid coordinates
			if (lon === null || lat === null || !isFinite(lon) || !isFinite(lat)) {
				continue
			}

			const properties = { index: i }
			attributeCols.forEach(({ name, column }) => {
				if (column) {
					properties[name] = column.get(i)
				}
			})

			features.push({
				type: 'Feature',
				properties,
				geometry: {
					type: 'Point',
					coordinates: [lon, lat]
				}
			})
		}

		return features
	}, [])

	// Parse full geometries from Arrow table with GeoJSON column
	const parseGeometryFeatures = useCallback((arrowTable, tooltipCols = []) => {
		const features = []
		const geojsonCol = arrowTable.getChild('geojson')
		if (!geojsonCol) return null

		// Extract tooltip columns for properties
		const attributeCols = tooltipCols.map(col => ({
			name: col,
			column: arrowTable.getChild(col)
		}))

		for (let i = 0; i < arrowTable.numRows; i++) {
			const geojsonStr = geojsonCol.get(i)
			if (!geojsonStr) continue

			try {
				const geometry = JSON.parse(geojsonStr)

				const properties = { index: i }
				attributeCols.forEach(({ name, column }) => {
					if (column) {
						properties[name] = column.get(i)
					}
				})

				features.push({
					type: 'Feature',
					properties,
					geometry
				})
			} catch (err) {
				console.warn('Failed to parse geometry at index', i, err)
				continue
			}
		}

		return features
	}, [])

	// Calculate viewport bounds with buffer for smooth panning
	const getViewportBounds = useCallback((viewState, bufferMultiplier = 1.5) => {
		const halfWidth = (180 / Math.pow(2, viewState.zoom)) * bufferMultiplier
		const halfHeight = (90 / Math.pow(2, viewState.zoom)) * bufferMultiplier

		return {
			minLon: viewState.longitude - halfWidth,
			maxLon: viewState.longitude + halfWidth,
			minLat: viewState.latitude - halfHeight,
			maxLat: viewState.latitude + halfHeight
		}
	}, [])

	// Query visible points for current viewport - Direct query mode
	const queryViewportData = useCallback(async (reader, viewStateParam, parquetUrl) => {
		const bounds = getViewportBounds(viewStateParam)

		// Allow custom query builder for maximum flexibility
		let sql
		if (customQueryBuilder) {
			sql = customQueryBuilder(bounds, parquetUrl, geometryEnabled, sqlFilter)
		} else if (usePrecomputedCoordinates) {
			// OPTIMIZED QUERY: Use pre-computed lon/lat columns
			// This is 100x faster because it uses column statistics for row group pruning
			sql = `
				SELECT
					* EXCLUDE (geometry)${geometryEnabled ? '' : `, EXCLUDE (${longitudeColumn}, ${latitudeColumn})`},
					${longitudeColumn} as longitude,
					${latitudeColumn} as latitude
					${geometryEnabled ? ', ST_AsGeoJSON(ST_GeomFromWKB(geometry)) as geojson' : ''}
					${geometryEnabled ? ', ST_GeometryType(ST_GeomFromWKB(geometry)) as geom_type' : ''}
				FROM read_parquet('${parquetUrl}')
				WHERE
					${longitudeColumn} BETWEEN ${bounds.minLon} AND ${bounds.maxLon}
					AND ${latitudeColumn} BETWEEN ${bounds.minLat} AND ${bounds.maxLat}
					${sqlFilter ? `AND ${sqlFilter}` : ''}
			`
		} else {
			// FALLBACK QUERY: Compute centroids on-the-fly (slower but works with any GeoParquet)
			// This forces DuckDB to parse WKB geometry for every row before filtering
			sql = `
				SELECT
					* EXCLUDE (geometry),
					ST_X(ST_Centroid(ST_GeomFromWKB(geometry))) as longitude,
					ST_Y(ST_Centroid(ST_GeomFromWKB(geometry))) as latitude
					${geometryEnabled ? ', ST_AsGeoJSON(ST_GeomFromWKB(geometry)) as geojson' : ''}
					${geometryEnabled ? ', ST_GeometryType(ST_GeomFromWKB(geometry)) as geom_type' : ''}
				FROM read_parquet('${parquetUrl}')
				WHERE
					ST_X(ST_Centroid(ST_GeomFromWKB(geometry))) BETWEEN ${bounds.minLon} AND ${bounds.maxLon}
					AND ST_Y(ST_Centroid(ST_GeomFromWKB(geometry))) BETWEEN ${bounds.minLat} AND ${bounds.maxLat}
					${sqlFilter ? `AND ${sqlFilter}` : ''}
			`
		}

		const startTime = performance.now()
		const result = await reader.query(sql)
		const duration = performance.now() - startTime

		const mode = customQueryBuilder ? 'custom' : (usePrecomputedCoordinates ? 'optimized' : 'fallback')
		console.log(`GeoParquet query (${mode}): extent=[${bounds.minLon.toFixed(2)}, ${bounds.minLat.toFixed(2)}, ${bounds.maxLon.toFixed(2)}, ${bounds.maxLat.toFixed(2)}] rows=${result.numRows} time=${duration.toFixed(0)}ms`)

		return result
	}, [getViewportBounds, sqlFilter, geometryEnabled, usePrecomputedCoordinates, longitudeColumn, latitudeColumn, customQueryBuilder])

	// Initial data load
	useEffect(() => {
		if (!dataUrl) return

		const loadData = async () => {
			const reader = new GeoParquetReader()
			readerRef.current = reader

			try {
				setLoading(true)
				setError(null)

				const fullUrl = new URL(dataUrl, window.location.origin).href
				console.log('GeoParquet: initializing direct query mode for', fullUrl)

				await reader.initialize()
				await reader.loadSpatialExtension()

				// Load ONLY viewport points - Direct query to remote file
				const arrowResult = await queryViewportData(reader, viewState, fullUrl)

				// Handle empty viewport
				if (arrowResult.numRows === 0) {
					setMapData(null)
					setLoading(false)
					return
				}

				// Store Arrow table for rendering
				setArrowData(arrowResult)

				// Convert to GeoJSON for Supercluster (centroids)
				const geoJsonFeatures = arrowToGeoJSON(arrowResult, tooltipColumns)
				setRawPoints(geoJsonFeatures)

				// Parse full geometries if enabled
				if (enableGeometryRendering) {
					const fullGeometries = parseGeometryFeatures(arrowResult, tooltipColumns)
					setGeoJsonFeatures(fullGeometries)
				}

				// Initialize Supercluster with visible points only
				const index = new Supercluster({
					radius: 40,
					maxZoom: clusterZoomThreshold,
					minZoom: minClusterZoom,
					extent: 512,
					nodeSize: 64,
					log: false,
					reduce: (accumulated, props) => {
						accumulated.point_count += props.point_count || 1
					},
					map: (props) => ({ point_count: 1, ...props })
				})

				index.load(geoJsonFeatures)
				setSuperclusterIndex(index)

				setIsClustered(enableClustering && viewState.zoom < clusterZoomThreshold)
				setMapData(arrowResult)
				setLoading(false)
			} catch (err) {
				console.error('Error loading GeoParquet:', err)
				setError(err.message)
				setLoading(false)
				if (reader) await reader.close()
				readerRef.current = null
			}
		}

		loadData()

		return () => {
			if (readerRef.current) {
				readerRef.current.close().catch(console.error)
				readerRef.current = null
			}
			if (loadingTimeoutRef.current) {
				clearTimeout(loadingTimeoutRef.current)
			}
		}
	}, [dataUrl, sqlFilter])

	// Re-query when viewport changes significantly (pan/zoom)
	const lastViewportRef = useRef(null)

	useEffect(() => {
		if (!readerRef.current || !enableClustering || !superclusterIndex || !dataUrl) return

		const loadViewportData = async () => {
			// Cancel any pending request
			if (pendingRequestRef.current) {
				pendingRequestRef.current.cancelled = true
			}

			// Create new request tracker
			const currentRequest = { cancelled: false }
			pendingRequestRef.current = currentRequest

			// Calculate if viewport moved significantly
			const currentBounds = getViewportBounds(viewState)
			const lastBounds = lastViewportRef.current

			// Only re-query if viewport moved >50% or zoom changed significantly
			const shouldRequery = !lastBounds ||
				Math.abs(currentBounds.minLon - lastBounds.minLon) > (currentBounds.maxLon - currentBounds.minLon) * 0.5 ||
				Math.abs(currentBounds.minLat - lastBounds.minLat) > (currentBounds.maxLat - currentBounds.minLat) * 0.5

			if (shouldRequery) {
				try {
					setIsRefetching(true)

					const fullUrl = new URL(dataUrl, window.location.origin).href
					const arrowResult = await queryViewportData(readerRef.current, viewState, fullUrl)

					// Check if this request was cancelled while in-flight
					if (currentRequest.cancelled) {
						setIsRefetching(false)
						return
					}

					if (arrowResult.numRows === 0) {
						setMapData(null)
						setIsRefetching(false)
						return
					}

					setArrowData(arrowResult)

					const geoJsonFeatures = arrowToGeoJSON(arrowResult, tooltipColumns)
					setRawPoints(geoJsonFeatures)

					// Update full geometries if enabled
					if (enableGeometryRendering) {
						const fullGeometries = parseGeometryFeatures(arrowResult, tooltipColumns)
						setGeoJsonFeatures(fullGeometries)
					}

					// Re-initialize Supercluster with new viewport data
					const index = new Supercluster({
						radius: 40,
						maxZoom: clusterZoomThreshold,
						minZoom: minClusterZoom,
						extent: 512,
						nodeSize: 64,
						log: false,
						reduce: (accumulated, props) => {
							accumulated.point_count += props.point_count || 1
						},
						map: (props) => ({ point_count: 1, ...props })
					})

					index.load(geoJsonFeatures)
					setSuperclusterIndex(index)

					lastViewportRef.current = currentBounds
					setMapData(arrowResult)
					setIsRefetching(false)
				} catch (err) {
					if (!currentRequest.cancelled) {
						console.error('Error re-querying viewport:', err)
						setIsRefetching(false)
					}
				}
			}

			// Update clustering state (always runs, even if not re-querying)
			const shouldCluster = viewState.zoom < clusterZoomThreshold
			setIsClustered(shouldCluster)
		}

		// Debounce viewport updates to 1s (increased from 300ms)
		const timeout = setTimeout(loadViewportData, 1000)
		return () => {
			clearTimeout(timeout)
			// Cancel pending request on cleanup
			if (pendingRequestRef.current) {
				pendingRequestRef.current.cancelled = true
			}
		}
	}, [viewState, queryViewportData, getViewportBounds, arrowToGeoJSON, tooltipColumns, clusterZoomThreshold, minClusterZoom, enableClustering, dataUrl])

	const layers = useMemo(() => {
		if (!superclusterIndex || !rawPoints || !arrowData) return []

		// Calculate viewport bounds
		const bounds = [
			viewState.longitude - 180 / Math.pow(2, viewState.zoom),
			viewState.latitude - 90 / Math.pow(2, viewState.zoom),
			viewState.longitude + 180 / Math.pow(2, viewState.zoom),
			viewState.latitude + 90 / Math.pow(2, viewState.zoom)
		]

		// Get clusters for current viewport and zoom
		const clusterData = superclusterIndex.getClusters(bounds, Math.floor(viewState.zoom))

		const layersArray = []

		if (geometryEnabled && geoJsonFeatures) {
			// Hybrid rendering: split clusters vs individual features
			const clusters = clusterData.filter(d => d.properties.cluster)
			const individuals = clusterData.filter(d => !d.properties.cluster)

			// Layer 1: Clusters (ScatterplotLayer)
			if (clusters.length > 0) {
				layersArray.push(new ScatterplotLayer({
					id: 'geoparquet-clusters',
					data: clusters,
					getPosition: d => d.geometry.coordinates,
					getFillColor: d => {
						const count = d.properties.point_count
						const intensity = Math.min(255, 100 + Math.log10(count) * 50)
						return [0, intensity, 255, 200]
					},
					getRadius: d => clusterRadiusMultiplier * Math.sqrt(d.properties.point_count),
					radiusMinPixels: 10,
					radiusMaxPixels: 100,
					pickable: true,
					autoHighlight: true,
					onClick: (info) => {
						if (!info.object) return
						const { cluster_id } = info.object.properties
						const expansionZoom = superclusterIndex.getClusterExpansionZoom(cluster_id)
						setViewState({
							...viewState,
							longitude: info.object.geometry.coordinates[0],
							latitude: info.object.geometry.coordinates[1],
							zoom: Math.min(expansionZoom, 18),
							transitionDuration: 500,
							transitionInterpolator: null
						})
					},
					opacity: 0.8,
					stroked: true,
					lineWidthMinPixels: 2,
					getLineColor: [255, 255, 255, 150]
				}))
			}

			// Layer 2: Individual geometries (GeoJsonLayer)
			if (individuals.length > 0) {
				// Map individual features to their full geometries
				const individualGeometries = individuals.map(d => {
					const fullGeom = geoJsonFeatures.find(g => g.properties.index === d.properties.index)
					return fullGeom || d // Fallback to centroid if geometry not found
				})

				layersArray.push(new GeoJsonLayer({
					id: 'geoparquet-geometries',
					data: individualGeometries,

					// Point styling
					pointType: 'circle',
					getPointRadius: typeof getRadius === 'function'
						? d => getRadius(d, { index: d.properties.index })
						: getRadius,
					pointRadiusMinPixels: 3,
					pointRadiusMaxPixels: 50,

					// Line styling
					getLineColor: getLineColor,
					getLineWidth: getLineWidth,
					lineWidthMinPixels: 1,
					lineWidthMaxPixels: 5,

					// Polygon styling
					stroked: true,
					filled: true,
					extruded: false,
					getFillColor: typeof getFillColor === 'function'
						? d => getFillColor(d, { index: d.properties.index })
						: (getPolygonFillColor || getFillColor),
					lineWidthMinPixels: 1,

					// Interaction
					pickable: true,
					autoHighlight: true,

					// Performance
					updateTriggers: {
						getFillColor: [getFillColor, getPolygonFillColor],
						getPointRadius: [getRadius],
						getLineColor: [getLineColor],
						getLineWidth: [getLineWidth]
					}
				}))
			}
		} else {
			// Fallback: Original ScatterplotLayer behavior (backward compatible)
			layersArray.push(new ScatterplotLayer({
				id: 'geoparquet-layer',
				data: clusterData,

				getPosition: (d) => d.geometry.coordinates,

				getFillColor: (d) => {
					if (d.properties.cluster) {
						const count = d.properties.point_count
						const intensity = Math.min(255, 100 + Math.log10(count) * 50)
						return [0, intensity, 255, 200]
					}
					return typeof getFillColor === 'function'
						? getFillColor(d, { index: d.properties.index })
						: getFillColor
				},

				getRadius: (d) => {
					if (d.properties.cluster) {
						const count = d.properties.point_count
						return clusterRadiusMultiplier * Math.sqrt(count)
					}
					return typeof getRadius === 'function'
						? getRadius(d, { index: d.properties.index })
						: getRadius
				},

				radiusMinPixels: isClustered ? 10 : 3,
				radiusMaxPixels: isClustered ? 100 : 50,
				pickable: true,
				autoHighlight: true,

				onClick: (info) => {
					if (!info.object) return

					const { cluster, cluster_id } = info.object.properties
					if (cluster) {
						const expansionZoom = superclusterIndex.getClusterExpansionZoom(cluster_id)
						setViewState({
							...viewState,
							longitude: info.object.geometry.coordinates[0],
							latitude: info.object.geometry.coordinates[1],
							zoom: Math.min(expansionZoom, 18),
							transitionDuration: 500,
							transitionInterpolator: null
						})
					}
				},

				opacity: 0.8,
				stroked: true,
				lineWidthMinPixels: isClustered ? 2 : 1,
				getLineColor: [255, 255, 255, 150]
			}))
		}

		return layersArray
	}, [superclusterIndex, rawPoints, arrowData, geoJsonFeatures, viewState, isClustered, geometryEnabled, getFillColor, getRadius, clusterRadiusMultiplier, getLineColor, getLineWidth, getPolygonFillColor])

	if (loading) {
		return (
			<div className='p-6 border border-gray-200 rounded-lg'>
				<div className='flex justify-center items-center gap-6'>
					<div className='animate-spin rounded-full border-4 border-t-blue-500 border-gray-200 w-12 h-12'></div>
					<div className='flex flex-col gap-1'>
						<span>Loading map data...</span>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-6 border border-red-200 bg-red-50 rounded-lg'>
				<p className='text-red-600 font-semibold'>Error loading map:</p>
				<p className='text-red-500 text-sm'>{error}</p>
			</div>
		)
	}

	const mapStyle = {
		version: 8,
		sources: {
			'osm-tiles': {
				type: 'raster',
				tiles: [osmUrl],
				tileSize: 256,
				attribution: '© OpenStreetMap contributors'
			}
		},
		layers: [
			{
				id: 'osm',
				type: 'raster',
				source: 'osm-tiles',
				minzoom: 0,
				maxzoom: 19
			}
		]
	}

	return (
		<div style={{ width, height, position: 'relative' }} className='border border-gray-200 rounded-lg overflow-hidden'>
			{/* Info overlay - show mode and counts */}
			{(isClustered || (geometryEnabled && geoJsonFeatures)) && (
				<div
					style={{
						position: 'absolute',
						top: '10px',
						left: '10px',
						background: 'rgba(255, 255, 255, 0.9)',
						padding: '8px 12px',
						borderRadius: '4px',
						fontSize: '12px',
						fontWeight: 'bold',
						zIndex: 1,
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
					}}
				>
					{isClustered && `📍 Clustered view - Zoom ${Math.round(viewState.zoom)}`}
					{geometryEnabled && geoJsonFeatures && (
						<>
							{isClustered && ' | '}
							{`🗺️ ${geoJsonFeatures.length} geometries`}
						</>
					)}
					{isClustered && ' - Click clusters to zoom in'}
				</div>
			)}

			{/* Refetching indicator */}
			{isRefetching && (
				<div
					style={{
						position: 'absolute',
						top: '50px',
						left: '10px',
						background: 'rgba(255, 165, 0, 0.95)',
						color: 'white',
						padding: '8px 12px',
						borderRadius: '4px',
						fontSize: '12px',
						fontWeight: 'bold',
						zIndex: 1,
						boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
						display: 'flex',
						alignItems: 'center',
						gap: '8px'
					}}
				>
					<div className='animate-spin rounded-full border-2 border-t-white border-orange-300 w-3 h-3'></div>
					📡 Querying remote parquet...
				</div>
			)}

			<DeckGL
				viewState={viewState}
				onViewStateChange={({ viewState }) => setViewState(viewState)}
				controller={true}
				layers={layers}
				style={{ position: 'relative', width: '100%', height: '100%' }}
				getTooltip={({ object }) => {
					if (!object || !arrowData) return null

					const { cluster, point_count } = object.properties

					if (cluster) {
						const info = [
							`<b>Cluster:</b> ${point_count} points`,
							'<i>Click to zoom in</i>'
						]

						tooltipColumns.forEach((col) => {
							const value = object.properties[col]
							if (value !== undefined && value !== null) {
								info.push(`<b>${col}:</b> ${value}`)
							}
						})

						return {
							html: info.join('<br/>'),
							style: {
								backgroundColor: '#e3f2fd',
								padding: '10px',
								borderRadius: '6px',
								fontSize: '12px',
								border: '2px solid #2196f3'
							}
						}
					} else {
						// Individual feature - read from Arrow table
						const originalIndex = object.properties.index
						const geomType = object.geometry?.type || 'Point'

						const info = []

						// Show geometry type if geometry rendering is enabled
						if (geometryEnabled) {
							info.push(`<b>Type:</b> ${geomType}`)
						}

						// Add tooltip columns
						tooltipColumns.forEach((col) => {
							const column = arrowData.getChild(col)
							const value = column?.get(originalIndex)
							info.push(`<b>${col}:</b> ${value ?? 'N/A'}`)
						})

						return {
							html: info.join('<br/>'),
							style: {
								backgroundColor: '#fff',
								padding: '8px',
								borderRadius: '4px',
								fontSize: '12px',
								border: '1px solid #ddd'
							}
						}
					}
				}}
			>
				<Map mapStyle={mapStyle} />
			</DeckGL>
		</div>
	)
}

// Lazy-loading wrapper component
export const GeoParquetMapViewer = (props) => {
	const [isMapLoaded, setIsMapLoaded] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handleLoadMap = () => {
		setIsLoading(true)
		// Small delay to show the spinner, then load the map
		setTimeout(() => {
			setIsMapLoaded(true)
			setIsLoading(false)
		}, 100)
	}

	// If map is already loaded, render it directly
	if (isMapLoaded) {
		return <GeoParquetMapViewerCore {...props} />
	}

	// Show the load button
	return (
		<div className='p-6 border border-gray-200 rounded-lg'>
			{isLoading ? (
				<div className='flex justify-center items-center gap-6'>
					<div className='animate-spin rounded-full border-4 border-t-blue-500 border-gray-200 w-12 h-12'></div>
					<span>Loading map viewer...</span>
				</div>
			) : (
				<div className='flex flex-col gap-4'>
					<p className='text-gray-600 text-sm'>
						Click the button below to load the interactive map viewer
					</p>
					<button
						type='button'
						className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
						onClick={handleLoadMap}
					>
						📍 Load Interactive Map
					</button>
				</div>
			)}
		</div>
	)
}
