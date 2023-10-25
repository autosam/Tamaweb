lerp = function(s, e, p){
    return (1 - p) * s + p * e;
}
clamp = function(n, min, max) {
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
}
random = function(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
move = function(s, e, amount){
    if(s > e) {
        s -= amount;
        if(s < e) s = e;
    }
    else if(s < e) {
        s += amount;
        if(s > e) s = e;
    }
    else s = e;
    return s;
}
randomFromArray = function(arr){
    return arr[random(0, arr.length - 1)];
}