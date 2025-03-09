       // Theme switching
       document.addEventListener('DOMContentLoaded', function() {
        const themeButton = document.getElementById('theme-button');
        
        themeButton.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            themeButton.textContent = document.body.classList.contains('light-theme') ? 'Dark Mode' : 'Light Mode';
        });
    });

    // Navigation functions
    function goHome() {
        alert("This would navigate to the homepage in the full implementation");
    }

    function goToChess() {
        alert("This would navigate to the chess game in the full implementation");
    }

    // Game Logic
    document.addEventListener('DOMContentLoaded', function() {
        // DOM Elements
        const gameBoard = document.getElementById('game-board');
        const cells = document.querySelectorAll('.cell');
        const statusText = document.getElementById('game-status-text');
        const newGameBtn = document.getElementById('new-game');
        const playerStartsBtn = document.getElementById('player-starts');
        const aiStartsBtn = document.getElementById('ai-starts');
        const easyModeBtn = document.getElementById('easy-mode');
        const normalModeBtn = document.getElementById('normal-mode');
        const hardModeBtn = document.getElementById('hard-mode');
        const soundOnBtn = document.getElementById('sound-on');
        const soundOffBtn = document.getElementById('sound-off');
        
        // Game state
        let board = Array(9).fill(null);
        let currentPlayer = 'X'; // X for player, O for AI
        let isPlayerTurn = true;
        let winner = null;
        let playerStarts = true;
        let difficulty = 'easy';
        let soundEnabled = true;
        let gameActive = true;
        let aiProcessing = false;
        
        // Sound elements
        const moveSound = document.getElementById('move-sound');
        const winSound = document.getElementById('win-sound');
        const loseSound = document.getElementById('lose-sound');
        const drawSound = document.getElementById('draw-sound');
        
        // Set up sound toggle
        soundOnBtn.addEventListener('click', () => {
            soundEnabled = true;
            soundOnBtn.classList.add('active');
            soundOffBtn.classList.remove('active');
        });
        
        soundOffBtn.addEventListener('click', () => {
            soundEnabled = false;
            soundOffBtn.classList.remove('active');
            soundOnBtn.classList.add('active');
        });
        
        // Function to play sounds
        function playSound(sound) {
            if (soundEnabled && sound.src) {
                try {
                    sound.currentTime = 0;
                    sound.play().catch(e => console.log("Sound error:", e));
                } catch (e) {
                    console.log("Error playing sound:", e);
                }
            }
        }
        
        // Set difficulty
        easyModeBtn.addEventListener('click', () => {
            difficulty = 'easy';
            easyModeBtn.classList.add('active');
            normalModeBtn.classList.remove('active');
            hardModeBtn.classList.remove('active');
        });
        
        normalModeBtn.addEventListener('click', () => {
            difficulty = 'normal';
            normalModeBtn.classList.add('active');
            easyModeBtn.classList.remove('active');
            hardModeBtn.classList.remove('active');
        });
        
        hardModeBtn.addEventListener('click', () => {
            difficulty = 'hard';
            hardModeBtn.classList.add('active');
            easyModeBtn.classList.remove('active');
            normalModeBtn.classList.remove('active');
        });
        
        // Set who starts
        playerStartsBtn.addEventListener('click', () => {
            playerStarts = true;
            playerStartsBtn.classList.add('active');
            aiStartsBtn.classList.remove('active');
        });
        
        aiStartsBtn.addEventListener('click', () => {
            playerStarts = false;
            aiStartsBtn.classList.add('active');
            playerStartsBtn.classList.remove('active');
        });
        
        // Start new game button
        newGameBtn.addEventListener('click', startNewGame);
        
        // Handle cell clicks
        gameBoard.addEventListener('click', handleCellClick);
        
        function handleCellClick(event) {
            // Guard conditions
            if (!gameActive || aiProcessing || !isPlayerTurn) return;
            
            const cell = event.target;
            if (!cell.classList.contains('cell')) return;
            
            const index = parseInt(cell.dataset.index);
            if (isNaN(index) || board[index] !== null) return;
            
            // Make player's move
            makeMove(index);
        }
        
        function makeMove(index) {
            // Update board state
            board[index] = currentPlayer;
            
            // Update the UI
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.textContent = currentPlayer;
            cell.classList.add(currentPlayer.toLowerCase());
            
            // Play move sound
            playSound(moveSound);
            
            // Check for win or draw
            if (checkWin()) {
                gameActive = false;
                if (currentPlayer === 'X') {
                    statusText.textContent = "You Win!";
                    playSound(winSound);
                } else {
                    statusText.textContent = "AI Wins!";
                    playSound(loseSound);
                }
                return;
            }
            
            if (checkDraw()) {
                gameActive = false;
                statusText.textContent = "It's a Draw!";
                playSound(drawSound);
                return;
            }
            
            // Switch player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            isPlayerTurn = currentPlayer === 'X';
            
            // Update status
            statusText.textContent = isPlayerTurn ? "Your Turn (X)" : "AI's Turn (O)";
            
            // If it's AI's turn, make AI move
            if (!isPlayerTurn) {
                aiProcessing = true;
                setTimeout(() => {
                    makeAIMove();
                    aiProcessing = false;
                }, 700);
            }
        }
        
        function makeAIMove() {
            if (!gameActive) return;
            
            const aiMove = getBestMove();
            if (aiMove !== -1) {
                makeMove(aiMove);
            }
        }
        
        function getBestMove() {
            // Get available moves
            const availableMoves = board.map((cell, index) => 
                cell === null ? index : -1
            ).filter(index => index !== -1);
            
            if (availableMoves.length === 0) return -1;
            
            // Easy mode: random move
            if (difficulty === 'easy') {
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            
            // Normal mode: mix of strategy and randomness
            if (difficulty === 'normal') {
                // 70% chance to make strategic move
                if (Math.random() < 0.7) {
                    // Check for winning move
                    const winMove = findWinningMove('O');
                    if (winMove !== -1) return winMove;
                    
                    // Block player's winning move
                    const blockMove = findWinningMove('X');
                    if (blockMove !== -1) return blockMove;
                    
                    // Take center if available
                    if (board[4] === null) return 4;
                    
                    // Take corners if available
                    const corners = [0, 2, 6, 8];
                    const availableCorners = corners.filter(corner => board[corner] === null);
                    if (availableCorners.length > 0) {
                        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
                    }
                }
                
                // Make random move
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }
            
            // Hard mode: perfect play
            // Check for winning move
            const winMove = findWinningMove('O');
            if (winMove !== -1) return winMove;
            
            // Block player's winning move
            const blockMove = findWinningMove('X');
            if (blockMove !== -1) return blockMove;
            
            // Take center if available
            if (board[4] === null) return 4;
            
            // Try to create a fork
            const forkMove = findForkMove('O');
            if (forkMove !== -1) return forkMove;
            
            // Block opponent's fork
            const blockForkMove = findForkMove('X');
            if (blockForkMove !== -1) return blockForkMove;
            
            // Take corners
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(corner => board[corner] === null);
            if (availableCorners.length > 0) {
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
            
            // Take sides
            const sides = [1, 3, 5, 7];
            const availableSides = sides.filter(side => board[side] === null);
            if (availableSides.length > 0) {
                return availableSides[Math.floor(Math.random() * availableSides.length)];
            }
            
            return -1; // No valid move found
        }
        
        function findWinningMove(player) {
            const lines = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6]             // diagonals
            ];
            
            for (const line of lines) {
                const [a, b, c] = line;
                // Check if player has two in a row with an empty cell
                if (board[a] === player && board[b] === player && board[c] === null) return c;
                if (board[a] === player && board[c] === player && board[b] === null) return b;
                if (board[b] === player && board[c] === player && board[a] === null) return a;
            }
            
            return -1; // No winning move
        }
        
        function findForkMove(player) {
            const availableMoves = board.map((cell, index) => 
                cell === null ? index : -1
            ).filter(index => index !== -1);
            
            for (const move of availableMoves) {
                // Create a test board with this move
                const testBoard = [...board];
                testBoard[move] = player;
                
                // Count potential winning moves after this move
                let winningMoves = 0;
                const lines = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                    [0, 4, 8], [2, 4, 6]             // diagonals
                ];
                
                for (const line of lines) {
                    const [a, b, c] = line;
                    
                    // Count player's markers and empty cells in this line
                    let playerCount = 0;
                    let emptyCount = 0;
                    
                    if (testBoard[a] === player) playerCount++;
                    else if (testBoard[a] === null) emptyCount++;
                    
                    if (testBoard[b] === player) playerCount++;
                    else if (testBoard[b] === null) emptyCount++;
                    
                    if (testBoard[c] === player) playerCount++;
                    else if (testBoard[c] === null) emptyCount++;
                    
                    // If there are two of player's markers and one empty cell, it's a potential win
                    if (playerCount === 2 && emptyCount === 1) {
                        winningMoves++;
                    }
                }
                
                // If there are two or more potential winning moves, it's a fork
                if (winningMoves >= 2) {
                    return move;
                }
            }
            
            return -1; // No fork move found
        }
        
        function checkWin() {
            const lines = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6]             // diagonals
            ];
            
            for (const line of lines) {
                const [a, b, c] = line;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    winner = board[a];
                    return true;
                }
            }
            
            return false;
        }
        
        function checkDraw() {
            return board.every(cell => cell !== null);
        }
        
        function startNewGame() {
            // Reset game state
            board = Array(9).fill(null);
            winner = null;
            gameActive = true;
            aiProcessing = false;
            
            // Reset board display
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x', 'o');
            });
            
            // Determine who goes first
            currentPlayer = playerStarts ? 'X' : 'O';
            isPlayerTurn = currentPlayer === 'X';
            
            // Update status display
            statusText.textContent = isPlayerTurn ? "Your Turn (X)" : "AI's Turn (O)";
            
            // If AI starts, make the first move
            if (!isPlayerTurn) {
                aiProcessing = true;
                setTimeout(() => {
                    makeAIMove();
                    aiProcessing = false;
                }, 700);
            }
        }
        
        // Initialize game
        startNewGame();
    });