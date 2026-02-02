import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule],
  template: `
    <h1>Connexion</h1>

    <button (click)="login()">Se connecter</button>

    <p *ngIf="auth.error$ | async as err">Erreur: {{ err.message }}</p>
  `,
})
export class LoginComponent implements OnInit {
  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    // Optionnel : auto-redirect vers Auth0 dès qu'on arrive sur /login
    // this.login();
  }

  login() {
    this.auth.loginWithRedirect({
      appState: { target: '/' }, // où revenir après login
    });
  }
}
