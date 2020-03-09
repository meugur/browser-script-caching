'use strict';

// Library code, licensed under MIT

const Event = class {
    constructor(script, target) {
        this.script = script;
        this.target = target;

        this._cancel = false;
        this._replace = null;
    }

    preventDefault() {
        this._cancel = true;
    }
    replacePayload(payload) {
        this._replace = payload;
    }
};


const dispatch = (script, target) => {
    if (script.tagName !== "SCRIPT") {
        return;
    }
    const e = new Event(script, target);

    if (typeof window.onbeforescriptexecute === "function") {
        try {
            window.onbeforescriptexecute(e);
        } catch (err) {
            console.error(err);
        }
    }
    if (e._cancel) {
        script.textContent = "";
        script.remove();
    } else if (typeof e._replace === "string") {
        script.textContent = e._replace;
    }
};
const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
        for (const n of m.addedNodes) {
            dispatch(n, m.target);
        }
    }
});
observer.observe(document, {
    childList: true,
    subtree: true,
});

// Only works for hard coded scripts, dynamically inserted scripts
// will execute before it can be cancelled
//
// You can patch `Element.prototype.prepend`,
// `Element.prototype.append`, and related functions to interfere with
// dynamically inserted scripts
//
// Also, textContent is not always set properly, especially when the
// script is big

// Compatibility:
//
// Browser    - Cancel Script - Change Script
// Chrome 67  - Yes           - Yes
// Edge 41    - Yes           - Yes
// Firefox 60 - Partially     - Yes
//
// Only inline scripts can be cancelled on Firefox

// Example code, licensed under CC0-1.0

const timeout = (sec) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("done");
            resolve();
        }, sec);
    });
}

window.onbeforescriptexecute = async (e) => {
    // You should check if textContent exists as this property is
    // buggy sometimes
    if (!e.script.textContent) {
        return;
    }
    console.log("start");
    await timeout(5000);
    console.log("end");

    // e.replacePayload("alert(0);");
};


