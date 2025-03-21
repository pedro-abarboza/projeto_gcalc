<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useGroupStore } from '@/stores/group';
import { useToast } from 'primevue/usetoast';

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        required: true
    },
    group: {
        type: Object,
        required: true
    }
});

// Emits
const emit = defineEmits(['update:visible', 'save', 'hide']);

// Store e toast
const groupStore = useGroupStore();
const toast = useToast();

// Estado local do formulário
const groupData = ref({
    id: null,
    name: '',
    permission_ids: []
});

// Estados do componente
const loading = computed(() => groupStore.isLoading);
const submitted = ref(false);
const permissionsGrouped = computed(() => groupStore.getGroupedPermissions);
const permissionList = computed(() => groupStore.getPermissions);

// Computed para controlar a visibilidade do diálogo
const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

// Lifecycle hooks
onMounted(async () => {
    try {
        // Carregar permissões disponíveis
        await groupStore.fetchPermissions();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar as permissões.',
            life: 3000
        });
    }
});

// Watchers
watch(() => props.group, (newGroup) => {
    // Resetar o formulário quando um novo grupo é fornecido
    if (newGroup) {
        groupData.value = {
            id: newGroup.id || null,
            name: newGroup.name || '',
            permission_ids: (newGroup.permissions || []).map(p => p.id)
        };
    } else {
        resetForm();
    }
}, { immediate: true, deep: true });

// Watch para fechar o diálogo
watch(() => props.visible, (newValue) => {
    if (!newValue) {
        submitted.value = false;
    }
});

// Métodos
const resetForm = () => {
    groupData.value = {
        id: null,
        name: '',
        permission_ids: []
    };
    submitted.value = false;
};

const hideDialog = () => {
    dialogVisible.value = false;
    emit('hide');
};

const isFormValid = () => {
    return !!groupData.value.name;
};

const saveGroup = async () => {
    submitted.value = true;
    
    if (!isFormValid()) {
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Por favor, preencha todos os campos obrigatórios.',
            life: 3000
        });
        return;
    }

    try {
        let result;
        
        if (groupData.value.id) {
            // Atualizar grupo existente
            result = await groupStore.updateGroup(groupData.value.id, groupData.value);
        } else {
            // Criar novo grupo
            result = await groupStore.createGroup(groupData.value);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Função ${result.name} ${groupData.value.id ? 'atualizada' : 'criada'} com sucesso!`,
            life: 3000
        });
        
        // Emitir evento de sucesso
        emit('save', result);
        
        // Fechar diálogo
        hideDialog();
    } catch (error) {
        console.error('Erro ao salvar função:', error);
        toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.response?.data?.detail || 'Ocorreu um erro ao salvar a função.',
            life: 3000
        });
    }
};

// Funções auxiliares para exibição das permissões
const getAppLabel = (appLabel) => {
    const appLabels = {
        'admin': 'Administração',
        'auth': 'Autenticação',
        'contenttypes': 'Tipos de Conteúdo',
        'sessions': 'Sessões',
        'users': 'Usuários',
        'clients': 'Clientes',
        'services': 'Serviços',
        'calculations': 'Cálculos',
        'reports': 'Relatórios'
    };
    return appLabels[appLabel] || appLabel;
};

const getModelName = (model) => {
    const modelNames = {
        'user': 'Usuário',
        'group': 'Grupo',
        'permission': 'Permissão',
        'client': 'Cliente',
        'service': 'Serviço',
        'servicetype': 'Tipo de Serviço',
        'calculation': 'Cálculo',
        'report': 'Relatório'
    };
    return modelNames[model] || model;
};

const getPermissionDescription = (codename) => {
    // Extrair o verbo e o objeto (ex: add_user -> add, user)
    const parts = codename.split('_');
    const verb = parts[0];
    
    const verbDescriptions = {
        'add': 'Adicionar',
        'change': 'Editar',
        'delete': 'Excluir',
        'view': 'Visualizar'
    };
    
    return verbDescriptions[verb] || verb;
};

// Método para selecionar todas as permissões de um modelo
const selectAllModelPermissions = (appLabel, model) => {
    const modelPermissions = permissionsGrouped.value[appLabel][model];
    const modelPermissionIds = modelPermissions.map(p => p.id);
    
    // Verificar se todas as permissões já estão selecionadas
    const allSelected = modelPermissionIds.every(id => groupData.value.permission_ids.includes(id));
    
    if (allSelected) {
        // Se todas já estão selecionadas, remover todas
        groupData.value.permission_ids = groupData.value.permission_ids.filter(id => 
            !modelPermissionIds.includes(id)
        );
    } else {
        // Se não, adicionar todas que não estão selecionadas
        const idsToAdd = modelPermissionIds.filter(id => 
            !groupData.value.permission_ids.includes(id)
        );
        groupData.value.permission_ids = [...groupData.value.permission_ids, ...idsToAdd];
    }
};

// Método para verificar se todas as permissões de um modelo estão selecionadas
const areAllModelPermissionsSelected = (appLabel, model) => {
    const modelPermissions = permissionsGrouped.value[appLabel][model];
    const modelPermissionIds = modelPermissions.map(p => p.id);
    
    return modelPermissionIds.every(id => groupData.value.permission_ids.includes(id));
};

// Método para verificar se algumas permissões de um modelo estão selecionadas
const areSomeModelPermissionsSelected = (appLabel, model) => {
    const modelPermissions = permissionsGrouped.value[appLabel][model];
    const modelPermissionIds = modelPermissions.map(p => p.id);
    
    return modelPermissionIds.some(id => groupData.value.permission_ids.includes(id)) 
        && !modelPermissionIds.every(id => groupData.value.permission_ids.includes(id));
};
</script>

<template>
    <Dialog 
        v-model:visible="dialogVisible" 
        :style="{ width: '800px' }" 
        :modal="true" 
        :closable="true" 
        :closeOnEscape="true"
        :header="group.id ? 'Editar Função' : 'Nova Função'"
    >
        <div class="grid">
            <div class="col-12">
                <div class="card">
                    <div v-if="loading" class="flex justify-content-center">
                        <ProgressSpinner />
                    </div>
                    <div v-else>
                        <div class="formgrid grid">
                            <div class="field col-12">
                                <label for="name" class="font-bold">Nome da Função*</label>
                                <InputText 
                                    id="name" 
                                    v-model="groupData.name" 
                                    :class="{ 'p-invalid': submitted && !groupData.name }" 
                                    class="w-full"
                                    placeholder="Digite o nome da função"
                                    autofocus
                                />
                                <small v-if="submitted && !groupData.name" class="p-error">O nome da função é obrigatório.</small>
                            </div>

                            <div class="field col-12">
                                <div class="font-bold mb-3">Permissões</div>
                                
                                <div class="permissions-container">
                                    <div v-for="(models, appLabel) in permissionsGrouped" :key="appLabel" class="mb-3">
                                        <Fieldset :legend="getAppLabel(appLabel)" :toggleable="true">
                                            <div v-for="(permissions, model) in models" :key="model" class="mb-3">
                                                <div class="model-header flex align-items-center mb-2">
                                                    <Checkbox 
                                                        :id="`model-${appLabel}-${model}`"
                                                        :model-value="areAllModelPermissionsSelected(appLabel, model)"
                                                        :indeterminate="areSomeModelPermissionsSelected(appLabel, model)"
                                                        @click="selectAllModelPermissions(appLabel, model)"
                                                        binary
                                                    />
                                                    <label :for="`model-${appLabel}-${model}`" class="ml-2 font-bold">{{ getModelName(model) }}</label>
                                                </div>
                                                
                                                <div class="permission-list grid">
                                                    <div v-for="permission in permissions" :key="permission.id" class="col-12 md:col-6 lg:col-3">
                                                        <div class="p-field-checkbox">
                                                            <Checkbox 
                                                                :id="`permission-${permission.id}`"
                                                                v-model="groupData.permission_ids"
                                                                :value="permission.id"
                                                                binary
                                                            />
                                                            <label :for="`permission-${permission.id}`" class="ml-2">{{ getPermissionDescription(permission.codename) }}</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Fieldset>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" :disabled="loading" />
            <Button label="Salvar" icon="pi pi-check" class="p-button-primary" @click="saveGroup" :loading="loading" />
        </template>
    </Dialog>
</template>

<style scoped>
.permissions-container {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
}

.model-header {
    background-color: var(--surface-100);
    padding: 0.5rem;
    border-radius: 4px;
}
</style> 