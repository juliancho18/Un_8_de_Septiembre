/* ============================================================================
   static/scripts.js  —  DJ: 8 de Septiembre
   1) Reveal on scroll
   2) Player persistente
   3) Estrella fugaz global
   4) Ráfagas de fugaces sobre #skyGlow
   5) Maravillas (carrusel robusto con prueba de extensiones y pre-carga)
   ========================================================================== */

/* ---------- 1) Reveal on scroll ---------- */
(() => {
  const boot = () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) en.target.classList.add('in-view'); });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
  };
  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

/* ---------- 2) Player persistente ---------- */
(() => {
  const boot = () => {
    const audio = document.getElementById('bgm');
    if (!audio) return;

    const DEFAULT_PLAYLIST = [
      { src: '/static/loscafresBastara.mp3',          title: 'Los Cafres — Bastará' },
      { src: '/static/bob_marley.mp3',                title: 'Bob Marley — Could You Be Loved' },
      { src: '/static/los_cafres_sielamorsecae.mp3',  title: 'Los Cafres — Si el amor se cae' }
    ];
    const PLAYLIST = (window.__PLAYLIST && Array.isArray(window.__PLAYLIST) && window.__PLAYLIST.length)
      ? window.__PLAYLIST : DEFAULT_PLAYLIST;

    const STATE_KEY = 'bgmStateV2';
    const q = id => document.getElementById(id);
    const btnPrev   = q('hdrPrev');
    const btnPlay   = q('hdrPlay');
    const btnNext   = q('hdrNext');
    const btnRepeat = q('hdrRepeat');
    const now       = q('nowPlaying');
    const bar       = q('trackBar');
    const txt       = q('trackText');

    const load = () => { try { return JSON.parse(localStorage.getItem(STATE_KEY)) || null; } catch { return null; } };
    const save = (i) => { try { localStorage.setItem(STATE_KEY, JSON.stringify({ time: audio.currentTime||0, playing: !audio.paused, track: i })); } catch {} };

    const ui = (playing, title) => {
      if (bar && txt) {
        if (playing) { bar.classList.add('playing'); txt.textContent = `Ambientación: ${title} • Sonando… •`; }
        else { bar.classList.remove('playing'); txt.textContent = 'Ambientación lista'; }
      }
      if (now) now.textContent = playing ? `Now Playing: ${title}` : 'Ambientación lista';
      if (btnPlay) btnPlay.textContent = playing ? '⏸' : '▶';
    };

    let loop = false, i = 0;
    const st = load(); if (st && Number.isFinite(st.track)) i = st.track;

    const setSrc = () => (audio.src = PLAYLIST[i].src);
    audio.volume = 0.9; setSrc();

    if (st && Number.isFinite(st.time)) audio.currentTime = Math.max(0, st.time - 0.2);
    if (st && st.playing) audio.play().catch(()=>{});
    ui(!audio.paused, PLAYLIST[i].title);

    const next = (auto=false) => { i = (i+1) % PLAYLIST.length; const was = !audio.paused || auto; setSrc(); audio.currentTime = 0; if (was) audio.play().catch(()=>{}); ui(!audio.paused, PLAYLIST[i].title); save(i); };
    const prev = () => { i = (i-1+PLAYLIST.length)%PLAYLIST.length; const was = !audio.paused; setSrc(); audio.currentTime = 0; if (was) audio.play().catch(()=>{}); ui(!audio.paused, PLAYLIST[i].title); save(i); };

    btnPrev?.addEventListener('click', prev);
    btnNext?.addEventListener('click', () => next(false));
    btnPlay?.addEventListener('click', async () => { if (audio.paused) { try{ await audio.play(); } catch {} } else audio.pause(); ui(!audio.paused, PLAYLIST[i].title); save(i); });
    btnRepeat?.addEventListener('click', () => { loop = !loop; audio.loop = loop; btnRepeat.classList.toggle('active', loop); });

    ['timeupdate','play','pause'].forEach(ev => audio.addEventListener(ev, () => { ui(!audio.paused, PLAYLIST[i].title); save(i); }));
    audio.addEventListener('ended', () => { if (!audio.loop) next(true); });
    window.addEventListener('beforeunload', () => save(i));
  };
  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

/* ---------- 3) Estrella fugaz global (diagonal) ---------- */
(() => {
  const boot = () => {
    const star = document.getElementById('shootingStar');
    if (!star) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { star.style.display = 'none'; return; }

    let flying = false, t = null;
    const R = (a,b) => Math.random()*(b-a)+a;

    function shoot(){
      if (flying) return;
      const vw = innerWidth, vh = innerHeight;
      const y0 = R(vh*.10, vh*.45), x0 = -Math.max(80, vw*.08), x1 = vw + Math.max(120, vw*.12), y1 = y0 + R(vh*.20, vh*.38), dur = R(3,6);
      star.style.setProperty('--x0',`${x0}px`); star.style.setProperty('--y0',`${y0}px`);
      star.style.setProperty('--x1',`${x1}px`); star.style.setProperty('--y1',`${y1}px`);
      star.style.setProperty('--dur',`${dur}s`);
      star.classList.remove('shooting'); void star.offsetWidth;
      flying = true; star.classList.add('shooting');
      setTimeout(() => { flying = false; clearTimeout(t); t = setTimeout(shoot, R(12,28)*1000); }, dur*1000);
    }
    t = setTimeout(shoot, R(2,8)*1000);
    addEventListener('resize', () => { if (!flying) { clearTimeout(t); t = setTimeout(shoot, 1500); }});
  };
  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

/* ---------- 4) Ráfagas pequeñas sobre el cielo ---------- */
(() => {
  const boot = () => {
    const layer = document.getElementById('starsLayer');
    const curtain = document.getElementById('skyCurtain');
    if (!layer || !curtain) return;

    function mk(dir,x,y,d){
      const s = document.createElement('div');
      s.className = 'tiny-star';
      s.style.left = x+'px'; s.style.top = y+'px';
      s.style.animation = `${dir==='ne'?'diag-ne':dir==='nw'?'diag-nw':'diag-s'} ${d}ms linear forwards`;
      s.addEventListener('animationend', () => s.remove());
      layer.appendChild(s);
    }
    function burst(){
      const r = layer.getBoundingClientRect(), c = 4 + Math.floor(Math.random()*4);
      for (let k=0;k<c;k++){
        const dir = (k%3===0)?'ne':(k%3===1)?'nw':'s';
        const x   = Math.floor(r.width*(0.10 + Math.random()*0.8));
        const y   = -30 - Math.floor(Math.random()*60);
        const d   = 700 + Math.floor(Math.random()*700);
        setTimeout(() => mk(dir,x,y,d), k*90);
      }
    }
    curtain.addEventListener('animationiteration', burst);
    setInterval(burst, 4200 + Math.floor(Math.random()*1800));
  };
  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();

/* ---------- 5) Maravillas: carrusel robusto ---------- */
(() => {
  const boot = () => {
    const pic1 = document.getElementById('marPic1');
    const pic2 = document.getElementById('marPic2');
    const top  = document.getElementById('infoTop');
    const box  = document.getElementById('infoBox');
    if (!pic1 || !pic2 || !top || !box) return;

    /* Dataset (usa base del archivo sin extensión) */
    const items = [
      { title: '1504 — El David de Miguel Ángel', base: 'david_miguel_angel_1504',
        html: "<p><strong>El corazón del mármol.</strong> Florencia vio despertar al <em>David</em>. No era sólo piedra: era un pulso escondido; la quietud que sostiene una decisión justa. Miguel Ángel retiró lo superfluo hasta dejar la verdad al desnudo.</p><p>Su mirada no es de soberbia, sino de foco: la serenidad que antecede al acto correcto.</p><ul class='nice-list'><li>La lección: <em>quitar</em> también es crear; simplificar es revelar.</li><li>Tu espejo: ordenas lo complejo hasta que la forma justa aparece sin gritar.</li></ul>"
      },
      { title: '1565 — Fundación de San Agustín, Florida', base: 'san_agustin_florida_1565',
        html: "<p><strong>La ciudad que aprendió a quedarse.</strong> San Agustín, el asentamiento más antiguo de EE. UU., resistió tormentas, cambios y olvidos.</p><p>Perseverar no es quedarse inmóvil: es saber cuándo anclar y cuándo abrir velas.</p><ul class='nice-list'><li>La lección: lo que perdura no siempre hace ruido.</li><li>Tu espejo: resiliencia suave; firmeza que no necesita alardes.</li></ul>"
      },
      { title: '1966 — Nace Star Trek', base: 'star_trek',
        html: "<p><strong>Pasaporte para soñar.</strong> La pantalla se volvió nave, el guion un mapa del porvenir. <em>Star Trek</em> nos dijo que explorar también es un acto ético.</p><p>Futuro no es casualidad: es método, brújula y equipo.</p><ul class='nice-list'><li>La lección: imaginar también es construir.</li><li>Tu espejo: tus proyectos viajan lejos y vuelven con esperanza utilizable.</li></ul>"
      },
      { title: '1997 — Lunar Prospector despega', base: 'lunar_prospector_1997',
        html: "<p><strong>Linterna para la Luna.</strong> El <em>Lunar Prospector</em> buscó agua en la sombra: la paciencia como forma de luz. Preguntar bien abre cavidades secretas.</p><p>Hay verdades que sólo aparecen cuando el instrumento es preciso y la mirada, constante.</p><ul class='nice-list'><li>La lección: la luz también es método.</li><li>Tu espejo: a tu detalle le nacen respuestas que a otros se les pierden.</li></ul>"
      },
      { title: '2004 — Los Cafres y el reggae romántico', base: 'cafres_cafres',
        html: "<p><strong>El rumor del amor sincero.</strong> Con Los Cafres, el reggae se volvió confidencia: <em>Bastará</em>, <em>Si el amor se cae</em>. El amor no se impone: vibra hasta ordenar la vida.</p><p>La palabra puede ser hogar cuando no miente y cuando cuida.</p><ul class='nice-list'><li>La lección: verdad antes que pose.</li><li>Tu espejo: tu voz convence sin alzar la voz.</li></ul>"
      }
    ];

    /* Intenta /static/<base>.(jpg|jpeg|png|webp) y resuelve con la primera que cargue */
    const tryExts = ['jpg','jpeg','png','webp'];
    function resolveSrc(base){
      return new Promise((resolve, reject) => {
        let i = 0, done = false;
        function tryNext(){
          if (done || i >= tryExts.length) { reject(new Error('No image found')); return; }
          const url = `/static/${base}.${tryExts[i++]}`;
          const img = new Image();
          img.onload  = () => { if (!done){ done = true; resolve(url); } };
          img.onerror = () => tryNext();
          img.src = url;
        }
        tryNext();
      });
    }

    /* Cambia imagen con pre-carga y animación */
    let idx = 0, showing = pic1, timer = null, switching = false;

    [pic1, pic2].forEach(el => {
      el.style.position='absolute'; el.style.inset='0';
      el.style.objectFit='cover';   el.style.opacity='0';
      el.style.transform='scale(.86)';
      el.style.transition='opacity 900ms ease, transform 900ms ease';
    });

    function setTexts(entry){
      top.innerHTML = `<h3>${entry.title}</h3>`;
      box.innerHTML = entry.html;
    }

    async function swapTo(entry){
      if (switching) return;
      switching = true;
      setTexts(entry);

      const nextEl = (showing === pic1) ? pic2 : pic1;
      const prevEl = showing;

      try{
        const src = await resolveSrc(entry.base);
        // Pre-carga garantizada
        nextEl.src = src;
        // pequeño frame para que el navegador “fije” el src antes de transicionar
        requestAnimationFrame(() => {
          // Mostrar next
          nextEl.style.opacity = '1';
          nextEl.style.transform = 'scale(1)';
          // Ocultar prev
          prevEl.style.opacity = '0';
          prevEl.style.transform = 'scale(.82)';
          showing = nextEl;
          // liberar switching después de la animación
          setTimeout(() => { switching = false; }, 950);
        });
      }catch{
        // si no encuentra archivo, no rompemos el ciclo
        switching = false;
      }
    }

    async function first(){
      setTexts(items[0]);
      try{
        const src = await resolveSrc(items[0].base);
        pic1.src = src;
        requestAnimationFrame(() => {
          pic1.style.opacity = '1';
          pic1.style.transform = 'scale(1)';
          showing = pic1;
        });
      }catch{}
    }

    function cycle(){
      idx = (idx + 1) % items.length;
      swapTo(items[idx]);
    }

    first().then(() => {
      timer = setInterval(cycle, 7000);
    });
  };
  (document.readyState === 'loading')
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
