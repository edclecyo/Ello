# ELLO Premium — atualização sobre o projeto original

Esta versão foi construída diretamente sobre o `ello(1).zip` enviado pelo usuário.

## O que foi conectado de verdade
- Firebase Authentication anônima
- Login opcional com Google
- Firestore para criar e listar ELLOs
- Storage para fotos, vídeos e áudios
- capsulePublic para tela bloqueada sem expor carta/mídia
- Link e QR únicos
- Contagem regressiva
- Abertura cinematográfica
- Player real de fotos, vídeos e áudios
- Reação por texto salva no Firestore
- Exclusão de ELLO
- Perfil com nome persistente e nome na Home

## UX Premium
- Home expandida e personalizada
- Cards rápidos de experiências
- seção cinematográfica
- Momentos/inspirações
- Perfil/configurações
- 4 atmosferas: Cosmos, Romance, Pôr do Sol e Aurora
- animações, brilho, profundidade e transições visuais
- prévia privada claramente marcada
- previews reais dos arquivos antes do upload
- upload com progresso

## Rodar
```bash
npm install
npm run dev
```

## Publicar regras
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage --project ello-817e1
```

## Observação
A opção “Me inspire a escrever” fornece uma inspiração local imediata. Uma IA generativa real exige backend/Cloud Function e chave de API; não foi embutida no navegador para não expor segredo.
