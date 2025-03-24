document.addEventListener("DOMContentLoaded", () => {
    function toggleNavMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const navList = document.getElementById('nav-list');

        if (!menuToggle || !navList) {
            console.warn('Elementos de menu não encontrados: #menu-toggle ou #nav-list');
            return;
        }

        // Função para abrir/fechar o menu
        function toggleMenu() {
            const isOpen = navList.classList.toggle('show');
            menuToggle.setAttribute('aria-expanded', isOpen);
            if (!isOpen) menuToggle.focus(); // Volta o foco ao fechar

            const overlay = document.querySelector('.menu-open-overlay');
            if (isOpen) {
                overlay.classList.add('show');
                document.body.classList.add('menu-open');
            } else {
                overlay.classList.remove('show');
                document.body.classList.remove('menu-open');
            }
        }

        // Função para fechar o menu
        function closeMenu() {
            if (navList.classList.contains('show')) {
                navList.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.focus();

                const overlay = document.querySelector('.menu-open-overlay');
                overlay.classList.remove('show');
                document.body.classList.remove('menu-open');
            }
        }

        // Adiciona eventos ao botão de toggle apenas uma vez
        if (!menuToggle.hasAttribute('data-listener-added')) {
            menuToggle.addEventListener('click', toggleMenu);
            menuToggle.setAttribute('data-listener-added', 'true');
        }

        // Botão de fechar dentro do nav-list
        let closeButton = navList.querySelector('#close-menu');
        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.id = 'close-menu';
            closeButton.textContent = '×';
            closeButton.setAttribute('aria-label', 'Fechar menu');
            navList.insertBefore(closeButton, navList.firstChild);
        }
        closeButton.addEventListener('click', closeMenu);

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navList.classList.contains('show')) {
                closeMenu();
            }
        });

        // Fechar ao clicar fora do menu
        document.addEventListener('click', (e) => {
            if (navList.classList.contains('show') && !navList.contains(e.target) && e.target !== menuToggle) {
                closeMenu();
            }
        });

        // Estado inicial
        menuToggle.setAttribute('aria-expanded', navList.classList.contains('show'));
    }

    function handleNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (!newsletterForm) {
            console.warn('Formulário de newsletter não encontrado');
            return;
        }

        const nomeInput = newsletterForm.querySelector('.newsletter-input--name');
        const emailInput = newsletterForm.querySelector('.newsletter-input--email');

        if (!nomeInput || !emailInput) {
            console.warn('Campos de entrada do formulário de newsletter não encontrados');
            return;
        }

        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const feedback = document.createElement('div');
            feedback.classList.add('feedback-message');

            const emailValido = emailInput.checkValidity(); // Usa validação nativa do HTML5.

            const isValid = nome && email && emailValido;
            let mensagemErro = '';
            if (!nome) mensagemErro = 'Por favor, preencha o nome.';
            else if (!email) mensagemErro = 'Por favor, preencha o email.';
            else if (!emailValido) mensagemErro = 'Por favor, insira um email válido.';

            feedback.textContent = isValid ? `Obrigado por se inscrever, ${nome}!` : mensagemErro;
            feedback.style.color = isValid ? 'green' : 'red';
            feedback.style.padding = '10px';
            feedback.style.backgroundColor = isValid ? '#e6ffe6' : '#ffe6e6';
            feedback.style.borderRadius = '5px';
            feedback.style.marginTop = '10px';

            const closeButton = document.createElement('button');
            closeButton.textContent = '×';
            closeButton.style.float = 'right';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '16px';
            closeButton.addEventListener('click', () => feedback.remove());
            feedback.appendChild(closeButton);

            const feedbackAnterior = newsletterForm.querySelector('.feedback-message');
            if (feedbackAnterior) feedbackAnterior.remove();
            newsletterForm.appendChild(feedback);

            if (isValid) {
                setTimeout(() => feedback.remove(), 3000);
                newsletterForm.reset();
            }
        });
    }

    // Adiciona o overlay ao carregar a página
    const overlay = document.createElement('div');
    overlay.classList.add('menu-open-overlay');
    document.body.appendChild(overlay);

    const hasMenu = document.getElementById('menu-toggle') && document.getElementById('nav-list');
    const hasNewsletter = document.querySelector('.newsletter-form');

    if (hasMenu) toggleNavMenu();
    if (hasNewsletter) handleNewsletterForm();
});