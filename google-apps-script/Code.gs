const SPREADSHEET_ID = "10GEh9Ryhmh7cnpJEh8xuu_PhYEdBHImQMVSd3x81D40";
const SHEET_NAME = "Commandes";
const SCRIPT_VERSION = "2026-09-11-format-all-rows-v4";

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

    const appliquerFormatCommandes = () => {
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return;

      const commandesRange = sheet.getRange(2, 1, lastRow - 1, idColumn);
      const statuts = sheet.getRange(2, statusColumn, lastRow - 1, 1).getValues();
      const couleurs = statuts.map(([status]) => [
        statusColors[String(status).trim()] || "#cfe2f3"
      ]);

      sheet.getRange(2, 1, lastRow - 1, 1).setNumberFormat("dd/mm/yyyy hh:mm");
      commandesRange.setBackgrounds(
        couleurs.map(([color]) => Array(idColumn).fill(color))
      );
      SpreadsheetApp.flush();
    };

    if (action === "update") {
      const lastRow = sheet.getLastRow();
      const ids = lastRow > 1 ? sheet.getRange(2, idColumn, lastRow - 1, 1).getValues() : [];
      const rowIndex = ids.findIndex((row) => String(row[0]) === String(order.id));
      if (rowIndex === -1) {
        throw new Error("Commande introuvable dans Google Sheets : " + order.id);
      }

      const rowNumber = rowIndex + 2;
      sheet.getRange(rowNumber, statusColumn).setValue(statut);
      appliquerFormatCommandes();
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, updated: true, version: SCRIPT_VERSION }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const articlesText = articles.map((item) => {
      const name = typeof item.nom === "object"
        ? (item.nom.fr || item.nom.ar || "Produit")
        : (item.nom || item.name || "Produit");
      const price = item.prix ?? item.price ?? 0;
      return `${name} x${item.quantite || 1} (${price} DA)`;
    }).join(" | ");

    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1, 1, idColumn).setValues([[
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
    ]]);
    const rowNumber = newRow;
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
    appliquerFormatCommandes();

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, version: SCRIPT_VERSION }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
