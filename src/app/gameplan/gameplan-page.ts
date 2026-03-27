import {Component, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CommonModule} from '@angular/common';
import {Observable, tap} from 'rxjs';
import {GamePlanApiService} from './gameplan-service';
import {GamePlan} from '../models/gameplan.model';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {GameplanPlayerSelectionComponent} from './gameplan-player-selection/gameplan-player-selection';
import {GameplanDefenseComponent} from './gameplan-defense/gameplan-defense';
import {GameplanOffense} from './gameplan-offense/gameplan-offense';
import {InGamePlayer} from '../models/ingameplayer.model';

@Component({
  standalone: true,
  imports: [CommonModule, MatTabGroup, MatTab, GameplanPlayerSelectionComponent, GameplanDefenseComponent, GameplanOffense, /* + tes imports Material & components */],
  selector: 'app-gameplan-page',
  templateUrl: './gameplan-page.html',
  styleUrl: './gameplan-page.scss',
})
export class GameplanPage implements OnInit {
  gamePlan$!: Observable<GamePlan>;
  readonly activePlayers = signal<InGamePlayer[]>([]);

  constructor(private api: GamePlanApiService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const gamePlanId = this.route.snapshot.queryParamMap.get('id');
    const source$ = gamePlanId ? this.api.getGamePlanById(gamePlanId) : this.api.getNextGame();
    this.gamePlan$ = source$.pipe(
      tap((gamePlan) => this.activePlayers.set(gamePlan.activePlayers ?? []))
    );
  }

  onActivePlayersChange(players: InGamePlayer[]): void {
    this.activePlayers.set(players);
  }
}
