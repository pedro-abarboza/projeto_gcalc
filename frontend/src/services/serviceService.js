import api from './api';

const serviceService = {
    // Listar todos os serviços
    async getServices(params = {}) {
        try {
            const response = await api.get('/services/', { params });
            // Verificar se a resposta contém um array ou um objeto com resultados
            if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            }
            return [];
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            throw error;
        }
    },

    // Obter um serviço específico
    async getService(id) {
        try {
            const response = await api.get(`/services/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar serviço ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo serviço
    async createService(serviceData) {
        try {
            const response = await api.post('/services/', serviceData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            throw error;
        }
    },

    // Atualizar um serviço existente
    async updateService(id, serviceData) {
        try {
            console.log(`Atualizando serviço ${id} com dados:`, serviceData);
            const response = await api.put(`/services/${id}/`, serviceData);
            console.log('Resposta da atualização:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar serviço ${id}:`, error);
            console.error('Detalhes do erro:', error.response?.data);
            throw error;
        }
    },

    // Excluir um serviço
    async deleteService(id) {
        try {
            await api.delete(`/services/${id}/`);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir serviço ${id}:`, error);
            throw error;
        }
    },

    // Atualizar status de um serviço
    async updateStatus(id, status) {
        try {
            console.log(`Atualizando status do serviço ${id} para ${status}`);
            const response = await api.patch(`/services/${id}/status/`, { status });
            console.log('Resposta da atualização de status:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar status do serviço ${id}:`, error);
            throw error;
        }
    }
};

export default serviceService; 