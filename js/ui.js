/* ==========================================================
   js/ui.js - Gestionnaire de l'Interface Utilisateur (DOM)
========================================================== */

const grilleHTML = document.getElementById("grille-pokemon");
const boiteModale = document.getElementById("modale-details");
const divNumeroPage = document.getElementById("numero-page");

// Définition statique des codes hexadécimaux pour chaque classification de type
const COULEURS_TYPES = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705898',
    steel: '#B7B7CE', fairy: '#D685AD'
};

/**
 * Instancie et insère le composant DOM (composant Carte) correspondant au Pokémon.
 */
function dessinerCarteHTML(lePokemon, comportementAuClicEtEntree) {
    const boiteHtml = document.createElement("div");
    boiteHtml.className = "carte-pokemon";
    
    // Attributs interactifs (Accessibilité WCAG et navigation clavier ARIA)
    boiteHtml.setAttribute("tabindex", "0");
    boiteHtml.setAttribute("role", "button");

    // Génération du nœud HTML contenant les puces de description de types
    let badgesTypesHTML = '<div class="carte-pokemon-types" style="margin-top:5px;">';
    for (let i = 0; i < lePokemon.types.length; i++) {
        let nomTypeAnglais = lePokemon.types[i].type.name;
        let couleur = COULEURS_TYPES[nomTypeAnglais] || '#777';
        badgesTypesHTML += `<span style="background-color: ${couleur}; padding: 3px 6px; border-radius: 4px; font-size: 11px; color: white; margin-right: 4px;">${nomTypeAnglais}</span>`;
    }
    badgesTypesHTML += '</div>';

    // Rendu en structure DOM interne
    boiteHtml.innerHTML = `
        <img src="${lePokemon.photoFront}" alt="Image frontale ${lePokemon.nom}">
        <p># ${lePokemon.identifiant}</p>
        <p>${lePokemon.nom}</p>
        ${badgesTypesHTML}
    `;

    // Événement déclencheur standard basé sur le clic
    boiteHtml.addEventListener("click", function() {
        comportementAuClicEtEntree(lePokemon);
    });

    // Événement déclencheur d'accessibilité (Validation Entrée/Espace)
    boiteHtml.addEventListener("keydown", function(evenementTouches) {
        if (evenementTouches.key === "Enter" || evenementTouches.key === " ") {
            comportementAuClicEtEntree(lePokemon);
        }
    });

    grilleHTML.appendChild(boiteHtml);
}

/**
 * Alimente la vue de détails `<dialog>` et actualise le DOM de la fenêtre superposée.
 */
function afficherDetailsPopupBasique(lePokemon) {
    document.getElementById("modale-nom").innerText = lePokemon.nom;
    
    // Processus de conditionnement des ressources d'images dorsales et frontales
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

    // Concaténation séquentielle des pastilles couleurs internes
    let HTMLTypesDoc = "";
    for (let i = 0; i < lePokemon.types.length; i++) {
        let nomType = lePokemon.types[i].type.name;
        HTMLTypesDoc += `<span style="background-color: ${COULEURS_TYPES[nomType] || '#777'}; color: white; padding: 2px 6px; border-radius: 4px; margin-right: 5px;">${nomType}</span>`;
    }
    document.getElementById("modale-types").innerHTML = HTMLTypesDoc;

    // Concaténation des compétences matérielles et affichage logique en chaîne
    let texteCapacites = "";
    for (let c = 0; c < lePokemon.capacites.length; c++) {
        texteCapacites += lePokemon.capacites[c].ability.name;
        if (c < lePokemon.capacites.length - 1) texteCapacites += ", ";
    }
    document.getElementById("modale-capacites").innerText = texteCapacites || "Non listé";

    // Rendu hiérarchique list-item des statistiques quantitatives de combat
    const statsHTML = document.getElementById("modale-stats-liste");
    statsHTML.innerHTML = "";
    for (let s = 0; s < lePokemon.statistiques.length; s++) {
        let elementListe = document.createElement("li");
        elementListe.innerText = `${lePokemon.statistiques[s].stat.name.toUpperCase()} : ${lePokemon.statistiques[s].base_stat}`;
        statsHTML.appendChild(elementListe);
    }

    // Réinitialisation conditionnelle préalable à l'appel réseau des évolutions
    document.getElementById("modale-evolutions").innerText = "Résolution en cours...";

    boiteModale.showModal();
}

/**
 * Actualise l'indicateur d'état temporel de pagination.
 */
function mettreAJourTextePage(numeroPageActuelle) {
    divNumeroPage.innerText = "Page " + numeroPageActuelle;
}
