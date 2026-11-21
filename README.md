# links.gabrielgouvea.com.br

Página estática com as ferramentas apresentadas nos reels do Gabriel Gouvea.
Substitui o envio de link por DM no Instagram.

- `index.html`: página única, HTML/CSS/JS puro, sem build e sem dependências externas.
- Card fixo no topo com a foto, o Instagram e o link para gabrielgouvea.com.br; fica fora da busca e dos filtros.
- Um card por reel, do mais novo para o mais antigo, com miniatura real (frame do vídeo), ícone, selo do CTA e link do reel.
- Reels com várias ferramentas abrem a lista dentro do card (acordeão); com uma só, o card inteiro abre a ferramenta.
- Busca por reel/ferramenta e filtro por grátis e pagas (por reel).
- Formulário de captura em `/profissao` (lead do reel Riemann; webhook n8n). Tracking: `gg-tracking.js` (Meta Pixel + GA4 + Google Ads, com CAPI pelo sidecar `track.gabrielgouvea.com.br`). Clique em ferramenta = `ViewContent`, clique no Instagram = `Contact`.

## Miniaturas

Cada card usa um frame do meio do vídeo do reel, cortado em 9:16 e reduzido para
200x355 px (JPEG comprimido). Ficam em `assets/thumb/<id>.jpg`.
A foto do card fixo de perfil fica em `assets/profile/gabriel.jpg` (400x400).

O repositório guarda as imagens em base64 (`assets/thumb-b64/<id>.jpg.b64` e
`assets/profile/gabriel.jpg.b64`) porque o conector de upload só aceita texto; o
`Dockerfile` decodifica no build para `/usr/share/nginx/html/assets/thumb/<id>.jpg` e
`/usr/share/nginx/html/assets/profile/gabriel.jpg`. Para trocar uma imagem, gere o
JPEG e rode `base64 -w76 img.jpg > img.jpg.b64`.

## Rodar local

Abra o `index.html` no navegador ou rode `docker build -t links . && docker run -p 8080:80 links`.
No modo `docker build` as miniaturas aparecem; abrindo o arquivo direto é preciso
colocar os `.jpg` decodificados em `assets/thumb/`.


## Página /profissao

Captura de lead do reel Riemann, em `https://links.gabrielgouvea.com.br/profissao`.
Obrigado em `/profissao/obrigado/`.

- `profissao/config.js`: `PDF_URL` (https://links.gabrielgouvea.com.br/profissao/guia.pdf; o arquivo está em `profissao/guia.pdf`), `ENDPOINT` (webhook de produção do n8n) e `ORIGEM_PADRAO` (`instagram-profissao`). Se a URL trouxer `?origem=`, esse valor é o que vai para a planilha (bio, stories, aula, e-mail).
- O POST vai para o fluxo n8n "Lead /profissao → Sheet" (tag grokbot, desativado até o OK do Gabriel). O nó Append na planilha usa o Document ID `1FcZx91r7MdM6eXdSnh-XxYkGFhri4bCstqfLTout3RQ`, aba `Leads`, cabeçalho: timestamp, nome, email, whatsapp, area, origem, status.

## Deploy

Coolify, build pack `dockerfile`, projeto Grokbot, domínio `https://links.gabrielgouvea.com.br`.
