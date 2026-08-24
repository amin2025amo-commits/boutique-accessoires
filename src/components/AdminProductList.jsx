import React from "react";

function AdminProductList({ adminProduitsOuvert, setAdminProduitsOuvert, listeAdminProduits, handleActiverEdition, handleDupliquerProduit, handleDeplacerProduit, handleSupprimerProduit, isMobile }) {
  return (
    <div style={{ backgroundColor: "white", padding: isMobile ? "15px" : "25px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
      <div 
        onClick={() => setAdminProduitsOuvert(!adminProduitsOuvert)} 
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "2px solid #eee", paddingBottom: "10px" }}
      >
        <h3 style={{ color: "#2c3e50", margin: 0, fontSize: isMobile ? "1.1rem" : "1.3rem" }}>⚙️ Produits ({listeAdminProduits.length})</h3>
        <button style={{ backgroundColor: "#34495e", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}>
          {adminProduitsOuvert ? "▲" : "▼"}
        </button>
      </div>

      {adminProduitsOuvert && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
          {listeAdminProduits.length === 0 ? (
            <p style={{ color: "#7f8c8d", textAlign: "center", margin: "10px 0" }}>Aucun produit en ligne.</p>
          ) : (
            listeAdminProduits.map((prod, index) => (
              <div key={prod.id} style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "stretch" : "center", 
                justifyContent: "space-between", 
                padding: "10px", 
                border: "1px solid #eee", 
                borderRadius: "8px", 
                backgroundColor: "#fbfbfb", 
                gap: "10px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={prod.image} alt={prod.name} style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px", border: "1px solid #eee", backgroundColor: "#fff" }} />
                  <div>
                    <strong style={{ color: "#2c3e50", display: "block", fontSize: "0.9rem" }}>{prod.name}</strong>
                    <div style={{ marginTop: "4px", display: "flex", gap: "8px", flexWrap: "wrap", fontSize: "0.8rem" }}>
                      <span style={{ color: "#e67e22", fontWeight: "bold" }}>{prod.price} DA</span>
                      <span style={{ color: prod.stock > 5 ? "#27ae60" : "#c0392b", fontWeight: "bold" }}>📦 Stock: {prod.stock || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto" }}>
                  <button onClick={() => handleDeplacerProduit(index, -1)} disabled={index === 0} title="Monter" style={{ backgroundColor: "#95a5a6", color: "white", border: "none", padding: "6px 9px", borderRadius: "6px", cursor: index === 0 ? "not-allowed" : "pointer", opacity: index === 0 ? 0.5 : 1, fontWeight: "600", fontSize: "1rem" }}>↑</button>
                  <button onClick={() => handleDeplacerProduit(index, 1)} disabled={index === listeAdminProduits.length - 1} title="Descendre" style={{ backgroundColor: "#95a5a6", color: "white", border: "none", padding: "6px 9px", borderRadius: "6px", cursor: index === listeAdminProduits.length - 1 ? "not-allowed" : "pointer", opacity: index === listeAdminProduits.length - 1 ? 0.5 : 1, fontWeight: "600", fontSize: "1rem" }}>↓</button>
                  <button onClick={() => handleActiverEdition(prod)} style={{ backgroundColor: "#3498db", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem", flex: 1 }}>✏️ Modifier</button>
                  <button onClick={() => handleDupliquerProduit(prod)} style={{ backgroundColor: "#27ae60", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem", flex: 1 }}>📋 Dupliquer</button>
                  <button onClick={() => handleSupprimerProduit(prod.id)} style={{ backgroundColor: "#c0392b", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem", flex: 1 }}>🗑️ Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AdminProductList;