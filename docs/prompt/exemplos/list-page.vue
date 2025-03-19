<template>
  <div class="card">
    <Toast />
    <Toolbar class="mb-4">
      <template #start>
        <div class="my-2">
          <Button label="Novo" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
          <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedItems || !selectedItems.length || loading" />
        </div>
      </template>

      <template #end>
        <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" :disabled="loading" />
      </template>
    </Toolbar>

    <DataTable
      ref="dt"
      :value="items"
      v-model:selection="selectedItems"
      dataKey="id"
      :paginator="true"
      :rows="10"
      :filters="filters"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :rowsPerPageOptions="[5, 10, 25]"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} itens"
      responsiveLayout="scroll"
      :loading="loading"
    >
      <template #header>
        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
          <h5 class="m-0">Gerenciar Entidades</h5>
          <span class="block mt-2 md:mt-0 p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
          </span>
        </div>
      </template>

      <template #empty>
        <div class="text-center p-4" v-if="loading">
          Carregando itens...
        </div>
        <div class="text-center p-4" v-else>
          Nenhum item encontrado.
        </div>
      </template>

      <template #loading>
        <div class="text-center p-4">
          Carregando itens...
        </div>
      </template>

      <!-- Colunas da tabela -->
      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
      <Column field="id" header="ID" :sortable="true" headerStyle="width: 3rem; min-width: 3rem"></Column>
      <Column field="name" header="Nome" :sortable="true" headerStyle="min-width: 14rem"></Column>
      <Column field="description" header="Descrição" :sortable="true" headerStyle="min-width: 14rem"></Column>
      <Column field="related_id" header="Item Relacionado" :sortable="true" headerStyle="min-width: 14rem">
        <template #body="slotProps">
          {{ getRelatedName(slotProps.data.related_id) }}
        </template>
      </Column>
      <Column field="price" header="Preço" :sortable="true" headerStyle="min-width: 10rem">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.price) }}
        </template>
      </Column>
      <Column field="date" header="Data" :sortable="true" headerStyle="min-width: 10rem">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>
      <Column field="status" header="Status" :sortable="true" headerStyle="min-width: 8rem">
        <template #body="slotProps">
          <Tag :value="slotProps.data.status ? 'Ativo' : 'Inativo'" :severity="slotProps.data.status ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column headerStyle="min-width: 10rem">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editItem(slotProps.data)" :disabled="loading" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteItem(slotProps.data)" :disabled="loading" />
        </template>
      </Column>
    </DataTable>

    <!-- Formulário em diálogo -->
    <EntityForm
      v-model:visible="entityDialog"
      :entity="entity"
      :submitted="submitted"
      :loading="loading"
      @save="saveEntity"
      @hide="hideDialog"
    />

    <!-- Diálogos de confirmação -->
    <Dialog v-model:visible="deleteEntityDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="entity">Tem certeza que deseja excluir <b>{{ entity.name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteEntityDialog = false" :disabled="loading" />
        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteEntityConfirm" :loading="loading" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteEntitiesDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Tem certeza que deseja excluir os itens selecionados?</span>
      </div>
      <template #footer>
        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteEntitiesDialog = false" :disabled="loading" />
        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedEntities" :loading="loading" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { FilterMatchMode } from 'primevue/api';
  import { useEntityStore } from '@/stores/entity';
  import { useRelatedStore } from '@/stores/relatedStore';
  import EntityForm from '@/components/forms/EntityForm.vue';

  // Stores
  const entityStore = useEntityStore();
  const relatedStore = useRelatedStore();
  const toast = useToast();
  const dt = ref(null);

  // Estado
  const entity = ref({});
  const items = computed(() => entityStore.getItems);
  const selectedItems = ref([]);
  const entityDialog = ref(false);
  const deleteEntityDialog = ref(false);
  const deleteEntitiesDialog = ref(false);
  const submitted = ref(false);
  const loading = computed(() => entityStore.isLoading);
  const totalRecords = computed(() => entityStore.getTotalRecords);
  const relatedItems = computed(() => relatedStore.getItems);
  const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  // Lifecycle hooks
  onMounted(async () => {
    await loadData();
  });

  // Métodos
  const loadData = async () => {
    try {
      await Promise.all([
        entityStore.fetchItems(),
        relatedStore.fetchItems()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: error.response?.data?.detail || 'Erro ao carregar dados', 
        life: 3000 
      });
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRelatedName = (relatedId) => {
    const related = relatedItems.value.find(r => r.id === relatedId);
    return related ? related.name : '';
  };

  const openNew = () => {
    entity.value = {
      name: '',
      description: '',
      related_id: null,
      price: 0,
      date: null,
      status: true
    };
    submitted.value = false;
    entityDialog.value = true;
  };

  const hideDialog = () => {
    entityDialog.value = false;
    submitted.value = false;
  };

  const saveEntity = async (data) => {
    submitted.value = true;

    if (!data.name || !data.related_id || !data.price) {
      toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios', life: 3000 });
      return;
    }

    try {
      if (data.id) {
        // Atualizar entidade existente
        await entityStore.updateItem(data.id, data);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item atualizado', life: 3000 });
      } else {
        // Criar nova entidade
        await entityStore.createItem(data);
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item criado', life: 3000 });
      }

      entityDialog.value = false;
      entity.value = {};
      submitted.value = false;
      await entityStore.fetchItems();
    } catch (error) {
      let errorMessage = 'Erro ao salvar item';
      
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        
        if (typeof responseData === 'object' && responseData !== null) {
          const errorMessages = [];
          
          Object.keys(responseData).forEach(field => {
            const fieldErrors = responseData[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
            } else if (typeof fieldErrors === 'string') {
              errorMessages.push(`${field}: ${fieldErrors}`);
            }
          });
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('\n');
          }
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: errorMessage, 
        life: 5000,
        sticky: errorMessage.includes('\n')
      });
    }
  };

  const editItem = (data) => {
    entity.value = { ...data };
    entityDialog.value = true;
  };

  const confirmDeleteItem = (data) => {
    entity.value = data;
    deleteEntityDialog.value = true;
  };

  const deleteEntityConfirm = async () => {
    try {
      await entityStore.deleteItem(entity.value.id);
      deleteEntityDialog.value = false;
      entity.value = {};
      await entityStore.fetchItems();
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Item excluído', life: 3000 });
    } catch (error) {
      toast.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: error.response?.data?.detail || 'Erro ao excluir item', 
        life: 3000 
      });
    }
  };

  const confirmDeleteSelected = () => {
    deleteEntitiesDialog.value = true;
  };

  const deleteSelectedEntities = async () => {
    try {
      if (selectedItems.value && selectedItems.value.length > 0) {
        for (const item of selectedItems.value) {
          await entityStore.deleteItem(item.id);
        }
        deleteEntitiesDialog.value = false;
        selectedItems.value = [];
        await entityStore.fetchItems();
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Itens excluídos', life: 3000 });
      }
    } catch (error) {
      toast.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: error.response?.data?.detail || 'Erro ao excluir itens', 
        life: 3000 
      });
    }
  };

  const exportCSV = () => {
    dt.value?.exportCSV();
  };
</script> 