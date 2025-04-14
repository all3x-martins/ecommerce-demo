document.addEventListener("DOMContentLoaded", () => {
    // Carrega dinamicamente o carrinho lateral
    async function loadCartPanel() {
        try {
            const response = await fetch('/pages/cart-panel.html');
            if (!response.ok) throw new Error('Erro ao carregar o carrinho');

            const html = await response.text();
            const cartWrapper = document.createElement('div');
            cartWrapper.innerHTML = html;
            document.body.appendChild(cartWrapper);

            initCartMenu(); // Inicializa eventos após carregar
        } catch (error) {
            console.error('Falha ao carregar cart-panel.html:', error);
        }
    }

    // Inicializa o menu de navegação
    function toggleNavMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const navList = document.getElementById('nav-list');

        if (!menuToggle || !navList) return;

        function toggleMenu() {
            const isOpen = navList.classList.toggle('show');
            menuToggle.setAttribute('aria-expanded', isOpen);
            if (!isOpen) menuToggle.focus();

            const overlay = document.querySelector('.menu-open-overlay');
            document.body.classList.toggle('menu-open', isOpen);
            overlay.classList.toggle('show', isOpen);
        }

        function closeMenu() {
            if (navList.classList.contains('show')) {
                navList.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
                document.querySelector('.menu-open-overlay').classList.remove('show');
                menuToggle.focus();
            }
        }

        if (!menuToggle.hasAttribute('data-listener-added')) {
            menuToggle.addEventListener('click', toggleMenu);
            menuToggle.setAttribute('data-listener-added', 'true');
        }

        let closeButton = navList.querySelector('#close-menu');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.id = 'close-menu';
            closeButton.textContent = '×';
            closeButton.setAttribute('aria-label', 'Fechar menu');
            navList.insertBefore(closeButton, navList.firstChild);
        }
        closeButton.addEventListener('click', closeMenu);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navList.classList.contains('show')) closeMenu();
        });

        document.addEventListener('click', (e) => {
            if (navList.classList.contains('show') && !navList.contains(e.target) && e.target !== menuToggle) {
                closeMenu();
            }
        });

        menuToggle.setAttribute('aria-expanded', navList.classList.contains('show'));
    }

    // Inicializa formulário de newsletter
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

            const feedback = document.createElement('div');
            feedback.classList.add('feedback-message');
            feedback.style.cssText = `
                padding: 10px;
                margin-top: 10px;
                border-radius: 5px;
                background-color: ${isValid ? '#e6ffe6' : '#ffe6e6'};
                color: ${isValid ? 'green' : 'red'};
            `;
            feedback.textContent = isValid ? `Obrigado por se inscrever, ${nome}!` :
                (!nome ? 'Por favor, preencha o nome.' :
                    (!email ? 'Por favor, preencha o email.' : 'Por favor, insira um email válido.'));

            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.cssText = 'float: right; background: none; border: none; cursor: pointer; font-size: 16px;';
            closeButton.addEventListener('click', () => feedback.remove());
            feedback.appendChild(closeButton);

            const anterior = newsletterForm.querySelector('.feedback-message');
            if (anterior) anterior.remove();
            newsletterForm.appendChild(feedback);

            if (isValid) {
                setTimeout(() => feedback.remove(), 3000);
                newsletterForm.reset();
            }
        });
    }

    // Inicializa o carrinho após ser carregado dinamicamente
    function initCartMenu() {
        const cartToggle = document.getElementById('cart-toggle');
        const cartList = document.getElementById('cart-list');
        const closeCartButton = document.getElementById('close-cart');

        if (!cartToggle || !cartList || !closeCartButton) {
            console.warn('Elementos do carrinho não encontrados');
            return;
        }

        function openCart() {
            cartList.classList.add('show');
            cartToggle.setAttribute('aria-expanded', 'true');
        }

        function closeCart() {
            cartList.classList.remove('show');
            cartToggle.setAttribute('aria-expanded', 'false');
            cartToggle.focus();
        }

        function toggleCart() {
            if (cartList.classList.contains('show')) {
                closeCart();
            } else {
                openCart();
            }
        }

        cartToggle.addEventListener('click', toggleCart);
        closeCartButton.addEventListener('click', closeCart);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartList.classList.contains('show')) {
                closeCart();
            }
        });

        document.addEventListener('click', (e) => {
            if (cartList.classList.contains('show') &&
                !cartList.contains(e.target) &&
                e.target !== cartToggle) {
                closeCart();
            }
        });
    }

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.classList.add('menu-open-overlay');
    document.body.appendChild(overlay);

    // Inicializações
    toggleNavMenu();
    handleNewsletterForm();
    loadCartPanel(); // Chama o carrinho dinâmico
});