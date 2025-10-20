import React, { useState, useMemo } from "react";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hasRequiredReactJsxRuntime_production;
function requireReactJsxRuntime_production() {
  if (hasRequiredReactJsxRuntime_production) return reactJsxRuntime_production;
  hasRequiredReactJsxRuntime_production = 1;
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    void 0 !== maybeKey && (key = "" + maybeKey);
    void 0 !== config.key && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        "key" !== propName && (maybeKey[propName] = config[propName]);
    } else maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: void 0 !== config ? config : null,
      props: maybeKey
    };
  }
  reactJsxRuntime_production.Fragment = REACT_FRAGMENT_TYPE;
  reactJsxRuntime_production.jsx = jsxProd;
  reactJsxRuntime_production.jsxs = jsxProd;
  return reactJsxRuntime_production;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
function decodeWorkspace(base64String) {
  try {
    const decodedString = atob(base64String);
    const workspace = JSON.parse(decodedString);
    if (!workspace || typeof workspace !== "object") {
      throw new Error("Invalid workspace format");
    }
    if (!workspace.templates || !Array.isArray(workspace.templates)) {
      throw new Error("Workspace must contain a templates array");
    }
    return workspace;
  } catch (error) {
    throw new Error(`Failed to decode workspace: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function findTemplateByName(workspace, templateName) {
  if (!workspace.templates || !Array.isArray(workspace.templates)) {
    return null;
  }
  return workspace.templates.find((template) => template.name === templateName) || null;
}
function validateTemplateCompatibility(template, data) {
  if (!template || !data) return false;
  const dataResourceType = data.resourceType;
  if (template.resourceType && dataResourceType && template.resourceType !== dataResourceType) {
    console.warn(`Template resourceType "${template.resourceType}" doesn't match data resourceType "${dataResourceType}"`);
    return false;
  }
  return true;
}
var lodash_get;
var hasRequiredLodash_get;
function requireLodash_get() {
  if (hasRequiredLodash_get) return lodash_get;
  hasRequiredLodash_get = 1;
  var FUNC_ERROR_TEXT = "Expected a function";
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var funcTag = "[object Function]", genTag = "[object GeneratorFunction]", symbolTag = "[object Symbol]";
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, reLeadingDot = /^\./, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reEscapeChar = /\\(\\)?/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function("return this")();
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  function isHostObject(value) {
    var result = false;
    if (value != null && typeof value.toString != "function") {
      try {
        result = !!(value + "");
      } catch (e) {
      }
    }
    return result;
  }
  var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
  var coreJsData = root["__core-js_shared__"];
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  })();
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectToString = objectProto.toString;
  var reIsNative = RegExp(
    "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  var Symbol2 = root.Symbol, splice = arrayProto.splice;
  var Map = getNative(root, "Map"), nativeCreate = getNative(Object, "create");
  var symbolProto = Symbol2 ? Symbol2.prototype : void 0, symbolToString = symbolProto ? symbolProto.toString : void 0;
  function Hash(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
  }
  function hashDelete(key) {
    return this.has(key) && delete this.__data__[key];
  }
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : void 0;
  }
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
  }
  function hashSet(key, value) {
    var data = this.__data__;
    data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
    return this;
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype["delete"] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  function ListCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function listCacheClear() {
    this.__data__ = [];
  }
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    return true;
  }
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype["delete"] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  function MapCache(entries) {
    var index = -1, length = entries ? entries.length : 0;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  function mapCacheClear() {
    this.__data__ = {
      "hash": new Hash(),
      "map": new (Map || ListCache)(),
      "string": new Hash()
    };
  }
  function mapCacheDelete(key) {
    return getMapData(this, key)["delete"](key);
  }
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  function mapCacheSet(key, value) {
    getMapData(this, key).set(key, value);
    return this;
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype["delete"] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  function baseGet(object, path) {
    path = isKey(path, object) ? [path] : castPath(path);
    var index = 0, length = path.length;
    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return index && index == length ? object : void 0;
  }
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -Infinity ? "-0" : result;
  }
  function castPath(value) {
    return isArray(value) ? value : stringToPath(value);
  }
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : void 0;
  }
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var stringToPath = memoize(function(string) {
    string = toString(string);
    var result = [];
    if (reLeadingDot.test(string)) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, string2) {
      result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -Infinity ? "-0" : result;
  }
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result);
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  }
  memoize.Cache = MapCache;
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var isArray = Array.isArray;
  function isFunction(value) {
    var tag = isObject(value) ? objectToString.call(value) : "";
    return tag == funcTag || tag == genTag;
  }
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == "object" || type == "function");
  }
  function isObjectLike(value) {
    return !!value && typeof value == "object";
  }
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
  }
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  function get2(object, path, defaultValue) {
    var result = object == null ? void 0 : baseGet(object, path);
    return result === void 0 ? defaultValue : result;
  }
  lodash_get = get2;
  return lodash_get;
}
var lodash_getExports = requireLodash_get();
const get = /* @__PURE__ */ getDefaultExportFromCjs(lodash_getExports);
function evaluateExpression(_expression, _data) {
  return "";
}
const LivePreview = ({ template, sampleData }) => {
  const getResourceIcon = (resourceType) => {
    switch (resourceType) {
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
  };
  const getFieldValue = (fhirPath, data) => {
    if (!fhirPath || !data) return "";
    try {
      if (fhirPath.includes('telecom.find(t => t.system === "email").value')) {
        const telecom = data.telecom || [];
        const emailEntry = telecom.find((t) => t.system === "email");
        return emailEntry?.value || "";
      }
      if (fhirPath.includes('telecom.find(t => t.system === "phone").value')) {
        const telecom = data.telecom || [];
        const phoneEntry = telecom.find((t) => t.system === "phone");
        return phoneEntry?.value || "";
      }
      if (fhirPath.includes("contact[0].telecom.find(t => t.system === 'phone').value")) {
        const contact = data.contact?.[0];
        if (contact?.telecom) {
          const phoneEntry = contact.telecom.find((t) => t.system === "phone");
          return phoneEntry?.value || "";
        }
        return "";
      }
      const result = get(data, fhirPath);
      if (result === null || result === void 0) {
        return "";
      }
      if (typeof result === "object") {
        if (result.$$typeof || result.type || result.props) {
          return "[React Element]";
        }
        if (Array.isArray(result)) {
          return result.length > 0 ? JSON.stringify(result) : "";
        }
        return JSON.stringify(result);
      }
      return result;
    } catch (error) {
      console.error("Error resolving FHIR path:", fhirPath, error);
      return "";
    }
  };
  const generateItemLabel = (item, resourceType, index) => {
    if (!item) return `Item ${index + 1}`;
    try {
      switch (resourceType) {
        case "HumanName":
          const given = item.given?.[0] || item.firstName;
          const family = item.family || item.lastName;
          if (given || family) {
            return [given, family].filter(Boolean).join(" ");
          }
          if (item.use) return `${item.use.charAt(0).toUpperCase() + item.use.slice(1)} Name`;
          if (item.prefix) return `${item.prefix} Name`;
          break;
        case "ContactPoint":
          const system = item.system || "Contact";
          const value = item.value;
          if (value) {
            const systemLabel = system.charAt(0).toUpperCase() + system.slice(1);
            return `${systemLabel}: ${value}`;
          }
          if (item.use) return `${item.use.charAt(0).toUpperCase() + item.use.slice(1)} ${system}`;
          return `${system.charAt(0).toUpperCase() + system.slice(1)} Contact`;
        case "Address":
          const line1 = item.line?.[0] || item.street;
          const city = item.city;
          const state = item.state;
          if (line1 && city) {
            return `${line1}, ${city}`;
          } else if (city && state) {
            return `${city}, ${state}`;
          } else if (city) {
            return city;
          } else if (line1) {
            return line1;
          }
          if (item.use) return `${item.use.charAt(0).toUpperCase() + item.use.slice(1)} Address`;
          if (item.type) return `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Address`;
          break;
        case "Patient":
          const patientName = item.name?.[0];
          if (patientName) {
            const firstName = patientName.given?.[0];
            const lastName = patientName.family;
            if (firstName || lastName) {
              return [firstName, lastName].filter(Boolean).join(" ");
            }
          }
          if (item.id) return `Patient ${item.id}`;
          break;
      }
    } catch (error) {
      console.warn("Error generating item label:", error);
    }
    return `${resourceType} ${index + 1}`;
  };
  const renderNestedWidget = (field) => {
    const widgetField = field;
    const templateId = widgetField.widgetTemplateId;
    const resourceType = widgetField.widgetResourceType;
    if (!templateId) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🧩" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-700", children: field.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded", children: resourceType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "No template selected" })
      ] }, field.id);
    }
    let nestedTemplate = null;
    try {
      const stored = localStorage.getItem("fhir-templates");
      if (stored) {
        const parsed = JSON.parse(stored);
        nestedTemplate = (parsed.templates || []).find((t) => t.id === templateId) || null;
      }
    } catch (error) {
      console.error("Failed to load nested template:", error);
    }
    if (!nestedTemplate) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🧩" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium text-gray-700", children: field.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-200 text-red-600 px-2 py-1 rounded", children: "Error" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-600", children: [
          "Template not found: ",
          templateId
        ] })
      ] }, field.id);
    }
    let nestedData = null;
    if (field.fhirPath && sampleData) {
      try {
        nestedData = getFieldValue(field.fhirPath, sampleData);
      } catch (error) {
        console.error("Error extracting nested data:", error);
      }
    }
    if (!nestedData && nestedTemplate.sampleData) {
      nestedData = nestedTemplate.sampleData;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children: widgetField.multiple && Array.isArray(nestedData) ? (
      // Render multiple instances
      nestedData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: nestedData.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-gray-200 rounded-lg p-4 bg-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 pb-2 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-gray-700", children: generateItemLabel(item, resourceType, index) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500", children: resourceType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: nestedTemplate.fields.sort((a, b) => a.order - b.order).map((nestedField) => renderNestedField(nestedField, item)) })
      ] }, index)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 text-center text-gray-500 border border-gray-200 rounded-lg bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-2xl mb-2", children: "📭" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No items to display" })
      ] })
    ) : (
      // Render single instance
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: nestedTemplate.fields.sort((a, b) => a.order - b.order).map((nestedField) => renderNestedField(nestedField, nestedData)) })
    ) }, field.id);
  };
  const shouldHideField = (field, value) => {
    if (!field.hideIfEmpty) return false;
    if (value === null || value === void 0 || value === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === "object" && Object.keys(value).length === 0) return true;
    return false;
  };
  const getDisplayValue = (field, value) => {
    if (shouldHideField(field, value)) return "";
    if (!value && value !== 0 && value !== false) return "N/A";
    if (typeof value === "object" && value !== null) {
      if (value.$$typeof || value.type || value.props) {
        return "[React Element]";
      }
      return JSON.stringify(value);
    }
    return String(value);
  };
  const renderNestedField = (field, data) => {
    const value = field.fhirPath ? get(data, field.fhirPath) || "" : "";
    if (shouldHideField(field, value)) return null;
    switch (field.type) {
      case "label":
        const labelField = field;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `mb-2 ${labelField.fontSize === "xl" ? "text-xl" : labelField.fontSize === "lg" ? "text-lg" : labelField.fontSize === "sm" ? "text-sm" : "text-base"} ${labelField.fontWeight === "bold" ? "font-bold" : "font-normal"} text-gray-900 flex items-center`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2", children: "🏷️" }),
              field.label
            ]
          },
          field.id
        );
      case "text":
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📝" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-700", children: field.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "bg-gray-50 px-3 py-2 rounded border text-gray-900", children: getDisplayValue(field, value) })
        ] }, field.id);
      case "date":
        const formattedDate = value ? new Date(value).toLocaleDateString() : getDisplayValue(field, value);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📅" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-700", children: field.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "bg-gray-50 px-3 py-2 rounded border text-gray-900", children: formattedDate })
        ] }, field.id);
      case "select":
        const selectField = field;
        const displayValue = selectField.options?.find((opt) => opt.value === value)?.label || value || getDisplayValue(field, value);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "📋" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-700", children: field.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: displayValue })
        ] }, field.id);
      case "radio":
        const radioField = field;
        const radioDisplayValue = radioField.options?.find((opt) => opt.value === value)?.label || value || getDisplayValue(field, value);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🔘" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-700", children: field.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800", children: radioDisplayValue })
        ] }, field.id);
      case "checkbox":
        const isChecked = Boolean(value);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "☑️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-700", children: field.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isChecked ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`, children: isChecked ? "✓ Yes" : "✗ No" })
        ] }) }, field.id);
      case "group":
        const groupField = field;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 border border-gray-200 rounded-lg bg-white shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-md font-semibold text-gray-900 flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2", children: "📁" }),
            field.label
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: (groupField.children || []).sort((a, b) => a.order - b.order).map((child) => renderNestedField(child, data)) })
        ] }, field.id);
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 bg-white border border-gray-200 rounded-lg p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "❓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-sm font-medium text-gray-700", children: field.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "bg-gray-50 px-3 py-2 rounded border text-gray-900", children: getDisplayValue(field, value) })
        ] }, field.id);
    }
  };
  const renderField = (field) => {
    const value = field.expression && sampleData ? evaluateExpression(field.expression) : field.fhirPath ? getFieldValue(field.fhirPath, sampleData) : "";
    if (shouldHideField(field, value)) return null;
    switch (field.type) {
      case "label":
        const labelField = field;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `mb-2 ${labelField.fontSize === "sm" ? "text-sm" : labelField.fontSize === "lg" ? "text-lg" : labelField.fontSize === "xl" ? "text-xl" : "text-base"} ${labelField.fontWeight === "bold" ? "font-bold" : "font-normal"}`,
            style: { color: labelField.color || "inherit" },
            children: field.label
          },
          field.id
        );
      case "text":
        const getTextIcon = () => {
          const label = field.label.toLowerCase();
          if (label.includes("name") || label.includes("first") || label.includes("last")) return "👤";
          if (label.includes("email")) return "📧";
          if (label.includes("phone") || label.includes("tel")) return "📞";
          if (label.includes("address")) return "🏠";
          if (label.includes("city")) return "🏙️";
          if (label.includes("state")) return "🗺️";
          if (label.includes("zip") || label.includes("postal")) return "📮";
          if (label.includes("id")) return "🆔";
          return "📝";
        };
        const formatTextValue = () => {
          if (!value) return getDisplayValue(field, value);
          if (typeof value === "object" && value !== null) {
            if (value.$$typeof || value.type || value.props) {
              return "[React Element]";
            }
            return JSON.stringify(value);
          }
          const stringValue = String(value);
          if (field.label.toLowerCase().includes("email") && stringValue.includes("@")) {
            return stringValue;
          }
          if (field.label.toLowerCase().includes("phone") && stringValue.match(/^\+?[\d\s\-\(\)]+$/)) {
            return stringValue;
          }
          return stringValue;
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: getTextIcon() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex-1", children: [
            !field.hideLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              field.label,
              field.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: `${field.hideLabel ? "" : "mt-1"} text-base text-gray-900 font-medium`, children: formatTextValue() })
          ] })
        ] }, field.id);
      case "date":
        const formatDate = (dateValue) => {
          if (!dateValue) return getDisplayValue(field, dateValue);
          try {
            const date = new Date(dateValue);
            const formatted = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            });
            if (field.label.toLowerCase().includes("birth")) {
              const today = /* @__PURE__ */ new Date();
              const age = today.getFullYear() - date.getFullYear();
              const monthDiff = today.getMonth() - date.getMonth();
              const finalAge = monthDiff < 0 || monthDiff === 0 && today.getDate() < date.getDate() ? age - 1 : age;
              return `${formatted} (Age: ${finalAge})`;
            }
            return formatted;
          } catch {
            return dateValue;
          }
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "📅" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex-1", children: [
            !field.hideLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              field.label,
              field.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: `${field.hideLabel ? "" : "mt-1"} text-base text-gray-900 font-medium`, children: formatDate(value) })
          ] })
        ] }, field.id);
      case "select":
        const selectField = field;
        const getSelectDisplayValue = () => {
          if (!value) return getDisplayValue(field, value);
          const option = (selectField.options || []).find((opt) => opt.value === value);
          return option ? option.label : value;
        };
        const getIcon = () => {
          if (field.label.toLowerCase().includes("gender")) {
            return value === "male" ? "👨" : value === "female" ? "👩" : "👤";
          }
          if (field.label.toLowerCase().includes("status")) return "📊";
          if (field.label.toLowerCase().includes("type")) return "🏷️";
          return "📋";
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: getIcon() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex-1", children: [
            !field.hideLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              field.label,
              field.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: `${field.hideLabel ? "" : "mt-1"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize", children: getSelectDisplayValue() }) })
          ] })
        ] }, field.id);
      case "radio":
        const radioField = field;
        const getRadioDisplayValue = () => {
          if (!value) return getDisplayValue(field, value);
          const option = (radioField.options || []).find((opt) => opt.value === value);
          return option ? option.label : value;
        };
        const getRadioIcon = () => {
          if (field.label.toLowerCase().includes("gender")) {
            return value === "male" ? "👨" : value === "female" ? "👩" : "👤";
          }
          if (field.label.toLowerCase().includes("priority")) return "⚡";
          if (field.label.toLowerCase().includes("rating")) return "⭐";
          return "🔘";
        };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: getRadioIcon() }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex-1", children: [
            !field.hideLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              field.label,
              field.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: `${field.hideLabel ? "" : "mt-1"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200 capitalize", children: getRadioDisplayValue() }) })
          ] })
        ] }, field.id);
      case "checkbox":
        const isActive = Boolean(value);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start py-3 border-b border-gray-100 last:border-b-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: isActive ? "✅" : "❌" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex-1", children: [
            !field.hideLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("dt", { className: "text-sm font-medium text-gray-600", children: [
              field.label,
              field.required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 ml-1", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: `${field.hideLabel ? "" : "mt-1"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isActive ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"}`, children: isActive ? "Active" : "Inactive" }) })
          ] })
        ] }, field.id);
      case "group":
        const groupField = field;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 border border-gray-200 rounded-lg bg-white shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-2", children: "📁" }),
            field.label
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-4", children: (groupField.children || []).sort((a, b) => a.order - b.order).map((child) => renderField(child)) })
        ] }, field.id);
      case "widget":
        return renderNestedWidget(field);
      case "twoColumn":
        const twoColumnField = field;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex flex-col md:grid md:gap-2 space-y-4 md:space-y-0",
            style: {
              gridTemplateColumns: `${twoColumnField.leftWidth || 50}% 1fr`,
              gap: `${twoColumnField.gap || 16}px`
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: (twoColumnField.leftColumn || []).sort((a, b) => a.order - b.order).map((leftField) => renderField(leftField)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: (twoColumnField.rightColumn || []).sort((a, b) => a.order - b.order).map((rightField) => renderField(rightField)) })
            ]
          }
        ) }, field.id);
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-yellow-700", children: [
          "Unsupported field type: ",
          field.type
        ] }) }, field.id);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-gray-200 bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Live Preview" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Real-time preview of how your template renders with the sample data" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-6 pb-8 bg-white design-canvas-scroll", children: !sampleData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "mx-auto h-12 w-12 text-gray-400",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No sample data" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Provide sample FHIR data to see the preview." })
    ] }) : template.fields.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          className: "mx-auto h-12 w-12 text-gray-400",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "No fields" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Add fields to your template to see the preview." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg border border-gray-200 shadow-sm", children: [
      template.name && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 bg-blue-50 border-b border-blue-100 rounded-t-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold text-blue-900 flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-3", children: getResourceIcon(template.resourceType) }),
          template.name
        ] }),
        template.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-blue-700", children: template.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "space-y-4", children: template.fields.sort((a, b) => a.order - b.order).map((field) => renderField(field)).filter(Boolean) }) })
    ] }) }),
    sampleData && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-gray-200 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-600 space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center text-green-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mr-1", children: "✓" }),
          sampleData.resourceType || template.resourceType,
          " Resource"
        ] }),
        sampleData.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "ID: ",
          sampleData.id
        ] }),
        sampleData.active !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Active: ",
          sampleData.active ? "Yes" : "No"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
        template.fields.length,
        " fields rendered"
      ] })
    ] }) })
  ] });
};
const widgetThemes = {
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
};
const FhirWidget = ({
  templates,
  templateName,
  data,
  theme = "light",
  className = "",
  style = {},
  showErrors = true
}) => {
  const [error, setError] = useState(null);
  const { workspace, template } = useMemo(() => {
    try {
      setError(null);
      const decodedWorkspace = decodeWorkspace(templates);
      const foundTemplate = findTemplateByName(decodedWorkspace, templateName);
      if (!foundTemplate) {
        const availableNames = decodedWorkspace.templates.map((t) => t.name).join(", ");
        throw new Error(`Template "${templateName}" not found. Available templates: ${availableNames}`);
      }
      if (!validateTemplateCompatibility(foundTemplate, data)) {
        console.warn("Template may not be fully compatible with provided data");
      }
      return {
        workspace: decodedWorkspace,
        template: foundTemplate
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return { workspace: null, template: null };
    }
  }, [templates, templateName, data]);
  const themeStyles = useMemo(() => {
    const themeConfig = widgetThemes[theme];
    return {
      ...style,
      ...themeConfig
    };
  }, [theme, style]);
  if (error) {
    if (!showErrors) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `fhir-widget fhir-widget-error ${className}`,
        style: {
          ...themeStyles,
          padding: "16px",
          border: "2px solid #ef4444",
          borderRadius: "8px",
          backgroundColor: "#fef2f2",
          color: "#dc2626"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", marginBottom: "8px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginRight: "8px", fontSize: "18px" }, children: "⚠️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "FHIR Widget Error" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "14px" }, children: error })
        ]
      }
    );
  }
  if (!template || !workspace) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `fhir-widget fhir-widget-loading ${className}`,
        style: {
          ...themeStyles,
          padding: "16px",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          backgroundColor: "var(--color-gray-50)",
          color: "var(--color-text)",
          textAlign: "center"
        },
        children: "Loading template..."
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `fhir-widget fhir-widget-${theme} ${className}`,
      style: themeStyles,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        LivePreview,
        {
          template,
          sampleData: data
        }
      )
    }
  );
};
export {
  FhirWidget as default
};
