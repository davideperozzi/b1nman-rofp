goog.provide('rofp.controllers.PlayerController');

// goog
goog.require('goog.events.KeyCodes');

// rofp
goog.require('rofp.ui.PlayerElement');
goog.require('rofp.events.PlayerEvent');
goog.require('rofp.controllers.AbstractController');

/**
 * @constructor
 * @extends {rofp.controllers.AbstractController}
 */
rofp.controllers.PlayerController = function()
{
    rofp.controllers.PlayerController.base(this, 'constructor');

    /**
     * @private
     * @type {rofp.controllers.StageController}
     */
    this.stageController_ = null;

    /**
     * @private
     * @type {rofp.ui.PlayerElement}
     */
    this.playerElement_ = new rofp.ui.PlayerElement();

    /**
     * @private
     * @type {number}
     */
    this.power_ = 100;

    /**
     * @private
     * @type {goog.math.Size}
     */
    this.stageSize_ = new goog.math.Size(0, 0);

    /**
     * @type {Object}
     */
    this.states_ = {
        walking: {
            left: false,
            right: false
        },
        jumping: false,
        shooting: false
    };
};

goog.inherits(
    rofp.controllers.PlayerController,
    rofp.controllers.AbstractController
);

/**
 * @enum {string}
 */
rofp.controllers.PlayerController.EventType = {
    POWER_UPDATED: 'player-power-updated'
};

/**
 * @param {rofp.controllers.StageController} stage
 * @param {goog.math.Size} size
 */
rofp.controllers.PlayerController.prototype.init = function(stage, size)
{
    this.stageController_ = stage;
    this.stageSize_ = size;

    this.playerElement_.setStageSize(this.stageSize_.width, this.stageSize_.height);
    this.playerElement_.init().then(function(){
        this.stageController_.add(this.playerElement_);
    }, null, this);

    goog.events.listen(this.stageController_,
        rofp.controllers.StageController.EventType.COLLISION_ACTIVE, function(event){
            if (event.original) {
                this.playerElement_.collisionActive(event.original);
            }
        }, false, this);

    goog.events.listen(this.stageController_,
        rofp.controllers.StageController.EventType.COLLISION_END, function(event){
            if (event.original) {
                this.playerElement_.collisionEnd(event.original);
            }
        }, false, this);

    goog.events.listen(window, goog.events.EventType.KEYDOWN,
        this.handleKeyDown_, false, this);

    goog.events.listen(window, goog.events.EventType.KEYUP,
        this.handleKeyUp_, false, this);

    goog.events.listen(this.playerElement_, rofp.events.PlayerEvent.EventType.PLAYER_HIT,
        this.handlePlayerHit_, false, this);

    goog.events.listen(this.playerElement_, rofp.events.PlayerEvent.EventType.ENEMY_KILL,
        this.handleEnemyKill_, false, this);
};

/**
 *
 */
rofp.controllers.PlayerController.prototype.destroy = function()
{
    this.stageController_.remove(this.playerElement_);
};

/**
 * @private
 * @param {rofp.events.PlayerEvent} event
 */
rofp.controllers.PlayerController.prototype.handlePlayerHit_ = function(event)
{
    this.removePower(event.damage);
};

/**
 * @private
 * @param {rofp.events.PlayerEvent} event
 */
rofp.controllers.PlayerController.prototype.handleEnemyKill_ = function(event)
{
    this.addPower(event.bonus);
};

/**
 * @private
 * @param {goog.events.BrowserEvent} event
 */
rofp.controllers.PlayerController.prototype.handleKeyDown_ = function(event)
{
    if (event.keyCode == goog.events.KeyCodes.RIGHT) {
        this.states_.walking.right = true;
        this.states_.walking.left = false;
    }
    else if (event.keyCode == goog.events.KeyCodes.LEFT) {
        this.states_.walking.left = true;
        this.states_.walking.right = false;
    }

    if (event.keyCode == goog.events.KeyCodes.UP) {
        this.states_.jumping = true;
    }

    if (event.keyCode == goog.events.KeyCodes.SPACE) {
        this.states_.shooting = true;
    }
};

/**
 * @param {goog.events.BrowserEvent} event
 * @private
 */
rofp.controllers.PlayerController.prototype.handleKeyUp_ = function(event)
{
    if (event.keyCode == goog.events.KeyCodes.RIGHT) {
        this.states_.walking.right = false;
    }
    else if (event.keyCode == goog.events.KeyCodes.LEFT) {
        this.states_.walking.left = false;
    }

    if (event.keyCode == goog.events.KeyCodes.UP) {
        this.states_.jumping = false;
    }

    if (event.keyCode == goog.events.KeyCodes.SPACE) {
        this.states_.shooting = false;
    }
};

/**
 * @public
 * @param {Object} renderer
 */
rofp.controllers.PlayerController.prototype.render = function(renderer)
{
    if (this.playerElement_.isReady()) {
        this.playerElement_.render(this.states_);

        if (this.playerElement_.isShooting()) {
            this.removePower(0.3);
        }
    }
};

/**
 * @param {number} amount
 */
rofp.controllers.PlayerController.prototype.removePower = function(amount)
{
    this.power_ -= amount;
    this.powerUpdated_();
};

/**
 * @param {number} power
 */
rofp.controllers.PlayerController.prototype.addPower = function(power)
{
    this.power_ += power;
    this.powerUpdated_();
};

/**
 * @param {number} power
 */
rofp.controllers.PlayerController.prototype.setPower = function(power)
{
    this.power_ = power;
    this.powerUpdated_();
};

/**
 * @private
 */
rofp.controllers.PlayerController.prototype.powerUpdated_ = function()
{
    this.power_ = goog.math.clamp(this.power_, 0, 100);

    if (this.power_ <= 0 && ! rofp.components.GameComponent.GAME_OVER) {
        this.gameEventDispatcher.gameOver();
    }

    this.dispatchEvent(rofp.controllers.PlayerController.EventType.POWER_UPDATED);
};

/**
 * @return {rofp.ui.PlayerElement}
 */
rofp.controllers.PlayerController.prototype.getPlayer = function()
{
    return this.playerElement_;
};

/**
 * @return {number}
 */
rofp.controllers.PlayerController.prototype.getPower = function()
{
    return this.power_;
};