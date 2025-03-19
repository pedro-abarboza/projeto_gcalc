<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    :style="{ width: '450px' }" 
    :header="entityData.id ? 'Editar Entidade' : 'Nova Entidade'" 
    :modal="true" 
    class="p-fluid"
  >
    <!-- Campos do formulário -->
    <div class="field">
      <label for="name">Nome *</label>
      <InputText 
        id="name" 
        v-model.trim="entityData.name" 
        required="true" 
        autofocus 
        :class="{ 'p-invalid': submitted && !entityData.name }" 
      />
      <small class="p-error" v-if="submitted && !entityData.name">Nome é obrigatório.</small>
    </div>
    
    <div class="field">
      <label for="related">Item Relacionado *</label>
      <Dropdown 
        id="related" 
        v-model="entityData.related_id" 
        :options="relatedItems" 
        optionLabel="name" 
        optionValue="id" 
        placeholder="Selecione um item" 
        :class="{ 'p-invalid': submitted && !entityData.related_id }" 
        :loading="relatedItemsLoading"
      />
      <small class="p-error" v-if="submitted && !entityData.related_id">Item relacionado é obrigatório.</small>
    </div>
    
    <div class="field">
      <label for="description">Descrição</label>
      <Textarea 
        id="description" 
        v-model="entityData.description" 
        rows="3" 
        cols="20" 
      />
    </div>
    
    <div class="field">
      <label for="price">Preço *</label>
      <InputNumber 
        id="price" 
        v-model="entityData.price" 
        mode="currency" 
        currency="BRL" 
        locale="pt-BR" 
        :minFractionDigits="2" 
        :class="{ 'p-invalid': submitted && !entityData.price }" 
      />
      <small class="p-error" v-if="submitted && !entityData.price">Preço é obrigatório.</small>
    </div>
    
    <div class="field">
      <label for="date">Data</label>
      <Calendar 
        id="date" 
        v-model="entityData.date" 
        dateFormat="yy-mm-dd" 
        placeholder="AAAA-MM-DD" 
      />
    </div>
    
    <div class="field">
      <label for="status">Status</label>
      <div class="formgrid grid">
        <div class="field-radiobutton col-6">
          <RadioButton 
            id="status1" 
            name="status" 
            :value="true" 
            v-model="entityData.status" 
          />
          <label for="status1">Ativo</label>
        </div>
        <div class="field-radiobutton col-6">
          <RadioButton 
            id="status2" 
            name="status" 
            :value="false" 
            v-model="entityData.status" 
          />
          <label for="status2">Inativo</label>
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        class="p-button-text" 
        @click="hideDialog" 
        :disabled="loading"
      />
      <Button 
        label="Salvar" 
        icon="pi pi-check" 
        class="p-button-text" 
        @click="saveEntity" 
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
  import { ref, watch, computed, onMounted } from 'vue';
  import { useRelatedStore } from '@/stores/relatedStore';
  
  // Props
  const props = defineProps({
    visible: {
      type: Boolean,
      required: true
    },
    entity: {
      type: Object,
      required: true
    },
    submitted: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  });
  
  // Emits
  const emit = defineEmits(['update:visible', 'save', 'hide']);
  
  // Stores
  const relatedStore = useRelatedStore();
  
  // Estado
  const entityData = ref({
    id: null,
    name: '',
    description: '',
    related_id: null,
    price: 0,
    date: null,
    status: true
  });
  
  // Computed
  const relatedItems = computed(() => relatedStore.getItems);
  const relatedItemsLoading = computed(() => relatedStore.isLoading);
  
  // Computed para controlar a visibilidade do diálogo
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  });
  
  // Lifecycle hooks
  onMounted(async () => {
    await loadRelatedData();
  });
  
  // Watchers
  watch(() => props.visible, (newValue) => {
    if (!newValue) {
      resetForm();
    }
  });
  
  watch(() => props.entity, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
      entityData.value = { ...newValue };
      
      // Processamento adicional de dados se necessário
      // Por exemplo, converter strings para números ou datas
      if (entityData.value.related && typeof entityData.value.related === 'object') {
        entityData.value.related_id = entityData.value.related.id;
      }
      
      if (typeof entityData.value.status === 'string') {
        entityData.value.status = entityData.value.status === 'true';
      }
      
      // Converter string de data para objeto Date se necessário
      if (entityData.value.date && typeof entityData.value.date === 'string') {
        entityData.value.date = new Date(entityData.value.date);
      }
    }
  }, { deep: true, immediate: true });
  
  // Métodos
  const loadRelatedData = async () => {
    try {
      if (relatedItems.value.length === 0) {
        await relatedStore.fetchItems({ status: true });
      }
    } catch (error) {
      console.error('Erro ao carregar dados relacionados:', error);
    }
  };
  
  const resetForm = () => {
    entityData.value = {
      id: null,
      name: '',
      description: '',
      related_id: null,
      price: 0,
      date: null,
      status: true
    };
  };
  
  const hideDialog = () => {
    emit('hide');
  };
  
  const saveEntity = () => {
    // Validação
    if (!entityData.value.name || !entityData.value.related_id || !entityData.value.price) {
      return;
    }
    
    // Preparar dados para envio
    const entityToSave = { ...entityData.value };
    
    // Formatar a data para o formato esperado pela API (YYYY-MM-DD)
    if (entityToSave.date instanceof Date) {
      const year = entityToSave.date.getFullYear();
      const month = String(entityToSave.date.getMonth() + 1).padStart(2, '0');
      const day = String(entityToSave.date.getDate()).padStart(2, '0');
      entityToSave.date = `${year}-${month}-${day}`;
    }
    
    emit('save', entityToSave);
  };
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style> 