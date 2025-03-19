# Prompt para Desenvolvimento de Sistema Frontend Vue 3 com Pinia

## Visão Geral do Sistema

Desenvolva um sistema frontend moderno para gerenciamento de serviços e clientes, utilizando Vue 3, Pinia para gerenciamento de estado e PrimeVue para componentes de UI. O sistema deve seguir uma arquitetura de componentes reutilizáveis e stores padronizadas.

## Tecnologias a serem utilizadas

- Vue 3 (Composition API)
- Pinia para gerenciamento de estado
- PrimeVue para componentes de UI
- Axios para requisições HTTP
- Vue Router para navegação

## Estrutura do Projeto

### Estrutura de Diretórios

```
frontend/
├── src/
│   ├── assets/           # Recursos estáticos (imagens, fontes, etc.)
│   ├── components/       # Componentes reutilizáveis
│   │   └── forms/        # Formulários reutilizáveis
│   ├── layouts/          # Layouts da aplicação
│   ├── router/           # Configuração de rotas
│   ├── services/         # Serviços para comunicação com API
│   ├── stores/           # Stores Pinia para gerenciamento de estado
│   ├── views/            # Páginas/Views da aplicação
│   │   └── pages/        # Páginas específicas
│   ├── App.vue           # Componente raiz
│   └── main.js           # Ponto de entrada da aplicação
```

## Padrões de Implementação

Veja os exemplos de código na pasta `exemplos/` para implementações detalhadas de:

- [Store Pinia](exemplos/store.js)
- [Store de Autenticação](exemplos/auth-store.js)
- [Componente de Formulário](exemplos/form-component.vue)
- [Formulário de Usuário](exemplos/user-form.vue)
- [Página de Listagem](exemplos/list-page.vue)

## Entidades do Sistema

Implemente as seguintes entidades com seus respectivos atributos:

1. **Cliente**
   - id
   - name (string, obrigatório)
   - document_type (string, obrigatório)
   - document_number (string, obrigatório)
   - email (string, obrigatório)
   - phone (string)
   - address (string)
   - status (boolean)
   - notes (string)
   - created_at (datetime)

2. **TipoServico**
   - id
   - name (string, obrigatório)
   - description (string)
   - client_id (integer, obrigatório, referência a Cliente)
   - price (decimal, obrigatório)
   - status (boolean)
   - created_at (datetime)

3. **Servico**
   - id
   - title (string, obrigatório)
   - description (string, obrigatório)
   - client_id (integer, obrigatório, referência a Cliente)
   - service_type_id (integer, obrigatório, referência a TipoServico)
   - calculation_type (string, obrigatório)
   - status (string, obrigatório)
   - deadline (date)
   - notes (string)
   - created_at (datetime)

4. **Usuario**
   - id
   - username (string, obrigatório)
   - email (string, obrigatório)
   - first_name (string, obrigatório)
   - last_name (string)
   - is_active (boolean)
   - is_staff (boolean)
   - date_joined (datetime)
   - last_login (datetime)
   - groups (array, referência a Grupos)
   - user_permissions (array, referência a Permissões)

## Funcionalidades Específicas

### Relacionamentos entre Entidades

- Ao selecionar um cliente no formulário de serviço, deve-se carregar apenas os tipos de serviço associados a esse cliente.
- Implementar filtros para buscar tipos de serviço por cliente.

### Autenticação e Gerenciamento de Usuários

- Implementar sistema de login com token JWT.
- Proteger rotas que requerem autenticação.
- Gerenciar permissões de usuários baseado em grupos.
- Implementar recuperação de senha.
- Manter registro de data/hora do último login.
- Permitir que usuários alterem suas próprias informações e senha.

### Validação de Formulários

- Todos os campos marcados com asterisco (*) são obrigatórios.
- Implementar validação visual com feedback ao usuário.
- Exibir mensagens de erro específicas para cada campo.

### Tratamento de Erros

- Implementar tratamento de erros nas requisições HTTP.
- Exibir mensagens de erro amigáveis usando o componente Toast.
- Registrar erros no console para depuração.

### Paginação e Filtros

- Implementar paginação nas listagens.
- Permitir busca por texto em campos relevantes.
- Implementar filtros específicos para cada entidade.

## Considerações Adicionais

- Utilize a Composition API do Vue 3 para todos os componentes.
- Siga o padrão de design do PrimeVue para manter a consistência visual.
- Implemente feedback visual para operações assíncronas (loading states).
- Garanta que todos os formulários possam ser navegados por teclado (acessibilidade).
- Utilize componentes reutilizáveis para evitar duplicação de código.
- Mantenha a consistência na nomenclatura de variáveis, métodos e componentes.

## Endpoints da API (Simulados)

- GET /api/clients/ - Listar clientes
- POST /api/clients/ - Criar cliente
- GET /api/clients/:id/ - Obter cliente específico
- PUT /api/clients/:id/ - Atualizar cliente
- DELETE /api/clients/:id/ - Excluir cliente

- GET /api/service-types/ - Listar tipos de serviço
- POST /api/service-types/ - Criar tipo de serviço
- GET /api/service-types/:id/ - Obter tipo de serviço específico
- PUT /api/service-types/:id/ - Atualizar tipo de serviço
- DELETE /api/service-types/:id/ - Excluir tipo de serviço
- PATCH /api/service-types/:id/toggle_status/ - Alternar status do tipo de serviço

- GET /api/services/ - Listar serviços
- POST /api/services/ - Criar serviço
- GET /api/services/:id/ - Obter serviço específico
- PUT /api/services/:id/ - Atualizar serviço
- DELETE /api/services/:id/ - Excluir serviço

- GET /api/users/ - Listar usuários
- POST /api/users/ - Criar usuário
- GET /api/users/:id/ - Obter usuário específico
- PUT /api/users/:id/ - Atualizar usuário
- DELETE /api/users/:id/ - Excluir usuário
- POST /api/auth/login/ - Autenticar usuário
- POST /api/auth/logout/ - Encerrar sessão
- GET /api/auth/user/ - Obter usuário autenticado
- POST /api/auth/password/change/ - Alterar senha 