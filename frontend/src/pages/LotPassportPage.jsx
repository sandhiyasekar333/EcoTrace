import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  PackageCheck,
  QrCode,
  Recycle,
  ShieldCheck,
} from "lucide-react";
import "./StubPage.css";

export default function LotPassportPage() {
  const navigate = useNavigate();
  const { lotId } = useParams();

  const lot = useMemo(() => {
    try {
      const savedLots = JSON.parse(localStorage.getItem("lots") || "[]");

      return (
        savedLots.find(
          (item) =>
            item.lot_id === lotId ||
            item.id === lotId
        ) || null
      );
    } catch (error) {
      console.error("Unable to load lot", error);
      return null;
    }
  }, [lotId]);

  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === "") {
      return "Not available";
    }

    const numeric = Number(value);

    if (Number.isNaN(numeric)) {
      return value;
    }

    return `₹${numeric.toLocaleString("en-IN")}`;
  };

  if (!lot) {
    return (
      <main className="stub-page">
        <div className="stub-header">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-back"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <h1>Digital Lot Passport</h1>
        </div>

        <div className="stub-content">
          <div className="passport-warning">
            <h2>Lot not found</h2>
            <p>
              This lot could not be found on this device.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/add-waste")}
            >
              Add New E-Waste
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="stub-page">
      <div className="stub-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-back"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div>
          <p className="eyebrow">EcoTrace</p>
          <h1>Digital Lot Passport</h1>
        </div>
      </div>

      <div className="stub-content">
        <section className="passport-card">

          <div className="passport-top">
            <div>
              <p className="eyebrow">
                Digital E-Waste Record
              </p>

              <h2>{lot.lot_id}</h2>

              <p>
                Traceable digital record for this e-waste collection.
              </p>
            </div>

            <div className="passport-qr">
              <QrCode size={72} />
              <span>{lot.lot_id}</span>
            </div>
          </div>

          <div className="passport-status">
            <CheckCircle2 size={20} />
            <span>
              {lot.current_status || "Offer Accepted"}
            </span>
          </div>

          <div className="passport-grid">

            <article className="passport-info-card">
              <PackageCheck size={25} />

              <div>
                <span>Device</span>
                <strong>{lot.item_type}</strong>

                <small>
                  {lot.brand}
                  {lot.model ? ` · ${lot.model}` : ""}
                </small>
              </div>
            </article>

            <article className="passport-info-card">
              <ShieldCheck size={25} />

              <div>
                <span>Physical Condition</span>

                <strong>
                  {lot.physical_condition || "Not available"}
                </strong>

                <small>
                  Working condition:{" "}
                  {lot.working_condition || "Not available"}
                </small>
              </div>
            </article>

            <article className="passport-info-card">
              <Recycle size={25} />

              <div>
                <span>Recommended Recovery Route</span>

                <strong>
                  {lot.recommended_route || "Not available"}
                </strong>

                <small>
                  Recommended by EcoValue Shield
                </small>
              </div>
            </article>

            <article className="passport-info-card">
              <CircleDollarSign size={25} />

              <div>
                <span>Estimated Fair Value</span>

                <strong>
                  {formatCurrency(
                    lot.estimated_fair_value
                  )}
                </strong>

                <small>
                  {formatCurrency(lot.estimated_min_value)}
                  {" – "}
                  {formatCurrency(lot.estimated_max_value)}
                </small>
              </div>
            </article>

          </div>

          <section className="passport-section">
            <h3>EcoValue Shield Scores</h3>

            <div className="passport-row">
              <span>Reuse / Refurbishment</span>
              <strong>
                {lot.reuse_score ?? 0}%
              </strong>
            </div>

            <div className="passport-row">
              <span>Parts Recovery</span>
              <strong>
                {lot.parts_score ?? 0}%
              </strong>
            </div>

            <div className="passport-row">
              <span>Material Recycling</span>
              <strong>
                {lot.recycle_score ?? 0}%
              </strong>
            </div>
          </section>

          <section className="passport-section">
            <h3>Selected Recycler</h3>

            <div className="passport-row">
              <span>Recycler</span>

              <strong>
                {lot.accepted_recycler}
              </strong>
            </div>

            <div className="passport-row">
              <span>Location</span>

              <strong className="inline-detail">
                <MapPin size={16} />
                {lot.recycler_location}
              </strong>
            </div>

            <div className="passport-row">
              <span>Accepted Offer</span>

              <strong>
                {formatCurrency(lot.final_offer)}
              </strong>
            </div>
          </section>

          <section className="passport-section">
            <h3>Collection Details</h3>

            <div className="passport-row">
              <span>Collector</span>

              <strong>
                {lot.collector_name}
              </strong>
            </div>

            <div className="passport-row">
              <span>Quantity</span>

              <strong>
                {lot.quantity || 1}
              </strong>
            </div>

            <div className="passport-row">
              <span>Created</span>

              <strong>
                {lot.date_created
                  ? new Date(
                      lot.date_created
                    ).toLocaleString("en-IN")
                  : "Not available"}
              </strong>
            </div>
          </section>

          <section className="passport-section">
            <h3>Traceability Progress</h3>

            <div className="traceability-list">

              <div className="traceability-step completed">
                <CheckCircle2 size={18} />
                <span>E-Waste Registered</span>
              </div>

              <div className="traceability-step completed">
                <CheckCircle2 size={18} />
                <span>
                  EcoValue Assessment Completed
                </span>
              </div>

              <div className="traceability-step completed">
                <CheckCircle2 size={18} />
                <span>
                  Authorized Recycler Matched
                </span>
              </div>

              <div className="traceability-step completed">
                <CheckCircle2 size={18} />
                <span>Offer Accepted</span>
              </div>

              <div className="traceability-step">
                <span className="step-dot" />
                <span>Pickup / Handover Pending</span>
              </div>

              <div className="traceability-step">
                <span className="step-dot" />
                <span>Payment Pending</span>
              </div>

              <div className="traceability-step">
                <span className="step-dot" />
                <span>Recovery Completion Pending</span>
              </div>

            </div>
          </section>

          <div className="passport-actions">

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/my-lots")}
            >
              View My Lots
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => window.print()}
            >
              Print Passport
            </button>

          </div>

        </section>
      </div>
    </main>
  );
}