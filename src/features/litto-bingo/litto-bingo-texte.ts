export function decouperEnLignes(texte: string, largeurMax: number): string[] {
  const mots = texte.match(/\S+/g) ?? [];
  const lignes: string[] = [];
  let ligneCourante = '';

  for (const mot of mots) {
    if (ligneCourante === '') {
      ligneCourante = mot;
    } else if (ligneCourante.length + 1 + mot.length <= largeurMax) {
      ligneCourante += ` ${mot}`;
    } else {
      lignes.push(ligneCourante);
      ligneCourante = mot;
    }
  }

  if (ligneCourante !== '') lignes.push(ligneCourante);
  return lignes;
}

export function echapperXml(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}