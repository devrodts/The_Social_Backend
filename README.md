
### Exemplo de Mutations

#### Registrar Usuário
```graphql
mutation Register($input: RegisterInputDTO!) {
  register(input: $input) {
    token
    user {
      id
      username
      email
      displayName
    }
  }
}
```

#### Login
```graphql
mutation Login($input: LoginInputDTO!) {
  login(input: $input) {
    token
    user {
      id
      username
      email
      displayName
    }
  }
}
```

## 🎯 Próximos Passos

### Fase 1: Correções Críticas (1-2 dias)
1. ✅ Corrigir RegisterUseCase e LoginUseCase
2. ✅ Implementar InMemoryUserRepository
3. ✅ Adicionar validação robusta
4. ✅ Configurar AppModule completo
5. ✅ Implementar testes TDD

### Fase 2: Módulo de Tweets (3-5 dias)
1. ✅ Criar entidade Tweet
2. ✅ Implementar CRUD de tweets
3. ✅ Sistema de likes/retweets
4. ✅ Testes completos

### Fase 3: Módulo de Usuários (2-3 dias)
1. ✅ Perfis de usuário
2. ✅ Sistema de follow/unfollow
3. ✅ Lista de seguidores

### Fase 4: Feed e Timeline (2-3 dias)
1. ✅ Timeline personalizada
2. ✅ Feed global
3. ✅ Paginação

### Fase 5: Banco de Dados (2-3 dias)
1. ✅ Migrar para PostgreSQL
2. ✅ Implementar TypeORM/Prisma
3. ✅ Migrations e seeds

### Fase 6: Notificações (2-3 dias)
1. ✅ WebSocket integration
2. ✅ Notificações em tempo real
3. ✅ Sistema de notificações

## �� Métricas Atuais

- **Cobertura de Testes**: 0%
- **Módulos Implementados**: 1/5 (20%)
- **Funcionalidades Core**: 0/15 (0%)
- **Pronto para Produção**: ❌

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [JWT.io](https://jwt.io/)

---
