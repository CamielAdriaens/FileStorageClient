import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import '../App.css';
import './FileManagement.css';
import SearchFilter from './SearchFilter';
import FilePreview from './FilePreview';

export const FileManagement = () => {
  const { isSignedIn, reAuthenticate } = useAuth(); // Assuming reAuthenticate is available in AuthContext
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [sortOrder, setSortOrder] = useState('name');
  const [previewFile, setPreviewFile] = useState(null);
  const [activities, setActivities] = useState([]);
  const token = localStorage.getItem('token');

  // A helper function to make authenticated requests and handle 401 errors
  const fetchWithAuth = async (url, options = {}) => {
    if (!token) {
      console.error('No JWT token found. Please log in again.');
      return null;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.warn('Token expired or invalid, re-authenticating...');
        reAuthenticate(); // Trigger re-authentication
        return null;
      }

      return response;
    } catch (error) {
      console.error('Network error:', error);
      return null;
    }
  };

  // Fetch files from the server
  const fetchFiles = useCallback(async () => {
    const response = await fetchWithAuth('https://localhost:44331/api/files/secure-files');
    if (response && response.ok) {
      const data = await response.json();
      const fetchedFiles = Array.isArray(data.$values) ? data.$values : [];

      const filesWithTypes = fetchedFiles.map(file => {
        const extension = file.fileName.split('.').pop().toLowerCase();
        const type = ['jpg', 'jpeg', 'png', 'gif'].includes(extension)
          ? 'image'
          : extension === 'pdf'
          ? 'pdf'
          : 'doc';

        return { ...file, type, url: `https://localhost:44331/api/files/download/${file.mongoFileId}` };
      });

      setFiles(filesWithTypes);
      setFilteredFiles(filesWithTypes);
    } else {
      setFiles([]);
      setFilteredFiles([]);
    }
  }, [token]);

  const addActivity = (message) => {
    const newActivity = {
      message,
      timestamp: new Date().toLocaleString(),
    };
    setActivities((prevActivities) => {
      const updatedActivities = [newActivity, ...prevActivities];
      localStorage.setItem('activities', JSON.stringify(updatedActivities));
      return updatedActivities;
    });
  };

  // Handle file upload
  const handleFileChange = async (event) => {
    const fileToUpload = event.target.files[0];
    if (!fileToUpload) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    const response = await fetchWithAuth('https://localhost:44331/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (response && response.ok) {
      alert('File uploaded successfully.');
      fetchFiles();
      addActivity(`Uploaded file: ${fileToUpload.name}`);
    } else {
      console.error('File upload failed');
    }
  };

  // Handle file download
  const handleFileDownload = async (fileId, fileName) => {
    const response = await fetchWithAuth(`https://localhost:44331/api/files/download/${fileId}`);
    if (response && response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addActivity(`Downloaded file: ${fileName}`);
    } else {
      console.error('File download failed');
    }
  };

  // Handle file delete
  const handleFileDelete = async (fileId, fileName) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    const response = await fetchWithAuth(`https://localhost:44331/api/files/delete/${fileId}`, {
      method: 'DELETE',
    });

    if (response && response.ok) {
      alert('File deleted successfully.');
      fetchFiles();
      addActivity(`Deleted file: ${fileName}`);
    } else {
      console.error('File deletion failed');
    }
  };

  // Search, filter, and sort functionalities
  const handleSearch = (searchTerm) => {
    const filtered = files.filter(file =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  };

  const handleFilter = (fileType) => {
    const filtered = fileType ? files.filter(file => file.type === fileType) : files;
    setFilteredFiles(filtered);
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
    sortFiles(e.target.value);
  };

  const sortFiles = (criteria) => {
    const sortedFiles = [...filteredFiles].sort((a, b) => {
      if (criteria === 'name') return a.fileName.localeCompare(b.fileName);
      if (criteria === 'date') return new Date(b.uploadDate) - new Date(a.uploadDate);
      if (criteria === 'size') return b.size - a.size;
      return 0;
    });
    setFilteredFiles(sortedFiles);
  };

  // Fetch files on component mount
  useEffect(() => {
    if (isSignedIn) fetchFiles();
  }, [fetchFiles, isSignedIn]);

  return (
    <div className="main-content fade-in">
      {/* JSX with components and functions as in your code */}
    </div>
  );
};

export default FileManagement;
