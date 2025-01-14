import { Component, computed, effect, inject, signal } from '@angular/core';
import { SettingsService, StellarAsset } from '../services/settings.service';
import { QrCodeService } from '../services/qrcode.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [QRCodeComponent],
  template: `
    <div class="payment-container">
      <div class="display">{{ displayValue() }} {{ currencySymbol() }}</div>

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

      @if (showQrCode()) {
      <div class="qr-overlay">
        <div class="qr-container">
          <qrcode
            [qrdata]="qrCodeValue()"
            [width]="256"
            [errorCorrectionLevel]="'M'"
          ></qrcode>
          <div class="qr-text">{{ qrCodeValue() }}</div>
          <div class="qr-actions">
            <button (click)="copyToClipboard()">Copy Payment Request</button>
            <button (click)="closeQrCode()">Close</button>
          </div>
        </div>
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

    .qr-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .qr-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
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
            margin-top: 1.5rem;
        }

        .qr-actions button {
            padding: 0.75rem 1.5rem;
            font-size: 1.1rem;
            min-width: 120px;
            border-radius: 8px;
        }
  `,
})
export class HomeComponent {
  private settingsService = inject(SettingsService);
  private qrCodeService = inject(QrCodeService);
  private clipboard = inject(Clipboard);

  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  input = signal('');
  // currency = signal<Currency>('EUR');
  showQrCode = signal(false);
  qrCodeValue = signal('');
  stellarAddress = signal('');
  asset = signal<StellarAsset>({ code: 'EURMTL', issuer: 'GCRCUE2C5TBNIPYHMEP7NK5RWTT2WBSZ75CMARH7GDOHDDCQH3XANFOB' });

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
      const paymentParams: any = {
        destination: this.stellarAddress(),
        amount: this.displayValue(),
        asset_code: this.asset().code,
        asset_issuer: this.asset().code === 'XLM' ? undefined : this.asset().issuer,
        memo: `Payment_${Date.now()}`,
        memo_type: 'MEMO_TEXT' as const,
      };

      this.qrCodeValue.set(
        this.qrCodeService.generateStellarPaymentUrl(paymentParams)
      );
      this.showQrCode.set(true);
    }
  }

  closeQrCode() {
    this.showQrCode.set(false);
    this.clear();
  }

  copyToClipboard() {
    this.clipboard.copy(this.qrCodeValue());
  }
}
