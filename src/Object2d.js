class Object2d {
    defaultDrawer;
    colorOverrides;

    constructor(config) {
        if(config.parent?.isRemoved){
            console.error('Cannot instantiate, parent is removed.', config);
            return false;
        }

        // parent drawer
        if (!config.drawer) {
            if (Object2d.defaultDrawer) {
                config.drawer = Object2d.defaultDrawer;
            } else {
                console.log('no default drawer');
                return false;
            }
        }

        // basic
        this.x = '50%';
        this.y = '50%';
        this.rotation = 0;
        this.imageSrc = '';

        // props
        for (let key of Object.keys(config)) {
            this[key] = config[key];
        }

        // config
        this.config = config;

        // initializing
        if(!this.image){
            this.image = new Image();
            this.setImg(config.img);
        } else {
            this.setImage(this.image.cloneNode(true));
        }

        this.id = this.drawer.addObject(this);
    }
    setImg(img){ // this one gets image url
        if(!img) return;

        if(this.imageSrc === img) return;

        const preloaded = App.preloadedResources[img];
        if(preloaded && !this.noPreload){
            return this.setImage(preloaded);
        }

        this.imageSrc = img;
        this.image.src = App.checkResourceOverride(img);
        this.image.onload = () => { 
            this.image = this.applyColorOverrides(this.image);
        }
    }
    setImage(image){ // this one gets img object (presume preloadedResource)
        this.imageSrc = image.src;
        this.image = image;
        this.image.src = App.checkResourceOverride(this.image.src);
        this.image.onload = () => { 
            this.image = this.applyColorOverrides(this.image);
        }
    }
    applyColorOverrides(image) {
        if (!Object2d.colorOverrides) return image;
        return recolorImage(image, Object2d.colorOverrides);
    }
    removeObject(){
        this.drawer?.removeObject?.(this);
    }
    mimicParent(ignoreList = []){
        if(!this.parent) return;

        function should(val){
            return !ignoreList.includes(val);
        }
        
        if(should('x')) this.x = this.parent.x;
        if(should('y')) this.y = this.parent.y + this.parent.additionalY;
        if(should('inverted')) this.inverted = this.parent.inverted;
        if(should('upperHalfOffsetY')) this.upperHalfOffsetY = this.parent.upperHalfOffsetY;
        if(should('scale')) this.scale = this.parent.scale;
        if(should('opacity')) this.opacity = this.parent.opacity;

        if(should('spritesheet')) if(this.spritesheet) this.spritesheet.cellNumber = this.parent.spritesheet.cellNumber;
    }
    stopMove(){
        this.targetX = undefined;
        this.targetY = undefined;
    }
    moveToTarget(speed = 0.01) {
        const shouldMoveX = this.targetX !== undefined && this.targetX != this.x;
        const shouldMoveY = this.targetY !== undefined && this.targetY != this.y;
        let currentSpeed = shouldMoveX && shouldMoveY ? speed / 2 : speed;

        if (shouldMoveX) {
            this.isMoving = true;
            if (this.x > this.targetX)
                this.moveLeft(this.targetX, currentSpeed);
            else if(this.x < this.targetX)
                this.moveRight(this.targetX, currentSpeed);
        } else {
            this.isMoving = false;
        }

        if (shouldMoveY) {
            // this.y = lerp(this.y, this.targetY, this.stats.speed * App.deltaTime * 0.1);
            if (this.y > this.targetY)
                this.moveUp(this.targetY, currentSpeed);
            else if(this.y < this.targetY)
                this.moveDown(this.targetY, currentSpeed);
        }
    }
    moveRight(maxX, speed) {
        const velocity = this.x + speed * App.deltaTime;
        this.x = velocity > maxX ? maxX : velocity;
        this.inverted = true;
    }
    moveLeft(minX, speed) {
        const velocity = this.x - speed * App.deltaTime;
        this.x = velocity < minX ? minX : velocity;
        this.inverted = false;
    }
    moveUp(minY, speed) {
        const velocity = this.y - speed * 2 * App.deltaTime;
        this.y = velocity < minY ? minY : velocity;
    }
    moveDown(maxY, speed) {
        const velocity = this.y + speed * 2 * App.deltaTime;
        this.y = velocity > maxY ? maxY : velocity;
    }
    showBoundingBox(shrinkX, shrinkY){
        const parent = this;
        if(!this.boundingBoxElement){
            this.boundingBoxElement = new Object2d({
                parent,
                img: 'resources/img/misc/red_pixel.png',
                opacity: 0.25,
                onDraw: (me) => {
                    const bb = parent.getBoundingBox(shrinkX, shrinkY);

                    me.x = bb.x;
                    me.y = bb.y;
                    me.width = bb.width;
                    me.height = bb.height;
                }
            })
            const zLineIndicator = new Object2d({
                img: 'resources/img/misc/red_pixel.png',
                x: 0, y: 0, z: 999,
                parent: this.boundingBoxElement,
                onDraw: (me) => {
                    me.x = me.parent.x;
                    me.y = me.parent.y + (me.parent.height);
                    me.width = me.parent.width;
                }
            })
        }
    }
    hideBoundingBox(){
        this.boundingBoxElement?.removeObject?.();
        this.boundingBoxElement = null;
    }
    getBoundingBox(shrinkX = 0, shrinkY = 0) {
        const scale = this.scale ?? 1;

        const baseWidth = this.spritesheet?.cellSize || this.width || this.image.width;
        const baseHeight = this.spritesheet?.cellSize || this.height || this.image.height;

        const width = (baseWidth - shrinkX * 2) * scale;
        const height = (baseHeight - shrinkY * 2) * scale;

        const x = (this.x + (this.additionalX || 0)) - (width - (baseWidth - shrinkX * 2)) / 2;
        const y = (this.y + (this.additionalY || 0)) - (height - (baseHeight - shrinkY * 2)) / 2;

        return { x, y, width, height };
    }
    isColliding(otherBoundingBox){
        const currentBoundingBox = this.getBoundingBox();
        return Object2d.checkAabbCollision(currentBoundingBox, otherBoundingBox);
    }
    showOutline(color = '#7CE0E6', setAsInitial){
        if(!setAsInitial){
            if(this._initialFilter == null) this._initialFilter = this.filter || '';
        }
        const outlineFilter = [
            `drop-shadow(0px 1px 0px ${color})`,
            `drop-shadow(1px 0px 0px ${color})`,
            `drop-shadow(-1px 0px 0px ${color})`,
        ].join(' ')
        this.filter = `${this._initialFilter || ''} ${outlineFilter}`.trim()
    }
    hideOutline(){
        this.filter = this._initialFilter != null ? this._initialFilter : this.filter;
        this._initialFilter = this.filter;
    }
    static setColorOverrides(colors){
        Object2d.colorOverrides = colors;
    }
    static setDrawer(drawer) {
        Object2d.defaultDrawer = drawer;
    }
    static animations = {
        flip: function(me, flipTime){
            if(!flipTime) flipTime = 300;
            if(!me.nextFlipMs || App.time > me.nextFlipMs) {
                me.inverted = !me.inverted;
                me.nextFlipMs = App.time + flipTime;
            }
        },
        bob: function(me, bobSpeed, bobStrength){
            if(!bobSpeed) bobSpeed = 0.01;
            if(!bobStrength) bobStrength = 0.4;
            if(!me.bobFloat || me.bobFloat > App.PI2) me.bobFloat = 0;
            me.bobFloat += bobSpeed * App.deltaTime;
            const currentFloat = Math.sin(me.bobFloat) * bobStrength;
            me.y += currentFloat;
        },
        pixelBreath: function(me, speed, diffPixels){
            if(!diffPixels) diffPixels = 1;
            if(!speed) speed = 0.00145;
            if(me.currentOffset === undefined) me.currentOffset = 0;
            if(!me.breathFloat || me.breathFloat > 1) {
                me.breathFloat = 0;
                me.breathState = !me.breathState;
                if(me.breathState) me.currentOffset = diffPixels;
                else me.currentOffset = 0;

                // me.y += me.currentOffset;
                me.upperHalfOffsetY = me.currentOffset;
            }
            me.breathFloat += speed * App.deltaTime;
        },
        circleAround: function(me, radius, deg, originX, originY){
            let y = -Math.ceil(radius * Math.cos(deg));
            let x = Math.ceil(radius * Math.sin(deg));

            me.x = originX + x; 
            me.y = originY + y;
        },
        pulseScale: function(me, speed, strength){
            if(!me.scale) me.scale = 1;
            if(!speed) speed = 0.01;
            if(!strength) strength = 0.4;
            if(!me.pulseScaleFloat || me.pulseScaleFloat >= App.PI2) me.pulseScaleFloat = 0;
            me.pulseScaleFloat += speed * App.deltaTime;
            let currentFloat = Math.sin(me.pulseScaleFloat) * strength;
            me.scale += currentFloat;
        },
        rotateAround: function(me, speed){
            if(!speed) speed = 0.05;
            if(!me.rotateAroundFloat) me.rotateAroundFloat = 0;
            // me.rotateAroundFloat += speed * App.deltaTime;
            me.rotation += speed * App.deltaTime;
        },
        cycleThroughFrames: function(me, delay = 250, alternateDirection){
            if(!me.spritesheet) return;
            const maxCells = me.spritesheet.rows * me.spritesheet.columns;
            
            if(!me._cycleThroughFrames) me._cycleThroughFrames = {
                nextTime: 0,
                adder: 1,
            }

            if(me._cycleThroughFrames.nextTime < App.time){
                const { cellNumber } = me.spritesheet;
                const { adder } = me._cycleThroughFrames;

                if (alternateDirection) {
                    if (cellNumber + adder >= maxCells || cellNumber + adder <= 1) {
                        me._cycleThroughFrames.adder *= -1;
                    }
                    me.spritesheet.cellNumber += adder;
                } else {
                    if (cellNumber + adder > maxCells) {
                        me.spritesheet.cellNumber = 1;
                    } else {
                        me.spritesheet.cellNumber += adder;
                    }
                }

                me._cycleThroughFrames.nextTime = App.time + delay;
            }
        },
    }
    static checkAabbCollision(a, b){
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}