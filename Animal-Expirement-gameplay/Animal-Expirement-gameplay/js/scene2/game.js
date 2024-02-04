let jugador = {
	vidas : 3,
	genetica  : 100,
	pociones : 0,
	vel : 200
  };

let enemigo = {
	dmg : 10
};

let initialPosition = {
	x : 400 ,
	y : 360 ,
};

let timeText;
let numvidas
let enemies

let bullets
let firingTimer = 0;
let firingDelay = 1500;

let bulletsEnemy
let firingEnemyTimer = 0
let firingEnemyDelay = 4600;

let aliveEnemies = []

let llave;

let P;



class Game extends Phaser.Scene {
	

	

    constructor (){
        super('GameScene');
		
    }

    preload (){	
		this.load.image('background', '../resources/fondo2.png');
		this.load.image('player', '../resources/cerdo.png');
		this.load.image('cientifico', '../resources/cabezon.png');
		this.load.image('pocionBuena', '../resources/potiBuena.png');
		this.load.image('pocionMala', '../resources/potiMala.png');
		this.load.image('conejo_vidas', '../resources/cerdo_vidas.png');
		this.load.image('queso', '../resources/quesito.png');
		this.load.image('quesoMalo', '../resources/quesitoMalo.png');
		this.load.image('llave', '../resources/llave.png');
	}
	
    create() {
		this.scene.launch('HUD');

		

		this.add.image(1280, 360, 'background');

		
		this.vidas = this.add.image(90, 100, 'conejo_vidas');
		this.vidas.scale = 0.5;
      	this.vidas.setScrollFactor(0,0);
		




		



		this.physics.world.setBounds(0, 0, 1920, 1080)

  
  
		this.player = this.physics.add.image(0, 600, 'player');
		//this.player.setPosition(initialPosition.x, initialPosition.y)
		this.player.body.allowGravity = false;
		this.player.setScale(0.5);
		this.player.setCollideWorldBounds(true);
		this.player.body.immovable = true

  
		this.cursors = this.input.keyboard.createCursorKeys();	
		
		//TODO ESTOO PUESTO ELDOMINGO
		//timer = game.time.create(true);
		this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


	  
		enemies = this.physics.add.group();
		createEnemy();
		//this.physics.add.collider(this.player, enemies, function(){
		//	alert("asdas")
		//});

		P = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

		
		bullets = this.physics.add.group();
		bulletsEnemy = this.physics.add.group();

		this.physics.add.collider(bullets, enemies, function(obj1, obj2){
			destroyEnemy(obj1, obj2);
		});

		this.physics.add.collider(bulletsEnemy, this.player, function(obj1, obj2){
			
			takeDmg(obj1, obj2);
		});

	
		
	}
	
	update(time){

		//this.game.physics.arcade.collide(this.cientifico, this.player, saoko());
		//this.cientifico.body.onCollide = saoko();
		//this.numvidas = this.add.text (150, 100, jugador.genetica,  {fill: '#0f0' });

		if(this.cursors.left.isDown){
			this.player.setVelocityX(-jugador.vel, 0)
		  }
		  else if(this.cursors.right.isDown){
			this.player.setVelocity(jugador.vel, 0)
		  }
		  else {
			this.player.setVelocityX(0)
		  }
	
		  if (Phaser.Input.Keyboard.JustDown(this.spacebar)){
			disparar(this.player.x, this.player.y, time);
		}



		//enemigo random dispara
		if(time > firingEnemyTimer){
			dispararEnemigo();
			firingEnemyTimer = time + firingEnemyDelay;
		}  


		

		if (P.isDown){
			this.scene.pause();
			this.scene.launch('Pause');
			
		}

	}
}


function createEnemy () {

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 12; x++)
        {
            var enemy = enemies.create(75 + x * 150, 75 + y * 75, 'cientifico');
			enemy.body.allowGravity = false;
			enemy.setScale(0.35);
			aliveEnemies.push(enemy);
			//enemy.physics.add.collider(enemy,this.player);
            //enemy.setCollideWorldBounds(true);
            //enemy.body.moves = false;
        }
    }
}


function disparar(x, y, time){
	if(time > firingTimer){
		var bullet = bullets.create(x, y, 'queso');
		bullet.body.allowGravity=false;
		bullet.setScale(0.2);
		bullet.setVelocityY(-150)
		firingTimer = time + firingDelay;
	}
 }

 function dispararEnemigo(){
	var x = aliveEnemies.length;
	var random = Math.floor(Math.random() * x);
	
	var shooter = aliveEnemies[random];

	//shooter.destroy();
	//aliveEnemies.splice(random,1);


	//var shooter = aliveEnemies[random];

	// /shooter.destroy();

	var bulletEnemy = bulletsEnemy.create(shooter.x, shooter.y, 'quesoMalo');
	bulletEnemy.body.allowGravity=false;
	bulletEnemy.setScale(0.25);
	bulletEnemy.setVelocityY(150)
 }

 function destroyEnemy(obj1, obj2){
	var index = aliveEnemies.indexOf(obj1);
	aliveEnemies.splice(index,1);
	obj1.destroy();
	obj2.destroy();
	firingEnemyDelay-=75;
	if(aliveEnemies.length<=0){
		loadpage("../html/phasergame.html")
	}

 }

function takeDmg(obj1, obj2){
	obj2.destroy();
	jugador.vidas-=1;

	if(jugador.vidas<=0){
		alert("GAME OVER")
		this.Scene.stop();
	  }
}



class HUD extends Phaser.Scene {
    constructor(){
        super({key: 'HUD'});

    }

    preload(){
        this.load.image('hud1', '../../resources/hud_images/scene2hud/hud_1.png')
        this.load.image('hud2', '../../resources/hud_images/scene2hud/hud_2.png')
    }

    create(){
		timeText = this.add.text(100, 400);
		timeText.setScrollFactor(0,0);
		numvidas = this.add.text (150, 100, jugador.vidas,  {fill: '#0f0' });
		numvidas.setScrollFactor(0,0);
        this.hudcentro =  this.add.image(1700, 800, 'hud1')
        this.hudcentro.scale = 0.7;
        this.hudder =  this.add.image(900, 800, 'hud2')
       //this.hudder.scale = 0.30;


    }

	update(time){
		numvidas.setText(jugador.vidas);
		timeText.setText('Time: ' + (time*0.001).toFixed(2));
	}
   
}


class Pause extends Phaser.Scene {
    constructor (){
        super('Pause');
    }
}