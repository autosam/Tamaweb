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

        // config
        this.config = config;

        // props
        for (let key of Object.keys(config)) {
            this[key] = config[key];
        }

        // initializing
        if(!this.image){
            this.image = new Image();
            this.image.src = config.img;
        } else {
            this.image = this.image.cloneNode(true);
        }

        this.id = this.drawer.addObject(this);
    }
    setImg(img){ // this one gets image url
        this.image.src = img;
    }
    setImage(image){ // this one gets img object (presume preloadedResource)
        this.image = image;
    }
    static setDrawer(drawer) {
        Object2d.defaultDrawer = drawer;
    }
}