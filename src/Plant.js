class Plant {
    growthDelay = 1000 * 60 * 60;
    wateredDuration = 1000 * 60;
    isWatered = false;

    #patchObject = false;

    constructor(config){
        const {
            name, 
            age = Plant.AGE.seedling, 
            lastGrowthTime = Date.now(),
            lastWatered = Date.now(),
            health = 100,
        } = config;
        this.age = age;
        this.name = name;
        this.lastGrowthTime = lastGrowthTime;

        this.health = health;

        this.lastWatered = lastWatered;
    }
    checkForProgress(){
        const now = Date.now();

        this.isWatered = now - this.lastWatered < this.wateredDuration;

        if(this.age === Plant.AGE.grown) return;

        console.log((Date.now() - (this.lastGrowthTime + this.growthDelay)) / 60);
        while (this.lastGrowthTime + this.growthDelay < Date.now() && this.age !== Plant.AGE.grown) {
            this.lastGrowthTime += this.growthDelay;
            this.age = clamp(this.age + 1, Plant.AGE.seedling, Plant.AGE.grown);
        }
    }
    water(){
        this.lastWatered = Date.now();
    }
    createObject2d(patch){
        const plantDefinition = this.getDefinition();

        if(!plantDefinition) return;

        patch.onDraw = (me) => {
            // todo: fix this bug
            const target = this.isWatered ? Plant.PATCH_IMG.wet : Plant.PATCH_IMG.normal;
            // if(me.imageSrc === target) return;
            me.setImg(target);
            // console.log(target)
        }

        const position = {
            x: patch.x, y: patch.y - 12,
        }
        
        const plant = new Object2d({
            parent: patch,
            image: App.preloadedResources[App.constants.PLANT_SPRITESHEET],
            spritesheet: {
                ...App.constants.PLANT_SPRITESHEET_DIMENSIONS,
                cellNumber: plantDefinition.sprite + this.age,
            },
            ...position,
            onDraw: () => {
                this.checkForProgress();
                plant.spritesheet.cellNumber = plantDefinition.sprite + this.age;
            }
        })
        const statusIndicator = new Object2d({
            parent: plant,
            img: 'resources/img/misc/no_water_01.png',
            x: position.x,
            y: position.y - 6,
            opacity: 0,
            onDraw: (me) => {
                if(this.isWatered) me.opacity = 0;
                me.opacity = lerp(me.opacity, this.isWatered ? 0 : 1, 0.001 * App.deltaTime);
            }
        })

        return {plant, statusIndicator};
    }
    getDefinition(){
        return App.definitions.plant[this.name];
    }
    _reset(){
        this.age = Plant.AGE.seedling;
        this.lastGrowthTime = Date.now();
    }
    static AGE = {
        seedling: 0,
        tiny: 1,
        grown: 2,
        dead: 3,
    }
    static PATCH_IMG = {
        normal: 'resources/img/misc/garden_patch_01.png',
        wet: 'resources/img/misc/garden_patch_01_wet.png',
    }
}