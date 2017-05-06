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
        this.createBoundaries();

        //create player
        var createPlayerFromTile = ('undefined' === typeof playerStart);
        if (createPlayerFromTile) {
            var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer');
            playerStart = {x: result[0].x, y: result[0].y};
        }
        this.player = this.game.add.sprite(playerStart.x, playerStart.y, 'link-marche');
        if (createPlayerFromTile) {
            this.player.y -= this.player.texture.height;
        }
        this.game.physics.arcade.enable(this.player);
        this.game.camera.follow(this.player);
        this.player.animations.add('left', [0, 1], 10, true);
        this.player.animations.add('down', [2, 3], 10, true);
        this.player.animations.add('up', [4, 5], 10, true);
        this.player.animations.add('right', [6, 7], 10, true);
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
    createBoundaries: function () {
        //create boundaries
        this.boundaries = this.game.add.group();
        this.boundaries.enableBody = true;
        result = this.findObjectsByType('boundary', this.map, 'objectsLayer');

        result.forEach(function (element) {
            var sprite = this.createFromTiledObject(element, this.boundaries);
            sprite.body.immovable = true;
        }, this);
    },

    //find objects in a Tiled layer that containt a property called "type" equal to a certain value
    findObjectsByType: function (type, map, layer) {
        var result = [];
        map.objects[layer].forEach(function (element) {
            if (element.properties.type === type) {
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
            sprite.y -= sprite.texture.height;
        } else {
            sprite = group.create(element.x, element.y, '16x16');
            sprite.enableBody = true;
            sprite.body.width = element.width;
            sprite.body.height = element.height;
        }

        //copy all properties to the sprite
        Object.keys(element.properties).forEach(function (key) {
            sprite[key] = element.properties[key];
        });
        return sprite;
    },
    update: function () {
        if (!this.player) {
            return;
        }
        //collision
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.player, this.boundaries);
        this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
        this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

        //player movement

        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        var animation = null;

        if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -50;
            animation = 'up';
        }
        else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = 50;
            animation = 'down';
        }
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -50;
            animation = 'left';
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 50;
            animation = 'right';
        }
        if (null !== animation) {
            this.player.animations.play(animation);
        }
        else {
            this.player.animations.stop();
        }
    },
    collect: function (player, collectable) {
        collectable.destroy();
    },
    enterDoor: function (player, door) {
        this.map.removeAllLayers();
        this.backgroundlayer.destroy();
        this.blockedLayer.destroy();
        this.items.destroy();
        this.doors.destroy();
        var targetX = this.player.position.x;
        var targetY = this.player.position.y;
        if ('undefined' !== typeof door.targetX) {
            targetX = door.targetX;
        }
        if ('undefined' !== typeof door.targetY) {
            targetY = door.targetY;
        }
        this.player.destroy();
        this.loadMap(door.targetTilemap, {x: targetX, y: targetY});
    }
};
