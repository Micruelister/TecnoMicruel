# Use an official Python image as a base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# - netcat-openbsd is used by the entrypoint script to wait for the database
# - build-essential and libpq-dev are needed for psycopg2-binary with native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Make the entrypoint script executable
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["entrypoint.sh"]

# Expose the port the app will run on (Gunicorn will bind to this)
# The PORT variable is automatically provided by Cloud Run.
EXPOSE $PORT

# The CMD now becomes default arguments to the ENTRYPOINT.
# We can keep it here to specify the default command Gunicorn should run.
CMD ["app:app"]
