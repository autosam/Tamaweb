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
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}