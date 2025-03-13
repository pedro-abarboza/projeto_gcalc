<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template #start>
                        <div class="my-2">
                            <Button label="Novo Serviço" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" :disabled="!selectedServices || !selectedServices.length" @click="confirmDeleteSelected" />
                        </div>
                    </template>

                    <template #end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV" />
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
                    :virtualScrollerOptions="{ disabled: true }"
                    responsiveLayout="scroll"
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
                                    <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                                </IconField>
                            </span>
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
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editService(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteService(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <ServiceForm
                    v-model:visible="serviceDialog"
                    :service="service"
                    @save="saveService"
                />

                <Dialog v-model:visible="deleteServiceDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="service">Tem certeza que deseja excluir <b>{{ service.id }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteServiceDialog = false" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteService" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteServicesDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="service">Tem certeza que deseja excluir os serviços selecionados?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteServicesDialog = false" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedServices" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from '@primevue/core/api';
import ServiceForm from '@/components/ServiceForm.vue';
import { serviceService } from '@/services/serviceService';

const dt = ref(null);
const services = ref([]);
const serviceDialog = ref(false);
const deleteServiceDialog = ref(false);
const deleteServicesDialog = ref(false);
const service = ref({});
const selectedServices = ref(null);
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
    service.value = { ...editService };
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
        await serviceService.deleteService(service.value.id);
        services.value = services.value.filter(s => s.id !== service.value.id);
        deleteServiceDialog.value = false;
        service.value = {};
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço excluído', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.message, life: 3000 });
    }
};

const deleteSelectedServices = async () => {
    try {
        await Promise.all(selectedServices.value.map(s => serviceService.deleteService(s.id)));
        services.value = services.value.filter(s => !selectedServices.value.includes(s));
        deleteServicesDialog.value = false;
        selectedServices.value = null;
        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviços excluídos', life: 3000 });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.message, life: 3000 });
    }
};

const saveService = async (data) => {
    try {
        if (data.id) {
            const updatedService = await serviceService.updateService(data.id, data);
            const index = services.value.findIndex(s => s.id === data.id);
            services.value[index] = updatedService;
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço atualizado', life: 3000 });
        } else {
            const newService = await serviceService.createService(data);
            services.value.push(newService);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço criado', life: 3000 });
        }
        serviceDialog.value = false;
        service.value = {};
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.message, life: 3000 });
    }
};

const exportCSV = () => {
    dt.value.exportCSV();
};

onMounted(async () => {
    try {
        const response = await serviceService.getServices();
        if (response && response.results) {
            services.value = response.results;
        } else {
            services.value = Array.isArray(response) ? response : [];
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: error.message, life: 3000 });
    }
});
</script>
