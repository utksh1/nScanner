#!/bin/bash

echo "Setting up nScanner environment..."

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "Installing Python dependencies..."
    ./venv/bin/pip install -r requirements.txt
else
    echo "Python virtual environment already exists."
fi

cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "Node.js dependencies already installed."
fi
cd ..

echo "Setup complete! Run ./start.sh to start the servers."