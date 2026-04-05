import {Component, Input} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {RouterLink} from '@angular/router';

import {Player} from '../../models/player.model';
import {DefenseType} from '../../models/zone.enum';
import {MatchSummaryMatchup} from '../match-summary.service';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {
  getDefenseTeamScore,
  getDriveDefenseScore,
  getDriveOffenseScore,
  getOffenseTeamScore,
  getPlaymakingDefenseScore,
  getPlaymakingOffenseScore,
  getThreePtDefenseScore,
  getThreePtOffenseScore,
  getTwoPtDefenseScore,
  getTwoPtOffenseScore,
  TeamScoreSummary,
} from '../../utils/team-score';
import {DecimalPipe} from '@angular/common';

type OffensiveViewMode = 'all' | 'drive' | 'threePt' | 'playmaking' | 'twoPt';
type DefensiveViewMode = 'all' | 'drive' | 'threePt' | 'playmaking' | 'twoPt';
type StatDetail = {
  label: string;
  value: number;
};

const OFFENSIVE_VIEW_ORDER: OffensiveViewMode[] = ['all', 'drive', 'threePt', 'playmaking', 'twoPt'];
const DEFENSIVE_VIEW_ORDER: DefensiveViewMode[] = ['all', 'drive', 'threePt', 'playmaking', 'twoPt'];

@Component({
  selector: 'app-match-summary-matchups',
  standalone: true,
  imports: [MatCard, MatCardContent, RouterLink, DecimalPipe],
  templateUrl: './match-summary-matchups.component.html',
  styleUrl: './match-summary-matchups.component.scss',
})
export class MatchSummaryMatchupsComponent {
  @Input({required: true}) matchups: MatchSummaryMatchup[] = [];
  @Input() defenderLabel = 'Defense';
  @Input() attackerLabel = 'Attaque';
  @Input() defenseType: DefenseType | null = null;
  @Input() defenders: InGamePlayer[] = [];
  @Input() attackers: InGamePlayer[] = [];
  offensiveViewByPlayerId = new Map<string, OffensiveViewMode>();
  defensiveViewByPlayerId = new Map<string, DefensiveViewMode>();

  get isManToMan(): boolean {
    return this.defenseType === DefenseType.MAN_TO_MAN;
  }

  get defenseTypeLabel(): string {
    switch (this.defenseType) {
      case DefenseType.MAN_TO_MAN:
        return 'Man-to-man';
      case DefenseType.ZONE_2_1_2:
        return 'Zone 2-1-2';
      case DefenseType.ZONE_2_3:
        return 'Zone 2-3';
      case DefenseType.ZONE_3_2:
        return 'Zone 3-2';
      default:
        return 'Defense inconnue';
    }
  }

  get defenderTeamScore(): TeamScoreSummary {
    return getDefenseTeamScore(this.defenders);
  }

  get attackerTeamScore(): TeamScoreSummary {
    return getOffenseTeamScore(this.attackers);
  }

  getOffensiveView(playerId: string): OffensiveViewMode {
    return this.offensiveViewByPlayerId.get(playerId) ?? 'all';
  }

  getDefensiveView(playerId: string): DefensiveViewMode {
    return this.defensiveViewByPlayerId.get(playerId) ?? 'all';
  }

  cycleOffensiveView(playerId: string, direction: -1 | 1): void {
    this.offensiveViewByPlayerId.set(
      playerId,
      this.getNextView(OFFENSIVE_VIEW_ORDER, this.getOffensiveView(playerId), direction),
    );
  }

  cycleDefensiveView(playerId: string, direction: -1 | 1): void {
    this.defensiveViewByPlayerId.set(
      playerId,
      this.getNextView(DEFENSIVE_VIEW_ORDER, this.getDefensiveView(playerId), direction),
    );
  }

  offensiveViewLabel(mode: OffensiveViewMode): string {
    switch (mode) {
      case 'all':
        return 'Tous';
      case 'drive':
        return 'Drive';
      case 'threePt':
        return '3PT';
      case 'playmaking':
        return 'Playmaking';
      case 'twoPt':
        return '2PT';
    }
  }

  defensiveViewLabel(mode: DefensiveViewMode): string {
    switch (mode) {
      case 'all':
        return 'Tous';
      case 'drive':
        return 'Def Drive';
      case 'threePt':
        return 'Def 3PT';
      case 'playmaking':
        return 'Def Playmaking';
      case 'twoPt':
        return 'Def 2PT';
    }
  }

  offensiveDetails(player: Player, mode: OffensiveViewMode): StatDetail[] {
    switch (mode) {
      case 'all':
        return [
          {label: 'DR OFF', value: getDriveOffenseScore(player)},
          {label: 'PLAY OFF', value: getPlaymakingOffenseScore(player)},
          {label: '2PT OFF', value: getTwoPtOffenseScore(player)},
          {label: '3PT OFF', value: getThreePtOffenseScore(player)},
        ];
      case 'drive':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'END', value: player.endurance},
          {label: 'HANDLE', value: player.ballhandling},
          {label: 'FIN', value: player.finitionAuCercle},
          {label: 'FLOAT', value: player.floater},
          {label: 'IQ', value: player.iq},
        ];
      case 'threePt':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'END', value: player.endurance},
          {label: '3PT', value: player.tir3Pts},
          {label: 'IQ', value: player.iq},
        ];
      case 'playmaking':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'END', value: player.endurance},
          {label: 'PASS', value: player.passingSkills},
          {label: 'IQ OFF', value: player.basketballIqOff},
          {label: 'HANDLE', value: player.ballhandling},
          {label: '3PT', value: player.tir3Pts},
          {label: '2PT', value: player.tir2Pts},
          {label: 'FIN', value: player.finitionAuCercle},
          {label: 'FLOAT', value: player.floater},
        ];
      case 'twoPt':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'END', value: player.endurance},
          {label: 'FIN', value: player.finitionAuCercle},
          {label: '2PT', value: player.tir2Pts},
          {label: 'IQ', value: player.iq},
        ];
    }
  }

  defensiveDetails(player: Player, mode: DefensiveViewMode): StatDetail[] {
    switch (mode) {
      case 'all':
        return [
          {label: 'DR DEF', value: getDriveDefenseScore(player)},
          {label: 'PLAY DEF', value: getPlaymakingDefenseScore(player)},
          {label: '2PT DEF', value: getTwoPtDefenseScore(player)},
          {label: '3PT DEF', value: getThreePtDefenseScore(player)},
        ];
      case 'drive':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'DEF EXT', value: player.defExterieur},
          {label: 'END', value: player.endurance},
          {label: 'IQ', value: player.iq},
          {label: 'STL', value: player.steal},
          {label: 'DEF POST', value: player.defPoste},
        ];
      case 'threePt':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'DEF EXT', value: player.defExterieur},
          {label: 'END', value: player.endurance},
          {label: 'IQ', value: player.iq},
        ];
      case 'playmaking':
        return [
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'DEF EXT', value: player.defExterieur},
          {label: 'END', value: player.endurance},
          {label: 'IQ DEF', value: player.basketballIqDef},
          {label: 'STL', value: player.steal},
        ];
      case 'twoPt':
        return [
          {label: 'DEF POST', value: player.defPoste},
          {label: 'SPD', value: player.speed},
          {label: 'SIZE', value: player.size},
          {label: 'END', value: player.endurance},
          {label: 'IQ', value: player.iq},
          {label: 'STL', value: player.steal},
        ];
    }
  }

  currentOffensiveScore(player: Player, mode: OffensiveViewMode): number {
    switch (mode) {
      case 'all':
        return getPlaymakingOffenseScore(player);
      case 'drive':
        return getDriveOffenseScore(player);
      case 'threePt':
        return getThreePtOffenseScore(player);
      case 'playmaking':
        return getPlaymakingOffenseScore(player);
      case 'twoPt':
        return getTwoPtOffenseScore(player);
    }
  }

  currentDefensiveScore(player: Player, mode: DefensiveViewMode): number {
    switch (mode) {
      case 'all':
        return getPlaymakingDefenseScore(player);
      case 'drive':
        return getDriveDefenseScore(player);
      case 'threePt':
        return getThreePtDefenseScore(player);
      case 'playmaking':
        return getPlaymakingDefenseScore(player);
      case 'twoPt':
        return getTwoPtDefenseScore(player);
    }
  }

  private getNextView<T extends string>(order: readonly T[], current: T, direction: -1 | 1): T {
    const currentIndex = order.indexOf(current);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + order.length) % order.length;
    return order[nextIndex];
  }
}
