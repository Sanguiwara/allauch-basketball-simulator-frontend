import {ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatCard, MatCardContent} from '@angular/material/card';
import {RouterLink} from '@angular/router';
import {catchError, finalize, of} from 'rxjs';

import {GamePlan} from '../../models/gameplan.model';
import {Player} from '../../models/player.model';
import {GamePlanApiService} from '../gameplan-service';
import {MatButton} from '@angular/material/button';
import {InGamePlayer} from '../../models/ingameplayer.model';

type Matchup = {
  visitor: Player;
  home: Player | null;
};

type DragPayload =
  | { from: 'pool'; player: Player }
  | { from: 'slot'; player: Player; slotIndex: number };

type PoolSortMode =
  | 'default'
  | 'defExtDesc'
  | 'defPostDesc'
  | 'sizeDesc'
  | 'speedDesc'
  | 'defIqDesc'
  | 'enduranceDesc';
type DefensiveStatKey = 'defExterieur' | 'defPoste' | 'size' | 'speed' | 'basketballIqDef' | 'endurance';
type DefensiveStat = {
  label: string;
  key: DefensiveStatKey;
};

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
    RouterLink,
  ],
  templateUrl: './gameplan-matchup.html',
  styleUrl: './gameplan-matchup.scss',
})
export class GameplanMatchupComponent implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;
  @Input() embedded = false;
  @Input() activePlayers: InGamePlayer[] | null = null;

  ownerPlayers: Player[] = [];
  opponentPlayers: Player[] = [];

  matchupsUI: Matchup[] = [];

  ownerPool: Player[] = [];
  sortMode: PoolSortMode = 'default';

  loading = true;
  error?: string;
  isSaving = false;
  saveStatus: 'idle' | 'success' | 'error' = 'idle';
  readonly defensiveStats: DefensiveStat[] = [
    {label: 'DEF EXT', key: 'defExterieur'},
    {label: 'DEF POSTE', key: 'defPoste'},
    {label: 'SIZE', key: 'size'},
    {label: 'SPEED', key: 'speed'},
    {label: 'DEF IQ', key: 'basketballIqDef'},
    {label: 'ENDURANCE', key: 'endurance'},
  ];

  constructor(private api: GamePlanApiService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['gamePlan'] || changes['activePlayers']) && this.gamePlan) {
      this.ownerPlayers = this.activePlayers
        ? this.activePlayers.map((p) => p.player)
        : this.gamePlan.ownerTeam?.players ?? [];
      this.opponentPlayers = this.gamePlan.opponentTeam?.players ?? [];

      const record = (this.gamePlan.matchups ?? {}) as Record<string, string>;

      const homeById = new Map(this.ownerPlayers.map(h => [h.id, h]));
      const visitorById = new Map(this.opponentPlayers.map(v => [v.id, v]));
      const existingMatchups: Matchup[] = Object.entries(record)
        .map(([homeId, visitorId]) => {
          const home = homeById.get(homeId) ?? null;
          const visitor = visitorById.get(visitorId);
          return visitor ? ({visitor, home} as Matchup) : null;
        })
        .filter((x): x is Matchup => x !== null);

      const matchedVisitorIds = new Set(existingMatchups.map(m => m.visitor.id));
      const emptyMatchups: Matchup[] = this.opponentPlayers
        .filter(player => !matchedVisitorIds.has(player.id))
        .map(player => ({visitor: player, home: null}));

      this.matchupsUI = [...existingMatchups, ...emptyMatchups];

      // pool = homes non utilises
      this.recomputeHomePool();
      this.applyPoolSort();

      this.loading = false;
    }
  }

  setSortMode(mode: PoolSortMode): void {
    this.sortMode = mode;
    this.applyPoolSort();
  }

  private recomputeHomePool(): void {
    const usedHomeIds = new Set(
      this.matchupsUI.map(m => m.home?.id).filter((id): id is string => !!id)
    );
    this.ownerPool = this.ownerPlayers.filter(h => !usedHomeIds.has(h.id));
  }

  // -------------------------
  // Drag & Drop
  // -------------------------

  dropPool(event: CdkDragDrop<Player[]>): void {
    const payload = event.item.data as DragPayload;

    // Reorder dans le pool
    if (payload.from === 'pool' && event.previousContainer === event.container) {
      moveItemInArray(this.ownerPool, event.previousIndex, event.currentIndex);
      this.applyPoolSort();
      return;
    }

    // Slot -> Pool (desassignation)
    if (payload.from === 'slot') {
      const originIndex = payload.slotIndex;

      // retire du slot
      if (this.matchupsUI[originIndex].home?.id === payload.player.id) {
        this.matchupsUI[originIndex].home = null;
      }

      // insere dans le pool a la position de drop
      const insertAt = Math.min(Math.max(event.currentIndex, 0), this.ownerPool.length);
      this.ownerPool.splice(insertAt, 0, payload.player);
      this.applyPoolSort();
      return;
    }

    // Pool -> Pool via autre container (normalement n'arrive pas)
  }

  dropOnSlot(event: CdkDragDrop<any>, targetIndex: number): void { // TODO enlever le any
    const payload = event.item.data as DragPayload;
    const targetMatchup = this.matchupsUI[targetIndex];

    // Pool -> Slot
    if (payload.from === 'pool') {
      // retire du pool
      const idx = this.ownerPool.findIndex(p => p.id === payload.player.id);
      if (idx >= 0) this.ownerPool.splice(idx, 1);

      // si le slot avait deja un home, on le remet au pool
      if (targetMatchup.home) this.ownerPool.push(targetMatchup.home);

      // assigne
      targetMatchup.home = payload.player;
      this.applyPoolSort();
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
      this.applyPoolSort();
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
    this.isSaving = true;
    this.saveStatus = 'idle';

    this.api.saveGamePlan(this.gamePlan).pipe(
      catchError(() => {
        this.saveStatus = 'error';
        this.cdr.markForCheck();
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        if (this.saveStatus !== 'error') {
          this.saveStatus = 'success';
        }
        this.cdr.markForCheck();
        setTimeout(() => {
          this.saveStatus = 'idle';
          this.cdr.markForCheck();
        }, 2000);
      })
    ).subscribe();
  }

  private applyPoolSort(): void {
    if (this.sortMode === 'default') return;
    this.ownerPool = [...this.ownerPool].sort((a, b) => this.getSortValue(b) - this.getSortValue(a));
  }

  private getSortValue(player: Player): number {
    switch (this.sortMode) {
      case 'defExtDesc':
        return player.defExterieur ?? 0;
      case 'defPostDesc':
        return player.defPoste ?? 0;
      case 'sizeDesc':
        return player.size ?? 0;
      case 'speedDesc':
        return player.speed ?? 0;
      case 'defIqDesc':
        return player.basketballIqDef ?? 0;
      case 'enduranceDesc':
        return player.endurance ?? 0;
      default:
        return 0;
    }
  }

  getPlayerStat(player: Player, key: DefensiveStatKey): number {
    return player[key];
  }
}
