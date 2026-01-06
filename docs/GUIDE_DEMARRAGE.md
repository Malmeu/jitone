# 🚀 Guide de Démarrage Fixwave

Bienvenue sur **Fixwave** ! Ce guide vous aidera à configurer et utiliser votre logiciel de gestion SAV en quelques minutes.

---

## 📋 Table des matières

1. [Première connexion](#première-connexion)
2. [Configuration de votre établissement](#configuration-établissement)
3. [Ajouter votre équipe](#ajouter-équipe)
4. [Créer votre première réparation](#première-réparation)
5. [Gérer votre stock](#gérer-stock)
6. [Effectuer une vente](#effectuer-vente)
7. [Consulter vos statistiques](#statistiques)

---

## 🔐 Première connexion

### Étape 1 : Créer votre compte

1. Rendez-vous sur [fixwave.space](https://fixwave.space)
2. Cliquez sur **"Créer un compte"**
3. Remplissez le formulaire :
   - **Email professionnel** (ex: contact@monateliertech.dz)
   - **Mot de passe sécurisé** (minimum 8 caractères)
   - **Nom de votre établissement**
4. Validez votre email
5. Connectez-vous avec vos identifiants

### Étape 2 : Découvrir le tableau de bord

Une fois connecté, vous arrivez sur votre **tableau de bord** qui affiche :
- 📊 Nombre de réparations du jour
- ✅ Appareils prêts à récupérer
- 💰 Chiffre d'affaires (jour/mois)
- 📋 Activité récente

---

## ⚙️ Configuration de votre établissement {#configuration-établissement}

### Accéder aux paramètres

1. Cliquez sur **"Paramètres"** dans le menu latéral
2. Remplissez les informations de votre établissement :

#### Informations essentielles
- **Nom commercial** : Le nom qui apparaîtra sur les tickets
- **Téléphone** : Numéro de contact client
- **Adresse** : Adresse complète de votre atelier
- **Email** : Email de contact

#### Personnalisation
- **Logo** : Uploadez votre logo (format PNG/JPG, max 2MB)
- **Couleur du ticket** : Choisissez la couleur de vos tickets imprimés
- **Message personnalisé** : Message qui apparaît sur les tickets

#### Exemple de configuration
```
Nom : TechRepair Pro
Téléphone : +213 555 123 456
Adresse : 15 Rue Didouche Mourad, Alger
Email : contact@techrepair.dz
Couleur ticket : #2563EB (Bleu)
Message : "Merci de votre confiance ! Garantie 3 mois"
```

---

## 👥 Ajouter votre équipe {#ajouter-équipe}

### Inviter des membres

1. Allez dans **"Équipe"** → **"Ajouter un membre"**
2. Remplissez les informations :
   - **Nom complet**
   - **Email**
   - **Rôle** :
     - 🔧 **Technicien** : Peut voir et modifier ses réparations assignées
     - 👔 **Manager** : Accès complet à la gestion
     - 👑 **Propriétaire** : Accès total + facturation

3. Le membre reçoit un email d'invitation
4. Il crée son mot de passe et accède à l'espace

### Bonnes pratiques
- ✅ Créez un compte par technicien pour le suivi
- ✅ Utilisez des emails professionnels
- ✅ Définissez les rôles selon les responsabilités

---

## 🔧 Créer votre première réparation {#première-réparation}

### Étape par étape

1. **Cliquez sur "Nouvelle Réparation"** (bouton bleu en haut à droite)

2. **Informations client**
   - Sélectionnez un client existant OU
   - Créez un nouveau client :
     - Nom : Ahmed Benali
     - Téléphone : +213 555 000 111

3. **Détails de l'appareil**
   - **Type de panne** : Écran / Tactile
   - **Appareil** : iPhone 13 Pro Max
   - **Description** : Écran cassé suite à une chute
   - **IMEI/SN** : (si déblocage iCloud)

4. **Diagnostic & Travaux**
   - Décrivez le problème détecté
   - Ajoutez les pièces depuis votre inventaire

5. **Tarification**
   - **Prix client** : 15 000 DA
   - **Coût pièces** : 8 000 DA (calculé auto si pièces ajoutées)

6. **Paiement**
   - ⏳ Non payé
   - 💰 Partiel (saisissez le montant)
   - ✅ Payé

7. **Assignation**
   - Choisissez le technicien responsable
   - Définissez le statut initial (Nouveau / Diagnostic)

8. **Validez** → Le ticket s'affiche automatiquement !

### 🎫 Impression du ticket

Le ticket contient :
- QR Code de suivi
- Informations client
- Détails de l'appareil
- Prix et statut de paiement
- Code de suivi unique

**Astuce** : Imprimez 2 exemplaires (1 pour le client, 1 pour vous)

---

## 📦 Gérer votre stock {#gérer-stock}

### Ajouter des articles

1. **Menu "Stock"** → **"Ajouter un article"**

2. **Choisissez le type** :
   - 🔧 **Pièce de réparation** : Écrans, batteries, connecteurs...
   - 🛍️ **Article de vente** : Coques, chargeurs, écouteurs...

3. **Remplissez les détails** :
   ```
   Nom : Écran iPhone 13 Pro Max OLED
   SKU : IP13PM-SCREEN-001
   Prix d'achat : 8 000 DA
   Prix de vente : 15 000 DA
   Stock initial : 5
   Stock minimum : 2
   Icône : Smartphone
   ```

4. **Validez** → L'article est disponible !

### Utilisation automatique

- ✅ Le stock se décrémente automatiquement lors d'une vente
- ✅ Lors d'une réparation, ajoutez les pièces utilisées
- ⚠️ Recevez des alertes quand le stock est bas

---

## 🛒 Effectuer une vente {#effectuer-vente}

### Point de vente (POS)

1. **Menu "Ventes"** → Onglet **"Caisse"**

2. **Ajoutez des articles au panier**
   - Cliquez sur les articles à vendre
   - Ajustez les quantités avec +/-

3. **Configurez la TVA** (optionnel)
   - Saisissez le taux (ex: 19%)
   - Le montant se calcule automatiquement

4. **Finalisez la vente**
   - Cliquez sur **"Payer"**
   - Renseignez :
     - Nom du client (optionnel)
     - Téléphone
     - Mode de paiement (Espèces / Carte)

5. **Validez** → Le ticket de vente s'affiche !

### Historique des ventes

- Consultez toutes vos ventes dans l'onglet **"Historique"**
- Filtrez par date, client, montant
- Exportez pour votre comptabilité

---

## 📊 Consulter vos statistiques {#statistiques}

### Tableau de bord

Votre tableau de bord affiche en temps réel :

#### 📈 Indicateurs clés
- **Prises en charge** : Réparations du jour
- **Prêtes à récupérer** : Appareils terminés
- **Chiffre d'affaires** : 
  - Aujourd'hui
  - Ce mois
  - Période personnalisée

#### 📋 Activité récente
- 8 dernières réparations
- Statuts en temps réel
- Accès rapide aux dossiers

### Rapports avancés

1. **Menu "Factures"** pour :
   - Rapports financiers détaillés
   - Export Excel/PDF
   - Analyse par période

2. **Calendrier** pour :
   - Vue planning des réparations
   - Rendez-vous clients
   - Charge de travail

---

## 🎯 Conseils pour bien démarrer

### ✅ Checklist du premier jour

- [ ] Configurer les informations de l'établissement
- [ ] Uploader votre logo
- [ ] Ajouter au moins 1 membre de l'équipe
- [ ] Créer 5-10 articles de stock courants
- [ ] Importer vos clients existants
- [ ] Créer votre première réparation test
- [ ] Imprimer un ticket test
- [ ] Explorer le tableau de bord

### 💡 Astuces de pro

1. **Codes de suivi** : Partagez le lien de suivi aux clients par WhatsApp
2. **Pièces détachées** : Ajoutez toutes vos pièces courantes dès le début
3. **Assignation** : Assignez chaque réparation pour un meilleur suivi
4. **Statuts** : Mettez à jour les statuts régulièrement
5. **Paiements** : Enregistrez les paiements partiels pour éviter les oublis

---

## 🆘 Besoin d'aide ?

### Support

- 📧 **Email** : support@fixwave.space
-  **WhatsApp** : +213 540 031 126
- 📚 **Base de connaissances** : [docs.fixwave.space](https://docs.fixwave.space)

### Ressources

- 🎥 **Tutoriels vidéo** : [youtube.com/fixwave](https://youtube.com/fixwave)
- ❓ **FAQ** : Réponses aux questions fréquentes
- 🎓 **Webinaires** : Sessions de formation gratuites

---

## 🚀 Prêt à démarrer !

Vous avez maintenant toutes les clés pour utiliser Fixwave efficacement. 

**Prochaines étapes** :
1. Explorez chaque module
2. Personnalisez selon vos besoins
3. Formez votre équipe
4. Profitez du gain de temps !

Bon courage et bienvenue dans la famille Fixwave ! 🎉

---

*Dernière mise à jour : Janvier 2026*
