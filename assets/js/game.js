// --- DEFAULT CONSTANTS ---
const MAX_HP = 100;
const BASE_XP_REQ = 100;
const BOSS_BASE_HP = 500;

// --- INITIAL STATE ---
let gameState = {
    level: 1,
    xp: 0,
    hp: 100,
    gold: 0,
    bossHp: 500,
    bossMaxHp: 500,
    bossLevel: 1,
    inventory: []
};

function getSaveKey() {
    const user = sessionStorage.getItem('questlog_user') || 'guest';
    return `questlog_gamestate_${user}`;
}

// --- INITIALIZATION ---
function initGame() {
    const savedState = localStorage.getItem(getSaveKey());
    if (savedState) {
        gameState = JSON.parse(savedState);
    }
    updateUI();
    renderInventory();
}

function saveGame() {
    localStorage.setItem(getSaveKey(), JSON.stringify(gameState));
    updateUI();
}

// --- CORE MECHANICS ---
function addXp(amount) {
    gameState.xp += amount;
    const reqXp = getRequiredXp(gameState.level);
    
    if (gameState.xp >= reqXp) {
        // Level up
        gameState.level++;
        gameState.xp = gameState.xp - reqXp; // carry over
        gameState.hp = MAX_HP; // heal on level up
        
        // Notify
        const mascot = document.getElementById('mascotMessage');
        if(mascot) mascot.innerText = `Incredible! You reached Level ${gameState.level}! HP restored.`;
    }
}

function getRequiredXp(level) {
    return BASE_XP_REQ * level;
}

function takeDamagePlayer(amount) {
    gameState.hp -= amount;
    
    // Shake screen/bar effect
    const hpBar = document.getElementById('playerHpBar');
    if (hpBar) {
        hpBar.classList.remove('shake');
        void hpBar.offsetWidth; // reflow
        hpBar.classList.add('shake');
        hpBar.classList.add('bg-danger');
        setTimeout(() => { hpBar.classList.remove('bg-danger'); }, 500);
    }

    if (gameState.hp <= 0) {
        gameState.hp = MAX_HP; // Revive
        const goldLoss = Math.floor(gameState.gold * 0.5); // Lose 50% gold
        gameState.gold -= goldLoss;
        
        const mascot = document.getElementById('mascotMessage');
        if(mascot) mascot.innerText = `You collapsed from exhaustion! You lost ${goldLoss} Gold.`;
        alert(`You ran out of Energy and collapsed! You lost ${goldLoss} Gold.`);
    } else {
        const mascot = document.getElementById('mascotMessage');
        if(mascot) mascot.innerText = `Ouch! You lost ${amount} Energy!`;
    }
    
    saveGame();
}

function dealDamageToBoss(amount) {
    gameState.bossHp -= amount;
    
    // Shake animation
    const bossImg = document.getElementById('bossImage');
    if (bossImg) {
        bossImg.classList.remove('shake');
        void bossImg.offsetWidth; // trigger reflow
        bossImg.classList.add('shake');
    }

    // Slash Effect Animation
    const slash = document.getElementById('slashEffect');
    if (slash) {
        slash.classList.remove('animate-slash');
        void slash.offsetWidth; // reflow
        slash.classList.add('animate-slash');
    }

    if (gameState.bossHp <= 0) {
        gameState.bossHp = 0;
        showVictoryModal();
    }
    saveGame();
}

// --- VICTORY & LOOT ---
function showVictoryModal() {
    const modal = new bootstrap.Modal(document.getElementById('victoryModal'));
    modal.show();
}

function openLootBox() {
    // Hide modal
    const modalEl = document.getElementById('victoryModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    // Reward Logic
    const goldReward = Math.floor(Math.random() * 50) + 50 * gameState.bossLevel; // 50-100 base
    gameState.gold += goldReward;

    const items = ["Sword of Focus", "Shield of Discipline", "Amulet of Time", "Ring of Motivation"];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    
    gameState.inventory.push({
        name: `${randomItem} (Lvl ${gameState.bossLevel})`,
        icon: 'fa-khanda'
    });

    // Reset Boss
    gameState.bossLevel++;
    gameState.bossMaxHp = BOSS_BASE_HP + (gameState.bossLevel * 200);
    gameState.bossHp = gameState.bossMaxHp;

    const mascot = document.getElementById('mascotMessage');
    if(mascot) mascot.innerText = `Boss Defeated! You earned ${goldReward} Gold and a new item. A stronger boss appears!`;

    saveGame();
    renderInventory();
}

// --- SHOP ---
function buyItem(itemId, cost, healAmount) {
    if (gameState.gold >= cost) {
        if (gameState.hp >= MAX_HP) {
            alert("Your Energy is already full!");
            return;
        }
        
        gameState.gold -= cost;
        gameState.hp += healAmount;
        if (gameState.hp > MAX_HP) gameState.hp = MAX_HP;
        
        const mascot = document.getElementById('mascotMessage');
        if(mascot) mascot.innerText = `You bought a potion! Energy restored.`;
        
        saveGame();
    } else {
        alert("Not enough gold!");
    }
}

// --- UI UPDATES ---
function updateUI() {
    // Player Stats
    document.getElementById('playerLevel').innerText = gameState.level;
    document.getElementById('playerGold').innerText = gameState.gold;
    document.getElementById('shopGoldDisplay').innerText = gameState.gold;
    
    const reqXp = getRequiredXp(gameState.level);
    document.getElementById('playerXpText').innerText = `${gameState.xp} / ${reqXp}`;
    const xpPercent = (gameState.xp / reqXp) * 100;
    document.getElementById('playerXpBar').style.width = `${xpPercent}%`;

    document.getElementById('playerHpText').innerText = `${gameState.hp} / ${MAX_HP}`;
    const hpPercent = (gameState.hp / MAX_HP) * 100;
    document.getElementById('playerHpBar').style.width = `${hpPercent}%`;

    // Title mapping
    let title = "Novice Adventurer";
    if (gameState.level >= 5) title = "Seasoned Warrior";
    if (gameState.level >= 10) title = "Hero of Time";
    document.getElementById('playerTitle').innerText = title;

    // Boss Stats
    document.getElementById('bossLevel').innerText = gameState.bossLevel;
    document.getElementById('bossHpText').innerText = `${gameState.bossHp} / ${gameState.bossMaxHp}`;
    const bossHpPercent = (gameState.bossHp / gameState.bossMaxHp) * 100;
    document.getElementById('bossHpBar').style.width = `${bossHpPercent}%`;
}

function renderInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;

    if (gameState.inventory.length === 0) {
        list.innerHTML = `<div class="col-12 text-center text-secondary py-5" id="emptyInventoryMsg">Your inventory is empty. Defeat bosses to earn loot boxes!</div>`;
        return;
    }

    list.innerHTML = '';
    gameState.inventory.forEach(item => {
        list.innerHTML += `
            <div class="col-md-3 col-sm-6">
                <div class="card-custom p-3 text-center" style="background: #2a2a2a;">
                    <i class="fa-solid ${item.icon} text-warning fs-2 mb-2"></i>
                    <h6 class="mb-0 text-white">${item.name}</h6>
                </div>
            </div>
        `;
    });
}
