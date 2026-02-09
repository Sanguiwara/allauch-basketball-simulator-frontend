import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatCard, MatCardContent} from '@angular/material/card';
import {GamePlan} from '../../models/gameplan.model';
import {GamePlanApiService} from '../gameplan-service';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {MatButton} from '@angular/material/button';

type UsageKey = 'usageDrive' | 'usageShoot' | 'usagePost';

@Component({
  selector: 'app-gameplan-offense',
  imports: [
    MatSlider,
    MatCardContent,
    MatCard,
    MatProgressSpinner,
    FormsModule,
    MatSliderThumb,
    MatButton,

  ],
  templateUrl: './gameplan-offense.html',
  styleUrl: './gameplan-offense.scss',
})
export class GameplanOffense implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;

  activePlayers: InGamePlayer[] = [];

  maxGeneralUsage = 100;
  maxPerPlayerUsage = 30;

  constructor(private api: GamePlanApiService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gamePlan'] && this.gamePlan) {
      this.activePlayers = (this.gamePlan.activePlayers ?? []).map((p) => ({...p}));
    }


  }


  /** Somme en excluant un joueur (utile pour calculer ce qu'il reste) */
  private getTotalExcluding(key: UsageKey, exclude: InGamePlayer): number {
    let total = 0;
    for (const p of this.activePlayers) {
      if (p === exclude) continue;
      total += (p[key] ?? 0);
    }
    return total;
  }

  setUsage(player: InGamePlayer, key: UsageKey, value: number) {
    let next = value;

    if (value > this.maxPerPlayerUsage) next = this.maxPerPlayerUsage;

    const totalWithoutPlayer = this.getTotalExcluding(key, player);
    const remaining = this.maxGeneralUsage - totalWithoutPlayer;


    if (remaining <= 0) {
      player[key] = 0;
      return;
    }

    if (next > remaining) {
      next = remaining;
    }

    player[key] = next;
  }


  saveActivePlayers(): void {
    if (!this.gamePlan) return;
    this.gamePlan.activePlayers = this.activePlayers;

    this.api.saveGamePlan(this.gamePlan).subscribe();
  }
}
