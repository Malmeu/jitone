# 🎨 Personnalisation des Tickets - RepairTrack DZ

## ✨ Nouvelles Fonctionnalités Implémentées

### 1. 🖼️ Logo Personnalisé
- **Emplacement** : Paramètres → Personnalisation des tickets
- **Fonctionnalité** : Ajoutez l'URL de votre logo
- **Affichage** : Le logo apparaît en haut de chaque ticket
- **Format recommandé** : 200x200px, PNG/JPG
- **Aperçu en temps réel** dans les paramètres

### 2. 🎨 Couleur Personnalisée
- **Emplacement** : Paramètres → Personnalisation des tickets
- **Fonctionnalité** : Choisissez la couleur du code de suivi
- **Sélecteur de couleur** intégré
- **Aperçu en temps réel** : Voir le rendu avant de sauvegarder
- **Par défaut** : Bleu Apple (#007AFF)

### 3. 💬 Message Personnalisé
- **Emplacement** : Paramètres → Personnalisation des tickets
- **Fonctionnalité** : Ajoutez un message personnalisé sur vos tickets
- **Limite** : 200 caractères
- **Exemple** : "Merci de votre confiance ! Nous prenons soin de votre appareil."
- **Affichage** : Encadré vert en bas du ticket

### 4. 🖨️ Réimpression de Tickets
- **Emplacement** : Dashboard → Réparations
- **Fonctionnalité** : Bouton d'impression à côté de chaque réparation
- **Icône** : 🖨️ (imprimante)
- **Action** : Ouvre le ticket en modal pour impression

### 5. 📱 Partage WhatsApp
- **Emplacement** : Modal du ticket
- **Fonctionnalité** : Envoyer le ticket directement via WhatsApp
- **Conditions** : Nécessite le numéro de téléphone du client
- **Message automatique** :
  ```
  🔧 *Nom de l'établissement*
  
  Bonjour [Client],
  
  Votre [Appareil] a bien été déposé pour réparation.
  
  📋 *Code de suivi:* REPAR-XXXXXX
  📱 *Suivez votre réparation:*
  https://votre-site.com/track/REPAR-XXXXXX
  
  Merci de votre confiance ! 😊
  ```

## 🗄️ Modifications de la Base de Données

### Migration SQL à appliquer :
```sql
-- Fichier: supabase/migrations/20240105000000_add_ticket_customization.sql

alter table public.establishments add column if not exists logo_url text;
alter table public.establishments add column if not exists ticket_color text default '#007AFF';
alter table public.establishments add column if not exists ticket_message text;
```

**⚠️ Important** : Exécutez cette migration dans Supabase → SQL Editor

## 📋 Guide d'Utilisation

### Pour personnaliser vos tickets :

1. **Allez dans** Dashboard → Paramètres
2. **Scrollez** jusqu'à "Personnalisation des tickets"
3. **Ajoutez** :
   - L'URL de votre logo
   - Votre couleur préférée
   - Un message personnalisé
4. **Cliquez** sur "Enregistrer les modifications"
5. **Testez** en créant une nouvelle réparation

### Pour réimprimer un ticket :

1. **Allez dans** Dashboard → Réparations
2. **Trouvez** la réparation concernée
3. **Cliquez** sur l'icône 🖨️ dans la colonne Actions
4. **Le ticket s'ouvre** → Cliquez sur "Imprimer"

### Pour envoyer par WhatsApp :

1. **Ouvrez** un ticket (création ou réimpression)
2. **Vérifiez** que le client a un numéro de téléphone
3. **Cliquez** sur le bouton "WhatsApp"
4. **WhatsApp Web/App** s'ouvre avec le message pré-rempli
5. **Envoyez** le message au client

## 🎨 Exemples de Personnalisation

### Style Professionnel
- **Logo** : Logo de votre entreprise
- **Couleur** : Noir (#000000) ou bleu foncé (#1E3A8A)
- **Message** : "Votre satisfaction est notre priorité"

### Style Moderne
- **Logo** : Logo minimaliste
- **Couleur** : Violet (#8B5CF6) ou rose (#EC4899)
- **Message** : "Réparation rapide et garantie ✨"

### Style Traditionnel
- **Logo** : Logo classique
- **Couleur** : Vert (#10B981) ou orange (#F59E0B)
- **Message** : "Depuis 20 ans à votre service"

## 🚀 Avantages

✅ **Image de marque** : Tickets personnalisés à votre image  
✅ **Communication** : Envoi instantané par WhatsApp  
✅ **Flexibilité** : Réimpression à tout moment  
✅ **Professionnalisme** : Design soigné et moderne  
✅ **Gain de temps** : Message automatique pré-rempli  

## 📱 Compatibilité

- ✅ Impression : Format A5, tous navigateurs
- ✅ WhatsApp : Web et application mobile
- ✅ Logo : PNG, JPG, SVG
- ✅ Couleurs : Tous les codes hexadécimaux

---

**Astuce** : Utilisez un service comme [Imgur](https://imgur.com) ou [Cloudinary](https://cloudinary.com) pour héberger votre logo gratuitement !
