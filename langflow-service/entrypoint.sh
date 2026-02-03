#!/bin/sh
# Entrypoint para Langflow no Railway

# Se PORT não estiver definida, use 7860
PORT=${PORT:-7860}

echo "Starting Langflow on port $PORT"

exec python -m langflow run \
    --host 0.0.0.0 \
    --port $PORT \
    --workers 1 \
    --log-level info
