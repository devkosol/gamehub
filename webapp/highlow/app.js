// app.js

// =========================
// 1) BALANCE - INITIAL SETUP
// =========================
let balance = 100;
const balanceAmountEl = document.getElementById("balanceAmount");
function setBalance(newAmount) {
  balance = newAmount;
  balanceAmountEl.textContent = balance;
}

// =========================
// 2) GLOBAL HELPER FUNCTIONS
// =========================
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =========================
// 3) HIDDEN / SHOW / UPDATE FUNCTIONS
// =========================
function showElement(el) {
  el.classList.remove("hidden");
}
function hideElement(el) {
  el.classList.add("hidden");
}

// ============================
// 4) HIGH-LOW - STATE & ELEMENTS
// ============================
let hlBet = 0;
let hlInRound = false;
let hlCurrent = 0;
let hlStreak = 0;
let odds = {
  // Beispiel: Wahrscheinlichkeit von Gewinn = 0.48 (48%)
  hl: 0.48
};

// DOM-Elemente aus dem HTML holen
const hlSectionEl         = document.getElementById("hlSection");
const hlBetOptionsEl      = document.getElementById("hlBetOptions");
const hlSelectedBetEl     = document.getElementById("hlSelectedBet");
const hlStartBtn          = document.getElementById("hlStartBtn");
const hlGameAreaEl        = document.getElementById("hlGameArea");
const hlCurrentNumberEl   = document.getElementById("hlCurrentNumber");
const hlHigherBtn         = document.getElementById("hlHigherBtn");
const hlLowerBtn          = document.getElementById("hlLowerBtn");
const hlStreakEl          = document.getElementById("hlStreak");
const hlMultiplierEl      = document.getElementById("hlMultiplier");
const hlPotentialPayoutEl = document.getElementById("hlPotentialPayout");
const hlCashoutBtn        = document.getElementById("hlCashoutBtn");
const hlResultAreaEl      = document.getElementById("hlResultArea");
const hlResultMessageEl   = document.getElementById("hlResultMessage");
const hlRepeatBtn         = document.getElementById("hlRepeatBtn");
const hlDoubleBtn         = document.getElementById("hlDoubleBtn");
const hlNewBtn            = document.getElementById("hlNewBtn");

// ============================
// 5) NAVIGATION ZWISCHEN SPIELEN
// ============================
const hlMenuBtn = document.getElementById("hlMenuBtn");
hlMenuBtn.addEventListener("click", () => {
  // Alle Menü-Punkte außer dem geklickten ausblenden
  document.querySelectorAll(".menu-btn").forEach(btn => {
    if (btn !== hlMenuBtn) {
      hideElement(btn);
    }
  });
  // High-Low-Section einblenden
  showHLSection();
});

function showHLSection() {
  showElement(hlSectionEl);
}

// ==========================
// 6) HIGH-LOW: BET SELECTION
// ==========================
hlBetOptionsEl.addEventListener("click", (e) => {
  if (!e.target.classList.contains("bet-btn")) return;
  // Alte Selektion zurücksetzen
  document.querySelectorAll("#hlBetOptions .bet-btn").forEach(btn => {
    btn.classList.remove("selected");
  });
  e.target.classList.add("selected");

  const val = e.target.getAttribute("data-bet");
  if (val === "custom") {
    const userInput = parseInt(prompt("Enter custom bet (1–100):"), 10);
    if (!isNaN(userInput) && userInput > 0 && userInput <= balance) {
      hlBet = userInput;
    } else {
      alert("Ungültige Eingabe oder kein ausreichendes Guthaben.");
      hlBet = 0;
    }
  } else {
    hlBet = parseInt(val, 10);
  }
  hlSelectedBetEl.textContent = hlBet;
  hlStartBtn.disabled = (hlBet === 0 || hlBet > balance);
});

// ==========================
// 7) HIGH-LOW: START BUTTON
// ==========================
hlStartBtn.addEventListener("click", () => {
  if (hlBet <= 0 || hlBet > balance) return;
  hlInRound = true;
  hlStreak = 0;
  hideElement(hlBetOptionsEl.parentElement);
  hideElement(hlStartBtn);
  hideElement(hlSelectedBetEl.parentElement);
  hideElement(hlResultAreaEl);
  showElement(hlGameAreaEl);

  // Erstes Random-Start: Zahl zwischen 0–10
  hlCurrent = randomInt(0, 10);
  hlCurrentNumberEl.textContent = hlCurrent;
  hlStreakEl.textContent = hlStreak;
  hlMultiplierEl.textContent = "0";
  hlPotentialPayoutEl.textContent = "0";
  hlCashoutBtn.disabled = true;
});

// =================================
// 8) HIGH-LOW: PROCESS GUESS (AKTUELL)
// =================================
function processHLGuess(direction) {
  if (!hlInRound) return;

  // ==== 1) Build correctSet & wrongSet inklusive Gleichstand ====
  const correctSet = [];
  const wrongSet   = [];
  for (let n = 0; n <= 10; n++) {
    if (direction === "higher") {
      if (n >= hlCurrent) correctSet.push(n);
      else wrongSet.push(n);
    } else {
      if (n <= hlCurrent) correctSet.push(n);
      else wrongSet.push(n);
    }
  }

  // ==== 2) Entscheidung, ob wir in correctSet oder wrongSet ziehen ====
  const roll = Math.random();
  let nextNumber;
  if (roll < odds.hl && correctSet.length > 0) {
    nextNumber = correctSet[randomInt(0, correctSet.length - 1)];
  } else {
    nextNumber = wrongSet[randomInt(0, wrongSet.length - 1)];
  }

  // ==== 3) Check auf Korrektheit (Gleichstand ist jetzt inkl.) ====
  const isCorrect = correctSet.includes(nextNumber);

  // Neue Zahl setzen & UI-Update
  hlCurrent = nextNumber;
  hlCurrentNumberEl.textContent = hlCurrent;

  if (isCorrect) {
    // Richtiger Tipp: Streak erhöhen und Multiplikator berechnen
    hlStreak++;
    hlCurrentNumberEl.classList.add("pop");
    setTimeout(() => hlCurrentNumberEl.classList.remove("pop"), 400);

    // Beispiel: Exponentielles Wachstum: multiplicator = 1 + 0.5 × streak
    const newMult = (1 + hlStreak * 0.5).toFixed(2);
    hlMultiplierEl.textContent = newMult;
    const newPayout = Math.floor(hlBet * parseFloat(newMult));
    hlPotentialPayoutEl.textContent = newPayout;

    hlStreakEl.textContent = hlStreak;
    hlCashoutBtn.disabled = hlStreak < 4; // erst ab 4 erlaubt

    // (Optional) Sound bei Gewinn
    // playWin();
  } else {
    // Falscher Tipp: Runde beenden, Verlust buchen
    hlInRound = false;
    balance -= hlBet;
    setBalance(balance);
    hlCurrentNumberEl.classList.add("shake");
    setTimeout(() => hlCurrentNumberEl.classList.remove("shake"), 500);

    showHLResult("lost", nextNumber);
    // (Optional) Sound bei Verlust
    // playLose();
  }
}

// ===========================
// 9) HIGH-LOW: BUTTON LISTENERS
// ===========================
hlHigherBtn.addEventListener("click", () => processHLGuess("higher"));
hlLowerBtn.addEventListener("click", () => processHLGuess("lower"));

// ============================
// 10) HIGH-LOW: CASH OUT LOGIC
// ============================
hlCashoutBtn.addEventListener("click", () => {
  if (!hlInRound) return;
  hlInRound = false;
  const finalPayout = parseInt(hlPotentialPayoutEl.textContent, 10);
  balance += finalPayout;
  setBalance(balance);
  showHLResult("won", hlCurrent);
});

// ============================
// 11) HIGH-LOW: ERGEBNIS-ANZEIGE
// ============================
function showHLResult(status, number) {
  hideElement(hlGameAreaEl);
  showElement(hlResultAreaEl);

  if (status === "lost") {
    hlResultMessageEl.textContent = `You lost! Next number was ${number}.`;
    hlRepeatBtn.disabled = false;
    hlDoubleBtn.disabled = false;
  } else {
    hlResultMessageEl.textContent = `You cashed out ${hlPotentialPayoutEl.textContent} Chips!`;
    hlRepeatBtn.disabled = false;
    hlDoubleBtn.disabled = false;
  }
}

// ============================
// 12) HIGH-LOW: REPEAT & DOUBLE
// ============================
hlRepeatBtn.addEventListener("click", () => {
  if (hlBet > balance) {
    alert("Nicht genügend Guthaben zum Wiederholen.");
    return;
  }
  resetHLRound();
  hlBet = hlBet; // gleicher Einsatz
  hlSelectedBetEl.textContent = hlBet;
  hlStartBtn.click();
});

hlDoubleBtn.addEventListener("click", () => {
  if (hlBet * 2 > balance) {
    alert("Nicht genügend Guthaben zum Verdoppeln.");
    return;
  }
  hlBet = hlBet * 2;
  hlSelectedBetEl.textContent = hlBet;
  resetHLRound();
  hlStartBtn.click();
});

hlNewBtn.addEventListener("click", () => {
  resetHLRound();
});

function resetHLRound() {
  hlInRound = false;
  hlStreak = 0;
  hlCurrent = 0;
  hlBet = 0;
  hlSelectedBetEl.textContent = "0";
  hlStreakEl.textContent = "0";
  hlMultiplierEl.textContent = "0";
  hlPotentialPayoutEl.textContent = "0";

  // UI zurücksetzen
  document.querySelectorAll("#hlBetOptions .bet-btn").forEach(btn => {
    btn.classList.remove("selected");
  });
  hlStartBtn.disabled = true;
  hideElement(hlGameAreaEl);
  hideElement(hlResultAreaEl);
  showElement(hlBetOptionsEl.parentElement);
}

// ====================
// (Optional) SOUNDS
// ====================
// const soundWin   = document.getElementById("soundWin");
// const soundLose  = document.getElementById("soundLose");
// function playWin()  { soundWin.play(); }
// function playLose() { soundLose.play(); }
