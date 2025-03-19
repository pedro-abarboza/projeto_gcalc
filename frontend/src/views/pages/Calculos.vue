<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode } from '@primevue/core/api';
    import CalculationForm from '@/components/forms/CalculationForm.vue';
    import { useCalculationStore } from '@/stores/calculation';

    const calculationStore = useCalculationStore();
    const dt = ref(null);
    
    // Computed properties
    const calculations = computed(() => {
        // Garantir que calculations seja sempre um array
        return Array.isArray(calculationStore.getCalculations) ? calculationStore.getCalculations : [];
    });
    const loading = computed(() => calculationStore.isLoading);
    const error = computed(() => calculationStore.getError);
    
    const calculationDialog = ref(false);
    const deleteCalculationDialog = ref(false);
    const deleteCalculationsDialog = ref(false);
    const calculation = ref({});
    const selectedCalculations = ref([]);
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

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusLabel = (status) => {
        if (!status) return '';
        const statusMap = {
            'draft': 'Rascunho',
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
            'draft': 'secondary',
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
        calculation.value = {};
        calculationDialog.value = true;
    };

    const editCalculation = (editCalculation) => {
        console.log('Editando cálculo:', editCalculation);
        // Criar uma cópia profunda do objeto para evitar referências
        calculation.value = JSON.parse(JSON.stringify(editCalculation));
        calculationDialog.value = true;
    };

    const confirmDeleteCalculation = (editCalculation) => {
        calculation.value = editCalculation;
        deleteCalculationDialog.value = true;
    };

    const confirmDeleteSelected = () => {
        deleteCalculationsDialog.value = true;
    };

    const deleteCalculation = async () => {
        try {
            await calculationStore.deleteCalculation(calculation.value.id);
            deleteCalculationDialog.value = false;
            calculation.value = {};
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cálculo excluído', life: 3000 });
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir cálculo', 
                life: 3000 
            });
        }
    };

    const deleteSelectedCalculations = async () => {
        try {
            if (selectedCalculations.value && selectedCalculations.value.length > 0) {
                for (const calculation of selectedCalculations.value) {
                    await calculationStore.deleteCalculation(calculation.id);
                }
                deleteCalculationsDialog.value = false;
                selectedCalculations.value = [];
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cálculos excluídos', life: 3000 });
            }
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao excluir cálculos', 
                life: 3000 
            });
        }
    };

    const saveCalculation = async (data) => {
        try {
            if (data.id) {
                await calculationStore.updateCalculation(data.id, data);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cálculo atualizado', life: 3000 });
            } else {
                await calculationStore.createCalculation(data);
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Cálculo criado', life: 3000 });
            }
            calculationDialog.value = false;
            calculation.value = {};
        } catch (error) {
            console.error('Erro ao salvar cálculo:', error);
            
            // Tratamento detalhado de erros da API
            let errorMessage = 'Erro ao salvar cálculo';
            
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
            await calculationStore.fetchCalculations();
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: error.response?.data?.detail || 'Erro ao carregar cálculos', 
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
                            <Button label="Novo Cálculo" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                            <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" :disabled="loading || !selectedCalculations || !selectedCalculations.length" @click="confirmDeleteSelected" />
                        </div>
                    </template>

                    <template #end>
                        <Button label="Exportar" icon="pi pi-upload" class="p-button-help" @click="exportCSV" :disabled="loading" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    :value="calculations"
                    v-model:selection="selectedCalculations"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} cálculos"
                    responsiveLayout="scroll"
                    :loading="loading"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <h4 class="m-0">Gerenciar Cálculos</h4>
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
                            Carregando cálculos...
                        </div>
                        <div class="text-center p-4" v-else>
                            Nenhum cálculo encontrado.
                        </div>
                    </template>

                    <template #loading>
                        <div class="text-center p-4">
                            Carregando cálculos...
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    
                    <Column field="id" header="ID" :sortable="true" headerStyle="width:10%; min-width:5rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">ID</span>
                            {{ slotProps.data.id }}
                        </template>
                    </Column>

                    <Column field="service" header="Serviço" :sortable="true" headerStyle="width:10%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Serviço</span>
                            {{ slotProps.data.service?.id }}
                        </template>
                    </Column>

                    <Column field="client" header="Cliente" :sortable="true" headerStyle="width:15%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Cliente</span>
                            {{ slotProps.data.service?.client?.name }}
                        </template>
                    </Column>

                    <Column field="calculation_type" header="Tipo" :sortable="true" headerStyle="width:12%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Tipo</span>
                            {{ getCalculationTypeLabel(slotProps.data.calculation_type) }}
                        </template>
                    </Column>

                    <Column field="total_amount" header="Valor Total" :sortable="true" headerStyle="width:12%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Valor Total</span>
                            {{ formatCurrency(slotProps.data.total_amount) }}
                        </template>
                    </Column>

                    <Column field="status" header="Status" :sortable="true" headerStyle="width:12%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                    </Column>

                    <Column field="created_at" header="Data" :sortable="true" headerStyle="width:12%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Data</span>
                            {{ formatDate(slotProps.data.created_at) }}
                        </template>
                    </Column>

                    <Column headerStyle="min-width:8rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editCalculation(slotProps.data)" :disabled="loading" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteCalculation(slotProps.data)" :disabled="loading" />
                        </template>
                    </Column>
                </DataTable>

                <CalculationForm
                    v-model:visible="calculationDialog"
                    :calculation="calculation"
                    @save="saveCalculation"
                    :loading="loading"
                />

                <Dialog v-model:visible="deleteCalculationDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="calculation">Tem certeza que deseja excluir o cálculo <b>{{ calculation.id }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteCalculationDialog = false" :disabled="loading" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteCalculation" :loading="loading" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteCalculationsDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span>Tem certeza que deseja excluir os cálculos selecionados?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteCalculationsDialog = false" :disabled="loading" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedCalculations" :loading="loading" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template> 