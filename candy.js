
var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
var board = [];
var rows = 9;
var columns = 9;
var score = 0;
var moveCount =0;

var currTile;
var otherTile;
var gameInterval;

window.onload = function () {
    startGame();

    gameInterval = window.setInterval(function () {
        crushCandies();
        dropCandies();
    }, 100);
    document.getElementById("play-again").addEventListener("click", function () {
        location.reload();
    });
};



function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)]
}
function startGame() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/" + randomCandy() + ".png";

            //Drag Function
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragend", dragEnd);
            tile.addEventListener("drop", drop);

            document.getElementById("board").append(tile);
            row.push(tile);

        }
        board.push(row);
    }
    console.log(board);
}
function dragStart() {
    currTile = this;
}
function dragOver(e) {
    e.preventDefault();
}
function dragEnter(e) {
    e.preventDefault();
}

function drop() {
    otherTile = this;
}
function dragEnd() {
    let currCoords = currTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = c2 == c - 1 && r == r2;
    let moveRight = c2 == c + 1 && r == r2;

    let moveUp = r2 == r - 1 && c == c2;
    let moveDown = r2 == r + 1 && c == c2;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;
    //swap
    if (isAdjacent) {
        let currSrc = currTile.src;
        let otherSrc = otherTile.src;

        // Swap
        currTile.src = otherSrc;
        otherTile.src = currSrc;

        if (!checkValid()) {
            // Revert swap
            currTile.src = currSrc;
            otherTile.src = otherSrc;
        }else {
        moveCount++;
        document.getElementById("moves").innerText = moveCount;
    }
    }
    currTile = null;
    otherTile = null;
}
function isMatch(tile1, tile2, tile3) {
    return (
        tile1.src === tile2.src &&
        tile2.src === tile3.src &&
        !tile1.src.includes("blank")
    );
}
function checkHorizontalMatch(r, c) {
    if (c <= columns - 3) {
        let tile1 = board[r][c];
        let tile2 = board[r][c + 1];
        let tile3 = board[r][c + 2];
        return isMatch(tile1, tile2, tile3);
    }
    return false;
}
function checkVerticalMatch(r, c) {
    if (r <= rows - 3) {
        let tile1 = board[r][c];
        let tile2 = board[r + 1][c];
        let tile3 = board[r + 2][c];
        return isMatch(tile1, tile2, tile3);
    }
    return false;
}


function checkValid() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (checkHorizontalMatch(r, c) || checkVerticalMatch(r, c)) {
                return true;
            }
        }
    }
    return false;
}
function findMatches(direction) {
    let matches = [];
    if (direction === "horizontal") {
        for (let r = 0; r < rows; r++) {
            let c = 0;
            while (c < columns) {
                let count = 1;
                let currentSrc = board[r][c].src;

                if (currentSrc.includes("blank")) {
                    c++;
                    continue;
                }

                while (
                    c + count < columns &&
                    board[r][c + count].src === currentSrc
                ) {
                    count++;
                }

                if (count >= 3) {
                    matches.push({ r: r, c: c, count: count, direction: "horizontal" });
                }

                c += count;
            }
        }
    } else if (direction === "vertical") {
        for (let c = 0; c < columns; c++) {
            let r = 0;
            while (r < rows) {
                let count = 1;
                let currentSrc = board[r][c].src;

                if (currentSrc.includes("blank")) {
                    r++;
                    continue;
                }

                while (
                    r + count < rows &&
                    board[r + count][c].src === currentSrc
                ) {
                    count++;
                }

                if (count >= 3) {
                    matches.push({ r: r, c: c, count: count, direction: "vertical" });
                }

                r += count;
            }
        }
    }
    return matches;
}

function crushCandies() {
    let toCrush = new Set();

    let horizontalMatches = findMatches("horizontal");
    let verticalMatches = findMatches("vertical");

    horizontalMatches.forEach(({ r, c, count }) => {
        for (let k = 0; k < count; k++) {
            toCrush.add(`${r}-${c + k}`);
        }
        if (count === 3) {
            score += 3 * 10;
        } else if (count >= 4) {
            score += count * 15;
        }
    });

    verticalMatches.forEach(({ r, c, count }) => {
        for (let k = 0; k < count; k++) {
            toCrush.add(`${r + k}-${c}`);
        }
        if (count === 3) {
            score += 3 * 10;
        } else if (count >= 4) {
            score += count * 15;
        }
    });

    if (toCrush.size > 0) {
        document.getElementById("score").innerText = score;

        for (let pos of toCrush) {
            let [r, c] = pos.split("-").map(Number);
            board[r][c].src = "./images/blank.png";
        }

        if (score >= 1000) {
            let message = document.getElementById("message");
           message.innerText = `You win! Moves: ${moveCount}`;
            message.style.display = "block";
            clearInterval(gameInterval);
        }
    }
}

function dropCandies() {
    for (let c = 0; c < columns; c++) {
        let emptySpots = 0;
        for (let r = rows - 1; r >= 0; r--) {
            let tile = board[r][c];
            if (tile.src.includes("blank")) {
                emptySpots++;
            } else if (emptySpots > 0) {
                board[r + emptySpots][c].src = tile.src;
                tile.src = "./images/blank.png";
            }
        }

        // Fill top with new candies
        for (let r = 0; r < emptySpots; r++) {
            board[r][c].src = "./images/" + randomCandy() + ".png";
        }
    }
}
