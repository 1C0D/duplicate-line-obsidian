import fs from 'fs-extra';
import path from 'path';
import stringify from 'json-stringify-pretty-compact';

// Chemin vers le dossier courant et vers le dossier parent (root)
const currentDir = process.cwd();
const rootDir = path.resolve(currentDir, '../');

// Fonction pour copier le dossier 'scripts' vers le dossier root
function copyFolderToRoot(folderName) {
    const sourceDir = path.join(currentDir, folderName);
    const sourceExists = fs.existsSync(sourceDir);

    if (sourceExists) {
        const destinationDir = path.join(rootDir, folderName);
        const destinationExists = fs.existsSync(destinationDir);

        if (destinationExists) {
            fs.removeSync(destinationDir);
        }

        fs.copySync(sourceDir, destinationDir, { overwrite: true });
        console.log(`Le dossier "${folderName}" a été copié avec succès vers le dossier root.`);
    } else {
        console.log(`Le dossier "${folderName}" n'existe pas dans le dossier courant.`);
    }
}

function copyScriptsToRoot() {
    copyFolderToRoot('scripts');
    copyFolderToRoot('.github');
}

// Fonction pour mettre à jour ou créer 'scripts' dans package.json
function updatePackageJsonScripts() {
    const packageJsonPath = path.join(rootDir, 'package.json');

    const scriptsToAdd = {
        dev: 'node esbuild.config.mjs',
        build: 'tsc -noEmit -skipLibCheck && node esbuild.config.mjs production',
        start: 'tsx scripts/start.mjs',
        version: 'tsx scripts/update-version.mts',
        acp: 'tsx scripts/acp.mts',
        bacp: "tsx scripts/acp.mts -b", 
        release: "tsx scripts/release.mts",
        test: 'tsx scripts/test-plugin.mts',
    };

    let packageJson = {};
    if (fs.existsSync(packageJsonPath)) {
        try {
            const fileContent = fs.readFileSync(packageJsonPath, 'utf-8');
            packageJson = JSON.parse(fileContent);
        } catch (error) {
            console.error('Erreur de lecture du fichier package.json :', error);
            process.exit(1);
        }
    }

    packageJson.scripts = { ...packageJson.scripts, ...scriptsToAdd };

    try {
        fs.writeFileSync(packageJsonPath, stringify(packageJson, { maxLength: 60 }));
        console.log('Scripts ajoutés/mis à jour dans package.json avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'écriture dans le fichier package.json :', error);
    }
}

// Appeler les fonctions pour exécuter les actions
copyScriptsToRoot();
updatePackageJsonScripts();
