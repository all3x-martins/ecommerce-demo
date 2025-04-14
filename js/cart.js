// Funções de gerenciamento do carrinho
function getCarrinho() {
    try {
        const dados = JSON.parse(localStorage.getItem('carrinho')) || [];
        // Filtra itens inválidos, garantindo que tenham id, quantidade e preço
        return dados.filter(item => item.id && item.quantidade && item.preco);
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        return [];
    }
}

function saveCarrinho(carrinho) {
    try {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        window.dispatchEvent(new CustomEvent('carrinhoAtualizado', { detail: carrinho }));
        renderizarCarrinho();
    } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
    }
}

function mostrarFeedback(mensagem, tipo = 'sucesso') {
    const feedback = document.createElement('div');
    feedback.textContent = mensagem;
    feedback.classList.add('feedback-message');
    feedback.style.position = 'fixed';
    feedback.style.top = '20px';
    feedback.style.right = '20px';
    feedback.style.padding = '10px 20px';
    feedback.style.backgroundColor = tipo === 'sucesso' ? '#28a745' : '#e74c3c';
    feedback.style.color = '#fff';
    feedback.style.borderRadius = '5px';
    feedback.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    feedback.style.zIndex = '1001';
    feedback.style.transition = 'opacity 0.5s ease';
    feedback.style.opacity = '1';

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.opacity = '0';
        setTimeout(() => feedback.remove(), 500);
    }, 3000);
}

function precoFormatado(valor) {
    // Formata o preço em reais
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function adicionarAoCarrinho(produto) {
    fetch('../data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar produtos.json');
            return res.json();
        })
        .then(produtos => {
            const produtoOriginal = produtos.find(p => p.id === produto.id);
            const carrinho = getCarrinho();
            const existente = carrinho.find(p => p.id === produto.id);

            if (existente) {
                if (existente.quantidade + 1 <= produtoOriginal.estoque) {
                    existente.quantidade++;
                    saveCarrinho(carrinho);
                    mostrarFeedback(`${produto.nome} atualizado no carrinho!`, 'sucesso');
                } else {
                    mostrarFeedback('Quantidade máxima atingida para este produto.', 'erro');
                }
            } else if (produtoOriginal.estoque > 0) {
                produto.quantidade = 1;
                carrinho.push(produto);
                saveCarrinho(carrinho);
                mostrarFeedback(`${produto.nome} adicionado ao carrinho!`, 'sucesso');
            } else {
                mostrarFeedback('Produto fora de estoque.', 'erro');
            }
        })
        .catch(error => {
            console.error('Erro ao verificar estoque:', error);
            mostrarFeedback('Erro ao adicionar ao carrinho. Tente novamente.', 'erro');
        });
}

function renderizarCarrinho() {
    const carrinho = getCarrinho();
    const tabelaCorpo = document.querySelector('#cart-table');
    const totalContainer = document.querySelector('#cart-total-container');
    const carrinhoContainer = document.querySelector('#carrinho');

    if (!tabelaCorpo || !totalContainer || !carrinhoContainer) return;

    tabelaCorpo.innerHTML = '';
    totalContainer.innerHTML = '';
    totalContainer.style.display = 'none';

    if (carrinho.length === 0) {
        const mensagemVazio = document.createElement('p');
        mensagemVazio.id = 'carrinho-vazio';
        mensagemVazio.textContent = 'Seu carrinho está vazio.';
        mensagemVazio.style.textAlign = 'center';
        mensagemVazio.style.fontSize = '18px';
        mensagemVazio.style.color = '#666';
        mensagemVazio.style.margin = '20px 0';
        carrinhoContainer.innerHTML = '';
        carrinhoContainer.appendChild(tabelaCorpo);
        carrinhoContainer.appendChild(mensagemVazio);
        carrinhoContainer.appendChild(totalContainer);
        return;
    }

    const fragment = document.createDocumentFragment();
    let totalVista = 0; // Total à vista (base, sem desconto adicional)

    carrinho.forEach((item, index) => {
        const precoUnitario = item.preco; // Preço à vista unitário (já com desconto)
        totalVista += precoUnitario * item.quantidade;

        const linha = document.createElement('div');
        linha.classList.add('cart-item-container'); // Adiciona a classe 'cart-item' para o layout flex

        linha.innerHTML = `
            <div class="cart-item">
                <div class="item-image">
                    <img src="${item.imagem}" alt="${item.nome}" />
                </div>

                <div class="item-info">
                    <div class="cart-item-header">
                        <h5 class="cart-item-name">${item.nome}</h5>
                        <div class="cart-item-remove">
                            <button data-index="${index}" aria-label="Remover ${item.nome} do carrinho">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-price">
                            ${precoFormatado(precoUnitario * item.quantidade)}
                        </div>
                        <div class="cart-item-quantity-container">
                            <button class="cart-item-qty-decrease" data-index="${index}" aria-label="Diminuir quantidade de ${item.nome}">
                                <i class="fa-solid fa-angle-left"></i>
                            </button>
                            <span class="cart-item-quantity">${item.quantidade}</span>
                            <button class="cart-item-qty-increase" data-index="${index}" aria-label="Aumentar quantidade de ${item.nome}">
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

    // Cálculos
    const acrescimoParcelado = 0.05;
    const totalParcelado = totalVista * (1 + acrescimoParcelado); // Total parcelado com 5% a mais

    totalContainer.innerHTML = `
    <div class="cart-total-info">
        <p>Subtotal: <span id="discount">${precoFormatado(totalParcelado)}</span></p>
        <p><i class="fa fa-credit-card"></i>:<span id="discounted-total"> ${precoFormatado(totalParcelado / 10)}</span></p>
        <p><i class="fa fa-barcode"></i>:<span id="total-price"> ${precoFormatado(totalVista)}</span></p>
    </div>
    `;

    const bottomCartFixed = document.querySelector('.bottomCart');
    if (!bottomCartFixed) {
        const bottomCart = document.createElement('div');
        bottomCart.className = 'bottomCart';
        bottomCart.innerHTML = `
            <button id="cart-finalize-button" class="cart-finalize-button" role="button" aria-label="Finalizar compra">
                Finalizar Compra
            </button>
            <a class="closeContinua">Continuar comprando</a>
        `;
        document.querySelector('#carrinho')?.appendChild(bottomCart); // Substitua pelo ID/Classe do menu lateral
    }
    totalContainer.style.display = 'block';

    const finalizarCompra = totalContainer.querySelector('#cart-finalize-button');
    if (finalizarCompra) {
        finalizarCompra.addEventListener('click', () => {
            const carrinhoAtual = getCarrinho();
            if (carrinhoAtual.length > 0) {
                if (confirm('Deseja finalizar a compra?')) {
                    localStorage.removeItem('carrinho');
                    renderizarCarrinho();
                    mostrarFeedback('Compra finalizada com sucesso!', 'sucesso');
                }
            } else {
                mostrarFeedback('Seu carrinho está vazio!', 'erro');
            }
        });
    }
}

function atualizarContadorCarrinho() {
    const carrinho = getCarrinho();
    const contador = document.querySelector('.header-cart-item-count');
    if (contador) {
        const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
        contador.textContent = totalItens > 0 ? totalItens : '0';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrinho();
    atualizarContadorCarrinho();

    const tabelaCorpo = document.querySelector('#cart-table');
    if (tabelaCorpo) {
        tabelaCorpo.addEventListener('click', (e) => {
            const button = e.target.closest('button'); // Delegação para o botão mais próximo
            if (!button || isNaN(parseInt(button.getAttribute('data-index'), 10))) return;

            const carrinho = getCarrinho();
            const index = parseInt(button.getAttribute('data-index'), 10);

            if (button.classList.contains('cart-item-remove')) {
                carrinho.splice(index, 1);
                saveCarrinho(carrinho);
            } else if (button.classList.contains('cart-item-qty-increase')) {
                fetch('../data/produtos.json')
                    .then(res => res.json())
                    .then(produtos => {
                        const produtoOriginal = produtos.find(p => p.id === carrinho[index].id);
                        if (carrinho[index].quantidade + 1 <= produtoOriginal.estoque) {
                            carrinho[index].quantidade++;
                            saveCarrinho(carrinho);
                        } else {
                            mostrarFeedback('Quantidade máxima atingida para este produto.', 'erro');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao verificar estoque:', error);
                        mostrarFeedback('Erro ao aumentar quantidade. Tente novamente.', 'erro');
                    });
            } else if (button.classList.contains('cart-item-qty-decrease')) {
                if (carrinho[index].quantidade > 1) {
                    carrinho[index].quantidade--;
                    saveCarrinho(carrinho);
                } else {
                    carrinho.splice(index, 1);
                    saveCarrinho(carrinho);
                }
            }
        });
    }
});

window.addEventListener('carrinhoAtualizado', atualizarContadorCarrinho);