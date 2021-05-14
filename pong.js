class Pong {
    id
    canvas
    canvasContext
    ballXSpeed
    ballYSpeed
    ballX
    ballY
    ballSize
    ballMovingDirX
    ballMovingDirY
    player1Y
    player2Y
    playerHeight
    fps
    player1Score = 0
    player2Score = 0
    scoreColor = "white"
    scoreFont = "32px Helvetica"
    playerWidth = 12
    playerXOffset = 10
    playerSpeed 
    ballInterval
    gameType
    maxScore
    isGameOver = false

    constructor(id, gameType = 2, maxScore = 1, ballXSpeed = 5, ballYSpeed = 3, ballSize = 18, fps = 60, playerHeight = 100, playerSpeed = 20) {
        this.id = id
        this.gameType = gameType
        this.maxScore = maxScore
        this.ballXSpeed = ballXSpeed
        this.ballYSpeed = ballYSpeed
        this.ballSize = ballSize
        this.fps = fps
        this.playerSpeed = playerSpeed
        this.playerHeight = playerHeight
    }

    start = () => {
        console.log("Welcome to PongJS!")
        this.canvas = document.getElementById(this.id)
        this.canvasContext = this.canvas.getContext("2d")
        this.ballX = this.canvas.width / 2 - 5 
        this.ballY = this.canvas.height / 2 - 5 
        this.player1Y = this.canvas.height / 2 - this.playerHeight / 2
        this.player2Y = this.canvas.height / 2 - this.playerHeight / 2
        this.ballMovingDirX = 1
        this.ballMovingDirY = Math.floor((Math.random() * 2) + 1)
        this.draw()

        clearInterval(this.ballInterval)
        this.ballInterval = setInterval(this.moveBall, 1000 / this.fps);

        if (this.gameType == 1)
            document.addEventListener("keydown", this.movePlayers, false);
        else if (this.gameType == 2)
            this.canvas.addEventListener("mousemove", this.followMouse, false)
    }

    restart = () => {
        this.player1Score = 0
        this.player2Score = 0
        this.isGameOver = false
        this.canvas.removeEventListener("mousedown", this.restart, false)
        this.start()
    }

    reset = () => {
        this.ballX = this.canvas.width / 2 - this.ballSize
        this.ballY = this.canvas.height / 2 - this.ballSize
        this.ballMovingDirX = !this.ballMovingDirX
        this.ballMovingDirY = Math.floor((Math.random() * 2) + 1)
    }

    draw = () => {
        const {width: canvasWidth, height: canvasHeight} = this.canvas
        const canvasWidthHalf = canvasWidth / 2
        const canvasHeightHalf = canvasHeight / 2
        const scoreY = 70

        // Canvas
        this.drawRect(0, 0, canvasWidth, canvasHeight, "black")

        // Net
        for (let i = 0; i <= this.canvas.height; i+=22) {
            this.drawRect(this.canvas.width / 2 - 1, i, 2, 15, "white")
        }

        // Ball
        this.drawBall(this.ballX, this.ballY, this.ballSize / 2, "white")

        // Left Player
        this.drawRect(this.playerXOffset, this.player1Y, this.playerWidth, this.playerHeight, "white")

        // Score
        this.writeText(canvasWidthHalf / 2, scoreY, this.player1Score, this.scoreColor, this.scoreFont)

        // Right Player
        this.drawRect(this.canvas.width - this.playerWidth - this.playerXOffset, this.player2Y, this.playerWidth, this.playerHeight, "white")


        // Score
        this.writeText(canvasWidthHalf + (canvasWidthHalf / 2), scoreY, this.player2Score, this.scoreColor, this.scoreFont)

        if (this.isGameOver) {
            this.writeText(canvasWidthHalf, canvasHeightHalf, `Player ${this.isGameOver} wins!`, "white", "32px Helvetica", true, true)
            this.writeText(canvasWidthHalf, canvasHeightHalf + 32 + 10, `Click to restart`, "white", "22px Helvetica", true, true)
            this.canvas.addEventListener("mousedown", this.restart, false)
        }
    }

    drawBall = (x, y, radius, color) => {
        const ccx = this.canvasContext
        ccx.beginPath()
        ccx.fillStyle = color
        ccx.arc(x, y, radius, 0, Math.PI * 2, false)
        ccx.fill()
    }

    drawRect = (x, y, width, height, color) => {
        const ccx = this.canvasContext
        ccx.fillStyle = color
        ccx.fillRect(x, y, width, height)
    }
    
    writeText = (x, y, text, color, font, alignCenter = false, alignMiddle = false) => {
        const ccx = this.canvasContext
        ccx.font = font
        ccx.fillStyle = color
        if (alignCenter) ccx.textAlign = "center"
        if (alignMiddle) ccx.textBaseline = "middle"
        ccx.fillText(text, x, y)
    }

    moveBall = () => {
        this.didBallHitPaddle()
        this.didBallHitTopOrBottom()

        this.ballX += this.ballMovingDirX ? this.ballXSpeed : -(this.ballXSpeed)
        if (this.ballMovingDirY) this.ballY += this.ballMovingDirY == 1 ? -(this.ballYSpeed) : this.ballYSpeed


        this.followBall()
        this.draw()
    }

    didBallHitPaddle = () => {
        const player1X = this.playerXOffset + this.playerWidth
        const player2X = this.canvas.width - this.playerWidth - this.playerXOffset
        const ballHalfSize = this.ballSize / 2
        const ballLeft = this.ballX - ballHalfSize
        const ballRight = this.ballX + ballHalfSize
        const player1YBottom = this.player1Y + this.playerHeight
        const player2YBottom = this.player2Y + this.playerHeight
        const ballSpeedMultiplier = 0.18

        if (this.ballMovingDirX) {
            if (ballRight >= player2X)
                if (this.ballY >= this.player2Y && this.ballY <= player2YBottom) {
                    this.ballMovingDirX = 0
                    const angle = this.ballY - (this.player2Y + this.playerHeight / 2)
                    this.changeBallDir(angle)
                    this.ballYSpeed = Math.abs(angle * ballSpeedMultiplier)
                } else { 
                    this.player1Score += 1
                    if (this.player1Score < this.maxScore)
                        this.reset()
                    else this.gameOver(1)
                }
        } else {
            if (ballLeft <= player1X)
                if (this.ballY >= this.player1Y && this.ballY <= player1YBottom) {
                    this.ballMovingDirX = 1
                    const angle = this.ballY - (this.player1Y + this.playerHeight / 2)
                    this.changeBallDir(angle)
                    this.ballYSpeed = Math.abs(angle * ballSpeedMultiplier)
                } else {
                    this.player2Score += 1
                    if (this.player2Score < this.maxScore)
                        this.reset()
                    else this.gameOver(2)
                }
        }
        
    }

    changeBallDir = (angle) => {
        if (this.ballMovingDirY == 1 && angle < 0) this.ballMovingDirY = 2
        else if (this.ballMovingDirY == 2 && angle > 0) this.ballMovingDirY = 1
    }

    didBallHitTopOrBottom = () => {
        const ballTop = this.ballY - this.ballSize / 2
        const ballBot = this.ballY + this.ballSize / 2
        const {height: canvasHeight} = this.canvas

        if (ballTop <= 0) this.ballMovingDirY = 2
        else if (ballBot >= canvasHeight) this.ballMovingDirY = 1
    }

    movePlayers = ({keyCode}) => {
        if(keyCode == 87 || keyCode == 83) this.movePlayer1(keyCode)
        else if(keyCode == 40 || keyCode == 38) this.movePlayer2(keyCode)
    }

    movePlayer1 = (keyCode) => {
        const playerTop = this.player1Y
        const playerBot = this.player1Y + this.playerHeight
        const {height: canvasHeight} = this.canvas

        if (keyCode == 87 && playerTop > 0) this.player1Y -= this.playerSpeed
        else if (keyCode == 83 && playerBot < canvasHeight) this.player1Y += this.playerSpeed
    }

    movePlayer2 = (keyCode) => {
        const playerTop = this.player2Y
        const playerBot = this.player2Y + this.playerHeight
        const {height: canvasHeight} = this.canvas

        if (keyCode == 38 && playerTop > 0) this.player2Y -= this.playerSpeed
        else if (keyCode == 40 && playerBot < canvasHeight) this.player2Y += this.playerSpeed
    }

    followMouse = (e) => {
        const mouseY = this.findMouse(e)
        this.player1Y = mouseY - this.playerHeight / 2
    }

    findMouse = (e) => {
        const {top} = this.canvas.getBoundingClientRect()
        const el = document.documentElement
        const y = e.y - top - el.scrollTop
        return y
    }

    followBall = () => {
        const center = this.player2Y + this.playerHeight / 2
        if (center < this.ballY - 30) {
            this.player2Y += this.ballYSpeed
        } else if (center > 30) {
            this.player2Y -= this.ballYSpeed
        }
    }

    gameOver = (winner) => {
        this.isGameOver = winner
        clearInterval(this.ballInterval)
    }
}