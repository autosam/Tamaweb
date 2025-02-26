class Plant {
    growthDelay = 1000 * 60 * 60;
    wateredDuration = 1000 * 60;
    isWatered = false;

    constructor(config){
        const {
            name, 
            age = Plant.AGE.seedling, 
            lastGrowthTime = Date.now(),
            lastWatered = 0,
            health = 100,
        } = config;
        this.age = age;
        this.name = name;
        this.lastGrowthTime = lastGrowthTime;

        const defWateredDuration = this.getDefinition(name)?.wateredDuration;
        if(defWateredDuration) this.wateredDuration = defWateredDuration * 1000 * 60;

        this.health = health;

        this.lastWatered = lastWatered;
    }
    checkForProgress(){
        const now = Date.now();

        this.isWatered = (now - this.lastWatered) < this.wateredDuration;

        if(this.age === Plant.AGE.grown) return;

        // console.log((Date.now() - (this.lastGrowthTime + this.growthDelay)) / 60);
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

        let nextPatchTick = -1;
        patch.onDraw = (me) => {
            if(App.time < nextPatchTick) return;
            nextPatchTick = App.time + 100;
            const target = this.isWatered 
                ? Plant.PATCH_IMG.wet 
                : Plant.PATCH_IMG.normal;
            if(me.imageSrc.replace(location.href, '') === target) return;
            me.setImg(target);
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
            z: App.constants.ACTIVE_PET_Z + 0.01,
            onDraw: () => {
                this.checkForProgress();
                plant.spritesheet.cellNumber = plantDefinition.sprite + this.age;
            }
        })
        const statusIndicator = new Object2d({
            parent: plant,
            img: 'resources/img/misc/no_water_01.png',
            y: position.y + 20,
            x: position.x - 7,
            z: App.constants.ACTIVE_PET_Z + 0.02,
            opacity: 0,
            onDraw: (me) => {
                if(this.isWatered) me.opacity = 0;
                me.opacity = lerp(me.opacity, this.isWatered ? 0 : 1, 0.001 * App.deltaTime);
            }
        })

        // this.getObject = () => plant;
        this.position = position;

        return {plant, statusIndicator};
    }
    getObject(){}
    getDefinition(name){
        return App.definitions.plant[name || this.name];
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