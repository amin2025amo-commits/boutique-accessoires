import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { handleImprimerFiche } from '../utils/imprimerBordereau';

const AdminOrders = ({ listeAdminProduits, setListeAdminProduits, isMobile }) => {
  const [orders, setOrders] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [filtreStatus, setFiltreStatus] = useState("Tout"); 
  const [optionsFragile, setOptionsFragile] = useState({});
  
  // Safe helper to extract text from multilang objects {fr, ar} or simple strings
  const getLangText = (field, currentLang = "fr") => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[currentLang] || field.fr || field.ar || "";
  };

  const fetchOrders = async () => {
    setChargement(true);
    try {
      const commandesRef = collection(db, 'commandes');
      const q = query(commandesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(docs);
    } catch (error) {
      console.error(error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const toggleFragile = (orderId) => {
    setOptionsFragile(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const synchroniserStatutGoogleSheet = async (order, statut) => {
    const response = await fetch("/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", order: { ...order, statut } })
    });
    if (!response.ok) throw new Error("La synchronisation Google Sheets a échoué.");
  };

  const modifierStatut = async (order, statut) => {
    try {
      await updateDoc(doc(db, 'commandes', order.id), { statut });
      const commandeModifiee = { ...order, statut };
      setOrders(orders.map(o => o.id === order.id ? commandeModifiee : o));
      await synchroniserStatutGoogleSheet(commandeModifiee, statut);
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut : " + error.message);
    }
  };

  const handleConfirmer = (order) => modifierStatut(order, "Confirmé");

  const handleLivre = async (order) => {
    const confirmation = window.confirm("Confirmer que cette commande a été livrée ? Le stock des articles sera réduit automatiquement.");
    if (!confirmation) return;

    try {
      if (order.articles && order.articles.length > 0) {
        for (const item of order.articles) {
          if (item.id) {
            const produitRef = doc(db, 'products', item.id);
            const prodSnap = await getDoc(produitRef);
            if (prodSnap.exists()) {
              const stockActuel = prodSnap.data().stock || 0;
              const quantiteAchetee = item.quantite || 1;
              const nouveauStock = Math.max(0, stockActuel - quantiteAchetee); 
              await updateDoc(produitRef, { stock: nouveauStock });
              if (setListeAdminProduits) {
                setListeAdminProduits(l => l.map(p => p.id === item.id ? { ...p, stock: nouveauStock } : p));
              }
            }
          }
        }
      }
      await updateDoc(doc(db, 'commandes', order.id), { statut: "Livré" });
      const commandeLivree = { ...order, statut: "Livré" };
      setOrders(orders.map(o => o.id === order.id ? commandeLivree : o));
      await synchroniserStatutGoogleSheet(commandeLivree, "Livré");
      alert("🚚 Commande archivée comme 'Livré' et stocks mis à jour !");
    } catch (error) {
      alert("Erreur lors de la mise à jour du stock : " + error.message);
    }
  };

  const handleSupprimer = async (orderId) => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      await deleteDoc(doc(db, 'commandes', orderId));
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (error) {
      alert(error.message);
    }
  };

  const commandesFiltrees = orders.filter(order => {
    if (filtreStatus === "Tout") return true;
    return (order.statut || "En attente") === filtreStatus;
  });

  if (chargement) return <p style={{ textAlign: "center", padding: "20px" }}>Mise à jour...</p>;

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: "20px", gap: "10px" }}>
        <h3 style={{ color: "#2c3e50", margin: 0, fontSize: isMobile ? "1.1rem" : "1.3rem" }}>📦 Gestion des Commandes</h3>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button onClick={() => setFiltreStatus("Tout")} style={{ backgroundColor: filtreStatus === "Tout" ? "#2c3e50" : "#fff", color: filtreStatus === "Tout" ? "#fff" : "#2c3e50", border: "1px solid #2c3e50", padding: "5px 10px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "0.75rem" }}>📋 Toutes ({orders.length})</button>
          <button onClick={() => setFiltreStatus("En attente")} style={{ backgroundColor: filtreStatus === "En attente" ? "#3498db" : "#fff", color: filtreStatus === "En attente" ? "#fff" : "#3498db", border: "1px solid #3498db", padding: "5px 10px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "0.75rem" }}>⏳ En attente ({orders.filter(o => (!o.statut || o.statut === "En attente")).length})</button>
          <button onClick={() => setFiltreStatus("Confirmé")} style={{ backgroundColor: filtreStatus === "Confirmé" ? "#f1c40f" : "#fff", color: filtreStatus === "Confirmé" ? "#fff" : "#b7950b", border: "1px solid #f1c40f", padding: "5px 10px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "0.75rem" }}>✓ Confirmé ({orders.filter(o => o.statut === "Confirmé").length})</button>
          <button onClick={() => setFiltreStatus("Livré")} style={{ backgroundColor: filtreStatus === "Livré" ? "#2ecc71" : "#fff", color: filtreStatus === "Livré" ? "#fff" : "#2ecc71", border: "1px solid #2ecc71", padding: "5px 10px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "0.75rem" }}>🚚 Livré ({orders.filter(o => o.statut === "Livré").length})</button>
          <button onClick={() => setFiltreStatus("Retour")} style={{ backgroundColor: filtreStatus === "Retour" ? "#e74c3c" : "#fff", color: filtreStatus === "Retour" ? "#fff" : "#e74c3c", border: "1px solid #e74c3c", padding: "5px 10px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", fontSize: "0.75rem" }}>↩ Retour ({orders.filter(o => o.statut === "Retour").length})</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {commandesFiltrees.map((order) => {
          let badgeColor = "#3498db"; let badgeBg = "#3498db20";
          if (order.statut === "Confirmé") { badgeColor = "#f1c40f"; badgeBg = "#f1c40f20"; }
          if (order.statut === "Livré") { badgeColor = "#2ecc71"; badgeBg = "#2ecc7120"; }
          if (order.statut === "Retour") { badgeColor = "#e74c3c"; badgeBg = "#e74c3c20"; }

          const estCocheFragile = !!optionsFragile[order.id];

          return (
            <div key={order.id} style={{ backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: `6px solid ${badgeColor}`, padding: isMobile ? "12px" : "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #eee", paddingBottom: "10px", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#95a5a6" }}>ID: {order.id.substring(0,8)}...</span>
                  {order.date && (
                    <span style={{ fontSize: "0.75rem", color: "#95a5a6", marginLeft: "10px" }}>
                      🕐 {order.date?.toDate?.().toLocaleString("fr-FR") || new Date(order.date.seconds * 1000).toLocaleString("fr-FR")}
                    </span>
                  )}
                </div>
                <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: "2px 8px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.75rem" }}>● {order.statut || "En attente"}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                <div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "8px" }}>
                  <h4 style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#34495e" }}>👤 Client (Livraison : {order.client?.typeLivraison || 'Domicile'})</h4>
                  <p style={{ margin: "3px 0", fontSize: "0.8rem" }}><strong>Nom:</strong> {order.client?.nom}</p>
                  <p style={{ margin: "3px 0", fontSize: "0.8rem" }}><strong>Tel:</strong> <a href={`tel:${order.client?.telephone}`}>{order.client?.telephone}</a></p>
                  <p style={{ margin: "3px 0", fontSize: "0.8rem" }}><strong>Wilaya:</strong> {order.client?.wilaya || "Non spécifiée"}</p>
                  <p style={{ margin: "3px 0", fontSize: "0.8rem" }}><strong>Commune / Ville:</strong> {order.client?.commune}</p>
                </div>

                <div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "8px" }}>
                  <h4 style={{ margin: "0 0 5px 0", fontSize: "0.85rem", color: "#34495e" }}>🛒 Articles</h4>
                  <ul style={{ paddingLeft: "15px", margin: 0, fontSize: "0.8rem" }}>
                    {order.articles?.map((item, i) => (
                      <li key={i}>
                        {getLangText(item.name || item.nom)} — {item.price || item.prix} DA {item.quantite ? ` (x${item.quantite})` : ''}
                      </li>
                    ))}
                  </ul>
                  <div style={{ textAlign: "right", fontWeight: "bold", color: "#e67e22", marginTop: "8px", fontSize: "0.9rem" }}>Total: {order.total} DA</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "12px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                {(order.statut === "Confirmé" || order.statut === "Livré") ? (
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", color: "#c0392b", fontWeight: "bold" }}>
                    <input type="checkbox" checked={estCocheFragile} onChange={() => toggleFragile(order.id)} style={{ accentColor: "#c0392b", width: "16px", height: "16px" }} />
                    📦 Marquer comme Fragile
                  </label>
                ) : <div />}

                <div style={{ display: "flex", gap: "8px", width: isMobile ? "100%" : "auto", justifyContent: "flex-end", flexWrap: "wrap" }}>
                  
                  {(!order.statut || order.statut === "En attente") && (
                    <button onClick={() => handleConfirmer(order)} style={{ backgroundColor: "#f1c40f", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>✓ Confirmer</button>
                  )}

                  {order.statut === "Confirmé" && (
                    <button onClick={() => modifierStatut(order, "En attente")} style={{ backgroundColor: "#3498db", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>⏳ Remettre en attente</button>
                  )}

                  {order.statut !== "Retour" && order.statut !== "Livré" && (
                    <button onClick={() => modifierStatut(order, "Retour")} style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>↩ Retour</button>
                  )}
                  
                  {(order.statut === "Confirmé" || order.statut === "Livré") && (
                    <button onClick={() => handleImprimerFiche(order.id, order, estCocheFragile)} style={{ backgroundColor: "#00a8ff", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>🖨️ Imprimer la fiche</button>
                  )}
                  
                  {order.statut !== "Livré" && (
                    <button onClick={() => handleLivre(order)} style={{ backgroundColor: "#2ecc71", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>🚚 Livré</button>
                  )}

                  <button onClick={() => handleSupprimer(order.id)} style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}>🗑️ Supprimer</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOrders;