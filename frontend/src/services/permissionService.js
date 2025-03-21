import api from './api';

/**
 * Serviço para gerenciar permissões no sistema
 */
const permissionService = {
    /**
     * Obter lista de permissões com paginação e filtros
     * @param {Object} params - Parâmetros de busca e paginação
     * @returns {Promise<Object>} - Dados paginados com as permissões
     */
    getPermissions(params = {}) {
        let queryParams = new URLSearchParams();
        
        // Parâmetros básicos de paginação
        if (params.page) queryParams.append('page', params.page);
        if (params.page_size) queryParams.append('page_size', params.page_size);
        
        // Parâmetros de ordenação
        if (params.ordering) queryParams.append('ordering', params.ordering);
        
        // Parâmetros de busca
        if (params.search) queryParams.append('search', params.search);
        if (params.name) queryParams.append('name', params.name);
        if (params.codename) queryParams.append('codename', params.codename);
        if (params.app_label) queryParams.append('app_label', params.app_label);
        if (params.model) queryParams.append('model', params.model);
        
        const url = `/api/auth/permissions/?${queryParams.toString()}`;
        console.log('Buscando permissões:', url);
        
        return api.get(url)
            .then(response => response.data)
            .catch(error => {
                console.error('Erro ao buscar permissões:', error);
                throw error;
            });
    },
    
    /**
     * Obter detalhes de uma permissão específica
     * @param {Number} id - ID da permissão
     * @returns {Promise<Object>} - Dados da permissão
     */
    getPermission(id) {
        return api.get(`/api/auth/permissions/${id}/`)
            .then(response => response.data)
            .catch(error => {
                console.error(`Erro ao buscar permissão ${id}:`, error);
                throw error;
            });
    }
};

export default permissionService;