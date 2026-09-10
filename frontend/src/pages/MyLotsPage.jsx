import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  PackageCheck,
  IndianRupee,
  ArrowRight,
  Recycle,
} from "lucide-react";
import "./MyLotsPage.css";

export default function MyLotsPage() {
  const navigate = useNavigate();

  const lots = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("lots") || "[]");
    } catch {
      return [];
    }
  }, []);

  return (
    <main className="my-lots-page">
      <header className="my-lots-header">
        <button
          type="button"
          className="lots-back-button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div>
          <p className="lots-eyebrow">EcoTrace</p>
          <h1>My E-Waste Lots</h1>
          <p className="lots-subtitle">
            Track your accepted e-waste collections and recovery progress.
          </p>
        </div>
      </header>

      <section className="lots-container">
        {lots.length === 0 ? (
          <div className="lots-empty">
            <PackageCheck size={48} />
            <h2>No lots available</h2>
            <p>
              Your accepted e-waste collections will appear here.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/add-waste")}
            >
              Add E-Waste
            </button>
          </div>
        ) : (
          <>
            <div className="lots-summary">
              <div>
                <span>Total Lots</span>
                <strong>{lots.length}</strong>
              </div>

              <div>
                <span>Accepted Lots</span>
                <strong>
                  {
                    lots.filter(
                      (lot) =>
                        lot.current_status === "Offer Accepted"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="lots-grid">
              {lots.map((lot) => (
                <article className="lot-card" key={lot.lot_id}>
                  <div className="lot-card-top">
                    <div>
                      <span className="lot-label">LOT ID</span>
                      <h2>{lot.lot_id}</h2>
                    </div>

                    <span className="status-badge">
                      {lot.current_status || "Offer Accepted"}
                    </span>
                  </div>

                  <div className="device-row">
                    <div className="device-icon">
                      <Recycle size={24} />
                    </div>

                    <div>
                      <span className="detail-label">Device</span>
                      <strong>
                        {lot.item_type || "E-Waste Item"}
                        {lot.brand ? ` · ${lot.brand}` : ""}
                      </strong>

                      {lot.model && (
                        <small>{lot.model}</small>
                      )}
                    </div>
                  </div>

                  <div className="lot-details">
                    <div className="detail-item">
                      <MapPin size={18} />
                      <div>
                        <span>Recycler</span>
                        <strong>
                          {lot.accepted_recycler ||
                            "Not selected"}
                        </strong>
                        <small>
                          {lot.recycler_location ||
                            "Location unavailable"}
                        </small>
                      </div>
                    </div>

                    <div className="detail-item">
                      <IndianRupee size={18} />
                      <div>
                        <span>Accepted Offer</span>
                        <strong>
                          ₹
                          {Number(
                            lot.final_offer || 0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <div className="detail-item">
                      <PackageCheck size={18} />
                      <div>
                        <span>Recovery Route</span>
                        <strong>
                          {lot.recommended_route ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="view-passport-button"
                    onClick={() =>
                      navigate(
                        `/lot-passport/${lot.lot_id}`
                      )
                    }
                  >
                    View Digital Passport
                    <ArrowRight size={18} />
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}