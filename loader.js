(function () {
  // true = chargement une seule fois par visite ; false = à chaque page
  var UNE_SEULE_FOIS = true;
  var DUREE_MIN = 800;   // durée minimale d'affichage (ms)
  var DUREE_MAX = 6000;  // sécurité : disparaît après ce délai (ms)

  try {
    if (UNE_SEULE_FOIS) {
      if (sessionStorage.getItem('esetecLoaderVu')) return;
      sessionStorage.setItem('esetecLoaderVu', '1');
    }
  } catch (e) {}

  var css = '#loader{position:fixed;inset:0;z-index:99999;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;transition:opacity .5s,visibility .5s}'
    + '#loader.cache{opacity:0;visibility:hidden}'
    + '#loader img{width:120px;max-width:50vw;animation:loaderPulse 1.2s ease-in-out infinite}'
    + '.loader-spin{width:44px;height:44px;border:4px solid rgba(0,0,0,.1);border-top-color:#ff5e00;border-radius:50%;animation:loaderTourne .8s linear infinite}'
    + '@keyframes loaderTourne{to{transform:rotate(360deg)}}'
    + '@keyframes loaderPulse{50%{transform:scale(1.08)}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var l = document.createElement('div');
  l.id = 'loader';
  l.innerHTML = '<img src="logo.webp" alt="Esetec Marketplace"><div class="loader-spin"></div>';
  document.documentElement.appendChild(l);

  var debut = Date.now();
  var fini = false;

  function cacher() {
    if (fini) return;
    fini = true;
    l.classList.add('cache');
    setTimeout(function () { l.remove(); }, 600);
  }

  window.addEventListener('load', function () {
    var reste = Math.max(0, DUREE_MIN - (Date.now() - debut));
    setTimeout(cacher, reste);
  });
  setTimeout(cacher, DUREE_MAX);
})();
