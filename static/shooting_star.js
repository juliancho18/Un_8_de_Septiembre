(function(){
  const STAR = document.getElementById('shootingStar');
  if(!STAR) return;

  const PHASE_KEY = 'shootingStarPhase';
  const DELAYS = [5000, 7000, 10000]; // 5s, 7s, 10s secuenciales
  const DUR_RANGE = [1200, 1900];     // duración de cada ráfaga en ms

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // respeta accesibilidad
  }

  let phase = 0;
  try {
    const stored = localStorage.getItem(PHASE_KEY);
    if(stored !== null) phase = (parseInt(stored,10) || 0) % DELAYS.length;
  } catch(e){}

  let timer = null;

  function randomTrajectory(){
    const pattern = Math.floor(Math.random()*4);
    let sx, sy, ex, ey;
    switch(pattern){
      case 0: sx=-10; sy=Math.random()*20-10; ex=110; ey=60+Math.random()*40; break;          // TL → BR
      case 1: sx=-10; sy=80+Math.random()*20; ex=110; ey=Math.random()*40-10; break;          // BL → TR
      case 2: sx=-10; sy=10+Math.random()*80; ex=110; ey=sy+(Math.random()*14-7); break;      // L → R
      default:sx=10+Math.random()*80; sy=-10; ex=sx+(Math.random()*14-7); ey=110; break;      // T → B
    }
    STAR.style.setProperty('--sx', sx+'vw');
    STAR.style.setProperty('--sy', sy+'vh');
    STAR.style.setProperty('--ex', ex+'vw');
    STAR.style.setProperty('--ey', ey+'vh');
  }

  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function savePhase(){ try{ localStorage.setItem(PHASE_KEY, String(phase)); }catch(e){} }
  function clearTimer(){ if(timer){ clearTimeout(timer); timer=null; } }

  function queueNextBurst(){
    clearTimer();
    savePhase();
    const baseDelay = DELAYS[phase];
    phase = (phase+1) % DELAYS.length;
    timer = setTimeout(launchBurst, baseDelay);
  }

  function launchBurst(){
    if(document.hidden){ queueNextBurst(); return; }
    randomTrajectory();
    const duration = rand(DUR_RANGE[0], DUR_RANGE[1]);
    STAR.style.animation = 'none';
    STAR.offsetHeight; // reflow
    STAR.style.animation = `star-fly ${duration}ms ease-in forwards`;

    const onEnd = () => {
      STAR.style.animation = 'none';
      STAR.removeEventListener('animationend', onEnd);
      queueNextBurst();
    };
    STAR.addEventListener('animationend', onEnd, { once:true });
  }

  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden){ queueNextBurst(); } });
  window.addEventListener('beforeunload', ()=>{ clearTimer(); savePhase(); });

  // Primera ráfaga inmediata
  launchBurst();
})();
