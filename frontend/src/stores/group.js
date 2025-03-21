import { defineStore } from 'pinia';
import groupService from '@/services/groupService';

export const useGroupStore = defineStore('group', {
    state: () => ({
        groups: [],
        currentGroup: null,
        permissions: [],
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
        // Retorna todos os grupos
        getGroups: (state) => state.groups || [],

        // Retorna o grupo atual
        getCurrentGroup: (state) => state.currentGroup,

        // Retorna todas as permissões
        getPermissions: (state) => state.permissions || [],

        // Retorna permissões agrupadas por app_label e model
        getGroupedPermissions: (state) => {
            const grouped = {};
            
            if (!state.permissions) return grouped;
            
            state.permissions.forEach(permission => {
                const appLabel = permission.content_type_name.split('.')[0];
                const model = permission.content_type_name.split('.')[1];
                
                if (!grouped[appLabel]) {
                    grouped[appLabel] = {};
                }
                
                if (!grouped[appLabel][model]) {
                    grouped[appLabel][model] = [];
                }
                
                grouped[appLabel][model].push(permission);
            });
            
            return grouped;
        },

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

        // Carrega todos os grupos com filtros e paginação
        async fetchGroups(params = {}) {
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

                console.log('Buscando grupos com parâmetros:', queryParams);
                const data = await groupService.getGroups(queryParams);
                
                // Atualizar grupos e informações de paginação
                this.groups = data.results || [];
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
                this.error = error.response?.data?.detail || 'Erro ao carregar grupos';
                this.groups = [];
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega um grupo específico
        async fetchGroup(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await groupService.getGroup(id);
                if (!data) return null;
                
                this.currentGroup = data;
                
                const index = this.groups.findIndex(group => group.id === id);
                if (index !== -1) {
                    this.groups[index] = data;
                } else {
                    this.groups.push(data);
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar grupo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Cria um novo grupo
        async createGroup(groupData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await groupService.createGroup(groupData);
                // Recarregar a lista após criar um novo grupo
                await this.fetchGroups();
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao criar grupo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza um grupo existente
        async updateGroup(id, groupData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await groupService.updateGroup(id, groupData);
                if (!data) {
                    console.error('Nenhum dado retornado da API após atualização');
                    return null;
                }
                
                // Atualizar o grupo na lista
                const index = this.groups.findIndex(group => group.id === id);
                if (index !== -1) {
                    this.groups[index] = data;
                }
                
                // Se for o grupo atual, atualizar também
                if (this.currentGroup && this.currentGroup.id === id) {
                    this.currentGroup = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atualizar grupo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Remove um grupo
        async deleteGroup(id) {
            this.loading = true;
            this.error = null;
            try {
                await groupService.deleteGroup(id);
                // Recarregar a lista após excluir um grupo
                await this.fetchGroups();
                
                // Se for o grupo atual, limpar
                if (this.currentGroup && this.currentGroup.id === id) {
                    this.currentGroup = null;
                }
                
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao excluir grupo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega todas as permissões disponíveis
        async fetchPermissions(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Buscando permissões com parâmetros:', params);
                const data = await groupService.getPermissions(params);
                
                this.permissions = data.results || data;
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar permissões';
                this.permissions = [];
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
            this.groups = [];
            this.currentGroup = null;
            this.permissions = [];
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