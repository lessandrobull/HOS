import { dadosModulos } from '../conteudo/modulos-index.js';
import { initQuiz } from './quiz-engine.js';
// O Vite vai resolver as funções expostas no window pelos módulos abaixo
import './controle-voz.js';
import './ui-interacoes.js';

let currentModule = 1;
let currentTab = 'intro';

document.addEventListener('DOMContentLoaded', () => {

    // Carrega as vozes do navegador após um pequeno delay para garantir que a API carregou
    setTimeout(() => {
        if (window.populateVoices) window.populateVoices();
    }, 500);

    // 1. Escutador de Eventos: Menu Lateral (Módulos)
    document.querySelectorAll('.modulo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modId = parseInt(e.currentTarget.getAttribute('data-modulo'));
            loadModule(modId);
        });
    });

    // 2. Escutador de Eventos: Abas Superiores (Intro, Análise, etc)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            loadTab(tabId);
        });
    });

    // Dispara a carga inicial do estado zero (Módulo 1, Aba Intro)
    loadTab(currentTab);
});

// ==========================================
// TROCA DE MÓDULO
// ==========================================
function loadModule(modId) {
    if (!dadosModulos[modId]) {
        alert('Este módulo será liberado em breve!');
        return;
    }

    currentModule = modId;

    // Atualiza o estado visual dos botões na Sidebar (suas classes exatas)
    document.querySelectorAll('.modulo-btn').forEach(btn => {
        btn.className = 'modulo-btn w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-left text-slate-400 hover:bg-slate-800';
    });

    const activeBtn = document.querySelector(`.modulo-btn[data-modulo="${modId}"]`);
    if (activeBtn) {
        activeBtn.className = 'modulo-btn w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-left bg-brand-700 text-slate-200 shadow-lg shadow-brand-700/10';
    }

    // Atualiza os Textos do Header dinamicamente
    const titulos = {
        1: "Epistemologia e Vida",
        // Pode adicionar os próximos aqui: 2: "Cérebro Trino", etc.
    };

    document.getElementById('header-modulo-badge').textContent = `Módulo ${modId}`;
    document.getElementById('header-modulo-title').textContent = titulos[modId] || "Em construção";

    // Para qualquer narração que esteja rodando e carrega a aba
    if (window.stopSynthesisOnly) window.stopSynthesisOnly();
    loadTab(currentTab);

    // Fecha o menu lateral automaticamente em telas mobile
    const sidebar = document.getElementById('sidebar');
    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
    }
}

// ==========================================
// RENDERIZAÇÃO DE ABAS VIA FETCH (SPA)
// ==========================================
async function loadTab(tabId) {
    currentTab = tabId;

    // Atualiza a interface (cores) da Tab Selecionada
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-brand-500 rounded-lg transition font-extrabold whitespace-nowrap shadow-sm';
    });
    const activeTabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (activeTabBtn) {
        activeTabBtn.className = 'tab-btn px-4 py-2 bg-brand-700 text-slate-200 rounded-lg transition font-extrabold whitespace-nowrap shadow-sm';
    }

    // Para o motor de voz, se houver algo rodando na transição
    if (window.stopSynthesisOnly) window.stopSynthesisOnly();

    const target = document.getElementById('view-target');

    try {
        // 1. Busca a "Casca" HTML da respectiva pasta de componentes
        const response = await fetch(`/componentes/aba-${tabId}.html`);
        if (!response.ok) throw new Error('Erro ao buscar o layout da aba.');
        const html = await response.text();
        target.innerHTML = html; // Injeta a casca na tela

        // 2. Extrai a carga de dados referente ao módulo atual
        const dados = dadosModulos[currentModule];

        // 3. Preenchimento Dinâmico conforme a Aba
        if (tabId === 'intro') {
            const scriptContainer = document.getElementById('lecture-script');
            if (scriptContainer) {
                // Injeta os parágrafos puros
                dados.intro.forEach(pText => {
                    const p = document.createElement('p');
                    p.innerHTML = pText;
                    scriptContainer.appendChild(p);
                });
                // Importa dinamicamente a array e inicializa o motor do controle-voz.js
                import('./controle-voz.js').then(module => {
                    module.sentencesL.length = 0; // Limpa estado anterior
                    window.initPlayer('lecture-script', module.sentencesL, 'audio-scrubber', 'audio-current-time');
                    window.populateVoices();
                });
            }
        }

        else if (tabId === 'analise') {
            const scriptContainer = document.getElementById('analysis-script');
            if (scriptContainer) {
                dados.analise.forEach(pText => {
                    const p = document.createElement('p');
                    p.innerHTML = pText;
                    scriptContainer.appendChild(p);
                });
                import('./controle-voz.js').then(module => {
                    module.sentencesA.length = 0;
                    window.initPlayer('analysis-script', module.sentencesA, 'analysis-scrubber', 'analysis-current-time');
                    window.populateVoices();
                });
            }
        }

        else if (tabId === 'graficos') {
            // Se abrir a aba de gráficos, força o carregamento do Gráfico 1 do módulo atual
            window.loadGrafico(1);
        }

        else if (tabId === 'quiz') {
            // Dispara o motor de inteligência do Quiz, passando as perguntas do módulo
            initQuiz(dados.quiz);
        }

    } catch (error) {
        target.innerHTML = `<div class="p-8 text-rose-500 font-bold text-center">Componente em desenvolvimento. <br><span class="text-sm text-slate-500">${error.message}</span></div>`;
    }
}

// ==========================================
// FUNÇÃO GLOBAL: BUSCAR GRÁFICOS
// ==========================================
window.loadGrafico = async function (graficoId) {
    const container = document.getElementById('grafico-container');
    if (!container) return;

    // Atualiza cores dos botões internos na aba de Gráficos
    for (let i = 1; i <= 3; i++) {
        const btn = document.getElementById(`tab-btn-grafico${i}`);
        if (btn) btn.className = "flex-1 py-1.5 sm:py-2 px-1 text-sm sm:text-base md:text-lg font-extrabold rounded-xl transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 truncate";
    }
    const activeBtn = document.getElementById(`tab-btn-grafico${graficoId}`);
    if (activeBtn) activeBtn.className = "flex-1 py-1.5 sm:py-2 px-1 text-sm sm:text-base md:text-lg font-extrabold rounded-xl transition-all bg-brand-600 text-slate-300 shadow-sm truncate";

    try {
        // Faz o fetch direto do arquivo de dados lá na pasta de conteúdo (ex: /conteudo/grafico1-1.html)
        const response = await fetch(`/conteudo/grafico${currentModule}-${graficoId}.html`);
        if (!response.ok) throw new Error();
        const html = await response.text();

        container.innerHTML = html;

        // REAQUECIMENTO DE SCRIPT: Para que os arrays internos dos gráficos (RING_DATA, etc) funcionem via Fetch
        const scripts = container.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

    } catch (error) {
        container.innerHTML = `<div class="h-full flex items-center justify-center text-slate-500 font-medium text-center p-4">O Gráfico ${graficoId} ainda não foi disponibilizado para o Módulo ${currentModule}.</div>`;
    }
}