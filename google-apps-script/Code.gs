const SPREADSHEET_ID = "COLLER_ID_DE_LA_FEUILLE_ICI";
const SHEET_NAME = "Commandes";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const order = payload.order || {};
    const client = order.client || {};
    const articles = order.articles || [];
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME)
      || SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date", "Client", "Téléphone", "Wilaya", "Commune", "Livraison",
        "Articles", "Sous-total", "Frais livraison", "Total", "Statut"
      ]);
    }

    const articlesText = articles.map((item) => {
      const name = typeof item.nom === "object"
        ? (item.nom.fr || item.nom.ar || "Produit")
        : (item.nom || item.name || "Produit");
      const price = item.prix ?? item.price ?? 0;
      return `${name} x${item.quantite || 1} (${price} DA)`;
    }).join(" | ");

    sheet.appendRow([
      new Date(),
      client.nom || "",
      client.telephone || "",
      client.wilaya || "",
      client.commune || client.ville || "",
      client.typeLivraison || "",
      articlesText,
      order.sousTotal || 0,
      order.fraisLivraison || 0,
      order.total || 0,
      order.statut || "En attente"
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
