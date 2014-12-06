// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');


// Create our 'main' state that will contain the game
var mainState = {
  statue: true,

  preload: function() {
    game.stage.backgroundColor = '#71c5cf';

    // Load sprites
    game.load.spritesheet('bird', 'assets/bird2.png',92,63,3);
    game.load.image('pipe', 'assets/pipe.png');

    // Load audios
    game.load.audio('jump', 'assets/jump.wav');
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);


    // Bird
    this.bird = this.game.add.sprite(100, 245, 'bird',3);
    this.bird.scale.x = 0.4;
    this.bird.scale.y = 0.4;
    this.bird.anchor.setTo(-0.2, 0.5);
    this.bird.animations.add('flying',[0,2],8,true);


    // gravity
    game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 1000;

    // Bird add bounce
    game.physics.enable(this.bird, Phaser.Physics.ARCADE);
    this.bird.body.bounce.set(0.5);

    // Pipes group
    this.pipes = game.add.group();
    this.pipes.enableBody = true;
    this.pipes.createMultiple(20, 'pipe');

    // Add pipe row per 1.5s
    this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

    // Bind spaceKey to jump
    var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);

    // Score
    this.score = 0;
    this.labelScore = game.add.text(20, 60, "score: 0", {
      font: "20px Arial",
      fill: "#fff"
    });

    // Level
    this.level = 1;
    this.labelLevel = game.add.text(20, 20, "LEVEL: 1", {
      font: "30px Arial",
      fill: "#fff"
    });

    // Create sounds
    this.jumpSound = game.add.audio('jump');
  },

  update: function() {
    this.bird.animations.play('flying');

    // Bird in world
    if (this.bird.inWorld == false) {
      if (this.statue) {
        this.gameEnd();
      }
    }

    if (this.bird.angle < 20) {
      this.bird.angle += 1;
    }

    // Bird and pipes overlap
    game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);

  },

  jump: function (){
    // enable jump when alive
    if (this.bird.alive) {
      // Add a vertical velocity to the bird
      this.bird.body.velocity.y = -350;

      var animation = game.add.tween(this.bird);
      animation.to({angle: -20}, 100);
      animation.start();

      // Play sound
      this.jumpSound.play();
    }
  },

  hitPipe: function (){
    // If bird already hit a pipe, we will nothing to do
    if (this.bird.alive == false) {
      return;
    }

    this.bird.alive = false;

    game.time.events.remove(this.timer);

    this.pipes.forEachAlive(function(p) {
      p.body.velocity.x = 0;
    }, this);
  },

  addOnePipe: function(x, y) {
    console.log(this.pipes.countLiving());
    var pipe = this.pipes.getFirstDead();
    pipe.reset(x, y);

    // Velocity
    pipe.body.velocity.x = -200;
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;

    // Bird and pipes overlap
    game.physics.enable(pipe, Phaser.Physics.ARCADE);
  },

  addRowOfPipes: function() {
    // Pick where the hole will be
    var hole = Math.floor(Math.random() * 5) + 1;

    // Add 6 pipes(row)
    for (var i = 0; i < 8; i++) {
      if (i != hole && i != hole + 1) {
        this.addOnePipe(400, i * 60 + 10);
      }
    }

    // Increase score
    this.score += 1;
    this.labelScore.text = "score: " + this.score;

    if (this.score % 5 == 0) {
      this.levelUp();
    }
  },

  levelUp: function() {
    this.level++;
    this.labelLevel.text = 'level: ' + this.level;
  },

  gameEnd: function() {
    this.statue = false;
    // Stop pipe
    game.time.events.remove(this.timer);
    // Game end
    this.endTxt = game.add.text(game.world.centerX, game.world.centerY, {
      font: "60px Tahoma",
      fill: "#ff0044"
    });

    this.endTxt.text = "Game Over!!!\n score: " + this.score;
    this.endTxt.anchor.set(0.5, 0.5);
    //turn off game
  }
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');
