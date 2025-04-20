const precoFormatado = valor => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function handleFetchError(error, container) {
    console.error('Erro:', error);
    container.innerHTML = '<p>Erro ao carregar os dados. Tente novamente mais tarde.</p>';
}

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}