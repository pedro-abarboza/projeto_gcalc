import { defineStore } from 'pinia';
import calculationService from '@/services/calculationService';

export const useCalculationStore = defineStore('calculation', {
    state: () => ({
        calculations: [],
        currentCalculation: null,
        loading: false,
        error: null,
        pagination: {
            count: 0,
            next: null,
            previous: null,
            page: 1,
            pageSize: 10,
            totalPages: 0
        },
        filters: {
            search: '',
            service: null,
            calculation_type: null,
            status: null,
            ordering: '-created_at'
        }
    }),

    getters: {
        // Retorna todos os cálculos
        getCalculations: (state) => state.calculations || [],

        // Retorna o cálculo atual
        getCurrentCalculation: (state) => state.currentCalculation,

        // Retorna cálculos por status
        getCalculationsByStatus: (state) => (status) => {
            return (state.calculations || []).filter(calculation => calculation.status === status);
        },

        // Retorna cálculos por tipo
        getCalculationsByType: (state) => (type) => {
            return (state.calculations || []).filter(calculation => calculation.calculation_type === type);
        },

        // Retorna o status de carregamento
        isLoading: (state) => state.loading,

        // Retorna o erro atual
        getError: (state) => state.error,

        // Retorna informações de paginação
        getPagination: (state) => state.pagination,

        // Retorna os filtros atuais
        getFilters: (state) => state.filters
    },

    actions: {
        // Atualiza os filtros
        updateFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
            // Resetar para a primeira página ao alterar filtros
            this.pagination.page = 1;
        },

        // Atualiza a paginação
        updatePagination(newPagination) {
            this.pagination = { ...this.pagination, ...newPagination };
        },

        // Carrega todos os cálculos com filtros e paginação
        async fetchCalculations(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                // Combinar filtros do estado com parâmetros adicionais
                const queryParams = {
                    ...this.filters,
                    page: this.pagination.page,
                    page_size: this.pagination.pageSize,
                    ...params
                };

                // Remover parâmetros vazios
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });

                console.log('Buscando cálculos com parâmetros:', queryParams);
                const data = await calculationService.getCalculations(queryParams);
                
                // Atualizar cálculos e informações de paginação
                this.calculations = data.results || [];
                this.pagination = {
                    count: data.count || 0,
                    next: data.next,
                    previous: data.previous,
                    page: params.page || this.pagination.page,
                    pageSize: params.page_size || this.pagination.pageSize,
                    totalPages: Math.ceil((data.count || 0) / (params.page_size || this.pagination.pageSize))
                };
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar cálculos';
                this.calculations = [];
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega um cálculo específico
        async fetchCalculation(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await calculationService.getCalculation(id);
                if (!data) return null;
                
                this.currentCalculation = data;
                
                const index = this.calculations.findIndex(calculation => calculation.id === id);
                if (index !== -1) {
                    this.calculations[index] = data;
                } else {
                    this.calculations.push(data);
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar cálculo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Cria um novo cálculo
        async createCalculation(calculationData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await calculationService.createCalculation(calculationData);
                // Recarregar a lista após criar um novo cálculo
                await this.fetchCalculations();
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao criar cálculo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza um cálculo existente
        async updateCalculation(id, calculationData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await calculationService.updateCalculation(id, calculationData);
                if (!data) {
                    console.error('Nenhum dado retornado da API após atualização');
                    return null;
                }
                
                // Atualizar o cálculo na lista
                const index = this.calculations.findIndex(calculation => calculation.id === id);
                if (index !== -1) {
                    this.calculations[index] = data;
                }
                
                // Se for o cálculo atual, atualizar também
                if (this.currentCalculation && this.currentCalculation.id === id) {
                    this.currentCalculation = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atualizar cálculo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Remove um cálculo
        async deleteCalculation(id) {
            this.loading = true;
            this.error = null;
            try {
                await calculationService.deleteCalculation(id);
                // Recarregar a lista após excluir um cálculo
                await this.fetchCalculations();
                
                // Se for o cálculo atual, limpar
                if (this.currentCalculation && this.currentCalculation.id === id) {
                    this.currentCalculation = null;
                }
                
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao excluir cálculo';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Gerar relatório de cálculo
        async generateReport(id, reportType = 'pdf') {
            this.loading = true;
            this.error = null;
            try {
                const blob = await calculationService.generateReport(id, reportType);
                
                // Criar URL para download
                const url = window.URL.createObjectURL(blob);
                
                // Criar link e simular clique para download
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `calculo-${id}.${reportType}`);
                document.body.appendChild(link);
                link.click();
                
                // Limpar
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao gerar relatório';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});