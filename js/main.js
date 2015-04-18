var MOVEMENT_SPEED = 250;
var WIDTH  = 480;
var HEIGHT = 270;
var game = new Phaser.Game(WIDTH, HEIGHT, 
        Phaser.AUTO, 'gamesatate', 
        { preload: preload, create: create, update: update, render: render },
        false,
        false);


function preload() {
    game.load.image('hero', 'assets/sprites/hero.png');
    game.load.image('tiles', 'assets/sprites/tiles.png');
    game.load.tilemap('level_1', 'assets/maps/level_1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('firebulb', 'assets/sprites/fire_bulb.png');

}

var player;
var fire_emitter;
var machine1 = null;
var buttons = {};
var map;
var main_layer;
var fire_layer

function create(){
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    buttons.W = game.input.keyboard.addKey(Phaser.Keyboard.W);
    buttons.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
    buttons.S = game.input.keyboard.addKey(Phaser.Keyboard.S);
    buttons.D = game.input.keyboard.addKey(Phaser.Keyboard.D);

    map = game.add.tilemap('level_1');
    map.addTilesetImage('tiles');
    main_layer = map.createLayer('main');
    main_layer.resizeWorld();

    map.setCollisionBetween(1, 10);
    game.physics.p2.convertTilemap(map, main_layer);

    player = game.add.sprite(game.world.centerX, game.world.centerY, 'hero');
    game.physics.p2.enable(player);
       
    game.camera.follow(player);

    fire_emitter = game.add.emitter(0,0,1000);
    fire_emitter.makeParticles('firebulb');
    fire_emitter.x = 4;
    fire_emitter.y = -8;
    fire_emitter.lifespan = 500;
    fire_emitter.maxParticleSpeed = new Phaser.Point(10,-50);
    fire_emitter.minParticleSpeed = new Phaser.Point(-10,-50);
    player.addChild(fire_emitter)
}

function update(){
    player.body.setZeroVelocity();
    if(buttons.W.isDown){
        player.body.moveUp(MOVEMENT_SPEED);
    }
    if(buttons.A.isDown){
        player.body.moveLeft(MOVEMENT_SPEED);
    }
    if(buttons.S.isDown){
        player.body.moveDown(MOVEMENT_SPEED);
    }
    if(buttons.D.isDown){
        player.body.moveRight(MOVEMENT_SPEED);
    }

    deltaMouseRad = player.rotation - game.physics.arcade.angleToPointer(player) - Math.PI/2
  
    //don't be confused. I want the P of 'Phaser' to point to the mouse so rotate it again by -90deg

    mod = Math.PI * 2
    //modulo on float, works in js, means: clamp value to [-Math.PI*2,Math.PI*2]
    deltaMouseRad = deltaMouseRad % mod; 

    //lets call it phase shift, angle would jump, lets fix it
    if (deltaMouseRad != deltaMouseRad % (mod/2) ) { 
    deltaMouseRad = (deltaMouseRad < 0) ? deltaMouseRad + mod : deltaMouseRad - mod;
    }
    //speed is some factor to get the object faster to the target rotation.
    //remember we are wotking with the angle velocity and let the engine
    //rotate the body
    speed = 350;
    player.body.rotateLeft(speed * deltaMouseRad);

    if(game.input.mousePointer.isDown){
        fire_emitter.emitParticle();
    }

}

function render(){

}