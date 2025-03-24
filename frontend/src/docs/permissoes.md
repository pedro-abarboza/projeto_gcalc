# Sistema de Permissões

Este documento apresenta a implementação do sistema de permissões na aplicação, explicando como utilizar os componentes e diretivas disponíveis para controle de acesso.

## Componentes e Diretivas Disponíveis

### 1. Componente `PermissionCheck`

O componente `PermissionCheck` permite renderizar conteúdo condicionalmente com base nas permissões do usuário.

#### Propriedades:

- `permission`: String ou Array de Strings - A permissão ou lista de permissões necessárias
- `type`: String - Tipo de verificação ('all' ou 'any')
  - 'all': Requer que o usuário tenha todas as permissões listadas
  - 'any': Requer que o usuário tenha pelo menos uma das permissões listadas

#### Exemplo de uso:

```vue
<!-- Componente que só aparece se o usuário tem permissão 'ver_clientes' -->
<PermissionCheck permission="ver_clientes">
  <ClientesList />
</PermissionCheck>

<!-- Componente que aparece se o usuário tem TODAS as permissões listadas -->
<PermissionCheck :permission="['editar_usuarios', 'admin']" type="all">
  <UserEditForm />
</PermissionCheck>

<!-- Componente que aparece se o usuário tem QUALQUER UMA das permissões listadas -->
<PermissionCheck :permission="['ver_dashboard', 'admin']" type="any">
  <DashboardStats />
</PermissionCheck>
```

### 2. Diretiva `v-permission`

A diretiva `v-permission` permite controlar a visibilidade de elementos HTML com base nas permissões do usuário.

#### Modificadores:

- `v-permission:all`: Requer todas as permissões listadas
- `v-permission:any`: Requer pelo menos uma das permissões listadas
- `v-permission` (sem modificador): Comporta-se como `v-permission:all`

#### Exemplo de uso:

```vue
<!-- Botão que só aparece se o usuário tiver a permissão 'adicionar_usuario' -->
<Button v-permission="'adicionar_usuario'" label="Adicionar Usuário" />

<!-- Elemento que aparece se o usuário tiver QUALQUER UMA das permissões listadas -->
<div v-permission:any="['editar_clientes', 'admin']">
  Conteúdo visível para administradores ou editores de clientes
</div>

<!-- Elemento que aparece se o usuário tiver TODAS as permissões listadas -->
<div v-permission:all="['gerar_relatorio', 'ver_financeiro']">
  Conteúdo visível apenas para usuários que podem gerar relatórios E ver dados financeiros
</div>
```

## Proteção de Rotas

Além dos componentes e diretivas, as rotas podem ser protegidas definindo permissões necessárias na configuração do router.

### Exemplo de configuração de rota:

```javascript
{
  path: '/usuarios',
  name: 'usuarios',
  component: () => import('@/views/pages/UsuariosPage.vue'),
  meta: {
    requiresAuth: true,
    permissions: ['ver_usuarios'],
    permissionType: 'any' // ou 'all'
  }
}
```

### Tipos de validação em rotas:

- `permissionType: 'all'`: Requer que o usuário tenha todas as permissões listadas
- `permissionType: 'any'`: Requer que o usuário tenha pelo menos uma das permissões listadas

Se o usuário tentar acessar uma rota sem as permissões necessárias, será redirecionado para a página de acesso proibido.

## Permissões Disponíveis no Sistema

Lista de permissões principais implementadas no sistema:

| Permissão | Descrição |
|-----------|-----------|
| admin | Acesso total a todas as funcionalidades |
| ver_dashboard | Visualizar dashboard |
| ver_usuarios | Visualizar lista de usuários |
| adicionar_usuario | Adicionar novos usuários |
| editar_usuario | Editar usuários existentes |
| excluir_usuario | Excluir usuários |
| ver_clientes | Visualizar clientes |
| adicionar_cliente | Adicionar novos clientes |
| editar_cliente | Editar clientes existentes |
| excluir_cliente | Excluir clientes |
| ver_servicos | Visualizar serviços |
| adicionar_servico | Adicionar novos serviços |
| editar_servico | Editar serviços existentes |
| excluir_servico | Excluir serviços |
| ver_financeiro | Visualizar dados financeiros |
| gerar_relatorio | Gerar relatórios |
| exportar_dados | Exportar dados |

## Implementação no Código

A verificação de permissões está implementada através de:

1. Componente `PermissionCheck` em `@/components/permissions/PermissionCheck.vue`
2. Diretiva `v-permission` em `@/plugins/permission.js`
3. Guarda de navegação em `@/router/permission-guard.js`
4. Configuração das rotas em `@/router/index.js`

## Integração com o Vuex/Pinia

O sistema de permissões utiliza o Pinia para gerenciar o estado do usuário atual e suas permissões associadas. As permissões são carregadas durante o login e armazenadas na store do usuário. 