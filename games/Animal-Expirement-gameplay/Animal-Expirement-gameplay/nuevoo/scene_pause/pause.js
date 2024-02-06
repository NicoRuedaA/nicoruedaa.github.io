class Game extends Phaser.Scene {
    constructor(){
        super({key: 'pause'});

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
   
}