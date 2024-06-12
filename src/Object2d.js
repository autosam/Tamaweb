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