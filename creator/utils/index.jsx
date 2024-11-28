import { filesize } from "filesize";

export function saveFile(data, fileName) {
    const element = document.createElement("a");
    const file = new Blob([data], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
}

export function getImageDataSize(data, asRaw){
    const base64str = data.substr(22);
    const decoded = atob(base64str);
    if(asRaw) return decoded.length;
    return filesize(decoded.length);
}