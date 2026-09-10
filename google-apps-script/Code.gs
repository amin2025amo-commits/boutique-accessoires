const SPREADSHEET_ID = "10GEh9Ryhmh7cnpJEh8xuu_PhYEdBHImQMVSd3x81D40";
const SHEET_NAME = "Commandes";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const action = payload.action || "create";
    const order = payload.order || {};
    const client = order.client || {};
    const articles = order.articles || [];
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME)
      || SpreadsheetApp.openById(SPREADSHEET_ID).insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Date", "Client", "Téléphone", "Wilaya", "Commune", "Livraison",
        "Articles", "Sous-total", "Frais livraison", "Total", "Statut", "ID commande"
      ]);
    } else if (sheet.getRange(1, 12).getValue() !== "ID commande") {
      sheet.getRange(1, 12).setValue("ID commande");
    }

    const statusColors = {
      "Livré": "#b7e1cd",
      "Confirmé": "#fff2cc",
      "En attente": "#cfe2f3",
      "Retour": "#f4cccc"
    };
    const statusColumn = 11;
    const idColumn = 12;

    const telephone = String(client.telephone || "").trim();
    const statut = String(order.statut || "En attente").trim();
    const dateCommande = order.date ? new Date(order.date) : new Date();

    if (action === "update") {
      const lastRow = sheet.getLastRow();
      const ids = lastRow > 1 ? sheet.getRange(2, idColumn, lastRow - 1, 1).getValues() : [];
      const rowIndex = ids.findIndex((row) => String(row[0]) === String(order.id));
      if (rowIndex === -1) {
        throw new Error("Commande introuvable dans Google Sheets : " + order.id);
      }

      const rowNumber = rowIndex + 2;
      sheet.getRange(rowNumber, statusColumn).setValue(statut);
      sheet.getRange(rowNumber, 1).setNumberFormat("dd/MM/yyyy HH:mm");
      sheet.getRange(rowNumber, 1, 1, idColumn).setBackground(statusColors[statut] || "#ffffff");
      SpreadsheetApp.flush();
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, updated: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const articlesText = articles.map((item) => {
      const name = typeof item.nom === "object"
        ? (item.nom.fr || item.nom.ar || "Produit")
        : (item.nom || item.name || "Produit");
      const price = item.prix ?? item.price ?? 0;
      return `${name} x${item.quantite || 1} (${price} DA)`;
    }).join(" | ");

    sheet.appendRow([
      dateCommande,
      client.nom || "",
      telephone,
      client.wilaya || "",
      client.commune || client.ville || "",
      client.typeLivraison || "",
      articlesText,
      order.sousTotal || 0,
      order.fraisLivraison || 0,
      order.total || 0,
      statut,
      order.id || ""
    ]);
    const rowNumber = sheet.getLastRow();
    const telephoneCell = sheet.getRange(rowNumber, 3);
    telephoneCell.setNumberFormat("@");
    telephoneCell.setValue(telephone);
    if (telephone) {
      telephoneCell.setRichTextValue(
        SpreadsheetApp.newRichTextValue()
          .setText(telephone)
          .setLinkUrl("tel:" + telephone)
          .build()
      );
    }
    sheet.getRange(rowNumber, 1).setNumberFormat("dd/MM/yyyy HH:mm");
    sheet.getRange(rowNumber, 1, 1, idColumn).setBackground(statusColors[statut] || "#cfe2f3");
    SpreadsheetApp.flush();

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
