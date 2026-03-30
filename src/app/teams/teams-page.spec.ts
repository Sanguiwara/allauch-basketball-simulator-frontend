import { describe, expect, it } from 'vitest';
import '@angular/compiler';

import { isUserTeam, toTeamListItem } from './teams-page';
import { TeamDTO } from './teams.api';

describe('teams page helpers', () => {
  it('maps backend teams with clubId and fallback labels', () => {
    const team = {
      id: 'team-1',
      name: '  ',
      ageCategory: 'U18',
      gender: 'M',
      clubId: 'club-1',
      players: [{ id: 'player-1' }],
    } as unknown as TeamDTO;

    expect(toTeamListItem(team)).toEqual({
      id: 'team-1',
      clubId: 'club-1',
      name: 'Equipe sans nom',
      category: 'U18',
      gender: 'M',
      playerCount: 1,
    });
  });

  it('identifies the user team from the club id', () => {
    expect(isUserTeam('club-1', 'club-1')).toBe(true);
    expect(isUserTeam('club-1', 'club-2')).toBe(false);
    expect(isUserTeam('club-1', null)).toBe(false);
  });
});
