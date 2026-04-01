import {Component, Input} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {RouterLink} from '@angular/router';

import {Player} from '../../models/player.model';
import {DefenseType} from '../../models/zone.enum';
import {MatchSummaryMatchup} from '../match-summary.service';

type DefensiveStatKey = 'defExterieur' | 'defPoste' | 'size' | 'speed' | 'basketballIqDef' | 'endurance';

@Component({
  selector: 'app-match-summary-matchups',
  standalone: true,
  imports: [MatCard, MatCardContent, RouterLink],
  templateUrl: './match-summary-matchups.component.html',
  styleUrl: './match-summary-matchups.component.scss',
})
export class MatchSummaryMatchupsComponent {
  @Input({required: true}) matchups: MatchSummaryMatchup[] = [];
  @Input() defenderLabel = 'Defense';
  @Input() attackerLabel = 'Attaque';
  @Input() defenseType: DefenseType | null = null;

  readonly defensiveStats: Array<{label: string; key: DefensiveStatKey}> = [
    {label: 'DEF EXT', key: 'defExterieur'},
    {label: 'DEF POSTE', key: 'defPoste'},
    {label: 'SIZE', key: 'size'},
    {label: 'SPEED', key: 'speed'},
    {label: 'DEF IQ', key: 'basketballIqDef'},
    {label: 'ENDURANCE', key: 'endurance'},
  ];

  getPlayerStat(player: Player, key: DefensiveStatKey): number {
    return player[key];
  }

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
}
