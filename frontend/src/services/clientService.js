import api from './api';

/**
 * Serviço para gerenciar clientes
 */
const clientService = {
    /**
     * Obtém a lista de clientes
     * @param {Object} params - Parâmetros de paginação e filtros
     * @returns {Promise<Object>} - Resposta da API com a lista de clientes
     */
    async getClients(params = {}) {
        try {
            // Construir query string para filtros
            const queryParams = new URLSearchParams();
            
            // Adicionar parâmetros de paginação
            if (params.page) {
                queryParams.append('page', params.page);
            }
            if (params.page_size) {
                queryParams.append('page_size', params.page_size);
            }
            
            // Adicionar parâmetros de ordenação
            if (params.ordering) {
                queryParams.append('ordering', params.ordering);
            }
            
            // Adicionar parâmetros de busca
            if (params.search) {
                queryParams.append('search', params.search);
            }
            
            // Adicionar filtros específicos
            const filterFields = ['name', 'document_type', 'document_number', 'email', 'phone', 'status'];
            filterFields.forEach(field => {
                if (params[field] !== undefined && params[field] !== null) {
                    queryParams.append(field, params[field]);
                }
            });
            
            // Adicionar filtros de data
            if (params.created_at_after) {
                queryParams.append('created_at_after', params.created_at_after);
            }
            if (params.created_at_before) {
                queryParams.append('created_at_before', params.created_at_before);
            }
            
            // Construir URL com query string
            const url = queryParams.toString() ? `/services/clients/?${queryParams.toString()}` : '/services/clients/';
            
            console.log('Buscando clientes com URL:', url);
            const response = await api.get(url);
            
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
            const response = await api.get(`/services/clients/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cliente ${id}:`, error);
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
            const response = await api.post('/services/clients/', clientData);
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
            const response = await api.patch(`/services/clients/${id}/`, clientData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar cliente ${id}:`, error);
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
            await api.delete(`/services/clients/${id}/`);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir cliente ${id}:`, error);
            throw error;
        }
    },

    /**
     * Alterna o status do cliente (ativo/inativo)
     * @param {number} id - ID do cliente
     * @returns {Promise<Object>} - Resposta da API com o status do cliente atualizado
     */
    async toggleStatus(id) {
        try {
            const response = await api.patch(`/services/clients/${id}/toggle_status/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao alternar status do cliente ${id}:`, error);
            throw error;
        }
    }
};

export default clientService; 