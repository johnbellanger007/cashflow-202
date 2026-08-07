# Plan d'implémentation : Jeu Cashflow 202

Créer une version web interactive du jeu Cashflow 202 est un projet ambitieux et complexe. Vous avez fourni une excellente base avec de nombreuses photos des éléments physiques du jeu (plateau, cartes, fiches de paie).

Ce document décrit l'architecture technique, les outils qui seront utilisés et le plan d'action étape par étape pour développer ce jeu.

> [!WARNING]
> **Avertissement de Complexité**
> Cashflow 202 contient des règles financières avancées (options d'achat/vente, vente à découvert, immobilier complexe) en plus des règles de base de Cashflow 101. De plus, il y a des centaines de cartes à transcrire à partir de vos photos. Le développement devra se faire par étapes (phases).

## Architecture Technique

### 1. Stack Technologique (Web App)
- **Framework Front-end :** Vite avec React pour une interface utilisateur dynamique, performante et réactive.
- **Styling :** CSS moderne (Tailwind CSS) pour un design premium ("Rich Aesthetics", animations fluides).
- **Gestion d'état (State Management) :** Utilisation de Context API ou Zustand pour gérer l'état complexe du joueur (Bilan financier, liquidités, actifs, passifs) et l'état du jeu (le tour de chaque joueur, les dés).
- **Persistance :** LocalStorage (dans un premier temps) pour sauvegarder la partie en cours de session.

### 2. Modélisation des Données (JSON)
Les cartes du jeu devront être numérisées et transformées en structures de données JSON stockables dans le code :
- **Professions :** Salaires, Dépenses initiales, Épargne.
- **Opportunités (Deals, Capital Gain) :** Actions structurées et options.
- **Marché, Doodads :** Événements aléatoires impactant les joueurs.

> [!CAUTION]
> **Défi principal (Saisie de données)**
> Vos dossiers contiennent des centaines d'images (.JPG, .HEIC). L'IA ne peut pas toutes les lire et les encoder en une seule fois. Je propose de construire le moteur du jeu avec des **données de test (échantillons)** dans un premier temps construits à partir d'exemples visibles. Une fois que la mécanique tourne, nous pourrons étendre la base de données de cartes.

## Étapes de Développement (Phases)

Je propose de diviser le développement en plusieurs phases distinctes :

### Phase 1 : Fondation Projet et Richesse Graphique 
- Initialisation du projet Vite/React.
- Création du design system (thème sombre élégant, inspiré de la haute finance, avec animations CSS fluides).
- Développement de l'interface vitale du jeu : le **Bilan Financier** (Income Statement / Balance Sheet), où l'on voit ses revenus, dépenses, actifs et passifs se mettre à jour en temps réel.

### Phase 2 : Le Moteur du Jeu et le Plateau (Rat Race)
- Modélisation visuelle du plateau de jeu (la roue "Rat Race") avec ses cases (Deal, Doodad, Market, Paycheck, etc.).
- Implémentation du système de lancer de dés, pions et du moteur de tour par tour.
- Mécanique de base : Recevoir son salaire (Paycheck) en passant la case correspondante et mettre à jour le Cash disponible.

### Phase 3 : Mécanique des Cartes (Cashflow base)
- Création du système de pioche lorsqu'on atterrit sur une case spécifique.
- Création des interfaces (Modals premiums) pour afficher et choisir les actions des cartes (Small/Big Deals, Doodads, The Market).
- Logique d'achat ou de vente simple d'actions et d'immobilier.

### Phase 4 : Concepts Avancés Cashflow 202
- Ajout des cartes spécifiques "Capital Gain Deal" et des options complexes (Call / Put, Shorting, Real Estate avancé).
- Intégration des règles avancées de crash boursier ou de boom économique affectant les joueurs.

### Phase 5 : Fast Track
- Implémentation de la piste de victoire "Fast Track".
- Logique de sortie de la "Rat Race" (Revenu Passif > Dépenses totales).
- Poursuivre le rêve (The Dream) sur le plateau externe.

## ❓ Questions Ouvertes pour Validation

1. **Êtes-vous d'accord avec cette approche par phases ?** Nous démarrerons par créer le projet (Phase 1) que vous pourrez tester avant d'ajouter la mécanique complexe.
2. **Design visuel :** Souhaitez-vous un look moderne/sombre (Dark Mode) avec des effets visuels très premium et dynamiques, ou préférez-vous que je réplique le design "papier" original (vert/jaune de Rich Dad, un peu plus rustique) ?
3. **Technologie :** Je m'apprête à créer une application **Vite/React** dans le dossier `Cash_flow_202`. Est-ce bien l'endroit souhaité ?
4. **Acceptez-vous que je crée le projet initial maintenant ?** Si oui, validez ce plan afin que je puisse commencer la programmation !
