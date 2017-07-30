goog.provide('rofp.ui.Enemy2Element');

// goog
goog.require('goog.Promise');
goog.require('goog.math');
goog.require('goog.dom.classlist');

// rofp
goog.require('rofp.ui.AbstractEnemyElement');

/**
 * @constructor
 * @extends {rofp.ui.AbstractEnemyElement}
 * @param {number} x
 * @param {number} y
 */
rofp.ui.Enemy2Element = function(x, y)
{
    rofp.ui.Enemy2Element.base(this, 'constructor', x, y);

    /**
     * @protected
     * @type {string}
     */
    this.spriteImage = "resources/images/enemy/enemy2.png";

    /**
     * @private
     * @type {Matter.Body}
     */
    this.attackBody_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.hitProtect_ = false;

    /**
     * @private
     * @type {boolean}
     */
    this.hittingGround_ = false;

    /**
     * @private
     * @type {Matter.Body}
     */
    this.groundSensor_ = null;

    /**
     * @protected
     * @type {number}
     */
    this.powerBonus = 5;
};

goog.inherits(
    rofp.ui.Enemy2Element,
    rofp.ui.AbstractEnemyElement
);

/**
 * @inheritDoc
 */
rofp.ui.Enemy2Element.prototype.createEnemyBodyParts = function()
{
    this.attackBody_ = Matter.Bodies.rectangle(
        this.sprite.width / 2,
        this.sprite.height / 2,
        this.sprite.width,
        this.sprite.height,
        {
            isSensor: true
        }
    );

    this.groundSensor_ = Matter.Bodies.rectangle(
        this.sprite.width / 2,
        this.sprite.height,
        this.sprite.width,
        10,
        {
            isSensor: true
        }
    );

    return [this.attackBody_, this.groundSensor_];
};

/**
 *
 */
rofp.ui.Enemy2Element.prototype.collisionActive = function(event)
{
    rofp.ui.Enemy2Element.base(this, 'collisionActive', event);

    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA == this.groundSensor_ ||
            pair.bodyB == this.groundSensor_)  {
            this.hittingGround_ = true;
        }

        if (pair.bodyA == this.attackBody_ ||
            pair.bodyB == this.attackBody_) {
            var player = this.target.getPlayerBody();

            if (pair.bodyA == player||
                pair.bodyB == player) {
                var direction = 1;

                if (player.position.x > this.enemy.position.x) {
                    direction = -1;
                }

                if ( ! this.hitProtect_ && ! this.dying_) {
                    this.target.hit(7, direction);
                    this.hitProtect_ = true;
                    this.handleDie();
                }
            }
        }
    }
};

/**
 *
 */
rofp.ui.Enemy2Element.prototype.destroy = function()
{

};

/**
 *
 */
rofp.ui.Enemy2Element.prototype.collisionEnd = function(event)
{
    rofp.ui.Enemy2Element.base(this, 'collisionEnd', event);

    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA == this.groundSensor_ ||
            pair.bodyB == this.groundSensor_)  {
            this.hittingGround_ = false;
        }
    }
};


/**
 *
 */
rofp.ui.Enemy2Element.prototype.render = function(states)
{
    rofp.ui.Enemy2Element.base(this, 'render', states);

    if ( ! this.dying) {

        var targetBody = this.target.getMainBody();
        var targetSprite = this.target.get();

        var direction = 1;
        var walkSpeed = 0;

        if (targetBody.position.x < this.enemy.position.x) {
            direction = -1;
        }

        var targetCenterPoint = targetSprite.position.y - targetSprite.height / 2;

        if (this.target.isWalking() || this.target.isShooting()) {
            if (targetCenterPoint > this.sprite.position.y - this.sprite.height &&
                targetCenterPoint < this.sprite.position.y) {
                walkSpeed = 2;
                Matter.Body.translate(this.enemy, Matter.Vector.create(walkSpeed * direction, 0));
            }
            else {
                if (this.hittingGround_) {
                    if (targetSprite.position.y < this.sprite.position.y - this.sprite.height) {
                            Matter.Body.applyForce(
                            this.enemy,
                            this.enemy.position,
                            {
                                x: 0.0025 * direction * this.enemy.mass,
                                y: -0.03 * this.enemy.mass
                            }
                        );
                    }
                    else {
                        Matter.Body.applyForce(
                            this.enemy,
                            this.enemy.position,
                            {
                                x: 0.004 * direction * this.enemy.mass,
                                y: -0.015 * this.enemy.mass
                            }
                        );
                    }
                }
            }
        }

        Matter.Body.translate(this.enemy, Matter.Vector.create(walkSpeed * direction, 0));
    }
};