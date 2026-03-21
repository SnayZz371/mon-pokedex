/* ==========================================================
   js/app.js - Le fichier principal (Le "Cerveau")
   Son rôle : Lier api.js et ui.js avec les clics de boutons
========================================================== */

// 1) Variables globales
let pageActuelle = 1;
const nombreDePokemonsParPage = 20;
let decalage = 0; 

// Liste de sauvegarde, très utile pour faire la recherche sans télécharger à l'infini
let tousLesPokemonsCharges = [];

// Sélection des éléments HTML "interactifs" principaux
const boutonPrecedent = document.getElementById("btn-prec");
const boutonSuivant = document.getElementById("btn-suiv");
const boutonFermerModale = document.getElementById("btn-fermer-modale");
const champRecherche = document.getElementById("champ-recherche");
const texteChargement = document.getElementById("message-chargement");


/**
 * 2) La Grande Fonction d'Orchestration Automatique
 */
async function chargerEtAfficherLaPage() {
    
    // On met l'écran visuel sur "Chargement" pendant qu'Internet travaille
    grilleHTML.innerHTML = "";
    texteChargement.style.display = "block";
    tousLesPokemonsCharges = [];

    try {
        // Étape A : On fait appel à "api.js" pour avoir la liste
        const listeBrute = await telechargerPokemons(decalage, nombreDePokemonsParPage);

        // Étape B : Pour chaque Pokémon de cette liste...
        for (let i = 0; i < listeBrute.length; i++) {
            const nomAnglais = listeBrute[i].name;
            
            // ... on demande les détails complets (poids, image 3D) depuis "api.js" encore
            const infosStats = await telechargerDetailsPokemon(nomAnglais);
            const nomFrancais = await telechargerNomFrancais(nomAnglais, infosStats.name);

            // Choix de la meilleure image (priorité au sprite "showdown" 3D)
            let bellePhoto = infosStats.sprites.other["official-artwork"].front_default;
            if (infosStats.sprites.other.showdown && infosStats.sprites.other.showdown.front_default) {
                bellePhoto = infosStats.sprites.other.showdown.front_default;
            } else if (!bellePhoto) {
                 bellePhoto = infosStats.sprites.front_default;
            }

            // On construit une petite boîte maison avec ce qu'on aime de l'API
            const monPokemon = {
                identifiant: infosStats.id,
                nom: nomFrancais,
                photo: bellePhoto,
                poids: infosStats.weight,
                taille: infosStats.height,
                types: infosStats.types
            };

            // On le garde dans notre liste en haut
            tousLesPokemonsCharges.push(monPokemon);
            
            // Étape C : On fait appel à "ui.js" pour le dessiner à l'écran
            dessinerCarteHTML(monPokemon);
        }

        // Fini de tout charger !
        texteChargement.style.display = "none";
        
        // Gestion visuelle de la pagination en bas
        mettreAJourTextePage(pageActuelle);
        if (pageActuelle === 1) { 
            boutonPrecedent.disabled = true; 
        } else { 
            boutonPrecedent.disabled = false; 
        }

    } catch (erreur) {
        console.error("Problème détecté :", erreur);
        texteChargement.innerText = "Erreur de connexion internet ou serveur.";
    }
}


/* ==========================================================
   3) INTERACTIONS UTILISATEUR (Gestion des clics simples)
========================================================== */

// Au clic sur "Page Suivante", on décale de +20 et on recharge
boutonSuivant.addEventListener("click", function() {
    decalage = decalage + nombreDePokemonsParPage;
    pageActuelle = pageActuelle + 1;
    chargerEtAfficherLaPage();
});

// Au clic sur "Page Précédente", on recule de 20 (si possible)
boutonPrecedent.addEventListener("click", function() {
    if (pageActuelle > 1) {
        decalage = decalage - nombreDePokemonsParPage;
        pageActuelle = pageActuelle - 1;
        chargerEtAfficherLaPage();
    }
});

// Bouton Rouge "Croix" de la Modale pour la fermer
boutonFermerModale.addEventListener("click", function() {
    boiteModale.close();
});

// Dès qu'on re-tape une lettre dans la recherche, on filtre
champRecherche.addEventListener("keyup", function(infoEvenement) {
    const texteSaisi = infoEvenement.target.value.toLowerCase();
    grilleHTML.innerHTML = "";

    // On revérifie toute notre mémoire pour voir qui dessiner (appel de ui.js encore une fois)
    for (let i = 0; i < tousLesPokemonsCharges.length; i++) {
        const monPetitPokm = tousLesPokemonsCharges[i];
        if (monPetitPokm.nom.toLowerCase().includes(texteSaisi)) {
            dessinerCarteHTML(monPetitPokm);
        }
    }
});

// 4) Démarrage Immédiat dès la lecture de ce fichier par le navigateur web
chargerEtAfficherLaPage();
