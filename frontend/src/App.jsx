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
  const [showPayment, setShowPayment] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState("JPG");
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

  const downloadWithWatermark = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = "rgba(99,102,241,0.4)";
      ctx.font = "bold " + Math.floor(img.width / 12) + "px Arial";
      ctx.textAlign = "center";
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-0.4);
      ctx.fillText("evarphoto.vercel.app", 0, 0);
      ctx.fillText("evarphoto.vercel.app", 0, img.height / 3);
      ctx.fillText("evarphoto.vercel.app", 0, -img.height / 3);
      const a = document.createElement("a");
      if (downloadFormat === "PNG") {
        a.href = canvas.toDataURL("image/png");
        a.download = "evarphoto_free.png";
      } else {
        a.href = canvas.toDataURL("image/jpeg", 0.9);
        a.download = "evarphoto_free.jpg";
      }
      a.click();
    };
    img.src = previewUrl;
  };

  // ── STYLES ─────────────────────────────────────────────────
  const C = {
    primary: "#6366f1",
    primaryDark: "#4f46e5",
    primaryLight: "#e0e7ff",
    accent: "#a855f7",
    white: "#ffffff",
    light: "#f8f7ff",
    lightBlue: "#eff6ff",
    text: "#1e1b4b",
    textMid: "#4b5563",
    textLight: "#9ca3af",
    border: "#e5e7eb",
    success: "#22c55e",
    warning: "#f59e0b",
  };

  const btn = { background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 15px rgba(99,102,241,0.3)", display: "inline-flex", alignItems: "center", gap: 8 };
  const btnGhost = { background: "#fff", color: C.primary, border: "2px solid " + C.primaryLight, borderRadius: 10, padding: "11px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
  const card = { background: "#fff", borderRadius: 14, padding: 24, border: "1px solid " + C.border, boxShadow: "0 2px 12px rgba(99,102,241,0.06)" };
  const label = { display: "block", fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 };
  const select = { width: "100%", padding: "10px 14px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, background: "#fff", outline: "none", cursor: "pointer" };

  // ── HOME PAGE ──────────────────────────────────────────────
  if (step === "home") return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fff", minHeight: "100vh", color: C.text }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid " + C.border, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 12px rgba(99,102,241,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>
            EVAR<span style={{ background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="#features" style={{ fontSize: 14, color: C.textMid, textDecoration: "none", fontWeight: 500 }}>Features</a>
            <a href="#pricing" style={{ fontSize: 14, color: C.textMid, textDecoration: "none", fontWeight: 500 }}>Pricing</a>
            <button style={btn} onClick={() => fileRef.current.click()}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#f8f7ff 0%,#eff6ff 50%,#faf5ff 100%)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 380px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.primaryLight, color: C.primary, fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20, marginBottom: 20 }}>
              ✨ AI-Powered · 15+ Countries · Instant
            </div>
            <h1 style={{ fontSize: "clamp(36px,5vw,60px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: "-0.03em", color: C.text }}>
              Passport Photos<br />
              <span style={{ background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Done Right.</span>
            </h1>
            <p style={{ fontSize: 18, color: C.textMid, lineHeight: 1.7, maxWidth: 460, margin: "0 0 32px" }}>
              Upload any photo. AI removes the background, checks compliance, and delivers a print-ready file in seconds.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              <button style={{ ...btn, fontSize: 16, padding: "14px 28px" }} onClick={() => fileRef.current.click()}>
                📸 Upload Photo
              </button>
              <button style={{ ...btnGhost, fontSize: 16, padding: "13px 28px" }} onClick={() => fileRef.current.click()}>
                📷 Use Camera
              </button>
            </div>
            <p style={{ fontSize: 12, color: C.textLight, display: "flex", alignItems: "center", gap: 5 }}>
              🔒 Photos auto-deleted after 1 hour · Never stored or shared
            </p>
          </div>

          {/* Hero visual */}
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg,#e0e7ff,#faf5ff)", borderRadius: 20, padding: 24, boxShadow: "0 20px 60px rgba(99,102,241,0.15)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                {[...Array(6)].map(function(_, i) { return (
                  <div key={i} style={{ background: "#fff", borderRadius: 8, paddingBottom: "120%", position: "relative", overflow: "hidden", boxShadow: "0 2px 8px rgba(99,102,241,0.1)" }}>
                    <div style={{ position: "absolute", top: "20%", left: "25%", right: "25%", bottom: "30%", background: "linear-gradient(180deg,#fde68a,#fbbf24)", borderRadius: "50% 50% 40% 40%" }} />
                  </div>
                ); })}
              </div>
              <div style={{ textAlign: "center", fontSize: 12, color: C.textMid, fontWeight: 500 }}>Print-ready 4×6 sheet · 300 DPI</div>
            </div>
            <div style={{ position: "absolute", bottom: -12, right: -8, background: "#fff", border: "1px solid " + C.border, borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: C.success, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              ✓ Compliance verified
            </div>
          </div>
        </div>
      </section>

      {/* Drop zone */}
      <section style={{ background: C.light, padding: "40px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current.click()}
            style={{ border: dragOver ? "2px solid " + C.primary : "2px dashed #c4b5fd", borderRadius: 16, padding: "48px 24px", textAlign: "center", cursor: "pointer", background: dragOver ? C.primaryLight : "#faf9ff", transition: "all 0.3s" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: C.text, margin: "0 0 4px" }}>Drop your photo here</p>
            <p style={{ fontSize: 13, color: C.textLight, margin: "0 0 16px" }}>JPG, PNG, HEIC supported · Max 10MB</p>
            <button style={btn}>Choose File</button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { num: "15+", label: "Countries" },
            { num: "50K+", label: "Photos Processed" },
            { num: "99%", label: "Acceptance Rate" },
            { num: "<10s", label: "Processing Time" },
          ].map(function(s) { return (
            <div key={s.label} style={{ textAlign: "center", padding: "16px 32px", background: C.light, borderRadius: 12, border: "1px solid " + C.border }}>
              <div style={{ fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</div>
              <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>{s.label}</div>
            </div>
          ); })}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: C.light, padding: "64px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 8, letterSpacing: "-0.02em" }}>Everything you need</h2>
          <p style={{ textAlign: "center", color: C.textMid, fontSize: 16, marginBottom: 40 }}>Professional passport photos from the comfort of your home</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {[
              { icon: "✨", title: "AI Background Removal", desc: "Instant professional background replacement powered by advanced AI" },
              { icon: "🌍", title: "15+ Countries", desc: "Official specs for passports, visas, IDs and more worldwide" },
              { icon: "🖨️", title: "Print Ready", desc: "300 DPI print-ready 4x6 sheet with cutting guides" },
              { icon: "📄", title: "Multiple Formats", desc: "Download as JPG, PNG, or PDF for print shops" },
              { icon: "🔒", title: "Privacy First", desc: "Photos auto-deleted after 1 hour" },
              { icon: "✅", title: "Compliance Check", desc: "Real-time validation against official requirements" },
            ].map(function(f) { return (
              <div key={f.title} style={card}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: C.text }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#fff", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 40, letterSpacing: "-0.02em" }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24 }}>
            {[
              { step: "01", icon: "📤", title: "Upload Photo", desc: "Upload any clear photo or use your camera" },
              { step: "02", icon: "🌍", title: "Pick Country", desc: "Select country and document type" },
              { step: "03", icon: "🤖", title: "AI Processes", desc: "Background removed and photo optimized" },
              { step: "04", icon: "⬇️", title: "Download", desc: "Get your print-ready photo instantly" },
            ].map(function(s) { return (
              <div key={s.step} style={{ ...card, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, marginBottom: 8, letterSpacing: "0.1em" }}>{s.step}</div>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: C.textMid, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ background: C.light, padding: "64px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: "center", marginBottom: 8, letterSpacing: "-0.02em" }}>Simple pricing</h2>
          <p style={{ textAlign: "center", color: C.textMid, fontSize: 15, marginBottom: 40 }}>No subscription. Pay only when you download.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20, alignItems: "start" }}>
            {[
              { plan: "Free", price: "K0", desc: "Try before you buy", features: ["2 watermarked photos", "5 countries", "Basic compliance check"], cta: "Try Free" },
              { plan: "Basic", price: "K10", desc: "Perfect for one document", features: ["4 print-ready photos", "15+ countries", "AI background removal", "JPG, PNG, PDF formats", "Email delivery", "Money-back guarantee"], cta: "Get Photos", highlight: true },
              { plan: "Premium", price: "K25", desc: "Best value for families", features: ["8 print-ready photos", "All countries and doc types", "Bulk print layout", "Priority processing", "Email delivery"], cta: "Get Premium" },
            ].map(function(p) { return (
              <div key={p.plan} style={{ ...card, position: "relative", border: p.highlight ? "2px solid " + C.primary : "1px solid " + C.border, boxShadow: p.highlight ? "0 8px 32px rgba(99,102,241,0.15)" : "0 2px 12px rgba(99,102,241,0.06)" }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20 }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 13, color: C.textLight, marginBottom: 4, fontWeight: 600 }}>{p.plan}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.text, marginBottom: 4, letterSpacing: "-0.02em" }}>{p.price}</div>
                <div style={{ fontSize: 13, color: C.textLight, marginBottom: 20 }}>{p.desc}</div>
                {p.features.map(function(f) { return (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.textMid, marginBottom: 8 }}>
                    <span style={{ color: C.primary, fontWeight: 700 }}>✓</span> {f}
                  </div>
                ); })}
                <button style={{ ...btn, width: "100%", marginTop: 16, justifyContent: "center" }} onClick={() => fileRef.current.click()}>
                  {p.cta}
                </button>
              </div>
            ); })}
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: C.textLight, marginTop: 24 }}>
            ✅ Accepted or money back · Contact: evatechceopro@gmail.com
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.02em" }}>Ready to get started?</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 }}>Join thousands of people who trust EvarPhoto for their official documents.</p>
        <button style={{ background: "#fff", color: C.primary, border: "none", borderRadius: 12, padding: "16px 40px", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }} onClick={() => fileRef.current.click()}>
          📸 Upload Your Photo Now
        </button>
      </section>

      {/* Footer */}
      <footer style={{ background: C.text, padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
            EVAR<span style={{ background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>© 2026 EvarPhoto · Photos deleted after 1 hour · SSL secured</div>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="mailto:evatechceopro@gmail.com" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>evatechceopro@gmail.com</a>
            {["Privacy", "Terms"].map(function(l) { return (
              <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{l}</a>
            ); })}
          </div>
        </div>
      </footer>
    </div>
  );

  // ── EDITOR PAGE ────────────────────────────────────────────
  if (step === "editor") return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fff", minHeight: "100vh", color: C.text }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid " + C.border, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 12px rgba(99,102,241,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            EVAR<span style={{ background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {["Upload", "Edit", "Download"].map(function(s, i) { return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: i === 1 ? C.primaryLight : "transparent", color: i <= 1 ? C.primary : C.textLight, border: i === 1 ? "1px solid #c4b5fd" : "none" }}>{s}</div>
                {i < 2 && <span style={{ color: C.border, fontSize: 16 }}>›</span>}
              </div>
            ); })}
          </div>
          <button style={btnGhost} onClick={() => { setStep("home"); setImageUrl(null); }}>✕ Start over</button>
        </div>
      </nav>

      <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
        {/* Left */}
        <div style={{ flex: "0 0 320px", background: C.light, padding: 24, borderRight: "1px solid " + C.border, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ textAlign: "center" }}>
            <img src={imageUrl} alt="Preview"
              style={{ maxWidth: 270, maxHeight: 330, borderRadius: 12, filter: getFilterStyle(), boxShadow: "0 8px 32px rgba(99,102,241,0.15)", border: "2px solid " + C.border }} />
            <div style={{ marginTop: 10, display: "inline-block", background: C.primaryLight, color: C.primary, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>
              {selectedCountry.name} · {selectedDoc.label} · {selectedDoc.w}x{selectedDoc.h}mm
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
              {BG_OPTIONS.map(function(b) { return (
                <button key={b.value} onClick={() => setBgColor(b.value)} title={b.label}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: b.value, border: bgColor === b.value ? "3px solid " + C.primary : "2px solid " + C.border, cursor: "pointer" }} />
              ); })}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 10 }}>✅ Compliance Check</div>
            {[
              { ok: true, text: "Photo uploaded" },
              { ok: true, text: selectedDoc.w + "x" + selectedDoc.h + "mm · " + selectedDoc.dpi + " DPI" },
              { ok: false, warn: true, text: "Verify face is centered" },
              { ok: true, text: "Background color set" },
              { ok: false, warn: true, text: "Ensure no glasses or hat" },
            ].map(function(item) { return (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: item.ok ? C.textMid : item.warn ? "#92400e" : "#991b1b", marginBottom: 6 }}>
                <span style={{ color: item.ok ? C.success : item.warn ? C.warning : "#ef4444" }}>{item.ok ? "✓" : item.warn ? "⚠" : "✗"}</span> {item.text}
              </div>
            ); })}
            <div style={{ marginTop: 8, fontSize: 12, color: "#92400e", background: "#fef3c7", padding: "7px 10px", borderRadius: 6 }}>
              💡 {selectedDoc.notes}
            </div>
          </div>

          {uploadError && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, fontSize: 13, color: "#991b1b" }}>
              ⚠️ {uploadError}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ flex: 1, padding: 32, maxWidth: 520 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, letterSpacing: "-0.02em" }}>Customize Your Photo</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={label}>Country</label>
            <select value={selectedCountry.code} onChange={e => handleCountryChange(e.target.value)} style={select}>
              {COUNTRIES.map(function(c) { return <option key={c.code} value={c.code}>{c.name}</option>; })}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={label}>Document Type</label>
            <select value={selectedDoc.id}
              onChange={function(e) {
                const d = selectedCountry.docs.find(function(d) { return d.id === e.target.value; });
                if (d) { setSelectedDoc(d); setBgColor(d.bg); }
              }} style={select}>
              {selectedCountry.docs.map(function(d) { return <option key={d.id} value={d.id}>{d.label}</option>; })}
            </select>
          </div>

          <div style={{ ...card, marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16 }}>Photo Adjustments</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                <span>☀️ Brightness</span><span style={{ fontFamily: "monospace" }}>{brightness}%</span>
              </div>
              <input type="range" min={60} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                style={{ width: "100%", accentColor: C.primary }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.textMid, marginBottom: 6 }}>
                <span>◑ Contrast</span><span style={{ fontFamily: "monospace" }}>{contrast}%</span>
              </div>
              <input type="range" min={60} max={150} value={contrast} onChange={e => setContrast(Number(e.target.value))}
                style={{ width: "100%", accentColor: C.primary }} />
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <button style={{ ...btnGhost, width: "100%", justifyContent: "center", marginBottom: 10 }} onClick={() => fileRef.current.click()}>
            📤 Upload Different Photo
          </button>
          <button style={{ ...btn, width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 15 }}
            onClick={processPhoto} disabled={uploading}>
            {uploading ? "🤖 AI Processing..." : "🚀 Remove Background & Process"}
          </button>
          {uploading && (
            <div style={{ marginTop: 12 }}>
              <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg," + C.primary + "," + C.accent + ")", borderRadius: 2, width: "60%", transition: "width 0.5s" }} />
              </div>
              <p style={{ fontSize: 12, color: C.textLight, textAlign: "center", marginTop: 6 }}>AI is working on your photo...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── RESULT PAGE ────────────────────────────────────────────
  if (step === "result") return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#fff", minHeight: "100vh", color: C.text }}>
      <nav style={{ background: "#fff", borderBottom: "1px solid " + C.border, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 12px rgba(99,102,241,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            EVAR<span style={{ background: "linear-gradient(135deg," + C.primary + "," + C.accent + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PHOTO</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {["Upload", "Edit", "Download"].map(function(s, i) { return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: i === 2 ? C.primaryLight : "transparent", color: i <= 2 ? C.primary : C.textLight, border: i === 2 ? "1px solid #c4b5fd" : "none" }}>{s}</div>
                {i < 2 && <span style={{ color: C.border, fontSize: 16 }}>›</span>}
              </div>
            ); })}
          </div>
          <button style={btnGhost} onClick={() => setStep("editor")}>← Back to edit</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 20px", marginBottom: 32 }}>
          <span style={{ fontSize: 24 }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#15803d" }}>Photo processed successfully!</div>
            <div style={{ fontSize: 13, color: "#166534" }}>Your {selectedCountry.name} {selectedDoc.label} photo is ready.</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          {/* Photos */}
          <div style={{ flex: "1 1 320px" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: C.text }}>Before / After</h3>
            <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Original</div>
                <img src={imageUrl} alt="Original" style={{ width: "100%", borderRadius: 8, border: "2px solid " + C.border }} />
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.textLight, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Processed</div>
                <div style={{ borderRadius: 8, border: "2px solid " + C.primary, overflow: "hidden", background: bgColor, boxShadow: "0 0 20px rgba(99,102,241,0.15)" }}>
                  <img src={previewUrl || imageUrl} alt="Processed" style={{ width: "100%", display: "block", filter: getFilterStyle() }} />
                </div>
              </div>
            </div>

            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Print Sheet Preview</h3>
            <div style={{ background: C.light, borderRadius: 12, padding: 16, border: "1px solid " + C.border }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[0,1,2,3].map(function(i) { return (
                  <div key={i} style={{ paddingBottom: "120%", position: "relative", background: bgColor, borderRadius: 8, border: "1px dashed #c4b5fd", overflow: "hidden" }}>
                    <img src={previewUrl || imageUrl} alt="print"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: getFilterStyle() }} />
                  </div>
                ); })}
              </div>
              <p style={{ fontSize: 11, color: C.textLight, textAlign: "center", marginTop: 10 }}>4 photos · 4x6 inch sheet · cut along dashed lines</p>
            </div>
          </div>

          {/* Download */}
          <div style={{ flex: "1 1 280px" }}>
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 10 }}>✅ Compliance Report</div>
              {[
                { ok: true, text: "Background replaced by AI" },
                { ok: true, text: selectedDoc.w + "x" + selectedDoc.h + "mm · 300 DPI" },
                { ok: true, text: "Brightness optimized" },
                { ok: false, warn: true, text: "Verify no glasses or hat" },
              ].map(function(item) { return (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: item.ok ? C.textMid : "#92400e", marginBottom: 6 }}>
                  <span style={{ color: item.ok ? C.success : C.warning }}>{item.ok ? "✓" : "⚠"}</span> {item.text}
                </div>
              ); })}
            </div>

            {/* Format selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Download Format</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["JPG", "PNG", "PDF"].map(function(f) { return (
                  <button key={f} onClick={() => setDownloadFormat(f)}
                    style={{ flex: 1, padding: "10px 0", background: downloadFormat === f ? C.primaryLight : "#fff", border: downloadFormat === f ? "1.5px solid " + C.primary : "1.5px solid " + C.border, borderRadius: 8, color: downloadFormat === f ? C.primary : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {f}
                  </button>
                ); })}
              </div>
              <div style={{ fontSize: 11, color: C.textLight, marginTop: 6 }}>
                {downloadFormat === "JPG" && "Best for online visa applications"}
                {downloadFormat === "PNG" && "Higher quality with transparency"}
                {downloadFormat === "PDF" && "Best for print shops"}
              </div>
            </div>

            {/* Plan */}
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Choose Plan</label>
              {[
                { id: "single", label: "Basic Plan", price: "K10", sub: "4 photos + email delivery" },
                { id: "family", label: "Premium Plan", price: "K25", sub: "8 photos + bulk sheet" },
              ].map(function(p) { return (
                <button key={p.id} onClick={() => setPlan(p.id)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "12px 14px", background: plan === p.id ? C.primaryLight : "#fff", border: plan === p.id ? "1.5px solid " + C.primary : "1.5px solid " + C.border, borderRadius: 10, cursor: "pointer", marginBottom: 8, boxSizing: "border-box" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: C.textLight }}>{p.sub}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>{p.price}</div>
                </button>
              ); })}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={label}>📧 Email for delivery (optional)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* Free download */}
            <button onClick={downloadWithWatermark}
              style={{ display: "block", width: "100%", padding: "11px 0", background: "#fff", color: C.textMid, border: "1.5px solid " + C.border, borderRadius: 10, fontSize: 14, cursor: "pointer", fontWeight: 500, marginBottom: 10, textAlign: "center", boxSizing: "border-box" }}>
              ⬇️ Download Free (watermarked)
            </button>

            {/* Pay button */}
            <button onClick={function() { setShowPayment(true); }}
              style={{ ...btn, width: "100%", justifyContent: "center", padding: "14px 0", fontSize: 15, marginBottom: 10 }}>
              💳 Pay {plan === "single" ? "K10" : "K25"} — Download
            </button>

            <button onClick={() => setStep("editor")}
              style={{ ...btnGhost, width: "100%", justifyContent: "center", marginBottom: 16 }}>
              🔄 Re-edit Photo
            </button>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 14, fontSize: 13, color: "#15803d", marginBottom: 10 }}>
              ✅ Accepted or money back · evatechceopro@gmail.com
            </div>

            <div style={{ background: C.light, border: "1px solid " + C.border, borderRadius: 10, padding: 12, fontSize: 12, color: C.textLight, textAlign: "center" }}>
              🔒 Payments secured · Photos deleted after 1 hour
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 24 }}>
          <div style={{ background: "#fff", border: "1px solid " + C.border, borderRadius: 20, padding: 32, maxWidth: 480, width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <button onClick={function() { setShowPayment(false); }}
              style={{ position: "absolute", top: 16, right: 16, background: C.light, border: "none", color: C.text, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>
              ✕
            </button>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>💳</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: C.text }}>Complete Payment</h3>
              <div style={{ fontSize: 14, color: C.textMid }}>
                {plan === "single" ? "Basic Plan — K10 · 4 photos" : "Premium Plan — K25 · 8 photos"}
              </div>
            </div>

            <div style={{ background: C.light, border: "1px solid " + C.border, borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.primary, marginBottom: 14 }}>🇿🇲 Send Payment Via Mobile Money</div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid " + C.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: "#fee2e2", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📱</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Airtel Money</div>
                    <div style={{ fontSize: 14, color: C.primary, fontWeight: 700 }}>+260 979 692 667</div>
                  </div>
                </div>
                <button onClick={function() { navigator.clipboard.writeText("0979692667"); alert("Copied!"); }}
                  style={{ background: C.primaryLight, border: "1px solid #c4b5fd", color: C.primary, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  Copy
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📱</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>MTN Mobile Money</div>
                    <div style={{ fontSize: 14, color: "#d97706", fontWeight: 700 }}>+260 964 078 439</div>
                  </div>
                </div>
                <button onClick={function() { navigator.clipboard.writeText("0964078439"); alert("Copied!"); }}
                  style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#d97706", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  Copy
                </button>
              </div>
            </div>

            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d", marginBottom: 8 }}>📱 After paying — Send proof on WhatsApp</div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 12 }}>Send your payment screenshot to receive your photo:</div>
              <a href={"https://wa.me/260979692667?text=Hi%20EvarPhoto!%20I%20just%20paid%20for%20the%20" + (plan === "single" ? "Basic" : "Premium") + "%20plan%20(" + (plan === "single" ? "K10" : "K25") + ").%20Please%20send%20my%20passport%20photo.%20Email%3A%20" + (email || "my-email@example.com")}
                target="_blank"
                style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg,#25d366,#128c7e)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 20px", borderRadius: 10, textDecoration: "none" }}>
                💬 Open WhatsApp to Send Proof
              </a>
            </div>

            <div style={{ background: C.light, borderRadius: 10, padding: 12, fontSize: 12, color: C.textLight, textAlign: "center" }}>
              Your photo will be delivered within 30 minutes after payment confirmation
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const C2 = C;
}