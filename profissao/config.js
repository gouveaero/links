/* Configuração da página /profissao
   PDF_URL: cole aqui o link do PDF gratuito quando estiver pronto.
   Enquanto estiver vazio, o botão de download fica desabilitado
   e a página avisa que o arquivo ainda está chegando. */
var PDF_URL = '';

/* Webhook de produção do fluxo n8n "Lead /profissao → Sheet".
   O fluxo nasce desativado: o envio só funciona depois do OK do Gabriel
   e depois de colar o ID da planilha no nó "Append na planilha". */
var ENDPOINT = 'https://n8n.gabrielgouvea.com.br/webhook/lead-profissao';

var ORIGEM_PADRAO = 'reel-riemann';
