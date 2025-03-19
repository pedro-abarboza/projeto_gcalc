import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from './auth';

export const useEntityStore = defineStore('entity', () => {
  // Estado
  const items = ref([]);
  const item = ref({});
  const loading = ref(false);
  const error = ref(null);
  const totalRecords = ref(0);
  const filters = ref({
    page: 1,
    search: '',
    // outros filtros específicos
  });

  // Getters
  const getItems = computed(() => items.value);
  const getItem = computed(() => item.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getTotalRecords = computed(() => totalRecords.value);
  const getFilters = computed(() => filters.value);

  // Actions
  const fetchItems = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const authStore = useAuthStore();
      const params = {
        page: filters.value.page,
        // outros parâmetros
      };
      
      // Adicionar filtros condicionalmente
      if (filters.value.search) {
        params.search = filters.value.search;
      }
      
      const response = await axios.get('/api/endpoint/', {
        headers: {
          Authorization: `Token ${authStore.token}`
        },
        params
      });
      
      items.value = response.data.results;
      totalRecords.value = response.data.count;
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      error.value = error.response?.data?.detail || 'Erro ao buscar itens';
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const fetchItem = async (id) => {
    loading.value = true;
    error.value = null;
    
    try {
      const authStore = useAuthStore();
      const response = await axios.get(`/api/endpoint/${id}/`, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      item.value = response.data;
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      error.value = error.response?.data?.detail || 'Erro ao buscar item';
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const createItem = async (data) => {
    loading.value = true;
    error.value = null;
    const toast = useToast();
    
    try {
      const authStore = useAuthStore();
      const response = await axios.post('/api/endpoint/', data, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      item.value = response.data;
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item criado com sucesso', life: 3000 });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      error.value = error.response?.data || 'Erro ao criar item';
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar item', life: 3000 });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const updateItem = async (id, data) => {
    loading.value = true;
    error.value = null;
    const toast = useToast();
    
    try {
      const authStore = useAuthStore();
      const response = await axios.put(`/api/endpoint/${id}/`, data, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      item.value = response.data;
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item atualizado com sucesso', life: 3000 });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      error.value = error.response?.data || 'Erro ao atualizar item';
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar item', life: 3000 });
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  const deleteItem = async (id) => {
    loading.value = true;
    error.value = null;
    const toast = useToast();
    
    try {
      const authStore = useAuthStore();
      await axios.delete(`/api/endpoint/${id}/`, {
        headers: {
          Authorization: `Token ${authStore.token}`
        }
      });
      
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item excluído com sucesso', life: 3000 });
      return true;
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      error.value = error.response?.data?.detail || 'Erro ao excluir item';
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir item', life: 3000 });
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
      // resetar outros filtros
    };
  };

  return {
    // Estado
    items,
    item,
    loading,
    error,
    totalRecords,
    filters,
    
    // Getters
    getItems,
    getItem,
    isLoading,
    getError,
    getTotalRecords,
    getFilters,
    
    // Actions
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    setFilters,
    resetFilters
  };
}); 