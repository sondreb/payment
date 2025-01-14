import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Currency = 'EUR' | 'USD';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STELLAR_ADDRESS_KEY = 'payment-stellar-address';
  private readonly CURRENCY_KEY = 'payment-currency';

  private stellarAddressSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.STELLAR_ADDRESS_KEY) || ''
  );

  private currencySubject = new BehaviorSubject<Currency>(
    (localStorage.getItem(this.CURRENCY_KEY) as Currency) || 'EUR'
  );

  getStellarAddress() {
    return this.stellarAddressSubject.asObservable();
  }

  setStellarAddress(address: string) {
    localStorage.setItem(this.STELLAR_ADDRESS_KEY, address);
    this.stellarAddressSubject.next(address);
  }

  getCurrency() {
    return this.currencySubject.asObservable();
  }

  setCurrency(currency: Currency) {
    localStorage.setItem(this.CURRENCY_KEY, currency);
    this.currencySubject.next(currency);
  }
}
