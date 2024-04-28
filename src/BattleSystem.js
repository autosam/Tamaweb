class BattleSystem {
    static types = {
        generic: 'generic',
    }
    static states = {
        offensive: 'offense',
        defensive: 'defense'
    }
    static moves = {
        sparkSplash: {
            name: 'Spark Splash',
            type: BattleSystem.types.generic,
            state: BattleSystem.states.offensive,
            description: `conjures a splash of glittering water, dealing damage and possibly dazzling the opponent.`,
            fn: (caster, opp) => {
                opp.damage(15);
            },
        }
    }
}

class BattleParticipant {
    // stats
    maxHealth = 100;
    health = this.maxHealth;

    constructor(pet) {
        // this.def = petDef;
        this.pet = pet;
    }

    damage(pts) {
        this.health -= pts;
        this.health = clamp(this.health, 0, this.maxHealth);
    }

    isDead() {
        return this.health == 0;
    }
}