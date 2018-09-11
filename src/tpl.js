/**
 * generate uuid
 */
function uuid() {
    return "_" + Date.now()
}
/**
 * if es6 tpl mix an element, append element later
 * @param {*} arg 
 */
function handleElement(arg) {
    let id = uuid()
    return {
        mark: {
            type: "element",
            id,
            node: arg
        },
        str: `<div class="${id}" /></div>`
    }
}
/**
 * if es6 tpl mix an event, add event to the element
 * @param {*} arg 
 */
function handleEvent(arg) {
    let id = uuid()
    let events = Object.keys(arg).map(key => {
        return {
            evtName: key,
            evtHandler: arg[key]
        }
    })
    return {
        mark: {
            id,
            type: "event",
            events
        },
        str: `class="${id}"`,
    }
}
/**
 * change string to document fragment
 * @param {*} s 
 */
function str2frag(s) {
    let node = document.createElement("div")
    node.innerHTML = s
    return node
}
/**
 *  
 * @param {*} template 
 */
export function nodeTpl(template) {
    var s = template[0];
    let rules = []
    for (var i = 1; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!Array.isArray(arg)) {
            arg = [arg]
        }
        let ss = arg.map(argItem => {
            if (argItem instanceof Element) {
                let data = handleElement(argItem);
                rules.push(data.mark)
                return data.str
            } else if (typeof argItem == "object") {
                let data = handleEvent(argItem);
                rules.push(data.mark)
                return data.str
            } else {
                return argItem
            }
        }).join("");
        // Escape special characters in the substitution.
        s += ss
        // Don't escape special characters in the template.
        s += template[i];
    }
    let docfrag = str2frag(s)
    rules.forEach(rul => {
        if (!rul) return;
        let oldNode = docfrag.querySelector(`.${rul.id}`);
        if (rul.type == "event") {
            rul.events && rul.events.forEach(evt => {
                oldNode.addEventListener(evt.evtName, evt.evtHandler)
            })
        } else if (rul.type == "element") {
            oldNode.parentNode.replaceChild(rul.node, oldNode)
        }
    })
    return docfrag
}
/**
 * safe tpl with XSS defend
 * @param {*} template 
 */
export function safeTpl(template) {
    var s = template[0];
    for (var i = 1; i < arguments.length; i++) {
        var arg = String(arguments[i]);
        // Escape special characters in the substitution.
        s += arg.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        // Don't escape special characters in the template.
        s += template[i];
    }
    let docfrag = str2frag(s)
    return docfrag
}
