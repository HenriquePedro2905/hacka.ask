# Hackacast - Sistema de Perguntas Anônimas (Next.js)

Sistema de perguntas anônimas para o podcast Hackacast, desenvolvido com **Next.js 16**, **TypeScript** e **Tailwind CSS 4**, seguindo a identidade visual DIY/Zine monocromática (preto e branco).

## 🎨 Características

- **Identidade Visual DIY/Zine**: Estética monocromática com elementos "sketchy" (rabiscados)
- **Tipografia**: 
  - **Permanent Marker** (títulos e destaques)
  - **Oswald** (corpo de texto)
- **4 Telas Principais**:
  1. Tela de envio de pergunta
  2. Tela de sucesso com cooldown de 5 minutos
  3. Tela de login admin
  4. Dashboard admin com filtro de edições

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Passos

1. **Extrair o projeto** (se estiver em ZIP)
```bash
unzip hackacast-nextjs.zip
cd hackacast-nextjs
```

2. **Instalar dependências**
```bash
pnpm install
# ou
npm install
```

3. **Executar em modo de desenvolvimento**
```bash
pnpm dev
# ou
npm run dev
```

4. **Acessar o projeto**
Abra seu navegador em: `http://localhost:3000`

## 🚀 Build para Produção

```bash
# Criar build otimizado
pnpm build

# Executar em produção
pnpm start
```

## 📁 Estrutura do Projeto

```
hackacast-nextjs/
├── app/
│   ├── page.tsx                    # Tela principal (envio de pergunta)
│   ├── success/
│   │   └── page.tsx                # Tela de sucesso/cooldown
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx            # Tela de login admin
│   │   └── dashboard/
│   │       └── page.tsx            # Dashboard admin
│   ├── layout.tsx                  # Layout global
│   └── globals.css                 # Estilos globais
├── public/                         # Arquivos estáticos
├── package.json
└── next.config.ts
```

## 🎯 Funcionalidades

### Usuário
- **Seleção de Edição**: Escolher entre "Sextou com Jogos", "De frente com Frank" ou "The night com Miola"
- **Envio de Pergunta**: Campo de texto para pergunta anônima
- **Cooldown**: Sistema de 5 minutos de espera após envio (simulado)

### Admin
- **Login Simples**: Autenticação simulada (qualquer usuário/senha)
- **Filtro de Edições**: Visualizar perguntas por edição
- **Lista de Perguntas**: Perguntas mockadas para demonstração

## ⚙️ Tecnologias Utilizadas

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Google Fonts** (Permanent Marker + Oswald)

## 🔥 Configuração do Firebase

**IMPORTANTE:** Este projeto agora utiliza Firebase para backend real!

Antes de executar o projeto, você precisa:

1. **Configurar um projeto Firebase** seguindo o guia completo em `FIREBASE_SETUP.md`
2. **Criar o arquivo `.env.local`** com suas credenciais do Firebase
3. **Criar um usuário admin** no Firebase Authentication

Sem a configuração do Firebase, o projeto **NÃO funcionará**.

### Funcionalidades Implementadas

✅ **Autenticação real** com Firebase Authentication (email/senha)
✅ **Banco de dados real** com Firestore
✅ **Rate limiting funcional** (5 minutos entre envios)
✅ **Dashboard admin** com perguntas reais
✅ **Deletar perguntas** (apenas admin)
✅ **Toast notifications** para feedback ao usuário
✅ **Loading states** em todas as operações
✅ **Proteção de rotas** admin com middleware

## 🔧 Customização

### Alterar Edições
Edite o array `editions` em:
- `app/page.tsx` (tela principal)
- `app/admin/dashboard/page.tsx` (dashboard)

### Alterar Perguntas Mockadas
Edite o objeto `mockQuestions` em `app/admin/dashboard/page.tsx`

### Alterar Cores
Edite as variáveis CSS em `app/globals.css` (seção `:root`)

## 🔐 Segurança

- IPs são anonimizados usando SHA-256 antes de serem armazenados
- Regras de segurança do Firestore protegem os dados
- Apenas admins autenticados podem acessar o dashboard
- Credenciais do Firebase nunca devem ser commitadas no Git

## 📄 Licença

Projeto desenvolvado para o podcast Hackacast com funcionalidades completas de backend.

