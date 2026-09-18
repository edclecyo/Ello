# ELLO + Firebase — configuração

## 1. Crie o projeto
No Firebase Console, crie um projeto e adicione um aplicativo Web.

## 2. Authentication
Ative:
- Anônimo (necessário para quem recebe link sem cadastro)
- Google (opcional para conta permanente)

## 3. Firestore
Crie o banco Firestore.

## 4. Storage
Ative Firebase Storage.

## 5. Variáveis
Copie `.env.example` para `.env` e preencha com a configuração do seu app Web Firebase.

## 6. Instale e rode
```bash
npm install
npm run dev
```

## 7. Regras
Depois de `firebase login`, copie `.firebaserc.example` para `.firebaserc`, troque `SEU_PROJECT_ID` e rode:
```bash
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 8. Publicar
```bash
npm run build
npx firebase deploy --only hosting
```

## Segurança importante
O conteúdo privado fica em `capsules`. A tela bloqueada deve usar apenas `capsulePublic`, que não pode conter mensagem nem URLs de mídia.
O Firestore bloqueia a leitura de `capsules/{id}` para não proprietários antes de `openAt`.

## Próxima integração no front
O serviço Firebase já está pronto. O visual atual ainda mantém o modo local como fallback para você conseguir rodar imediatamente sem credenciais. Depois de preencher `.env`, conecte os handlers do `main.tsx` aos métodos em `src/services/capsules.ts`.
