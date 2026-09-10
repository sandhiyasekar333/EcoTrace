import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const createStubPage = (pageName) => {
  const Component = () => {
    const navigate = useNavigate();
    return (
      <div className="stub-page">
        <div className="stub-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1>{pageName}</h1>
        </div>
        <div className="stub-content">
          <p>Page component: {pageName}</p>
        </div>
      </div>
    );
  };
  Component.displayName = pageName;
  return Component;
};

export default createStubPage;
