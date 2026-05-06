// konstanta default
const MAX_HP = 100;
const BASE_XP_REQ = 100;
const BOSS_BASE_HP = 500;

// kondisi awal
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

// inisialisasi
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

// xp
function addXp(amount) {
    gameState.xp += amount;

    // while loop untuk level naik satu per satu 
    let reqXp = getRequiredXp(gameState.level);
    while (gameState.xp >= reqXp && reqXp > 0) {
        gameState.level++;
        gameState.xp -= reqXp;
        gameState.hp = MAX_HP; // HP dipulihkan saat naik level

        // Notifikasi
        const mascot = document.getElementById('mascotMessage');
        if (mascot) mascot.innerText = `Luar biasa! Kamu mencapai Level ${gameState.level}! HP dipulihkan.`;

        // Hitung ulang XP yang dibutuhkan untuk level berikutnya
        reqXp = getRequiredXp(gameState.level);
    }
}

function getRequiredXp(level) {
    return BASE_XP_REQ * level;
}

function takeDamagePlayer(amount) {
    gameState.hp -= amount;

    // Efek guncangan layar
    const hpBar = document.getElementById('playerHpBar');
    if (hpBar) {
        hpBar.classList.remove('shake');
        void hpBar.offsetWidth; // reflow
        hpBar.classList.add('shake');
        hpBar.classList.add('bg-danger');
        setTimeout(() => { hpBar.classList.remove('bg-danger'); }, 500);
    }

    if (gameState.hp <= 0) {
        gameState.hp = MAX_HP; // Bangkit kembali
        const goldLoss = Math.floor(gameState.gold * 0.5); // Kehilangan 50% gold
        gameState.gold -= goldLoss;

        const mascot = document.getElementById('mascotMessage');
        if (mascot) mascot.innerText = `Kamu pingsan kelelahan! Kamu kehilangan ${goldLoss} Gold.`;
        alert(`Energi kamu habis dan kamu pingsan! Kamu kehilangan ${goldLoss} Gold.`);
    } else {
        const mascot = document.getElementById('mascotMessage');
        if (mascot) mascot.innerText = `Aduh! Kamu kehilangan ${amount} Energi!`;
    }

    saveGame();
}

function dealDamageToBoss(amount) {
    gameState.bossHp -= amount;

    // Animasi guncangan
    const bossImg = document.getElementById('bossImage');
    if (bossImg) {
        bossImg.classList.remove('shake');
        void bossImg.offsetWidth; // trigger reflow
        bossImg.classList.add('shake');
    }

    // Animasi Efek Tebasan
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

// --- kemenangan ---
function showVictoryModal() {
    const modal = new bootstrap.Modal(document.getElementById('victoryModal'));
    modal.show();
}

function openLootBox() {
    // Sembunyikan modal
    const modalEl = document.getElementById('victoryModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    // Logika Hadiah
    const goldReward = Math.floor(Math.random() * 50) + 50 * gameState.bossLevel; // base 50-100
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
    if (mascot) mascot.innerText = `Boss Dikalahkan! Kamu mendapat ${goldReward} Gold dan item baru. Boss yang lebih kuat muncul!`;

    saveGame();
    renderInventory();
}

// --- toko ---
function buyItem(itemId, cost, healAmount) {
    if (gameState.gold >= cost) {
        if (gameState.hp >= MAX_HP) {
            alert("Energi kamu sudah penuh!");
            return;
        }

        gameState.gold -= cost;
        gameState.hp += healAmount;
        if (gameState.hp > MAX_HP) gameState.hp = MAX_HP;

        const mascot = document.getElementById('mascotMessage');
        if (mascot) mascot.innerText = `Kamu membeli potion! Energi dipulihkan.`;

        saveGame();
    } else {
        alert("Gold tidak cukup!");
    }
}

// update ui (naik level)
function updateUI() {
    // Statistik Pemain
    document.getElementById('playerGold').innerText = gameState.gold;
    document.getElementById('shopGoldDisplay').innerText = gameState.gold;

    const reqXp = getRequiredXp(gameState.level);
    document.getElementById('playerXpText').innerText = `${gameState.xp} / ${reqXp}`;
    const xpPercent = (gameState.xp / reqXp) * 100;
    document.getElementById('playerXpBar').style.width = `${xpPercent}%`;

    document.getElementById('playerHpText').innerText = `${gameState.hp} / ${MAX_HP}`;
    const hpPercent = (gameState.hp / MAX_HP) * 100;
    document.getElementById('playerHpBar').style.width = `${hpPercent}%`;

    // Pemetaan gelar berdasarkan level
    let title = "Petualang Pemula";
    if (gameState.level >= 5) title = "Prajurit Berpengalaman";
    if (gameState.level >= 10) title = "Pahlawan Waktu";
    document.getElementById('playerTitle').innerText = title;

    // Statistik Boss
    document.getElementById('bossLevel').innerText = gameState.bossLevel;
    document.getElementById('bossHpText').innerText = `${gameState.bossHp} / ${gameState.bossMaxHp}`;
    const bossHpPercent = (gameState.bossHp / gameState.bossMaxHp) * 100;
    document.getElementById('bossHpBar').style.width = `${bossHpPercent}%`;
}

function renderInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;

    if (gameState.inventory.length === 0) {
        list.innerHTML = `<div class="col-12 text-center text-secondary py-5" id="emptyInventoryMsg">Inventaris kamu kosong. Kalahkan boss untuk mendapatkan loot box!</div>`;
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
