class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, track)
    {
        super(scene, 900, track.y, 'sprites', 'idle000');

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
            this.moveUp();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.down))
        {
            this.moveDown();
        }
        else if (Phaser.Input.Keyboard.JustDown(this.spacebar) && !this.isThrowing)
        {
            this.throw();
        }
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

        this.setVelocityX(200);
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

        this.setVelocityX(-600);
        this.setAccelerationX(-1400);
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

        if (this.x <= -64)
        {
            this.stop();
        }
    }
}


class Snowman extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, track, size)
    {
        const frame = (size === 'Small') ? 'snowman-small-idle0' : 'snowman-big-idle0';
        const x = (size === 'Small') ? 80 : -100;

        super(scene, x, track.y, 'sprites', frame);

        this.setOrigin(0.5, 1);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (size === 'Small')
        {
            this.body.setSize(100, 100);
            this.body.setOffset(20, 40);
        }
        else
        {
            this.body.setSize(100, 120);
            this.body.setOffset(50, 50);
        }

        this.time = scene.time;
        this.sound = scene.sound;

        this.isAlive = true;
        this.isThrowing = false;

        this.size = size;
        this.speed = 50;

        //  0 = walk, 1 = idle, 2 = throw
        this.previousAction = 0;

        this.currentTrack = track;

        this.play('snowmanIdle' + this.size);
    }

    start ()
    {
        this.isAlive = true;
        this.isThrowing = false;
        this.previousAction = 0;
        this.currentHitpoints = this.maxHitpoints;

        this.y = this.currentTrack.y;
    
        this.on('animationcomplete-snowmanThrowStart' + this.size, this.releaseSnowball, this);
        this.on('animationcomplete-snowmanThrowEnd' + this.size, this.throwComplete, this);

        this.setActive(true);
        this.setVisible(true);

        this.play('snowmanWalk' + this.size);

        this.setVelocityX(this.speed);

        this.chooseEvent = this.time.delayedCall(Phaser.Math.Between(3000, 6000), this.chooseAction, [], this);
    }

    chooseAction ()
    {
        //  In case it was disabled by a hit
        this.isAlive = true;
        this.body.enable = true;

        this.setVelocityX(0);

        //  0 - 50 = Throw snowball
        //  51 - 60 = Idle
        //  61 - 100 = Walk 
        const t = Phaser.Math.Between(0, 100);

        if (t < 50)
        {
            //  If it threw last time, we don't throw again
            if (this.previousAction === 2)
            {
                this.walk();
            }
            else
            {
                this.throw();
            }
        }
        else if (t > 60)
        {
            this.walk();
        }
        else
        {
            //  If it was idle last time, we don't go idle again
            if (this.previousAction === 1)
            {
                if (t > 55)
                {
                    this.walk();
                }
                else
                {
                    this.throw();
                }
            }
            else
            {
                this.goIdle();
            }
        }
    }

    walk ()
    {
        this.previousAction = 0;

        this.play('snowmanWalk' + this.size, true);

        this.setVelocityX(this.speed);

        this.chooseEvent = this.time.delayedCall(Phaser.Math.Between(3000, 6000), this.chooseAction, [], this);
    }

    goIdle ()
    {
        this.previousAction = 1;

        this.play('snowmanIdle' + this.size, true);

        this.chooseEvent = this.time.delayedCall(Phaser.Math.Between(2000, 4000), this.chooseAction, [], this);
    }

    throw ()
    {
        this.previousAction = 2;

        this.isThrowing = true;

        this.play('snowmanThrowStart' + this.size);
    }

    releaseSnowball ()
    {
        if (!this.isAlive)
        {
            return;
        }

        this.play('snowmanThrowEnd' + this.size);

        this.currentTrack.throwEnemySnowball(this.x);
    }

    throwComplete ()
    {
        if (!this.isAlive)
        {
            return;
        }

        this.isThrowing = false;

        this.play('snowmanIdle' + this.size);

        this.chooseEvent = this.time.delayedCall(Phaser.Math.Between(2000, 4000), this.chooseAction, [], this);
    }

    hit ()
    {
        if (this.chooseEvent)
        {
            this.chooseEvent.remove();
        }

        this.isAlive = false;
        this.previousAction = -1;

        this.play('snowmanDie' + this.size);

        this.sound.play('hit-snowman');

        this.body.stop();

        this.body.enable = false;

        const knockback = '-=' + Phaser.Math.Between(100, 200).toString();

        this.scene.tweens.add({
            targets: this,
            x: knockback,
            ease: 'sine.out',
            duration: 1000,
            onComplete: () => {
                if (this.x < -100)
                {
                    this.x = -100;
                }
            }
        });

        this.chooseEvent = this.time.delayedCall(Phaser.Math.Between(1000, 3000), this.chooseAction, [], this);
    }

    stop ()
    {
        if (this.chooseEvent)
        {
            this.chooseEvent.remove();
        }

        this.isAlive = false;

        this.play('snowmanIdle' + this.size);

        this.setVelocityX(0);
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);

        if (this.x >= 880)
        {
            this.stop();

            this.scene.gameOver();
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

        this.nest = scene.physics.add.image(1024, trackY - 10, 'sprites', 'nest').setOrigin(1, 1);

        this.snowmanBig = new Snowman(scene, this, 'Big');
        this.snowmanSmall = new Snowman(scene, this, 'Small');

        this.playerSnowballs = scene.physics.add.group({
            frameQuantity: 8,
            key: 'sprites',
            frame: 'snowball2',
            active: false,
            visible: false,
            classType: PlayerSnowball
        });

        this.enemySnowballs = scene.physics.add.group({
            frameQuantity: 8,
            key: 'sprites',
            frame: 'snowball3',
            active: false,
            visible: false,
            classType: EnemySnowball
        });

        this.snowBallCollider = scene.physics.add.overlap(this.playerSnowballs, this.enemySnowballs, this.hitSnowball, null, this);
        this.snowmanSmallCollider = scene.physics.add.overlap(this.snowmanSmall, this.playerSnowballs, this.hitSnowman, null, this);
        this.snowmanBigCollider = scene.physics.add.overlap(this.snowmanBig, this.playerSnowballs, this.hitSnowman, null, this);

        this.releaseTimerSmall;
        this.releaseTimerBig;
    }

    start (minDelay, maxDelay)
    {
        const delay = Phaser.Math.Between(minDelay, maxDelay);

        this.releaseTimerSmall = this.scene.time.addEvent({

            delay: delay,

            callback: () => {
                this.snowmanSmall.start();
            }
        });

        this.releaseTimerBig = this.scene.time.addEvent({

            delay: delay * 3,

            callback: () => {
                this.snowmanBig.start();
            }
        });
    }

    stop ()
    {
        this.snowmanSmall.stop();
        this.snowmanBig.stop();

        for (let snowball of this.playerSnowballs.getChildren())
        {
            snowball.stop();
        }

        for (let snowball of this.enemySnowballs.getChildren())
        {
            snowball.stop();
        }

        this.releaseTimerSmall.remove();
        this.releaseTimerBig.remove();
    }

    hitSnowball (ball1, ball2)
    {
        ball1.stop();
        ball2.stop();
    }

    hitSnowman (snowman, ball)
    {
        if (snowman.isAlive && snowman.x > 0)
        {
            ball.stop();
            snowman.hit();
        }
    }

    throwPlayerSnowball (x)
    {
        let snowball = this.playerSnowballs.getFirstDead(false);

        if (snowball)
        {
            snowball.fire(x, this.y);
        }
    }

    throwEnemySnowball (x)
    {
        let snowball = this.enemySnowballs.getFirstDead(false);

        if (snowball)
        {
            snowball.fire(x, this.y);
        }
    }
}


class MainGame extends Phaser.Scene
{
    constructor ()
    {
        super('MainGame');

        this.player;
        this.tracks;

        this.score = 0;
        this.highscore = 0;
        this.infoPanel;

        this.scoreTimer;
        this.scoreText;
        this.highscoreText;
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

        this.player = new Player(this, this.tracks[0]);

        this.add.image(0, 0, 'overlay').setOrigin(0);

        this.add.image(16, 0, 'sprites', 'panel-score').setOrigin(0);
        this.add.image(1024-16, 0, 'sprites', 'panel-best').setOrigin(1, 0);

        this.infoPanel = this.add.image(512, 384, 'sprites', 'controls');
        this.scoreText = this.add.text(140, 2, this.score, { fontFamily: 'Arial', fontSize: 32, color: '#ffffff' });
        this.highscoreText = this.add.text(820, 2, this.highscore, { fontFamily: 'Arial', fontSize: 32, color: '#ffffff' });

        this.input.keyboard.once('keydown-SPACE', this.start, this);
        this.input.keyboard.once('keydown-UP', this.start, this);
        this.input.keyboard.once('keydown-DOWN', this.start, this);
    }

    start ()
    {
        this.input.keyboard.removeAllListeners();

        this.tweens.add({
            targets: this.infoPanel,
            y: 700,
            alpha: 0,
            duration: 500,
            ease: 'Power2'
        });

        this.player.start();

        this.tracks[0].start(4000, 8000);
        this.tracks[1].start(500, 1000);
        this.tracks[2].start(5000, 9000);
        this.tracks[3].start(6000, 10000);

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
        this.loadText = this.add.text(512, 360, 'Loading ...', { fontFamily: 'Arial', fontSize: 74, color: '#e3f2ed' });
        this.loadText.setOrigin(0.5);
        this.loadText.setStroke('#203c5b', 6);
        this.loadText.setShadow(2, 2, '#2d2d2d', 4, true, false);

        this.load.setPath('assets/games/snowmen-attack/');
        this.load.image([ 'background', 'overlay', 'gameover', 'title' ]);
        this.load.atlas('sprites', 'sprites.png', 'sprites.json');
        this.load.glsl('snow', 'snow.glsl.js');

        //  Audio ...
        this.load.setPath('assets/games/snowmen-attack/sounds/');

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

            this.scene.start('MainGame');

        }, this);

        this.input.once('pointerdown', () => {

            this.scene.start('MainGame');

        });
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

let game = new Phaser.Game(config);
