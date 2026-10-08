import React, { useState, useRef } from 'react';

function FileUpload({ onUpload, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFileChange = (file) => {
    if (file) setSelectedFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
    onUpload(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div
        className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          style={{ display: 'none' }}
          onChange={(e) => handleFileChange(e.target.files[0])}
          disabled={loading}
        />
        {selectedFile ? (
          <p className="file-name">📄 {selectedFile.name}</p>
        ) : (
          <>
            <p>📤 Click or drag a file here</p>
            <p className="upload-hint">Supports PDF, image (PNG/JPG), or plain text files</p>
          </>
        )}
      </div>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading || !selectedFile}
        style={{ alignSelf: 'flex-end' }}
      >
        {loading ? 'Analysing…' : 'Analyze Document'}
      </button>
    </form>
  );
}

export default FileUpload;