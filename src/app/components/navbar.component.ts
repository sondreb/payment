import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav>
      <div class="logo">
        <img src="/icons/icon-512x512.png" alt="Payment Logo" />
      </div>
      <div class="links">
        <a
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Payment</a
        >
        <a routerLink="/history" routerLinkActive="active">History</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </div>
      <div class="flex-spacer"></div>
      <button *ngIf="deferredPrompt" class="install-btn" (click)="installApp()">
        <i class="fas fa-download"></i>
        Install App
      </button>
    </nav>
  `,
  styles: `
    nav {
      display: flex;
      align-items: center;
      padding: 1rem;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo {
      height: 40px;
    }
    .logo img {
      height: 100%;
    }
    .links {
      margin-left: 2rem;
    }
    .links a {
      color: #2B4E61;
      text-decoration: none;
      margin-right: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 4px;
    }
    .links a.active {
      background-color: #E2F1F8;
    }
    .flex-spacer {
      flex: 1;
    }

    .install-button {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .install-button:hover {
      transform: scale(1.05);
      background-color: #0056b3;
    }
  `,
})
export class NavbarComponent {
  deferredPrompt: any = null;

  constructor() {}

  async installApp() {
    if (!this.deferredPrompt) return;

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await this.deferredPrompt.userChoice;

    // We no longer need the prompt
    this.deferredPrompt = null;
  }
}
