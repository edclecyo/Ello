# ELLO V5.2 — correção Checkout Mercado Pago

Correção aplicada em `functions/index.js`:

- removido `items[].total_amount` da criação de Orders/Checkout Pro;
- mantidos `total_amount` da order, `items[].unit_price`, `quantity` e `unit_measure`;
- log de erro agora imprime `errors[].details` completo em JSON;
- mensagem de erro passa a aproveitar o detalhe retornado pelo Mercado Pago quando disponível.

## Publicar somente a Function alterada

```bash
firebase deploy --only functions:createCreditCheckout --project ello-817e1
```

Depois teste um pacote no ELLO. O webhook não precisa estar configurado para o checkout abrir, mas precisa ser configurado para a liberação automática dos créditos após a confirmação do pagamento.
