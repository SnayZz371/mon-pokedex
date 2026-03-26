/* ==========================================================
   api.js - Service réseau et extraction de données 
========================================================== */

/**
 * Récupère une liste séquentielle de Pokémon via l'API REST.
 */
async function telechargerPokemons(decalage, limite) {
    const adresseRecherche = "https://pokeapi.co/api/v2/pokemon?offset=" + decalage + "&limit=" + limite;
    const reponse = await fetch(adresseRecherche);
    // Renvoi d'erreur pour traitement par la couche fonctionnelle
    if (!reponse.ok) throw new Error("API Indisponible");
    const donnees = await reponse.json();
    return donnees.results;
}

/**
 * Récupère le manifeste technique (sprites, stats, types) d'un spécimen.
 */
async function telechargerDetailsPokemon(nomAnglais) {
    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + nomAnglais);
    if (!reponse.ok) throw new Error("Détails indisponibles");
    return await reponse.json();
}

/**
 * Récupère les métadonnées de l'espèce, la traduction française, 
 * et la référence vers la chaîne d'évolution.
 */
async function telechargerNomFrancaisEtEvolutionUrl(nomAnglais, nomParDefaut) {
    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + nomAnglais);
    
    // Rétrocompatibilité en cas d'absence de données d'espèce
    if (!reponse.ok) {
        return { nom: nomParDefaut, evolutionUrl: null };
    }
    
    const informationsEspece = await reponse.json();
    
    let nomFrancaisTrouve = nomParDefaut;
    for (let j = 0; j < informationsEspece.names.length; j++) {
        if (informationsEspece.names[j].language.name === "fr") {
            nomFrancaisTrouve = informationsEspece.names[j].name;
            break;
        }
    }
    
    let adresseEvolution = null;
    if (informationsEspece.evolution_chain && informationsEspece.evolution_chain.url) {
        adresseEvolution = informationsEspece.evolution_chain.url;
    }
    
    return { nom: nomFrancaisTrouve, evolutionUrl: adresseEvolution };
}

/**
 * Parcourt récursivement l'arborescence d'évolution 
 * puis gère les traductions localisées séquentiellement.
 */
async function telechargerChaineEvolutions(urlChaine) {
    const reponse = await fetch(urlChaine);
    const donnees = await reponse.json();
    
    let listeEvolutionsAnglais = [];
    let noeudCourant = donnees.chain;
    
    // Descente de l'arbre d'évolution principal
    while (noeudCourant) {
        listeEvolutionsAnglais.push(noeudCourant.species.name); 
        
        // Progression au noeud enfant (limité au premier choix de branchement)
        if (noeudCourant.evolves_to && noeudCourant.evolves_to.length > 0) {
            noeudCourant = noeudCourant.evolves_to[0];
        } else {
            noeudCourant = null; // Fin de l'embranchement
        }
    }
    
    // Conversion de la liste de nomenclature EN vers FR
    let listeEvolutionsFrancais = [];
    for(let k = 0; k < listeEvolutionsAnglais.length; k++) {
        // Utilisation du service existant pour récupérer la traduction unique
        const traduction = await telechargerNomFrancaisEtEvolutionUrl(listeEvolutionsAnglais[k], listeEvolutionsAnglais[k]);
        listeEvolutionsFrancais.push(traduction.nom);
    }
    
    return listeEvolutionsFrancais;
}
