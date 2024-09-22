// main.js

import { saveGame, loadGame, initialState } from './gameState.js';

// Inicializáljuk a játék állapotát
let gameState = loadGame();

// Debug: Log a betöltött játék állapotát
console.log("Betöltött Játékállapot:", gameState);

// Biztosítjuk, hogy minden tulajdonság jelen van a játékállapotban
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

// Mentjük az állapotot a biztosítást követően
saveGame(gameState);

// Inicializáljuk az audiókat
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

// Lejátszuk a háttérzenét, ha nincs némítva
if (!gameState.settings.musicMuted) {
    backgroundMusic.play();
}

// Frissítjük a némítás gomb szövegét
const muteButton = document.getElementById('mute-button');
muteButton.textContent = backgroundMusic.mute() ? 'Engedélyezés' : 'Némítás';

// Képernyők megjelenítése
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        manageUIVisibility(screenId);
    } else {
        console.error(`A(z) ${screenId} azonosítójú képernyő nem található.`);
    }
}

// UI láthatóságának kezelése a képernyő alapján
function manageUIVisibility(screenId) {
    const playerInfo = document.getElementById('player-info');
    const taskList = document.getElementById('task-list');
    const gameContainer = document.getElementById('game-container');

    if (screenId === 'starting-screen' || screenId === 'intro-story' || screenId === 'player-name-screen') {
        playerInfo.style.display = 'none';
        taskList.style.display = 'none';
        gameContainer.style.display = 'none';
    } else {
        playerInfo.style.display = 'block';
        taskList.style.display = 'block';
        gameContainer.style.display = 'flex';
    }
}

// Játék inicializálása
function initializeGame() {
    showScreen('starting-screen');
}

// Eseményfigyelők beállítása

// Start gomb
document.getElementById('start-button').addEventListener('click', () => {
    playClickSound();
    showScreen('intro-story');
});

// Tovább gomb a bevezető történethez
document.getElementById('continue-button').addEventListener('click', () => {
    playClickSound();
    showScreen('player-name-screen');
});

// Játékos név megadása
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

// Játék indítása
function startGame() {
    playClickSound();
    document.getElementById('player-name').textContent = `Név: ${gameState.player.name}`;
    showScreen('game-container');
    updatePlayerInfo();
    updateTaskList();
    changeScene(gameState.currentScene);
}

// Játékos információ frissítése
function updatePlayerInfo() {
    document.getElementById('player-level').textContent = `Szint: ${gameState.player.level}`;
    document.getElementById('player-xp').textContent = `XP: ${gameState.player.xp}/${gameState.player.xpForNextLevel}`;
}

// Feladatlista frissítése
function updateTaskList() {
    const tasksElement = document.getElementById('tasks');
    tasksElement.innerHTML = ''; // Jelenlegi feladatok törlése

    // Fő küldetés követő frissítése
    const mainQuestStage = document.getElementById('main-quest-stage');
    const mainQuestProgress = document.getElementById('main-quest-progress');
    mainQuestStage.textContent = gameState.tasks.mainQuest.currentStage;
    mainQuestProgress.value = gameState.tasks.mainQuest.currentStage;
    mainQuestProgress.max = 5; // Teljes szakaszok száma

    // Mellékfeladatok megjelenítése
    for (const [taskName, taskData] of Object.entries(gameState.tasks.sideQuests)) {
        if (!taskData.completed) {
            const taskItem = document.createElement('li');
            taskItem.textContent = `${capitalizeFirstLetter(taskName)} (XP: ${taskData.xp})`;
            tasksElement.appendChild(taskItem);
        }
    }
}

// Első betű nagybetűvé alakítása
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Kattintási hang lejátszása
function playClickSound() {
    clickSound.play();
}

// Némítás gomb eseménykezelője
muteButton.addEventListener('click', () => {
    playClickSound();
    backgroundMusic.mute(!backgroundMusic.mute());
    gameState.settings.musicMuted = backgroundMusic.mute();
    muteButton.textContent = backgroundMusic.mute() ? 'Engedélyezés' : 'Némítás';
    saveGame(gameState);
});

// Oldalsáv helyszín gombok eseménykezelője
document.querySelectorAll('.location-button').forEach(button => {
    button.addEventListener('click', () => {
        if (button.disabled) return; // Ha a gomb le van tiltva, ne történjen semmi
        const location = button.getAttribute('data-place');
        playClickSound();
        changeScene(location);
    });
});

// Jelenet váltása
function changeScene(sceneId) {
    const sceneDisplay = document.getElementById('scene-display');
    sceneDisplay.innerHTML = ''; // Jelenlegi jelenet törlése

    // Jelenet részleteinek definiálása (kép és leírás)
    const sceneDetails = {
        'Foter': {
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/A_volt_Palota_Szálló_épülete%2C_Szabadság_tér%2C_2017_Várpalota.jpg/1024px-A_volt_Palota_Szálló_épülete%2C_Szabadság_tér%2C_2017_Várpalota.jpg',
            description: 'A nyüzsgő terület, ahol a fesztivál előkészületei zajlanak.'
        },
        'Fori': {
            image: 'https://forgacsterasz.hu/upload/media/social-share-1200x630.jpg',
            description: 'A piac területe, ahol a kereskedők állítják ki standjaikat, különböző árukat kínálva.'
        },
        'Spori': {
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBN0WPYhYEKXYVZnzXMc7d-XjvSyRxSd8n3w&s',
            description: 'Az edzőterem, ahol a helyiek sportolnak és egészségüket megőrzik.'
        },
        'Alagsor': {
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjJtp_-OdNx-H1HaIQVBquhfadL76GD4WxsA&s',
            description: 'A város alagsora, rejtett folyosók és titkok helyszíne.'
        },
        'Nitro': {
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO3cEnJXSipebQqHfdPY_Hq6sSxr80MsqLIQ&s',
            description: 'A Nitro éjszakai klub, ahol a város fiataljai találkoznak és szórakoznak.'
        },
        'Kastely': {
            image: 'https://kastelydombkavezo.hu/wp-content/uploads/2023/06/image0-1.jpeg',
            description: 'A Kastély, a város történelmi épülete és események helyszíne.'
        },
        'Bisztro': {
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDOywSyDTM-Ua7gAtmqEZWpp1bUHPowyjvEg&s',
            description: 'A Bisztro, ahol a város lakosai étkeznek és találkoznak.'
        },
        'Kertesz': {
            image: 'https://media.istockphoto.com/id/1262540690/hu/fot%C3%B3/egy-keskeny-s%C3%A1ros-f%C3%B6ld%C3%BAt-haladt-%C3%A1t-a-vizes-mez%C5%91gazdas%C3%A1gi-ter%C3%BClet-k%C3%B6zep%C3%A9n-mindk%C3%A9t-oldalon.jpg?s=612x612&w=0&k=20&c=v6Ijt3VAe2o9-MJ56keNmMWP5-gGnKX8l9nk-F_oszc=',
            description: 'A kertészeti terület, ahol növényeket gondoznak és pihenőhelyek találhatók.'
        },
        'Fincsi Bufé': {
            image: 'https://lh3.googleusercontent.com/p/AF1QipMavyX0ulE1urHtrNsa8cfSbTVNsrIgR6I8ekI9=s680-w680-h510',
            description: 'A Fincsi Bufé, ahol a város lakosai gyors harapnivalókat vásárolnak.'
        },
        'Nyugdíjas': {
            image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiK6a45ruaE6DR4J2SYXi_RVZyoW5WWhQqdw9NgnKnKisDzzLau2q1HLO1efQB4cyZSd56SQFDfrRIk9UBR2RhlBQkir4JgmNjS4TYT7NfsE-aKOT1ZKSi2Hom72eaE9KzJqxpP9eqTTxk/s280/tavasz_02.jpg',
            description: 'A Nyugdíjas lakosok otthona, ahol a város idősebb tagjai élnek.'
        },
        'Petfurdo': {
            image: 'https://www.ertekesminoseg.hu/media/galeria/big/dsc1684.jpg',
            description: 'A Petfurdo, ahol a város lakói találkoznak és beszélgetnek.'
        },
        'Dr. Szikla': {
            image: 'https://kirandulastervezo.hu/photos/Petfurdo_Doktor_Szikla_01.jpg',
            description: 'Dr. Szikla orvosa, aki a város egészségügyi ellátását végzi.'
        },
        'Gaspar Birtok': {
            image: 'https://example.com/gaspar_birtok.jpg',
            description: 'A Gaspar Birtok, a város szőlészeti területe.'
        },
        'Foter': {
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBN0WPYhYEKXYVZnzXMc7d-XjvSyRxSd8n3w&s',
            description: 'A Foter, ahol a város fiataljai zenélnek és buliznak.'
        },
        'Danko Utca': {
            image: 'https://utcakereso.hu/tile/osm/18/144282/91997.png?3',
            description: 'A Danko utca, a város forgalmas utcája.'
        },
        'Bisztro': {
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDOywSyDTM-Ua7gAtmqEZWpp1bUHPowyjvEg&s',
            description: 'A Bisztro, ahol a város lakosai étkeznek és találkoznak.'
        },
        'Muzeumkert': {
            image: 'https://www.ittjartam.hu/profil/ugor-images/muzeumkert-etterem-4508-1200x800.webp',
            description: 'A Muzeumkert, ahol a város történelmét bemutató kiállítások találhatók.'
        },
        'Laboratórium': {
            image: 'https://example.com/laboratory.jpg',
            description: 'Egy elhagyatott laboratórium, tele titokzatos eszközökkel és rejtett titkokkal.'
        }
        // További jelenetek hozzáadása szükség szerint
    };

    // Jelenet részleteinek lekérése
    const details = sceneDetails[sceneId] || {
        image: 'url("default-image-url.jpg")',
        description: 'Egy csendes helyszín sajátos bájjal.'
    };

    // Jelenet elem létrehozása
    const scene = document.createElement('div');
    scene.id = sceneId;
    scene.classList.add('scene', 'active');
    scene.style.backgroundImage = `url('${details.image}')`;

    // Leírás hozzáadása a jelenethez
    const descriptionOverlay = document.createElement('div');
    descriptionOverlay.classList.add('scene-description');
    descriptionOverlay.textContent = details.description;
    scene.appendChild(descriptionOverlay);

    // Jelenet címe
    const sceneTitle = document.createElement('h1');
    sceneTitle.textContent = sceneId;
    scene.appendChild(sceneTitle);

    // NPC-k hozzáadása a jelenethez
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
            npcElement.tabIndex = 0; // Fókuszálhatóvá teszi
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

    // Jelenet hozzáadása a jelenet megjelenítőhöz
    sceneDisplay.appendChild(scene);

    // Játék állapot frissítése
    gameState.currentScene = sceneId;
    saveGame(gameState);

    // UI frissítése
    updatePlayerInfo();
    updateTaskList();
}

// NPC-k listájának lekérése a jelenet alapján
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
        'Muzeumkert': ['Csorvivi', 'Elvira'], // Elvira hozzáadva
        'Laboratórium': [] // Példa új helyszínre
        // További jelenetek és NPC-k hozzáadása szükség szerint
    };
    return sceneNPCs[sceneId] || [];
}

// NPC-val való interakció
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
        'Elvira': interactWithElvira // Új NPC
        // További NPC interakciók hozzáadása szükség szerint
    };

    if (interactions[npc]) {
        interactions[npc]();
    } else {
        showDialogue(`Szervusz! Én vagyok ${npc}.`, [
            { text: 'Elbúcsúzom', action: closeDialogue }
        ]);
    }
}

// Dialógus megjelenítése
function showDialogue(text, options = []) {
    const sceneDisplay = document.getElementById('scene-display');

    // Dialógus doboz létrehozása
    const dialogueBox = document.createElement('div');
    dialogueBox.classList.add('dialogue-box');

    // Dialógus szöveg
    const dialogueText = document.createElement('p');
    dialogueText.textContent = text;
    dialogueBox.appendChild(dialogueText);

    // Dialógus opciók
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

    // Dialógus doboz hozzáadása a jelenet megjelenítőhöz
    sceneDisplay.appendChild(dialogueBox);

    // Dialógus animálása GSAP segítségével
    gsap.fromTo(dialogueBox, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 });
}

// Dialógus bezárása
function closeDialogue() {
    const dialogueBox = document.querySelector('.dialogue-box');
    if (dialogueBox) {
        // Dialógus doboz animálása
        gsap.to(dialogueBox, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => {
            dialogueBox.remove();
        }});
    }
}

// Fő küldetés események megjelenítése
function showStoryEvent(message) {
    showDialogue(message, [
        { text: 'Folytatás', action: closeDialogue }
    ]);
}

// Interakciók és feladatok definiálása

// Fő küldetés előrehaladás kezelése
function handleTaskCompletion(taskName) {
    const sideQuests = gameState.tasks.sideQuests;
    const mainQuest = gameState.tasks.mainQuest;

    // Mellékfeladat teljesítése esetén
    if (sideQuests[taskName] && !sideQuests[taskName].completed) {
        sideQuests[taskName].completed = true;
        addXP(sideQuests[taskName].xp);

        // Fő küldetés előrehaladása mellékfeladatok alapján
        switch (mainQuest.currentStage) {
            case 1:
                if (sideQuests.festival.completed && sideQuests.marketSetup.completed) {
                    mainQuest.currentStage = 2;
                    showStoryEvent("Segítettél a lakosoknak felkészülni a fesztiválra és az asztalfoglalásban. A város elkezd visszanyerni régi dicsőségét.");
                }
                break;
            case 2:
                if (sideQuests.vehicleRepair.completed && sideQuests.artExhibition.completed) {
                    mainQuest.currentStage = 3;
                    showStoryEvent("A járművek javítása és a művészeti kiállítások szervezése során nyomokat találtál a titokzatos eseményről.");
                }
                break;
            case 3:
                if (sideQuests.historyLesson.completed && sideQuests.networkUpgrade.completed) {
                    mainQuest.currentStage = 4;
                    showStoryEvent("A történelmi tanulmányok és a hálózat fejlesztése révén mélyebb betekintést nyertél Várpalota múltjába.");
                }
                break;
            case 4:
                if (sideQuests.concert.completed && sideQuests.healthCamp.completed) {
                    mainQuest.currentStage = 5;
                    showStoryEvent("A koncertek és az egészségügyi tábor sikeresen helyreállították a város egységét.");
                }
                break;
            case 5:
                // Fő küldetés befejezése
                mainQuest.completed = true;
                showDialogue("Gratulálok! Sikeresen helyreállítottad Várpalota békéjét és felfedezted a város titkait.", [
                    { text: 'Köszönöm!', action: closeDialogue }
                ]);
                break;
            default:
                break;
        }

        // Fő küldetés befejezése ellenőrzése
        if (mainQuest.currentStage > 5) {
            mainQuest.completed = true;
            showDialogue("Gratulálok! Sikeresen helyreállítottad Várpalota békéjét és felfedezted a város titkait.", [
                { text: 'Köszönöm!', action: closeDialogue }
            ]);
        }

        saveGame(gameState);
        updatePlayerInfo();
        updateTaskList();
    }
}

// NPC interakciók

// Interakció Gubi-val
function interactWithGubi() {
    if (gameState.tasks.mainQuest.currentStage === 1) {
        showDialogue('Szia! Én vagyok Gubi. A fesztivál előkészületeiben tudsz segíteni? Ez fontos ahhoz, hogy a város újra virágozzon.', [
            { text: 'Igen, segítek.', action: startFestivalTask },
            { text: 'Nem, később.', action: closeDialogue }
        ]);
    } else {
        showDialogue('Már segítettél a fesztiválon. Köszönöm a segítségedet!', [
            { text: 'Szívesen!', action: closeDialogue }
        ]);
    }
}

// Fesztivál feladat indítása
function startFestivalTask() {
    if (!gameState.tasks.sideQuests.festival.completed) {
        showDialogue('Segíthetsz a fesztivál előkészületeiben. Kezdjük el!', [
            { text: 'Rendben, hol kezdjük?', action: initiateFestivalPreparation }
        ]);
    } else {
        showDialogue('Már segítettél a fesztiválon. Köszönöm a segítségedet!', [
            { text: 'Szívesen!', action: closeDialogue }
        ]);
    }
}

// Fesztivál előkészítése
function initiateFestivalPreparation() {    
    showDialogue('Gyűjtsd össze a következő díszeket: Lufik, Függönyök és Csillárok.', [
        { text: 'Lufik beszerzése', action: () => gatherDecoration('Lufik') },
        { text: 'Függönyök beszerzése', action: () => gatherDecoration('Függönyök') },
        { text: 'Csillárok beszerzése', action: () => gatherDecoration('Csillárok') },
        { text: 'Mégsem', action: closeDialogue }
    ]);
}

// Díszek beszerzése
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

// Fesztivál feladat teljesítése ellenőrzése
function checkFestivalCompletion() {
    const requiredDecorations = ['Lufik', 'Függönyök', 'Csillárok'];
    const collectedDecorations = gameState.decisions.filter(decision => requiredDecorations.includes(decision.replace('Beszerzett: ', '')));
    if (collectedDecorations.length === requiredDecorations.length) {
        gameState.tasks.sideQuests.festival.completed = true;
        addXP(gameState.tasks.sideQuests.festival.xp);
        showDialogue('Minden dísz beszerződött! Gubi sikeresen felkészült a fesztiválra.', [
            { text: 'Folytatás', action: () => {
                handleTaskCompletion('festival');
                closeDialogue();
            }}
        ]);
    }
}

// Interakció Ricsko-val
function interactWithRicsko() {
    showDialogue('Szia! Én vagyok Ricsko, a Fori lelkes. Segíthetsz nekem asztalt foglalni?', [
        { text: 'Igen, szívesen!', action: startMarketSetupTask },
        { text: 'Nem, éppen elfoglalt vagyok.', action: closeDialogue }
    ]);
}

// Asztalfoglalás feladat indítása
function startMarketSetupTask() {
    if (!gameState.tasks.sideQuests.marketSetup.completed) {
        showDialogue('Kérlek, gyűjtsd össze a következő felszereléseket: Asztal, Székek és Zászlók.', [
            { text: 'Asztal beszerzése', action: () => gatherEquipment('Asztal') },
            { text: 'Székek beszerzése', action: () => gatherEquipment('Székek') },
            { text: 'Zászlók beszerzése', action: () => gatherEquipment('Zászlók') },
            { text: 'Mégsem', action: closeDialogue }
        ]);
    } else {
        showDialogue('Már segítettél az asztalfoglalásban. Köszönöm!', [
            { text: 'Folytatás', action: closeDialogue }
        ]);
    }
}

// Felszerelések beszerzése
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

// Asztalfoglalás feladat teljesítése ellenőrzése
function checkMarketSetupCompletion() {
    const requiredEquipments = ['Asztal', 'Székek', 'Zászlók'];
    const collectedEquipments = gameState.decisions.filter(decision => requiredEquipments.includes(decision.replace('Beszerzett: ', '')));
    if (collectedEquipments.length === requiredEquipments.length) {
        gameState.tasks.sideQuests.marketSetup.completed = true;
        addXP(gameState.tasks.sideQuests.marketSetup.xp);
        showDialogue('Minden felszerelés beszerződött! Ricsko sikeresen szerzett asztalt.', [
            { text: 'Folytatás', action: () => {
                handleTaskCompletion('marketSetup');
                closeDialogue();
            }}
        ]);
    }
}

// Interakció Jcsar-val
function interactWithJcsar() {
    showDialogue('Helló! Én vagyok Jcsar, a város szerelője. Az autóm leállt. Tudsz segíteni megtalálni a hiányzó alkatrészeket?', [
        { text: 'Igen, segíthetek.', action: startVehicleRepairTask },
        { text: 'Memóriajáték a segítséghez', action: startMemoryGame },
        { text: 'Nem, nem tudok.', action: closeDialogue }
    ]);
}

// Interakció Elvirával
function interactWithElvira() {
    showDialogue('Szia! Én vagyok Elvira a Muzeumkertből. Segíthetsz egy különleges kiállítás megszervezésében?', [
        { text: 'Igen, szívesen!', action: startMuseumEventTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}


// Járműjavítás feladat indítása
function startVehicleRepairTask() {
    if (!gameState.tasks.sideQuests.vehicleRepair.completed) {
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

// Alkatrészek megtalálása
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

// Járműjavítás feladat teljesítése ellenőrzése
function checkVehicleRepairCompletion() {
    const requiredParts = ['Motor', 'Gumik', 'Akkumulátor'];
    const collectedParts = gameState.decisions.filter(decision => requiredParts.includes(decision.replace('Megtálált alkatrész: ', '')));
    if (collectedParts.length === requiredParts.length) {
        gameState.tasks.sideQuests.vehicleRepair.completed = true;
        addXP(gameState.tasks.sideQuests.vehicleRepair.xp);
        showDialogue('Minden alkatrész megtalálva! Jcsar sikeresen megjavította az autót.', [
            { text: 'Folytatás', action: () => {
                handleTaskCompletion('vehicleRepair');
                closeDialogue();
            }}
        ]);
    }
}

// Interakció Mogyi-val
function interactWithMogyi() {
    showDialogue('Szia! Én vagyok Mogyi, a Kertészben tartottam bulit, pár tárgy eltűnt. Segítesz megkeresni a tó alján?', [
        { text: 'Igen, szívesen!', action: startArtExhibitionTask },
        { text: 'Nem, talán később.', action: closeDialogue }
    ]);
}

// Művészeti kiállítás feladat indítása
function startArtExhibitionTask() {
    if (!gameState.tasks.sideQuests.artExhibition.completed) {
        showDialogue('Kérlek, gyűjtsd össze a következő műalkotásokat a tó aljáról: Festmény, Szobor és Fotográfia.', [
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

// Műalkotások beszerzése
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

// Művészeti kiállítás feladat teljesítése ellenőrzése
function checkArtExhibitionCompletion() {
    const requiredArtPieces = ['Festmény', 'Szobor', 'Fotográfia'];
    const collectedArtPieces = gameState.decisions.filter(decision => requiredArtPieces.includes(decision.replace('Beszerzett műalkotás: ', '')));
    if (collectedArtPieces.length === requiredArtPieces.length) {
        gameState.tasks.sideQuests.artExhibition.completed = true;
        addXP(gameState.tasks.sideQuests.artExhibition.xp);
        showDialogue('Oyee megvan minden, Mogyi máskor is tarthat bulit a Kertészben.', [
            { text: 'Folytatás', action: () => {
                handleTaskCompletion('artExhibition');
                closeDialogue();
            }}
        ]);
    }
}

// Interakció Kalman-nal
function interactWithKalman() {
    showDialogue('Üdv! Én vagyok Kalman, a város történésze. Szeretnéd megtudni Varpalota történelmét?', [
        { text: 'Igen, mesélj többet.', action: startHistoryLessonTask },
        { text: 'Nem, köszönöm.', action: closeDialogue }
    ]);
}

// Történelmi tanulmány feladat indítása
function startHistoryLessonTask() {
    if (!gameState.tasks.sideQuests.historyLesson.completed) {
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

// Helyszín látogatása történelmi tanulmányhoz
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

// Történelmi tanulmány feladat teljesítése ellenőrzése
function checkHistoryLessonCompletion() {
    const requiredLocations = ['Kastely', 'Muzeumkert'];
    const visitedLocations = gameState.decisions.filter(decision => requiredLocations.includes(decision.replace('Látogatott helyszín: ', '')));
    if (visitedLocations.length === requiredLocations.length) {
        gameState.tasks.sideQuests.historyLesson.completed = true;
        addXP(gameState.tasks.sideQuests.historyLesson.xp);
        showDialogue('Köszönöm, hogy segítettél a történelmi tanulmányban!', [
            { text: 'Folytatás', action: () => {
                handleTaskCompletion('historyLesson');
                closeDialogue();
            }}
        ]);
    }
}

// Interakció Foki James-sel
function interactWithFokiJames() {
    showDialogue('Hé! Én vagyok Foki James, a Nitro éjszakai klub tulajdonosa. Segíthetsz nekem egy nagy esemény tervezésében?', [
        { text: 'Igen, csináljuk!', action: startNightclubEventTask },
        { text: 'Nem, talán később.', action: closeDialogue }
    ]);
}

// Nitro éjszakai klub feladat indítása
function startNightclubEventTask() {
    if (!gameState.tasks.sideQuests.nightclubEvent.completed) {
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

// DJ beállítása
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

// Világítás beállítása
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

// Promóció szervezése
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
    showDialogue('Helló! Én vagyok Ati, a Kastely tech szakértője. Segíthetsz a város hálózatának fejlesztésében?', [
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
    showDialogue('Szia! Én vagyok Szabika a Fincsi Buféből. Fuves salatat akarok csinalni, segitesz?', [
        { text: 'Igen, segíthetek.', action: startCookingTask },
        { text: 'Nem, talán később.', action: closeDialogue }
    ]);
}

// Start Cooking Task
function startCookingTask() {
    if (!gameState.tasks.cooking.completed) {
        showDialogue('Szuper! Kérlek, gyűjtsd össze a következő hozzávalókat: Paradicsom, Sajt és Fu.', [
            { text: 'Paradicsom beszerzése', action: () => gatherIngredient('Paradicsom') },
            { text: 'Sajt beszerzése', action: () => gatherIngredient('Sajt') },
            { text: 'Fu beszerzése', action: () => gatherIngredient('Fu') },
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
    const requiredIngredients = ['Paradicsom', 'Sajt', 'Fu'];
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
    showDialogue('Szia! Én vagyok Dobi, a Zozo bolt tulajdonosa. Segíthetsz megtalálni elveszett kisállataimat a városban?', [
        { text: 'Igen, segíthetek.', action: startFindPetsTask },
        { text: 'Nem, most nem alkalmas.', action: closeDialogue }
    ]);
}

// Start Find Pets Task
function startFindPetsTask() {
    if (!gameState.tasks.findPets.completed) {
        showDialogue('Rendben! Kérlek, keresd meg a következő kisállatokat: Fluffy a macska, Rex a kutya és Goldie a hal.', [
            { text: 'Geci a macska keresése', action: () => findPet('Fluffy a macska') },
            { text: 'Szar a kutya keresése', action: () => findPet('Rex a kutya') },
            { text: 'Fasz a hal keresése', action: () => findPet('Goldie a hal') },
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
    const requiredPets = ['Geci a macska', 'Szar a kutya', 'Fasz a hal'];
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
    showDialogue('Helló! Én vagyok Csorvivi a Muzeumkertből. Csapjunk egy nagy bulit waaaaa', [
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
                    <div class="back"></div>
            <div class="front">${symbol}</div>
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
