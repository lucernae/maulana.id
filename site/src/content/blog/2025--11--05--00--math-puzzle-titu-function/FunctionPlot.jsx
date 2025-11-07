import { useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import * as React from 'react'

const PlotlyPlot = lazy(() => import('react-plotly.js'))

export function FunctionPlot() {
	const [appliedK, setAppliedK] = useState(0.1)
	const [appliedTMin, setAppliedTMin] = useState(0)
	const [appliedTMax, setAppliedTMax] = useState(10)
	const [appliedNumPoints, setAppliedNumPoints] = useState(1001)
	const [hoveredPoint, setHoveredPoint] = useState(null)
	const [dualPoint, setDualPoint] = useState(null)
	const inputRef = useRef()
	const tMinRef = useRef()
	const tMaxRef = useRef()
	const numPointsRef = useRef()

	const generatePoints = useCallback((kValue, tMin, tMax, numPoints) => {
		const points = []
		const dualPoints = []
		const step = (tMax - tMin) / (numPoints - 1)
		const ft = (k, t) => (k * (t - 2) + 1) / (t + 1)
		for (let i = 0; i < numPoints; i++) {
			const t = tMin + i * step
			if (t !== -1) {
				points.push({
					x: t,
					y: ft(kValue, t)
				})
				const dualT = 1 + 2 / t
				dualPoints.push({
					x: dualT,
					y: ft(kValue, dualT)
				})
			}
		}
		return {
			points,
			dualPoints
		}
	}, [])

	const _points = useMemo(
		() => generatePoints(appliedK, appliedTMin, appliedTMax, appliedNumPoints),
		[appliedK, appliedTMin, appliedTMax, appliedNumPoints, generatePoints]
	)

	const points = _points.points
	const dualPoints = _points.dualPoints

	const handleClick = useCallback((data) => {
		if (data.points && data.points.length > 0) {
			setHoveredPoint(data.points[0].pointIndex)
		}
	}, [])

	const handleUnhover = useCallback(() => {
		setHoveredPoint(null)
	}, [])

	const handleApply = () => {
		const newK = Number(inputRef.current.value)
		const newTMin = Number(tMinRef.current.value)
		const newTMax = Number(tMaxRef.current.value)
		const newNumPoints = Number(numPointsRef.current.value)
		setAppliedK(newK)
		setAppliedTMin(newTMin)
		setAppliedTMax(newTMax)
		setAppliedNumPoints(newNumPoints)
	}

	return (
		<div>
			<div style={{ marginBottom: '1rem' }}>
				<label style={{ marginRight: '1rem' }}>
					k value:
					<input
						type='number'
						ref={inputRef}
						defaultValue={0.1}
						step='0.1'
						style={{ marginLeft: '0.5rem', width: '80px' }}
					/>
				</label>
				<label style={{ marginRight: '1rem' }}>
					t_min:
					<input
						type='number'
						ref={tMinRef}
						defaultValue={0}
						step='1'
						style={{ marginLeft: '0.5rem', width: '80px' }}
					/>
				</label>
				<label style={{ marginRight: '1rem' }}>
					t_max:
					<input
						type='number'
						ref={tMaxRef}
						defaultValue={10}
						step='1'
						style={{ marginLeft: '0.5rem', width: '80px' }}
					/>
				</label>
				<label style={{ marginRight: '1rem' }}>
					# points:
					<input
						type='number'
						ref={numPointsRef}
						defaultValue={1001}
						step='1'
						min='2'
						style={{ marginLeft: '0.5rem', width: '80px' }}
					/>
				</label>
				<button
					onClick={handleApply}
					style={{
						padding: '0.25rem 0.5rem',
						backgroundColor: '#4a90e2',
						color: 'white',
						border: 'none',
						borderRadius: '4px',
						cursor: 'pointer'
					}}
				>
					Apply
				</button>
			</div>
			<Suspense fallback={<div>Loading...</div>}>
				<PlotlyPlot
					className={'bg-white'}
					data={[
						{
							x: points.map((p) => p.x),
							y: points.map((p) => p.y),
							type: 'scatter',
							mode: 'lines+markers',
							name: `f(t) = (k(t-2)+1)/(t+1), k=${appliedK}`,
							hoverinfo: 'x+y',
							hoverlabel: {
								bgcolor: '#FFF',
								bordercolor: '#4a90e2',
								font: { size: 12 }
							},
							marker: {
								size: points.map((_, idx) => (hoveredPoint === idx ? 15 : 6)),
								color: points.map((_, idx) => (hoveredPoint === idx ? 'blue' : '#4a90e2')),
								opacity: points.map((_, idx) => (hoveredPoint === idx ? 1 : 0)),
								line: {
									color: points.map((_, idx) => (hoveredPoint === idx ? 'darkblue' : '#4a90e2')),
									width: points.map((_, idx) => (hoveredPoint === idx ? 2 : 0))
								}
							},
							line: {
								color: '#4a90e2'
							},
							hovertemplate:
								'Current Point:<br>' +
								't: %{x:.3f}<br>' +
								'f(t): %{y:.3f}<br>' +
								'<span><span style="color: red;">' +
								'Transformed Point:<br>1+2/t: %{customdata[0]:.3f}<br>f(1+2/t): %{customdata[1]:.3f}<br>' +
								'2f(1+2/t)+f(t)=1:<br>2*%{customdata[1]:.3f}+%{y:.3f}=%{customdata[2]:.3f}' +
								'</span>' +
								'</span>',
							customdata: points.map((p) => {
								const qx = 1 + 2 / p.x
								const qy = (appliedK * (qx - 2) + 1) / (qx + 1)
								const computedRelation = 2 * qy + p.y
								return [qx, qy, computedRelation]
							})
						},
						{
							x: dualPoints.map((p) => p.x),
							y: dualPoints.map((p) => p.y),
							type: 'scatter',
							mode: 'lines+markers',
							name: `f(t) = (k(t-2)+1)/(t+1), k=${appliedK}`,
							hoverinfo: 'skip',
							hoverlabel: {
								bgcolor: '#FFF',
								bordercolor: '#4a90e2',
								font: { size: 12 }
							},
							showlegend: false,
							marker: {
								size: dualPoints.map((_, idx) => (hoveredPoint === idx ? 15 : 0)),
								color: dualPoints.map((_, idx) => (hoveredPoint === idx ? 'red' : '#4a90e2')),
								opacity: dualPoints.map((_, idx) => (hoveredPoint === idx ? 1 : 0)),
								line: {
									color: dualPoints.map((_, idx) => (hoveredPoint === idx ? 'darkred' : '#4a90e2')),
									width: dualPoints.map((_, idx) => (hoveredPoint === idx ? 2 : 0))
								}
							},
							line: {
								color: '#4a90e2'
							}
						}
					]}
					layout={{
						title: 'Function Plot',
						xaxis: { title: 't', range: [appliedTMin, appliedTMax] },
						yaxis: {
							title: 'f(t)',
							range: [Math.min(...points.map((p) => p.y), Math.max(...points.map((p) => p.y)))]
						},
						width: 800,
						height: 500,
						hovermode: 'closest',
						hoverdistance: 10,
						showlegend: true
					}}
					config={{
						displayModeBar: true,
						responsive: true
					}}
					onClick={handleClick}
				/>
			</Suspense>
		</div>
	)
}
