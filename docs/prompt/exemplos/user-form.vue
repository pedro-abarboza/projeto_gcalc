<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    :style="{ width: '500px' }" 
    :header="userData.id ? 'Editar Usuário' : 'Novo Usuário'" 
    :modal="true" 
    class="p-fluid"
  >
    <!-- Campos do formulário -->
    <div class="field">
      <label for="username">Nome de Usuário *</label>
      <InputText 
        id="username" 
        v-model.trim="userData.username" 
        required="true" 
        autofocus 
        :class="{ 'p-invalid': submitted && !userData.username }" 
      />
      <small class="p-error" v-if="submitted && !userData.username">Nome de usuário é obrigatório.</small>
    </div>
    
    <div class="field">
      <label for="email">Email *</label>
      <InputText 
        id="email" 
        v-model.trim="userData.email" 
        required="true" 
        type="email"
        :class="{ 'p-invalid': submitted && !userData.email }" 
      />
      <small class="p-error" v-if="submitted && !userData.email">Email é obrigatório.</small>
      <small class="p-error" v-if="submitted && userData.email && !isValidEmail(userData.email)">Email inválido.</small>
    </div>
    
    <div class="formgrid grid">
      <div class="field col-12 md:col-6">
        <label for="first_name">Nome *</label>
        <InputText 
          id="first_name" 
          v-model.trim="userData.first_name" 
          required="true" 
          :class="{ 'p-invalid': submitted && !userData.first_name }" 
        />
        <small class="p-error" v-if="submitted && !userData.first_name">Nome é obrigatório.</small>
      </div>
      
      <div class="field col-12 md:col-6">
        <label for="last_name">Sobrenome</label>
        <InputText 
          id="last_name" 
          v-model.trim="userData.last_name" 
        />
      </div>
    </div>
    
    <div v-if="!userData.id" class="formgrid grid">
      <div class="field col-12 md:col-6">
        <label for="password">Senha *</label>
        <Password 
          id="password" 
          v-model="userData.password" 
          required="true" 
          toggleMask 
          :feedback="true"
          :class="{ 'p-invalid': submitted && !userData.password }" 
        />
        <small class="p-error" v-if="submitted && !userData.password">Senha é obrigatória.</small>
      </div>
      
      <div class="field col-12 md:col-6">
        <label for="password_confirm">Confirmar Senha *</label>
        <Password 
          id="password_confirm" 
          v-model="userData.password_confirm" 
          required="true" 
          toggleMask
          :class="{ 'p-invalid': submitted && (!userData.password_confirm || userData.password !== userData.password_confirm) }" 
        />
        <small class="p-error" v-if="submitted && !userData.password_confirm">Confirmação de senha é obrigatória.</small>
        <small class="p-error" v-if="submitted && userData.password_confirm && userData.password !== userData.password_confirm">As senhas não coincidem.</small>
      </div>
    </div>
    
    <div v-if="isAdmin" class="field">
      <label for="groups">Grupos</label>
      <MultiSelect 
        id="groups" 
        v-model="userData.groups" 
        :options="availableGroups" 
        optionLabel="name" 
        optionValue="id" 
        placeholder="Selecione os grupos" 
        display="chip"
        :loading="groupsLoading"
      />
    </div>
    
    <div v-if="isAdmin" class="formgrid grid">
      <div class="field-checkbox col-12 md:col-6">
        <Checkbox id="is_active" v-model="userData.is_active" :binary="true" />
        <label for="is_active">Ativo</label>
      </div>
      
      <div class="field-checkbox col-12 md:col-6">
        <Checkbox id="is_staff" v-model="userData.is_staff" :binary="true" />
        <label for="is_staff">Administrador</label>
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
        @click="saveUser" 
        :loading="loading"
      />
    </template>
  </Dialog>
</template>

<script setup>
  import { ref, watch, computed, onMounted } from 'vue';
  import { useGroupStore } from '@/stores/group';
  import { useAuthStore } from '@/stores/auth';
  
  // Props
  const props = defineProps({
    visible: {
      type: Boolean,
      required: true
    },
    user: {
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
  const groupStore = useGroupStore();
  const authStore = useAuthStore();
  
  // Estado
  const userData = ref({
    id: null,
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    is_active: true,
    is_staff: false,
    groups: []
  });
  
  // Computed
  const availableGroups = computed(() => groupStore.getGroups);
  const groupsLoading = computed(() => groupStore.isLoading);
  const isAdmin = computed(() => authStore.isAdmin);
  
  // Computed para controlar a visibilidade do diálogo
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  });
  
  // Lifecycle hooks
  onMounted(async () => {
    if (isAdmin.value) {
      await loadGroups();
    }
  });
  
  // Watchers
  watch(() => props.visible, (newValue) => {
    if (!newValue) {
      resetForm();
    }
  });
  
  watch(() => props.user, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
      userData.value = { 
        ...newValue,
        // Garantir que grupos seja sempre um array
        groups: newValue.groups || []
      };
    }
  }, { deep: true, immediate: true });
  
  // Métodos
  const loadGroups = async () => {
    try {
      if (availableGroups.value.length === 0) {
        await groupStore.fetchGroups();
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };
  
  const resetForm = () => {
    userData.value = {
      id: null,
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
      is_active: true,
      is_staff: false,
      groups: []
    };
  };
  
  const hideDialog = () => {
    emit('hide');
  };
  
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const saveUser = () => {
    // Validação
    if (!userData.value.username || !userData.value.email || !userData.value.first_name) {
      return;
    }
    
    if (!isValidEmail(userData.value.email)) {
      return;
    }
    
    // Validação adicional para novo usuário (senha obrigatória)
    if (!userData.value.id) {
      if (!userData.value.password || !userData.value.password_confirm) {
        return;
      }
      
      if (userData.value.password !== userData.value.password_confirm) {
        return;
      }
    }
    
    // Preparar dados para envio
    const userToSave = { ...userData.value };
    
    // Remover confirmação de senha antes de enviar
    delete userToSave.password_confirm;
    
    // Se estiver editando e não houver nova senha, remover campo de senha
    if (userToSave.id && !userToSave.password) {
      delete userToSave.password;
    }
    
    emit('save', userToSave);
  };
</script>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style> 