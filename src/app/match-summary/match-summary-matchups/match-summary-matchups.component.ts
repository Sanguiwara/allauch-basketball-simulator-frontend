import {Component, Input} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {RouterLink} from '@angular/router';

import {Player} from '../../models/player.model';
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
}
