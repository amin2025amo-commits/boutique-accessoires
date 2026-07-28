import React from "react";

function PanierApercu({ panier, modifierQuantite, viderLePanierComplet, totalPrix, totalArticles, setEtape, isMobile }) {
  return (
    <div style={{ 
      maxWidth: "650px", 
      margin: isMobile ? "20px auto" : "40px auto 20px auto", 
      backgroundColor: "white", 
      padding: isMobile ? "15px" : "25px 30px", 
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)", 
      borderRadius: "15px", 
      border: "2px solid #e67e22",
      display: "flex",
      flexDirection: "column",
      gap: "15px"
    }}>
      <h4 style={{ margin: 0, color: "#2c3e50", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>📋 Votre Panier</h4>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {panier.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            
            {/* Bouton Moins */}
            <button
              type="button"
              onClick={() => {
                if (item.quantite > 1) {
                  modifierQuantite(item.id, -1);
                }
              }}
              disabled={item.quantite <= 1}
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                border: "1px solid #ccc", 
                backgroundColor: "#fff", 
                cursor: item.quantite > 1 ? "pointer" : "not-allowed", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                fontSize: "1.2rem", 
                fontWeight: "bold", 
                color: item.quantite > 1 ? "#2c3e50" : "#ccc",
                transition: "all 0.2s"
              }}
            >
              -
            </button>
            
            {/* Quantité */}
            <span style={{ 
              fontSize: "1.2rem", 
              fontWeight: "bold", 
              color: "#2c3e50", 
              minWidth: "25px", 
              textAlign: "center",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
            }}>
              {item.quantite}
            </span>
            
            {/* Bouton Plus */}
            <button
              type="button"
              onClick={() => modifierQuantite(item.id, 1)}
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                border: "1px solid #ccc", 
                backgroundColor: "#fff", 
                cursor: "pointer", 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                fontSize: "1.2rem", 
                fontWeight: "bold", 
                color: "#2c3e50",
                transition: "all 0.2s"
              }}
            >
              +
            </button>

          </div>
        ))}
      </div>

      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", 
        alignItems: isMobile ? "stretch" : "center", 
        marginTop: "10px", 
        gap: "15px" 
      }}>
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <span style={{ display: "block", fontSize: "0.8rem", color: "#7f8c8d" }}>Total général :</span>
          <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2c3e50" }}>{totalPrix} DA</span>
        </div>
        
        <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
          {/* Bouton Vider le Panier */}
          <button 
            type="button"
            onClick={viderLePanierComplet} 
            style={{ 
              backgroundColor: "#e74c3c", 
              color: "white", 
              padding: "10px 15px", 
              border: "none", 
              borderRadius: "8px", 
              fontSize: "0.9rem", 
              cursor: "pointer", 
              fontWeight: "600" 
            }}
          >
            🗑️ Vider le panier
          </button>

          {/* Bouton Commander */}
          <button 
            type="button"
            onClick={() => setEtape("checkout")} 
            style={{ 
              backgroundColor: "#e67e22", 
              color: "white", 
              padding: "12px", 
              border: "none", 
              borderRadius: "8px", 
              fontSize: "0.95rem", 
              cursor: "pointer", 
              fontWeight: "bold" 
            }}
          >
            🛒 Commander ({totalArticles})
          </button>
        </div>
      </div>
    </div>
  );
}

export default PanierApercu;