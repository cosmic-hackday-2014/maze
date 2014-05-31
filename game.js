
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('map', 'assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('ground_1x1', 'assets/tilemaps/tiles/ground_1x1.png');
    game.load.image('walls_1x2', 'assets/tilemaps/tiles/walls_1x2.png');
    game.load.image('tiles2', 'assets/tilemaps/tiles/tiles2.png');
    game.load.image('patient', 'assets/sprites/patient.png');
    game.load.image('angel', 'assets/sprites/angel.png');
    game.load.image('ward', 'assets/sprites/buildingmanager.png');
    game.load.image('magician', 'assets/sprites/magician.png');
    game.load.image('nurse', 'assets/sprites/nurse.png');
    // game.load.image('puppy', 'assets/sprites/thrust_ship2.png');
}

var ship;
var map;
var layer;
var cursors;
var form_values = [];
var mapping = {
    "nurse": 24006641,
    "ward": 24006821,
    "angel": 24006801,
    "magician": 24006972,
}

function create() {

    game.physics.startSystem(Phaser.Physics.P2JS);

    game.stage.backgroundColor = '#63D1F4';

    map = game.add.tilemap('map');

    map.addTilesetImage('ground_1x1');
    map.addTilesetImage('walls_1x2');
    map.addTilesetImage('tiles2');
    
    layer = map.createLayer('Tile Layer 1');

    layer.resizeWorld();

    //  Set the tiles for collision.
    //  Do this BEFORE generating the p2 bodies below.
    map.setCollisionBetween(1, 12);

    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
    //  This call returns an array of body objects which you can perform addition actions on if
    //  required. There is also a parameter to control optimising the map build.
    game.physics.p2.convertTilemap(map, layer);

    patient = game.add.sprite(200, 200, 'patient');
    game.physics.p2.enable(patient);
    patient.body.onBeginContact.add(blockHit, this);
    game.camera.follow(patient);

    nurse = game.add.sprite(500, 150, 'nurse');
    game.physics.p2.enable(nurse);

    angel = game.add.sprite(600, 30, 'angel');
    game.physics.p2.enable(angel);

    magician = game.add.sprite(100, 500, 'magician');
    game.physics.p2.enable(magician);

    ward = game.add.sprite(1400, 500, 'ward');
    game.physics.p2.enable(ward);

    //  By default the ship will collide with the World bounds,
    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap
    //  you need to rebuild the physics world boundary as well. The following
    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.
    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require
    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.
    game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:
    // ship.body.collideWorldBounds = false;

    cursors = game.input.keyboard.createCursorKeys();

}

function blockHit (body, shapeA, shapeB, equation) {
    if (!body.sprite) {
        return;
    }

    var docHeight = $(document).height();
    $("#" + body.sprite.key+ "Overlay").css({"display": "block", "height": docHeight});
}

function update() {

    if (cursors.left.isDown)
    {
        patient.body.rotateLeft(100);
    }
    else if (cursors.right.isDown)
    {
        patient.body.rotateRight(100);
    }
    else
    {
        patient.body.setZeroRotation();
    }

    if (cursors.up.isDown)
    {
        patient.body.thrust(400);
    }
    else if (cursors.down.isDown)
    {
        patient.body.reverse(400);
    }

}

function render() {
}

function submitReturn(element) {
    var form = {};
    $(element).closest("div").hide();

    $.each($(element).serializeArray(), function(i, val) {
        form[val.name] = val.value;
    });

    var game_obj;
    if (form["id"] == "nurse") {
        game_obj = nurse;
    } else if (form["id"] == "ward") {
        game_obj = ward;
    } else if (form["id"] == "angel") {
        game_obj = angel;
    } else if (form["id"] == "magician") {
        game_obj = magician;
    }

    form["id"] = mapping[form["id"]];

    form_values.push(form);

    game_obj.exists = false;

    if (form_values.length == 4) {
        submitFinal();
    }

    return false;
}

function submitFinal() {
    // send new ticket to Zendesk
    var form_data = {
        "ticket": {
            "subject": "My printer is on fire!",
            "custom_fields":form_values,
            "comment": {"body": "AWEF"}
        }
    };

    alert("submit:" + form_data);

    $.ajax({
        url: "https://cosmichackday.zendesk.com/api/v2/tickets.json",
        beforeSend: function(xhr) { 
          xhr.setRequestHeader("Authorization", "Basic " + btoa("username:password")); 
        },
        type: 'POST',
        user: 'gregoryloyse@gmail.com%2Ftoken',
        password: 'Ki3B7LsAblJnzfsj2SrAcFvB2KrvFRn4DqCuGCBR',
        dataType: 'json',
        contentType: 'application/json',
        processData: false,
        data: form_data,
        success: function (data) {
          alert(JSON.stringify(data));
        },
        error: function(){
          alert("Cannot get data");
        }
});
}
