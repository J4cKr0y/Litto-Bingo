// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { composerSvgExport } from './litto-bingo-badges-export';

const SCEAU = '<svg viewBox="0 0 120 120"></svg>';

function composer(surcharges: Partial<Parameters<typeof composerSvgExport>[0]> = {}) {
  return composerSvgExport({
    sceauSvg: SCEAU,
    nom: 'Éclair',
    description: 'Complète un bingo en 7 jours maximum.',
    mention: 'Litto-Bingo',
    ...surcharges,
  });
}

function analyser(svg: string): Document {
  return new DOMParser().parseFromString(svg, 'image/svg+xml');
}

describe('composerSvgExport', () => {
  it('retourne un SVG racine de 1080 par 1080', () => {
    const svg = composer();

    expect(
      svg.startsWith(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">'
      )
    ).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  });
  it("dessine le fond aux couleurs de l'application sur toute l'image", () => {
    expect(composer()).toContain('<rect width="1080" height="1080" fill="#f7f5f0"/>');
  });
  it('dessine un cadre fin à angles arrondis, en retrait du bord', () => {
    expect(composer()).toContain(
      '<rect x="24" y="24" width="1032" height="1032" rx="32" fill="none" stroke="#d8d3c9" stroke-width="4"/>'
    );
  });
  it('place le sceau, dimensionné à 400 par 400, en haut au centre', () => {
    expect(composer()).toContain(
      '<svg x="340" y="100" width="400" height="400" viewBox="0 0 120 120">' +
        '<svg viewBox="0 0 120 120"></svg>' +
        '</svg>'
    );
  });
  it.each(['', 'pas du svg', '<div></div>'])(
    'refuse un sceau qui n’est pas du SVG (%j)',
    (sceauSvg) => {
      expect(() => composer({ sceauSvg })).toThrow('Le sceau fourni n’est pas un SVG valide.');
    }
  );
  it('écrit le nom du badge en 72 px, centré, sous le sceau', () => {
    expect(composer({ nom: 'Éclair' })).toMatch(
      /<text x="540" y="650"[^>]*font-size="72"[^>]*text-anchor="middle"[^>]*>Éclair<\/text>/
    );
  });
  it('échappe les caractères spéciaux du nom pour ne pas casser le SVG', () => {
    const svg = composer({ nom: 'Lis & <relis>' });

    expect(svg).toContain('>Lis &amp; &lt;relis&gt;</text>');
    expect(svg).not.toContain('Lis & <relis>');
  });
  it("répartit un nom long sur plusieurs lignes, avec 84 px d'interligne", () => {
    const svg = composer({ nom: 'Feuilles et chapitres' });

    expect(svg).toMatch(/<text x="540" y="650"[^>]*>Feuilles et<\/text>/);
    expect(svg).toMatch(/<text x="540" y="734"[^>]*>chapitres<\/text>/);
  });
  it("écrit la condition sous le nom, en 40 px, avec 52 px d'interligne", () => {
    const svg = composer({
      nom: 'Éclair',
      description: 'Complète un bingo en 7 jours maximum.',
    });

    expect(svg).toMatch(
      /<text x="540" y="730"[^>]*font-size="40"[^>]*>Complète un bingo en 7 jours<\/text>/
    );
    expect(svg).toMatch(/<text x="540" y="782"[^>]*font-size="40"[^>]*>maximum\.<\/text>/);
  });
    it('décale la condition vers le bas quand le nom occupe deux lignes', () => {
    const svg = composer({
      nom: 'Feuilles et chapitres',
      description: 'Complète un bingo en automne.',
    });

    expect(svg).toMatch(
      /<text x="540" y="814"[^>]*font-size="40"[^>]*>Complète un bingo en automne\.<\/text>/
    );
    expect(svg).not.toMatch(/<text x="540" y="730"/);
  });
    it('échappe les caractères spéciaux de la condition pour ne pas casser le SVG', () => {
    const svg = composer({ description: 'Lis & <relis>' });

    expect(svg).toContain('>Lis &amp; &lt;relis&gt;</text>');
    expect(svg).not.toContain('Lis & <relis>');
  });
    it("écrit la mention en bas de l'image, centrée, en italique", () => {
    expect(composer({ mention: 'Litto-Bingo' })).toMatch(
      /<text x="540" y="1010"[^>]*font-style="italic"[^>]*text-anchor="middle"[^>]*>Litto-Bingo<\/text>/
    );
  });
    it('échappe les caractères spéciaux de la mention pour ne pas casser le SVG', () => {
    const svg = composer({ mention: 'Litto & <Bingo>' });

    expect(svg).toContain('>Litto &amp; &lt;Bingo&gt;</text>');
    expect(svg).not.toContain('Litto & <Bingo>');
  });
      it('accepte un sceau entouré d’espaces et de retours à la ligne', () => {
    expect(() => composer({ sceauSvg: `\n  ${SCEAU}\n` })).not.toThrow();
  });

  it.each([
    'du texte <svg viewBox="0 0 120 120"></svg>',
    '<svg viewBox="0 0 120 120"></svg> et du texte',
  ])('refuse un sceau accompagné de texte parasite (%j)', (sceauSvg) => {
    expect(() => composer({ sceauSvg })).toThrow('Le sceau fourni n’est pas un SVG valide.');
  });

  it('produit un SVG bien formé dont le seul texte est celui du badge', () => {
    const doc = analyser(
      composer({
        nom: 'Feuilles et chapitres',
        description: 'Complète un bingo en 7 jours maximum.',
        mention: 'Litto-Bingo',
      })
    );

    expect(doc.querySelector('parsererror')).toBeNull();
    expect(doc.documentElement.textContent).toBe(
      'Feuilles etchapitresComplète un bingo en 7 joursmaximum.Litto-Bingo'
    );
  });

  it('écrit le nom en gras, mais ni la condition ni la mention', () => {
    const doc = analyser(composer({ nom: 'Éclair', description: 'Une condition.' }));
    const gras = Array.from(doc.querySelectorAll('text[font-weight="700"]')).map(
      (element) => element.textContent
    );

    expect(gras).toEqual(['Éclair']);
  });
});