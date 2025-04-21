class AnimalDefinition extends PetDefinition {
    constructor(...rest){
        super(...rest);
        this.stats = {
            ...this.stats,
            wander_min: 0.1,
            wander_max: 0.2
        };
    }
    getLifeStage(){
        return PetDefinition.LIFE_STAGE.baby;
    }
}
class Animal extends Pet {
    constructor(definition, additionalProps){
        super(definition, additionalProps);
        this.z = App.constants.ACTIVE_PET_Z + 0.1;
    }
    wander() {
        if(this.isMoving){
            this.nextRandomTargetSelect = 0;
        }

        if (!this.nextRandomTargetSelect) {
            this.nextRandomTargetSelect = App.lastTime + random(this.stats.wander_min, this.stats.wander_max) * 1000;
        }

        if (App.lastTime > this.nextRandomTargetSelect) {
            this.targetX = random(this.drawer.getRelativePositionX(0), this.drawer.getRelativePositionX(100) - this.spritesheet.cellSize);
            if(!random(0, 4)) this.targetX = App.pet.x - this.spritesheet.cellSize;
            this.nextRandomTargetSelect = 0;
        }
    }
    statsManager(){}
    handleWants(){}
}