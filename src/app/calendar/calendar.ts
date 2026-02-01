import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarApiService } from './calendar-api.service';
import { Game } from '../models/game.model';

import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {

  games: Game[] = [];

  // Id de l’équipe sélectionnée
  selectedTeamId: string | null = null;

  // Liste des équipes (dérivée des games)
  teams: { id: string; name: string }[] = [];

  constructor(private api: CalendarApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getGames().subscribe({
      next: (games) => {
        // tri par date (croissant)
        this.games = [...games].sort(
          (a, b) => new Date(a.executeAt).getTime() - new Date(b.executeAt).getTime()
        );

        // construit la liste des équipes depuis les games (unique)
        const map = new Map<string, string>();

        for (const g of this.games) {
          if (g.homeTeamId && g.homeTeamName) map.set(g.homeTeamId, g.homeTeamName);
          if (g.awayTeamId && g.awayTeamName) map.set(g.awayTeamId, g.awayTeamName);
        }

        this.teams = Array.from(map.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name));

        // optionnel : pré-sélectionner la première équipe
        if (!this.selectedTeamId && this.teams.length > 0) {
          this.selectedTeamId = this.teams[0].id;
        }
      },
      error: (err) => console.error(err),
    });
  }

  // Liste filtrée affichée
  get filteredGames(): Game[] {
    if (!this.selectedTeamId) return this.games;

    return this.games.filter(g =>
      g.homeTeamId === this.selectedTeamId || g.awayTeamId === this.selectedTeamId
    );
  }
}
