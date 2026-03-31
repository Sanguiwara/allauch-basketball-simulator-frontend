import { MatchSummaryService } from './match-summary.service';
import { GameResult } from '../models/game-result.model';
import { CalendarApiService } from '../calendar/calendar-api.service';
import { InGamePlayer } from '../models/ingameplayer.model';
import { Player } from '../models/player.model';

describe('MatchSummaryService', () => {
  it('adds total shot number to team stats', () => {
    const calendarApiStub = {} as CalendarApiService;
    const service = new MatchSummaryService(calendarApiStub);

    const gameResult: GameResult = {
      homeScore: {
        threePointShootingResult: { attempts: 10, made: 4 },
        twoPointShootingResult: { attempts: 18, made: 9 },
        driveResult: { attempts: 12, made: 6 },
      },
      awayScore: {
        threePointShootingResult: { attempts: 9, made: 3 },
        twoPointShootingResult: { attempts: 20, made: 10 },
        driveResult: { attempts: 8, made: 4 },
      },
    };

    const stats = service.buildTeamStats(gameResult);
    const totalShots = stats.find(row => row.label === 'Total tirs');

    expect(totalShots).toEqual({
      label: 'Total tirs',
      home: '40',
      away: '37',
    });
  });

  it('builds totals for player stats', () => {
    const calendarApiStub = {} as CalendarApiService;
    const service = new MatchSummaryService(calendarApiStub);

    const players: InGamePlayer[] = [
      buildInGamePlayer('p1', {
        minutesPlayed: 24,
        points: 12,
        assists: 3,
        offensiveRebounds: 2,
        defensiveRebounds: 4,
        steals: 1,
        blocks: 0,
        fgm: 5,
        fga: 10,
        twoPointMade: 3,
        twoPointAttempts: 6,
        driveMade: 4,
        driveAttempts: 7,
        threePointMade: 2,
        threePointAttempt: 4,
        usageShoot: 12,
        usageDrive: 8,
        usagePost: 5,
      }),
      buildInGamePlayer('p2', {
        minutesPlayed: 16,
        points: 8,
        assists: 2,
        offensiveRebounds: 1,
        defensiveRebounds: 3,
        steals: 2,
        blocks: 1,
        fgm: 3,
        fga: 6,
        twoPointMade: 2,
        twoPointAttempts: 4,
        driveMade: 1,
        driveAttempts: 3,
        threePointMade: 1,
        threePointAttempt: 2,
        usageShoot: 9,
        usageDrive: 6,
        usagePost: 3,
      }),
    ];

    expect(service.buildPlayerTotals(players)).toEqual({
      minutesPlayed: 40,
      points: 20,
      assists: 5,
      offensiveRebounds: 3,
      defensiveRebounds: 7,
      steals: 3,
      blocks: 1,
      fgm: 8,
      fga: 16,
      twoPointMade: 5,
      twoPointAttempts: 10,
      driveMade: 5,
      driveAttempts: 10,
      threePointMade: 3,
      threePointAttempt: 6,
      usageShoot: 21,
      usageDrive: 14,
      usagePost: 8,
    });
  });
});

function buildPlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: `Player ${id}`,
    birthDate: 0,
    tir3Pts: 0,
    tir2Pts: 0,
    lancerFranc: 0,
    floater: 0,
    finitionAuCercle: 0,
    speed: 0,
    ballhandling: 0,
    size: 0,
    weight: 0,
    agressivite: 0,
    defExterieur: 0,
    defPoste: 0,
    protectionCercle: 0,
    timingRebond: 0,
    agressiviteRebond: 0,
    steal: 0,
    physique: 0,
    basketballIqOff: 0,
    basketballIqDef: 0,
    passingSkills: 0,
    iq: 0,
    endurance: 0,
    solidite: 0,
    potentielSkill: 0,
    potentielPhysique: 0,
    coachability: 0,
    ego: 0,
    softSkills: 0,
    leadership: 0,
    badges: [],
    ...overrides,
  };
}

function buildInGamePlayer(
  id: string,
  overrides: Partial<InGamePlayer> = {},
): InGamePlayer {
  return {
    player: buildPlayer(id),
    playmakingContribution: 0,
    assistWeight: 0,
    assists: 0,
    points: 0,
    fga: 0,
    fgm: 0,
    threePointAttempt: 0,
    threePointMade: 0,
    twoPointAttempts: 0,
    twoPointMade: 0,
    driveAttempts: 0,
    driveMade: 0,
    usageShoot: 0,
    usageDrive: 0,
    usagePost: 0,
    threePtScore: 0,
    twoPtScore: 0,
    driveScore: 0,
    minutesPlayed: 0,
    starter: false,
    offensiveRebounds: 0,
    defensiveRebounds: 0,
    steals: 0,
    blocks: 0,
    ...overrides,
  };
}
