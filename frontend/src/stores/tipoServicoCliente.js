import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from './auth';

export const useTipoServicoClienteStore = defineStore('tipoServicoCliente', () => {
  // Estado
  const tiposServico = ref([]);
  const tipoServico = ref({});
  const loading = ref(false);
  const error = ref(null);
  const totalRecords = ref(0);
  const filters = ref({
    page: 1,
    search: '',
    client: null,
    status: null
  });

  // Getters
  const getTiposServico = computed(() => tiposServico.value);
  const getTipoServico = computed(() => tipoServico.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getTotalRecords = computed(() => totalRecords.value);
  const getFilters = computed(() => filters.value);

  // Actions
  const fetchTiposServico = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const authStore = useAuthStore();
      const params = {
        page: filters.value.page
      };
      
      if (filters.value.search) {
        params.search = filters.value.search;
      }
      
      if (filters.value.client) {
        params.client_id = filters.value.client;
      }
      
      if (filters.value.status !== null) {
        params.status = filters.value.status;
      }
      
      const response = await axios.get('/api/service-types/', {
        headers: {
          Authorization: `Token ${authStore.token}`
        },
        params
      });
      
      tiposServico.value = response.data.results;
      totalRecords.value = response.data.count;
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos de serviço:', error);
      error.value = error.response?.data?.detail || 'Erro ao buscar tipos de serviço';
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchTipoServico = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const authStore = useAuthStore();
      const response = await axios.get(`/api/service-types/${id}/`, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      tipoServico.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipo de serviço:', error);
      error.value = error.response?.data?.detail || 'Erro ao buscar tipo de serviço';
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const createTipoServico = async (data) => {
    loading.value = true;
    error.value = null;
    const toast = useToast();
    
    try {
      const authStore = useAuthStore();
      const response = await axios.post('/api/service-types/', data, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      tipoServico.value = response.data;
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de serviço criado com sucesso', life: 3000 });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tipo de serviço:', error);
      error.value = error.response?.data || 'Erro ao criar tipo de serviço';
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar tipo de serviço', life: 3000 });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const updateTipoServico = async (id, data) => {
    loading.value = true;
    error.value = null;
    const toast = useToast();
    
    try {
      const authStore = useAuthStore();
      const response = await axios.put(`/api/service-types/${id}/`, data, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      tipoServico.value = response.data;
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de serviço atualizado com sucesso', life: 3000 });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tipo de serviço:', error);
      error.value = error.response?.data || 'Erro ao atualizar tipo de serviço';
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar tipo de serviço', life: 3000 });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const deleteTipoServico = async (id) => {
    loading.value = true;
    error.value = null;
    const toast = useToast();
    
    try {
      const authStore = useAuthStore();
      await axios.delete(`/api/service-types/${id}/`, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de serviço excluído com sucesso', life: 3000 });
      return true;
    } catch (error) {
      console.error('Erro ao excluir tipo de serviço:', error);
      error.value = error.response?.data?.detail || 'Erro ao excluir tipo de serviço';
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir tipo de serviço', life: 3000 });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const toggleStatus = async (id) => {
    loading.value = true;
    error.value = null;
    const toast = useToast();
    
    try {
      const authStore = useAuthStore();
      const response = await axios.patch(`/api/service-types/${id}/toggle_status/`, {}, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      // Atualiza o item na lista
      const index = tiposServico.value.findIndex(item => item.id === id);
      if (index !== -1) {
        tiposServico.value[index] = response.data;
      }
      
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Status atualizado com sucesso', life: 3000 });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      error.value = error.response?.data?.detail || 'Erro ao atualizar status';
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar status', life: 3000 });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
  };
  
  const resetFilters = () => {
    filters.value = {
      page: 1,
      search: '',
      client: null,
      status: null
    };
  };

  return {
    // Estado
    tiposServico,
    tipoServico,
    loading,
    error,
    totalRecords,
    filters,
    
    // Getters
    getTiposServico,
    getTipoServico,
    isLoading,
    getError,
    getTotalRecords,
    getFilters,
    
    // Actions
    fetchTiposServico,
    fetchTipoServico,
    createTipoServico,
    updateTipoServico,
    deleteTipoServico,
    toggleStatus,
    setFilters,
    resetFilters
  };
}); 