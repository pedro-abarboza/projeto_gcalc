import { defineStore } from 'pinia';
import { authService } from '@/services/authService';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null
    }),

    getters: {
        // Retorna o usuário autenticado
        getCurrentUser: (state) => state.user,

        // Retorna o token de autenticação
        getToken: (state) => state.token,

        // Verifica se o usuário está autenticado
        isAuthenticated: (state) => !!state.token,

        // Retorna o status de carregamento
        isLoading: (state) => state.loading,

        // Retorna o erro atual
        getError: (state) => state.error
    },

    actions: {
        // Realiza o login do usuário
        async login(credentials) {
            this.loading = true;
            this.error = null;
            try {
                const { token, user } = await authService.login(credentials);
                this.token = token;
                this.user = user;
                localStorage.setItem('token', token);
                return { token, user };
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao realizar login';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Realiza o logout do usuário
        async logout() {
            this.loading = true;
            this.error = null;
            try {
                // Importar userStore dinamicamente para evitar dependência circular
                const { useUserStore } = await import('@/stores/user');
                const userStore = useUserStore();
                
                await authService.logout();
                this.token = null;
                this.user = null;
                localStorage.removeItem('token');
                
                // Limpar os dados do usuário no userStore
                userStore.clearUserData();
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao realizar logout';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega o perfil do usuário autenticado
        async loadProfile() {
            this.loading = true;
            this.error = null;
            try {
                const user = await authService.getProfile();
                this.user = user;
                return user;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar perfil';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza o perfil do usuário
        async updateProfile(userData) {
            this.loading = true;
            this.error = null;
            try {
                const user = await authService.updateProfile(userData);
                this.user = user;
                return user;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atualizar perfil';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Altera a senha do usuário
        async changePassword(passwordData) {
            this.loading = true;
            this.error = null;
            try {
                await authService.changePassword(passwordData);
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao alterar senha';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Limpa os erros
        clearError() {
            this.error = null;
        },

        // Reset do estado
        resetState() {
            this.user = null;
            this.token = null;
            this.loading = false;
            this.error = null;
        }
    }
}); 