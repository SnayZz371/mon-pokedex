/* ==========================================================
   js/app.js - Le fichier principal (Le "Cerveau")
========================================================== */

let pageActuelle = 1;
const nombreDePokemonsParPage = 20; // Exactement 20 par page (Exigence #1)
let decalage = 0; 

// Liste de cache pour accélérer la recherche en temps réel sans re-télécharger
let tousLesPokemonsCharges = [];

const boutonPrecedent = document.getElementById("btn-prec");
const boutonSuivant = document.getElementById("btn-suiv");
const boutonFermerModale = document.getElementById("btn-fermer-modale");
const champRecherche = document.getElementById("champ-recherche");
const texteChargement = document.getElementById("message-chargement");
const grilleHTMLApp = document.getElementById("grille-pokemon");


/**
 * 1) Fonction de lancement et téléchargement "Try/Catch" (Exigence de Robustesse #4)
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
            
            // On récupère "tout" : stats complètes et espèces traduites
            const infosStats = await telechargerDetailsPokemon(nomAnglais);
            const especeVf = await telechargerNomFrancaisEtEvolutionUrl(nomAnglais, infosStats.name);

            // Images avant/arrière pour la modale (Exigence #3)
            let imgFaces = infosStats.sprites.front_default;
            let imgDos = infosStats.sprites.back_default; 
            
            // Si on préfère l'image HD officielle sur la liste (plus joli)
            if (infosStats.sprites.other["official-artwork"].front_default) {
                imgFaces = infosStats.sprites.other["official-artwork"].front_default;
            }

            // Un très gros objet qui contient tout !
            const monPokemonObj = {
                identifiant: infosStats.id,
                nom: especeVf.nom,
                photoFront: imgFaces,
                photoBack: imgDos,
                poids: infosStats.weight,
                taille: infosStats.height,
                types: infosStats.types,
                statistiques: infosStats.stats,     // Exigence stats
                capacites: infosStats.abilities,    // Exigence abilities
                adresseEvolutions: especeVf.evolutionUrl
            };

            tousLesPokemonsCharges.push(monPokemonObj);
            
            // On le dessine sur la page, ET on lui transmet la mission à accomplir si on clique dessus
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
        console.error("Problème critique :", erreur);
        
        // Exigence #4 : Messages d'Erreur exacts
        texteChargement.style.display = "block";
        if (erreur.message && erreur.message.includes("fetch") || erreur instanceof TypeError) {
            texteChargement.innerText = "Erreur de connexion, veuillez réessayer";
        } else {
            texteChargement.innerText = "Une erreur inattendue est survenue";
        }
    }
}


/**
 * 2) Action asynchrone pour la Modale (Découplage pour de meilleures perfs)
 * Ce code ne s'exécute QUE si le joueur clique sur une carte.
 */
async function ouvrirModaleEtChargerEvolutionLogique(poKemon) {
    // Étape A: Ouvre immédiatement la modale avec les infos qu'on a déjà (affichage instantané)
    afficherDetailsPopupBasique(poKemon);

    // Étape B: On part à la recherche lente des évolutions !
    const emplacementTxtEvo = document.getElementById("modale-evolutions");
    
    if (!poKemon.adresseEvolutions) {
        emplacementTxtEvo.innerText = "Information inconnue.";
        return;
    }

    try {
        const listeEvolutionsTraduites = await telechargerChaineEvolutions(poKemon.adresseEvolutions);
        
        // Si la liste contient plus d'un pokémon (ex: Salamèche -> Reptincel -> Dracaufeu)
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
   3) INTERACTIONS UTILISATEUR 
========================================================== */

boutonSuivant.addEventListener("click", function() {
    decalage = decalage + nombreDePokemonsParPage;
    pageActuelle = pageActuelle + 1;
    chargerEtAfficherLaPage();
});

boutonPrecedent.addEventListener("click", function() {
    if (pageActuelle > 1) {
        decalage = decalage - nombreDePokemonsParPage;
        pageActuelle = pageActuelle - 1;
        chargerEtAfficherLaPage();
    }
});

// Bouton renommé "Retour à la liste" selon l'exigence
boutonFermerModale.addEventListener("click", function() {
    document.getElementById("modale-details").close();
});

// Écouteur de Filtrage par Recherche (Exigence #2)
champRecherche.addEventListener("keyup", function(infoEvenement) {
    const texteSaisi = infoEvenement.target.value.toLowerCase().trim();
    grilleHTMLApp.innerHTML = "";
    
    let nombrePokemonsTrouves = 0;

    // Filtre la liste mémoire sans avoir à repasser par Internet !
    for (let i = 0; i < tousLesPokemonsCharges.length; i++) {
        const petitPkmMecanique = tousLesPokemonsCharges[i];
        if (petitPkmMecanique.nom.toLowerCase().includes(texteSaisi)) {
            dessinerCarteHTML(petitPkmMecanique, ouvrirModaleEtChargerEvolutionLogique);
            nombrePokemonsTrouves++;
        }
    }

    // Gestion du message d'erreur si vide (Exigence #4 et #2)
    if (nombrePokemonsTrouves === 0 && texteSaisi !== "") {
        texteChargement.innerText = "Aucun Pokémon trouvé avec ce nom";
        texteChargement.style.display = "block";
    } else {
        texteChargement.style.display = "none";
    }
});

// Allumage direct à l'ouverture !
chargerEtAfficherLaPage();
