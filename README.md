# Isadora - Plataforma para Trancista

Plataforma web para gestao de negocio de trancista: financas, clientes, agenda e agendamento publico.

## Funcionalidades

- **Dashboard Admin**: visao geral de receitas, despesas, saldo e proximos agendamentos
- **Financas**: registro manual de ganhos e gastos, graficos mensais
- **Clientes**: lista com busca e historico de agendamentos
- **Agenda**: visualizacao semanal, edicao de status dos agendamentos
- **Agendamento Publico**: clientes agendam sem conta, escolhendo data, horario, estilo e cor das trancas

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- NextAuth.js
- Recharts

## Como rodar

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar ambiente

Crie um arquivo `.env` na raiz (ou copie de `.env.example`):

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Criar banco e popular dados iniciais

```bash
npx prisma db push
npm run db:seed
```

O seed cria:

- Usuario admin: `admin@isadora.com` / senha: `admin123`
- Estilos de tranca (Box Braids, Tranca Nago, etc.)
- Cores (Preto, Castanho, Louro, etc.)

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

- **Pagina inicial**: links para Agendar e Area Admin
- **/agendar**: formulario publico de agendamento
- **/admin/login**: login do administrador
- **/admin**: dashboard apos login

## Estrutura

```
app/
  admin/           # Dashboard protegido
    financeiros/   # Financas
    clientes/      # Lista de clientes
    agenda/        # Agenda semanal
    login/         # Login
  agendar/         # Agendamento publico
  api/             # API Routes
prisma/
  schema.prisma    # Modelo de dados
  seed.ts          # Dados iniciais
```

