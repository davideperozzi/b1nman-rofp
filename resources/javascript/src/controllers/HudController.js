goog.provide('rofp.controllers.HudController');

// goog
goog.require('goog.events.KeyCodes');
goog.require('goog.style');

// rofp
goog.require('rofp.ui.PlayerElement');
goog.require('rofp.ui.PlatformElement');
goog.require('rofp.controllers.AbstractController');

/**
 * @constructor
 * @extends {rofp.controllers.AbstractController}
 */
rofp.controllers.HudController = function()
{
    rofp.controllers.HudController.base(this, 'constructor');

    /**
     * @private
     * @type {rofp.controllers.StageController}
     */
    this.stageController_ = null;

    /**
     * @private
     * @type {rofp.controllers.EnemyController}
     */
    this.enemyController_ = null;

    /**
     * @private
     * @type {rofp.controllers.PlayerController}
     */
    this.playerController_ = null;

    /**
     * @private
     * @type {Element}
     */
    this.waveTimeElement_ = null;

    /**
     * @private
     * @type {Element}
     */
    this.waveCountElement_ = null;

    /**
     * @private
     * @type {Element}
     */
    this.powerBarElement_ = null;
};

goog.inherits(
    rofp.controllers.HudController,
    rofp.controllers.AbstractController
);

/**
 * @param {rofp.controllers.StageController} stage
 */
rofp.controllers.HudController.prototype.init = function(stage)
{
    this.waveTimeElement_ = goog.dom.getElementByClass('wave-time-label');
    this.waveCountElement_ = goog.dom.getElementByClass('wave-counter-label');
    this.powerBarElement_ = goog.dom.getElementByClass('power-bar-indicator');

    this.stageController_ = stage;
    this.enemyController_ = this.stageController_.getEnemyController();
    this.playerController_ = this.stageController_.getPlayerController();

    goog.events.listen(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_TICK,
        this.handleWaveTick_, false, this);

    goog.events.listen(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_WON,
        this.handleWaveWon_, false, this);

     goog.events.listen(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_END,
        this.handleWaveEnd_, false, this);

    goog.events.listen(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_START,
        this.handleWaveStart_, false, this);

    goog.events.listen(this.playerController_, rofp.controllers.PlayerController.EventType.POWER_UPDATED,
        this.updatePowerBar_, false, this);

    this.setWaveTime_();
};

rofp.controllers.HudController.prototype.destroy = function()
{
    this.setWaveTime_(0);
    this.setWaveCount_(0);

    goog.events.unlisten(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_TICK,
        this.handleWaveTick_, false, this);

    goog.events.unlisten(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_WON,
        this.handleWaveWon_, false, this);

     goog.events.unlisten(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_END,
        this.handleWaveEnd_, false, this);

    goog.events.unlisten(this.enemyController_, rofp.controllers.EnemyController.EventType.WAVE_START,
        this.handleWaveStart_, false, this);

    goog.events.unlisten(this.playerController_, rofp.controllers.PlayerController.EventType.POWER_UPDATED,
        this.updatePowerBar_, false, this);
};

/**
 * @private
 */
rofp.controllers.HudController.prototype.handleWaveTick_ = function()
{
    this.setWaveTime_();
};

/**
 * @private
 */
rofp.controllers.HudController.prototype.handleWaveWon_ = function()
{
};

/**
 * @private
 */
rofp.controllers.HudController.prototype.handleWaveEnd_ = function()
{
    this.setWaveTime_(this.enemyController_.getDefaultWaveTime());
};

/**
 * @private
 */
rofp.controllers.HudController.prototype.handleWaveStart_ = function()
{
    this.setWaveCount_();
};

/**
 * @private
 * @param {number=} optTime
 */
rofp.controllers.HudController.prototype.setWaveTime_ = function(optTime)
{
    if ( ! optTime) {
        optTime = this.enemyController_.getWaveTime();
    }

    goog.dom.setTextContent(this.waveTimeElement_, optTime);
};

/**
 * @private
 * @param {number=} optCount
 */
rofp.controllers.HudController.prototype.setWaveCount_ = function(optCount)
{
    if ( ! optCount) {
        optCount = this.enemyController_.getWaveCount();
    }

    goog.dom.setTextContent(this.waveCountElement_, optCount);
};

/**
 * @private
 */
rofp.controllers.HudController.prototype.updatePowerBar_ = function()
{
    var power = this.playerController_.getPower().toFixed(2);

    goog.style.setStyle(this.powerBarElement_, {
        'width': power + '%'
    });
};

/**
 * @public
 * @param {Object} renderer
 */
rofp.controllers.HudController.prototype.render = function(renderer)
{

};