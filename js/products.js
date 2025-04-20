let produtosCache = null;

function createProductCard(product) {
    console.log('Criando card para:', product.name);

    if (!product || !product.id || !product.name) {
        console.warn('Produto inválido:', product);
        return document.createElement('div');
    }

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    const priceCash = product.priceCash || 0;

    const productLink = document.createElement('a');
    productLink.href = `/pages/produto.html?id=${product.id}`;
    productLink.setAttribute('aria-label', `Ver detalhes do produto ${product.name}`);
    productLink.setAttribute('tabindex', '0');

    const productImage = document.createElement('img');
    productImage.setAttribute('loading', 'lazy');
    productImage.src = product.image || 'placeholder.jpg';
    productImage.alt = product.name;
    productImage.classList.add('product-image');
    productImage.onerror = () => { productImage.src = 'placeholder.jpg'; };

    const productTitle = document.createElement('h3');
    productTitle.textContent = product.name;

    productLink.appendChild(productImage);
    productLink.appendChild(productTitle);

    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');
    productInfo.innerHTML = `
        <span class="product-price">${typeof precoFormatado === 'function' ? precoFormatado(priceCash) : priceCash.toFixed(2)}</span>
        <span class="product-payment"> à vista</span>
    `;

    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-cart');
    addButton.setAttribute('aria-label', `Adicionar ${product.name} ao carrinho`);

    const iconElement = document.createElement('i');
    iconElement.classList.add('fas', 'fa-shopping-cart');

    addButton.appendChild(iconElement);
    addButton.appendChild(document.createTextNode(' COMPRAR'));

    addButton.dataset.id = product.id;
    addButton.addEventListener('click', () => handleAddToCart(product.id, product.name, priceCash, product.image));

    cardDiv.appendChild(productLink);
    cardDiv.appendChild(productInfo);
    cardDiv.appendChild(addButton);

    return cardDiv;
}

function handleAddToCart(id, name, price, image) {
    const cartItem = {
        id: id,
        name: name,
        price: price,
        image: image || 'placeholder.jpg'
    };
    console.log('Adicionando ao carrinho (lista):', cartItem);
    if (typeof adicionarAoCarrinho === 'function') {
        adicionarAoCarrinho(cartItem);
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