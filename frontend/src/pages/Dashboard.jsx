import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Plus, Users, Archive, User, ArrowUpRight, Leaf } from "lucide-react";
import { getTranslation } from "../data/translations";
import { apiService } from "../services/api";
import "./Dashboard.css";

export default function Dashboard({
  collector,
  language,
  onLanguageChange,
}) {
  const t = getTranslation(language);
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const stats = {
    totalEarnings: lots.reduce((total, lot) => total + Number(lot.final_offer || 0), 0),
    itemsCollected: lots.reduce((total, lot) => total + Number(lot.quantity || 1), 0),
    successfullyRecovered: lots.filter((lot) => ["Payment Completed", "Recovery Completed", "Handover Completed"].includes(lot.current_status)).length,
    pendingLots: lots.filter((lot) => !["Payment Completed", "Recovery Completed"].includes(lot.current_status)).length,
  };

  // Try to load lots from backend or localStorage
  useEffect(() => {
    const loadLots = async () => {
      try {
        if (navigator.onLine) {
          const response = await apiService.getLots();
          setLots(response);
        } else {
          const savedLots = localStorage.getItem("lots");
          if (savedLots) {
            setLots(JSON.parse(savedLots));
          }
        }
      } catch {
        // Load from localStorage on error
        const savedLots = localStorage.getItem("lots");
        if (savedLots) {
          setLots(JSON.parse(savedLots));
        }
      }
    };
    loadLots();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const recentLots = lots.slice(0, 3);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="dashboard-brand"><Leaf size={22} /><span>EcoTrace</span></div>
          <div className="dashboard-welcome"><p className="dashboard-kicker">Collector dashboard</p><h1>{t.welcomeMessage}, {collector.name}</h1><p>{collector.email}</p></div>
          <div className="header-actions">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="language-select"
            >
              <option value="en">{t.english}</option>
              <option value="ta">{t.tamil}</option>
            </select>
            <button onClick={() => navigate("/profile")} className="profile-avatar" title={t.profile} aria-label={t.profile}>
              {(collector.name || "C").slice(0, 1).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">{t.totalEarnings}</div>
            <div className="stat-value">₹{stats.totalEarnings.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t.itemsCollected}</div>
            <div className="stat-value">{stats.itemsCollected}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t.successfullyRecovered}</div>
            <div className="stat-value">{stats.successfullyRecovered}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t.pendingLots}</div>
            <div className="stat-value">{stats.pendingLots}</div>
          </div>
        </div>

        <div className="cta-section">
          <button
            onClick={() => handleNavigate("/add-waste")}
            className="btn-cta"
          >
            <Plus size={24} />
            <span><strong>{t.addEWaste}</strong><small>Check its condition, value and recovery route</small></span><ArrowUpRight size={24} />
          </button>
        </div>

        <div className="recent-section">
            <h2>{t.recentCollections}</h2>
            {recentLots.length > 0 ? <div className="lots-list">
              {recentLots.map((lot) => (
                <div
                  key={lot.id}
                  className="lot-card"
                  onClick={() => navigate(`/lot-passport/${lot.id}`)}
                >
                  <div className="lot-info">
                    <div className="lot-name">{lot.item_type}</div>
                    <div className="lot-id">{lot.lot_id}</div>
                  </div>
                  <div className="lot-value">₹{lot.estimated_max_value}</div>
                </div>
              ))}
            </div> : <div className="empty-collections"><div className="empty-icon"><Leaf size={24} /></div><h3>No collections yet</h3><p>Add your first e-waste item to get started.</p><button type="button" className="btn btn-outline" onClick={() => navigate("/add-waste")}>Add E-Waste</button></div>}
          </div>
      </div>

      <div className="bottom-nav">
        <button className="nav-btn active" title={t.home}>
          <Home size={24} />
          <span>{t.home}</span>
        </button>
        <button
          className="nav-btn"
          onClick={() => handleNavigate("/add-waste")}
          title={t.addWaste}
        >
          <Plus size={24} />
          <span>{t.addWaste}</span>
        </button>
        <button
          className="nav-btn"
          onClick={() => handleNavigate("/recycler-matching/demo")}
          title={t.recyclers}
        >
          <Users size={24} />
          <span>{t.recyclers}</span>
        </button>
        <button
          className="nav-btn"
          onClick={() => handleNavigate("/my-lots")}
          title={t.myLots}
        >
          <Archive size={24} />
          <span>{t.myLots}</span>
        </button>
        <button
          className="nav-btn"
          onClick={() => handleNavigate("/profile")}
          title={t.profile}
        >
          <User size={24} />
          <span>{t.profile}</span>
        </button>
      </div>
    </div>
  );
}
