@echo off
SET FEATURE_NAME=litto-bingo
SET BASE_DIR=src\features\%FEATURE_NAME%

echo 📁 Création de la structure pour la feature : %FEATURE_NAME%...
if not exist "%BASE_DIR%\components" mkdir "%BASE_DIR%\components"
if not exist "%BASE_DIR%\styles" mkdir "%BASE_DIR%\styles"

type nul > "%BASE_DIR%\index.ts"
type nul > "%BASE_DIR%\%FEATURE_NAME%.ts"
type nul > "%BASE_DIR%\%FEATURE_NAME%.test.ts"
type nul > "%BASE_DIR%\README.md"

echo ✅ Structure TypeScript créée avec succès dans %BASE_DIR% !