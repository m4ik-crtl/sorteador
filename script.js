document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const addBtn = document.getElementById('addBtn');
    const drawBtn = document.getElementById('drawBtn');
    const countdownEl = document.getElementById('countdown');
    const winnerEl = document.getElementById('winner');
    const orderBtn = document.getElementById('orderBtn'); 
    const downloadBtn = document.getElementById('downloadBtn');
    const restartBtn = document.getElementById('restartBtn');
    const container = document.querySelector('.container');
    const participantsListEl = document.getElementById('participants-list');
    const themeToggle = document.getElementById('theme-toggle');
    const clearBtn = document.getElementById('clearBtn');
    
    const rankingModal = document.getElementById('rankingModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const rankingListModal = document.getElementById('rankingListModal');

    let participants = [];
    let sortedParticipants = [];

    function initializeApp() {
        // Agora inicia no modo escuro por padrão, que combina mais com a "vibe portfólio"
        const savedTheme = localStorage.getItem('theme') || 'dark'; 
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        
        const savedParticipants = JSON.parse(localStorage.getItem('participants'));
        if (savedParticipants && savedParticipants.length > 0) {
            participants = savedParticipants;
            renderParticipants();
        }
    }

    function renderParticipants() {
        participantsListEl.innerHTML = '';
        if (participants.length === 0) {
            participantsListEl.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.4; font-weight: 400; width: 100%;">Nenhum participante adicionado.</p>';
        } else {
            participants.forEach((participant, index) => {
                const tag = document.createElement('div');
                tag.className = 'participant-tag';
                tag.innerHTML = `<span>${participant}</span><button data-index="${index}"><i class="fas fa-times"></i></button>`;
                participantsListEl.appendChild(tag);
            });
        }
        localStorage.setItem('participants', JSON.stringify(participants));
    }

    function clearAllParticipants() {
        if (confirm('Tem certeza que deseja remover TODOS os participantes da lista?')) {
            participants = [];
            localStorage.removeItem('participants');
            renderParticipants();
        }
    }

    function addParticipants() {
        const input = nameInput.value.trim();
        if (input) {
            const newNames = input.split(/[,\n]+/).map(name => name.trim()).filter(name => name && !participants.includes(name));
            participants.push(...newNames);
            nameInput.value = '';
            renderParticipants();
        }
    }

    function removeParticipant(index) {
        participants.splice(index, 1);
        renderParticipants();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function startCountdown() {
        if (participants.length < 2) {
            alert('Adicione pelo menos dois participantes para o sorteio!');
            return;
        }
        container.classList.add('results-view');
        orderBtn.style.display = 'none'; 
        
        let count = 3;
        countdownEl.innerHTML = `> PROCESSANDO... ${count}`; // Toque dev no texto
        const interval = setInterval(() => {
            count--;
            countdownEl.innerHTML = `> PROCESSANDO... ${count}`;
            if (count === 0) {
                clearInterval(interval);
                countdownEl.innerHTML = '';
                drawWinnerWithRoulette();
            }
        }, 1000);
    }

    function drawWinnerWithRoulette() {
        const animationDuration = 3000;
        const spinInterval = 75;
        let rouletteInterval;
        const shuffledForRoulette = shuffleArray([...participants]);
        let currentIndex = 0;
        
        rouletteInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % shuffledForRoulette.length;
            winnerEl.innerHTML = `<strong>${shuffledForRoulette[currentIndex]}</strong>`;
        }, spinInterval);
        
        setTimeout(() => {
            clearInterval(rouletteInterval);
            sortedParticipants = shuffleArray([...participants]);
            const finalWinner = sortedParticipants[0];
            winnerEl.innerHTML = `🏆 Vencedor(a): <strong>${finalWinner}</strong>`;
            
            // Confetes agora com a paleta de cores Verde Cyber/Menta
            confetti({ 
                particleCount: 150, 
                spread: 100, 
                origin: { y: 0.6 },
                colors: ['#00ff88', '#00cc6a', '#34d399', '#ffffff'] 
            });
            
            orderBtn.style.display = sortedParticipants.length > 1 ? 'flex' : 'none';
        }, animationDuration);
    }

    function openRankingModal() {
        rankingListModal.innerHTML = ''; 
        for (let i = 0; i < sortedParticipants.length; i++) {
            const li = document.createElement('li');
            const place = i === 0 ? '🏆' : `${i + 1}º`;
            li.innerHTML = `<strong style="color: var(--primary-color)">[${place}]</strong> ${sortedParticipants[i]}`;
            rankingListModal.appendChild(li);
        }
        rankingModal.classList.add('active'); 
    }

    function closeRankingModal() {
        rankingModal.classList.remove('active'); 
    }

    function downloadResults() {
        let text = `=========================\n🏆 VENCEDOR: ${sortedParticipants[0]}\n=========================\n\n--- Ranking Completo ---\n`;
        sortedParticipants.forEach((participant, index) => {
            text += `[${index + 1}º] ${participant}\n`;
        });
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'resultado_sorteio.txt';
        link.click();
    }
    
    function newSweepstakes() {
        if (confirm('Deseja iniciar um NOVO SORTEIO? A lista de participantes será limpa.')) {
            participants = [];
            localStorage.removeItem('participants');
            renderParticipants();
            
            sortedParticipants = [];
            container.classList.remove('results-view');
            winnerEl.innerHTML = '';
        }
    }

    // --- Event Listeners ---
    addBtn.addEventListener('click', addParticipants);
    drawBtn.addEventListener('click', startCountdown);
    clearBtn.addEventListener('click', clearAllParticipants);
    downloadBtn.addEventListener('click', downloadResults);
    restartBtn.addEventListener('click', newSweepstakes);
    
    orderBtn.addEventListener('click', openRankingModal);
    modalCloseBtn.addEventListener('click', closeRankingModal);
    rankingModal.addEventListener('click', (e) => {
        if (e.target === rankingModal) {
            closeRankingModal();
        }
    });

    participantsListEl.addEventListener('click', (e) => {
        if (e.target.closest('button')) {
            const index = e.target.closest('button').dataset.index;
            removeParticipant(parseInt(index, 10));
        }
    });

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // --- Inicialização ---
    initializeApp();
});
