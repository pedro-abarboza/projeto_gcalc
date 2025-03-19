import api from './api';

const calculationService = {
    // Listar todos os cálculos com suporte a filtros e paginação
    async getCalculations(params = {}) {
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
            const filterFields = ['service', 'calculation_type', 'status'];
            filterFields.forEach(field => {
                if (params[field] !== undefined && params[field] !== null) {
                    queryParams.append(field, params[field]);
                }
            });
            
            // Adicionar filtros de data
            if (params.start_date_after) {
                queryParams.append('start_date_after', params.start_date_after);
            }
            if (params.start_date_before) {
                queryParams.append('start_date_before', params.start_date_before);
            }
            if (params.end_date_after) {
                queryParams.append('end_date_after', params.end_date_after);
            }
            if (params.end_date_before) {
                queryParams.append('end_date_before', params.end_date_before);
            }
            if (params.created_at_after) {
                queryParams.append('created_at_after', params.created_at_after);
            }
            if (params.created_at_before) {
                queryParams.append('created_at_before', params.created_at_before);
            }
            
            // Construir URL com query string
            const url = queryParams.toString() ? `/calculations/?${queryParams.toString()}` : '/calculations/';
            
            console.log('Buscando cálculos com URL:', url);
            const response = await api.get(url);
            
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar cálculos:', error);
            throw error;
        }
    },

    // Obter um cálculo específico
    async getCalculation(id) {
        try {
            const response = await api.get(`/calculations/${id}/`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar cálculo ${id}:`, error);
            throw error;
        }
    },

    // Criar um novo cálculo
    async createCalculation(calculationData) {
        try {
            const response = await api.post('/calculations/', calculationData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar cálculo:', error);
            throw error;
        }
    },

    // Atualizar um cálculo existente
    async updateCalculation(id, calculationData) {
        try {
            const response = await api.patch(`/calculations/${id}/`, calculationData);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar cálculo ${id}:`, error);
            throw error;
        }
    },

    // Excluir um cálculo
    async deleteCalculation(id) {
        try {
            await api.delete(`/calculations/${id}/`);
            return true;
        } catch (error) {
            console.error(`Erro ao excluir cálculo ${id}:`, error);
            throw error;
        }
    },

    // Gerar relatório de cálculo
    async generateReport(id, reportType = 'pdf') {
        try {
            const response = await api.get(`/calculations/${id}/report/?format=${reportType}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error(`Erro ao gerar relatório para cálculo ${id}:`, error);
            throw error;
        }
    }
};

export default calculationService; 