'use strict';


const main = () => {
    const CACHING_ENABLED = false;

    const overwriteScriptText = (text) => {
        return `/* comment added - meugur */\n${text}`;
    };
    // git://github.com/darkskyapp/string-hash.git
    // The Dark Sky Company
    // devsupport@darkskyapp.com
    const stringHash = (str) => {
        var hash = 5381, i = str.length
        while(i)
        hash = (hash * 33) ^ str.charCodeAt(--i)
        return hash >= 0 ? hash : (hash & 0x7FFFFFFF) + 0x80000000
    };

    const fetchTextFromCache = (hashableString, cacheStorage) => {
        if (CACHING_ENABLED) {
            let hash = stringHash(hashableString);
            let newText = cacheStorage.getItem(hash);
            if (newText === null) {
                try {
                    newText = overwriteScriptText(hashableString);
                    cacheStorage.setItem(hash, newText);
                } catch (e) {
                    // console.log("storage over quota")
                }
            }
            return newText
        }
        return overwriteScriptText(hashableString);
    };

    document.onbeforescriptexecute = (event) => {
        // Do not need to handle external scripts
        if (event.target.src && event.target.src.length) {
            return;
        }
        let scriptText = event.target.text || event.target.innerText;
        let newText = fetchTextFromCache(scriptText, localStorage);
        if (newText) {
            if (event.target.text) {
                event.target.text = newText;
            } else if (event.target.innerText) {
                event.target.innerText = newText;
            }
        }
    };
};

// Injects a function onto the page
const injectFunction = (fun) => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = '(' + String(fun) + ')();';

    let target = document.documentElement || document.head || document.body;
    if (target) {
        if (target.firstElementChild) {
            target.insertBefore(script, target.firstElementChild);
        } else {
            target.appendChild(script);
        }
        script.parentNode.removeChild(script);
    }
};

if (window === window.top) {
    injectFunction(main);
}
