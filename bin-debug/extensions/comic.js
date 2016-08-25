var dragonBones;
(function (dragonBones) {
    var DURING = "during";
    var ComicDataParser = (function (_super) {
        __extends(ComicDataParser, _super);
        function ComicDataParser() {
            _super.call(this);
        }
        var d = __define,c=ComicDataParser,p=c.prototype;
        ComicDataParser.getComicDataFormArmatureData = function (armatureData) {
            return armatureData.userData;
        };
        /**
         * @private
         */
        p._parseArmature = function (rawData) {
            var armature = _super.prototype._parseArmature.call(this, rawData);
            var comicData = { durings: [] };
            armature.userData = comicData;
            if (armature && DURING in rawData) {
                var duringObjects = rawData[DURING];
                for (var i = 0, l = duringObjects.length; i < l; ++i) {
                    var duringObject = duringObjects[i];
                    var during = { frame: duringObject.frame, height: duringObject.height };
                    comicData.durings.push(during);
                }
            }
            return armature;
        };
        return ComicDataParser;
    }(dragonBones.ObjectDataParser));
    dragonBones.ComicDataParser = ComicDataParser;
    egret.registerClass(ComicDataParser,'dragonBones.ComicDataParser');
})(dragonBones || (dragonBones = {}));
