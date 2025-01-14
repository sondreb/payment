import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { UpdateNotificationComponent } from './components/update-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, UpdateNotificationComponent],
  template: `
    <app-update-notification></app-update-notification>
    <app-navbar />
    <router-outlet />
  `,
  styles: ``,
})
export class AppComponent {}
