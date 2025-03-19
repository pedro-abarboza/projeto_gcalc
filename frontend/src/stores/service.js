import { defineStore } from 'pinia';
import serviceService from '@/services/serviceService';

export const useServiceStore = defineStore('service', {
    state: () => ({
        services: [],
        currentService: null,
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
            status: null,
            client: null,
            service_type: null,
            assigned: null,
            reviewing: null,
            start_date: null,
            end_date: null,
            deadline_start: null,
            deadline_end: null,
            ordering: 'created_at'
        }
    }),

    getters: {
        // Retorna todos os serviços
        getServices: (state) => state.services || [],

        // Retorna o serviço atual
        getCurrentService: (state) => state.currentService,

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

        // Carrega todos os serviços com filtros e paginação
        async fetchServices(params = {}) {
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

                console.log('Buscando serviços com parâmetros:', queryParams);
                const data = await serviceService.getServices(queryParams);
                
                // Atualizar serviços e informações de paginação
                this.services = data.results || [];
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
                this.error = error.response?.data?.detail || 'Erro ao carregar serviços';
                this.services = [];
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Carrega um serviço específico
        async fetchService(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await serviceService.getService(id);
                if (!data) return null;
                
                this.currentService = data;
                
                const index = this.services.findIndex(service => service.id === id);
                if (index !== -1) {
                    this.services[index] = data;
                } else {
                    this.services.push(data);
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao carregar serviço';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Cria um novo serviço
        async createService(serviceData) {
            this.loading = true;
            this.error = null;
            try {
                const data = await serviceService.createService(serviceData);
                // Recarregar a lista após criar um novo serviço
                await this.fetchServices();
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao criar serviço';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza um serviço existente
        async updateService(id, serviceData) {
            this.loading = true;
            this.error = null;
            try {
                console.log('Store: Atualizando serviço', id, serviceData);
                const data = await serviceService.updateService(id, serviceData);
                if (!data) {
                    console.error('Nenhum dado retornado da API após atualização');
                    return null;
                }
                
                console.log('Store: Dados retornados da API', data);
                const index = this.services.findIndex(service => service.id === id);
                if (index !== -1) {
                    console.log('Store: Atualizando serviço no array', index);
                    this.services[index] = data;
                } else {
                    console.warn('Store: Serviço não encontrado no array, adicionando');
                    this.services.push(data);
                }
                
                // Se for o serviço atual, atualizar também
                if (this.currentService && this.currentService.id === id) {
                    this.currentService = data;
                }
                
                return data;
            } catch (error) {
                console.error('Store: Erro ao atualizar serviço', error);
                this.error = error.response?.data?.detail || 'Erro ao atualizar serviço';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Remove um serviço
        async deleteService(id) {
            this.loading = true;
            this.error = null;
            try {
                await serviceService.deleteService(id);
                // Recarregar a lista após excluir um serviço
                await this.fetchServices();
                
                // Se for o serviço atual, limpar
                if (this.currentService && this.currentService.id === id) {
                    this.currentService = null;
                }
                
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao excluir serviço';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atribui um serviço a um usuário
        async assignService(id, userId) {
            this.loading = true;
            this.error = null;
            try {
                const data = await serviceService.assignService(id, userId);
                if (!data) return null;
                
                // Atualizar o serviço na lista
                const index = this.services.findIndex(service => service.id === id);
                if (index !== -1) {
                    this.services[index] = data;
                }
                
                // Se for o serviço atual, atualizar também
                if (this.currentService && this.currentService.id === id) {
                    this.currentService = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atribuir serviço';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Envia um serviço para revisão
        async reviewService(id) {
            this.loading = true;
            this.error = null;
            try {
                const data = await serviceService.reviewService(id);
                if (!data) return null;
                
                // Atualizar o serviço na lista
                const index = this.services.findIndex(service => service.id === id);
                if (index !== -1) {
                    this.services[index] = data;
                }
                
                // Se for o serviço atual, atualizar também
                if (this.currentService && this.currentService.id === id) {
                    this.currentService = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao enviar serviço para revisão';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Altera o status de um serviço
        async changeServiceStatus(id, status) {
            this.loading = true;
            this.error = null;
            try {
                const data = await serviceService.changeServiceStatus(id, status);
                if (!data) return null;
                
                // Atualizar o serviço na lista
                const index = this.services.findIndex(service => service.id === id);
                if (index !== -1) {
                    this.services[index] = data;
                }
                
                // Se for o serviço atual, atualizar também
                if (this.currentService && this.currentService.id === id) {
                    this.currentService = data;
                }
                
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao alterar status do serviço';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Limpa os erros
        clearError() {
            this.error = null;
        },

        // Reset do estado
        resetState() {
            this.services = [];
            this.currentService = null;
            this.loading = false;
            this.error = null;
            this.pagination = {
                count: 0,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
                totalPages: 0
            };
            this.filters = {
                search: '',
                status: null,
                client: null,
                service_type: null,
                assigned: null,
                reviewing: null,
                start_date: null,
                end_date: null,
                deadline_start: null,
                deadline_end: null,
                ordering: 'created_at'
            };
        }
    }
}); 