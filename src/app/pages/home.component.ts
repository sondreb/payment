import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, Currency } from '../services/settings.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-container">
      <div class="display">{{ displayValue }} {{ currencySymbol }}</div>
      
      <div class="numpad">
        <button *ngFor="let num of numbers" (click)="addNumber(num)">{{ num }}</button>
        <button (click)="addNumber('00')">00</button>
        <button (click)="clear()">C</button>
        <button class="pay-button" [disabled]="!canPay" (click)="pay()">Pay</button>
      </div>
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
  `
})
export class HomeComponent implements OnInit {
  numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  input = '';
  currency: Currency = 'EUR';
  
  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.settingsService.getCurrency().subscribe(currency => {
      this.currency = currency;
    });
  }

  get displayValue(): string {
    const value = parseFloat(this.input) / 100;
    return value.toFixed(2);
  }

  get currencySymbol(): string {
    return this.currency === 'EUR' ? '€' : '$';
  }

  get canPay(): boolean {
    return parseFloat(this.input) > 0;
  }

  addNumber(num: string) {
    if (this.input.length < 10) {
      this.input += num;
    }
  }

  clear() {
    this.input = '';
  }

  pay() {
    if (this.canPay) {
      // TODO: Implement payment processing
      console.log(`Processing payment of ${this.displayValue} ${this.currency}`);
      this.clear();
    }
  }
}
