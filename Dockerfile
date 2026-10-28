FROM nginx:alpine

# Página (single file, sem dependências externas)
COPY index.html /usr/share/nginx/html/index.html
COPY gg-tracking.js /usr/share/nginx/html/gg-tracking.js

# Imagens guardadas no git em base64 (texto) e decodificadas no build para
# /usr/share/nginx/html/assets/thumb/<id>.jpg e /assets/profile/gabriel.jpg
COPY assets/thumb-b64/ /tmp/thumb-b64/
COPY assets/profile/ /tmp/profile/
RUN mkdir -p /usr/share/nginx/html/assets/thumb /usr/share/nginx/html/assets/profile \
 && for f in /tmp/thumb-b64/*.b64; do \
      n=$(basename "$f" .b64); \
      base64 -d "$f" > "/usr/share/nginx/html/assets/thumb/$n"; \
    done \
 && base64 -d /tmp/profile/gabriel.jpg.b64 > /usr/share/nginx/html/assets/profile/gabriel.jpg \
 && rm -rf /tmp/thumb-b64 /tmp/profile \
 && ls -1 /usr/share/nginx/html/assets/thumb | wc -l \
 && ls -l /usr/share/nginx/html/assets/profile/gabriel.jpg

EXPOSE 80
