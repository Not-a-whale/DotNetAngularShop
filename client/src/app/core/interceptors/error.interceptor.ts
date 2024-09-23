import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 400) {
        const modelStateErrors = [];
        for (const key in error.error.errors) {
          if (error.error.errors[key]) {
            modelStateErrors.push(error.error.errors[key]);
          } else {
            snackbar.error(error.error.title || error.error);
          }
        }
        throw modelStateErrors.flat();
      }
      if (error.status === 404) {
        router.navigateByUrl('/not-found');
      }
      if (error.status === 500) {
        const navigationExtras = { state: { error: error.error } };
        router.navigateByUrl('/server-error', navigationExtras);
      }
      return throwError(() => error);
    }),
  );
};
