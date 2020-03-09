'use strict';

const requestHandler = (details) => {
    console.log("received script " + details.url);
    return {'cancel': true};
};

chrome.webRequest.onBeforeRequest.addListener(
    requestHandler,
    {
        urls: ['http://localhost:5000/*'], 
        types: ['script']
    },
    ['blocking'],
);
