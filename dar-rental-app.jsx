import { useState } from "react";

const listings = [
  {
    id: 1,
    title: "Modern 2BR Apartment",
    location: "Msasani Peninsula",
    neighbourhood: "Msasani",
    price: 850000,
    bedrooms: 2,
    bathrooms: 2,
    type: "Apartment",
    amenities: ["WiFi", "Security", "Parking", "Generator"],
    agent: "Amina Khalid",
    agentPhone: "+255712345678",
    available: true,
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    desc: "Bright, modern apartment with ocean views. Fully tiled, fitted kitchen, 24hr security and backup generator."
  },
  {
    id: 2,
    title: "Spacious 3BR House",
    location: "Mikocheni B",
    neighbourhood: "Mikocheni",
    price: 1200000,
    bedrooms: 3,
    bathrooms: 2,
    type: "House",
    amenities: ["Garden", "Parking", "Security", "Borehole"],
    agent: "James Mwangi",
    agentPhone: "+255756789012",
    available: true,
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    desc: "Large family home with a lush garden. Quiet neighbourhood close to international schools and shopping."
  },
  {
    id: 3,
    title: "Cosy Studio Flat",
    location: "Kariakoo",
    neighbourhood: "Kariakoo",
    price: 280000,
    bedrooms: 1,
    bathrooms: 1,
    type: "Studio",
    amenities: ["WiFi", "Security"],
    agent: "Fatuma Salim",
    agentPhone: "+255787654321",
    available: true,
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80",
    desc: "Affordable, clean studio in the heart of Kariakoo. Walking distance to Kariakoo market and public transport."
  },
  {
    id: 4,
    title: "Executive 4BR Villa",
    location: "Mbezi Beach",
    neighbourhood: "Mbezi",
    price: 3500000,
    bedrooms: 4,
    bathrooms: 3,
    type: "Villa",
    amenities: ["Pool", "WiFi", "Security", "Parking", "Generator", "Garden"],
    agent: "Amina Khalid",
    agentPhone: "+255712345678",
    available: true,
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
    desc: "Luxury beachside villa with private pool. Perfect for expats and executives. Fully furnished option available."
  },
  {
    id: 5,
    title: "1BR Furnished Apartment",
    location: "Oyster Bay",
    neighbourhood: "Oyster Bay",
    price: 650000,
    bedrooms: 1,
    bathrooms: 1,
    type: "Apartment",
    amenities: ["WiFi", "Furnished", "Security", "Parking"],
    agent: "David Oleksy",
    agentPhone: "+255765432100",
    available: true,
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    desc: "Fully furnished one-bedroom in prestigious Oyster Bay. Close to embassies, restaurants and the Coco Beach."
  },
  {
    id: 6,
    title: "Budget Room & Parlour",
    location: "Kinondoni",
    neighbourhood: "Kinondoni",
    price: 180000,
    bedrooms: 1,
    bathrooms: 1,
    type: "Room",
    amenities: ["Security"],
    agent: "Rehema Juma",
    agentPhone: "+255711223344",
    available: true,
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    desc: "Clean, affordable room and sitting area in Kinondoni. Shared compound with reliable water supply."
  }
];

const neighbourhoods = ["All", "Msasani", "Mikocheni", "Kariakoo", "Mbezi", "Oyster Bay", "Kinondoni"];
const types = ["All", "Apartment", "House", "Villa", "Studio", "Room"];

function formatTZS(n) {
  return "Tsh " + n.toLocaleString("en-TZ");
}

function AmenityTag({ label }) {
  const icons = {
    WiFi: "📶", Security: "🔒", Parking: "🚗", Generator: "⚡",
    Garden: "🌿", Borehole: "💧", Pool: "🏊", Furnished: "🛋️"
  };
  return (
    <span style={{
      background: "#f0fdf4", color: "#15803d", fontSize: 11,
      borderRadius: 20, padding: "2px 9px", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 3, border: "1px solid #bbf7d0"
    }}>
      {icons[label] || "✓"} {label}
    </span>
  );
}

function ListingCard({ listing, onClick }) {
  return (
    <div onClick={() => onClick(listing)} style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer",
      transition: "transform 0.18s, box-shadow 0.18s",
      border: "1px solid #f1f5f9"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.13)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
    >
      <div style={{ position: "relative" }}>
        <img src={listing.img} alt={listing.title} style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }} />
        <span style={{
          position: "absolute", top: 12, left: 12, background: "#16a34a",
          color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 8,
          padding: "3px 10px", letterSpacing: 0.5
        }}>{listing.type}</span>
        <span style={{
          position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.55)",
          color: "#fff", fontSize: 12, fontWeight: 600, borderRadius: 8,
          padding: "3px 10px", backdropFilter: "blur(4px)"
        }}>
          {listing.bedrooms} BR
        </span>
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
          {listing.title}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
          <span>📍</span>{listing.location}
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#16a34a", marginBottom: 10 }}>
          {formatTZS(listing.price)}<span style={{ fontWeight: 400, fontSize: 12, color: "#94a3b8" }}>/mo</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {listing.amenities.slice(0, 3).map(a => <AmenityTag key={a} label={a} />)}
          {listing.amenities.length > 3 && (
            <span style={{ fontSize: 11, color: "#94a3b8", alignSelf: "center" }}>+{listing.amenities.length - 3} more</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({ listing, onClose }) {
  if (!listing) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)",
      zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)", padding: 16
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, maxWidth: 560, width: "100%",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative" }}>
          <img src={listing.img} alt={listing.title} style={{ width: "100%", height: 240, objectFit: "cover", borderRadius: "20px 20px 0 0", display: "block" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14, background: "rgba(0,0,0,0.5)",
            border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff",
            fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>✕</button>
          <span style={{
            position: "absolute", top: 14, left: 14, background: "#16a34a",
            color: "#fff", fontSize: 12, fontWeight: 700, borderRadius: 8, padding: "4px 12px"
          }}>{listing.type}</span>
        </div>
        <div style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", margin: "0 0 6px", fontSize: 22, color: "#1e293b" }}>{listing.title}</h2>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
            📍 {listing.location}, Dar es Salaam
          </div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <span style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#475569" }}>🛏 {listing.bedrooms} Bed</span>
            <span style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#475569" }}>🚿 {listing.bathrooms} Bath</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 26, color: "#16a34a", marginBottom: 14 }}>
            {formatTZS(listing.price)}<span style={{ fontWeight: 400, fontSize: 14, color: "#94a3b8" }}>/month</span>
          </div>
          <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{listing.desc}</p>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Amenities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {listing.amenities.map(a => <AmenityTag key={a} label={a} />)}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Listed by</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>{listing.agent}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>Verified Agent</div>
              </div>
              <a
                href={`https://wa.me/${listing.agentPhone.replace(/\D/g, "")}?text=Hi, I'm interested in your listing: ${encodeURIComponent(listing.title)} in ${encodeURIComponent(listing.location)}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  background: "#25D366", color: "#fff", padding: "11px 22px",
                  borderRadius: 12, fontWeight: 700, fontSize: 14,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 8
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp Agent
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home"); // home | listings | agent
  const [selected, setSelected] = useState(null);
  const [neighbourhood, setNeighbourhood] = useState("All");
  const [type, setType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [search, setSearch] = useState("");
  const [agentForm, setAgentForm] = useState({ name: "", agency: "", phone: "", email: "", password: "" });
  const [agentSubmitted, setAgentSubmitted] = useState(false);

  const filtered = listings.filter(l => {
    const matchN = neighbourhood === "All" || l.neighbourhood === neighbourhood;
    const matchT = type === "All" || l.type === type;
    const matchP = l.price <= maxPrice;
    const matchS = l.title.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase());
    return matchN && matchT && matchP && matchS;
  });

  return (
    <div style={{ fontFamily: "'Lato', 'Helvetica Neue', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lato:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {/* NAVBAR */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setView("home")}>
          <div style={{
            background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: 10,
            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: 18 }}>🏠</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 17, color: "#1e293b", lineHeight: 1 }}>NyumbaFinder</div>
            <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, letterSpacing: 0.5 }}>DAR ES SALAAM</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("listings")} style={{
            background: view === "listings" ? "#f0fdf4" : "transparent",
            color: view === "listings" ? "#16a34a" : "#64748b",
            border: view === "listings" ? "1px solid #bbf7d0" : "1px solid transparent",
            borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13
          }}>Browse Listings</button>
          <button onClick={() => setView("agent")} style={{
            background: "#16a34a", color: "#fff", border: "none",
            borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13
          }}>Agent Portal</button>
        </div>
      </nav>

      {/* HOME VIEW */}
      {view === "home" && (
        <div>
          {/* Hero */}
          <div style={{
            background: "linear-gradient(135deg, #052e16 0%, #14532d 50%, #16a34a 100%)",
            padding: "64px 24px", textAlign: "center", position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.04) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.06) 0%, transparent 50%)" }} />
            <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
              <div style={{ color: "#86efac", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Tanzania's #1 Rental Platform</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 6vw, 52px)",
                color: "#fff", margin: "0 0 16px", lineHeight: 1.15
              }}>Find Your Perfect<br />Home in Dar es Salaam</h1>
              <p style={{ color: "#a7f3d0", fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
                Browse verified listings from trusted agents across Msasani, Mikocheni, Mbezi Beach and beyond.
              </p>
              <div style={{ display: "flex", gap: 10, maxWidth: 500, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
                <input
                  placeholder="Search by area or property name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    flex: 1, minWidth: 220, padding: "13px 18px", borderRadius: 12, border: "none",
                    fontSize: 14, outline: "none", background: "#fff"
                  }}
                />
                <button onClick={() => setView("listings")} style={{
                  background: "#f97316", color: "#fff", border: "none",
                  borderRadius: 12, padding: "13px 24px", fontWeight: 800, fontSize: 14, cursor: "pointer"
                }}>Search</button>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{
            background: "#fff", borderBottom: "1px solid #f1f5f9",
            display: "flex", justifyContent: "center", gap: "5%", padding: "20px 24px", flexWrap: "wrap"
          }}>
            {[["120+", "Active Listings"], ["45+", "Verified Agents"], ["8", "Neighbourhoods"], ["⭐ 4.8", "Agent Rating"]].map(([val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 22, color: "#16a34a" }}>{val}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Featured */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1e293b", margin: 0 }}>Featured Listings</h2>
              <button onClick={() => setView("listings")} style={{
                color: "#16a34a", background: "none", border: "1px solid #16a34a",
                borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13
              }}>View All →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
              {listings.slice(0, 3).map(l => <ListingCard key={l.id} listing={l} onClick={setSelected} />)}
            </div>
          </div>

          {/* Neighbourhood quick picks */}
          <div style={{ background: "#fff", padding: "40px 20px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: "#1e293b", marginBottom: 20 }}>Browse by Neighbourhood</h2>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {neighbourhoods.filter(n => n !== "All").map(n => (
                  <button key={n} onClick={() => { setNeighbourhood(n); setView("listings"); }} style={{
                    background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                    borderRadius: 12, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14
                  }}>📍 {n}</button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA for agents */}
          <div style={{
            background: "linear-gradient(135deg, #1e293b, #334155)",
            padding: "48px 24px", textAlign: "center"
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: 26, marginBottom: 12 }}>Are you a Property Agent?</h2>
            <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 15 }}>Join NyumbaFinder and reach thousands of renters across Dar es Salaam.</p>
            <button onClick={() => setView("agent")} style={{
              background: "#16a34a", color: "#fff", border: "none",
              borderRadius: 12, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer"
            }}>Register as an Agent →</button>
          </div>
        </div>
      )}

      {/* LISTINGS VIEW */}
      {view === "listings" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#1e293b", marginBottom: 20 }}>
            Houses for Rent in Dar es Salaam
          </h1>

          {/* Filters */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 24,
            boxShadow: "0 1px 6px rgba(0,0,0,0.07)", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end"
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>Search</label>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Area or name..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>Neighbourhood</label>
              <select value={neighbourhood} onChange={e => setNeighbourhood(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
                {neighbourhoods.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>Property Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 13, background: "#fff", cursor: "pointer" }}>
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, display: "block", marginBottom: 5 }}>
                Max Price: {formatTZS(maxPrice)}/mo
              </label>
              <input type="range" min={150000} max={5000000} step={50000} value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: 160, accentColor: "#16a34a" }} />
            </div>
          </div>

          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 18, fontWeight: 600 }}>
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: 20 }}>
            {filtered.map(l => <ListingCard key={l.id} listing={l} onClick={setSelected} />)}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
                <div style={{ fontSize: 48 }}>🏚️</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>No listings match your filters</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search criteria</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AGENT PORTAL */}
      {view === "agent" && (
        <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 20px" }}>
          {!agentSubmitted ? (
            <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🏢</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#1e293b", margin: "0 0 6px" }}>Agent Registration</h2>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Register to list properties on NyumbaFinder. Our team will verify your account within 24hrs.</p>
              </div>
              {[
                ["name", "Full Name", "text", "e.g. Amina Khalid"],
                ["agency", "Agency / Company Name", "text", "e.g. Kilimani Properties"],
                ["phone", "Phone Number (WhatsApp)", "tel", "+255 7XX XXX XXX"],
                ["email", "Email Address", "email", "agent@example.com"],
                ["password", "Create Password", "password", "Min. 8 characters"]
              ].map(([field, label, inputType, placeholder]) => (
                <div key={field} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 5 }}>{label}</label>
                  <input type={inputType} placeholder={placeholder} value={agentForm[field]}
                    onChange={e => setAgentForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 10,
                      border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none",
                      boxSizing: "border-box", transition: "border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor = "#16a34a"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              ))}
              <div style={{
                background: "#f0fdf4", borderRadius: 10, padding: "12px 14px",
                border: "1px solid #bbf7d0", fontSize: 13, color: "#166534", marginBottom: 20
              }}>
                ✓ Your account will be reviewed and activated within 24 hours.
              </div>
              <button onClick={() => setAgentSubmitted(true)} style={{
                width: "100%", background: "#16a34a", color: "#fff", border: "none",
                borderRadius: 12, padding: "14px", fontWeight: 800, fontSize: 15, cursor: "pointer"
              }}>Submit Registration</button>
              <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 14 }}>
                Already registered? <span style={{ color: "#16a34a", cursor: "pointer", fontWeight: 700 }}>Log in →</span>
              </p>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 20, padding: 40, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#1e293b", marginBottom: 12 }}>Registration Submitted!</h2>
              <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.7 }}>
                Thank you for joining NyumbaFinder. Our team will review your details and activate your agent account within <strong>24 hours</strong>.
              </p>
              <p style={{ color: "#64748b", fontSize: 14 }}>We'll notify you via WhatsApp and email once you're verified and ready to upload listings.</p>
              <button onClick={() => { setView("home"); setAgentSubmitted(false); }} style={{
                marginTop: 24, background: "#16a34a", color: "#fff", border: "none",
                borderRadius: 12, padding: "13px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer"
              }}>Back to Home</button>
            </div>
          )}
        </div>
      )}

      {/* LISTING DETAIL MODAL */}
      <Modal listing={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
