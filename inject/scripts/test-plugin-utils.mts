import * as fs from 'fs/promises';
import * as fsExtra from 'fs-extra'
import * as readline from 'readline';
import * as path from 'path';
import { exec } from 'child_process'

export function createPathandCopy(rl: readline.Interface, targetPath: string, vaultPath: string) {
    rl.question(`No valid Vault path in environment variable: ${`'${vaultPath}'` ?? 'undefined'}. Please enter a vault path (.../my-vault): `, async (newPath) => {
        if (await isVault(newPath)) {
            // no \ or \\ no last \
            let formattedPath = newPath.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/$/, '');
            
            await updateTargetPathInEnv(formattedPath);
            targetPath = formattedPath

            await copyFilesToTargetPath(targetPath);
            console.log('Copy successful!');
            rl.close();
        } else {
            console.log('The specified path is not a valid vault path. Please try again.');
            rl.close();
        }
    });
}

// Update the target path in the .env file
export async function updateTargetPathInEnv(newPath: string) {
    await fs.writeFile('.env', `TARGET_PATH=${newPath}`);
}

export function getEnv(name: string) {
    let val = process.env[name];
    return val ?? "";
}

async function isVault(_path: string) {
    const obsidianDir = path.join(_path, '.obsidian');
    if (!await isValidPath(obsidianDir)) return false;
    const pluginsDir = path.join(obsidianDir, 'plugins');
    await fsExtra.ensureDir(pluginsDir);
    return true;
}

export async function isVaultPathInvalid(vaultPath: string) {
    return !vaultPath || !(await isValidPath(vaultPath)) || !(await isVault(vaultPath));
}

async function isValidPath(path: string) {
    try {
        await fs.access(path);
        return true;
    } catch (error) {
        return false;
    }
}

export async function checkManifest(){
    const cwd = process.cwd();
    const manifest = path.join(cwd, 'manifest.json')
    return isValidPath(manifest)
}

// Copy the main.js and manifest.json files to the target path
async function copyFilesToTargetPath(targetPath: string) {
    const cwd = process.cwd();
    const idMatch = (await fs.readFile(path.join(cwd, 'manifest.json'), 'utf8')).match(/"id":\s*"(.*?)"/);
    const id = idMatch ? idMatch[1] : '';

    const targetDir = path.join(targetPath.replace('$ID', id));

    if (!await isValidPath(targetDir)) {
        await fs.mkdir(targetDir, { recursive: true });
    } else {
        const filesToRemove = ['main.js', 'manifest.json', 'styles.css'];

        for (const file of filesToRemove) {
            const filePath = path.join(targetDir, file);
            if (await isValidPath(filePath)) {
                await fs.rm(filePath, { recursive: true, force: true });
            }
        }
    }

    const mainJSPath = path.join(cwd, 'main.js');

    if (await isValidPath(mainJSPath)) {
        await fs.copyFile(mainJSPath, path.join(targetDir, 'main.js'));
    } else {
        try {
            console.log("main.js is absent.generating main.js in src folder...");
            await generateMainJS();
            await fs.copyFile(path.join(cwd, 'main.js'), path.join(targetDir, 'main.js'));
            console.log("main.js generated");
        } catch (error) {
            console.error('Error trying to generate main.js:', error);
            console.error('Exiting...');
            process.exit(1);
        }
    }

    async function generateMainJS() {
        return new Promise<void>((resolve, reject) => {
            exec('npm run build', (error, stdout, stderr) => {
                if (error) {
                    console.error('Error trying to generate main.js:', error);
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }

    await fs.copyFile(path.join(cwd, 'manifest.json'), path.join(targetDir, 'manifest.json'));

    const stylesPath = path.join(cwd, 'styles.css');
    if (await isValidPath(stylesPath)) {
        await fs.copyFile(stylesPath, path.join(targetDir, 'styles.css'));
    }
}

export function promptNewPath(rl: readline.Interface, vaultPath: string, targetPath: string) {
    rl.question(`Current vault path: ${vaultPath}\nDo you want to enter a different vault path? (Yes/No): `, async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            rl.pause();
            const secondPrompt = () => {
                rl.question('Please enter the new vault path: ', async (newPath) => {
                    if (await isVault(newPath)) {
                        // no \ or \\ no last \
                        let formattedPath = newPath.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/$/, '');
                        const parts = formattedPath.split('/');
                        formattedPath = path.join(formattedPath, '.obsidian', 'plugins', '$ID')
                        await updateTargetPathInEnv(formattedPath);
                        targetPath = formattedPath;
                        await copyFilesToTargetPath(targetPath);
                        console.log('Copy successful!');
                        rl.close();
                    } else {
                        console.log('The specified path is not a valid vault path. Please try again.');
                        secondPrompt(); // Call secondPrompt recursively
                    }
                })
            }
            secondPrompt();
        } else {
            await copyFilesToTargetPath(targetPath);
            console.log('Copy successful!');
            rl.close();
        }
    });
}
