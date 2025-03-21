import api from './api';

const groupService = {
    // Listar todos os grupos (funções) com suporte a filtros e paginação
    async getGroups(params = {}) {
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
            if (params.name) {
                queryParams.append('name', params.name);
            }
            
            // Construir URL com query string
            const url = queryParams.toString() ? `/api/users/groups/?${queryParams.toString()}` : '/api/users/groups/';
            
            console.log('Buscando grupos de permissão com URL:', url);
            const response = await api.get(url);
            
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar grupos de permissão:', error);
            throw error;
        }
    },

    // Obter um grupo específico
    async getGroup(id) {
        try {
            const response = await api.get(`/api/users/groups/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar grupo de permissão ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo grupo
    async createGroup(groupData) {
        try {
            const response = await api.post('/api/users/groups/', groupData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar grupo de permissão:', error);
            throw error;
        }
    },

    // Atualizar um grupo existente
    async updateGroup(id, groupData) {
        try {
            const response = await api.patch(`/api/users/groups/${id}/`, groupData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar grupo de permissão ${id}:`, error);
            throw error;
        }
    },

    // Excluir um grupo
    async deleteGroup(id) {
        try {
            await api.delete(`/api/users/groups/${id}/`);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir grupo de permissão ${id}:`, error);
            throw error;
        }
    },

    // Listar todas as permissões disponíveis
    async getPermissions(params = {}) {
        try {
            // Construir query string para filtros
            const queryParams = new URLSearchParams();
            
            // Adicionar filtros
            if (params.app_label) {
                queryParams.append('app_label', params.app_label);
            }
            if (params.model) {
                queryParams.append('model', params.model);
            }
            if (params.search) {
                queryParams.append('search', params.search);
            }
            
            // Construir URL com query string
            const url = queryParams.toString() ? `/api/users/permissions/?${queryParams.toString()}` : '/api/users/permissions/';
            
            console.log('Buscando permissões com URL:', url);
            const response = await api.get(url);
            
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar permissões:', error);
            throw error;
        }
    }
};

export default groupService; 