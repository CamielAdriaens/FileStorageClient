import React, { useState, useEffect } from 'react';
import '../App.css'; // Import the global styles

export const FileManagement = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch files from API
  async function fetchFiles() {
    try {
      const response = await fetch('https://localhost:44374/api/files');
      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.status} ${response.statusText}`);
      }
      const files = await response.json();
      setFiles(files);  // Update the state with the fetched files
      console.log('Fetched files:', files);
    } catch (error) {
      console.error('Error fetching files:', error.message);
    }
    
  }

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
      const response = await fetch('http://localhost:19269/api/files/upload', {
        method: 'POST',
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
    console.log("Downloading file with ID:", fileId);  // Add this line to check the fileId
    try {
      const response = await fetch(`http://localhost:19269/api/files/download/${fileId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName); // Set the file name for download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);  // Clean up the link after download
      } else {
        console.error('File download failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Fetch files when the component mounts
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="main-content">  {/* Using the same class from HomePage */}
      <h2>File Management</h2>

      {/* File Upload Section */}
      <div className="login-section"> {/* Reuse the layout class */}
        <input type="file" onChange={handleFileChange} />
        <button className="btn" onClick={handleFileUpload}>Upload File</button> {/* Use .btn */}
      </div>

      {/* List of Uploaded Files */}
      <h3>Uploaded Files</h3>
      <ul className="user-info-section">  {/* Reuse .user-info-section for consistent style */}
        {files.length === 0 ? (
          <li>No files uploaded yet.</li>
        ) : (
          files.map((file) => (
            <li key={file.id}>
              {file.fileName} <span>({(file.length / 1024).toFixed(2)} KB)</span>
              <button className="btn" onClick={() => handleFileDownload(file.id, file.fileName)}>
                Download
              </button>
            </li>
          ))
        )}
      </ul>

      <footer className="footer">  {/* Reuse footer from HomePage */}
        &copy; 2024 FileStorage. All rights reserved.
      </footer>
    </div>
  );
};

export default FileManagement;
