import React, { useState, useEffect } from 'react';

export const FileManagement = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch the list of files from the backend
  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:19269/api/files');
      const data = await response.json();
      setFiles(data); // Set the list of files
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

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
    try {
      const response = await fetch(`http://localhost:19269/api/files/download/${fileId}`, {
        method: 'GET',
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
    <div>
      <h2>File Management</h2>

      {/* Upload Section */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload}>Upload File</button>
      </div>

      {/* List of Files */}
      <h3>Uploaded Files</h3>
      <ul>
        {files.length === 0 ? (
          <li>No files uploaded yet.</li>
        ) : (
          files.map((file) => (
            <li key={file._id}>
              {file.filename} ({(file.length / 1024).toFixed(2)} KB)
              <button onClick={() => handleFileDownload(file._id, file.filename)}>
                Download
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FileManagement;
