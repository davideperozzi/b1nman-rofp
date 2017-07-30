goog.provide('rofp.ui.Enemy1Element');

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
rofp.ui.Enemy1Element = function(x, y)
{
    rofp.ui.Enemy1Element.base(this, 'constructor', x, y);

    /**
     * @private
     * @type {string}
     */
    this.spriteImage = "resources/images/enemy/enemy1.png";

    /**
     * @private
     * @type {number}
     */
    this.attackChance_ = 0.2;

    /**
     * @private
     * @type {number}
     */
    this.attackRange_ = 5;

    /**
     * @private
     * @type {number}
     */
    this.attackDuration_ = 2000;

    /**
     * @private
     * @type {number}
     */
    this.attackCooldown_ = 3000;

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
     * @type {PIXI.particles.Emitter}
     */
    this.attackEmmiter_ = null;

    /**
     * @private
     * @type {number}
     */
    this.attackEmmiterTime_ = Date.now();

    /**
     * @private
     * @type {number}
     */
    this.attackTimeout_ = -1;

    /**
     * @private
     * @type {boolean}
     */
    this.attackInterval_ = -1;

    /**
     * @protected
     * @type {number}
     */
    this.powerBonus = 4;

    /**
     * @private
     * @type {boolean}
     */
    this.allowHit_ = false;

    /**
     * @private
     * @type {boolean}
     */
    this.willAttack_ = false;

    /**
     * @private
     * @type {number}
     */
    this.startNextInterval_ = -1;

    /**
     * @protected
     * @type {bumber}
     */
    this.maxDamage = 200;
};

goog.inherits(
    rofp.ui.Enemy1Element,
    rofp.ui.AbstractEnemyElement
);

/**
 *
 */
rofp.ui.Enemy1Element.prototype.ready = function()
{
    this.attackEmmiter_ = new PIXI.particles.Emitter(
        this.sprite,
        [PIXI.Texture.fromImage("resources/images/enemy/attack-particle.png")],
        {
            "alpha": {
                "start": .3,
                "end": .2
            },
            "scale": {
                "start": 0.3,
                "end": 0.15,
                "minimumScaleMultiplier": 1
            },
            "color": {
                "start": "#000000",
                "end": "#000000"
            },
            "speed": {
                "start": 200,
                "end": 0,
                "minimumSpeedMultiplier": 0.96
            },
            "acceleration": {
                "x": 0,
                "y": 0
            },
            "maxSpeed": 0,
            "startRotation": {
                "min": 0,
                "max": 50
            },
            "noRotation": false,
            "rotationSpeed": {
                "min": 0,
                "max": 0
            },
            "lifetime": {
                "min": 0.2,
                "max": 0.9
            },
            "blendMode": "normal",
            "frequency": 0.0007,
            "emitterLifetime": -0.9,
            "maxParticles": 3000,
            "pos": {
                "x": 0,
                "y": 0
            },
            "addAtBack": false,
            "spawnType": "ring",
            "spawnCircle": {
                "x": 0,
                "y": -this.sprite.height / 2,
                "r": this.sprite.width - 20,
                "minR": this.sprite.width
            }
        }
    );

    this.attackEmmiter_.emit = false;
    this.startAttack_();
};

/**
 * @private
 */
rofp.ui.Enemy1Element.prototype.updateEnemySprite_ = function()
{
    if (this.willAttack_ || this.attacking_) {
        this.sprite.setTexture(
            PIXI.Texture.fromImage("resources/images/enemy/enemy1-attack.png")
        );
    }
    else {
        this.sprite.setTexture(
            PIXI.Texture.fromImage(this.spriteImage)
        );
    }
};

/**
 * @private
 */
rofp.ui.Enemy1Element.prototype.startAttack_ = function()
{
    this.attackInterval_ = setInterval(function(){
        if ( ! this.attacking_) {
            if (Math.random() > this.attackChance_) {
                this.willAttack_ = true;
                this.updateEnemySprite_();

                setTimeout(this.attack.bind(this), 800);
            }
        }
    }.bind(this), this.attackCooldown_ + 800);
};

/**
 *
 */
rofp.ui.Enemy1Element.prototype.destroy = function()
{
    clearInterval(this.attackInterval_);
    clearTimeout(this.attackTimeout_);
    clearInterval(this.startNextInterval_);
    this.attackTimeout_ = -1;
    this.attacking_ = false;
    this.allowHit_ = false;
    this.willAttack_ = false;
};

/**
 *
 */
rofp.ui.Enemy1Element.prototype.attack = function()
{
    this.hitProtect_ = false;
    this.attacking_ = true;
    this.willAttack_ = false;

    setTimeout(function(){
        this.allowHit_ = true;
    }.bind(this), 100);

    this.attackTimeout_ = setTimeout(function(){
        this.attacking_ = false;
        this.allowHit_ = false;
        this.stopAttack_();
    }.bind(this), this.attackDuration_);

    this.updateEnemySprite_();
};

/**
 * @private
 */
rofp.ui.Enemy1Element.prototype.stopAttack_ = function()
{
    clearInterval(this.attackInterval_);
    clearTimeout(this.attackTimeout_);
    this.attackTimeout_ = -1;
    this.attacking_ = false;
    this.allowHit_ = false;
    this.willAttack_ = false;

    this.startNextInterval_ = setTimeout(function(){
        this.startAttack_();
    }.bind(this), this.attackCooldown_);

    this.updateEnemySprite_();
};

/**
 * @inheritDoc
 */
rofp.ui.Enemy1Element.prototype.createEnemyBodyParts = function()
{
    this.attackBody_ = Matter.Bodies.circle(
        this.sprite.width / 2,
        this.sprite.height / 2,
        this.sprite.width / 2,
        {
            isSensor: true
        }
    );

    Matter.Body.scale(this.attackBody_, this.attackRange_, this.attackRange_);

    return [this.attackBody_];
};

/**
 * @inheritDoc
 */
rofp.ui.Enemy1Element.prototype.collisionActive = function(event)
{
    rofp.ui.Enemy1Element.base(this, 'collisionActive', event);

    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA == this.attackBody_ ||
            pair.bodyB == this.attackBody_) {
            var player = this.target.getPlayerBody();

            if (pair.bodyA == player||
                pair.bodyB == player) {

                if (this.attacking_ && this.allowHit_ && ! this.hitProtect_ && ! this.dying_) {
                    var direction = 1;

                    if (player.position.x > this.enemy.position.x) {
                        direction = -1;
                    }

                    this.target.hit(4, direction);
                    this.hitProtect_ = true;
                    this.stopAttack_();
                }
            }
        }
    }
};

/**
 * @inheritDoc
 */
rofp.ui.Enemy1Element.prototype.collisionStart = function(event)
{
    rofp.ui.Enemy1Element.base(this, 'collisionStart', event);
};


/**
 * @inheritDoc
 */
rofp.ui.Enemy1Element.prototype.collisionEnd = function(event)
{
    rofp.ui.Enemy1Element.base(this, 'collisionEnd', event);
};


/**
 * @inheritDoc
 */
rofp.ui.Enemy1Element.prototype.render = function(states)
{
    rofp.ui.Enemy1Element.base(this, 'render', states);

    var elapsedTime = Date.now();

    this.attackEmmiter_.update((elapsedTime - this.attackEmmiterTime_) * 0.001);
    this.attackEmmiter_.emit = this.attacking_;
    this.attackEmmiterTime_ = elapsedTime;
};