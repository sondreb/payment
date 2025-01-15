import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentHistoryService, PaymentRecord } from '../services/payment-history.service';
import { PaymentValidatorService } from '../services/payment-validator.service';
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
                <div class="payment-status">
                  @if (payment.isPaid) {
                    <span class="status-icon success">✓</span>
                  } @else {
                    <button class="check-status-btn" (click)="checkPaymentStatus(payment)">
                      Check Status
                    </button>
                  }
                </div>
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

    .payment-status {
      display: flex;
      align-items: center;
      margin-top: 0.5rem;
    }

    .status-icon.success {
      color: #2ecc71;
      font-size: 1.5rem;
    }

    .check-status-btn {
      padding: 0.5rem 1rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background-color 0.3s;

      &:hover {
        background-color: #2980b9;
      }
    }
  `]
})
export class HistoryComponent {
  private historyService = inject(PaymentHistoryService);
  private paymentValidator = inject(PaymentValidatorService);
  private clipboard = inject(Clipboard);
  
  history$ = this.historyService.getHistory();

  copyPaymentUrl(url: string) {
    this.clipboard.copy(url);
  }

  checkPaymentStatus(payment: PaymentRecord) {
    this.paymentValidator.startValidation({
      memo: payment.memo,
      expectedAmount: payment.amount,
      assetCode: payment.assetCode,
      destination: payment.destination
    });

    this.paymentValidator.validationStatus$.subscribe(status => {
      if (status?.isPaid) {
        this.historyService.updatePaymentStatus(payment.memo, true);
      }
    });
  }
}
