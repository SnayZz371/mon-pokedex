/* ==========================================================
   js/app.js - Fichier applicatif principal de l'orchestration
========================================================== */

let pageActuelle = 1;
const nombreDePokemonsParPage = 20; 
let decalage = 0; 

// Stratégie de mémoïsation locale pour filtrage persistant
let tousLesPokemonsCharges = [];

// Sélection stricte des éléments de commande
const boutonPrecedent = document.getElementById("btn-prec");
const boutonSuivant = document.getElementById("btn-suiv");
const boutonFermerModale = document.getElementById("btn-fermer-modale");
const champRecherche = document.getElementById("champ-recherche");
const texteChargement = document.getElementById("message-chargement");
const grilleHTMLApp = document.getElementById("grille-pokemon");

/**
 * Supervise le routage et le téléchargement des entités sur chargement initial
 * ainsi que sa gestion globale des exceptions matérielles.
 */
async function chargerEtAfficherLaPage() {
    grilleHTMLApp.innerHTML = "";
    texteChargement.style.display = "block";
    texteChargement.innerText = "Chargement des données en cours...";
    tousLesPokemonsCharges = [];

    try {
        const listeBrute = await telechargerPokemons(decalage, nombreDePokemonsParPage);

        for (let i = 0; i < listeBrute.length; i++) {
            const nomAnglais = listeBrute[i].name;
            
            // Flux de résolution et requêtes en cascade de PokéAPI
            const infosStats = await telechargerDetailsPokemon(nomAnglais);
            const especeVf = await telechargerNomFrancaisEtEvolutionUrl(nomAnglais, infosStats.name);

            // Gestion de l'imagerie selon les ressources disponibles
            let imgFaces = infosStats.sprites.front_default;
            let imgDos = infosStats.sprites.back_default; 
            
            if (infosStats.sprites.other["official-artwork"].front_default) {
                imgFaces = infosStats.sprites.other["official-artwork"].front_default;
            }

            // Instanciation de l'objet métier de données (DTO) compilé complet
            const monPokemonObj = {
                identifiant: infosStats.id,
                nom: especeVf.nom,
                photoFront: imgFaces,
                photoBack: imgDos,
                poids: infosStats.weight,
                taille: infosStats.height,
                types: infosStats.types,
                statistiques: infosStats.stats,     
                capacites: infosStats.abilities,    
                adresseEvolutions: especeVf.evolutionUrl
            };

            tousLesPokemonsCharges.push(monPokemonObj);
            
            // Délégation par inversion de contrôle (callback asynchrone)
            dessinerCarteHTML(monPokemonObj, ouvrirModaleEtChargerEvolutionLogique);
        }

        texteChargement.style.display = "none";
        
        mettreAJourTextePage(pageActuelle);
        if (pageActuelle === 1) { 
            boutonPrecedent.disabled = true; 
        } else { 
            boutonPrecedent.disabled = false; 
        }

    } catch (erreur) {
        console.error("Log de Panique réseau :", erreur);
        
        // Attribution de message d'erreur conforme à l'exigence d'anomalie réseau
        texteChargement.style.display = "block";
        if (erreur.message && erreur.message.includes("fetch") || erreur instanceof TypeError) {
            texteChargement.innerText = "Erreur de connexion, veuillez réessayer";
        } else {
            texteChargement.innerText = "Une erreur inattendue est survenue";
        }
    }
}

/**
 * Routeur d'affichage modal et gestionnaire asynchrone de l'arborescence des évolutions.
 * Se déclenche spécifiquement en événement d'interface.
 */
async function ouvrirModaleEtChargerEvolutionLogique(poKemon) {
    // Rend instantanément la majorité l'affichage visuel statique  
    afficherDetailsPopupBasique(poKemon);

    // Initialisation du traitement lent parallèle pour requêtes tertiaires
    const emplacementTxtEvo = document.getElementById("modale-evolutions");
    
    if (!poKemon.adresseEvolutions) {
        emplacementTxtEvo.innerText = "Information inconnue.";
        return;
    }

    try {
        const listeEvolutionsTraduites = await telechargerChaineEvolutions(poKemon.adresseEvolutions);
        
        if (listeEvolutionsTraduites.length > 1) {
            emplacementTxtEvo.innerText = listeEvolutionsTraduites.join(" ➡ ");
        } else {
            emplacementTxtEvo.innerText = "Ce Pokémon n'évolue pas.";
        }
    } catch (erreurEvo) {
        emplacementTxtEvo.innerText = "Impossible de récupérer la famille d'évolution.";
    }
}

/* ==========================================================
   Mécanismes d'événementiels et écouteurs du flux principal 
========================================================== */

boutonSuivant.addEventListener("click", function() {
    decalage += nombreDePokemonsParPage;
    pageActuelle++;
    chargerEtAfficherLaPage();
});

boutonPrecedent.addEventListener("click", function() {
    if (pageActuelle > 1) {
        decalage -= nombreDePokemonsParPage;
        pageActuelle--;
        chargerEtAfficherLaPage();
    }
});

boutonFermerModale.addEventListener("click", function() {
    document.getElementById("modale-details").close();
});

// Opération de filtrage sériel sans nouvel appel serveur REST
champRecherche.addEventListener("keyup", function(infoEvenement) {
    const texteSaisi = infoEvenement.target.value.toLowerCase().trim();
    grilleHTMLApp.innerHTML = "";
    
    let nombrePokemonsTrouves = 0;

    for (let i = 0; i < tousLesPokemonsCharges.length; i++) {
        const pkmInstanceMemoire = tousLesPokemonsCharges[i];
        if (pkmInstanceMemoire.nom.toLowerCase().includes(texteSaisi)) {
            dessinerCarteHTML(pkmInstanceMemoire, ouvrirModaleEtChargerEvolutionLogique);
            nombrePokemonsTrouves++;
        }
    }

    // Gestion du rendu visuel de page vide / échec du filtrage
    if (nombrePokemonsTrouves === 0 && texteSaisi !== "") {
        texteChargement.innerText = "Aucun Pokémon trouvé avec ce nom";
        texteChargement.style.display = "block";
    } else {
        texteChargement.style.display = "none";
    }
});

// Appel du point d'entrée
chargerEtAfficherLaPage();
