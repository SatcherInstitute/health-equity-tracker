#!/usr/bin/env python3
import glob
import pandas as pd

# adjust this glob if your path differs
PATTERN = "python/tests/data/graphql_ahr/golden_data/behavioral_health_*_*.csv"

for path in glob.glob(PATTERN):
    # 1) load everything as str so blanks stay blank
    df = pd.read_csv(path, dtype=str)

    # 2) rename the old header if present
    if "excessive_drinking_per_100k" in df.columns:
        df = df.rename(columns={
            "excessive_drinking_per_100k": "excessive_drinking_pct_rate"
        })

    # 3) safely convert and scale, preserving empty cells
    raw = pd.to_numeric(df["excessive_drinking_pct_rate"], errors="coerce")
    scaled = raw.div(1000)  # e.g. 24400 → 24.4
    df["excessive_drinking_pct_rate"] = scaled

    # 4) write back
    df.to_csv(path, index=False)
    print(f"Updated {path}")
