import { defineStore } from 'pinia';
import roleService from '@/services/roleService';

export const useRoleStore = defineStore('role', {
    state: () => ({
        roles: [],
        currentRole: null,
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
            name: '',
            ordering: 'name'
        }
    }),

    getters: {
        // Retorna todas as funções
        getRoles: (state) => state.roles || [],

        // Retorna a função atual
        getCurrentRole: (state) => state.currentRole,

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

        // Carrega todas as funções com filtros e paginação
        async fetchRoles(params = {}) {
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

                console.log('Buscando funções com parâmetros:', queryParams);
                const data = await roleService.getRoles(queryParams);
                
                // Atualizar funções e informações de paginação
                this.roles = data.results || [];
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
                this.error = error.response?.data?.detail || 'Erro ao carregar funções';
                this.roles = [];
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega uma função específica
        async fetchRole(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await roleService.getRole(id);
                if (!data) return null;
                
                this.currentRole = data;
                
                const index = this.roles.findIndex(role => role.id === id);
                if (index !== -1) {
                    this.roles[index] = data;
                } else {
                    this.roles.push(data);
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar função';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Cria uma nova função
        async createRole(roleData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await roleService.createRole(roleData);
                // Recarregar a lista após criar uma nova função
                await this.fetchRoles();
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao criar função';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza uma função existente
        async updateRole(id, roleData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await roleService.updateRole(id, roleData);
                if (!data) {
                    console.error('Nenhum dado retornado da API após atualização');
                    return null;
                }
                
                // Atualizar a função na lista
                const index = this.roles.findIndex(role => role.id === id);
                if (index !== -1) {
                    this.roles[index] = data;
                }
                
                // Se for a função atual, atualizar também
                if (this.currentRole && this.currentRole.id === id) {
                    this.currentRole = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atualizar função';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Remove uma função
        async deleteRole(id) {
            this.loading = true;
            this.error = null;
            try {
                await roleService.deleteRole(id);
                // Recarregar a lista após excluir uma função
                await this.fetchRoles();
                
                // Se for a função atual, limpar
                if (this.currentRole && this.currentRole.id === id) {
                    this.currentRole = null;
                }
                
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao excluir função';
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
            this.roles = [];
            this.currentRole = null;
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
                name: '',
                ordering: 'name'
            };
        }
    }
}); 