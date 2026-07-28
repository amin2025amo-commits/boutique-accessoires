import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { translations } from "../translations";

const ListeProduits = ({ onAjouter, onCommander, onVoirProduit, lang = "fr" }) => {
  const isAr = lang === "ar";
  const t = translations[lang] || translations.fr;

  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "produits"));
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setProduits(list);
      } catch (error) {
        console.error("Erreur chargement produits: ", error);
      } finally {
        setChargement(false);
      }
    };

    fetchProduits();
  }, []);

  if (chargement) {
    return <p style={{ textAlign: "center", padding: "30px", color: "#7f8c8d" }}>Chargement...</p>;
  }

  if (produits.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 15px", color: "#7f8c8d" }}>
        <p>{isAr ? "لا توجد منتجات متاحة حالياً." : "Aucun produit disponible pour le moment."}</p>
      </div>
    );
  }

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "20px",
        padding: "10px 0"
      }}
    >
      {produits.map((produit) => {
        // Localized name & description extractions
        const nomAffiche = typeof produit.nom === "object" 
          ? (produit.nom[lang] || produit.nom.fr || produit.nom.ar) 
          : produit.nom;

        const descAffichee = typeof produit.description === "object" 
          ? (produit.description[lang] || produit.description.fr || produit.description.ar) 
          : produit.description;

        return (
          <div
            key={produit.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.2s ease",
              cursor: "pointer"
            }}
          >
            {/* Clickable Card Header & Image */}
            <div onClick={() => onVoirProduit && onVoirProduit(produit)}>
              <div
                style={{
                  height: "200px",
                  backgroundColor: "#f8f9fa",
                  overflow: "hidden",
                  position: "relative"
                }}
              >
                <img
                  src={produit.image || "https://via.placeholder.com/200"}
                  alt={nomAffiche}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </div>

              <div style={{ padding: "15px 15px 5px 15px" }}>
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "1.05rem",
                    color: "#2c3e50",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {nomAffiche}
                </h3>

                <p
                  style={{
                    margin: "0 0 10px 0",
                    color: "#7f8c8d",
                    fontSize: "0.85rem",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: "1.4"
                  }}
                >
                  {descAffichee || (isAr ? "اضغط لعرض التفاصيل" : "Cliquez pour voir les détails")}
                </p>

                <div
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    color: "#27ae60",
                    marginBottom: "10px"
                  }}
                >
                  {produit.prix} {isAr ? "د.ج" : "DA"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: "0 15px 15px 15px", display: "flex", gap: "8px" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCommander(produit);
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "9px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                {isAr ? "شراء" : "Acheter"}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAjouter(produit);
                }}
                style={{
                  backgroundColor: "#ecf0f1",
                  color: "#2c3e50",
                  border: "1px solid #bdc3c7",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "0.85rem"
                }}
              >
                🛒
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListeProduits;