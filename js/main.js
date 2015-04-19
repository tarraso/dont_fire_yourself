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
    game.load.tilemap('level_0', 'assets/maps/level_0.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('level_1', 'assets/maps/level_1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('level_2', 'assets/maps/level_2.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('level_3', 'assets/maps/level_3.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('level_4', 'assets/maps/level_4.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('level_5', 'assets/maps/level_5.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('level_6', 'assets/maps/level_6.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('firebulb', 'assets/sprites/fire_bulb.png');
    game.load.image('health_bar', 'assets/sprites/health_bar.png');


}

var player;
var fireEmitter;
var buttons = {};
var map;
var mainLayer;
var fireLayer;
var obstacleLayer;
var health = 120;
var healthbar;
var flyingObstacles;
var levelNumber = 0;

function create(){
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    buttons.W = game.input.keyboard.addKey(Phaser.Keyboard.W);
    buttons.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
    buttons.S = game.input.keyboard.addKey(Phaser.Keyboard.S);
    buttons.D = game.input.keyboard.addKey(Phaser.Keyboard.D);

    map = game.add.tilemap("level_"+levelNumber);
    map.addTilesetImage('tiles');
    mainLayer = map.createLayer('main');
    mainLayer.resizeWorld();
    map.setCollisionBetween(1, 20);
    game.physics.p2.convertTilemap(map, mainLayer);

    obstacleLayer = map.createLayer("obstacles")

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


    healthbar = this.game.add.sprite(12,12,'health_bar');
    healthbar.cropEnabled = true;
    healthbar.fixedToCamera = true;
    health = 120;
    
    flyingObstacles = game.add.group();

    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL; //resize your window to see the stage resize too
    game.stage.scale.setShowAll();
    game.stage.scale.refresh();
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
                if(map.getTile(i ,j,obstacleLayer) != null){
                    if(tile.index < 81 && Math.random()*600<1){
                        bang(i, j);                    
                    }else if(tile.index < 89 && Math.random()*300<1){
                        bang(i, j);                    
                    }else if(Math.random()*60<1)
                        bang(i, j);
                }
            }
            if(tile && tile.index>40 && tile.index< 51){
                if(Math.random()*5000 > 1){
                    map.putTile(51+Math.floor(10*Math.random()), i, j, fireLayer);
                }
            }
        }
    }


    var harm_tiles = [
        map.getTile(fireLayer.getTileX(player.body.x+4), fireLayer.getTileY(player.body.y+4), fireLayer),
        map.getTile(fireLayer.getTileX(player.body.x+4), fireLayer.getTileY(player.body.y-4), fireLayer),
        map.getTile(fireLayer.getTileX(player.body.x-4), fireLayer.getTileY(player.body.y+4), fireLayer),
        map.getTile(fireLayer.getTileX(player.body.x-4), fireLayer.getTileY(player.body.y-4), fireLayer),
    ]
    for (var i = 0; i < harm_tiles.length; i++) {
        if(!harm_tiles[i])
            continue;
        if(harm_tiles[i].index<81)
            health-=1;
        if(harm_tiles[i].index>80 && harm_tiles[i].index<91)
            health-=2;
        if(harm_tiles[i].index>90)
            health-=5;
    };
    healthbar.width = health;
    if(health<=1){
        gameOver();
    }
    flyingObstacles.forEachAlive(
        function(obstacle){
            var tile = map.getTile(fireLayer.getTileX(obstacle.body.x), fireLayer.getTileY(obstacle.body.y), fireLayer);
            if(!tile && Math.random()*100<1){
               putFire(fireLayer.getTileX(obstacle.body.x), fireLayer.getTileY(obstacle.body.y), fireLayer);
            }
        });

    if(getFiringCount()> map.width*map.height / 3){
        loadNextLevel();
    }
}

function gameOver(x,y){
    game.state.start("default");
}

function bang(x,y){
    var tile = map.getTile(x, y, obstacleLayer);
    if(!tile){
        return;
    }
    for(var i=0; i<10 + Math.random()*5; i++){
        var flying_shit = game.add.sprite(tile.worldX, tile.worldY, 'firebulb');
        game.physics.p2.enable(flying_shit);
        flying_shit.body.velocity.x = -500 + Math.random() * 1000;
        flying_shit.body.velocity.y = -500 + Math.random() * 1000;
        flying_shit.lifespan = 1000;
        flyingObstacles.add(flying_shit);
    }
    map.removeTile(x, y, obstacleLayer);
}

function getFiringCount(){
    var count = 0;
     for(var i=0; i< map.width; i++){
        for(var j=0; j< map.height; j++){
            if(map.getTile(i, j, fireLayer)){
                ++count;
            }
        }
    }
    return count
}

function loadNextLevel(name){
    levelNumber = (levelNumber + 1) % 7
    game.state.start("default");
}

function putFire(x,y){
    var tile = map.getTile(x, y, mainLayer);
    if(!tile) return;
    if(tile.index>10 && tile.index<40)
    map.putTile(71+Math.floor(10*Math.random()), x, y, fireLayer);
}

function getFiringPosition(){
    return {
        x: player.body.x - Math.cos(player.angle/180*Math.PI+Math.PI/2)*20 + Math.sin(player.angle/180*Math.PI+Math.PI/2)*3,
        y: player.body.y - Math.sin(player.angle/180*Math.PI+Math.PI/2)*20 + Math.cos(player.angle/180*Math.PI+Math.PI/2)*3,
    }
}

function render(){
    

}