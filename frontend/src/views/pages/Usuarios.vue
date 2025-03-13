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
            role: 'analyst',
            status: true,
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

        if (user.value.username?.trim() && user.value.email?.trim() && 
            user.value.first_name?.trim() && user.value.last_name?.trim() && 
            (!user.value.id || (user.value.password && user.value.password2 && user.value.password === user.value.password2))) {
            try {
                if (user.value.id) {
                    await userStore.updateUser(user.value.id, user.value);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Atualizado', life: 3000 });
                } else {
                    await userStore.createUser(user.value);
                    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Criado', life: 3000 });
                }
                userDialog.value = false;
                user.value = {};
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
        }
    };

    const editUser = (editUser) => {
        console.log('Editando usuário:', editUser);
        // Criar uma cópia profunda do objeto para evitar referências
        user.value = JSON.parse(JSON.stringify(editUser));
        userDialog.value = true;
    };

    const confirmDeleteUser = (editUser) => {
        user.value = editUser;
        deleteUserDialog.value = true;
    };

    const deleteUser = async () => {
        try {
            await userStore.deleteUser(user.value.id);
            deleteUserDialog.value = false;
            user.value = {};
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário Removido', life: 3000 });
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
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.detail || 'Erro ao excluir usuários', life: 3000 });
        }
    };

    const filters = ref({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        username: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        first_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        last_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    });

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'analyst': return 'Analista';
            case 'reviewer': return 'Revisor';
            default: return role;
        }
    };

    const getStatusSeverity = (status) => {
        return status ? 'success' : 'danger';
    };

    const getStatusLabel = (status) => {
        return status ? 'Ativo' : 'Inativo';
    };

    const toggleUserStatus = async (user) => {
        try {
            await userStore.toggleStatus(user.id);
            toast.add({ severity: 'success', summary: 'Sucesso', detail: `Usuário ${getStatusLabel(!user.status)}`, life: 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.detail || 'Erro ao alterar status do usuário', life: 3000 });
        }
    };

    onMounted(async () => {
        try {
            await userStore.fetchUsers();
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.detail || 'Erro ao carregar usuários', life: 3000 });
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
            :filters="filters"
            :exportFilename="'usuarios'"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
            :loading="loading"
        >
            <template #header>
                <div class="flex flex-column md:flex-row md:justify-between md:align-items-center">
                    <span class="block mt-2 md:mt-0 p-input-icon-left">
                        <h4 class="m-0">Gestão de Usuários</h4>
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
            <Column field="role" header="Função" :sortable="true" headerStyle="width: 15%">
                <template #body="slotProps">
                    {{ getRoleLabel(slotProps.data.role) }}
                </template>
            </Column>
            <Column field="status" header="Status" :sortable="true" headerStyle="width: 10%">
                <template #body="slotProps">
                    <Tag 
                        :value="getStatusLabel(slotProps.data.status)" 
                        :severity="getStatusSeverity(slotProps.data.status)" 
                        class="cursor-pointer"
                        @click="toggleUserStatus(slotProps.data)"
                    />
                </template>
            </Column>
            <Column headerStyle="min-width:10rem;">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editUser(slotProps.data)" :disabled="loading" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteUser(slotProps.data)" :disabled="loading" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="Detalhes do Usuário" :modal="true" class="p-fluid">
            <UserForm 
                v-model:user="user"
                :submitted="submitted"
                @save="saveUser"
                @cancel="hideDialog"
                :loading="loading"
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

<style scoped>
.card {
    background: var(--surface-card);
    padding: 2rem;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.field {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.p-button {
    margin-right: 0.5rem;
}

.p-dialog .p-dialog-content {
    padding: 2rem;
}

.p-dialog .p-dialog-footer {
    padding: 1.5rem;
}

.cursor-pointer {
    cursor: pointer;
}
</style> 