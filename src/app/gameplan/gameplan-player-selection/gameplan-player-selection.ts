import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';

import {GamePlanApiService} from '../gameplan-service';
import {GamePlan} from '../../models/gameplan.model';
import {Player} from '../../models/player.model';
import {InGamePlayer} from '../../models/ingameplayer.model';

type PlayerChoice = 'play' | 'noPlay';
type StarterChoice = 'starter' | 'bench';

@Component({
  selector: 'app-player-selection-tab',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardContent, MatRadioModule, MatButtonModule],
  templateUrl: './gameplan-player-selection.html',
  styleUrl: './gameplan-player-selection.scss',
})
export class GameplanPlayerSelectionComponent implements OnChanges {
  @Input({required: true}) gamePlan!: GamePlan;

  homePlayers: Player[] = [];
  choiceById = new Map<string, PlayerChoice>();
  starterChoiceById = new Map<string, StarterChoice>();

  // NEW
  readonly maxStarters = 5;

  constructor(private api: GamePlanApiService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gamePlan'] && this.gamePlan) {
      this.hydrateFromPlan();
    }
  }

  private hydrateFromPlan(): void {
    this.homePlayers = this.gamePlan.ownerTeam?.players ?? [];

    const activePlayers = this.gamePlan.activePlayers ?? [];
    const activeById = new Map(activePlayers.map(activePlayer => [activePlayer.player.id, activePlayer]));

    this.choiceById.clear();
    this.starterChoiceById.clear();


    for (const p of this.homePlayers) {
      let isInGamePlayer = false;

      if (activePlayers.length > 0) {
        isInGamePlayer = activePlayers.some(activePlayer => activePlayer.player.id === p.id);
      }

      // Play / bench
      if (isInGamePlayer) {
        this.choiceById.set(p.id, 'play');
        if (activeById.get(p.id)?.starter === true) {
          this.starterChoiceById.set(p.id, 'starter');
        } else {
          this.starterChoiceById.set(p.id, 'bench');
        }
      }
      else {
        this.choiceById.set(p.id, 'noPlay');
      }

    }

  }

  getChoice(playerId: string): PlayerChoice {
    return this.choiceById.get(playerId) ?? 'noPlay';
  }

  setChoice(playerId: string, choice: PlayerChoice): void {
    this.choiceById.set(playerId, choice);

    // Si Don't play => pas starter
    if (choice === 'noPlay') {
      this.starterChoiceById.delete(playerId);
    } else {
      // Par défaut quand on passe en play
      if (!this.starterChoiceById.has(playerId)) {
        this.starterChoiceById.set(playerId, 'bench');
      }
    }
  }

  getStarterChoice(playerId: string): StarterChoice {
    return this.starterChoiceById.get(playerId) ?? 'bench';
  }

  private starterCount(excludePlayerId?: string): number {
    let count = 0;
    for (const [id, starterChoice] of this.starterChoiceById.entries()) {
      if (excludePlayerId && id === excludePlayerId) continue;
      if (this.getChoice(id) !== 'play') continue;
      if (starterChoice === 'starter') count++;
    }
    return count;
  }

  canSelectStarter(playerId: string): boolean {
    if (this.getChoice(playerId) !== 'play') return false;

    // S'il est déjà starter, on peut toujours le laisser
    if (this.getStarterChoice(playerId) === 'starter') return true;

    return this.starterCount() < this.maxStarters;
  }

  setStarterChoice(playerId: string, choice: StarterChoice): void {
    if (this.getChoice(playerId) !== 'play') return;

    this.starterChoiceById.set(playerId, choice);

  }



  private defaultInGamePlayer(player: Player): InGamePlayer {
    return {
      player,
      starter: false,

      playmakingContribution: 0,
      assistWeight: 0,

      assists: 0,
      points: 0,

      fga: 0,
      fgm: 0,

      threePointAttempt: 0,
      threePointMade: 0,

      twoPointAttempts: 0,
      twoPointMade: 0,

      usageShoot: 0,
      usageDrive: 0,
      usagePost: 0,
    };
  }

  saveActivePlayers(): void {
    if (!this.gamePlan) return;

    console.log(this.starterChoiceById);
    const previous = (this.gamePlan.activePlayers ?? []) as InGamePlayer[];
    const prevById = new Map(previous.map(ap => [ap.player.id, ap]));

    const selectedPlayers = this.homePlayers.filter(p => this.getChoice(p.id) === 'play');

    this.gamePlan.activePlayers = selectedPlayers.map(p => {
      const existing = prevById.get(p.id) ?? this.defaultInGamePlayer(p);
      const starter = this.getStarterChoice(p.id) === 'starter';
      return {...existing, starter: starter};
    });

    this.api.saveGamePlan(this.gamePlan).subscribe();
  }
}
