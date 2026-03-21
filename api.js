/* ==========================================================
   js/api.js - Fichier gérant la connexion internet (Réseau)
   Son rôle : Parler au serveur distant "PokeAPI"
========================================================== */

/**
 * Fonction asynchrone pour télécharger une liste de Pokémons.
 * @param {number} decalage - A partir de quel numéro commencer (0, 20, 40...)
 * @param {number} limite - Combien de Pokémons on veut par page (20)
 */
async function telechargerPokemons(decalage, limite) {
    // On construit l'adresse web de l'API avec nos variables "offset" et "limit"
    const adresseRecherche = "https://pokeapi.co/api/v2/pokemon?offset=" + decalage + "&limit=" + limite;
    
    // On "fetch" (récupère) les données de cette adresse
    const reponse = await fetch(adresseRecherche);
    const donnees = await reponse.json(); // Transforme le texte en objet JavaScript
    
    return donnees.results; // Renvoie juste le tableau des noms et adresses
}


/**
 * Fonction pour télécharger les détails d'un seul Pokémon (poids, sprites, types...)
 * @param {string} nomAnglais - Le nom original du pokémon en anglais (ex: bulbasaur)
 */
async function telechargerDetailsPokemon(nomAnglais) {
    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon/" + nomAnglais);
    return await reponse.json();
}


/**
 * Fonction pour obtenir le vrai nom français (ex: "Bulbizarre" au lieu de "Bulbasaur")
 */
async function telechargerNomFrancais(nomAnglais, nomParDefaut) {
    const reponse = await fetch("https://pokeapi.co/api/v2/pokemon-species/" + nomAnglais);
    const informationsEspece = await reponse.json();
    
    let nomFrancaisTrouve = nomParDefaut; // On garde l'anglais par défaut si jamais c'est introuvable
    
    // Boucle pour chercher la traduction française ("fr") dans les résultats de l'API
    for (let j = 0; j < informationsEspece.names.length; j++) {
        const traduction = informationsEspece.names[j];
        if (traduction.language.name === "fr") {
            nomFrancaisTrouve = traduction.name;
        }
    }
    
    return nomFrancaisTrouve;
}
