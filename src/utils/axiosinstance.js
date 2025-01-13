/*global google*/

import axios from 'axios';

// Check if running in Docker environment
const docker = Boolean(process.env.REACT_APP_DOCKER || false);
console.log('Running in Docker:', docker);

// Set the backend URL based on the environment
const backendurl = docker
  ? 'http://filestorageserverapp:8080' // Docker network address
  : 'https://localhost:44332'; // Local development URL

// Retrieve the token from localStorage
const token = localStorage.getItem('token');

// Create Axios instance with conditional headers
const axiosInstance = axios.create({
  baseURL: backendurl,
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add Authorization header if token exists
  },
  withCredentials: true, // Allow sending credentials if necessary
});

export default axiosInstance;
