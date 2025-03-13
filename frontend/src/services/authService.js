import api from './api';

export const authService = {
    async login(username, password) {
        try {
            const response = await api.post('/token/', { username, password });
            const { access, refresh } = response.data;
            
            localStorage.setItem('token', access);
            localStorage.setItem('refreshToken', refresh);
            
            return await this.getCurrentUser();
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Erro ao fazer login');
        }
    },

    async getCurrentUser() {
        try {
            const response = await api.get('/users/me/');
            const user = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            throw new Error('Erro ao obter dados do usuário');
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await api.post('/token/refresh/', { refresh: refreshToken });
            const { access } = response.data;
            localStorage.setItem('token', access);
            return access;
        } catch (error) {
            this.logout();
            throw new Error('Erro ao renovar o token');
        }
    }
}; 