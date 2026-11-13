/*
  CONFIGURAÇÃO DA LOJA — é só mexer aqui.

  Quando criar os produtos na Cakto:
  1. Cole o link do checkout em "checkout" (ex.: 'https://pay.cakto.com.br/xxxxxx').
  2. Escreva o preço em "preco" do jeito que quer que apareça (ex.: 'R$ 27').

  Enquanto "checkout" estiver vazio, o card mostra "Em breve" e o botão fica desativado.
  Enquanto "preco" estiver vazio, aparece "Em breve" no lugar do valor.
*/
window.LOJA = {
  pacotes: {
    motion: {
      preco: '',
      checkout: ''
    },
    tresd: {
      preco: '',
      checkout: ''
    },
    combo: {
      preco: '',
      checkout: ''
    }
  },

  // Seu perfil (aparece no rodapé e nas dúvidas)
  tiktok: 'https://www.tiktok.com/@weslleysxx',
  arroba: '@weslleysxx'
};
