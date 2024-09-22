// gameState.js

const initialState = {
    currentScene: 'Spori',
    player: {
        name: "", 
        level: 1,
        xp: 0,
        xpForNextLevel: 100
    },
    characters: {
        Gubi: { location: 'Spori', status: 'active' },
        Ricsko: { location: 'Fori', status: 'active' },
        Jcsar: { location: 'Alagsor', status: 'active' },
        Mogyi: { location: 'Kertesz', status: 'active' },
        Kalman: { location: 'Kertesz', status: 'active' },
        FokiJames: { location: 'Nitro', status: 'active' },
        Ati: { location: 'Kastely', status: 'active' },
        Szabika: { location: 'Fincsi Bufé', status: 'active' },
        Varso: { location: 'Nyugdíjas', status: 'active' },
        Dobi: { location: 'Petfurdo', status: 'active' },
        Pimi: { location: 'Dr. Szikla', status: 'active' },
        Csabika: { location: 'Gaspar Birtok', status: 'active' },
        LilDave: { location: 'Foter', status: 'active' },
        Baldi: { location: 'Danko Utca', status: 'active' },
        Tessza: { location: 'Bisztro', status: 'active' },
        Csorvivi: { location: 'Muzeumkert', status: 'active' },
        Elvira: { location: 'Muzeumkert', status: 'active' } // Új karakter
    },
    decisions: [],
    tasks: {
        mainQuest: {
            currentStage: 1,
            completed: false
        },
        sideQuests: {
            festival: { completed: false, xp: 20 },
            marketSetup: { completed: false, xp: 15 },
            vehicleRepair: { completed: false, xp: 25 },
            artExhibition: { completed: false, xp: 20 },
            historyLesson: { completed: false, xp: 15 },
            nightclubEvent: { completed: false, xp: 30 },
            cooking: { completed: false, xp: 15 },
            findPets: { completed: false, xp: 20 },
            healthCamp: { completed: false, xp: 25 },
            vineyard: { completed: false, xp: 20 },
            concert: { completed: false, xp: 25 },
            businessExpansion: { completed: false, xp: 30 },
            restaurant: { completed: false, xp: 20 },
            museumEvent: { completed: false, xp: 25 }
        }
    },
    settings: { // Játék beállítások
        musicMuted: false
    },
    storyProgress: {
        introduction: true,
        uncoverSecrets: false,
        rebuildTown: false,
        finalChallenge: false
    }
};

/**
 * Mentés a játékállapotot localStorage-ba
 * @param {Object} state - Aktuális játékállapot
 */
function saveGame(state) {
    localStorage.setItem('varpalotaGameState', JSON.stringify(state));
}

/**
 * Betölti a játékállapotot localStorage-ból
 * @returns {Object} - Betöltött játékállapot vagy kezdeti állapot
 */
function loadGame() {
    const state = localStorage.getItem('varpalotaGameState');
    return state ? JSON.parse(state) : initialState;
}

export { saveGame, loadGame, initialState };
