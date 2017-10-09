define("ace/mode/clojure", ["require", "exports", "module", "pilot/oop", "ace/mode/text", "ace/tokenizer", "ace/mode/clojure_highlight_rules", "ace/mode/matching_parens_outdent", "ace/range"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("ace/mode/text").Mode,
        f = a("ace/tokenizer").Tokenizer,
        g = a("ace/mode/clojure_highlight_rules").ClojureHighlightRules,
        h = a("ace/mode/matching_parens_outdent").MatchingParensOutdent,
        i = a("ace/range").Range,
        j = function() {
            this.$tokenizer = new f((new g).getRules()), this.$outdent = new h
        };
    d.inherits(j, e),
    function() {
        this.toggleCommentLines = function(a, b, c, d) {
            var e = !0,
                f = [],
                g = /^(\s*)#/;
            for (var h = c; h <= d; h++)
                if (!g.test(b.getLine(h))) {
                    e = !1;
                    break
                }
            if (e) {
                var j = new i(0, 0, 0, 0);
                for (var h = c; h <= d; h++) {
                    var k = b.getLine(h),
                        l = k.match(g);
                    j.start.row = h, j.end.row = h, j.end.column = l[0].length, b.replace(j, l[1])
                }
            } else b.indentRows(c, d, ";")
        }, this.getNextLineIndent = function(a, b, c) {
            var d = this.$getIndent(b),
                e = d,
                f = this.$tokenizer.getLineTokens(b, a),
                g = f.tokens,
                h = f.state;
            if (g.length && g[g.length - 1].type == "comment") return d;
            if (a == "start") {
                var i = b.match(/[\(\[]/);
                i && (d += "  "), i = b.match(/[\)]/), i && (d = "")
            }
            return d
        }, this.checkOutdent = function(a, b, c) {
            return this.$outdent.checkOutdent(b, c)
        }, this.autoOutdent = function(a, b, c) {
            this.$outdent.autoOutdent(b, c)
        }
    }.call(j.prototype), b.Mode = j
}), define("ace/mode/clojure_highlight_rules", ["require", "exports", "module", "pilot/oop", "pilot/lang", "ace/mode/text_highlight_rules"], function(a, b, c) {
    var d = a("pilot/oop"),
        e = a("pilot/lang"),
        f = a("ace/mode/text_highlight_rules").TextHighlightRules,
        g = function() {
            var a = e.arrayToMap("* *1 *2 *3 *agent* *allow-unresolved-vars* *assert* *clojure-version* *command-line-args* *compile-files* *compile-path* *e *err* *file* *flush-on-newline* *in* *macro-meta* *math-context* *ns* *out* *print-dup* *print-length* *print-level* *print-meta* *print-readably* *read-eval* *source-path* *use-context-classloader* *warn-on-reflection* + - -> -&gt; ->> -&gt;&gt; .. / < &lt; <= &lt;= = == > &gt; >= &gt;= accessor aclone add-classpath add-watch agent agent-errors aget alength alias all-ns alter alter-meta! alter-var-root amap ancestors and apply areduce array-map aset aset-boolean aset-byte aset-char aset-double aset-float aset-int aset-long aset-short assert assoc assoc! assoc-in associative? atom await await-for await1 bases bean bigdec bigint binding bit-and bit-and-not bit-clear bit-flip bit-not bit-or bit-set bit-shift-left bit-shift-right bit-test bit-xor boolean boolean-array booleans bound-fn bound-fn* butlast byte byte-array bytes cast char char-array char-escape-string char-name-string char? chars chunk chunk-append chunk-buffer chunk-cons chunk-first chunk-next chunk-rest chunked-seq? class class? clear-agent-errors clojure-version coll? comment commute comp comparator compare compare-and-set! compile complement concat cond condp conj conj! cons constantly construct-proxy contains? count counted? create-ns create-struct cycle dec decimal? declare definline defmacro defmethod defmulti defn defn- defonce defstruct delay delay? deliver deref derive descendants destructure disj disj! dissoc dissoc! distinct distinct? doall doc dorun doseq dosync dotimes doto double double-array doubles drop drop-last drop-while empty empty? ensure enumeration-seq eval even? every? false? ffirst file-seq filter find find-doc find-ns find-var first float float-array float? floats flush fn fn? fnext for force format future future-call future-cancel future-cancelled? future-done? future? gen-class gen-interface gensym get get-in get-method get-proxy-class get-thread-bindings get-validator hash hash-map hash-set identical? identity if-let if-not ifn? import in-ns inc init-proxy instance? int int-array integer? interleave intern interpose into into-array ints io! isa? iterate iterator-seq juxt key keys keyword keyword? last lazy-cat lazy-seq let letfn line-seq list list* list? load load-file load-reader load-string loaded-libs locking long long-array longs loop macroexpand macroexpand-1 make-array make-hierarchy map map? mapcat max max-key memfn memoize merge merge-with meta method-sig methods min min-key mod name namespace neg? newline next nfirst nil? nnext not not-any? not-empty not-every? not= ns ns-aliases ns-imports ns-interns ns-map ns-name ns-publics ns-refers ns-resolve ns-unalias ns-unmap nth nthnext num number? odd? or parents partial partition pcalls peek persistent! pmap pop pop! pop-thread-bindings pos? pr pr-str prefer-method prefers primitives-classnames print print-ctor print-doc print-dup print-method print-namespace-doc print-simple print-special-doc print-str printf println println-str prn prn-str promise proxy proxy-call-with-super proxy-mappings proxy-name proxy-super push-thread-bindings pvalues quot rand rand-int range ratio? rational? rationalize re-find re-groups re-matcher re-matches re-pattern re-seq read read-line read-string reduce ref ref-history-count ref-max-history ref-min-history ref-set refer refer-clojure release-pending-sends rem remove remove-method remove-ns remove-watch repeat repeatedly replace replicate require reset! reset-meta! resolve rest resultset-seq reverse reversible? rseq rsubseq second select-keys send send-off seq seq? seque sequence sequential? set set-validator! set? short short-array shorts shutdown-agents slurp some sort sort-by sorted-map sorted-map-by sorted-set sorted-set-by sorted? special-form-anchor special-symbol? split-at split-with str stream? string? struct struct-map subs subseq subvec supers swap! symbol symbol? sync syntax-symbol-anchor take take-last take-nth take-while test the-ns time to-array to-array-2d trampoline transient tree-seq true? type unchecked-add unchecked-dec unchecked-divide unchecked-inc unchecked-multiply unchecked-negate unchecked-remainder unchecked-subtract underive unquote unquote-splicing update-in update-proxy use val vals var-get var-set var? vary-meta vec vector vector? when when-first when-let when-not while with-bindings with-bindings* with-in-str with-loading-context with-local-vars with-meta with-open with-out-str with-precision xml-seq zero? zipmap ".split(" ")),
                b = e.arrayToMap("def do fn if let loop monitor-enter monitor-exit new quote recur set! throw try var".split(" ")),
                c = e.arrayToMap("true false nil".split(" "));
            this.$rules = {
                start: [{
                    token: "comment",
                    regex: ";.*$"
                }, {
                    token: "comment",
                    regex: "^=begin$",
                    next: "comment"
                }, {
                    token: "keyword",
                    regex: "[\\(|\\)]"
                }, {
                    token: "keyword",
                    regex: "[\\'\\(]"
                }, {
                    token: "keyword",
                    regex: "[\\[|\\]]"
                }, {
                    token: "keyword",
                    regex: "[\\{|\\}|\\#\\{|\\#\\}]"
                }, {
                    token: "keyword",
                    regex: "[\\&]"
                }, {
                    token: "keyword",
                    regex: "[\\#\\^\\{]"
                }, {
                    token: "keyword",
                    regex: "[\\%]"
                }, {
                    token: "keyword",
                    regex: "[@]"
                }, {
                    token: "constant.numeric",
                    regex: "0[xX][0-9a-fA-F]+\\b"
                }, {
                    token: "constant.numeric",
                    regex: "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
                }, {
                    token: "constant.language",
                    regex: "[!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+||=|!=|<=|>=|<>|<|>|!|&&]"
                }, {
                    token: function(d) {
                        return b.hasOwnProperty(d) ? "keyword" : c.hasOwnProperty(d) ? "constant.language" : a.hasOwnProperty(d) ? "support.function" : "identifier"
                    },
                    regex: "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                }, {
                    token: "string",
                    regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
                }, {
                    token: "string",
                    regex: "[:](?:[a-zA-Z]|d)+"
                }, {
                    token: "string.regexp",
                    regex: '/#"(?:.|(\\")|[^""\n])*"/g'
                }],
                comment: [{
                    token: "comment",
                    regex: "^=end$",
                    next: "start"
                }, {
                    token: "comment",
                    merge: !0,
                    regex: ".+"
                }]
            }
        };
    d.inherits(g, f), b.ClojureHighlightRules = g
}), define("ace/mode/matching_parens_outdent", ["require", "exports", "module", "ace/range"], function(a, b, c) {
    var d = a("ace/range").Range,
        e = function() {};
    (function() {
        this.checkOutdent = function(a, b) {
            return /^\s+$/.test(a) ? /^\s*\)/.test(b) : !1
        }, this.autoOutdent = function(a, b) {
            var c = a.getLine(b),
                e = c.match(/^(\s*\))/);
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
    }).call(e.prototype), b.MatchingParensOutdent = e
})
