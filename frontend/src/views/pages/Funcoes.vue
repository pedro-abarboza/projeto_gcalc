<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import roleService from '@/services/roleService';
    import FuncaoForm from '@/components/forms/FuncaoForm.vue';
    import { FilterMatchMode } from '@primevue/core/api';

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
        if (!funcao.value.name?.trim()) {
            toast.add({ severity: 'warn', summary: 'Atenção', detail: 'O nome da função é obrigatório', life: 3000 });
            return;
        }
        
        try {
            loading.value = true;
            
            if (isEdit.value) {
                // Atualizar função existente
                await roleService.updateRole(funcao.value.id, {
                    name: funcao.value.name,
                    permission_ids: funcao.value.permission_ids
                });
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função atualizada com sucesso', life: 3000 });
            } else {
                // Criar nova função
                await roleService.createRole({
                    name: funcao.value.name,
                    permission_ids: funcao.value.permission_ids
                });
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função criada com sucesso', life: 3000 });
            }
            
            // Recarregar a lista
            await loadRoles();
            hideDialog();
        } catch (error) {
            console.error('Erro ao salvar função:', error);
            const mensagem = error.response?.data?.detail || 'Ocorreu um erro ao salvar a função';
            toast.add({ severity: 'error', summary: 'Erro', detail: mensagem, life: 3000 });
        } finally {
            loading.value = false;
        }
    };

    const editRole = (role) => {
        // Clone para não modificar diretamente o objeto original
        funcao.value = {
            id: role.id,
            name: role.name,
            permission_ids: role.permissions?.map(p => p.id) || []
        };
        
        isEdit.value = true;
        funcaoDialog.value = true;
    };

    const confirmDeleteRole = (role) => {
        funcao.value = role;
        deleteRoleDialog.value = true;
    };

    const deleteRole = async () => {
        try {
            loading.value = true;
            await roleService.deleteRole(funcao.value.id);
            
            // Remover da lista local
            roles.value = roles.value.filter(r => r.id !== funcao.value.id);
            
            deleteRoleDialog.value = false;
            funcao.value = {};
            
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Função excluída com sucesso', life: 3000 });
        } catch (error) {
            console.error('Erro ao excluir função:', error);
            const mensagem = error.response?.data?.detail || 'Ocorreu um erro ao excluir a função';
            toast.add({ severity: 'error', summary: 'Erro', detail: mensagem, life: 3000 });
        } finally {
            loading.value = false;
        }
    };

    // Utilitários
    const exportCSV = () => {
        dt.value.exportCSV();
    };

    const getSeverity = (permissionCount) => {
        if (permissionCount > 20) return 'danger';
        if (permissionCount > 10) return 'warning';
        return 'success';
    };

    // Menu de contexto
    const menuRefs = ref({});
    const get_menuRefs = (event, id) => {
        return menuRefs.value[id] = event;
    };
    const getMenuItems = (data) => [
        {
            label: 'Editar',
            icon: 'pi pi-pencil p-button-text p-button-success',
            command: () => editRole(data)
        },
        {
            label: 'Excluir',
            icon: 'pi pi-trash p-button-text p-button-danger',
            command: () => confirmDeleteRole(data)
        }
    ];

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
                    <Button label="Nova Função" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                    <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" 
                    :disabled="loading || !selectedRoles || !selectedRoles.length" @click="confirmDeleteSelected" />
                </div>
            </template>
            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV" :disabled="loading" />
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
                    <IconField>
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
                    </IconField>
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
                    <Button icon="p-button-rounded pi pi-ellipsis-v" @click="(e) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" size="small" rounded raised />
                    <Menu :ref="(e) => get_menuRefs(e, slotProps.data.id)" id="overlay_menu" :model="getMenuItems(slotProps.data)" :popup="true" />
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