import React from "react";
import logoGift from "../assets/gift-shop-logo.png"; 
import { translations } from "../translations";

function Header({ 
  user, 
  etape, 
  setEtape, 
  handleLogin, 
  handleLogout, 
  totalArticles, 
  isMobile,
  lang = "fr",
  setLang 
}) {
  const t = translations[lang] || translations.fr;

  return (
    <header style={{
      backgroundColor: "#ffffff", 
      color: "#2c3e50", 
      padding: isMobile ? "5px 10px" : "5px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)", 
      position: "sticky",
      top: 0,
      zIndex: 1000,
      height: isMobile ? "60px" : "80px",
      boxSizing: "border-box",
      borderBottom: "3px solid #f1c40f"
    }}>
      
      {/* 🎯 GAUCHE : LOGO */}
      <div 
        onClick={() => setEtape("boutique")} 
        style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <img 
          src={logoGift} 
          alt="Gift Shop Logo" 
          style={{ 
            height: isMobile ? "50px" : "75px", 
            width: "auto",
            objectFit: "contain",
            transition: "transform 0.2s"
          }} 
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05) rotate(-2deg)"} 
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}
        />
      </div>

      {/* 🎯 DROITE : BOUTONS, LANGUE ET PANIER */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "10px" : "20px" }}>
        
        {/* Sélecteur de Langue (Bouton Header) */}
        {setLang && (
          <button
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            style={{
              backgroundColor: "#f8f9fa",
              color: "#2c3e50",
              border: "1px solid #dcdde1",
              padding: isMobile ? "4px 8px" : "6px 12px",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: isMobile ? "0.75rem" : "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            {lang === "fr" ? "🇩🇿 العربية" : "🇫🇷 FR"}
          </button>
        )}

        {/* Badge Admin */}
        {user && user.email === "anguekoussama.emp@gmail.com" && (
          <button
            onClick={() => setEtape(etape === "admin" ? "boutique" : "admin")}
            style={{
              backgroundColor: etape === "admin" ? "#2ecc71" : "#e67e22",
              color: "white",
              border: "none",
              padding: isMobile ? "6px 10px" : "8px 18px",
              borderRadius: "25px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: isMobile ? "0.75rem" : "0.9rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            {etape === "admin" 
              ? (lang === "ar" ? "🏠 المتجر" : "🏠 Boutique") 
              : (lang === "ar" ? "⚙️ الإدارة" : "⚙️ Gestion")
            }
          </button>
        )}

        {/* Panier avec badge rouge */}
        {etape !== "admin" && (
          <div 
            onClick={() => setEtape("panier")}
            style={{ 
              position: "relative", 
              cursor: "pointer",
              fontSize: isMobile ? "1.3rem" : "1.8rem",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.1))"
            }}
          >
            🛒
            {totalArticles > 0 && (
              <span style={{
                position: "absolute",
                top: "-5px",
                right: t.dir === "rtl" ? "auto" : "-10px",
                left: t.dir === "rtl" ? "-10px" : "auto",
                backgroundColor: "#e74c3c",
                color: "white",
                borderRadius: "50%",
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: "bold",
                border: "2px solid white"
              }}>
                {totalArticles}
              </span>
            )}
          </div>
        )}

        {/* Connexion / Profil */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!isMobile && <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#34495e" }}>{user.displayName}</span>}
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: "#ecf0f1",
                color: "#e74c3c",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "bold"
              }}
            >
              {lang === "ar" ? "خروج" : "Quitter"}
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            style={{
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              padding: isMobile ? "8px 12px" : "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: isMobile ? "0.8rem" : "0.9rem",
              fontWeight: "bold",
              boxShadow: "0 2px 5px rgba(52, 152, 219, 0.3)"
            }}
          >
            {lang === "ar" ? "دخول" : "Connexion"}
          </button>
        )}

      </div>

    </header>
  );
}

export default Header;