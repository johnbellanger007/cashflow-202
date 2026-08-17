// --- Sound System (Procedural Web Audio API) ---
let audioCtx = null;
const SoundManager = {
    isMuted: false,
    init() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    },
    toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('mute-btn');
        if (btn) btn.innerHTML = this.isMuted ? '🔇' : '🔊';
    },
    playTone(freq, type, duration, vol=0.1) {
        if (this.isMuted) return;
        this.init();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch(e){}
    },
    playCash() {
        this.playTone(800, 'sine', 0.1, 0.1);
        setTimeout(() => this.playTone(1200, 'sine', 0.3, 0.15), 100);
    },
    playSpend() {
        this.playTone(300, 'sawtooth', 0.1, 0.1);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.3, 0.1), 100);
    },
    playDice() {
        let time = 0;
        for(let i=0; i<6; i++) {
            setTimeout(() => this.playTone(400 + Math.random()*400, 'square', 0.05, 0.05), time);
            time += 80;
        }
    },
    playFlip() {
         this.playTone(600, 'square', 0.1, 0.02);
    }
};
document.addEventListener('click', () => SoundManager.init(), {once: true});

// State Management
const PROFESSIONS = [
    {
        title: "Doctor",
        salary: 13200,
        savings: 400,
        avatar: "👨‍⚕️",
        expenses: {
            taxes: 3420,
            homeMortgage: 1900,
            schoolLoan: 750,
            carLoan: 280,
            creditCard: 270,
            retail: 50,
            other: 2880,
            bankLoanPayment: 0,
            childPerUnit: 640
        },
        liabilities: {
            homeMortgage: 202000,
            schoolLoan: 150000,
            carLoan: 14000,
            creditCard: 9000,
            retail: 1000,
            bankLoan: 0
        },
        portfolio: {} // Profession card does not include starting portfolio in Cashflow 202

    },
    {
        title: "Lawyer",
        salary: 7500,
        savings: 400,
        avatar: "⚖️",
        expenses: {
            taxes: 1830,
            homeMortgage: 1100,
            schoolLoan: 390,
            carLoan: 220,
            creditCard: 180,
            retail: 50,
            other: 1630,
            bankLoanPayment: 0,
            childPerUnit: 380
        },
        liabilities: {
            homeMortgage: 115000,
            schoolLoan: 78000,
            carLoan: 11000,
            creditCard: 6000,
            retail: 1000,
            bankLoan: 0
        },
        portfolio: {} // Drawn separately

    },
    {
        title: "Engineer",
        salary: 4900,
        savings: 400,
        avatar: "👷",
        expenses: {
            taxes: 1050,
            homeMortgage: 600,
            schoolLoan: 250,
            carLoan: 140,
            creditCard: 120,
            retail: 50,
            other: 1090,
            bankLoanPayment: 0,
            childPerUnit: 250
        },
        liabilities: {
            homeMortgage: 75000,
            schoolLoan: 12000,
            carLoan: 7000,
            creditCard: 4000,
            retail: 1000,
            bankLoan: 0
        },
        portfolio: {} // Drawn separately

    },
    {
        title: "Teacher",
        salary: 3300,
        savings: 500,
        avatar: "👩‍🏫",
        expenses: {
            taxes: 630,
            homeMortgage: 500,
            schoolLoan: 100,
            carLoan: 100,
            creditCard: 90,
            retail: 50,
            other: 950,
            bankLoanPayment: 0,
            childPerUnit: 180
        },
        liabilities: {
            homeMortgage: 50000,
            schoolLoan: 12000,
            carLoan: 5000,
            creditCard: 3000,
            retail: 1000,
            bankLoan: 0
        },
        portfolio: {} // Drawn separately

    },
    {
        title: "Janitor",
        salary: 1600,
        savings: 560,
        avatar: "🧹",
        expenses: {
            taxes: 280,
            homeMortgage: 200,
            schoolLoan: 0,
            carLoan: 80,
            creditCard: 60,
            retail: 50,
            other: 450,
            bankLoanPayment: 0,
            childPerUnit: 70
        },
        liabilities: {
            homeMortgage: 20000,
            schoolLoan: 0,
            carLoan: 4000,
            creditCard: 2000,
            retail: 1000,
            bankLoan: 0
        },
        portfolio: {} // Drawn separately
    }
];

// Official Cashflow 202 Portfolio Cards — drawn separately from profession
const PORTFOLIOS_202 = [
    {
        id: 'P01', cash: 3000,
        stocks: [],
        realEstate: [{ type: '4-Plex', assetType: 'real_estate', cost: 110000, downPayment: 20000, cashflow: 330 }]
    },
    {
        id: 'P02', cash: 0,
        stocks: [{ symbol: 'MYT4U', shares: 100, cost: 20 }, { symbol: 'OK4U', shares: 200, cost: 30 }],
        realEstate: []
    },
    {
        id: 'P03', cash: 10000,
        stocks: [{ symbol: 'MYT4U', shares: 100, cost: 20 }],
        realEstate: []
    },
    {
        id: 'P04', cash: 5000,
        stocks: [{ symbol: 'MYT4U', shares: 300, cost: 15 }],
        realEstate: [{ type: 'Duplex', assetType: 'real_estate', cost: 56000, downPayment: 7000, cashflow: 210 }]
    },
    {
        id: 'P05', cash: 0,
        stocks: [{ symbol: 'MYT4U', shares: 700, cost: 40 }, { symbol: 'OK4U', shares: 200, cost: 50 }],
        realEstate: []
    },
    {
        id: 'P07', cash: 8000,
        stocks: [],
        realEstate: [{ type: '10 Acres Vacant Land', assetType: 'real_estate', cost: 20000, downPayment: 20000, cashflow: 0 }]
    },
    {
        id: 'P08', cash: 12000,
        stocks: [{ symbol: 'OK4U', shares: 400, cost: 15 }],
        realEstate: [{ type: 'Duplex', assetType: 'real_estate', cost: 46000, downPayment: 4000, cashflow: 120 }]
    },
    {
        id: 'P09', cash: 0,
        stocks: [{ symbol: 'OK4U', shares: 300, cost: 20 }],
        realEstate: [{ type: 'Duplex', assetType: 'real_estate', cost: 64000, downPayment: 8000, cashflow: 300 }]
    },
    {
        id: 'P10', cash: 23000,
        stocks: [],
        realEstate: []
    },
    {
        id: 'P11', cash: 3000,
        stocks: [{ symbol: 'MYT4U', shares: 100, cost: 5 }, { symbol: 'OK4U', shares: 100, cost: 10 }],
        realEstate: []
    },
    {
        id: 'P12', cash: 3000,
        stocks: [{ symbol: 'OK4U', shares: 500, cost: 15 }],
        realEstate: [{ type: 'Duplex', assetType: 'real_estate', cost: 48000, downPayment: 3000, cashflow: 100 }]
    },
    {
        id: 'P13', cash: 2000,
        stocks: [],
        realEstate: [{ type: '4-Plex', assetType: 'real_estate', cost: 90000, downPayment: 17000, cashflow: 320 }]
    }
];

function getRandomPortfolio() {
    return PORTFOLIOS_202[Math.floor(Math.random() * PORTFOLIOS_202.length)];
}


function getRandomProfession() {
    return PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];
}

class Player {
    constructor(isAI = false, profession = null, portfolio = null) {
        this.isAI = isAI;
        if (!profession) profession = getRandomProfession();
        if (!portfolio) portfolio = getRandomPortfolio();

        this.job = { 
            title: profession.title,
            salary: profession.salary,
            savings: profession.savings,
            avatar: profession.avatar,
            expenses: { ...profession.expenses }
        };
        this.liabilities = { ...profession.liabilities };
        this.cash = this.job.savings + portfolio.cash;
        this.portfolioCard = portfolio.id;
        this.childrenCount = 0;
        this.assets = {
            stocks: portfolio.stocks ? portfolio.stocks.map(s => ({...s})) : [],
            options: [],
            shorts: [],
            realEstate: portfolio.realEstate ? portfolio.realEstate.map(r => ({...r})) : [],
            business: [],
            reOptions: []
        };
        this.boardPosition = 0;
        this.charityTurnsLeft = 0;
        this.isFastTrack = false;
        this.fastTrackBaseIncome = 0;
        this.fastTrackAssetIncome = 0;
        this.fastTrackBusinesses = []; 
        this.selectedDream = null;
        this.dreamSpaceId = null;
        this.isBankrupt = false;
        this.downsizedTurnsLeft = 0;
        this.ownedDreams = [];
    }
}

class GameState {
    constructor() {
        this.players = [
            new Player(false), // Human
            new Player(true)   // AI
        ];
        this.currentPlayerIndex = 0;
        
        this.priceHistory = {
            'OK4U': [40], 'MYT4U': [35], 'ON2U': [20], 'GRO4U': [10]
        };
        this.lastSymbolDrawn = 'OK4U';
        this.cardQueue = [];
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getOpponent() {
        return this.players[1 - this.currentPlayerIndex];
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        const p = this.getCurrentPlayer();
        
        // Skip eliminated players
        if (p.isEliminated) {
            this.nextTurn();
            return;
        }

        if (p.downsizedTurnsLeft > 0) {
            p.downsizedTurnsLeft--;
            showAlertCard(
                "Downsized Wait", 
                `${p.isAI ? 'The Computer' : 'You'} must wait! ${p.downsizedTurnsLeft + 1} turn(s) remaining.`, 
                "⏳", 
                "var(--warning)"
            );
            setTimeout(() => this.nextTurn(), 2000);
            return;
        }

        updateUI();
        updateTokenPosition();

        const btn = document.getElementById('btn-roll-dice');
        if (btn) {
            btn.disabled = p.isAI || (p.downsizedTurnsLeft > 0);
        }

        if (p.isAI) {
            this.playAITurn();
        }
    }

    playAITurn() {
        const p = this.getCurrentPlayer();
        if (!p.isAI) return;

        console.log("AI starting autonomous turn...");
        
        // Smart AI: check if it has surplus cash to pay down debts and reduce expenses
        this.aiManageDebts(p);
        
        setTimeout(() => {
            let numDice = p.isFastTrack ? 2 : 1;
            if (p.charityTurnsLeft > 0) {
                numDice = p.isFastTrack ? 3 : 2;
            }
            executeRoll(numDice);
        }, 1200);
    }

    aiManageDebts(p) {
        if (!p || !p.isAI || p.isFastTrack) return;
        
        const safetyReserve = 1000;
        let availableCash = p.cash - safetyReserve;
        if (availableCash <= 0) return;

        // 1. Bank Loan (Highest interest: 10%/month = 120%/yr)
        if (p.liabilities.bankLoan > 0 && availableCash >= 1000) {
            const repayAmount = Math.min(p.liabilities.bankLoan, Math.floor(availableCash / 1000) * 1000);
            if (repayAmount > 0) {
                p.cash -= repayAmount;
                p.liabilities.bankLoan -= repayAmount;
                p.job.expenses.bankLoanPayment -= (repayAmount * 0.1);
                availableCash -= repayAmount;
                showAlertCard("STRATÉGIE IA 🤖", `L'ordinateur a remboursé ${formatMoney(repayAmount)} de son Emprunt Bancaire pour réduire ses mensualités de ${formatMoney(repayAmount * 0.1)}/mois !`, "💳", "var(--success)");
                updateUI();
                return;
            }
        }

        // 2. Retail Debt (Saves 60%/yr)
        if (p.liabilities.retail > 0 && availableCash >= p.liabilities.retail) {
            const amt = p.liabilities.retail;
            const saved = p.job.expenses.retail;
            p.cash -= amt;
            p.liabilities.retail = 0;
            p.job.expenses.retail = 0;
            availableCash -= amt;
            showAlertCard("STRATÉGIE IA 🤖", `L'ordinateur a remboursé sa dette de Magasin (${formatMoney(amt)}) pour économiser ${formatMoney(saved)}/mois !`, "🛍️", "var(--success)");
            updateUI();
            return;
        }

        // 3. Credit Card (Saves 36%/yr)
        if (p.liabilities.creditCard > 0 && availableCash >= p.liabilities.creditCard) {
            const amt = p.liabilities.creditCard;
            const saved = p.job.expenses.creditCard;
            p.cash -= amt;
            p.liabilities.creditCard = 0;
            p.job.expenses.creditCard = 0;
            availableCash -= amt;
            showAlertCard("STRATÉGIE IA 🤖", `L'ordinateur a soldé sa Carte de Crédit (${formatMoney(amt)}) pour économiser ${formatMoney(saved)}/mois !`, "💳", "var(--success)");
            updateUI();
            return;
        }

        // 4. Car Loan (Saves ~20%/yr)
        if (p.liabilities.carLoan > 0 && availableCash >= p.liabilities.carLoan) {
            const amt = p.liabilities.carLoan;
            const saved = p.job.expenses.carLoan;
            p.cash -= amt;
            p.liabilities.carLoan = 0;
            p.job.expenses.carLoan = 0;
            availableCash -= amt;
            showAlertCard("STRATÉGIE IA 🤖", `L'ordinateur a soldé son Prêt Voiture (${formatMoney(amt)}) pour économiser ${formatMoney(saved)}/mois !`, "🚗", "var(--success)");
            updateUI();
            return;
        }
    }

    // Temporary getters for compatibility during refactoring
    get job() { return this.getCurrentPlayer().job; }
    get cash() { return this.getCurrentPlayer().cash; }
    set cash(val) { this.getCurrentPlayer().cash = val; }
    get childrenCount() { return this.getCurrentPlayer().childrenCount; }
    set childrenCount(val) { this.getCurrentPlayer().childrenCount = val; }
    get assets() { return this.getCurrentPlayer().assets; }
    get liabilities() { return this.getCurrentPlayer().liabilities; }
    get isFastTrack() { return this.getCurrentPlayer().isFastTrack; }
    set isFastTrack(val) { this.getCurrentPlayer().isFastTrack = val; }
    get boardPosition() { return this.getCurrentPlayer().boardPosition; }
    set boardPosition(val) { this.getCurrentPlayer().boardPosition = val; }
    get fastTrackAssetIncome() { return this.getCurrentPlayer().fastTrackAssetIncome; }
    set fastTrackAssetIncome(val) { this.getCurrentPlayer().fastTrackAssetIncome = val; }
    get fastTrackBaseIncome() { return this.getCurrentPlayer().fastTrackBaseIncome; }
    set fastTrackBaseIncome(val) { this.getCurrentPlayer().fastTrackBaseIncome = val; }
    get selectedDream() { return this.getCurrentPlayer().selectedDream; }
    set selectedDream(val) { this.getCurrentPlayer().selectedDream = val; }
    get dreamSpaceId() { return this.getCurrentPlayer().dreamSpaceId; }
    set dreamSpaceId(val) { this.getCurrentPlayer().dreamSpaceId = val; }
    get downsizedTurnsLeft() { return this.getCurrentPlayer().downsizedTurnsLeft; }
    set downsizedTurnsLeft(val) { this.getCurrentPlayer().downsizedTurnsLeft = val; }
    get charityTurnsLeft() { return this.getCurrentPlayer().charityTurnsLeft; }
    set charityTurnsLeft(val) { this.getCurrentPlayer().charityTurnsLeft = val; }
    declareBankruptcy() {
        const p = this.getCurrentPlayer();
        const hasAssets = (p.assets.stocks.length > 0 || p.assets.realEstate.length > 0 || p.assets.options.length > 0 || p.assets.business.length > 0 || p.fastTrackBusinesses.length > 0);
        
        // Calculate liquidation value
        let totalLiquidated = 0;
        p.assets.stocks.forEach(s => { totalLiquidated += (s.cost * s.shares * 0.5); });
        p.assets.realEstate.forEach(r => { totalLiquidated += (r.downPayment * 0.5); });
        p.assets.options.forEach(o => { totalLiquidated += (o.cost * o.quantity * 0.5); });
        p.assets.business.forEach(b => { totalLiquidated += (b.downPayment * 0.5); });
        p.fastTrackBusinesses.forEach(b => { totalLiquidated += ((b.cost || 100000) * 0.5); });

        if (hasAssets) {
            if (p.isAI) {
                this.liquidatePlayerAssets(p);
                p.cash += totalLiquidated;
                showAlertCard(
                    "LIQUIDATION ORDINATEUR",
                    `L'ordinateur a liquidé ses actifs pour ${formatMoney(totalLiquidated)} afin de payer ses dettes.`,
                    "💸",
                    "var(--warning)"
                );
                updateUI();
                setTimeout(() => this.nextTurn(), 2000);
            } else {
                showAlertCard(
                    "RISQUE DE FAILLITE !",
                    `Vos liquidités sont insuffisantes pour régler vos dettes. Vous pouvez liquider vos actifs à 50% de leur valeur d'achat (+${formatMoney(totalLiquidated)}) pour éviter l'élimination !`,
                    "⚠️",
                    "var(--warning)",
                    () => {
                        this.liquidatePlayerAssets(p);
                        p.cash += totalLiquidated;
                        
                        // Check if player survives
                        if (this.getMonthlyCashflow() < 0 && p.cash < 0) {
                            showAlertCard(
                                "FAILLITE TOTALE / GAME OVER",
                                "Malgré la liquidation de tous vos actifs, vos dépenses dépassent vos revenus. Vous avez fait faillite !",
                                "💀",
                                "var(--danger)",
                                () => startNewGame()
                            );
                            p.isEliminated = true;
                        } else {
                            p.downsizedTurnsLeft = 2;
                            p.isBankrupt = false;
                            showAlertCard(
                                "FAILLITE ÉVITÉE !",
                                `Vos actifs ont été liquidés (+${formatMoney(totalLiquidated)}). Vos dettes sont couvertes. Vous passez 2 tours pour vous rétablir.`,
                                "✅",
                                "var(--success)"
                            );
                        }
                        updateUI();
                        setTimeout(() => this.nextTurn(), 2000);
                    }
                );
            }
        } else {
            // No assets to liquidate -> direct elimination
            p.isEliminated = true;
            showAlertCard(
                "FAILLITE / GAME OVER",
                p.isAI 
                    ? "L'ordinateur a fait faillite et est éliminé du jeu !" 
                    : "Vous avez fait faillite ! Vos dépenses dépassent vos liquidités et vous n'avez aucun actif à liquider pour payer vos dettes.",
                "💀",
                "var(--danger)",
                () => {
                    if (!p.isAI) startNewGame();
                }
            );
            updateUI();
            if (p.isAI) {
                setTimeout(() => this.nextTurn(), 2000);
            }
        }
    }

    liquidatePlayerAssets(p) {
        // Sell Stocks at 1/2 of current price or cost? 
        // Rule says "half of starting sum" (apport ou prix d'achat)
        p.assets.stocks.forEach(s => { p.cash += (s.cost * s.shares * 0.5); });
        p.assets.stocks = [];

        p.assets.realEstate.forEach(r => { p.cash += (r.downPayment * 0.5); });
        p.assets.realEstate = [];

        p.assets.options.forEach(o => { p.cash += (o.cost * o.quantity * 0.5); });
        p.assets.options = [];
        
        p.assets.business.forEach(b => { p.cash += (b.downPayment * 0.5); });
        p.assets.business = [];
    }

    lastChanceDebtRelief(p) {
        // Halve Car, CC, Retail
        if (p.liabilities.carLoan) {
            p.liabilities.carLoan /= 2;
            p.job.expenses.carLoan /= 2;
        }
        if (p.liabilities.creditCard) {
            p.liabilities.creditCard /= 2;
            p.job.expenses.creditCard /= 2;
        }
        if (p.liabilities.retail) {
            p.liabilities.retail /= 2;
            p.job.expenses.retail /= 2;
        }
    }


    // Calculators
    getTotalIncome() {
        if (this.isFastTrack) {
            return this.fastTrackBaseIncome + this.fastTrackAssetIncome;
        }
        let passiveIncome = this.getPassiveIncome();
        return this.job.salary + passiveIncome;
    }

    getPassiveIncome() {
        if (this.isFastTrack) {
            return this.fastTrackAssetIncome;
        }
        let income = 0;
        // Dividends
        for (let stock of this.assets.stocks) {
            if (stock.dividend) income += stock.dividend * stock.shares;
        }
        // Real Estate
        for (let re of this.assets.realEstate) {
            income += re.cashflow;
        }
        // Business
        for (let b of this.assets.business) {
            income += b.cashflow;
        }
        return income;
    }

    getTotalExpenses() {
        if (this.isFastTrack) return 0; // Expenses don't matter on Fast Track
        let e = this.job.expenses;
        let baseExpenses = e.taxes + e.homeMortgage + e.schoolLoan + e.carLoan + e.creditCard + e.retail + e.other + e.bankLoanPayment;
        let childrenExpense = this.childrenCount * e.childPerUnit;
        return baseExpenses + childrenExpense;
    }

    getMonthlyCashflow() {
        if (this.isFastTrack) return this.getTotalIncome();
        return this.getTotalIncome() - this.getTotalExpenses();
    }


    getCurrentPrice(symbol) {
        if (!this.priceHistory[symbol]) return 0;
        return this.priceHistory[symbol][this.priceHistory[symbol].length - 1];
    }

    addPricePoint(symbol, price) {
        if (!this.priceHistory[symbol]) {
            this.priceHistory[symbol] = [];
        }
        this.priceHistory[symbol].push(price);
        if (this.priceHistory[symbol].length > 50) {
            this.priceHistory[symbol].shift();
        }
        
        // 202: Check for forced short settlement on price change
        this.checkMarginCalls(symbol, price);

        // 202: Update Stock Performance tab if visible
        const tab = document.getElementById('tab-stocks');
        if (tab && !tab.classList.contains('hidden')) {
            const dropdown = document.getElementById('tab-stock-dropdown');
            if (dropdown && dropdown.value === symbol) {
                updateStockTabUI(symbol);
            }
        }
    }

    checkMarginCalls(symbol, newPrice) {
        const p = this.getCurrentPlayer();
        const matchingShorts = p.assets.shorts.filter(s => s.symbol === symbol);
        if (matchingShorts.length > 0) {
            matchingShorts.forEach(s => {
                const totalCost = s.quantity * newPrice;
                const profit = (s.salePrice - newPrice) * s.quantity;
                const isGain = profit >= 0;

                p.cash -= totalCost; 
                p.assets.shorts = p.assets.shorts.filter(short => short !== s);
                updateUI();
                
                showAlertCard(
                    isGain ? "💰 Profit Realized! 💰" : "📉 Mandatory Settlement 📉",
                    `Your short position for ${symbol} was settled at the new price of ${formatMoney(newPrice)}.\n` +
                    (isGain ? `Profit: ${formatMoney(profit)}` : `Loss: ${formatMoney(Math.abs(profit))}`) +
                    `\nNew Balance: ${formatMoney(p.cash)}`,
                    isGain ? "💹" : "💸",
                    isGain ? "var(--success)" : "var(--danger)"
                );
            });
        }
    }

    buyBackShort(idx) {
        const s = this.assets.shorts[idx];
        if (!s) return;
        const currentPrice = this.getCurrentPrice(s.symbol);
        const totalCost = s.quantity * currentPrice;
        
        if (this.cash >= totalCost) {
            this.cash -= totalCost;
            this.assets.shorts.splice(idx, 1);
            updateUI();
            showAlertCard(
                "Position Closed",
                `Bought back ${s.quantity} shares of ${s.symbol} at ${formatMoney(currentPrice)}. Total: ${formatMoney(totalCost)}.`,
                "🤝",
                "var(--success)"
            );
        } else {
            showAlertCard(
                "Insufficient Cash",
                "Insufficient cash to buy back this short position. Consider borrowing from the bank.",
                "🚫",
                "var(--danger)"
            );
        }
    }

    exerciseOption(idx) {
        const p = this.getCurrentPlayer();
        const o = p.assets.options[idx];
        if (!o) return;
        const currentPrice = this.getCurrentPrice(o.symbol);
        const isCall = o.type === 'call';
        const spread = isCall ? (currentPrice - o.strike) : (o.strike - currentPrice);
        if (spread <= 0) {
            showAlertCard("Not Profitable", "This option is not currently profitable to exercise.", "📉", "var(--warning)");
            return;
        }
        const totalGain = spread * o.quantity;
        p.cash += totalGain;
        p.assets.options.splice(idx, 1);
        updateUI();
        showAlertCard("Option Exercised", `Exercised ${o.symbol} ${o.type.toUpperCase()}! Gain: ${formatMoney(totalGain)}`, "💰", "var(--success)");
    }

    advanceTurn() {
        const p = this.getCurrentPlayer();
        // Expiry management
        p.assets.options.forEach(o => o.expiry--);
        const expired = p.assets.options.filter(o => o.expiry <= 0);
        if (expired.length > 0) {
            showAlertCard(
                "Options Expired",
                `The following options have EXPIRED:\n${expired.map(o => `${o.symbol} ${o.type.toUpperCase()}`).join('\n')}`,
                "⌛",
                "var(--danger)"
            );
        }
        p.assets.options = p.assets.options.filter(o => o.expiry > 0);
        
        if (p.charityTurnsLeft > 0) p.charityTurnsLeft--;
        updateUI();
    }
}

// Global instance
let state = new GameState();

// UI Updater
function formatMoney(amount) {
    return '$ ' + amount.toLocaleString('en-US');
}

function updateUI() {
    const p = state.getCurrentPlayer();
    
    // 0. Update Sidebar
    document.getElementById('player-job').textContent = p.job.title + (p.isAI ? " (AI)" : "");
    const avatarEl = document.querySelector('.avatar');
    if (avatarEl) {
        avatarEl.textContent = p.job.avatar;
        avatarEl.style.border = p.isAI ? '2px solid #38bdf8' : '2px solid #eabb00';
    }
    
    const sidebarDreamEl = document.getElementById('player-dream');
    if (sidebarDreamEl) {
        sidebarDreamEl.innerHTML = p.selectedDream ? `${p.selectedDream.title}` : '';
        sidebarDreamEl.style.display = p.selectedDream ? 'flex' : 'none';
    }

    // 0.1 Turn Indicator
    const turnStatus = document.getElementById('turn-status-indicator');
    const turnAvatar = document.getElementById('turn-avatar');
    const turnText = document.getElementById('turn-text');
    if (turnStatus && turnAvatar && turnText) {
        turnStatus.className = `turn-indicator ${p.isAI ? 'ai-turn' : 'human-turn'}`;
        turnAvatar.textContent = p.isAI ? '🐭' : '🦁';
        turnText.textContent = p.isAI ? "COMPUTER TURN" : "YOUR TURN";
    }

    // 1. Top Bar
    document.getElementById('player-cash').textContent = formatMoney(p.cash);
    document.getElementById('player-passive-income').textContent = formatMoney(state.getPassiveIncome());
    document.getElementById('player-total-expenses').textContent = formatMoney(state.getTotalExpenses());
    
    // Progress bar for Fast Track
    // 202 Rule: exit Rat Race requires Passive Income > 2x Total Expenses
    const target = state.getTotalExpenses() * 2;
    let progress = Math.min((state.getPassiveIncome() / target) * 100, 100) || 0;
    document.getElementById('passive-income-progress').style.width = `${progress}%`;
    document.querySelector('.passive-income-display .label').textContent = p.isFastTrack ? "FAST TRACK" : "Passive Income vs 2x Expenses";

    // 2. Income Section
    document.getElementById('salary-val').textContent = formatMoney(state.job.salary);
    document.getElementById('total-income-val').textContent = formatMoney(state.getTotalIncome());
    
    // Lists logic for passive income
    const dividendsList = document.getElementById('dividends-list');
    const stocksWithDivs = state.assets.stocks.filter(s => s.dividend > 0);
    if (stocksWithDivs.length === 0) {
        dividendsList.innerHTML = '<div class="empty-state">No dividend assets</div>';
    } else {
        dividendsList.innerHTML = stocksWithDivs.map(s => `<div class="data-row"><span>${s.symbol} dividends</span><span class="value success">+${formatMoney(s.dividend * s.shares)}</span></div>`).join('');
    }

    const reList = document.getElementById('real-estate-list');
    const combinedRealEstateBiz = [...state.assets.realEstate, ...state.assets.business];
    if (combinedRealEstateBiz.length === 0) {
        reList.innerHTML = '<div class="empty-state">No real estate assets</div>';
    } else {
        reList.innerHTML = combinedRealEstateBiz.map(r => `<div class="data-row"><span>${r.type}</span><span class="value success">+${formatMoney(r.cashflow)}</span></div>`).join('');
    }
    
    // 3. Expenses Section
    const e = state.job.expenses;
    document.getElementById('taxes-val').textContent = formatMoney(e.taxes);
    document.getElementById('home-mortgage-val').textContent = formatMoney(e.homeMortgage);
    document.getElementById('school-loan-val').textContent = formatMoney(e.schoolLoan);
    document.getElementById('car-loan-val').textContent = formatMoney(e.carLoan);
    document.getElementById('credit-card-val').textContent = formatMoney(e.creditCard);
    document.getElementById('retail-val').textContent = formatMoney(e.retail);
    document.getElementById('bank-loan-payment-val').textContent = formatMoney(e.bankLoanPayment);
    document.getElementById('children-count').textContent = state.childrenCount;
    document.getElementById('child-expense-val').textContent = formatMoney(state.childrenCount * e.childPerUnit);
    document.getElementById('total-expense-val').textContent = formatMoney(state.getTotalExpenses());

    // 4. Cashflow (Paycheck) Section 
    document.getElementById('calc-income').textContent = formatMoney(state.getTotalIncome());
    document.getElementById('calc-expense').textContent = formatMoney(state.getTotalExpenses());
    document.getElementById('monthly-cashflow').textContent = formatMoney(state.getMonthlyCashflow());

    // 5. Liabilities Section
    const l = state.liabilities;
    document.getElementById('home-mortgage-liab').textContent = formatMoney(l.homeMortgage);
    document.getElementById('school-loan-liab').textContent = formatMoney(l.schoolLoan);
    document.getElementById('car-loan-liab').textContent = formatMoney(l.carLoan);
    document.getElementById('credit-card-liab').textContent = formatMoney(l.creditCard);
    document.getElementById('retail-liab').textContent = formatMoney(l.retail);
    document.getElementById('bank-loan-liab').textContent = formatMoney(l.bankLoan);
    
    // 6. Assets Section (Financial Statement)
    document.getElementById('savings-val').textContent = formatMoney(state.job.savings); // Savings is distinct from cash

    const stocksTbody = document.querySelector('#stocks-table tbody');
    if (state.assets.stocks.length === 0) {
        stocksTbody.innerHTML = '<tr><td colspan="3" class="text-center empty-state">No stocks owned</td></tr>';
    } else {
        stocksTbody.innerHTML = state.assets.stocks.map(s => `<tr><td>${s.symbol}</td><td>${s.shares}</td><td>${formatMoney(s.cost)}</td></tr>`).join('');
    }

    // New 202: Options Table
    const optionsTbody = document.querySelector('#options-table tbody');
    if (state.assets.options.length === 0) {
        optionsTbody.innerHTML = '<tr><td colspan="5" class="text-center empty-state">No active options</td></tr>';
    } else {
        optionsTbody.innerHTML = state.assets.options.map((o, idx) => {
            const isCall = o.type === 'call';
            return `
            <tr>
                <td style="color:${isCall ? '#10b981' : '#ec4899'}">${o.symbol} (${o.type.toUpperCase()})</td>
                <td>${o.quantity}</td>
                <td>${formatMoney(o.cost)}</td>
                <td>${formatMoney(o.strike)}</td>
                <td>${o.expiry} turns</td>
            </tr>`;
        }).join('');
    }

    // New 202: Shorts Table
    const shortsTbody = document.querySelector('#shorts-table tbody');
    if (state.assets.shorts.length === 0) {
        shortsTbody.innerHTML = '<tr><td colspan="5" class="text-center empty-state">No short positions</td></tr>';
    } else {
        shortsTbody.innerHTML = state.assets.shorts.map(s => {
            const currentPrice = state.getCurrentPrice(s.symbol);
            return `
            <tr>
                <td>${s.symbol}</td>
                <td>${s.quantity}</td>
                <td>${formatMoney(s.salePrice)}</td>
                <td class="${currentPrice > s.salePrice ? 'danger-text' : 'success-text'}">${formatMoney(currentPrice)}</td>
                <td><span style="font-size:10px; color:var(--text-muted);">Blocked</span></td>
            </tr>`;
        }).join('');
    }

    const reTbody = document.querySelector('#real-estate-assets-table tbody');
    if (combinedRealEstateBiz.length === 0) {
        reTbody.innerHTML = '<tr><td colspan="3" class="text-center empty-state">No real estate owned</td></tr>';
    } else {
        reTbody.innerHTML = combinedRealEstateBiz.map(r => `<tr><td>${r.type}</td><td>${formatMoney(r.downPayment)}</td><td>${formatMoney(r.cost)}</td></tr>`).join('');
    }
    
    const reLiabList = document.getElementById('real-estate-liab-list');
    if (combinedRealEstateBiz.length === 0) {
        reLiabList.innerHTML = '<div class="empty-state">No real estate loans</div>';
    } else {
        reLiabList.innerHTML = combinedRealEstateBiz.map(r => `<div class="data-row"><span>${r.type}</span><span class="value">${formatMoney(r.cost - r.downPayment)}</span></div>`).join('');
    }
    
    // 7. Portfolio Tab Sync
    updatePortfolioUI();

    // 8. Winning check for Fast Track (202 Rule: Accumulate $50,000 extra passive income)
    const hasEnoughIncome = p.fastTrackAssetIncome >= 50000;
    const hasMyDream = (p.ownedDreams && p.ownedDreams.some(d => d.isMyDream));
    
    if (p.isFastTrack && (hasEnoughIncome || hasMyDream)) {
        SoundManager.playTone(800, 'sine', 0.5);
        const isAIWinner = p.isAI;
        showAlertCard(
            isAIWinner ? "💀 YOU LOST! 💀" : "🏆 ULTIMATE VICTORY! 🏆",
            isAIWinner 
                ? `The Computer achieved the victory condition (${hasEnoughIncome ? '$50,000 Income' : 'Bought Dream'}) before you!\nGAME OVER!`
                : `You achieved the victory condition (${hasEnoughIncome ? '$50,000 Income' : 'Bought Dream'})!\nGAME OVER!`,
            isAIWinner ? "🪦" : "💎",
            isAIWinner ? "var(--danger)" : "var(--success)",
            () => startNewGame()
        );
        return;
    }

    // Checking for Rat Race exit
    if (!state.isFastTrack && state.getPassiveIncome() >= (state.getTotalExpenses() * 2)) {
        showAlertCard(
            "CONGRATULATIONS!",
            "Your passive income is now double your expenses. Prepare to enter the Fast Track!",
            "🚀",
            "var(--success)"
        );
        transitionToFastTrack();
    }

    // 9. Fast Track UI Update
    if (state.isFastTrack) {
        updateFastTrackUI();
    }

    // 10. Sync Roll Dice button state
    const diceBtn = document.getElementById('btn-roll-dice');
    if (diceBtn) {
        diceBtn.disabled = p.isAI || p.isEliminated || (p.downsizedTurnsLeft > 0);
    }
}

function updateFastTrackUI() {
    const roundedPassive = Math.round(state.ratRaceFinalPassive / 1000) * 1000;
    
    document.getElementById('ft-passive-rounded').textContent = formatMoney(roundedPassive);
    document.getElementById('ft-beginning-income').textContent = formatMoney(state.fastTrackBaseIncome);
    document.getElementById('ft-beginning-income-win').textContent = formatMoney(state.fastTrackBaseIncome);
    document.getElementById('ft-goal-to-win').textContent = formatMoney(state.fastTrackBaseIncome + 50000);
    document.getElementById('ft-record-start-income').textContent = formatMoney(state.fastTrackBaseIncome);
    
    const tbody = document.getElementById('ft-income-record-tbody');
    if (state.fastTrackBusinesses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center empty-state">No businesses purchased yet</td></tr>';
    } else {
        let runningIncome = state.fastTrackBaseIncome;
        tbody.innerHTML = state.fastTrackBusinesses.map(b => {
            runningIncome += b.cf;
            return `
                <tr>
                    <td>${b.title}</td>
                    <td class="success">+${formatMoney(b.cf)}</td>
                    <td class="success">${formatMoney(runningIncome)}</td>
                </tr>
            `;
        }).join('');
    }
    
    document.getElementById('ft-total-cf').textContent = formatMoney(state.fastTrackAssetIncome);
    document.getElementById('ft-current-day-income').textContent = formatMoney(state.getTotalIncome());

    const ftDreamObj = document.getElementById('ft-dream-objective');
    if (ftDreamObj && state.selectedDream) {
        ftDreamObj.innerHTML = `<span style="color:#eabb00">Objective:</span> ${state.selectedDream.title}`;
    }
}

function transitionToFastTrack() {
    const p = state.getCurrentPlayer();
    const isHuman = !p.isAI;

    showAlertCard(
        isHuman ? "🎉 CONGRATULATIONS! 🎉" : "🚀 AI ALERT! 🚀",
        isHuman 
            ? "Your Passive Income now exceeds your Total Expenses!\nYou have successfully escaped the Rat Race!\n\nWelcome to the FAST TRACK! 🏎️💨"
            : "The Computer's Passive Income now exceeds its Total Expenses!\nIt has successfully escaped the Rat Race and entered the FAST TRACK! 🏎️💨",
        isHuman ? "🔓" : "🐭",
        "var(--success)"
    );
    
    // Fast Track Math Calculations (202 Rules: 100x Passive Income)
    const finalPassive = state.getPassiveIncome();
    const roundedPassive = Math.round(finalPassive / 1000) * 1000;
    
    p.isFastTrack = true;
    p.fastTrackBaseIncome = roundedPassive * 100; // Starting Fast Track Cashflow Day income
    p.cash += p.fastTrackBaseIncome; // Immediate bonus based on rules
    p.boardPosition = 0; // Reset position for the outer ring
    
    if (isHuman) {
        showAlertCard(
            "Fast Track Goal",
            `Your unique Fast Track Cashflow Day Income is ${formatMoney(p.fastTrackBaseIncome)}.\nYour goal is to increase your total Fast Track Cashflow by $50,000.`,
            "🎯",
            "var(--warning)"
        );
    }
    
    updateFastTrackUI();
    
    // Switch navigation and statement views
    const ratBtn = document.getElementById('rat-statement-btn');
    const ftBtn = document.getElementById('ft-statement-btn');
    
    if (ratBtn) ratBtn.classList.add('hidden');
    if (ftBtn) {
        ftBtn.classList.remove('hidden');
        ftBtn.classList.add('active'); // Activate the new button
    }
    
    document.getElementById('tab-statement').classList.add('hidden');
    document.getElementById('tab-fast-track-statement').classList.remove('hidden');
    
    // Switch board display
    const boardTab = document.getElementById('tab-board');
    if (boardTab) boardTab.classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (ftBtn) ftBtn.classList.add('active');
    
    // Set board to display fast track
    state.isFastTrack = true;
    updateUI();
    setTimeout(() => showAlertCard("FAST TRACK!", "Your passive income has been rounded to the nearest $1,000 and multiplied by 100 to seed your Fast Track account.", "🚀", "var(--success)"), 500);
    
    document.body.classList.add('fast-track-mode'); // For global golden theme styling
    document.querySelector('.progress-bar-container').style.display = 'none'; // No more Rat Race progress
    
    // Fully reset the board and token!
    currentBoardTrack = FAST_TRACK_TRACK;
    updateTokenPosition();
    updateUI();
}

function updatePortfolioUI() {
    const stocksContainer = document.getElementById('portfolio-stocks');
    const realEstateContainer = document.getElementById('portfolio-real-estate');
    const businessContainer = document.getElementById('portfolio-business');
    
    // Render Stocks
    if (state.assets.stocks.length === 0) {
        stocksContainer.innerHTML = '<div class="empty-state">No stocks in your portfolio yet.</div>';
    } else {
        stocksContainer.innerHTML = state.assets.stocks.map((s, idx) => `
            <div class="asset-card">
                <div class="asset-card-header">
                    <span>Stock</span>
                    <span class="asset-card-symbol">${s.symbol}</span>
                </div>
                <div class="asset-card-stats">
                    <div class="asset-card-stat"><span class="label">Shares</span><span>${s.shares}</span></div>
                    <div class="asset-card-stat"><span class="label">Cost/Share</span><span>${formatMoney(s.cost)}</span></div>
                    ${s.dividend ? `<div class="asset-card-stat"><span class="label">Dividend</span><span class="success">+${formatMoney(s.dividend)}</span></div>` : ''}
                </div>
            </div>
        `).join('');
    }

    // Render Real Estate
    if (state.assets.realEstate.length === 0) {
        realEstateContainer.innerHTML = '<div class="empty-state">No real estate properties acquired.</div>';
    } else {
        realEstateContainer.innerHTML = state.assets.realEstate.map((re, idx) => `
            <div class="asset-card">
                <div class="asset-card-header">
                    <span>${re.type}</span>
                </div>
                <div class="asset-card-stats">
                    <div class="asset-card-stat"><span class="label">Cost</span><span>${formatMoney(re.cost)}</span></div>
                    <div class="asset-card-stat"><span class="label">Down Pay</span><span>${formatMoney(re.downPayment)}</span></div>
                    <div class="asset-card-stat"><span class="label">Cashflow</span><span class="success">+${formatMoney(re.cashflow)}</span></div>
                </div>
            </div>
        `).join('');
    }

    // Render Business
    if (state.assets.business.length === 0) {
        businessContainer.innerHTML = '<div class="empty-state">No businesses owned.</div>';
    } else {
        businessContainer.innerHTML = state.assets.business.map((biz, idx) => `
            <div class="asset-card">
                <div class="asset-card-header">
                    <span>${biz.type}</span>
                </div>
                <div class="asset-card-stats">
                    <div class="asset-card-stat"><span class="label">Cost</span><span>${formatMoney(biz.cost)}</span></div>
                    <div class="asset-card-stat"><span class="label">Down Pay</span><span>${formatMoney(biz.downPayment)}</span></div>
                    <div class="asset-card-stat"><span class="label">Cashflow</span><span class="success">+${formatMoney(biz.cashflow)}</span></div>
                </div>
            </div>
        `).join('');
    }

    // New 202: Render Options
    const optionsContainer = document.getElementById('portfolio-options');
    if (state.assets.options.length === 0) {
        optionsContainer.innerHTML = '<div class="empty-state">No active options.</div>';
    } else {
        optionsContainer.innerHTML = state.assets.options.map((o, idx) => {
            const currentPrice = state.getCurrentPrice(o.symbol);
            const isCall = o.type === 'call';
            const canExercise = (isCall && currentPrice > o.strike) || (!isCall && currentPrice < o.strike);
            const spread = isCall ? (currentPrice - o.strike) : (o.strike - currentPrice);
            const potentialGain = spread * o.quantity;

            return `
            <div class="asset-card">
                <div class="asset-card-header" style="border-bottom-color: ${isCall ? '#10b981' : '#ec4899'}">
                    <span>${o.type.toUpperCase()} Option</span>
                    <span class="asset-card-symbol">${o.symbol}</span>
                </div>
                <div class="asset-card-stats">
                    <div class="asset-card-stat"><span class="label">Qty</span><span>${o.quantity}</span></div>
                    <div class="asset-card-stat"><span class="label">Strike</span><span>${formatMoney(o.strike)}</span></div>
                    <div class="asset-card-stat"><span class="label">Expiry</span><span>${o.expiry} turns</span></div>
                    ${canExercise ? `<div class="asset-card-stat"><span class="label">Gains</span><span class="success">${formatMoney(potentialGain)}</span></div>` : ''}
                </div>
                <div class="asset-card-stat" style="grid-column: span 2; font-size: 0.8rem; color: var(--text-secondary); text-align: center; margin-top: 5px;">
                    Must exercise when price is drawn.
                </div>
            </div>`;
        }).join('');
    }

    // New 202: Render Shorts
    const shortsContainer = document.getElementById('portfolio-shorts');
    if (state.assets.shorts.length === 0) {
        shortsContainer.innerHTML = '<div class="empty-state">No short positions.</div>';
    } else {
        shortsContainer.innerHTML = state.assets.shorts.map((s, idx) => {
            const currentPrice = state.getCurrentPrice(s.symbol);
            const profit = (s.salePrice - currentPrice) * s.quantity;
            const isProfitable = profit > 0;

            return `
            <div class="asset-card">
                <div class="asset-card-header" style="border-bottom-color: #8b5cf6">
                    <span>Short Position</span>
                    <span class="asset-card-symbol">${s.symbol}</span>
                </div>
                <div class="asset-card-stats">
                    <div class="asset-card-stat"><span class="label">Qty</span><span>${s.quantity}</span></div>
                    <div class="asset-card-stat"><span class="label">Sale Price</span><span>${formatMoney(s.salePrice)}</span></div>
                    <div class="asset-card-stat"><span class="label">Market</span><span>${formatMoney(currentPrice)}</span></div>
                    <div class="asset-card-stat"><span class="label">Total +/-</span><span class="${isProfitable ? 'success' : 'danger'}">${formatMoney(profit)}</span></div>
                </div>
                <button class="action-btn mini-btn primary" 
                        onclick="state.buyBackShort(${idx})" 
                        style="width: 100%; margin-top: 10px; background: #8b5cf6;">
                    Settle (Buy Back)
                </button>
            </div>`;
        }).join('');
    }
}

// --- Game Engine (Phase 2) ---

// --- GAME BOARDS ---
let currentBoardTrack = null;

const RAT_RACE_TRACK = [
    { id: 'paycheck', name: 'Payday', type: 'event', color: '#facc15', icon: '💰' },
    { id: 'deal', name: 'Opportunity', type: 'chance', color: '#22c55e', icon: '🤝' },
    { id: 'market', name: 'The Market', type: 'chance', color: '#38bdf8', icon: '📈' },
    { id: 'deal', name: 'Opportunity', type: 'chance', color: '#22c55e', icon: '🤝' },
    { id: 'doodad', name: 'Doodad', type: 'expense', color: '#f43f5e', icon: '💸' },
    { id: 'market', name: 'The Market', type: 'chance', color: '#38bdf8', icon: '📈' },
    { id: 'paycheck', name: 'Payday', type: 'event', color: '#facc15', icon: '💰' },
    { id: 'deal', name: 'Opportunity', type: 'chance', color: '#22c55e', icon: '🤝' },
    { id: 'charity', name: 'Charity', type: 'event', color: '#f97316', icon: '➕' },
    { id: 'market', name: 'The Market', type: 'chance', color: '#38bdf8', icon: '📈' },
    { id: 'doodad', name: 'Doodad', type: 'expense', color: '#f43f5e', icon: '💸' },
    { id: 'deal', name: 'Opportunity', type: 'chance', color: '#22c55e', icon: '🤝' },
    { id: 'paycheck', name: 'Payday', type: 'event', color: '#facc15', icon: '💰' },
    { id: 'deal', name: 'Opportunity', type: 'chance', color: '#22c55e', icon: '🤝' },
    { id: 'baby', name: 'Baby', type: 'event', color: '#a855f7', icon: '🍼' },
    { id: 'market', name: 'The Market', type: 'chance', color: '#38bdf8', icon: '📈' },
    { id: 'doodad', name: 'Doodad', type: 'expense', color: '#f43f5e', icon: '💸' },
    { id: 'deal', name: 'Opportunity', type: 'chance', color: '#22c55e', icon: '🤝' },
    { id: 'paycheck', name: 'Payday', type: 'event', color: '#facc15', icon: '💰' },
    { id: 'market', name: 'The Market', type: 'chance', color: '#38bdf8', icon: '📈' },
    { id: 'downsized', name: 'Downsized', type: 'event', color: '#6366f1', icon: '📉' },
    { id: 'deal', name: 'Opportunity', type: 'chance', color: '#22c55e', icon: '🤝' },
    { id: 'doodad', name: 'Doodad', type: 'expense', color: '#f43f5e', icon: '💸' },
    { id: 'market', name: 'The Market', type: 'chance', color: '#38bdf8', icon: '📈' }
];

const FAST_TRACK_TEMPLATE = [
    { type: 'ft_legal', name: 'Lawsuit', color: '#38bdf8', icon: '⚖️' }, // 0
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 1
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 2
    { type: 'ft_event', name: 'Cashflow Day', color: '#facc15', icon: '💰' }, // 3
    { type: 'ft_legal', name: 'Audit', color: '#38bdf8', icon: '🔍' }, // 4
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 5
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 6
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 7
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 8
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 9 
    { type: 'ft_event', name: 'Cashflow Day', color: '#facc15', icon: '💰' }, // 10
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 11
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 12
    { type: 'ft_legal', name: 'Divorce', color: '#38bdf8', icon: '💔' }, // 13
    { type: 'ft_event', name: 'Cashflow Day', color: '#facc15', icon: '💰' }, // 14
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 15
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 16
    { type: 'ft_legal', name: 'Audit', color: '#38bdf8', icon: '🔍' }, // 17
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 18
    { type: 'ft_event', name: 'Cashflow Day', color: '#facc15', icon: '💰' }, // 19
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 20
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 21
    { type: 'ft_legal', name: 'Lawsuit', color: '#38bdf8', icon: '⚖️' }, // 22
    { type: 'ft_event', name: 'Cashflow Day', color: '#facc15', icon: '💰' }, // 23
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 24
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 25
    { type: 'ft_legal', name: 'Audit', color: '#38bdf8', icon: '🔍' }, // 26
    { type: 'ft_opportunity', name: 'Deal', color: '#22c55e', icon: '🤝' }, // 27
    { type: 'ft_dream', color: '#a855f7', icon: '🌟' }, // 28
    { type: 'ft_event', name: 'Cashflow Day', color: '#facc15', icon: '💰' }, // 29
    { type: 'ft_charity', name: 'Charity', color: '#f97316', icon: '➕' } // 30 - Charity (Red Cross style)
];

const FAST_TRACK_TRACK = [
    // Top Row (0 to 12) - Moving Left to Right
    { type: 'ft_event', name: 'CASHFLOW DAY', title: 'CASHFLOW DAY', color: '#eab308', icon: '💰', subtext: 'Cashflow Day' }, // 0 (Corner)
    { type: 'ft_deal', name: 'Movie Theater', title: 'Movie Theater', cf: 10000, cost: 150000, color: '#16a34a', icon: '🎬', subtext: '+$10,000/mo CF' }, // 1
    { type: 'ft_deal', name: 'Research Center for Diseases', title: 'Research Center for Diseases', cf: 12000, cost: 200000, color: '#16a34a', icon: '🔬', subtext: '+$12,000/mo CF' }, // 2
    { type: 'ft_bad_partner', name: 'Bad Partner', title: 'Bad Partner', desc: 'Lose 1 Cash Flowing Asset', color: '#dc2626', icon: '😡', subtext: 'Lose 1 Asset' }, // 3
    { type: 'ft_deal', name: 'App Development Company', title: 'App Development Company', cf: 15000, cost: 150000, color: '#16a34a', icon: '📱', subtext: '+$15,000/mo CF' }, // 4
    { type: 'ft_deal', name: 'Software Co. IPO', title: 'Software Co. IPO', cf: 20000, cost: 25000, isIPO: true, color: '#16a34a', icon: '💻', subtext: 'Roll a die / $25k' }, // 5
    { type: 'ft_deal', name: 'Coffee Shop', title: 'Coffee Shop', cf: 5000, cost: 120000, color: '#16a34a', icon: '☕', subtext: '+$5,000/mo CF' }, // 6
    { type: 'ft_deal', name: '400-Unit Apartment Building', title: '400-Unit Apartment Building', cf: 20000, cost: 300000, color: '#16a34a', icon: '🏢', subtext: '+$20,000/mo CF' }, // 7
    { type: 'ft_deal', name: 'Island Vacation Rentals', title: 'Island Vacation Rentals', cf: 12000, cost: 100000, color: '#16a34a', icon: '🏝️', subtext: '+$12,000/mo CF' }, // 8
    { type: 'ft_divorce', name: 'Divorce!', title: 'Divorce!', desc: 'Lose 1/2 of your cash', color: '#dc2626', icon: '💔', subtext: 'Lose 1/2 Cash' }, // 9
    { type: 'ft_deal', name: 'Build Pro Golf Course', title: 'Build Pro Golf Course', cf: 30000, cost: 250000, color: '#16a34a', icon: '⛳', subtext: '+$30,000/mo CF' }, // 10
    { type: 'ft_deal', name: 'Pizza Shop', title: 'Pizza Shop', cf: 8000, cost: 150000, color: '#16a34a', icon: '🍕', subtext: '+$8,000/mo CF' }, // 11
    { type: 'ft_event', name: 'CASHFLOW DAY', title: 'CASHFLOW DAY', color: '#eab308', icon: '💰', subtext: 'Cashflow Day' }, // 12 (Corner)

    // Right Column (13 to 19) - Moving Top to Bottom
    { type: 'ft_deal', name: 'Collectibles Store', title: 'Collectibles Store', cf: 10000, cost: 150000, color: '#16a34a', icon: '🏺', subtext: '+$10,000/mo CF' }, // 13
    { type: 'ft_deal', name: 'Frozen Yogurt Shop', title: 'Frozen Yogurt Shop', cf: 8000, cost: 120000, color: '#16a34a', icon: '🍦', subtext: '+$8,000/mo CF' }, // 14
    { type: 'ft_deal', name: 'Bio-Tech Co. IPO', title: 'Bio-Tech Co. IPO', cf: 25000, cost: 25000, isIPO: true, color: '#16a34a', icon: '🧬', subtext: 'Roll a die / $25k' }, // 15
    { type: 'ft_repairs', name: 'Unforeseen Repairs', title: 'Unforeseen Repairs', desc: 'Pay 1/2 cash or lose 1 property', color: '#dc2626', icon: '🛠️', subtext: 'Pay 1/2 or lose 1' }, // 16
    { type: 'ft_deal', name: '200-Unit Mini Storage', title: '200-Unit Mini Storage', cf: 15000, cost: 200000, color: '#16a34a', icon: '📦', subtext: '+$15,000/mo CF' }, // 17
    { type: 'ft_deal', name: 'Dry Cleaning Business', title: 'Dry Cleaning Business', cf: 8000, cost: 100000, color: '#16a34a', icon: '👔', subtext: '+$8,000/mo CF' }, // 18
    { type: 'ft_deal', name: 'Mobile Home Park', title: 'Mobile Home Park', cf: 11000, cost: 400000, color: '#16a34a', icon: '🚐', subtext: '+$11,000/mo CF' }, // 19
    { type: 'ft_event', name: 'CASHFLOW DAY', title: 'CASHFLOW DAY', color: '#eab308', icon: '💰', subtext: 'Cashflow Day' }, // 20 (Corner)

    // Bottom Row (21 to 31) - Moving Right to Left
    { type: 'ft_deal', name: 'Family Restaurant', title: 'Family Restaurant', cf: 12000, cost: 300000, color: '#16a34a', icon: '🍽️', subtext: '+$12,000/mo CF' }, // 21
    { type: 'ft_deal', name: 'Private Wildlife Preserve', title: 'Private Wildlife Preserve', cf: 10000, cost: 125000, color: '#16a34a', icon: '🦁', subtext: '+$10,000/mo CF' }, // 22
    { type: 'ft_healthcare', name: 'Healthcare!', title: 'Healthcare!', desc: "Roll 1-3 covered, 4-6 pay all cash", color: '#dc2626', icon: '🩺', subtext: 'Roll 1-3 covered' }, // 23
    { type: 'ft_charity', name: 'CHARITY', title: 'CHARITY', desc: 'Donate 10% Cash Day, roll 1-2 dice', color: '#7e22ce', icon: '🎗️', subtext: 'Roll 1 or 2 dice' }, // 24
    { type: 'ft_deal', name: 'Burger Shop', title: 'Burger Shop', cf: 11000, cost: 300000, color: '#16a34a', icon: '🍔', subtext: '+$11,000/mo CF' }, // 25
    { type: 'ft_deal', name: 'Heat and A/C Service', title: 'Heat and A/C Service', cf: 5000, cost: 200000, color: '#16a34a', icon: '❄️', subtext: '+$5,000/mo CF' }, // 26
    { type: 'ft_deal', name: 'Quick Food Market', title: 'Quick Food Market', cf: 5000, cost: 120000, color: '#16a34a', icon: '🛒', subtext: '+$5,000/mo CF' }, // 27
    { type: 'ft_deal', name: 'Assisted Living Center', title: 'Assisted Living Center', cf: 8000, cost: 400000, color: '#16a34a', icon: '🏥', subtext: '+$8,000/mo CF' }, // 28
    { type: 'ft_lawsuit', name: 'Lawsuit!', title: 'Lawsuit!', desc: 'Pay 1/2 of your cash to defend', color: '#dc2626', icon: '⚖️', subtext: 'Pay 1/2 Cash' }, // 29
    { type: 'ft_deal', name: 'Ticket Sales Company', title: 'Ticket Sales Company', cf: 5000, cost: 150000, color: '#16a34a', icon: '🎟️', subtext: '+$5,000/mo CF' }, // 30
    { type: 'ft_deal', name: 'Hobby Supply Store', title: 'Hobby Supply Store', cf: 5000, cost: 100000, color: '#16a34a', icon: '🎨', subtext: '+$5,000/mo CF' }, // 31
    { type: 'ft_event', name: 'CASHFLOW DAY', title: 'CASHFLOW DAY', color: '#eab308', icon: '💰', subtext: 'Cashflow Day' }, // 32 (Corner)

    // Left Column (33 to 39) - Moving Bottom to Top
    { type: 'ft_deal', name: 'Fried Chicken Restaurant', title: 'Fried Chicken Restaurant', cf: 10000, cost: 300000, color: '#16a34a', icon: '🍗', subtext: '+$10,000/mo CF' }, // 33
    { type: 'ft_deal', name: 'Dry Dock Storage', title: 'Dry Dock Storage', cf: 8000, cost: 100000, color: '#16a34a', icon: '⚓', subtext: '+$8,000/mo CF' }, // 34
    { type: 'ft_deal', name: 'Beauty Salon', title: 'Beauty Salon', cf: 5000, cost: 150000, color: '#16a34a', icon: '💇', subtext: '+$5,000/mo CF' }, // 35
    { type: 'ft_tax_audit', name: 'Tax Audit!', title: 'Tax Audit!', desc: 'Pay 1/2 of your cash to accountants', color: '#dc2626', icon: '🧐', subtext: 'Pay 1/2 Cash' }, // 36
    { type: 'ft_deal', name: 'Auto Repair Shop', title: 'Auto Repair Shop', cf: 10000, cost: 150000, color: '#16a34a', icon: '🔧', subtext: '+$10,000/mo CF' }, // 37
    { type: 'ft_deal', name: 'Extreme Sports Equipment Rental', title: 'Extreme Sports Equipment Rental', cf: 10000, cost: 150000, color: '#16a34a', icon: '🏄', subtext: '+$10,000/mo CF' }, // 38
    { type: 'ft_deal', name: 'Foreign Oil Deal', title: 'Foreign Oil Deal', cf: 15000, cost: 150000, color: '#16a34a', icon: '🛢️', subtext: '+$15,000/mo CF' }  // 39
];

currentBoardTrack = RAT_RACE_TRACK;

// --- Dream Selection UI ---
let currentDreamIndex = 0;
let isSelectingDream = false;

function showDreamSelector() {
    console.log("TRIGGER: showDreamSelector called.");
    isSelectingDream = true;
    currentDreamIndex = 0;
    
    const modal = document.getElementById('card-modal');
    if (!modal) {
        console.error("CRITICAL ERROR: #card-modal not found in DOM!");
        return;
    }
    
    modal.style.top = ''; // Reset drag position
    modal.style.left = '';
    modal.style.right = '';
    modal.style.bottom = '';
    modal.style.transform = 'translate(-50%, -50%)'; // Force reset position to center
    modal.style.zIndex = '10000'; // Force to top
    modal.style.display = 'block'; // Ensure it's not display:none

    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    
    modal.classList.remove('sidebar-docked', 'hidden');
    modal.classList.add('modal-prominence');

    
    flipModalToFront();
    SoundManager.playFlip();
    
    // Hide standard close button during selection
    document.querySelector('.close-btn').style.display = 'none';
    
    // Show navigation arrows
    const prevBtn = document.getElementById('card-prev-btn');
    const nextBtn = document.getElementById('card-next-btn');
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.classList.remove('hidden');
    
    updateDreamSelectionCard();
}

function updateDreamSelectionCard() {
    const dream = DREAMS_DATA[currentDreamIndex];
    const modal = document.getElementById('card-modal');
    
    document.getElementById('card-icon').textContent = '🌟';
    document.getElementById('card-type').textContent = 'CHOOSE YOUR DREAM';
    document.getElementById('card-header').style.borderBottomColor = '#ec4899';
    
    document.getElementById('card-title').textContent = dream.title;
    document.getElementById('card-desc').textContent = dream.description;
    
    // Hide image container as per user request (screenshot removal)
    document.getElementById('card-img-container').classList.add('hidden');
    
    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = '';
    addStat(statsContainer, 'Cost', formatMoney(dream.cost), 'success');
    
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';
    
    const chooseBtn = document.createElement('button');
    chooseBtn.className = 'action-btn';
    chooseBtn.style.background = '#ec4899';
    chooseBtn.textContent = 'SELECT DREAM';
    chooseBtn.onclick = confirmDream;
    
    actionsContainer.appendChild(chooseBtn);
}

function nextDream(dir) {
    currentDreamIndex += dir;
    if (currentDreamIndex < 0) currentDreamIndex = DREAMS_DATA.length - 1;
    if (currentDreamIndex >= DREAMS_DATA.length) currentDreamIndex = 0;
    updateDreamSelectionCard();
    SoundManager.playFlip();
}

function confirmDream() {
    // Assign the specific board index based on the chosen dream for Human
    const dreamIndices = [4, 8, 14, 22, 31, 38];
    const human = state.players[0];
    human.selectedDream = DREAMS_DATA[currentDreamIndex];
    human.dreamSpaceId = dreamIndices[currentDreamIndex];
    
    // Assign a random dream for AI (different from human)
    const ai = state.players[1];
    let aiDreamIdx;
    do { aiDreamIdx = Math.floor(Math.random() * DREAMS_DATA.length); } while (aiDreamIdx === currentDreamIndex);
    ai.selectedDream = DREAMS_DATA[aiDreamIdx];
    ai.dreamSpaceId = dreamIndices[aiDreamIdx];

    const modal = document.getElementById('card-modal');
    modal.classList.add('hidden');
    
    // Restore standard UI for next cards
    document.querySelector('.close-btn').style.display = 'block';
    document.getElementById('card-prev-btn').classList.add('hidden');
    document.getElementById('card-next-btn').classList.add('hidden');
    modal.classList.add('sidebar-docked'); 
    
    const sidebarDreamEl = document.getElementById('player-dream');
    if (sidebarDreamEl) {
        sidebarDreamEl.innerHTML = `${state.selectedDream.title}`;
        sidebarDreamEl.style.display = 'flex';
    }
    
    const ftDreamObj = document.getElementById('ft-dream-objective');
    if (ftDreamObj && state.isFastTrack) {
        ftDreamObj.innerHTML = `<span style="color:#eabb00">Objective:</span> ${state.selectedDream.title}`;
    }
    
    // Final UI refresh to show the marker
    renderBoard();
    updateUI();
    if (state.isFastTrack) updateFastTrackUI();

    // Automatically direct the user to the board tab
    const boardTab = document.querySelector('[data-tab="board"]');
    if (boardTab) boardTab.click();

    // Now show the profession info
    setTimeout(() => {
        showAlertCard(
            "Game Start!",
            `Excellent choice! Your dream is to fund "${state.selectedDream.title}".\n\nYour new profession is: ${state.job.title}.\nStarting Cash: ${formatMoney(state.cash)}.\nReach the Fast Track to make it happen!`,
            "🌟",
            "var(--accent-primary)"
        );
        SoundManager.playCash();
    }, 500);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initTabs();
    
    // Assign navigation arrow clicks
    document.getElementById('card-prev-btn').onclick = () => nextDream(-1);
    document.getElementById('card-next-btn').onclick = () => nextDream(1);
    
    // Render the board and background UI first so it's visible clearly
    renderBoard();
    updateUI();
});

function initTabs() {
    const navBtns = document.querySelectorAll('.nav-btn[data-tab]');
    const views = {
        'statement': document.getElementById('tab-statement'),
        'fast-track-statement': document.getElementById('tab-fast-track-statement'),
        'board': document.getElementById('tab-board'),
        'portfolio': document.getElementById('tab-portfolio'),
        'stocks': document.getElementById('tab-stocks')
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            if (!tabId || !views[tabId]) return;

            // 1. Manage button states
            navBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // 2. Manage view visibility
            Object.keys(views).forEach(key => {
                const v = views[key];
                if (v) {
                    if (key === tabId) {
                        v.classList.remove('hidden');
                    } else {
                        v.classList.add('hidden');
                    }
                }
            });
            
            // 3. Special handling for stocks tab
            if (tabId === 'stocks') {
                updateStockTabUI(state.lastSymbolDrawn || 'OK4U');
            }
            if (tabId === 'board') {
                setTimeout(adjustBoardScale, 10); // Small delay to ensure tab is visible
            }
        });
    });
}

function adjustBoardScale() {
    const wrapper = document.getElementById('full-board-wrapper');
    const container = document.querySelector('.board-container');
    if (!wrapper || !container) return;

    // The board is designed for 1690x1170 base units (13x9 squares of 130px)
    const targetW = 1690;
    const targetH = 1170;
    
    // Calculate the scale to fit container width/height minus some padding
    const scaleW = container.clientWidth / targetW;
    const scaleH = (container.clientHeight - 40) / targetH;
    
    const scale = Math.min(scaleW, scaleH, 1); // Never scale up beyond 1.0 for quality
    
    wrapper.style.transform = `scale(${scale})`;
}

// Global listeners
window.addEventListener('resize', adjustBoardScale);

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, innerRadius, outerRadius, startAngle, endAngle) {
    const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
    const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
        "M", startOuter.x, startOuter.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
    ].join(" ");

    return d;
}

function renderRatRace() {
    const container = document.getElementById('rat-race-circle');
    container.innerHTML = ''; // Clear existing
    
    // Add central logo/info back
    const centerInfo = document.createElement('div');
    centerInfo.className = 'board-center-info';
    centerInfo.innerHTML = `
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Rich_Dad_Poor_Dad_logo.svg/1024px-Rich_Dad_Poor_Dad_logo.svg.png" 
             style="height:30px; margin-bottom:8px; opacity:0.8; mix-blend-mode: screen; filter: grayscale(1) invert(1);" alt="Logo" onerror="this.style.display='none'">
        <div id="dice-result">🎲 --</div>
        <div id="action-prompt">Your turn!</div>
    `;
    container.appendChild(centerInfo);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "720");
    svg.setAttribute("height", "720");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.transform = "rotate(-7.5deg)";
    
    const centerX = 360, centerY = 360;
    const innerRadius = 200;
    const outerRadius = 355;
    const totalSpaces = RAT_RACE_TRACK.length;
    let anglePerSpace = 360 / totalSpaces;

    RAT_RACE_TRACK.forEach((space, index) => {
        const startAngle = index * anglePerSpace;
        const endAngle = startAngle + anglePerSpace;
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", describeArc(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle));
        path.setAttribute("fill", space.color);
        path.setAttribute("stroke", "rgba(0,0,0,0.4)");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("class", "svg-board-space");
        svg.appendChild(path);

        const midAngle = startAngle + (anglePerSpace / 2);
        const textRadius = innerRadius + (outerRadius - innerRadius) / 2;
        const pos = polarToCartesian(centerX, centerY, textRadius, midAngle);
        
        const isLeftHalf = midAngle > 180 && midAngle < 360;
        let textRotation = midAngle - 90;
        if (isLeftHalf) textRotation += 180;
        
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${pos.x}, ${pos.y}) rotate(${textRotation})`);
        
        const iconX = isLeftHalf ? 35 : -35;
        const nameX = isLeftHalf ? 10 : -10;
        const nameAnchor = isLeftHalf ? "end" : "start";
        
        const textIcon = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textIcon.setAttribute("text-anchor", "middle");
        textIcon.setAttribute("dominant-baseline", "middle");
        textIcon.setAttribute("y", "0");
        textIcon.setAttribute("x", iconX);
        textIcon.setAttribute("font-size", "28px");
        textIcon.textContent = space.icon;
        
        const words = space.name.toUpperCase().split(' ');
        let lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            if (currentLine.length + words[i].length < 12) currentLine += ' ' + words[i];
            else { lines.push(currentLine); currentLine = words[i]; }
        }
        lines.push(currentLine);

        // Shrink font and adjust spacing to prevent overlap with emoji
        let fontSize = (lines.length > 1 || currentLine.length > 8) ? "10.5px" : "11.5px";
        const textName = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textName.setAttribute("text-anchor", nameAnchor);
        textName.setAttribute("dominant-baseline", "middle");
        textName.setAttribute("x", nameX);
        textName.setAttribute("font-size", fontSize);
        textName.setAttribute("font-weight", "600");
        textName.setAttribute("fill", "#ffffff");
        
        if (lines.length === 1) {
            textName.textContent = lines[0];
        } else {
            const lineHeight = 11;
            const startY = -((lines.length - 1) * lineHeight) / 2;
            lines.forEach((line, idx) => {
                const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                tspan.setAttribute("x", nameX);
                tspan.setAttribute("y", startY + (idx * lineHeight));
                tspan.textContent = line;
                textName.appendChild(tspan);
            });
        }
        
        g.appendChild(textIcon);
        g.appendChild(textName);
        
        // Add ownership marker for real estate in Rat Race
        if (space.id === 'opportunity' || space.type === 'opportunity') {
            const ownerIdx = state.players.findIndex(p => p.assets.realEstate.some(re => (re.type || "").toUpperCase() === space.name.toUpperCase()));
            if (ownerIdx !== -1) {
                const markerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                markerCircle.setAttribute("cx", isLeftHalf ? 60 : -60);
                markerCircle.setAttribute("cy", "-25");
                markerCircle.setAttribute("r", "12");
                markerCircle.setAttribute("fill", ownerIdx === 0 ? "var(--accent-primary)" : "var(--danger)");
                markerCircle.setAttribute("stroke", "white");
                markerCircle.setAttribute("stroke-width", "2");
                g.appendChild(markerCircle);

                const markerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                markerText.setAttribute("text-anchor", "middle");
                markerText.setAttribute("dominant-baseline", "middle");
                markerText.setAttribute("x", isLeftHalf ? 60 : -60);
                markerText.setAttribute("y", "-25");
                markerText.setAttribute("font-size", "14px");
                markerText.textContent = ownerIdx === 0 ? "🦁" : "🐭";
                g.appendChild(markerText);
            }
        }
        
        svg.appendChild(g);
    });

    container.appendChild(svg);
}

function renderFastTrack() {
    const container = document.getElementById('fast-track-container');
    if (!container) return;
    container.innerHTML = '';
    
    // Authentic grid from photo: 13 wide, 9 high. Perimeter indices 0-39 (Total 40)
    const sw = 130;
    const sh = 130;
    const gridW = 13;
    const gridH = 9;

    FAST_TRACK_TRACK.forEach((space, i) => {
        let x, y;
        if (i < 13) { // Top (indices 0..12)
            x = i * sw; y = 0;
        } else if (i < 20) { // Right (indices 13..19)
            x = (gridW - 1) * sw; y = (i - 12) * sh;
        } else if (i < 33) { // Bottom (indices 20..32)
            x = (12 - (i - 20)) * sw; y = (gridH - 1) * sh;
        } else { // Left (indices 33..39)
            x = 0; y = (8 - (i - 32)) * sh;
        }

        const el = document.createElement('div');
        el.className = 'ft-space';
        el.style.backgroundColor = space.color;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.width = sw + 'px';
        el.style.height = sh + 'px';
        el.style.position = 'absolute';
        el.style.boxSizing = 'border-box';
        el.style.borderRadius = '6px';
        el.style.border = '1px solid rgba(255,255,255,0.3)';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.justifyContent = 'space-between';
        el.style.alignItems = 'center';
        el.style.textAlign = 'center';
        el.style.padding = '8px 5px';
        el.style.transform = 'none'; 
        el.style.overflow = 'hidden';
        
        // Marker for YOUR DREAM
        if (i === state.dreamSpaceId) {
            el.innerHTML = `
                <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); font-size:22px; filter:drop-shadow(0 0 5px #a855f7);">🎯</div>
                <div class="ft-icon" style="font-size:24px; margin:0;">🌟</div>
                <div style="font-size:11px; font-weight:800; color:#fff; text-transform:uppercase;">DREAM GOAL</div>
                <div style="font-size:9px; line-height:1.1; font-weight:700; color:#fef08a; text-transform:uppercase;">${state.selectedDream?.title || 'DREAM'}</div>
                <div style="font-size:9px; color:rgba(255,255,255,0.9);">${formatMoney(state.selectedDream?.cost || 100000)}</div>
            `;
            el.style.border = '3px solid #a855f7';
            el.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.6)';
        } else if (space.type === 'ft_event') {
            el.innerHTML = `
                <div class="ft-icon" style="font-size:28px; margin-top:2px;">${space.icon}</div>
                <div style="font-size:12px; line-height:1.1; font-weight:900; color:#78350f; text-transform:uppercase;">${space.title}</div>
                <div style="font-size:9px; font-weight:800; color:#854d0e;">COLLECT INCOME</div>
            `;
        } else if (space.type === 'ft_deal') {
            el.innerHTML = `
                <div style="font-size:10.5px; line-height:1.15; font-weight:800; color:#ffffff; text-shadow:0 1px 2px rgba(0,0,0,0.5);">${space.title}</div>
                <div class="ft-icon" style="font-size:22px; margin:2px 0;">${space.icon}</div>
                <div style="font-size:10px; font-weight:800; color:#fef08a; text-shadow:0 1px 2px rgba(0,0,0,0.5);">${space.isIPO ? 'IPO DEAL' : `+${formatMoney(space.cf)}/mo CF`}</div>
                <div style="font-size:8.5px; font-weight:600; color:rgba(255,255,255,0.9);">${formatMoney(space.cost)} down</div>
            `;
        } else {
            el.innerHTML = `
                <div style="font-size:11px; line-height:1.15; font-weight:800; color:#ffffff;">${space.title}</div>
                <div class="ft-icon" style="font-size:24px; margin:2px 0;">${space.icon}</div>
                <div style="font-size:9px; line-height:1.1; font-weight:600; color:rgba(255,255,255,0.95);">${space.subtext || space.desc || ''}</div>
            `;
        }
        
        // Add ownership marker if business
        if (space.type === 'ft_deal') {
            const ownerIdx = state.players.findIndex(p => p.fastTrackBusinesses && p.fastTrackBusinesses.some(b => b.title === space.title));
            if (ownerIdx !== -1) {
                const marker = document.createElement('div');
                marker.className = `owner-dot ${ownerIdx === 0 ? 'human' : 'ai'}`;
                el.appendChild(marker);
                el.style.border = `2px solid ${ownerIdx === 0 ? 'var(--accent-primary)' : 'var(--danger)'}`;
                el.style.boxShadow = `0 0 10px ${ownerIdx === 0 ? 'var(--accent-glow)' : 'var(--danger-glow)'}`;
            }
        }
        
        container.appendChild(el);
    });

    updateTokenPosition();
}

function renderBoard() {
    renderRatRace();
    renderFastTrack();
    updateTokenPosition();
}

function updateTokenPosition() {
    state.players.forEach((p, idx) => {
        const ratToken = document.getElementById(`player-token-rat-${idx}`);
        const fastToken = document.getElementById(`player-token-fast-${idx}`);
        
        if (!ratToken || !fastToken) return;

        if (p.isFastTrack) {
            ratToken.classList.add('hidden');
            fastToken.classList.remove('hidden');
            
            const sw = 130;
            const sh = 130;
            const gridW = 13;
            const gridH = 9;
            const i = p.boardPosition;
            let x, y;
            if (i < 13) { x = i * sw; y = 0; }
            else if (i < 20) { x = (gridW - 1) * sw; y = (i - 12) * sh; }
            else if (i < 33) { x = (12 - (i - 20)) * sw; y = (gridH - 1) * sh; }
            else { x = 0; y = (8 - (i - 32)) * sh; }

            fastToken.style.left = (x + sw/2) + 'px';
            fastToken.style.top = (y + sh/2) + 'px';
            fastToken.style.transform = `translate(-50%, -50%) ${idx === 1 ? 'translate(10px, 10px)' : ''}`;
        } else {
            fastToken.classList.add('hidden');
            ratToken.classList.remove('hidden');
            
            const angle = (p.boardPosition / RAT_RACE_TRACK.length) * 360;
            const radius = 278; // Exact center radius of the Rat Race SVG track ring (200px to 355px)
            const rad = (angle - 90) * (Math.PI / 180);
            const x = 845 + radius * Math.cos(rad);
            const y = 585 + radius * Math.sin(rad);
            
            ratToken.style.left = x + 'px';
            ratToken.style.top = y + 'px';
            ratToken.style.transform = `translate(-50%, -50%) ${idx === 1 ? 'translate(10px, 10px)' : ''}`;
        }
    });
}

function renderStockChart(symbol, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const history = state.priceHistory[symbol] || [0];
    const isTab = (containerId === 'tab-stock-chart');
    const width = isTab ? 1000 : 800;
    const height = isTab ? 420 : 250;
    const paddingX = isTab ? 80 : 70;
    const paddingY = isTab ? 40 : 30;
    const fontSize = isTab ? 14 : 12;
    
    const maxP = Math.max(...history, 60);
    const minP = Math.min(...history, 10);
    const maxPrice = Math.ceil(maxP / 10) * 10;
    const minPrice = Math.floor(minP / 10) * 10;
    const range = maxPrice - minPrice || 10;
    
    const getY = (price) => (height - paddingY) - ((price - minPrice) / range) * (height - paddingY * 2);

    const points = history.map((p, i) => {
        const x = paddingX + (i * ((width - paddingX * 2) / Math.max(history.length - 1, 1)));
        const y = getY(p);
        return `${x},${y}`;
    }).join(' ');

    // Highlight active positions
    let positionVisuals = '';
    const activeOption = state.assets.options.find(o => o.symbol === symbol);
    const activeShort = state.assets.shorts.find(s => s.symbol === symbol);
    const currentPrice = history[history.length - 1];

    if (activeOption || activeShort) {
        const targetPrice = activeOption ? activeOption.strike : activeShort.salePrice;
        const targetY = getY(targetPrice);
        const currentY = getY(currentPrice);
        const isCall = activeOption ? activeOption.type === 'call' : false;
        const isPut = activeOption ? activeOption.type === 'put' : false;
        const isShort = !!activeShort;

        let profitColor = 'var(--success-glow)';
        let lossColor = 'var(--danger-glow)';
        
        positionVisuals += `<line x1="${paddingX}" y1="${targetY}" x2="${width - paddingX}" y2="${targetY}" stroke="${isShort ? '#8b5cf6' : 'var(--warning)'}" stroke-width="2" stroke-dasharray="4,4" />`;
        positionVisuals += `<text x="${width - paddingX + 5}" y="${targetY + 4}" font-size="10" fill="var(--text-secondary)">TARGET</text>`;

        const rectY = Math.min(targetY, currentY);
        const rectH = Math.abs(targetY - currentY);
        let color = '#334155';

        if ((isCall && currentPrice > targetPrice) || (isPut && currentPrice < targetPrice) || (isShort && currentPrice < targetPrice)) {
            color = 'rgba(16, 185, 129, 0.2)';
        } else if ((isCall && currentPrice < targetPrice) || (isPut && currentPrice > targetPrice) || (isShort && currentPrice > targetPrice)) {
            color = 'rgba(239, 68, 68, 0.2)';
        }

        positionVisuals += `<rect x="${paddingX}" y="${rectY}" width="${width - paddingX * 2}" height="${rectH}" fill="${color}" />`;
    }

    // Generate Grid Lines and Labels
    let gridLines = '';
    let priceLabels = '';
    const steps = isTab ? 6 : 4;
    for (let i = 0; i <= steps; i++) {
        const y = paddingY + (i * (height - paddingY * 2) / steps);
        const price = maxPrice - (i * range / steps);
        gridLines += `<line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" stroke="rgba(255,255,255,0.08)" />`;
        priceLabels += `<text x="${paddingX - 12}" y="${y + 4}" text-anchor="end" font-size="${fontSize}" font-weight="600" fill="var(--text-secondary)">$${Math.round(price)}</text>`;
    }

    const svgHeightStyle = isTab ? 'height: 380px; max-height: 420px;' : 'height: 200px; max-height: 220px;';
    let svg = `<svg viewBox="0 0 ${width} ${height}" class="stock-chart-svg" style="width: 100%; ${svgHeightStyle} display: block; background: rgba(0,0,0,0.25); border-radius: 8px; margin-top: 10px;">
        ${gridLines}
        ${priceLabels}
        ${positionVisuals}
        <line x1="${paddingX}" y1="${paddingY}" x2="${paddingX}" y2="${height - paddingY}" stroke="rgba(255,255,255,0.1)" />
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="rgba(255,255,255,0.1)" />
        <polyline points="${points}" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" stroke-dasharray="6,4" stroke-linejoin="round" />
        ${history.length > 0 ? `
            <circle cx="${points.split(' ').pop().split(',')[0]}" cy="${points.split(' ').pop().split(',')[1]}" r="5" fill="var(--warning)" />
            <circle cx="${points.split(' ').pop().split(',')[0]}" cy="${points.split(' ').pop().split(',')[1]}" r="8" fill="var(--warning)" fill-opacity="0.3">
                <animate attributeName="r" from="5" to="12" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
        ` : ''}
    </svg>`;
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-family: var(--font-heading);">
            <div style="font-size: ${isTab ? '16px' : '14px'}; color: var(--text-primary); font-weight: 700;">${symbol} PERFORMANCE</div>
            <div style="font-size: 12px; color: var(--text-secondary);">Last 50 Turns</div>
        </div>
        ${svg}
    `;
}

function handleSpaceLanding(space) {
    const p = state.getCurrentPlayer();
    const prompt = document.getElementById('action-prompt');
    const nameToUse = (p.isFastTrack ? (space.title || space.name) : space.name) || 'Space';
    prompt.textContent = `${p.isAI ? 'Computer' : 'You'} landed on: ${nameToUse}`;

    // Systematically switch to the Financial Statement context
    const statementTab = document.querySelector('[data-tab="statement"]');
    if (statementTab && !p.isAI) statementTab.click(); 

    // 1. Check for Payday / Cashflow Day
    if (space.type === 'ft_event' || space.id === 'paycheck' || (space.id && space.id.startsWith('ft_cashflow'))) {
        const income = state.getMonthlyCashflow();
        
        if (income < 0 && p.cash < Math.abs(income)) {
            state.declareBankruptcy();
            return;
        }

        p.cash += income;
        updateUI();
        prompt.innerHTML = `<strong>${p.isFastTrack ? 'CASHFLOW DAY' : 'PAYDAY'}!</strong><br>${p.isAI ? 'Computer' : 'You'} received +${formatMoney(income)}`;
        
        // 202: Check for Exit Rat Race (2x Expenses)
        if (!p.isFastTrack && !p.isAI) {
            const target = state.getTotalExpenses() * 2;
            if (state.getPassiveIncome() >= target) {
                transitionToFastTrack();
                return; 
            }
        }

        // 202: Check for Win on Fast Track
        if (p.isFastTrack) {
            const hasEnoughIncome = p.fastTrackAssetIncome >= 50000;
            const hasMyDream = (p.ownedDreams && p.ownedDreams.some(d => d.isMyDream));
            
            if (hasEnoughIncome || hasMyDream) {
                showAlertCard(
                    "🏆 ULTIMATE VICTORY! 🏆",
                    `${p.isAI ? 'The Computer' : 'You'} achieved the victory condition (${hasEnoughIncome ? '$50,000 Income' : 'Bought Dream'})!\nGAME OVER!`,
                    "💎",
                    "var(--success)",
                    () => startNewGame()
                );
                return;
            }
        }

        // Non-modal resolution: move to next turn
        setTimeout(() => state.nextTurn(), 1000);

    } else if (space.id === 'deal') {
        setTimeout(() => showDealChoiceModal(space), 800);
    } else if (space.id === 'market') {
        setTimeout(() => initiateMarketPhase(), 800);
    } else if (space.id === 'doodad') {
        if (p.isAI) {
            const card = drawCard('doodad');
            p.cash -= (card.cost || 0);
            updateUI();
            showAlertCard("AI DOODAD", `The computer spent ${formatMoney(card.cost)} on ${card.title}.`, "💸", "var(--danger)");
            setTimeout(() => state.nextTurn(), 1500);
        } else {
            setTimeout(() => showCardModal(space.id, space), 800);
        }
    } else if (space.id === 'downsized') {
        p.cash -= state.getTotalExpenses();
        p.downsizedTurnsLeft = 2; 
        updateUI();
        showAlertCard(
            "Downsized!",
            `${p.isAI ? 'Computer' : 'You'} lost ${formatMoney(state.getTotalExpenses())} and lose 2 turns!`,
            "📉",
            "var(--danger)"
        );
        setTimeout(() => state.nextTurn(), 1500);
    } else if (space.type === 'ft_charity' || space.id === 'charity' || (space.id && space.id.startsWith('ft_charity'))) {
        if (p.isAI) {
            const cost = p.isFastTrack ? 100000 : (p.job.salary * 0.1);
            if (p.cash >= cost * 3) {
                p.cash -= cost;
                p.charityTurnsLeft = 3;
                updateUI();
                showAlertCard("AI CHARITY", "The computer donated $10,000 to charity! It will roll extra dice for 3 turns.", "❤️", "var(--success)");
            }
            setTimeout(() => state.nextTurn(), 1500);
        } else {
            setTimeout(() => showCharityModal(space), 800);
        }
    } else if (space.id === 'baby') {
        p.childrenCount++;
        updateUI();
        showAlertCard(
            "New Baby!",
            `${p.isAI ? 'The computer' : 'You'} had a baby! Expenses increased.`,
            "👶",
            "var(--accent-primary)"
        );
        setTimeout(() => state.nextTurn(), 1500);
    } else if (p.isFastTrack) {
        setTimeout(() => showFastTrackModal(space), 800);
    } else {
        setTimeout(() => state.nextTurn(), 1000);
    }
}

function processNextCard() {
    if (state.cardQueue.length === 0) {
        // Queue empty, wait for next turn or player action
        return;
    }

    const next = state.cardQueue.shift();
    setTimeout(() => {
        if (next.type === 'deal') {
            showDealChoiceModal(next.space);
        } else if (next.type === 'market') {
            initiateMarketPhase(next.space);
        } else if (next.type === 'doodad') {
            showCardModal('doodad', next.space);
        }
    }, 400); // Small delay between cards
}

function showFastTrackModal(space) {
    const p = state.getCurrentPlayer();
    const opp = state.getOpponent();
    const modal = document.getElementById('card-modal');
    
    SoundManager.playFlip();
    flipModalToFront();
    
    const cardIcon = document.getElementById('card-icon');
    const cardTitle = document.getElementById('card-title');
    const cardType = document.getElementById('card-type');
    const cardDesc = document.getElementById('card-desc');
    const statsContainer = document.getElementById('card-stats');
    const modalActions = document.getElementById('card-actions');
    
    cardIcon.textContent = space.icon || "🏬";
    cardType.textContent = (space.name || "Business").toUpperCase();
    document.getElementById('card-header').style.borderBottomColor = space.color || "var(--success)";
    statsContainer.innerHTML = '';
    modalActions.innerHTML = '';
    
    const finishTurn = () => {
        closeModal(modal);
        state.nextTurn();
    };

    if (space.type === 'ft_deal') {
        const myBusiness = p.fastTrackBusinesses.find(b => b.title === space.title);
        const oppBusiness = opp.fastTrackBusinesses.find(b => b.title === space.title);
        
        let cost = space.cost || 100000;
        let cf = space.cf || 5000;
        let actionLabel = "BUY BUSINESS";
        let description = "Excellent Business Opportunity. Purchase this asset to increase your monthly passive income.";

        if (myBusiness) {
            description = "You already own this business. Franchise it to double your income from this asset!";
            actionLabel = "FRANCHISE BUSINESS";
            cost = space.cost; 
        } else if (oppBusiness) {
            cost = oppBusiness.franchised ? (space.cost * 3) : (space.cost * 2);
            description = `This business is owned by ${opp.isAI ? 'the Computer' : 'Player 1'}. You can perform a Hostile Buyout for ${formatMoney(cost)}!`;
            actionLabel = "HOSTILE BUYOUT";
        }

        cardTitle.textContent = myBusiness ? `${space.title} (Franchise)` : space.title;
        cardDesc.textContent = description;
        
        addStat(statsContainer, 'Cost', formatMoney(cost));
        addStat(statsContainer, 'Income', `+${formatMoney(cf)}`, 'success');

        const buyBtn = document.createElement('button');
        buyBtn.className = `action-btn success ${p.cash >= cost ? '' : 'disabled'}`;
        buyBtn.textContent = `${actionLabel} (${formatMoney(cost)})`;
        buyBtn.disabled = p.cash < cost;
        buyBtn.onclick = () => {
            p.cash -= cost;
            if (myBusiness) {
                myBusiness.franchised = true;
                myBusiness.cf *= 2;
                p.fastTrackAssetIncome += space.cf; 
            } else if (oppBusiness) {
                opp.cash += cost; 
                opp.fastTrackAssetIncome -= oppBusiness.cf;
                opp.fastTrackBusinesses = opp.fastTrackBusinesses.filter(b => b.title !== space.title);
                p.fastTrackBusinesses.push({ title: space.title, cf: oppBusiness.cf, franchised: oppBusiness.franchised });
                p.fastTrackAssetIncome += oppBusiness.cf;
            } else {
                p.fastTrackBusinesses.push({ title: space.title, cf: cf, franchised: false });
                p.fastTrackAssetIncome += cf;
            }
            updateUI();
            
            // Immediate Win Check after purchase
            if (p.fastTrackAssetIncome >= 50000) {
                showAlertCard(
                    "🏆 ULTIMATE VICTORY! 🏆",
                    `${p.isAI ? 'The Computer' : 'You'} reached $50,000 in monthly cashflow!\nGAME OVER!`,
                    "💎",
                    "var(--success)",
                    () => startNewGame()
                );
                return;
            }
            finishTurn();
        };

        const passBtn = document.createElement('button');
        passBtn.className = 'action-btn danger';
        passBtn.textContent = 'PASS';
        passBtn.onclick = finishTurn;

        modalActions.appendChild(buyBtn);
        modalActions.appendChild(passBtn);

        if (p.isAI) {
            setTimeout(() => {
                const shouldBuy = p.cash >= (cost * 1.5);
                if (shouldBuy && !buyBtn.disabled) buyBtn.click();
                else passBtn.click();
            }, 1500);
        }

    } else if (space.type === 'ft_dream') {
        const isMyDream = space.id === p.dreamSpaceId || space.title === p.selectedDream?.title;
        const isOppDream = space.id === opp.dreamSpaceId || space.title === opp.selectedDream?.title;
        const alreadyOwned = p.ownedDreams.some(d => d.title === space.title);

        cardTitle.textContent = space.title;
        
        if (isMyDream) {
            cardDesc.textContent = "This is your Ultimate Dream! Buy it to fulfill one of the two winning conditions!";
            const cost = space.cost;
            addStat(statsContainer, 'Cost', formatMoney(cost));
            const buyBtn = document.createElement('button');
            buyBtn.className = `action-btn success ${p.cash >= cost ? '' : 'disabled'}`;
            buyBtn.textContent = alreadyOwned ? "ALREADY OWNED" : `BUY MY DREAM (${formatMoney(cost)})`;
            buyBtn.disabled = p.cash < cost || alreadyOwned;
            buyBtn.onclick = () => {
                p.cash -= cost;
                p.ownedDreams.push({ ...space, isMyDream: true });
                updateUI();
                
                showAlertCard(
                    "🏆 ULTIMATE VICTORY! 🏆",
                    `${p.isAI ? 'The Computer' : 'You'} bought their dream and WON THE GAME!`,
                    "💎",
                    "var(--success)",
                    () => startNewGame()
                );
            };
            modalActions.appendChild(buyBtn);
        } else if (isOppDream) {
            cardDesc.textContent = `You landed on ${opp.isAI ? 'the Computer' : 'Player 1'}'s dream! By simply stepping here, you've made it harder for them. Their dream cost has just DOUBLED!`;
            opp.selectedDream.cost *= 2; 
            const okBtn = document.createElement('button');
            okBtn.className = 'action-btn warning';
            okBtn.textContent = 'OUCH! (CONTINUE)';
            okBtn.onclick = finishTurn;
            modalActions.appendChild(okBtn);
        } else {
            cardDesc.textContent = "This is a random dream. Buying two of these (and having $50k income) is an alternative way to win!";
            const cost = space.cost;
            addStat(statsContainer, 'Cost', formatMoney(cost));
            const buyBtn = document.createElement('button');
            buyBtn.className = `action-btn success ${p.cash >= cost ? '' : 'disabled'}`;
            buyBtn.textContent = alreadyOwned ? "ALREADY OWNED" : `BUY DREAM (${formatMoney(cost)})`;
            buyBtn.disabled = p.cash < cost || alreadyOwned;
            buyBtn.onclick = () => {
                p.cash -= cost;
                p.ownedDreams.push({ ...space, isMyDream: false });
                updateUI();
                finishTurn();
            };
            modalActions.appendChild(buyBtn);
        }

        const passBtn = document.createElement('button');
        passBtn.className = 'action-btn danger';
        passBtn.textContent = 'PASS';
        passBtn.onclick = finishTurn;
        modalActions.appendChild(passBtn);

        if (p.isAI) {
            setTimeout(() => {
                const b = modalActions.querySelector('.success:not(.disabled)');
                if (b && p.cash >= (space.cost * 2)) b.click();
                else passBtn.click();
            }, 1500);
        }

    } else if (space.type === 'ft_bad_partner') {
        cardTitle.textContent = "Bad Partner!";
        cardIcon.textContent = "😡";
        
        const hasBiz = p.fastTrackBusinesses && p.fastTrackBusinesses.length > 0;
        if (hasBiz) {
            const lostBiz = p.fastTrackBusinesses.pop();
            p.fastTrackAssetIncome = Math.max(0, p.fastTrackAssetIncome - lostBiz.cf);
            cardDesc.textContent = `Votre associé vous a trahi ! Vous perdez votre entreprise : ${lostBiz.title} (-${formatMoney(lostBiz.cf)}/mois de cashflow).`;
            addStat(statsContainer, 'Perte Actif', lostBiz.title, 'danger');
        } else {
            const cashLoss = Math.min(p.cash, 10000);
            p.cash -= cashLoss;
            cardDesc.textContent = `Mauvais partenaire ! Vous n'avez pas d'entreprise à perdre, mais vous payez ${formatMoney(cashLoss)} en frais d'avocat.`;
            addStat(statsContainer, 'Pénalité', `-${formatMoney(cashLoss)}`, 'danger');
        }
        updateUI();
        
        const okBtn = document.createElement('button');
        okBtn.className = 'action-btn danger';
        okBtn.textContent = 'CONTINUER';
        okBtn.onclick = finishTurn;
        modalActions.appendChild(okBtn);
        if (p.isAI) setTimeout(() => okBtn.click(), 1500);

    } else if (space.type === 'ft_repairs') {
        cardTitle.textContent = "Unforeseen Repairs!";
        cardIcon.textContent = "🛠️";
        const loss = Math.floor(p.cash / 2);
        cardDesc.textContent = `Réparations imprévues ! Vous devez payer la moitié de vos liquidités (-${formatMoney(loss)}) pour réparer vos infrastructures.`;
        addStat(statsContainer, 'Coût Réparations', `-${formatMoney(loss)}`, 'danger');
        
        const payBtn = document.createElement('button');
        payBtn.className = 'action-btn danger';
        payBtn.textContent = `PAYER ${formatMoney(loss)}`;
        payBtn.onclick = () => { p.cash -= loss; updateUI(); finishTurn(); };
        modalActions.appendChild(payBtn);
        if (p.isAI) setTimeout(() => payBtn.click(), 1500);

    } else if (space.type === 'ft_healthcare') {
        cardTitle.textContent = "Healthcare Alert!";
        cardIcon.textContent = "🩺";
        
        const roll = Math.floor(Math.random() * 6) + 1;
        const isCovered = roll <= 3;
        
        if (isCovered) {
            cardDesc.textContent = `Urgence médicale (Dé: ${roll}) ! Votre assurance santé vous couvre intégralement. Aucun frais à payer !`;
            addStat(statsContainer, 'Statut', 'Couvert (100%)', 'success');
        } else {
            const loss = p.cash;
            p.cash = 0;
            cardDesc.textContent = `Urgence médicale (Dé: ${roll}) ! Vous n'étiez pas couvert pour cette intervention. Vous devez verser la totalité de vos liquidités (-${formatMoney(loss)}).`;
            addStat(statsContainer, 'Pénalité', `-${formatMoney(loss)}`, 'danger');
            updateUI();
        }
        
        const okBtn = document.createElement('button');
        okBtn.className = isCovered ? 'action-btn success' : 'action-btn danger';
        okBtn.textContent = isCovered ? 'SOULAGÉ ! (CONTINUER)' : 'AÏE ! (CONTINUER)';
        okBtn.onclick = finishTurn;
        modalActions.appendChild(okBtn);
        if (p.isAI) setTimeout(() => okBtn.click(), 1500);

    } else if (['ft_tax_audit', 'ft_divorce', 'ft_lawsuit'].includes(space.type)) {
        cardTitle.textContent = space.title || space.name;
        const loss = Math.floor(p.cash / 2);
        cardDesc.textContent = `Coup dur ! Vous devez régler immédiatement la moitié de votre trésorerie (-${formatMoney(loss)}).`;
        addStat(statsContainer, 'Pénalité', `-${formatMoney(loss)}`, 'danger');
        const payBtn = document.createElement('button');
        payBtn.className = 'action-btn danger';
        payBtn.textContent = `PAYER ${formatMoney(loss)}`;
        payBtn.onclick = () => { p.cash -= loss; updateUI(); finishTurn(); };
        modalActions.appendChild(payBtn);
        if (p.isAI) setTimeout(() => payBtn.click(), 1500);
    } else {
        cardTitle.textContent = space.title || space.name || "Event";
        cardDesc.textContent = space.desc || "Vous passez cette case sans événement particulier.";
        const okBtn = document.createElement('button');
        okBtn.className = 'action-btn';
        okBtn.textContent = 'CONTINUER';
        okBtn.onclick = finishTurn;
        modalActions.appendChild(okBtn);
        if (p.isAI) setTimeout(() => okBtn.click(), 1000);
    }
}

function showCharityModal(space) {
    const modal = document.getElementById('card-modal');
    document.getElementById('card-icon').textContent = space.icon || '❤️';
    document.getElementById('card-type').textContent = space.name.toUpperCase();
    document.getElementById('card-header').style.borderBottomColor = space.color || '#c026d3';
    
    let donateAmount = state.isFastTrack ? 100000 : (state.getTotalIncome() * 0.1);
    
    document.getElementById('card-title').textContent = "Give to Charity";
    document.getElementById('card-desc').textContent = `Donate 10% of your Total Income (${formatMoney(donateAmount)}) to charity. In return, you may choose to roll extra dice on your next 3 turns!`;
    
    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = '';
    addStat(statsContainer, 'Cost', formatMoney(donateAmount), 'danger');
    
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';
    
    const passBtn = document.createElement('button');
    passBtn.className = 'btn-secondary';
    passBtn.textContent = 'Pass';
    passBtn.onclick = () => closeModal(modal);
    
    const donateBtn = document.createElement('button');
    donateBtn.className = 'action-btn';
    donateBtn.textContent = 'Donate';
    donateBtn.onclick = () => {
        if (state.cash >= donateAmount) {
            state.cash -= donateAmount;
            state.charityTurnsLeft = 3; // Official rule
            updateUI();
            showAlertCard("Donation", `You donated ${formatMoney(donateAmount)}. For your next 3 turns, you can choose how many dice to roll!`, "🕊️", "var(--accent-primary)");
            closeModal(modal);
        } else {
            showAlertCard("Fonds insuffisants", "Insufficient funds for Charity.", "🚫", "var(--danger)");
        }
    };
    
    actionsContainer.appendChild(passBtn);
    actionsContainer.appendChild(donateBtn);
    
    modal.classList.remove('hidden');
    flipModalToFront();

    const p = state.getCurrentPlayer();
    if (p.isAI) {
        setTimeout(() => {
            if (p.cash >= donateAmount * 3) donateBtn.click();
            else passBtn.click();
        }, 1200);
    }
}

function showDealChoiceModal(spaceInfo) {
    const modal = document.getElementById('card-modal');
    document.getElementById('card-icon').textContent = spaceInfo.icon;
    document.getElementById('card-type').textContent = "DISCOVERY PHASE (Step 1)";
    document.getElementById('card-header').style.borderBottomColor = spaceInfo.color;
    
    document.getElementById('card-title').textContent = "Select Your Strategy";
    document.getElementById('card-desc').textContent = "Choose a deal type or handle your current loans. A Market card will be drawn immediately after your choice.";
    
    document.getElementById('card-stats').innerHTML = '';
    
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';
    
    const borrowBtn = createBorrowButton(actionsContainer, null, 'deal');
    const repayBtn = createRepayDebtButton(actionsContainer);

    const btnSmall = document.createElement('button');
    btnSmall.className = 'action-btn';
    btnSmall.style.background = 'var(--warning)';
    btnSmall.textContent = '📈 Capital Gain Deal';
    btnSmall.onclick = () => showCardModal('capital_gain_deal', spaceInfo);
    
    const btnBig = document.createElement('button');
    btnBig.className = 'action-btn';
    btnBig.style.background = 'var(--success)';
    btnBig.textContent = '💰 Cash Flow Deal';
    btnBig.onclick = () => showCardModal('cash_flow_deal', spaceInfo);
    
    const passBtn = document.createElement('button');
    passBtn.className = 'btn-secondary';
    passBtn.textContent = 'Pass (Direct to Market)';
    passBtn.onclick = () => {
        closeModal(modal);
        setTimeout(() => initiateMarketPhase(), 500);
    };

    // Row 1: Repay Debt | Borrow | Pass
    const row1 = document.createElement('div');
    row1.className = 'actions-row';
    row1.appendChild(repayBtn);
    row1.appendChild(borrowBtn);
    row1.appendChild(passBtn);

    // Row 2: Capital Gain Deal | Cash Flow Deal
    const row2 = document.createElement('div');
    row2.className = 'actions-row';
    row2.appendChild(btnSmall);
    row2.appendChild(btnBig);

    actionsContainer.appendChild(row1);
    actionsContainer.appendChild(row2);

    modal.classList.remove('hidden');
    document.querySelector('[data-tab="statement"]').click();

    // AI Autonomous Selection
    const p = state.getCurrentPlayer();
    if (p.isAI) {
        setTimeout(() => {
            if (p.cash >= 6000) {
                btnBig.click();
            } else if (p.cash >= 2000) {
                btnSmall.click();
            } else {
                passBtn.click();
            }
        }, 1200);
    }
}

// --- Card Data and Logic ---
const CARDS_DATABASE = {
    cash_flow_deal: [
        {
            title: "8-Plex for Sale",
            desc: "Highly desirable units in a stable neighborhood. Use yourself or sell the opportunity.",
            cost: 160000,
            downPayment: 32000,
            cashflow: 2000,
            type: "real_estate",
            assetType: "plex"
        },
        {
            title: "Automated Car Wash",
            desc: "High traffic location. Part-time manager in place.",
            cost: 150000,
            downPayment: 30000,
            cashflow: 1500,
            type: "business"
        },
        {
            title: "Limited Partnership (Real Estate)",
            desc: "Join a pool of investors for a large development. Low down payment, steady cash flow.",
            cost: 10000,
            downPayment: 10000,
            cashflow: 200,
            type: "business"
        }
    ],
    capital_gain_deal: [
        {
            title: "OK4U Stock Opportunity",
            desc: "OK4U at a new low. Price: $5. Normal range $10-$40.",
            symbol: "OK4U",
            cost: 5,
            type: "stock"
        },
        {
            title: "IMPOSED: MYT4U Put Option",
            desc: "Buy Put options on MYT4U at a $40 strike. Premium is $5/sh. (IMPOSED OFFER: Choose to Accept or Pass).",
            symbol: "MYT4U",
            cost: 40,
            instrumentType: 'put',
            type: "stock"
        },
        {
            title: "IMPOSED: OK4U Short Sale",
            desc: "Borrow OK4U shares to sell at $50. (IMPOSED OFFER: Choose to Accept or Pass).",
            symbol: "OK4U",
            cost: 50,
            instrumentType: 'short',
            type: "stock"
        },
        {
            title: "2Br/1Ba House",
            desc: "Fast flip opportunity in a hot market.",
            cost: 50000,
            downPayment: 5000,
            cashflow: 0,
            type: "real_estate"
        }
    ],
    market: [
        {
            title: "1031 Tax Deferred Exchange",
            desc: "Trade your 2Br/1Ba house for a larger 4-plex. No cash down required if you own the item listed.",
            is1031: true,
            targetAssetType: "real_estate",
            targetSubtype: "2Br/1Ba House",
            replacementAsset: { title: "4-Plex (Exchanged)", cost: 120000, downPayment: 0, cashflow: 800, type: "real_estate", assetType: "plex" }
        },
        {
            title: "Stock Split (2-for-1)",
            desc: "All players owning OK4U stock double their shares. (Strike prices on options are halved).",
            isStockSplit: true,
            symbol: "OK4U",
            ratio: 2
        },
        {
            title: "Apartment Buyer",
            desc: "Buyer offers $40,000 per unit for any 8-plex owned.",
            targetAssetType: "plex",
            offer: 40000
        }
    ],
    doodad: [
        { title: "New Smartphone", cost: 800, desc: "Gotta have the newest gadget." },
        { title: "Car Repairs", cost: 1200, desc: "Essential maintenance." }
    ]
};

function showAlertCard(title, message, icon = '⚠️', color = 'var(--warning)', callback = null) {
    const modal = document.getElementById('card-modal');
    if (!modal) return;
    
    flipModalToFront();
    
    document.getElementById('card-icon').textContent = icon;
    document.getElementById('card-type').textContent = "NOTIFICATION";
    document.getElementById('card-header').style.borderBottomColor = color;
    
    document.getElementById('card-title').textContent = title;
    document.getElementById('card-desc').textContent = message;
    document.getElementById('card-img-container').classList.add('hidden');
    
    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = '';
    
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';
    
    const okBtn = document.createElement('button');
    okBtn.className = 'action-btn';
    okBtn.style.background = color;
    okBtn.textContent = 'OK';
    okBtn.onclick = () => {
        modal.classList.add('hidden');
        if (callback) callback();
    };
    
    actionsContainer.appendChild(okBtn);
    
    modal.classList.remove('hidden');
    modal.classList.remove('sidebar-docked');
    modal.classList.add('modal-prominence');
    
    SoundManager.playFlip();
}

function showDiceSelectionModal(maxDice, callback) {
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    flipModalToFront();
    
    document.getElementById('card-icon').textContent = "🎲";
    document.getElementById('card-type').textContent = "CHARITY ROLL";
    document.getElementById('card-header').style.borderBottomColor = "var(--success)";
    
    document.getElementById('card-title').textContent = "Select Dice";
    document.getElementById('card-desc').textContent = `Charity is active! How many dice would you like to roll for this turn?`;
    document.getElementById('card-img-container').classList.add('hidden');
    
    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = '';
    
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';
    
    for (let i = 1; i <= maxDice; i++) {
        const dBtn = document.createElement('button');
        dBtn.className = 'action-btn';
        dBtn.style.flex = '1';
        dBtn.textContent = `${i} Dice ${"🎲".repeat(i)}`;
        dBtn.onclick = () => {
            modal.classList.add('hidden');
            callback(i);
        };
        actionsContainer.appendChild(dBtn);
    }
    
    modal.classList.remove('hidden');
    SoundManager.playFlip();
}

function showConfirmCard(title, message, onConfirm, onCancel = null, icon = '❓', color = 'var(--accent-primary)') {
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    flipModalToFront();
    
    document.getElementById('card-icon').textContent = icon;
    document.getElementById('card-type').textContent = "CONFIRMATION";
    document.getElementById('card-header').style.borderBottomColor = color;
    document.getElementById('card-title').textContent = title;
    document.getElementById('card-desc').textContent = message;
    document.getElementById('card-img-container').classList.add('hidden');
    
    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = '';
    
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';
    
    const yesBtn = document.createElement('button');
    yesBtn.className = 'action-btn';
    yesBtn.style.background = 'var(--success)';
    yesBtn.textContent = 'CONFIRMER';
    yesBtn.onclick = () => {
        modal.classList.add('hidden');
        if (onConfirm) onConfirm();
    };
    
    const noBtn = document.createElement('button');
    noBtn.className = 'btn-secondary';
    noBtn.textContent = 'ANNULER';
    noBtn.onclick = () => {
        modal.classList.add('hidden');
        if (onCancel) onCancel();
    };
    
    actionsContainer.appendChild(noBtn);
    actionsContainer.appendChild(yesBtn);
    
    modal.classList.remove('sidebar-docked', 'hidden');
    modal.classList.add('modal-prominence');
    SoundManager.playFlip();
}

function initiateMarketPhase(cardOverride = null) {
    let card = cardOverride;
    if (!card) {
        const db = CARDS_DATABASE['market'];
        if (!state.decks) state.decks = {};
        if (!state.decks['market'] || state.decks['market'].length === 0) {
            state.decks['market'] = [...db].sort(() => Math.random() - 0.5);
        }
        card = state.decks['market'].pop();
    }

    // Start with the current player and rotate through everyone
    state.currentMarketPhaseIndex = state.currentPlayerIndex;
    processMarketPhaseStep(card);
}

function processMarketPhaseStep(card) {
    showSharedMarketModal(card, state.currentMarketPhaseIndex);
}

function showSharedMarketModal(card, pIndex) {
    const p = state.players[pIndex];
    if (!p) {
        state.nextTurn();
        return;
    }

    const modal = document.getElementById('card-modal');
    SoundManager.playFlip();
    
    // Update Header
    document.getElementById('card-icon').textContent = "📈";
    document.getElementById('card-type').textContent = `MARKET PHASE - ${p.isAI ? 'COMPUTER 🐭' : 'PLAYER 🦁'}`;
    document.getElementById('card-header').style.borderBottomColor = "#38bdf8";
    document.getElementById('card-title').textContent = card.title;
    document.getElementById('card-desc').textContent = card.desc || card.description || '';
    document.getElementById('card-img-container').classList.add('hidden');
    
    // Ensure modal positioning
    modal.classList.remove('modal-prominence', 'sidebar-docked', 'hidden');
    modal.style.top = ''; modal.style.left = ''; modal.style.right = ''; modal.style.bottom = ''; modal.style.transform = '';
    modal.classList.add('sidebar-docked', 'modal-prominence');

    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = '';
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';

    const finishMarketAction = () => {
        state.currentMarketPhaseIndex = (state.currentMarketPhaseIndex + 1) % state.players.length;
        if (state.currentMarketPhaseIndex === state.currentPlayerIndex) {
            closeModal(modal);
            state.nextTurn();
        } else {
            processMarketPhaseStep(card);
        }
    };

    renderMarketCardInternal(card, pIndex, finishMarketAction);
}

function renderMarketCardInternal(card, pIndex, finishMarketAction) {
    const p = state.players[pIndex];
    const statsContainer = document.getElementById('card-stats');
    const actionsContainer = document.getElementById('card-actions');
    const modal = document.getElementById('card-modal');

    const offer = card.offer || card.marketOffer || 0;
    const symbol = card.symbol;
    const targetAssetType = (card.targetAssetType || "").toLowerCase();
    const targetSubtype = (card.targetSubtype || "").toLowerCase();

    if (symbol) {
        state.addPricePoint(symbol, offer);
        const chartDiv = document.createElement('div');
        chartDiv.id = 'modal-market-chart';
        chartDiv.className = 'mini-chart-container';
        chartDiv.style.gridColumn = '1 / span 2';
        chartDiv.style.overflow = 'hidden';
        chartDiv.style.maxHeight = '220px';
        chartDiv.style.marginBottom = '10px';
        statsContainer.appendChild(chartDiv);
        renderStockChart(symbol, 'modal-market-chart');
    }

    const matchingAssets = [];

    if (card.is1031) {
        p.assets.realEstate.forEach((re, i) => {
            if (re.type.toLowerCase().includes(targetSubtype)) matchingAssets.push({ type: 'real_estate', asset: re, index: i });
        });
    } else if (card.isStockSplit && symbol) {
        p.assets.stocks.forEach((s) => {
            if (s.symbol === symbol) {
                s.shares *= card.ratio;
                s.cost /= card.ratio;
                showAlertCard("Stock Split!", `${p.isAI ? 'Computer' : 'You'} had shares split!`, "📈", "var(--success)");
            }
        });
        p.assets.options.forEach(o => {
            if (o.symbol === symbol) { o.strike /= card.ratio; o.quantity *= card.ratio; }
        });
        updateUI();
    } else if (symbol) {
        p.assets.options.forEach((o, i) => { if (o.symbol === symbol) matchingAssets.push({ type: 'option', asset: o, index: i }); });
        p.assets.shorts.forEach((s, i) => { if (s.symbol === symbol) matchingAssets.push({ type: 'short', asset: s, index: i }); });
        p.assets.stocks.forEach((s, i) => { if (s.symbol === symbol) matchingAssets.push({ type: 'stock_sale', asset: s, index: i }); });
    } else if (targetAssetType) {
        p.assets.realEstate.forEach((re, i) => {
            const reType = (re.type || "").toLowerCase();
            if (reType.includes(targetAssetType) || (targetSubtype && reType.includes(targetSubtype)) || targetAssetType === 'real_estate') {
                matchingAssets.push({ type: 'real_estate', asset: re, index: i });
            }
        });
        p.assets.business.forEach((bus, i) => {
            const busType = (bus.type || "").toLowerCase();
            if (busType.includes(targetAssetType) || targetAssetType === 'business') {
                matchingAssets.push({ type: 'business', asset: bus, index: i });
            }
        });
        p.assets.reOptions.forEach((o, i) => {
            if (o.targetAssetType === card.targetAssetType) matchingAssets.push({ type: 're_option', asset: o, index: i });
        });
    }

    if (matchingAssets.length === 0) {
        const msg = document.createElement('div');
        msg.textContent = "No matching assets for " + (p.isAI ? "the computer." : "you.");
        statsContainer.appendChild(msg);
    } else {
        matchingAssets.forEach(m => {
            const row = document.createElement('div');
            row.className = 'asset-action-row'; row.style.display = 'flex'; row.style.justifyContent = 'space-between';
            row.style.background = 'rgba(255,255,255,0.05)'; row.style.padding = '8px'; row.style.marginBottom = '5px';
            
            const label = document.createElement('span');
            label.textContent = `${m.asset.symbol || m.asset.type} (${m.type.replace('_',' ')})`;
            row.appendChild(label);

            const btn = document.createElement('button');
            btn.className = 'action-btn mini-btn';
            
            if (m.type === 'short') {
                btn.textContent = 'COVER'; btn.classList.add('danger');
                btn.onclick = () => {
                    const diff = (m.asset.salePrice - offer) * m.asset.quantity;
                    p.cash += diff; p.assets.shorts.splice(m.index, 1);
                    row.remove(); updateUI();
                };
            } else if (m.type === 'option') {
                const profit = (m.asset.type === 'call' ? (offer - m.asset.strike) : (m.asset.strike - offer)) * m.asset.quantity;
                btn.textContent = `EXERCISE (+${formatMoney(profit)})`; btn.classList.add('success');
                if (profit <= 0) btn.disabled = true;
                btn.onclick = () => {
                    p.cash += profit; p.assets.options.splice(m.index, 1);
                    row.remove(); updateUI();
                };
            } else if (m.type === 'stock_sale') {
                btn.textContent = `SELL ALL (+${formatMoney(offer * m.asset.shares)})`;
                btn.onclick = () => {
                    p.cash += offer * m.asset.shares;
                    p.assets.stocks.splice(m.index, 1);
                    row.remove(); updateUI();
                };
            } else if (m.type === 'real_estate' || m.type === 'business') {
                btn.textContent = `SELL (+${formatMoney(offer)})`;
                btn.onclick = () => {
                    sellAsset(m.type === 'real_estate' ? 'realEstate' : 'business', m.index, offer, null, m.asset);
                    row.remove(); updateUI();
                };
            } else if (m.type === 're_option') {
                const profit = offer - m.asset.strikePrice;
                btn.textContent = `EXERCISE (+${formatMoney(profit)})`; btn.classList.add('success');
                if (profit <= 0) btn.disabled = true;
                btn.onclick = () => {
                    p.cash += profit; p.assets.reOptions.splice(m.index, 1);
                    row.remove(); updateUI();
                };
            }

            row.appendChild(btn);
            statsContainer.appendChild(row);

            if (p.isAI && !btn.disabled) {
                setTimeout(() => btn.click(), 1000);
            }
        });
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn-secondary'; nextBtn.textContent = 'DONE / NEXT PLAYER';
    nextBtn.onclick = finishMarketAction;
    actionsContainer.appendChild(nextBtn);
    if (p.isAI) setTimeout(() => nextBtn.click(), 2000);
}

function showCardModal(packetId, spaceInfo) {
    SoundManager.playFlip();
    const p = state.getCurrentPlayer();
    const modal = document.getElementById('card-modal');
    const db = CARDS_DATABASE[packetId];
    if(!db || db.length === 0) return;
    
    if (!state.decks) state.decks = {};
    if (!state.decks[packetId] || state.decks[packetId].length === 0) {
        state.decks[packetId] = [...db].sort(() => Math.random() - 0.5);
    }
    const card = state.decks[packetId].pop();
    
    document.getElementById('card-icon').textContent = spaceInfo.icon || "💠";
    document.getElementById('card-type').textContent = (spaceInfo.name || packetId).toUpperCase();
    document.getElementById('card-header').style.borderBottomColor = spaceInfo.color || "var(--primary)";
    document.getElementById('card-title').textContent = card.title;
    document.getElementById('card-desc').textContent = card.desc || card.description || '';
    document.getElementById('card-img-container').classList.add('hidden'); 
    
    modal.classList.remove('modal-prominence', 'sidebar-docked', 'hidden');
    modal.style.top = ''; modal.style.left = ''; modal.style.right = ''; modal.style.bottom = ''; modal.style.transform = '';
    modal.classList.add('sidebar-docked', 'modal-prominence');
    
    const statsContainer = document.getElementById('card-stats');
    statsContainer.innerHTML = '';
    const actionsContainer = document.getElementById('card-actions');
    actionsContainer.innerHTML = '';
    
    if (packetId === 'market') {
        initiateMarketPhase(card);
        return;
    }

    if (card.symbol && (card.cost || card.marketOffer)) {
        state.lastSymbolDrawn = card.symbol;
        state.addPricePoint(card.symbol, card.marketOffer || card.cost);
        const chartDiv = document.createElement('div');
        chartDiv.id = 'modal-stock-chart';
        chartDiv.className = 'mini-chart-container';
        chartDiv.style.gridColumn = '1 / span 2';
        chartDiv.style.overflow = 'hidden';
        chartDiv.style.maxHeight = '220px';
        chartDiv.style.marginBottom = '10px';
        statsContainer.appendChild(chartDiv);
        renderStockChart(card.symbol, 'modal-stock-chart');
    }

    if (packetId === 'cash_flow_deal' || packetId === 'capital_gain_deal') {
        if(card.symbol) addStat(statsContainer, 'Symbol', card.symbol);
        if(card.cost) addStat(statsContainer, 'Cost', formatMoney(card.cost));
        if(card.downPayment) addStat(statsContainer, 'Down Payment', formatMoney(card.downPayment));
        if(card.cashflow) addStat(statsContainer, 'Monthly Cashflow', `+${formatMoney(card.cashflow)}`, 'success');
        
        const type = card.assetType || card.type;
        const isShares = type === 'stock';
        let qtyInput = null;

        actionsContainer.style.display = 'flex';
        actionsContainer.style.flexDirection = 'column';
        actionsContainer.style.gap = '10px';
        actionsContainer.style.width = '100%';

        const getQty = () => (qtyInput ? (parseInt(qtyInput.value) || 0) : 1);
        const getTotalCost = () => (card.downPayment || card.cost || 0) * getQty();

        if (isShares && card.symbol) {
            // Line 1: Current Stock Price Text
            const priceRow = document.createElement('div');
            priceRow.style.width = '100%';
            priceRow.style.textAlign = 'center';
            priceRow.style.fontSize = '14px';
            priceRow.style.fontWeight = '700';
            priceRow.style.color = 'var(--warning)';
            priceRow.style.padding = '4px 0';
            priceRow.style.borderBottom = '1px dashed rgba(255, 255, 255, 0.15)';
            priceRow.textContent = `Current Stock Price: ${formatMoney(state.getCurrentPrice(card.symbol))}`;
            actionsContainer.appendChild(priceRow);

            // Line 2: Qty input on left, Pass button on right
            const qtyPassRow = document.createElement('div');
            qtyPassRow.style.display = 'flex';
            qtyPassRow.style.justifyContent = 'space-between';
            qtyPassRow.style.alignItems = 'center';
            qtyPassRow.style.width = '100%';

            const qtyGroup = document.createElement('div');
            qtyGroup.style.display = 'flex';
            qtyGroup.style.alignItems = 'center';
            qtyGroup.style.gap = '8px';

            const qtyLabel = document.createElement('span');
            qtyLabel.textContent = 'Qty:';
            qtyLabel.style.fontWeight = '600';
            qtyLabel.style.fontSize = '14px';
            qtyLabel.style.color = 'var(--text-primary)';

            qtyInput = document.createElement('input');
            qtyInput.type = 'number'; qtyInput.value = '100'; qtyInput.step = '10'; qtyInput.min = '10';
            qtyInput.className = 'input-small';
            qtyInput.style.width = '100px';
            qtyInput.style.padding = '6px 10px';
            qtyInput.style.borderRadius = '6px';
            qtyInput.style.border = '1px solid var(--border-color)';
            qtyInput.style.background = 'rgba(0,0,0,0.4)';
            qtyInput.style.color = 'white';
            qtyInput.style.fontSize = '14px';

            qtyGroup.appendChild(qtyLabel);
            qtyGroup.appendChild(qtyInput);
            qtyPassRow.appendChild(qtyGroup);

            const passBtn = document.createElement('button');
            passBtn.className = 'btn-secondary';
            passBtn.textContent = 'PASS DEAL';
            passBtn.style.padding = '8px 20px';
            passBtn.onclick = () => { closeModal(modal); setTimeout(() => initiateMarketPhase(), 500); };
            qtyPassRow.appendChild(passBtn);

            actionsContainer.appendChild(qtyPassRow);

            // Line 3: Trading Action Buttons (BUY ASSET, SHORT, CALL)
            const buttonsRow = document.createElement('div');
            buttonsRow.style.display = 'flex';
            buttonsRow.style.gap = '10px';
            buttonsRow.style.width = '100%';

            const buyBtn = document.createElement('button');
            buyBtn.className = 'action-btn success';
            buyBtn.textContent = 'BUY ASSET';
            buyBtn.style.flex = '1';
            buyBtn.style.padding = '10px 14px';
            buyBtn.style.fontSize = '13px';
            buyBtn.onclick = () => {
                if (p.cash >= getTotalCost()) {
                    buyAsset(card, modal, getQty());
                    setTimeout(() => initiateMarketPhase(), 500);
                }
            };
            buttonsRow.appendChild(buyBtn);

            const shortBtn = document.createElement('button');
            shortBtn.className = 'action-btn';
            shortBtn.textContent = 'SHORT';
            shortBtn.style.background = '#8b5cf6';
            shortBtn.style.flex = '1';
            shortBtn.style.padding = '10px 14px';
            shortBtn.style.fontSize = '13px';
            shortBtn.onclick = () => {
                const q = getQty();
                p.assets.shorts.push({ symbol: card.symbol, quantity: q, salePrice: card.cost });
                p.cash += q * card.cost;
                updateUI();
                closeModal(modal);
                setTimeout(() => initiateMarketPhase(), 500);
            };
            buttonsRow.appendChild(shortBtn);

            const callBtn = document.createElement('button');
            callBtn.className = 'action-btn';
            callBtn.textContent = 'CALL';
            callBtn.style.background = '#10b981';
            callBtn.style.flex = '1';
            callBtn.style.padding = '10px 14px';
            callBtn.style.fontSize = '13px';
            callBtn.onclick = () => {
                const q = getQty();
                const prem = card.cost >= 50 ? 5 : 1;
                if (p.cash >= q * prem) {
                    p.cash -= q * prem;
                    p.assets.options.push({ symbol: card.symbol, type: 'call', strike: card.cost, quantity: q, expiry: 4 });
                    updateUI();
                    closeModal(modal);
                    setTimeout(() => initiateMarketPhase(), 500);
                }
            };
            buttonsRow.appendChild(callBtn);
            actionsContainer.appendChild(buttonsRow);

            if (p.isAI) {
                setTimeout(() => {
                    const cost = card.cost || 20;
                    if (cost <= 20 && p.cash >= cost * 100 * 1.5) {
                        buyBtn.click();
                    } else if (cost >= 40 && p.cash >= 1000) {
                        if (Math.random() > 0.5) callBtn.click();
                        else shortBtn.click();
                    } else {
                        passBtn.click();
                    }
                }, 1200);
            }
        } else {
            // Standard Deals (Real Estate, Business, etc.)
            const buyBtn = document.createElement('button');
            buyBtn.className = 'action-btn success';
            buyBtn.textContent = 'BUY ASSET';
            buyBtn.onclick = () => {
                if (p.cash >= getTotalCost()) {
                    buyAsset(card, modal, getQty());
                    setTimeout(() => initiateMarketPhase(), 500);
                }
            };

            const passBtn = document.createElement('button');
            passBtn.className = 'btn-secondary';
            passBtn.textContent = 'PASS DEAL';
            passBtn.onclick = () => { closeModal(modal); setTimeout(() => initiateMarketPhase(), 500); };

            const standardRow = document.createElement('div');
            standardRow.style.display = 'flex';
            standardRow.style.gap = '10px';
            standardRow.style.justifyContent = 'flex-end';
            standardRow.style.width = '100%';
            standardRow.appendChild(buyBtn);
            standardRow.appendChild(passBtn);

            actionsContainer.appendChild(standardRow);

            if (p.isAI) {
                setTimeout(() => {
                    if (p.cash >= getTotalCost() * 1.5) buyBtn.click();
                    else passBtn.click();
                }, 1200);
            }
        }
    } else if (packetId === 'doodad') {
        const payBtn = document.createElement('button');
        payBtn.className = 'action-btn danger';
        payBtn.textContent = `PAY ${formatMoney(card.cost || 0)}`;
        payBtn.onclick = () => { p.cash -= (card.cost || 0); updateUI(); closeModal(modal); state.nextTurn(); };
        actionsContainer.appendChild(payBtn);
        if (p.isAI) setTimeout(() => payBtn.click(), 1500);
    }
    
    modal.classList.remove('hidden');
    document.querySelector('[data-tab="statement"]').click();
}

// --- Modal Flip Utilities ---
function flipModalToFront() {
    const flipper = document.getElementById('modal-flipper');
    if (flipper) flipper.classList.remove('flipped');
}

function flipModalToBack(title, statsRenderer, actionsRenderer) {
    const flipper = document.getElementById('modal-flipper');
    if (!flipper) return;
    
    document.getElementById('back-title').textContent = title;
    
    const body = document.getElementById('back-body');
    body.innerHTML = '';
    if (typeof statsRenderer === 'function') statsRenderer(body);
    
    const actions = document.getElementById('back-actions');
    actions.innerHTML = '';
    if (typeof actionsRenderer === 'function') actionsRenderer(actions);
    
    flipper.classList.add('flipped');
}

// --- Bank Logic ---
function createBorrowButton(container, callback, context = 'deal') {
    const borrowBtn = document.createElement('button');
    borrowBtn.className = 'btn-secondary'; borrowBtn.style.background = '#0e7490';
    borrowBtn.style.color = 'white'; borrowBtn.textContent = '🏦 Borrow';
    borrowBtn.onclick = () => {
        const p = state.getCurrentPlayer();
        if (p.isBankrupt && context !== 'doodad') {
            showAlertCard("Prohibited", "Bankrupt players cannot take new loans for investments.", "🚫", "var(--danger)");
            return;
        }
        flipModalToBack('Borrow from Bank', 
            (backBody) => {
                backBody.innerHTML = `
                    <div style="color:var(--text-primary);text-align:left; font-size:14px; margin-bottom: 15px;">
                        Current Cash: <span class="success">${formatMoney(p.cash)}</span><br/>
                        Current Bank Loan: <span class="danger">${formatMoney(p.liabilities.bankLoan)}</span>
                    </div>
                    <label style="color:var(--text-secondary); font-size:12px;">Amount (Multiples of $1,000)</label>
                    <input type="number" id="borrow-amount" placeholder="1000" step="1000" min="1000" style="padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color); background:rgba(0,0,0,0.2); color:white; width:100%; margin-top:4px;" />
                `;
            },
            (backActions) => {
                const cfBtn = document.createElement('button'); cfBtn.className = 'action-btn'; cfBtn.textContent = 'Confirm Borrow';
                cfBtn.onclick = () => {
                    const amount = parseInt(document.getElementById('borrow-amount').value);
                    if (isNaN(amount) || amount % 1000 !== 0 || amount <= 0) return;
                    p.liabilities.bankLoan += amount;
                    p.job.expenses.bankLoanPayment += (amount * 0.1);
                    p.cash += amount;
                    updateUI(); if (callback) callback(); flipModalToFront();
                };
                const clBtn = document.createElement('button'); clBtn.className = 'btn-secondary'; clBtn.textContent = 'Cancel';
                clBtn.onclick = () => flipModalToFront();
                backActions.appendChild(clBtn); backActions.appendChild(cfBtn);
            }
        );
    };
    return borrowBtn;
}

window.openRepayModal = function(preSelectedKey = null) {
    const p = state.getCurrentPlayer();
    const modal = document.getElementById('card-modal');
    modal.classList.remove('hidden');
    flipModalToBack('Repay Debt', 
        (backBody) => {
            let options = [];
            for (const [key, value] of Object.entries(p.liabilities)) {
                if (value > 0) options.push({ key, amount: value, expenseKey: key === 'bankLoan' ? 'bankLoanPayment' : key });
            }
            backBody.innerHTML = `<div style="color:var(--text-primary); font-size:14px; margin-bottom: 10px;">Your Cash: <span class="success">${formatMoney(p.cash)}</span></div>`;
            if (options.length === 0) {
                backBody.innerHTML += `<div style="color:var(--text-muted);">No debts to repay!</div>`;
                backBody._repayOptions = []; return;
            }
            const sBox = document.createElement('select'); sBox.id = 'repay-select';
            sBox.style.cssText = 'padding:8px; background:rgba(0,0,0,0.2); color:white; width:100%; margin-bottom:15px;';
            options.forEach(opt => {
                const el = document.createElement('option'); el.value = opt.key;
                el.textContent = `${opt.key} (Owe ${formatMoney(opt.amount)}, Saves ${formatMoney(p.job.expenses[opt.expenseKey])}/mo)`;
                if (opt.key === preSelectedKey) el.selected = true;
                sBox.appendChild(el);
            });
            backBody.appendChild(sBox); backBody._repayOptions = options;
        },
        (backActions) => {
            const options = document.getElementById('back-body')._repayOptions || [];
            if (options.length === 0) {
                const cBtn = document.createElement('button'); cBtn.className = 'btn-secondary'; cBtn.textContent = 'Close';
                cBtn.onclick = () => closeModal(modal); backActions.appendChild(cBtn); return;
            }
            const cfBtn = document.createElement('button'); cfBtn.className = 'action-btn'; cfBtn.style.background = '#047857'; cfBtn.textContent = 'Pay Off';
            cfBtn.onclick = () => {
                const sk = document.getElementById('repay-select').value;
                const so = options.find(o => o.key === sk);
                if (sk === 'bankLoan') {
                    const amtStr = prompt(`You owe ${formatMoney(so.amount)}.\nEnter amount (multiples of 1000):`, "1000");
                    if (!amtStr) return;
                    const amt = parseInt(amtStr);
                    if (isNaN(amt) || amt % 1000 !== 0 || amt <= 0 || amt > so.amount || p.cash < amt) return;
                    p.liabilities.bankLoan -= amt; p.job.expenses.bankLoanPayment -= (amt * 0.1); p.cash -= amt;
                } else {
                    if (p.cash >= so.amount) { p.cash -= so.amount; p.liabilities[so.key] = 0; p.job.expenses[so.expenseKey] = 0; }
                }
                updateUI(); flipModalToFront(); if (backActions._repayCallback) backActions._repayCallback();
            };
            const clBtn = document.createElement('button'); clBtn.className = 'btn-secondary'; clBtn.textContent = 'Cancel';
            clBtn.onclick = () => flipModalToFront(); backActions.appendChild(clBtn); backActions.appendChild(cfBtn);
        }
    );
};

function createRepayDebtButton(container, callback) {
    const repayBtn = document.createElement('button');
    repayBtn.className = 'btn-secondary';
    repayBtn.style.background = '#047857';
    repayBtn.style.color = 'white';
    repayBtn.textContent = '💸 Repay Debt';
    repayBtn.onclick = () => {
        openRepayModal(null);
        setTimeout(() => {
            const actions = document.getElementById('back-actions');
            if (actions) actions._repayCallback = callback;
        }, 50);
    };
    return repayBtn;
}

function sellAsset(arrayType, index, salePrice, modal, assetDetails, quantity = null) {
    const p = state.getCurrentPlayer();
    if (arrayType === 'realEstate') {
        const mortgageBalance = Math.max(0, (assetDetails.cost || 0) - (assetDetails.downPayment || 0));
        p.cash += (salePrice - mortgageBalance);
        p.assets.realEstate.splice(index, 1);
    } else if (arrayType === 'business') {
        const loanBalance = Math.max(0, (assetDetails.cost || 0) - (assetDetails.downPayment || 0));
        p.cash += (salePrice - loanBalance);
        p.assets.business.splice(index, 1);
    } else if (arrayType === 'stocks') {
        const stockRef = p.assets.stocks[index];
        const q = quantity !== null ? quantity : stockRef.shares;
        p.cash += (salePrice * q);
        if (q >= stockRef.shares) p.assets.stocks.splice(index, 1);
        else stockRef.shares -= q;
    }
    updateUI(); closeModal(modal);
    if (p.isAI) state.nextTurn();
}


function addStat(container, labelText, valueText, colorClass = '') {
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `<span class="stat-label">${labelText}</span><span class="stat-value ${colorClass}">${valueText}</span>`;
    container.appendChild(item);
}

function buyAsset(card, modal, quantity = 1) {
    const p = state.getCurrentPlayer();
    const unitPrice = card.downPayment || card.cost || 0;
    const totalCost = unitPrice * quantity;
    
    if (p.cash >= totalCost) {
        SoundManager.playSpend();
        p.cash -= totalCost;
        const type = card.assetType || card.type;
        if (type === 'stock') {
            const sym = card.symbol || card.title;
            const existing = p.assets.stocks.find(s => s.symbol === sym);
            if (existing) {
                const totalInvested = (existing.cost * existing.shares) + totalCost;
                existing.shares += quantity;
                existing.cost = totalInvested / existing.shares;
            } else {
                p.assets.stocks.push({ symbol: sym, shares: quantity, cost: unitPrice, dividend: card.cashflow });
            }
        } else if (type === 'business') {
            p.assets.business.push({ type: card.title, assetType: 'business', downPayment: unitPrice, cost: card.cost, cashflow: card.cashflow });
        } else {
            if (card.isOption) {
                p.assets.reOptions.push({ type: card.title, assetType: 'real_estate_option', strikePrice: card.cost, premium: unitPrice, targetType: card.targetAssetType || card.title });
            } else {
                p.assets.realEstate.push({ type: card.title, assetType: type || 'real_estate', downPayment: unitPrice, cost: card.cost, cashflow: card.cashflow });
            }
        }
        updateUI(); closeModal(modal);
    }
}



function closeModal(modalElement) {
    const modal = modalElement || document.getElementById('card-modal');
    if (!modal) return;
    
    // Explicitly clear all docking/priority classes to avoid CSS overrides
    modal.classList.remove('modal-prominence', 'sidebar-docked');
    modal.classList.add('hidden');
    
    // Clear sticky drag positions
    modal.style.top = ''; 
    modal.style.left = '';
    modal.style.right = '';
    modal.style.bottom = '';
    modal.style.transform = ''; 
    
    setTimeout(flipModalToFront, 300);
    
    // Safely return to the main board
    try {
        const boardTab = document.querySelector('[data-tab="board"]');
        if (boardTab) boardTab.click();
    } catch(e) {
        console.warn("Auto-switch tab failed, closing modal anyway:", e);
    }

    // Check for card queue after small delay to let UI settle
    setTimeout(() => {
        if (state.cardQueue && state.cardQueue.length > 0) {
            processNextCard();
        }
    }, 100);
}



function executeRoll(numDiceOverride = null) {
    const p = state.getCurrentPlayer();
    const btn = document.getElementById('btn-roll-dice');
    const diceEl = document.getElementById('dice-result');
    const prompt = document.getElementById('action-prompt');
    
    // Charity choice for human
    if (p.charityTurnsLeft > 0 && !p.isAI && numDiceOverride === null) {
        showDiceSelectionModal(p.isFastTrack ? 3 : 2, (count) => executeRoll(count));
        return; 
    }

    const numDice = numDiceOverride || (p.isAI && p.charityTurnsLeft > 0 ? (p.isFastTrack ? 3 : 2) : (p.isFastTrack ? 2 : 1));

    btn.disabled = true;
    diceEl.classList.add('rolling');
    prompt.textContent = "Lancement des dés...";
    SoundManager.playDice();
    
    setTimeout(() => {
        diceEl.classList.remove('rolling');
        let totalRoll = 0;
        let rollEmojis = '';
        for (let j = 0; j < numDice; j++) {
            const r = Math.floor(Math.random() * 6) + 1;
            totalRoll += r;
            rollEmojis += '🎲';
        }
        
        // Dynamic font size adjustment to prevent overflow in the 320px circle
        if (numDice === 3) {
            diceEl.style.fontSize = '55px';
        } else if (numDice === 2) {
            diceEl.style.fontSize = '75px';
        } else {
            diceEl.style.fontSize = '110px';
        }
        
        diceEl.textContent = `${rollEmojis} ${totalRoll}`;
        
        state.advanceTurn(); // 202: Decrement expiry of options and charity turns
        
        // Move player
        const currentTrack = state.isFastTrack ? FAST_TRACK_TRACK : RAT_RACE_TRACK;
        const trackLength = currentTrack.length;
        const previousPosition = state.boardPosition;
        state.boardPosition = (state.boardPosition + totalRoll) % trackLength;
        
        for(let i = 1; i <= totalRoll; i++) {
            let posToCheck = (previousPosition + i) % trackLength;
            let spaceToCheck = currentTrack[posToCheck];
            if (spaceToCheck && (spaceToCheck.id === 'paycheck' || spaceToCheck.id.startsWith('ft_cashflow')) && posToCheck !== state.boardPosition) {
                if (state.isFastTrack) {
                    SoundManager.playCash();
                    state.cash += state.getTotalIncome();
                    showAlertCard("CASHFLOW DAY!", `Vous avez passé un Cashflow Day ! +${formatMoney(state.getTotalIncome())}`, "💰", "var(--success)");
                } else {
                    state.cash += state.getMonthlyCashflow();
                    showAlertCard("PAYDAY!", `C'est le jour de paye ! +${formatMoney(state.getMonthlyCashflow())}`, "💸", "var(--success)");
                }
            }
        }
        
        updateUI();
        updateTokenPosition();
        
        setTimeout(() => {
            const landedSpace = currentTrack[state.boardPosition];
            handleSpaceLanding(landedSpace);
            
            // NOTE: nextTurn() will be called by handleSpaceLanding or the resulting modal's "Close" event
            btn.disabled = state.getCurrentPlayer().isAI; 
        }, 500); 
        
    }, 800);
}

function rollDice() {
    const p = state.getCurrentPlayer();
    const btn = document.getElementById('btn-roll-dice');
    if (btn.disabled) return;
    
    if (p.isAI) return;
    if (p.isEliminated) { 
        showAlertCard("ÉLIMINÉ", "Vous avez fait faillite et ne pouvez plus lancer les dés.", "💀", "var(--danger)", () => startNewGame()); 
        return; 
    }

    const isFastTrack = p.isFastTrack;
    let baseDice = isFastTrack ? 2 : 1;
    let maxDice = isFastTrack ? 3 : 2;
    
    if (p.charityTurnsLeft > 0) {
        if (p.isAI) {
            executeRoll(maxDice);
            return;
        }
        showDiceSelectionModal(maxDice, (count) => executeRoll(count));
    } else {
        executeRoll(baseDice);
    }
}

// Load real data if available from Phase 4 script (loaded via cards_data.js)
function loadCardsData() {
    if (typeof EXTERNAL_CARDS !== 'undefined') {
        // 202: Use a smarter merge to avoid wiping out fallbacks if external sets are empty
        for (const key in EXTERNAL_CARDS) {
            if (Array.isArray(EXTERNAL_CARDS[key]) && EXTERNAL_CARDS[key].length > 0) {
                let targetKey = key;
                if (key === 'deal') targetKey = 'cash_flow_deal';
                
                // Filter out junk extracts like the back of the card
                const validCards = EXTERNAL_CARDS[key].filter(c => {
                    const rawDesc = (c.description || c.desc || '').toLowerCase();
                    return !rawDesc.includes('back of a cashflow 202');
                });
                
                if (validCards.length > 0) {
                    if (!CARDS_DATABASE[targetKey]) CARDS_DATABASE[targetKey] = [];
                    // Merge external and default fallback cards
                    CARDS_DATABASE[targetKey] = [...CARDS_DATABASE[targetKey], ...validCards];
                    console.log(`Loaded ${validCards.length} extracted cards for ${targetKey}.`);
                }
            }
        }
        console.log("Loaded available extracted AI cards from cards_data.js successfully!");
    } else {
        console.warn("cards_data.js not found or empty. Using fallback database.");
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCardsData();
    initTabs();
    
    // makeModalDraggable('card-modal'); // Correct draggable logic already applied at line 2846
    forceNewGame();


    document.getElementById('btn-roll-dice').addEventListener('click', rollDice);
    document.getElementById('btn-close-modal').addEventListener('click', () => {
        closeModal(document.getElementById('card-modal'));
    });
    const backCloseBtn = document.getElementById('btn-close-back');
    if(backCloseBtn) {
        backCloseBtn.addEventListener('click', () => {
            closeModal(document.getElementById('card-modal'));
        });
    }
    
    // Debug button to jump to Phase 5
    document.getElementById('debug-win-btn').addEventListener('click', () => {
        if(!state.isFastTrack) transitionToFastTrack();
    });

    // New Game Button
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.onclick = () => {
            startNewGame();
        };
    }

    // Show Dream Selector on load if no dream selected (202 Style)
    // NOTE: This is now handled by forceNewGame() to avoid double calls
    console.log("Game initialized. Waiting for dream selector...");


    // Example interaction
    const cfCard = document.querySelector('.cashflow-card');
    if (cfCard) {
        cfCard.addEventListener('click', () => {
            state.cash += state.getMonthlyCashflow();
            updateUI();
            showAlertCard("FORCED PAYDAY!", `Forced Payday! You earned ${formatMoney(state.getMonthlyCashflow())}`, "💸", "var(--success)");
        });
    }
    
    // --- 202: Init Draggables ---
    makeDraggable(document.getElementById('card-modal'), document.getElementById('card-header'));
});

function exerciseOption(idx) {
    state.exerciseOption(idx);
}

// --- Draggable Logic (for Card Modals) ---
function makeDraggable(element, handle) {
    if (!element || !handle) return;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = (e) => {
        if (['BUTTON', 'SELECT', 'INPUT'].includes(e.target.tagName)) return;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            const newTop = element.offsetTop - pos2;
            const newLeft = element.offsetLeft - pos1;
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.right = "auto";
        };
    };
}

// --- Stocks Tab Logic ---
function updateStockTabUI(symbol) {
    const dropdown = document.getElementById('tab-stock-dropdown');
    if (dropdown) dropdown.value = symbol;
    
    // 1. Render Chart
    renderStockChart(symbol, 'tab-stock-chart');
    
    // 2. Render Positions Table
    const tbody = document.getElementById('tab-stock-positions-tbody');
    tbody.innerHTML = '';
    
    let matchingAssets = [];
    
    // Check Stocks
    state.assets.stocks.forEach((s, idx) => {
        if (s.symbol === symbol) {
            matchingAssets.push({ type: 'Stock', qty: s.shares, cost: s.cost * s.shares, value: state.getCurrentPrice(symbol) * s.shares, originalIdx: idx });
        }
    });
    
    // Check Options
    state.assets.options.forEach((o, idx) => {
        if (o.symbol === symbol) {
            const currentPrice = state.getCurrentPrice(symbol);
            const spread = o.type === 'call' ? (currentPrice - o.strike) : (o.strike - currentPrice);
            const value = Math.max(0, spread * o.quantity);
            matchingAssets.push({ type: `${o.type.toUpperCase()} Option`, qty: o.quantity, cost: o.cost * o.quantity, value: value, originalIdx: idx });
        }
    });
    
    // Check Shorts
    state.assets.shorts.forEach((s, idx) => {
        if (s.symbol === symbol) {
            const value = (s.salePrice - state.getCurrentPrice(symbol)) * s.quantity;
            matchingAssets.push({ type: 'Short', qty: s.quantity, cost: s.salePrice * s.quantity, value: value, originalIdx: idx });
        }
    });
    
    if (matchingAssets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 25px; color: var(--text-muted);">No current positions for this symbol.</td></tr>';
    } else {
        matchingAssets.forEach(a => {
            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            
            let actionHtml = '';
            if (a.type === 'Stock') {
                actionHtml = '<span style="font-size:10px; color:var(--text-muted);">Owned</span>';
            } else if (a.type.includes('Option')) {
                const canEx = a.value > 0;
                actionHtml = `<button class="action-btn mini-btn ${canEx ? 'success' : 'disabled'}" onclick="state.exerciseOption(${a.originalIdx})" ${!canEx ? 'disabled' : ''} style="padding:2px 8px; font-size:10px;">Exercise</button>`;
            } else if (a.type === 'Short') {
                actionHtml = `<button class="action-btn mini-btn" onclick="state.buyBackShort(${a.originalIdx})" style="padding:2px 8px; font-size:10px; background:#8b5cf6;">Settle</button>`;
            }

            row.innerHTML = `
                <td style="padding: 12px;">${a.type} ${symbol}</td>
                <td style="text-align:center;">${a.qty}</td>
                <td style="text-align:center;">${formatMoney(a.cost)}</td>
                <td style="text-align:center;" class="${a.value >= a.cost || a.type.includes('Option') ? 'success' : 'danger'}">${formatMoney(a.value)}</td>
                <td style="text-align:center;">${actionHtml}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

function forceNewGame() {
    // 1. Reset Game State
    state = new GameState();
    
    // 2. Reset Board Track
    currentBoardTrack = RAT_RACE_TRACK;
    state.players.forEach(p => p.boardPosition = 0);
    
    // Reset Dice Button & Visuals
    const diceBtn = document.getElementById('btn-roll-dice');
    if (diceBtn) diceBtn.disabled = false;
    const diceEl = document.getElementById('dice-result');
    if (diceEl) {
        diceEl.classList.remove('rolling');
        diceEl.textContent = '🎲 --';
        diceEl.style.fontSize = '110px';
    }
    const actionPrompt = document.getElementById('action-prompt');
    if (actionPrompt) actionPrompt.textContent = 'Your turn!';
    
    // 3. Reset UI Modes
    document.body.classList.remove('fast-track-mode');
    const dashboard = document.querySelector('.dashboard');
    if (dashboard) dashboard.classList.remove('fast-track-mode');
    
    const ftProgress = document.querySelector('.progress-bar-container');
    if (ftProgress) ftProgress.style.display = 'block';

    // 4. Update Screens
    document.getElementById('tab-statement').classList.remove('hidden');
    const ftTab = document.getElementById('tab-fast-track-statement');
    if (ftTab) ftTab.classList.add('hidden');
    
    const ratBtn = document.getElementById('rat-statement-btn');
    const ftBtn = document.getElementById('ft-statement-btn');
    if (ratBtn) {
        ratBtn.classList.remove('hidden');
        ratBtn.classList.add('active');
    }
    if (ftBtn) ftBtn.classList.add('hidden');

    renderBoard();
    updateUI();
    updateTokenPosition();
    
    // 5. Show Dream Selector with a larger delay to allow rendering
    console.log("forceNewGame: Scheduling showDreamSelector in 1500ms");
    setTimeout(showDreamSelector, 1500);
}

function startNewGame() {
    showConfirmCard(
        "Nouveau Jeu ?",
        "Êtes-vous sûr de vouloir commencer un nouveau jeu ? Toute votre progression sera perdue.",
        forceNewGame,
        null,
        "🆕",
        "var(--danger)"
    );
}
