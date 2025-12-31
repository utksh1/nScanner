
#!/bin/bash

cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT SIGTERM

echo "Starting nScanner..."

echo "Starting Backend on http://127.0.0.1:8000..."
PYTHONPATH=. ./venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &

sleep 2

echo "Starting Frontend on http://localhost:3000..."
cd frontend
npm run dev &

sleep 5

# if command -v ngrok &> /dev/null; then
#     echo "------------------------------------------------"
#     echo "Starting Ngrok to expose Frontend..."
#     echo "Check the Ngrok URL below to access externally."
#     echo "------------------------------------------------"
#     ngrok http 3000
# else
#     echo "------------------------------------------------"
#     echo "Ngrok not found. Exposing frontend locally only."
#     echo "Install ngrok to share your scanner: https://ngrok.com"
#     echo "------------------------------------------------"
#     wait
# fi
