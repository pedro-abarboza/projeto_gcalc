<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template #start>
                        <div class="my-2">
                            <Button label="Novo Usuário" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" :disabled="loading" />
                            <Button label="Excluir Selecionados" icon="pi pi-trash" class="p-button-danger" :disabled="loading || !selectedUsers || !selectedUsers.length" @click="confirmDeleteSelected" />
                        </div>
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
                    :loading="loading"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
                    responsiveLayout="scroll"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Gerenciar Usuários</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Buscar..." :disabled="loading" />
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
                    <Column field="username" header="Username" :sortable="true" headerStyle="min-width:8rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.username }}
                        </template>
                    </Column>
                    <Column field="email" header="Email" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.email }}
                        </template>
                    </Column>
                    <Column field="first_name" header="Nome" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.first_name }}
                        </template>
                    </Column>
                    <Column field="last_name" header="Sobrenome" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            {{ slotProps.data.last_name }}
                        </template>
                    </Column>
                    <Column field="is_active" header="Status" :sortable="true" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Tag :severity="getSeverity(slotProps.data.is_active)" :value="getStatus(slotProps.data.is_active)" />
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <div class="flex">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editUser(slotProps.data)" :disabled="loading" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteUser(slotProps.data)" :disabled="loading" />
                            </div>
                        </template>
                    </Column>
                </DataTable>

                <Dialog v-model:visible="userDialog" :style="{width: '450px'}" header="Detalhes do Usuário" :modal="true" class="p-fluid">
                    <div class="field">
                        <label for="username">Username</label>
                        <InputText id="username" v-model.trim="user.username" required="true" autofocus :class="{'p-invalid': submitted && !user.username}" :disabled="loading" />
                        <small class="p-invalid" v-if="submitted && !user.username">Username é obrigatório.</small>
                    </div>
                    <div class="field">
                        <label for="email">Email</label>
                        <InputText id="email" v-model.trim="user.email" required="true" :class="{'p-invalid': submitted && !user.email}" :disabled="loading" />
                        <small class="p-invalid" v-if="submitted && !user.email">Email é obrigatório.</small>
                    </div>
                    <div class="field">
                        <label for="first_name">Nome</label>
                        <InputText id="first_name" v-model.trim="user.first_name" required="true" :class="{'p-invalid': submitted && !user.first_name}" :disabled="loading" />
                        <small class="p-invalid" v-if="submitted && !user.first_name">Nome é obrigatório.</small>
                    </div>
                    <div class="field">
                        <label for="last_name">Sobrenome</label>
                        <InputText id="last_name" v-model.trim="user.last_name" required="true" :class="{'p-invalid': submitted && !user.last_name}" :disabled="loading" />
                        <small class="p-invalid" v-if="submitted && !user.last_name">Sobrenome é obrigatório.</small>
                    </div>
                    <div class="field" v-if="!user.id">
                        <label for="password">Senha</label>
                        <Password id="password" v-model="user.password" required="true" :class="{'p-invalid': submitted && !user.password}" toggleMask :disabled="loading" />
                        <small class="p-invalid" v-if="submitted && !user.password">Senha é obrigatória.</small>
                    </div>
                    <div class="field">
                        <label for="is_active">Status</label>
                        <div class="formgrid grid">
                            <div class="field-radiobutton col-6">
                                <RadioButton id="is_active_yes" name="is_active" value="true" v-model="user.is_active" :disabled="loading" />
                                <label for="is_active_yes">Ativo</label>
                            </div>
                            <div class="field-radiobutton col-6">
                                <RadioButton id="is_active_no" name="is_active" value="false" v-model="user.is_active" :disabled="loading" />
                                <label for="is_active_no">Inativo</label>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog" :disabled="loading" />
                        <Button label="Salvar" icon="pi pi-check" class="p-button-text" @click="saveUser" :loading="loading" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteUserDialog" :style="{width: '450px'}" header="Confirmar" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="user">Tem certeza que deseja excluir <b>{{user.username}}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteUserDialog = false" :disabled="loading" />
                        <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteUser" :loading="loading" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteUsersDialog" :style="{width: '450px'}" header="Confirmar" :modal="true">
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
        </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '@/stores/user';

export default {
    setup() {
        const toast = useToast();
        const userStore = useUserStore();
        const dt = ref(null);
        const userDialog = ref(false);
        const deleteUserDialog = ref(false);
        const deleteUsersDialog = ref(false);
        const user = ref({});
        const selectedUsers = ref(null);
        const submitted = ref(false);
        const filters = ref({
            'global': { value: null, matchMode: 'contains' }
        });

        // Computed properties
        const users = computed(() => userStore.getUsers);
        const loading = computed(() => userStore.isLoading);
        const error = computed(() => userStore.getError);

        onMounted(() => {
            loadUsers();
        });

        const loadUsers = async () => {
            try {
                await userStore.fetchUsers();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao carregar usuários', life: 3000 });
            }
        };

        const openNew = () => {
            user.value = {
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                password: '',
                is_active: true
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

            if (user.value.username && user.value.email && user.value.first_name && user.value.last_name && (!user.value.id || user.value.password)) {
                try {
                    if (user.value.id) {
                        await userStore.updateUser(user.value.id, user.value);
                        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário atualizado', life: 3000 });
                    } else {
                        await userStore.createUser(user.value);
                        toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário criado', life: 3000 });
                    }

                    userDialog.value = false;
                    user.value = {};
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao salvar usuário', life: 3000 });
                }
            }
        };

        const editUser = (editUser) => {
            user.value = { ...editUser };
            userDialog.value = true;
        };

        const confirmDeleteUser = (deleteUser) => {
            user.value = deleteUser;
            deleteUserDialog.value = true;
        };

        const deleteUser = async () => {
            try {
                await userStore.deleteUser(user.value.id);
                deleteUserDialog.value = false;
                user.value = {};
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuário excluído', life: 3000 });
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao excluir usuário', life: 3000 });
            }
        };

        const confirmDeleteSelected = () => {
            deleteUsersDialog.value = true;
        };

        const deleteSelectedUsers = async () => {
            try {
                for (let user of selectedUsers.value) {
                    await userStore.deleteUser(user.id);
                }
                deleteUsersDialog.value = false;
                selectedUsers.value = null;
                toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuários excluídos', life: 3000 });
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao excluir usuários', life: 3000 });
            }
        };

        const getSeverity = (status) => {
            return status ? 'success' : 'danger';
        };

        const getStatus = (status) => {
            return status ? 'Ativo' : 'Inativo';
        };

        return {
            dt,
            users,
            loading,
            error,
            userDialog,
            deleteUserDialog,
            deleteUsersDialog,
            user,
            selectedUsers,
            submitted,
            filters,
            openNew,
            hideDialog,
            saveUser,
            editUser,
            confirmDeleteUser,
            deleteUser,
            confirmDeleteSelected,
            deleteSelectedUsers,
            getSeverity,
            getStatus
        };
    }
};
</script> 