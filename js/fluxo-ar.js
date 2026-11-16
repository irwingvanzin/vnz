/* ============================================================
   VNZ Climatização — fluxo-ar.js
   Canvas do herói: correntes de ar que passam de quentes e
   turbulentas (âmbar) a frias e laminares (azul-gelo).
   Uso: var ar = VNZFluxoAr.iniciar(canvas); ar.temperatura(0..1);
   ============================================================ */
(function () {
  'use strict';

  function iniciar(canvas) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var movel = window.matchMedia && matchMedia('(max-width: 800px)').matches;
    var total = movel ? 44 : 120;
    var largura = 0, altura = 0, dpr = 1;
    var particulas = [];
    var frio = 0;            // 0 = quente, 1 = frio
    var tempo = 0, ultimo = 0, quadro = 0;
    var visivel = true, rodando = false;

    function nova(p, espalhar) {
      p.x = espalhar ? Math.random() * largura : Math.random() * largura * 0.9 - largura * 0.1;
      p.y = Math.random() * altura;
      p.v = 0.7 + Math.random() * 1.5;
      p.esp = 0.6 + Math.random() * 1.5;
      p.fase = Math.random() * 6.283;
      p.vida = 0;
      p.max = 160 + Math.random() * 260;
      return p;
    }

    function redimensionar() {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 2);
      largura = r.width;
      altura = r.height;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particulas.length) {
        for (var i = 0; i < total; i++) particulas.push(nova({}, true));
      }
    }

    function passo(agora) {
      if (!rodando) return;
      quadro = requestAnimationFrame(passo);
      var dt = Math.min(48, agora - ultimo) / 16.67;
      ultimo = agora;
      if (!largura) return;
      tempo += dt * 0.01;

      var quente = 1 - frio;

      // Apaga aos poucos o quadro anterior: é o que cria o rastro
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,' + Math.min(0.5, 0.075 * dt) + ')';
      ctx.fillRect(0, 0, largura, altura);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      // Cor: âmbar no calor → azul-gelo no frio
      var r = Math.round(255 * quente + 196 * frio);
      var g = Math.round(168 * quente + 232 * frio);
      var b = Math.round(96 * quente + 252 * frio);
      var forca = 0.46 + 0.1 * frio;

      for (var i = 0; i < particulas.length; i++) {
        var p = particulas[i];
        // Frio: ondas longas e horizontais (como as do logo). Quente: turbulência que sobe.
        var onda = Math.sin(p.x * 0.0042 + tempo * 1.3 + p.fase * 0.12) * 0.5 + Math.sin(p.x * 0.0019 - tempo * 0.7) * 0.3;
        var turb = Math.sin(p.y * 0.021 + tempo * 4.2 + p.fase) * 1.25 + Math.cos(p.x * 0.016 - tempo * 3.1 + p.fase * 2) * 0.9;
        var angulo = onda * (0.3 + 0.35 * frio) + turb * quente * 0.85 - quente * 0.62;
        var passoPx = p.v * (1.5 + frio * 0.9) * dt;
        var nx = p.x + Math.cos(angulo) * passoPx * (1 - quente * 0.4);
        var ny = p.y + Math.sin(angulo) * passoPx;

        var alfa = Math.sin(Math.PI * Math.min(1, p.vida / p.max)) * forca;
        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alfa.toFixed(3) + ')';
        ctx.lineWidth = p.esp;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;
        p.vida += dt;
        if (p.vida > p.max || nx > largura + 40 || nx < -40 || ny < -40 || ny > altura + 40) nova(p, false);
      }
    }

    function atualizar() {
      var deve = visivel && !document.hidden;
      if (deve && !rodando) {
        rodando = true;
        ultimo = performance.now();
        quadro = requestAnimationFrame(passo);
      } else if (!deve && rodando) {
        rodando = false;
        cancelAnimationFrame(quadro);
      }
    }

    var espera;
    window.addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(redimensionar, 160);
    });
    document.addEventListener('visibilitychange', atualizar);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entradas) {
        visivel = entradas[0].isIntersecting;
        atualizar();
      }).observe(canvas);
    }

    redimensionar();
    atualizar();

    return {
      temperatura: function (valor) { frio = Math.max(0, Math.min(1, valor)); }
    };
  }

  window.VNZFluxoAr = { iniciar: iniciar };
})();
