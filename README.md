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

## Dicas do agente

O projeto Isadora foi implementado. Resumo:
Estrutura criada
Backend e configuração
Prisma com SQLite: models User, Client, Appointment, BraidStyle, Color, FinanceEntry
NextAuth.js com login por e-mail/senha para o admin
Seed com usuário admin (admin@isadora.com / admin123), 4 estilos de trança e 7 cores
API routes
GET/POST /api/appointments – listar, criar e checar horários ocupados
PATCH /api/appointments/[id] – alterar status do agendamento
GET /api/appointments/upcoming – próximos agendamentos
GET /api/clients e GET /api/clients/[id] – clientes com histórico
GET/POST /api/finance – lançamentos financeiros
GET /api/finance/summary – resumo e dados para gráficos
GET /api/braid-styles e GET /api/colors – catálogos públicos
Dashboard admin (protegido)
Home: totais do mês (receita, despesa, saldo) e próximos agendamentos
Finanças: filtro por mês/ano, gráfico de barras, formulário para novas entradas
Clientes: busca e histórico de agendamentos
Agenda: visualização semanal e alteração de status (pendente, confirmado, concluído, cancelado)
Página pública de agendamento
Passo 1: data e horário disponível
Passo 2: estilo da trança e cor
Passo 3: nome, telefone, e-mail e observações
Como rodar
No terminal, dentro da pasta do projeto:
npm installnpx prisma db pushnpm run db:seednpm run dev
Depois acesse http://localhost:3000:
Página inicial – links para “Agendar Horário” e “Área Admin”
/agendar – formulário de agendamento para clientes
/admin/login – login com admin@isadora.com / admin123
/admin – dashboard após o login
