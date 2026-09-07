// =======================================================
// CONTROLE DO MENU LATERAL (SIDEBAR) MOBILE
// =======================================================

export function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        // Oculta ou mostra o menu usando a classe do Tailwind
        sidebar.classList.toggle('-translate-x-full');
    }
}

export function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    // Garante que o menu feche ao clicar em um link (comportamento mobile)
    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
    }
}

// =======================================================
// SCROLL SUAVE PARA OS COMPONENTES (Scroll Dinâmico)
// =======================================================

export function scrollToCard(cardId) {
    const container = document.getElementById("content-viewport"); // Container principal com scroll
    const element = document.getElementById(cardId);

    if (container && element) {
        const elementPosition = element.getBoundingClientRect().top;
        const containerPosition = container.getBoundingClientRect().top;
        let scrollPosition;

        if (window.innerWidth < 768) {
            // Centraliza dinamicamente a caixa verticalmente no visor do telemóvel
            const viewportHeight = container.clientHeight;
            const elementHeight = element.clientHeight;
            const offset = (viewportHeight - elementHeight) / 2;
            scrollPosition = elementPosition - containerPosition + container.scrollTop - offset;
        } else {
            // Em desktop, deixa um respiro de 12px no topo
            scrollPosition = elementPosition - containerPosition + container.scrollTop - 12;
        }

        container.scrollTo({ top: scrollPosition, behavior: "smooth" });
    }
}

// =======================================================
// ATUALIZAÇÃO VISUAL: ESTADOS ATIVOS DOS BOTÕES
// =======================================================

export function updateActiveModuleButton(moduleId) {
    // Varre os botões de 1 a 7 e reseta o visual para "inativo"
    for (let i = 1; i <= 7; i++) {
        const btn = document.getElementById(`btn-sec-${i}`);
        if (btn) {
            // Remove as classes de botão ativo
            btn.classList.remove('bg-brand-700', 'text-slate-200', 'shadow-lg', 'shadow-brand-600/10');
            
            // Só adiciona a cor padrão se ele não estiver bloqueado (cursor-not-allowed)
            if(!btn.classList.contains('cursor-not-allowed')) {
               btn.classList.add('text-slate-400');
            }
        }
    }

    // Adiciona o destaque visual apenas ao Módulo clicado
    const activeBtn = document.getElementById(`btn-sec-${moduleId}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-400');
        activeBtn.classList.add('bg-brand-700', 'text-slate-200', 'shadow-lg', 'shadow-brand-600/10');
    }
}

export function updateActiveTabButton(tabName) {
    // Array com os IDs dos botões do Header superior
    const tabs = ['btn-tab-intro', 'btn-tab-analise', 'btn-tab-graficos', 'btn-tab-quiz'];

    // Reseta todos os botões do Header
    tabs.forEach(tab => {
        const el = document.getElementById(tab);
        if (el) {
            el.classList.remove('bg-slate-700', 'text-slate-200');
            el.classList.add('bg-slate-800', 'text-brand-400');
        }
    });

    // Destaca a aba ativa
    const activeEl = document.getElementById(`btn-tab-${tabName}`);
    if (activeEl) {
        activeEl.classList.remove('bg-slate-800', 'text-brand-400');
        activeEl.classList.add('bg-slate-700', 'text-slate-200');
    }
}

// =======================================================
// EXPOSIÇÃO GLOBAL PARA EVENTOS INLINE DO HTML
// =======================================================
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.scrollToCard = scrollToCard;