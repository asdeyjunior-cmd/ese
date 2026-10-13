/* ESETEC — comptage anonyme des visiteurs (affiché dans l'espace admin)
 * Chaque appareil reçoit un identifiant aléatoire (localStorage) et n'est enregistré
 * qu'une fois par session et par rôle : visiteurs/<id> = { premiere, derniere, client, marchand }.
 * Usage : <script type="module" src="visites.js" data-role="client|marchand"></script>
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

(function () {
  var balise = document.querySelector('script[src$="visites.js"]');
  var role = balise && balise.getAttribute("data-role");
  if (role !== "client" && role !== "marchand") return;

  try {
    var cleSession = "esetecVisite_" + role;
    if (sessionStorage.getItem(cleSession)) return;

    var id = localStorage.getItem("esetecVisiteurId");
    var nouveau = !id;
    if (!id) {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
         : (Math.random().toString(36).slice(2) + Date.now().toString(36));
      localStorage.setItem("esetecVisiteurId", id);
    }

    var app = initializeApp({
      apiKey: "AIzaSyD0AD4E1t_YuQLHOgsEOy_wQKZ4l9ycrMo",
      authDomain: "esetec-marketplace.firebaseapp.com",
      projectId: "esetec-marketplace",
      appId: "1:480104714016:web:c8b923f80c103701385145",
      databaseURL: "https://esetec-marketplace-default-rtdb.firebaseio.com"
    }, "visites");

    var maintenant = Date.now();
    var donnees = { derniere: maintenant };
    donnees[role] = maintenant;
    if (nouveau) donnees.premiere = maintenant;

    update(ref(getDatabase(app), "visiteurs/" + id), donnees)
      .then(function () { sessionStorage.setItem(cleSession, "1"); })
      .catch(function (e) { console.warn("Visite non enregistrée", e); });
  } catch (e) { /* stockage bloqué (navigation privée) : on ne compte pas */ }
})();
