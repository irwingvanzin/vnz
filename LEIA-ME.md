# Site 3.0 — VNZ Climatização

Redesenho completo do vnzclimatizacao.com.br: mesmas seções, textos, fotos de clientes, formulário PHP, links de WhatsApp e SEO do site anterior, agora com identidade visual nova e animações ligadas à rolagem.

Conceito: **"O ar em movimento"** — as ondas do logo viram correntes de ar. No topo, a cena esfria de 34 °C para 23 °C conforme o visitante rola a página.

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | O site (uma página) |
| `politica-de-privacidade.html` | Política de Privacidade no visual novo |
| `enviar.php` | Envio do formulário por e-mail — **cópia idêntica** do site anterior |
| `css/style.css` | Estilos |
| `js/main.js` | Menu, formulário, mapa e animações de rolagem |
| `js/fluxo-ar.js` | Animação das correntes de ar no topo |
| `js/vendor/` | Bibliotecas GSAP, ScrollTrigger e Lenis (hospedadas no próprio site) |
| `fonts/` | Fontes Sora e Inter (hospedadas no próprio site) |
| `img/` | Fotos (JPG + versões WebP mais leves), logos e favicons |
| `sitemap.xml`, `robots.txt`, `.htaccess` | SEO, HTTPS, cache e compressão |
| `.claude/` | Servidor de teste local — **não enviar para a hospedagem** |

## Como publicar no cPanel

1. No *Gerenciador de Arquivos*, faça um backup da pasta `public_html` (*Compactar* e baixe o .zip).
2. Envie todo o conteúdo desta pasta para `public_html`, **menos** a pasta `.claude` e este `LEIA-ME.md`. Aceite substituir os arquivos existentes.
3. **Sobre o `enviar.php`:** o arquivo daqui é igual ao da pasta `Site_2.0`. Se o que está no servidor foi alterado depois (por exemplo, o e-mail de destino), não o substitua — o site novo funciona com ele do mesmo jeito.
4. Abra o site e pressione `Ctrl + F5` para carregar a versão nova.
5. Envie uma mensagem de teste pelo formulário e confira se chegou no e-mail.
6. No [Google Search Console](https://search.google.com/search-console), reenvie o `sitemap.xml`.

O arquivo `baixar-imagens.php` do site anterior não é mais necessário; se ainda estiver no servidor, pode apagar.

## O que foi mantido

- Todas as seções e âncoras: `#inicio`, `#sobre`, `#diferenciais`, `#servicos`, `#clientes`, `#orcamento`, `#contato`.
- Formulário: mesmos campos (`nome`, `email`, `mensagem`, armadilha anti-robô `site`, aceite `lgpd`) e mesma resposta do `enviar.php`.
- WhatsApp `wa.me/5592986323508` no menu, no topo, no orçamento, no contato, no rodapé e no botão flutuante. Os botões de orçamento abrem a conversa com uma mensagem já escrita.
- Tag do Google Ads `AW-18554517901`.
- Título, descrição, palavras-chave, endereço canônico, Open Graph, Twitter Card, dados de localização e Schema.org `HVACBusiness`.
- Nomes dos arquivos de imagem (o Google continua reconhecendo as mesmas fotos).

## O que melhorou no SEO

- Schema.org com horário de atendimento (seg. a sex., 8h às 17h), link do Google Maps e descrição de cada serviço.
- Fotos em WebP com tamanhos por dispositivo; as fontes saem do próprio site (duas conexões externas a menos).
- Fotos dos clientes incluídas no `sitemap.xml`.
- O conteúdo aparece mesmo com JavaScript desligado, e as animações se desligam sozinhas para quem ativou "reduzir movimento" no sistema.

## Como editar

- **Textos:** direto no `index.html`.
- **Números da seção Sobre:** procure por `data-conta` e altere o número nos dois lugares da linha.
- **Horário:** altere em dois pontos do `index.html` — no texto da seção Contato e em `openingHoursSpecification`.
- **Depois de alterar CSS ou JS:** troque o `?v=3.0.0` no fim dos endereços desses arquivos (em `index.html` e `politica-de-privacidade.html`) por um número novo, para os visitantes receberem a versão atualizada.
- **Mapa:** o Google Maps só é carregado quando o visitante clica em "Ver mapa interativo".

## Testar no computador

Com o Python instalado, rode na pasta do site:

```bash
python .claude/dev_server.py
```

Abra `http://localhost:8765`. O envio do formulário é simulado (um nome contendo a palavra "falha" simula erro). O envio de e-mail de verdade só acontece na hospedagem.

## Política de Privacidade

O texto é o mesmo do site anterior, com duas alterações: a data de atualização e a troca da menção ao Google Fonts (as fontes agora são locais) pela menção ao Google Maps.

## Créditos

- Fotos novas da seção Sobre, do [Unsplash](https://unsplash.com/license) (uso comercial livre): `sobre-dutos.jpg` por Nopparuj Lamaikul e `sobre-condensadoras.jpg` por Kettenreaktion.
- Fontes [Sora](https://fonts.google.com/specimen/Sora) e [Inter](https://fonts.google.com/specimen/Inter), licença SIL Open Font.
- Animações com [GSAP](https://gsap.com) e [Lenis](https://lenis.darkroom.engineering).
- Contorno dos estados no mapa gerado a partir da malha pública do IBGE.

## Imagens geradas por IA (opcional)

As fotos atuais são reais. Se quiser trocar alguma por uma imagem gerada (por exemplo, no Gemini), salve com o mesmo nome e proporção do arquivo que será substituído. Sugestões de pedido:

- **Topo (`hero-vrf.jpg`, 1920×1145):** "Fotografia hiper-realista de condensadoras VRF brancas alinhadas na cobertura de um edifício comercial em Manaus, fim de tarde, céu amazônico com nuvens altas, lente grande-angular, sem pessoas, sem logotipos."
- **Sobre (`sobre-dutos.jpg`, vertical 1200×1800):** "Fotografia hiper-realista do interior de um edifício corporativo moderno com dutos de ar condicionado aparentes no teto, luz natural, tons de azul e branco, sem pessoas, sem logotipos."
- **Manutenção (`servico-pmoc.jpg`, 1024×683):** "Fotografia hiper-realista de técnico com luvas azuis limpando o filtro de um ar condicionado split em um escritório, foco nas mãos, fundo desfocado, sem logotipos."

Depois de trocar um JPG, apague os `.webp` de mesmo nome na pasta `img` (ou gere novos), para o site não continuar mostrando a foto antiga.
