import React, { useCallback, useState, useEffect } from 'react';
import '../App.css'; // Import the global styles

export const FileManagement = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const token = localStorage.getItem('token'); // Retrieve the JWT token

  const fetchFiles = useCallback(async () => {
    if (!token) {
      console.error('No JWT token found. Please login again.');
      return;
    }
  
    try {
      const response = await fetch('https://localhost:44374/api/files/secure-files', {
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
      console.log('Fetched files:', data);
  
      // Check for the array within the `$values` key
      if (Array.isArray(data.$values)) {
        setFiles(data.$values);
      } else {
        console.warn('Unexpected data structure:', data);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error.message);
      setFiles([]); // Reset to an empty array in case of error
    }
  }, [token]);
  

  // Handle file selection for upload
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://localhost:44374/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the JWT token
        },
        body: formData,
      });

      if (response.ok) {
        alert('File uploaded successfully.');
        setSelectedFile(null); // Clear selected file
        fetchFiles(); // Refresh the list of files after uploading
      } else {
        console.error('File upload failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Handle file download
  const handleFileDownload = async (fileId, fileName) => {
    console.log("Downloading file with ID:", fileId);
    try {
      const response = await fetch(`https://localhost:44374/api/files/download/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the JWT token
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // Set the file name for download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('File download failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Handle file deletion
  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`https://localhost:44374/api/files/delete/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Include the JWT token
        },
      });

      if (response.ok) {
        alert('File deleted successfully.');
        fetchFiles(); // Refresh the list of files after deleting
      } else {
        console.error('File deletion failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Fetch files when the component mounts
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="main-content">
      <h2>File Management</h2>

      {/* File Upload Section */}
      <div className="login-section">
        <input type="file" onChange={handleFileChange} />
        <button className="btn" onClick={handleFileUpload}>Upload File</button>
      </div>

      {/* List of Uploaded Files */}
      <h3>Uploaded Files</h3>
      <ul className="user-info-section">
        {files.length === 0 ? (
          <li>No files uploaded yet.</li>
        ) : (
          files.map((file, index) => (
            <li key={file.mongoFileId || file.id || index}>
              {file.fileName} <span>({file.length ? (file.length / 1024).toFixed(2) : '0'} KB)</span>
              <button className="btn" onClick={() => handleFileDownload(file.mongoFileId, file.fileName)}>
                Download
              </button>
              <button
                className="btn delete-btn"
                onClick={() => handleFileDelete(file.mongoFileId)}
                style={{ marginLeft: '10px' }}
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>

      <footer className="footer">
        &copy; 2024 FileStorage. All rights reserved.
      </footer>
    </div>
  );
};

export default FileManagement;
