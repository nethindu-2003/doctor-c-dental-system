FROM mysql:8.0

# Copy initialization scripts into the image
# These will run when the container starts for the first time
COPY ./mysql-init/ /docker-entrypoint-initdb.d/
