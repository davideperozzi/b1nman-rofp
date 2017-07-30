goog.provide('rofp.dispatchers.GameEventDispatcher');

// goog
goog.require('goog.events.EventTarget');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
rofp.dispatchers.GameEventDispatcher = function()
{
    rofp.dispatchers.GameEventDispatcher.base(this, 'constructor');
};

goog.inherits(
    rofp.dispatchers.GameEventDispatcher,
    goog.events.EventTarget
);

goog.addSingletonGetter(rofp.dispatchers.GameEventDispatcher);

/**
 * @enum {string}
 */
rofp.dispatchers.GameEventDispatcher.EventType = {
    GAME_OVER: 'game-over'
};

/**
 *
 */
rofp.dispatchers.GameEventDispatcher.prototype.gameOver = function()
{
    this.dispatchEvent(rofp.dispatchers.GameEventDispatcher.EventType.GAME_OVER);
};