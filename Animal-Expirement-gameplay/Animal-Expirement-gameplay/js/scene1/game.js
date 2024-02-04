let platforms
let platformsMoving
let platformsMoving2
let platformsMoving3
let platformsMoving4
let platformsMoving5
let platformsMoving6
let platformsMoving7

let player
let cursors
let llave

var P


class GameScene extends Phaser.Scene {
    constructor (){
        super('GameScene');
    }

    preload (){	
		this.load.image('player', '../resources/raton.png');
		this.load.image('cientifico', '../resources/cabezon.png');
		this.load.image('pocionBuena', '../resources/potiBuena.png');
		this.load.image('pocionMala', '../resources/potiMala.png');
		this.load.image('conejo_vidas', '../resources/cerdo_vidas.png');
		this.load.image('queso', '../resources/quesito.png');
		this.load.image('quesoMalo', '../resources/quesitoMalo.png');
		this.load.image('background', '../resources/fondo3.png');
		this.load.image('platform', '../resources/plataforma.png');
		this.load.image('llave', '../resources/llave.png');
		
	}
	
    create (){	

		this.scene.launch('HUD');

		this.add.image(960, 540, 'background').setScrollFactor(0,0);

		llave = this.physics.add.image(450, -700, 'llave');
		llave.body.allowGravity = false;

		player = this.physics.add.sprite(450, 450, 'player');

		player.setBounce(0.0);
		player.setScale(0.5);
		//estoo no porque quiero que tire pa arriba
    	//player.setCollideWorldBounds(true);

		platforms = this.physics.add.staticGroup();
		platforms.create(400, 700, 'platform').refreshBody();
		platforms.create(800, 700, 'platform').refreshBody();
		platforms.create(1200, 700, 'platform').refreshBody();

		//CAMBIAR ESTO, crear grupo
		platformsMoving = this.physics.add.image(800, 550, 'platform');
		platformsMoving2 = this.physics.add.image(1200, 350, 'platform');
		platformsMoving3 = this.physics.add.image(1600, 150, 'platform');
		platformsMoving4 = this.physics.add.image(800, -50, 'platform');
		platformsMoving5 = this.physics.add.image(1200, -250, 'platform');
		platformsMoving6 = this.physics.add.image(800, -450, 'platform');
		platformsMoving7 = this.physics.add.image(400, -650, 'platform');
	
		platformsMoving.setImmovable(true);
		platformsMoving.body.allowGravity = false;
		platformsMoving.setVelocityX(50);
		platformsMoving2.setImmovable(true);
		platformsMoving2.body.allowGravity = false;
		platformsMoving2.setVelocityX(50);
		platformsMoving3.body.allowGravity = false;
		platformsMoving3.setVelocityX(-50);
		platformsMoving3.setImmovable(true);
		platformsMoving4.body.allowGravity = false;
		platformsMoving4.setVelocityX(50);
		platformsMoving4.setImmovable(true);
		platformsMoving5.body.allowGravity = false;
		platformsMoving5.setVelocityX(50);
		platformsMoving5.setImmovable(true);
		platformsMoving6.body.allowGravity = false;
		platformsMoving6.setVelocityX(50);
		platformsMoving6.setImmovable(true);
		platformsMoving7.body.allowGravity = false;
		platformsMoving7.setVelocityX(50);
		platformsMoving7.setImmovable(true);

		this.physics.add.collider(player, platforms);
		this.physics.add.collider(player, platformsMoving);
		this.physics.add.collider(player, platformsMoving2);
		this.physics.add.collider(player, platformsMoving3);
		this.physics.add.collider(player, platformsMoving5);
		this.physics.add.collider(player, platformsMoving4);
		this.physics.add.collider(player, platformsMoving6);
		this.physics.add.collider(player, platformsMoving7);

		cursors = this.input.keyboard.createCursorKeys();
		P = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
		

		this.cameras.main.setBounds(0);
		this.cameras.main.startFollow(player);

		this.physics.add.collider(player, llave, function(obj1, obj2){
			alert("ganaste");
		});


	}
	
	update (){

		if(cursors.left.isDown){
			player.setVelocityX(-500)
		}
		else if(cursors.right.isDown){
			player.setVelocityX(500)
		}
		else {
			player.setVelocityX(0)
		}
		if (cursors.up.isDown && player.body.touching.down)
		{
		player.setVelocityY(-700);
		}
		if (cursors.down.isDown) 
		{
		player.setVelocityY(420);
		}

		if(player.y>750){
			alert("perdiste puto");
		}

		

		if (P.isDown){
			this.scene.pause();
			this.scene.launch('Pause');
			
		}
	}
}





class HUD extends Phaser.Scene {
    constructor(){
        super({key: 'HUD'});

    }

    preload(){
        this.load.image('hud_side1', '../resources/hud_images/hud_side1.png');
        this.load.image('hud_side2', '../resources/hud_images/hud_side2.png');
        this.load.image('hud_side3', '../resources/hud_images/hud_side3.png');
		this.load.image('hud_pj', '../resources/hud_images/hud_pj.png');
    }

    create(){
       this.hudcentro =  this.add.image(120, 700, 'hud_pj');
       this.hudcentro.scale = 0.30;
       this.hudder =  this.add.image(375, 763, 'hud_side1')
       this.hudder.scale = 0.30;
       this.hudder2 =  this.add.image(655, 760, 'hud_side3')
       this.hudder2.scale = 0.30;
       this.hudizq =  this.add.image(945, 790, 'hud_side2')
       this.hudizq.scale = 0.30;


    }
   
}


    

class Pause extends Phaser.Scene {
    constructor (){
        super('Pause');
    }
}