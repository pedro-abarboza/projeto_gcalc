<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode } from '@primevue/core/api';
    import { useClientStore } from '@/stores/client';
    import { useTipoServicoClienteStore } from '@/stores/tipoServicoCliente';
    import TipoServicoForm from '@/components/forms/TipoServicoForm.vue';

    const clientStore = useClientStore();
    const tipoServicoClienteStore = useTipoServicoClienteStore();
    const toast = useToast();
    const dt = ref(null);

    // Estado
    const tipoServico = ref({});
    const tiposServico = computed(() => tipoServicoClienteStore.getTiposServico);
    const selectedTiposServico = ref([]);
    const tipoServicoDialog = ref(false);
    const deleteTipoServicoDialog = ref(false);
    const deleteTiposServicoDialog = ref(false);
    const submitted = ref(false);
    const loading = computed(() => tipoServicoClienteStore.isLoading);
    const totalRecords = computed(() => tipoServicoClienteStore.getTotalRecords);
    const clients = computed(() => clientStore.clients);
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    // Funções
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

    const openNew = () => {
        tipoServico.value = {
            name: '',
            description: '',
            price: 0,
            client_id: null,
            status: true
        };
        submitted.value = false;
        tipoServicoDialog.value = true;
    };

    const hideDialog = () => {
        tipoServicoDialog.value = false;
        submitted.value = false;
    };

    const saveTipoServico = async (data) => {
        submitted.value = true;

        if (!data.name || !data.client_id || !data.price) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios', life: 3000 });
            return;
        }

        try {
            if (data.id) {
                // Atualizar tipo de serviço existente
                await tipoServicoClienteStore.updateTipoServico(data.id, data);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de serviço atualizado', life: 3000 });
            } else {
                // Criar novo tipo de serviço
                await tipoServicoClienteStore.createTipoServico(data);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de serviço criado', life: 3000 });
            }

            tipoServicoDialog.value = false;
            tipoServico.value = {};
            submitted.value = false;
            await tipoServicoClienteStore.fetchTiposServico();
        } catch (error) {
            let errorMessage = 'Erro ao salvar tipo de serviço';
            
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

    const editTipoServico = (editTipoServico) => {
        tipoServico.value = { ...editTipoServico };
        tipoServicoDialog.value = true;
    };

    const confirmDeleteTipoServico = (editTipoServico) => {
        tipoServico.value = editTipoServico;
        deleteTipoServicoDialog.value = true;
    };

    const deleteTipoServicoFn = async () => {
        try {
            await tipoServicoClienteStore.deleteTipoServico(tipoServico.value.id);
            deleteTipoServicoDialog.value = false;
            tipoServico.value = {};
            await tipoServicoClienteStore.fetchTiposServico();
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipo de serviço excluído', life: 3000 });
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir tipo de serviço', 
                life: 3000 
            });
        }
    };

    const confirmDeleteSelected = () => {
        deleteTiposServicoDialog.value = true;
    };

    const deleteSelectedTiposServico = async () => {
        try {
            if (selectedTiposServico.value && selectedTiposServico.value.length > 0) {
                for (const item of selectedTiposServico.value) {
                    await tipoServicoClienteStore.deleteTipoServico(item.id);
                }
                deleteTiposServicoDialog.value = false;
                selectedTiposServico.value = [];
                await tipoServicoClienteStore.fetchTiposServico();
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Tipos de serviço excluídos', life: 3000 });
            }
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir tipos de serviço', 
                life: 3000 
            });
        }
    };

    const exportCSV = () => {
        dt.value?.exportCSV();
    };

    const getClientName = (clientId) => {
        const client = clients.value.find(c => c.id === clientId);
        return client ? client.name : '';
    };

    // Carregar dados iniciais
    const loadData = async () => {
        try {
            await clientStore.fetchClients();
            await tipoServicoClienteStore.fetchTiposServico();
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

    onMounted(async () => {
        await loadData();
    });
</script>

<template>
    <div class="card">
        <Toast />
        <Toolbar class="mb-4">
            <template #start>
                <div class="my-2">
                    <Button label="Novo" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                    <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedTiposServico || !selectedTiposServico.length || loading" />
                </div>
            </template>

            <template #end>
                <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV($event)" :disabled="loading" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            :value="tiposServico"
            v-model:selection="selectedTiposServico"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos de serviço"
            responsiveLayout="scroll"
            :loading="loading"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                    <h5 class="m-0">Gerenciar Tipos de Serviço</h5>
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
                    </span>
                </div>
            </template>

            <template #empty>
                <div class="text-center p-4" v-if="loading">
                    Carregando tipos de serviço...
                </div>
                <div class="text-center p-4" v-else>
                    Nenhum tipo de serviço encontrado.
                </div>
            </template>

            <template #loading>
                <div class="text-center p-4">
                    Carregando tipos de serviço...
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="id" header="ID" :sortable="true" headerStyle="width: 3rem; min-width: 3rem"></Column>
            <Column field="name" header="Nome" :sortable="true" headerStyle="min-width: 14rem"></Column>
            <Column field="description" header="Descrição" :sortable="true" headerStyle="min-width: 14rem"></Column>
            <Column field="client_id" header="Cliente" :sortable="true" headerStyle="min-width: 14rem">
                <template #body="slotProps">
                    {{ getClientName(slotProps.data.client_id) }}
                </template>
            </Column>
            <Column field="price" header="Preço Base" :sortable="true" headerStyle="min-width: 10rem">
                <template #body="slotProps">
                    {{ formatCurrency(slotProps.data.price) }}
                </template>
            </Column>
            <Column field="created_at" header="Data de Cadastro" :sortable="true" headerStyle="min-width: 10rem">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.created_at) }}
                </template>
            </Column>
            <Column field="status" header="Status" :sortable="true" headerStyle="min-width: 8rem">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status ? 'Ativo' : 'Inativo'" :severity="slotProps.data.status ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column headerStyle="min-width: 10rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editTipoServico(slotProps.data)" :disabled="loading" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteTipoServico(slotProps.data)" :disabled="loading" />
                </template>
            </Column>
        </DataTable>

        <TipoServicoForm
            v-model:visible="tipoServicoDialog"
            :tipoServico="tipoServico"
            :submitted="submitted"
            :loading="loading"
            @save="saveTipoServico"
            @hide="hideDialog"
        />

        <Dialog v-model:visible="deleteTipoServicoDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="tipoServico">Tem certeza que deseja excluir <b>{{ tipoServico.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteTipoServicoDialog = false" :disabled="loading" />
                <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteTipoServicoFn" :loading="loading" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteTiposServicoDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span>Tem certeza que deseja excluir os tipos de serviço selecionados?</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteTiposServicoDialog = false" :disabled="loading" />
                <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedTiposServico" :loading="loading" />
            </template>
        </Dialog>
    </div>
</template> 