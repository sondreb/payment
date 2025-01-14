import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentHistoryService } from '../services/payment-history.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  template: `
    <div class="history-container">
      <h1>Payment History</h1>
      
      @if ((history$ | async)?.length) {
        <div class="history-list">
          @for (payment of history$ | async; track payment.id) {
            <div class="payment-card">
              <div class="payment-info">
                <div class="amount">{{ payment.amount }} {{ payment.assetCode }}</div>
                <div class="timestamp">{{ payment.timestamp | date:'medium' }}</div>
                <div class="destination">To: {{ payment.destination }}</div>
              </div>
              <div class="payment-actions">
                <qrcode [qrdata]="payment.paymentUrl" [width]="128" [errorCorrectionLevel]="'M'"></qrcode>
                <button (click)="copyPaymentUrl(payment.paymentUrl)">Copy Payment URL</button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          No payment history available
        </div>
      }
    </div>
  `,
  styles: [`
    .history-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .payment-card {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-info {
      flex: 1;
    }

    .amount {
      font-size: 1.5rem;
      font-weight: 500;
      color: #2B4E61;
    }

    .timestamp {
      color: #666;
      font-size: 0.875rem;
      margin: 0.5rem 0;
    }

    .destination {
      font-family: monospace;
      word-break: break-all;
    }

    .payment-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class HistoryComponent {
  private historyService = inject(PaymentHistoryService);
  private clipboard = inject(Clipboard);
  
  history$ = this.historyService.getHistory();

  copyPaymentUrl(url: string) {
    this.clipboard.copy(url);
  }
}
