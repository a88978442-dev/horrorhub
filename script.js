// =========================
// 1. 게임 데이터
// =========================

const games = [
    {
        title: "아웃라스트",
        tag: "심리적 압박",
        tags: ["점프스케어", "심리적 압박"],
        link: "https://store.steampowered.com/app/238320/Outlast/"
        image: "image/outlast.jpg"
    },
    {
        title: "레지던트 이블",
        tag: "좀비",
        tags: ["점프스케어", "고어"],
        link: "https://www.residentevil.com/"
        image: "image/ResidentEvil.png"
    },
    {
        title: "암네시아",
        tag: "코즈믹 호러",
        tags: ["심리적 압박"],
        link: "https://store.steampowered.com/app/57300/Amnesia_The_Dark_Descent/"
        image: "image/Amnesia.jpg"
    }
];


// =========================
// 2. 홈 게임 카드 렌더링
// =========================

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('popular-games');

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        card.innerHTML = `
    <img
        src="${game.image}"
        alt="${game.title}"
        style="width:100%; height:200px; object-fit:cover;"
    >

    <div style="padding:15px;">
        <h3>${game.title}</h3>
        <p style="color:#888; font-size:0.8rem;">#${game.tag}</p>
    </div>
`;

        card.style.cursor = 'pointer';

        card.addEventListener('click', () => {
            window.open(game.link, '_blank');
        });

        grid.appendChild(card);
    });
});


// =========================
// 3. 페이지 전환
// =========================

function showPage(pageId) {

    const pages = ['home-page', 'recommend-page', 'minigame-page'];

    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (id === pageId + '-page') ? 'block' : 'none';
        }
    });

    if (pageId === 'minigame') {
        startGame();
    } else {
        gameActive = false;
    }
}


// =========================
// 3-1. 게임 추천
// =========================

function recommendGame() {

    const likes = [...document.querySelectorAll('.like-filter:checked')]
        .map(el => el.value);

    const hates = [...document.querySelectorAll('.hate-filter:checked')]
        .map(el => el.value);

    if (likes.some(item => hates.includes(item))) {
        alert("같은 요소를 좋아함과 싫어함에 동시에 선택할 수 없습니다.");
        return;
    }

    let bestGame = null;
    let bestScore = -999;

    games.forEach(game => {
        let score = 0;

        game.tags.forEach(tag => {
            if (likes.includes(tag)) score += 2;
            if (hates.includes(tag)) score -= 3;
        });

        if (score > bestScore) {
            bestScore = score;
            bestGame = game;
        }
    });

    const result = document.getElementById('recommend-result');

    result.innerHTML = `
        <h3>추천 게임: ${bestGame.title}</h3>
        <button id="go-game" class="btn-main">게임 페이지로 이동</button>
    `;

    document.getElementById('go-game').addEventListener('click', () => {
        window.open(bestGame.link, '_blank');
    });
}


// =========================
// 4. 게임 상태
// =========================

let canvas = document.getElementById('gameCanvas');
let ctx = canvas ? canvas.getContext('2d') : null;

let player, enemy, goal;
let keys = {};

let isGameOver = false;
let gameActive = false;


// =========================
// 5. 게임 시작 / 리셋
// =========================

function startGame() {
    gameActive = true;
    isGameOver = false;

    player = { x: 50, y: 50, size: 20, speed: 4 };
    enemy = { x: 550, y: 50, size: 22, speed: 1.8 };
    goal = { x: 550, y: 350, size: 30 };
}

function resetGame() {
    isGameOver = false;
    gameActive = false;
}


// =========================
// 6. 입력
// =========================

window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});


// =========================
// 7. 게임 업데이트
// =========================

function update() {
    if (!gameActive || isGameOver) return;

    // 플레이어 이동
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // AI 추적
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);

    const angle = Math.atan2(dy, dx);

    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    // 충돌
    if (dist < 20) {
        triggerJumpScare();
    }

    // 탈출 성공
    if (Math.hypot(player.x - goal.x, player.y - goal.y) < 30) {
        alert("탈출 성공...");
        showPage('home');
        resetGame();
    }
}


// =========================
// 8. 그리기
// =========================

function draw() {
    if (!gameActive) return;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // goal
    ctx.fillStyle = '#440000';
    ctx.fillRect(goal.x, goal.y, goal.size, goal.size);

    // enemy
    ctx.fillStyle = 'red';
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

    // player
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}


// =========================
// 9. 깜작 놀래키는 장면
// =========================

function triggerJumpScare() {
    if (isGameOver) return;

    isGameOver = true;

    const overlay = document.getElementById('scareOverlay');
    if (overlay) overlay.style.display = 'flex';

    canvas.classList.add('shake');

    setTimeout(() => {
        if (overlay) overlay.style.display = 'none';

        canvas.classList.remove('shake');

        resetGame();
        showPage('home');

    }, 2000);
}


// =========================
// 10. 게임 루프
// =========================

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
