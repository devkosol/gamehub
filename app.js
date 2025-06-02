// app.js

// =========================
// 1) BALANCE über localStorage
// =========================
function getBalance() {
  const b = localStorage.getItem("balance");
  return b !== null ? parseInt(b, 10) : 1000;
}
function setBalance(val) {
  localStorage.setItem("balance", val);
}

// =========================
// 2) SOUNDS initialisieren
// =========================
const soundClick = document.getElementById("soundClick");
const soundWin   = document.getElementById("soundWin");
const soundLose  = document.getElementById("soundLose");

function playClick() {
  if (soundClick) {
    soundClick.currentTime = 0;
    soundClick.play();
  }
}
function playWin() {
  if (soundWin) {
    soundWin.currentTime = 0;
    soundWin.play();
  }
}
function playLose() {
  if (soundLose) {
    soundLose.currentTime = 0;
    soundLose.play();
  }
}

// =========================
// 3) ODDS – INITIALISIERUNG
// =========================
const odds = {
  dice: 0.50,  // 50% default
  hl:   0.48,  // 48% default (nicht über Slider steuerbar)
  slot: 0.10,  // 10% default (nicht über Slider steuerbar)
  coin: 0.50   // 50% default
};

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 4) GLOBALER STATE & BALANCE
  // =========================
  let balance = getBalance();
  if (localStorage.getItem("balance") === null) {
    setBalance(1000);
    balance = 1000;
  }

  // Referenzen: Balance-Anzeige & Hauptmenü-Buttons
  const balanceAmountEl = document.getElementById("balanceAmount");
  const mainMenu        = document.getElementById("mainMenu");
  const btnDiceMenu     = document.getElementById("btnDiceMenu");
  const btnHLMenu       = document.getElementById("btnHLMenu");
  const btnSlotMenu     = document.getElementById("btnSlotMenu");
  const btnCoinMenu     = document.getElementById("btnCoinMenu");

  const diceGame        = document.getElementById("diceGame");
  const hlGame          = document.getElementById("hlGame");
  const slotGame        = document.getElementById("slotGame");
  const coinGame        = document.getElementById("coinGame");

  function updateAllBalances() {
    balanceAmountEl.textContent = balance;
    document.getElementById("hlBalance").textContent   = balance;
    document.getElementById("slotBalance").textContent = balance;
    document.getElementById("coinBalance").textContent = balance;
  }
  updateAllBalances();

  // =========================
  // 5) UTILITY
  // =========================
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function removeAnimationClass(el, className) {
    el.addEventListener("animationend", function handler() {
      el.classList.remove(className);
      el.removeEventListener("animationend", handler);
    });
  }
  function showSection(sectionEl) {
    [diceGame, hlGame, slotGame, coinGame, mainMenu].forEach(div => {
      div.classList.add("hidden");
    });
    sectionEl.classList.remove("hidden");
    playClick();
  }

  // =========================
  // 6) SECTION SWITCHING
  // =========================
  btnDiceMenu.addEventListener("click", () => showSection(diceGame));
  btnHLMenu.addEventListener("click",   () => showSection(hlGame));
  btnSlotMenu.addEventListener("click", () => showSection(slotGame));
  btnCoinMenu.addEventListener("click", () => showSection(coinGame));

  // =========================
  // 7) DICE GAME LOGIK
  // =========================
  const diceOddsSlider   = document.getElementById("diceOdds");
  const diceOddsDisplay  = document.getElementById("diceOddsDisplay");
  const diceBetOptions   = document.getElementById("diceBetOptions");
  const diceSelectedBet  = document.getElementById("diceSelectedBet");
  const diceRollBtn      = document.getElementById("diceRollBtn");
  const diceResultArea   = document.getElementById("diceResult");
  const diceYourValue    = document.getElementById("diceYourValue");
  const diceBankValue    = document.getElementById("diceBankValue");
  const diceResultMessage= document.getElementById("diceResultMessage");
  const diceRepeatBtn    = document.getElementById("diceRepeatBtn");
  const diceDoubleBtn    = document.getElementById("diceDoubleBtn");
  const diceBackBtn      = document.getElementById("diceBackBtn");

  let diceBet = 0;

  // Odds-Slider updaten
  diceOddsSlider.addEventListener("input", () => {
    const p = parseInt(diceOddsSlider.value, 10);
    diceOddsDisplay.textContent = p + "%";
    odds.dice = p / 100;
    playClick();
  });

  // Bet-Auswahl
  diceBetOptions.addEventListener("click", (e) => {
    if (!e.target.matches(".bet-btn")) return;
    playClick();
    diceBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));

    const betValue = e.target.dataset.bet;
    if (betValue === "custom") {
      const input = prompt("Enter custom bet (chips):");
      const val = parseInt(input, 10);
      if (!val || val <= 0) {
        alert("Invalid bet.");
        return;
      }
      if (val > balance) {
        alert("Not enough balance.");
        return;
      }
      diceBet = val;
      e.target.classList.add("selected");
    } else {
      const nb = parseInt(betValue, 10);
      if (nb > balance) {
        alert("Not enough balance.");
        return;
      }
      diceBet = nb;
      e.target.classList.add("selected");
    }

    diceSelectedBet.textContent = diceBet;
    diceRollBtn.disabled = (diceBet === 0 || balance < diceBet);
  });

  // Roll Dice
  function doDiceRoll() {
    const yourRoll = randomInt(1, 6);
    diceYourValue.textContent = yourRoll;
    diceYourValue.classList.add("pop");
    removeAnimationClass(diceYourValue, "pop");

    const bankRoll = randomInt(1, 6);
    diceBankValue.textContent = bankRoll;
    const bankAnim = (bankRoll > yourRoll) ? "shake" : "pop";
    diceBankValue.classList.add(bankAnim);
    removeAnimationClass(diceBankValue, bankAnim);

    let won = (yourRoll > bankRoll);
    if (won) {
      balance += diceBet;
      setBalance(balance);
      diceResultMessage.textContent = `🎉 You: ${yourRoll}  |  Bank: ${bankRoll} → You Win ${diceBet}!`;
      diceResultMessage.classList.add("pop");
      playWin();
    } else {
      balance -= diceBet;
      setBalance(balance);
      diceResultMessage.textContent = `😞 You: ${yourRoll}  |  Bank: ${bankRoll} → You Lose ${diceBet}.`;
      diceResultMessage.classList.add("shake");
      playLose();
    }
    updateAllBalances();
    diceResultArea.classList.remove("hidden");
  }

  diceRollBtn.addEventListener("click", () => {
    playClick();
    doDiceRoll();
    diceRollBtn.disabled = true;
    diceBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.disabled = true);
  });

  // Repeat Bet
  diceRepeatBtn.addEventListener("click", () => {
    playClick();
    if (diceBet === 0) return;
    if (balance < diceBet) {
      alert("Not enough balance to repeat.");
      return;
    }
    doDiceRoll();
  });

  // Double Bet
  diceDoubleBtn.addEventListener("click", () => {
    playClick();
    if (diceBet === 0) return;
    const newBet = diceBet * 2;
    if (newBet > balance) {
      alert("Not enough balance to double.");
      return;
    }
    diceBet = newBet;
    diceBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));
    const customBtn = diceBetOptions.querySelector("[data-bet='custom']");
    customBtn.classList.add("selected");
    diceSelectedBet.textContent = diceBet;
    doDiceRoll();
  });

  // Back to Menu
  diceBackBtn.addEventListener("click", () => {
    playClick();
    diceResultArea.classList.add("hidden");
    diceYourValue.textContent = "–";
    diceBankValue.textContent = "–";
    diceYourValue.classList.remove("shake", "pop");
    diceBankValue.classList.remove("shake", "pop");
    diceBet = 0;
    diceBetOptions.querySelectorAll(".bet-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    diceSelectedBet.textContent = "0";
    diceRollBtn.disabled = true;
    showSection(mainMenu);
  });

  // =========================
  // 8) HIGH-LOW GAME LOGIK
  // =========================
  const hlBetOptions       = document.getElementById("hlBetOptions");
  const hlSelectedBetEl    = document.getElementById("hlSelectedBet");
  const hlStartBtn         = document.getElementById("hlStartBtn");
  const hlLobby            = document.getElementById("hlLobby");
  const hlGameArea         = document.getElementById("hlGameArea");
  const hlCurrentNumberEl  = document.getElementById("hlCurrentNumber");
  const hlHigherBtn        = document.getElementById("hlHigherBtn");
  const hlLowerBtn         = document.getElementById("hlLowerBtn");
  const hlStreakEl         = document.getElementById("hlStreak");
  const hlMultiplierEl     = document.getElementById("hlMultiplier");
  const hlPotentialPayoutEl= document.getElementById("hlPotentialPayout");
  const hlCashoutBtn       = document.getElementById("hlCashoutBtn");
  const hlResultArea       = document.getElementById("hlResultArea");
  const hlResultMessage    = document.getElementById("hlResultMessage");
  const hlRepeatBtn        = document.getElementById("hlRepeatBtn");
  const hlDoubleBtn        = document.getElementById("hlDoubleBtn");
  const hlNewBtn           = document.getElementById("hlNewBtn");
  const hlBackBtn          = document.getElementById("hlBackBtn");

  let hlBet = 0;
  let hlCurrent = null;
  let hlStreak = 0;
  let hlInRound = false;

  // Bet-Auswahl
  hlBetOptions.addEventListener("click", (e) => {
    if (!e.target.matches(".bet-btn")) return;
    playClick();
    hlBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));

    const betValue = e.target.dataset.bet;
    if (betValue === "custom") {
      const input = prompt("Enter custom bet (chips):");
      const val = parseInt(input, 10);
      if (!val || val <= 0) {
        alert("Invalid bet.");
        return;
      }
      if (val > balance) {
        alert("Not enough balance.");
        return;
      }
      hlBet = val;
      e.target.classList.add("selected");
    } else {
      const nb = parseInt(betValue, 10);
      if (nb > balance) {
        alert("Not enough balance.");
        return;
      }
      hlBet = nb;
      e.target.classList.add("selected");
    }

    hlSelectedBetEl.textContent = hlBet;
    hlStartBtn.disabled = (hlBet === 0 || balance < hlBet);
  });

  // Start Round
  function startHLRound() {
    hlStreak = 0;
    hlInRound = true;
    hlCurrent = randomInt(0, 10);
    hlCurrentNumberEl.textContent = hlCurrent;
    updateHLUI();

    hlBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.disabled = true);
    hlStartBtn.disabled = true;
    hlLobby.classList.add("hidden");
    hlGameArea.classList.remove("hidden");
    hlResultArea.classList.add("hidden");
    playClick();
  }
  hlStartBtn.addEventListener("click", startHLRound);

  function updateHLUI() {
    hlStreakEl.textContent = hlStreak;
    hlMultiplierEl.textContent = hlStreak;
    hlPotentialPayoutEl.textContent = hlBet * hlStreak;
    hlCashoutBtn.disabled = (hlStreak < 4);
  }

  // Guess Processing
  function processHLGuess(direction) {
    if (!hlInRound) return;

    const correctSet = [];
    const wrongSet   = [];
    for (let n = 0; n <= 10; n++) {
      if (direction === "higher") {
        // Gleich oder größer zählt als richtig
        if (n >= hlCurrent) correctSet.push(n);
        else              wrongSet.push(n);
      } else {
        // Gleich oder kleiner zählt als richtig
        if (n <= hlCurrent) correctSet.push(n);
        else               wrongSet.push(n);
      }
    }

    const roll = Math.random();
    let nextNumber;
    if (roll < odds.hl && correctSet.length > 0) {
      nextNumber = correctSet[randomInt(0, correctSet.length - 1)];
    } else {
      nextNumber = wrongSet[randomInt(0, wrongSet.length - 1)];
    }

    const isCorrect = correctSet.includes(nextNumber);
    hlCurrent = nextNumber;
    hlCurrentNumberEl.textContent = hlCurrent;

    if (isCorrect) {
      hlStreak++;
      hlCurrentNumberEl.classList.add("pop");
      removeAnimationClass(hlCurrentNumberEl, "pop");
      updateHLUI();
      playWin();
    } else {
      hlInRound = false;
      balance -= hlBet;
      setBalance(balance);
      updateAllBalances();
      hlCurrentNumberEl.classList.add("shake");
      removeAnimationClass(hlCurrentNumberEl, "shake");
      showHLResult("lost", nextNumber);
      playLose();
    }
  }

  hlHigherBtn.addEventListener("click", () => {
    playClick();
    processHLGuess("higher");
  });
  hlLowerBtn.addEventListener("click", () => {
    playClick();
    processHLGuess("lower");
  });

  // Cash Out
  hlCashoutBtn.addEventListener("click", () => {
    if (!hlInRound || hlStreak < 4) return;
    hlInRound = false;
    const payout = hlBet * hlStreak;
    balance += payout;
    setBalance(balance);
    updateAllBalances();
    showHLResult("won", payout);
    playWin();
  });

  function showHLResult(type, value) {
    hlGameArea.classList.add("hidden");
    hlResultArea.classList.remove("hidden");

    if (type === "lost") {
      hlResultMessage.textContent = `😞 You lost! Next was ${value}. Bet of ${hlBet} gone.`;
      hlResultMessage.classList.add("shake");
    } else {
      hlResultMessage.textContent = `🎉 You win ${value} Chips! Streak: ${hlStreak}×`;
      hlResultMessage.classList.add("pop");
    }
  }

  // Repeat Bet
  hlRepeatBtn.addEventListener("click", () => {
    playClick();
    if (hlBet === 0) return;
    if (balance < hlBet) {
      alert("Not enough balance to repeat.");
      return;
    }
    startHLRound();
  });

  // Double Bet
  hlDoubleBtn.addEventListener("click", () => {
    playClick();
    if (hlBet === 0) return;
    const newBet = hlBet * 2;
    if (newBet > balance) {
      alert("Not enough balance to double.");
      return;
    }
    hlBet = newBet;
    hlBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));
    const customBtn = hlBetOptions.querySelector("[data-bet='custom']");
    customBtn.classList.add("selected");
    hlSelectedBetEl.textContent = hlBet;
    startHLRound();
  });

  // New Game
  hlNewBtn.addEventListener("click", () => {
    playClick();
    hlBet = 0;
    hlStreak = 0;
    hlInRound = false;
    hlBetOptions.querySelectorAll(".bet-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    hlStartBtn.disabled = true;
    hlStreakEl.textContent = "0";
    hlMultiplierEl.textContent  = "0";
    hlPotentialPayoutEl.textContent = "0";
    hlCurrentNumberEl.textContent   = "–";
    hlResultArea.classList.add("hidden");
    hlGameArea.classList.add("hidden");
    hlLobby.classList.remove("hidden");
    hlSelectedBetEl.textContent = "0";
  });

  // Back to Menu
  hlBackBtn.addEventListener("click", () => {
    playClick();
    hlBet = 0;
    hlStreak = 0;
    hlInRound = false;
    hlBetOptions.querySelectorAll(".bet-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    hlStartBtn.disabled = true;
    hlStreakEl.textContent = "0";
    hlMultiplierEl.textContent  = "0";
    hlPotentialPayoutEl.textContent = "0";
    hlCurrentNumberEl.textContent   = "–";
    hlSelectedBetEl.textContent = "0";
    updateAllBalances();
    hlResultArea.classList.add("hidden");
    hlGameArea.classList.add("hidden");
    hlLobby.classList.remove("hidden");
    showSection(mainMenu);
  });

  // =========================
  // 9) SLOT MACHINE LOGIK
  // =========================
  const slotBetOptions      = document.getElementById("slotBetOptions");
  const slotSelectedBetEl   = document.getElementById("slotSelectedBet");
  const slotStartBtn        = document.getElementById("slotStartBtn");
  const slotLobby           = document.getElementById("slotLobby");
  const slotGameArea        = document.getElementById("slotGameArea");
  const slotReel1           = document.getElementById("slotReel1");
  const slotReel2           = document.getElementById("slotReel2");
  const slotReel3           = document.getElementById("slotReel3");
  const slotSpinBtn         = document.getElementById("slotSpinBtn");
  const slotResultArea      = document.getElementById("slotResultArea");
  const slotResultMessage   = document.getElementById("slotResultMessage");
  const slotRepeatBtn       = document.getElementById("slotRepeatBtn");
  const slotDoubleBtn       = document.getElementById("slotDoubleBtn");
  const slotNewBtn          = document.getElementById("slotNewBtn");
  const slotBackBtn         = document.getElementById("slotBackBtn");

  let slotBet = 0;
  const slotSymbols = ["🍒","🍋","🍉","⭐"];

  // Bet Auswahl
  slotBetOptions.addEventListener("click", (e) => {
    if (!e.target.matches(".bet-btn")) return;
    playClick();
    slotBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));

    const betValue = e.target.dataset.bet;
    if (betValue === "custom") {
      const input = prompt("Enter custom bet (chips):");
      const val = parseInt(input, 10);
      if (!val || val <= 0) {
        alert("Invalid bet.");
        return;
      }
      if (val > balance) {
        alert("Not enough balance.");
        return;
      }
      slotBet = val;
      e.target.classList.add("selected");
    } else {
      const nb = parseInt(betValue, 10);
      if (nb > balance) {
        alert("Not enough balance.");
        return;
      }
      slotBet = nb;
      e.target.classList.add("selected");
    }

    slotSelectedBetEl.textContent = slotBet;
    slotStartBtn.disabled = (slotBet === 0 || balance < slotBet);
  });

  // Start Slot Game
  function startSlotGame() {
    slotReel1.textContent = "❔";
    slotReel2.textContent = "❔";
    slotReel3.textContent = "❔";

    slotBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.disabled = true);
    slotStartBtn.disabled = true;
    slotSpinBtn.disabled = false;

    slotLobby.classList.add("hidden");
    slotGameArea.classList.remove("hidden");
    slotResultArea.classList.add("hidden");
    playClick();
  }
  slotStartBtn.addEventListener("click", startSlotGame);

  // Spin Logic
  function doSlotSpin() {
    [slotReel1, slotReel2, slotReel3].forEach(r => {
      r.classList.add("spin");
      removeAnimationClass(r, "spin");
    });
    slotSpinBtn.disabled = true;

    setTimeout(() => {
      let payout = 0;
      if (Math.random() < odds.slot) {
        // Drei Gleiche → 5×
        const sym = slotSymbols[randomInt(0, slotSymbols.length - 1)];
        slotReel1.textContent = sym;
        slotReel2.textContent = sym;
        slotReel3.textContent = sym;
        payout = slotBet * 5;
      } else {
        // Zufällige Kombination (mindestens zwei gleich für 2×)
        const s1 = slotSymbols[randomInt(0, slotSymbols.length - 1)];
        let s2 = slotSymbols[randomInt(0, slotSymbols.length - 1)];
        let s3 = slotSymbols[randomInt(0, slotSymbols.length - 1)];
        if (s1 === s2 && s2 === s3) {
          // Falls doch dreimal gleich, breche s3
          do { s3 = slotSymbols[randomInt(0, slotSymbols.length - 1)]; }
          while (s3 === s1);
        }
        slotReel1.textContent = s1;
        slotReel2.textContent = s2;
        slotReel3.textContent = s3;
        if (s1 === s2 || s1 === s3 || s2 === s3) {
          payout = slotBet * 2;
        } else {
          payout = 0;
        }
      }

      if (payout > 0) {
        balance += payout;
        setBalance(balance);
        updateAllBalances();
        slotResultMessage.textContent = `🎉 You win ${payout} Chips!`;
        slotResultMessage.classList.add("pop");
        playWin();
      } else {
        balance -= slotBet;
        setBalance(balance);
        updateAllBalances();
        [slotReel1, slotReel2, slotReel3].forEach(r => {
          r.classList.add("shake");
          removeAnimationClass(r, "shake");
        });
        slotResultMessage.textContent = `😞 You lose ${slotBet} Chips.`;
        slotResultMessage.classList.add("shake");
        playLose();
      }
      slotResultArea.classList.remove("hidden");
    }, 600);
  }

  slotSpinBtn.addEventListener("click", () => {
    playClick();
    doSlotSpin();
  });

  // Repeat Bet
  slotRepeatBtn.addEventListener("click", () => {
    playClick();
    if (slotBet === 0) return;
    if (balance < slotBet) {
      alert("Not enough balance to repeat.");
      return;
    }
    startSlotGame();
    doSlotSpin();
  });

  // Double Bet
  slotDoubleBtn.addEventListener("click", () => {
    playClick();
    if (slotBet === 0) return;
    const newBet = slotBet * 2;
    if (newBet > balance) {
      alert("Not enough balance to double.");
      return;
    }
    slotBet = newBet;
    slotBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));
    const customBtn = slotBetOptions.querySelector("[data-bet='custom']");
    customBtn.classList.add("selected");
    slotSelectedBetEl.textContent = slotBet;
    startSlotGame();
    doSlotSpin();
  });

  // Play Again
  slotNewBtn.addEventListener("click", () => {
    playClick();
    slotBet = 0;
    slotReel1.textContent = "❔";
    slotReel2.textContent = "❔";
    slotReel3.textContent = "❔";
    slotBetOptions.querySelectorAll(".bet-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    slotStartBtn.disabled = true;
    slotSpinBtn.disabled = false;
    slotResultArea.classList.add("hidden");
    slotGameArea.classList.add("hidden");
    slotLobby.classList.remove("hidden");
    slotSelectedBetEl.textContent = "0";
  });

  // Back to Menu
  slotBackBtn.addEventListener("click", () => {
    playClick();
    slotBet = 0;
    slotReel1.textContent = "❔";
    slotReel2.textContent = "❔";
    slotReel3.textContent = "❔";
    slotBetOptions.querySelectorAll(".bet-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    slotStartBtn.disabled = true;
    slotSpinBtn.disabled = false;
    updateAllBalances();
    slotResultArea.classList.add("hidden");
    slotGameArea.classList.add("hidden");
    slotLobby.classList.remove("hidden");
    slotSelectedBetEl.textContent = "0";
    showSection(mainMenu);
  });

  // =========================
  // 10) COIN FLIP LOGIK
  // =========================
  const coinBetOptions    = document.getElementById("coinBetOptions");
  const coinSelectedBetEl = document.getElementById("coinSelectedBet");
  const coinSideOptions   = document.getElementById("coinSideOptions");
  const coinFlipBtn       = document.getElementById("coinFlipBtn");
  const coinLobby         = document.getElementById("coinLobby");
  const coinGameArea      = document.getElementById("coinGameArea");
  const coinEl            = document.getElementById("coin");
  const coinResultArea    = document.getElementById("coinResultArea");
  const coinResultMessage = document.getElementById("coinResultMessage");
  const coinRepeatBtn     = document.getElementById("coinRepeatBtn");
  const coinDoubleBtn     = document.getElementById("coinDoubleBtn");
  const coinNewBtn        = document.getElementById("coinNewBtn");
  const coinBackGameBtn   = document.getElementById("coinBackGameBtn");

  let coinBet = 0;
  let coinSideChoice = ""; // "ETH" oder "SOL"

  // Bet-Auswahl
  coinBetOptions.addEventListener("click", (e) => {
    if (!e.target.matches(".bet-btn")) return;
    playClick();
    coinBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));

    const betValue = e.target.dataset.bet;
    if (betValue === "custom") {
      const input = prompt("Enter custom bet (chips):");
      const val = parseInt(input, 10);
      if (!val || val <= 0) {
        alert("Invalid bet.");
        return;
      }
      if (val > balance) {
        alert("Not enough balance.");
        return;
      }
      coinBet = val;
      e.target.classList.add("selected");
    } else {
      const nb = parseInt(betValue, 10);
      if (nb > balance) {
        alert("Not enough balance.");
        return;
      }
      coinBet = nb;
      e.target.classList.add("selected");
    }

    coinSelectedBetEl.textContent = coinBet;
    updateCoinFlipEnable();
  });

  // Side-Auswahl
  coinSideOptions.addEventListener("click", (e) => {
    if (!e.target.matches(".side-btn")) return;
    playClick();
    coinSideOptions.querySelectorAll(".side-btn").forEach(btn => btn.classList.remove("selected"));
    const btn = e.target;
    btn.classList.add("selected");
    coinSideChoice = btn.dataset.side; // "ETH" oder "SOL"
    updateCoinFlipEnable();
  });

  function updateCoinFlipEnable() {
    coinFlipBtn.disabled = (
      coinBet === 0 ||
      coinSideChoice === "" ||
      balance < coinBet
    );
  }

  // Flip Coin
  function doCoinFlip() {
    coinLobby.classList.add("hidden");
    coinGameArea.classList.remove("hidden");
    coinEl.classList.remove("show-eth", "show-sol");
    coinResultArea.classList.add("hidden");
    playClick();

    coinEl.classList.add("flip");

    setTimeout(() => {
      coinEl.classList.remove("flip");
      const flipRand = Math.random();
      const resultSide = (flipRand < odds.coin)
        ? coinSideChoice
        : (coinSideChoice === "ETH" ? "SOL" : "ETH");

      if (resultSide === "ETH") coinEl.classList.add("show-eth");
      else coinEl.classList.add("show-sol");

      if (resultSide === coinSideChoice) {
        balance += coinBet;
        setBalance(balance);
        updateAllBalances();
        coinResultMessage.textContent = `🎉 It was ${resultSide}! You win ${coinBet} Chips!`;
        coinResultMessage.classList.add("pop");
        playWin();
      } else {
        balance -= coinBet;
        setBalance(balance);
        updateAllBalances();
        coinResultMessage.textContent = `😞 It was ${resultSide}. You lose ${coinBet} Chips.`;
        coinResultMessage.classList.add("shake");
        playLose();
      }

      coinResultArea.classList.remove("hidden");
    }, 1000);
  }

  coinFlipBtn.addEventListener("click", () => {
    playClick();
    doCoinFlip();
  });

  // Repeat Bet
  coinRepeatBtn.addEventListener("click", () => {
    playClick();
    if (coinBet === 0) return;
    if (balance < coinBet) {
      alert("Not enough balance to repeat.");
      return;
    }
    doCoinFlip();
  });

  // Double Bet
  coinDoubleBtn.addEventListener("click", () => {
    playClick();
    if (coinBet === 0) return;
    const newBet = coinBet * 2;
    if (newBet > balance) {
      alert("Not enough balance to double.");
      return;
    }
    coinBet = newBet;
    coinBetOptions.querySelectorAll(".bet-btn").forEach(btn => btn.classList.remove("selected"));
    const customBtn = coinBetOptions.querySelector("[data-bet='custom']");
    customBtn.classList.add("selected");
    coinSelectedBetEl.textContent = coinBet;
    doCoinFlip();
  });

  // Play Again
  coinNewBtn.addEventListener("click", () => {
    playClick();
    coinBet = 0;
    coinSideChoice = "";
    coinEl.classList.remove("show-eth", "show-sol");
    coinEl.classList.remove("flip");
    coinResultArea.classList.add("hidden");
    coinResultMessage.textContent = "";
    coinFlipBtn.disabled = true;

    coinBetOptions.querySelectorAll(".bet-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    coinSideOptions.querySelectorAll(".side-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    coinSelectedBetEl.textContent = "0";

    coinGameArea.classList.add("hidden");
    coinLobby.classList.remove("hidden");
  });

  // Back to Menu in Coin Game
  coinBackGameBtn.addEventListener("click", () => {
    playClick();
    coinBet = 0;
    coinSideChoice = "";
    coinEl.classList.remove("show-eth", "show-sol");
    coinEl.classList.remove("flip");
    coinResultArea.classList.add("hidden");
    coinResultMessage.textContent = "";
    coinFlipBtn.disabled = true;

    coinBetOptions.querySelectorAll(".bet-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    coinSideOptions.querySelectorAll(".side-btn").forEach(btn => {
      btn.classList.remove("selected");
      btn.disabled = false;
    });
    coinSelectedBetEl.textContent = "0";
    updateAllBalances();
    showSection(mainMenu);
  });

  // =========================
  // 11) INITIAL VIEW
  // =========================
  showSection(mainMenu);
});
