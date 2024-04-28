/* 
1. **Sparkle Splash** - A move where the pet conjures a splash of glittering water, dealing damage and possibly dazzling the opponent.
2. **Fluffy Tackle** - The pet puffs up its fur or feathers to appear larger and tackles the opponent with a soft but forceful bump.
3. **Rainbow Beam** - A colorful beam of light shoots from the pet's eyes or horn, which can have different effects based on its color.
4. **Mystic Melody** - The pet sings a soothing tune that can heal allies or lull opponents to sleep.
5. **Blossom Burst** - The pet causes flowers to bloom rapidly around the opponent, which can entangle or distract them.
6. **Pillow Pummel** - A playful move where the pet hurls soft pillows at the opponent, potentially causing them to nap.
7. **Bubble Boop** - The pet sends forth a series of cute bubbles that pop on contact, each with a small chance to cause giggling fits.
8. **Stardust Scatter** - A twirl that releases stardust, which can either boost the pet's stats or reduce the opponent's accuracy.
9. **Heart Hug** - A restorative move where the pet gives a loving embrace that heals and removes negative status effects.
10. **Dream Drift** - The pet creates a cloud of dreamy mist that can put opponents into a deep slumber.

Each move could have stats like Power, Accuracy, and Energy Cost, and you could also introduce status effects like Dazzled, Asleep, or Giggling that affect the battle’s flow. Remember to balance the moves so that each has its strengths and weaknesses, making the battle system strategic and fun!

*/


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