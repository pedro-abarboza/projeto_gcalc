import api from './api';

export const authService = {
    async login(credentials) {
        try {
            const response = await api.post('/token/', credentials);
            const { access, refresh } = response.data;
            
            localStorage.setItem('token', access);
            localStorage.setItem('refreshToken', refresh);
            
            // Obter dados do usuário
            const userResponse = await api.get('/users/me/');
            const user = userResponse.data;
            
            return { token: access, user };
        } catch (error) {
            throw error;
        }
    },

    async getProfile() {
        try {
            const response = await api.get('/users/me/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async updateProfile(userData) {
        try {
            const response = await api.put('/users/me/', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async changePassword(passwordData) {
        try {
            const response = await api.post('/users/change-password/', passwordData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getToken() {
        return localStorage.getItem('token');
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
            throw error;
        }
    }
}; 