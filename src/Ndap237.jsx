import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Home, Search, Plus, MapPin, Phone, Copy, Check, Filter, Building2, Bed, Bath, Maximize, Loader2, AlertCircle, LogOut, User, Trash2, Archive, Shield, CheckCircle2, XCircle, Users, Camera, X, ChevronLeft, ChevronRight, ImageIcon, BadgeCheck } from "lucide-react";

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
  const [session, setSession] = useState(null);
  const [profil, setProfil] = useState(null);
  const [chargementSession, setChargementSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChargementSession(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setProfil(null); return; }
    supabase.from("agents").select("*").eq("user_id", session.user.id).maybeSingle().then(({ data }) => setProfil(data));
  }, [session]);

  async function deconnexion() { await supabase.auth.signOut(); setVue("catalogue"); }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F1E8", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#2A2620" }}>
      <header style={{ background: "#2E5E4E", color: "#F5F1E8", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setVue("catalogue")}>
            <div style={{ background: "#C89B3C", borderRadius: 10, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center" }}><Home size={24} color="#2E5E4E" strokeWidth={2.5} /></div>
            <div><div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1 }}>Ndap<span style={{ color: "#C89B3C" }}>237</span></div><div style={{ fontSize: 11, opacity: 0.8, letterSpacing: "1px", textTransform: "uppercase" }}>Immobilier Cameroun</div></div>
          </div>
          <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="ndap-btn" onClick={() => setVue("catalogue")} style={navBtn(vue === "catalogue")}><Search size={16} /> Catalogue</button>
            {session ? (
              <>
                <button className="ndap-btn" onClick={() => setVue("deposer")} style={navBtn(vue === "deposer")}><Plus size={16} /> Déposer</button>
                <button className="ndap-btn" onClick={() => setVue("mes-annonces")} style={navBtn(vue === "mes-annonces")}><User size={16} /> Mes annonces</button>
                {profil?.est_admin && <button className="ndap-btn" onClick={() => setVue("admin")} style={navBtn(vue === "admin")}><Shield size={16} /> Admin</button>}
                <button onClick={deconnexion} style={{ ...navBtn(false) }}><LogOut size={16} /></button>
              </>
            ) : (
              <button className="ndap-btn" onClick={() => setVue("connexion")} style={navBtn(vue === "connexion")}><User size={16} /> Espace agent</button>
            )}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div className="ndap-view" key={vue}>
        {chargementSession ? <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}><Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} /></div>
          : vue === "catalogue" ? <Catalogue />
          : (vue === "connexion" || !session) ? <Connexion onConnecte={() => setVue("deposer")} />
          : vue === "deposer" ? <Deposer profil={profil} session={session} onFini={() => setVue("mes-annonces")} />
          : vue === "mes-annonces" ? <MesAnnonces profil={profil} />
          : vue === "admin" ? (profil?.est_admin ? <Admin /> : <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}>Accès réservé à l'administrateur.</div>)
          : null}
        </div>
      </main>
      <footer style={{ textAlign: "center", padding: "20px", fontSize: 12, color: "#8A8478", borderTop: "1px solid #E3DCCB" }}>Ndap237 — La vitrine immobilière des agents camerounais</footer>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Apparition douce vers le haut (ease-out) */
        @keyframes ndap-rise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Ouverture fenêtre : zoom + fade */
        @keyframes ndap-pop {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        /* Fond qui apparaît en fondu */
        @keyframes ndap-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        /* Léger fondu latéral pour changement de vue */
        @keyframes ndap-view {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Courbe d'accélération façon Apple : douce, sans rebond */
        :root { --ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1); }

        .ndap-view { animation: ndap-view 0.45s var(--ease-soft) both; }

        /* Carte : apparition en cascade + survol qui soulève */
        .ndap-carte {
          animation: ndap-rise 0.5s var(--ease-soft) both;
          transition: transform 0.35s var(--ease-soft), box-shadow 0.35s var(--ease-soft);
          will-change: transform;
        }
        .ndap-carte:hover {
          transform: translateY(-5px);
        }

        /* Boutons : réaction douce au survol et au clic */
        .ndap-btn {
          transition: transform 0.2s var(--ease-soft), box-shadow 0.2s var(--ease-soft), background 0.2s var(--ease-soft), opacity 0.2s var(--ease-soft);
        }
        .ndap-btn:hover { transform: translateY(-1px); }
        .ndap-btn:active { transform: scale(0.97); }

        /* Image dans la carte : très léger zoom au survol de la carte */
        .ndap-carte .ndap-photo { transition: transform 0.6s var(--ease-soft); }
        .ndap-carte:hover .ndap-photo { transform: scale(1.04); }

        /* Fenêtre détaillée */
        .ndap-backdrop { animation: ndap-fade 0.3s ease-out both; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        .ndap-modal { animation: ndap-pop 0.4s var(--ease-soft) both; }

        /* Champs de formulaire : focus doux */
        .ndap-input:focus { border-color: #2E5E4E !important; box-shadow: 0 0 0 3px rgba(46,94,78,0.12); }

        /* Respecter les préférences d'accessibilité (mouvement réduit) */
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}

function Connexion({ onConnecte }) {
  const [mode, setMode] = useState("connexion");
  const [email, setEmail] = useState(""); const [mdp, setMdp] = useState("");
  const [nomAgence, setNomAgence] = useState(""); const [tel, setTel] = useState(""); const [ville, setVille] = useState(VILLES[0]);
  const [erreur, setErreur] = useState(null); const [envoi, setEnvoi] = useState(false);

  async function soumettre() {
    setErreur(null); setEnvoi(true);
    try {
      if (mode === "inscription") {
        if (!nomAgence || !tel) throw new Error("Renseignez le nom de l'agence et le téléphone.");
        const { data, error } = await supabase.auth.signUp({ email, password: mdp });
        if (error) throw error;
        const { error: eP } = await supabase.from("agents").insert({ user_id: data.user.id, nom_agence: nomAgence, telephone: tel, ville_principale: ville });
        if (eP) throw eP;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: mdp });
        if (error) throw error;
      }
      onConnecte();
    } catch (err) {
      const m = err.message || "Erreur.";
      if (m.includes("Invalid login")) setErreur("Email ou mot de passe incorrect.");
      else if (m.includes("already registered")) setErreur("Cet email a déjà un compte. Connectez-vous.");
      else if (m.includes("at least 6")) setErreur("Le mot de passe doit faire au moins 6 caractères.");
      else setErreur(m);
      setEnvoi(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "20px auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#EDE7D8", padding: 4, borderRadius: 10 }}>
        <button onClick={() => { setMode("connexion"); setErreur(null); }} style={ongletBtn(mode === "connexion")}>Connexion</button>
        <button onClick={() => { setMode("inscription"); setErreur(null); }} style={ongletBtn(mode === "inscription")}>Créer un compte</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{mode === "inscription" ? "Créer votre espace agent" : "Espace agent"}</h1>
        <p style={{ margin: "0 0 20px", color: "#8A8478", fontSize: 14 }}>{mode === "inscription" ? "Publiez vos biens et gérez vos annonces." : "Connectez-vous pour gérer vos annonces."}</p>
        {mode === "inscription" && (<>
          <Field label="Nom de l'agence *"><input className="ndap-input" style={inp} value={nomAgence} onChange={(e) => setNomAgence(e.target.value)} placeholder="Agence Bonapriso" /></Field>
          <Field label="Téléphone WhatsApp *"><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#8A8478", fontSize: 14 }}>+237</span><input className="ndap-input" style={inp} value={tel} onChange={(e) => setTel(e.target.value)} placeholder="6XX XXX XXX" /></div></Field>
          <Field label="Ville principale"><select className="ndap-input" style={inp} value={ville} onChange={(e) => setVille(e.target.value)}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select></Field>
        </>)}
        <Field label="Email *"><input className="ndap-input" style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com" /></Field>
        <Field label="Mot de passe *"><input className="ndap-input" style={inp} type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="Au moins 6 caractères" /></Field>
        {erreur && <ErreurBox message={erreur} />}
        <button className="ndap-btn" disabled={envoi || !email || !mdp} onClick={soumettre} style={{ width: "100%", marginTop: 8, background: (!envoi && email && mdp) ? "#2E5E4E" : "#C9C2B2", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: (!envoi && email && mdp) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {envoi ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : (mode === "inscription" ? "Créer mon compte" : "Se connecter")}
        </button>
      </div>
    </div>
  );
}

function Catalogue() {
  const [annonces, setAnnonces] = useState([]); const [chargement, setChargement] = useState(true); const [erreur, setErreur] = useState(null);
  const [q, setQ] = useState(""); const [ville, setVille] = useState(""); const [type, setType] = useState(""); const [trans, setTrans] = useState("");
  const [selection, setSelection] = useState(null); // annonce ouverte en détail
  useEffect(() => { charger(); }, []);
  async function charger() {
    setChargement(true); setErreur(null);
    const { data, error } = await supabase.from("annonces").select("*, agents(nom_agence, telephone, statut_abonnement)").eq("statut", "active").order("cree_le", { ascending: false });
    if (error) { setErreur(error.message); setChargement(false); return; }
    // Priorité Pro : les annonces d'agents "actif" (Pro) apparaissent en premier
    const triees = (data || []).sort((a, b) => {
      const aPro = a.agents?.statut_abonnement === "actif" ? 1 : 0;
      const bPro = b.agents?.statut_abonnement === "actif" ? 1 : 0;
      return bPro - aPro; // Pro d'abord, sinon on garde l'ordre par date
    });
    setAnnonces(triees); setChargement(false);
  }
  const filtres = annonces.filter((a) => {
    const t = (a.quartier + " " + a.ville + " " + a.type_bien + " " + a.description).toLowerCase();
    return t.includes(q.toLowerCase()) && (ville ? a.ville === ville : true) && (type ? a.type_bien === type : true) && (trans ? a.transaction === trans : true);
  });
  return (
    <div>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px" }}>Biens disponibles</h1><p style={{ margin: 0, color: "#8A8478" }}>{chargement ? "Chargement…" : `${filtres.length} annonce${filtres.length > 1 ? "s" : ""} • partagez ce catalogue à vos clients`}</p></div>
      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F5F1E8", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><Search size={18} color="#8A8478" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un quartier, un type de bien…" style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 15, color: "#2A2620" }} /></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Select value={ville} onChange={setVille} placeholder="Toutes les villes" options={VILLES} icon={<MapPin size={14} />} /><Select value={type} onChange={setType} placeholder="Tous les types" options={TYPES} icon={<Building2 size={14} />} /><Select value={trans} onChange={setTrans} placeholder="Louer / Vendre" options={TRANSACTIONS} icon={<Filter size={14} />} /></div>
      </div>
      {erreur ? <ErreurBox message={erreur} /> : chargement ? <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}><Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} /><p>Chargement…</p></div>
        : filtres.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}><Search size={40} style={{ opacity: 0.4, marginBottom: 12 }} /><p>{annonces.length === 0 ? "Aucune annonce pour l'instant." : "Aucun bien ne correspond à votre recherche."}</p></div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>{filtres.map((a, i) => <Carte key={a.id} a={a} i={i} onOuvrir={() => setSelection(a)} />)}</div>}
      {selection && <DetailAnnonce a={selection} onFermer={() => setSelection(null)} />}
    </div>
  );
}

function Carte({ a, actions, onOuvrir, i = 0 }) {
  const agent = a.agents?.nom_agence || "Agent"; const tel = a.agents?.telephone || ""; const type = a.type_bien || a.type;
  const estPro = a.agents?.statut_abonnement === "actif";
  const photos = a.photos || [];
  const [idx, setIdx] = useState(0);
  const aDesPhotos = photos.length > 0;
  const clic = onOuvrir ? { onClick: onOuvrir, style: { cursor: "pointer" } } : {};
  const delai = Math.min(i * 0.06, 0.6); // cascade douce, plafonnée
  return (
    <div className={onOuvrir ? "ndap-carte" : ""} style={{ animationDelay: `${delai}s`, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: estPro ? "0 4px 16px rgba(200,155,60,0.28)" : "0 2px 12px rgba(0,0,0,0.06)", border: estPro ? "2px solid #C89B3C" : "1px solid #EDE7D8", display: "flex", flexDirection: "column" }}>
      {aDesPhotos ? (
        <div {...clic} style={{ position: "relative", height: 190, background: "#EDE7D8", overflow: "hidden", ...(clic.style || {}) }}>
          <img className="ndap-photo" src={photos[idx]} alt={`${type} ${a.quartier}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {/* dégradé + infos prix par-dessus la photo */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.55))" }} />
          <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.55)", color: "#fff", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{a.transaction}</span>
          {estPro && <span style={{ position: "absolute", top: 12, left: 12, background: "#C89B3C", color: "#2E5E4E", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}><BadgeCheck size={13} /> PRO</span>}
          {photos.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setIdx((idx - 1 + photos.length) % photos.length); }} style={navPhoto("left")}><ChevronLeft size={18} /></button>
              <button onClick={(e) => { e.stopPropagation(); setIdx((idx + 1) % photos.length); }} style={navPhoto("right")}><ChevronRight size={18} /></button>
              <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
                {photos.map((_, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,0.5)" }} />)}
              </div>
            </>
          )}
          <div style={{ position: "absolute", bottom: 12, left: 14, color: "#fff" }}>
            <div style={{ fontSize: 12, opacity: 0.9, display: "flex", alignItems: "center", gap: 4 }}><Building2 size={13} /> {type}</div>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{fmtPrix(a.prix)}<span style={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>{a.unite}</span></div>
          </div>
        </div>
      ) : (
        <div {...clic} style={{ background: a.couleur || "#2E5E4E", color: "#fff", padding: "18px 18px 14px", position: "relative", ...(clic.style || {}) }}>
          <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{a.transaction}</span>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Building2 size={13} /> {type}</div>
          <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{fmtPrix(a.prix)}<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>{a.unite}</span></div>
          <div style={{ fontSize: 13, marginTop: 8, display: "flex", alignItems: "center", gap: 4, opacity: 0.95 }}><MapPin size={13} /> {a.quartier}, {a.ville}</div>
        </div>
      )}
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        <div {...clic} style={{ flex: 1, ...(clic.style || {}) }}>
          {aDesPhotos && <div style={{ fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 4, color: "#5A5548" }}><MapPin size={13} /> {a.quartier}, {a.ville}</div>}
          <div style={{ display: "flex", gap: 14, marginBottom: 10, fontSize: 13, color: "#5A5548" }}>{a.chambres ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Bed size={14} /> {a.chambres}</span> : null}{a.sdb ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Bath size={14} /> {a.sdb}</span> : null}{a.surface ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Maximize size={14} /> {a.surface} m²</span> : null}</div>
          <p style={{ fontSize: 14, color: "#5A5548", lineHeight: 1.5, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.description}</p>
        </div>
        <div style={{ borderTop: "1px solid #EDE7D8", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#8A8478", display: "flex", alignItems: "center", gap: 5 }}>{agent}{estPro && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#2E5E4E", fontWeight: 700 }}><BadgeCheck size={14} /> Vérifié</span>}</div>
          {actions ? actions : <a className="ndap-btn" href={`https://wa.me/237${tel}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 5, background: "#2E5E4E", color: "#fff", padding: "7px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}><Phone size={14} /> Contacter</a>}
        </div>
      </div>
    </div>
  );
}

function MesAnnonces({ profil }) {
  const [annonces, setAnnonces] = useState([]); const [chargement, setChargement] = useState(true);
  useEffect(() => { if (profil) charger(); }, [profil]);
  async function charger() { setChargement(true); const { data } = await supabase.from("annonces").select("*").eq("agent_id", profil.id).order("cree_le", { ascending: false }); setAnnonces(data || []); setChargement(false); }
  async function archiver(id) { await supabase.from("annonces").update({ statut: "archivee" }).eq("id", id); charger(); }
  async function supprimer(id) { if (!confirm("Supprimer définitivement cette annonce ?")) return; await supabase.from("annonces").delete().eq("id", id); charger(); }
  if (!profil) return <div style={{ textAlign: "center", padding: 40, color: "#8A8478" }}>Chargement du profil…</div>;
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Mes annonces</h1>
      <p style={{ margin: "0 0 20px", color: "#8A8478" }}>{profil.nom_agence} • {profil.statut_abonnement === "actif" ? "Abonnement actif — annonces illimitées" : `Palier gratuit — ${annonces.filter(a => a.statut === "active").length}/3 annonces actives`}</p>
      {chargement ? <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} /></div>
        : annonces.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#8A8478" }}>Vous n'avez pas encore d'annonce.</div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>{annonces.map((a) => (
            <div key={a.id} style={{ opacity: a.statut === "archivee" ? 0.55 : 1 }}>
              <Carte a={{ ...a, agents: { nom_agence: profil.nom_agence, telephone: profil.telephone, statut_abonnement: profil.statut_abonnement } }} actions={
                <div style={{ display: "flex", gap: 6 }}>
                  {a.statut === "active" && <button onClick={() => archiver(a.id)} title="Marquer comme loué/vendu" style={miniBtn}><Archive size={14} /></button>}
                  <button onClick={() => supprimer(a.id)} title="Supprimer" style={{ ...miniBtn, color: "#A63D2A" }}><Trash2 size={14} /></button>
                </div>
              } />
            </div>
          ))}</div>}
    </div>
  );
}

function Deposer({ profil, onFini }) {
  const [f, setF] = useState({ type: TYPES[0], transaction: TRANSACTIONS[0], ville: profil?.ville_principale || VILLES[0], quartier: "", prix: "", unite: "/mois", chambres: "", sdb: "", surface: "", desc: "", couleur: COULEURS[0] });
  const [photos, setPhotos] = useState([]);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [copied, setCopied] = useState(false); const [envoi, setEnvoi] = useState(false); const [erreur, setErreur] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const pret = f.quartier && f.prix && f.desc && photos.length > 0;

  // Applique un filigrane discret (nom agence + téléphone) en bas de la photo,
  // directement dans le navigateur, avant l'envoi. Renvoie un Blob JPEG.
  function appliquerFiligrane(fichier) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(fichier);
      img.onload = () => {
        try {
          // On limite la taille max pour alléger (max 1600px de large)
          const maxW = 1600;
          const ratio = img.width > maxW ? maxW / img.width : 1;
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);

          // Bandeau semi-transparent en bas
          const texte = `${profil.nom_agence}  •  +237 ${profil.telephone}`;
          const taillePolice = Math.max(16, Math.round(w * 0.028));
          const padding = Math.round(taillePolice * 0.6);
          const bandeauH = taillePolice + padding * 2;
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.fillRect(0, h - bandeauH, w, bandeauH);

          // Texte du filigrane
          ctx.font = `600 ${taillePolice}px sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.95)";
          ctx.textBaseline = "middle";
          ctx.fillText(texte, padding, h - bandeauH / 2);

          // Petite signature Ndap237 à droite
          ctx.font = `${Math.round(taillePolice * 0.75)}px sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          const sig = "Ndap237";
          const sigW = ctx.measureText(sig).width;
          ctx.fillText(sig, w - sigW - padding, h - bandeauH / 2);

          URL.revokeObjectURL(url);
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Traitement image échoué")), "image/jpeg", 0.85);
        } catch (e) { reject(e); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image illisible")); };
      img.src = url;
    });
  }

  async function ajouterPhotos(e) {
    const fichiers = Array.from(e.target.files || []);
    if (fichiers.length === 0) return;
    if (photos.length + fichiers.length > 5) { setErreur("5 photos maximum par annonce."); return; }
    setErreur(null); setUploadEnCours(true);
    try {
      const nouvelles = [];
      for (const fichier of fichiers) {
        if (fichier.size > 5 * 1024 * 1024) { throw new Error(`"${fichier.name}" depasse 5 Mo. Choisissez une image plus legere.`); }
        // Appliquer le filigrane avant l'envoi
        const blobFiligrane = await appliquerFiligrane(fichier);
        const chemin = `${profil.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const { error } = await supabase.storage.from("photos-annonces").upload(chemin, blobFiligrane, { cacheControl: "3600", upsert: false, contentType: "image/jpeg" });
        if (error) throw error;
        const { data } = supabase.storage.from("photos-annonces").getPublicUrl(chemin);
        nouvelles.push({ url: data.publicUrl, chemin });
      }
      setPhotos([...photos, ...nouvelles]);
    } catch (err) { setErreur(err.message || "Erreur lors de l'envoi des photos."); }
    setUploadEnCours(false);
    e.target.value = "";
  }

  async function retirerPhoto(i) {
    const p = photos[i];
    supabase.storage.from("photos-annonces").remove([p.chemin]);
    setPhotos(photos.filter((_, j) => j !== i));
  }

  const texteWhatsApp = `\u{1F3E0} *${f.type.toUpperCase()} ${f.transaction.toUpperCase()}*\n\u{1F4CD} ${f.quartier}, ${f.ville}\n\u{1F4B0} ${f.prix ? fmtPrix(Number(f.prix)) + f.unite : "\u2014"}\n${f.chambres ? `\u{1F6CF}\uFE0F ${f.chambres} chambre(s)  ` : ""}${f.sdb ? `\u{1F6BF} ${f.sdb} douche(s)  ` : ""}${f.surface ? `\u{1F4D0} ${f.surface} m\u00B2` : ""}\n\n${f.desc}\n\n\u{1F4DE} Contact : ${profil?.nom_agence || ""} \u2014 +237 ${profil?.telephone || ""}\n\n_Publi\u00E9 via Ndap237_`;
  const copier = () => { navigator.clipboard?.writeText(texteWhatsApp); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  async function publier() {
    setEnvoi(true); setErreur(null);
    try {
      const { error } = await supabase.from("annonces").insert({ agent_id: profil.id, type_bien: f.type, transaction: f.transaction, ville: f.ville, quartier: f.quartier, prix: Number(f.prix), unite: f.unite, chambres: Number(f.chambres) || 0, sdb: Number(f.sdb) || 0, surface: Number(f.surface) || 0, description: f.desc, couleur: f.couleur, photos: photos.map((p) => p.url) });
      if (error) { if (error.message?.includes("LIMITE_GRATUITE")) throw new Error("Vous avez atteint la limite de 3 annonces du palier gratuit. Passez a l'abonnement payant pour publier davantage."); throw error; }
      onFini();
    } catch (err) { setErreur(err.message || "Erreur."); setEnvoi(false); }
  }
  if (!profil) return <div style={{ textAlign: "center", padding: 40, color: "#8A8478" }}><Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} /><p>Chargement du profil\u2026</p></div>;
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px" }}>D\u00E9poser une annonce</h1>
      <p style={{ margin: "0 0 24px", color: "#8A8478" }}>Publie sous : <strong>{profil.nom_agence}</strong> (+237 {profil.telephone})</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
          <Field label={`Photos du bien * (${photos.length}/5)`}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: "relative", width: 76, height: 76, borderRadius: 8, overflow: "hidden", border: "1px solid #E3DCCB" }}>
                  <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => retirerPhoto(i)} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X size={12} /></button>
                </div>
              ))}
              {photos.length < 5 && (
                <label style={{ width: 76, height: 76, borderRadius: 8, border: "2px dashed #C9C2B2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: uploadEnCours ? "wait" : "pointer", color: "#8A8478", gap: 2 }}>
                  {uploadEnCours ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : <><Camera size={20} /><span style={{ fontSize: 10 }}>Ajouter</span></>}
                  <input type="file" accept="image/*" multiple onChange={ajouterPhotos} disabled={uploadEnCours} style={{ display: "none" }} />
                </label>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#8A8478", marginTop: 6 }}>Au moins 1 photo. Formats image, 5 Mo max chacune. La 1re photo sera la principale. 🔒 Votre nom et téléphone sont ajoutés automatiquement en filigrane pour protéger vos photos.</div>
          </Field>
          <div style={{ display: "flex", gap: 10 }}><Field label="Type de bien"><select className="ndap-input" style={inp} value={f.type} onChange={set("type")}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field><Field label="Transaction"><select className="ndap-input" style={inp} value={f.transaction} onChange={set("transaction")}>{TRANSACTIONS.map((t) => <option key={t}>{t}</option>)}</select></Field></div>
          <div style={{ display: "flex", gap: 10 }}><Field label="Ville"><select className="ndap-input" style={inp} value={f.ville} onChange={set("ville")}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="Quartier *"><input className="ndap-input" style={inp} value={f.quartier} onChange={set("quartier")} placeholder="Ex : Bonapriso" /></Field></div>
          <div style={{ display: "flex", gap: 10 }}><Field label="Prix (XAF) *"><input className="ndap-input" style={inp} type="number" value={f.prix} onChange={set("prix")} placeholder="250000" /></Field><Field label="Unit\u00E9"><select className="ndap-input" style={inp} value={f.unite} onChange={set("unite")}><option value="/mois">/mois</option><option value="">total</option></select></Field></div>
          <div style={{ display: "flex", gap: 10 }}><Field label="Chambres"><input className="ndap-input" style={inp} type="number" value={f.chambres} onChange={set("chambres")} placeholder="2" /></Field><Field label="Douches"><input className="ndap-input" style={inp} type="number" value={f.sdb} onChange={set("sdb")} placeholder="2" /></Field><Field label="Surface m\u00B2"><input className="ndap-input" style={inp} type="number" value={f.surface} onChange={set("surface")} placeholder="90" /></Field></div>
          <Field label="Description *"><textarea className="ndap-input" style={{ ...inp, minHeight: 70, resize: "vertical" }} value={f.desc} onChange={set("desc")} placeholder="D\u00E9crivez le bien\u2026" /></Field>
          {erreur && <ErreurBox message={erreur} />}
          <button className="ndap-btn" disabled={!pret || envoi || uploadEnCours} onClick={publier} style={{ width: "100%", marginTop: 8, background: (pret && !envoi && !uploadEnCours) ? "#2E5E4E" : "#C9C2B2", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: (pret && !envoi && !uploadEnCours) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{envoi ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Publication\u2026</> : <><Plus size={18} /> Publier dans le catalogue</>}</button>
          {!pret && photos.length === 0 && <div style={{ fontSize: 12, color: "#8A8478", textAlign: "center", marginTop: 8 }}>Ajoutez au moins une photo pour pouvoir publier.</div>}
        </div>
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8A8478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Aper\u00E7u de la fiche</div>
          <div style={{ marginBottom: 20 }}><Carte a={{ ...f, type_bien: f.type, prix: Number(f.prix) || 0, chambres: Number(f.chambres) || 0, sdb: Number(f.sdb) || 0, surface: Number(f.surface) || 0, photos: photos.map((p) => p.url), agents: { nom_agence: profil.nom_agence, telephone: profil.telephone, statut_abonnement: profil.statut_abonnement }, quartier: f.quartier || "Quartier", description: f.desc || "Votre description appara\u00EEtra ici\u2026" }} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8A8478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Texte pr\u00EAt pour WhatsApp / Facebook</div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #EDE7D8", fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#3A362E", fontFamily: "monospace" }}>{texteWhatsApp}</div>
          <button className="ndap-btn" onClick={copier} style={{ width: "100%", marginTop: 10, background: copied ? "#C89B3C" : "#3A362E", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{copied ? <><Check size={16} /> Copi\u00E9 !</> : <><Copy size={16} /> Copier le texte</>}</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
//  ADMIN — tableau de bord (réservé à l'admin)
// ============================================================
function Admin() {
  const [agents, setAgents] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [q, setQ] = useState("");
  const [enCours, setEnCours] = useState(null); // id de l'agent en cours de modification

  useEffect(() => { charger(); }, []);
  async function charger() {
    setChargement(true); setErreur(null);
    // agents + nombre d'annonces actives
    const { data, error } = await supabase
      .from("agents")
      .select("*, annonces(count)")
      .order("cree_le", { ascending: false });
    if (error) { setErreur(error.message); setChargement(false); return; }
    setAgents(data || []); setChargement(false);
  }

  async function activer(agent) {
    setEnCours(agent.id);
    // abonnement actif pour 30 jours à partir d'aujourd'hui
    const expire = new Date(); expire.setDate(expire.getDate() + 30);
    const { error } = await supabase.from("agents")
      .update({ statut_abonnement: "actif", abonnement_expire_le: expire.toISOString().slice(0, 10) })
      .eq("id", agent.id);
    if (error) setErreur(error.message);
    await charger(); setEnCours(null);
  }

  async function desactiver(agent) {
    setEnCours(agent.id);
    const { error } = await supabase.from("agents")
      .update({ statut_abonnement: "gratuit", abonnement_expire_le: null })
      .eq("id", agent.id);
    if (error) setErreur(error.message);
    await charger(); setEnCours(null);
  }

  const filtres = agents.filter((a) => (a.nom_agence + " " + a.telephone + " " + (a.ville_principale || "")).toLowerCase().includes(q.toLowerCase()));
  const nbActifs = agents.filter((a) => a.statut_abonnement === "actif").length;

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 10 }}><Shield size={26} color="#2E5E4E" /> Tableau de bord admin</h1>
      <p style={{ margin: "0 0 20px", color: "#8A8478" }}>{agents.length} agent{agents.length > 1 ? "s" : ""} inscrit{agents.length > 1 ? "s" : ""} • {nbActifs} abonnement{nbActifs > 1 ? "s" : ""} actif{nbActifs > 1 ? "s" : ""}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "10px 14px", marginBottom: 20, border: "1px solid #EDE7D8" }}>
        <Search size={18} color="#8A8478" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un agent par nom, téléphone, ville…" style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 15, color: "#2A2620" }} />
      </div>

      {erreur && <ErreurBox message={erreur} />}

      {chargement ? <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} /></div>
        : filtres.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#8A8478" }}>Aucun agent trouvé.</div>
        : (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #EDE7D8", overflow: "hidden" }}>
            {filtres.map((a, i) => {
              const nbAnnonces = a.annonces?.[0]?.count ?? 0;
              const actif = a.statut_abonnement === "actif";
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid #F0EBDE", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                      {a.nom_agence}
                      {a.est_admin && <span style={{ background: "#2E5E4E", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>ADMIN</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "#8A8478" }}>+237 {a.telephone} • {a.ville_principale || "—"} • {nbAnnonces} annonce{nbAnnonces > 1 ? "s" : ""}</div>
                  </div>

                  <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: actif ? "#2E5E4E" : "#B0894A" }}>
                    {actif ? <><CheckCircle2 size={16} /> Actif{a.abonnement_expire_le ? ` (jusqu'au ${a.abonnement_expire_le})` : ""}</> : <><XCircle size={16} /> Gratuit</>}
                  </div>

                  <div style={{ flex: "0 0 auto" }}>
                    {actif ? (
                      <button disabled={enCours === a.id} onClick={() => desactiver(a)} style={{ ...adminBtn, background: "#F5F1E8", color: "#8A3B2A", border: "1px solid #E5B8AE" }}>
                        {enCours === a.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Désactiver"}
                      </button>
                    ) : (
                      <button disabled={enCours === a.id} onClick={() => activer(a)} style={{ ...adminBtn, background: "#2E5E4E", color: "#fff" }}>
                        {enCours === a.id ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Activer (30 j)"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      <p style={{ fontSize: 12, color: "#8A8478", marginTop: 16, lineHeight: 1.5 }}>
        « Activer » passe l'agent en abonnement illimité pour 30 jours. Fais-le après réception du paiement Mobile Money. À l'expiration, reviens le désactiver s'il n'a pas renouvelé.
      </p>
    </div>
  );
}

// ============================================================
//  DÉTAIL ANNONCE — fenêtre qui s'ouvre au clic sur une fiche
// ============================================================
function DetailAnnonce({ a, onFermer }) {
  const photos = a.photos || [];
  const [idx, setIdx] = useState(0);
  const agent = a.agents?.nom_agence || "Agent";
  const tel = a.agents?.telephone || "";
  const estPro = a.agents?.statut_abonnement === "actif";
  const type = a.type_bien || a.type;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onFermer(); if (e.key === "ArrowRight" && photos.length > 1) setIdx((i) => (i + 1) % photos.length); if (e.key === "ArrowLeft" && photos.length > 1) setIdx((i) => (i - 1 + photos.length) % photos.length); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // empêche le défilement de l'arrière-plan
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [photos.length, onFermer]);

  return (
    <div onClick={onFermer} className="ndap-backdrop" style={{ position: "fixed", inset: 0, background: "rgba(20,18,14,0.6)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} className="ndap-modal" style={{ background: "#fff", borderRadius: 20, maxWidth: 620, width: "100%", margin: "auto", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
        {/* Zone photo */}
        <div style={{ position: "relative", background: "#1a1a1a" }}>
          {photos.length > 0 ? (
            <img src={photos[idx]} alt={`${type} ${a.quartier}`} style={{ width: "100%", maxHeight: 440, objectFit: "contain", display: "block", background: "#000" }} />
          ) : (
            <div style={{ height: 220, background: a.couleur || "#2E5E4E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>Pas de photo</div>
          )}
          {/* bouton fermer */}
          <button onClick={onFermer} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X size={20} /></button>
          {estPro && <span style={{ position: "absolute", top: 12, left: 12, background: "#C89B3C", color: "#2E5E4E", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}><BadgeCheck size={14} /> PRO</span>}
          {photos.length > 1 && (
            <>
              <button onClick={() => setIdx((idx - 1 + photos.length) % photos.length)} style={{ ...navPhoto("left"), width: 40, height: 40 }}><ChevronLeft size={22} /></button>
              <button onClick={() => setIdx((idx + 1) % photos.length)} style={{ ...navPhoto("right"), width: 40, height: 40 }}><ChevronRight size={22} /></button>
              <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, background: "rgba(0,0,0,0.4)", padding: "6px 10px", borderRadius: 20 }}>
                {photos.map((_, i) => <span key={i} onClick={() => setIdx(i)} style={{ width: 8, height: 8, borderRadius: "50%", background: i === idx ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer" }} />)}
              </div>
              <span style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 12 }}>{idx + 1} / {photos.length}</span>
            </>
          )}
        </div>

        {/* Miniatures cliquables */}
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: 8, padding: "12px 20px 0", overflowX: "auto" }}>
            {photos.map((p, i) => (
              <img key={i} src={p} alt="" onClick={() => setIdx(i)} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, cursor: "pointer", border: i === idx ? "3px solid #2E5E4E" : "3px solid transparent", flexShrink: 0 }} />
            ))}
          </div>
        )}

        {/* Infos */}
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: "#8A8478", display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><Building2 size={15} /> {type} • {a.transaction}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#2E5E4E", lineHeight: 1 }}>{fmtPrix(a.prix)}<span style={{ fontSize: 15, fontWeight: 500, color: "#8A8478" }}>{a.unite}</span></div>
            </div>
          </div>
          <div style={{ fontSize: 15, color: "#5A5548", display: "flex", alignItems: "center", gap: 5, marginBottom: 16 }}><MapPin size={16} /> {a.quartier}, {a.ville}</div>

          <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
            {a.chambres ? <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: "#3A362E" }}><Bed size={18} /> {a.chambres} chambre{a.chambres > 1 ? "s" : ""}</span> : null}
            {a.sdb ? <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: "#3A362E" }}><Bath size={18} /> {a.sdb} douche{a.sdb > 1 ? "s" : ""}</span> : null}
            {a.surface ? <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: "#3A362E" }}><Maximize size={18} /> {a.surface} m²</span> : null}
          </div>

          <p style={{ fontSize: 15, color: "#5A5548", lineHeight: 1.6, margin: "0 0 20px", whiteSpace: "pre-wrap" }}>{a.description}</p>

          <div style={{ borderTop: "1px solid #EDE7D8", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, color: "#5A5548", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 600 }}>{agent}</span>
              {estPro && <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#2E5E4E", fontWeight: 700, fontSize: 13 }}><BadgeCheck size={15} /> Vérifié</span>}
            </div>
            <a className="ndap-btn" href={`https://wa.me/237${tel}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, background: "#2E5E4E", color: "#fff", padding: "12px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}><Phone size={18} /> Contacter sur WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErreurBox({ message }) { return <div style={{ background: "#FBEAE7", border: "1px solid #E5B8AE", borderRadius: 10, padding: "12px 14px", margin: "12px 0", display: "flex", gap: 10, alignItems: "flex-start", color: "#8A3B2A" }}><AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} /><div style={{ fontSize: 13, lineHeight: 1.5 }}>{message}</div></div>; }
function Field({ label, children }) { return <div style={{ marginBottom: 14, flex: 1 }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5A5548", marginBottom: 5 }}>{label}</label>{children}</div>; }
function Select({ value, onChange, placeholder, options, icon }) { return <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F5F1E8", borderRadius: 9, padding: "8px 12px", flex: "1 1 160px" }}><span style={{ color: "#8A8478" }}>{icon}</span><select value={value} onChange={(e) => onChange(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 14, color: "#2A2620", cursor: "pointer" }}><option value="">{placeholder}</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>; }
const inp = { width: "100%", boxSizing: "border-box", border: "1px solid #E3DCCB", borderRadius: 9, padding: "10px 12px", fontSize: 14, outline: "none", background: "#FCFAF5", color: "#2A2620", fontFamily: "inherit" };
const navBtn = (active) => ({ display: "flex", alignItems: "center", gap: 6, background: active ? "#C89B3C" : "rgba(255,255,255,0.12)", color: active ? "#2E5E4E" : "#F5F1E8", border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 14, fontWeight: 700, cursor: "pointer" });
const ongletBtn = (active) => ({ flex: 1, background: active ? "#fff" : "transparent", color: active ? "#2E5E4E" : "#8A8478", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none" });
const miniBtn = { background: "#F5F1E8", border: "1px solid #E3DCCB", borderRadius: 7, padding: "7px 9px", cursor: "pointer", color: "#5A5548", display: "flex", alignItems: "center" };
const adminBtn = { border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, minWidth: 90 };
const navPhoto = (cote) => ({ position: "absolute", top: "50%", transform: "translateY(-50%)", [cote]: 8, background: "rgba(0,0,0,0.45)", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" });

