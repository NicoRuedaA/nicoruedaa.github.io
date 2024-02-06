class Game extends Phaser.Scene {
    constructor(){
        super({key: 'hud2'});

    }

    preload(){
        this.load.image('hud1', '../../resources/hud_images/scene2hud/hud_1.png')
        this.load.image('hud2', '../../resources/hud_images/scene2hud/hud_2.png')
    }

    create(){
        this.hudcentro =  this.add.image(1700, 800, 'hud1')
        this.hudcentro.scale = 0.7;
        this.hudder =  this.add.image(900, 800, 'hud2')
       //this.hudder.scale = 0.30;


    }
   
}