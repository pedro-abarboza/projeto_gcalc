import api from './api';

const userService = {
    // Listar todos os usuários
    async getUsers() {
        try {
            const response = await api.get('/users/');
            // Verificar se a resposta contém um array ou um objeto com resultados
            if (response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                return response.data.results;
            }
            return [];
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
        }
    },

    // Obter um usuário específico
    async getUser(id) {
        try {
            const response = await api.get(`/users/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar usuário ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo usuário
    async createUser(userData) {
        try {
            const response = await api.post('/users/', userData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    },

    // Atualizar um usuário existente
    async updateUser(id, userData) {
        try {
            // Remover campos que não devem ser enviados na atualização
            const { password2, ...dataToSend } = userData;
            
            // Se não houver senha, remover do objeto
            if (!dataToSend.password) {
                delete dataToSend.password;
            }
            
            // Log para debug
            console.log(`Atualizando usuário ${id} com dados:`, dataToSend);
            
            const response = await api.put(`/users/${id}/`, dataToSend);
            console.log('Resposta da atualização:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar usuário ${id}:`, error);
            console.error('Detalhes do erro:', error.response?.data);
            throw error;
        }
    },

    // Excluir um usuário
    async deleteUser(id) {
        try {
            await api.delete(`/users/${id}/`);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir usuário ${id}:`, error);
            throw error;
        }
    },

    // Alterar senha do usuário
    async changePassword(id, passwordData) {
        try {
            const response = await api.post(`/users/${id}/change-password/`, passwordData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao alterar senha do usuário ${id}:`, error);
            throw error;
        }
    },

    // Atualizar perfil do usuário logado
    async updateProfile(userData) {
        try {
            const response = await api.put('/users/me/', userData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    },

    // Obter perfil do usuário logado
    async getProfile() {
        try {
            const response = await api.get('/users/me/');
            return response.data;
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            throw error;
        }
    },

    // Alternar status do usuário (ativo/inativo)
    async toggleStatus(id) {
        try {
            const response = await api.patch(`/users/${id}/toggle_status/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao alternar status do usuário ${id}:`, error);
            throw error;
        }
    }
};

export default userService; 