import { authService } from '@/services/authService';

export function authGuard(to, from, next) {
    const publicPages = ['/auth/login'];
    const authRequired = !publicPages.includes(to.path);

    if (authRequired && !authService.isAuthenticated()) {
        return next({
            path: '/auth/login',
            query: { returnUrl: to.fullPath }
        });
    }

    next();
} 