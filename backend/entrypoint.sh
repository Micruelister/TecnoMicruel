#!/bin/sh
# entrypoint.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Wait for the database to be ready (optional but good practice)
# This simple loop tries to connect every second for 15 seconds.
# Note: This requires netcat (nc) to be installed. We'll add it to the Dockerfile.
echo "Waiting for database..."

# The following is a placeholder for a real database wait script.
# In a real-world scenario, you'd use a more robust tool like wait-for-it.sh
# For now, a simple sleep will suffice to allow the DB to initialize.
sleep 5

echo "Running database migrations..."
# Set FLASK_APP environment variable for the flask command
export FLASK_APP=app.py
flask db upgrade

echo "Migrations applied successfully. Starting server..."


echo "Starting Gunicorn server..."
# Start the Gunicorn server, passing along any arguments
exec gunicorn --bind :$PORT --workers 1 --threads 8 app:app
