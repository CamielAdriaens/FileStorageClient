/*global google*/

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import '../App.css';
import './FileManagement.css';
import SearchFilter from './SearchFilter';
import FilePreview from './FilePreview';
import axiosInstance from '../utils/axiosinstance'; // Import your axiosInstance
import * as signalR from '@microsoft/signalr'; // Import SignalR
import { toast, ToastContainer } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

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
  const [newActivity, setNewActivity] = useState(null); // New activity state for real-time updates

  const token = localStorage.getItem('token'); // Token will be used in axiosInstance
  const connectionRef = useRef(null); // SignalR connection
  useEffect(() => {
    const connectSignalR = async () => {
      if (connectionRef.current) {
        console.log('SignalR connection already established.');
        return; // Skip if already connected
      }
  
      const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:44332/file-sharing-hub") // Your SignalR hub URL
        .configureLogging(signalR.LogLevel.Information) // Optional: Log SignalR messages for debugging
        .build();
  
        hubConnection.on("ReceiveMessage", (message) => {
          console.log("Received message:", message);
        
          if (message.includes("File shared")) {
            toast.info(`📥 ${message}`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
        
            // Re-fetch pending shares to update the list
            fetchPendingShares();
          }
        });
        
      
      try {
        // Start the SignalR connection
        await hubConnection.start();
        console.log("SignalR connection established.");
        connectionRef.current = hubConnection; // Store the connection in the ref
      } catch (error) {
        console.error("Error while starting SignalR connection:", error);
      }
    };
  
    connectSignalR();
  
    return () => {
      if (connectionRef.current) {
        console.log("Cleaning up SignalR connection...");
        connectionRef.current.stop();
        console.log("SignalR connection stopped.");
        connectionRef.current = null;
      }
    };
  }, []);
  
// Add new activity to activities state
useEffect(() => {
  if (newActivity) {
    setActivities((prev) => [newActivity, ...prev]);
  }
}, [newActivity]);
  // Fetch files from the server
  const fetchFiles = useCallback(async () => {
    if (!token) {
      console.error('No JWT token found. Please log in again.');
      return;
    }

    try {
      const response = await axiosInstance.get('/api/Files/secure-files');
      console.log("Fetched Data:", response.data);

      const fetchedFiles = Array.isArray(response.data.$values) ? response.data.$values : response.data;

      const filesWithTypes = fetchedFiles.map(file => {
        const extension = file.fileName.split('.').pop().toLowerCase();
        const type = ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : extension === 'pdf' ? 'pdf' : 'doc';
        return {
          ...file,
          type,
          url: `${axiosInstance.defaults.baseURL}/api/Files/download/${file.mongoFileId}`,
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
  }, [token]);

  // Fetch pending shares from the server
const fetchPendingShares = useCallback(async () => {
  try {
      const response = await axiosInstance.get('/api/Files/pending-shares');
      setPendingShares(response.data || []);  // Set pending shares
  } catch (error) {
      console.error('Error fetching pending shares:', error);
  }
}, []);

// Fetch files and pending shares when component mounts or when the user signs in
useEffect(() => {
  if (isSignedIn) {
      fetchFiles();  // Fetch files
      fetchPendingShares(); // Fetch pending shares
  }
}, [fetchFiles, fetchPendingShares, isSignedIn]);
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
    const response = await axiosInstance.post('/api/Files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      alert('File uploaded successfully.');
      fetchFiles();
      addActivity(`Uploaded file: ${fileToUpload.name}`);
      // Send real-time notification
      if (connectionRef.current) {
        connectionRef.current.invoke("SendMessageToUser", userId, `Uploaded file: ${fileToUpload.name}`);
      }
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
      const response = await axiosInstance.get(`/api/Files/download/${mongoFileId}`, { responseType: 'blob' });

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
    // Make the DELETE request
    const response = await axiosInstance.delete(`/api/Files/delete/${fileId}`);

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
// Handle file sharing
const handleShareFile = async (mongoFileId, fileName) => {
  if (!recipientEmail) {
    alert('Please enter a recipient email.');
    return;
  }

  try {
    const response = await axiosInstance.post('/api/Files/share-file', {
      recipientEmail,
      mongoFileId,
      fileName,
    });

    if (response.status === 200) {
      alert(`File "${fileName}" shared successfully.`);
      setRecipientEmail('');
      addActivity(`Shared file "${fileName}" with ${recipientEmail}`);
      // Send real-time notification
      if (connectionRef.current) {
        connectionRef.current.invoke("SendMessageToUser", userId, `Shared file "${fileName}" with ${recipientEmail}`);
      }
    } else {
      throw new Error('Failed to share file.');
    }
  } catch (error) {
    console.error('Error sharing file:', error);

    if (error.response && error.response.status === 400 && error.response.data === "You cannot share files with your own email.") {
      alert("You cannot share a file with your own email.");
    } else {
      alert('Failed to share file. Please try again.');
    }
  }
};


const handleAcceptShare = async (shareId, fileName) => {
  try {
    const response = await axiosInstance.post(`/api/Files/accept-share/${shareId}`);
    if (response.status === 200) {
      alert(`File "${fileName}" share accepted.`);
      // Remove the accepted share from the list dynamically
      setPendingShares((prevShares) => prevShares.filter((share) => share.shareId !== shareId));
      addActivity(`Accepted a shared file: ${fileName}`);
      
      // Fetch updated file list
      fetchFiles();
    } else {
      throw new Error('Failed to accept file share.');
    }
  } catch (error) {
    console.error('Error accepting share:', error);
    alert('Error accepting file share.');
  }
};


// Handle refusing a shared file
const handleRefuseShare = async (shareId, fileName) => {
  try {
    const response = await axiosInstance.delete(`/api/Files/refuse-share/${shareId}`);
    if (response.status === 200) {
      alert(`File "${fileName}" share refused.`);
      // Remove the refused share from the list dynamically
      setPendingShares((prevShares) => prevShares.filter((share) => share.shareId !== shareId));
      addActivity(`Refused a shared file: ${fileName}`);
    } else {
      throw new Error('Failed to refuse file share.');
    }
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
  const displayedActivities = newActivity ? [...activities, newActivity] : activities;

  return (
    <div className="main-content fade-in">
      <h2>File Management</h2>
      <ToastContainer /> {/* Toast container for displaying notifications */}
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
        <button
          className="button accept-btn"
          onClick={() => handleAcceptShare(share.shareId, share.fileName)}
        >
          Accept
        </button>
        <button
          className="button refuse-btn"
          onClick={() => handleRefuseShare(share.shareId, share.fileName)}
        >
          Refuse
        </button>
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
