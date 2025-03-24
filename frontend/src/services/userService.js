import api from './api';

const userService = {
    // Listar todos os usuários com suporte a filtros e paginação
    async getUsers(params = {}) {
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
            const filterFields = ['username', 'email', 'first_name', 'last_name', 'groups', 'is_active'];
            filterFields.forEach(field => {
                if (params[field] !== undefined && params[field] !== null) {
                    // Tratar arrays (como groups)
                    if (Array.isArray(params[field])) {
                        params[field].forEach(value => {
                            queryParams.append(`${field}`, value);
                        });
                    } else {
                        queryParams.append(field, params[field]);
                    }
                }
            });
            
            // Adicionar filtros de data
            if (params.date_joined_after) {
                queryParams.append('date_joined_after', params.date_joined_after);
            }
            if (params.date_joined_before) {
                queryParams.append('date_joined_before', params.date_joined_before);
            }
            
            // Construir URL de consulta
            const url = `/api/users/?${queryParams.toString()}`;
            console.log('URL de consulta:', url);
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
        }
    },

    // Obter detalhes de um usuário específico
    async getUser(id) {
        try {
            const response = await api.get(`/api/users/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar usuário ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo usuário
    async createUser(userData) {
        try {
            console.log('Dados recebidos para criação:', userData);
            
            // Criar uma cópia para não alterar o objeto original
            const dataToSend = { ...userData };
            
            // Garantir que estamos enviando group_ids corretamente
            if (dataToSend.groups && !dataToSend.group_ids) {
                dataToSend.group_ids = dataToSend.groups;
            }
            
            console.log('Dados a serem enviados:', dataToSend);
            const response = await api.post('/api/users/', dataToSend);
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
            const dataToSend = { ...userData };
            
            // Verificar e transformar os campos de senha
            if (!dataToSend.password) {
                delete dataToSend.password;
            }
            if (dataToSend.password2 !== undefined) {
                delete dataToSend.password2;
            }
            
            const response = await api.patch(`/api/users/${id}/`, dataToSend);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar usuário ${id}:`, error);
            throw error;
        }
    },

    // Excluir um usuário
    async deleteUser(id) {
        try {
            const response = await api.delete(`/api/users/${id}/`);
            return response.status === 204;
        } catch (error) {
            console.error(`Erro ao excluir usuário ${id}:`, error);
            throw error;
        }
    },

    // Alterar senha de um usuário
    async changePassword(id, passwordData) {
        try {
            const response = await api.post(`/api/users/${id}/change_password/`, passwordData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao alterar senha do usuário ${id}:`, error);
            throw error;
        }
    },

    // Atualizar perfil do usuário logado
    async updateProfile(userData) {
        try {
            const response = await api.patch('/api/users/me/', userData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    },

    // Obter perfil do usuário logado
    async getProfile() {
        try {
            // Solicitar o perfil com todos os detalhes de grupos e permissões
            const response = await api.get('/api/users/me/?include_permissions=true');
            return response.data;
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            throw error;
        }
    },

    // Alternar o status (ativar/desativar) de um usuário
    async toggleStatus(id) {
        try {
            const response = await api.patch(`/api/users/${id}/toggle_status/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao alternar status do usuário ${id}:`, error);
            throw error;
        }
    }
};

export default userService; 