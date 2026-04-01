// ========== QUESTÕES COM TEMA MATUÊ E 30PRAUM ==========
const QUESTIONS = [
    {
        text: "Qual o nome do primeiro álbum de estúdio do Matuê, lançado em 2020?",
        options: ["Máquina do Tempo", "333", "Eternal", "30PRAUM"],
        correct: 1  // 333
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
let timeLeft = 302.400;
let timerInterval = null;
let quizActive = true;
let answerSelected = false;

// Elementos DOM
const quizPanel = document.getElementById('quizPanel');

// ========== SISTEMA DE MÚSICA REAL DO MATUÊ ==========
let audio = null;
let isPlaying = false;

function initMusic() {
    // Criar elemento de áudio com música do Matuê
    // OPÇÃO 1: Usar link do YouTube (embed) - Mais fácil para escola
    // OPÇÃO 2: Baixar um trecho da música e colocar na pasta
    
    // Vamos usar um link de áudio do Matuê (você pode substituir pelo arquivo local)
    // Para usar arquivo local: 'musicas/matue-333.mp3'
    audio = new Audio('BACKSTAGE - Matuê - Topic (128k).mp3');
    // ⚠️ SUBSTITUA O LINK ACIMA POR UMA MÚSICA REAL DO MATUÊ!
    // Exemplo com arquivo local: audio = new Audio('matue-333.mp3');
    
    audio.loop = true;
    audio.volume = 0.3;
    
    console.log('🎵 Música pronta! Clique no botão para tocar Matuê');
}

function playMusic() {
    if (!audio) {
        initMusic();
    }
    
    if (audio) {
        audio.play().then(() => {
            isPlaying = true;
            const icon = document.querySelector('.music-icon');
            if (icon) icon.textContent = '🔊';
            console.log('🎵 Tocando Matuê - 333 🔥');
        }).catch(err => {
            console.log('Clique no botão para ativar a música:', err);
            // Se falhar, tenta novamente
            if (audio) {
                audio.play();
            }
        });
    }
}

function stopMusic() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        const icon = document.querySelector('.music-icon');
        if (icon) icon.textContent = '🎵';
        console.log('⏸️ Música pausada');
    }
}

function toggleMusic() {
    if (!audio) {
        initMusic();
        // Pequeno delay para garantir que o áudio foi criado
        setTimeout(() => {
            playMusic();
        }, 100);
        return;
    }
    
    if (isPlaying) {
        stopMusic();
    } else {
        playMusic();
    }
}

// ========== FUNÇÕES DO QUIZ ==========

// Inicializar quiz
function initQuiz() {
    currentQuestion = 0;
    score = 0;
    timeLeft =  302.400;
    quizActive = true;
    answerSelected = false;
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    renderQuestion();
    startTimer();
}

// Renderizar pergunta atual
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
    
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.addEventListener('click', () => selectAnswer(parseInt(opt.dataset.optIndex)));
    });
    
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.addEventListener('click', nextQuestion);
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
    
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = false;
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
    feedback.style.animation = 'fadeInUp 0.3s ease-out';
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
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timeLeft = 21;
    
    if (currentQuestion < QUESTIONS.length) {
        renderQuestion();
        startTimer();
    } else {
        quizActive = false;
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        renderResult();
    }
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        if (!quizActive || answerSelected) return;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (!answerSelected) {
                showFeedback(false);
                answerSelected = true;
                
                const question = QUESTIONS[currentQuestion];
                const options = document.querySelectorAll('.option');
                options.forEach((opt, idx) => {
                    opt.classList.add('disabled-opt');
                    if (idx === question.correct) {
                        opt.classList.add('correct-highlight');
                    }
                });
                
                const nextBtn = document.getElementById('nextBtn');
                nextBtn.disabled = false;
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
    
    const restartBtn = document.getElementById('restartBtn');
    restartBtn.addEventListener('click', () => {
        initQuiz();
    });
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initQuiz();
    
    // Configurar controle de música
    const musicBtn = document.getElementById('playPauseBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', toggleMusic);
    }
    
    // Inicializar áudio (sem tocar automaticamente)
    initMusic();
});
