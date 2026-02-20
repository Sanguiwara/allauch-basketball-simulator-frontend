import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatListModule} from '@angular/material/list';
import {Game} from '../../models/game.model';
import {InGamePlayer} from '../../models/ingameplayer.model';
import {PlayerProgression} from '../../models/player-progression.model';

type StatKey = Exclude<keyof PlayerProgression, 'playerId' | 'eventId'>;

const PLAYER_PROGRESSION_STATS: ReadonlyArray<{key: StatKey; label: string}> = [
  {key: 'tir3Pts', label: 'Tir 3 pts'},
  {key: 'tir2Pts', label: 'Tir 2 pts'},
  {key: 'lancerFranc', label: 'Lancer franc'},
  {key: 'floater', label: 'Floater'},
  {key: 'finitionAuCercle', label: 'Finition au cercle'},
  {key: 'speed', label: 'Vitesse'},
  {key: 'ballhandling', label: 'Dribble'},
  {key: 'size', label: 'Taille'},
  {key: 'weight', label: 'Poids'},
  {key: 'agressivite', label: 'Agressivite'},
  {key: 'defExterieur', label: 'Defense exterieure'},
  {key: 'defPoste', label: 'Defense poste'},
  {key: 'protectionCercle', label: 'Protection cercle'},
  {key: 'timingRebond', label: 'Timing rebond'},
  {key: 'agressiviteRebond', label: 'Agressivite rebond'},
  {key: 'steal', label: 'Interceptions'},
  {key: 'timingBlock', label: 'Timing block'},
  {key: 'physique', label: 'Physique'},
  {key: 'basketballIqOff', label: 'IQ off'},
  {key: 'basketballIqDef', label: 'IQ def'},
  {key: 'passingSkills', label: 'Passe'},
  {key: 'iq', label: 'IQ general'},
  {key: 'endurance', label: 'Endurance'},
  {key: 'solidite', label: 'Solidite'},
  {key: 'potentielSkill', label: 'Potentiel skill'},
  {key: 'potentielPhysique', label: 'Potentiel physique'},
  {key: 'coachability', label: 'Coachability'},
  {key: 'ego', label: 'Ego'},
  {key: 'softSkills', label: 'Soft skills'},
  {key: 'leadership', label: 'Leadership'},
  {key: 'morale', label: 'Morale'},
];

@Component({
  selector: 'app-player-progression-tabs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, MatListModule],
  templateUrl: './player-progression-tabs.component.html',
  styleUrl: './player-progression-tabs.component.scss',
})
export class PlayerProgressionTabsComponent {
  @Input({required: true})
  set game(value: Game) {
    this._game = value;
    this.syncFromGame();
  }
  get game(): Game {
    return this._game;
  }

  homePlayers: InGamePlayer[] = [];
  awayPlayers: InGamePlayer[] = [];
  homeTeamName = 'Domicile';
  awayTeamName = 'Visiteur';

  homeProgressions: PlayerProgression[] = [];
  awayProgressions: PlayerProgression[] = [];

  readonly stats = PLAYER_PROGRESSION_STATS;
  private _game!: Game;
  private progressionByPlayerId = new Map<string, PlayerProgression>();

  getPlayerLabel(player: InGamePlayer): string {
    const name = player.player?.name?.trim();
    if (name) {
      return name;
    }
    return player.player?.id ?? 'Joueur';
  }

  getProgressionForPlayer(player: InGamePlayer): PlayerProgression | null {
    const playerId = player.player?.id;
    if (!playerId) {
      return null;
    }
    return this.progressionByPlayerId.get(playerId) ?? null;
  }

  getStatValue(progression: PlayerProgression | null, key: StatKey): number | null {
    if (!progression) {
      return null;
    }
    return progression[key];
  }

  formatStatValue(value: number | null): string {
    if (value === null) {
      return '0';
    }
    if (value > 0) {
      return `+${value}`;
    }
    return String(value);
  }

  getStatClass(value: number | null): string {
    if (value === null || value === 0) {
      return 'stat-neutral';
    }
    return value > 0 ? 'stat-positive' : 'stat-negative';
  }

  private syncFromGame(): void {
    this.homePlayers = this._game?.homeActivePlayers ?? [];
    this.awayPlayers = this._game?.awayActivePlayers ?? [];
    this.homeTeamName = this._game?.homeTeamName ?? 'Domicile';
    this.awayTeamName = this._game?.awayTeamName ?? 'Visiteur';

    const progressions = this._game?.playerProgressions ?? [];
    this.progressionByPlayerId = new Map(
      progressions.filter(p => !!p.playerId).map(p => [p.playerId, p]),
    );

    const homeIds = new Set(this.homePlayers.map(player => player.player?.id).filter(Boolean) as string[]);
    const awayIds = new Set(this.awayPlayers.map(player => player.player?.id).filter(Boolean) as string[]);

    this.homeProgressions = progressions.filter(p => homeIds.has(p.playerId));
    this.awayProgressions = progressions.filter(p => awayIds.has(p.playerId));
  }
}
