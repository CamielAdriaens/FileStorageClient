import React, { useEffect, useState } from 'react';
import './FilePreview.css';
import axiosInstance from '../utils/axiosinstance'; // Import your axiosInstance

const FilePreview = ({ file, onClose }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFile = async () => {
      try {

        const response = await axiosInstance.get(`/api/Files/download/${file.mongoFileId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };

    fetchFile();

    // Clean up the object URL when the component unmounts
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [file.mongoFileId, token]);

  // Determine the preview type based on the file type
  const isImage = file.type === 'image';
  const isPdf = file.type === 'pdf';
  const isDocx = file.type === 'doc';

  return (
    <div className="file-preview-overlay">
      <div className="file-preview-content">
        <button onClick={onClose} className="close-preview">✖</button>

        {isImage && fileUrl && (
          <img src={fileUrl} alt={file.fileName} className="preview-image" />
        )}

        {isPdf && (
          <iframe
            src={`https://localhost:44332/api/files/download/${file.mongoFileId}`}
            title={file.fileName}
            className="preview-pdf"
          />
        )}

        {isDocx && fileUrl && (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`}
            title={file.fileName}
            className="preview-docx"
          />
        )}

        {!fileUrl && <p>Loading preview...</p>}

        <h3 className="preview-filename">{file.fileName}</h3>
      </div>
    </div>
  );
};

export default FilePreview;
