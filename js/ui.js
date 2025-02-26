function toggleNavMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => navList.classList.toggle('show'));
    }
}

function handleNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const nome = document.querySelector('.newsletter_input--name').value.trim();
            const email = document.querySelector('.newsletter_input--email').value.trim();
            const feedback = document.createElement('span');
            feedback.classList.add('feedback-message');

            const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

            feedback.textContent = nome && email && emailValido 
                ? `Obrigado por se inscrever, ${nome}!` 
                : 'Por favor, preencha todos os campos corretamente.';
            feedback.style.color = nome && email && emailValido ? 'green' : 'red';

            const feedbackAnterior = newsletterForm.querySelector('.feedback-message');
            if (feedbackAnterior) feedbackAnterior.remove();
            newsletterForm.appendChild(feedback);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    toggleNavMenu();
    handleNewsletterForm();
});