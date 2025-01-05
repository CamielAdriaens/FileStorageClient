# syntax=docker/dockerfile:1.4

FROM node:20.9.0

# Set the working directory
WORKDIR /app

# Copy package files first to leverage Docker's caching
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . /app

# Set environment variables
ENV CI=true
ENV VITE_DOCKER=true
ENV PORT=3000

# Build the React application
RUN npm run build

# Expose the port for the container
EXPOSE 3000

# Serve the application using a static server
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
