const games = [
    {
        id: 1,
        title: "레지던트 이블",
        tag: "좀비",
        tags: ["점프스케어", "고어"],
        link: "https://www.residentevil.com/"
    },
    {
        id: 2,
        title: "아웃라스트",
        tag: "심리적 압박",
        tags: ["점프스케어", "심리적 압박"],
        link: "https://store.steampowered.com/app/238320/Outlast/"
    },
    {
        id: 3,
        title: "암네시아",
        tag: "코즈믹 호러",
        tags: ["코즈믹 호러", "심리적 압박"],
        link: "https://store.steampowered.com/app/57300/Amnesia_The_Dark_Descent/"
    }
];

// 페이지 초기화 및 게임 리스트 렌더링
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('popular-games');

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        card.innerHTML = `
            <div style="height:200px; background:#333;"></div>
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

// 단순 페이지 전환 함수 (SPA 스타일)
function showPage(pageId) {
    const pages = ['home-page', 'recommend-page', 'minigame-page']; // 다른 페이지 아이디들도 추가 가능
    pages.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (id === pageId + '-page') ? 'block' : 'none';
        }
    });
    console.log(`${pageId} 페이지로 이동했습니다.`);
}

// 추천 게임 로직
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

    document.getElementById('recommend-result').innerHTML = `
        <h3>추천 게임: ${bestGame.title}</h3>
        <button id="go-game" class="btn-main">게임 페이지로 이동</button>
    `;

    document.getElementById('go-game').addEventListener('click', () => {
        window.open(bestGame.link, '_blank');
    });
}

/**
 * 공포 미니게임: 심야의 탈출
 * 기능: 손전등 시야, 추격자 AI, 점프스케어 시스템
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 1. 게임 상태 및 데이터 설정
let player = { x: 50, y: 50, size: 20, speed: 4 };
let enemy = { x: 550, y: 50, size: 22, speed: 1.8 };
let goal = { x: 550, y: 350, size: 30 };

let keys = {};
let isGameOver = false;
let showScare = false;
let shakeTime = 0;

// 2. 입력 이벤트 리스너
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// 3. 게임 로직 업데이트 함수
function update() {
    if (isGameOver) return;

    // 플레이어 이동
    if (keys['w'] && player.y > 0) player.y -= player.speed;
    if (keys['s'] && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys['a'] && player.x > 0) player.x -= player.speed;
    if (keys['d'] && player.x < canvas.width - player.size) player.x += player.speed;

    // 추격자 AI (플레이어를 향해 서서히 이동)
    const dx = (player.x + player.size/2) - (enemy.x + enemy.size/2);
    const dy = (player.y + player.size/2) - (enemy.y + enemy.size/2);
    const angle = Math.atan2(dy, dx);
    
    enemy.x += Math.cos(angle) * enemy.speed;
    enemy.y += Math.sin(angle) * enemy.speed;

    // 충돌 감지 (추격자에게 잡힘)
    const distToEnemy = Math.hypot(dx, dy);
    if (distToEnemy < 20) {
        triggerJumpScare();
    }

    // 승리 감지 (목표 지점 도달)
    const distToGoal = Math.hypot(player.x - goal.x, player.y - goal.y);
    if (distToGoal < 30) {
        alert("겨우 탈출했습니다... 하지만 뒤에서 발소리가 들립니다.");
        resetGame();
    }
}

// 4. 이벤트 연출 함수
function triggerJumpScare() {
    if (isGameOver) return;

    isGameOver = true;

    const overlay = document.getElementById('scareOverlay');
    overlay.style.display = 'flex';

    canvas.classList.add('shake');

    setTimeout(() => {
        overlay.style.display = 'none';
        canvas.classList.remove('shake');
        resetGame();
        showPage('home');
    }, 2000);
}

function resetGame() {
    player = { x: 50, y: 50, size: 20, speed: 4 };
    enemy = { x: 550, y: 50, size: 22, speed: 1.8 };
    isGameOver = false;
}

// 5. 그래픽 렌더링 함수
function draw() {
    // 배경 (어둠)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- 빛이 비치는 영역 내부 물체들 ---
    // (이 영역에 그려야 손전등 빛을 받을 때만 보입니다)
    
    // 목표 지점 (탈출구)
    ctx.fillStyle = '#440000';
    ctx.fillRect(goal.x, goal.y, goal.size, goal.size);

    // 추격자 (붉은 눈)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

    // 플레이어
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // 6. 손전등 마스크 효과 (Destination-In 활용)
    ctx.save();
    // 전체를 어둠으로 덮되, 플레이어 주변만 원형으로 잘라냄
    ctx.globalCompositeOperation = 'destination-in';
    const gradient = ctx.createRadialGradient(
        player.x + 10, player.y + 10, 10,  // 내경
        player.x + 20, player.y + 20, 100 // 외경 (빛의 범위)
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y + 10, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. 점프스케어 오버레이
 if (showScare) {

    // 캔버스 전체 어둡게
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // GIF 표시 (DOM으로 위에 띄움)
    const gif = document.getElementById('scareGif');
    gif.style.display = 'block';

    // 화면 흔들기 효과 (이미 쓰고 있으면 유지)
    canvas.classList.add('shake');

} 
else {

    // 평소에는 GIF 숨김
    document.getElementById('scareGif').style.display = 'none';
    canvas.classList.remove('shake');
}
}

// 8. 메인 게임 루프
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// 실행
gameLoop();