import React from 'react';

export const FileUpload = (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    fetch("http://localhost:5000/api/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log("File uploaded:", data);
    });

  
  const uploadFile = () => (
    <input type="file" onChange={(e) => uploadFile(e.target.files[0])} />
  );
};

