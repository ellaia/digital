#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

class BackupManager {
    constructor() {
        this.projectRoot = __dirname;
        this.backupDir = path.join(this.projectRoot, '.backups');
        this.configDir = path.join(this.projectRoot, 'config');
        this.maxBackups = 10; // Garder les 10 dernières sauvegardes
    }

    async createBackup(message = '') {
        try {
            await fs.ensureDir(this.backupDir);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup-${timestamp}`;
            const backupPath = path.join(this.backupDir, backupName);
            
            console.log(chalk.blue('💾 Création de la sauvegarde...'));
            
            // Créer le dossier de sauvegarde
            await fs.ensureDir(backupPath);
            
            // Sauvegarder la configuration et le contenu
            await fs.copy(this.configDir, path.join(backupPath, 'config'));
            
            // Créer un fichier de métadonnées
            const metadata = {
                timestamp: new Date().toISOString(),
                message: message || 'Sauvegarde automatique',
                version: this.getProjectVersion(),
                files: await this.getFileList(this.configDir)
            };
            
            await fs.writeJSON(path.join(backupPath, 'metadata.json'), metadata, { spaces: 2 });
            
            console.log(chalk.green(`✅ Sauvegarde créée: ${backupName}`));
            console.log(chalk.gray(`📁 Emplacement: ${backupPath}`));
            
            // Nettoyer les anciennes sauvegardes
            await this.cleanOldBackups();
            
            return backupName;
            
        } catch (error) {
            console.error(chalk.red('❌ Erreur lors de la sauvegarde:'), error.message);
            throw error;
        }
    }

    async listBackups() {
        try {
            await fs.ensureDir(this.backupDir);
            const backups = await fs.readdir(this.backupDir);
            const backupList = [];
            
            for (const backup of backups.filter(b => b.startsWith('backup-'))) {
                const metadataPath = path.join(this.backupDir, backup, 'metadata.json');
                if (await fs.pathExists(metadataPath)) {
                    const metadata = await fs.readJSON(metadataPath);
                    backupList.push({
                        name: backup,
                        ...metadata
                    });
                }
            }
            
            // Trier par date (plus récent en premier)
            backupList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return backupList;
            
        } catch (error) {
            console.error(chalk.red('❌ Erreur lors du listage:'), error.message);
            return [];
        }
    }

    async displayBackups() {
        const backups = await this.listBackups();
        
        if (backups.length === 0) {
            console.log(chalk.yellow('📭 Aucune sauvegarde trouvée'));
            return;
        }
        
        console.log(chalk.blue('\n📋 Sauvegardes disponibles:\n'));
        
        backups.forEach((backup, index) => {
            const date = new Date(backup.timestamp).toLocaleString('fr-FR');
            const isRecent = index < 3 ? chalk.green('🆕') : '';
            
            console.log(`${isRecent} ${chalk.cyan(backup.name)}`);
            console.log(`   📅 ${date}`);
            console.log(`   💬 ${backup.message}`);
            console.log(`   📄 ${backup.files.length} fichiers\n`);
        });
    }

    async restoreBackup(backupName) {
        try {
            const backupPath = path.join(this.backupDir, backupName);
            
            if (!await fs.pathExists(backupPath)) {
                throw new Error(`Sauvegarde '${backupName}' introuvable`);
            }
            
            console.log(chalk.blue(`🔄 Restauration de la sauvegarde: ${backupName}`));
            
            // Créer une sauvegarde de l'état actuel avant restauration
            await this.createBackup(`Avant restauration de ${backupName}`);
            
            // Vérifier que la sauvegarde a les fichiers nécessaires
            const configBackupPath = path.join(backupPath, 'config');
            if (!await fs.pathExists(configBackupPath)) {
                throw new Error('Sauvegarde corrompue: dossier config manquant');
            }
            
            // Sauvegarder temporairement la config actuelle
            const tempBackup = path.join(this.backupDir, '.temp-current');
            await fs.remove(tempBackup);
            await fs.copy(this.configDir, tempBackup);
            
            try {
                // Restaurer la configuration
                await fs.remove(this.configDir);
                await fs.copy(configBackupPath, this.configDir);
                
                console.log(chalk.green('✅ Sauvegarde restaurée avec succès!'));
                
                // Afficher les informations de la restauration
                const metadataPath = path.join(backupPath, 'metadata.json');
                if (await fs.pathExists(metadataPath)) {
                    const metadata = await fs.readJSON(metadataPath);
                    console.log(chalk.cyan(`📅 Date de la sauvegarde: ${new Date(metadata.timestamp).toLocaleString('fr-FR')}`));
                    console.log(chalk.cyan(`💬 Message: ${metadata.message}`));
                }
                
                // Nettoyer la sauvegarde temporaire
                await fs.remove(tempBackup);
                
            } catch (restoreError) {
                // En cas d'erreur, restaurer depuis la sauvegarde temporaire
                console.log(chalk.yellow('⚠️  Erreur lors de la restauration, rollback...'));
                await fs.remove(this.configDir);
                await fs.copy(tempBackup, this.configDir);
                await fs.remove(tempBackup);
                throw restoreError;
            }
            
        } catch (error) {
            console.error(chalk.red('❌ Erreur lors de la restauration:'), error.message);
            throw error;
        }
    }

    async createGitBackup() {
        try {
            // Vérifier si git est disponible
            const gitDir = path.join(this.projectRoot, '.git');
            
            if (!await fs.pathExists(gitDir)) {
                console.log(chalk.blue('🔧 Initialisation du dépôt Git...'));
                execSync('git init', { cwd: this.projectRoot, stdio: 'pipe' });
                
                // Créer un .gitignore
                const gitignorePath = path.join(this.projectRoot, '.gitignore');
                const gitignoreContent = `# Générateur de livre
node_modules/
output/
.backups/
*.log
.DS_Store
Thumbs.db
`;
                await fs.writeFile(gitignorePath, gitignoreContent);
            }
            
            // Ajouter les fichiers
            execSync('git add config/ package.json generator.js README.md', { cwd: this.projectRoot, stdio: 'pipe' });
            
            // Commit avec horodatage
            const timestamp = new Date().toLocaleString('fr-FR');
            const message = `Sauvegarde automatique - ${timestamp}`;
            execSync(`git commit -m "${message}"`, { cwd: this.projectRoot, stdio: 'pipe' });
            
            console.log(chalk.green('✅ Sauvegarde Git créée'));
            
        } catch (error) {
            // Git backup est optionnel, ne pas faire échouer le processus
            console.log(chalk.yellow('⚠️  Sauvegarde Git non disponible (optionnel)'));
        }
    }

    async getFileList(dir) {
        const files = [];
        
        async function scanDir(currentDir, relativePath = '') {
            const items = await fs.readdir(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const relativeItemPath = path.join(relativePath, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    await scanDir(fullPath, relativeItemPath);
                } else {
                    files.push({
                        path: relativeItemPath,
                        size: stat.size,
                        modified: stat.mtime
                    });
                }
            }
        }
        
        await scanDir(dir);
        return files;
    }

    async cleanOldBackups() {
        try {
            const backups = await this.listBackups();
            
            if (backups.length > this.maxBackups) {
                const toDelete = backups.slice(this.maxBackups);
                
                for (const backup of toDelete) {
                    const backupPath = path.join(this.backupDir, backup.name);
                    await fs.remove(backupPath);
                    console.log(chalk.gray(`🗑️  Suppression de l'ancienne sauvegarde: ${backup.name}`));
                }
            }
            
        } catch (error) {
            console.log(chalk.yellow('⚠️  Erreur lors du nettoyage des sauvegardes'));
        }
    }

    getProjectVersion() {
        try {
            const packagePath = path.join(this.projectRoot, 'package.json');
            if (fs.pathExistsSync(packagePath)) {
                const pkg = fs.readJSONSync(packagePath);
                return pkg.version || '1.0.0';
            }
        } catch (error) {
            // Ignore
        }
        return '1.0.0';
    }

    async autoBackupBeforeGeneration() {
        console.log(chalk.blue('🔄 Sauvegarde automatique avant génération...'));
        return await this.createBackup('Avant génération du livre');
    }
}

// CLI Interface
if (require.main === module) {
    const backupManager = new BackupManager();
    const args = process.argv.slice(2);
    const command = args[0];
    
    async function runCommand() {
        try {
            switch (command) {
                case 'create':
                    const message = args[1] || 'Sauvegarde manuelle';
                    await backupManager.createBackup(message);
                    break;
                    
                case 'list':
                    await backupManager.displayBackups();
                    break;
                    
                case 'restore':
                    if (!args[1]) {
                        console.error(chalk.red('❌ Nom de sauvegarde requis'));
                        console.log(chalk.cyan('Usage: node backup-manager.js restore <nom-sauvegarde>'));
                        process.exit(1);
                    }
                    await backupManager.restoreBackup(args[1]);
                    break;
                    
                case 'git':
                    await backupManager.createGitBackup();
                    break;
                    
                default:
                    console.log(chalk.blue(`
📦 Gestionnaire de Sauvegarde

Usage:
  node backup-manager.js create [message]     Créer une sauvegarde
  node backup-manager.js list                 Lister les sauvegardes  
  node backup-manager.js restore <nom>        Restaurer une sauvegarde
  node backup-manager.js git                  Sauvegarde Git

Exemples:
  node backup-manager.js create "Avant modification majeure"
  node backup-manager.js restore backup-2024-01-15T10-30-00-000Z
                    `));
                    break;
            }
        } catch (error) {
            console.error(chalk.red('❌ Erreur:'), error.message);
            process.exit(1);
        }
    }
    
    runCommand();
}

module.exports = BackupManager;