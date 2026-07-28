import { useState } from "react";
import { translations } from "../translations";

const ProduitDetail = ({ produit, onAjouter, onCommander, onRetour, isMobile, lang = "fr" }) => {
  const isAr = lang === "ar";
  const t = translations[lang] || translations.fr;

  // Safe helper function to resolve localized objects { fr, ar } or legacy strings
  const getLangText = (field) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field.fr || field.ar || "";
  };

  // Helper to parse description lines and make sub-titles (text before ':') bold
  const renderFormattedDescription = (text) => {
    if (!text) return null;

    return text.split("\n").map((line, index) => {
      if (line.includes(":")) {
        const [title, ...rest] = line.split(":");
        const content = rest.join(":");

        return (
          <span key={index} style={{ display: "block", marginBottom: "4px" }}>
            <strong style={{ fontWeight: "700", color: "#2c3e50" }}>
              {title}:
            </strong>
            {content}
          </span>
        );
      }

      return (
        <span key={index} style={{ display: "block", marginBottom: "4px" }}>
          {line}
        </span>
      );
    });
  };

  // Combine main image and secondary gallery images
  const allImages = [
    produit?.image,
    ...(Array.isArray(produit?.imagesSecondaires) ? produit.imagesSecondaires : []),
    ...(Array.isArray(produit?.images) ? produit.images : [])
  ].filter(Boolean);

  // Fallback to single image if array is empty
  const images = allImages.length > 0 ? allImages : [produit?.image].filter(Boolean);

  const [imageActive, setImageActive] = useState(images[0] || "");

  if (!produit) return null;

  const nomAffichage = getLangText(produit.nom);
  const descAffichage = getLangText(produit.description);

  return (
    <div 
      dir={isAr ? "rtl" : "ltr"}
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: isMobile ? "20px 15px" : "35px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        maxWidth: "900px",
        margin: "0 auto",
        fontFamily: "inherit"
      }}
    >
      {/* Back Button */}
      <button
        onClick={onRetour}
        style={{
          background: "none",
          border: "none",
          color: "#2c3e50",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        {isAr ? "➔ العودة للمتجر" : "← Retour à la boutique"}
      </button>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: "30px",
        alignItems: "start"
      }}>
        
        {/* LEFT COLUMN: Gallery */}
        <div>
          {/* Main Display Image */}
          <div style={{
            width: "100%",
            height: isMobile ? "280px" : "380px",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: "#f9f9f9",
            border: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img 
              src={imageActive || produit.image} 
              alt={nomAffichage} 
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "12px",
              overflowX: "auto",
              paddingBottom: "5px"
            }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImageActive(img)}
                  style={{
                    border: imageActive === img ? "2px solid #27ae60" : "1px solid #ddd",
                    borderRadius: "6px",
                    padding: 0,
                    cursor: "pointer",
                    overflow: "hidden",
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#fff",
                    flexShrink: 0
                  }}
                >
                  <img 
                    src={img} 
                    alt="" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <h1 style={{ margin: 0, color: "#2c3e50", fontSize: isMobile ? "1.1rem" : "1.3rem" }}>
            {nomAffichage}
          </h1>

          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#27ae60" }}>
            {produit.prix} {isAr ? "د.ج" : "DA"}
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #eee", margin: "5px 0" }} />

          {/* Full Description */}
          <div>
            <h4 style={{ margin: "0 0 8px 0", color: "#7f8c8d" }}>
              {isAr ? "الوصف :" : "Description :"}
            </h4>
            <div style={{ 
              color: "#34495e", 
              lineHeight: "1.6", 
              fontSize: "0.98rem"
            }}>
              {descAffichage 
                ? renderFormattedDescription(descAffichage) 
                : (isAr ? "لا يوجد وصف متوفر" : "Aucune description disponible.")}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
            <button
              onClick={() => onCommander(produit)}
              style={{
                backgroundColor: "#27ae60",
                color: "white",
                padding: "14px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer"
              }}
            >
              {isAr ? "شراء الآن" : "Acheter maintenant"}
            </button>

            <button
              onClick={() => onAjouter(produit)}
              style={{
                backgroundColor: "#ecf0f1",
                color: "#2c3e50",
                padding: "12px",
                border: "1px solid #bdc3c7",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "0.95rem",
                cursor: "pointer"
              }}
            >
              🛒 {isAr ? "إضافة إلى السلة" : "Ajouter au panier"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProduitDetail;