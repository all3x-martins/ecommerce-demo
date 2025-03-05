// Funções de gerenciamento do carrinho
function getCarrinho() {
    try {
        return JSON.parse(localStorage.getItem('carrinho')) || [];
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
    feedback.classList.add('feedback-visual');
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

function adicionarAoCarrinho(produto) {
    fetch('data/produtos.json')
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
            mostrarFeedback('Erro ao adicionar ao carrinho.', 'erro');
        });
}

function renderizarCarrinho() {
    const carrinho = getCarrinho();
    const tabelaCorpo = document.querySelector('#tabela-carrinho tbody');
    const totalContainer = document.querySelector('#total-container');
    const carrinhoContainer = document.querySelector('#carrinho');

    if (!tabelaCorpo || !totalContainer || !carrinhoContainer) return;

    tabelaCorpo.innerHTML = '';
    totalContainer.innerHTML = ''; // Limpa o container
    totalContainer.style.display = 'none'; // Esconde por padrão

    if (carrinho.length === 0) {
        const mensagemVazio = document.createElement('p');
        mensagemVazio.id = 'carrinho-vazio';
        mensagemVazio.textContent = 'Seu carrinho está vazio.';
        mensagemVazio.style.textAlign = 'center';
        mensagemVazio.style.fontSize = '18px';
        mensagemVazio.style.color = '#666';
        mensagemVazio.style.margin = '20px 0';
        carrinhoContainer.innerHTML = ''; // Limpa tudo
        carrinhoContainer.appendChild(tabelaCorpo); // Reinsere a tabela vazia
        carrinhoContainer.appendChild(mensagemVazio);
        carrinhoContainer.appendChild(totalContainer); // Mantém a estrutura
        return;
    }

    const fragment = document.createDocumentFragment();
    let totalVista = 0;

    carrinho.forEach((item, index) => {
        const precoAVista = item.preco;
        totalVista += precoAVista * item.quantidade;

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td><img src="${item.imagem}" alt="${item.nome}" class="carrinho-imagem">${item.nome}</td>
            <td>${precoFormatado(precoAVista)}</td>
            <td>
                <button class="btn-menos" data-index="${index}">-</button>
                ${item.quantidade}
                <button class="btn-mais" data-index="${index}">+</button>
            </td>
            <td>${precoFormatado(precoAVista * item.quantidade)}</td>
            <td><button data-index="${index}" class="btn-remover">Remover</button></td>
        `;
        fragment.appendChild(linha);
    });

    tabelaCorpo.appendChild(fragment);

    const totalParcelado = totalVista / 0.95; // Preço total com 5% de acréscimo
    totalContainer.innerHTML = `
        <div class="total-info">
            <p>Total à Vista: <span id="total-a-vista">${precoFormatado(totalVista)}</span></p>
            <p>Economia: <span id="economia">${precoFormatado(totalParcelado - totalVista)}</span></p>
            <label for="parcelas-select-total">Total Parcelado:</label>
            <select id="parcelas-select-total">
                ${Array.from({ length: 12 }, (_, i) => i + 1).map(n => `
                    <option value="${n}">${n}x ${precoFormatado(totalParcelado / n)}</option>
                `).join('')}
            </select>
            <p><span id="total-preco">${precoFormatado(totalParcelado)}</span></p>
        </div>
        <button id="finalizar-compra" class="btn-finalizar">Finalizar Compra</button>
    `;
    totalContainer.style.display = 'block'; // Exibe quando há itens

    // Reatacha o evento ao botão "Finalizar Compra" gerado dinamicamente
    const finalizarCompra = totalContainer.querySelector('#finalizar-compra');
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
    const contador = document.querySelector('.carrinho-contador');
    if (contador) {
        const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
        contador.textContent = totalItens > 0 ? totalItens : '';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrinho();
    atualizarContadorCarrinho();

    const tabelaCorpo = document.querySelector('#tabela-carrinho tbody');
    if (tabelaCorpo) {
        tabelaCorpo.addEventListener('click', (e) => {
            const carrinho = getCarrinho();
            const index = parseInt(e.target.getAttribute('data-index'), 10);

            if (e.target.classList.contains('btn-remover')) {
                carrinho.splice(index, 1);
                saveCarrinho(carrinho);
            } else if (e.target.classList.contains('btn-mais')) {
                fetch('/data/produtos.json')
                    .then(res => res.json())
                    .then(produtos => {
                        const produtoOriginal = produtos.find(p => p.id === carrinho[index].id);
                        if (carrinho[index].quantidade + 1 <= produtoOriginal.estoque) {
                            carrinho[index].quantidade++;
                            saveCarrinho(carrinho);
                        } else {
                            mostrarFeedback('Quantidade máxima atingida para este produto.', 'erro');
                        }
                    });
            } else if (e.target.classList.contains('btn-menos')) {
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