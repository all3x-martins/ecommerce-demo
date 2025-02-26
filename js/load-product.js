import { precoFormatado, handleFetchError } from './utils.js';
import { adicionarAoCarrinho } from './cart.js';

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const produtoDetalhes = document.getElementById('produto-detalhes');

    if (!produtoDetalhes) return;

    produtoDetalhes.innerHTML = '<p>Carregando detalhes do produto...</p>';

    fetch('/data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar o produto.');
            return res.json();
        })
        .then(produtos => {
            const produto = produtos.find(p => p.id == productId);
            if (produto) {
                const valorParcela = produto.precoParcelado / produto.parcelas;
                const mediaAvaliacoes = produto.avaliacoes.length > 0 
                    ? (produto.avaliacoes.reduce((soma, aval) => soma + aval.nota, 0) / produto.avaliacoes.length).toFixed(1) 
                    : 0;

                produtoDetalhes.innerHTML = `
                    <div class="product-image">
                        <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='placeholder.jpg'">
                    </div>
                    <div class="product-details">
                        <button onclick="window.history.back()" class="btn-voltar">Voltar</button>
                        <h1>${produto.nome}</h1>
                        <p class="marca">Marca: ${produto.marca}</p>
                        <p>${produto.descricaoCompleta}</p>
                        <div class="price-info">
                            <span class="price">${precoFormatado(produto.precoAVista)}</span>
                            <span class="price-label">À vista</span>
                            <div class="installments">
                                ou <strong>${produto.parcelas}x</strong> de <strong>${precoFormatado(valorParcela)}</strong> sem juros
                                <span class="total-parcelado">Total: ${precoFormatado(produto.precoParcelado)}</span>
                            </div>
                            <div class="discount-info">
                                Economia de ${precoFormatado(produto.precoParcelado - produto.precoAVista)} pagando à vista
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
                        <button class="btn-comprar" 
                                data-id="${produto.id}" 
                                data-nome="${produto.nome}" 
                                data-preco="${produto.precoAVista}" 
                                data-imagem="${produto.imagem}"
                                aria-label="Adicionar ${produto.nome} ao carrinho"
                                ${produto.estoque === 0 ? 'disabled' : ''}>
                            ${produto.estoque === 0 ? 'Indisponível' : 'Adicionar ao Carrinho'}
                        </button>
                    </div>
                `;
                if (produto.estoque > 0) {
                    document.querySelector('.btn-comprar').addEventListener('click', adicionarAoCarrinho);
                }

                const avaliacoesSection = document.getElementById('avaliacoes');
                if (produto.avaliacoes && produto.avaliacoes.length > 0) {
                    avaliacoesSection.innerHTML = `
                        <h2>Avaliações dos usuários</h2>
                        <p class="rating">${renderStars(mediaAvaliacoes)} (${mediaAvaliacoes}/5)</p>
                        ${produto.avaliacoes.map(aval => `
                            <div class="review">
                                <p>${aval.comentario}</p>
                                <span class="user">${aval.usuario} - ${aval.data} (${renderStars(aval.nota)})</span>
                            </div>
                        `).join('')}
                    `;
                } else {
                    avaliacoesSection.innerHTML = '<p>Sem avaliações disponíveis.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            produtoDetalhes.innerHTML = '<p>Erro ao carregar o produto.</p>';
        });
}

function precoFormatado(preco) {
    return preco.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
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

function adicionarAoCarrinho(event) {
    const button = event.target;
    const produto = {
        id: button.dataset.id,
        nome: button.dataset.nome,
        preco: button.dataset.preco,
        imagem: button.dataset.imagem
    };
    console.log('Produto adicionado ao carrinho:', produto);
}

window.addEventListener('load', loadProductDetails);