# 🔓 Fonction Déblocage - RepairTrack DZ

## ✨ Nouvelle Fonctionnalité

### Déblocage de Téléphones
Vous pouvez maintenant gérer les déblocages de téléphones avec enregistrement de l'IMEI/SN !

## 🎯 Fonctionnalités

### 1. 📝 **Formulaire de Réparation**

#### Checkbox Déblocage
- **Emplacement** : Après le champ "Prix"
- **Design** : Fond bleu clair avec icône 🔓
- **Label** : "Déblocage (IMEI/SN requis)"

#### Champ IMEI/SN
- **Apparition** : Automatique quand "Déblocage" est coché
- **Animation** : Slide-in depuis le haut
- **Format** : Police monospace pour meilleure lisibilité
- **Validation** : Requis si déblocage coché
- **Aide** : "Tapez *#06# sur le téléphone pour obtenir l'IMEI"

### 2. 📊 **Affichage dans le Tableau**

#### Colonne Appareil
- **Badge** : "🔓 Déblocage" en bleu si c'est un déblocage
- **IMEI/SN** : Affiché en dessous en police monospace
- **Format** : `IMEI: 123456789012345`

### 3. 🎫 **Ticket Imprimable**

#### Section Appareil
- **Badge** : "🔓 Déblocage" à côté du nom de l'appareil
- **IMEI/SN** : Ligne supplémentaire en police monospace
- **Visibilité** : Imprimé sur le ticket physique

## 🗄️ Base de Données

### Migration SQL
Fichier : `supabase/migrations/20240109000000_add_unlock_feature.sql`

```sql
-- Colonnes ajoutées
alter table public.repairs add column if not exists is_unlock boolean default false;
alter table public.repairs add column if not exists imei_sn text;

-- Index pour recherche
create index if not exists idx_repairs_imei_sn on public.repairs(imei_sn);
```

### Exécution
1. Ouvrez **Supabase → SQL Editor**
2. Copiez et exécutez le SQL ci-dessus
3. Les colonnes sont ajoutées à la table `repairs`

## 💡 Utilisation

### Créer un Déblocage

1. **Dashboard → Nouvelle Réparation**
2. Remplissez les informations client et appareil
3. **Cochez "Déblocage"**
4. Le champ IMEI/SN apparaît
5. **Tapez *#06#** sur le téléphone du client
6. **Copiez l'IMEI** affiché (15 chiffres)
7. **Collez** dans le champ
8. Ajoutez le prix et créez

### Exemple
```
Client : Mohamed Benzema
Téléphone : +213 550123456
Appareil : iPhone 12 Pro
☑️ Déblocage
IMEI/SN : 123456789012345
Prix : 2000 DA
```

## 🔍 Recherche par IMEI

### Utilisation Future
L'index sur `imei_sn` permet de :
- Rechercher rapidement un déblocage par IMEI
- Vérifier si un appareil a déjà été débloqué
- Éviter les doublons

### Exemple de Requête
```sql
SELECT * FROM repairs 
WHERE imei_sn = '123456789012345';
```

## 📱 Obtenir l'IMEI

### Méthode 1 : Code USSD
1. Ouvrez le **clavier téléphonique**
2. Tapez **\*#06#**
3. L'IMEI s'affiche automatiquement
4. Notez les **15 chiffres**

### Méthode 2 : Paramètres

#### iPhone
1. Réglages → Général → Informations
2. Cherchez "IMEI"

#### Android
1. Paramètres → À propos du téléphone
2. Cherchez "IMEI"

### Méthode 3 : Carte SIM
- Retirez le tiroir SIM
- L'IMEI est parfois imprimé dessus

## 🎨 Interface

### Design
- **Checkbox** : Fond bleu clair, bordure bleue
- **Badge** : Bleu avec icône 🔓
- **IMEI** : Police monospace pour lisibilité
- **Animation** : Smooth slide-in

### Responsive
- ✅ Desktop : Affichage complet
- ✅ Mobile : Badge adapté
- ✅ Impression : IMEI visible

## 📊 Statistiques

### Possibilités Futures
- Nombre de déblocages par mois
- Revenus des déblocages
- Appareils les plus débloqués
- Temps moyen de déblocage

## 🔒 Sécurité

### Protection des Données
- **IMEI** : Donnée sensible, protégée par RLS
- **Accès** : Uniquement l'établissement propriétaire
- **Index** : Permet recherche rapide mais sécurisée

### Bonnes Pratiques
- ✅ Vérifiez toujours l'IMEI avec *#06#
- ✅ Notez l'IMEI avant de commencer
- ✅ Gardez une trace papier si nécessaire
- ❌ Ne partagez jamais l'IMEI publiquement

## 💰 Tarification

### Prix Suggérés (Algérie)
- **Déblocage simple** : 1 000 - 2 000 DA
- **Déblocage + réparation** : Prix réparation + 1 000 DA
- **Déblocage urgent** : 2 500 - 3 000 DA

### Facteurs de Prix
- Marque du téléphone
- Modèle
- Opérateur
- Urgence
- Complexité

## 🚀 Prochaines Améliorations

### Fonctionnalités Futures
1. **Statut de déblocage**
   - En attente
   - En cours
   - Débloqué
   - Échec

2. **Historique IMEI**
   - Voir tous les déblocages d'un IMEI
   - Détecter les doublons
   - Alertes

3. **Intégration API**
   - Vérification IMEI automatique
   - Statut blacklist
   - Opérateur d'origine

4. **Rapports**
   - Statistiques de déblocage
   - Revenus par type
   - Taux de réussite

## 📝 Notes Importantes

### IMEI vs Numéro de Série
- **IMEI** : 15 chiffres, pour téléphones GSM
- **SN** : Format variable, pour autres appareils
- Le champ accepte les deux formats

### Validation
- Pas de validation stricte du format
- Permet flexibilité pour différents appareils
- Vérifiez manuellement la validité

### Légalité
- Le déblocage est légal en Algérie
- Assurez-vous que le téléphone appartient au client
- Gardez une trace de la demande

---

**Astuce** : Utilisez *#06# pour obtenir l'IMEI rapidement et éviter les erreurs de saisie !
