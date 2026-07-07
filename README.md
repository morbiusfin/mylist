# Mylist 🛒

Lista de compras PWA — com emojis de comida animados 🍕🥦🍓

App mobile-first (HTML/CSS/JS puro, sem build) que roda no navegador e instala na tela de início. Consolida seu **histórico de compras por mês e por supermercado**.

## O que faz
- **Lista**: adiciona itens (ex.: `2 tomate`), cada um ganha um emoji de comida automático pelo nome. Marca o que já foi pro carrinho e coloca o preço.
- **Finalizar compra**: escolhe o mercado e a data — os itens comprados viram histórico.
- **Histórico**: agrupado por mês, com filtro por mercado e total gasto.
- **Mercados**: quanto você gastou em cada supermercado, ticket médio e última compra.

## Privacidade
Tudo fica **no seu aparelho** (localStorage). Sem conta, sem servidor, sem rastreio. Dá pra exportar/importar backup pelo menu.

## Rodar local
```
py nocache_server.py 8120 mylist   # ou: npx http-server -c-1
```
Abre em `http://localhost:8120`. Mock de iPhone em `iphone.html`.

## Tecnologia
PWA + Service Worker (network-first, offline), Noto Animated Emoji (comida), tema verde-feira dark-first.
