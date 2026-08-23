function Footer({ isMobile, facebookUrl, telephone }) {
  const numeros = telephone.split("/").map((numero) => numero.trim()).filter(Boolean);

  return (
    <footer style={{
      backgroundColor: "#ffffff",
      color: "#2c3e50",
      padding: isMobile ? "15px 10px" : "25px 20px",
      textAlign: "center",
      borderTop: "3px solid #f1c40f", // Rappel du liseré jaune jouet du Header
      marginTop: "auto",
      boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
      width: "100%",
      boxSizing: "border-box"
    }}>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: "10px" 
      }}>
        
        <span style={{ 
          fontWeight: "bold", 
          fontSize: isMobile ? "0.9rem" : "1.05rem",
          color: "#2c3e50"
        }}>
          Nous contacter :
        </span>
        
        {/* Conteneur horizontal pour les boutons de contact */}
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row", 
          alignItems: "center", 
          justifyContent: "center",
          gap: "12px",
          width: "100%"
        }}>
          
          {/* 🟦 Lien cliquable vers Facebook */}
          <a 
            href={facebookUrl}
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "#1877F2", // Couleur officielle Facebook
              fontWeight: "600",
              fontSize: isMobile ? "0.85rem" : "0.95rem",
              backgroundColor: "#f0f2f5",
              padding: "8px 16px",
              borderRadius: "20px",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#e4e6eb";
              e.currentTarget.style.transform = "scale(1.03)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f2f5";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {/* Logo Facebook officiel stylisé en SVG */}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Page Facebook
          </a>

          {/* 📞 Gestion intelligente du numéro de téléphone */}
          {numeros.map((numero) => isMobile ? (
            <a
              key={numero}
              href={`tel:${numero.replace(/\D/g, "")}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#e67e22",
                fontWeight: "bold",
                fontSize: "0.85rem",
                textDecoration: "none",
                backgroundColor: "#fdf2e9",
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px dashed #e67e22",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <span>📞</span> {numero}
            </a>
          ) : (
            <div
              key={numero}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#e67e22",
                fontWeight: "bold",
                fontSize: "0.95rem",
                backgroundColor: "#fdf2e9",
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px dashed #e67e22",
                cursor: "text"
              }}
              title="Sélectionnez ce numéro pour composer l'appel"
            >
              <span>📞</span> {numero}
            </div>
          ))}

        </div>
      </div>
      
      {/* Copyright tout en bas */}
      <p style={{ fontSize: "0.7rem", color: "#7f8c8d", marginTop: "15px", marginBottom: 0 }}>
        &copy; {new Date().getFullYear()} Dz-Market - Tous droits réservés.
      </p>
    </footer>
  );
}

export default Footer;