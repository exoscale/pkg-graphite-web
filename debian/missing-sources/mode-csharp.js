define("ace/mode/csharp", ["require", "exports", "module", "pilot/oop", "ace/mode/text", "ace/tokenizer", "ace/mode/csharp_highlight_rules", "ace/mode/matching_brace_outdent", "ace/mode/behaviour/cstyle"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("ace/mode/text").Mode,
        f = a("ace/tokenizer").Tokenizer,
        g = a("ace/mode/csharp_highlight_rules").CSharpHighlightRules,
        h = a("ace/mode/matching_brace_outdent").MatchingBraceOutdent,
        i = a("ace/mode/behaviour/cstyle").CstyleBehaviour,
        j = function() {
            this.$tokenizer = new f((new g).getRules()), this.$outdent = new h, this.$behaviour = new i
        };
    d.inherits(j, e),
    function() {
        this.getNextLineIndent = function(a, b, c) {
            var d = this.$getIndent(b),
                e = this.$tokenizer.getLineTokens(b, a),
                f = e.tokens,
                g = e.state;
            if (f.length && f[f.length - 1].type == "comment") return d;
            if (a == "start") {
                var h = b.match(/^.*[\{\(\[]\s*$/);
                h && (d += c)
            }
            return d
        }, this.checkOutdent = function(a, b, c) {
            return this.$outdent.checkOutdent(b, c)
        }, this.autoOutdent = function(a, b, c) {
            this.$outdent.autoOutdent(b, c)
        }, this.createWorker = function(a) {
            return null
        }
    }.call(j.prototype), b.Mode = j
}), define("ace/mode/csharp_highlight_rules", ["require", "exports", "module", "pilot/oop", "pilot/lang", "ace/mode/doc_comment_highlight_rules", "ace/mode/text_highlight_rules"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("pilot/lang"),
        f = a("ace/mode/doc_comment_highlight_rules").DocCommentHighlightRules,
        g = a("ace/mode/text_highlight_rules").TextHighlightRules,
        h = function() {
            var a = e.arrayToMap("abstract|event|new|struct|as|explicit|null|switch|base|extern|object|this|bool|false|operator|throw|break|finally|out|true|byte|fixed|override|try|case|float|params|typeof|catch|for|private|uint|char|foreach|protected|ulong|checked|goto|public|unchecked|class|if|readonly|unsafe|const|implicit|ref|ushort|continue|in|return|using|decimal|int|sbyte|virtual|default|interface|sealed|volatile|delegate|internal|short|void|do|is|sizeof|while|double|lock|stackalloc|else|long|static|enum|namespace|string|var|dynamic".split("|")),
                b = e.arrayToMap("null|true|false".split("|"));
            this.$rules = {
                start: [{
                    token: "comment",
                    regex: "\\/\\/.*$"
                }, (new f).getStartRule("doc-start"), {
                    token: "comment",
                    regex: "\\/\\*",
                    merge: !0,
                    next: "comment"
                }, {
                    token: "string.regexp",
                    regex: "[/](?:(?:\\[(?:\\\\]|[^\\]])+\\])|(?:\\\\/|[^\\]/]))*[/]\\w*\\s*(?=[).,;]|$)"
                }, {
                    token: "string",
                    regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
                }, {
                    token: "string",
                    regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
                }, {
                    token: "constant.numeric",
                    regex: "0[xX][0-9a-fA-F]+\\b"
                }, {
                    token: "constant.numeric",
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token: "constant.language.boolean",
                    regex: "(?:true|false)\\b"
                }, {
                    token: function(c) {
                        return c == "this" ? "variable.language" : a.hasOwnProperty(c) ? "keyword" : b.hasOwnProperty(c) ? "constant.language" : "identifier"
                    },
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "keyword.operator",
                    regex: "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
                }, {
                    token: "punctuation.operator",
                    regex: "\\?|\\:|\\,|\\;|\\."
                }, {
                    token: "paren.lparen",
                    regex: "[[({]"
                }, {
                    token: "paren.rparen",
                    regex: "[\\])}]"
                }, {
                    token: "text",
                    regex: "\\s+"
                }],
                comment: [{
                    token: "comment",
                    regex: ".*?\\*\\/",
                    next: "start"
                }, {
                    token: "comment",
                    merge: !0,
                    regex: ".+"
                }]
            }, this.embedRules(f, "doc-", [(new f).getEndRule("start")])
        };
    d.inherits(h, g), b.CSharpHighlightRules = h
}), define("ace/mode/doc_comment_highlight_rules", ["require", "exports", "module", "pilot/oop", "ace/mode/text_highlight_rules"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("ace/mode/text_highlight_rules").TextHighlightRules,
        f = function() {
            this.$rules = {
                start: [{
                    token: "comment.doc.tag",
                    regex: "@[\\w\\d_]+"
                }, {
                    token: "comment.doc",
                    merge: !0,
                    regex: "\\s+"
                }, {
                    token: "comment.doc",
                    merge: !0,
                    regex: "TODO"
                }, {
                    token: "comment.doc",
                    merge: !0,
                    regex: "[^@\\*]+"
                }, {
                    token: "comment.doc",
                    merge: !0,
                    regex: "."
                }]
            }
        };
    d.inherits(f, e),
    function() {
        this.getStartRule = function(a) {
            return {
                token: "comment.doc",
                merge: !0,
                regex: "\\/\\*(?=\\*)",
                next: a
            }
        }, this.getEndRule = function(a) {
            return {
                token: "comment.doc",
                merge: !0,
                regex: "\\*\\/",
                next: a
            }
        }
    }.call(f.prototype), b.DocCommentHighlightRules = f
}), define("ace/mode/matching_brace_outdent", ["require", "exports", "module", "ace/range"], function(a, b, c) {
    var d = a("ace/range").Range,
        e = function() {};
    (function() {
        this.checkOutdent = function(a, b) {
            return /^\s+$/.test(a) ? /^\s*\}/.test(b) : !1
        }, this.autoOutdent = function(a, b) {
            var c = a.getLine(b),
                e = c.match(/^(\s*\})/);
            if (!e) return 0;
            var f = e[1].length,
                g = a.findMatchingBracket({
                    row: b,
                    column: f
                });
            if (!g || g.row == b) return 0;
            var h = this.$getIndent(a.getLine(g.row));
            a.replace(new d(b, 0, b, f - 1), h)
        }, this.$getIndent = function(a) {
            var b = a.match(/^(\s+)/);
            return b ? b[1] : ""
        }
    }).call(e.prototype), b.MatchingBraceOutdent = e
}), define("ace/mode/behaviour/cstyle", ["require", "exports", "module", "pilot/oop", "ace/mode/behaviour"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("ace/mode/behaviour").Behaviour,
        f = function() {
            this.add("braces", "insertion", function(a, b, c, d, e) {
                if (e == "{") {
                    var f = c.getSelectionRange(),
                        g = d.doc.getTextRange(f);
                    return g !== "" ? {
                        text: "{" + g + "}",
                        selection: !1
                    } : {
                        text: "{}",
                        selection: [1, 1]
                    }
                }
                if (e == "}") {
                    var h = c.getCursorPosition(),
                        i = d.doc.getLine(h.row),
                        j = i.substring(h.column, h.column + 1);
                    if (j == "}") {
                        var k = d.$findOpeningBracket("}", {
                            column: h.column + 1,
                            row: h.row
                        });
                        if (k !== null) return {
                            text: "",
                            selection: [1, 1]
                        }
                    }
                } else if (e == "\n") {
                    var h = c.getCursorPosition(),
                        i = d.doc.getLine(h.row),
                        j = i.substring(h.column, h.column + 1);
                    if (j == "}") {
                        var l = d.findMatchingBracket({
                            row: h.row,
                            column: h.column + 1
                        });
                        if (!l) return null;
                        var m = this.getNextLineIndent(a, i.substring(0, i.length - 1), d.getTabString()),
                            n = this.$getIndent(d.doc.getLine(l.row));
                        return {
                            text: "\n" + m + "\n" + n,
                            selection: [1, m.length, 1, m.length]
                        }
                    }
                }
            }), this.add("braces", "deletion", function(a, b, c, d, e) {
                var f = d.doc.getTextRange(e);
                if (!e.isMultiLine() && f == "{") {
                    var g = d.doc.getLine(e.start.row),
                        h = g.substring(e.end.column, e.end.column + 1);
                    if (h == "}") return e.end.column++, e
                }
            }), this.add("parens", "insertion", function(a, b, c, d, e) {
                if (e == "(") {
                    var f = c.getSelectionRange(),
                        g = d.doc.getTextRange(f);
                    return g !== "" ? {
                        text: "(" + g + ")",
                        selection: !1
                    } : {
                        text: "()",
                        selection: [1, 1]
                    }
                }
                if (e == ")") {
                    var h = c.getCursorPosition(),
                        i = d.doc.getLine(h.row),
                        j = i.substring(h.column, h.column + 1);
                    if (j == ")") {
                        var k = d.$findOpeningBracket(")", {
                            column: h.column + 1,
                            row: h.row
                        });
                        if (k !== null) return {
                            text: "",
                            selection: [1, 1]
                        }
                    }
                }
            }), this.add("parens", "deletion", function(a, b, c, d, e) {
                var f = d.doc.getTextRange(e);
                if (!e.isMultiLine() && f == "(") {
                    var g = d.doc.getLine(e.start.row),
                        h = g.substring(e.start.column + 1, e.start.column + 2);
                    if (h == ")") return e.end.column++, e
                }
            }), this.add("string_dquotes", "insertion", function(a, b, c, d, e) {
                if (e == '"') {
                    var f = c.getSelectionRange(),
                        g = d.doc.getTextRange(f);
                    if (g !== "") return {
                        text: '"' + g + '"',
                        selection: !1
                    };
                    var h = c.getCursorPosition(),
                        i = d.doc.getLine(h.row),
                        j = i.substring(h.column - 1, h.column);
                    if (j == "\\") return null;
                    var k = d.getTokens(f.start.row, f.start.row)[0].tokens,
                        l = 0,
                        m, n = -1;
                    for (var o = 0; o < k.length; o++) {
                        m = k[o], m.type == "string" ? n = -1 : n < 0 && (n = m.value.indexOf('"'));
                        if (m.value.length + l > f.start.column) break;
                        l += k[o].value.length
                    }
                    if (!m || n < 0 && m.type !== "comment" && (m.type !== "string" || f.start.column !== m.value.length + l - 1 && m.value.lastIndexOf('"') === m.value.length - 1)) return {
                        text: '""',
                        selection: [1, 1]
                    };
                    if (m && m.type === "string") {
                        var p = i.substring(h.column, h.column + 1);
                        if (p == '"') return {
                            text: "",
                            selection: [1, 1]
                        }
                    }
                }
            }), this.add("string_dquotes", "deletion", function(a, b, c, d, e) {
                var f = d.doc.getTextRange(e);
                if (!e.isMultiLine() && f == '"') {
                    var g = d.doc.getLine(e.start.row),
                        h = g.substring(e.start.column + 1, e.start.column + 2);
                    if (h == '"') return e.end.column++, e
                }
            })
        };
    d.inherits(f, e), b.CstyleBehaviour = f
})
