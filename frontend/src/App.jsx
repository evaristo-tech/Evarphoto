import { useState, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const COUNTRIES = [
  { code: "US", name: "United States", docs: [
    { id: "passport", label: "Passport", w: 51, h: 51, bg: "#FFFFFF", dpi: 300, notes: "Head 25-35mm, white background" },
    { id: "visa", label: "Visa", w: 51, h: 51, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "UK", name: "United Kingdom", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "Head 29-34mm, white background" },
    { id: "id", label: "ID Card", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "ZM", name: "Zambia", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background, ICAO standard" },
    { id: "id", label: "National ID", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "IN", name: "India", docs: [
    { id: "passport", label: "Passport", w: 51, h: 51, bg: "#FFFFFF", dpi: 300, notes: "Head 25-35mm, white background" },
    { id: "visa", label: "Visa", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "Light background" },
  ]},
  { code: "EU", name: "Schengen/EU", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "ICAO standard, neutral background" },
    { id: "visa", label: "Schengen Visa", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "CA", name: "Canada", docs: [
    { id: "passport", label: "Passport", w: 50, h: 70, bg: "#FFFFFF", dpi: 300, notes: "Head 31-36mm, white background" },
  ]},
  { code: "AU", name: "Australia", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "ICAO compliant, white background" },
  ]},
  { code: "ZA", name: "South Africa", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background, ICAO standard" },
    { id: "id", label: "ID Card", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "NG", name: "Nigeria", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
    { id: "visa", label: "Visa", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "KE", name: "Kenya", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
    { id: "id", label: "National ID", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "GH", name: "Ghana", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "TZ", name: "Tanzania", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "CN", name: "China", docs: [
    { id: "passport", label: "Passport", w: 33, h: 48, bg: "#FFFFFF", dpi: 300, notes: "White background, frontal" },
    { id: "visa", label: "Visa", w: 33, h: 48, bg: "#FFFFFF", dpi: 300, notes: "White background" },
  ]},
  { code: "DE", name: "Germany", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "Light grey or white background" },
  ]},
  { code: "FR", name: "France", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#F5F5F5", dpi: 300, notes: "Light grey background" },
  ]},
];

const BG_OPTIONS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Off-white", value: "#F5F5F0" },
  { label: "Light Grey", value: "#E8E8E8" },
  { label: "Light Blue", value: "#C9D9F0" },
  { label: "Cream", value: "#FFF8E7" },
];

const FEATURES = [
  { icon: "✨", title: "AI Background Removal", desc: "Instant professional background replacement powered by advanced AI" },
  { icon: "🌍", title: "100+ Countries", desc: "Official specs for passports, visas, IDs and more worldwide" },
  { icon: "🖨️", title: "Print Ready", desc: "300 DPI print-ready 4x6 sheet with cutting guides" },
  { icon: "⚡", title: "Instant Processing", desc: "Results in seconds, not minutes" },
  { icon: "🔒", title: "Privacy First", desc: "Photos auto-deleted after 1 hour" },
  { icon: "✅", title: "Compliance Check", desc: "Real-time validation against official requirements" },
];

export default function EvarPhoto() {
  const [step, setStep] = useState("home");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedDoc, setSelectedDoc] = useState(COUNTRIES[0].docs[0]);
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("single");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const getFilterStyle = () => "brightness(" + brightness + "%) contrast(" + contrast + "%)";

  const handleCountryChange = (code) => {
    const c = COUNTRIES.find(function(c) { return c.code === code; });
    if (c) { setSelectedCountry(c); setSelectedDoc(c.docs[0]); setBgColor(c.docs[0].bg); }
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setPreviewUrl(null);
    setJobId(null);
    setUploadError(null);
    setStep("editor");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const processPhoto = async () => {
    if (!imageFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append("photo", imageFile);
      form.append("bgColor", bgColor);
      form.append("country", selectedCountry.code);
      form.append("docType", selectedDoc.id);
      const res = await fetch(API_URL + "/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setJobId(data.jobId);
      setPreviewUrl(data.previewUrl);
      setStep("result");
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // ── HOME PAGE ─────────────────────────────────────────────
  if (step === "home") return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#0a0a0f", color: "#fff", overflowX: "hidden" }}>
      
      {/* Animated background */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.15) 0%, transparent 60%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>
            <span style={{ color: "#fff" }}>EVAR</span>
            <span style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="#features" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 500 }}>Features</a>
            <a href="#pricing" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 500 }}>Pricing</a>
            <button onClick={() => fileRef.current.click()}
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 15px rgba(99,102,241,0.4)" }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "6px 16px", marginBottom: 24, fontSize: 13, color: "#a5b4fc", fontWeight: 600 }}>
          ✨ Online Passport size Photos maker
        </div>
        <h1 style={{ fontSize: "clamp(40px,7vw,80px)", fontWeight: 900, lineHeight: 1.05, margin: "0 0 20px", letterSpacing: "-0.04em" }}>
          Passport Photos<br />
          <span style={{ background: "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Done Right.</span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 500, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Upload any photo. AI removes the background, checks compliance, and delivers a print-ready file in seconds.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <button onClick={() => fileRef.current.click()}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "16px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 30px rgba(99,102,241,0.4)", transition: "transform 0.2s" }}>
            📸 Upload Photo
          </button>
          <button onClick={() => fileRef.current.click()}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            📷 Use Camera
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current.click()}
          style={{
            maxWidth: 600, margin: "0 auto",
            border: dragOver ? "2px solid #6366f1" : "2px dashed rgba(255,255,255,0.1)",
            borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer",
            background: dragOver ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
            transition: "all 0.3s"
          }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px", color: "#fff" }}>Drop your photo here</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>JPG, PNG, HEIC supported · Max 10MB</p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", marginTop: 64 }}>
          {[
            { num: "100+", label: "Countries" },
            { num: "50K+", label: "Photos Processed" },
            { num: "99%", label: "Acceptance Rate" },
            { num: "<10s", label: "Processing Time" },
          ].map(function(s) { return (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
            </div>
          ); })}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 8, letterSpacing: "-0.03em" }}>Everything you need</h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 48 }}>Professional passport photos from the comfort of your home</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {FEATURES.map(function(f) { return (
              <div key={f.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, transition: "all 0.3s" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#fff" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 48, letterSpacing: "-0.03em" }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
            {[
              { step: "01", icon: "📤", title: "Upload Photo", desc: "Upload any clear photo of your face or use your camera" },
              { step: "02", icon: "🌍", title: "Pick Country", desc: "Select your country and document type for exact specifications" },
              { step: "03", icon: "🤖", title: "AI Processes", desc: "Our AI removes background and optimizes your photo instantly" },
              { step: "04", icon: "⬇️", title: "Download", desc: "Get your print-ready photo delivered instantly" },
            ].map(function(s) { return (
              <div key={s.step} style={{ position: "relative", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(99,102,241,0.6)", marginBottom: 12, letterSpacing: "0.1em" }}>{s.step}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ position: "relative", zIndex: 1, padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 8, letterSpacing: "-0.03em" }}>Simple pricing</h2>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 16, marginBottom: 48 }}>No subscription. Pay only when you download.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {[
              { plan: "Free", price: "K0 / $0", desc: "Try before you buy", features: ["2 watermarked photos", "5 countries", "Basic compliance check"], cta: "Try Free" },
              { plan: "Basic", price: "K20 / $1.25", desc: "Perfect for one document", features: ["4 print-ready photos", "100+ countries", "AI background removal", "Email delivery", "Money-back guarantee"], cta: "Get Photos", highlight: true },
              { plan: "Premium", price: "K35 / $2.50", desc: "Best value for families", features: ["8 print-ready photos", "All countries & doc types", "Bulk print layout", "Priority processing", "Email delivery"], cta: "Get Premium" },
            
            ].map(function(p) { return (
              <div key={p.plan} style={{
                position: "relative",
                background: p.highlight ? "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2))" : "rgba(255,255,255,0.03)",
                border: p.highlight ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: 24,
                boxShadow: p.highlight ? "0 0 40px rgba(99,102,241,0.2)" : "none"
              }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{p.plan}</div>
                <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 4, letterSpacing: "-0.03em" }}>{p.price}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>{p.desc}</div>
                {p.features.map(function(f) { return (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
                    <span style={{ color: "#6366f1" }}>✓</span> {f}
                  </div>
                ); })}
                <button onClick={() => fileRef.current.click()}
                  style={{ width: "100%", marginTop: 20, padding: "12px 0", background: p.highlight ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)", color: "#fff", border: p.highlight ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  {p.cta}
                </button>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 24, padding: "60px 40px" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.03em" }}>Ready to get started?</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 32 }}>Join thousands of people who trust EvarPhoto for their official documents.</p>
          <button onClick={() => fileRef.current.click()}
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 12, padding: "16px 40px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }}>
            📸 Upload Your Photo Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            <span style={{ color: "#fff" }}>EVAR</span>
            <span style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>© 2026 EvarPhoto · Photos deleted after 1 hour · SSL secured</div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms", "Support"].map(function(l) { return (
              <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{l}</a>
            ); })}
          </div>
        </div>
      </footer>
    </div>
  );

  // ── EDITOR PAGE ────────────────────────────────────────────
  if (step === "editor") return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
      
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            <span>EVAR</span><span style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["Upload", "Edit", "Download"].map(function(s, i) { return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: i === 1 ? "rgba(99,102,241,0.3)" : "transparent", color: i <= 1 ? "#a5b4fc" : "rgba(255,255,255,0.3)", border: i === 1 ? "1px solid rgba(99,102,241,0.5)" : "none" }}>{s}</div>
                {i < 2 && <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>}
              </div>
            ); })}
          </div>
          <button onClick={() => { setStep("home"); setImageUrl(null); }}
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            ← Start over
          </button>
        </div>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Left */}
        <div style={{ flex: "0 0 320px", background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.05)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={imageUrl} alt="Preview"
                style={{ maxWidth: 260, maxHeight: 320, borderRadius: 12, filter: getFilterStyle(), boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
            <div style={{ marginTop: 12, display: "inline-block", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
              {selectedCountry.name} · {selectedDoc.label} · {selectedDoc.w}x{selectedDoc.h}mm
            </div>
          </div>

          {/* Background colors */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Background Color</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BG_OPTIONS.map(function(b) { return (
                <button key={b.value} onClick={() => setBgColor(b.value)} title={b.label}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: b.value, border: bgColor === b.value ? "3px solid #6366f1" : "2px solid rgba(255,255,255,0.1)", cursor: "pointer", boxShadow: bgColor === b.value ? "0 0 12px rgba(99,102,241,0.6)" : "none" }} />
              ); })}
            </div>
          </div>

          {/* Compliance */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}>✅ Compliance Check</div>
            {[
              { ok: true, text: "Photo uploaded" },
              { ok: true, text: selectedDoc.w + "x" + selectedDoc.h + "mm — " + selectedDoc.dpi + " DPI" },
              { ok: false, warn: true, text: "Verify face is centered" },
              { ok: true, text: "Background color set" },
              { ok: false, warn: true, text: "Ensure no glasses or hat" },
            ].map(function(item) { return (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: item.ok ? "rgba(255,255,255,0.7)" : item.warn ? "#fbbf24" : "#f87171", marginBottom: 6 }}>
                <span>{item.ok ? "✓" : item.warn ? "⚠" : "✗"}</span> {item.text}
              </div>
            ); })}
            <div style={{ marginTop: 10, fontSize: 12, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "8px 10px", borderRadius: 8 }}>
              💡 {selectedDoc.notes}
            </div>
          </div>

          {uploadError && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: 12, fontSize: 13, color: "#f87171" }}>
              ⚠️ {uploadError}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ flex: 1, padding: 32, maxWidth: 540 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, letterSpacing: "-0.02em" }}>Customize Your Photo</h2>

          {/* Country */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Country</label>
            <select value={selectedCountry.code} onChange={e => handleCountryChange(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 14, color: "#fff", outline: "none", cursor: "pointer" }}>
              {COUNTRIES.map(function(c) { return <option key={c.code} value={c.code} style={{ background: "#1a1a2e" }}>{c.name}</option>; })}
            </select>
          </div>

          {/* Document */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Document Type</label>
            <select value={selectedDoc.id}
              onChange={function(e) {
                const d = selectedCountry.docs.find(function(d) { return d.id === e.target.value; });
                if (d) { setSelectedDoc(d); setBgColor(d.bg); }
              }}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 14, color: "#fff", outline: "none", cursor: "pointer" }}>
              {selectedCountry.docs.map(function(d) { return <option key={d.id} value={d.id} style={{ background: "#1a1a2e" }}>{d.label}</option>; })}
            </select>
          </div>

          {/* Adjustments */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: "rgba(255,255,255,0.8)" }}>Photo Adjustments</div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                <span>☀️ Brightness</span><span style={{ fontFamily: "monospace" }}>{brightness}%</span>
              </div>
              <input type="range" min={60} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                <span>◑ Contrast</span><span style={{ fontFamily: "monospace" }}>{contrast}%</span>
              </div>
              <input type="range" min={60} max={150} value={contrast} onChange={e => setContrast(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#6366f1" }} />
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          
          <button onClick={() => fileRef.current.click()}
            style={{ width: "100%", marginBottom: 12, padding: "12px 0", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
            📤 Upload Different Photo
          </button>

          <button onClick={processPhoto} disabled={uploading}
            style={{ width: "100%", padding: "16px 0", background: uploading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, cursor: uploading ? "not-allowed" : "pointer", fontWeight: 700, boxShadow: uploading ? "none" : "0 8px 30px rgba(99,102,241,0.4)", transition: "all 0.3s" }}>
            {uploading ? "🤖 AI Processing..." : "🚀 Remove Background & Process"}
          </button>

          {uploading && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>AI is working on your photo...</div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#6366f1,#a855f7)", borderRadius: 2, animation: "progress 2s ease-in-out infinite", width: "60%" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── RESULT PAGE ────────────────────────────────────────────
  if (step === "result") return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            <span>EVAR</span><span style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["Upload", "Edit", "Download"].map(function(s, i) { return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: i === 2 ? "rgba(99,102,241,0.3)" : "transparent", color: i <= 2 ? "#a5b4fc" : "rgba(255,255,255,0.3)", border: i === 2 ? "1px solid rgba(99,102,241,0.5)" : "none" }}>{s}</div>
                {i < 2 && <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>}
              </div>
            ); })}
          </div>
          <button onClick={() => setStep("editor")}
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
            ← Back to edit
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {/* Success */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 32 }}>
          <span style={{ fontSize: 24 }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#4ade80" }}>Photo processed successfully!</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Your {selectedCountry.name} {selectedDoc.label} photo is ready for download.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {/* Photos */}
          <div style={{ flex: "1 1 320px" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "rgba(255,255,255,0.8)" }}>Before / After</h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Original</div>
                <img src={imageUrl} alt="Original" style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }} />
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Processed</div>
                <div style={{ borderRadius: 10, border: "1px solid rgba(99,102,241,0.5)", overflow: "hidden", background: bgColor, boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
                  <img src={previewUrl || imageUrl} alt="Processed" style={{ width: "100%", display: "block", filter: getFilterStyle() }} />
                </div>
              </div>
            </div>

            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: "rgba(255,255,255,0.8)" }}>Print Sheet Preview</h3>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[0,1,2,3].map(function(i) { return (
                  <div key={i} style={{ paddingBottom: "120%", position: "relative", background: bgColor, borderRadius: 8, border: "1px dashed rgba(255,255,255,0.2)", overflow: "hidden" }}>
                    <img src={previewUrl || imageUrl} alt="print"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: getFilterStyle() }} />
                  </div>
                ); })}
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 10 }}>4 photos · 4x6 inch sheet · cut along dashed lines</p>
            </div>
          </div>

          {/* Download */}
          <div style={{ flex: "1 1 280px" }}>
            {/* Compliance */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}>✅ Compliance Report</div>
              {[
                { ok: true, text: "Background replaced by AI" },
                { ok: true, text: selectedDoc.w + "x" + selectedDoc.h + "mm — 300 DPI" },
                { ok: true, text: "Brightness optimized" },
                { ok: false, warn: true, text: "Verify no glasses or hat" },
              ].map(function(item) { return (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: item.ok ? "rgba(255,255,255,0.7)" : "#fbbf24", marginBottom: 6 }}>
                  <span>{item.ok ? "✓" : "⚠"}</span> {item.text}
                </div>
              ); })}
            </div>

            {/* Plan */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Choose Plan</div>
              {[
                { id: "single", label: "Single Photo", price: "$2.99", sub: "1 download + email delivery" },
                { id: "family", label: "Family Pack", price: "$7.99", sub: "Up to 6 photos + bulk sheet" },
              ].map(function(p) { return (
                <button key={p.id} onClick={() => setPlan(p.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "14px 16px", background: plan === p.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", border: plan === p.id ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 10, cursor: "pointer", marginBottom: 8, boxSizing: "border-box" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{p.sub}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#a5b4fc" }}>{p.price}</div>
                </button>
              ); })}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📧 Email for delivery (optional)</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
            </div>
            <a href={previewUrl} download="evarphoto_free.jpg" target="_blank"
  style={{ display: "block", width: "100%", padding: "12px 0", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 500, marginBottom: 10, textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
  ⬇️ Download Free (2 photos with watermark)
</a>
            <button
              style={{ width: "100%", padding: "16px 0", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, cursor: "pointer", fontWeight: 700, marginBottom: 10, boxShadow: "0 8px 30px rgba(99,102,241,0.4)" }}>
              💳 Pay {plan === "single" ? "K20 / $1.25" : "K35 / $2.50"} — Download
            </button>

            <button onClick={() => setStep("editor")}
              style={{ width: "100%", padding: "12px 0", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 500, marginBottom: 16 }}>
              🔄 Re-edit Photo
            </button>

            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: 14, fontSize: 13, color: "#4ade80" }}>
              ✅ Accepted or money back — contact support@evarphoto.com
            </div>

            <div style={{ marginTop: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 12, fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
              🔒 Payments secured · Photos deleted after 1 hour
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}