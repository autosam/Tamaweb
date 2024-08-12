class Object2d {
    constructor(config) {
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
        const newImage = new Image();
        newImage.src = App.checkResourceOverride(img);
        newImage.onload = () => {
            this.image = newImage;
        }
    }
    setImage(image){ // this one gets img object (presume preloadedResource)
        this.image = image;
        this.image.src = App.checkResourceOverride(this.image.src);
    }
    removeObject(){
        this.drawer.removeObject(this);
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

        if(should('spritesheet')) if(this.spritesheet) this.spritesheet.cellNumber = this.parent.spritesheet.cellNumber;
    }
    stopMove(){
        this.targetX = undefined;
        this.targetY = undefined;
    }
    moveToTarget(speed = 0.01) {
        if (this.targetX !== undefined && this.targetX != this.x) {
            this.isMoving = true;
            if (this.x > this.targetX)
                this.moveLeft(this.targetX, speed);
            else if(this.x < this.targetX)
                this.moveRight(this.targetX, speed);
        } else {
            this.isMoving = false;
        }

        if (this.targetY !== undefined && this.targetY != this.y) {
            // this.y = lerp(this.y, this.targetY, this.stats.speed * App.deltaTime * 0.1);
            if (this.y > this.targetY)
                this.moveUp(this.targetY, speed);
            else if(this.y < this.targetY)
                this.moveDown(this.targetY, speed);
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
            let currentFloat = Math.sin(me.bobFloat) * bobStrength;
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
        }
    }
}