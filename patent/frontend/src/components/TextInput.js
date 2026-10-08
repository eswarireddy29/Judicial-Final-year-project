import React, { useState } from 'react';

function TextInput({ onAnalyze, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim().length < 60) {
      alert('Please enter at least 60 characters describing the case.');
      return;
    }
    onAnalyze(text);
  };

  return (
    <form onSubmit={handleSubmit} className="card text-input-form" style={{ padding: '24px' }}>
      <textarea
        className="text-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the case summary, FIR text, or legal document content here (minimum 60 characters)..."
        rows={10}
        disabled={loading}
      />
      <div className="form-footer">
        <span className="char-count">{text.length} characters</span>
        <button type="submit" className="btn-primary" disabled={loading || text.trim().length < 60}>
          {loading ? 'Analysing…' : 'Analyze Case'}
        </button>
      </div>
    </form>
  );
}

export default TextInput;