# 🔥 Guia de Configuração do Firebase

Este guia fornece instruções passo a passo para configurar o Firebase no projeto Hackacast.

---

## 📋 Pré-requisitos

- Conta Google
- Projeto Next.js instalado e funcionando
- Acesso ao [Console do Firebase](https://console.firebase.google.com/)

---

## 🚀 Passo 1: Criar Projeto no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Digite o nome do projeto: `hackacast` (ou o nome que preferir)
4. **(Opcional)** Desabilite o Google Analytics se não for necessário
5. Clique em **"Criar projeto"**
6. Aguarde a criação do projeto e clique em **"Continuar"**

---

## 🌐 Passo 2: Registrar Aplicativo Web

1. No painel do projeto, clique no ícone **Web** (`</>`)
2. Digite o apelido do app: `Hackacast Web`
3. **NÃO** marque "Firebase Hosting" (a menos que queira usar)
4. Clique em **"Registrar app"**
5. **COPIE** as credenciais que aparecem na tela (você precisará delas!)

As credenciais terão este formato:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "hackacast-xxxxx.firebaseapp.com",
  projectId: "hackacast-xxxxx",
  storageBucket: "hackacast-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

6. Clique em **"Continuar no console"**

---

## 🔐 Passo 3: Configurar Authentication

1. No menu lateral, clique em **"Authentication"** (ou **"Autenticação"**)
2. Clique em **"Get started"** ou **"Começar"**
3. Na aba **"Sign-in method"**, clique em **"Email/Password"**
4. **Ative** a opção **"Email/Password"** (primeiro toggle)
5. Clique em **"Salvar"**

### Criar Usuário Admin

1. Vá para a aba **"Users"** (ou **"Usuários"**)
2. Clique em **"Add user"** (ou **"Adicionar usuário"**)
3. Digite:
   - **Email**: `admin@hackacast.com` (ou o email que preferir)
   - **Senha**: Crie uma senha forte (mínimo 6 caracteres)
4. Clique em **"Add user"**

**⚠️ IMPORTANTE:** Anote o email e senha do admin, você precisará deles para fazer login!

---

## 📊 Passo 4: Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Create database"** (ou **"Criar banco de dados"**)
3. Escolha o modo:
   - **Produção**: Mais seguro, requer regras de segurança
   - **Teste**: Permite leitura/escrita por 30 dias (recomendado para desenvolvimento)
4. Escolha a localização: `southamerica-east1` (São Paulo) ou a mais próxima
5. Clique em **"Ativar"**

### Configurar Regras de Segurança

1. Vá para a aba **"Rules"** (ou **"Regras"**)
2. Substitua as regras padrão por estas:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Coleção de perguntas
    match /questions/{questionId} {
      // Qualquer um pode criar perguntas (envio anônimo)
      allow create: if true;
      
      // Apenas usuários autenticados (admin) podem ler e deletar
      allow read, delete: if request.auth != null;
      
      // Ninguém pode atualizar perguntas
      allow update: if false;
    }
    
    // Coleção de rate limits
    match /rateLimits/{limitId} {
      // Qualquer um pode ler e escrever seus próprios rate limits
      allow read, write: if true;
    }
  }
}
```

3. Clique em **"Publicar"** ou **"Publish"**

---

## ⚙️ Passo 5: Configurar Variáveis de Ambiente

1. No diretório do projeto, copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

2. Abra o arquivo `.env.local` e cole suas credenciais do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hackacast-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hackacast-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hackacast-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

3. Salve o arquivo

**⚠️ SEGURANÇA:** Nunca commite o arquivo `.env.local` no Git!

---

## 🧪 Passo 6: Testar a Aplicação

1. Reinicie o servidor de desenvolvimento:

```bash
pnpm dev
```

2. Acesse: `http://localhost:3000`

### Testar Envio de Pergunta

1. Na página inicial, selecione uma edição
2. Digite uma pergunta
3. Clique em **"Enviar Pergunta"**
4. Você deve ver uma mensagem de sucesso e ser redirecionado

### Testar Login Admin

1. Clique em **"Área de Admin"**
2. Faça login com as credenciais criadas no Passo 3:
   - Email: `admin@hackacast.com`
   - Senha: (a senha que você criou)
3. Você deve ser redirecionado para o dashboard

### Verificar no Firebase Console

1. Vá para **Firestore Database** no console
2. Você deve ver a coleção `questions` com as perguntas enviadas
3. Você deve ver a coleção `rateLimits` com os registros de rate limit

---

## 🔍 Troubleshooting (Resolução de Problemas)

### Erro: "Firebase: Error (auth/invalid-api-key)"
- Verifique se copiou corretamente o `apiKey` no `.env.local`
- Certifique-se de que não há espaços extras

### Erro: "Missing or insufficient permissions"
- Verifique as regras de segurança do Firestore (Passo 4)
- Certifique-se de que publicou as regras

### Erro: "Firebase: Error (auth/user-not-found)"
- Verifique se criou o usuário admin no Authentication
- Confirme o email e senha corretos

### Erro: "Firebase: Error (auth/wrong-password)"
- Verifique a senha do usuário admin
- Tente resetar a senha no Console do Firebase

### Perguntas não aparecem no dashboard
- Verifique se está logado como admin
- Abra o Console do Firestore e confirme que as perguntas foram salvas
- Verifique o console do navegador (F12) para erros

---

## 📚 Recursos Adicionais

- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Firestore](https://firebase.google.com/docs/firestore)
- [Documentação do Authentication](https://firebase.google.com/docs/auth)
- [Regras de Segurança do Firestore](https://firebase.google.com/docs/firestore/security/get-started)

---

## ✅ Checklist Final

- [ ] Projeto Firebase criado
- [ ] App Web registrado e credenciais copiadas
- [ ] Authentication habilitado (Email/Password)
- [ ] Usuário admin criado
- [ ] Firestore Database criado
- [ ] Regras de segurança configuradas
- [ ] Arquivo `.env.local` criado com credenciais
- [ ] Servidor reiniciado
- [ ] Teste de envio de pergunta funcionando
- [ ] Teste de login admin funcionando
- [ ] Perguntas aparecendo no dashboard

---

🎉 **Parabéns!** Seu sistema Hackacast está configurado e funcionando com Firebase!

