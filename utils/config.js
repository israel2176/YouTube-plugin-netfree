const config = {
    DEBUG_MODE: false ,
    SERVER_URL: 'https://israelserver.site',
    API_ENDPOINTS: {
        LOG: '/api/log',
        SEARCH: '/search',
    },
};

export function getConfig(key) {
    return config[key];
}

export function setConfig(key, value) {
    if (key in config) {
        config[key] = value;
        console.log(`Config ${key} set to: ${value}`);
    } else {
        console.error(`Config key ${key} does not exist`);
    }
}

export default config;
