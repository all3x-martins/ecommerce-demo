let carrinho = [];

// Função para mostrar feedback
function mostrarFeedback(mensagem, tipo = 'sucesso') {
    const feedback = document.createElement('div');
    feedback.textContent = mensagem;
    feedback.classList.add('feedback-message', `feedback-${tipo}`);
    feedback.setAttribute('role', 'alert');

    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.classList.add('feedback-hidden');
        setTimeout(() => feedback.remove(), 500);
    }, 3000);
}

// Função para adicionar ao carrinho
function adicionarAoCarrinho(produto) {
    fetch('../data/produtos.json')
        .then(res => res.ok ? res.json() : Promise.reject('Erro ao carregar produtos.json'))
        .then(produtos => {
            const produtoOriginal = produtos.find(p => p.id === produto.id);
            if (!produtoOriginal) return mostrarFeedback('Produto não encontrado.', 'erro');

            const existente = carrinho.find(p => p.id === produto.id);
            if (existente) {
                existente.quantidade++;
            } else {
                carrinho.push({
                    id: produtoOriginal.id,
                    name: produtoOriginal.name,
                    priceCash: produtoOriginal.priceCash,
                    priceInstallments: produtoOriginal.priceInstallments,
                    image: produtoOriginal.image,
                    quantidade: 1
                });
            }

            renderizarCarrinho();
            mostrarFeedback(`${produtoOriginal.name} adicionado ao carrinho!`);
        })
        .catch(error => {
            console.error('Erro ao adicionar ao carrinho:', error);
            mostrarFeedback('Erro ao adicionar ao carrinho. Tente novamente.', 'erro');
        });
}

// Função para limpar o carrinho
function limparCarrinho() {
    carrinho = [];
    renderizarCarrinho();
    mostrarFeedback('Carrinho limpo com sucesso!', 'sucesso');
}

// Função para renderizar o carrinho
function renderizarCarrinho() {
    const tabelaCorpo = document.querySelector('#cart-table');
    const totalContainer = document.querySelector('#cart-total-container');
    const carrinhoContainer = document.querySelector('#carrinho');

    if (!tabelaCorpo || !totalContainer || !carrinhoContainer) return;

    tabelaCorpo.innerHTML = '';
    totalContainer.innerHTML = '';
    totalContainer.style.display = 'none';

    const freteExistente = document.querySelector('.cart-shipping');
    if (freteExistente) freteExistente.remove();

    const bottomCartExistente = document.querySelector('.bottom-Cart');
    if (bottomCartExistente) bottomCartExistente.remove();

    if (carrinho.length === 0) {
        tabelaCorpo.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
        atualizarContadorCarrinho();
        return;
    }

    const fragment = document.createDocumentFragment();
    let totalVista = 0;
    let totalParcelamentoOverall = 0;

    carrinho.forEach((item) => {
        const precoUnitario = item.priceCash;
        totalVista += precoUnitario * item.quantidade;
        const installmentValue = Number(item.priceInstallments || 0);
        totalParcelamentoOverall += (installmentValue / 10) * item.quantidade;

        const linha = document.createElement('div');
        linha.classList.add('cart-item-container');
        linha.innerHTML = `
            <div class="cart-item">
                <div class="item-info">
                    <div class="cart-item-header">
                        <div class="item-image"><img src="${item.image}" alt="${item.name}" /></div>
                        <h5 class="cart-item-name">${item.name}</h5>
                        <div class="cart-item-remove">
                            <button class="cart-control" data-id="${item.id}" aria-label="Remover ${item.name}">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <p class="discount-ticket">Oferta Programada no boleto ou pix</p>
                    <div class="cart-item-details">
                        <div class="cart-item-price">${precoFormatado(precoUnitario * item.quantidade)}</div>
                        <div class="cart-item-quantity-container">
                            <button class="cart-item-qty-decrease cart-control" data-id="${item.id}" aria-label="Diminuir ${item.name}">
                                <i class="fa-solid fa-angle-left"></i>
                            </button>
                            <span class="cart-item-quantity">${item.quantidade}</span>
                            <button class="cart-item-qty-increase cart-control" data-id="${item.id}" aria-label="Aumentar ${item.name}">
                                <i class="fa-solid fa-angle-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        fragment.appendChild(linha);
    });

    tabelaCorpo.appendChild(fragment);

    const cartclean = document.createElement('div');
    cartclean.classList.add('cart-clean');
    cartclean.innerHTML = `
            <button id="cart-clear-button" class="cart-clear-button" role="button" aria-label="Limpar carrinho">Limpar Carrinho</button>
    `;

    const freteContainer = document.createElement('div');
    freteContainer.classList.add('cart-shipping');
    freteContainer.innerHTML = `
        <form class="frete-form">
            <label for="cep" class="shipping-label">Calcular frete</label>
            <div class="shipping-input-group">
                <input type="text" id="cep" class="shipping-input" placeholder="Qual CEP de entrega?" maxlength="10" required autocomplete="off">
                <button type="submit" class="calcFrete">CALCULAR</button>
            </div>
            <p class="shipping-help">
                <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener">
                    Não sei o meu CEP
                </a>
            </p>
        </form>
    `;
    totalContainer.parentNode.insertBefore(freteContainer, totalContainer);

    totalContainer.innerHTML = `
        <div class="cart-total-info">
            <p class="subtotal">Subtotal: <span id="total-price">${precoFormatado(totalVista)}</span></p>
            <p class="formas-pgt-cart"><i class="fa fa-credit-card"></i> 10x de <span id="total-installments">${precoFormatado(totalParcelamentoOverall)}</span> s/ juros</p>
            <p class="formas-pgt-cash">
                <i class="fa fa-barcode"></i> <span class="In-cash">${precoFormatado(totalVista)}</span>
                <span class="text-In-cash">com desconto à vista no boleto ou pix</span>
            </p>
        </div>
    `;
    totalContainer.style.display = 'block';

    const bottomCart = document.createElement('div');
    bottomCart.className = 'bottom-Cart';
    bottomCart.innerHTML = `
        <button id="cart-finalize-button" class="cart-finalize-button" role="button" aria-label="Finalizar compra">Finalizar Compra</button>
        <a class="closeContinua">Continuar comprando</a>
    `;
    carrinhoContainer.appendChild(bottomCart);

    // Adiciona evento ao botão de limpar carrinho
    const clearButton = document.querySelector('#cart-clear-button');
    if (clearButton) {
        clearButton.addEventListener('click', limparCarrinho);
    }

    atualizarContadorCarrinho();
    aplicarEventosCarrinho();
}

// Função para aplicar eventos no carrinho
function aplicarEventosCarrinho() {
    const tabelaCorpo = document.querySelector('#cart-table');
    if (!tabelaCorpo) return;

    tabelaCorpo.querySelectorAll('button[data-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const produtoIndex = carrinho.findIndex(p => p.id == id);
            if (produtoIndex === -1) return;

            if (btn.closest('.cart-item-remove')) {
                carrinho.splice(produtoIndex, 1);
            } else if (btn.classList.contains('cart-item-qty-increase')) {
                carrinho[produtoIndex].quantidade++;
            } else if (btn.classList.contains('cart-item-qty-decrease')) {
                if (carrinho[produtoIndex].quantidade > 1) {
                    carrinho[produtoIndex].quantidade--;
                } else {
                    carrinho.splice(produtoIndex, 1);
                }
            }

            renderizarCarrinho();
        });
    });
}

// Função para atualizar o contador do carrinho
function atualizarContadorCarrinho() {
    const contador = document.querySelector('.header-cart-item-count');
    if (!contador) return;

    const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0);
    contador.textContent = totalItens.toString();
    contador.style.display = 'inline-block';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrinho();
});