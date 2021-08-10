
// Get the element to build the game at
const container = document.querySelector('#connectFour');

// This variable tracks whether or not the user is allowed to play their move
var allowClick = false;

// Checks if the game has ended
var gameEnd = false;

// Board used to store the color data 
// Note that the board is not directly representative of the graphic displayed on the website
// Each 'subarray' represents a WHOLE column. E.g. board[0] is the array that represents the
// LEFT-MOST column on the browser.

// Essentially, if you rotate this board below by 90 degrees counter-clockwise, you get the board
// that is displayed on the browser.
var board = [[0,0,0,0,0,0,0], // first column
			 [0,0,0,0,0,0,0], // second column
			 [0,0,0,0,0,0,0], // third column
			 [0,0,0,0,0,0,0], // fourth column
			 [0,0,0,0,0,0,0], // ...
			 [0,0,0,0,0,0,0], // ...
			 [0,0,0,0,0,0,0]] // ...

// This function is run to set up the HTML in the game
function setUpGame() {

	// Clear the inner HTML to prevent any errors
	for (let i = 0; i < 7; i++) {

		var tempStr = "<div class='d-flex'>";
		for (let j = 0; j < 7; j++) {

			tempStr += `<div class='gameCell position-${j}-${i}'>`
			tempStr += `</div>`;
		}
		tempStr += "</div>";

		// Building the HTML with a string is needed. This is because if we construct the HTML without using
		// this tempStr, what happens is any unclosed HTML tag will get closed off automatically.
		// E.g., if we try to

			// container.innerHTML += <div class='d-flex'>

		// This tag is immediately closed off with </div>, not allowing us to put the gameCell div inside it.
		container.innerHTML += tempStr;
	}

	// Allow user to move once setup is finished
	allowClick = true;
}

// This is used to refresh the board on the browser.
// This is done by running through every cell in the board variable,
// and changing the gameCell div's color according to the number specified

// There is one parameter that can be specified -- win. This determines whether or not the board
// is being refreshed under the circumstance that there is a winner. 
// If this is true, it tells us we need all the colors to be darker, except for the 4 positions
// that belong to the winning positions
function boardRefresh(win = false) {
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 7; j++) {

			// Target the respective HTML cell, given the position of the board
			// NOTE again, 7-1-j is used to adjust the board to make it correct.
			// Without this, the browser board and JavaScript board is NOT the same
			var change = document.querySelector(`.position-${i}-${7-1-j}`);

			// If this refresh will be the winning refresh, dim everything that has a value of 1 or 2.
			// The 'winning' positions(i.e. the positions with the value '3' in the board) will NOT
			// be affected by this
			if (win) {

				// Darken every other coin that is not the winning positions
				if (board[i][j] == 1) {
					change.style.backgroundColor = 'rgb(160, 100, 0)';
				} else if (board[i][j] == 2) {
					change.style.backgroundColor = 'rgb(100, 1, 0)';
				}
			} else {

				// Change the position to the correct color.
				if (board[i][j] == 1) {
					change.style.backgroundColor = 'rgb(255,193,7)';
				} else if (board[i][j] == 2) {
					change.style.backgroundColor = 'rgb(214, 1, 0)';
				}
			}
		}
	}
}

// This is used to determine if there is a winner. If so, correctly display the winner and shut
// the game off
function checkStateGame() {

	if (!gameEnd) {

		// Iterate through all the possible cells, using i,j as coordinates
		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 7; j++) {

				// The xDirection loop and yDirection loop determines the direction. 
				// You can think of them as vectors, representing which way to check 
				for (let xDirection = -1; xDirection < 2; xDirection++) {
					for (let yDirection = -1; yDirection < 2; yDirection++) {

						// The case of 0,0 is ignored as it is useless and will give false positive
						// of "Four in a row"
						if (xDirection == 0 && yDirection == 0) continue;

						var fourInARow = true;
						
						// This array will keep track of which are the four coordinates that makes
						// the winner win.
						var positions = new Array();

						// Push the current coordinate we want to check as a possible coordinate
						positions.push([i, j]);

						// This magnitude for loop deterimes how 'far' we want to check, relative from
						// the original i,j position
						for (let magnitude = 1; magnitude < 4; magnitude++) {
							
							// The checking coordinates are determined by multiplying the magnitude
							// with the direction
							let checkXPosition = Number(i) + Number(xDirection * magnitude);
							let checkYPosition = Number(j) + Number(yDirection * magnitude);
							
							// If this direction cannot no longer be checked(as it extends out of bounds),
							// break out of this magnitude for loop. This will move onto the next direction.
							if (checkXPosition < 0 || checkXPosition >= 7 || checkYPosition < 0 || checkYPosition >= 7) {
								fourInARow = false;
								break;
							} else {

								// If the checking coordinates are not out of bounds, push it onto the possible
								// coordinates
								positions.push([checkXPosition, checkYPosition]);

								// This statement below makes it such that if ONE of the checks is false(i.e.
								// it is NOT four in a row), fourInARow immediately becomes false and cannot
								// go back to true.
								fourInARow = fourInARow && (board[i][j] == board[checkXPosition][checkYPosition] && board[i][j] != 0);
							}
						}

						// If this current path we are checking IS fourInARow,
						if (fourInARow) {

							gameEnd = true;

							// Identify the four winning positions by increasing them by 2
							for (let z = 0; z < positions.length; z++) {
								board[Number(positions[z][0])][Number(positions[z][1])] = 3;
							}

							boardRefresh(true);
							return;
						}
					}
				}
			}
		}
	}
}

// This function will drop a coin into the board,
// the column number and player has to be specified
function dropColumn(columnNo, player) {

	// If the user is allowd to click or if it is the bot that is playing
	if (allowClick == true || player == 2) {

		var column = board[columnNo];
		var rowNo = 0;

		// This checks whether or not it is possible to drop a coin into this area
		if (column[column.length - 1] == 0) {

			// Once we have CONFIRMED that it is possible to drop a coin, remove
			// the user's ability to make a move.
			// Even if this is set to false on the bot's turn, it does not matter. It will be set
			// to true again when the bot completely finishes making their move
			allowClick = false;

			// Go through the rows of that possible column and find the first available row, searching
			// bottom to top.
			for (let i = 0; i < 7; i++) {

				// Once we have found it, update the board and break
				if (column[i] == 0) {
					column[i] = player;
					rowNo = i;
					break;
				}
			}
		}

		// Refresh the board
		boardRefresh();

		// Check if there is a winner
		checkStateGame(columnNo, rowNo);
	}
}

// This is used to move the bot
function botTurn() {

	if (!gameEnd) {

		// This variable will track all possible columns the bot can drop their coin into
		var possibleColumns = new Array();

		// Go through all columns
		for (let i = 0; i < 7; i++) {

			// If the top row is empty, this means that it is possible to drop the coin into the
			// column
			if (board[i][6] == 0) {
				possibleColumns.push(i);
			}
		}

		// If there are any possible columns to drop into,
		if (possibleColumns.length != 0) {

			// Pick a random column
			var randomColumn = possibleColumns[Math.floor(Math.random() * possibleColumns.length)];

			dropColumn(randomColumn, 2);

			allowClick = true;
		}
	}
}

// Setup the game
setUpGame();

// This needs to run AFTER setting up the game. Otherwise, this array will be empty.
const cells = document.querySelectorAll('.gameCell');

// Iterate through all cells and add an event listener
for (let i = 0; i < cells.length; i++) {

	cells[i].addEventListener("click", function() {

		// If the user is allowed to click and game has not ended
		if (allowClick && !gameEnd) {

			// Get the position of the cell by reading the class
			// that starts with 'position'.
			var classes = ((cells[i].className).split(" "));
			var columnNo = 0;
			var rowNo = 0;
			for (let i = 0; i < classes.length; i++) {
				if (classes[i].split("-")[0] == "position") {

					// Set column number
					columnNo = classes[i].split("-")[1];

					// Note that the board is not directly representative of the board in the browser
					// This means a little adjustment has to be done, to make the coordinates represent
					// one another exactly
					rowNo = 7-1-Number(classes[i].split("-")[2]);
					break;
				}
			}

			// If that position the user clicked is empty, 
			if (board[columnNo][rowNo] == 0) {

				// Drop their coin into the column
				dropColumn(columnNo, 1);

				// Get the bot to make its move
				botTurn();
			}
		}

		// If the game has ended, go through all the cells and
		// change pointer to default. This indicates that the game is
		// no longer playable
		if (gameEnd) {
			for (let i = 0; i < cells.length; i++) {
				cells[i].style.cursor = 'default';
			}
		}
	});
}