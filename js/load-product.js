// Função principal que carrega os detalhes do produto
function loadProductDetails() {
    // Obtém o ID do produto da URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Obtém os elementos onde os detalhes e as especificações serão exibidos
    const productDetailsElement = document.getElementById('products-details');
    const productSpecificationsElement = document.getElementById('product-specifications');

    // Verifica se os elementos existem, caso contrário, exibe erro no console e retorna
    if (!productDetailsElement) {
        console.error('Elemento #products-details não encontrado');
        return;
    }
    if (!productSpecificationsElement) {
        console.error('Elemento #product-specifications não encontrado');
        return;
    }

    // Exibe mensagem de carregamento enquanto os dados são carregados
    productDetailsElement.innerHTML = '<p>Carregando detalhes do produto...</p>';
    console.log('Iniciando fetch de produtos...');

    // Realiza o fetch do arquivo JSON com os produtos
    fetch('/data/produtos.json')
        .then(res => {
            // Verifica se a resposta foi bem-sucedida
            if (!res.ok) throw new Error(`Erro ${res.status}: Não foi possível carregar produtos.json`);
            return res.json();
        })
        .then(products => {
            // Encontra o produto correspondente ao ID fornecido
            const product = products.find(p => p.id == productId);
            if (product) {
                // Extrai informações do produto e calcula o valor das parcelas
                const priceCash = product.priceCash || 0;
                const priceInstallments = product.priceInstallments || 0;
                const installmentCount = 10; // Número fixo de parcelas
                const installmentValue = priceInstallments / installmentCount; // Valor de cada parcela

                // Preenche o conteúdo HTML com os detalhes do produto
                productDetailsElement.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='placeholder.jpg'">
                    </div>
                    <div class="product-details">
                        <h1>${product.name}</h1>
                        <p class="brand">Marca: ${product.brand}</p>
                        <p>${product.fullDescription}</p>
                        <p class="availability">${product.availability}</p>
                        <div class="price-info">
                            <i class="fa fa-barcode"></i>
                            <span class="price">${precoFormatado(priceCash)}</span>
                            <span class="price-label">À vista</span>
                            <br>
                            ${priceInstallments ? `
                                <i class="fa fa-credit-card"></i>
                                <span>${precoFormatado(priceInstallments)}</span>
                                <br>
                                <span class="installment-price">
                                    ${installmentCount}x de <span>${precoFormatado(installmentValue)}</span> sem juros 
                                </span>
                            ` : ''}
                        </div>
                        <button class="btn-add-cart"
                                aria-label="Adicionar ao carrinho"
                                tabindex="0"
                                data-id="${product.id}"
                                data-name="${product.name}"
                                data-price="${priceCash}"
                                data-image="${product.image}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;

                // Renderiza as especificações do produto (fora da seção de detalhes)
                productSpecificationsElement.innerHTML = renderSpecifications(product.specifications);

                // Adiciona o evento de clique no botão "Adicionar ao Carrinho"
                const addButton = document.querySelector('.btn-add-cart');
                if (addButton) {
                    addButton.addEventListener('click', () => {
                        const cartItem = {
                            id: product.id,
                            name: product.name,
                            price: priceCash,
                            image: product.image
                        };
                        console.log('Adicionando ao carrinho (detalhes):', cartItem);
                        // Chama a função que deve adicionar o item ao carrinho
                        if (typeof adicionarAoCarrinho === 'function') {
                            adicionarAoCarrinho(cartItem);
                        } else {
                            console.error('Função adicionarAoCarrinho não definida');
                        }
                    });
                }

                // Seção de avaliações do produto
                const reviewsSection = document.getElementById('reviews');
                if (reviewsSection) {
                    if (product.reviews && product.reviews.length > 0) {
                        const averageRating = (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1);
                        reviewsSection.innerHTML = `
                            <h2>Avaliações dos usuários</h2>
                            <p class="rating">${renderStars(averageRating)} (${averageRating}/5)</p>
                            ${product.reviews.map(review => `
                                <div class="review">
                                    <span class="user">${review.user} - ${review.date}</span><br>
                                    <span class="stars">${renderStars(review.rating)}</span>
                                    <p>${review.comment}</p>
                                </div>
                            `).join('')}
                        `;
                    } else {
                        reviewsSection.innerHTML = '<p>Sem avaliações disponíveis.</p>';
                    }
                }
            } else {
                // Se o produto não for encontrado, exibe mensagem de erro
                productDetailsElement.innerHTML = '<p>Produto não encontrado.</p>';
                productSpecificationsElement.innerHTML = '';
            }
        })
        .catch(error => {
            // Trata erros de fetch (ex: falha de rede)
            handleFetchError(error, productDetailsElement);
            productSpecificationsElement.innerHTML = '';
        });
}

// Função que renderiza as especificações do produto
function renderSpecifications(specs) {
    // Se não houver especificações, exibe mensagem de que não há especificações
    if (!specs || Object.keys(specs).length === 0) {
        return `
            <div class="specifications-container">
                <div class="product-specifications__content">
                    <h3 class="specifications-title">Especificações</h3>
                    <ul><li>Sem especificações disponíveis.</li></ul>
                </div>
            </div>
        `;
    }

    // Caso contrário, renderiza as especificações em uma lista
    const items = Object.entries(specs).map(([key, value]) => `
        <li><strong>${formatKey(key)}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>
    `).join('');

    return `
        <div class="specifications-container">
            <div class="product-specifications__content">
                <h3 class="specifications-title">Especificações</h3>
                <ul>${items}</ul>
            </div>
        </div>
    `;
}

// Função que formata as chaves das especificações (ex: 'socket' vira 'Socket')
function formatKey(key) {
    const map = {
        socket: 'Socket',
        chipset: 'Chipset',
        memory: 'Memória',
        pcieSlots: 'Slots PCIe',
        connections: 'Conexões',
        power: 'Potência',
        certification: 'Certificação',
        boostClock: 'Clock Boost',
        cores: 'Núcleos',
        threads: 'Threads',
        cache: 'Cache',
        tdp: 'TDP',
        capacity: 'Capacidade',
        interface: 'Interface',
        read: 'Leitura',
        write: 'Gravação',
        size: 'Tamanho',
        resolution: 'Resolução',
        refreshRate: 'Taxa de Atualização',
        responseTime: 'Tempo de Resposta',
        cooling: 'Resfriamento',
        technologies: 'Tecnologias',
        color: 'Cor',
        material: 'Material',
        adjustments: 'Ajustes',
        coolingSupport: 'Suporte a Refrigeração'
    };
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

// Função que renderiza estrelas para avaliação
function renderStars(rating) {
    const stars = Math.round(rating);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars); // Retorna as estrelas cheias e vazias
}

// Função que lida com erros no fetch (ex: erro de rede)
function handleFetchError(error, element) {
    console.error('Erro ao carregar detalhes do produto:', error);
    element.innerHTML = '<p>Erro ao carregar os detalhes do produto. Tente novamente mais tarde.</p>';
}

// Chama a função de carregamento dos detalhes do produto quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, chamando loadProductDetails');
    loadProductDetails();
});
