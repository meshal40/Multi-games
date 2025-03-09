document.addEventListener('DOMContentLoaded', function() {
    // Make timer functions and variables globally accessible
    window.selectedTime = 5; // Default 5 minutes
    window.settings = {
        difficulty: 'easy',
        playerColor: 'white',
        soundEnabled: true,
        timerEnabled: true
    };
    
    // DOM elements
    const chessboard = document.getElementById('chessboard');
    const statusDisplay = document.getElementById('status');
    const newGameButton = document.getElementById('new-game');
    
    // Settings buttons
    const difficultyButtons = {
        easy: document.getElementById('easy'),
        medium: document.getElementById('medium'),
        hard: document.getElementById('hard')
    };
    
    const colorButtons = {
        white: document.getElementById('white'),
        black: document.getElementById('black')
    };
    
    const soundButtons = {
        on: document.getElementById('sound-on'),
        off: document.getElementById('sound-off')
    };
    
    // Timer elements
    let playerTimerElement = document.getElementById('player-timer');
    let aiTimerElement = document.getElementById('ai-timer');
    let playerTimer = selectedTime * 60; // In seconds
    let aiTimer = selectedTime * 60;
    let playerTimerInterval, aiTimerInterval;
    
    // Initialize the dropdown if it exists in HTML
    initializeTimerDropdown();
    
    // Game state
    let board = createInitialBoard();
    let selectedPiece = null;
    let validMoves = [];
    let isPlayerTurn = true;
    let gameInProgress = false;
    let promotionPending = false;
    let pendingPromotionIndex = null;
    
    // Initialize the board
    createChessBoard();
    
    // Set up event listeners for settings
    setupSettingsListeners();
    
    // If timer elements don't exist, create them
    if (!playerTimerElement || !aiTimerElement) {
        createTimerUI();
    }
    
    // Add game info overlay and help button
    createGameInfoUI();
    
    // New game button
    newGameButton.addEventListener('click', startNewGame);
    
    // Initialize timer dropdown
    function initializeTimerDropdown() {
        const dropdown = document.getElementById('time-dropdown');
        if (!dropdown) return;
        
        const select = dropdown.querySelector('.time-dropdown-select');
        const items = dropdown.querySelectorAll('.time-dropdown-item');
        
        // Check if event listeners are already attached
        if (dropdown.hasAttribute('data-initialized')) return;
        dropdown.setAttribute('data-initialized', 'true');
        
        // Toggle dropdown
        select.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking elsewhere
        document.addEventListener('click', function() {
            dropdown.classList.remove('active');
        });
        
        // Handle item selection
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                // Get time value before updating UI
                const minutes = parseInt(item.textContent);
                
                // Update selected class
                items.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                // Update text
                select.textContent = item.textContent;
                
                // Update global time setting
                selectedTime = minutes;
                playerTimer = minutes * 60;
                aiTimer = minutes * 60;
                
                // Update timer displays
                if (playerTimerElement && aiTimerElement) {
                    playerTimerElement.textContent = formatTime(playerTimer);
                    aiTimerElement.textContent = formatTime(aiTimer);
                }
                
                // Close dropdown
                dropdown.classList.remove('active');
            });
        });
        
        // Get currently selected value
        const selectedItem = dropdown.querySelector('.time-dropdown-item.selected');
        if (selectedItem) {
            const minutes = parseInt(selectedItem.textContent);
            if (!isNaN(minutes)) {
                selectedTime = minutes;
                playerTimer = minutes * 60;
                aiTimer = minutes * 60;
            }
        }
        
        // Initialize timer toggle buttons
        const timerOn = document.getElementById('timer-on');
        const timerOff = document.getElementById('timer-off');
        const timerContainer = document.querySelector('.timer-container');
        
        if (timerOn && timerOff && timerContainer) {
            timerOn.addEventListener('click', function() {
                timerOn.classList.add('active');
                timerOff.classList.remove('active');
                settings.timerEnabled = true;
                timerContainer.style.opacity = '1';
            });
            
            timerOff.addEventListener('click', function() {
                timerOff.classList.add('active');
                timerOn.classList.remove('active');
                settings.timerEnabled = false;
                timerContainer.style.opacity = '0.5';
                stopTimers();
            });
        }
    }
    
    // Create initial board state
    function createInitialBoard() {
        const pieces = [
            'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'
        ];
        
        const board = new Array(64).fill(null);
        
        // Set up black pieces
        for (let i = 0; i < 8; i++) {
            board[i] = { type: pieces[i], color: 'black' };
            board[i + 8] = { type: 'pawn', color: 'black' };
        }
        
        // Set up white pieces
        for (let i = 0; i < 8; i++) {
            board[48 + i] = { type: 'pawn', color: 'white' };
            board[56 + i] = { type: pieces[i], color: 'white' };
        }
        
        return board;
    }
    
    // Create the timer UI with professional dropdown
    function createTimerUI() {
        console.log("Creating timer UI elements");
        
        // Check if timer elements already exist in HTML
        playerTimerElement = document.getElementById('player-timer');
        aiTimerElement = document.getElementById('ai-timer');
        
        if (playerTimerElement && aiTimerElement) {
            console.log("Timer elements found in HTML");
            return;
        }
        
        // Create timer container
        const timerContainer = document.createElement('div');
        timerContainer.classList.add('timer-container');
        
        // Create timer display flex container
        const timerFlex = document.createElement('div');
        timerFlex.classList.add('timer-flex');
        
        // Player timer display
        const playerTimerDisplay = document.createElement('div');
        playerTimerDisplay.classList.add('timer-display');
        
        const playerLabel = document.createElement('div');
        playerLabel.classList.add('timer-label');
        playerLabel.textContent = 'YOUR TIME';
        
        playerTimerElement = document.createElement('div');
        playerTimerElement.classList.add('timer-value');
        playerTimerElement.id = 'player-timer';
        playerTimerElement.textContent = formatTime(playerTimer);
        
        playerTimerDisplay.appendChild(playerLabel);
        playerTimerDisplay.appendChild(playerTimerElement);
        
        // AI timer display
        const aiTimerDisplay = document.createElement('div');
        aiTimerDisplay.classList.add('timer-display');
        
        const aiLabel = document.createElement('div');
        aiLabel.classList.add('timer-label');
        aiLabel.textContent = 'AI TIME';
        
        aiTimerElement = document.createElement('div');
        aiTimerElement.classList.add('timer-value');
        aiTimerElement.id = 'ai-timer';
        aiTimerElement.textContent = formatTime(aiTimer);
        
        aiTimerDisplay.appendChild(aiLabel);
        aiTimerDisplay.appendChild(aiTimerElement);
        
        // Add timer displays to flex container
        timerFlex.appendChild(playerTimerDisplay);
        timerFlex.appendChild(aiTimerDisplay);
        
        // Add flex container to timer container
        timerContainer.appendChild(timerFlex);
        
        // Create timer settings group
        const timerSettingsGroup = document.createElement('div');
        timerSettingsGroup.classList.add('settings-group');
        
        // Create dropdown for time selection if it doesn't exist
        if (!document.getElementById('time-dropdown')) {
            const timeDropdownContainer = document.createElement('div');
            timeDropdownContainer.classList.add('setting');
            
            const timeDropdownLabel = document.createElement('label');
            timeDropdownLabel.textContent = 'Timer (minutes):';
            timeDropdownLabel.style.fontWeight = 'bold';
            
            const timeDropdown = document.createElement('div');
            timeDropdown.classList.add('time-dropdown');
            timeDropdown.id = 'time-dropdown';
            
            const timeDropdownSelect = document.createElement('div');
            timeDropdownSelect.classList.add('time-dropdown-select');
            timeDropdownSelect.textContent = `${selectedTime} ${selectedTime === 1 ? 'minute' : 'minutes'}`;
            
            const timeDropdownList = document.createElement('ul');
            timeDropdownList.classList.add('time-dropdown-list');
            
            // Create time options (1-10 minutes)
            for (let i = 1; i <= 10; i++) {
                const listItem = document.createElement('li');
                listItem.classList.add('time-dropdown-item');
                if (i === selectedTime) {
                    listItem.classList.add('selected');
                }
                listItem.textContent = `${i} ${i === 1 ? 'minute' : 'minutes'}`;
                timeDropdownList.appendChild(listItem);
            }
            
            timeDropdown.appendChild(timeDropdownSelect);
            timeDropdown.appendChild(timeDropdownList);
            
            timeDropdownContainer.appendChild(timeDropdownLabel);
            timeDropdownContainer.appendChild(timeDropdown);
            timerSettingsGroup.appendChild(timeDropdownContainer);
        }
        
        // Create timer toggle if it doesn't exist
        if (!document.getElementById('timer-on')) {
            const timerToggleContainer = document.createElement('div');
            timerToggleContainer.classList.add('setting');
            timerToggleContainer.style.marginTop = '15px';
            
            const timerToggleLabel = document.createElement('label');
            timerToggleLabel.textContent = 'Timer:';
            timerToggleLabel.style.fontWeight = 'bold';
            
            const timerToggleOptions = document.createElement('div');
            timerToggleOptions.classList.add('options');
            
            const timerOnButton = document.createElement('button');
            timerOnButton.classList.add('option', 'active');
            timerOnButton.textContent = 'On';
            timerOnButton.id = 'timer-on';
            
            const timerOffButton = document.createElement('button');
            timerOffButton.classList.add('option');
            timerOffButton.textContent = 'Off';
            timerOffButton.id = 'timer-off';
            
            timerToggleOptions.appendChild(timerOnButton);
            timerToggleOptions.appendChild(timerOffButton);
            timerToggleContainer.appendChild(timerToggleLabel);
            timerToggleContainer.appendChild(timerToggleOptions);
            
            timerSettingsGroup.appendChild(timerToggleContainer);
        }
        
        // Add to DOM
        const gameControls = document.querySelector('.game-controls');
        const statusElement = document.querySelector('.status');
        const settingsDiv = document.querySelector('.settings');
        
        if (gameControls && statusElement) {
            gameControls.insertBefore(timerContainer, statusElement);
        }
        
        if (settingsDiv) {
            // Find the start game button
            const startButton = settingsDiv.querySelector('#new-game');
            if (startButton) {
                settingsDiv.insertBefore(timerSettingsGroup, startButton);
            } else {
                settingsDiv.appendChild(timerSettingsGroup);
            }
        }
        
        // Initialize dropdown after adding to DOM
        initializeTimerDropdown();
    }
    
    // Format time as mm:ss
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Start player timer
    function startPlayerTimer() {
        if (!settings.timerEnabled) return;
        
        stopTimers();
        if (playerTimerElement) playerTimerElement.style.color = 'red';
        if (aiTimerElement) aiTimerElement.style.color = '';
        
        playerTimerInterval = setInterval(() => {
            playerTimer--;
            if (playerTimerElement) playerTimerElement.textContent = formatTime(playerTimer);
            
            if (playerTimer <= 0) {
                clearInterval(playerTimerInterval);
                endGame('time-out-player');
            }
        }, 1000);
    }
    
    // Start AI timer
    function startAITimer() {
        if (!settings.timerEnabled) return;
        
        stopTimers();
        if (aiTimerElement) aiTimerElement.style.color = 'red';
        if (playerTimerElement) playerTimerElement.style.color = '';
        
        aiTimerInterval = setInterval(() => {
            aiTimer--;
            if (aiTimerElement) aiTimerElement.textContent = formatTime(aiTimer);
            
            if (aiTimer <= 0) {
                clearInterval(aiTimerInterval);
                endGame('time-out-ai');
            }
        }, 1000);
    }
    
    // Stop all timers
    function stopTimers() {
        clearInterval(playerTimerInterval);
        clearInterval(aiTimerInterval);
    }
    
    // Create the visual chessboard
    function createChessBoard() {
        chessboard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const squareIndex = row * 8 + col;
                const square = document.createElement('div');
                
                // Set square properties
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.index = squareIndex;
                
                // Add piece if exists
                const piece = board[squareIndex];
                if (piece) {
                    const pieceElement = createPieceElement(piece);
                    square.appendChild(pieceElement);
                }
                
                // Add click event
                square.addEventListener('click', () => handleSquareClick(squareIndex));
                
                chessboard.appendChild(square);
            }
        }
    }
    
    // Create a piece element
    function createPieceElement(piece) {
        const pieceElement = document.createElement('span');
        pieceElement.classList.add(`${piece.color}-piece`);
        pieceElement.textContent = getPieceSymbol(piece);
        return pieceElement;
    }
    
    // Get Unicode symbol for chess piece
    function getPieceSymbol(piece) {
        const symbols = {
            'white': {
                'king': '♔',
                'queen': '♕',
                'rook': '♖',
                'bishop': '♗',
                'knight': '♘',
                'pawn': '♙'
            },
            'black': {
                'king': '♚',
                'queen': '♛',
                'rook': '♜',
                'bishop': '♝',
                'knight': '♞',
                'pawn': '♟'
            }
        };
        
        return symbols[piece.color][piece.type];
    }
    
    // Show promotion dialog
    function showPromotionDialog(index) {
        // Store that we're waiting for promotion
        promotionPending = true;
        pendingPromotionIndex = index;
        
        // Create promotion dialog
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
        overlay.id = 'promotion-overlay';
        
        const dialog = document.createElement('div');
        dialog.style.backgroundColor = 'var(--card-bg, #fff)';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '8px';
        dialog.style.textAlign = 'center';
        
        const title = document.createElement('h3');
        title.textContent = 'Promote Pawn';
        dialog.appendChild(title);
        
        const options = document.createElement('div');
        options.style.display = 'flex';
        options.style.gap = '15px';
        options.style.justifyContent = 'center';
        options.style.margin = '20px 0';
        
        const pieces = ['queen', 'rook', 'bishop', 'knight'];
        const color = settings.playerColor;
        
        pieces.forEach(piece => {
            const option = document.createElement('div');
            option.style.width = '60px';
            option.style.height = '60px';
            option.style.display = 'flex';
            option.style.alignItems = 'center';
            option.style.justifyContent = 'center';
            option.style.fontSize = '48px';
            option.style.cursor = 'pointer';
            option.style.backgroundColor = '#f0d9b5';
            option.style.border = '2px solid #b58863';
            option.style.borderRadius = '5px';
            
            const pieceObj = { type: piece, color: color };
            option.textContent = getPieceSymbol(pieceObj);
            option.classList.add(`${color}-piece`);
            
            option.addEventListener('click', () => {
                promotePawn(pendingPromotionIndex, piece);
                document.body.removeChild(overlay);
            });
            
            options.appendChild(option);
        });
        
        dialog.appendChild(options);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
    
    // Promote pawn to selected piece
    function promotePawn(index, newType) {
        const pawn = board[index];
        
        // Change the pawn to the selected piece
        pawn.type = newType;
        
        // Update the board
        updateBoard();
        
        // Reset pending promotion
        promotionPending = false;
        pendingPromotionIndex = null;
        
        // Switch turns
        isPlayerTurn = false;
        updateStatus('AI is thinking...');
        startAITimer();
        
        // AI moves after a delay
        setTimeout(() => {
            makeAIMove();
        }, 1000);
    }
    
    // Handle clicking on a square
    function handleSquareClick(index) {
        if (!gameInProgress || !isPlayerTurn || promotionPending) return;
        
        const clickedPiece = board[index];
        
        // If a piece is already selected, try to move it
        if (selectedPiece !== null) {
            if (validMoves.includes(index)) {
                movePiece(selectedPiece, index);
            }
            
            // Clear selection regardless
            clearSelection();
            return;
        }
        
        // Select piece if it belongs to the player
        if (clickedPiece && clickedPiece.color === settings.playerColor) {
            selectedPiece = index;
            highlightSquare(index, 'selected');
            showValidMoves(index);
        }
    }
    
    // Highlight a square
    function highlightSquare(index, className) {
        const square = document.querySelector(`.square[data-index="${index}"]`);
        if (square) square.classList.add(className);
    }
    
    // Clear selected piece and highlights
    function clearSelection() {
        selectedPiece = null;
        
        // Remove all highlights
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'valid-capture');
        });
        
        validMoves = [];
    }
    
    // Show valid moves for a piece
    function showValidMoves(index) {
        validMoves = getValidMoves(index);
        
        validMoves.forEach(moveIndex => {
            const className = board[moveIndex] ? 'valid-capture' : 'valid-move';
            highlightSquare(moveIndex, className);
        });
    }
    
    // Get valid moves for a piece
    function getValidMoves(index) {
        const piece = board[index];
        if (!piece) return [];
        
        const validMoves = [];
        const row = Math.floor(index / 8);
        const col = index % 8;
        
        // Calculate valid moves based on piece type
        switch(piece.type) {
            case 'pawn':
                // Pawn movement implementation
                const direction = piece.color === 'white' ? -1 : 1;
                
                // Move forward
                let forwardIndex = index + (direction * 8);
                if (forwardIndex >= 0 && forwardIndex < 64 && !board[forwardIndex]) {
                    validMoves.push(forwardIndex);
                    
                    // Double move from starting position
                    if ((piece.color === 'white' && row === 6) || (piece.color === 'black' && row === 1)) {
                        const doubleForward = forwardIndex + (direction * 8);
                        if (!board[doubleForward]) {
                            validMoves.push(doubleForward);
                        }
                    }
                }
                
                // Captures
                const captureLeft = index + (direction * 8) - 1;
                if (captureLeft >= 0 && captureLeft < 64 && Math.floor(captureLeft / 8) === row + direction) {
                    if (board[captureLeft] && board[captureLeft].color !== piece.color) {
                        validMoves.push(captureLeft);
                    }
                }
                
                const captureRight = index + (direction * 8) + 1;
                if (captureRight >= 0 && captureRight < 64 && Math.floor(captureRight / 8) === row + direction) {
                    if (board[captureRight] && board[captureRight].color !== piece.color) {
                        validMoves.push(captureRight);
                    }
                }
                break;
                
            case 'rook':
                // Rook movement - horizontal and vertical
                // Check horizontally and vertically
                [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([rowDelta, colDelta]) => {
                    let r = row + rowDelta;
                    let c = col + colDelta;
                    
                    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const idx = r * 8 + c;
                        if (!board[idx]) {
                            validMoves.push(idx);
                        } else {
                            if (board[idx].color !== piece.color) {
                                validMoves.push(idx);
                            }
                            break;
                        }
                        r += rowDelta;
                        c += colDelta;
                    }
                });
                break;
                
            case 'knight':
                // Knight movement - L shape
                [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([rowDelta, colDelta]) => {
                    const r = row + rowDelta;
                    const c = col + colDelta;
                    
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const idx = r * 8 + c;
                        if (!board[idx] || board[idx].color !== piece.color) {
                            validMoves.push(idx);
                        }
                    }
                });
                break;
                
            case 'bishop':
                // Bishop movement - diagonals
                [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([rowDelta, colDelta]) => {
                    let r = row + rowDelta;
                    let c = col + colDelta;
                    
                    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const idx = r * 8 + c;
                        if (!board[idx]) {
                            validMoves.push(idx);
                        } else {
                            if (board[idx].color !== piece.color) {
                                validMoves.push(idx);
                            }
                            break;
                        }
                        r += rowDelta;
                        c += colDelta;
                    }
                });
                break;
                
            case 'queen':
                // Queen movement - combination of rook and bishop
                // Horizontal, vertical and diagonal
                [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([rowDelta, colDelta]) => {
                    let r = row + rowDelta;
                    let c = col + colDelta;
                    
                    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const idx = r * 8 + c;
                        if (!board[idx]) {
                            validMoves.push(idx);
                        } else {
                            if (board[idx].color !== piece.color) {
                                validMoves.push(idx);
                            }
                            break;
                        }
                        r += rowDelta;
                        c += colDelta;
                    }
                });
                break;
                
            case 'king':
                // King movement - one square in any direction
                [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([rowDelta, colDelta]) => {
                    const r = row + rowDelta;
                    const c = col + colDelta;
                    
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        const idx = r * 8 + c;
                        if (!board[idx] || board[idx].color !== piece.color) {
                            validMoves.push(idx);
                        }
                    }
                });
                break;
        }
        
        return validMoves;
    }
    
    // Move a piece
    function movePiece(fromIndex, toIndex) {
        const piece = board[fromIndex];
        const capturedPiece = board[toIndex];
        
        // Execute move
        board[toIndex] = piece;
        board[fromIndex] = null;
        
        // Update the board visually
        updateBoard();
        
        // Play sound
        if (settings.soundEnabled) {
            const sound = capturedPiece ? 'capture-sound' : 'move-sound';
            playSound(sound);
        }
        
        // Check for pawn promotion (player's pawn)
        if (piece.type === 'pawn' && piece.color === settings.playerColor) {
            const row = Math.floor(toIndex / 8);
            // White pawns promote at row 0, black pawns at row 7
            if ((piece.color === 'white' && row === 0) || (piece.color === 'black' && row === 7)) {
                // Show promotion dialog
                showPromotionDialog(toIndex);
                return; // Return early, we'll continue the game after promotion
            }
        }
        
        // Switch turns
        isPlayerTurn = false;
        updateStatus('AI is thinking...');
        startAITimer();
        
        // AI moves after a delay
        setTimeout(() => {
            makeAIMove();
        }, 1000);
    }
    
    // Make AI move
    function makeAIMove() {
        if (!gameInProgress || isPlayerTurn) return;
        
        const aiColor = settings.playerColor === 'white' ? 'black' : 'white';
        const aiPieces = [];
        
        // Find all AI pieces
        board.forEach((piece, index) => {
            if (piece && piece.color === aiColor) {
                aiPieces.push(index);
            }
        });
        
        // No pieces left - game over
        if (aiPieces.length === 0) {
            endGame('player-wins');
            return;
        }
        
        // Choose a piece to move based on difficulty
        let moveFrom, moveTo;
        
        if (settings.difficulty === 'easy') {
            // Random move
            const randomPieces = shuffleArray([...aiPieces]);
            
            for (const pieceIndex of randomPieces) {
                const moves = getValidMoves(pieceIndex);
                
                if (moves.length > 0) {
                    moveFrom = pieceIndex;
                    moveTo = moves[Math.floor(Math.random() * moves.length)];
                    break;
                }
            }
        } else {
            // More strategic move for medium/hard
            const allMoves = [];
            
            // Calculate all possible moves
            for (const pieceIndex of aiPieces) {
                const moves = getValidMoves(pieceIndex);
                
                for (const moveIndex of moves) {
                    // Calculate move value
                    let value = 0;
                    
                    // Capturing pieces is good
                    if (board[moveIndex]) {
                        const pieceValues = {
                            'pawn': 1,
                            'knight': 3,
                            'bishop': 3,
                            'rook': 5,
                            'queen': 9,
                            'king': 0 // Not for evaluation
                        };
                        
                        value += pieceValues[board[moveIndex].type];
                    }
                    
                    // Control center for hard difficulty
                    if (settings.difficulty === 'hard') {
                        // Center squares
                        const centerSquares = [27, 28, 35, 36];
                        if (centerSquares.includes(moveIndex)) {
                            value += 0.5;
                        }
                    }
                    
                    allMoves.push({
                        from: pieceIndex,
                        to: moveIndex,
                        value: value
                    });
                }
            }
            
            if (allMoves.length > 0) {
                // Sort by value
                allMoves.sort((a, b) => b.value - a.value);
                
                if (settings.difficulty === 'hard') {
                    // Always pick the best move
                    moveFrom = allMoves[0].from;
                    moveTo = allMoves[0].to;
                } else {
                    // Medium - 70% chance for a top move, 30% chance for random
                    if (Math.random() < 0.7 && allMoves.length >= 3) {
                        const topMoves = allMoves.slice(0, 3);
                        const randomTopMove = topMoves[Math.floor(Math.random() * topMoves.length)];
                        moveFrom = randomTopMove.from;
                        moveTo = randomTopMove.to;
                    } else {
                        const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
                        moveFrom = randomMove.from;
                        moveTo = randomMove.to;
                    }
                }
            }
        }
        
        // Execute AI move
        if (moveFrom !== undefined && moveTo !== undefined) {
            const capturedPiece = board[moveTo];
            
            // Execute move
            board[moveTo] = board[moveFrom];
            board[moveFrom] = null;
            
            // Check for AI pawn promotion
            if (board[moveTo].type === 'pawn') {
                const row = Math.floor(moveTo / 8);
                // White pawns promote at row 0, black pawns at row 7
                if ((board[moveTo].color === 'white' && row === 0) || (board[moveTo].color === 'black' && row === 7)) {
                    // AI always promotes to queen
                    board[moveTo].type = 'queen';
                }
            }
            
            // Update the board visually
            updateBoard();
            
            // Play sound
            if (settings.soundEnabled) {
                const sound = capturedPiece ? 'capture-sound' : 'move-sound';
                playSound(sound);
            }
            
            // Check if player king is captured
            if (capturedPiece && capturedPiece.type === 'king') {
                endGame('ai-wins');
                return;
            }
            
            // Switch back to player's turn
            isPlayerTurn = true;
            updateStatus(`Your turn (${settings.playerColor})`);
            startPlayerTimer();
        } else {
            // No valid moves - draw
            endGame('draw');
        }
    }
    
    // Update the visual board
    function updateBoard() {
        document.querySelectorAll('.square').forEach((square, index) => {
            // Clear square
            square.innerHTML = '';
            
            // Add piece if exists
            const piece = board[index];
            if (piece) {
                const pieceElement = createPieceElement(piece);
                square.appendChild(pieceElement);
            }
        });
    }
    
    // Update game status text
    function updateStatus(message) {
        if (statusDisplay) {
            // Replace curly apostrophes with straight ones
            message = message.replace(/'/g, "'");
            statusDisplay.textContent = message;
        } else {
            console.error("Status display element not found");
        }
    }
    
    // End the game
    function endGame(result) {
        gameInProgress = false;
        stopTimers();
        
        switch(result) {
            case 'player-wins':
                updateStatus('You win! The AI has no moves left.');
                break;
            case 'ai-wins':
                updateStatus('AI wins! Your king has been captured.');
                break;
            case 'draw':
                updateStatus('Game drawn! No valid moves remain.');
                break;
            case 'time-out-player':
                updateStatus('Time\'s up! You lost on time.');
                break;
            case 'time-out-ai':
                updateStatus('AI\'s time is up! You win on time.');
                break;
        }
    }
    
    // Play a sound
    function playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Sound error:", e));
        }
    }
    
    // Shuffle array (for random AI moves)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Add game info overlay and help button
    function createGameInfoUI() {
        // Check if the help button already exists
        if (document.querySelector('.help-button')) return;
        
        // Create help button
        const helpButton = document.createElement('button');
        helpButton.textContent = '?';
        helpButton.classList.add('help-button');
        helpButton.style.position = 'absolute';
        helpButton.style.top = '10px';
        helpButton.style.right = '10px';
        helpButton.style.borderRadius = '50%';
        helpButton.style.width = '30px';
        helpButton.style.height = '30px';
        helpButton.style.border = 'none';
        helpButton.style.backgroundColor = '#4a90e2';
        helpButton.style.color = 'white';
        helpButton.style.fontSize = '18px';
        helpButton.style.cursor = 'pointer';
        
        helpButton.addEventListener('click', showGameInfo);
        
        document.querySelector('.game-container').appendChild(helpButton);
    }
    
    // Show game info
    function showGameInfo() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
        
        const infoBox = document.createElement('div');
        infoBox.style.backgroundColor = 'var(--card-bg, #fff)';
        infoBox.style.padding = '30px';
        infoBox.style.borderRadius = '8px';
        infoBox.style.maxWidth = '600px';
        infoBox.style.maxHeight = '80vh';
        infoBox.style.overflowY = 'auto';
        
        const title = document.createElement('h2');
        title.textContent = 'Chess Game Help';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        
        const content = document.createElement('div');
        content.innerHTML = `
            <h3>How to Play</h3>
            <p>Select a piece by clicking on it, then click on a highlighted square to move.</p>
            
            <h3>Game Features</h3>
            <ul>
                <li><strong>Timer:</strong> Set a time limit from 1-10 minutes per player. When your timer runs out, you lose.</li>
                <li><strong>Difficulty Levels:</strong>
                    <ul>
                        <li><strong>Easy:</strong> AI makes random moves.</li>
                        <li><strong>Medium:</strong> AI makes smarter moves but occasionally makes mistakes.</li>
                        <li><strong>Hard:</strong> AI plays at a stronger level, focusing on controlling the center and capturing pieces.</li>
                    </ul>
                </li>
                <li><strong>Pawn Promotion:</strong> When your pawn reaches the opposite end of the board, you can promote it to a queen, rook, bishop, or knight.</li>
            </ul>
            
            <h3>Piece Movements</h3>
            <ul>
                <li><strong>Pawn:</strong> Moves forward one square (or two from starting position). Captures diagonally.</li>
                <li><strong>Rook:</strong> Moves horizontally or vertically any number of squares.</li>
                <li><strong>Knight:</strong> Moves in an L-shape (two squares in one direction, then one square perpendicular).</li>
                <li><strong>Bishop:</strong> Moves diagonally any number of squares.</li>
                <li><strong>Queen:</strong> Combines the power of a rook and bishop.</li>
                <li><strong>King:</strong> Moves one square in any direction.</li>
            </ul>
        `;
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.display = 'block';
        closeButton.style.margin = '20px auto 0';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#4a90e2';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        infoBox.appendChild(title);
        infoBox.appendChild(content);
        infoBox.appendChild(closeButton);
        overlay.appendChild(infoBox);
        document.body.appendChild(overlay);
    }
    
    // Start a new game with improved functionality
    function startNewGame() {
        console.log("Starting new game...");
        
        // Reset the game state
        board = createInitialBoard();
        selectedPiece = null;
        validMoves = [];
        gameInProgress = true;
        
        // Reset timers
        playerTimer = selectedTime * 60;
        aiTimer = selectedTime * 60;
        
        if (playerTimerElement && aiTimerElement) {
            playerTimerElement.textContent = formatTime(playerTimer);
            aiTimerElement.textContent = formatTime(aiTimer);
            playerTimerElement.style.color = '';
            aiTimerElement.style.color = '';
        } else {
            console.log("Timer elements not found, recreating timer UI");
            createTimerUI();
        }
        
        stopTimers();
        
        // Reset the board
        createChessBoard();
        
        // Set player turn based on color choice
        isPlayerTurn = settings.playerColor === 'white';
        
        // Update status
        updateStatus(isPlayerTurn ? `Your turn (${settings.playerColor})` : 'AI is thinking...');
        
        // Start appropriate timer
        if (settings.timerEnabled) {
            if (isPlayerTurn) {
                startPlayerTimer();
            } else {
                startAITimer();
            }
        }
        
        // If AI starts, make a move
        if (!isPlayerTurn) {
            setTimeout(() => makeAIMove(), 1000);
        }
        
        console.log("Game started successfully");
    }
    
    // Initialize game function
    function initializeGame() {
        console.log("Initializing game...");
        
        // Check if board has been created properly
        if (document.querySelectorAll('#chessboard .square').length === 0) {
            console.log("Creating chess board...");
            createChessBoard();
        }
        
        // Make sure the timer dropdown is working
        initializeTimerDropdown();
        
        // Make sure the start game button has the correct event listener
        const startButton = document.getElementById('new-game');
        if (startButton) {
            console.log("Adding event listener to start button");
            
            // Remove any existing event listeners (to prevent duplicates)
            const newStartButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newStartButton, startButton);
            
            // Add the event listener
            newStartButton.addEventListener('click', startNewGame);
        } else {
            console.error("Start game button not found");
        }
    }
    
    // Auto-initialize after page load
    setTimeout(initializeGame, 300);
});