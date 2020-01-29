'use strict';

const PORT_NAME = "script";
const CACHE_NAME = "cache-v1";

const overwriteScript = (data) => {
    return "// comment added - meugur \n" + data;
};

const printCache = async () => {
    console.log("Logging Cache:")
    let key_list = await window.caches.keys();
    for (let i = 0; i < key_list.length; ++i) {
        let key = key_list[i];
        console.log("Cache name: " + key);
        let cache = await window.caches.open(key);
        let keys = await cache.keys();
        for (let j = 0; j < keys.length; ++j) {
            console.log("Key: ", keys[j]);
            let val = await cache.match(keys[j]);
            console.log("Value: ", val);
        }
    }
};

const getResponseBody = async (response) => {
    let blob = await response.blob();
    let body = await blob.text();
    return body;
};

const addToCache = async (request, response, data) => {
    let new_response = new Response(
        new Blob([data], {"type": "text/javascript"}),
        {
        "status": response.status,
        "statusText": response.statusText,
        "headers": response.headers,
        }
    );
    let cache = await window.caches.open(CACHE_NAME);
    await cache.put(request, new_response);
};

const requestHandler = async (details) => {
    // console.log(details);
    const request = new Request(
        details.url, 
        {
            cache: 'no-cache',
            method: 'GET',
        }
    );
    // await printCache();

    // Request is not related to a tab
    if (details.tabId === -1) {
        let response = await window.caches.match(details.url); 
        if (response === undefined) {
            response = await fetch(request);
            let script = await getResponseBody(response);
            let data = overwriteScript(script);
            await addToCache(request, response, data);
        }
        return {'cancel': true};
    }
    // Connect to tab
    let port = chrome.tabs.connect(details.tabId, {name: PORT_NAME});

    let instrumented_script = "";

    // Get script from cache, else fetch and add to cache
    let response = await window.caches.match(details.url);
    if (response === undefined) {
        response = await fetch(request);
        let script = await getResponseBody(response);
        let data = overwriteScript(script);
        await addToCache(request, response, data);
        instrumented_script = data;
    } else {
        instrumented_script = await getResponseBody(response);
    }
    // Send script to tab
    port.postMessage({script: instrumented_script, url: details.url});

    return {'cancel': true};
};

chrome.webRequest.onBeforeRequest.addListener(
    requestHandler,
    {
        urls: ['*://*/*'], 
        types: ['script']
    },
    ['blocking'],
);
