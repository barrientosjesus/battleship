/*----- Classes -----*/
class Faction {
    constructor(name, colors, ships) {
        this.name = name;
        this.colors = colors;
        this.ships = ships;
    }

    placeShipsOnBoard(board) {
        this.ships.forEach(ship => {
            this.placeShip(ship, board);
        });
    }

    placeShip(ship, board) {
        const rows = board.length;
        const cols = board[0].length;
        let placementIsValid = false;

        while (!placementIsValid) {
            const startRow = Math.floor(Math.random() * (rows - ship.hp + 1));
            const startCol = Math.floor(Math.random() * (cols - ship.hp + 1));
            const isVertical = Math.random() < 0.5;

            let canPlace = true;

            if (isVertical) {
                for (let i = 0; i < ship.hp; i++) {
                    if (
                        startRow + i >= rows ||
                        board[startRow + i][startCol] !== 0
                    ) {
                        canPlace = false;
                        break;
                    }
                }
            } else {
                for (let i = 0; i < ship.hp; i++) {
                    if (
                        startCol + i >= cols ||
                        board[startRow][startCol + i] !== 0
                    ) {
                        canPlace = false;
                        break;
                    }
                }
            }

            if (canPlace) {
                if (isVertical) {
                    for (let i = 0; i < ship.hp; i++) {
                        board[startRow + i][startCol] = ship.name;
                    }
                } else {
                    for (let i = 0; i < ship.hp; i++) {
                        board[startRow][startCol + i] = ship.name;
                    }
                }
                placementIsValid = true;
            }
        }
    }
}

class Ship {
    constructor(name, img, hp) {
        this.name = name;
        this.img = img;
        this.hp = hp;
        this.damageTaken = 0;
    }
}

/*----- constants -----*/
const LOOKUP = {
    galacticEmpire: new Faction(
        "Galactic Empire",
        {
            hit: 'rgba(184, 60, 65, 0.8)',
            miss: 'rgba(255, 255, 255, 0.7)',
        },
        [
            new Ship(
                'Bellator Dreadnaught',
                'assets/images/galactic_empire/bellatorDreadnaught.png',
                3
            ),
            new Ship(
                'CR 90',
                'assets/images/galactic_empire/cr90.png',
                3
            ),
            new Ship(
                'Imperial Freighter',
                'assets/images/galactic_empire/imperialFreighter.png',
                3
            ),
            new Ship(
                'Dreadnaught Cruiser',
                'assets/images/galactic_empire/dreadnaughtCruiser.png',
                6
            ),
            new Ship(
                'Tie Fighter',
                'assets/images/galactic_empire/tieFighter.png',
                1
            )
        ]),
    rebelAlliance: new Faction(
        "Rebel Alliance",
        {
            hit: 'rgba(32, 80, 131, 0.8)',
            miss: 'rgba(255, 255, 255, 0.7)',
        },
        [
            new Ship(
                'X Wing',
                'assets/images/rebel_alliance/xWing.png',
                1
            ),
            new Ship(
                'Y Wing',
                'assets/images/rebel_alliance/yWing.png',
                2
            ),
            new Ship(
                'B Wing',
                'assets/images/rebel_alliance/bWing.png',
                2
            ),
            new Ship(
                'H6 Bomber',
                'assets/images/rebel_alliance/h6Bomber.png',
                2
            ),
            new Ship(
                'GR Transport',
                'assets/images/rebel_alliance/grTransport.png',
                3
            ),
            new Ship(
                'Hammerhead Corvette',
                'assets/images/rebel_alliance/hammerheadCorvette.png',
                4
            ),
            new Ship(
                'A Wing',
                'assets/images/rebel_alliance/aWing.png',
                1
            )
        ]
    ),
    special: new Faction(
        "Deathstar",
        {
            hit: 'rgba(184, 60, 65, 0.8)',
            miss: 'rgba(255, 255, 255, 0.7)',
        },
        [
            new Ship(
                'Deathstar',
                'assets/images/galactic_empire/deathstar.png',
                100,
                0
            )
        ]
    )
};

const LOOKUP_STYLES = {
    GRID: 'grid',
    NONE: 'none',
    FLEX: 'flex',
    ABS: 'absolute',
    TRANS: 'transparent',
    PREPGRID: '2 / 3',
    GAMEGRID: '3 / 4',
    DEG0: '0deg',
    DEG90: '90deg'
};

const HIT = 'hit';
const MISS = 'miss';
const PLAYER = 'Player';
const COMPUTER = 'Computer';

const DIRECTIONS = [
    [0, -1],
    [0, 1],
    [1, 0],
    [-1, 0],
];

const AUDIO = new Audio(
    'https://github.com/ChueyB/battleship/blob/main/assets/sounds/dueloffates.mp3?raw=true'
);

/*----- state variables -----*/
let game;
let winner;
let loser;
let score;
let faction;
let enemyFaction;
let playerBoard;
let computerBoard;
let dragged;
let rotated;
let turn;
let computerTurnLog;

/*----- cached elements  -----*/
const modal = document.getElementById('modal');
const endGameModal = document.getElementById('endgame-modal');
const message = document.getElementById('message');
const playerCells = [...document.querySelectorAll('#player-board > div')];
const computerCells = [...document.querySelectorAll('#computer-board > div')];
const shipDockIMGEls = document.querySelector('#all-ships');
const shipDock = document.getElementById('ship-dock');
const scoresEl = document.getElementById('scores');
const instructions = document.getElementById('instructions-container');
const playerBoardEl = document.querySelector('#player-board');
const computerBoardEl = document.querySelector('#computer-board');
const shipName = document.getElementById('ship-name');
const playBtn = document.getElementById('play-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again');
const titleSection = document.getElementById('title');
const crawlTitle = document.getElementById('crawl-title');
const loserName = [...document.querySelectorAll('.losing-faction-name')];
const winnerName = [...document.querySelectorAll('.winning-faction-name')];
const losingShipCount = [...document.querySelectorAll('.losing-faction-ships')];
const crawlParagraph = document.getElementById('crawl-paragraph');

/*----- event listeners -----*/
playBtn.addEventListener('click', handlePlay);
restartBtn.addEventListener('click', handleRestartGame);
playAgainBtn.addEventListener('click', handleRestartGame);
document.querySelector('.modal-content').addEventListener('click', handleFactionChoice);
document.getElementById('rotate-ship').addEventListener('click', handleButtonRotate);
document.getElementById('reset-placement').addEventListener('click', handleResetPlacement);
shipDockIMGEls.addEventListener('dragstart', handleDragStart);
playerBoardEl.addEventListener('dragover', handleDragOver);
playerBoardEl.addEventListener('drop', handleDrop);
playerBoardEl.addEventListener('dragleave', handleDragLeave);
computerBoardEl.addEventListener('click', handleClickingEnemyBoard);

/*----- functions -----*/
init();

function init() {
    faction = null;
    enemyFaction = null;
    winner = null;
    loser = null;
    score = [0, 0];
    game = 0;
    dragged = null;
    rotated = false;
    computerTurnLog = [[0, 0, 0]];
    playerBoard = [];
    computerBoard = [];
    turn = PLAYER;

    render();
}

function render() {
    renderButtons();
    renderModal();
    renderComputerBoard();
    renderPlayerBoard();
    renderMessage();
    handleResetPlacement();
    renderShipDock();
}

function renderComputerBoard() {
    computerBoard = createBoards(10, 10);
}

function renderPlayerBoard() {
    playerBoard = createBoards(10, 10);
    playerBoardEl.style.gridColumn = LOOKUP_STYLES.PREPGRID;
}

function playMusic() {
    AUDIO.volume = 0.05;
    AUDIO.loop = true;
    AUDIO.play();
}

function stopMusic() {
    AUDIO.pause();
    AUDIO.currentTime = 0;
}

function createBoards(rows, cols) {
    return new Array(rows).fill(0).map(() => new Array(cols).fill(0));
}

function handlePlay() {
    if (shipDockIMGEls.childElementCount >= 1) return;

    computerBoardEl.style.display = LOOKUP_STYLES.GRID;
    shipDock.style.display = LOOKUP_STYLES.NONE;
    instructions.style.display = LOOKUP_STYLES.NONE;
    playerBoardEl.style.gridColumn = LOOKUP_STYLES.GAMEGRID;

    game = 2;
    updateScores();
    renderButtons();
    playMusic();
}

function handleRestartGame() {
    computerBoardEl.style.display = LOOKUP_STYLES.NONE;
    shipDock.style.display = LOOKUP_STYLES.GRID;
    instructions.style.display = LOOKUP_STYLES.FLEX;
    playerBoardEl.style.gridColumn = '2 / 3';
    scoresEl.style.display = LOOKUP_STYLES.NONE;
    endGameModal.style.display = LOOKUP_STYLES.NONE;

    game = 0;
    computerTurnLog.length = 0;
    resetDamageTaken();
    stopMusic();
    init();
}

function renderButtons() {
    if (!game) {
        playBtn.style.display = LOOKUP_STYLES.NONE;
        restartBtn.style.display = LOOKUP_STYLES.NONE;
    } else if (game === 2) {
        playBtn.style.display = LOOKUP_STYLES.NONE;
        restartBtn.style.display = LOOKUP_STYLES.GRID;
    } else {
        playBtn.style.display = LOOKUP_STYLES.GRID;
        restartBtn.style.display = LOOKUP_STYLES.NONE;
    }
}

function renderScores(totalPlayerShips, totalComputerShips) {
    scoresEl.style.display = LOOKUP_STYLES.GRID;
    scoresEl.children[0].style.backgroundColor = LOOKUP[enemyFaction].colors.hit;
    scoresEl.children[1].style.backgroundColor = LOOKUP[faction].colors.hit;

    if (game !== 0) {
        scoresEl.firstElementChild.innerText = `${score[0] || 0} / ${totalComputerShips}`;
        scoresEl.lastElementChild.innerText = `${score[1] || 0} / ${totalPlayerShips}`;
    }
}

function updateScores() {
    const playerShipsDestroyed = getDestroyedShipCount(faction);
    const totalPlayerShips = LOOKUP[faction].ships.length;
    const computerShipsDestroyed = getDestroyedShipCount(enemyFaction);
    const totalComputerShips = LOOKUP[enemyFaction].ships.length;

    score[1] = playerShipsDestroyed;
    score[0] = computerShipsDestroyed;

    renderScores(totalPlayerShips, totalComputerShips);
}

function renderModal() {
    if (game > 0) return;
    modal.style.display = LOOKUP_STYLES.FLEX;
    playerBoardEl.style.display = LOOKUP_STYLES.NONE;
    shipDockIMGEls.innerHTML = '';
}

function renderMessage(ally, hitOrMiss) {

    if (game === 1) {
        message.innerHTML = `Welcome to the <span style="color:${LOOKUP[faction].colors.hit};">${LOOKUP[faction].name}</span>`;
    } else if (game === 2) {
        message.innerHTML = `<span style="color:${LOOKUP[ally].colors.hit};">${turn}</span> ${hitOrMiss}`;
    }
}

// Handles faction choice at the start of game
function handleFactionChoice(e) {
    if (e.target.tagName !== 'IMG') return;

    faction = e.target.id;
    enemyFaction = getEnemyFaction(faction);
    enemyShipArray = LOOKUP[enemyFaction].ships;
    playerShipArray = LOOKUP[faction].ships;
    modal.style.display = LOOKUP_STYLES.NONE;
    playerBoardEl.style.display = LOOKUP_STYLES.GRID;
    titleSection.style.display = LOOKUP_STYLES.GRID;
    game = 1;
    render();
    LOOKUP[enemyFaction].placeShipsOnBoard(computerBoard);
}

// Handle board clicking
function handleClickingEnemyBoard(e) {
    if (e.target.tagName !== 'DIV' || !game || turn === COMPUTER) return;
    const [rowIdx, colIdx] = e.target.id.split('-');
    const boardCell = computerBoard[rowIdx - 1][colIdx - 1];

    if (boardCell === HIT || boardCell === MISS) return;

    if (boardCell) {
        e.target.style.backgroundColor = LOOKUP[enemyFaction].colors.hit;
        handleHits(rowIdx - 1, colIdx - 1, HIT);
    } else {
        e.target.style.backgroundColor = LOOKUP[enemyFaction].colors.miss;
        handleHits(rowIdx - 1, colIdx - 1, MISS);
    }

    checkWinner();
    nextTurn();
    setTimeout(computerTurn, 700);
}

function computerTurn() {
    if (turn === PLAYER) return;

    const [ranRow, ranCol] = getRandomPosition();
    const arrayEl = playerBoard[ranRow][ranCol];

    if (computerTurnLog.some(arr => arr[2] === HIT)) {
        const [lastRow, lastCol, _] = getLastHit();
        handleGuessNextCell(lastRow, lastCol);
    } else if (arrayEl === 0) {
        handleHits(ranRow, ranCol, MISS);
        computerTurnLog.pop();
    } else if ((
        typeof arrayEl === 'string'
        || arrayEl instanceof String)
        && arrayEl !== MISS
        && arrayEl !== HIT
    ) {
        handleHits(ranRow, ranCol, HIT);
    } else {
        return computerTurn();
    }
    if (turn === COMPUTER) return nextTurn();
    checkWinner();
}

function handleGuessNextCell(rowIdx, colIdx) {
    const [rowOffset, colOffset] = randomDirec();
    const newRow = rowIdx + rowOffset;
    const newCol = colIdx + colOffset;
    const storeScore = [...score];
    const lastHit = getLastHit();

    if (isValidPosition(newRow, newCol)) {
        if (!playerBoard[newRow][newCol]) {
            handleHits(newRow, newCol, MISS);
        } else if (checkIfSurrounded(lastHit[0], lastHit[1]) && score[1] === score[1]) {
            computerTurnLog.splice(2);
            handleGuessNextCell(lastHit[0], lastHit[1]);
        } else if (playerBoard[newRow][newCol] !== HIT && playerBoard[newRow][newCol] !== MISS) {
            handleHits(newRow, newCol, HIT);
            if (score[1] > storeScore[1]) {
                computerTurnLog.splice(1);
            } else {
                clearLastMisses();
            }
        } else if (playerBoard[newRow][newCol] === HIT || playerBoard[newRow][newCol] === MISS) {
            if (checkIfSurrounded(lastHit[0], lastHit[1])) {
                computerTurnLog.splice(2);
                handleGuessNextCell(lastHit[0], lastHit[1]);
            }
            handleGuessNextCell(lastHit[0], lastHit[1]);
        }
    } else {
        handleGuessNextCell(rowIdx, colIdx);
    }
    checkWinner();
}

function handleHits(rowIdx, colIdx, hitOrMiss) {
    const nameOfShip = turn === PLAYER
        ? computerBoard[rowIdx][colIdx]
        : playerBoard[rowIdx][colIdx];
    const currentEnemyFaction = turn === PLAYER ? enemyFaction : faction;
    const currentCells = turn === PLAYER ? computerCells : playerCells;
    const currentEnemyShip = LOOKUP[currentEnemyFaction].ships.find(
        (ship) => ship.name === nameOfShip
    );

    const cellEl = currentCells.find(
        (cell) => cell.id === `${rowIdx + 1}-${colIdx + 1}`
    );

    if (turn === PLAYER) {
        computerBoard[rowIdx][colIdx] = hitOrMiss;
        renderMessage(faction, hitOrMiss);
        cellEl.style.backgroundColor = LOOKUP[enemyFaction].colors[hitOrMiss];
    } else {
        computerTurnLog.push([rowIdx, colIdx, hitOrMiss]);
        if (computerTurnLog.filter(arr => arr.includes(MISS)).length >= 4) {
            computerTurnLog.splice(1);
        }
        playerBoard[rowIdx][colIdx] = hitOrMiss;
        renderMessage(enemyFaction, hitOrMiss);
        cellEl.style.backgroundColor = LOOKUP[faction].colors[hitOrMiss];
    }

    if (!nameOfShip) return;
    currentEnemyShip.damageTaken += 1;
    updateScores();
}

// handles all pre-game ship functions
function renderShipDock() {
    if (!faction || game === 0) return;

    shipDock.style.display = LOOKUP_STYLES.GRID;
    let count = playerCells.filter(
        (cell) => cell.childElementCount >= 1
    ).length;

    renderShipName(LOOKUP[faction].ships[count]);

    if (
        (faction === 'galacticEmpire' && count > 4) ||
        (faction === 'rebelAlliance' && count > 6)
    ) {
        return;
    }

    renderShipImage(count);
}

function renderShipImage(shipCount) {
    const newIMG = document.createElement('img');
    newIMG.classList.add('ship-image');
    newIMG.id = `${faction}-${Math.abs(shipCount)}-${LOOKUP[faction].ships[shipCount].name
        }`;
    newIMG.src = LOOKUP[faction].ships[shipCount].img;
    shipDockIMGEls.appendChild(newIMG);
}

function handleButtonRotate() {
    if (shipDockIMGEls.firstElementChild.style.rotate === LOOKUP_STYLES.DEG0) {
        shipDockIMGEls.firstElementChild.style.rotate = LOOKUP_STYLES.DEG90;
        rotated = true;
    } else {
        shipDockIMGEls.firstElementChild.style.rotate = LOOKUP_STYLES.DEG0;
        rotated = false;
    }
}

function handleResetPlacement() {
    if (game === 0) return;
    playerCells.forEach(function (cell) {
        cell.innerHTML = '';
        cell.style.backgroundColor = LOOKUP_STYLES.TRANS;
    });
    computerCells.forEach(function (cell) {
        cell.innerHTML = '';
        cell.style.backgroundColor = LOOKUP_STYLES.TRANS;
    });
    shipDockIMGEls.innerHTML = '';
    rotated = false;
}

// All endgame functions
function checkWinner() {
    const playerShipsDestroyed = getDestroyedShipCount(faction);
    const computerShipsDestroyed = getDestroyedShipCount(enemyFaction);
    let loserShipCount;
    if (playerShipsDestroyed === LOOKUP[faction].ships.length) {
        [winner, loser] = [LOOKUP[enemyFaction].name, LOOKUP[faction].name];
        loserShipCount = playerShipsDestroyed;
    } else if (computerShipsDestroyed === LOOKUP[enemyFaction].ships.length) {
        [winner, loser] = [LOOKUP[faction].name, LOOKUP[enemyFaction].name];
        loserShipCount = computerShipsDestroyed;
    }
    if (winner) {
        endGame([winner, loser, loserShipCount]);
    }
}

function endGame(arr) {
    computerBoardEl.style.display = LOOKUP_STYLES.NONE;
    shipDock.style.display = LOOKUP_STYLES.NONE;
    instructions.style.display = LOOKUP_STYLES.NONE;
    scoresEl.style.display = LOOKUP_STYLES.NONE;
    modal.style.display = LOOKUP_STYLES.NONE;
    playerBoardEl.style.display = LOOKUP_STYLES.NONE;
    shipDockIMGEls.innerHTML = '';
    titleSection.style.display = LOOKUP_STYLES.NONE;

    game = 0;
    resetDamageTaken();
    renderButtons();
    stopMusic();
    renderEndGameModal(arr);
}

function renderEndGameModal(arr) {
    const [winName, loseName, loserShipCount] = arr;
    let computerAttempts = 0;
    let playerAttempts = 0;
    playerBoard.forEach(row => {
        computerAttempts += row.filter(elVal => elVal !== 0).length;
    });
    computerBoard.forEach(row => {
        playerAttempts += row.filter(elVal => elVal !== 0).length;
    });
    const winAttempts = winName === LOOKUP[faction].name ? playerAttempts : computerAttempts;
    crawlTitle.innerText = `${winName} Wins`;
    winnerName.forEach(el => {
        el.innerText = winName;
    });
    loserName.forEach(el => {
        el.innerText = loseName;
    });
    losingShipCount[0].innerText = loserShipCount;
    crawlParagraph.innerText = `While the ${winName} might have been victorious this time, it still took them ${winAttempts} attempts to destroy the ${loseName}'s Fleet.`;
    endGameModal.style.display = LOOKUP_STYLES.FLEX;
}

// Properly place the image into the grid
function imageIntoGrid(e) {
    const { matchingCells } = getShipHoverLength(e);
    const [factionName, shipID, shipName] = dragged.id.split('-');
    const shipHealth = LOOKUP[factionName].ships[shipID].hp;

    const [getRow, getCol] = matchingCells[0].id.split('-');
    const cellWidth = matchingCells[0].clientWidth;
    const cellHeight = matchingCells[0].clientHeight;
    const imgWidth = cellWidth * shipHealth;
    const imgHeight = cellHeight;

    dragged.style.position = LOOKUP_STYLES.ABS;
    dragged.style.width = `${imgWidth}px`;
    dragged.style.height = `${imgHeight}px`;
    if (rotated) {
        dragged.style.transformOrigin = 'bottom left';
        dragged.style.top = `${getRow - 2}0%`;
    }
}

function getShipHoverLength(e) {
    const divEls = e.target.id.split('-');
    const [factionName, shipID, shipName] = dragged.id.split('-');
    const hp = LOOKUP[factionName].ships[shipID].hp;
    const row = parseInt(divEls[0]);
    const col = parseInt(divEls[1]);
    const parentAndIndex = [];

    const matchingCells = playerCells.filter((cell) => {
        const splitArray = cell.id.split('-');
        const rowStart = parseInt(splitArray[0]);
        const colStart = parseInt(splitArray[1]);
        if (!rotated) {
            if (rowStart === row && colStart < col + hp && colStart >= col) {
                parentAndIndex.push({
                    parent: cell.parentElement,
                    index: Array.from(cell.parentElement.children).indexOf(
                        cell
                    ),
                });
                return true;
            }
        } else {
            if (colStart === col && rowStart >= row && rowStart < row + hp) {
                parentAndIndex.push({
                    parent: cell.parentElement,
                    index: Array.from(cell.parentElement.children).indexOf(
                        cell
                    ),
                });
                return true;
            }
        }
    });

    return {
        matchingCells,
        parentAndIndex,
        shipName,
    };
}

function cellColorOnHover(e) {
    const { parentAndIndex } = getShipHoverLength(e);
    const backgroundColor =
        e.type === 'dragleave' || e.type === 'drop'
            ? LOOKUP_STYLES.TRANS
            : LOOKUP[faction].colors.hit;
    parentAndIndex.forEach((cell) => {
        const hoveredCells = playerCells[cell.index];
        hoveredCells.style.backgroundColor = backgroundColor;
    });
    return parentAndIndex.length;
}

function getShipLength(e) {
    const [chosenFaction, shipIdx] = e.id.split('-');
    return LOOKUP[chosenFaction].ships[`${shipIdx}`].hp;
}

function handleArrayPlacement(obj) {
    const { matchingCells, shipName } = obj;
    matchingCells.forEach((cell) => {
        const [row, col] = cell.id.split('-');
        playerBoard[row - 1][col - 1] = shipName;
    });
}

// Handles the drag and drop functionality of the Ship Dock
function handleDragStart(e) {
    dragged = e.target;
}

function handleDragOver(e) {
    e.preventDefault();
    if (e.target.tagName !== 'DIV') return;
    cellColorOnHover(e);
}

function handleDragLeave(e) {
    e.preventDefault();
    cellColorOnHover(e);
}

function handleDrop(e) {
    e.preventDefault();
    if (cancelDrop(e)) return;

    if (e.target.tagName === 'DIV') {
        dragged.parentNode.removeChild(dragged);
        e.target.appendChild(dragged);
    }

    if (shipDockIMGEls.childElementCount >= 1) return;
    imageIntoGrid(e);
    handleArrayPlacement(getShipHoverLength(e));
    renderShipDock();
    dragged = null;
    rotated = false;
}

function cancelDrop(e) {
    if (cellColorOnHover(e) < getShipLength(dragged)) {
        return true;
    }
    const { matchingCells } = getShipHoverLength(e);
    return matchingCells.some((cell) => {
        const [row, col] = cell.id.split('-');
        return playerBoard[row - 1][col - 1] === 1;
    });
}

// Small helper functions

function renderShipName(ship) {
    shipName.innerText = ship ? ship.name : '';
}

function clearLastMisses() {
    for (let i = computerTurnLog.length - 1; i >= 0; i--) {
        if (computerTurnLog[i][2] === MISS) {
            computerTurnLog.splice(i, 1);
        }
    }
}

function getLastHit() {
    return computerTurnLog.reduceRight((result, currentArray) => {
        if (!result && currentArray.includes(HIT)) {
            return currentArray;
        }
        return result;
    }, null);
}

function isValidPosition(row, col) {
    return row >= 0 && row < 10 && col >= 0 && col < 10;
}

function randomDirec() {
    const randomIndex = Math.floor(Math.random() * DIRECTIONS.length);
    return DIRECTIONS[randomIndex];
}

function getRandomPosition() {
    return [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
}

function nextTurn() {
    turn = turn === PLAYER ? COMPUTER : PLAYER;
}

function getEnemyFaction(ally) {
    const enemyFaction = Object.keys(LOOKUP).filter(
        (key) => key !== 'special' && key !== ally
    );

    return enemyFaction;
}

function getDestroyedShipCount(factionVar) {
    return LOOKUP[factionVar].ships.filter((ship) => ship.damageTaken === ship.hp).length;
}

function checkIfSurrounded(rowIdx, colIdx) {
    return DIRECTIONS.every(arr => {
        if (!isValidPosition(rowIdx + arr[0], colIdx + arr[1])) return true;
        const el = playerBoard[rowIdx + arr[0]][colIdx + arr[1]];
        return el === HIT || el === MISS;
    });
}

function resetDamageTaken() {
    if (game > 0) return;
    [LOOKUP[faction].ships, LOOKUP[enemyFaction].ships].forEach(shipsArray => {
        shipsArray.forEach(ship => {
            ship.damageTaken = 0;
        });
    });
}