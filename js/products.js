// Variável global para cachear os produtos e evitar múltiplas requisições
let produtosCache = null;

/**
 * Cria dinamicamente um card de produto com imagem, título, preço e botão de compra.
 * @param {Object} product - Objeto com os dados do produto.
 * @returns {HTMLElement} cardDiv - Elemento HTML representando o card.
 */
function createProductCard(product) {
    console.log('Criando card para:', product.name);

    // Validação básica do objeto de produto
    if (!product || !product.id || !product.name) {
        console.warn('Produto inválido:', product);
        return document.createElement('div');
    }

    // Container principal do card
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    // Preço à vista
    const priceCash = product.priceCash || 0;

    // Cria link para página de detalhes do produto
    const productLink = document.createElement('a');
    productLink.href = `/pages/produto.html?id=${product.id}`;
    productLink.setAttribute('aria-label', `Ver detalhes do produto ${product.name}`);
    productLink.setAttribute('tabindex', '0');

    // Imagem do produto
    const productImage = document.createElement('img');
    productImage.setAttribute('loading', 'lazy');
    productImage.src = product.image || 'placeholder.jpg';
    productImage.alt = product.name;
    productImage.classList.add('product-image');
    productImage.onerror = () => { productImage.src = 'placeholder.jpg'; };

    // Título do produto
    const productTitle = document.createElement('h3');
    productTitle.textContent = product.name;

    // Adiciona imagem e título ao link
    productLink.appendChild(productImage);
    productLink.appendChild(productTitle);

    // Cálculo da parcela (10x padrão)
    const valorParcela = product.priceInstallments ? product.priceInstallments / 10 : 0;

    // Informações de preço e parcelamento
    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');
    productInfo.innerHTML = ` 
        <span class="product-price">${typeof precoFormatado === 'function' ? precoFormatado(priceCash) : priceCash.toFixed(2)}</span>
        <span class="product-payment"> à vista</span>
        <br>
        <span>ou até</span>
        <span>10x</span>
        <small>de</small>
        <span class="product-installment">${typeof precoFormatado === 'function' ? precoFormatado(valorParcela) : valorParcela.toFixed(2)}</span>
    `;

    // Botão de adicionar ao carrinho
    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-cart');
    addButton.setAttribute('aria-label', `Adicionar ${product.name} ao carrinho`);

    const iconElement = document.createElement('i');
    iconElement.classList.add('fas', 'fa-shopping-cart');

    addButton.appendChild(iconElement);
    addButton.appendChild(document.createTextNode(' COMPRAR'));

    // Atribui o ID do produto ao botão
    addButton.dataset.id = product.id;

    // Evento de clique para adicionar ao carrinho
    addButton.addEventListener('click', () => handleAddToCart(product.id, product.name, priceCash, product.image));

    // Monta o card final
    cardDiv.appendChild(productLink);
    cardDiv.appendChild(productInfo);
    cardDiv.appendChild(addButton);

    return cardDiv;
}

/**
 * Manipula a adição de um produto ao carrinho.
 * @param {string} id - ID do produto.
 * @param {string} name - Nome do produto.
 * @param {number} price - Preço do produto.
 * @param {string} image - URL da imagem do produto.
 */
function handleAddToCart(id, name, price, image) {
    const cartItem = {
        id: id,
        name: name,
        price: price,
        image: image || 'placeholder.jpg'
    };
    console.log('Adicionando ao carrinho (lista):', cartItem);

    // Verifica se a função global de carrinho está disponível
    if (typeof adicionarAoCarrinho === 'function') {
        adicionarAoCarrinho(cartItem);
    } else {
        console.error('Função adicionarAoCarrinho não definida');
    }
}

/**
 * Carrega os produtos a partir de um arquivo JSON local e renderiza na tela.
 */
function loadProducts() {
    const cardContainer = document.getElementById('card-container');
    if (!cardContainer) {
        console.error('Elemento #card-container não encontrado');
        return;
    }

    cardContainer.innerHTML = '<p>Carregando produtos...</p>';
    console.log('Iniciando fetch de produtos...');

    // Se os produtos já estão em cache, renderiza diretamente
    if (produtosCache) {
        renderProdutos(produtosCache);
        return;
    }

    // Requisição para obter os produtos
    fetch('/data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error(`Erro ${res.status}: Não foi possível carregar produtos.json`);
            return res.json();
        })
        .then(produtos => {
            produtosCache = produtos;  // Armazena na cache
            console.log('Produtos carregados:', produtos);
            renderProdutos(produtos);
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            cardContainer.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        });

    /**
     * Função interna para renderizar os cards dos produtos.
     * @param {Array} produtos - Lista de produtos.
     */
    function renderProdutos(produtos) {
        cardContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        produtos.forEach(product => fragment.appendChild(createProductCard(product)));
        cardContainer.appendChild(fragment);
    }
}

/**
 * Controla a busca dinâmica de produtos conforme o input do usuário.
 */
function handleProductSearch() {
    const searchInput = document.getElementById('search');
    if (!searchInput) {
        console.warn('Campo de busca #search não encontrado');
        return;
    }

    // Função debounce para evitar múltiplas execuções
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Função de busca com filtro baseado no nome do produto
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

        // Feedback visual se nenhum produto for encontrado
        const feedbackBusca = document.createElement('p');
        feedbackBusca.classList.add('feedback-busca');
        feedbackBusca.textContent = nenhumProdutoEncontrado ? 'Nenhum produto encontrado.' : '';
        feedbackBusca.style.color = 'red';
        feedbackBusca.style.transition = 'opacity 0.5s ease';
        feedbackBusca.style.opacity = '1';

        // Remove mensagens anteriores e exibe a nova
        const feedbackAnterior = document.querySelector('.feedback-busca');
        if (feedbackAnterior) feedbackAnterior.remove();
        document.getElementById('card-container').appendChild(feedbackBusca);

        // Remove automaticamente a mensagem após alguns segundos
        if (nenhumProdutoEncontrado) {
            setTimeout(() => {
                feedbackBusca.style.opacity = '0';
                setTimeout(() => feedbackBusca.remove(), 500);
            }, 3000);
        }
    }, 300);

    // Evento de input no campo de busca
    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        buscarProdutos(termo);
    });
}

// Inicializa funções após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('card-container')) {
        console.log('DOM carregado, chamando loadProducts e handleProductSearch');
        loadProducts();
        handleProductSearch();
    }
});
