import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./StubPage.css";

export default function RecyclerOffersPage() {
  const navigate = useNavigate();

  return (
    <div className="stub-page">
      <div className="stub-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>Recycler Offers</h1>
      </div>
      <div className="stub-content">
        <p>Recycler Offers Page - Coming Soon</p>
      </div>
    </div>
  );
}
