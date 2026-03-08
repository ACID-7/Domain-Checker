import { useState, useEffect, useRef } from "react";

/* ─── data ─── */
const EXTENSIONS = [
  { ext: ".com",      label: "Commercial",              popular: true,  site: "namecheap.com",   siteUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${d}` },
  { ext: ".io",       label: "Tech / Startups",         popular: true,  site: "namecheap.com",   siteUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${d}` },
  { ext: ".dev",      label: "Developer",               popular: true,  site: "get.dev",         siteUrl: (d) => `https://get.dev` },
  { ext: ".co",       label: "Company",                 popular: true,  site: "namecheap.com",   siteUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${d}` },
  { ext: ".net",      label: "Network",                 popular: false, site: "godaddy.com",     siteUrl: (d) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${d}` },
  { ext: ".ai",       label: "Artificial Intelligence", popular: true,  site: "nic.ai",          siteUrl: (d) => `https://nic.ai` },
  { ext: ".app",      label: "Application",             popular: false, site: "porkbun.com",     siteUrl: (d) => `https://porkbun.com/checkout/search?q=${d}` },
  { ext: ".tech",     label: "Technology",              popular: false, site: "get.tech",        siteUrl: (d) => `https://get.tech/domain-registration?domain=${d}` },
  { ext: ".cloud",    label: "Cloud Services",          popular: false, site: "namecheap.com",   siteUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${d}` },
  { ext: ".software", label: "Software",                popular: false, site: "namecheap.com",   siteUrl: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${d}` },
  { ext: ".lk",       label: "Sri Lanka",               popular: false, site: "domains.nic.lk",  siteUrl: (d) => `https://domains.nic.lk` },
];

const REGISTRARS = [
  {
    name: "Namecheap",
    icon: "🐱",
    tagline: "Best value & free WhoisGuard",
    color: "#ff6b35",
    url: (d) => `https://www.namecheap.com/domains/registration/results/?domain=${d}`,
    supportedExtensions: [".com", ".io", ".co", ".net", ".cloud", ".software", ".app", ".lk"],
  },
  {
    name: "GoDaddy",
    icon: "🐐",
    tagline: "World's largest domain registrar",
    color: "#1bdbdb",
    url: (d) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${d}`,
    supportedExtensions: [".com", ".io", ".co", ".net", ".app", ".lk"],
  },
  {
    name: "Google Domains",
    icon: "🌐",
    tagline: "Clean interface, Google reliability",
    color: "#4285f4",
    url: (d) => `https://domains.google.com/registrar/search?searchTerm=${d}`,
    supportedExtensions: [".com", ".io", ".co", ".net", ".app", ".dev"],
  },
  {
    name: "Porkbun",
    icon: "🐷",
    tagline: "Affordable prices + free extras",
    color: "#f871a0",
    url: (d) => `https://porkbun.com/checkout/search?q=${d}`,
    supportedExtensions: [".com", ".io", ".co", ".net", ".app", ".dev"],
  },
  {
    name: "Cloudflare Registrar",
    icon: "☁️",
    tagline: "At-cost pricing, no markup",
    color: "#f6821f",
    url: (d) => `https://www.cloudflare.com/products/registrar/`,
    supportedExtensions: [".com", ".net", ".io", ".co", ".app"],
  },
  {
    name: "Hover",
    icon: "🎯",
    tagline: "Simple & clean, no upsells",
    color: "#7c5cbf",
    url: (d) => `https://www.hover.com/domains/results?q=${d}`,
    supportedExtensions: [".com", ".io", ".co", ".net", ".app", ".dev"],
  },
  {
    name: "NIC.LK (Official)",
    icon: "🇱🇰",
    tagline: "Sri Lanka official registry",
    color: "#ff9933",
    url: (d) => `https://domains.nic.lk`,
    supportedExtensions: [".lk"],
  },
];

const SUGGESTIONS = ["Nexbit","Clariva","Quanrix","Devlyx","Syntiq","Veltrix","Codexa","Lumisys"];

/* ─── helpers ─── */
function checkDomain(name, ext) {
  if (!name || name.length < 2) return null;
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const seed  = (clean + ext).split("").reduce((a, c, i) => a + c.charCodeAt(0) * (i + 7), 0);
  const val   = ((seed * 1664525 + 1013904223) >>> 0) % 100;
  if (ext === ".com") return val > 55;
  if (ext === ".io" || ext === ".ai") return val > 40;
  return val > 30;
}

function getPrice(ext) {
  const p = {
    ".com":"$12/yr",".io":"$39/yr",".dev":"$15/yr",".co":"$28/yr",".net":"$14/yr",
    ".ai":"$79/yr",".app":"$19/yr",".tech":"$35/yr",".cloud":"$25/yr",".software":"$45/yr",".lk":"$15/yr",
  };
  return p[ext] || "$20/yr";
}

/* ─── Registrar Modal ─── */
function RegistrarModal({ domain, onClose }) {
  const ext = domain && domain.includes(".") ? "." + domain.split(".").pop() : "";
  const registrars = REGISTRARS.filter((r) => r.supportedExtensions && r.supportedExtensions.includes(ext));
  const list = registrars.length > 0 ? registrars : REGISTRARS;

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:1000,
        background:"rgba(3,3,12,0.88)",
        backdropFilter:"blur(14px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:24,
        animation:"fadeIn 0.18s ease both",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:"#0d0d20",
          border:"1px solid #00ff8828",
          borderRadius:22,
          padding:"32px 28px",
          width:"100%", maxWidth:500,
          boxShadow:"0 40px 80px rgba(0,0,0,0.7),0 0 60px #00ff8810",
          animation:"popUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <p style={{ fontSize:10, color:"#00ff88", letterSpacing:"3px", marginBottom:7, fontFamily:"'DM Mono',monospace" }}>
              CHOOSE A REGISTRAR
            </p>
            <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-0.5px" }}>
              {domain}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background:"#ffffff08", border:"1px solid #ffffff12",
              color:"#666", borderRadius:9, width:36, height:36,
              fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
            }}
          >×</button>
        </div>

        <p style={{ fontSize:13, color:"#505068", marginBottom:20, fontFamily:"'Outfit',sans-serif", fontWeight:400, lineHeight:1.5 }}>
          Pick a registrar — you'll be redirected directly to the search page for <strong style={{ color:"#888", fontWeight:600 }}>{domain}</strong>
        </p>

        {/* registrar list */}
        <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
          {list.map((r) => (
            <button
              key={r.name}
              onClick={() => { window.open(r.url(domain), "_blank"); onClose(); }}
              style={{
                display:"flex", alignItems:"center", gap:14,
                background:"#ffffff05",
                border:"1px solid #ffffff08",
                borderRadius:12, padding:"13px 16px",
                textAlign:"left", width:"100%",
                transition:"all 0.16s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${r.color}14`;
                e.currentTarget.style.borderColor = `${r.color}38`;
                e.currentTarget.style.transform = "translateX(5px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#ffffff05";
                e.currentTarget.style.borderColor = "#ffffff08";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div style={{
                width:40, height:40, borderRadius:10, flexShrink:0,
                background:`${r.color}16`, border:`1px solid ${r.color}28`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
              }}>{r.icon}</div>

              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:15, color:"#fff", marginBottom:2 }}>
                  {r.name}
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#404058" }}>
                  {r.tagline}
                </div>
              </div>

              <span style={{ color:"#2a2a40", fontSize:16 }}>→</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign:"center", marginTop:18, fontSize:10, color:"#1e1e30", fontFamily:"'DM Mono',monospace", letterSpacing:"1px" }}>
          PRESS ESC OR CLICK OUTSIDE TO CLOSE
        </p>
      </div>
    </div>
  );
}

/* ─── Domain Row ─── */
function DomainRow({ r, inputName, index, onRegister }) {
  const slug = inputName.toLowerCase().replace(/\s+/g, "");
  return (
    <div
      className="row-enter"
      style={{
        animationDelay:`${index * 0.045}s`,
        background: r.available ? "linear-gradient(135deg,#00ff8807,#00ff8802)" : "#0b0b1d",
        border:`1px solid ${r.available ? "#00ff8825" : "#14142a"}`,
        borderRadius:14, padding:"17px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
        position:"relative", overflow:"hidden",
        transition:"transform 0.15s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
    >
      {/* left bar */}
      <div style={{
        position:"absolute", left:0, top:"22%", bottom:"22%", width:3,
        background: r.available ? "#00ff88" : "#ff4466",
        borderRadius:"0 2px 2px 0",
      }} />

      <div style={{ display:"flex", alignItems:"center", gap:14, flex:1, paddingLeft:10 }}>
        {/* status badge */}
        <div style={{
          width:36, height:36, borderRadius:9, flexShrink:0,
          background: r.available ? "#00ff8812" : "#ff446612",
          border:`1px solid ${r.available ? "#00ff8826" : "#ff446626"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:14,
          color: r.available ? "#00ff88" : "#ff4466",
        }}>
          {r.available ? "✓" : "✗"}
        </div>

        {/* name */}
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, letterSpacing:"-0.4px" }}>
              <span style={{ color: r.available ? "#d8d8f0" : "#2e2e50" }}>{slug}</span>
              <span style={{ color: r.available ? "#00ff88" : "#ff4466" }}>{r.ext}</span>
            </span>
            {r.popular && (
              <span style={{
                fontSize:9, letterSpacing:"1.5px", color:"#555",
                background:"#ffffff06", border:"1px solid #1c1c2e",
                borderRadius:4, padding:"2px 7px",
                fontFamily:"'DM Mono',monospace",
              }}>POPULAR</span>
            )}
          </div>
          <div style={{ fontSize:12, color:"#363650", marginTop:3, fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", gap:8 }}>
            <span>{r.label}</span>
            <span style={{ color:"#2a2a48" }}>·</span>
            <a
              href={r.siteUrl(slug + r.ext)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                color: r.available ? "#00ff8860" : "#363650",
                textDecoration:"none",
                transition:"color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = r.available ? "#00ff88" : "#666"}
              onMouseLeave={e => e.currentTarget.style.color = r.available ? "#00ff8860" : "#363650"}
            >{r.site}</a>
          </div>
        </div>
      </div>

      {/* right */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        {r.available ? (
          <>
            <span style={{
              fontFamily:"'DM Mono',monospace", fontSize:12,
              color:"#00ff8875", background:"#00ff880e",
              border:"1px solid #00ff881c", borderRadius:6, padding:"4px 10px",
            }}>{r.price}</span>
            <button
              onClick={() => onRegister(`${slug}${r.ext}`)}
              style={{
                background:"linear-gradient(135deg,#00ff8820,#00ff880e)",
                border:"1px solid #00ff8835",
                color:"#00ff88", borderRadius:9,
                padding:"9px 20px",
                fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, letterSpacing:"0.2px",
                transition:"all 0.16s ease", whiteSpace:"nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="#00ff8825"; e.currentTarget.style.boxShadow="0 0 20px #00ff8822"; e.currentTarget.style.transform="scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#00ff8820,#00ff880e)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.transform="scale(1)"; }}
            >
              Register →
            </button>
          </>
        ) : (
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#ff446645", letterSpacing:"1px" }}>TAKEN</span>
        )}
      </div>
    </div>
  );
}

function FilterBtn({ label, colorKey, active, onClick }) {
  const m = {
    all:       { a:"#ffffff15", b:"#3a3a5a", t:"#ccc"    },
    available: { a:"#00ff8818", b:"#00ff8838", t:"#00ff88" },
    taken:     { a:"#ff446618", b:"#ff446638", t:"#ff4466" },
  };
  const c = m[colorKey];
  return (
    <button onClick={onClick} style={{
      background: active ? c.a : "transparent",
      border:`1px solid ${active ? c.b : "#1a1a30"}`,
      color: active ? c.t : "#3a3a5a",
      borderRadius:7, padding:"5px 14px",
      fontFamily:"'DM Mono',monospace", fontSize:10,
      letterSpacing:"1.5px", textTransform:"uppercase", transition:"all 0.16s",
    }}>{label}</button>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [input,       setInput]       = useState("");
  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [checked,     setChecked]     = useState(false);
  const [filterAvail, setFilterAvail] = useState("all");
  const [animKey,     setAnimKey]     = useState(0);
  const [modalDomain, setModalDomain] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim() || input.trim().length < 2) {
      setResults([]); setChecked(false); setLoading(false); return;
    }
    setLoading(true); setChecked(false); setAnimKey(k => k + 1);
    debounceRef.current = setTimeout(() => {
      const name = input.trim();
      setResults(EXTENSIONS.map(({ ext, label, popular, site, siteUrl }) => ({
        ext, label, popular, site, siteUrl, available: checkDomain(name, ext), price: getPrice(ext),
      })));
      setLoading(false); setChecked(true);
    }, 520);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  const filtered   = results.filter(r =>
    filterAvail === "available" ? r.available :
    filterAvail === "taken"     ? !r.available : true
  );
  const availCount = results.filter(r =>  r.available).length;
  const takenCount = results.filter(r => !r.available).length;

  return (
    <div style={{ minHeight:"100vh", background:"#05050f", color:"#fff", fontFamily:"'Outfit',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        input::placeholder { color:#252540; font-family:'Outfit',sans-serif; font-weight:400; }
        input:focus { outline:none; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#0a0a18; }
        ::-webkit-scrollbar-thumb { background:#1a1a30; border-radius:2px; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes scanline{ 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes popUp   { from{opacity:0;transform:scale(0.9) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes rowIn   { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        .row-enter { animation: rowIn 0.32s ease both; }
        button { cursor:pointer; }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse 70% 50% at 50% -5%,#00ff8808,transparent),radial-gradient(ellipse 50% 40% at 85% 85%,#0066ff05,transparent)" }} />
      {/* Scanline */}
      <div style={{ position:"fixed",top:0,left:0,right:0,height:2,zIndex:1,pointerEvents:"none",
        background:"linear-gradient(90deg,transparent,#00ff8815,transparent)",
        animation:"scanline 9s linear infinite" }} />

      <div style={{ position:"relative",zIndex:2,maxWidth:740,margin:"0 auto",padding:"56px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:48, animation:"fadeUp 0.5s ease both" }}>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:8,
            background:"#00ff880d",border:"1px solid #00ff8820",
            borderRadius:20,padding:"5px 16px",
            fontSize:10,color:"#00ff88",letterSpacing:"3px",marginBottom:22,
            fontFamily:"'DM Mono',monospace",
          }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#00ff88",animation:"blink 1.6s infinite",display:"inline-block" }} />
            DOMAIN AVAILABILITY CHECKER
          </div>
          <h1 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:"clamp(54px,10vw,100px)",
            letterSpacing:"3px", lineHeight:0.92, color:"#fff", marginBottom:16,
          }}>
            CHECK YOUR<br />
            <span style={{
              background:"linear-gradient(90deg,#00ff88,#00ddff,#00ff88)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              animation:"shimmer 3s linear infinite",
            }}>DOMAIN NAME</span>
          </h1>
          <p style={{ color:"#4a4a6a", fontSize:15, fontWeight:400, letterSpacing:"0.2px" }}>
            Type any company name — check availability across {EXTENSIONS.length} extensions instantly
          </p>
        </div>

        {/* Search */}
        <div style={{ animation:"fadeUp 0.5s ease 0.1s both", marginBottom:14 }}>
          <div style={{
            display:"flex",alignItems:"center",
            background:"#0a0a1c",
            border:`2px solid ${input.length>1 ? "#00ff8835" : "#14142a"}`,
            borderRadius:16,padding:"6px 6px 6px 22px",
            transition:"border-color 0.3s,box-shadow 0.3s",
            boxShadow: input.length>1 ? "0 0 40px #00ff8810" : "none",
          }}>
            <span style={{ fontSize:20,marginRight:12,opacity:0.25 }}>⌕</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your company name…"
              style={{
                flex:1,background:"transparent",border:"none",
                color:"#fff",fontSize:22,
                fontFamily:"'Outfit',sans-serif",fontWeight:700,
                letterSpacing:"-0.4px",padding:"10px 0",
              }}
            />
            {loading && (
              <div style={{
                width:20,height:20,borderRadius:"50%",marginRight:16,flexShrink:0,
                border:"2px solid #00ff8820",borderTop:"2px solid #00ff88",
                animation:"spin 0.7s linear infinite",
              }} />
            )}
            {input && (
              <button onClick={() => setInput("")} style={{
                background:"#10102a",border:"1px solid #20203a",
                color:"#444",borderRadius:8,width:36,height:36,
                fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              }}>×</button>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {!input && (
          <div style={{ animation:"fadeUp 0.5s ease 0.2s both", marginBottom:44 }}>
            <p style={{ color:"#22223a",fontSize:11,letterSpacing:"2px",marginBottom:12,fontFamily:"'DM Mono',monospace" }}>TRY THESE →</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  background:"#0d0d20",border:"1px solid #18183a",
                  color:"#505068",borderRadius:9,padding:"8px 18px",
                  fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:13,
                  transition:"all 0.16s",
                }}
                onMouseEnter={e=>{ e.target.style.borderColor="#00ff8830"; e.target.style.color="#00ff88"; e.target.style.background="#00ff8806"; }}
                onMouseLeave={e=>{ e.target.style.borderColor="#18183a"; e.target.style.color="#505068"; e.target.style.background="#0d0d20"; }}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Stats + Filters */}
        {checked && (
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:18,animation:"fadeUp 0.3s ease both" }}>
            <div style={{ display:"flex",gap:14,alignItems:"center",flexWrap:"wrap" }}>
              <span style={{ fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,color:"#fff" }}>
                "{input.toLowerCase().replace(/\s+/g,"")}"
              </span>
              <span style={{ fontSize:12,color:"#00ff88",fontFamily:"'DM Mono',monospace" }}>✓ {availCount} free</span>
              <span style={{ fontSize:12,color:"#ff4466",fontFamily:"'DM Mono',monospace" }}>✗ {takenCount} taken</span>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              <FilterBtn label="All"       colorKey="all"       active={filterAvail==="all"}       onClick={()=>setFilterAvail("all")} />
              <FilterBtn label="Available" colorKey="available" active={filterAvail==="available"} onClick={()=>setFilterAvail("available")} />
              <FilterBtn label="Taken"     colorKey="taken"     active={filterAvail==="taken"}     onClick={()=>setFilterAvail("taken")} />
            </div>
          </div>
        )}

        {/* Results */}
        {checked && (
          <div key={animKey} style={{ display:"flex",flexDirection:"column",gap:9 }}>
            {filtered.map((r,i) => (
              <DomainRow key={r.ext} r={r} inputName={input} index={i} onRegister={setModalDomain} />
            ))}
          </div>
        )}

        {/* Skeleton */}
        {loading && input.length>1 && (
          <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
            {EXTENSIONS.map((_,i) => (
              <div key={i} style={{
                background:"#0a0a1c",border:"1px solid #12122a",
                borderRadius:14,height:76,position:"relative",overflow:"hidden",
                animation:`fadeUp 0.3s ease ${i*0.04}s both`,
              }}>
                <div style={{
                  position:"absolute",inset:0,
                  background:"linear-gradient(90deg,transparent 0%,#ffffff05 50%,transparent 100%)",
                  backgroundSize:"200% 100%",animation:"shimmer 1.5s linear infinite",
                }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!input && !loading && (
          <div style={{ textAlign:"center",padding:"64px 0",animation:"fadeUp 0.5s ease 0.3s both" }}>
            <div style={{ fontSize:52,marginBottom:18,opacity:0.1 }}>⌕</div>
            <p style={{ color:"#1c1c30",fontFamily:"'DM Mono',monospace",fontSize:12,letterSpacing:"3px" }}>
              START TYPING TO CHECK DOMAINS
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:"center",marginTop:48,fontFamily:"'DM Mono',monospace",fontSize:10,color:"#1a1a2e",letterSpacing:"1px",lineHeight:"1.9" }}>
          ⚠ AVAILABILITY IS SIMULATED — VERIFY ON YOUR CHOSEN REGISTRAR BEFORE PURCHASING
        </div>
      </div>

      {/* Modal */}
      {modalDomain && (
        <RegistrarModal domain={modalDomain} onClose={() => setModalDomain(null)} />
      )}
    </div>
  );
}
