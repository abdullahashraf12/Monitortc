﻿!function() {
    "use strict";
    var e, t, n;
    !function(e) {
        const t = []
          , n = "__jsObjectId"
          , o = "__dotNetObject"
          , r = "__byte[]"
          , i = "__dotNetStream"
          , s = "__jsStreamReferenceLength";
        let a, c;
        class l {
            constructor(e) {
                this._jsObject = e,
                this._cachedFunctions = new Map
            }
            findFunction(e) {
                const t = this._cachedFunctions.get(e);
                if (t)
                    return t;
                let n, o = this._jsObject;
                if (e.split(".").forEach((t => {
                    if (!(t in o))
                        throw new Error(`Could not find '${e}' ('${t}' was undefined).`);
                    n = o,
                    o = o[t]
                }
                )),
                o instanceof Function)
                    return o = o.bind(n),
                    this._cachedFunctions.set(e, o),
                    o;
                throw new Error(`The value '${e}' is not a function.`)
            }
            getWrappedObject() {
                return this._jsObject
            }
        }
        const h = 0
          , d = {
            [h]: new l(window)
        };
        d[0]._cachedFunctions.set("import", (e => ("string" == typeof e && e.startsWith("./") && (e = new URL(e.substr(2),document.baseURI).toString()),
        import(e))));
        let u, p = 1;
        function f(e) {
            t.push(e)
        }
        function g(e) {
            if (e && "object" == typeof e) {
                d[p] = new l(e);
                const t = {
                    [n]: p
                };
                return p++,
                t
            }
            throw new Error(`Cannot create a JSObjectReference from the value '${e}'.`)
        }
        function m(e) {
            let t = -1;
            if (e instanceof ArrayBuffer && (e = new Uint8Array(e)),
            e instanceof Blob)
                t = e.size;
            else {
                if (!(e.buffer instanceof ArrayBuffer))
                    throw new Error("Supplied value is not a typed array or blob.");
                if (void 0 === e.byteLength)
                    throw new Error(`Cannot create a JSStreamReference from the value '${e}' as it doesn't have a byteLength.`);
                t = e.byteLength
            }
            const o = {
                [s]: t
            };
            try {
                const t = g(e);
                o[n] = t[n]
            } catch (t) {
                throw new Error(`Cannot create a JSStreamReference from the value '${e}'.`)
            }
            return o
        }
        function y(e, n) {
            c = e;
            const o = n ? JSON.parse(n, ( (e, n) => t.reduce(( (t, n) => n(e, t)), n))) : null;
            return c = void 0,
            o
        }
        function v() {
            if (void 0 === a)
                throw new Error("No call dispatcher has been set.");
            if (null === a)
                throw new Error("There are multiple .NET runtimes present, so a default dispatcher could not be resolved. Use DotNetObject to invoke .NET instance methods.");
            return a
        }
        e.attachDispatcher = function(e) {
            const t = new w(e);
            return void 0 === a ? a = t : a && (a = null),
            t
        }
        ,
        e.attachReviver = f,
        e.invokeMethod = function(e, t, ...n) {
            return v().invokeDotNetStaticMethod(e, t, ...n)
        }
        ,
        e.invokeMethodAsync = function(e, t, ...n) {
            return v().invokeDotNetStaticMethodAsync(e, t, ...n)
        }
        ,
        e.createJSObjectReference = g,
        e.createJSStreamReference = m,
        e.disposeJSObjectReference = function(e) {
            const t = e && e[n];
            "number" == typeof t && S(t)
        }
        ,
        function(e) {
            e[e.Default = 0] = "Default",
            e[e.JSObjectReference = 1] = "JSObjectReference",
            e[e.JSStreamReference = 2] = "JSStreamReference",
            e[e.JSVoidResult = 3] = "JSVoidResult"
        }(u = e.JSCallResultType || (e.JSCallResultType = {}));
        class w {
            constructor(e) {
                this._dotNetCallDispatcher = e,
                this._byteArraysToBeRevived = new Map,
                this._pendingDotNetToJSStreams = new Map,
                this._pendingAsyncCalls = {},
                this._nextAsyncCallId = 1
            }
            getDotNetCallDispatcher() {
                return this._dotNetCallDispatcher
            }
            invokeJSFromDotNet(e, t, n, o) {
                const r = y(this, t)
                  , i = k(b(e, o)(...r || []), n);
                return null == i ? null : D(this, i)
            }
            beginInvokeJSFromDotNet(e, t, n, o, r) {
                const i = new Promise((e => {
                    const o = y(this, n);
                    e(b(t, r)(...o || []))
                }
                ));
                e && i.then((t => D(this, [e, !0, k(t, o)]))).then((t => this._dotNetCallDispatcher.endInvokeJSFromDotNet(e, !0, t)), (t => this._dotNetCallDispatcher.endInvokeJSFromDotNet(e, !1, JSON.stringify([e, !1, _(t)]))))
            }
            endInvokeDotNetFromJS(e, t, n) {
                const o = t ? y(this, n) : new Error(n);
                this.completePendingCall(parseInt(e, 10), t, o)
            }
            invokeDotNetStaticMethod(e, t, ...n) {
                return this.invokeDotNetMethod(e, t, null, n)
            }
            invokeDotNetStaticMethodAsync(e, t, ...n) {
                return this.invokeDotNetMethodAsync(e, t, null, n)
            }
            invokeDotNetMethod(e, t, n, o) {
                if (this._dotNetCallDispatcher.invokeDotNetFromJS) {
                    const r = D(this, o)
                      , i = this._dotNetCallDispatcher.invokeDotNetFromJS(e, t, n, r);
                    return i ? y(this, i) : null
                }
                throw new Error("The current dispatcher does not support synchronous calls from JS to .NET. Use invokeDotNetMethodAsync instead.")
            }
            invokeDotNetMethodAsync(e, t, n, o) {
                if (e && n)
                    throw new Error(`For instance method calls, assemblyName should be null. Received '${e}'.`);
                const r = this._nextAsyncCallId++
                  , i = new Promise(( (e, t) => {
                    this._pendingAsyncCalls[r] = {
                        resolve: e,
                        reject: t
                    }
                }
                ));
                try {
                    const i = D(this, o);
                    this._dotNetCallDispatcher.beginInvokeDotNetFromJS(r, e, t, n, i)
                } catch (e) {
                    this.completePendingCall(r, !1, e)
                }
                return i
            }
            receiveByteArray(e, t) {
                this._byteArraysToBeRevived.set(e, t)
            }
            processByteArray(e) {
                const t = this._byteArraysToBeRevived.get(e);
                return t ? (this._byteArraysToBeRevived.delete(e),
                t) : null
            }
            supplyDotNetStream(e, t) {
                if (this._pendingDotNetToJSStreams.has(e)) {
                    const n = this._pendingDotNetToJSStreams.get(e);
                    this._pendingDotNetToJSStreams.delete(e),
                    n.resolve(t)
                } else {
                    const n = new I;
                    n.resolve(t),
                    this._pendingDotNetToJSStreams.set(e, n)
                }
            }
            getDotNetStreamPromise(e) {
                let t;
                if (this._pendingDotNetToJSStreams.has(e))
                    t = this._pendingDotNetToJSStreams.get(e).streamPromise,
                    this._pendingDotNetToJSStreams.delete(e);
                else {
                    const n = new I;
                    this._pendingDotNetToJSStreams.set(e, n),
                    t = n.streamPromise
                }
                return t
            }
            completePendingCall(e, t, n) {
                if (!this._pendingAsyncCalls.hasOwnProperty(e))
                    throw new Error(`There is no pending async call with ID ${e}.`);
                const o = this._pendingAsyncCalls[e];
                delete this._pendingAsyncCalls[e],
                t ? o.resolve(n) : o.reject(n)
            }
        }
        function _(e) {
            return e instanceof Error ? `${e.message}\n${e.stack}` : e ? e.toString() : "null"
        }
        function b(e, t) {
            const n = d[t];
            if (n)
                return n.findFunction(e);
            throw new Error(`JS object instance with ID ${t} does not exist (has it been disposed?).`)
        }
        function S(e) {
            delete d[e]
        }
        e.findJSFunction = b,
        e.disposeJSObjectReferenceById = S;
        class E {
            constructor(e, t) {
                this._id = e,
                this._callDispatcher = t
            }
            invokeMethod(e, ...t) {
                return this._callDispatcher.invokeDotNetMethod(null, e, this._id, t)
            }
            invokeMethodAsync(e, ...t) {
                return this._callDispatcher.invokeDotNetMethodAsync(null, e, this._id, t)
            }
            dispose() {
                this._callDispatcher.invokeDotNetMethodAsync(null, "__Dispose", this._id, null).catch((e => console.error(e)))
            }
            serializeAsArg() {
                return {
                    [o]: this._id
                }
            }
        }
        e.DotNetObject = E,
        f((function(e, t) {
            if (t && "object" == typeof t) {
                if (t.hasOwnProperty(o))
                    return new E(t[o],c);
                if (t.hasOwnProperty(n)) {
                    const e = t[n]
                      , o = d[e];
                    if (o)
                        return o.getWrappedObject();
                    throw new Error(`JS object instance with Id '${e}' does not exist. It may have been disposed.`)
                }
                if (t.hasOwnProperty(r)) {
                    const e = t[r]
                      , n = c.processByteArray(e);
                    if (void 0 === n)
                        throw new Error(`Byte array index '${e}' does not exist.`);
                    return n
                }
                if (t.hasOwnProperty(i)) {
                    const e = t[i]
                      , n = c.getDotNetStreamPromise(e);
                    return new C(n)
                }
            }
            return t
        }
        ));
        class C {
            constructor(e) {
                this._streamPromise = e
            }
            stream() {
                return this._streamPromise
            }
            async arrayBuffer() {
                return new Response(await this.stream()).arrayBuffer()
            }
        }
        class I {
            constructor() {
                this.streamPromise = new Promise(( (e, t) => {
                    this.resolve = e,
                    this.reject = t
                }
                ))
            }
        }
        function k(e, t) {
            switch (t) {
            case u.Default:
                return e;
            case u.JSObjectReference:
                return g(e);
            case u.JSStreamReference:
                return m(e);
            case u.JSVoidResult:
                return null;
            default:
                throw new Error(`Invalid JS call result type '${t}'.`)
            }
        }
        let T = 0;
        function D(e, t) {
            T = 0,
            c = e;
            const n = JSON.stringify(t, R);
            return c = void 0,
            n
        }
        function R(e, t) {
            if (t instanceof E)
                return t.serializeAsArg();
            if (t instanceof Uint8Array) {
                c.getDotNetCallDispatcher().sendByteArray(T, t);
                const e = {
                    [r]: T
                };
                return T++,
                e
            }
            return t
        }
    }(e || (e = {})),
    function(e) {
        e[e.prependFrame = 1] = "prependFrame",
        e[e.removeFrame = 2] = "removeFrame",
        e[e.setAttribute = 3] = "setAttribute",
        e[e.removeAttribute = 4] = "removeAttribute",
        e[e.updateText = 5] = "updateText",
        e[e.stepIn = 6] = "stepIn",
        e[e.stepOut = 7] = "stepOut",
        e[e.updateMarkup = 8] = "updateMarkup",
        e[e.permutationListEntry = 9] = "permutationListEntry",
        e[e.permutationListEnd = 10] = "permutationListEnd"
    }(t || (t = {})),
    function(e) {
        e[e.element = 1] = "element",
        e[e.text = 2] = "text",
        e[e.attribute = 3] = "attribute",
        e[e.component = 4] = "component",
        e[e.region = 5] = "region",
        e[e.elementReferenceCapture = 6] = "elementReferenceCapture",
        e[e.markup = 8] = "markup",
        e[e.namedEvent = 10] = "namedEvent"
    }(n || (n = {}));
    class o {
        constructor(e, t) {
            this.componentId = e,
            this.fieldValue = t
        }
        static fromEvent(e, t) {
            const n = t.target;
            if (n instanceof Element) {
                const t = function(e) {
                    return e instanceof HTMLInputElement ? e.type && "checkbox" === e.type.toLowerCase() ? {
                        value: e.checked
                    } : {
                        value: e.value
                    } : e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement ? {
                        value: e.value
                    } : null
                }(n);
                if (t)
                    return new o(e,t.value)
            }
            return null
        }
    }
    const r = new Map
      , i = new Map
      , s = [];
    function a(e) {
        return r.get(e)
    }
    function c(e) {
        const t = r.get(e);
        return t?.browserEventName || e
    }
    function l(e, t) {
        e.forEach((e => r.set(e, t)))
    }
    function h(e) {
        const t = [];
        for (let n = 0; n < e.length; n++) {
            const o = e[n];
            t.push({
                identifier: o.identifier,
                clientX: o.clientX,
                clientY: o.clientY,
                screenX: o.screenX,
                screenY: o.screenY,
                pageX: o.pageX,
                pageY: o.pageY
            })
        }
        return t
    }
    function d(e) {
        return {
            detail: e.detail,
            screenX: e.screenX,
            screenY: e.screenY,
            clientX: e.clientX,
            clientY: e.clientY,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY,
            movementX: e.movementX,
            movementY: e.movementY,
            button: e.button,
            buttons: e.buttons,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            metaKey: e.metaKey,
            type: e.type
        }
    }
    l(["input", "change"], {
        createEventArgs: function(e) {
            const t = e.target;
            if (function(e) {
                return -1 !== u.indexOf(e.getAttribute("type"))
            }(t)) {
                const e = function(e) {
                    const t = e.value
                      , n = e.type;
                    switch (n) {
                    case "date":
                    case "month":
                    case "week":
                        return t;
                    case "datetime-local":
                        return 16 === t.length ? t + ":00" : t;
                    case "time":
                        return 5 === t.length ? t + ":00" : t
                    }
                    throw new Error(`Invalid element type '${n}'.`)
                }(t);
                return {
                    value: e
                }
            }
            if (function(e) {
                return e instanceof HTMLSelectElement && "select-multiple" === e.type
            }(t)) {
                const e = t;
                return {
                    value: Array.from(e.options).filter((e => e.selected)).map((e => e.value))
                }
            }
            {
                const e = function(e) {
                    return !!e && "INPUT" === e.tagName && "checkbox" === e.getAttribute("type")
                }(t);
                return {
                    value: e ? !!t.checked : t.value
                }
            }
        }
    }),
    l(["copy", "cut", "paste"], {
        createEventArgs: e => ({
            type: e.type
        })
    }),
    l(["drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop"], {
        createEventArgs: e => {
            return {
                ...d(t = e),
                dataTransfer: t.dataTransfer ? {
                    dropEffect: t.dataTransfer.dropEffect,
                    effectAllowed: t.dataTransfer.effectAllowed,
                    files: Array.from(t.dataTransfer.files).map((e => e.name)),
                    items: Array.from(t.dataTransfer.items).map((e => ({
                        kind: e.kind,
                        type: e.type
                    }))),
                    types: t.dataTransfer.types
                } : null
            };
            var t
        }
    }),
    l(["focus", "blur", "focusin", "focusout"], {
        createEventArgs: e => ({
            type: e.type
        })
    }),
    l(["keydown", "keyup", "keypress"], {
        createEventArgs: e => {
            return {
                key: (t = e).key,
                code: t.code,
                location: t.location,
                repeat: t.repeat,
                ctrlKey: t.ctrlKey,
                shiftKey: t.shiftKey,
                altKey: t.altKey,
                metaKey: t.metaKey,
                type: t.type,
                isComposing: t.isComposing
            };
            var t
        }
    }),
    l(["contextmenu", "click", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "mouseleave", "mouseenter", "dblclick"], {
        createEventArgs: e => d(e)
    }),
    l(["error"], {
        createEventArgs: e => {
            return {
                message: (t = e).message,
                filename: t.filename,
                lineno: t.lineno,
                colno: t.colno,
                type: t.type
            };
            var t
        }
    }),
    l(["loadstart", "timeout", "abort", "load", "loadend", "progress"], {
        createEventArgs: e => {
            return {
                lengthComputable: (t = e).lengthComputable,
                loaded: t.loaded,
                total: t.total,
                type: t.type
            };
            var t
        }
    }),
    l(["touchcancel", "touchend", "touchmove", "touchenter", "touchleave", "touchstart"], {
        createEventArgs: e => {
            return {
                detail: (t = e).detail,
                touches: h(t.touches),
                targetTouches: h(t.targetTouches),
                changedTouches: h(t.changedTouches),
                ctrlKey: t.ctrlKey,
                shiftKey: t.shiftKey,
                altKey: t.altKey,
                metaKey: t.metaKey,
                type: t.type
            };
            var t
        }
    }),
    l(["gotpointercapture", "lostpointercapture", "pointercancel", "pointerdown", "pointerenter", "pointerleave", "pointermove", "pointerout", "pointerover", "pointerup"], {
        createEventArgs: e => {
            return {
                ...d(t = e),
                pointerId: t.pointerId,
                width: t.width,
                height: t.height,
                pressure: t.pressure,
                tiltX: t.tiltX,
                tiltY: t.tiltY,
                pointerType: t.pointerType,
                isPrimary: t.isPrimary
            };
            var t
        }
    }),
    l(["wheel", "mousewheel"], {
        createEventArgs: e => {
            return {
                ...d(t = e),
                deltaX: t.deltaX,
                deltaY: t.deltaY,
                deltaZ: t.deltaZ,
                deltaMode: t.deltaMode
            };
            var t
        }
    }),
    l(["cancel", "close", "toggle"], {
        createEventArgs: () => ({})
    });
    const u = ["date", "datetime-local", "month", "time", "week"]
      , p = new Map;
    let f, g, m = 0;
    const y = {
        async add(e, t, n) {
            if (!n)
                throw new Error("initialParameters must be an object, even if empty.");
            const o = "__bl-dynamic-root:" + (++m).toString();
            p.set(o, e);
            const r = await _().invokeMethodAsync("AddRootComponent", t, o)
              , i = new w(r,g[t]);
            return await i.setParameters(n),
            i
        }
    };
    class v {
        invoke(e) {
            return this._callback(e)
        }
        setCallback(t) {
            this._selfJSObjectReference || (this._selfJSObjectReference = e.createJSObjectReference(this)),
            this._callback = t
        }
        getJSObjectReference() {
            return this._selfJSObjectReference
        }
        dispose() {
            this._selfJSObjectReference && e.disposeJSObjectReference(this._selfJSObjectReference)
        }
    }
    class w {
        constructor(e, t) {
            this._jsEventCallbackWrappers = new Map,
            this._componentId = e;
            for (const e of t)
                "eventcallback" === e.type && this._jsEventCallbackWrappers.set(e.name.toLowerCase(), new v)
        }
        setParameters(e) {
            const t = {}
              , n = Object.entries(e || {})
              , o = n.length;
            for (const [e,o] of n) {
                const n = this._jsEventCallbackWrappers.get(e.toLowerCase());
                n && o ? (n.setCallback(o),
                t[e] = n.getJSObjectReference()) : t[e] = o
            }
            return _().invokeMethodAsync("SetRootComponentParameters", this._componentId, o, t)
        }
        async dispose() {
            if (null !== this._componentId) {
                await _().invokeMethodAsync("RemoveRootComponent", this._componentId),
                this._componentId = null;
                for (const e of this._jsEventCallbackWrappers.values())
                    e.dispose()
            }
        }
    }
    function _() {
        if (!f)
            throw new Error("Dynamic root components have not been enabled in this application.");
        return f
    }
    const b = new Map
      , S = []
      , E = new Map;
    function C(t, n, o, r) {
        if (b.has(t))
            throw new Error(`Interop methods are already registered for renderer ${t}`);
        b.set(t, n),
        o && r && Object.keys(o).length > 0 && function(t, n, o) {
            if (f)
                throw new Error("Dynamic root components have already been enabled.");
            f = t,
            g = n;
            for (const [t,r] of Object.entries(o)) {
                const o = e.findJSFunction(t, 0);
                for (const e of r)
                    o(e, n[e])
            }
        }(k(t), o, r),
        E.get(t)?.[0]?.(),
        function(e) {
            for (const t of S)
                t(e)
        }(t)
    }
    function I(e, t, n) {
        return T(e, t.eventHandlerId, ( () => k(e).invokeMethodAsync("DispatchEventAsync", t, n)))
    }
    function k(e) {
        const t = b.get(e);
        if (!t)
            throw new Error(`No interop methods are registered for renderer ${e}`);
        return t
    }
    let T = (e, t, n) => n();
    const D = M(["abort", "blur", "cancel", "canplay", "canplaythrough", "change", "close", "cuechange", "durationchange", "emptied", "ended", "error", "focus", "load", "loadeddata", "loadedmetadata", "loadend", "loadstart", "mouseenter", "mouseleave", "pointerenter", "pointerleave", "pause", "play", "playing", "progress", "ratechange", "reset", "scroll", "seeked", "seeking", "stalled", "submit", "suspend", "timeupdate", "toggle", "unload", "volumechange", "waiting", "DOMNodeInsertedIntoDocument", "DOMNodeRemovedFromDocument"])
      , R = {
        submit: !0
    }
      , x = M(["click", "dblclick", "mousedown", "mousemove", "mouseup"]);
    class A {
        static{this.nextEventDelegatorId = 0
        }constructor(e) {
            this.browserRendererId = e,
            this.afterClickCallbacks = [];
            const t = ++A.nextEventDelegatorId;
            this.eventsCollectionKey = `_blazorEvents_${t}`,
            this.eventInfoStore = new P(this.onGlobalEvent.bind(this))
        }
        setListener(e, t, n, o) {
            const r = this.getEventHandlerInfosForElement(e, !0)
              , i = r.getHandler(t);
            if (i)
                this.eventInfoStore.update(i.eventHandlerId, n);
            else {
                const i = {
                    element: e,
                    eventName: t,
                    eventHandlerId: n,
                    renderingComponentId: o
                };
                this.eventInfoStore.add(i),
                r.setHandler(t, i)
            }
        }
        getHandler(e) {
            return this.eventInfoStore.get(e)
        }
        removeListener(e) {
            const t = this.eventInfoStore.remove(e);
            if (t) {
                const e = t.element
                  , n = this.getEventHandlerInfosForElement(e, !1);
                n && n.removeHandler(t.eventName)
            }
        }
        notifyAfterClick(e) {
            this.afterClickCallbacks.push(e),
            this.eventInfoStore.addGlobalListener("click")
        }
        setStopPropagation(e, t, n) {
            this.getEventHandlerInfosForElement(e, !0).stopPropagation(t, n)
        }
        setPreventDefault(e, t, n) {
            this.getEventHandlerInfosForElement(e, !0).preventDefault(t, n)
        }
        onGlobalEvent(e) {
            if (!(e.target instanceof Element))
                return;
            this.dispatchGlobalEventToAllElements(e.type, e);
            const t = (n = e.type,
            i.get(n));
            var n;
            t && t.forEach((t => this.dispatchGlobalEventToAllElements(t, e))),
            "click" === e.type && this.afterClickCallbacks.forEach((t => t(e)))
        }
        dispatchGlobalEventToAllElements(e, t) {
            const n = t.composedPath();
            let r = n.shift()
              , i = null
              , s = !1;
            const c = Object.prototype.hasOwnProperty.call(D, e);
            let l = !1;
            for (; r; ) {
                const u = r
                  , p = this.getEventHandlerInfosForElement(u, !1);
                if (p) {
                    const n = p.getHandler(e);
                    if (n && (h = u,
                    d = t.type,
                    !((h instanceof HTMLButtonElement || h instanceof HTMLInputElement || h instanceof HTMLTextAreaElement || h instanceof HTMLSelectElement) && Object.prototype.hasOwnProperty.call(x, d) && h.disabled))) {
                        if (!s) {
                            const n = a(e);
                            i = n?.createEventArgs ? n.createEventArgs(t) : {},
                            s = !0
                        }
                        Object.prototype.hasOwnProperty.call(R, t.type) && t.preventDefault(),
                        I(this.browserRendererId, {
                            eventHandlerId: n.eventHandlerId,
                            eventName: e,
                            eventFieldInfo: o.fromEvent(n.renderingComponentId, t)
                        }, i)
                    }
                    p.stopPropagation(e) && (l = !0),
                    p.preventDefault(e) && t.preventDefault()
                }
                r = c || l ? void 0 : n.shift()
            }
            var h, d
        }
        getEventHandlerInfosForElement(e, t) {
            return Object.prototype.hasOwnProperty.call(e, this.eventsCollectionKey) ? e[this.eventsCollectionKey] : t ? e[this.eventsCollectionKey] = new N : null
        }
    }
    class P {
        constructor(e) {
            this.globalListener = e,
            this.infosByEventHandlerId = {},
            this.countByEventName = {},
            s.push(this.handleEventNameAliasAdded.bind(this))
        }
        add(e) {
            if (this.infosByEventHandlerId[e.eventHandlerId])
                throw new Error(`Event ${e.eventHandlerId} is already tracked`);
            this.infosByEventHandlerId[e.eventHandlerId] = e,
            this.addGlobalListener(e.eventName)
        }
        get(e) {
            return this.infosByEventHandlerId[e]
        }
        addGlobalListener(e) {
            if (e = c(e),
            Object.prototype.hasOwnProperty.call(this.countByEventName, e))
                this.countByEventName[e]++;
            else {
                this.countByEventName[e] = 1;
                const t = Object.prototype.hasOwnProperty.call(D, e);
                document.addEventListener(e, this.globalListener, t)
            }
        }
        update(e, t) {
            if (Object.prototype.hasOwnProperty.call(this.infosByEventHandlerId, t))
                throw new Error(`Event ${t} is already tracked`);
            const n = this.infosByEventHandlerId[e];
            delete this.infosByEventHandlerId[e],
            n.eventHandlerId = t,
            this.infosByEventHandlerId[t] = n
        }
        remove(e) {
            const t = this.infosByEventHandlerId[e];
            if (t) {
                delete this.infosByEventHandlerId[e];
                const n = c(t.eventName);
                0 == --this.countByEventName[n] && (delete this.countByEventName[n],
                document.removeEventListener(n, this.globalListener))
            }
            return t
        }
        handleEventNameAliasAdded(e, t) {
            if (Object.prototype.hasOwnProperty.call(this.countByEventName, e)) {
                const n = this.countByEventName[e];
                delete this.countByEventName[e],
                document.removeEventListener(e, this.globalListener),
                this.addGlobalListener(t),
                this.countByEventName[t] += n - 1
            }
        }
    }
    class N {
        constructor() {
            this.handlers = {},
            this.preventDefaultFlags = null,
            this.stopPropagationFlags = null
        }
        getHandler(e) {
            return Object.prototype.hasOwnProperty.call(this.handlers, e) ? this.handlers[e] : null
        }
        setHandler(e, t) {
            this.handlers[e] = t
        }
        removeHandler(e) {
            delete this.handlers[e]
        }
        preventDefault(e, t) {
            return void 0 !== t && (this.preventDefaultFlags = this.preventDefaultFlags || {},
            this.preventDefaultFlags[e] = t),
            !!this.preventDefaultFlags && this.preventDefaultFlags[e]
        }
        stopPropagation(e, t) {
            return void 0 !== t && (this.stopPropagationFlags = this.stopPropagationFlags || {},
            this.stopPropagationFlags[e] = t),
            !!this.stopPropagationFlags && this.stopPropagationFlags[e]
        }
    }
    function M(e) {
        const t = {};
        return e.forEach((e => {
            t[e] = !0
        }
        )),
        t
    }
    const U = Symbol()
      , B = Symbol()
      , L = Symbol();
    function $(e, t) {
        if (U in e)
            return e;
        const n = [];
        if (e.childNodes.length > 0) {
            if (!t)
                throw new Error("New logical elements must start empty, or allowExistingContents must be true");
            e.childNodes.forEach((t => {
                const o = $(t, !0);
                o[B] = e,
                n.push(o)
            }
            ))
        }
        return e[U] = n,
        e
    }
    function O(e) {
        const t = J(e);
        for (; t.length; )
            j(e, 0)
    }
    function F(e, t) {
        const n = document.createComment("!");
        return H(n, e, t),
        n
    }
    function H(e, t, n) {
        const o = e;
        let r = e;
        if (e instanceof Comment) {
            const t = J(o);
            if (t?.length > 0) {
                const t = G(o)
                  , n = new Range;
                n.setStartBefore(e),
                n.setEndAfter(t),
                r = n.extractContents()
            }
        }
        const i = W(o);
        if (i) {
            const e = J(i)
              , t = Array.prototype.indexOf.call(e, o);
            e.splice(t, 1),
            delete o[B]
        }
        const s = J(t);
        if (n < s.length) {
            const e = s[n];
            e.parentNode.insertBefore(r, e),
            s.splice(n, 0, o)
        } else
            Y(r, t),
            s.push(o);
        o[B] = t,
        U in o || (o[U] = [])
    }
    function j(e, t) {
        const n = J(e).splice(t, 1)[0];
        if (n instanceof Comment) {
            const e = J(n);
            if (e)
                for (; e.length > 0; )
                    j(n, 0)
        }
        const o = n;
        o.parentNode.removeChild(o)
    }
    function W(e) {
        return e[B] || null
    }
    function z(e, t) {
        return J(e)[t]
    }
    function q(e) {
        const t = X(e);
        return "http://www.w3.org/2000/svg" === t.namespaceURI && "foreignObject" !== t.tagName
    }
    function J(e) {
        return e[U]
    }
    function V(e) {
        const t = J(W(e));
        return t[Array.prototype.indexOf.call(t, e) + 1] || null
    }
    function K(e, t) {
        const n = J(e);
        t.forEach((e => {
            e.moveRangeStart = n[e.fromSiblingIndex],
            e.moveRangeEnd = G(e.moveRangeStart)
        }
        )),
        t.forEach((t => {
            const o = document.createComment("marker");
            t.moveToBeforeMarker = o;
            const r = n[t.toSiblingIndex + 1];
            r ? r.parentNode.insertBefore(o, r) : Y(o, e)
        }
        )),
        t.forEach((e => {
            const t = e.moveToBeforeMarker
              , n = t.parentNode
              , o = e.moveRangeStart
              , r = e.moveRangeEnd;
            let i = o;
            for (; i; ) {
                const e = i.nextSibling;
                if (n.insertBefore(i, t),
                i === r)
                    break;
                i = e
            }
            n.removeChild(t)
        }
        )),
        t.forEach((e => {
            n[e.toSiblingIndex] = e.moveRangeStart
        }
        ))
    }
    function X(e) {
        if (e instanceof Element || e instanceof DocumentFragment)
            return e;
        if (e instanceof Comment)
            return e.parentNode;
        throw new Error("Not a valid logical element")
    }
    function Y(e, t) {
        if (t instanceof Element || t instanceof DocumentFragment)
            t.appendChild(e);
        else {
            if (!(t instanceof Comment))
                throw new Error(`Cannot append node because the parent is not a valid logical element. Parent: ${t}`);
            {
                const n = V(t);
                n ? n.parentNode.insertBefore(e, n) : Y(e, W(t))
            }
        }
    }
    function G(e) {
        if (e instanceof Element || e instanceof DocumentFragment)
            return e;
        const t = V(e);
        if (t)
            return t.previousSibling;
        {
            const t = W(e);
            return t instanceof Element || t instanceof DocumentFragment ? t.lastChild : G(t)
        }
    }
    function Q(e) {
        return `_bl_${e}`
    }
    const Z = "__internalId";
    e.attachReviver(( (e, t) => t && "object" == typeof t && Object.prototype.hasOwnProperty.call(t, Z) && "string" == typeof t[Z] ? function(e) {
        const t = `[${Q(e)}]`;
        return document.querySelector(t)
    }(t[Z]) : t));
    const ee = "_blazorDeferredValue";
    function te(e) {
        return "select-multiple" === e.type
    }
    function ne(e, t) {
        e.value = t || ""
    }
    function oe(e, t) {
        e instanceof HTMLSelectElement ? te(e) ? function(e, t) {
            t ||= [];
            for (let n = 0; n < e.options.length; n++)
                e.options[n].selected = -1 !== t.indexOf(e.options[n].value)
        }(e, t) : ne(e, t) : e.value = t
    }
    function re(e) {
        const t = function(e) {
            for (; e; ) {
                if (e instanceof HTMLSelectElement)
                    return e;
                e = e.parentElement
            }
            return null
        }(e);
        if (!function(e) {
            return !!e && ee in e
        }(t))
            return !1;
        if (te(t))
            e.selected = -1 !== t._blazorDeferredValue.indexOf(e.value);
        else {
            if (t._blazorDeferredValue !== e.value)
                return !1;
            ne(t, e.value),
            delete t._blazorDeferredValue
        }
        return !0
    }
    const ie = document.createElement("template")
      , se = document.createElementNS("http://www.w3.org/2000/svg", "g")
      , ae = new Set
      , ce = Symbol()
      , le = Symbol();
    class he {
        constructor(e) {
            this.rootComponentIds = new Set,
            this.childComponentLocations = {},
            this.eventDelegator = new A(e),
            this.eventDelegator.notifyAfterClick((e => {
                be() && function(e) {
                    if (0 !== e.button || function(e) {
                        return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey
                    }(e))
                        return;
                    if (e.defaultPrevented)
                        return;
                    const t = function(e) {
                        const t = e.composedPath && e.composedPath();
                        if (t)
                            for (let e = 0; e < t.length; e++) {
                                const n = t[e];
                                if (n instanceof HTMLAnchorElement || n instanceof SVGAElement)
                                    return n
                            }
                        return null
                    }(e);
                    if (t && function(e) {
                        const t = e.getAttribute("target");
                        return (!t || "_self" === t) && e.hasAttribute("href") && !e.hasAttribute("download")
                    }(t)) {
                        const n = _e(t.getAttribute("href"));
                        ve(n) && (e.preventDefault(),
                        Ae(n, !0, !1))
                    }
                }(e)
            }
            ))
        }
        getRootComponentCount() {
            return this.rootComponentIds.size
        }
        attachRootComponentToLogicalElement(e, t, n) {
            if (function(e) {
                return e[ce]
            }(t))
                throw new Error(`Root component '${e}' could not be attached because its target element is already associated with a root component`);
            n && (t = F(t, J(t).length)),
            de(t, !0),
            this.attachComponentToElement(e, t),
            this.rootComponentIds.add(e),
            ae.add(t)
        }
        updateComponent(e, t, n, o) {
            const r = this.childComponentLocations[t];
            if (!r)
                throw new Error(`No element is currently associated with component ${t}`);
            ae.delete(r) && (O(r),
            r instanceof Comment && (r.textContent = "!"));
            const i = X(r)?.getRootNode()
              , s = i && i.activeElement;
            this.applyEdits(e, t, r, 0, n, o),
            s instanceof HTMLElement && i && i.activeElement !== s && s.focus()
        }
        disposeComponent(e) {
            if (this.rootComponentIds.delete(e)) {
                const t = this.childComponentLocations[e];
                de(t, !1),
                !0 === t[le] ? ae.add(t) : O(t)
            }
            delete this.childComponentLocations[e]
        }
        disposeEventHandler(e) {
            this.eventDelegator.removeListener(e)
        }
        attachComponentToElement(e, t) {
            this.childComponentLocations[e] = t
        }
        applyEdits(e, n, o, r, i, s) {
            let a, c = 0, l = r;
            const h = e.arrayBuilderSegmentReader
              , d = e.editReader
              , u = e.frameReader
              , p = h.values(i)
              , f = h.offset(i)
              , g = f + h.count(i);
            for (let i = f; i < g; i++) {
                const h = e.diffReader.editsEntry(p, i)
                  , f = d.editType(h);
                switch (f) {
                case t.prependFrame:
                    {
                        const t = d.newTreeIndex(h)
                          , r = e.referenceFramesEntry(s, t)
                          , i = d.siblingIndex(h);
                        this.insertFrame(e, n, o, l + i, s, r, t);
                        break
                    }
                case t.removeFrame:
                    j(o, l + d.siblingIndex(h));
                    break;
                case t.setAttribute:
                    {
                        const t = d.newTreeIndex(h)
                          , r = e.referenceFramesEntry(s, t)
                          , i = z(o, l + d.siblingIndex(h));
                        if (!(i instanceof Element))
                            throw new Error("Cannot set attribute on non-element child");
                        this.applyAttribute(e, n, i, r);
                        break
                    }
                case t.removeAttribute:
                    {
                        const e = z(o, l + d.siblingIndex(h));
                        if (!(e instanceof Element))
                            throw new Error("Cannot remove attribute from non-element child");
                        {
                            const t = d.removedAttributeName(h);
                            this.setOrRemoveAttributeOrProperty(e, t, null)
                        }
                        break
                    }
                case t.updateText:
                    {
                        const t = d.newTreeIndex(h)
                          , n = e.referenceFramesEntry(s, t)
                          , r = z(o, l + d.siblingIndex(h));
                        if (!(r instanceof Text))
                            throw new Error("Cannot set text content on non-text child");
                        r.textContent = u.textContent(n);
                        break
                    }
                case t.updateMarkup:
                    {
                        const t = d.newTreeIndex(h)
                          , n = e.referenceFramesEntry(s, t)
                          , r = d.siblingIndex(h);
                        j(o, l + r),
                        this.insertMarkup(e, o, l + r, n);
                        break
                    }
                case t.stepIn:
                    o = z(o, l + d.siblingIndex(h)),
                    c++,
                    l = 0;
                    break;
                case t.stepOut:
                    o = W(o),
                    c--,
                    l = 0 === c ? r : 0;
                    break;
                case t.permutationListEntry:
                    a = a || [],
                    a.push({
                        fromSiblingIndex: l + d.siblingIndex(h),
                        toSiblingIndex: l + d.moveToSiblingIndex(h)
                    });
                    break;
                case t.permutationListEnd:
                    K(o, a),
                    a = void 0;
                    break;
                default:
                    throw new Error(`Unknown edit type: ${f}`)
                }
            }
        }
        insertFrame(e, t, o, r, i, s, a) {
            const c = e.frameReader
              , l = c.frameType(s);
            switch (l) {
            case n.element:
                return this.insertElement(e, t, o, r, i, s, a),
                1;
            case n.text:
                return this.insertText(e, o, r, s),
                1;
            case n.attribute:
                throw new Error("Attribute frames should only be present as leading children of element frames.");
            case n.component:
                return this.insertComponent(e, o, r, s),
                1;
            case n.region:
                return this.insertFrameRange(e, t, o, r, i, a + 1, a + c.subtreeLength(s));
            case n.elementReferenceCapture:
                if (o instanceof Element)
                    return h = o,
                    d = c.elementReferenceCaptureId(s),
                    h.setAttribute(Q(d), ""),
                    0;
                throw new Error("Reference capture frames can only be children of element frames.");
            case n.markup:
                return this.insertMarkup(e, o, r, s),
                1;
            case n.namedEvent:
                return 0;
            default:
                throw new Error(`Unknown frame type: ${l}`)
            }
            var h, d
        }
        insertElement(e, t, o, r, i, s, a) {
            const c = e.frameReader
              , l = c.elementName(s)
              , h = "svg" === l || q(o) ? document.createElementNS("http://www.w3.org/2000/svg", l) : document.createElement(l)
              , d = $(h);
            let u = !1;
            const p = a + c.subtreeLength(s);
            for (let s = a + 1; s < p; s++) {
                const a = e.referenceFramesEntry(i, s);
                if (c.frameType(a) !== n.attribute) {
                    H(h, o, r),
                    u = !0,
                    this.insertFrameRange(e, t, d, 0, i, s, p);
                    break
                }
                this.applyAttribute(e, t, h, a)
            }
            var f;
            u || H(h, o, r),
            (f = h)instanceof HTMLOptionElement ? re(f) : ee in f && oe(f, f[ee])
        }
        insertComponent(e, t, n, o) {
            const r = F(t, n)
              , i = e.frameReader.componentId(o);
            this.attachComponentToElement(i, r)
        }
        insertText(e, t, n, o) {
            const r = e.frameReader.textContent(o);
            H(document.createTextNode(r), t, n)
        }
        insertMarkup(e, t, n, o) {
            const r = F(t, n)
              , i = (s = e.frameReader.markupContent(o),
            q(t) ? (se.innerHTML = s || " ",
            se) : (ie.innerHTML = s || " ",
            ie.content.querySelectorAll("script").forEach((e => {
                const t = document.createElement("script");
                t.textContent = e.textContent,
                e.getAttributeNames().forEach((n => {
                    t.setAttribute(n, e.getAttribute(n))
                }
                )),
                e.parentNode.replaceChild(t, e)
            }
            )),
            ie.content));
            var s;
            let a = 0;
            for (; i.firstChild; )
                H(i.firstChild, r, a++)
        }
        applyAttribute(e, t, n, o) {
            const r = e.frameReader
              , i = r.attributeName(o)
              , s = r.attributeEventHandlerId(o);
            if (s) {
                const e = pe(i);
                return void this.eventDelegator.setListener(n, e, s, t)
            }
            const a = r.attributeValue(o);
            this.setOrRemoveAttributeOrProperty(n, i, a)
        }
        insertFrameRange(e, t, n, o, r, i, s) {
            const a = o;
            for (let a = i; a < s; a++) {
                const i = e.referenceFramesEntry(r, a);
                o += this.insertFrame(e, t, n, o, r, i, a),
                a += ue(e, i)
            }
            return o - a
        }
        setOrRemoveAttributeOrProperty(e, t, n) {
            (function(e, t, n) {
                switch (t) {
                case "value":
                    return function(e, t) {
                        switch (t && "INPUT" === e.tagName && (t = function(e, t) {
                            switch (t.getAttribute("type")) {
                            case "time":
                                return 8 !== e.length || !e.endsWith("00") && t.hasAttribute("step") ? e : e.substring(0, 5);
                            case "datetime-local":
                                return 19 !== e.length || !e.endsWith("00") && t.hasAttribute("step") ? e : e.substring(0, 16);
                            default:
                                return e
                            }
                        }(t, e)),
                        e.tagName) {
                        case "INPUT":
                        case "SELECT":
                        case "TEXTAREA":
                            return t && e instanceof HTMLSelectElement && te(e) && (t = JSON.parse(t)),
                            oe(e, t),
                            e[ee] = t,
                            !0;
                        case "OPTION":
                            return t || "" === t ? e.setAttribute("value", t) : e.removeAttribute("value"),
                            re(e),
                            !0;
                        default:
                            return !1
                        }
                    }(e, n);
                case "checked":
                    return function(e, t) {
                        return "INPUT" === e.tagName && (e.checked = null !== t,
                        !0)
                    }(e, n);
                default:
                    return !1
                }
            }
            )(e, t, n) || (t.startsWith("__internal_") ? this.applyInternalAttribute(e, t.substring(11), n) : null !== n ? e.setAttribute(t, n) : e.removeAttribute(t))
        }
        applyInternalAttribute(e, t, n) {
            if (t.startsWith("stopPropagation_")) {
                const o = pe(t.substring(16));
                this.eventDelegator.setStopPropagation(e, o, null !== n)
            } else {
                if (!t.startsWith("preventDefault_"))
                    throw new Error(`Unsupported internal attribute '${t}'`);
                {
                    const o = pe(t.substring(15));
                    this.eventDelegator.setPreventDefault(e, o, null !== n)
                }
            }
        }
    }
    function de(e, t) {
        e[ce] = t
    }
    function ue(e, t) {
        const o = e.frameReader;
        switch (o.frameType(t)) {
        case n.component:
        case n.element:
        case n.region:
            return o.subtreeLength(t) - 1;
        default:
            return 0
        }
    }
    function pe(e) {
        if (e.startsWith("on"))
            return e.substring(2);
        throw new Error(`Attribute should be an event name, but doesn't start with 'on'. Value: '${e}'`)
    }
    const fe = {};
    let ge, me, ye = !1;
    function ve(e) {
        const t = (n = document.baseURI).substring(0, n.lastIndexOf("/"));
        var n;
        const o = e.charAt(t.length);
        return e.startsWith(t) && ("" === o || "/" === o || "?" === o || "#" === o)
    }
    function we(e) {
        document.getElementById(e)?.scrollIntoView()
    }
    function _e(e) {
        return me = me || document.createElement("a"),
        me.href = e,
        me.href
    }
    function be() {
        return void 0 !== ge
    }
    function Se() {
        return ge
    }
    let Ee = !1
      , Ce = 0
      , Ie = 0;
    const ke = new Map;
    let Te = async function(e) {
        Me();
        const t = $e();
        if (t?.hasLocationChangingEventListeners) {
            const n = e.state?._index ?? 0
              , o = e.state?.userState
              , r = n - Ce
              , i = location.href;
            if (await Ne(-r),
            !await Ue(i, o, !1, t))
                return;
            await Ne(r)
        }
        await Be(!0)
    }
      , De = null;
    const Re = {
        listenForNavigationEvents: function(e, t, n) {
            ke.set(e, {
                rendererId: e,
                hasLocationChangingEventListeners: !1,
                locationChanged: t,
                locationChanging: n
            }),
            Ee || (Ee = !0,
            window.addEventListener("popstate", Le),
            Ce = history.state?._index ?? 0)
        },
        enableNavigationInterception: function(e) {
            if (void 0 !== ge && ge !== e)
                throw new Error("Only one interactive runtime may enable navigation interception at a time.");
            ge = e
        },
        setHasLocationChangingListeners: function(e, t) {
            const n = ke.get(e);
            if (!n)
                throw new Error(`Renderer with ID '${e}' is not listening for navigation events`);
            n.hasLocationChangingEventListeners = t
        },
        endLocationChanging: function(e, t) {
            De && e === Ie && (De(t),
            De = null)
        },
        navigateTo: function(e, t) {
            xe(e, t, !0)
        },
        refresh: function(e) {
            location.reload()
        },
        getBaseURI: () => document.baseURI,
        getLocationHref: () => location.href,
        scrollToElement: we
    };
    function xe(e, t, n=!1) {
        const o = _e(e);
        !t.forceLoad && ve(o) ? Oe() ? Ae(o, !1, t.replaceHistoryEntry, t.historyEntryState, n) : function() {
            throw new Error("No enhanced programmatic navigation handler has been attached")
        }() : function(e, t) {
            if (location.href === e) {
                const t = e + "?";
                history.replaceState(null, "", t),
                location.replace(e)
            } else
                t ? location.replace(e) : location.href = e
        }(e, t.replaceHistoryEntry)
    }
    async function Ae(e, t, n, o=void 0, r=!1) {
        if (Me(),
        function(e) {
            const t = new URL(e);
            return "" !== t.hash && location.origin === t.origin && location.pathname === t.pathname && location.search === t.search
        }(e))
            return Pe(e, n, o),
            void function(e) {
                const t = e.indexOf("#");
                t !== e.length - 1 && we(e.substring(t + 1))
            }(e);
        const i = $e();
        (r || !i?.hasLocationChangingEventListeners || await Ue(e, o, t, i)) && (ye = !0,
        Pe(e, n, o),
        await Be(t))
    }
    function Pe(e, t, n=void 0) {
        t ? history.replaceState({
            userState: n,
            _index: Ce
        }, "", e) : (Ce++,
        history.pushState({
            userState: n,
            _index: Ce
        }, "", e))
    }
    function Ne(e) {
        return new Promise((t => {
            const n = Te;
            Te = () => {
                Te = n,
                t()
            }
            ,
            history.go(e)
        }
        ))
    }
    function Me() {
        De && (De(!1),
        De = null)
    }
    function Ue(e, t, n, o) {
        return new Promise((r => {
            Me(),
            Ie++,
            De = r,
            o.locationChanging(Ie, e, t, n)
        }
        ))
    }
    async function Be(e, t) {
        const n = location.href;
        await Promise.all(Array.from(ke, (async ([t,o]) => {
            var r;
            r = t,
            b.has(r) && await o.locationChanged(n, history.state?.userState, e)
        }
        )))
    }
    async function Le(e) {
        Te && Oe() && await Te(e),
        Ce = history.state?._index ?? 0
    }
    function $e() {
        const e = Se();
        if (void 0 !== e)
            return ke.get(e)
    }
    function Oe() {
        return be() || !0
    }
    const Fe = {
        focus: function(e, t) {
            if (e instanceof HTMLElement)
                e.focus({
                    preventScroll: t
                });
            else {
                if (!(e instanceof SVGElement))
                    throw new Error("Unable to focus an invalid element.");
                if (!e.hasAttribute("tabindex"))
                    throw new Error("Unable to focus an SVG element that does not have a tabindex.");
                e.focus({
                    preventScroll: t
                })
            }
        },
        focusBySelector: function(e) {
            const t = document.querySelector(e);
            t && (t.hasAttribute("tabindex") || (t.tabIndex = -1),
            t.focus({
                preventScroll: !0
            }))
        }
    }
      , He = {
        init: function(e, t, n, o=50) {
            const r = We(t);
            (r || document.documentElement).style.overflowAnchor = "none";
            const i = document.createRange();
            u(n.parentElement) && (t.style.display = "table-row",
            n.style.display = "table-row");
            const s = new IntersectionObserver((function(o) {
                o.forEach((o => {
                    if (!o.isIntersecting)
                        return;
                    i.setStartAfter(t),
                    i.setEndBefore(n);
                    const r = i.getBoundingClientRect().height
                      , s = o.rootBounds?.height;
                    o.target === t ? e.invokeMethodAsync("OnSpacerBeforeVisible", o.intersectionRect.top - o.boundingClientRect.top, r, s) : o.target === n && n.offsetHeight > 0 && e.invokeMethodAsync("OnSpacerAfterVisible", o.boundingClientRect.bottom - o.intersectionRect.bottom, r, s)
                }
                ))
            }
            ),{
                root: r,
                rootMargin: `${o}px`
            });
            s.observe(t),
            s.observe(n);
            const a = d(t)
              , c = d(n)
              , {observersByDotNetObjectId: l, id: h} = ze(e);
            function d(e) {
                const t = {
                    attributes: !0
                }
                  , n = new MutationObserver(( (n, o) => {
                    u(e.parentElement) && (o.disconnect(),
                    e.style.display = "table-row",
                    o.observe(e, t)),
                    s.unobserve(e),
                    s.observe(e)
                }
                ));
                return n.observe(e, t),
                n
            }
            function u(e) {
                return null !== e && (e instanceof HTMLTableElement && "" === e.style.display || "table" === e.style.display || e instanceof HTMLTableSectionElement && "" === e.style.display || "table-row-group" === e.style.display)
            }
            l[h] = {
                intersectionObserver: s,
                mutationObserverBefore: a,
                mutationObserverAfter: c
            }
        },
        dispose: function(e) {
            const {observersByDotNetObjectId: t, id: n} = ze(e)
              , o = t[n];
            o && (o.intersectionObserver.disconnect(),
            o.mutationObserverBefore.disconnect(),
            o.mutationObserverAfter.disconnect(),
            e.dispose(),
            delete t[n])
        }
    }
      , je = Symbol();
    function We(e) {
        return e && e !== document.body && e !== document.documentElement ? "visible" !== getComputedStyle(e).overflowY ? e : We(e.parentElement) : null
    }
    function ze(e) {
        const t = e._callDispatcher
          , n = e._id;
        return t[je] ??= {},
        {
            observersByDotNetObjectId: t[je],
            id: n
        }
    }
    const qe = {
        getAndRemoveExistingTitle: function() {
            const e = document.head ? document.head.getElementsByTagName("title") : [];
            if (0 === e.length)
                return null;
            let t = null;
            for (let n = e.length - 1; n >= 0; n--) {
                const o = e[n]
                  , r = o.previousSibling;
                r instanceof Comment && null !== W(r) || (null === t && (t = o.textContent),
                o.parentNode?.removeChild(o))
            }
            return t
        }
    }
      , Je = {
        init: function(e, t) {
            t._blazorInputFileNextFileId = 0,
            t.addEventListener("click", (function() {
                t.value = ""
            }
            )),
            t.addEventListener("change", (function() {
                t._blazorFilesById = {};
                const n = Array.prototype.map.call(t.files, (function(e) {
                    const n = {
                        id: ++t._blazorInputFileNextFileId,
                        lastModified: new Date(e.lastModified).toISOString(),
                        name: e.name,
                        size: e.size,
                        contentType: e.type,
                        readPromise: void 0,
                        arrayBuffer: void 0,
                        blob: e
                    };
                    return t._blazorFilesById[n.id] = n,
                    n
                }
                ));
                e.invokeMethodAsync("NotifyChange", n)
            }
            ))
        },
        toImageFile: async function(e, t, n, o, r) {
            const i = Ve(e, t)
              , s = await new Promise((function(e) {
                const t = new Image;
                t.onload = function() {
                    URL.revokeObjectURL(t.src),
                    e(t)
                }
                ,
                t.onerror = function() {
                    t.onerror = null,
                    URL.revokeObjectURL(t.src)
                }
                ,
                t.src = URL.createObjectURL(i.blob)
            }
            ))
              , a = await new Promise((function(e) {
                const t = Math.min(1, o / s.width)
                  , i = Math.min(1, r / s.height)
                  , a = Math.min(t, i)
                  , c = document.createElement("canvas");
                c.width = Math.round(s.width * a),
                c.height = Math.round(s.height * a),
                c.getContext("2d")?.drawImage(s, 0, 0, c.width, c.height),
                c.toBlob(e, n)
            }
            ))
              , c = {
                id: ++e._blazorInputFileNextFileId,
                lastModified: i.lastModified,
                name: i.name,
                size: a?.size || 0,
                contentType: n,
                blob: a || i.blob
            };
            return e._blazorFilesById[c.id] = c,
            c
        },
        readFileData: async function(e, t) {
            return Ve(e, t).blob
        }
    };
    function Ve(e, t) {
        const n = e._blazorFilesById[t];
        if (!n)
            throw new Error(`There is no file with ID ${t}. The file list may have changed. See https://aka.ms/aspnet/blazor-input-file-multiple-selections.`);
        return n
    }
    const Ke = new Set;
    function Xe(e) {
        e.preventDefault(),
        e.returnValue = !0
    }
    async function Ye(e, t, n) {
        return e instanceof Blob ? await async function(e, t, n) {
            const o = e.slice(t, t + n)
              , r = await o.arrayBuffer();
            return new Uint8Array(r)
        }(e, t, n) : function(e, t, n) {
            return new Uint8Array(e.buffer,e.byteOffset + t,n)
        }(e, t, n)
    }
    const Ge = {
        navigateTo: function(e, t, n=!1) {
            xe(e, t instanceof Object ? t : {
                forceLoad: t,
                replaceHistoryEntry: n
            })
        },
        registerCustomEventType: function(e, t) {
            if (!t)
                throw new Error("The options parameter is required.");
            if (r.has(e))
                throw new Error(`The event '${e}' is already registered.`);
            if (t.browserEventName) {
                const n = i.get(t.browserEventName);
                n ? n.push(e) : i.set(t.browserEventName, [e]),
                s.forEach((n => n(e, t.browserEventName)))
            }
            r.set(e, t)
        },
        rootComponents: y,
        runtime: {},
        _internal: {
            navigationManager: Re,
            domWrapper: Fe,
            Virtualize: He,
            PageTitle: qe,
            InputFile: Je,
            NavigationLock: {
                enableNavigationPrompt: function(e) {
                    0 === Ke.size && window.addEventListener("beforeunload", Xe),
                    Ke.add(e)
                },
                disableNavigationPrompt: function(e) {
                    Ke.delete(e),
                    0 === Ke.size && window.removeEventListener("beforeunload", Xe)
                }
            },
            getJSDataStreamChunk: Ye,
            attachWebRendererInterop: C
        }
    };
    var Qe;
    function Ze(e) {
        const t = {
            ...et,
            ...e
        };
        return e && e.reconnectionOptions && (t.reconnectionOptions = {
            ...et.reconnectionOptions,
            ...e.reconnectionOptions
        }),
        t
    }
    window.Blazor = Ge,
    function(e) {
        e[e.Trace = 0] = "Trace",
        e[e.Debug = 1] = "Debug",
        e[e.Information = 2] = "Information",
        e[e.Warning = 3] = "Warning",
        e[e.Error = 4] = "Error",
        e[e.Critical = 5] = "Critical",
        e[e.None = 6] = "None"
    }(Qe || (Qe = {}));
    const et = {
        configureSignalR: e => {}
        ,
        logLevel: Qe.Warning,
        initializers: void 0,
        circuitHandlers: [],
        reconnectionOptions: {
            maxRetries: 30,
            retryIntervalMilliseconds: function(e, t) {
                return t && e >= t ? null : e < 10 ? 0 : e < 20 ? 5e3 : 3e4
            },
            dialogId: "components-reconnect-modal"
        }
    };
    (class e {
        static{this.instance = new e
        }log(e, t) {}
    }
    );
    let tt = class {
        constructor(e) {
            this.minLevel = e
        }
        log(e, t) {
            if (e >= this.minLevel) {
                const n = `[${(new Date).toISOString()}] ${Qe[e]}: ${t}`;
                switch (e) {
                case Qe.Critical:
                case Qe.Error:
                    console.error(n);
                    break;
                case Qe.Warning:
                    console.warn(n);
                    break;
                case Qe.Information:
                    console.info(n);
                    break;
                default:
                    console.log(n)
                }
            }
        }
    }
    ;
    const nt = /^\s*Blazor-Server-Component-State:(?<state>[a-zA-Z0-9+/=]+)$/;
    function ot(e) {
        return rt(e, nt)
    }
    function rt(e, t, n="state") {
        if (e.nodeType === Node.COMMENT_NODE) {
            const o = e.textContent || ""
              , r = t.exec(o)
              , i = r && r.groups && r.groups[n];
            return i && e.parentNode?.removeChild(e),
            i
        }
        if (!e.hasChildNodes())
            return;
        const o = e.childNodes;
        for (let e = 0; e < o.length; e++) {
            const r = rt(o[e], t, n);
            if (r)
                return r
        }
    }
    function it(e, t) {
        const n = []
          , o = new ut(e.childNodes);
        for (; o.next() && o.currentElement; ) {
            const e = at(o, t);
            if (e)
                n.push(e);
            else if (o.currentElement.hasChildNodes()) {
                const e = it(o.currentElement, t);
                for (let t = 0; t < e.length; t++) {
                    const o = e[t];
                    n.push(o)
                }
            }
        }
        return n
    }
    const st = new RegExp(/^\s*Blazor:[^{]*(?<descriptor>.*)$/);
    function at(e, t) {
        const n = e.currentElement;
        var o, r, i;
        if (n && n.nodeType === Node.COMMENT_NODE && n.textContent) {
            const s = st.exec(n.textContent)
              , a = s && s.groups && s.groups.descriptor;
            if (!a)
                return;
            !function(e) {
                if (e.parentNode instanceof Document)
                    throw new Error("Root components cannot be marked as interactive. The <html> element must be rendered statically so that scripts are not evaluated multiple times.")
            }(n);
            try {
                const s = function(e) {
                    const t = JSON.parse(e)
                      , {type: n} = t;
                    if ("server" !== n && "webassembly" !== n && "auto" !== n)
                        throw new Error(`Invalid component type '${n}'.`);
                    return t
                }(a)
                  , c = function(e, t, n) {
                    const {prerenderId: o} = e;
                    if (o) {
                        for (; n.next() && n.currentElement; ) {
                            const e = n.currentElement;
                            if (e.nodeType !== Node.COMMENT_NODE)
                                continue;
                            if (!e.textContent)
                                continue;
                            const t = st.exec(e.textContent)
                              , r = t && t[1];
                            if (r)
                                return dt(r, o),
                                e
                        }
                        throw new Error(`Could not find an end component comment for '${t}'.`)
                    }
                }(s, n, e);
                if (t !== s.type)
                    return;
                switch (s.type) {
                case "webassembly":
                    return r = n,
                    i = c,
                    ht(o = s),
                    {
                        ...o,
                        uniqueId: ct++,
                        start: r,
                        end: i
                    };
                case "server":
                    return function(e, t, n) {
                        return lt(e),
                        {
                            ...e,
                            uniqueId: ct++,
                            start: t,
                            end: n
                        }
                    }(s, n, c);
                case "auto":
                    return function(e, t, n) {
                        return lt(e),
                        ht(e),
                        {
                            ...e,
                            uniqueId: ct++,
                            start: t,
                            end: n
                        }
                    }(s, n, c)
                }
            } catch (e) {
                throw new Error(`Found malformed component comment at ${n.textContent}`)
            }
        }
    }
    let ct = 0;
    function lt(e) {
        const {descriptor: t, sequence: n} = e;
        if (!t)
            throw new Error("descriptor must be defined when using a descriptor.");
        if (void 0 === n)
            throw new Error("sequence must be defined when using a descriptor.");
        if (!Number.isInteger(n))
            throw new Error(`Error parsing the sequence '${n}' for component '${JSON.stringify(e)}'`)
    }
    function ht(e) {
        const {assembly: t, typeName: n} = e;
        if (!t)
            throw new Error("assembly must be defined when using a descriptor.");
        if (!n)
            throw new Error("typeName must be defined when using a descriptor.");
        e.parameterDefinitions = e.parameterDefinitions && atob(e.parameterDefinitions),
        e.parameterValues = e.parameterValues && atob(e.parameterValues)
    }
    function dt(e, t) {
        const n = JSON.parse(e);
        if (1 !== Object.keys(n).length)
            throw new Error(`Invalid end of component comment: '${e}'`);
        const o = n.prerenderId;
        if (!o)
            throw new Error(`End of component comment must have a value for the prerendered property: '${e}'`);
        if (o !== t)
            throw new Error(`End of component comment prerendered property must match the start comment prerender id: '${t}', '${o}'`)
    }
    class ut {
        constructor(e) {
            this.childNodes = e,
            this.currentIndex = -1,
            this.length = e.length
        }
        next() {
            return this.currentIndex++,
            this.currentIndex < this.length ? (this.currentElement = this.childNodes[this.currentIndex],
            !0) : (this.currentElement = void 0,
            !1)
        }
    }
    class pt extends Error {
        constructor(e, t) {
            const n = new.target.prototype;
            super(`${e}: Status code '${t}'`),
            this.statusCode = t,
            this.__proto__ = n
        }
    }
    class ft extends Error {
        constructor(e="A timeout occurred.") {
            const t = new.target.prototype;
            super(e),
            this.__proto__ = t
        }
    }
    class gt extends Error {
        constructor(e="An abort occurred.") {
            const t = new.target.prototype;
            super(e),
            this.__proto__ = t
        }
    }
    class mt extends Error {
        constructor(e, t) {
            const n = new.target.prototype;
            super(e),
            this.transport = t,
            this.errorType = "UnsupportedTransportError",
            this.__proto__ = n
        }
    }
    class yt extends Error {
        constructor(e, t) {
            const n = new.target.prototype;
            super(e),
            this.transport = t,
            this.errorType = "DisabledTransportError",
            this.__proto__ = n
        }
    }
    class vt extends Error {
        constructor(e, t) {
            const n = new.target.prototype;
            super(e),
            this.transport = t,
            this.errorType = "FailedToStartTransportError",
            this.__proto__ = n
        }
    }
    class wt extends Error {
        constructor(e) {
            const t = new.target.prototype;
            super(e),
            this.errorType = "FailedToNegotiateWithServerError",
            this.__proto__ = t
        }
    }
    class _t extends Error {
        constructor(e, t) {
            const n = new.target.prototype;
            super(e),
            this.innerErrors = t,
            this.__proto__ = n
        }
    }
    class bt {
        constructor(e, t, n) {
            this.statusCode = e,
            this.statusText = t,
            this.content = n
        }
    }
    class St {
        get(e, t) {
            return this.send({
                ...t,
                method: "GET",
                url: e
            })
        }
        post(e, t) {
            return this.send({
                ...t,
                method: "POST",
                url: e
            })
        }
        delete(e, t) {
            return this.send({
                ...t,
                method: "DELETE",
                url: e
            })
        }
        getCookieString(e) {
            return ""
        }
    }
    var Et, Ct, It;
    !function(e) {
        e[e.Trace = 0] = "Trace",
        e[e.Debug = 1] = "Debug",
        e[e.Information = 2] = "Information",
        e[e.Warning = 3] = "Warning",
        e[e.Error = 4] = "Error",
        e[e.Critical = 5] = "Critical",
        e[e.None = 6] = "None"
    }(Et || (Et = {}));
    class kt {
        constructor() {}
        log(e, t) {}
    }
    kt.instance = new kt;
    class Tt {
        static isRequired(e, t) {
            if (null == e)
                throw new Error(`The '${t}' argument is required.`)
        }
        static isNotEmpty(e, t) {
            if (!e || e.match(/^\s*$/))
                throw new Error(`The '${t}' argument should not be empty.`)
        }
        static isIn(e, t, n) {
            if (!(e in t))
                throw new Error(`Unknown ${n} value: ${e}.`)
        }
    }
    class Dt {
        static get isBrowser() {
            return "object" == typeof window && "object" == typeof window.document
        }
        static get isWebWorker() {
            return "object" == typeof self && "importScripts"in self
        }
        static get isReactNative() {
            return "object" == typeof window && void 0 === window.document
        }
        static get isNode() {
            return "undefined" != typeof process && process.release && "node" === process.release.name
        }
    }
    function Rt(e, t) {
        let n = "";
        return xt(e) ? (n = `Binary data of length ${e.byteLength}`,
        t && (n += `. Content: '${function(e) {
            const t = new Uint8Array(e);
            letn = "";
            return t.forEach((e => {
                n += `0x${e < 16 ? "0" : ""}${e.toString(16)} `
            }
            )),
            n.substr(0, n.length - 1)
        }(e)}'`)) : "string" == typeof e && (n = `String data of length ${e.length}`,
        t && (n += `. Content: '${e}'`)),
        n
    }
    function xt(e) {
        return e && "undefined" != typeof ArrayBuffer && (e instanceof ArrayBuffer || e.constructor && "ArrayBuffer" === e.constructor.name)
    }
    async function At(e, t, n, o, r, i) {
        const s = {}
          , [a,c] = Mt();
        s[a] = c,
        e.log(Et.Trace, `(${t} transport) sending data. ${Rt(r, i.logMessageContent)}.`);
        const l = xt(r) ? "arraybuffer" : "text"
          , h = await n.post(o, {
            content: r,
            headers: {
                ...s,
                ...i.headers
            },
            responseType: l,
            timeout: i.timeout,
            withCredentials: i.withCredentials
        });
        e.log(Et.Trace, `(${t} transport) request complete. Response status: ${h.statusCode}.`)
    }
    class Pt {
        constructor(e, t) {
            this._subject = e,
            this._observer = t
        }
        dispose() {
            const e = this._subject.observers.indexOf(this._observer);
            e > -1 && this._subject.observers.splice(e, 1),
            0 === this._subject.observers.length && this._subject.cancelCallback && this._subject.cancelCallback().catch((e => {}
            ))
        }
    }
    class Nt {
        constructor(e) {
            this._minLevel = e,
            this.out = console
        }
        log(e, t) {
            if (e >= this._minLevel) {
                const n = `[${(new Date).toISOString()}] ${Et[e]}: ${t}`;
                switch (e) {
                case Et.Critical:
                case Et.Error:
                    this.out.error(n);
                    break;
                case Et.Warning:
                    this.out.warn(n);
                    break;
                case Et.Information:
                    this.out.info(n);
                    break;
                default:
                    this.out.log(n)
                }
            }
        }
    }
    function Mt() {
        return ["X-SignalR-User-Agent", Ut("9.0.0", "", "Browser", void 0)]
    }
    function Ut(e, t, n, o) {
        let r = "Microsoft SignalR/";
        const i = e.split(".");
        return r += `${i[0]}.${i[1]}`,
        r += ` (${e}; `,
        r += t && "" !== t ? `${t}; ` : "Unknown OS; ",
        r += `${n}`,
        r += o ? `; ${o}` : "; Unknown Runtime Version",
        r += ")",
        r
    }
    function Bt(e) {
        return e.stack ? e.stack : e.message ? e.message : `${e}`
    }
    class Lt extends St {
        constructor(e) {
            if (super(),
            this._logger = e,
            "undefined" == typeof fetch) {
                const e = "function" == typeof __webpack_require__ ? __non_webpack_require__ : require;
                this._jar = new (e("tough-cookie").CookieJar),
                "undefined" == typeof fetch ? this._fetchType = e("node-fetch") : this._fetchType = fetch,
                this._fetchType = e("fetch-cookie")(this._fetchType, this._jar)
            } else
                this._fetchType = fetch.bind(function() {
                    if ("undefined" != typeof globalThis)
                        return globalThis;
                    if ("undefined" != typeof self)
                        return self;
                    if ("undefined" != typeof window)
                        return window;
                    if ("undefined" != typeof global)
                        return global;
                    throw new Error("could not find global")
                }());
            if ("undefined" == typeof AbortController) {
                const e = "function" == typeof __webpack_require__ ? __non_webpack_require__ : require;
                this._abortControllerType = e("abort-controller")
            } else
                this._abortControllerType = AbortController
        }
        async send(e) {
            if (e.abortSignal && e.abortSignal.aborted)
                throw new gt;
            if (!e.method)
                throw new Error("No method defined.");
            if (!e.url)
                throw new Error("No url defined.");
            const t = new this._abortControllerType;
            let n;
            e.abortSignal && (e.abortSignal.onabort = () => {
                t.abort(),
                n = new gt
            }
            );
            let o, r = null;
            if (e.timeout) {
                const o = e.timeout;
                r = setTimeout(( () => {
                    t.abort(),
                    this._logger.log(Et.Warning, "Timeout from HTTP request."),
                    n = new ft
                }
                ), o)
            }
            "" === e.content && (e.content = void 0),
            e.content && (e.headers = e.headers || {},
            xt(e.content) ? e.headers["Content-Type"] = "application/octet-stream" : e.headers["Content-Type"] = "text/plain;charset=UTF-8");
            try {
                o = await this._fetchType(e.url, {
                    body: e.content,
                    cache: "no-cache",
                    credentials: !0 === e.withCredentials ? "include" : "same-origin",
                    headers: {
                        "X-Requested-With": "XMLHttpRequest",
                        ...e.headers
                    },
                    method: e.method,
                    mode: "cors",
                    redirect: "follow",
                    signal: t.signal
                })
            } catch (e) {
                if (n)
                    throw n;
                throw this._logger.log(Et.Warning, `Error from HTTP request. ${e}.`),
                e
            } finally {
                r && clearTimeout(r),
                e.abortSignal && (e.abortSignal.onabort = null)
            }
            if (!o.ok) {
                const e = await $t(o, "text");
                throw new pt(e || o.statusText,o.status)
            }
            const i = $t(o, e.responseType)
              , s = await i;
            return new bt(o.status,o.statusText,s)
        }
        getCookieString(e) {
            return ""
        }
    }
    function $t(e, t) {
        let n;
        switch (t) {
        case "arraybuffer":
            n = e.arrayBuffer();
            break;
        case "text":
        default:
            n = e.text();
            break;
        case "blob":
        case "document":
        case "json":
            throw new Error(`${t} is not supported.`)
        }
        return n
    }
    class Ot extends St {
        constructor(e) {
            super(),
            this._logger = e
        }
        send(e) {
            return e.abortSignal && e.abortSignal.aborted ? Promise.reject(new gt) : e.method ? e.url ? new Promise(( (t, n) => {
                const o = new XMLHttpRequest;
                o.open(e.method, e.url, !0),
                o.withCredentials = void 0 === e.withCredentials || e.withCredentials,
                o.setRequestHeader("X-Requested-With", "XMLHttpRequest"),
                "" === e.content && (e.content = void 0),
                e.content && (xt(e.content) ? o.setRequestHeader("Content-Type", "application/octet-stream") : o.setRequestHeader("Content-Type", "text/plain;charset=UTF-8"));
                const r = e.headers;
                r && Object.keys(r).forEach((e => {
                    o.setRequestHeader(e, r[e])
                }
                )),
                e.responseType && (o.responseType = e.responseType),
                e.abortSignal && (e.abortSignal.onabort = () => {
                    o.abort(),
                    n(new gt)
                }
                ),
                e.timeout && (o.timeout = e.timeout),
                o.onload = () => {
                    e.abortSignal && (e.abortSignal.onabort = null),
                    o.status >= 200 && o.status < 300 ? t(new bt(o.status,o.statusText,o.response || o.responseText)) : n(new pt(o.response || o.responseText || o.statusText,o.status))
                }
                ,
                o.onerror = () => {
                    this._logger.log(Et.Warning, `Error from HTTP request. ${o.status}: ${o.statusText}.`),
                    n(new pt(o.statusText,o.status))
                }
                ,
                o.ontimeout = () => {
                    this._logger.log(Et.Warning, "Timeout from HTTP request."),
                    n(new ft)
                }
                ,
                o.send(e.content)
            }
            )) : Promise.reject(new Error("No url defined.")) : Promise.reject(new Error("No method defined."))
        }
    }
    class Ft extends St {
        constructor(e) {
            if (super(),
            "undefined" != typeof fetch)
                this._httpClient = new Lt(e);
            else {
                if ("undefined" == typeof XMLHttpRequest)
                    throw new Error("No usable HttpClient found.");
                this._httpClient = new Ot(e)
            }
        }
        send(e) {
            return e.abortSignal && e.abortSignal.aborted ? Promise.reject(new gt) : e.method ? e.url ? this._httpClient.send(e) : Promise.reject(new Error("No url defined.")) : Promise.reject(new Error("No method defined."))
        }
        getCookieString(e) {
            return this._httpClient.getCookieString(e)
        }
    }
    class Ht {
        static write(e) {
            return `${e}${Ht.RecordSeparator}`
        }
        static parse(e) {
            if (e[e.length - 1] !== Ht.RecordSeparator)
                throw new Error("Message is incomplete.");
            const t = e.split(Ht.RecordSeparator);
            return t.pop(),
            t
        }
    }
    Ht.RecordSeparatorCode = 30,
    Ht.RecordSeparator = String.fromCharCode(Ht.RecordSeparatorCode);
    class jt {
        writeHandshakeRequest(e) {
            return Ht.write(JSON.stringify(e))
        }
        parseHandshakeResponse(e) {
            let t, n;
            if (xt(e)) {
                const o = new Uint8Array(e)
                  , r = o.indexOf(Ht.RecordSeparatorCode);
                if (-1 === r)
                    throw new Error("Message is incomplete.");
                const i = r + 1;
                t = String.fromCharCode.apply(null, Array.prototype.slice.call(o.slice(0, i))),
                n = o.byteLength > i ? o.slice(i).buffer : null
            } else {
                const o = e
                  , r = o.indexOf(Ht.RecordSeparator);
                if (-1 === r)
                    throw new Error("Message is incomplete.");
                const i = r + 1;
                t = o.substring(0, i),
                n = o.length > i ? o.substring(i) : null
            }
            const o = Ht.parse(t)
              , r = JSON.parse(o[0]);
            if (r.type)
                throw new Error("Expected a handshake response from the server.");
            return [n, r]
        }
    }
    !function(e) {
        e[e.Invocation = 1] = "Invocation",
        e[e.StreamItem = 2] = "StreamItem",
        e[e.Completion = 3] = "Completion",
        e[e.StreamInvocation = 4] = "StreamInvocation",
        e[e.CancelInvocation = 5] = "CancelInvocation",
        e[e.Ping = 6] = "Ping",
        e[e.Close = 7] = "Close",
        e[e.Ack = 8] = "Ack",
        e[e.Sequence = 9] = "Sequence"
    }(Ct || (Ct = {}));
    class Wt {
        constructor() {
            this.observers = []
        }
        next(e) {
            for (const t of this.observers)
                t.next(e)
        }
        error(e) {
            for (const t of this.observers)
                t.error && t.error(e)
        }
        complete() {
            for (const e of this.observers)
                e.complete && e.complete()
        }
        subscribe(e) {
            return this.observers.push(e),
            new Pt(this,e)
        }
    }
    class zt {
        constructor(e, t, n) {
            this._bufferSize = 1e5,
            this._messages = [],
            this._totalMessageCount = 0,
            this._waitForSequenceMessage = !1,
            this._nextReceivingSequenceId = 1,
            this._latestReceivedSequenceId = 0,
            this._bufferedByteCount = 0,
            this._reconnectInProgress = !1,
            this._protocol = e,
            this._connection = t,
            this._bufferSize = n
        }
        async _send(e) {
            const t = this._protocol.writeMessage(e);
            let n = Promise.resolve();
            if (this._isInvocationMessage(e)) {
                this._totalMessageCount++;
                let e = () => {}
                  , o = () => {}
                ;
                xt(t) ? this._bufferedByteCount += t.byteLength : this._bufferedByteCount += t.length,
                this._bufferedByteCount >= this._bufferSize && (n = new Promise(( (t, n) => {
                    e = t,
                    o = n
                }
                ))),
                this._messages.push(new qt(t,this._totalMessageCount,e,o))
            }
            try {
                this._reconnectInProgress || await this._connection.send(t)
            } catch {
                this._disconnected()
            }
            await n
        }
        _ack(e) {
            let t = -1;
            for (let n = 0; n < this._messages.length; n++) {
                const o = this._messages[n];
                if (o._id <= e.sequenceId)
                    t = n,
                    xt(o._message) ? this._bufferedByteCount -= o._message.byteLength : this._bufferedByteCount -= o._message.length,
                    o._resolver();
                else {
                    if (!(this._bufferedByteCount < this._bufferSize))
                        break;
                    o._resolver()
                }
            }
            -1 !== t && (this._messages = this._messages.slice(t + 1))
        }
        _shouldProcessMessage(e) {
            if (this._waitForSequenceMessage)
                return e.type === Ct.Sequence && (this._waitForSequenceMessage = !1,
                !0);
            if (!this._isInvocationMessage(e))
                return !0;
            const t = this._nextReceivingSequenceId;
            return this._nextReceivingSequenceId++,
            t <= this._latestReceivedSequenceId ? (t === this._latestReceivedSequenceId && this._ackTimer(),
            !1) : (this._latestReceivedSequenceId = t,
            this._ackTimer(),
            !0)
        }
        _resetSequence(e) {
            e.sequenceId > this._nextReceivingSequenceId ? this._connection.stop(new Error("Sequence ID greater than amount of messages we've received.")) : this._nextReceivingSequenceId = e.sequenceId
        }
        _disconnected() {
            this._reconnectInProgress = !0,
            this._waitForSequenceMessage = !0
        }
        async _resend() {
            const e = 0 !== this._messages.length ? this._messages[0]._id : this._totalMessageCount + 1;
            await this._connection.send(this._protocol.writeMessage({
                type: Ct.Sequence,
                sequenceId: e
            }));
            const t = this._messages;
            for (const e of t)
                await this._connection.send(e._message);
            this._reconnectInProgress = !1
        }
        _dispose(e) {
            null != e || (e = new Error("Unable to reconnect to server."));
            for (const t of this._messages)
                t._rejector(e)
        }
        _isInvocationMessage(e) {
            switch (e.type) {
            case Ct.Invocation:
            case Ct.StreamItem:
            case Ct.Completion:
            case Ct.StreamInvocation:
            case Ct.CancelInvocation:
                return !0;
            case Ct.Close:
            case Ct.Sequence:
            case Ct.Ping:
            case Ct.Ack:
                return !1
            }
        }
        _ackTimer() {
            void 0 === this._ackTimerHandle && (this._ackTimerHandle = setTimeout((async () => {
                try {
                    this._reconnectInProgress || await this._connection.send(this._protocol.writeMessage({
                        type: Ct.Ack,
                        sequenceId: this._latestReceivedSequenceId
                    }))
                } catch {}
                clearTimeout(this._ackTimerHandle),
                this._ackTimerHandle = void 0
            }
            ), 1e3))
        }
    }
    class qt {
        constructor(e, t, n, o) {
            this._message = e,
            this._id = t,
            this._resolver = n,
            this._rejector = o
        }
    }
    !function(e) {
        e.Disconnected = "Disconnected",
        e.Connecting = "Connecting",
        e.Connected = "Connected",
        e.Disconnecting = "Disconnecting",
        e.Reconnecting = "Reconnecting"
    }(It || (It = {}));
    class Jt {
        static create(e, t, n, o, r, i, s) {
            return new Jt(e,t,n,o,r,i,s)
        }
        constructor(e, t, n, o, r, i, s) {
            this._nextKeepAlive = 0,
            this._freezeEventListener = () => {
                this._logger.log(Et.Warning, "The page is being frozen, this will likely lead to the connection being closed and messages being lost. For more information see the docs at https://learn.microsoft.com/aspnet/core/signalr/javascript-client#bsleep")
            }
            ,
            Tt.isRequired(e, "connection"),
            Tt.isRequired(t, "logger"),
            Tt.isRequired(n, "protocol"),
            this.serverTimeoutInMilliseconds = null != r ? r : 3e4,
            this.keepAliveIntervalInMilliseconds = null != i ? i : 15e3,
            this._statefulReconnectBufferSize = null != s ? s : 1e5,
            this._logger = t,
            this._protocol = n,
            this.connection = e,
            this._reconnectPolicy = o,
            this._handshakeProtocol = new jt,
            this.connection.onreceive = e => this._processIncomingData(e),
            this.connection.onclose = e => this._connectionClosed(e),
            this._callbacks = {},
            this._methods = {},
            this._closedCallbacks = [],
            this._reconnectingCallbacks = [],
            this._reconnectedCallbacks = [],
            this._invocationId = 0,
            this._receivedHandshakeResponse = !1,
            this._connectionState = It.Disconnected,
            this._connectionStarted = !1,
            this._cachedPingMessage = this._protocol.writeMessage({
                type: Ct.Ping
            })
        }
        get state() {
            return this._connectionState
        }
        get connectionId() {
            return this.connection && this.connection.connectionId || null
        }
        get baseUrl() {
            return this.connection.baseUrl || ""
        }
        set baseUrl(e) {
            if (this._connectionState !== It.Disconnected && this._connectionState !== It.Reconnecting)
                throw new Error("The HubConnection must be in the Disconnected or Reconnecting state to change the url.");
            if (!e)
                throw new Error("The HubConnection url must be a valid url.");
            this.connection.baseUrl = e
        }
        start() {
            return this._startPromise = this._startWithStateTransitions(),
            this._startPromise
        }
        async _startWithStateTransitions() {
            if (this._connectionState !== It.Disconnected)
                return Promise.reject(new Error("Cannot start a HubConnection that is not in the 'Disconnected' state."));
            this._connectionState = It.Connecting,
            this._logger.log(Et.Debug, "Starting HubConnection.");
            try {
                await this._startInternal(),
                Dt.isBrowser && window.document.addEventListener("freeze", this._freezeEventListener),
                this._connectionState = It.Connected,
                this._connectionStarted = !0,
                this._logger.log(Et.Debug, "HubConnection connected successfully.")
            } catch (e) {
                return this._connectionState = It.Disconnected,
                this._logger.log(Et.Debug, `HubConnection failed to start successfully because of error '${e}'.`),
                Promise.reject(e)
            }
        }
        async _startInternal() {
            this._stopDuringStartError = void 0,
            this._receivedHandshakeResponse = !1;
            const e = new Promise(( (e, t) => {
                this._handshakeResolver = e,
                this._handshakeRejecter = t
            }
            ));
            await this.connection.start(this._protocol.transferFormat);
            try {
                let t = this._protocol.version;
                this.connection.features.reconnect || (t = 1);
                const n = {
                    protocol: this._protocol.name,
                    version: t
                };
                if (this._logger.log(Et.Debug, "Sending handshake request."),
                await this._sendMessage(this._handshakeProtocol.writeHandshakeRequest(n)),
                this._logger.log(Et.Information, `Using HubProtocol '${this._protocol.name}'.`),
                this._cleanupTimeout(),
                this._resetTimeoutPeriod(),
                this._resetKeepAliveInterval(),
                await e,
                this._stopDuringStartError)
                    throw this._stopDuringStartError;
                !!this.connection.features.reconnect && (this._messageBuffer = new zt(this._protocol,this.connection,this._statefulReconnectBufferSize),
                this.connection.features.disconnected = this._messageBuffer._disconnected.bind(this._messageBuffer),
                this.connection.features.resend = () => {
                    if (this._messageBuffer)
                        return this._messageBuffer._resend()
                }
                ),
                this.connection.features.inherentKeepAlive || await this._sendMessage(this._cachedPingMessage)
            } catch (e) {
                throw this._logger.log(Et.Debug, `Hub handshake failed with error '${e}' during start(). Stopping HubConnection.`),
                this._cleanupTimeout(),
                this._cleanupPingTimer(),
                await this.connection.stop(e),
                e
            }
        }
        async stop() {
            const e = this._startPromise;
            this.connection.features.reconnect = !1,
            this._stopPromise = this._stopInternal(),
            await this._stopPromise;
            try {
                await e
            } catch (e) {}
        }
        _stopInternal(e) {
            if (this._connectionState === It.Disconnected)
                return this._logger.log(Et.Debug, `Call to HubConnection.stop(${e}) ignored because it is already in the disconnected state.`),
                Promise.resolve();
            if (this._connectionState === It.Disconnecting)
                return this._logger.log(Et.Debug, `Call to HttpConnection.stop(${e}) ignored because the connection is already in the disconnecting state.`),
                this._stopPromise;
            const t = this._connectionState;
            return this._connectionState = It.Disconnecting,
            this._logger.log(Et.Debug, "Stopping HubConnection."),
            this._reconnectDelayHandle ? (this._logger.log(Et.Debug, "Connection stopped during reconnect delay. Done reconnecting."),
            clearTimeout(this._reconnectDelayHandle),
            this._reconnectDelayHandle = void 0,
            this._completeClose(),
            Promise.resolve()) : (t === It.Connected && this._sendCloseMessage(),
            this._cleanupTimeout(),
            this._cleanupPingTimer(),
            this._stopDuringStartError = e || new gt("The connection was stopped before the hub handshake could complete."),
            this.connection.stop(e))
        }
        async _sendCloseMessage() {
            try {
                await this._sendWithProtocol(this._createCloseMessage())
            } catch {}
        }
        stream(e, ...t) {
            const [n,o] = this._replaceStreamingParams(t)
              , r = this._createStreamInvocation(e, t, o);
            let i;
            const s = new Wt;
            return s.cancelCallback = () => {
                const e = this._createCancelInvocation(r.invocationId);
                return delete this._callbacks[r.invocationId],
                i.then(( () => this._sendWithProtocol(e)))
            }
            ,
            this._callbacks[r.invocationId] = (e, t) => {
                t ? s.error(t) : e && (e.type === Ct.Completion ? e.error ? s.error(new Error(e.error)) : s.complete() : s.next(e.item))
            }
            ,
            i = this._sendWithProtocol(r).catch((e => {
                s.error(e),
                delete this._callbacks[r.invocationId]
            }
            )),
            this._launchStreams(n, i),
            s
        }
        _sendMessage(e) {
            return this._resetKeepAliveInterval(),
            this.connection.send(e)
        }
        _sendWithProtocol(e) {
            return this._messageBuffer ? this._messageBuffer._send(e) : this._sendMessage(this._protocol.writeMessage(e))
        }
        send(e, ...t) {
            const [n,o] = this._replaceStreamingParams(t)
              , r = this._sendWithProtocol(this._createInvocation(e, t, !0, o));
            return this._launchStreams(n, r),
            r
        }
        invoke(e, ...t) {
            const [n,o] = this._replaceStreamingParams(t)
              , r = this._createInvocation(e, t, !1, o);
            return new Promise(( (e, t) => {
                this._callbacks[r.invocationId] = (n, o) => {
                    o ? t(o) : n && (n.type === Ct.Completion ? n.error ? t(new Error(n.error)) : e(n.result) : t(new Error(`Unexpected message type: ${n.type}`)))
                }
                ;
                const o = this._sendWithProtocol(r).catch((e => {
                    t(e),
                    delete this._callbacks[r.invocationId]
                }
                ));
                this._launchStreams(n, o)
            }
            ))
        }
        on(e, t) {
            e && t && (e = e.toLowerCase(),
            this._methods[e] || (this._methods[e] = []),
            -1 === this._methods[e].indexOf(t) && this._methods[e].push(t))
        }
        off(e, t) {
            if (!e)
                return;
            e = e.toLowerCase();
            const n = this._methods[e];
            if (n)
                if (t) {
                    const o = n.indexOf(t);
                    -1 !== o && (n.splice(o, 1),
                    0 === n.length && delete this._methods[e])
                } else
                    delete this._methods[e]
        }
        onclose(e) {
            e && this._closedCallbacks.push(e)
        }
        onreconnecting(e) {
            e && this._reconnectingCallbacks.push(e)
        }
        onreconnected(e) {
            e && this._reconnectedCallbacks.push(e)
        }
        _processIncomingData(e) {
            if (this._cleanupTimeout(),
            this._receivedHandshakeResponse || (e = this._processHandshakeResponse(e),
            this._receivedHandshakeResponse = !0),
            e) {
                const t = this._protocol.parseMessages(e, this._logger);
                for (const e of t)
                    if (!this._messageBuffer || this._messageBuffer._shouldProcessMessage(e))
                        switch (e.type) {
                        case Ct.Invocation:
                            this._invokeClientMethod(e).catch((e => {
                                this._logger.log(Et.Error, `Invoke client method threw error: ${Bt(e)}`)
                            }
                            ));
                            break;
                        case Ct.StreamItem:
                        case Ct.Completion:
                            {
                                const t = this._callbacks[e.invocationId];
                                if (t) {
                                    e.type === Ct.Completion && delete this._callbacks[e.invocationId];
                                    try {
                                        t(e)
                                    } catch (e) {
                                        this._logger.log(Et.Error, `Stream callback threw error: ${Bt(e)}`)
                                    }
                                }
                                break
                            }
                        case Ct.Ping:
                            break;
                        case Ct.Close:
                            {
                                this._logger.log(Et.Information, "Close message received from server.");
                                const t = e.error ? new Error("Server returned an error on close: " + e.error) : void 0;
                                !0 === e.allowReconnect ? this.connection.stop(t) : this._stopPromise = this._stopInternal(t);
                                break
                            }
                        case Ct.Ack:
                            this._messageBuffer && this._messageBuffer._ack(e);
                            break;
                        case Ct.Sequence:
                            this._messageBuffer && this._messageBuffer._resetSequence(e);
                            break;
                        default:
                            this._logger.log(Et.Warning, `Invalid message type: ${e.type}.`)
                        }
            }
            this._resetTimeoutPeriod()
        }
        _processHandshakeResponse(e) {
            let t, n;
            try {
                [n,t] = this._handshakeProtocol.parseHandshakeResponse(e)
            } catch (e) {
                const t = "Error parsing handshake response: " + e;
                this._logger.log(Et.Error, t);
                const n = new Error(t);
                throw this._handshakeRejecter(n),
                n
            }
            if (t.error) {
                const e = "Server returned handshake error: " + t.error;
                this._logger.log(Et.Error, e);
                const n = new Error(e);
                throw this._handshakeRejecter(n),
                n
            }
            return this._logger.log(Et.Debug, "Server handshake complete."),
            this._handshakeResolver(),
            n
        }
        _resetKeepAliveInterval() {
            this.connection.features.inherentKeepAlive || (this._nextKeepAlive = (new Date).getTime() + this.keepAliveIntervalInMilliseconds,
            this._cleanupPingTimer())
        }
        _resetTimeoutPeriod() {
            if (!(this.connection.features && this.connection.features.inherentKeepAlive || (this._timeoutHandle = setTimeout(( () => this.serverTimeout()), this.serverTimeoutInMilliseconds),
            void 0 !== this._pingServerHandle))) {
                let e = this._nextKeepAlive - (new Date).getTime();
                e < 0 && (e = 0),
                this._pingServerHandle = setTimeout((async () => {
                    if (this._connectionState === It.Connected)
                        try {
                            await this._sendMessage(this._cachedPingMessage)
                        } catch {
                            this._cleanupPingTimer()
                        }
                }
                ), e)
            }
        }
        serverTimeout() {
            this.connection.stop(new Error("Server timeout elapsed without receiving a message from the server."))
        }
        async _invokeClientMethod(e) {
            const t = e.target.toLowerCase()
              , n = this._methods[t];
            if (!n)
                return this._logger.log(Et.Warning, `No client method with the name '${t}' found.`),
                void (e.invocationId && (this._logger.log(Et.Warning, `No result given for '${t}' method and invocation ID '${e.invocationId}'.`),
                await this._sendWithProtocol(this._createCompletionMessage(e.invocationId, "Client didn't provide a result.", null))));
            const o = n.slice()
              , r = !!e.invocationId;
            let i, s, a;
            for (const n of o)
                try {
                    const o = i;
                    i = await n.apply(this, e.arguments),
                    r && i && o && (this._logger.log(Et.Error, `Multiple results provided for '${t}'. Sending error to server.`),
                    a = this._createCompletionMessage(e.invocationId, "Client provided multiple results.", null)),
                    s = void 0
                } catch (e) {
                    s = e,
                    this._logger.log(Et.Error, `A callback for the method '${t}' threw error '${e}'.`)
                }
            a ? await this._sendWithProtocol(a) : r ? (s ? a = this._createCompletionMessage(e.invocationId, `${s}`, null) : void 0 !== i ? a = this._createCompletionMessage(e.invocationId, null, i) : (this._logger.log(Et.Warning, `No result given for '${t}' method and invocation ID '${e.invocationId}'.`),
            a = this._createCompletionMessage(e.invocationId, "Client didn't provide a result.", null)),
            await this._sendWithProtocol(a)) : i && this._logger.log(Et.Error, `Result given for '${t}' method but server is not expecting a result.`)
        }
        _connectionClosed(e) {
            this._logger.log(Et.Debug, `HubConnection.connectionClosed(${e}) called while in state ${this._connectionState}.`),
            this._stopDuringStartError = this._stopDuringStartError || e || new gt("The underlying connection was closed before the hub handshake could complete."),
            this._handshakeResolver && this._handshakeResolver(),
            this._cancelCallbacksWithError(e || new Error("Invocation canceled due to the underlying connection being closed.")),
            this._cleanupTimeout(),
            this._cleanupPingTimer(),
            this._connectionState === It.Disconnecting ? this._completeClose(e) : this._connectionState === It.Connected && this._reconnectPolicy ? this._reconnect(e) : this._connectionState === It.Connected && this._completeClose(e)
        }
        _completeClose(e) {
            if (this._connectionStarted) {
                this._connectionState = It.Disconnected,
                this._connectionStarted = !1,
                this._messageBuffer && (this._messageBuffer._dispose(null != e ? e : new Error("Connection closed.")),
                this._messageBuffer = void 0),
                Dt.isBrowser && window.document.removeEventListener("freeze", this._freezeEventListener);
                try {
                    this._closedCallbacks.forEach((t => t.apply(this, [e])))
                } catch (t) {
                    this._logger.log(Et.Error, `An onclose callback called with error '${e}' threw error '${t}'.`)
                }
            }
        }
        async _reconnect(e) {
            const t = Date.now();
            let n = 0
              , o = void 0 !== e ? e : new Error("Attempting to reconnect due to a unknown error.")
              , r = this._getNextRetryDelay(n++, 0, o);
            if (null === r)
                return this._logger.log(Et.Debug, "Connection not reconnecting because the IRetryPolicy returned null on the first reconnect attempt."),
                void this._completeClose(e);
            if (this._connectionState = It.Reconnecting,
            e ? this._logger.log(Et.Information, `Connection reconnecting because of error '${e}'.`) : this._logger.log(Et.Information, "Connection reconnecting."),
            0 !== this._reconnectingCallbacks.length) {
                try {
                    this._reconnectingCallbacks.forEach((t => t.apply(this, [e])))
                } catch (t) {
                    this._logger.log(Et.Error, `An onreconnecting callback called with error '${e}' threw error '${t}'.`)
                }
                if (this._connectionState !== It.Reconnecting)
                    return void this._logger.log(Et.Debug, "Connection left the reconnecting state in onreconnecting callback. Done reconnecting.")
            }
            for (; null !== r; ) {
                if (this._logger.log(Et.Information, `Reconnect attempt number ${n} will start in ${r} ms.`),
                await new Promise((e => {
                    this._reconnectDelayHandle = setTimeout(e, r)
                }
                )),
                this._reconnectDelayHandle = void 0,
                this._connectionState !== It.Reconnecting)
                    return void this._logger.log(Et.Debug, "Connection left the reconnecting state during reconnect delay. Done reconnecting.");
                try {
                    if (await this._startInternal(),
                    this._connectionState = It.Connected,
                    this._logger.log(Et.Information, "HubConnection reconnected successfully."),
                    0 !== this._reconnectedCallbacks.length)
                        try {
                            this._reconnectedCallbacks.forEach((e => e.apply(this, [this.connection.connectionId])))
                        } catch (e) {
                            this._logger.log(Et.Error, `An onreconnected callback called with connectionId '${this.connection.connectionId}; threw error '${e}'.`)
                        }
                    return
                } catch (e) {
                    if (this._logger.log(Et.Information, `Reconnect attempt failed because of error '${e}'.`),
                    this._connectionState !== It.Reconnecting)
                        return this._logger.log(Et.Debug, `Connection moved to the '${this._connectionState}' from the reconnecting state during reconnect attempt. Done reconnecting.`),
                        void (this._connectionState === It.Disconnecting && this._completeClose());
                    o = e instanceof Error ? e : new Error(e.toString()),
                    r = this._getNextRetryDelay(n++, Date.now() - t, o)
                }
            }
            this._logger.log(Et.Information, `Reconnect retries have been exhausted after ${Date.now() - t} ms and ${n} failed attempts. Connection disconnecting.`),
            this._completeClose()
        }
        _getNextRetryDelay(e, t, n) {
            try {
                return this._reconnectPolicy.nextRetryDelayInMilliseconds({
                    elapsedMilliseconds: t,
                    previousRetryCount: e,
                    retryReason: n
                })
            } catch (n) {
                return this._logger.log(Et.Error, `IRetryPolicy.nextRetryDelayInMilliseconds(${e}, ${t}) threw error '${n}'.`),
                null
            }
        }
        _cancelCallbacksWithError(e) {
            const t = this._callbacks;
            this._callbacks = {},
            Object.keys(t).forEach((n => {
                const o = t[n];
                try {
                    o(null, e)
                } catch (t) {
                    this._logger.log(Et.Error, `Stream 'error' callback called with '${e}' threw error: ${Bt(t)}`)
                }
            }
            ))
        }
        _cleanupPingTimer() {
            this._pingServerHandle && (clearTimeout(this._pingServerHandle),
            this._pingServerHandle = void 0)
        }
        _cleanupTimeout() {
            this._timeoutHandle && clearTimeout(this._timeoutHandle)
        }
        _createInvocation(e, t, n, o) {
            if (n)
                return 0 !== o.length ? {
                    target: e,
                    arguments: t,
                    streamIds: o,
                    type: Ct.Invocation
                } : {
                    target: e,
                    arguments: t,
                    type: Ct.Invocation
                };
            {
                const n = this._invocationId;
                return this._invocationId++,
                0 !== o.length ? {
                    target: e,
                    arguments: t,
                    invocationId: n.toString(),
                    streamIds: o,
                    type: Ct.Invocation
                } : {
                    target: e,
                    arguments: t,
                    invocationId: n.toString(),
                    type: Ct.Invocation
                }
            }
        }
        _launchStreams(e, t) {
            if (0 !== e.length) {
                t || (t = Promise.resolve());
                for (const n in e)
                    e[n].subscribe({
                        complete: () => {
                            t = t.then(( () => this._sendWithProtocol(this._createCompletionMessage(n))))
                        }
                        ,
                        error: e => {
                            let o;
                            o = e instanceof Error ? e.message : e && e.toString ? e.toString() : "Unknown error",
                            t = t.then(( () => this._sendWithProtocol(this._createCompletionMessage(n, o))))
                        }
                        ,
                        next: e => {
                            t = t.then(( () => this._sendWithProtocol(this._createStreamItemMessage(n, e))))
                        }
                    })
            }
        }
        _replaceStreamingParams(e) {
            const t = []
              , n = [];
            for (let o = 0; o < e.length; o++) {
                const r = e[o];
                if (this._isObservable(r)) {
                    const i = this._invocationId;
                    this._invocationId++,
                    t[i] = r,
                    n.push(i.toString()),
                    e.splice(o, 1)
                }
            }
            return [t, n]
        }
        _isObservable(e) {
            return e && e.subscribe && "function" == typeof e.subscribe
        }
        _createStreamInvocation(e, t, n) {
            const o = this._invocationId;
            return this._invocationId++,
            0 !== n.length ? {
                target: e,
                arguments: t,
                invocationId: o.toString(),
                streamIds: n,
                type: Ct.StreamInvocation
            } : {
                target: e,
                arguments: t,
                invocationId: o.toString(),
                type: Ct.StreamInvocation
            }
        }
        _createCancelInvocation(e) {
            return {
                invocationId: e,
                type: Ct.CancelInvocation
            }
        }
        _createStreamItemMessage(e, t) {
            return {
                invocationId: e,
                item: t,
                type: Ct.StreamItem
            }
        }
        _createCompletionMessage(e, t, n) {
            return t ? {
                error: t,
                invocationId: e,
                type: Ct.Completion
            } : {
                invocationId: e,
                result: n,
                type: Ct.Completion
            }
        }
        _createCloseMessage() {
            return {
                type: Ct.Close
            }
        }
    }
    const Vt = [0, 2e3, 1e4, 3e4, null];
    class Kt {
        constructor(e) {
            this._retryDelays = void 0 !== e ? [...e, null] : Vt
        }
        nextRetryDelayInMilliseconds(e) {
            return this._retryDelays[e.previousRetryCount]
        }
    }
    class Xt {
    }
    Xt.Authorization = "Authorization",
    Xt.Cookie = "Cookie";
    class Yt extends St {
        constructor(e, t) {
            super(),
            this._innerClient = e,
            this._accessTokenFactory = t
        }
        async send(e) {
            let t = !0;
            this._accessTokenFactory && (!this._accessToken || e.url && e.url.indexOf("/negotiate?") > 0) && (t = !1,
            this._accessToken = await this._accessTokenFactory()),
            this._setAuthorizationHeader(e);
            const n = await this._innerClient.send(e);
            return t && 401 === n.statusCode && this._accessTokenFactory ? (this._accessToken = await this._accessTokenFactory(),
            this._setAuthorizationHeader(e),
            await this._innerClient.send(e)) : n
        }
        _setAuthorizationHeader(e) {
            e.headers || (e.headers = {}),
            this._accessToken ? e.headers[Xt.Authorization] = `Bearer ${this._accessToken}` : this._accessTokenFactory && e.headers[Xt.Authorization] && delete e.headers[Xt.Authorization]
        }
        getCookieString(e) {
            return this._innerClient.getCookieString(e)
        }
    }
    var Gt, Qt;
    !function(e) {
        e[e.None = 0] = "None",
        e[e.WebSockets = 1] = "WebSockets",
        e[e.ServerSentEvents = 2] = "ServerSentEvents",
        e[e.LongPolling = 4] = "LongPolling"
    }(Gt || (Gt = {})),
    function(e) {
        e[e.Text = 1] = "Text",
        e[e.Binary = 2] = "Binary"
    }(Qt || (Qt = {}));
    let Zt = class {
        constructor() {
            this._isAborted = !1,
            this.onabort = null
        }
        abort() {
            this._isAborted || (this._isAborted = !0,
            this.onabort && this.onabort())
        }
        get signal() {
            return this
        }
        get aborted() {
            return this._isAborted
        }
    }
    ;
    class en {
        get pollAborted() {
            return this._pollAbort.aborted
        }
        constructor(e, t, n) {
            this._httpClient = e,
            this._logger = t,
            this._pollAbort = new Zt,
            this._options = n,
            this._running = !1,
            this.onreceive = null,
            this.onclose = null
        }
        async connect(e, t) {
            if (Tt.isRequired(e, "url"),
            Tt.isRequired(t, "transferFormat"),
            Tt.isIn(t, Qt, "transferFormat"),
            this._url = e,
            this._logger.log(Et.Trace, "(LongPolling transport) Connecting."),
            t === Qt.Binary && "undefined" != typeof XMLHttpRequest && "string" != typeof (new XMLHttpRequest).responseType)
                throw new Error("Binary protocols over XmlHttpRequest not implementing advanced features are not supported.");
            const [n,o] = Mt()
              , r = {
                [n]: o,
                ...this._options.headers
            }
              , i = {
                abortSignal: this._pollAbort.signal,
                headers: r,
                timeout: 1e5,
                withCredentials: this._options.withCredentials
            };
            t === Qt.Binary && (i.responseType = "arraybuffer");
            const s = `${e}&_=${Date.now()}`;
            this._logger.log(Et.Trace, `(LongPolling transport) polling: ${s}.`);
            const a = await this._httpClient.get(s, i);
            200 !== a.statusCode ? (this._logger.log(Et.Error, `(LongPolling transport) Unexpected response code: ${a.statusCode}.`),
            this._closeError = new pt(a.statusText || "",a.statusCode),
            this._running = !1) : this._running = !0,
            this._receiving = this._poll(this._url, i)
        }
        async _poll(e, t) {
            try {
                for (; this._running; )
                    try {
                        const n = `${e}&_=${Date.now()}`;
                        this._logger.log(Et.Trace, `(LongPolling transport) polling: ${n}.`);
                        const o = await this._httpClient.get(n, t);
                        204 === o.statusCode ? (this._logger.log(Et.Information, "(LongPolling transport) Poll terminated by server."),
                        this._running = !1) : 200 !== o.statusCode ? (this._logger.log(Et.Error, `(LongPolling transport) Unexpected response code: ${o.statusCode}.`),
                        this._closeError = new pt(o.statusText || "",o.statusCode),
                        this._running = !1) : o.content ? (this._logger.log(Et.Trace, `(LongPolling transport) data received. ${Rt(o.content, this._options.logMessageContent)}.`),
                        this.onreceive && this.onreceive(o.content)) : this._logger.log(Et.Trace, "(LongPolling transport) Poll timed out, reissuing.")
                    } catch (e) {
                        this._running ? e instanceof ft ? this._logger.log(Et.Trace, "(LongPolling transport) Poll timed out, reissuing.") : (this._closeError = e,
                        this._running = !1) : this._logger.log(Et.Trace, `(LongPolling transport) Poll errored after shutdown: ${e.message}`)
                    }
            } finally {
                this._logger.log(Et.Trace, "(LongPolling transport) Polling complete."),
                this.pollAborted || this._raiseOnClose()
            }
        }
        async send(e) {
            return this._running ? At(this._logger, "LongPolling", this._httpClient, this._url, e, this._options) : Promise.reject(new Error("Cannot send until the transport is connected"))
        }
        async stop() {
            this._logger.log(Et.Trace, "(LongPolling transport) Stopping polling."),
            this._running = !1,
            this._pollAbort.abort();
            try {
                await this._receiving,
                this._logger.log(Et.Trace, `(LongPolling transport) sending DELETE request to ${this._url}.`);
                const e = {}
                  , [t,n] = Mt();
                e[t] = n;
                const o = {
                    headers: {
                        ...e,
                        ...this._options.headers
                    },
                    timeout: this._options.timeout,
                    withCredentials: this._options.withCredentials
                };
                let r;
                try {
                    await this._httpClient.delete(this._url, o)
                } catch (e) {
                    r = e
                }
                r ? r instanceof pt && (404 === r.statusCode ? this._logger.log(Et.Trace, "(LongPolling transport) A 404 response was returned from sending a DELETE request.") : this._logger.log(Et.Trace, `(LongPolling transport) Error sending a DELETE request: ${r}`)) : this._logger.log(Et.Trace, "(LongPolling transport) DELETE request accepted.")
            } finally {
                this._logger.log(Et.Trace, "(LongPolling transport) Stop finished."),
                this._raiseOnClose()
            }
        }
        _raiseOnClose() {
            if (this.onclose) {
                let e = "(LongPolling transport) Firing onclose event.";
                this._closeError && (e += " Error: " + this._closeError),
                this._logger.log(Et.Trace, e),
                this.onclose(this._closeError)
            }
        }
    }
    class tn {
        constructor(e, t, n, o) {
            this._httpClient = e,
            this._accessToken = t,
            this._logger = n,
            this._options = o,
            this.onreceive = null,
            this.onclose = null
        }
        async connect(e, t) {
            return Tt.isRequired(e, "url"),
            Tt.isRequired(t, "transferFormat"),
            Tt.isIn(t, Qt, "transferFormat"),
            this._logger.log(Et.Trace, "(SSE transport) Connecting."),
            this._url = e,
            this._accessToken && (e += (e.indexOf("?") < 0 ? "?" : "&") + `access_token=${encodeURIComponent(this._accessToken)}`),
            new Promise(( (n, o) => {
                let r, i = !1;
                if (t === Qt.Text) {
                    if (Dt.isBrowser || Dt.isWebWorker)
                        r = new this._options.EventSource(e,{
                            withCredentials: this._options.withCredentials
                        });
                    else {
                        const t = this._httpClient.getCookieString(e)
                          , n = {};
                        n.Cookie = t;
                        const [o,i] = Mt();
                        n[o] = i,
                        r = new this._options.EventSource(e,{
                            withCredentials: this._options.withCredentials,
                            headers: {
                                ...n,
                                ...this._options.headers
                            }
                        })
                    }
                    try {
                        r.onmessage = e => {
                            if (this.onreceive)
                                try {
                                    this._logger.log(Et.Trace, `(SSE transport) data received. ${Rt(e.data, this._options.logMessageContent)}.`),
                                    this.onreceive(e.data)
                                } catch (e) {
                                    return void this._close(e)
                                }
                        }
                        ,
                        r.onerror = e => {
                            i ? this._close() : o(new Error("EventSource failed to connect. The connection could not be found on the server, either the connection ID is not present on the server, or a proxy is refusing/buffering the connection. If you have multiple servers check that sticky sessions are enabled."))
                        }
                        ,
                        r.onopen = () => {
                            this._logger.log(Et.Information, `SSE connected to ${this._url}`),
                            this._eventSource = r,
                            i = !0,
                            n()
                        }
                    } catch (e) {
                        return void o(e)
                    }
                } else
                    o(new Error("The Server-Sent Events transport only supports the 'Text' transfer format"))
            }
            ))
        }
        async send(e) {
            return this._eventSource ? At(this._logger, "SSE", this._httpClient, this._url, e, this._options) : Promise.reject(new Error("Cannot send until the transport is connected"))
        }
        stop() {
            return this._close(),
            Promise.resolve()
        }
        _close(e) {
            this._eventSource && (this._eventSource.close(),
            this._eventSource = void 0,
            this.onclose && this.onclose(e))
        }
    }
    class nn {
        constructor(e, t, n, o, r, i) {
            this._logger = n,
            this._accessTokenFactory = t,
            this._logMessageContent = o,
            this._webSocketConstructor = r,
            this._httpClient = e,
            this.onreceive = null,
            this.onclose = null,
            this._headers = i
        }
        async connect(e, t) {
            let n;
            return Tt.isRequired(e, "url"),
            Tt.isRequired(t, "transferFormat"),
            Tt.isIn(t, Qt, "transferFormat"),
            this._logger.log(Et.Trace, "(WebSockets transport) Connecting."),
            this._accessTokenFactory && (n = await this._accessTokenFactory()),
            new Promise(( (o, r) => {
                let i;
                e = e.replace(/^http/, "ws");
                const s = this._httpClient.getCookieString(e);
                let a = !1;
                if (Dt.isReactNative) {
                    const t = {}
                      , [o,r] = Mt();
                    t[o] = r,
                    n && (t[Xt.Authorization] = `Bearer ${n}`),
                    s && (t[Xt.Cookie] = s),
                    i = new this._webSocketConstructor(e,void 0,{
                        headers: {
                            ...t,
                            ...this._headers
                        }
                    })
                } else
                    n && (e += (e.indexOf("?") < 0 ? "?" : "&") + `access_token=${encodeURIComponent(n)}`);
                i || (i = new this._webSocketConstructor(e)),
                t === Qt.Binary && (i.binaryType = "arraybuffer"),
                i.onopen = t => {
                    this._logger.log(Et.Information, `WebSocket connected to ${e}.`),
                    this._webSocket = i,
                    a = !0,
                    o()
                }
                ,
                i.onerror = e => {
                    let t = null;
                    t = "undefined" != typeof ErrorEvent && e instanceof ErrorEvent ? e.error : "There was an error with the transport",
                    this._logger.log(Et.Information, `(WebSockets transport) ${t}.`)
                }
                ,
                i.onmessage = e => {
                    if (this._logger.log(Et.Trace, `(WebSockets transport) data received. ${Rt(e.data, this._logMessageContent)}.`),
                    this.onreceive)
                        try {
                            this.onreceive(e.data)
                        } catch (e) {
                            return void this._close(e)
                        }
                }
                ,
                i.onclose = e => {
                    if (a)
                        this._close(e);
                    else {
                        let t = null;
                        t = "undefined" != typeof ErrorEvent && e instanceof ErrorEvent ? e.error : "WebSocket failed to connect. The connection could not be found on the server, either the endpoint may not be a SignalR endpoint, the connection ID is not present on the server, or there is a proxy blocking WebSockets. If you have multiple servers check that sticky sessions are enabled.",
                        r(new Error(t))
                    }
                }
            }
            ))
        }
        send(e) {
            return this._webSocket && this._webSocket.readyState === this._webSocketConstructor.OPEN ? (this._logger.log(Et.Trace, `(WebSockets transport) sending data. ${Rt(e, this._logMessageContent)}.`),
            this._webSocket.send(e),
            Promise.resolve()) : Promise.reject("WebSocket is not in the OPEN state")
        }
        stop() {
            return this._webSocket && this._close(void 0),
            Promise.resolve()
        }
        _close(e) {
            this._webSocket && (this._webSocket.onclose = () => {}
            ,
            this._webSocket.onmessage = () => {}
            ,
            this._webSocket.onerror = () => {}
            ,
            this._webSocket.close(),
            this._webSocket = void 0),
            this._logger.log(Et.Trace, "(WebSockets transport) socket closed."),
            this.onclose && (!this._isCloseEvent(e) || !1 !== e.wasClean && 1e3 === e.code ? e instanceof Error ? this.onclose(e) : this.onclose() : this.onclose(new Error(`WebSocket closed with status code: ${e.code} (${e.reason || "no reason given"}).`)))
        }
        _isCloseEvent(e) {
            return e && "boolean" == typeof e.wasClean && "number" == typeof e.code
        }
    }
    class on {
        constructor(e, t={}) {
            if (this._stopPromiseResolver = () => {}
            ,
            this.features = {},
            this._negotiateVersion = 1,
            Tt.isRequired(e, "url"),
            this._logger = function(e) {
                return void 0 === e ? new Nt(Et.Information) : null === e ? kt.instance : void 0 !== e.log ? e : new Nt(e)
            }(t.logger),
            this.baseUrl = this._resolveUrl(e),
            (t = t || {}).logMessageContent = void 0 !== t.logMessageContent && t.logMessageContent,
            "boolean" != typeof t.withCredentials && void 0 !== t.withCredentials)
                throw new Error("withCredentials option was not a 'boolean' or 'undefined' value");
            t.withCredentials = void 0 === t.withCredentials || t.withCredentials,
            t.timeout = void 0 === t.timeout ? 1e5 : t.timeout,
            "undefined" == typeof WebSocket || t.WebSocket || (t.WebSocket = WebSocket),
            "undefined" == typeof EventSource || t.EventSource || (t.EventSource = EventSource),
            this._httpClient = new Yt(t.httpClient || new Ft(this._logger),t.accessTokenFactory),
            this._connectionState = "Disconnected",
            this._connectionStarted = !1,
            this._options = t,
            this.onreceive = null,
            this.onclose = null
        }
        async start(e) {
            if (e = e || Qt.Binary,
            Tt.isIn(e, Qt, "transferFormat"),
            this._logger.log(Et.Debug, `Starting connection with transfer format '${Qt[e]}'.`),
            "Disconnected" !== this._connectionState)
                return Promise.reject(new Error("Cannot start an HttpConnection that is not in the 'Disconnected' state."));
            if (this._connectionState = "Connecting",
            this._startInternalPromise = this._startInternal(e),
            await this._startInternalPromise,
            "Disconnecting" === this._connectionState) {
                const e = "Failed to start the HttpConnection before stop() was called.";
                return this._logger.log(Et.Error, e),
                await this._stopPromise,
                Promise.reject(new gt(e))
            }
            if ("Connected" !== this._connectionState) {
                const e = "HttpConnection.startInternal completed gracefully but didn't enter the connection into the connected state!";
                return this._logger.log(Et.Error, e),
                Promise.reject(new gt(e))
            }
            this._connectionStarted = !0
        }
        send(e) {
            return "Connected" !== this._connectionState ? Promise.reject(new Error("Cannot send data if the connection is not in the 'Connected' State.")) : (this._sendQueue || (this._sendQueue = new rn(this.transport)),
            this._sendQueue.send(e))
        }
        async stop(e) {
            return "Disconnected" === this._connectionState ? (this._logger.log(Et.Debug, `Call to HttpConnection.stop(${e}) ignored because the connection is already in the disconnected state.`),
            Promise.resolve()) : "Disconnecting" === this._connectionState ? (this._logger.log(Et.Debug, `Call to HttpConnection.stop(${e}) ignored because the connection is already in the disconnecting state.`),
            this._stopPromise) : (this._connectionState = "Disconnecting",
            this._stopPromise = new Promise((e => {
                this._stopPromiseResolver = e
            }
            )),
            await this._stopInternal(e),
            void await this._stopPromise)
        }
        async _stopInternal(e) {
            this._stopError = e;
            try {
                await this._startInternalPromise
            } catch (e) {}
            if (this.transport) {
                try {
                    await this.transport.stop()
                } catch (e) {
                    this._logger.log(Et.Error, `HttpConnection.transport.stop() threw error '${e}'.`),
                    this._stopConnection()
                }
                this.transport = void 0
            } else
                this._logger.log(Et.Debug, "HttpConnection.transport is undefined in HttpConnection.stop() because start() failed.")
        }
        async _startInternal(e) {
            let t = this.baseUrl;
            this._accessTokenFactory = this._options.accessTokenFactory,
            this._httpClient._accessTokenFactory = this._accessTokenFactory;
            try {
                if (this._options.skipNegotiation) {
                    if (this._options.transport !== Gt.WebSockets)
                        throw new Error("Negotiation can only be skipped when using the WebSocket transport directly.");
                    this.transport = this._constructTransport(Gt.WebSockets),
                    await this._startTransport(t, e)
                } else {
                    let n = null
                      , o = 0;
                    do {
                        if (n = await this._getNegotiationResponse(t),
                        "Disconnecting" === this._connectionState || "Disconnected" === this._connectionState)
                            throw new gt("The connection was stopped during negotiation.");
                        if (n.error)
                            throw new Error(n.error);
                        if (n.ProtocolVersion)
                            throw new Error("Detected a connection attempt to an ASP.NET SignalR Server. This client only supports connecting to an ASP.NET Core SignalR Server. See https://aka.ms/signalr-core-differences for details.");
                        if (n.url && (t = n.url),
                        n.accessToken) {
                            const e = n.accessToken;
                            this._accessTokenFactory = () => e,
                            this._httpClient._accessToken = e,
                            this._httpClient._accessTokenFactory = void 0
                        }
                        o++
                    } while (n.url && o < 100);
                    if (100 === o && n.url)
                        throw new Error("Negotiate redirection limit exceeded.");
                    await this._createTransport(t, this._options.transport, n, e)
                }
                this.transport instanceof en && (this.features.inherentKeepAlive = !0),
                "Connecting" === this._connectionState && (this._logger.log(Et.Debug, "The HttpConnection connected successfully."),
                this._connectionState = "Connected")
            } catch (e) {
                return this._logger.log(Et.Error, "Failed to start the connection: " + e),
                this._connectionState = "Disconnected",
                this.transport = void 0,
                this._stopPromiseResolver(),
                Promise.reject(e)
            }
        }
        async _getNegotiationResponse(e) {
            const t = {}
              , [n,o] = Mt();
            t[n] = o;
            const r = this._resolveNegotiateUrl(e);
            this._logger.log(Et.Debug, `Sending negotiation request: ${r}.`);
            try {
                const e = await this._httpClient.post(r, {
                    content: "",
                    headers: {
                        ...t,
                        ...this._options.headers
                    },
                    timeout: this._options.timeout,
                    withCredentials: this._options.withCredentials
                });
                if (200 !== e.statusCode)
                    return Promise.reject(new Error(`Unexpected status code returned from negotiate '${e.statusCode}'`));
                const n = JSON.parse(e.content);
                return (!n.negotiateVersion || n.negotiateVersion < 1) && (n.connectionToken = n.connectionId),
                n.useStatefulReconnect && !0 !== this._options._useStatefulReconnect ? Promise.reject(new wt("Client didn't negotiate Stateful Reconnect but the server did.")) : n
            } catch (e) {
                let t = "Failed to complete negotiation with the server: " + e;
                return e instanceof pt && 404 === e.statusCode && (t += " Either this is not a SignalR endpoint or there is a proxy blocking the connection."),
                this._logger.log(Et.Error, t),
                Promise.reject(new wt(t))
            }
        }
        _createConnectUrl(e, t) {
            return t ? e + (-1 === e.indexOf("?") ? "?" : "&") + `id=${t}` : e
        }
        async _createTransport(e, t, n, o) {
            let r = this._createConnectUrl(e, n.connectionToken);
            if (this._isITransport(t))
                return this._logger.log(Et.Debug, "Connection was provided an instance of ITransport, using that directly."),
                this.transport = t,
                await this._startTransport(r, o),
                void (this.connectionId = n.connectionId);
            const i = []
              , s = n.availableTransports || [];
            let a = n;
            for (const n of s) {
                const s = this._resolveTransportOrError(n, t, o, !0 === (null == a ? void 0 : a.useStatefulReconnect));
                if (s instanceof Error)
                    i.push(`${n.transport} failed:`),
                    i.push(s);
                else if (this._isITransport(s)) {
                    if (this.transport = s,
                    !a) {
                        try {
                            a = await this._getNegotiationResponse(e)
                        } catch (e) {
                            return Promise.reject(e)
                        }
                        r = this._createConnectUrl(e, a.connectionToken)
                    }
                    try {
                        return await this._startTransport(r, o),
                        void (this.connectionId = a.connectionId)
                    } catch (e) {
                        if (this._logger.log(Et.Error, `Failed to start the transport '${n.transport}': ${e}`),
                        a = void 0,
                        i.push(new vt(`${n.transport} failed: ${e}`,Gt[n.transport])),
                        "Connecting" !== this._connectionState) {
                            const e = "Failed to select transport before stop() was called.";
                            return this._logger.log(Et.Debug, e),
                            Promise.reject(new gt(e))
                        }
                    }
                }
            }
            return i.length > 0 ? Promise.reject(new _t(`Unable to connect to the server with any of the available transports. ${i.join(" ")}`,i)) : Promise.reject(new Error("None of the transports supported by the client are supported by the server."))
        }
        _constructTransport(e) {
            switch (e) {
            case Gt.WebSockets:
                if (!this._options.WebSocket)
                    throw new Error("'WebSocket' is not supported in your environment.");
                return new nn(this._httpClient,this._accessTokenFactory,this._logger,this._options.logMessageContent,this._options.WebSocket,this._options.headers || {});
            case Gt.ServerSentEvents:
                if (!this._options.EventSource)
                    throw new Error("'EventSource' is not supported in your environment.");
                return new tn(this._httpClient,this._httpClient._accessToken,this._logger,this._options);
            case Gt.LongPolling:
                return new en(this._httpClient,this._logger,this._options);
            default:
                throw new Error(`Unknown transport: ${e}.`)
            }
        }
        _startTransport(e, t) {
            return this.transport.onreceive = this.onreceive,
            this.features.reconnect ? this.transport.onclose = async n => {
                let o = !1;
                if (this.features.reconnect) {
                    try {
                        this.features.disconnected(),
                        await this.transport.connect(e, t),
                        await this.features.resend()
                    } catch {
                        o = !0
                    }
                    o && this._stopConnection(n)
                } else
                    this._stopConnection(n)
            }
            : this.transport.onclose = e => this._stopConnection(e),
            this.transport.connect(e, t)
        }
        _resolveTransportOrError(e, t, n, o) {
            const r = Gt[e.transport];
            if (null == r)
                return this._logger.log(Et.Debug, `Skipping transport '${e.transport}' because it is not supported by this client.`),
                new Error(`Skipping transport '${e.transport}' because it is not supported by this client.`);
            if (!function(e, t) {
                return !e || !!(t & e)
            }(t, r))
                return this._logger.log(Et.Debug, `Skipping transport '${Gt[r]}' because it was disabled by the client.`),
                new yt(`'${Gt[r]}' is disabled by the client.`,r);
            if (!(e.transferFormats.map((e => Qt[e])).indexOf(n) >= 0))
                return this._logger.log(Et.Debug, `Skipping transport '${Gt[r]}' because it does not support the requested transfer format '${Qt[n]}'.`),
                new Error(`'${Gt[r]}' does not support ${Qt[n]}.`);
            if (r === Gt.WebSockets && !this._options.WebSocket || r === Gt.ServerSentEvents && !this._options.EventSource)
                return this._logger.log(Et.Debug, `Skipping transport '${Gt[r]}' because it is not supported in your environment.'`),
                new mt(`'${Gt[r]}' is not supported in your environment.`,r);
            this._logger.log(Et.Debug, `Selecting transport '${Gt[r]}'.`);
            try {
                return this.features.reconnect = r === Gt.WebSockets ? o : void 0,
                this._constructTransport(r)
            } catch (e) {
                return e
            }
        }
        _isITransport(e) {
            return e && "object" == typeof e && "connect"in e
        }
        _stopConnection(e) {
            if (this._logger.log(Et.Debug, `HttpConnection.stopConnection(${e}) called while in state ${this._connectionState}.`),
            this.transport = void 0,
            e = this._stopError || e,
            this._stopError = void 0,
            "Disconnected" !== this._connectionState) {
                if ("Connecting" === this._connectionState)
                    throw this._logger.log(Et.Warning, `Call to HttpConnection.stopConnection(${e}) was ignored because the connection is still in the connecting state.`),
                    new Error(`HttpConnection.stopConnection(${e}) was called while the connection is still in the connecting state.`);
                if ("Disconnecting" === this._connectionState && this._stopPromiseResolver(),
                e ? this._logger.log(Et.Error, `Connection disconnected with error '${e}'.`) : this._logger.log(Et.Information, "Connection disconnected."),
                this._sendQueue && (this._sendQueue.stop().catch((e => {
                    this._logger.log(Et.Error, `TransportSendQueue.stop() threw error '${e}'.`)
                }
                )),
                this._sendQueue = void 0),
                this.connectionId = void 0,
                this._connectionState = "Disconnected",
                this._connectionStarted) {
                    this._connectionStarted = !1;
                    try {
                        this.onclose && this.onclose(e)
                    } catch (t) {
                        this._logger.log(Et.Error, `HttpConnection.onclose(${e}) threw error '${t}'.`)
                    }
                }
            } else
                this._logger.log(Et.Debug, `Call to HttpConnection.stopConnection(${e}) was ignored because the connection is already in the disconnected state.`)
        }
        _resolveUrl(e) {
            if (0 === e.lastIndexOf("https://", 0) || 0 === e.lastIndexOf("http://", 0))
                return e;
            if (!Dt.isBrowser)
                throw new Error(`Cannot resolve '${e}'.`);
            const t = window.document.createElement("a");
            return t.href = e,
            this._logger.log(Et.Information, `Normalizing '${e}' to '${t.href}'.`),
            t.href
        }
        _resolveNegotiateUrl(e) {
            const t = new URL(e);
            t.pathname.endsWith("/") ? t.pathname += "negotiate" : t.pathname += "/negotiate";
            const n = new URLSearchParams(t.searchParams);
            return n.has("negotiateVersion") || n.append("negotiateVersion", this._negotiateVersion.toString()),
            n.has("useStatefulReconnect") ? "true" === n.get("useStatefulReconnect") && (this._options._useStatefulReconnect = !0) : !0 === this._options._useStatefulReconnect && n.append("useStatefulReconnect", "true"),
            t.search = n.toString(),
            t.toString()
        }
    }
    class rn {
        constructor(e) {
            this._transport = e,
            this._buffer = [],
            this._executing = !0,
            this._sendBufferedData = new sn,
            this._transportResult = new sn,
            this._sendLoopPromise = this._sendLoop()
        }
        send(e) {
            return this._bufferData(e),
            this._transportResult || (this._transportResult = new sn),
            this._transportResult.promise
        }
        stop() {
            return this._executing = !1,
            this._sendBufferedData.resolve(),
            this._sendLoopPromise
        }
        _bufferData(e) {
            if (this._buffer.length && typeof this._buffer[0] != typeof e)
                throw new Error(`Expected data to be of type ${typeof this._buffer} but was of type ${typeof e}`);
            this._buffer.push(e),
            this._sendBufferedData.resolve()
        }
        async _sendLoop() {
            for (; ; ) {
                if (await this._sendBufferedData.promise,
                !this._executing) {
                    this._transportResult && this._transportResult.reject("Connection stopped.");
                    break
                }
                this._sendBufferedData = new sn;
                const e = this._transportResult;
                this._transportResult = void 0;
                const t = "string" == typeof this._buffer[0] ? this._buffer.join("") : rn._concatBuffers(this._buffer);
                this._buffer.length = 0;
                try {
                    await this._transport.send(t),
                    e.resolve()
                } catch (t) {
                    e.reject(t)
                }
            }
        }
        static _concatBuffers(e) {
            const t = e.map((e => e.byteLength)).reduce(( (e, t) => e + t))
              , n = new Uint8Array(t);
            let o = 0;
            for (const t of e)
                n.set(new Uint8Array(t), o),
                o += t.byteLength;
            return n.buffer
        }
    }
    class sn {
        constructor() {
            this.promise = new Promise(( (e, t) => [this._resolver,this._rejecter] = [e, t]))
        }
        resolve() {
            this._resolver()
        }
        reject(e) {
            this._rejecter(e)
        }
    }
    class an {
        constructor() {
            this.name = "json",
            this.version = 2,
            this.transferFormat = Qt.Text
        }
        parseMessages(e, t) {
            if ("string" != typeof e)
                throw new Error("Invalid input for JSON hub protocol. Expected a string.");
            if (!e)
                return [];
            null === t && (t = kt.instance);
            const n = Ht.parse(e)
              , o = [];
            for (const e of n) {
                const n = JSON.parse(e);
                if ("number" != typeof n.type)
                    throw new Error("Invalid payload.");
                switch (n.type) {
                case Ct.Invocation:
                    this._isInvocationMessage(n);
                    break;
                case Ct.StreamItem:
                    this._isStreamItemMessage(n);
                    break;
                case Ct.Completion:
                    this._isCompletionMessage(n);
                    break;
                case Ct.Ping:
                case Ct.Close:
                    break;
                case Ct.Ack:
                    this._isAckMessage(n);
                    break;
                case Ct.Sequence:
                    this._isSequenceMessage(n);
                    break;
                default:
                    t.log(Et.Information, "Unknown message type '" + n.type + "' ignored.");
                    continue
                }
                o.push(n)
            }
            return o
        }
        writeMessage(e) {
            return Ht.write(JSON.stringify(e))
        }
        _isInvocationMessage(e) {
            this._assertNotEmptyString(e.target, "Invalid payload for Invocation message."),
            void 0 !== e.invocationId && this._assertNotEmptyString(e.invocationId, "Invalid payload for Invocation message.")
        }
        _isStreamItemMessage(e) {
            if (this._assertNotEmptyString(e.invocationId, "Invalid payload for StreamItem message."),
            void 0 === e.item)
                throw new Error("Invalid payload for StreamItem message.")
        }
        _isCompletionMessage(e) {
            if (e.result && e.error)
                throw new Error("Invalid payload for Completion message.");
            !e.result && e.error && this._assertNotEmptyString(e.error, "Invalid payload for Completion message."),
            this._assertNotEmptyString(e.invocationId, "Invalid payload for Completion message.")
        }
        _isAckMessage(e) {
            if ("number" != typeof e.sequenceId)
                throw new Error("Invalid SequenceId for Ack message.")
        }
        _isSequenceMessage(e) {
            if ("number" != typeof e.sequenceId)
                throw new Error("Invalid SequenceId for Sequence message.")
        }
        _assertNotEmptyString(e, t) {
            if ("string" != typeof e || "" === e)
                throw new Error(t)
        }
    }
    const cn = {
        trace: Et.Trace,
        debug: Et.Debug,
        info: Et.Information,
        information: Et.Information,
        warn: Et.Warning,
        warning: Et.Warning,
        error: Et.Error,
        critical: Et.Critical,
        none: Et.None
    };
    class ln {
        configureLogging(e) {
            if (Tt.isRequired(e, "logging"),
            function(e) {
                return void 0 !== e.log
            }(e))
                this.logger = e;
            else if ("string" == typeof e) {
                const t = function(e) {
                    const t = cn[e.toLowerCase()];
                    if (void 0 !== t)
                        return t;
                    throw new Error(`Unknown log level: ${e}`)
                }(e);
                this.logger = new Nt(t)
            } else
                this.logger = new Nt(e);
            return this
        }
        withUrl(e, t) {
            return Tt.isRequired(e, "url"),
            Tt.isNotEmpty(e, "url"),
            this.url = e,
            this.httpConnectionOptions = "object" == typeof t ? {
                ...this.httpConnectionOptions,
                ...t
            } : {
                ...this.httpConnectionOptions,
                transport: t
            },
            this
        }
        withHubProtocol(e) {
            return Tt.isRequired(e, "protocol"),
            this.protocol = e,
            this
        }
        withAutomaticReconnect(e) {
            if (this.reconnectPolicy)
                throw new Error("A reconnectPolicy has already been set.");
            return e ? Array.isArray(e) ? this.reconnectPolicy = new Kt(e) : this.reconnectPolicy = e : this.reconnectPolicy = new Kt,
            this
        }
        withServerTimeout(e) {
            return Tt.isRequired(e, "milliseconds"),
            this._serverTimeoutInMilliseconds = e,
            this
        }
        withKeepAliveInterval(e) {
            return Tt.isRequired(e, "milliseconds"),
            this._keepAliveIntervalInMilliseconds = e,
            this
        }
        withStatefulReconnect(e) {
            return void 0 === this.httpConnectionOptions && (this.httpConnectionOptions = {}),
            this.httpConnectionOptions._useStatefulReconnect = !0,
            this._statefulReconnectBufferSize = null == e ? void 0 : e.bufferSize,
            this
        }
        build() {
            const e = this.httpConnectionOptions || {};
            if (void 0 === e.logger && (e.logger = this.logger),
            !this.url)
                throw new Error("The 'HubConnectionBuilder.withUrl' method must be called before building the connection.");
            const t = new on(this.url,e);
            return Jt.create(t, this.logger || kt.instance, this.protocol || new an, this.reconnectPolicy, this._serverTimeoutInMilliseconds, this._keepAliveIntervalInMilliseconds, this._statefulReconnectBufferSize)
        }
    }
    var hn;
    !function(e) {
        e[e.Default = 0] = "Default",
        e[e.Server = 1] = "Server",
        e[e.WebAssembly = 2] = "WebAssembly",
        e[e.WebView = 3] = "WebView"
    }(hn || (hn = {}));
    var dn, un, pn, fn = 4294967295;
    function gn(e, t, n) {
        var o = Math.floor(n / 4294967296)
          , r = n;
        e.setUint32(t, o),
        e.setUint32(t + 4, r)
    }
    function mn(e, t) {
        return 4294967296 * e.getInt32(t) + e.getUint32(t + 4)
    }
    var yn = ("undefined" == typeof process || "never" !== (null === (dn = null === process || void 0 === process ? void 0 : process.env) || void 0 === dn ? void 0 : dn.TEXT_ENCODING)) && "undefined" != typeof TextEncoder && "undefined" != typeof TextDecoder;
    function vn(e) {
        for (var t = e.length, n = 0, o = 0; o < t; ) {
            var r = e.charCodeAt(o++);
            if (4294967168 & r)
                if (4294965248 & r) {
                    if (r >= 55296 && r <= 56319 && o < t) {
                        var i = e.charCodeAt(o);
                        56320 == (64512 & i) && (++o,
                        r = ((1023 & r) << 10) + (1023 & i) + 65536)
                    }
                    n += 4294901760 & r ? 4 : 3
                } else
                    n += 2;
            else
                n++
        }
        return n
    }
    var wn = yn ? new TextEncoder : void 0
      , _n = yn ? "undefined" != typeof process && "force" !== (null === (un = null === process || void 0 === process ? void 0 : process.env) || void 0 === un ? void 0 : un.TEXT_ENCODING) ? 200 : 0 : fn
      , bn = (null == wn ? void 0 : wn.encodeInto) ? function(e, t, n) {
        wn.encodeInto(e, t.subarray(n))
    }
    : function(e, t, n) {
        t.set(wn.encode(e), n)
    }
    ;
    function Sn(e, t, n) {
        for (var o = t, r = o + n, i = [], s = ""; o < r; ) {
            var a = e[o++];
            if (128 & a)
                if (192 == (224 & a)) {
                    var c = 63 & e[o++];
                    i.push((31 & a) << 6 | c)
                } else if (224 == (240 & a)) {
                    c = 63 & e[o++];
                    var l = 63 & e[o++];
                    i.push((31 & a) << 12 | c << 6 | l)
                } else if (240 == (248 & a)) {
                    var h = (7 & a) << 18 | (c = 63 & e[o++]) << 12 | (l = 63 & e[o++]) << 6 | 63 & e[o++];
                    h > 65535 && (h -= 65536,
                    i.push(h >>> 10 & 1023 | 55296),
                    h = 56320 | 1023 & h),
                    i.push(h)
                } else
                    i.push(a);
            else
                i.push(a);
            i.length >= 4096 && (s += String.fromCharCode.apply(String, i),
            i.length = 0)
        }
        return i.length > 0 && (s += String.fromCharCode.apply(String, i)),
        s
    }
    var En, Cn = yn ? new TextDecoder : null, In = yn ? "undefined" != typeof process && "force" !== (null === (pn = null === process || void 0 === process ? void 0 : process.env) || void 0 === pn ? void 0 : pn.TEXT_DECODER) ? 200 : 0 : fn, kn = function(e, t) {
        this.type = e,
        this.data = t
    }, Tn = (En = function(e, t) {
        return En = Object.setPrototypeOf || {
            __proto__: []
        }instanceof Array && function(e, t) {
            e.__proto__ = t
        }
        || function(e, t) {
            for (var n in t)
                Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n])
        }
        ,
        En(e, t)
    }
    ,
    function(e, t) {
        if ("function" != typeof t && null !== t)
            throw new TypeError("Class extends value " + String(t) + " is not a constructor or null");
        function n() {
            this.constructor = e
        }
        En(e, t),
        e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype,
        new n)
    }
    ), Dn = function(e) {
        function t(n) {
            var o = e.call(this, n) || this
              , r = Object.create(t.prototype);
            return Object.setPrototypeOf(o, r),
            Object.defineProperty(o, "name", {
                configurable: !0,
                enumerable: !1,
                value: t.name
            }),
            o
        }
        return Tn(t, e),
        t
    }(Error), Rn = {
        type: -1,
        encode: function(e) {
            var t, n, o, r;
            return e instanceof Date ? function(e) {
                var t, n = e.sec, o = e.nsec;
                if (n >= 0 && o >= 0 && n <= 17179869183) {
                    if (0 === o && n <= 4294967295) {
                        var r = new Uint8Array(4);
                        return (t = new DataView(r.buffer)).setUint32(0, n),
                        r
                    }
                    var i = n / 4294967296
                      , s = 4294967295 & n;
                    return r = new Uint8Array(8),
                    (t = new DataView(r.buffer)).setUint32(0, o << 2 | 3 & i),
                    t.setUint32(4, s),
                    r
                }
                return r = new Uint8Array(12),
                (t = new DataView(r.buffer)).setUint32(0, o),
                gn(t, 4, n),
                r
            }((o = 1e6 * ((t = e.getTime()) - 1e3 * (n = Math.floor(t / 1e3))),
            {
                sec: n + (r = Math.floor(o / 1e9)),
                nsec: o - 1e9 * r
            })) : null
        },
        decode: function(e) {
            var t = function(e) {
                var t = new DataView(e.buffer,e.byteOffset,e.byteLength);
                switch (e.byteLength) {
                case 4:
                    return {
                        sec: t.getUint32(0),
                        nsec: 0
                    };
                case 8:
                    var n = t.getUint32(0);
                    return {
                        sec: 4294967296 * (3 & n) + t.getUint32(4),
                        nsec: n >>> 2
                    };
                case 12:
                    return {
                        sec: mn(t, 4),
                        nsec: t.getUint32(0)
                    };
                default:
                    throw new Dn("Unrecognized data size for timestamp (expected 4, 8, or 12): ".concat(e.length))
                }
            }(e);
            return new Date(1e3 * t.sec + t.nsec / 1e6)
        }
    }, xn = function() {
        function e() {
            this.builtInEncoders = [],
            this.builtInDecoders = [],
            this.encoders = [],
            this.decoders = [],
            this.register(Rn)
        }
        return e.prototype.register = function(e) {
            var t = e.type
              , n = e.encode
              , o = e.decode;
            if (t >= 0)
                this.encoders[t] = n,
                this.decoders[t] = o;
            else {
                var r = 1 + t;
                this.builtInEncoders[r] = n,
                this.builtInDecoders[r] = o
            }
        }
        ,
        e.prototype.tryToEncode = function(e, t) {
            for (var n = 0; n < this.builtInEncoders.length; n++)
                if (null != (o = this.builtInEncoders[n]) && null != (r = o(e, t)))
                    return new kn(-1 - n,r);
            for (n = 0; n < this.encoders.length; n++) {
                var o, r;
                if (null != (o = this.encoders[n]) && null != (r = o(e, t)))
                    return new kn(n,r)
            }
            return e instanceof kn ? e : null
        }
        ,
        e.prototype.decode = function(e, t, n) {
            var o = t < 0 ? this.builtInDecoders[-1 - t] : this.decoders[t];
            return o ? o(e, t, n) : new kn(t,e)
        }
        ,
        e.defaultCodec = new e,
        e
    }();
    function An(e) {
        return e instanceof Uint8Array ? e : ArrayBuffer.isView(e) ? new Uint8Array(e.buffer,e.byteOffset,e.byteLength) : e instanceof ArrayBuffer ? new Uint8Array(e) : Uint8Array.from(e)
    }
    var Pn = function() {
        function e(e, t, n, o, r, i, s, a) {
            void 0 === e && (e = xn.defaultCodec),
            void 0 === t && (t = void 0),
            void 0 === n && (n = 100),
            void 0 === o && (o = 2048),
            void 0 === r && (r = !1),
            void 0 === i && (i = !1),
            void 0 === s && (s = !1),
            void 0 === a && (a = !1),
            this.extensionCodec = e,
            this.context = t,
            this.maxDepth = n,
            this.initialBufferSize = o,
            this.sortKeys = r,
            this.forceFloat32 = i,
            this.ignoreUndefined = s,
            this.forceIntegerToFloat = a,
            this.pos = 0,
            this.view = new DataView(new ArrayBuffer(this.initialBufferSize)),
            this.bytes = new Uint8Array(this.view.buffer)
        }
        return e.prototype.reinitializeState = function() {
            this.pos = 0
        }
        ,
        e.prototype.encodeSharedRef = function(e) {
            return this.reinitializeState(),
            this.doEncode(e, 1),
            this.bytes.subarray(0, this.pos)
        }
        ,
        e.prototype.encode = function(e) {
            return this.reinitializeState(),
            this.doEncode(e, 1),
            this.bytes.slice(0, this.pos)
        }
        ,
        e.prototype.doEncode = function(e, t) {
            if (t > this.maxDepth)
                throw new Error("Too deep objects in depth ".concat(t));
            null == e ? this.encodeNil() : "boolean" == typeof e ? this.encodeBoolean(e) : "number" == typeof e ? this.encodeNumber(e) : "string" == typeof e ? this.encodeString(e) : this.encodeObject(e, t)
        }
        ,
        e.prototype.ensureBufferSizeToWrite = function(e) {
            var t = this.pos + e;
            this.view.byteLength < t && this.resizeBuffer(2 * t)
        }
        ,
        e.prototype.resizeBuffer = function(e) {
            var t = new ArrayBuffer(e)
              , n = new Uint8Array(t)
              , o = new DataView(t);
            n.set(this.bytes),
            this.view = o,
            this.bytes = n
        }
        ,
        e.prototype.encodeNil = function() {
            this.writeU8(192)
        }
        ,
        e.prototype.encodeBoolean = function(e) {
            !1 === e ? this.writeU8(194) : this.writeU8(195)
        }
        ,
        e.prototype.encodeNumber = function(e) {
            Number.isSafeInteger(e) && !this.forceIntegerToFloat ? e >= 0 ? e < 128 ? this.writeU8(e) : e < 256 ? (this.writeU8(204),
            this.writeU8(e)) : e < 65536 ? (this.writeU8(205),
            this.writeU16(e)) : e < 4294967296 ? (this.writeU8(206),
            this.writeU32(e)) : (this.writeU8(207),
            this.writeU64(e)) : e >= -32 ? this.writeU8(224 | e + 32) : e >= -128 ? (this.writeU8(208),
            this.writeI8(e)) : e >= -32768 ? (this.writeU8(209),
            this.writeI16(e)) : e >= -2147483648 ? (this.writeU8(210),
            this.writeI32(e)) : (this.writeU8(211),
            this.writeI64(e)) : this.forceFloat32 ? (this.writeU8(202),
            this.writeF32(e)) : (this.writeU8(203),
            this.writeF64(e))
        }
        ,
        e.prototype.writeStringHeader = function(e) {
            if (e < 32)
                this.writeU8(160 + e);
            else if (e < 256)
                this.writeU8(217),
                this.writeU8(e);
            else if (e < 65536)
                this.writeU8(218),
                this.writeU16(e);
            else {
                if (!(e < 4294967296))
                    throw new Error("Too long string: ".concat(e, " bytes in UTF-8"));
                this.writeU8(219),
                this.writeU32(e)
            }
        }
        ,
        e.prototype.encodeString = function(e) {
            if (e.length > _n) {
                var t = vn(e);
                this.ensureBufferSizeToWrite(5 + t),
                this.writeStringHeader(t),
                bn(e, this.bytes, this.pos),
                this.pos += t
            } else
                t = vn(e),
                this.ensureBufferSizeToWrite(5 + t),
                this.writeStringHeader(t),
                function(e, t, n) {
                    for (var o = e.length, r = n, i = 0; i < o; ) {
                        var s = e.charCodeAt(i++);
                        if (4294967168 & s) {
                            if (4294965248 & s) {
                                if (s >= 55296 && s <= 56319 && i < o) {
                                    var a = e.charCodeAt(i);
                                    56320 == (64512 & a) && (++i,
                                    s = ((1023 & s) << 10) + (1023 & a) + 65536)
                                }
                                4294901760 & s ? (t[r++] = s >> 18 & 7 | 240,
                                t[r++] = s >> 12 & 63 | 128,
                                t[r++] = s >> 6 & 63 | 128) : (t[r++] = s >> 12 & 15 | 224,
                                t[r++] = s >> 6 & 63 | 128)
                            } else
                                t[r++] = s >> 6 & 31 | 192;
                            t[r++] = 63 & s | 128
                        } else
                            t[r++] = s
                    }
                }(e, this.bytes, this.pos),
                this.pos += t
        }
        ,
        e.prototype.encodeObject = function(e, t) {
            var n = this.extensionCodec.tryToEncode(e, this.context);
            if (null != n)
                this.encodeExtension(n);
            else if (Array.isArray(e))
                this.encodeArray(e, t);
            else if (ArrayBuffer.isView(e))
                this.encodeBinary(e);
            else {
                if ("object" != typeof e)
                    throw new Error("Unrecognized object: ".concat(Object.prototype.toString.apply(e)));
                this.encodeMap(e, t)
            }
        }
        ,
        e.prototype.encodeBinary = function(e) {
            var t = e.byteLength;
            if (t < 256)
                this.writeU8(196),
                this.writeU8(t);
            else if (t < 65536)
                this.writeU8(197),
                this.writeU16(t);
            else {
                if (!(t < 4294967296))
                    throw new Error("Too large binary: ".concat(t));
                this.writeU8(198),
                this.writeU32(t)
            }
            var n = An(e);
            this.writeU8a(n)
        }
        ,
        e.prototype.encodeArray = function(e, t) {
            var n = e.length;
            if (n < 16)
                this.writeU8(144 + n);
            else if (n < 65536)
                this.writeU8(220),
                this.writeU16(n);
            else {
                if (!(n < 4294967296))
                    throw new Error("Too large array: ".concat(n));
                this.writeU8(221),
                this.writeU32(n)
            }
            for (var o = 0, r = e; o < r.length; o++) {
                var i = r[o];
                this.doEncode(i, t + 1)
            }
        }
        ,
        e.prototype.countWithoutUndefined = function(e, t) {
            for (var n = 0, o = 0, r = t; o < r.length; o++)
                void 0 !== e[r[o]] && n++;
            return n
        }
        ,
        e.prototype.encodeMap = function(e, t) {
            var n = Object.keys(e);
            this.sortKeys && n.sort();
            var o = this.ignoreUndefined ? this.countWithoutUndefined(e, n) : n.length;
            if (o < 16)
                this.writeU8(128 + o);
            else if (o < 65536)
                this.writeU8(222),
                this.writeU16(o);
            else {
                if (!(o < 4294967296))
                    throw new Error("Too large map object: ".concat(o));
                this.writeU8(223),
                this.writeU32(o)
            }
            for (var r = 0, i = n; r < i.length; r++) {
                var s = i[r]
                  , a = e[s];
                this.ignoreUndefined && void 0 === a || (this.encodeString(s),
                this.doEncode(a, t + 1))
            }
        }
        ,
        e.prototype.encodeExtension = function(e) {
            var t = e.data.length;
            if (1 === t)
                this.writeU8(212);
            else if (2 === t)
                this.writeU8(213);
            else if (4 === t)
                this.writeU8(214);
            else if (8 === t)
                this.writeU8(215);
            else if (16 === t)
                this.writeU8(216);
            else if (t < 256)
                this.writeU8(199),
                this.writeU8(t);
            else if (t < 65536)
                this.writeU8(200),
                this.writeU16(t);
            else {
                if (!(t < 4294967296))
                    throw new Error("Too large extension object: ".concat(t));
                this.writeU8(201),
                this.writeU32(t)
            }
            this.writeI8(e.type),
            this.writeU8a(e.data)
        }
        ,
        e.prototype.writeU8 = function(e) {
            this.ensureBufferSizeToWrite(1),
            this.view.setUint8(this.pos, e),
            this.pos++
        }
        ,
        e.prototype.writeU8a = function(e) {
            var t = e.length;
            this.ensureBufferSizeToWrite(t),
            this.bytes.set(e, this.pos),
            this.pos += t
        }
        ,
        e.prototype.writeI8 = function(e) {
            this.ensureBufferSizeToWrite(1),
            this.view.setInt8(this.pos, e),
            this.pos++
        }
        ,
        e.prototype.writeU16 = function(e) {
            this.ensureBufferSizeToWrite(2),
            this.view.setUint16(this.pos, e),
            this.pos += 2
        }
        ,
        e.prototype.writeI16 = function(e) {
            this.ensureBufferSizeToWrite(2),
            this.view.setInt16(this.pos, e),
            this.pos += 2
        }
        ,
        e.prototype.writeU32 = function(e) {
            this.ensureBufferSizeToWrite(4),
            this.view.setUint32(this.pos, e),
            this.pos += 4
        }
        ,
        e.prototype.writeI32 = function(e) {
            this.ensureBufferSizeToWrite(4),
            this.view.setInt32(this.pos, e),
            this.pos += 4
        }
        ,
        e.prototype.writeF32 = function(e) {
            this.ensureBufferSizeToWrite(4),
            this.view.setFloat32(this.pos, e),
            this.pos += 4
        }
        ,
        e.prototype.writeF64 = function(e) {
            this.ensureBufferSizeToWrite(8),
            this.view.setFloat64(this.pos, e),
            this.pos += 8
        }
        ,
        e.prototype.writeU64 = function(e) {
            this.ensureBufferSizeToWrite(8),
            function(e, t, n) {
                var o = n / 4294967296
                  , r = n;
                e.setUint32(t, o),
                e.setUint32(t + 4, r)
            }(this.view, this.pos, e),
            this.pos += 8
        }
        ,
        e.prototype.writeI64 = function(e) {
            this.ensureBufferSizeToWrite(8),
            gn(this.view, this.pos, e),
            this.pos += 8
        }
        ,
        e
    }();
    function Nn(e) {
        return "".concat(e < 0 ? "-" : "", "0x").concat(Math.abs(e).toString(16).padStart(2, "0"))
    }
    var Mn = function() {
        function e(e, t) {
            void 0 === e && (e = 16),
            void 0 === t && (t = 16),
            this.maxKeyLength = e,
            this.maxLengthPerKey = t,
            this.hit = 0,
            this.miss = 0,
            this.caches = [];
            for (var n = 0; n < this.maxKeyLength; n++)
                this.caches.push([])
        }
        return e.prototype.canBeCached = function(e) {
            return e > 0 && e <= this.maxKeyLength
        }
        ,
        e.prototype.find = function(e, t, n) {
            e: for (var o = 0, r = this.caches[n - 1]; o < r.length; o++) {
                for (var i = r[o], s = i.bytes, a = 0; a < n; a++)
                    if (s[a] !== e[t + a])
                        continue e;
                return i.str
            }
            return null
        }
        ,
        e.prototype.store = function(e, t) {
            var n = this.caches[e.length - 1]
              , o = {
                bytes: e,
                str: t
            };
            n.length >= this.maxLengthPerKey ? n[Math.random() * n.length | 0] = o : n.push(o)
        }
        ,
        e.prototype.decode = function(e, t, n) {
            var o = this.find(e, t, n);
            if (null != o)
                return this.hit++,
                o;
            this.miss++;
            var r = Sn(e, t, n)
              , i = Uint8Array.prototype.slice.call(e, t, t + n);
            return this.store(i, r),
            r
        }
        ,
        e
    }()
      , Un = function(e, t) {
        var n, o, r, i, s = {
            label: 0,
            sent: function() {
                if (1 & r[0])
                    throw r[1];
                return r[1]
            },
            trys: [],
            ops: []
        };
        return i = {
            next: a(0),
            throw: a(1),
            return: a(2)
        },
        "function" == typeof Symbol && (i[Symbol.iterator] = function() {
            return this
        }
        ),
        i;
        function a(i) {
            return function(a) {
                return function(i) {
                    if (n)
                        throw new TypeError("Generator is already executing.");
                    for (; s; )
                        try {
                            if (n = 1,
                            o && (r = 2 & i[0] ? o.return : i[0] ? o.throw || ((r = o.return) && r.call(o),
                            0) : o.next) && !(r = r.call(o, i[1])).done)
                                return r;
                            switch (o = 0,
                            r && (i = [2 & i[0], r.value]),
                            i[0]) {
                            case 0:
                            case 1:
                                r = i;
                                break;
                            case 4:
                                return s.label++,
                                {
                                    value: i[1],
                                    done: !1
                                };
                            case 5:
                                s.label++,
                                o = i[1],
                                i = [0];
                                continue;
                            case 7:
                                i = s.ops.pop(),
                                s.trys.pop();
                                continue;
                            default:
                                if (!((r = (r = s.trys).length > 0 && r[r.length - 1]) || 6 !== i[0] && 2 !== i[0])) {
                                    s = 0;
                                    continue
                                }
                                if (3 === i[0] && (!r || i[1] > r[0] && i[1] < r[3])) {
                                    s.label = i[1];
                                    break
                                }
                                if (6 === i[0] && s.label < r[1]) {
                                    s.label = r[1],
                                    r = i;
                                    break
                                }
                                if (r && s.label < r[2]) {
                                    s.label = r[2],
                                    s.ops.push(i);
                                    break
                                }
                                r[2] && s.ops.pop(),
                                s.trys.pop();
                                continue
                            }
                            i = t.call(e, s)
                        } catch (e) {
                            i = [6, e],
                            o = 0
                        } finally {
                            n = r = 0
                        }
                    if (5 & i[0])
                        throw i[1];
                    return {
                        value: i[0] ? i[1] : void 0,
                        done: !0
                    }
                }([i, a])
            }
        }
    }
      , Bn = function(e) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var t, n = e[Symbol.asyncIterator];
        return n ? n.call(e) : (e = "function" == typeof __values ? __values(e) : e[Symbol.iterator](),
        t = {},
        o("next"),
        o("throw"),
        o("return"),
        t[Symbol.asyncIterator] = function() {
            return this
        }
        ,
        t);
        function o(n) {
            t[n] = e[n] && function(t) {
                return new Promise((function(o, r) {
                    !function(e, t, n, o) {
                        Promise.resolve(o).then((function(t) {
                            e({
                                value: t,
                                done: n
                            })
                        }
                        ), t)
                    }(o, r, (t = e[n](t)).done, t.value)
                }
                ))
            }
        }
    }
      , Ln = function(e) {
        return this instanceof Ln ? (this.v = e,
        this) : new Ln(e)
    }
      , $n = new DataView(new ArrayBuffer(0))
      , On = new Uint8Array($n.buffer)
      , Fn = function() {
        try {
            $n.getInt8(0)
        } catch (e) {
            return e.constructor
        }
        throw new Error("never reached")
    }()
      , Hn = new Fn("Insufficient data")
      , jn = new Mn
      , Wn = function() {
        function e(e, t, n, o, r, i, s, a) {
            void 0 === e && (e = xn.defaultCodec),
            void 0 === t && (t = void 0),
            void 0 === n && (n = fn),
            void 0 === o && (o = fn),
            void 0 === r && (r = fn),
            void 0 === i && (i = fn),
            void 0 === s && (s = fn),
            void 0 === a && (a = jn),
            this.extensionCodec = e,
            this.context = t,
            this.maxStrLength = n,
            this.maxBinLength = o,
            this.maxArrayLength = r,
            this.maxMapLength = i,
            this.maxExtLength = s,
            this.keyDecoder = a,
            this.totalPos = 0,
            this.pos = 0,
            this.view = $n,
            this.bytes = On,
            this.headByte = -1,
            this.stack = []
        }
        return e.prototype.reinitializeState = function() {
            this.totalPos = 0,
            this.headByte = -1,
            this.stack.length = 0
        }
        ,
        e.prototype.setBuffer = function(e) {
            this.bytes = An(e),
            this.view = function(e) {
                if (e instanceof ArrayBuffer)
                    return new DataView(e);
                var t = An(e);
                return new DataView(t.buffer,t.byteOffset,t.byteLength)
            }(this.bytes),
            this.pos = 0
        }
        ,
        e.prototype.appendBuffer = function(e) {
            if (-1 !== this.headByte || this.hasRemaining(1)) {
                var t = this.bytes.subarray(this.pos)
                  , n = An(e)
                  , o = new Uint8Array(t.length + n.length);
                o.set(t),
                o.set(n, t.length),
                this.setBuffer(o)
            } else
                this.setBuffer(e)
        }
        ,
        e.prototype.hasRemaining = function(e) {
            return this.view.byteLength - this.pos >= e
        }
        ,
        e.prototype.createExtraByteError = function(e) {
            var t = this.view
              , n = this.pos;
            return new RangeError("Extra ".concat(t.byteLength - n, " of ").concat(t.byteLength, " byte(s) found at buffer[").concat(e, "]"))
        }
        ,
        e.prototype.decode = function(e) {
            this.reinitializeState(),
            this.setBuffer(e);
            var t = this.doDecodeSync();
            if (this.hasRemaining(1))
                throw this.createExtraByteError(this.pos);
            return t
        }
        ,
        e.prototype.decodeMulti = function(e) {
            return Un(this, (function(t) {
                switch (t.label) {
                case 0:
                    this.reinitializeState(),
                    this.setBuffer(e),
                    t.label = 1;
                case 1:
                    return this.hasRemaining(1) ? [4, this.doDecodeSync()] : [3, 3];
                case 2:
                    return t.sent(),
                    [3, 1];
                case 3:
                    return [2]
                }
            }
            ))
        }
        ,
        e.prototype.decodeAsync = function(e) {
            var t, n, o, r, i, s, a;
            return i = this,
            a = function() {
                var i, s, a, c, l, h, d, u;
                return Un(this, (function(p) {
                    switch (p.label) {
                    case 0:
                        i = !1,
                        p.label = 1;
                    case 1:
                        p.trys.push([1, 6, 7, 12]),
                        t = Bn(e),
                        p.label = 2;
                    case 2:
                        return [4, t.next()];
                    case 3:
                        if ((n = p.sent()).done)
                            return [3, 5];
                        if (a = n.value,
                        i)
                            throw this.createExtraByteError(this.totalPos);
                        this.appendBuffer(a);
                        try {
                            s = this.doDecodeSync(),
                            i = !0
                        } catch (e) {
                            if (!(e instanceof Fn))
                                throw e
                        }
                        this.totalPos += this.pos,
                        p.label = 4;
                    case 4:
                        return [3, 2];
                    case 5:
                        return [3, 12];
                    case 6:
                        return c = p.sent(),
                        o = {
                            error: c
                        },
                        [3, 12];
                    case 7:
                        return p.trys.push([7, , 10, 11]),
                        n && !n.done && (r = t.return) ? [4, r.call(t)] : [3, 9];
                    case 8:
                        p.sent(),
                        p.label = 9;
                    case 9:
                        return [3, 11];
                    case 10:
                        if (o)
                            throw o.error;
                        return [7];
                    case 11:
                        return [7];
                    case 12:
                        if (i) {
                            if (this.hasRemaining(1))
                                throw this.createExtraByteError(this.totalPos);
                            return [2, s]
                        }
                        throw h = (l = this).headByte,
                        d = l.pos,
                        u = l.totalPos,
                        new RangeError("Insufficient data in parsing ".concat(Nn(h), " at ").concat(u, " (").concat(d, " in the current buffer)"))
                    }
                }
                ))
            }
            ,
            new ((s = void 0) || (s = Promise))((function(e, t) {
                function n(e) {
                    try {
                        r(a.next(e))
                    } catch (e) {
                        t(e)
                    }
                }
                function o(e) {
                    try {
                        r(a.throw(e))
                    } catch (e) {
                        t(e)
                    }
                }
                function r(t) {
                    var r;
                    t.done ? e(t.value) : (r = t.value,
                    r instanceof s ? r : new s((function(e) {
                        e(r)
                    }
                    ))).then(n, o)
                }
                r((a = a.apply(i, [])).next())
            }
            ))
        }
        ,
        e.prototype.decodeArrayStream = function(e) {
            return this.decodeMultiAsync(e, !0)
        }
        ,
        e.prototype.decodeStream = function(e) {
            return this.decodeMultiAsync(e, !1)
        }
        ,
        e.prototype.decodeMultiAsync = function(e, t) {
            return function(n, o) {
                if (!Symbol.asyncIterator)
                    throw new TypeError("Symbol.asyncIterator is not defined.");
                var r, i = function() {
                    var n, o, r, i, s, a, c, l, h;
                    return Un(this, (function(d) {
                        switch (d.label) {
                        case 0:
                            n = t,
                            o = -1,
                            d.label = 1;
                        case 1:
                            d.trys.push([1, 13, 14, 19]),
                            r = Bn(e),
                            d.label = 2;
                        case 2:
                            return [4, Ln(r.next())];
                        case 3:
                            if ((i = d.sent()).done)
                                return [3, 12];
                            if (s = i.value,
                            t && 0 === o)
                                throw this.createExtraByteError(this.totalPos);
                            this.appendBuffer(s),
                            n && (o = this.readArraySize(),
                            n = !1,
                            this.complete()),
                            d.label = 4;
                        case 4:
                            d.trys.push([4, 9, , 10]),
                            d.label = 5;
                        case 5:
                            return [4, Ln(this.doDecodeSync())];
                        case 6:
                            return [4, d.sent()];
                        case 7:
                            return d.sent(),
                            0 == --o ? [3, 8] : [3, 5];
                        case 8:
                            return [3, 10];
                        case 9:
                            if (!((a = d.sent())instanceof Fn))
                                throw a;
                            return [3, 10];
                        case 10:
                            this.totalPos += this.pos,
                            d.label = 11;
                        case 11:
                            return [3, 2];
                        case 12:
                            return [3, 19];
                        case 13:
                            return c = d.sent(),
                            l = {
                                error: c
                            },
                            [3, 19];
                        case 14:
                            return d.trys.push([14, , 17, 18]),
                            i && !i.done && (h = r.return) ? [4, Ln(h.call(r))] : [3, 16];
                        case 15:
                            d.sent(),
                            d.label = 16;
                        case 16:
                            return [3, 18];
                        case 17:
                            if (l)
                                throw l.error;
                            return [7];
                        case 18:
                            return [7];
                        case 19:
                            return [2]
                        }
                    }
                    ))
                }
                .apply(n, o || []), s = [];
                return r = {},
                a("next"),
                a("throw"),
                a("return"),
                r[Symbol.asyncIterator] = function() {
                    return this
                }
                ,
                r;
                function a(e) {
                    i[e] && (r[e] = function(t) {
                        return new Promise((function(n, o) {
                            s.push([e, t, n, o]) > 1 || c(e, t)
                        }
                        ))
                    }
                    )
                }
                function c(e, t) {
                    try {
                        (n = i[e](t)).value instanceof Ln ? Promise.resolve(n.value.v).then(l, h) : d(s[0][2], n)
                    } catch (e) {
                        d(s[0][3], e)
                    }
                    var n
                }
                function l(e) {
                    c("next", e)
                }
                function h(e) {
                    c("throw", e)
                }
                function d(e, t) {
                    e(t),
                    s.shift(),
                    s.length && c(s[0][0], s[0][1])
                }
            }(this, arguments)
        }
        ,
        e.prototype.doDecodeSync = function() {
            e: for (; ; ) {
                var e = this.readHeadByte()
                  , t = void 0;
                if (e >= 224)
                    t = e - 256;
                else if (e < 192)
                    if (e < 128)
                        t = e;
                    else if (e < 144) {
                        if (0 != (o = e - 128)) {
                            this.pushMapState(o),
                            this.complete();
                            continue e
                        }
                        t = {}
                    } else if (e < 160) {
                        if (0 != (o = e - 144)) {
                            this.pushArrayState(o),
                            this.complete();
                            continue e
                        }
                        t = []
                    } else {
                        var n = e - 160;
                        t = this.decodeUtf8String(n, 0)
                    }
                else if (192 === e)
                    t = null;
                else if (194 === e)
                    t = !1;
                else if (195 === e)
                    t = !0;
                else if (202 === e)
                    t = this.readF32();
                else if (203 === e)
                    t = this.readF64();
                else if (204 === e)
                    t = this.readU8();
                else if (205 === e)
                    t = this.readU16();
                else if (206 === e)
                    t = this.readU32();
                else if (207 === e)
                    t = this.readU64();
                else if (208 === e)
                    t = this.readI8();
                else if (209 === e)
                    t = this.readI16();
                else if (210 === e)
                    t = this.readI32();
                else if (211 === e)
                    t = this.readI64();
                else if (217 === e)
                    n = this.lookU8(),
                    t = this.decodeUtf8String(n, 1);
                else if (218 === e)
                    n = this.lookU16(),
                    t = this.decodeUtf8String(n, 2);
                else if (219 === e)
                    n = this.lookU32(),
                    t = this.decodeUtf8String(n, 4);
                else if (220 === e) {
                    if (0 !== (o = this.readU16())) {
                        this.pushArrayState(o),
                        this.complete();
                        continue e
                    }
                    t = []
                } else if (221 === e) {
                    if (0 !== (o = this.readU32())) {
                        this.pushArrayState(o),
                        this.complete();
                        continue e
                    }
                    t = []
                } else if (222 === e) {
                    if (0 !== (o = this.readU16())) {
                        this.pushMapState(o),
                        this.complete();
                        continue e
                    }
                    t = {}
                } else if (223 === e) {
                    if (0 !== (o = this.readU32())) {
                        this.pushMapState(o),
                        this.complete();
                        continue e
                    }
                    t = {}
                } else if (196 === e) {
                    var o = this.lookU8();
                    t = this.decodeBinary(o, 1)
                } else if (197 === e)
                    o = this.lookU16(),
                    t = this.decodeBinary(o, 2);
                else if (198 === e)
                    o = this.lookU32(),
                    t = this.decodeBinary(o, 4);
                else if (212 === e)
                    t = this.decodeExtension(1, 0);
                else if (213 === e)
                    t = this.decodeExtension(2, 0);
                else if (214 === e)
                    t = this.decodeExtension(4, 0);
                else if (215 === e)
                    t = this.decodeExtension(8, 0);
                else if (216 === e)
                    t = this.decodeExtension(16, 0);
                else if (199 === e)
                    o = this.lookU8(),
                    t = this.decodeExtension(o, 1);
                else if (200 === e)
                    o = this.lookU16(),
                    t = this.decodeExtension(o, 2);
                else {
                    if (201 !== e)
                        throw new Dn("Unrecognized type byte: ".concat(Nn(e)));
                    o = this.lookU32(),
                    t = this.decodeExtension(o, 4)
                }
                this.complete();
                for (var r = this.stack; r.length > 0; ) {
                    var i = r[r.length - 1];
                    if (0 === i.type) {
                        if (i.array[i.position] = t,
                        i.position++,
                        i.position !== i.size)
                            continue e;
                        r.pop(),
                        t = i.array
                    } else {
                        if (1 === i.type) {
                            if ("string" != (s = typeof t) && "number" !== s)
                                throw new Dn("The type of key must be string or number but " + typeof t);
                            if ("__proto__" === t)
                                throw new Dn("The key __proto__ is not allowed");
                            i.key = t,
                            i.type = 2;
                            continue e
                        }
                        if (i.map[i.key] = t,
                        i.readCount++,
                        i.readCount !== i.size) {
                            i.key = null,
                            i.type = 1;
                            continue e
                        }
                        r.pop(),
                        t = i.map
                    }
                }
                return t
            }
            var s
        }
        ,
        e.prototype.readHeadByte = function() {
            return -1 === this.headByte && (this.headByte = this.readU8()),
            this.headByte
        }
        ,
        e.prototype.complete = function() {
            this.headByte = -1
        }
        ,
        e.prototype.readArraySize = function() {
            var e = this.readHeadByte();
            switch (e) {
            case 220:
                return this.readU16();
            case 221:
                return this.readU32();
            default:
                if (e < 160)
                    return e - 144;
                throw new Dn("Unrecognized array type byte: ".concat(Nn(e)))
            }
        }
        ,
        e.prototype.pushMapState = function(e) {
            if (e > this.maxMapLength)
                throw new Dn("Max length exceeded: map length (".concat(e, ") > maxMapLengthLength (").concat(this.maxMapLength, ")"));
            this.stack.push({
                type: 1,
                size: e,
                key: null,
                readCount: 0,
                map: {}
            })
        }
        ,
        e.prototype.pushArrayState = function(e) {
            if (e > this.maxArrayLength)
                throw new Dn("Max length exceeded: array length (".concat(e, ") > maxArrayLength (").concat(this.maxArrayLength, ")"));
            this.stack.push({
                type: 0,
                size: e,
                array: new Array(e),
                position: 0
            })
        }
        ,
        e.prototype.decodeUtf8String = function(e, t) {
            var n;
            if (e > this.maxStrLength)
                throw new Dn("Max length exceeded: UTF-8 byte length (".concat(e, ") > maxStrLength (").concat(this.maxStrLength, ")"));
            if (this.bytes.byteLength < this.pos + t + e)
                throw Hn;
            var o, r = this.pos + t;
            return o = this.stateIsMapKey() && (null === (n = this.keyDecoder) || void 0 === n ? void 0 : n.canBeCached(e)) ? this.keyDecoder.decode(this.bytes, r, e) : e > In ? function(e, t, n) {
                var o = e.subarray(t, t + n);
                return Cn.decode(o)
            }(this.bytes, r, e) : Sn(this.bytes, r, e),
            this.pos += t + e,
            o
        }
        ,
        e.prototype.stateIsMapKey = function() {
            return this.stack.length > 0 && 1 === this.stack[this.stack.length - 1].type
        }
        ,
        e.prototype.decodeBinary = function(e, t) {
            if (e > this.maxBinLength)
                throw new Dn("Max length exceeded: bin length (".concat(e, ") > maxBinLength (").concat(this.maxBinLength, ")"));
            if (!this.hasRemaining(e + t))
                throw Hn;
            var n = this.pos + t
              , o = this.bytes.subarray(n, n + e);
            return this.pos += t + e,
            o
        }
        ,
        e.prototype.decodeExtension = function(e, t) {
            if (e > this.maxExtLength)
                throw new Dn("Max length exceeded: ext length (".concat(e, ") > maxExtLength (").concat(this.maxExtLength, ")"));
            var n = this.view.getInt8(this.pos + t)
              , o = this.decodeBinary(e, t + 1);
            return this.extensionCodec.decode(o, n, this.context)
        }
        ,
        e.prototype.lookU8 = function() {
            return this.view.getUint8(this.pos)
        }
        ,
        e.prototype.lookU16 = function() {
            return this.view.getUint16(this.pos)
        }
        ,
        e.prototype.lookU32 = function() {
            return this.view.getUint32(this.pos)
        }
        ,
        e.prototype.readU8 = function() {
            var e = this.view.getUint8(this.pos);
            return this.pos++,
            e
        }
        ,
        e.prototype.readI8 = function() {
            var e = this.view.getInt8(this.pos);
            return this.pos++,
            e
        }
        ,
        e.prototype.readU16 = function() {
            var e = this.view.getUint16(this.pos);
            return this.pos += 2,
            e
        }
        ,
        e.prototype.readI16 = function() {
            var e = this.view.getInt16(this.pos);
            return this.pos += 2,
            e
        }
        ,
        e.prototype.readU32 = function() {
            var e = this.view.getUint32(this.pos);
            return this.pos += 4,
            e
        }
        ,
        e.prototype.readI32 = function() {
            var e = this.view.getInt32(this.pos);
            return this.pos += 4,
            e
        }
        ,
        e.prototype.readU64 = function() {
            var e, t, n = (e = this.view,
            t = this.pos,
            4294967296 * e.getUint32(t) + e.getUint32(t + 4));
            return this.pos += 8,
            n
        }
        ,
        e.prototype.readI64 = function() {
            var e = mn(this.view, this.pos);
            return this.pos += 8,
            e
        }
        ,
        e.prototype.readF32 = function() {
            var e = this.view.getFloat32(this.pos);
            return this.pos += 4,
            e
        }
        ,
        e.prototype.readF64 = function() {
            var e = this.view.getFloat64(this.pos);
            return this.pos += 8,
            e
        }
        ,
        e
    }();
    class zn {
        static write(e) {
            let t = e.byteLength || e.length;
            const n = [];
            do {
                let e = 127 & t;
                t >>= 7,
                t > 0 && (e |= 128),
                n.push(e)
            } while (t > 0);
            t = e.byteLength || e.length;
            const o = new Uint8Array(n.length + t);
            return o.set(n, 0),
            o.set(e, n.length),
            o.buffer
        }
        static parse(e) {
            const t = []
              , n = new Uint8Array(e)
              , o = [0, 7, 14, 21, 28];
            for (let r = 0; r < e.byteLength; ) {
                let i, s = 0, a = 0;
                do {
                    i = n[r + s],
                    a |= (127 & i) << o[s],
                    s++
                } while (s < Math.min(5, e.byteLength - r) && 128 & i);
                if (128 & i && s < 5)
                    throw new Error("Cannot read message size.");
                if (5 === s && i > 7)
                    throw new Error("Messages bigger than 2GB are not supported.");
                if (!(n.byteLength >= r + s + a))
                    throw new Error("Incomplete message.");
                t.push(n.slice ? n.slice(r + s, r + s + a) : n.subarray(r + s, r + s + a)),
                r = r + s + a
            }
            return t
        }
    }
    const qn = new Uint8Array([145, Ct.Ping]);
    class Jn {
        constructor(e) {
            this.name = "messagepack",
            this.version = 2,
            this.transferFormat = Qt.Binary,
            this._errorResult = 1,
            this._voidResult = 2,
            this._nonVoidResult = 3,
            e = e || {},
            this._encoder = new Pn(e.extensionCodec,e.context,e.maxDepth,e.initialBufferSize,e.sortKeys,e.forceFloat32,e.ignoreUndefined,e.forceIntegerToFloat),
            this._decoder = new Wn(e.extensionCodec,e.context,e.maxStrLength,e.maxBinLength,e.maxArrayLength,e.maxMapLength,e.maxExtLength)
        }
        parseMessages(e, t) {
            if (!(n = e) || "undefined" == typeof ArrayBuffer || !(n instanceof ArrayBuffer || n.constructor && "ArrayBuffer" === n.constructor.name))
                throw new Error("Invalid input for MessagePack hub protocol. Expected an ArrayBuffer.");
            var n;
            null === t && (t = kt.instance);
            const o = zn.parse(e)
              , r = [];
            for (const e of o) {
                const n = this._parseMessage(e, t);
                n && r.push(n)
            }
            return r
        }
        writeMessage(e) {
            switch (e.type) {
            case Ct.Invocation:
                return this._writeInvocation(e);
            case Ct.StreamInvocation:
                return this._writeStreamInvocation(e);
            case Ct.StreamItem:
                return this._writeStreamItem(e);
            case Ct.Completion:
                return this._writeCompletion(e);
            case Ct.Ping:
                return zn.write(qn);
            case Ct.CancelInvocation:
                return this._writeCancelInvocation(e);
            case Ct.Close:
                return this._writeClose();
            case Ct.Ack:
                return this._writeAck(e);
            case Ct.Sequence:
                return this._writeSequence(e);
            default:
                throw new Error("Invalid message type.")
            }
        }
        _parseMessage(e, t) {
            if (0 === e.length)
                throw new Error("Invalid payload.");
            const n = this._decoder.decode(e);
            if (0 === n.length || !(n instanceof Array))
                throw new Error("Invalid payload.");
            const o = n[0];
            switch (o) {
            case Ct.Invocation:
                return this._createInvocationMessage(this._readHeaders(n), n);
            case Ct.StreamItem:
                return this._createStreamItemMessage(this._readHeaders(n), n);
            case Ct.Completion:
                return this._createCompletionMessage(this._readHeaders(n), n);
            case Ct.Ping:
                return this._createPingMessage(n);
            case Ct.Close:
                return this._createCloseMessage(n);
            case Ct.Ack:
                return this._createAckMessage(n);
            case Ct.Sequence:
                return this._createSequenceMessage(n);
            default:
                return t.log(Et.Information, "Unknown message type '" + o + "' ignored."),
                null
            }
        }
        _createCloseMessage(e) {
            if (e.length < 2)
                throw new Error("Invalid payload for Close message.");
            return {
                allowReconnect: e.length >= 3 ? e[2] : void 0,
                error: e[1],
                type: Ct.Close
            }
        }
        _createPingMessage(e) {
            if (e.length < 1)
                throw new Error("Invalid payload for Ping message.");
            return {
                type: Ct.Ping
            }
        }
        _createInvocationMessage(e, t) {
            if (t.length < 5)
                throw new Error("Invalid payload for Invocation message.");
            const n = t[2];
            return n ? {
                arguments: t[4],
                headers: e,
                invocationId: n,
                streamIds: [],
                target: t[3],
                type: Ct.Invocation
            } : {
                arguments: t[4],
                headers: e,
                streamIds: [],
                target: t[3],
                type: Ct.Invocation
            }
        }
        _createStreamItemMessage(e, t) {
            if (t.length < 4)
                throw new Error("Invalid payload for StreamItem message.");
            return {
                headers: e,
                invocationId: t[2],
                item: t[3],
                type: Ct.StreamItem
            }
        }
        _createCompletionMessage(e, t) {
            if (t.length < 4)
                throw new Error("Invalid payload for Completion message.");
            const n = t[3];
            if (n !== this._voidResult && t.length < 5)
                throw new Error("Invalid payload for Completion message.");
            let o, r;
            switch (n) {
            case this._errorResult:
                o = t[4];
                break;
            case this._nonVoidResult:
                r = t[4]
            }
            return {
                error: o,
                headers: e,
                invocationId: t[2],
                result: r,
                type: Ct.Completion
            }
        }
        _createAckMessage(e) {
            if (e.length < 1)
                throw new Error("Invalid payload for Ack message.");
            return {
                sequenceId: e[1],
                type: Ct.Ack
            }
        }
        _createSequenceMessage(e) {
            if (e.length < 1)
                throw new Error("Invalid payload for Sequence message.");
            return {
                sequenceId: e[1],
                type: Ct.Sequence
            }
        }
        _writeInvocation(e) {
            let t;
            return t = e.streamIds ? this._encoder.encode([Ct.Invocation, e.headers || {}, e.invocationId || null, e.target, e.arguments, e.streamIds]) : this._encoder.encode([Ct.Invocation, e.headers || {}, e.invocationId || null, e.target, e.arguments]),
            zn.write(t.slice())
        }
        _writeStreamInvocation(e) {
            let t;
            return t = e.streamIds ? this._encoder.encode([Ct.StreamInvocation, e.headers || {}, e.invocationId, e.target, e.arguments, e.streamIds]) : this._encoder.encode([Ct.StreamInvocation, e.headers || {}, e.invocationId, e.target, e.arguments]),
            zn.write(t.slice())
        }
        _writeStreamItem(e) {
            const t = this._encoder.encode([Ct.StreamItem, e.headers || {}, e.invocationId, e.item]);
            return zn.write(t.slice())
        }
        _writeCompletion(e) {
            const t = e.error ? this._errorResult : void 0 !== e.result ? this._nonVoidResult : this._voidResult;
            let n;
            switch (t) {
            case this._errorResult:
                n = this._encoder.encode([Ct.Completion, e.headers || {}, e.invocationId, t, e.error]);
                break;
            case this._voidResult:
                n = this._encoder.encode([Ct.Completion, e.headers || {}, e.invocationId, t]);
                break;
            case this._nonVoidResult:
                n = this._encoder.encode([Ct.Completion, e.headers || {}, e.invocationId, t, e.result])
            }
            return zn.write(n.slice())
        }
        _writeCancelInvocation(e) {
            const t = this._encoder.encode([Ct.CancelInvocation, e.headers || {}, e.invocationId]);
            return zn.write(t.slice())
        }
        _writeClose() {
            const e = this._encoder.encode([Ct.Close, null]);
            return zn.write(e.slice())
        }
        _writeAck(e) {
            const t = this._encoder.encode([Ct.Ack, e.sequenceId]);
            return zn.write(t.slice())
        }
        _writeSequence(e) {
            const t = this._encoder.encode([Ct.Sequence, e.sequenceId]);
            return zn.write(t.slice())
        }
        _readHeaders(e) {
            const t = e[1];
            if ("object" != typeof t)
                throw new Error("Invalid headers.");
            return t
        }
    }
    const Vn = "function" == typeof TextDecoder ? new TextDecoder("utf-8") : null
      , Kn = Vn ? Vn.decode.bind(Vn) : function(e) {
        let t = 0;
        const n = e.length
          , o = []
          , r = [];
        for (; t < n; ) {
            const n = e[t++];
            if (0 === n)
                break;
            if (128 & n) {
                if (192 == (224 & n)) {
                    const r = 63 & e[t++];
                    o.push((31 & n) << 6 | r)
                } else if (224 == (240 & n)) {
                    const r = 63 & e[t++]
                      , i = 63 & e[t++];
                    o.push((31 & n) << 12 | r << 6 | i)
                } else if (240 == (248 & n)) {
                    let r = (7 & n) << 18 | (63 & e[t++]) << 12 | (63 & e[t++]) << 6 | 63 & e[t++];
                    r > 65535 && (r -= 65536,
                    o.push(r >>> 10 & 1023 | 55296),
                    r = 56320 | 1023 & r),
                    o.push(r)
                }
            } else
                o.push(n);
            o.length > 1024 && (r.push(String.fromCharCode.apply(null, o)),
            o.length = 0)
        }
        return r.push(String.fromCharCode.apply(null, o)),
        r.join("")
    }
      , Xn = Math.pow(2, 32)
      , Yn = Math.pow(2, 21) - 1;
    function Gn(e, t) {
        return e[t] | e[t + 1] << 8 | e[t + 2] << 16 | e[t + 3] << 24
    }
    function Qn(e, t) {
        return e[t] + (e[t + 1] << 8) + (e[t + 2] << 16) + (e[t + 3] << 24 >>> 0)
    }
    function Zn(e, t) {
        const n = Qn(e, t + 4);
        if (n > Yn)
            throw new Error(`Cannot read uint64 with high order part ${n}, because the result would exceed Number.MAX_SAFE_INTEGER.`);
        return n * Xn + Qn(e, t)
    }
    class eo {
        constructor(e) {
            this.batchData = e;
            const t = new ro(e);
            this.arrayRangeReader = new io(e),
            this.arrayBuilderSegmentReader = new so(e),
            this.diffReader = new to(e),
            this.editReader = new no(e,t),
            this.frameReader = new oo(e,t)
        }
        updatedComponents() {
            return Gn(this.batchData, this.batchData.length - 20)
        }
        referenceFrames() {
            return Gn(this.batchData, this.batchData.length - 16)
        }
        disposedComponentIds() {
            return Gn(this.batchData, this.batchData.length - 12)
        }
        disposedEventHandlerIds() {
            return Gn(this.batchData, this.batchData.length - 8)
        }
        updatedComponentsEntry(e, t) {
            const n = e + 4 * t;
            return Gn(this.batchData, n)
        }
        referenceFramesEntry(e, t) {
            return e + 20 * t
        }
        disposedComponentIdsEntry(e, t) {
            const n = e + 4 * t;
            return Gn(this.batchData, n)
        }
        disposedEventHandlerIdsEntry(e, t) {
            const n = e + 8 * t;
            return Zn(this.batchData, n)
        }
    }
    class to {
        constructor(e) {
            this.batchDataUint8 = e
        }
        componentId(e) {
            return Gn(this.batchDataUint8, e)
        }
        edits(e) {
            return e + 4
        }
        editsEntry(e, t) {
            return e + 16 * t
        }
    }
    class no {
        constructor(e, t) {
            this.batchDataUint8 = e,
            this.stringReader = t
        }
        editType(e) {
            return Gn(this.batchDataUint8, e)
        }
        siblingIndex(e) {
            return Gn(this.batchDataUint8, e + 4)
        }
        newTreeIndex(e) {
            return Gn(this.batchDataUint8, e + 8)
        }
        moveToSiblingIndex(e) {
            return Gn(this.batchDataUint8, e + 8)
        }
        removedAttributeName(e) {
            const t = Gn(this.batchDataUint8, e + 12);
            return this.stringReader.readString(t)
        }
    }
    class oo {
        constructor(e, t) {
            this.batchDataUint8 = e,
            this.stringReader = t
        }
        frameType(e) {
            return Gn(this.batchDataUint8, e)
        }
        subtreeLength(e) {
            return Gn(this.batchDataUint8, e + 4)
        }
        elementReferenceCaptureId(e) {
            const t = Gn(this.batchDataUint8, e + 4);
            return this.stringReader.readString(t)
        }
        componentId(e) {
            return Gn(this.batchDataUint8, e + 8)
        }
        elementName(e) {
            const t = Gn(this.batchDataUint8, e + 8);
            return this.stringReader.readString(t)
        }
        textContent(e) {
            const t = Gn(this.batchDataUint8, e + 4);
            return this.stringReader.readString(t)
        }
        markupContent(e) {
            const t = Gn(this.batchDataUint8, e + 4);
            return this.stringReader.readString(t)
        }
        attributeName(e) {
            const t = Gn(this.batchDataUint8, e + 4);
            return this.stringReader.readString(t)
        }
        attributeValue(e) {
            const t = Gn(this.batchDataUint8, e + 8);
            return this.stringReader.readString(t)
        }
        attributeEventHandlerId(e) {
            return Zn(this.batchDataUint8, e + 12)
        }
    }
    class ro {
        constructor(e) {
            this.batchDataUint8 = e,
            this.stringTableStartIndex = Gn(e, e.length - 4)
        }
        readString(e) {
            if (-1 === e)
                return null;
            {
                const n = Gn(this.batchDataUint8, this.stringTableStartIndex + 4 * e)
                  , o = function(e, t) {
                    let n = 0
                      , o = 0;
                    for (let r = 0; r < 4; r++) {
                        const i = e[t + r];
                        if (n |= (127 & i) << o,
                        i < 128)
                            break;
                        o += 7
                    }
                    return n
                }(this.batchDataUint8, n)
                  , r = n + ((t = o) < 128 ? 1 : t < 16384 ? 2 : t < 2097152 ? 3 : 4)
                  , i = new Uint8Array(this.batchDataUint8.buffer,this.batchDataUint8.byteOffset + r,o);
                return Kn(i)
            }
            var t
        }
    }
    class io {
        constructor(e) {
            this.batchDataUint8 = e
        }
        count(e) {
            return Gn(this.batchDataUint8, e)
        }
        values(e) {
            return e + 4
        }
    }
    class so {
        constructor(e) {
            this.batchDataUint8 = e
        }
        offset(e) {
            return 0
        }
        count(e) {
            return Gn(this.batchDataUint8, e)
        }
        values(e) {
            return e + 4
        }
    }
    class ao {
        constructor(e) {
            this.nextBatchId = 2,
            this.logger = e
        }
        async processBatch(e, t, n) {
            if (e < this.nextBatchId)
                return await this.completeBatch(n, e),
                void this.logger.log(Qe.Debug, `Batch ${e} already processed. Waiting for batch ${this.nextBatchId}.`);
            if (e > this.nextBatchId)
                return this.fatalError ? (this.logger.log(Qe.Debug, `Received a new batch ${e} but errored out on a previous batch ${this.nextBatchId - 1}`),
                void await n.send("OnRenderCompleted", this.nextBatchId - 1, this.fatalError.toString())) : void this.logger.log(Qe.Debug, `Waiting for batch ${this.nextBatchId}. Batch ${e} not processed.`);
            try {
                this.nextBatchId++,
                this.logger.log(Qe.Debug, `Applying batch ${e}.`),
                function(e, t) {
                    const n = fe[e];
                    if (!n)
                        throw new Error(`There is no browser renderer with ID ${e}.`);
                    const o = t.arrayRangeReader
                      , r = t.updatedComponents()
                      , i = o.values(r)
                      , s = o.count(r)
                      , a = t.referenceFrames()
                      , c = o.values(a)
                      , l = t.diffReader;
                    for (let e = 0; e < s; e++) {
                        const o = t.updatedComponentsEntry(i, e)
                          , r = l.componentId(o)
                          , s = l.edits(o);
                        n.updateComponent(t, r, s, c)
                    }
                    const h = t.disposedComponentIds()
                      , d = o.values(h)
                      , u = o.count(h);
                    for (let e = 0; e < u; e++) {
                        const o = t.disposedComponentIdsEntry(d, e);
                        n.disposeComponent(o)
                    }
                    const p = t.disposedEventHandlerIds()
                      , f = o.values(p)
                      , g = o.count(p);
                    for (let e = 0; e < g; e++) {
                        const o = t.disposedEventHandlerIdsEntry(f, e);
                        n.disposeEventHandler(o)
                    }
                    ye && (ye = !1,
                    window.scrollTo && window.scrollTo(0, 0))
                }(hn.Server, new eo(t)),
                await this.completeBatch(n, e)
            } catch (t) {
                throw this.fatalError = t.toString(),
                this.logger.log(Qe.Error, `There was an error applying batch ${e}.`),
                n.send("OnRenderCompleted", e, t.toString()),
                t
            }
        }
        getLastBatchid() {
            return this.nextBatchId - 1
        }
        async completeBatch(e, t) {
            try {
                await e.send("OnRenderCompleted", t, null)
            } catch {
                this.logger.log(Qe.Warning, `Failed to deliver completion notification for render '${t}'.`)
            }
        }
    }
    let co, lo, ho, uo, po, fo, go = !1;
    function mo() {
        const e = document.querySelector("#blazor-error-ui");
        e && (e.style.display = "block"),
        go || (go = !0,
        document.querySelectorAll("#blazor-error-ui .reload").forEach((e => {
            e.onclick = function(e) {
                location.reload(),
                e.preventDefault()
            }
        }
        )),
        document.querySelectorAll("#blazor-error-ui .dismiss").forEach((e => {
            e.onclick = function(e) {
                const t = document.querySelector("#blazor-error-ui");
                t && (t.style.display = "none"),
                e.preventDefault()
            }
        }
        )))
    }
    class yo {
        constructor(t, n, o, r) {
            this._firstUpdate = !0,
            this._renderingFailed = !1,
            this._disposed = !1,
            this._circuitId = void 0,
            this._applicationState = n,
            this._componentManager = t,
            this._options = o,
            this._logger = r,
            this._renderQueue = new ao(this._logger),
            this._dispatcher = e.attachDispatcher(this)
        }
        start() {
            if (this.isDisposedOrDisposing())
                throw new Error("Cannot start a disposed circuit.");
            return this._startPromise || (this._startPromise = this.startCore()),
            this._startPromise
        }
        updateRootComponents(e) {
            return this._firstUpdate ? (this._firstUpdate = !1,
            this._connection?.send("UpdateRootComponents", e, this._applicationState)) : this._connection?.send("UpdateRootComponents", e, "")
        }
        async startCore() {
            if (this._connection = await this.startConnection(),
            this._connection.state !== It.Connected)
                return !1;
            const e = JSON.stringify(this._componentManager.initialComponents.map((e => {
                return t = e,
                {
                    ...t,
                    start: void 0,
                    end: void 0
                };
                var t
            }
            )));
            if (this._circuitId = await this._connection.invoke("StartCircuit", Re.getBaseURI(), Re.getLocationHref(), e, this._applicationState || ""),
            !this._circuitId)
                return !1;
            for (const e of this._options.circuitHandlers)
                e.onCircuitOpened && e.onCircuitOpened();
            return !0
        }
        async startConnection() {
            const e = new Jn;
            e.name = "blazorpack";
            const t = (new ln).withUrl("_blazor").withHubProtocol(e);
            this._options.configureSignalR(t);
            const n = t.build();
            n.on("JS.AttachComponent", ( (e, t) => function(e, t, n) {
                let o = fe[e];
                o || (o = new he(e),
                fe[e] = o),
                o.attachRootComponentToLogicalElement(n, t, !1)
            }(hn.Server, this.resolveElement(t), e))),
            n.on("JS.BeginInvokeJS", this._dispatcher.beginInvokeJSFromDotNet.bind(this._dispatcher)),
            n.on("JS.EndInvokeDotNet", this._dispatcher.endInvokeDotNetFromJS.bind(this._dispatcher)),
            n.on("JS.ReceiveByteArray", this._dispatcher.receiveByteArray.bind(this._dispatcher)),
            n.on("JS.BeginTransmitStream", (e => {
                const t = new ReadableStream({
                    start: t => {
                        n.stream("SendDotNetStreamToJS", e).subscribe({
                            next: e => t.enqueue(e),
                            complete: () => t.close(),
                            error: e => t.error(e)
                        })
                    }
                });
                this._dispatcher.supplyDotNetStream(e, t)
            }
            )),
            n.on("JS.RenderBatch", (async (e, t) => {
                this._logger.log(Et.Debug, `Received render batch with id ${e} and ${t.byteLength} bytes.`),
                await this._renderQueue.processBatch(e, t, this._connection),
                this._componentManager.onAfterRenderBatch?.(hn.Server)
            }
            )),
            n.on("JS.EndUpdateRootComponents", (e => {
                this._componentManager.onAfterUpdateRootComponents?.(e)
            }
            )),
            n.on("JS.EndLocationChanging", Ge._internal.navigationManager.endLocationChanging),
            n.onclose((e => {
                this._interopMethodsForReconnection = function(e) {
                    const t = b.get(e);
                    if (!t)
                        throw new Error(`Interop methods are not registered for renderer ${e}`);
                    return b.delete(e),
                    t
                }(hn.Server),
                this._disposed || this._renderingFailed || this._options.reconnectionHandler.onConnectionDown(this._options.reconnectionOptions, e)
            }
            )),
            n.on("JS.Error", (e => {
                this._renderingFailed = !0,
                this.unhandledError(e),
                mo()
            }
            ));
            try {
                await n.start()
            } catch (e) {
                if (this.unhandledError(e),
                "FailedToNegotiateWithServerError" === e.errorType)
                    throw e;
                mo(),
                e.innerErrors && (e.innerErrors.some((e => "UnsupportedTransportError" === e.errorType && e.transport === Gt.WebSockets)) ? this._logger.log(Et.Error, "Unable to connect, please ensure you are using an updated browser that supports WebSockets.") : e.innerErrors.some((e => "FailedToStartTransportError" === e.errorType && e.transport === Gt.WebSockets)) ? this._logger.log(Et.Error, "Unable to connect, please ensure WebSockets are available. A VPN or proxy may be blocking the connection.") : e.innerErrors.some((e => "DisabledTransportError" === e.errorType && e.transport === Gt.LongPolling)) && this._logger.log(Et.Error, "Unable to initiate a SignalR connection to the server. This might be because the server is not configured to support WebSockets. For additional details, visit https://aka.ms/blazor-server-websockets-error."))
            }
            return n.connection?.features?.inherentKeepAlive && this._logger.log(Et.Warning, "Failed to connect via WebSockets, using the Long Polling fallback transport. This may be due to a VPN or proxy blocking the connection. To troubleshoot this, visit https://aka.ms/blazor-server-using-fallback-long-polling."),
            n
        }
        async disconnect() {
            await (this._connection?.stop())
        }
        async reconnect() {
            if (!this._circuitId)
                throw new Error("Circuit host not initialized.");
            return this._connection.state === It.Connected || (this._connection = await this.startConnection(),
            this._interopMethodsForReconnection && (C(hn.Server, this._interopMethodsForReconnection),
            this._interopMethodsForReconnection = void 0),
            !!await this._connection.invoke("ConnectCircuit", this._circuitId) && (this._options.reconnectionHandler.onConnectionUp(),
            !0))
        }
        beginInvokeDotNetFromJS(e, t, n, o, r) {
            this.throwIfDispatchingWhenDisposed(),
            this._connection.send("BeginInvokeDotNetFromJS", e ? e.toString() : null, t, n, o || 0, r)
        }
        endInvokeJSFromDotNet(e, t, n) {
            this.throwIfDispatchingWhenDisposed(),
            this._connection.send("EndInvokeJSFromDotNet", e, t, n)
        }
        sendByteArray(e, t) {
            this.throwIfDispatchingWhenDisposed(),
            this._connection.send("ReceiveByteArray", e, t)
        }
        throwIfDispatchingWhenDisposed() {
            if (this._disposed)
                throw new Error("The circuit associated with this dispatcher is no longer available.")
        }
        sendLocationChanged(e, t, n) {
            return this._connection.send("OnLocationChanged", e, t, n)
        }
        sendLocationChanging(e, t, n, o) {
            return this._connection.send("OnLocationChanging", e, t, n, o)
        }
        sendJsDataStream(e, t, n) {
            return function(e, t, n, o) {
                setTimeout((async () => {
                    let r = 5
                      , i = (new Date).valueOf();
                    try {
                        const s = t instanceof Blob ? t.size : t.byteLength;
                        let a = 0
                          , c = 0;
                        for (; a < s; ) {
                            const l = Math.min(o, s - a)
                              , h = await Ye(t, a, l);
                            if (r--,
                            r > 1)
                                await e.send("ReceiveJSDataChunk", n, c, h, null);
                            else {
                                if (!await e.invoke("ReceiveJSDataChunk", n, c, h, null))
                                    break;
                                const t = (new Date).valueOf()
                                  , o = t - i;
                                i = t,
                                r = Math.max(1, Math.round(500 / Math.max(1, o)))
                            }
                            a += l,
                            c++
                        }
                    } catch (t) {
                        await e.send("ReceiveJSDataChunk", n, -1, null, t.toString())
                    }
                }
                ), 0)
            }(this._connection, e, t, n)
        }
        resolveElement(e) {
            const t = function(e) {
                const t = p.get(e);
                if (t)
                    return p.delete(e),
                    t
            }(e);
            if (t)
                return $(t, !0);
            const n = Number.parseInt(e);
            if (!Number.isNaN(n))
                return function(e) {
                    const {start: t, end: n} = e
                      , o = t[L];
                    if (o) {
                        if (o !== e)
                            throw new Error("The start component comment was already associated with another component descriptor.");
                        return t
                    }
                    const r = t.parentNode;
                    if (!r)
                        throw new Error(`Comment not connected to the DOM ${t.textContent}`);
                    const i = $(r, !0)
                      , s = J(i);
                    t[B] = i,
                    t[L] = e;
                    const a = $(t);
                    if (n) {
                        const e = J(a)
                          , o = Array.prototype.indexOf.call(s, a) + 1;
                        let r = null;
                        for (; r !== n; ) {
                            const n = s.splice(o, 1)[0];
                            if (!n)
                                throw new Error("Could not find the end component comment in the parent logical node list");
                            n[B] = t,
                            e.push(n),
                            r = n
                        }
                    }
                    return a
                }(this._componentManager.resolveRootComponent(n));
            throw new Error(`Invalid sequence number or identifier '${e}'.`)
        }
        getRootComponentManager() {
            return this._componentManager
        }
        unhandledError(e) {
            this._logger.log(Et.Error, e),
            this.disconnect()
        }
        getDisconnectFormData() {
            const e = new FormData
              , t = this._circuitId;
            return e.append("circuitId", t),
            e
        }
        didRenderingFail() {
            return this._renderingFailed
        }
        isDisposedOrDisposing() {
            return void 0 !== this._disposePromise
        }
        sendDisconnectBeacon() {
            if (this._disposed)
                return;
            const e = this.getDisconnectFormData();
            this._disposed = navigator.sendBeacon("_blazor/disconnect", e)
        }
        dispose() {
            return this._disposePromise || (this._disposePromise = this.disposeCore()),
            this._disposePromise
        }
        async disposeCore() {
            if (!this._startPromise)
                return void (this._disposed = !0);
            await this._startPromise,
            this._disposed = !0,
            this._connection?.stop();
            const e = this.getDisconnectFormData();
            fetch("_blazor/disconnect", {
                method: "POST",
                body: e
            });
            for (const e of this._options.circuitHandlers)
                e.onCircuitClosed && e.onCircuitClosed()
        }
    }
    class vo {
        static{this.ReconnectOverlayClassName = "components-reconnect-overlay"
        }static{this.ReconnectDialogClassName = "components-reconnect-dialog"
        }static{this.ReconnectVisibleClassName = "components-reconnect-visible"
        }static{this.RejoiningAnimationClassName = "components-rejoining-animation"
        }static{this.AnimationRippleCount = 2
        }constructor(e, t, n) {
            this.document = t,
            this.logger = n,
            this.style = this.document.createElement("style"),
            this.style.innerHTML = vo.Css,
            this.overlay = this.document.createElement("div"),
            this.overlay.className = vo.ReconnectOverlayClassName,
            this.host = this.document.createElement("div"),
            this.host.id = e;
            const o = this.host.attachShadow({
                mode: "open"
            });
            this.dialog = t.createElement("div"),
            this.dialog.className = vo.ReconnectDialogClassName,
            o.appendChild(this.style),
            o.appendChild(this.overlay),
            this.rejoiningAnimation = t.createElement("div"),
            this.rejoiningAnimation.className = vo.RejoiningAnimationClassName;
            for (let e = 0; e < vo.AnimationRippleCount; e++) {
                const e = t.createElement("div");
                this.rejoiningAnimation.appendChild(e)
            }
            this.status = t.createElement("p"),
            this.status.innerHTML = "",
            this.reloadButton = t.createElement("button"),
            this.reloadButton.style.display = "none",
            this.reloadButton.innerHTML = "Retry",
            this.reloadButton.addEventListener("click", this.retry.bind(this)),
            this.dialog.appendChild(this.rejoiningAnimation),
            this.dialog.appendChild(this.status),
            this.dialog.appendChild(this.reloadButton),
            this.overlay.appendChild(this.dialog),
            this.retryWhenDocumentBecomesVisible = () => {
                "visible" === this.document.visibilityState && this.retry()
            }
        }
        show() {
            this.document.contains(this.host) || this.document.body.appendChild(this.host),
            this.reloadButton.style.display = "none",
            this.rejoiningAnimation.style.display = "block",
            this.status.innerHTML = "Rejoining the server...",
            this.host.style.display = "block",
            this.overlay.classList.add(vo.ReconnectVisibleClassName)
        }
        update(e, t) {
            if (1 === e || 0 === t)
                this.status.innerHTML = "Rejoining the server...";
            else {
                const e = 1 === t ? "second" : "seconds";
                this.status.innerHTML = `Rejoin failed... trying again in ${t} ${e}`
            }
        }
        hide() {
            this.host.style.display = "none",
            this.overlay.classList.remove(vo.ReconnectVisibleClassName)
        }
        failed() {
            this.reloadButton.style.display = "block",
            this.rejoiningAnimation.style.display = "none",
            this.status.innerHTML = "Failed to rejoin.<br />Please retry or reload the page.",
            this.document.addEventListener("visibilitychange", this.retryWhenDocumentBecomesVisible)
        }
        rejected() {
            location.reload()
        }
        async retry() {
            this.document.removeEventListener("visibilitychange", this.retryWhenDocumentBecomesVisible),
            this.show();
            try {
                await Ge.reconnect() || this.rejected()
            } catch (e) {
                this.logger.log(Qe.Error, e),
                this.failed()
            }
        }
        static{this.Css = `\n    .${this.ReconnectOverlayClassName} {\n      position: fixed;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      z-index: 10000;\n      display: none;\n      overflow: hidden;\n      animation: components-reconnect-fade-in;\n    }\n\n    .${this.ReconnectOverlayClassName}.${this.ReconnectVisibleClassName} {\n      display: block;\n    }\n\n    .${this.ReconnectOverlayClassName}::before {\n      content: '';\n      background-color: rgba(0, 0, 0, 0.4);\n      position: absolute;\n      top: 0;\n      bottom: 0;\n      left: 0;\n      right: 0;\n      animation: components-reconnect-fadeInOpacity 0.5s ease-in-out;\n      opacity: 1;\n    }\n\n    .${this.ReconnectOverlayClassName} p {\n      margin: 0;\n      text-align: center;\n    }\n\n    .${this.ReconnectOverlayClassName} button {\n      border: 0;\n      background-color: #6b9ed2;\n      color: white;\n      padding: 4px 24px;\n      border-radius: 4px;\n    }\n\n    .${this.ReconnectOverlayClassName} button:hover {\n      background-color: #3b6ea2;\n    }\n\n    .${this.ReconnectOverlayClassName} button:active {\n      background-color: #6b9ed2;\n    }\n\n    .${this.ReconnectDialogClassName} {\n      position: relative;\n      background-color: white;\n      width: 20rem;\n      margin: 20vh auto;\n      padding: 2rem;\n      border-radius: 0.5rem;\n      box-shadow: 0 3px 6px 2px rgba(0, 0, 0, 0.3);\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 1rem;\n      opacity: 0;\n      animation: components-reconnect-slideUp 1.5s cubic-bezier(.05, .89, .25, 1.02) 0.3s, components-reconnect-fadeInOpacity 0.5s ease-out 0.3s;\n      animation-fill-mode: forwards;\n      z-index: 10001;\n    }\n\n    .${this.RejoiningAnimationClassName} {\n      display: block;\n      position: relative;\n      width: 80px;\n      height: 80px;\n    }\n\n    .${this.RejoiningAnimationClassName} div {\n      position: absolute;\n      border: 3px solid #0087ff;\n      opacity: 1;\n      border-radius: 50%;\n      animation: ${this.RejoiningAnimationClassName} 1.5s cubic-bezier(0, 0.2, 0.8, 1) infinite;\n    }\n\n    .${this.RejoiningAnimationClassName} div:nth-child(2) {\n      animation-delay: -0.5s;\n    }\n\n    @keyframes ${this.RejoiningAnimationClassName} {\n      0% {\n        top: 40px;\n        left: 40px;\n        width: 0;\n        height: 0;\n        opacity: 0;\n      }\n\n      4.9% {\n        top: 40px;\n        left: 40px;\n        width: 0;\n        height: 0;\n        opacity: 0;\n      }\n\n      5% {\n        top: 40px;\n        left: 40px;\n        width: 0;\n        height: 0;\n        opacity: 1;\n      }\n\n      100% {\n        top: 0px;\n        left: 0px;\n        width: 80px;\n        height: 80px;\n        opacity: 0;\n      }\n    }\n\n    @keyframes components-reconnect-fadeInOpacity {\n      0% {\n        opacity: 0;\n      }\n\n      100% {\n        opacity: 1;\n      }\n    }\n\n    @keyframes components-reconnect-slideUp {\n      0% {\n        transform: translateY(30px) scale(0.95);\n      }\n\n      100% {\n        transform: translateY(0);\n      }\n    }\n  `
        }
    }
    class wo {
        static{this.ShowClassName = "components-reconnect-show"
        }static{this.HideClassName = "components-reconnect-hide"
        }static{this.FailedClassName = "components-reconnect-failed"
        }static{this.RejectedClassName = "components-reconnect-rejected"
        }static{this.MaxRetriesId = "components-reconnect-max-retries"
        }static{this.CurrentAttemptId = "components-reconnect-current-attempt"
        }static{this.SecondsToNextAttemptId = "components-seconds-to-next-attempt"
        }constructor(e, t, n) {
            if (this.dialog = e,
            this.document = t,
            this.document = t,
            void 0 !== n) {
                const e = this.document.getElementById(wo.MaxRetriesId);
                e && (e.innerText = n.toString())
            }
        }
        show() {
            this.removeClasses(),
            this.dialog.classList.add(wo.ShowClassName)
        }
        update(e, t) {
            const n = this.document.getElementById(wo.CurrentAttemptId);
            n && (n.innerText = e.toString());
            const o = this.document.getElementById(wo.SecondsToNextAttemptId);
            o && (o.innerText = t.toString())
        }
        hide() {
            this.removeClasses(),
            this.dialog.classList.add(wo.HideClassName)
        }
        failed() {
            this.removeClasses(),
            this.dialog.classList.add(wo.FailedClassName)
        }
        rejected() {
            this.removeClasses(),
            this.dialog.classList.add(wo.RejectedClassName)
        }
        removeClasses() {
            this.dialog.classList.remove(wo.ShowClassName, wo.HideClassName, wo.FailedClassName, wo.RejectedClassName)
        }
    }
    class _o {
        constructor(e, t, n) {
            this._currentReconnectionProcess = null,
            this._logger = e,
            this._reconnectionDisplay = t,
            this._reconnectCallback = n || Ge.reconnect
        }
        onConnectionDown(e, t) {
            if (!this._reconnectionDisplay) {
                const t = document.getElementById(e.dialogId);
                this._reconnectionDisplay = t ? new wo(t,document,e.maxRetries) : new vo(e.dialogId,document,this._logger)
            }
            this._currentReconnectionProcess || (this._currentReconnectionProcess = new bo(e,this._logger,this._reconnectCallback,this._reconnectionDisplay))
        }
        onConnectionUp() {
            this._currentReconnectionProcess && (this._currentReconnectionProcess.dispose(),
            this._currentReconnectionProcess = null)
        }
    }
    class bo {
        static{this.MaximumFirstRetryInterval = 3e3
        }constructor(e, t, n, o) {
            this.logger = t,
            this.reconnectCallback = n,
            this.isDisposed = !1,
            this.reconnectDisplay = o,
            this.reconnectDisplay.show(),
            this.attemptPeriodicReconnection(e)
        }
        dispose() {
            this.isDisposed = !0,
            this.reconnectDisplay.hide()
        }
        async attemptPeriodicReconnection(e) {
            for (let t = 0; void 0 === e.maxRetries || t < e.maxRetries; t++) {
                let n;
                if ("function" == typeof e.retryIntervalMilliseconds) {
                    const o = e.retryIntervalMilliseconds(t);
                    if (null == o)
                        break;
                    n = o
                } else
                    n = 0 === t && e.retryIntervalMilliseconds > bo.MaximumFirstRetryInterval ? bo.MaximumFirstRetryInterval : e.retryIntervalMilliseconds;
                if (await this.runTimer(n, 1e3, (e => {
                    this.reconnectDisplay.update(t + 1, Math.round(e / 1e3))
                }
                )),
                this.isDisposed)
                    break;
                try {
                    return await this.reconnectCallback() ? void 0 : void this.reconnectDisplay.rejected()
                } catch (e) {
                    this.logger.log(Qe.Error, e)
                }
            }
            this.reconnectDisplay.failed()
        }
        async runTimer(e, t, n) {
            if (e <= 0)
                return void n(0);
            let o, r, i = Date.now();
            n(e);
            const s = () => {
                if (this.isDisposed)
                    return void r();
                const a = Date.now()
                  , c = a - i;
                i = a;
                const l = Math.max(1, Math.floor(c / t))
                  , h = t * l;
                if ((e -= h) < Number.EPSILON)
                    return n(0),
                    void r();
                const d = Math.min(e, t - (c - h));
                n(e),
                o = setTimeout(s, d)
            }
              , a = () => {
                "visible" === document.visibilityState && (clearTimeout(o),
                n(0),
                r())
            }
            ;
            o = setTimeout(s, t),
            document.addEventListener("visibilitychange", a),
            await new Promise((e => r = e)),
            document.removeEventListener("visibilitychange", a)
        }
    }
    class So {
        constructor(e=!0, t, n, o=0) {
            this.singleRuntime = e,
            this.logger = t,
            this.webRendererId = o,
            this.afterStartedCallbacks = [],
            n && this.afterStartedCallbacks.push(...n)
        }
        async importInitializersAsync(e, t) {
            await Promise.all(e.map((e => async function(e, n) {
                const o = function(e) {
                    const t = document.baseURI;
                    return t.endsWith("/") ? `${t}${e}` : `${t}/${e}`
                }(n)
                  , r = await import(o);
                if (void 0 !== r) {
                    if (e.singleRuntime) {
                        const {beforeStart: n, afterStarted: o, beforeWebAssemblyStart: s, afterWebAssemblyStarted: a, beforeServerStart: c, afterServerStarted: l} = r;
                        let h = n;
                        e.webRendererId === hn.Server && c && (h = c),
                        e.webRendererId === hn.WebAssembly && s && (h = s);
                        let d = o;
                        return e.webRendererId === hn.Server && l && (d = l),
                        e.webRendererId === hn.WebAssembly && a && (d = a),
                        i(e, h, d, t)
                    }
                    return function(e, t, n) {
                        const r = n[0]
                          , {beforeStart: s, afterStarted: a, beforeWebStart: c, afterWebStarted: l, beforeWebAssemblyStart: h, afterWebAssemblyStarted: d, beforeServerStart: u, afterServerStarted: p} = t
                          , f = !(c || l || h || d || u || p || !s && !a)
                          , g = f && r.enableClassicInitializers;
                        if (f && !r.enableClassicInitializers)
                            e.logger?.log(Qe.Warning, `Initializer '${o}' will be ignored because multiple runtimes are available. Use 'before(Web|WebAssembly|Server)Start' and 'after(Web|WebAssembly|Server)Started' instead.`);
                        else if (g)
                            return i(e, s, a, n);
                        if (function(e) {
                            e.webAssembly ? e.webAssembly.initializers || (e.webAssembly.initializers = {
                                beforeStart: [],
                                afterStarted: []
                            }) : e.webAssembly = {
                                initializers: {
                                    beforeStart: [],
                                    afterStarted: []
                                }
                            },
                            e.circuit ? e.circuit.initializers || (e.circuit.initializers = {
                                beforeStart: [],
                                afterStarted: []
                            }) : e.circuit = {
                                initializers: {
                                    beforeStart: [],
                                    afterStarted: []
                                }
                            }
                        }(r),
                        h && r.webAssembly.initializers.beforeStart.push(h),
                        d && r.webAssembly.initializers.afterStarted.push(d),
                        u && r.circuit.initializers.beforeStart.push(u),
                        p && r.circuit.initializers.afterStarted.push(p),
                        l && e.afterStartedCallbacks.push(l),
                        c)
                            return c(r)
                    }(e, r, t)
                }
                function i(e, t, n, o) {
                    if (n && e.afterStartedCallbacks.push(n),
                    t)
                        return t(...o)
                }
            }(this, e))))
        }
        async invokeAfterStartedCallbacks(e) {
            const t = (n = this.webRendererId,
            E.get(n)?.[1]);
            var n;
            t && await t,
            await Promise.all(this.afterStartedCallbacks.map((t => t(e))))
        }
    }
    function Eo(e) {
        if (void 0 !== fo)
            throw new Error("Blazor Server has already started.");
        return fo = new Promise(Co.bind(null, e)),
        fo
    }
    async function Co(e, t, n) {
        await co;
        const o = await async function(e) {
            if (e.initializers)
                return await Promise.all(e.initializers.beforeStart.map((t => t(e)))),
                new So(!1,void 0,e.initializers.afterStarted,hn.Server);
            const t = await fetch("_blazor/initializers", {
                method: "GET",
                credentials: "include",
                cache: "no-cache"
            })
              , n = await t.json()
              , o = new So(!0,void 0,void 0,hn.Server);
            return await o.importInitializersAsync(n, [e]),
            o
        }(uo);
        if (lo = ot(document) || "",
        po = new tt(uo.logLevel),
        ho = new yo(e,lo,uo,po),
        po.log(Qe.Information, "Starting up Blazor server-side application."),
        Ge.reconnect = async () => !(ho.didRenderingFail() || !await ho.reconnect() && (po.log(Qe.Information, "Reconnection attempt to the circuit was rejected by the server. This may indicate that the associated state is no longer available on the server."),
        1)),
        Ge.defaultReconnectionHandler = new _o(po),
        uo.reconnectionHandler = uo.reconnectionHandler || Ge.defaultReconnectionHandler,
        Ge._internal.navigationManager.listenForNavigationEvents(hn.Server, ( (e, t, n) => ho.sendLocationChanged(e, t, n)), ( (e, t, n, o) => ho.sendLocationChanging(e, t, n, o))),
        Ge._internal.forceCloseConnection = () => ho.disconnect(),
        Ge._internal.sendJSDataStream = (e, t, n) => ho.sendJsDataStream(e, t, n),
        !await ho.start())
            return po.log(Qe.Error, "Failed to start the circuit."),
            void t();
        const r = () => {
            ho.sendDisconnectBeacon()
        }
        ;
        Ge.disconnect = r,
        window.addEventListener("unload", r, {
            capture: !1,
            once: !0
        }),
        po.log(Qe.Information, "Blazor server-side application started."),
        o.invokeAfterStartedCallbacks(Ge),
        t()
    }
    class Io {
        constructor(e) {
            this.initialComponents = e
        }
        resolveRootComponent(e) {
            return this.initialComponents[e]
        }
    }
    class ko {
        constructor() {
            this._eventListeners = new Map
        }
        static create(e) {
            const t = new ko;
            return e.addEventListener = t.addEventListener.bind(t),
            e.removeEventListener = t.removeEventListener.bind(t),
            t
        }
        addEventListener(e, t) {
            let n = this._eventListeners.get(e);
            n || (n = new Set,
            this._eventListeners.set(e, n)),
            n.add(t)
        }
        removeEventListener(e, t) {
            this._eventListeners.get(e)?.delete(t)
        }
        dispatchEvent(e, t) {
            const n = this._eventListeners.get(e);
            if (!n)
                return;
            const o = {
                ...t,
                type: e
            };
            for (const e of n)
                e(o)
        }
    }
    let To = !1;
    function Do(e) {
        if (To)
            throw new Error("Blazor has already started.");
        To = !0;
        const t = Ze(e);
        !function(e) {
            if (uo)
                throw new Error("Circuit options have already been configured.");
            co = async function(e) {
                const t = await e;
                uo = Ze(t)
            }(e)
        }(Promise.resolve(t || {})),
        ko.create(Ge);
        const n = function(e) {
            return it(e, "server").sort(( (e, t) => e.sequence - t.sequence))
        }(document);
        return Eo(new Io(n))
    }
    Ge.start = Do,
    window.DotNet = e,
    document && document.currentScript && "false" !== document.currentScript.getAttribute("autostart") && Do()
}();
