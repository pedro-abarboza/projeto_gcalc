import { defineStore } from 'pinia';
import userService from '@/services/userService';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        currentUser: null,
        loading: false,
        error: null
    }),

    getters: {
        // Retorna todos os usuários
        getUsers: (state) => state.users || [],

        // Retorna o usuário atual
        getCurrentUser: (state) => state.currentUser,

        // Retorna usuários ativos
        getActiveUsers: (state) => (state.users || []).filter(user => user.status),

        // Retorna usuários inativos
        getInactiveUsers: (state) => (state.users || []).filter(user => !user.status),

        // Retorna o status de carregamento
        isLoading: (state) => state.loading,

        // Retorna o erro atual
        getError: (state) => state.error
    },

    actions: {
        // Carrega todos os usuários
        async fetchUsers() {
            this.loading = true;
            this.error = null;
            try {
                const data = await userService.getUsers();
                // Garantir que data seja um array
                this.users = Array.isArray(data) ? data : [];
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar usuários';
                this.users = [];
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega um usuário específico
        async fetchUser(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await userService.getUser(id);
                if (!data) return null;
                
                const index = this.users.findIndex(user => user.id === id);
                if (index !== -1) {
                    this.users[index] = data;
                } else {
                    this.users.push(data);
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar usuário';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Cria um novo usuário
        async createUser(userData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await userService.createUser(userData);
                if (data && this.users) {
                    this.users.push(data);
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao criar usuário';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza um usuário existente
        async updateUser(id, userData) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Store: Atualizando usuário', id, userData);
                const data = await userService.updateUser(id, userData);
                if (!data) {
                    console.error('Nenhum dado retornado da API após atualização');
                    return null;
                }
                
                console.log('Store: Dados retornados da API', data);
                const index = this.users.findIndex(user => user.id === id);
                if (index !== -1) {
                    console.log('Store: Atualizando usuário no array', index);
                    this.users[index] = data;
                } else {
                    console.warn('Store: Usuário não encontrado no array, adicionando');
                    this.users.push(data);
                }
                return data;
            } catch (error) {
                console.error('Store: Erro ao atualizar usuário', error);
                this.error = error.response?.data?.detail || 'Erro ao atualizar usuário';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Remove um usuário
        async deleteUser(id) {
            this.loading = true;
            this.error = null;
            try {
                await userService.deleteUser(id);
                this.users = this.users.filter(user => user.id !== id);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao excluir usuário';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Altera a senha de um usuário
        async changePassword(id, passwordData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await userService.changePassword(id, passwordData);
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao alterar senha';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Alternar status do usuário (ativo/inativo)
        async toggleStatus(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await userService.toggleStatus(id);
                if (!data) return null;
                
                const index = this.users.findIndex(user => user.id === id);
                if (index !== -1) {
                    this.users[index] = data;
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao alterar status do usuário';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega o perfil do usuário logado
        async fetchProfile() {
            this.loading = true;
            this.error = null;
            try {
                const data = await userService.getProfile();
                this.currentUser = data;
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar perfil';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza o perfil do usuário logado
        async updateProfile(userData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await userService.updateProfile(userData);
                this.currentUser = data;
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atualizar perfil';
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
            this.users = [];
            this.currentUser = null;
            this.loading = false;
            this.error = null;
        }
    }
}); 