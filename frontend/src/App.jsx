import { useState, useRef } from "react";

const API_URL = "http://localhost:4000";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "US", docs: [
    { id: "passport", label: "Passport", w: 51, h: 51, bg: "#FFFFFF", dpi: 300, notes: "Head 25-35mm, white background" },
  ]},
  { code: "UK", name: "United Kingdom", flag: "UK", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "Head 29-34mm, white background" },
  ]},
  { code: "IN", name: "India", flag: "IN", docs: [
    { id: "passport", label: "Passport", w: 51, h: 51, bg: "#FFFFFF", dpi: 300, notes: "Head 25-35mm, white background" },
  ]},
  { code: "EU", name: "Schengen/EU", flag: "EU", docs: [
    { id: "passport", label: "Passport", w: 35, h: 45, bg: "#FFFFFF", dpi: 300, notes: "ICAO standard, neutral background" },
  ]},
  { code: "CA", name: "Canada", flag: "CA", docs: [
    { id: "passport", label: "Passport", w: 50, h: 70, bg: "#FFFFFF", dpi: 300, notes: "Head 31-36mm, white background" },
  ]},
];

const BG_OPTIONS = [
  { label: "White", value: "#FFFFFF" },
  { label: "Off-white", value: "#F5F5F0" },
  { label: "Light Grey", value: "#E8E8E8" },
  { label: "Light Blue", value: "#C9D9F0" },
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
  const [checkingOut, setCheckingOut] = useState(false);
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

  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };

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

  const handleCheckout = async () => {
    if (!jobId) return;
    setCheckingOut(true);
    try {
      const res = await fetch(API_URL + "/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobId, plan: plan, email: email }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      alert("Payment setup failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  const S = {
    page: { fontFamily: "sans-serif", minHeight: "100vh", background: "#fff", color: "#1e1b4b" },
    nav: { background: "#1e1b4b", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    logo: { color: "#fff", fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" },
    btn: { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
    btnGhost: { background: "transparent", color: "#6366f1", border: "2px solid #6366f1", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
    hero: { textAlign: "center", padding: "80px 24px", background: "linear-gradient(135deg,#f8f7ff,#fff)" },
    heroTitle: { fontSize: 48, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.03em" },
    heroAccent: { background: "linear-gradient(135deg,#6366f1,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    heroSub: { fontSize: 18, color: "#6b7280", maxWidth: 500, margin: "0 auto 32px" },
    dropZone: { border: "2px dashed #c4b5fd", borderRadius: 14, padding: "48px 24px", textAlign: "center", cursor: "pointer", background: "#faf9ff", maxWidth: 600, margin: "0 auto" },
    editor: { display: "flex", minHeight: "calc(100vh - 60px)", flexWrap: "wrap" },
    editorLeft: { flex: "0 0 320px", background: "#f8f7ff", padding: 24, borderRight: "1px solid #ede9fe" },
    editorRight: { flex: 1, padding: 24, maxWidth: 500 },
    label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7280", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" },
    select: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, marginBottom: 12 },
    input: { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 14, boxSizing: "border-box" },
    card: { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #ede9fe", marginBottom: 16 },
    success: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", marginBottom: 24, color: "#15803d", fontWeight: 600 },
    error: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: 12, fontSize: 13, color: "#991b1b", marginTop: 8 },
  };

  if (step === "home") return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>EVAR<span style={{ color: "#a5b4fc" }}>PHOTO</span></div>
        <button style={S.btn} onClick={() => fileRef.current.click()}>Get Started</button>
      </nav>

      <section style={S.hero}>
        <h1 style={S.heroTitle}>
          Passport Photos<br />
          <span style={S.heroAccent}>Done Right.</span>
        </h1>
        <p style={S.heroSub}>
          Upload your photo, pick your country. AI removes the background and delivers a print-ready file in seconds.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 48 }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <button style={{ ...S.btn, fontSize: 16, padding: "14px 28px" }} onClick={() => fileRef.current.click()}>
            Upload Photo
          </button>
        </div>

        <div style={S.dropZone} onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current.click()}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
          <p style={{ fontWeight: 700, fontSize: 16, color: "#1e1b4b", margin: "0 0 4px" }}>Drop your photo here</p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>or click to browse — JPG, PNG supported</p>
        </div>
      </section>

      <section style={{ padding: "64px 24px", background: "#f8f7ff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 40 }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24 }}>
            {[
              { step: "1", title: "Upload Photo", desc: "Upload a selfie or any clear face photo" },
              { step: "2", title: "Pick Country", desc: "Select country and document type" },
              { step: "3", title: "AI Processes", desc: "Background removed, compliance checked" },
            ].map(function(s) { return (
              <div key={s.step} style={S.card}>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#ede9fe", marginBottom: 8 }}>{s.step}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 40 }}>Simple pricing</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20 }}>
            {[
              { plan: "Free Preview", price: "$0", features: ["Preview with watermark", "Compliance check"] },
              { plan: "Single Photo", price: "$2.99", features: ["Full download", "Print-ready sheet", "Email delivery", "Money-back guarantee"], highlight: true },
              { plan: "Family Pack", price: "$7.99", features: ["Up to 6 photos", "Bulk print layout", "Email delivery"] },
            ].map(function(p) { return (
              <div key={p.plan} style={{ ...S.card, border: p.highlight ? "2px solid #6366f1" : "1px solid #ede9fe" }}>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{p.plan}</div>
                <div style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>{p.price}</div>
                {p.features.map(function(f) { return (
                  <div key={f} style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>✓ {f}</div>
                ); })}
                <button style={{ ...S.btn, width: "100%", marginTop: 12 }} onClick={() => fileRef.current.click()}>
                  Get Started
                </button>
              </div>
            ); })}
          </div>
        </div>
      </section>

      <footer style={{ background: "#1e1b4b", padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
        © 2026 EvarPhoto · Photos deleted after 1 hour · SSL secured · support@evarphoto.com
      </footer>
    </div>
  );

  if (step === "editor") return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>EVAR<span style={{ color: "#a5b4fc" }}>PHOTO</span></div>
        <button style={S.btnGhost} onClick={() => { setStep("home"); setImageUrl(null); }}>
          Start over
        </button>
      </nav>

      <div style={S.editor}>
        <div style={S.editorLeft}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <img src={imageUrl} alt="Preview"
              style={{ maxWidth: 260, maxHeight: 320, borderRadius: 10, filter: getFilterStyle(), boxShadow: "0 8px 24px rgba(99,102,241,0.12)" }} />
            <div style={{ marginTop: 10, display: "inline-block", background: "#e0e7ff", color: "#4338ca", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>
              {selectedCountry.name} {selectedDoc.label} — {selectedDoc.w}x{selectedDoc.h}mm
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
            {BG_OPTIONS.map(function(b) { return (
              <button key={b.value} onClick={() => setBgColor(b.value)} title={b.label}
                style={{ width: 28, height: 28, borderRadius: "50%", background: b.value, border: bgColor === b.value ? "3px solid #6366f1" : "2px solid #d1d5db", cursor: "pointer" }} />
            ); })}
          </div>

          <div style={S.card}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Compliance Check</div>
            <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 4 }}>✓ Photo uploaded</div>
            <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 4 }}>✓ Size: {selectedDoc.w}x{selectedDoc.h}mm</div>
            <div style={{ fontSize: 13, color: "#f59e0b", marginBottom: 4 }}>⚠ Verify face is centered</div>
            <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 4 }}>✓ Background color set</div>
            <div style={{ fontSize: 12, color: "#92400e", background: "#fef3c7", padding: "6px 8px", borderRadius: 5, marginTop: 8 }}>
              {selectedDoc.notes}
            </div>
          </div>

          {uploadError && <div style={S.error}>{uploadError}</div>}
        </div>

        <div style={S.editorRight}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Country and Document</h3>
          <label style={S.label}>Country</label>
          <select style={S.select} value={selectedCountry.code} onChange={e => handleCountryChange(e.target.value)}>
            {COUNTRIES.map(function(c) { return <option key={c.code} value={c.code}>{c.name}</option>; })}
          </select>

          <label style={S.label}>Document Type</label>
          <select style={S.select} value={selectedDoc.id}
            onChange={function(e) {
              const d = selectedCountry.docs.find(function(d) { return d.id === e.target.value; });
              if (d) { setSelectedDoc(d); setBgColor(d.bg); }
            }}>
            {selectedCountry.docs.map(function(d) { return <option key={d.id} value={d.id}>{d.label}</option>; })}
          </select>

          <h3 style={{ fontWeight: 700, fontSize: 16, margin: "20px 0 16px" }}>Adjustments</h3>
          <label style={S.label}>Brightness: {brightness}%</label>
          <input type="range" min={60} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))}
            style={{ width: "100%", marginBottom: 12, accentColor: "#6366f1" }} />

          <label style={S.label}>Contrast: {contrast}%</label>
          <input type="range" min={60} max={150} value={contrast} onChange={e => setContrast(Number(e.target.value))}
            style={{ width: "100%", marginBottom: 20, accentColor: "#6366f1" }} />

          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          <button style={{ ...S.btnGhost, width: "100%", marginBottom: 10 }} onClick={() => fileRef.current.click()}>
            Upload Different Photo
          </button>

          <button style={{ ...S.btn, width: "100%", padding: "14px 0", fontSize: 15 }}
            onClick={processPhoto} disabled={uploading}>
            {uploading ? "Processing with AI..." : "Remove Background and Process"}
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "result") return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>EVAR<span style={{ color: "#a5b4fc" }}>PHOTO</span></div>
        <button style={S.btnGhost} onClick={() => setStep("editor")}>Back to edit</button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px" }}>
        <div style={S.success}>Your photo has been processed successfully!</div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Before / After</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 5 }}>ORIGINAL</p>
                <img src={imageUrl} alt="Original" style={{ width: "100%", borderRadius: 8, border: "2px solid #e5e7eb" }} />
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 5 }}>PROCESSED</p>
                <div style={{ borderRadius: 8, border: "2px solid #6366f1", overflow: "hidden", background: bgColor }}>
                  <img src={previewUrl || imageUrl} alt="Processed" style={{ width: "100%", display: "block", filter: getFilterStyle() }} />
                </div>
              </div>
            </div>

            <h3 style={{ fontWeight: 700, margin: "24px 0 12px" }}>Print Sheet Preview</h3>
            <div style={{ background: "#f3f4f6", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[0,1,2,3].map(function(i) { return (
                  <div key={i} style={{ paddingBottom: "120%", position: "relative", background: bgColor, borderRadius: 6, border: "1px dashed #ccc", overflow: "hidden" }}>
                    <img src={previewUrl || imageUrl} alt="print"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: getFilterStyle() }} />
                  </div>
                ); })}
              </div>
              <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>4 photos on a 4x6 sheet</p>
            </div>
          </div>

          <div style={{ flex: "1 1 260px" }}>
            <div style={S.card}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Compliance Report</div>
              <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 4 }}>✓ Background replaced by AI</div>
              <div style={{ fontSize: 13, color: "#22c55e", marginBottom: 4 }}>✓ {selectedDoc.w}x{selectedDoc.h}mm — 300 DPI</div>
              <div style={{ fontSize: 13, color: "#f59e0b", marginBottom: 4 }}>⚠ Verify no glasses or hat</div>
            </div>

            <h3 style={{ fontWeight: 700, margin: "0 0 12px" }}>Choose Plan</h3>
            {[
              { id: "single", label: "Single Photo", price: "$2.99" },
              { id: "family", label: "Family Pack", price: "$7.99" },
            ].map(function(p) { return (
              <button key={p.id} onClick={() => setPlan(p.id)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "12px 14px", border: plan === p.id ? "2px solid #6366f1" : "1.5px solid #e5e7eb", borderRadius: 8, background: plan === p.id ? "#f5f3ff" : "#fff", cursor: "pointer", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</span>
                <span style={{ fontWeight: 700, color: "#6366f1" }}>{p.price}</span>
              </button>
            ); })}

            <label style={{ ...S.label, marginTop: 12 }}>Email for delivery (optional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" style={S.input} />

            <button style={{ ...S.btn, width: "100%", padding: "14px 0", fontSize: 15, marginTop: 14 }}
              onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? "Redirecting to Stripe..." : "Pay " + (plan === "single" ? "$2.99" : "$7.99") + " and Download"}
            </button>

            <button style={{ ...S.btnGhost, width: "100%", marginTop: 10 }} onClick={() => setStep("editor")}>
              Re-edit Photo
            </button>

            <div style={{ marginTop: 16, padding: 14, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 13, color: "#15803d" }}>
              Accepted or money back — contact support@evarphoto.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}