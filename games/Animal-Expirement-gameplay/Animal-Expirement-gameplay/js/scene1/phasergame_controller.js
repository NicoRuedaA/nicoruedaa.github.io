
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game_area',
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 1000},
			debug: false
		}
	},
    scene: [ GameScene, Pause ]
};

var game = new Phaser.Game(config);

