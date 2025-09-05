// ===== Player compartido entre páginas =====
(() => {
  const STATE_KEY = 'bgmStateV3'; // {time, playing, track, repeat}

  // --- Tu playlist de 3 canciones (ajusta sólo los archivos si cambian) ---
  const PLAYLIST = [
    {
      src: "/static/loscafresBastara.mp3",
      title: "Los Cafres — Bastará",
      msg: "abre el corazón y deja que todo fluya."
    },
    {
      src: "/static/bob_marley.mp3",
      title: "Bob Marley — Could You Be Loved",
      msg: "sube el ánimo y enciende la sonrisa."
    },
    {
      src: "/static/los_cafres_sielamorsecae.mp3",
      title: "Los Cafres — Si el amor se cae",
      msg: "recuerda: resistir también es amar."
    }
  ];

  const audio = document.getElementById('bgm');
  if (!audio) return; // página sin audio

  // Controles
  const btnPrev   = document.getElementById('hdrPrev');
  const btnPlay   = document.getElementById('hdrPlay');
  const btnNext   = document.getElementById('hdrNext');
  const btnRepeat = document.getElementById('hdrRepeat');

  // UI de estado
  const bar    = document.getElementById('trackBar');
  const barTxt = document.getElementById('trackText');
  const nowEl  = document.getElementById('nowPlaying');

  // Helpers de estado
  const load = () => {
    try { return JSON.parse(localStorage.getItem(STATE_KEY)) || null; }
    catch { return null; }
  };
  const save = (timeOverride) => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        time: typeof timeOverride === "number" ? timeOverride : (audio.currentTime || 0),
        playing: !audio.paused,
        track: currentTrack,
        repeat: repeatMode
      }));
    } catch {}
  };

  let currentTrack = 0;
  let repeatMode = false;

  // Init desde estado
  const prev = load();
  if (prev && Number.isFinite(prev.track) && PLAYLIST[prev.track]) currentTrack = prev.track;
  if (prev && typeof prev.repeat === "boolean") repeatMode = prev.repeat;

  const setSrc = () => { audio.src = PLAYLIST[currentTrack].src; };

  const updateUI = () => {
    const t = PLAYLIST[currentTrack];
    if (nowEl) nowEl.textContent = `Now Playing: ${t.title}`;
    if (bar && barTxt){
      if (!audio.paused){
        bar.classList.add('playing');
        barTxt.textContent = `Ambientación: ${t.title} — ${t.msg}`;
      } else {
        bar.classList.remove('playing');
        barTxt.innerHTML = 'Sugerencia: ve a <a href="/comenzar">“Comenzar”</a> y activa “Ambientar página”.';
      }
    }
    if (btnPlay) btnPlay.textContent = audio.paused ? '▶' : '⏸';
    if (btnRepeat) btnRepeat.classList.toggle('active', repeatMode);
  };

  const playSafe = async () => {
    try { await audio.play(); }
    catch { /* bloqueo de auto-play; se habilita al tocar un botón */ }
    updateUI(); save();
  };

  const next = (auto=false) => {
    currentTrack = (currentTrack + 1) % PLAYLIST.length;
    const wasPlaying = !audio.paused || auto;
    setSrc(); audio.currentTime = 0;
    if (wasPlaying) playSafe(); else updateUI();
    save(0);
  };

  const prevF = () => {
    currentTrack = (currentTrack - 1 + PLAYLIST.length) % PLAYLIST.length;
    const wasPlaying = !audio.paused;
    setSrc(); audio.currentTime = 0;
    if (wasPlaying) playSafe(); else updateUI();
    save(0);
  };

  // Aplicar src inicial y tiempo previo
  setSrc();
  audio.volume = 0.9;
  if (prev && Number.isFinite(prev.time)) audio.currentTime = Math.max(0, prev.time - 0.25);
  updateUI();

  // Si venía sonando, intentar reproducir
  if (prev && prev.playing) { playSafe(); }

  // Eventos de controles
  btnPrev && btnPrev.addEventListener('click', prevF);
  btnNext && btnNext.addEventListener('click', () => next(false));
  btnPlay && btnPlay.addEventListener('click', async () => {
    if (audio.paused) await playSafe(); else audio.pause();
    updateUI(); save();
  });
  btnRepeat && btnRepeat.addEventListener('click', () => {
    repeatMode = !repeatMode; audio.loop = repeatMode;
    updateUI(); save();
  });

  // Eventos del <audio>
  ['timeupdate','play','pause','seeking','seeked','loadeddata'].forEach(ev => {
    audio.addEventListener(ev, () => { updateUI(); save(); });
  });
  audio.addEventListener('ended', () => {
    if (!audio.loop) next(true);
  });

  // Guardar al salir
  window.addEventListener('beforeunload', () => save());
})();
