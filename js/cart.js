let carrinho = []; // Inicializa o carrinho como um array vazio

// Função para mostrar feedback (mensagens de sucesso ou erro)
function mostrarFeedback(mensagem, tipo = 'sucesso') {
    const feedback = document.createElement('div'); // Cria o elemento para feedback
    feedback.textContent = mensagem; // Define o texto do feedback
    feedback.classList.add('feedback-message', `feedback-${tipo}`); // Adiciona as classes CSS para estilo
    feedback.setAttribute('role', 'alert'); // Define o atributo 'role' para acessibilidade

    document.body.appendChild(feedback); // Adiciona o feedback no corpo da página
    setTimeout(() => {
        feedback.classList.add('feedback-hidden'); // Adiciona a classe para esconder o feedback após 3 segundos
        setTimeout(() => feedback.remove(), 500); // Remove o feedback após 500ms
    }, 3000);
}

// Função para adicionar um produto ao carrinho
function adicionarAoCarrinho(produto) {
    fetch('../data/produtos.json') // Carrega os dados dos produtos
        .then(res => res.ok ? res.json() : Promise.reject('Erro ao carregar produtos.json')) // Verifica se a resposta é válida
        .then(produtos => {
            const produtoOriginal = produtos.find(p => p.id === produto.id); // Encontra o produto original no JSON
            if (!produtoOriginal) return mostrarFeedback('Produto não encontrado.', 'erro'); // Exibe erro se o produto não for encontrado

            const existente = carrinho.find(p => p.id === produto.id); // Verifica se o produto já está no carrinho
            if (existente) {
                existente.quantidade++; // Se o produto já está no carrinho, aumenta a quantidade
            } else {
                carrinho.push({
                    id: produtoOriginal.id,
                    name: produtoOriginal.name,
                    priceCash: produtoOriginal.priceCash,
                    priceInstallments: produtoOriginal.priceInstallments,
                    image: produtoOriginal.image,
                    quantidade: 1
                }); // Adiciona o produto ao carrinho
            }

            renderizarCarrinho(); // Atualiza o carrinho na página
            mostrarFeedback(`${produtoOriginal.name} adicionado ao carrinho!`); // Exibe o feedback de sucesso
        })
        .catch(error => {
            console.error('Erro ao adicionar ao carrinho:', error); // Exibe o erro no console
            mostrarFeedback('Erro ao adicionar ao carrinho. Tente novamente.', 'erro'); // Exibe o feedback de erro
        });
}

// Função para renderizar o conteúdo do carrinho na página
function renderizarCarrinho() {
    const tabelaCorpo = document.querySelector('#cart-table'); // Elemento onde os itens do carrinho serão renderizados
    const totalContainer = document.querySelector('#cart-total-container'); // Elemento para exibir o total do carrinho
    const carrinhoContainer = document.querySelector('#carrinho'); // Contêiner do carrinho

    if (!tabelaCorpo || !totalContainer || !carrinhoContainer) return; // Verifica se os elementos existem na página

    tabelaCorpo.innerHTML = ''; // Limpa a tabela de itens
    totalContainer.innerHTML = ''; // Limpa o total
    totalContainer.style.display = 'none'; // Esconde o total por padrão

    const freteExistente = document.querySelector('.cart-shipping'); // Verifica se a seção de frete já foi renderizada
    if (freteExistente) freteExistente.remove(); // Remove o frete existente

    const bottomCartExistente = document.querySelector('.bottom-Cart'); // Verifica se o rodapé do carrinho já existe
    if (bottomCartExistente) bottomCartExistente.remove(); // Remove o rodapé do carrinho existente

    if (carrinho.length === 0) {
        tabelaCorpo.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>'; // Exibe mensagem caso o carrinho esteja vazio
        atualizarContadorCarrinho(); // Atualiza o contador de itens do carrinho
        return;
    }

    const fragment = document.createDocumentFragment(); // Cria um fragmento de documento para inserir os itens
    let totalVista = 0; // Inicializa o total à vista
    let totalParcelamentoOverall = 0; // Inicializa o total do parcelamento

    carrinho.forEach((item) => {
        const precoUnitario = item.priceCash; // Preço à vista do item
        totalVista += precoUnitario * item.quantidade; // Calcula o total à vista
        const installmentValue = Number(item.priceInstallments || 0); // Preço do parcelamento do item
        totalParcelamentoOverall += (installmentValue / 10) * item.quantidade; // Calcula o total do parcelamento

        const linha = document.createElement('div'); // Cria uma linha para o item do carrinho
        linha.classList.add('cart-item-container'); // Adiciona a classe CSS
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
        `; // Adiciona o HTML do item ao carrinho

        fragment.appendChild(linha); // Adiciona a linha no fragmento
    });

    tabelaCorpo.appendChild(fragment); // Insere o fragmento na tabela

    // Renderiza a seção de frete
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
    totalContainer.parentNode.insertBefore(freteContainer, totalContainer); // Insere o container de frete acima do total

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
    totalContainer.style.display = 'block'; // Exibe o total do carrinho

    const bottomCart = document.createElement('div'); // Cria o rodapé do carrinho
    bottomCart.className = 'bottom-Cart';
    bottomCart.innerHTML = `
        <button id="cart-finalize-button" class="cart-finalize-button" role="button" aria-label="Finalizar compra">Finalizar Compra</button>
        <a class="closeContinua">Continuar comprando</a>
    `;
    carrinhoContainer.appendChild(bottomCart); // Adiciona o rodapé ao carrinho

    atualizarContadorCarrinho(); // Atualiza o contador de itens no carrinho
    aplicarEventosCarrinho(); // Aplica os eventos de interação no carrinho
}

// Função para aplicar eventos nos botões do carrinho
function aplicarEventosCarrinho() {
    const tabelaCorpo = document.querySelector('#cart-table');
    if (!tabelaCorpo) return;

    tabelaCorpo.querySelectorAll('button[data-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const produtoIndex = carrinho.findIndex(p => p.id == id);
            if (produtoIndex === -1) return;

            if (btn.closest('.cart-item-remove')) {
                carrinho.splice(produtoIndex, 1); // Remove o item do carrinho
            } else if (btn.classList.contains('cart-item-qty-increase')) {
                carrinho[produtoIndex].quantidade++; // Aumenta a quantidade do item
            } else if (btn.classList.contains('cart-item-qty-decrease')) {
                if (carrinho[produtoIndex].quantidade > 1) {
                    carrinho[produtoIndex].quantidade--; // Diminui a quantidade do item
                } else {
                    carrinho.splice(produtoIndex, 1); // Remove o item se a quantidade for 1
                }
            }

            renderizarCarrinho(); // Atualiza o carrinho após a alteração
        });
    });
}

// Função para atualizar o contador de itens no carrinho
function atualizarContadorCarrinho() {
    const contador = document.querySelector('.header-cart-item-count');
    if (!contador) return;

    const totalItens = carrinho.reduce((soma, item) => soma + item.quantidade, 0); // Conta os itens no carrinho
    contador.textContent = totalItens.toString(); // Atualiza o contador
    contador.style.display = 'inline-block'; // Exibe o contador
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrinho(); // Renderiza o carrinho quando o DOM for carregado
});
