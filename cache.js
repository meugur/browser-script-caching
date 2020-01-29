'use strict';

const INSTRUMENTED_SCRIPTS = {};
const SCRIPT_QUEUE = [];
const PORT_NAME = "script";

chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(msg => {
        console.assert(port.name == PORT_NAME);
        INSTRUMENTED_SCRIPTS[msg.url] = msg.script;
        /*
        let scripts = document.scripts;
        for (let i = 0; i < scripts.length; ++i) {
            let old_script = scripts[i];
            if (scripts[i].src == msg.url) {
                let new_script = document.createElement('script');
                new_script.type = 'text/javascript';
                new_script.textContent = msg.script;
                parent = old_script.parentNode;
                parent.appendChild(new_script);
                parent.removeChild(old_script);
            } 
        }
        */
    });
});

const handleNode = (node) => {
    if (node.tagName !== 'SCRIPT') {
        return;
    }
    SCRIPT_QUEUE.push(node);
};

const getInstrumentedScriptTag = (url) => {
    let new_script = document.createElement('script');
    new_script.type = 'text/javascript';
    new_script.textContent = INSTRUMENTED_SCRIPTS[url];
    return new_script;
};

const executeScript = (node, script) => {
    if (node.parentNode !== null) {
        let parent = node.parentNode;
        parent.replaceChild(script, node);
    } else {
        let target_el = document.documentElement || document.head || document.body;
        if (target_el.firstElementChild) {
            target_el.insertBefore(script, target_el.firstElementChild);
        } else {
            target_el.appendChild(script);
        }
    }
}

window.addEventListener('load', () => {
    for (const _i of SCRIPT_QUEUE) {
        if (INSTRUMENTED_SCRIPTS[_i.src] !== undefined) {
            executeScript(_i, getInstrumentedScriptTag(_i.src));
        } else {
            executeScript(_i, _i);
        }
    }
});

const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        for (const n of m.addedNodes) {
            handleNode(n);
        }
    }
});
observer.observe(document, {
    childList: true,
    subtree: true,
});
