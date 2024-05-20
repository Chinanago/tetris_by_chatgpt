/* script.js */
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#grid');
    const scoreDisplay = document.querySelector('#score');
    const startMessage = document.createElement('div');
    const gameOverMessage = document.createElement('div');
    const width = 10;
    let score = 0;
    let timerId;
    let isGaming = false;
    const colors = [
        'orange',
        'red',
        'purple',
        'green',
        'blue'
    ];

    // Create the grid
    for (let i = 0; i < 200; i++) {
        const div = document.createElement('div');
        grid.appendChild(div);
    }

    // Create the "taken" bottom row
    for (let i = 0; i < 10; i++) {
        const div = document.createElement('div');
        div.classList.add('taken');
        grid.appendChild(div);
    }

    // Add start message
    startMessage.id = 'startMessage';
    startMessage.innerHTML = 'Spaceを押してスタート';
    document.body.appendChild(startMessage);

    // Add game over message
    gameOverMessage.id = 'gameOverMessage';
    gameOverMessage.innerHTML = 'ゲームオーバー';
    gameOverMessage.style.display = 'none';
    document.body.appendChild(gameOverMessage);

    // The Tetrominoes
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    const zTetromino = [
        [0,width,width+1,width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0,width,width+1,width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ];

    const tTetromino = [
        [1,width,width+1,width+2],
        [1,width+1,width+2,width*2+1],
        [width,width+1,width+2,width*2+1],
        [1,width,width+1,width*2+1]
    ];

    const oTetromino = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ];

    const iTetromino = [
        [1,width+1,width*2+1,width*3+1],
        [width, width+1, width+2, width+3],
        [1,width+1,width*2+1,width*3+1],
        [width, width+1, width+2, width+3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;

    // randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    // draw the Tetromino
    function draw() {
        current.forEach(index => {
            if (grid.children[currentPosition + index]) {
                grid.children[currentPosition + index].style.backgroundColor = colors[random];
            }
        });
    }

    // undraw the Tetromino
    function undraw() {
        current.forEach(index => {
            if (grid.children[currentPosition + index]) {
                grid.children[currentPosition + index].style.backgroundColor = '';
            }
        });
    }

    // Start the game
    function startGame() {
        draw();
        timerId = setInterval(moveDown, 1000);
        startMessage.style.display = 'none';
    }

    // Start game on space key press
    function handleStartKey(e) {
        if (e.keyCode === 32) {
            document.removeEventListener('keyup', handleStartKey);
            startGame();
        }
    }
    document.addEventListener('keyup', handleStartKey);

    // assign functions to keyCodes
    function control(e) {
        if(isGaming){
            if(e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                moveDown();
            } else if (e.keyCode === 32) {
                hardDrop();
            }
        }
    }
    document.addEventListener('keyup', control);

    // move down function
    function moveDown() {
        isGaming = true;
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    // freeze function
    function freeze() {
        if(current.some(index => grid.children[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => grid.children[currentPosition + index].classList.add('taken'));
            // start a new tetromino falling
            random = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            addScore();
            gameOver();
        }
    }

    // move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if(!isAtLeftEdge) currentPosition -=1;
        if(current.some(index => grid.children[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1;
        }
        draw();
    }

    // move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if(!isAtRightEdge) currentPosition +=1;
        if(current.some(index => grid.children[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1;
        }
        draw();
    }

    ///rotate the tetromino
    function rotate() {
        undraw();
        currentRotation ++;
        if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
            currentRotation = 0;
        }
        current = theTetrominoes[random][currentRotation];
        draw();
    }

    // hard drop function
    function hardDrop() {
        undraw();
        while (!current.some(index => grid.children[currentPosition + index + width].classList.contains('taken'))) {
            currentPosition += width;
        }
        draw();
        freeze();
    }

    // add score
    function addScore() {
        for (let i = 0; i < 199; i +=width) {
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9];

            if(row.every(index => grid.children[index].classList.contains('taken'))) {
                score +=10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    grid.children[index].classList.remove('taken');
                    grid.children[index].style.backgroundColor = '';
                });
                const squaresRemoved = Array.from(grid.children).splice(i, width);
                grid.prepend(...squaresRemoved);
            }
        }
    }

    // game over
    function gameOver() {
        if(current.some(index => grid.children[currentPosition + index].classList.contains('taken'))) {
            clearInterval(timerId);
            gameOverMessage.style.display = 'block';
            isGaming = false;
        }
    }
});
