// ========== QUESTÕES COM TEMA MATUÊ E 30PRAUM ==========
const QUESTIONS = [
    {
        text: "Qual o nome do primeiro álbum de estúdio do Matuê, lançado em 2020?",
        options: ["Máquina do Tempo", "333", "Eternal", "30PRAUM"],
        correct: 1
    },
    {
        text: "O que significa '30PRAUM' na cultura do Matuê e seus fãs?",
        options: [
            "Uma data comemorativa",
            "O lema '30 pra um' representa foco, lealdade e a rua",
            "Número de músicas do EP",
            "Marca de roupa oficial"
        ],
        correct: 1
    },
    {
        text: "Qual clipe do Matuê foi um dos mais aguardados e tem a estética futurista com elementos de anime?",
        options: ["Groupies", "Quer Voar", "Banco", "Máquina do Tempo"],
        correct: 0
    },
    {
        text: "Matuê é fundador de qual gravadora/coletivo que revolucionou o trap nacional?",
        options: ["Mainstreet", "30PRAUM Records", "Sony Music Brasil", "Rimas"],
        correct: 1
    },
    {
        text: "Em 'M4', Matuê faz uma referência direta à qual estilo de luta/arte marcial?",
        options: ["Jiu-Jitsu", "Muay Thai", "Boxe", "Kung Fu"],
        correct: 0
    },
    {
        text: "Qual música do Matuê estourou em 2019 e consolidou seu nome no cenário nacional?",
        options: ["Kenny G", "Vampiro", "Anos Luz", "Imagina"],
        correct: 0
    },
    {
        text: "O EP 'Máquina do Tempo' trouxe colaborações com quais artistas?",
        options: ["Wiu & Teto", "Veigh & KayBlack", "Filipe Ret & Xamã", "Yunk Vino & Chefin"],
        correct: 0
    },
    {
        text: "Qual o significado por trás do nome 'Matuê'?",
        options: [
            "Referência a um personagem de RPG",
            "Apelido de infância por causa do olhar atento",
            "Homenagem ao avô",
            "Inspiração no Egito Antigo"
        ],
        correct: 1
    }
];

// Estado do jogo
let currentQuestion = 0;
let score = 0;
let timeLeft = 259200;
let timerInterval = null;
let quizActive = true;
let answerSelected = false;

const quizPanel = document.getElementById('quizPanel');

// ========== SISTEMA DE MÚSICA - VERSÃO SIMPLIFICADA QUE FUNCIONA ==========
let audio = null;
let isPlaying = false;

// CRIA A MÚSICA USANDO UM LINK ONLINE QUE FUNCIONA
function initMusic() {
    // Usando um link de áudio que funciona 100%
    audio = new Audio('https://actions.google.com/sound?oid=2');
    
    if (!audio) {
        // Fallback: criar um som simples
        audio = new Audio();
        audio.src = 'data:audio/wav;base64,U3RlYWx0aCBiZSBteSBhbmRyb2lk';
    }
    
    audio.loop = true;
    audio.volume = 0.4;
    console.log('🎵 Sistema de música pronto!');
}

function playMusic() {
    if (!audio) {
        initMusic();
    }
    
    // Tenta tocar
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            const icon = document.querySelector('.music-icon');
            if (icon) icon.textContent = '🔊';
            console.log('🎵 Música tocando!');
        }).catch(error => {
            console.log('Erro ao tocar:', error);
            // Mostra alerta amigável
            alert('🔊 Clique no botão de música novamente! O navegador precisa da sua permissão.');
        });
    }
}

function stopMusic() {
    if (audio) {
        audio.pause();
        isPlaying = false;
        const icon = document.querySelector('.music-icon');
        if (icon) icon.textContent = '🎵';
        console.log('⏸️ Música pausada');
    }
}

function toggleMusic() {
    if (!audio) {
        initMusic();
    }
    
    if (isPlaying) {
        stopMusic();
    } else {
        playMusic();
    }
}

// FUNÇÃO PARA TOCAR MÚSICA DO MATUÊ (COLOQUE SEU ARQUIVO AQUI)
function tocarMusicaMatue() {
    // TROQUE 'sua-musica.mp3' pelo nome do seu arquivo
    const musica = new Audio('audio.mp3');
    musica.volume = 0.3;
    musica.play().catch(e => console.log('Arquivo não encontrado:', e));
}

// ========== FUNÇÕES DO QUIZ ==========

function initQuiz() {
    currentQuestion = 0;
    score = 0;
    timeLeft = 259200;
    quizActive = true;
    answerSelected = false;
    
    if (timerInterval) clearInterval(timerInterval);
    
    renderQuestion();
    startTimer();
}

function renderQuestion() {
    if (!quizActive || currentQuestion >= QUESTIONS.length) {
        renderResult();
        return;
    }
    
    const question = QUESTIONS[currentQuestion];
    const progress = ((currentQuestion) / QUESTIONS.length) * 100;
    
    let html = `
        <div class="timer-section">
            <div class="timer-label">⏱️ TEMPO RESTANTE</div>
            <div class="timer" id="timerDisplay">${formatTime(timeLeft)}</div>
        </div>
        
        <div class="progress">
            <span>QUESTÃO ${currentQuestion + 1}/${QUESTIONS.length}</span>
            <span>🎯 PONTOS: ${score}</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        
        <div class="question-card">
            <div class="question-text">${escapeHtml(question.text)}</div>
        </div>
        
        <div class="options" id="optionsContainer">
    `;
    
    question.options.forEach((opt, idx) => {
        const prefix = String.fromCharCode(65 + idx);
        html += `
            <div class="option" data-opt-index="${idx}">
                <div class="option-prefix">${prefix}</div>
                <div>${escapeHtml(opt)}</div>
            </div>
        `;
    });
    
    html += `
        </div>
        <button class="next-btn" id="nextBtn" disabled>PRÓXIMA QUESTÃO →</button>
    `;
    
    quizPanel.innerHTML = html;
    
    document.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', () => selectAnswer(parseInt(opt.dataset.optIndex)));
    });
    
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
}

function selectAnswer(selectedIndex) {
    if (!quizActive || answerSelected) return;
    
    const question = QUESTIONS[currentQuestion];
    const isCorrect = (selectedIndex === question.correct);
    
    if (isCorrect) {
        score++;
        showFeedback(true);
    } else {
        showFeedback(false);
    }
    
    answerSelected = true;
    
    const options = document.querySelectorAll('.option');
    options.forEach((opt, idx) => {
        opt.classList.add('disabled-opt');
        if (idx === question.correct) {
            opt.classList.add('correct-highlight');
        }
    });
    
    document.getElementById('nextBtn').disabled = false;
}

function showFeedback(isCorrect) {
    const feedback = document.createElement('div');
    feedback.style.position = 'fixed';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.backgroundColor = isCorrect ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 100, 100, 0.95)';
    feedback.style.color = isCorrect ? '#0a0a0a' : '#fff';
    feedback.style.padding = '15px 30px';
    feedback.style.borderRadius = '60px';
    feedback.style.fontWeight = 'bold';
    feedback.style.fontSize = '1.2rem';
    feedback.style.zIndex = '1000';
    feedback.style.backdropFilter = 'blur(8px)';
    feedback.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
    feedback.textContent = isCorrect ? '✓ ACERTOU! +1 PRAUM' : '✗ ERROU! A VIDA É SOBRE APRENDER';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transition = 'opacity 0.3s';
        setTimeout(() => feedback.remove(), 300);
    }, 1500);
}

function nextQuestion() {
    if (!answerSelected) return;
    
    currentQuestion++;
    answerSelected = false;
    
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = 259200;
    
    if (currentQuestion < QUESTIONS.length) {
        renderQuestion();
        startTimer();
    } else {
        quizActive = false;
        if (timerInterval) clearInterval(timerInterval);
        renderResult();
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!quizActive || answerSelected) return;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!answerSelected) {
                showFeedback(false);
                answerSelected = true;
                
                const question = QUESTIONS[currentQuestion];
                document.querySelectorAll('.option').forEach((opt, idx) => {
                    opt.classList.add('disabled-opt');
                    if (idx === question.correct) {
                        opt.classList.add('correct-highlight');
                    }
                });
                
                document.getElementById('nextBtn').disabled = false;
            }
        } else {
            timeLeft--;
            const timerDisplay = document.getElementById('timerDisplay');
            if (timerDisplay) {
                timerDisplay.textContent = formatTime(timeLeft);
            }
        }
    }, 1000);
}

function renderResult() {
    const totalQuestions = QUESTIONS.length;
    const percentage = (score / totalQuestions) * 100;
    let message = '';
    
    if (percentage === 100) {
        message = '🎤 INCRÍVEL! Você é um verdadeiro SÓCIO 30PRAUM! Conhece Matuê como ninguém! 🔥';
    } else if (percentage >= 75) {
        message = '🎵 MANDOU BEM! Você é quase um sócio oficial. Estude mais e vire 100% 30PRAUM!';
    } else if (percentage >= 50) {
        message = '📀 Bom começo! Escute mais Matuê e fortaleça a 30PRAUM!';
    } else {
        message = '🌊 Calma, jovem! Conhecer o legado do Matuê é uma jornada. Continue ouvindo e fazendo parte da gang!';
    }
    
    let html = `
        <div class="result-area">
            <div class="result-title">🏆 RESULTADO FINAL</div>
            <div class="final-score">${score}/${totalQuestions}</div>
            <div class="result-message">${message}</div>
            <button class="restart-btn" id="restartBtn">⟳ JOGAR NOVAMENTE</button>
        </div>
    `;
    
    quizPanel.innerHTML = html;
    document.getElementById('restartBtn').addEventListener('click', () => initQuiz());
}

function formatTime(seconds) {
    const dias = Math.floor(seconds / 86400);
    const horas = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (dias > 0) {
        return `${dias}d ${horas.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    } else if (horas > 0) {
        return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initQuiz();
    
    const musicBtn = document.getElementById('playPauseBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    initMusic();
    
    // Mensagem amigável
    console.log('✅ Site pronto! Clique no botão 🎵 para ativar a música');
});
