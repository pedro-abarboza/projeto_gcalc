<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode } from '@primevue/core/api';
    import { useClientStore } from '@/stores/client';
    import ServiceForm from '@/components/forms/ServiceForm.vue';
    import { useServiceStore } from '@/stores/service';
    import { useUserStore } from '@/stores/user';
    import PermissionCheck from '@/components/permissions/PermissionCheck.vue';

    const serviceStore = useServiceStore();
    const clientStore = useClientStore();
    const userStore = useUserStore();
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
        if (!status) return '';
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
        // Verificar permissão
        if (!userStore.hasPermission('services.add_service')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para adicionar serviços', 
                life: 3000 
            });
            return;
        }
        
        service.value = {
            title: '',
            description: '',
            client_id: null,
            service_type_id: null,
            status: 'pending',
            due_date: new Date(new Date().setDate(new Date().getDate() + 10)),
            estimated_hours: 0,
            scope: '',
            is_active: true
        };
        submitted.value = false;
        serviceDialog.value = true;
    };

    const editService = (data) => {
        // Verificar permissão
        if (!userStore.hasPermission('services.change_service')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para editar serviços', 
                life: 3000 
            });
            return;
        }
        
        service.value = { ...data };
        if (service.value.due_date) {
            service.value.due_date = new Date(service.value.due_date);
        }
        serviceDialog.value = true;
    };

    const confirmDeleteService = (data) => {
        // Verificar permissão
        if (!userStore.hasPermission('services.delete_service')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir serviços', 
                life: 3000 
            });
            return;
        }
        
        service.value = data;
        deleteServiceDialog.value = true;
    };

    const confirmDeleteSelected = () => {
        // Verificar permissão
        if (!userStore.hasPermission('services.delete_service')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir serviços', 
                life: 3000 
            });
            return;
        }
        
        deleteServicesDialog.value = true;
    };

    const hideDialog = () => {
        serviceDialog.value = false;
        submitted.value = false;
    };

    const saveService = async () => {
        submitted.value = true;

        if (!service.value.title || !service.value.client_id) {
            toast.add({ 
                severity: 'warn', 
                summary: 'Atenção', 
                detail: 'Preencha os campos obrigatórios', 
                life: 3000 
            });
            return;
        }

        // Verificar permissão
        if (service.value.id) {
            if (!userStore.hasPermission('services.change_service')) {
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Você não tem permissão para editar serviços', 
                    life: 3000 
                });
                return;
            }
        } else {
            if (!userStore.hasPermission('services.add_service')) {
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Você não tem permissão para adicionar serviços', 
                    life: 3000 
                });
                return;
            }
        }

        loading.value = true;
        try {
            if (service.value.id) {
                // Editar serviço existente
                await serviceStore.updateService(service.value.id, service.value);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço atualizado', life: 3000 });
            } else {
                // Criar novo serviço
                await serviceStore.createService(service.value);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço criado', life: 3000 });
            }
            serviceDialog.value = false;
            service.value = {};
            submitted.value = false;
            await serviceStore.fetchServices();
        } catch (error) {
            let errorMessage = 'Erro ao salvar serviço';
            
            // Tratar diferentes formatos de erro da API
            if (error.response?.data) {
                if (typeof error.response.data === 'object') {
                    const errorMessages = [];
                    
                    for (const [field, messages] of Object.entries(error.response.data)) {
                        if (Array.isArray(messages)) {
                            errorMessages.push(`${field}: ${messages.join(', ')}`);
                        } else if (typeof messages === 'string') {
                            errorMessages.push(`${field}: ${messages}`);
                        }
                    }
                    
                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('\n');
                    }
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                }
            }
            
            toast.add({
                severity: 'error', 
                summary: 'Erro', 
                detail: errorMessage,
                life: 3000,
                sticky: errorMessage.includes('\n') // Tornar mensagens com múltiplas linhas fixas
            });
        } finally {
            loading.value = false;
        }
    };

    const deleteService = async () => {
        // Verificar permissão
        if (!userStore.hasPermission('services.delete_service')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir serviços', 
                life: 3000 
            });
            deleteServiceDialog.value = false;
            return;
        }
        
        try {
            await serviceStore.deleteService(service.value.id);
            deleteServiceDialog.value = false;
            service.value = {};
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço excluído', life: 3000 });
            await serviceStore.fetchServices();
        } catch (error) {
            let errorMessage = 'Erro ao excluir serviço';
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            }
            toast.add({ severity: 'error', summary: 'Erro', detail: errorMessage, life: 3000 });
        }
    };

    const deleteSelectedServices = async () => {
        // Verificar permissão
        if (!userStore.hasPermission('services.delete_service')) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: 'Você não tem permissão para excluir serviços', 
                life: 3000 
            });
            deleteServicesDialog.value = false;
            return;
        }
        
        try {
            await Promise.all(selectedServices.value.map(service => serviceStore.deleteService(service.id)));
            deleteServicesDialog.value = false;
            selectedServices.value = [];
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviços excluídos', life: 3000 });
            await serviceStore.fetchServices();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir serviços', life: 3000 });
        }
    };

    const exportCSV = () => {
        dt.value?.exportCSV();
    };

    const getClientName = (clientId) => {
        const client = clients.value.find(c => c.id === clientId);
        return client ? client.name : '';
    };

    // Menu de contexto
    const menuRefs = ref({});

    const get_menuRefs = (event, id) => {
        return menuRefs.value[id] = event;
    };

    const getMenuItems = (data) => {
        const items = [];
        
        // Adicionar opção de editar se tiver permissão
        if (userStore.hasPermission('services.change_service')) {
            items.push({
                label: 'Editar',
                icon: 'pi pi-pencil p-button-text p-button-success',
                command: () => editService(data)
            });
        }
        
        // Adicionar opção de excluir se tiver permissão
        if (userStore.hasPermission('services.delete_service')) {
            items.push({
                label: 'Excluir',
                icon: 'pi pi-trash p-button-text p-button-danger',
                command: () => confirmDeleteService(data)
            });
        }
        
        return items;
    };

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
                            <Button label="Novo Serviço" v-permission="'services.add_service'" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                            <Button label="Excluir" v-permission="'services.delete_service'" icon="pi pi-trash" class="p-button-danger" :disabled="loading || !selectedServices || !selectedServices.length" @click="confirmDeleteSelected" />
                        </div>
                    </template>

                    <template #end>
                        <Button label="Exportar" v-permission:any="['services.view_service', 'services.change_service']" icon="pi pi-upload" severity="secondary" @click="exportCSV" :disabled="loading" />
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

                            <PermissionCheck :permissions="['services.view_service', 'services.change_service']">
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
                    
                    <Column field="title" header="Título" sortable>
                        <template #body="{ data }">
                            <span :class="{ 'font-bold': data.status === 'completed' }">{{ data.title }}</span>
                        </template>
                    </Column>
                    
                    <Column field="client_id" header="Cliente" sortable>
                        <template #body="{ data }">
                            {{ getClientName(data.client_id) }}
                        </template>
                    </Column>
                    
                    <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                            <Tag :value="getStatusLabel(data.status)" :severity="getStatusSeverity(data.status)" />
                        </template>
                    </Column>
                    
                    <Column field="due_date" header="Data de Entrega" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.due_date) }}
                        </template>
                    </Column>
                    
                    <Column headerStyle="min-width:8rem;" bodyStyle="text-align:center">
                        <template #body="slotProps">
                            <div v-permission:any="['services.change_service', 'services.delete_service']">
                                <Button icon="p-button-rounded pi pi-ellipsis-v" @click="(e) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" size="small" rounded raised />
                                <Menu :ref="(e) => get_menuRefs(e, slotProps.data.id)" id="overlay_menu" :model="getMenuItems(slotProps.data)" :popup="true" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <!-- Diálogo para criar/editar serviços -->
                <Dialog v-model:visible="serviceDialog" :style="{width: '700px'}" header="Detalhes do Serviço" :modal="true" class="p-fluid">
                    <ServiceForm 
                        v-model:service="service"
                        :submitted="submitted"
                        :loading="loading"
                        @save="saveService"
                        @cancel="hideDialog"
                    />
                </Dialog>

                <!-- Diálogo de confirmação para exclusão -->
                <Dialog v-model:visible="deleteServiceDialog" :style="{width: '450px'}" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="service">Tem certeza que deseja excluir <b>{{ service.title }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteServiceDialog = false" />
                        <Button v-permission="'services.delete_service'" label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteService" :loading="loading" />
                    </template>
                </Dialog>

                <!-- Diálogo de confirmação para exclusão em lote -->
                <Dialog v-model:visible="deleteServicesDialog" :style="{width: '450px'}" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Tem certeza que deseja excluir os serviços selecionados?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteServicesDialog = false" />
                        <Button v-permission="'services.delete_service'" label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedServices" :loading="loading" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>
