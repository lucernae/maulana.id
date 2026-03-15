#!/usr/bin/env python3
"""
Optimize GeoParquet file for spatial HTTP range requests.

This script:
1. Reads the existing parquet file
2. Sorts rows by spatial location (Hilbert curve for optimal spatial clustering)
3. Writes back with multiple row groups (~50k rows each)
4. Enables DuckDB to use HTTP range requests based on spatial extent

Run with: python src/test/optimize-parquet-spatial.py
"""

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from pathlib import Path
import struct

def hilbert_curve_distance(lon, lat, order=16):
    """
    Calculate Hilbert curve distance for a given lon/lat coordinate.
    This creates a 1D ordering that preserves 2D spatial locality.

    Args:
        lon: Longitude (-180 to 180)
        lat: Latitude (-90 to 90)
        order: Hilbert curve order (higher = more precision, default 16)

    Returns:
        Integer distance along the Hilbert curve
    """
    # Normalize to 0-1 range
    x = (lon + 180) / 360
    y = (lat + 90) / 180

    # Convert to integer coordinates
    n = 2 ** order
    x_int = int(x * (n - 1))
    y_int = int(y * (n - 1))

    # Simple Hilbert curve implementation
    # For production, use a library like python-hilbertcurve
    return xy_to_hilbert(x_int, y_int, order)

def xy_to_hilbert(x, y, order):
    """Convert 2D coordinates to Hilbert curve distance."""
    d = 0
    s = 2 ** (order - 1)

    while s > 0:
        rx = 1 if (x & s) > 0 else 0
        ry = 1 if (y & s) > 0 else 0
        d += s * s * ((3 * rx) ^ ry)
        x, y = rotate(s, x, y, rx, ry)
        s //= 2

    return d

def rotate(n, x, y, rx, ry):
    """Rotate/flip a quadrant appropriately."""
    if ry == 0:
        if rx == 1:
            x = n - 1 - x
            y = n - 1 - y
        x, y = y, x
    return x, y

def get_centroid_coords(wkb_geometry):
    """Extract centroid coordinates from WKB geometry."""
    # For simplicity, we'll use DuckDB to extract centroids
    # This will be done in batch below
    pass

def optimize_parquet_file(input_path, output_path, row_group_size=50000):
    """
    Optimize parquet file for spatial queries with HTTP range requests.

    Args:
        input_path: Path to input parquet file
        output_path: Path to output optimized parquet file
        row_group_size: Number of rows per row group (default 50,000)
    """
    print(f"📖 Reading parquet file: {input_path}")

    # Read the parquet file
    table = pq.read_table(input_path)
    df = table.to_pandas()

    print(f"   Total rows: {len(df):,}")
    print(f"   Columns: {', '.join(df.columns)}")

    # Extract centroids using DuckDB
    print("\n🔍 Extracting centroids from geometries...")

    import duckdb
    con = duckdb.connect()

    # Load spatial extension
    con.execute("INSTALL spatial;")
    con.execute("LOAD spatial;")

    # Register the dataframe
    con.register('data', df)

    # Extract centroids
    result = con.execute("""
        SELECT
            *,
            ST_X(ST_Centroid(ST_GeomFromWKB(geometry))) as lon,
            ST_Y(ST_Centroid(ST_GeomFromWKB(geometry))) as lat
        FROM data
    """).fetchdf()

    print(f"   ✅ Extracted {len(result):,} centroids")

    # Calculate Hilbert curve distance for spatial sorting
    print("\n📐 Calculating Hilbert curve distances for spatial sorting...")
    result['hilbert_dist'] = result.apply(
        lambda row: hilbert_curve_distance(row['lon'], row['lat']),
        axis=1
    )

    print("   ✅ Hilbert distances calculated")

    # Sort by Hilbert curve distance (creates spatial locality)
    print("\n🔀 Sorting by spatial location (Hilbert curve)...")
    result_sorted = result.sort_values('hilbert_dist')

    # Drop temporary columns
    result_sorted = result_sorted.drop(columns=['hilbert_dist', 'lon', 'lat'])

    print("   ✅ Sorted by spatial locality")

    # Convert back to Arrow table
    print(f"\n💾 Writing optimized parquet file: {output_path}")
    print(f"   Row group size: {row_group_size:,} rows")

    num_row_groups = (len(result_sorted) + row_group_size - 1) // row_group_size
    print(f"   Expected row groups: {num_row_groups}")

    table_sorted = pa.Table.from_pandas(result_sorted)

    # Write with specific row group size
    pq.write_table(
        table_sorted,
        output_path,
        row_group_size=row_group_size,
        compression='SNAPPY',
        use_dictionary=True,
        write_statistics=True  # Important: write min/max statistics
    )

    print("\n✅ Optimization complete!")

    # Verify the output
    print("\n📊 Verification:")
    output_metadata = pq.read_metadata(output_path)
    print(f"   Total rows: {output_metadata.num_rows:,}")
    print(f"   Row groups: {output_metadata.num_row_groups}")

    for i in range(output_metadata.num_row_groups):
        rg = output_metadata.row_group(i)
        print(f"   - Row group {i}: {rg.num_rows:,} rows, {rg.total_byte_size / 1024 / 1024:.2f} MB")

    print("\n💡 Benefits:")
    print("   ✅ Spatial data is now clustered by location")
    print("   ✅ Multiple row groups enable selective HTTP range requests")
    print("   ✅ Querying small spatial extents will download fewer row groups")
    print("   ✅ DuckDB can use row group statistics to skip unnecessary data")

if __name__ == '__main__':
    input_file = Path('site/src/content/sandbox/geoparquet-demo/groundsource_2026_indonesia.parquet')
    output_file = Path('site/src/content/sandbox/geoparquet-demo/groundsource_2026_indonesia_optimized.parquet')

    if not input_file.exists():
        print(f"❌ Input file not found: {input_file}")
        exit(1)

    optimize_parquet_file(input_file, output_file)

    print(f"\n🎯 Next steps:")
    print(f"   1. Verify optimization: duckdb -c \"SELECT * FROM parquet_file_metadata('{output_file}');\"")
    print(f"   2. Replace original file: mv {output_file} {input_file}")
    print(f"   3. Upload to R2: wrangler r2 object put maulana-id/datasets/gis/groundsource_2026_indonesia.parquet --file={output_file}")
