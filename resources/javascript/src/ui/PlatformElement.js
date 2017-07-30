goog.provide('rofp.ui.PlatformElement');

// goog
goog.require('goog.math.Coordinate');

// rofp
goog.require('rofp.ui.AbstractPhysicElement');

/**
 * @constructor
 * @extends {rofp.ui.AbstractPhysicElement}
 * @param {number} x
 * @param {number} y
 * @param {string=} optSprite
 */
rofp.ui.PlatformElement = function(x, y, optSprite)
{
    rofp.ui.PlatformElement.base(this, 'constructor');

    /**
     * @private
     * @type {goog.math.Coordinate}
     */
    this.position_ = new goog.math.Coordinate(x, y);

    /**
     * @private
     * @type {string}
     */
    this.sprite_ = "resources/images/world/" + (optSprite || "platform.png");
};

goog.inherits(
    rofp.ui.PlatformElement,
    rofp.ui.AbstractPhysicElement
);

/** @inheritDoc */
rofp.ui.PlatformElement.prototype.init = function()
{
    return new goog.Promise(function(resolve, reject){
        this.sprite_ = new PIXI.Sprite.fromImage(this.sprite_);
        this.sprite_.texture.baseTexture.on('loaded', this.spriteLoaded_.bind(this));
        this.sprite_.position.x = this.position_.x;
        this.sprite_.position.y = this.position_.y;

        this.loadResolve_ = resolve;
    }, this);
};

/** @inheritDoc */
rofp.ui.PlatformElement.prototype.get = function()
{
    return this.sprite_;
};

/**
 * @private
 */
rofp.ui.PlatformElement.prototype.spriteLoaded_ = function()
{
    this.bodies.push(Matter.Bodies.rectangle(
        this.position_.x + this.sprite_.width / 2,
        this.position_.y + this.sprite_.height / 2,
        this.sprite_.width,
        this.sprite_.height,
        {
            restitution: 0.8,
            friction: 1,
            isStatic: true
        }
    ));

    if (this.loadResolve_) {
        this.loadResolve_();
        this.loadResolve_ = null;
    }

    this.update();
};

rofp.ui.PlatformElement.prototype.update = function()
{

};