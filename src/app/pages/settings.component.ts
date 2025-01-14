import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h1>Settings</h1>
      
      <div class="form-group">
        <label for="stellarAddress">Stellar Address</label>
        <input
          id="stellarAddress"
          type="text"
          [(ngModel)]="stellarAddress"
          placeholder="Enter your Stellar address"
          (change)="saveStellarAddress()"
        />
        <p class="help-text">This address will be used to receive payments</p>
      </div>
    </div>
  `,
  styles: `
    .settings-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.5rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .help-text {
      color: #666;
      font-size: 0.875rem;
      margin: 0;
    }
  `
})
export class SettingsComponent implements OnInit {
  stellarAddress = '';

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getStellarAddress().subscribe(address => {
      this.stellarAddress = address;
    });
  }

  saveStellarAddress() {
    this.settingsService.setStellarAddress(this.stellarAddress);
  }
}
