import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {Player} from '../player-detail/player.model';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {PlayersService} from '../players.service';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-players-list',
  standalone: true,

  imports: [
    RouterModule,          // <-- nécessaire pour routerLink
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


  displayedColumns: string[] = [
    'id',
    'name',
    'birthDate',
    'tir3Pts',
    'tir2Pts',
    'lancerFranc',
    'finitionAuCercle',
    'defExterieur',
    'protectionCercle',
    'physique',
    'iq',
    'potentielSkill',
    'leadership',
  ];

  dataSource = new MatTableDataSource<Player>([]);
  isLoading = true;
  errorMsg: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private playersService: PlayersService) {}

  ngAfterViewInit(): void {
    this.loadPlayers();

    // filtre par défaut : name + id etc.
    this.dataSource.filterPredicate = (data: Player, filter: string) => {
      const f = filter.trim().toLowerCase();
      return (
        data.name.toLowerCase().includes(f) ||
        String(data.id).includes(f)
      );
    };
  }

  loadPlayers(): void {
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
}
