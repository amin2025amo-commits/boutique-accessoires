import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { translations } from "../translations";
import { 
  communesParWilaya, 
  communesParWilayaAr, 
  wilayasAr 
} from "../utils/communesAlgerie";
import { calculerFraisPort } from "../utils/tarifsLivraison";

const FormulaireCommande = ({ 
  panier = [], 
  viderPanier, 
  modifierQuantite, 
  poursuivreAchats, 
  isMobile, 
  lang = "fr" 
}) => {
  const isAr = lang === "ar";
  const t = translations[lang] || translations.fr;

  const [client, setClient] = useState({ 
    nom: "", 
    telephone: "", 
    wilaya: "", 
    commune: "", 
    adresse: "" 
  });
  
  const [typeLivraison, setTypeLivraison] = useState("stopdesk"); // "domicile" ou "stopdesk"
  const [selectedWilayaKey, setSelectedWilayaKey] = useState("");
  const [communesDisponibles, setCommunesDisponibles] = useState([]);
  const [phoneError, setPhoneError] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Calculs financiers
  const sousTotal = panier.reduce((sum, item) => sum + item.prix * (item.quantite || 1), 0);
  const fraisPort = calculerFraisPort(selectedWilayaKey, typeLivraison);
  const totalGeneral = sousTotal + fraisPort;

  // Algerian phone validation
  const validatePhone = (phone) => {
    const dzPhoneRegex = /^0[567234]\d{8}$/;
    return dzPhoneRegex.test(phone.trim());
  };

  const handleWilayaChange = (e) => {
    const key = e.target.value;
    setSelectedWilayaKey(key);

    if (key && communesParWilaya[key]) {
      const wilayaDisplayName = isAr ? (wilayasAr[key] || key) : key;
      setClient((prev) => ({ ...prev, wilaya: wilayaDisplayName, commune: "" }));
      
      const communeList = isAr 
        ? (communesParWilayaAr[key] || communesParWilaya[key])
        : communesParWilaya[key];

      setCommunesDisponibles(communeList);
    } else {
      setClient((prev) => ({ ...prev, wilaya: "", commune: "" }));
      setCommunesDisponibles([]);
    }
  };

  const gererSoumission = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    if (!validatePhone(client.telephone)) {
      setPhoneError(
        isAr 
          ? "رقم الهاتف غير صحيح. يرجى إدخال رقم جزائري يتكون من 10 أرقام"
          : "Numéro de téléphone invalide. Veuillez entrer un numéro algérien à 10 chiffres."
      );
      return;
    }

    setPhoneError("");

    try {
      const clientDataToSend = {
        ...client,
        ville: client.commune,
        typeLivraison: typeLivraison === "domicile" 
          ? (isAr ? "توصيل للمنزل" : "À domicile") 
          : (isAr ? "توصيل لمكتب شركة الشحن" : "Stopdesk (Bureau)")
      };

      await addDoc(collection(db, "commandes"), {
        client: clientDataToSend,
        articles: panier,
        sousTotal: sousTotal,
        fraisLivraison: fraisPort,
        total: totalGeneral,
        statut: "En attente",
        date: serverTimestamp()
      });

      const notificationResponse = await fetch("/api/notify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: {
            client: clientDataToSend,
            articles: panier,
            total: totalGeneral,
            statut: "En attente",
          },
        }),
      });

      if (!notificationResponse.ok) {
        const notificationError = await notificationResponse.json().catch(() => ({}));
        console.error("Notification failed:", notificationError);
      }

      // Show confirmation screen & clear cart
      setEnvoye(true);
      if (viderPanier) viderPanier();
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      alert(isAr ? "حدث خطأ عند إرسال الطلب: " + error.message : "Erreur lors de la commande : " + error.message);
    }
  };

  const inputStyle = {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    direction: isAr ? "rtl" : "ltr",
    textAlign: isAr ? "right" : "left",
    color: "#2c3e50"
  };

  // 🔴 Localized Thank-You / Confirmation Message View
  if (envoye) {
    return (
      <div 
        dir={isAr ? "rtl" : "ltr"}
        style={{ 
          textAlign: "center", 
          padding: isMobile ? "30px 15px" : "50px 20px", 
          maxWidth: "600px", 
          margin: "auto", 
          border: "1px solid #e0e0e0", 
          borderRadius: "12px", 
          backgroundColor: "#fff",
          boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎉</div>
        <h2 style={{ color: "#27ae60", marginBottom: "15px", fontSize: "1.6rem" }}>
          {isAr ? "شكراً لك، تم تسجيل طلبك بنجاح!" : "Merci ! Votre commande a été enregistrée."}
        </h2>
        <p style={{ color: "#34495e", fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "25px" }}>
          {isAr 
            ? `عزيزي ${client.nom}، لقد تم استلام طلبك بنجاح. سنتصل بك قريباً على الرقم (${client.telephone}) لتأكيد الطلب والتوصيل.`
            : `Cher(e) ${client.nom}, nous avons bien reçu votre commande. Notre équipe vous contactera bientôt au ${client.telephone} pour confirmer la livraison.`}
        </p>
        <button 
          onClick={poursuivreAchats || (() => window.location.reload())} 
          style={{ 
            backgroundColor: "#2c3e50", 
            color: "white", 
            padding: "12px 25px", 
            border: "none", 
            borderRadius: "8px", 
            cursor: "pointer", 
            fontWeight: "bold", 
            fontSize: "1rem" 
          }}
        >
          {isAr ? "العودة إلى المتجر" : "Retour à la boutique"}
        </button>
      </div>
    );
  }

  return (
    <div 
      dir={isAr ? "rtl" : "ltr"}
      style={{ 
        padding: isMobile ? "15px" : "25px", 
        maxWidth: "600px", 
        margin: "auto", 
        border: "1px solid #e0e0e0", 
        borderRadius: "12px", 
        backgroundColor: "#fff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#2c3e50", fontSize: "1.5rem" }}>
        {isAr ? "إتمام الطلب" : "Finaliser ma commande"}
      </h3>

      <form onSubmit={gererSoumission} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        {/* Nom Complet */}
        <input 
          type="text" 
          placeholder={isAr ? "الاسم الكامل" : "Nom complet"} 
          required 
          value={client.nom}
          onChange={(e) => setClient({ ...client, nom: e.target.value })} 
          style={inputStyle} 
        />
        
        {/* Téléphone */}
        <div>
          <input 
            type="tel" 
            placeholder={isAr ? "رقم الهاتف" : "Numéro de téléphone"} 
            required 
            value={client.telephone}
            onChange={(e) => {
              setClient({ ...client, telephone: e.target.value });
              if (phoneError) setPhoneError("");
            }} 
            style={{
              ...inputStyle,
              borderColor: phoneError ? "#e74c3c" : "#ccc"
            }} 
          />
          {phoneError && (
            <span style={{ 
              color: "#e74c3c", 
              fontSize: "0.85rem", 
              marginTop: "5px", 
              display: "block",
              textAlign: isAr ? "right" : "left" 
            }}>
              {phoneError}
            </span>
          )}
        </div>

        {/* Wilaya Dropdown */}
        <select 
          required 
          value={selectedWilayaKey} 
          onChange={handleWilayaChange} 
          style={inputStyle}
        >
          <option value="" disabled>
            {isAr ? "-- اختر الولاية --" : "-- Sélectionner la Wilaya --"}
          </option>
          {Object.keys(communesParWilaya).map((key) => (
            <option key={key} value={key}>
              {isAr ? (wilayasAr[key] || key) : key}
            </option>
          ))}
        </select>

        {/* Commune Dropdown */}
        <select 
          required 
          disabled={communesDisponibles.length === 0}
          value={client.commune}
          onChange={(e) => setClient({ ...client, commune: e.target.value })} 
          style={{ 
            ...inputStyle, 
            backgroundColor: communesDisponibles.length === 0 ? "#f9f9f9" : "white" 
          }}
        >
          <option value="" disabled>
            {isAr ? "-- اختر البلدية --" : "-- Sélectionner la Commune --"}
          </option>
          {communesDisponibles.map((commune, idx) => (
            <option key={idx} value={commune}>
              {commune}
            </option>
          ))}
        </select>

        {/* Shipping Type Selector (Stopdesk vs Domicile) */}
        <div>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "bold", 
            color: "#2c3e50", 
            fontSize: "0.95rem",
            textAlign: isAr ? "right" : "left" 
          }}>
            {isAr ? "نوع التوصيل :" : "Type de livraison :"}
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setTypeLivraison("domicile")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: typeLivraison === "domicile" ? "2px solid #27ae60" : "1px solid #ccc",
                backgroundColor: typeLivraison === "domicile" ? "#e8f8f5" : "#fff",
                color: "#2c3e50",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.95rem"
              }}
            >
              🏠 {isAr ? "توصيل للمنزل" : "À domicile"}
            </button>
            <button
              type="button"
              onClick={() => setTypeLivraison("stopdesk")}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: typeLivraison === "stopdesk" ? "2px solid #27ae60" : "1px solid #ccc",
                backgroundColor: typeLivraison === "stopdesk" ? "#e8f8f5" : "#fff",
                color: "#2c3e50",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.95rem"
              }}
            >
              🏢 {isAr ? "توصيل لمكتب شركة الشحن" : "Stopdesk (Bureau)"}
            </button>
          </div>
        </div>
        
        {/* Adresse */}
        <textarea 
          placeholder={isAr ? "العنوان الدقيق (اختياري)" : "Adresse précise (Optionnel)"} 
          value={client.adresse}
          onChange={(e) => setClient({ ...client, adresse: e.target.value })} 
          style={{ ...inputStyle, height: "80px", resize: "vertical" }} 
        />

        {/* Breakdown Panel: Subtotal, Shipping, and Grand Total */}
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "15px", 
          borderRadius: "8px", 
          border: "1px solid #e9ecef",
          display: "flex", 
          flexDirection: "column", 
          gap: "8px",
          textAlign: isAr ? "right" : "left",
          direction: isAr ? "rtl" : "ltr"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#495057" }}>
            <span>{isAr ? "مجموع المنتجات :" : "Sous-total produits :"}</span>
            <span>{sousTotal} DA</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", color: "#495057" }}>
            <span>{isAr ? "تكلفة التوصيل :" : "Frais de livraison :"}</span>
            <span>{selectedWilayaKey ? `${fraisPort} DA` : (isAr ? "اختر الولاية أولاً" : "Sélectionnez une wilaya")}</span>
          </div>
          <div style={{ height: "1px", backgroundColor: "#dee2e6", margin: "4px 0" }}></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold", color: "#27ae60" }}>
            <span>{isAr ? "المجموع الكلي :" : "Total général :"}</span>
            <span>{totalGeneral} DA</span>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" style={styles.button}>
          {isAr ? "تأكيد الشراء (الدفع عند الاستلام)" : "Confirmer l'achat (Paiement à la livraison)"}
        </button>

        {/* Cancel / Return to Cart Button */}
        {poursuivreAchats && (
          <button 
            type="button" 
            onClick={poursuivreAchats}
            style={{ 
              backgroundColor: "#95a5a6", 
              color: "white", 
              padding: "12px", 
              border: "none", 
              borderRadius: "8px", 
              cursor: "pointer", 
              fontWeight: "bold", 
              fontSize: "0.95rem",
              width: "100%",
              transition: "background-color 0.2s ease"
            }}
          >
            {isAr ? "⬅️ العودة إلى السلة" : "⬅️ Retour au panier"}
          </button>
        )}
      </form>
    </div>
  );
};

const styles = {
  button: { 
    backgroundColor: "#27ae60", 
    color: "white", 
    padding: "14px", 
    border: "none", 
    borderRadius: "8px", 
    cursor: "pointer", 
    fontWeight: "bold", 
    fontSize: "1rem",
    width: "100%",
    transition: "background-color 0.2s ease"
  }
};

export default FormulaireCommande;