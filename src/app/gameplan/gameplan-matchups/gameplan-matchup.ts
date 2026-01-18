import {Component, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray,} from '@angular/cdk/drag-drop';
import {MatCard, MatCardContent} from '@angular/material/card';

import {GamePlan} from '../../models/gameplan.model';
import {Player} from '../../models/player.model';
import {GamePlanApiService} from '../gameplan-service';
import {MatButton} from '@angular/material/button';

type Matchup = {
  visitor: Player;
  home: Player | null;
};

type DragPayload =
  | { from: 'pool'; player: Player }
  | { from: 'slot'; player: Player; slotIndex: number };

@Component({
  selector: 'gameplan-matchup-component',
  standalone: true,
  imports: [
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatCardContent,
    MatCard,
    MatButton,
  ],
  templateUrl: './gameplan-matchup.html',
  styleUrl: './gameplan-matchup.scss',
})
export class GameplanMatchupComponent implements OnInit {
  gamePlan?: GamePlan;

  homePlayers: Player[] = [];
  visitorsPlayers: Player[] = [];

  matchupsUI: Matchup[] = [];

  homePool: Player[] = [];

  loading = true;
  error?: string;

  constructor(private api: GamePlanApiService) {
  }

  ngOnInit(): void {
    this.api.getGamePlanById().subscribe({
      next: (plan) => {
        this.gamePlan = plan;

        this.homePlayers = plan.teamHome?.players ?? [];
        this.visitorsPlayers = plan.teamVisitor?.players ?? [];

        const record = (plan.matchups ?? {}) as Record<string, string>;

        const homeById = new Map(this.homePlayers.map(h => [h.id, h]));
        const visitorById = new Map(this.visitorsPlayers.map(v => [v.id, v]));
        const existingMatchups: Matchup[] = Object.entries(record)
          .map(([homeId, visitorId]) => {
            const home = homeById.get(homeId) ?? null;
            const visitor = visitorById.get(visitorId);
            return visitor ? ({visitor, home} as Matchup) : null;
          })
          .filter((x): x is Matchup => x !== null);

        const matchedVisitorIds = new Set(existingMatchups.map(m => m.visitor.id));
        const emptyMatchups: Matchup[] = this.visitorsPlayers
          .filter(player => !matchedVisitorIds.has(player.id))
          .map(player => ({visitor: player, home: null}));

        this.matchupsUI = [...existingMatchups, ...emptyMatchups];

        // 3) pool = homes non utilisés
        this.recomputeHomePool();

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger le gameplan.';
        this.loading = false;
      },
    });
  }

  private recomputeHomePool(): void {
    const usedHomeIds = new Set(
      this.matchupsUI.map(m => m.home?.id).filter((id): id is string => !!id)
    );
    this.homePool = this.homePlayers.filter(h => !usedHomeIds.has(h.id));
  }

  // -------------------------
  // Drag & Drop
  // -------------------------

  dropPool(event: CdkDragDrop<Player[]>): void {
    const payload = event.item.data as DragPayload;

    // Reorder dans le pool
    if (payload.from === 'pool' && event.previousContainer === event.container) {
      moveItemInArray(this.homePool, event.previousIndex, event.currentIndex);
      return;
    }

    // Slot -> Pool (désassignation)
    if (payload.from === 'slot') {
      const originIndex = payload.slotIndex;

      // retire du slot
      if (this.matchupsUI[originIndex].home?.id === payload.player.id) {
        this.matchupsUI[originIndex].home = null;
      }

      // insère dans le pool à la position de drop
      const insertAt = Math.min(Math.max(event.currentIndex, 0), this.homePool.length);
      this.homePool.splice(insertAt, 0, payload.player);
      return;
    }

    // Pool -> Pool via autre container (normalement n'arrive pas)
  }

  dropOnSlot(event: CdkDragDrop<any>, targetIndex: number): void { //TODO enlever le any
    const payload = event.item.data as DragPayload;
    const targetMatchup = this.matchupsUI[targetIndex];

    // Pool -> Slot
    if (payload.from === 'pool') {
      // retire du pool
      const idx = this.homePool.findIndex(p => p.id === payload.player.id);
      if (idx >= 0) this.homePool.splice(idx, 1);

      // si le slot avait déjà un home, on le remet au pool
      if (targetMatchup.home) this.homePool.push(targetMatchup.home);

      // assigne
      targetMatchup.home = payload.player;
      return;
    }

    // Slot -> Slot (swap)
    if (payload.from === 'slot') {
      const fromIndex = payload.slotIndex;
      if (fromIndex === targetIndex) return;

      const source = this.matchupsUI[fromIndex];

      const temp = targetMatchup.home;
      targetMatchup.home = source.home;
      source.home = temp;
      return;
    }
  }

  // -------------------------
  // Save
  // -------------------------

  saveMatchups(): void {
    if (!this.gamePlan) return;

    const record: Record<string, string> = {};
    for (const m of this.matchupsUI) {
      if (m.home) record[m.home.id] = m.visitor.id;
    }

    this.gamePlan.matchups = record;
    this.api.saveGamePlan(this.gamePlan).subscribe();
  }
}
