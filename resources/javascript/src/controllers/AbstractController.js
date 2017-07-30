goog.provide('rofp.controllers.AbstractController');

// goog
goog.require('goog.events.EventTarget');

// rofp
goog.require('rofp.dispatchers.GameEventDispatcher');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
rofp.controllers.AbstractController = function()
{
    rofp.controllers.AbstractController.base(this, 'constructor');

    /**
     * @protected
     * @type {rofp.dispatchers.GameEventDispatcher}
     */
    this.gameEventDispatcher = rofp.dispatchers.GameEventDispatcher.getInstance();
};

goog.inherits(
    rofp.controllers.AbstractController,
    goog.events.EventTarget
);

/**
 *
 */
rofp.controllers.AbstractController.prototype.init = function()
{
    goog.abstractMethod();
};

/**
 *
 */
rofp.controllers.AbstractController.prototype.render = function()
{

};