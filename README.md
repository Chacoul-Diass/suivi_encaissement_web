git branch -r : Liste les branches distantes
git branch : Liste les branches locales
git fetch --prune : Supprimer les branches locales qui n'existent plus à distance
git fetch --all : Mettre à jour la liste des branches distantes

Voici les commandes utiles pour nettoyer les caches de Git

1. Supprimer le cache local des fichiers trackés :
   git rm -r --cached .
   git add .
   git commit -m "Nettoyage du cache Git"

2. Supprimer le cache Git globalement :
   git gc --prune=now --aggressive

3. Supprimer le cache du fetch/pull :
   git fetch --prune

4. Commande recommandée pour nettoyer complètement Git :
   git gc --prune=now --aggressive
   git fetch --prune