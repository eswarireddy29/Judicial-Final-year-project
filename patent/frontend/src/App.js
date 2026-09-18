import React, { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import TextInput from './components/TextInput';
import Dashboard from './components/Dashboard';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('text');

  const analyzeText = async (text) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const response = await axios.post(`${API_URL}/analyze`, { text });
      setAnalysisResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to the analysis server. Please ensure the backend is running on port 8000.');
      } else {
        setError(typeof detail === 'string' ? detail : `Analysis failed (${err.response?.status || 'unknown error'}). Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async (file) => {
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_URL}/analyze-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to the analysis server. Please ensure the backend is running on port 8000.');
      } else {
        setError(typeof detail === 'string' ? detail : 'Document analysis failed. Ensure the file is a valid PDF, image, or plain text file.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="header-icon">⚖️</div>
            <div className="header-text">
              <h1>Judicial Complexity &amp; Litigation Risk Engine</h1>
              <p>Real-Time AI-Powered Analysis for Indian Courts</p>
            </div>
          </div>
          <div className="header-badges">
            <span className="badge badge-gold">XGBoost Engine</span>
            <span className="badge badge-blue">InLegalBERT RAG</span>
            <span className="badge badge-green">Hinglish Ready</span>
          </div>
        </div>
      </header>

      <main className="container">
        {/* ── Hero note ── */}
        <div className="hero-note">
          <div className="hero-note-icon">🏛️</div>
          <div>
            <strong>How it works:</strong> Paste any legal case summary, FIR text, or upload a document. The AI engine extracts witnesses, citations, and statutory provisions — then scores the case complexity from 0 to 100.
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => { setActiveTab('text'); setError(null); }}
          >
            📝 Paste Text
          </button>
          <button
            className={`tab ${activeTab === 'document' ? 'active' : ''}`}
            onClick={() => { setActiveTab('document'); setError(null); }}
          >
            📄 Upload Document
          </button>
        </div>

        {/* ── Input Section ── */}
        <div className="input-section">
          {activeTab === 'text' ? (
            <TextInput onAnalyze={analyzeText} loading={loading} />
          ) : (
            <FileUpload onUpload={analyzeDocument} loading={loading} />
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="error-banner" role="alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>Analysis Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="spinner-ring" aria-hidden="true"></div>
            <p>Analysing case complexity…</p>
            <div className="loading-steps">
              <span className="loading-step">🔍 Extracting features</span>
              <span className="loading-step">⚡ Computing score</span>
              <span className="loading-step">📜 Generating audit</span>
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {analysisResult && !loading && (
          <div className="animate-in">
            <Dashboard result={analysisResult} onReset={() => setAnalysisResult(null)} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          <span className="footer-brand">⚖️ Judicial Complexity &amp; Litigation Risk Engine</span>
        </p>
        <p className="footer-dev">
          Developed by <span className="footer-name">Karimireddy Geethika Varshini</span>
        </p>
        <p className="footer-sub">
          AI-powered analysis for Indian courts &nbsp;·&nbsp; For decision-support only &nbsp;·&nbsp; Not a substitute for legal advice
        </p>
      </footer>
    </div>
  );
}

export default App;
