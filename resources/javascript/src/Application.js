goog.provide('rofp.Application');

// dj
goog.require('dj.sys.managers.ComponentManager');

// rofp
goog.require('rofp.components.GameComponent');

/**
 * @constructor
 */
rofp.Application = function()
{
    /**
     * @private
     * @type {dj.sys.managers.ComponentManager}
     */
    this.componentManager_ = new dj.sys.managers.ComponentManager();
};

/**
 *
 */
rofp.Application.prototype.start = function()
{
    this.componentManager_.add('game', rofp.components.GameComponent);
    this.componentManager_.init();
};