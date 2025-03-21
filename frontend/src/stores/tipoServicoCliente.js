import { defineStore } from 'pinia';
import tipoServicoClienteService from '@/services/tipoServicoClienteService';

export const useTipoServicoClienteStore = defineStore('tipoServicoCliente', {
  state: () => ({
    tiposServico: [],
    tipoServico: {},
    loading: false,
    error: null,
    totalRecords: 0,
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
      client_id: null,
      status: null,
      ordering: '-created_at'
    }
  }),

  getters: {
    // Retorna todos os tipos de serviço
    getTiposServico: (state) => state.tiposServico || [],

    // Retorna o tipo de serviço atual
    getTipoServico: (state) => state.tipoServico,

    // Retorna tipos de serviço ativos
    getActiveTiposServico: (state) => (state.tiposServico || []).filter(item => item.status),

    // Retorna o status de carregamento
    isLoading: (state) => state.loading,

    // Retorna o erro atual
    getError: (state) => state.error,

    // Retorna o número total de registros
    getTotalRecords: (state) => state.totalRecords,

    // Retorna informações de paginação
    getPagination: (state) => state.pagination,

    // Retorna os filtros atuais
    getFilters: (state) => state.filters
  },

  actions: {
    // Atualiza os filtros
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
      // Resetar para a primeira página ao alterar filtros
      this.pagination.page = 1;
    },

    // Resetar filtros
    resetFilters() {
      this.filters = {
        search: '',
        client_id: null,
        status: null,
        ordering: '-created_at'
      };
      this.pagination.page = 1;
    },

    // Atualiza a paginação
    updatePagination(newPagination) {
      this.pagination = { ...this.pagination, ...newPagination };
    },

    // Busca todos os tipos de serviço de uma vez (sem paginação)
    async fetchAllTiposServico(params = {}) {
      this.error = null;
      try {
        // Buscar todos os tipos de serviço com um tamanho de página grande
        const queryParams = {
          page_size: 1000, // Um valor grande para pegar todos os tipos de serviço
          ordering: '-created_at',
          ...params
        };
        
        console.log('Buscando todos os tipos de serviço');
        const data = await tipoServicoClienteService.getTiposServico(queryParams);
        
        // Atualizar tipos de serviço
        this.tiposServico = data.results || [];
        this.totalRecords = data.count || 0;
        
        return data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erro ao carregar tipos de serviço';
        this.tiposServico = [];
        throw error;
      }
    },

    // Carrega todos os tipos de serviço com filtros e paginação
    async fetchTiposServico(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        // Combinar filtros do estado com parâmetros adicionais
        const queryParams = {};

        // Remover parâmetros vazios
        Object.keys(queryParams).forEach(key => {
          if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
            delete queryParams[key];
          }
        });

        console.log('Buscando tipos de serviço com parâmetros:', queryParams);
        const data = await tipoServicoClienteService.getTiposServico(queryParams);
        
        // Atualizar tipos de serviço e informações de paginação
        this.tiposServico = data.results || [];
        this.totalRecords = data.count || 0;
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
        this.error = error.response?.data?.detail || 'Erro ao carregar tipos de serviço';
        this.tiposServico = [];
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Carrega um tipo de serviço específico
    async fetchTipoServico(id) {
      this.loading = true;
      this.error = null;
      try {
        const data = await tipoServicoClienteService.getTipoServico(id);
        if (!data) return null;
        
        this.tipoServico = data;
        
        // Atualizar o item na lista se já existir
        const index = this.tiposServico.findIndex(item => item.id === id);
        if (index !== -1) {
          this.tiposServico[index] = data;
        }
        
        return data;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erro ao carregar tipo de serviço';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Cria um novo tipo de serviço
    async createTipoServico(data) {
      this.loading = true;
      this.error = null;
      try {
        const result = await tipoServicoClienteService.createTipoServico(data);
        
        // Recarregar a lista para exibir o novo item
        await this.fetchTiposServico();
        
        return result;
      } catch (error) {
        this.error = error.response?.data || 'Erro ao criar tipo de serviço';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Atualiza um tipo de serviço existente
    async updateTipoServico(id, data) {
      this.loading = true;
      this.error = null;
      try {
        const result = await tipoServicoClienteService.updateTipoServico(id, data);
        
        // Atualizar o item na lista
        const index = this.tiposServico.findIndex(item => item.id === id);
        if (index !== -1) {
          this.tiposServico[index] = result;
        }
        
        // Atualizar o item atual se estiver visualizando
        if (this.tipoServico.id === id) {
          this.tipoServico = result;
        }
        
        return result;
      } catch (error) {
        this.error = error.response?.data || 'Erro ao atualizar tipo de serviço';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Remove um tipo de serviço
    async deleteTipoServico(id) {
      this.loading = true;
      this.error = null;
      try {
        await tipoServicoClienteService.deleteTipoServico(id);
        
        // Remover o item da lista
        this.tiposServico = this.tiposServico.filter(item => item.id !== id);
        
        // Resetar o item atual se for o mesmo
        if (this.tipoServico.id === id) {
          this.tipoServico = {};
        }
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erro ao excluir tipo de serviço';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Alterna o status de um tipo de serviço (ativo/inativo)
    async toggleStatus(id) {
      this.loading = true;
      this.error = null;
      try {
        const result = await tipoServicoClienteService.toggleStatus(id);
        
        // Atualizar o item na lista
        const index = this.tiposServico.findIndex(item => item.id === id);
        if (index !== -1) {
          this.tiposServico[index] = result;
        }
        
        // Atualizar o item atual se estiver visualizando
        if (this.tipoServico.id === id) {
          this.tipoServico = result;
        }
        
        return result;
      } catch (error) {
        this.error = error.response?.data?.detail || 'Erro ao alternar status';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 