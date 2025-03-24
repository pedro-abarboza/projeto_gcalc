<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode } from '@primevue/core/api';
    import { useClientStore } from '@/stores/client';
    import { useUserStore } from '@/stores/user';
    import ClientForm from '@/components/forms/ClientForm.vue';
    import PermissionCheck from '@/components/permissions/PermissionCheck.vue';

    const clientStore = useClientStore();
    const userStore = useUserStore();
    const toast = useToast();
    const dt = ref(null);
    
    // Computed properties
    const clients = computed(() => {
        // Garantir que clients seja sempre um array
        return Array.isArray(clientStore.getClients) ? clientStore.getClients : [];
    });
    const loading = computed(() => clientStore.isLoading);
    const error = computed(() => clientStore.getError);
    
    const submitted = ref(false);
    const clientDialog = ref(false);
    const deleteClientDialog = ref(false);
    const deleteClientsDialog = ref(false);
    const client = ref({});
    const selectedClients = ref([]);
    
    const exportCSV = () => {
        dt.value?.exportCSV();
    };
    
    const openNew = () => {
        if (!userStore.hasPermission('clients.add_client')) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para adicionar clientes', life: 3000 });
            return;
        }
        
        client.value = {
            name: '',
            document_type: 'cpf',
            document_number: '',
            email: '',
            phone: '',
            address: '',
            notes: '',
            status: true
        };
        submitted.value = false;
        clientDialog.value = true;
    };

    const hideDialog = () => {
        clientDialog.value = false;
        submitted.value = false;
    };

    const saveClient = async () => {
        submitted.value = true;
        
        // Validar campos obrigatórios
        if (!client.value.name || !client.value.document_type || !client.value.document_number || 
            !client.value.email) {
            return;
        }
        
        try {
            if (client.value.id) {
                // Verificar permissão para editar
                if (!userStore.hasPermission('clients.change_client')) {
                    toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para editar clientes', life: 3000 });
                    return;
                }
                // Atualizar cliente existente
                await clientStore.updateClient(client.value.id, client.value);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado', life: 3000 });
            } else {
                // Verificar permissão para adicionar
                if (!userStore.hasPermission('clients.add_client')) {
                    toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para adicionar clientes', life: 3000 });
                    return;
                }
                // Criar novo cliente
                await clientStore.createClient(client.value);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente criado', life: 3000 });
            }
            clientDialog.value = false;
            client.value = {};
            submitted.value = false;
        } catch (err) {
            console.error('Erro ao salvar cliente:', err);
            let errorMessage = 'Erro ao salvar cliente';
            
            if (err.response && err.response.data) {
                const responseData = err.response.data;
                
                // Verificar se é um objeto com campos de erro
                if (typeof responseData === 'object' && responseData !== null) {
                    const errorMessages = [];
                    
                    // Percorrer todos os campos com erro
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
                    // Mensagem de erro direta
                    errorMessage = responseData.detail;
                } else if (typeof responseData === 'string') {
                    // Resposta de erro como string
                    errorMessage = responseData;
                }
            } else if (err.message) {
                // Erro com mensagem
                errorMessage = err.message;
            }
            
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: errorMessage, 
                life: 5000,
                sticky: errorMessage.includes('\n') // Tornar mensagens com múltiplas linhas fixas
            });
        }
    };
    
    const filters = ref({
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'status': { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    const formatDate = (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusSeverity = (isActive) => {
        return isActive ? 'success' : 'danger';
    };

    const getStatusLabel = (isActive) => {
        return isActive ? 'Ativo' : 'Inativo';
    };

    const toggleClientStatus = async (client) => {
        try {
            // Invertendo o status atual
            const newStatus = !client.status;
            await clientStore.updateClient(client.id, { ...client, status: newStatus });
            toast.add({ 
                severity: 'success', 
                summary: 'Sucesso', 
                detail: `Cliente ${getStatusLabel(newStatus)}`, 
                life: 3000 
            });
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao alterar status do cliente', 
                life: 3000 
            });
        }
    };

    const editClient = (editClient) => {
        if (!userStore.hasPermission('clients.change_client')) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para editar clientes', life: 3000 });
            return;
        }
        console.log('Editando cliente:', editClient);
        // Criar uma cópia profunda do objeto para evitar referências
        client.value = JSON.parse(JSON.stringify(editClient));
        clientDialog.value = true;
    };

    const confirmDeleteClient = (editClient) => {
        if (!userStore.hasPermission('clients.delete_client')) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para excluir clientes', life: 3000 });
            return;
        }
        client.value = editClient;
        deleteClientDialog.value = true;
    };

    const confirmDeleteSelected = () => {
        if (!userStore.hasPermission('clients.delete_client')) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para excluir clientes', life: 3000 });
            return;
        }
        deleteClientsDialog.value = true;
    };

    const deleteClient = async () => {
        if (!userStore.hasPermission('clients.delete_client')) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para excluir clientes', life: 3000 });
            return;
        }
        try {
            await clientStore.deleteClient(client.value.id);
            deleteClientDialog.value = false;
            client.value = {};
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente excluído', life: 3000 });
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir cliente', 
                life: 3000 
            });
        }
    };

    const deleteSelectedClients = async () => {
        if (!userStore.hasPermission('clients.delete_client')) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Você não tem permissão para excluir clientes', life: 3000 });
            return;
        }
        try {
            if (selectedClients.value && selectedClients.value.length > 0) {
                for (const client of selectedClients.value) {
                    await clientStore.deleteClient(client.id);
                }
                deleteClientsDialog.value = false;
                selectedClients.value = [];
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Clientes excluídos', life: 3000 });
            }
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir clientes', 
                life: 3000 
            });
        }
    };

    // Menu de contexto
    const menuRefs = ref({});
    const get_menuRefs = (event, id) => {
        return menuRefs.value[id] = event;
    };
    const getMenuItems = (data) => {
        const items = [];
        
        if (userStore.hasPermission('clients.change_client')) {
            items.push({
                label: 'Editar',
                icon: 'pi pi-pencil p-button-text p-button-success',
                command: () => editClient(data)
            });
        }
        
        if (userStore.hasPermission('clients.delete_client')) {
            items.push({
                label: 'Excluir',
                icon: 'pi pi-trash p-button-text p-button-danger',
                command: () => confirmDeleteClient(data)
            });
        }
        
        return items;
    };

    const toggle = (event, data) => {
        menuRefs.value[data.id].toggle(event);
    };

    // Carregar clientes ao montar o componente
    onMounted(async () => {
        try {
            await clientStore.fetchClients();
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao carregar clientes', 
                life: 3000 
            });
        }
    });

</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template #start>
                        <div class="my-2">
                            <Button label="Novo Cliente" v-permission="'clients.add_client'" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                            <Button label="Excluir" v-permission="'clients.delete_client'" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedClients || !selectedClients.length || loading" />
                        </div>
                    </template>

                    <template #end>
                        <Button label="Exportar" v-permission:any="['clients.view_client', 'clients.change_client']" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" :disabled="loading" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="clients"
                    v-model:selection="selectedClients"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
                    responsiveLayout="scroll"
                    :loading="loading"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <h4 class="m-0">Gestão de Clientes</h4>
                            </span>

                            <PermissionCheck permission="clients.view_client">
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
                                </IconField>
                            </PermissionCheck>
                        </div>
                    </template>

                    <Column v-permission="'clients.delete_client'" selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="id" header="ID" :sortable="true" headerStyle="width: 3rem; min-width: 3rem"></Column>
                    <Column field="name" header="Nome" :sortable="true" headerStyle="min-width: 14rem"></Column>
                    <Column field="phone" header="Telefone" :sortable="true" headerStyle="min-width: 10rem"></Column>
                    <Column field="email" header="Email" :sortable="true" headerStyle="min-width: 14rem"></Column>
                    <Column field="status" header="Status" :sortable="true" headerStyle="min-width: 10rem">
                        <template #body="slotProps">
                            <Tag 
                                :value="getStatusLabel(slotProps.data.status)" 
                                :severity="getStatusSeverity(slotProps.data.status)" 
                                class="cursor-pointer"
                                @click="toggleClientStatus(slotProps.data)"
                            />
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Dropdown 
                                v-model="filterModel.value" 
                                :options="[{label: 'Todos', value: null}, {label: 'Ativo', value: true}, {label: 'Inativo', value: false}]" 
                                optionLabel="label" 
                                optionValue="value" 
                                placeholder="Selecione" 
                                class="p-column-filter" 
                                :showClear="true"
                                @change="filterCallback()"
                            />
                        </template>
                    </Column>
                    <Column v-permission:any="['clients.change_client', 'clients.delete_client']" headerStyle="min-width: 10rem">
                        <template #body="slotProps">
                            <Button icon="p-button-rounded pi pi-ellipsis-v" @click="(e) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" size="small" rounded raised />
                                <Menu :ref="(e) => get_menuRefs(e, slotProps.data.id)" id="overlay_menu" :model="getMenuItems(slotProps.data)" :popup="true" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog 
                    v-model:visible="clientDialog"
                    :style="{ width: '450px' }" 
                    header="Detalhes do Cliente" 
                    :modal="true" 
                    class="p-fluid"
                >
                    <ClientForm
                        v-model:client="client"
                        :submitted="submitted"
                        :loading="loading"
                        @save="saveClient"
                        @cancel="hideDialog"
                    />
                </Dialog>

                

                <Dialog v-model:visible="deleteClientDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="client">Tem certeza que deseja excluir <b>{{ client.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteClientDialog = false" :disabled="loading" />
                        <Button v-permission="'clients.delete_client'" label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteClient" :loading="loading" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteClientsDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Tem certeza que deseja excluir os clientes selecionados?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteClientsDialog = false" :disabled="loading" />
                        <Button v-permission="'clients.delete_client'" label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedClients" :loading="loading" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template> 