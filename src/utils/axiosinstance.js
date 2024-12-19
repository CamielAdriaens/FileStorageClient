/*global google*/

import axios from 'axios';

// Check if running in Docker environment
let docker = false; // Default to false (local environment)
docker = Boolean(import.meta.env.vite_docker); // Dynamically set based on the environment variable

// Set the backend URL based on the environment
let backendurl;
if (docker) {
  backendurl = 'http://backend:8080'; // Docker network address
} else {
  backendurl = 'https://localhost:44332'; // Local development URL
}

// Retrieve the token from localStorage
const token = localStorage.getItem('token');

// Create Axios instance with conditional headers
const axiosInstance = axios.create({
  baseURL: backendurl,
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // Add Authorization header if token exists
  },
  withCredentials: true, // Allow sending credentials if necessary
});

export default axiosInstance;
