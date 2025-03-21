<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useToast } from 'primevue/usetoast';
    import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
    import UserForm from '@/components/forms/UserForm.vue';
    import { useUserStore } from '@/stores/user';

    const userStore = useUserStore();
    const toast = useToast();
    const dt = ref();

    // Computed properties
    const users = computed(() => {
        // Garantir que users seja sempre um array
        return Array.isArray(userStore.getUsers) ? userStore.getUsers : [];
    });
    const loading = computed(() => userStore.isLoading);
    const error = computed(() => userStore.getError);

    const visible = ref(false);
    const submitted = ref(false);
    const userDialog = ref(false);
    const deleteUserDialog = ref(false);
    const deleteUsersDialog = ref(false);
    const user = ref({});
    const selectedUsers = ref([]);

    const exportCSV = () => {
        dt.value?.exportCSV();
    };

    const openNew = () => {
        user.value = {
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            group_ids: [],
            is_active: true,
            password: '',
            password2: ''
        };
        submitted.value = false;
        userDialog.value = true;
    };

    const hideDialog = () => {
        userDialog.value = false;
        submitted.value = false;
    };

    const saveUser = async () => {
        submitted.value = true;
        console.log('Tentando salvar usuário:', user.value);

        if (user.value.username?.trim() && user.value.email?.trim() && 
            user.value.first_name?.trim() && user.value.last_name?.trim() && 
            (!user.value.id || (user.value.id && !user.value.password) || 
             (user.value.password && user.value.password2 && user.value.password === user.value.password2))) {
            try {
                if (user.value.id) {
                    console.log('Atualizando usuário existente:', user.value.id);
                    await userStore.updateUser(user.value.id, user.value);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Atualizado', life: 3000 });
                } else {
                    console.log('Criando novo usuário');
                    await userStore.createUser(user.value);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Criado', life: 3000 });
                }
                userDialog.value = false;
                user.value = {};
                await loadUsers(); // Recarregar a lista após salvar
            } catch (error) {
                console.error('Erro ao salvar usuário:', error);
                
                // Tratamento detalhado de erros da API
                let errorMessage = 'Erro ao salvar usuário';
                
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
        } else {
            console.log('Validação falhou');
            // Mostrar mensagem de erro se a validação falhar
            if (user.value.password && user.value.password2 && user.value.password !== user.value.password2) {
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'As senhas não conferem', 
                    life: 3000 
                });
            } else {
                toast.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Por favor, preencha todos os campos obrigatórios', 
                    life: 3000 
                });
            }
        }
    };

    const editUser = (data) => {
        console.log('Editando usuário:', data);
        // Criar uma cópia profunda do objeto para evitar referências
        user.value = JSON.parse(JSON.stringify(data));
        
        // Garantir que todos os campos necessários estejam presentes
        user.value = {
            ...user.value,
            password: '',
            password2: ''
        };
        
        console.log('Objeto de usuário para edição:', user.value);
        userDialog.value = true;
    };

    const confirmDeleteUser = (data) => {
        user.value = data;
        deleteUserDialog.value = true;
    };

    const deleteUser = async () => {
        try {
            await userStore.deleteUser(user.value.id);
            deleteUserDialog.value = false;
            user.value = {};
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Removido', life: 3000 });
            await loadUsers(); // Recarregar a lista após excluir
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.detail || 'Erro ao excluir usuário', life: 3000 });
        }
    };

    const confirmDeleteSelected = () => {
        deleteUsersDialog.value = true;
    };

    const deleteSelectedUsers = async () => {
        try {
            if (selectedUsers.value && selectedUsers.value.length > 0) {
                for (const user of selectedUsers.value) {
                    await userStore.deleteUser(user.id);
                }
                deleteUsersDialog.value = false;
                selectedUsers.value = [];
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuários excluídos com sucesso', life: 3000 });
                await loadUsers(); // Recarregar a lista após excluir
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.detail || 'Erro ao excluir usuários', life: 3000 });
        }
    };

    // Configuração de filtros padrão para o DataTable
    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        username: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        first_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        last_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        groups: { value: null, matchMode: FilterMatchMode.EQUALS },
        is_active: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    // Função para carregar todos os usuários de uma vez
    const loadUsers = async () => {
        try {
            userStore.loading = true;
            const response = await userStore.fetchAllUsers();
            userStore.loading = false;
        } catch (error) {
            userStore.loading = false;
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.detail || 'Erro ao carregar usuários', life: 3000 });
        }
    };

    const getGroupsLabel = (groups) => {
        if (!groups || !groups.length) return 'Sem função';
        return groups.map(group => group.name).join(', ');
    };

    const getStatusSeverity = (isActive) => {
        return isActive ? 'success' : 'danger';
    };

    const getStatusLabel = (isActive) => {
        return isActive ? 'Ativo' : 'Inativo';
    };

    const toggleUserStatus = async (user) => {
        try {
            await userStore.toggleStatus(user.id);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: `Usuário ${getStatusLabel(!user.is_active)}`, life: 3000 });
            await loadUsers(); // Recarregar a lista após alterar status
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.detail || 'Erro ao alterar status do usuário', life: 3000 });
        }
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
            command: () => editUser(data)
        },
        {
            label: 'Excluir',
            icon: 'pi pi-trash p-button-text p-button-danger',
            command: () => confirmDeleteUser(data)
        }
    ];

    const toggle = (event, data) => {
        menuRefs.value[data.id].toggle(event);
    };

    // Carregar usuários ao montar o componente
    onMounted(async () => {
        try {
            await loadUsers();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error, life: 3000 });
        }
    });

</script>

<template>
    <div class="card">
        <Toast />
        <Toolbar class="mb-4">
            <template #start>
                <div class="my-2">
                    <Button label="Novo Usuário" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                    <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" :disabled="loading || !selectedUsers || !selectedUsers.length" @click="confirmDeleteSelected" />
                </div>
            </template>
            <template #end>
                <Button label="Exportar" icon="pi pi-upload" severity="secondary" @click="exportCSV" :disabled="loading" />
            </template>
        </Toolbar>

        <DataTable
            ref="dt"
            :value="users"
            v-model:selection="selectedUsers"
            dataKey="id"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5, 10, 25, 50]"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
            :loading="loading"
            :filters="filters"
            :rowHover="true"
            :globalFilterFields="['username', 'email', 'first_name', 'last_name', 'groups']"
            :exportFilename="'usuarios'"
            responsiveLayout="scroll"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <h4 class="m-0">Gestão de Usuários</h4>
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
                    Carregando usuários...
                </div>
                <div class="text-center p-4" v-else>
                    Nenhum usuário encontrado.
                </div>
            </template>

            <template #loading>
                <div class="text-center p-4">
                    Carregando usuários...
                </div>
            </template>

            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="username" header="Usuário" :sortable="true" headerStyle="width: 15%"></Column>
            <Column field="email" header="E-mail" :sortable="true" headerStyle="width: 20%"></Column>
            <Column field="first_name" header="Nome" :sortable="true" headerStyle="width: 15%"></Column>
            <Column field="last_name" header="Sobrenome" :sortable="true" headerStyle="width: 15%"></Column>
            <Column field="groups" header="Funções" :sortable="false" headerStyle="width: 15%">
                <template #body="slotProps">
                    {{ getGroupsLabel(slotProps.data.groups) }}
                </template>
            </Column>
            <Column field="is_active" header="Status" :sortable="true" headerStyle="width: 10%">
                <template #body="slotProps">
                    <Tag 
                        :value="getStatusLabel(slotProps.data.is_active)" 
                        :severity="getStatusSeverity(slotProps.data.is_active)" 
                        class="cursor-pointer"
                        @click="toggleUserStatus(slotProps.data)"
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
            <Column headerStyle="min-width:10rem;">
                <template #body="slotProps">
                    <Button icon="p-button-rounded pi pi-ellipsis-v" @click="(e) => toggle(e, slotProps.data)" aria-haspopup="true" aria-controls="overlay_menu" size="small" rounded raised />
                    <Menu :ref="(e) => get_menuRefs(e, slotProps.data.id)" id="overlay_menu" :model="getMenuItems(slotProps.data)" :popup="true" />
                </template>
            </Column>
            <Column>
                
            </Column>
        </DataTable>

        <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Dados do Usuário" :modal="true" class="p-fluid">
            <UserForm 
                v-model:user="user"
                :submitted="submitted"
                :loading="loading"
                @save="saveUser"
                @cancel="hideDialog"
            />
        </Dialog>

        <Dialog v-model:visible="deleteUserDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span v-if="user">Tem certeza que deseja excluir <b>{{ user.username }}</b>?</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteUserDialog = false" :disabled="loading" />
                <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteUser" :loading="loading" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteUsersDialog" :style="{ width: '450px' }" header="Confirmar" :modal="true">
            <div class="flex align-items-center justify-content-center">
                <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                <span>Tem certeza que deseja excluir os usuários selecionados?</span>
            </div>
            <template #footer>
                <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteUsersDialog = false" :disabled="loading" />
                <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedUsers" :loading="loading" />
            </template>
        </Dialog>
    </div>
</template>