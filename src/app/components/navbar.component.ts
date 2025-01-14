import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav>
      <div class="logo">
        <img src="/icons/icon-512x512.png" alt="Payment Logo" />
      </div>
      <div class="links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Payment</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
      </div>
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
  `
})
export class NavbarComponent {}
