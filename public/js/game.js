var SOCKET;




class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
        this.registry.set('highscore', 0);

        this.scene.start('Preloader');
    }
}

class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super('Preloader');

        this.loadText;
    }

    preload ()
    {
		SOCKET = io();
        this.loadText = this.add.text(512, 360, 'Loading ...', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' });
        this.loadText.setOrigin(0.5);
        this.loadText.setStroke('#203c5b', 6);
        this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.load.setPath('assets/snowmen-attack/');
        this.load.image([ 'background', 'overlay', 'gameover', 'title' ]);
        this.load.atlas('sprites', 'sprites.png', 'sprites.json');
        this.load.glsl('snow', 'snow.glsl.js');

        //  Audio ...
        this.load.setPath('assets/snowmen-attack/sounds/');

        this.load.audio('music', [ 'music.ogg', 'music.m4a', 'music.mp3' ]);
        this.load.audio('throw', [ 'throw.ogg', 'throw.m4a', 'throw.mp3' ]);
        this.load.audio('move', [ 'move.ogg', 'move.m4a', 'move.mp3' ]);
        this.load.audio('hit-snowman', [ 'hit-snowman.ogg', 'hit-snowman.m4a', 'hit-snowman.mp3' ]);
        this.load.audio('gameover', [ 'gameover.ogg', 'gameover.m4a', 'gameover.mp3' ]);
    }

    create ()
    {
        //  Create our global animations
        
        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'die', start: 0, end: 0, zeroPad: 3 })
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'idle', start: 0, end: 3, zeroPad: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'throwStart',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'throw', start: 0, end: 8, zeroPad: 3 }),
            frameRate: 26
        });

        this.anims.create({
            key: 'throwEnd',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'throw', start: 9, end: 11, zeroPad: 3 }),
            frameRate: 26
        });

        this.anims.create({
            key: 'snowmanIdleBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-idle', start: 0, end: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanWalkBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-walk', start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanThrowStartBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 0, end: 5 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanThrowEndBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-throw', start: 6, end: 8 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanDieBig',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-big-die', start: 0, end: 4 }),
            frameRate: 14
        });

        this.anims.create({
            key: 'snowmanIdleSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-idle', start: 0, end: 3 }),
            yoyo: true,
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanWalkSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-walk', start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'snowmanThrowStartSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 0, end: 5 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanThrowEndSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-throw', start: 6, end: 8 }),
            frameRate: 20
        });

        this.anims.create({
            key: 'snowmanDieSmall',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'snowman-small-die', start: 0, end: 4 }),
            frameRate: 14
        });

        if (this.sound.locked)
        {
            this.loadText.setText('Click to Start');

            this.input.once('pointerdown', () => {

                this.scene.start('MainMenu');

            });
        }
        else
        {
            this.scene.start('MainMenu');
        }
    }
}


class MainMenu extends Phaser.Scene
{
	
	
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
		self = this
		console.log(SOCKET.id)
        this.sound.play('music', { loop: true, delay: 2 });

        this.add.shader('snow', 512, 384, 1024, 768);

        //  Intro snowball fight

        let ball1 = this.add.image(-64, 300, 'sprites', 'snowball1');
        let ball2 = this.add.image(1088, 360, 'sprites', 'snowball1');
        let ball3 = this.add.image(-64, 320, 'sprites', 'snowball1');
        let logo = this.add.image(1700, 384, 'title');

        this.tweens.add({
            targets: ball1,
            x: 1088,
            y: 360,
            ease: 'cubic.out',
            duration: 600,
            onStart: () => {
                this.sound.play('throw');
            }
        });

        this.tweens.add({
            targets: ball2,
            x: -64,
            y: 280,
            ease: 'cubic.out',
            delay: 700,
            duration: 600,
            onStart: () => {
                this.sound.play('throw');
            }
        });

        this.tweens.add({
            targets: ball3,
            x: 1088,
            y: 380,
            ease: 'cubic.out',
            delay: 1200,
            duration: 600,
            onStart: () => {
                this.sound.play('throw');
            }
        });

        this.tweens.add({
            targets: logo,
            x: 512,
            ease: 'back.out',
            delay: 1800,
            duration: 600,
            onStart: () => {
                this.sound.play('throw');
            }
        });

        this.input.keyboard.once('keydown-SPACE', () => {
			SOCKET.emit('GameInit', {});
			this.loadText = this.add.text(512, 360, 'Wait for another player', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' });
			this.loadText.setOrigin(0.5);
			this.loadText.setStroke('#203c5b', 6);
			this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);
        }, this);

        this.input.once('pointerdown', () => {
			SOCKET.emit('GameInit', {});
			this.loadText = this.add.text(512, 360, 'Wait for another player', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' });
			this.loadText.setOrigin(0.5);
			this.loadText.setStroke('#203c5b', 6);
			this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);
        });
		SOCKET.on('InitSucess', function () {
			console.log('here');
			self.scene.start('MainGame');
		});
    }
}

class MainGame extends Phaser.Scene
{
	
    constructor ()
    {
        super('MainGame');
		self = this;
		this.enemy;
        this.player;
        this.tracks;

        this.score = 0;
        this.highscore = 0;
        this.infoPanel;

        this.scoreTimer;
        this.scoreText;
        this.highscoreText;
    }
	
	win ()
    {
        this.loadText = this.add.text(512, 360, 'WIN!', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' });
        this.loadText.setOrigin(0.5);
        this.loadText.setStroke('#203c5b', 6);
        this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.tweens.add({
            targets: this.infoPanel,
            y: 384,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        this.tracks.forEach((track) => {
            track.stop();
        });

        this.sound.stopAll();
        this.sound.play('gameover');

        this.enemy.stop();

        this.scoreTimer.destroy();

        if (this.score > this.highscore)
        {
            this.highscoreText.setText('NEW!');

            this.registry.set('highscore', this.score);
        }

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainMenu');
        }, this);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        }, this);
    }

    create ()
    {
        this.score = 0;
        this.highscore = this.registry.get('highscore');

        this.add.image(512, 384, 'background');

        this.tracks = [
            new Track(this, 0, 196),
            new Track(this, 1, 376),
            new Track(this, 2, 536),
            new Track(this, 3, 700)
        ];

        this.player = new Player(this, 900, this.tracks[0]);
		this.enemy = new Enemy(this, 150, this.tracks[0]);

        this.add.image(0, 0, 'overlay').setOrigin(0);

        this.add.image(16, 0, 'sprites', 'panel-score').setOrigin(0);
        this.add.image(1024-16, 0, 'sprites', 'panel-best').setOrigin(1, 0);

        this.infoPanel = this.add.image(512, 384, 'sprites', 'controls');
        this.scoreText = this.add.text(140, 2, this.score, { fontFamily: 'Arial', fontSize: 32, color: '#ffffff' });
        this.highscoreText = this.add.text(820, 2, this.highscore, { fontFamily: 'Arial', fontSize: 32, color: '#ffffff' });
		
		
		
		this.start();
    }

    start ()
    {
        this.input.keyboard.removeAllListeners();
		SOCKET.on('Win', function(none){
			self.scene.win();
		});
        this.tweens.add({
            targets: this.infoPanel,
            y: 700,
            alpha: 0,
            duration: 500,
            ease: 'Power2'
        });

        this.player.start();
		
		this.enemy.start();
		
        this.scoreTimer = this.time.addEvent({ delay: 1000, callback: () => {
            this.score++;
            this.scoreText.setText(this.score);
        }, callbackScope: this, repeat: -1 });
    }

    gameOver ()
    {
        this.infoPanel.setTexture('gameover');

        this.tweens.add({
            targets: this.infoPanel,
            y: 384,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        this.tracks.forEach((track) => {
            track.stop();
        });

        this.sound.stopAll();
        this.sound.play('gameover');

        this.player.stop();

        this.scoreTimer.destroy();

        if (this.score > this.highscore)
        {
            this.highscoreText.setText('NEW!');

            this.registry.set('highscore', this.score);
        }

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainMenu');
        }, this);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        }, this);
    }
	
	
}


class EnemySnowball extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, key, frame)
    {
        super(scene, x, y, key, frame);

        this.setScale(0.5);
    }

    fire (x, y)
    {
        this.body.enable = true;
        this.body.reset(x + 10, y - 44);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(100);
    }

    stop ()
    {
        this.setActive(false);
        this.setVisible(false);

        this.setVelocityX(0);

        this.body.enable = false;
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.x >= 970)
        {
            this.stop();
			SOCKET.emit('GameOver', {});
            this.scene.gameOver();
        }
    }
}






 class PlayerSnowball extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y, key, frame)
    {
        super(scene, x, y, key, frame);

        this.setScale(0.5);
    }

    fire (x, y)
    {
        this.body.enable = true;
        this.body.reset(x + 10, y - 44);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(-100);
    }

    stop ()
    {
        this.setActive(false);
        this.setVisible(false);

        this.setVelocityX(0);

        this.body.enable = false;
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.x <= 50)
        {
            this.stop();
        }
    }
}




class Track
{
    constructor (scene, id, trackY)
    {
        this.scene = scene;
        this.id = id;
        this.y = trackY;

        this.my_nest = scene.physics.add.image(1024, trackY - 10, 'sprites', 'nest').setOrigin(1, 1);
		this.enemy_nest = scene.physics.add.image(80, trackY - 10, 'sprites', 'nest').setOrigin(1, 1);
        this.playerSnowballs = scene.physics.add.group({
            frameQuantity: 8,
			quantity: 12,
            key: 'sprites',
            frame: 'snowball2',
            active: false,
            visible: false,
            classType: PlayerSnowball
        });
        this.playerSnowballs.maxSize = -1;
        this.enemySnowballs = scene.physics.add.group({
            framequantity: 8,
			quantity: 12,
            key: 'sprites',
            frame: 'snowball3',
            active: false,
            visible: false,
            classType: EnemySnowball
        });
		this.enemySnowballs.maxSize = -1;
        this.snowBallCollider = scene.physics.add.overlap(this.playerSnowballs, this.enemySnowballs, this.hitSnowball, null, this);
    }

    stop ()
    {
        for (let snowball of this.playerSnowballs.getChildren())
        {
            snowball.stop();
        }

        for (let snowball of this.enemySnowballs.getChildren())
        {
            snowball.stop();
        }
    }

    hitSnowball (ball1, ball2)
    {
        ball1.stop();
        ball2.stop();
    }

    throwPlayerSnowball (x)
    {
        let snowball = this.playerSnowballs.getFirstDead(true);

        if (snowball)
        {
            snowball.fire(x, this.y);
        }
    }

    throwEnemySnowball (x)
    {
        let snowball = this.enemySnowballs.getFirstDead(true);

        if (snowball)
        {
            snowball.fire(x, this.y);
        }
    }
}



class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene,pos, track)
    {
        super(scene, pos, track.y, 'sprites', 'idle000');

        this.setOrigin(0.5, 1);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isAlive = true;
        this.isThrowing = false;

        this.sound = scene.sound;
        this.currentTrack = track;

        this.spacebar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.up = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.down = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        this.play('idle');
    }

    start ()
    {
        this.isAlive = true;
        this.isThrowing = false;

        this.currentTrack = this.scene.tracks[0];
        this.y = this.currentTrack.y;
    
        this.on('animationcomplete-throwStart', this.releaseSnowball, this);
        this.on('animationcomplete-throwEnd', this.throwComplete, this);

        this.play('idle', true);
    }

    moveUp ()
    {
        if (this.currentTrack.id === 0)
        {
            this.currentTrack = this.scene.tracks[3];
        }
        else
        {
            this.currentTrack = this.scene.tracks[this.currentTrack.id - 1];
        }

        this.y = this.currentTrack.y;

        this.sound.play('move');
    }

    moveDown ()
    {
        if (this.currentTrack.id === 3)
        {
            this.currentTrack = this.scene.tracks[0];
        }
        else
        {
            this.currentTrack = this.scene.tracks[this.currentTrack.id + 1];
        }

        this.y = this.currentTrack.y;

        this.sound.play('move');
    }

    throw ()
    {
        this.isThrowing = true;

        this.play('throwStart');

        this.sound.play('throw');
    }

    releaseSnowball ()
    {
        this.play('throwEnd');

        this.currentTrack.throwPlayerSnowball(this.x);
    }

    throwComplete ()
    {
        this.isThrowing = false;

        this.play('idle');
    }

    stop ()
    {
        this.isAlive = false;

        this.body.stop();

        this.play('die');
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (!this.isAlive)
        {
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.up))
        {
			SOCKET.emit('MoveUp', {});
			console.log(`Игрок двигается вверх`);
            this.moveUp();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.down))
        {
			SOCKET.emit('MoveDown', {});
			console.log(`Игрок двигается вниз`);
            this.moveDown();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.spacebar) && !this.isThrowing)
        {
			SOCKET.emit('Shoot', {});
			console.log(`Игрок стреляет`);
            this.throw();
        }
    }
}



class Enemy extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene,pos, track)
    {
        super(scene, pos, track.y, 'sprites', 'idle000');
		self=this
        this.setOrigin(0.5, 1);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isAlive = true;
        this.isThrowing = false;

        this.sound = scene.sound;
        this.currentTrack = track;

        this.play('idle');
		this.flipX = true
    }

    start ()
    {
        this.isAlive = true;
        this.isThrowing = false;

        this.currentTrack = this.scene.tracks[0];
        this.y = this.currentTrack.y;
    
        this.on('animationcomplete-throwStart', this.releaseSnowball, this);
        this.on('animationcomplete-throwEnd', this.throwComplete, this);

        this.play('idle', true);
		
		SOCKET.on('MoveUp_enemy', function (none) {
			console.log(`Враг двигается вверх`);
			self.moveUp();
		});
  
		SOCKET.on('MoveDown_enemy', function (none) {
			console.log(`Враг двигается вниз`);
			self.moveDown();
		});
		SOCKET.on('Shoot_enemy', function (none) {
			console.log(`Враг стреляет`);
			self.throw();
		});
    }

    moveUp ()
    {
        if (this.currentTrack.id === 0)
        {
            this.currentTrack = this.scene.tracks[3];
        }
        else
        {
            this.currentTrack = this.scene.tracks[this.currentTrack.id - 1];
        }

        this.y = this.currentTrack.y;

        this.sound.play('move');
    }

    moveDown ()
    {
        if (this.currentTrack.id === 3)
        {
            this.currentTrack = this.scene.tracks[0];
        }
        else
        {
            this.currentTrack = this.scene.tracks[this.currentTrack.id + 1];
        }

        this.y = this.currentTrack.y;

        this.sound.play('move');
    }

    throw ()
    {
        this.isThrowing = true;

        this.play('throwStart');

        this.sound.play('throw');
    }

    releaseSnowball ()
    {
        this.play('throwEnd');

        this.currentTrack.throwEnemySnowball(this.x);
    }

    throwComplete ()
    {
        this.isThrowing = false;

        this.play('idle');
    }

    stop ()
    {
        this.isAlive = false;

        this.body.stop();

        this.play('die');
    }


}



const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#3366b2',
    parent: 'phaser-example',
    scene: [ Boot, Preloader, MainMenu, MainGame ],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    }
};

 
var game = new Phaser.Game(config);