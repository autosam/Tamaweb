const pRandom = {
    a: 1664525,
    c: 1013904223,
    m: Math.pow(2, 32),
    seed: Math.round(Math.random() * (Math.pow(2, 32) - 1)),
    getInt: function(){
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed;
    },
    getFloat: function(){
        return this.getInt() / this.m;
    },
    getBool: function(){
        return (this.getIntBetween(0,1)) ? true : false;
    },
    getIntBetween: function(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(this.getFloat() * (max - min + 1)) + min;
    },
    getFloatBetween: function(min, max){
        return this.getFloat() * (max - min) + min;
    },
    getPercent: function(p){
        return (this.getFloatBetween(0,100) > p || p <= 0) ? false : true;
    },
    save: function(){
    	this._seed = this.seed;
    },
    load: function(){
    	if(!this._seed) return false;
    	this.seed = this._seed;
    },
    randomSeed: function(){
        this.seed = Math.round(Math.random() * (Math.pow(2, 32) - 1))
    }
};

const lerp = function(s, e, p){
    return (1 - p) * s + p * e;
}
const clamp = function(n, min, max) {
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
}
const random = function(min, max, seeded){
    if(seeded){
        pRandom.save()
        pRandom.seed = seeded;
        const r = pRandom.getIntBetween(min, max);
        pRandom.load()
        return r;
    }

    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const randomFromArray = function(arr){
    return arr[random(0, arr.length - 1)];
}
const pRandomFromArray = function(arr){
    return arr[pRandom.getIntBetween(0, arr.length - 1)];
}