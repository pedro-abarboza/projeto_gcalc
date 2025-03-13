import { computed, reactive, onMounted } from 'vue';

// Função para carregar as configurações do localStorage
const loadLayoutConfig = () => {
    try {
        const savedConfig = localStorage.getItem('layoutConfig');
        if (savedConfig) {
            return JSON.parse(savedConfig);
        }
    } catch (error) {
        console.error('Erro ao carregar configurações do layout:', error);
    }
    
    // Configurações padrão
    return {
        preset: 'Aura',
        primary: 'emerald',
        surface: null,
        darkTheme: false,
        menuMode: 'static'
    };
};

// Inicializa o layoutConfig com as configurações salvas ou padrão
const layoutConfig = reactive(loadLayoutConfig());

// Função para salvar as configurações no localStorage
const saveLayoutConfig = () => {
    try {
        localStorage.setItem('layoutConfig', JSON.stringify(layoutConfig));
    } catch (error) {
        console.error('Erro ao salvar configurações do layout:', error);
    }
};

const layoutState = reactive({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    activeMenuItem: null
});

export function useLayout() {
    const setActiveMenuItem = (item) => {
        layoutState.activeMenuItem = item.value || item;
    };

    const toggleDarkMode = () => {
        if (!document.startViewTransition) {
            executeDarkModeToggle();
            return;
        }

        document.startViewTransition(() => executeDarkModeToggle(event));
    };

    const executeDarkModeToggle = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme;
        document.documentElement.classList.toggle('app-dark');
        saveLayoutConfig(); // Salva a configuração após alteração
    };

    const toggleMenu = () => {
        if (layoutConfig.menuMode === 'overlay') {
            layoutState.overlayMenuActive = !layoutState.overlayMenuActive;
        }

        if (window.innerWidth > 991) {
            layoutState.staticMenuDesktopInactive = !layoutState.staticMenuDesktopInactive;
        } else {
            layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive;
        }
    };

    // Função para aplicar o tema escuro se estiver configurado
    const applyDarkTheme = () => {
        if (layoutConfig.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    };

    // Função para atualizar uma configuração específica
    const updateConfig = (key, value) => {
        if (key in layoutConfig) {
            layoutConfig[key] = value;
            saveLayoutConfig();
        }
    };

    const isSidebarActive = computed(() => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive);

    const isDarkTheme = computed(() => layoutConfig.darkTheme);

    const getPrimary = computed(() => layoutConfig.primary);

    const getSurface = computed(() => layoutConfig.surface);

    // Aplicar tema quando o componente for montado
    onMounted(() => {
        applyDarkTheme();
    });

    return {
        layoutConfig,
        layoutState,
        toggleMenu,
        isSidebarActive,
        isDarkTheme,
        getPrimary,
        getSurface,
        setActiveMenuItem,
        toggleDarkMode,
        updateConfig,
        saveLayoutConfig
    };
}
