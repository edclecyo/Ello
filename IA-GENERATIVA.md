# ELLO AI — ativação

A IA agora roda em Cloud Functions, não no navegador. Isso evita expor a OPENAI_API_KEY.

## 1. Instale
Na raiz:
`npm install`

Na pasta functions:
`cd functions && npm install && cd ..`

## 2. Cadastre o segredo
`firebase functions:secrets:set OPENAI_API_KEY --project ello-817e1`

Cole sua chave quando o terminal solicitar. Não coloque a chave no .env do Vite.

## 3. Publique a função
`firebase deploy --only functions --project ello-817e1`

## 4. Rode o site
`npm run dev`

No passo 2 da criação, clique em **Escrever com IA**, escolha o tom e clique em **Gerar carta com IA**.

Fluxo: navegador -> Firebase Callable autenticada -> Cloud Function -> OpenAI -> texto -> editor do ELLO. O usuário pode revisar antes de salvar.

Observação: Cloud Functions com chamadas externas pode exigir projeto Firebase com faturamento habilitado (Blaze), conforme a configuração/recursos usados pelo projeto.
