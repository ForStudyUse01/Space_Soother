// Enhanced Space Shooter Game in JavaScript (HTML5 Canvas)

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 30;
const PLAYER_SPEED = 5;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 15;
const BULLET_SPEED = 7;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const ENEMY_SPEED = 2;
const ENEMY_SPAWN_RATE = 30; // frames

// Enhanced game features
const MAX_AMMO = 30;
const MAX_HEALTH = 100;
const AMMO_REGEN_RATE = 60; // frames
const HEALTH_REGEN_RATE = 300; // frames
const PERK_DROP_RATE = 0.1; // 10% chance
const PERK_TYPES = ['health', 'ammo', 'speed', 'rapid_fire', 'grenade'];
const ENEMY_BULLET_SPEED = 4;
const ENEMY_BULLET_WIDTH = 5;
const ENEMY_BULLET_HEIGHT = 12;
const ENEMY_SHOOT_RATE = 120; // frames per enemy
const GRENADE_RADIUS = 80;
const GRENADE_MAX = 3;
const GRENADE_KILL_COUNT = 5;
const SPEED_BOOST_DURATION = 300; // frames (5 seconds)
const ENEMY_SHOOT_CHANCE = 0.4; // 40% of enemies can shoot

// Game state
let player, bullets, enemies, score, gameOver, keys, enemyTimer, animationId;
let perks, particles, ammoTimer, healthTimer;
let rapidFireActive = false;
let rapidFireTimer = 0;
let enemyBullets = [];
let grenadeCount = 0;
let speedBoostActive = false;
let speedBoostTimer = 0;

function resetGame() {
    player = {
        x: WIDTH / 2 - PLAYER_WIDTH / 2,
        y: HEIGHT - PLAYER_HEIGHT - 10,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        speed: PLAYER_SPEED,
        health: MAX_HEALTH,
        ammo: MAX_AMMO
    };
    bullets = [];
    enemies = [];
    perks = [];
    particles = [];
    enemyBullets = [];
    score = 0;
    gameOver = false;
    keys = {};
    enemyTimer = 0;
    ammoTimer = 0;
    healthTimer = 0;
    rapidFireActive = false;
    rapidFireTimer = 0;
    grenadeCount = 0;
    speedBoostActive = false;
    speedBoostTimer = 0;
}

function drawPlayer() {
    ctx.fillStyle = '#00f';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    if (speedBoostActive) {
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
    }
}

function drawBullets() {
    ctx.fillStyle = '#ff0';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemyBullets() {
    ctx.fillStyle = '#0ff';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = '#f00';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = '#800';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, enemy.height - 10);
        ctx.fillStyle = '#fff';
        ctx.fillRect(enemy.x + 15, enemy.y + 10, 10, 10);
        // Enemy health bar (always 1 hit)
        const barWidth = enemy.width;
        const barHeight = 5;
        const healthPerc = enemy.health / enemy.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x, enemy.y - 8, barWidth, barHeight);
        ctx.fillStyle = healthPerc > 0.6 ? '#0f0' : healthPerc > 0.3 ? '#ff0' : '#f00';
        ctx.fillRect(enemy.x, enemy.y - 8, barWidth * healthPerc, barHeight);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(enemy.x, enemy.y - 8, barWidth, barHeight);
        // Draw a small gun if this enemy can shoot
        if (enemy.canShoot) {
            ctx.fillStyle = '#0ff';
            ctx.fillRect(enemy.x + enemy.width/2 - 3, enemy.y + enemy.height, 6, 8);
        }
    });
}

function drawPerks() {
    perks.forEach(perk => {
        switch(perk.type) {
            case 'health': ctx.fillStyle = '#0f0'; break;
            case 'ammo': ctx.fillStyle = '#ff0'; break;
            case 'speed': ctx.fillStyle = '#0ff'; break;
            case 'rapid_fire': ctx.fillStyle = '#f0f'; break;
            case 'grenade': ctx.fillStyle = '#fa0'; break;
        }
        ctx.fillRect(perk.x, perk.y, perk.width, perk.height);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(perk.type.charAt(0).toUpperCase(), perk.x + perk.width/2, perk.y + perk.height/2 + 4);
    });
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
    });
    ctx.globalAlpha = 1;
}

function drawUI() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Ammo: ' + player.ammo + '/' + MAX_AMMO, 10, 60);
    ctx.fillText('Grenades: ' + grenadeCount + '/' + GRENADE_MAX, 10, 85);
    ctx.fillText('Health:', 10, 110);
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    const healthPercentage = player.health / MAX_HEALTH;
    ctx.fillStyle = '#333';
    ctx.fillRect(10, 120, healthBarWidth, healthBarHeight);
    ctx.fillStyle = healthPercentage > 0.6 ? '#0f0' : healthPercentage > 0.3 ? '#ff0' : '#f00';
    ctx.fillRect(10, 120, healthBarWidth * healthPercentage, healthBarHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 120, healthBarWidth, healthBarHeight);
    if (rapidFireActive) {
        ctx.fillStyle = '#0ff';
        ctx.fillText('RAPID FIRE!', WIDTH - 150, 30);
    }
    if (speedBoostActive) {
        ctx.fillStyle = '#0ff';
        ctx.fillText('SPEED BOOST!', WIDTH - 170, 60);
    }
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width < WIDTH) {
        player.x += player.speed;
    }
}

function shootBullet() {
    if (player.ammo > 0) {
        bullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2,
            y: player.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            speed: BULLET_SPEED
        });
        player.ammo--;
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: player.x + player.width / 2,
                y: player.y,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 2,
                life: 10,
                maxLife: 10,
                color: '#ff0'
            });
        }
    }
}

function throwGrenade() {
    if (grenadeCount > 0) {
        grenadeCount--;
        let sorted = enemies.slice().sort((a, b) => {
            let da = Math.hypot(a.x + a.width/2 - (player.x + player.width/2), a.y + a.height/2 - (player.y + player.height/2));
            let db = Math.hypot(b.x + b.width/2 - (player.x + player.width/2), b.y + b.height/2 - (player.y + player.height/2));
            return da - db;
        });
        let killed = 0;
        for (let i = 0; i < sorted.length && killed < GRENADE_KILL_COUNT; i++) {
            let enemy = sorted[i];
            let dist = Math.hypot(enemy.x + enemy.width/2 - (player.x + player.width/2), enemy.y + enemy.height/2 - (player.y + player.height/2));
            if (dist <= GRENADE_RADIUS) {
                for (let j = 0; j < 20; j++) {
                    particles.push({
                        x: enemy.x + enemy.width/2,
                        y: enemy.y + enemy.height/2,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 20,
                        maxLife: 20,
                        color: '#fa0'
                    });
                }
                enemies.splice(enemies.indexOf(enemy), 1);
                score++;
                killed++;
            }
        }
    }
}

function updateBullets() {
    bullets.forEach((bullet, i) => {
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    });
    bullets = bullets.filter(bullet => bullet.y + bullet.height > 0);
}

function updateEnemyBullets() {
    enemyBullets.forEach((bullet, i) => {
        bullet.y += bullet.speed;
        if (bullet.y > HEIGHT) {
            enemyBullets.splice(i, 1);
        }
    });
    enemyBullets = enemyBullets.filter(bullet => bullet.y <= HEIGHT);
}

function spawnEnemy() {
    // Only some enemies can shoot
    const canShoot = Math.random() < ENEMY_SHOOT_CHANCE;
    enemies.push({
        x: Math.random() * (WIDTH - ENEMY_WIDTH),
        y: -ENEMY_HEIGHT,
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        speed: ENEMY_SPEED,
        health: 1,
        maxHealth: 1,
        canShoot: canShoot,
        shootTimer: canShoot ? Math.floor(Math.random() * ENEMY_SHOOT_RATE) : null,
        maxBullets: canShoot ? 2 + Math.floor(Math.random() * 2) : 0 // 2 or 3 if can shoot, else 0
    });
}

function spawnPerk(x, y) {
    if (Math.random() < PERK_DROP_RATE) {
        const perkType = PERK_TYPES[Math.floor(Math.random() * PERK_TYPES.length)];
        perks.push({
            x: x,
            y: y,
            width: 20,
            height: 20,
            type: perkType,
            speed: 1
        });
    }
}

function updateEnemies() {
    enemies.forEach((enemy, i) => {
        enemy.y += enemy.speed;
        if (enemy.y > HEIGHT) {
            gameOver = true;
        }
        // Only shoot if this enemy can shoot
        if (enemy.canShoot) {
            let myBullets = enemyBullets.filter(b => b.owner === enemy).length;
            enemy.shootTimer--;
            if (enemy.shootTimer <= 0 && myBullets < enemy.maxBullets) {
                enemyBullets.push({
                    x: enemy.x + enemy.width / 2 - ENEMY_BULLET_WIDTH / 2,
                    y: enemy.y + enemy.height,
                    width: ENEMY_BULLET_WIDTH,
                    height: ENEMY_BULLET_HEIGHT,
                    speed: ENEMY_BULLET_SPEED,
                    owner: enemy
                });
                enemy.shootTimer = ENEMY_SHOOT_RATE + Math.floor(Math.random() * 60);
            }
        }
    });
    enemies = enemies.filter(enemy => enemy.y <= HEIGHT);
}

function updatePerks() {
    perks.forEach((perk, i) => {
        perk.y += perk.speed;
        if (perk.y > HEIGHT) {
            perks.splice(i, 1);
        }
    });
}

function updateParticles() {
    particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    });
}

function checkCollisions() {
    // Bullet-enemy collisions
    bullets.forEach((bullet, bi) => {
        enemies.forEach((enemy, ei) => {
            if (rectsCollide(bullet, enemy)) {
                bullets.splice(bi, 1);
                enemy.health--;
                for (let i = 0; i < 8; i++) {
                    particles.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height / 2,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        life: 15,
                        maxLife: 15,
                        color: '#f00'
                    });
                }
                if (enemy.health <= 0) {
                    enemies.splice(ei, 1);
                    score += 1;
                    spawnPerk(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                }
            }
        });
    });
    // Perk-player collisions
    perks.forEach((perk, i) => {
        if (rectsCollide(perk, player)) {
            applyPerk(perk.type);
            perks.splice(i, 1);
        }
    });
    // Enemy-player collisions
    enemies.forEach(enemy => {
        if (rectsCollide(enemy, player)) {
            player.health -= 20;
            if (player.health <= 0) {
                gameOver = true;
            }
        }
    });
    // Enemy bullet-player collisions
    enemyBullets.forEach((bullet, i) => {
        if (rectsCollide(bullet, player)) {
            player.health -= 10;
            enemyBullets.splice(i, 1);
            if (player.health <= 0) {
                gameOver = true;
            }
        }
    });
}

function applyPerk(perkType) {
    switch(perkType) {
        case 'health':
            player.health = Math.min(player.health + 30, MAX_HEALTH);
            break;
        case 'ammo':
            player.ammo = Math.min(player.ammo + 15, MAX_AMMO);
            break;
        case 'speed':
            speedBoostActive = true;
            speedBoostTimer = SPEED_BOOST_DURATION;
            player.speed = PLAYER_SPEED + 4;
            break;
        case 'rapid_fire':
            rapidFireActive = true;
            rapidFireTimer = 300; // 5 seconds at 60fps
            break;
        case 'grenade':
            grenadeCount = Math.min(grenadeCount + 1, GRENADE_MAX);
            break;
    }
}

function rectsCollide(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function drawGameOver() {
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = 'Score: ' + score;
}

function hideGameOver() {
    document.getElementById('gameOverScreen').style.display = 'none';
}

function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    updatePlayer();
    updateBullets();
    updateEnemyBullets();
    updateEnemies();
    updatePerks();
    updateParticles();
    updateAutoShoot();
    checkCollisions();
    ammoTimer++;
    healthTimer++;
    if (ammoTimer >= AMMO_REGEN_RATE && player.ammo < MAX_AMMO) {
        player.ammo++;
        ammoTimer = 0;
    }
    if (healthTimer >= HEALTH_REGEN_RATE && player.health < MAX_HEALTH) {
        player.health++;
        healthTimer = 0;
    }
    if (rapidFireActive) {
        rapidFireTimer--;
        if (rapidFireTimer <= 0) {
            rapidFireActive = false;
        }
    }
    if (speedBoostActive) {
        speedBoostTimer--;
        if (speedBoostTimer <= 0) {
            speedBoostActive = false;
            player.speed = PLAYER_SPEED;
        }
    }
    drawPlayer();
    drawBullets();
    drawEnemyBullets();
    drawEnemies();
    drawPerks();
    drawParticles();
    drawUI();
    enemyTimer++;
    if (enemyTimer >= ENEMY_SPAWN_RATE) {
        spawnEnemy();
        enemyTimer = 0;
    }
    if (!gameOver) {
        animationId = requestAnimationFrame(gameLoop);
    } else {
        drawGameOver();
        cancelAnimationFrame(animationId);
    }
}

// Keyboard events
window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' && !gameOver) {
        shootBullet();
    }
    if ((e.key === 'g' || e.key === 'G') && !gameOver) {
        throwGrenade();
    }
});
window.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// Auto-shooting for rapid fire
let autoShootTimer = 0;
function updateAutoShoot() {
    if (rapidFireActive && keys[' ']) {
        autoShootTimer++;
        if (autoShootTimer >= 5) {
            shootBullet();
            autoShootTimer = 0;
        }
    } else {
        autoShootTimer = 0;
    }
}

document.getElementById('restartBtn').addEventListener('click', () => {
    hideGameOver();
    resetGame();
    gameLoop();
});

// Start game
resetGame();
gameLoop(); 