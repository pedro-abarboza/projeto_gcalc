import api from './api';

/**
 * Serviço para gerenciar clientes
 */
export const clientService = {
    /**
     * Obtém a lista de clientes
     * @param {Object} params - Parâmetros de paginação e filtros
     * @returns {Promise<Object>} - Resposta da API com a lista de clientes
     */
    async getClients(params = {}) {
        try {
            console.log('Buscando clientes com parâmetros:', params);
            const response = await api.get('/clients/', { params });
            console.log('Clientes obtidos:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            throw error;
        }
    },

    /**
     * Obtém um cliente pelo ID
     * @param {number} id - ID do cliente
     * @returns {Promise<Object>} - Resposta da API com os dados do cliente
     */
    async getClient(id) {
        try {
            console.log(`Buscando cliente com ID: ${id}`);
            const response = await api.get(`/clients/${id}/`);
            console.log('Cliente obtido:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cliente com ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Cria um novo cliente
     * @param {Object} clientData - Dados do cliente a ser criado
     * @returns {Promise<Object>} - Resposta da API com os dados do cliente criado
     */
    async createClient(clientData) {
        try {
            console.log('Criando cliente com dados:', clientData);
            const response = await api.post('/clients/', clientData);
            console.log('Cliente criado:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            throw error;
        }
    },

    /**
     * Atualiza um cliente existente
     * @param {number} id - ID do cliente
     * @param {Object} clientData - Dados atualizados do cliente
     * @returns {Promise<Object>} - Resposta da API com os dados do cliente atualizado
     */
    async updateClient(id, clientData) {
        try {
            console.log(`Atualizando cliente com ID ${id} com dados:`, clientData);
            const response = await api.put(`/clients/${id}/`, clientData);
            console.log('Cliente atualizado:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Exclui um cliente
     * @param {number} id - ID do cliente a ser excluído
     * @returns {Promise<Object>} - Resposta da API
     */
    async deleteClient(id) {
        try {
            console.log(`Excluindo cliente com ID: ${id}`);
            const response = await api.delete(`/clients/${id}/`);
            console.log('Cliente excluído com sucesso');
            return response.data;
        } catch (error) {
            console.error(`Erro ao excluir cliente com ID ${id}:`, error);
            throw error;
        }
    }
}; 