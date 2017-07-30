goog.provide('rofp.ui.GroundElement');

// rofp
goog.require('rofp.ui.AbstractPhysicElement');

/**
 * @constructor
 * @extends {rofp.ui.AbstractPhysicElement}
 */
rofp.ui.GroundElement = function()
{
    rofp.ui.GroundElement.base(this, 'constructor');
};

goog.inherits(
    rofp.ui.GroundElement,
    rofp.ui.AbstractPhysicElement
);

/** @inheritDoc */
rofp.ui.GroundElement.prototype.init = function()
{
    return new goog.Promise(function(resolve, reject){
        this.sprite_ = new PIXI.TilingSprite.fromImage("resources/images/world/ground.png");
        this.sprite_.texture.baseTexture.on('loaded', this.spriteLoaded_.bind(this));
        this.loadResolve_ = resolve;
    }, this);
};

/** @inheritDoc */
rofp.ui.GroundElement.prototype.get = function()
{
    return this.sprite_;
};

/**
 * @private
 */
rofp.ui.GroundElement.prototype.spriteLoaded_ = function()
{
    this.bodies.push(Matter.Bodies.rectangle(
        this.stageSize.width / 2,
        this.stageSize.height - this.sprite_.height / 2 + 10,
        this.stageSize.width,
        this.sprite_.height,
        {
            restitution: 0.8,
            isStatic: true
        }
    ));

    if (this.loadResolve_) {
        this.loadResolve_();
        this.loadResolve_ = null;
    }

    this.update();
};

rofp.ui.GroundElement.prototype.update = function()
{
    this.sprite_.width = this.stageSize.width;
    this.sprite_.position.y = this.stageSize.height;
    this.sprite_.anchor.set(0, 1);
};