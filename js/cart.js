function adicionarAoCarrinho(produto) {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const existente = carrinho.find(p => p.id === produto.id);
    if (existente) {
        existente.quantidade++;
    } else {
        produto.quantidade = 1;
        carrinho.push(produto);
    }
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    console.log('Produto adicionado:', produto);
}