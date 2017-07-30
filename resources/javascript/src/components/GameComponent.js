goog.provide('rofp.components.GameComponent');

// goog
goog.require('goog.dom');
goog.require('goog.async.nextTick');
goog.require('goog.math.Size');
goog.require('goog.dom.animationFrame');

// dj
goog.require('dj.sys.components.AbstractComponent');

// rofp
goog.require('rofp.controllers.StageController');
goog.require('rofp.controllers.PlayerController');
goog.require('rofp.controllers.HudController');

/**
 * @constructor
 * @extends {dj.sys.components.AbstractComponent}
 */
rofp.components.GameComponent = function()
{
    rofp.components.GameComponent.base(this, 'constructor');

    // Skip pixi hello console message
    PIXI.utils.skipHello();

    /**
     * @private
     * @type {function(...?)}
     */
    this.animationTask_ = null;

    /**
     * @private
     * @type {goog.math.Size}
     */
    this.stageSize_ = new goog.math.Size(1024, 600);

    /**
     * @private
     * @type {Object}
     */
    this.renderer_ = null

    /**
     * @private
     * @type {rofp.controllers.StageController}
     */
    this.stageController_ = null;

    /**
     * @private
     * @type {rofp.controllers.PlayerController}
     */
    this.playerController_ = null;

    /**
     * @private
     * @type {rofp.controllers.HudController}
     */
    this.hudController_ = null;

    /**
     * @private
     * @type {rofp.dispatchers.GameEventDispatcher}
     */
    this.gameEventDispatcher_ = rofp.dispatchers.GameEventDispatcher.getInstance();

    /**
     * @private
     * @type {Elemnet}
     */
    this.restartButton_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.started_ = false;
};

goog.inherits(
    rofp.components.GameComponent,
    dj.sys.components.AbstractComponent
);

/**
 * @type {boolean}
 */
rofp.components.GameComponent.GAME_OVER = false;

/** @export @inheritDoc */
rofp.components.GameComponent.prototype.ready = function()
{
    return this.baseReady(rofp.components.GameComponent, function(resolve, reject){
        this.restartButton_ = goog.dom.getElementByClass('restart-btn');
        this.startButton_ = goog.dom.getElementByClass('start-btn')
        this.howtoButton_ = goog.dom.getElementByClass('howto-btn');
        this.closeHowtoButton_ = goog.dom.getElementByClass('close-howto');
        this.gameOverScreen_ = goog.dom.getElementByClass('game-over-screen');
        this.gameIntroScreen_ = goog.dom.getElementByClass('game-intro-screen');
        this.bestScoreElement_ = goog.dom.getElementByClass('best-label');
        this.gameHowtoScreen_ = goog.dom.getElementByClass('game-howto-screen');
        this.animationTask_ = goog.dom.animationFrame.createTask({
            measure: function(){
                this.animationTask_();
            },
            mutate: function(){
                if (this.started_) {
                    this.render_();
                }
            }
        }, this);

        this.updateBest_();

        goog.async.nextTick(resolve);
    });
};

/** @export @inheritDoc */
rofp.components.GameComponent.prototype.init = function()
{
    return this.baseInit(rofp.components.GameComponent, function(resolve, reject){
        this.handler.listen(this.howtoButton_, goog.events.EventType.CLICK,
            this.handleHowtoClick_);

        this.handler.listen(this.closeHowtoButton_, goog.events.EventType.CLICK,
            this.handleHowtoCloseClick_);

        if (window.location.hash == '#start') {
            this.start();
        }
        else {
            goog.dom.classlist.enable(this.gameIntroScreen_, 'active', true);
            this.handler.listenOnce(this.startButton_, goog.events.EventType.CLICK,
                this.start);
        }

        resolve();
    });
};

/**
 * @private
 */
rofp.components.GameComponent.prototype.handleHowtoCloseClick_ = function()
{
    goog.dom.classlist.enable(this.gameHowtoScreen_, 'active', false);
};

/**
 * @private
 */
rofp.components.GameComponent.prototype.handleHowtoClick_ = function()
{
    goog.dom.classlist.enable(this.gameHowtoScreen_, 'active', true);
};

/**
 *
 */
rofp.components.GameComponent.prototype.stop = function()
{
    this.started_ = false;
    this.handler.unlisten(this.gameEventDispatcher_,
            rofp.dispatchers.GameEventDispatcher.EventType.GAME_OVER,
            this.handleGameOver_);

    this.handler.unlisten(this.restartButton_, goog.events.EventType.CLICK,
            this.handleGameRestart_);

    this.stageController_.destroy();
    this.playerController_.destroy();
    this.hudController_.destroy();

    this.stageController_ = null;
    this.playerController_ = null;
    this.hudController_ = null;

    PIXI.utils.textureCache = {};
    PIXI.utils.baseTextureCache = {};

    goog.async.nextTick(function(){
        goog.dom.removeNode(this.renderer_.view);
        goog.dom.removeChildren(this.queryElement('.debug-wrapper'));

        this.renderer_.destroy();
    }, this);
};

/**
 *
 */
rofp.components.GameComponent.prototype.start = function()
{
    goog.dom.classlist.enable(this.gameIntroScreen_, 'active', false);

    this.renderer_ = PIXI.autoDetectRenderer(
        this.stageSize_.width,
        this.stageSize_.height,
        {
            antialias: false,
            transparent: true,
            resolution: 1
        }
    );

    goog.dom.appendChild(this.getElement(), this.renderer_.view);

    goog.async.nextTick(function(){
        this.stageController_ = new rofp.controllers.StageController();
        this.playerController_ = new rofp.controllers.PlayerController();
        this.hudController_ = new rofp.controllers.HudController();

        this.stageController_.setPlayer(this.playerController_);
        this.stageController_.init(this.stageSize_);
        this.playerController_.init(this.stageController_, this.stageSize_);
        this.hudController_.init(this.stageController_);

        this.handler.listen(this.gameEventDispatcher_,
            rofp.dispatchers.GameEventDispatcher.EventType.GAME_OVER,
            this.handleGameOver_);

        this.handler.listen(this.restartButton_, goog.events.EventType.CLICK,
            this.handleGameRestart_);

        goog.async.nextTick(function(){
            this.started_ = true;
            this.animationTask_();
        }, this);
    }, this);
};

/**
 * @private
 */
rofp.components.GameComponent.prototype.handleGameRestart_ = function()
{
    rofp.components.GameComponent.GAME_OVER = false;

    window.location.href = '/#start';
    window.location.reload();
};

/**
 * @private
 */
rofp.components.GameComponent.prototype.handleGameOver_ = function()
{
    rofp.components.GameComponent.GAME_OVER = true;

    var enemyController = this.stageController_.getEnemyController();

    enemyController.stop();
    enemyController.destroyAll();

    this.playerController_.destroy();

    if (window.localStorage) {
        var currentScore = enemyController.getWaveCount();
        var lastScore = window.localStorage.getItem('highscore');

        if (lastScore) {
            if (parseInt(lastScore, 10) < currentScore) {
                window.localStorage.setItem('highscore', currentScore);
            }
        }
        else {
            window.localStorage.setItem('highscore', currentScore);
        }

        this.updateBest_();
    }

    goog.dom.classlist.enable(this.gameOverScreen_, 'active', true)
};

/**
 * @private
 */
rofp.components.GameComponent.prototype.updateBest_ = function()
{
    if (window.localStorage) {
        var lastScore = window.localStorage.getItem('highscore');

        goog.dom.setTextContent(this.bestScoreElement_, lastScore || 0);
    }
};

/**
 */
rofp.components.GameComponent.prototype.render_ = function()
{
    this.stageController_.render(this.renderer_);
    this.playerController_.render(this.renderer_);
};