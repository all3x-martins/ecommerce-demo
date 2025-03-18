let produtosCache = null;

function createProductCard(product) {
    console.log('Criando card para:', product.nome);

    if (!product || !product.id || !product.nome) {
        console.warn('Produto inválido:', product);
        return document.createElement('div');
    }

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const precoAVista = product.precoAVista || 0;
    const precoParcelado = precoAVista * 1.05;
    const valorParcela = precoParcelado / (product.parcelas || 12);

    const productLink = document.createElement('a');
    productLink.href = `/pages/produto.html?id=${product.id}`;
    productLink.setAttribute('aria-label', `Ver detalhes do produto ${product.nome}`);
    productLink.setAttribute('tabindex', '0');

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
    productInfo.classList.add('product-info');
    productInfo.innerHTML = `
        <span class="produto-price">${typeof precoFormatado === 'function' ? precoFormatado(precoAVista) : precoAVista.toFixed(2)}</span>
        <span class="produto-payment"> à vista</span>
        <br>
        <span>ou até</span>
        <span class="installment-product">${product.parcelas || 12}x</span>
        <small class="installment-product">de</small>
        <span class="installment-product">${typeof precoFormatado === 'function' ? precoFormatado(valorParcela) : valorParcela.toFixed(2)}</span>
    `;

    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-cart');
    addButton.setAttribute('aria-label', `Adicionar ${product.nome} ao carrinho`);

    const iconElement = document.createElement('i');
    iconElement.classList.add('fas', 'fa-shopping-cart');

    addButton.appendChild(iconElement);
    addButton.appendChild(document.createTextNode(' COMPRAR'));

    addButton.dataset.id = product.id;
    addButton.addEventListener('click', () => handleAddToCart(product.id, product.nome, precoAVista, product.imagem));

    cardDiv.appendChild(productLink);
    cardDiv.appendChild(productInfo);
    cardDiv.appendChild(addButton);

    return cardDiv;
}

function handleAddToCart(id, nome, preco, imagem) {
    const cartItem = {
        id: id,
        nome: nome,
        preco: preco,
        imagem: imagem || 'placeholder.jpg'
    };
    console.log('Adicionando ao carrinho (lista):', cartItem);
    if (typeof adicionarAoCarrinho === 'function') {
        adicionarAoCarrinho(cartItem);
        window.location.href = '/pages/carrinho';
    } else {
        console.error('Função adicionarAoCarrinho não definida');
    }
}

function loadProducts() {
    const cardContainer = document.getElementById('card-container');
    if (!cardContainer) {
        console.error('Elemento #card-container não encontrado');
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

function handleProductSearch() {
    const searchInput = document.getElementById('search');
    if (!searchInput) {
        console.warn('Campo de busca #search não encontrado');
        return;
    }

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const buscarProdutos = debounce((termo) => {
        const cards = document.querySelectorAll('.card');
        let nenhumProdutoEncontrado = true;

        cards.forEach(card => {
            const titulo = card.querySelector('h3').textContent.toLowerCase();
            if (titulo.includes(termo)) {
                card.style.display = 'block';
                nenhumProdutoEncontrado = false;
            } else {
                card.style.display = 'none';
            }
        });

        const feedbackBusca = document.createElement('p');
        feedbackBusca.classList.add('feedback-busca');
        feedbackBusca.textContent = nenhumProdutoEncontrado ? 'Nenhum produto encontrado.' : '';
        feedbackBusca.style.color = 'red';
        feedbackBusca.style.transition = 'opacity 0.5s ease';
        feedbackBusca.style.opacity = '1';

        const feedbackAnterior = document.querySelector('.feedback-busca');
        if (feedbackAnterior) feedbackAnterior.remove();
        document.getElementById('card-container').appendChild(feedbackBusca);

        if (nenhumProdutoEncontrado) {
            setTimeout(() => {
                feedbackBusca.style.opacity = '0';
                setTimeout(() => feedbackBusca.remove(), 500);
            }, 3000);
        }
    }, 300);

    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        buscarProdutos(termo);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('card-container')) {
        console.log('DOM carregado, chamando loadProducts e handleProductSearch');
        loadProducts();
        handleProductSearch();
    }
});

function lazyLoadComponent(componentId, loadFunction) {
    const component = document.getElementById(componentId);
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadFunction();
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(component);
    } else {
        loadFunction();
    }
}

lazyLoadComponent('product-section', loadProducts);