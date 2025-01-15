import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateService } from '../services/update.service';
import { PwaService } from '../services/pwa.service';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showUpdate" class="update-notification">
      <span>A new version is available!</span>
      <button (click)="updateNow()">Update Now</button>
    </div>
  `,
  styles: `
    .update-notification {
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      background-color: #2c3e50;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
      font-weight: 500;
    }

    @keyframes slideUp {
      from {
        transform: translate(-50%, 100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }

    button {
      padding: 0.5rem 1rem;
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    button:hover {
      background-color: #4338ca;
      transform: translateY(-1px);
    }

    button:active {
      transform: translateY(0);
    }
  `
})
export class UpdateNotificationComponent {
  constructor(public updateService: UpdateService) {}

  updateApp() {
    this.updateService.updateApplication();
  }
}
