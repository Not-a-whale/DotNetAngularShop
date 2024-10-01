import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AccountService } from '../services/account.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.currentUser()) {
    return true;
  } else {
    return accountService.getAuthState().pipe(
      map((response) => {
        if (response.isAuthenticated) {
          return true;
        } else {
          router.navigate(['/account/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
      }),
    );
  }
};
