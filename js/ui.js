/* ==========================================================
   js/ui.js - Fichier gérant l'Interface Visuelle (HTML)
========================================================== */

const grilleHTML = document.getElementById("grille-pokemon");
const boiteModale = document.getElementById("modale-details");
const divNumeroPage = document.getElementById("numero-page");

// Exigence #1 : Types avec couleurs distinctes
const COULEURS_TYPES = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705898',
    steel: '#B7B7CE', fairy: '#D685AD'
};

/**
 * Construit la carte d'un Pokémon sur la page principale.
 */
function dessinerCarteHTML(lePokemon, comportementAuClicEtEntree) {
    const boiteHtml = document.createElement("div");
    boiteHtml.className = "carte-pokemon";
    
    // ACCESSIBILITÉ : Rendre la div "focalisable" et lue comme un bouton
    boiteHtml.setAttribute("tabindex", "0");
    boiteHtml.setAttribute("role", "button");

    // Générer le HTML pour les petites pastilles colorées de Type
    let badgesTypesHTML = '<div class="carte-pokemon-types" style="margin-top:5px;">';
    for (let i = 0; i < lePokemon.types.length; i++) {
        let nomTypeAnglais = lePokemon.types[i].type.name;
        let couleur = COULEURS_TYPES[nomTypeAnglais] || '#777';
        badgesTypesHTML += `<span style="background-color: ${couleur}; padding: 3px 6px; border-radius: 4px; font-size: 11px; color: white; margin-right: 4px;">${nomTypeAnglais}</span>`;
    }
    badgesTypesHTML += '</div>';

    // Remplissage du contenu de la carte
    boiteHtml.innerHTML = `
        <img src="${lePokemon.photoFront}" alt="Image de ${lePokemon.nom}">
        <p># ${lePokemon.identifiant}</p>
        <p>${lePokemon.nom}</p>
        ${badgesTypesHTML}
    `;

    // ÉCOUTEUR SOURIS
    boiteHtml.addEventListener("click", function() {
        comportementAuClicEtEntree(lePokemon);
    });

    // ÉCOUTEUR CLAVIER (ACCESSIBILITÉ WCAG)
    boiteHtml.addEventListener("keydown", function(evenementTouches) {
        if (evenementTouches.key === "Enter" || evenementTouches.key === " ") {
            comportementAuClicEtEntree(lePokemon);
        }
    });

    grilleHTML.appendChild(boiteHtml);
}

/**
 * Fonction remplissant la fenêtre popup avec les bonnes données de base (rapides)
 */
function afficherDetailsPopupBasique(lePokemon) {
    document.getElementById("modale-nom").innerText = lePokemon.nom;
    
    // Exigence #3 : Photos Front ET Back
    const imgFront = document.getElementById("modale-image-front");
    const imgBack = document.getElementById("modale-image-back");
    
    imgFront.src = lePokemon.photoFront;
    if (lePokemon.photoBack) {
        imgBack.src = lePokemon.photoBack;
        imgBack.style.display = "inline";
    } else {
        imgBack.style.display = "none";
    }
    
    document.getElementById("modale-poids").innerText = lePokemon.poids / 10;
    document.getElementById("modale-taille").innerText = lePokemon.taille / 10;

    // Pastilles Couleurs pour la modale
    let HTMLTypesDoc = "";
    for (let i = 0; i < lePokemon.types.length; i++) {
        let nomType = lePokemon.types[i].type.name;
        HTMLTypesDoc += `<span style="background-color: ${COULEURS_TYPES[nomType] || '#777'}; color: white; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">${nomType}</span>`;
    }
    document.getElementById("modale-types").innerHTML = HTMLTypesDoc;

    // Exigence #3 : Capacités (Abilities)
    let texteCapacites = "";
    for (let c = 0; c < lePokemon.capacites.length; c++) {
        texteCapacites += lePokemon.capacites[c].ability.name;
        if (c < lePokemon.capacites.length - 1) texteCapacites += ", ";
    }
    document.getElementById("modale-capacites").innerText = texteCapacites || "Aucune";

    // Exigence #3 : Statistiques Complètes
    const statsHTML = document.getElementById("modale-stats-liste");
    statsHTML.innerHTML = "";
    for (let s = 0; s < lePokemon.statistiques.length; s++) {
        let elementListe = document.createElement("li");
        elementListe.innerText = `${lePokemon.statistiques[s].stat.name.toUpperCase()} : ${lePokemon.statistiques[s].base_stat}`;
        statsHTML.appendChild(elementListe);
    }

    // Réinitialise les évolutions sur "Chargement..."
    document.getElementById("modale-evolutions").innerText = "Recherche en cours...";

    boiteModale.showModal();
}

/**
 * Affiche "Page X" en bas de l'écran
 */
function mettreAJourTextePage(numeroPageActuelle) {
    divNumeroPage.innerText = "Page " + numeroPageActuelle;
}
