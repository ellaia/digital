#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const marked = require('marked');
const Mustache = require('mustache');
const chalk = require('chalk');
const BackupManager = require('./backup-manager');

class BookGenerator {
    constructor() {
        this.configPath = path.join(__dirname, 'config', 'book-config.json');
        this.contentPath = path.join(__dirname, 'config', 'content', 'pages.md');
        this.templatePath = path.join(__dirname, 'templates', 'book-template.html');
        this.outputPath = path.join(__dirname, 'output');
        this.mediaPath = path.join(__dirname, 'config', 'content', 'media');
        this.backupManager = new BackupManager();
    }

    async loadConfig() {
        try {
            const config = await fs.readJSON(this.configPath);
            console.log(chalk.green('✓ Configuration chargée'));
            return config;
        } catch (error) {
            console.error(chalk.red('✗ Erreur lors du chargement de la configuration:'), error.message);
            throw error;
        }
    }

    async loadContent() {
        try {
            const content = await fs.readFile(this.contentPath, 'utf8');
            console.log(chalk.green('✓ Contenu chargé'));
            return this.parseMarkdownPages(content);
        } catch (error) {
            console.error(chalk.red('✗ Erreur lors du chargement du contenu:'), error.message);
            throw error;
        }
    }

    parseMarkdownPages(content) {
        const pages = [];
        const pageBlocks = content.split('---').filter(block => block.trim());

        pageBlocks.forEach(block => {
            const lines = block.trim().split('\n');
            const page = { metadata: {}, content: '' };
            
            let inMetadata = false;
            let contentLines = [];

            lines.forEach(line => {
                if (line.startsWith('# Page:')) {
                    page.metadata.id = line.replace('# Page:', '').trim();
                    inMetadata = true;
                } else if (line.startsWith('type:')) {
                    page.metadata.type = line.replace('type:', '').trim();
                } else if (line.startsWith('title:')) {
                    page.metadata.title = line.replace('title:', '').trim();
                } else if (line.startsWith('subtitle:')) {
                    page.metadata.subtitle = line.replace('subtitle:', '').trim();
                } else if (line.startsWith('image:')) {
                    page.metadata.image = line.replace('image:', '').trim();
                } else if (line.startsWith('years:')) {
                    page.metadata.years = line.replace('years:', '').trim();
                } else if (line.startsWith('anniversary:')) {
                    page.metadata.anniversary = line.replace('anniversary:', '').trim();
                } else if (line.startsWith('institution:')) {
                    page.metadata.institution = line.replace('institution:', '').trim();
                } else if (line.startsWith('author:')) {
                    page.metadata.author = line.replace('author:', '').trim();
                } else if (line.trim() === '' && inMetadata) {
                    inMetadata = false;
                } else if (!inMetadata) {
                    contentLines.push(line);
                }
            });

            page.content = contentLines.join('\n');
            pages.push(page);
        });

        return pages;
    }

    processSpecialMarkdown(content) {
        // Traitement des vidéos
        content = content.replace(/\[VIDEO: ([^|]+)(\|([^\]]+))?\]/g, (match, src, _, description) => {
            return `<div class="video-container">
                <video class="institutional-video" controls preload="metadata">
                    <source src="${src}" type="video/mp4">
                    <div class="video-fallback">
                        <p><strong>VIDÉO INSTITUTIONNELLE</strong></p>
                        <p>${description || 'Vidéo non disponible'}</p>
                    </div>
                </video>
            </div>`;
        });

        // Traitement des images
        content = content.replace(/\[IMAGE: ([^|]+)(\|([^\]]+))?\]/g, (match, src, _, description) => {
            return `<div class="media-placeholder">
                <img src="media/${src}" alt="${description || 'Image'}" style="max-width: 100%; height: auto; border-radius: 6px;">
                <p style="font-style: italic; margin-top: 0.5rem; font-size: 0.9rem;">${description || ''}</p>
            </div>`;
        });

        // Traitement des placeholders d'images
        content = content.replace(/\[IMAGE: ([^\]]+)\]/g, (match, description) => {
            return `<div class="media-placeholder">${description}</div>`;
        });

        // Traitement des placeholders vidéo
        content = content.replace(/\[VIDEO-PLACEHOLDER: ([^|]+)(\|([^\]]+))?\]/g, (match, src, _, description) => {
            return `<div class="video-placeholder"><strong>VIDÉO</strong><br>${description || src}</div>`;
        });

        // Traitement des timelines
        content = content.replace(/\[TIMELINE\]([\s\S]*?)\[\/TIMELINE\]/g, (match, timelineContent) => {
            const items = timelineContent.trim().split('\n').filter(line => line.trim());
            let timelineHtml = '<div class="timeline">';
            
            items.forEach(item => {
                const [year, description] = item.split(' | ');
                if (year && description) {
                    timelineHtml += `
                        <div class="timeline-item">
                            <div class="timeline-year">${year.trim()}</div>
                            <div class="timeline-content">${description.trim()}</div>
                        </div>`;
                }
            });
            
            timelineHtml += '</div>';
            return timelineHtml;
        });

        // Traitement des citations
        content = content.replace(/\[QUOTE: ([^\]]+)\]/g, (match, quote) => {
            const parts = quote.split(' - ');
            const text = parts[0];
            const author = parts[1] || '';
            return `<blockquote>${text}${author ? `<footer>- ${author}</footer>` : ''}</blockquote>`;
        });

        return content;
    }

    generatePage(page, config) {
        let htmlContent = '';
        
        // Traitement selon le type de page
        switch (page.metadata.type) {
            case 'cover':
                htmlContent = this.generateCoverPage(page, config);
                break;
            case 'sommaire':
                htmlContent = this.generateSommairePage(config);
                break;
            case 'end':
                htmlContent = this.generateEndPage(page, config);
                break;
            default:
                htmlContent = this.generateContentPage(page, config);
                break;
        }

        return htmlContent;
    }

    generateCoverPage(page, config) {
        const title = this.processTemplate(page.metadata.title || config.book.title, config);
        const subtitle = this.processTemplate(page.metadata.subtitle || config.book.subtitle, config);
        const years = this.processTemplate(page.metadata.years || config.book.years, config);
        const anniversary = this.processTemplate(page.metadata.anniversary || config.book.anniversary, config);
        const image = page.metadata.image || config.book.cover_image;

        return `
            <div class="page page-cover hard" data-density="hard" role="article" aria-label="Page de couverture">
                <div class="page-content">
                    <h1>${title}</h1>
                    <div style="text-align: center; margin: 1.5rem 0 2rem 0;">
                        <img src="${image}" alt="Logo officiel" style="max-width: 350px; width: 80%; height: auto; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.4); border: 2px solid rgba(255,255,255,0.3);">
                    </div>
                    <div class="subtitle">${subtitle}</div>
                    <div style="font-size: 1.5rem; margin-top: 2rem;">${anniversary}</div>
                    <div style="font-size: 1.2rem; margin-top: 1rem; color: var(--secondary-color);">${years}</div>
                </div>
            </div>`;
    }

    generateSommairePage(config) {
        // Ici, on pourrait auto-générer le sommaire basé sur les pages
        return `
            <div class="page" role="article" aria-label="Sommaire du livre">
                <div class="page-content">
                    <h2>SOMMAIRE</h2>
                    <nav role="navigation" aria-label="Navigation du sommaire">
                        <div style="cursor: pointer; padding: 0.4rem 0; transition: all 0.3s ease; font-size: 0.95rem;" onclick="goToPage(2)"><strong>PRÉFACE</strong></div>
                        <div style="cursor: pointer; padding: 0.4rem 0; transition: all 0.3s ease; font-size: 0.95rem;" onclick="goToPage(3)">1. <strong>INTRODUCTION</strong></div>
                        <div style="cursor: pointer; padding: 0.4rem 0; transition: all 0.3s ease; font-size: 0.95rem;" onclick="goToPage(4)">2. <strong>VISION ET MISSION</strong></div>
                        <!-- Auto-généré basé sur les pages -->
                    </nav>
                </div>
            </div>`;
    }

    generateEndPage(page, config) {
        const title = page.metadata.title || 'FIN';
        const subtitle = this.processTemplate(page.metadata.subtitle || '', config);
        const years = this.processTemplate(page.metadata.years || config.book.years, config);
        const institution = this.processTemplate(page.metadata.institution || config.book.institution, config);
        const author = this.processTemplate(page.metadata.author || config.book.author, config);

        return `
            <div class="page page-cover hard" data-density="hard">
                <div class="page-content">
                    <h1>${title}</h1>
                    <div class="subtitle">${subtitle}</div>
                    <div style="font-size: 1.2rem; margin-top: 2rem; color: var(--secondary-color);">${years}</div>
                    <div style="margin-top: 3rem; font-size: 1rem; color: white;">
                        ${institution}<br>
                        ${author}
                    </div>
                </div>
            </div>`;
    }

    generateContentPage(page, config) {
        let processedContent = this.processSpecialMarkdown(page.content);
        processedContent = this.processTemplate(processedContent, config);
        const htmlContent = marked.parse(processedContent);

        return `
            <div class="page">
                <div class="page-content">
                    ${htmlContent}
                </div>
            </div>`;
    }

    processTemplate(content, config) {
        return Mustache.render(content, config);
    }

    async loadTemplate() {
        try {
            const template = await fs.readFile(this.templatePath, 'utf8');
            console.log(chalk.green('✓ Template chargé'));
            return template;
        } catch (error) {
            console.error(chalk.red('✗ Template non trouvé, création d\'un template par défaut'));
            return this.createDefaultTemplate();
        }
    }

    createDefaultTemplate() {
        // Template basique qui sera créé si aucun template n'existe
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{book.title}}</title>
    <style>{{{styles}}}</style>
</head>
<body>
    {{{body}}}
    <script>{{{scripts}}}</script>
</body>
</html>`;
    }

    async generate(skipBackup = false) {
        try {
            console.log(chalk.blue('🚀 Génération du livre digital...'));
            
            // Sauvegarde automatique avant génération (sauf si désactivée)
            if (!skipBackup) {
                await this.backupManager.autoBackupBeforeGeneration();
            }
            
            // Chargement des données
            const config = await this.loadConfig();
            const pages = await this.loadContent();
            const template = await this.loadTemplate();

            // Génération des pages HTML
            const pagesHtml = pages.map(page => this.generatePage(page, config)).join('\n');

            // Chargement du CSS et JS du fichier original
            const originalHtml = await this.loadOriginalHtml();
            const styles = this.extractStyles(originalHtml);
            const scripts = this.extractScripts(originalHtml);

            // Assemblage final
            const finalHtml = Mustache.render(template, {
                ...config,
                styles: styles,
                scripts: scripts,
                body: this.wrapPagesInBookStructure(pagesHtml)
            });

            // Sauvegarde
            await fs.ensureDir(this.outputPath);
            const outputFile = path.join(this.outputPath, 'livre.html');
            await fs.writeFile(outputFile, finalHtml);

            // Copie des médias
            await this.copyMedia();

            console.log(chalk.green('✅ Livre généré avec succès!'));
            console.log(chalk.cyan(`📁 Fichier de sortie: ${outputFile}`));
            
        } catch (error) {
            console.error(chalk.red('❌ Erreur lors de la génération:'), error.message);
            throw error;
        }
    }

    async loadOriginalHtml() {
        const originalPath = path.join(__dirname, '..', 'livre_digital_cnra_stpageflip.html');
        return await fs.readFile(originalPath, 'utf8');
    }

    extractStyles(html) {
        const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        return styleMatch ? styleMatch[1] : '';
    }

    extractScripts(html) {
        const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
        if (!scriptMatches) return '';
        
        return scriptMatches
            .map(script => script.replace(/<script[^>]*>|<\/script>/g, ''))
            .join('\n\n');
    }

    wrapPagesInBookStructure(pagesHtml) {
        return `
            <!-- Chargement -->
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <div style="color: var(--primary-color); font-weight: 600;">Chargement du livre digital...</div>
            </div>

            <!-- Indicateur de progression -->
            <div class="progress-container" id="progressContainer" style="display: none;">
                <div class="progress-info">
                    <div class="progress-text" id="progressText">Page 1 / 17</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                </div>
                <div class="controls-section">
                    <button class="sommaire-button" onclick="goToHome()">Sommaire</button>
                    <div class="reading-mode">
                        <select class="mode-selector" id="readingMode" onchange="changeReadingMode()">
                            <option value="book">Livre</option>
                            <option value="portrait">Portrait</option>
                        </select>
                    </div>
                    <div class="zoom-controls">
                        <button class="zoom-button" onclick="zoomOut()">−</button>
                        <button class="zoom-button" onclick="zoomIn()">+</button>
                    </div>
                </div>
            </div>

            <!-- Conteneur principal -->
            <div class="book-container">
                <div class="flip-book" id="book">
                    ${pagesHtml}
                </div>
            </div>

            <!-- Conteneur mode portrait -->
            <div class="portrait-container" id="portraitContainer">
                <div id="portraitContent"></div>
                <div class="portrait-navigation">
                    <button class="portrait-nav-button" onclick="scrollToTop()">↑ Haut de page</button>
                    <button class="portrait-nav-button" onclick="scrollToBottom()">↓ Bas de page</button>
                </div>
            </div>

            <!-- StPageFlip CDN -->
            <script src="https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js"></script>`;
    }

    async copyMedia() {
        const outputMediaPath = path.join(this.outputPath, 'media');
        const originalMediaPath = path.join(__dirname, '..');
        
        await fs.ensureDir(outputMediaPath);
        
        // Copier les médias existants
        const mediaFiles = ['01.jpg', 'FilmInstitutionnel.mp4'];
        for (const file of mediaFiles) {
            const srcPath = path.join(originalMediaPath, file);
            const destPath = path.join(this.outputPath, file);
            
            if (await fs.pathExists(srcPath)) {
                await fs.copy(srcPath, destPath);
                console.log(chalk.green(`✓ Copié: ${file}`));
            }
        }
    }
}

// Execution
if (require.main === module) {
    const generator = new BookGenerator();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--help')) {
        console.log(chalk.blue(`
📖 Générateur de Livre Digital

Usage:
  npm run build              Générer le livre (avec sauvegarde auto)
  npm run build-safe         Générer le livre (sans sauvegarde auto)
  npm run dev               Mode développement avec watch
  npm run clean             Nettoyer le dossier output
  npm run help              Afficher cette aide

Sauvegardes:
  npm run backup            Créer une sauvegarde manuelle
  npm run backup-list       Lister les sauvegardes
  npm run backup-restore    Restaurer une sauvegarde
  npm run backup-git        Sauvegarde Git

Structure:
  config/book-config.json     Configuration générale
  config/content/pages.md     Contenu des pages
  config/content/media/       Images et vidéos
  output/                     Livre généré
  .backups/                   Sauvegardes automatiques

Exemples:
  npm run backup "Avant modification importante"
  npm run backup-restore backup-2024-01-15T10-30-00-000Z
        `));
        process.exit(0);
    }

    // Vérifier si on doit ignorer la sauvegarde
    const skipBackup = args.includes('--no-backup');

    generator.generate(skipBackup).catch(error => {
        console.error(chalk.red('Erreur fatale:'), error);
        process.exit(1);
    });
}

module.exports = BookGenerator;