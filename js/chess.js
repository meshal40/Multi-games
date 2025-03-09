document.addEventListener('DOMContentLoaded', function() {
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
    
    // Game settings
    let settings = {
        difficulty: 'easy',
        playerColor: 'white',
        soundEnabled: true
    };
    
    // Game state
    let board = createInitialBoard();
    let selectedPiece = null;
    let validMoves = [];
    let isPlayerTurn = true;
    let gameInProgress = false;
    
    // Initialize the board
    createChessBoard();
    
    // Set up event listeners for settings
    setupSettingsListeners();
    
    // New game button
    newGameButton.addEventListener('click', startNewGame);
    
    // Create initial board state
    function createInitialBoard() {
        const pieces = [
            'rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook',
            'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'
        ];
        
        const board = new Array(64).fill(null);
        
        // Set up black pieces
        pieces.forEach((piece, index) => {
            board[index] = { type: piece, color: 'black' };
            board[index + 8] = { type: 'pawn', color: 'black' };
        });
        
        // Set up white pieces
        pieces.forEach((piece, index) => {
            board[48 + index] = { type: 'pawn', color: 'white' };
            board[56 + index] = { type: piece, color: 'white' };
        });
        
        return board;
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
    
    // Handle clicking on a square
    function handleSquareClick(index) {
        if (!gameInProgress || !isPlayerTurn) return;
        
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
        
        // Switch turns
        isPlayerTurn = false;
        updateStatus('AI is thinking...');
        
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
        statusDisplay.textContent = message;
    }
    
    // End the game
    function endGame(result) {
        gameInProgress = false;
        
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
    
    // Set up settings button listeners
    function setupSettingsListeners() {
        // Difficulty buttons
        Object.keys(difficultyButtons).forEach(level => {
            difficultyButtons[level].addEventListener('click', () => {
                // Update active class
                Object.values(difficultyButtons).forEach(btn => btn.classList.remove('active'));
                difficultyButtons[level].classList.add('active');
                
                // Update setting
                settings.difficulty = level;
            });
        });
        
        // Color buttons
        Object.keys(colorButtons).forEach(color => {
            colorButtons[color].addEventListener('click', () => {
                // Update active class
                Object.values(colorButtons).forEach(btn => btn.classList.remove('active'));
                colorButtons[color].classList.add('active');
                
                // Update setting
                settings.playerColor = color;
            });
        });
        
        // Sound buttons
        soundButtons.on.addEventListener('click', () => {
            soundButtons.on.classList.add('active');
            soundButtons.off.classList.remove('active');
            settings.soundEnabled = true;
        });
        
        soundButtons.off.addEventListener('click', () => {
            soundButtons.off.classList.add('active');
            soundButtons.on.classList.remove('active');
            settings.soundEnabled = false;
        });
    }
    
    // Start a new game
    function startNewGame() {
        // Reset game state
        board = createInitialBoard();
        selectedPiece = null;
        validMoves = [];
        gameInProgress = true;
        
        // Reset the board
        createChessBoard();
        
        // Set player turn based on color choice
        isPlayerTurn = settings.playerColor === 'white';
        
        // Update status
        updateStatus(isPlayerTurn ? `Your turn (${settings.playerColor})` : 'AI is thinking...');
        
        // If AI starts, make a move
        if (!isPlayerTurn) {
            setTimeout(() => {
                makeAIMove();
            }, 1000);
        }
    }
});