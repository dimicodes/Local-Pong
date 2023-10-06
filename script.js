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

// Weather API Key
const apiKey = 'd5be7e62025127435cae7e06f7abc1a1';

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleContact = false;

// Ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// Speed
let speedY;
let speedX;
let trajectoryX;
let computerSpeed;

// Change Mobile Settings
if (isMobile.matches) {
  speedY = -2;
  speedX = speedY;
  computerSpeed = 4;
} else {
  speedY = -1;
  speedX = speedY;
  computerSpeed = 3;
}

// Score
let playerScore = 0;
let computerScore = 0;
const winningScore = 3;
let isGameOver = true;
let isNewGame = true;

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = canvasColor;
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Player Paddle (Bottom)
  context.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

  // Computer Paddle (Top)
  context.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

  // Dashed Center Line
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

  // Table Vertical Divider Line
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

// Create Canvas Element
function createCanvas() {
  canvas.width = width;
  canvas.height = height;
  body.appendChild(canvas);
  renderCanvas();
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = -3;
  paddleContact = false;
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += -speedY;
  // Horizontal Speed
  if (playerMoved && paddleContact) {
    ballX += speedX;
  }
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
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
      speedX = trajectoryX * 0.3;
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
      // Reset Ball, add to Player Score
      ballReset();
      playerScore++;
    }
  }
}

// Computer Movement
function computerAI() {
  // if (playerMoved) {
  //   if (paddleTopX + paddleDiff < ballX) {
  //     paddleTopX += computerSpeed;
  //   } else {
  //     paddleTopX -= computerSpeed;
  //   }
  // }
  if (playerMoved) {
    if (paddleTopX + paddleDiff < ballX) {
      paddleTopX += computerSpeed;
    } else if (paddleTopX - paddleDiff > ballX) {
      paddleTopX -= computerSpeed;
    }
  }
}

// Show game over screen with winner
function showGameOverEl(winner) {
  // Hide Canvas
  canvas.hidden = 'true';
  // Container
  gameOverEl.textContent = '';
  gameOverEl.classList.add('game-over-container');
  // Title
  const title = document.createElement('h1');
  title.textContent = `${winner} Wins!`;
  // Button
  const playAgainBtn = document.createElement('button');
  playAgainBtn.setAttribute('onclick', 'startGame()');
  playAgainBtn.textContent = 'Play Again';
  // Append
  gameOverEl.append(title, playAgainBtn);
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
  });

  const normalBtn = document.createElement('button');
  normalBtn.setAttribute('onclick', 'normalMode()');
  normalBtn.textContent = 'Normal';
  normalBtn.classList.add('mode-button');
  normalBtn.addEventListener('click', function() {
    normalMode(); 
    changeColor(this);
  });

  const hardBtn = document.createElement('button');
  hardBtn.setAttribute('onclick', 'hardMode()');
  hardBtn.textContent = 'Hard';
  hardBtn.classList.add('mode-button');
  hardBtn.addEventListener('click', function() {
    hardMode(); 
    changeColor(this);
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

// Check If One Player Has Winning Score, If They Do, End Game
function gameOver() {
  if (playerScore === winningScore || computerScore === winningScore) {
    isGameOver = true;
    // Set Winner
    let winner;
    if (playerScore === winningScore) {
    winner = "Player";
  } else {
    winner = "Computer"
  }
    // const winner = playerScore === winningScore ? 'Player 1' : 'Computer';
    showGameOverEl(winner);
  }
}

// Called Every Frame
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
        if (weatherCondition === "Clouds") {
          makeCloudy();
        } else if (weatherCondition === "Clear") {
          makeSunny();
        } else if (weatherCondition === "Rain") {
          makeRainy();
        } else if (weatherCondition === "Drizzle") {
          makeDrizzly();
        } else if (weatherCondition === "Thunderstorm") {
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
  canvasColor = '#a289b0';
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

}

function normalMode() {

}

function hardMode() {

}


// On Load
initialStartFunc();
// startGame();
getLocation();
