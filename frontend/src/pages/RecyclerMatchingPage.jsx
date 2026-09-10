import { useState } from "react";
import { ArrowLeft, BadgeCheck, Bike, CheckCircle2, MapPin, PackageCheck, Star, Truck, Volume2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { speak } from "../utils/speech";
import "./RecyclerMatchingPage.css";

const demoRecyclers = [
  { name: "GreenCycle Recycling Centre", location: "Coimbatore", distance: 4.2, rating: 4.7, pickup: true, offerRate: 0.95 },
  { name: "EcoRecover Solutions", location: "Coimbatore", distance: 6.1, rating: 4.5, pickup: true, offerRate: 0.90 },
  { name: "ReTech Recycling", location: "Coimbatore", distance: 8.3, rating: 4.4, pickup: false, offerRate: 0.82 },
  { name: "Circular Electronics Recovery", location: "Coimbatore", distance: 5.4, rating: 4.6, pickup: true, offerRate: 0.65 },
  { name: "GreenLoop E-Waste Centre", location: "Coimbatore", distance: 10.2, rating: 4.2, pickup: true, offerRate: 0.88 },
  { name: "Urban E-Recovery Hub", location: "Coimbatore", distance: 3.8, rating: 4.1, pickup: false, offerRate: 0.92 },
];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getFairness = (offerRate) => {
  if (offerRate >= 0.9) return { label: "Fair Offer", className: "fair" };
  if (offerRate >= 0.75) return { label: "Acceptable Offer", className: "acceptable" };
  return { label: "Potentially Low Offer", className: "low" };
};

const createLotId = (lots) => {
  const highestNumber = lots.reduce((highest, lot) => {
    const match = String(lot.lot_id || "").match(/ECO-\d{4}-(\d{4})/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `ECO-${new Date().getFullYear()}-${String(highestNumber + 1).padStart(4, "0")}`;
};

const calculateMatchScore = ({ offerRate, distance, pickup, rating }) => {
  const offerScore = offerRate * 45;
  const distanceScore = Math.max(0, 1 - distance / 15) * 25;
  const pickupScore = pickup ? 15 : 0;
  const ratingScore = (rating / 5) * 15;
  return Math.round(offerScore + distanceScore + pickupScore + ratingScore);
};

export default function RecyclerMatchingPage() {
  const navigate = useNavigate();
  const { evaluationId } = useParams();
  const [acceptedLotId, setAcceptedLotId] = useState("");
  const [evaluation] = useState(() => {
    const saved = localStorage.getItem("latestEvaluation");
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return parsed.id === evaluationId || parsed.evaluation_id === evaluationId ? parsed : null;
    } catch {
      return null;
    }
  });

  if (!evaluation) {
    return (
      <main className="matching-page">
        <div className="matching-empty container">
          <PackageCheck size={42} />
          <h1>Evaluation not found</h1>
          <p>Return to the EcoValue Shield result and try matching recyclers again.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/add-waste")}>Evaluate an item</button>
        </div>
      </main>
    );
  }

  const item = evaluation.item || evaluation.input || {};
  const fairValue = Number(evaluation.fair_value || evaluation.estimated_fair_value || ((Number(evaluation.estimated_min_value) + Number(evaluation.estimated_max_value)) / 2));
  const offers = demoRecyclers
    .map((recycler) => {
      const offer = Math.round((fairValue * recycler.offerRate) / 50) * 50;
      return {
        ...recycler,
        offer,
        fairness: getFairness(recycler.offerRate),
        matchScore: calculateMatchScore(recycler),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const acceptOffer = (offer) => {
    const savedLots = JSON.parse(localStorage.getItem("lots") || "[]");
    const lotId = createLotId(savedLots);
    const lot = {
      id: lotId,
      lot_id: lotId,
      evaluation_id: evaluationId,
      collector_name: JSON.parse(localStorage.getItem("collector") || "{}").name || "Collector",
      item_type: item.item_type,
      brand: item.brand,
      model: item.model || "",
      quantity: item.quantity,
      working_condition: item.working_condition,
      physical_condition: item.physical_condition,
      recommended_route: evaluation.recommended_route,
      reuse_score: evaluation.reuse_score,
      parts_score: evaluation.parts_score,
      recycle_score: evaluation.recycle_score,
      estimated_fair_value: fairValue,
      estimated_min_value: evaluation.estimated_min_value,
      estimated_max_value: evaluation.estimated_max_value,
      accepted_recycler: offer.name,
      recycler_location: offer.location,
      final_offer: offer.offer,
      current_status: "Offer Accepted",
      date_created: new Date().toISOString(),
    };
    localStorage.setItem("lots", JSON.stringify([lot, ...savedLots]));
    setAcceptedLotId(lotId);
    navigate(`/lot-passport/${lotId}`);
  };

  return (
    <main className="matching-page">
      <header className="matching-header container">
        <button type="button" className="matching-icon-button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button>
        <div><p className="eyebrow">EcoTrace network</p><h1>Find Authorized Recyclers</h1></div>
        <button type="button" className="matching-icon-button" onClick={() => speak(`Choose an authorized recycler for your ${item.item_type}.`, "en-IN")} title="Listen"><Volume2 size={20} /></button>
      </header>

      <div className="matching-content container">
        <section className="matching-summary">
          <div className="summary-item"><span>Item</span><strong>{item.item_type} · {item.brand}</strong></div>
          <div className="summary-item"><span>Recommended route</span><strong>{evaluation.recommended_route}</strong></div>
          <div className="summary-item"><span>Estimated fair value</span><strong>{formatCurrency(evaluation.estimated_min_value)} – {formatCurrency(evaluation.estimated_max_value)}</strong></div>
        </section>

        <section className="matching-intro"><div><p className="eyebrow">Transparent offers</p><h2>Choose a recycler with confidence</h2><p>Offers are ranked using price, distance, pickup availability, and recycler rating.</p></div><div className="recycler-count"><strong>{offers.length}</strong><span>demo recyclers</span></div></section>

        <div className="offer-list">
          {offers.map((offer, index) => (
            <article className={`recycler-card ${index === 0 ? "best-match" : ""}`} key={offer.name}>
              {index === 0 && <div className="best-match-label"><BadgeCheck size={16} /> Best Match</div>}
              <div className="recycler-card-main">
                <div className="recycler-icon"><Truck size={24} /></div>
                <div className="recycler-name"><h3>{offer.name}</h3><p><MapPin size={14} /> {offer.location}</p></div>
                <div className="match-score"><span>Match score</span><strong>{offer.matchScore}%</strong></div>
              </div>
              <div className="offer-details">
                <div><span>Offered price</span><strong className="offer-price">{formatCurrency(offer.offer)}</strong><span className={`fairness-badge ${offer.fairness.className}`}>{offer.fairness.label}</span></div>
                <div><span>Distance</span><strong><Bike size={15} /> {offer.distance} km</strong></div>
                <div><span>Rating</span><strong><Star size={15} fill="currentColor" /> {offer.rating}</strong></div>
                <div><span>Pickup</span><strong className={offer.pickup ? "available" : "unavailable"}>{offer.pickup ? "Available" : "Not available"}</strong></div>
              </div>
              <div className="recommendation"><CheckCircle2 size={17} /><span>{offer.pickup ? "Pickup available" : "Drop-off required"}; {offer.offerRate >= 0.9 ? "strong offer" : offer.offerRate >= 0.75 ? "acceptable value" : "compare before accepting"}; {offer.distance <= 6 ? "nearby recycler" : "serves your area"}; rated {offer.rating}/5.</span></div>
              <button type="button" className="btn btn-primary accept-button" onClick={() => acceptOffer(offer)} disabled={Boolean(acceptedLotId)}>Accept Offer</button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
