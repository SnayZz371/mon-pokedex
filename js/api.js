/* ==========================================================
   js/api.js - Fichier gérant la connexion internet
========================================================== */

/**
 * Fonction asynchrone pour télécharger une liste de Pokémons.
 */
async function telechargerPokemons(decalage, limite) {
    const adresseRecherche = "https://pokeapi.co/api/v2/pokemon?offset=" + decalage + "&limit=" + limite;
    const reponse = await fetch(adresseRecherche);
    // Gestion d'erreur renforcée
    if (!reponse.ok) throw new Error("API Indisponible");
    const donnees = await reponse.json();
    return donnees.results;
}

/**
 * Fonction pour télécharger les détails d'un Pokémon complet (stats, sprites...)
 */
async function telechargerDetailsPokemon(nomAnglais) {
    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + nomAnglais);
    if (!reponse.ok) throw new Error("Détails indisponibles");
    return await reponse.json();
}

/**
 * Récupère le vrai nom français et l'URL de sa ligne d'évolution.
 */
async function telechargerNomFrancaisEtEvolutionUrl(nomAnglais, nomParDefaut) {
    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + nomAnglais);
    
    // Si l'espèce n'existe pas (très rare), on renvoie juste les données par défaut sans buguer (Exigence robustesse)
    if (!reponse.ok) {
        return { nom: nomParDefaut, evolutionUrl: null };
    }
    
    const informationsEspece = await reponse.json();
    
    let nomFrancaisTrouve = nomParDefaut;
    for (let j = 0; j < informationsEspece.names.length; j++) {
        if (informationsEspece.names[j].language.name === "fr") {
            nomFrancaisTrouve = informationsEspece.names[j].name;
            break; // On arrête la boucle si on a trouvé
        }
    }
    
    // On récupère "l'adresse web" qui contient la famille d'évolution
    let adresseEvolution = null;
    if (informationsEspece.evolution_chain && informationsEspece.evolution_chain.url) {
        adresseEvolution = informationsEspece.evolution_chain.url;
    }
    
    return { nom: nomFrancaisTrouve, evolutionUrl: adresseEvolution };
}

/**
 * NOUVEAUTÉ : Fouiller l'arbre des évolutions complexe fourni par l'API
 */
async function telechargerChaineEvolutions(urlChaine) {
    const reponse = await fetch(urlChaine);
    const donnees = await reponse.json();
    
    let listeEvolutionsAnglais = [];
    let noeudCourant = donnees.chain;
    
    // On descend la chaîne d'évolution ligne par ligne (Ex: Bulbizarre -> Herbizarre -> Florizarre)
    while (noeudCourant) {
        listeEvolutionsAnglais.push(noeudCourant.species.name); 
        
        // Si ce pokémon a une suite d'évolution, on avance sur le suivant
        if (noeudCourant.evolves_to && noeudCourant.evolves_to.length > 0) {
            noeudCourant = noeudCourant.evolves_to[0];
        } else {
            noeudCourant = null; // Fin de l'arbre
        }
    }
    
    // On doit redemander à l'API les traductions françaises pour chaque évolution !
    let listeEvolutionsFrancais = [];
    for(let k = 0; k < listeEvolutionsAnglais.length; k++) {
        // Astuce : On utilise la fonction d'au-dessus pour trouver les noms !
        const traduction = await telechargerNomFrancaisEtEvolutionUrl(listeEvolutionsAnglais[k], listeEvolutionsAnglais[k]);
        listeEvolutionsFrancais.push(traduction.nom);
    }
    
    return listeEvolutionsFrancais;
}
