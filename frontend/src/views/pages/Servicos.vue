<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode } from '@primevue/core/api';
    import ServiceForm from '@/components/ServiceForm.vue';
    import { useServiceStore } from '@/stores/service';

    const serviceStore = useServiceStore();
    const dt = ref(null);
    
    // Computed properties
    const services = computed(() => {
        // Garantir que services seja sempre um array
        return Array.isArray(serviceStore.getServices) ? serviceStore.getServices : [];
    });
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

    const editService = (editService) => {
        console.log('Editando serviço:', editService);
        // Criar uma cópia profunda do objeto para evitar referências
        service.value = JSON.parse(JSON.stringify(editService));
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
        try {
            if (data.id) {
                await serviceStore.updateService(data.id, data);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço atualizado', life: 3000 });
            } else {
                await serviceStore.createService(data);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço criado', life: 3000 });
            }
            serviceDialog.value = false;
            service.value = {};
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
            }
            
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: errorMessage, 
                life: 5000 
            });
        }
    };

    const exportCSV = () => {
        dt.value?.exportCSV();
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
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV" :disabled="loading" />
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
                    responsiveLayout="scroll"
                    :loading="loading"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <h4 class="m-0">Gerenciar Serviços</h4>
                            </span>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <IconField>
                                    <InputIcon>
                                        <i class="pi pi-search" />
                                    </InputIcon>
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
                                </IconField>
                            </span>
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

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    
                    <Column field="id" header="ID" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">ID</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>

                    <Column field="client" header="Cliente" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Cliente</span>
                            {{ slotProps.data.client?.name }}
                        </template>
                    </Column>

                    <Column field="calculation_type" header="Tipo" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Tipo</span>
                            {{ getCalculationTypeLabel(slotProps.data.calculation_type) }}
                        </template>
                    </Column>

                    <Column field="status" header="Status" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                    </Column>

                    <Column field="deadline" header="Prazo" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Prazo</span>
                            {{ formatDate(slotProps.data.deadline) }}
                        </template>
                    </Column>

                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editService(slotProps.data)" :disabled="loading" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteService(slotProps.data)" :disabled="loading" />
                        </template>
                    </Column>
                </DataTable>

                <ServiceForm
                    v-model:visible="serviceDialog"
                    :service="service"
                    @save="saveService"
                    :loading="loading"
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
