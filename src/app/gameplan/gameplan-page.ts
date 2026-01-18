import {Component, OnInit} from '@angular/core';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {GameplanMatchupComponent} from './gameplan-matchups/gameplan-matchup';
import {GameplanOffense} from './gameplan-offense/gameplan-offense';
import {GameplanPlayerSelectionComponent} from './gameplan-player-selection/gameplan-player-selection';
import {GamePlan} from '../models/gameplan.model';
import {GamePlanApiService} from './gameplan-service';

@Component({
  standalone: true,
  imports: [MatTabGroup, MatTab, GameplanMatchupComponent, GameplanOffense, GameplanPlayerSelectionComponent, /* ... */],
  selector: 'app-gameplan-page',
  templateUrl: './gameplan-page.html',
  styleUrl: './gameplan-page.scss',
})
export class GameplanPage implements OnInit {
  constructor(private api: GamePlanApiService) {
  }

  gamePlan?: GamePlan;

  ngOnInit(): void {
    this.api.getGamePlanById().subscribe({
      next: (plan) => {
        this.gamePlan = plan;
      }
    });
  }
}
