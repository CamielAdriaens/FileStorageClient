# syntax=docker/dockerfile:1.4

FROM node:20.9.0

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker's caching
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . /app

# Set environment variables for the build
ENV VITE_DOCKER=true

# Build the application
RUN npm run build

# Serve the built application
CMD [ "npm", "run", "start" ]
