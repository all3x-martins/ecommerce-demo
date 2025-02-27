let produtosCache = null;

function createProductCard(product) {
    console.log('Criando card para:', product.nome);
    if (!product || !product.id || !product.nome) {
        console.warn('Produto inválido:', product);
        return document.createElement('div');
    }

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const precoComDesconto = (product.precoAVista || 0) * 0.95;
    const valorParcela = product.precoParcelado && product.parcelas 
        ? product.precoParcelado / product.parcelas 
        : 0;

    const productLink = document.createElement('a');
    productLink.href = `/pages/produto.html?id=${product.id}`;

    const productImage = document.createElement('img');
    productImage.setAttribute('loading', 'lazy');
    productImage.src = product.imagem || 'placeholder.jpg';
    productImage.alt = product.nome;
    productImage.classList.add('product-image');
    productImage.onerror = () => { productImage.src = 'placeholder.jpg'; };

    const productTitle = document.createElement('h3');
    productTitle.textContent = product.nome;

    productLink.appendChild(productImage);
    productLink.appendChild(productTitle);

    const productInfo = document.createElement('div');
    productInfo.classList.add('product_info');
    productInfo.innerHTML = `
        <span class="produto_preco">${typeof precoFormatado === 'function' ? precoFormatado(precoComDesconto) : precoComDesconto.toFixed(2)}</span>
        <span class="produto_pagamento"> à vista</span>
        <br>
        <span>ou até</span>
        <span>${product.parcelas || 1}x</span>
        <small>de</small>
        <span>${typeof precoFormatado === 'function' ? precoFormatado(valorParcela) : valorParcela.toFixed(2)}</span>
    `;

    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-carrinho');
    addButton.textContent = 'Adicionar ao Carrinho';
    addButton.dataset.id = product.id;

    function handleAddToCart() {
        if (typeof adicionarAoCarrinho === 'function') {
            adicionarAoCarrinho({
                id: product.id,
                nome: product.nome,
                preco: precoComDesconto,
                imagem: product.imagem || 'placeholder.jpg'
            });
        } else {
            console.error('Função adicionarAoCarrinho não definida');
        }
    }

    addButton.removeEventListener('click', handleAddToCart);
    addButton.addEventListener('click', handleAddToCart);

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

    if (produtosCache) {
        renderProdutos(produtosCache);
        return;
    }

    fetch('/data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error(`Erro ${res.status}: Não foi possível carregar produtos.json`);
            return res.json();
        })
        .then(produtos => {
            produtosCache = produtos;
            console.log('Produtos carregados:', produtos);
            renderProdutos(produtos);
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            cardContainer.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        });

    function renderProdutos(produtos) {
        cardContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        produtos.forEach(product => fragment.appendChild(createProductCard(product)));
        cardContainer.appendChild(fragment);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('card_container')) {
        console.log('DOM carregado, chamando loadProducts');
        loadProducts();
    }
});