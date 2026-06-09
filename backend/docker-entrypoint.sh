#!/bin/sh
set -e

python - <<'PY'
import os
import time
from urllib.parse import urlparse

import pymysql

database_url = os.environ.get("DATABASE_URL", "")
parsed = urlparse(database_url)

if parsed.scheme.startswith("mysql"):
    host = parsed.hostname or "db"
    port = parsed.port or 3306
    user = parsed.username
    password = parsed.password

    for attempt in range(30):
        try:
            connection = pymysql.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                connect_timeout=3,
            )
            connection.close()
            print("Database is ready")
            break
        except Exception as exc:
            print(f"Waiting for database... ({attempt + 1}/30)")
            time.sleep(2)
    else:
        raise RuntimeError("Database did not become ready in time")
PY

exec "$@"
