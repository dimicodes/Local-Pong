// Canvas
const { body } = document;

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvasPosition = screenWidth / 2 - width / 2;
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverEl = document.createElement('div');
const initialStart = document.createElement('div');
let canvasColor = '#496aa3';




// Easy and hard mode selectors
let isEasyMode = false;
let isHardMode = false;




// Weather API Key
const apiKey = 'd5be7e62025127435cae7e06f7abc1a1';




// Paddle details
const paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;




// Ball details
let ballX = 250;
let ballY = 350;
let ballRadius = 5;




// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;




// Change settings if played on mobile
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 4;
}




// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 3;
let isGameOver = true;
let isNewGame = true;




// Render Everything on the Canvas
function renderCanvas() {
  // Canvas background
  context.fillStyle = canvasColor;
  context.fillRect(0, 0, width, height);

  // Paddle color
  context.fillStyle = 'white';

  // Player paddle (Bottom paddle)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

  // Computer paddle (Top paddle)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed center Line (ping pong net)
  context.beginPath();
  context.setLineDash([3]);
  context.moveTo(0, 348.5);
  context.lineTo(500, 348.5);
  context.strokeStyle = 'white';
  context.stroke();

  context.beginPath();
  context.setLineDash([3]);
  context.moveTo(0, 351.5);
  context.lineTo(500, 351.5);
  context.strokeStyle = 'white';
  context.stroke();

  // Table vertical divider line
  context.beginPath();
  context.setLineDash([0]);
  context.moveTo(250, 0);
  context.lineTo(250, 700);
  context.strokeStyle = 'white';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = '32px Courier New';
  context.fillText(playerScore, 20, canvas.height / 2 + 50);
  context.fillText(computerScore, 20, canvas.height / 2 - 30);
}




// Create canvas element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}




// Reset ball to the center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}




// Adjust ball movement
function ballMove() {
  // Vertical speed
  ballY += -speedY;
  // Horizontal speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}




// Determine what ball bounces off, score points, reset ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
      paddleContact = true;
      // Add Speed on Hit
      if (playerMoved) {
        speedY -= 1;
        // Max Speed
        if (speedY < -5) {
          speedY = -5;
          computerSpeed = 6;
        }
      }
      speedY = -speedY;
      trajectoryX = ballX - (paddleBottomX + paddleDiff);
      // if easy mode is on, ball speed is lower than other difficulty modes
      if (isEasyMode) {
        speedX = trajectoryX * 0.1;
      } else if (isHardMode) {
        speedX = trajectoryX * 0.4;
        computerSpeed = 8;
      } else {
        speedX = trajectoryX * 0.3;
      }
    } else if (ballY > height) {
      // Reset Ball, add to Computer Score
      ballReset();
      computerScore++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      speedY = -speedY;
    } else if (ballY < 0) {
      // Reset Ball, add to Player's Score
      ballReset();
      playerScore++;
    }
  }
}




// Computer Movement
function computerAI() {
  if (playerMoved) {
    if (paddleTopX + (paddleDiff * 0.3) < ballX) {
      paddleTopX += computerSpeed;
    } else if (paddleTopX - (paddleDiff * 0.3) > ballX) {
      paddleTopX -= computerSpeed;
    }
  }
}




// function to keep track of last 5 game winners in local storage
function updateGameHistory(winner) {
  // Retrieve existing game history from local storage or initialize an empty array
  const gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];

  // Add the result of the current game to the history
  gameHistory.push(winner);

  // Keep only the last 5 results
  if (gameHistory.length > 5) {
    gameHistory.shift(); // Remove the oldest result
  }

  // Store the updated game history in local storage
  localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
}




// Show game over screen with winner
function showGameOverEl(winner) {
  // Update game history in local storage
  updateGameHistory(winner);
  // Hide Canvas
  canvas.hidden = 'true';
  // Container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');
  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} wins!`;

  // Create a table to display game history
  const table = document.createElement('table');
  const tableHead = document.createElement('thead');
  const tableBody = document.createElement('tbody');
  const tableRowHeader = document.createElement('tr');
  const headerPlayer = document.createElement('th');
  headerPlayer.textContent = 'Player';
  const headerComputer = document.createElement('th');
  headerComputer.textContent = 'CPU';


  // Append table headers
  tableRowHeader.appendChild(headerPlayer);
  tableRowHeader.appendChild(headerComputer);
  tableHead.appendChild(tableRowHeader);
  table.appendChild(tableHead);

  // Retrieve game history from local storage
  const gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];

  // Iterate over the last 5 game results and add rows to the table
  for (const result of gameHistory) {
    const tableRow = document.createElement('tr');
    const cellPlayer = document.createElement('td');
    const cellComputer = document.createElement('td');
    cellPlayer.textContent = result === 'Player 1' ? 'Won' : 'Lost';
    cellComputer.textContent = result === 'The computer' ? 'Won' : 'Lost';
    tableRow.appendChild(cellPlayer);
    tableRow.appendChild(cellComputer);
    tableBody.appendChild(tableRow);
  }

  // Append table body to the table
  table.appendChild(tableBody);  
  
  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play Again';
  // Append
  gameOverEl.append(title, table, playAgainBtn);
  body.appendChild(gameOverEl);
  
}




// Initial screen on first page load
function initialStartFunc() {
  // canvas.hidden = 'true';
  initialStart.textContent = '';
  initialStart.classList.add('initial-start-container');
  // Create a container for the buttons
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  
  // Logo
  const logo = document.createElement('div');
  logo.classList.add('logo');
  
  // Button
  const initialStartBtn = document.createElement('button');
  initialStartBtn.disabled = true;
  initialStartBtn.setAttribute('onclick', 'startGame()');
  initialStartBtn.textContent = 'START';
  initialStartBtn.classList.add('start-button');

  // Difficulty Levels
  const difficultyTitle = document.createElement('div');
  difficultyTitle.textContent = 'SELECT LEVEL:';
  difficultyTitle.classList.add('h1');

  const easyBtn = document.createElement('button');
  easyBtn.setAttribute('onclick', 'easyMode()');
  easyBtn.textContent = 'Easy';
  easyBtn.classList.add('mode-button');
  easyBtn.addEventListener('click', function() {
    easyMode(); 
    changeColor(this);
    initialStartBtn.disabled = false;

  });

  const normalBtn = document.createElement('button');
  // normalBtn.setAttribute('onclick', 'normalMode()');
  normalBtn.textContent = 'Normal';
  normalBtn.classList.add('mode-button');
  normalBtn.addEventListener('click', function() {
    changeColor(this);
    initialStartBtn.disabled = false;
  });

  const hardBtn = document.createElement('button');
  hardBtn.setAttribute('onclick', 'hardMode()');
  hardBtn.textContent = 'Hard';
  hardBtn.classList.add('mode-button');
  hardBtn.addEventListener('click', function() {
    hardMode(); 
    changeColor(this);
    initialStartBtn.disabled = false;
  });

  // Append
  buttonContainer.append(easyBtn, normalBtn, hardBtn);
  initialStart.append(logo, initialStartBtn, difficultyTitle, easyBtn, normalBtn, hardBtn);
  body.appendChild(initialStart);
  initialStart.hidden = 'true';
}




let lastClickedButton = null;
function changeColor(button) {
  // Remove the highlighting class from all buttons
  const buttons = document.querySelectorAll('.mode-button');
  buttons.forEach((btn) => {
    btn.classList.remove('mode-button-clicked');
  });

  // Add the highlighting class to the clicked button
  button.classList.add('mode-button-clicked');
}




// Check if one player has a winning score, if so, end game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    let winner;
    if (playerScore === winningScore) {
    winner = "Player 1";
  } else {
    winner = "The computer"
  }
    // const winner = playerScore === winningScore ? 'Player 1' : 'Computer';
    showGameOverEl(winner);
  }
}




// Called every frame
function animate() {
  renderCanvas();
  ballMove();
  ballBoundaries();
  computerAI();
  gameOver();
  if (!isGameOver) {
    window.requestAnimationFrame(animate);
  }
}




// Start Game, Reset Everything
function startGame() {
  if (isNewGame) {
    initialStart.parentElement.removeChild(initialStart);
  }

  if (isGameOver && !isNewGame) {
    body.removeChild(gameOverEl);
    canvas.hidden = false;
  }
  isGameOver = false;
  isNewGame = false;
  playerScore = 0;
  computerScore = 0;
  ballReset();
  createCanvas();
  animate();
  // setInterval(animate, 1000/60);
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    // Compensate for canvas being centered
    paddleBottomX = e.clientX - canvasPosition - paddleDiff;
    if (paddleBottomX < paddleDiff) {
      paddleBottomX = 0;
    }
    if (paddleBottomX > width - paddleWidth) {
      paddleBottomX = width - paddleWidth;
    }
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}




//----------------- USER LOCATION-BASED ALTERATIONS TO THE GAME -----------------//

// Get user's location
function getLocation() {
  var options = {
      enableHighAccuracy: true,
      timeout: 50000,
      maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(
      updateMyLocation,
      handleError,
      options
  );
}




// Gets user's location and fetches weather data
function updateMyLocation(position) {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;
  console.log(userLatitude);
  console.log(userLongitude);
  fetchWeatherData(userLatitude,userLongitude);
}




// Error messages
function handleError(error) {
  switch(error.code) {
      case 1:
          updateStatus("The user denied permission");
          break;
      case 2:
          updateStatus("Position is unavailable");
          break;
      case 3:
          updateStatus("Timed out");
          break;
  }
}




// Writes error messages if error
function updateStatus(message) {
  console.log("testing");
    // document.getElementById("status").innerHTML = 
    //     "<strong>Error</strong>: " + message;
}




// Function to fetch weather data
function fetchWeatherData(lat, lon) {
  if (userLatitude && userLongitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        // Handle the weather data here
        const weatherCondition = data.weather[0].main;

        // Select color theme based on current weather from API
        if (weatherCondition === "Clouds" || "Mist" || "Smoke" || "Haze" || "Dust" || "Fog" || "Sand" || "Dust" || "Ash" || "Squall") {
          makeCloudy();
        } else if (weatherCondition === "Clear") {
          makeSunny();
        } else if (weatherCondition === "Rain") {
          makeRainy();
        } else if (weatherCondition === "Drizzle") {
          makeDrizzly();
        } else if (weatherCondition === "Thunderstorm" || "Tornado") {
          makeStormy();
        } else if (weatherCondition === "Snow") {
          makeSnowy();
        }
        console.log(data);
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
}}




// Functions to change color scheme of page based on weather
function makeSunny() {
  const body = document.body;
  body.style.backgroundImage = 'url("images/sunnyday.jpg")';
  body.style.backgroundSize = 'cover';
  body.style.backgroundAttachment = 'fixed'; 
  canvasColor = '#5a466c';
}

function makeCloudy() {
  const body = document.body;
  body.style.backgroundImage = 'url("images/cloudyday.jpg")';
  body.style.backgroundSize = 'cover';
  body.style.backgroundAttachment = 'fixed'; 
  canvasColor = '#515151';
}

function makeRainy() {
  const body = document.body;
  body.style.backgroundImage = 'url("images/rainyday.jpg")';
  body.style.backgroundSize = 'cover';
  body.style.backgroundAttachment = 'fixed';
  canvasColor = '#000000';
}

function makeDrizzly() {
  const body = document.body;
  body.style.backgroundImage = 'url("images/drizzlyday.jpg")';
  body.style.backgroundSize = 'cover';
  body.style.backgroundAttachment = 'fixed';
  canvasColor = '#969696';
}

function makeSnowy() {
  const body = document.body;
  body.style.backgroundImage = 'url("images/snowyday.jpg")';
  body.style.backgroundSize = 'cover';
  body.style.backgroundAttachment = 'fixed';
  canvasColor = '#2c3a68';
}

function makeStormy() {
  const body = document.body;
  body.style.backgroundImage = 'url("images/stormyday.jpg")';
  body.style.backgroundSize = 'cover';
  body.style.backgroundPosition = 'bottom';
  body.style.backgroundAttachment = 'fixed';
  canvasColor = '#0c1c3f';
}




//----------------- DIFFICULTY LEVEL CHANGES TO THE GAME -----------------//
function easyMode() {
  isEasyMode = true;
  paddleWidth = 100;
  ballRadius = 8;
}

function hardMode() {
  isHardMode = true;
  paddleWidth = 30;
  ballRadius = 5;
}





// On Load
initialStartFunc();
// startGame();
getLocation();
