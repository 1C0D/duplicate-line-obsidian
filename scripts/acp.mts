import { execSync } from 'child_process';
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (input) => {
            resolve(input.trim());
        });
    });
}

(async () => {
    try {
        execSync('npm run build');
        console.log('npm run build successful.');

        const input: string = await askQuestion('Enter commit message: ');
        rl.close();

        const cleanedInput = input.replace(/^['"`]|['"`]$/g, '');
        execSync('git add .');
        execSync(`git commit -am "${cleanedInput}"`);
        execSync('git push');
        console.log('Commit and push successful.');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
})();
