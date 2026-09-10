import { useState } from "react";
import { ArrowRight, Leaf, ShieldCheck, Smartphone, Recycle } from "lucide-react";
import { getTranslation } from "../data/translations";
import ErrorState from "../components/ErrorState";
import "./WelcomePage.css";

const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const mobilePattern = /^\d{10}$/;

export default function WelcomePage({ onLogin, language, onLanguageChange }) {
  const t = getTranslation(language);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", location: "", language });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  };

  const changeLanguage = (nextLanguage) => {
    onLanguageChange(nextLanguage);
    setFormData((current) => ({ ...current, language: nextLanguage }));
  };

  const validate = () => {
    const nextErrors = {};
    if (formData.name.trim().length < 3) nextErrors.name = "Please enter a valid name.";
    if (!emailPattern.test(formData.email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (!mobilePattern.test(formData.mobile.trim())) nextErrors.mobile = "Please enter a valid 10-digit mobile number.";
    if (!formData.location.trim()) nextErrors.location = "Please enter your location.";
    if (!formData.language) nextErrors.language = "Please select a preferred language.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      onLogin({ ...formData, name: formData.name.trim(), email: formData.email.trim().toLowerCase(), location: formData.location.trim() });
    } catch (error) {
      console.error("EcoTrace login failed", error);
      setSubmitError("We could not process your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="welcome-page">
      <section className="welcome-visual">
        <div className="brand-lockup"><span className="brand-mark"><Leaf size={28} /></span><span>EcoTrace</span></div>
        <div className="visual-copy"><p className="eyebrow light-eyebrow">Collector-first recovery</p><h1>Turn E-Waste Into Fair Value</h1><p>Connect with trusted recyclers, understand your e-waste value and track every collection.</p></div>
        <div className="visual-points"><span><Recycle size={18} /> Recover more value</span><span><ShieldCheck size={18} /> Transparent records</span><span><Smartphone size={18} /> Built for the field</span></div>
      </section>
      <section className="welcome-panel">
        <div className="welcome-panel-head"><p className="eyebrow">Welcome to EcoTrace</p><h2>Start your collector profile</h2><p>Use your details to begin a clear, traceable e-waste journey.</p></div>
        <div className="language-selector" aria-label={t.preferredLanguage}><span className="language-label">{t.preferredLanguage}</span><button type="button" className="lang-btn active" onClick={() => changeLanguage("en")}>{t.english}</button></div>
        {submitError && <ErrorState message={submitError} onRetry={() => setSubmitError("")} />}
        <form onSubmit={handleSubmit} className="welcome-form" noValidate>
          <div className="form-group"><label htmlFor="name">Username / Collector Name</label><input id="name" name="name" type="text" value={formData.name} onChange={updateField} placeholder="e.g. Kumar" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />{errors.name && <span id="name-error" className="error-text" role="alert">⚠ {errors.name}</span>}</div>
          <div className="form-group"><label htmlFor="email">Email Address</label><input id="email" name="email" type="email" value={formData.email} onChange={updateField} placeholder="kumar@gmail.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />{errors.email && <span id="email-error" className="error-text" role="alert">⚠ {errors.email}</span>}</div>
          <div className="form-row"><div className="form-group"><label htmlFor="mobile">Mobile Number</label><input id="mobile" name="mobile" type="tel" inputMode="numeric" maxLength="10" value={formData.mobile} onChange={updateField} placeholder="9876543210" aria-invalid={Boolean(errors.mobile)} />{errors.mobile && <span className="error-text" role="alert">⚠ {errors.mobile}</span>}</div><div className="form-group"><label htmlFor="location">Location</label><input id="location" name="location" type="text" value={formData.location} onChange={updateField} placeholder="Coimbatore" aria-invalid={Boolean(errors.location)} />{errors.location && <span className="error-text" role="alert">⚠ {errors.location}</span>}</div></div>
          <button type="submit" className="btn btn-primary continue-button" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Continue to EcoTrace"}<ArrowRight size={18} /></button>
        </form>
        <p className="trust-note"><ShieldCheck size={16} /> Your details are saved securely on this device for the prototype.</p>
      </section>
    </main>
  );
}
