goog.provide('rofp.ui.AbstractPhysicElement');

// rofp
goog.require('rofp.ui.AbstractElement');

/**
 * @constructor
 * @extends {rofp.ui.AbstractElement}
 */
rofp.ui.AbstractPhysicElement = function()
{
    rofp.ui.AbstractPhysicElement.base(this, 'constructor');

    /**
     * @protected
     * @type {Array<Object>}
     */
    this.bodies = [];
};

goog.inherits(
    rofp.ui.AbstractPhysicElement,
    rofp.ui.AbstractElement
);

/**
 * @return {Object}
 */
rofp.ui.AbstractPhysicElement.prototype.getBodies = function()
{
    return this.bodies;
};

/** @inheritDoc */
rofp.ui.AbstractPhysicElement.prototype.isReady = function()
{
    return this.bodies.length != 0;
};

/**
 *
 */
rofp.ui.AbstractPhysicElement.prototype.collisionActive = function(event)
{

};

/**
 *
 */
rofp.ui.AbstractPhysicElement.prototype.collisionEnd = function(event)
{

};