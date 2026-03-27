import {ChangeDetectionStrategy, Component, Input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {PlayerProgression} from '../../models/player-progression.model';
import {Player} from '../../models/player.model';

@Component({
  selector: 'app-player-progression-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './player-progression-table.component.html',
  styleUrl: './player-progression-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerProgressionTableComponent {
  private _playerProgressions: PlayerProgression[] = [];
  private _players: Player[] = [];
  private playerNameById = new Map<string, string>();

  readonly showShooting = signal(true);
  readonly showDefense = signal(true);
  readonly showPhysical = signal(true);
  readonly showPlaymaking = signal(true);
  readonly showMorale = signal(true);

  @Input()
  emptyLabel = 'Aucune progression disponible.';

  @Input()
  set playerProgressions(value: PlayerProgression[] | null | undefined) {
    this._playerProgressions = value ?? [];
  }
  get playerProgressions(): PlayerProgression[] {
    return this._playerProgressions;
  }

  @Input()
  set players(value: Player[] | null | undefined) {
    this._players = value ?? [];
    this.playerNameById = new Map(this._players.map((player) => [player.id, player.name]));
  }
  get players(): Player[] {
    return this._players;
  }

  resolvePlayerName(playerId: string): string {
    return this.playerNameById.get(playerId) ?? playerId;
  }

  formatDelta(value: number | null | undefined): string {
    if (value === null || value === undefined) return '0';
    if (value === 0) return '0';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}`;
  }

  isPositive(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && value > 0;
  }

  isNegative(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && value < 0;
  }

  toggleGroup(group: 'shooting' | 'defense' | 'physical' | 'playmaking' | 'morale'): void {
    switch (group) {
      case 'shooting':
        this.showShooting.set(!this.showShooting());
        break;
      case 'defense':
        this.showDefense.set(!this.showDefense());
        break;
      case 'physical':
        this.showPhysical.set(!this.showPhysical());
        break;
      case 'playmaking':
        this.showPlaymaking.set(!this.showPlaymaking());
        break;
      case 'morale':
        this.showMorale.set(!this.showMorale());
        break;
    }
  }
}
