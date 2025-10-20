# Cahier des charges — Système de commandes de repas en ligne

## 1. Contexte et objectifs
- Faciliter la commande de repas en ligne via un parcours simplifié : **parcourir le menu → panier → paiement → suivi**.
- Centraliser la gestion des plats, catégories, prix et promotions pour l'administrateur et la « caisse » numérique.
- Réduire les erreurs de prise de commandes (surtéléphone, papier, etc.) et accélérer le traitement des livraisons.
- Offrir un tableau de bord clair avec les statistiques essentielles : ventes, volume de commandes, plats les plus populaires.

## 2. Besoins fonctionnels (MVP puis améliorations)
### 2.1 Rôles
- **Client** : parcourir le menu, rechercher et filtrer, configurer la commande (options, quantités), appliquer un coupon, payer (simulation), suivre l'état, laisser un avis.
- **Administrateur** : CRUD des catégories/plats/options, gestion des commandes (nouvelle, en préparation, en livraison, terminée, annulée), gestion des codes promotionnels, accès aux rapports.
- **Livreur** *(optionnel)* : consulter la liste de ses livraisons et mettre à jour le statut.

> **Remarque** : la première version cible **un seul restaurant**. La prise en charge de plusieurs établissements est une amélioration possible.

### 2.2 Parcours client
1. Accueil avec la liste des catégories et cartes de plats.
2. Page détail d'un plat (description, prix, photos, options : taille, suppléments).
3. Panier : ajouter/supprimer/modifier les quantités, calcul automatique du total, application de coupon.
4. Checkout : informations client, adresse, mode de réception (livraison ou retrait).
5. Confirmation : affichage du numéro de commande et estimation du temps de préparation.
6. Suivi : consultation des mises à jour d'état via rafraîchissement manuel ou notifications e-mail simples.

### 2.3 Gestion (administration)
- Gestion du catalogue : catégories, plats, options (nom, prix, disponibilité).
- Gestion des commandes : vue d'ensemble, changement de statut, ajout de notes internes.
- Gestion des coupons : code, type (pourcentage ou montant fixe), valeur, date d'expiration, activation.
- Reporting : nombre de commandes et revenus (journalier/hebdomadaire), top des plats.

### 2.4 Exigences non fonctionnelles
- Interface responsive (priorité mobile).
- Performance acceptable pour un catalogue d'environ 200 plats.
- Expérience utilisateur fluide avec un minimum de clics.
- Journalisation légère des événements clés (audit).

### 2.5 Fonctionnalités optionnelles
- Comptes clients et adresses enregistrées.
- Notifications par e-mail ou WhatsApp (via webhook).
- Paiement en ligne simulé (ou intégration ultérieure d'un PSP réel).
- Suivi en temps réel du livreur (amélioration future).

## 3. Technologies envisagées
- **Frontend** : HTML5, CSS3 (Bootstrap), JavaScript (vanilla).
- **Backend** : PHP ≥ 8.x avec architecture MVC simple.
- **Base de données** : MySQL ou MariaDB.
- **Serveur de développement** : XAMPP/LAMP ; **Production** : hébergement mutualisé ou VPS.
- **Stockage des images** : système de fichiers du serveur avec compression et taille maximale contrôlée.
- **Déploiement** : Apache + PHP (Nginx optionnel).

## 4. Architecture du système
### 4.1 Modules principaux
- **Catalogue** : gestion des catégories, plats et options.
- **Panier & commande** : processus de commande complet.
- **Paiement simulé** : validation factice (succès/échec).
- **Administration** : gestion de contenu et suivi des commandes.
- **Notifications** : envoi d'e-mails basiques.
- **Reporting** : tableau de bord statistique.

### 4.2 Modèle de données minimal
- `users` (id, name, email, phone, role [admin, livreur, client], password_hash, created_at)
- `categories` (id, name, is_active)
- `dishes` (id, category_id, name, description, price, image_path, is_active)
- `dish_options` (id, dish_id, name, extra_price) *(optionnel)*
- `coupons` (id, code, type [% ou fixe], value, expires_at, is_active)
- `orders` (id, user_id — NULL pour invité, customer_name, phone, address, delivery_mode [delivery | pickup], subtotal, discount, total, status [new | preparing | out_for_delivery | completed | cancelled], created_at)
- `order_items` (id, order_id, dish_id, quantity, unit_price, options_json)
- `order_status_logs` (id, order_id, old_status, new_status, changed_at, changed_by)

> Pour conserver un panier persistant, on peut ajouter `carts` et `cart_items`. Dans le MVP, le panier est géré en session.

### 4.3 Sécurité et conformité
- Hashage des mots de passe (bcrypt).
- Validation serveur des entrées et protection CSRF.
- Upload d'images sécurisé : formats autorisés et contrôle de la taille.
- Politique de confidentialité concise et absence de stockage des données de paiement (simulation).

## 5. Étapes du projet
1. **Analyse du besoin** : user stories, benchmark d'applications similaires.
2. **Spécifications fonctionnelles et techniques** : wireframes simples, diagrammes de cas d'utilisation.
3. **Conception** : schéma de données (ERD) et structure des pages/routage.
4. **Développement du prototype (MVP)** : catalogue, panier, création de commande, gestion des statuts côté admin.
5. **Intégration** : coupons, rapports, notifications e-mail.
6. **Tests** : unités simples et scénarios end-to-end pour une commande complète.
7. **Documentation et démo** : guide d'installation, guide d'utilisation, vidéo (2–3 minutes).
8. **Améliorations optionnelles** : comptes utilisateurs, paiement réel, multi-restaurants.

## 6. Contraintes
- Code simple et lisible (MVC, commentaires pertinents).
- Compatibilité mobile.
- Temps de préparation configurable côté admin (ex. 25–35 min).
- Architecture extensible sans refonte majeure.

## 7. Livrables
- **Livrable 1 : Analyse et conception**
  - Cahier des charges détaillé, ERD, cas d'utilisation, wireframes.
- **Livrable 2 : Prototype fonctionnel et tests**
  - Code source structuré, script SQL, images de démonstration.
  - Guides d'installation et d'utilisation, rapports de test, vidéo de démonstration (2–3 minutes).

## 8. Planning (indicatif)
- **Début** : 20 octobre 2025
- **Livrable 1** : semaine du 10 novembre 2025
- **Livrable 2** : semaine du 1er décembre 2025
- **Soutenances** : semaines du 22 au 29 décembre 2025

## Annexes
### 8.1 User stories
- En tant que client, je veux rechercher un plat par mot-clé et filtrer par catégorie.
- En tant que client, je veux sélectionner une taille/un supplément et voir le prix se mettre à jour immédiatement.
- En tant que client, je veux appliquer un coupon et visualiser la réduction.
- En tant qu'administrateur, je veux modifier le statut d'une commande et envoyer une notification e-mail.
- En tant qu'administrateur, je veux consulter un rapport quotidien des ventes.

### 8.2 Critères d'acceptation
- Une commande incomplète affiche un message d'erreur clair.
- Le passage de « new » à « preparing » crée une entrée dans `order_status_logs`.
- Un coupon expiré est refusé avec une explication explicite.
- L'interface reste utilisable sur un écran de 360 à 400 px.
