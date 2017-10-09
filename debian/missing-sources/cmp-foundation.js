/*
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.ComponentMgr = function() {
    var c = new Ext.util.MixedCollection();
    var b = {};
    var a = {};
    return {
        register: function(d) {
            c.add(d)
        },
        unregister: function(d) {
            c.remove(d)
        },
        get: function(d) {
            return c.get(d)
        },
        onAvailable: function(f, e, d) {
            c.on("add", function(g, h) {
                if (h.id == f) {
                    e.call(d || h, h);
                    c.un("add", e, d)
                }
            })
        },
        all: c,
        types: b,
        ptypes: a,
        isRegistered: function(d) {
            return b[d] !== undefined
        },
        isPluginRegistered: function(d) {
            return a[d] !== undefined
        },
        registerType: function(e, d) {
            b[e] = d;
            d.xtype = e
        },
        create: function(d, e) {
            return d.render ? d : new b[d.xtype || e](d)
        },
        registerPlugin: function(e, d) {
            a[e] = d;
            d.ptype = e
        },
        createPlugin: function(e, f) {
            var d = a[e.ptype || f];
            if (d.init) {
                return d
            } else {
                return new d(e)
            }
        }
    }
}();
Ext.reg = Ext.ComponentMgr.registerType;
Ext.preg = Ext.ComponentMgr.registerPlugin;
Ext.create = Ext.ComponentMgr.create;
Ext.Component = function(b) {
    b = b || {};
    if (b.initialConfig) {
        if (b.isAction) {
            this.baseAction = b
        }
        b = b.initialConfig
    } else {
        if (b.tagName || b.dom || Ext.isString(b)) {
            b = {
                applyTo: b,
                id: b.id || b
            }
        }
    }
    this.initialConfig = b;
    Ext.apply(this, b);
    this.addEvents("added", "disable", "enable", "beforeshow", "show", "beforehide", "hide", "removed", "beforerender", "render", "afterrender", "beforedestroy", "destroy", "beforestaterestore", "staterestore", "beforestatesave", "statesave");
    this.getId();
    Ext.ComponentMgr.register(this);
    Ext.Component.superclass.constructor.call(this);
    if (this.baseAction) {
        this.baseAction.addComponent(this)
    }
    this.initComponent();
    if (this.plugins) {
        if (Ext.isArray(this.plugins)) {
            for (var c = 0, a = this.plugins.length; c < a; c++) {
                this.plugins[c] = this.initPlugin(this.plugins[c])
            }
        } else {
            this.plugins = this.initPlugin(this.plugins)
        }
    }
    if (this.stateful !== false) {
        this.initState()
    }
    if (this.applyTo) {
        this.applyToMarkup(this.applyTo);
        delete this.applyTo
    } else {
        if (this.renderTo) {
            this.render(this.renderTo);
            delete this.renderTo
        }
    }
};
Ext.Component.AUTO_ID = 1000;
Ext.extend(Ext.Component, Ext.util.Observable, {
    disabled: false,
    hidden: false,
    autoEl: "div",
    disabledClass: "x-item-disabled",
    allowDomMove: true,
    autoShow: false,
    hideMode: "display",
    hideParent: false,
    rendered: false,
    tplWriteMode: "overwrite",
    bubbleEvents: [],
    ctype: "Ext.Component",
    actionMode: "el",
    getActionEl: function() {
        return this[this.actionMode]
    },
    initPlugin: function(a) {
        if (a.ptype && !Ext.isFunction(a.init)) {
            a = Ext.ComponentMgr.createPlugin(a)
        } else {
            if (Ext.isString(a)) {
                a = Ext.ComponentMgr.createPlugin({
                    ptype: a
                })
            }
        }
        a.init(this);
        return a
    },
    initComponent: function() {
        if (this.listeners) {
            this.on(this.listeners);
            delete this.listeners
        }
        this.enableBubble(this.bubbleEvents)
    },
    render: function(b, a) {
        if (!this.rendered && this.fireEvent("beforerender", this) !== false) {
            if (!b && this.el) {
                this.el = Ext.get(this.el);
                b = this.el.dom.parentNode;
                this.allowDomMove = false
            }
            this.container = Ext.get(b);
            if (this.ctCls) {
                this.container.addClass(this.ctCls)
            }
            this.rendered = true;
            if (a !== undefined) {
                if (Ext.isNumber(a)) {
                    a = this.container.dom.childNodes[a]
                } else {
                    a = Ext.getDom(a)
                }
            }
            this.onRender(this.container, a || null);
            if (this.autoShow) {
                this.el.removeClass(["x-hidden", "x-hide-" + this.hideMode])
            }
            if (this.cls) {
                this.el.addClass(this.cls);
                delete this.cls
            }
            if (this.style) {
                this.el.applyStyles(this.style);
                delete this.style
            }
            if (this.overCls) {
                this.el.addClassOnOver(this.overCls)
            }
            this.fireEvent("render", this);
            var c = this.getContentTarget();
            if (this.html) {
                c.update(Ext.DomHelper.markup(this.html));
                delete this.html
            }
            if (this.contentEl) {
                var d = Ext.getDom(this.contentEl);
                Ext.fly(d).removeClass(["x-hidden", "x-hide-display"]);
                c.appendChild(d)
            }
            if (this.tpl) {
                if (!this.tpl.compile) {
                    this.tpl = new Ext.XTemplate(this.tpl)
                }
                if (this.data) {
                    this.tpl[this.tplWriteMode](c, this.data);
                    delete this.data
                }
            }
            this.afterRender(this.container);
            if (this.hidden) {
                this.doHide()
            }
            if (this.disabled) {
                this.disable(true)
            }
            if (this.stateful !== false) {
                this.initStateEvents()
            }
            this.fireEvent("afterrender", this)
        }
        return this
    },
    update: function(b, d, a) {
        var c = this.getContentTarget();
        if (this.tpl && typeof b !== "string") {
            this.tpl[this.tplWriteMode](c, b || {})
        } else {
            var e = Ext.isObject(b) ? Ext.DomHelper.markup(b) : b;
            c.update(e, d, a)
        }
    },
    onAdded: function(a, b) {
        this.ownerCt = a;
        this.initRef();
        this.fireEvent("added", this, a, b)
    },
    onRemoved: function() {
        this.removeRef();
        this.fireEvent("removed", this, this.ownerCt);
        delete this.ownerCt
    },
    initRef: function() {
        if (this.ref && !this.refOwner) {
            var d = this.ref.split("/"),
                c = d.length,
                b = 0,
                a = this;
            while (a && b < c) {
                a = a.ownerCt;
                ++b
            }
            if (a) {
                a[this.refName = d[--b]] = this;
                this.refOwner = a
            }
        }
    },
    removeRef: function() {
        if (this.refOwner && this.refName) {
            delete this.refOwner[this.refName];
            delete this.refOwner
        }
    },
    initState: function() {
        if (Ext.state.Manager) {
            var b = this.getStateId();
            if (b) {
                var a = Ext.state.Manager.get(b);
                if (a) {
                    if (this.fireEvent("beforestaterestore", this, a) !== false) {
                        this.applyState(Ext.apply({}, a));
                        this.fireEvent("staterestore", this, a)
                    }
                }
            }
        }
    },
    getStateId: function() {
        return this.stateId || ((/^(ext-comp-|ext-gen)/).test(String(this.id)) ? null : this.id)
    },
    initStateEvents: function() {
        if (this.stateEvents) {
            for (var a = 0, b; b = this.stateEvents[a]; a++) {
                this.on(b, this.saveState, this, {
                    delay: 100
                })
            }
        }
    },
    applyState: function(a) {
        if (a) {
            Ext.apply(this, a)
        }
    },
    getState: function() {
        return null
    },
    saveState: function() {
        if (Ext.state.Manager && this.stateful !== false) {
            var b = this.getStateId();
            if (b) {
                var a = this.getState();
                if (this.fireEvent("beforestatesave", this, a) !== false) {
                    Ext.state.Manager.set(b, a);
                    this.fireEvent("statesave", this, a)
                }
            }
        }
    },
    applyToMarkup: function(a) {
        this.allowDomMove = false;
        this.el = Ext.get(a);
        this.render(this.el.dom.parentNode)
    },
    addClass: function(a) {
        if (this.el) {
            this.el.addClass(a)
        } else {
            this.cls = this.cls ? this.cls + " " + a : a
        }
        return this
    },
    removeClass: function(a) {
        if (this.el) {
            this.el.removeClass(a)
        } else {
            if (this.cls) {
                this.cls = this.cls.split(" ").remove(a).join(" ")
            }
        }
        return this
    },
    onRender: function(b, a) {
        if (!this.el && this.autoEl) {
            if (Ext.isString(this.autoEl)) {
                this.el = document.createElement(this.autoEl)
            } else {
                var c = document.createElement("div");
                Ext.DomHelper.overwrite(c, this.autoEl);
                this.el = c.firstChild
            } if (!this.el.id) {
                this.el.id = this.getId()
            }
        }
        if (this.el) {
            this.el = Ext.get(this.el);
            if (this.allowDomMove !== false) {
                b.dom.insertBefore(this.el.dom, a);
                if (c) {
                    Ext.removeNode(c);
                    c = null
                }
            }
        }
    },
    getAutoCreate: function() {
        var a = Ext.isObject(this.autoCreate) ? this.autoCreate : Ext.apply({}, this.defaultAutoCreate);
        if (this.id && !a.id) {
            a.id = this.id
        }
        return a
    },
    afterRender: Ext.emptyFn,
    destroy: function() {
        if (!this.isDestroyed) {
            if (this.fireEvent("beforedestroy", this) !== false) {
                this.destroying = true;
                this.beforeDestroy();
                if (this.ownerCt && this.ownerCt.remove) {
                    this.ownerCt.remove(this, false)
                }
                if (this.rendered) {
                    this.el.remove();
                    if (this.actionMode == "container" || this.removeMode == "container") {
                        this.container.remove()
                    }
                }
                if (this.focusTask && this.focusTask.cancel) {
                    this.focusTask.cancel()
                }
                this.onDestroy();
                Ext.ComponentMgr.unregister(this);
                this.fireEvent("destroy", this);
                this.purgeListeners();
                this.destroying = false;
                this.isDestroyed = true
            }
        }
    },
    deleteMembers: function() {
        var b = arguments;
        for (var c = 0, a = b.length; c < a; ++c) {
            delete this[b[c]]
        }
    },
    beforeDestroy: Ext.emptyFn,
    onDestroy: Ext.emptyFn,
    getEl: function() {
        return this.el
    },
    getContentTarget: function() {
        return this.el
    },
    getId: function() {
        return this.id || (this.id = "ext-comp-" + (++Ext.Component.AUTO_ID))
    },
    getItemId: function() {
        return this.itemId || this.getId()
    },
    focus: function(b, a) {
        if (a) {
            this.focusTask = new Ext.util.DelayedTask(this.focus, this, [b, false]);
            this.focusTask.delay(Ext.isNumber(a) ? a : 10);
            return this
        }
        if (this.rendered && !this.isDestroyed) {
            this.el.focus();
            if (b === true) {
                this.el.dom.select()
            }
        }
        return this
    },
    blur: function() {
        if (this.rendered) {
            this.el.blur()
        }
        return this
    },
    disable: function(a) {
        if (this.rendered) {
            this.onDisable()
        }
        this.disabled = true;
        if (a !== true) {
            this.fireEvent("disable", this)
        }
        return this
    },
    onDisable: function() {
        this.getActionEl().addClass(this.disabledClass);
        this.el.dom.disabled = true
    },
    enable: function() {
        if (this.rendered) {
            this.onEnable()
        }
        this.disabled = false;
        this.fireEvent("enable", this);
        return this
    },
    onEnable: function() {
        this.getActionEl().removeClass(this.disabledClass);
        this.el.dom.disabled = false
    },
    setDisabled: function(a) {
        return this[a ? "disable" : "enable"]()
    },
    show: function() {
        if (this.fireEvent("beforeshow", this) !== false) {
            this.hidden = false;
            if (this.autoRender) {
                this.render(Ext.isBoolean(this.autoRender) ? Ext.getBody() : this.autoRender)
            }
            if (this.rendered) {
                this.onShow()
            }
            this.fireEvent("show", this)
        }
        return this
    },
    onShow: function() {
        this.getVisibilityEl().removeClass("x-hide-" + this.hideMode)
    },
    hide: function() {
        if (this.fireEvent("beforehide", this) !== false) {
            this.doHide();
            this.fireEvent("hide", this)
        }
        return this
    },
    doHide: function() {
        this.hidden = true;
        if (this.rendered) {
            this.onHide()
        }
    },
    onHide: function() {
        this.getVisibilityEl().addClass("x-hide-" + this.hideMode)
    },
    getVisibilityEl: function() {
        return this.hideParent ? this.container : this.getActionEl()
    },
    setVisible: function(a) {
        return this[a ? "show" : "hide"]()
    },
    isVisible: function() {
        return this.rendered && this.getVisibilityEl().isVisible()
    },
    cloneConfig: function(b) {
        b = b || {};
        var c = b.id || Ext.id();
        var a = Ext.applyIf(b, this.initialConfig);
        a.id = c;
        return new this.constructor(a)
    },
    getXType: function() {
        return this.constructor.xtype
    },
    isXType: function(b, a) {
        if (Ext.isFunction(b)) {
            b = b.xtype
        } else {
            if (Ext.isObject(b)) {
                b = b.constructor.xtype
            }
        }
        return !a ? ("/" + this.getXTypes() + "/").indexOf("/" + b + "/") != -1 : this.constructor.xtype == b
    },
    getXTypes: function() {
        var a = this.constructor;
        if (!a.xtypes) {
            var d = [],
                b = this;
            while (b && b.constructor.xtype) {
                d.unshift(b.constructor.xtype);
                b = b.constructor.superclass
            }
            a.xtypeChain = d;
            a.xtypes = d.join("/")
        }
        return a.xtypes
    },
    findParentBy: function(a) {
        for (var b = this.ownerCt;
            (b != null) && !a(b, this); b = b.ownerCt) {}
        return b || null
    },
    findParentByType: function(b, a) {
        return this.findParentBy(function(d) {
            return d.isXType(b, a)
        })
    },
    bubble: function(c, b, a) {
        var d = this;
        while (d) {
            if (c.apply(b || d, a || [d]) === false) {
                break
            }
            d = d.ownerCt
        }
        return this
    },
    getPositionEl: function() {
        return this.positionEl || this.el
    },
    purgeListeners: function() {
        Ext.Component.superclass.purgeListeners.call(this);
        if (this.mons) {
            this.on("beforedestroy", this.clearMons, this, {
                single: true
            })
        }
    },
    clearMons: function() {
        Ext.each(this.mons, function(a) {
            a.item.un(a.ename, a.fn, a.scope)
        }, this);
        this.mons = []
    },
    createMons: function() {
        if (!this.mons) {
            this.mons = [];
            this.on("beforedestroy", this.clearMons, this, {
                single: true
            })
        }
    },
    mon: function(f, b, d, c, a) {
        this.createMons();
        if (Ext.isObject(b)) {
            var i = /^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate)$/;
            var h = b;
            for (var g in h) {
                if (i.test(g)) {
                    continue
                }
                if (Ext.isFunction(h[g])) {
                    this.mons.push({
                        item: f,
                        ename: g,
                        fn: h[g],
                        scope: h.scope
                    });
                    f.on(g, h[g], h.scope, h)
                } else {
                    this.mons.push({
                        item: f,
                        ename: g,
                        fn: h[g],
                        scope: h.scope
                    });
                    f.on(g, h[g])
                }
            }
            return
        }
        this.mons.push({
            item: f,
            ename: b,
            fn: d,
            scope: c
        });
        f.on(b, d, c, a)
    },
    mun: function(g, c, f, e) {
        var h, d;
        this.createMons();
        for (var b = 0, a = this.mons.length; b < a; ++b) {
            d = this.mons[b];
            if (g === d.item && c == d.ename && f === d.fn && e === d.scope) {
                this.mons.splice(b, 1);
                g.un(c, f, e);
                h = true;
                break
            }
        }
        return h
    },
    nextSibling: function() {
        if (this.ownerCt) {
            var a = this.ownerCt.items.indexOf(this);
            if (a != -1 && a + 1 < this.ownerCt.items.getCount()) {
                return this.ownerCt.items.itemAt(a + 1)
            }
        }
        return null
    },
    previousSibling: function() {
        if (this.ownerCt) {
            var a = this.ownerCt.items.indexOf(this);
            if (a > 0) {
                return this.ownerCt.items.itemAt(a - 1)
            }
        }
        return null
    },
    getBubbleTarget: function() {
        return this.ownerCt
    }
});
Ext.reg("component", Ext.Component);
Ext.Action = Ext.extend(Object, {
    constructor: function(a) {
        this.initialConfig = a;
        this.itemId = a.itemId = (a.itemId || a.id || Ext.id());
        this.items = []
    },
    isAction: true,
    setText: function(a) {
        this.initialConfig.text = a;
        this.callEach("setText", [a])
    },
    getText: function() {
        return this.initialConfig.text
    },
    setIconClass: function(a) {
        this.initialConfig.iconCls = a;
        this.callEach("setIconClass", [a])
    },
    getIconClass: function() {
        return this.initialConfig.iconCls
    },
    setDisabled: function(a) {
        this.initialConfig.disabled = a;
        this.callEach("setDisabled", [a])
    },
    enable: function() {
        this.setDisabled(false)
    },
    disable: function() {
        this.setDisabled(true)
    },
    isDisabled: function() {
        return this.initialConfig.disabled
    },
    setHidden: function(a) {
        this.initialConfig.hidden = a;
        this.callEach("setVisible", [!a])
    },
    show: function() {
        this.setHidden(false)
    },
    hide: function() {
        this.setHidden(true)
    },
    isHidden: function() {
        return this.initialConfig.hidden
    },
    setHandler: function(b, a) {
        this.initialConfig.handler = b;
        this.initialConfig.scope = a;
        this.callEach("setHandler", [b, a])
    },
    each: function(b, a) {
        Ext.each(this.items, b, a)
    },
    callEach: function(e, b) {
        var d = this.items;
        for (var c = 0, a = d.length; c < a; c++) {
            d[c][e].apply(d[c], b)
        }
    },
    addComponent: function(a) {
        this.items.push(a);
        a.on("destroy", this.removeComponent, this)
    },
    removeComponent: function(a) {
        this.items.remove(a)
    },
    execute: function() {
        this.initialConfig.handler.apply(this.initialConfig.scope || window, arguments)
    }
});
(function() {
    Ext.Layer = function(d, c) {
        d = d || {};
        var e = Ext.DomHelper,
            g = d.parentEl,
            f = g ? Ext.getDom(g) : document.body;
        if (c) {
            this.dom = Ext.getDom(c)
        }
        if (!this.dom) {
            var h = d.dh || {
                tag: "div",
                cls: "x-layer"
            };
            this.dom = e.append(f, h)
        }
        if (d.cls) {
            this.addClass(d.cls)
        }
        this.constrain = d.constrain !== false;
        this.setVisibilityMode(Ext.Element.VISIBILITY);
        if (d.id) {
            this.id = this.dom.id = d.id
        } else {
            this.id = Ext.id(this.dom)
        }
        this.zindex = d.zindex || this.getZIndex();
        this.position("absolute", this.zindex);
        if (d.shadow) {
            this.shadowOffset = d.shadowOffset || 4;
            this.shadow = new Ext.Shadow({
                offset: this.shadowOffset,
                mode: d.shadow
            })
        } else {
            this.shadowOffset = 0
        }
        this.useShim = d.shim !== false && Ext.useShims;
        this.useDisplay = d.useDisplay;
        this.hide()
    };
    var a = Ext.Element.prototype;
    var b = [];
    Ext.extend(Ext.Layer, Ext.Element, {
        getZIndex: function() {
            return this.zindex || parseInt((this.getShim() || this).getStyle("z-index"), 10) || 11000
        },
        getShim: function() {
            if (!this.useShim) {
                return null
            }
            if (this.shim) {
                return this.shim
            }
            var d = b.shift();
            if (!d) {
                d = this.createShim();
                d.enableDisplayMode("block");
                d.dom.style.display = "none";
                d.dom.style.visibility = "visible"
            }
            var c = this.dom.parentNode;
            if (d.dom.parentNode != c) {
                c.insertBefore(d.dom, this.dom)
            }
            d.setStyle("z-index", this.getZIndex() - 2);
            this.shim = d;
            return d
        },
        hideShim: function() {
            if (this.shim) {
                this.shim.setDisplayed(false);
                b.push(this.shim);
                delete this.shim
            }
        },
        disableShadow: function() {
            if (this.shadow) {
                this.shadowDisabled = true;
                this.shadow.hide();
                this.lastShadowOffset = this.shadowOffset;
                this.shadowOffset = 0
            }
        },
        enableShadow: function(c) {
            if (this.shadow) {
                this.shadowDisabled = false;
                this.shadowOffset = this.lastShadowOffset;
                delete this.lastShadowOffset;
                if (c) {
                    this.sync(true)
                }
            }
        },
        sync: function(d) {
            var m = this.shadow;
            if (!this.updating && this.isVisible() && (m || this.useShim)) {
                var g = this.getShim(),
                    k = this.getWidth(),
                    i = this.getHeight(),
                    e = this.getLeft(true),
                    n = this.getTop(true);
                if (m && !this.shadowDisabled) {
                    if (d && !m.isVisible()) {
                        m.show(this)
                    } else {
                        m.realign(e, n, k, i)
                    } if (g) {
                        if (d) {
                            g.show()
                        }
                        var j = m.el.getXY(),
                            f = g.dom.style,
                            c = m.el.getSize();
                        f.left = (j[0]) + "px";
                        f.top = (j[1]) + "px";
                        f.width = (c.width) + "px";
                        f.height = (c.height) + "px"
                    }
                } else {
                    if (g) {
                        if (d) {
                            g.show()
                        }
                        g.setSize(k, i);
                        g.setLeftTop(e, n)
                    }
                }
            }
        },
        destroy: function() {
            this.hideShim();
            if (this.shadow) {
                this.shadow.hide()
            }
            this.removeAllListeners();
            Ext.removeNode(this.dom);
            delete this.dom
        },
        remove: function() {
            this.destroy()
        },
        beginUpdate: function() {
            this.updating = true
        },
        endUpdate: function() {
            this.updating = false;
            this.sync(true)
        },
        hideUnders: function(c) {
            if (this.shadow) {
                this.shadow.hide()
            }
            this.hideShim()
        },
        constrainXY: function() {
            if (this.constrain) {
                var i = Ext.lib.Dom.getViewWidth(),
                    d = Ext.lib.Dom.getViewHeight();
                var n = Ext.getDoc().getScroll();
                var m = this.getXY();
                var j = m[0],
                    g = m[1];
                var c = this.shadowOffset;
                var k = this.dom.offsetWidth + c,
                    e = this.dom.offsetHeight + c;
                var f = false;
                if ((j + k) > i + n.left) {
                    j = i - k - c;
                    f = true
                }
                if ((g + e) > d + n.top) {
                    g = d - e - c;
                    f = true
                }
                if (j < n.left) {
                    j = n.left;
                    f = true
                }
                if (g < n.top) {
                    g = n.top;
                    f = true
                }
                if (f) {
                    if (this.avoidY) {
                        var l = this.avoidY;
                        if (g <= l && (g + e) >= l) {
                            g = l - e - 5
                        }
                    }
                    m = [j, g];
                    this.storeXY(m);
                    a.setXY.call(this, m);
                    this.sync()
                }
            }
            return this
        },
        getConstrainOffset: function() {
            return this.shadowOffset
        },
        isVisible: function() {
            return this.visible
        },
        showAction: function() {
            this.visible = true;
            if (this.useDisplay === true) {
                this.setDisplayed("")
            } else {
                if (this.lastXY) {
                    a.setXY.call(this, this.lastXY)
                } else {
                    if (this.lastLT) {
                        a.setLeftTop.call(this, this.lastLT[0], this.lastLT[1])
                    }
                }
            }
        },
        hideAction: function() {
            this.visible = false;
            if (this.useDisplay === true) {
                this.setDisplayed(false)
            } else {
                this.setLeftTop(-10000, -10000)
            }
        },
        setVisible: function(h, g, j, k, i) {
            if (h) {
                this.showAction()
            }
            if (g && h) {
                var f = function() {
                    this.sync(true);
                    if (k) {
                        k()
                    }
                }.createDelegate(this);
                a.setVisible.call(this, true, true, j, f, i)
            } else {
                if (!h) {
                    this.hideUnders(true)
                }
                var f = k;
                if (g) {
                    f = function() {
                        this.hideAction();
                        if (k) {
                            k()
                        }
                    }.createDelegate(this)
                }
                a.setVisible.call(this, h, g, j, f, i);
                if (h) {
                    this.sync(true)
                } else {
                    if (!g) {
                        this.hideAction()
                    }
                }
            }
            return this
        },
        storeXY: function(c) {
            delete this.lastLT;
            this.lastXY = c
        },
        storeLeftTop: function(d, c) {
            delete this.lastXY;
            this.lastLT = [d, c]
        },
        beforeFx: function() {
            this.beforeAction();
            return Ext.Layer.superclass.beforeFx.apply(this, arguments)
        },
        afterFx: function() {
            Ext.Layer.superclass.afterFx.apply(this, arguments);
            this.sync(this.isVisible())
        },
        beforeAction: function() {
            if (!this.updating && this.shadow) {
                this.shadow.hide()
            }
        },
        setLeft: function(c) {
            this.storeLeftTop(c, this.getTop(true));
            a.setLeft.apply(this, arguments);
            this.sync();
            return this
        },
        setTop: function(c) {
            this.storeLeftTop(this.getLeft(true), c);
            a.setTop.apply(this, arguments);
            this.sync();
            return this
        },
        setLeftTop: function(d, c) {
            this.storeLeftTop(d, c);
            a.setLeftTop.apply(this, arguments);
            this.sync();
            return this
        },
        setXY: function(i, g, j, k, h) {
            this.fixDisplay();
            this.beforeAction();
            this.storeXY(i);
            var f = this.createCB(k);
            a.setXY.call(this, i, g, j, f, h);
            if (!g) {
                f()
            }
            return this
        },
        createCB: function(e) {
            var d = this;
            return function() {
                d.constrainXY();
                d.sync(true);
                if (e) {
                    e()
                }
            }
        },
        setX: function(f, g, i, j, h) {
            this.setXY([f, this.getY()], g, i, j, h);
            return this
        },
        setY: function(j, f, h, i, g) {
            this.setXY([this.getX(), j], f, h, i, g);
            return this
        },
        setSize: function(i, j, g, l, m, k) {
            this.beforeAction();
            var f = this.createCB(m);
            a.setSize.call(this, i, j, g, l, f, k);
            if (!g) {
                f()
            }
            return this
        },
        setWidth: function(h, g, j, k, i) {
            this.beforeAction();
            var f = this.createCB(k);
            a.setWidth.call(this, h, g, j, f, i);
            if (!g) {
                f()
            }
            return this
        },
        setHeight: function(i, g, k, l, j) {
            this.beforeAction();
            var f = this.createCB(l);
            a.setHeight.call(this, i, g, k, f, j);
            if (!g) {
                f()
            }
            return this
        },
        setBounds: function(n, l, o, g, m, j, k, i) {
            this.beforeAction();
            var f = this.createCB(k);
            if (!m) {
                this.storeXY([n, l]);
                a.setXY.call(this, [n, l]);
                a.setSize.call(this, o, g, m, j, f, i);
                f()
            } else {
                a.setBounds.call(this, n, l, o, g, m, j, f, i)
            }
            return this
        },
        setZIndex: function(c) {
            this.zindex = c;
            this.setStyle("z-index", c + 2);
            if (this.shadow) {
                this.shadow.setZIndex(c + 1)
            }
            if (this.shim) {
                this.shim.setStyle("z-index", c)
            }
            return this
        }
    })
})();
Ext.Shadow = function(d) {
    Ext.apply(this, d);
    if (typeof this.mode != "string") {
        this.mode = this.defaultMode
    }
    var e = this.offset,
        c = {
            h: 0
        },
        b = Math.floor(this.offset / 2);
    switch (this.mode.toLowerCase()) {
        case "drop":
            c.w = 0;
            c.l = c.t = e;
            c.t -= 1;
            if (Ext.isIE) {
                c.l -= this.offset + b;
                c.t -= this.offset + b;
                c.w -= b;
                c.h -= b;
                c.t += 1
            }
            break;
        case "sides":
            c.w = (e * 2);
            c.l = -e;
            c.t = e - 1;
            if (Ext.isIE) {
                c.l -= (this.offset - b);
                c.t -= this.offset + b;
                c.l += 1;
                c.w -= (this.offset - b) * 2;
                c.w -= b + 1;
                c.h -= 1
            }
            break;
        case "frame":
            c.w = c.h = (e * 2);
            c.l = c.t = -e;
            c.t += 1;
            c.h -= 2;
            if (Ext.isIE) {
                c.l -= (this.offset - b);
                c.t -= (this.offset - b);
                c.l += 1;
                c.w -= (this.offset + b + 1);
                c.h -= (this.offset + b);
                c.h += 1
            }
            break
    }
    this.adjusts = c
};
Ext.Shadow.prototype = {
    offset: 4,
    defaultMode: "drop",
    show: function(a) {
        a = Ext.get(a);
        if (!this.el) {
            this.el = Ext.Shadow.Pool.pull();
            if (this.el.dom.nextSibling != a.dom) {
                this.el.insertBefore(a)
            }
        }
        this.el.setStyle("z-index", this.zIndex || parseInt(a.getStyle("z-index"), 10) - 1);
        if (Ext.isIE) {
            this.el.dom.style.filter = "progid:DXImageTransform.Microsoft.alpha(opacity=50) progid:DXImageTransform.Microsoft.Blur(pixelradius=" + (this.offset) + ")"
        }
        this.realign(a.getLeft(true), a.getTop(true), a.getWidth(), a.getHeight());
        this.el.dom.style.display = "block"
    },
    isVisible: function() {
        return this.el ? true : false
    },
    realign: function(b, q, p, f) {
        if (!this.el) {
            return
        }
        var m = this.adjusts,
            j = this.el.dom,
            r = j.style,
            g = 0,
            o = (p + m.w),
            e = (f + m.h),
            i = o + "px",
            n = e + "px",
            k, c;
        r.left = (b + m.l) + "px";
        r.top = (q + m.t) + "px";
        if (r.width != i || r.height != n) {
            r.width = i;
            r.height = n;
            if (!Ext.isIE) {
                k = j.childNodes;
                c = Math.max(0, (o - 12)) + "px";
                k[0].childNodes[1].style.width = c;
                k[1].childNodes[1].style.width = c;
                k[2].childNodes[1].style.width = c;
                k[1].style.height = Math.max(0, (e - 12)) + "px"
            }
        }
    },
    hide: function() {
        if (this.el) {
            this.el.dom.style.display = "none";
            Ext.Shadow.Pool.push(this.el);
            delete this.el
        }
    },
    setZIndex: function(a) {
        this.zIndex = a;
        if (this.el) {
            this.el.setStyle("z-index", a)
        }
    }
};
Ext.Shadow.Pool = function() {
    var b = [],
        a = Ext.isIE ? '<div class="x-ie-shadow"></div>' : '<div class="x-shadow"><div class="xst"><div class="xstl"></div><div class="xstc"></div><div class="xstr"></div></div><div class="xsc"><div class="xsml"></div><div class="xsmc"></div><div class="xsmr"></div></div><div class="xsb"><div class="xsbl"></div><div class="xsbc"></div><div class="xsbr"></div></div></div>';
    return {
        pull: function() {
            var c = b.shift();
            if (!c) {
                c = Ext.get(Ext.DomHelper.insertHtml("beforeBegin", document.body.firstChild, a));
                c.autoBoxAdjust = false
            }
            return c
        },
        push: function(c) {
            b.push(c)
        }
    }
}();
Ext.BoxComponent = Ext.extend(Ext.Component, {
    initComponent: function() {
        Ext.BoxComponent.superclass.initComponent.call(this);
        this.addEvents("resize", "move")
    },
    boxReady: false,
    deferHeight: false,
    setSize: function(b, d) {
        if (typeof b == "object") {
            d = b.height;
            b = b.width
        }
        if (Ext.isDefined(b) && Ext.isDefined(this.boxMinWidth) && (b < this.boxMinWidth)) {
            b = this.boxMinWidth
        }
        if (Ext.isDefined(d) && Ext.isDefined(this.boxMinHeight) && (d < this.boxMinHeight)) {
            d = this.boxMinHeight
        }
        if (Ext.isDefined(b) && Ext.isDefined(this.boxMaxWidth) && (b > this.boxMaxWidth)) {
            b = this.boxMaxWidth
        }
        if (Ext.isDefined(d) && Ext.isDefined(this.boxMaxHeight) && (d > this.boxMaxHeight)) {
            d = this.boxMaxHeight
        }
        if (!this.boxReady) {
            this.width = b;
            this.height = d;
            return this
        }
        if (this.cacheSizes !== false && this.lastSize && this.lastSize.width == b && this.lastSize.height == d) {
            return this
        }
        this.lastSize = {
            width: b,
            height: d
        };
        var c = this.adjustSize(b, d),
            f = c.width,
            a = c.height,
            e;
        if (f !== undefined || a !== undefined) {
            e = this.getResizeEl();
            if (!this.deferHeight && f !== undefined && a !== undefined) {
                e.setSize(f, a)
            } else {
                if (!this.deferHeight && a !== undefined) {
                    e.setHeight(a)
                } else {
                    if (f !== undefined) {
                        e.setWidth(f)
                    }
                }
            }
            this.onResize(f, a, b, d);
            this.fireEvent("resize", this, f, a, b, d)
        }
        return this
    },
    setWidth: function(a) {
        return this.setSize(a)
    },
    setHeight: function(a) {
        return this.setSize(undefined, a)
    },
    getSize: function() {
        return this.getResizeEl().getSize()
    },
    getWidth: function() {
        return this.getResizeEl().getWidth()
    },
    getHeight: function() {
        return this.getResizeEl().getHeight()
    },
    getOuterSize: function() {
        var a = this.getResizeEl();
        return {
            width: a.getWidth() + a.getMargins("lr"),
            height: a.getHeight() + a.getMargins("tb")
        }
    },
    getPosition: function(a) {
        var b = this.getPositionEl();
        if (a === true) {
            return [b.getLeft(true), b.getTop(true)]
        }
        return this.xy || b.getXY()
    },
    getBox: function(a) {
        var c = this.getPosition(a);
        var b = this.getSize();
        b.x = c[0];
        b.y = c[1];
        return b
    },
    updateBox: function(a) {
        this.setSize(a.width, a.height);
        this.setPagePosition(a.x, a.y);
        return this
    },
    getResizeEl: function() {
        return this.resizeEl || this.el
    },
    setAutoScroll: function(a) {
        if (this.rendered) {
            this.getContentTarget().setOverflow(a ? "auto" : "")
        }
        this.autoScroll = a;
        return this
    },
    setPosition: function(a, f) {
        if (a && typeof a[1] == "number") {
            f = a[1];
            a = a[0]
        }
        this.x = a;
        this.y = f;
        if (!this.boxReady) {
            return this
        }
        var b = this.adjustPosition(a, f);
        var e = b.x,
            d = b.y;
        var c = this.getPositionEl();
        if (e !== undefined || d !== undefined) {
            if (e !== undefined && d !== undefined) {
                c.setLeftTop(e, d)
            } else {
                if (e !== undefined) {
                    c.setLeft(e)
                } else {
                    if (d !== undefined) {
                        c.setTop(d)
                    }
                }
            }
            this.onPosition(e, d);
            this.fireEvent("move", this, e, d)
        }
        return this
    },
    setPagePosition: function(a, c) {
        if (a && typeof a[1] == "number") {
            c = a[1];
            a = a[0]
        }
        this.pageX = a;
        this.pageY = c;
        if (!this.boxReady) {
            return
        }
        if (a === undefined || c === undefined) {
            return
        }
        var b = this.getPositionEl().translatePoints(a, c);
        this.setPosition(b.left, b.top);
        return this
    },
    afterRender: function() {
        Ext.BoxComponent.superclass.afterRender.call(this);
        if (this.resizeEl) {
            this.resizeEl = Ext.get(this.resizeEl)
        }
        if (this.positionEl) {
            this.positionEl = Ext.get(this.positionEl)
        }
        this.boxReady = true;
        Ext.isDefined(this.autoScroll) && this.setAutoScroll(this.autoScroll);
        this.setSize(this.width, this.height);
        if (this.x || this.y) {
            this.setPosition(this.x, this.y)
        } else {
            if (this.pageX || this.pageY) {
                this.setPagePosition(this.pageX, this.pageY)
            }
        }
    },
    syncSize: function() {
        delete this.lastSize;
        this.setSize(this.autoWidth ? undefined : this.getResizeEl().getWidth(), this.autoHeight ? undefined : this.getResizeEl().getHeight());
        return this
    },
    onResize: function(d, b, a, c) {},
    onPosition: function(a, b) {},
    adjustSize: function(a, b) {
        if (this.autoWidth) {
            a = "auto"
        }
        if (this.autoHeight) {
            b = "auto"
        }
        return {
            width: a,
            height: b
        }
    },
    adjustPosition: function(a, b) {
        return {
            x: a,
            y: b
        }
    }
});
Ext.reg("box", Ext.BoxComponent);
Ext.Spacer = Ext.extend(Ext.BoxComponent, {
    autoEl: "div"
});
Ext.reg("spacer", Ext.Spacer);
Ext.SplitBar = function(c, e, b, d, a) {
    this.el = Ext.get(c, true);
    this.el.dom.unselectable = "on";
    this.resizingEl = Ext.get(e, true);
    this.orientation = b || Ext.SplitBar.HORIZONTAL;
    this.minSize = 0;
    this.maxSize = 2000;
    this.animate = false;
    this.useShim = false;
    this.shim = null;
    if (!a) {
        this.proxy = Ext.SplitBar.createProxy(this.orientation)
    } else {
        this.proxy = Ext.get(a).dom
    }
    this.dd = new Ext.dd.DDProxy(this.el.dom.id, "XSplitBars", {
        dragElId: this.proxy.id
    });
    this.dd.b4StartDrag = this.onStartProxyDrag.createDelegate(this);
    this.dd.endDrag = this.onEndProxyDrag.createDelegate(this);
    this.dragSpecs = {};
    this.adapter = new Ext.SplitBar.BasicLayoutAdapter();
    this.adapter.init(this);
    if (this.orientation == Ext.SplitBar.HORIZONTAL) {
        this.placement = d || (this.el.getX() > this.resizingEl.getX() ? Ext.SplitBar.LEFT : Ext.SplitBar.RIGHT);
        this.el.addClass("x-splitbar-h")
    } else {
        this.placement = d || (this.el.getY() > this.resizingEl.getY() ? Ext.SplitBar.TOP : Ext.SplitBar.BOTTOM);
        this.el.addClass("x-splitbar-v")
    }
    this.addEvents("resize", "moved", "beforeresize", "beforeapply");
    Ext.SplitBar.superclass.constructor.call(this)
};
Ext.extend(Ext.SplitBar, Ext.util.Observable, {
    onStartProxyDrag: function(a, e) {
        this.fireEvent("beforeresize", this);
        this.overlay = Ext.DomHelper.append(document.body, {
            cls: "x-drag-overlay",
            html: "&#160;"
        }, true);
        this.overlay.unselectable();
        this.overlay.setSize(Ext.lib.Dom.getViewWidth(true), Ext.lib.Dom.getViewHeight(true));
        this.overlay.show();
        Ext.get(this.proxy).setDisplayed("block");
        var c = this.adapter.getElementSize(this);
        this.activeMinSize = this.getMinimumSize();
        this.activeMaxSize = this.getMaximumSize();
        var d = c - this.activeMinSize;
        var b = Math.max(this.activeMaxSize - c, 0);
        if (this.orientation == Ext.SplitBar.HORIZONTAL) {
            this.dd.resetConstraints();
            this.dd.setXConstraint(this.placement == Ext.SplitBar.LEFT ? d : b, this.placement == Ext.SplitBar.LEFT ? b : d, this.tickSize);
            this.dd.setYConstraint(0, 0)
        } else {
            this.dd.resetConstraints();
            this.dd.setXConstraint(0, 0);
            this.dd.setYConstraint(this.placement == Ext.SplitBar.TOP ? d : b, this.placement == Ext.SplitBar.TOP ? b : d, this.tickSize)
        }
        this.dragSpecs.startSize = c;
        this.dragSpecs.startPoint = [a, e];
        Ext.dd.DDProxy.prototype.b4StartDrag.call(this.dd, a, e)
    },
    onEndProxyDrag: function(c) {
        Ext.get(this.proxy).setDisplayed(false);
        var b = Ext.lib.Event.getXY(c);
        if (this.overlay) {
            Ext.destroy(this.overlay);
            delete this.overlay
        }
        var a;
        if (this.orientation == Ext.SplitBar.HORIZONTAL) {
            a = this.dragSpecs.startSize + (this.placement == Ext.SplitBar.LEFT ? b[0] - this.dragSpecs.startPoint[0] : this.dragSpecs.startPoint[0] - b[0])
        } else {
            a = this.dragSpecs.startSize + (this.placement == Ext.SplitBar.TOP ? b[1] - this.dragSpecs.startPoint[1] : this.dragSpecs.startPoint[1] - b[1])
        }
        a = Math.min(Math.max(a, this.activeMinSize), this.activeMaxSize);
        if (a != this.dragSpecs.startSize) {
            if (this.fireEvent("beforeapply", this, a) !== false) {
                this.adapter.setElementSize(this, a);
                this.fireEvent("moved", this, a);
                this.fireEvent("resize", this, a)
            }
        }
    },
    getAdapter: function() {
        return this.adapter
    },
    setAdapter: function(a) {
        this.adapter = a;
        this.adapter.init(this)
    },
    getMinimumSize: function() {
        return this.minSize
    },
    setMinimumSize: function(a) {
        this.minSize = a
    },
    getMaximumSize: function() {
        return this.maxSize
    },
    setMaximumSize: function(a) {
        this.maxSize = a
    },
    setCurrentSize: function(b) {
        var a = this.animate;
        this.animate = false;
        this.adapter.setElementSize(this, b);
        this.animate = a
    },
    destroy: function(a) {
        Ext.destroy(this.shim, Ext.get(this.proxy));
        this.dd.unreg();
        if (a) {
            this.el.remove()
        }
        this.purgeListeners()
    }
});
Ext.SplitBar.createProxy = function(b) {
    var c = new Ext.Element(document.createElement("div"));
    document.body.appendChild(c.dom);
    c.unselectable();
    var a = "x-splitbar-proxy";
    c.addClass(a + " " + (b == Ext.SplitBar.HORIZONTAL ? a + "-h" : a + "-v"));
    return c.dom
};
Ext.SplitBar.BasicLayoutAdapter = function() {};
Ext.SplitBar.BasicLayoutAdapter.prototype = {
    init: function(a) {},
    getElementSize: function(a) {
        if (a.orientation == Ext.SplitBar.HORIZONTAL) {
            return a.resizingEl.getWidth()
        } else {
            return a.resizingEl.getHeight()
        }
    },
    setElementSize: function(b, a, c) {
        if (b.orientation == Ext.SplitBar.HORIZONTAL) {
            if (!b.animate) {
                b.resizingEl.setWidth(a);
                if (c) {
                    c(b, a)
                }
            } else {
                b.resizingEl.setWidth(a, true, 0.1, c, "easeOut")
            }
        } else {
            if (!b.animate) {
                b.resizingEl.setHeight(a);
                if (c) {
                    c(b, a)
                }
            } else {
                b.resizingEl.setHeight(a, true, 0.1, c, "easeOut")
            }
        }
    }
};
Ext.SplitBar.AbsoluteLayoutAdapter = function(a) {
    this.basic = new Ext.SplitBar.BasicLayoutAdapter();
    this.container = Ext.get(a)
};
Ext.SplitBar.AbsoluteLayoutAdapter.prototype = {
    init: function(a) {
        this.basic.init(a)
    },
    getElementSize: function(a) {
        return this.basic.getElementSize(a)
    },
    setElementSize: function(b, a, c) {
        this.basic.setElementSize(b, a, this.moveSplitter.createDelegate(this, [b]))
    },
    moveSplitter: function(a) {
        var b = Ext.SplitBar;
        switch (a.placement) {
            case b.LEFT:
                a.el.setX(a.resizingEl.getRight());
                break;
            case b.RIGHT:
                a.el.setStyle("right", (this.container.getWidth() - a.resizingEl.getLeft()) + "px");
                break;
            case b.TOP:
                a.el.setY(a.resizingEl.getBottom());
                break;
            case b.BOTTOM:
                a.el.setY(a.resizingEl.getTop() - a.el.getHeight());
                break
        }
    }
};
Ext.SplitBar.VERTICAL = 1;
Ext.SplitBar.HORIZONTAL = 2;
Ext.SplitBar.LEFT = 1;
Ext.SplitBar.RIGHT = 2;
Ext.SplitBar.TOP = 3;
Ext.SplitBar.BOTTOM = 4;
Ext.Container = Ext.extend(Ext.BoxComponent, {
    bufferResize: 50,
    autoDestroy: true,
    forceLayout: false,
    defaultType: "panel",
    resizeEvent: "resize",
    bubbleEvents: ["add", "remove"],
    initComponent: function() {
        Ext.Container.superclass.initComponent.call(this);
        this.addEvents("afterlayout", "beforeadd", "beforeremove", "add", "remove");
        var a = this.items;
        if (a) {
            delete this.items;
            this.add(a)
        }
    },
    initItems: function() {
        if (!this.items) {
            this.items = new Ext.util.MixedCollection(false, this.getComponentId);
            this.getLayout()
        }
    },
    setLayout: function(a) {
        if (this.layout && this.layout != a) {
            this.layout.setContainer(null)
        }
        this.layout = a;
        this.initItems();
        a.setContainer(this)
    },
    afterRender: function() {
        Ext.Container.superclass.afterRender.call(this);
        if (!this.layout) {
            this.layout = "auto"
        }
        if (Ext.isObject(this.layout) && !this.layout.layout) {
            this.layoutConfig = this.layout;
            this.layout = this.layoutConfig.type
        }
        if (Ext.isString(this.layout)) {
            this.layout = new Ext.Container.LAYOUTS[this.layout.toLowerCase()](this.layoutConfig)
        }
        this.setLayout(this.layout);
        if (this.activeItem !== undefined && this.layout.setActiveItem) {
            var a = this.activeItem;
            delete this.activeItem;
            this.layout.setActiveItem(a)
        }
        if (!this.ownerCt) {
            this.doLayout(false, true)
        }
        if (this.monitorResize === true) {
            Ext.EventManager.onWindowResize(this.doLayout, this, [false])
        }
    },
    getLayoutTarget: function() {
        return this.el
    },
    getComponentId: function(a) {
        return a.getItemId()
    },
    add: function(b) {
        this.initItems();
        var e = arguments.length > 1;
        if (e || Ext.isArray(b)) {
            var a = [];
            Ext.each(e ? arguments : b, function(g) {
                a.push(this.add(g))
            }, this);
            return a
        }
        var f = this.lookupComponent(this.applyDefaults(b));
        var d = this.items.length;
        if (this.fireEvent("beforeadd", this, f, d) !== false && this.onBeforeAdd(f) !== false) {
            this.items.add(f);
            f.onAdded(this, d);
            this.onAdd(f);
            this.fireEvent("add", this, f, d)
        }
        return f
    },
    onAdd: function(a) {},
    onAdded: function(a, b) {
        this.ownerCt = a;
        this.initRef();
        this.cascade(function(d) {
            d.initRef()
        });
        this.fireEvent("added", this, a, b)
    },
    insert: function(e, b) {
        var d = arguments,
            g = d.length,
            a = [],
            f, h;
        this.initItems();
        if (g > 2) {
            for (f = g - 1; f >= 1; --f) {
                a.push(this.insert(e, d[f]))
            }
            return a
        }
        h = this.lookupComponent(this.applyDefaults(b));
        e = Math.min(e, this.items.length);
        if (this.fireEvent("beforeadd", this, h, e) !== false && this.onBeforeAdd(h) !== false) {
            if (h.ownerCt == this) {
                this.items.remove(h)
            }
            this.items.insert(e, h);
            h.onAdded(this, e);
            this.onAdd(h);
            this.fireEvent("add", this, h, e)
        }
        return h
    },
    applyDefaults: function(b) {
        var a = this.defaults;
        if (a) {
            if (Ext.isFunction(a)) {
                a = a.call(this, b)
            }
            if (Ext.isString(b)) {
                b = Ext.ComponentMgr.get(b);
                Ext.apply(b, a)
            } else {
                if (!b.events) {
                    Ext.applyIf(b.isAction ? b.initialConfig : b, a)
                } else {
                    Ext.apply(b, a)
                }
            }
        }
        return b
    },
    onBeforeAdd: function(a) {
        if (a.ownerCt) {
            a.ownerCt.remove(a, false)
        }
        if (this.hideBorders === true) {
            a.border = (a.border === true)
        }
    },
    remove: function(a, b) {
        this.initItems();
        var d = this.getComponent(a);
        if (d && this.fireEvent("beforeremove", this, d) !== false) {
            this.doRemove(d, b);
            this.fireEvent("remove", this, d)
        }
        return d
    },
    onRemove: function(a) {},
    doRemove: function(e, d) {
        var b = this.layout,
            a = b && this.rendered;
        if (a) {
            b.onRemove(e)
        }
        this.items.remove(e);
        e.onRemoved();
        this.onRemove(e);
        if (d === true || (d !== false && this.autoDestroy)) {
            e.destroy()
        }
        if (a) {
            b.afterRemove(e)
        }
    },
    removeAll: function(c) {
        this.initItems();
        var e, f = [],
            b = [];
        this.items.each(function(g) {
            f.push(g)
        });
        for (var d = 0, a = f.length; d < a; ++d) {
            e = f[d];
            this.remove(e, c);
            if (e.ownerCt !== this) {
                b.push(e)
            }
        }
        return b
    },
    getComponent: function(a) {
        if (Ext.isObject(a)) {
            a = a.getItemId()
        }
        return this.items.get(a)
    },
    lookupComponent: function(a) {
        if (Ext.isString(a)) {
            return Ext.ComponentMgr.get(a)
        } else {
            if (!a.events) {
                return this.createComponent(a)
            }
        }
        return a
    },
    createComponent: function(a, d) {
        if (a.render) {
            return a
        }
        var b = Ext.create(Ext.apply({
            ownerCt: this
        }, a), d || this.defaultType);
        delete b.initialConfig.ownerCt;
        delete b.ownerCt;
        return b
    },
    canLayout: function() {
        var a = this.getVisibilityEl();
        return a && a.dom && !a.isStyle("display", "none")
    },
    doLayout: function(f, e) {
        var j = this.rendered,
            h = e || this.forceLayout;
        if (this.collapsed || !this.canLayout()) {
            this.deferLayout = this.deferLayout || !f;
            if (!h) {
                return
            }
            f = f && !this.deferLayout
        } else {
            delete this.deferLayout
        } if (j && this.layout) {
            this.layout.layout()
        }
        if (f !== true && this.items) {
            var d = this.items.items;
            for (var b = 0, a = d.length; b < a; b++) {
                var g = d[b];
                if (g.doLayout) {
                    g.doLayout(false, h)
                }
            }
        }
        if (j) {
            this.onLayout(f, h)
        }
        this.hasLayout = true;
        delete this.forceLayout
    },
    onLayout: Ext.emptyFn,
    shouldBufferLayout: function() {
        var a = this.hasLayout;
        if (this.ownerCt) {
            return a ? !this.hasLayoutPending() : false
        }
        return a
    },
    hasLayoutPending: function() {
        var a = false;
        this.ownerCt.bubble(function(b) {
            if (b.layoutPending) {
                a = true;
                return false
            }
        });
        return a
    },
    onShow: function() {
        Ext.Container.superclass.onShow.call(this);
        if (Ext.isDefined(this.deferLayout)) {
            delete this.deferLayout;
            this.doLayout(true)
        }
    },
    getLayout: function() {
        if (!this.layout) {
            var a = new Ext.layout.AutoLayout(this.layoutConfig);
            this.setLayout(a)
        }
        return this.layout
    },
    beforeDestroy: function() {
        var a;
        if (this.items) {
            while (a = this.items.first()) {
                this.doRemove(a, true)
            }
        }
        if (this.monitorResize) {
            Ext.EventManager.removeResizeListener(this.doLayout, this)
        }
        Ext.destroy(this.layout);
        Ext.Container.superclass.beforeDestroy.call(this)
    },
    cascade: function(f, e, b) {
        if (f.apply(e || this, b || [this]) !== false) {
            if (this.items) {
                var d = this.items.items;
                for (var c = 0, a = d.length; c < a; c++) {
                    if (d[c].cascade) {
                        d[c].cascade(f, e, b)
                    } else {
                        f.apply(e || d[c], b || [d[c]])
                    }
                }
            }
        }
        return this
    },
    findById: function(c) {
        var a = null,
            b = this;
        this.cascade(function(d) {
            if (b != d && d.id === c) {
                a = d;
                return false
            }
        });
        return a
    },
    findByType: function(b, a) {
        return this.findBy(function(d) {
            return d.isXType(b, a)
        })
    },
    find: function(b, a) {
        return this.findBy(function(d) {
            return d[b] === a
        })
    },
    findBy: function(d, c) {
        var a = [],
            b = this;
        this.cascade(function(e) {
            if (b != e && d.call(c || e, e, b) === true) {
                a.push(e)
            }
        });
        return a
    },
    get: function(a) {
        return this.getComponent(a)
    }
});
Ext.Container.LAYOUTS = {};
Ext.reg("container", Ext.Container);
Ext.layout.ContainerLayout = Ext.extend(Object, {
    monitorResize: false,
    activeItem: null,
    constructor: function(a) {
        this.id = Ext.id(null, "ext-layout-");
        Ext.apply(this, a)
    },
    type: "container",
    IEMeasureHack: function(j, f) {
        var a = j.dom.childNodes,
            b = a.length,
            m, l = [],
            k, g, h;
        for (g = 0; g < b; g++) {
            m = a[g];
            k = Ext.get(m);
            if (k) {
                l[g] = k.getStyle("display");
                k.setStyle({
                    display: "none"
                })
            }
        }
        h = j ? j.getViewSize(f) : {};
        for (g = 0; g < b; g++) {
            m = a[g];
            k = Ext.get(m);
            if (k) {
                k.setStyle({
                    display: l[g]
                })
            }
        }
        return h
    },
    getLayoutTargetSize: Ext.EmptyFn,
    layout: function() {
        var a = this.container,
            b = a.getLayoutTarget();
        if (!(this.hasLayout || Ext.isEmpty(this.targetCls))) {
            b.addClass(this.targetCls)
        }
        this.onLayout(a, b);
        a.fireEvent("afterlayout", a, this)
    },
    onLayout: function(a, b) {
        this.renderAll(a, b)
    },
    isValidParent: function(b, a) {
        return a && b.getPositionEl().dom.parentNode == (a.dom || a)
    },
    renderAll: function(e, f) {
        var b = e.items.items,
            d, g, a = b.length;
        for (d = 0; d < a; d++) {
            g = b[d];
            if (g && (!g.rendered || !this.isValidParent(g, f))) {
                this.renderItem(g, d, f)
            }
        }
    },
    renderItem: function(d, a, b) {
        if (d) {
            if (!d.rendered) {
                d.render(b, a);
                this.configureItem(d)
            } else {
                if (!this.isValidParent(d, b)) {
                    if (Ext.isNumber(a)) {
                        a = b.dom.childNodes[a]
                    }
                    b.dom.insertBefore(d.getPositionEl().dom, a || null);
                    d.container = b;
                    this.configureItem(d)
                }
            }
        }
    },
    getRenderedItems: function(f) {
        var e = f.getLayoutTarget(),
            g = f.items.items,
            a = g.length,
            d, h, b = [];
        for (d = 0; d < a; d++) {
            if ((h = g[d]).rendered && this.isValidParent(h, e) && h.shouldLayout !== false) {
                b.push(h)
            }
        }
        return b
    },
    configureItem: function(b) {
        if (this.extraCls) {
            var a = b.getPositionEl ? b.getPositionEl() : b;
            a.addClass(this.extraCls)
        }
        if (b.doLayout && this.forceLayout) {
            b.doLayout()
        }
        if (this.renderHidden && b != this.activeItem) {
            b.hide()
        }
    },
    onRemove: function(b) {
        if (this.activeItem == b) {
            delete this.activeItem
        }
        if (b.rendered && this.extraCls) {
            var a = b.getPositionEl ? b.getPositionEl() : b;
            a.removeClass(this.extraCls)
        }
    },
    afterRemove: function(a) {
        if (a.removeRestore) {
            a.removeMode = "container";
            delete a.removeRestore
        }
    },
    onResize: function() {
        var c = this.container,
            a;
        if (c.collapsed) {
            return
        }
        if (a = c.bufferResize && c.shouldBufferLayout()) {
            if (!this.resizeTask) {
                this.resizeTask = new Ext.util.DelayedTask(this.runLayout, this);
                this.resizeBuffer = Ext.isNumber(a) ? a : 50
            }
            c.layoutPending = true;
            this.resizeTask.delay(this.resizeBuffer)
        } else {
            this.runLayout()
        }
    },
    runLayout: function() {
        var a = this.container;
        this.layout();
        a.onLayout();
        delete a.layoutPending
    },
    setContainer: function(b) {
        if (this.monitorResize && b != this.container) {
            var a = this.container;
            if (a) {
                a.un(a.resizeEvent, this.onResize, this)
            }
            if (b) {
                b.on(b.resizeEvent, this.onResize, this)
            }
        }
        this.container = b
    },
    parseMargins: function(b) {
        if (Ext.isNumber(b)) {
            b = b.toString()
        }
        var c = b.split(" "),
            a = c.length;
        if (a == 1) {
            c[1] = c[2] = c[3] = c[0]
        } else {
            if (a == 2) {
                c[2] = c[0];
                c[3] = c[1]
            } else {
                if (a == 3) {
                    c[3] = c[1]
                }
            }
        }
        return {
            top: parseInt(c[0], 10) || 0,
            right: parseInt(c[1], 10) || 0,
            bottom: parseInt(c[2], 10) || 0,
            left: parseInt(c[3], 10) || 0
        }
    },
    fieldTpl: (function() {
        var a = new Ext.Template('<div class="x-form-item {itemCls}" tabIndex="-1">', '<label for="{id}" style="{labelStyle}" class="x-form-item-label">{label}{labelSeparator}</label>', '<div class="x-form-element" id="x-form-el-{id}" style="{elementStyle}">', '</div><div class="{clearCls}"></div>', "</div>");
        a.disableFormats = true;
        return a.compile()
    })(),
    destroy: function() {
        if (this.resizeTask && this.resizeTask.cancel) {
            this.resizeTask.cancel()
        }
        if (this.container) {
            this.container.un(this.container.resizeEvent, this.onResize, this)
        }
        if (!Ext.isEmpty(this.targetCls)) {
            var a = this.container.getLayoutTarget();
            if (a) {
                a.removeClass(this.targetCls)
            }
        }
    }
});
Ext.layout.AutoLayout = Ext.extend(Ext.layout.ContainerLayout, {
    type: "auto",
    monitorResize: true,
    onLayout: function(d, f) {
        Ext.layout.AutoLayout.superclass.onLayout.call(this, d, f);
        var e = this.getRenderedItems(d),
            a = e.length,
            b, g;
        for (b = 0; b < a; b++) {
            g = e[b];
            if (g.doLayout) {
                g.doLayout(true)
            }
        }
    }
});
Ext.Container.LAYOUTS.auto = Ext.layout.AutoLayout;
Ext.layout.FitLayout = Ext.extend(Ext.layout.ContainerLayout, {
    monitorResize: true,
    type: "fit",
    getLayoutTargetSize: function() {
        var a = this.container.getLayoutTarget();
        if (!a) {
            return {}
        }
        return a.getStyleSize()
    },
    onLayout: function(a, b) {
        Ext.layout.FitLayout.superclass.onLayout.call(this, a, b);
        if (!a.collapsed) {
            this.setItemSize(this.activeItem || a.items.itemAt(0), this.getLayoutTargetSize())
        }
    },
    setItemSize: function(b, a) {
        if (b && a.height > 0) {
            b.setSize(a)
        }
    }
});
Ext.Container.LAYOUTS.fit = Ext.layout.FitLayout;
Ext.layout.CardLayout = Ext.extend(Ext.layout.FitLayout, {
    deferredRender: false,
    layoutOnCardChange: false,
    renderHidden: true,
    type: "card",
    setActiveItem: function(d) {
        var a = this.activeItem,
            b = this.container;
        d = b.getComponent(d);
        if (d && a != d) {
            if (a) {
                a.hide();
                if (a.hidden !== true) {
                    return false
                }
                a.fireEvent("deactivate", a)
            }
            var c = d.doLayout && (this.layoutOnCardChange || !d.rendered);
            this.activeItem = d;
            delete d.deferLayout;
            d.show();
            this.layout();
            if (c) {
                d.doLayout()
            }
            d.fireEvent("activate", d)
        }
    },
    renderAll: function(a, b) {
        if (this.deferredRender) {
            this.renderItem(this.activeItem, undefined, b)
        } else {
            Ext.layout.CardLayout.superclass.renderAll.call(this, a, b)
        }
    }
});
Ext.Container.LAYOUTS.card = Ext.layout.CardLayout;
Ext.layout.AnchorLayout = Ext.extend(Ext.layout.ContainerLayout, {
    monitorResize: true,
    type: "anchor",
    defaultAnchor: "100%",
    parseAnchorRE: /^(r|right|b|bottom)$/i,
    getLayoutTargetSize: function() {
        var b = this.container.getLayoutTarget(),
            a = {};
        if (b) {
            a = b.getViewSize();
            if (Ext.isIE && Ext.isStrict && a.width == 0) {
                a = b.getStyleSize()
            }
            a.width -= b.getPadding("lr");
            a.height -= b.getPadding("tb")
        }
        return a
    },
    onLayout: function(l, v) {
        Ext.layout.AnchorLayout.superclass.onLayout.call(this, l, v);
        var o = this.getLayoutTargetSize(),
            j = o.width,
            n = o.height,
            p = v.getStyle("overflow"),
            m = this.getRenderedItems(l),
            s = m.length,
            f = [],
            h, a, u, k, g, c, e, d, t = 0,
            r, b;
        if (j < 20 && n < 20) {
            return
        }
        if (l.anchorSize) {
            if (typeof l.anchorSize == "number") {
                a = l.anchorSize
            } else {
                a = l.anchorSize.width;
                u = l.anchorSize.height
            }
        } else {
            a = l.initialConfig.width;
            u = l.initialConfig.height
        }
        for (r = 0; r < s; r++) {
            k = m[r];
            b = k.getPositionEl();
            if (!k.anchor && k.items && !Ext.isNumber(k.width) && !(Ext.isIE6 && Ext.isStrict)) {
                k.anchor = this.defaultAnchor
            }
            if (k.anchor) {
                g = k.anchorSpec;
                if (!g) {
                    d = k.anchor.split(" ");
                    k.anchorSpec = g = {
                        right: this.parseAnchor(d[0], k.initialConfig.width, a),
                        bottom: this.parseAnchor(d[1], k.initialConfig.height, u)
                    }
                }
                c = g.right ? this.adjustWidthAnchor(g.right(j) - b.getMargins("lr"), k) : undefined;
                e = g.bottom ? this.adjustHeightAnchor(g.bottom(n) - b.getMargins("tb"), k) : undefined;
                if (c || e) {
                    f.push({
                        component: k,
                        width: c || undefined,
                        height: e || undefined
                    })
                }
            }
        }
        for (r = 0, s = f.length; r < s; r++) {
            h = f[r];
            h.component.setSize(h.width, h.height)
        }
        if (p && p != "hidden" && !this.adjustmentPass) {
            var q = this.getLayoutTargetSize();
            if (q.width != o.width || q.height != o.height) {
                this.adjustmentPass = true;
                this.onLayout(l, v)
            }
        }
        delete this.adjustmentPass
    },
    parseAnchor: function(c, g, b) {
        if (c && c != "none") {
            var e;
            if (this.parseAnchorRE.test(c)) {
                var f = b - g;
                return function(a) {
                    if (a !== e) {
                        e = a;
                        return a - f
                    }
                }
            } else {
                if (c.indexOf("%") != -1) {
                    var d = parseFloat(c.replace("%", "")) * 0.01;
                    return function(a) {
                        if (a !== e) {
                            e = a;
                            return Math.floor(a * d)
                        }
                    }
                } else {
                    c = parseInt(c, 10);
                    if (!isNaN(c)) {
                        return function(a) {
                            if (a !== e) {
                                e = a;
                                return a + c
                            }
                        }
                    }
                }
            }
        }
        return false
    },
    adjustWidthAnchor: function(b, a) {
        return b
    },
    adjustHeightAnchor: function(b, a) {
        return b
    }
});
Ext.Container.LAYOUTS.anchor = Ext.layout.AnchorLayout;
Ext.layout.ColumnLayout = Ext.extend(Ext.layout.ContainerLayout, {
    monitorResize: true,
    type: "column",
    extraCls: "x-column",
    scrollOffset: 0,
    targetCls: "x-column-layout-ct",
    isValidParent: function(b, a) {
        return this.innerCt && b.getPositionEl().dom.parentNode == this.innerCt.dom
    },
    getLayoutTargetSize: function() {
        var b = this.container.getLayoutTarget(),
            a;
        if (b) {
            a = b.getViewSize();
            if (Ext.isIE && Ext.isStrict && a.width == 0) {
                a = b.getStyleSize()
            }
            a.width -= b.getPadding("lr");
            a.height -= b.getPadding("tb")
        }
        return a
    },
    renderAll: function(a, b) {
        if (!this.innerCt) {
            this.innerCt = b.createChild({
                cls: "x-column-inner"
            });
            this.innerCt.createChild({
                cls: "x-clear"
            })
        }
        Ext.layout.ColumnLayout.superclass.renderAll.call(this, a, this.innerCt)
    },
    onLayout: function(e, j) {
        var f = e.items.items,
            g = f.length,
            l, b, a, n = [];
        this.renderAll(e, j);
        var q = this.getLayoutTargetSize();
        if (q.width < 1 && q.height < 1) {
            return
        }
        var o = q.width - this.scrollOffset,
            d = q.height,
            p = o;
        this.innerCt.setWidth(o);
        for (b = 0; b < g; b++) {
            l = f[b];
            a = l.getPositionEl().getMargins("lr");
            n[b] = a;
            if (!l.columnWidth) {
                p -= (l.getWidth() + a)
            }
        }
        p = p < 0 ? 0 : p;
        for (b = 0; b < g; b++) {
            l = f[b];
            a = n[b];
            if (l.columnWidth) {
                l.setSize(Math.floor(l.columnWidth * p) - a)
            }
        }
        if (Ext.isIE) {
            if (b = j.getStyle("overflow") && b != "hidden" && !this.adjustmentPass) {
                var k = this.getLayoutTargetSize();
                if (k.width != q.width) {
                    this.adjustmentPass = true;
                    this.onLayout(e, j)
                }
            }
        }
        delete this.adjustmentPass
    }
});
Ext.Container.LAYOUTS.column = Ext.layout.ColumnLayout;
Ext.layout.BorderLayout = Ext.extend(Ext.layout.ContainerLayout, {
    monitorResize: true,
    rendered: false,
    type: "border",
    targetCls: "x-border-layout-ct",
    getLayoutTargetSize: function() {
        var a = this.container.getLayoutTarget();
        return a ? a.getViewSize() : {}
    },
    onLayout: function(f, H) {
        var g, A, E, l, v = f.items.items,
            B = v.length;
        if (!this.rendered) {
            g = [];
            for (A = 0; A < B; A++) {
                E = v[A];
                l = E.region;
                if (E.collapsed) {
                    g.push(E)
                }
                E.collapsed = false;
                if (!E.rendered) {
                    E.render(H, A);
                    E.getPositionEl().addClass("x-border-panel")
                }
                this[l] = l != "center" && E.split ? new Ext.layout.BorderLayout.SplitRegion(this, E.initialConfig, l) : new Ext.layout.BorderLayout.Region(this, E.initialConfig, l);
                this[l].render(H, E)
            }
            this.rendered = true
        }
        var u = this.getLayoutTargetSize();
        if (u.width < 20 || u.height < 20) {
            if (g) {
                this.restoreCollapsed = g
            }
            return
        } else {
            if (this.restoreCollapsed) {
                g = this.restoreCollapsed;
                delete this.restoreCollapsed
            }
        }
        var r = u.width,
            C = u.height,
            q = r,
            z = C,
            o = 0,
            p = 0,
            x = this.north,
            t = this.south,
            k = this.west,
            D = this.east,
            E = this.center,
            G, y, d, F;
        if (!E && Ext.layout.BorderLayout.WARN !== false) {
            throw "No center region defined in BorderLayout " + f.id
        }
        if (x && x.isVisible()) {
            G = x.getSize();
            y = x.getMargins();
            G.width = r - (y.left + y.right);
            G.x = y.left;
            G.y = y.top;
            o = G.height + G.y + y.bottom;
            z -= o;
            x.applyLayout(G)
        }
        if (t && t.isVisible()) {
            G = t.getSize();
            y = t.getMargins();
            G.width = r - (y.left + y.right);
            G.x = y.left;
            F = (G.height + y.top + y.bottom);
            G.y = C - F + y.top;
            z -= F;
            t.applyLayout(G)
        }
        if (k && k.isVisible()) {
            G = k.getSize();
            y = k.getMargins();
            G.height = z - (y.top + y.bottom);
            G.x = y.left;
            G.y = o + y.top;
            d = (G.width + y.left + y.right);
            p += d;
            q -= d;
            k.applyLayout(G)
        }
        if (D && D.isVisible()) {
            G = D.getSize();
            y = D.getMargins();
            G.height = z - (y.top + y.bottom);
            d = (G.width + y.left + y.right);
            G.x = r - d + y.left;
            G.y = o + y.top;
            q -= d;
            D.applyLayout(G)
        }
        if (E) {
            y = E.getMargins();
            var j = {
                x: p + y.left,
                y: o + y.top,
                width: q - (y.left + y.right),
                height: z - (y.top + y.bottom)
            };
            E.applyLayout(j)
        }
        if (g) {
            for (A = 0, B = g.length; A < B; A++) {
                g[A].collapse(false)
            }
        }
        if (Ext.isIE && Ext.isStrict) {
            H.repaint()
        }
        if (A = H.getStyle("overflow") && A != "hidden" && !this.adjustmentPass) {
            var a = this.getLayoutTargetSize();
            if (a.width != u.width || a.height != u.height) {
                this.adjustmentPass = true;
                this.onLayout(f, H)
            }
        }
        delete this.adjustmentPass
    },
    destroy: function() {
        var b = ["north", "south", "east", "west"],
            a, c;
        for (a = 0; a < b.length; a++) {
            c = this[b[a]];
            if (c) {
                if (c.destroy) {
                    c.destroy()
                } else {
                    if (c.split) {
                        c.split.destroy(true)
                    }
                }
            }
        }
        Ext.layout.BorderLayout.superclass.destroy.call(this)
    }
});
Ext.layout.BorderLayout.Region = function(b, a, c) {
    Ext.apply(this, a);
    this.layout = b;
    this.position = c;
    this.state = {};
    if (typeof this.margins == "string") {
        this.margins = this.layout.parseMargins(this.margins)
    }
    this.margins = Ext.applyIf(this.margins || {}, this.defaultMargins);
    if (this.collapsible) {
        if (typeof this.cmargins == "string") {
            this.cmargins = this.layout.parseMargins(this.cmargins)
        }
        if (this.collapseMode == "mini" && !this.cmargins) {
            this.cmargins = {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }
        } else {
            this.cmargins = Ext.applyIf(this.cmargins || {}, c == "north" || c == "south" ? this.defaultNSCMargins : this.defaultEWCMargins)
        }
    }
};
Ext.layout.BorderLayout.Region.prototype = {
    collapsible: false,
    split: false,
    floatable: true,
    minWidth: 50,
    minHeight: 50,
    defaultMargins: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    },
    defaultNSCMargins: {
        left: 5,
        top: 5,
        right: 5,
        bottom: 5
    },
    defaultEWCMargins: {
        left: 5,
        top: 0,
        right: 5,
        bottom: 0
    },
    floatingZIndex: 100,
    isCollapsed: false,
    render: function(b, c) {
        this.panel = c;
        c.el.enableDisplayMode();
        this.targetEl = b;
        this.el = c.el;
        var a = c.getState,
            d = this.position;
        c.getState = function() {
            return Ext.apply(a.call(c) || {}, this.state)
        }.createDelegate(this);
        if (d != "center") {
            c.allowQueuedExpand = false;
            c.on({
                beforecollapse: this.beforeCollapse,
                collapse: this.onCollapse,
                beforeexpand: this.beforeExpand,
                expand: this.onExpand,
                hide: this.onHide,
                show: this.onShow,
                scope: this
            });
            if (this.collapsible || this.floatable) {
                c.collapseEl = "el";
                c.slideAnchor = this.getSlideAnchor()
            }
            if (c.tools && c.tools.toggle) {
                c.tools.toggle.addClass("x-tool-collapse-" + d);
                c.tools.toggle.addClassOnOver("x-tool-collapse-" + d + "-over")
            }
        }
    },
    getCollapsedEl: function() {
        if (!this.collapsedEl) {
            if (!this.toolTemplate) {
                var b = new Ext.Template('<div class="x-tool x-tool-{id}">&#160;</div>');
                b.disableFormats = true;
                b.compile();
                Ext.layout.BorderLayout.Region.prototype.toolTemplate = b
            }
            this.collapsedEl = this.targetEl.createChild({
                cls: "x-layout-collapsed x-layout-collapsed-" + this.position,
                id: this.panel.id + "-xcollapsed"
            });
            this.collapsedEl.enableDisplayMode("block");
            if (this.collapseMode == "mini") {
                this.collapsedEl.addClass("x-layout-cmini-" + this.position);
                this.miniCollapsedEl = this.collapsedEl.createChild({
                    cls: "x-layout-mini x-layout-mini-" + this.position,
                    html: "&#160;"
                });
                this.miniCollapsedEl.addClassOnOver("x-layout-mini-over");
                this.collapsedEl.addClassOnOver("x-layout-collapsed-over");
                this.collapsedEl.on("click", this.onExpandClick, this, {
                    stopEvent: true
                })
            } else {
                if (this.collapsible !== false && !this.hideCollapseTool) {
                    var a = this.expandToolEl = this.toolTemplate.append(this.collapsedEl.dom, {
                        id: "expand-" + this.position
                    }, true);
                    a.addClassOnOver("x-tool-expand-" + this.position + "-over");
                    a.on("click", this.onExpandClick, this, {
                        stopEvent: true
                    })
                }
                if (this.floatable !== false || this.titleCollapse) {
                    this.collapsedEl.addClassOnOver("x-layout-collapsed-over");
                    this.collapsedEl.on("click", this[this.floatable ? "collapseClick" : "onExpandClick"], this)
                }
            }
        }
        return this.collapsedEl
    },
    onExpandClick: function(a) {
        if (this.isSlid) {
            this.panel.expand(false)
        } else {
            this.panel.expand()
        }
    },
    onCollapseClick: function(a) {
        this.panel.collapse()
    },
    beforeCollapse: function(c, a) {
        this.lastAnim = a;
        if (this.splitEl) {
            this.splitEl.hide()
        }
        this.getCollapsedEl().show();
        var b = this.panel.getEl();
        this.originalZIndex = b.getStyle("z-index");
        b.setStyle("z-index", 100);
        this.isCollapsed = true;
        this.layout.layout()
    },
    onCollapse: function(a) {
        this.panel.el.setStyle("z-index", 1);
        if (this.lastAnim === false || this.panel.animCollapse === false) {
            this.getCollapsedEl().dom.style.visibility = "visible"
        } else {
            this.getCollapsedEl().slideIn(this.panel.slideAnchor, {
                duration: 0.2
            })
        }
        this.state.collapsed = true;
        this.panel.saveState()
    },
    beforeExpand: function(a) {
        if (this.isSlid) {
            this.afterSlideIn()
        }
        var b = this.getCollapsedEl();
        this.el.show();
        if (this.position == "east" || this.position == "west") {
            this.panel.setSize(undefined, b.getHeight())
        } else {
            this.panel.setSize(b.getWidth(), undefined)
        }
        b.hide();
        b.dom.style.visibility = "hidden";
        this.panel.el.setStyle("z-index", this.floatingZIndex)
    },
    onExpand: function() {
        this.isCollapsed = false;
        if (this.splitEl) {
            this.splitEl.show()
        }
        this.layout.layout();
        this.panel.el.setStyle("z-index", this.originalZIndex);
        this.state.collapsed = false;
        this.panel.saveState()
    },
    collapseClick: function(a) {
        if (this.isSlid) {
            a.stopPropagation();
            this.slideIn()
        } else {
            a.stopPropagation();
            this.slideOut()
        }
    },
    onHide: function() {
        if (this.isCollapsed) {
            this.getCollapsedEl().hide()
        } else {
            if (this.splitEl) {
                this.splitEl.hide()
            }
        }
    },
    onShow: function() {
        if (this.isCollapsed) {
            this.getCollapsedEl().show()
        } else {
            if (this.splitEl) {
                this.splitEl.show()
            }
        }
    },
    isVisible: function() {
        return !this.panel.hidden
    },
    getMargins: function() {
        return this.isCollapsed && this.cmargins ? this.cmargins : this.margins
    },
    getSize: function() {
        return this.isCollapsed ? this.getCollapsedEl().getSize() : this.panel.getSize()
    },
    setPanel: function(a) {
        this.panel = a
    },
    getMinWidth: function() {
        return this.minWidth
    },
    getMinHeight: function() {
        return this.minHeight
    },
    applyLayoutCollapsed: function(a) {
        var b = this.getCollapsedEl();
        b.setLeftTop(a.x, a.y);
        b.setSize(a.width, a.height)
    },
    applyLayout: function(a) {
        if (this.isCollapsed) {
            this.applyLayoutCollapsed(a)
        } else {
            this.panel.setPosition(a.x, a.y);
            this.panel.setSize(a.width, a.height)
        }
    },
    beforeSlide: function() {
        this.panel.beforeEffect()
    },
    afterSlide: function() {
        this.panel.afterEffect()
    },
    initAutoHide: function() {
        if (this.autoHide !== false) {
            if (!this.autoHideHd) {
                this.autoHideSlideTask = new Ext.util.DelayedTask(this.slideIn, this);
                this.autoHideHd = {
                    mouseout: function(a) {
                        if (!a.within(this.el, true)) {
                            this.autoHideSlideTask.delay(500)
                        }
                    },
                    mouseover: function(a) {
                        this.autoHideSlideTask.cancel()
                    },
                    scope: this
                }
            }
            this.el.on(this.autoHideHd);
            this.collapsedEl.on(this.autoHideHd)
        }
    },
    clearAutoHide: function() {
        if (this.autoHide !== false) {
            this.el.un("mouseout", this.autoHideHd.mouseout);
            this.el.un("mouseover", this.autoHideHd.mouseover);
            this.collapsedEl.un("mouseout", this.autoHideHd.mouseout);
            this.collapsedEl.un("mouseover", this.autoHideHd.mouseover)
        }
    },
    clearMonitor: function() {
        Ext.getDoc().un("click", this.slideInIf, this)
    },
    slideOut: function() {
        if (this.isSlid || this.el.hasActiveFx()) {
            return
        }
        this.isSlid = true;
        var b = this.panel.tools,
            c, a;
        if (b && b.toggle) {
            b.toggle.hide()
        }
        this.el.show();
        a = this.panel.collapsed;
        this.panel.collapsed = false;
        if (this.position == "east" || this.position == "west") {
            c = this.panel.deferHeight;
            this.panel.deferHeight = false;
            this.panel.setSize(undefined, this.collapsedEl.getHeight());
            this.panel.deferHeight = c
        } else {
            this.panel.setSize(this.collapsedEl.getWidth(), undefined)
        }
        this.panel.collapsed = a;
        this.restoreLT = [this.el.dom.style.left, this.el.dom.style.top];
        this.el.alignTo(this.collapsedEl, this.getCollapseAnchor());
        this.el.setStyle("z-index", this.floatingZIndex + 2);
        this.panel.el.replaceClass("x-panel-collapsed", "x-panel-floating");
        if (this.animFloat !== false) {
            this.beforeSlide();
            this.el.slideIn(this.getSlideAnchor(), {
                callback: function() {
                    this.afterSlide();
                    this.initAutoHide();
                    Ext.getDoc().on("click", this.slideInIf, this)
                },
                scope: this,
                block: true
            })
        } else {
            this.initAutoHide();
            Ext.getDoc().on("click", this.slideInIf, this)
        }
    },
    afterSlideIn: function() {
        this.clearAutoHide();
        this.isSlid = false;
        this.clearMonitor();
        this.el.setStyle("z-index", "");
        this.panel.el.replaceClass("x-panel-floating", "x-panel-collapsed");
        this.el.dom.style.left = this.restoreLT[0];
        this.el.dom.style.top = this.restoreLT[1];
        var a = this.panel.tools;
        if (a && a.toggle) {
            a.toggle.show()
        }
    },
    slideIn: function(a) {
        if (!this.isSlid || this.el.hasActiveFx()) {
            Ext.callback(a);
            return
        }
        this.isSlid = false;
        if (this.animFloat !== false) {
            this.beforeSlide();
            this.el.slideOut(this.getSlideAnchor(), {
                callback: function() {
                    this.el.hide();
                    this.afterSlide();
                    this.afterSlideIn();
                    Ext.callback(a)
                },
                scope: this,
                block: true
            })
        } else {
            this.el.hide();
            this.afterSlideIn()
        }
    },
    slideInIf: function(a) {
        if (!a.within(this.el)) {
            this.slideIn()
        }
    },
    anchors: {
        west: "left",
        east: "right",
        north: "top",
        south: "bottom"
    },
    sanchors: {
        west: "l",
        east: "r",
        north: "t",
        south: "b"
    },
    canchors: {
        west: "tl-tr",
        east: "tr-tl",
        north: "tl-bl",
        south: "bl-tl"
    },
    getAnchor: function() {
        return this.anchors[this.position]
    },
    getCollapseAnchor: function() {
        return this.canchors[this.position]
    },
    getSlideAnchor: function() {
        return this.sanchors[this.position]
    },
    getAlignAdj: function() {
        var a = this.cmargins;
        switch (this.position) {
            case "west":
                return [0, 0];
                break;
            case "east":
                return [0, 0];
                break;
            case "north":
                return [0, 0];
                break;
            case "south":
                return [0, 0];
                break
        }
    },
    getExpandAdj: function() {
        var b = this.collapsedEl,
            a = this.cmargins;
        switch (this.position) {
            case "west":
                return [-(a.right + b.getWidth() + a.left), 0];
                break;
            case "east":
                return [a.right + b.getWidth() + a.left, 0];
                break;
            case "north":
                return [0, -(a.top + a.bottom + b.getHeight())];
                break;
            case "south":
                return [0, a.top + a.bottom + b.getHeight()];
                break
        }
    },
    destroy: function() {
        if (this.autoHideSlideTask && this.autoHideSlideTask.cancel) {
            this.autoHideSlideTask.cancel()
        }
        Ext.destroyMembers(this, "miniCollapsedEl", "collapsedEl", "expandToolEl")
    }
};
Ext.layout.BorderLayout.SplitRegion = function(b, a, c) {
    Ext.layout.BorderLayout.SplitRegion.superclass.constructor.call(this, b, a, c);
    this.applyLayout = this.applyFns[c]
};
Ext.extend(Ext.layout.BorderLayout.SplitRegion, Ext.layout.BorderLayout.Region, {
    splitTip: "Drag to resize.",
    collapsibleSplitTip: "Drag to resize. Double click to hide.",
    useSplitTips: false,
    splitSettings: {
        north: {
            orientation: Ext.SplitBar.VERTICAL,
            placement: Ext.SplitBar.TOP,
            maxFn: "getVMaxSize",
            minProp: "minHeight",
            maxProp: "maxHeight"
        },
        south: {
            orientation: Ext.SplitBar.VERTICAL,
            placement: Ext.SplitBar.BOTTOM,
            maxFn: "getVMaxSize",
            minProp: "minHeight",
            maxProp: "maxHeight"
        },
        east: {
            orientation: Ext.SplitBar.HORIZONTAL,
            placement: Ext.SplitBar.RIGHT,
            maxFn: "getHMaxSize",
            minProp: "minWidth",
            maxProp: "maxWidth"
        },
        west: {
            orientation: Ext.SplitBar.HORIZONTAL,
            placement: Ext.SplitBar.LEFT,
            maxFn: "getHMaxSize",
            minProp: "minWidth",
            maxProp: "maxWidth"
        }
    },
    applyFns: {
        west: function(c) {
            if (this.isCollapsed) {
                return this.applyLayoutCollapsed(c)
            }
            var d = this.splitEl.dom,
                b = d.style;
            this.panel.setPosition(c.x, c.y);
            var a = d.offsetWidth;
            b.left = (c.x + c.width - a) + "px";
            b.top = (c.y) + "px";
            b.height = Math.max(0, c.height) + "px";
            this.panel.setSize(c.width - a, c.height)
        },
        east: function(c) {
            if (this.isCollapsed) {
                return this.applyLayoutCollapsed(c)
            }
            var d = this.splitEl.dom,
                b = d.style;
            var a = d.offsetWidth;
            this.panel.setPosition(c.x + a, c.y);
            b.left = (c.x) + "px";
            b.top = (c.y) + "px";
            b.height = Math.max(0, c.height) + "px";
            this.panel.setSize(c.width - a, c.height)
        },
        north: function(c) {
            if (this.isCollapsed) {
                return this.applyLayoutCollapsed(c)
            }
            var d = this.splitEl.dom,
                b = d.style;
            var a = d.offsetHeight;
            this.panel.setPosition(c.x, c.y);
            b.left = (c.x) + "px";
            b.top = (c.y + c.height - a) + "px";
            b.width = Math.max(0, c.width) + "px";
            this.panel.setSize(c.width, c.height - a)
        },
        south: function(c) {
            if (this.isCollapsed) {
                return this.applyLayoutCollapsed(c)
            }
            var d = this.splitEl.dom,
                b = d.style;
            var a = d.offsetHeight;
            this.panel.setPosition(c.x, c.y + a);
            b.left = (c.x) + "px";
            b.top = (c.y) + "px";
            b.width = Math.max(0, c.width) + "px";
            this.panel.setSize(c.width, c.height - a)
        }
    },
    render: function(a, c) {
        Ext.layout.BorderLayout.SplitRegion.superclass.render.call(this, a, c);
        var d = this.position;
        this.splitEl = a.createChild({
            cls: "x-layout-split x-layout-split-" + d,
            html: "&#160;",
            id: this.panel.id + "-xsplit"
        });
        if (this.collapseMode == "mini") {
            this.miniSplitEl = this.splitEl.createChild({
                cls: "x-layout-mini x-layout-mini-" + d,
                html: "&#160;"
            });
            this.miniSplitEl.addClassOnOver("x-layout-mini-over");
            this.miniSplitEl.on("click", this.onCollapseClick, this, {
                stopEvent: true
            })
        }
        var b = this.splitSettings[d];
        this.split = new Ext.SplitBar(this.splitEl.dom, c.el, b.orientation);
        this.split.tickSize = this.tickSize;
        this.split.placement = b.placement;
        this.split.getMaximumSize = this[b.maxFn].createDelegate(this);
        this.split.minSize = this.minSize || this[b.minProp];
        this.split.on("beforeapply", this.onSplitMove, this);
        this.split.useShim = this.useShim === true;
        this.maxSize = this.maxSize || this[b.maxProp];
        if (c.hidden) {
            this.splitEl.hide()
        }
        if (this.useSplitTips) {
            this.splitEl.dom.title = this.collapsible ? this.collapsibleSplitTip : this.splitTip
        }
        if (this.collapsible) {
            this.splitEl.on("dblclick", this.onCollapseClick, this)
        }
    },
    getSize: function() {
        if (this.isCollapsed) {
            return this.collapsedEl.getSize()
        }
        var a = this.panel.getSize();
        if (this.position == "north" || this.position == "south") {
            a.height += this.splitEl.dom.offsetHeight
        } else {
            a.width += this.splitEl.dom.offsetWidth
        }
        return a
    },
    getHMaxSize: function() {
        var b = this.maxSize || 10000;
        var a = this.layout.center;
        return Math.min(b, (this.el.getWidth() + a.el.getWidth()) - a.getMinWidth())
    },
    getVMaxSize: function() {
        var b = this.maxSize || 10000;
        var a = this.layout.center;
        return Math.min(b, (this.el.getHeight() + a.el.getHeight()) - a.getMinHeight())
    },
    onSplitMove: function(b, a) {
        var c = this.panel.getSize();
        this.lastSplitSize = a;
        if (this.position == "north" || this.position == "south") {
            this.panel.setSize(c.width, a);
            this.state.height = a
        } else {
            this.panel.setSize(a, c.height);
            this.state.width = a
        }
        this.layout.layout();
        this.panel.saveState();
        return false
    },
    getSplitBar: function() {
        return this.split
    },
    destroy: function() {
        Ext.destroy(this.miniSplitEl, this.split, this.splitEl);
        Ext.layout.BorderLayout.SplitRegion.superclass.destroy.call(this)
    }
});
Ext.Container.LAYOUTS.border = Ext.layout.BorderLayout;
Ext.layout.FormLayout = Ext.extend(Ext.layout.AnchorLayout, {
    labelSeparator: ":",
    trackLabels: true,
    type: "form",
    onRemove: function(d) {
        Ext.layout.FormLayout.superclass.onRemove.call(this, d);
        if (this.trackLabels) {
            d.un("show", this.onFieldShow, this);
            d.un("hide", this.onFieldHide, this)
        }
        var b = d.getPositionEl(),
            a = d.getItemCt && d.getItemCt();
        if (d.rendered && a) {
            if (b && b.dom) {
                b.insertAfter(a)
            }
            Ext.destroy(a);
            Ext.destroyMembers(d, "label", "itemCt");
            if (d.customItemCt) {
                Ext.destroyMembers(d, "getItemCt", "customItemCt")
            }
        }
    },
    setContainer: function(a) {
        Ext.layout.FormLayout.superclass.setContainer.call(this, a);
        if (a.labelAlign) {
            a.addClass("x-form-label-" + a.labelAlign)
        }
        if (a.hideLabels) {
            Ext.apply(this, {
                labelStyle: "display:none",
                elementStyle: "padding-left:0;",
                labelAdjust: 0
            })
        } else {
            this.labelSeparator = Ext.isDefined(a.labelSeparator) ? a.labelSeparator : this.labelSeparator;
            a.labelWidth = a.labelWidth || 100;
            if (Ext.isNumber(a.labelWidth)) {
                var b = Ext.isNumber(a.labelPad) ? a.labelPad : 5;
                Ext.apply(this, {
                    labelAdjust: a.labelWidth + b,
                    labelStyle: "width:" + a.labelWidth + "px;",
                    elementStyle: "padding-left:" + (a.labelWidth + b) + "px"
                })
            }
            if (a.labelAlign == "top") {
                Ext.apply(this, {
                    labelStyle: "width:auto;",
                    labelAdjust: 0,
                    elementStyle: "padding-left:0;"
                })
            }
        }
    },
    isHide: function(a) {
        return a.hideLabel || this.container.hideLabels
    },
    onFieldShow: function(a) {
        a.getItemCt().removeClass("x-hide-" + a.hideMode);
        if (a.isComposite) {
            a.doLayout()
        }
    },
    onFieldHide: function(a) {
        a.getItemCt().addClass("x-hide-" + a.hideMode)
    },
    getLabelStyle: function(e) {
        var b = "",
            c = [this.labelStyle, e];
        for (var d = 0, a = c.length; d < a; ++d) {
            if (c[d]) {
                b += c[d];
                if (b.substr(-1, 1) != ";") {
                    b += ";"
                }
            }
        }
        return b
    },
    renderItem: function(e, a, d) {
        if (e && (e.isFormField || e.fieldLabel) && e.inputType != "hidden") {
            var b = this.getTemplateArgs(e);
            if (Ext.isNumber(a)) {
                a = d.dom.childNodes[a] || null
            }
            if (a) {
                e.itemCt = this.fieldTpl.insertBefore(a, b, true)
            } else {
                e.itemCt = this.fieldTpl.append(d, b, true)
            } if (!e.getItemCt) {
                Ext.apply(e, {
                    getItemCt: function() {
                        return e.itemCt
                    },
                    customItemCt: true
                })
            }
            e.label = e.getItemCt().child("label.x-form-item-label");
            if (!e.rendered) {
                e.render("x-form-el-" + e.id)
            } else {
                if (!this.isValidParent(e, d)) {
                    Ext.fly("x-form-el-" + e.id).appendChild(e.getPositionEl())
                }
            } if (this.trackLabels) {
                if (e.hidden) {
                    this.onFieldHide(e)
                }
                e.on({
                    scope: this,
                    show: this.onFieldShow,
                    hide: this.onFieldHide
                })
            }
            this.configureItem(e)
        } else {
            Ext.layout.FormLayout.superclass.renderItem.apply(this, arguments)
        }
    },
    getTemplateArgs: function(b) {
        var a = !b.fieldLabel || b.hideLabel;
        return {
            id: b.id,
            label: b.fieldLabel,
            itemCls: (b.itemCls || this.container.itemCls || "") + (b.hideLabel ? " x-hide-label" : ""),
            clearCls: b.clearCls || "x-form-clear-left",
            labelStyle: this.getLabelStyle(b.labelStyle),
            elementStyle: this.elementStyle || "",
            labelSeparator: a ? "" : (Ext.isDefined(b.labelSeparator) ? b.labelSeparator : this.labelSeparator)
        }
    },
    adjustWidthAnchor: function(a, d) {
        if (d.label && !this.isHide(d) && (this.container.labelAlign != "top")) {
            var b = Ext.isIE6 || (Ext.isIE && !Ext.isStrict);
            return a - this.labelAdjust + (b ? -3 : 0)
        }
        return a
    },
    adjustHeightAnchor: function(a, b) {
        if (b.label && !this.isHide(b) && (this.container.labelAlign == "top")) {
            return a - b.label.getHeight()
        }
        return a
    },
    isValidParent: function(b, a) {
        return a && this.container.getEl().contains(b.getPositionEl())
    }
});
Ext.Container.LAYOUTS.form = Ext.layout.FormLayout;
Ext.layout.AccordionLayout = Ext.extend(Ext.layout.FitLayout, {
    fill: true,
    autoWidth: true,
    titleCollapse: true,
    hideCollapseTool: false,
    collapseFirst: false,
    animate: false,
    sequence: false,
    activeOnTop: false,
    type: "accordion",
    renderItem: function(a) {
        if (this.animate === false) {
            a.animCollapse = false
        }
        a.collapsible = true;
        if (this.autoWidth) {
            a.autoWidth = true
        }
        if (this.titleCollapse) {
            a.titleCollapse = true
        }
        if (this.hideCollapseTool) {
            a.hideCollapseTool = true
        }
        if (this.collapseFirst !== undefined) {
            a.collapseFirst = this.collapseFirst
        }
        if (!this.activeItem && !a.collapsed) {
            this.setActiveItem(a, true)
        } else {
            if (this.activeItem && this.activeItem != a) {
                a.collapsed = true
            }
        }
        Ext.layout.AccordionLayout.superclass.renderItem.apply(this, arguments);
        a.header.addClass("x-accordion-hd");
        a.on("beforeexpand", this.beforeExpand, this)
    },
    onRemove: function(a) {
        Ext.layout.AccordionLayout.superclass.onRemove.call(this, a);
        if (a.rendered) {
            a.header.removeClass("x-accordion-hd")
        }
        a.un("beforeexpand", this.beforeExpand, this)
    },
    beforeExpand: function(c, b) {
        var a = this.activeItem;
        if (a) {
            if (this.sequence) {
                delete this.activeItem;
                if (!a.collapsed) {
                    a.collapse({
                        callback: function() {
                            c.expand(b || true)
                        },
                        scope: this
                    });
                    return false
                }
            } else {
                a.collapse(this.animate)
            }
        }
        this.setActive(c);
        if (this.activeOnTop) {
            c.el.dom.parentNode.insertBefore(c.el.dom, c.el.dom.parentNode.firstChild)
        }
        this.layout()
    },
    setItemSize: function(f, e) {
        if (this.fill && f) {
            var d = 0,
                c, b = this.getRenderedItems(this.container),
                a = b.length,
                g;
            for (c = 0; c < a; c++) {
                if ((g = b[c]) != f && !g.hidden) {
                    d += g.header.getHeight()
                }
            }
            e.height -= d;
            f.setSize(e)
        }
    },
    setActiveItem: function(a) {
        this.setActive(a, true)
    },
    setActive: function(c, b) {
        var a = this.activeItem;
        c = this.container.getComponent(c);
        if (a != c) {
            if (c.rendered && c.collapsed && b) {
                c.expand()
            } else {
                if (a) {
                    a.fireEvent("deactivate", a)
                }
                this.activeItem = c;
                c.fireEvent("activate", c)
            }
        }
    }
});
Ext.Container.LAYOUTS.accordion = Ext.layout.AccordionLayout;
Ext.layout.Accordion = Ext.layout.AccordionLayout;
Ext.layout.TableLayout = Ext.extend(Ext.layout.ContainerLayout, {
    monitorResize: false,
    type: "table",
    targetCls: "x-table-layout-ct",
    tableAttrs: null,
    setContainer: function(a) {
        Ext.layout.TableLayout.superclass.setContainer.call(this, a);
        this.currentRow = 0;
        this.currentColumn = 0;
        this.cells = []
    },
    onLayout: function(d, f) {
        var e = d.items.items,
            a = e.length,
            g, b;
        if (!this.table) {
            f.addClass("x-table-layout-ct");
            this.table = f.createChild(Ext.apply({
                tag: "table",
                cls: "x-table-layout",
                cellspacing: 0,
                cn: {
                    tag: "tbody"
                }
            }, this.tableAttrs), null, true)
        }
        this.renderAll(d, f)
    },
    getRow: function(a) {
        var b = this.table.tBodies[0].childNodes[a];
        if (!b) {
            b = document.createElement("tr");
            this.table.tBodies[0].appendChild(b)
        }
        return b
    },
    getNextCell: function(i) {
        var a = this.getNextNonSpan(this.currentColumn, this.currentRow);
        var f = this.currentColumn = a[0],
            e = this.currentRow = a[1];
        for (var h = e; h < e + (i.rowspan || 1); h++) {
            if (!this.cells[h]) {
                this.cells[h] = []
            }
            for (var d = f; d < f + (i.colspan || 1); d++) {
                this.cells[h][d] = true
            }
        }
        var g = document.createElement("td");
        if (i.cellId) {
            g.id = i.cellId
        }
        var b = "x-table-layout-cell";
        if (i.cellCls) {
            b += " " + i.cellCls
        }
        g.className = b;
        if (i.colspan) {
            g.colSpan = i.colspan
        }
        if (i.rowspan) {
            g.rowSpan = i.rowspan
        }
        this.getRow(e).appendChild(g);
        return g
    },
    getNextNonSpan: function(a, c) {
        var b = this.columns;
        while ((b && a >= b) || (this.cells[c] && this.cells[c][a])) {
            if (b && a >= b) {
                c++;
                a = 0
            } else {
                a++
            }
        }
        return [a, c]
    },
    renderItem: function(e, a, d) {
        if (!this.table) {
            this.table = d.createChild(Ext.apply({
                tag: "table",
                cls: "x-table-layout",
                cellspacing: 0,
                cn: {
                    tag: "tbody"
                }
            }, this.tableAttrs), null, true)
        }
        if (e && !e.rendered) {
            e.render(this.getNextCell(e));
            this.configureItem(e)
        } else {
            if (e && !this.isValidParent(e, d)) {
                var b = this.getNextCell(e);
                b.insertBefore(e.getPositionEl().dom, null);
                e.container = Ext.get(b);
                this.configureItem(e)
            }
        }
    },
    isValidParent: function(b, a) {
        return b.getPositionEl().up("table", 5).dom.parentNode === (a.dom || a)
    },
    destroy: function() {
        delete this.table;
        Ext.layout.TableLayout.superclass.destroy.call(this)
    }
});
Ext.Container.LAYOUTS.table = Ext.layout.TableLayout;
Ext.layout.AbsoluteLayout = Ext.extend(Ext.layout.AnchorLayout, {
    extraCls: "x-abs-layout-item",
    type: "absolute",
    onLayout: function(a, b) {
        b.position();
        this.paddingLeft = b.getPadding("l");
        this.paddingTop = b.getPadding("t");
        Ext.layout.AbsoluteLayout.superclass.onLayout.call(this, a, b)
    },
    adjustWidthAnchor: function(b, a) {
        return b ? b - a.getPosition(true)[0] + this.paddingLeft : b
    },
    adjustHeightAnchor: function(b, a) {
        return b ? b - a.getPosition(true)[1] + this.paddingTop : b
    }
});
Ext.Container.LAYOUTS.absolute = Ext.layout.AbsoluteLayout;
Ext.layout.BoxLayout = Ext.extend(Ext.layout.ContainerLayout, {
    defaultMargins: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    },
    padding: "0",
    pack: "start",
    monitorResize: true,
    type: "box",
    scrollOffset: 0,
    extraCls: "x-box-item",
    targetCls: "x-box-layout-ct",
    innerCls: "x-box-inner",
    constructor: function(a) {
        Ext.layout.BoxLayout.superclass.constructor.call(this, a);
        if (Ext.isString(this.defaultMargins)) {
            this.defaultMargins = this.parseMargins(this.defaultMargins)
        }
        var d = this.overflowHandler;
        if (typeof d == "string") {
            d = {
                type: d
            }
        }
        var c = "none";
        if (d && d.type != undefined) {
            c = d.type
        }
        var b = Ext.layout.boxOverflow[c];
        if (b[this.type]) {
            b = b[this.type]
        }
        this.overflowHandler = new b(this, d)
    },
    onLayout: function(b, g) {
        Ext.layout.BoxLayout.superclass.onLayout.call(this, b, g);
        var d = this.getLayoutTargetSize(),
            h = this.getVisibleItems(b),
            c = this.calculateChildBoxes(h, d),
            f = c.boxes,
            i = c.meta;
        if (d.width > 0) {
            var j = this.overflowHandler,
                a = i.tooNarrow ? "handleOverflow" : "clearOverflow";
            var e = j[a](c, d);
            if (e) {
                if (e.targetSize) {
                    d = e.targetSize
                }
                if (e.recalculate) {
                    h = this.getVisibleItems(b);
                    c = this.calculateChildBoxes(h, d);
                    f = c.boxes
                }
            }
        }
        this.layoutTargetLastSize = d;
        this.childBoxCache = c;
        this.updateInnerCtSize(d, c);
        this.updateChildBoxes(f);
        this.handleTargetOverflow(d, b, g)
    },
    updateChildBoxes: function(c) {
        for (var b = 0, e = c.length; b < e; b++) {
            var d = c[b],
                a = d.component;
            if (d.dirtySize) {
                a.setSize(d.width, d.height)
            }
            if (isNaN(d.left) || isNaN(d.top)) {
                continue
            }
            a.setPosition(d.left, d.top)
        }
    },
    updateInnerCtSize: function(c, g) {
        var h = this.align,
            f = this.padding,
            e = c.width,
            a = c.height;
        if (this.type == "hbox") {
            var b = e,
                d = g.meta.maxHeight + f.top + f.bottom;
            if (h == "stretch") {
                d = a
            } else {
                if (h == "middle") {
                    d = Math.max(a, d)
                }
            }
        } else {
            var d = a,
                b = g.meta.maxWidth + f.left + f.right;
            if (h == "stretch") {
                b = e
            } else {
                if (h == "center") {
                    b = Math.max(e, b)
                }
            }
        }
        this.innerCt.setSize(b || undefined, d || undefined)
    },
    handleTargetOverflow: function(d, a, c) {
        var e = c.getStyle("overflow");
        if (e && e != "hidden" && !this.adjustmentPass) {
            var b = this.getLayoutTargetSize();
            if (b.width != d.width || b.height != d.height) {
                this.adjustmentPass = true;
                this.onLayout(a, c)
            }
        }
        delete this.adjustmentPass
    },
    isValidParent: function(b, a) {
        return this.innerCt && b.getPositionEl().dom.parentNode == this.innerCt.dom
    },
    getVisibleItems: function(f) {
        var f = f || this.container,
            e = f.getLayoutTarget(),
            g = f.items.items,
            a = g.length,
            d, h, b = [];
        for (d = 0; d < a; d++) {
            if ((h = g[d]).rendered && this.isValidParent(h, e) && h.hidden !== true && h.collapsed !== true && h.shouldLayout !== false) {
                b.push(h)
            }
        }
        return b
    },
    renderAll: function(a, b) {
        if (!this.innerCt) {
            this.innerCt = b.createChild({
                cls: this.innerCls
            });
            this.padding = this.parseMargins(this.padding)
        }
        Ext.layout.BoxLayout.superclass.renderAll.call(this, a, this.innerCt)
    },
    getLayoutTargetSize: function() {
        var b = this.container.getLayoutTarget(),
            a;
        if (b) {
            a = b.getViewSize();
            if (Ext.isIE && Ext.isStrict && a.width == 0) {
                a = b.getStyleSize()
            }
            a.width -= b.getPadding("lr");
            a.height -= b.getPadding("tb")
        }
        return a
    },
    renderItem: function(a) {
        if (Ext.isString(a.margins)) {
            a.margins = this.parseMargins(a.margins)
        } else {
            if (!a.margins) {
                a.margins = this.defaultMargins
            }
        }
        Ext.layout.BoxLayout.superclass.renderItem.apply(this, arguments)
    },
    destroy: function() {
        Ext.destroy(this.overflowHandler);
        Ext.layout.BoxLayout.superclass.destroy.apply(this, arguments)
    }
});
Ext.ns("Ext.layout.boxOverflow");
Ext.layout.boxOverflow.None = Ext.extend(Object, {
    constructor: function(b, a) {
        this.layout = b;
        Ext.apply(this, a || {})
    },
    handleOverflow: Ext.emptyFn,
    clearOverflow: Ext.emptyFn
});
Ext.layout.boxOverflow.none = Ext.layout.boxOverflow.None;
Ext.layout.boxOverflow.Menu = Ext.extend(Ext.layout.boxOverflow.None, {
    afterCls: "x-strip-right",
    noItemsMenuText: '<div class="x-toolbar-no-items">(None)</div>',
    constructor: function(a) {
        Ext.layout.boxOverflow.Menu.superclass.constructor.apply(this, arguments);
        this.menuItems = []
    },
    createInnerElements: function() {
        if (!this.afterCt) {
            this.afterCt = this.layout.innerCt.insertSibling({
                cls: this.afterCls
            }, "before")
        }
    },
    clearOverflow: function(a, f) {
        var e = f.width + (this.afterCt ? this.afterCt.getWidth() : 0),
            b = this.menuItems;
        this.hideTrigger();
        for (var c = 0, d = b.length; c < d; c++) {
            b.pop().component.show()
        }
        return {
            targetSize: {
                height: f.height,
                width: e
            }
        }
    },
    showTrigger: function() {
        this.createMenu();
        this.menuTrigger.show()
    },
    hideTrigger: function() {
        if (this.menuTrigger != undefined) {
            this.menuTrigger.hide()
        }
    },
    beforeMenuShow: function(g) {
        var b = this.menuItems,
            a = b.length,
            f, e;
        var c = function(i, h) {
            return i.isXType("buttongroup") && !(h instanceof Ext.Toolbar.Separator)
        };
        this.clearMenu();
        g.removeAll();
        for (var d = 0; d < a; d++) {
            f = b[d].component;
            if (e && (c(f, e) || c(e, f))) {
                g.add("-")
            }
            this.addComponentToMenu(g, f);
            e = f
        }
        if (g.items.length < 1) {
            g.add(this.noItemsMenuText)
        }
    },
    createMenuConfig: function(c, a) {
        var b = Ext.apply({}, c.initialConfig),
            d = c.toggleGroup;
        Ext.copyTo(b, c, ["iconCls", "icon", "itemId", "disabled", "handler", "scope", "menu"]);
        Ext.apply(b, {
            text: c.overflowText || c.text,
            hideOnClick: a
        });
        if (d || c.enableToggle) {
            Ext.apply(b, {
                group: d,
                checked: c.pressed,
                listeners: {
                    checkchange: function(f, e) {
                        c.toggle(e)
                    }
                }
            })
        }
        delete b.ownerCt;
        delete b.xtype;
        delete b.id;
        return b
    },
    addComponentToMenu: function(b, a) {
        if (a instanceof Ext.Toolbar.Separator) {
            b.add("-")
        } else {
            if (Ext.isFunction(a.isXType)) {
                if (a.isXType("splitbutton")) {
                    b.add(this.createMenuConfig(a, true))
                } else {
                    if (a.isXType("button")) {
                        b.add(this.createMenuConfig(a, !a.menu))
                    } else {
                        if (a.isXType("buttongroup")) {
                            a.items.each(function(c) {
                                this.addComponentToMenu(b, c)
                            }, this)
                        }
                    }
                }
            }
        }
    },
    clearMenu: function() {
        var a = this.moreMenu;
        if (a && a.items) {
            a.items.each(function(b) {
                delete b.menu
            })
        }
    },
    createMenu: function() {
        if (!this.menuTrigger) {
            this.createInnerElements();
            this.menu = new Ext.menu.Menu({
                ownerCt: this.layout.container,
                listeners: {
                    scope: this,
                    beforeshow: this.beforeMenuShow
                }
            });
            this.menuTrigger = new Ext.Button({
                iconCls: "x-toolbar-more-icon",
                cls: "x-toolbar-more",
                menu: this.menu,
                renderTo: this.afterCt
            })
        }
    },
    destroy: function() {
        Ext.destroy(this.menu, this.menuTrigger)
    }
});
Ext.layout.boxOverflow.menu = Ext.layout.boxOverflow.Menu;
Ext.layout.boxOverflow.HorizontalMenu = Ext.extend(Ext.layout.boxOverflow.Menu, {
    constructor: function() {
        Ext.layout.boxOverflow.HorizontalMenu.superclass.constructor.apply(this, arguments);
        var c = this,
            b = c.layout,
            a = b.calculateChildBoxes;
        b.calculateChildBoxes = function(d, h) {
            var k = a.apply(b, arguments),
                j = k.meta,
                e = c.menuItems;
            var i = 0;
            for (var f = 0, g = e.length; f < g; f++) {
                i += e[f].width
            }
            j.minimumWidth += i;
            j.tooNarrow = j.minimumWidth > h.width;
            return k
        }
    },
    handleOverflow: function(d, g) {
        this.showTrigger();
        var j = g.width - this.afterCt.getWidth(),
            k = d.boxes,
            e = 0,
            q = false;
        for (var n = 0, c = k.length; n < c; n++) {
            e += k[n].width
        }
        var a = j - e,
            f = 0;
        for (var n = 0, c = this.menuItems.length; n < c; n++) {
            var m = this.menuItems[n],
                l = m.component,
                b = m.width;
            if (b < a) {
                l.show();
                a -= b;
                f++;
                q = true
            } else {
                break
            }
        }
        if (q) {
            this.menuItems = this.menuItems.slice(f)
        } else {
            for (var h = k.length - 1; h >= 0; h--) {
                var p = k[h].component,
                    o = k[h].left + k[h].width;
                if (o >= j) {
                    this.menuItems.unshift({
                        component: p,
                        width: k[h].width
                    });
                    p.hide()
                } else {
                    break
                }
            }
        } if (this.menuItems.length == 0) {
            this.hideTrigger()
        }
        return {
            targetSize: {
                height: g.height,
                width: j
            },
            recalculate: q
        }
    }
});
Ext.layout.boxOverflow.menu.hbox = Ext.layout.boxOverflow.HorizontalMenu;
Ext.layout.boxOverflow.Scroller = Ext.extend(Ext.layout.boxOverflow.None, {
    animateScroll: true,
    scrollIncrement: 100,
    wheelIncrement: 3,
    scrollRepeatInterval: 400,
    scrollDuration: 0.4,
    beforeCls: "x-strip-left",
    afterCls: "x-strip-right",
    scrollerCls: "x-strip-scroller",
    beforeScrollerCls: "x-strip-scroller-left",
    afterScrollerCls: "x-strip-scroller-right",
    createWheelListener: function() {
        this.layout.innerCt.on({
            scope: this,
            mousewheel: function(a) {
                a.stopEvent();
                this.scrollBy(a.getWheelDelta() * this.wheelIncrement * -1, false)
            }
        })
    },
    handleOverflow: function(a, b) {
        this.createInnerElements();
        this.showScrollers()
    },
    clearOverflow: function() {
        this.hideScrollers()
    },
    showScrollers: function() {
        this.createScrollers();
        this.beforeScroller.show();
        this.afterScroller.show();
        this.updateScrollButtons()
    },
    hideScrollers: function() {
        if (this.beforeScroller != undefined) {
            this.beforeScroller.hide();
            this.afterScroller.hide()
        }
    },
    createScrollers: function() {
        if (!this.beforeScroller && !this.afterScroller) {
            var a = this.beforeCt.createChild({
                cls: String.format("{0} {1} ", this.scrollerCls, this.beforeScrollerCls)
            });
            var b = this.afterCt.createChild({
                cls: String.format("{0} {1}", this.scrollerCls, this.afterScrollerCls)
            });
            a.addClassOnOver(this.beforeScrollerCls + "-hover");
            b.addClassOnOver(this.afterScrollerCls + "-hover");
            a.setVisibilityMode(Ext.Element.DISPLAY);
            b.setVisibilityMode(Ext.Element.DISPLAY);
            this.beforeRepeater = new Ext.util.ClickRepeater(a, {
                interval: this.scrollRepeatInterval,
                handler: this.scrollLeft,
                scope: this
            });
            this.afterRepeater = new Ext.util.ClickRepeater(b, {
                interval: this.scrollRepeatInterval,
                handler: this.scrollRight,
                scope: this
            });
            this.beforeScroller = a;
            this.afterScroller = b
        }
    },
    destroy: function() {
        Ext.destroy(this.beforeScroller, this.afterScroller, this.beforeRepeater, this.afterRepeater, this.beforeCt, this.afterCt)
    },
    scrollBy: function(b, a) {
        this.scrollTo(this.getScrollPosition() + b, a)
    },
    getItem: function(a) {
        if (Ext.isString(a)) {
            a = Ext.getCmp(a)
        } else {
            if (Ext.isNumber(a)) {
                a = this.items[a]
            }
        }
        return a
    },
    getScrollAnim: function() {
        return {
            duration: this.scrollDuration,
            callback: this.updateScrollButtons,
            scope: this
        }
    },
    updateScrollButtons: function() {
        if (this.beforeScroller == undefined || this.afterScroller == undefined) {
            return
        }
        var d = this.atExtremeBefore() ? "addClass" : "removeClass",
            c = this.atExtremeAfter() ? "addClass" : "removeClass",
            a = this.beforeScrollerCls + "-disabled",
            b = this.afterScrollerCls + "-disabled";
        this.beforeScroller[d](a);
        this.afterScroller[c](b);
        this.scrolling = false
    },
    atExtremeBefore: function() {
        return this.getScrollPosition() === 0
    },
    scrollLeft: function(a) {
        this.scrollBy(-this.scrollIncrement, a)
    },
    scrollRight: function(a) {
        this.scrollBy(this.scrollIncrement, a)
    },
    scrollToItem: function(d, b) {
        d = this.getItem(d);
        if (d != undefined) {
            var a = this.getItemVisibility(d);
            if (!a.fullyVisible) {
                var c = d.getBox(true, true),
                    e = c.x;
                if (a.hiddenRight) {
                    e -= (this.layout.innerCt.getWidth() - c.width)
                }
                this.scrollTo(e, b)
            }
        }
    },
    getItemVisibility: function(e) {
        var d = this.getItem(e).getBox(true, true),
            a = d.x,
            c = d.x + d.width,
            f = this.getScrollPosition(),
            b = this.layout.innerCt.getWidth() + f;
        return {
            hiddenLeft: a < f,
            hiddenRight: c > b,
            fullyVisible: a > f && c < b
        }
    }
});
Ext.layout.boxOverflow.scroller = Ext.layout.boxOverflow.Scroller;
Ext.layout.boxOverflow.VerticalScroller = Ext.extend(Ext.layout.boxOverflow.Scroller, {
    scrollIncrement: 75,
    wheelIncrement: 2,
    handleOverflow: function(a, b) {
        Ext.layout.boxOverflow.VerticalScroller.superclass.handleOverflow.apply(this, arguments);
        return {
            targetSize: {
                height: b.height - (this.beforeCt.getHeight() + this.afterCt.getHeight()),
                width: b.width
            }
        }
    },
    createInnerElements: function() {
        var a = this.layout.innerCt;
        if (!this.beforeCt) {
            this.beforeCt = a.insertSibling({
                cls: this.beforeCls
            }, "before");
            this.afterCt = a.insertSibling({
                cls: this.afterCls
            }, "after");
            this.createWheelListener()
        }
    },
    scrollTo: function(a, b) {
        var d = this.getScrollPosition(),
            c = a.constrain(0, this.getMaxScrollBottom());
        if (c != d && !this.scrolling) {
            if (b == undefined) {
                b = this.animateScroll
            }
            this.layout.innerCt.scrollTo("top", c, b ? this.getScrollAnim() : false);
            if (b) {
                this.scrolling = true
            } else {
                this.scrolling = false;
                this.updateScrollButtons()
            }
        }
    },
    getScrollPosition: function() {
        return parseInt(this.layout.innerCt.dom.scrollTop, 10) || 0
    },
    getMaxScrollBottom: function() {
        return this.layout.innerCt.dom.scrollHeight - this.layout.innerCt.getHeight()
    },
    atExtremeAfter: function() {
        return this.getScrollPosition() >= this.getMaxScrollBottom()
    }
});
Ext.layout.boxOverflow.scroller.vbox = Ext.layout.boxOverflow.VerticalScroller;
Ext.layout.boxOverflow.HorizontalScroller = Ext.extend(Ext.layout.boxOverflow.Scroller, {
    handleOverflow: function(a, b) {
        Ext.layout.boxOverflow.HorizontalScroller.superclass.handleOverflow.apply(this, arguments);
        return {
            targetSize: {
                height: b.height,
                width: b.width - (this.beforeCt.getWidth() + this.afterCt.getWidth())
            }
        }
    },
    createInnerElements: function() {
        var a = this.layout.innerCt;
        if (!this.beforeCt) {
            this.afterCt = a.insertSibling({
                cls: this.afterCls
            }, "before");
            this.beforeCt = a.insertSibling({
                cls: this.beforeCls
            }, "before");
            this.createWheelListener()
        }
    },
    scrollTo: function(a, b) {
        var d = this.getScrollPosition(),
            c = a.constrain(0, this.getMaxScrollRight());
        if (c != d && !this.scrolling) {
            if (b == undefined) {
                b = this.animateScroll
            }
            this.layout.innerCt.scrollTo("left", c, b ? this.getScrollAnim() : false);
            if (b) {
                this.scrolling = true
            } else {
                this.scrolling = false;
                this.updateScrollButtons()
            }
        }
    },
    getScrollPosition: function() {
        return parseInt(this.layout.innerCt.dom.scrollLeft, 10) || 0
    },
    getMaxScrollRight: function() {
        return this.layout.innerCt.dom.scrollWidth - this.layout.innerCt.getWidth()
    },
    atExtremeAfter: function() {
        return this.getScrollPosition() >= this.getMaxScrollRight()
    }
});
Ext.layout.boxOverflow.scroller.hbox = Ext.layout.boxOverflow.HorizontalScroller;
Ext.layout.HBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    align: "top",
    type: "hbox",
    calculateChildBoxes: function(q, b) {
        var E = q.length,
            Q = this.padding,
            C = Q.top,
            T = Q.left,
            x = C + Q.bottom,
            N = T + Q.right,
            a = b.width - this.scrollOffset,
            e = b.height,
            n = Math.max(0, e - x),
            O = this.pack == "start",
            V = this.pack == "center",
            z = this.pack == "end",
            K = 0,
            P = 0,
            S = 0,
            k = 0,
            W = 0,
            G = [],
            j, I, L, U, v, h, R, H, c, w, p, M;
        for (R = 0; R < E; R++) {
            j = q[R];
            L = j.height;
            I = j.width;
            h = !j.hasLayout && typeof j.doLayout == "function";
            if (typeof I != "number") {
                if (j.flex && !I) {
                    S += j.flex
                } else {
                    if (!I && h) {
                        j.doLayout()
                    }
                    U = j.getSize();
                    I = U.width;
                    L = U.height
                }
            }
            v = j.margins;
            w = v.left + v.right;
            K += w + (I || 0);
            k += w + (j.flex ? j.minWidth || 0 : I);
            W += w + (j.minWidth || I || 0);
            if (typeof L != "number") {
                if (h) {
                    j.doLayout()
                }
                L = j.getHeight()
            }
            P = Math.max(P, L + v.top + v.bottom);
            G.push({
                component: j,
                height: L || undefined,
                width: I || undefined
            })
        }
        var J = k - a,
            o = W > a;
        var m = Math.max(0, a - K - N);
        if (o) {
            for (R = 0; R < E; R++) {
                G[R].width = q[R].minWidth || q[R].width || G[R].width
            }
        } else {
            if (J > 0) {
                var B = [];
                for (var D = 0, u = E; D < u; D++) {
                    var A = q[D],
                        s = A.minWidth || 0;
                    if (A.flex) {
                        G[D].width = s
                    } else {
                        B.push({
                            minWidth: s,
                            available: G[D].width - s,
                            index: D
                        })
                    }
                }
                B.sort(function(X, i) {
                    return X.available > i.available ? 1 : -1
                });
                for (var R = 0, u = B.length; R < u; R++) {
                    var F = B[R].index;
                    if (F == undefined) {
                        continue
                    }
                    var A = q[F],
                        l = G[F],
                        t = l.width,
                        s = A.minWidth,
                        d = Math.max(s, t - Math.ceil(J / (u - R))),
                        f = t - d;
                    G[F].width = d;
                    J -= f
                }
            } else {
                var g = m,
                    r = S;
                for (R = 0; R < E; R++) {
                    j = q[R];
                    H = G[R];
                    v = j.margins;
                    p = v.top + v.bottom;
                    if (O && j.flex && !j.width) {
                        c = Math.ceil((j.flex / r) * g);
                        g -= c;
                        r -= j.flex;
                        H.width = c;
                        H.dirtySize = true
                    }
                }
            }
        } if (V) {
            T += m / 2
        } else {
            if (z) {
                T += m
            }
        }
        for (R = 0; R < E; R++) {
            j = q[R];
            H = G[R];
            v = j.margins;
            T += v.left;
            p = v.top + v.bottom;
            H.left = T;
            H.top = C + v.top;
            switch (this.align) {
                case "stretch":
                    M = n - p;
                    H.height = M.constrain(j.minHeight || 0, j.maxHeight || 1000000);
                    H.dirtySize = true;
                    break;
                case "stretchmax":
                    M = P - p;
                    H.height = M.constrain(j.minHeight || 0, j.maxHeight || 1000000);
                    H.dirtySize = true;
                    break;
                case "middle":
                    var y = n - H.height - p;
                    if (y > 0) {
                        H.top = C + p + (y / 2)
                    }
            }
            T += H.width + v.right
        }
        return {
            boxes: G,
            meta: {
                maxHeight: P,
                nonFlexWidth: K,
                desiredWidth: k,
                minimumWidth: W,
                shortfall: k - a,
                tooNarrow: o
            }
        }
    }
});
Ext.Container.LAYOUTS.hbox = Ext.layout.HBoxLayout;
Ext.layout.VBoxLayout = Ext.extend(Ext.layout.BoxLayout, {
    align: "left",
    type: "vbox",
    calculateChildBoxes: function(o, b) {
        var E = o.length,
            R = this.padding,
            C = R.top,
            U = R.left,
            x = C + R.bottom,
            O = U + R.right,
            a = b.width - this.scrollOffset,
            d = b.height,
            K = Math.max(0, a - O),
            P = this.pack == "start",
            W = this.pack == "center",
            z = this.pack == "end",
            k = 0,
            u = 0,
            T = 0,
            L = 0,
            m = 0,
            G = [],
            h, I, N, V, t, g, S, H, c, w, n, e;
        for (S = 0; S < E; S++) {
            h = o[S];
            N = h.height;
            I = h.width;
            g = !h.hasLayout && typeof h.doLayout == "function";
            if (typeof N != "number") {
                if (h.flex && !N) {
                    T += h.flex
                } else {
                    if (!N && g) {
                        h.doLayout()
                    }
                    V = h.getSize();
                    I = V.width;
                    N = V.height
                }
            }
            t = h.margins;
            n = t.top + t.bottom;
            k += n + (N || 0);
            L += n + (h.flex ? h.minHeight || 0 : N);
            m += n + (h.minHeight || N || 0);
            if (typeof I != "number") {
                if (g) {
                    h.doLayout()
                }
                I = h.getWidth()
            }
            u = Math.max(u, I + t.left + t.right);
            G.push({
                component: h,
                height: N || undefined,
                width: I || undefined
            })
        }
        var M = L - d,
            l = m > d;
        var q = Math.max(0, (d - k - x));
        if (l) {
            for (S = 0, r = E; S < r; S++) {
                G[S].height = o[S].minHeight || o[S].height || G[S].height
            }
        } else {
            if (M > 0) {
                var J = [];
                for (var D = 0, r = E; D < r; D++) {
                    var A = o[D],
                        s = A.minHeight || 0;
                    if (A.flex) {
                        G[D].height = s
                    } else {
                        J.push({
                            minHeight: s,
                            available: G[D].height - s,
                            index: D
                        })
                    }
                }
                J.sort(function(X, i) {
                    return X.available > i.available ? 1 : -1
                });
                for (var S = 0, r = J.length; S < r; S++) {
                    var F = J[S].index;
                    if (F == undefined) {
                        continue
                    }
                    var A = o[F],
                        j = G[F],
                        v = j.height,
                        s = A.minHeight,
                        B = Math.max(s, v - Math.ceil(M / (r - S))),
                        f = v - B;
                    G[F].height = B;
                    M -= f
                }
            } else {
                var Q = q,
                    p = T;
                for (S = 0; S < E; S++) {
                    h = o[S];
                    H = G[S];
                    t = h.margins;
                    w = t.left + t.right;
                    if (P && h.flex && !h.height) {
                        flexedHeight = Math.ceil((h.flex / p) * Q);
                        Q -= flexedHeight;
                        p -= h.flex;
                        H.height = flexedHeight;
                        H.dirtySize = true
                    }
                }
            }
        } if (W) {
            C += q / 2
        } else {
            if (z) {
                C += q
            }
        }
        for (S = 0; S < E; S++) {
            h = o[S];
            H = G[S];
            t = h.margins;
            C += t.top;
            w = t.left + t.right;
            H.left = U + t.left;
            H.top = C;
            switch (this.align) {
                case "stretch":
                    e = K - w;
                    H.width = e.constrain(h.minWidth || 0, h.maxWidth || 1000000);
                    H.dirtySize = true;
                    break;
                case "stretchmax":
                    e = u - w;
                    H.width = e.constrain(h.minWidth || 0, h.maxWidth || 1000000);
                    H.dirtySize = true;
                    break;
                case "center":
                    var y = K - H.width - w;
                    if (y > 0) {
                        H.left = U + w + (y / 2)
                    }
            }
            C += H.height + t.bottom
        }
        return {
            boxes: G,
            meta: {
                maxWidth: u,
                nonFlexHeight: k,
                desiredHeight: L,
                minimumHeight: m,
                shortfall: L - d,
                tooNarrow: l
            }
        }
    }
});
Ext.Container.LAYOUTS.vbox = Ext.layout.VBoxLayout;
Ext.layout.ToolbarLayout = Ext.extend(Ext.layout.ContainerLayout, {
    monitorResize: true,
    type: "toolbar",
    triggerWidth: 18,
    noItemsMenuText: '<div class="x-toolbar-no-items">(None)</div>',
    lastOverflow: false,
    tableHTML: ['<table cellspacing="0" class="x-toolbar-ct">', "<tbody>", "<tr>", '<td class="x-toolbar-left" align="{0}">', '<table cellspacing="0">', "<tbody>", '<tr class="x-toolbar-left-row"></tr>', "</tbody>", "</table>", "</td>", '<td class="x-toolbar-right" align="right">', '<table cellspacing="0" class="x-toolbar-right-ct">', "<tbody>", "<tr>", "<td>", '<table cellspacing="0">', "<tbody>", '<tr class="x-toolbar-right-row"></tr>', "</tbody>", "</table>", "</td>", "<td>", '<table cellspacing="0">', "<tbody>", '<tr class="x-toolbar-extras-row"></tr>', "</tbody>", "</table>", "</td>", "</tr>", "</tbody>", "</table>", "</td>", "</tr>", "</tbody>", "</table>"].join(""),
    onLayout: function(e, h) {
        if (!this.leftTr) {
            var g = e.buttonAlign == "center" ? "center" : "left";
            h.addClass("x-toolbar-layout-ct");
            h.insertHtml("beforeEnd", String.format(this.tableHTML, g));
            this.leftTr = h.child("tr.x-toolbar-left-row", true);
            this.rightTr = h.child("tr.x-toolbar-right-row", true);
            this.extrasTr = h.child("tr.x-toolbar-extras-row", true);
            if (this.hiddenItem == undefined) {
                this.hiddenItems = []
            }
        }
        var j = e.buttonAlign == "right" ? this.rightTr : this.leftTr,
            k = e.items.items,
            d = 0;
        for (var b = 0, f = k.length, l; b < f; b++, d++) {
            l = k[b];
            if (l.isFill) {
                j = this.rightTr;
                d = -1
            } else {
                if (!l.rendered) {
                    l.render(this.insertCell(l, j, d));
                    this.configureItem(l)
                } else {
                    if (!l.xtbHidden && !this.isValidParent(l, j.childNodes[d])) {
                        var a = this.insertCell(l, j, d);
                        a.appendChild(l.getPositionEl().dom);
                        l.container = Ext.get(a)
                    }
                }
            }
        }
        this.cleanup(this.leftTr);
        this.cleanup(this.rightTr);
        this.cleanup(this.extrasTr);
        this.fitToSize(h)
    },
    cleanup: function(b) {
        var e = b.childNodes,
            a, d;
        for (a = e.length - 1; a >= 0 && (d = e[a]); a--) {
            if (!d.firstChild) {
                b.removeChild(d)
            }
        }
    },
    insertCell: function(e, b, a) {
        var d = document.createElement("td");
        d.className = "x-toolbar-cell";
        b.insertBefore(d, b.childNodes[a] || null);
        return d
    },
    hideItem: function(a) {
        this.hiddenItems.push(a);
        a.xtbHidden = true;
        a.xtbWidth = a.getPositionEl().dom.parentNode.offsetWidth;
        a.hide()
    },
    unhideItem: function(a) {
        a.show();
        a.xtbHidden = false;
        this.hiddenItems.remove(a)
    },
    getItemWidth: function(a) {
        return a.hidden ? (a.xtbWidth || 0) : a.getPositionEl().dom.parentNode.offsetWidth
    },
    fitToSize: function(j) {
        if (this.container.enableOverflow === false) {
            return
        }
        var b = j.dom.clientWidth,
            h = j.dom.firstChild.offsetWidth,
            l = b - this.triggerWidth,
            a = this.lastWidth || 0,
            c = this.hiddenItems,
            e = c.length != 0,
            m = b >= a;
        this.lastWidth = b;
        if (h > b || (e && m)) {
            var k = this.container.items.items,
                g = k.length,
                d = 0,
                n;
            for (var f = 0; f < g; f++) {
                n = k[f];
                if (!n.isFill) {
                    d += this.getItemWidth(n);
                    if (d > l) {
                        if (!(n.hidden || n.xtbHidden)) {
                            this.hideItem(n)
                        }
                    } else {
                        if (n.xtbHidden) {
                            this.unhideItem(n)
                        }
                    }
                }
            }
        }
        e = c.length != 0;
        if (e) {
            this.initMore();
            if (!this.lastOverflow) {
                this.container.fireEvent("overflowchange", this.container, true);
                this.lastOverflow = true
            }
        } else {
            if (this.more) {
                this.clearMenu();
                this.more.destroy();
                delete this.more;
                if (this.lastOverflow) {
                    this.container.fireEvent("overflowchange", this.container, false);
                    this.lastOverflow = false
                }
            }
        }
    },
    createMenuConfig: function(c, a) {
        var b = Ext.apply({}, c.initialConfig),
            d = c.toggleGroup;
        Ext.copyTo(b, c, ["iconCls", "icon", "itemId", "disabled", "handler", "scope", "menu"]);
        Ext.apply(b, {
            text: c.overflowText || c.text,
            hideOnClick: a
        });
        if (d || c.enableToggle) {
            Ext.apply(b, {
                group: d,
                checked: c.pressed,
                listeners: {
                    checkchange: function(f, e) {
                        c.toggle(e)
                    }
                }
            })
        }
        delete b.ownerCt;
        delete b.xtype;
        delete b.id;
        return b
    },
    addComponentToMenu: function(b, a) {
        if (a instanceof Ext.Toolbar.Separator) {
            b.add("-")
        } else {
            if (Ext.isFunction(a.isXType)) {
                if (a.isXType("splitbutton")) {
                    b.add(this.createMenuConfig(a, true))
                } else {
                    if (a.isXType("button")) {
                        b.add(this.createMenuConfig(a, !a.menu))
                    } else {
                        if (a.isXType("buttongroup")) {
                            a.items.each(function(c) {
                                this.addComponentToMenu(b, c)
                            }, this)
                        }
                    }
                }
            }
        }
    },
    clearMenu: function() {
        var a = this.moreMenu;
        if (a && a.items) {
            a.items.each(function(b) {
                delete b.menu
            })
        }
    },
    beforeMoreShow: function(g) {
        var b = this.container.items.items,
            a = b.length,
            f, e;
        var c = function(i, h) {
            return i.isXType("buttongroup") && !(h instanceof Ext.Toolbar.Separator)
        };
        this.clearMenu();
        g.removeAll();
        for (var d = 0; d < a; d++) {
            f = b[d];
            if (f.xtbHidden) {
                if (e && (c(f, e) || c(e, f))) {
                    g.add("-")
                }
                this.addComponentToMenu(g, f);
                e = f
            }
        }
        if (g.items.length < 1) {
            g.add(this.noItemsMenuText)
        }
    },
    initMore: function() {
        if (!this.more) {
            this.moreMenu = new Ext.menu.Menu({
                ownerCt: this.container,
                listeners: {
                    beforeshow: this.beforeMoreShow,
                    scope: this
                }
            });
            this.more = new Ext.Button({
                iconCls: "x-toolbar-more-icon",
                cls: "x-toolbar-more",
                menu: this.moreMenu,
                ownerCt: this.container
            });
            var a = this.insertCell(this.more, this.extrasTr, 100);
            this.more.render(a)
        }
    },
    destroy: function() {
        Ext.destroy(this.more, this.moreMenu);
        delete this.leftTr;
        delete this.rightTr;
        delete this.extrasTr;
        Ext.layout.ToolbarLayout.superclass.destroy.call(this)
    }
});
Ext.Container.LAYOUTS.toolbar = Ext.layout.ToolbarLayout;
Ext.layout.MenuLayout = Ext.extend(Ext.layout.ContainerLayout, {
    monitorResize: true,
    type: "menu",
    setContainer: function(a) {
        this.monitorResize = !a.floating;
        a.on("autosize", this.doAutoSize, this);
        Ext.layout.MenuLayout.superclass.setContainer.call(this, a)
    },
    renderItem: function(f, b, e) {
        if (!this.itemTpl) {
            this.itemTpl = Ext.layout.MenuLayout.prototype.itemTpl = new Ext.XTemplate('<li id="{itemId}" class="{itemCls}">', '<tpl if="needsIcon">', '<img alt="{altText}" src="{icon}" class="{iconCls}"/>', "</tpl>", "</li>")
        }
        if (f && !f.rendered) {
            if (Ext.isNumber(b)) {
                b = e.dom.childNodes[b]
            }
            var d = this.getItemArgs(f);
            f.render(f.positionEl = b ? this.itemTpl.insertBefore(b, d, true) : this.itemTpl.append(e, d, true));
            f.positionEl.menuItemId = f.getItemId();
            if (!d.isMenuItem && d.needsIcon) {
                f.positionEl.addClass("x-menu-list-item-indent")
            }
            this.configureItem(f)
        } else {
            if (f && !this.isValidParent(f, e)) {
                if (Ext.isNumber(b)) {
                    b = e.dom.childNodes[b]
                }
                e.dom.insertBefore(f.getActionEl().dom, b || null)
            }
        }
    },
    getItemArgs: function(d) {
        var a = d instanceof Ext.menu.Item,
            b = !(a || d instanceof Ext.menu.Separator);
        return {
            isMenuItem: a,
            needsIcon: b && (d.icon || d.iconCls),
            icon: d.icon || Ext.BLANK_IMAGE_URL,
            iconCls: "x-menu-item-icon " + (d.iconCls || ""),
            itemId: "x-menu-el-" + d.id,
            itemCls: "x-menu-list-item ",
            altText: d.altText || ""
        }
    },
    isValidParent: function(b, a) {
        return b.el.up("li.x-menu-list-item", 5).dom.parentNode === (a.dom || a)
    },
    onLayout: function(a, b) {
        Ext.layout.MenuLayout.superclass.onLayout.call(this, a, b);
        this.doAutoSize()
    },
    doAutoSize: function() {
        var c = this.container,
            a = c.width;
        if (c.floating) {
            if (a) {
                c.setWidth(a)
            } else {
                if (Ext.isIE) {
                    c.setWidth(Ext.isStrict && (Ext.isIE7 || Ext.isIE8) ? "auto" : c.minWidth);
                    var d = c.getEl(),
                        b = d.dom.offsetWidth;
                    c.setWidth(c.getLayoutTarget().getWidth() + d.getFrameWidth("lr"))
                }
            }
        }
    }
});
Ext.Container.LAYOUTS.menu = Ext.layout.MenuLayout;
Ext.Viewport = Ext.extend(Ext.Container, {
    initComponent: function() {
        Ext.Viewport.superclass.initComponent.call(this);
        document.getElementsByTagName("html")[0].className += " x-viewport";
        this.el = Ext.getBody();
        this.el.setHeight = Ext.emptyFn;
        this.el.setWidth = Ext.emptyFn;
        this.el.setSize = Ext.emptyFn;
        this.el.dom.scroll = "no";
        this.allowDomMove = false;
        this.autoWidth = true;
        this.autoHeight = true;
        Ext.EventManager.onWindowResize(this.fireResize, this);
        this.renderTo = this.el
    },
    fireResize: function(a, b) {
        this.fireEvent("resize", this, a, b, a, b)
    }
});
Ext.reg("viewport", Ext.Viewport);
Ext.Panel = Ext.extend(Ext.Container, {
    baseCls: "x-panel",
    collapsedCls: "x-panel-collapsed",
    maskDisabled: true,
    animCollapse: Ext.enableFx,
    headerAsText: true,
    buttonAlign: "right",
    collapsed: false,
    collapseFirst: true,
    minButtonWidth: 75,
    elements: "body",
    preventBodyReset: false,
    padding: undefined,
    resizeEvent: "bodyresize",
    toolTarget: "header",
    collapseEl: "bwrap",
    slideAnchor: "t",
    disabledClass: "",
    deferHeight: true,
    expandDefaults: {
        duration: 0.25
    },
    collapseDefaults: {
        duration: 0.25
    },
    initComponent: function() {
        Ext.Panel.superclass.initComponent.call(this);
        this.addEvents("bodyresize", "titlechange", "iconchange", "collapse", "expand", "beforecollapse", "beforeexpand", "beforeclose", "close", "activate", "deactivate");
        if (this.unstyled) {
            this.baseCls = "x-plain"
        }
        this.toolbars = [];
        if (this.tbar) {
            this.elements += ",tbar";
            this.topToolbar = this.createToolbar(this.tbar);
            this.tbar = null
        }
        if (this.bbar) {
            this.elements += ",bbar";
            this.bottomToolbar = this.createToolbar(this.bbar);
            this.bbar = null
        }
        if (this.header === true) {
            this.elements += ",header";
            this.header = null
        } else {
            if (this.headerCfg || (this.title && this.header !== false)) {
                this.elements += ",header"
            }
        } if (this.footerCfg || this.footer === true) {
            this.elements += ",footer";
            this.footer = null
        }
        if (this.buttons) {
            this.fbar = this.buttons;
            this.buttons = null
        }
        if (this.fbar) {
            this.createFbar(this.fbar)
        }
        if (this.autoLoad) {
            this.on("render", this.doAutoLoad, this, {
                delay: 10
            })
        }
    },
    createFbar: function(b) {
        var a = this.minButtonWidth;
        this.elements += ",footer";
        this.fbar = this.createToolbar(b, {
            buttonAlign: this.buttonAlign,
            toolbarCls: "x-panel-fbar",
            enableOverflow: false,
            defaults: function(d) {
                return {
                    minWidth: d.minWidth || a
                }
            }
        });
        this.fbar.items.each(function(d) {
            d.minWidth = d.minWidth || this.minButtonWidth
        }, this);
        this.buttons = this.fbar.items.items
    },
    createToolbar: function(b, c) {
        var a;
        if (Ext.isArray(b)) {
            b = {
                items: b
            }
        }
        a = b.events ? Ext.apply(b, c) : this.createComponent(Ext.apply({}, b, c), "toolbar");
        this.toolbars.push(a);
        return a
    },
    createElement: function(a, c) {
        if (this[a]) {
            c.appendChild(this[a].dom);
            return
        }
        if (a === "bwrap" || this.elements.indexOf(a) != -1) {
            if (this[a + "Cfg"]) {
                this[a] = Ext.fly(c).createChild(this[a + "Cfg"])
            } else {
                var b = document.createElement("div");
                b.className = this[a + "Cls"];
                this[a] = Ext.get(c.appendChild(b))
            } if (this[a + "CssClass"]) {
                this[a].addClass(this[a + "CssClass"])
            }
            if (this[a + "Style"]) {
                this[a].applyStyles(this[a + "Style"])
            }
        }
    },
    onRender: function(f, e) {
        Ext.Panel.superclass.onRender.call(this, f, e);
        this.createClasses();
        var a = this.el,
            g = a.dom,
            j, h;
        if (this.collapsible && !this.hideCollapseTool) {
            this.tools = this.tools ? this.tools.slice(0) : [];
            this.tools[this.collapseFirst ? "unshift" : "push"]({
                id: "toggle",
                handler: this.toggleCollapse,
                scope: this
            })
        }
        if (this.tools) {
            h = this.tools;
            this.elements += (this.header !== false) ? ",header" : ""
        }
        this.tools = {};
        a.addClass(this.baseCls);
        if (g.firstChild) {
            this.header = a.down("." + this.headerCls);
            this.bwrap = a.down("." + this.bwrapCls);
            var i = this.bwrap ? this.bwrap : a;
            this.tbar = i.down("." + this.tbarCls);
            this.body = i.down("." + this.bodyCls);
            this.bbar = i.down("." + this.bbarCls);
            this.footer = i.down("." + this.footerCls);
            this.fromMarkup = true
        }
        if (this.preventBodyReset === true) {
            a.addClass("x-panel-reset")
        }
        if (this.cls) {
            a.addClass(this.cls)
        }
        if (this.buttons) {
            this.elements += ",footer"
        }
        if (this.frame) {
            a.insertHtml("afterBegin", String.format(Ext.Element.boxMarkup, this.baseCls));
            this.createElement("header", g.firstChild.firstChild.firstChild);
            this.createElement("bwrap", g);
            j = this.bwrap.dom;
            var c = g.childNodes[1],
                b = g.childNodes[2];
            j.appendChild(c);
            j.appendChild(b);
            var k = j.firstChild.firstChild.firstChild;
            this.createElement("tbar", k);
            this.createElement("body", k);
            this.createElement("bbar", k);
            this.createElement("footer", j.lastChild.firstChild.firstChild);
            if (!this.footer) {
                this.bwrap.dom.lastChild.className += " x-panel-nofooter"
            }
            this.ft = Ext.get(this.bwrap.dom.lastChild);
            this.mc = Ext.get(k)
        } else {
            this.createElement("header", g);
            this.createElement("bwrap", g);
            j = this.bwrap.dom;
            this.createElement("tbar", j);
            this.createElement("body", j);
            this.createElement("bbar", j);
            this.createElement("footer", j);
            if (!this.header) {
                this.body.addClass(this.bodyCls + "-noheader");
                if (this.tbar) {
                    this.tbar.addClass(this.tbarCls + "-noheader")
                }
            }
        } if (Ext.isDefined(this.padding)) {
            this.body.setStyle("padding", this.body.addUnits(this.padding))
        }
        if (this.border === false) {
            this.el.addClass(this.baseCls + "-noborder");
            this.body.addClass(this.bodyCls + "-noborder");
            if (this.header) {
                this.header.addClass(this.headerCls + "-noborder")
            }
            if (this.footer) {
                this.footer.addClass(this.footerCls + "-noborder")
            }
            if (this.tbar) {
                this.tbar.addClass(this.tbarCls + "-noborder")
            }
            if (this.bbar) {
                this.bbar.addClass(this.bbarCls + "-noborder")
            }
        }
        if (this.bodyBorder === false) {
            this.body.addClass(this.bodyCls + "-noborder")
        }
        this.bwrap.enableDisplayMode("block");
        if (this.header) {
            this.header.unselectable();
            if (this.headerAsText) {
                this.header.dom.innerHTML = '<span class="' + this.headerTextCls + '">' + this.header.dom.innerHTML + "</span>";
                if (this.iconCls) {
                    this.setIconClass(this.iconCls)
                }
            }
        }
        if (this.floating) {
            this.makeFloating(this.floating)
        }
        if (this.collapsible && this.titleCollapse && this.header) {
            this.mon(this.header, "click", this.toggleCollapse, this);
            this.header.setStyle("cursor", "pointer")
        }
        if (h) {
            this.addTool.apply(this, h)
        }
        if (this.fbar) {
            this.footer.addClass("x-panel-btns");
            this.fbar.ownerCt = this;
            this.fbar.render(this.footer);
            this.footer.createChild({
                cls: "x-clear"
            })
        }
        if (this.tbar && this.topToolbar) {
            this.topToolbar.ownerCt = this;
            this.topToolbar.render(this.tbar)
        }
        if (this.bbar && this.bottomToolbar) {
            this.bottomToolbar.ownerCt = this;
            this.bottomToolbar.render(this.bbar)
        }
    },
    setIconClass: function(b) {
        var a = this.iconCls;
        this.iconCls = b;
        if (this.rendered && this.header) {
            if (this.frame) {
                this.header.addClass("x-panel-icon");
                this.header.replaceClass(a, this.iconCls)
            } else {
                var e = this.header,
                    c = e.child("img.x-panel-inline-icon");
                if (c) {
                    Ext.fly(c).replaceClass(a, this.iconCls)
                } else {
                    var d = e.child("span." + this.headerTextCls);
                    if (d) {
                        Ext.DomHelper.insertBefore(d.dom, {
                            tag: "img",
                            alt: "",
                            src: Ext.BLANK_IMAGE_URL,
                            cls: "x-panel-inline-icon " + this.iconCls
                        })
                    }
                }
            }
        }
        this.fireEvent("iconchange", this, b, a)
    },
    makeFloating: function(a) {
        this.floating = true;
        this.el = new Ext.Layer(Ext.apply({}, a, {
            shadow: Ext.isDefined(this.shadow) ? this.shadow : "sides",
            shadowOffset: this.shadowOffset,
            constrain: false,
            shim: this.shim === false ? false : undefined
        }), this.el)
    },
    getTopToolbar: function() {
        return this.topToolbar
    },
    getBottomToolbar: function() {
        return this.bottomToolbar
    },
    getFooterToolbar: function() {
        return this.fbar
    },
    addButton: function(a, c, b) {
        if (!this.fbar) {
            this.createFbar([])
        }
        if (c) {
            if (Ext.isString(a)) {
                a = {
                    text: a
                }
            }
            a = Ext.apply({
                handler: c,
                scope: b
            }, a)
        }
        return this.fbar.add(a)
    },
    addTool: function() {
        if (!this.rendered) {
            if (!this.tools) {
                this.tools = []
            }
            Ext.each(arguments, function(a) {
                this.tools.push(a)
            }, this);
            return
        }
        if (!this[this.toolTarget]) {
            return
        }
        if (!this.toolTemplate) {
            var g = new Ext.Template('<div class="x-tool x-tool-{id}">&#160;</div>');
            g.disableFormats = true;
            g.compile();
            Ext.Panel.prototype.toolTemplate = g
        }
        for (var f = 0, d = arguments, c = d.length; f < c; f++) {
            var b = d[f];
            if (!this.tools[b.id]) {
                var h = "x-tool-" + b.id + "-over";
                var e = this.toolTemplate.insertFirst(this[this.toolTarget], b, true);
                this.tools[b.id] = e;
                e.enableDisplayMode("block");
                this.mon(e, "click", this.createToolHandler(e, b, h, this));
                if (b.on) {
                    this.mon(e, b.on)
                }
                if (b.hidden) {
                    e.hide()
                }
                if (b.qtip) {
                    if (Ext.isObject(b.qtip)) {
                        Ext.QuickTips.register(Ext.apply({
                            target: e.id
                        }, b.qtip))
                    } else {
                        e.dom.qtip = b.qtip
                    }
                }
                e.addClassOnOver(h)
            }
        }
    },
    onLayout: function(b, a) {
        Ext.Panel.superclass.onLayout.apply(this, arguments);
        if (this.hasLayout && this.toolbars.length > 0) {
            Ext.each(this.toolbars, function(c) {
                c.doLayout(undefined, a)
            });
            this.syncHeight()
        }
    },
    syncHeight: function() {
        var b = this.toolbarHeight,
            c = this.body,
            a = this.lastSize.height,
            d;
        if (this.autoHeight || !Ext.isDefined(a) || a == "auto") {
            return
        }
        if (b != this.getToolbarHeight()) {
            b = Math.max(0, a - this.getFrameHeight());
            c.setHeight(b);
            d = c.getSize();
            this.toolbarHeight = this.getToolbarHeight();
            this.onBodyResize(d.width, d.height)
        }
    },
    onShow: function() {
        if (this.floating) {
            return this.el.show()
        }
        Ext.Panel.superclass.onShow.call(this)
    },
    onHide: function() {
        if (this.floating) {
            return this.el.hide()
        }
        Ext.Panel.superclass.onHide.call(this)
    },
    createToolHandler: function(c, a, d, b) {
        return function(f) {
            c.removeClass(d);
            if (a.stopEvent !== false) {
                f.stopEvent()
            }
            if (a.handler) {
                a.handler.call(a.scope || c, f, c, b, a)
            }
        }
    },
    afterRender: function() {
        if (this.floating && !this.hidden) {
            this.el.show()
        }
        if (this.title) {
            this.setTitle(this.title)
        }
        Ext.Panel.superclass.afterRender.call(this);
        if (this.collapsed) {
            this.collapsed = false;
            this.collapse(false)
        }
        this.initEvents()
    },
    getKeyMap: function() {
        if (!this.keyMap) {
            this.keyMap = new Ext.KeyMap(this.el, this.keys)
        }
        return this.keyMap
    },
    initEvents: function() {
        if (this.keys) {
            this.getKeyMap()
        }
        if (this.draggable) {
            this.initDraggable()
        }
        if (this.toolbars.length > 0) {
            Ext.each(this.toolbars, function(a) {
                a.doLayout();
                a.on({
                    scope: this,
                    afterlayout: this.syncHeight,
                    remove: this.syncHeight
                })
            }, this);
            this.syncHeight()
        }
    },
    initDraggable: function() {
        this.dd = new Ext.Panel.DD(this, Ext.isBoolean(this.draggable) ? null : this.draggable)
    },
    beforeEffect: function(a) {
        if (this.floating) {
            this.el.beforeAction()
        }
        if (a !== false) {
            this.el.addClass("x-panel-animated")
        }
    },
    afterEffect: function(a) {
        this.syncShadow();
        this.el.removeClass("x-panel-animated")
    },
    createEffect: function(c, b, d) {
        var e = {
            scope: d,
            block: true
        };
        if (c === true) {
            e.callback = b;
            return e
        } else {
            if (!c.callback) {
                e.callback = b
            } else {
                e.callback = function() {
                    b.call(d);
                    Ext.callback(c.callback, c.scope)
                }
            }
        }
        return Ext.applyIf(e, c)
    },
    collapse: function(b) {
        if (this.collapsed || this.el.hasFxBlock() || this.fireEvent("beforecollapse", this, b) === false) {
            return
        }
        var a = b === true || (b !== false && this.animCollapse);
        this.beforeEffect(a);
        this.onCollapse(a, b);
        return this
    },
    onCollapse: function(a, b) {
        if (a) {
            this[this.collapseEl].slideOut(this.slideAnchor, Ext.apply(this.createEffect(b || true, this.afterCollapse, this), this.collapseDefaults))
        } else {
            this[this.collapseEl].hide(this.hideMode);
            this.afterCollapse(false)
        }
    },
    afterCollapse: function(a) {
        this.collapsed = true;
        this.el.addClass(this.collapsedCls);
        if (a !== false) {
            this[this.collapseEl].hide(this.hideMode)
        }
        this.afterEffect(a);
        this.cascade(function(b) {
            if (b.lastSize) {
                b.lastSize = {
                    width: undefined,
                    height: undefined
                }
            }
        });
        this.fireEvent("collapse", this)
    },
    expand: function(b) {
        if (!this.collapsed || this.el.hasFxBlock() || this.fireEvent("beforeexpand", this, b) === false) {
            return
        }
        var a = b === true || (b !== false && this.animCollapse);
        this.el.removeClass(this.collapsedCls);
        this.beforeEffect(a);
        this.onExpand(a, b);
        return this
    },
    onExpand: function(a, b) {
        if (a) {
            this[this.collapseEl].slideIn(this.slideAnchor, Ext.apply(this.createEffect(b || true, this.afterExpand, this), this.expandDefaults))
        } else {
            this[this.collapseEl].show(this.hideMode);
            this.afterExpand(false)
        }
    },
    afterExpand: function(a) {
        this.collapsed = false;
        if (a !== false) {
            this[this.collapseEl].show(this.hideMode)
        }
        this.afterEffect(a);
        if (this.deferLayout) {
            delete this.deferLayout;
            this.doLayout(true)
        }
        this.fireEvent("expand", this)
    },
    toggleCollapse: function(a) {
        this[this.collapsed ? "expand" : "collapse"](a);
        return this
    },
    onDisable: function() {
        if (this.rendered && this.maskDisabled) {
            this.el.mask()
        }
        Ext.Panel.superclass.onDisable.call(this)
    },
    onEnable: function() {
        if (this.rendered && this.maskDisabled) {
            this.el.unmask()
        }
        Ext.Panel.superclass.onEnable.call(this)
    },
    onResize: function(f, d, c, e) {
        var a = f,
            b = d;
        if (Ext.isDefined(a) || Ext.isDefined(b)) {
            if (!this.collapsed) {
                if (Ext.isNumber(a)) {
                    this.body.setWidth(a = this.adjustBodyWidth(a - this.getFrameWidth()))
                } else {
                    if (a == "auto") {
                        a = this.body.setWidth("auto").dom.offsetWidth
                    } else {
                        a = this.body.dom.offsetWidth
                    }
                } if (this.tbar) {
                    this.tbar.setWidth(a);
                    if (this.topToolbar) {
                        this.topToolbar.setSize(a)
                    }
                }
                if (this.bbar) {
                    this.bbar.setWidth(a);
                    if (this.bottomToolbar) {
                        this.bottomToolbar.setSize(a);
                        if (Ext.isIE) {
                            this.bbar.setStyle("position", "static");
                            this.bbar.setStyle("position", "")
                        }
                    }
                }
                if (this.footer) {
                    this.footer.setWidth(a);
                    if (this.fbar) {
                        this.fbar.setSize(Ext.isIE ? (a - this.footer.getFrameWidth("lr")) : "auto")
                    }
                }
                if (Ext.isNumber(b)) {
                    b = Math.max(0, b - this.getFrameHeight());
                    this.body.setHeight(b)
                } else {
                    if (b == "auto") {
                        this.body.setHeight(b)
                    }
                } if (this.disabled && this.el._mask) {
                    this.el._mask.setSize(this.el.dom.clientWidth, this.el.getHeight())
                }
            } else {
                this.queuedBodySize = {
                    width: a,
                    height: b
                };
                if (!this.queuedExpand && this.allowQueuedExpand !== false) {
                    this.queuedExpand = true;
                    this.on("expand", function() {
                        delete this.queuedExpand;
                        this.onResize(this.queuedBodySize.width, this.queuedBodySize.height)
                    }, this, {
                        single: true
                    })
                }
            }
            this.onBodyResize(a, b)
        }
        this.syncShadow();
        Ext.Panel.superclass.onResize.call(this, f, d, c, e)
    },
    onBodyResize: function(a, b) {
        this.fireEvent("bodyresize", this, a, b)
    },
    getToolbarHeight: function() {
        var a = 0;
        if (this.rendered) {
            Ext.each(this.toolbars, function(b) {
                a += b.getHeight()
            }, this)
        }
        return a
    },
    adjustBodyHeight: function(a) {
        return a
    },
    adjustBodyWidth: function(a) {
        return a
    },
    onPosition: function() {
        this.syncShadow()
    },
    getFrameWidth: function() {
        var b = this.el.getFrameWidth("lr") + this.bwrap.getFrameWidth("lr");
        if (this.frame) {
            var a = this.bwrap.dom.firstChild;
            b += (Ext.fly(a).getFrameWidth("l") + Ext.fly(a.firstChild).getFrameWidth("r"));
            b += this.mc.getFrameWidth("lr")
        }
        return b
    },
    getFrameHeight: function() {
        var a = this.el.getFrameWidth("tb") + this.bwrap.getFrameWidth("tb");
        a += (this.tbar ? this.tbar.getHeight() : 0) + (this.bbar ? this.bbar.getHeight() : 0);
        if (this.frame) {
            a += this.el.dom.firstChild.offsetHeight + this.ft.dom.offsetHeight + this.mc.getFrameWidth("tb")
        } else {
            a += (this.header ? this.header.getHeight() : 0) + (this.footer ? this.footer.getHeight() : 0)
        }
        return a
    },
    getInnerWidth: function() {
        return this.getSize().width - this.getFrameWidth()
    },
    getInnerHeight: function() {
        return this.body.getHeight()
    },
    syncShadow: function() {
        if (this.floating) {
            this.el.sync(true)
        }
    },
    getLayoutTarget: function() {
        return this.body
    },
    getContentTarget: function() {
        return this.body
    },
    setTitle: function(b, a) {
        this.title = b;
        if (this.header && this.headerAsText) {
            this.header.child("span").update(b)
        }
        if (a) {
            this.setIconClass(a)
        }
        this.fireEvent("titlechange", this, b);
        return this
    },
    getUpdater: function() {
        return this.body.getUpdater()
    },
    load: function() {
        var a = this.body.getUpdater();
        a.update.apply(a, arguments);
        return this
    },
    beforeDestroy: function() {
        Ext.Panel.superclass.beforeDestroy.call(this);
        if (this.header) {
            this.header.removeAllListeners()
        }
        if (this.tools) {
            for (var a in this.tools) {
                Ext.destroy(this.tools[a])
            }
        }
        if (this.toolbars.length > 0) {
            Ext.each(this.toolbars, function(b) {
                b.un("afterlayout", this.syncHeight, this);
                b.un("remove", this.syncHeight, this)
            }, this)
        }
        if (Ext.isArray(this.buttons)) {
            while (this.buttons.length) {
                Ext.destroy(this.buttons[0])
            }
        }
        if (this.rendered) {
            Ext.destroy(this.ft, this.header, this.footer, this.tbar, this.bbar, this.body, this.mc, this.bwrap, this.dd);
            if (this.fbar) {
                Ext.destroy(this.fbar, this.fbar.el)
            }
        }
        Ext.destroy(this.toolbars)
    },
    createClasses: function() {
        this.headerCls = this.baseCls + "-header";
        this.headerTextCls = this.baseCls + "-header-text";
        this.bwrapCls = this.baseCls + "-bwrap";
        this.tbarCls = this.baseCls + "-tbar";
        this.bodyCls = this.baseCls + "-body";
        this.bbarCls = this.baseCls + "-bbar";
        this.footerCls = this.baseCls + "-footer"
    },
    createGhost: function(a, e, b) {
        var d = document.createElement("div");
        d.className = "x-panel-ghost " + (a ? a : "");
        if (this.header) {
            d.appendChild(this.el.dom.firstChild.cloneNode(true))
        }
        Ext.fly(d.appendChild(document.createElement("ul"))).setHeight(this.bwrap.getHeight());
        d.style.width = this.el.dom.offsetWidth + "px";
        if (!b) {
            this.container.dom.appendChild(d)
        } else {
            Ext.getDom(b).appendChild(d)
        } if (e !== false && this.el.useShim !== false) {
            var c = new Ext.Layer({
                shadow: false,
                useDisplay: true,
                constrain: false
            }, d);
            c.show();
            return c
        } else {
            return new Ext.Element(d)
        }
    },
    doAutoLoad: function() {
        var a = this.body.getUpdater();
        if (this.renderer) {
            a.setRenderer(this.renderer)
        }
        a.update(Ext.isObject(this.autoLoad) ? this.autoLoad : {
            url: this.autoLoad
        })
    },
    getTool: function(a) {
        return this.tools[a]
    }
});
Ext.reg("panel", Ext.Panel);
Ext.Editor = function(b, a) {
    if (b.field) {
        this.field = Ext.create(b.field, "textfield");
        a = Ext.apply({}, b);
        delete a.field
    } else {
        this.field = b
    }
    Ext.Editor.superclass.constructor.call(this, a)
};
Ext.extend(Ext.Editor, Ext.Component, {
    allowBlur: true,
    value: "",
    alignment: "c-c?",
    offsets: [0, 0],
    shadow: "frame",
    constrain: false,
    swallowKeys: true,
    completeOnEnter: true,
    cancelOnEsc: true,
    updateEl: false,
    initComponent: function() {
        Ext.Editor.superclass.initComponent.call(this);
        this.addEvents("beforestartedit", "startedit", "beforecomplete", "complete", "canceledit", "specialkey")
    },
    onRender: function(b, a) {
        this.el = new Ext.Layer({
            shadow: this.shadow,
            cls: "x-editor",
            parentEl: b,
            shim: this.shim,
            shadowOffset: this.shadowOffset || 4,
            id: this.id,
            constrain: this.constrain
        });
        if (this.zIndex) {
            this.el.setZIndex(this.zIndex)
        }
        this.el.setStyle("overflow", Ext.isGecko ? "auto" : "hidden");
        if (this.field.msgTarget != "title") {
            this.field.msgTarget = "qtip"
        }
        this.field.inEditor = true;
        this.mon(this.field, {
            scope: this,
            blur: this.onBlur,
            specialkey: this.onSpecialKey
        });
        if (this.field.grow) {
            this.mon(this.field, "autosize", this.el.sync, this.el, {
                delay: 1
            })
        }
        this.field.render(this.el).show();
        this.field.getEl().dom.name = "";
        if (this.swallowKeys) {
            this.field.el.swallowEvent(["keypress", "keydown"])
        }
    },
    onSpecialKey: function(f, d) {
        var b = d.getKey(),
            a = this.completeOnEnter && b == d.ENTER,
            c = this.cancelOnEsc && b == d.ESC;
        if (a || c) {
            d.stopEvent();
            if (a) {
                this.completeEdit()
            } else {
                this.cancelEdit()
            } if (f.triggerBlur) {
                f.triggerBlur()
            }
        }
        this.fireEvent("specialkey", f, d)
    },
    startEdit: function(b, c) {
        if (this.editing) {
            this.completeEdit()
        }
        this.boundEl = Ext.get(b);
        var a = c !== undefined ? c : this.boundEl.dom.innerHTML;
        if (!this.rendered) {
            this.render(this.parentEl || document.body)
        }
        if (this.fireEvent("beforestartedit", this, this.boundEl, a) !== false) {
            this.startValue = a;
            this.field.reset();
            this.field.setValue(a);
            this.realign(true);
            this.editing = true;
            this.show()
        }
    },
    doAutoSize: function() {
        if (this.autoSize) {
            var b = this.boundEl.getSize(),
                a = this.field.getSize();
            switch (this.autoSize) {
                case "width":
                    this.setSize(b.width, a.height);
                    break;
                case "height":
                    this.setSize(a.width, b.height);
                    break;
                case "none":
                    this.setSize(a.width, a.height);
                    break;
                default:
                    this.setSize(b.width, b.height)
            }
        }
    },
    setSize: function(a, b) {
        delete this.field.lastSize;
        this.field.setSize(a, b);
        if (this.el) {
            if (Ext.isGecko2 || Ext.isOpera || (Ext.isIE7 && Ext.isStrict)) {
                this.el.setSize(a, b)
            }
            this.el.sync()
        }
    },
    realign: function(a) {
        if (a === true) {
            this.doAutoSize()
        }
        this.el.alignTo(this.boundEl, this.alignment, this.offsets)
    },
    completeEdit: function(a) {
        if (!this.editing) {
            return
        }
        if (this.field.assertValue) {
            this.field.assertValue()
        }
        var b = this.getValue();
        if (!this.field.isValid()) {
            if (this.revertInvalid !== false) {
                this.cancelEdit(a)
            }
            return
        }
        if (String(b) === String(this.startValue) && this.ignoreNoChange) {
            this.hideEdit(a);
            return
        }
        if (this.fireEvent("beforecomplete", this, b, this.startValue) !== false) {
            b = this.getValue();
            if (this.updateEl && this.boundEl) {
                this.boundEl.update(b)
            }
            this.hideEdit(a);
            this.fireEvent("complete", this, b, this.startValue)
        }
    },
    onShow: function() {
        this.el.show();
        if (this.hideEl !== false) {
            this.boundEl.hide()
        }
        this.field.show().focus(false, true);
        this.fireEvent("startedit", this.boundEl, this.startValue)
    },
    cancelEdit: function(a) {
        if (this.editing) {
            var b = this.getValue();
            this.setValue(this.startValue);
            this.hideEdit(a);
            this.fireEvent("canceledit", this, b, this.startValue)
        }
    },
    hideEdit: function(a) {
        if (a !== true) {
            this.editing = false;
            this.hide()
        }
    },
    onBlur: function() {
        if (this.allowBlur === true && this.editing && this.selectSameEditor !== true) {
            this.completeEdit()
        }
    },
    onHide: function() {
        if (this.editing) {
            this.completeEdit();
            return
        }
        this.field.blur();
        if (this.field.collapse) {
            this.field.collapse()
        }
        this.el.hide();
        if (this.hideEl !== false) {
            this.boundEl.show()
        }
    },
    setValue: function(a) {
        this.field.setValue(a)
    },
    getValue: function() {
        return this.field.getValue()
    },
    beforeDestroy: function() {
        Ext.destroyMembers(this, "field");
        delete this.parentEl;
        delete this.boundEl
    }
});
Ext.reg("editor", Ext.Editor);
Ext.ColorPalette = Ext.extend(Ext.Component, {
    itemCls: "x-color-palette",
    value: null,
    clickEvent: "click",
    ctype: "Ext.ColorPalette",
    allowReselect: false,
    colors: ["000000", "993300", "333300", "003300", "003366", "000080", "333399", "333333", "800000", "FF6600", "808000", "008000", "008080", "0000FF", "666699", "808080", "FF0000", "FF9900", "99CC00", "339966", "33CCCC", "3366FF", "800080", "969696", "FF00FF", "FFCC00", "FFFF00", "00FF00", "00FFFF", "00CCFF", "993366", "C0C0C0", "FF99CC", "FFCC99", "FFFF99", "CCFFCC", "CCFFFF", "99CCFF", "CC99FF", "FFFFFF"],
    initComponent: function() {
        Ext.ColorPalette.superclass.initComponent.call(this);
        this.addEvents("select");
        if (this.handler) {
            this.on("select", this.handler, this.scope, true)
        }
    },
    onRender: function(b, a) {
        this.autoEl = {
            tag: "div",
            cls: this.itemCls
        };
        Ext.ColorPalette.superclass.onRender.call(this, b, a);
        var c = this.tpl || new Ext.XTemplate('<tpl for="."><a href="#" class="color-{.}" hidefocus="on"><em><span style="background:#{.}" unselectable="on">&#160;</span></em></a></tpl>');
        c.overwrite(this.el, this.colors);
        this.mon(this.el, this.clickEvent, this.handleClick, this, {
            delegate: "a"
        });
        if (this.clickEvent != "click") {
            this.mon(this.el, "click", Ext.emptyFn, this, {
                delegate: "a",
                preventDefault: true
            })
        }
    },
    afterRender: function() {
        Ext.ColorPalette.superclass.afterRender.call(this);
        if (this.value) {
            var a = this.value;
            this.value = null;
            this.select(a, true)
        }
    },
    handleClick: function(b, a) {
        b.preventDefault();
        if (!this.disabled) {
            var d = a.className.match(/(?:^|\s)color-(.{6})(?:\s|$)/)[1];
            this.select(d.toUpperCase())
        }
    },
    select: function(b, a) {
        b = b.replace("#", "");
        if (b != this.value || this.allowReselect) {
            var c = this.el;
            if (this.value) {
                c.child("a.color-" + this.value).removeClass("x-color-palette-sel")
            }
            c.child("a.color-" + b).addClass("x-color-palette-sel");
            this.value = b;
            if (a !== true) {
                this.fireEvent("select", this, b)
            }
        }
    }
});
Ext.reg("colorpalette", Ext.ColorPalette);
Ext.DatePicker = Ext.extend(Ext.BoxComponent, {
    todayText: "Today",
    okText: "&#160;OK&#160;",
    cancelText: "Cancel",
    todayTip: "{0} (Spacebar)",
    minText: "This date is before the minimum date",
    maxText: "This date is after the maximum date",
    format: "m/d/y",
    disabledDaysText: "Disabled",
    disabledDatesText: "Disabled",
    monthNames: Date.monthNames,
    dayNames: Date.dayNames,
    nextText: "Next Month (Control+Right)",
    prevText: "Previous Month (Control+Left)",
    monthYearText: "Choose a month (Control+Up/Down to move years)",
    startDay: 0,
    showToday: true,
    focusOnSelect: true,
    initHour: 12,
    initComponent: function() {
        Ext.DatePicker.superclass.initComponent.call(this);
        this.value = this.value ? this.value.clearTime(true) : new Date().clearTime();
        this.addEvents("select");
        if (this.handler) {
            this.on("select", this.handler, this.scope || this)
        }
        this.initDisabledDays()
    },
    initDisabledDays: function() {
        if (!this.disabledDatesRE && this.disabledDates) {
            var b = this.disabledDates,
                a = b.length - 1,
                c = "(?:";
            Ext.each(b, function(f, e) {
                c += Ext.isDate(f) ? "^" + Ext.escapeRe(f.dateFormat(this.format)) + "$" : b[e];
                if (e != a) {
                    c += "|"
                }
            }, this);
            this.disabledDatesRE = new RegExp(c + ")")
        }
    },
    setDisabledDates: function(a) {
        if (Ext.isArray(a)) {
            this.disabledDates = a;
            this.disabledDatesRE = null
        } else {
            this.disabledDatesRE = a
        }
        this.initDisabledDays();
        this.update(this.value, true)
    },
    setDisabledDays: function(a) {
        this.disabledDays = a;
        this.update(this.value, true)
    },
    setMinDate: function(a) {
        this.minDate = a;
        this.update(this.value, true)
    },
    setMaxDate: function(a) {
        this.maxDate = a;
        this.update(this.value, true)
    },
    setValue: function(a) {
        this.value = a.clearTime(true);
        this.update(this.value)
    },
    getValue: function() {
        return this.value
    },
    focus: function() {
        this.update(this.activeDate)
    },
    onEnable: function(a) {
        Ext.DatePicker.superclass.onEnable.call(this);
        this.doDisabled(false);
        this.update(a ? this.value : this.activeDate);
        if (Ext.isIE) {
            this.el.repaint()
        }
    },
    onDisable: function() {
        Ext.DatePicker.superclass.onDisable.call(this);
        this.doDisabled(true);
        if (Ext.isIE && !Ext.isIE8) {
            Ext.each([].concat(this.textNodes, this.el.query("th span")), function(a) {
                Ext.fly(a).repaint()
            })
        }
    },
    doDisabled: function(a) {
        this.keyNav.setDisabled(a);
        this.prevRepeater.setDisabled(a);
        this.nextRepeater.setDisabled(a);
        if (this.showToday) {
            this.todayKeyListener.setDisabled(a);
            this.todayBtn.setDisabled(a)
        }
    },
    onRender: function(e, b) {
        var a = ['<table cellspacing="0">', '<tr><td class="x-date-left"><a href="#" title="', this.prevText, '">&#160;</a></td><td class="x-date-middle" align="center"></td><td class="x-date-right"><a href="#" title="', this.nextText, '">&#160;</a></td></tr>', '<tr><td colspan="3"><table class="x-date-inner" cellspacing="0"><thead><tr>'],
            c = this.dayNames,
            g;
        for (g = 0; g < 7; g++) {
            var j = this.startDay + g;
            if (j > 6) {
                j = j - 7
            }
            a.push("<th><span>", c[j].substr(0, 1), "</span></th>")
        }
        a[a.length] = "</tr></thead><tbody><tr>";
        for (g = 0; g < 42; g++) {
            if (g % 7 === 0 && g !== 0) {
                a[a.length] = "</tr><tr>"
            }
            a[a.length] = '<td><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span></span></em></a></td>'
        }
        a.push("</tr></tbody></table></td></tr>", this.showToday ? '<tr><td colspan="3" class="x-date-bottom" align="center"></td></tr>' : "", '</table><div class="x-date-mp"></div>');
        var h = document.createElement("div");
        h.className = "x-date-picker";
        h.innerHTML = a.join("");
        e.dom.insertBefore(h, b);
        this.el = Ext.get(h);
        this.eventEl = Ext.get(h.firstChild);
        this.prevRepeater = new Ext.util.ClickRepeater(this.el.child("td.x-date-left a"), {
            handler: this.showPrevMonth,
            scope: this,
            preventDefault: true,
            stopDefault: true
        });
        this.nextRepeater = new Ext.util.ClickRepeater(this.el.child("td.x-date-right a"), {
            handler: this.showNextMonth,
            scope: this,
            preventDefault: true,
            stopDefault: true
        });
        this.monthPicker = this.el.down("div.x-date-mp");
        this.monthPicker.enableDisplayMode("block");
        this.keyNav = new Ext.KeyNav(this.eventEl, {
            left: function(d) {
                if (d.ctrlKey) {
                    this.showPrevMonth()
                } else {
                    this.update(this.activeDate.add("d", -1))
                }
            },
            right: function(d) {
                if (d.ctrlKey) {
                    this.showNextMonth()
                } else {
                    this.update(this.activeDate.add("d", 1))
                }
            },
            up: function(d) {
                if (d.ctrlKey) {
                    this.showNextYear()
                } else {
                    this.update(this.activeDate.add("d", -7))
                }
            },
            down: function(d) {
                if (d.ctrlKey) {
                    this.showPrevYear()
                } else {
                    this.update(this.activeDate.add("d", 7))
                }
            },
            pageUp: function(d) {
                this.showNextMonth()
            },
            pageDown: function(d) {
                this.showPrevMonth()
            },
            enter: function(d) {
                d.stopPropagation();
                return true
            },
            scope: this
        });
        this.el.unselectable();
        this.cells = this.el.select("table.x-date-inner tbody td");
        this.textNodes = this.el.query("table.x-date-inner tbody span");
        this.mbtn = new Ext.Button({
            text: "&#160;",
            tooltip: this.monthYearText,
            renderTo: this.el.child("td.x-date-middle", true)
        });
        this.mbtn.el.child("em").addClass("x-btn-arrow");
        if (this.showToday) {
            this.todayKeyListener = this.eventEl.addKeyListener(Ext.EventObject.SPACE, this.selectToday, this);
            var f = (new Date()).dateFormat(this.format);
            this.todayBtn = new Ext.Button({
                renderTo: this.el.child("td.x-date-bottom", true),
                text: String.format(this.todayText, f),
                tooltip: String.format(this.todayTip, f),
                handler: this.selectToday,
                scope: this
            })
        }
        this.mon(this.eventEl, "mousewheel", this.handleMouseWheel, this);
        this.mon(this.eventEl, "click", this.handleDateClick, this, {
            delegate: "a.x-date-date"
        });
        this.mon(this.mbtn, "click", this.showMonthPicker, this);
        this.onEnable(true)
    },
    createMonthPicker: function() {
        if (!this.monthPicker.dom.firstChild) {
            var a = ['<table border="0" cellspacing="0">'];
            for (var b = 0; b < 6; b++) {
                a.push('<tr><td class="x-date-mp-month"><a href="#">', Date.getShortMonthName(b), "</a></td>", '<td class="x-date-mp-month x-date-mp-sep"><a href="#">', Date.getShortMonthName(b + 6), "</a></td>", b === 0 ? '<td class="x-date-mp-ybtn" align="center"><a class="x-date-mp-prev"></a></td><td class="x-date-mp-ybtn" align="center"><a class="x-date-mp-next"></a></td></tr>' : '<td class="x-date-mp-year"><a href="#"></a></td><td class="x-date-mp-year"><a href="#"></a></td></tr>')
            }
            a.push('<tr class="x-date-mp-btns"><td colspan="4"><button type="button" class="x-date-mp-ok">', this.okText, '</button><button type="button" class="x-date-mp-cancel">', this.cancelText, "</button></td></tr>", "</table>");
            this.monthPicker.update(a.join(""));
            this.mon(this.monthPicker, "click", this.onMonthClick, this);
            this.mon(this.monthPicker, "dblclick", this.onMonthDblClick, this);
            this.mpMonths = this.monthPicker.select("td.x-date-mp-month");
            this.mpYears = this.monthPicker.select("td.x-date-mp-year");
            this.mpMonths.each(function(c, d, e) {
                e += 1;
                if ((e % 2) === 0) {
                    c.dom.xmonth = 5 + Math.round(e * 0.5)
                } else {
                    c.dom.xmonth = Math.round((e - 1) * 0.5)
                }
            })
        }
    },
    showMonthPicker: function() {
        if (!this.disabled) {
            this.createMonthPicker();
            var a = this.el.getSize();
            this.monthPicker.setSize(a);
            this.monthPicker.child("table").setSize(a);
            this.mpSelMonth = (this.activeDate || this.value).getMonth();
            this.updateMPMonth(this.mpSelMonth);
            this.mpSelYear = (this.activeDate || this.value).getFullYear();
            this.updateMPYear(this.mpSelYear);
            this.monthPicker.slideIn("t", {
                duration: 0.2
            })
        }
    },
    updateMPYear: function(e) {
        this.mpyear = e;
        var c = this.mpYears.elements;
        for (var b = 1; b <= 10; b++) {
            var d = c[b - 1],
                a;
            if ((b % 2) === 0) {
                a = e + Math.round(b * 0.5);
                d.firstChild.innerHTML = a;
                d.xyear = a
            } else {
                a = e - (5 - Math.round(b * 0.5));
                d.firstChild.innerHTML = a;
                d.xyear = a
            }
            this.mpYears.item(b - 1)[a == this.mpSelYear ? "addClass" : "removeClass"]("x-date-mp-sel")
        }
    },
    updateMPMonth: function(a) {
        this.mpMonths.each(function(b, c, d) {
            b[b.dom.xmonth == a ? "addClass" : "removeClass"]("x-date-mp-sel")
        })
    },
    selectMPMonth: function(a) {},
    onMonthClick: function(f, b) {
        f.stopEvent();
        var c = new Ext.Element(b),
            a;
        if (c.is("button.x-date-mp-cancel")) {
            this.hideMonthPicker()
        } else {
            if (c.is("button.x-date-mp-ok")) {
                var g = new Date(this.mpSelYear, this.mpSelMonth, (this.activeDate || this.value).getDate());
                if (g.getMonth() != this.mpSelMonth) {
                    g = new Date(this.mpSelYear, this.mpSelMonth, 1).getLastDateOfMonth()
                }
                this.update(g);
                this.hideMonthPicker()
            } else {
                if ((a = c.up("td.x-date-mp-month", 2))) {
                    this.mpMonths.removeClass("x-date-mp-sel");
                    a.addClass("x-date-mp-sel");
                    this.mpSelMonth = a.dom.xmonth
                } else {
                    if ((a = c.up("td.x-date-mp-year", 2))) {
                        this.mpYears.removeClass("x-date-mp-sel");
                        a.addClass("x-date-mp-sel");
                        this.mpSelYear = a.dom.xyear
                    } else {
                        if (c.is("a.x-date-mp-prev")) {
                            this.updateMPYear(this.mpyear - 10)
                        } else {
                            if (c.is("a.x-date-mp-next")) {
                                this.updateMPYear(this.mpyear + 10)
                            }
                        }
                    }
                }
            }
        }
    },
    onMonthDblClick: function(d, b) {
        d.stopEvent();
        var c = new Ext.Element(b),
            a;
        if ((a = c.up("td.x-date-mp-month", 2))) {
            this.update(new Date(this.mpSelYear, a.dom.xmonth, (this.activeDate || this.value).getDate()));
            this.hideMonthPicker()
        } else {
            if ((a = c.up("td.x-date-mp-year", 2))) {
                this.update(new Date(a.dom.xyear, this.mpSelMonth, (this.activeDate || this.value).getDate()));
                this.hideMonthPicker()
            }
        }
    },
    hideMonthPicker: function(a) {
        if (this.monthPicker) {
            if (a === true) {
                this.monthPicker.hide()
            } else {
                this.monthPicker.slideOut("t", {
                    duration: 0.2
                })
            }
        }
    },
    showPrevMonth: function(a) {
        this.update(this.activeDate.add("mo", -1))
    },
    showNextMonth: function(a) {
        this.update(this.activeDate.add("mo", 1))
    },
    showPrevYear: function() {
        this.update(this.activeDate.add("y", -1))
    },
    showNextYear: function() {
        this.update(this.activeDate.add("y", 1))
    },
    handleMouseWheel: function(a) {
        a.stopEvent();
        if (!this.disabled) {
            var b = a.getWheelDelta();
            if (b > 0) {
                this.showPrevMonth()
            } else {
                if (b < 0) {
                    this.showNextMonth()
                }
            }
        }
    },
    handleDateClick: function(b, a) {
        b.stopEvent();
        if (!this.disabled && a.dateValue && !Ext.fly(a.parentNode).hasClass("x-date-disabled")) {
            this.cancelFocus = this.focusOnSelect === false;
            this.setValue(new Date(a.dateValue));
            delete this.cancelFocus;
            this.fireEvent("select", this, this.value)
        }
    },
    selectToday: function() {
        if (this.todayBtn && !this.todayBtn.disabled) {
            this.setValue(new Date().clearTime());
            this.fireEvent("select", this, this.value)
        }
    },
    update: function(F, z) {
        if (this.rendered) {
            var a = this.activeDate,
                o = this.isVisible();
            this.activeDate = F;
            if (!z && a && this.el) {
                var n = F.getTime();
                if (a.getMonth() == F.getMonth() && a.getFullYear() == F.getFullYear()) {
                    this.cells.removeClass("x-date-selected");
                    this.cells.each(function(d) {
                        if (d.dom.firstChild.dateValue == n) {
                            d.addClass("x-date-selected");
                            if (o && !this.cancelFocus) {
                                Ext.fly(d.dom.firstChild).focus(50)
                            }
                            return false
                        }
                    }, this);
                    return
                }
            }
            var j = F.getDaysInMonth(),
                p = F.getFirstDateOfMonth(),
                f = p.getDay() - this.startDay;
            if (f < 0) {
                f += 7
            }
            j += f;
            var A = F.add("mo", -1),
                g = A.getDaysInMonth() - f,
                e = this.cells.elements,
                q = this.textNodes,
                C = (new Date(A.getFullYear(), A.getMonth(), g, this.initHour)),
                B = new Date().clearTime().getTime(),
                u = F.clearTime(true).getTime(),
                s = this.minDate ? this.minDate.clearTime(true) : Number.NEGATIVE_INFINITY,
                x = this.maxDate ? this.maxDate.clearTime(true) : Number.POSITIVE_INFINITY,
                E = this.disabledDatesRE,
                r = this.disabledDatesText,
                H = this.disabledDays ? this.disabledDays.join("") : false,
                D = this.disabledDaysText,
                y = this.format;
            if (this.showToday) {
                var l = new Date().clearTime(),
                    c = (l < s || l > x || (E && y && E.test(l.dateFormat(y))) || (H && H.indexOf(l.getDay()) != -1));
                if (!this.disabled) {
                    this.todayBtn.setDisabled(c);
                    this.todayKeyListener[c ? "disable" : "enable"]()
                }
            }
            var k = function(I, d) {
                d.title = "";
                var i = C.clearTime(true).getTime();
                d.firstChild.dateValue = i;
                if (i == B) {
                    d.className += " x-date-today";
                    d.title = I.todayText
                }
                if (i == u) {
                    d.className += " x-date-selected";
                    if (o) {
                        Ext.fly(d.firstChild).focus(50)
                    }
                }
                if (i < s) {
                    d.className = " x-date-disabled";
                    d.title = I.minText;
                    return
                }
                if (i > x) {
                    d.className = " x-date-disabled";
                    d.title = I.maxText;
                    return
                }
                if (H) {
                    if (H.indexOf(C.getDay()) != -1) {
                        d.title = D;
                        d.className = " x-date-disabled"
                    }
                }
                if (E && y) {
                    var w = C.dateFormat(y);
                    if (E.test(w)) {
                        d.title = r.replace("%0", w);
                        d.className = " x-date-disabled"
                    }
                }
            };
            var v = 0;
            for (; v < f; v++) {
                q[v].innerHTML = (++g);
                C.setDate(C.getDate() + 1);
                e[v].className = "x-date-prevday";
                k(this, e[v])
            }
            for (; v < j; v++) {
                var b = v - f + 1;
                q[v].innerHTML = (b);
                C.setDate(C.getDate() + 1);
                e[v].className = "x-date-active";
                k(this, e[v])
            }
            var G = 0;
            for (; v < 42; v++) {
                q[v].innerHTML = (++G);
                C.setDate(C.getDate() + 1);
                e[v].className = "x-date-nextday";
                k(this, e[v])
            }
            this.mbtn.setText(this.monthNames[F.getMonth()] + " " + F.getFullYear());
            if (!this.internalRender) {
                var h = this.el.dom.firstChild,
                    m = h.offsetWidth;
                this.el.setWidth(m + this.el.getBorderWidth("lr"));
                Ext.fly(h).setWidth(m);
                this.internalRender = true;
                if (Ext.isOpera && !this.secondPass) {
                    h.rows[0].cells[1].style.width = (m - (h.rows[0].cells[0].offsetWidth + h.rows[0].cells[2].offsetWidth)) + "px";
                    this.secondPass = true;
                    this.update.defer(10, this, [F])
                }
            }
        }
    },
    beforeDestroy: function() {
        if (this.rendered) {
            Ext.destroy(this.keyNav, this.monthPicker, this.eventEl, this.mbtn, this.nextRepeater, this.prevRepeater, this.cells.el, this.todayBtn);
            delete this.textNodes;
            delete this.cells.elements
        }
    }
});
Ext.reg("datepicker", Ext.DatePicker);
Ext.LoadMask = function(c, b) {
    this.el = Ext.get(c);
    Ext.apply(this, b);
    if (this.store) {
        this.store.on({
            scope: this,
            beforeload: this.onBeforeLoad,
            load: this.onLoad,
            exception: this.onLoad
        });
        this.removeMask = Ext.value(this.removeMask, false)
    } else {
        var a = this.el.getUpdater();
        a.showLoadIndicator = false;
        a.on({
            scope: this,
            beforeupdate: this.onBeforeLoad,
            update: this.onLoad,
            failure: this.onLoad
        });
        this.removeMask = Ext.value(this.removeMask, true)
    }
};
Ext.LoadMask.prototype = {
    msg: "Loading...",
    msgCls: "x-mask-loading",
    disabled: false,
    disable: function() {
        this.disabled = true
    },
    enable: function() {
        this.disabled = false
    },
    onLoad: function() {
        this.el.unmask(this.removeMask)
    },
    onBeforeLoad: function() {
        if (!this.disabled) {
            this.el.mask(this.msg, this.msgCls)
        }
    },
    show: function() {
        this.onBeforeLoad()
    },
    hide: function() {
        this.onLoad()
    },
    destroy: function() {
        if (this.store) {
            this.store.un("beforeload", this.onBeforeLoad, this);
            this.store.un("load", this.onLoad, this);
            this.store.un("exception", this.onLoad, this)
        } else {
            var a = this.el.getUpdater();
            a.un("beforeupdate", this.onBeforeLoad, this);
            a.un("update", this.onLoad, this);
            a.un("failure", this.onLoad, this)
        }
    }
};
Ext.ns("Ext.slider");
Ext.slider.Thumb = Ext.extend(Object, {
    dragging: false,
    constructor: function(a) {
        Ext.apply(this, a || {}, {
            cls: "x-slider-thumb",
            constrain: false
        });
        Ext.slider.Thumb.superclass.constructor.call(this, a);
        if (this.slider.vertical) {
            Ext.apply(this, Ext.slider.Thumb.Vertical)
        }
    },
    render: function() {
        this.el = this.slider.innerEl.insertFirst({
            cls: this.cls
        });
        this.initEvents()
    },
    enable: function() {
        this.disabled = false;
        this.el.removeClass(this.slider.disabledClass)
    },
    disable: function() {
        this.disabled = true;
        this.el.addClass(this.slider.disabledClass)
    },
    initEvents: function() {
        var a = this.el;
        a.addClassOnOver("x-slider-thumb-over");
        this.tracker = new Ext.dd.DragTracker({
            onBeforeStart: this.onBeforeDragStart.createDelegate(this),
            onStart: this.onDragStart.createDelegate(this),
            onDrag: this.onDrag.createDelegate(this),
            onEnd: this.onDragEnd.createDelegate(this),
            tolerance: 3,
            autoStart: 300
        });
        this.tracker.initEl(a)
    },
    onBeforeDragStart: function(a) {
        if (this.disabled) {
            return false
        } else {
            this.slider.promoteThumb(this);
            return true
        }
    },
    onDragStart: function(a) {
        this.el.addClass("x-slider-thumb-drag");
        this.dragging = true;
        this.dragStartValue = this.value;
        this.slider.fireEvent("dragstart", this.slider, a, this)
    },
    onDrag: function(f) {
        var c = this.slider,
            b = this.index,
            d = this.getNewValue();
        if (this.constrain) {
            var a = c.thumbs[b + 1],
                g = c.thumbs[b - 1];
            if (g != undefined && d <= g.value) {
                d = g.value
            }
            if (a != undefined && d >= a.value) {
                d = a.value
            }
        }
        c.setValue(b, d, false);
        c.fireEvent("drag", c, f, this)
    },
    getNewValue: function() {
        var a = this.slider,
            b = a.innerEl.translatePoints(this.tracker.getXY());
        return Ext.util.Format.round(a.reverseValue(b.left), a.decimalPrecision)
    },
    onDragEnd: function(c) {
        var a = this.slider,
            b = this.value;
        this.el.removeClass("x-slider-thumb-drag");
        this.dragging = false;
        a.fireEvent("dragend", a, c);
        if (this.dragStartValue != b) {
            a.fireEvent("changecomplete", a, b, this)
        }
    },
    destroy: function() {
        Ext.destroyMembers(this, "tracker", "el")
    }
});
Ext.slider.MultiSlider = Ext.extend(Ext.BoxComponent, {
    vertical: false,
    minValue: 0,
    maxValue: 100,
    decimalPrecision: 0,
    keyIncrement: 1,
    increment: 0,
    clickRange: [5, 15],
    clickToChange: true,
    animate: true,
    constrainThumbs: true,
    topThumbZIndex: 10000,
    initComponent: function() {
        if (!Ext.isDefined(this.value)) {
            this.value = this.minValue
        }
        this.thumbs = [];
        Ext.slider.MultiSlider.superclass.initComponent.call(this);
        this.keyIncrement = Math.max(this.increment, this.keyIncrement);
        this.addEvents("beforechange", "change", "changecomplete", "dragstart", "drag", "dragend");
        if (this.values == undefined || Ext.isEmpty(this.values)) {
            this.values = [0]
        }
        var a = this.values;
        for (var b = 0; b < a.length; b++) {
            this.addThumb(a[b])
        }
        if (this.vertical) {
            Ext.apply(this, Ext.slider.Vertical)
        }
    },
    addThumb: function(b) {
        var a = new Ext.slider.Thumb({
            value: b,
            slider: this,
            index: this.thumbs.length,
            constrain: this.constrainThumbs
        });
        this.thumbs.push(a);
        if (this.rendered) {
            a.render()
        }
    },
    promoteThumb: function(d) {
        var a = this.thumbs,
            f, b;
        for (var e = 0, c = a.length; e < c; e++) {
            b = a[e];
            if (b == d) {
                f = this.topThumbZIndex
            } else {
                f = ""
            }
            b.el.setStyle("zIndex", f)
        }
    },
    onRender: function() {
        this.autoEl = {
            cls: "x-slider " + (this.vertical ? "x-slider-vert" : "x-slider-horz"),
            cn: {
                cls: "x-slider-end",
                cn: {
                    cls: "x-slider-inner",
                    cn: [{
                        tag: "a",
                        cls: "x-slider-focus",
                        href: "#",
                        tabIndex: "-1",
                        hidefocus: "on"
                    }]
                }
            }
        };
        Ext.slider.MultiSlider.superclass.onRender.apply(this, arguments);
        this.endEl = this.el.first();
        this.innerEl = this.endEl.first();
        this.focusEl = this.innerEl.child(".x-slider-focus");
        for (var b = 0; b < this.thumbs.length; b++) {
            this.thumbs[b].render()
        }
        var a = this.innerEl.child(".x-slider-thumb");
        this.halfThumb = (this.vertical ? a.getHeight() : a.getWidth()) / 2;
        this.initEvents()
    },
    initEvents: function() {
        this.mon(this.el, {
            scope: this,
            mousedown: this.onMouseDown,
            keydown: this.onKeyDown
        });
        this.focusEl.swallowEvent("click", true)
    },
    onMouseDown: function(d) {
        if (this.disabled) {
            return
        }
        var c = false;
        for (var b = 0; b < this.thumbs.length; b++) {
            c = c || d.target == this.thumbs[b].el.dom
        }
        if (this.clickToChange && !c) {
            var a = this.innerEl.translatePoints(d.getXY());
            this.onClickChange(a)
        }
        this.focus()
    },
    onClickChange: function(c) {
        if (c.top > this.clickRange[0] && c.top < this.clickRange[1]) {
            var a = this.getNearest(c, "left"),
                b = a.index;
            this.setValue(b, Ext.util.Format.round(this.reverseValue(c.left), this.decimalPrecision), undefined, true)
        }
    },
    getNearest: function(j, b) {
        var l = b == "top" ? this.innerEl.getHeight() - j[b] : j[b],
            f = this.reverseValue(l),
            h = (this.maxValue - this.minValue) + 5,
            e = 0,
            c = null;
        for (var d = 0; d < this.thumbs.length; d++) {
            var a = this.thumbs[d],
                k = a.value,
                g = Math.abs(k - f);
            if (Math.abs(g <= h)) {
                c = a;
                e = d;
                h = g
            }
        }
        return c
    },
    onKeyDown: function(b) {
        if (this.disabled || this.thumbs.length !== 1) {
            b.preventDefault();
            return
        }
        var a = b.getKey(),
            c;
        switch (a) {
            case b.UP:
            case b.RIGHT:
                b.stopEvent();
                c = b.ctrlKey ? this.maxValue : this.getValue(0) + this.keyIncrement;
                this.setValue(0, c, undefined, true);
                break;
            case b.DOWN:
            case b.LEFT:
                b.stopEvent();
                c = b.ctrlKey ? this.minValue : this.getValue(0) - this.keyIncrement;
                this.setValue(0, c, undefined, true);
                break;
            default:
                b.preventDefault()
        }
    },
    doSnap: function(b) {
        if (!(this.increment && b)) {
            return b
        }
        var d = b,
            c = this.increment,
            a = b % c;
        if (a != 0) {
            d -= a;
            if (a * 2 >= c) {
                d += c
            } else {
                if (a * 2 < -c) {
                    d -= c
                }
            }
        }
        return d.constrain(this.minValue, this.maxValue)
    },
    afterRender: function() {
        Ext.slider.MultiSlider.superclass.afterRender.apply(this, arguments);
        for (var c = 0; c < this.thumbs.length; c++) {
            var b = this.thumbs[c];
            if (b.value !== undefined) {
                var a = this.normalizeValue(b.value);
                if (a !== b.value) {
                    this.setValue(c, a, false)
                } else {
                    this.moveThumb(c, this.translateValue(a), false)
                }
            }
        }
    },
    getRatio: function() {
        var a = this.innerEl.getWidth(),
            b = this.maxValue - this.minValue;
        return b == 0 ? a : (a / b)
    },
    normalizeValue: function(a) {
        a = this.doSnap(a);
        a = Ext.util.Format.round(a, this.decimalPrecision);
        a = a.constrain(this.minValue, this.maxValue);
        return a
    },
    setMinValue: function(e) {
        this.minValue = e;
        var d = 0,
            b = this.thumbs,
            a = b.length,
            c;
        for (; d < a; ++d) {
            c = b[d];
            c.value = c.value < e ? e : c.value
        }
        this.syncThumb()
    },
    setMaxValue: function(e) {
        this.maxValue = e;
        var d = 0,
            b = this.thumbs,
            a = b.length,
            c;
        for (; d < a; ++d) {
            c = b[d];
            c.value = c.value > e ? e : c.value
        }
        this.syncThumb()
    },
    setValue: function(d, c, b, f) {
        var a = this.thumbs[d],
            e = a.el;
        c = this.normalizeValue(c);
        if (c !== a.value && this.fireEvent("beforechange", this, c, a.value, a) !== false) {
            a.value = c;
            if (this.rendered) {
                this.moveThumb(d, this.translateValue(c), b !== false);
                this.fireEvent("change", this, c, a);
                if (f) {
                    this.fireEvent("changecomplete", this, c, a)
                }
            }
        }
    },
    translateValue: function(a) {
        var b = this.getRatio();
        return (a * b) - (this.minValue * b) - this.halfThumb
    },
    reverseValue: function(b) {
        var a = this.getRatio();
        return (b + (this.minValue * a)) / a
    },
    moveThumb: function(d, c, b) {
        var a = this.thumbs[d].el;
        if (!b || this.animate === false) {
            a.setLeft(c)
        } else {
            a.shift({
                left: c,
                stopFx: true,
                duration: 0.35
            })
        }
    },
    focus: function() {
        this.focusEl.focus(10)
    },
    onResize: function(c, e) {
        var b = this.thumbs,
            a = b.length,
            d = 0;
        for (; d < a; ++d) {
            b[d].el.stopFx()
        }
        if (Ext.isNumber(c)) {
            this.innerEl.setWidth(c - (this.el.getPadding("l") + this.endEl.getPadding("r")))
        }
        this.syncThumb();
        Ext.slider.MultiSlider.superclass.onResize.apply(this, arguments)
    },
    onDisable: function() {
        Ext.slider.MultiSlider.superclass.onDisable.call(this);
        for (var b = 0; b < this.thumbs.length; b++) {
            var a = this.thumbs[b],
                c = a.el;
            a.disable();
            if (Ext.isIE) {
                var d = c.getXY();
                c.hide();
                this.innerEl.addClass(this.disabledClass).dom.disabled = true;
                if (!this.thumbHolder) {
                    this.thumbHolder = this.endEl.createChild({
                        cls: "x-slider-thumb " + this.disabledClass
                    })
                }
                this.thumbHolder.show().setXY(d)
            }
        }
    },
    onEnable: function() {
        Ext.slider.MultiSlider.superclass.onEnable.call(this);
        for (var b = 0; b < this.thumbs.length; b++) {
            var a = this.thumbs[b],
                c = a.el;
            a.enable();
            if (Ext.isIE) {
                this.innerEl.removeClass(this.disabledClass).dom.disabled = false;
                if (this.thumbHolder) {
                    this.thumbHolder.hide()
                }
                c.show();
                this.syncThumb()
            }
        }
    },
    syncThumb: function() {
        if (this.rendered) {
            for (var a = 0; a < this.thumbs.length; a++) {
                this.moveThumb(a, this.translateValue(this.thumbs[a].value))
            }
        }
    },
    getValue: function(a) {
        return this.thumbs[a].value
    },
    getValues: function() {
        var a = [];
        for (var b = 0; b < this.thumbs.length; b++) {
            a.push(this.thumbs[b].value)
        }
        return a
    },
    beforeDestroy: function() {
        var b = this.thumbs;
        for (var c = 0, a = b.length; c < a; ++c) {
            b[c].destroy();
            b[c] = null
        }
        Ext.destroyMembers(this, "endEl", "innerEl", "focusEl", "thumbHolder");
        Ext.slider.MultiSlider.superclass.beforeDestroy.call(this)
    }
});
Ext.reg("multislider", Ext.slider.MultiSlider);
Ext.slider.SingleSlider = Ext.extend(Ext.slider.MultiSlider, {
    constructor: function(a) {
        a = a || {};
        Ext.applyIf(a, {
            values: [a.value || 0]
        });
        Ext.slider.SingleSlider.superclass.constructor.call(this, a)
    },
    getValue: function() {
        return Ext.slider.SingleSlider.superclass.getValue.call(this, 0)
    },
    setValue: function(d, b) {
        var c = Ext.toArray(arguments),
            a = c.length;
        if (a == 1 || (a <= 3 && typeof arguments[1] != "number")) {
            c.unshift(0)
        }
        return Ext.slider.SingleSlider.superclass.setValue.apply(this, c)
    },
    syncThumb: function() {
        return Ext.slider.SingleSlider.superclass.syncThumb.apply(this, [0].concat(arguments))
    },
    getNearest: function() {
        return this.thumbs[0]
    }
});
Ext.Slider = Ext.slider.SingleSlider;
Ext.reg("slider", Ext.slider.SingleSlider);
Ext.slider.Vertical = {
    onResize: function(a, b) {
        this.innerEl.setHeight(b - (this.el.getPadding("t") + this.endEl.getPadding("b")));
        this.syncThumb()
    },
    getRatio: function() {
        var b = this.innerEl.getHeight(),
            a = this.maxValue - this.minValue;
        return b / a
    },
    moveThumb: function(d, c, b) {
        var a = this.thumbs[d],
            e = a.el;
        if (!b || this.animate === false) {
            e.setBottom(c)
        } else {
            e.shift({
                bottom: c,
                stopFx: true,
                duration: 0.35
            })
        }
    },
    onClickChange: function(c) {
        if (c.left > this.clickRange[0] && c.left < this.clickRange[1]) {
            var a = this.getNearest(c, "top"),
                b = a.index,
                d = this.minValue + this.reverseValue(this.innerEl.getHeight() - c.top);
            this.setValue(b, Ext.util.Format.round(d, this.decimalPrecision), undefined, true)
        }
    }
};
Ext.slider.Thumb.Vertical = {
    getNewValue: function() {
        var b = this.slider,
            c = b.innerEl,
            d = c.translatePoints(this.tracker.getXY()),
            a = c.getHeight() - d.top;
        return b.minValue + Ext.util.Format.round(a / b.getRatio(), b.decimalPrecision)
    }
};
Ext.ProgressBar = Ext.extend(Ext.BoxComponent, {
    baseCls: "x-progress",
    animate: false,
    waitTimer: null,
    initComponent: function() {
        Ext.ProgressBar.superclass.initComponent.call(this);
        this.addEvents("update")
    },
    onRender: function(d, a) {
        var c = new Ext.Template('<div class="{cls}-wrap">', '<div class="{cls}-inner">', '<div class="{cls}-bar">', '<div class="{cls}-text">', "<div>&#160;</div>", "</div>", "</div>", '<div class="{cls}-text {cls}-text-back">', "<div>&#160;</div>", "</div>", "</div>", "</div>");
        this.el = a ? c.insertBefore(a, {
            cls: this.baseCls
        }, true) : c.append(d, {
            cls: this.baseCls
        }, true);
        if (this.id) {
            this.el.dom.id = this.id
        }
        var b = this.el.dom.firstChild;
        this.progressBar = Ext.get(b.firstChild);
        if (this.textEl) {
            this.textEl = Ext.get(this.textEl);
            delete this.textTopEl
        } else {
            this.textTopEl = Ext.get(this.progressBar.dom.firstChild);
            var e = Ext.get(b.childNodes[1]);
            this.textTopEl.setStyle("z-index", 99).addClass("x-hidden");
            this.textEl = new Ext.CompositeElement([this.textTopEl.dom.firstChild, e.dom.firstChild]);
            this.textEl.setWidth(b.offsetWidth)
        }
        this.progressBar.setHeight(b.offsetHeight)
    },
    afterRender: function() {
        Ext.ProgressBar.superclass.afterRender.call(this);
        if (this.value) {
            this.updateProgress(this.value, this.text)
        } else {
            this.updateText(this.text)
        }
    },
    updateProgress: function(c, d, b) {
        this.value = c || 0;
        if (d) {
            this.updateText(d)
        }
        if (this.rendered && !this.isDestroyed) {
            var a = Math.floor(c * this.el.dom.firstChild.offsetWidth);
            this.progressBar.setWidth(a, b === true || (b !== false && this.animate));
            if (this.textTopEl) {
                this.textTopEl.removeClass("x-hidden").setWidth(a)
            }
        }
        this.fireEvent("update", this, c, d);
        return this
    },
    wait: function(b) {
        if (!this.waitTimer) {
            var a = this;
            b = b || {};
            this.updateText(b.text);
            this.waitTimer = Ext.TaskMgr.start({
                run: function(c) {
                    var d = b.increment || 10;
                    c -= 1;
                    this.updateProgress(((((c + d) % d) + 1) * (100 / d)) * 0.01, null, b.animate)
                },
                interval: b.interval || 1000,
                duration: b.duration,
                onStop: function() {
                    if (b.fn) {
                        b.fn.apply(b.scope || this)
                    }
                    this.reset()
                },
                scope: a
            })
        }
        return this
    },
    isWaiting: function() {
        return this.waitTimer !== null
    },
    updateText: function(a) {
        this.text = a || "&#160;";
        if (this.rendered) {
            this.textEl.update(this.text)
        }
        return this
    },
    syncProgressBar: function() {
        if (this.value) {
            this.updateProgress(this.value, this.text)
        }
        return this
    },
    setSize: function(a, c) {
        Ext.ProgressBar.superclass.setSize.call(this, a, c);
        if (this.textTopEl) {
            var b = this.el.dom.firstChild;
            this.textEl.setSize(b.offsetWidth, b.offsetHeight)
        }
        this.syncProgressBar();
        return this
    },
    reset: function(a) {
        this.updateProgress(0);
        if (this.textTopEl) {
            this.textTopEl.addClass("x-hidden")
        }
        this.clearTimer();
        if (a === true) {
            this.hide()
        }
        return this
    },
    clearTimer: function() {
        if (this.waitTimer) {
            this.waitTimer.onStop = null;
            Ext.TaskMgr.stop(this.waitTimer);
            this.waitTimer = null
        }
    },
    onDestroy: function() {
        this.clearTimer();
        if (this.rendered) {
            if (this.textEl.isComposite) {
                this.textEl.clear()
            }
            Ext.destroyMembers(this, "textEl", "progressBar", "textTopEl")
        }
        Ext.ProgressBar.superclass.onDestroy.call(this)
    }
});
Ext.reg("progress", Ext.ProgressBar);
