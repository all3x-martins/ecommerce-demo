function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const productDetailsElement = document.getElementById('products-details');

    if (!productDetailsElement) {
        console.error('Elemento #products-details não encontrado');
        return;
    }

    productDetailsElement.innerHTML = '<p>Carregando detalhes do produto...</p>';
    console.log('Iniciando fetch de produtos...');

    fetch('/data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error(`Erro ${res.status}: Não foi possível carregar produtos.json`);
            return res.json();
        })
        .then(products => {
            const product = products.find(p => p.id == productId);
            if (product) {
                // Supondo que o JSON atualizado possui os campos:
                // id, name, image, brand, fullDescription, priceCash, availability, specifications e reviews
                const priceCash = product.priceCash || 0;
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
                            <span class="price">${precoFormatado(priceCash)}</span>
                            <span class="price-label">À vista</span>
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
                    <div class="specifications-container">
                        <div class="product-specifications__content">
                            <h3 class="specifications-title">Especificações</h3>
                            <ul>
                                ${Object.entries(product.specifications).map(([key, value]) => `
                                    <li><strong>${formatKey(key)}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `;

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
                        if (typeof adicionarAoCarrinho === 'function') {
                            adicionarAoCarrinho(cartItem);
                        } else {
                            console.error('Função adicionarAoCarrinho não definida');
                        }
                    });
                }

                const reviewsSection = document.getElementById('reviews');
                if (reviewsSection) {
                    if (product.reviews && product.reviews.length > 0) {
                        const averageRating = (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1);
                        reviewsSection.innerHTML = `
                            <h2>Avaliações dos usuários</h2>
                            <p class="rating">${renderStars(averageRating)} (${averageRating}/5)</p>
                            ${product.reviews.map(review => `
                                <div class="review">
                                    <span class="user">${review.user} - ${review.date}</span>
                                    <br>
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
                productDetailsElement.innerHTML = '<p>Produto não encontrado.</p>';
            }
        })
        .catch(error => handleFetchError(error, productDetailsElement));
}

function precoFormatado(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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

function renderStars(rating) {
    const stars = Math.round(rating);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
}

function handleFetchError(error, element) {
    console.error('Erro ao carregar detalhes do produto:', error);
    element.innerHTML = '<p>Erro ao carregar os detalhes do produto. Tente novamente mais tarde.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, chamando loadProductDetails');
    loadProductDetails();
});