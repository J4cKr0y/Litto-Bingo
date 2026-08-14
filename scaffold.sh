#!/bin/bash
FEATURE_NAME="litto-bingo"
BASE_DIR="src/features/$FEATURE_NAME"

echo "📁 Création de la structure pour la feature : $FEATURE_NAME..."
mkdir -p "$BASE_DIR/components"
mkdir -p "$BASE_DIR/styles"

touch "$BASE_DIR/index.ts"
touch "$BASE_DIR/$FEATURE_NAME.ts"
touch "$BASE_DIR/$FEATURE_NAME.test.ts"
touch "$BASE_DIR/README.md"

echo "✅ Structure TypeScript créée avec succès dans $BASE_DIR !"