import {Team} from './team.model';
import {Position} from './position.enum';
import {InGamePlayer} from './ingameplayer.model';
import {DefenseType} from './zone.enum';
import {ZoneDefenseType} from './zone-defense-type.enum';

export interface GamePlan {
  id: string;          // UUID
  ownerTeam: Team;
  opponentTeam: Team;
  matchups?: Record<string, string>;
  positions?: Map<Position, string>;
  activePlayers?: InGamePlayer[];
  // Map<UUID, UUID>

  threePointAttemptShare: number;
  midRangeAttemptShare: number;
  driveAttemptShare: number;
  totalShotNumber: number;
  defenseType: DefenseType;
  zoneType?: ZoneDefenseType | null;
}


