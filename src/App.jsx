import React, { useMemo, useRef, useState } from "react";

/* =========================
   Env / Config
   ========================= */
const API =
  import.meta.env.VITE_MS_API_BASE ||
  "https://api.mindstudio.ai/developer/v2/apps/run";

const API_KEY_DEFAULT = import.meta.env.VITE_MS_API_KEY;
const API_KEY_NEWS   = import.meta.env.VITE_MS_API_KEY_NEWS   || API_KEY_DEFAULT;
const API_KEY_PEOPLE = import.meta.env.VITE_MS_API_KEY_PEOPLE || API_KEY_DEFAULT;

const APP_ID_NEWS    = import.meta.env.VITE_APP_ID_NEWS;
const WF_NEWS        = import.meta.env.VITE_WORKFLOW_NAME_NEWS;

const APP_ID_PEOPLE  = import.meta.env.VITE_APP_ID_PEOPLE;
const WF_PEOPLE      = import.meta.env.VITE_WORKFLOW_NAME_PEOPLE;

/* =========================
   Error Boundary
   ========================= */
class ErrorBoundary extends React.Component {
  constructor(p){ super(p); this.state={ hasError:false, message:"" }; }
  static getDerivedStateFromError(err){ return { hasError:true, message: err?.message || String(err) }; }
  componentDidCatch(err, info){ /* intentionally quiet in UI */ }
  render(){
    if (this.state.hasError){
      return (
        <div style={{
          margin:"12px 0", padding:12, border:"1px solid #e1bcbc",
          background:"#fff5f5", color:"#7a1f1f", borderRadius:12
        }}>
          <strong>Something went wrong.</strong>
          <div style={{ marginTop: 6, fontSize: 14 }}>{this.state.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =========================
   Helpers
   ========================= */
function toText(v){
  if (v == null) return "";
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return String(v);
  if (t === "object" && typeof v.name === "string") return v.name; // e.g. source objects
  try { return JSON.stringify(v); } catch { return "[object]"; }
}
const truncate = (s, n=220) => (typeof s === "string" && s.length > n ? s.slice(0, n) + "…" : s);

/* =========================
   Runner (in-flight guard + abort)
   ========================= */
function useAgentRunner(explicitKey) {
  const abortRef = useRef(null);
  const inflightRef = useRef(false);

  async function run({ appId, workflow, variables }) {
    const key = explicitKey || API_KEY_DEFAULT;
    if (!key) throw new Error("Missing API key");
    if (!appId) throw new Error("Missing appId");

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    inflightRef.current = true;

    const body = { appId, variables, includeBillingCost: true };
    if (workflow) body.workflow = workflow;

    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: abortRef.current.signal,
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      inflightRef.current = false;
      throw new Error(`HTTP ${res.status} ${res.statusText}${t ? `: ${t}` : ""}`);
    }

    let json = {};
    try { json = await res.json(); } catch { json = {}; }
    inflightRef.current = false;
    return json;
  }

  return { run, inflightRef };
}

/* =========================
   Styles with Tailwind-like enhancements
   ========================= */
const ui = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    color: "#1e293b",
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  container: { maxWidth: 1200, margin: "0 auto", padding: "32px 16px 48px" },
  header: {
    margin: "24px 0 32px",
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 32,
    letterSpacing: "-0.025em",
    textAlign: "center"
  },
  grid: { display: "grid", gap: 24, gridTemplateColumns: "1fr" },
  gridMd: { display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" },
  gridLg: { display: "grid", gap: 24, gridTemplateColumns: "repeat(3, 1fr)" },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: 24,
    transition: "all 0.2s ease-in-out",
    position: "relative",
    overflow: "hidden"
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" },

  row: { display: "flex", gap: 12, marginBottom: 16 },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid #e2e8f0",
    outline: "none",
    background: "#f8fafc",
    transition: "all 0.2s ease-in-out",
    fontSize: 14,
    fontWeight: 500
  },
  inputFocus: {
    border: "2px solid #3b82f6",
    background: "#ffffff",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
  },
  btnBlue: {
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)"
  },
  btnBlueHover: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    transform: "translateY(-1px)",
    boxShadow: "0 8px 15px -3px rgba(59, 130, 246, 0.4)"
  },
  btnDisabled: {
    background: "#94a3b8",
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none"
  },

  // Enhanced News tiles
  newsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
    marginTop: 20
  },
  newsTile: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
    background: "#ffffff",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
  },
  newsTileHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    border: "1px solid #cbd5e1"
  },
  newsImgWrap: {
    width: "100%",
    height: 160,
    overflow: "hidden",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  newsImg: { width: "100%", height: "100%", objectFit: "cover" },
  newsBody: { padding: "16px 20px 20px" },
  newsTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    color: "#0f172a",
    marginBottom: 8
  },
  newsMeta: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  newsSummary: { color: "#475569", fontSize: 14, lineHeight: 1.5 },

  // Enhanced People cards
  count: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 8,
    fontWeight: 600,
    background: "#f1f5f9",
    padding: "2px 8px",
    borderRadius: 12
  },
  peopleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
    marginTop: 20
  },
  personCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    display: "grid",
    gridTemplateColumns: "64px 1fr",
    gap: 16,
    alignItems: "start",
    background: "#ffffff",
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.1)"
  },
  personCardHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #cbd5e1"
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 12,
    objectFit: "cover",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    border: "2px solid #f1f5f9"
  },
  name: { margin: 0, fontWeight: 700, fontSize: 16, color: "#0f172a" },
  meta: { fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 },
  note: { fontSize: 14, color: "#475569", marginTop: 8, lineHeight: 1.4 },
  hint: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 16,
    textAlign: "center",
    fontStyle: "italic"
  },
};

/* =========================
   Utilities
   ========================= */
function bestImage(item){
  const candidates = [
    item?.thumbnail, item?.image, item?.imageUrl, item?.image_url,
    item?.urlToImage, item?.thumb, item?.picture?.url, item?.profile_image_url
  ].filter(Boolean);
  if (candidates.length) return candidates[0];
  try { const u = new URL(item?.link || item?.url); return `${u.origin}/favicon.ico`; } catch { return null; }
}

/* =========================
   Enhanced News Tile with Interactive States
   ========================= */
function NewsTile() {
  const { run, inflightRef } = useAgentRunner(API_KEY_NEWS);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const okEnv = Boolean(API_KEY_NEWS && APP_ID_NEWS && WF_NEWS);

  const search = async () => {
    if (loading || inflightRef.current) return;
    setLoading(true); setErr(""); setItems([]);
    try {
      const out = await run({
        appId: APP_ID_NEWS,
        workflow: WF_NEWS,
        variables: { webhookParams: { keyword: q } },
      });

      // Debug logging - let's see what we actually get back
      console.log("📰 Raw News API Response:", out);

      const result = out?.result ?? out?.thread?.result ?? out ?? {};
      console.log("📊 Processed news result:", result);

      let list = result.news || result.preview || result.items || result.articles || result.data || [];
      console.log("📋 Found news list:", list);

      // Try to extract from any array-like property
      if (!Array.isArray(list) && typeof result === "object") {
        for (const [key, value] of Object.entries(result)) {
          if (Array.isArray(value) && value.length > 0) {
            console.log(`🔍 Found news array in ${key}:`, value);
            list = value;
            break;
          }
        }
      }

      if (!Array.isArray(list)) list = [result];

      const finalItems = list.slice(0, 24);
      console.log("✅ Final news items:", finalItems);
      console.log("📝 First article structure:", finalItems[0]);
      setItems(finalItems);

      if (list.length === 0) {
        console.warn("⚠️ No news found in response. Full response:", out);
      }

    } catch (e) {
      console.error("❌ News search error:", e);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (q.trim() && okEnv) search(); }
  };

  const buttonDisabled = !q.trim() || !okEnv || loading;

  return (
    <div style={ui.card}>
      <div style={ui.head}>
        <h2 style={ui.title}>News Search</h2>
      </div>
      <div style={ui.row}>
        <input
          style={{
            ...ui.input,
            ...(inputFocused ? ui.inputFocus : {})
          }}
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder='Keyword (e.g. "AI infrastructure")'
        />
        <button
          type="button"
          style={{
            ...ui.btnBlue,
            ...(buttonDisabled ? ui.btnDisabled : {}),
          }}
          disabled={buttonDisabled}
          onClick={search}
          onMouseEnter={e => {
            if (!buttonDisabled) {
              Object.assign(e.target.style, ui.btnBlueHover);
            }
          }}
          onMouseLeave={e => {
            if (!buttonDisabled) {
              Object.assign(e.target.style, ui.btnBlue);
            }
          }}
        >
          {loading ? "🔄 Searching…" : "Search"}
        </button>
      </div>
      {err && (
        <div style={{
          color: "#dc2626",
          fontSize: 13,
          marginTop: 8,
          padding: "8px 12px",
          background: "#fee2e2",
          borderRadius: 8,
          border: "1px solid #fecaca"
        }}>
          ❌ {err}
        </div>
      )}
      {items.length > 0 && (
        <div style={ui.newsGrid}>
          {items.map((it, i) => {
            const img = bestImage(it);
            const title = toText(it?.title ?? "Untitled");
            const sourceName = it?.source?.name || it?.source || "";
            const publishedDate = it?.publishedAt || it?.published_at || it?.date || "";
            const meta = [sourceName, publishedDate].filter(Boolean).join(" • ");
            const sum = truncate(toText(it?.summary || it?.description || it?.content || ""), 180);
            const hasLink = typeof (it?.link || it?.url) === "string";
            const linkUrl = it?.link || it?.url;

            console.log(`📄 Article ${i}:`, { title, img, sourceName, publishedDate, hasLink, linkUrl });

            return (
              <div
                key={i}
                style={{
                  ...ui.newsTile,
                  ...(hoveredCard === i ? ui.newsTileHover : {})
                }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={ui.newsImgWrap}>
                  {img ? (
                    <img alt={title} src={img} style={ui.newsImg} />
                  ) : (
                    <div style={{
                      fontSize: 24,
                      color: "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      📰
                    </div>
                  )}
                </div>
                <div style={ui.newsBody}>
                  {hasLink ? (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#3b82f6",
                        textDecoration: "none"
                      }}
                    >
                      <h3 style={ui.newsTitle}>{title}</h3>
                    </a>
                  ) : (
                    <h3 style={ui.newsTitle}>{title}</h3>
                  )}
                  {meta && <div style={ui.newsMeta}>{meta}</div>}
                  {sum && <div style={ui.newsSummary}>{sum}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   CSV parsing (quote-aware) — for agent CSV outputs
   ========================= */
function parseCsvSmart(csv) {
  const rows = [];
  let i = 0, field = "", row = [], inQuotes = false;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow   = () => { rows.push(row); row = []; };

  while (i < csv.length) {
    const c = csv[i];
    if (inQuotes) {
      if (c === '"') {
        if (csv[i+1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    } else {
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ",") { pushField(); i++; continue; }
      if (c === "\r") { i++; continue; }
      if (c === "\n") { pushField(); pushRow(); i++; continue; }
      field += c; i++; continue;
    }
  }
  pushField(); if (row.length > 1 || (row.length === 1 && row[0] !== "")) pushRow();

  if (!rows.length) return null;
  const headers = rows[0].map(h => h.trim());
  const data = rows.slice(1).map(cols =>
    Object.fromEntries(headers.map((h, idx) => [h, (cols[idx] || "").trim()]))
  );
  return { headers, rows: data };
}

/* =========================
   People normalization → cards
   ========================= */
function normalizePerson(p) {
  return {
    name:   p?.name || p?.full_name || "",
    role:   p?.occupation || p?.role || "",
    company:p?.company || p?.org || "",
    image:  p?.profile_image_url || p?.image || p?.image_url || "",
    notes:  p?.notes || p?.bio || "",
  };
}

/* =========================
   Enhanced People Tile with Interactive States
   ========================= */
function PeopleTile() {
  const { run, inflightRef } = useAgentRunner(API_KEY_PEOPLE);
  const [url, setUrl] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [hoveredPerson, setHoveredPerson] = useState(null);

  const okEnv = Boolean(API_KEY_PEOPLE && APP_ID_PEOPLE && WF_PEOPLE);

  const extract = async () => {
    if (loading || inflightRef.current) return;
    setLoading(true); setErr(""); setRows([]);
    try {
      const out = await run({
        appId: APP_ID_PEOPLE,
        workflow: WF_PEOPLE,
        variables: { webhookParams: { url } },
      });

      console.log("🔍 Raw API Response:", out);
      const result = out?.result ?? out?.thread?.result ?? out ?? {};
      console.log("📊 Processed result:", result);

      let people = null;

      // Check if result is already an array
      if (Array.isArray(result)) {
        people = result;
      } else if (Array.isArray(result?.people)) {
        people = result.people;
      } else if (Array.isArray(result?.contacts)) {
        people = result.contacts;
      } else if (typeof result === "string" && result.trim()) {
        // Handle CSV data - support multi-line CSV
        const csvData = result.trim();
        console.log("📝 Full CSV data length:", csvData.length);
        console.log("📝 First 300 chars:", csvData.substring(0, 300));

        // Count newlines to detect multiple people
        const lines = csvData.split(/\r?\n/).filter(line => line.trim());
        console.log("📋 Found", lines.length, "CSV lines");

        if (csvData.includes(',') && lines.length > 0) {
          people = [];

          for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex].trim();
            if (!line) continue;

            console.log(`🧩 Processing line ${lineIndex + 1}:`, line.substring(0, 100) + "...");

            // Parse each CSV line
            const csvParts = [];
            let currentPart = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                csvParts.push(currentPart.replace(/^"|"$/g, ''));
                currentPart = "";
              } else {
                currentPart += char;
              }
            }
            if (currentPart) {
              csvParts.push(currentPart.replace(/^"|"$/g, ''));
            }

            console.log(`👤 Line ${lineIndex + 1} parts:`, csvParts.length, "fields");

            if (csvParts.length >= 3) {
              people.push({
                name: csvParts[0] || "",
                occupation: csvParts[1] || "",
                company: csvParts[2] || "",
                profile_image_url: csvParts[3] || "",
                notes: csvParts[4] || "",
              });
            }
          }

          console.log("✨ Parsed", people.length, "people from CSV");
        }
      }

      const normalized = Array.isArray(people) ? people.map(normalizePerson) : [];
      console.log("✅ Final normalized people:", normalized);
      setRows(normalized);

      if (normalized.length === 0) {
        console.warn("⚠️ No people found in response");
      }

    } catch (e) {
      console.error("❌ Extraction error:", e);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (url.trim() && okEnv) extract(); }
  };

  const count = rows.length;
  const buttonDisabled = !url.trim() || !okEnv || loading;

  return (
    <div style={ui.card}>
      <div style={ui.head}>
        <h2 style={ui.title}>Extract People</h2>
      </div>

      <div style={ui.row}>
        <input
          type="url"
          style={{
            ...ui.input,
            ...(inputFocused ? ui.inputFocus : {})
          }}
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="https://worldsummit.ai/speakers/"
        />
        <button
          type="button"
          style={{
            ...ui.btnBlue,
            ...(buttonDisabled ? ui.btnDisabled : {}),
          }}
          disabled={buttonDisabled}
          onClick={extract}
          onMouseEnter={e => {
            if (!buttonDisabled) {
              Object.assign(e.target.style, ui.btnBlueHover);
            }
          }}
          onMouseLeave={e => {
            if (!buttonDisabled) {
              Object.assign(e.target.style, ui.btnBlue);
            }
          }}
        >
          {loading ? "🔄 Extracting…" : "Extract"}
        </button>
      </div>

      {err && (
        <div style={{
          color: "#dc2626",
          fontSize: 13,
          marginTop: 8,
          padding: "8px 12px",
          background: "#fee2e2",
          borderRadius: 8,
          border: "1px solid #fecaca"
        }}>
          ❌ {err}
        </div>
      )}

      {count > 0 && (
        <div style={ui.peopleGrid}>
          {rows.map((p, i) => (
            <div
              key={i}
              style={{
                ...ui.personCard,
                ...(hoveredPerson === i ? ui.personCardHover : {})
              }}
              onMouseEnter={() => setHoveredPerson(i)}
              onMouseLeave={() => setHoveredPerson(null)}
            >
              {p.image ? (
                <img src={p.image} alt="" style={ui.avatar}/>
              ) : (
                <div style={{
                  ...ui.avatar,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: 20
                }}>
                  👤
                </div>
              )}
              <div>
                <h3 style={ui.name}>{p.name || "Unnamed"}</h3>
                <div style={ui.meta}>
                  {[p.role, p.company].filter(Boolean).join(" • ")}
                </div>
                {p.notes && <div style={ui.note}>{truncate(p.notes, 200)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {count === 0 && !loading && !err && (
        <div style={ui.hint}>
          📝 No people parsed yet. Paste a team/speakers URL and press Extract.
        </div>
      )}
    </div>
  );
}

/* =========================
   Content Analysis Agent
   ========================= */
function ContentAnalysisTile() {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);

    // Simulate analysis (replace with MindStudio API call)
    await new Promise(resolve => setTimeout(resolve, 1500));

    setResults({
      sentiment: "Positive",
      confidence: 0.87,
      keyTopics: ["Technology", "Innovation", "Growth"],
      wordCount: text.split(' ').length,
      readingTime: Math.ceil(text.split(' ').length / 200)
    });
    setLoading(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); if (text.trim()) analyze(); }
  };

  return (
    <div style={ui.card}>
      <div style={ui.head}>
        <h2 style={{...ui.title, display: 'flex', alignItems: 'center'}}>
          📊 Content Analysis
          {results && <span style={ui.count}>analyzed</span>}
        </h2>
      </div>

      <div style={{marginBottom: 16}}>
        <textarea
          style={{
            ...ui.input,
            ...(inputFocused ? ui.inputFocus : {}),
            minHeight: 120,
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Paste your content here for analysis... (Ctrl+Enter to analyze)"
        />
      </div>

      <button
        type="button"
        style={{
          ...ui.btnBlue,
          ...((!text.trim() || loading) ? ui.btnDisabled : {}),
          width: '100%'
        }}
        disabled={!text.trim() || loading}
        onClick={analyze}
      >
        {loading ? "🔄 Analyzing..." : "Analyze Content"}
      </button>

      {results && (
        <div style={{marginTop: 16}}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12,
            marginBottom: 16
          }}>
            <div style={{
              background: '#f0f9ff',
              padding: '12px',
              borderRadius: 8,
              textAlign: 'center',
              border: '1px solid #e0f2fe'
            }}>
              <div style={{fontSize: 12, color: '#0369a1', fontWeight: 600}}>SENTIMENT</div>
              <div style={{fontSize: 16, fontWeight: 700, color: '#0f172a'}}>{results.sentiment}</div>
              <div style={{fontSize: 10, color: '#64748b'}}>{Math.round(results.confidence * 100)}% confidence</div>
            </div>
            <div style={{
              background: '#f0fdf4',
              padding: '12px',
              borderRadius: 8,
              textAlign: 'center',
              border: '1px solid #dcfce7'
            }}>
              <div style={{fontSize: 12, color: '#166534', fontWeight: 600}}>WORDS</div>
              <div style={{fontSize: 16, fontWeight: 700, color: '#0f172a'}}>{results.wordCount}</div>
              <div style={{fontSize: 10, color: '#64748b'}}>{results.readingTime} min read</div>
            </div>
          </div>
          <div>
            <div style={{fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 8}}>KEY TOPICS</div>
            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
              {results.keyTopics.map((topic, i) => (
                <span key={i} style={{
                  background: '#ede9fe',
                  color: '#6d28d9',
                  padding: '4px 8px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Market Research Agent
   ========================= */
function MarketResearchTile() {
  const [company, setCompany] = useState("");
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const research_company = async () => {
    if (!company.trim() || loading) return;
    setLoading(true);

    // Simulate research (replace with MindStudio API call)
    await new Promise(resolve => setTimeout(resolve, 2000));

    setResearch({
      companyName: company,
      industry: "Technology",
      marketCap: "$2.1B",
      employees: "5,000-10,000",
      headquarters: "San Francisco, CA",
      competitors: ["Competitor A", "Competitor B", "Competitor C"],
      recentNews: [
        "Company announces new product line expansion",
        "Strategic partnership with major tech firm",
        "Q3 earnings beat expectations by 15%"
      ]
    });
    setLoading(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); if (company.trim()) research_company(); }
  };

  return (
    <div style={ui.card}>
      <div style={ui.head}>
        <h2 style={{...ui.title, display: 'flex', alignItems: 'center'}}>
          🔍 Market Research
          {research && <span style={ui.count}>researched</span>}
        </h2>
      </div>

      <div style={ui.row}>
        <input
          style={{
            ...ui.input,
            ...(inputFocused ? ui.inputFocus : {})
          }}
          value={company}
          onChange={e => setCompany(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Enter company name..."
        />
        <button
          type="button"
          style={{
            ...ui.btnBlue,
            ...((!company.trim() || loading) ? ui.btnDisabled : {}),
          }}
          disabled={!company.trim() || loading}
          onClick={research_company}
        >
          {loading ? "🔄 Researching..." : "Research"}
        </button>
      </div>

      {research && (
        <div style={{marginTop: 20}}>
          <div style={{
            background: '#f8fafc',
            padding: '16px',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            marginBottom: 16
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: 18,
              fontWeight: 700,
              color: '#0f172a'
            }}>{research.companyName}</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 8,
              fontSize: 12,
              color: '#64748b'
            }}>
              <div><strong>Industry:</strong> {research.industry}</div>
              <div><strong>Market Cap:</strong> {research.marketCap}</div>
              <div><strong>Employees:</strong> {research.employees}</div>
              <div><strong>HQ:</strong> {research.headquarters}</div>
            </div>
          </div>

          <div style={{marginBottom: 16}}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              margin: '0 0 8px 0'
            }}>Key Competitors</h4>
            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
              {research.competitors.map((comp, i) => (
                <span key={i} style={{
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 8px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {comp}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#374151',
              margin: '0 0 8px 0'
            }}>Recent News</h4>
            <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
              {research.recentNews.map((news, i) => (
                <div key={i} style={{
                  fontSize: 13,
                  color: '#475569',
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  borderRadius: 8,
                  borderLeft: '3px solid #3b82f6'
                }}>
                  • {news}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
   Email Assistant Agent
   ========================= */
function EmailAssistantTile() {
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [emailType, setEmailType] = useState("professional");

  const generateEmail = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);

    // Simulate email generation (replace with MindStudio API call)
    await new Promise(resolve => setTimeout(resolve, 1800));

    const emailTemplates = {
      professional: {
        subject: "Following up on our recent discussion",
        body: `Dear [Name],

I hope this email finds you well. I wanted to follow up on our recent discussion regarding ${prompt}.

I believe there are several opportunities we could explore together, and I'd love to schedule a time to discuss this further at your convenience.

Please let me know when you might be available for a brief call next week.

Best regards,
[Your Name]`
      },
      casual: {
        subject: "Quick follow-up",
        body: `Hi [Name]!

Hope you're doing great! I wanted to touch base about ${prompt} that we talked about.

Would love to catch up soon and see how we can move forward with this.

Let me know when you're free!

Cheers,
[Your Name]`
      },
      sales: {
        subject: "Exciting opportunity for [Company]",
        body: `Hello [Name],

I hope you're having a fantastic day! I'm reaching out because I believe we have an exciting opportunity related to ${prompt}.

Our solution has helped similar companies achieve remarkable results, and I'd love to share how we could potentially help [Company] as well.

Would you be interested in a 15-minute conversation to explore this further?

Looking forward to hearing from you.

Best,
[Your Name]`
      }
    };

    setEmail(emailTemplates[emailType]);
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); if (prompt.trim()) generateEmail(); }
  };

  return (
    <div style={ui.card}>
      <div style={ui.head}>
        <h2 style={{...ui.title, display: 'flex', alignItems: 'center'}}>
          ✉️ Email Assistant
          {email && <span style={ui.count}>generated</span>}
        </h2>
      </div>

      <div style={{marginBottom: 16}}>
        <div style={{marginBottom: 12}}>
          <label style={{fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block'}}>
            Email Type
          </label>
          <select
            value={emailType}
            onChange={e => setEmailType(e.target.value)}
            style={{
              ...ui.input,
              cursor: 'pointer'
            }}
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="sales">Sales</option>
          </select>
        </div>
        <textarea
          style={{
            ...ui.input,
            ...(inputFocused ? ui.inputFocus : {}),
            minHeight: 80,
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Describe what your email should be about... (Ctrl+Enter to generate)"
        />
      </div>

      <button
        type="button"
        style={{
          ...ui.btnBlue,
          ...((!prompt.trim() || loading) ? ui.btnDisabled : {}),
          width: '100%'
        }}
        disabled={!prompt.trim() || loading}
        onClick={generateEmail}
      >
        {loading ? "✨ Generating..." : "Generate Email"}
      </button>

      {email && (
        <div style={{marginTop: 20}}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 16px',
              background: '#e2e8f0',
              borderBottom: '1px solid #cbd5e1',
              fontWeight: 600,
              fontSize: 14,
              color: '#374151'
            }}>
              Subject: {email.subject}
            </div>
            <div style={{
              padding: '16px',
              whiteSpace: 'pre-line',
              fontSize: 14,
              lineHeight: 1.6,
              color: '#374151'
            }}>
              {email.body}
            </div>
          </div>
          <button
            onClick={copyToClipboard}
            style={{
              ...ui.btnBlue,
              background: '#10b981',
              marginTop: 12,
              width: '100%',
              fontSize: 13
            }}
          >
            📋 Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

/* =========================
   Enhanced App with Responsive Design
   ========================= */
export default function App() {
  const [screenSize, setScreenSize] = useState('md');

  // Responsive layout detection
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) setScreenSize('lg');
      else if (width >= 768) setScreenSize('md');
      else setScreenSize('sm');
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allOk = useMemo(
    () => Boolean(API && API_KEY_DEFAULT && APP_ID_NEWS && WF_NEWS && APP_ID_PEOPLE && WF_PEOPLE),
    []
  );

  // Select appropriate grid layout
  const getGridStyle = () => {
    switch (screenSize) {
      case 'lg': return ui.gridLg;
      case 'md': return ui.gridMd;
      default: return ui.grid;
    }
  };

  return (
    <ErrorBoundary>
      <div style={ui.page}>
        <div style={ui.container}>
          <h1 style={ui.header}>MindStudio Dashboard (Lite)</h1>

          {/* Status indicator */}
          {allOk && (
            <div style={{
              textAlign: 'center',
              marginBottom: 24,
              padding: '8px 16px',
              background: '#dcfce7',
              color: '#166534',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              border: '1px solid #bbf7d0'
            }}>
              ✅ All systems connected and ready
            </div>
          )}

          <div style={screenSize === 'sm' ? ui.grid : ui.gridMd}>
            <NewsTile />
            <PeopleTile />
          </div>

          {!allOk && (
            <div style={{
              color: "#dc2626",
              fontSize: 14,
              marginTop: 20,
              padding: "12px 16px",
              background: "#fee2e2",
              borderRadius: 12,
              border: "1px solid #fecaca",
              textAlign: "center"
            }}>
              ⚠️ <strong>Configuration needed:</strong> Check your <code style={{
                background: "#fef2f2",
                padding: "2px 6px",
                borderRadius: 4,
                fontFamily: "monospace"
              }}>.env</code> file and restart the dev server.
            </div>
          )}

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: 48,
            padding: '20px 0',
            borderTop: '1px solid #e2e8f0',
            color: '#64748b',
            fontSize: 14
          }}>
            <p style={{ margin: 0 }}>
              Built with ⚡ <strong>MindStudio API</strong> • Enhanced dashboard experience
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}