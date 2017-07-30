goog.provide('rofp');
goog.provide('rofp.bootstrap');

// rofp
goog.require('rofp.Application');

/**
 * @export
 */
rofp.bootstrap = function() {
    (new rofp.Application()).start();
};