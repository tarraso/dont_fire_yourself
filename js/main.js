var MOVEMENT_SPEED = 200;
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
var fireEmitter;
var buttons = {};
var map;
var mainLayer;
var fireLayer;


function create(){
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    buttons.W = game.input.keyboard.addKey(Phaser.Keyboard.W);
    buttons.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
    buttons.S = game.input.keyboard.addKey(Phaser.Keyboard.S);
    buttons.D = game.input.keyboard.addKey(Phaser.Keyboard.D);

    map = game.add.tilemap('level_1');
    map.addTilesetImage('tiles');
    mainLayer = map.createLayer('main');
    mainLayer.resizeWorld();

    map.setCollisionBetween(1, 20);
    game.physics.p2.convertTilemap(map, mainLayer);

    fireLayer = map.createBlankLayer("fire_layer", map.width, map.height, 16, 16);
    player = game.add.sprite(game.world.centerX, game.world.centerY, 'hero');
    game.physics.p2.enable(player);
       
    game.camera.follow(player);

    fireEmitter = game.add.emitter(0,0,1000);
    fireEmitter.makeParticles('firebulb');
    fireEmitter.x = 4;
    fireEmitter.y = -8;
    fireEmitter.lifespan = 500;
    fireEmitter.maxParticleSpeed = new Phaser.Point(10,-50);
    fireEmitter.minParticleSpeed = new Phaser.Point(-10,-50);
    player.addChild(fireEmitter)
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

    if(game.input.mousePointer.isDown && Math.random()*20<1){
        fireEmitter.emitParticle();
        var firingPosigion  = getFiringPosition();
        var x = fireLayer.getTileX(firingPosigion.x);
        var y = fireLayer.getTileX(firingPosigion.y);
        var mainTile =  map.getTile(x, y, mainLayer);
        if(mainTile && mainTile.index>10){
            putFire(x,y);
        }
    }

    for(var i=0; i< map.width; i++){
        for(var j=0; j< map.height; j++){
            var tile = map.getTile(i, j, fireLayer);
            if(tile && tile.index>70 && tile.index<=100){
                tile.flipped = !tile.flipped;
                if(Math.random()*10000 < 1){
                    map.removeTile(i, j, fireLayer);
                    continue;
                };
                if(Math.random()*1000 < 1){
                    map.putTile(81+Math.floor(10*Math.random()), i, j, fireLayer);
                }
                var x = i - 1 + Math.floor(Math.random()*3);
                var y = j - 1 + Math.floor(Math.random()*3);
                if((x!=i || y!=j) && !map.getTile(x,y, fireLayer)){
                    var mainTile = map.getTile(x, y, mainLayer);
                    if(mainTile){
                        var mainIdx = mainTile.index;
                        if(mainIdx>20 && mainIdx<31 && Math.random()*500<1){
                             putFire(x,y);
                        }
                        if(mainIdx>30 && mainIdx<41 && Math.random()*100<1){
                            putFire(x,y);
                        }
                    }
                }
            }
            if(tile && tile.index>40 && tile.index< 51){
                if(Math.random()*5000 > 1){
                    map.putTile(51+Math.floor(10*Math.random()), i, j, fireLayer);
                }
            }
        }
    }

}

function putFire(x,y){
    map.putTile(71+Math.floor(10*Math.random()), x, y, fireLayer);
}

function getFiringPosition(){
    return {
        x: player.body.x - Math.cos(player.angle/180*Math.PI+Math.PI/2)*20 + Math.sin(player.angle/180*Math.PI+Math.PI/2)*3,
        y: player.body.y - Math.sin(player.angle/180*Math.PI+Math.PI/2)*20 + Math.cos(player.angle/180*Math.PI+Math.PI/2)*3,
    }
}
function render(){
    var circle = new Phaser.Circle(
        player.body.x - Math.cos(player.angle/180*Math.PI+Math.PI/2)*20 + Math.sin(player.angle/180*Math.PI+Math.PI/2)*3,
        player.body.y - Math.sin(player.angle/180*Math.PI+Math.PI/2)*20 + Math.cos(player.angle/180*Math.PI+Math.PI/2)*3,
        3);
    game.debug.geom( circle, 'rgba(255,255,0,1)' ) ;

}