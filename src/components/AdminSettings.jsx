import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function AdminSettings({ facebookUrl, setFacebookUrl, isMobile }) {
  const [urlEnCours, setUrlEnCours] = useState(facebookUrl);
  const [enregistrement, setEnregistrement] = useState(false);

  const enregistrerParametres = async (event) => {
    event.preventDefault();
    const url = urlEnCours.trim();

    if (!/^https:\/\/(www\.)?facebook\.com\//i.test(url)) {
      alert("Veuillez saisir un lien Facebook valide commençant par https://www.facebook.com/");
      return;
    }

    setEnregistrement(true);
    try {
      await setDoc(doc(db, "parametres", "boutique"), { facebookUrl: url }, { merge: true });
      setFacebookUrl(url);
      alert("Lien Facebook mis à jour !");
    } catch (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <section style={{ backgroundColor: "white", padding: isMobile ? "15px" : "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: "20px" }}>
      <h3 style={{ color: "#2c3e50", margin: "0 0 6px 0", fontSize: isMobile ? "1.1rem" : "1.3rem" }}>⚙️ Paramètres de la boutique</h3>
      <p style={{ color: "#7f8c8d", margin: "0 0 15px 0", fontSize: "0.85rem" }}>Modifiez le lien Facebook affiché dans « Nous contacter ».</p>
      <form onSubmit={enregistrerParametres} style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "10px" }}>
        <input
          type="url"
          value={urlEnCours}
          onChange={(event) => setUrlEnCours(event.target.value)}
          placeholder="https://www.facebook.com/votre-page"
          required
          style={{ flex: 1, minWidth: 0, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button type="submit" disabled={enregistrement} style={{ backgroundColor: "#1877F2", color: "white", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", opacity: enregistrement ? 0.6 : 1 }}>
          {enregistrement ? "Enregistrement..." : "Enregistrer le lien"}
        </button>
      </form>
    </section>
  );
}

export default AdminSettings;