import { defineStore } from 'pinia';
import userService from '@/services/userService';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        currentUser: null,
        loading: false,
        error: null,
        pagination: {
            count: 0,
            next: null,
            previous: null,
            page: 1,
            pageSize: 10,
            totalPages: 0
        },
        filters: {
            search: '',
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            groups: [],
            is_active: null,
            ordering: '-date_joined'
        }
    }),

    getters: {
        // Retorna todos os usuários
        getUsers: (state) => state.users || [],

        // Retorna o usuário atual
        getCurrentUser: (state) => state.currentUser,

        // Retorna usuários ativos
        getActiveUsers: (state) => (state.users || []).filter(user => user.is_active),

        // Retorna usuários inativos
        getInactiveUsers: (state) => (state.users || []).filter(user => !user.is_active),

        // Retorna o status de carregamento
        isLoading: (state) => state.loading,

        // Retorna o erro atual
        getError: (state) => state.error,

        // Retorna informações de paginação
        getPagination: (state) => state.pagination,

        // Retorna os filtros atuais
        getFilters: (state) => state.filters
    },

    actions: {
        // Atualiza os filtros
        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
            // Resetar para a primeira página ao alterar filtros
            this.pagination.page = 1;
        },

        // Atualiza a paginação
        updatePagination(newPagination) {
            this.pagination = { ...this.pagination, ...newPagination };
        },

        // Busca todos os usuários de uma vez (sem paginação)
        async fetchAllUsers() {
            this.error = null;
            try {
                // Buscar todos os usuários com um tamanho de página grande
                const params = {
                    page_size: 1000, // Um valor grande para pegar todos os usuários
                    ordering: '-created_at'
                };
                
                console.log('Buscando todos os usuários');
                const data = await userService.getUsers(params);
                
                // Atualizar usuários
                this.users = data.results || [];
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar usuários';
                this.users = [];
                throw error;
            }
        },

        // Carrega todos os usuários com filtros e paginação
        async fetchUsers(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                // Combinar filtros do estado com parâmetros adicionais
                const queryParams = {
                    ...this.filters,
                    page: this.pagination.page,
                    page_size: this.pagination.pageSize,
                    ...params
                };

                // Remover parâmetros vazios
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });

                console.log('Buscando usuários com parâmetros:', queryParams);
                const data = await userService.getUsers(queryParams);
                
                // Atualizar usuários e informações de paginação
                this.users = data.results || [];
                this.pagination = {
                    count: data.count || 0,
                    next: data.next,
                    previous: data.previous,
                    page: params.page || this.pagination.page,
                    pageSize: params.page_size || this.pagination.pageSize,
                    totalPages: Math.ceil((data.count || 0) / (params.page_size || this.pagination.pageSize))
                };
                
                return data;
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
                // Recarregar a lista após criar um novo usuário
                await this.fetchUsers();
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
                
                // Criar uma cópia para não modificar o objeto original
                const userDataCopy = { ...userData };
                
                // Remover campos vazios ou desnecessários
                if (!userDataCopy.password) {
                    delete userDataCopy.password;
                }
                if (userDataCopy.password2) {
                    delete userDataCopy.password2;
                }
                
                console.log('Store: Dados a serem enviados para API:', userDataCopy);
                
                const data = await userService.updateUser(id, userDataCopy);
                if (!data) {
                    console.error('Nenhum dado retornado da API após atualização');
                    return null;
                }
                
                console.log('Store: Dados retornados da API', data);
                
                // Atualizar o usuário na lista
                const index = this.users.findIndex(user => user.id === id);
                if (index !== -1) {
                    console.log('Store: Atualizando usuário no array', index);
                    this.users[index] = data;
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
                // Recarregar a lista após excluir um usuário
                await this.fetchUsers();
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
                
                if (this.currentUser && this.currentUser.id === id) {
                    this.currentUser.is_active = data.status;
                }
                
                const index = this.users.findIndex(user => user.id === id);
                if (index !== -1) {
                    this.users[index].is_active = data.status;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao alternar status do usuário';
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
            this.pagination = {
                count: 0,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
                totalPages: 0
            };
            this.filters = {
                search: '',
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                groups: [],
                is_active: null,
                ordering: '-date_joined'
            };
        }
    }
}); 