/* ============================================================
   VNZ Climatização — main.js (Site 3.0)
   Navegação, formulário e cenas de rolagem (GSAP + ScrollTrigger).
   Sem JavaScript, ou com "movimento reduzido" no sistema, o site
   continua completo — só sem as animações.
   ============================================================ */
(function () {
  'use strict';

  var raiz = document.documentElement;
  function $(seletor, contexto) { return (contexto || document).querySelector(seletor); }
  function $$(seletor, contexto) { return Array.prototype.slice.call((contexto || document).querySelectorAll(seletor)); }
  function midia(consulta) { return !!(window.matchMedia && window.matchMedia(consulta).matches); }

  var reduzido = midia('(prefers-reduced-motion: reduce)');
  var temGsap = !!(window.gsap && window.ScrollTrigger);
  var animar = temGsap && !reduzido;
  var ponteiroFino = midia('(hover: hover) and (pointer: fine)');
  var lenis = null;

  if (!animar) raiz.classList.remove('movimento');
  window.__vnzPronto = true;

  /* ---------- Ano atual no rodapé ---------- */
  var ano = $('#ano-atual');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ============================================================
     ROLAGEM SUAVE (só em desktop; no celular a rolagem é nativa)
     ============================================================ */
  if (animar) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (ponteiroFino && window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ============================================================
     CABEÇALHO: fundo, tema claro/escuro, esconder ao descer
     ============================================================ */
  var cabecalho = $('.cabecalho');
  var barraProgresso = $('.progresso i');
  var whats = $('.whats-flutuante');
  var secoesTema = $$('[data-tema]');
  var ultimoY = window.pageYOffset;
  var aguardando = false;

  function menuEstaAberto() { return raiz.classList.contains('menu-aberto'); }

  function aoRolar() {
    aguardando = false;
    var y = window.pageYOffset;

    if (cabecalho) {
      cabecalho.classList.toggle('rolado', y > 24);
      if (!menuEstaAberto()) {
        if (y > ultimoY + 6 && y > 520) cabecalho.classList.add('oculto');
        else if (y < ultimoY - 6 || y <= 520) cabecalho.classList.remove('oculto');
      }
      // Qual seção está atrás do cabeçalho? Define logo e cores do menu.
      var tema = 'escuro';
      for (var i = 0; i < secoesTema.length; i++) {
        var r = secoesTema[i].getBoundingClientRect();
        if (r.top <= 44 && r.bottom > 44) { tema = secoesTema[i].getAttribute('data-tema'); break; }
      }
      cabecalho.setAttribute('data-sobre', tema);
    }
    ultimoY = y;

    if (barraProgresso) {
      var maximo = raiz.scrollHeight - window.innerHeight;
      barraProgresso.style.transform = 'scaleX(' + (maximo > 0 ? Math.min(1, y / maximo) : 0) + ')';
    }
    if (whats) whats.classList.toggle('visivel', y > window.innerHeight * 0.6);
  }
  window.addEventListener('scroll', function () {
    if (!aguardando) { aguardando = true; requestAnimationFrame(aoRolar); }
  }, { passive: true });
  window.addEventListener('resize', aoRolar);
  aoRolar();

  /* Item do menu correspondente à seção visível */
  var linksMenu = {};
  $$('.menu ul a[href^="#"]').forEach(function (a) { linksMenu[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window && Object.keys(linksMenu).length) {
    var observadorMenu = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        Object.keys(linksMenu).forEach(function (id) {
          var ativo = id === entrada.target.id;
          linksMenu[id].classList.toggle('ativo', ativo);
          if (ativo) linksMenu[id].setAttribute('aria-current', 'true');
          else linksMenu[id].removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(linksMenu).forEach(function (id) {
      var secao = document.getElementById(id);
      if (secao) observadorMenu.observe(secao);
    });
  }

  /* ============================================================
     MENU MOBILE
     ============================================================ */
  var botaoMenu = $('.menu-botao');
  function definirMenu(aberto) {
    if (!botaoMenu) return;
    raiz.classList.toggle('menu-aberto', aberto);
    botaoMenu.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    if (aberto && cabecalho) cabecalho.classList.remove('oculto');
    if (lenis) { if (aberto) lenis.stop(); else lenis.start(); }
  }
  if (botaoMenu) {
    botaoMenu.addEventListener('click', function () { definirMenu(!menuEstaAberto()); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuEstaAberto()) { definirMenu(false); botaoMenu.focus(); }
    });
    window.addEventListener('resize', function () {
      if (menuEstaAberto() && window.innerWidth > 1020) definirMenu(false);
    });
  }

  /* ============================================================
     ÂNCORAS: rolagem suave até a seção
     ============================================================ */
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var destino = link.getAttribute('href');
    if (destino.length < 2) return;
    var alvo = document.getElementById(destino.slice(1));
    if (!alvo) return;
    e.preventDefault();
    definirMenu(false);
    if (lenis) lenis.scrollTo(alvo, { duration: 1.4 });
    else alvo.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'start' });
    if (window.history && history.replaceState) history.replaceState(null, '', destino);
  });

  /* ============================================================
     FORMULÁRIO DE CONTATO
     Mesmo contrato do enviar.php: POST com nome, email, mensagem,
     site (honeypot) e lgpd; resposta JSON { sucesso, mensagem }.
     Se o JavaScript estiver desativado, o envio normal continua funcionando.
     ============================================================ */
  var form = $('#form-contato');
  if (form) {
    var retorno = $('#form-retorno');
    var botaoEnviar = form.querySelector('button[type="submit"]');
    var rotuloEnviar = botaoEnviar.textContent;

    var mostrarRetorno = function (mensagem, sucesso) {
      retorno.textContent = mensagem;
      retorno.className = 'form-retorno ' + (sucesso ? 'ok' : 'erro');
    };

    // Volta do envio sem JavaScript: o enviar.php redireciona para /?enviado=1#contato ou /?erro=1#contato
    var consulta = window.location.search;
    if (/[?&]enviado=1/.test(consulta)) {
      mostrarRetorno('Mensagem enviada com sucesso! Retornaremos em breve.', true);
    } else if (/[?&]erro=1/.test(consulta)) {
      mostrarRetorno('Não foi possível enviar sua mensagem. Confira os campos e tente novamente, ou fale conosco pelo WhatsApp (92) 98632-3508.', false);
    }

    $$('.campo input, .campo textarea', form).forEach(function (campo) {
      campo.addEventListener('input', function () { campo.parentNode.classList.remove('invalido'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      retorno.className = 'form-retorno';
      $$('.campo', form).forEach(function (caixa) {
        var campo = caixa.querySelector('input, textarea');
        caixa.classList.toggle('invalido', !!campo && !campo.checkValidity());
      });
      if (!form.checkValidity()) { form.reportValidity(); return; }

      botaoEnviar.disabled = true;
      botaoEnviar.textContent = 'Enviando...';

      var restaurar = function () {
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = rotuloEnviar;
      };

      fetch(form.getAttribute('action') || 'enviar.php', {
        method: 'POST',
        body: new FormData(form),
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then(function (resposta) { return resposta.json(); })
        .then(function (dados) {
          mostrarRetorno(dados.mensagem, !!dados.sucesso);
          if (dados.sucesso) form.reset();
        })
        .catch(function () {
          mostrarRetorno('Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp (92) 98632-3508.', false);
        })
        .then(restaurar);
    });
  }

  /* ============================================================
     MAPA: o Google Maps só é carregado quando o visitante pede
     ============================================================ */
  var botaoMapa = $('#mapa-carregar');
  if (botaoMapa) {
    botaoMapa.addEventListener('click', function () {
      var local = $('#local');
      var quadro = document.createElement('iframe');
      quadro.src = 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1sVNZ+Climatiza%C3%A7%C3%A3o,+R.+Aristofano+Antony,+5+-+Petr%C3%B3polis,+Manaus+-+AM!6i16!3m1!1spt-BR!5m1!1spt-BR';
      quadro.title = 'Mapa com a localização da VNZ Climatização em Manaus';
      quadro.referrerPolicy = 'no-referrer-when-downgrade';
      quadro.setAttribute('allowfullscreen', '');
      local.innerHTML = '';
      local.appendChild(quadro);
    });
  }

  /* Brilho que acompanha o cursor nos cartões de diferenciais */
  if (ponteiroFino) {
    $$('.diferencial').forEach(function (cartao) {
      cartao.addEventListener('mousemove', function (e) {
        var r = cartao.getBoundingClientRect();
        cartao.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        cartao.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  if (!animar) return;

  /* ============================================================
     ANIMAÇÕES
     ============================================================ */

  /* Divide um texto em palavras (mantém a marcação interna, como <span>) */
  function dividir(elemento, comMascara) {
    var palavras = [];
    (function percorrer(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (filho) {
        if (filho.nodeType === 1) { percorrer(filho); return; }
        if (filho.nodeType !== 3) return;
        var fragmento = document.createDocumentFragment();
        filho.nodeValue.split(/(\s+)/).forEach(function (parte) {
          if (!parte) return;
          if (/^\s+$/.test(parte)) { fragmento.appendChild(document.createTextNode(' ')); return; }
          var externo = document.createElement('span');
          if (comMascara) {
            var interno = document.createElement('span');
            externo.className = 'palavra';
            interno.className = 'palavra-i';
            interno.textContent = parte;
            externo.appendChild(interno);
            palavras.push(interno);
          } else {
            externo.className = 'pal';
            externo.textContent = parte;
            palavras.push(externo);
          }
          fragmento.appendChild(externo);
        });
        no.replaceChild(fragmento, filho);
      });
    })(elemento);
    elemento.classList.add('dividido');
    return palavras;
  }

  /* ---------- Herói: entrada + do calor ao conforto ---------- */
  var heroi = $('.heroi');
  if (heroi) {
    var tituloHeroi = $('.heroi-titulo', heroi);
    var palavrasHeroi = dividir(tituloHeroi, true);
    var introducoes = $$('[data-intro]', heroi);
    gsap.set(palavrasHeroi, { yPercent: 118 });
    gsap.set(introducoes, { y: 26 });

    gsap.timeline({ delay: 0.1, defaults: { ease: 'power4.out' } })
      .fromTo('.heroi-foto', { scale: 1.12 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
      .to(palavrasHeroi, { yPercent: 0, duration: 1.15, stagger: 0.05 }, 0.15)
      .to(introducoes, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 0.65);

    var ar = window.VNZFluxoAr ? window.VNZFluxoAr.iniciar($('.heroi-ar', heroi)) : null;
    var valorTermo = $('#termo-valor');
    var legendaFora = $('.termo-fora', heroi);
    var legendaDentro = $('.termo-dentro', heroi);
    var grau = { v: 34 };

    var alternarLegenda = function (frio) {
      legendaFora.classList.toggle('ativo', !frio);
      legendaDentro.classList.toggle('ativo', frio);
    };
    valorTermo.textContent = '34';
    alternarLegenda(false);

    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: heroi, start: 'top top', end: 'bottom bottom', scrub: 0.5,
        onUpdate: function (cena) {
          if (ar) ar.temperatura(cena.progress);
          alternarLegenda(cena.progress > 0.55);
        }
      }
    })
      .to('.heroi-calor', { opacity: 0 }, 0)
      .to('.heroi-frio', { opacity: 1 }, 0)
      .fromTo('.heroi-foto img', { scale: 1.14 }, { scale: 1 }, 0)
      .to(grau, { v: 23, onUpdate: function () { valorTermo.textContent = Math.round(grau.v); } }, 0)
      .to('.termo-marca', { xPercent: 100 }, 0)
      .fromTo('.termo-numero', { color: '#ffb47a' }, { color: '#cde9f8' }, 0);
  }

  /* ---------- Faixa rolante: acelera com a rolagem ---------- */
  var trilhoFaixa = $('.faixa-trilho');
  if (trilhoFaixa) {
    var giro = gsap.to(trilhoFaixa, { xPercent: -50, duration: 42, ease: 'none', repeat: -1 });
    var repouso;
    ScrollTrigger.create({
      trigger: '.faixa', start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { if (self.isActive) giro.play(); else giro.pause(); },
      onUpdate: function (self) {
        var fator = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 420);
        gsap.to(giro, { timeScale: fator, duration: 0.25, overwrite: true });
        clearTimeout(repouso);
        repouso = setTimeout(function () { gsap.to(giro, { timeScale: 1, duration: 1, overwrite: true }); }, 140);
      }
    });
  }

  /* ---------- Entradas genéricas: [data-anima="sobe"] ---------- */
  var itensSobe = $$('[data-anima="sobe"]');
  if (itensSobe.length) {
    gsap.set(itensSobe, { opacity: 0, y: 46 });
    ScrollTrigger.batch(itensSobe, {
      start: 'top 90%', once: true,
      onEnter: function (lote) {
        gsap.to(lote, { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', stagger: 0.09, overwrite: true, clearProps: 'transform' });
      }
    });
  }

  /* ---------- Fotos: revelação por máscara + paralaxe ---------- */
  $$('[data-anima="mascara"]').forEach(function (moldura) {
    var foto = $('img', moldura);
    var forca = parseFloat(moldura.getAttribute('data-paralaxe')) || 0;
    var escala = 1 + (forca * 2 + 2) / 100;
    gsap.set(moldura, { clipPath: 'inset(100% 0% 0% 0%)' });
    gsap.set(foto, { scale: escala + 0.25 });
    ScrollTrigger.create({
      trigger: moldura, start: 'top 88%', once: true,
      onEnter: function () {
        gsap.to(moldura, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'power4.inOut', clearProps: 'clipPath' });
        gsap.to(foto, { scale: escala, duration: 1.9, ease: 'power3.out' });
      }
    });
    if (forca) {
      gsap.fromTo(foto, { yPercent: -forca }, {
        yPercent: forca, ease: 'none',
        scrollTrigger: { trigger: moldura, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  });

  /* ---------- Sobre: texto que "acende" palavra a palavra ---------- */
  var destaque = $('.sobre-destaque');
  if (destaque) {
    gsap.fromTo(dividir(destaque, false), { opacity: 0.15 }, {
      opacity: 1, ease: 'none', stagger: 0.12,
      scrollTrigger: { trigger: destaque, start: 'top 84%', end: 'bottom 50%', scrub: 0.4 }
    });
  }

  /* ---------- Contadores ---------- */
  $$('[data-conta]').forEach(function (numero) {
    var fim = parseInt(numero.getAttribute('data-conta'), 10) || 0;
    var estado = { v: 0 };
    numero.textContent = '0';
    ScrollTrigger.create({
      trigger: numero, start: 'top 92%', once: true,
      onEnter: function () {
        gsap.to(estado, { v: fim, duration: 1.6, ease: 'power2.out', onUpdate: function () { numero.textContent = Math.round(estado.v); } });
      }
    });
  });

  /* ---------- Mapa da Região Norte ---------- */
  var mapa = $('.mapa-norte');
  if (mapa) {
    gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: mapa, start: 'top 80%', once: true } })
      .from($$('.mapa-uf', mapa), { opacity: 0, duration: 0.9, stagger: 0.07 })
      .from($$('.mapa-siglas text', mapa), { opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.5')
      .from($$('.mapa-pino', mapa), { opacity: 0, duration: 0.5, stagger: 0.2 }, '-=0.2')
      .from($$('.mapa-ponto', mapa), { scale: 0, transformOrigin: '50% 50%', duration: 0.7, stagger: 0.2, ease: 'back.out(2.4)' }, '<')
      .from($$('.mapa-rota', mapa), { strokeDashoffset: 1.01, duration: 1.3, stagger: 0.2, ease: 'power2.inOut' }, '<0.15');
  }

  /* ---------- Ícones que se desenham ---------- */
  $$('.icone-desenho').forEach(function (icone) {
    gsap.from(icone.children, {
      strokeDashoffset: 1.01, duration: 1.4, ease: 'power2.inOut', stagger: 0.16, delay: 0.2,
      scrollTrigger: { trigger: icone, start: 'top 90%', once: true }
    });
  });

  /* ---------- Serviços ---------- */
  var secaoServicos = $('.servicos');
  if (secaoServicos) {
    var trilho = $('.servicos-trilho', secaoServicos);
    var cartoes = $$('.servico', secaoServicos);
    var barraServicos = $('.sp-barra i', secaoServicos);
    var atualServicos = $('.sp-atual', secaoServicos);
    var mm = gsap.matchMedia();

    // Desktop: galeria fixada que anda na horizontal
    mm.add('(min-width: 900px)', function () {
      secaoServicos.classList.add('servicos--rolagem');

      var distancia = function () { return Math.max(0, trilho.scrollWidth - window.innerWidth); };
      var folga = function () { return parseFloat(getComputedStyle(secaoServicos).paddingBottom) || 0; };
      var ajustarAltura = function () { secaoServicos.style.height = (window.innerHeight + distancia() + folga()) + 'px'; };
      ajustarAltura();
      ScrollTrigger.addEventListener('refreshInit', ajustarAltura);

      var andar = gsap.to(trilho, {
        x: function () { return -distancia(); },
        ease: 'none',
        scrollTrigger: {
          trigger: secaoServicos, start: 'top top',
          end: function () { return '+=' + distancia(); },
          scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: function (self) {
            if (barraServicos) barraServicos.style.transform = 'scaleX(' + self.progress + ')';
            if (atualServicos) atualServicos.textContent = '0' + (Math.round(self.progress * (cartoes.length - 1)) + 1);
          }
        }
      });

      cartoes.forEach(function (cartao) {
        gsap.fromTo($('.servico-foto img', cartao), { xPercent: -7 }, {
          xPercent: 7, ease: 'none',
          scrollTrigger: { trigger: cartao, containerAnimation: andar, start: 'left right', end: 'right left', scrub: true }
        });
      });

      gsap.from(cartoes, {
        opacity: 0, y: 70, duration: 1.1, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: secaoServicos, start: 'top 55%', once: true }
      });

      return function () {
        ScrollTrigger.removeEventListener('refreshInit', ajustarAltura);
        secaoServicos.classList.remove('servicos--rolagem');
        secaoServicos.style.height = '';
        gsap.set(trilho, { clearProps: 'transform' });
        gsap.set(cartoes, { clearProps: 'all' });
        cartoes.forEach(function (cartao) { gsap.set($('.servico-foto img', cartao), { clearProps: 'transform' }); });
      };
    });

    // Celular: cartões empilhados; o de trás encolhe quando o próximo chega
    mm.add('(max-width: 899px)', function () {
      cartoes.forEach(function (cartao, i) {
        if (i === cartoes.length - 1) return;
        gsap.to(cartao, {
          scale: 0.93, ease: 'none',
          scrollTrigger: { trigger: cartoes[i + 1], start: 'top 92%', end: 'top 12%', scrub: true }
        });
      });
      return function () { gsap.set(cartoes, { clearProps: 'transform' }); };
    });
  }

  /* ---------- Orçamento: título e ondas ---------- */
  var chamada = $('.chamada');
  if (chamada) {
    var tituloChamada = $('.chamada-titulo', chamada);
    var palavrasChamada = dividir(tituloChamada, true);
    gsap.set(palavrasChamada, { yPercent: 118 });
    ScrollTrigger.create({
      trigger: tituloChamada, start: 'top 86%', once: true,
      onEnter: function () { gsap.to(palavrasChamada, { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.05 }); }
    });
    gsap.fromTo($('.ondas', chamada), { yPercent: 7 }, {
      yPercent: -7, ease: 'none',
      scrollTrigger: { trigger: chamada, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /* ---------- Botões magnéticos (somente com mouse) ---------- */
  if (ponteiroFino) {
    $$('[data-magnetico]').forEach(function (botao) {
      var moverX = gsap.quickTo(botao, 'x', { duration: 0.6, ease: 'power3.out' });
      var moverY = gsap.quickTo(botao, 'y', { duration: 0.6, ease: 'power3.out' });
      botao.addEventListener('mousemove', function (e) {
        var r = botao.getBoundingClientRect();
        moverX((e.clientX - r.left - r.width / 2) * 0.28);
        moverY((e.clientY - r.top - r.height / 2) * 0.4);
      });
      botao.addEventListener('mouseleave', function () { moverX(0); moverY(0); });
    });
  }

  /* Recalcula as posições quando fontes e imagens terminam de carregar */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
