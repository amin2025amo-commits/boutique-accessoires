/**
 * Génère et ouvre la fenêtre d'impression au format d'étiquette officiel ZR Express
 * @param {string} orderId - L'identifiant unique de la commande
 * @param {object} order - L'objet contenant toutes les données de la commande
 * @param {boolean} estFragile - Si vrai, affiche la mention fragile sur le bordereau
 */
export const handleImprimerFiche = (orderId, order, estFragile = false) => {
  if (!order) return;

  const dateCommande = order.date?.seconds 
    ? new Date(order.date.seconds * 1000).toLocaleDateString('fr-FR') 
    : new Date().toLocaleDateString('fr-FR');

  const wilayaBrute = order.client?.wilaya || "19 - Sétif";
  const partiesWilaya = wilayaBrute.split('-');
  const codeWilaya = partiesWilaya[0]?.trim() || "19";
  const nomWilaya = partiesWilaya[1]?.trim() || "Sétif";

  const estAuBureau = order.client?.typeLivraison === 'Bureau';
  const typeLivraisonTexte = estAuBureau ? "Stopdesk" : "À Domicile";

  const fenetreImpression = window.open('', '_blank');
  
  fenetreImpression.document.write(`
    <html>
      <head>
        <title>ZR_EXPRESS_${orderId.substring(0,8)}</title>
        <style>
          @page { size: 100mm 150mm; margin: 0; }
          body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; padding: 8px; color: #000; background-color: #fff;
            -webkit-print-color-adjust: exact;
          }
          .ticket-zr { display: flex; border: 2px solid #000; height: 144mm; box-sizing: border-box; position: relative; }
          .sidebar-type { width: 45px; border-right: 2px solid #000; display: flex; align-items: center; justify-content: center; background-color: #fff; }
          .sidebar-text { transform: rotate(-90deg); white-space: nowrap; font-size: 32px; font-weight: 900; letter-spacing: 1px; text-transform: capitalize; }
          .main-content { flex: 1; padding: 8px; display: flex; flex-direction: column; justify-content: space-between; }
          .zr-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px; }
          .logo-zr { font-size: 20px; font-weight: 900; font-style: italic; letter-spacing: -1px; }
          .logo-sub { font-size: 11px; font-weight: bold; display: block; margin-top: -4px; letter-spacing: 2px; }
          .exp-info-top { text-align: right; font-size: 11px; font-weight: bold; }
          .barcodes-section { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; }
          .main-barcode-container { flex: 1; text-align: left; }
          .fake-barcode-main { height: 40px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 5px, #000 5px, #000 6px, #fff 6px, #fff 8px); width: 90%; }
          .barcode-label { font-family: monospace; font-size: 12px; font-weight: bold; margin-top: 3px; }
          .side-barcode-container { width: 70px; text-align: right; }
          .fake-barcode-side { height: 35px; background: repeating-linear-gradient(90deg, #000, #000 1px, #fff 1px, #fff 3px, #000 3px, #000 4px); width: 100%; }
          .side-barcode-sub { font-size: 8px; font-family: monospace; }
          .shop-credentials { text-align: right; font-size: 12px; margin-bottom: 12px; line-height: 1.2; }
          .client-delivery-details { font-size: 13px; line-height: 1.4; margin-bottom: 5px; }
          .client-name { font-size: 14px; font-weight: bold; text-transform: capitalize; }
          .destination-town { text-transform: uppercase; font-weight: bold; }
          .package-content-note { font-size: 12px; margin: 10px 0; }
          
          /* Style dynamique pour l'affichage Fragile */
          .fragile-badge { 
            font-weight: bold; 
            font-size: 14px; 
            border: 1px solid #000; 
            display: ${estFragile ? 'inline-block' : 'none'}; 
            padding: 2px 6px; 
            margin-bottom: 4px;
            text-transform: uppercase;
          }

          .zr-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; }
          .cod-price-box { border: 2px solid #000; padding: 6px 12px; width: 60%; box-sizing: border-box; }
          .cod-box-label { font-size: 10px; font-weight: bold; }
          .cod-box-amount { font-size: 22px; font-weight: 900; white-space: nowrap; }
          .big-wilaya-code { font-size: 75px; font-weight: 900; line-height: 0.8; padding-right: 5px; letter-spacing: -2px; }
        </style>
      </head>
      <body>
        <div class="ticket-zr">
          <div class="sidebar-type">
            <div class="sidebar-text">${typeLivraisonTexte}</div>
          </div>
          <div class="main-content">
            <div>
              <div class="zr-header">
                <div class="logo-zr">ZR <span>سريع</span><span class="logo-sub">EXPRESS</span></div>
                <div class="exp-info-top">
                  <div>${dateCommande}</div>
                  <div style="text-transform: uppercase; margin-top: 2px;">${nomWilaya}</div>
                </div>
              </div>
              <div class="barcodes-section">
                <div class="main-barcode-container">
                  <div class="fake-barcode-main"></div>
                  <div class="barcode-label">ZRX${orderId.substring(0, 7).toUpperCase()}A</div>
                </div>
                <div class="side-barcode-container">
                  <div class="fake-barcode-side"></div>
                  <div class="side-barcode-sub">8/${codeWilaya}</div>
                </div>
              </div>
              <div class="shop-credentials">
                <div>0559215589</div>
                <strong>easytech05</strong>
              </div>
              <div class="client-delivery-details">
                <div class="client-name">${order.client?.nom || ''}</div>
                <div>${order.client?.telephone || ''}</div>
                <div style="text-transform: capitalize;">${order.client?.ville || ''}</div>
                <div class="destination-town">${nomWilaya}</div>
              </div>
              <div class="package-content-note">
                <div class="fragile-badge">⚠️ Fragile</div>
                <div style="font-size: 11px; color: #333;">
                  ${order.articles ? order.articles.map(item => `${item.name || item.nom || 'Article'} (x${item.quantite || 1})`).join(' + ') : 'Colis E-commerce'}
                </div>
              </div>
            </div>
            <div class="zr-footer">
              <div class="cod-price-box">
                <div class="cod-box-label">Total + Frais livraison</div>
                <div class="cod-box-amount">${order.total ? Number(order.total).toLocaleString('fr-FR') : '0'},00 Da</div>
              </div>
              <div class="big-wilaya-code">${codeWilaya}</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 300); };
        </script>
      </body>
    </html>
  `);
  fenetreImpression.document.close();
};