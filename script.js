var colorMap = {
	1: "rgb(10, 130, 185)",
	2: "rgb(24, 179, 44)",
	3: "rgb(255, 31, 15)",
	4: "rgb(245, 230, 30)",
	5: "rgb(199, 33, 199)",
	6: "rgb(13, 73, 236)",
	7: "rgb(241, 72, 11)",
	8: "rgb(201, 119, 25)",
};

function getRandomSubarray(arr, size) {
	let shuffled = arr.slice(0),
		i = arr.length,
		temp,
		index;
	while (i--) {
		index = Math.floor((i + 1) * Math.random());
		temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return shuffled.slice(0, size);
}

function index2rc(index, width) {
	let row = Math.floor(index / width);
	let column = index % width;
	return [row, column];
}

function toggleVision(index, new_vision) {
	let box = document.getElementById(String(index));

	if (new_vision == "hidden") {
		box.classList.remove("not-hidden");
		box.classList.add("hidden-box");
	} else {
		box.classList.remove("hidden-box");
		box.classList.add("not-hidden");
	}
}

function numberBox(index, number) {
	num_color = colorMap[number];
	document.getElementById(String(index)).innerHTML = `<div style='color: ${num_color};'>${number}</div>`;
	toggleVision(index, "not-hidden");
}

function getNeighborMines(index, height, width) {
	if (mines_indexes.includes(index)) {
		return 9;
	}

	[row, column] = index2rc(index, width);
	sum_mines = 0;
	for (let r = row - 1; r <= row + 1; r++) {
		for (let c = column - 1; c <= column + 1; c++) {
			if (r >= 0 && r < height && c >= 0 && c < width) {
				sum_mines += mines_indexes.includes(c + r * width);
			}
		}
	}

	return sum_mines ? sum_mines : "";
}

function showHiddenNeighbors(index, height, width) {
	if (flagged_boxes.includes(index)) {
		return Array();
	}

	if (getNeighborMines(Number(index), height, width)) {
		numberBox(index, getNeighborMines(Number(index), height, width));
		return Array();
	}

	let [row, column] = index2rc(index, width);
	let freeNeighbors = Array();

	for (let r = row - 1; r <= row + 1; r++) {
		for (let c = column - 1; c <= column + 1; c++) {
			if (r >= 0 && r < height && c >= 0 && c < width && !mines_indexes.includes(c + r * width)) {
				let current_index = c + r * width;
				if (flagged_boxes.includes(String(current_index))) {
					continue;
				}

				let neighborMines = getNeighborMines(current_index, height, width);

				if ((r != row || c != column) && !neighborMines) {
					freeNeighbors.push(current_index);
				}

				if (!neighborMines) {
					neighborMines = "&nbsp;";
				}

				numberBox(current_index, neighborMines);
			}
		}
	}

	return freeNeighbors;
}

function revealRequest(index) {
	if (first_choice) {
		FIndexNeighbors = Array();
		let [row, column] = index2rc(index, width);
		for (let r = row - 1; r <= row + 1; r++) {
			for (let c = column - 1; c <= column + 1; c++) {
				if (r >= 0 && r < height && c >= 0 && c < width) {
					FIndexNeighbors.push(c + r * width);
				}
			}
		}

		if (mines <= width * height - 9) {
			indexes2randomize = [...Array(width * height).keys()].filter((el) => !FIndexNeighbors.includes(el));
		} else {
			indexes2randomize = [...Array(width * height).keys()];
		}

		mines_indexes = getRandomSubarray(indexes2randomize, mines);

		first_choice = false;
	}

	let neighborMines = getNeighborMines(Number(index), height, width);

	if (flagged_boxes.includes(index) || game_done) {
		return false;
	} else if (neighborMines == 9) {
		timer_paused = true;
		document.getElementById("Icon").innerHTML = "<i class='fa fa-frown-o'></i>";

		alert("You lost!");

		mines_indexes.forEach((i) => {
			document.getElementById(i).innerHTML = "<div><i class='fa fa-bomb'></i></div>";
			toggleVision(i, "not-hidden");
		});

		document.getElementById(index).innerHTML = "<div><i style='color: red;' class='fa fa-bomb'></i></div>";

		wrong_flags = flagged_boxes.filter((el) => !mines_indexes.includes(Number(el)));
		wrong_flags.forEach((i) => {
			document.getElementById(i).innerHTML = "<div style='color: yellow;'><i class='fa fa-flag'></i></div>";
			toggleVision(i, "hidden");
		});

		right_flags = flagged_boxes.filter((el) => mines_indexes.includes(Number(el)));
		right_flags.forEach((i) => {
			document.getElementById(i).innerHTML = "<div style='color: green;'><i class='fa fa-flag'></i></div>";
			toggleVision(i, "hidden");
		});

		game_done = true;
	} else if (!neighborMines) {
		let freedNeighbors = Array();
		let freeNeighbors = showHiddenNeighbors(index, height, width);

		while (freeNeighbors.length) {
			let newFreeNeighbors = Array();

			freeNeighbors.forEach((i) => {
				if (!freedNeighbors.includes(i)) {
					newFreeNeighbors = newFreeNeighbors.concat(showHiddenNeighbors(i, height, width));
				}
			});

			freedNeighbors = freedNeighbors.concat(freeNeighbors);

			freeNeighbors = newFreeNeighbors
				.filter(function (item, pos, self) {
					return self.indexOf(item) == pos;
				})
				.slice();
		}
	} else {
		numberBox(index, neighborMines);
	}

	if ([...document.querySelectorAll(".not-hidden")].length + mines_indexes.length == height * width) {
		alert("You won!");
		timer_paused = true;
		mines_indexes.forEach((i) => {
			document.getElementById(i).innerHTML = "<div style='color: green;'><i class='fa fa-flag'></i></div>";
		});
		game_done = true;
	}
}

function showNewGamePage() {
	timer_paused = true;

	if (board_width < 800) {
		startGame();
		return false;
	}

	document.getElementById("newGamePage").style.visibility = "visible";
}

function drawTable() {
    gameBoard.style.height = `${height * cellSize}px`;
    gameBoard.style.width = `${width * cellSize + 250}px`;
    
    let boxFontSize = Math.min((board_height / height) / 2, (board_width / width) / 2.5) + 'px'
	
    let tableMarkup = "<tr><td colspan='" + width + "'><div id='status-bar'>";
	tableMarkup += "<div class='status'>Mines: <div class='status-box' id='MineCount'>" + mines + "</div></div>";
	tableMarkup += "<div id='Icon' onclick='showNewGamePage()'><i class='fa fa-smile-o'></i></div>";
	tableMarkup += "<div class='status'>Time: <div class='status-box' id='TimeCount'>0</div></div>";
	tableMarkup += "<div></td></tr>";

	for (h = 0; h < height; h++) {
		tableMarkup += "<tr>";
		for (w = 0; w < width; w++) {
			tableMarkup +=
				"<td class='hidden-box no-menu noselect' style='font-size: " + boxFontSize + ";' id='" +
				(w + h * width) +
				"' onclick='revealRequest(this.id)'>&nbsp;</td>";
		}
		tableMarkup += "</tr>";
	}

	gameBoard.innerHTML = tableMarkup;
}

function startGame() {
	document.getElementById("newGamePage").style.visibility = "hidden";

	drawTable();

	flagged_boxes = Array();
	game_done = false;
	first_choice = true;
	timer_paused = false;

	document.querySelectorAll(".no-menu").forEach((el) =>
		el.addEventListener("contextmenu", (e) => {
			e.preventDefault();

			if (game_done)
				return false;

			if (flagged_boxes.includes(e.currentTarget.id)) {
				e.currentTarget.innerHTML = "&nbsp;";
				flagged_boxes = flagged_boxes.filter((item) => item !== e.currentTarget.id);
			} else if (flagged_boxes.length == mines || e.currentTarget.classList.contains("not-hidden")) {
				return false;
			} else {
				e.currentTarget.innerHTML = "<div><i class='fa fa-flag'></i></div>";
				flagged_boxes.push(e.currentTarget.id);
			}

			document.getElementById("MineCount").innerText = mines - flagged_boxes.length;

			return false;
		})
	);
}

var gameBoard = document.getElementById("GameBoard");

var heightSlider = document.getElementById("height-slider");
var heightValue = document.getElementById("height-value");

var widthSlider = document.getElementById("width-slider");
var widthValue = document.getElementById("width-value");

var minesSlider = document.getElementById("mines-slider");
var minesValue = document.getElementById("mines-value");

var cellSize = 32;
var game_done = false;
var first_choice = true;
var mines_indexes = Array();
var flagged_boxes = Array();

var timer_paused = true;
var timer = setInterval(function () {
	let timerBox = document.getElementById("TimeCount");
	if (!timer_paused) {
		timerBox.innerText = Number(timerBox.innerText) + 1;
	}
}, 1000);

let board_height = window.innerHeight;
let board_width = window.innerWidth;

var height = Math.floor(board_height / cellSize);
var width = Math.floor(board_width / cellSize);

heightSlider.value = height;
heightValue.innerHTML = height;
widthSlider.value = width;
widthValue.innerHTML = width;

mines = Math.floor((minesSlider.value * (height * width)) / 100);
minesValue.innerHTML = minesSlider.value + "%";

function fullScreenMode(element) {
	if (element.checked) {
		height = Math.floor(board_height / cellSize);
		width = Math.floor(board_width / cellSize);
		heightSlider.value = height;
		heightValue.innerHTML = height;
		widthSlider.value = width;
		widthValue.innerHTML = width;
		gameBoard.style.width = `${width * (board_height / height)}px`;

		mines = Math.floor((minesSlider.value * (height * width)) / 100);

		heightSlider.disabled = true;
		widthSlider.disabled = true;
	} else {
		heightSlider.disabled = false;
		widthSlider.disabled = false;
	}

	drawTable();
}

heightSlider.oninput = function () {
	height = this.value;
	heightValue.innerHTML = this.value;
	// gameBoard.style.width = `${width * (board_height / height)}px`;
    gameBoard.style.height = `${height * cellSize}px`;
	mines = Math.floor((minesSlider.value * (height * width)) / 100);
	drawTable();
};

widthSlider.oninput = function () {
	width = this.value;
	widthValue.innerHTML = this.value;
	// gameBoard.style.width = `${width * (board_width / height)}px`;
	// gameBoard.style.width = `${width * (board_width / width)}px`;
    gameBoard.width = `${width * cellSize}px`;
	mines = Math.floor((minesSlider.value * (height * width)) / 100);
	drawTable();
};

minesSlider.oninput = function () {
	mines = Math.floor((this.value * (height * width)) / 100);
	minesValue.innerHTML = this.value + "%";
	drawTable();
};

startGame();
