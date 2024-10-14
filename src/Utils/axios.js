const Cookies = require('js-cookie')

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        if(response.status === 204){
            return response.statusText;
        }
        return response;
    }else if(response.status >= 400 && response.status <= 503){
        return response.status;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

export function request(url, options) {
    const token = Cookies.get('token')
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'authorization': `Bearer ${token}`,
            'Content-Security-Policy': 'upgrade-insecure-requests',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        },
    };
    const newOptions = { ...defaultOptions, ...options };
    if (newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'DELETE') {
        newOptions.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
    }

    return fetch(url, newOptions)
        .then(checkStatus)
        .then(response => {if(typeof (response) === "number" || !response){return response}else{return response.json()}})
        .catch((error) => {
            // return Promise.reject(new Error(error));
            return error;
        });
}

export function requestAPI(url, options,token) {
    // const token = Cookies.get('token')
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'authorization': `Bearer ${token}`,
            'Content-Security-Policy': 'upgrade-insecure-requests',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
        },
    };
    const newOptions = { ...defaultOptions, ...options };
    if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
        newOptions.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
    }

    return fetch(url, newOptions)
        // .then(checkStatus)
        // .then(response => {if(typeof (response) === "number" || !response){return response}else{return response.json()}})
        // .catch((error) => {
        //     // return Promise.reject(new Error(error));
        //     return error;
        // });
}

export function requestUpload(url, options) {
    const token = Cookies.get('token')
    const defaultOptions = {
        headers: {
            'Content-Type': 'multipart/form-data, boundary=WebKitFormBoundary7MA4YWxkTrZu0gW',
            'authorization': `Bearer ${token}`,
        },
    };
    const newOptions = { ...defaultOptions, ...options };
    if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
        newOptions.headers = {
            'Content-Type': 'multipart/form-data, boundary=WebKitFormBoundary7MA4YWxkTrZu0gW',
            'authorization': `Bearer ${token}`,
        };
        newOptions.body = JSON.stringify(newOptions.body);
    }

    return fetch(url, newOptions)
        .then(checkStatus)
        .then(response => {if(typeof (response) === "number" ){return response}else{return response.json()}})
        .catch((error) => {
            return error;
        });
}