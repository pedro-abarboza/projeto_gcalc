import api from './api';

export const userService = {
    async getUsers(params = {}) {
        try {
            const response = await api.get('/users/', { params });
            return response.data;
        } catch (error) {
            throw new Error('Erro ao buscar usuários');
        }
    },

    async getUser(id) {
        try {
            const response = await api.get(`/users/${id}/`);
            return response.data;
        } catch (error) {
            throw new Error('Erro ao buscar usuário');
        }
    },

    async createUser(userData) {
        try {
            const response = await api.post('/users/', userData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Erro ao criar usuário');
        }
    },

    async updateUser(id, userData) {
        try {
            const response = await api.put(`/users/${id}/`, userData);
            return response.data;
        } catch (error) {
            throw new Error('Erro ao atualizar usuário');
        }
    },

    async deleteUser(id) {
        try {
            await api.delete(`/users/${id}/`);
        } catch (error) {
            throw new Error('Erro ao excluir usuário');
        }
    },

    async toggleUserStatus(id) {
        try {
            const response = await api.patch(`/users/${id}/toggle_status/`);
            return response.data;
        } catch (error) {
            throw new Error('Erro ao alterar status do usuário');
        }
    }
}; 