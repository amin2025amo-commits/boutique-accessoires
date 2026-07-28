import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const AjouterProduit = () => {
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [imageString, setImageString] = useState(""); // Stockera le texte Base64
  const [enCours, setEnCours] = useState(false);

  // Convertir l'image du PC en texte Base64
  const handleChangerImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Sécurité : Éviter les images trop lourdes pour Firestore (Max 1 Mo conseillé)
      if (file.size > 1024 * 1024) {
        alert("L'image est trop lourde ! Choisissez une image de moins de 1 Mo.");
        e.target.value = null; // Réinitialise le choix
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageString(reader.result); // C'est ici que l'image devient du texte
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSoumettre = async (e) => {
    e.preventDefault();
    if (!imageString) return alert("Veuillez sélectionner une image sur votre PC");

    setEnCours(true);
    try {
      // Enregistrement direct dans votre collection 'products'
      await addDoc(collection(db, "products"), {
        name: nom,
        price: Number(prix),
        description: description || "Aucune description",
        image: imageString // On stocke le texte Base64 directement
      });

      alert("🎉 Produit ajouté avec succès dans DZ SHOPPING !");
      
      // Réinitialiser le formulaire
      setNom("");
      setPrix("");
      setDescription("");
      setImageString("");
      e.target.reset();
    } catch (error) {
      console.error("Erreur Firestore :", error);
      alert("Erreur lors de l'ajout : " + error.message);
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "20px auto", padding: "20px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", fontFamily: "sans-serif" }}>
      <h3 style={{ color: "#2c3e50", marginTop: 0, borderBottom: "2px solid #eee", paddingBottom: "10px" }}>➕ Ajouter un Produit (Depuis votre PC)</h3>
      
      <form onSubmit={handleSoumettre} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.9rem" }}>Nom du produit :</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} placeholder="Ex: Jeux Éducatifs en bois" />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.9rem" }}>Prix (DA) :</label>
          <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }} placeholder="Ex: 2500" />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.9rem" }}>Description :</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", height: "70px" }} placeholder="Petite description du produit..." />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.9rem" }}>Photo du produit (PC) :</label>
          <input type="file" accept="image/*" onChange={handleChangerImage} required style={{ width: "100%" }} />
          
          {/* Aperçu de l'image sélectionnée avant l'envoi */}
          {imageString && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <p style={{ fontSize: "0.8rem", color: "#27ae60", margin: "0 0 5px" }}>✓ Image chargée avec succès</p>
              <img src={imageString} alt="Aperçu" style={{ maxHeight: "120px", borderRadius: "8px", border: "1px solid #ddd" }} />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={enCours}
          style={{ 
            backgroundColor: "#2c3e50", 
            color: "white", 
            border: "none", 
            padding: "12px", 
            borderRadius: "6px", 
            cursor: "pointer", 
            fontWeight: "bold",
            fontSize: "1rem",
            marginTop: "10px"
          }}
        >
          {enCours ? "Enregistrement..." : "🚀 Publier sur la boutique"}
        </button>
      </form>
    </div>
  );
};

export default AjouterProduit;