/**
 * generate uuid
 */
function uuid() {
    return "_" + Math.floor(Math.random() * Date.now())
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
        str: `<div id="${id}" /></div>`
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
        str: `id="${id}"`,
    }
}
/**
 * change string to document fragment
 * @param {*} s 
 */
function str2frag(s) {
    let docfrag = document.createDocumentFragment()
    let node = document.createElement("div")
    node.innerHTML = s
    docfrag.append(node)
    return docfrag
}
function isInElement(str) {
    let reg = /(.*?)\/?>/g
    let mat = ""
    while (mat = reg.exec(str)) {
        if (!mat[0].match(/</g)) {
            break;
        }
    }
    return mat
}

function render(template, as) {
    let s = template[0]
    let rules = []
    for (let i = 1; i < as.length; i++) {
        let arg = as[i];
        if (!Array.isArray(arg)) {
            arg = [arg]
        }
        let tmpl = template[i];

        let ss = arg.map(argItem => {
            // console.log(argItem, argItem instanceof Element)

            if (argItem instanceof Element) {
                let data = handleElement(argItem);
                rules.push(data.mark)
                return data.str
            } else if (typeof argItem == "object") {

                if (argItem.param) {
                    let id = argItem.id || uuid()
                    let inEle = isInElement(tmpl)

                    rules.push(Object.assign({
                        id: id,
                        type: "bind",
                        inEle: inEle,
                        index: i
                    }, argItem))
                    if (inEle) {

                        let temparr = tmpl.split("")
                        temparr.splice(inEle['index'] + 1, 0, ` id='${id}' `)
                        tmpl = temparr.join("")

                        return `${argItem.fn(argItem.state[argItem.param])}`
                    } else {
                        let aa = argItem.fn(argItem.state[argItem.param])
                        if (aa instanceof Element) {
                            let data = handleElement(aa);
                            rules.push(data.mark)
                            return `<div id='${id}' >${data.str}</div>`
                        } else {
                            return `<div id='${id}' >${aa}</div>`
                        }
                    }

                } else {
                    let data = handleEvent(argItem);
                    rules.push(data.mark)
                    return data.str
                }
            } else {
                return argItem
            }
        }).join("");

        // Escape special characters in the substitution.
        s += ss
        // Don't escape special characters in the template.
        s += tmpl;

        // console.log(template[i].match(/(.*?)\/?>/g) && template[i].match(/(.*?)\/?>/g).find(item=>!item.match(/</g)))

    }
    return { s, rules }
}

/**
 *  
 * @param {*} template 
 */
export function nodeTpl(template) {
    let args = arguments;
    let res = render(template, args)
    let docfrag = str2frag(res.s)

    let catedRules = {}
    res.rules.forEach(rul => {
        if (!catedRules[rul.type])
            catedRules[rul.type] = [rul]
        else {
            catedRules[rul.type].push(rul)
        }
    })
    Object.keys(catedRules).forEach(key => {

        let rules = catedRules[key]
        if (key == "event") {
            rules.forEach(rul => {
                let oldNode = docfrag.getElementById(rul.id);
                rul.events.forEach(evt => {
                    oldNode.addEventListener(evt.evtName, evt.evtHandler)
                })
            })
        } else if (key == "element") {
            rules.forEach(rul => {
                let oldNode = docfrag.getElementById(rul.id);
                oldNode.parentNode.replaceChild(rul.node, oldNode)
            })
        } else if (key == "bind") {
            let rulmap = []
            rules.forEach(rul => {

                let sameRu = rulmap.find(ru => (ru.state == rul.state && ru.param == rul.param))
                if (sameRu) {
                    sameRu.sameRules = (sameRu.sameRules || [])
                    sameRu.sameRules.push(rul)
                } else {
                    rulmap.push(rul)
                }
            });
            rulmap.forEach(rul => {
                let oldNode = docfrag.getElementById(rul.id)
                rul.sameRules && rul.sameRules.forEach(srul => {
                    srul.oldNode = docfrag.getElementById(srul.id)
                })
                let originValue = rul.state[rul.param]
                Object.defineProperty(rul.state, rul.param, {
                    get: function () {
                        return originValue;
                    },
                    set: function (newValue) {
                        console.log("set new value", newValue, rul.inEle)
                        originValue = newValue;


                        let params = (args)
                        params[rul.index] = Object.assign(args[rul.index])
                        params[rul.index].id = rul.id
                        rul.sameRules && rul.sameRules.forEach(srul => {
                            params[srul.index] = Object.assign(args[srul.index])
                            params[srul.index].id = srul.id
                        })
                        let ele = render(template, params)
                        let newdocfrag = str2frag(ele.s)
                        let newNode = newdocfrag.getElementById(rul.id)
                        console.log(rul)
                        if (rul.inEle) {
                            newNode.innerHTML = '';

                            [].forEach.call(oldNode.childNodes, (nod) => {
                                newNode.appendChild(nod)
                            })
                            oldNode.parentNode.replaceChild(newNode, oldNode)
                            oldNode = newNode
                        } else {
                            let aa = rul.fn(rul.state[rul.param])
                            if (aa instanceof Element) {
                                oldNode.innerHTML = ``
                                oldNode.appendChild(aa)
                            } else {
                                oldNode.innerHTML = `${aa}`
                            }
                        }

                        rul.sameRules && rul.sameRules.forEach(srul => {
                            let newNode = newdocfrag.getElementById(srul.id)
                            if (srul.inEle) {

                                newNode.innerHTML = '';
                                let olist = srul.oldNode.childNodes;
                                // 这里搬移childNodes 里面不能使用顺序使用append方法，childNodes会发生变化，这可能是浏览器bug
                                // 使用倒序没有问题，使用insertBefore模拟prepend方法
                                for (let i = olist.length - 1; i >= 0; i--) {
                                    // 模拟prepend
                                    newNode.insertBefore(olist[i], newNode.firstChild);
                                }
                                // console.log("after:", newNode.innerHTML)
                                srul.oldNode.parentNode.replaceChild(newNode, srul.oldNode)
                                srul.oldNode = newNode
                            } else {

                                let aa = srul.fn(srul.state[srul.param])
                                if (aa instanceof Element) {
                                    srul.oldNode.innerHTML = ''
                                    srul.oldNode.appendChild(aa)
                                } else {
                                    srul.oldNode.innerHTML = `${aa}`
                                }
                            }
                        })
                    }
                })
            });
        }
    })
    let child = docfrag.childNodes[0]
    return child.childNodes.length > 1 ? child : child.childNodes[0]
}
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
    return docfrag.childNodes[0]
}