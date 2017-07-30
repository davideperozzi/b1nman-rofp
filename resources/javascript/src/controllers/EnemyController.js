goog.provide('rofp.controllers.EnemyController');

// goog
goog.require('goog.events.KeyCodes');

// rofp
goog.require('rofp.ui.PlayerElement');
goog.require('rofp.controllers.AbstractController');
goog.require('rofp.ui.Enemy1Element');
goog.require('rofp.ui.Enemy2Element');

/**
 * @constructor
 * @extends {rofp.controllers.AbstractController}
 */
rofp.controllers.EnemyController = function()
{
    rofp.controllers.EnemyController.base(this, 'constructor');

    /**
     * @private
     * @type {rofp.controllers.StageController}
     */
    this.stageController_ = null;

    /**
     * @private
     * @type {goog.math.Size}
     */
    this.stageSize_ = new goog.math.Size(0, 0);

    /**
     * @private
     * @type {Array<rofp.ui.AbstractPhysicElement>}
     */
    this.enemies_ = [];

    /**
     * @private
     * @type {rofp.ui.PlayerElement}
     */
    this.target_ = null;

    /**
     * @private
     * @type {number}
     */
    this.defaultWaveTime_ = 30;

    /**
     * @private
     * @type {number}
     */
    this.waveTimer_ = this.defaultWaveTime_;

    /**
     * @private
     * @type {number}
     */
    this.waveCounter_ = 0;

    /**
     * @private
     * @type {boolean}
     */
    this.waveStarted_ = false;

    /**
     * @private
     * @type {number}
     */
    this.tickInterval_ = -1;

    /**
     * @private
     * @type {number}
     */
    this.maxEnemies_ = 15;
};

goog.inherits(
    rofp.controllers.EnemyController,
    rofp.controllers.AbstractController
);

/**
 * @enum {string}
 */
rofp.controllers.EnemyController.EventType = {
    WAVE_START: 'enemy-wave-start',
    WAVE_END: 'enemy-wave-end',
    WAVE_WON: 'enemy-wave-won',
    WAVE_LOST: 'enemy-wave-lost',
    WAVE_TICK: 'enemy-wave-tick'
};

/**
 * @param {rofp.controllers.StageController} stage
 * @param {goog.math.Size} size
 */
rofp.controllers.EnemyController.prototype.init = function(stage, size)
{
    this.stageController_ = stage;
    this.stageSize_.width = size.width;
    this.stageSize_.height = size.height;

     goog.events.listen(this.stageController_,
        rofp.controllers.StageController.EventType.COLLISION_START, function(event){
            if (event.original) {
                for (var i = 0, len = this.enemies_.length; i < len; i++) {
                    this.enemies_[i].collisionStart(event.original);
                }
            }
        }, false, this);

    goog.events.listen(this.stageController_,
        rofp.controllers.StageController.EventType.COLLISION_ACTIVE, function(event){
            if (event.original) {
                for (var i = 0, len = this.enemies_.length; i < len; i++) {
                    this.enemies_[i].collisionActive(event.original);
                }
            }
        }, false, this);

    goog.events.listen(this.stageController_,
        rofp.controllers.StageController.EventType.COLLISION_END, function(event){
            if (event.original) {
                for (var i = 0, len = this.enemies_.length; i < len; i++) {
                    this.enemies_[i].collisionEnd(event.original);
                }
            }
        }, false, this);
};

rofp.controllers.EnemyController.prototype.spawnWave = function()
{
    if (this.waveCounter_ > 5) {
        this.spawnWaveRandom_();
    }
    else {
        switch (this.waveCounter_) {
            case 1:
                this.spawnEnemy1_();
                this.spawnEnemy1_();
                break;

            case 2:
                this.spawnEnemy2_();
                this.spawnEnemy2_();
                break;

            case 3:
                this.spawnEnemy1_();
                this.spawnEnemy2_();
                this.spawnEnemy2_();
                break;

            case 4:
                this.spawnEnemy1_();
                this.spawnEnemy1_();
                this.spawnEnemy2_();
                this.spawnEnemy2_();
                break;

            case 5:
                this.spawnEnemy1_();
                this.spawnEnemy1_();
                this.spawnEnemy2_();
                this.spawnEnemy2_();
                this.spawnEnemy2_();
                break;
        }
    }
};

/**
 * @private
 */
rofp.controllers.EnemyController.prototype.spawnWaveRandom_ = function()
{
    var enemyCount = goog.math.clamp(this.waveCounter_, 0, this.maxEnemies_);
    var maxEnemy2 = Math.floor(this.maxEnemies_ / 2.5);
    var maxEnemy1 = this.maxEnemies_ - maxEnemy2;
    var spawnedCount = {
        '1': 0,
        '2': 0
    };

    for (var i = 0; i < enemyCount; i++) {
        if (Math.random() > .5) {
            if (spawnedCount['1'] < maxEnemy1) {
                this.spawnEnemy1_();
                spawnedCount['1']++;
            }
            else if (spawnedCount['2'] < maxEnemy2) {
                this.spawnEnemy2_();
                spawnedCount['2']++;
            }
        }
        else {
            if (spawnedCount['2'] < maxEnemy2) {
                this.spawnEnemy2_();
                spawnedCount['2']++;
            }
            else if (spawnedCount['1'] < maxEnemy1) {
                this.spawnEnemy1_();
                spawnedCount['1']++;
            }
        }
    }
};

rofp.controllers.EnemyController.prototype.destroyAll = function()
{
    for (var i = 0, len = this.enemies_.length; i < len; i++) {
        this.enemies_[i].kill();
    }
};

rofp.controllers.EnemyController.prototype.start = function()
{
    if (this.waveStarted_) {
        return;
    }

    this.waveStarted_ = true;
    this.waveTimer_ = this.defaultWaveTime_;
    this.waveCounter_++;

    this.dispatchEvent(rofp.controllers.EnemyController.EventType.WAVE_START);
    this.spawnWave();

    setTimeout(function(){
        this.tickInterval_ = setInterval(function(){
            this.waveTimer_ -= 1;
            this.dispatchEvent(rofp.controllers.EnemyController.EventType.WAVE_TICK);

            if (this.waveTimer_ <= 0) {
                this.dispatchEvent(rofp.controllers.EnemyController.EventType.WAVE_LOST);
                this.stop();
            }
        }.bind(this), 1000);
    }.bind(this), 10);
};

rofp.controllers.EnemyController.prototype.getWaveTime = function()
{
    return this.waveTimer_;
};

rofp.controllers.EnemyController.prototype.getWaveCount = function()
{
    return this.waveCounter_;
};

rofp.controllers.EnemyController.prototype.stop = function()
{
    this.waveStarted_ = false;
    clearInterval(this.tickInterval_);
    this.dispatchEvent(rofp.controllers.EnemyController.EventType.WAVE_END);
};

/**
 * @return {number}
 */
rofp.controllers.EnemyController.prototype.getDefaultWaveTime = function()
{
    return this.defaultWaveTime_;
};

/**
 * @public
 * @param {rofp.ui.PlayerElement} target
 */
rofp.controllers.EnemyController.prototype.setTarget = function(target)
{
    this.target_ = target;
};

/**
 * @private
 */
rofp.controllers.EnemyController.prototype.spawnEnemy1_ = function()
{
    var posX = goog.math.clamp(Math.random() * this.stageSize_.width, 50, this.stageSize_.width - 50);
    var enemy = this.spawn(posX, 10, rofp.ui.Enemy1Element);

    this.enemies_.push(enemy);
};

/**
 * @private
 */
rofp.controllers.EnemyController.prototype.spawnEnemy2_ = function()
{
    var posX = goog.math.clamp(Math.random() * this.stageSize_.width, 50, this.stageSize_.width - 50);
    var enemy = this.spawn(posX, 10, rofp.ui.Enemy2Element);

    this.enemies_.push(enemy);
};

/**
 * @param {number} x
 * @param {number} y
 * @return {rofp.ui.AbstractPhysicElement}
 */
rofp.controllers.EnemyController.prototype.spawn = function(x, y, ctor)
{
    var enemy = new ctor(x, y);

    enemy.setTarget(this.target_);
    enemy.setStageSize(this.stageSize_.width, this.stageSize_.height);
    enemy.init().then(function(){
        this.stageController_.add(enemy);

        enemy.freeze();

        setTimeout(function(){
            enemy.unfreeze();
        }, 1000);
    }, null, this);

    return enemy;
};

/**
 * @public
 * @param {Object} renderer
 */
rofp.controllers.EnemyController.prototype.render = function(renderer)
{
    var garbage = [];

    for (var i = 0, len = this.enemies_.length; i < len; i++) {
        var enemy = this.enemies_[i];

        if (enemy.isGarbage()) {
            garbage.push(enemy);
            continue;
        }
        else {
            if (enemy.isReady()) {
                enemy.render(renderer);
            }
        }
    }

    goog.array.forEach(garbage, function(enemy){
        enemy.destroy();
        this.stageController_.remove(enemy);
        goog.array.remove(this.enemies_, enemy);
    }, this);


    if (this.waveStarted_ && this.enemies_.length == 0) {
        this.dispatchEvent(rofp.controllers.EnemyController.EventType.WAVE_WON);
        this.stop();
    }
};