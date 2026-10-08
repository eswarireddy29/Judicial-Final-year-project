import React from 'react';

// Convert **bold** markdown to real <strong> tags, and preserve paragraph breaks
function renderReasoning(text) {
  if (!text) return null;
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, i) => {
    const withBold = para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={j}>{chunk.slice(2, -2)}</strong>;
      }
      return chunk;
    });
    return <p key={i}>{withBold}</p>;
  });
}

function Dashboard({ result, onReset }) {
  if (!result) return null;

  const {
    complexity_score,
    risk_level,
    witness_count,
    citation_count,
    statutory_depth,
    accused_count,
    hearing_count,
    estimated_timeline,
    reasoning,
    ipc_to_bns_mapping,
  } = result;

  return (
    <div className="dashboard-card">
      {/* Score header */}
      <div className="dashboard-header">
        <div>
          <div className="score-label">Complexity Score</div>
          <div className="score-value">
            {complexity_score}<span>/100</span>
          </div>
          <span className={`risk-pill risk-${risk_level}`}>{risk_level.toUpperCase()} RISK</span>
        </div>
        <button onClick={onReset} className="btn-secondary">
          ← Analyze Another Case
        </button>
      </div>

      {/* Metrics grid */}
      <div className="metrics-grid">
        <Metric label="Witnesses" value={witness_count} />
        <Metric label="Citations" value={citation_count} />
        <Metric label="Constitutional Provisions" value={statutory_depth} />
        <Metric label="Accused / Parties" value={accused_count} />
        <Metric label="Hearings Referenced" value={hearing_count} />
        <Metric label="Est. Timeline" value={estimated_timeline} />
      </div>

      {/* IPC → BNS mapping */}
      {ipc_to_bns_mapping && Object.keys(ipc_to_bns_mapping).length > 0 && (
        <>
          <div className="section-title">📜 IPC → BNS Section Mapping</div>
          <div className="bns-tags">
            {Object.entries(ipc_to_bns_mapping).map(([k, v]) => (
              <span key={k} className="bns-tag">{k} → {v}</span>
            ))}
          </div>
        </>
      )}

      {/* Reasoning */}
      {reasoning && (
        <>
          <div className="section-title">🧠 Judicial Risk Audit</div>
          <div className="reasoning-box">
            {renderReasoning(reasoning)}
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-box">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

export default Dashboard;