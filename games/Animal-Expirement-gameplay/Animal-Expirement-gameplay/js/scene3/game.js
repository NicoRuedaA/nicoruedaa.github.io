let jugador = {
	vidas : 3,
	genetica  : 100,
	pociones : 0,
	initialPositionx : 400,
	initialPositiony : 360,
  };

let enemigo = {
	dmg : 10,
	vel : 65,
	initialPositionx : 1280,
	initialPositiony : 360,
};


var timeText;
let numvidas
let numGenetica
let numPotis

let potis

let width = 2560
let height = 720

let P
let pause = false


class Game extends Phaser.Scene {
    constructor (){
        super('GameScene');
		
    }

    preload (){	
		this.load.image('background', '../resources/fondo.png');
		this.load.image('player', '../resources/conejo.png');
		this.load.image('cientifico', '../resources/cientifico.png');
		this.load.image('pocionBuena', '../resources/potiBuena.png');
		this.load.image('pocionMala', '../resources/potiMala.png');
		this.load.image('conejo_vidas', '../resources/conejo_vidas.png');
		this.load.image('llave', '../resources/llave.png');
		
	}
	
    create() {
		this.scene.launch('HUD');
		this.add.image(1280, 360, 'background');



		this.vidas = this.add.image(90, 100, 'conejo_vidas');
		this.vidas.scale = 0.5;
      	this.vidas.setScrollFactor(0,0);


		var genetica = this.add.image(90, 200, 'pocionMala');
		genetica.scale = 0.15;
		genetica.setScrollFactor(0,0);




		var potisHud = this.add.image(90, 300, 'pocionBuena');		
		potisHud.scale = 0.15;
		potisHud.setScrollFactor(0,0);


		this.cameras.main.setBounds(0,0, 2560, 720);
		this.physics.world.setBounds(0, 0, 2560, 720)
  
		this.player = this.physics.add.image(0, 0, 'player');
		this.player.setPosition(jugador.initialPositionx, jugador.initialPositiony)
		this.player.body.allowGravity = false;
		this.player.setBounce(0.5);
		  this.player.setCollideWorldBounds(true);
		this.player.setScale(0.5);
  
		this.cientifico = this.physics.add.image(enemigo.initialPositionx, enemigo.initialPositiony, 'cientifico').setImmovable();
		this.cientifico.body.allowGravity = false;
		this.cientifico.setCollideWorldBounds(true);
		this.cientifico.setScale(0.3)
  
		potis = this.physics.add.group();
		spawnPoti();
		this.physics.add.collider(this.player, potis, function(player, potion){
			recoger(potion);
		});
  
		this.physics.world.enableBody(this.cientifico);
  


		this.physics.add.collider(this.player, this.cientifico, function(player, cientifico){
			recibirDano(enemigo.dmg, player, cientifico);
		});


  
		this.cameras.main.startFollow(this.player);
  
		this.cursors = this.input.keyboard.createCursorKeys();	
		
		//TODO ESTOO PUESTO ELDOMINGO
		//timer = game.time.create(true);
		timeText = this.add.text(100, 400);
		timeText.setScrollFactor(0,0);

		P = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
	  }
	
	update(time){

		//this.game.physics.arcade.collide(this.cientifico, this.player, saoko());
  
		//this.cientifico.body.onCollide = saoko();
  
		this.physics.moveToObject(this.cientifico, this.player, enemigo.vel);


		//this.numvidas = this.add.text (150, 100, jugador.genetica,  {fill: '#0f0' });

		if(this.cursors.left.isDown){
			this.player.setVelocityX(-500, 0)
		  }
		  else if(this.cursors.right.isDown){
			this.player.setVelocity(500, 0)
		  }
		  else {
			this.player.setVelocityX(0)
		  }
		  if(this.cursors.up.isDown){
			this.player.setVelocityY(-500)
		  }
		  else if(this.cursors.down.isDown){
			this.player.setVelocityY(500)
		  }
		  else {
			this.player.setVelocityY(0)
		  }
		  

		timeText.setText('Time: ' + (time*0.001).toFixed(2));

		if (P.isDown){
			if (P.isDown){
				this.scene.pause();
				this.scene.launch('Pause');
				
			}
		}

	}

	


}



function recoger(object){

	jugador.pociones++;
	
	object.destroy();
	if(jugador.pociones>=10){
	  	loadpage("../html/phasergame2.html")
		this.Scene.stop();
	}
	else{
		enemigo.vel*=1.25
		spawnPoti()
	}
  }


function recibirDano(x, player, cientifico){

	jugador.genetica -= x;
	player.setPosition(player.x + 35*(player.x - cientifico.x)/Math.abs(player.x - cientifico.x), player.y);


	
	if(jugador.genetica<=0){
	  //aqui deberias vovler a la posicion inicial, perdiendo una vida y rellenando la barra de genetica
	  player.setPosition(jugador.initialPositionx, jugador.initialPositiony) 
	  cientifico.setPosition(enemigo.initialPositionx, enemigo.initialPositiony)
	  jugador.genetica=100;
	  jugador.vidas--;

	  
	  
	  
	 
	}
	if(jugador.vidas<=0){
		alert("perdiste mamahuevo");
		this.Scene.stop();
	  }
}


function spawnPoti(){
	var x = Math.random()*width
	var y = Math.random()*height;
	var poti = potis.create(x, y, 'pocionBuena');
	poti.setScale(0.25);
	poti.body.allowGravity = false;
}

class HUD extends Phaser.Scene {
    constructor (){
        super('HUD');
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
	   
	   numvidas = this.add.text (150, 100, jugador.vidas,  {fill: '#0f0' });
	   numvidas.setScrollFactor(0,0);
	   numGenetica = this.add.text (150, 200, jugador.genetica,  {fill: '#0f0' });
	   numGenetica.setScrollFactor(0,0);
	   numPotis = this.add.text (150, 300, jugador.pociones,  {fill: '#0f0' });
	   numPotis.setScrollFactor(0,0);
    }

	update(){
		numPotis.setText(jugador.pociones);
		numvidas.setText(jugador.vidas);
		numGenetica.setText(jugador.genetica);
	}
   
}


class Pause extends Phaser.Scene {
    constructor (){
        super('Pause');
    }

	preload(){

        this.load.image('exit', '../../resources/exit.png')
        this.load.image('resume', '../../resources/resume_game.png')
        this.load.image('prota', '../../resources/conejo.png')
        this.load.image('prota2', '../../resources/cerdo.png')
        this.load.image('prota3', '../../resources/raton.png')
        this.load.image('malo1', '../../resources/cientifico.png')
        this.load.image('malo2', '../../resources/potimala.png')
       
    }

    create(){

		P = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        
        let resumeButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height * 0.30, 'resume')
        let exitButton = this.add.image(this.game.renderer.width / 2, this.game.renderer.height / 2, 'exit')
        exitButton.scale = 0.45
        this.sprota = this.add.sprite(650, 290, 'prota')
        this.sprota.scale = 0.5
        this.sprota.setVisible(false);
        this.sprota2 = this.add.sprite(800, 700, 'prota2')
        this.sprota2.scale = 0.5
        this.sprota2.setVisible(false);
        this.sprota3 = this.add.sprite(1300, 450, 'prota3')
        this.sprota3.scale = 0.5
        this.sprota3.setVisible(false);

        this.malo1 = this.add.sprite(650, 400, 'malo1')
        this.malo1.scale = 0.3
        this.sprota3.setVisible(false);
        this.malo2 = this.add.sprite(960, 750, 'malo2')
        this.malo2.scale = 0.4
        this.sprota3.setVisible(false);





        resumeButton.setInteractive();
        resumeButton.on("pointerover", ()=>{ //raton por encima
            this.sprota.setVisible(true);
            this.sprota2.setVisible(true);
            this.sprota3.setVisible(true);
        })

        resumeButton.on("pointerout", ()=>{ //puntero sale del boton
            this.sprota.setVisible(false);
            this.sprota2.setVisible(false);
            this.sprota3.setVisible(false);
        })

        resumeButton.on("pointerup", ()=>{ //click
          //aqui iría la redirección al juego
          //loadpage("../scene3/game.js");  -> esta redirección no la pilla la muy zorra de los cojones
        })



        exitButton.setInteractive();
        exitButton.on("pointerover", ()=>{ // poner y quitar sprites decorativos sin prisa
            this.malo1.setVisible(true);
            this.malo2.setVisible(true);
           
        })

        exitButton.on("pointerout", ()=>{ //
            this.malo1.setVisible(false);
            this.malo2.setVisible(false);
            
        })

        exitButton.on("pointerup", ()=>{ //click
         loadpage("../../index.html");  
        })



    }

	update(){
		if (P.isDown){
            this.scene.resume('GameScene');
			this.scene.pause();
			
		}
	}
   
}