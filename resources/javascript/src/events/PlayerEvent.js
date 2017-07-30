goog.provide('rofp.events.PlayerEvent');

goog.require('goog.events.Event');

/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {string} type
 */
rofp.events.PlayerEvent = function(type, optTakenDamage, optPowerBonus)
{
    rofp.events.PlayerEvent.base(this, 'constructor', type);

    /**
     * @public
     * @type {number}
     */
    this.damage = optTakenDamage || 0;

    /**
     * @public
     * @type {number}
     */
    this.bonus = optPowerBonus || 0;
};

goog.inherits(
    rofp.events.PlayerEvent,
    goog.events.Event
);

/**
 * @enum {string}
 */
rofp.events.PlayerEvent.EventType = {
    PLAYER_HIT: 'player-hit',
    ENEMY_KILL: 'enemy-kill'
};