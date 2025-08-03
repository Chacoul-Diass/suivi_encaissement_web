# Plan d'implémentation - Détection d'augmentation des encaissements rejetés

## Objectif

Implémenter un système pour détecter quand le nombre d'encaissements rejetés augmente et notifier les utilisateurs.

## Analyse du problème

- Les encaissements rejetés ont le statut `REJETE = 1` dans l'enum `EStatutEncaissement`
- L'API `/encaissements/alerts-count` fournit déjà des compteurs d'alertes
- Il faut ajouter un mécanisme de comparaison avec les valeurs précédentes
- Notification en temps réel ou périodique

## Tâches à accomplir

### 1. Étendre le slice d'alertes pour stocker l'historique

- [x] Modifier `store/reducers/select/nombrealert.slice.ts`
- [x] Ajouter un état pour stocker les valeurs précédentes
- [x] Implémenter la logique de comparaison

### 2. Créer un hook personnalisé pour la détection

- [x] Créer `hooks/useRejetesDetection.ts`
- [x] Logique de comparaison des compteurs
- [x] Gestion des seuils d'alerte

### 3. Ajouter des notifications visuelles

- [x] Modifier le composant `parent-encaissement.tsx` pour améliorer la bulle de notification
- [x] Ajouter une logique de détection d'augmentation dans la bulle existante
- [x] Implémenter des animations et couleurs pour indiquer l'augmentation
- [x] Ajouter des toasts de notification pour les augmentations importantes

### 4. Optimiser les performances

- [x] Implémenter un polling intelligent
- [x] Éviter les requêtes inutiles
- [x] Gérer le cache des données

### 5. Tests et validation

- [ ] Tester avec différents scénarios
- [ ] Vérifier les performances
- [ ] Valider l'expérience utilisateur

### 6. Modal de confirmation de déconnexion

- [x] Ajouter une modal de confirmation avant la déconnexion
- [x] Design professionnel avec icône et message d'avertissement
- [x] Boutons d'action (Annuler/Se déconnecter) avec états de chargement
- [x] Prévention des clics accidentels

## Révision

### Changements implémentés

#### 1. Hook personnalisé `useRejetesDetection`

- **Fichier créé** : `hooks/useRejetesDetection.ts`
- **Fonctionnalités** :
  - Polling automatique toutes les 30 secondes
  - Détection d'augmentation du nombre d'encaissements rejetés
  - Calcul de la différence entre les valeurs actuelles et précédentes
  - Gestion des états d'augmentation avec réinitialisation automatique
  - **Prévention des notifications répétitives** : État `hasNotified` pour éviter les doublons

#### 2. Amélioration de la bulle de notification

- **Fichier modifié** : `components/dashboard/parent-encaissement.tsx`
- **Améliorations** :
  - Animation `animate-pulse` et `scale-110` quand augmentation détectée
  - Couleur plus foncée (`bg-red-600`) pour les augmentations
  - Affichage du nombre d'augmentation `(+X)` dans la bulle
  - Tooltip informatif au survol
  - Transition fluide avec `transition-all duration-300`

#### 3. Notifications toast

- **Fonctionnalités ajoutées** :
  - **Design personnalisé** : Toast avec les couleurs de la sidebar (dégradé `from-[#0E1726] via-[#162236] to-[#1a2941]`)
  - **Informations détaillées** : Affichage du nombre d'augmentation, total actuel et instructions
  - **Délais prolongés** : 12-15 secondes pour une meilleure lisibilité
  - **Icône visuelle** : Icône d'alerte dans un cercle rouge plus grand (w-10 h-10)
  - **Largeur fixe** : Toast de 500px de largeur fixe pour une taille optimale
  - **Position optimisée** : Centré en haut avec marges pour éviter d'être masqué
  - **Design épuré** : Design simple et élégant sans animations excessives
  - **Contenu essentiel** : Informations principales sans surcharge visuelle
  - **Barre de progression masquée** : `hideProgressBar: true` pour un look plus professionnel
  - **Son de notification** : Lecture automatique du fichier `/assets/sounds/notification.mp3` avec volume à 50%
  - **Prévention des notifications répétitives** : Chaque augmentation n'est notifiée qu'une seule fois
  - **Réinitialisation plus longue** : 15 secondes au lieu de 10 secondes

#### 4. Intégration avec le système existant

- **Compatibilité** : Utilise l'API existante `/encaissements/1?page=1&limit=1`
- **Performance** : Polling intelligent adaptatif (3-10 secondes selon l'activité)
- **UX** : Notifications non-intrusives avec animations fluides
- **Réactivité** : Vérification immédiate lors du retour sur l'onglet

#### 5. Modal de confirmation de déconnexion

- **Fichier modifié** : `components/layouts/header.tsx`
- **Fonctionnalités** :
  - Modal de confirmation avant déconnexion
  - Design professionnel avec icône d'avertissement
  - Boutons d'action avec états de chargement
  - Prévention des déconnexions accidentelles
  - Message d'avertissement sur les données non sauvegardées

### Résultat

Le système détecte maintenant automatiquement les augmentations d'encaissements rejetés et affiche des notifications visuelles à côté de l'onglet "Rejeté" avec des animations et des toasts informatifs.

## Notes techniques

- Utiliser le statut `REJETE = 1` pour identifier les encaissements rejetés
- L'API `/encaissements/alerts-count` fournit déjà les données nécessaires
- Considérer l'ajout d'un endpoint spécifique pour les statistiques de rejets si nécessaire
