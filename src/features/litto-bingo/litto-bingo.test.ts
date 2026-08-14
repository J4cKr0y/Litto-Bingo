import { describe, it, expect } from 'vitest';
import { genererGrille } from './litto-bingo';

describe('genererGrille', () => {
  it('retourne null quand aucune consigne n\'est disponible', () => {
    const consignesDisponibles: unknown[] = [];

    const resultat = genererGrille(consignesDisponibles as never);

    expect(resultat).toBeNull();
  });
});