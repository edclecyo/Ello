# ELLO V4 — correção da Cloud Function

Esta versão inclui `functions/index.js` de verdade e usa Node.js 22.

## 1. Instale as dependências da Function
```bat
cd functions
npm install
npm install --save firebase-functions@latest firebase-admin@latest openai@latest
cd ..
```

## 2. Configure o segredo (uma vez)
```bat
firebase functions:secrets:set OPENAI_API_KEY --project ello-817e1
```

## 3. Faça o deploy
```bat
firebase deploy --only functions --project ello-817e1
```

A função publicada chama-se `gerarTextoELLO` e usa a região `southamerica-east1`.
