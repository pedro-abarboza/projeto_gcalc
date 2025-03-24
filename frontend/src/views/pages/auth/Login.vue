<script setup>
    import { ref, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useVuelidate } from '@vuelidate/core';
    import { required, minLength } from '@vuelidate/validators';
    import { useToast } from 'primevue/usetoast';
    import { useAuthStore } from '@/stores/auth';
    import { useUserStore } from '@/stores/user';
    import FloatingConfigurator from '@/components/FloatingConfigurator.vue';
    import Logo from '@/layout/AppLogo.vue';

    const router = useRouter();
    const route = useRoute();
    const toast = useToast();
    const authStore = useAuthStore();
    const userStore = useUserStore();

    const username = ref('');
    const password = ref('');
    const checked = ref(false);
    const loading = ref(false);

    const rules = {
        username: { required },
        password: { required, minLength: minLength(4) }
    };

    const v$ = useVuelidate(rules, { username, password });

    const handleLogin = async () => {
        loading.value = true;
        // Validar formulário antes de enviar
        const isFormValid = await v$.value.$validate();
        if (!isFormValid) {
            loading.value = false;
            return;
        }

        try {
            // Dados de login
            const credentials = {
                username: username.value,
                password: password.value
            };

            // Executar login
            await authStore.login(credentials);
            
            // Carregar o perfil do usuário com as permissões
            await userStore.fetchProfile();
            
            if (checked.value) {
                localStorage.setItem('rememberedUsername', username.value);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // Redirecionar para a rota anterior se tiver redirect, senão para dashboard
            const redirectPath = route.query.redirect || '/inicio';
            router.push(redirectPath);
            
            toast.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Login realizado com sucesso!',
                life: 3000
            });
        } catch (error) {
            console.error('Erro de login:', error);
            toast.add({
                severity: 'error',
                summary: 'Erro',
                detail: error.response?.data?.detail || 'Falha na autenticação. Verifique suas credenciais.',
                life: 3000
            });
        } finally {
            loading.value = false;
        }
    };
    
    // Se houver um username salvo, preencher o campo
    onMounted(() => {
        // Verificar se o usuário já está autenticado
        if (authStore.isAuthenticated) {
            // Redirecionar para o dashboard se já estiver autenticado
            const redirectPath = route.query.redirect || '/inicio';
            router.push(redirectPath);
            return;
        }
        
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            username.value = rememberedUsername;
            checked.value = true;
        }
    });
</script>

<template>
    <FloatingConfigurator />
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <div class="text-center mb-4">
                        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bem-vindo ao<br>
                            <div class="flex items-center justify-center">
                                <Logo />
                            </div>
                        </div>
                    </div>
                    <form @submit.prevent="handleLogin">
                        <div class="field">
                            <label for="username" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                                Usuário
                            </label>
                            <InputText 
                                id="username" 
                                v-model="username" 
                                type="text" 
                                class="w-full md:w-[30rem] mb-5" 
                                :class="{ 'p-invalid': v$.username.$error }"
                                placeholder="Digite seu usuário" 
                            />
                            <small v-if="v$.username.$error" class="p-error">{{ v$.username.$errors[0].$message }}</small>
                        </div>

                        <div class="field">
                            <label for="password" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">
                                Senha</label>
                            <Password 
                                id="password" 
                                v-model="password" 
                                :feedback="false"
                                :toggleMask="true"
                                class="p-password p-component p-inputwrapper p-password-fluid mb-4" 
                                :class="{ 'p-invalid': v$.password.$error }"
                                placeholder="Digite sua senha"
                            />
                            <small v-if="v$.password.$error" class="p-error">{{ v$.password.$errors[0].$message }}</small>
                        </div>

                        <div class="flex align-items-center justify-content-between mb-6 mt-3">
                            <div class="flex align-items-center">
                                <Checkbox v-model="checked" id="rememberme" binary class="mr-2" />
                                <label for="rememberme">Lembrar-me</label>
                            </div>
                            <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">
                                Esqueceu a senha?
                            </a>
                        </div>

                        <Button 
                            type="submit" 
                            label="Entrar" 
                            class="w-full p-3"
                            :loading="loading"
                        />
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
