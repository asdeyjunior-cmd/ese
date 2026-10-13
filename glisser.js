/* ESETEC — geste "glisser" pour les carrousels (remplace les boutons précédent / suivant)
 * Fonctionne au doigt, à la souris (cliquer-glisser) et au trackpad / molette horizontale.
 *   EsetecSwipe(element, { onPrev, onNext, onStart, onEnd })
 * Les effets (fondu, glissement, zoom, défilement automatique) restent gérés par chaque carrousel.
 */
(function () {
  "use strict";

  window.EsetecSwipe = function (el, opt) {
    if (!el || el._swipe) { return; }
    el._swipe = true;
    opt = opt || {};
    var SEUIL = 50;
    var x0 = null, y0 = 0, id = null, glisse = false;

    function start() { if (opt.onStart) { opt.onStart(); } }
    function end() { if (opt.onEnd) { opt.onEnd(); } }

    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) { return; }
      x0 = e.clientX; y0 = e.clientY; id = e.pointerId; glisse = false;
      start();
    });

    el.addEventListener("pointermove", function (e) {
      if (x0 === null || e.pointerId !== id) { return; }
      if (Math.abs(e.clientX - x0) > 10 && Math.abs(e.clientX - x0) > Math.abs(e.clientY - y0)) { glisse = true; }
    });

    function fin(e) {
      if (x0 === null || (e && e.pointerId !== id)) { return; }
      var dx = e ? e.clientX - x0 : 0;
      var dy = e ? e.clientY - y0 : 0;
      x0 = null; id = null;
      if (e && e.type === "pointerup" && Math.abs(dx) > SEUIL && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) { if (opt.onNext) { opt.onNext(); } } else { if (opt.onPrev) { opt.onPrev(); } }
      }
      end();
      setTimeout(function () { glisse = false; }, 0);
    }
    el.addEventListener("pointerup", fin);
    el.addEventListener("pointercancel", fin);

    // Un glisser ne doit pas être pris pour un clic (ex. ouvrir une publicité)
    el.addEventListener("click", function (e) {
      if (glisse) { e.stopPropagation(); e.preventDefault(); }
    }, true);

    el.addEventListener("dragstart", function (e) { e.preventDefault(); });

    // Trackpad / molette horizontale
    var verrou = false;
    el.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) { return; }
      e.preventDefault();
      if (verrou) { return; }
      verrou = true;
      start();
      if (e.deltaX > 0) { if (opt.onNext) { opt.onNext(); } } else { if (opt.onPrev) { opt.onPrev(); } }
      setTimeout(function () { verrou = false; end(); }, 700);
    }, { passive: false });
  };
})();
