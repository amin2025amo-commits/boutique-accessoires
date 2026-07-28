import { useState, useEffect } from "react";
import ListeProduits from "./components/ListeProduits";
import FormulaireCommande from "./components/FormulaireCommande";
import AdminOrders from "./components/AdminOrders";
import Header from "./components/Header";
import AdminProductForm from "./components/AdminProductForm";
import AdminProductList from "./components/AdminProductList";
import Footer from "./components/Footer"; 
import { translations } from "./translations";
import ProduitDetail from "./components/ProduitDetail";
import PanierPage from "./components/PanierPage"; // 👈 1. Import your new PanierPage component

import { db, auth, provider } from "./firebaseConfig";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";

function App() {
  const [lang, setLang] = useState("ar"); // "fr" ou "ar"
  const t = translations[lang];

  const [panier, setPanier] = useState([]);
  const [etape, setEtape] = useState(() => {
    return localStorage.getItem("currentEtape") || "boutique";
  });
  const [user, setUser] = useState(null);

  // --- Modal & Email Login States ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- Outil de Détection Mobile ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    localStorage.setItem("currentEtape", etape);
  }, [etape]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- États pour la gestion des produits (Multilingue FR / AR) ---
  const [listeAdminProduits, setListeAdminProduits] = useState([]); 
  const [nomProduitFr, setNomProduitFr] = useState("");
  const [nomProduitAr, setNomProduitAr] = useState("");
  const [descProduitFr, setDescProduitFr] = useState("");
  const [descProduitAr, setDescProduitAr] = useState("");
  
  const [prixProduit, setPrixProduit] = useState("");
  const [stockProduit, setStockProduit] = useState(""); 
  const [imageString, setImageString] = useState(""); 
  const [imageMode, setImageMode] = useState("file");
  const [imagesSecondaires, setImagesSecondaires] = useState([]); // Galerie images

  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [adminProduitsOuvert, setAdminProduitsOuvert] = useState(false);
  const [idProduitEnEdition, setIdProduitEnEdition] = useState(null);

  const [produitSelectionne, setProduitSelectionne] = useState(null);

  const voirProduit = (produit) => {
    setProduitSelectionne(produit);
    setEtape("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fonction pour supprimer un article complètement du panier
  const supprimerArticle = (id) => {
    setPanier(panier.filter(item => item.id !== id));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        chargerProduitsAdmin(); 
      }
    });
    return () => unsubscribe();
  }, []);

  const chargerProduitsAdmin = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "produits"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListeAdminProduits(docs);
    } catch (error) {
      console.error("Erreur chargement produits admin :", error);
    }
  };

  const UnifiedId = (p) => p.id || p._id;

  const ajouterAuPanier = (produit) => {
    setPanier((panierActuel) => {
      const produitExiste = panierActuel.find((item) => item.id === UnifiedId(produit));
      if (produitExiste) {
        return panierActuel.map((item) =>
          item.id === UnifiedId(produit) ? { ...item, quantite: item.quantite + 1 } : item
        );
      }
      return [...panierActuel, { ...produit, id: UnifiedId(produit), quantite: 1 }];
    });
  };

  const commanderDirectement = (produit) => {
    ajouterAuPanier(produit);
    setEtape("checkout"); 
  };

  const modifierQuantite = (id, changement) => {
    setPanier((panierActuel) =>
      panierActuel
        .map((item) => item.id === id ? { ...item, quantite: item.quantite + changement } : item)
        .filter((item) => item.quantite > 0)
    );
  };

  const verifierAccesAdmin = async (emailConnecte) => {
    const rawAdminEmails = import.meta.env.VITE_ADMIN_EMAIL || "";
    const ADMIN_EMAILS = rawAdminEmails.split(",").map(email => email.trim().toLowerCase());

    if (ADMIN_EMAILS.includes(emailConnecte.toLowerCase())) {
      setEtape("admin"); 
      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
      chargerProduitsAdmin(); 
    } else {
      await signOut(auth);
      setUser(null);
      setEtape("boutique");
      alert(lang === "ar" ? "⛔ تم رفض الوصول: أنت لست صاحب هذا المتجر." : "⛔ Accès interdit : Vous n'êtes pas le propriétaire de cette boutique.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await verifierAccesAdmin(result.user.email);
    } catch (error) {
      alert("Erreur de connexion Google : " + error.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      await verifierAccesAdmin(userCredential.user.email);
    } catch (error) {
      alert("Erreur de connexion : " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setEtape("boutique");
      localStorage.removeItem("currentEtape");
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangerImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/webp", 0.5);
          setImageString(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSoumettreProduit = async (e) => {
    e.preventDefault();
    setAjoutEnCours(true);
    try {
      const donneesProduit = {
        nom: {
          fr: nomProduitFr,
          ar: nomProduitAr || nomProduitFr
        },
        description: {
          fr: descProduitFr || "Aucune description",
          ar: descProduitAr || descProduitFr || "لا يوجد وصف"
        },
        prix: Number(prixProduit),
        stock: Number(stockProduit) || 0,
        imagesSecondaires: imagesSecondaires,
        validation: false,
        date: new Date()
      };
      if (imageString) donneesProduit.image = imageString;

      if (idProduitEnEdition) {
        await updateDoc(doc(db, "produits", idProduitEnEdition), donneesProduit);
        alert("✏️ Produit mis à jour !");
        setListeAdminProduits(listeAdminProduits.map(p => 
          p.id === idProduitEnEdition ? { id: p.id, ...donneesProduit, image: donneesProduit.image || p.image } : p
        ));
      } else {
        if (!imageString) { alert("Veuillez sélectionner une image."); setAjoutEnCours(false); return; }
        const docRef = await addDoc(collection(db, "produits"), donneesProduit);
        alert("🎉 Nouveau produit en ligne !");
        setListeAdminProduits([{ id: docRef.id, ...donneesProduit }, ...listeAdminProduits]);
      }
      annulerEdition();
    } catch (error) {
      alert("Erreur : " + error.message);
    } finally {
      setAjoutEnCours(false);
    }
  };

  const handleActiverEdition = (prod) => {
    setIdProduitEnEdition(prod.id);
    
    setNomProduitFr(typeof prod.nom === "object" ? prod.nom.fr || "" : prod.nom || prod.name || "");
    setNomProduitAr(typeof prod.nom === "object" ? prod.nom.ar || "" : "");
    
    setDescProduitFr(typeof prod.description === "object" ? prod.description.fr || "" : prod.description || "");
    setDescProduitAr(typeof prod.description === "object" ? prod.description.ar || "" : "");
    
    setPrixProduit(prod.prix || prod.price || "");
    setStockProduit(prod.stock !== undefined ? prod.stock : "");
    setImageString(prod.image || "");
    setImageMode(prod.image && prod.image.startsWith("http") ? "url" : "file");
    setImagesSecondaires(prod.imagesSecondaires || []);
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const annulerEdition = () => {
    setIdProduitEnEdition(null);
    setNomProduitFr(""); setNomProduitAr("");
    setDescProduitFr(""); setDescProduitAr("");
    setPrixProduit(""); setStockProduit(""); setImageString("");
    setImagesSecondaires([]);
    setImageMode("file");
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleSupprimerProduit = async (id) => {
    if (!window.confirm("Supprimer définitivement ce produit ?")) return;
    try {
      await deleteDoc(doc(db, "produits", id));
      setListeAdminProduits(listeAdminProduits.filter(p => p.id !== id));
      if (idProduitEnEdition === id) annulerEdition();
      alert("Produit supprimé !");
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  const totalArticles = panier.reduce((total, item) => total + item.quantite, 0);
  const totalPrix = panier.reduce((sum, item) => sum + item.prix * (item.quantite || 1), 0);

  return (
    <div 
      dir={t.dir} 
      style={{ 
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
        backgroundColor: "#f4f4f4", 
        minHeight: "100vh",
        display: "flex",        
        flexDirection: "column" 
      }}
    >
      {/* HEADER */}
      <Header 
        user={user} etape={etape} setEtape={setEtape} 
        handleLogin={() => setShowLoginModal(true)} 
        handleLogout={handleLogout} 
        totalArticles={totalArticles} chargerProduitsAdmin={chargerProduitsAdmin}
        isMobile={isMobile}
        onCartIconClick={() => setEtape("panier")} // 👈 2. Updated to point to the cart view step instead of checkout
        lang={lang}
        setLang={setLang}
      />

      {/* MODAL DE CONNEXION OPTIONNELLE */}
      {showLoginModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 2000,
          display: "flex", justifyContent: "center", alignItems: "center", padding: "15px"
        }}>
          <div style={{
            backgroundColor: "white", padding: "30px", borderRadius: "12px",
            maxWidth: "400px", width: "100%", boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
            position: "relative"
          }}>
            <button 
              onClick={() => setShowLoginModal(false)}
              style={{ position: "absolute", top: "12px", right: "15px", border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}
            >
              ✕
            </button>

            <h3 style={{ textAlign: "center", marginTop: 0, color: "#2c3e50" }}>{t.adminConnexion}</h3>

            <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
              <input 
                type="email" 
                placeholder={t.emailPlaceholder} 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <input 
                type="password" 
                placeholder={t.passwordPlaceholder} 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
              <button 
                type="submit" 
                style={{ backgroundColor: "#2c3e50", color: "white", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                {t.connect}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
              <span style={{ padding: "0 10px", color: "#888", fontSize: "0.85rem" }}>{t.or}</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }}></div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              style={{
                width: "100%", backgroundColor: "#4285F4", color: "white",
                padding: "10px", border: "none", borderRadius: "6px",
                fontWeight: "bold", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", gap: "10px"
              }}
            >
              {t.continueGoogle}
            </button>
          </div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <main style={{ 
        padding: isMobile ? "15px 10px" : "30px 20px", 
        paddingBottom: "40px", 
        flex: 1,
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
      }}>
        
        {/* VUE DETAIL PRODUIT */}
        {etape === "detail" && produitSelectionne && (
          <ProduitDetail 
            produit={produitSelectionne}
            onAjouter={ajouterAuPanier}
            onCommander={commanderDirectement}
            onRetour={() => setEtape("boutique")}
            isMobile={isMobile}
            lang={lang}
          />
        )}

        {/* VUE PANIER (Nouvel écran de gestion du panier) */}
        {etape === "panier" && (
          <div style={{ paddingTop: "10px" }}>
            <PanierPage 
              panier={panier}
              modifierQuantite={modifierQuantite}
              supprimerArticle={supprimerArticle}
              viderPanier={() => setPanier([])}
              totalPrix={totalPrix}
              totalArticles={totalArticles}
              setEtape={setEtape}
              isMobile={isMobile}
              lang={lang}
            />
          </div>
        )}

        {/* VUE BOUTIQUE */}
        {etape === "boutique" && (
          <div>
            <div style={{ textAlign: "center", padding: "10px 10px 20px" }}>
              <h2 style={{ color: "#2c3e50", margin: "0 0 5px 0", fontSize: isMobile ? "1.4rem" : "2rem" }}>
                {t.ourProducts}
              </h2>
              <p style={{ color: "#7f8c8d", margin: 0, fontSize: isMobile ? "0.85rem" : "1rem" }}>
                {t.subtitle}
              </p>
            </div>
            
            <ListeProduits 
              onAjouter={ajouterAuPanier} 
              onCommander={commanderDirectement} 
              onVoirProduit={voirProduit} 
              lang={lang} 
            />

            {panier.length > 0 && (
              <div style={{
                position: "fixed", bottom: "20px", right: t.dir === "rtl" ? "auto" : "20px", left: t.dir === "rtl" ? "20px" : "20px",
                maxWidth: "500px", margin: "0 auto", backgroundColor: "#e67e22",
                color: "white", padding: "15px 20px", borderRadius: "30px",
                boxShadow: "0 8px 25px rgba(230, 126, 34, 0.3)", display: "flex",
                justifyContent: "space-between", alignItems: "center",
                cursor: "pointer", zIndex: 999, fontWeight: "bold"
              }}
              onClick={() => setEtape("panier")}
              >
                <span>🛒 {t.viewCart} ({totalArticles})</span>
                <span>{t.checkout} {t.dir === "rtl" ? "⟵" : "➔"}</span>
              </div>
            )}
          </div>
        )}

        {/* VUE CHECKOUT */}
        {etape === "checkout" && (
          <div style={{ paddingTop: "10px" }}>
            <FormulaireCommande 
              panier={panier} 
              viderPanier={() => setPanier([])} 
              modifierQuantite={modifierQuantite}
              poursuivreAchats={() => setEtape("panier")} 
              isMobile={isMobile}
              lang={lang}
            />
          </div>
        )}

        {/* VUE ADMIN */}
        {etape === "admin" && (
          <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
            {user ? (
              <div>
                <AdminProductForm 
                  idProduitEnEdition={idProduitEnEdition} 
                  nomProduitFr={nomProduitFr} setNomProduitFr={setNomProduitFr}
                  nomProduitAr={nomProduitAr} setNomProduitAr={setNomProduitAr}
                  descProduitFr={descProduitFr} setDescProduitFr={setDescProduitFr}
                  descProduitAr={descProduitAr} setDescProduitAr={setDescProduitAr}
                  prixProduit={prixProduit} setPrixProduit={setPrixProduit} 
                  stockProduit={stockProduit} setStockProduit={setStockProduit}
                  imageString={imageString} setImageString={setImageString}
                  imageMode={imageMode} setImageMode={setImageMode}
                  imagesSecondaires={imagesSecondaires} setImagesSecondaires={setImagesSecondaires}
                  handleChangerImage={handleChangerImage} handleSoumettreProduit={handleSoumettreProduit}
                  ajoutEnCours={ajoutEnCours} annulerEdition={annulerEdition}
                  isMobile={isMobile}
                  lang={lang}
                />

                <AdminProductList 
                  adminProduitsOuvert={adminProduitsOuvert} setAdminProduitsOuvert={setAdminProduitsOuvert}
                  listeAdminProduits={listeAdminProduits} handleActiverEdition={handleActiverEdition}
                  handleSupprimerProduit={handleSupprimerProduit}
                  isMobile={isMobile}
                  lang={lang}
                />

                <hr style={{ border: "0", borderTop: "2px solid #ddd", margin: "30px 0" }} />

                <AdminOrders 
                  listeAdminProduits={listeAdminProduits} 
                  setListeAdminProduits={setListeAdminProduits} 
                  isMobile={isMobile}
                  lang={lang}
                />
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "50px" }}><p style={{ color: "#c0392b", fontWeight: "bold" }}>{t.accessDenied}</p></div>
            )}
          </div>
        )}
      </main>

      <Footer isMobile={isMobile} lang={lang} />
    </div>
  );
}

export default App;