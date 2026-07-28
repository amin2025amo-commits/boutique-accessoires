export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { order } = req.body;
  if (!order) {
    return res.status(400).json({ error: "Missing order data" });
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram env vars not set");
    return res.status(500).json({ error: "Telegram not configured" });
  }

  const client = order.client || {};
  const articles = order.articles || [];

  const getItemName = (item) => {
    const name = item.name || item.nom || "";
    if (typeof name === "object") return name.fr || name.ar || "";
    return String(name);
  };

  let msg = "🛒 *Nouvelle Commande !*\n\n";
  msg += `👤 *Client :* ${client.nom || "N/A"}\n`;
  msg += `📞 *Téléphone :* ${client.telephone || "N/A"}\n`;
  msg += `📍 *Wilaya :* ${client.wilaya || "N/A"}\n`;
  msg += `🏘️ *Commune :* ${client.commune || "N/A"}\n`;
  msg += `📦 *Livraison :* ${client.typeLivraison || "N/A"}\n\n`;
  msg += `📋 *Articles :*\n`;

  articles.forEach((item, i) => {
    const name = getItemName(item);
    const price = item.price || item.prix || 0;
    const qty = item.quantite || 1;
    msg += `  ${i + 1}. ${name} — ${price} DA x${qty}\n`;
  });

  msg += `\n💵 *Total :* ${order.total || 0} DA`;
  msg += `\n📌 *Statut :* ${order.statut || "En attente"}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: msg,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error("Telegram API error:", result);
      return res.status(500).json({ error: "Telegram API error", details: result });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return res.status(500).json({ error: error.message });
  }
}
