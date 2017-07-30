goog.provide('rofp.ui.BackgroundElement');

// rofp
goog.require('rofp.ui.AbstractPhysicElement');

/**
 * @constructor
 * @extends {rofp.ui.AbstractPhysicElement}
 */
rofp.ui.BackgroundElement = function()
{
    rofp.ui.BackgroundElement.base(this, 'constructor');
};

goog.inherits(
    rofp.ui.BackgroundElement,
    rofp.ui.AbstractElement
);

/** @inheritDoc */
rofp.ui.BackgroundElement.prototype.init = function()
{
    return new goog.Promise(function(resolve, reject){
        this.sprite_ = new PIXI.Sprite.fromImage("resources/images/world/background.png");
        this.sprite_.texture.baseTexture.on('loaded', this.spriteLoaded_.bind(this));
        this.sprite_.alpha = 0.2;
        this.loadResolve_ = resolve;
    }, this);
};

/** @inheritDoc */
rofp.ui.BackgroundElement.prototype.get = function()
{
    return this.sprite_;
};

/**
 * @private
 */
rofp.ui.BackgroundElement.prototype.spriteLoaded_ = function()
{
    if (this.loadResolve_) {
        this.loadResolve_();
        this.loadResolve_ = null;
    }
};