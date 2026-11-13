# Landing — Prompts IA (Weslley)

Site em HTML, CSS e JS puro. Não precisa instalar nada nem rodar build.

## Quando configurar a Cakto
Abra `js/config.js` e preencha cada pacote:

```js
motion: { preco: 'R$ 27', checkout: 'https://pay.cakto.com.br/SEU-LINK' },
```

- Sem `checkout`: o botão do card leva pro seu TikTok (aviso de "em breve").
- Com `checkout`: o botão vira "Comprar agora" e leva direto pro pagamento.
- Sem `preco`: aparece "Em breve" no lugar do valor.
- O "Preço: Em breve" da faixa de dados fica em `index.html` (procure "Em breve").

## Trocar textos e imagens
- Textos: tudo em `index.html`.
- Cores e fontes: topo de `css/style.css` (bloco `:root`).
- Ilha: troque `img/ilha.webp` por outra imagem PNG/WebP com fundo transparente, no mesmo enquadramento (1446 × 994).

## Publicar na Vercel
1. Entre em vercel.com → Add New → Project.
2. Arraste esta pasta inteira (ou suba num repositório do GitHub e importe).
3. Framework: "Other". Sem comando de build. Pronto.

Para testar no PC: abra a pasta no VS Code e use a extensão Live Server
(abrir o `index.html` direto com dois cliques também funciona, mas o tom da ilha só aparece com servidor).
