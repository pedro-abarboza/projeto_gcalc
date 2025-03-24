<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import roleService from '@/services/roleService';
    import FuncaoForm from '@/components/forms/FuncaoForm.vue';
    import { FilterMatchMode } from '@primevue/core/api';
    import { useUserStore } from '@/stores/user';
    import PermissionCheck from '@/components/permissions/PermissionCheck.vue';

    // Store de usuário para verificação de permissões
    const userStore = useUserStore();

    // Toast para mensagens
    const toast = useToast();

    // Estados da página
    const roles = ref([]);
    const loading = ref(false);
    const submitted = ref(false);
    const deleteRoleDialog = ref(false);
    const funcaoDialog = ref(false);
    const funcao = ref({
        name: '',
        permission_ids: []
    });
    const selectedRoles = ref(null);
    const isEdit = ref(false);

    // Filtros para tabela
    const filters = ref({
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'name': { value: null, matchMode: FilterMatchMode.STARTS_WITH }
    });

    // DataTable
    const expandedRows = ref([]);
    const dt = ref(null);

    // Funções para manipulação das funções
    const loadRoles = async () => {
        loading.value = true;
        try {
            const response = await roleService.getRoles({ page_size: 100 });
            roles.value = response.results || [];
        } catch (error) {
            console.error('Erro ao carregar funções:', error);
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar as funções', life: 3000 });
        } finally {
            loading.value = false;
        }
    };

    const openNew = () => {
        // Verificar permissão
        if (!userStore.hasPermission('auth.add_group')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para adicionar funções', 
                life: 3000 
            });
            return;
        }
        
        funcao.value = {
            name: '',
            permission_ids: []
        };
        submitted.value = false;
        funcaoDialog.value = true;
        isEdit.value = false;
    };

    const hideDialog = () => {
        funcaoDialog.value = false;
        submitted.value = false;
    };

    const saveRole = async () => {
        submitted.value = true;

        // Validação básica
        if (!funcao.value.name) {
            toast.add({ 
                severity: 'warn', 
                summary: 'Atenção', 
                detail: 'Preencha o nome da função', 
                life: 3000 
            });
            return;
        }

        // Verificar permissão
        if (funcao.value.id) {
            if (!userStore.hasPermission('auth.change_group')) {
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Você não tem permissão para editar funções', 
                    life: 3000 
                });
                return;
            }
        } else {
            if (!userStore.hasPermission('auth.add_group')) {
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Você não tem permissão para adicionar funções', 
                    life: 3000 
                });
                return;
            }
        }

        loading.value = true;
        try {
            if (funcao.value.id) {
                // Atualizar função existente
                await roleService.updateRole(funcao.value.id, funcao.value);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função atualizada', life: 3000 });
            } else {
                // Criar nova função
                await roleService.createRole(funcao.value);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função criada', life: 3000 });
            }
            funcaoDialog.value = false;
            await loadRoles();
        } catch (error) {
            let errorMessage = 'Erro ao salvar a função';
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    for (const [key, value] of Object.entries(error.response.data)) {
                        errorMessage = `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    }
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                }
            }
            toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
        } finally {
            loading.value = false;
        }
    };

    const editRole = (data) => {
        // Verificar permissão
        if (!userStore.hasPermission('auth.change_group')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para editar funções', 
                life: 3000 
            });
            return;
        }
        
        funcao.value = { ...data };
        
        // Mapear permissões para permission_ids
        if (funcao.value.permissions) {
            funcao.value.permission_ids = funcao.value.permissions.map(p => p.id);
        }
        
        funcaoDialog.value = true;
        isEdit.value = true;
    };

    const confirmDeleteRole = (data) => {
        // Verificar permissão
        if (!userStore.hasPermission('auth.delete_group')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir funções', 
                life: 3000 
            });
            return;
        }
        
        funcao.value = data;
        deleteRoleDialog.value = true;
    };

    const deleteRole = async () => {
        // Verificar permissão
        if (!userStore.hasPermission('auth.delete_group')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir funções', 
                life: 3000 
            });
            deleteRoleDialog.value = false;
            return;
        }
        
        loading.value = true;
        try {
            await roleService.deleteRole(funcao.value.id);
            deleteRoleDialog.value = false;
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função excluída', life: 3000 });
            await loadRoles();
        } catch (error) {
            let errorMessage = 'Erro ao excluir função';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
        } finally {
            loading.value = false;
        }
    };

    const confirmDeleteSelected = () => {
        // Verificar permissão
        if (!userStore.hasPermission('auth.delete_group')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir funções', 
                life: 3000 
            });
            return;
        }
        
        deleteRolesDialog.value = true;
    };

    const deleteSelectedRoles = async () => {
        // Verificar permissão
        if (!userStore.hasPermission('auth.delete_group')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir funções', 
                life: 3000 
            });
            deleteRolesDialog.value = false;
            return;
        }
        
        loading.value = true;
        try {
            await Promise.all(selectedRoles.value.map(role => roleService.deleteRole(role.id)));
            deleteRolesDialog.value = false;
            selectedRoles.value = null;
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Funções excluídas', life: 3000 });
            await loadRoles();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir as funções selecionadas', life: 3000 });
        } finally {
            loading.value = false;
        }
    };

    const exportCSV = () => {
        dt.value.exportCSV();
    };

    const getSeverity = (count) => {
        if (count === 0) return 'danger';
        if (count < 5) return 'warning';
        if (count < 10) return 'info';
        return 'success';
    };

    // Menu de contexto
    const menuRefs = ref({});
    const get_menuRefs = (event, id) => {
        return menuRefs.value[id] = event;
    };
    const getMenuItems = (data) => {
        const items = [];
        
        // Adicionar opção de editar se tiver permissão
        if (userStore.hasPermission('auth.change_group')) {
            items.push({
                label: 'Editar',
                icon: 'pi pi-pencil p-button-text p-button-success',
                command: () => editRole(data)
            });
        }
        
        // Adicionar opção de excluir se tiver permissão
        if (userStore.hasPermission('auth.delete_group')) {
            items.push({
                label: 'Excluir',
                icon: 'pi pi-trash p-button-text p-button-danger',
                command: () => confirmDeleteRole(data)
            });
        }
        
        return items;
    };

    const toggle = (event, data) => {
        menuRefs.value[data.id].toggle(event);
    };

    // Inicialização
    onMounted(async () => {
        try {
            await loadRoles();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error, life: 3000 });
        }
    });
</script>

<template>
    <div class="card">
        <Toast />
        <Toolbar class="mb-4">
            <template #start>
                <div class="my-2">
                    <Button label="Nova Função" v-permission="'auth.add_group'" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                    <Button label="Excluir" v-permission="'auth.delete_group'" icon="pi pi-trash" class="p-button-danger" 
                    :disabled="loading || !selectedRoles || !selectedRoles.length" @click="confirmDeleteSelected" />
                </div>
            </template>
            <template #end>
                <Button label="Exportar" v-permission:any="['auth.view_group', 'auth.change_group']" icon="pi pi-upload" severity="secondary" @click="exportCSV" :disabled="loading" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            :value="roles"
            v-model:selection="selectedRoles"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} funções"
            :loading="loading"
            :filters="filters"
            :rowHover="true"
            :globalFilterFields="['name']"
            :exportFilename="'funcoes'"
            responsiveLayout="scroll"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <h4 class="m-0">Gestão de Funções</h4>
                    </span>
                    <PermissionCheck :permissions="['auth.view_group', 'auth.change_group']">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
                        </IconField>
                    </PermissionCheck>
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            
            <Column field="name" header="Nome" sortable></Column>

            <Column field="permissions" header="Permissões" sortable :sortField="'permissions.length'" style="min-width: 10rem">
                <template #body="{ data }">
                    <Tag 
                        :value="data.permissions?.length || 0" 
                        :severity="getSeverity(data.permissions?.length || 0)" 
                        class="text-sm mr-2"
                    />  permissões
                </template>
            </Column>

            <Column headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
                <template #body="slotProps">
                    <div v-permission:any="['auth.change_group', 'auth.delete_group']">
                        <Button icon="p-button-rounded pi pi-ellipsis-v" @click="(e) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" size="small" rounded raised />
                        <Menu :ref="(e) => get_menuRefs(e, slotProps.data.id)" id="overlay_menu" :model="getMenuItems(slotProps.data)" :popup="true" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Diálogo para criar/editar funções -->
        <Dialog
            v-model:visible="funcaoDialog"
            :style="{ width: '80vw' }"
            header="Detalhes da Função"
            :modal="true"
            class="p-fluid"
        >
            <FuncaoForm
                v-model:funcao="funcao"
                :submitted="submitted"
                :loading="loading"
                @save="saveRole"
                @cancel="hideDialog"
            />
        </Dialog>

        <!-- Diálogo de confirmação para exclusão -->
        <Dialog
            v-model:visible="deleteRoleDialog"
            :style="{ width: '450px' }"
            header="Confirmar"
            :modal="true"
        >
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="funcao"
                    >Tem certeza que deseja excluir <b>{{ funcao.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button
                    label="Não"
                    icon="pi pi-times"
                    class="p-button-text"
                    @click="deleteRoleDialog = false"
                />
                <Button
                    v-permission="'auth.delete_group'"
                    label="Sim"
                    icon="pi pi-check"
                    class="p-button-danger"
                    @click="deleteRole"
                    :loading="loading"
                />
            </template>
        </Dialog>
    </div>
</template>