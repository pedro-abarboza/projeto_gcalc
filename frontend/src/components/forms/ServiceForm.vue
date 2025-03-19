<template>
    <Dialog
        :visible="visible"
        @update:visible="emit('update:visible', $event)"
        :style="{ width: '600px' }"
        :header="service.id ? 'Editar Serviço' : 'Novo Serviço'"
        :modal="true"
        class="p-fluid"
        :closable="false"
    >
        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="title" class="font-bold">Título *</label>
                    <InputText
                        id="title"
                        :modelValue="service.title || ''"
                        @update:modelValue="value => updateService('title', value?.trim())"
                        :class="{ 'p-invalid': submitted && !service.title }"
                        :disabled="loading"
                    />
                    <small v-if="submitted && !service.title" class="p-error">Título é obrigatório.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="client" class="font-bold">Cliente *</label>
                    <Dropdown
                        id="client"
                        :modelValue="service.client_id"
                        @update:modelValue="value => updateService('client_id', value)"
                        :options="clients"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Selecione um cliente"
                        :class="{ 'p-invalid': submitted && !service.client_id }"
                        :disabled="loading"
                    />
                    <small v-if="submitted && !service.client_id" class="p-error">Cliente é obrigatório.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="service_type" class="font-bold">Tipo de Serviço *</label>
                    <Dropdown
                        id="service_type"
                        :modelValue="service.service_type_id"
                        @update:modelValue="value => updateService('service_type_id', value)"
                        :options="serviceTypes"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Selecione um tipo de serviço"
                        :class="{ 'p-invalid': submitted && !service.service_type_id }"
                        :disabled="loading"
                    />
                    <small v-if="submitted && !service.service_type_id" class="p-error">Tipo de serviço é obrigatório.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="calculation_type" class="font-bold">Tipo de Cálculo *</label>
                    <Dropdown
                        id="calculation_type"
                        :modelValue="service.calculation_type"
                        @update:modelValue="value => updateService('calculation_type', value)"
                        :options="calculationTypes"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Selecione um tipo de cálculo"
                        :class="{ 'p-invalid': submitted && !service.calculation_type }"
                        :disabled="loading"
                    />
                    <small v-if="submitted && !service.calculation_type" class="p-error">Tipo de cálculo é obrigatório.</small>
                </div>
            </div>

            <div class="col-12">
                <div class="field">
                    <label for="description" class="font-bold">Descrição *</label>
                    <Textarea
                        id="description"
                        :modelValue="service.description || ''"
                        @update:modelValue="value => updateService('description', value)"
                        rows="3"
                        :class="{ 'p-invalid': submitted && !service.description }"
                        :disabled="loading"
                    />
                    <small v-if="submitted && !service.description" class="p-error">Descrição é obrigatória.</small>
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="deadline" class="font-bold">Prazo</label>
                    <Calendar
                        id="deadline"
                        :modelValue="service.deadline"
                        @update:modelValue="value => updateService('deadline', value)"
                        dateFormat="yy-mm-dd"
                        placeholder="AAAA-MM-DD"
                        :disabled="loading"
                    />
                </div>
            </div>

            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="status" class="font-bold">Status *</label>
                    <Dropdown
                        id="status"
                        :modelValue="service.status"
                        @update:modelValue="value => updateService('status', value)"
                        :options="statusOptions"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Selecione um status"
                        :class="{ 'p-invalid': submitted && !service.status }"
                        :disabled="loading"
                    />
                    <small v-if="submitted && !service.status" class="p-error">Status é obrigatório.</small>
                </div>
            </div>

            <div class="col-12">
                <div class="field">
                    <label for="notes">Observações</label>
                    <Textarea
                        id="notes"
                        :modelValue="service.notes || ''"
                        @update:modelValue="value => updateService('notes', value)"
                        rows="3"
                        :disabled="loading"
                    />
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="cancelEdit" :disabled="loading" />
            <Button label="Salvar" icon="pi pi-check" class="p-button-text" @click="saveService" :loading="loading" />
        </template>
    </Dialog>
</template>

<script setup>
    import { ref, computed, watch } from 'vue';
    import { useClientStore } from '@/stores/client';
    import { useUserStore } from '@/stores/user';
    import { useTipoServicoClienteStore } from '@/stores/tipoServicoCliente';

    const clientStore = useClientStore();
    const userStore = useUserStore();
    const tipoServicoClienteStore = useTipoServicoClienteStore();

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
                client_id: null,
                service_type_id: null,
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

    const emit = defineEmits(['update:visible', 'update:service', 'save', 'cancel']);

    const clients = ref([]);
    const serviceTypes = ref([]);
    const clientsLoading = computed(() => clientStore.isLoading);
    const serviceTypesLoading = computed(() => tipoServicoClienteStore.isLoading);

    const calculationTypes = ref([
        { name: 'Rescisão', value: 'rescisao' },
        { name: 'Férias', value: 'ferias' },
        { name: 'Horas Extras', value: 'horas_extras' },
        { name: 'Insalubridade', value: 'insalubridade' },
        { name: 'Periculosidade', value: 'periculosidade' },
        { name: 'Outros', value: 'outros' }
    ]);

    const statusOptions = ref([
        { name: 'Pendente', value: 'pending' },
        { name: 'Em Andamento', value: 'in_progress' },
        { name: 'Em Revisão', value: 'review' },
        { name: 'Concluído', value: 'completed' },
        { name: 'Cancelado', value: 'cancelled' }
    ]);

    // Carregar clientes e tipos de serviço
    watch(() => props.visible, async (isVisible) => {
        if (isVisible) {
            try {
                await clientStore.fetchClients({ page_size: 100 });
                clients.value = clientStore.getClients;
                
                // Carregar tipos de serviço do cliente selecionado
                if (props.service.client_id) {
                    await loadServiceTypesForClient(props.service.client_id);
                } else {
                    await tipoServicoClienteStore.fetchTiposServico({ page_size: 100 });
                    serviceTypes.value = tipoServicoClienteStore.getTiposServico;
                }
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            }
        }
    }, { immediate: true });

    // Carregar tipos de serviço quando o cliente mudar
    watch(() => props.service.client_id, async (clientId) => {
        if (clientId) {
            await loadServiceTypesForClient(clientId);
        } else {
            serviceTypes.value = [];
        }
    });

    // Carregar tipos de serviço quando o diálogo for aberto
    watch(() => props.visible, async (newValue) => {
        if (newValue && props.service.client_id) {
            await loadServiceTypesForClient(props.service.client_id);
        }
    });

    // Função para carregar tipos de serviço por cliente
    const loadServiceTypesForClient = async (clientId) => {
        if (!clientId) return;
        
        try {
            tipoServicoClienteStore.setFilters({ client: clientId, status: true });
            await tipoServicoClienteStore.fetchTiposServico();
            serviceTypes.value = tipoServicoClienteStore.getTiposServico;
        } catch (error) {
            console.error('Erro ao carregar tipos de serviço:', error);
            serviceTypes.value = [];
        }
    };

    const updateService = (field, value) => {
        console.log(`Atualizando campo ${field} para:`, value);
        const updatedService = { ...props.service, [field]: value };
        console.log('Serviço atualizado:', updatedService);
        emit('update:service', updatedService);
    };

    // Função para salvar o serviço
    const saveService = () => {
        console.log('Salvando serviço:', props.service);
        
        // Preparar dados para envio
        const serviceToSave = { ...props.service };
        
        // Formatar a data para o formato esperado pela API (YYYY-MM-DD)
        if (serviceToSave.deadline instanceof Date) {
            const year = serviceToSave.deadline.getFullYear();
            const month = String(serviceToSave.deadline.getMonth() + 1).padStart(2, '0');
            const day = String(serviceToSave.deadline.getDate()).padStart(2, '0');
            serviceToSave.deadline = `${year}-${month}-${day}`;
        }
        
        emit('save', serviceToSave);
    };

    // Função para cancelar
    const cancelEdit = () => {
        console.log('Cancelando edição');
        emit('cancel');
        emit('update:visible', false);
    };

    // Debug para verificar o conteúdo do serviço
    watch(() => props.service, (newValue) => {
        console.log('Service data changed:', newValue);
    }, { deep: true });
</script>

<style scoped>
.field {
    margin-bottom: 1.5rem;
}
</style> 