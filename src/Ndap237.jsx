import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Home, Search, Plus, MapPin, Phone, Copy, Check, Filter, Building2, Bed, Bath, Maximize, Loader2, AlertCircle } from "lucide-react";

// ============================================================
//  NDAP237 — Version connectée à Supabase
//  Les annonces sont sauvegardées durablement dans ta base.
// ============================================================

// --- Connexion à TA base Supabase ---
const SUPABASE_URL = "https://vpaqnqfszznlsemnppry.supabase.co";
const SUPABASE_KEY = "sb_publishable_aRhXVeFAcC5_gTYMFBM7cw_hkThQjgu";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VILLES = ["Douala", "Yaoundé", "Bafoussam", "Kribi", "Limbe", "Buea", "Bamenda", "Garoua", "Ngaoundéré"];
const TYPES = ["Studio", "Appartement", "Chambre moderne", "Villa / Maison", "Terrain", "Boutique / Local", "Bureau"];
const TRANSACTIONS = ["À louer", "À vendre"];
const COULEURS = ["#2E5E4E", "#B25B32", "#C89B3C", "#3A3A6A", "#7A3B4E"];

const fmtPrix = (n) => new Intl.NumberFormat("fr-FR").format(n) + " XAF";

export default function Ndap237() {
  const [vue, setVue] = useState("catalogue");

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1E8", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#2A2620" }}>
      <header style={{ background: "#2E5E4E", color: "#F5F1E8", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#C89B3C", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={24} color="#2E5E4E" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>Ndap<span style={{ color: "#C89B3C" }}>237</span></div>
              <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: "1px", textTransform: "uppercase" }}>Immobilier Cameroun</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setVue("catalogue")} style={navBtn(vue === "catalogue")}><Search size={16} /> Catalogue</button>
            <button onClick={() => setVue("deposer")} style={navBtn(vue === "deposer")}><Plus size={16} /> Déposer une annonce</button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
        {vue === "catalogue" ? <Catalogue /> : <Deposer onFini={() => setVue("catalogue")} />}
      </main>

      <footer style={{ textAlign: "center", padding: "20px", fontSize: 12, color: "#8A8478", borderTop: "1px solid #E3DCCB" }}>
        Ndap237 — La vitrine immobilière des agents camerounais
      </footer>
    </div>
  );
}

// ============================================================
//  CATALOGUE — lit les vraies annonces depuis Supabase
// ============================================================
function Catalogue() {
  const [annonces, setAnnonces] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [q, setQ] = useState("");
  const [ville, setVille] = useState("");
  const [type, setType] = useState("");
  const [trans, setTrans] = useState("");

  useEffect(() => { chargerAnnonces(); }, []);

  async function chargerAnnonces() {
    setChargement(true);
    setErreur(null);
    // On récupère les annonces actives + les infos de l'agent (nom, téléphone)
    const { data, error } = await supabase
      .from("annonces")
      .select("*, agents(nom_agence, telephone)")
      .eq("statut", "active")
      .order("cree_le", { ascending: false });

    if (error) { setErreur(error.message); setChargement(false); return; }
    setAnnonces(data || []);
    setChargement(false);
  }

  const filtres = annonces.filter((a) => {
    const t = (a.quartier + " " + a.ville + " " + a.type_bien + " " + a.description).toLowerCase();
    return t.includes(q.toLowerCase()) &&
      (ville ? a.ville === ville : true) &&
      (type ? a.type_bien === type : true) &&
      (trans ? a.transaction === trans : true);
  });

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px" }}>Biens disponibles</h1>
        <p style={{ margin: 0, color: "#8A8478" }}>{chargement ? "Chargement…" : `${filtres.length} annonce${filtres.length > 1 ? "s" : ""} • partagez ce catalogue à vos clients`}</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F5F1E8", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
          <Search size={18} color="#8A8478" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un quartier, un type de bien…" style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 15, color: "#2A2620" }} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Select value={ville} onChange={setVille} placeholder="Toutes les villes" options={VILLES} icon={<MapPin size={14} />} />
          <Select value={type} onChange={setType} placeholder="Tous les types" options={TYPES} icon={<Building2 size={14} />} />
          <Select value={trans} onChange={setTrans} placeholder="Louer / Vendre" options={TRANSACTIONS} icon={<Filter size={14} />} />
        </div>
      </div>

      {erreur ? (
        <ErreurBox message={erreur} />
      ) : chargement ? (
        <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}><Loader2 size={40} className="spin" style={{ animation: "spin 1s linear infinite" }} /><p>Chargement des annonces…</p></div>
      ) : filtres.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}>
          <Search size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p>{annonces.length === 0 ? "Aucune annonce pour l'instant. Publiez la première depuis « Déposer une annonce » !" : "Aucun bien ne correspond à votre recherche."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtres.map((a) => <Carte key={a.id} a={a} />)}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Carte({ a }) {
  // supporte les données Supabase (type_bien, agents.nom_agence) ET l'aperçu local
  const agent = a.agents?.nom_agence || a.agent || "Agent";
  const tel = a.agents?.telephone || a.tel || "";
  const type = a.type_bien || a.type;
  return (
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #EDE7D8", display: "flex", flexDirection: "column" }}>
      <div style={{ background: a.couleur || "#2E5E4E", color: "#fff", padding: "18px 18px 14px", position: "relative" }}>
        <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{a.transaction}</span>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Building2 size={13} /> {type}</div>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{fmtPrix(a.prix)}<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>{a.unite}</span></div>
        <div style={{ fontSize: 13, marginTop: 8, display: "flex", alignItems: "center", gap: 4, opacity: 0.95 }}><MapPin size={13} /> {a.quartier}, {a.ville}</div>
      </div>
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 10, fontSize: 13, color: "#5A5548" }}>
          {a.chambres ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Bed size={14} /> {a.chambres}</span> : null}
          {a.sdb ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Bath size={14} /> {a.sdb}</span> : null}
          {a.surface ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Maximize size={14} /> {a.surface} m²</span> : null}
        </div>
        <p style={{ fontSize: 14, color: "#5A5548", lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>{a.description || a.desc}</p>
        <div style={{ borderTop: "1px solid #EDE7D8", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#8A8478" }}>{agent}</div>
          <a href={`https://wa.me/237${tel}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "#2E5E4E", color: "#fff", padding: "7px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            <Phone size={14} /> Contacter
          </a>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  DÉPOSER — écrit une vraie annonce dans Supabase
// ============================================================
function Deposer({ onFini }) {
  const [f, setF] = useState({ agent: "", tel: "", type: TYPES[0], transaction: TRANSACTIONS[0], ville: VILLES[0], quartier: "", prix: "", unite: "/mois", chambres: "", sdb: "", surface: "", desc: "", couleur: COULEURS[0] });
  const [copied, setCopied] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const pret = f.agent && f.tel && f.quartier && f.prix && f.desc;

  const texteWhatsApp = `🏠 *${f.type.toUpperCase()} ${f.transaction.toUpperCase()}*\n📍 ${f.quartier}, ${f.ville}\n💰 ${f.prix ? fmtPrix(Number(f.prix)) + f.unite : "—"}\n${f.chambres ? `🛏️ ${f.chambres} chambre(s)  ` : ""}${f.sdb ? `🚿 ${f.sdb} douche(s)  ` : ""}${f.surface ? `📐 ${f.surface} m²` : ""}\n\n${f.desc}\n\n📞 Contact : ${f.agent} — +237 ${f.tel}\n\n_Publié via Ndap237_`;

  const copier = () => { navigator.clipboard?.writeText(texteWhatsApp); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  async function publier() {
    setEnvoi(true);
    setErreur(null);
    try {
      // 1) Trouver ou créer l'agent (par téléphone). Version pilote sans connexion.
      let agentId;
      const { data: existant } = await supabase.from("agents").select("id").eq("telephone", f.tel).maybeSingle();
      if (existant) {
        agentId = existant.id;
      } else {
        const { data: nouveau, error: eA } = await supabase.from("agents")
          .insert({ nom_agence: f.agent, telephone: f.tel, ville_principale: f.ville })
          .select("id").single();
        if (eA) throw eA;
        agentId = nouveau.id;
      }

      // 2) Créer l'annonce
      const { error: eAnn } = await supabase.from("annonces").insert({
        agent_id: agentId,
        type_bien: f.type, transaction: f.transaction, ville: f.ville, quartier: f.quartier,
        prix: Number(f.prix), unite: f.unite,
        chambres: Number(f.chambres) || 0, sdb: Number(f.sdb) || 0, surface: Number(f.surface) || 0,
        description: f.desc, couleur: f.couleur,
      });
      if (eAnn) {
        // message clair si la limite freemium est atteinte
        if (eAnn.message?.includes("LIMITE_GRATUITE")) {
          throw new Error("Vous avez atteint la limite de 3 annonces du palier gratuit. Passez à l'abonnement payant pour publier davantage.");
        }
        throw eAnn;
      }
      onFini();
    } catch (err) {
      setErreur(err.message || "Une erreur est survenue.");
      setEnvoi(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px" }}>Déposer une annonce</h1>
      <p style={{ margin: "0 0 24px", color: "#8A8478" }}>Remplissez le formulaire, obtenez une fiche propre prête à poster — et sauvegardée au catalogue.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
          <Field label="Nom de l'agent / agence *"><input style={inp} value={f.agent} onChange={set("agent")} placeholder="Ex : Agence Bonapriso" /></Field>
          <Field label="Téléphone WhatsApp *"><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#8A8478", fontSize: 14 }}>+237</span><input style={inp} value={f.tel} onChange={set("tel")} placeholder="6XX XXX XXX" /></div></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Type de bien"><select style={inp} value={f.type} onChange={set("type")}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Transaction"><select style={inp} value={f.transaction} onChange={set("transaction")}>{TRANSACTIONS.map((t) => <option key={t}>{t}</option>)}</select></Field>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Ville"><select style={inp} value={f.ville} onChange={set("ville")}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select></Field>
            <Field label="Quartier *"><input style={inp} value={f.quartier} onChange={set("quartier")} placeholder="Ex : Bonapriso" /></Field>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Prix (XAF) *"><input style={inp} type="number" value={f.prix} onChange={set("prix")} placeholder="250000" /></Field>
            <Field label="Unité"><select style={inp} value={f.unite} onChange={set("unite")}><option value="/mois">/mois</option><option value="">total</option></select></Field>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Chambres"><input style={inp} type="number" value={f.chambres} onChange={set("chambres")} placeholder="2" /></Field>
            <Field label="Douches"><input style={inp} type="number" value={f.sdb} onChange={set("sdb")} placeholder="2" /></Field>
            <Field label="Surface m²"><input style={inp} type="number" value={f.surface} onChange={set("surface")} placeholder="90" /></Field>
          </div>
          <Field label="Description *"><textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={f.desc} onChange={set("desc")} placeholder="Décrivez le bien : atouts, équipements, environnement…" /></Field>
          <Field label="Couleur de la fiche">
            <div style={{ display: "flex", gap: 8 }}>
              {COULEURS.map((c) => <button key={c} onClick={() => set("couleur")(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: f.couleur === c ? "3px solid #2A2620" : "3px solid transparent", cursor: "pointer" }} />)}
            </div>
          </Field>

          {erreur && <ErreurBox message={erreur} />}

          <button disabled={!pret || envoi} onClick={publier}
            style={{ width: "100%", marginTop: 8, background: (pret && !envoi) ? "#2E5E4E" : "#C9C2B2", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: (pret && !envoi) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {envoi ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Publication…</> : <><Plus size={18} /> Publier dans le catalogue</>}
          </button>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8A8478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Aperçu de la fiche</div>
          <div style={{ marginBottom: 20 }}>
            <Carte a={{ ...f, type_bien: f.type, prix: Number(f.prix) || 0, chambres: Number(f.chambres) || 0, sdb: Number(f.sdb) || 0, surface: Number(f.surface) || 0, agent: f.agent || "Votre nom", tel: f.tel, quartier: f.quartier || "Quartier", description: f.desc || "Votre description apparaîtra ici…" }} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8A8478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Texte prêt pour WhatsApp / Facebook</div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #EDE7D8", fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#3A362E", fontFamily: "monospace" }}>{texteWhatsApp}</div>
          <button onClick={copier} style={{ width: "100%", marginTop: 10, background: copied ? "#C89B3C" : "#3A362E", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {copied ? <><Check size={16} /> Copié !</> : <><Copy size={16} /> Copier le texte</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
//  Composants réutilisables
// ============================================================
function ErreurBox({ message }) {
  return (
    <div style={{ background: "#FBEAE7", border: "1px solid #E5B8AE", borderRadius: 10, padding: "12px 14px", margin: "12px 0", display: "flex", gap: 10, alignItems: "flex-start", color: "#8A3B2A" }}>
      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{message}</div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 14, flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5A5548", marginBottom: 5 }}>{label}</label>{children}</div>;
}

function Select({ value, onChange, placeholder, options, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F5F1E8", borderRadius: 9, padding: "8px 12px", flex: "1 1 160px" }}>
      <span style={{ color: "#8A8478" }}>{icon}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 14, color: "#2A2620", cursor: "pointer" }}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const inp = { width: "100%", boxSizing: "border-box", border: "1px solid #E3DCCB", borderRadius: 9, padding: "10px 12px", fontSize: 14, outline: "none", background: "#FCFAF5", color: "#2A2620", fontFamily: "inherit" };
const navBtn = (active) => ({ display: "flex", alignItems: "center", gap: 6, background: active ? "#C89B3C" : "rgba(255,255,255,0.12)", color: active ? "#2E5E4E" : "#F5F1E8", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer" });
