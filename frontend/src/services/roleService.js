import api from './api';

export default {
    /**
     * Listar todas as funções (grupos) com suporte a paginação e filtros
     * @param {Object} params - Parâmetros de busca e paginação
     * @returns {Promise<Object>} - Dados paginados com as funções
     */
    getRoles(params = {}) {
        let queryParams = new URLSearchParams();
        
        // Parâmetros básicos de paginação
        if (params.page) queryParams.append('page', params.page);
        if (params.page_size) queryParams.append('page_size', params.page_size);
        
        // Parâmetros de ordenação
        if (params.ordering) queryParams.append('ordering', params.ordering);
        
        // Parâmetros de busca
        if (params.search) queryParams.append('search', params.search);
        if (params.name) queryParams.append('name', params.name);
        
        const url = `/api/auth/groups/?${queryParams.toString()}`;
        console.log('Buscando funções:', url);
        
        return api.get(url)
            .then(response => response.data)
            .catch(error => {
                console.error('Erro ao buscar funções:', error);
                throw error;
            });
    },
    
    /**
     * Obter detalhes de uma função específica
     * @param {Number} id - ID da função
     * @returns {Promise<Object>} - Dados da função
     */
    getRole(id) {
        return api.get(`/api/auth/groups/${id}/`)
            .then(response => response.data)
            .catch(error => {
                console.error(`Erro ao buscar função ${id}:`, error);
                throw error;
            });
    },
    
    /**
     * Criar uma nova função
     * @param {Object} roleData - Dados da função a ser criada
     * @returns {Promise<Object>} - Dados da função criada
     */
    createRole(roleData) {
        return api.post('/api/auth/groups/', roleData)
            .then(response => response.data)
            .catch(error => {
                console.error('Erro ao criar função:', error);
                throw error;
            });
    },
    
    /**
     * Atualizar uma função existente
     * @param {Number} id - ID da função
     * @param {Object} roleData - Dados da função a serem atualizados
     * @returns {Promise<Object>} - Dados da função atualizada
     */
    updateRole(id, roleData) {
        return api.put(`/api/auth/groups/${id}/`, roleData)
            .then(response => response.data)
            .catch(error => {
                console.error(`Erro ao atualizar função ${id}:`, error);
                throw error;
            });
    },
    
    /**
     * Excluir uma função
     * @param {Number} id - ID da função a ser excluída
     * @returns {Promise<boolean>} - Verdadeiro se a exclusão for bem-sucedida
     */
    deleteRole(id) {
        return api.delete(`/api/auth/groups/${id}/`)
            .then(() => true)
            .catch(error => {
                console.error(`Erro ao excluir função ${id}:`, error);
                throw error;
            });
    }
} 