## 🌟 Ce que fait le projet

- **Affiche les Pokémon** : Affiche 20 Pokémon par page avec leur image 3D animée (quand disponible), leur numéro et leur vrai nom en français ("Bulbizarre" au lieu de "Bulbasaur" !).
- **Scan et Détails** : Quand on clique sur une carte, une bulle pop-up s'ouvre pour donner son poids, sa taille et ses types.
- **Recherche Instantanée** : Tapez un texte pour filtrer et trouver un Pokémon parmi ceux présents sur l'écran.
- **Design Réaliste** : Au lieu d'un simple site plat, le design CSS donne l'illusion de tenir la célèbre machine rouge entre ses mains (avec la grosse lentille bleue, l'écran biseauté et la croix directionnelle).

## 🚀 Comment lancer le projet ?

Puisque le code est totalement pensé pour être accessible, **il n'y a absolument rien à installer !** Pas besoin de serveur local ou de Node.js.

1. Téléchargez ou récupérez les fichiers sur votre ordinateur.
2. **Faites simplement un double-clic sur le fichier `index.html`** pour l'ouvrir dans votre navigateur web (Chrome, Edge, Safari...).
3. C'est tout !

## 📁 Architecture et explication du code

Le code a été séparé de manière très logique pour que vous puissiez comprendre chaque ligne sans vous perdre :

- `index.html` : C'est le squelette. Il positionne les différentes parties physiques du Pokédex (haut, écran, boutons).
- `style.css` : C'est la peinture. Fichier unique et très standard qui utilise les couleurs réelles de la machine avec Grid et Flexbox pour positionner le tout.
- **Dossier Javascript (`js/`)** : Découpé en 3 petits cerveaux, tous abondamment commentés en français :
  - **`api.js`** : S'occupe uniquement d'appeler l'adresse internet de PokéAPI (`fetch()`) et de récupérer les données en texte.
  - **`ui.js`** : Ne s'occupe que de créer les boîtes visuelles vertes et de gérer la grille. C'est le fichier du dessin.
  - **`app.js`** : C'est le chef d'orchestre. Il écoute les clics sur les boutons (comme "Suivant"), demande les données à `api.js` puis ordonne à `ui.js` de les afficher.

## 🛠️ Technologies Utilisées

- HTML natif
- CSS basique (Variables très simples)
- JavaScript "Vanilla" (Standard) avec des boucles `for` classiques, des `document.getElementById()`, et des fonctions `async`/`await` faciles à lire.
