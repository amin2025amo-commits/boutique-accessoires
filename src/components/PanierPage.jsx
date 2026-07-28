import React from "react";

function PanierPage({ panier, modifierQuantite, supprimerArticle, viderPanier, totalPrix, totalArticles, setEtape, isMobile, lang }) {
  const isAr = lang === "ar";

  return (
    <div style={{ 
      maxWidth: "650px", 
      margin: isMobile ? "20px auto" : "40px auto", 
      backgroundColor: "white", 
      padding: isMobile ? "15px" : "25px 30px", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
      borderRadius: "15px", 
      border: "2px solid #e67e22",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      direction: isAr ? "rtl" : "ltr",
      textAlign: isAr ? "right" : "left"
    }}>
      <h3 style={{ margin: 0, color: "#2c3e50", borderBottom: "1px solid #eee", paddingBottom: "12px", fontSize: "1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{isAr ? "🛒 سلة التسوق" : "🛒 Votre Panier"} ({totalArticles} {isAr ? "أنتجات" : "articles"})</span>
      </h3>

      {panier.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: "#7f8c8d" }}>
          <p style={{ fontSize: "1.1rem", marginBottom: "15px" }}>
            {isAr ? "سلة التسوق فارغة." : "Votre panier est vide."}
          </p>
          <button 
            onClick={() => setEtape("boutique")} 
            style={{ backgroundColor: "#2c3e50", color: "white", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
          >
            {isAr ? "مواصلة التسوق" : "Continuer mes achats"}
          </button>
        </div>
      ) : (
        <>
          {/* Liste des articles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
            {panier.map((item) => {
              const nomProduit = typeof item.nom === "object" && item.nom !== null
                ? (item.nom[lang] || item.nom.fr || Object.values(item.nom)[0] || "")
                : (item.nom || "");

              return (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f1f1" }}>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", color: "#2c3e50", fontSize: "1rem" }}>{nomProduit}</span>
                    <span style={{ color: "#e67e22", fontSize: "0.9rem", fontWeight: "600" }}>{item.prix * item.quantite} DA</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Contrôles de quantité (+ / -) */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f8f9fa", padding: "4px 8px", borderRadius: "8px", border: "1px solid #ddd" }}>
                      <button
                        type="button"
                        onClick={() => modifierQuantite(item.id, -1)}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #ccc", backgroundColor: "#fff", cursor: "pointer", fontWeight: "bold" }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: "1rem", fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>
                        {item.quantite}
                      </span>
                      <button
                        type="button"
                        onClick={() => modifierQuantite(item.id, 1)}
                        style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #ccc", backgroundColor: "#fff", cursor: "pointer", fontWeight: "bold" }}
                      >
                        +
                      </button>
                    </div>

                    {/* Bouton pour supprimer un article spécifique */}
                    <button
                      type="button"
                      onClick={() => supprimerArticle(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "4px" }}
                      title={isAr ? "حذف المنتج" : "Supprimer l'article"}
                    >
                      🗑️
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Section Totaux et Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "10px", borderTop: "2px solid #eee", paddingTop: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "1rem", color: "#7f8c8d" }}>{isAr ? "المجموع الكلي :" : "Total général :"}</span>
              <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#2c3e50" }}>{totalPrix} DA</span>
            </div>

            <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
              <button 
                onClick={viderPanier} 
                style={{ flex: 1, backgroundColor: "#e74c3c", color: "white", padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
              >
                {isAr ? "إفراغ السلة" : "Vider le panier"}
              </button>
              <button 
                onClick={() => setEtape("checkout")} 
                style={{ flex: 1, backgroundColor: "#27ae60", color: "white", padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
              >
                {isAr ? "إتمام الطلب ➔" : "Passer à la commande ➔"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PanierPage;