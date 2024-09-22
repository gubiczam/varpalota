// main.js

import { saveGame, loadGame, initialState } from './gameState.js';

// Initialize Game State
let gameState = loadGame();

// Debug: Log loaded game state
console.log("Loaded Game State:", gameState);

// Ensure all properties are present in gameState
function ensureStateIntegrity(state, defaultState) {
    for (const key in defaultState) {
        if (!(key in state)) {
            state[key] = defaultState[key];
        } else {
            if (typeof defaultState[key] === 'object' && defaultState[key] !== null && !Array.isArray(defaultState[key])) {
                state[key] = ensureStateIntegrity(state[key], defaultState[key]);
            }
        }
    }
    return state;
}

gameState = ensureStateIntegrity(gameState, initialState);

// Save state after ensuring integrity
saveGame(gameState);

// Initialize Audio
const backgroundMusic = new Howl({
    src: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'],
    loop: true,
    volume: 0.5,
    mute: gameState.settings.musicMuted
});

const clickSound = new Howl({
    src: ['https://www.soundjay.com/buttons/sounds/button-16.mp3'],
    volume: 0.3
});

// Play background music if not muted
if (!gameState.settings.musicMuted) {
    backgroundMusic.play();
}

// Update Mute Button Text
const muteButton = document.getElementById('mute-button');
muteButton.textContent = backgroundMusic.mute() ? 'Engedélyezés' : 'Némítás';

// Function to display screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        manageUIVisibility(screenId);
    } else {
        console.error(`Screen with ID ${screenId} not found.`);
    }
}

// Manage visibility of player info and task list based on screen
function manageUIVisibility(screenId) {
    const playerInfo = document.getElementById('player-info');
    const taskList = document.getElementById('task-list');
    const gameContainer = document.getElementById('game-container');

    if (screenId === 'starting-screen' || screenId === 'player-name-screen') {
        playerInfo.style.display = 'none';
        taskList.style.display = 'none';
        gameContainer.style.display = 'none';
    } else {
        playerInfo.style.display = 'block';
        taskList.style.display = 'block';
        gameContainer.style.display = 'flex';
    }
}

// Initialize Scenes and UI
function initializeGame() {
    showScreen('starting-screen');
}

// Event Listener for Start Button
document.getElementById('start-button').addEventListener('click', () => {
    playClickSound();
    showScreen('player-name-screen');
});

// Event Listener for Player Name Form Submission
document.getElementById('player-name-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const playerNameInput = document.getElementById('player-name-input');
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        gameState.player.name = playerName;
        saveGame(gameState);
        startGame();
    } else {
        alert('Kérlek, adj meg egy érvényes nevet.');
        playerNameInput.focus();
    }
});

// Function to Start the Game
function startGame() {
    playClickSound();
    document.getElementById('player-name').textContent = `Név: ${gameState.player.name}`;
    showScreen('game-container');
    updatePlayerInfo();
    updateTaskList();
    changeScene(gameState.currentScene);
}

// Update Player Info Display
function updatePlayerInfo() {
    document.getElementById('player-level').textContent = `Szint: ${gameState.player.level}`;
    document.getElementById('player-xp').textContent = `XP: ${gameState.player.xp}/${gameState.player.xpForNextLevel}`;
}

// Update Task List Display
function updateTaskList() {
    const tasksElement = document.getElementById('tasks');
    tasksElement.innerHTML = ''; // Clear current tasks

    for (const [taskName, taskData] of Object.entries(gameState.tasks)) {
        if (!taskData.completed) {
            const taskItem = document.createElement('li');
            taskItem.textContent = `${capitalizeFirstLetter(taskName)} (XP: ${taskData.xp})`;
            tasksElement.appendChild(taskItem);
        }
    }
}

// Capitalize First Letter Utility Function
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Play Click Sound
function playClickSound() {
    clickSound.play();
}

// Mute Button Event Listener
muteButton.addEventListener('click', () => {
    playClickSound();
    backgroundMusic.mute(!backgroundMusic.mute());
    gameState.settings.musicMuted = backgroundMusic.mute();
    muteButton.textContent = backgroundMusic.mute() ? 'Engedélyezés' : 'Némítás';
    saveGame(gameState);
});

// Sidebar Location Buttons Event Listener
document.querySelectorAll('.location-button').forEach(button => {
    button.addEventListener('click', () => {
        const location = button.getAttribute('data-place');
        playClickSound();
        changeScene(location);
    });
});

// Function to Change Scenes
function changeScene(sceneId) {
    const sceneDisplay = document.getElementById('scene-display');
    sceneDisplay.innerHTML = ''; // Clear current scene

    // Create Scene Element
    const scene = document.createElement('div');
    scene.id = sceneId;
    scene.classList.add('scene', 'active');
    scene.style.backgroundImage = `url('https://ptcdn.hu/bridge?ms=745x390&t=5fc7c5ca&s=c7649d7c&url=https%3A%2F%2Fmapio.net%2Fimages-p%2F102950537.jpg')`; // Placeholder Image

    // Scene Title
    const sceneTitle = document.createElement('h1');
    sceneTitle.textContent = sceneId;
    scene.appendChild(sceneTitle);

    // Add NPCs to Scene
    const npcList = getSceneNPCs(sceneId);
    if (npcList.length === 0) {
        const noNPC = document.createElement('p');
        noNPC.textContent = 'Nincs itt NPC.';
        noNPC.style.textAlign = 'center';
        scene.appendChild(noNPC);
    } else {
        npcList.forEach(npc => {
            const npcElement = document.createElement('div');
            npcElement.classList.add('npc');
            npcElement.textContent = npc;
            npcElement.tabIndex = 0; // Make focusable
            npcElement.addEventListener('click', () => {
                playClickSound();
                interactWithNPC(npc);
            });
            npcElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    playClickSound();
                    interactWithNPC(npc);
                }
            });
            scene.appendChild(npcElement);
        });
    }

    // Append Scene to Scene Display
    sceneDisplay.appendChild(scene);

    // Update Game State
    gameState.currentScene = sceneId;
    saveGame(gameState);

    // Update UI
    updatePlayerInfo();
    updateTaskList();
}

// Function to Get NPCs Based on Scene
function getSceneNPCs(sceneId) {
    const sceneNPCs = {
        'Spori': ['Gubi'],
        'Fori': ['Ricsko'],
        'Alagsor': ['Jcsar'],
        'Kertesz': ['Mogyi', 'Kalman'],
        'Nitro': ['Foki James'],
        'Kastely': ['Ati'],
        'Fincsi Bufé': ['Szabika'],
        'Nyugdíjas': ['Varso'],
        'Petfurdo': ['Dobi'],
        'Dr. Szikla': ['Pimi'],
        'Gaspar Birtok': ['Csabika'],
        'Foter': ['Lil Dave'],
        'Danko Utca': ['Baldi'],
        'Bisztro': ['Tessza'],
        'Muzeumkert': ['Csorvivi'],
        // Add more scenes and NPCs as needed
    };
    return sceneNPCs[sceneId] || [];
}

// Function to Interact with NPC
function interactWithNPC(npc) {
    const interactions = {
        'Gubi': interactWithGubi,
        'Ricsko': interactWithRicsko,
        'Jcsar': interactWithJcsar,
        'Mogyi': interactWithMogyi,
        'Kalman': interactWithKalman,
        'Foki James': interactWithFokiJames,
        'Ati': interactWithAti,
        'Szabika': interactWithSzabika,
        'Varso': interactWithVarso,
        'Dobi': interactWithDobi,
        'Pimi': interactWithPimi,
        'Csabika': interactWithCsabika,
        'Lil Dave': interactWithLilDave,
        'Baldi': interactWithBaldi,
        'Tessza': interactWithTessza,
        'Csorvivi': interactWithCsorvivi,
        // Add more NPC interactions as needed
    };

    if (interactions[npc]) {
        interactions[npc]();
    } else {
        showDialogue(`Szervusz! Én vagyok ${npc}.`, [
            { text: 'Elbúcsúzom', action: closeDialogue }
        ]);
    }
}

// Function to Show Dialogue
function showDialogue(text, options = []) {
    const sceneDisplay = document.getElementById('scene-display');

    // Create Dialogue Box
    const dialogueBox = document.createElement('div');
    dialogueBox.classList.add('dialogue-box');

    // Dialogue Text
    const dialogueText = document.createElement('p');
    dialogueText.textContent = text;
    dialogueBox.appendChild(dialogueText);

    // Dialogue Options
    options.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.classList.add('button');
        optionButton.textContent = option.text;
        optionButton.addEventListener('click', () => {
            playClickSound();
            option.action();
            dialogueBox.remove();
            updateTaskList();
            updatePlayerInfo();
        });
        dialogueBox.appendChild(optionButton);
    });

    // Append Dialogue Box to Scene Display
    sceneDisplay.appendChild(dialogueBox);

    // Animate Dialogue Box with GSAP
    gsap.fromTo(dialogueBox, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 });
}

// Function to Close Dialogue
function closeDialogue() {
    const dialogueBox = document.querySelector('.dialogue-box');
    if (dialogueBox) {
        // Animate Dialogue Box Out
        gsap.to(dialogueBox, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => {
            dialogueBox.remove();
        }});
    }
}

// NPC Interaction Functions

// Interact with Gubi
function interactWithGubi() {
    showDialogue('Szia! Én vagyok Gubi. A városi fesztivált szervezzük.', [
        { text: 'Hogyan segíthetek?', action: startFestivalTask },
        { text: 'Elbúcsúzom', action: closeDialogue }
    ]);
}

// Start Festival Task
function startFestivalTask() {
    if (!gameState.tasks.festival.completed) {
        showDialogue('Segíthetsz a fesztivál előkészületeiben. Kezdjük el!', [
            { text: 'Rendben, hol kezdjük?', action: initiateFestivalPreparation }
        ]);
    } else {
        showDialogue('Már segítettél a fesztiválon. Köszönöm a segítségedet!', [
            { text: 'Szívesen!', action: closeDialogue }
        ]);
    }
}

// Initiate Festival Preparation
function initiateFestivalPreparation() {
    showDialogue('Gyűjtsd össze a következő díszeket: Lufik, Függönyök és Csillárok.', [
        { text: 'Lufik beszerzése', action: () => gatherDecoration('Lufik') },
        { text: 'Függönyök beszerzése', action: () => gatherDecoration('Függönyök') },
        { text: 'Csillárok beszerzése', action: () => gatherDecoration('Csillárok') },
        { text: 'Mégsem', action: closeDialogue }
    ]);
}

function gatherDecoration(decoration) {
    showDialogue(`Összegyűjtötted a(z) ${decoration}-t.`, [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push(`Beszerzett: ${decoration}`);
            checkFestivalCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

function checkFestivalCompletion() {
    const requiredDecorations = ['Lufik', 'Függönyök', 'Csillárok'];
    const collectedDecorations = gameState.decisions.filter(decision => requiredDecorations.includes(decision.replace('Beszerzett: ', '')));
    if (collectedDecorations.length === requiredDecorations.length) {
        gameState.tasks.festival.completed = true;
        addXP(gameState.tasks.festival.xp);
        showDialogue('Minden dísz beszerződött! Gubi sikeresen felkészült a fesztiválra.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

function interactWithRicsko() {
    showDialogue('Szia! Én vagyok Ricsko, a Fori piac eladója. Segíthetsz nekem beállítani az új standomat?', [
        { text: 'Igen, szívesen!', action: startMarketSetupTask },
        { text: 'Nem, éppen elfoglalt vagyok.', action: closeDialogue }
    ]);
}

function startMarketSetupTask() {
    if (!gameState.tasks.marketSetup.completed) {
        showDialogue('Kérlek, gyűjtsd össze a következő felszereléseket: Asztal, Székek és Zászlók.', [
            { text: 'Asztal beszerzése', action: () => gatherEquipment('Asztal') },
            { text: 'Székek beszerzése', action: () => gatherEquipment('Székek') },
            { text: 'Zászlók beszerzése', action: () => gatherEquipment('Zászlók') },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Már segítettél a piac beállításában. Köszönöm!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Gather Equipment
function gatherEquipment(equipment) {
    showDialogue(`Összegyűjtötted a(z) ${equipment}-t.`, [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push(`Beszerzett: ${equipment}`);
            checkMarketSetupCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Market Setup Task Completion
function checkMarketSetupCompletion() {
    const requiredEquipments = ['Asztal', 'Székek', 'Zászlók'];
    const collectedEquipments = gameState.decisions.filter(decision => requiredEquipments.includes(decision.replace('Beszerzett: ', '')));
    if (collectedEquipments.length === requiredEquipments.length) {
        gameState.tasks.marketSetup.completed = true;
        addXP(gameState.tasks.marketSetup.xp);
        showDialogue('Minden felszerelés beszerződött! Ricsko sikeresen felállította a standot.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// ... A meglévő interakciós funkciók ...

// Interact with Jcsar
function interactWithJcsar() {
    showDialogue('Helló! Én vagyok Jcsar, a város szerelője. Az autóm leállt. Tudsz segíteni megtalálni a hiányzó alkatrészeket?', [
        { text: 'Igen, segíthetek.', action: startVehicleRepairTask },
        { text: 'Memóriajáték a segítséghez', action: startMemoryGame },
        { text: 'Nem, nem tudok.', action: closeDialogue }
    ]);
}


// Start Vehicle Repair Task
function startVehicleRepairTask() {
    if (!gameState.tasks.vehicleRepair.completed) {
        showDialogue('Kérlek, találd meg a következő alkatrészeket: Motor, Gumik és Akkumulátor.', [
            { text: 'Motor megtalálása', action: () => findPart('Motor') },
            { text: 'Gumik megtalálása', action: () => findPart('Gumik') },
            { text: 'Akkumulátor megtalálása', action: () => findPart('Akkumulátor') },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy megjavítottad az autómat!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Find Vehicle Part
function findPart(part) {
    showDialogue(`Megtaláltad a(z) ${part}-t.`, [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push(`Megtálált alkatrész: ${part}`);
            checkVehicleRepairCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Vehicle Repair Task Completion
function checkVehicleRepairCompletion() {
    const requiredParts = ['Motor', 'Gumik', 'Akkumulátor'];
    const collectedParts = gameState.decisions.filter(decision => requiredParts.includes(decision.replace('Megtálált alkatrész: ', '')));
    if (collectedParts.length === requiredParts.length) {
        gameState.tasks.vehicleRepair.completed = true;
        addXP(gameState.tasks.vehicleRepair.xp);
        showDialogue('Minden alkatrész megtalálva! Jcsar sikeresen megjavította az autót.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Mogyi
function interactWithMogyi() {
    showDialogue('Szia! Én vagyok Mogyi, a Kertesz művésze. Előkészítem a művészeti kiállítást. Segítenél nekem?', [
        { text: 'Igen, szívesen!', action: startArtExhibitionTask },
        { text: 'Nem, talán később.', action: closeDialogue }
    ]);
}

// Start Art Exhibition Task
function startArtExhibitionTask() {
    if (!gameState.tasks.artExhibition.completed) {
        showDialogue('Kérlek, gyűjtsd össze a következő műalkotásokat különböző művészektől: Festmény, Szobor és Fotográfia.', [
            { text: 'Festmény beszerzése', action: () => gatherArtPiece('Festmény') },
            { text: 'Szobor beszerzése', action: () => gatherArtPiece('Szobor') },
            { text: 'Fotográfia beszerzése', action: () => gatherArtPiece('Fotográfia') },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Már segítettél a művészeti kiállításban. Köszönöm!', [
            { text: 'Szívesen!', action: closeDialogue }
        ]);
    }
}

// Function to Gather Art Pieces
function gatherArtPiece(artPiece) {
    showDialogue(`Összegyűjtötted a(z) ${artPiece}-t.`, [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push(`Beszerzett műalkotás: ${artPiece}`);
            checkArtExhibitionCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Art Exhibition Task Completion
function checkArtExhibitionCompletion() {
    const requiredArtPieces = ['Festmény', 'Szobor', 'Fotográfia'];
    const collectedArtPieces = gameState.decisions.filter(decision => requiredArtPieces.includes(decision.replace('Beszerzett műalkotás: ', '')));
    if (collectedArtPieces.length === requiredArtPieces.length) {
        gameState.tasks.artExhibition.completed = true;
        addXP(gameState.tasks.artExhibition.xp);
        showDialogue('Minden műalkotás beszerződött! Mogyi sikeresen felállította a kiállítást.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Kalman
function interactWithKalman() {
    showDialogue('Üdv! Én vagyok Kalman, a város történésze. Szeretnéd megtudni Varpalota történelmét?', [
        { text: 'Igen, mesélj többet.', action: startHistoryLessonTask },
        { text: 'Nem, köszönöm.', action: closeDialogue }
    ]);
}

// Start History Lesson Task
function startHistoryLessonTask() {
    if (!gameState.tasks.historyLesson.completed) {
        showDialogue('Kérlek, látogasd meg a következő helyszíneket történelmi tárgyak gyűjtéséhez: Kastely és Muzeumkert.', [
            { text: 'Látogass el Kastely-be', action: () => visitLocation('Kastely') },
            { text: 'Látogass el Muzeumkertbe', action: () => visitLocation('Muzeumkert') },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy segítettél a történelmi tanulmányban!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Visit Location for History Lesson
function visitLocation(location) {
    showDialogue(`Látogattál el a(z) ${location}-be és összegyűjtöttél történelmi tárgyakat.`, [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push(`Látogatott helyszín: ${location}`);
            checkHistoryLessonCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check History Lesson Task Completion
function checkHistoryLessonCompletion() {
    const requiredLocations = ['Kastely', 'Muzeumkert'];
    const visitedLocations = gameState.decisions.filter(decision => requiredLocations.includes(decision.replace('Látogatott helyszín: ', '')));
    if (visitedLocations.length === requiredLocations.length) {
        gameState.tasks.historyLesson.completed = true;
        addXP(gameState.tasks.historyLesson.xp);
        showDialogue('Köszönöm, hogy segítettél a történelmi tanulmányban!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Foki James
function interactWithFokiJames() {
    showDialogue('Hé! Én vagyok Foki James, a Nitro éjszakai klub tulajdonosa. Segíthetsz nekem egy nagy esemény tervezésében?', [
        { text: 'Igen, csináljuk!', action: startNightclubEventTask },
        { text: 'Nem, talán később.', action: closeDialogue }
    ]);
}

// Start Nightclub Event Task
function startNightclubEventTask() {
    if (!gameState.tasks.nightclubEvent.completed) {
        showDialogue('Szuper! Kérlek, teljesítsd a következő feladatokat: DJ beállítása, Világítás és Promóció.', [
            { text: 'DJ beállítása', action: () => setupDJ() },
            { text: 'Világítás beállítása', action: () => setupLighting() },
            { text: 'Promóció szervezése', action: () => organizePromotion() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Még egyszer köszönöm a segítségedet!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Setup DJ
function setupDJ() {
    showDialogue('Beállítottad a DJ rendszert.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Beállított DJ rendszert');
            checkNightclubEventCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Setup Lighting
function setupLighting() {
    showDialogue('Beállítottad a világítást.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Beállított világítást');
            checkNightclubEventCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Organize Promotion
function organizePromotion() {
    showDialogue('Szervezted a promóciót.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Szervezte a promóciót');
            checkNightclubEventCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Nightclub Event Task Completion
function checkNightclubEventCompletion() {
    const requiredTasks = ['Beállított DJ rendszert', 'Beállított világítást', 'Szervezte a promóciót'];
    const completedTasks = gameState.decisions.filter(decision => requiredTasks.includes(decision));
    if (completedTasks.length === requiredTasks.length) {
        gameState.tasks.nightclubEvent.completed = true;
        addXP(gameState.tasks.nightclubEvent.xp);
        showDialogue('Minden beállítás elvégződött! A Nitro Nightclub eseménye sikeres.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Ati
function interactWithAti() {
    showDialogue('Helló! Én vagyok Ati, a Kastelyi tech szakértője. Segíthetsz a város hálózatának fejlesztésében?', [
        { text: 'Igen, segíthetek.', action: startNetworkUpgradeTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Network Upgrade Task
function startNetworkUpgradeTask() {
    if (!gameState.tasks.networkUpgrade.completed) {
        showDialogue('Remek! Kérlek, teljesítsd a következő feladatokat: Routerek telepítése, Kapcsolatok tesztelése és Hálózat biztonságossá tétele.', [
            { text: 'Routerek telepítése', action: () => installRouters() },
            { text: 'Kapcsolatok tesztelése', action: () => testConnections() },
            { text: 'Hálózat biztonságossá tétele', action: () => secureNetwork() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy fejlesztetted a hálózatot!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Install Routers
function installRouters() {
    showDialogue('Telepítetted a routereket.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Telepített routereket');
            checkNetworkUpgradeCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Test Connections
function testConnections() {
    showDialogue('Tesztelted a kapcsolatokat.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Tesztelte a kapcsolatokat');
            checkNetworkUpgradeCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Secure Network
function secureNetwork() {
    showDialogue('Biztonságossá tetted a hálózatot.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Biztonságosított hálózatot');
            checkNetworkUpgradeCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Network Upgrade Task Completion
function checkNetworkUpgradeCompletion() {
    const requiredUpgrades = ['Telepített routereket', 'Tesztelte a kapcsolatokat', 'Biztonságosított hálózatot'];
    const completedUpgrades = gameState.decisions.filter(decision => requiredUpgrades.includes(decision));
    if (completedUpgrades.length === requiredUpgrades.length) {
        gameState.tasks.networkUpgrade.completed = true;
        addXP(gameState.tasks.networkUpgrade.xp);
        showDialogue('Minden hálózati fejlesztés befejezve! A hálózat sikeresen fejlesztve.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Szabika
function interactWithSzabika() {
    showDialogue('Szia! Én vagyok Szabika a Fincsi Buféből. Segíthetsz egy különleges étel elkészítésében a városi eseményre?', [
        { text: 'Igen, segíthetek.', action: startCookingTask },
        { text: 'Nem, talán később.', action: closeDialogue }
    ]);
}

// Start Cooking Task
function startCookingTask() {
    if (!gameState.tasks.cooking.completed) {
        showDialogue('Szuper! Kérlek, gyűjtsd össze a következő hozzávalókat: Paradicsom, Sajt és Bazsalikom.', [
            { text: 'Paradicsom beszerzése', action: () => gatherIngredient('Paradicsom') },
            { text: 'Sajt beszerzése', action: () => gatherIngredient('Sajt') },
            { text: 'Bazsalikom beszerzése', action: () => gatherIngredient('Bazsalikom') },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm a főzésben való segítséget!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Gather Ingredients
function gatherIngredient(ingredient) {
    showDialogue(`Összegyűjtötted a(z) ${ingredient}-t.`, [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push(`Gyűjtött hozzávaló: ${ingredient}`);
            checkCookingTaskCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Cooking Task Completion
function checkCookingTaskCompletion() {
    const requiredIngredients = ['Paradicsom', 'Sajt', 'Bazsalikom'];
    const collectedIngredients = gameState.decisions.filter(decision => requiredIngredients.includes(decision.replace('Gyűjtött hozzávaló: ', '')));
    if (collectedIngredients.length === requiredIngredients.length) {
        gameState.tasks.cooking.completed = true;
        addXP(gameState.tasks.cooking.xp);
        showDialogue('Minden hozzávalót összegyűjtöttél! Szabika sikeresen elkészítette a különleges ételt.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Varso
function interactWithVarso() {
    showDialogue('Helló! Én vagyok Varso, nyugdíjas lakos. Ősi történetekkel szolgálok. Szeretnél hallani egyet?', [
        { text: 'Igen, mesélj egy történetet.', action: listenToStory },
        { text: 'Nem, köszönöm.', action: closeDialogue }
    ]);
}

// Function to Listen to a Story
function listenToStory() {
    showDialogue('Egyszer volt, hol nem volt, Varpalota egy nyugodt falu volt...', [
        { text: 'Köszönöm', action: () => {
            addXP(10); // XP for listening to a story
            closeDialogue();
        }}
    ]);
}

// Interact with Dobi
function interactWithDobi() {
    showDialogue('Szia! Én vagyok Dobi, a kisállat bolt tulajdonosa. Segíthetsz megtalálni elveszett kisállataimat a városban?', [
        { text: 'Igen, segíthetek.', action: startFindPetsTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Find Pets Task
function startFindPetsTask() {
    if (!gameState.tasks.findPets.completed) {
        showDialogue('Rendben! Kérlek, keresd meg a következő kisállatokat: Fluffy a macska, Rex a kutya és Goldie a hal.', [
            { text: 'Fluffy a macska keresése', action: () => findPet('Fluffy a macska') },
            { text: 'Rex a kutya keresése', action: () => findPet('Rex a kutya') },
            { text: 'Goldie a hal keresése', action: () => findPet('Goldie a hal') },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy segítettél megtalálni a kisállatokat!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Find a Pet
function findPet(pet) {
    showDialogue(`Megtaláltad ${pet}-t.`, [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push(`Megtálált kisállat: ${pet}`);
            checkFindPetsCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Find Pets Task Completion
function checkFindPetsCompletion() {
    const requiredPets = ['Fluffy a macska', 'Rex a kutya', 'Goldie a hal'];
    const foundPets = gameState.decisions.filter(decision => requiredPets.includes(decision.replace('Megtálált kisállat: ', '')));
    if (foundPets.length === requiredPets.length) {
        gameState.tasks.findPets.completed = true;
        addXP(gameState.tasks.findPets.xp);
        showDialogue('Minden kisállatot megtaláltál! Dobi hálásan köszöni a segítségedet.', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Pimi
function interactWithPimi() {
    showDialogue('Helló! Én vagyok Pimi, a város orvosa. Segíthetsz egy egészségügyi tábor megszervezésében?', [
        { text: 'Igen, segíthetsz.', action: startHealthCampTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Health Camp Task
function startHealthCampTask() {
    if (!gameState.tasks.healthCamp.completed) {
        showDialogue('Szuper! Kérlek, teljesítsd a következő feladatokat: Sátorok felállítása, Orvosi készletek elrendezése és Esemény promotálása.', [
            { text: 'Sátorok felállítása', action: () => setupTents() },
            { text: 'Orvosi készletek elrendezése', action: () => arrangeMedicalSupplies() },
            { text: 'Esemény promotálása', action: () => promoteEvent() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy megszervezted az egészségügyi tábort!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Setup Tents
function setupTents() {
    showDialogue('Felállítottad a sátorokat az egészségügyi tábor számára.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Felállított sátrakat');
            checkHealthCampCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Arrange Medical Supplies
function arrangeMedicalSupplies() {
    showDialogue('Elrendezte az orvosi készleteket.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Rendezte az orvosi készleteket');
            checkHealthCampCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Promote Event
function promoteEvent() {
    showDialogue('Promotáltad az egészségügyi tábor eseményét sikeresen.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Promotálta az eseményt');
            checkHealthCampCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Health Camp Task Completion
function checkHealthCampCompletion() {
    const requiredTasks = ['Felállított sátrakat', 'Rendezte az orvosi készleteket', 'Promotálta az eseményt'];
    const completedTasks = gameState.decisions.filter(decision => requiredTasks.includes(decision));
    if (completedTasks.length === requiredTasks.length) {
        gameState.tasks.healthCamp.completed = true;
        addXP(gameState.tasks.healthCamp.xp);
        showDialogue('Egészségügyi tábor sikeresen megszervezve!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Csabika
function interactWithCsabika() {
    showDialogue('Szia! Én vagyok Csabika a Gaspar Birtokból. Segíthetsz a szőlészet kezelésében?', [
        { text: 'Igen, segíthetsz.', action: startVineyardTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Vineyard Task
function startVineyardTask() {
    if (!gameState.tasks.vineyard.completed) {
        showDialogue('Rendben! Kérlek, teljesítsd a következő feladatokat: Szőlőszedés, Borok előkészítése és Szőlők gondozása.', [
            { text: 'Szőlőszedés', action: () => harvestGrapes() },
            { text: 'Borok előkészítése', action: () => prepareWines() },
            { text: 'Szőlők gondozása', action: () => tendVines() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy kezelted a szőlészetet!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Harvest Grapes
function harvestGrapes() {
    showDialogue('Szedszedi a szőlőket.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Szőlőszedést végzett');
            checkVineyardCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Prepare Wines
function prepareWines() {
    showDialogue('Előkészíted a borokat.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Borok előkészítését végezte');
            checkVineyardCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Tend Vines
function tendVines() {
    showDialogue('Gondozod a szőlőket.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Szőlők gondozását végezte');
            gameState.tasks.vineyard.completed = true;
            addXP(gameState.tasks.vineyard.xp);
            showDialogue('Szőlészet sikeresen kezelve!', [
                { text: 'Folytatás', action: closeDialogue }
            ]);
        }}
    ]);
}

// Function to Check Vineyard Task Completion
function checkVineyardCompletion() {
    const requiredTasks = ['Szőlőszedést végzett', 'Borok előkészítését végezte', 'Szőlők gondozását végezte'];
    const completedTasks = gameState.decisions.filter(decision => requiredTasks.includes(decision));
    if (completedTasks.length === requiredTasks.length) {
        gameState.tasks.vineyard.completed = true;
        addXP(gameState.tasks.vineyard.xp);
        showDialogue('Szőlészet sikeresen kezelve!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Lil Dave
function interactWithLilDave() {
    showDialogue('Hé! Én vagyok Lil Dave, a Foter zenésze. Segíthetsz egy koncert megszervezésében?', [
        { text: 'Igen, szervezzünk!', action: startConcertTask },
        { text: 'Nem, talán később.', action: closeDialogue }
    ]);
}

// Start Concert Task
function startConcertTask() {
    if (!gameState.tasks.concert.completed) {
        showDialogue('Szuper! Kérlek, teljesítsd a következő feladatokat: Helyszín lefoglalása, Hangrendszer beállítása és Koncert promotálása.', [
            { text: 'Helyszín lefoglalása', action: () => reserveVenue() },
            { text: 'Hangrendszer beállítása', action: () => setupSoundSystem() },
            { text: 'Koncert promotálása', action: () => promoteConcert() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy megszervezted a koncertet!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Reserve Venue
function reserveVenue() {
    showDialogue('Lefoglaltad a koncert helyszínét.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Helyszín lefoglalva');
            checkConcertCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Setup Sound System
function setupSoundSystem() {
    showDialogue('Beállítottad a hangrendszert.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Hangrendszer beállítva');
            checkConcertCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Promote Concert
function promoteConcert() {
    showDialogue('Promotáltad a koncertet sikeresen.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Koncert promotálva');
            checkConcertCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Check Concert Task Completion
function checkConcertCompletion() {
    const requiredTasks = ['Helyszín lefoglalva', 'Hangrendszer beállítva', 'Koncert promotálva'];
    const completedTasks = gameState.decisions.filter(decision => requiredTasks.includes(decision));
    if (completedTasks.length === requiredTasks.length) {
        gameState.tasks.concert.completed = true;
        addXP(gameState.tasks.concert.xp);
        showDialogue('Koncert sikeresen megszervezve!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Baldi
function interactWithBaldi() {
    showDialogue('Helló! Én vagyok Baldi a Danko utcából. Segíthetsz a vállalkozásom bővítésében?', [
        { text: 'Igen, segíthetek.', action: startBusinessExpansionTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Business Expansion Task
function startBusinessExpansionTask() {
    if (!gameState.tasks.businessExpansion.completed) {
        showDialogue('Kérlek, teljesítsd a következő feladatokat: Új termékek bevezetése, Marketing kampány indítása és Ügyfélszolgálat fejlesztése.', [
            { text: 'Új termékek bevezetése', action: () => introduceNewProducts() },
            { text: 'Marketing kampány indítása', action: () => startMarketingCampaign() },
            { text: 'Ügyfélszolgálat fejlesztése', action: () => improveCustomerService() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy bővítetted a vállalkozást!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Introduce New Products
function introduceNewProducts() {
    showDialogue('Bevezetted az új termékeket.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Új termékeket bevezetett');
            checkBusinessExpansionCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Start Marketing Campaign
function startMarketingCampaign() {
    showDialogue('Indítottad a marketing kampányt.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Marketing kampányt indított');
            checkBusinessExpansionCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Improve Customer Service
function improveCustomerService() {
    showDialogue('Fejlesztetted az ügyfélszolgálatot.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Ügyfélszolgálatot fejlesztett');
            gameState.tasks.businessExpansion.completed = true;
            addXP(gameState.tasks.businessExpansion.xp);
            showDialogue('Vállalkozásod sikeresen bővült!', [
                { text: 'Folytatás', action: closeDialogue }
            ]);
        }}
    ]);
}

// Function to Check Business Expansion Task Completion
function checkBusinessExpansionCompletion() {
    const requiredTasks = ['Új termékeket bevezetett', 'Marketing kampányt indított', 'Ügyfélszolgálatot fejlesztett'];
    const completedTasks = gameState.decisions.filter(decision => requiredTasks.includes(decision));
    if (completedTasks.length === requiredTasks.length) {
        gameState.tasks.businessExpansion.completed = true;
        addXP(gameState.tasks.businessExpansion.xp);
        showDialogue('Vállalkozásod sikeresen bővült!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Tessza
function interactWithTessza() {
    showDialogue('Szia! Én vagyok Tessza a Bisztro-ból. Segíthetsz az étterem működtetésében?', [
        { text: 'Igen, segíthetek.', action: startRestaurantTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Restaurant Task
function startRestaurantTask() {
    if (!gameState.tasks.restaurant.completed) {
        showDialogue('Kérlek, teljesítsd a következő feladatokat: Menü frissítése, Hálózat bővítése és Vendégfogadás fejlesztése.', [
            { text: 'Menü frissítése', action: () => updateMenu() },
            { text: 'Hálózat bővítése', action: () => expandNetwork() },
            { text: 'Vendégfogadás fejlesztése', action: () => improveGuestReception() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy segítettél az étterem működtetésében!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Update Menu
function updateMenu() {
    showDialogue('Frissítetted az étterem menüjét.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Menü frissítése');
            checkRestaurantCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Expand Network
function expandNetwork() {
    showDialogue('Bővítetted a hálózatot.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Hálózat bővítése');
            checkRestaurantCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Improve Guest Reception
function improveGuestReception() {
    showDialogue('Fejlesztetted a vendégfogadást.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Vendégfogadás fejlesztése');
            gameState.tasks.restaurant.completed = true;
            addXP(gameState.tasks.restaurant.xp);
            showDialogue('Éttermed sikeresen működik!', [
                { text: 'Folytatás', action: closeDialogue }
            ]);
        }}
    ]);
}

// Function to Check Restaurant Task Completion
function checkRestaurantCompletion() {
    const requiredTasks = ['Menü frissítése', 'Hálózat bővítése', 'Vendégfogadás fejlesztése'];
    const completedTasks = gameState.decisions.filter(decision => requiredTasks.includes(decision));
    if (completedTasks.length === requiredTasks.length) {
        gameState.tasks.restaurant.completed = true;
        addXP(gameState.tasks.restaurant.xp);
        showDialogue('Éttermed sikeresen működik!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Interact with Csorvivi
function interactWithCsorvivi() {
    showDialogue('Helló! Én vagyok Csorvivi a Muzeumkertből. Segíthetsz a múzeum rendezvényeinek szervezésében?', [
        { text: 'Igen, segíthetsz.', action: startMuseumEventTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Museum Event Task
function startMuseumEventTask() {
    if (!gameState.tasks.museumEvent.completed) {
        showDialogue('Kérlek, teljesítsd a következő feladatokat: Exponátumok előkészítése, Esemény promóciója és Látogatók fogadása.', [
            { text: 'Exponátumok előkészítése', action: () => prepareExhibits() },
            { text: 'Esemény promóciója', action: () => promoteMuseumEvent() },
            { text: 'Látogatók fogadása', action: () => welcomeVisitors() },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Köszönöm, hogy segítettél a múzeum rendezvényeinek szervezésében!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Function to Prepare Exhibits
function prepareExhibits() {
    showDialogue('Előkészítetted az exponátumokat.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Exponátumok előkészítése');
            checkMuseumEventCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Promote Museum Event
function promoteMuseumEvent() {
    showDialogue('Promotáltad az eseményt.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Esemény promóciója');
            checkMuseumEventCompletion();
            saveGame(gameState);
            closeDialogue();
        }}
    ]);
}

// Function to Welcome Visitors
function welcomeVisitors() {
    showDialogue('Fogadtad a látogatókat.', [
        { text: 'Folytatás', action: () => {
            gameState.decisions.push('Látogatók fogadása');
            gameState.tasks.museumEvent.completed = true;
            addXP(gameState.tasks.museumEvent.xp);
            showDialogue('Múzeum rendezvénye sikeresen megszervezve!', [
                { text: 'Folytatás', action: closeDialogue }
            ]);
        }}
    ]);
}

// Function to Check Museum Event Task Completion
function checkMuseumEventCompletion() {
    const requiredTasks = ['Exponátumok előkészítése', 'Esemény promóciója', 'Látogatók fogadása'];
    const completedTasks = gameState.decisions.filter(decision => requiredTasks.includes(decision));
    if (completedTasks.length === requiredTasks.length) {
        gameState.tasks.museumEvent.completed = true;
        addXP(gameState.tasks.museumEvent.xp);
        showDialogue('Múzeum rendezvénye sikeresen megszervezve!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// main.js

// ... A meglévő JavaScript kód ...

// Memóriajáték Indítása
function startMemoryGame() {
    playClickSound();
    showScreen('memory-game-screen');
    initializeMemoryGame();
}

// Memóriajáték Kilépése
document.getElementById('exit-memory-game-button').addEventListener('click', () => {
    playClickSound();
    showScreen('game-container');
});

// Memóriajáték Inicializálása
function initializeMemoryGame() {
    const memoryGameContainer = document.getElementById('memory-game');
    memoryGameContainer.innerHTML = ''; // Ürítsük ki a konténert
    
    // Képek vagy szimbólumok listája (párok)
    const symbols = ['🍎', '🍌', '🍒', '🍇', '🍉', '🥝', '🍍', '🥥'];
    const gameSymbols = [...symbols, ...symbols]; // Párok létrehozása
    shuffleArray(gameSymbols); // Keverjük össze
    
    // Kártyák létrehozása
    gameSymbols.forEach(symbol => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.innerHTML = `
            <div class="front">${symbol}</div>
            <div class="back"></div>
        `;
        memoryGameContainer.appendChild(card);
        
        // Kattintási esemény hozzáadása
        card.addEventListener('click', () => flipCard(card));
    });
    
    // Játék állapotok
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    
    // Kártyák Keverése
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Kártya Megfordítása
    function flipCard(card) {
        if (lockBoard) return;
        if (card === firstCard) return;
        
        card.classList.add('flip');
        
        if (!hasFlippedCard) {
            // Első kártya kiválasztása
            hasFlippedCard = true;
            firstCard = card;
            return;
        }
        
        // Második kártya kiválasztása
        secondCard = card;
        checkForMatch();
    }
    
    // Pár Ellenőrzése
    function checkForMatch() {
        const isMatch = firstCard.querySelector('.front').textContent === secondCard.querySelector('.front').textContent;
        
        isMatch ? disableCards() : unflipCards();
    }
    
    // Kártyák Kikapcsolása, ha páros
    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        resetBoard();
        checkGameCompletion();
    }
    
    // Kártyák Visszafordítása, ha nem páros
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            
            resetBoard();
        }, 1000);
    }
    
    // Játék Állapotának Visszaállítása
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    
    // Kártyák Lekapcsolása a Játék Befejezéséhez
    function checkGameCompletion() {
        const allCards = document.querySelectorAll('.memory-card');
        const flippedCards = document.querySelectorAll('.memory-card.flip');
        
        if (flippedCards.length === allCards.length) {
            // Játék Befejezése
            setTimeout(() => {
                showDialogue('Gratulálok! Sikeresen befejezted a memóriajátékot.', [
                    { text: 'Oké', action: () => {
                        addXP(50); // XP a minijátékért
                        showScreen('game-container');
                        updatePlayerInfo();
                        closeDialogue();
                    }}
                ]);
            }, 500);
        }
    }
}

// Helper Function: Array Keverése (Újrafelhasználás a memóriajátékhoz)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// Function to Add XP and Handle Level Up
function addXP(amount) {
    gameState.player.xp += amount;
    if (gameState.player.xp >= gameState.player.xpForNextLevel) {
        gameState.player.level += 1;
        gameState.player.xp -= gameState.player.xpForNextLevel;
        gameState.player.xpForNextLevel += 50; // Increment XP required for next level
        showDialogue(`Gratulálok! Elérted a(z) ${gameState.player.level}. szintet!`, [
            { text: 'Oké', action: closeDialogue }
        ]);
    }
    saveGame(gameState);
    updatePlayerInfo();
}

// Initialize the Game
initializeGame();
