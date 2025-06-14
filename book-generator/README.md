# 📖 Générateur de Livre Digital Interactif

Ce générateur permet de créer facilement des livres digitaux interactifs avec effet flip-book à partir de fichiers de configuration simples.

## 🚀 Installation

```bash
cd book-generator
npm install
```

## 📁 Structure du projet

```
book-generator/
├── config/
│   ├── book-config.json        # Configuration du livre
│   └── content/
│       ├── pages.md            # Contenu des pages en Markdown
│       └── media/              # Images et vidéos
├── gabarit/
│   ├── index.html              # Gabarit HTML de référence
│   ├── 01.jpg                  # Image de couverture par défaut
│   └── FilmInstitutionnel.mp4  # Vidéo institutionnelle
├── generator.js               # Script principal
├── backup-manager.js          # Gestion des sauvegardes
├── editor-server.js           # Serveur de l'éditeur web
├── editor.html                # Interface de l'éditeur
├── output/                    # Dossier généré après build (non versionné)
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

## 🛠 Scripts

- **generator.js** – construit le livre. Il gère les sauvegardes automatiques et peut fonctionner en mode surveillance avec `npm run dev`.
- **editor-server.js** – lance l'éditeur web accessible sur `http://localhost:3000/editor`.
- **backup-manager.js** – outil de création, de liste et de restauration de sauvegardes.

Le générateur extrait les styles et scripts du fichier `gabarit/index.html` situé dans le dossier `book-generator`. S'il est absent, un modèle interne minimal sera employé.

## 🎯 Usage rapide

### 1. Configurer le livre
Éditez `config/book-config.json` :

```json
{
  "book": {
    "title": "MON LIVRE DIGITAL",
    "subtitle": "Sous-titre du livre",
    "cover_image": "media/couverture.jpg",
    "years": "2020 - 2024",
    "institution": "Mon Organisation"
  },
  "theme": {
    "primary_color": "#323e48",
    "secondary_color": "#638c1c"
  }
}
```

### 2. Ajouter le contenu
Éditez `config/content/pages.md` :

```markdown
# Page: cover
type: cover
title: {{book.title}}
subtitle: {{book.subtitle}}

---

# Page: introduction
type: content
title: Introduction

Votre contenu en **Markdown** ici...

[IMAGE: mon-image.jpg | Description de l'image]
[VIDEO: ma-video.mp4 | Description de la vidéo]

---
```

### 3. Ajouter les médias
Placez vos images et vidéos dans `config/content/media/`.
Lors de la génération, tout le dossier est copié automatiquement dans `output/media/`.

### 4. Générer le livre
```bash
npm run build       # sauvegarde automatique puis génération
npm run build-safe  # génération sans créer de sauvegarde
```

Le livre sera généré dans `output/livre.html`.

### 5. Ouvrir l'éditeur (optionnel)
```bash
npm run editor      # accessible sur http://localhost:3000/editor
```

Enregistrer via l'éditeur met à jour `config/content/pages.md` et copie les médias dans `config/content/media/`. Après vos modifications, relancez `npm run build` pour mettre à jour `output/livre.html`.

### 6. Gérer les sauvegardes
```bash
npm run backup "Avant modifications"  # créer une sauvegarde
npm run backup-list                   # lister les sauvegardes
npm run backup-restore <nom>          # restaurer une sauvegarde
```

## 📝 Syntaxe Markdown étendue

### Images
```markdown
[IMAGE: nom-fichier.jpg | Description optionnelle]
```

### Vidéos
```markdown
[VIDEO: nom-fichier.mp4 | Description optionnelle]
```

### Timeline
```markdown
[TIMELINE]
2020 | Premier événement important
2021 | Deuxième étape majeure
2022 | Développement continu
[/TIMELINE]
```

### Citations
```markdown
[QUOTE: "Votre citation ici" - Auteur]
```

### Placeholders d'images
```markdown
[IMAGE: Description du contenu visuel attendu]
```

## 🎨 Types de pages

### Page de couverture
```markdown
# Page: cover
type: cover
title: {{book.title}}
subtitle: {{book.subtitle}}
image: {{book.cover_image}}
```

### Page de contenu
```markdown
# Page: ma-page
type: content
title: Titre de la page

Contenu en Markdown...
```

### Page de fin
```markdown
# Page: end
type: end
title: FIN
subtitle: Merci de votre lecture
```

### Sommaire automatique
```markdown
# Page: sommaire
type: sommaire
title: SOMMAIRE
```
Si `auto_generate_sommaire` est activé dans `config/book-config.json`, les liens
du sommaire sont créés automatiquement d'après les pages de type `content`.

## 🛠 Commandes disponibles

### Génération
```bash
npm run build          # Générer le livre (avec sauvegarde automatique)
npm run build-safe     # Générer le livre (sans sauvegarde automatique)
npm run dev            # Lancer en mode watch
npm run clean          # Nettoyer le dossier output
npm run help           # Aide
```
Si `pack_output` vaut `true` dans la configuration, un fichier `output/livre.tar.gz`
sera également créé après la génération.

Le mode `dev` surveille `config/` et `config/content/` et régénère
automatiquement le livre à chaque modification.

### 💾 Système de sauvegarde
```bash
npm run backup                    # Créer une sauvegarde manuelle
npm run backup "Mon message"      # Sauvegarde avec message personnalisé
npm run backup-list               # Lister toutes les sauvegardes
npm run backup-restore <nom>      # Restaurer une sauvegarde spécifique
npm run backup-git                # Sauvegarde via Git (optionnel)
```

### 🔄 Fonctionnement des sauvegardes

**Sauvegarde automatique :**
- Créée automatiquement avant chaque génération
- Stocke une copie complète de la configuration et du contenu
- Garde les 10 dernières sauvegardes (nettoyage automatique)

**Sauvegarde manuelle :**
```bash
# Avant une modification importante
npm run backup "Avant refonte design"

# Lister les sauvegardes
npm run backup-list

# Restaurer si nécessaire
npm run backup-restore backup-2024-01-15T10-30-00-000Z
```

**Sécurité :**
- Sauvegarde automatique avant chaque restauration
- Rollback automatique en cas d'erreur de restauration
- Métadonnées complètes (date, message, liste des fichiers)

## 🎨 Personnalisation

### Couleurs et thème
Modifiez les couleurs dans `config/book-config.json` :

```json
{
  "theme": {
    "primary_color": "#323e48",      # Couleur principale
    "secondary_color": "#638c1c",    # Couleur d'accent
    "tertiary_color": "#d8e0e5",     # Couleur de fond
    "font_primary": "Poppins"        # Police principale
  }
}
```

### Configuration avancée
```json
{
  "features": {
    "video_support": true,           # Support vidéo
    "mobile_portrait_default": true, # Mode portrait par défaut sur mobile
    "zoom_controls": true,           # Contrôles de zoom
    "progress_indicator": true       # Indicateur de progression
  },
  "layout": {
    "page_width": 550,              # Largeur des pages
    "page_height": 733,             # Hauteur des pages
    "flip_duration": 1000           # Durée de l'animation
  }
}
```

## 📖 Variables disponibles

Dans vos contenus Markdown, vous pouvez utiliser :

- `{{book.title}}` - Titre du livre
- `{{book.subtitle}}` - Sous-titre
- `{{book.institution}}` - Nom de l'institution
- `{{book.years}}` - Années
- `{{book.author}}` - Auteur
- `{{book.anniversary}}` - Anniversaire

## 🔧 Fonctionnalités du livre généré

- ✅ Effet flip-book réaliste
- ✅ Mode portrait pour mobile
- ✅ Contrôles de zoom
- ✅ Indicateur de progression draggable
- ✅ Support vidéo HTML5
- ✅ Navigation clavier
- ✅ Responsive design
- ✅ Accessibilité (ARIA)

## 📱 Optimisations mobiles

- Détection automatique des appareils mobiles
- Basculement automatique en mode portrait
- Masquage du sélecteur de mode sur mobile
- Interface tactile optimisée

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez que tous les fichiers de configuration sont présents
2. Vérifiez la syntaxe JSON et Markdown
3. Consultez les logs d'erreur lors de la génération

## 📋 Checklist pour un nouveau livre

- [ ] **Sauvegarder l'état actuel** : `npm run backup "Avant nouveau livre"`
- [ ] Modifier `config/book-config.json`
- [ ] Créer le contenu dans `config/content/pages.md`
- [ ] Ajouter les médias dans `config/content/media/`
- [ ] Lancer `npm run build` (sauvegarde automatique incluse)
- [ ] Tester le livre généré dans `output/livre.html`
- [ ] Si problème : `npm run backup-list` puis `npm run backup-restore <nom>`
- [ ] Déployer le fichier HTML final
- [ ] **Sauvegarde finale** : `npm run backup "Version finale déployée"`

## 🆘 En cas de problème

### Restauration rapide
```bash
# Lister les sauvegardes disponibles
npm run backup-list

# Restaurer la dernière version stable
npm run backup-restore backup-YYYY-MM-DDTHH-MM-SS-sssZ

# Vérifier que tout fonctionne
npm run build-safe
```

### Diagnostic
```bash
# Vérifier les fichiers de configuration
ls -la config/
ls -la config/content/

# Tester la génération sans sauvegarde
npm run build-safe

# Voir les logs détaillés
npm run help
```
## ✏️ Interface d'édition rapide

```bash
npm install        # first time
npm run editor     # open http://localhost:3000/editor
```

Les modifications sauvegardées via l'interface mettent à jour `config/content/pages.md` et les fichiers du dossier `config/content/media/`. Pensez ensuite à relancer `npm run build` pour regénérer le livre.

## 🧪 Tests

Pour l'instant, aucun test automatisé n'est implémenté. La commande suivante affiche simplement un message :

```bash
npm test
```

Cela retournera :

```bash
No tests yet
```

