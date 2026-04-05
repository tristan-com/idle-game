let cookies = 0;
let autoClickers = 0;
let autoClickerCost = 10;
let grandmas = 0;
let grandmaCost = 50;
let cookiesPerSecond = 0;
let totalCookies = 0;
let totalClicks = 0;
let prestigePoints = 0;
let prestigeMultiplier = 1;
let farms = 0;
let farmCost = 250;
let factories = 0;
let factoryCost = 1500;

const achievements = [
    {
        id: "first_click",
        title: "First Click",
        description: "Click the cookie once.",
        unlocked: false,
        check: () => totalClicks >= 1
    },
    {
        id: "cookie_hundred",
        title: "Cookie Starter",
        description: "Reach 100 total cookies.",
        unlocked: false,
        check: () => totalCookies >= 100
    },
    {
        id: "cookie_thousand",
        title: "Cookie Builder",
        description: "Reach 1000 total cookies.",
        unlocked: false,
        check: () => totalCookies >= 1000
    },
    {
        id: "auto_clicker_owner",
        title: "Automation Begins",
        description: "Own 1 Auto Clicker.",
        unlocked: false,
        check: () => autoClickers >= 1
    },
    {
        id: "grandma_owner",
        title: "Grandma Knows Best",
        description: "Own 1 Grandma.",
        unlocked: false,
        check: () => grandmas >= 1
    },
    {
        id: "farm_owner",
        title: "Small Farm",
        description: "Own 1 Farm.",
        unlocked: false,
        check: () => farms >= 1
    },
    {
        id: "factory_owner",
        title: "Industrial Age",
        description: "Own 1 Factory.",
        unlocked: false,
        check: () => factories >= 1
    },
    {
        id: "prestige_once",
        title: "New Beginning",
        description: "Prestige at least once.",
        unlocked: false,
        check: () => prestigePoints >= 1
    }
];

function showModal(title, message) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("modalOverlay").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modalOverlay").classList.add("hidden");
}

// Load saved data
function loadGame() {
    const savedData = localStorage.getItem("idleGame");

    if (savedData) {
        const data = JSON.parse(savedData);

        cookies = data.cookies || 0;
        autoClickers = data.autoClickers || 0;
        autoClickerCost = data.autoClickerCost || 10;
        grandmas = data.grandmas || 0;
        grandmaCost = data.grandmaCost || 50;
        farms = data.farms || 0;
        farmCost = data.farmCost || 250;
        factories = data.factories || 0;
        factoryCost = data.factoryCost || 1500;
        totalCookies = data.totalCookies || 0;
        totalClicks = data.totalClicks || 0;
        prestigePoints = data.prestigePoints || 0;

        prestigeMultiplier = 1 + prestigePoints * 0.1;

        if (data.achievements) {
            achievements.forEach(achievement => {
                const savedAchievement = data.achievements.find(a => a.id === achievement.id);
                if (savedAchievement) {
                    achievement.unlocked = savedAchievement.unlocked;
                }
            });
        }

        if (data.lastPlayed) {
            const now = Date.now();
            const rawTimeAwaySeconds = Math.floor((now - data.lastPlayed) / 1000);
            const timeAwaySeconds = Math.min(rawTimeAwaySeconds, 8 * 60 * 60);

            const currentProduction =
                (autoClickers * 1 +
                 grandmas * 5 +
                 farms * 25 +
                 factories * 120) * prestigeMultiplier;

            const offlineEarnings = timeAwaySeconds * currentProduction;

            if (offlineEarnings > 0) {
                cookies += offlineEarnings;
                totalCookies += offlineEarnings;

                setTimeout(() => {
                    showModal(
                        "Welcome back!",
                        "You were away for " +
                        timeAwaySeconds +
                        " seconds and earned " +
                        offlineEarnings.toFixed(1) +
                        " cookies."
                    );
                }, 200);
            }
        }
    }
}

// Save game
function saveGame() {
    const data = {
        cookies,
        autoClickers,
        autoClickerCost,
        grandmas,
        grandmaCost,
        farms,
        farmCost,
        factories,
        factoryCost,
        totalCookies,
        totalClicks,
        prestigePoints,
        achievements: achievements.map(a => ({
            id: a.id,
            unlocked: a.unlocked
        })),
        lastPlayed: Date.now()
    };

    localStorage.setItem("idleGame", JSON.stringify(data));
}

// How many prestige points player would gain now
function calculatePrestigeGain() {
    return Math.floor(totalCookies / 1000);
}

// Manual click
function clickCookie() {
    const clickValue = prestigeMultiplier;

    cookies += clickValue;
    totalCookies += clickValue;
    totalClicks++;

    animateClick();
    createFloatingText("+" + clickValue.toFixed(1));

    updateUI();
}

// Buy auto clicker
function buyAutoClicker() {
    if (cookies >= autoClickerCost) {
        cookies -= autoClickerCost;
        autoClickers++;
        autoClickerCost = Math.floor(autoClickerCost * 1.15);
        updateUI();
    }
}

// Buy grandma
function buyGrandma() {
    if (cookies >= grandmaCost) {
        cookies -= grandmaCost;
        grandmas++;
        grandmaCost = Math.floor(grandmaCost * 1.18);
        updateUI();
    }
}

// Buy farm
function buyFarm() {
    if (cookies >= farmCost) {
        cookies -= farmCost;
        farms++;
        farmCost = Math.floor(farmCost * 1.22);
        updateUI();
    }
}

// Buy factory
function buyFactory() {
    if (cookies >= factoryCost) {
        cookies -= factoryCost;
        factories++;
        factoryCost = Math.floor(factoryCost * 1.25);
        updateUI();
    }
}

// Normal reset
function resetGame() {
    const confirmed = confirm("Are you sure you want to reset your progress?");

    if (confirmed) {
        cookies = 0;
        autoClickers = 0;
        autoClickerCost = 10;
        grandmas = 0;
        grandmaCost = 50;
        cookiesPerSecond = 0;
        totalCookies = 0;
        totalClicks = 0;
        prestigePoints = 0;
        prestigeMultiplier = 1;
        farms = 0;
        farmCost = 250;
        factories = 0;
        factoryCost = 1500;

        achievements.forEach(achievement => {
            achievement.unlocked = false;
        });

        localStorage.removeItem("idleGame");
        updateUI();
    }
}

// Prestige reset
function prestigeReset() {
    const gain = calculatePrestigeGain();

    if (gain <= 0) {
        showModal(
            "Prestige Locked",
            "You need at least 1000 total cookies to gain prestige."
        );
        return;
    }

    const confirmed = confirm(
        "Prestige will reset your cookies and upgrades, but you will gain " +
        gain +
        " prestige point(s). Continue?"
    );

    if (confirmed) {
        prestigePoints += gain;
        prestigeMultiplier = 1 + prestigePoints * 0.1;

        cookies = 0;
        autoClickers = 0;
        autoClickerCost = 10;
        grandmas = 0;
        grandmaCost = 50;
        cookiesPerSecond = 0;
        totalCookies = 0;
        totalClicks = 0;
        farms = 0;
        farmCost = 250;
        factories = 0;
        factoryCost = 1500;

        saveGame();
        updateUI();
    }
}

// Click animation
function animateClick() {
    const btn = document.getElementById("cookieBtn");

    btn.classList.add("clicked");

    setTimeout(() => {
        btn.classList.remove("clicked");
    }, 100);
}

// Floating text effect
function createFloatingText(text) {
    const container = document.getElementById("floating-container");

    const el = document.createElement("div");
    el.className = "floating-text";
    el.innerText = text;

    container.appendChild(el);

    setTimeout(() => {
        if (container.contains(el)) {
            container.removeChild(el);
        }
    }, 1000);
}

function renderAchievements() {
    const list = document.getElementById("achievementsList");
    list.innerHTML = "";

    achievements.forEach(achievement => {
        const card = document.createElement("div");
        card.className = "achievement-card" + (achievement.unlocked ? " unlocked" : "");

        card.innerHTML = `
            <span class="achievement-title">${achievement.title}</span>
            <span class="achievement-description">${achievement.description}</span>
        `;

        list.appendChild(card);
    });
}

function checkAchievements() {
    let changed = false;

    achievements.forEach(achievement => {
        if (!achievement.unlocked && achievement.check()) {
            achievement.unlocked = true;
            changed = true;
        }
    });

    if (changed) {
        renderAchievements();
        saveGame();
    }
}

// Idle income
setInterval(() => {
    cookiesPerSecond =
        (autoClickers * 1 +
        grandmas * 5 +
        farms * 25 +
        factories * 120) * prestigeMultiplier;
    cookies += cookiesPerSecond;
    totalCookies += cookiesPerSecond;
    updateUI();
}, 1000);

// Auto-save every 5 seconds
setInterval(() => {
    saveGame();
}, 5000);

// Update interface
function updateUI() {
    cookiesPerSecond =
        (autoClickers * 1 +
        grandmas * 5 +
        farms * 25 +
        factories * 120) * prestigeMultiplier;

    document.getElementById("counter").innerText =
        cookies.toFixed(1) + " cookies (+" + cookiesPerSecond.toFixed(1) + "/sec)";

    document.getElementById("autoCount").innerText = autoClickers;
    document.getElementById("autoCost").innerText = autoClickerCost;

    document.getElementById("grandmaCount").innerText = grandmas;
    document.getElementById("grandmaCost").innerText = grandmaCost;

    document.getElementById("farmCount").innerText = farms;
    document.getElementById("farmCost").innerText = farmCost;

    document.getElementById("factoryCount").innerText = factories;
    document.getElementById("factoryCost").innerText = factoryCost;

    document.getElementById("totalCookies").innerText = totalCookies.toFixed(1);
    document.getElementById("cookiesPerSecond").innerText = cookiesPerSecond.toFixed(1);
    document.getElementById("totalClicks").innerText = totalClicks;
    document.getElementById("totalProducers").innerText = autoClickers + grandmas + farms + factories;

    document.getElementById("prestigePoints").innerText = prestigePoints;
    document.getElementById("prestigeBonus").innerText = prestigeMultiplier.toFixed(1);
    document.getElementById("prestigeGain").innerText = calculatePrestigeGain();

    checkAchievements();
}

window.addEventListener("beforeunload", () => {
    saveGame();
});

// Start game
loadGame();
renderAchievements();
updateUI();