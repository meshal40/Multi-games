// chess.js - Basic Chess Game Logic

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chessBoard = document.getElementById('chess-board');
    const statusText = document.getElementById('game-status-text');
    const newGameBtn = document.getElementById('new-game');
    const playWhiteBtn = document.getElementById('play-white');
    const playBlackBtn = document.getElementById('play-black');
    const easyModeBtn = document.getElementById('easy-mode');
    const normalModeBtn = document.getElementById('normal-mode');
    const hardModeBtn = document.getElementById('hard-mode');
    const capturedBlack = document.getElementById('captured-black');
    const capturedWhite = document.getElementById('captured-white');
    
    // Game state
    let playerColor = 'white';
    let difficulty = 'easy';
    let selectedPiece = null;
    let highlightedCells = [];
    let isPlayerTurn = true;
    let gameInProgress = true;
    let capturedPieces = {
        white: [],
        black: []
    };
    
    // Chess Unicode characters
    const pieces = {
        white: {
            pawn: '♙',
            rook: '♖',
            knight: '♘',
            bishop: '♗',
            queen: '♕',
            king: '♔'
        },
        black: {
            pawn: '♟',
            rook: '♜',
            knight: '♞',
            bishop: '♝',
            queen: '♛',
            king: '♚'
        }
    };
    
    // Initial board setup
    const initialBoard = [
        // Row 1 (Black back row)
        { piece: 'rook', color: 'black' },
        { piece: 'knight', color: 'black' },
        { piece: 'bishop', color: 'black' },
        { piece: 'queen', color: 'black' },
        { piece: 'king', color: 'black' },
        { piece: 'bishop', color: 'black' },
        { piece: 'knight', color: 'black' },
        { piece: 'rook', color: 'black' },
        // Row 2 (Black pawns)
        { piece: 'pawn', color: 'black' },
        { piece: 'pawn', color: 'black' },
        { piece: 'pawn', color: 'black' },
        { piece: 'pawn', color: 'black' },
        { piece: 'pawn', color: 'black' },
        { piece: 'pawn', color: 'black' },
        { piece: 'pawn', color: 'black' },
        { piece: 'pawn', color: 'black' },
        // Rows 3-6 (Empty squares)
        ...Array(32).fill(null),
        // Row 7 (White pawns)
        { piece: 'pawn', color: 'white' },
        { piece: 'pawn', color: 'white' },
        { piece: 'pawn', color: 'white' },
        { piece: 'pawn', color: 'white' },
        { piece: 'pawn', color: 'white' },
        { piece: 'pawn', color: 'white' },
        { piece: 'pawn', color: 'white' },
        { piece: 'pawn', color: 'white' },
        // Row 8 (White back row)
        { piece: 'rook', color: 'white' },
        { piece: 'knight', color: 'white' },
        { piece: 'bishop', color: 'white' },
        { piece: 'queen', color: 'white' },
        { piece: 'king', color: 'white' },
        { piece: 'bishop', color: 'white' },
        { piece: 'knight', color: 'white' },
        { piece: 'rook', color: 'white' }
    ];
    
    let board = [...initialBoard];
    
    // Set difficulty level
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
    
    // Set player color
    playWhiteBtn.addEventListener('click', () => {
        playerColor = 'white';
        playWhiteBtn.classList.add('active');
        playBlackBtn.classList.remove('active');
    });
    
    playBlackBtn.addEventListener('click', () => {
        playerColor = 'black';
        playBlackBtn.classList.add('active');
        playWhiteBtn.classList.remove('active');
    });
    
    // New game button
    newGameBtn.addEventListener('click', () => {
        startNewGame();
    });
    
    // Create the chess board
    function createBoard() {
        chessBoard.innerHTML = '';
        
        // Create 64 cells (8x8)
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                const index = row * 8 + col;
                
                // Set cell attributes
                cell.classList.add('cell');
                cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                cell.dataset.index = index;
                
                // Add rank and file labels (chess coordinates)
                if (col === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.classList.add('coordinates', 'rank');
                    rankLabel.textContent = 8 - row;
                    cell.appendChild(rankLabel);
                }
                
                if (row === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.classList.add('coordinates', 'file');
                    fileLabel.textContent = String.fromCharCode(97 + col); // 'a' to 'h'
                    cell.appendChild(fileLabel);
                }
                
                // Add piece if there is one at this position
                const pieceData = board[index];
                if (pieceData) {
                    const { piece, color } = pieceData;
                    cell.textContent = pieces[color][piece];
                }
                
                // Add click event
                cell.addEventListener('click', () => handleCellClick(index));
                
                // Add to the board
                chessBoard.appendChild(cell);
            }
        }
    }
    
    // Handle clicking on a cell
    function handleCellClick(index) {
        if (!gameInProgress || !isPlayerTurn) return;
        
        const clickedPiece = board[index];
        
        // If we already have a selected piece, try to move it
        if (selectedPiece !== null) {
            if (highlightedCells.includes(index)) {
                // Valid move - make it
                makeMove(selectedPiece, index);
            }
            
            // Clear selection whether move was made or not
            clearHighlights();
            selectedPiece = null;
            return;
        }
        
        // If no piece is selected yet, select this one if it's the player's piece
        if (clickedPiece && clickedPiece.color === playerColor) {
            selectedPiece = index;
            highlightCell(index, 'selected');
            highlightValidMoves(index);
        }
    }
    
    // Highlight a cell with a specific class
    function highlightCell(index, className) {
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        if (cell) {
            cell.classList.add(className);
        }
    }
    
    // Clear all highlights
    function clearHighlights() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('selected', 'highlight');
        });
        highlightedCells = [];
    }
    
    // Highlight valid moves for the selected piece
    function highlightValidMoves(index) {
        const validMoves = getValidMoves(index);
        highlightedCells = validMoves;
        
        validMoves.forEach(moveIndex => {
            highlightCell(moveIndex, 'highlight');
        });
    }
    
    // Get valid moves for a piece (simplified for this example)
    function getValidMoves(index) {
        const piece = board[index];
        if (!piece) return [];
        
        const { piece: pieceType, color } = piece;
        const row = Math.floor(index / 8);
        const col = index % 8;
        const validMoves = [];
        
        // Simple move generation - just for demonstration
        // In a real chess game, you'd need much more complex logic
        
        switch (pieceType) {
            case 'pawn':
                // Simplified pawn movement (no en passant, no promotion)
                const direction = color === 'white' ? -1 : 1;
                
                // Move forward one square
                const oneForward = index + direction * 8;
                if (oneForward >= 0 && oneForward < 64 && !board[oneForward]) {
                    validMoves.push(oneForward);
                    
                    // Move forward two squares from starting position
                    if ((color === 'white' && row === 6) || (color === 'black' && row === 1)) {
                        const twoForward = index + direction * 16;
                        if (!board[twoForward]) {
                            validMoves.push(twoForward);
                        }
                    }
                }
                
                // Capture diagonally
                const leftCapture = index + direction * 8 - 1;
                if (
                    leftCapture >= 0 && 
                    leftCapture < 64 && 
                    Math.floor(leftCapture / 8) === row + direction &&
                    board[leftCapture] && 
                    board[leftCapture].color !== color
                ) {
                    validMoves.push(leftCapture);
                }
                
                const rightCapture = index + direction * 8 + 1;
                if (
                    rightCapture >= 0 && 
                    rightCapture < 64 && 
                    Math.floor(rightCapture / 8) === row + direction &&
                    board[rightCapture] && 
                    board[rightCapture].color !== color
                ) {
                    validMoves.push(rightCapture);
                }
                break;
                
            case 'rook':
                // Simplified rook movement (horizontal and vertical)
                // Horizontal (left and right)
                for (let c = col - 1; c >= 0; c--) {
                    const checkIndex = row * 8 + c;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                for (let c = col + 1; c < 8; c++) {
                    const checkIndex = row * 8 + c;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                // Vertical (up and down)
                for (let r = row - 1; r >= 0; r--) {
                    const checkIndex = r * 8 + col;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                for (let r = row + 1; r < 8; r++) {
                    const checkIndex = r * 8 + col;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                break;
                
            case 'knight':
                // Knight movement (L-shape)
                const knightMoves = [
                    { r: -2, c: -1 }, { r: -2, c: 1 },
                    { r: -1, c: -2 }, { r: -1, c: 2 },
                    { r: 1, c: -2 }, { r: 1, c: 2 },
                    { r: 2, c: -1 }, { r: 2, c: 1 }
                ];
                
                for (const move of knightMoves) {
                    const newRow = row + move.r;
                    const newCol = col + move.c;
                    
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const checkIndex = newRow * 8 + newCol;
                        if (!board[checkIndex] || board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                    }
                }
                break;
                
            case 'bishop':
                // Bishop movement (diagonals)
                // Top-left diagonal
                for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
                    const checkIndex = (row - i) * 8 + (col - i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                // Top-right diagonal
                for (let i = 1; row - i >= 0 && col + i < 8; i++) {
                    const checkIndex = (row - i) * 8 + (col + i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                // Bottom-left diagonal
                for (let i = 1; row + i < 8 && col - i >= 0; i++) {
                    const checkIndex = (row + i) * 8 + (col - i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                // Bottom-right diagonal
                for (let i = 1; row + i < 8 && col + i < 8; i++) {
                    const checkIndex = (row + i) * 8 + (col + i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                break;
                
            case 'queen':
                // Queen movement (combination of rook and bishop)
                // Horizontal (left and right) - same as rook
                for (let c = col - 1; c >= 0; c--) {
                    const checkIndex = row * 8 + c;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                for (let c = col + 1; c < 8; c++) {
                    const checkIndex = row * 8 + c;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                // Vertical (up and down) - same as rook
                for (let r = row - 1; r >= 0; r--) {
                    const checkIndex = r * 8 + col;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                for (let r = row + 1; r < 8; r++) {
                    const checkIndex = r * 8 + col;
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                // Diagonals - same as bishop
                for (let i = 1; row - i >= 0 && col - i >= 0; i++) {
                    const checkIndex = (row - i) * 8 + (col - i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                for (let i = 1; row - i >= 0 && col + i < 8; i++) {
                    const checkIndex = (row - i) * 8 + (col + i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                for (let i = 1; row + i < 8 && col - i >= 0; i++) {
                    const checkIndex = (row + i) * 8 + (col - i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                
                for (let i = 1; row + i < 8 && col + i < 8; i++) {
                    const checkIndex = (row + i) * 8 + (col + i);
                    if (!board[checkIndex]) {
                        validMoves.push(checkIndex);
                    } else {
                        if (board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                        break;
                    }
                }
                break;
                
            case 'king':
                // King movement (one square in any direction)
                const kingMoves = [
                    { r: -1, c: -1 }, { r: -1, c: 0 }, { r: -1, c: 1 },
                    { r: 0, c: -1 }, { r: 0, c: 1 },
                    { r: 1, c: -1 }, { r: 1, c: 0 }, { r: 1, c: 1 }
                ];
                
                for (const move of kingMoves) {
                    const newRow = row + move.r;
                    const newCol = col + move.c;
                    
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        const checkIndex = newRow * 8 + newCol;
                        if (!board[checkIndex] || board[checkIndex].color !== color) {
                            validMoves.push(checkIndex);
                        }
                    }
                }
                break;
        }
        
        return validMoves;
    }
    
    // Make a move
    function makeMove(fromIndex, toIndex) {
        const piece = board[fromIndex];
        const targetPiece = board[toIndex];
        
        // If there's a capture, add to captured pieces
        if (targetPiece) {
            const captureColor = targetPiece.color === 'white' ? 'white' : 'black';
            capturedPieces[captureColor].push(targetPiece);
            updateCapturedDisplay();
        }
        
        // Move the piece
        board[toIndex] = piece;
        board[fromIndex] = null;
        
        // Update display
        updateBoard();
        
        // Play sound
        playMoveSound();
        
        // Check for game end conditions (simplified)
        if (targetPiece && targetPiece.piece === 'king') {
            // King was captured - game over
            gameInProgress = false;
            const winner = piece.color === playerColor ? 'player' : 'ai';
            
            if (winner === 'player') {
                statusText.textContent = "You Win!";
                playWinSound();
            } else {
                statusText.textContent = "AI Wins!";
                playLoseSound();
            }
            
            return;
        }
        
        // Switch turns
        isPlayerTurn = !isPlayerTurn;
        statusText.textContent = isPlayerTurn ? `Your Turn (${playerColor})` : `AI's Turn`;
        
        // If it's AI's turn, make an AI move after a delay
        if (!isPlayerTurn) {
            setTimeout(makeAIMove, 1000);
        }
    }
    
    // Update the board display
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            // Remove any piece that might be there
            cell.textContent = '';
            
            // Show coordinates
            if (index % 8 === 0) {
                const rankLabel = document.createElement('span');
                rankLabel.classList.add('coordinates', 'rank');
                rankLabel.textContent = 8 - Math.floor(index / 8);
                cell.appendChild(rankLabel);
            }
            
            if (Math.floor(index / 8) === 7) {
                const fileLabel = document.createElement('span');
                fileLabel.classList.add('coordinates', 'file');
                fileLabel.textContent = String.fromCharCode(97 + (index % 8)); // 'a' to 'h'
                cell.appendChild(fileLabel);
            }
            
            // Add piece if there is one
            const pieceData = board[index];
            if (pieceData) {
                const { piece, color } = pieceData;
                const pieceChar = pieces[color][piece];
                
                // Add the piece character to the cell
                cell.textContent = pieceChar;
                
                // Make sure coordinates stay visible
                if (index % 8 === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.classList.add('coordinates', 'rank');
                    rankLabel.textContent = 8 - Math.floor(index / 8);
                    cell.appendChild(rankLabel);
                }
                
                if (Math.floor(index / 8) === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.classList.add('coordinates', 'file');
                    fileLabel.textContent = String.fromCharCode(97 + (index % 8));
                    cell.appendChild(fileLabel);
                }
            }
        });
    }
    
    // Update the captured pieces display
    function updateCapturedDisplay() {
        // Clear existing displays
        capturedWhite.innerHTML = '';
        capturedBlack.innerHTML = '';
        
        // Add white captured pieces
        capturedPieces.white.forEach(pieceData => {
            const pieceChar = pieces[pieceData.color][pieceData.piece];
            capturedWhite.innerHTML += pieceChar;
        });
        
        // Add black captured pieces
        capturedPieces.black.forEach(pieceData => {
            const pieceChar = pieces[pieceData.color][pieceData.piece];
            capturedBlack.innerHTML += pieceChar;
        });
    }
    
    // Make an AI move
    function makeAIMove() {
        if (!gameInProgress || isPlayerTurn) return;
        
        const aiColor = playerColor === 'white' ? 'black' : 'white';
        const aiPieces = [];
        
        // Find all AI pieces
        for (let i = 0; i < 64; i++) {
            if (board[i] && board[i].color === aiColor) {
                aiPieces.push(i);
            }
        }
        
        if (aiPieces.length === 0) return;
        
        // Choose a random piece based on difficulty
        let pieceToMove, moves;
        let bestMove = null;
        
        if (difficulty === 'easy') {
            // Easy: just make random moves
            do {
                pieceToMove = aiPieces[Math.floor(Math.random() * aiPieces.length)];
                moves = getValidMoves(pieceToMove);
            } while (moves.length === 0 && aiPieces.length > 0);
            
            if (moves.length > 0) {
                bestMove = {
                    from: pieceToMove,
                    to: moves[Math.floor(Math.random() * moves.length)]
                };
            }
        } else {
            // Normal/Hard: Prioritize captures and check for checkmate
            const possibleMoves = [];
            
            // Get all possible moves
            for (const pieceIndex of aiPieces) {
                const validMoves = getValidMoves(pieceIndex);
                
                for (const moveIndex of validMoves) {
                    let score = 0;
                    
                    // Capturing a piece is good
                    if (board[moveIndex]) {
                        // Assign value to pieces (approximate chess piece values)
                        const pieceValues = {
                            pawn: 1,
                            knight: 3,
                            bishop: 3,
                            rook: 5,
                            queen: 9,
                            king: 100
                        };
                        
                        score += pieceValues[board[moveIndex].piece];
                    }
                    
                    possibleMoves.push({
                        from: pieceIndex,
                        to: moveIndex,
                        score: score
                    });
                }
            }
            
            if (possibleMoves.length > 0) {
                // Sort by score (highest first)
                possibleMoves.sort((a, b) => b.score - a.score);
                
                if (difficulty === 'hard') {
                    // Hard: Always choose the best move
                    bestMove = possibleMoves[0];
                } else {
                    // Normal: 70% chance to pick from top 3 moves, 30% random
                    if (Math.random() < 0.7 && possibleMoves.length >= 3) {
                        const topMoves = possibleMoves.slice(0, 3);
                        bestMove = topMoves[Math.floor(Math.random() * topMoves.length)];
                    } else {
                        bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    }
                }
            }
        }
        
        // Make the move
        if (bestMove) {
            makeMove(bestMove.from, bestMove.to);
        } else {
            // No valid moves - game should end
            gameInProgress = false;
            statusText.textContent = "Game Over - Stalemate";
            playDrawSound();
        }
    }
    
    // Start a new game
    function startNewGame() {
        // Reset the board
        board = [...initialBoard];
        
        // Reset game state
        selectedPiece = null;
        highlightedCells = [];
        capturedPieces = { white: [], black: [] };
        gameInProgress = true;
        
        // Set the starting player
        isPlayerTurn = playerColor === 'white';
        
        // Update UI
        clearHighlights();
        updateBoard();
        updateCapturedDisplay();
        statusText.textContent = isPlayerTurn ? `Your Turn (${playerColor})` : `AI's Turn`;
        
        // If AI starts, make a move
        if (!isPlayerTurn) {
            setTimeout(makeAIMove, 1000);
        }
    }
    
    // Initialize the game
    createBoard();
    startNewGame();
});