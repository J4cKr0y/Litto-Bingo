import { describe, it, expect } from 'vitest';
import { decouperEnLignes, echapperXml } from './litto-bingo-texte';

describe('decouperEnLignes', () => {
  it('retourne aucune ligne pour un texte vide', () => {
    expect(decouperEnLignes('', 20)).toEqual([]);
  });
  it('retourne une seule ligne pour un mot seul', () => {
    expect(decouperEnLignes('Bonjour', 20)).toEqual(['Bonjour']);
  });
    it('garde sur une seule ligne un texte qui tient dans la largeur', () => {
    expect(decouperEnLignes('Lis dix livres', 20)).toEqual(['Lis dix livres']);
  });
  it('passe à la ligne quand le mot suivant dépasse la largeur', () => {
    expect(decouperEnLignes('Complète un bingo', 12)).toEqual(['Complète un', 'bingo']);
  });
    it('répartit un texte long sur plusieurs lignes sans dépasser la largeur', () => {
    expect(decouperEnLignes('Lis dix livres différents cette année', 14)).toEqual([
      'Lis dix livres',
      'différents',
      'cette année',
    ]);
  });

  it('accepte une ligne dont la longueur est exactement la largeur maximale', () => {
    expect(decouperEnLignes('Lis dix livres', 14)).toEqual(['Lis dix livres']);
  });

  it("coupe une ligne qui dépasserait la largeur d'un seul caractère", () => {
    expect(decouperEnLignes('Lis dix livres', 13)).toEqual(['Lis dix', 'livres']);
  });

  it('laisse entier un mot plus long que la largeur, sans le couper', () => {
    expect(decouperEnLignes('Extraordinairement long', 5)).toEqual([
      'Extraordinairement',
      'long',
    ]);
  });

  it('ignore les espaces et retours à la ligne superflus', () => {
    expect(decouperEnLignes('  Lis   dix \n livres  ', 20)).toEqual(['Lis dix livres']);
  });

  it('retourne aucune ligne pour un texte composé uniquement d’espaces', () => {
    expect(decouperEnLignes('   ', 20)).toEqual([]);
  });
});

describe('echapperXml', () => {
  it('laisse inchangé un texte sans caractère spécial', () => {
    expect(echapperXml('Flocon d’or')).toEqual('Flocon d’or');
  });
    it("remplace l'esperluette par son entité XML", () => {
    expect(echapperXml('Lis & relis')).toEqual('Lis &amp; relis');
  });
    it.each([
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&apos;'],
  ])('remplace le caractère %s par son entité XML', (caractere, entite) => {
    expect(echapperXml(`a${caractere}b${caractere}c`)).toEqual(`a${entite}b${entite}c`);
  });

  it('remplace toutes les occurrences, pas seulement la première', () => {
    expect(echapperXml('a & b & c')).toEqual('a &amp; b &amp; c');
  });

  it("n'échappe pas deux fois un caractère déjà converti (l'esperluette est traitée en premier)", () => {
    expect(echapperXml('<b>')).toEqual('&lt;b&gt;');
  });
});