import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="settings-container">
      <h1>Settings</h1>
      <p>Settings page content goes here</p>
    </div>
  `,
  styles: `
    .settings-container {
      padding: 2rem;
    }
  `
})
export class SettingsComponent {}
