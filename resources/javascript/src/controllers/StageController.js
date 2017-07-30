goog.provide('rofp.controllers.StageController');

// rofp
goog.require('rofp.ui.GroundElement');
goog.require('rofp.ui.WallElement');
goog.require('rofp.controllers.AbstractController');
goog.require('rofp.ui.AbstractPhysicElement');
goog.require('rofp.ui.BackgroundElement');
goog.require('rofp.controllers.PlatformController');
goog.require('rofp.controllers.EnemyController');
goog.require('rofp.dispatchers.GameEventDispatcher');

/**
 * @constructor
 * @extends {rofp.controllers.AbstractController}
 */
rofp.controllers.StageController = function()
{
    rofp.controllers.StageController.base(this, 'constructor');

    /**
     * @private
     * @type {PIXI.Container}
     */
    this.stage_ = new PIXI.Container();

    /**
     * @private
     * @type {rofp.ui.GroundElement}
     */
    this.ground_ = new rofp.ui.GroundElement();

    /**
     * @private
     * @type {rofp.ui.GroundElement}
     */
    this.wall_ = new rofp.ui.WallElement();

    /**
     * @private
     * @type {rofp.ui.BackgroundElement}
     */
    this.background_ = new rofp.ui.BackgroundElement();

    /**
     * @private
     * @type {rofp.controllers.PlatformController}
     */
    this.platformController_ = new rofp.controllers.PlatformController();

    /**
     * @private
     * @type {rofp.controllers.EnemyController}
     */
    this.enemyController_ = new rofp.controllers.EnemyController();

    /**
     * @private
     * @type {Matter.Engine}
     */
    this.engine_ = Matter.Engine.create();

    /**
     * @private
     * @type {rofp.controllers.PlayerController}
     */
    this.playerController_ = null;

    /**
     * @private
     * @type {Matter.Render}
     */
    this.renderer_ = Matter.Render.create({
        element: goog.dom.getElementByClass('debug-wrapper'),
        engine: this.engine_,
        options: {
            width: 1024,
            height: 600,
            background: 'transparent',
            wireframeBackground: 'transparent',
            showAxes: true,
            showCollisions: true,
            showConvexHulls: true
        }
    });

    /**
     * @private
     * @type {Matter.Runner}
     */
    this.runner_ = null;
};

goog.inherits(
    rofp.controllers.StageController,
    rofp.controllers.AbstractController
);

/**
 * @enum {string}
 */
rofp.controllers.StageController.EventType = {
    COLLISION_START: 'matter-collision-start',
    COLLISION_ACTIVE: 'matter-collsion-active',
    COLLISION_END: 'matter-collision-end'
};

/**
 * @param {goog.math.Size} size
 */
rofp.controllers.StageController.prototype.init = function(size)
{
    // Background
    this.background_.setStageSize(size.width, size.height);
    this.background_.init().then(function(){
        this.add(this.background_);
    }, null, this);

    // Walls
    this.wall_.setStageSize(size.width, size.height);
    this.wall_.init().then(function(){
        this.add(this.wall_);
    }, null, this);

    // Ground
    this.ground_.setStageSize(size.width, size.height);
    this.ground_.init().then(function(){
        this.add(this.ground_);
    }, null, this);

    this.engine_.world.gravity.y = 2.5;

    this.platformController_.init(this, size);
    this.enemyController_.init(this, size);

    Matter.Events.on(this.engine_, 'collisionActive', this.handleCollisionActive_.bind(this));
    Matter.Events.on(this.engine_, 'collisionEnd', this.handleCollisionEnd_.bind(this));
    Matter.Events.on(this.engine_, 'collisionStart', this.handleCollisionStart_.bind(this));

    this.runner_ = Matter.Engine.run(this.engine_);
    Matter.Render.run(this.renderer_);

    goog.events.listen(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_WON,
        function(){
            setTimeout(function(){
                this.nextWave_();
            }.bind(this), 1000);
        }, false, this);

    goog.events.listen(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_LOST,
        this.handleLost_, false, this);

    this.nextWave_();
};

/**
 *
 */
rofp.controllers.StageController.prototype.destroy = function()
{
    this.stage_.destroy();

    Matter.Events.off(this.engine_, 'collisionActive', this.handleCollisionActive_.bind(this));
    Matter.Events.off(this.engine_, 'collisionEnd', this.handleCollisionEnd_.bind(this));
    Matter.Events.off(this.engine_, 'collisionStart', this.handleCollisionStart_.bind(this));

    Matter.Runner.stop(this.runner_);
    Matter.World.clear(this.engine_.world);
    Matter.Engine.clear(this.engine_);
};

rofp.controllers.StageController.prototype.reset = function()
{

};

/**
 * @private
 */
rofp.controllers.StageController.prototype.handleLost_ = function()
{
    this.gameEventDispatcher.gameOver();
};

/**
 * @private
 */
rofp.controllers.StageController.prototype.nextWave_ = function()
{
    setTimeout(function(){
        if ( ! rofp.components.GameComponent.GAME_OVER) {
            this.enemyController_.start();
        }
    }.bind(this), 1000);
};

/**
 * @private
 */
rofp.controllers.StageController.prototype.handleCollisionStart_ = function(event)
{
    this.dispatchEvent({
        'type': rofp.controllers.StageController.EventType.COLLISION_START,
        'original': event
    });
};

/**
 * @private
 */
rofp.controllers.StageController.prototype.handleCollisionActive_ = function(event)
{
    this.dispatchEvent({
        'type': rofp.controllers.StageController.EventType.COLLISION_ACTIVE,
        'original': event
    });
};

/**
 * @private
 */
rofp.controllers.StageController.prototype.handleCollisionEnd_ = function(event)
{
    this.dispatchEvent({
        'type': rofp.controllers.StageController.EventType.COLLISION_END,
        'original': event
    });
};

/**
 * @public
 * @param {Object} renderer
 */
rofp.controllers.StageController.prototype.render = function(renderer)
{
    renderer.render(this.stage_);

    this.platformController_.render(renderer);
    this.enemyController_.render(renderer);
};

/**
 * @public
 * @param {rofp.controllers.PlayerController} controller
 */
rofp.controllers.StageController.prototype.setPlayer = function(controller)
{
    this.playerController_ = controller;
    this.enemyController_.setTarget(controller.getPlayer());
};

/**
 * @public
 * @return {rofp.controllers.EnemyController}
 */
rofp.controllers.StageController.prototype.getEnemyController = function()
{
    return this.enemyController_;
};


/**
 * @public
 * @return {rofp.controllers.PlayerController}
 */
rofp.controllers.StageController.prototype.getPlayerController = function()
{
    return this.playerController_;
};

/**
 * @param {rofp.ui.AbstractElement} element
 */
rofp.controllers.StageController.prototype.add = function(element)
{
    if (element instanceof rofp.ui.AbstractPhysicElement) {;
        Matter.World.add(this.engine_.world, element.getBodies());
    }

    var sprite = element.get();

    if (sprite) {
        this.stage_.addChild(sprite);
    }
};

/**
 * @param {rofp.ui.AbstractElement} element
 */
rofp.controllers.StageController.prototype.remove = function(element)
{
    var sprite = element.get();

    if (element instanceof rofp.ui.AbstractPhysicElement) {;
        Matter.World.remove(this.engine_.world, element.getBodies());
    }

    if (sprite) {
        this.stage_.removeChild(sprite);
    }
};