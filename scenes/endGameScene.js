class EndGameScene extends Phaser.Scene {
    constructor(){
        super('endGame');
    }
    
    init(data){
        this.score = data.totalScore;
    }
        
    preload(){
        this.load.image('endImage','assets/images/game-end.jpeg');
        this.load.image('start', 'assets/images/play-now.png')

    }
    create(){
        this.add.image(400,300,'endImage').setScale(0.65);
        this.add.text(180,50, 'Your Score : ' + this.score, {fontSize : 40})
        this.startbtn = this.add.image(400,550 , 'start');
        this.startbtn.setInteractive() ;
        this.startbtn.on('pointerdown',this.startGame,this);
    }
    startGame() {
        this.scene.start('Play');
    }

}