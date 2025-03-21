import api from './api';

const serviceService = {
    // Listar todos os serviços com suporte a filtros e paginação
    async getServices(params = {}) {
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
            const filterFields = ['status', 'client', 'service_type', 'assigned', 'reviewing'];
            filterFields.forEach(field => {
                if (params[field] !== undefined && params[field] !== null) {
                    queryParams.append(field, params[field]);
                }
            });
            
            // Adicionar filtros de data
            if (params.start_date) {
                queryParams.append('start_date', params.start_date);
            }
            if (params.end_date) {
                queryParams.append('end_date', params.end_date);
            }
            if (params.deadline_start) {
                queryParams.append('deadline_start', params.deadline_start);
            }
            if (params.deadline_end) {
                queryParams.append('deadline_end', params.deadline_end);
            }
            
            // Construir URL com query string
            const url = queryParams.toString() ? `/api/services/?${queryParams.toString()}` : '/api/services/';
            
            console.log('Buscando serviços com URL:', url);
            const response = await api.get(url);
            
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            throw error;
        }
    },

    // Obter um serviço específico
    async getService(id) {
        try {
            const response = await api.get(`/api/services/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar serviço ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo serviço
    async createService(serviceData) {
        try {
            const response = await api.post('/api/services/', serviceData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            throw error;
        }
    },

    // Atualizar um serviço existente
    async updateService(id, serviceData) {
        try {
            const response = await api.patch(`/api/services/${id}/`, serviceData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar serviço ${id}:`, error);
            throw error;
        }
    },

    // Excluir um serviço
    async deleteService(id) {
        try {
            await api.delete(`/api/services/${id}/`);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir serviço ${id}:`, error);
            throw error;
        }
    },

    // Atribuir um serviço a um usuário
    async assignService(id, userId) {
        try {
            const response = await api.post(`/api/services/${id}/assign/`, { user_id: userId });
            return response.data;
        } catch (error) {
            console.error(`Erro ao atribuir serviço ${id} ao usuário ${userId}:`, error);
            throw error;
        }
    },

    // Enviar um serviço para revisão
    async reviewService(id, userId) {
        try {
            const response = await api.post(`/api/services/${id}/review/`, { user_id: userId });
            return response.data;
        } catch (error) {
            console.error(`Erro ao enviar serviço ${id} para revisão pelo usuário ${userId}:`, error);
            throw error;
        }
    },

    // Alterar o status de um serviço
    async changeServiceStatus(id, status) {
        try {
            const response = await api.post(`/api/services/${id}/change_status/`, { status });
            return response.data;
        } catch (error) {
            console.error(`Erro ao alterar status do serviço ${id} para ${status}:`, error);
            throw error;
        }
    }
};

export default serviceService; 