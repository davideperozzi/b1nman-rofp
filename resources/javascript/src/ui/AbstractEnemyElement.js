goog.provide('rofp.ui.AbstractEnemyElement');

// goog
goog.require('goog.Promise');
goog.require('goog.dom.classlist');
goog.require('goog.math.Coordinate');

// rofp
goog.require('rofp.ui.AbstractPhysicElement');

/**
 * @constructor
 * @extends {rofp.ui.AbstractPhysicElement}
 * @param {number} x
 * @param {number} y
 */
rofp.ui.AbstractEnemyElement = function(x, y)
{
    rofp.ui.AbstractEnemyElement.base(this, 'constructor');

    /**
     * @protected
     * @type {goog.math.Coordinate}
     */
    this.spawnPosition = new goog.math.Coordinate(x, y);

    /**
     * @private
     * @type {rofp.ui.PlayerElement}
     */
    this.target = null;

    /**
     * @protected
     * @type {string}
     */
    this.spriteImage = '';

    /**
     * @protected
     * @type {PIXI.Sprite}
     */
    this.sprite = null;

    /**
     * @private
     * @type {Function}
     */
    this.loadResolve_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.walking_ = false;

    /**
     * @private
     * @type {Matter.Body}
     */
    this.enemy = null;

    /**
     * @private
     * @type {Matter.Body}
     */
    this.enemyBody_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.hitting_ = false;

    /**
     * @private
     * @type {boolean}
     */
    this.hittingLeft_ = false;

    /**
     * @private
     * @type {boolean}
     */
    this.hittingRight_ = false;

    /**
     * @private
     * @type {number}
     */
    this.hitTime_ = 0;

    /**
     * @private
     * @type {number}
     */
    this.damage_ = 0;

    /**
     * @private
     * @type {number}
     */
    this.maxDamage_ = 500;

    /**
     * @type {number}
     * @protected
     */
    this.powerBonus = 15;

    /**
     * @private
     * @type {boolean}
     */
    this.garbage_ = false;

    /**
     * @private
     * @type {PIXI.particles.Emitter}
     */
    this.hitEmitter_ = null;

    /**
     * @private
     * @type {number}
     */
    this.elapsedTime_ = Date.now();

    /**
     * @protected
     * @type {boolean}
     */
    this.dying = false;
};

goog.inherits(
    rofp.ui.AbstractEnemyElement,
    rofp.ui.AbstractPhysicElement
);

rofp.ui.AbstractEnemyElement.SPRITE_LOADED = {};

/** @inheritDoc */
rofp.ui.AbstractEnemyElement.prototype.init = function()
{
    return new goog.Promise(function(resolve, reject){
        this.sprite = new PIXI.Sprite.fromImage(this.spriteImage);
        this.sprite.anchor.set(0.5, 1);

        if ( ! rofp.ui.AbstractEnemyElement.SPRITE_LOADED[this.spriteImage]) {
            this.sprite.texture.baseTexture.on('loaded', this.spriteLoaded_.bind(this));
            this.loadResolve_ = resolve;
        }
        else {
            this.spriteLoaded_();
            resolve();
        }

    }, this);
};

/**
 * @public
 * @param {rofp.ui.PlayerElement} target
 */
rofp.ui.AbstractEnemyElement.prototype.setTarget = function(target)
{
    this.target = target;
};

/**
 *
 */
rofp.ui.AbstractEnemyElement.prototype.destroy = function()
{

};

/**
 * @return {Object}
 */
rofp.ui.AbstractEnemyElement.prototype.get = function()
{
    return this.sprite;
};

rofp.ui.AbstractEnemyElement.prototype.ready = function()
{

};

/**
 *
 * @protected
 * @return {Array<Matter.Body>}
 */
rofp.ui.AbstractEnemyElement.prototype.createEnemyBodyParts = function()
{
    return [];
};

/**
 *
 */
rofp.ui.AbstractEnemyElement.prototype.spriteLoaded_ = function()
{
    rofp.ui.AbstractEnemyElement.SPRITE_LOADED[this.spriteImage] = true;

    this.enemyBody_ = Matter.Bodies.rectangle(
        this.sprite.width / 2,
        this.sprite.height / 2,
        this.sprite.width,
        this.sprite.height, {
            density: 0.002,
            friction: 0.5
        }
    );

    this.enemyBody_.inertia = Infinity;

    var parts = [this.enemyBody_];
    var additionParts = this.createEnemyBodyParts();

    for (var i = 0, len = additionParts.length; i < len;  i++) {
        parts.push(additionParts[i]);
    }

    this.bodies.push(this.enemy = Matter.Body.create({
        parts: parts,
        friction: .25,
        restitution: 0.4
    }));

    Matter.Body.translate(this.enemy, {
        x: this.spawnPosition.x - this.sprite.width / 2,
        y: this.spawnPosition.y,
    });

    this.hitEmitter_ = new PIXI.particles.Emitter(
        this.sprite,
        [PIXI.Texture.fromImage("resources/images/enemy/hit-particle.png")],
        {
            "alpha": {
                "start": 1,
                "end": 0.4
            },
            "scale": {
                "start": 0.12,
                "end": 0.02,
                "minimumScaleMultiplier": 1
            },
            "color": {
                "start": "#610903",
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
                "max": .7
            },
            "blendMode": "normal",
            "frequency": 0.001,
            "emitterLifetime": -0.9,
            "maxParticles": 2000,
            "pos": {
                "x": 0,
                "y": 0
            },
            "addAtBack": false,
            "spawnType": "rect",
            "spawnRect": {
                "x": -this.sprite.width / 2,
                "y": -this.sprite.height / 2 - 30,
                "w": this.sprite.width,
                "h": this.sprite.height
            }
         }
    );

    this.hitEmitter_.emit = false;

    this.ready();

    if (this.loadResolve_) {
        goog.async.nextTick(this.loadResolve_);
        this.loadResolve_ = null;
    }
};

/**
 * @private
 */
rofp.ui.AbstractEnemyElement.prototype.handleHitActive_ = function()
{
    var body = this.target.getMainBody();

    this.hitting_ = true;

    if (body.position.x < this.enemy.position.x) {
        this.hittingLeft_ = true;
        this.hittingRight_ = false;
    }

    if (body.position.x > this.enemy.position.x) {
        this.hittingRight_ = true;
        this.hittingLeft_ = false;
    }
};

/**
 * @private
 */
rofp.ui.AbstractEnemyElement.prototype.handleHitEnd_ = function()
{
    this.hitting_ = false;
    this.hittingLeft_ = false;
    this.hittingRight_ = false;
    this.hitTime_ = 0;
};

/**
 * @private
 * @param {number} damage
 */
rofp.ui.AbstractEnemyElement.prototype.damageTaken_ = function(damage)
{
    if ( ! this.dying) {
        this.damage_ += damage;

        if (this.damage_ >= this.maxDamage_) {
            this.target.handleKill(this.powerBonus);
            this.handleDie();
        }

        var scaleAddition = goog.math.clamp(this.damage_ / this.maxDamage_, 0, .3);

        this.sprite.scale.set(1 + scaleAddition, 1 + scaleAddition);
    }
};

rofp.ui.AbstractEnemyElement.prototype.kill = function()
{
    this.handleDie();
};

/**
 * @protected
 */
rofp.ui.AbstractEnemyElement.prototype.handleDie = function()
{
    this.dying = true;

    Matter.Body.applyForce(
        this.enemy,
        this.enemy.position,
        {
            x: 0,
            y: -0.08 * this.enemy.mass
        }
    );

    setTimeout(function(){
        com.greensock.TweenMax.to(this.sprite.scale, .5, {
            x: 1,
            y: 1
        });

        com.greensock.TweenMax.to(this.sprite, .5, {
            alpha: 0
        });
    }.bind(this), 300);

    setTimeout(function(){
        this.garbage_ = true;
    }.bind(this), 800);
};

/**
 * @return {boolean}
 */
rofp.ui.AbstractEnemyElement.prototype.isGarbage = function()
{
    return this.garbage_;
};

/**
 *
 */
rofp.ui.AbstractEnemyElement.prototype.collisionStart = function(event)
{

};

/**
 *
 */
rofp.ui.AbstractEnemyElement.prototype.collisionActive = function(event)
{
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA == this.enemyBody_ ||
            pair.bodyB == this.enemyBody_) {

            var bullet = this.target.getBulletBody();

            if (pair.bodyA == bullet||
                pair.bodyB == bullet) {

                if (this.target.isShooting()) {
                    this.handleHitActive_();
                }
                else if (this.hitting_) {
                    this.handleHitEnd_();
                }
            }
        }
    }
};

/**
 *
 */
rofp.ui.AbstractEnemyElement.prototype.collisionEnd = function(event)
{
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        if (pair.bodyA == this.enemyBody_ ||
            pair.bodyB == this.enemyBody_) {

            var bullet = this.target.getBulletBody();

            if (pair.bodyA == bullet||
                pair.bodyB == bullet) {
                this.handleHitEnd_();
            }
        }
    }
};

/**
 *
 */
rofp.ui.AbstractEnemyElement.prototype.render = function(states)
{
    Matter.Body.setAngle(this.enemy, 0);

    var elapsedTime = Date.now();

    this.hitEmitter_.update((elapsedTime - this.elapsedTime_) * 0.001);
    this.hitEmitter_.emit = this.hitting_ || this.dying;

    if (this.hitting_) {

        if (this.hitTime_ == 0) {
            this.hitTime_ = Date.now();
        }

        var damage = (Date.now() - this.hitTime_) * .15;

        this.damageTaken_(damage);

        Matter.Body.applyForce(
            this.enemy,
            this.enemy.position,
            {
                x: -0.002 * (this.hittingLeft_ ? -1 : 1) * this.enemy.mass,
                y: -0.0027 * this.enemy.mass
            }
        );
    }

    this.sprite.position.x = this.enemy.position.x;
    this.sprite.position.y = this.enemy.position.y + this.sprite.height / 2;

    this.elapsedTime_ = elapsedTime;
};