/* ==========================================================
   js/ui.js - Fichier gérant l'Interface Visuelle (HTML)
   Son rôle : Fabriquer des éléments et les afficher à l'écran
========================================================== */

// On récupère ici les "boîtes" HTML dans lesquelles on va travailler
const grilleHTML = document.getElementById("grille-pokemon");
const boiteModale = document.getElementById("modale-details");
const divNumeroPage = document.getElementById("numero-page");

/**
 * Fonction créant le composant HTML (carte verte) du Pokémon
 */
function dessinerCarteHTML(lePokemon) {
    // Crée une "div" dans le vide
    const boiteHtml = document.createElement("div");
    
    // On lui donne la classe CSS "carte-pokemon" pour la décoration
    boiteHtml.className = "carte-pokemon";

    // On remplit l'intérieur avec l'image et les textes
    boiteHtml.innerHTML = `
        <img src="${lePokemon.photo}" alt="${lePokemon.nom}">
        <p># ${lePokemon.identifiant}</p>
        <p>${lePokemon.nom}</p>
    `;

    // Écouteur de clic : Si on clique sur la carte, on ouvre la popup "Scanner" détaillée
    boiteHtml.addEventListener("click", function() {
        afficherDetailsPopup(lePokemon);
    });

    // Enfin, on accroche cette nouvelle boîte visuelle sur notre grille principale
    grilleHTML.appendChild(boiteHtml);
}


/**
 * Fonction remplissant la fenêtre popup avec les bonnes données du Pokémon
 */
function afficherDetailsPopup(lePokemon) {
    // Remplacement basique du texte dans le HTML
    document.getElementById("modale-nom").innerText = lePokemon.nom;
    document.getElementById("modale-image").src = lePokemon.photo;
    
    // PokéAPI renvoie le poids et la taille x10. On divise pour les kilogrammes / mètres réels.
    document.getElementById("modale-poids").innerText = lePokemon.poids / 10;
    document.getElementById("modale-taille").innerText = lePokemon.taille / 10;

    // Pour les types, on peut en avoir un ("Feu") ou deux ("Eau, Sol"). On lit le tableau avec une boucle :
    let texteDesTypes = "";
    for (let i = 0; i < lePokemon.types.length; i++) {
        texteDesTypes += lePokemon.types[i].type.name + " "; // ex: "grass poison "
    }
    document.getElementById("modale-types").innerText = texteDesTypes;

    // La boîte "dialog" s'affiche par-dessus le reste
    boiteModale.showModal();
}


/**
 * Met à jour le petit écran vert en bas avec "Page X"
 */
function mettreAJourTextePage(numeroPageActuelle) {
    divNumeroPage.innerText = "Page " + numeroPageActuelle;
}
