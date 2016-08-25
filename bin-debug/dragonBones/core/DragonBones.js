var dragonBones;
(function (dragonBones) {
    /**
     * DragonBones
     */
    var DragonBones = (function () {
        /**
         * @private
         */
        function DragonBones() {
        }
        var d = __define,c=DragonBones,p=c.prototype;
        /**
         * @private
         */
        DragonBones.hasArmature = function (value) {
            return DragonBones._armatures.indexOf(value) >= 0;
        };
        /**
         * @private
         */
        DragonBones.addArmature = function (value) {
            if (value && DragonBones._armatures.indexOf(value) < 0) {
                DragonBones._armatures.push(value);
            }
        };
        /**
         * @private
         */
        DragonBones.removeArmature = function (value) {
            if (value) {
                var index = DragonBones._armatures.indexOf(value);
                if (index >= 0) {
                    DragonBones._armatures.splice(index, 1);
                }
            }
        };
        /**
         * @private
         */
        DragonBones.PI_D = Math.PI * 2;
        /**
         * @private
         */
        DragonBones.PI_H = Math.PI / 2;
        /**
         * @private
         */
        DragonBones.PI_Q = Math.PI / 4;
        /**
         * @private
         */
        DragonBones.ANGLE_TO_RADIAN = Math.PI / 180;
        /**
         * @private
         */
        DragonBones.RADIAN_TO_ANGLE = 180 / Math.PI;
        /**
         * @private
         */
        DragonBones.SECOND_TO_MILLISECOND = 1000;
        /**
         * @private
         */
        DragonBones.NO_TWEEN = 100;
        DragonBones.VERSION = "4.7.2";
        /**
         * @private
         */
        DragonBones.debug = false;
        /**
         * @private
         */
        DragonBones.debugDraw = false;
        /**
         * @private
         */
        DragonBones._armatures = [];
        return DragonBones;
    }());
    dragonBones.DragonBones = DragonBones;
    egret.registerClass(DragonBones,'dragonBones.DragonBones');
})(dragonBones || (dragonBones = {}));
