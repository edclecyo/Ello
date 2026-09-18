# ELLO V5 — ativação

## 1. IA
A Function usa `gpt-5.5` e agora exige 1 crédito por geração concluída. Se a OpenAI falhar, o crédito reservado é devolvido automaticamente.

## 2. Mercado Pago
Cadastre o Access Token no Secret Manager:

```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN --project ello-817e1
```

Não coloque o Access Token no `.env` do Vite.

## 3. Instalar e publicar Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions --project ello-817e1
```

Functions adicionadas:
- `getAICredits`
- `gerarTextoELLO`
- `createCreditCheckout`
- `mercadoPagoWebhook`

## 4. Webhook Mercado Pago
Depois do deploy, configure nas notificações/webhooks da sua integração do Mercado Pago a URL exibida pelo Firebase para `mercadoPagoWebhook`.

O webhook consulta a order diretamente no Mercado Pago antes de creditar a carteira e a transação Firestore impede crédito duplicado.

## 5. Frontend

```bash
npm install
npm run dev
```

## Pacotes configurados
- 3 gerações — R$ 0,99
- 10 gerações — R$ 3,90
- 30 gerações — R$ 8,90
- 100 gerações — R$ 19,90

## Observação sobre AR
O modo AR desta versão é uma experiência de câmera + sobreposição espacial no navegador, compatível com mais celulares. Não é rastreamento WebXR de superfície/âncora 3D. Isso evita vender uma função que não funciona em iPhone/navegadores incompatíveis.
