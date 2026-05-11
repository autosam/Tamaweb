export const appStates = {
    PI2: Math.PI * 2, INF: 999999999,
    deltaTime: 0, lastTime: 0, playTime: 0, hour: 12, accurateDeltaTime: 0,
    mouse: { x: 0, y: 0, isInBounds : false },
    userId: '_', userName: null, sessionId: Math.round(Math.random() * 9999999999),
    ENV: location.port == 5500 ? 'dev' : 'prod', isOnItch: false, isOnElectronClient: false,
    shellBackground: '', deferredInstallPrompt: null,

    gameEventsHistory: {}, 
    misc: {}, 
    mods: [], 
    records: {}, 
    temp: {}, 
    ownedFurniture: [], 
    plants: [],
    animals: { treat: null, list: [], nextAttractMs: 0, treatBiteCount: 0 },
}