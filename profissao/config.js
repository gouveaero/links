/* Configuração da página /profissao
   PDF_URL: link público do PDF gratuito.
   Enquanto estiver vazio, o botão de download fica desabilitado
   e a página avisa que o arquivo ainda está chegando. */
var PDF_URL = 'https://links.gabrielgouvea.com.br/profissao/guia.pdf';

/* Webhook de produção do fluxo n8n "Lead /profissao → Sheet".
   O fluxo permanece desativado até o OK do Gabriel. */
var ENDPOINT = 'https://n8n.gabrielgouvea.com.br/webhook/lead-profissao';

var ORIGEM_PADRAO = 'instagram-profissao';
