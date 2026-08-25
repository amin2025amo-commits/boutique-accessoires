import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function AdminSettings({ nomBoutique, setNomBoutique, facebookUrl, setFacebookUrl, telephone, setTelephone, isMobile }) {
  const [nomEnCours, setNomEnCours] = useState(nomBoutique);
  const [urlEnCours, setUrlEnCours] = useState(facebookUrl);
  const [telephoneEnCours, setTelephoneEnCours] = useState(telephone);
  const [enregistrement, setEnregistrement] = useState(false);

  const enregistrerParametres = async (event) => {
    event.preventDefault();
    const nom = nomEnCours.trim();
    const url = urlEnCours.trim();
    const numero = telephoneEnCours.trim();

    if (!nom) {
      alert("Veuillez saisir un nom de boutique.");
      return;
    }
    if (!/^https:\/\/(www\.)?facebook\.com\//i.test(url)) {
      alert("Veuillez saisir un lien Facebook valide commençant par https://www.facebook.com/");
      return;
    }
    //if (!/^[0-9+().\s-]{8,20}$/.test(numero) || numero.replace(/\D/g, "").length < 8) {
    //  alert("Veuillez saisir un numéro de téléphone valide.");
    //  return;
    //}

    setEnregistrement(true);
    try {
      await setDoc(doc(db, "parametres", "boutique"), { nomBoutique: nom, facebookUrl: url, telephone: numero }, { merge: true });
      setNomBoutique(nom);
      setFacebookUrl(url);
      setTelephone(numero);
      alert("Paramètres de la boutique mis à jour !");
    } catch (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <section style={{ backgroundColor: "white", padding: isMobile ? "15px" : "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginTop: "20px" }}>
      <h3 style={{ color: "#2c3e50", margin: "0 0 6px 0", fontSize: isMobile ? "1.1rem" : "1.3rem" }}>⚙️ Paramètres de la boutique</h3>
      <p style={{ color: "#7f8c8d", margin: "0 0 15px 0", fontSize: "0.85rem" }}>Modifiez le nom de la boutique et les informations affichées dans « Nous contacter ».</p>
      <form onSubmit={enregistrerParametres} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#34495e", fontSize: "0.85rem", fontWeight: "bold" }}>
          Nom de la boutique
          <input
            type="text"
            value={nomEnCours}
            onChange={(event) => setNomEnCours(event.target.value)}
            placeholder="Dz-Market - Accessoires Montres Connectées"
            required
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontWeight: "normal" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#34495e", fontSize: "0.85rem", fontWeight: "bold" }}>
          Lien Facebook
          <input
            type="url"
            value={urlEnCours}
            onChange={(event) => setUrlEnCours(event.target.value)}
            placeholder="https://www.facebook.com/votre-page"
            required
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontWeight: "normal" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "5px", color: "#34495e", fontSize: "0.85rem", fontWeight: "bold" }}>
          Numéro de téléphone
          <input
            type="tel"
            value={telephoneEnCours}
            onChange={(event) => setTelephoneEnCours(event.target.value)}
            placeholder="0657927281"
            required
            style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontWeight: "normal" }}
          />
        </label>
        <button type="submit" disabled={enregistrement} style={{ alignSelf: isMobile ? "stretch" : "flex-start", backgroundColor: "#1877F2", color: "white", border: "none", padding: "10px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", opacity: enregistrement ? 0.6 : 1 }}>
          {enregistrement ? "Enregistrement..." : "Enregistrer les paramètres"}
        </button>
      </form>
    </section>
  );
}

export default AdminSettings;