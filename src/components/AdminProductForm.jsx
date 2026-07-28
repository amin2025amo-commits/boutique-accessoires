import React, { useState } from "react";

const AdminProductForm = ({
  idProduitEnEdition,
  nomProduitFr,
  setNomProduitFr,
  nomProduitAr,
  setNomProduitAr,
  descProduitFr,
  setDescProduitFr,
  descProduitAr,
  setDescProduitAr,
  prixProduit,
  setPrixProduit,
  stockProduit,
  setStockProduit,
  imageString,
  setImageString,
  imageMode,
  setImageMode,
  imagesSecondaires = [],
  setImagesSecondaires,
  handleChangerImagesSecondaires,
  handleChangerImage,
  handleSoumettreProduit,
  ajoutEnCours,
  annulerEdition,
  isMobile
}) => {
  const [galleryMode, setGalleryMode] = useState("url"); // Defaulting to URL mode for ease
  const [tempGalleryUrl, setTempGalleryUrl] = useState("");

  const ajouterUrlGalerie = (e) => {
    e.preventDefault(); // Stop form submission
    if (tempGalleryUrl.trim()) {
      if (typeof setImagesSecondaires === "function") {
        setImagesSecondaires([...imagesSecondaires, tempGalleryUrl.trim()]);
      }
      setTempGalleryUrl("");
    }
  };

  const supprimerImageGalerie = (indexToRemove) => {
    if (typeof setImagesSecondaires === "function") {
      setImagesSecondaires(imagesSecondaires.filter((_, index) => index !== indexToRemove));
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: isMobile ? "20px 15px" : "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
        marginBottom: "30px"
      }}
    >
      <h3 style={{ marginTop: 0, color: "#2c3e50", display: "flex", alignItems: "center", gap: "10px" }}>
        {idProduitEnEdition ? "✏️ Modifier le produit" : "➕ Ajouter un nouveau produit"}
      </h3>

      <form onSubmit={handleSoumettreProduit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* --- NOMS DU PRODUIT (FR & AR) --- */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
              Nom du produit (Français) *
            </label>
            <input
              type="text"
              placeholder="ex: T-Shirt Coton"
              value={nomProduitFr}
              onChange={(e) => setNomProduitFr(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
              اسم المنتج (بالعربية)
            </label>
            <input
              type="text"
              placeholder="مثال: قميص قطني"
              dir="rtl"
              value={nomProduitAr}
              onChange={(e) => setNomProduitAr(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* --- PRIX ET STOCK --- */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
              Prix (DA) *
            </label>
            <input
              type="number"
              placeholder="ex: 2500"
              value={prixProduit}
              onChange={(e) => setPrixProduit(e.target.value)}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
              Stock
            </label>
            <input
              type="number"
              placeholder="ex: 10"
              value={stockProduit}
              onChange={(e) => setStockProduit(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* --- DESCRIPTIONS (FR & AR) --- */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
            Description (Français)
          </label>
          <textarea
            rows="3"
            placeholder="Description détaillée en français..."
            value={descProduitFr}
            onChange={(e) => setDescProduitFr(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", resize: "vertical" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
            الوصف (بالعربية)
          </label>
          <textarea
            rows="3"
            dir="rtl"
            placeholder="وصف مفصل باللغة العربية..."
            value={descProduitAr}
            onChange={(e) => setDescProduitAr(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box", resize: "vertical" }}
          />
        </div>

        {/* --- IMAGE PRINCIPALE --- */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
              🖼️ Image principale
            </label>
            <button
              type="button"
              onClick={() => setImageMode(imageMode === "file" ? "url" : "file")}
              style={{ background: "none", border: "none", color: "#2980b9", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem" }}
            >
              {imageMode === "file" ? "Utiliser un lien URL (ImgBB...)" : "Téléverser un fichier local"}
            </button>
          </div>

          {imageMode === "file" ? (
            <input type="file" accept="image/*" onChange={handleChangerImage} style={{ marginTop: "5px" }} />
          ) : (
            <input
              type="url"
              placeholder="https://i.ibb.co/..."
              value={imageString}
              onChange={(e) => setImageString(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          )}

          {imageString && (
            <div style={{ marginTop: "10px" }}>
              <img src={imageString} alt="Aperçu principal" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #ddd" }} />
            </div>
          )}
        </div>

        {/* --- IMAGES SECONDAIRES (GALERIE) --- */}
        <div style={{ borderTop: "1px dashed #ccc", paddingTop: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#34495e" }}>
              🖼️ Images secondaires (Galerie)
            </label>
            <button
              type="button"
              onClick={() => setGalleryMode(galleryMode === "file" ? "url" : "file")}
              style={{ background: "none", border: "none", color: "#2980b9", textDecoration: "underline", cursor: "pointer", fontSize: "0.85rem" }}
            >
              {galleryMode === "file" ? "Ajouter via liens URL (ImgBB...)" : "Téléverser des fichiers locaux"}
            </button>
          </div>

          {galleryMode === "file" ? (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleChangerImagesSecondaires}
              style={{ marginTop: "5px" }}
            />
          ) : (
            <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
              <input
                type="url"
                placeholder="https://i.ibb.co/..."
                value={tempGalleryUrl}
                onChange={(e) => setTempGalleryUrl(e.target.value)}
                style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <button
                type="button"
                onClick={ajouterUrlGalerie}
                style={{ backgroundColor: "#3498db", color: "white", border: "none", padding: "8px 15px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                + Ajouter
              </button>
            </div>
          )}

          {/* Gallery Thumbnails List */}
          {imagesSecondaires && imagesSecondaires.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              {imagesSecondaires.map((img, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img
                    src={img}
                    alt={`Galerie ${index + 1}`}
                    style={{ width: "65px", height: "65px", objectFit: "cover", borderRadius: "6px", border: "1px solid #ddd" }}
                  />
                  <button
                    type="button"
                    onClick={() => supprimerImageGalerie(index)}
                    style={{
                      position: "absolute", top: "-6px", right: "-6px",
                      backgroundColor: "#e74c3c", color: "white", border: "none",
                      borderRadius: "50%", width: "18px", height: "18px",
                      fontSize: "0.7rem", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center"
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- BOUTONS D'ACTION --- */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button
            type="submit"
            disabled={ajoutEnCours}
            style={{
              backgroundColor: idProduitEnEdition ? "#e67e22" : "#27ae60",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: ajoutEnCours ? "not-allowed" : "pointer",
              opacity: ajoutEnCours ? 0.7 : 1
            }}
          >
            {ajoutEnCours ? "Enregistrement..." : idProduitEnEdition ? "Mettre à jour" : "Enregistrer"}
          </button>

          {idProduitEnEdition && (
            <button
              type="button"
              onClick={annulerEdition}
              style={{
                backgroundColor: "#7f8c8d",
                color: "white",
                border: "none",
                padding: "12px 20px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;