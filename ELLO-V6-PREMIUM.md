# ELLO V6 — Presente Digital Premium

Esta versão mantém o Pix direto e adiciona monetização da experiência, separada dos créditos de IA.

## Produtos
- Essencial: grátis — 3 mídias, tema Cosmos, sem experiência cinematográfica.
- Surpresa: R$ 4,90.
- Inesquecível: R$ 9,90.
- Eternize: R$ 14,90.

## Novas Functions
- createExperiencePix
- checkExperiencePayment

Publique com:

firebase deploy --only functions:createExperiencePix,functions:checkExperiencePayment --project ello-817e1

O Access Token do Mercado Pago continua no Secret Manager e não deve ser colocado no frontend.

## Fluxo
Prévia -> escolha da experiência -> Pix -> confirmação -> criação automática -> QR/link final.

A venda de experiências usa a coleção `experiencePayments`, separada de `payments` (créditos de IA).
