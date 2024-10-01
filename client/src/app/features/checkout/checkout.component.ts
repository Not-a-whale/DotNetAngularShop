import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { MatStep, MatStepper, MatStepperNext } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { StripeService } from '../../core/services/stripe.service';
import { StripeAddressElement } from '@stripe/stripe-js';
import { SnackbarService } from '../../core/services/snackbar.service';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AccountService } from '../../core/services/account.service';
import { firstValueFrom } from 'rxjs';
import { Address } from '../../shared/models/user';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    OrderSummaryComponent,
    MatStepper,
    MatStep,
    RouterLink,
    MatButton,
    MatStepperNext,
    MatCheckboxModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  addressElement?: StripeAddressElement;
  saveAddress = false;
  private accountService = inject(AccountService);
  private snackbar = inject(SnackbarService);
  private stripeService = inject(StripeService);

  async ngOnInit() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      this.addressElement.mount('#address-element');
    } catch (error) {}
  }

  async onStepChange(event: StepperSelectionEvent) {
    if (event.selectedIndex === 1) {
      if (this.saveAddress) {
        const address = await this.getAddressFromStripeAddress();
        if (address) {
          firstValueFrom(this.accountService.updateAddress(address));
        }
      }
    }
  }

  ngOnDestroy() {
    this.stripeService.disposeElements();
  }

  onSaveAddressCheckboxChange($event: MatCheckboxChange) {
    this.saveAddress = $event.checked;
  }

  private async getAddressFromStripeAddress(): Promise<Address | null> {
    const result = await this.addressElement?.getValue();
    const address = result?.value.address;

    if (address) {
      return {
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
      };
    } else {
      return null;
    }
  }
}
