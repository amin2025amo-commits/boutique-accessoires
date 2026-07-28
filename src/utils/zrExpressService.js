/**
 * Extrait uniquement l'ID numérique de la wilaya pour Procolis (ex: "19 - Sétif" -> "19")
 */
const obtenirIdWilaya = (wilayaBrute) => {
  if (!wilayaBrute) return "19"; 
  const matchChiffre = wilayaBrute.match(/^\d+/);
  if (matchChiffre) return matchChiffre[0];

  const nom = wilayaBrute.toLowerCase().trim();
  if (nom.includes("sétif") || nom.includes("setif")) return "19";
  if (nom.includes("alger")) return "16";
  if (nom.includes("oran")) return "31";
  if (nom.includes("constantine")) return "25";
  if (nom.includes("bordj") || nom.includes("arrerie")) return "34";
  
  return "19"; 
};

export const envoyerVersZRExpress = async (orderId, order, estFragile = false) => {
  // Vos clés exactes fournies
  const API_TOKEN = "0a4d01b9821ea615b11d2930e40470139cf581e0b1f10ca1a371ec2e781dbf47";
  const API_KEY = "31cb1c5e52894f25a3de561bf6286fd7";
  
  // URL de base combinée avec le proxy Vite (/api_zr pointe vers https://procolis.com)
  const API_URL = "/api_zr/api_v1/add_colis"; 

  try {
    // 1. Formatage de la Wilaya et Commune selon votre JSON
    const wilayaClient = order.client?.wilaya || "";
    const codeWilaya = obtenirIdWilaya(wilayaClient);
    const nomWilaya = wilayaClient.split('-')[1]?.trim() || wilayaClient || "Sétif";

    // 2. Nettoyage strict du téléphone (pas d'espaces, pas de +213)
    let telephone = order.client?.telephone || "";
    telephone = telephone.replace(/[\s\-\.\(\)]/g, ""); 
    if (telephone.startsWith("+213")) telephone = "0" + telephone.substring(4);
    if (telephone.startsWith("213") && telephone.length > 9) telephone = "0" + telephone.substring(3);

    // Domicile : 0 & Stopdesk : 1
    const typeLivraisonAPI = order.client?.typeLivraison === 'Bureau' ? "1" : "0";

    const listeArticlesTexte = order.articles 
      ? order.articles.map(item => `${item.name || item.nom} (${item.quantite || 1})`).join(' + ')
      : "Colis E-commerce";

    // 3. Construction du Body raw (json) identique à votre capture
    const payload = {
      "Colis": [
        {
          "Tracking": "VotreTracking", // Valeur texte exigée par leur gabarit initial
          "TypeLivraison": typeLivraisonAPI, 
          "TypeColis": "0", 
          "Confrimee": "", // Laisser vide pour confirmer depuis votre tableau de bord
          "Client": order.client?.nom || "Client Anonyme",
          "MobileA": telephone,
          "MobileB": order.client?.telephoneSecondaire || "", 
          "Adresse": order.client?.adresse || order.client?.ville || nomWilaya,
          "IDWilaya": codeWilaya, // Code strict (ex: "31", "19")
          "Commune": order.client?.ville || nomWilaya,
          "Total": String(order.total || 0), 
          "Note": estFragile ? "Fragile" : "", 
          "TProduit": listeArticlesTexte,
          "id_Externe": orderId, 
          "Source": ""
        }
      ]
    };

    // 4. Envoi de la requête avec les en-têtes (-H) demandés par l'image
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': API_TOKEN,  // Clé en-tête demandée dans le cURL de l'image
        'key': API_KEY       // Clé en-tête demandée dans le cURL de l'image
      },
      body: JSON.stringify(payload)
    });

    const textBrut = await response.text();
    console.log("=== DIAGNOSTIC FINAL ZR ===");
    console.log("Statut HTTP :", response.status);
    console.log("Réponse brute de l'API :", textBrut);
    console.log("===========================");

    if (!response.ok) {
      throw new Error(`Erreur serveur : ${response.status}`);
    }

    const data = JSON.parse(textBrut);

    // Double vérification si l'API répond 200 mais renvoie un texte d'erreur
    if (data.Retour && data.Retour.includes("Clé non détectée")) {
      throw new Error(data.Retour);
    }

    // Si l'API renvoie un succès ou une structure valide
    return true;

  } catch (error) {
    console.error("Erreur lors de l'envoi :", error);
    alert("❌ Échec : " + error.message);
    return false;
  }
};