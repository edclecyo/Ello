# Integração do visual ELLO com Firebase

O projeto mantém o design cinematográfico já aprovado e inclui a camada Firebase pronta em `src/services`.

Na tela de finalização, substitua o `save(n)` local por `createCapsule(...)`.
Na abertura de um link `?ello=ID`, consulte primeiro `getCapsuleMeta(ID)`.
Somente quando `openAt <= agora`, chame `getCapsuleContent(ID)`.

Arquivos:
- firebase.ts: Auth, Firestore, Storage.
- capsules.ts: criar, upload, listar, abrir e reagir.
- firestore.rules: impede leitura do conteúdo antes da data.
- storage.rules: limita uploads a imagem/vídeo/áudio e 50 MB.
