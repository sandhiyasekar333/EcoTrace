import { useEffect, useState } from "react";
import { ArrowLeft, Battery, Box, Check, Cpu, ImagePlus, Laptop, Monitor, Package, Printer, Smartphone, Tv, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTranslation } from "../data/translations";
import { speak } from "../utils/speech";
import { apiService } from "../services/api";
import "./AddEWastePage.css";

const categories = [
  { value: "Mobile", label: "Mobile", icon: Smartphone },
  { value: "Laptop", label: "Laptop", icon: Laptop },
  { value: "Television", label: "Television", icon: Tv },
  { value: "Monitor", label: "Monitor", icon: Monitor },
  { value: "Printer", label: "Printer", icon: Printer },
  { value: "Charger", label: "Charger", icon: Package },
  { value: "Battery", label: "Battery", icon: Battery },
  { value: "Computer Parts", label: "Computer Parts", icon: Cpu },
  { value: "Other", label: "Other", icon: Box },
];

const componentOptions = ["Battery", "Display", "Motherboard", "Storage", "RAM", "Charger", "Camera", "Other"];
const accessoryOptions = ["Charger", "Box", "Battery", "Cable", "Other"];
const emptyForm = {
  item_type: "", brand: "", model: "", age: "", quantity: "1", expected_price: "",
  working_condition: "Working", physical_condition: "Good", repairability: "Easy",
  reusable_components: [], accessories: [], image_analysis: null,
};

const getSavedDraft = () => {
  const savedDraft = localStorage.getItem("pendingWasteDraft");
  if (!savedDraft) return emptyForm;
  try {
    return { ...emptyForm, ...JSON.parse(savedDraft) };
  } catch {
    localStorage.removeItem("pendingWasteDraft");
    return emptyForm;
  }
};

export default function AddEWastePage({ language }) {
  const t = getTranslation(language);
  const navigate = useNavigate();
  const [form, setForm] = useState(getSavedDraft);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedMessage] = useState(() => localStorage.getItem("pendingWasteDraft") ? "Saved draft restored" : "");
  const [submitError, setSubmitError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState(() => getSavedDraft().image_analysis || null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisError, setImageAnalysisError] = useState("");
  const [conditionConfirmed, setConditionConfirmed] = useState(false);

  useEffect(() => {
    localStorage.setItem("pendingWasteDraft", JSON.stringify(form));
  }, [form]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "physical_condition" && current.image_analysis
        ? { image_analysis: { ...current.image_analysis, confirmed_condition: value, condition_source: "manual" } }
        : {}),
    }));
    if (name === "physical_condition") setConditionConfirmed(true);
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleImageSelected = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setImageAnalysisError("Please select an image file.");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
    setImageAnalysis(null);
    setConditionConfirmed(false);
    setImageAnalysisError("");
    setForm((current) => ({ ...current, image_analysis: null }));
  };

  const analyzeImage = async () => {
    if (!imageFile) {
      setImageAnalysisError("Choose or capture a device image first.");
      return;
    }
    setIsAnalyzingImage(true);
    setImageAnalysisError("");
    try {
      const result = await apiService.analyzeImage(imageFile);
      setImageAnalysis(result);
      setForm((current) => ({ ...current, image_analysis: result }));
      setConditionConfirmed(false);
    } catch (error) {
      console.error("Device image analysis failed", error);
      setImageAnalysisError(error.message);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const confirmDetectedCondition = () => {
    if (!imageAnalysis) return;
    setForm((current) => ({
      ...current,
      physical_condition: imageAnalysis.detected_condition,
      image_analysis: { ...imageAnalysis, confirmed_condition: imageAnalysis.detected_condition, condition_source: "image" },
    }));
    setConditionConfirmed(true);
  };

  const toggleOption = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value],
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.item_type) nextErrors.item_type = "Select an item category";
    if (!form.brand.trim()) nextErrors.brand = "Brand is required";
    if (form.age === "" || Number(form.age) < 0) nextErrors.age = "Enter a valid age";
    if (!form.quantity || Number(form.quantity) < 1) nextErrors.quantity = "Quantity must be at least 1";
    if (form.expected_price !== "" && Number(form.expected_price) < 0) nextErrors.expected_price = "Enter a valid price";
    return nextErrors;
  };

  const submitEvaluation = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    const payload = { ...form, age: Number(form.age), quantity: Number(form.quantity), expected_price: Number(form.expected_price || 0) };
    const clientEvaluationId = `EVAL-${Date.now()}`;
    let resultEvaluationId = clientEvaluationId;
    let evaluationSucceeded = false;
    try {
      const evaluation = await apiService.evaluateWaste(payload);
      resultEvaluationId = evaluation.evaluation_id || clientEvaluationId;
      localStorage.setItem("latestEvaluation", JSON.stringify({ id: resultEvaluationId, input: payload, ...evaluation }));
      evaluationSucceeded = true;
    } catch (error) {
      console.error("EcoValue Shield evaluation failed", error);
      setSubmitError(error.message);
    } finally {
      if (evaluationSucceeded) {
        localStorage.removeItem("pendingWasteDraft");
        navigate(`/eco-value-result/${resultEvaluationId}`);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <main className="add-waste-page">
      <header className="page-header container">
        <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button>
        <div><p className="eyebrow">EcoValue Shield</p><h1>{t.addWaste}</h1></div>
        <button type="button" className="speak-button" onClick={() => speak("Add your electronic waste details to check its fair value.", language === "ta" ? "ta-IN" : "en-IN")} title="Listen"><Volume2 size={20} /></button>
      </header>

      <form className="add-waste-form container" onSubmit={submitEvaluation}>
        <section className="form-card">
          <div className="section-heading"><div><p className="eyebrow">Step 1</p><h2>{t.selectCategory}</h2></div><span className="step-count">1 / 3</span></div>
          <div className="category-grid">
            {categories.map(({ value, label, icon: Icon }) => (
              <button type="button" key={value} className={`category-card ${form.item_type === value ? "selected" : ""}`} onClick={() => setForm((current) => ({ ...current, item_type: value }))}>
                <Icon size={28} /><span>{label}</span>{form.item_type === value && <Check size={16} className="selected-check" />}
              </button>
            ))}
          </div>
          {errors.item_type && <p className="error-text">{errors.item_type}</p>}
        </section>

        <section className="form-card image-assessment-card">
          <div className="section-heading"><div><p className="eyebrow">Optional visual check</p><h2>Assess physical condition from an image</h2><p className="section-help">Use a clear photo of the device. You can always keep or manually change the condition.</p></div><ImagePlus size={25} className="section-icon" /></div>
          <label className="upload-zone" htmlFor="device-image">
            <ImagePlus size={28} />
            <span><strong>Choose image or use camera</strong><small>JPEG, PNG, WEBP, or GIF</small></span>
            <input id="device-image" type="file" accept="image/*" capture="environment" onChange={handleImageSelected} />
          </label>
          {imagePreview && <div className="image-preview-wrap"><img src={imagePreview} alt="Selected e-waste device" /><div className="image-file-name">{imageFile?.name}</div></div>}
          <button type="button" className="btn btn-outline analyze-image-button" onClick={analyzeImage} disabled={!imageFile || isAnalyzingImage}>{isAnalyzingImage ? "Analyzing device..." : "Analyze Device Condition"}</button>
          {imageAnalysisError && <p className="error-text image-error">{imageAnalysisError}</p>}
          {imageAnalysis && <div className="analysis-result-card"><div className="analysis-result-heading"><div><p className="eyebrow">Prototype image assessment</p><h3>Detected condition: {imageAnalysis.detected_condition}</h3></div><span className="confidence-badge">{Math.round(Number(imageAnalysis.confidence) * 100)}% confidence</span></div><div className="analysis-score"><span>Condition score</span><strong>{imageAnalysis.condition_score}/100</strong><div className="analysis-score-track"><span style={{ width: `${imageAnalysis.condition_score}%` }} /></div></div><ul>{imageAnalysis.detected_issues.map((issue) => <li key={issue}>{issue}</li>)}</ul><div className="analysis-actions"><button type="button" className="btn btn-primary" onClick={confirmDetectedCondition} disabled={conditionConfirmed}>{conditionConfirmed ? "Condition Confirmed" : "Confirm Detected Condition"}</button><span>{conditionConfirmed ? "This condition will be used for EcoValue Shield." : "Or manually choose a condition below."}</span></div></div>}
        </section>

        <section className="form-card">
          <div className="section-heading"><div><p className="eyebrow">Step 2</p><h2>Item details</h2></div><span className="step-count">2 / 3</span></div>
          <div className="field-grid">
            <div className="form-group"><label htmlFor="brand">{t.brand}</label><input id="brand" name="brand" value={form.brand} onChange={updateField} placeholder="e.g. Dell" />{errors.brand && <p className="error-text">{errors.brand}</p>}</div>
            <div className="form-group"><label htmlFor="model">{t.model}</label><input id="model" name="model" value={form.model} onChange={updateField} placeholder="e.g. Inspiron 15" /></div>
            <div className="form-group"><label htmlFor="age">{t.approximateAge}</label><input id="age" name="age" type="number" min="0" max="100" value={form.age} onChange={updateField} placeholder="3" />{errors.age && <p className="error-text">{errors.age}</p>}</div>
            <div className="form-group"><label htmlFor="quantity">{t.quantity}</label><input id="quantity" name="quantity" type="number" min="1" value={form.quantity} onChange={updateField} />{errors.quantity && <p className="error-text">{errors.quantity}</p>}</div>
            <div className="form-group"><label htmlFor="expected_price">{t.expectedPrice}</label><input id="expected_price" name="expected_price" type="number" min="0" value={form.expected_price} onChange={updateField} placeholder="8500" />{errors.expected_price && <p className="error-text">{errors.expected_price}</p>}</div>
          </div>
        </section>

        <section className="form-card">
          <div className="section-heading"><div><p className="eyebrow">Step 3</p><h2>Condition and recovery potential</h2></div><span className="step-count">3 / 3</span></div>
          <div className="field-grid">
            <div className="form-group"><label htmlFor="working_condition">{t.workingCondition}</label><select id="working_condition" name="working_condition" value={form.working_condition} onChange={updateField}><option>Working</option><option>Partially Working</option><option>Not Working</option></select></div>
            <div className="form-group"><label htmlFor="physical_condition">{t.physicalCondition}</label><select id="physical_condition" name="physical_condition" value={form.physical_condition} onChange={updateField}><option>Good</option><option>Moderate</option><option>Damaged</option></select></div>
            <div className="form-group"><label htmlFor="repairability">{t.repairability}</label><select id="repairability" name="repairability" value={form.repairability} onChange={updateField}><option>Easy</option><option>Moderate</option><option>Difficult</option></select></div>
          </div>
          <fieldset><legend>{t.reusableComponents}</legend><div className="option-grid">{componentOptions.map((option) => <label className="check-option" key={option}><input type="checkbox" checked={form.reusable_components.includes(option)} onChange={() => toggleOption("reusable_components", option)} /><span>{option}</span></label>)}</div></fieldset>
          <fieldset><legend>{t.accessories}</legend><div className="option-grid">{accessoryOptions.map((option) => <label className="check-option" key={option}><input type="checkbox" checked={form.accessories.includes(option)} onChange={() => toggleOption("accessories", option)} /><span>{option}</span></label>)}</div></fieldset>
        </section>

        <div className="form-actions"><span className={`draft-message ${submitError ? "submit-error" : ""}`}>{submitError || savedMessage || "Your unfinished form is saved on this device."}</span><button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Evaluating..." : t.evaluateButton}</button></div>
      </form>
    </main>
  );
}
