import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionStore } from './session.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('allauch-basketball-simulator');

  constructor(private sessionStore: SessionStore) {}

  ngOnInit(): void {
    this.sessionStore.loadMe().subscribe();
  }
}
