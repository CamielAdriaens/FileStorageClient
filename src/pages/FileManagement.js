import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import '../App.css';
import './FileManagement.css';
import SearchFilter from './SearchFilter';
import FilePreview from './FilePreview';

export const FileManagement = () => {
  const { isSignedIn } = useAuth();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [sortOrder, setSortOrder] = useState('name');
  const [previewFile, setPreviewFile] = useState(null);
  const [activities, setActivities] = useState([]);

  const token = localStorage.getItem('token');

  // Fetch files from the server
  const fetchFiles = useCallback(async () => {
    if (!token) {
      console.error('No JWT token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('https://localhost:44332/api/files/secure-files', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const fetchedFiles = Array.isArray(data.$values) ? data.$values : [];

      const filesWithTypes = fetchedFiles.map(file => {
        const extension = file.fileName.split('.').pop().toLowerCase();
        const type = ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : extension === 'pdf' ? 'pdf' : 'doc';
        return {
          ...file,
          type,
          url: `https://localhost:44332/api/files/download/${file.mongoFileId}`,
        };
      });

      setFiles(filesWithTypes);
      setFilteredFiles(filesWithTypes);
    } catch (error) {
      console.error('Error fetching files:', error.message);
      setFiles([]);
      setFilteredFiles([]);
    }
  }, [token]);

  // Add activity to log and localStorage
  const addActivity = (message) => {
    const newActivity = { message, timestamp: new Date().toLocaleString() };
    setActivities((prev) => {
      const updated = [newActivity, ...prev];
      localStorage.setItem('activities', JSON.stringify(updated));
      return updated;
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

    try {
      const response = await fetch('https://localhost:44332/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully.');
        fetchFiles(); // Refresh the file list
        addActivity(`Uploaded file: ${fileToUpload.name}`);
      } else {
        throw new Error(`File upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Handle file download
  const handleFileDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`https://localhost:44332/api/files/download/${fileId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
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
        throw new Error(`File download failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Handle file deletion
  const handleFileDelete = async (fileId, fileName) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`https://localhost:44332/api/files/delete/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('File deleted successfully.');
        fetchFiles(); // Refresh the file list
        addActivity(`Deleted file: ${fileName}`);
      } else {
        throw new Error(`File deletion failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Search, filter, and sort functionalities
  const handleSearch = (searchTerm) => {
    const filtered = files.filter(file => file.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredFiles(filtered);
  };

  const handleFilter = (fileType) => {
    setFilteredFiles(fileType ? files.filter(file => file.type === fileType) : files);
  };

  const handleSortChange = (e) => {
    const criteria = e.target.value;
    setSortOrder(criteria);
    const sorted = [...filteredFiles].sort((a, b) => {
      if (criteria === 'name') return a.fileName.localeCompare(b.fileName);
      if (criteria === 'date') return new Date(b.uploadDate) - new Date(a.uploadDate);
      if (criteria === 'size') return b.size - a.size;
      return 0;
    });
    setFilteredFiles(sorted);
  };

  useEffect(() => {
    if (isSignedIn) fetchFiles();
  }, [fetchFiles, isSignedIn]);

  return (
    <div className="main-content fade-in">
      <h2>File Management</h2>
      {isSignedIn ? (
        <>
          <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />
          <select onChange={handleSortChange} value={sortOrder} className="sort-dropdown">
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>

          <div className="file-upload">
            <input type="file" onChange={handleFileChange} />
          </div>

          <div className="files-section">
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <div key={file.mongoFileId} className="file-card">
                  <div className="file-info">
                    <span className="file-name">{file.fileName}</span>
                    <span className="file-size">({file.length ? (file.length / 1024).toFixed(2) : '0'} KB)</span>
                  </div>
                  <div className="file-buttons">
                    <button className="button" onClick={() => setPreviewFile(file)}>
                      Preview
                    </button>
                    <button className="button" onClick={() => handleFileDownload(file.mongoFileId, file.fileName)}>
                      Download
                    </button>
                    <button className="button delete-btn" onClick={() => handleFileDelete(file.mongoFileId, file.fileName)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-files">No files uploaded yet.</p>
            )}
          </div>

          {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}
        </>
      ) : (
        <p>Please log in to manage files.</p>
      )}
      <footer className="footer">&copy; 2024 FileStorage. All rights reserved.</footer>
    </div>
  );
};

export default FileManagement;
