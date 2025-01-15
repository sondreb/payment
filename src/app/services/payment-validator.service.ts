import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export interface PaymentValidation {
  memo: string;
  expectedAmount: string;
  assetCode: string;
  destination: string;
  isPaid: boolean;
  checkCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentValidatorService {
  private readonly HORIZON_API = 'https://horizon.stellar.org';
  private readonly CHECK_INTERVAL = 5000; // 5 seconds
  private readonly MAX_CHECKS = 360; // 30 minutes total (360 * 5 seconds)

  private activeValidations = new Map<string, Subscription>();
  private validationStatus = new BehaviorSubject<PaymentValidation | null>(null);
  validationStatus$ = this.validationStatus.asObservable();

  startValidation(params: Omit<PaymentValidation, 'isPaid' | 'checkCount'>) {
    console.log('Starting payment validation with params:', params);
    const validation: PaymentValidation = {
      ...params,
      isPaid: false,
      checkCount: 0
    };

    // Stop any existing validation
    this.stopValidation();

    // Start new validation
    const sub = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.checkPayment(validation);
    });

    this.activeValidations.set(params.memo, sub);
    this.validationStatus.next(validation);
  }

  stopValidation() {
    console.log('Stopping payment validation');
    this.activeValidations.forEach(sub => sub.unsubscribe());
    this.activeValidations.clear();
    this.validationStatus.next(null);
  }

  private normalizeAmount(amount: string): string {
    // Convert to number and back to string to remove trailing zeros
    return Number(amount).toString();
  }

  private async checkPayment(validation: PaymentValidation) {
    console.log(`Checking payment (attempt ${validation.checkCount + 1}/${this.MAX_CHECKS}):`, validation);

    if (validation.checkCount >= this.MAX_CHECKS) {
      console.log('Maximum check attempts reached, stopping validation');
      this.stopValidation();
      return;
    }

    try {
      const url = `${this.HORIZON_API}/accounts/${validation.destination}/payments?limit=10&order=desc`;
      console.log('Fetching payments from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received payments data:', data);
      
      console.log('Looking for payment with criteria:', {
        memo: validation.memo,
        amount: validation.expectedAmount,
        assetCode: validation.assetCode
      });

      // Look for matching payment in recent transactions
      const matchingPayment = data._embedded.records.find((tx: any) => {
        console.log('Checking transaction:', {
          memo: tx.transaction_memo,
          amount: tx.amount,
          normalized_amount: this.normalizeAmount(tx.amount),
          expected_amount: validation.expectedAmount,
          normalized_expected: this.normalizeAmount(validation.expectedAmount),
          asset_type: tx.asset_type,
          asset_code: tx.asset_code
        });
        
        const memoMatches = tx.transaction_memo === validation.memo;
        const amountMatches = this.normalizeAmount(tx.amount) === this.normalizeAmount(validation.expectedAmount);
        const assetMatches = validation.assetCode === 'XLM' ? 
          tx.asset_type === 'native' : 
          tx.asset_code === validation.assetCode;
        
        console.log('Match results:', {
          memoMatches,
          amountMatches,
          assetMatches
        });

        return memoMatches && amountMatches && assetMatches;
      });

      if (matchingPayment) {
        console.log('Found matching payment:', matchingPayment);
        validation.isPaid = true;
        this.validationStatus.next(validation);
        this.stopValidation();
        return;
      }

      console.log('No matching payment found');
      validation.checkCount++;
      this.validationStatus.next({ ...validation });

    } catch (error) {
      console.error('Payment validation error:', error);
      // Continue checking despite errors
    }
  }
}
