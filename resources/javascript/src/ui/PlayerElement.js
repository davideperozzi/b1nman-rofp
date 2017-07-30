goog.provide('rofp.ui.PlayerElement');

// goog
goog.require('goog.Promise');
goog.require('goog.dom.classlist');

// rofp
goog.require('rofp.ui.AbstractPhysicElement');
goog.require('rofp.events.PlayerEvent');

/**
 * @constructor
 * @extends {rofp.ui.AbstractPhysicElement}
 */
rofp.ui.PlayerElement = function()
{
    rofp.ui.PlayerElement.base(this, 'constructor');

    /**
     * @private
     * @type {PIXI.Sprite}
     */
    this.sprite_ = null;

    /**
     * @private
     * @type {Function}
     */
    this.loadResolve_ = null;

    /**
     * @private
     * @type {Matter.Bodie}
     */
    this.floorSensor_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.walking_ = false;

    /**
     * @private
     * @type {Matter.Body}
     */
    this.player_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.shooting_ = false;

    /**
     * @private
     * @type {PIXI.Sprite}
     */
    this.bullet_ = null;

    /**
     * @private
     * @type {PIXI.particles.Emitter}
     */
    this.bulletEmitter_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.cancelVelocityOnNextMove_ = false;

    /**
     * @protected
     * @type {number}
     */
    this.elapsedTime_ = Date.now();

    /**
     * @private
     * @type {Matter.Body}
     */
    this.playerBody_ = null;

    /**
     * @private
     * @type {Matter.Body}
     */
    this.bulletBody_ = null;

    /**
     * @private
     * @type {number}
     */
    this.bulletWidth_ = 250;
};

goog.inherits(
    rofp.ui.PlayerElement,
    rofp.ui.AbstractPhysicElement
);

/** @inheritDoc */
rofp.ui.PlayerElement.prototype.init = function()
{
    return new goog.Promise(function(resolve, reject){
        this.sprite_ = new PIXI.Sprite.fromImage("resources/images/character/idle.png");
        this.sprite_.texture.baseTexture.on('loaded', this.spriteLoaded_.bind(this));
        this.sprite_.anchor.set(0.5, 1);

        this.bullet_ = new PIXI.TilingSprite.fromImage("resources/images/character/bullet.png");
        this.sprite_.addChild(this.bullet_);

        this.loadResolve_ = resolve;
    }, this);
};

/**
 * @return {boolean}
 */
rofp.ui.PlayerElement.prototype.isWalking = function()
{
    return this.walking_;
};

/**
 * @return {boolean}
 */
rofp.ui.PlayerElement.prototype.isShooting = function()
{
    return this.shooting_;
};


/**
 *
 */
rofp.ui.PlayerElement.prototype.spriteLoaded_ = function()
{
    this.playerBody_ = Matter.Bodies.rectangle(
        this.sprite_.width / 2,
        this.sprite_.height / 2,
        this.sprite_.width,
        this.sprite_.height, {
            density: 0.002,
            friction: 0.5
        }
    );

    this.floorSensor_ = Matter.Bodies.rectangle(
        this.sprite_.width / 2,
        this.sprite_.height - 2,
        this.sprite_.width,
        5,
        {
            isSensor: true
        }
    );

    this.bodies.push(this.player_ = Matter.Body.create({
        parts: [
            this.playerBody_,
            this.floorSensor_
        ],
        friction: 0.3,
        restitution: 0.3
    }));

    Matter.Body.translate(this.player_, {
        x: this.stageSize.width / 2 - this.sprite_.width / 2,
        y: this.stageSize.height / 2,
    });

    this.bullet_.alpha = 0;
    this.bullet_.width = 0;
    this.bullet_.height = 18;
    this.bullet_.anchor.set(0, 0);
    this.bullet_.position.y = -38;
    this.bullet_.position.x = 11;

    this.bodies.push(this.bulletBody_ = Matter.Bodies.rectangle(
        0,
        0,
        this.bulletWidth_,
        this.bullet_.height,
        {
            isStatic: true,
            isSensor: true
        }
    ));

    this.bulletEmitter_ = new PIXI.particles.Emitter(
        this.bullet_,
        [PIXI.Texture.fromImage("resources/images/character/bullet-particle.png")],
        {
            "alpha": {
                "start": 1,
                "end": 0.4
            },
            "scale": {
                "start": 0.1,
                "end": 0.02,
                "minimumScaleMultiplier": 1
            },
            "color": {
                "start": "#940700",
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
                "max": 360
            },
            "noRotation": false,
            "rotationSpeed": {
                "min": 0,
                "max": 0
            },
            "lifetime": {
                "min": 0.1,
                "max": .5
            },
            "blendMode": "normal",
            "frequency": 0.0002,
            "emitterLifetime": -0.9,
            "maxParticles": 5000,
            "pos": {
                "x": 0,
                "y": 0
            },
            "addAtBack": false,
            "spawnType": "rect",
            "spawnRect": {
                "x": 30,
                "y": 0,
                "w": 220,
                "h": this.bullet_.height
            }
        }
    );

    this.bulletEmitter_.emit = true;

    if (this.loadResolve_) {
        goog.async.nextTick(this.loadResolve_);
        this.loadResolve_ = null;
    }
};

/**
 * @return {Object}
 */
rofp.ui.PlayerElement.prototype.get = function()
{
    return this.sprite_;
};

/**
 * @return {Matter.Body}
 */
rofp.ui.PlayerElement.prototype.getBulletBody = function()
{
    return this.bulletBody_;
};


/**
 * @return {Matter.Body}
 */
rofp.ui.PlayerElement.prototype.getPlayerBody = function()
{
    return this.playerBody_;
};

/**
 * @return {boolean}
 */
rofp.ui.PlayerElement.prototype.isShooting = function()
{
    return this.shooting_;
};

/**
 * @return {Matter.Body}
 */
rofp.ui.PlayerElement.prototype.getMainBody = function()
{
    return this.player_;
};

/**
 * @private
 */
rofp.ui.PlayerElement.prototype.updatePlayerSprite_ = function()
{
    if (this.shooting_) {
        this.sprite_.setTexture(
            PIXI.Texture.fromImage("resources/images/character/attack.png")
        );
    }
    else {
        if (this.playerOnFloor_) {
            this.sprite_.setTexture(
                PIXI.Texture.fromImage("resources/images/character/idle.png")
            );
        }
        else {
            this.sprite_.setTexture(
                PIXI.Texture.fromImage("resources/images/character/jump.png")
            );
        }
    }
};

/**
 *
 */
rofp.ui.PlayerElement.prototype.collisionActive = function(event)
{
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === this.floorSensor_ ||
            pair.bodyB === this.floorSensor_) {
            this.playerOnFloor_ = true;
            this.updatePlayerSprite_();
        }
    }
};

/**
 *
 */
rofp.ui.PlayerElement.prototype.collisionEnd = function(event)
{
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA === this.floorSensor_ ||
            pair.bodyB === this.floorSensor_) {
            this.playerOnFloor_ = false;
            this.updatePlayerSprite_();
        }
    }
};

/**
 * @private
 */
rofp.ui.PlayerElement.prototype.startShoot_ = function()
{
    this.sprite_.rotation = 0;

    com.greensock.TweenMax.to(this.bullet_, .3, {
        width: 250,
        alpha: 1
    });

    Matter.Body.applyForce(
        this.player_,
        this.player_.position,
        {
            x: -0.002 * this.sprite_.scale.x * this.player_.mass,
            y: -0.0027 * this.player_.mass
        }
    );
};

/**
 * @private
 */
rofp.ui.PlayerElement.prototype.endShoot_ = function()
{
    com.greensock.TweenMax.to(this.bullet_, .2, {
        width: 0,
        alpha: 0
    });

    this.cancelVelocityOnNextMove_ = true;
};

/**
 * @param {number} damage
 */
rofp.ui.PlayerElement.prototype.hit = function(damage, optDirection)
{
    goog.dom.classlist.enable(document.body, 'hit', true);

    this.dispatchEvent(new rofp.events.PlayerEvent(
        rofp.events.PlayerEvent.EventType.PLAYER_HIT,
        damage
    ));

    setTimeout(function(){
        Matter.Body.applyForce(
            this.player_,
            this.player_.position,
            {
                x: -0.05 * (optDirection || 1) * this.player_.mass,
                y: -0.05 * this.player_.mass
            }
        );

        goog.dom.classlist.enable(document.body, 'hit', false);
    }.bind(this), 100);
};

/**
 * @public
 * @param {number} bonus
 */
rofp.ui.PlayerElement.prototype.handleKill = function(bonus)
{
    this.dispatchEvent(new rofp.events.PlayerEvent(
        rofp.events.PlayerEvent.EventType.ENEMY_KILL, 0, bonus));
};

/**
 *
 */
rofp.ui.PlayerElement.prototype.render = function(states)
{
    var elapsedTime = Date.now();

    Matter.Body.setAngle(this.player_, 0);

    this.bulletEmitter_.update((elapsedTime - this.elapsedTime_) * 0.001);

    if (states.shooting) {
        this.startShoot_();
    }

    if ( ! states.shooting && this.shooting_) {
        this.endShoot_();
    }

    if (states.walking.left) {
        Matter.Body.translate(this.player_, Matter.Vector.create(-8, 0));
        this.sprite_.scale.set(-1, 1);

        if ( ! this.shooting_) {
            this.sprite_.rotation = -0.2;
        }
    }

    if (states.walking.right) {
        Matter.Body.translate(this.player_, Matter.Vector.create(8, 0));
        this.sprite_.scale.set(1, 1);

        if ( ! this.shooting_) {
            this.sprite_.rotation = 0.2;
        }
    }

    this.walking_ = !states.jumping && (states.walking.right || states.walking.left);

    if (this.cancelVelocityOnNextMove_ && this.walking_) {
        Matter.Body.setVelocity(this.player_, Matter.Vector.create(0, this.player_.velocity.y));
        this.cancelVelocityOnNextMove_ = false;
    }

    if ( ! this.walking_) {
        this.sprite_.rotation = 0;
    }

    this.shooting_ = states.shooting;

    this.sprite_.position.x = this.player_.position.x;
    this.sprite_.position.y = this.player_.position.y + this.sprite_.height / 2;

    if (states.jumping && this.playerOnFloor_) {
        Matter.Body.applyForce(
            this.player_,
            this.player_.position,
            {
                x: 0,
                y: -0.06 * this.player_.mass
            }
        );

        states.jumping = false;
    }

    goog.dom.classlist.enable(document.body, 'shake', this.shooting_);
    goog.dom.classlist.enable(document.body, 'peek-left', states.walking.left);
    goog.dom.classlist.enable(document.body, 'peek-right', states.walking.right);

    this.updatePlayerSprite_();

    this.elapsedTime_ = elapsedTime;

    var bulletBodyPosX = this.player_.position.x + this.bulletWidth_ / 2 + this.sprite_.width / 2 + 2;

    if (this.sprite_.scale.x == -1) {
        bulletBodyPosX = this.player_.position.x - this.bulletWidth_ / 2 - this.sprite_.width / 2 - 2;
    }

    Matter.Body.setPosition(this.bulletBody_, {
        x: bulletBodyPosX,
        y: this.player_.position.y + 3
    });
};