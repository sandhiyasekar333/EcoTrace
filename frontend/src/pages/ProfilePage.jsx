import { useState } from "react";
import { ArrowLeft, Check, Leaf, LogOut, Pencil, Save, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ErrorState from "../components/ErrorState";
import "./ProfilePage.css";

const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const mobilePattern = /^\d{10}$/;

export default function ProfilePage({ collector, onLogout }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...collector, mobile: collector.mobile || collector.mobileNumber || "", language: collector.language || collector.preferredLanguage || "en" });

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
    setSavedMessage("");
  };

  const saveProfile = (event) => {
    event.preventDefault();
    if (form.name.trim().length < 3) return setError("Please enter a valid name.");
    if (!emailPattern.test(form.email.trim())) return setError("Please enter a valid email address.");
    if (!mobilePattern.test(form.mobile.trim())) return setError("Please enter a valid 10-digit mobile number.");
    if (!form.location.trim()) return setError("Please enter your location.");
    const updated = { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), location: form.location.trim() };
    localStorage.setItem("ecoTraceUser", JSON.stringify(updated));
    localStorage.setItem("collector", JSON.stringify(updated));
    setForm(updated);
    setIsEditing(false);
    setSavedMessage("Profile saved successfully.");
  };

  const logout = () => {
    localStorage.removeItem("ecoTraceUser");
    localStorage.removeItem("collector");
    onLogout();
    navigate("/", { replace: true });
  };

  return (
    <main className="profile-page">
      <header className="profile-header container"><button type="button" className="profile-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button><div><p className="eyebrow">EcoTrace account</p><h1>Collector Profile</h1></div><div className="profile-header-mark"><Leaf size={20} /></div></header>
      <div className="profile-content container">
        <section className="profile-hero"><div className="large-avatar">{(form.name || "C").slice(0, 1).toUpperCase()}</div><div><p className="eyebrow">Your profile</p><h2>{form.name}</h2><p>{form.email}</p></div><button type="button" className="btn btn-outline edit-profile-button" onClick={() => { setIsEditing(true); setSavedMessage(""); }}><Pencil size={16} /> Edit Profile</button></section>
        {savedMessage && <div className="profile-success" role="status"><Check size={17} /> {savedMessage}</div>}
        {error && <ErrorState title="Unable to save profile" message={error} onRetry={() => setError("")} />}
        <form className="profile-card" onSubmit={saveProfile}>
          <div className="profile-card-heading"><div><p className="eyebrow">Personal details</p><h2>{isEditing ? "Edit your information" : "Your information"}</h2></div><ShieldCheck size={22} /></div>
          <div className="profile-fields"><div className="form-group"><label htmlFor="profile-name">Name</label><input id="profile-name" name="name" value={form.name} onChange={updateField} disabled={!isEditing} /></div><div className="form-group"><label htmlFor="profile-email">Email</label><input id="profile-email" name="email" type="email" value={form.email} onChange={updateField} disabled={!isEditing} /></div><div className="form-group"><label htmlFor="profile-mobile">Mobile</label><input id="profile-mobile" name="mobile" value={form.mobile} onChange={updateField} disabled={!isEditing} /></div><div className="form-group"><label htmlFor="profile-location">Location</label><input id="profile-location" name="location" value={form.location} onChange={updateField} disabled={!isEditing} /></div><div className="form-group"><label htmlFor="profile-language">Preferred Language</label><select id="profile-language" name="language" value={form.language} onChange={updateField} disabled={!isEditing}><option value="en">English</option><option value="ta">தமிழ்</option></select></div></div>
          {isEditing && <div className="profile-actions"><button type="button" className="btn btn-outline" onClick={() => { setForm({ ...collector, mobile: collector.mobile || collector.mobileNumber || "", language: collector.language || collector.preferredLanguage || "en" }); setIsEditing(false); setError(""); }}>Cancel</button><button type="submit" className="btn btn-primary"><Save size={17} /> Save Changes</button></div>}
        </form>
        <section className="logout-card"><div><h3>Sign out of this device</h3><p>Your lots and evaluations will remain saved locally.</p></div><button type="button" className="btn logout-button" onClick={logout}><LogOut size={17} /> Logout</button></section>
      </div>
    </main>
  );
}
