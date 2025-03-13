import { defineStore } from 'pinia';
import serviceService from '@/services/serviceService';

export const useServiceStore = defineStore('service', {
    state: () => ({
        services: [],
        currentService: null,
        loading: false,
        error: null
    }),

    getters: {
        // Retorna todos os serviços
        getServices: (state) => state.services || [],

        // Retorna o serviço atual
        getCurrentService: (state) => state.currentService,

        // Retorna o status de carregamento
        isLoading: (state) => state.loading,

        // Retorna o erro atual
        getError: (state) => state.error
    },

    actions: {
        // Carrega todos os serviços
        async fetchServices(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const data = await serviceService.getServices(params);
                // Garantir que data seja um array
                this.services = Array.isArray(data) ? data : [];
                return this.services;
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
                if (data && this.services) {
                    this.services.push(data);
                }
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
                this.services = this.services.filter(service => service.id !== id);
                return true;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao excluir serviço';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Atualiza o status de um serviço
        async updateStatus(id, status) {
            this.loading = true;
            this.error = null;
            try {
                const data = await serviceService.updateStatus(id, status);
                if (!data) return null;
                
                const index = this.services.findIndex(service => service.id === id);
                if (index !== -1) {
                    this.services[index] = data;
                }
                return data;
            } catch (error) {
                this.error = error.response?.data?.detail || 'Erro ao atualizar status do serviço';
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
        }
    }
}); 