import { PaymentValidatorService } from "../../services/payment-validator.service";
import { PaymentHistoryService } from "../../services/payment-history.service";

export class PaymentComponent {
  // ...existing code...

  constructor(
    private paymentValidator: PaymentValidatorService,
    private paymentHistory: PaymentHistoryService  // Add this service
  ) {
    this.paymentValidator.validationStatus$.subscribe(status => {
      if (status?.isPaid) {
        // Update payment history with transaction ID
        this.paymentHistory.updatePaymentStatus(status.memo, true, status.transactionId);
        this.showQR = false;
        this.showSuccess = true;
      }
    });
  }

  // ...existing code...
}
