import { AlertTriangle, RefreshCw } from "lucide-react";
import "./ErrorState.css";

export default function ErrorState({ title = "Unable to Continue", message = "We could not process your information.", onRetry }) {
  return (
    <section className="error-state" role="alert">
      <div className="error-state-icon"><AlertTriangle size={24} /></div>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button type="button" className="btn btn-primary" onClick={onRetry}><RefreshCw size={17} /> Try Again</button>}
    </section>
  );
}
