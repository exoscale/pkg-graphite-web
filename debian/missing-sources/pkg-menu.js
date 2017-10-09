/*
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.menu.Menu = Ext.extend(Ext.Container, {
    minWidth: 120,
    shadow: "sides",
    subMenuAlign: "tl-tr?",
    defaultAlign: "tl-bl?",
    allowOtherMenus: false,
    ignoreParentClicks: false,
    enableScrolling: true,
    maxHeight: null,
    scrollIncrement: 24,
    showSeparator: true,
    defaultOffsets: [0, 0],
    plain: false,
    floating: true,
    zIndex: 15000,
    hidden: true,
    layout: "menu",
    hideMode: "offsets",
    scrollerHeight: 8,
    autoLayout: true,
    defaultType: "menuitem",
    bufferResize: false,
    initComponent: function() {
        if (Ext.isArray(this.initialConfig)) {
            Ext.apply(this, {
                items: this.initialConfig
            })
        }
        this.addEvents("click", "mouseover", "mouseout", "itemclick");
        Ext.menu.MenuMgr.register(this);
        if (this.floating) {
            Ext.EventManager.onWindowResize(this.hide, this)
        } else {
            if (this.initialConfig.hidden !== false) {
                this.hidden = false
            }
            this.internalDefaults = {
                hideOnClick: false
            }
        }
        Ext.menu.Menu.superclass.initComponent.call(this);
        if (this.autoLayout) {
            var a = this.doLayout.createDelegate(this, []);
            this.on({
                add: a,
                remove: a
            })
        }
    },
    getLayoutTarget: function() {
        return this.ul
    },
    onRender: function(b, a) {
        if (!b) {
            b = Ext.getBody()
        }
        var c = {
            id: this.getId(),
            cls: "x-menu " + ((this.floating) ? "x-menu-floating x-layer " : "") + (this.cls || "") + (this.plain ? " x-menu-plain" : "") + (this.showSeparator ? "" : " x-menu-nosep"),
            style: this.style,
            cn: [{
                tag: "a",
                cls: "x-menu-focus",
                href: "#",
                onclick: "return false;",
                tabIndex: "-1"
            }, {
                tag: "ul",
                cls: "x-menu-list"
            }]
        };
        if (this.floating) {
            this.el = new Ext.Layer({
                shadow: this.shadow,
                dh: c,
                constrain: false,
                parentEl: b,
                zindex: this.zIndex
            })
        } else {
            this.el = b.createChild(c)
        }
        Ext.menu.Menu.superclass.onRender.call(this, b, a);
        if (!this.keyNav) {
            this.keyNav = new Ext.menu.MenuNav(this)
        }
        this.focusEl = this.el.child("a.x-menu-focus");
        this.ul = this.el.child("ul.x-menu-list");
        this.mon(this.ul, {
            scope: this,
            click: this.onClick,
            mouseover: this.onMouseOver,
            mouseout: this.onMouseOut
        });
        if (this.enableScrolling) {
            this.mon(this.el, {
                scope: this,
                delegate: ".x-menu-scroller",
                click: this.onScroll,
                mouseover: this.deactivateActive
            })
        }
    },
    findTargetItem: function(b) {
        var a = b.getTarget(".x-menu-list-item", this.ul, true);
        if (a && a.menuItemId) {
            return this.items.get(a.menuItemId)
        }
    },
    onClick: function(b) {
        var a = this.findTargetItem(b);
        if (a) {
            if (a.isFormField) {
                this.setActiveItem(a)
            } else {
                if (a instanceof Ext.menu.BaseItem) {
                    if (a.menu && this.ignoreParentClicks) {
                        a.expandMenu();
                        b.preventDefault()
                    } else {
                        if (a.onClick) {
                            a.onClick(b);
                            this.fireEvent("click", this, a, b)
                        }
                    }
                }
            }
        }
    },
    setActiveItem: function(a, b) {
        if (a != this.activeItem) {
            this.deactivateActive();
            if ((this.activeItem = a).isFormField) {
                a.focus()
            } else {
                a.activate(b)
            }
        } else {
            if (b) {
                a.expandMenu()
            }
        }
    },
    deactivateActive: function() {
        var b = this.activeItem;
        if (b) {
            if (b.isFormField) {
                if (b.collapse) {
                    b.collapse()
                }
            } else {
                b.deactivate()
            }
            delete this.activeItem
        }
    },
    tryActivate: function(f, e) {
        var b = this.items;
        for (var c = f, a = b.length; c >= 0 && c < a; c += e) {
            var d = b.get(c);
            if (d.isVisible() && !d.disabled && (d.canActivate || d.isFormField)) {
                this.setActiveItem(d, false);
                return d
            }
        }
        return false
    },
    onMouseOver: function(b) {
        var a = this.findTargetItem(b);
        if (a) {
            if (a.canActivate && !a.disabled) {
                this.setActiveItem(a, true)
            }
        }
        this.over = true;
        this.fireEvent("mouseover", this, b, a)
    },
    onMouseOut: function(b) {
        var a = this.findTargetItem(b);
        if (a) {
            if (a == this.activeItem && a.shouldDeactivate && a.shouldDeactivate(b)) {
                this.activeItem.deactivate();
                delete this.activeItem
            }
        }
        this.over = false;
        this.fireEvent("mouseout", this, b, a)
    },
    onScroll: function(d, b) {
        if (d) {
            d.stopEvent()
        }
        var a = this.ul.dom,
            c = Ext.fly(b).is(".x-menu-scroller-top");
        a.scrollTop += this.scrollIncrement * (c ? -1 : 1);
        if (c ? a.scrollTop <= 0 : a.scrollTop + this.activeMax >= a.scrollHeight) {
            this.onScrollerOut(null, b)
        }
    },
    onScrollerIn: function(d, b) {
        var a = this.ul.dom,
            c = Ext.fly(b).is(".x-menu-scroller-top");
        if (c ? a.scrollTop > 0 : a.scrollTop + this.activeMax < a.scrollHeight) {
            Ext.fly(b).addClass(["x-menu-item-active", "x-menu-scroller-active"])
        }
    },
    onScrollerOut: function(b, a) {
        Ext.fly(a).removeClass(["x-menu-item-active", "x-menu-scroller-active"])
    },
    show: function(b, c, a) {
        if (this.floating) {
            this.parentMenu = a;
            if (!this.el) {
                this.render();
                this.doLayout(false, true)
            }
            this.showAt(this.el.getAlignToXY(b, c || this.defaultAlign, this.defaultOffsets), a)
        } else {
            Ext.menu.Menu.superclass.show.call(this)
        }
    },
    showAt: function(b, a) {
        if (this.fireEvent("beforeshow", this) !== false) {
            this.parentMenu = a;
            if (!this.el) {
                this.render()
            }
            if (this.enableScrolling) {
                this.el.setXY(b);
                b[1] = this.constrainScroll(b[1]);
                b = [this.el.adjustForConstraints(b)[0], b[1]]
            } else {
                b = this.el.adjustForConstraints(b)
            }
            this.el.setXY(b);
            this.el.show();
            Ext.menu.Menu.superclass.onShow.call(this);
            if (Ext.isIE) {
                this.fireEvent("autosize", this);
                if (!Ext.isIE8) {
                    this.el.repaint()
                }
            }
            this.hidden = false;
            this.focus();
            this.fireEvent("show", this)
        }
    },
    constrainScroll: function(h) {
        var b, d = this.ul.setHeight("auto").getHeight(),
            a = h,
            g, e, f, c;
        if (this.floating) {
            e = Ext.fly(this.el.dom.parentNode);
            f = e.getScroll().top;
            c = e.getViewSize().height;
            g = h - f;
            b = this.maxHeight ? this.maxHeight : c - g;
            if (d > c) {
                b = c;
                a = h - g
            } else {
                if (b < d) {
                    a = h - (d - b);
                    b = d
                }
            }
        } else {
            b = this.getHeight()
        } if (this.maxHeight) {
            b = Math.min(this.maxHeight, b)
        }
        if (d > b && b > 0) {
            this.activeMax = b - this.scrollerHeight * 2 - this.el.getFrameWidth("tb") - Ext.num(this.el.shadowOffset, 0);
            this.ul.setHeight(this.activeMax);
            this.createScrollers();
            this.el.select(".x-menu-scroller").setDisplayed("")
        } else {
            this.ul.setHeight(d);
            this.el.select(".x-menu-scroller").setDisplayed("none")
        }
        this.ul.dom.scrollTop = 0;
        return a
    },
    createScrollers: function() {
        if (!this.scroller) {
            this.scroller = {
                pos: 0,
                top: this.el.insertFirst({
                    tag: "div",
                    cls: "x-menu-scroller x-menu-scroller-top",
                    html: "&#160;"
                }),
                bottom: this.el.createChild({
                    tag: "div",
                    cls: "x-menu-scroller x-menu-scroller-bottom",
                    html: "&#160;"
                })
            };
            this.scroller.top.hover(this.onScrollerIn, this.onScrollerOut, this);
            this.scroller.topRepeater = new Ext.util.ClickRepeater(this.scroller.top, {
                listeners: {
                    click: this.onScroll.createDelegate(this, [null, this.scroller.top], false)
                }
            });
            this.scroller.bottom.hover(this.onScrollerIn, this.onScrollerOut, this);
            this.scroller.bottomRepeater = new Ext.util.ClickRepeater(this.scroller.bottom, {
                listeners: {
                    click: this.onScroll.createDelegate(this, [null, this.scroller.bottom], false)
                }
            })
        }
    },
    onLayout: function() {
        if (this.isVisible()) {
            if (this.enableScrolling) {
                this.constrainScroll(this.el.getTop())
            }
            if (this.floating) {
                this.el.sync()
            }
        }
    },
    focus: function() {
        if (!this.hidden) {
            this.doFocus.defer(50, this)
        }
    },
    doFocus: function() {
        if (!this.hidden) {
            this.focusEl.focus()
        }
    },
    hide: function(a) {
        if (!this.isDestroyed) {
            this.deepHide = a;
            Ext.menu.Menu.superclass.hide.call(this);
            delete this.deepHide
        }
    },
    onHide: function() {
        Ext.menu.Menu.superclass.onHide.call(this);
        this.deactivateActive();
        if (this.el && this.floating) {
            this.el.hide()
        }
        var a = this.parentMenu;
        if (this.deepHide === true && a) {
            if (a.floating) {
                a.hide(true)
            } else {
                a.deactivateActive()
            }
        }
    },
    lookupComponent: function(a) {
        if (Ext.isString(a)) {
            a = (a == "separator" || a == "-") ? new Ext.menu.Separator() : new Ext.menu.TextItem(a);
            this.applyDefaults(a)
        } else {
            if (Ext.isObject(a)) {
                a = this.getMenuItem(a)
            } else {
                if (a.tagName || a.el) {
                    a = new Ext.BoxComponent({
                        el: a
                    })
                }
            }
        }
        return a
    },
    applyDefaults: function(b) {
        if (!Ext.isString(b)) {
            b = Ext.menu.Menu.superclass.applyDefaults.call(this, b);
            var a = this.internalDefaults;
            if (a) {
                if (b.events) {
                    Ext.applyIf(b.initialConfig, a);
                    Ext.apply(b, a)
                } else {
                    Ext.applyIf(b, a)
                }
            }
        }
        return b
    },
    getMenuItem: function(a) {
        if (!a.isXType) {
            if (!a.xtype && Ext.isBoolean(a.checked)) {
                return new Ext.menu.CheckItem(a)
            }
            return Ext.create(a, this.defaultType)
        }
        return a
    },
    addSeparator: function() {
        return this.add(new Ext.menu.Separator())
    },
    addElement: function(a) {
        return this.add(new Ext.menu.BaseItem({
            el: a
        }))
    },
    addItem: function(a) {
        return this.add(a)
    },
    addMenuItem: function(a) {
        return this.add(this.getMenuItem(a))
    },
    addText: function(a) {
        return this.add(new Ext.menu.TextItem(a))
    },
    onDestroy: function() {
        Ext.EventManager.removeResizeListener(this.hide, this);
        var a = this.parentMenu;
        if (a && a.activeChild == this) {
            delete a.activeChild
        }
        delete this.parentMenu;
        Ext.menu.Menu.superclass.onDestroy.call(this);
        Ext.menu.MenuMgr.unregister(this);
        if (this.keyNav) {
            this.keyNav.disable()
        }
        var b = this.scroller;
        if (b) {
            Ext.destroy(b.topRepeater, b.bottomRepeater, b.top, b.bottom)
        }
        Ext.destroy(this.el, this.focusEl, this.ul)
    }
});
Ext.reg("menu", Ext.menu.Menu);
Ext.menu.MenuNav = Ext.extend(Ext.KeyNav, function() {
    function a(d, c) {
        if (!c.tryActivate(c.items.indexOf(c.activeItem) - 1, -1)) {
            c.tryActivate(c.items.length - 1, -1)
        }
    }

    function b(d, c) {
        if (!c.tryActivate(c.items.indexOf(c.activeItem) + 1, 1)) {
            c.tryActivate(0, 1)
        }
    }
    return {
        constructor: function(c) {
            Ext.menu.MenuNav.superclass.constructor.call(this, c.el);
            this.scope = this.menu = c
        },
        doRelay: function(f, d) {
            var c = f.getKey();
            if (this.menu.activeItem && this.menu.activeItem.isFormField && c != f.TAB) {
                return false
            }
            if (!this.menu.activeItem && f.isNavKeyPress() && c != f.SPACE && c != f.RETURN) {
                this.menu.tryActivate(0, 1);
                return false
            }
            return d.call(this.scope || this, f, this.menu)
        },
        tab: function(d, c) {
            d.stopEvent();
            if (d.shiftKey) {
                a(d, c)
            } else {
                b(d, c)
            }
        },
        up: a,
        down: b,
        right: function(d, c) {
            if (c.activeItem) {
                c.activeItem.expandMenu(true)
            }
        },
        left: function(d, c) {
            c.hide();
            if (c.parentMenu && c.parentMenu.activeItem) {
                c.parentMenu.activeItem.activate()
            }
        },
        enter: function(d, c) {
            if (c.activeItem) {
                d.stopPropagation();
                c.activeItem.onClick(d);
                c.fireEvent("click", this, c.activeItem);
                return true
            }
        }
    }
}());
Ext.menu.MenuMgr = function() {
    var f, d, c = {},
        a = false,
        j = new Date();

    function l() {
        f = {};
        d = new Ext.util.MixedCollection();
        Ext.getDoc().addKeyListener(27, function() {
            if (d.length > 0) {
                h()
            }
        })
    }

    function h() {
        if (d && d.length > 0) {
            var m = d.clone();
            m.each(function(n) {
                n.hide()
            });
            return true
        }
        return false
    }

    function e(n) {
        d.remove(n);
        if (d.length < 1) {
            Ext.getDoc().un("mousedown", k);
            a = false
        }
    }

    function i(n) {
        var o = d.last();
        j = new Date();
        d.add(n);
        if (!a) {
            Ext.getDoc().on("mousedown", k);
            a = true
        }
        if (n.parentMenu) {
            n.getEl().setZIndex(parseInt(n.parentMenu.getEl().getStyle("z-index"), 10) + 3);
            n.parentMenu.activeChild = n
        } else {
            if (o && !o.isDestroyed && o.isVisible()) {
                n.getEl().setZIndex(parseInt(o.getEl().getStyle("z-index"), 10) + 3)
            }
        }
    }

    function b(n) {
        if (n.activeChild) {
            n.activeChild.hide()
        }
        if (n.autoHideTimer) {
            clearTimeout(n.autoHideTimer);
            delete n.autoHideTimer
        }
    }

    function g(n) {
        var o = n.parentMenu;
        if (!o && !n.allowOtherMenus) {
            h()
        } else {
            if (o && o.activeChild) {
                o.activeChild.hide()
            }
        }
    }

    function k(m) {
        if (j.getElapsed() > 50 && d.length > 0 && !m.getTarget(".x-menu")) {
            h()
        }
    }
    return {
        hideAll: function() {
            return h()
        },
        register: function(m) {
            if (!f) {
                l()
            }
            f[m.id] = m;
            m.on({
                beforehide: b,
                hide: e,
                beforeshow: g,
                show: i
            })
        },
        get: function(m) {
            if (typeof m == "string") {
                if (!f) {
                    return null
                }
                return f[m]
            } else {
                if (m.events) {
                    return m
                } else {
                    if (typeof m.length == "number") {
                        return new Ext.menu.Menu({
                            items: m
                        })
                    } else {
                        return Ext.create(m, "menu")
                    }
                }
            }
        },
        unregister: function(m) {
            delete f[m.id];
            m.un("beforehide", b);
            m.un("hide", e);
            m.un("beforeshow", g);
            m.un("show", i)
        },
        registerCheckable: function(m) {
            var n = m.group;
            if (n) {
                if (!c[n]) {
                    c[n] = []
                }
                c[n].push(m)
            }
        },
        unregisterCheckable: function(m) {
            var n = m.group;
            if (n) {
                c[n].remove(m)
            }
        },
        onCheckChange: function(o, p) {
            if (o.group && p) {
                var r = c[o.group],
                    n = 0,
                    m = r.length,
                    q;
                for (; n < m; n++) {
                    q = r[n];
                    if (q != o) {
                        q.setChecked(false)
                    }
                }
            }
        },
        getCheckedItem: function(o) {
            var p = c[o];
            if (p) {
                for (var n = 0, m = p.length; n < m; n++) {
                    if (p[n].checked) {
                        return p[n]
                    }
                }
            }
            return null
        },
        setCheckedItem: function(o, q) {
            var p = c[o];
            if (p) {
                for (var n = 0, m = p.length; n < m; n++) {
                    if (p[n].id == q) {
                        p[n].setChecked(true)
                    }
                }
            }
            return null
        }
    }
}();
Ext.menu.BaseItem = Ext.extend(Ext.Component, {
    canActivate: false,
    activeClass: "x-menu-item-active",
    hideOnClick: true,
    clickHideDelay: 1,
    ctype: "Ext.menu.BaseItem",
    actionMode: "container",
    initComponent: function() {
        Ext.menu.BaseItem.superclass.initComponent.call(this);
        this.addEvents("click", "activate", "deactivate");
        if (this.handler) {
            this.on("click", this.handler, this.scope)
        }
    },
    onRender: function(b, a) {
        Ext.menu.BaseItem.superclass.onRender.apply(this, arguments);
        if (this.ownerCt && this.ownerCt instanceof Ext.menu.Menu) {
            this.parentMenu = this.ownerCt
        } else {
            this.container.addClass("x-menu-list-item");
            this.mon(this.el, {
                scope: this,
                click: this.onClick,
                mouseenter: this.activate,
                mouseleave: this.deactivate
            })
        }
    },
    setHandler: function(b, a) {
        if (this.handler) {
            this.un("click", this.handler, this.scope)
        }
        this.on("click", this.handler = b, this.scope = a)
    },
    onClick: function(a) {
        if (!this.disabled && this.fireEvent("click", this, a) !== false && (this.parentMenu && this.parentMenu.fireEvent("itemclick", this, a) !== false)) {
            this.handleClick(a)
        } else {
            a.stopEvent()
        }
    },
    activate: function() {
        if (this.disabled) {
            return false
        }
        var a = this.container;
        a.addClass(this.activeClass);
        this.region = a.getRegion().adjust(2, 2, -2, -2);
        this.fireEvent("activate", this);
        return true
    },
    deactivate: function() {
        this.container.removeClass(this.activeClass);
        this.fireEvent("deactivate", this)
    },
    shouldDeactivate: function(a) {
        return !this.region || !this.region.contains(a.getPoint())
    },
    handleClick: function(b) {
        var a = this.parentMenu;
        if (this.hideOnClick) {
            if (a.floating) {
                a.hide.defer(this.clickHideDelay, a, [true])
            } else {
                a.deactivateActive()
            }
        }
    },
    expandMenu: Ext.emptyFn,
    hideMenu: Ext.emptyFn
});
Ext.reg("menubaseitem", Ext.menu.BaseItem);
Ext.menu.TextItem = Ext.extend(Ext.menu.BaseItem, {
    hideOnClick: false,
    itemCls: "x-menu-text",
    constructor: function(a) {
        if (typeof a == "string") {
            a = {
                text: a
            }
        }
        Ext.menu.TextItem.superclass.constructor.call(this, a)
    },
    onRender: function() {
        var a = document.createElement("span");
        a.className = this.itemCls;
        a.innerHTML = this.text;
        this.el = a;
        Ext.menu.TextItem.superclass.onRender.apply(this, arguments)
    }
});
Ext.reg("menutextitem", Ext.menu.TextItem);
Ext.menu.Separator = Ext.extend(Ext.menu.BaseItem, {
    itemCls: "x-menu-sep",
    hideOnClick: false,
    activeClass: "",
    onRender: function(a) {
        var b = document.createElement("span");
        b.className = this.itemCls;
        b.innerHTML = "&#160;";
        this.el = b;
        a.addClass("x-menu-sep-li");
        Ext.menu.Separator.superclass.onRender.apply(this, arguments)
    }
});
Ext.reg("menuseparator", Ext.menu.Separator);
Ext.menu.Item = Ext.extend(Ext.menu.BaseItem, {
    itemCls: "x-menu-item",
    canActivate: true,
    showDelay: 200,
    altText: "",
    hideDelay: 200,
    ctype: "Ext.menu.Item",
    initComponent: function() {
        Ext.menu.Item.superclass.initComponent.call(this);
        if (this.menu) {
            this.menu = Ext.menu.MenuMgr.get(this.menu);
            this.menu.ownerCt = this
        }
    },
    onRender: function(d, b) {
        if (!this.itemTpl) {
            this.itemTpl = Ext.menu.Item.prototype.itemTpl = new Ext.XTemplate('<a id="{id}" class="{cls}" hidefocus="true" unselectable="on" href="{href}"', '<tpl if="hrefTarget">', ' target="{hrefTarget}"', "</tpl>", ">", '<img alt="{altText}" src="{icon}" class="x-menu-item-icon {iconCls}"/>', '<span class="x-menu-item-text">{text}</span>', "</a>")
        }
        var c = this.getTemplateArgs();
        this.el = b ? this.itemTpl.insertBefore(b, c, true) : this.itemTpl.append(d, c, true);
        this.iconEl = this.el.child("img.x-menu-item-icon");
        this.textEl = this.el.child(".x-menu-item-text");
        if (!this.href) {
            this.mon(this.el, "click", Ext.emptyFn, null, {
                preventDefault: true
            })
        }
        Ext.menu.Item.superclass.onRender.call(this, d, b)
    },
    getTemplateArgs: function() {
        return {
            id: this.id,
            cls: this.itemCls + (this.menu ? " x-menu-item-arrow" : "") + (this.cls ? " " + this.cls : ""),
            href: this.href || "#",
            hrefTarget: this.hrefTarget,
            icon: this.icon || Ext.BLANK_IMAGE_URL,
            iconCls: this.iconCls || "",
            text: this.itemText || this.text || "&#160;",
            altText: this.altText || ""
        }
    },
    setText: function(a) {
        this.text = a || "&#160;";
        if (this.rendered) {
            this.textEl.update(this.text);
            this.parentMenu.layout.doAutoSize()
        }
    },
    setIconClass: function(a) {
        var b = this.iconCls;
        this.iconCls = a;
        if (this.rendered) {
            this.iconEl.replaceClass(b, this.iconCls)
        }
    },
    beforeDestroy: function() {
        if (this.menu) {
            delete this.menu.ownerCt;
            this.menu.destroy()
        }
        Ext.menu.Item.superclass.beforeDestroy.call(this)
    },
    handleClick: function(a) {
        if (!this.href) {
            a.stopEvent()
        }
        Ext.menu.Item.superclass.handleClick.apply(this, arguments)
    },
    activate: function(a) {
        if (Ext.menu.Item.superclass.activate.apply(this, arguments)) {
            this.focus();
            if (a) {
                this.expandMenu()
            }
        }
        return true
    },
    shouldDeactivate: function(a) {
        if (Ext.menu.Item.superclass.shouldDeactivate.call(this, a)) {
            if (this.menu && this.menu.isVisible()) {
                return !this.menu.getEl().getRegion().contains(a.getPoint())
            }
            return true
        }
        return false
    },
    deactivate: function() {
        Ext.menu.Item.superclass.deactivate.apply(this, arguments);
        this.hideMenu()
    },
    expandMenu: function(a) {
        if (!this.disabled && this.menu) {
            clearTimeout(this.hideTimer);
            delete this.hideTimer;
            if (!this.menu.isVisible() && !this.showTimer) {
                this.showTimer = this.deferExpand.defer(this.showDelay, this, [a])
            } else {
                if (this.menu.isVisible() && a) {
                    this.menu.tryActivate(0, 1)
                }
            }
        }
    },
    deferExpand: function(a) {
        delete this.showTimer;
        this.menu.show(this.container, this.parentMenu.subMenuAlign || "tl-tr?", this.parentMenu);
        if (a) {
            this.menu.tryActivate(0, 1)
        }
    },
    hideMenu: function() {
        clearTimeout(this.showTimer);
        delete this.showTimer;
        if (!this.hideTimer && this.menu && this.menu.isVisible()) {
            this.hideTimer = this.deferHide.defer(this.hideDelay, this)
        }
    },
    deferHide: function() {
        delete this.hideTimer;
        if (this.menu.over) {
            this.parentMenu.setActiveItem(this, false)
        } else {
            this.menu.hide()
        }
    }
});
Ext.reg("menuitem", Ext.menu.Item);
Ext.menu.CheckItem = Ext.extend(Ext.menu.Item, {
    itemCls: "x-menu-item x-menu-check-item",
    groupClass: "x-menu-group-item",
    checked: false,
    ctype: "Ext.menu.CheckItem",
    initComponent: function() {
        Ext.menu.CheckItem.superclass.initComponent.call(this);
        this.addEvents("beforecheckchange", "checkchange");
        if (this.checkHandler) {
            this.on("checkchange", this.checkHandler, this.scope)
        }
        Ext.menu.MenuMgr.registerCheckable(this)
    },
    onRender: function(a) {
        Ext.menu.CheckItem.superclass.onRender.apply(this, arguments);
        if (this.group) {
            this.el.addClass(this.groupClass)
        }
        if (this.checked) {
            this.checked = false;
            this.setChecked(true, true)
        }
    },
    destroy: function() {
        Ext.menu.MenuMgr.unregisterCheckable(this);
        Ext.menu.CheckItem.superclass.destroy.apply(this, arguments)
    },
    setChecked: function(b, a) {
        var c = a === true;
        if (this.checked != b && (c || this.fireEvent("beforecheckchange", this, b) !== false)) {
            Ext.menu.MenuMgr.onCheckChange(this, b);
            if (this.container) {
                this.container[b ? "addClass" : "removeClass"]("x-menu-item-checked")
            }
            this.checked = b;
            if (!c) {
                this.fireEvent("checkchange", this, b)
            }
        }
    },
    handleClick: function(a) {
        if (!this.disabled && !(this.checked && this.group)) {
            this.setChecked(!this.checked)
        }
        Ext.menu.CheckItem.superclass.handleClick.apply(this, arguments)
    }
});
Ext.reg("menucheckitem", Ext.menu.CheckItem);
Ext.menu.DateMenu = Ext.extend(Ext.menu.Menu, {
    enableScrolling: false,
    hideOnClick: true,
    pickerId: null,
    cls: "x-date-menu",
    initComponent: function() {
        this.on("beforeshow", this.onBeforeShow, this);
        if (this.strict = (Ext.isIE7 && Ext.isStrict)) {
            this.on("show", this.onShow, this, {
                single: true,
                delay: 20
            })
        }
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: this.picker = new Ext.DatePicker(Ext.applyIf({
                internalRender: this.strict || !Ext.isIE,
                ctCls: "x-menu-date-item",
                id: this.pickerId
            }, this.initialConfig))
        });
        this.picker.purgeListeners();
        Ext.menu.DateMenu.superclass.initComponent.call(this);
        this.relayEvents(this.picker, ["select"]);
        this.on("show", this.picker.focus, this.picker);
        this.on("select", this.menuHide, this);
        if (this.handler) {
            this.on("select", this.handler, this.scope || this)
        }
    },
    menuHide: function() {
        if (this.hideOnClick) {
            this.hide(true)
        }
    },
    onBeforeShow: function() {
        if (this.picker) {
            this.picker.hideMonthPicker(true)
        }
    },
    onShow: function() {
        var a = this.picker.getEl();
        a.setWidth(a.getWidth())
    }
});
Ext.reg("datemenu", Ext.menu.DateMenu);
Ext.menu.ColorMenu = Ext.extend(Ext.menu.Menu, {
    enableScrolling: false,
    hideOnClick: true,
    cls: "x-color-menu",
    paletteId: null,
    initComponent: function() {
        Ext.apply(this, {
            plain: true,
            showSeparator: false,
            items: this.palette = new Ext.ColorPalette(Ext.applyIf({
                id: this.paletteId
            }, this.initialConfig))
        });
        this.palette.purgeListeners();
        Ext.menu.ColorMenu.superclass.initComponent.call(this);
        this.relayEvents(this.palette, ["select"]);
        this.on("select", this.menuHide, this);
        if (this.handler) {
            this.on("select", this.handler, this.scope || this)
        }
    },
    menuHide: function() {
        if (this.hideOnClick) {
            this.hide(true)
        }
    }
});
Ext.reg("colormenu", Ext.menu.ColorMenu);
