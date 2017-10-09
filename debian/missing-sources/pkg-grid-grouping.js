/*
 * Ext JS Library 3.3.1
 * Copyright(c) 2006-2010 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
Ext.grid.GroupingView = Ext.extend(Ext.grid.GridView, {
    groupByText: "Group By This Field",
    showGroupsText: "Show in Groups",
    hideGroupedColumn: false,
    showGroupName: true,
    startCollapsed: false,
    enableGrouping: true,
    enableGroupingMenu: true,
    enableNoGroups: true,
    emptyGroupText: "(None)",
    ignoreAdd: false,
    groupTextTpl: "{text}",
    groupMode: "value",
    cancelEditOnToggle: true,
    initTemplates: function() {
        Ext.grid.GroupingView.superclass.initTemplates.call(this);
        this.state = {};
        var a = this.grid.getSelectionModel();
        a.on(a.selectRow ? "beforerowselect" : "beforecellselect", this.onBeforeRowSelect, this);
        if (!this.startGroup) {
            this.startGroup = new Ext.XTemplate('<div id="{groupId}" class="x-grid-group {cls}">', '<div id="{groupId}-hd" class="x-grid-group-hd" style="{style}"><div class="x-grid-group-title">', this.groupTextTpl, "</div></div>", '<div id="{groupId}-bd" class="x-grid-group-body">')
        }
        this.startGroup.compile();
        if (!this.endGroup) {
            this.endGroup = "</div></div>"
        }
    },
    findGroup: function(a) {
        return Ext.fly(a).up(".x-grid-group", this.mainBody.dom)
    },
    getGroups: function() {
        return this.hasRows() ? this.mainBody.dom.childNodes : []
    },
    onAdd: function(d, a, b) {
        if (this.canGroup() && !this.ignoreAdd) {
            var c = this.getScrollState();
            this.fireEvent("beforerowsinserted", d, b, b + (a.length - 1));
            this.refresh();
            this.restoreScroll(c);
            this.fireEvent("rowsinserted", d, b, b + (a.length - 1))
        } else {
            if (!this.canGroup()) {
                Ext.grid.GroupingView.superclass.onAdd.apply(this, arguments)
            }
        }
    },
    onRemove: function(e, a, b, d) {
        Ext.grid.GroupingView.superclass.onRemove.apply(this, arguments);
        var c = document.getElementById(a._groupId);
        if (c && c.childNodes[1].childNodes.length < 1) {
            Ext.removeNode(c)
        }
        this.applyEmptyText()
    },
    refreshRow: function(a) {
        if (this.ds.getCount() == 1) {
            this.refresh()
        } else {
            this.isUpdating = true;
            Ext.grid.GroupingView.superclass.refreshRow.apply(this, arguments);
            this.isUpdating = false
        }
    },
    beforeMenuShow: function() {
        var c, a = this.hmenu.items,
            b = this.cm.config[this.hdCtxIndex].groupable === false;
        if ((c = a.get("groupBy"))) {
            c.setDisabled(b)
        }
        if ((c = a.get("showGroups"))) {
            c.setDisabled(b);
            c.setChecked(this.canGroup(), true)
        }
    },
    renderUI: function() {
        var a = Ext.grid.GroupingView.superclass.renderUI.call(this);
        if (this.enableGroupingMenu && this.hmenu) {
            this.hmenu.add("-", {
                itemId: "groupBy",
                text: this.groupByText,
                handler: this.onGroupByClick,
                scope: this,
                iconCls: "x-group-by-icon"
            });
            if (this.enableNoGroups) {
                this.hmenu.add({
                    itemId: "showGroups",
                    text: this.showGroupsText,
                    checked: true,
                    checkHandler: this.onShowGroupsClick,
                    scope: this
                })
            }
            this.hmenu.on("beforeshow", this.beforeMenuShow, this)
        }
        return a
    },
    processEvent: function(b, h) {
        Ext.grid.GroupingView.superclass.processEvent.call(this, b, h);
        var g = h.getTarget(".x-grid-group-hd", this.mainBody);
        if (g) {
            var f = this.getGroupField(),
                d = this.getPrefix(f),
                a = g.id.substring(d.length),
                c = new RegExp("gp-" + Ext.escapeRe(f) + "--hd");
            a = a.substr(0, a.length - 3);
            if (a || c.test(g.id)) {
                this.grid.fireEvent("group" + b, this.grid, f, a, h)
            }
            if (b == "mousedown" && h.button == 0) {
                this.toggleGroup(g.parentNode)
            }
        }
    },
    onGroupByClick: function() {
        var a = this.grid;
        this.enableGrouping = true;
        a.store.groupBy(this.cm.getDataIndex(this.hdCtxIndex));
        a.fireEvent("groupchange", a, a.store.getGroupState());
        this.beforeMenuShow();
        this.refresh()
    },
    onShowGroupsClick: function(a, b) {
        this.enableGrouping = b;
        if (b) {
            this.onGroupByClick()
        } else {
            this.grid.store.clearGrouping();
            this.grid.fireEvent("groupchange", this, null)
        }
    },
    toggleRowIndex: function(c, a) {
        if (!this.canGroup()) {
            return
        }
        var b = this.getRow(c);
        if (b) {
            this.toggleGroup(this.findGroup(b), a)
        }
    },
    toggleGroup: function(c, b) {
        var a = Ext.get(c);
        b = Ext.isDefined(b) ? b : a.hasClass("x-grid-group-collapsed");
        if (this.state[a.id] !== b) {
            if (this.cancelEditOnToggle !== false) {
                this.grid.stopEditing(true)
            }
            this.state[a.id] = b;
            a[b ? "removeClass" : "addClass"]("x-grid-group-collapsed")
        }
    },
    toggleAllGroups: function(c) {
        var b = this.getGroups();
        for (var d = 0, a = b.length; d < a; d++) {
            this.toggleGroup(b[d], c)
        }
    },
    expandAllGroups: function() {
        this.toggleAllGroups(true)
    },
    collapseAllGroups: function() {
        this.toggleAllGroups(false)
    },
    getGroup: function(a, e, h, i, b, f) {
        var c = this.cm.config[b],
            d = h ? h.call(c.scope, a, {}, e, i, b, f) : String(a);
        if (d === "" || d === "&#160;") {
            d = c.emptyGroupText || this.emptyGroupText
        }
        return d
    },
    getGroupField: function() {
        return this.grid.store.getGroupState()
    },
    afterRender: function() {
        if (!this.ds || !this.cm) {
            return
        }
        Ext.grid.GroupingView.superclass.afterRender.call(this);
        if (this.grid.deferRowRender) {
            this.updateGroupWidths()
        }
    },
    afterRenderUI: function() {
        Ext.grid.GroupingView.superclass.afterRenderUI.call(this);
        if (this.enableGroupingMenu && this.hmenu) {
            this.hmenu.add("-", {
                itemId: "groupBy",
                text: this.groupByText,
                handler: this.onGroupByClick,
                scope: this,
                iconCls: "x-group-by-icon"
            });
            if (this.enableNoGroups) {
                this.hmenu.add({
                    itemId: "showGroups",
                    text: this.showGroupsText,
                    checked: true,
                    checkHandler: this.onShowGroupsClick,
                    scope: this
                })
            }
            this.hmenu.on("beforeshow", this.beforeMenuShow, this)
        }
    },
    renderRows: function() {
        var a = this.getGroupField();
        var e = !!a;
        if (this.hideGroupedColumn) {
            var b = this.cm.findColumnIndex(a),
                d = Ext.isDefined(this.lastGroupField);
            if (!e && d) {
                this.mainBody.update("");
                this.cm.setHidden(this.cm.findColumnIndex(this.lastGroupField), false);
                delete this.lastGroupField
            } else {
                if (e && !d) {
                    this.lastGroupField = a;
                    this.cm.setHidden(b, true)
                } else {
                    if (e && d && a !== this.lastGroupField) {
                        this.mainBody.update("");
                        var c = this.cm.findColumnIndex(this.lastGroupField);
                        this.cm.setHidden(c, false);
                        this.lastGroupField = a;
                        this.cm.setHidden(b, true)
                    }
                }
            }
        }
        return Ext.grid.GroupingView.superclass.renderRows.apply(this, arguments)
    },
    doRender: function(c, f, p, a, o, q) {
        if (f.length < 1) {
            return ""
        }
        if (!this.canGroup() || this.isUpdating) {
            return Ext.grid.GroupingView.superclass.doRender.apply(this, arguments)
        }
        var y = this.getGroupField(),
            n = this.cm.findColumnIndex(y),
            v, h = "width:" + this.getTotalWidth() + ";",
            e = this.cm.config[n],
            b = e.groupRenderer || e.renderer,
            s = this.showGroupName ? (e.groupName || e.header) + ": " : "",
            x = [],
            k, t, u, m;
        for (t = 0, u = f.length; t < u; t++) {
            var j = a + t,
                l = f[t],
                d = l.data[y];
            v = this.getGroup(d, l, b, j, n, p);
            if (!k || k.group != v) {
                m = this.constructId(d, y, n);
                this.state[m] = !(Ext.isDefined(this.state[m]) ? !this.state[m] : this.startCollapsed);
                k = {
                    group: v,
                    gvalue: d,
                    text: s + v,
                    groupId: m,
                    startRow: j,
                    rs: [l],
                    cls: this.state[m] ? "" : "x-grid-group-collapsed",
                    style: h
                };
                x.push(k)
            } else {
                k.rs.push(l)
            }
            l._groupId = m
        }
        var w = [];
        for (t = 0, u = x.length; t < u; t++) {
            v = x[t];
            this.doGroupStart(w, v, c, p, o);
            w[w.length] = Ext.grid.GroupingView.superclass.doRender.call(this, c, v.rs, p, v.startRow, o, q);
            this.doGroupEnd(w, v, c, p, o)
        }
        return w.join("")
    },
    getGroupId: function(a) {
        var b = this.getGroupField();
        return this.constructId(a, b, this.cm.findColumnIndex(b))
    },
    constructId: function(c, e, a) {
        var b = this.cm.config[a],
            d = b.groupRenderer || b.renderer,
            f = (this.groupMode == "value") ? c : this.getGroup(c, {
                data: {}
            }, d, 0, a, this.ds);
        return this.getPrefix(e) + Ext.util.Format.htmlEncode(f)
    },
    canGroup: function() {
        return this.enableGrouping && !!this.getGroupField()
    },
    getPrefix: function(a) {
        return this.grid.getGridEl().id + "-gp-" + a + "-"
    },
    doGroupStart: function(a, d, b, e, c) {
        a[a.length] = this.startGroup.apply(d)
    },
    doGroupEnd: function(a, d, b, e, c) {
        a[a.length] = this.endGroup
    },
    getRows: function() {
        if (!this.canGroup()) {
            return Ext.grid.GroupingView.superclass.getRows.call(this)
        }
        var h = [],
            c = this.getGroups(),
            f, e = 0,
            a = c.length,
            d, b;
        for (; e < a; ++e) {
            f = c[e].childNodes[1];
            if (f) {
                f = f.childNodes;
                for (d = 0, b = f.length; d < b; ++d) {
                    h[h.length] = f[d]
                }
            }
        }
        return h
    },
    updateGroupWidths: function() {
        if (!this.canGroup() || !this.hasRows()) {
            return
        }
        var c = Math.max(this.cm.getTotalWidth(), this.el.dom.offsetWidth - this.getScrollOffset()) + "px";
        var b = this.getGroups();
        for (var d = 0, a = b.length; d < a; d++) {
            b[d].firstChild.style.width = c
        }
    },
    onColumnWidthUpdated: function(c, a, b) {
        Ext.grid.GroupingView.superclass.onColumnWidthUpdated.call(this, c, a, b);
        this.updateGroupWidths()
    },
    onAllColumnWidthsUpdated: function(a, b) {
        Ext.grid.GroupingView.superclass.onAllColumnWidthsUpdated.call(this, a, b);
        this.updateGroupWidths()
    },
    onColumnHiddenUpdated: function(b, c, a) {
        Ext.grid.GroupingView.superclass.onColumnHiddenUpdated.call(this, b, c, a);
        this.updateGroupWidths()
    },
    onLayout: function() {
        this.updateGroupWidths()
    },
    onBeforeRowSelect: function(b, a) {
        this.toggleRowIndex(a, true)
    }
});
Ext.grid.GroupingView.GROUP_ID = 1000;
