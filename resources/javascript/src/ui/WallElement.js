goog.provide('rofp.ui.WallElement');

// rofp
goog.require('rofp.ui.AbstractPhysicElement');

/**
 * @constructor
 * @extends {rofp.ui.AbstractPhysicElement}
 */
rofp.ui.WallElement = function()
{
    rofp.ui.WallElement.base(this, 'constructor');
};

goog.inherits(
    rofp.ui.WallElement,
    rofp.ui.AbstractPhysicElement
);

/** @inheritDoc */
rofp.ui.WallElement.prototype.init = function()
{
    return new goog.Promise(function(resolve, reject){
        var wallLeft = Matter.Bodies.rectangle(
            -50,
            this.stageSize.height / 2,
            100,
            this.stageSize.height,
            {
                isStatic: true
            }
        );

        var wallRight = Matter.Bodies.rectangle(
            this.stageSize.width + 50,
            this.stageSize.height / 2,
            100,
            this.stageSize.height,
            {
                isStatic: true
            }
        );

        var wallTop = Matter.Bodies.rectangle(
            this.stageSize.width / 2,
            -50,
            this.stageSize.width,
            100,
            {
                isStatic: true
            }
        );

        this.bodies.push(wallLeft);
        this.bodies.push(wallRight);
        this.bodies.push(wallTop);

        resolve();
    }, this);
};

/** @inheritDoc */
rofp.ui.WallElement.prototype.get = function()
{
    return null;
};

rofp.ui.WallElement.prototype.update = function()
{
    this.sprite_.width = this.stageSize.width;
    this.sprite_.position.y = this.stageSize.height;
    this.sprite_.anchor.set(0, 1);
};