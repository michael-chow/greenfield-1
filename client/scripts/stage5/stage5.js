App.stage5 = function(game) {
  console.log("starting stage5");
  App.info.game = game;

};

App.stage5.prototype = {
  preload: function() {
    this.load.image('pacman', '/../../../assets/pacman.png', 32, 32);
    this.load.image('ghost', '/../../../assets/ghost.ico', 32, 32);
    this.load.image('cherry', '/../../../assets/cherry.png', 32, 32);
    this.load.image('background', '/../../../assets/space.png');
    this.load.script('otherPlayer5', '/scripts/stage5/otherPlayer5.js');
  },

  create: function() {
    
    // set game to P2 physics
    this.physics.startSystem(Phaser.Physics.P2JS);

    this.physics.p2.setImpactEvents(true);
    
    //set the degree of bounce
    this.physics.p2.restitution = 0.5;

    this.add.tileSprite(0, 0, 800, 600, 'background');

    // add collision groups
    this.physics.p2.updateBoundsCollisionGroup();
    App.info.ghostGroup = this.physics.p2.createCollisionGroup();
    App.info.playerGroup = this.physics.p2.createCollisionGroup();
    App.info.cherryGroup = this.physics.p2.createCollisionGroup();

    // create 10 ghosts at start
    for (var i = 0; i < 10; i++) {
    
    ghost = this.add.sprite(this.world.randomX, this.world.randomX, 'ghost');
    this.physics.p2.enable(ghost, false);
    ghost.body.setCircle(15);  
    ghost.body.setCollisionGroup(App.info.ghostGroup);
    ghost.body.collides([App.info.playerGroup, App.info.ghostGroup, App.info.cherryGroup]);

    }

    // create 3 cherries at start
    for (var i = 0; i < 3; i++) {
    
    cherry = this.add.sprite(this.world.randomX, this.world.randomX, 'cherry');
    this.physics.p2.enable(cherry, false);
    cherry.body.setCircle(15);  
    cherry.body.setCollisionGroup(App.info.cherryGroup);
    cherry.body.collides([App.info.playerGroup, App.info.ghostGroup, App.info.cherryGroup]);

    }

    // create pacman player on screen 
    player = this.add.sprite(200, this.world.height - 150, 'pacman');
    this.physics.p2.enable(player, false);
    player.body.setCircle(15);
    player.body.collideWorldBounds = true;
    player.body.setCollisionGroup(App.info.playerGroup);

    // define collision events if pacman player hits ghost, cherry, and other player
    player.body.collides(App.info.playerGroup, this.hitPlayer, this);
    player.body.collides(App.info.ghostGroup, this.hit, this);
    player.body.collides(App.info.cherryGroup, this.hitCherry, this);
    player.body.createBodyCallback(this.world, this.hit, this);

    var updatedScore = ('Score:' + App.info.score + '\nHealth: ' + App.info.health + '\nGold: ' + App.info.gold);
    scoreText = this.add.text(16, 16, updatedScore, {fontSize: '24px', fill: '#fff'});

    var text = "In PACMAN-SPACE, \n beware of GHOSTS";
    var intro = this.add.bitmapText(250, 300, "pixel", text, 25);
    intro.align = 'center';
    intro.tint = 0xffffff;

    // intro text timer
    this.time.events.add(Phaser.Timer.SECOND * 5, function () {
      this.add.tween(intro).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
    }, this);


    //this is important to bring in your players!!
    App.info.stageConnect();

  },

  hit: function(body1, body2) {
    App.info.score = App.info.score - 100;
    App.info.health = App.info.health - 1;
    
    // create a new ghost if pacman hits a ghost
    ghost = this.add.sprite(this.world.randomX, this.world.randomX, 'ghost');
    this.physics.p2.enable(ghost, false);
    ghost.body.setCircle(15);  
    ghost.body.setCollisionGroup(App.info.ghostGroup);
    ghost.body.collides([App.info.playerGroup, App.info.ghostGroup, App.info.cherryGroup]);
    
    scoreText.destroy();
    updatedScore = ('Score:' + App.info.score + '\nHealth: ' + App.info.health + '\nGold: ' + App.info.gold);
    scoreText = this.add.text(16, 16, updatedScore, {fontSize: '24px', fill: '#fff'});
  },


  hitPlayer: function(body1, body2) {
    App.info.score = App.info.score + 100;
  },

  hitCherry: function(body1, body2) {
    App.info.gold = App.info.gold + 1;
    App.info.score = App.info.score + 10; 

    // create a new cherry if pacman gets a cherry
    cherry = this.add.sprite(this.world.randomX, this.world.randomX, 'cherry');
    this.physics.p2.enable(cherry, false);
    cherry.body.setCircle(15);  
    cherry.body.setCollisionGroup(App.info.cherryGroup);
    cherry.body.collides([App.info.playerGroup, App.info.ghostGroup, App.info.cherryGroup]);
    
    scoreText.destroy();
    updatedScore = ('Score:' + App.info.score + '\nHealth: ' + App.info.health + '\nGold: ' + App.info.gold);
    scoreText = this.add.text(16, 16, updatedScore, {fontSize: '24px', fill: '#fff'});
  },

  update: function() {

    //this function updates each player each frame- KEEP!!!
    for ( var i = 0; i < App.info.players.length; i ++) {
      if (App.info.players[i].alive) { 
        App.info.players[i].update();

      }
    }


    //controls
    var cursors = this.input.keyboard.createCursorKeys();


    if (cursors.left.isDown) {
      player.body.rotateLeft(80);

    } else if (cursors.right.isDown) {
      player.body.rotateRight(80);

    } else {
      player.animations.stop();
      player.frame = 4;
      player.body.setZeroRotation();

    }
    if (cursors.up.isDown) {
      player.body.thrust(400);
      App.info.score += 1;

      updatedScore = ('Score:' + App.info.score + '\nHealth: ' + App.info.health + '\nGold: ' + App.info.gold);
      scoreText.text = updatedScore;
    } else if (cursors.down.isDown) {
      player.body.reverse(400);
      App.info.score += 1;
      updatedScore = ('Score:' + App.info.score + '\nHealth: ' + App.info.health + '\nGold: ' + App.info.gold);
      scoreText.text = updatedScore;

    }


    //tells the server your location each frame- KEEP!!!
    App.info.socket.emit('p2player', {
      x: player.x,
      y: player.y,
      angle: player.angle
    });

  }
};  