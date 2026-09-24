const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function normalizeKey(input) {
    let key = Number.parseInt(input.value, 10);
    if (Number.isNaN(key)) key = 0;
    key = ((key % 26) + 26) % 26;
    input.value = key;
    return key;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function postJSON(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
}

function setBusy(button, busy, label) {
    if (!button) return;
    button.disabled = busy;
    button.dataset.original = button.dataset.original || button.querySelector("span")?.textContent || "";
    const text = button.querySelector("span:first-child");
    if (text) text.textContent = busy ? label : button.dataset.original;
}

async function runCipher(mode) {
    const message = $(`#${mode}-message`);
    const key = $(`#${mode}-key`);
    const output = $(`#${mode}-result`);
    const button = $(`#${mode}-run`);
    if (!message || !key || !output || !button) return;

    if (!message.value.trim()) {
        output.textContent = `Please enter ${mode === "encrypt" ? "a message" : "ciphertext"} first.`;
        output.classList.remove("muted-output");
        message.focus();
        return;
    }

    const normalized = normalizeKey(key);
    setBusy(button, true, mode === "encrypt" ? "Encrypting..." : "Decrypting...");
    try {
        const data = await postJSON(`/api/${mode}`, { text: message.value, key: normalized });
        output.textContent = data.result;
        output.classList.remove("muted-output");
        $(`#${mode}-key-readout`).textContent = `KEY ${String(normalized).padStart(2, "0")}`;
    } catch {
        output.textContent = "Something went wrong. Please try again.";
        output.classList.remove("muted-output");
    } finally {
        setBusy(button, false);
    }
}

$$('[data-target]').forEach((button) => {
    button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.target);
        if (!input) return;
        const step = Number(button.dataset.step);
        const value = Math.max(0, Math.min(25, normalizeKey(input) + step));
        input.value = value;
        const mode = input.id.startsWith("encrypt") ? "encrypt" : "decrypt";
        const readout = $(`#${mode}-key-readout`);
        if (readout) readout.textContent = `KEY ${String(value).padStart(2, "0")}`;
    });
});

$$('input[type="number"]').forEach((input) => {
    input.addEventListener("change", () => {
        const value = normalizeKey(input);
        const mode = input.id.startsWith("encrypt") ? "encrypt" : "decrypt";
        const readout = $(`#${mode}-key-readout`);
        if (readout) readout.textContent = `KEY ${String(value).padStart(2, "0")}`;
    });
});

if ($("#encrypt-run")) $("#encrypt-run").addEventListener("click", () => runCipher("encrypt"));
if ($("#decrypt-run")) $("#decrypt-run").addEventListener("click", () => runCipher("decrypt"));

async function runBruteForce() {
    const text = $("#attack-message")?.value || "";
    const panel = $("#brute-results");
    const status = $("#attack-status");
    const button = $("#attack-run");
    if (!panel || !status || !button) return;

    if (!text.trim()) {
        status.innerHTML = '<i></i> NO INPUT';
        panel.innerHTML = '<div class="empty-results"><span>!</span><p>Enter ciphertext first.</p></div>';
        return;
    }

    setBusy(button, true, "Testing...");
    status.innerHTML = '<i></i> TESTING';
    try {
        const data = await postJSON("/api/bruteforce", { text });
        panel.innerHTML = data.results.map((item) => `
            <div class="brute-row">
                <div class="brute-key">KEY ${String(item.key).padStart(2, "0")}</div>
                <div class="brute-text">${escapeHtml(item.text)}</div>
            </div>
        `).join("");
        status.innerHTML = '<i></i> 26 RESULTS';
    } catch {
        status.innerHTML = '<i></i> ERROR';
        panel.innerHTML = '<div class="empty-results"><span>!</span><p>Unable to run the analysis.</p></div>';
    } finally {
        setBusy(button, false);
    }
}

if ($("#attack-run")) $("#attack-run").addEventListener("click", runBruteForce);

$$('.copy-button').forEach((button) => {
    button.addEventListener("click", async () => {
        const target = document.getElementById(button.dataset.copy);
        if (!target) return;
        const text = target.textContent.trim();
        if (!text || text.includes("will appear here")) return;
        try {
            await navigator.clipboard.writeText(text);
            const old = button.textContent;
            button.textContent = "COPIED";
            setTimeout(() => { button.textContent = old; }, 1200);
        } catch {}
    });
});

const menuButton = $(".menu-button");
const mobileMenu = $(".mobile-menu");
if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
        const open = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!open));
        mobileMenu.classList.toggle("open", !open);
        mobileMenu.setAttribute("aria-hidden", String(open));
    });
    $$('.mobile-menu a').forEach((link) => link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        mobileMenu.classList.remove("open");
        mobileMenu.setAttribute("aria-hidden", "true");
    }));
}

// ---- Crypto Quest game ----
const gameState = {
    level: 1, xp: 0, streak: 0, bestStreak: 0, lives: 3, round: 0, correct: 0,
    total: 0, time: 30, timerId: null, challenge: null, hinted: false, boosted: false, locked: false,
    maxLevel: 3
};

function game$(id) { return document.getElementById(id); }
function pad2(n) { return String(n).padStart(2, "0"); }
function updateGameStats() {
    if (!game$("game-level")) return;
    game$("game-level").textContent = pad2(gameState.level);
    game$("game-xp").textContent = String(gameState.xp).padStart(3, "0");
    game$("game-streak").textContent = pad2(gameState.streak);
    game$("game-lives").textContent = "♥".repeat(gameState.lives) + "♡".repeat(3 - gameState.lives);
    game$("game-timer").textContent = gameState.time;
    if (game$("game-timer-near")) game$("game-timer-near").textContent = gameState.time;
    game$("game-round").textContent = pad2(gameState.round);
    const levelProgress = Math.min(100, ((gameState.level - 1) / (gameState.maxLevel - 1)) * 100);
    game$("game-progress").style.width = `${levelProgress}%`;
    renderMissionMap();
}
function showGamePanel(id) {
    ["game-start", "game-play", "game-over"].forEach((x) => game$(x)?.classList.toggle("hidden", x !== id));
}
function stopGameTimer() { if (gameState.timerId) clearInterval(gameState.timerId); gameState.timerId = null; }
function getLevelTime(level) {
    // The mission gets harder, but the player gets more breathing room: 23s at Level 1 → 43s at Level 5.
    return 18 + (level * 5);
}
function startGameTimer() {
    stopGameTimer();
    gameState.time = getLevelTime(gameState.level);
    gameState.boosted = false;
    updateGameStats();
    gameState.timerId = setInterval(() => {
        gameState.time -= 1; updateGameStats();
        if (gameState.time <= 0) finishGame(false, "Time's up.");
    }, 1000);
}
function reward(correct) {
    if (correct) {
        const speedBonus = Math.max(0, Math.floor(gameState.time / 5));
        const streakBonus = gameState.streak * 3;
        gameState.xp += 20 + speedBonus + streakBonus;
        gameState.streak += 1;
        gameState.bestStreak = Math.max(gameState.bestStreak, gameState.streak);
        gameState.correct += 1;
        if (gameState.correct % 3 === 0 && gameState.level < gameState.maxLevel) {
            gameState.level += 1;
            showLevelUp();
        }
    } else {
        gameState.lives -= 1; gameState.streak = 0;
    }
    gameState.total += 1;
    updateGameStats();
}
async function loadChallenge() {
    gameState.locked = false; gameState.hinted = false;
    game$("hint-text").textContent = "";
    game$("hint-cost").textContent = "10 XP";
    game$("feedback").className = "feedback";
    game$("feedback").textContent = "";
    game$("game-answer")?.classList.remove("wrong");
    const data = await postJSON("/api/game/challenge", { level: gameState.level });
    gameState.challenge = data;
    gameState.round += 1;
    game$("challenge-type").textContent = data.prompt.toUpperCase();
    game$("challenge-question").textContent = data.question;
    game$("challenge-subtext").textContent = data.subtext;
    game$("zone-chip").textContent = `ZONE ${pad2(gameState.level)} · ${getZoneName(gameState.level)}`;
    game$("objective-text").textContent = getObjective(data.mode, gameState.level);
    const choices = game$("choice-area");
    const textArea = game$("text-answer-area");
    if (data.mode === "encrypt") {
        choices.classList.add("hidden"); textArea.classList.remove("hidden");
        game$("game-answer").value = ""; setTimeout(() => game$("game-answer").focus(), 80);
    } else {
        textArea.classList.add("hidden"); choices.classList.remove("hidden");
        choices.innerHTML = data.options.map((option, i) => `<button class="choice-button" type="button" data-answer="${escapeHtml(option)}"><span>${String.fromCharCode(65+i)}</span>${escapeHtml(data.display_options[i])}</button>`).join("");
        $$(".choice-button").forEach(btn => btn.addEventListener("click", () => submitGameAnswer(btn.dataset.answer)));
    }
    startGameTimer(); updateGameStats();
}
async function submitGameAnswer(submitted) {
    if (gameState.locked || !gameState.challenge) return;
    gameState.locked = true; stopGameTimer();
    const data = await postJSON("/api/game/check", { answer: gameState.challenge.answer, submitted });
    const feedback = game$("feedback");
    reward(data.correct);
    if (data.correct) {
        feedback.className = "feedback success";
        feedback.innerHTML = `<strong>Correct!</strong> +XP · ${escapeHtml(gameState.challenge.explanation)}`;
        game$("challenge-question").classList.add("correct-flash");
    } else {
        feedback.className = "feedback error";
        feedback.innerHTML = `<strong>Not quite.</strong> ${escapeHtml(gameState.challenge.explanation)}`;
    }
    if (gameState.lives <= 0) { setTimeout(() => endGame(), 950); return; }
    if (data.correct && gameState.level === gameState.maxLevel && gameState.correct % 3 === 0) {
        setTimeout(() => endGame("You cleared all five levels and mastered the Caesar shift."), 950);
        return;
    }
    setTimeout(loadChallenge, 1100);
}
function getZoneName(level) {
    const zones = ["SIGNAL", "TRACE", "DECODE", "ARCHIVE", "VAULT"];
    return zones[Math.min(level - 1, zones.length - 1)];
}
function getObjective(mode, level) {
    const objectives = {
        decode: level >= 4 ? "Break the protected transmission." : "Intercept and decode the transmission.",
        key: level >= 3 ? "Trace the alphabet displacement." : "Identify the hidden shift key.",
        encrypt: level >= 4 ? "Forge a ciphertext that bypasses the scanner." : "Encode the message before the alarm fires."
    };
    return objectives[mode] || "Crack the cipher.";
}
function renderMissionMap() {
    const map = game$("map-nodes");
    if (!map) return;
    map.innerHTML = Array.from({length: gameState.maxLevel}, (_, i) => {
        const level = i + 1;
        const cls = level < gameState.level ? "cleared" : level === gameState.level ? "current" : "locked";
        return `<span class="map-node ${cls}" title="Level ${level}">${level}</span>`;
    }).join("");
}
function showLevelUp() {
    const panel = game$("challenge-question");
    if (!panel) return;
    panel.classList.remove("level-up-flash");
    void panel.offsetWidth;
    panel.classList.add("level-up-flash");
}
function finishGame(correct, message) {
    if (gameState.locked) return;
    gameState.locked = true; stopGameTimer();
    if (!correct) reward(false);
    endGame(message);
}
function endGame(message = "Quest complete.") {
    stopGameTimer();
    showGamePanel("game-over");
    const accuracy = gameState.total ? Math.round((gameState.correct / gameState.total) * 100) : 0;
    game$("final-xp").textContent = String(gameState.xp).padStart(3, "0");
    game$("final-rounds").textContent = gameState.total;
    game$("final-streak").textContent = gameState.bestStreak;
    game$("final-accuracy").textContent = `${accuracy}%`;
    const mastered = gameState.level >= gameState.maxLevel;
    game$("game-over-title").textContent = mastered ? "Vault breached." : (gameState.lives > 0 ? "Cipher unlocked." : "Out of lives.");
    game$("game-over-copy").textContent = message || (mastered ? "You reached the final zone and mastered the Caesar shift." : (gameState.lives > 0 ? "You trained your cipher skills. Push deeper into the vault." : "The vault held. Reset the mission and try a new route."));
    game$("vault-status").textContent = mastered ? "OPEN" : "LOCKED";
    game$("vault-copy").textContent = mastered ? "Cipher Master status achieved. The archive is yours." : `Reach Level 5. Current zone: ${getZoneName(gameState.level)}.`;
}
function startGame() {
    Object.assign(gameState, { level: 1, xp: 0, streak: 0, bestStreak: 0, lives: 3, round: 0, correct: 0, total: 0, time: getLevelTime(1), hinted: false, boosted: false, locked: false });
    renderMissionMap();
    showGamePanel("game-play"); updateGameStats(); loadChallenge();
}
if (game$("start-game")) game$("start-game").addEventListener("click", startGame);
if (game$("play-again")) game$("play-again").addEventListener("click", startGame);
if (game$("submit-text-answer")) game$("submit-text-answer").addEventListener("click", () => submitGameAnswer(game$("game-answer").value));
if (game$("game-answer")) game$("game-answer").addEventListener("keydown", e => { if (e.key === "Enter") submitGameAnswer(e.currentTarget.value); });
if (game$("hint-button")) game$("hint-button").addEventListener("click", () => {
    if (!gameState.challenge || gameState.hinted || gameState.xp < 10) return;
    gameState.xp -= 10; gameState.hinted = true; updateGameStats();
    const hint = gameState.challenge.mode === "key" ? `Hint: compare the first letters. The shift is ${gameState.challenge.key}.` : `Hint: the current shift is ${gameState.challenge.key}.`;
    game$("hint-text").textContent = hint;
    game$("hint-cost").textContent = "USED";
});
if (game$("boost-button")) game$("boost-button").addEventListener("click", () => {
    if (!gameState.challenge || gameState.boosted || gameState.xp < 15 || gameState.locked) return;
    gameState.xp -= 15; gameState.time += 10; gameState.boosted = true; updateGameStats();
    game$("hint-text").textContent = "Time boost activated: +10 seconds.";
    game$("boost-button").innerHTML = "+ TIME <span>USED</span>";
});

renderMissionMap();
