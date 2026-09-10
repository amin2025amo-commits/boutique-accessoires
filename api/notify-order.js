export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order, action = "create" } = req.body;
  if (!order) {
    return res.status(400).json({ error: "Missing order data" });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const GOOGLE_SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if ((!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) && !GOOGLE_SHEETS_WEBHOOK_URL) {
    console.error("No order notification provider configured");
    return res.status(500).json({ error: "No order notification provider configured" });
  }

  const client = order.client || {};
  const articles = order.articles || [];

  const getItemName = (item) => {
    const name = item.name || item.nom || "";
    if (typeof name === "object") return name.fr || name.ar || "";
    return String(name);
  };

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  let msg = "🛒 <b>Nouvelle Commande !</b>\n\n";
  msg += `👤 <b>Client :</b> ${escapeHtml(client.nom || "N/A")}\n`;
  msg += `📞 <b>Téléphone :</b> ${escapeHtml(client.telephone || "N/A")}\n`;
  msg += `📍 <b>Wilaya :</b> ${escapeHtml(client.wilaya || "N/A")}\n`;
  msg += `🏘️ <b>Commune :</b> ${escapeHtml(client.commune || "N/A")}\n`;
  msg += `📦 <b>Livraison :</b> ${escapeHtml(client.typeLivraison || "N/A")}\n\n`;
  msg += "📋 <b>Articles :</b>\n";

  articles.forEach((item, i) => {
    const name = getItemName(item);
    const price = item.price || item.prix || 0;
    const qty = item.quantite || 1;
    msg += `  ${i + 1}. ${escapeHtml(name)} — ${escapeHtml(price)} DA x${escapeHtml(qty)}\n`;
  });

  msg += `\n💵 <b>Total :</b> ${escapeHtml(order.total || 0)} DA`;
  msg += `\n📌 <b>Statut :</b> ${escapeHtml(order.statut || "En attente")}`;

  try {
    const results = {};

    if (GOOGLE_SHEETS_WEBHOOK_URL) {
      const sheetsResponse = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, order }),
      });
      const sheetsBody = await sheetsResponse.text();
      let sheetsResult = {};
      try {
        sheetsResult = JSON.parse(sheetsBody);
      } catch {
        sheetsResult = { error: sheetsBody };
      }
      results.googleSheets = sheetsResponse.ok && sheetsResult.success !== false;
      if (!sheetsResponse.ok) {
        results.googleSheetsError = {
          status: sheetsResponse.status,
          body: sheetsBody.slice(0, 500)
        };
        console.error("Google Sheets webhook error:", results.googleSheetsError);
      } else if (!results.googleSheets) {
        results.googleSheetsError = sheetsResult.error || "Google Sheets a refusé la commande";
        console.error("Google Sheets webhook error:", results.googleSheetsError);
      }
    }

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: msg,
          parse_mode: "HTML",
        }),
      });

      const telegramResult = await telegramResponse.json();
      results.telegram = telegramResult.ok;
      if (!telegramResult.ok) {
        results.telegramError = telegramResult.description || "Telegram API error";
        console.error("Telegram API error:", telegramResult);
      }
    }

    if (!Object.values(results).some(Boolean)) {
      return res.status(502).json({ error: "Order notifications failed", results });
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return res.status(500).json({ error: error.message });
  }
}
