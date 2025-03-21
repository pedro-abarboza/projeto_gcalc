<script setup>
    import { ref, computed, watch, onMounted } from 'vue';
    import { useClientStore } from '@/stores/client';
    import { useUserStore } from '@/stores/user';
    import { useTipoServicoClienteStore } from '@/stores/tipoServicoCliente';

    // Props
    const props = defineProps({
        visible: {
            type: Boolean,
            required: true
        },
        service: {
            type: Object,
            required: true,
            default: () => ({
                id: null,
                title: '',
                description: '',
                client: null,
                service_type: null,
                calculation_type: '',
                status: 'pending',
                deadline: null,
                notes: ''
            })
        },
        submitted: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        }
    });

    // Emits
    const emit = defineEmits(['update:visible', 'save', 'hide']);

    // Stores
    const clientStore = useClientStore();
    const userStore = useUserStore();
    const tipoServicoClienteStore = useTipoServicoClienteStore();

    // Estado - Dados do formulário
    const serviceData = ref({
        id: null,
        title: '',
        description: '',
        client: null,
        service_type: null,
        calculation_type: '',
        status: 'pending',
        deadline: null,
        notes: ''
    });
    
    // Estado - Dados carregados
    const clients = ref([]);
    const serviceTypes = ref([]);

    // Computed properties - Estados de carregamento
    const clientsLoading = computed(() => clientStore.isLoading);
    const serviceTypesLoading = computed(() => tipoServicoClienteStore.isLoading);
    
    // Computed property - Controle de visibilidade do diálogo
    const dialogVisible = computed({
        get: () => props.visible,
        set: (value) => emit('update:visible', value)
    });

    // Opções fixas para campos de seleção
    // Tipos de cálculo disponíveis
    const calculationTypes = ref([
        { name: 'Rescisão', value: 'rescisao' },
        { name: 'Férias', value: 'ferias' },
        { name: 'Horas Extras', value: 'horas_extras' },
        { name: 'Insalubridade', value: 'insalubridade' },
        { name: 'Periculosidade', value: 'periculosidade' },
        { name: 'Outros', value: 'outros' }
    ]);

    // Opções de status disponíveis
    const statusOptions = ref([
        { name: 'Pendente', value: 'pending' },
        { name: 'Em Andamento', value: 'in_progress' },
        { name: 'Em Revisão', value: 'review' },
        { name: 'Concluído', value: 'completed' },
        { name: 'Cancelado', value: 'cancelled' }
    ]);

    // ===== Lifecycle hooks =====
    
    // Carregar dados quando o componente for montado
    onMounted(async () => {
        await loadData();
    });

    // ===== Watchers =====
    
    // Observar mudanças na visibilidade do diálogo
    watch(() => props.visible, async (isVisible) => {
        if (isVisible) {
            // Quando o diálogo é aberto, carrega dados iniciais
            await loadData();
            
            // Carregar tipos de serviço do cliente selecionado
            if (serviceData.value.client) {
                await loadServiceTypesForClient(serviceData.value.client);
            }
        } else {
            // Quando o diálogo é fechado, resetar o formulário
            resetForm();
        }
    });

    // Observar mudanças nas props de serviço
    watch(() => props.service, (newValue) => {
        if (newValue && Object.keys(newValue).length > 0) {
            // Atualizar o estado local com os dados do serviço
            serviceData.value = { ...newValue };
        }
    }, { deep: true, immediate: true });

    // Observar mudanças no cliente selecionado
    watch(() => serviceData.value.client, async (clientId) => {
        if (clientId) {
            // Quando o cliente muda, carregar tipos de serviço correspondentes
            await loadServiceTypesForClient(clientId);
        } else {
            // Se não houver cliente, limpar tipos de serviço
            serviceTypes.value = [];
        }
    });

    // ===== Métodos =====
    
    // Carregar dados iniciais
    const loadData = async () => {
        try {
            // Carregar clientes se ainda não estiverem carregados
            if (clients.value.length === 0) {
                await clientStore.fetchClients({ status: true });
                clients.value = clientStore.getClients;
            }
            
            // Carregar todos os tipos de serviço (geral)
            await tipoServicoClienteStore.fetchTiposServico({ page_size: 100 });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    // Carregar tipos de serviço específicos para um cliente
    const loadServiceTypesForClient = async (clientId) => {
        if (!clientId) return;
        
        try {
            // Definir filtros e buscar tipos de serviço para o cliente selecionado
            tipoServicoClienteStore.setFilters({ client_id: clientId, status: true });
            await tipoServicoClienteStore.fetchTiposServico();
            serviceTypes.value = tipoServicoClienteStore.getTiposServico;
        } catch (error) {
            console.error('Erro ao carregar tipos de serviço:', error);
            serviceTypes.value = [];
        }
    };

    // Resetar formulário para o estado inicial
    const resetForm = () => {
        serviceData.value = {
            id: null,
            title: '',
            description: '',
            client: null,
            service_type: null,
            calculation_type: '',
            status: 'pending',
            deadline: null,
            notes: ''
        };
    };

    // Fechar o diálogo
    const hideDialog = () => {
        emit('hide');
        emit('update:visible', false);
    };

    // Salvar o serviço
    const saveService = () => {
        // Preparar dados para envio
        const serviceToSave = { ...serviceData.value };
        
        // Formatar a data para o formato esperado pela API (YYYY-MM-DD)
        if (serviceToSave.deadline instanceof Date) {
            const year = serviceToSave.deadline.getFullYear();
            const month = String(serviceToSave.deadline.getMonth() + 1).padStart(2, '0');
            const day = String(serviceToSave.deadline.getDate()).padStart(2, '0');
            serviceToSave.deadline = `${year}-${month}-${day}`;
        }
        
        // Emitir evento save com os dados formatados
        emit('save', serviceToSave);
    };
</script>

<template>
    <Dialog
        v-model:visible="dialogVisible"
        :style="{ width: '600px' }"
        :header="serviceData.id ? 'Editar Serviço' : 'Novo Serviço'"
        :modal="true"
        class="p-fluid"
    >
        <div class="form-container">
            <div class="grid">
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="title">Título *</label>
                        <InputText
                            id="title"
                            v-model.trim="serviceData.title"
                            required="true"
                            autofocus
                            :class="{ 'p-invalid': submitted && !serviceData.title }"
                            :disabled="loading"
                        />
                        <small v-if="submitted && !serviceData.title" class="p-error">Título é obrigatório.</small>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="client">Cliente *</label>
                        <Dropdown
                            id="client"
                            v-model="serviceData.client"
                            :options="clients"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecione um cliente"
                            :class="{ 'p-invalid': submitted && !serviceData.client }"
                            :disabled="loading"
                            :loading="clientsLoading"
                        />
                        <small v-if="submitted && !serviceData.client" class="p-error">Cliente é obrigatório.</small>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="service_type">Tipo de Serviço *</label>
                        <Dropdown
                            id="service_type"
                            v-model="serviceData.service_type"
                            :options="serviceTypes"
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Selecione um tipo de serviço"
                            :class="{ 'p-invalid': submitted && !serviceData.service_type }"
                            :disabled="loading"
                            :loading="serviceTypesLoading"
                        />
                        <small v-if="submitted && !serviceData.service_type" class="p-error">Tipo de serviço é obrigatório.</small>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="calculation_type">Tipo de Cálculo *</label>
                        <Dropdown
                            id="calculation_type"
                            v-model="serviceData.calculation_type"
                            :options="calculationTypes"
                            optionLabel="name"
                            optionValue="value"
                            placeholder="Selecione um tipo de cálculo"
                            :class="{ 'p-invalid': submitted && !serviceData.calculation_type }"
                            :disabled="loading"
                        />
                        <small v-if="submitted && !serviceData.calculation_type" class="p-error">Tipo de cálculo é obrigatório.</small>
                    </div>
                </div>

                <div class="col-12">
                    <div class="field">
                        <label for="description">Descrição *</label>
                        <Textarea
                            id="description"
                            v-model="serviceData.description"
                            rows="3"
                            :class="{ 'p-invalid': submitted && !serviceData.description }"
                            :disabled="loading"
                        />
                        <small v-if="submitted && !serviceData.description" class="p-error">Descrição é obrigatória.</small>
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="deadline">Prazo</label>
                        <Calendar
                            id="deadline"
                            v-model="serviceData.deadline"
                            dateFormat="yy-mm-dd"
                            placeholder="AAAA-MM-DD"
                            :disabled="loading"
                        />
                    </div>
                </div>

                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="status">Status *</label>
                        <Dropdown
                            id="status"
                            v-model="serviceData.status"
                            :options="statusOptions"
                            optionLabel="name"
                            optionValue="value"
                            placeholder="Selecione um status"
                            :class="{ 'p-invalid': submitted && !serviceData.status }"
                            :disabled="loading"
                        />
                        <small v-if="submitted && !serviceData.status" class="p-error">Status é obrigatório.</small>
                    </div>
                </div>

                <div class="col-12">
                    <div class="field">
                        <label for="notes">Observações</label>
                        <Textarea
                            id="notes"
                            v-model="serviceData.notes"
                            rows="3"
                            :disabled="loading"
                        />
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="actions">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" :disabled="loading" />
                <Button label="Salvar" icon="pi pi-check" class="p-button-primary" @click="saveService" :loading="loading" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.form-container {
    padding: 1rem;
}

.field {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 2rem;
}
</style> 