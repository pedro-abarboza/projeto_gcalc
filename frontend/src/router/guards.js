import { useAuthStore } from '@/stores/auth';

export function authGuard(to, from, next) {
    const publicPages = ['/auth/login'];
    const requiresAuth = !publicPages.includes(to.path);
    const authStore = useAuthStore();

    if (requiresAuth && !authStore.isAuthenticated) {
        return next({
            path: '/auth/login',
            query: { returnUrl: to.fullPath }
        });
    }

    next();
} 