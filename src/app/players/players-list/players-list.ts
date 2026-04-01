import {AfterViewInit, Component, ViewChild, signal} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {Player} from '../../models/player.model';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {PlayersService} from '../players.service';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {RouterModule} from '@angular/router';
import {AuthService} from '@auth0/auth0-angular';

@Component({
  selector: 'app-players-list',
  standalone: true,

  imports: [
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './players-list.html',
  styleUrl: './players-list.scss',
})
export class PlayersList implements AfterViewInit{
  readonly showIdentity = signal(true);
  readonly showShooting = signal(true);
  readonly showDefense = signal(true);
  readonly showPhysical = signal(true);
  readonly showPlaymaking = signal(true);
  readonly showMental = signal(true);
  readonly showPotential = signal(true);
  readonly showBadges = signal(true);

  dataSource = new MatTableDataSource<Player>([]);
  isLoading = true;
  errorMsg: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private playersService: PlayersService, private auth: AuthService) {
    this.dataSource.filterPredicate = (data: Player, filter: string) =>
      data.name.toLowerCase().includes(filter);
  }

  ngAfterViewInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {

    this.auth.getAccessTokenSilently().subscribe({
      next: t => console.log('TOKEN OK', t),
      error: e => console.error('TOKEN ERROR', e),
    });
    this.isLoading = true;
    this.errorMsg = null;

    this.playersService.getPlayers().subscribe({
      next: (players) => {
        this.dataSource.data = players;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = "Impossible de charger les joueurs.";
        this.isLoading = false;
      },
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  get displayedColumns(): string[] {
    const columns: string[] = [];
    if (this.showIdentity()) {
      columns.push('name', 'birthDate');
    }
    if (this.showShooting()) {
      columns.push('tir3Pts', 'tir2Pts', 'lancerFranc', 'floater', 'finitionAuCercle');
    }
    if (this.showDefense()) {
      columns.push('defExterieur', 'defPoste', 'protectionCercle', 'timingRebond', 'agressiviteRebond', 'steal');
    }
    if (this.showPhysical()) {
      columns.push('physique', 'speed', 'endurance', 'solidite', 'size', 'weight', 'agressivite');
    }
    if (this.showPlaymaking()) {
      columns.push('ballhandling', 'passingSkills', 'basketballIqOff', 'basketballIqDef', 'iq');
    }
    if (this.showMental()) {
      columns.push('coachability', 'ego', 'morale', 'softSkills', 'leadership');
    }
    if (this.showPotential()) {
      columns.push('potentielSkill', 'potentielPhysique');
    }
    if (this.showBadges()) {
      columns.push('badges');
    }
    return columns;
  }

  toggleGroup(
    group:
      | 'identity'
      | 'shooting'
      | 'defense'
      | 'physical'
      | 'playmaking'
      | 'mental'
      | 'potential'
      | 'badges',
  ): void {
    switch (group) {
      case 'identity':
        this.showIdentity.set(!this.showIdentity());
        break;
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
      case 'mental':
        this.showMental.set(!this.showMental());
        break;
      case 'potential':
        this.showPotential.set(!this.showPotential());
        break;
      case 'badges':
        this.showBadges.set(!this.showBadges());
        break;
    }
  }

  badgeLabels(badges: Player['badges'] | null | undefined): string {
    return (badges ?? []).map((badge) => badge.name).join(', ');
  }
}
