// Variáveis de Estado Interno do Quiz
let moduleQuizData = [];
let currentQuestionIndex = 0;
let activeQuizLevel = 1;
let currentQuizQuestions = [];

// INICIALIZADOR: Chamado pelo main.js quando a aba Quiz for aberta
export function initQuiz(quizData) {
    if (!quizData || quizData.length === 0) return;
    moduleQuizData = quizData;

    // Garante que o canvas de confete responda ao redimensionamento da janela
    window.addEventListener('resize', () => {
        const canvas = document.getElementById("confetti-canvas");
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });

    loadQuizLevel(1);
}

// CARREGA O NÍVEL DO QUIZ E FILTRA AS QUESTÕES
function loadQuizLevel(level) {
    activeQuizLevel = level;
    // Filtra apenas as questões correspondentes ao nível (1, 2 ou 3)
    currentQuizQuestions = [...moduleQuizData.filter(q => q.level === level)];
    currentQuestionIndex = 0;

    const badge = document.getElementById("quiz-level-badge");
    if (badge) badge.textContent = `Quiz • Nível ${level} de 3`;

    // Sincroniza a barra lateral (UI Fixa)
    const stageText = document.getElementById("sidebar-stage");
    const progress = document.getElementById("sidebar-progress");
    const progressText = document.getElementById("sidebar-progress-text");

    if (level === 1) {
        if (stageText) stageText.textContent = "Incompetência Consciente";
        if (progress) progress.style.width = "33%";
        if (progressText) progressText.textContent = "Quiz: Nível 1 de 3";
    } else if (level === 2) {
        if (stageText) stageText.textContent = "Competência Consciente";
        if (progress) progress.style.width = "66%";
        if (progressText) progressText.textContent = "Quiz: Nível 2 de 3";
    } else if (level === 3) {
        if (stageText) stageText.textContent = "Competência Inconsciente";
        if (progress) progress.style.width = "100%";
        if (progressText) progressText.textContent = "Quiz: Nível 3 de 3";
    }

    renderQuestion();
}

// RENDERIZA A QUESTÃO ATUAL NA TELA
function renderQuestion() {
    if (currentQuizQuestions.length === 0) return;

    const q = currentQuizQuestions[currentQuestionIndex];
    const container = document.getElementById("quiz-container");
    const scoreIndicator = document.getElementById("quiz-score-indicator");

    if (scoreIndicator) {
        scoreIndicator.textContent = `Q. ${currentQuestionIndex + 1} de ${currentQuizQuestions.length}`;
    }

    if (container) {
        container.innerHTML = `
            <div lang="pt-BR" style="text-align: justify; hyphens: auto; text-justify: inter-word;" class="mt-2 text-base sm:text-base font-medium text-slate-300 mb-2 px-2 leading-relaxed">
                ${q.question}
            </div>
            <div id="quiz-options-grid" class="flex flex-col gap-2 sm:gap-3 w-full">
                ${q.options.map((opt, i) => `
                    <button onclick="submitAnswer(${i})" class="w-[96%] mx-auto text-left p-2 sm:p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-600 transition flex items-center gap-3 group">
                        <span class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 group-hover:bg-brand-600 group-hover:text-slate-200 group-hover:border-brand-500 font-extrabold text-base sm:text-base transition shrink-0">${String.fromCharCode(65 + i)}</span>
                        <span lang="pt-BR" style="text-align: justify; hyphens: auto; text-justify: inter-word;" class="text-base sm:text-base text-slate-300 group-hover:text-slate-200 leading-snug">${opt}</span>
                    </button>
                `).join('')}
            </div>
            <div id="quiz-feedback"></div>
        `;
    }
}

// AVALIA A RESPOSTA E EXIBE O FEEDBACK
function submitAnswer(selectedIndex) {
    const q = currentQuizQuestions[currentQuestionIndex];
    const feedback = document.getElementById("quiz-feedback");

    if (!feedback) return;

    const grid = document.getElementById("quiz-options-grid");
    const buttons = grid.querySelectorAll("button");
    // Trava os botões para evitar duplo clique
    buttons.forEach(btn => btn.disabled = true);

    let isCorrect = selectedIndex === q.correct;
    let feedbackHTML = "";

    if (isCorrect) {
        feedbackHTML = `
            <div class="flex-1 flex flex-col justify-center items-center text-center space-y-2">
                <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 class="text-lg sm:text-xl font-extrabold text-emerald-400 tracking-tight">Resposta Correta!</h3>
                <p lang="pt-BR" style="text-align: justify; hyphens: auto; text-justify: inter-word;" class="text-base sm:text-base text-slate-300 max-w-2xl leading-relaxed">${q.explanation}</p>
                <span lang="pt-BR" style="text-align: justify; hyphens: auto; text-justify: inter-word;" class="inline-block px-3 py-1 bg-slate-900 rounded-md text-slate-400 text-base sm:text-base font-mono mt-2">${q.citation}</span>
            </div>
            <button onclick="advanceQuestion(false)" class="w-full p-3 bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-base sm:text-base font-extrabold rounded-xl transition shadow-lg shadow-emerald-900/20 mt-4">Avançar para a próxima questão</button>
        `;
        triggerDopamineConfetti();
    } else {
        feedbackHTML = `
            <div class="flex-1 flex flex-col justify-center items-center text-center space-y-2">
                <div class="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 class="text-lg sm:text-xl font-extrabold text-rose-400 tracking-tight">Tente Novamente</h3>
                <p lang="pt-BR" style="text-align: justify; hyphens: auto; text-justify: inter-word;" class="text-base sm:text-base text-slate-300 max-w-2xl leading-relaxed">${q.explanation}</p>
                <span lang="pt-BR" style="text-align: justify; hyphens: auto; text-justify: inter-word;" class="inline-block px-3 py-1 bg-slate-900 rounded-md text-slate-400 text-base sm:text-base font-mono mt-2">${q.citation}</span>
            </div>
            <button onclick="advanceQuestion(true)" class="w-full p-3 bg-rose-600 hover:bg-rose-500 text-slate-100 text-base sm:text-base font-extrabold rounded-xl transition shadow-lg shadow-rose-900/20 mt-4">Continuar a aprender</button>
        `;
    }

    feedback.innerHTML = feedbackHTML;
    feedback.className = "absolute inset-0 bg-slate-800 flex flex-col justify-between p-4 sm:p-5 z-40 transition-all duration-300 rounded-3xl border border-slate-700";
}

// AVANÇA NA FILA (APLICA A REPESCAGEM PEDAGÓGICA)
function advanceQuestion(wasWrong = false) {
    if (wasWrong) {
        const currentQuestion = currentQuizQuestions.splice(currentQuestionIndex, 1)[0];
        currentQuizQuestions.push(currentQuestion);
    } else {
        currentQuestionIndex++;
    }

    if (currentQuestionIndex >= currentQuizQuestions.length) {
        if (activeQuizLevel < 3) {
            loadQuizLevel(activeQuizLevel + 1);
        } else {
            renderQuizCelebration();
        }
    } else {
        renderQuestion();
    }
}

// TELA DE CELEBRAÇÃO FINAL
function renderQuizCelebration() {
    const container = document.getElementById("quiz-container");
    const scoreIndicator = document.getElementById("quiz-score-indicator");

    if (scoreIndicator) scoreIndicator.textContent = "Concluído";

    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <div class="w-20 h-20 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mb-2 animate-bounce">
                    <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                </div>
                <h3 class="text-2xl sm:text-3xl font-extrabold text-slate-200">Vitória Biológica!</h3>
                <p lang="pt-BR" style="text-align: justify; hyphens: auto; text-justify: inter-word;" class="text-base sm:text-base text-slate-400 max-w-md">Você dominou completamente os conceitos deste módulo e alcançou a Competência Inconsciente.</p>
            </div>
        `;
    }
    triggerDopamineConfetti();
}

// MOTOR DE CONFETES DO CANVAS
function triggerDopamineConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;

    canvas.style.zIndex = "999"; // Garante que o canvas caia na frente de tudo
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confetis = [];
    const rootStyles = getComputedStyle(document.documentElement);
    const cores = [
        rootStyles.getPropertyValue('--brand-500').trim() || "#0ea5e9",
        rootStyles.getPropertyValue('--luz-verde').trim() || "#10b981",
        rootStyles.getPropertyValue('--luz-ouro').trim() || "#f59e0b",
        rootStyles.getPropertyValue('--luz-coral').trim() || "#f43f5e",
        rootStyles.getPropertyValue('--luz-roxo').trim() || "#a855f7"
    ];

    for (let i = 0; i < 90; i++) {
        confetis.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 5 + 3,
            d: Math.random() * canvas.height,
            cor: cores[Math.floor(Math.random() * cores.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }

    let animationFrameId;

    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        confetis.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 1.5;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

            if (p.y < canvas.height) active = true;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.cor;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });

        if (active) {
            animationFrameId = requestAnimationFrame(drawConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationFrameId);
        }
    }

    drawConfetti();
}

// EXPOSIÇÃO GLOBAL
window.submitAnswer = submitAnswer;
window.advanceQuestion = advanceQuestion;