goog.provide('rofp.controllers.PlatformController');

// goog
goog.require('goog.events.KeyCodes');

// rofp
goog.require('rofp.ui.PlayerElement');
goog.require('rofp.ui.PlatformElement');
goog.require('rofp.controllers.AbstractController');

/**
 * @constructor
 * @extends {rofp.controllers.AbstractController}
 */
rofp.controllers.PlatformController = function()
{
    rofp.controllers.PlatformController.base(this, 'constructor');

    /**
     * @private
     * @type {rofp.controllers.StageController}
     */
    this.stageController_ = null;
};

goog.inherits(
    rofp.controllers.PlatformController,
    rofp.controllers.AbstractController
);

/**
 * @param {rofp.controllers.StageController} stage
 * @param {goog.math.Size} size
 */
rofp.controllers.PlatformController.prototype.init = function(stage, size)
{
    this.stageController_ = stage;

    var platforms = [];
    platforms.push(new rofp.ui.PlatformElement(100, 400));
    platforms.push(new rofp.ui.PlatformElement(300, 300, "platform-2.png"));
    platforms.push(new rofp.ui.PlatformElement(size.width - 100, 400, "platform-3.png"));
    platforms.push(new rofp.ui.PlatformElement(size.width / 2, 150, "platform-2.png"));
    platforms.push(new rofp.ui.PlatformElement(0, 200, "platform-3.png"));

    for (var i = 0, len = platforms.length; i < len; i++) {
        platforms[i].setStageSize(size);
        platforms[i].init().then(function(platform){
            this.stageController_.add(platform);
        }.bind(this, platforms[i]), null, this);
    }
};

/**
 * @public
 * @param {Object} renderer
 */
rofp.controllers.PlatformController.prototype.render = function(renderer)
{

};