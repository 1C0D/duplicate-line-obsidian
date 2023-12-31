@echo off
setlocal

REM Chemin vers le dossier root
set ROOT_DIR=%~dp0..

IF NOT EXIST %ROOT_DIR%\package.json (
    echo Le fichier package.json est introuvable dans le dossier root.
    exit /b
)

REM Installer les modules manquants
cd /d %ROOT_DIR%
npm i -D tsx dedent dotenv fs-extra semver

echo Installation des modules manquants terminée dans le dossier root.
pause