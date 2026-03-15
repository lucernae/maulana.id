export class GeoParquetReader {
	constructor() {
		this.db = null
		this.conn = null
		this.initialized = false
		this.spatialLoaded = false
		this.duckdb = null
	}

	async initialize() {
		if (this.initialized) return

		// Dynamically import DuckDB WASM only on the client side
		this.duckdb = await import('@duckdb/duckdb-wasm')
		const duckdb = this.duckdb

		// Load DuckDB WASM bundles
		const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles()
		const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)
		const worker_url = URL.createObjectURL(
			new Blob([`importScripts("${bundle.mainWorker}");`], {
				type: 'text/javascript'
			})
		)

		const worker = new Worker(worker_url)
		const logger = new duckdb.ConsoleLogger()
		this.db = new duckdb.AsyncDuckDB(logger, worker)
		await this.db.instantiate(bundle.mainModule, bundle.pthreadWorker)
		URL.revokeObjectURL(worker_url)

		this.conn = await this.db.connect()

		// Load httpfs extension for remote file access
		try {
			await this.conn.query("INSTALL httpfs;")
			await this.conn.query("LOAD httpfs;")
			console.log('DuckDB httpfs extension loaded')
		} catch (err) {
			console.warn('Could not load httpfs extension:', err)
		}

		// Don't load spatial extension yet - will load it after reading parquet
		this.initialized = true
	}

	async loadSpatialExtension() {
		if (this.spatialLoaded) return

		try {
			await this.conn.query("INSTALL spatial;")
			await this.conn.query("LOAD spatial;")
			console.log('DuckDB spatial extension loaded')
			this.spatialLoaded = true
		} catch (err) {
			console.warn('Could not load spatial extension:', err)
		}
	}

	async loadParquet(url, tableName = 'data') {
		if (!this.initialized) await this.initialize()

		// Register the URL as a file that can be accessed by DuckDB
		await this.db.registerFileURL(tableName + '.parquet', url, this.duckdb.DuckDBDataProtocol.HTTP, true)
		console.log('File registered:', tableName + '.parquet')

		// Store the filename for later use
		this.registeredFile = tableName + '.parquet'
	}

	async query(sql) {
		if (!this.conn) throw new Error('Database not initialized')
		const result = await this.conn.query(sql)
		return result
	}

	async close() {
		if (this.conn) await this.conn.close()
		if (this.db) await this.db.terminate()
		this.initialized = false
	}
}
