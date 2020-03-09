'use strict';

const CACHE_NAME = "cache-v1";

const overwriteScript = (data) => {
    return "// comment added - meugur \n" + data;
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

const sendScript = (tabId, instrumentedScript, scriptUrl) => {
    return new Promise(resolve => {
        chrome.tabs.sendMessage(
            tabId,
            {script: instrumentedScript, url: scriptUrl},
            response => {
                console.log("response received")
                resolve();
            }
        );
    });
}

const requestHandlerOld = async (details) => {
    console.log("received script " + details.url);
    
    const request = new Request(
        details.url, 
        {
            cache: 'no-cache',
            method: 'GET',
        }
    );
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
    console.log("sending " + details.url);

    await sendScript(details.tabId, instrumented_script, details.url);

    console.log("sent " + details.url);

    return {'cancel': true};
};

// const requestHandlerProxy = (details) => {
//     console.log(details);
//     if (details.tabId === -1) {
//         return;
//     }
//     console.log('http://localhost:8080/?url=' + details.url);
//     return { redirectUrl: 'http://localhost:8080/?url=' + details.url };
// };


const requestHandler = (details) => {
    console.log("received script " + details.url);
    return {'cancel': false};
};

chrome.webRequest.onBeforeRequest.addListener(
    requestHandler,
    {
        urls: ['*://*/*'], 
        types: ['script']
    },
    ['blocking'],
);

chrome.runtime.onMessageExternal.addListener(
    (request, sender, sendResponse) => {
        console.log("request: ", request);
        console.log("sender: ", sender);
    }
);