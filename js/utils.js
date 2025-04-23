/**
 * Formata um valor numérico para moeda brasileira.
 * @param {number} valor - Valor a ser formatado.
 * @returns {string} Valor formatado em BRL.
 */
const precoFormatado = valor =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Manipula erros de fetch exibindo feedback visual ao usuário.
 * @param {Error} error - Objeto de erro lançado pela requisição.
 * @param {HTMLElement} container - Elemento onde a mensagem de erro será exibida.
 */
function handleFetchError(error, container) {
    console.error('Erro:', error);
    container.innerHTML = '<p>Erro ao carregar os dados. Tente novamente mais tarde.</p>';
}

/**
 * Utilitário debounce para otimizar eventos de alta frequência (ex: input).
 * @param {Function} func - Função a ser executada após o delay.
 * @param {number} delay - Tempo de espera (em ms) após a última execução.
 * @returns {Function} Função controlada por debounce.
 */
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
