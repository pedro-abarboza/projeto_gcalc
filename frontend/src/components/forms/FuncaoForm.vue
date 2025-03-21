<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import permissionService from '@/services/permissionService';

const props = defineProps({
    funcao: {
        type: Object,
        required: true,
        default: () => ({
            name: '',
            permission_ids: []
        })
    },
    submitted: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:funcao', 'save', 'cancel']);

// Estados locais
const permissionsLoading = ref(false);
const availablePermissions = ref([]);
const permissionFilter = ref('');
const selectedPermissionIds = ref([]);
const groupedPermissions = ref({});

// Permissões filtradas com base na busca
const filteredPermissions = computed(() => {
    if (!permissionFilter.value) {
        return availablePermissions.value;
    }
    
    const searchTerm = permissionFilter.value.toLowerCase();
    return availablePermissions.value.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.codename.toLowerCase().includes(searchTerm)
    );
});

// Aplicativos disponíveis no sistema (agrupamento)
const appLabels = computed(() => {
    return Object.keys(groupedPermissions.value).sort();
});

// Carregar as permissões disponíveis no sistema
const loadPermissions = async () => {
    permissionsLoading.value = true;
    try {
        const response = await permissionService.getPermissions({
            page_size: 1000 // Buscar todas as permissões de uma vez
        });
        
        availablePermissions.value = response.results || [];
        
        // Agrupar permissões por app_label
        const grouped = {};
        availablePermissions.value.forEach(perm => {
            if (!grouped[perm.app_label]) {
                grouped[perm.app_label] = [];
            }
            grouped[perm.app_label].push(perm);
        });
        
        // Ordenar permissões dentro de cada grupo
        Object.keys(grouped).forEach(app => {
            grouped[app].sort((a, b) => {
                // Ordenar primeiro por model, depois por tipo de permissão
                if (a.model !== b.model) {
                    return a.model.localeCompare(b.model);
                }
                return a.name.localeCompare(b.name);
            });
        });
        
        groupedPermissions.value = grouped;
        
        // Inicializar seleção se já tivermos permissões
        if (props.funcao.permission_ids && props.funcao.permission_ids.length > 0) {
            selectedPermissionIds.value = [...props.funcao.permission_ids];
        } else if (props.funcao.permissions && props.funcao.permissions.length > 0) {
            // Caso o objeto venha com permissões como objetos (leitura da API)
            selectedPermissionIds.value = props.funcao.permissions.map(p => p.id);
        }
    } catch (error) {
        console.error('Erro ao carregar permissões:', error);
    } finally {
        permissionsLoading.value = false;
    }
};

// Formatadores
const formatPermissionName = (name) => {
    return name
        .replace(/^Can /, '')
        .replace(' content type', '')
        .replace(' session', '')
        .replace(' permission', '')
        .replace(' group', '')
        .replace(' user', '')
        .charAt(0).toUpperCase() + name.slice(1)
        .replace(/^Can /, '');
};

const formatAppLabel = (label) => {
    // Formatar o nome do aplicativo para exibição
    const labelMap = {
        'auth': 'Autenticação',
        'admin': 'Administração',
        'contenttypes': 'Tipos de Conteúdo',
        'sessions': 'Sessões',
        'users': 'Usuários',
        'clients': 'Clientes',
        'services': 'Serviços',
        'calculations': 'Cálculos'
    };
    
    return labelMap[label] || label.charAt(0).toUpperCase() + label.slice(1);
};

const formatModelName = (model) => {
    // Formatar o nome do modelo para exibição
    const modelMap = {
        'permission': 'Permissão',
        'group': 'Grupo',
        'user': 'Usuário',
        'contenttype': 'Tipo de Conteúdo',
        'session': 'Sessão',
        'client': 'Cliente',
        'service': 'Serviço',
        'servicetype': 'Tipo de Serviço',
        'calculation': 'Cálculo'
    };
    
    return modelMap[model] || model.charAt(0).toUpperCase() + model.slice(1);
};

// Atualizar a função quando as permissões selecionadas mudarem
watch(selectedPermissionIds, (newValue) => {
    updateFuncao('permission_ids', newValue);
});

// Atualizar o estado local quando as props mudarem
watch(() => props.funcao, (newValue) => {
    if (newValue.permission_ids && newValue.permission_ids.length > 0) {
        selectedPermissionIds.value = [...newValue.permission_ids];
    } else if (newValue.permissions && newValue.permissions.length > 0) {
        selectedPermissionIds.value = newValue.permissions.map(p => p.id);
    } else {
        selectedPermissionIds.value = [];
    }
}, { deep: true, immediate: true });

// Função para atualizar o objeto funcao
const updateFuncao = (field, value) => {
    const updatedFuncao = { ...props.funcao, [field]: value };
    emit('update:funcao', updatedFuncao);
};

// Funções de ação
const saveForm = () => {
    emit('save');
};

const cancelForm = () => {
    emit('cancel');
};

// Selecionar/remover todas as permissões de um aplicativo
const toggleAllAppPermissions = (appLabel, checked) => {
    const permissions = groupedPermissions.value[appLabel] || [];
    const permissionIds = permissions.map(p => p.id);
    
    if (checked) {
        // Adicionar todas as permissões do app que ainda não foram selecionadas
        const newSelectedIds = [...selectedPermissionIds.value];
        permissionIds.forEach(id => {
            if (!newSelectedIds.includes(id)) {
                newSelectedIds.push(id);
            }
        });
        selectedPermissionIds.value = newSelectedIds;
    } else {
        // Remover todas as permissões do app que estão selecionadas
        selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !permissionIds.includes(id));
    }
};

// Verificar se todas as permissões de um aplicativo estão selecionadas
const areAllAppPermissionsSelected = (appLabel) => {
    const permissions = groupedPermissions.value[appLabel] || [];
    if (permissions.length === 0) return false;
    
    return permissions.every(p => selectedPermissionIds.value.includes(p.id));
};

// Verificar se algumas permissões de um aplicativo estão selecionadas
const areSomeAppPermissionsSelected = (appLabel) => {
    const permissions = groupedPermissions.value[appLabel] || [];
    if (permissions.length === 0) return false;
    
    return permissions.some(p => selectedPermissionIds.value.includes(p.id)) && 
           !permissions.every(p => selectedPermissionIds.value.includes(p.id));
};

// Selecionar/remover todas as permissões de um modelo específico
const toggleAllModelPermissions = (appLabel, model, checked) => {
    const permissions = (groupedPermissions.value[appLabel] || [])
                        .filter(p => p.model === model);
    const permissionIds = permissions.map(p => p.id);
    
    if (checked) {
        // Adicionar todas as permissões do modelo que ainda não foram selecionadas
        const newSelectedIds = [...selectedPermissionIds.value];
        permissionIds.forEach(id => {
            if (!newSelectedIds.includes(id)) {
                newSelectedIds.push(id);
            }
        });
        selectedPermissionIds.value = newSelectedIds;
    } else {
        // Remover todas as permissões do modelo que estão selecionadas
        selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !permissionIds.includes(id));
    }
};

// Verificar se todas as permissões de um modelo estão selecionadas
const areAllModelPermissionsSelected = (appLabel, model) => {
    const permissions = (groupedPermissions.value[appLabel] || [])
                        .filter(p => p.model === model);
    if (permissions.length === 0) return false;
    
    return permissions.every(p => selectedPermissionIds.value.includes(p.id));
};

// Verificar se algumas permissões de um modelo estão selecionadas
const areSomeModelPermissionsSelected = (appLabel, model) => {
    const permissions = (groupedPermissions.value[appLabel] || [])
                        .filter(p => p.model === model);
    if (permissions.length === 0) return false;
    
    return permissions.some(p => selectedPermissionIds.value.includes(p.id)) && 
           !permissions.every(p => selectedPermissionIds.value.includes(p.id));
};

// Agrupar permissões por modelo
const getModelPermissions = (appLabel) => {
    const permissions = groupedPermissions.value[appLabel] || [];
    const models = [...new Set(permissions.map(p => p.model))].sort();
    
    return models.map(model => ({
        model,
        permissions: permissions.filter(p => p.model === model)
    }));
};

// Inicialização
onMounted(() => {
    loadPermissions();
});
</script>

<template>
    <div class="p-fluid">
        <div class="field">
            <label for="name">Nome</label>
            <InputText 
                id="name" 
                :modelValue="funcao?.name || ''"
                @update:modelValue="value => updateFuncao('name', value?.trim())"
                required 
                autofocus 
                :class="{ 'p-invalid': submitted && !funcao?.name }" 
                :disabled="loading"
            />
            <small class="p-error" v-if="submitted && !funcao?.name">Nome da função é obrigatório.</small>
        </div>
        
        <div class="field">
            <div class="flex justify-content-between align-items-center mb-2">
                <label>Permissões</label>
                <span v-if="!permissionsLoading">{{ selectedPermissionIds.length }} selecionadas</span>
            </div>
            
            <div v-if="permissionsLoading" class="flex align-items-center justify-content-center p-4">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
                <div class="ml-3">Carregando permissões...</div>
            </div>
            
            <div v-else>
                <div class="field mb-3">
                    <span class="p-input-icon-left w-full">
                        <i class="pi pi-search" />
                        <InputText v-model="permissionFilter" placeholder="Filtrar permissões..." class="w-full" />
                    </span>
                </div>
                
                <div class="permissions-container border-1 surface-border border-round p-3" style="max-height: 400px; overflow-y: auto;">
                    <div v-if="!permissionFilter">
                        <!-- Visualização agrupada por aplicativo e modelo -->
                        <Accordion :multiple="true" class="mb-3">
                            <AccordionTab v-for="appLabel in appLabels" :key="appLabel">
                                <template #header>
                                    <div class="flex align-items-center">
                                        <TriStateCheckbox 
                                            v-model="selectedPermissionIds"
                                            :value="areSomeAppPermissionsSelected(appLabel) ? null : areAllAppPermissionsSelected(appLabel)"
                                            @update:modelValue="value => toggleAllAppPermissions(appLabel, value)"
                                            :disabled="loading"
                                            class="mr-2"
                                        />
                                        <span class="font-semibold">{{ formatAppLabel(appLabel) }}</span>
                                        <Badge :value="groupedPermissions[appLabel].length" severity="info" class="ml-2" />
                                    </div>
                                </template>
                                
                                <div v-for="modelGroup in getModelPermissions(appLabel)" :key="`${appLabel}_${modelGroup.model}`" class="mb-4">
                                    <div class="flex align-items-center mb-2">
                                        <TriStateCheckbox 
                                            v-model="selectedPermissionIds"
                                            :value="areSomeModelPermissionsSelected(appLabel, modelGroup.model) ? null : areAllModelPermissionsSelected(appLabel, modelGroup.model)"
                                            @update:modelValue="value => toggleAllModelPermissions(appLabel, modelGroup.model, value)"
                                            :disabled="loading"
                                            class="mr-2"
                                        />
                                        <span class="font-medium">{{ formatModelName(modelGroup.model) }}</span>
                                    </div>
                                    
                                    <div class="ml-4 grid">
                                        <div v-for="perm in modelGroup.permissions" :key="perm.id" class="col-12 md:col-6 lg:col-4 mb-2">
                                            <div class="flex align-items-center">
                                                <Checkbox 
                                                    :model-value="selectedPermissionIds.includes(perm.id)"
                                                    @update:model-value="(checked) => {
                                                        if (checked) {
                                                            selectedPermissionIds.push(perm.id);
                                                        } else {
                                                            selectedPermissionIds = selectedPermissionIds.filter(id => id !== perm.id);
                                                        }
                                                    }"
                                                    :input-id="`perm_${perm.id}`"
                                                    :binary="true"
                                                    :disabled="loading"
                                                />
                                                <label :for="`perm_${perm.id}`" class="ml-2 cursor-pointer">
                                                    {{ formatPermissionName(perm.name) }}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTab>
                        </Accordion>
                    </div>
                    <div v-else class="grid">
                        <!-- Visualização de busca -->
                        <div v-for="perm in filteredPermissions" :key="perm.id" class="col-12 md:col-6 lg:col-4 mb-2">
                            <div class="flex align-items-center">
                                <Checkbox 
                                    :model-value="selectedPermissionIds.includes(perm.id)"
                                    @update:model-value="(checked) => {
                                        if (checked) {
                                            selectedPermissionIds.push(perm.id);
                                        } else {
                                            selectedPermissionIds = selectedPermissionIds.filter(id => id !== perm.id);
                                        }
                                    }"
                                    :input-id="`perm_search_${perm.id}`"
                                    :binary="true"
                                    :disabled="loading"
                                />
                                <label :for="`perm_search_${perm.id}`" class="ml-2 cursor-pointer">
                                    <div>{{ formatPermissionName(perm.name) }}</div>
                                    <small class="text-color-secondary">{{ formatAppLabel(perm.app_label) }} | {{ formatModelName(perm.model) }}</small>
                                </label>
                            </div>
                        </div>
                        
                        <div v-if="filteredPermissions.length === 0" class="col-12 text-center p-4">
                            <i class="pi pi-search" style="font-size: 2rem"></i>
                            <div class="mt-2">Nenhuma permissão encontrada com o termo "{{ permissionFilter }}"</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="flex justify-content-end mt-4">
            <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                class="p-button-text" 
                @click="cancelForm" 
                :disabled="loading" 
            />
            <Button 
                label="Salvar" 
                icon="pi pi-check" 
                class="p-button-primary ml-2" 
                @click="saveForm" 
                :loading="loading" 
            />
        </div>
    </div>
</template>

<style scoped>
.permissions-container {
    background-color: var(--surface-ground);
}
</style> 