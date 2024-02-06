

var player;
var platforms;
var cursors;
var platformMoving;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', '/prac_final/assets/sky.png');
    this.load.image('ground', '/prac_final/assets/block1.png');
    this.load.image('dude', '/prac_final/assets/robotiko.png' );
    this.load.image('bat', '/prac_final/assets/bat.png');
}

function create ()
{
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(0, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*2, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*4, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*6, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*8, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*10, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*12, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*14, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*16, 568, 'ground').setScale(2).refreshBody();
    platforms.create(42*18, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground').setScale(2).refreshBody();
    platforms.create(100, 250, 'ground').setScale(2).refreshBody();
    platforms.create(750, 250, 'ground').setScale(2).refreshBody();

    platformMoving = this.physics.add.image(400, 400, 'ground');
    platformsMoving2 = this.physics.add.image(200, 300, 'ground');

    platformMoving.setImmovable(true);
    platformMoving.body.allowGravity = false;
    platformMoving.setVelocityX(50);
    platformsMoving2.setImmovable(true);
    platformsMoving2.body.allowGravity = false;
    platformsMoving2.setVelocityX(50);

    player = this.physics.add.sprite(200, 450, 'dude');
    player.setBounce(0.0);
    player.setCollideWorldBounds(true);
    player.setScale(0.5);

    cursors = this.input.keyboard.createCursorKeys();

    bat = this.physics.add.image(400, 400, 'bat');
    platformsMoving2.setImmovable(true);
    platformsMoving2.body.allowGravity = false;
    platformsMoving2.setVelocityX(30);

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(player, platformMoving);
    this.physics.add.collider(player, platformsMoving2);

    this.physics.add.overlap(bat, player, collision);
}



function update ()
{
    //move to the sides
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);
    }
    else
    {
        player.setVelocityX(0);
    }

    //jump
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-320);
    }

    if (cursors.down.isDown) 
    {
        player.setVelocityY(420);
    }

    if (platformMoving.x >= 500)
    {
        platformMoving.setVelocityX(-50);
    }
    else if (platformMoving.x <= 300)
    {
        platformMoving.setVelocityX(50);
    }

    if (platformsMoving2.x >= 600)
    {
        platformsMoving2.setVelocityX(-50);
    }
    else if (platformsMoving2.x <= 200)
    {
        platformsMoving2.setVelocityX(50);
    }

    //bat movement
    if (bat.x >= player.x)
    {
        bat.setVelocityX(-50);
    }
    else if (bat.x <= player.x)
    {
        bat.setVelocityX(50);
    }
    if (bat.y >= player.y)
    {
        bat.setVelocityY(-50);
    }
    else if (bat.y <= player.y)
    {
        bat.setVelocityY(50);
    }

}

function collision(bat, player) {
    if (cursors.down.isDown) 
    {
        bat.disableBody(true, true)
    }
    else{
        player.disableBody(true, true);
        loadpage("./index.html")
    }
}