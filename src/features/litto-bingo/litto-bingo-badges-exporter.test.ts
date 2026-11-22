import { describe, it, expect, vi } from 'vitest';
import { exporterBadge, ExportBadgeEchoue, type DependancesExport } from './litto-bingo-badges-exporter';

const SCEAU = '<svg viewBox="0 0 120 120"></svg>';

const PARAMS = {
  nom: 'Éclair',
  description: 'Complète un bingo en 7 jours maximum.',
  mention: 'Litto-Bingo',
  nomFichier: 'litto-bingo-eclair.png',
};

function creerDependances(surcharges: Partial<DependancesExport> = {}): DependancesExport {
  return {
    rendreSceauSvg: vi.fn().mockResolvedValue(SCEAU),
    convertirSvgEnPng: vi.fn().mockResolvedValue(new Blob(['png'], { type: 'image/png' })),
    peutPartagerFichier: vi.fn().mockReturnValue(false),
    partager: vi.fn().mockResolvedValue(undefined),
    telecharger: vi.fn(),
    ...surcharges,
  };
}

describe('exporterBadge', () => {
  it("télécharge l'image quand le partage de fichier n'est pas disponible", async () => {
    const dependances = creerDependances();

    const resultat = await exporterBadge(PARAMS, dependances);

    expect(resultat).toBe('telecharge');
    expect(dependances.telecharger).toHaveBeenCalledTimes(1);
    const fichier = vi.mocked(dependances.telecharger).mock.calls[0][0];
    expect(fichier.name).toBe('litto-bingo-eclair.png');
    expect(fichier.type).toBe('image/png');
  });
    it("transmet à la conversion l'image composée, avec le sceau et les textes du badge", async () => {
    const dependances = creerDependances();

    await exporterBadge(PARAMS, dependances);

    expect(dependances.rendreSceauSvg).toHaveBeenCalledTimes(1);
    const svg = vi.mocked(dependances.convertirSvgEnPng).mock.calls[0][0];
    expect(svg).toContain(SCEAU);
    expect(svg).toContain('>Éclair</text>');
    expect(svg).toContain('>Complète un bingo en 7 jours</text>');
    expect(svg).toContain('>Litto-Bingo</text>');
  });
    it("partage l'image avec le nom du badge comme titre quand le partage de fichier est possible", async () => {
    const dependances = creerDependances({
      peutPartagerFichier: vi.fn().mockReturnValue(true),
    });

    const resultat = await exporterBadge(PARAMS, dependances);

    expect(resultat).toBe('partage');
    expect(dependances.partager).toHaveBeenCalledTimes(1);
    const [fichier, titre] = vi.mocked(dependances.partager).mock.calls[0];
    expect(fichier.name).toBe('litto-bingo-eclair.png');
    expect(fichier.type).toBe('image/png');
    expect(titre).toBe('Éclair');
    expect(dependances.telecharger).not.toHaveBeenCalled();
  });
    it("retourne « annule » sans télécharger quand l'utilisateur ferme le menu de partage", async () => {
    const dependances = creerDependances({
      peutPartagerFichier: vi.fn().mockReturnValue(true),
      partager: vi
        .fn()
        .mockRejectedValue(new DOMException('Partage annulé', 'AbortError')),
    });

    const resultat = await exporterBadge(PARAMS, dependances);

    expect(resultat).toBe('annule');
    expect(dependances.telecharger).not.toHaveBeenCalled();
  });
    it("télécharge l'image quand le partage échoue pour une autre raison qu'une annulation", async () => {
    const dependances = creerDependances({
      peutPartagerFichier: vi.fn().mockReturnValue(true),
      partager: vi
        .fn()
        .mockRejectedValue(new DOMException('Geste utilisateur manquant', 'NotAllowedError')),
    });

    const resultat = await exporterBadge(PARAMS, dependances);

    expect(resultat).toBe('telecharge');
    expect(dependances.telecharger).toHaveBeenCalledTimes(1);
    const fichier = vi.mocked(dependances.telecharger).mock.calls[0][0];
    expect(fichier.name).toBe('litto-bingo-eclair.png');
    expect(fichier.type).toBe('image/png');
  });
    it("rejette avec ExportBadgeEchoue, sans rien partager ni télécharger, quand le rendu du sceau échoue", async () => {
    const dependances = creerDependances({
      rendreSceauSvg: vi.fn().mockRejectedValue(new Error('chargement du rendu impossible')),
    });

    await expect(exporterBadge(PARAMS, dependances)).rejects.toBeInstanceOf(ExportBadgeEchoue);
    expect(dependances.partager).not.toHaveBeenCalled();
    expect(dependances.telecharger).not.toHaveBeenCalled();
  });
    it("rejette avec ExportBadgeEchoue, sans rien partager ni télécharger, quand la conversion en PNG échoue", async () => {
    const dependances = creerDependances({
      convertirSvgEnPng: vi.fn().mockRejectedValue(new Error('canvas.toBlob a renvoyé null')),
      peutPartagerFichier: vi.fn().mockReturnValue(true),
    });

    await expect(exporterBadge(PARAMS, dependances)).rejects.toBeInstanceOf(ExportBadgeEchoue);
    expect(dependances.partager).not.toHaveBeenCalled();
    expect(dependances.telecharger).not.toHaveBeenCalled();
  });
    const casTelechargementImpossible: [string, Partial<DependancesExport>][] = [
    ['sans partage possible', { peutPartagerFichier: vi.fn().mockReturnValue(false) }],
    [
      'après un partage raté',
      {
        peutPartagerFichier: vi.fn().mockReturnValue(true),
        partager: vi.fn().mockRejectedValue(new DOMException('Refusé', 'NotAllowedError')),
      },
    ],
  ];

  it.each(casTelechargementImpossible)(
    'rejette avec ExportBadgeEchoue quand le téléchargement échoue (%s)',
    async (_cas, surcharges) => {
      const dependances = creerDependances({
        ...surcharges,
        telecharger: vi.fn().mockImplementation(() => {
          throw new Error('téléchargement bloqué');
        }),
      });

      await expect(exporterBadge(PARAMS, dependances)).rejects.toBeInstanceOf(ExportBadgeEchoue);
    }
  );
    it("rejette avec ExportBadgeEchoue, sans conversion, quand le sceau rendu n'est pas un SVG valide", async () => {
    const dependances = creerDependances({
      rendreSceauSvg: vi.fn().mockResolvedValue('rendu inattendu'),
    });

    await expect(exporterBadge(PARAMS, dependances)).rejects.toBeInstanceOf(ExportBadgeEchoue);
    expect(dependances.convertirSvgEnPng).not.toHaveBeenCalled();
    expect(dependances.telecharger).not.toHaveBeenCalled();
  });
    it("conserve l'erreur d'origine et nomme l'erreur, pour faciliter le diagnostic", async () => {
    const origine = new Error('chargement du rendu impossible');
    const dependances = creerDependances({
      rendreSceauSvg: vi.fn().mockRejectedValue(origine),
    });

    const erreur = await exporterBadge(PARAMS, dependances).catch((e: unknown) => e);

    expect(erreur).toBeInstanceOf(ExportBadgeEchoue);
    expect((erreur as ExportBadgeEchoue).name).toBe('ExportBadgeEchoue');
    expect((erreur as ExportBadgeEchoue).causeOriginale).toBe(origine);
  });
    it.each([[null], [undefined], ['texte brut']])(
    'télécharge quand le partage est rejeté avec une valeur qui n’est pas une erreur (%s)',
    async (rejet) => {
      const dependances = creerDependances({
        peutPartagerFichier: vi.fn().mockReturnValue(true),
        partager: vi.fn().mockRejectedValue(rejet),
      });

      const resultat = await exporterBadge(PARAMS, dependances);

      expect(resultat).toBe('telecharge');
      expect(dependances.telecharger).toHaveBeenCalledTimes(1);
    }
  );

  it("fournit un fichier qui contient l'image produite par la conversion", async () => {
    const dependances = creerDependances({
      convertirSvgEnPng: vi.fn().mockResolvedValue(new Blob(['0123456789'], { type: 'image/png' })),
    });

    await exporterBadge(PARAMS, dependances);

    const fichier = vi.mocked(dependances.telecharger).mock.calls[0][0];
    expect(fichier.size).toBe(10);
  });
});
