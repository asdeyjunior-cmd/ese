/* ESETEC — chargement différé des images (Intersection Observer)
 *
 *   EsetecLazy.watch(img, source [, options])
 *     source  : adresse de l'image (texte, y compris data:...) OU fonction qui la renvoie
 *     options : { root: élément défilant (ex. liste horizontale), now: true = charger tout de suite }
 *   EsetecLazy.release(conteneur) : à appeler avant de vider une liste
 *   EsetecLazy.reseauLent         : true si connexion lente / économie de données
 *
 * L'image n'est chargée que lorsqu'elle arrive à ~300 px de l'écran (100 px sur connexion lente).
 * En attendant, un "skeleton" (fond gris animé) occupe la place : la mise en page ne bouge pas.
 */
(function () {
  "use strict";

  var PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

  var cnx = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var lent = !!(cnx && (cnx.saveData || /(^|-)2g$/.test(cnx.effectiveType || "") || (cnx.downlink && cnx.downlink < 0.7)));
  var MARGE = lent ? 100 : 300;

  // ── Styles du skeleton et du fondu (ajoutés automatiquement) ──
  var css =
    ".lazy-img:not(.lazy-ok){" +
      "background-image:linear-gradient(100deg,#e8e8e8 35%,#f3f3f3 50%,#e8e8e8 65%) !important;" +
      "background-size:300% 100% !important;background-color:#e8e8e8 !important;" +
      "background-position:100% 0;animation:lazyBrille 1.4s linear infinite}" +
    ".lazy-img.lazy-err{animation:none;background-image:none !important;background-color:#e8e8e8 !important}" +
    ".lazy-img.lazy-ok{animation:lazyFondu .45s ease}" +
    "@keyframes lazyBrille{to{background-position:0 0}}" +
    "@keyframes lazyFondu{from{opacity:0}to{opacity:1}}" +
    "@media (prefers-reduced-motion:reduce){.lazy-img:not(.lazy-ok),.lazy-img.lazy-ok{animation:none}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var sources = new WeakMap();   // image -> source à charger
  var observeurs = [];           // [{ root, obs }]
  var portes = new WeakMap();    // rangée horizontale -> { proche, attente } (est-elle proche de l'écran ?)

  // Un observateur dont la racine est une rangée horizontale ne voit que la rangée elle-même :
  // sans cette "porte", les images visibles de TOUTES les rangées se chargeraient dès l'arrivée.
  function porte(root) {
    var p = portes.get(root);
    if (p) { return p; }
    p = { proche: false, attente: [] };
    portes.set(root, p);
    new IntersectionObserver(function (es) {
      p.proche = es[es.length - 1].isIntersecting;
      if (p.proche) { var a = p.attente; p.attente = []; a.forEach(charger); }
    }, { rootMargin: MARGE + "px 0px", threshold: 0 }).observe(root);
    return p;
  }

  function finir(img, ok) {
    img.onload = null;
    img.onerror = null;
    img.classList.add(ok ? "lazy-ok" : "lazy-err");
  }

  function charger(img) {
    if (!sources.has(img)) { return; }
    var s = sources.get(img);
    sources.delete(img);
    var src = (typeof s === "function") ? s() : s;
    if (!src) { finir(img, false); return; }

    img.onload = function () { if (img.src !== PIXEL) { finir(img, true); } };
    img.onerror = function () { if (img.src !== PIXEL) { finir(img, false); } };
    img.src = src;
    if (img.complete && img.naturalWidth > 1) { finir(img, true); }   // déjà en cache
  }

  function observeur(root) {
    for (var i = 0; i < observeurs.length; i++) {
      if (observeurs[i].root === root) { return observeurs[i].obs; }
    }
    var o = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) { return; }
        o.unobserve(e.target);
        if (root) {
          var p = porte(root);
          if (!p.proche) { p.attente.push(e.target); return; }
        }
        charger(e.target);
      });
    }, {
      root: root,
      // liste verticale : marge en haut/bas ; liste horizontale : marge à gauche/droite
      rootMargin: root ? ("0px " + MARGE + "px") : (MARGE + "px 0px"),
      threshold: 0
    });
    observeurs.push({ root: root, obs: o });
    return o;
  }

  function watch(img, source, options) {
    if (!img) { return; }
    options = options || {};
    img.classList.add("lazy-img");
    img.decoding = "async";
    if (!img.getAttribute("src")) { img.src = PIXEL; }   // pixel transparent : pas d'icône d'image cassée
    sources.set(img, source);

    if (options.now || !("IntersectionObserver" in window)) { charger(img); return; }
    observeur(options.root || null).observe(img);
  }

  function release(conteneur) {
    if (!conteneur || !conteneur.querySelectorAll) { return; }
    var imgs = conteneur.querySelectorAll("img.lazy-img");
    for (var i = 0; i < imgs.length; i++) {
      sources.delete(imgs[i]);
      for (var k = 0; k < observeurs.length; k++) { observeurs[k].obs.unobserve(imgs[i]); }
    }
  }

  window.EsetecLazy = {
    watch: watch,
    now: function (img, source) { watch(img, source, { now: true }); },
    release: release,
    reseauLent: lent,
    marge: MARGE
  };
})();
