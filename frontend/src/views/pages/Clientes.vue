<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode } from '@primevue/core/api';
    import { useClientStore } from '@/stores/client';
    import ClientForm from '@/components/ClientForm.vue';

    const clientStore = useClientStore();
    const dt = ref(null);
    
    // Computed properties
    const clients = computed(() => {
        // Garantir que clients seja sempre um array
        return Array.isArray(clientStore.getClients) ? clientStore.getClients : [];
    });
    const loading = computed(() => clientStore.isLoading);
    const error = computed(() => clientStore.getError);
    
    const clientDialog = ref(false);
    const deleteClientDialog = ref(false);
    const deleteClientsDialog = ref(false);
    const client = ref({});
    const selectedClients = ref([]);
    const toast = useToast();
    const filters = ref({
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const formatDate = (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const openNew = () => {
        client.value = {};
        clientDialog.value = true;
    };

    const editClient = (editClient) => {
        console.log('Editando cliente:', editClient);
        // Criar uma cópia profunda do objeto para evitar referências
        client.value = JSON.parse(JSON.stringify(editClient));
        clientDialog.value = true;
    };

    const confirmDeleteClient = (editClient) => {
        client.value = editClient;
        deleteClientDialog.value = true;
    };

    const confirmDeleteSelected = () => {
        deleteClientsDialog.value = true;
    };

    const deleteClient = async () => {
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

    const saveClient = async (clientData) => {
        try {
            if (clientData.id) {
                // Atualizar cliente existente
                await clientStore.updateClient(clientData.id, clientData);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente atualizado', life: 3000 });
            } else {
                // Criar novo cliente
                await clientStore.createClient(clientData);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente criado', life: 3000 });
            }
            clientDialog.value = false;
            client.value = {};
        } catch (err) {
            console.error('Erro ao salvar cliente:', err);
            let errorMessage = 'Erro ao salvar cliente';
            
            if (err.response) {
                // Erro da API com resposta
                if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data && err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else {
                    errorMessage = `Erro ${err.response.status}: ${err.response.statusText}`;
                }
            } else if (err.message) {
                // Erro com mensagem
                errorMessage = err.message;
            }
            
            toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 5000 });
        }
    };

    const exportCSV = () => {
        dt.value?.exportCSV();
    };

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
                            <Button label="Novo" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                            <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedClients || !selectedClients.length || loading" />
                        </div>
                    </template>

                    <template #end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" :disabled="loading" />
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
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Gerenciar Clientes</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
                            </span>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="id" header="ID" :sortable="true" headerStyle="width: 3rem; min-width: 3rem"></Column>
                    <Column field="name" header="Nome" :sortable="true" headerStyle="min-width: 14rem"></Column>
                    <Column field="email" header="Email" :sortable="true" headerStyle="min-width: 14rem"></Column>
                    <Column field="phone" header="Telefone" :sortable="true" headerStyle="min-width: 10rem"></Column>
                    <Column field="document" header="CPF/CNPJ" :sortable="true" headerStyle="min-width: 10rem"></Column>
                    <Column field="registrationDate" header="Data de Cadastro" :sortable="true" headerStyle="min-width: 10rem">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.registrationDate) }}
                        </template>
                    </Column>
                    <Column headerStyle="min-width: 10rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editClient(slotProps.data)" :disabled="loading" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteClient(slotProps.data)" :disabled="loading" />
                        </template>
                    </Column>
                </DataTable>

                <ClientForm 
                    :visible="clientDialog" 
                    :clientData="client" 
                    :loading="loading"
                    @hide="clientDialog = false" 
                    @save="saveClient" 
                />

                <Dialog v-model:visible="deleteClientDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="client">Tem certeza que deseja excluir <b>{{ client.name }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteClientDialog = false" :disabled="loading" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteClient" :loading="loading" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteClientsDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Tem certeza que deseja excluir os clientes selecionados?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteClientsDialog = false" :disabled="loading" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedClients" :loading="loading" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template> 