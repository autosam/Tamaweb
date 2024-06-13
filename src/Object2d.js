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

        // basic position
        this.x = '50%';
        this.y = '50%';

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
        this.image.src = App.checkResourceOverride(img);
    }
    setImage(image){ // this one gets img object (presume preloadedResource)
        this.image = image;
        this.image.src = App.checkResourceOverride(this.image.src);
    }
    removeObject(){
        this.drawer.removeObject(this);
    }
    mimicParent(){
        if(!this.parent) return;
        
        this.x = this.parent.x;
        this.y = this.parent.y + this.parent.additionalY;
        this.spritesheet.cellNumber = this.parent.spritesheet.cellNumber;
        this.inverted = this.parent.inverted;
        this.upperHalfOffsetY = this.parent.upperHalfOffsetY;
        this.scale = this.parent.scale;
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
    }
}