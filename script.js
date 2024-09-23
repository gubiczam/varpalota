// script.js

// ======================
// Places Data
// ======================
const places = {
    'Foter': {
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/A_volt_Palota_Szálló_épülete%2C_Szabadság_tér%2C_2017_Várpalota.jpg/1024px-A_volt_Palota_Szálló_épülete%2C_Szabadság_tér%2C_2017_Várpalota.jpg',
        description: 'A nyüzsgő terület, ahol a fesztivál előkészületei zajlanak.'
    },
    'Fori': {
        image: 'https://forgacsterasz.hu/upload/media/social-share-1200x630.jpg',
        description: 'A piac területe, ahol a kereskedők állítják ki standjaikat, különböző árukat kínálva.',
        name: 'fori'
    },
    'Spori': {
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBN0WPYhYEKXYVZnzXMc7d-XjvSyRxSd8n3w&s',
        description: 'Az edzőterem, ahol a helyiek sportolnak és egészségüket megőrzik.',
        name: 'spori'

    },
    'Alagsor': {
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjJtp_-OdNx-H1HaIQVBquhfadL76GD4WxsA&s',
        description: 'A város alagsora, rejtett folyosók és titkok helyszíne.',
        name: 'alagsor jo helyen'

    },
    'Nitro': {
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRO3cEnJXSipebQqHfdPY_Hq6sSxr80MsqLIQ&s',
        description: 'A Nitro éjszakai klub, ahol a város fiataljai találkoznak és szórakoznak.',
        name: 'nitroban hol mashol'

    },
    'Kastely': {
        image: 'https://kastelydombkavezo.hu/wp-content/uploads/2023/06/image0-1.jpeg',
        description: 'A Kastély, a város történelmi épülete és események helyszíne.',
        name: 'kástely'

    },
    'Bisztro': {
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDOywSyDTM-Ua7gAtmqEZWpp1bUHPowyjvEg&s',
        description: 'A Bisztro, ahol a város lakosai étkeznek és találkoznak.',
        name: 'bisztro'

    },
    'Kertesz': {
        image: 'https://media.istockphoto.com/id/1262540690/hu/fot%C3%B3/egy-keskeny-s%C3%A1ros-f%C3%B6ld%C3%BAt-haladt-%C3%A1t-a-vizes-mez%C5%91gazdas%C3%A1gi-ter%C3%BClet-k%C3%B6zep%C3%A9n-mindk%C3%A9t-oldalon.jpg?s=612x612&w=0&k=20&c=v6Ijt3VAe2o9-MJ56keNmMWP5-gGnKX8l9nk-F_oszc=',
        description: 'A kertészeti terület, ahol növényeket gondoznak és pihenőhelyek találhatók.',
        name: 'kertesz'

    },
    'Fincsi Bufé': {
        image: 'https://lh3.googleusercontent.com/p/AF1QipMavyX0ulE1urHtrNsa8cfSbTVNsrIgR6I8ekI9=s680-w680-h510',
        description: 'A Fincsi Bufé, ahol a város lakosai gyors harapnivalókat vásárolnak.',        name: 'nyilvan a fincsiben'


    },
    'Nyugdíjas': {
        image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiK6a45ruaE6DR4J2SYXi_RVZyoW5WWhQqdw9NgnKnKisDzzLau2q1HLO1efQB4cyZSd56SQFDfrRIk9UBR2RhlBQkir4JgmNjS4TYT7NfsE-aKOT1ZKSi2Hom72eaE9KzJqxpP9eqTTxk/s280/tavasz_02.jpg',
        description: 'A Nyugdíjas lakosok otthona, ahol a város idősebb tagjai élnek.',
        name: 'nyugdijas'

    },
    'Petfurdo': {
        image: 'https://www.ertekesminoseg.hu/media/galeria/big/dsc1684.jpg',
        description: 'A Petfurdo, ahol a város lakói találkoznak és beszélgetnek.',
        name: 'pét'

    },
    'Dr. Szikla': {
        image: 'https://kirandulastervezo.hu/photos/Petfurdo_Doktor_Szikla_01.jpg',
        description: 'Dr. Szikla orvosa, aki a város egészségügyi ellátását végzi.',
        name: 'turahegy'

    },
    'Gaspar Birtok': {
        image: 'https://example.com/gaspar_birtok.jpg',
        description: 'A Gaspar Birtok, a város szőlészeti területe.',
        name: 'gáspárék'

    },
    'Danko Utca': {
        image: 'https://utcakereso.hu/tile/osm/18/144282/91997.png?3',
        description: 'A Danko utca, a város forgalmas utcája.',
        name: 'dankoo'

    },
    'Muzeumkert': {
        image: 'https://www.ittjartam.hu/profil/ugor-images/muzeumkert-etterem-4508-1200x800.webp',
        description: 'A Muzeumkert, ahol a város történelmét bemutató kiállítások találhatók.',
        name: 'muzeumkert'

    }
    // Add more places if needed
};

// ======================
// Stories Data
// ======================
const stories = [
    {
        id: 'jcsar',
        character: 'Jcsar',
        location: 'Bokodi',
        dialogue: 'Szia! Jcsár vagyok és brutal nagy buli van a bokodiba. Segítesz szétbaszni a helyet?',
        choices: [
            {
                text: 'Igen, segítek szétbaszni a bokodit',
                outcomes: [
                    'Szigetelő a plafonon szétütése',
                    'Hűtő leragasztása',
                    'Díszlet szétdobálása'
                ],
                next: 'jcsar_aftermath' // Next branch for follow-up
            },
            {
                text: 'Nem, most nincs kedvem rombolni',
                outcomes: [
                    'Jcsar csalódottan néz rád, és elindul a buli előkészületeivel.'
                ],
                next: 'jcsar_return'
            }
        ]
    },
    {
        id: 'jcsar_aftermath',
        character: 'Jcsar',
        location: 'Bokodi',
        dialogue: 'Ez aztán a buli! De megjelentek a rendőrök. Segítesz elbújni, vagy beszélsz velük?',
        choices: [
            {
                text: 'Elbújok a hűtő mögött',
                outcomes: [
                    'Jcsar is veled bújik, és a rendőrök elmennek.'
                ],
                next: 'jcsar_celebration'
            },
            {
                text: 'Beszélek a rendőrökkel',
                outcomes: [
                    'A rendőrök meghallgatják a magyarázatod és elnézést kérnek a zavarkodásért.'
                ],
                next: 'jcsar_respect'
            }
        ]
    },
    {
        id: 'jcsar_return',
        character: 'Jcsar',
        location: 'Bokodi',
        dialogue: 'Hát, te tudod. De én megyek vissza, hogy felrázzam a hangulatot!',
        choices: [
            {
                text: 'Mégis csatlakozom',
                outcomes: [
                    'Jcsar örömmel fogad vissza, és együtt buliztok tovább.'
                ],
                next: 'jcsar_aftermath'
            },
            {
                text: 'Visszatérek később',
                outcomes: [
                    'Jcsar már nem olyan lelkes, de folytatja a bulit.'
                ],
                next: null // End of this story path
            }
        ]
    },
    {
        id: 'jcsar_celebration',
        character: 'Jcsar',
        location: 'Bokodi',
        dialogue: 'Megúsztuk! Most már tényleg szétbulizzuk ezt a helyet!',
        choices: [
            {
                text: 'Táncoljunk egész éjszaka!',
                outcomes: [
                    'Együtt táncoltok, és mindenki emlékezni fog erre az estére.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'jcsar_respect',
        character: 'Jcsar',
        location: 'Bokodi',
        dialogue: 'Haver, ez nagyon bátor volt! A rendőrök is meghívtak egy sörre.',
        choices: [
            {
                text: 'Elfogadod a sört',
                outcomes: [
                    'Jcsar rád koccint, és így ismeritek meg egymást igazán.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'milo',
        character: 'Milo',
        location: 'Fori',
        dialogue: 'Csao, Nonchalant Milo vagyok, a vad BMW tulajdonos. Lerobban a bömös, segítesz megjavítani?',
        choices: [
            {
                text: 'Igen, segítek megjavítani a bökőt',
                outcomes: [
                    'Index beszerelése',
                    'Hűtővíz feltöltése',
                    'Koptató kicserélése'
                ],
                next: 'milo_fixing'
            },
            {
                text: 'Nem, ugyis hengerfejes',
                outcomes: [
                    'Milo csalódottan bólint, és megpróbálja magától megjavítani a bömöst.'
                ],
                next: 'milo_later'
            }
        ]
    },
    {
        id: 'milo_fixing',
        character: 'Milo',
        location: 'Fori',
        dialogue: 'Köszönöm a segítséget! De most hallok valami furcsa zajt a motorháztető alól. Kinyitod?',
        choices: [
            {
                text: 'Kinyitom és ellenőrzöm',
                outcomes: [
                    'Megtalálod a hibát: egy kilazult csavar, amit rögzítesz.'
                ],
                next: 'milo_drive'
            },
            {
                text: 'Nem értek hozzá, jobb, ha te nézed meg',
                outcomes: [
                    'Milo rájön, hogy egy apró alkatrész hiányzott, és pótolja.'
                ],
                next: 'milo_drive'
            }
        ]
    },
    {
        id: 'milo_drive',
        character: 'Milo',
        location: 'Fori',
        dialogue: 'Haver, köszönöm! Beugrasz velem egy körre?',
        choices: [
            {
                text: 'Persze, menjünk egy kört!',
                outcomes: [
                    'A bömös felpörög, és együtt élvezitek a száguldást.'
                ],
                next: null
            },
            {
                text: 'Nem, elég volt a szerelésből',
                outcomes: [
                    'Milo megérti és hálásan búcsúzik.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'milo_later',
        character: 'Milo',
        location: 'Fori',
        dialogue: 'Sebaj, majd máskor segítesz.',
        choices: [
            {
                text: 'Persze, majd legközelebb',
                outcomes: [
                    'Milo bólint, és folytatja az autó javítását.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'ricsike',
        character: 'Ricsike',
        location: 'Fincsi Bufé',
        dialogue: 'Szia! Gáspár Richárd vagyok, a fincsi büfé egyik legnagyobb szponzora. Készítesz nekem egy 180ft-os hosszú lépést?',
        choices: [
            {
                text: 'Igen, már csinálom is',
                outcomes: [
                    'Félig koszos pohár kiválasztása',
                    'Szódavíz öntése',
                    'Legolcsóbb bor kiválasztása'
                ],
                next: 'ricsike_drink'
            },
            {
                text: 'Nem, szólj a dombi rékanak',
                outcomes: [
                    'Ricsike mérgesen felnéz, és visszatér a büféhoz.'
                ],
                next: 'ricsike_angry'
            }
        ]
    },
    {
        id: 'ricsike_drink',
        character: 'Ricsike',
        location: 'Fincsi Bufé',
        dialogue: 'Ez nem is olyan rossz! De most már nincs mit innom. Tudsz készíteni még egy italt?',
        choices: [
            {
                text: 'Persze, készítek még egyet',
                outcomes: [
                    'Készítesz egy újabb poharat, ezúttal tiszta pohárban.'
                ],
                next: 'ricsike_happy'
            },
            {
                text: 'Nem, ennyi elég volt mára',
                outcomes: [
                    'Ricsike vállat von, és másnál próbál szerencsét.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'ricsike_happy',
        character: 'Ricsike',
        location: 'Fincsi Bufé',
        dialogue: 'Ez már jobb! Tudod mit, legyünk haverok!',
        choices: [
            {
                text: 'Jó, haverok leszünk',
                outcomes: [
                    'Ricsike ad egy ingyen italkupont a büféhez.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'ricsike_angry',
        character: 'Ricsike',
        location: 'Fincsi Bufé',
        dialogue: 'Komolyan? Na, majd mással iszom inkább!',
        choices: [
            {
                text: 'Bocsánatot kérek',
                outcomes: [
                    'Ricsike megbocsát, de megjegyzi, hogy most nem az igazi.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'foki_james',
        character: 'Foki James',
        location: 'Spori',
        dialogue: 'Csa, Foki Mate, legjobb kezilabdázó. Lecselezzelek öcsi? Elfogadod Máté 1v1 kihívását?',
        choices: [
            {
                text: 'Igen, megszeretnem enni a foki cselt',
                outcomes: [
                    'Balra terelni',
                    'Jobbra terelni',
                    'Egyhelybe megállni'
                ],
                next: 'foki_james_next'
            },
            {
                text: 'Nem, te vagy a legjobb fenséges királyom',
                outcomes: [
                    'Foki Mate elégedetten bólint, és visszatér a tornaterembe.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'foki_james_next',
        character: 'Foki James',
        location: 'Spori',
        dialogue: 'Jó próbálkozás, de még nem vagy elég gyors! Még egy kört?',
        choices: [
            {
                text: 'Igen, újra próbálkozom',
                outcomes: [
                    'Még egyszer próbálkozol, és ezúttal sikeresen blokkolod a cselt!'
                ],
                next: 'foki_james_respect'
            },
            {
                text: 'Nem, elég volt mára',
                outcomes: [
                    'Foki James bólint, és gratulál a kitartásodhoz.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'foki_james_respect',
        character: 'Foki James',
        location: 'Spori',
        dialogue: 'Rendben van, öcsi! Mostantól te vagy az én jobb kezem!',
        choices: [
            {
                text: 'Köszönöm, megtisztelsz!',
                outcomes: [
                    'Foki James a válladra teszi a kezét, és együtt mentek inni egy sportitalt.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'gubi',
        character: 'Gubi',
        location: 'Bisztro',
        dialogue: 'Szia! Gubi vagyok, milliomos, és nincs meg a Dénes Janka telefonszám. Segítesz megkeresni?',
        choices: [
            {
                text: 'Igen, segítek ebben a románcban',
                outcomes: [
                    '06 keresése',
                    '70 keresése',
                    'Szuperman Batman keresése'
                ],
                next: 'gubi_success'
            },
            {
                text: 'Nem, engedd el Gubi :(',
                outcomes: [
                    'Gubi szomorúan távozik a Bisztro-ból.'
                ],
                next: 'gubi_later'
            }
        ]
    },
    {
        id: 'gubi_success',
        character: 'Gubi',
        location: 'Bisztro',
        dialogue: 'Megtaláltuk! Most meg kellene hívnunk egy italra. Mit gondolsz?',
        choices: [
            {
                text: 'Igen, hívd meg!',
                outcomes: [
                    'Gubi boldogan elmegy megkeresni Jankát, te pedig egy új barátra teszel szert.'
                ],
                next: null
            },
            {
                text: 'Nem, most inkább hagyjuk',
                outcomes: [
                    'Gubi vállat von, de megígéri, hogy legközelebb meghívja.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'gubi_later',
        character: 'Gubi',
        location: 'Bisztro',
        dialogue: 'Hát, majd máskor talán...',
        choices: [
            {
                text: 'Persze, legközelebb segítek',
                outcomes: [
                    'Gubi megjegyzi a szavaidat, és tovább indul.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'dobi',
        character: 'Dobi',
        location: 'Pétfürdő',
        dialogue: 'Heló! Dobi vagyok és szabályos, nyugodt vezetés közben darabokra hullott a Twingo 🙁. Segítesz megkeresni a darabjait?',
        choices: [
            {
                text: 'Igen, a Twingoért bármit!',
                outcomes: [
                    'Kerekek megkeresése',
                    '1.2 ideges turbómotor megkeresése',
                    'Rohadó alváz megkeresése'
                ],
                next: 'dobi_fixed'
            },
            {
                text: 'Nem, annak a kocsinak már mindegy',
                outcomes: [
                    'Dobi lehangoltan hajt el, és feladja a keresést.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'dobi_fixed',
        character: 'Dobi',
        location: 'Pétfürdő',
        dialogue: 'Megtaláltuk mindent! Segítesz összeszerelni?',
        choices: [
            {
                text: 'Persze, gyerünk!',
                outcomes: [
                    'Együtt összerakjátok a Twingót, és ismét járóképes lesz!'
                ],
                next: null
            },
            {
                text: 'Nem, ez már túl sok',
                outcomes: [
                    'Dobi vállat von, de hálásan megköszöni a segítséget.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'mogyi_kalman',
        character: 'Mogyi és Kalman',
        location: 'Somogyiek Spajzja Tele Nutellával',
        dialogue: 'Heo, valaki elvitte a Nutellánkat pedig nem is volt. Segítesz megkeresni őket?',
        choices: [
            {
                text: 'Igen, de akkor kérek belőle én is',
                outcomes: [
                    'Mogyi: Áh nincs is Nutella, meg nem is volt, mindegy is.',
                    'Kalman: Hallottad már Ekhoetól a Costa Ricát?',
                    'Meghallgatod a Costa Ricát?',
                    'Kalman örül'
                ],
                next: 'ekhoe_choice'
            },
            {
                text: 'Nem, mert sose adtok belőle',
                outcomes: [
                    'Kalman mérgesen elköszönt, és visszatér a spajzjába.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'ekhoe_choice',
        character: 'Kalman',
        location: 'Somogyiek Spajzja Tele Nutellával',
        dialogue: 'Hallottad már Ekhoet a Costa Ricát?',
        choices: [
            {
                text: 'Igen, imádom Ekhoet',
                outcomes: [
                    'Kalman örül és együtt keresitek a Nutellát.'
                ],
                next: null
            },
            {
                text: 'Nem, Ekhoe egy szar',
                outcomes: [
                    'Kalman csalódottan távozik, és feladjátok a keresést.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'varso',
        character: 'Varso',
        location: 'Nitro',
        dialogue: 'Hallod Tesi, Varso vagyok, @v.a.r.s.o Instán, kövess be, látod ott azokat a finom nőket? Gyere, kérjük el a Snapjuket!',
        choices: [
            {
                text: 'Elmehetsz Varsoval Snapeket vadászni',
                outcomes: [
                    'Varso a csábos mosolyával és lehengerlő dumájával, valamint a bontószökevény golfjával sikeresen szerzett neked Snapeket.'
                ],
                next: 'varso_follow'
            },
            {
                text: 'Nem tudsz nőkkel beszélni, szóval hagyjuk',
                outcomes: [
                    'Varso elmosolyodik és elbúcsúzik, megérti a döntésedet.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'varso_follow',
        character: 'Varso',
        location: 'Nitro',
        dialogue: 'Ez az, most már népszerűek vagyunk! Követed őket vissza?',
        choices: [
            {
                text: 'Igen, visszakövetem őket',
                outcomes: [
                    'Közvetlen üzenetet is küldesz, és új barátságok születnek.'
                ],
                next: null
            },
            {
                text: 'Nem, csak megfigyelem őket',
                outcomes: [
                    'Varso bólogat, de megjegyzi, hogy így nem lesznek barátnőid.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'szabika',
        character: 'Szabika',
        location: 'Foter',
        dialogue: 'Szevasz papa, gyere van nálam pár petárda, eldobaljuk?',
        choices: [
            {
                text: 'Igen, robbantsuk fel a főteret',
                outcomes: [
                    'Cseh illegal petárda eldobása',
                    'Szilveszteri lejárt petárda eldobása',
                    'Amerikai puff puff bing bang szuperpetárda eldobása',
                    'Sikeresen felrobbantottátok a főteret és felbasztátok a Csacsit!'
                ],
                next: 'szabika_aftermath'
            },
            {
                text: 'Nem, elég volt szilveszterkor',
                outcomes: [
                    'Szabika csalódottan bólogat és visszatér a petárdákhoz.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'szabika_aftermath',
        character: 'Szabika',
        location: 'Foter',
        dialogue: 'Most már menekülnünk kell, te maradsz vagy futsz?',
        choices: [
            {
                text: 'Futok!',
                outcomes: [
                    'Szabikával együtt rohantok el a főtérről, de megúszod a rendőröket!'
                ],
                next: null
            },
            {
                text: 'Maradok, vállalom a következményeket',
                outcomes: [
                    'A rendőrök megérkeznek, de Szabika kijátszik egy trükköt és elmenekültök!'
                ],
                next: null
            }
        ]
    },
    {
        id: 'csacsi',
        character: 'Csacsi',
        location: 'Spori',
        dialogue: 'Szia! Csacsi vagyok és padozok megint :(. Tudsz tenni valamit ellene?',
        choices: [
            {
                text: 'Igen, beküzdök a kezdőbe!',
                outcomes: [
                    'Edző lefizetése',
                    'Klubb megvásárlása',
                    'Mágikus dzsinn megidézése'
                ],
                next: 'csacsi_starter'
            },
            {
                text: 'Nem, padozzal tovább te szar',
                outcomes: [
                    'Csacsi dühösen távozik és folytatja a padozást.'
                ],
                next: null
            }
        ]
    },
    {
        id: 'csacsi_starter',
        character: 'Csacsi',
        location: 'Spori',
        dialogue: 'Ez az, most már a kezdőben vagyok! Jössz megnézni a meccset?',
        choices: [
            {
                text: 'Persze, szurkolok neked!',
                outcomes: [
                    'Csacsi bevisz téged az öltözőbe, és együtt készültök a meccsre.'
                ],
                next: null
            },
            {
                text: 'Nem, inkább otthonról nézem',
                outcomes: [
                    'Csacsi megértően bólint, de azért csalódott.'
                ],
                next: null
            }
        ]
    }
];

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const characterSelectionScreen = document.getElementById('character-selection-screen');
const characterSelection = document.getElementById('character-selection');
const sceneDisplayScreen = document.getElementById('scene-display-screen');
const sceneDisplay = document.getElementById('scene-display');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const choicesContainer = document.getElementById('choices-container');
const closeDialogueButton = document.getElementById('close-dialogue-button');

// ======================
// Game State
// ======================
// ======================
// Story Sequence - Define the order of characters
// ======================
const storySequence = ['jcsar', 'milo', 'ricsike', 'foki_james', 'gubi', 'dobi', 'mogyi_kalman', 'varso', 'szabika', 'csacsi'];

// ======================
// Game State
// ======================
let currentStory = null;
let historyStack = []; // To keep track of previous scenes if needed
let currentStoryIndex = 0; // Track the current character in the sequence

// ======================
// Initialize the Game
// ======================
function initGame() {
    startButton.addEventListener('click', () => {
        startScreen.classList.remove('active');
        characterSelectionScreen.classList.add('active');
        displayNextCharacter(); // Start the game with the first character
    });
}

// ======================
// Display the Next Character to Visit
// ======================
function displayNextCharacter() {
    characterSelection.innerHTML = ''; // Clear previous content

    const nextCharacterId = storySequence[currentStoryIndex];
    const story = stories.find(story => story.id === nextCharacterId);

    if (story) {
        const card = document.createElement('div');
        card.classList.add('character-card');
        card.setAttribute('data-id', story.id);

        card.innerHTML = `
            <h3>${story.character}</h3>
            <p>Helyszín: ${story.location}</p>
        `;

        card.addEventListener('click', () => selectCharacter(story.id));
        characterSelection.appendChild(card);
    }
}

// ======================
// Handle Character Selection
// ======================
function selectCharacter(id) {
    const selectedStory = stories.find(story => story.id === id);
    if (selectedStory) {
        currentStory = selectedStory;
        characterSelectionScreen.classList.remove('active');
        sceneDisplayScreen.classList.add('active');
        displayScene(currentStory);
    }
}

// ======================
// Display Current Scene
// ======================
function displayScene(story) {
    sceneDisplay.innerHTML = '';

    const place = places[story.location] || {};

    // Create scene container
    const sceneContainer = document.createElement('div');
    sceneContainer.classList.add('scene', 'active');

    // Set background image if available
    if (place.image) {
        sceneContainer.style.backgroundImage = `url('${place.image}')`;
    } else {
        sceneContainer.style.backgroundColor = '#1a1a1a'; // Fallback color
    }

    sceneContainer.innerHTML = `
        <h1>${story.character} a ${story.location}-ból/ből</h1>
        <p>${story.dialogue}</p>
    `;

    sceneDisplay.appendChild(sceneContainer);

    // Create choice buttons
    story.choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('button');
        button.textContent = choice.text;
        button.addEventListener('click', () => handleChoice(choice));
        sceneContainer.appendChild(button);
    });

    // Optional: Display place description
    if (place.description) {
        const description = document.createElement('p');
        description.classList.add('scene-description');
        description.textContent = place.description;
        sceneContainer.appendChild(description);
    }
}
// ======================
// Handle Player Choice
// ======================
function handleChoice(choice) {
    // Display Dialogue Box with Outcomes
    dialogueBox.style.display = 'block';
    dialogueText.textContent = 'Választásod: ' + choice.text;

    // Clear previous choices
    choicesContainer.innerHTML = '';

    if (choice.outcomes.length > 0) {
        choice.outcomes.forEach(outcome => {
            const outcomeItem = document.createElement('div');
            outcomeItem.textContent = `• ${outcome}`;
            choicesContainer.appendChild(outcomeItem);
        });
    } else {
        // Handle cases where there are no outcomes (e.g., player declined)
        const outcomeItem = document.createElement('div');
        outcomeItem.textContent = 'Nem történt változás.';
        choicesContainer.appendChild(outcomeItem);
    }

    // Check if there's a next scene
    if (choice.next) {
        historyStack.push(currentStory);

        // Find the next story by id
        const nextStory = stories.find(story => story.id === choice.next);
        if (nextStory) {
            currentStory = nextStory;
        }
    } else {
        // Indicate that the current story branch has ended
        currentStoryIndex++; // Move to the next character in the sequence
        currentStory = null; // Clear the current story
    }
}

// ======================
// Close Dialogue Box
// ======================
closeDialogueButton.addEventListener('click', () => {
    dialogueBox.style.display = 'none';

    // If there's a next story, display it
    if (currentStory) {
        displayScene(currentStory);
    } else {
        // Check if there are more characters to visit in the sequence
        if (currentStoryIndex < storySequence.length) {
// Updated alert message
alert(`Most menj és keresd meg: ${stories.find(story => story.id === storySequence[currentStoryIndex]).character}!\nValszeg itt van: ${places[stories.find(story => story.id === storySequence[currentStoryIndex]).location]?.name || 'Ismeretlen helyen'}`);
            characterSelectionScreen.classList.add('active');
            sceneDisplayScreen.classList.remove('active');
            displayNextCharacter();
        } else {
            // All stories completed
            alert("Gratulálok! Végigvitted az összes történetet!");
            startScreen.classList.add('active'); // Show start screen again for replay
            sceneDisplayScreen.classList.remove('active');
        }
    }
});


// ======================
// Start the Game
// ======================
initGame();
