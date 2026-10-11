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
    similar_precedents,
    score_breakdown,
    shap_values,
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

            {/* Score breakdown */}
      {score_breakdown && (
        <>
          <div className="section-title">📊 Score Breakdown</div>
          <div className="breakdown-list">
            {score_breakdown.components.map((c, i) => (
              <div key={i} className="breakdown-row">
                <div className="breakdown-label">
                  {c.factor} <span className="breakdown-count">({c.count})</span>
                </div>
                <div className="breakdown-bar">
                  <div
                    className="breakdown-fill"
                    style={{ width: `${(c.points / c.max) * 100}%` }}
                  />
                </div>
                <div className="breakdown-points">{c.points} / {c.max}</div>
              </div>
            ))}
            <div className="breakdown-note">
              Factor total: {score_breakdown.base_total}. Final score: {score_breakdown.final_score}.
            </div>
            {score_breakdown.high_risk_floor && (
              <div className="breakdown-note">
                High-risk override: {score_breakdown.high_risk_flags} high-risk flag(s) set the
                minimum score to {score_breakdown.high_risk_floor}.
              </div>
            )}
          </div>
        </>
      )}
            {/* SHAP explanation */}
      {shap_values && shap_values.contributions && (
        <>
          <div className="section-title">🔍 SHAP Explanation</div>
          <div className="shap-list">
            <div className="breakdown-note">
              Base value: {shap_values.base_value}. Each bar shows how much a factor moved
              the score away from the base value.
            </div>
            {shap_values.contributions.map((c, i) => {
              const maxAbs = Math.max(
                ...shap_values.contributions.map((x) => Math.abs(x.shap)),
                0.01
              );
              return (
                <div key={i} className="shap-row">
                  <div className="breakdown-label">
                    {c.feature} <span className="breakdown-count">({c.value})</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className={`shap-fill ${c.shap >= 0 ? 'shap-pos' : 'shap-neg'}`}
                      style={{ width: `${(Math.abs(c.shap) / maxAbs) * 100}%` }}
                    />
                  </div>
                  <div className="breakdown-points">
                    {c.shap >= 0 ? '+' : ''}{c.shap}
                  </div>
                </div>
              );
            })}
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
      
      {/* Similar Precedents */}
      {similar_precedents && similar_precedents.length > 0 && (
        <>
          <div className="section-title">⚖️ Similar Precedents</div>
          <div className="precedents-list">
            {similar_precedents.map((p, i) => (
              <div key={i} className="precedent-card">
                <div className="precedent-header">
                  <span className="precedent-name">{p.case_name}</span>
                  <span className="precedent-sim">
                    {Math.round(p.similarity * 100)}% match
                  </span>
                </div>
                <div className="precedent-meta">
                  {p.court} · {p.year} · {p.citation}
                </div>
                <div className="precedent-summary">{p.summary}</div>
              </div>
            ))}
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