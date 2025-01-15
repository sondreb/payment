import { Component, computed, effect, inject, signal } from '@angular/core';
import { SettingsService, StellarAsset } from '../services/settings.service';
import { QrCodeService } from '../services/qrcode.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { Clipboard } from '@angular/cdk/clipboard';
import { PaymentHistoryService } from '../services/payment-history.service';
import { PaymentValidatorService } from '../services/payment-validator.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [QRCodeComponent],
  template: `
    <div class="payment-container">
      <div class="display">{{ displayValue() }} {{ currencySymbol() }}</div>

      @if (!showQrCode()) {
        <div class="numpad">
          @for(num of numbers; track num) {
            <button (click)="addNumber(num)">{{ num }}</button>
          }
          <button (click)="addNumber('00')">00</button>
          <button (click)="clear()">C</button>
          <button class="pay-button" [disabled]="!canPay()" (click)="pay()">
            Pay
          </button>
        </div>
      } @else {
        <div class="qr-container">
          <qrcode
            [qrdata]="qrCodeValue()"
            [width]="256"
            [errorCorrectionLevel]="'M'"
          ></qrcode>
          <div class="payment-status" [class]="paymentStatus()">
            @if (paymentStatus() === 'pending') {
              Waiting for payment...
            } @else if (paymentStatus() === 'paid') {
              Payment confirmed! ✓
            }
          </div>
          <div class="qr-actions">
            <button (click)="copyToClipboard()">Copy Payment Request</button>
            <button (click)="closeQrCode()">New Payment</button>
          </div>
          <div class="qr-text">{{ qrCodeValue() }}</div>
        </div>
      }
    </div>
  `,
  styles: `
    .payment-container {
      padding: 2rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .display {
      background-color: white;
      padding: 1rem;
      font-size: 2rem;
      text-align: right;
      border-radius: 8px;
      margin-bottom: 1rem;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .numpad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    button {
      padding: 1.5rem;
      font-size: 1.5rem;
      border: none;
      border-radius: 8px;
      background-color: white;
      color: #2B4E61;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    button:hover {
      background-color: #f0f0f0;
    }

    button:active {
      background-color: #e0e0e0;
    }

    button.pay-button {
      background-color: #007bff;
      color: white;
      grid-column: span 3;
    }

    button.pay-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .qr-container {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .qr-text {
      font-size: 0.75rem;
      color: #666;
      margin: 1rem 0;
      word-break: break-all;
      padding: 0 1rem;
    }

    .qr-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1rem;
    }

    .qr-actions button {
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
      min-width: 120px;
      border-radius: 8px;
      background-color: white;
    }

    .qr-actions button:last-child {
      background-color: #007bff;
      color: white;
    }

    .payment-status {
      margin: 1rem 0;
      padding: 0.5rem;
      border-radius: 4px;
      font-weight: 500;
    }

    .payment-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .payment-status.paid {
      background: #d4edda;
      color: #155724;
    }
  `
})
export class HomeComponent {
  private settingsService = inject(SettingsService);
  private qrCodeService = inject(QrCodeService);
  private clipboard = inject(Clipboard);
  private historyService = inject(PaymentHistoryService);
  private validatorService = inject(PaymentValidatorService);

  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  input = signal('');
  showQrCode = signal(false);
  qrCodeValue = signal('');
  stellarAddress = signal('');
  asset = signal<StellarAsset>({ 
    code: 'EURMTL', 
    issuer: SettingsService.EURMTL_ISSUER 
  });
  paymentStatus = signal<'pending' | 'paid' | null>(null);

  displayValue = computed(() => {
    const value = this.input() === '' ? 0 : parseFloat(this.input()) / 100;
    return value.toFixed(2);
  });

  currencySymbol = computed(() => {
    return this.asset().code;
  });

  canPay = computed(() => {
    return parseFloat(this.input()) > 0;
  });

  constructor() {
    effect(() => {
      this.settingsService.getAsset().subscribe(asset => {
        this.asset.set(asset);
      });

      this.settingsService.getStellarAddress().subscribe(address => {
        this.stellarAddress.set(address);
      });

      this.validatorService.validationStatus$.subscribe(status => {
        if (status?.isPaid) {
          this.paymentStatus.set('paid');
          this.historyService.updatePaymentStatus(status.memo, true);
        } else if (status) {
          this.paymentStatus.set('pending');
        } else {
          this.paymentStatus.set(null);
        }
      });
    });
  }

  addNumber(num: string) {
    if (this.input().length < 10) {
      this.input.set(this.input() + num);
    }
  }

  clear() {
    this.input.set('');
  }

  async pay() {
    if (this.canPay()) {
      const memo = `Payment_${Date.now()}`;
      const paymentParams: any = {
        destination: this.stellarAddress(),
        amount: this.displayValue(),
        asset_code: this.asset().code,
        asset_issuer: this.asset().code === 'XLM' ? undefined : this.asset().issuer,
        memo,
        memo_type: 'MEMO_TEXT' as const,
      };

      const paymentUrl = this.qrCodeService.generateStellarPaymentUrl(paymentParams);
      this.qrCodeValue.set(paymentUrl);
      
      // Save to history
      this.historyService.addPayment({
        id: Date.now().toString(),
        amount: this.displayValue(),
        assetCode: this.asset().code,
        destination: this.stellarAddress(),
        timestamp: Date.now(),
        paymentUrl,
        memo,
        isPaid: false
      });

      // Start payment validation
      this.validatorService.startValidation({
        memo,
        expectedAmount: this.displayValue(),
        assetCode: this.asset().code,
        destination: this.stellarAddress()
      });

      this.showQrCode.set(true);
    }
  }

  closeQrCode() {
    this.showQrCode.set(false);
    this.clear();
    this.validatorService.stopValidation();
  }

  copyToClipboard() {
    this.clipboard.copy(this.qrCodeValue());
  }
}
