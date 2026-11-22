import { describe, it, expect } from 'vitest';
import type { PresentationBadge } from './litto-bingo-badges-presentation';
import { construireBadgesAffiches } from './litto-bingo-badges-affichage';
import type { BingoArchive } from './litto-bingo-archive';
import type { DefinitionBadge } from './litto-bingo-badges';

function pionnier(annee: number): DefinitionBadge {
  return {
    id: `pionnier-${annee}`,
    type: 'quantitatif',
    champ: 'bingosCompletes',
    seuil: 1,
    fenetre: { type: 'anneeCivile', annee },
  };
}

function creerArchive(surcharges: Partial<BingoArchive> = {}): BingoArchive {
  return {
    id: crypto.randomUUID(),
    statut: 'complete',
    taille: 5,
    genres: ['roman'],
    casesCompletees: 25,
    livresLus: ['Livre A'],
    pagesTotales: 300,
    dureeMs: 3 * 24 * 60 * 60 * 1000,
    casesRenouveleesUtilisees: 0,
    dateArchivage: '2027-02-01T00:00:00.000Z',
    ...surcharges,
  };
}

function presentationDe(id: string): PresentationBadge {
  return {
    nom: `Nom de ${id}`,
    description: `Condition de ${id}`,
    pictogramme: 'etoile',
    teinte: 'ambre',
  };
}

function construire(surcharges: Partial<Parameters<typeof construireBadgesAffiches>[0]> = {}) {
  return construireBadgesAffiches({
    catalogue: [],
    progression: { badgesDebloques: [] },
    archives: [],
    dateActivationBadges: new Date('2026-01-01T00:00:00Z'),
    maintenant: new Date('2027-05-15T12:00:00Z'),
    obtenirPresentation: presentationDe,
    ...surcharges,
  });
}

describe('construireBadgesAffiches', () => {
  it('retourne une liste vide quand le catalogue est vide', () => {
    expect(construire()).toEqual([]);
  });
  it('affiche un badge permanent verrouillé avec ses textes, sa famille et son avancement', () => {
    const resultat = construire({
      catalogue: [{ id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 10 }],
      archives: [creerArchive(), creerArchive()],
    });

    expect(resultat).toEqual([
      {
        id: 'bibliophile',
        famille: 'permanent',
        nom: 'Nom de bibliophile',
        description: 'Condition de bibliophile',
        teinte: 'ambre',
        pictogramme: 'etoile',
        etat: 'verrouille',
        progression: { valeur: 2, seuil: 10 },
      },
    ]);
  });
  it("affiche comme débloqué, sans avancement, un badge présent dans la progression", () => {
    const resultat = construire({
      catalogue: [{ id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 10 }],
      progression: { badgesDebloques: [{ id: 'bibliophile', notifie: true }] },
      archives: [creerArchive()],
    });

    expect(resultat).toHaveLength(1);
    expect(resultat[0].etat).toBe('debloque');
    expect(resultat[0]).not.toHaveProperty('progression');
  });
  it("affiche un exploit verrouillé sans avancement", () => {
    const resultat = construire({
      catalogue: [{ id: 'eclair', type: 'exploit', critere: 'dureeMaxMs', seuil: 604800000 }],
      archives: [creerArchive()],
    });

    expect(resultat).toHaveLength(1);
    expect(resultat[0].etat).toBe('verrouille');
    expect(resultat[0]).not.toHaveProperty('progression');
  });

  it("conserve l'ordre du catalogue", () => {
    const resultat = construire({
      catalogue: [
        { id: 'troisieme', type: 'quantitatif', champ: 'bingosCompletes', seuil: 3 },
        { id: 'premier', type: 'quantitatif', champ: 'bingosCompletes', seuil: 1 },
        { id: 'deuxieme', type: 'quantitatif', champ: 'bingosCompletes', seuil: 2 },
      ],
    });

    expect(resultat.map((badge) => badge.id)).toEqual(['troisieme', 'premier', 'deuxieme']);
  });

  it("ignore un badge de la progression qui n'existe plus dans le catalogue", () => {
    const resultat = construire({
      catalogue: [{ id: 'bibliophile', type: 'quantitatif', champ: 'bingosCompletes', seuil: 10 }],
      progression: { badgesDebloques: [{ id: 'badge-retire', notifie: true }] },
    });

    expect(resultat.map((badge) => badge.id)).toEqual(['bibliophile']);
  });

  it("affiche 0 sur le seuil pour un badge de saison quand la saison n'est pas en cours", () => {
    const resultat = construire({
      catalogue: [
        {
          id: 'marathon-estival',
          type: 'quantitatif',
          champ: 'bingosCompletes',
          seuil: 2,
          fenetre: { type: 'saison', debut: { mois: 6, jour: 21 }, fin: { mois: 9, jour: 22 } },
        },
      ],
      archives: [
        creerArchive({ dateArchivage: '2026-07-10T12:00:00.000Z' }),
        creerArchive({ dateArchivage: '2026-08-20T12:00:00.000Z' }),
      ],
      maintenant: new Date('2026-12-25T12:00:00Z'),
    });

    expect(resultat[0].famille).toBe('saisonnier');
    expect(resultat[0].progression).toEqual({ valeur: 0, seuil: 2 });
  });

  it("affiche toujours le Pionnier d'une année passée quand il a été obtenu", () => {
    const resultat = construire({
      catalogue: [pionnier(2027), pionnier(2028)],
      progression: { badgesDebloques: [{ id: 'pionnier-2027', notifie: true }] },
      maintenant: new Date('2028-05-15T12:00:00Z'),
    });

    expect(resultat.map((badge) => [badge.id, badge.etat])).toEqual([
      ['pionnier-2027', 'debloque'],
      ['pionnier-2028', 'verrouille'],
    ]);
  });

  it("masque le Pionnier d'une année passée qui n'a pas été obtenu", () => {
    const resultat = construire({
      catalogue: [pionnier(2027), pionnier(2028)],
      maintenant: new Date('2028-05-15T12:00:00Z'),
    });

    expect(resultat.map((badge) => badge.id)).toEqual(['pionnier-2028']);
  });
  it("affiche encore, verrouillé, le Pionnier de l'année en cours le dernier jour de l'année", () => {
    const resultat = construire({
      catalogue: [pionnier(2027)],
      maintenant: new Date('2027-12-31T23:59:59Z'),
    });

    expect(resultat.map((badge) => [badge.id, badge.etat])).toEqual([['pionnier-2027', 'verrouille']]);
  });
});