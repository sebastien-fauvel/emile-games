var TopDownGame = TopDownGame || {};

//loading the game assets
TopDownGame.Preload = function () {
};

TopDownGame.Preload.prototype = {
    preload: function () {
        //show loading screen
        this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
        this.preloadBar.anchor.setTo(0.5);

        this.load.setPreloadSprite(this.preloadBar);

        //load game assets
        this.load.tilemap('wiese', 'assets/tilemaps/wiese.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('haus', 'assets/tilemaps/haus.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap('strand', 'assets/tilemaps/strand.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('images-du-monde', 'assets/images/images-du-monde.png');
        this.load.image('images-dans-la-maison', 'assets/images/images-dans-la-maison.gif');
        this.load.image('16x16', 'assets/images/16x16.gif');
        this.load.spritesheet('link-marche', 'assets/images/link-marche.png', 15, 16);
        this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('gameTiles', 'assets/images/tiles.png');
        this.load.image('greencup', 'assets/images/greencup.png');
        this.load.image('bluecup', 'assets/images/bluecup.png');
        this.load.image('player', 'assets/images/player.png');
        this.load.image('browndoor', 'assets/images/browndoor.png');

    },
    create: function () {
        this.state.start('Game');
    }
};