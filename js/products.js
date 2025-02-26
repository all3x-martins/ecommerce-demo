function createProductCard(product) {
    console.log('Criando card para:', product.nome);
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const precoComDesconto = product.precoAVista * 0.95;
    const valorParcela = product.precoParcelado / product.parcelas;

    const productLink = document.createElement('a');
    productLink.href = `/pages/produto.html?id=${product.id}`;

    const productImage = document.createElement('img');
    productImage.setAttribute('loading', 'lazy');
    productImage.src = product.imagem;
    productImage.alt = product.nome;
    productImage.classList.add('product-image');
    productImage.onerror = function() { this.src = 'placeholder.jpg'; };

    const productTitle = document.createElement('h3');
    productTitle.textContent = product.nome;

    productLink.appendChild(productImage);
    productLink.appendChild(productTitle);

    const productInfo = document.createElement('div');
    productInfo.classList.add('product_info');
    productInfo.innerHTML = `
        <span class="produto_preco">${precoFormatado(precoComDesconto)}</span>
        <span class="produto_pagamento"> à vista</span>
        <br>
        <span>ou até</span>
        <span>${product.parcelas}x</span>
        <small>de</small>
        <span>${precoFormatado(valorParcela)}</span>
    `;

    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-carrinho');
    addButton.textContent = 'Adicionar ao Carrinho';
    addButton.dataset.id = product.id;
    addButton.dataset.nome = product.nome;
    addButton.dataset.preco = precoComDesconto;
    addButton.dataset.imagem = product.imagem;
    addButton.addEventListener('click', () => adicionarAoCarrinho({
        id: product.id,
        nome: product.nome,
        preco: precoComDesconto,
        imagem: product.imagem
    }));

    cardDiv.appendChild(productLink);
    cardDiv.appendChild(productInfo);
    cardDiv.appendChild(addButton);

    return cardDiv;
}

function loadProducts() {
    const cardContainer = document.getElementById('card_container');
    if (!cardContainer) {
        console.error('Elemento #card_container não encontrado');
        return;
    }

    cardContainer.innerHTML = '<p>Carregando produtos...</p>';
    console.log('Iniciando fetch de produtos...');

    fetch('/data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error(`Erro ${res.status}: Não foi possível carregar produtos.json`);
            return res.json();
        })
        .then(produtos => {
            console.log('Produtos carregados:', produtos);
            cardContainer.innerHTML = '';
            const fragment = document.createDocumentFragment();
            produtos.forEach(product => fragment.appendChild(createProductCard(product)));
            cardContainer.appendChild(fragment);
        })
        .catch(error => handleFetchError(error, cardContainer));
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, chamando loadProducts');
    loadProducts();
});