document.addEventListener("DOMContentLoaded", () => {
    // Cria e injeta o overlay que será usado tanto pelo menu quanto pelo carrinho
    const overlay = document.createElement('div');
    overlay.classList.add('menu-open-overlay');
    document.body.appendChild(overlay);

    // Função responsável por carregar o carrinho lateral dinamicamente via fetch
    async function loadCartPanel() {
        try {
            const response = await fetch('../pages/cart-panel.html');
            if (!response.ok) throw new Error('Erro ao carregar o carrinho');

            const html = await response.text();
            const cartWrapper = document.createElement('div');
            cartWrapper.innerHTML = html;

            // Garante que o carrinho não será duplicado
            if (!document.getElementById('cart-list')) {
                document.body.appendChild(cartWrapper);

                // Aguarda o próximo frame para garantir que o DOM foi atualizado
                requestAnimationFrame(() => {
                    console.log('[UI] Carrinho lateral injetado com sucesso.');
                    initCartMenu(); // Inicializa funcionalidades do carrinho
                });
            }
        } catch (error) {
            console.error('Falha ao carregar cart-panel.html:', error);
        }
    }

    // Controla a abertura/fechamento do menu de navegação (mobile)
    function toggleNavMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const navList = document.getElementById('nav-list');

        if (!menuToggle || !navList) return;

        // Alterna a exibição do menu e atualiza atributos de acessibilidade
        function toggleMenu() {
            const isOpen = navList.classList.toggle('show');
            menuToggle.setAttribute('aria-expanded', isOpen);

            if (!isOpen) menuToggle.focus(); // Retorna foco para acessibilidade

            document.body.classList.toggle('menu-open', isOpen);
            overlay.classList.toggle('show', isOpen); // Exibe ou esconde overlay
        }

        // Fecha o menu e remove classe de exibição do overlay
        function closeMenu() {
            if (navList.classList.contains('show')) {
                navList.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
                overlay.classList.remove('show');
                menuToggle.focus();
            }
        }

        // Garante que não haverá múltiplos listeners
        if (!menuToggle.hasAttribute('data-listener-added')) {
            menuToggle.addEventListener('click', toggleMenu);
            menuToggle.setAttribute('data-listener-added', 'true');
        }

        // Cria botão de fechar no menu, caso ainda não exista
        let closeButton = navList.querySelector('#close-menu');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.id = 'close-menu';
            closeButton.textContent = '×';
            closeButton.setAttribute('aria-label', 'Fechar menu');
            navList.insertBefore(closeButton, navList.firstChild);
        }
        closeButton.addEventListener('click', closeMenu);

        // Fecha menu com tecla Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navList.classList.contains('show')) closeMenu();
        });
    }

    // Gerencia o formulário de newsletter e feedback visual ao usuário
    function handleNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (!newsletterForm) return;

        const nomeInput = newsletterForm.querySelector('.newsletter-input--name');
        const emailInput = newsletterForm.querySelector('.newsletter-input--email');

        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const emailValido = emailInput.checkValidity();

            const isValid = nome && email && emailValido;

            // Cria mensagem de feedback dinâmica com estilo visual
            const feedback = document.createElement('div');
            feedback.classList.add('feedback-message');
            feedback.style.cssText = `
                padding: 10px;
                margin-top: 10px;
                border-radius: 5px;
                background-color: ${isValid ? '#e6ffe6' : '#ffe6e6'};
                color: ${isValid ? 'green' : 'red'};
            `;
            feedback.textContent = isValid
                ? `Obrigado por se inscrever, ${nome}!`
                : (!nome
                    ? 'Por favor, preencha o nome.'
                    : (!email
                        ? 'Por favor, preencha o email.'
                        : 'Por favor, insira um email válido.'));

            // Botão de fechar na mensagem de feedback
            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.cssText = 'float: right; background: none; border: none; cursor: pointer; font-size: 16px;';
            closeButton.addEventListener('click', () => feedback.remove());
            feedback.appendChild(closeButton);

            // Remove feedback anterior, se existir
            const anterior = newsletterForm.querySelector('.feedback-message');
            if (anterior) anterior.remove();
            newsletterForm.appendChild(feedback);

            // Limpa formulário após sucesso
            if (isValid) {
                setTimeout(() => feedback.remove(), 3000);
                newsletterForm.reset();
            }
        });
    }

    // Inicializa a lógica de exibição do carrinho lateral
    function initCartMenu() {
        const cartToggle = document.getElementById('cart-toggle');
        const cartList = document.getElementById('cart-list');
        const closeCartButton = document.getElementById('close-cart');

        if (!cartToggle || !cartList || !closeCartButton) {
            console.warn('Elementos do carrinho não encontrados');
            return;
        }

        // Abre o carrinho e exibe overlay
        function openCart() {
            cartList.classList.add('show');
            cartToggle.setAttribute('aria-expanded', 'true');
            overlay.classList.add('show');
        }

        // Fecha o carrinho e esconde overlay
        function closeCart() {
            cartList.classList.remove('show');
            cartToggle.setAttribute('aria-expanded', 'false');
            cartToggle.focus();
            overlay.classList.remove('show');
        }

        // Alterna exibição do carrinho
        function toggleCart() {
            if (cartList.classList.contains('show')) {
                closeCart();
            } else {
                openCart();
            }
        }

        // Listeners principais
        cartToggle.addEventListener('click', toggleCart);
        closeCartButton.addEventListener('click', closeCart);

        // Fecha com tecla Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartList.classList.contains('show')) {
                closeCart();
            }
        });

        // Fecha carrinho ou menu ao clicar fora (overlay)
        overlay.addEventListener('click', () => {
            if (cartList.classList.contains('show')) {
                closeCart();
            }

            const navList = document.getElementById('nav-list');
            if (navList?.classList.contains('show')) {
                document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
                navList.classList.remove('show');
                overlay.classList.remove('show');
            }
        });
    }

    // Inicializações principais
    toggleNavMenu();
    handleNewsletterForm();
    loadCartPanel(); // Carrega e injeta carrinho lateral
});
