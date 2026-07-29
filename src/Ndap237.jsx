import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Home, Search, Plus, MapPin, Phone, Copy, Check, Filter, Building2, Bed, Bath, Maximize, Loader2, AlertCircle, LogOut, User, Trash2, Archive } from "lucide-react";

const SUPABASE_URL = "https://vpaqnqfszznlsemnppry.supabase.co";
const SUPABASE_KEY = "sb_publishable_aRhXVeFAcC5_gTYMFBM7cw_hkThQjgu";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const VILLES = ["Douala", "YaoundÃ©", "Bafoussam", "Kribi", "Limbe", "Buea", "Bamenda", "Garoua", "NgaoundÃ©rÃ©"];
const TYPES = ["Studio", "Appartement", "Chambre moderne", "Villa / Maison", "Terrain", "Boutique / Local", "Bureau"];
const TRANSACTIONS = ["Ã€ louer", "Ã€ vendre"];
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
            <button onClick={() => setVue("catalogue")} style={navBtn(vue === "catalogue")}><Search size={16} /> Catalogue</button>
            {session ? (
              <>
                <button onClick={() => setVue("deposer")} style={navBtn(vue === "deposer")}><Plus size={16} /> DÃ©poser</button>
                <button onClick={() => setVue("mes-annonces")} style={navBtn(vue === "mes-annonces")}><User size={16} /> Mes annonces</button>
                <button onClick={deconnexion} style={{ ...navBtn(false) }}><LogOut size={16} /></button>
              </>
            ) : (
              <button onClick={() => setVue("connexion")} style={navBtn(vue === "connexion")}><User size={16} /> Espace agent</button>
            )}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
        {chargementSession ? <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}><Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} /></div>
          : vue === "catalogue" ? <Catalogue />
          : (vue === "connexion" || !session) ? <Connexion onConnecte={() => setVue("deposer")} />
          : vue === "deposer" ? <Deposer profil={profil} session={session} onFini={() => setVue("mes-annonces")} />
          : vue === "mes-annonces" ? <MesAnnonces profil={profil} />
          : null}
      </main>
      <footer style={{ textAlign: "center", padding: "20px", fontSize: 12, color: "#8A8478", borderTop: "1px solid #E3DCCB" }}>Ndap237 â€” La vitrine immobiliÃ¨re des agents camerounais</footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
        if (!nomAgence || !tel) throw new Error("Renseignez le nom de l'agence et le tÃ©lÃ©phone.");
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
      else if (m.includes("already registered")) setErreur("Cet email a dÃ©jÃ  un compte. Connectez-vous.");
      else if (m.includes("at least 6")) setErreur("Le mot de passe doit faire au moins 6 caractÃ¨res.");
      else setErreur(m);
      setEnvoi(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "20px auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, background: "#EDE7D8", padding: 4, borderRadius: 10 }}>
        <button onClick={() => { setMode("connexion"); setErreur(null); }} style={ongletBtn(mode === "connexion")}>Connexion</button>
        <button onClick={() => { setMode("inscription"); setErreur(null); }} style={ongletBtn(mode === "inscription")}>CrÃ©er un compte</button>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>{mode === "inscription" ? "CrÃ©er votre espace agent" : "Espace agent"}</h1>
        <p style={{ margin: "0 0 20px", color: "#8A8478", fontSize: 14 }}>{mode === "inscription" ? "Publiez vos biens et gÃ©rez vos annonces." : "Connectez-vous pour gÃ©rer vos annonces."}</p>
        {mode === "inscription" && (<>
          <Field label="Nom de l'agence *"><input style={inp} value={nomAgence} onChange={(e) => setNomAgence(e.target.value)} placeholder="Agence Bonapriso" /></Field>
          <Field label="TÃ©lÃ©phone WhatsApp *"><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#8A8478", fontSize: 14 }}>+237</span><input style={inp} value={tel} onChange={(e) => setTel(e.target.value)} placeholder="6XX XXX XXX" /></div></Field>
          <Field label="Ville principale"><select style={inp} value={ville} onChange={(e) => setVille(e.target.value)}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select></Field>
        </>)}
        <Field label="Email *"><input style={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@email.com" /></Field>
        <Field label="Mot de passe *"><input style={inp} type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="Au moins 6 caractÃ¨res" /></Field>
        {erreur && <ErreurBox message={erreur} />}
        <button disabled={envoi || !email || !mdp} onClick={soumettre} style={{ width: "100%", marginTop: 8, background: (!envoi && email && mdp) ? "#2E5E4E" : "#C9C2B2", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: (!envoi && email && mdp) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {envoi ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : (mode === "inscription" ? "CrÃ©er mon compte" : "Se connecter")}
        </button>
      </div>
    </div>
  );
}

function Catalogue() {
  const [annonces, setAnnonces] = useState([]); const [chargement, setChargement] = useState(true); const [erreur, setErreur] = useState(null);
  const [q, setQ] = useState(""); const [ville, setVille] = useState(""); const [type, setType] = useState(""); const [trans, setTrans] = useState("");
  useEffect(() => { charger(); }, []);
  async function charger() {
    setChargement(true); setErreur(null);
    const { data, error } = await supabase.from("annonces").select("*, agents(nom_agence, telephone)").eq("statut", "active").order("cree_le", { ascending: false });
    if (error) { setErreur(error.message); setChargement(false); return; }
    setAnnonces(data || []); setChargement(false);
  }
  const filtres = annonces.filter((a) => {
    const t = (a.quartier + " " + a.ville + " " + a.type_bien + " " + a.description).toLowerCase();
    return t.includes(q.toLowerCase()) && (ville ? a.ville === ville : true) && (type ? a.type_bien === type : true) && (trans ? a.transaction === trans : true);
  });
  return (
    <div>
      <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px" }}>Biens disponibles</h1><p style={{ margin: 0, color: "#8A8478" }}>{chargement ? "Chargementâ€¦" : `${filtres.length} annonce${filtres.length > 1 ? "s" : ""} â€¢ partagez ce catalogue Ã  vos clients`}</p></div>
      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F5F1E8", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}><Search size={18} color="#8A8478" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un quartier, un type de bienâ€¦" style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 15, color: "#2A2620" }} /></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Select value={ville} onChange={setVille} placeholder="Toutes les villes" options={VILLES} icon={<MapPin size={14} />} /><Select value={type} onChange={setType} placeholder="Tous les types" options={TYPES} icon={<Building2 size={14} />} /><Select value={trans} onChange={setTrans} placeholder="Louer / Vendre" options={TRANSACTIONS} icon={<Filter size={14} />} /></div>
      </div>
      {erreur ? <ErreurBox message={erreur} /> : chargement ? <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}><Loader2 size={40} style={{ animation: "spin 1s linear infinite" }} /><p>Chargementâ€¦</p></div>
        : filtres.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#8A8478" }}><Search size={40} style={{ opacity: 0.4, marginBottom: 12 }} /><p>{annonces.length === 0 ? "Aucune annonce pour l'instant." : "Aucun bien ne correspond Ã  votre recherche."}</p></div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>{filtres.map((a) => <Carte key={a.id} a={a} />)}</div>}
    </div>
  );
}

function Carte({ a, actions }) {
  const agent = a.agents?.nom_agence || "Agent"; const tel = a.agents?.telephone || ""; const type = a.type_bien || a.type;
  return (
    <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #EDE7D8", display: "flex", flexDirection: "column" }}>
      <div style={{ background: a.couleur || "#2E5E4E", color: "#fff", padding: "18px 18px 14px", position: "relative" }}>
        <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{a.transaction}</span>
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Building2 size={13} /> {type}</div>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{fmtPrix(a.prix)}<span style={{ fontSize: 13, fontWeight: 500, opacity: 0.8 }}>{a.unite}</span></div>
        <div style={{ fontSize: 13, marginTop: 8, display: "flex", alignItems: "center", gap: 4, opacity: 0.95 }}><MapPin size={13} /> {a.quartier}, {a.ville}</div>
      </div>
      <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 14, marginBottom: 10, fontSize: 13, color: "#5A5548" }}>{a.chambres ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Bed size={14} /> {a.chambres}</span> : null}{a.sdb ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Bath size={14} /> {a.sdb}</span> : null}{a.surface ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Maximize size={14} /> {a.surface} mÂ²</span> : null}</div>
        <p style={{ fontSize: 14, color: "#5A5548", lineHeight: 1.5, margin: "0 0 14px", flex: 1 }}>{a.description}</p>
        <div style={{ borderTop: "1px solid #EDE7D8", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 12, color: "#8A8478" }}>{agent}</div>
          {actions ? actions : <a href={`https://wa.me/237${tel}`} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "#2E5E4E", color: "#fff", padding: "7px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}><Phone size={14} /> Contacter</a>}
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
  async function supprimer(id) { if (!confirm("Supprimer dÃ©finitivement cette annonce ?")) return; await supabase.from("annonces").delete().eq("id", id); charger(); }
  if (!profil) return <div style={{ textAlign: "center", padding: 40, color: "#8A8478" }}>Chargement du profilâ€¦</div>;
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px" }}>Mes annonces</h1>
      <p style={{ margin: "0 0 20px", color: "#8A8478" }}>{profil.nom_agence} â€¢ {profil.statut_abonnement === "actif" ? "Abonnement actif â€” annonces illimitÃ©es" : `Palier gratuit â€” ${annonces.filter(a => a.statut === "active").length}/3 annonces actives`}</p>
      {chargement ? <div style={{ textAlign: "center", padding: 40 }}><Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} /></div>
        : annonces.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: "#8A8478" }}>Vous n'avez pas encore d'annonce.</div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>{annonces.map((a) => (
            <div key={a.id} style={{ opacity: a.statut === "archivee" ? 0.55 : 1 }}>
              <Carte a={{ ...a, agents: { nom_agence: profil.nom_agence, telephone: profil.telephone } }} actions={
                <div style={{ display: "flex", gap: 6 }}>
                  {a.statut === "active" && <button onClick={() => archiver(a.id)} title="Marquer comme louÃ©/vendu" style={miniBtn}><Archive size={14} /></button>}
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
  const [copied, setCopied] = useState(false); const [envoi, setEnvoi] = useState(false); const [erreur, setErreur] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const pret = f.quartier && f.prix && f.desc;
  const texteWhatsApp = `ðŸ  *${f.type.toUpperCase()} ${f.transaction.toUpperCase()}*\nðŸ“ ${f.quartier}, ${f.ville}\nðŸ’° ${f.prix ? fmtPrix(Number(f.prix)) + f.unite : "â€”"}\n${f.chambres ? `ðŸ›ï¸ ${f.chambres} chambre(s)  ` : ""}${f.sdb ? `ðŸš¿ ${f.sdb} douche(s)  ` : ""}${f.surface ? `ðŸ“ ${f.surface} mÂ²` : ""}\n\n${f.desc}\n\nðŸ“ž Contact : ${profil?.nom_agence || ""} â€” +237 ${profil?.telephone || ""}\n\n_PubliÃ© via Ndap237_`;
  const copier = () => { navigator.clipboard?.writeText(texteWhatsApp); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  async function publier() {
    setEnvoi(true); setErreur(null);
    try {
      const { error } = await supabase.from("annonces").insert({ agent_id: profil.id, type_bien: f.type, transaction: f.transaction, ville: f.ville, quartier: f.quartier, prix: Number(f.prix), unite: f.unite, chambres: Number(f.chambres) || 0, sdb: Number(f.sdb) || 0, surface: Number(f.surface) || 0, description: f.desc, couleur: f.couleur });
      if (error) { if (error.message?.includes("LIMITE_GRATUITE")) throw new Error("Vous avez atteint la limite de 3 annonces du palier gratuit. Passez Ã  l'abonnement payant pour publier davantage."); throw error; }
      onFini();
    } catch (err) { setErreur(err.message || "Erreur."); setEnvoi(false); }
  }
  if (!profil) return <div style={{ textAlign: "center", padding: 40, color: "#8A8478" }}><Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} /><p>Chargement du profilâ€¦</p></div>;
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.5px" }}>DÃ©poser une annonce</h1>
      <p style={{ margin: "0 0 24px", color: "#8A8478" }}>Publie sous : <strong>{profil.nom_agence}</strong> (+237 {profil.telephone})</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #EDE7D8" }}>
          <div style={{ display: "flex", gap: 10 }}><Field label="Type de bien"><select style={inp} value={f.type} onChange={set("type")}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field><Field label="Transaction"><select style={inp} value={f.transaction} onChange={set("transaction")}>{TRANSACTIONS.map((t) => <option key={t}>{t}</option>)}</select></Field></div>
          <div style={{ display: "flex", gap: 10 }}><Field label="Ville"><select style={inp} value={f.ville} onChange={set("ville")}>{VILLES.map((v) => <option key={v}>{v}</option>)}</select></Field><Field label="Quartier *"><input style={inp} value={f.quartier} onChange={set("quartier")} placeholder="Ex : Bonapriso" /></Field></div>
          <div style={{ display: "flex", gap: 10 }}><Field label="Prix (XAF) *"><input style={inp} type="number" value={f.prix} onChange={set("prix")} placeholder="250000" /></Field><Field label="UnitÃ©"><select style={inp} value={f.unite} onChange={set("unite")}><option value="/mois">/mois</option><option value="">total</option></select></Field></div>
          <div style={{ display: "flex", gap: 10 }}><Field label="Chambres"><input style={inp} type="number" value={f.chambres} onChange={set("chambres")} placeholder="2" /></Field><Field label="Douches"><input style={inp} type="number" value={f.sdb} onChange={set("sdb")} placeholder="2" /></Field><Field label="Surface mÂ²"><input style={inp} type="number" value={f.surface} onChange={set("surface")} placeholder="90" /></Field></div>
          <Field label="Description *"><textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={f.desc} onChange={set("desc")} placeholder="DÃ©crivez le bienâ€¦" /></Field>
          <Field label="Couleur de la fiche"><div style={{ display: "flex", gap: 8 }}>{COULEURS.map((c) => <button key={c} onClick={() => set("couleur")(c)} style={{ width: 32, height: 32, borderRadius: 8, background: c, border: f.couleur === c ? "3px solid #2A2620" : "3px solid transparent", cursor: "pointer" }} />)}</div></Field>
          {erreur && <ErreurBox message={erreur} />}
          <button disabled={!pret || envoi} onClick={publier} style={{ width: "100%", marginTop: 8, background: (pret && !envoi) ? "#2E5E4E" : "#C9C2B2", color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 15, fontWeight: 700, cursor: (pret && !envoi) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{envoi ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Publicationâ€¦</> : <><Plus size={18} /> Publier dans le catalogue</>}</button>
        </div>
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8A8478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>AperÃ§u de la fiche</div>
          <div style={{ marginBottom: 20 }}><Carte a={{ ...f, type_bien: f.type, prix: Number(f.prix) || 0, chambres: Number(f.chambres) || 0, sdb: Number(f.sdb) || 0, surface: Number(f.surface) || 0, agents: { nom_agence: profil.nom_agence, telephone: profil.telephone }, quartier: f.quartier || "Quartier", description: f.desc || "Votre description apparaÃ®tra iciâ€¦" }} /></div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#8A8478", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Texte prÃªt pour WhatsApp / Facebook</div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #EDE7D8", fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#3A362E", fontFamily: "monospace" }}>{texteWhatsApp}</div>
          <button onClick={copier} style={{ width: "100%", marginTop: 10, background: copied ? "#C89B3C" : "#3A362E", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>{copied ? <><Check size={16} /> CopiÃ© !</> : <><Copy size={16} /> Copier le texte</>}</button>
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
