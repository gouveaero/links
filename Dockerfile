FROM nginx:alpine

# Página (single file, sem dependências externas)
COPY index.html /usr/share/nginx/html/index.html

# Miniaturas: guardadas no git em base64 (texto) e decodificadas no build
# para /usr/share/nginx/html/assets/thumb/<id>.jpg
COPY assets/thumb-b64/ /tmp/thumb-b64/
RUN mkdir -p /usr/share/nginx/html/assets/thumb \
 && for f in /tmp/thumb-b64/*.b64; do \
      n=$(basename "$f" .b64); \
      base64 -d "$f" > "/usr/share/nginx/html/assets/thumb/$n"; \
    done \
 && rm -rf /tmp/thumb-b64 \
 && ls -1 /usr/share/nginx/html/assets/thumb | wc -l

EXPOSE 80
