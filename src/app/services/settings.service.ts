import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STELLAR_ADDRESS_KEY = 'payment-stellar-address';
  private stellarAddressSubject = new BehaviorSubject<string>(
    localStorage.getItem(this.STELLAR_ADDRESS_KEY) || ''
  );

  getStellarAddress() {
    return this.stellarAddressSubject.asObservable();
  }

  setStellarAddress(address: string) {
    localStorage.setItem(this.STELLAR_ADDRESS_KEY, address);
    this.stellarAddressSubject.next(address);
  }
}
