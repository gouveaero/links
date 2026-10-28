# links.gabrielgouvea.com.br

Página estática com todas as ferramentas apresentadas nos reels do Gabriel Gouvea.
Substitui o envio de link por DM no Instagram.

- `index.html`: página única, HTML/CSS/JS puro, sem build e sem dependências externas.
- Busca por nome e descrição, filtro por grátis e pagas, cards com a palavra de CTA de cada reel.
- Sem cookies, sem analytics, sem formulários.

## Rodar local

Abra o `index.html` no navegador ou rode `docker build -t links . && docker run -p 8080:80 links`.

## Deploy

Coolify, build pack `dockerfile`, projeto Grokbot, domínio `https://links.gabrielgouvea.com.br`.
