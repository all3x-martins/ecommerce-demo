// Declara uma variável global para armazenar o cache dos produtos carregados do JSON.
// Isso evita fazer fetch repetido do mesmo arquivo, melhorando a performance.
let produtosCache = null;

// Função para criar um card de produto individual a partir de um objeto 'product'.
function createProductCard(product) {
    // Loga no console o nome do produto sendo processado, útil para depuração.
    console.log('Criando card para:', product.nome);

    // Valida se o produto é válido (existe e tem id e nome). Se não for, avisa e retorna um elemento vazio.
    if (!product || !product.id || !product.nome) {
        console.warn('Produto inválido:', product);
        return document.createElement('div');
    }

    // Cria o elemento principal do card, uma <div> com classe 'card'.
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    // Calcula o preço com desconto (5% off do preço à vista) e o valor da parcela (se houver preço parcelado).
    const precoComDesconto = (product.precoAVista || 0) * 0.95;
    const valorParcela = product.precoParcelado && product.parcelas 
        ? product.precoParcelado / product.parcelas 
        : 0;

    // Cria um link <a> que leva à página de detalhes do produto com o ID na URL.
    const productLink = document.createElement('a');
    productLink.href = `/pages/produto.html?id=${product.id}`;
    productLink.setAttribute('aria-label', `Ver detalhes do produto ${product.nome}`);

    // Cria a imagem do produto com carregamento lazy e fallback para erro.
    const productImage = document.createElement('img');
    productImage.setAttribute('loading', 'lazy');
    productImage.src = product.imagem || 'placeholder.jpg';
    productImage.alt = product.nome;
    productImage.classList.add('product-image');
    productImage.onerror = () => { productImage.src = 'placeholder.jpg'; };

    // Cria o título do produto como um <h3>.
    const productTitle = document.createElement('h3');
    productTitle.textContent = product.nome;

    // Adiciona a imagem e o título ao link.
    productLink.appendChild(productImage);
    productLink.appendChild(productTitle);

    // Cria o contêiner para informações de preço com classe 'product-info'.
    const productInfo = document.createElement('div');
    productInfo.classList.add('product-info');
    // Usa template string para inserir preços formatados (se precoFormatado existir) ou valores brutos.
    productInfo.innerHTML = `
        <span class="produto-price">${typeof precoFormatado === 'function' ? precoFormatado(precoComDesconto) : precoComDesconto.toFixed(2)}</span>
        <span class="produto-payment"> à vista</span>
        <br>
        <span>ou até</span>
        <span class="installment-product">${product.parcelas || 1}x</span>
        <small class="installment-product">de</small>
        <span class="installment-product">${typeof precoFormatado === 'function' ? precoFormatado(valorParcela) : valorParcela.toFixed(2)}</span>
    `;

    // Cria o botão "COMPRAR".
    const addButton = document.createElement('button');
    addButton.classList.add('btn-add-cart');
    addButton.setAttribute('aria-label', `Adicionar ${product.nome} ao carrinho`);

    // Cria o ícone e adiciona ao botão (antes do texto).
    const iconElement = document.createElement('i');
    iconElement.classList.add('fas');
    iconElement.classList.add('fa-shopping-cart');

    // Adiciona o ícone ao botão antes do texto.
    addButton.appendChild(iconElement); // Adiciona o ícone primeiro.
    addButton.appendChild(document.createTextNode(' COMPRAR')); // Depois adiciona o texto.

    addButton.dataset.id = product.id; // Armazena o ID do produto no dataset para referência.

    // Define a função que será chamada ao clicar no botão.
    addButton.addEventListener('click', () => handleAddToCart(product.id, product.nome, precoComDesconto, product.imagem));

    // Adiciona o link, informações de preço e botão ao card.
    cardDiv.appendChild(productLink);
    cardDiv.appendChild(productInfo);
    cardDiv.appendChild(addButton);

    // Retorna o card completo para ser usado em renderização.
    return cardDiv;
}

// Função para adicionar um produto ao carrinho
function handleAddToCart(id, nome, preco, imagem) {
    if (typeof adicionarAoCarrinho === 'function') { // Verifica se a função existe.
        adicionarAoCarrinho({
            id: id,
            nome: nome,
            preco: preco,
            imagem: imagem || 'placeholder.jpg'
        });

        // Redireciona para a página do carrinho após adicionar o item
        window.location.href = 'pages/carrinho';
    } else {
        console.error('Função adicionarAoCarrinho não definida'); // Avisa se a função não estiver disponível.
    }
}

// Função para carregar e exibir os produtos no contêiner #card-container.
function loadProducts() {
    const cardContainer = document.getElementById('card-container');
    if (!cardContainer) { // Verifica se o contêiner existe, senão para a execução.
        console.error('Elemento #card-container não encontrado');
        return;
    }

    // Exibe mensagem de carregamento enquanto os produtos são buscados.
    cardContainer.innerHTML = '<p>Carregando produtos...</p>';
    console.log('Iniciando fetch de produtos...');

    // Se já houver produtos em cache, usa eles diretamente.
    if (produtosCache) {
        renderProdutos(produtosCache);
        return;
    }

    // Faz fetch do arquivo JSON com os produtos.
    fetch('data/produtos.json')
        .then(res => {
            if (!res.ok) throw new Error(`Erro ${res.status}: Não foi possível carregar produtos.json`);
            return res.json();
        })
        .then(produtos => {
            produtosCache = produtos;
            console.log('Produtos carregados:', produtos);
            renderProdutos(produtos);
        })
        .catch(error => { // Trata erros do fetch.
            console.error('Erro ao carregar produtos:', error);
            cardContainer.innerHTML = '<p>Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        });

    // Função interna para renderizar os produtos no DOM.
    function renderProdutos(produtos) {
        cardContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        produtos.forEach(product => fragment.appendChild(createProductCard(product))); 
        cardContainer.appendChild(fragment);
    }
}

// Função para gerenciar a busca de produtos no campo #search.
function handleProductSearch() {
    const searchInput = document.getElementById('search');
    if (!searchInput) {
        console.warn('Campo de busca #search não encontrado');
        return;
    }

    // Função auxiliar para debounce, evita chamadas excessivas durante a digitação.
    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Função que filtra os cards com base no termo digitado.
    const buscarProdutos = debounce((termo) => {
        const cards = document.querySelectorAll('.card');
        let nenhumProdutoEncontrado = true;

        // Itera sobre os cards e mostra/esconde com base no termo.
        cards.forEach(card => {
            const titulo = card.querySelector('h3').textContent.toLowerCase();
            if (titulo.includes(termo)) {
                card.style.display = 'block';
                nenhumProdutoEncontrado = false;
            } else {
                card.style.display = 'none';
            }
        });

        // Cria o elemento de feedback para busca.
        const feedbackBusca = document.createElement('p');
        feedbackBusca.classList.add('feedback-busca');
        feedbackBusca.textContent = nenhumProdutoEncontrado ? 'Nenhum produto encontrado.' : '';
        feedbackBusca.style.color = 'red';
        feedbackBusca.style.transition = 'opacity 0.5s ease';
        feedbackBusca.style.opacity = '1';

        // Remove feedback anterior, se existir.
        const feedbackAnterior = document.querySelector('.feedback-busca');
        if (feedbackAnterior) feedbackAnterior.remove();
        document.getElementById('card-container').appendChild(feedbackBusca);

        // Limpa o feedback automaticamente após 3 segundos, apenas se houver mensagem.
        if (nenhumProdutoEncontrado) {
            setTimeout(() => {
                feedbackBusca.style.opacity = '0';
                setTimeout(() => feedbackBusca.remove(), 500);
            }, 3000);
        }
    }, 300);

    // Adiciona listener ao campo de busca para disparar a filtragem ao digitar.
    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        buscarProdutos(termo);
    });
}

// Evento que inicializa as funções quando o DOM está carregado.
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('card-container')) {
        console.log('DOM carregado, chamando loadProducts e handleProductSearch');
        loadProducts(); 
        handleProductSearch(); 
    }
});