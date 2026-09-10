import { useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Leaf, Volume2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getTranslation } from "../data/translations";
import { speak } from "../utils/speech";
import "./EcoValueResultPage.css";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const scoreCards = [
  { key: "reuse_score", label: "Reuse / Refurbishment", className: "reuse" },
  { key: "parts_score", label: "Parts Recovery", className: "parts" },
  { key: "recycle_score", label: "Material Recycling", className: "recycle" },
];

export default function EcoValueResultPage({ language }) {
  const t = getTranslation(language);
  const navigate = useNavigate();
  const { evaluationId } = useParams();
  const [evaluation] = useState(() => {
    const saved = localStorage.getItem("latestEvaluation");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed.id === evaluationId || parsed.evaluation_id === evaluationId ? parsed : null;
    } catch {
      localStorage.removeItem("latestEvaluation");
      return null;
    }
  });

  if (!evaluation) {
    return (
      <main className="result-page">
        <div className="result-empty container">
          <CircleAlert size={40} />
          <h1>Evaluation not found</h1>
          <p>This evaluation is no longer available on this device.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/add-waste")}>Evaluate another item</button>
        </div>
      </main>
    );
  }

  if (evaluation.status === "server_unavailable") {
    return (
      <main className="result-page">
        <div className="result-empty container">
          <CircleAlert size={40} />
          <h1>EcoTrace server unavailable</h1>
          <p>Your form was saved locally, but the EcoValue Shield could not complete its evaluation. Start the FastAPI server and submit the item again.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/add-waste")}>Try evaluation again</button>
        </div>
      </main>
    );
  }

  const item = evaluation.item || evaluation.input || {};
  const reasons = Array.isArray(evaluation.reasoning) ? evaluation.reasoning : [];
  const minimum = evaluation.estimated_min_value;
  const maximum = evaluation.estimated_max_value;

  return (
    <main className="result-page">
      <header className="result-header container">
        <button type="button" className="result-icon-button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button>
        <div><p className="eyebrow">EcoValue Shield</p><h1>{t.ecoValueShield}</h1></div>
        <button type="button" className="result-icon-button" onClick={() => speak(`EcoValue Shield recommends ${evaluation.recommended_route}. Estimated fair value is ${formatCurrency(minimum)} to ${formatCurrency(maximum)}.`, language === "ta" ? "ta-IN" : "en-IN")} title="Listen"><Volume2 size={20} /></button>
      </header>

      <div className="result-content container">
        <section className="item-summary result-card">
          <div className="item-mark"><Leaf size={24} /></div>
          <div className="item-summary-copy"><p className="eyebrow">Evaluated item</p><h2>{item.item_type || "E-waste item"}</h2><p>{item.brand}{item.model ? ` · ${item.model}` : ""}</p></div>
          <span className="evaluation-id">{evaluation.evaluation_id || evaluation.id}</span>
        </section>

        <section className="result-card">
          <div className="section-heading"><div><p className="eyebrow">Transparent scoring</p><h2>{t.ecoValueShield}</h2></div><span className="score-range">0–100</span></div>
          <div className="score-grid">
            {scoreCards.map(({ key, label, className }) => {
              const score = Math.max(0, Math.min(100, Number(evaluation[key] || 0)));
              return <article className={`score-card ${className}`} key={key}><div className="score-card-top"><span>{label}</span><strong>{score}%</strong></div><div className="score-track" aria-label={`${label}: ${score}%`}><span style={{ width: `${score}%` }} /></div></article>;
            })}
          </div>
        </section>

        <section className="route-highlight">
          <p className="eyebrow">{t.bestValueRoute}</p>
          <h2>{evaluation.recommended_route}</h2>
          <p>EcoTrace compares usefulness, repairability, reusable parts, and material recovery potential.</p>
        </section>

        <section className="result-card value-card">
          <div><p className="eyebrow">{t.estimatedFairValue}</p><h2>{formatCurrency(minimum)} <span>–</span> {formatCurrency(maximum)}</h2><p className="value-note">Prototype estimate based on item type, condition, age, and quantity.</p></div>
          <div className="value-pill">Fair range</div>
        </section>

        <section className="result-card details-card">
          <div className="section-heading"><div><p className="eyebrow">Item profile</p><h2>What we evaluated</h2></div></div>
          <dl className="details-grid">
            <div><dt>Item type</dt><dd>{item.item_type}</dd></div>
            <div><dt>Brand</dt><dd>{item.brand}</dd></div>
            <div><dt>Age</dt><dd>{item.age} years</dd></div>
            <div><dt>Working condition</dt><dd>{item.working_condition}</dd></div>
            <div><dt>Physical condition</dt><dd>{item.physical_condition}</dd></div>
            <div><dt>Repairability</dt><dd>{item.repairability}</dd></div>
          </dl>
        </section>

        <section className="result-card reasons-card">
          <div className="section-heading"><div><p className="eyebrow">Decision context</p><h2>Why EcoTrace recommends this</h2></div><CheckCircle2 size={24} /></div>
          <ul>{reasons.map((reason) => <li key={reason}><CheckCircle2 size={18} /> <span>{reason}</span></li>)}</ul>
          {evaluation.risk_or_notes && <p className="risk-note"><strong>Note:</strong> {evaluation.risk_or_notes}</p>}
        </section>

        <button type="button" className="btn btn-primary recycler-button" onClick={() => navigate(`/recycler-matching/${evaluationId}`)}>Find Authorized Recyclers</button>
      </div>
    </main>
  );
}
