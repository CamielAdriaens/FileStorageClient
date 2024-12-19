import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import '../App.css';
import './FileManagement.css';
import SearchFilter from './SearchFilter';
import FilePreview from './FilePreview';
import axios from 'axios';

export const FileManagement = () => {
  const { isSignedIn, userId } = useAuth(); // Assumes `userId` is available from AuthContext
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [sortOrder, setSortOrder] = useState('name');
  const [previewFile, setPreviewFile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [pendingShares, setPendingShares] = useState([]);

  const token = localStorage.getItem('token');
  const baseURL = window.location.hostname === 'localhost' ? 'https://localhost:44332' : 'http://filestorageserverapp:8080';

  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use(config => {
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch files from server
  const fetchFiles = useCallback(async () => {
    if (!token) {
      console.error('No JWT token found. Please log in again.');
      return;
    }

    try {
      const response = await api.get('/api/files/secure-files');
      console.log("Fetched Data:", response.data);

      const fetchedFiles = Array.isArray(response.data.$values) ? response.data.$values : response.data;

      const filesWithTypes = fetchedFiles.map(file => {
        const extension = file.fileName.split('.').pop().toLowerCase();
        const type = ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : extension === 'pdf' ? 'pdf' : 'doc';
        return {
          ...file,
          type,
          url: `${baseURL}/api/files/download/${file.mongoFileId}`,
        };
      });

      setFiles(filesWithTypes);
      setFilteredFiles(filesWithTypes);
    } catch (error) {
      console.error('Error fetching files:', error.message);
      setErrorMessage('Error fetching files. Please try again later.');
      setFiles([]);
      setFilteredFiles([]);
    }
  }, [token, baseURL]);


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
      const response = await api.post('/api/files/upload', formData, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert('File uploaded successfully.');
        fetchFiles(); // Refresh file list
        addActivity(`Uploaded file: ${fileToUpload.name}`);
      } else {
        throw new Error(`File upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  // Handle file download
  const handleFileDownload = async (mongoFileId, fileName) => {
    try {
      const response = await api.get(`/api/files/download/${mongoFileId}`, {
        responseType: 'blob',
      });

      if (response.status === 200) {
        const blob = response.data;
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
      alert('Error downloading file. Please try again.');
    }
  };
 // Handle file deletion
  const handleFileDelete = async (fileId, fileName) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await api.delete(`/api/files/delete/${fileId}`);

      if (response.status === 200) {
        alert('File deleted successfully.');
        fetchFiles(); // Refresh file list
        addActivity(`Deleted file: ${fileName}`);
      } else {
        throw new Error(`File deletion failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file. Please try again.');
    }
  };
  // Add activity to localStorage
  const addActivity = (message) => {
    const newActivity = { message, timestamp: new Date().toLocaleString() };
    setActivities((prev) => {
      const updated = [newActivity, ...prev];
      localStorage.setItem('activities', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchFiles();
    }
  }, [fetchFiles, isSignedIn]);
  // Handle file sharing
  const handleShareFile = async (mongoFileId, fileName) => {
    if (!recipientEmail) {
      alert('Please enter a recipient email.');
      return;
    }

    try {
      const response = await fetch('https://localhost:44332/api/files/share-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: recipientEmail,
          mongoFileId: mongoFileId,
          fileName: fileName,
        }),
      });

      if (response.ok) {
        alert(`File "${fileName}" shared successfully.`);
        setRecipientEmail(''); // Clear input field
        addActivity(`Shared file "${fileName}" with ${recipientEmail}`);
      } else {
        const errorText = await response.text();
        throw new Error(errorText);
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      alert('Failed to share file. Please try again.');
    }
    console.log("File ID being sent:", mongoFileId); // Log the fileId to ensure it's an integer

  };

  // Fetch pending shares
  const fetchPendingShares = async () => {
    try {
      const response = await fetch('https://localhost:44332/api/files/pending-shares', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch pending shares.');

      const data = await response.json();
      setPendingShares(data.$values || []);
    } catch (error) {
      console.error('Error fetching pending shares:', error);
    }
  };

  // Accept file share
  const handleAcceptShare = async (shareId) => {
    try {
      const response = await fetch(`https://localhost:44332/api/files/accept-share/${shareId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('File share accepted.');
        fetchPendingShares();
        addActivity('Accepted a shared file.');
      } else throw new Error('Failed to accept file share.');
    } catch (error) {
      console.error('Error accepting share:', error);
      alert('Error accepting file share.');
    }
  };

  // Refuse file share
  const handleRefuseShare = async (shareId) => {
    try {
      const response = await fetch(`https://localhost:44332/api/files/refuse-share/${shareId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('File share refused.');
        fetchPendingShares();
        addActivity('Refused a shared file.');
      } else throw new Error('Failed to refuse file share.');
    } catch (error) {
      console.error('Error refusing share:', error);
      alert('Error refusing file share.');
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
    if (isSignedIn) {
      fetchFiles();
      fetchPendingShares();
    }
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
            {errorMessage && <p className="error-message">{errorMessage}</p>}
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
                    <div className="share-section">
                      <input
                        type="email"
                        placeholder="Recipient's Email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                      />
                      <button className="button share-btn" onClick={() => handleShareFile(file.mongoFileId, file.fileName)}>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-files">No files uploaded yet.</p>
            )}
          </div>

          <h3>Pending Shares</h3>
          <div className="pending-shares">
            {pendingShares.length > 0 ? (
              pendingShares.map((share) => (
                <div key={share.shareId} className="pending-share-card">
                  <span>{share.fileName} shared by {share.senderEmail}</span>
                  <button className="button accept-btn" onClick={() => handleAcceptShare(share.shareId)}>Accept</button>
                  <button className="button refuse-btn" onClick={() => handleRefuseShare(share.shareId)}>Refuse</button>
                </div>
              ))
            ) : (
              <p>No pending file shares.</p>
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
