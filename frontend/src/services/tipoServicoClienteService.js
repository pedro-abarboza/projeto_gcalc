import api from './api';

const tipoServicoClienteService = {
    // Listar todos os tipos de serviço com suporte a filtros e paginação
    async getTiposServico(params = {}) {
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
            const filterFields = ['client_id', 'status', 'name'];
            filterFields.forEach(field => {
                if (params[field] !== undefined && params[field] !== null) {
                    queryParams.append(field, params[field]);
                }
            });
            
            // Construir URL com query string
            const url = queryParams.toString() ? `/api/services/service-types/?${queryParams.toString()}` : '/api/services/service-types/';
            
            console.log('Buscando tipos de serviço com URL:', url);
            const response = await api.get(url);
            
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar tipos de serviço:', error);
            throw error;
        }
    },

    // Obter um tipo de serviço específico
    async getTipoServico(id) {
        try {
            const response = await api.get(`/api/services/service-types/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar tipo de serviço ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo tipo de serviço
    async createTipoServico(data) {
        try {
            const response = await api.post('/api/services/service-types/', data);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar tipo de serviço:', error);
            throw error;
        }
    },

    // Atualizar um tipo de serviço existente
    async updateTipoServico(id, data) {
        try {
            const response = await api.patch(`/api/services/service-types/${id}/`, data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar tipo de serviço ${id}:`, error);
            throw error;
        }
    },

    // Excluir um tipo de serviço
    async deleteTipoServico(id) {
        try {
            await api.delete(`/api/services/service-types/${id}/`);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir tipo de serviço ${id}:`, error);
            throw error;
        }
    },

    // Alternar status do tipo de serviço (ativo/inativo)
    async toggleStatus(id) {
        try {
            const response = await api.patch(`/api/services/service-types/${id}/toggle_status/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao alternar status do tipo de serviço ${id}:`, error);
            throw error;
        }
    }
};

export default tipoServicoClienteService; 