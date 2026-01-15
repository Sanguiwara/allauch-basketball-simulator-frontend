import { Component, OnInit } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import {
  CdkDrag,
  CdkDropList,
  CdkDragDrop,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem, CdkDragPlaceholder
} from '@angular/cdk/drag-drop';
import { GamePlan } from '../models/gameplan.model';
import { Player } from '../models/player.model';
import { GamePlanApiService } from './gameplan-service';
import {MatCard, MatCardContent} from '@angular/material/card';

type MatchupSlot = {
  visitor: Player;
  home?: Player;
};

@Component({
  selector: 'app-gameplan',
  standalone: true,
  imports: [MatTabGroup, MatTab, CdkDrag, CdkDropList, MatCardContent, MatCard, CdkDropListGroup, CdkDrag, CdkDropList],
  templateUrl: './gameplan.html',
  styleUrl: './gameplan.scss',
})
export class GameplanComponent implements OnInit {
  gamePlan?: GamePlan;

  homePlayers: Player[] = [];
  visitorPlayers: Player[] = [];

  defensivePlayers: Player[] = [];

  matchupSlots: MatchupSlot[] = [];

  loading = true;
  error?: string;

  constructor(private api: GamePlanApiService) {}

  ngOnInit(): void {
    this.api.getGamePlanById().subscribe({
      next: (plan) => {
        this.gamePlan = plan;

        this.homePlayers = plan.teamHome?.players ?? [];
        this.visitorPlayers = plan.teamVisitor?.players ?? [];
        this.defensivePlayers = [];


        // 1 slot par visitor
        this.matchupSlots = this.visitorPlayers.map(v => ({ visitor: v, home: undefined }));

        this.loading = false;
        console.log(this.gamePlan);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger le gameplan.';
        this.loading = false;
      }
    });
  }
  //TODO En fait defensivePlayers doit s'initialiser avec les joueurs present dans les matchups


  drop(event: CdkDragDrop<Player[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);

    }
  }

  generateMatchups(): void {
    // 1) On part des matchups existants (Record), sans tout effacer
    const raw = this.gamePlan?.matchups;

    // Copie défensive : on évite de muter une référence partagée
    const matchups: Record<string, string> = { ...(raw ?? {}) };

    // 2) Construire les slots UI
    this.matchupSlots = this.visitorPlayers.map((visitor, index) => ({
      visitor,
      home: this.defensivePlayers[index] ?? undefined,
    }));

    // 3) Appliquer les mises à jour : attacker(home.id) -> defender(visitor.id)
    this.matchupSlots.forEach(slot => {
      if (slot.home) {
        matchups[slot.home.id] = slot.visitor.id;
      }
    });

    // 4) Réinjecter dans le gamePlan
    this.gamePlan!.matchups = matchups;

    console.log(this.gamePlan!.matchups);

    this.api.saveGamePlan(this.gamePlan!).subscribe();
  }



}
