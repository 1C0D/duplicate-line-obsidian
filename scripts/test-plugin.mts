import * as readline from 'readline';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { checkManifest, createPathandCopy, getEnv, isVaultPathInvalid, promptNewPath } from './test-plugin-utils.mjs';

// Load .env file
dotenv.config()

// Default target path
let vaultPath = getEnv("TARGET_PATH")
let targetPath = path.join(vaultPath, '.obsidian', 'plugins', '$ID');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (!checkManifest()) {
    console.error("No manifest in plugin directory.");
    process.exit(1);
}
if (await isVaultPathInvalid(vaultPath)) {
    // Prompt the user to enter a new target path
    createPathandCopy(rl,targetPath, vaultPath);
} else {
    const targetPath = path.join(vaultPath, '.obsidian', 'plugins', '$ID');
    promptNewPath(rl, vaultPath, targetPath);
}

