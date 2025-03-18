function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const produtoDetalhes = document.getElementById('produto-detalhes');

    if (!produtoDetalhes) {
        console.error('Elemento #produto-detalhes não encontrado');
        return;
    }

    produtoDetalhes.innerHTML = '<p>Carregando detalhes do produto...</p>';
    console.log('Iniciando fetch de produtos...');

    fetch('/data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error(`Erro ${res.status}: Não foi possível carregar produtos.json`);
            return res.json();
        })
        .then(produtos => {
            const produto = produtos.find(p => p.id == productId);
            if (produto) {
                const precoAVista = produto.precoAVista;
                const precoParcelado = precoAVista * 1.05;
                const valorParcela = precoParcelado / (produto.parcelas || 12);
                const mediaAvaliacoes = produto.avaliacoes && produto.avaliacoes.length > 0 
                    ? (produto.avaliacoes.reduce((soma, aval) => soma + aval.nota, 0) / produto.avaliacoes.length).toFixed(1) 
                    : 0;

                produtoDetalhes.innerHTML = `
                    <div class="product-image">
                        <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='placeholder.jpg'">
                    </div>
                    <div class="product-details">
                        <h1>${produto.nome}</h1>
                        <p class="marca">Marca: ${produto.marca}</p>
                        <p>${produto.descricaoCompleta}</p>
                        <div class="price-info">
                            <span class="price">${precoFormatado(precoAVista)}</span>
                            <span class="price-label">À vista</span>
                            <div class="installments">
                                ou <strong>${produto.parcelas || 12}x</strong> de <strong>${precoFormatado(valorParcela)}</strong> sem juros
                                <span class="total-parcelado">Total: ${precoFormatado(precoParcelado)}</span>
                            </div>
                            <div class="discount-info">
                                Acréscimo de ${precoFormatado(precoParcelado - precoAVista)} no parcelamento
                            </div>
                        </div>
                        <p class="stock-info">${produto.disponibilidade} (${produto.estoque} unidades disponíveis)</p>
                        <div class="specifications">
                            <h3>Especificações</h3>
                            <ul>
                                ${Object.entries(produto.especificacoes).map(([key, value]) => `
                                    <li><strong>${formatKey(key)}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>
                                `).join('')}
                            </ul>
                        </div>
                        <button class="btn-add-cart"
                                aria-label="Adicionar ao carrinho"
                                tabindex="0"
                                data-id="${produto.id}" 
                                data-nome="${produto.nome}" 
                                data-preco="${precoAVista}" 
                                data-imagem="${produto.imagem}"
                                ${produto.estoque === 0 ? 'disabled' : ''}>
                                ${produto.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                        </button>
                    </div>
                `;

                if (produto.estoque > 0) {
                    const addButton = document.querySelector('.btn-add-cart');
                    if (addButton) {
                        addButton.addEventListener('click', () => {
                            const cartItem = {
                                id: produto.id,
                                nome: produto.nome,
                                preco: precoAVista,
                                imagem: produto.imagem
                            };
                            console.log('Adicionando ao carrinho (detalhes):', cartItem);
                            if (typeof adicionarAoCarrinho === 'function') {
                                adicionarAoCarrinho(cartItem);
                            } else {
                                console.error('Função adicionarAoCarrinho não definida');
                            }
                        });
                    }
                }

                const avaliacoesSection = document.getElementById('avaliacoes');
                if (avaliacoesSection && produto.avaliacoes && produto.avaliacoes.length > 0) {
                    avaliacoesSection.innerHTML = `
                        <h2>Avaliações dos usuários</h2>
                        <p class="rating">${renderStars(mediaAvaliacoes)} (${mediaAvaliacoes}/5)</p>
                        ${produto.avaliacoes.map(aval => `
                            <div class="review">
                                <span class="user">${aval.usuario} - ${aval.data}</span>
                                <br>
                                <span class="stars">${renderStars(aval.nota)}</span>
                                <p>${aval.comentario}</p>                              
                            </div>
                        `).join('')}
                    `;
                } else if (avaliacoesSection) {
                    avaliacoesSection.innerHTML = '<p>Sem avaliações disponíveis.</p>';
                }
            } else {
                produtoDetalhes.innerHTML = '<p>Produto não encontrado.</p>';
            }
        })
        .catch(error => handleFetchError(error, produtoDetalhes));
}

function formatKey(key) {
    const map = {
        socket: 'Socket',
        chipset: 'Chipset',
        memoria: 'Memória',
        slotsPCIe: 'Slots PCIe',
        conexoes: 'Conexões',
        potencia: 'Potência',
        certificacao: 'Certificação',
        clockBoost: 'Clock Boost',
        nucleos: 'Núcleos',
        threads: 'Threads',
        cache: 'Cache',
        tdp: 'TDP',
        capacidade: 'Capacidade',
        interface: 'Interface',
        leitura: 'Leitura',
        gravacao: 'Gravação',
        tamanho: 'Tamanho',
        resolucao: 'Resolução',
        taxaAtualizacao: 'Taxa de Atualização',
        tempoResposta: 'Tempo de Resposta',
        cooling: 'Resfriamento',
        tecnologias: 'Tecnologias',
        cor: 'Cor',
        material: 'Material',
        ajustes: 'Ajustes',
        suporteCooling: 'Suporte a Refrigeração'
    };
    return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function renderStars(nota) {
    const estrelas = Math.round(nota);
    return '★'.repeat(estrelas) + '☆'.repeat(5 - estrelas);
}

function handleFetchError(error, element) {
    console.error('Erro ao carregar detalhes do produto:', error);
    element.innerHTML = '<p>Erro ao carregar os detalhes do produto. Tente novamente mais tarde.</p>';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, chamando loadProductDetails');
    loadProductDetails();
});