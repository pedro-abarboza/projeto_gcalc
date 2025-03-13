import { defineStore } from 'pinia';
import { clientService } from '@/services/clientService';

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
            page: 1,
            pageSize: 10,
            totalItems: 0
        }
    }),

    getters: {
        /**
         * Obtém a lista de clientes
         * @returns {Array} - Lista de clientes
         */
        getClients: (state) => state.clients,

        /**
         * Obtém o cliente atual
         * @returns {Object|null} - Cliente atual
         */
        getCurrentClient: (state) => state.currentClient,

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
        getPagination: (state) => state.pagination
    },

    actions: {
        /**
         * Busca a lista de clientes
         * @param {Object} params - Parâmetros de paginação e filtros
         */
        async fetchClients(params = {}) {
            try {
                this.loading = true;
                this.error = null;
                
                console.log('Buscando clientes no store com parâmetros:', params);
                const response = await clientService.getClients(params);
                
                // Verifica se a resposta tem o formato esperado
                if (response && response.results) {
                    this.clients = response.results;
                    this.pagination = {
                        page: params.page || 1,
                        pageSize: params.page_size || 10,
                        totalItems: response.count || 0
                    };
                } else {
                    // Caso a API não retorne no formato esperado
                    this.clients = Array.isArray(response) ? response : [];
                }
                
                console.log('Clientes carregados no store:', this.clients);
            } catch (error) {
                console.error('Erro ao buscar clientes no store:', error);
                this.error = {
                    message: error.response?.data?.detail || 'Erro ao buscar clientes',
                    status: error.response?.status || 500
                };
            } finally {
                this.loading = false;
            }
        },

        /**
         * Busca um cliente pelo ID
         * @param {number} id - ID do cliente
         */
        async fetchClient(id) {
            try {
                this.loading = true;
                this.error = null;
                
                console.log(`Buscando cliente com ID ${id} no store`);
                const client = await clientService.getClient(id);
                this.currentClient = client;
                
                console.log('Cliente carregado no store:', this.currentClient);
            } catch (error) {
                console.error(`Erro ao buscar cliente com ID ${id} no store:`, error);
                this.error = {
                    message: error.response?.data?.detail || `Erro ao buscar cliente com ID ${id}`,
                    status: error.response?.status || 500
                };
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
            try {
                this.loading = true;
                this.error = null;
                
                console.log('Criando cliente no store com dados:', clientData);
                const newClient = await clientService.createClient(clientData);
                
                // Adiciona o novo cliente à lista
                this.clients.push(newClient);
                
                console.log('Cliente criado no store:', newClient);
                return newClient;
            } catch (error) {
                console.error('Erro ao criar cliente no store:', error);
                this.error = {
                    message: error.response?.data?.detail || 'Erro ao criar cliente',
                    status: error.response?.status || 500
                };
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
            try {
                this.loading = true;
                this.error = null;
                
                console.log(`Atualizando cliente com ID ${id} no store com dados:`, clientData);
                const updatedClient = await clientService.updateClient(id, clientData);
                
                // Atualiza o cliente na lista
                const index = this.clients.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.clients[index] = updatedClient;
                }
                
                // Atualiza o cliente atual se for o mesmo
                if (this.currentClient && this.currentClient.id === id) {
                    this.currentClient = updatedClient;
                }
                
                console.log('Cliente atualizado no store:', updatedClient);
                return updatedClient;
            } catch (error) {
                console.error(`Erro ao atualizar cliente com ID ${id} no store:`, error);
                this.error = {
                    message: error.response?.data?.detail || `Erro ao atualizar cliente com ID ${id}`,
                    status: error.response?.status || 500
                };
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
            try {
                this.loading = true;
                this.error = null;
                
                console.log(`Excluindo cliente com ID ${id} no store`);
                await clientService.deleteClient(id);
                
                // Remove o cliente da lista
                this.clients = this.clients.filter(c => c.id !== id);
                
                // Limpa o cliente atual se for o mesmo
                if (this.currentClient && this.currentClient.id === id) {
                    this.currentClient = null;
                }
                
                console.log(`Cliente com ID ${id} excluído do store`);
            } catch (error) {
                console.error(`Erro ao excluir cliente com ID ${id} no store:`, error);
                this.error = {
                    message: error.response?.data?.detail || `Erro ao excluir cliente com ID ${id}`,
                    status: error.response?.status || 500
                };
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
         * Limpa o cliente atual
         */
        clearCurrentClient() {
            this.currentClient = null;
        }
    }
}); 