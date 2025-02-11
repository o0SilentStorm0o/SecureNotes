/**
 * @file auth.guard.ts
 * @brief Guard that restricts route access to authenticated users only.
 */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';

/**
 * @class AuthGuard
 * @brief Prevents unauthorized access to specific routes if the user is not logged in.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  /**
   * @brief Constructor injecting AuthService and Router.
   * @param authService The authentication service.
   * @param router Angular router for redirections.
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * @function canActivate
   * @brief Determines whether a route can be activated based on user login status.
   * @param route Activated route snapshot.
   * @param state Router state snapshot.
   * @return True if user is logged in, otherwise redirects to '/login'.
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.getUserId()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
