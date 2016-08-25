var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.halfStageHeight = 400; //屏幕顶部到播放线的值
        //private curAnimIndex:number = 0;
        //private curAnimationName:string;
        /*private onTouch(evt:egret.TouchEvent):void {
            this.curAnimIndex++;
            this.curAnimationName = this.armature.animation.animationList[this.curAnimIndex % this.armature.animation.animationList.length];
            //this.armature.animation.gotoAndPlay(this.curAnimationName,-1,-1);
            this.armature.animation.play();
        }*/
        this.tempY = 0;
        this.armeY = 0;
        this.rePlay = []; //记录可否重播；0,无播放，1播放过不可再播，2，可以回播
        this.nextStop = false; //拖动完以后，是否自动播放下一个
        this.hasDrag = false;
        this.nextNum = -1; //拖动的下一个段位
        this.isLoop = false;
        this.loopStart = {};
        this.loopEnd = {};
        this.tempI = 0; //临时记录当前播放的位置，用于同屏播放多个符合条件的动画
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        this.stage.dirtyRegionPolicy = egret.DirtyRegionPolicy.OFF;
        //设置加载进度界面
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/resource.json", "resource/");
        //egret.Profiler.getInstance().run();
        //var sprbg:egret.Sprite = new egret.Sprite();
        //sprbg.graphics.beginFill(0x000000,0.5);
        //sprbg.graphics.drawRect(0,0,160,100);
        //this.stage.addChild(sprbg);
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.loadGroup("TestArmature");
    };
    /**
     * preload资源组加载完成
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "TestArmature") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            this.createGameScene();
        }
    };
    /**
    * 资源组加载出错
    */
    p.onResourceLoadError = function (event) {
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "TestArmature") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     */
    p.createGameScene = function () {
        //this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onTouch,this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
        this.createMotorcycleExp();
    };
    /**创建骨骼模型**/
    p.createMotorcycleExp = function () {
        this.container = new egret.DisplayObjectContainer();
        egret.MainContext.instance.stage.addChild(this.container);
        //this.container.x = 600;
        // this.container.y = 500;
        //读取一个骨骼数据,并创建实例显示到舞台
        var skeletonData = RES.getRes("skeleton_json");
        var textureData = RES.getRes("texture_json");
        var texture = RES.getRes("texture_png");
        // ComicDataParser
        var factory = new dragonBones.EgretFactory(new dragonBones.ComicDataParser());
        factory.parseDragonBonesData(skeletonData);
        /*if(RES.hasRes("texture_png")){
            textureData = RES.getRes("texture_json")
            texture = RES.getRes("texture_png")
            factory.addTextureAtlas(new dragonBones.EgretTextureAtlas(texture, textureData));
        }*/
        var i = 0;
        while (RES.hasRes("texture_png" + i)) {
            textureData = RES.getRes("texture_json" + i);
            texture = RES.getRes("texture_png" + i);
            factory.parseTextureAtlasData(textureData, texture);
            i++;
        }
        //factory.addTextureAtlas(new dragonBones.EgretTextureAtlas(texture, textureData));
        this.armature = factory.buildArmature(skeletonData.armature[0].name);
        //this.armature = factory.buildFastArmature(skeletonData.armature[0].name);
        if (skeletonData.armature[0].type == "Stage") {
        }
        this.armatureDisplay = this.armature.display;
        dragonBones.WorldClock.clock.add(this.armature);
        this.container.addChild(this.armatureDisplay);
        //this.armatureDisplay.x = this.armature._boneList[0].global.x;
        //this.armatureDisplay.y = this.armature._boneList[0].global.y;
        //var aniCachManager:dragonBones.AnimationCacheManager = this.armature.enableAnimationCache(60, null, false);
        //console.log(aniCachManager)
        //aniCachManager.resetCacheGeneratorArmature();
        //启动骨骼动画播放
        this.armature.animation.play(this.armature.animation.animationList[0], 1);
        this.armature.addEventListener(dragonBones.FrameEvent.ANIMATION_FRAME_EVENT, this.stopHandler, this);
        var arrowData = RES.getRes("arrow_json");
        var arrowtextureData = RES.getRes("arrowtexture_json");
        var arrowtexture = RES.getRes("arrowtexture_png");
        var arrowDBData = factory.parseDragonBonesData(arrowData, "__arrow");
        factory.parseTextureAtlasData(arrowtextureData, arrowtexture, "__arrow");
        this.arrowArmature = factory.buildArmature("Armature", "__arrow");
        this.arrowArmatureDisplay = this.arrowArmature.display;
        dragonBones.WorldClock.clock.add(this.arrowArmature);
        this.container.addChild(this.arrowArmatureDisplay);
        this.arrowArmature.animation.play(this.arrowArmature.animation.animationList[0], 1);
        this.arrowArmatureDisplay.x = this.armature.armatureData.aabb["width"] * 0.5;
        this.arrowArmatureDisplay.y = this.armature.armatureData.aabb["height"] * 0.8;
        this.arrowArmature.animation.play();
        egret.Ticker.getInstance().register(function (advancedTime) {
            dragonBones.WorldClock.clock.advanceTime(0.015); //advancedTime / 1000
        }, this);
        this.halfStageHeight = this.armature.armatureData.aabb["height"] * 0.7;
        // Get comic data.
        var comicData = dragonBones.ComicDataParser.getComicDataFormArmatureData(this.armature.armatureData);
        this.maxHeight = comicData.durings[comicData.durings.length - 1].height;
        for (i = 0; i < comicData.durings.length; i++) {
            this.rePlay[i] = true;
        }
        this.playArmature(0);
    };
    p.onTouchBegin = function (evt) {
        this.tempY = evt.stageY;
        this.armeY = this.armatureDisplay.y;
    };
    p.onTouchMove = function (evt) {
        //this.armatureDisplay.x = evt.stageX;
        //console.log(this.tempY,evt.stageY)
        this.armatureDisplay.y = this.armeY + (evt.stageY - this.tempY);
        //console.log(evt.stageY-this.tempY)
        //console.log("maxHeight",this.maxHeight,"this.armatureDisplay.y",this.armatureDisplay.y,"this.halfStageHeight",this.halfStageHeight);
        if (-this.armatureDisplay.y > this.maxHeight - this.armature.armatureData.aabb["height"] / 2) {
            this.armatureDisplay.y = -(this.maxHeight - this.armature.armatureData.aabb["height"] / 2);
        }
        if (this.armatureDisplay.y >= 0) {
            this.armatureDisplay.y = 0;
        }
        if (this.tempY < evt.stageY) {
            this.setAllPlay();
            this.stopArmature(this.nextMovieClip);
        }
        else {
            this.nextStop = false;
            this.arrowArmatureDisplay.visible = false;
        }
        var num = this.getDuringData();
        while (this.rePlay[num] == false) {
            num++;
        }
        ;
        if (num < 0) {
            //console.log("numxiaoyu 0 ",num)
            return;
        }
        if (this.armature.animation.isPlaying) {
            //console.log("bukeneng--------------- ",num)
            this.hasDrag = true;
            if (this.nextNum < num) {
                this.nextNum = num;
            }
        }
        else {
            //console.log("wutuodong bofang ",num)
            this.nextNum = -1;
            this.hasDrag = false;
            this.playArmature(num);
        }
    };
    p.stopArmature = function (num) {
        if (this.armature.animation.lastAnimationState && this.armature.animation.lastAnimationState.isPlaying) {
            this.nextStop = true;
        }
        else {
            this.nextStop = false;
            // Get comic data.
            var comicData = dragonBones.ComicDataParser.getComicDataFormArmatureData(this.armature.armatureData);
            var duData = comicData.durings[num];
            var timss;
            if (duData.frame == 0) {
                timss = 0;
            }
            else {
                timss = (duData.frame / this.armature.armatureData.frameRate);
            }
            this.armature.animation.gotoAndStopByTime(this.armature.animation.animationList[0], timss);
            this.armature.animation.stop();
        }
    };
    p.playArmature = function (num) {
        // Get comic data.
        var comicData = dragonBones.ComicDataParser.getComicDataFormArmatureData(this.armature.armatureData);
        this.isLoop = false;
        var duData = comicData.durings[num]; //+(this.armature.armatureData.aabb["height"]/2));
        if (duData) {
            if (duData.height + this.armatureDisplay.y > 0 && duData.height + this.armatureDisplay.y < this.halfStageHeight) {
                if (this.lastduData && this.lastduData == duData) {
                    this.isLoop = true;
                    return;
                }
                else {
                    this.lastduData = duData;
                }
                if (this.rePlay[num]) {
                    var timss;
                    var timeTTemp;
                    if (duData.frame == 0) {
                        timss = 0;
                        timeTTemp = 0;
                    }
                    else {
                        timss = (duData.frame / this.armature.armatureData.frameRate);
                        timeTTemp = 0.001;
                    }
                    this.rePlay[num] = false;
                    for (var i = 0; i < num; i++) {
                        this.rePlay[i] = false; //之前的都不可重播
                    }
                    //console.log(this.rePlay)
                    this.armature.animation.gotoAndPlayByTime(this.armature.animation.animationList[0], timss + timeTTemp, 1);
                }
            }
            else {
                this.isLoop = true;
            }
        }
        else {
            this.isLoop = true;
        }
    };
    p.stopHandler = function (evt) {
        //console.log(evt.data.name)
        var eventString = evt.data.name;
        if (eventString == "stop") {
            this.currentEnd = evt;
            this.armature.animation.stop();
            if (this.nextStop) {
                return;
            }
            if (this.hasDrag) {
                this.playArmature(this.nextNum);
                return;
            }
            this.tempI = this.tempI + 1;
            this.playArmature(this.tempI);
        }
        else if (eventString.substr(0, 7) == "loopSta") {
            if (!this.loopStart.hasOwnProperty(eventString.substr(9))) {
                this.loopStart[eventString.substr(9)] = evt.data.frame.position;
            }
        }
        else if (eventString.substr(0, 7) == "loopEnd") {
            this.loopEnd[eventString.substr(7)] = evt.animationState.currentTime;
            //console.log("循环结束点")
            if (this.isLoop) {
                if (this.currentEnd && this.currentEnd.data.frame.position == evt.data.frame.position) {
                    var ttime = this.loopStart[this.currentEnd.data.name.substr(7)];
                    this.armature.animation.gotoAndPlayByTime(this.armature.animation.animationList[0], ttime + 0.001, 1);
                }
            }
        }
    };
    p.getPlayNum = function () {
        for (var i = 0; i < this.rePlay.length; i++) {
            if (this.rePlay[i]) {
                return i;
            }
        }
        return this.rePlay.length;
    };
    p.getDuringData = function () {
        // Get comic data.
        var comicData = dragonBones.ComicDataParser.getComicDataFormArmatureData(this.armature.armatureData);
        var i = 0;
        for (i = 0; i < comicData.durings.length; i++) {
            var duringData = comicData.durings[i];
            if (duringData.height + this.armatureDisplay.y > 0 && duringData.height + this.armatureDisplay.y < this.halfStageHeight) {
                this.tempI = i;
                return i;
            }
        }
        return -1; //this.armature._duringList[this.armature._duringList.length-1];
    };
    p.setAllPlay = function () {
        // Get comic data.
        var comicData = dragonBones.ComicDataParser.getComicDataFormArmatureData(this.armature.armatureData);
        var i = 0;
        this.nextMovieClip = 0;
        var aheight = -this.armatureDisplay.y;
        for (i = 0; i < comicData.durings.length; i++) {
            var duringData = comicData.durings[i];
            if (duringData.height - aheight > this.armature.armatureData.aabb["height"]) {
                if (this.nextMovieClip == 0) {
                    this.nextMovieClip = i;
                }
                this.rePlay[i] = true;
            }
        }
        if (this.nextMovieClip == 0) {
            this.nextMovieClip = comicData.durings.length - 1;
        }
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
