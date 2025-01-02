'use strict';

const gameController = {
  isRunning: false,
  currentScreen: 'welcomeScreen',

  switchScreen(screenName) {
    this.currentScreen = screenName;
    $('.screen').hide();
    $(`#${screenName}`).show();
    $('#helpBtn').hide();
    if (screenName === 'gameScreen') {
      $('body').css('background-image', 'url(./images/gamebg.jpg)');
    }

    if (screenName === 'gameOverScreen') {
      game.players.sort((a, b) => {
        return b.score - a.score;
      });
      let topDiv = document.createElement('div');
      topDiv.textContent = 'Ranking List';
      $(topDiv).css({
        fontSize: '30px',
      });
      $('#scoreList').append(topDiv);
      for (let i = 0; i < game.players.length; i++) {
        let scoreDiv = document.createElement('div');
        if (i === 0)
          $(scoreDiv).css({
            color: 'pink',
            fontSize: '25px',
          });
        scoreDiv.textContent = `${game.players[i].name} - ${game.players[i].difficulty} - ${game.players[i].score}`;
        $('#scoreList').append(scoreDiv);
      }
    }

    if (screenName === 'welcomeScreen') {
      this.isRunning = false; // Reset running state on welcome
      $('#helpBtn').show();
    }
  },

  showHelpModal() {
    if (
      this.currentScreen === 'welcomeScreen' ||
      this.currentScreen === 'gameOverScreen'
    ) {
      // On splash screen, show setup instructions
      $('#setupModal').modal('show');
    } else {
      // On the gameScreen show the gameplayModal
      $('#gameplayModal').modal('show');
    }

    this.isRunning = false; // Pause the game
    if (this.currentScreen == 'gameScreen') {
      $('#playPauseIcon').removeClass('bi-play-fill').addClass('bi-pause-fill'); // Show pause icon
    }
  },

  toggleRunning() {
    if (this.isRunning) {
      $('#playPauseIcon').removeClass('bi-play-fill').addClass('bi-pause-fill'); // Change to pause icon
    } else {
      $('#playPauseIcon').removeClass('bi-pause-fill').addClass('bi-play-fill'); // Change back to play icon
    }
  },

  renum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); // Round the num
    return num;
  },
};

// Set game object
const game = {
  players: [],
  activePlayer: 0,

  // Function to add a player
  addPlayer(playerName, difficulty) {
    const player = {
      name: playerName,
      difficulty: difficulty,
      score: 0,
    };
    this.players.push(player);
    this.displayPlayer();
  },
  //Fuction to display players
  displayPlayer() {
    const playerList = document.getElementById('player_list');
    playerList.innerHTML = '';

    this.players.forEach((player, index) => {
      const playerDiv = document.createElement('div');
      playerDiv.style.marginRight = '25px';
      const playerscore = document.createElement('span');
      playerscore.textContent = ` - ${player.score}`;
      playerDiv.textContent = `${player.name} - ${player.difficulty}`;
      playerDiv.style.display = 'inline-block';
      if (gameController.isRunning && index === this.activePlayer) {
        playerDiv.style.color = 'purple';
      } else {
        playerDiv.style.color = '';
      }
      playerDiv.append(playerscore);
      playerList.appendChild(playerDiv);
      if (!gameController.isRunning) $(playerscore).addClass('dscore');
    });
  },

  //add a point to active player
  addPoint() {
    if (gameController.isRunning && this.players.length > 0) {
      this.players[this.activePlayer].score++; // Increment the score of the active player
      this.displayPlayer(); // Update the display
    }
  },
  //restartgame
  restartPlayer() {
    if (gameController.isRunning && this.players.length > 0) {
      this.players[this.activePlayer].score = 0; // clear current player score
      this.displayPlayer();
    }
  },
  //switch player
  switchPlayer() {
    if (gameController.isRunning && this.players.length > 0) {
      this.activePlayer = (this.activePlayer + 1) % this.players.length; // Switch to the next player
      this.displayPlayer();
    }
  },
  //take current difficulty
  takeDifficulty() {
    return this.players[this.activePlayer].difficulty;
  },
};

//event
const joinButton = document.getElementById('join_button');
const startButton = document.getElementById('startGameBtn');
const playerNameInput = document.getElementById('player_name');

joinButton.addEventListener('click', function () {
  const playerName = playerNameInput.value;
  const difficulty = $('#select option:selected').text();
  if (playerName) {
    game.addPlayer(playerName, difficulty);
    $(startButton).addClass('btn-success');
    playerNameInput.value = '';
  }
});

$(document).ready(() => {
  // Create variables for the timer
  let timer;
  let selectedTime = 30000; // Default is 30s in milliseconds
  let timeRemaining = selectedTime;
  let currentL = 0;
  const $bspeed = 18; //current baskect movement speed
  let ballspeed = 2; // Default is 2

  // Ball container and elements for flying balls
  const $ballContainer = $('#flying-display');
  const $progressBar = $('#progress-bar');
  const $numericDisplay = $('#numeric-display');
  const $basket = $('#basket');
  //GameScreen Height

  const $gameSHeight = $('#gameBox').height();

  // Help button and modal events
  $('#helpBtn').click(() => gameController.showHelpModal());

  // Button events
  $('#startGameBtn').click(() => {
    if (game.players.length === 0) {
      alert('Please add the player to start the game.');
      return;
    }

    $('.dscore').removeClass('dscore');
    gameController.switchScreen('gameScreen');
    initializeFlyingBalls();
    startTimer();
    resetTimer();
  });
  $('#playPauseBtn').click(() => {
    if (gameController.isRunning) {
      pauseTimer();
      $('#helpBtn').show();
    } else {
      startTimer();
      $('#helpBtn').hide();
    }
    gameController.toggleRunning();
  });

  $('#restartGameBtn').click(() => {
    game.restartPlayer();
    resetTimer();
  });

  $('#quitGameBtn').click(() => {
    if (game.activePlayer === game.players.length - 1) {
      $('#topinfo').hide();
      gameController.switchScreen('gameOverScreen');
      return;
    }

    game.switchPlayer();
    resetTimer();
  });

  $('.exitGameBtn').click(() => {
    window.location.reload();
  });

  // Define the FlyingBall class
  class FlyingBall {
    constructor(index) {
      this.diameter = 25; // Fixed diameter of 25px
      this.index = index; // Ball index for vertical positioning
      this.x = gameController.renum(0, $('#gameBox').width() - 25);
      this.y = $gameSHeight - this.diameter; // Vertical position (evenly spaced)

      switch (game.takeDifficulty()) {
        case 'Easy':
          ballspeed = 2;
          break;
        case 'Medium':
          ballspeed = 4;
          break;
        case 'Hard':
          ballspeed = 6;
          break;
      }

      this.speed = Math.random() * ballspeed + 1; // Random horizontal speed
      // Create the ball elements
      this.element = $ballContainer
        .children()
        .eq(index)
        .css({
          position: 'absolute',
          width: `${this.diameter}px`,
          height: `${this.diameter}px`,
          borderRadius: '50%', // Circle shape
          bottom: `${this.y}px`,
          left: `${this.x}px`,
        });
    }

    // Update the position of the flying ball
    update() {
      this.y -= this.speed;

      // If the ball goes out from the bottom side screen, reset it to the top
      if (this.y <= 0) {
        this.y = $gameSHeight - this.diameter; // Start from the top again
      }

      this.element.css('bottom', `${this.y}px`);

      let hit_xl = this.x - $basket.width();

      let hit_xr = this.x + this.diameter;

      if (
        currentL > hit_xl &&
        currentL < hit_xr &&
        this.y < 95 &&
        this.y > 15
      ) {
        game.addPoint();
        this.resetPosition();
      } else if (this.y <= 10) {
        this.resetPosition();
      }
    }

    // Reset to the initial vertical position
    resetPosition() {
      switch (game.takeDifficulty()) {
        case 'Easy':
          ballspeed = 2;
          break;
        case 'Medium':
          ballspeed = 4;
          break;
        case 'Hard':
          ballspeed = 6;
          break;
      }
      this.speed = Math.random() * ballspeed + 1; // Random horizontal speed

      this.x = gameController.renum(0, $('#gameBox').width() - 25);
      this.y = $gameSHeight - this.diameter;
      this.element.css({
        bottom: `${this.y}px`,
        left: `${this.x}px`,
      });
    }
  }

  // Initialize flying balls
  const flyingBalls = [];

  function initializeFlyingBalls() {
    for (let i = 0; i < 5; i++) {
      const ball = new FlyingBall(i);
      flyingBalls.push(ball);
    }
  }

  // Update the position of all flying balls
  function updateFlyingBalls() {
    flyingBalls.forEach((ball) => {
      ball.update();
    });
  }

  // Start the timer
  function startTimer() {
    if (!timer) {
      gameController.isRunning = true;
      timer = setInterval(updateTimer, 10); // Update every 10ms

      //Key check
      $(document).on('keydown', function (event) {
        if (
          event.key === 'a' ||
          event.key === 'A' ||
          event.key === 'ArrowLeft'
        ) {
          event.preventDefault();
          currentL -= $bspeed;
          if (currentL < 0) currentL = 0;
          $basket.css({
            left: `${currentL}px`,
          });
        } else if (
          event.key === 'd' ||
          event.key === 'D' ||
          event.key === 'ArrowRight'
        ) {
          event.preventDefault();
          currentL += $bspeed;

          if (currentL > $('#gameBox').width() - $basket.width())
            currentL = $('#gameBox').width() - $basket.width();
          $basket.css({
            left: `${currentL}px`,
          });
        }
      });
    }
  }

  // Pause the timer
  function pauseTimer() {
    clearInterval(timer);
    timer = null;
    gameController.isRunning = false;
    $(document).off('keydown');
  }

  // Reset timer and flying balls
  function resetTimer() {
    pauseTimer();
    timeRemaining = selectedTime;
    $progressBar
      .css('width', '100%')
      .removeClass('bg-warning bg-danger')
      .addClass('bg-success');
    $numericDisplay.text(formatTime(timeRemaining));
    flyingBalls.forEach((ball) => ball.resetPosition());

    $('#playPauseIcon').removeClass('bi-play-fill').addClass('bi-pause-fill'); // Change to pause icon

    currentL = 0;
    $basket.css({
      left: `${currentL}px`,
    });
    startTimer();
  }

  // Format time as mm:ss
  function formatTime(time) {
    let minutes = Math.floor(time / 60000);
    let seconds = Math.floor((time % 60000) / 1000);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  }

  // Update the progress bar and timer
  function updateTimer() {
    if (timeRemaining <= 0) {
      clearInterval(timer);
      timer = null;
      $('#progress-bar')
        .css('width', '0%')
        .removeClass('bg-warning bg-danger')
        .addClass('bg-success');
      $('#quitGameBtn').click();
      return;
    }

    timeRemaining -= 10; // Decrease time by 10ms
    $('#numeric-display').text(formatTime(timeRemaining));

    let progress = (timeRemaining / selectedTime) * 100;
    $('#progress-bar').css('width', `${progress}%`);

    if (progress <= 15) {
      $('#progress-bar')
        .removeClass('bg-warning bg-success')
        .addClass('bg-danger');
    } else if (progress <= 50) {
      $('#progress-bar').removeClass('bg-success').addClass('bg-warning');
    }
    // Update flying balls position during countdown
    updateFlyingBalls();
  }
});
