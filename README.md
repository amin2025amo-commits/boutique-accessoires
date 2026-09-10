# React + Vite

## Synchroniser les commandes avec Google Sheets

Les commandes sont d'abord enregistrées dans Firestore. Pour les copier automatiquement dans Google Sheets :

1. Créer une feuille Google Sheets.
2. Ouvrir **Extensions > Apps Script**, copier le contenu de `google-apps-script/Code.gs` et remplacer `COLLER_ID_DE_LA_FEUILLE_ICI` par l'ID de la feuille.
3. Déployer le script comme **Application web**, avec l'accès **Tout le monde**.
4. Ajouter l'URL `/exec` obtenue dans Vercel sous `GOOGLE_SHEETS_WEBHOOK_URL`, puis redéployer.

Le script doit recevoir un POST JSON contenant `{ "order": ... }` et ajouter une ligne dans la feuille. Les colonnes recommandées sont : date, client, téléphone, wilaya, commune, livraison, articles, sous-total, frais de livraison, total et statut.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
