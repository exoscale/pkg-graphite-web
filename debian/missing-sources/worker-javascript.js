function initBaseUrls(a) {
    require.tlns = a
}

function initSender() {
    var a = require("pilot/event_emitter").EventEmitter,
        b = require("pilot/oop"),
        c = function() {};
    return function() {
        b.implement(this, a), this.callback = function(a, b) {
            postMessage({
                type: "call",
                id: b,
                data: a
            })
        }, this.emit = function(a, b) {
            postMessage({
                type: "event",
                name: a,
                data: b
            })
        }
    }.call(c.prototype), new c
}
var console = {
        log: function(a) {
            postMessage({
                type: "log",
                data: a
            })
        }
    },
    window = {
        console: console
    },
    require = function(a) {
        var b = require.modules[a];
        if (b) return b.initialized || (b.exports = b.factory().exports, b.initialized = !0), b.exports;
        var c = a.split("/");
        return c[0] = require.tlns[c[0]] || c[0], path = c.join("/") + ".js", require.id = a, importScripts(path), require(a)
    };
require.modules = {}, require.tlns = {};
var define = function(a, b, c) {
        arguments.length == 2 ? c = b : arguments.length == 1 && (c = a, a = require.id);
        if (a.indexOf("text!") === 0) return;
        require.modules[a] = {
            factory: function() {
                var a = {
                        exports: {}
                    },
                    b = c(require, a.exports, a);
                return b && (a.exports = b), a
            }
        }
    },
    main, sender;
onmessage = function(a) {
    var b = a.data;
    if (b.command) main[b.command].apply(main, b.args);
    else if (b.init) {
        initBaseUrls(b.tlns), require("pilot/fixoldbrowsers"), sender = initSender();
        var c = require(b.module)[b.classname];
        main = new c(sender)
    } else b.event && sender && sender._dispatchEvent(b.event, b.data)
}, define("pilot/fixoldbrowsers", ["require", "exports", "module", "pilot/regexp", "pilot/es5-shim"], function(a, b, c) {
    a("pilot/regexp"), a("pilot/es5-shim")
}), define("pilot/regexp", ["require", "exports", "module"], function(a, b, c) {
    function g(a) {
        return (a.global ? "g" : "") + (a.ignoreCase ? "i" : "") + (a.multiline ? "m" : "") + (a.extended ? "x" : "") + (a.sticky ? "y" : "")
    }

    function h(a, b, c) {
        if (Array.prototype.indexOf) return a.indexOf(b, c);
        for (var d = c || 0; d < a.length; d++)
            if (a[d] === b) return d;
        return -1
    }
    var d = {
            exec: RegExp.prototype.exec,
            test: RegExp.prototype.test,
            match: String.prototype.match,
            replace: String.prototype.replace,
            split: String.prototype.split
        },
        e = d.exec.call(/()??/, "")[1] === undefined,
        f = function() {
            var a = /^/g;
            return d.test.call(a, ""), !a.lastIndex
        }();
    RegExp.prototype.exec = function(a) {
        var b = d.exec.apply(this, arguments),
            c, i;
        if (b) {
            !e && b.length > 1 && h(b, "") > -1 && (i = RegExp(this.source, d.replace.call(g(this), "g", "")), d.replace.call(a.slice(b.index), i, function() {
                for (var a = 1; a < arguments.length - 2; a++) arguments[a] === undefined && (b[a] = undefined)
            }));
            if (this._xregexp && this._xregexp.captureNames)
                for (var j = 1; j < b.length; j++) c = this._xregexp.captureNames[j - 1], c && (b[c] = b[j]);
            !f && this.global && !b[0].length && this.lastIndex > b.index && this.lastIndex--
        }
        return b
    }, f || (RegExp.prototype.test = function(a) {
        var b = d.exec.call(this, a);
        return b && this.global && !b[0].length && this.lastIndex > b.index && this.lastIndex--, !!b
    })
}), define("pilot/es5-shim", ["require", "exports", "module"], function(a, b, c) {
    function p(a) {
        try {
            return Object.defineProperty(a, "sentinel", {}), "sentinel" in a
        } catch (b) {}
    }
    Function.prototype.bind || (Function.prototype.bind = function(a) {
        var b = this;
        if (typeof b != "function") throw new TypeError;
        var c = g.call(arguments, 1),
            d = function() {
                if (this instanceof d) {
                    var e = function() {};
                    e.prototype = b.prototype;
                    var f = new e,
                        h = b.apply(f, c.concat(g.call(arguments)));
                    return h !== null && Object(h) === h ? h : f
                }
                return b.apply(a, c.concat(g.call(arguments)))
            };
        return d
    });
    var d = Function.prototype.call,
        e = Array.prototype,
        f = Object.prototype,
        g = e.slice,
        h = d.bind(f.toString),
        i = d.bind(f.hasOwnProperty),
        j, k, l, m, n;
    if (n = i(f, "__defineGetter__")) j = d.bind(f.__defineGetter__), k = d.bind(f.__defineSetter__), l = d.bind(f.__lookupGetter__), m = d.bind(f.__lookupSetter__);
    Array.isArray || (Array.isArray = function(a) {
        return h(a) == "[object Array]"
    }), Array.prototype.forEach || (Array.prototype.forEach = function(a) {
        var b = G(this),
            c = arguments[1],
            d = 0,
            e = b.length >>> 0;
        if (h(a) != "[object Function]") throw new TypeError;
        while (d < e) d in b && a.call(c, b[d], d, b), d++
    }), Array.prototype.map || (Array.prototype.map = function(a) {
        var b = G(this),
            c = b.length >>> 0,
            d = Array(c),
            e = arguments[1];
        if (h(a) != "[object Function]") throw new TypeError;
        for (var f = 0; f < c; f++) f in b && (d[f] = a.call(e, b[f], f, b));
        return d
    }), Array.prototype.filter || (Array.prototype.filter = function(a) {
        var b = G(this),
            c = b.length >>> 0,
            d = [],
            e = arguments[1];
        if (h(a) != "[object Function]") throw new TypeError;
        for (var f = 0; f < c; f++) f in b && a.call(e, b[f], f, b) && d.push(b[f]);
        return d
    }), Array.prototype.every || (Array.prototype.every = function(a) {
        var b = G(this),
            c = b.length >>> 0,
            d = arguments[1];
        if (h(a) != "[object Function]") throw new TypeError;
        for (var e = 0; e < c; e++)
            if (e in b && !a.call(d, b[e], e, b)) return !1;
        return !0
    }), Array.prototype.some || (Array.prototype.some = function(a) {
        var b = G(this),
            c = b.length >>> 0,
            d = arguments[1];
        if (h(a) != "[object Function]") throw new TypeError;
        for (var e = 0; e < c; e++)
            if (e in b && a.call(d, b[e], e, b)) return !0;
        return !1
    }), Array.prototype.reduce || (Array.prototype.reduce = function(a) {
        var b = G(this),
            c = b.length >>> 0;
        if (h(a) != "[object Function]") throw new TypeError;
        if (!c && arguments.length == 1) throw new TypeError;
        var d = 0,
            e;
        if (arguments.length >= 2) e = arguments[1];
        else
            do {
                if (d in b) {
                    e = b[d++];
                    break
                }
                if (++d >= c) throw new TypeError
            } while (!0);
        for (; d < c; d++) d in b && (e = a.call(void 0, e, b[d], d, b));
        return e
    }), Array.prototype.reduceRight || (Array.prototype.reduceRight = function(a) {
        var b = G(this),
            c = b.length >>> 0;
        if (h(a) != "[object Function]") throw new TypeError;
        if (!c && arguments.length == 1) throw new TypeError;
        var d, e = c - 1;
        if (arguments.length >= 2) d = arguments[1];
        else
            do {
                if (e in b) {
                    d = b[e--];
                    break
                }
                if (--e < 0) throw new TypeError
            } while (!0);
        do e in this && (d = a.call(void 0, d, b[e], e, b)); while (e--);
        return d
    }), Array.prototype.indexOf || (Array.prototype.indexOf = function(a) {
        var b = G(this),
            c = b.length >>> 0;
        if (!c) return -1;
        var d = 0;
        arguments.length > 1 && (d = E(arguments[1])), d = d >= 0 ? d : Math.max(0, c + d);
        for (; d < c; d++)
            if (d in b && b[d] === a) return d;
        return -1
    }), Array.prototype.lastIndexOf || (Array.prototype.lastIndexOf = function(a) {
        var b = G(this),
            c = b.length >>> 0;
        if (!c) return -1;
        var d = c - 1;
        arguments.length > 1 && (d = Math.min(d, E(arguments[1]))), d = d >= 0 ? d : c - Math.abs(d);
        for (; d >= 0; d--)
            if (d in b && a === b[d]) return d;
        return -1
    }), Object.getPrototypeOf || (Object.getPrototypeOf = function(a) {
        return a.__proto__ || (a.constructor ? a.constructor.prototype : f)
    });
    if (!Object.getOwnPropertyDescriptor) {
        var o = "Object.getOwnPropertyDescriptor called on a non-object: ";
        Object.getOwnPropertyDescriptor = function(a, b) {
            if (typeof a != "object" && typeof a != "function" || a === null) throw new TypeError(o + a);
            if (!i(a, b)) return;
            var c, d, e;
            c = {
                enumerable: !0,
                configurable: !0
            };
            if (n) {
                var g = a.__proto__;
                a.__proto__ = f;
                var d = l(a, b),
                    e = m(a, b);
                a.__proto__ = g;
                if (d || e) return d && (c.get = d), e && (c.set = e), c
            }
            return c.value = a[b], c
        }
    }
    Object.getOwnPropertyNames || (Object.getOwnPropertyNames = function(a) {
        return Object.keys(a)
    }), Object.create || (Object.create = function(a, b) {
        var c;
        if (a === null) c = {
            "__proto__": null
        };
        else {
            if (typeof a != "object") throw new TypeError("typeof prototype[" + typeof a + "] != 'object'");
            var d = function() {};
            d.prototype = a, c = new d, c.__proto__ = a
        }
        return b !== void 0 && Object.defineProperties(c, b), c
    });
    if (Object.defineProperty) {
        var q = p({}),
            r = typeof document == "undefined" || p(document.createElement("div"));
        if (!q || !r) var s = Object.defineProperty
    }
    if (!Object.defineProperty || s) {
        var t = "Property description must be an object: ",
            u = "Object.defineProperty called on non-object: ",
            v = "getters & setters can not be defined on this javascript engine";
        Object.defineProperty = function(a, b, c) {
            if (typeof a != "object" && typeof a != "function" || a === null) throw new TypeError(u + a);
            if (typeof c != "object" && typeof c != "function" || c === null) throw new TypeError(t + c);
            if (s) try {
                return s.call(Object, a, b, c)
            } catch (d) {}
            if (i(c, "value"))
                if (n && (l(a, b) || m(a, b))) {
                    var e = a.__proto__;
                    a.__proto__ = f, delete a[b], a[b] = c.value, a.__proto__ = e
                } else a[b] = c.value;
            else {
                if (!n) throw new TypeError(v);
                i(c, "get") && j(a, b, c.get), i(c, "set") && k(a, b, c.set)
            }
            return a
        }
    }
    Object.defineProperties || (Object.defineProperties = function(a, b) {
        for (var c in b) i(b, c) && Object.defineProperty(a, c, b[c]);
        return a
    }), Object.seal || (Object.seal = function(a) {
        return a
    }), Object.freeze || (Object.freeze = function(a) {
        return a
    });
    try {
        Object.freeze(function() {})
    } catch (w) {
        Object.freeze = function(a) {
            return function b(b) {
                return typeof b == "function" ? b : a(b)
            }
        }(Object.freeze)
    }
    Object.preventExtensions || (Object.preventExtensions = function(a) {
        return a
    }), Object.isSealed || (Object.isSealed = function(a) {
        return !1
    }), Object.isFrozen || (Object.isFrozen = function(a) {
        return !1
    }), Object.isExtensible || (Object.isExtensible = function(a) {
        if (Object(a) === a) throw new TypeError;
        var b = "";
        while (i(a, b)) b += "?";
        a[b] = !0;
        var c = i(a, b);
        return delete a[b], c
    });
    if (!Object.keys) {
        var x = !0,
            y = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"],
            z = y.length;
        for (var A in {
            toString: null
        }) x = !1;
        Object.keys = function bd(a) {
            if (typeof a != "object" && typeof a != "function" || a === null) throw new TypeError("Object.keys called on a non-object");
            var bd = [];
            for (var b in a) i(a, b) && bd.push(b);
            if (x)
                for (var c = 0, d = z; c < d; c++) {
                    var e = y[c];
                    i(a, e) && bd.push(e)
                }
            return bd
        }
    }
    if (!Date.prototype.toISOString || (new Date(-621987552e5)).toISOString().indexOf("-000001") === -1) Date.prototype.toISOString = function() {
        var a, b, c, d;
        if (!isFinite(this)) throw new RangeError;
        a = [this.getUTCMonth() + 1, this.getUTCDate(), this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()], d = this.getUTCFullYear(), d = (d < 0 ? "-" : d > 9999 ? "+" : "") + ("00000" + Math.abs(d)).slice(0 <= d && d <= 9999 ? -4 : -6), b = a.length;
        while (b--) c = a[b], c < 10 && (a[b] = "0" + c);
        return d + "-" + a.slice(0, 2).join("-") + "T" + a.slice(2).join(":") + "." + ("000" + this.getUTCMilliseconds()).slice(-3) + "Z"
    };
    Date.now || (Date.now = function() {
        return (new Date).getTime()
    }), Date.prototype.toJSON || (Date.prototype.toJSON = function(a) {
        if (typeof this.toISOString != "function") throw new TypeError;
        return this.toISOString()
    }), Date.parse("+275760-09-13T00:00:00.000Z") !== 864e13 && (Date = function(a) {
        var b = function e(b, c, d, f, g, h, i) {
                var j = arguments.length;
                if (this instanceof a) {
                    var k = j == 1 && String(b) === b ? new a(e.parse(b)) : j >= 7 ? new a(b, c, d, f, g, h, i) : j >= 6 ? new a(b, c, d, f, g, h) : j >= 5 ? new a(b, c, d, f, g) : j >= 4 ? new a(b, c, d, f) : j >= 3 ? new a(b, c, d) : j >= 2 ? new a(b, c) : j >= 1 ? new a(b) : new a;
                    return k.constructor = e, k
                }
                return a.apply(this, arguments)
            },
            c = new RegExp("^(\\d{4}|[+-]\\d{6})(?:-(\\d{2})(?:-(\\d{2})(?:T(\\d{2}):(\\d{2})(?::(\\d{2})(?:\\.(\\d{3}))?)?(?:Z|(?:([-+])(\\d{2}):(\\d{2})))?)?)?)?$");
        for (var d in a) b[d] = a[d];
        return b.now = a.now, b.UTC = a.UTC, b.prototype = a.prototype, b.prototype.constructor = b, b.parse = function f(b) {
            var d = c.exec(b);
            if (d) {
                d.shift();
                for (var e = 1; e < 7; e++) d[e] = +(d[e] || (e < 3 ? 1 : 0)), e == 1 && d[e]--;
                var f = +d.pop(),
                    g = +d.pop(),
                    h = d.pop(),
                    i = 0;
                if (h) {
                    if (g > 23 || f > 59) return NaN;
                    i = (g * 60 + f) * 6e4 * (h == "+" ? -1 : 1)
                }
                var j = +d[0];
                return 0 <= j && j <= 99 ? (d[0] = j + 400, a.UTC.apply(this, d) + i - 126227808e5) : a.UTC.apply(this, d) + i
            }
            return a.parse.apply(this, arguments)
        }, b
    }(Date));
    var B = "\t\n\f\r   ᠎             　\u2028\u2029﻿";
    if (!String.prototype.trim || B.trim()) {
        B = "[" + B + "]";
        var C = new RegExp("^" + B + B + "*"),
            D = new RegExp(B + B + "*$");
        String.prototype.trim = function() {
            return String(this).replace(C, "").replace(D, "")
        }
    }
    var E = function(a) {
            return a = +a, a !== a ? a = 0 : a !== 0 && a !== 1 / 0 && a !== -Infinity && (a = (a > 0 || -1) * Math.floor(Math.abs(a))), a
        },
        F = "a" [0] != "a",
        G = function(a) {
            if (a == null) throw new TypeError;
            return F && typeof a == "string" && a ? a.split("") : Object(a)
        }
}), define("pilot/event_emitter", ["require", "exports", "module"], function(a, b, c) {
    var d = {};
    d._emit = d._dispatchEvent = function(a, b) {
        this._eventRegistry = this._eventRegistry || {}, this._defaultHandlers = this._defaultHandlers || {};
        var c = this._eventRegistry[a] || [],
            d = this._defaultHandlers[a];
        if (!c.length && !d) return;
        b = b || {}, b.type = a, b.stopPropagation || (b.stopPropagation = function() {
            this.propagationStopped = !0
        }), b.preventDefault || (b.preventDefault = function() {
            this.defaultPrevented = !0
        });
        for (var e = 0; e < c.length; e++) {
            c[e](b);
            if (b.propagationStopped) break
        }
        d && !b.defaultPrevented && d(b)
    }, d.setDefaultHandler = function(a, b) {
        this._defaultHandlers = this._defaultHandlers || {};
        if (this._defaultHandlers[a]) throw new Error("The default handler for '" + a + "' is already set");
        this._defaultHandlers[a] = b
    }, d.on = d.addEventListener = function(a, b) {
        this._eventRegistry = this._eventRegistry || {};
        var c = this._eventRegistry[a];
        if (!c) var c = this._eventRegistry[a] = [];
        c.indexOf(b) == -1 && c.push(b)
    }, d.removeListener = d.removeEventListener = function(a, b) {
        this._eventRegistry = this._eventRegistry || {};
        var c = this._eventRegistry[a];
        if (!c) return;
        var d = c.indexOf(b);
        d !== -1 && c.splice(d, 1)
    }, d.removeAllListeners = function(a) {
        this._eventRegistry && (this._eventRegistry[a] = [])
    }, b.EventEmitter = d
}), define("pilot/oop", ["require", "exports", "module"], function(a, b, c) {
    b.inherits = function() {
        var a = function() {};
        return function(b, c) {
            a.prototype = c.prototype, b.super_ = c.prototype, b.prototype = new a, b.prototype.constructor = b
        }
    }(), b.mixin = function(a, b) {
        for (var c in b) a[c] = b[c]
    }, b.implement = function(a, c) {
        b.mixin(a, c)
    }
}), define("ace/mode/javascript_worker", ["require", "exports", "module", "pilot/oop", "ace/worker/mirror", "ace/worker/jshint", "ace/narcissus/jsparse"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("ace/worker/mirror").Mirror,
        f = a("ace/worker/jshint").JSHINT,
        g = b.JavaScriptWorker = function(a) {
            e.call(this, a), this.setTimeout(500)
        };
    d.inherits(g, e),
    function() {
        this.onUpdate = function() {
            var b = this.doc.getValue();
            b = b.replace(/^#!.*\n/, "\n");
            var c = a("ace/narcissus/jsparse");
            try {
                c.parse(b)
            } catch (d) {
                var e = d.message.split(":"),
                    g = e.pop().trim(),
                    h = parseInt(e.pop().trim()) - 1;
                this.sender.emit("narcissus", {
                    row: h,
                    column: null,
                    text: g,
                    type: "error"
                });
                return
            } finally {}
            f(b, {
                undef: !1,
                onevar: !1,
                passfail: !1
            }), this.sender.emit("jslint", f.errors)
        }
    }.call(g.prototype)
}), define("ace/worker/mirror", ["require", "exports", "module", "ace/document", "pilot/lang"], function(a, b, c) {
    var d = a("ace/document").Document,
        e = a("pilot/lang"),
        f = b.Mirror = function(a) {
            this.sender = a;
            var b = this.doc = new d(""),
                c = this.deferredUpdate = e.deferredCall(this.onUpdate.bind(this)),
                f = this;
            a.on("change", function(a) {
                b.applyDeltas([a.data]), c.schedule(f.$timeout)
            })
        };
    (function() {
        this.$timeout = 500, this.setTimeout = function(a) {
            this.$timeout = a
        }, this.setValue = function(a) {
            this.doc.setValue(a), this.deferredUpdate.schedule(this.$timeout)
        }, this.getValue = function(a) {
            this.sender.callback(this.doc.getValue(), a)
        }, this.onUpdate = function() {}
    }).call(f.prototype)
}), define("ace/document", ["require", "exports", "module", "pilot/oop", "pilot/event_emitter", "ace/range", "ace/anchor"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("pilot/event_emitter").EventEmitter,
        f = a("ace/range").Range,
        g = a("ace/anchor").Anchor,
        h = function(a) {
            this.$lines = [], Array.isArray(a) ? this.insertLines(0, a) : a.length == 0 ? this.$lines = [""] : this.insert({
                row: 0,
                column: 0
            }, a)
        };
    (function() {
        d.implement(this, e), this.setValue = function(a) {
            var b = this.getLength();
            this.remove(new f(0, 0, b, this.getLine(b - 1).length)), this.insert({
                row: 0,
                column: 0
            }, a)
        }, this.getValue = function() {
            return this.getAllLines().join(this.getNewLineCharacter())
        }, this.createAnchor = function(a, b) {
            return new g(this, a, b)
        }, "aaa".split(/a/).length == 0 ? this.$split = function(a) {
            return a.replace(/\r\n|\r/g, "\n").split("\n")
        } : this.$split = function(a) {
            return a.split(/\r\n|\r|\n/)
        }, this.$detectNewLine = function(a) {
            var b = a.match(/^.*?(\r\n|\r|\n)/m);
            b ? this.$autoNewLine = b[1] : this.$autoNewLine = "\n"
        }, this.getNewLineCharacter = function() {
            switch (this.$newLineMode) {
                case "windows":
                    return "\r\n";
                case "unix":
                    return "\n";
                case "auto":
                    return this.$autoNewLine
            }
        }, this.$autoNewLine = "\n", this.$newLineMode = "auto", this.setNewLineMode = function(a) {
            if (this.$newLineMode === a) return;
            this.$newLineMode = a
        }, this.getNewLineMode = function() {
            return this.$newLineMode
        }, this.isNewLine = function(a) {
            return a == "\r\n" || a == "\r" || a == "\n"
        }, this.getLine = function(a) {
            return this.$lines[a] || ""
        }, this.getLines = function(a, b) {
            return this.$lines.slice(a, b + 1)
        }, this.getAllLines = function() {
            return this.getLines(0, this.getLength())
        }, this.getLength = function() {
            return this.$lines.length
        }, this.getTextRange = function(a) {
            if (a.start.row == a.end.row) return this.$lines[a.start.row].substring(a.start.column, a.end.column);
            var b = [];
            return b.push(this.$lines[a.start.row].substring(a.start.column)), b.push.apply(b, this.getLines(a.start.row + 1, a.end.row - 1)), b.push(this.$lines[a.end.row].substring(0, a.end.column)), b.join(this.getNewLineCharacter())
        }, this.$clipPosition = function(a) {
            var b = this.getLength();
            return a.row >= b && (a.row = Math.max(0, b - 1), a.column = this.getLine(b - 1).length), a
        }, this.insert = function(a, b) {
            if (b.length == 0) return a;
            a = this.$clipPosition(a), this.getLength() <= 1 && this.$detectNewLine(b);
            var c = this.$split(b),
                d = c.splice(0, 1)[0],
                e = c.length == 0 ? null : c.splice(c.length - 1, 1)[0];
            return a = this.insertInLine(a, d), e !== null && (a = this.insertNewLine(a), a = this.insertLines(a.row, c), a = this.insertInLine(a, e || "")), a
        }, this.insertLines = function(a, b) {
            if (b.length == 0) return {
                row: a,
                column: 0
            };
            var c = [a, 0];
            c.push.apply(c, b), this.$lines.splice.apply(this.$lines, c);
            var d = new f(a, 0, a + b.length, 0),
                e = {
                    action: "insertLines",
                    range: d,
                    lines: b
                };
            return this._dispatchEvent("change", {
                data: e
            }), d.end
        }, this.insertNewLine = function(a) {
            a = this.$clipPosition(a);
            var b = this.$lines[a.row] || "";
            this.$lines[a.row] = b.substring(0, a.column), this.$lines.splice(a.row + 1, 0, b.substring(a.column, b.length));
            var c = {
                    row: a.row + 1,
                    column: 0
                },
                d = {
                    action: "insertText",
                    range: f.fromPoints(a, c),
                    text: this.getNewLineCharacter()
                };
            return this._dispatchEvent("change", {
                data: d
            }), c
        }, this.insertInLine = function(a, b) {
            if (b.length == 0) return a;
            var c = this.$lines[a.row] || "";
            this.$lines[a.row] = c.substring(0, a.column) + b + c.substring(a.column);
            var d = {
                    row: a.row,
                    column: a.column + b.length
                },
                e = {
                    action: "insertText",
                    range: f.fromPoints(a, d),
                    text: b
                };
            return this._dispatchEvent("change", {
                data: e
            }), d
        }, this.remove = function(a) {
            a.start = this.$clipPosition(a.start), a.end = this.$clipPosition(a.end);
            if (a.isEmpty()) return a.start;
            var b = a.start.row,
                c = a.end.row;
            if (a.isMultiLine()) {
                var d = a.start.column == 0 ? b : b + 1,
                    e = c - 1;
                a.end.column > 0 && this.removeInLine(c, 0, a.end.column), e >= d && this.removeLines(d, e), d != b && (this.removeInLine(b, a.start.column, this.getLine(b).length), this.removeNewLine(a.start.row))
            } else this.removeInLine(b, a.start.column, a.end.column);
            return a.start
        }, this.removeInLine = function(a, b, c) {
            if (b == c) return;
            var d = new f(a, b, a, c),
                e = this.getLine(a),
                g = e.substring(b, c),
                h = e.substring(0, b) + e.substring(c, e.length);
            this.$lines.splice(a, 1, h);
            var i = {
                action: "removeText",
                range: d,
                text: g
            };
            return this._dispatchEvent("change", {
                data: i
            }), d.start
        }, this.removeLines = function(a, b) {
            var c = new f(a, 0, b + 1, 0),
                d = this.$lines.splice(a, b - a + 1),
                e = {
                    action: "removeLines",
                    range: c,
                    nl: this.getNewLineCharacter(),
                    lines: d
                };
            return this._dispatchEvent("change", {
                data: e
            }), d
        }, this.removeNewLine = function(a) {
            var b = this.getLine(a),
                c = this.getLine(a + 1),
                d = new f(a, b.length, a + 1, 0),
                e = b + c;
            this.$lines.splice(a, 2, e);
            var g = {
                action: "removeText",
                range: d,
                text: this.getNewLineCharacter()
            };
            this._dispatchEvent("change", {
                data: g
            })
        }, this.replace = function(a, b) {
            if (b.length == 0 && a.isEmpty()) return a.start;
            if (b == this.getTextRange(a)) return a.end;
            this.remove(a);
            if (b) var c = this.insert(a.start, b);
            else c = a.start;
            return c
        }, this.applyDeltas = function(a) {
            for (var b = 0; b < a.length; b++) {
                var c = a[b],
                    d = f.fromPoints(c.range.start, c.range.end);
                c.action == "insertLines" ? this.insertLines(d.start.row, c.lines) : c.action == "insertText" ? this.insert(d.start, c.text) : c.action == "removeLines" ? this.removeLines(d.start.row, d.end.row - 1) : c.action == "removeText" && this.remove(d)
            }
        }, this.revertDeltas = function(a) {
            for (var b = a.length - 1; b >= 0; b--) {
                var c = a[b],
                    d = f.fromPoints(c.range.start, c.range.end);
                c.action == "insertLines" ? this.removeLines(d.start.row, d.end.row - 1) : c.action == "insertText" ? this.remove(d) : c.action == "removeLines" ? this.insertLines(d.start.row, c.lines) : c.action == "removeText" && this.insert(d.start, c.text)
            }
        }
    }).call(h.prototype), b.Document = h
}), define("ace/range", ["require", "exports", "module"], function(a, b, c) {
    var d = function(a, b, c, d) {
        this.start = {
            row: a,
            column: b
        }, this.end = {
            row: c,
            column: d
        }
    };
    (function() {
        this.toString = function() {
            return "Range: [" + this.start.row + "/" + this.start.column + "] -> [" + this.end.row + "/" + this.end.column + "]"
        }, this.contains = function(a, b) {
            return this.compare(a, b) == 0
        }, this.compareRange = function(a) {
            var b, c = a.end,
                d = a.start;
            return b = this.compare(c.row, c.column), b == 1 ? (b = this.compare(d.row, d.column), b == 1 ? 2 : b == 0 ? 1 : 0) : b == -1 ? -2 : (b = this.compare(d.row, d.column), b == -1 ? -1 : b == 1 ? 42 : 0)
        }, this.containsRange = function(a) {
            var b = this.compareRange(a);
            return b == -1 || b == 0 || b == 1
        }, this.isEnd = function(a, b) {
            return this.end.row == a && this.end.column == b
        }, this.isStart = function(a, b) {
            return this.start.row == a && this.start.column == b
        }, this.setStart = function(a, b) {
            typeof a == "object" ? (this.start.column = a.column, this.start.row = a.row) : (this.start.row = a, this.start.column = b)
        }, this.setEnd = function(a, b) {
            typeof a == "object" ? (this.end.column = a.column, this.end.row = a.row) : (this.end.row = a, this.end.column = b)
        }, this.inside = function(a, b) {
            return this.compare(a, b) == 0 ? this.isEnd(a, b) || this.isStart(a, b) ? !1 : !0 : !1
        }, this.insideStart = function(a, b) {
            return this.compare(a, b) == 0 ? this.isEnd(a, b) ? !1 : !0 : !1
        }, this.insideEnd = function(a, b) {
            return this.compare(a, b) == 0 ? this.isStart(a, b) ? !1 : !0 : !1
        }, this.compare = function(a, b) {
            return !this.isMultiLine() && a === this.start.row ? b < this.start.column ? -1 : b > this.end.column ? 1 : 0 : a < this.start.row ? -1 : a > this.end.row ? 1 : this.start.row === a ? b >= this.start.column ? 0 : -1 : this.end.row === a ? b <= this.end.column ? 0 : 1 : 0
        }, this.compareStart = function(a, b) {
            return this.start.row == a && this.start.column == b ? -1 : this.compare(a, b)
        }, this.compareEnd = function(a, b) {
            return this.end.row == a && this.end.column == b ? 1 : this.compare(a, b)
        }, this.compareInside = function(a, b) {
            return this.end.row == a && this.end.column == b ? 1 : this.start.row == a && this.start.column == b ? -1 : this.compare(a, b)
        }, this.clipRows = function(a, b) {
            if (this.end.row > b) var c = {
                row: b + 1,
                column: 0
            };
            if (this.start.row > b) var e = {
                row: b + 1,
                column: 0
            };
            if (this.start.row < a) var e = {
                row: a,
                column: 0
            };
            if (this.end.row < a) var c = {
                row: a,
                column: 0
            };
            return d.fromPoints(e || this.start, c || this.end)
        }, this.extend = function(a, b) {
            var c = this.compare(a, b);
            if (c == 0) return this;
            if (c == -1) var e = {
                row: a,
                column: b
            };
            else var f = {
                row: a,
                column: b
            };
            return d.fromPoints(e || this.start, f || this.end)
        }, this.isEmpty = function() {
            return this.start.row == this.end.row && this.start.column == this.end.column
        }, this.isMultiLine = function() {
            return this.start.row !== this.end.row
        }, this.clone = function() {
            return d.fromPoints(this.start, this.end)
        }, this.collapseRows = function() {
            return this.end.column == 0 ? new d(this.start.row, 0, Math.max(this.start.row, this.end.row - 1), 0) : new d(this.start.row, 0, this.end.row, 0)
        }, this.toScreenRange = function(a) {
            var b = a.documentToScreenPosition(this.start),
                c = a.documentToScreenPosition(this.end);
            return new d(b.row, b.column, c.row, c.column)
        }
    }).call(d.prototype), d.fromPoints = function(a, b) {
        return new d(a.row, a.column, b.row, b.column)
    }, b.Range = d
}), define("ace/anchor", ["require", "exports", "module", "pilot/oop", "pilot/event_emitter"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("pilot/event_emitter").EventEmitter,
        f = b.Anchor = function(a, b, c) {
            this.document = a, typeof c == "undefined" ? this.setPosition(b.row, b.column) : this.setPosition(b, c), this.$onChange = this.onChange.bind(this), a.on("change", this.$onChange)
        };
    (function() {
        d.implement(this, e), this.getPosition = function() {
            return this.$clipPositionToDocument(this.row, this.column)
        }, this.getDocument = function() {
            return this.document
        }, this.onChange = function(a) {
            var b = a.data,
                c = b.range;
            if (c.start.row == c.end.row && c.start.row != this.row) return;
            if (c.start.row > this.row) return;
            if (c.start.row == this.row && c.start.column > this.column) return;
            var d = this.row,
                e = this.column;
            b.action === "insertText" ? c.start.row === d && c.start.column <= e ? c.start.row === c.end.row ? e += c.end.column - c.start.column : (e -= c.start.column, d += c.end.row - c.start.row) : c.start.row !== c.end.row && c.start.row < d && (d += c.end.row - c.start.row) : b.action === "insertLines" ? c.start.row <= d && (d += c.end.row - c.start.row) : b.action == "removeText" ? c.start.row == d && c.start.column < e ? c.end.column >= e ? e = c.start.column : e = Math.max(0, e - (c.end.column - c.start.column)) : c.start.row !== c.end.row && c.start.row < d ? (c.end.row == d && (e = Math.max(0, e - c.end.column) + c.start.column), d -= c.end.row - c.start.row) : c.end.row == d && (d -= c.end.row - c.start.row, e = Math.max(0, e - c.end.column) + c.start.column) : b.action == "removeLines" && c.start.row <= d && (c.end.row <= d ? d -= c.end.row - c.start.row : (d = c.start.row, e = 0)), this.setPosition(d, e, !0)
        }, this.setPosition = function(a, b, c) {
            var d;
            c ? d = {
                row: a,
                column: b
            } : d = this.$clipPositionToDocument(a, b);
            if (this.row == d.row && this.column == d.column) return;
            var e = {
                row: this.row,
                column: this.column
            };
            this.row = d.row, this.column = d.column, this._dispatchEvent("change", {
                old: e,
                value: d
            })
        }, this.detach = function() {
            this.document.removeEventListener("change", this.$onChange)
        }, this.$clipPositionToDocument = function(a, b) {
            var c = {};
            return a >= this.document.getLength() ? (c.row = Math.max(0, this.document.getLength() - 1), c.column = this.document.getLine(c.row).length) : a < 0 ? (c.row = 0, c.column = 0) : (c.row = a, c.column = Math.min(this.document.getLine(c.row).length, Math.max(0, b))), b < 0 && (c.column = 0), c
        }
    }).call(f.prototype)
}), define("pilot/lang", ["require", "exports", "module"], function(a, b, c) {
    b.stringReverse = function(a) {
        return a.split("").reverse().join("")
    }, b.stringRepeat = function(a, b) {
        return (new Array(b + 1)).join(a)
    };
    var d = /^\s\s*/,
        e = /\s\s*$/;
    b.stringTrimLeft = function(a) {
        return a.replace(d, "")
    }, b.stringTrimRight = function(a) {
        return a.replace(e, "")
    }, b.copyObject = function(a) {
        var b = {};
        for (var c in a) b[c] = a[c];
        return b
    }, b.copyArray = function(a) {
        var b = [];
        for (i = 0, l = a.length; i < l; i++) a[i] && typeof a[i] == "object" ? b[i] = this.copyObject(a[i]) : b[i] = a[i];
        return b
    }, b.deepCopy = function(a) {
        if (typeof a != "object") return a;
        var b = a.constructor();
        for (var c in a) typeof a[c] == "object" ? b[c] = this.deepCopy(a[c]) : b[c] = a[c];
        return b
    }, b.arrayToMap = function(a) {
        var b = {};
        for (var c = 0; c < a.length; c++) b[a[c]] = 1;
        return b
    }, b.arrayRemove = function(a, b) {
        for (var c = 0; c <= a.length; c++) b === a[c] && a.splice(c, 1)
    }, b.escapeRegExp = function(a) {
        return a.replace(/([.*+?^${}()|[\]\/\\])/g, "\\$1")
    }, b.deferredCall = function(a) {
        var b = null,
            c = function() {
                b = null, a()
            },
            d = function(a) {
                return d.cancel(), b = setTimeout(c, a || 0), d
            };
        return d.schedule = d, d.call = function() {
            return this.cancel(), a(), d
        }, d.cancel = function() {
            return clearTimeout(b), b = null, d
        }, d
    }
}), define("ace/worker/jshint", ["require", "exports", "module"], function(a, b, c) {
    var d = function() {
        function _() {}

        function ba(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b)
        }

        function bb(a, b) {
            var c;
            for (c in b) ba(b, c) && (a[c] = b[c])
        }

        function bc() {
            A.couch && bb(B, f), A.rhino && bb(B, F), A.prototypejs && bb(B, E), A.node && bb(B, y), A.devel && bb(B, g), A.dojo && bb(B, h), A.browser && bb(B, e), A.jquery && bb(B, r), A.mootools && bb(B, w), A.wsh && bb(B, R), A.globalstrict && A.strict !== !1 && (A.strict = !0)
        }

        function bd(a, b, c) {
            var d = Math.floor(b / s.length * 100);
            throw {
                name: "JSHintError",
                line: b,
                character: c,
                message: a + " (" + d + "% scanned)."
            }
        }

        function be(a, b, c, e, f, g) {
            var h, i, j;
            return b = b || x, b.id === "(end)" && (b = O), i = b.line || 0, h = b.from || 0, j = {
                id: "(error)",
                raw: a,
                evidence: s[i - 1] || "",
                line: i,
                character: h,
                a: c,
                b: e,
                c: f,
                d: g
            }, j.reason = a.supplant(j), d.errors.push(j), A.passfail && bd("Stopping. ", i, h), Q += 1, Q >= A.maxerr && bd("Too many errors.", i, h), j
        }

        function bf(a, b, c, d, e, f, g) {
            return be(a, {
                line: b,
                from: c
            }, d, e, f, g)
        }

        function bg(a, b, c, d, e, f) {
            var g = be(a, b, c, d, e, f);
            bd("Stopping, unable to continue.", g.line, g.character)
        }

        function bh(a, b, c, d, e, f, g) {
            return bg(a, {
                line: b,
                from: c
            }, d, e, f, g)
        }

        function bj(a, b) {
            a === "hasOwnProperty" && be("'hasOwnProperty' is a really bad name."), ba(j, a) && !j["(global)"] && (j[a] === !0 ? A.latedef && be("'{a}' was used before it was defined.", x, a) : A.shadow || be("'{a}' is already defined.", x, a)), j[a] = b, j["(global)"] ? (m[a] = j, ba(n, a) && (A.latedef && be("'{a}' was used before it was defined.", x, a), delete n[a])) : G[a] = j
        }

        function bk() {
            var a, b, d, e = x.value,
                f, g;
            switch (e) {
                case "*/":
                    bg("Unbegun comment.");
                    break;
                case "/*members":
                case "/*member":
                    e = "/*members", v || (v = {}), b = v;
                    break;
                case "/*jshint":
                case "/*jslint":
                    b = A, d = c;
                    break;
                case "/*global":
                    b = B;
                    break;
                default:
                    bg("What?")
            }
            f = bi.token();
            h: for (;;) {
                for (;;) {
                    if (f.type === "special" && f.value === "*/") break h;
                    if (f.id !== "(endline)" && f.id !== ",") break;
                    f = bi.token()
                }
                f.type !== "(string)" && f.type !== "(identifier)" && e !== "/*members" && bg("Bad option.", f), g = bi.token(), g.id === ":" ? (g = bi.token(), b === v && bg("Expected '{a}' and instead saw '{b}'.", f, "*/", ":"), f.value !== "indent" || e !== "/*jshint" && e !== "/*jslint" ? f.value !== "maxerr" || e !== "/*jshint" && e !== "/*jslint" ? f.value !== "maxlen" || e !== "/*jshint" && e !== "/*jslint" ? g.value === "true" ? b[f.value] = !0 : g.value === "false" ? b[f.value] = !1 : bg("Bad option value.", g) : (a = +g.value, (typeof a != "number" || !isFinite(a) || a <= 0 || Math.floor(a) !== a) && bg("Expected a small integer and instead saw '{a}'.", g, g.value), b.maxlen = a) : (a = +g.value, (typeof a != "number" || !isFinite(a) || a <= 0 || Math.floor(a) !== a) && bg("Expected a small integer and instead saw '{a}'.", g, g.value), b.maxerr = a) : (a = +g.value, (typeof a != "number" || !isFinite(a) || a <= 0 || Math.floor(a) !== a) && bg("Expected a small integer and instead saw '{a}'.", g, g.value), b.white = !0, b.indent = a), f = bi.token()) : ((e === "/*jshint" || e === "/*jslint") && bg("Missing option value.", f), b[f.value] = !1, f = g)
            }
            d && bc()
        }

        function bl(a) {
            var b = a || 0,
                c = 0,
                d;
            while (c <= b) d = t[c], d || (d = t[c] = bi.token()), c += 1;
            return d
        }

        function bm(b, c) {
            switch (O.id) {
                case "(number)":
                    x.id === "." && be("A dot following a number can be confused with a decimal point.", O);
                    break;
                case "-":
                    (x.id === "-" || x.id === "--") && be("Confusing minusses.");
                    break;
                case "+":
                    (x.id === "+" || x.id === "++") && be("Confusing plusses.")
            }
            if (O.type === "(string)" || O.identifier) a = O.value;
            b && x.id !== b && (c ? x.id === "(end)" ? be("Unmatched '{a}'.", c, c.id) : be("Expected '{a}' to match '{b}' from line {c} and instead saw '{d}'.", x, b, c.id, c.line, x.value) : (x.type !== "(identifier)" || x.value !== b) && be("Expected '{a}' and instead saw '{b}'.", x, b, x.value)), D = O, O = x;
            for (;;) {
                x = t.shift() || bi.token();
                if (x.id === "(end)" || x.id === "(error)") return;
                if (x.type === "special") bk();
                else if (x.id !== "(endline)") break
            }
        }

        function bn(b, c) {
            var d, e = !1;
            x.id === "(end)" && bg("Unexpected early end of program.", O), bm(), c && (a = "anonymous", j["(verb)"] = O.value);
            if (c === !0 && O.fud) d = O.fud();
            else {
                if (O.nud) d = O.nud();
                else {
                    if (x.type === "(number)" && O.id === ".") return be("A leading decimal point can be confused with a dot: '.{a}'.", O, x.value), bm(), O;
                    bg("Expected an identifier and instead saw '{a}'.", O, O.id)
                }
                while (b < x.lbp) e = O.value == "Array", bm(), e && O.id == "(" && x.id == ")" && be("Use the array literal notation [].", O), O.led ? d = O.led(d) : bg("Expected an operator and instead saw '{a}'.", O, O.id)
            }
            return d
        }

        function bo(a, b) {
            a = a || O, b = b || x, A.white && a.character !== b.from && a.line === b.line && be("Unexpected space after '{a}'.", b, a.value)
        }

        function bp(a, b) {
            a = a || O, b = b || x, A.white && (a.character !== b.from || a.line !== b.line) && be("Unexpected space before '{a}'.", b, b.value)
        }

        function bq(a, b) {
            a = a || O, b = b || x, A.white && !a.comment && a.line === b.line && bo(a, b)
        }

        function br(a, b) {
            A.white && (a = a || O, b = b || x, a.line === b.line && a.character === b.from && be("Missing space after '{a}'.", x, a.value))
        }

        function bs(a, b) {
            a = a || O, b = b || x, !A.laxbreak && a.line !== b.line ? be("Bad line breaking before '{a}'.", b, b.id) : A.white && (a = a || O, b = b || x, a.character === b.from && be("Missing space after '{a}'.", x, a.value))
        }

        function bt(a) {
            var b;
            A.white && x.id !== "(end)" && (b = p + (a || 0), x.from !== b && be("Expected '{a}' to have an indentation at {b} instead at {c}.", x, x.value, b, x.from))
        }

        function bu(a) {
            a = a || O, a.line !== x.line && be("Line breaking error '{a}'.", a, a.value)
        }

        function bv() {
            O.line !== x.line ? A.laxbreak || be("Bad line breaking before '{a}'.", O, x.id) : O.character !== x.from && A.white && be("Unexpected space after '{a}'.", x, O.value), bm(","), br(O, x)
        }

        function bw(a, b) {
            var c = M[a];
            if (!c || typeof c != "object") M[a] = c = {
                id: a,
                lbp: b,
                value: a
            };
            return c
        }

        function bx(a) {
            return bw(a, 0)
        }

        function by(a, b) {
            var c = bx(a);
            return c.identifier = c.reserved = !0, c.fud = b, c
        }

        function bz(a, b) {
            var c = by(a, b);
            return c.block = !0, c
        }

        function bA(a) {
            var b = a.id.charAt(0);
            if (b >= "a" && b <= "z" || b >= "A" && b <= "Z") a.identifier = a.reserved = !0;
            return a
        }

        function bB(a, b) {
            var c = bw(a, 150);
            return bA(c), c.nud = typeof b == "function" ? b : function() {
                this.right = bn(150), this.arity = "unary";
                if (this.id === "++" || this.id === "--") A.plusplus ? be("Unexpected use of '{a}'.", this, this.id) : (!this.right.identifier || this.right.reserved) && this.right.id !== "." && this.right.id !== "[" && be("Bad operand.", this);
                return this
            }, c
        }

        function bC(a, b) {
            var c = bx(a);
            return c.type = a, c.nud = b, c
        }

        function bD(a, b) {
            var c = bC(a, b);
            return c.identifier = c.reserved = !0, c
        }

        function bE(a, b) {
            return bD(a, function() {
                return typeof b == "function" && b(this), this
            })
        }

        function bF(a, b, c, d) {
            var e = bw(a, c);
            return bA(e), e.led = function(a) {
                return d || (bs(D, O), br(O, x)), typeof b == "function" ? b(a, this) : (this.left = a, this.right = bn(c), this)
            }, e
        }

        function bG(a, b) {
            var c = bw(a, 100);
            return c.led = function(a) {
                bs(D, O), br(O, x);
                var c = bn(100);
                return a && a.id === "NaN" || c && c.id === "NaN" ? be("Use the isNaN function to compare with NaN.", this) : b && b.apply(this, [a, c]), a.id === "!" && be("Confusing use of '{a}'.", a, "!"), c.id === "!" && be("Confusing use of '{a}'.", a, "!"), this.left = a, this.right = c, this
            }, c
        }

        function bH(a) {
            return a && (a.type === "(number)" && +a.value === 0 || a.type === "(string)" && a.value === "" || a.type === "null" && !A.eqnull || a.type === "true" || a.type === "false" || a.type === "undefined")
        }

        function bI(a, b) {
            return bw(a, 20).exps = !0, bF(a, function(a, b) {
                var c;
                b.left = a, B[a.value] === !1 && G[a.value]["(global)"] === !0 ? be("Read only.", a) : a["function"] && be("'{a}' is a function.", a, a.value);
                if (a) {
                    if (a.id === "." || a.id === "[") return (!a.left || a.left.value === "arguments") && be("Bad assignment.", b), b.right = bn(19), b;
                    if (a.identifier && !a.reserved) return j[a.value] === "exception" && be("Do not assign to the exception parameter.", a), b.right = bn(19), b;
                    a === M["function"] && be("Expected an identifier in an assignment and instead saw a function invocation.", O)
                }
                bg("Bad assignment.", b)
            }, 20)
        }

        function bJ(a, b, c) {
            var d = bw(a, c);
            return bA(d), d.led = typeof b == "function" ? b : function(a) {
                return A.bitwise && be("Unexpected use of '{a}'.", this, this.id), this.left = a, this.right = bn(c), this
            }, d
        }

        function bK(a) {
            return bw(a, 20).exps = !0, bF(a, function(a, b) {
                A.bitwise && be("Unexpected use of '{a}'.", b, b.id), br(D, O), br(O, x);
                if (a) return a.id === "." || a.id === "[" || a.identifier && !a.reserved ? (bn(19), b) : (a === M["function"] && be("Expected an identifier in an assignment, and instead saw a function invocation.", O), b);
                bg("Bad assignment.", b)
            }, 20)
        }

        function bL(a, b) {
            var c = bw(a, 150);
            return c.led = function(a) {
                return A.plusplus ? be("Unexpected use of '{a}'.", this, this.id) : (!a.identifier || a.reserved) && a.id !== "." && a.id !== "[" && be("Bad operand.", this), this.left = a, this
            }, c
        }

        function bM(a) {
            if (x.identifier) return bm(), O.reserved && !A.es5 && (!a || O.value != "undefined") && be("Expected an identifier and instead saw '{a}' (a reserved word).", O, O.id), O.value
        }

        function bN(a) {
            var b = bM(a);
            if (b) return b;
            O.id === "function" && x.id === "(" ? be("Missing name in function declaration.") : bg("Expected an identifier and instead saw '{a}'.", x, x.value)
        }

        function bO(a) {
            var b = 0,
                c;
            if (x.id !== ";" || z) return;
            for (;;) {
                c = bl(b);
                if (c.reach) return;
                if (c.id !== "(endline)") {
                    if (c.id === "function") {
                        be("Inner functions should be listed at the top of the outer function.", c);
                        break
                    }
                    be("Unreachable '{a}' after '{b}'.", c, c.value, a);
                    break
                }
                b += 1
            }
        }

        function bP(a) {
            var b = p,
                c, d = G,
                e = x;
            if (e.id === ";") {
                be("Unnecessary semicolon.", e), bm(";");
                return
            }
            return e.identifier && !e.reserved && bl().id === ":" && (bm(), bm(":"), G = Object.create(d), bj(e.value, "label"), x.labelled || be("Label '{a}' on {b} statement.", x, e.value, x.value), Z.test(e.value + ":") && be("Label '{a}' looks like a javascript url.", e, e.value), x.label = e.value, e = x), a || bt(), c = bn(0, !0), e.block || (!A.expr && (!c || !c.exps) ? be("Expected an assignment or function call and instead saw an expression.", O) : A.nonew && c.id === "(" && c.left.id === "new" && be("Do not use 'new' for side effects."), x.id !== ";" ? !A.asi && (!A.lastsemic || x.id != "}" || x.line != O.line) && bf("Missing semicolon.", O.line, O.from + O.value.length) : (bo(O, x), bm(";"), br(O, x))), p = b, G = d, c
        }

        function bQ() {
            return x.value === "use strict" ? (L && be('Unnecessary "use strict".'), bm(), bm(";"), L = !0, A.newcap = !0, A.undef = !0, !0) : !1
        }

        function bR(a) {
            var b = [],
                c, d;
            while (!x.reach && x.id !== "(end)") x.id === ";" ? (be("Unnecessary semicolon."), bm(";")) : b.push(bP());
            return b
        }

        function bS(a, b) {
            var c, d = o,
                e = p,
                f = L,
                g = G,
                h;
            o = a, G = Object.create(G), br(O, x), h = x;
            if (x.id === "{") {
                bm("{");
                if (x.id !== "}" || O.line !== x.line) {
                    p += A.indent;
                    while (!a && x.from > p) p += A.indent;
                    !a && !bQ() && !f && A.strict && j["(context)"]["(global)"] && be('Missing "use strict" statement.'), c = bR(), L = f, p -= A.indent, bt()
                }
                bm("}", h), p = e
            } else a ? ((!b || A.curly) && be("Expected '{a}' and instead saw '{b}'.", x, "{", x.value), z = !0, c = [bP()], z = !1) : bg("Expected '{a}' and instead saw '{b}'.", x, "{", x.value);
            return j["(verb)"] = null, G = g, o = d, a && A.noempty && (!c || c.length === 0) && be("Empty block."), c
        }

        function bT(a) {
            v && typeof v[a] != "boolean" && be("Unexpected /*member '{a}'.", O, a), typeof u[a] == "number" ? u[a] += 1 : u[a] = 1
        }

        function bU(a) {
            var b = a.value,
                c = a.line,
                d = n[b];
            typeof d == "function" && (d = !1), d ? d[d.length - 1] !== c && d.push(c) : (d = [c], n[b] = d)
        }

        function bV() {
            var a = bM(!0);
            return a || (x.id === "(string)" ? (a = x.value, bm()) : x.id === "(number)" && (a = x.value.toString(), bm())), a
        }

        function bW() {
            var a, b = x,
                c = [];
            bm("("), bq();
            if (x.id === ")") {
                bm(")"), bq(D, O);
                return
            }
            for (;;) {
                a = bN(!0), c.push(a), bj(a, "parameter");
                if (x.id === ",") bv();
                else return bm(")", b), bq(D, O), c
            }
        }

        function bX(b, c) {
            var d, e = A,
                f = G;
            return A = Object.create(A), G = Object.create(G), j = {
                "(name)": b || '"' + a + '"',
                "(line)": x.line,
                "(context)": j,
                "(breakage)": 0,
                "(loopage)": 0,
                "(scope)": G,
                "(statement)": c
            }, d = j, O.funct = j, l.push(j), b && bj(b, "function"), j["(params)"] = bW(), bS(!1), G = f, A = e, j["(last)"] = O.line, j = j["(context)"], d
        }

        function bZ() {
            function a() {
                var a = {},
                    b = x;
                bm("{");
                if (x.id !== "}")
                    for (;;) {
                        if (x.id === "(end)") bg("Missing '}' to match '{' from line {a}.", x, b.line);
                        else {
                            if (x.id === "}") {
                                be("Unexpected comma.", O);
                                break
                            }
                            x.id === "," ? bg("Unexpected comma.", x) : x.id !== "(string)" && be("Expected a string and instead saw {a}.", x, x.value)
                        }
                        a[x.value] === !0 ? be("Duplicate key '{a}'.", x, x.value) : x.value === "__proto__" && !A.proto || x.value === "__iterator__" && !A.iterator ? be("The '{a}' key may produce unexpected results.", x, x.value) : a[x.value] = !0, bm(), bm(":"), bZ();
                        if (x.id !== ",") break;
                        bm(",")
                    }
                bm("}")
            }

            function b() {
                var a = x;
                bm("[");
                if (x.id !== "]")
                    for (;;) {
                        if (x.id === "(end)") bg("Missing ']' to match '[' from line {a}.", x, a.line);
                        else {
                            if (x.id === "]") {
                                be("Unexpected comma.", O);
                                break
                            }
                            x.id === "," && bg("Unexpected comma.", x)
                        }
                        bZ();
                        if (x.id !== ",") break;
                        bm(",")
                    }
                bm("]")
            }
            switch (x.id) {
                case "{":
                    a();
                    break;
                case "[":
                    b();
                    break;
                case "true":
                case "false":
                case "null":
                case "(number)":
                case "(string)":
                    bm();
                    break;
                case "-":
                    bm("-"), O.character !== x.from && be("Unexpected space after '-'.", O), bo(O, x), bm("(number)");
                    break;
                default:
                    bg("Expected a JSON value.", x)
            }
        }
        "use strict";
        var a, b = {
                "<": !0,
                "<=": !0,
                "==": !0,
                "===": !0,
                "!==": !0,
                "!=": !0,
                ">": !0,
                ">=": !0,
                "+": !0,
                "-": !0,
                "*": !0,
                "/": !0,
                "%": !0
            },
            c = {
                asi: !0,
                bitwise: !0,
                boss: !0,
                browser: !0,
                couch: !0,
                curly: !0,
                debug: !0,
                devel: !0,
                dojo: !0,
                eqeqeq: !0,
                eqnull: !0,
                es5: !0,
                evil: !0,
                expr: !0,
                forin: !0,
                globalstrict: !0,
                immed: !0,
                iterator: !0,
                jquery: !0,
                latedef: !0,
                laxbreak: !0,
                loopfunc: !0,
                mootools: !0,
                newcap: !0,
                noarg: !0,
                node: !0,
                noempty: !0,
                nonew: !0,
                nomen: !0,
                onevar: !0,
                passfail: !0,
                plusplus: !0,
                proto: !0,
                prototypejs: !0,
                regexdash: !0,
                regexp: !0,
                rhino: !0,
                undef: !0,
                scripturl: !0,
                shadow: !0,
                strict: !0,
                sub: !0,
                supernew: !0,
                trailing: !0,
                white: !0,
                wsh: !0
            },
            e = {
                ArrayBuffer: !1,
                ArrayBufferView: !1,
                addEventListener: !1,
                applicationCache: !1,
                blur: !1,
                clearInterval: !1,
                clearTimeout: !1,
                close: !1,
                closed: !1,
                DataView: !1,
                defaultStatus: !1,
                document: !1,
                event: !1,
                FileReader: !1,
                Float32Array: !1,
                Float64Array: !1,
                focus: !1,
                frames: !1,
                getComputedStyle: !1,
                HTMLElement: !1,
                history: !1,
                Int16Array: !1,
                Int32Array: !1,
                Int8Array: !1,
                Image: !1,
                length: !1,
                localStorage: !1,
                location: !1,
                moveBy: !1,
                moveTo: !1,
                name: !1,
                navigator: !1,
                onbeforeunload: !0,
                onblur: !0,
                onerror: !0,
                onfocus: !0,
                onload: !0,
                onresize: !0,
                onunload: !0,
                open: !1,
                openDatabase: !1,
                opener: !1,
                Option: !1,
                parent: !1,
                print: !1,
                removeEventListener: !1,
                resizeBy: !1,
                resizeTo: !1,
                screen: !1,
                scroll: !1,
                scrollBy: !1,
                scrollTo: !1,
                setInterval: !1,
                setTimeout: !1,
                status: !1,
                top: !1,
                Uint16Array: !1,
                Uint32Array: !1,
                Uint8Array: !1,
                WebSocket: !1,
                window: !1,
                Worker: !1,
                XMLHttpRequest: !1,
                XPathEvaluator: !1,
                XPathException: !1,
                XPathExpression: !1,
                XPathNamespace: !1,
                XPathNSResolver: !1,
                XPathResult: !1
            },
            f = {
                require: !1,
                respond: !1,
                getRow: !1,
                emit: !1,
                send: !1,
                start: !1,
                sum: !1,
                log: !1,
                exports: !1,
                module: !1
            },
            g = {
                alert: !1,
                confirm: !1,
                console: !1,
                Debug: !1,
                opera: !1,
                prompt: !1
            },
            h = {
                dojo: !1,
                dijit: !1,
                dojox: !1,
                define: !1,
                require: !1
            },
            i = {
                "\b": "\\b",
                "\t": "\\t",
                "\n": "\\n",
                "\f": "\\f",
                "\r": "\\r",
                '"': '\\"',
                "/": "\\/",
                "\\": "\\\\"
            },
            j, k = ["closure", "exception", "global", "label", "outer", "unused", "var"],
            l, m, n, o, p, q, r = {
                $: !1,
                jQuery: !1
            },
            s, t, u, v, w = {
                $: !1,
                $$: !1,
                Assets: !1,
                Browser: !1,
                Chain: !1,
                Class: !1,
                Color: !1,
                Cookie: !1,
                Core: !1,
                Document: !1,
                DomReady: !1,
                DOMReady: !1,
                Drag: !1,
                Element: !1,
                Elements: !1,
                Event: !1,
                Events: !1,
                Fx: !1,
                Group: !1,
                Hash: !1,
                HtmlTable: !1,
                Iframe: !1,
                IframeShim: !1,
                InputValidator: !1,
                instanceOf: !1,
                Keyboard: !1,
                Locale: !1,
                Mask: !1,
                MooTools: !1,
                Native: !1,
                Options: !1,
                OverText: !1,
                Request: !1,
                Scroller: !1,
                Slick: !1,
                Slider: !1,
                Sortables: !1,
                Spinner: !1,
                Swiff: !1,
                Tips: !1,
                Type: !1,
                typeOf: !1,
                URI: !1,
                Window: !1
            },
            x, y = {
                __filename: !1,
                __dirname: !1,
                exports: !1,
                Buffer: !1,
                GLOBAL: !1,
                global: !1,
                module: !1,
                process: !1,
                require: !1
            },
            z, A, B, C, D, E = {
                $: !1,
                $$: !1,
                $A: !1,
                $F: !1,
                $H: !1,
                $R: !1,
                $break: !1,
                $continue: !1,
                $w: !1,
                Abstract: !1,
                Ajax: !1,
                Class: !1,
                Enumerable: !1,
                Element: !1,
                Event: !1,
                Field: !1,
                Form: !1,
                Hash: !1,
                Insertion: !1,
                ObjectRange: !1,
                PeriodicalExecuter: !1,
                Position: !1,
                Prototype: !1,
                Selector: !1,
                Template: !1,
                Toggle: !1,
                Try: !1,
                Autocompleter: !1,
                Builder: !1,
                Control: !1,
                Draggable: !1,
                Draggables: !1,
                Droppables: !1,
                Effect: !1,
                Sortable: !1,
                SortableObserver: !1,
                Sound: !1,
                Scriptaculous: !1
            },
            F = {
                defineClass: !1,
                deserialize: !1,
                gc: !1,
                help: !1,
                load: !1,
                loadClass: !1,
                print: !1,
                quit: !1,
                readFile: !1,
                readUrl: !1,
                runCommand: !1,
                seal: !1,
                serialize: !1,
                spawn: !1,
                sync: !1,
                toint32: !1,
                version: !1
            },
            G, H, I, J = {
                Array: !1,
                Boolean: !1,
                Date: !1,
                decodeURI: !1,
                decodeURIComponent: !1,
                encodeURI: !1,
                encodeURIComponent: !1,
                Error: !1,
                eval: !1,
                EvalError: !1,
                Function: !1,
                hasOwnProperty: !1,
                isFinite: !1,
                isNaN: !1,
                JSON: !1,
                Math: !1,
                Number: !1,
                Object: !1,
                parseInt: !1,
                parseFloat: !1,
                RangeError: !1,
                ReferenceError: !1,
                RegExp: !1,
                String: !1,
                SyntaxError: !1,
                TypeError: !1,
                URIError: !1
            },
            K = {
                E: !0,
                LN2: !0,
                LN10: !0,
                LOG2E: !0,
                LOG10E: !0,
                MAX_VALUE: !0,
                MIN_VALUE: !0,
                NEGATIVE_INFINITY: !0,
                PI: !0,
                POSITIVE_INFINITY: !0,
                SQRT1_2: !0,
                SQRT2: !0
            },
            L, M = {},
            N, O, P, Q, R = {
                ActiveXObject: !0,
                Enumerator: !0,
                GetObject: !0,
                ScriptEngine: !0,
                ScriptEngineBuildVersion: !0,
                ScriptEngineMajorVersion: !0,
                ScriptEngineMinorVersion: !0,
                VBArray: !0,
                WSH: !0,
                WScript: !0
            },
            S, T, U, V, W, X, Y, Z, $;
        (function() {
            S = /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i, T = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/, U = /^\s*([(){}\[.,:;'"~\?\]#@]|==?=?|\/(\*(jshint|jslint|members?|global)?|=|\/)?|\*[\/=]?|\+(?:=|\++)?|-(?:=|-+)?|%=?|&[&=]?|\|[|=]?|>>?>?=?|<([\/=!]|\!(\[|--)?|<=?)?|\^=?|\!=?=?|[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+([xX][0-9a-fA-F]+|\.[0-9]*)?([eE][+\-]?[0-9]+)?)/, V = /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/, W = /[\u0000-\u001f&<"\/\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, X = /\*\/|\/\*/, Y = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/, Z = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i, $ = /^\s*\/\*\s*falls\sthrough\s*\*\/\s*$/
        })(), typeof Array.isArray != "function" && (Array.isArray = function(a) {
            return Object.prototype.toString.apply(a) === "[object Array]"
        }), typeof Object.create != "function" && (Object.create = function(a) {
            return _.prototype = a, new _
        }), typeof Object.keys != "function" && (Object.keys = function(a) {
            var b = [],
                c;
            for (c in a) ba(a, c) && b.push(c);
            return b
        }), typeof String.prototype.entityify != "function" && (String.prototype.entityify = function() {
            return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }), typeof String.prototype.isAlpha != "function" && (String.prototype.isAlpha = function() {
            return this >= "a" && this <= "z￿" || this >= "A" && this <= "Z￿"
        }), typeof String.prototype.isDigit != "function" && (String.prototype.isDigit = function() {
            return this >= "0" && this <= "9"
        }), typeof String.prototype.supplant != "function" && (String.prototype.supplant = function(a) {
            return this.replace(/\{([^{}]*)\}/g, function(b, c) {
                var d = a[c];
                return typeof d == "string" || typeof d == "number" ? d : b
            })
        }), typeof String.prototype.name != "function" && (String.prototype.name = function() {
            return Y.test(this) ? this : V.test(this) ? '"' + this.replace(W, function(a) {
                var b = i[a];
                return b ? b : "\\u" + ("0000" + a.charCodeAt().toString(16)).slice(-4)
            }) + '"' : '"' + this + '"'
        });
        var bi = function() {
            function e() {
                var b, e;
                return c >= s.length ? !1 : (a = 1, d = s[c], c += 1, b = d.search(/ \t/), b >= 0 && bf("Mixed spaces and tabs.", c, b + 1), d = d.replace(/\t/g, N), b = d.search(T), b >= 0 && bf("Unsafe character.", c, b), A.maxlen && A.maxlen < d.length && bf("Line too long.", c, d.length), e = d.search(/\s+$/), A.trailing && ~e && !~d.search(/^\s+$/) && bf("Trailing whitespace.", c, e), !0)
            }

            function f(d, e) {
                var f, g;
                return d === "(color)" || d === "(range)" ? g = {
                    type: d
                } : d === "(punctuator)" || d === "(identifier)" && ba(M, e) ? g = M[e] || M["(error)"] : g = M[d], g = Object.create(g), (d === "(string)" || d === "(range)") && !A.scripturl && Z.test(e) && bf("Script URL.", c, b), d === "(identifier)" && (g.identifier = !0, e === "__proto__" && !A.proto ? bf("The '{a}' property is deprecated.", c, b, e) : e === "__iterator__" && !A.iterator ? bf("'{a}' is only available in JavaScript 1.7.", c, b, e) : A.nomen && (e.charAt(0) === "_" || e.charAt(e.length - 1) === "_") && bf("Unexpected {a} in '{b}'.", c, b, "dangling '_'", e)), g.value = e, g.line = c, g.character = a, g.from = b, f = g.id, f !== "(endline)" && (C = f && ("(,=:[!&|?{};".indexOf(f.charAt(f.length - 1)) >= 0 || f === "return")), g
            }
            var a, b, c, d;
            return {
                init: function(a) {
                    typeof a == "string" ? s = a.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n") : s = a, s[0] && s[0].substr(0, 2) == "#!" && (s[0] = ""), c = 0, e(), b = 1
                },
                range: function(e, g) {
                    var h, i = "";
                    b = a, d.charAt(0) !== e && bh("Expected '{a}' and instead saw '{b}'.", c, a, e, d.charAt(0));
                    for (;;) {
                        d = d.slice(1), a += 1, h = d.charAt(0);
                        switch (h) {
                            case "":
                                bh("Missing '{a}'.", c, a, h);
                                break;
                            case g:
                                return d = d.slice(1), a += 1, f("(range)", i);
                            case "\\":
                                bf("Unexpected '{a}'.", c, a, h)
                        }
                        i += h
                    }
                },
                token: function() {
                    function s(c) {
                        var e = c.exec(d),
                            f;
                        if (e) return n = e[0].length, f = e[1], h = f.charAt(0), d = d.substr(n), b = a + n - f.length, a += n, f
                    }

                    function t(g) {
                        function k(b) {
                            var e = parseInt(d.substr(i + 1, b), 16);
                            i += b, e >= 32 && e <= 126 && e !== 34 && e !== 92 && e !== 39 && bf("Unnecessary escapement.", c, a), a += b, h = String.fromCharCode(e)
                        }
                        var h, i, j = "";
                        q && g !== '"' && bf("Strings must use doublequote.", c, a), i = 0;
                        for (;;) {
                            while (i >= d.length) i = 0, e() || bh("Unclosed string.", c, b);
                            h = d.charAt(i);
                            if (h === g) return a += 1, d = d.substr(i + 1), f("(string)", j, g);
                            if (h < " ") {
                                if (h === "\n" || h === "\r") break;
                                bf("Control character in string: {a}.", c, a + i, d.slice(0, i))
                            } else if (h === "\\") {
                                i += 1, a += 1, h = d.charAt(i);
                                switch (h) {
                                    case "\\":
                                    case '"':
                                    case "/":
                                        break;
                                    case "'":
                                        q && bf("Avoid \\'.", c, a);
                                        break;
                                    case "b":
                                        h = "\b";
                                        break;
                                    case "f":
                                        h = "\f";
                                        break;
                                    case "n":
                                        h = "\n";
                                        break;
                                    case "r":
                                        h = "\r";
                                        break;
                                    case "t":
                                        h = "\t";
                                        break;
                                    case "u":
                                        k(4);
                                        break;
                                    case "v":
                                        q && bf("Avoid \\v.", c, a), h = "";
                                        break;
                                    case "x":
                                        q && bf("Avoid \\x-.", c, a), k(2);
                                        break;
                                    default:
                                        bf("Bad escapement.", c, a)
                                }
                            }
                            j += h, a += 1, i += 1
                        }
                    }
                    var g, h, i, j, k, l, m, n, o, p, r;
                    for (;;) {
                        if (!d) return f(e() ? "(endline)" : "(end)", "");
                        r = s(U);
                        if (!r) {
                            r = "", h = "";
                            while (d && d < "!") d = d.substr(1);
                            d && bh("Unexpected '{a}'.", c, a, d.substr(0, 1))
                        } else {
                            if (h.isAlpha() || h === "_" || h === "$") return f("(identifier)", r);
                            if (h.isDigit()) return isFinite(Number(r)) || bf("Bad number '{a}'.", c, a, r), d.substr(0, 1).isAlpha() && bf("Missing space after '{a}'.", c, a, r), h === "0" && (j = r.substr(1, 1), j.isDigit() ? O.id !== "." && bf("Don't use extra leading zeros '{a}'.", c, a, r) : q && (j === "x" || j === "X") && bf("Avoid 0x-. '{a}'.", c, a, r)), r.substr(r.length - 1) === "." && bf("A trailing decimal point can be confused with a dot '{a}'.", c, a, r), f("(number)", r);
                            switch (r) {
                                case '"':
                                case "'":
                                    return t(r);
                                case "//":
                                    H && bf("Unexpected comment.", c, a), d = "", O.comment = !0;
                                    break;
                                case "/*":
                                    H && bf("Unexpected comment.", c, a);
                                    for (;;) {
                                        m = d.search(X);
                                        if (m >= 0) break;
                                        e() || bh("Unclosed comment.", c, a)
                                    }
                                    a += m + 2, d.substr(m, 1) === "/" && bh("Nested comment.", c, a), d = d.substr(m + 2), O.comment = !0;
                                    break;
                                case "/*members":
                                case "/*member":
                                case "/*jshint":
                                case "/*jslint":
                                case "/*global":
                                case "*/":
                                    return {
                                        value: r,
                                        type: "special",
                                        line: c,
                                        character: a,
                                        from: b
                                    };
                                case "":
                                    break;
                                case "/":
                                    O.id === "/=" && bh("A regular expression literal can be confused with '/='.", c, b);
                                    if (C) {
                                        k = 0, i = 0, n = 0;
                                        for (;;) {
                                            g = !0, h = d.charAt(n), n += 1;
                                            switch (h) {
                                                case "":
                                                    bh("Unclosed regular expression.", c, b);
                                                    return;
                                                case "/":
                                                    k > 0 && bf("Unescaped '{a}'.", c, b + n, "/"), h = d.substr(0, n - 1), p = {
                                                        g: !0,
                                                        i: !0,
                                                        m: !0
                                                    };
                                                    while (p[d.charAt(n)] === !0) p[d.charAt(n)] = !1, n += 1;
                                                    return a += n, d = d.substr(n), p = d.charAt(0), (p === "/" || p === "*") && bh("Confusing regular expression.", c, b), f("(regexp)", h);
                                                case "\\":
                                                    h = d.charAt(n), h < " " ? bf("Unexpected control character in regular expression.", c, b + n) : h === "<" && bf("Unexpected escaped character '{a}' in regular expression.", c, b + n, h), n += 1;
                                                    break;
                                                case "(":
                                                    k += 1, g = !1;
                                                    if (d.charAt(n) === "?") {
                                                        n += 1;
                                                        switch (d.charAt(n)) {
                                                            case ":":
                                                            case "=":
                                                            case "!":
                                                                n += 1;
                                                                break;
                                                            default:
                                                                bf("Expected '{a}' and instead saw '{b}'.", c, b + n, ":", d.charAt(n))
                                                        }
                                                    } else i += 1;
                                                    break;
                                                case "|":
                                                    g = !1;
                                                    break;
                                                case ")":
                                                    k === 0 ? bf("Unescaped '{a}'.", c, b + n, ")") : k -= 1;
                                                    break;
                                                case " ":
                                                    p = 1;
                                                    while (d.charAt(n) === " ") n += 1, p += 1;
                                                    p > 1 && bf("Spaces are hard to count. Use {{a}}.", c, b + n, p);
                                                    break;
                                                case "[":
                                                    h = d.charAt(n), h === "^" && (n += 1, A.regexp ? bf("Insecure '{a}'.", c, b + n, h) : d.charAt(n) === "]" && bh("Unescaped '{a}'.", c, b + n, "^")), p = !1, h === "]" && (bf("Empty class.", c, b + n - 1), p = !0);
                                                    u: do {
                                                        h = d.charAt(n), n += 1;
                                                        switch (h) {
                                                            case "[":
                                                            case "^":
                                                                bf("Unescaped '{a}'.", c, b + n, h), p = !0;
                                                                break;
                                                            case "-":
                                                                p ? p = !1 : (bf("Unescaped '{a}'.", c, b + n, "-"), p = !0);
                                                                break;
                                                            case "]":
                                                                !p && !A.regexdash && bf("Unescaped '{a}'.", c, b + n - 1, "-");
                                                                break u;
                                                            case "\\":
                                                                h = d.charAt(n), h < " " ? bf("Unexpected control character in regular expression.", c, b + n) : h === "<" && bf("Unexpected escaped character '{a}' in regular expression.", c, b + n, h), n += 1, p = !0;
                                                                break;
                                                            case "/":
                                                                bf("Unescaped '{a}'.", c, b + n - 1, "/"), p = !0;
                                                                break;
                                                            case "<":
                                                                p = !0;
                                                                break;
                                                            default:
                                                                p = !0
                                                        }
                                                    } while (h);
                                                    break;
                                                case ".":
                                                    A.regexp && bf("Insecure '{a}'.", c, b + n, h);
                                                    break;
                                                case "]":
                                                case "?":
                                                case "{":
                                                case "}":
                                                case "+":
                                                case "*":
                                                    bf("Unescaped '{a}'.", c, b + n, h)
                                            }
                                            if (g) switch (d.charAt(n)) {
                                                case "?":
                                                case "+":
                                                case "*":
                                                    n += 1, d.charAt(n) === "?" && (n += 1);
                                                    break;
                                                case "{":
                                                    n += 1, h = d.charAt(n), (h < "0" || h > "9") && bf("Expected a number and instead saw '{a}'.", c, b + n, h), n += 1, o = +h;
                                                    for (;;) {
                                                        h = d.charAt(n);
                                                        if (h < "0" || h > "9") break;
                                                        n += 1, o = +h + o * 10
                                                    }
                                                    l = o;
                                                    if (h === ",") {
                                                        n += 1, l = Infinity, h = d.charAt(n);
                                                        if (h >= "0" && h <= "9") {
                                                            n += 1, l = +h;
                                                            for (;;) {
                                                                h = d.charAt(n);
                                                                if (h < "0" || h > "9") break;
                                                                n += 1, l = +h + l * 10
                                                            }
                                                        }
                                                    }
                                                    d.charAt(n) !== "}" ? bf("Expected '{a}' and instead saw '{b}'.", c, b + n, "}", h) : n += 1, d.charAt(n) === "?" && (n += 1), o > l && bf("'{a}' should not be greater than '{b}'.", c, b + n, o, l)
                                            }
                                        }
                                        return h = d.substr(0, n - 1), a += n, d = d.substr(n), f("(regexp)", h)
                                    }
                                    return f("(punctuator)", r);
                                case "#":
                                    return f("(punctuator)", r);
                                default:
                                    return f("(punctuator)", r)
                            }
                        }
                    }
                }
            }
        }();
        bC("(number)", function() {
            return this
        }), bC("(string)", function() {
            return this
        }), M["(identifier)"] = {
            type: "(identifier)",
            lbp: 0,
            identifier: !0,
            nud: function() {
                var b = this.value,
                    c = G[b],
                    d;
                typeof c == "function" ? c = undefined : typeof c == "boolean" && (d = j, j = l[0], bj(b, "var"), c = j, j = d);
                if (j === c) switch (j[b]) {
                        case "unused":
                            j[b] = "var";
                            break;
                        case "unction":
                            j[b] = "function", this["function"] = !0;
                            break;
                        case "function":
                            this["function"] = !0;
                            break;
                        case "label":
                            be("'{a}' is a statement label.", O, b)
                    } else if (j["(global)"]) a != "typeof" && a != "delete" && A.undef && typeof B[b] != "boolean" && be("'{a}' is not defined.", O, b), bU(O);
                    else switch (j[b]) {
                        case "closure":
                        case "function":
                        case "var":
                        case "unused":
                            be("'{a}' used out of scope.", O, b);
                            break;
                        case "label":
                            be("'{a}' is a statement label.", O, b);
                            break;
                        case "outer":
                        case "global":
                            break;
                        default:
                            if (c === !0) j[b] = !0;
                            else if (c === null) be("'{a}' is not allowed.", O, b), bU(O);
                            else if (typeof c != "object") a != "typeof" && a != "delete" && A.undef ? be("'{a}' is not defined.", O, b) : j[b] = !0, bU(O);
                            else switch (c[b]) {
                                case "function":
                                case "unction":
                                    this["function"] = !0, c[b] = "closure", j[b] = c["(global)"] ? "global" : "outer";
                                    break;
                                case "var":
                                case "unused":
                                    c[b] = "closure", j[b] = c["(global)"] ? "global" : "outer";
                                    break;
                                case "closure":
                                case "parameter":
                                    j[b] = c["(global)"] ? "global" : "outer";
                                    break;
                                case "label":
                                    be("'{a}' is a statement label.", O, b)
                            }
                    }
                    return this
            },
            led: function() {
                bg("Expected an operator and instead saw '{a}'.", x, x.value)
            }
        }, bC("(regexp)", function() {
            return this
        }), bx("(endline)"), bx("(begin)"), bx("(end)").reach = !0, bx("</").reach = !0, bx("<!"), bx("<!--"), bx("-->"), bx("(error)").reach = !0, bx("}").reach = !0, bx(")"), bx("]"), bx('"').reach = !0, bx("'").reach = !0, bx(";"), bx(":").reach = !0, bx(","), bx("#"), bx("@"), bD("else"), bD("case").reach = !0, bD("catch"), bD("default").reach = !0, bD("finally"), bE("arguments", function(a) {
            L && j["(global)"] && be("Strict violation.", a)
        }), bE("eval"), bE("false"), bE("Infinity"), bE("NaN"), bE("null"), bE("this", function(a) {
            L && (j["(statement)"] && j["(name)"].charAt(0) > "Z" || j["(global)"]) && be("Strict violation.", a)
        }), bE("true"), bE("undefined"), bI("=", "assign", 20), bI("+=", "assignadd", 20), bI("-=", "assignsub", 20), bI("*=", "assignmult", 20), bI("/=", "assigndiv", 20).nud = function() {
            bg("A regular expression literal can be confused with '/='.")
        }, bI("%=", "assignmod", 20), bK("&=", "assignbitand", 20), bK("|=", "assignbitor", 20), bK("^=", "assignbitxor", 20), bK("<<=", "assignshiftleft", 20), bK(">>=", "assignshiftright", 20), bK(">>>=", "assignshiftrightunsigned", 20), bF("?", function(a, b) {
            return b.left = a, b.right = bn(10), bm(":"), b["else"] = bn(10), b
        }, 30), bF("||", "or", 40), bF("&&", "and", 50), bJ("|", "bitor", 70), bJ("^", "bitxor", 80), bJ("&", "bitand", 90), bG("==", function(a, b) {
            var c = A.eqnull && (a.value == "null" || b.value == "null");
            return !c && A.eqeqeq ? be("Expected '{a}' and instead saw '{b}'.", this, "===", "==") : bH(a) ? be("Use '{a}' to compare with '{b}'.", this, "===", a.value) : bH(b) && be("Use '{a}' to compare with '{b}'.", this, "===", b.value), this
        }), bG("==="), bG("!=", function(a, b) {
            var c = A.eqnull && (a.value == "null" || b.value == "null");
            return !c && A.eqeqeq ? be("Expected '{a}' and instead saw '{b}'.", this, "!==", "!=") : bH(a) ? be("Use '{a}' to compare with '{b}'.", this, "!==", a.value) : bH(b) && be("Use '{a}' to compare with '{b}'.", this, "!==", b.value), this
        }), bG("!=="), bG("<"), bG(">"), bG("<="), bG(">="), bJ("<<", "shiftleft", 120), bJ(">>", "shiftright", 120), bJ(">>>", "shiftrightunsigned", 120), bF("in", "in", 120), bF("instanceof", "instanceof", 120), bF("+", function(a, b) {
            var c = bn(130);
            return a && c && a.id === "(string)" && c.id === "(string)" ? (a.value += c.value, a.character = c.character, !A.scripturl && Z.test(a.value) && be("JavaScript URL.", a), a) : (b.left = a, b.right = c, b)
        }, 130), bB("+", "num"), bB("+++", function() {
            return be("Confusing pluses."), this.right = bn(150), this.arity = "unary", this
        }), bF("+++", function(a) {
            return be("Confusing pluses."), this.left = a, this.right = bn(130), this
        }, 130), bF("-", "sub", 130), bB("-", "neg"), bB("---", function() {
            return be("Confusing minuses."), this.right = bn(150), this.arity = "unary", this
        }), bF("---", function(a) {
            return be("Confusing minuses."), this.left = a, this.right = bn(130), this
        }, 130), bF("*", "mult", 140), bF("/", "div", 140), bF("%", "mod", 140), bL("++", "postinc"), bB("++", "preinc"), M["++"].exps = !0, bL("--", "postdec"), bB("--", "predec"), M["--"].exps = !0, bB("delete", function() {
            var a = bn(0);
            return (!a || a.id !== "." && a.id !== "[") && be("Variables should not be deleted."), this.first = a, this
        }).exps = !0, bB("~", function() {
            return A.bitwise && be("Unexpected '{a}'.", this, "~"), bn(150), this
        }), bB("!", function() {
            return this.right = bn(150), this.arity = "unary", b[this.right.id] === !0 && be("Confusing use of '{a}'.", this, "!"), this
        }), bB("typeof", "typeof"), bB("new", function() {
            var a = bn(155),
                b;
            if (a && a.id !== "function")
                if (a.identifier) {
                    a["new"] = !0;
                    switch (a.value) {
                        case "Object":
                            be("Use the object literal notation {}.", O);
                            break;
                        case "Number":
                        case "String":
                        case "Boolean":
                        case "Math":
                        case "JSON":
                            be("Do not use {a} as a constructor.", O, a.value);
                            break;
                        case "Function":
                            A.evil || be("The Function constructor is eval.");
                            break;
                        case "Date":
                        case "RegExp":
                            break;
                        default:
                            a.id !== "function" && (b = a.value.substr(0, 1), A.newcap && (b < "A" || b > "Z") && be("A constructor name should start with an uppercase letter.", O))
                    }
                } else a.id !== "." && a.id !== "[" && a.id !== "(" && be("Bad constructor.", O);
            else A.supernew || be("Weird construction. Delete 'new'.", this);
            return bo(O, x), x.id !== "(" && !A.supernew && be("Missing '()' invoking a constructor."), this.first = a, this
        }), M["new"].exps = !0, bB("void").exps = !0, bF(".", function(a, b) {
            bo(D, O), bp();
            var c = bN();
            return typeof c == "string" && bT(c), b.left = a, b.right = c, A.noarg && a && a.value === "arguments" && (c === "callee" || c === "caller") ? be("Avoid arguments.{a}.", a, c) : !A.evil && a && a.value === "document" && (c === "write" || c === "writeln") && be("document.write can be a form of eval.", a), !A.evil && (c === "eval" || c === "execScript") && be("eval is evil."), b
        }, 160, !0), bF("(", function(a, b) {
            D.id !== "}" && D.id !== ")" && bp(D, O), bq(), A.immed && !a.immed && a.id === "function" && be("Wrap an immediate function invocation in parentheses to assist the reader in understanding that the expression is the result of a function, and not the function itself.");
            var c = 0,
                d = [];
            a && a.type === "(identifier)" && a.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/) && a.value !== "Number" && a.value !== "String" && a.value !== "Boolean" && a.value !== "Date" && (a.value === "Math" ? be("Math is not a function.", a) : A.newcap && be("Missing 'new' prefix when invoking a constructor.", a));
            if (x.id !== ")")
                for (;;) {
                    d[d.length] = bn(10), c += 1;
                    if (x.id !== ",") break;
                    bv()
                }
            return bm(")"), bq(D, O), typeof a == "object" && (a.value === "parseInt" && c === 1 && be("Missing radix parameter.", a), A.evil || (a.value === "eval" || a.value === "Function" || a.value === "execScript" ? be("eval is evil.", a) : d[0] && d[0].id === "(string)" && (a.value === "setTimeout" || a.value === "setInterval") && be("Implied eval is evil. Pass a function instead of a string.", a)), !a.identifier && a.id !== "." && a.id !== "[" && a.id !== "(" && a.id !== "&&" && a.id !== "||" && a.id !== "?" && be("Bad invocation.", a)), b.left = a, b
        }, 155, !0).exps = !0, bB("(", function() {
            bq(), x.id === "function" && (x.immed = !0);
            var a = bn(0);
            return bm(")", this), bq(D, O), A.immed && a.id === "function" && (x.id === "(" ? be("Move the invocation into the parens that contain the function.", x) : be("Do not wrap function literals in parens unless they are to be immediately invoked.", this)), a
        }), bF("[", function(a, b) {
            bp(D, O), bq();
            var c = bn(0),
                d;
            return c && c.type === "(string)" && (!A.evil && (c.value === "eval" || c.value === "execScript") && be("eval is evil.", b), bT(c.value), !A.sub && Y.test(c.value) && (d = M[c.value], (!d || !d.reserved) && be("['{a}'] is better written in dot notation.", c, c.value))), bm("]", b), bq(D, O), b.left = a, b.right = c, b
        }, 160, !0), bB("[", function() {
            var a = O.line !== x.line;
            this.first = [], a && (p += A.indent, x.from === p + A.indent && (p += A.indent));
            while (x.id !== "(end)") {
                while (x.id === ",") be("Extra comma."), bm(",");
                if (x.id === "]") break;
                a && O.line !== x.line && bt(), this.first.push(bn(10));
                if (x.id !== ",") break;
                bv();
                if (x.id === "]" && !A.es5) {
                    be("Extra comma.", O);
                    break
                }
            }
            return a && (p -= A.indent, bt()), bm("]", this), this
        }, 160),
        function(a) {
            a.nud = function() {
                var a, b, c, d, e, f = {},
                    g;
                a = O.line !== x.line, a && (p += A.indent, x.from === p + A.indent && (p += A.indent));
                for (;;) {
                    if (x.id === "}") break;
                    a && bt();
                    if (x.value === "get" && bl().id !== ":") bm("get"), A.es5 || bg("get/set are ES5 features."), c = bV(), c || bg("Missing property name."), g = x, bo(O, x), b = bX(), !A.loopfunc && j["(loopage)"] && be("Don't make functions within a loop.", g), e = b["(params)"], e && be("Unexpected parameter '{a}' in get {b} function.", g, e[0], c), bo(O, x), bm(","), bt(), bm("set"), d = bV(), c !== d && bg("Expected {a} and instead saw {b}.", O, c, d), g = x, bo(O, x), b = bX(), e = b["(params)"], (!e || e.length !== 1 || e[0] !== "value") && be("Expected (value) in set {a} function.", g, c);
                    else {
                        c = bV();
                        if (typeof c != "string") break;
                        bm(":"), br(O, x), bn(10)
                    }
                    f[c] === !0 && be("Duplicate member '{a}'.", x, c), f[c] = !0, bT(c);
                    if (x.id === ",") bv(), x.id === "," ? be("Extra comma.", O) : x.id === "}" && !A.es5 && be("Extra comma.", O);
                    else break
                }
                return a && (p -= A.indent, bt()), bm("}", this), this
            }, a.fud = function() {
                bg("Expected to see a statement and instead saw a block.", O)
            }
        }(bx("{"));
        var bY = by("var", function(a) {
            var b, c, d;
            j["(onevar)"] && A.onevar ? be("Too many var statements.") : j["(global)"] || (j["(onevar)"] = !0), this.first = [];
            for (;;) {
                br(O, x), b = bN(), j["(global)"] && B[b] === !1 && be("Redefinition of '{a}'.", O, b), bj(b, "unused");
                if (a) break;
                c = O, this.first.push(O), x.id === "=" && (br(O, x), bm("="), br(O, x), x.id === "undefined" && be("It is not necessary to initialize '{a}' to 'undefined'.", O, b), bl(0).id === "=" && x.identifier && bg("Variable {a} was not declared correctly.", x, x.value), d = bn(0), c.first = d);
                if (x.id !== ",") break;
                bv()
            }
            return this
        });
        bY.exps = !0, bz("function", function() {
            o && be("Function declarations should not be placed in blocks. Use a function expression or move the statement to the top of the outer function.", O);
            var a = bN();
            return bo(O, x), bj(a, "unction"), bX(a, !0), x.id === "(" && x.line === O.line && bg("Function declarations are not invocable. Wrap the whole function invocation in parens."), this
        }), bB("function", function() {
            var a = bM();
            return a ? bo(O, x) : br(O, x), bX(a), !A.loopfunc && j["(loopage)"] && be("Don't make functions within a loop."), this
        }), bz("if", function() {
            var a = x;
            return bm("("), br(this, a), bq(), bn(20), x.id === "=" && (A.boss || be("Expected a conditional expression and instead saw an assignment."), bm("="), bn(20)), bm(")", a), bq(D, O), bS(!0, !0), x.id === "else" && (br(O, x), bm("else"), x.id === "if" || x.id === "switch" ? bP(!0) : bS(!0, !0)), this
        }), bz("try", function() {
            var a, b, c;
            bS(!1), x.id === "catch" && (bm("catch"), br(O, x), bm("("), c = G, G = Object.create(c), b = x.value, x.type !== "(identifier)" ? be("Expected an identifier and instead saw '{a}'.", x, b) : bj(b, "exception"), bm(), bm(")"), bS(!1), a = !0, G = c);
            if (x.id === "finally") {
                bm("finally"), bS(!1);
                return
            }
            return a || bg("Expected '{a}' and instead saw '{b}'.", x, "catch", x.value), this
        }), bz("while", function() {
            var a = x;
            return j["(breakage)"] += 1, j["(loopage)"] += 1, bm("("), br(this, a), bq(), bn(20), x.id === "=" && (A.boss || be("Expected a conditional expression and instead saw an assignment."), bm("="), bn(20)), bm(")", a), bq(D, O), bS(!0, !0), j["(breakage)"] -= 1, j["(loopage)"] -= 1, this
        }).labelled = !0, bD("with"), bz("switch", function() {
            var a = x,
                b = !1;
            j["(breakage)"] += 1, bm("("), br(this, a), bq(), this.condition = bn(20), bm(")", a), bq(D, O), br(O, x), a = x, bm("{"), br(O, x), p += A.indent, this.cases = [];
            for (;;) switch (x.id) {
                case "case":
                    switch (j["(verb)"]) {
                        case "break":
                        case "case":
                        case "continue":
                        case "return":
                        case "switch":
                        case "throw":
                            break;
                        default:
                            $.test(s[x.line - 2]) || be("Expected a 'break' statement before 'case'.", O)
                    }
                    bt(-A.indent), bm("case"), this.cases.push(bn(20)), b = !0, bm(":"), j["(verb)"] = "case";
                    break;
                case "default":
                    switch (j["(verb)"]) {
                        case "break":
                        case "continue":
                        case "return":
                        case "throw":
                            break;
                        default:
                            $.test(s[x.line - 2]) || be("Expected a 'break' statement before 'default'.", O)
                    }
                    bt(-A.indent), bm("default"), b = !0, bm(":");
                    break;
                case "}":
                    p -= A.indent, bt(), bm("}", a), (this.cases.length === 1 || this.condition.id === "true" || this.condition.id === "false") && be("This 'switch' should be an 'if'.", this), j["(breakage)"] -= 1, j["(verb)"] = undefined;
                    return;
                case "(end)":
                    bg("Missing '{a}'.", x, "}");
                    return;
                default:
                    if (b) switch (O.id) {
                        case ",":
                            bg("Each value should have its own case label.");
                            return;
                        case ":":
                            bR();
                            break;
                        default:
                            bg("Missing ':' on a case clause.", O)
                    } else bg("Expected '{a}' and instead saw '{b}'.", x, "case", x.value)
            }
        }).labelled = !0, by("debugger", function() {
            return A.debug || be("All 'debugger' statements should be removed."), this
        }).exps = !0,
        function() {
            var a = by("do", function() {
                j["(breakage)"] += 1, j["(loopage)"] += 1, this.first = bS(!0), bm("while");
                var a = x;
                return br(O, a), bm("("), bq(), bn(20), x.id === "=" && (A.boss || be("Expected a conditional expression and instead saw an assignment."), bm("="), bn(20)), bm(")", a), bq(D, O), j["(breakage)"] -= 1, j["(loopage)"] -= 1, this
            });
            a.labelled = !0, a.exps = !0
        }(), bz("for", function() {
            var a, b = x;
            j["(breakage)"] += 1, j["(loopage)"] += 1, bm("("), br(this, b), bq();
            if (bl(x.id === "var" ? 1 : 0).id === "in") {
                if (x.id === "var") bm("var"), bY.fud.call(bY, !0);
                else {
                    switch (j[x.value]) {
                        case "unused":
                            j[x.value] = "var";
                            break;
                        case "var":
                            break;
                        default:
                            be("Bad for in variable '{a}'.", x, x.value)
                    }
                    bm()
                }
                return bm("in"), bn(20), bm(")", b), a = bS(!0, !0), A.forin && (a.length > 1 || typeof a[0] != "object" || a[0].value !== "if") && be("The body of a for in should be wrapped in an if statement to filter unwanted properties from the prototype.", this), j["(breakage)"] -= 1, j["(loopage)"] -= 1, this
            }
            if (x.id !== ";")
                if (x.id === "var") bm("var"), bY.fud.call(bY);
                else
                    for (;;) {
                        bn(0, "for");
                        if (x.id !== ",") break;
                        bv()
                    }
                bu(O), bm(";"), x.id !== ";" && (bn(20), x.id === "=" && (A.boss || be("Expected a conditional expression and instead saw an assignment."), bm("="), bn(20))), bu(O), bm(";"), x.id === ";" && bg("Expected '{a}' and instead saw '{b}'.", x, ")", ";");
            if (x.id !== ")")
                for (;;) {
                    bn(0, "for");
                    if (x.id !== ",") break;
                    bv()
                }
            return bm(")", b), bq(D, O), bS(!0, !0), j["(breakage)"] -= 1, j["(loopage)"] -= 1, this
        }).labelled = !0, by("break", function() {
            var a = x.value;
            return j["(breakage)"] === 0 && be("Unexpected '{a}'.", x, this.value), bu(this), x.id !== ";" && O.line === x.line && (j[a] !== "label" ? be("'{a}' is not a statement label.", x, a) : G[a] !== j && be("'{a}' is out of scope.", x, a), this.first = x, bm()), bO("break"), this
        }).exps = !0, by("continue", function() {
            var a = x.value;
            return j["(breakage)"] === 0 && be("Unexpected '{a}'.", x, this.value), bu(this), x.id !== ";" ? O.line === x.line && (j[a] !== "label" ? be("'{a}' is not a statement label.", x, a) : G[a] !== j && be("'{a}' is out of scope.", x, a), this.first = x, bm()) : j["(loopage)"] || be("Unexpected '{a}'.", x, this.value), bO("continue"), this
        }).exps = !0, by("return", function() {
            return bu(this), x.id === "(regexp)" && be("Wrap the /regexp/ literal in parens to disambiguate the slash operator."), x.id !== ";" && !x.reach && (br(O, x), this.first = bn(20)), bO("return"), this
        }).exps = !0, by("throw", function() {
            return bu(this), br(O, x), this.first = bn(20), bO("throw"), this
        }).exps = !0, bD("class"), bD("const"), bD("enum"), bD("export"), bD("extends"), bD("import"), bD("super"), bD("let"), bD("yield"), bD("implements"), bD("interface"), bD("package"), bD("private"), bD("protected"), bD("public"), bD("static");
        var b$ = function(a, b, c) {
            var e, f, g;
            d.errors = [], B = Object.create(J), bb(B, c || {});
            if (b) {
                e = b.predef;
                if (e)
                    if (Array.isArray(e))
                        for (f = 0; f < e.length; f += 1) B[e[f]] = !0;
                    else if (typeof e == "object") {
                    g = Object.keys(e);
                    for (f = 0; f < g.length; f += 1) B[g[f]] = !!e[g[f]]
                }
                A = b
            } else A = {};
            A.indent = A.indent || 4, A.maxerr = A.maxerr || 50, N = "";
            for (f = 0; f < A.indent; f += 1) N += " ";
            p = 1, m = Object.create(B), G = m, j = {
                "(global)": !0,
                "(name)": "(global)",
                "(scope)": G,
                "(breakage)": 0,
                "(loopage)": 0
            }, l = [j], P = [], H = !1, I = null, u = {}, v = null, n = {}, o = !1, t = [], q = !1, Q = 0, bi.init(a), C = !0, L = !1, D = O = x = M["(begin)"], bc();
            try {
                bm();
                switch (x.id) {
                    case "{":
                    case "[":
                        A.laxbreak = !0, q = !0, bZ();
                        break;
                    default:
                        x.value === "use strict" && (A.globalstrict || be('Use the function form of "use strict".'), bQ()), bR("lib")
                }
                bm("(end)")
            } catch (h) {
                h && d.errors.push({
                    reason: h.message,
                    line: h.line || x.line,
                    character: h.character || x.from
                }, null)
            }
            return d.errors.length === 0
        };
        return b$.data = function() {
            var a = {
                    functions: []
                },
                b, c, d = [],
                e, f, g, h = [],
                i, j = [],
                m;
            b$.errors.length && (a.errors = b$.errors), q && (a.json = !0);
            for (i in n) ba(n, i) && d.push({
                name: i,
                line: n[i]
            });
            d.length > 0 && (a.implieds = d), P.length > 0 && (a.urls = P), c = Object.keys(G), c.length > 0 && (a.globals = c);
            for (f = 1; f < l.length; f += 1) {
                e = l[f], b = {};
                for (g = 0; g < k.length; g += 1) b[k[g]] = [];
                for (i in e) ba(e, i) && i.charAt(0) !== "(" && (m = e[i], m === "unction" && (m = "unused"), Array.isArray(b[m]) && (b[m].push(i), m === "unused" && j.push({
                    name: i,
                    line: e["(line)"],
                    "function": e["(name)"]
                })));
                for (g = 0; g < k.length; g += 1) b[k[g]].length === 0 && delete b[k[g]];
                b.name = e["(name)"], b.param = e["(params)"], b.line = e["(line)"], b.last = e["(last)"], a.functions.push(b)
            }
            j.length > 0 && (a.unused = j), h = [];
            for (i in u)
                if (typeof u[i] == "number") {
                    a.member = u;
                    break
                }
            return a
        }, b$.report = function(a) {
            function o(a, b) {
                var c, d, e;
                if (b) {
                    m.push("<div><i>" + a + "</i> "), b = b.sort();
                    for (d = 0; d < b.length; d += 1) b[d] !== e && (e = b[d], m.push((c ? ", " : "") + e), c = !0);
                    m.push("</div>")
                }
            }
            var b = b$.data(),
                c = [],
                d, e, f, g, h, i, j, k = "",
                l, m = [],
                n;
            if (b.errors || b.implieds || b.unused) {
                f = !0, m.push("<div id=errors><i>Error:</i>");
                if (b.errors)
                    for (h = 0; h < b.errors.length; h += 1) d = b.errors[h], d && (e = d.evidence || "", m.push("<p>Problem" + (isFinite(d.line) ? " at line " + d.line + " character " + d.character : "") + ": " + d.reason.entityify() + "</p><p class=evidence>" + (e && (e.length > 80 ? e.slice(0, 77) + "..." : e).entityify()) + "</p>"));
                if (b.implieds) {
                    n = [];
                    for (h = 0; h < b.implieds.length; h += 1) n[h] = "<code>" + b.implieds[h].name + "</code>&nbsp;<i>" + b.implieds[h].line + "</i>";
                    m.push("<p><i>Implied global:</i> " + n.join(", ") + "</p>")
                }
                if (b.unused) {
                    n = [];
                    for (h = 0; h < b.unused.length; h += 1) n[h] = "<code><u>" + b.unused[h].name + "</u></code>&nbsp;<i>" + b.unused[h].line + "</i> <code>" + b.unused[h]["function"] + "</code>";
                    m.push("<p><i>Unused variable:</i> " + n.join(", ") + "</p>")
                }
                b.json && m.push("<p>JSON: bad.</p>"), m.push("</div>")
            }
            if (!a) {
                m.push("<br><div id=functions>"), b.urls && o("URLs<br>", b.urls, "<br>"), b.json && !f ? m.push("<p>JSON: good.</p>") : b.globals ? m.push("<div><i>Global</i> " + b.globals.sort().join(", ") + "</div>") : m.push("<div><i>No new global variables introduced.</i></div>");
                for (h = 0; h < b.functions.length; h += 1) g = b.functions[h], m.push("<br><div class=function><i>" + g.line + "-" + g.last + "</i> " + (g.name || "") + "(" + (g.param ? g.param.join(", ") : "") + ")</div>"), o("<big><b>Unused</b></big>", g.unused), o("Closure", g.closure), o("Variable", g["var"]), o("Exception", g.exception), o("Outer", g.outer), o("Global", g.global), o("Label", g.label);
                if (b.member) {
                    c = Object.keys(b.member);
                    if (c.length) {
                        c = c.sort(), k = "<br><pre id=members>/*members ", j = 10;
                        for (h = 0; h < c.length; h += 1) i = c[h], l = i.name(), j + l.length > 72 && (m.push(k + "<br>"), k = "    ", j = 1), j += l.length + 2, b.member[i] === 1 && (l = "<i>" + l + "</i>"), h < c.length - 1 && (l += ", "), k += l;
                        m.push(k + "<br>*/</pre>")
                    }
                    m.push("</div>")
                }
            }
            return m.join("")
        }, b$.jshint = b$, b$.edition = "2011-04-16", b$
    }();
    typeof b == "object" && b && (b.JSHINT = d)
}), define("ace/narcissus/jsparse", ["require", "exports", "module", "ace/narcissus/jslex", "ace/narcissus/jsdefs"], function(require, exports, module) {
    function pushDestructuringVarDecls(a, b) {
        for (var c in a) {
            var d = a[c];
            d.type === IDENTIFIER ? b.varDecls.push(d) : pushDestructuringVarDecls(d, b)
        }
    }

    function StaticContext(a, b, c, d) {
        this.parentScript = a, this.parentBlock = b || a, this.inModule = c || !1, this.inFunction = d || !1, this.inForLoopInit = !1, this.topLevel = !0, this.allLabels = new Stack, this.currentLabels = new Stack, this.labeledTargets = new Stack, this.defaultLoopTarget = null, this.defaultTarget = null, this.blackList = blackLists[Narcissus.options.version], Narcissus.options.ecma3OnlyMode && (this.ecma3OnlyMode = !0), Narcissus.options.parenFreeMode && (this.parenFreeMode = !0)
    }

    function Script(a, b, c) {
        var d = new Node(a, scriptInit());
        return Statements(a, new StaticContext(d, d, b, c), d), d
    }

    function Node(a, b) {
        var c = a.token;
        c ? (this.type = c.type, this.value = c.value, this.lineno = c.lineno, this.start = c.start, this.end = c.end) : this.lineno = a.lineno, this.tokenizer = a, this.children = [];
        for (var d in b) this[d] = b[d]
    }

    function SyntheticNode(a, b) {
        this.tokenizer = a, this.children = [];
        for (var c in b) this[c] = b[c];
        this.synthetic = !0
    }

    function unevalableConst(a) {
        var b = definitions.tokens[a],
            c = definitions.opTypeNames.hasOwnProperty(b) ? definitions.opTypeNames[b] : b in definitions.keywords ? b.toUpperCase() : b;
        return {
            toSource: function() {
                return c
            }
        }
    }

    function tokenString(a) {
        var b = definitions.tokens[a];
        return /^\W/.test(b) ? definitions.opTypeNames[b] : b.toUpperCase()
    }

    function blockInit() {
        return {
            type: BLOCK,
            varDecls: []
        }
    }

    function scriptInit() {
        return {
            type: SCRIPT,
            funDecls: [],
            varDecls: [],
            modDefns: new StringMap,
            modAssns: new StringMap,
            modDecls: new StringMap,
            modLoads: new StringMap,
            impDecls: [],
            expDecls: [],
            exports: new StringMap,
            hasEmptyReturn: !1,
            hasReturnWithValue: !1,
            isGenerator: !1
        }
    }

    function MaybeLeftParen(a, b) {
        return b.parenFreeMode ? a.match(LEFT_PAREN) ? LEFT_PAREN : END : a.mustMatch(LEFT_PAREN).type
    }

    function MaybeRightParen(a, b) {
        b === LEFT_PAREN && a.mustMatch(RIGHT_PAREN)
    }

    function Statements(a, b, c) {
        try {
            while (!a.done && a.peek(!0) !== RIGHT_CURLY) c.push(Statement(a, b))
        } catch (d) {
            throw a.done && (a.unexpectedEOF = !0), d
        }
    }

    function Block(a, b) {
        a.mustMatch(LEFT_CURLY);
        var c = new Node(a, blockInit());
        return Statements(a, b.update({
            parentBlock: c
        }).pushTarget(c), c), a.mustMatch(RIGHT_CURLY), c
    }

    function Export(a, b) {
        this.node = a, this.isDefinition = b, this.resolved = null
    }

    function registerExport(a, b) {
        function c(b, c) {
            if (a.has(b)) throw new SyntaxError("multiple exports of " + b);
            a.set(b, c)
        }
        switch (b.type) {
            case MODULE:
            case FUNCTION:
                c(b.name, new Export(b, !0));
                break;
            case VAR:
                for (var d = 0; d < b.children.length; d++) c(b.children[d].name, new Export(b.children[d], !0));
                break;
            case LET:
            case CONST:
                throw new Error("NYI: " + definitions.tokens[b.type]);
            case EXPORT:
                for (var d = 0; d < b.pathList.length; d++) {
                    var e = b.pathList[d];
                    switch (e.type) {
                        case OBJECT_INIT:
                            for (var f = 0; f < e.children.length; f++) {
                                var g = e.children[f];
                                g.type === IDENTIFIER ? c(g.value, new Export(g, !1)) : c(g.children[0].value, new Export(g.children[1], !1))
                            }
                            break;
                        case DOT:
                            c(e.children[1].value, new Export(e, !1));
                            break;
                        case IDENTIFIER:
                            c(e.value, new Export(e, !1));
                            break;
                        default:
                            throw new Error("unexpected export path: " + definitions.tokens[e.type])
                    }
                }
                break;
            default:
                throw new Error("unexpected export decl: " + definitions.tokens[exp.type])
        }
    }

    function Module(a) {
        var b = a.body.exports,
            c = a.body.modDefns,
            d = new StringMap;
        b.forEach(function(a, b) {
            var e = b.node;
            if (e.type === MODULE) d.set(a, e);
            else if (!b.isDefinition && e.type === IDENTIFIER && c.has(e.value)) {
                var f = c.get(e.value);
                d.set(a, f)
            }
        }), this.node = a, this.exports = b, this.exportedModules = d
    }

    function Statement(a, b) {
        var c, d, e, f, g, h, i, j = a.get(!0),
            k, l, m, n = a.blockComments;
        if (b.blackList[j]) throw a.newSyntaxError(definitions.tokens[j] + " statements only allowed in Harmony");
        if (!b.allow(j)) throw a.newSyntaxError(definitions.tokens[j] + " statement in illegal context");
        switch (j) {
            case IMPORT:
                e = new Node(a), e.pathList = ImportPathList(a, b), b.parentScript.impDecls.push(e);
                break;
            case EXPORT:
                switch (a.peek()) {
                    case MODULE:
                    case FUNCTION:
                    case LET:
                    case VAR:
                    case CONST:
                        return e = Statement(a, b), e.blockComments = n, e.exported = !0, b.parentScript.expDecls.push(e), registerExport(b.parentScript.exports, e), e;
                    default:
                        e = new Node(a), e.pathList = ExportPathList(a, b)
                }
                b.parentScript.expDecls.push(e), registerExport(b.parentScript.exports, e);
                break;
            case MODULE:
                e = new Node(a), e.blockComments = n, a.mustMatch(IDENTIFIER), d = a.token.value;
                if (a.match(LEFT_CURLY)) return e.name = d, e.body = Script(a, !0, !1), e.module = new Module(e), a.mustMatch(RIGHT_CURLY), b.parentScript.modDefns.set(e.name, e), e;
                return a.unget(), ModuleVariables(a, b, e), e;
            case FUNCTION:
                return FunctionDefinition(a, b, !0, b.topLevel ? DECLARED_FORM : STATEMENT_FORM, n);
            case LEFT_CURLY:
                return e = new Node(a, blockInit()), Statements(a, b.update({
                    parentBlock: e
                }).pushTarget(e).nest(), e), a.mustMatch(RIGHT_CURLY), e;
            case IF:
                return e = new Node(a), e.condition = HeadExpression(a, b), l = b.pushTarget(e).nest(), e.thenPart = Statement(a, l), e.elsePart = a.match(ELSE, !0) ? Statement(a, l) : null, e;
            case SWITCH:
                e = new Node(a, {
                    cases: [],
                    defaultIndex: -1
                }), e.discriminant = HeadExpression(a, b), l = b.pushTarget(e).nest(), a.mustMatch(LEFT_CURLY);
                while ((j = a.get()) !== RIGHT_CURLY) {
                    switch (j) {
                        case DEFAULT:
                            if (e.defaultIndex >= 0) throw a.newSyntaxError("More than one switch default");
                        case CASE:
                            f = new Node(a), j === DEFAULT ? e.defaultIndex = e.cases.length : f.caseLabel = Expression(a, l, COLON);
                            break;
                        default:
                            throw a.newSyntaxError("Invalid switch case")
                    }
                    a.mustMatch(COLON), f.statements = new Node(a, blockInit());
                    while ((j = a.peek(!0)) !== CASE && j !== DEFAULT && j !== RIGHT_CURLY) f.statements.push(Statement(a, l));
                    e.cases.push(f)
                }
                return e;
            case FOR:
                e = new Node(a, LOOP_INIT), e.blockComments = n, a.match(IDENTIFIER) && (a.token.value === "each" ? e.isEach = !0 : a.unget()), b.parenFreeMode || a.mustMatch(LEFT_PAREN), l = b.pushTarget(e).nest(), m = b.update({
                    inForLoopInit: !0
                }), f = null, (j = a.peek(!0)) !== SEMICOLON && (j === VAR || j === CONST ? (a.get(), f = Variables(a, m)) : j === LET ? (a.get(), a.peek() === LEFT_PAREN ? f = LetBlock(a, m, !1) : (m.parentBlock = e, e.varDecls = [], f = Variables(a, m))) : f = Expression(a, m));
                if (f && a.match(IN)) {
                    e.type = FOR_IN, e.object = Expression(a, m);
                    if (f.type === VAR || f.type === LET) {
                        h = f.children;
                        if (h.length !== 1 && f.destructurings.length !== 1) throw new SyntaxError("Invalid for..in left-hand side", a.filename, f.lineno);
                        f.destructurings.length > 0 ? e.iterator = f.destructurings[0] : e.iterator = h[0], e.varDecl = f
                    } else {
                        if (f.type === ARRAY_INIT || f.type === OBJECT_INIT) f.destructuredNames = checkDestructuring(a, m, f);
                        e.iterator = f
                    }
                } else {
                    m.inForLoopInit = !1, e.setup = f, a.mustMatch(SEMICOLON);
                    if (e.isEach) throw a.newSyntaxError("Invalid for each..in loop");
                    e.condition = a.peek(!0) === SEMICOLON ? null : Expression(a, m), a.mustMatch(SEMICOLON), k = a.peek(!0), e.update = (b.parenFreeMode ? k === LEFT_CURLY || definitions.isStatementStartCode[k] : k === RIGHT_PAREN) ? null : Expression(a, m)
                }
                return b.parenFreeMode || a.mustMatch(RIGHT_PAREN), e.body = Statement(a, l), e;
            case WHILE:
                return e = new Node(a, {
                    isLoop: !0
                }), e.blockComments = n, e.condition = HeadExpression(a, b), e.body = Statement(a, b.pushTarget(e).nest()), e;
            case DO:
                e = new Node(a, {
                    isLoop: !0
                }), e.blockComments = n, e.body = Statement(a, b.pushTarget(e).nest()), a.mustMatch(WHILE), e.condition = HeadExpression(a, b);
                if (!b.ecmaStrictMode) return a.match(SEMICOLON), e;
                break;
            case BREAK:
            case CONTINUE:
                e = new Node(a), e.blockComments = n, l = b.pushTarget(e), a.peekOnSameLine() === IDENTIFIER && (a.get(), e.label = a.token.value), e.label ? e.target = l.labeledTargets.find(function(a) {
                    return a.labels.has(e.label)
                }) : j === CONTINUE ? e.target = l.defaultLoopTarget : e.target = l.defaultTarget;
                if (!e.target) throw a.newSyntaxError("Invalid " + (j === BREAK ? "break" : "continue"));
                if (!e.target.isLoop && j === CONTINUE) throw a.newSyntaxError("Invalid continue");
                break;
            case TRY:
                e = new Node(a, {
                    catchClauses: []
                }), e.blockComments = n, e.tryBlock = Block(a, b);
                while (a.match(CATCH)) {
                    f = new Node(a), g = MaybeLeftParen(a, b);
                    switch (a.get()) {
                        case LEFT_BRACKET:
                        case LEFT_CURLY:
                            a.unget(), f.varName = DestructuringExpression(a, b, !0);
                            break;
                        case IDENTIFIER:
                            f.varName = a.token.value;
                            break;
                        default:
                            throw a.newSyntaxError("missing identifier in catch")
                    }
                    if (a.match(IF)) {
                        if (b.ecma3OnlyMode) throw a.newSyntaxError("Illegal catch guard");
                        if (e.catchClauses.length && !e.catchClauses.top().guard) throw a.newSyntaxError("Guarded catch after unguarded");
                        f.guard = Expression(a, b)
                    }
                    MaybeRightParen(a, g), f.block = Block(a, b), e.catchClauses.push(f)
                }
                a.match(FINALLY) && (e.finallyBlock = Block(a, b));
                if (!e.catchClauses.length && !e.finallyBlock) throw a.newSyntaxError("Invalid try statement");
                return e;
            case CATCH:
            case FINALLY:
                throw a.newSyntaxError(definitions.tokens[j] + " without preceding try");
            case THROW:
                e = new Node(a), e.exception = Expression(a, b);
                break;
            case RETURN:
                e = ReturnOrYield(a, b);
                break;
            case WITH:
                return e = new Node(a), e.blockComments = n, e.object = HeadExpression(a, b), e.body = Statement(a, b.pushTarget(e).nest()), e;
            case VAR:
            case CONST:
                e = Variables(a, b);
                break;
            case LET:
                a.peek() === LEFT_PAREN ? e = LetBlock(a, b, !0) : e = Variables(a, b);
                break;
            case DEBUGGER:
                e = new Node(a);
                break;
            case NEWLINE:
            case SEMICOLON:
                return e = new Node(a, {
                    type: SEMICOLON
                }), e.blockComments = n, e.expression = null, e;
            default:
                if (j === IDENTIFIER) {
                    j = a.peek();
                    if (j === COLON) {
                        d = a.token.value;
                        if (b.allLabels.has(d)) throw a.newSyntaxError("Duplicate label");
                        return a.get(), e = new Node(a, {
                            type: LABEL,
                            label: d
                        }), e.blockComments = n, e.statement = Statement(a, b.pushLabel(d).nest()), e.target = e.statement.type === LABEL ? e.statement.target : e.statement, e
                    }
                }
                e = new Node(a, {
                    type: SEMICOLON
                }), a.unget(), e.blockComments = n, e.expression = Expression(a, b), e.end = e.expression.end
        }
        return e.blockComments = n, MagicalSemicolon(a), e
    }

    function MagicalSemicolon(a) {
        var b;
        if (a.lineno === a.token.lineno) {
            b = a.peekOnSameLine();
            if (b !== END && b !== NEWLINE && b !== SEMICOLON && b !== RIGHT_CURLY) throw a.newSyntaxError("missing ; before statement")
        }
        a.match(SEMICOLON)
    }

    function ReturnOrYield(a, b) {
        var c, d, e = a.token.type,
            f, g = b.parentScript;
        if (e === RETURN) {
            if (!b.inFunction) throw a.newSyntaxError("Return not in function")
        } else {
            if (!b.inFunction) throw a.newSyntaxError("Yield not in function");
            g.isGenerator = !0
        }
        c = new Node(a, {
            value: undefined
        }), f = e === RETURN ? a.peekOnSameLine(!0) : a.peek(!0), f !== END && f !== NEWLINE && f !== SEMICOLON && f !== RIGHT_CURLY && (e !== YIELD || f !== e && f !== RIGHT_BRACKET && f !== RIGHT_PAREN && f !== COLON && f !== COMMA) ? e === RETURN ? (c.value = Expression(a, b), g.hasReturnWithValue = !0) : c.value = AssignExpression(a, b) : e === RETURN && (g.hasEmptyReturn = !0);
        if (g.hasReturnWithValue && g.isGenerator) throw a.newSyntaxError("Generator returns a value");
        return c
    }

    function ModuleExpression(a, b) {
        return a.match(STRING) ? new Node(a) : QualifiedPath(a, b)
    }

    function ImportPathList(a, b) {
        var c = [];
        do c.push(ImportPath(a, b)); while (a.match(COMMA));
        return c
    }

    function ImportPath(a, b) {
        var c = QualifiedPath(a, b);
        if (!a.match(DOT)) {
            if (c.type === IDENTIFIER) throw a.newSyntaxError("cannot import local variable");
            return c
        }
        var d = new Node(a);
        return d.push(c), d.push(ImportSpecifierSet(a, b)), d
    }

    function ExplicitSpecifierSet(a, b, c) {
        var d, e, f, g;
        d = new Node(a, {
            type: OBJECT_INIT
        }), a.mustMatch(LEFT_CURLY);
        if (!a.match(RIGHT_CURLY))
            do f = Identifier(a, b), a.match(COLON) ? (e = new Node(a, {
                type: PROPERTY_INIT
            }), e.push(f), e.push(c(a, b)), d.push(e)) : d.push(f); while (!a.match(RIGHT_CURLY) && a.mustMatch(COMMA));
        return d
    }

    function ImportSpecifierSet(a, b) {
        return a.match(MUL) ? new Node(a, {
            type: IDENTIFIER,
            name: "*"
        }) : ExplicitSpecifierSet(a, b, Identifier)
    }

    function Identifier(a, b) {
        return a.mustMatch(IDENTIFIER), new Node(a, {
            type: IDENTIFIER
        })
    }

    function IdentifierName(a) {
        if (a.match(IDENTIFIER)) return new Node(a, {
            type: IDENTIFIER
        });
        a.get();
        if (a.token.value in definitions.keywords) return new Node(a, {
            type: IDENTIFIER
        });
        throw a.newSyntaxError("missing IdentifierName")
    }

    function QualifiedPath(a, b) {
        var c, d;
        c = Identifier(a, b);
        while (a.match(DOT)) {
            if (a.peek() !== IDENTIFIER) {
                a.unget();
                break
            }
            d = new Node(a), d.push(c), d.push(Identifier(a, b)), c = d
        }
        return c
    }

    function ExportPath(a, b) {
        return a.peek() === LEFT_CURLY ? ExplicitSpecifierSet(a, b, QualifiedPath) : QualifiedPath(a, b)
    }

    function ExportPathList(a, b) {
        var c = [];
        do c.push(ExportPath(a, b)); while (a.match(COMMA));
        return c
    }

    function FunctionDefinition(a, b, c, d, e) {
        var f, g = new Node(a, {
            params: [],
            paramComments: []
        });
        typeof comment == "undefined" && (comment = null), g.blockComments = e, g.type !== FUNCTION && (g.type = g.value === "get" ? GETTER : SETTER);
        if (a.match(IDENTIFIER)) g.name = a.token.value;
        else if (c) throw a.newSyntaxError("missing function identifier");
        var h = b ? b.inModule : !1,
            i = new StaticContext(null, null, h, !0);
        a.mustMatch(LEFT_PAREN);
        if (!a.match(RIGHT_PAREN)) {
            do {
                f = a.get(), g.paramComments.push(a.lastBlockComment());
                switch (f) {
                    case LEFT_BRACKET:
                    case LEFT_CURLY:
                        a.unget(), g.params.push(DestructuringExpression(a, i));
                        break;
                    case IDENTIFIER:
                        g.params.push(a.token.value);
                        break;
                    default:
                        throw a.newSyntaxError("missing formal parameter")
                }
            } while (a.match(COMMA));
            a.mustMatch(RIGHT_PAREN)
        }
        f = a.get(), f !== LEFT_CURLY && a.unget();
        if (f !== LEFT_CURLY) {
            g.body = AssignExpression(a, i);
            if (g.body.isGenerator) throw a.newSyntaxError("Generator returns a value")
        } else g.body = Script(a, h, !0);
        return f === LEFT_CURLY && a.mustMatch(RIGHT_CURLY), g.end = a.token.end, g.functionForm = d, d === DECLARED_FORM && b.parentScript.funDecls.push(g), g
    }

    function ModuleVariables(a, b, c) {
        var d, e;
        do d = Identifier(a, b), a.match(ASSIGN) && (e = ModuleExpression(a, b), d.initializer = e, e.type === STRING ? b.parentScript.modLoads.set(d.value, e.value) : b.parentScript.modAssns.set(d.value, d)), c.push(d); while (a.match(COMMA))
    }

    function Variables(a, b, c) {
        var d, e, f, g, h, i;
        i = a.token.type;
        switch (i) {
            case VAR:
            case CONST:
                h = b.parentScript;
                break;
            case LET:
                h = b.parentBlock;
                break;
            case LEFT_PAREN:
                i = LET, h = c
        }
        d = new Node(a, {
            type: i,
            destructurings: []
        });
        do {
            i = a.get();
            if (i === LEFT_BRACKET || i === LEFT_CURLY) {
                a.unget();
                var j = DestructuringExpression(a, b, !0);
                e = new Node(a, {
                    type: IDENTIFIER,
                    name: j,
                    readOnly: d.type === CONST
                }), d.push(e), pushDestructuringVarDecls(e.name.destructuredNames, h), d.destructurings.push({
                    exp: j,
                    decl: e
                });
                if (b.inForLoopInit && a.peek() === IN) continue;
                a.mustMatch(ASSIGN);
                if (a.token.assignOp) throw a.newSyntaxError("Invalid variable initialization");
                e.blockComment = a.lastBlockComment(), e.initializer = AssignExpression(a, b);
                continue
            }
            if (i !== IDENTIFIER) throw a.newSyntaxError("missing variable name");
            e = new Node(a, {
                type: IDENTIFIER,
                name: a.token.value,
                readOnly: d.type === CONST
            }), d.push(e), h.varDecls.push(e);
            if (a.match(ASSIGN)) {
                var k = a.lastBlockComment();
                if (a.token.assignOp) throw a.newSyntaxError("Invalid variable initialization");
                e.initializer = AssignExpression(a, b)
            } else var k = a.lastBlockComment();
            e.blockComment = k
        } while (a.match(COMMA));
        return d
    }

    function LetBlock(a, b, c) {
        var d, e;
        return d = new Node(a, {
            type: LET_BLOCK,
            varDecls: []
        }), a.mustMatch(LEFT_PAREN), d.variables = Variables(a, b, d), a.mustMatch(RIGHT_PAREN), c && a.peek() !== LEFT_CURLY && (e = new Node(a, {
            type: SEMICOLON,
            expression: d
        }), c = !1), c ? d.block = Block(a, b) : d.expression = AssignExpression(a, b), d
    }

    function checkDestructuring(a, b, c, d) {
        if (c.type === ARRAY_COMP) throw a.newSyntaxError("Invalid array comprehension left-hand side");
        if (c.type !== ARRAY_INIT && c.type !== OBJECT_INIT) return;
        var e = {},
            f, g, h, i, j, k = c.children;
        for (var l = 0, m = k.length; l < m; l++) {
            if (!(f = k[l])) continue;
            f.type === PROPERTY_INIT ? (j = f.children, i = j[1], h = j[0].value) : c.type === OBJECT_INIT ? (i = f, h = f.value) : (i = f, h = l);
            if (i.type === ARRAY_INIT || i.type === OBJECT_INIT) e[h] = checkDestructuring(a, b, i, d);
            else {
                if (d && i.type !== IDENTIFIER) throw a.newSyntaxError("missing name in pattern");
                e[h] = i
            }
        }
        return e
    }

    function DestructuringExpression(a, b, c) {
        var d = PrimaryExpression(a, b);
        return d.destructuredNames = checkDestructuring(a, b, d, c), d
    }

    function GeneratorExpression(a, b, c) {
        return new Node(a, {
            type: GENERATOR,
            expression: c,
            tail: ComprehensionTail(a, b)
        })
    }

    function ComprehensionTail(a, b) {
        var c, d, e, f, g;
        c = new Node(a, {
            type: COMP_TAIL
        });
        do {
            d = new Node(a, {
                type: FOR_IN,
                isLoop: !0
            }), a.match(IDENTIFIER) && (a.token.value === "each" ? d.isEach = !0 : a.unget()), g = MaybeLeftParen(a, b);
            switch (a.get()) {
                case LEFT_BRACKET:
                case LEFT_CURLY:
                    a.unget(), d.iterator = DestructuringExpression(a, b);
                    break;
                case IDENTIFIER:
                    d.iterator = f = new Node(a, {
                        type: IDENTIFIER
                    }), f.name = f.value, d.varDecl = e = new Node(a, {
                        type: VAR
                    }), e.push(f), b.parentScript.varDecls.push(f);
                    break;
                default:
                    throw a.newSyntaxError("missing identifier")
            }
            a.mustMatch(IN), d.object = Expression(a, b), MaybeRightParen(a, g), c.push(d)
        } while (a.match(FOR));
        return a.match(IF) && (c.guard = HeadExpression(a, b)), c
    }

    function HeadExpression(a, b) {
        var c = MaybeLeftParen(a, b),
            d = ParenExpression(a, b);
        MaybeRightParen(a, c);
        if (c === END && !d.parenthesized) {
            var e = a.peek();
            if (e !== LEFT_CURLY && !definitions.isStatementStartCode[e]) throw a.newSyntaxError("Unparenthesized head followed by unbraced body")
        }
        return d
    }

    function ParenExpression(a, b) {
        var c = Expression(a, b.update({
            inForLoopInit: b.inForLoopInit && a.token.type === LEFT_PAREN
        }));
        if (a.match(FOR)) {
            if (c.type === YIELD && !c.parenthesized) throw a.newSyntaxError("Yield expression must be parenthesized");
            if (c.type === COMMA && !c.parenthesized) throw a.newSyntaxError("Generator expression must be parenthesized");
            c = GeneratorExpression(a, b, c)
        }
        return c
    }

    function Expression(a, b) {
        var c, d;
        c = AssignExpression(a, b);
        if (a.match(COMMA)) {
            d = new Node(a, {
                type: COMMA
            }), d.push(c), c = d;
            do {
                d = c.children[c.children.length - 1];
                if (d.type === YIELD && !d.parenthesized) throw a.newSyntaxError("Yield expression must be parenthesized");
                c.push(AssignExpression(a, b))
            } while (a.match(COMMA))
        }
        return c
    }

    function AssignExpression(a, b) {
        var c, d;
        if (a.match(YIELD, !0)) return ReturnOrYield(a, b);
        c = new Node(a, {
            type: ASSIGN
        }), d = ConditionalExpression(a, b);
        if (!a.match(ASSIGN)) return d;
        c.blockComment = a.lastBlockComment();
        switch (d.type) {
            case OBJECT_INIT:
            case ARRAY_INIT:
                d.destructuredNames = checkDestructuring(a, b, d);
            case IDENTIFIER:
            case DOT:
            case INDEX:
            case CALL:
                break;
            default:
                throw a.newSyntaxError("Bad left-hand side of assignment")
        }
        return c.assignOp = d.assignOp = a.token.assignOp, c.push(d), c.push(AssignExpression(a, b)), c
    }

    function ConditionalExpression(a, b) {
        var c, d;
        c = OrExpression(a, b);
        if (a.match(HOOK)) {
            d = c, c = new Node(a, {
                type: HOOK
            }), c.push(d), c.push(AssignExpression(a, b.update({
                inForLoopInit: !1
            })));
            if (!a.match(COLON)) throw a.newSyntaxError("missing : after ?");
            c.push(AssignExpression(a, b))
        }
        return c
    }

    function OrExpression(a, b) {
        var c, d;
        c = AndExpression(a, b);
        while (a.match(OR)) d = new Node(a), d.push(c), d.push(AndExpression(a, b)), c = d;
        return c
    }

    function AndExpression(a, b) {
        var c, d;
        c = BitwiseOrExpression(a, b);
        while (a.match(AND)) d = new Node(a), d.push(c), d.push(BitwiseOrExpression(a, b)), c = d;
        return c
    }

    function BitwiseOrExpression(a, b) {
        var c, d;
        c = BitwiseXorExpression(a, b);
        while (a.match(BITWISE_OR)) d = new Node(a), d.push(c), d.push(BitwiseXorExpression(a, b)), c = d;
        return c
    }

    function BitwiseXorExpression(a, b) {
        var c, d;
        c = BitwiseAndExpression(a, b);
        while (a.match(BITWISE_XOR)) d = new Node(a), d.push(c), d.push(BitwiseAndExpression(a, b)), c = d;
        return c
    }

    function BitwiseAndExpression(a, b) {
        var c, d;
        c = EqualityExpression(a, b);
        while (a.match(BITWISE_AND)) d = new Node(a), d.push(c), d.push(EqualityExpression(a, b)), c = d;
        return c
    }

    function EqualityExpression(a, b) {
        var c, d;
        c = RelationalExpression(a, b);
        while (a.match(EQ) || a.match(NE) || a.match(STRICT_EQ) || a.match(STRICT_NE)) d = new Node(a), d.push(c), d.push(RelationalExpression(a, b)), c = d;
        return c
    }

    function RelationalExpression(a, b) {
        var c, d, e = b.update({
            inForLoopInit: !1
        });
        c = ShiftExpression(a, e);
        while (a.match(LT) || a.match(LE) || a.match(GE) || a.match(GT) || !b.inForLoopInit && a.match(IN) || a.match(INSTANCEOF)) d = new Node(a), d.push(c), d.push(ShiftExpression(a, e)), c = d;
        return c
    }

    function ShiftExpression(a, b) {
        var c, d;
        c = AddExpression(a, b);
        while (a.match(LSH) || a.match(RSH) || a.match(URSH)) d = new Node(a), d.push(c), d.push(AddExpression(a, b)), c = d;
        return c
    }

    function AddExpression(a, b) {
        var c, d;
        c = MultiplyExpression(a, b);
        while (a.match(PLUS) || a.match(MINUS)) d = new Node(a), d.push(c), d.push(MultiplyExpression(a, b)), c = d;
        return c
    }

    function MultiplyExpression(a, b) {
        var c, d;
        c = UnaryExpression(a, b);
        while (a.match(MUL) || a.match(DIV) || a.match(MOD)) d = new Node(a), d.push(c), d.push(UnaryExpression(a, b)), c = d;
        return c
    }

    function UnaryExpression(a, b) {
        var c, d, e;
        switch (e = a.get(!0)) {
            case DELETE:
            case VOID:
            case TYPEOF:
            case NOT:
            case BITWISE_NOT:
            case PLUS:
            case MINUS:
                e === PLUS ? c = new Node(a, {
                    type: UNARY_PLUS
                }) : e === MINUS ? c = new Node(a, {
                    type: UNARY_MINUS
                }) : c = new Node(a), c.push(UnaryExpression(a, b));
                break;
            case INCREMENT:
            case DECREMENT:
                c = new Node(a), c.push(MemberExpression(a, b, !0));
                break;
            default:
                a.unget(), c = MemberExpression(a, b, !0), a.tokens[a.tokenIndex + a.lookahead - 1 & 3].lineno === a.lineno && (a.match(INCREMENT) || a.match(DECREMENT)) && (d = new Node(a, {
                    postfix: !0
                }), d.push(c), c = d)
        }
        return c
    }

    function MemberExpression(a, b, c) {
        var d, e, f, g;
        a.match(NEW) ? (d = new Node(a), d.push(MemberExpression(a, b, !1)), a.match(LEFT_PAREN) && (d.type = NEW_WITH_ARGS, d.push(ArgumentList(a, b)))) : d = PrimaryExpression(a, b);
        while ((g = a.get()) !== END) {
            switch (g) {
                case DOT:
                    e = new Node(a), e.push(d), e.push(IdentifierName(a));
                    break;
                case LEFT_BRACKET:
                    e = new Node(a, {
                        type: INDEX
                    }), e.push(d), e.push(Expression(a, b)), a.mustMatch(RIGHT_BRACKET);
                    break;
                case LEFT_PAREN:
                    if (c) {
                        e = new Node(a, {
                            type: CALL
                        }), e.push(d), e.push(ArgumentList(a, b));
                        break
                    };
                default:
                    return a.unget(), d
            }
            d = e
        }
        return d
    }

    function ArgumentList(a, b) {
        var c, d;
        c = new Node(a, {
            type: LIST
        });
        if (a.match(RIGHT_PAREN, !0)) return c;
        do {
            d = AssignExpression(a, b);
            if (d.type === YIELD && !d.parenthesized && a.peek() === COMMA) throw a.newSyntaxError("Yield expression must be parenthesized");
            if (a.match(FOR)) {
                d = GeneratorExpression(a, b, d);
                if (c.children.length > 1 || a.peek(!0) === COMMA) throw a.newSyntaxError("Generator expression must be parenthesized")
            }
            c.push(d)
        } while (a.match(COMMA));
        return a.mustMatch(RIGHT_PAREN), c
    }

    function PrimaryExpression(a, b) {
        var c, d, e = a.get(!0);
        switch (e) {
            case FUNCTION:
                c = FunctionDefinition(a, b, !1, EXPRESSED_FORM);
                break;
            case LEFT_BRACKET:
                c = new Node(a, {
                    type: ARRAY_INIT
                });
                while ((e = a.peek(!0)) !== RIGHT_BRACKET) {
                    if (e === COMMA) {
                        a.get(), c.push(null);
                        continue
                    }
                    c.push(AssignExpression(a, b));
                    if (e !== COMMA && !a.match(COMMA)) break
                }
                c.children.length === 1 && a.match(FOR) && (d = new Node(a, {
                    type: ARRAY_COMP,
                    expression: c.children[0],
                    tail: ComprehensionTail(a, b)
                }), c = d), a.mustMatch(RIGHT_BRACKET);
                break;
            case LEFT_CURLY:
                var f, g;
                c = new Node(a, {
                    type: OBJECT_INIT
                });
                h: if (!a.match(RIGHT_CURLY)) {
                    do {
                        e = a.get();
                        if (a.token.value !== "get" && a.token.value !== "set" || a.peek() !== IDENTIFIER) {
                            var i = a.blockComments;
                            switch (e) {
                                case IDENTIFIER:
                                case NUMBER:
                                case STRING:
                                    f = new Node(a, {
                                        type: IDENTIFIER
                                    });
                                    break;
                                case RIGHT_CURLY:
                                    if (b.ecma3OnlyMode) throw a.newSyntaxError("Illegal trailing ,");
                                    break h;
                                default:
                                    if (a.token.value in definitions.keywords) {
                                        f = new Node(a, {
                                            type: IDENTIFIER
                                        });
                                        break
                                    }
                                    throw a.newSyntaxError("Invalid property name")
                            }
                            if (a.match(COLON)) d = new Node(a, {
                                type: PROPERTY_INIT
                            }), d.push(f), d.push(AssignExpression(a, b)), d.blockComments = i, c.push(d);
                            else {
                                if (a.peek() !== COMMA && a.peek() !== RIGHT_CURLY) throw a.newSyntaxError("missing : after property");
                                c.push(f)
                            }
                        } else {
                            if (b.ecma3OnlyMode) throw a.newSyntaxError("Illegal property accessor");
                            c.push(FunctionDefinition(a, b, !0, EXPRESSED_FORM))
                        }
                    } while (a.match(COMMA));
                    a.mustMatch(RIGHT_CURLY)
                }
                break;
            case LEFT_PAREN:
                c = ParenExpression(a, b), a.mustMatch(RIGHT_PAREN), c.parenthesized = !0;
                break;
            case LET:
                c = LetBlock(a, b, !1);
                break;
            case NULL:
            case THIS:
            case TRUE:
            case FALSE:
            case IDENTIFIER:
            case NUMBER:
            case STRING:
            case REGEXP:
                c = new Node(a);
                break;
            default:
                throw a.newSyntaxError("missing operand")
        }
        return c
    }

    function parse(a, b, c) {
        var d = new lexer.Tokenizer(a, b, c),
            e = Script(d, !1, !1);
        if (!d.done) throw d.newSyntaxError("Syntax error");
        return e
    }

    function parseStdin(a, b, c, d) {
        if (a.match(/^[\s]*\.begin[\s]*$/)) return ++b.value, parseMultiline(b, c);
        d(a.trim()) && (a = "");
        for (;;) try {
            var e = new lexer.Tokenizer(a, "stdin", b.value),
                f = Script(e, !1, !1);
            return b.value = e.lineno, f
        } catch (g) {
            if (!e.unexpectedEOF) throw g;
            var h;
            do {
                c && putstr(c), h = readline();
                if (!h) throw g
            } while (d(h.trim()));
            a += "\n" + h
        }
    }

    function parseMultiline(a, b) {
        var c = "";
        for (;;) {
            b && putstr(b);
            var d = readline();
            if (d === null) return null;
            if (d.match(/^[\s]*\.end[\s]*$/)) break;
            c += "\n" + d
        }
        var e = new lexer.Tokenizer(c, "stdin", a.value),
            f = Script(e, !1, !1);
        return a.value = e.lineno, f
    }
    var lexer = require("ace/narcissus/jslex"),
        definitions = require("ace/narcissus/jsdefs");
    const StringMap = definitions.StringMap,
        Stack = definitions.Stack;
    eval(definitions.consts);
    const blackLists = {
        160: {},
        185: {},
        harmony: {}
    };
    blackLists[160][IMPORT] = !0, blackLists[160][EXPORT] = !0, blackLists[160][LET] = !0, blackLists[160][MODULE] = !0, blackLists[160][YIELD] = !0, blackLists[185][IMPORT] = !0, blackLists[185][EXPORT] = !0, blackLists[185][MODULE] = !0, blackLists.harmony[WITH] = !0, StaticContext.prototype = {
        ecma3OnlyMode: !1,
        parenFreeMode: !1,
        update: function(a) {
            var b = {};
            for (var c in a) b[c] = {
                value: a[c],
                writable: !0,
                enumerable: !0,
                configurable: !0
            };
            return Object.create(this, b)
        },
        pushLabel: function(a) {
            return this.update({
                currentLabels: this.currentLabels.push(a),
                allLabels: this.allLabels.push(a)
            })
        },
        pushTarget: function(a) {
            var b = a.isLoop,
                c = b || a.type === SWITCH;
            return this.currentLabels.isEmpty() ? (b && this.update({
                defaultLoopTarget: a
            }), c && this.update({
                defaultTarget: a
            }), this) : (a.labels = new StringMap, this.currentLabels.forEach(function(b) {
                a.labels.set(b, !0)
            }), this.update({
                currentLabels: new Stack,
                labeledTargets: this.labeledTargets.push(a),
                defaultLoopTarget: b ? a : this.defaultLoopTarget,
                defaultTarget: c ? a : this.defaultTarget
            }))
        },
        nest: function() {
            return this.topLevel ? this.update({
                topLevel: !1
            }) : this
        },
        allow: function(a) {
            switch (a) {
                case EXPORT:
                    if (!this.inModule || this.inFunction || !this.topLevel) return !1;
                case IMPORT:
                    return !this.inFunction && this.topLevel;
                case MODULE:
                    return !this.inFunction && this.topLevel;
                default:
                    return !0
            }
        }
    }, definitions.defineProperty(Array.prototype, "top", function() {
        return this.length && this[this.length - 1]
    }, !1, !1, !0);
    var Np = Node.prototype = SyntheticNode.prototype = {};
    Np.constructor = Node;
    const TO_SOURCE_SKIP = {
        type: !0,
        value: !0,
        lineno: !0,
        start: !0,
        end: !0,
        tokenizer: !0,
        assignOp: !0
    };
    Np.toSource = function() {
        var a = {},
            b = this;
        a.type = unevalableConst(this.type), "value" in this && (a.value = this.value), "lineno" in this && (a.lineno = this.lineno), "start" in this && (a.start = this.start), "end" in this && (a.end = this.end), this.assignOp && (a.assignOp = unevalableConst(this.assignOp));
        for (var c in this) this.hasOwnProperty(c) && !(c in TO_SOURCE_SKIP) && (a[c] = this[c]);
        return a.toSource()
    }, Np.push = function(a) {
        return a !== null && (a.start < this.start && (this.start = a.start), this.end < a.end && (this.end = a.end)), this.children.push(a)
    }, Node.indentLevel = 0, Np.toString = function() {
        var a = [];
        for (var b in this) this.hasOwnProperty(b) && b !== "type" && b !== "target" && a.push({
            id: b,
            value: this[b]
        });
        a.sort(function(a, b) {
            return a.id < b.id ? -1 : 1
        });
        const c = "    ";
        var d = ++Node.indentLevel,
            e = "{\n" + c.repeat(d) + "type: " + tokenString(this.type);
        for (b = 0; b < a.length; b++) e += ",\n" + c.repeat(d) + a[b].id + ": " + a[b].value;
        return d = --Node.indentLevel, e += "\n" + c.repeat(d) + "}", e
    }, Np.getSource = function() {
        return this.tokenizer.source.slice(this.start, this.end)
    };
    const LOOP_INIT = {
        isLoop: !0
    };
    definitions.defineGetter(Np, "filename", function() {
        return this.tokenizer.filename
    }), definitions.defineGetter(Np, "length", function() {
        throw new Error("Node.prototype.length is gone; use n.children.length instead")
    }), definitions.defineProperty(String.prototype, "repeat", function(a) {
        var b = "",
            c = this + b;
        while (--a >= 0) b += c;
        return b
    }, !1, !1, !0);
    const DECLARED_FORM = 0,
        EXPRESSED_FORM = 1,
        STATEMENT_FORM = 2;
    return {
        parse: parse,
        parseStdin: parseStdin,
        Node: Node,
        SyntheticNode: SyntheticNode,
        DECLARED_FORM: DECLARED_FORM,
        EXPRESSED_FORM: EXPRESSED_FORM,
        STATEMENT_FORM: STATEMENT_FORM,
        Tokenizer: lexer.Tokenizer,
        FunctionDefinition: FunctionDefinition,
        Module: Module,
        Export: Export
    }
}), define("ace/narcissus/jslex", ["require", "exports", "module", "ace/narcissus/jsdefs"], function(require, exports, module) {
    function Tokenizer(a, b, c) {
        this.cursor = 0, this.source = String(a), this.tokens = [], this.tokenIndex = 0, this.lookahead = 0, this.scanNewlines = !1, this.unexpectedEOF = !1, this.filename = b || "", this.lineno = c || 1, this.blackList = blackLists[Narcissus.options.version], this.blockComments = null
    }
    var definitions = require("ace/narcissus/jsdefs");
    eval(definitions.consts);
    const blackLists = {
        160: {},
        185: {},
        harmony: {}
    };
    blackLists[160][LET] = !0, blackLists[160][MODULE] = !0, blackLists[160][YIELD] = !0, blackLists[185][MODULE] = !0;
    var opTokens = {};
    for (var op in definitions.opTypeNames) {
        if (op === "\n" || op === ".") continue;
        var node = opTokens;
        for (var i = 0; i < op.length; i++) {
            var ch = op[i];
            ch in node || (node[ch] = {}), node = node[ch], node.op = op
        }
    }
    return Tokenizer.prototype = {
        get done() {
            return this.peek(!0) === END
        }, get token() {
            return this.tokens[this.tokenIndex]
        }, match: function(a, b) {
            return this.get(b) === a || this.unget()
        },
        mustMatch: function(a) {
            if (!this.match(a)) throw this.newSyntaxError("Missing " + definitions.tokens[a].toLowerCase());
            return this.token
        },
        peek: function(a) {
            var b, c;
            return this.lookahead ? (c = this.tokens[this.tokenIndex + this.lookahead & 3], b = this.scanNewlines && c.lineno !== this.lineno ? NEWLINE : c.type) : (b = this.get(a), this.unget()), b
        },
        peekOnSameLine: function(a) {
            this.scanNewlines = !0;
            var b = this.peek(a);
            return this.scanNewlines = !1, b
        },
        lastBlockComment: function() {
            var a = this.blockComments.length;
            return a ? this.blockComments[a - 1] : null
        },
        skip: function() {
            var a = this.source;
            this.blockComments = [];
            for (;;) {
                var b = a[this.cursor++],
                    c = a[this.cursor];
                if (b === "\r") {
                    if (c === "\n") continue;
                    b = "\n"
                }
                if (b === "\n" && !this.scanNewlines) this.lineno++;
                else if (b === "/" && c === "*") {
                    var d = ++this.cursor;
                    for (;;) {
                        b = a[this.cursor++];
                        if (b === undefined) throw this.newSyntaxError("Unterminated comment");
                        if (b === "*") {
                            c = a[this.cursor];
                            if (c === "/") {
                                var e = this.cursor - 1;
                                this.cursor++;
                                break
                            }
                        } else b === "\n" && this.lineno++
                    }
                    this.blockComments.push(a.substring(d, e))
                } else if (b === "/" && c === "/") {
                    this.cursor++;
                    for (;;) {
                        b = a[this.cursor++], c = a[this.cursor];
                        if (b === undefined) return;
                        b === "\r" && c !== "\n" && (b = "\n");
                        if (b === "\n") {
                            this.scanNewlines ? this.cursor-- : this.lineno++;
                            break
                        }
                    }
                } else if (!(b in definitions.whitespace)) {
                    this.cursor--;
                    return
                }
            }
        },
        lexExponent: function() {
            var a = this.source,
                b = a[this.cursor];
            if (b === "e" || b === "E") {
                this.cursor++, ch = a[this.cursor++];
                if (ch === "+" || ch === "-") ch = a[this.cursor++];
                if (ch < "0" || ch > "9") throw this.newSyntaxError("Missing exponent");
                do ch = a[this.cursor++]; while (ch >= "0" && ch <= "9");
                return this.cursor--, !0
            }
            return !1
        },
        lexZeroNumber: function(a) {
            var b = this.token,
                c = this.source;
            b.type = NUMBER, a = c[this.cursor++];
            if (a === ".") {
                do a = c[this.cursor++]; while (a >= "0" && a <= "9");
                this.cursor--, this.lexExponent(), b.value = parseFloat(b.start, this.cursor)
            } else if (a === "x" || a === "X") {
                do a = c[this.cursor++]; while (a >= "0" && a <= "9" || a >= "a" && a <= "f" || a >= "A" && a <= "F");
                this.cursor--, b.value = parseInt(c.substring(b.start, this.cursor))
            } else if (a >= "0" && a <= "7") {
                do a = c[this.cursor++]; while (a >= "0" && a <= "7");
                this.cursor--, b.value = parseInt(c.substring(b.start, this.cursor))
            } else this.cursor--, this.lexExponent(), b.value = 0
        },
        lexNumber: function(a) {
            var b = this.token,
                c = this.source;
            b.type = NUMBER;
            var d = !1;
            do a = c[this.cursor++], a === "." && !d && (d = !0, a = c[this.cursor++]); while (a >= "0" && a <= "9");
            this.cursor--;
            var e = this.lexExponent();
            d = d || e;
            var f = c.substring(b.start, this.cursor);
            b.value = d ? parseFloat(f) : parseInt(f)
        },
        lexDot: function(a) {
            var b = this.token,
                c = this.source,
                d = c[this.cursor];
            if (d >= "0" && d <= "9") {
                do a = c[this.cursor++]; while (a >= "0" && a <= "9");
                this.cursor--, this.lexExponent(), b.type = NUMBER, b.value = parseFloat(b.start, this.cursor)
            } else b.type = DOT, b.assignOp = null, b.value = "."
        },
        lexString: function(ch) {
            var token = this.token,
                input = this.source;
            token.type = STRING;
            var hasEscapes = !1,
                delim = ch;
            if (input.length <= this.cursor) throw this.newSyntaxError("Unterminated string literal");
            while ((ch = input[this.cursor++]) !== delim) {
                if (this.cursor == input.length) throw this.newSyntaxError("Unterminated string literal");
                if (ch === "\\") {
                    hasEscapes = !0;
                    if (++this.cursor == input.length) throw this.newSyntaxError("Unterminated string literal")
                }
            }
            token.value = hasEscapes ? eval(input.substring(token.start, this.cursor)) : input.substring(token.start + 1, this.cursor - 1)
        },
        lexRegExp: function(ch) {
            var token = this.token,
                input = this.source;
            token.type = REGEXP;
            do {
                ch = input[this.cursor++];
                if (ch === "\\") this.cursor++;
                else if (ch === "[") {
                    do {
                        if (ch === undefined) throw this.newSyntaxError("Unterminated character class");
                        ch === "\\" && this.cursor++, ch = input[this.cursor++]
                    } while (ch !== "]")
                } else if (ch === undefined) throw this.newSyntaxError("Unterminated regex")
            } while (ch !== "/");
            do ch = input[this.cursor++]; while (ch >= "a" && ch <= "z");
            this.cursor--, token.value = eval(input.substring(token.start, this.cursor))
        },
        lexOp: function(a) {
            var b = this.token,
                c = this.source,
                d = opTokens[a],
                e = c[this.cursor];
            e in d && (d = d[e], this.cursor++, e = c[this.cursor], e in d && (d = d[e], this.cursor++, e = c[this.cursor]));
            var f = d.op;
            definitions.assignOps[f] && c[this.cursor] === "=" ? (this.cursor++, b.type = ASSIGN, b.assignOp = definitions.tokenIds[definitions.opTypeNames[f]], f += "=") : (b.type = definitions.tokenIds[definitions.opTypeNames[f]], b.assignOp = null), b.value = f
        },
        lexIdent: function(a) {
            var b = this.token,
                c = a;
            while ((a = this.getValidIdentifierChar(!1)) !== null) c += a;
            b.type = definitions.keywords[c] || IDENTIFIER, b.type in this.blackList && (b.type = IDENTIFIER), b.value = c
        },
        get: function(a) {
            var b;
            while (this.lookahead) {
                --this.lookahead, this.tokenIndex = this.tokenIndex + 1 & 3, b = this.tokens[this.tokenIndex];
                if (b.type !== NEWLINE || this.scanNewlines) return b.type
            }
            this.skip(), this.tokenIndex = this.tokenIndex + 1 & 3, b = this.tokens[this.tokenIndex], b || (this.tokens[this.tokenIndex] = b = {});
            var c = this.source;
            if (this.cursor >= c.length) return b.type = END;
            b.start = this.cursor, b.lineno = this.lineno;
            var d = this.getValidIdentifierChar(!0),
                e = d === null ? c[this.cursor++] : null;
            if (d !== null) this.lexIdent(d);
            else if (a && e === "/") this.lexRegExp(e);
            else if (e in opTokens) this.lexOp(e);
            else if (e === ".") this.lexDot(e);
            else if (e >= "1" && e <= "9") this.lexNumber(e);
            else if (e === "0") this.lexZeroNumber(e);
            else if (e === '"' || e === "'") this.lexString(e);
            else {
                if (!this.scanNewlines || e !== "\n" && e !== "\r") throw this.newSyntaxError("Illegal token");
                e === "\r" && c[this.cursor] === "\n" && this.cursor++, b.type = NEWLINE, b.value = "\n", this.lineno++
            }
            return b.end = this.cursor, b.type
        },
        unget: function() {
            if (++this.lookahead === 4) throw "PANIC: too much lookahead!";
            this.tokenIndex = this.tokenIndex - 1 & 3
        },
        newSyntaxError: function(a) {
            a = (this.filename ? this.filename + ":" : "") + this.lineno + ": " + a;
            var b = new SyntaxError(a, this.filename, this.lineno);
            return b.source = this.source, b.cursor = this.lookahead ? this.tokens[this.tokenIndex + this.lookahead & 3].start : this.cursor, b
        },
        getValidIdentifierChar: function(a) {
            var b = this.source;
            if (this.cursor >= b.length) return null;
            var c = b[this.cursor];
            if (c === "\\" && b[this.cursor + 1] === "u") {
                try {
                    c = String.fromCharCode(parseInt(b.substring(this.cursor + 2, this.cursor + 6), 16))
                } catch (d) {
                    return null
                }
                this.cursor += 5
            }
            if (c <= "") return c >= "a" && c <= "z" || c >= "A" && c <= "Z" || c === "$" || c === "_" || !a && c >= "0" && c <= "9" ? (this.cursor++, c) : null;
            var e = {};
            e["x" + c] = !0, e[c] = !0;
            var f = !1;
            try {
                f = Function("x", "return (x." + (a ? "" : "x") + c + ");")(e) === !0
            } catch (d) {}
            return f && this.cursor++, f ? c : null
        }
    }, {
        Tokenizer: Tokenizer
    }
}), define("ace/narcissus/jsdefs", ["require", "exports", "module"], function(require, exports, module) {
    function defineGetter(a, b, c, d, e) {
        Object.defineProperty(a, b, {
            get: c,
            configurable: !d,
            enumerable: !e
        })
    }

    function defineGetterSetter(a, b, c, d, e, f) {
        Object.defineProperty(a, b, {
            get: c,
            set: d,
            configurable: !e,
            enumerable: !f
        })
    }

    function defineMemoGetter(a, b, c, d, e) {
        Object.defineProperty(a, b, {
            get: function() {
                var f = c();
                return defineProperty(a, b, f, d, !0, e), f
            },
            configurable: !0,
            enumerable: !e
        })
    }

    function defineProperty(a, b, c, d, e, f) {
        Object.defineProperty(a, b, {
            value: c,
            writable: !e,
            configurable: !d,
            enumerable: !f
        })
    }

    function isNativeCode(a) {
        return typeof a == "function" && a.toString().match(/\[native code\]/)
    }

    function getPropertyDescriptor(a, b) {
        while (a) {
            if ({}.hasOwnProperty.call(a, b)) return Object.getOwnPropertyDescriptor(a, b);
            a = Object.getPrototypeOf(a)
        }
    }

    function getPropertyNames(a) {
        var b = Object.create(null, {});
        while (a) {
            var c = Object.getOwnPropertyNames(a);
            for (var d = 0, e = c.length; d < e; d++) b[c[d]] = !0;
            a = Object.getPrototypeOf(a)
        }
        return Object.keys(b)
    }

    function getOwnProperties(a) {
        var b = {};
        for (var c in Object.getOwnPropertyNames(a)) b[c] = Object.getOwnPropertyDescriptor(a, c);
        return b
    }

    function blacklistHandler(a, b) {
        var c = Object.create(null, {}),
            d = StringMap.create(b).mapObject(function(a) {
                return c
            });
        return mixinHandler(d, a)
    }

    function whitelistHandler(a, b) {
        var c = Object.create(null, {}),
            d = StringMap.create(b).mapObject(function(b) {
                return a
            });
        return mixinHandler(d, c)
    }

    function mirrorHandler(a, b) {
        var c = makePassthruHandler(a),
            d = c.defineProperty;
        return c.defineProperty = function(a, c) {
            if (!c.enumerable) throw new Error("mirror property must be enumerable");
            if (!c.configurable) throw new Error("mirror property must be configurable");
            if (c.writable !== b) throw new Error("mirror property must " + (b ? "" : "not ") + "be writable");
            d(a, c)
        }, c.fix = function() {}, c.getOwnPropertyDescriptor = c.getPropertyDescriptor, c.getOwnPropertyNames = getPropertyNames.bind(c, a), c.keys = c.enumerate, c["delete"] = function() {
            return !1
        }, c.hasOwn = c.has, c
    }

    function mixinHandler(a, b) {
        function c(c) {
            return hasOwn(a, c) ? a[c] : b
        }

        function d(a) {
            var b = getPropertyDescriptor(c(a), a);
            return b && (b.configurable = !0), b
        }

        function e() {
            var c = Object.getOwnPropertyNames(a).filter(function(b) {
                    return b in a[b]
                }),
                d = getPropertyNames(b).filter(function(b) {
                    return !hasOwn(a, b)
                });
            return c.concat(d)
        }

        function f() {
            var c = Object.getOwnPropertyNames(a).filter(function(b) {
                return b in a[b]
            });
            for (name in b) hasOwn(a, name) || c.push(name);
            return c
        }

        function g(a) {
            return a in c(a)
        }
        return {
            getOwnPropertyDescriptor: d,
            getPropertyDescriptor: d,
            getOwnPropertyNames: e,
            defineProperty: function(a, b) {
                Object.defineProperty(c(a), a, b)
            },
            "delete": function(a) {
                var b = c(a);
                return delete b[a]
            },
            fix: function() {},
            has: g,
            hasOwn: g,
            get: function(a, b) {
                var d = c(b);
                return d[b]
            },
            set: function(a, b, d) {
                var e = c(b);
                return e[b] = d, !0
            },
            enumerate: f,
            keys: f
        }
    }

    function makePassthruHandler(a) {
        return {
            getOwnPropertyDescriptor: function(b) {
                var c = Object.getOwnPropertyDescriptor(a, b);
                return c.configurable = !0, c
            },
            getPropertyDescriptor: function(b) {
                var c = getPropertyDescriptor(a, b);
                return c.configurable = !0, c
            },
            getOwnPropertyNames: function() {
                return Object.getOwnPropertyNames(a)
            },
            defineProperty: function(b, c) {
                Object.defineProperty(a, b, c)
            },
            "delete": function(b) {
                return delete a[b]
            },
            fix: function() {
                return Object.isFrozen(a) ? getOwnProperties(a) : undefined
            },
            has: function(b) {
                return b in a
            },
            hasOwn: function(b) {
                return {}.hasOwnProperty.call(a, b)
            },
            get: function(b, c) {
                return a[c]
            },
            set: function(b, c, d) {
                return a[c] = d, !0
            },
            enumerate: function() {
                var b = [];
                for (name in a) b.push(name);
                return b
            },
            keys: function() {
                return Object.keys(a)
            }
        }
    }

    function hasOwn(a, b) {
        return hasOwnProperty.call(a, b)
    }

    function StringMap(a, b) {
        this.table = a || Object.create(null, {}), this.size = b || 0
    }

    function ObjectMap(a) {
        this.array = a || []
    }

    function searchMap(a, b, c, d) {
        var e = a.array;
        for (var f = 0, g = e.length; f < g; f++) {
            var h = e[f];
            if (h.key === b) return c(h, f)
        }
        return d()
    }

    function Stack(a) {
        this.elts = a || null
    }
    var narcissus = {
        options: {
            version: 185,
            hiddenHostGlobals: {
                Narcissus: !0
            },
            desugarExtensions: !1
        },
        hostSupportsEvalConst: function() {
            try {
                return eval("(function(s) { eval(s); return x })('const x = true;')")
            } catch (e) {
                return !1
            }
        }(),
        hostGlobal: this
    };
    Narcissus = narcissus;
    var tokens = ["END", "\n", ";", ",", "=", "?", ":", "CONDITIONAL", "||", "&&", "|", "^", "&", "==", "!=", "===", "!==", "<", "<=", ">=", ">", "<<", ">>", ">>>", "+", "-", "*", "/", "%", "!", "~", "UNARY_PLUS", "UNARY_MINUS", "++", "--", ".", "[", "]", "{", "}", "(", ")", "SCRIPT", "BLOCK", "LABEL", "FOR_IN", "CALL", "NEW_WITH_ARGS", "INDEX", "ARRAY_INIT", "OBJECT_INIT", "PROPERTY_INIT", "GETTER", "SETTER", "GROUP", "LIST", "LET_BLOCK", "ARRAY_COMP", "GENERATOR", "COMP_TAIL", "IDENTIFIER", "NUMBER", "STRING", "REGEXP", "break", "case", "catch", "const", "continue", "debugger", "default", "delete", "do", "else", "export", "false", "finally", "for", "function", "if", "import", "in", "instanceof", "let", "module", "new", "null", "return", "switch", "this", "throw", "true", "try", "typeof", "var", "void", "yield", "while", "with"],
        statementStartTokens = ["break", "const", "continue", "debugger", "do", "for", "if", "return", "switch", "throw", "try", "var", "yield", "while", "with"],
        whitespaceChars = ["\t", "", "\f", " ", " ", "﻿", " ", "᠎", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "　"],
        whitespace = {};
    for (var i = 0; i < whitespaceChars.length; i++) whitespace[whitespaceChars[i]] = !0;
    var opTypeNames = {
            "\n": "NEWLINE",
            ";": "SEMICOLON",
            ",": "COMMA",
            "?": "HOOK",
            ":": "COLON",
            "||": "OR",
            "&&": "AND",
            "|": "BITWISE_OR",
            "^": "BITWISE_XOR",
            "&": "BITWISE_AND",
            "===": "STRICT_EQ",
            "==": "EQ",
            "=": "ASSIGN",
            "!==": "STRICT_NE",
            "!=": "NE",
            "<<": "LSH",
            "<=": "LE",
            "<": "LT",
            ">>>": "URSH",
            ">>": "RSH",
            ">=": "GE",
            ">": "GT",
            "++": "INCREMENT",
            "--": "DECREMENT",
            "+": "PLUS",
            "-": "MINUS",
            "*": "MUL",
            "/": "DIV",
            "%": "MOD",
            "!": "NOT",
            "~": "BITWISE_NOT",
            ".": "DOT",
            "[": "LEFT_BRACKET",
            "]": "RIGHT_BRACKET",
            "{": "LEFT_CURLY",
            "}": "RIGHT_CURLY",
            "(": "LEFT_PAREN",
            ")": "RIGHT_PAREN"
        },
        keywords = {
            "__proto__": null
        },
        tokenIds = {},
        consts = Narcissus.hostSupportsEvalConst ? "const " : "var ";
    for (var i = 0, j = tokens.length; i < j; i++) {
        i > 0 && (consts += ", ");
        var t = tokens[i],
            name;
        /^[a-z]/.test(t) ? (name = t.toUpperCase(), keywords[t] = i) : name = /^\W/.test(t) ? opTypeNames[t] : t, consts += name + " = " + i, tokenIds[name] = i, tokens[t] = i
    }
    consts += ";";
    var isStatementStartCode = {
        "__proto__": null
    };
    for (i = 0, j = statementStartTokens.length; i < j; i++) isStatementStartCode[keywords[statementStartTokens[i]]] = !0;
    var assignOps = ["|", "^", "&", "<<", ">>", ">>>", "+", "-", "*", "/", "%"];
    for (i = 0, j = assignOps.length; i < j; i++) t = assignOps[i], assignOps[t] = tokens[t];
    var hasOwnProperty = {}.hasOwnProperty;
    StringMap.create = function(a) {
        var b = Object.create(null, {}),
            c = 0,
            d = Object.getOwnPropertyNames(a);
        for (var e = 0, f = d.length; e < f; e++) {
            var g = d[e];
            b[g] = a[g], c++
        }
        return new StringMap(b, c)
    }, StringMap.prototype = {
        has: function(a) {
            return hasOwnProperty.call(this.table, a)
        },
        set: function(a, b) {
            hasOwnProperty.call(this.table, a) || this.size++, this.table[a] = b
        },
        get: function(a) {
            return this.table[a]
        },
        getDef: function(a, b) {
            return hasOwnProperty.call(this.table, a) || (this.size++, this.table[a] = b()), this.table[a]
        },
        forEach: function(a) {
            var b = this.table;
            for (var c in b) a.call(this, c, b[c])
        },
        map: function(a) {
            var b = this.table,
                c = Object.create(null, {});
            return this.forEach(function(b, d) {
                c[b] = a.call(this, d, b)
            }), new StringMap(c, this.size)
        },
        mapObject: function(a) {
            var b = this.table,
                c = Object.create(null, {});
            return this.forEach(function(b, d) {
                c[b] = a.call(this, d, b)
            }), c
        },
        toObject: function() {
            return this.mapObject(function(a) {
                return a
            })
        },
        choose: function() {
            return Object.getOwnPropertyNames(this.table)[0]
        },
        remove: function(a) {
            hasOwnProperty.call(this.table, a) && (this.size--, delete this.table[a])
        },
        copy: function() {
            var a = Object.create(null, {});
            for (var b in this.table) a[b] = this.table[b];
            return new StringMap(a, this.size)
        },
        toString: function() {
            return "[object StringMap]"
        }
    }, ObjectMap.prototype = {
        has: function(a) {
            return searchMap(this, a, function() {
                return !0
            }, function() {
                return !1
            })
        },
        set: function(a, b) {
            var c = this.array;
            searchMap(this, a, function(a) {
                a.value = b
            }, function() {
                c.push({
                    key: a,
                    value: b
                })
            })
        },
        get: function(a) {
            return searchMap(this, a, function(a) {
                return a.value
            }, function() {
                return null
            })
        },
        getDef: function(a, b) {
            var c = this.array;
            return searchMap(this, a, function(a) {
                return a.value
            }, function() {
                var d = b();
                return c.push({
                    key: a,
                    value: d
                }), d
            })
        },
        forEach: function(a) {
            var b = this.array;
            for (var c = 0, d = b.length; c < d; c++) {
                var e = b[c];
                a.call(this, e.key, e.value)
            }
        },
        choose: function() {
            return this.array[0].key
        },
        get size() {
            return this.array.length
        },
        remove: function(a) {
            var b = this.array;
            searchMap(this, a, function(a, c) {
                b.splice(c, 1)
            }, function() {})
        },
        copy: function() {
            return new ObjectMap(this.array.map(function(a) {
                return {
                    key: a.key,
                    value: a.value
                }
            }))
        },
        clear: function() {
            this.array = []
        },
        toString: function() {
            return "[object ObjectMap]"
        }
    }, Stack.prototype = {
        push: function(a) {
            return new Stack({
                top: a,
                rest: this.elts
            })
        },
        top: function() {
            if (!this.elts) throw new Error("empty stack");
            return this.elts.top
        },
        isEmpty: function() {
            return this.top === null
        },
        find: function(a) {
            for (var b = this.elts; b; b = b.rest)
                if (a(b.top)) return b.top;
            return null
        },
        has: function(a) {
            return Boolean(this.find(function(b) {
                return b === a
            }))
        },
        forEach: function(a) {
            for (var b = this.elts; b; b = b.rest) a(b.top)
        }
    }, module.exports = {
        tokens: tokens,
        whitespace: whitespace,
        opTypeNames: opTypeNames,
        keywords: keywords,
        isStatementStartCode: isStatementStartCode,
        tokenIds: tokenIds,
        consts: consts,
        assignOps: assignOps,
        defineGetter: defineGetter,
        defineGetterSetter: defineGetterSetter,
        defineMemoGetter: defineMemoGetter,
        defineProperty: defineProperty,
        isNativeCode: isNativeCode,
        mirrorHandler: mirrorHandler,
        mixinHandler: mixinHandler,
        whitelistHandler: whitelistHandler,
        blacklistHandler: blacklistHandler,
        makePassthruHandler: makePassthruHandler,
        StringMap: StringMap,
        ObjectMap: ObjectMap,
        Stack: Stack
    }
})
