class PlayGameScene extends Phaser.Scene {
  constructor() {
    super('Play');
    this.score = 0;
  }

  preload() {
    //'sky' is the key that identifies image at later stage and second part is the url of image
    this.load.image(
      "sky",
      "https://images.unsplash.com/photo-1435224668334-0f82ec57b605?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=750&q=80"
    );
    this.load.image("bomb", "/assets/images/bomb.png");
    this.load.image("jet", "/assets/images/jet.png");
    this.load.image("ammo", "/assets/images/ammo.png");
    this.load.image("coin", "/assets/images/coin.png");
    this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.audio("gunShot", "assets/audio/gunshot.wav");
    this.load.audio("coinhit", "assets/audio/coinhit.wav");
    this.load.audio("endmusic", "assets/audio/end.mp3");
  }
  create() {
    // var sky,bombs,jet,coin,ammo,explosion , gunShot, coins,coinhit,endmusic;
    // var score = 0;
    // var scoreText;
    // var endGame = false;
    //tilesprite instead of image makes the image move
    this.sky = this.add
      .tileSprite(390, 280, config.width, config.height, "sky")
      .setScale(1.1);
    //bombs = this.add.image(400,300,'bombs');
    //jet is added as physics body since it has to move
    this.jet = this.physics.add.image(400, 500, "jet").setScale(0.15);
    //jet will not cross screen boundaries
    this.jet.setCollideWorldBounds(true);

    //for keyboard keys to move jet
    this.cursors = this.input.keyboard.createCursorKeys();
    //to call function shoot on mouse touch
    this.input.on("pointerdown", this.shoot, this);
    //create group of bombs
    this.bombs = this.physics.add.group({
      //image name is key
      key: "bomb",
      //total 4 bombs will be present
      repeat: 3,
      setXY: {
        //x,y is the position of first bombs
        //stepX stepY is the difference between consecutive bombs
        x: 20,
        y: 50,
        stepX: Phaser.Math.Between(10, config.width - 15),
        stepY: Phaser.Math.Between(0, config.height - 15),
      },
    });
    //create a group of coins
    this.coins = this.physics.add.group();

    for (let i = 0; i < 15; i++) {
      let x = Phaser.Math.Between(0, config.width - 15);
      let y = Phaser.Math.Between(0, 200);
      let newCoin = this.coins.create(x, y, "coin");
      // newCoin.setVelocityY(150);
    }
    this.setObjVelocity(this.coins);
    this.setObjVelocity(this.bombs);
    //to use animation
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion"),
      frameRate: 20,
      //when bullet touches bomb then animation is played but a mark remains on the screen , to remove it we use hide on complete
      hideOnComplete: true,
    });

    this.gunShot = this.sound.add("gunShot");
    this.coinhit = this.sound.add("coinhit", { volume: 0.7 });
    this.endmusic = this.sound.add("endmusic", { volume: 0.1 });
    this.physics.add.collider(this.jet, this.coins, this.collectCoins, null, this);
    this.physics.add.collider(this.jet, this.bombs, this.gameOver, null, this);
    this.scoreText = this.add.text(15, 15, "Score : 0", {
      fontSize: 26,
      fill: "green",
    });
  }
   gameOver(jet,bombs){
    this.physics.pause();
    //to change colour of jet to red after collision
    this.jet.setTint(0xff0000);
    this.endmusic.play();
    this.endGame = true;
    
}

collectCoins(jet,coin){
    coin.disableBody(true,true);
    this.coinhit.play();
    let x = Phaser.Math.Between(15,config.width-15);
    coin.enableBody(true,x,0,true,true);
    let xVel = Phaser.Math.Between(-100,100);
    let yVel = Phaser.Math.Between(150,200);
    coin.setVelocity(xVel,yVel);
    this.score += 5;
    this.scoreText.setText('Score : '+ this.score);
}
 setObjVelocity(bombs){
    bombs.children.iterate(function(bomb){
        let xVel = Phaser.Math.Between(-100,100);
        let yVel = Phaser.Math.Between(150,200);
        bomb.setVelocity(xVel,yVel);
    })
}

//to release bullet
shoot(){
   this.ammo = this.physics.add.image(this.jet.x,this.jet.y-30,'ammo');
    this.ammo.setRotation(-Phaser.Math.PI2/4);
    this.ammo.setScale(0.15);
    this.ammo.setVelocityY(-500);
    this.physics.add.collider(this.ammo,this.bombs,this.destroyBomb, null, this);
}
//to destroy bomb when bullet touches bomb
destroyBomb(ammo,bomb){
    //setscale is used to scale up the explosion(animation ) size
    this.explosion = this.add.sprite(bomb.x,bomb.y, 'explosion').setScale(3);
    //plays the anime named 'explode' created above already
    this.explosion.play('explode');
    //destroys bombs and bullets
    this.gunShot.play();
    bomb.disableBody(true,true);
    ammo.disableBody(true,true);
    //whenever a bomb touches a bullet it is disabled hence number of bombs get decreased with time so whenever a bomb is disabled we have to enable another one
    //enablebody() parameters : 1 reset the bombs 2. set x 3.set y 4. enable bomb 5.unhide bomb
    let x = Phaser.Math.Between(15,config.width-15);
    bomb.enableBody(true,x,0,true,true);
    let xVel = Phaser.Math.Between(-100,100);
    let yVel = Phaser.Math.Between(150,200);
    bomb.setVelocity(xVel,yVel);
    
    this.score += 10 ;
    this.scoreText.setText('Score : '+ this.score);
}

  update(){

    if(this.endGame && !this.endmusic.isPlaying){
      this.scene.start('endGame',{totalScore : this.score});
      this.endGame = false;
      this.score = 0;
    }
   this.sky.tilePositionY -= 0.5;
    if(this.cursors.left.isDown){
        this.jet.setVelocityX(-300);
    }
    else if(this.cursors.right.isDown){
        this.jet.setVelocityX(300);
    }
    else{
        this.jet.setVelocityX(0);
    }


    if(this.cursors.up.isDown){
        this.jet.setVelocityY(-300);
    }
    else if(this.cursors.down.isDown){
        this.jet.setVelocityY(300);
    }
    else{
        this.jet.setVelocityY(0);
    }

    this.checkForReposition(this.bombs);
    this.checkForReposition(this.coins);
    
}

checkForReposition(bombs){
    bombs.children.iterate(function(bomb){
        if(bomb.y>config.height){
            bomb.y = 0;
            bomb.x = Phaser.Math.Between(15,config.width-15);
        }
    })
}
}
