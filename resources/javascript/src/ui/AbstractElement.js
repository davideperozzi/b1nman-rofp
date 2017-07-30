goog.provide('rofp.ui.AbstractElement');

// goog
goog.require('goog.Promise');
goog.require('goog.math.Size');
goog.require('goog.events.EventTarget');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
rofp.ui.AbstractElement = function()
{
    rofp.ui.AbstractElement.base(this, 'constructor');

    /**
     * @protected
     * @type {goog.math.Size}
     */
    this.stageSize = new goog.math.Size(0, 0);
};

goog.inherits(
    rofp.ui.AbstractElement,
    goog.events.EventTarget
);

/**
 * @return {goog.Promise}
 */
rofp.ui.AbstractElement.prototype.init = function()
{
    return goog.Promise.resolve();
};

/**
 * @return {Object}
 */
rofp.ui.AbstractElement.prototype.get = function()
{
    goog.abstractMethod();
};

/**
 *
 */
rofp.ui.AbstractElement.prototype.render = function()
{

};

/**
 * @public
 */
rofp.ui.AbstractElement.prototype.setStageSize = function(width, height)
{
    this.stageSize.width = width;
    this.stageSize.height = height;

    if (this.isReady()) {
        this.update();
    }
};

/**
 *
 */
rofp.ui.AbstractElement.prototype.update = function()
{

};

/**
 * @return {boolean}
 */
rofp.ui.AbstractElement.prototype.isReady = function()
{
    return true;
};