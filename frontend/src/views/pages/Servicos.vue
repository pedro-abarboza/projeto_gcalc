<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode } from '@primevue/core/api';
    import { useClientStore } from '@/stores/client';
    import ServiceForm from '@/components/forms/ServiceForm.vue';
    import { useServiceStore } from '@/stores/service';

    const serviceStore = useServiceStore();
    const clientStore = useClientStore();
    const dt = ref(null);
    
    // Computed properties
    const services = computed(() => {
        // Garantir que services seja sempre um array
        return Array.isArray(serviceStore.getServices) ? serviceStore.getServices : [];
    });
    const clients = computed(() => clientStore.clients);
    const loading = computed(() => serviceStore.isLoading);
    const error = computed(() => serviceStore.getError);
    
    const serviceDialog = ref(false);
    const deleteServiceDialog = ref(false);
    const deleteServicesDialog = ref(false);
    const service = ref({});
    const selectedServices = ref([]);
    const toast = useToast();
    const filters = ref({
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const submitted = ref(false);

    const formatDate = (value) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusLabel = (status) => {
        if (!status) return '';
        const statusMap = {
            'pending': 'Pendente',
            'in_progress': 'Em Andamento',
            'review': 'Em Revisão',
            'completed': 'Concluído',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const getStatusSeverity = (status) => {
        if (!status) return 'info';
        const severityMap = {
            'pending': 'warning',
            'in_progress': 'info',
            'review': 'help',
            'completed': 'success',
            'cancelled': 'danger'
        };
        return severityMap[status] || 'info';
    };

    const getCalculationTypeLabel = (type) => {
        if (!type) return '';
        const typeMap = {
            'labor': 'Trabalhista',
            'social_security': 'Previdenciário',
            'fgts': 'FGTS'
        };
        return typeMap[type] || type;
    };

    const openNew = () => {
        service.value = {};
        serviceDialog.value = true;
    };

    const editService = (data) => {
        console.log('Editando serviço:', data);
        // Criar uma cópia profunda do objeto para evitar referências
        service.value = JSON.parse(JSON.stringify(data));
        serviceDialog.value = true;
    };

    const confirmDeleteService = (editService) => {
        service.value = editService;
        deleteServiceDialog.value = true;
    };

    const confirmDeleteSelected = () => {
        deleteServicesDialog.value = true;
    };

    const deleteService = async () => {
        try {
            await serviceStore.deleteService(service.value.id);
            deleteServiceDialog.value = false;
            service.value = {};
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço excluído', life: 3000 });
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir serviço', 
                life: 3000 
            });
        }
    };

    const deleteSelectedServices = async () => {
        try {
            if (selectedServices.value && selectedServices.value.length > 0) {
                for (const service of selectedServices.value) {
                    await serviceStore.deleteService(service.id);
                }
                deleteServicesDialog.value = false;
                selectedServices.value = [];
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviços excluídos', life: 3000 });
            }
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir serviços', 
                life: 3000 
            });
        }
    };

    const saveService = async (data) => {
        submitted.value = true;
        
        // Validar campos obrigatórios
        if (!data.title || !data.client || !data.service_type || 
            !data.calculation_type || !data.description || !data.status) {
                toast.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios', life: 3000 });
            return;
        }
        
        try {
            // Preparar dados para envio à API
            const serviceData = { ...data };
            
            if (serviceData.id) {
                await serviceStore.updateService(serviceData.id, serviceData);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço atualizado', life: 3000 });
            } else {
                await serviceStore.createService(serviceData);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço criado', life: 3000 });
            }
            serviceDialog.value = false;
            service.value = {};
            submitted.value = false;
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            
            // Tratamento detalhado de erros da API
            let errorMessage = 'Erro ao salvar serviço';
            
            if (error.response?.data) {
                const responseData = error.response.data;
                
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
            } else if (error.message) {
                // Erro com mensagem
                errorMessage = error.message;
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

    const exportCSV = () => {
        dt.value?.exportCSV();
    };

    const getClientName = (clientId) => {
        const client = clients.value.find(c => c.id === clientId);
        return client ? client.name : '';
    };

    const hideDialog = () => {
        serviceDialog.value = false;
        submitted.value = false;
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
                    command: () => editService(data)
                },
                {
                    label: 'Excluir',
                    icon: 'pi pi-trash p-button-text p-button-danger',
                    command: () => confirmDeleteService(data)
                }
            ];

    const toggle = (event, data) => {
        menuRefs.value[data.id].toggle(event);
    };

    onMounted(async () => {
        try {
            await serviceStore.fetchServices();
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao carregar serviços', 
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
                            <Button label="Novo Serviço" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                            <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" :disabled="loading || !selectedServices || !selectedServices.length" @click="confirmDeleteSelected" />
                        </div>
                    </template>

                    <template #end>
                        <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV" :disabled="loading" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="services"
                    v-model:selection="selectedServices"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} serviços"
                    :loading="loading"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <h4 class="m-0">Gestão de Serviços</h4>
                            </span>

                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
                            </IconField>
                        </div>
                    </template>

                    <template #empty>
                        <div class="text-center p-4" v-if="loading">
                            Carregando serviços...
                        </div>
                        <div class="text-center p-4" v-else>
                            Nenhum serviço encontrado.
                        </div>
                    </template>

                    <template #loading>
                        <div class="text-center p-4">
                            Carregando serviços...
                        </div>
                    </template>

                    <Column selectionMode="multiple"></Column>
                    <Column field="title" header="Título" :sortable="true"></Column>
                    <Column field="client" header="Cliente" :sortable="true">
                        <template #body="slotProps">
                            {{ getClientName(slotProps.data.client) }}
                        </template>
                    </Column>
                    <Column field="service_type_name" header="Tipo" :sortable="true"></Column>
                    <Column field="deadline" header="Prazo" :sortable="true">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.deadline) }}
                        </template>
                    </Column>
                    <Column field="status" header="Status" :sortable="true">
                        <template #body="slotProps">
                            <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                    </Column>
                    <Column>
                        <template #body="slotProps">
                            <Button icon="p-button-rounded pi pi-ellipsis-v" @click="(e) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" size="small" rounded raised />
                            <Menu :ref="(e) => get_menuRefs(e, slotProps.data.id)" id="overlay_menu" :model="getMenuItems(slotProps.data)" :popup="true" />
                        </template>
                    </Column>
                </DataTable>

                <ServiceForm
                    v-model:visible="serviceDialog"
                    :service="service"
                    :submitted="submitted"
                    :loading="loading"
                    @save="saveService"
                    @cancel="hideDialog"
                />

                <Dialog v-model:visible="deleteServiceDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="service">Tem certeza que deseja excluir <b>{{ service.id }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteServiceDialog = false" :disabled="loading" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteService" :loading="loading" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteServicesDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Tem certeza que deseja excluir os serviços selecionados?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteServicesDialog = false" :disabled="loading" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedServices" :loading="loading" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
