# Aplicativo Pelos & Lambeijos

### Como implementar código novo?

### Pré-requisitos:
- Ter uma cópia do repositório
```sh
git clone https://github.com/Workflow-FatecItaquera/Pets
```

### Como começar:
1. Depois de abrir o repositório, crie uma nova branch a partir da "main". Nessa branch você trabalhará na feature atual que está fazendo.
- PADRÃO: NOME/o-que-fez.
- Ex: JOIA/dashboard
```sh
git checkout -b SUA/branch
```
2. Após terminar a implementação dentro de sua branch, verifique antes se não há mudanças posteriores na branch "main"
```sh
git checkout main
git pull origin main
git checkout SUA/branch
git merge main
```
3. Faça o commit da sua branch, depois envie-a para o repositório remoto no github.
```sh
git add .
git commit -m "Comentário identificador"
git push SUA/branch
```
4. Quando seu trabalho estiver completamente finalizado e você for trabalhar em outra feature, solicite o pull request da sua branch.

5. Após a avaliação e aprovação da sua branch, o conteúdo dela será incluido na branch "develop" e a branch será excluída.