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
import {DecimalPipe} from '@angular/common';
import {
  getDefenseTeamScore,
  getDriveDefenseScore,
  getDriveOffenseScore,
  getIndicativeOffenseTeamScore,
  getPlaymakingDefenseScore,
  getPlaymakingOffenseScore,
  getThreePtDefenseScore,
  getThreePtOffenseScore,
  getTwoPtDefenseScore,
  getTwoPtOffenseScore,
  TeamScoreSummary,
} from '../../utils/team-score';

type Matchup = {
  visitor: Player;
  home: Player | null;
};

type StatDetail = {
  label: string;
  value: number;
};

type DragPayload =
  | { from: 'pool'; player: Player }
  | { from: 'slot'; player: Player; slotIndex: number };

type PoolSortMode = 'default' | 'driveDefenseDesc' | 'twoPtDefenseDesc' | 'threePtDefenseDesc';
type OffensiveViewMode = 'all' | 'drive' | 'threePt' | 'playmaking' | 'twoPt';
type DefensiveViewMode = 'all' | 'drive' | 'threePt' | 'playmaking' | 'twoPt';
type MatchupScoreSet = {
  driveOffense: number;
  driveDefense: number;
  playmakingOffense: number;
  playmakingDefense: number;
  twoPtOffense: number;
  twoPtDefense: number;
  threePtOffense: number;
  threePtDefense: number;
};

export function getMatchupScores(player: Player): MatchupScoreSet {
  return {
    driveOffense: getDriveOffenseScore(player),
    driveDefense: getDriveDefenseScore(player),
    playmakingOffense: getPlaymakingOffenseScore(player),
    playmakingDefense: getPlaymakingDefenseScore(player),
    twoPtOffense: getTwoPtOffenseScore(player),
    twoPtDefense: getTwoPtDefenseScore(player),
    threePtOffense: getThreePtOffenseScore(player),
    threePtDefense: getThreePtDefenseScore(player),
  };
}

const OFFENSIVE_VIEW_ORDER: OffensiveViewMode[] = ['all', 'drive', 'threePt', 'playmaking', 'twoPt'];
const DEFENSIVE_VIEW_ORDER: DefensiveViewMode[] = ['all', 'drive', 'threePt', 'playmaking', 'twoPt'];

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
    DecimalPipe,
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
  readonly offensiveViewOrder = OFFENSIVE_VIEW_ORDER;
  readonly defensiveViewOrder = DEFENSIVE_VIEW_ORDER;
  offensiveViewByPlayerId = new Map<string, OffensiveViewMode>();
  defensiveViewByPlayerId = new Map<string, DefensiveViewMode>();

  ownerPool: Player[] = [];
  sortMode: PoolSortMode = 'default';

  loading = true;
  error?: string;
  isSaving = false;
  saveStatus: 'idle' | 'success' | 'error' = 'idle';
  readonly getMatchupScores = getMatchupScores;

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

  get homeDefenseTeamScore(): TeamScoreSummary {
    return getDefenseTeamScore(this.activePlayers ?? []);
  }

  get visitorOffenseTeamScore(): TeamScoreSummary {
    return getIndicativeOffenseTeamScore(this.opponentPlayers);
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
      this.getNextView(this.offensiveViewOrder, this.getOffensiveView(playerId), direction),
    );
  }

  cycleDefensiveView(playerId: string, direction: -1 | 1): void {
    this.defensiveViewByPlayerId.set(
      playerId,
      this.getNextView(this.defensiveViewOrder, this.getDefensiveView(playerId), direction),
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
      case 'driveDefenseDesc':
        return getDriveDefenseScore(player);
      case 'twoPtDefenseDesc':
        return getTwoPtDefenseScore(player);
      case 'threePtDefenseDesc':
        return getThreePtDefenseScore(player);
      default:
        return 0;
    }
  }

  private getNextView<T extends string>(order: readonly T[], current: T, direction: -1 | 1): T {
    const currentIndex = order.indexOf(current);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + direction + order.length) % order.length;
    return order[nextIndex];
  }
}
