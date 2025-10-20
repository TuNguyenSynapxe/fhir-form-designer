import Pe, { useState as Oe, useMemo as te } from "react";
var U = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ze(u) {
  return u && u.__esModule && Object.prototype.hasOwnProperty.call(u, "default") ? u.default : u;
}
var Y = { exports: {} }, M = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var se;
function De() {
  if (se) return M;
  se = 1;
  var u = Symbol.for("react.transitional.element"), s = Symbol.for("react.fragment");
  function a(f, m, h) {
    var b = null;
    if (h !== void 0 && (b = "" + h), m.key !== void 0 && (b = "" + m.key), "key" in m) {
      h = {};
      for (var j in m)
        j !== "key" && (h[j] = m[j]);
    } else h = m;
    return m = h.ref, {
      $$typeof: u,
      type: f,
      key: b,
      ref: m !== void 0 ? m : null,
      props: h
    };
  }
  return M.Fragment = s, M.jsx = a, M.jsxs = a, M;
}
var ne;
function Me() {
  return ne || (ne = 1, Y.exports = De()), Y.exports;
}
var r = Me();
function He(u) {
  try {
    const s = atob(u), a = JSON.parse(s);
    if (!a || typeof a != "object")
      throw new Error("Invalid workspace format");
    if (!a.templates || !Array.isArray(a.templates))
      throw new Error("Workspace must contain a templates array");
    return a;
  } catch (s) {
    throw new Error(`Failed to decode workspace: ${s instanceof Error ? s.message : "Unknown error"}`);
  }
}
function Ve(u, s) {
  return !u.templates || !Array.isArray(u.templates) ? null : u.templates.find((a) => a.name === s) || null;
}
function We(u, s) {
  if (!u || !s) return !1;
  const a = s.resourceType;
  return u.resourceType && a && u.resourceType !== a ? (console.warn(`Template resourceType "${u.resourceType}" doesn't match data resourceType "${a}"`), !1) : !0;
}
var X, ae;
function qe() {
  if (ae) return X;
  ae = 1;
  var u = "Expected a function", s = "__lodash_hash_undefined__", a = "[object Function]", f = "[object GeneratorFunction]", m = "[object Symbol]", h = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, b = /^\w*$/, j = /^\./, $ = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, E = /[\\^$.*+?()[\]{}|]/g, e = /\\(\\)?/g, o = /^\[object .+?Constructor\]$/, i = typeof U == "object" && U && U.Object === Object && U, d = typeof self == "object" && self && self.Object === Object && self, c = i || d || Function("return this")();
  function x(t, n) {
    return t?.[n];
  }
  function g(t) {
    var n = !1;
    if (t != null && typeof t.toString != "function")
      try {
        n = !!(t + "");
      } catch {
      }
    return n;
  }
  var v = Array.prototype, N = Function.prototype, C = Object.prototype, F = c["__core-js_shared__"], _ = (function() {
    var t = /[^.]+$/.exec(F && F.keys && F.keys.IE_PROTO || "");
    return t ? "Symbol(src)_1." + t : "";
  })(), S = N.toString, L = C.hasOwnProperty, A = C.toString, p = RegExp(
    "^" + S.call(L).replace(E, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), w = c.Symbol, H = v.splice, P = Q(c, "Map"), R = Q(Object, "create"), O = w ? w.prototype : void 0, V = O ? O.toString : void 0;
  function T(t) {
    var n = -1, l = t ? t.length : 0;
    for (this.clear(); ++n < l; ) {
      var y = t[n];
      this.set(y[0], y[1]);
    }
  }
  function oe() {
    this.__data__ = R ? R(null) : {};
  }
  function le(t) {
    return this.has(t) && delete this.__data__[t];
  }
  function ie(t) {
    var n = this.__data__;
    if (R) {
      var l = n[t];
      return l === s ? void 0 : l;
    }
    return L.call(n, t) ? n[t] : void 0;
  }
  function ce(t) {
    var n = this.__data__;
    return R ? n[t] !== void 0 : L.call(n, t);
  }
  function de(t, n) {
    var l = this.__data__;
    return l[t] = R && n === void 0 ? s : n, this;
  }
  T.prototype.clear = oe, T.prototype.delete = le, T.prototype.get = ie, T.prototype.has = ce, T.prototype.set = de;
  function I(t) {
    var n = -1, l = t ? t.length : 0;
    for (this.clear(); ++n < l; ) {
      var y = t[n];
      this.set(y[0], y[1]);
    }
  }
  function ue() {
    this.__data__ = [];
  }
  function me(t) {
    var n = this.__data__, l = W(n, t);
    if (l < 0)
      return !1;
    var y = n.length - 1;
    return l == y ? n.pop() : H.call(n, l, 1), !0;
  }
  function pe(t) {
    var n = this.__data__, l = W(n, t);
    return l < 0 ? void 0 : n[l][1];
  }
  function he(t) {
    return W(this.__data__, t) > -1;
  }
  function fe(t, n) {
    var l = this.__data__, y = W(l, t);
    return y < 0 ? l.push([t, n]) : l[y][1] = n, this;
  }
  I.prototype.clear = ue, I.prototype.delete = me, I.prototype.get = pe, I.prototype.has = he, I.prototype.set = fe;
  function k(t) {
    var n = -1, l = t ? t.length : 0;
    for (this.clear(); ++n < l; ) {
      var y = t[n];
      this.set(y[0], y[1]);
    }
  }
  function xe() {
    this.__data__ = {
      hash: new T(),
      map: new (P || I)(),
      string: new T()
    };
  }
  function ge(t) {
    return q(this, t).delete(t);
  }
  function ye(t) {
    return q(this, t).get(t);
  }
  function be(t) {
    return q(this, t).has(t);
  }
  function je(t, n) {
    return q(this, t).set(t, n), this;
  }
  k.prototype.clear = xe, k.prototype.delete = ge, k.prototype.get = ye, k.prototype.has = be, k.prototype.set = je;
  function W(t, n) {
    for (var l = t.length; l--; )
      if (Ae(t[l][0], n))
        return l;
    return -1;
  }
  function ve(t, n) {
    n = $e(n, t) ? [n] : _e(n);
    for (var l = 0, y = n.length; t != null && l < y; )
      t = t[Se(n[l++])];
    return l && l == y ? t : void 0;
  }
  function Ne(t) {
    if (!ee(t) || Ce(t))
      return !1;
    var n = Te(t) || g(t) ? p : o;
    return n.test(Re(t));
  }
  function we(t) {
    if (typeof t == "string")
      return t;
    if (G(t))
      return V ? V.call(t) : "";
    var n = t + "";
    return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
  }
  function _e(t) {
    return K(t) ? t : Fe(t);
  }
  function q(t, n) {
    var l = t.__data__;
    return Ee(n) ? l[typeof n == "string" ? "string" : "hash"] : l.map;
  }
  function Q(t, n) {
    var l = x(t, n);
    return Ne(l) ? l : void 0;
  }
  function $e(t, n) {
    if (K(t))
      return !1;
    var l = typeof t;
    return l == "number" || l == "symbol" || l == "boolean" || t == null || G(t) ? !0 : b.test(t) || !h.test(t) || n != null && t in Object(n);
  }
  function Ee(t) {
    var n = typeof t;
    return n == "string" || n == "number" || n == "symbol" || n == "boolean" ? t !== "__proto__" : t === null;
  }
  function Ce(t) {
    return !!_ && _ in t;
  }
  var Fe = J(function(t) {
    t = Ie(t);
    var n = [];
    return j.test(t) && n.push(""), t.replace($, function(l, y, z, D) {
      n.push(z ? D.replace(e, "$1") : y || l);
    }), n;
  });
  function Se(t) {
    if (typeof t == "string" || G(t))
      return t;
    var n = t + "";
    return n == "0" && 1 / t == -1 / 0 ? "-0" : n;
  }
  function Re(t) {
    if (t != null) {
      try {
        return S.call(t);
      } catch {
      }
      try {
        return t + "";
      } catch {
      }
    }
    return "";
  }
  function J(t, n) {
    if (typeof t != "function" || n && typeof n != "function")
      throw new TypeError(u);
    var l = function() {
      var y = arguments, z = n ? n.apply(this, y) : y[0], D = l.cache;
      if (D.has(z))
        return D.get(z);
      var re = t.apply(this, y);
      return l.cache = D.set(z, re), re;
    };
    return l.cache = new (J.Cache || k)(), l;
  }
  J.Cache = k;
  function Ae(t, n) {
    return t === n || t !== t && n !== n;
  }
  var K = Array.isArray;
  function Te(t) {
    var n = ee(t) ? A.call(t) : "";
    return n == a || n == f;
  }
  function ee(t) {
    var n = typeof t;
    return !!t && (n == "object" || n == "function");
  }
  function ke(t) {
    return !!t && typeof t == "object";
  }
  function G(t) {
    return typeof t == "symbol" || ke(t) && A.call(t) == m;
  }
  function Ie(t) {
    return t == null ? "" : we(t);
  }
  function Le(t, n, l) {
    var y = t == null ? void 0 : ve(t, n);
    return y === void 0 ? l : y;
  }
  return X = Le, X;
}
var Ue = qe();
const B = /* @__PURE__ */ ze(Ue);
class Ze {
  data;
  fieldMappings;
  constructor(s) {
    this.data = s, this.fieldMappings = this.createFieldMappings();
  }
  /**
   * Create common field name mappings based on resource type
   */
  createFieldMappings() {
    const s = {};
    switch (this.data.resourceType) {
      case "Patient":
        s.firstName = "name[0].given[0]", s.middleName = "name[0].given[1]", s.lastName = "name[0].family", s.fullName = "name[0]", s.prefix = "name[0].prefix[0]", s.suffix = "name[0].suffix[0]", s.gender = "gender", s.birthDate = "birthDate", s.email = "telecom.find(t => t.system === 'email').value", s.phone = "telecom.find(t => t.system === 'phone').value", s.addressLine1 = "address[0].line[0]", s.addressLine2 = "address[0].line[1]", s.city = "address[0].city", s.state = "address[0].state", s.postalCode = "address[0].postalCode", s.country = "address[0].country", s.maritalStatus = "maritalStatus.coding[0].display";
        break;
      case "HumanName":
        s.firstName = "given[0]", s.middleName = "given[1]", s.lastName = "family", s.prefix = "prefix[0]", s.suffix = "suffix[0]", s.text = "text", s.use = "use";
        break;
      case "ContactPoint":
        s.system = "system", s.value = "value", s.use = "use", s.rank = "rank";
        break;
      case "Address":
        s.line1 = "line[0]", s.line2 = "line[1]", s.city = "city", s.state = "state", s.postalCode = "postalCode", s.country = "country", s.district = "district", s.text = "text", s.use = "use", s.type = "type";
        break;
    }
    return s;
  }
  /**
   * Get the value for a field name using FHIR path resolution
   */
  getFieldValue(s) {
    const a = this.fieldMappings[s];
    if (!a)
      return console.warn(`Field "${s}" not available for resource type "${this.data.resourceType}". Available fields:`, Object.keys(this.fieldMappings)), `[${s}?]`;
    try {
      if (a.includes("telecom.find(") && this.data.resourceType === "Patient") {
        const f = this.data;
        if (a.includes("'email'"))
          return f.telecom?.find((h) => h.system === "email")?.value || "";
        if (a.includes("'phone'"))
          return f.telecom?.find((h) => h.system === "phone")?.value || "";
      }
      return B(this.data, a) || "";
    } catch (f) {
      return console.error("Error resolving field:", s, f), "";
    }
  }
  /**
   * Evaluate an expression and return the result
   */
  evaluate(s) {
    if (!s || !s.trim())
      return "";
    console.log("Evaluating expression:", s);
    try {
      let a = s;
      a = this.replaceFhirPaths(a);
      const f = Object.keys(this.fieldMappings).sort((h, b) => b.length - h.length);
      for (const h of f) {
        const b = new RegExp(`\\b${h}\\b`, "g");
        if (b.test(a)) {
          const j = this.getFieldValue(h), E = String(j || "").replace(/"/g, '\\"');
          a = a.replace(b, `"${E}"`);
        }
      }
      console.log("After field replacement:", a);
      const m = this.safeEvaluate(a);
      return console.log("Evaluation result:", m), String(m || "");
    } catch (a) {
      return console.error("Error evaluating expression:", s, a), `[Error: ${a instanceof Error ? a.message : String(a)}]`;
    }
  }
  /**
   * Replace FHIR paths in expressions with their actual values
   */
  replaceFhirPaths(s) {
    console.log("Original expression:", s), console.log("Data:", this.data);
    let a = s;
    const f = /telecom\.find\([^)]+\)\.value/g;
    a = a.replace(f, (d) => {
      console.log("Processing telecom find:", d);
      try {
        const c = this.resolveFhirPath(d), x = String(c || "").replace(/"/g, '\\"');
        return console.log("Telecom find result:", d, "->", c), `"${x}"`;
      } catch (c) {
        return console.warn("Error resolving telecom path:", d, c), '""';
      }
    });
    const m = /* @__PURE__ */ new Set(), h = /\b[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]\.[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]/g;
    let b;
    for (; (b = h.exec(a)) !== null; )
      m.add(b[0]);
    const j = /\b[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]\.[a-zA-Z][a-zA-Z0-9]*/g;
    let $;
    for (; ($ = j.exec(a)) !== null; )
      Array.from(m).some((d) => d.includes($[0])) || m.add($[0]);
    const E = /\b[a-zA-Z][a-zA-Z0-9]*\[[0-9]+\]/g;
    let e;
    for (; (e = E.exec(a)) !== null; )
      Array.from(m).some((d) => d.includes(e[0])) || m.add(e[0]);
    const o = Array.from(m).map((d) => ({ 0: d }));
    console.log("Found FHIR path matches:", o.map((d) => d[0])), o.sort((d, c) => c[0].length - d[0].length);
    const i = /* @__PURE__ */ new Set();
    for (const d of o) {
      const c = d[0];
      if (!(i.has(c) || a.includes(`"${c}"`))) {
        console.log("Processing FHIR path:", c);
        try {
          const x = this.resolveFhirPath(c);
          console.log("FHIR path result:", c, "->", x, "(type:", typeof x, ")");
          const g = String(x || "").replace(/"/g, '\\"'), v = a;
          a = a.replace(new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), `"${g}"`), a !== v ? (console.log(`Replaced "${c}" with "${g}"`), console.log("Before:", v), console.log("After:", a)) : console.log(`No replacements made for "${c}"`), i.add(c);
        } catch (x) {
          console.warn("Error resolving FHIR path:", c, x);
          const g = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          a = a.replace(new RegExp(`\\b${g}\\b`, "g"), '""'), i.add(c);
        }
      }
    }
    return console.log("Final result after FHIR path replacement:", a), a;
  }
  /**
   * Resolve a FHIR path against the data
   */
  resolveFhirPath(s) {
    console.log("Resolving FHIR path:", s, "against data:", this.data);
    try {
      if (s.includes("telecom.find(") && this.data.resourceType === "Patient") {
        const f = this.data;
        if (s.includes("'email'") || s.includes('"email"')) {
          const h = f.telecom?.find((b) => b.system === "email")?.value || "";
          return console.log("Telecom email result:", h), h;
        }
        if (s.includes("'phone'") || s.includes('"phone"')) {
          const h = f.telecom?.find((b) => b.system === "phone")?.value || "";
          return console.log("Telecom phone result:", h), h;
        }
      }
      const a = B(this.data, s);
      return console.log("Lodash.get result for", s, ":", a, "(type:", typeof a, ")"), a || "";
    } catch (a) {
      return console.error("Error resolving FHIR path:", s, a), "";
    }
  }
  /**
   * Safely evaluate expressions - only allows string concatenation and basic operations
   */
  safeEvaluate(s) {
    try {
      console.log("Safe evaluating:", s);
      const a = s.replace(/[<>{}$`\\]/g, "").trim();
      console.log("Sanitized expression:", a);
      const m = new Function("return " + a)();
      return console.log("Function result:", m), String(m);
    } catch (a) {
      return console.error("Safe eval error:", a), s;
    }
  }
  /**
   * Get available field names for this resource type
   */
  getAvailableFields() {
    return Object.keys(this.fieldMappings).sort();
  }
}
function Be(u, s) {
  return !u || !s ? "" : new Ze(s).evaluate(u);
}
const Je = ({ template: u, sampleData: s }) => {
  const a = (e) => {
    switch (e) {
      case "Patient":
        return "👤";
      case "HumanName":
        return "📝";
      case "ContactPoint":
        return "📞";
      case "Address":
        return "🏠";
      default:
        return "📋";
    }
  }, f = (e, o) => {
    if (!e || !o) return "";
    try {
      if (e.includes('telecom.find(t => t.system === "email").value'))
        return (o.telecom || []).find((c) => c.system === "email")?.value || "";
      if (e.includes('telecom.find(t => t.system === "phone").value'))
        return (o.telecom || []).find((c) => c.system === "phone")?.value || "";
      if (e.includes("contact[0].telecom.find(t => t.system === 'phone').value")) {
        const i = o.contact?.[0];
        return i?.telecom && i.telecom.find((c) => c.system === "phone")?.value || "";
      }
      return B(o, e) || "";
    } catch (i) {
      return console.error("Error resolving FHIR path:", e, i), "";
    }
  }, m = (e, o, i) => {
    if (!e) return `Item ${i + 1}`;
    try {
      switch (o) {
        case "HumanName":
          const d = e.given?.[0] || e.firstName, c = e.family || e.lastName;
          if (d || c)
            return [d, c].filter(Boolean).join(" ");
          if (e.use) return `${e.use.charAt(0).toUpperCase() + e.use.slice(1)} Name`;
          if (e.prefix) return `${e.prefix} Name`;
          break;
        case "ContactPoint":
          const x = e.system || "Contact", g = e.value;
          return g ? `${x.charAt(0).toUpperCase() + x.slice(1)}: ${g}` : e.use ? `${e.use.charAt(0).toUpperCase() + e.use.slice(1)} ${x}` : `${x.charAt(0).toUpperCase() + x.slice(1)} Contact`;
        case "Address":
          const v = e.line?.[0] || e.street, N = e.city, C = e.state;
          if (v && N)
            return `${v}, ${N}`;
          if (N && C)
            return `${N}, ${C}`;
          if (N)
            return N;
          if (v)
            return v;
          if (e.use) return `${e.use.charAt(0).toUpperCase() + e.use.slice(1)} Address`;
          if (e.type) return `${e.type.charAt(0).toUpperCase() + e.type.slice(1)} Address`;
          break;
        case "Patient":
          const F = e.name?.[0];
          if (F) {
            const _ = F.given?.[0], S = F.family;
            if (_ || S)
              return [_, S].filter(Boolean).join(" ");
          }
          if (e.id) return `Patient ${e.id}`;
          break;
      }
    } catch (d) {
      console.warn("Error generating item label:", d);
    }
    return `${o} ${i + 1}`;
  }, h = (e) => {
    const o = e, i = o.widgetTemplateId, d = o.widgetResourceType;
    if (!i)
      return /* @__PURE__ */ r.jsxs("div", { className: "mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg", children: [
        /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
          /* @__PURE__ */ r.jsx("span", { children: "🧩" }),
          /* @__PURE__ */ r.jsx("h4", { className: "font-medium text-gray-700", children: e.label }),
          /* @__PURE__ */ r.jsx("span", { className: "text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded", children: d })
        ] }),
        /* @__PURE__ */ r.jsx("p", { className: "text-sm text-gray-500", children: "No template selected" })
      ] }, e.id);
    let c = null;
    try {
      const g = localStorage.getItem("fhir-templates");
      g && (c = (JSON.parse(g).templates || []).find((N) => N.id === i) || null);
    } catch (g) {
      console.error("Failed to load nested template:", g);
    }
    if (!c)
      return /* @__PURE__ */ r.jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg", children: [
        /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
          /* @__PURE__ */ r.jsx("span", { children: "🧩" }),
          /* @__PURE__ */ r.jsx("h4", { className: "font-medium text-gray-700", children: e.label }),
          /* @__PURE__ */ r.jsx("span", { className: "text-xs bg-red-200 text-red-600 px-2 py-1 rounded", children: "Error" })
        ] }),
        /* @__PURE__ */ r.jsxs("p", { className: "text-sm text-red-600", children: [
          "Template not found: ",
          i
        ] })
      ] }, e.id);
    let x = null;
    if (e.fhirPath && s)
      try {
        x = f(e.fhirPath, s);
      } catch (g) {
        console.error("Error extracting nested data:", g);
      }
    return !x && c.sampleData && (x = c.sampleData), /* @__PURE__ */ r.jsx(Pe.Fragment, { children: o.multiple && Array.isArray(x) ? (
      // Render multiple instances
      x.length > 0 ? /* @__PURE__ */ r.jsx("div", { className: "space-y-4", children: x.map((g, v) => /* @__PURE__ */ r.jsxs("div", { className: "border border-gray-200 rounded-lg p-4 bg-white", children: [
        /* @__PURE__ */ r.jsxs("div", { className: "flex items-center justify-between mb-3 pb-2 border-b border-gray-100", children: [
          /* @__PURE__ */ r.jsx("div", { className: "text-sm font-medium text-gray-700", children: m(g, d, v) }),
          /* @__PURE__ */ r.jsx("div", { className: "text-xs text-gray-500", children: d })
        ] }),
        /* @__PURE__ */ r.jsx("div", { className: "space-y-3", children: c.fields.sort((N, C) => N.order - C.order).map((N) => $(N, g)) })
      ] }, v)) }) : /* @__PURE__ */ r.jsxs("div", { className: "p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50", children: [
        /* @__PURE__ */ r.jsx("span", { className: "block text-2xl mb-2", children: "📭" }),
        /* @__PURE__ */ r.jsx("p", { className: "text-sm", children: "No items to display" })
      ] })
    ) : (
      // Render single instance
      /* @__PURE__ */ r.jsx("div", { className: "space-y-3", children: c.fields.sort((g, v) => g.order - v.order).map((g) => $(g, x)) })
    ) }, e.id);
  }, b = (e, o) => e.hideIfEmpty ? !!(o == null || o === "" || Array.isArray(o) && o.length === 0 || typeof o == "object" && Object.keys(o).length === 0) : !1, j = (e, o) => b(e, o) ? "" : !o && o !== 0 && o !== !1 ? "N/A" : String(o), $ = (e, o) => {
    const i = e.fhirPath && B(o, e.fhirPath) || "";
    if (b(e, i)) return null;
    switch (e.type) {
      case "label":
        const d = e;
        return /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: `mb-2 ${d.fontSize === "xl" ? "text-xl" : d.fontSize === "lg" ? "text-lg" : d.fontSize === "sm" ? "text-sm" : "text-base"} ${d.fontWeight === "bold" ? "font-bold" : "font-normal"} text-gray-900 flex items-center`,
            children: [
              /* @__PURE__ */ r.jsx("span", { className: "mr-2", children: "🏷️" }),
              e.label
            ]
          },
          e.id
        );
      case "text":
        return /* @__PURE__ */ r.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ r.jsx("span", { children: "📝" }),
            /* @__PURE__ */ r.jsx("dt", { className: "text-sm font-medium text-gray-700", children: e.label })
          ] }),
          /* @__PURE__ */ r.jsx("dd", { className: "bg-gray-50 px-3 py-2 rounded border text-gray-900", children: j(e, i) })
        ] }, e.id);
      case "date":
        const c = i ? new Date(i).toLocaleDateString() : j(e, i);
        return /* @__PURE__ */ r.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ r.jsx("span", { children: "📅" }),
            /* @__PURE__ */ r.jsx("dt", { className: "text-sm font-medium text-gray-700", children: e.label })
          ] }),
          /* @__PURE__ */ r.jsx("dd", { className: "bg-gray-50 px-3 py-2 rounded border text-gray-900", children: c })
        ] }, e.id);
      case "select":
        const g = e.options?.find((_) => _.value === i)?.label || i || j(e, i);
        return /* @__PURE__ */ r.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ r.jsx("span", { children: "📋" }),
            /* @__PURE__ */ r.jsx("dt", { className: "text-sm font-medium text-gray-700", children: e.label })
          ] }),
          /* @__PURE__ */ r.jsx("dd", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: g })
        ] }, e.id);
      case "radio":
        const N = e.options?.find((_) => _.value === i)?.label || i || j(e, i);
        return /* @__PURE__ */ r.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ r.jsx("span", { children: "🔘" }),
            /* @__PURE__ */ r.jsx("dt", { className: "text-sm font-medium text-gray-700", children: e.label })
          ] }),
          /* @__PURE__ */ r.jsx("dd", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800", children: N })
        ] }, e.id);
      case "checkbox":
        const C = !!i;
        return /* @__PURE__ */ r.jsx("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: /* @__PURE__ */ r.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ r.jsx("span", { children: "☑️" }),
            /* @__PURE__ */ r.jsx("dt", { className: "text-sm font-medium text-gray-700", children: e.label })
          ] }),
          /* @__PURE__ */ r.jsx("dd", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${C ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`, children: C ? "✓ Yes" : "✗ No" })
        ] }) }, e.id);
      case "group":
        const F = e;
        return /* @__PURE__ */ r.jsxs("div", { className: "mb-6 border border-gray-200 rounded-lg bg-white shadow-sm", children: [
          /* @__PURE__ */ r.jsx("div", { className: "px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg", children: /* @__PURE__ */ r.jsxs("h4", { className: "text-md font-semibold text-gray-900 flex items-center", children: [
            /* @__PURE__ */ r.jsx("span", { className: "mr-2", children: "📁" }),
            e.label
          ] }) }),
          /* @__PURE__ */ r.jsx("div", { className: "p-4 space-y-2", children: (F.children || []).sort((_, S) => _.order - S.order).map((_) => $(_, o)) })
        ] }, e.id);
      default:
        return /* @__PURE__ */ r.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ r.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ r.jsx("span", { children: "❓" }),
            /* @__PURE__ */ r.jsx("dt", { className: "text-sm font-medium text-gray-700", children: e.label })
          ] }),
          /* @__PURE__ */ r.jsx("dd", { className: "bg-gray-50 px-3 py-2 rounded border text-gray-900", children: j(e, i) })
        ] }, e.id);
    }
  }, E = (e) => {
    const o = e.expression && s ? Be(e.expression, s) : e.fhirPath ? f(e.fhirPath, s) : "";
    if (b(e, o)) return null;
    switch (e.type) {
      case "label":
        const i = e;
        return /* @__PURE__ */ r.jsx(
          "div",
          {
            className: `mb-2 ${i.fontSize === "sm" ? "text-sm" : i.fontSize === "lg" ? "text-lg" : i.fontSize === "xl" ? "text-xl" : "text-base"} ${i.fontWeight === "bold" ? "font-bold" : "font-normal"}`,
            style: { color: i.color || "inherit" },
            children: e.label
          },
          e.id
        );
      case "text":
        const d = () => {
          const p = e.label.toLowerCase();
          return p.includes("name") || p.includes("first") || p.includes("last") ? "👤" : p.includes("email") ? "📧" : p.includes("phone") || p.includes("tel") ? "📞" : p.includes("address") ? "🏠" : p.includes("city") ? "🏙️" : p.includes("state") ? "🗺️" : p.includes("zip") || p.includes("postal") ? "📮" : p.includes("id") ? "🆔" : "📝";
        }, c = () => o ? typeof o == "object" ? JSON.stringify(o) : (e.label.toLowerCase().includes("email") && o.includes("@") || e.label.toLowerCase().includes("phone") && o.match(/^\+?[\d\s\-\(\)]+$/), o) : j(e, o);
        return /* @__PURE__ */ r.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ r.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ r.jsx("span", { className: "text-lg", children: d() }) }),
          /* @__PURE__ */ r.jsxs("div", { className: "ml-3 flex-1", children: [
            !e.hideLabel && /* @__PURE__ */ r.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              e.label,
              e.required && /* @__PURE__ */ r.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ r.jsx("dd", { className: `${e.hideLabel ? "" : "mt-1"} text-base text-gray-900 font-medium`, children: c() })
          ] })
        ] }, e.id);
      case "date":
        const x = (p) => {
          if (!p) return j(e, p);
          try {
            const w = new Date(p), H = w.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            });
            if (e.label.toLowerCase().includes("birth")) {
              const P = /* @__PURE__ */ new Date(), R = P.getFullYear() - w.getFullYear(), O = P.getMonth() - w.getMonth(), V = O < 0 || O === 0 && P.getDate() < w.getDate() ? R - 1 : R;
              return `${H} (Age: ${V})`;
            }
            return H;
          } catch {
            return p;
          }
        };
        return /* @__PURE__ */ r.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ r.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ r.jsx("span", { className: "text-lg", children: "📅" }) }),
          /* @__PURE__ */ r.jsxs("div", { className: "ml-3 flex-1", children: [
            !e.hideLabel && /* @__PURE__ */ r.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              e.label,
              e.required && /* @__PURE__ */ r.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ r.jsx("dd", { className: `${e.hideLabel ? "" : "mt-1"} text-base text-gray-900 font-medium`, children: x(o) })
          ] })
        ] }, e.id);
      case "select":
        const g = e, v = () => {
          if (!o) return j(e, o);
          const p = (g.options || []).find((w) => w.value === o);
          return p ? p.label : o;
        }, N = () => e.label.toLowerCase().includes("gender") ? o === "male" ? "👨" : o === "female" ? "👩" : "👤" : e.label.toLowerCase().includes("status") ? "📊" : e.label.toLowerCase().includes("type") ? "🏷️" : "📋";
        return /* @__PURE__ */ r.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ r.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ r.jsx("span", { className: "text-lg", children: N() }) }),
          /* @__PURE__ */ r.jsxs("div", { className: "ml-3 flex-1", children: [
            !e.hideLabel && /* @__PURE__ */ r.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              e.label,
              e.required && /* @__PURE__ */ r.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ r.jsx("dd", { className: `${e.hideLabel ? "" : "mt-1"}`, children: /* @__PURE__ */ r.jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize", children: v() }) })
          ] })
        ] }, e.id);
      case "radio":
        const C = e, F = () => {
          if (!o) return j(e, o);
          const p = (C.options || []).find((w) => w.value === o);
          return p ? p.label : o;
        }, _ = () => e.label.toLowerCase().includes("gender") ? o === "male" ? "👨" : o === "female" ? "👩" : "👤" : e.label.toLowerCase().includes("priority") ? "⚡" : e.label.toLowerCase().includes("rating") ? "⭐" : "🔘";
        return /* @__PURE__ */ r.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ r.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ r.jsx("span", { className: "text-lg", children: _() }) }),
          /* @__PURE__ */ r.jsxs("div", { className: "ml-3 flex-1", children: [
            !e.hideLabel && /* @__PURE__ */ r.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              e.label,
              e.required && /* @__PURE__ */ r.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ r.jsx("dd", { className: `${e.hideLabel ? "" : "mt-1"}`, children: /* @__PURE__ */ r.jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 capitalize", children: F() }) })
          ] })
        ] }, e.id);
      case "checkbox":
        const S = !!o;
        return /* @__PURE__ */ r.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ r.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ r.jsx("span", { className: "text-lg", children: S ? "✅" : "❌" }) }),
          /* @__PURE__ */ r.jsxs("div", { className: "ml-3 flex-1", children: [
            !e.hideLabel && /* @__PURE__ */ r.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              e.label,
              e.required && /* @__PURE__ */ r.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ r.jsx("dd", { className: `${e.hideLabel ? "" : "mt-1"}`, children: /* @__PURE__ */ r.jsx("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${S ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`, children: S ? "Active" : "Inactive" }) })
          ] })
        ] }, e.id);
      case "group":
        const L = e;
        return /* @__PURE__ */ r.jsxs("div", { className: "mb-6 border border-gray-200 rounded-lg bg-white shadow-sm", children: [
          /* @__PURE__ */ r.jsx("div", { className: "px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg", children: /* @__PURE__ */ r.jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [
            /* @__PURE__ */ r.jsx("span", { className: "mr-2", children: "📁" }),
            e.label
          ] }) }),
          /* @__PURE__ */ r.jsx("div", { className: "p-4 space-y-4", children: (L.children || []).sort((p, w) => p.order - w.order).map((p) => E(p)) })
        ] }, e.id);
      case "widget":
        return h(e);
      case "twoColumn":
        const A = e;
        return /* @__PURE__ */ r.jsx("div", { className: "mb-6", children: /* @__PURE__ */ r.jsxs(
          "div",
          {
            className: "flex flex-col md:grid md:gap-2 space-y-4 md:space-y-0",
            style: {
              gridTemplateColumns: `${A.leftWidth || 50}% 1fr`,
              gap: `${A.gap || 16}px`
            },
            children: [
              /* @__PURE__ */ r.jsx("div", { className: "space-y-4", children: (A.leftColumn || []).sort((p, w) => p.order - w.order).map((p) => E(p)) }),
              /* @__PURE__ */ r.jsx("div", { className: "space-y-4", children: (A.rightColumn || []).sort((p, w) => p.order - w.order).map((p) => E(p)) })
            ]
          }
        ) }, e.id);
      default:
        return /* @__PURE__ */ r.jsx("div", { className: "mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded", children: /* @__PURE__ */ r.jsxs("span", { className: "text-sm text-yellow-700", children: [
          "Unsupported field type: ",
          e.type
        ] }) }, e.id);
    }
  };
  return /* @__PURE__ */ r.jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ r.jsxs("div", { className: "p-4 border-b border-gray-200 bg-white", children: [
      /* @__PURE__ */ r.jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Live Preview" }),
      /* @__PURE__ */ r.jsx("p", { className: "text-sm text-gray-600", children: "Real-time preview of how your template renders with the sample data" })
    ] }),
    /* @__PURE__ */ r.jsx("div", { className: "flex-1 overflow-y-auto p-6 pb-8 bg-white design-canvas-scroll", children: s ? u.fields.length === 0 ? /* @__PURE__ */ r.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ r.jsx(
        "svg",
        {
          className: "mx-auto h-12 w-12 text-gray-400",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ r.jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            }
          )
        }
      ),
      /* @__PURE__ */ r.jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No fields" }),
      /* @__PURE__ */ r.jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Add fields to your template to see the preview." })
    ] }) : /* @__PURE__ */ r.jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm", children: [
      u.name && /* @__PURE__ */ r.jsxs("div", { className: "px-6 py-4 bg-blue-50 border-b border-blue-100 rounded-t-lg", children: [
        /* @__PURE__ */ r.jsxs("h2", { className: "text-2xl font-bold text-blue-900 flex items-center", children: [
          /* @__PURE__ */ r.jsx("span", { className: "mr-3", children: a(u.resourceType) }),
          u.name
        ] }),
        u.description && /* @__PURE__ */ r.jsx("p", { className: "mt-2 text-blue-700", children: u.description })
      ] }),
      /* @__PURE__ */ r.jsx("div", { className: "p-6", children: /* @__PURE__ */ r.jsx("dl", { className: "space-y-4", children: u.fields.sort((e, o) => e.order - o.order).map((e) => E(e)) }) })
    ] }) : /* @__PURE__ */ r.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ r.jsx(
        "svg",
        {
          className: "mx-auto h-12 w-12 text-gray-400",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ r.jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            }
          )
        }
      ),
      /* @__PURE__ */ r.jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No sample data" }),
      /* @__PURE__ */ r.jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Provide sample FHIR data to see the preview." })
    ] }) }),
    s && /* @__PURE__ */ r.jsx("div", { className: "p-4 border-t border-gray-200 bg-gray-50", children: /* @__PURE__ */ r.jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [
      /* @__PURE__ */ r.jsxs("div", { className: "text-xs text-gray-600 space-x-3", children: [
        /* @__PURE__ */ r.jsxs("span", { className: "flex items-center text-green-600", children: [
          /* @__PURE__ */ r.jsx("span", { className: "mr-1", children: "✓" }),
          s.resourceType || u.resourceType,
          " Resource"
        ] }),
        s.id && /* @__PURE__ */ r.jsxs("span", { children: [
          "ID: ",
          s.id
        ] }),
        s.active !== void 0 && /* @__PURE__ */ r.jsxs("span", { children: [
          "Active: ",
          s.active ? "Yes" : "No"
        ] })
      ] }),
      /* @__PURE__ */ r.jsxs("div", { className: "text-xs", children: [
        u.fields.length,
        " fields rendered"
      ] })
    ] }) })
  ] });
}, Ge = {
  light: {
    "--color-primary": "#3b82f6",
    "--color-primary-light": "#dbeafe",
    "--color-text": "#111827",
    "--color-background": "#ffffff",
    "--color-border": "#d1d5db",
    "--color-gray-50": "#f9fafb",
    "--color-gray-100": "#f3f4f6",
    "--color-gray-200": "#e5e7eb",
    "--color-gray-600": "#4b5563",
    "--color-gray-700": "#374151",
    "--color-gray-900": "#111827"
  },
  dark: {
    "--color-primary": "#60a5fa",
    "--color-primary-light": "#1e3a8a",
    "--color-text": "#f9fafb",
    "--color-background": "#111827",
    "--color-border": "#374151",
    "--color-gray-50": "#1f2937",
    "--color-gray-100": "#374151",
    "--color-gray-200": "#4b5563",
    "--color-gray-600": "#d1d5db",
    "--color-gray-700": "#e5e7eb",
    "--color-gray-900": "#f9fafb"
  },
  "high-contrast": {
    "--color-primary": "#000000",
    "--color-primary-light": "#ffffff",
    "--color-text": "#000000",
    "--color-background": "#ffffff",
    "--color-border": "#000000",
    "--color-gray-50": "#ffffff",
    "--color-gray-100": "#f0f0f0",
    "--color-gray-200": "#e0e0e0",
    "--color-gray-600": "#000000",
    "--color-gray-700": "#000000",
    "--color-gray-900": "#000000"
  }
}, Z = ({
  templates: u,
  templateName: s,
  data: a,
  theme: f = "light",
  className: m = "",
  style: h = {},
  showErrors: b = !0
}) => {
  const [j, $] = Oe(null), { workspace: E, template: e } = te(() => {
    try {
      $(null);
      const i = He(u), d = Ve(i, s);
      if (!d) {
        const c = i.templates.map((x) => x.name).join(", ");
        throw new Error(`Template "${s}" not found. Available templates: ${c}`);
      }
      return We(d, a) || console.warn("Template may not be fully compatible with provided data"), {
        workspace: i,
        template: d
      };
    } catch (i) {
      const d = i instanceof Error ? i.message : "Unknown error occurred";
      return $(d), { workspace: null, template: null };
    }
  }, [u, s, a]), o = te(() => {
    const i = Ge[f];
    return {
      ...h,
      ...i
    };
  }, [f, h]);
  return j ? b ? /* @__PURE__ */ r.jsxs(
    "div",
    {
      className: `fhir-widget fhir-widget-error ${m}`,
      style: {
        ...o,
        padding: "16px",
        border: "2px solid #ef4444",
        borderRadius: "8px",
        backgroundColor: "#fef2f2",
        color: "#dc2626"
      },
      children: [
        /* @__PURE__ */ r.jsxs("div", { style: { display: "flex", alignItems: "center", marginBottom: "8px" }, children: [
          /* @__PURE__ */ r.jsx("span", { style: { marginRight: "8px", fontSize: "18px" }, children: "⚠️" }),
          /* @__PURE__ */ r.jsx("strong", { children: "FHIR Widget Error" })
        ] }),
        /* @__PURE__ */ r.jsx("div", { style: { fontSize: "14px" }, children: j })
      ]
    }
  ) : null : !e || !E ? /* @__PURE__ */ r.jsx(
    "div",
    {
      className: `fhir-widget fhir-widget-loading ${m}`,
      style: {
        ...o,
        padding: "16px",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        backgroundColor: "var(--color-gray-50)",
        color: "var(--color-text)",
        textAlign: "center"
      },
      children: "Loading template..."
    }
  ) : /* @__PURE__ */ r.jsx(
    "div",
    {
      className: `fhir-widget fhir-widget-${f} ${m}`,
      style: o,
      children: /* @__PURE__ */ r.jsx(
        Je,
        {
          template: e,
          sampleData: a
        }
      )
    }
  );
};
Z.render = (u, s) => {
  if (typeof window > "u") return;
  const a = window.React, f = window.ReactDOM;
  if (!a || !f)
    throw new Error("React and ReactDOM must be available globally for FhirWidget.render()");
  const m = typeof s == "string" ? document.querySelector(s) : s;
  if (!m)
    throw new Error(`Container element not found: ${s}`);
  if (f.createRoot)
    f.createRoot(m).render(a.createElement(Z, u));
  else if (f.render)
    f.render(a.createElement(Z, u), m);
  else
    throw new Error("No compatible ReactDOM render method found");
};
const Ye = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Z
}, Symbol.toStringTag, { value: "Module" }));
typeof window < "u" && Promise.resolve().then(() => Ye).then((u) => {
  window.FhirWidget = u.default;
});
export {
  Z as FhirWidget,
  He as decodeWorkspace,
  Ve as findTemplateByName
};
