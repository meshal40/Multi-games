// chess.js - Professional chess game with timer functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chessBoard = document.getElementById('chess-board');
    const statusText = document.getElementById('game-status-text') || document.querySelector('.game-status');    const newGameBtn = document.getElementById('new-game') || document.querySelector('#start-game');
    const resignBtn = document.getElementById('resign');
    const playWhiteBtn = document.getElementById('play-white');
    const playBlackBtn = document.getElementById('play-black');
    const easyModeBtn = document.getElementById('easy-mode');
    const normalModeBtn = document.getElementById('normal-mode');
    const hardModeBtn = document.getElementById('hard-mode');
    const soundOnBtn = document.getElementById('sound-on');
    const soundOffBtn = document.getElementById('sound-off');
    const capturedBlack = document.getElementById('captured-black');
    const capturedWhite = document.getElementById('captured-white');
    const whiteTimer = document.getElementById('white-timer');
    const blackTimer = document.getElementById('black-timer');
    const timeMinutesInput = document.getElementById('time-minutes');
    const timeIncrementSelect = document.getElementById('time-increment');
    
    // Add board coordinates
    const boardCoordinates = document.createElement('div');
    boardCoordinates.className = 'board-coordinates';
    
    // Add file coordinates (a-h)
    for (let i = 0; i < 8; i++) {
        const fileCoord = document.createElement('div');
        fileCoord.className = 'coordinate file-coordinate';
        fileCoord.style.left = `${(i * 12.5) + 6.25}%`;
        fileCoord.textContent = String.fromCharCode(97 + i); // 'a' to 'h'
        boardCoordinates.appendChild(fileCoord);
    }
    
    // Add rank coordinates (1-8)
    for (let i = 0; i < 8; i++) {
        const rankCoord = document.createElement('div');
        rankCoord.className = 'coordinate rank-coordinate';
        rankCoord.style.top = `${(i * 12.5) + 6.25}%`;
        rankCoord.textContent = 8 - i; // '8' to '1'
        boardCoordinates.appendChild(rankCoord);
    }
    
    chessBoard.appendChild(boardCoordinates);
    
    // Game state
    let playerColor = 'white';
    let difficulty = 'easy';
    let selectedPiece = null;
    let highlightedCells = [];
    let isPlayerTurn = true;
    let gameInProgress = false;
    let capturedPieces = {
        white: [],
        black: []
    };
    let timers = {
        white: 600, // 10 minutes in seconds
        black: 600,
        increment: 0,
        active: null,
        interval: null
    };
    
    // Chess Unicode characters with shadow classes for better visibility
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
    
    // Timer functions
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    function updateTimerDisplay() {
        whiteTimer.textContent = formatTime(timers.white);
        blackTimer.textContent = formatTime(timers.black);
    }
    
    function startTimer() {
        if (timers.interval) {
            clearInterval(timers.interval);
        }
        
        timers.active = isPlayerTurn ? playerColor : (playerColor === 'white' ? 'black' : 'white');
        
        timers.interval = setInterval(() => {
            if (timers[timers.active] <= 0) {
                clearInterval(timers.interval);
                endGame(timers.active === playerColor ? 'timeout-loss' : 'timeout-win');
                return;
            }
            
            timers[timers.active]--;
            updateTimerDisplay();
        }, 1000);
    }
    
    function stopTimer() {
        if (timers.interval) {
            clearInterval(timers.interval);
            timers.interval = null;
        }
    }
    
    function switchTimer() {
        if (timers.active) {
            // Add increment if configured
            if (timers.increment > 0) {
                timers[timers.active] += timers.increment;
                updateTimerDisplay();
            }
        }
        
        stopTimer();
        
        if (gameInProgress) {
            startTimer();
        }
    }
    
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
    
    // Sound toggle
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
    
    // New game button
    newGameBtn.addEventListener('click', () => {
        // Get timer settings
        const minutes = parseInt(timeMinutesInput.value) || 10;
        const increment = parseInt(timeIncrementSelect.value) || 0;
        
        timers.white = minutes * 60;
        timers.black = minutes * 60;
        timers.increment = increment;
        
        updateTimerDisplay();
        startNewGame();
    });    
    // Resign button
    resignBtn.addEventListener('click', () => {
        if (gameInProgress) {
            endGame('resign');
        }
    });
    
    // Create the chess board
    function createBoard() {
        // Clear existing board
        while (chessBoard.firstChild) {
            chessBoard.removeChild(chessBoard.firstChild);
        }
        
        // Create 64 cells (8x8)
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                const index = row * 8 + col;
                
                // Set cell attributes
                cell.classList.add('cell');
                cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                cell.dataset.index = index;
                
                // Add piece if there is one at this position
                const pieceData = board[index];
                if (pieceData) {
                    const { piece, color } = pieceData;
                    const pieceSpan = document.createElement('span');
                    pieceSpan.className = color === 'white' ? 'white-piece' : 'black-piece';
                    pieceSpan.textContent = getPieceCharacter(piece, color);
                    cell.appendChild(pieceSpan);
                }
                
                // Add to the board
                chessBoard.appendChild(cell);
            }
        }
        
        // Add coordinates if needed
        addCoordinates();
    }

        // Get Unicode character for a chess piece
        function getPieceCharacter(piece, color) {
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
            
            return pieces[color][piece];
        }
    
            // Add board coordinates
    function addCoordinates() {
        // Implement if needed
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
            cell.classList.remove('selected', 'highlight', 'capture');
        });
        highlightedCells = [];
    }
    
    // Highlight valid moves for the selected piece
    function highlightValidMoves(index) {
        const validMoves = getValidMoves(index);
        highlightedCells = validMoves;
        
        validMoves.forEach(moveIndex => {
            const className = board[moveIndex] ? 'highlight capture' : 'highlight';
            highlightCell(moveIndex, className);
        });
    }
    
    // Get valid moves for a piece
    function getValidMoves(index) {
        const piece = board[index];
        if (!piece) return [];
        
        const { piece: pieceType, color } = piece;
        const row = Math.floor(index / 8);
        const col = index % 8;
        const validMoves = [];
        
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
                // Rook movement (horizontal and vertical)
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
                // Horizontal and vertical (rook-like)
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
                
                // Diagonals (bishop-like)
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
        const isCapture = !!targetPiece;
        
        // If there's a capture, add to captured pieces
        if (isCapture) {
            const captureColor = targetPiece.color;
            capturedPieces[captureColor].push(targetPiece);
            updateCapturedDisplay();
            
            // Play capture sound
            if (typeof playSound === 'function') {
                playSound(document.getElementById('capture-sound'));
            }
        } else {
            // Play move sound
            if (typeof playSound === 'function') {
                playSound(document.getElementById('move-sound'));
            }
        }
        
        // Move the piece
        board[toIndex] = piece;
        board[fromIndex] = null;
        
        // Update display
        updateBoard();
        
        // Check for check
        const isCheck = isKingInCheck(piece.color === 'white' ? 'black' : 'white');
        
        if (isCheck) {
            // Play check sound
            if (typeof playSound === 'function') {
                playSound(document.getElementById('check-sound'));
            }
        }
        
        // Check for game end conditions
        if (isCheckmate(piece.color === 'white' ? 'black' : 'white')) {
            endGame(piece.color === playerColor ? 'checkmate-win' : 'checkmate-loss');
            return;
        }
        
        if (isStalemate(piece.color === 'white' ? 'black' : 'white')) {
            endGame('stalemate');
            return;
        }
        
        // Switch turns
        isPlayerTurn = !isPlayerTurn;
        
        // Update status
        updateGameStatus(isCheck);
        
        // Switch timer
        switchTimer();
        
        // If it's AI's turn, make an AI move after a delay
        if (!isPlayerTurn) {
            setTimeout(makeAIMove, 1000);
        }
    }
    
    // Check if a king is in check
    function isKingInCheck(kingColor) {
        // Find king position
        let kingIndex = -1;
        for (let i = 0; i < 64; i++) {
            if (board[i] && board[i].piece === 'king' && board[i].color === kingColor) {
                kingIndex = i;
                break;
            }
        }
        
        if (kingIndex === -1) return false;
        
        // Check if any opposing piece can capture the king
        const opposingColor = kingColor === 'white' ? 'black' : 'white';
        
        for (let i = 0; i < 64; i++) {
            const piece = board[i];
            if (piece && piece.color === opposingColor) {
                const moves = getValidMoves(i);
                if (moves.includes(kingIndex)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Check for checkmate
    function isCheckmate(kingColor) {
        if (!isKingInCheck(kingColor)) return false;
        
        // Check if any move can get the king out of check
        for (let i = 0; i < 64; i++) {
            const piece = board[i];
            if (piece && piece.color === kingColor) {
                const moves = getValidMoves(i);
                
                // Try each move to see if it gets out of check
                for (const moveIndex of moves) {
                    const originalTarget = board[moveIndex];
                    
                    // Make temporary move
                    board[moveIndex] = piece;
                    board[i] = null;
                    
                    // Check if still in check
                    const stillInCheck = isKingInCheck(kingColor);
                    
                    // Undo move
                    board[i] = piece;
                    board[moveIndex] = originalTarget;
                    
                    if (!stillInCheck) {
                        return false; // Found a move that gets out of check
                    }
                }
            }
        }
        
        return true; // No move gets out of check
    }
    
    // Check for stalemate
    function isStalemate(kingColor) {
        if (isKingInCheck(kingColor)) return false;
        
        // Check if any legal move exists
        for (let i = 0; i < 64; i++) {
            const piece = board[i];
            if (piece && piece.color === kingColor) {
                const moves = getValidMoves(i);
                
                for (const moveIndex of moves) {
                    const originalTarget = board[moveIndex];
                    
                    // Make temporary move
                    board[moveIndex] = piece;
                    board[i] = null;
                    
                    // Check if move puts king in check
                    const putsInCheck = isKingInCheck(kingColor);
                    
                    // Undo move
                    board[i] = piece;
                    board[moveIndex] = originalTarget;
                    
                    if (!putsInCheck) {
                        return false; // Found a legal move
                    }
                }
            }
        }
        
        return true; // No legal moves
    }
    
    // Update the board display
    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            // Clear existing content
            cell.innerHTML = '';
            
            // Add piece if there is one
            const pieceData = board[index];
            if (pieceData) {
                const { piece, color } = pieceData;
                const pieceChar = pieces[color][piece];
                
                // Create a span with special styling for visibility
                const pieceSpan = document.createElement('span');
                pieceSpan.className = color === 'white' ? 'white-piece' : 'black-piece';
                pieceSpan.textContent = pieceChar;
                
                cell.appendChild(pieceSpan);
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
            const pieceHTML = pieces[pieceData.color][pieceData.piece];
            capturedWhite.innerHTML += pieceHTML;
        });
        
        // Add black captured pieces
        capturedPieces.black.forEach(pieceData => {
            const pieceHTML = pieces[pieceData.color][pieceData.piece];
            capturedBlack.innerHTML += pieceHTML;
        });
    }
    
    // Update game status text
    function updateGameStatus(isCheck = false) {
        if (isCheck) {
            gameStatus.textContent = `Check! ${isPlayerTurn ? 'Your' : 'AI\'s'} turn to move.`;
        } else {
            gameStatus.textContent = isPlayerTurn 
                ? 'Your turn to move. Select a piece to begin.'
                : 'AI is thinking...';
        }
    }
    
    // End the game
    function endGame(result) {
        gameInProgress = false;
        stopTimer();
        
        switch (result) {
            case 'checkmate-win':
                gameStatus.textContent = 'Checkmate! You win!';
                if (typeof playSound === 'function') {
                    playSound(document.getElementById('win-sound'));
                }
                break;
            case 'checkmate-loss':
                gameStatus.textContent = 'Checkmate! AI wins.';
                if (typeof playSound === 'function') {
                    playSound(document.getElementById('lose-sound'));
                }
                break;
            case 'stalemate':
                gameStatus.textContent = 'Stalemate! The game is a draw.';
                if (typeof playSound === 'function') {
                    playSound(document.getElementById('draw-sound'));
                }
                break;
            case 'timeout-win':
                gameStatus.textContent = 'AI ran out of time! You win!';
                if (typeof playSound === 'function') {
                    playSound(document.getElementById('win-sound'));
                }
                break;
            case 'timeout-loss':
                gameStatus.textContent = 'You ran out of time! AI wins.';
                if (typeof playSound === 'function') {
                    playSound(document.getElementById('lose-sound'));
                }
                break;
            case 'resign':
                gameStatus.textContent = 'You resigned. AI wins.';
                if (typeof playSound === 'function') {
                    playSound(document.getElementById('lose-sound'));
                }
                break;
        }
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
        
        // Choose a move based on difficulty
        let bestMove = null;
        
        if (difficulty === 'easy') {
            // Easy: just make random moves
            const validMoves = [];
            
            // Get all possible moves
            for (const pieceIndex of aiPieces) {
                const moves = getValidMoves(pieceIndex);
                
                for (const moveIndex of moves) {
                    // Check if move is legal (doesn't put king in check)
                    const piece = board[pieceIndex];
                    const originalTarget = board[moveIndex];
                    
                    // Make temporary move
                    board[moveIndex] = piece;
                    board[pieceIndex] = null;
                    
                    // Check if move is legal
                    const isLegal = !isKingInCheck(aiColor);
                    
                    // Undo move
                    board[pieceIndex] = piece;
                    board[moveIndex] = originalTarget;
                    
                    if (isLegal) {
                        validMoves.push({ from: pieceIndex, to: moveIndex });
                    }
                }
            }
            
            if (validMoves.length > 0) {
                bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            }
        } else {
            // Normal/Hard: Use more strategy
            const possibleMoves = [];
            
            // Get all possible moves
            for (const pieceIndex of aiPieces) {
                const moves = getValidMoves(pieceIndex);
                
                for (const moveIndex of moves) {
                    // Check if move is legal (doesn't put king in check)
                    const piece = board[pieceIndex];
                    const originalTarget = board[moveIndex];
                    
                    // Make temporary move
                    board[moveIndex] = piece;
                    board[pieceIndex] = null;
                    
                    // Check if move is legal
                    const isLegal = !isKingInCheck(aiColor);
                    
                    // Additional checks for better evaluation
                    let score = 0;
                    
                    if (isLegal) {
                        // Basic piece values
                        const pieceValues = {
                            pawn: 1,
                            knight: 3,
                            bishop: 3,
                            rook: 5,
                            queen: 9,
                            king: 0 // King value not used for captures
                        };
                        
                        // Capturing is good
                        if (originalTarget) {
                            score += pieceValues[originalTarget.piece];
                        }
                        
                        // Check if move gives check
                        if (isKingInCheck(playerColor)) {
                            score += 1;
                        }
                        
                        // Check if move is checkmate
                        if (isCheckmate(playerColor)) {
                            score += 100;
                        }
                        
                        // Control of center (for normal/hard)
                        if (difficulty === 'hard') {
                            const centerSquares = [27, 28, 35, 36];
                            if (centerSquares.includes(moveIndex)) {
                                score += 0.5;
                            }
                        }
                        
                        possibleMoves.push({
                            from: pieceIndex,
                            to: moveIndex,
                            score: score
                        });
                    }
                    
                    // Undo move
                    board[pieceIndex] = piece;
                    board[moveIndex] = originalTarget;
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
            if (isKingInCheck(aiColor)) {
                endGame('checkmate-win');
            } else {
                endGame('stalemate');
            }
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
        createBoard();
        updateCapturedDisplay();
        updateGameStatus();
        
        // Reset and start timer
        updateTimerDisplay();
        startTimer();
        
        // If AI starts, make a move
        if (!isPlayerTurn) {
            setTimeout(makeAIMove, 1000);
        }
    }
    
    // Initialize the game
    createBoard();
    updateTimerDisplay();
    gameStatus.textContent = 'Set up your game and click "New Game" to begin.';
});