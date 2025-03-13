import api from './api';

export const serviceService = {
    async getServices(params = {}) {
        try {
            const response = await api.get('/services/', { params });
            return response.data;
        } catch (error) {
            throw new Error('Erro ao buscar serviços');
        }
    },

    async getService(id) {
        try {
            const response = await api.get(`/services/${id}/`);
            return response.data;
        } catch (error) {
            throw new Error('Erro ao buscar serviço');
        }
    },

    async createService(serviceData) {
        try {
            const response = await api.post('/services/', serviceData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Erro ao criar serviço');
        }
    },

    async updateService(id, serviceData) {
        try {
            const response = await api.put(`/services/${id}/`, serviceData);
            return response.data;
        } catch (error) {
            throw new Error('Erro ao atualizar serviço');
        }
    },

    async deleteService(id) {
        try {
            await api.delete(`/services/${id}/`);
        } catch (error) {
            throw new Error('Erro ao excluir serviço');
        }
    },

    async updateStatus(id, status) {
        try {
            const response = await api.patch(`/services/${id}/status/`, { status });
            return response.data;
        } catch (error) {
            throw new Error('Erro ao atualizar status do serviço');
        }
    }
}; 