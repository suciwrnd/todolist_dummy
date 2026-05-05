let quests = [];

// Quest configuration based on Rank
const rankConfig = {
    'E': { xp: 10, damage: 20, badgeClass: 'badge-rank-e' },
    'C': { xp: 30, damage: 50, badgeClass: 'badge-rank-c' },
    'S': { xp: 100, damage: 150, badgeClass: 'badge-rank-s' }
};

function initQuests() {
    const savedQuests = localStorage.getItem('questlog_quests');
    if (savedQuests) {
        quests = JSON.parse(savedQuests);
    }
    renderQuests();

    // Event listener for adding a quest
    const form = document.getElementById('addQuestForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('questTitle').value;
            const rank = document.getElementById('questRank').value;
            const category = document.getElementById('questCategory') ? document.getElementById('questCategory').value : 'Other';
            const deadline = document.getElementById('questDeadline') ? document.getElementById('questDeadline').value : '';
            
            addQuest(title, rank, category, deadline);
            
            // Hide modal
            const modalEl = document.getElementById('addQuestModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            form.reset();
        });
    }
}

function addQuest(title, rank, category, deadline) {
    const newQuest = {
        id: Date.now().toString(),
        title: title,
        rank: rank,
        category: category,
        deadline: deadline,
        completed: false
    };
    quests.push(newQuest);
    saveQuests();
    renderQuests();
}

function completeQuest(id, btnElement) {
    const questIndex = quests.findIndex(q => q.id === id);
    if (questIndex !== -1 && !quests[questIndex].completed) {
        
        // Visual transition before actual completion
        if (btnElement) {
            btnElement.classList.add('completed');
            btnElement.innerHTML = `<i class="fa-solid fa-check"></i>`;
            btnElement.closest('.task-item').classList.add('completed');
        }

        setTimeout(() => {
            // Mark as completed
            quests[questIndex].completed = true;
            const rank = quests[questIndex].rank;
            const config = rankConfig[rank];

            // Apply Game Logic
            addXp(config.xp);
            dealDamageToBoss(config.damage);
            
            // Update mascot message
            const mascot = document.getElementById('mascotMessage');
            if(mascot) mascot.innerText = `Great strike! You dealt ${config.damage} damage to the Boss!`;
            
            // Update boss dialog taunt
            const bossDialog = document.getElementById('bossDialogMessage');
            if(bossDialog) bossDialog.innerText = "Aargh! Your productivity is burning me!";

            saveQuests();
            renderQuests();
        }, 400); // 400ms delay to show the checkmark effect before re-rendering
    }
}

function deleteQuest(id) {
    quests = quests.filter(q => q.id !== id);
    saveQuests();
    renderQuests();
}

function saveQuests() {
    localStorage.setItem('questlog_quests', JSON.stringify(quests));
}

function renderQuests() {
    const list = document.getElementById('questList');
    if (!list) return;

    list.innerHTML = '';
    
    const activeQuests = quests.filter(q => !q.completed);
    
    if (activeQuests.length === 0) {
        list.innerHTML = `<div class="text-center text-secondary py-4" id="emptyQuestMsg">No active quests. Add a new quest to begin the raid!</div>`;
        return;
    }

    activeQuests.forEach(quest => {
        const config = rankConfig[quest.rank];
        const category = quest.category || 'Other';
        
        let deadlineHtml = '';
        if (quest.deadline) {
            const d = new Date(quest.deadline);
            const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            deadlineHtml = `<span class="badge bg-dark border border-danger text-danger ms-2"><i class="fa-regular fa-clock me-1"></i> ${dateStr}</span>`;
        }

        // Create element
        const div = document.createElement('div');
        div.className = 'task-item fade-in';
        div.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <button class="btn-checklist" onclick="completeQuest('${quest.id}', this)" title="Complete Quest">
                    <i class="fa-regular fa-circle"></i>
                </button>
                <div>
                    <div class="mb-1">
                        <span class="badge badge-category me-1">${category}</span>
                        <span class="badge ${config.badgeClass} me-1">Rank ${quest.rank}</span>
                        ${deadlineHtml}
                    </div>
                    <span class="text-white task-title fw-bold fs-5">${quest.title}</span>
                    <div class="small text-secondary mt-1">Reward: ${config.xp} XP | Damage: ${config.damage}</div>
                </div>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteQuest('${quest.id}')" title="Delete Quest">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        list.appendChild(div);
    });
}
