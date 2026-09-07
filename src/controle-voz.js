// Arrays mantidos para compatibilidade com o main.js
export const sentencesL = [];
export const sentencesA = [];

let audioPlayer = new Audio();
let currentTimestamps = [];
let currentElements = [];
let currentIndex = -1;
let isPlaying = false;
let currentTabType = "analise"; // 'intro' ou 'analise'

// INICIALIZADOR CHAMADO AO ENTRAR NA ABA
export async function initPlayer(scriptId, sentencesArray, scrubberId, timeId) {
    const scriptContainer = document.getElementById(scriptId);
    if (!scriptContainer) return;

    currentTabType = (scriptId === "lecture-script") ? "intro" : "analise";
    stopAnyAudio();

    // 1. Carrega os marcadores de tempo do JSON
    try {
        const res = await fetch(`/audio/modulo1-${currentTabType}-tempos.json`);
        if (res.ok) {
            currentTimestamps = await res.json();
        } else {
            currentTimestamps = [];
        }
    } catch (e) {
        currentTimestamps = [];
    }

    // 2. Aponta para o arquivo MP3 gerado
    audioPlayer.src = `/audio/modulo1-${currentTabType}.mp3`;
    audioPlayer.load();

    // 3. Encapsula cada parágrafo em um elemento clicável
    currentElements = [];
    const paragraphs = scriptContainer.querySelectorAll("p");
    paragraphs.forEach((p, idx) => {
        const rawHTML = p.innerHTML.trim();
        p.innerHTML = "";

        const span = document.createElement("span");
        span.id = `${scriptId}-s-${idx}`;
        span.className = "cursor-pointer transition-colors duration-150 block py-1";
        span.innerHTML = rawHTML;

        span.onclick = () => jumpToSentence(idx);
        p.appendChild(span);
        currentElements.push(span);
    });

    // 4. Ajusta o Scrubber (barra de progresso)
    const scrubber = document.getElementById(scrubberId);
    if (scrubber) {
        scrubber.max = currentElements.length > 0 ? currentElements.length - 1 : 0;
        scrubber.value = 0;
    }

    updateTimeDisplay(timeId, 0, currentElements.length);
}

// Sincronia em tempo real enquanto o áudio toca
audioPlayer.ontimeupdate = () => {
    if (currentTimestamps.length === 0) return;

    const currentTime = audioPlayer.currentTime;
    const found = currentTimestamps.find(t => currentTime >= t.start && currentTime < t.end);

    if (found && found.index !== currentIndex) {
        highlightIndex(found.index);
    }
};

audioPlayer.onended = () => {
    stopAnyAudio();
};

function highlightIndex(idx) {
    currentIndex = idx;

    // Limpa destaque anterior
    currentElements.forEach(el => el.classList.remove("text-slate-200", "font-bold", "bg-brand-900/40", "rounded-lg", "px-2"));

    // Destaca o parágrafo atual
    const active = currentElements[idx];
    if (active) {
        active.classList.add("text-slate-200", "font-bold", "bg-brand-900/40", "rounded-lg", "px-2");

        // Rola a tela suavemente para acompanhar a leitura
        const container = active.closest(".overflow-y-auto");
        if (container) {
            const offset = active.offsetTop - container.offsetTop - 40;
            container.scrollTo({ top: offset, behavior: "smooth" });
        }
    }

    const scrubberId = (currentTabType === "intro") ? "audio-scrubber" : "analysis-scrubber";
    const timeId = (currentTabType === "intro") ? "audio-current-time" : "analysis-current-time";

    const scrubber = document.getElementById(scrubberId);
    if (scrubber) scrubber.value = idx;

    updateTimeDisplay(timeId, idx, currentElements.length);
}

export function jumpToSentence(idx) {
    if (!currentTimestamps[idx]) return;
    audioPlayer.currentTime = currentTimestamps[idx].start;
    highlightIndex(idx);
    if (!isPlaying) {
        playCurrentAudio();
    }
}

function playCurrentAudio() {
    isPlaying = true;
    audioPlayer.play();
    updatePlayPauseIcons(true);
}

function pauseCurrentAudio() {
    isPlaying = false;
    audioPlayer.pause();
    updatePlayPauseIcons(false);
}

export function stopAnyAudio() {
    isPlaying = false;
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    currentIndex = -1;
    currentElements.forEach(el => el.classList.remove("text-slate-200", "font-bold", "bg-brand-900/40", "rounded-lg", "px-2"));
    updatePlayPauseIcons(false);
}

function updatePlayPauseIcons(playing) {
    const playL = document.getElementById("play-icon");
    const pauseL = document.getElementById("pause-icon");
    const playA = document.getElementById("play-icon-analysis");
    const pauseA = document.getElementById("pause-icon-analysis");

    const activePlay = (currentTabType === "intro") ? playL : playA;
    const activePause = (currentTabType === "intro") ? pauseL : pauseA;

    if (activePlay && activePause) {
        if (playing) {
            activePlay.classList.add("hidden");
            activePause.classList.remove("hidden");
        } else {
            activePlay.classList.remove("hidden");
            activePause.classList.add("hidden");
        }
    }
}

// Ações dos botões da interface
export function toggleLectureAudio() {
    currentTabType = "intro";
    if (isPlaying) pauseCurrentAudio();
    else playCurrentAudio();
}

export function toggleAnalysisAudio() {
    currentTabType = "analise";
    if (isPlaying) pauseCurrentAudio();
    else playCurrentAudio();
}

export function stopLectureAudio() { stopAnyAudio(); }
export function stopAnalysisAudio() { stopAnyAudio(); }

export function scrubLecture(val) { jumpToSentence(parseInt(val)); }
export function scrubAnalysis(val) { jumpToSentence(parseInt(val)); }

export function previousSentence() { if (currentIndex > 0) jumpToSentence(currentIndex - 1); }
export function nextSentence() { if (currentIndex < currentElements.length - 1) jumpToSentence(currentIndex + 1); }
export function prevAnalysis() { previousSentence(); }
export function nextAnalysis() { nextSentence(); }

export function updateLectureSpeed() {
    const slider = document.getElementById("audio-speed");
    const label = document.getElementById("speed-val");
    if (!slider) return;
    const rate = parseFloat(slider.value);
    audioPlayer.playbackRate = rate;
    if (label) label.textContent = `${rate.toFixed(1)}x`;
}

export function updateAnalysisSpeed() {
    const slider = document.getElementById("analysis-speed");
    const label = document.getElementById("speed-val-analysis");
    if (!slider) return;
    const rate = parseFloat(slider.value);
    audioPlayer.playbackRate = rate;
    if (label) label.textContent = `${rate.toFixed(1)}x`;
}

function updateTimeDisplay(timeId, current, total) {
    const display = document.getElementById(timeId);
    if (display) display.textContent = `${current + 1} / ${total}`;
}

export function stopSynthesisOnly() {
    stopAnyAudio();
}

export function populateVoices() {
    // Mantida vazia propositalmente para não quebrar chamadas antigas do main.js
}

// EXPOSIÇÃO GLOBAL PARA OS CLIQUES INLINE DO HTML
window.initPlayer = initPlayer;
window.populateVoices = populateVoices;
window.stopSynthesisOnly = stopSynthesisOnly;
window.toggleLectureAudio = toggleLectureAudio;
window.stopLectureAudio = stopLectureAudio;
window.scrubLecture = scrubLecture;
window.previousSentence = previousSentence;
window.nextSentence = nextSentence;
window.updateLectureSpeed = updateLectureSpeed;

window.toggleAnalysisAudio = toggleAnalysisAudio;
window.stopAnalysisAudio = stopAnalysisAudio;
window.scrubAnalysis = scrubAnalysis;
window.prevAnalysis = prevAnalysis;
window.nextAnalysis = nextAnalysis;
window.updateAnalysisSpeed = updateAnalysisSpeed;