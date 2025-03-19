import { defineStore } from 'pinia';
import clientService from '@/services/clientService';

/**
 * Store para gerenciar clientes
 */
export const useClientStore = defineStore('client', {
    state: () => ({
        clients: [],
        currentClient: null,
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
            document_type: '',
            document_number: '',
            email: '',
            phone: '',
            status: null,
            ordering: 'name'
        }
    }),

    getters: {
        /**
         * Obtém a lista de clientes
         * @returns {Array} - Lista de clientes
         */
        getClients: (state) => state.clients || [],

        /**
         * Obtém o cliente atual
         * @returns {Object|null} - Cliente atual
         */
        getCurrentClient: (state) => state.currentClient,

        /**
         * Retorna clientes ativos
         * @returns {Array} - Lista de clientes ativos
         */
        getActiveClients: (state) => (state.clients || []).filter(client => client.status),

        /**
         * Retorna clientes inativos
         * @returns {Array} - Lista de clientes inativos
         */
        getInactiveClients: (state) => (state.clients || []).filter(client => !client.status),

        /**
         * Verifica se está carregando
         * @returns {boolean} - Estado de carregamento
         */
        isLoading: (state) => state.loading,

        /**
         * Obtém o erro atual
         * @returns {Object|null} - Erro atual
         */
        getError: (state) => state.error,

        /**
         * Obtém a paginação
         * @returns {Object} - Informações de paginação
         */
        getPagination: (state) => state.pagination,

        /**
         * Retorna os filtros atuais
         * @returns {Object} - Filtros atuais
         */
        getFilters: (state) => state.filters
    },

    actions: {
        /**
         * Atualiza os filtros
         * @param {Object} newFilters - Novos filtros
         */
        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
            // Resetar para a primeira página ao alterar filtros
            this.pagination.page = 1;
        },

        /**
         * Atualiza a paginação
         * @param {Object} newPagination - Novas informações de paginação
         */
        updatePagination(newPagination) {
            this.pagination = { ...this.pagination, ...newPagination };
        },

        /**
         * Busca todos os clientes de uma vez (sem paginação)
         */
        async fetchAllClients() {
            this.error = null;
            try {
                // Buscar todos os clientes com um tamanho de página grande
                const params = {
                    page_size: 1000, // Um valor grande para pegar todos os clientes
                    ordering: 'name'
                };
                
                console.log('Buscando todos os clientes');
                const data = await clientService.getClients(params);
                
                // Atualizar clientes
                this.clients = data.results || [];
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar clientes';
                this.clients = [];
                throw error;
            }
        },

        /**
         * Busca a lista de clientes
         * @param {Object} params - Parâmetros de paginação e filtros
         */
        async fetchClients(params = {}) {
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

                console.log('Buscando clientes com parâmetros:', queryParams);
                const data = await clientService.getClients(queryParams);
                
                // Atualizar clientes e informações de paginação
                this.clients = data.results || [];
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
                this.error = error.response?.data?.detail || 'Erro ao carregar clientes';
                this.clients = [];
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Busca um cliente pelo ID
         * @param {number} id - ID do cliente
         */
        async fetchClient(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await clientService.getClient(id);
                if (!data) return null;
                
                this.currentClient = data;
                
                const index = this.clients.findIndex(client => client.id === id);
                if (index !== -1) {
                    this.clients[index] = data;
                } else {
                    this.clients.push(data);
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar cliente';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Cria um novo cliente
         * @param {Object} clientData - Dados do cliente a ser criado
         * @returns {Object} - Cliente criado
         */
        async createClient(clientData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await clientService.createClient(clientData);
                // Recarregar a lista após criar um novo cliente
                await this.fetchClients();
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao criar cliente';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Atualiza um cliente existente
         * @param {number} id - ID do cliente
         * @param {Object} clientData - Dados atualizados do cliente
         * @returns {Object} - Cliente atualizado
         */
        async updateClient(id, clientData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await clientService.updateClient(id, clientData);
                if (!data) {
                    console.error('Nenhum dado retornado da API após atualização');
                    return null;
                }
                
                // Atualizar o cliente na lista
                const index = this.clients.findIndex(client => client.id === id);
                if (index !== -1) {
                    this.clients[index] = data;
                }
                
                // Se for o cliente atual, atualizar também
                if (this.currentClient && this.currentClient.id === id) {
                    this.currentClient = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atualizar cliente';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Exclui um cliente
         * @param {number} id - ID do cliente a ser excluído
         */
        async deleteClient(id) {
            this.loading = true;
            this.error = null;
            try {
                await clientService.deleteClient(id);
                // Recarregar a lista após excluir um cliente
                await this.fetchClients();
                
                // Se for o cliente atual, limpar
                if (this.currentClient && this.currentClient.id === id) {
                    this.currentClient = null;
                }
                
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao excluir cliente';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Alterna o status do cliente (ativo/inativo)
         * @param {number} id - ID do cliente
         */
        async toggleStatus(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await clientService.toggleStatus(id);
                if (!data) return null;
                
                // Atualizar o cliente na lista
                const index = this.clients.findIndex(client => client.id === id);
                if (index !== -1) {
                    this.clients[index] = data;
                }
                
                // Se for o cliente atual, atualizar também
                if (this.currentClient && this.currentClient.id === id) {
                    this.currentClient = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao alternar status do cliente';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        /**
         * Limpa os erros
         */
        clearError() {
            this.error = null;
        },

        /**
         * Reseta o estado
         */
        resetState() {
            this.clients = [];
            this.currentClient = null;
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
                document_type: '',
                document_number: '',
                email: '',
                phone: '',
                status: null,
                ordering: 'name'
            };
        }
    }
}); 