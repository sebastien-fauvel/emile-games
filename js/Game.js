var TopDownGame = TopDownGame || {};

//title screen
TopDownGame.Game = function () {
};

TopDownGame.Game.prototype = {
    loadMap: function (tilemap, playerStart) {
        this.map = this.game.add.tilemap(tilemap);

        //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
        this.map.addTilesetImage('images-du-monde', 'images-du-monde', 16, 16, 1, 1);
        this.map.addTilesetImage('images-dans-la-maison', 'images-dans-la-maison', 16, 16, 1, 1);

        //create layer
        this.backgroundlayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');

        //collision on blockedLayer
        this.map.setCollisionBetween(1, 2000, true, 'blockedLayer');

        //resizes the game world to match the layer dimensions
        this.backgroundlayer.resizeWorld();

        this.createItems();
        this.createDoors();

        //create player
        if ('undefined' === typeof playerStart) {
            var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
            playerStart = {x: result[0].x, y: result[0].y};
        }
        this.player = this.game.add.sprite(playerStart.x, playerStart.y, 'player');
        this.game.physics.arcade.enable(this.player);
        this.game.camera.follow(this.player);
    },
    create: function () {
        this.loadMap('wiese');
        this.cursors = this.game.input.keyboard.createCursorKeys();
    },
    createItems: function () {
        //create items
        this.items = this.game.add.group();
        this.items.enableBody = true;
        var item;
        result = this.findObjectsByType('item', this.map, 'objectsLayer');
        result.forEach(function (element) {
            this.createFromTiledObject(element, this.items);
        }, this);
    },
    createDoors: function () {
        //create doors
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'objectsLayer');

        result.forEach(function (element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
    },

    //find objects in a Tiled layer that containt a property called "type" equal to a certain value
    findObjectsByType: function (type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function (element) {
            if (element.properties.type === type) {
                //Phaser uses top left, Tiled bottom left so we have to adjust
                //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
                //so they might not be placed in the exact position as in Tiled
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },
    //create a sprite from an object
    createFromTiledObject: function (element, group) {
        var sprite;
        if ('undefined' !== typeof element.properties.sprite) {
            sprite = group.create(element.x, element.y, element.properties.sprite);
        } else {
            sprite = group.create(element.x, element.y + this.map.tileHeight, '16x16');
        }

        //copy all properties to the sprite
        Object.keys(element.properties).forEach(function (key) {
            sprite[key] = element.properties[key];
        });
    },
    update: function () {
        if (!this.player) {
            return;
        }
        //collision
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
        this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

        //player movement

        this.player.body.velocity.x = 0;

        if (this.cursors.up.isDown) {
            if (this.player.body.velocity.y == 0)
                this.player.body.velocity.y -= 50;
        }
        else if (this.cursors.down.isDown) {
            if (this.player.body.velocity.y == 0)
                this.player.body.velocity.y += 50;
        }
        else {
            this.player.body.velocity.y = 0;
        }
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x -= 50;
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x += 50;
        }
    },
    collect: function (player, collectable) {
        console.log('yummy!');

        //remove sprite
        collectable.destroy();
    },
    enterDoor: function (player, door) {
        this.map.removeAllLayers();
        this.backgroundlayer.destroy();
        this.blockedLayer.destroy();
        this.items.destroy();
        this.doors.destroy();
        this.player.destroy();
        this.loadMap(door.targetTilemap, {x: door.targetX, y: door.targetY});
    }
};