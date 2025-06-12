# 📖 GUIDE COMPLET - Mise à jour du Livre Digital

> **Guide pratique pour le chargé de communication**  
> Comment modifier le contenu, les images et la configuration du livre digital en toute sécurité

---

## 🎯 **Vue d'ensemble**

Ce guide vous explique **étape par étape** comment mettre à jour le contenu de votre livre digital. Vous pourrez :
- ✅ Modifier les textes et le contenu
- ✅ Changer les images et vidéos
- ✅ Personnaliser les couleurs et le design
- ✅ Sauvegarder votre travail automatiquement
- ✅ Revenir en arrière en cas de problème

**⏱️ Temps estimé :** 15-30 minutes pour une mise à jour complète

---

## 🚀 **ÉTAPE 1 : Préparation et sécurité**

### 1.1 Vérification de l'installation

Ouvrez votre **terminal/invite de commandes** et allez dans le dossier du générateur :

```bash
cd book-generator
```

Vérifiez que tout est installé :
```bash
npm --version
```
> Si vous voyez un numéro de version, c'est bon. Sinon, installez Node.js d'abord.

### 1.2 Sauvegarde de sécurité

**⚠️ IMPORTANT :** Toujours sauvegarder avant de commencer !

```bash
npm run backup "Avant modification - [VOTRE DESCRIPTION]"
```

**Exemple :**
```bash
npm run backup "Avant mise à jour contenu janvier 2024"
```

Vous verrez :
```
💾 Création de la sauvegarde...
✅ Sauvegarde créée: backup-2024-01-15T10-30-00-000Z
```

---

## 📝 **ÉTAPE 2 : Modification du contenu**

### 2.1 Ouvrir le fichier de contenu

Le contenu se trouve dans :
```
📁 config/content/pages.md
```

Ouvrez ce fichier avec **n'importe quel éditeur de texte** :
- Windows : Bloc-notes, Notepad++, Visual Studio Code
- Mac : TextEdit, Visual Studio Code
- En ligne : GitHub, GitLab

### 2.2 Structure complète du fichier pages.md

Le fichier `pages.md` est organisé en **pages séparées par des séparateurs** `---`. Chaque page suit une structure précise :

#### **Structure d'une page :**
```markdown
# Page: nom-unique-de-la-page
type: content
title: Titre affiché dans le livre

Contenu de la page en Markdown...

---
```

#### **Types de pages disponibles :**

**Page de couverture :**
```markdown
# Page: cover
type: cover
title: {{book.title}}
subtitle: {{book.subtitle}}
image: {{book.cover_image}}
years: {{book.years}}
anniversary: {{book.anniversary}}
```

**Table des matières :**
```markdown
# Page: sommaire
type: sommaire
title: SOMMAIRE
```

**Page de contenu standard :**
```markdown
# Page: mon-chapitre
type: content
title: Mon Chapitre

Contenu de votre chapitre...
```

**Page de fin :**
```markdown
# Page: end
type: end
title: FIN
subtitle: {{book.anniversary}} au service de la solidarité nationale
years: {{book.years}}
institution: {{book.institution}}
author: {{book.author}}
```

### 2.3 Éléments de contenu disponibles

#### **Texte formaté :**
```markdown
Votre texte en français. Vous pouvez utiliser **gras** et *italique*.

## Sous-titre de niveau 2
### Sous-titre de niveau 3

**Paragraphe en gras important**

- Liste à puces
- Deuxième élément  
- Troisième élément

1. Liste numérotée
2. Deuxième point
3. Troisième point
```

#### **Images :**
```markdown
[IMAGE: nom-image.jpg | Description complète de l'image]
```
**Important :** Le fichier image doit être dans `config/content/media/`

#### **Vidéos :**
```markdown
[VIDEO: nom-video.mp4 | Description de la vidéo]
```
**Important :** Le fichier vidéo doit être dans `config/content/media/`

#### **Timeline (chronologie) :**
```markdown
[TIMELINE]
1959 | Création de l'institution
1977 | Premier développement majeur
1988 | Lancement nouveau service
2024 | Vision d'avenir
[/TIMELINE]
```

#### **Citations :**
```markdown
[QUOTE: "Votre citation importante ici" - Nom de l'auteur]
```

#### **Placeholder vidéo (pour vidéos non disponibles) :**
```markdown
[VIDEO-PLACEHOLDER: nom-video.mp4 | Description de la vidéo qui sera ajoutée]
```

### 2.4 Comment ajouter une nouvelle page

Pour ajouter une page, ajoutez ce bloc **avant le dernier séparateur** `---` :

```markdown
---

# Page: ma-nouvelle-page
type: content
title: Titre de ma nouvelle page

## Introduction

Contenu de votre nouvelle page...

[IMAGE: nouvelle-image.jpg | Description de votre image]

## Développement

Suite du contenu...

[TIMELINE]
2023 | Premier événement
2024 | Événement récent
[/TIMELINE]

---
```

### 2.5 Exemples concrets de modifications

#### **Modifier une page existante :**

**Avant :**
```markdown
# Page: introduction
type: content
title: Introduction

## Contexte historique

Au lendemain de l'indépendance...
```

**Après :**
```markdown
# Page: introduction
type: content
title: Notre Histoire                    ← TITRE MODIFIÉ

## Contexte historique et évolution       ← SOUS-TITRE MODIFIÉ

Au lendemain de l'indépendance, notre organisation...  ← TEXTE MODIFIÉ

[IMAGE: nouvelle-photo-equipe.jpg | Notre équipe actuelle]  ← IMAGE AJOUTÉE
```

#### **Ajouter du contenu riche :**
```markdown
## Nos réalisations

Nous sommes fiers de présenter nos accomplissements :

- **Innovation technologique** : Développement de plateformes digitales
- **Impact social** : Plus de 500 000 bénéficiaires
- **Excellence opérationnelle** : Certification ISO 9001

[IMAGE: resultats-2024.jpg | Infographie de nos résultats 2024]

## Timeline des succès

[TIMELINE]
2020 | Lancement transformation digitale
2021 | Première certification qualité
2022 | Extension services mobiles
2023 | Innovation award
2024 | Plan stratégique 2030
[/TIMELINE]

[QUOTE: "L'innovation au service de l'excellence" - Direction Générale]
```

#### **Intégrer des variables dynamiques :**

Les variables entre `{{}}` sont automatiquement remplacées par les valeurs du fichier `book-config.json` :

```markdown
# Page: conclusion
type: content
title: {{book.anniversary}} d'Excellence    ← Utilise la variable anniversary

Depuis {{book.years}}, {{book.institution}} continue...  ← Utilise les variables years et institution
```

### 2.6 Ordre des pages dans le livre

L'ordre des pages dans le livre final correspond à l'ordre dans le fichier `pages.md`. Pour réorganiser :

1. **Coupez** le bloc de la page à déplacer (de `# Page:` à `---`)
2. **Collez** au nouvel emplacement souhaité
3. **Vérifiez** que tous les séparateurs `---` sont en place

### 2.7 Bonnes pratiques

#### **Nommage des pages :**
- ✅ `introduction`, `chapitre-1`, `conclusion`
- ❌ `page 1`, `Chapitre_Spécial`, `ma page !`

#### **Titres des pages :**
- ✅ Courts et descriptifs
- ✅ Cohérents avec le style du livre
- ❌ Trop longs ou complexes

#### **Contenu :**
- ✅ Utilisez les sous-titres `##` et `###` pour structurer
- ✅ Alternez texte, images et éléments visuels
- ✅ Gardez un style cohérent dans tout le livre

---

## 🎨 **ÉTAPE 3 : Personnalisation visuelle**

### 3.1 Modifier les informations générales

Ouvrez le fichier :
```
📁 config/book-config.json
```

### 3.2 Changer les textes principaux

```json
{
  "book": {
    "title": "VOTRE NOUVEAU TITRE",
    "subtitle": "Votre nouveau sous-titre",
    "institution": "Votre Organisation",
    "years": "2020 - 2024",
    "anniversary": "X ans d'excellence"
  }
}
```

### 3.3 Personnaliser les couleurs

```json
{
  "theme": {
    "primary_color": "#323e48",      ← Couleur principale
    "secondary_color": "#638c1c",    ← Couleur d'accent  
    "tertiary_color": "#d8e0e5"      ← Couleur de fond
  }
}
```

**💡 Astuce :** Utilisez un sélecteur de couleurs en ligne pour trouver les codes couleur.

---

## 🖼️ **ÉTAPE 4 : Gestion des médias**

### 4.1 Ajouter de nouvelles images

1. **Copiez vos images** dans le dossier :
   ```
   📁 config/content/media/
   ```

2. **Formats supportés :** JPG, PNG, GIF
3. **Taille recommandée :** Maximum 2MB par image
4. **Nommage :** Utilisez des noms simples sans espaces
   - ✅ `nouvelle-image.jpg`
   - ❌ `Nouvelle Image (2024).jpg`

### 4.2 Ajouter des vidéos

1. **Copiez vos vidéos** dans le même dossier :
   ```
   📁 config/content/media/
   ```

2. **Format recommandé :** MP4
3. **Taille :** Maximum 50MB
4. **Qualité :** 720p recommandé pour le web

### 4.3 Utiliser les médias dans le contenu

Dans votre fichier `pages.md` :
```markdown
[IMAGE: votre-nouvelle-image.jpg | Description de votre image]

[VIDEO: votre-nouvelle-video.mp4 | Description de votre vidéo]
```

---

## ⚙️ **ÉTAPE 5 : Génération du livre**

### 5.1 Génération standard (avec sauvegarde automatique)

```bash
npm run build
```

Vous verrez :
```
🚀 Génération du livre digital...
🔄 Sauvegarde automatique avant génération...
💾 Création de la sauvegarde...
✅ Sauvegarde créée: backup-2024-01-15T11-45-00-000Z
✓ Configuration chargée
✓ Contenu chargé
✓ Copié: image1.jpg
✓ Copié: video1.mp4
✅ Livre généré avec succès!
📁 Fichier de sortie: output/livre.html
```

### 5.2 Vérification du résultat

Votre livre est maintenant dans :
```
📁 output/livre.html
```

**Ouvrez ce fichier dans votre navigateur** pour voir le résultat.

---

## 🔍 **ÉTAPE 6 : Vérification et tests**

### 6.1 Checklist de vérification

- [ ] **Textes corrects** : Pas de fautes de frappe
- [ ] **Images affichées** : Toutes les images se chargent
- [ ] **Vidéos fonctionnelles** : Les vidéos se lisent
- [ ] **Navigation fluide** : Le flip-book fonctionne
- [ ] **Mode mobile** : Test sur smartphone/tablette
- [ ] **Couleurs cohérentes** : Le design correspond à vos attentes

### 6.2 Test sur différents appareils

1. **Desktop** : Ouvrez dans Chrome, Firefox, Edge
2. **Mobile** : Vérifiez le mode portrait automatique
3. **Tablette** : Testez les deux modes de lecture

---

## 🆘 **ÉTAPE 7 : En cas de problème**

### 7.1 Voir les sauvegardes disponibles

```bash
npm run backup-list
```

Résultat :
```
📋 Sauvegardes disponibles:

🆕 backup-2024-01-15T11-45-00-000Z
   📅 15/01/2024 12:45:00
   💬 Avant génération du livre
   📄 4 fichiers

🆕 backup-2024-01-15T10-30-00-000Z  
   📅 15/01/2024 11:30:00
   💬 Avant modification - janvier 2024
   📄 4 fichiers
```

### 7.2 Restaurer une sauvegarde

```bash
npm run backup-restore backup-2024-01-15T10-30-00-000Z
```

Le système :
1. ✅ Crée une sauvegarde de l'état actuel  
2. ✅ Restaure l'ancienne version
3. ✅ Confirme la restauration

### 7.3 Problèmes courants et solutions

#### **Erreur : "fichier non trouvé"**
```
❌ Problème : Image ou vidéo non trouvée
✅ Solution : Vérifiez le nom du fichier dans media/
```

#### **Erreur de syntaxe JSON**
```
❌ Problème : Erreur dans book-config.json
✅ Solution : Vérifiez les guillemets et virgules
```

#### **Page vide ou contenu manquant**
```
❌ Problème : Erreur dans pages.md
✅ Solution : Vérifiez la structure avec --- entre les pages
```

---

## 🔄 **WORKFLOW COMPLET TYPE**

Voici un exemple de workflow complet pour une mise à jour :

### **Scénario :** Mise à jour trimestrielle

```bash
# 1. Sauvegarde de sécurité
npm run backup "Avant mise à jour Q1 2024"

# 2. Modifications (avec votre éditeur de texte)
# - Ouvrir config/book-config.json
# - Changer les dates : "2024 - Q1"
# - Ouvrir config/content/pages.md  
# - Ajouter nouvelle section "Résultats Q1"
# - Copier nouvelle-image-q1.jpg dans media/

# 3. Génération
npm run build

# 4. Test du résultat
# - Ouvrir output/livre.html dans le navigateur
# - Vérifier sur mobile

# 5. En cas de problème
npm run backup-list
npm run backup-restore [nom-sauvegarde-précédente]

# 6. Sauvegarde finale
npm run backup "Version finale Q1 2024 - prête pour diffusion"
```

---

## 📋 **CHECKLIST FINALE**

Avant de publier votre livre :

### **Contenu**
- [ ] Tous les textes sont à jour
- [ ] Les dates sont correctes  
- [ ] Les informations de contact sont valides
- [ ] La grammaire et l'orthographe sont vérifiées

### **Médias**
- [ ] Toutes les images s'affichent correctement
- [ ] Les vidéos se lisent sans erreur
- [ ] Les descriptions des médias sont pertinentes
- [ ] Les fichiers ne sont pas trop volumineux

### **Technique**
- [ ] Le livre se génère sans erreur
- [ ] La navigation fonctionne (flip-book)
- [ ] Le mode mobile est opérationnel
- [ ] Les couleurs correspondent à la charte graphique

### **Sécurité**  
- [ ] Une sauvegarde finale est créée
- [ ] Les fichiers sources sont préservés
- [ ] L'historique des modifications est documenté

---

## 🎓 **CONSEILS PRATIQUES**

### **Pour débuter :**
1. **Commencez petit** : Modifiez une seule page d'abord
2. **Testez souvent** : Générez après chaque modification importante
3. **Sauvegardez régulièrement** : Une sauvegarde par jour de travail

### **Pour l'efficacité :**
1. **Préparez vos médias** : Redimensionnez et optimisez avant d'importer
2. **Utilisez des noms cohérents** : `page-1-image-1.jpg`, `page-1-image-2.jpg`
3. **Documentez vos modifications** : Messages de sauvegarde descriptifs

### **Pour éviter les erreurs :**
1. **Respectez la syntaxe** : Copiez-collez les exemples
2. **Vérifiez les chemins** : Les noms de fichiers doivent correspondre exactement
3. **Testez sur plusieurs navigateurs** : Chrome, Firefox, Safari

---

## 📞 **SUPPORT**

### **En cas de blocage :**

1. **Vérifiez les logs** : Les messages d'erreur indiquent souvent le problème
2. **Consultez les exemples** : Référez-vous aux pages existantes qui fonctionnent
3. **Restaurez une sauvegarde** : En cas de doute, revenez à une version stable

### **Ressources utiles :**
- **Syntaxe Markdown** : https://www.markdownguide.org/basic-syntax/
- **Codes couleurs** : https://htmlcolorcodes.com/fr/
- **Optimisation d'images** : https://tinypng.com/

---

## ✅ **FÉLICITATIONS !**

Vous savez maintenant comment :
- ✅ Modifier le contenu en toute sécurité
- ✅ Personnaliser l'apparence du livre
- ✅ Gérer les médias (images et vidéos)
- ✅ Générer et tester le résultat final
- ✅ Sauvegarder et restaurer en cas de problème

**Votre livre digital est maintenant entre vos mains !** 🚀

---

*Guide créé avec ❤️ pour faciliter la gestion de contenu digital*