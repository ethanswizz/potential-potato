const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
];

const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#0000f0', '#00f000', '#f00000'];

let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let currentPiece = null;
let currentPieceX = 0;
let currentPieceY = 0;
let currentPieceColor = '';
let score = 0;
let level = 1;
let gameLoop = null;
let gameOver = false;

function createPiece() {
    const index = Math.floor(Math.random() * SHAPES.length);
    currentPiece = SHAPES[index];
    currentPieceColor = COLORS[index];
    currentPieceX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece[0].length / 2);
    currentPieceY = 0;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = COLORS[value - 1];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });
    
    // Draw current piece
    if (currentPiece) {
        ctx.fillStyle = currentPieceColor;
        currentPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillRect(
                        (currentPieceX + x) * BLOCK_SIZE,
                        (currentPieceY + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }
}

function collision() {
    return currentPiece.some((row, y) => {
        return row.some((value, x) => {
            if (!value) return false;
            const newX = currentPieceX + x;
            const newY = currentPieceY + y;
            return newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || board[newY][newX];
        });
    });
}

function merge() {
    currentPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[currentPieceY + y][currentPieceX + x] = COLORS.indexOf(currentPieceColor) + 1;
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        scoreElement.textContent = `Score: ${score}`;
        if (score >= level * 1000) {
            level++;
            levelElement.textContent = `Level: ${level}`;
        }
    }
}

function moveDown() {
    currentPieceY++;
    if (collision()) {
        currentPieceY--;
        merge();
        clearLines();
        createPiece();
        if (collision()) {
            gameOver = true;
            alert('Game Over!');
            resetGame();
        }
    }
}

function moveLeft() {
    currentPieceX--;
    if (collision()) {
        currentPieceX++;
    }
}

function moveRight() {
    currentPieceX++;
    if (collision()) {
        currentPieceX--;
    }
}

function rotate() {
    const rotated = currentPiece[0].map((_, i) =>
        currentPiece.map(row => row[row.length - 1 - i])
    );
    const previousPiece = currentPiece;
    currentPiece = rotated;
    if (collision()) {
        currentPiece = previousPiece;
    }
}

function resetGame() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    level = 1;
    scoreElement.textContent = `Score: ${score}`;
    levelElement.textContent = `Level: ${level}`;
    gameOver = false;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = null;
}

function startGame() {
    if (gameLoop) return;
    resetGame();
    createPiece();
    gameLoop = setInterval(() => {
        moveDown();
        draw();
    }, 1000 / level);
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowUp':
            rotate();
            break;
    }
    draw();
});

startBtn.addEventListener('click', startGame);
draw();
