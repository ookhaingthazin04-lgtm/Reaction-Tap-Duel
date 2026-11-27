/**
 * Reaction Tap Duel - Phase 1 Frontend UI
 * This file handles all UI screens and local game simulation.
 * No backend or database yet.
 */

const APP = {
  state: {
    screen: 'home',
    playerName: '',
    roomCode: '',
    player1Name: 'You',
    player2Name: 'Opponent',
    p1Ready: false,
    p2Ready: false,
    score1: 0,
    score2: 0,
    gameActive: false,
    roundActive: false,
    timeLeft: 10,
    winner: null,
    wins: 0,
    gamesPlayed: 0,
    timerInterval: null,
    gameInterval: null,
    readyTimeout: null,
    apiBase: '',
    isAuthenticated: false,
    currentUserId: null,
    currentUsername: null,
    socket: null,
    inRoom: false,
    myPlayerNumber: null,
    roomPlayers: [],
    greenTime: null,
    myReactionTime: null,
    opponentReactionTime: null,
    roundWinner: null,
    waitingForResult: false,
    gameEnded: false,
    currentRound: 0,
    totalRounds: 5,
    matchScores: { 1: 0, 2: 0 },
    countdown: 10,
    countdownInterval: null,
    soundEnabled: true,
    soundVolume: 0.7,
    audioContext: null,
    musicEnabled: true,
    musicVolume: 0.5,
    emoteCooldown: 1500,
    lastEmoteTime: 0,
    emotePickerOpen: false,
    rematchRequested: false,
    waitingForRematch: false,
    bgMusicSource: null,
    bgMusicGain: null,
    bgMusicOscillators: [],
    bgMusicStartTime: 0,
    isMusicPlaying: false,
  },

  // DOM elements
  els: {},

  init() {
    this.cacheElements();
    this.bindEvents();
    this.showScreen('home');
    this.updateStatsDisplay();
    this.generateRoomCode();
    this.checkSession();
  },

  cacheElements() {
    const id = (id) => document.getElementById(id);
    this.els = {
      screens: document.querySelectorAll('.screen'),
      screensMap: {
        home: id('screen-home'),
        login: id('screen-login'),
        register: id('screen-register'),
        lobby: id('screen-lobby'),
        countdown: id('screen-countdown'),
        game: id('screen-game'),
        gameover: id('screen-gameover'),
        leaderboard: id('screen-leaderboard'),
        matchHistory: id('screen-match-history'),
        profile: id('screen-profile'),
      },
      btnBackLobby: id('btn-back-lobby'),
      btnSurrender: id('btn-surrender'),
      btnEndGame: id('btn-end-game'),
      btnPlayAgain: id('btn-play-again'),
      btnBackGameover: id('btn-back-gameover'),
      roomCodeValue: id('current-room-code'),
      playerName1: id('player-name-1'),
      playerName2: id('player-name-2'),
      previewName1: id('preview-name-1'),
      previewName2: id('preview-name-2'),
      scoreName1: id('score-name-1'),
      scoreName2: id('score-name-2'),
      score1: id('score-1'),
      score2: id('score-2'),
      tapZone1: id('tap-zone-1'),
      tapZone2: id('tap-zone-2'),
      light1: id('light-1'),
      light2: id('light-2'),
      instr1: id('instr-1'),
      instr2: id('instr-2'),
      gameTimer: id('game-timer'),
      gameStatus: id('game-status'),
      btnEmote: id('btn-emote'),
      emotePicker: id('emote-picker'),
      emoteDisplay: id('emote-display'),
      lobbyMessage: id('lobby-message'),
      statWins: id('stat-wins'),
      statGames: id('stat-games'),
      gameoverTitle: id('gameover-title'),
      gameoverMessage: id('gameover-message'),
      finalName1: id('final-name-1'),
      finalName2: id('final-name-2'),
      finalScore1: id('final-score-1'),
      finalScore2: id('final-score-2'),
      centerScore1: id('center-score-1'),
      centerScore2: id('center-score-2'),
      winnerAnnouncement: id('winner-announcement'),
      winnerTitle: id('winner-title'),
      winnerNameDisplay: id('winner-name-display'),
      winnerBadge1: id('winner-badge-1'),
      loserBadge1: id('loser-badge-1'),
      winnerBadge2: id('winner-badge-2'),
      loserBadge2: id('loser-badge-2'),
      playerCard1: id('player-card-1'),
      playerCard2: id('player-card-2'),
      btnNavLogin: id('nav-login'),
      btnNavRegister: id('nav-register'),
      btnNavLeaderboard: id('nav-leaderboard'),
      btnNavMatchHistory: id('nav-match-history'),
      btnNavProfile: id('nav-profile'),
      btnBackLogin: id('btn-back-login'),
      btnBackRegister: id('btn-back-register'),
      btnBackLeaderboard: id('btn-back-leaderboard'),
      btnBackMatchHistory: id('btn-back-match-history'),
      btnBackProfile: id('btn-back-profile'),
      btnProfileLeaderboard: id('btn-profile-leaderboard'),
      btnLogout: id('btn-logout'),
      authUser: id('auth-user'),
      authStatus: id('auth-status'),
      btnSoundToggle: id('btn-sound-toggle'),
      soundVolume: id('sound-volume'),
      btnMusicToggle: id('btn-music-toggle'),
      musicVolume: id('music-volume'),
      formLogin: id('form-login'),
      formRegister: id('form-register'),
      loginUsername: id('login-username'),
      loginPassword: id('login-password'),
      regUsername: id('reg-username'),
      regEmail: id('reg-email'),
      regPassword: id('reg-password'),
      regConfirmPassword: id('reg-confirm-password'),
      loginError: id('login-error'),
      registerError: id('register-error'),
      authGate: id('auth-gate'),
      roomActions: id('room-actions'),
      roomInfo: id('room-info'),
      btnCreateRoom: id('btn-create-room'),
      btnJoinRoom: id('btn-join-room'),
      joinRoomCode: id('join-room-code'),
      btnToggleReady: id('btn-toggle-ready'),
      btnStartGame: id('btn-start-game'),
      btnLeaveRoom: id('btn-leave-room'),
      btnCopyRoomCode: id('btn-copy-room-code'),
      btnProfileBackLobby: id('btn-profile-back-lobby'),
      btnLobbyProfile: id('btn-lobby-profile'),
      lobbyUsername: id('lobby-username'),
      lobbyUserBar: id('lobby-user-bar'),
      currentRoomCode: id('current-room-code'),
      roundNumberDisplay: id('round-number'),
      roundTotalDisplay: id('round-total'),
      playerName1: id('player-name-1'),
      playerName2: id('player-name-2'),
      playerStatus1: id('player-status-1'),
      playerStatus2: id('player-status-2'),
      lobbyMessage: id('lobby-message'),
      leaderboardBody: id('leaderboard-body'),
      matchHistoryBody: id('match-history-body'),
      // Profile elements
      profileUsername: id('profile-username'),
      profileEmail: id('profile-email'),
      profileMemberSince: id('profile-member-since'),
      profileUserId: id('profile-user-id'),
      profileTotalGames: id('profile-total-games'),
      profileWins: id('profile-wins'),
      profileLosses: id('profile-losses'),
      profileWinRate: id('profile-win-rate'),
      profileBestTime: id('profile-best-time'),
    };
  },

  bindEvents() {
    this.els.btnBackLobby.addEventListener('click', () => { this.playClickSound(); this.showScreen('home'); });
    this.els.btnSurrender.addEventListener('click', () => { this.playClickSound(); this.endGame(null, 'surrender'); });
    this.els.btnEndGame.addEventListener('click', () => { this.playClickSound(); this.endGame(null, 'end_game'); });
    this.els.btnEmote.addEventListener('click', () => { this.playClickSound(); this.toggleEmotePicker(); });
    this.els.emotePicker.addEventListener('click', (e) => {
      const option = e.target.closest('.emote-option');
      if (option) {
        this.sendEmote(option.dataset.emoji);
      }
    });
    this.els.btnPlayAgain.addEventListener('click', () => { this.playClickSound(); this.resetGame(); });
    this.els.btnBackGameover.addEventListener('click', () => {
      this.playClickSound();
      // Cancel rematch request if waiting for opponent
      if (this.state.waitingForRematch && this.state.inRoom && this.state.socket && this.state.socket.connected) {
        this.state.socket.emit('cancel_rematch', {
          roomCode: this.state.roomCode,
          userId: this.state.currentUserId,
        });
        this.state.waitingForRematch = false;
        this.state.rematchRequested = false;
        if (this.els.btnPlayAgain) {
          this.els.btnPlayAgain.disabled = false;
          this.els.btnPlayAgain.textContent = 'PLAY AGAIN';
        }
      }
      this.showScreen('home');
    });

    this.els.btnNavLogin.addEventListener('click', (e) => {
      e.preventDefault();
      this.showScreen('login');
    });
    this.els.btnNavRegister.addEventListener('click', (e) => {
      e.preventDefault();
      this.showScreen('register');
    });
    this.els.btnNavLeaderboard.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadLeaderboard();
      this.showScreen('leaderboard');
    });
    this.els.btnNavMatchHistory.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.loadMatchHistory();
      this.showScreen('matchHistory');
    });
    this.els.btnNavProfile.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadProfile();
      this.showScreen('profile');
    });
    this.els.btnBackLeaderboard.addEventListener('click', () => this.showScreen('home'));
    this.els.btnBackMatchHistory.addEventListener('click', () => this.showScreen('home'));
    this.els.btnBackProfile.addEventListener('click', () => this.showScreen('home'));
    this.els.btnBackLogin.addEventListener('click', () => this.showScreen('home'));
    this.els.btnBackRegister.addEventListener('click', () => this.showScreen('home'));
    this.els.btnLogout.addEventListener('click', async () => await this.logout());

    // Sound controls
    this.els.btnSoundToggle.addEventListener('click', () => this.toggleSound());
    this.els.soundVolume.addEventListener('input', (e) => this.setVolume(parseFloat(e.target.value)));

    // Music controls
    this.els.btnMusicToggle.addEventListener('click', () => this.toggleMusic());
    this.els.musicVolume.addEventListener('input', (e) => this.setMusicVolume(parseFloat(e.target.value)));

    // Room buttons
    this.els.btnCreateRoom.addEventListener('click', () => { this.playClickSound(); this.createRoom(); });
    this.els.btnJoinRoom.addEventListener('click', () => { this.playClickSound(); this.joinRoom(); });
    this.els.btnToggleReady.addEventListener('click', () => { this.playClickSound(); this.toggleReadyRoom(); });
    this.els.btnStartGame.addEventListener('click', () => { this.playClickSound(); this.startGameButtonClicked(); });
    this.els.btnLeaveRoom.addEventListener('click', () => { this.playClickSound(); this.leaveRoom(); });
    this.els.btnCopyRoomCode.addEventListener('click', () => { this.playClickSound(); this.copyRoomCode(); });

    // Profile actions
    this.els.btnProfileLeaderboard.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadLeaderboard();
      this.showScreen('leaderboard');
    });
    this.els.btnProfileBackLobby.addEventListener('click', (e) => {
      e.preventDefault();
      this.showScreen('lobby');
    });
    this.els.btnLobbyProfile.addEventListener('click', (e) => {
      e.preventDefault();
      this.loadProfile();
      this.showScreen('profile');
    });

    // Link from lobby to login/register
    document.getElementById('link-login-from-lobby').addEventListener('click', (e) => {
      e.preventDefault();
      this.showScreen('login');
    });
    document.getElementById('link-register-from-lobby').addEventListener('click', (e) => {
      e.preventDefault();
      this.showScreen('register');
    });
    
    // Link within auth screens to switch between login and register
    document.getElementById('link-to-register').addEventListener('click', (e) => {
      e.preventDefault();
      this.showScreen('register');
    });
    document.getElementById('link-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.showScreen('login');
    });

    this.els.formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.login();
    });

    this.els.formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.register();
    });

    const readyLinks = document.querySelectorAll('.nav-link');
    readyLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const text = link.textContent.trim();
        if (text === 'How to Play') {
          alert('How to Play: Wait for your light to turn green, then tap your side as fast as you can. The player with the most points when the timer runs out wins!');
        } else if (text === 'Leaderboard') {
          alert('Leaderboard: Coming soon in the next phase with backend and database!');
        }
      });
    });

    this.els.tapZone1.addEventListener('click', () => this.onTap(1));
    this.els.tapZone2.addEventListener('click', () => this.onTap(2));

    // Close emote picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.state.emotePickerOpen) return;
      if (!this.els.emotePicker.contains(e.target) && e.target !== this.els.btnEmote) {
        this.closeEmotePicker();
      }
    });
  },

  showScreen(name) {
    this.state.screen = name;
    this.els.screens.forEach((s) => s.classList.remove('active'));
    const target = this.els.screensMap[name];
    if (target) {
      target.classList.add('active');
      target.classList.add('animate-fade-in');
      setTimeout(() => target.classList.remove('animate-fade-in'), 400);
    }

    // Music control based on screen
    if (name === 'lobby') {
      if (this.state.musicEnabled && !this.state.isMusicPlaying) {
        this.startBgMusic();
      }
    } else if (name === 'game') {
      this.stopBgMusic();
      this.playGameStartSound();
    } else if (name === 'gameover') {
      this.stopBgMusic();
      this.playWinnerSound();
    } else if (this.state.musicEnabled && !this.state.isMusicPlaying) {
      // Keep music playing on home, leaderboard, profile, etc.
      this.startBgMusic();
    }
  },

  onStart() {
    if (!this.state.playerName) {
      alert('Please enter your name first.');
      return;
    }
    this.state.p1Ready = false;
    this.state.p2Ready = false;
    this.updateLobbyUI();
    this.showScreen('lobby');
    this.simulateOpponentJoin();
  },

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.state.roomCode = code;
    this.els.roomCodeValue.textContent = code;
  },

  copyRoomCode() {
    navigator.clipboard.writeText(this.state.roomCode).then(() => {
      const btn = this.els.btnCopyRoom;
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  },

  simulateOpponentJoin() {
    setTimeout(() => {
      this.state.p2Ready = false;
      this.setPlayerStatus(2, 'connected');
      this.els.lobbyMessage.textContent = 'Opponent joined the room.';
    }, 1500);
  },

  toggleReady() {
    if (this.state.readyTimeout) {
      clearTimeout(this.state.readyTimeout);
      this.state.readyTimeout = null;
    }

    this.state.p1Ready = !this.state.p1Ready;
    this.setPlayerStatus(1, this.state.p1Ready ? 'ready' : 'connected');
    this.els.btnToggleReady.textContent = this.state.p1Ready ? 'Not Ready' : "I'm Ready";
    this.els.btnToggleReady.classList.toggle('btn-primary', !this.state.p1Ready);
    this.els.btnToggleReady.classList.toggle('btn-ghost', this.state.p1Ready);

    if (this.state.p1Ready && this.state.p2Ready) {
      this.startCountdown();
    } else if (this.state.p1Ready && !this.state.p2Ready) {
      this.els.lobbyMessage.textContent = 'Waiting for opponent to be ready...';
      this.state.readyTimeout = setTimeout(() => {
        this.state.readyTimeout = null;
        if (!this.state.p1Ready) return;
        this.state.p2Ready = true;
        this.setPlayerStatus(2, 'ready');
        this.startCountdown();
      }, 2000);
    } else {
      this.els.lobbyMessage.textContent = '';
    }
  },

  setPlayerStatus(playerNum, status) {
    const card = this.els[`playerCard${playerNum}`];
    const statusEl = card.querySelector('.player-status');
    card.classList.remove('pending', 'connected');
    if (status === 'connected') card.classList.add('connected');
    if (status === 'waiting') card.classList.add('pending');
    statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    statusEl.className = `player-status ${status}`;
  },

  startCountdown() {
    this.initAudio();
    let count = 3;
    this.els.countdownNumber.textContent = count;
    this.showScreen('countdown');

    this.playCountdownSound();

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        this.els.countdownNumber.textContent = count;
        this.playCountdownSound();
      } else {
        clearInterval(interval);
        this.startGame();
      }
    }, 1000);
  },

  startGame() {
    this.state.score1 = 0;
    this.state.score2 = 0;
    this.state.timeLeft = 10;
    this.state.gameActive = true;
    this.state.roundActive = false;
    this.state.winner = null;

    this.playGoSound();

    this.updateScoreDisplay();
    this.updateGameTimer();
    this.resetTapZones();
    this.els.gameStatus.textContent = 'Get ready...';
    this.showScreen('game');

    this.state.gameInterval = setInterval(() => {
      if (!this.state.gameActive) return;
      this.state.timeLeft--;
      this.updateGameTimer();

      if (this.state.timeLeft <= 0) {
        this.endGame(this.state.score1 > this.state.score2 ? 1 : this.state.score2 > this.state.score1 ? 2 : null);
      }
    }, 1000);

    setTimeout(() => this.beginRound(), 1500);
  },

  beginRound() {
    if (!this.state.gameActive) return;
    this.state.roundActive = true;
    const delay = 1500 + Math.random() * 2500;

    this.state.timerInterval = setTimeout(() => {
      if (!this.state.gameActive || !this.state.roundActive) return;
      this.activateLight(Math.floor(Math.random() * 2) + 1);
    }, delay);
  },

  activateLight(playerNum) {
    const light = this.els[`light${playerNum}`];
    const zone = this.els[`tapZone${playerNum}`];
    const instr = this.els[`instr${playerNum}`];

    light.classList.add('ready');
    zone.classList.add('tap-zone-active');
    instr.textContent = 'TAP NOW!';
    instr.className = 'tap-instruction go';

    this.state.roundActive = true;
  },

  deactivateLight(playerNum) {
    const light = this.els[`light${playerNum}`];
    const instr = this.els[`instr${playerNum}`];
    light.classList.remove('ready', 'tapped');
    instr.textContent = 'Wait for green';
    instr.className = 'tap-instruction waiting';
  },

  resetTapZones() {
    this.deactivateLight(1);
    this.deactivateLight(2);
    this.els.tapZone1.classList.remove('tap-zone-disabled');
    this.els.tapZone2.classList.remove('tap-zone-disabled');
  },

  // Emote feature
  toggleEmotePicker() {
    if (this.state.emotePickerOpen) {
      this.closeEmotePicker();
    } else {
      this.els.emotePicker.style.display = 'grid';
      this.state.emotePickerOpen = true;
    }
  },

  closeEmotePicker() {
    this.els.emotePicker.style.display = 'none';
    this.state.emotePickerOpen = false;
  },

  sendEmote(emoji) {
    const now = Date.now();
    if (now - this.state.lastEmoteTime < this.state.emoteCooldown) {
      return; // cooldown active
    }
    this.state.lastEmoteTime = now;
    this.closeEmotePicker();

    // Show locally immediately
    this.showEmote(this.state.myPlayerNumber || 1, emoji);

    // Send to server to broadcast to opponent
    if (this.state.inRoom && this.state.socket && this.state.socket.connected) {
      this.state.socket.emit('player_emote', {
        roomCode: this.state.roomCode,
        userId: this.state.currentUserId,
        playerNumber: this.state.myPlayerNumber || 1,
        emoji,
      });
    }
  },

  showEmote(playerNumber, emoji) {
    if (!this.els.emoteDisplay) return;
    const bubble = document.createElement('div');
    bubble.className = 'emote-bubble';
    bubble.textContent = emoji;

    // Position based on player side: left for P1, right for P2
    const arenaRect = this.els.emoteDisplay.getBoundingClientRect();
    const isP1 = playerNumber === 1;
    const x = isP1 ? arenaRect.width * 0.25 : arenaRect.width * 0.75;
    const y = arenaRect.height * 0.35;

    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    this.els.emoteDisplay.appendChild(bubble);

    // Remove after animation
    setTimeout(() => {
      try { bubble.remove(); } catch (err) {}
    }, 1500);

    // Play a subtle emote sound if sound enabled
    try { this.playClickSound(); } catch (e) {}
  },

  onTap(playerNum) {
    if (!this.state.gameActive || this.state.waitingForResult) return;

    const light = this.els[`light${playerNum}`];
    const zone = this.els[`tapZone${playerNum}`];
    const instr = this.els[`instr${playerNum}`];

    // Send tap to server for validation
    if (this.state.inRoom && this.state.socket && this.state.socket.connected) {
      this.state.socket.emit('player_tap', {
        roomCode: this.state.roomCode,
        userId: this.state.currentUserId,
        playerNumber: playerNum,
      }, (response) => {
        if (!response.success) {
          // False start or error
          if (response.error && response.error.includes('False start')) {
            instr.textContent = 'FALSE START!';
            instr.className = 'tap-instruction false-start';
            light.classList.remove('ready');
            light.classList.add('tapped');
            setTimeout(() => {
              light.classList.remove('tapped');
              instr.textContent = 'Wait for green';
              instr.className = 'tap-instruction waiting';
            }, 1000);
          } else {
            this.els.gameStatus.textContent = response.error || 'Tap failed';
          }
          return;
        }
        // Valid tap recorded on server, wait for round_result
        this.state.waitingForResult = true;
        instr.textContent = 'Waiting for result...';
        instr.className = 'tap-instruction waiting';
      });
    } else {
      // Local fallback
      if (!light.classList.contains('ready')) {
        this.els.gameStatus.textContent = 'Too early!';
        setTimeout(() => { if (this.state.gameActive) this.els.gameStatus.textContent = 'Game in progress'; }, 1000);
        return;
      }

      this.state.roundActive = false;
      if (this.state.timerInterval) {
        clearTimeout(this.state.timerInterval);
        this.state.timerInterval = null;
      }

      light.classList.remove('ready');
      light.classList.add('tapped');
      zone.classList.remove('tap-zone-active');

      if (playerNum === 1) {
        this.state.score1++;
      } else {
        this.state.score2++;
      }
      this.updateScoreDisplay();
      this.els.gameStatus.textContent = `Player ${playerNum} scored!`;

      setTimeout(() => {
        light.classList.remove('tapped');
        if (this.state.gameActive) {
          this.beginRound();
        }
      }, 800);
    }
  },

  updateScoreDisplay() {
    this.els.score1.textContent = this.state.score1;
    this.els.score2.textContent = this.state.score2;
  },

  updateGameTimer() {
    // In room mode, display server-synced countdown; in local mode, use timeLeft
    if (this.state.inRoom) {
      this.els.gameTimer.textContent = this.state.countdown.toString().padStart(2, '0');
    } else {
      this.els.gameTimer.textContent = this.state.timeLeft.toString().padStart(2, '0');
    }
  },

  updateLobbyUI() {
    this.els.playerName1.textContent = this.state.playerName || 'You';
    this.els.playerName2.textContent = 'Opponent';
    this.setPlayerStatus(1, 'waiting');
    this.setPlayerStatus(2, 'waiting');
    this.els.btnToggleReady.textContent = "I'm Ready";
    this.els.btnToggleReady.className = 'btn btn-primary btn-large';
    this.els.lobbyMessage.textContent = '';
  },

  endGame(winner, reason = 'normal') {
    // Prevent duplicate game end
    if (this.state.gameEnded) return;
    this.state.gameEnded = true;

    this.state.gameActive = false;
    this.state.roundActive = false;
    if (this.state.gameInterval) {
      clearInterval(this.state.gameInterval);
      this.state.gameInterval = null;
    }
    if (this.state.timerInterval) {
      clearTimeout(this.state.timerInterval);
      this.state.timerInterval = null;
    }
    this.resetTapZones();

    // For local play (not in room), determine winner from scores and show results immediately
    if (!this.state.inRoom) {
      if (winner === null) {
        if (this.state.score1 > this.state.score2) {
          winner = 1;
        } else if (this.state.score2 > this.state.score1) {
          winner = 2;
        }
      }
      this.state.winner = winner;
      this.showGameoverScreen(winner, reason);
      return;
    }

    // For room play, notify server to calculate final scores and determine winner
    // Server will broadcast game_ended to all clients
    if (this.state.socket && this.state.socket.connected) {
      this.state.socket.emit('game_ended', {
        roomCode: this.state.roomCode,
        userId: this.state.currentUserId,
        winner: null, // Server will determine based on scores
        reason,
      });
    }

    // Don't show gameover screen yet - wait for server's game_ended broadcast
    // The game_ended handler will show results for both clients simultaneously
  },

  showGameoverScreen(winner, reason = 'normal') {
    const isDraw = this.state.score1 === this.state.score2;
    const p1Name = this.state.playerName || 'You';
    const p2Name = this.state.inRoom ? 'Opponent' : 'Player 2';

    // Update player names and scores
    this.els.finalName1.textContent = p1Name;
    this.els.finalName2.textContent = p2Name;
    this.els.finalScore1.textContent = this.state.score1;
    this.els.finalScore2.textContent = this.state.score2;

    // Show winner announcement only in room mode
    if (this.state.inRoom) {
      this.els.winnerAnnouncement.style.display = 'block';
      this.els.winnerNameDisplay.textContent = winner === 1 ? p1Name : (winner === 2 ? p2Name : 'Draw');
    } else {
      this.els.winnerAnnouncement.style.display = 'none';
    }

    // Reset card classes
    const card1 = this.els.finalScore1.closest('.battle-card');
    const card2 = this.els.finalScore2.closest('.battle-card');
    card1.classList.remove('winner-card', 'loser-card');
    card2.classList.remove('winner-card', 'loser-card');

    // Hide all badges
    this.els.winnerBadge1.style.display = 'none';
    this.els.loserBadge1.style.display = 'none';
    this.els.winnerBadge2.style.display = 'none';
    this.els.loserBadge2.style.display = 'none';

    if (isDraw) {
      this.els.gameoverTitle.textContent = 'DRAW!';
      this.els.gameoverMessage.textContent = 'Same score, close match.';
      this.els.gameoverTitle.style.color = 'var(--accent-yellow)';
    } else if (winner === 1) {
      card1.classList.add('winner-card');
      card2.classList.add('loser-card');
      this.els.winnerBadge1.style.display = 'block';
      this.els.loserBadge2.style.display = 'block';
      this.els.gameoverTitle.textContent = 'YOU WIN!';
      this.els.gameoverMessage.textContent = reason === 'surrender' ? 'Opponent surrendered!' : 'Great reactions!';
      this.els.gameoverTitle.style.color = 'var(--accent-green)';
      try { this.playVictorySound(); } catch (e) {}
    } else if (winner === 2) {
      card2.classList.add('winner-card');
      card1.classList.add('loser-card');
      this.els.winnerBadge2.style.display = 'block';
      this.els.loserBadge1.style.display = 'block';
      this.els.gameoverTitle.textContent = 'YOU LOSE';
      this.els.gameoverMessage.textContent = reason === 'surrender' ? 'You surrendered!' : 'Better luck next time.';
      this.els.gameoverTitle.style.color = 'var(--accent-red)';
      try { this.playDefeatSound(); } catch (e) {}
    }

    this.updateStatsDisplay();
    this.showScreen('gameover');
  },

  async resetGame() {
    // Prevent duplicate clicks while waiting for opponent
    if (this.state.waitingForRematch) return;

    // Clear all local timers
    if (this.state.gameInterval) {
      clearInterval(this.state.gameInterval);
      this.state.gameInterval = null;
    }
    if (this.state.timerInterval) {
      clearTimeout(this.state.timerInterval);
      this.state.timerInterval = null;
    }
    if (this.state.countdownInterval) {
      clearInterval(this.state.countdownInterval);
      this.state.countdownInterval = null;
    }

    // Fully reset local game state
    this.state.score1 = 0;
    this.state.score2 = 0;
    this.state.timeLeft = 10;
    this.state.winner = null;
    this.state.gameEnded = false;
    this.state.roundActive = false;
    this.state.waitingForResult = false;
    this.state.greenTime = null;
    this.state.myReactionTime = null;
    this.state.opponentReactionTime = null;
    this.state.roundWinner = null;
    this.state.currentRound = 0;
    this.state.matchScores = { 1: 0, 2: 0 };
    this.state.countdown = 10;
    this.state.p1Ready = false;
    this.state.p2Ready = false;

    // Rematch coordination state
    this.state.rematchRequested = true;
    this.state.waitingForRematch = true;

    // Update UI: show "Waiting for opponent..." on gameover screen
    if (this.els.btnPlayAgain) {
      this.els.btnPlayAgain.disabled = true;
      this.els.btnPlayAgain.textContent = 'Waiting for opponent...';
    }
    if (this.els.gameoverMessage) {
      this.els.gameoverMessage.textContent = 'Waiting for opponent to click Play Again...';
    }

    this.updateScoreDisplay();
    this.resetTapZones();

    // Cleanup emote state on reset
    this.closeEmotePicker();
    if (this.els.emoteDisplay) {
      this.els.emoteDisplay.innerHTML = '';
    }
    this.state.lastEmoteTime = 0;

    // Notify server to request a rematch (server starts new match only when both agree)
    console.log('[REMATCH] Client resetGame: sending reset_game', {
      roomCode: this.state.roomCode,
      userId: this.state.currentUserId,
      inRoom: this.state.inRoom,
      socketConnected: this.state.socket ? this.state.socket.connected : false,
    });

    if (this.state.inRoom && this.state.socket && this.state.socket.connected) {
      try {
        await new Promise((resolve) => {
          this.state.socket.emit('reset_game', {
            roomCode: this.state.roomCode,
            userId: this.state.currentUserId,
          }, (result) => {
            console.log('[REMATCH] Client reset_game response:', result);
            if (result && result.waiting) {
              this.els.lobbyMessage.textContent = result.message || 'Waiting for opponent...';
              this.els.gameoverMessage.textContent = result.message || 'Waiting for opponent to click Play Again...';
            }
            if (result && result.rematch) {
              // Server started the rematch immediately (shouldn't happen normally, but handle it)
              this.state.waitingForRematch = false;
              this.state.rematchRequested = false;
              if (this.els.btnPlayAgain) {
                this.els.btnPlayAgain.disabled = false;
                this.els.btnPlayAgain.textContent = 'PLAY AGAIN';
              }
            }
            if (result && result.roundId) {
              this.state.roundId = result.roundId;
            }
            resolve(result);
          });
        });
      } catch (err) {
        console.log('[Client] Reset game server notification failed:', err.message);
        this.state.waitingForRematch = false;
        this.state.rematchRequested = false;
        if (this.els.btnPlayAgain) {
          this.els.btnPlayAgain.disabled = false;
          this.els.btnPlayAgain.textContent = 'PLAY AGAIN';
        }
      }
    } else {
      console.log('[REMATCH] Cannot send reset_game: inRoom=', this.state.inRoom, 'socket=', !!this.state.socket, 'connected=', this.state.socket ? this.state.socket.connected : false);
    }
  },

  updateStatsDisplay() {
    this.els.statWins.textContent = this.state.wins;
    this.els.statGames.textContent = this.state.gamesPlayed;
  },

  async checkSession() {
    try {
      const response = await fetch(`${this.state.apiBase}/api/session`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.authenticated) {
        this.state.isAuthenticated = true;
        this.state.currentUserId = data.userId;
        this.state.currentUsername = data.username;
        this.updateAuthUI();
        this.showScreen('lobby');
        this.loadSoundSettings();
        try {
          this.initSocket();
        } catch (err) {
          console.log('Socket.io initialization failed (auth still works):', err.message);
        }
      }
    } catch (err) {
      console.log('Session check failed (server may not be running):', err.message);
    }
  },

  async login() {
    const username = this.els.loginUsername.value.trim();
    const password = this.els.loginPassword.value;

    if (!username || !password) {
      this.showError(this.els.loginError, 'Please enter username and password');
      return;
    }

    this.hideError(this.els.loginError);

    try {
      const response = await fetch(`${this.state.apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.state.isAuthenticated = true;
        this.state.currentUserId = data.user.id;
        this.state.currentUsername = data.user.username;
        this.state.playerName = data.user.username;
        this.updateAuthUI();
        try {
          this.initSocket();
        } catch (err) {
          console.log('Socket.io initialization failed (auth still works):', err.message);
        }
        await this.loadSoundSettings();
        this.showScreen('lobby');
        alert('Login successful!');
      } else {
        this.showError(this.els.loginError, data.error || 'Login failed');
      }
    } catch (err) {
      this.showError(this.els.loginError, 'Cannot connect to server. Make sure the backend is running.');
    }
  },

  async register() {
    const username = this.els.regUsername.value.trim();
    const email = this.els.regEmail.value.trim();
    const password = this.els.regPassword.value;
    const confirmPassword = this.els.regConfirmPassword.value;

    if (!username || !email || !password) {
      this.showError(this.els.registerError, 'All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      this.showError(this.els.registerError, 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      this.showError(this.els.registerError, 'Password must be at least 6 characters');
      return;
    }

    this.hideError(this.els.registerError);

    try {
      const response = await fetch(`${this.state.apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.state.isAuthenticated = true;
        this.state.currentUserId = data.user.id;
        this.state.currentUsername = data.user.username;
        this.state.playerName = data.user.username;
        this.updateAuthUI();
        try {
          this.initSocket();
        } catch (err) {
          console.log('Socket.io initialization failed (auth still works):', err.message);
        }
        await this.loadSoundSettings();
        this.showScreen('lobby');
        alert('Registration successful!');
      } else {
        this.showError(this.els.registerError, data.error || 'Registration failed');
      }
    } catch (err) {
      this.showError(this.els.registerError, 'Cannot connect to server. Make sure the backend is running.');
    }
  },

  async logout() {
    try {
      await fetch(`${this.state.apiBase}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    this.state.isAuthenticated = false;
    this.state.currentUserId = null;
    this.state.currentUsername = null;
    this.state.playerName = '';
    this.updateAuthUI();
    this.showScreen('home');
  },

  // Initialize Web Audio API context (requires user gesture)
  initAudio() {
    if (this.state.audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.state.audioContext = new AudioContext();
    }
  },

  // Ensure audio context is running (call after user gesture)
  resumeAudio() {
    if (this.state.audioContext && this.state.audioContext.state === 'suspended') {
      this.state.audioContext.resume();
    }
  },

  // Play a tone using Web Audio API
  playTone(frequency, duration, type = 'sine', volume = null) {
    if (!this.state.soundEnabled || !this.state.audioContext) return;
    this.resumeAudio();

    const vol = volume !== null ? volume : this.state.soundVolume;
    const osc = this.state.audioContext.createOscillator();
    const gain = this.state.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.state.audioContext.currentTime);
    gain.gain.setValueAtTime(vol, this.state.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.state.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.state.audioContext.destination);

    osc.start();
    osc.stop(this.state.audioContext.currentTime + duration);
  },

  // Countdown beep sound (3, 2, 1)
  playCountdownSound() {
    this.playTone(600, 0.1, 'square');
  },

  // GO sound when light turns green
  playGoSound() {
    this.playTone(1000, 0.15, 'sine');
  },

  // Winner victory sound
  playVictorySound() {
    this.initAudio();
    this.playTone(800, 0.15, 'sine');
    setTimeout(() => this.playTone(1200, 0.2, 'sine'), 100);
    setTimeout(() => this.playTone(1600, 0.3, 'sine'), 200);
  },

  // Loser/defeat sound
  playDefeatSound() {
    this.initAudio();
    this.playTone(300, 0.3, 'sawtooth');
    setTimeout(() => this.playTone(200, 0.4, 'sawtooth'), 150);
  },

  // Button click sound
  playClickSound() {
    this.playTone(400, 0.05, 'square', 0.3);
  },

  // Room ready sound
  playReadySound() {
    this.playTone(700, 0.1, 'sine');
  },

  // Toggle sound on/off
  async toggleSound() {
    this.initAudio();
    this.state.soundEnabled = !this.state.soundEnabled;
    this.els.btnSoundToggle.textContent = this.state.soundEnabled ? '🔊' : '🔇';
    this.els.soundVolume.style.display = this.state.soundEnabled ? 'block' : 'none';
    if (this.state.soundEnabled) this.playClickSound();
    await this.saveSoundSettings();
  },

  // Set volume
  async setVolume(volume) {
    this.state.soundVolume = Math.max(0, Math.min(1, volume));
    this.els.soundVolume.value = this.state.soundVolume;
    this.playClickSound();
    await this.saveSoundSettings();
  },

  // Load sound settings from API
  async loadSoundSettings() {
    try {
      const response = await fetch(`${this.state.apiBase}/api/settings/sound`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        this.state.soundEnabled = data.sound_enabled !== false;
        this.state.soundVolume = data.volume !== undefined ? data.volume : 0.7;
        this.els.btnSoundToggle.textContent = this.state.soundEnabled ? '🔊' : '🔇';
        this.els.soundVolume.value = this.state.soundVolume;
        this.els.soundVolume.style.display = this.state.soundEnabled ? 'block' : 'none';
      }
    } catch (err) {
      console.log('Load sound settings failed:', err.message);
    }
  },

  // Save sound settings to API
  async saveSoundSettings() {
    try {
      await fetch(`${this.state.apiBase}/api/settings/sound`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sound_enabled: this.state.soundEnabled,
          volume: this.state.soundVolume,
          music_enabled: this.state.musicEnabled,
          music_volume: this.state.musicVolume,
        }),
      });
    } catch (err) {
      console.log('Save sound settings failed:', err.message);
    }
  },

  // Toggle background music on/off
  async toggleMusic() {
    this.initAudio();
    this.state.musicEnabled = !this.state.musicEnabled;
    this.els.btnMusicToggle.textContent = this.state.musicEnabled ? '🎵' : '🔇';
    this.els.musicVolume.style.display = this.state.musicEnabled ? 'block' : 'none';

    if (this.state.musicEnabled) {
      this.startBgMusic();
    } else {
      this.stopBgMusic();
    }

    await this.saveSoundSettings();
  },

  // Set background music volume
  async setMusicVolume(volume) {
    this.state.musicVolume = Math.max(0, Math.min(1, volume));
    this.els.musicVolume.value = this.state.musicVolume;
    if (this.state.bgMusicGain) {
      this.state.bgMusicGain.gain.setValueAtTime(
        this.state.musicVolume,
        this.state.audioContext.currentTime
      );
    }
    await this.saveSoundSettings();
  },

  // Load sound settings including music
  async loadSoundSettings() {
    try {
      const response = await fetch(`${this.state.apiBase}/api/settings/sound`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        this.state.soundEnabled = data.sound_enabled !== false;
        this.state.soundVolume = data.volume !== undefined ? data.volume : 0.7;
        this.state.musicEnabled = data.music_enabled !== false;
        this.state.musicVolume = data.music_volume !== undefined ? data.music_volume : 0.5;

        this.els.btnSoundToggle.textContent = this.state.soundEnabled ? '🔊' : '🔇';
        this.els.soundVolume.value = this.state.soundVolume;
        this.els.soundVolume.style.display = this.state.soundEnabled ? 'block' : 'none';

        this.els.btnMusicToggle.textContent = this.state.musicEnabled ? '🎵' : '🔇';
        this.els.musicVolume.value = this.state.musicVolume;
        this.els.musicVolume.style.display = this.state.musicEnabled ? 'block' : 'none';

        if (this.state.musicEnabled && this.state.isAuthenticated) {
          this.startBgMusic();
        }
      }
    } catch (err) {
      console.log('Load sound settings failed:', err.message);
    }
  },

  // Initialize Web Audio API context
  initAudio() {
    if (this.state.audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.state.audioContext = new AudioContext();
    }
  },

  // Ensure audio context is running (call after user gesture)
  resumeAudio() {
    if (this.state.audioContext && this.state.audioContext.state === 'suspended') {
      this.state.audioContext.resume();
    }
  },

  // Start background music (arcade-style generated with Web Audio API)
  startBgMusic() {
    if (!this.state.musicEnabled) return;
    this.initAudio();
    if (!this.state.audioContext) return;
    this.resumeAudio();

    // Stop existing music if any
    this.stopBgMusic();

    const ctx = this.state.audioContext;
    const now = ctx.currentTime;

    // Create gain node for music volume control
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(this.state.musicVolume, now);
    gainNode.connect(ctx.destination);
    this.state.bgMusicGain = gainNode;

    // Arcade-style music: upbeat, energetic chiptune melody
    // Main melody notes (frequencies in Hz)
    const melody = [
      { freq: 523.25, dur: 0.4 }, // C5
      { freq: 659.25, dur: 0.4 }, // E5
      { freq: 783.99, dur: 0.4 }, // G5
      { freq: 1046.50, dur: 0.8 }, // C6
      { freq: 783.99, dur: 0.4 }, // G5
      { freq: 659.25, dur: 0.4 }, // E5
      { freq: 523.25, dur: 0.8 }, // C5
      { freq: 659.25, dur: 0.4 }, // E5
      { freq: 783.99, dur: 0.4 }, // G5
      { freq: 1046.50, dur: 0.8 }, // C6
      { freq: 1318.51, dur: 0.4 }, // E6
      { freq: 1567.98, dur: 0.4 }, // G6
      { freq: 2093.00, dur: 0.8 }, // C7
    ];

    let timeOffset = 0;
    const loopDuration = 4.0; // seconds per loop

    // Play melody with arpeggio bass
    const bassNotes = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4

    for (let cycle = 0; cycle < 10; cycle++) {
      // Bass line - plays on each cycle
      bassNotes.forEach((bassFreq, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(bassFreq, now + timeOffset + i * 0.5);
        oscGain.gain.setValueAtTime(this.state.musicVolume * 0.3, now + timeOffset + i * 0.5);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + i * 0.5 + 0.4);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now + timeOffset + i * 0.5);
        osc.stop(now + timeOffset + i * 0.5 + 0.5);
        this.state.bgMusicOscillators.push(osc);
      });

      // Melody
      melody.forEach((note, i) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + timeOffset + i * 0.2);
        oscGain.gain.setValueAtTime(this.state.musicVolume * 0.5, now + timeOffset + i * 0.2);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + i * 0.2 + note.dur);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now + timeOffset + i * 0.2);
        osc.stop(now + timeOffset + i * 0.2 + note.dur);
        this.state.bgMusicOscillators.push(osc);
      });

      timeOffset += loopDuration;
    }

    this.state.isMusicPlaying = true;
  },

  // Stop background music
  stopBgMusic() {
    if (this.state.bgMusicGain) {
      try {
        this.state.bgMusicGain.gain.cancelScheduledValues(0);
        this.state.bgMusicGain.disconnect();
      } catch (err) {
        // ignore
      }
      this.state.bgMusicGain = null;
    }
    this.state.bgMusicOscillators.forEach(osc => {
      try { osc.stop(); } catch (err) {}
    });
    this.state.bgMusicOscillators = [];
    this.state.isMusicPlaying = false;
  },

  // Exciting game start sound effect
  playGameStartSound() {
    if (!this.state.soundEnabled || !this.state.audioContext) return;
    this.resumeAudio();

    const ctx = this.state.audioContext;
    const now = ctx.currentTime;

    // Rising arpeggio fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(this.state.soundVolume * 0.4, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  },

  // Exciting winner announcement sound effect
  playWinnerSound() {
    if (!this.state.soundEnabled || !this.state.audioContext) return;
    this.resumeAudio();

    const ctx = this.state.audioContext;
    const now = ctx.currentTime;

    // Victory fanfare - ascending then triumphant
    const victoryNotes = [
      { freq: 523.25, time: 0, dur: 0.2 },
      { freq: 659.25, time: 0.15, dur: 0.2 },
      { freq: 783.99, time: 0.3, dur: 0.2 },
      { freq: 1046.50, time: 0.45, dur: 0.3 },
      { freq: 1318.51, time: 0.6, dur: 0.2 },
      { freq: 1567.98, time: 0.75, dur: 0.2 },
      { freq: 2093.00, time: 0.9, dur: 0.5 },
    ];

    victoryNotes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);
      gain.gain.setValueAtTime(this.state.soundVolume * 0.5, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  },

  updateAuthUI() {
    if (this.state.isAuthenticated) {
      this.els.authUser.textContent = this.state.currentUsername;
      this.els.authStatus.style.display = 'flex';
      this.els.btnLogout.style.display = 'inline-flex';
      this.els.btnNavLogin.style.display = 'none';
      this.els.btnNavRegister.style.display = 'none';
      if (this.state.currentUsername) {
        this.state.playerName = this.state.currentUsername;
      }
      this.els.authGate.style.display = 'none';
      this.els.roomActions.style.display = 'block';
      this.els.lobbyUserBar.style.display = 'flex';
      this.els.lobbyUsername.textContent = this.state.currentUsername || 'User';
    } else {
      this.els.authUser.textContent = '';
      this.els.authStatus.style.display = 'none';
      this.els.btnLogout.style.display = 'none';
      this.els.btnNavLogin.style.display = 'inline-block';
      this.els.btnNavRegister.style.display = 'inline-block';
      this.els.authGate.style.display = 'block';
      this.els.roomActions.style.display = 'none';
      this.els.roomInfo.style.display = 'none';
      this.els.lobbyUserBar.style.display = 'none';
    }
  },

  initSocket() {
    if (!this.state.isAuthenticated) return;

    // Disconnect existing socket if any
    if (this.state.socket) {
      try {
        this.state.socket.disconnect();
      } catch (err) {
        console.log('Socket disconnect error:', err.message);
      }
      this.state.socket = null;
    }

    try {
      this.state.socket = io(this.state.apiBase, {
        auth: { sessionID: document.cookie },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    } catch (err) {
      console.log('Socket.io client creation failed:', err.message);
      this.state.socket = null;
      return;
    }

    if (!this.state.socket) return;

    this.state.socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    this.state.socket.on('connect_error', (err) => {
      console.log('[Socket] Connection error:', err.message);
    });

    this.state.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    this.state.socket.on('room_updated', (data) => {
      this.updateRoomUI(data);
    });

    this.state.socket.on('game_started', (data) => {
      console.log('[Socket] game_started received:', data);
      // Only navigate if not already on the game screen (Player 1 started locally)
      if (this.state.screen !== 'game') {
        this.startGameFromRoom();
      }
    });

    this.state.socket.on('player_ready_update', (data) => {
      this.updatePlayerReady(data);
    });

    this.state.socket.on('player_disconnected', (data) => {
      this.els.lobbyMessage.textContent = 'Opponent left the room.';
      if (data.userId === this.state.roomPlayers[0]?.id) {
        this.els.playerName2.textContent = 'Waiting...';
        this.els.playerStatus2.textContent = 'Not Ready';
        this.els.playerStatus2.className = 'player-status waiting';
      } else if (data.userId === this.state.roomPlayers[1]?.id) {
        this.els.playerName1.textContent = 'Waiting...';
        this.els.playerStatus1.textContent = 'Not Ready';
        this.els.playerStatus1.className = 'player-status waiting';
      }
      this.state.roomPlayers = this.state.roomPlayers.filter((p) => p.id !== data.userId);
    });

    this.state.socket.on('error', (err) => {
      console.log('[Socket] Error:', err.message);
    });

    // Round started: both players show red waiting screen with countdown
    this.state.socket.on('round_started', (data) => {
      // Ignore stale events from previous rounds
      if (this.state.roundId && data.roundId && data.roundId !== this.state.roundId) {
        console.log('[Socket] Ignoring stale round_started:', data.roundId, 'vs current:', this.state.roundId);
        return;
      }
      console.log('[Socket] round_started:', data);
      this.state.currentRound = data.roundNumber;
      this.state.totalRounds = data.totalRounds;
      this.state.matchScores = { ...data.scores };
      this.state.roundId = data.roundId || this.state.roundId;
      this.state.greenTime = null;
      this.state.myReactionTime = null;
      this.state.opponentReactionTime = null;
      this.state.roundWinner = null;
      this.state.waitingForResult = false;
      this.state.countdown = 10;
      this.showWaitingScreen();
    });

    // Countdown tick: update countdown display
    this.state.socket.on('countdown_tick', (data) => {
      this.state.countdown = data.countdown;
      this.state.currentRound = data.roundNumber;
      this.updateCountdownDisplay();
      this.updateGameTimer();
    });

    // Green shown: both players see green simultaneously
    this.state.socket.on('show_green', (data) => {
      // Ignore stale events from previous rounds
      if (this.state.roundId && data.roundId && data.roundId !== this.state.roundId) {
        console.log('[Socket] Ignoring stale show_green:', data.roundId, 'vs current:', this.state.roundId);
        return;
      }
      console.log('[Socket] show_green:', data);
      this.state.greenTime = data.greenTime;
      this.state.currentRound = data.roundNumber;
      this.state.roundId = data.roundId || this.state.roundId;
      this.state.countdown = 0;
      this.clearCountdownInterval();
      this.showGreenScreen();
    });

    // Round result: show winner and reaction times
    this.state.socket.on('round_result', (data) => {
      console.log('[Socket] round_result:', data);
      this.state.currentRound = data.roundNumber;
      this.state.totalRounds = data.totalRounds;
      this.state.roundWinner = data.winner;
      this.state.myReactionTime = data.reactionTimes[this.state.myPlayerNumber] || null;
      this.state.opponentReactionTime = data.reactionTimes[this.state.myPlayerNumber === 1 ? 2 : 1] || null;
      this.state.matchScores = { ...data.scores };
      this.state.waitingForResult = true;
      this.clearCountdownInterval();
      this.showResultScreen(data);
    });

    // Match ended: show final winner
    this.state.socket.on('match_ended', (data) => {
      console.log('[Socket] match_ended:', data);
      this.state.currentRound = 5;
      this.state.totalRounds = 5;
      this.state.matchScores = { ...data.scores };
      this.state.roundWinner = data.winner;
      this.state.waitingForResult = true;
      this.clearCountdownInterval();
      this.showMatchEnded(data);
    });

    // Game ended by opponent (surrender/end game) - show server-determined result
    this.state.socket.on('game_ended', (data) => {
      console.log('[Socket] game_ended:', data);
      console.log('[Socket] Current user ID:', this.state.currentUserId);
      console.log('[Socket] Server winnerId:', data.winner);
      console.log('[Socket] Winner name:', data.winnerName);
      console.log('[Socket] Player 1 name:', data.player1Name);
      console.log('[Socket] Player 2 name:', data.player2Name);

      // Determine if CURRENT player is the winner by comparing user IDs
      const isWinner = String(data.winner) === String(this.state.currentUserId);
      console.log('[Socket] Local isWinner calculation:', isWinner);

      this.state.currentRound = this.state.totalRounds;
      this.state.matchScores = { ...data.scores };
      this.state.roundWinner = data.winner;
      this.state.waitingForResult = true;
      this.clearCountdownInterval();

      const p1Score = data.scores[1] || 0;
      const p2Score = data.scores[2] || 0;
      const isDraw = p1Score === p2Score;

      // Update player names
      this.els.finalName1.textContent = data.player1Name || 'Player 1';
      this.els.finalName2.textContent = data.player2Name || 'Player 2';

      // Update scores - both local cards and center VS display
      this.els.finalScore1.textContent = p1Score;
      this.els.finalScore2.textContent = p2Score;
      this.els.centerScore1.textContent = p1Score;
      this.els.centerScore2.textContent = p2Score;

      // Get card elements
      const card1 = this.els.finalScore1.closest('.battle-card');
      const card2 = this.els.finalScore2.closest('.battle-card');

      // Reset card classes
      card1.classList.remove('winner-card', 'loser-card');
      card2.classList.remove('winner-card', 'loser-card');

      // Hide all badges first
      this.els.winnerBadge1.style.display = 'none';
      this.els.loserBadge1.style.display = 'none';
      this.els.winnerBadge2.style.display = 'none';
      this.els.loserBadge2.style.display = 'none';

      // Hide winner announcement by default
      this.els.winnerAnnouncement.style.display = 'none';

      // Handle winner announcement
      if (isDraw) {
        // Draw - no winner
        this.els.gameoverTitle.textContent = 'DRAW!';
        this.els.gameoverMessage.textContent = 'Same score, close match.';
        this.els.gameoverTitle.style.color = 'var(--accent-yellow)';
        // No badges for draw
      } else {
        // Show winner announcement
        this.els.winnerAnnouncement.style.display = 'block';
        this.els.winnerNameDisplay.textContent = data.winnerName || 'Unknown';

        // Determine which card gets WINNER badge based on server winnerId
        const winnerPlayerNum = data.winner === data.player1Id ? 1 : data.winner === data.player2Id ? 2 : null;

        if (winnerPlayerNum === 1) {
          card1.classList.add('winner-card');
          card2.classList.add('loser-card');
          this.els.winnerBadge1.style.display = 'block';
          this.els.loserBadge2.style.display = 'block';
        } else if (winnerPlayerNum === 2) {
          card2.classList.add('winner-card');
          card1.classList.add('loser-card');
          this.els.winnerBadge2.style.display = 'block';
          this.els.loserBadge1.style.display = 'block';
        }

        // Personal result message
        if (isWinner) {
          this.els.gameoverTitle.textContent = 'YOU WIN!';
          this.els.gameoverMessage.textContent = data.reason === 'surrender' ? 'Opponent surrendered!' : 'Great reactions!';
          this.els.gameoverTitle.style.color = 'var(--accent-green)';
          try { this.playVictorySound(); } catch (e) {}
        } else {
          this.els.gameoverTitle.textContent = 'YOU LOSE';
          this.els.gameoverMessage.textContent = data.reason === 'surrender' ? 'You surrendered!' : 'Better luck next time.';
          this.els.gameoverTitle.style.color = 'var(--accent-red)';
          try { this.playDefeatSound(); } catch (e) {}
        }
      }

      this.updateStatsDisplay();
      this.showScreen('gameover');
    });

    // Game reset from server (Play Again) - synchronize both players
    this.state.socket.on('game_reset', (data) => {
      console.log('[Socket] game_reset:', data);
      this.state.roundId = data.roundId;
      this.state.currentRound = 0;
      this.state.matchScores = { 1: 0, 2: 0 };
      this.state.p1Ready = false;
      this.state.p2Ready = false;
      this.state.winner = null;
      this.state.gameEnded = false;
      this.state.roundActive = false;
      this.state.waitingForResult = false;
      this.state.greenTime = null;
      this.state.myReactionTime = null;
      this.state.opponentReactionTime = null;
      this.state.roundWinner = null;
      this.state.countdown = 10;
      this.clearCountdownInterval();
      this.resetTapZones();
      this.updateScoreDisplay();
      this.showScreen('lobby');
      this.els.lobbyMessage.textContent = 'Game reset. Ready for new round.';

      // Cleanup emote state on server reset
      this.closeEmotePicker();
      if (this.els.emoteDisplay) {
        this.els.emoteDisplay.innerHTML = '';
      }
      this.state.lastEmoteTime = 0;

      // Clear rematch state on server reset
      this.state.rematchRequested = false;
      this.state.waitingForRematch = false;
      if (this.els.btnPlayAgain) {
        this.els.btnPlayAgain.disabled = false;
        this.els.btnPlayAgain.textContent = 'PLAY AGAIN';
      }
    });

    // Rematch started by server (both players clicked Play Again) - begin new match
    this.state.socket.on('rematch_started', (data) => {
      console.log('[REMATCH] Client rematch_started received:', data);
      this.state.roundId = data.roundId;
      this.state.rematchRequested = false;
      this.state.waitingForRematch = false;
      this.state.currentRound = 0;
      this.state.matchScores = { 1: 0, 2: 0 };
      this.state.p1Ready = false;
      this.state.p2Ready = false;
      this.state.winner = null;
      this.state.gameEnded = false;
      this.state.roundActive = false;
      this.state.waitingForResult = false;
      this.state.greenTime = null;
      this.state.myReactionTime = null;
      this.state.opponentReactionTime = null;
      this.state.roundWinner = null;
      this.state.countdown = 10;

      this.clearCountdownInterval();
      this.resetTapZones();
      this.updateScoreDisplay();

      // Restore Play Again button UI
      if (this.els.btnPlayAgain) {
        this.els.btnPlayAgain.disabled = false;
        this.els.btnPlayAgain.textContent = 'PLAY AGAIN';
      }

      // Cleanup emote state
      this.closeEmotePicker();
      if (this.els.emoteDisplay) {
        this.els.emoteDisplay.innerHTML = '';
      }
      this.state.lastEmoteTime = 0;

      // Show waiting screen on the game board (red lights, waiting for green)
      console.log('[REMATCH] Client calling showWaitingScreen()');
      this.showWaitingScreen();
    });

    // Emote received from opponent
    this.state.socket.on('emote_received', (data) => {
      this.showEmote(data.playerNumber, data.emoji);
    });

    // Auto-start next round from server
    this.state.socket.on('start_next_round', (data) => {
      console.log('[Socket] start_next_round:', data);
      this.state.currentRound = data.roundNumber;
      this.state.totalRounds = data.totalRounds;
      this.state.matchScores = { ...data.scores };
      this.state.waitingForResult = false;
      this.clearCountdownInterval();
      // Auto-start next round via server
      if (this.state.socket && this.state.socket.connected) {
        this.state.socket.emit('start_round', {
          roomCode: this.state.roomCode,
          userId: this.state.currentUserId,
          roundId: this.state.roundId,
        }, (response) => {
          if (!response.success) {
            this.els.gameStatus.textContent = response.error || 'Failed to start next round';
          }
        });
      }
    });
  },

  async createRoom() {
    if (!this.state.socket) return;

    this.state.socket.emit('create_room', {
      userId: this.state.currentUserId,
      username: this.state.currentUsername,
    }, (response) => {
      if (response.success) {
        this.state.inRoom = true;
        this.state.roomCode = response.roomCode;
        this.state.myPlayerNumber = response.playerNumber;
        this.els.currentRoomCode.textContent = response.roomCode;
        this.els.roomActions.style.display = 'none';
        this.els.roomInfo.style.display = 'block';
        this.els.lobbyMessage.textContent = 'Room created. Waiting for opponent...';
        this.els.btnToggleReady.textContent = "I'm Ready";
        this.updateRoomUI({
          roomCode: response.roomCode,
          players: [{ player_number: 1, username: response.username, id: response.userId }],
          status: 'waiting',
        });
      } else {
        this.els.lobbyMessage.textContent = response.error || 'Failed to create room';
      }
    });
  },

  async joinRoom() {
    if (!this.state.socket) return;

    const roomCode = this.els.joinRoomCode.value.trim().toUpperCase();
    if (!roomCode) {
      this.els.lobbyMessage.textContent = 'Please enter a room code';
      return;
    }

    this.state.socket.emit('join_room', {
      userId: this.state.currentUserId,
      username: this.state.currentUsername,
      roomCode,
    }, (response) => {
      if (response.success) {
        this.state.inRoom = true;
        this.state.roomCode = response.roomCode;
        this.state.myPlayerNumber = response.playerNumber;
        this.els.currentRoomCode.textContent = response.roomCode;
        this.els.roomActions.style.display = 'none';
        this.els.roomInfo.style.display = 'block';
        this.els.btnToggleReady.textContent = "I'm Ready";
        this.updateRoomUI({
          roomCode: response.roomCode,
          players: response.players,
          status: response.status,
        });
      } else {
        this.els.lobbyMessage.textContent = response.error || 'Failed to join room';
      }
    });
  },

  async toggleReadyRoom() {
    if (!this.state.socket || !this.state.inRoom) return;

    const currentReady = this.els.btnToggleReady.textContent === "Not Ready";
    const newReady = !currentReady;

    this.state.socket.emit('player_ready', {
      roomCode: this.state.roomCode,
      userId: this.state.currentUserId,
      playerNumber: this.state.myPlayerNumber,
      ready: newReady,
    }, (response) => {
      if (response.success) {
        this.els.btnToggleReady.textContent = newReady ? "Not Ready" : "I'm Ready";
        this.els.btnToggleReady.classList.toggle('btn-primary', !newReady);
        this.els.btnToggleReady.classList.toggle('btn-ghost', newReady);
        if (newReady) this.playReadySound();
      }
    });
  },

  async leaveRoom() {
    if (!this.state.socket) return;

    this.state.socket.disconnect();
    this.state.socket = null;
    this.state.inRoom = false;
    this.state.roomCode = '';
    this.state.myPlayerNumber = null;
    this.state.roomPlayers = [];

    this.els.roomInfo.style.display = 'none';
    this.els.roomActions.style.display = 'block';
    this.els.lobbyMessage.textContent = 'Left the room.';
    try {
      this.initSocket();
    } catch (err) {
      console.log('Socket.io re-initialization failed:', err.message);
    }
  },

  copyRoomCode() {
    const code = this.els.currentRoomCode.textContent;
    if (!code) return;

    navigator.clipboard.writeText(code).then(() => {
      const btn = this.els.btnCopyRoomCode;
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  },

  updateRoomUI(data) {
    this.state.roomPlayers = data.players || [];

    if (data.players) {
      data.players.forEach((player) => {
        if (player.player_number === 1) {
          this.els.playerName1.textContent = player.username;
          this.els.playerStatus1.textContent = 'Waiting';
          this.els.playerStatus1.className = 'player-status waiting';
        } else if (player.player_number === 2) {
          this.els.playerName2.textContent = player.username;
          this.els.playerStatus2.textContent = 'Waiting';
          this.els.playerStatus2.className = 'player-status waiting';
        }
      });

      // Set score display names based on actual player numbers
      // so each player sees their own name under their score
      data.players.forEach((player) => {
        const isMe = player.user_id === this.state.currentUserId;
        if (player.player_number === 1) {
          this.els.scoreName1.textContent = isMe ? 'You' : player.username;
        } else if (player.player_number === 2) {
          this.els.scoreName2.textContent = isMe ? 'You' : player.username;
        }
      });
    }

    if (data.status === 'active') {
      this.els.lobbyMessage.textContent = 'Both players joined. Get ready and click Start Game!';
      this.els.btnStartGame.style.display = 'inline-block';
    } else {
      this.els.btnStartGame.style.display = 'none';
    }
  },

  updatePlayerReady(data) {
    const statusEl = data.playerNumber === 1
      ? this.els.playerStatus1
      : this.els.playerStatus2;
    statusEl.textContent = data.ready ? 'Ready' : 'Not Ready';
    statusEl.className = `player-status ${data.ready ? 'ready' : 'waiting'}`;

    if (data.playerNumber === 1) {
      this.state.p1Ready = data.ready;
    } else if (data.playerNumber === 2) {
      this.state.p2Ready = data.ready;
    }

    if (data.playerNumber === this.state.myPlayerNumber) {
      this.els.btnToggleReady.textContent = data.ready ? "Not Ready" : "I'm Ready";
      this.els.btnToggleReady.classList.toggle('btn-primary', !data.ready);
      this.els.btnToggleReady.classList.toggle('btn-ghost', data.ready);
    }
  },

  startGameButtonClicked() {
    try {
      console.log('[StartGame] Button clicked. State:', {
        inRoom: this.state.inRoom,
        socket: !!this.state.socket,
        socketConnected: this.state.socket ? this.state.socket.connected : false,
        roomPlayers: this.state.roomPlayers.length,
        p1Ready: this.state.p1Ready,
        p2Ready: this.state.p2Ready,
        roomCode: this.state.roomCode,
      });

      if (!this.state.inRoom) {
        this.els.lobbyMessage.textContent = 'You are not in a room.';
        return;
      }

      if (this.state.roomPlayers.length < 2) {
        this.els.lobbyMessage.textContent = 'Waiting for opponent to join the room.';
        return;
      }

      if (!this.state.p1Ready || !this.state.p2Ready) {
        this.els.lobbyMessage.textContent = 'Both players must be ready before starting.';
        return;
      }

      // Start game - navigate to game screen immediately
      console.log('[StartGame] Starting game and notifying opponent via Socket.io');
      this.startGameFromRoom();

      // Notify opponent via Socket.io (best effort, not blocking navigation)
      if (this.state.socket && this.state.socket.connected) {
        this.state.socket.emit('start_round', {
          roomCode: this.state.roomCode,
          userId: this.state.currentUserId,
          roundId: this.state.roundId,
        }, (response) => {
          if (!response.success) {
            console.log('[StartGame] Server rejected start:', response.error);
            this.els.lobbyMessage.textContent = response.error || 'Failed to start round';
          }
        });
      } else {
        console.log('[StartGame] Socket not connected, local start only');
      }
    } catch (err) {
      console.error('[StartGame] Error:', err.message);
      this.els.lobbyMessage.textContent = 'Error starting game: ' + err.message;
    }
  },

  startGameFromRoom() {
    try {
      // Navigate to game screen immediately
      this.state.score1 = 0;
      this.state.score2 = 0;
      this.state.timeLeft = 10;
      this.state.gameActive = true;
      this.state.roundActive = false;
      this.state.winner = null;
      this.state.gameEnded = false;
      this.state.currentRound = 0;
      this.state.matchScores = { 1: 0, 2: 0 };
      this.state.countdown = 10;

      this.updateScoreDisplay();
      this.updateGameTimer();
      this.resetTapZones();
      this.els.gameStatus.textContent = 'Get ready...';
      this.showScreen('game');

      // Always start timer
      this.state.gameInterval = setInterval(() => {
        if (!this.state.gameActive) return;
        this.state.timeLeft--;
        this.updateGameTimer();

        if (this.state.timeLeft <= 0) {
          this.state.timeLeft = 0;
          this.updateGameTimer();
          // Don't end game in room mode - server controls rounds via round_result
          if (!this.state.inRoom) {
            this.endGame(this.state.score1 > this.state.score2 ? 1 : this.state.score2 > this.state.score1 ? 2 : null);
          }
        }
      }, 1000);

      // Local fallback: start first round after 1.5s
      if (!this.state.inRoom || !this.state.socket || !this.state.socket.connected) {
        setTimeout(() => this.beginRound(), 1500);
      }
    } catch (err) {
      console.error('[startGameFromRoom] Error:', err.message);
      this.els.lobbyMessage.textContent = 'Error starting game: ' + err.message;
    }
  },

  showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  },

  hideError(element) {
    element.style.display = 'none';
  },

  // Show red waiting screen with countdown
  showWaitingScreen() {
    this.state.gameActive = true;
    this.state.roundActive = false;
    this.state.waitingForResult = false;
    this.showScreen('game');

    // Reset UI
    this.els.light1.classList.remove('ready', 'tapped');
    this.els.light2.classList.remove('ready', 'tapped');
    this.els.light1.classList.add('waiting');
    this.els.light2.classList.add('waiting');
    this.els.light1.style.background = 'var(--accent-red)';
    this.els.light2.style.background = 'var(--accent-red)';
    this.els.light1.style.opacity = '1';
    this.els.light2.style.opacity = '1';
    this.els.tapZone1.classList.remove('tap-zone-active');
    this.els.tapZone2.classList.remove('tap-zone-active');
    this.els.tapZone1.classList.add('tap-zone-disabled');
    this.els.tapZone2.classList.add('tap-zone-disabled');
    this.els.instr1.textContent = `Round ${this.state.currentRound}/${this.state.totalRounds}`;
    this.els.instr2.textContent = `Round ${this.state.currentRound}/${this.state.totalRounds}`;
    this.els.instr1.className = 'tap-instruction waiting';
    this.els.instr2.className = 'tap-instruction waiting';
    this.els.gameStatus.textContent = `Round ${this.state.currentRound}/${this.state.totalRounds} - Waiting for green...`;
    this.updateScoreDisplay();
    this.updateGameTimer();
  },

  // Show green screen - both players tap now
  showGreenScreen() {
    this.playGoSound();
    this.state.roundActive = true;
    this.state.waitingForResult = false;

    this.els.light1.classList.remove('waiting');
    this.els.light2.classList.remove('waiting');
    this.els.light1.classList.add('ready');
    this.els.light2.classList.add('ready');
    this.els.light1.style.background = 'var(--accent-green)';
    this.els.light2.style.background = 'var(--accent-green)';
    this.els.tapZone1.classList.remove('tap-zone-disabled');
    this.els.tapZone2.classList.remove('tap-zone-disabled');
    this.els.tapZone1.classList.add('tap-zone-active');
    this.els.tapZone2.classList.add('tap-zone-active');
    this.els.instr1.textContent = 'TAP NOW!';
    this.els.instr2.textContent = 'TAP NOW!';
    this.els.instr1.className = 'tap-instruction go';
    this.els.instr2.className = 'tap-instruction go';
    this.els.gameStatus.textContent = 'GREEN - TAP NOW!';
  },

  // Show round result
  showResultScreen(data) {
    this.state.roundActive = false;
    this.state.waitingForResult = false;

    // Stop timer
    if (this.state.gameInterval) {
      clearInterval(this.state.gameInterval);
      this.state.gameInterval = null;
    }

    const winner = data.winner;
    const p1Time = data.reactionTimes[1];
    const p2Time = data.reactionTimes[2];

    // Update cumulative scores (wins)
    if (winner === 1) {
      this.state.score1++;
    } else if (winner === 2) {
      this.state.score2++;
    }
    this.updateScoreDisplay();

    this.els.light1.classList.remove('ready', 'waiting');
    this.els.light2.classList.remove('ready', 'waiting');
    this.els.tapZone1.classList.remove('tap-zone-active', 'tap-zone-disabled');
    this.els.tapZone2.classList.remove('tap-zone-active', 'tap-zone-disabled');

    const p1Name = this.state.roomPlayers[0]?.username || 'Player 1';
    const p2Name = this.state.roomPlayers[1]?.username || 'Player 2';
    const isMeWinner = this.state.myPlayerNumber === winner;

    if (winner === 1) {
      this.els.light1.style.background = 'var(--accent-green)';
      this.els.light2.style.background = 'var(--text-dim)';
      this.els.gameStatus.textContent = isMeWinner ? 'You Win!' : `${p1Name} Wins!`;
      this.els.instr1.textContent = 'WINNER!';
      this.els.instr2.textContent = 'You Lost';
    } else if (winner === 2) {
      this.els.light1.style.background = 'var(--text-dim)';
      this.els.light2.style.background = 'var(--accent-green)';
      this.els.gameStatus.textContent = isMeWinner ? 'You Win!' : `${p2Name} Wins!`;
      this.els.instr1.textContent = 'You Lost';
      this.els.instr2.textContent = 'WINNER!';
    } else {
      this.els.light1.style.background = 'var(--text-dim)';
      this.els.light2.style.background = 'var(--text-dim)';
      this.els.gameStatus.textContent = data.message || 'Round Draw';
      this.els.instr1.textContent = 'No winner';
      this.els.instr2.textContent = 'No winner';
    }

    this.els.instr1.className = 'tap-instruction waiting';
    this.els.instr2.className = 'tap-instruction waiting';

    // Show reaction times immediately
    const p1Display = p1Time !== null ? `${p1Time}ms` : 'N/A';
    const p2Display = p2Time !== null ? `${p2Time}ms` : 'N/A';

    this.els.instr1.textContent = `P1: ${p1Display}`;
    this.els.instr2.textContent = `P2: ${p2Display}`;

    // Auto-start next round after 3 seconds (handled by server)
    // No client-side start_round emission needed - server is source of truth
  },

  // Clear countdown interval
  clearCountdownInterval() {
    // Countdown is server-controlled; no client interval needed
  },

  // Update countdown display
  updateCountdownDisplay() {
    if (this.state.gameStatus) {
      this.els.gameStatus.textContent = `Countdown: ${this.state.countdown}`;
    }
  },

  // Show match ended - final winner
  showMatchEnded(data) {
    this.state.roundActive = false;
    this.state.waitingForResult = false;
    this.state.gameActive = false;

    this.els.light1.classList.remove('ready', 'waiting', 'tapped');
    this.els.light2.classList.remove('ready', 'waiting', 'tapped');
    this.els.tapZone1.classList.remove('tap-zone-active', 'tap-zone-disabled');
    this.els.tapZone2.classList.remove('tap-zone-active', 'tap-zone-disabled');

    const winner = data.winner;
    const p1Score = data.scores[1] || 0;
    const p2Score = data.scores[2] || 0;

    const p1Name = this.state.roomPlayers[0]?.username || 'Player 1';
    const p2Name = this.state.roomPlayers[1]?.username || 'Player 2';
    const isMeWinner = this.state.myPlayerNumber === winner;

    this.els.gameStatus.textContent = data.message;

    if (winner === 1) {
      this.els.light1.style.background = 'var(--accent-green)';
      this.els.light2.style.background = 'var(--text-dim)';
      this.els.instr1.textContent = isMeWinner ? 'MATCH WINNER!' : `${p1Name} Wins Match!`;
      this.els.instr2.textContent = !isMeWinner ? 'Match Lost' : `${p2Name} Lost Match`;
    } else if (winner === 2) {
      this.els.light1.style.background = 'var(--text-dim)';
      this.els.light2.style.background = 'var(--accent-green)';
      this.els.instr1.textContent = !isMeWinner ? 'Match Lost' : `${p1Name} Lost Match`;
      this.els.instr2.textContent = isMeWinner ? 'MATCH WINNER!' : `${p2Name} Wins Match!`;
    } else {
      this.els.light1.style.background = 'var(--text-dim)';
      this.els.light2.style.background = 'var(--text-dim)';
      this.els.instr1.textContent = 'Match Draw';
      this.els.instr2.textContent = 'Match Draw';
    }

    this.els.instr1.className = 'tap-instruction waiting';
    this.els.instr2.className = 'tap-instruction waiting';

    // Show final scores
    this.els.score1.textContent = p1Score;
    this.els.score2.textContent = p2Score;

    // Show match result message prominently
    setTimeout(() => {
      this.els.instr1.textContent = `Final: P1 ${p1Score} - ${p2Score} P2`;
      this.els.instr2.textContent = `Round ${this.state.currentRound}/${this.state.totalRounds}`;
    }, 1500);
  },

  // Fetch and display leaderboard
  async loadLeaderboard() {
    try {
      const response = await fetch(`${this.state.apiBase}/api/leaderboard`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load leaderboard');
      }

      const rows = data.leaderboard || [];
      const tbody = this.els.leaderboardBody;
      const empty = this.els.leaderboardParent || this.els.leaderboardBody.parentElement;

      tbody.innerHTML = '';

      if (rows.length === 0) {
        document.getElementById('leaderboard-empty').style.display = 'block';
        return;
      }

      document.getElementById('leaderboard-empty').style.display = 'none';

      rows.forEach((row, index) => {
        const totalGames = row.total_games || 0;
        const winRate = totalGames > 0 ? ((row.wins / totalGames) * 100).toFixed(1) : '0.0';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="rank">${index + 1}</td>
          <td class="player-name">${row.username}</td>
          <td class="wins">${row.wins}</td>
          <td class="losses">${row.losses}</td>
          <td>${totalGames}</td>
          <td class="win-rate">${winRate}%</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Load leaderboard error:', err.message);
      alert('Failed to load leaderboard');
    }
  },

  // Fetch and display match history
  async loadMatchHistory() {
    // Show loading state
    const tbody = this.els.matchHistoryBody;
    const emptyEl = document.getElementById('match-history-empty');
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color: var(--text-dim);">Loading matches...</td></tr>';
    if (emptyEl) emptyEl.style.display = 'none';

    try {
      const response = await fetch(`${this.state.apiBase}/api/match-history`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load match history');
      }

      const rows = data.matches || [];

      tbody.innerHTML = '';

      if (rows.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        return;
      }

      if (emptyEl) emptyEl.style.display = 'none';

      const currentUserId = this.state.currentUserId;

      rows.forEach((row) => {
        const date = new Date(row.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        // Determine opponent (the player who is not the current user)
        const isCurrentUserP1 = row.player1_id === currentUserId;
        const opponentName = isCurrentUserP1 ? row.player2_name : row.player1_name;

        // Determine my reaction time based on which player I am
        const myReactionTime = isCurrentUserP1 ? row.p1_reaction_time : row.p2_reaction_time;
        const myTime = myReactionTime !== null ? `${myReactionTime}ms` : 'N/A';

        const p1Score = row.p1_score;
        const p2Score = row.p2_score;

        const resultClass = row.my_result === 'Win' ? 'result-win' : row.my_result === 'Loss' ? 'result-loss' : 'result-draw';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${date}</td>
          <td class="player-name">${opponentName}</td>
          <td class="winner">${row.winner_name || 'Draw'}</td>
          <td class="score-cell">${p1Score}</td>
          <td class="score-cell">${p2Score}</td>
          <td class="${resultClass}">${row.my_result}</td>
          <td>${myTime}</td>
          <td>${date}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Load match history error:', err.message);
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--accent-red);">Error: ${err.message}</td></tr>`;
      if (emptyEl) emptyEl.style.display = 'none';
    }
  },

  // Fetch and display player profile
  async loadProfile() {
    try {
      const response = await fetch(`${this.state.apiBase}/api/profile/me`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile');
      }

      const user = data.user;
      const stats = data.stats;

      this.els.profileUsername.textContent = user.username;
      this.els.profileEmail.textContent = user.email || '-';
      this.els.profileMemberSince.textContent = user.member_since ? new Date(user.member_since).toLocaleDateString() : '-';
      this.els.profileUserId.textContent = user.id;
      this.els.profileTotalGames.textContent = stats.total_games;
      this.els.profileWins.textContent = stats.wins;
      this.els.profileLosses.textContent = stats.losses;
      this.els.profileWinRate.textContent = stats.win_rate + '%';
      this.els.profileBestTime.textContent = stats.best_reaction_time !== null ? stats.best_reaction_time + 'ms' : '-';
    } catch (err) {
      console.error('Load profile error:', err.message);
      alert('Failed to load profile');
    }
  },
};

document.addEventListener('DOMContentLoaded', () => {
  APP.init();
});