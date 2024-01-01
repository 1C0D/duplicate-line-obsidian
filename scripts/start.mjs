import { execSync } from 'child_process';

execSync("start /B code .", { stdio: "ignore", shell: true });
execSync('git fetch'); // avoid an error on pull
execSync('git pull')
execSync('npm install', { stdio: 'inherit' });
execSync('npm run dev', { stdio: 'inherit' });