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
        Csorvivi: { location: 'Muzeumkert', status: 'active' }
    },
    decisions: [],
    tasks: {
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
        restaurant: { completed: false, xp: 20 }, // Added missing tasks
        museumEvent: { completed: false, xp: 25 } // Added missing tasks
    },
    settings: { // Game Settings
        musicMuted: false
    }
};

/**
 * Save game state to localStorage
 * @param {Object} state - Current game state
 */
function saveGame(state) {
    localStorage.setItem('varpalotaGameState', JSON.stringify(state));
}

/**
 * Load game state from localStorage
 * @returns {Object} - Loaded game state or initial state
 */
function loadGame() {
    const state = localStorage.getItem('varpalotaGameState');
    return state ? JSON.parse(state) : initialState;
}

export { saveGame, loadGame, initialState };
