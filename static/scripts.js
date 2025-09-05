// Estrella fugaz mística — vuelo diagonal y aparición esporádica
(() => {
  const star = document.getElementById('shootingStar');
  if (!star) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) { star.style.display = 'none'; return; }

  let flying = false, nextTimer = null;

  function rand(min, max){ return Math.random()*(max-min)+min; }

  function shootOnce(){
    if (flying) return;
    const vw = innerWidth, vh = innerHeight;
    const yStart = rand(vh*0.10, vh*0.45);
    const x0 = -Math.max(80, vw*0.08);
    const x1 = vw + Math.max(120, vw*0.12);
    const y1 = yStart + rand(vh*0.20, vh*0.38);
    const dur = rand(3,6);

    star.style.setProperty('--x0',`${x0}px`);
    star.style.setProperty('--y0',`${yStart}px`);
    star.style.setProperty('--x1',`${x1}px`);
    star.style.setProperty('--y1',`${y1}px`);
    star.style.setProperty('--dur',`${dur}s`);

    star.classList.remove('shooting'); void star.offsetWidth;
    flying = true; star.classList.add('shooting');

    setTimeout(() => {
      flying = false;
      clearTimeout(nextTimer);
      nextTimer = setTimeout(shootOnce, rand(12,28)*1000);
    }, dur*1000);
  }

  nextTimer = setTimeout(shootOnce, rand(2,8)*1000);
  addEventListener('resize', () => { if(!flying){ clearTimeout(nextTimer); nextTimer=setTimeout(shootOnce,1500); }});
})();
