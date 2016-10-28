var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      if(goog.getObjectByName(namespace)) {
        break
      }
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.isProvided_ = function(name) {
    return!goog.implicitNamespaces_[name] && !!goog.getObjectByName(name)
  };
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if(!COMPILED) {
    if(goog.isProvided_(name)) {
      return
    }
    if(goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if(path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return
      }
    }
    var errorMessage = "goog.require could not find: " + name;
    if(goog.global.console) {
      goog.global.console["error"](errorMessage)
    }
    throw Error(errorMessage);
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(var_args) {
  return arguments[0]
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    return ctor.instance_ || (ctor.instance_ = new ctor)
  }
};
if(!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(!goog.isProvided_(requireName)) {
            if(requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName])
            }else {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call(value);
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.propertyIsEnumerableCustom_ = function(object, propName) {
  if(propName in object) {
    for(var key in object) {
      if(key == propName && Object.prototype.hasOwnProperty.call(object, propName)) {
        return true
      }
    }
  }
  return false
};
goog.propertyIsEnumerable_ = function(object, propName) {
  if(object instanceof Object) {
    return Object.prototype.propertyIsEnumerable.call(object, propName)
  }else {
    return goog.propertyIsEnumerableCustom_(object, propName)
  }
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == "object" || type == "array" || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
Object.prototype.clone;
goog.bindNative_ = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments)
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if(!fn) {
    throw new Error;
  }
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs)
    }
  }else {
    return function() {
      return fn.apply(selfObj, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if(!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  this.stack = (new Error).stack || "";
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.subs = function(str, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var replacement = String(arguments[i]).replace(/\$/g, "$$$$");
    str = str.replace(/\%s/, replacement)
  }
  return str
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, "")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function(str) {
  str = String(str);
  if(!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str)
  }
  return str
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {"&amp;":"&", "&lt;":"<", "&gt;":">", "&quot;":'"'};
  var div = document.createElement("div");
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if(value) {
      return value
    }
    if(entity.charAt(0) == "#") {
      var n = Number("0" + entity.substr(1));
      if(!isNaN(n)) {
        value = String.fromCharCode(n)
      }
    }
    if(!value) {
      div.innerHTML = s + " ";
      value = div.firstChild.nodeValue.slice(0, -1)
    }
    return seen[s] = value
  })
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars && str.length > chars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\x0B":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2])
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function(str) {
  return goog.string.toCamelCaseCache_[str] || (goog.string.toCamelCaseCache_[str] = String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function(str) {
  return goog.string.toSelectorCaseCache_[str] || (goog.string.toSelectorCaseCache_[str] = String(str).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.string");
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.NATIVE_ARRAY_PROTOTYPES = true;
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = function(arr, f, val, opt_obj) {
  if(arr.reduce) {
    if(opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduce(f, val)
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if(arr.reduceRight) {
    if(opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduceRight(f, val)
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function(arr) {
  if(goog.isArray(arr)) {
    return goog.array.concat(arr)
  }else {
    var rv = [];
    for(var i = 0, len = arr.length;i < len;i++) {
      rv[i] = arr[i]
    }
    return rv
  }
};
goog.array.toArray = function(object) {
  if(goog.isArray(object)) {
    return goog.array.concat(object)
  }
  return goog.array.clone(object)
};
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && arr2.hasOwnProperty("callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current;
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn)
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for(var i = 0;i < l;i++) {
    var result = compare(arr1[i], arr2[i]);
    if(result != 0) {
      return result
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for(var key in obj) {
    f.call(opt_obj, obj[key], key, obj)
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key]
    }
  }
  return res
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj)
  }
  return res
};
goog.object.some = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      return true
    }
  }
  return false
};
goog.object.every = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(!f.call(opt_obj, obj[key], key, obj)) {
      return false
    }
  }
  return true
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for(var key in obj) {
    rv++
  }
  return rv
};
goog.object.getAnyKey = function(obj) {
  for(var key in obj) {
    return key
  }
};
goog.object.getAnyValue = function(obj) {
  for(var key in obj) {
    return obj[key]
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val)
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = obj[key]
  }
  return res
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = key
  }
  return res
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return obj
};
goog.object.containsKey = function(obj, key) {
  return key in obj
};
goog.object.containsValue = function(obj, val) {
  for(var key in obj) {
    if(obj[key] == val) {
      return true
    }
  }
  return false
};
goog.object.findKey = function(obj, f, opt_this) {
  for(var key in obj) {
    if(f.call(opt_this, obj[key], key, obj)) {
      return key
    }
  }
  return undefined
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key]
};
goog.object.isEmpty = function(obj) {
  for(var key in obj) {
    return false
  }
  return true
};
goog.object.clear = function(obj) {
  for(var i in obj) {
    delete obj[i]
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if(rv = key in obj) {
    delete obj[key]
  }
  return rv
};
goog.object.add = function(obj, key, val) {
  if(key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val)
};
goog.object.get = function(obj, key, opt_val) {
  if(key in obj) {
    return obj[key]
  }
  return opt_val
};
goog.object.set = function(obj, key, value) {
  obj[key] = value
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value
};
goog.object.clone = function(obj) {
  var res = {};
  for(var key in obj) {
    res[key] = obj[key]
  }
  return res
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key])
    }
    return clone
  }
  return obj
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for(var key in obj) {
    transposed[obj[key]] = key
  }
  return transposed
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for(var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for(key in source) {
      target[key] = source[key]
    }
    for(var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if(Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for(var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1]
  }
  return rv
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  var rv = {};
  for(var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true
  }
  return rv
};
goog.provide("goog.string.format");
goog.require("goog.string");
goog.string.format = function(formatString, var_args) {
  var args = Array.prototype.slice.call(arguments);
  var template = args.shift();
  if(typeof template == "undefined") {
    throw Error("[goog.string.format] Template required");
  }
  var formatRe = /%([0\-\ \+]*)(\d+)?(\.(\d+))?([%sfdiu])/g;
  function replacerDemuxer(match, flags, width, dotp, precision, type, offset, wholeString) {
    if(type == "%") {
      return"%"
    }
    var value = args.shift();
    if(typeof value == "undefined") {
      throw Error("[goog.string.format] Not enough arguments");
    }
    arguments[0] = value;
    return goog.string.format.demuxes_[type].apply(null, arguments)
  }
  return template.replace(formatRe, replacerDemuxer)
};
goog.string.format.demuxes_ = {};
goog.string.format.demuxes_["s"] = function(value, flags, width, dotp, precision, type, offset, wholeString) {
  var replacement = value;
  if(isNaN(width) || width == "" || replacement.length >= width) {
    return replacement
  }
  if(flags.indexOf("-", 0) > -1) {
    replacement = replacement + goog.string.repeat(" ", width - replacement.length)
  }else {
    replacement = goog.string.repeat(" ", width - replacement.length) + replacement
  }
  return replacement
};
goog.string.format.demuxes_["f"] = function(value, flags, width, dotp, precision, type, offset, wholeString) {
  var replacement = value.toString();
  if(!(isNaN(precision) || precision == "")) {
    replacement = value.toFixed(precision)
  }
  var sign;
  if(value < 0) {
    sign = "-"
  }else {
    if(flags.indexOf("+") >= 0) {
      sign = "+"
    }else {
      if(flags.indexOf(" ") >= 0) {
        sign = " "
      }else {
        sign = ""
      }
    }
  }
  if(value >= 0) {
    replacement = sign + replacement
  }
  if(isNaN(width) || replacement.length >= width) {
    return replacement
  }
  replacement = isNaN(precision) ? Math.abs(value).toString() : Math.abs(value).toFixed(precision);
  var padCount = width - replacement.length - sign.length;
  if(flags.indexOf("-", 0) >= 0) {
    replacement = sign + replacement + goog.string.repeat(" ", padCount)
  }else {
    var paddingChar = flags.indexOf("0", 0) >= 0 ? "0" : " ";
    replacement = sign + goog.string.repeat(paddingChar, padCount) + replacement
  }
  return replacement
};
goog.string.format.demuxes_["d"] = function(value, flags, width, dotp, precision, type, offset, wholeString) {
  return goog.string.format.demuxes_["f"](parseInt(value, 10), flags, width, dotp, 0, type, offset, wholeString)
};
goog.string.format.demuxes_["i"] = goog.string.format.demuxes_["d"];
goog.string.format.demuxes_["u"] = goog.string.format.demuxes_["d"];
goog.provide("goog.userAgent.jscript");
goog.require("goog.string");
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = false;
goog.userAgent.jscript.init_ = function() {
  var hasScriptEngine = "ScriptEngine" in goog.global;
  goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ = hasScriptEngine && goog.global["ScriptEngine"]() == "JScript";
  goog.userAgent.jscript.DETECTED_VERSION_ = goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ? goog.global["ScriptEngineMajorVersion"]() + "." + goog.global["ScriptEngineMinorVersion"]() + "." + goog.global["ScriptEngineBuildVersion"]() : "0"
};
if(!goog.userAgent.jscript.ASSUME_NO_JSCRIPT) {
  goog.userAgent.jscript.init_()
}
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? false : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? "0" : goog.userAgent.jscript.DETECTED_VERSION_;
goog.userAgent.jscript.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.jscript.VERSION, version) >= 0
};
goog.provide("goog.string.StringBuffer");
goog.require("goog.userAgent.jscript");
goog.string.StringBuffer = function(opt_a1, var_args) {
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : "";
  if(opt_a1 != null) {
    this.append.apply(this, arguments)
  }
};
goog.string.StringBuffer.prototype.set = function(s) {
  this.clear();
  this.append(s)
};
if(goog.userAgent.jscript.HAS_JSCRIPT) {
  goog.string.StringBuffer.prototype.bufferLength_ = 0;
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    if(opt_a2 == null) {
      this.buffer_[this.bufferLength_++] = a1
    }else {
      this.buffer_.push.apply(this.buffer_, arguments);
      this.bufferLength_ = this.buffer_.length
    }
    return this
  }
}else {
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    this.buffer_ += a1;
    if(opt_a2 != null) {
      for(var i = 1;i < arguments.length;i++) {
        this.buffer_ += arguments[i]
      }
    }
    return this
  }
}
goog.string.StringBuffer.prototype.clear = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    this.buffer_.length = 0;
    this.bufferLength_ = 0
  }else {
    this.buffer_ = ""
  }
};
goog.string.StringBuffer.prototype.getLength = function() {
  return this.toString().length
};
goog.string.StringBuffer.prototype.toString = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    var str = this.buffer_.join("");
    this.clear();
    if(str) {
      this.append(str)
    }
    return str
  }else {
    return this.buffer_
  }
};
goog.provide("cljs.core");
goog.require("goog.array");
goog.require("goog.object");
goog.require("goog.string.format");
goog.require("goog.string.StringBuffer");
goog.require("goog.string");
cljs.core._STAR_unchecked_if_STAR_ = false;
cljs.core._STAR_print_fn_STAR_ = function _STAR_print_fn_STAR_(_) {
  throw new Error("No *print-fn* fn set for evaluation environment");
};
cljs.core.truth_ = function truth_(x) {
  return x != null && x !== false
};
cljs.core.type_satisfies_ = function type_satisfies_(p, x) {
  var x__6531 = x == null ? null : x;
  if(p[goog.typeOf(x__6531)]) {
    return true
  }else {
    if(p["_"]) {
      return true
    }else {
      if("\ufdd0'else") {
        return false
      }else {
        return null
      }
    }
  }
};
cljs.core.is_proto_ = function is_proto_(x) {
  return x.constructor.prototype === x
};
cljs.core._STAR_main_cli_fn_STAR_ = null;
cljs.core.missing_protocol = function missing_protocol(proto, obj) {
  return Error(["No protocol method ", proto, " defined for type ", goog.typeOf(obj), ": ", obj].join(""))
};
cljs.core.aclone = function aclone(array_like) {
  return array_like.slice()
};
cljs.core.array = function array(var_args) {
  return Array.prototype.slice.call(arguments)
};
cljs.core.make_array = function() {
  var make_array = null;
  var make_array__1 = function(size) {
    return new Array(size)
  };
  var make_array__2 = function(type, size) {
    return make_array.call(null, size)
  };
  make_array = function(type, size) {
    switch(arguments.length) {
      case 1:
        return make_array__1.call(this, type);
      case 2:
        return make_array__2.call(this, type, size)
    }
    throw"Invalid arity: " + arguments.length;
  };
  make_array.cljs$lang$arity$1 = make_array__1;
  make_array.cljs$lang$arity$2 = make_array__2;
  return make_array
}();
cljs.core.aget = function() {
  var aget = null;
  var aget__2 = function(array, i) {
    return array[i]
  };
  var aget__3 = function() {
    var G__6532__delegate = function(array, i, idxs) {
      return cljs.core.apply.call(null, aget, aget.call(null, array, i), idxs)
    };
    var G__6532 = function(array, i, var_args) {
      var idxs = null;
      if(goog.isDef(var_args)) {
        idxs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__6532__delegate.call(this, array, i, idxs)
    };
    G__6532.cljs$lang$maxFixedArity = 2;
    G__6532.cljs$lang$applyTo = function(arglist__6533) {
      var array = cljs.core.first(arglist__6533);
      var i = cljs.core.first(cljs.core.next(arglist__6533));
      var idxs = cljs.core.rest(cljs.core.next(arglist__6533));
      return G__6532__delegate(array, i, idxs)
    };
    G__6532.cljs$lang$arity$variadic = G__6532__delegate;
    return G__6532
  }();
  aget = function(array, i, var_args) {
    var idxs = var_args;
    switch(arguments.length) {
      case 2:
        return aget__2.call(this, array, i);
      default:
        return aget__3.cljs$lang$arity$variadic(array, i, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  aget.cljs$lang$maxFixedArity = 2;
  aget.cljs$lang$applyTo = aget__3.cljs$lang$applyTo;
  aget.cljs$lang$arity$2 = aget__2;
  aget.cljs$lang$arity$variadic = aget__3.cljs$lang$arity$variadic;
  return aget
}();
cljs.core.aset = function aset(array, i, val) {
  return array[i] = val
};
cljs.core.alength = function alength(array) {
  return array.length
};
cljs.core.into_array = function() {
  var into_array = null;
  var into_array__1 = function(aseq) {
    return into_array.call(null, null, aseq)
  };
  var into_array__2 = function(type, aseq) {
    return cljs.core.reduce.call(null, function(a, x) {
      a.push(x);
      return a
    }, [], aseq)
  };
  into_array = function(type, aseq) {
    switch(arguments.length) {
      case 1:
        return into_array__1.call(this, type);
      case 2:
        return into_array__2.call(this, type, aseq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  into_array.cljs$lang$arity$1 = into_array__1;
  into_array.cljs$lang$arity$2 = into_array__2;
  return into_array
}();
cljs.core.IFn = {};
cljs.core._invoke = function() {
  var _invoke = null;
  var _invoke__1 = function(this$) {
    if(function() {
      var and__3822__auto____6618 = this$;
      if(and__3822__auto____6618) {
        return this$.cljs$core$IFn$_invoke$arity$1
      }else {
        return and__3822__auto____6618
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$1(this$)
    }else {
      var x__2363__auto____6619 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6620 = cljs.core._invoke[goog.typeOf(x__2363__auto____6619)];
        if(or__3824__auto____6620) {
          return or__3824__auto____6620
        }else {
          var or__3824__auto____6621 = cljs.core._invoke["_"];
          if(or__3824__auto____6621) {
            return or__3824__auto____6621
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__2 = function(this$, a) {
    if(function() {
      var and__3822__auto____6622 = this$;
      if(and__3822__auto____6622) {
        return this$.cljs$core$IFn$_invoke$arity$2
      }else {
        return and__3822__auto____6622
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$2(this$, a)
    }else {
      var x__2363__auto____6623 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6624 = cljs.core._invoke[goog.typeOf(x__2363__auto____6623)];
        if(or__3824__auto____6624) {
          return or__3824__auto____6624
        }else {
          var or__3824__auto____6625 = cljs.core._invoke["_"];
          if(or__3824__auto____6625) {
            return or__3824__auto____6625
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__3 = function(this$, a, b) {
    if(function() {
      var and__3822__auto____6626 = this$;
      if(and__3822__auto____6626) {
        return this$.cljs$core$IFn$_invoke$arity$3
      }else {
        return and__3822__auto____6626
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$3(this$, a, b)
    }else {
      var x__2363__auto____6627 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6628 = cljs.core._invoke[goog.typeOf(x__2363__auto____6627)];
        if(or__3824__auto____6628) {
          return or__3824__auto____6628
        }else {
          var or__3824__auto____6629 = cljs.core._invoke["_"];
          if(or__3824__auto____6629) {
            return or__3824__auto____6629
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__4 = function(this$, a, b, c) {
    if(function() {
      var and__3822__auto____6630 = this$;
      if(and__3822__auto____6630) {
        return this$.cljs$core$IFn$_invoke$arity$4
      }else {
        return and__3822__auto____6630
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$4(this$, a, b, c)
    }else {
      var x__2363__auto____6631 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6632 = cljs.core._invoke[goog.typeOf(x__2363__auto____6631)];
        if(or__3824__auto____6632) {
          return or__3824__auto____6632
        }else {
          var or__3824__auto____6633 = cljs.core._invoke["_"];
          if(or__3824__auto____6633) {
            return or__3824__auto____6633
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__5 = function(this$, a, b, c, d) {
    if(function() {
      var and__3822__auto____6634 = this$;
      if(and__3822__auto____6634) {
        return this$.cljs$core$IFn$_invoke$arity$5
      }else {
        return and__3822__auto____6634
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$5(this$, a, b, c, d)
    }else {
      var x__2363__auto____6635 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6636 = cljs.core._invoke[goog.typeOf(x__2363__auto____6635)];
        if(or__3824__auto____6636) {
          return or__3824__auto____6636
        }else {
          var or__3824__auto____6637 = cljs.core._invoke["_"];
          if(or__3824__auto____6637) {
            return or__3824__auto____6637
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__6 = function(this$, a, b, c, d, e) {
    if(function() {
      var and__3822__auto____6638 = this$;
      if(and__3822__auto____6638) {
        return this$.cljs$core$IFn$_invoke$arity$6
      }else {
        return and__3822__auto____6638
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$6(this$, a, b, c, d, e)
    }else {
      var x__2363__auto____6639 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6640 = cljs.core._invoke[goog.typeOf(x__2363__auto____6639)];
        if(or__3824__auto____6640) {
          return or__3824__auto____6640
        }else {
          var or__3824__auto____6641 = cljs.core._invoke["_"];
          if(or__3824__auto____6641) {
            return or__3824__auto____6641
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__7 = function(this$, a, b, c, d, e, f) {
    if(function() {
      var and__3822__auto____6642 = this$;
      if(and__3822__auto____6642) {
        return this$.cljs$core$IFn$_invoke$arity$7
      }else {
        return and__3822__auto____6642
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$7(this$, a, b, c, d, e, f)
    }else {
      var x__2363__auto____6643 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6644 = cljs.core._invoke[goog.typeOf(x__2363__auto____6643)];
        if(or__3824__auto____6644) {
          return or__3824__auto____6644
        }else {
          var or__3824__auto____6645 = cljs.core._invoke["_"];
          if(or__3824__auto____6645) {
            return or__3824__auto____6645
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__8 = function(this$, a, b, c, d, e, f, g) {
    if(function() {
      var and__3822__auto____6646 = this$;
      if(and__3822__auto____6646) {
        return this$.cljs$core$IFn$_invoke$arity$8
      }else {
        return and__3822__auto____6646
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$8(this$, a, b, c, d, e, f, g)
    }else {
      var x__2363__auto____6647 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6648 = cljs.core._invoke[goog.typeOf(x__2363__auto____6647)];
        if(or__3824__auto____6648) {
          return or__3824__auto____6648
        }else {
          var or__3824__auto____6649 = cljs.core._invoke["_"];
          if(or__3824__auto____6649) {
            return or__3824__auto____6649
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__9 = function(this$, a, b, c, d, e, f, g, h) {
    if(function() {
      var and__3822__auto____6650 = this$;
      if(and__3822__auto____6650) {
        return this$.cljs$core$IFn$_invoke$arity$9
      }else {
        return and__3822__auto____6650
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$9(this$, a, b, c, d, e, f, g, h)
    }else {
      var x__2363__auto____6651 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6652 = cljs.core._invoke[goog.typeOf(x__2363__auto____6651)];
        if(or__3824__auto____6652) {
          return or__3824__auto____6652
        }else {
          var or__3824__auto____6653 = cljs.core._invoke["_"];
          if(or__3824__auto____6653) {
            return or__3824__auto____6653
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__10 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(function() {
      var and__3822__auto____6654 = this$;
      if(and__3822__auto____6654) {
        return this$.cljs$core$IFn$_invoke$arity$10
      }else {
        return and__3822__auto____6654
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$10(this$, a, b, c, d, e, f, g, h, i)
    }else {
      var x__2363__auto____6655 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6656 = cljs.core._invoke[goog.typeOf(x__2363__auto____6655)];
        if(or__3824__auto____6656) {
          return or__3824__auto____6656
        }else {
          var or__3824__auto____6657 = cljs.core._invoke["_"];
          if(or__3824__auto____6657) {
            return or__3824__auto____6657
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__11 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(function() {
      var and__3822__auto____6658 = this$;
      if(and__3822__auto____6658) {
        return this$.cljs$core$IFn$_invoke$arity$11
      }else {
        return and__3822__auto____6658
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$11(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      var x__2363__auto____6659 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6660 = cljs.core._invoke[goog.typeOf(x__2363__auto____6659)];
        if(or__3824__auto____6660) {
          return or__3824__auto____6660
        }else {
          var or__3824__auto____6661 = cljs.core._invoke["_"];
          if(or__3824__auto____6661) {
            return or__3824__auto____6661
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__12 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(function() {
      var and__3822__auto____6662 = this$;
      if(and__3822__auto____6662) {
        return this$.cljs$core$IFn$_invoke$arity$12
      }else {
        return and__3822__auto____6662
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$12(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      var x__2363__auto____6663 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6664 = cljs.core._invoke[goog.typeOf(x__2363__auto____6663)];
        if(or__3824__auto____6664) {
          return or__3824__auto____6664
        }else {
          var or__3824__auto____6665 = cljs.core._invoke["_"];
          if(or__3824__auto____6665) {
            return or__3824__auto____6665
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__13 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(function() {
      var and__3822__auto____6666 = this$;
      if(and__3822__auto____6666) {
        return this$.cljs$core$IFn$_invoke$arity$13
      }else {
        return and__3822__auto____6666
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$13(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      var x__2363__auto____6667 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6668 = cljs.core._invoke[goog.typeOf(x__2363__auto____6667)];
        if(or__3824__auto____6668) {
          return or__3824__auto____6668
        }else {
          var or__3824__auto____6669 = cljs.core._invoke["_"];
          if(or__3824__auto____6669) {
            return or__3824__auto____6669
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__14 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(function() {
      var and__3822__auto____6670 = this$;
      if(and__3822__auto____6670) {
        return this$.cljs$core$IFn$_invoke$arity$14
      }else {
        return and__3822__auto____6670
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$14(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      var x__2363__auto____6671 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6672 = cljs.core._invoke[goog.typeOf(x__2363__auto____6671)];
        if(or__3824__auto____6672) {
          return or__3824__auto____6672
        }else {
          var or__3824__auto____6673 = cljs.core._invoke["_"];
          if(or__3824__auto____6673) {
            return or__3824__auto____6673
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__15 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(function() {
      var and__3822__auto____6674 = this$;
      if(and__3822__auto____6674) {
        return this$.cljs$core$IFn$_invoke$arity$15
      }else {
        return and__3822__auto____6674
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$15(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      var x__2363__auto____6675 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6676 = cljs.core._invoke[goog.typeOf(x__2363__auto____6675)];
        if(or__3824__auto____6676) {
          return or__3824__auto____6676
        }else {
          var or__3824__auto____6677 = cljs.core._invoke["_"];
          if(or__3824__auto____6677) {
            return or__3824__auto____6677
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__16 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(function() {
      var and__3822__auto____6678 = this$;
      if(and__3822__auto____6678) {
        return this$.cljs$core$IFn$_invoke$arity$16
      }else {
        return and__3822__auto____6678
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$16(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      var x__2363__auto____6679 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6680 = cljs.core._invoke[goog.typeOf(x__2363__auto____6679)];
        if(or__3824__auto____6680) {
          return or__3824__auto____6680
        }else {
          var or__3824__auto____6681 = cljs.core._invoke["_"];
          if(or__3824__auto____6681) {
            return or__3824__auto____6681
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__17 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(function() {
      var and__3822__auto____6682 = this$;
      if(and__3822__auto____6682) {
        return this$.cljs$core$IFn$_invoke$arity$17
      }else {
        return and__3822__auto____6682
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$17(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      var x__2363__auto____6683 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6684 = cljs.core._invoke[goog.typeOf(x__2363__auto____6683)];
        if(or__3824__auto____6684) {
          return or__3824__auto____6684
        }else {
          var or__3824__auto____6685 = cljs.core._invoke["_"];
          if(or__3824__auto____6685) {
            return or__3824__auto____6685
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__18 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(function() {
      var and__3822__auto____6686 = this$;
      if(and__3822__auto____6686) {
        return this$.cljs$core$IFn$_invoke$arity$18
      }else {
        return and__3822__auto____6686
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$18(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      var x__2363__auto____6687 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6688 = cljs.core._invoke[goog.typeOf(x__2363__auto____6687)];
        if(or__3824__auto____6688) {
          return or__3824__auto____6688
        }else {
          var or__3824__auto____6689 = cljs.core._invoke["_"];
          if(or__3824__auto____6689) {
            return or__3824__auto____6689
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__19 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(function() {
      var and__3822__auto____6690 = this$;
      if(and__3822__auto____6690) {
        return this$.cljs$core$IFn$_invoke$arity$19
      }else {
        return and__3822__auto____6690
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$19(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      var x__2363__auto____6691 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6692 = cljs.core._invoke[goog.typeOf(x__2363__auto____6691)];
        if(or__3824__auto____6692) {
          return or__3824__auto____6692
        }else {
          var or__3824__auto____6693 = cljs.core._invoke["_"];
          if(or__3824__auto____6693) {
            return or__3824__auto____6693
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__20 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(function() {
      var and__3822__auto____6694 = this$;
      if(and__3822__auto____6694) {
        return this$.cljs$core$IFn$_invoke$arity$20
      }else {
        return and__3822__auto____6694
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$20(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      var x__2363__auto____6695 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6696 = cljs.core._invoke[goog.typeOf(x__2363__auto____6695)];
        if(or__3824__auto____6696) {
          return or__3824__auto____6696
        }else {
          var or__3824__auto____6697 = cljs.core._invoke["_"];
          if(or__3824__auto____6697) {
            return or__3824__auto____6697
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__21 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(function() {
      var and__3822__auto____6698 = this$;
      if(and__3822__auto____6698) {
        return this$.cljs$core$IFn$_invoke$arity$21
      }else {
        return and__3822__auto____6698
      }
    }()) {
      return this$.cljs$core$IFn$_invoke$arity$21(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      var x__2363__auto____6699 = this$ == null ? null : this$;
      return function() {
        var or__3824__auto____6700 = cljs.core._invoke[goog.typeOf(x__2363__auto____6699)];
        if(or__3824__auto____6700) {
          return or__3824__auto____6700
        }else {
          var or__3824__auto____6701 = cljs.core._invoke["_"];
          if(or__3824__auto____6701) {
            return or__3824__auto____6701
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
  };
  _invoke = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    switch(arguments.length) {
      case 1:
        return _invoke__1.call(this, this$);
      case 2:
        return _invoke__2.call(this, this$, a);
      case 3:
        return _invoke__3.call(this, this$, a, b);
      case 4:
        return _invoke__4.call(this, this$, a, b, c);
      case 5:
        return _invoke__5.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__6.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__7.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__8.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__9.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__10.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__11.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__12.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__13.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__14.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__15.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__16.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__17.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__18.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__19.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__20.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__21.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _invoke.cljs$lang$arity$1 = _invoke__1;
  _invoke.cljs$lang$arity$2 = _invoke__2;
  _invoke.cljs$lang$arity$3 = _invoke__3;
  _invoke.cljs$lang$arity$4 = _invoke__4;
  _invoke.cljs$lang$arity$5 = _invoke__5;
  _invoke.cljs$lang$arity$6 = _invoke__6;
  _invoke.cljs$lang$arity$7 = _invoke__7;
  _invoke.cljs$lang$arity$8 = _invoke__8;
  _invoke.cljs$lang$arity$9 = _invoke__9;
  _invoke.cljs$lang$arity$10 = _invoke__10;
  _invoke.cljs$lang$arity$11 = _invoke__11;
  _invoke.cljs$lang$arity$12 = _invoke__12;
  _invoke.cljs$lang$arity$13 = _invoke__13;
  _invoke.cljs$lang$arity$14 = _invoke__14;
  _invoke.cljs$lang$arity$15 = _invoke__15;
  _invoke.cljs$lang$arity$16 = _invoke__16;
  _invoke.cljs$lang$arity$17 = _invoke__17;
  _invoke.cljs$lang$arity$18 = _invoke__18;
  _invoke.cljs$lang$arity$19 = _invoke__19;
  _invoke.cljs$lang$arity$20 = _invoke__20;
  _invoke.cljs$lang$arity$21 = _invoke__21;
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(function() {
    var and__3822__auto____6706 = coll;
    if(and__3822__auto____6706) {
      return coll.cljs$core$ICounted$_count$arity$1
    }else {
      return and__3822__auto____6706
    }
  }()) {
    return coll.cljs$core$ICounted$_count$arity$1(coll)
  }else {
    var x__2363__auto____6707 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6708 = cljs.core._count[goog.typeOf(x__2363__auto____6707)];
      if(or__3824__auto____6708) {
        return or__3824__auto____6708
      }else {
        var or__3824__auto____6709 = cljs.core._count["_"];
        if(or__3824__auto____6709) {
          return or__3824__auto____6709
        }else {
          throw cljs.core.missing_protocol.call(null, "ICounted.-count", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IEmptyableCollection = {};
cljs.core._empty = function _empty(coll) {
  if(function() {
    var and__3822__auto____6714 = coll;
    if(and__3822__auto____6714) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1
    }else {
      return and__3822__auto____6714
    }
  }()) {
    return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
  }else {
    var x__2363__auto____6715 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6716 = cljs.core._empty[goog.typeOf(x__2363__auto____6715)];
      if(or__3824__auto____6716) {
        return or__3824__auto____6716
      }else {
        var or__3824__auto____6717 = cljs.core._empty["_"];
        if(or__3824__auto____6717) {
          return or__3824__auto____6717
        }else {
          throw cljs.core.missing_protocol.call(null, "IEmptyableCollection.-empty", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ICollection = {};
cljs.core._conj = function _conj(coll, o) {
  if(function() {
    var and__3822__auto____6722 = coll;
    if(and__3822__auto____6722) {
      return coll.cljs$core$ICollection$_conj$arity$2
    }else {
      return and__3822__auto____6722
    }
  }()) {
    return coll.cljs$core$ICollection$_conj$arity$2(coll, o)
  }else {
    var x__2363__auto____6723 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6724 = cljs.core._conj[goog.typeOf(x__2363__auto____6723)];
      if(or__3824__auto____6724) {
        return or__3824__auto____6724
      }else {
        var or__3824__auto____6725 = cljs.core._conj["_"];
        if(or__3824__auto____6725) {
          return or__3824__auto____6725
        }else {
          throw cljs.core.missing_protocol.call(null, "ICollection.-conj", coll);
        }
      }
    }().call(null, coll, o)
  }
};
cljs.core.IIndexed = {};
cljs.core._nth = function() {
  var _nth = null;
  var _nth__2 = function(coll, n) {
    if(function() {
      var and__3822__auto____6734 = coll;
      if(and__3822__auto____6734) {
        return coll.cljs$core$IIndexed$_nth$arity$2
      }else {
        return and__3822__auto____6734
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
    }else {
      var x__2363__auto____6735 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6736 = cljs.core._nth[goog.typeOf(x__2363__auto____6735)];
        if(or__3824__auto____6736) {
          return or__3824__auto____6736
        }else {
          var or__3824__auto____6737 = cljs.core._nth["_"];
          if(or__3824__auto____6737) {
            return or__3824__auto____6737
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__3 = function(coll, n, not_found) {
    if(function() {
      var and__3822__auto____6738 = coll;
      if(and__3822__auto____6738) {
        return coll.cljs$core$IIndexed$_nth$arity$3
      }else {
        return and__3822__auto____6738
      }
    }()) {
      return coll.cljs$core$IIndexed$_nth$arity$3(coll, n, not_found)
    }else {
      var x__2363__auto____6739 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6740 = cljs.core._nth[goog.typeOf(x__2363__auto____6739)];
        if(or__3824__auto____6740) {
          return or__3824__auto____6740
        }else {
          var or__3824__auto____6741 = cljs.core._nth["_"];
          if(or__3824__auto____6741) {
            return or__3824__auto____6741
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n, not_found)
    }
  };
  _nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return _nth__2.call(this, coll, n);
      case 3:
        return _nth__3.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _nth.cljs$lang$arity$2 = _nth__2;
  _nth.cljs$lang$arity$3 = _nth__3;
  return _nth
}();
cljs.core.ASeq = {};
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(function() {
    var and__3822__auto____6746 = coll;
    if(and__3822__auto____6746) {
      return coll.cljs$core$ISeq$_first$arity$1
    }else {
      return and__3822__auto____6746
    }
  }()) {
    return coll.cljs$core$ISeq$_first$arity$1(coll)
  }else {
    var x__2363__auto____6747 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6748 = cljs.core._first[goog.typeOf(x__2363__auto____6747)];
      if(or__3824__auto____6748) {
        return or__3824__auto____6748
      }else {
        var or__3824__auto____6749 = cljs.core._first["_"];
        if(or__3824__auto____6749) {
          return or__3824__auto____6749
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(function() {
    var and__3822__auto____6754 = coll;
    if(and__3822__auto____6754) {
      return coll.cljs$core$ISeq$_rest$arity$1
    }else {
      return and__3822__auto____6754
    }
  }()) {
    return coll.cljs$core$ISeq$_rest$arity$1(coll)
  }else {
    var x__2363__auto____6755 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6756 = cljs.core._rest[goog.typeOf(x__2363__auto____6755)];
      if(or__3824__auto____6756) {
        return or__3824__auto____6756
      }else {
        var or__3824__auto____6757 = cljs.core._rest["_"];
        if(or__3824__auto____6757) {
          return or__3824__auto____6757
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.INext = {};
cljs.core._next = function _next(coll) {
  if(function() {
    var and__3822__auto____6762 = coll;
    if(and__3822__auto____6762) {
      return coll.cljs$core$INext$_next$arity$1
    }else {
      return and__3822__auto____6762
    }
  }()) {
    return coll.cljs$core$INext$_next$arity$1(coll)
  }else {
    var x__2363__auto____6763 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6764 = cljs.core._next[goog.typeOf(x__2363__auto____6763)];
      if(or__3824__auto____6764) {
        return or__3824__auto____6764
      }else {
        var or__3824__auto____6765 = cljs.core._next["_"];
        if(or__3824__auto____6765) {
          return or__3824__auto____6765
        }else {
          throw cljs.core.missing_protocol.call(null, "INext.-next", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ILookup = {};
cljs.core._lookup = function() {
  var _lookup = null;
  var _lookup__2 = function(o, k) {
    if(function() {
      var and__3822__auto____6774 = o;
      if(and__3822__auto____6774) {
        return o.cljs$core$ILookup$_lookup$arity$2
      }else {
        return and__3822__auto____6774
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$2(o, k)
    }else {
      var x__2363__auto____6775 = o == null ? null : o;
      return function() {
        var or__3824__auto____6776 = cljs.core._lookup[goog.typeOf(x__2363__auto____6775)];
        if(or__3824__auto____6776) {
          return or__3824__auto____6776
        }else {
          var or__3824__auto____6777 = cljs.core._lookup["_"];
          if(or__3824__auto____6777) {
            return or__3824__auto____6777
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__3 = function(o, k, not_found) {
    if(function() {
      var and__3822__auto____6778 = o;
      if(and__3822__auto____6778) {
        return o.cljs$core$ILookup$_lookup$arity$3
      }else {
        return and__3822__auto____6778
      }
    }()) {
      return o.cljs$core$ILookup$_lookup$arity$3(o, k, not_found)
    }else {
      var x__2363__auto____6779 = o == null ? null : o;
      return function() {
        var or__3824__auto____6780 = cljs.core._lookup[goog.typeOf(x__2363__auto____6779)];
        if(or__3824__auto____6780) {
          return or__3824__auto____6780
        }else {
          var or__3824__auto____6781 = cljs.core._lookup["_"];
          if(or__3824__auto____6781) {
            return or__3824__auto____6781
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k, not_found)
    }
  };
  _lookup = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return _lookup__2.call(this, o, k);
      case 3:
        return _lookup__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _lookup.cljs$lang$arity$2 = _lookup__2;
  _lookup.cljs$lang$arity$3 = _lookup__3;
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(function() {
    var and__3822__auto____6786 = coll;
    if(and__3822__auto____6786) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2
    }else {
      return and__3822__auto____6786
    }
  }()) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_$arity$2(coll, k)
  }else {
    var x__2363__auto____6787 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6788 = cljs.core._contains_key_QMARK_[goog.typeOf(x__2363__auto____6787)];
      if(or__3824__auto____6788) {
        return or__3824__auto____6788
      }else {
        var or__3824__auto____6789 = cljs.core._contains_key_QMARK_["_"];
        if(or__3824__auto____6789) {
          return or__3824__auto____6789
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(function() {
    var and__3822__auto____6794 = coll;
    if(and__3822__auto____6794) {
      return coll.cljs$core$IAssociative$_assoc$arity$3
    }else {
      return and__3822__auto____6794
    }
  }()) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, k, v)
  }else {
    var x__2363__auto____6795 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6796 = cljs.core._assoc[goog.typeOf(x__2363__auto____6795)];
      if(or__3824__auto____6796) {
        return or__3824__auto____6796
      }else {
        var or__3824__auto____6797 = cljs.core._assoc["_"];
        if(or__3824__auto____6797) {
          return or__3824__auto____6797
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-assoc", coll);
        }
      }
    }().call(null, coll, k, v)
  }
};
cljs.core.IMap = {};
cljs.core._dissoc = function _dissoc(coll, k) {
  if(function() {
    var and__3822__auto____6802 = coll;
    if(and__3822__auto____6802) {
      return coll.cljs$core$IMap$_dissoc$arity$2
    }else {
      return and__3822__auto____6802
    }
  }()) {
    return coll.cljs$core$IMap$_dissoc$arity$2(coll, k)
  }else {
    var x__2363__auto____6803 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6804 = cljs.core._dissoc[goog.typeOf(x__2363__auto____6803)];
      if(or__3824__auto____6804) {
        return or__3824__auto____6804
      }else {
        var or__3824__auto____6805 = cljs.core._dissoc["_"];
        if(or__3824__auto____6805) {
          return or__3824__auto____6805
        }else {
          throw cljs.core.missing_protocol.call(null, "IMap.-dissoc", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core.IMapEntry = {};
cljs.core._key = function _key(coll) {
  if(function() {
    var and__3822__auto____6810 = coll;
    if(and__3822__auto____6810) {
      return coll.cljs$core$IMapEntry$_key$arity$1
    }else {
      return and__3822__auto____6810
    }
  }()) {
    return coll.cljs$core$IMapEntry$_key$arity$1(coll)
  }else {
    var x__2363__auto____6811 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6812 = cljs.core._key[goog.typeOf(x__2363__auto____6811)];
      if(or__3824__auto____6812) {
        return or__3824__auto____6812
      }else {
        var or__3824__auto____6813 = cljs.core._key["_"];
        if(or__3824__auto____6813) {
          return or__3824__auto____6813
        }else {
          throw cljs.core.missing_protocol.call(null, "IMapEntry.-key", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._val = function _val(coll) {
  if(function() {
    var and__3822__auto____6818 = coll;
    if(and__3822__auto____6818) {
      return coll.cljs$core$IMapEntry$_val$arity$1
    }else {
      return and__3822__auto____6818
    }
  }()) {
    return coll.cljs$core$IMapEntry$_val$arity$1(coll)
  }else {
    var x__2363__auto____6819 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6820 = cljs.core._val[goog.typeOf(x__2363__auto____6819)];
      if(or__3824__auto____6820) {
        return or__3824__auto____6820
      }else {
        var or__3824__auto____6821 = cljs.core._val["_"];
        if(or__3824__auto____6821) {
          return or__3824__auto____6821
        }else {
          throw cljs.core.missing_protocol.call(null, "IMapEntry.-val", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ISet = {};
cljs.core._disjoin = function _disjoin(coll, v) {
  if(function() {
    var and__3822__auto____6826 = coll;
    if(and__3822__auto____6826) {
      return coll.cljs$core$ISet$_disjoin$arity$2
    }else {
      return and__3822__auto____6826
    }
  }()) {
    return coll.cljs$core$ISet$_disjoin$arity$2(coll, v)
  }else {
    var x__2363__auto____6827 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6828 = cljs.core._disjoin[goog.typeOf(x__2363__auto____6827)];
      if(or__3824__auto____6828) {
        return or__3824__auto____6828
      }else {
        var or__3824__auto____6829 = cljs.core._disjoin["_"];
        if(or__3824__auto____6829) {
          return or__3824__auto____6829
        }else {
          throw cljs.core.missing_protocol.call(null, "ISet.-disjoin", coll);
        }
      }
    }().call(null, coll, v)
  }
};
cljs.core.IStack = {};
cljs.core._peek = function _peek(coll) {
  if(function() {
    var and__3822__auto____6834 = coll;
    if(and__3822__auto____6834) {
      return coll.cljs$core$IStack$_peek$arity$1
    }else {
      return and__3822__auto____6834
    }
  }()) {
    return coll.cljs$core$IStack$_peek$arity$1(coll)
  }else {
    var x__2363__auto____6835 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6836 = cljs.core._peek[goog.typeOf(x__2363__auto____6835)];
      if(or__3824__auto____6836) {
        return or__3824__auto____6836
      }else {
        var or__3824__auto____6837 = cljs.core._peek["_"];
        if(or__3824__auto____6837) {
          return or__3824__auto____6837
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(function() {
    var and__3822__auto____6842 = coll;
    if(and__3822__auto____6842) {
      return coll.cljs$core$IStack$_pop$arity$1
    }else {
      return and__3822__auto____6842
    }
  }()) {
    return coll.cljs$core$IStack$_pop$arity$1(coll)
  }else {
    var x__2363__auto____6843 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6844 = cljs.core._pop[goog.typeOf(x__2363__auto____6843)];
      if(or__3824__auto____6844) {
        return or__3824__auto____6844
      }else {
        var or__3824__auto____6845 = cljs.core._pop["_"];
        if(or__3824__auto____6845) {
          return or__3824__auto____6845
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-pop", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IVector = {};
cljs.core._assoc_n = function _assoc_n(coll, n, val) {
  if(function() {
    var and__3822__auto____6850 = coll;
    if(and__3822__auto____6850) {
      return coll.cljs$core$IVector$_assoc_n$arity$3
    }else {
      return and__3822__auto____6850
    }
  }()) {
    return coll.cljs$core$IVector$_assoc_n$arity$3(coll, n, val)
  }else {
    var x__2363__auto____6851 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6852 = cljs.core._assoc_n[goog.typeOf(x__2363__auto____6851)];
      if(or__3824__auto____6852) {
        return or__3824__auto____6852
      }else {
        var or__3824__auto____6853 = cljs.core._assoc_n["_"];
        if(or__3824__auto____6853) {
          return or__3824__auto____6853
        }else {
          throw cljs.core.missing_protocol.call(null, "IVector.-assoc-n", coll);
        }
      }
    }().call(null, coll, n, val)
  }
};
cljs.core.IDeref = {};
cljs.core._deref = function _deref(o) {
  if(function() {
    var and__3822__auto____6858 = o;
    if(and__3822__auto____6858) {
      return o.cljs$core$IDeref$_deref$arity$1
    }else {
      return and__3822__auto____6858
    }
  }()) {
    return o.cljs$core$IDeref$_deref$arity$1(o)
  }else {
    var x__2363__auto____6859 = o == null ? null : o;
    return function() {
      var or__3824__auto____6860 = cljs.core._deref[goog.typeOf(x__2363__auto____6859)];
      if(or__3824__auto____6860) {
        return or__3824__auto____6860
      }else {
        var or__3824__auto____6861 = cljs.core._deref["_"];
        if(or__3824__auto____6861) {
          return or__3824__auto____6861
        }else {
          throw cljs.core.missing_protocol.call(null, "IDeref.-deref", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IDerefWithTimeout = {};
cljs.core._deref_with_timeout = function _deref_with_timeout(o, msec, timeout_val) {
  if(function() {
    var and__3822__auto____6866 = o;
    if(and__3822__auto____6866) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3
    }else {
      return and__3822__auto____6866
    }
  }()) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout$arity$3(o, msec, timeout_val)
  }else {
    var x__2363__auto____6867 = o == null ? null : o;
    return function() {
      var or__3824__auto____6868 = cljs.core._deref_with_timeout[goog.typeOf(x__2363__auto____6867)];
      if(or__3824__auto____6868) {
        return or__3824__auto____6868
      }else {
        var or__3824__auto____6869 = cljs.core._deref_with_timeout["_"];
        if(or__3824__auto____6869) {
          return or__3824__auto____6869
        }else {
          throw cljs.core.missing_protocol.call(null, "IDerefWithTimeout.-deref-with-timeout", o);
        }
      }
    }().call(null, o, msec, timeout_val)
  }
};
cljs.core.IMeta = {};
cljs.core._meta = function _meta(o) {
  if(function() {
    var and__3822__auto____6874 = o;
    if(and__3822__auto____6874) {
      return o.cljs$core$IMeta$_meta$arity$1
    }else {
      return and__3822__auto____6874
    }
  }()) {
    return o.cljs$core$IMeta$_meta$arity$1(o)
  }else {
    var x__2363__auto____6875 = o == null ? null : o;
    return function() {
      var or__3824__auto____6876 = cljs.core._meta[goog.typeOf(x__2363__auto____6875)];
      if(or__3824__auto____6876) {
        return or__3824__auto____6876
      }else {
        var or__3824__auto____6877 = cljs.core._meta["_"];
        if(or__3824__auto____6877) {
          return or__3824__auto____6877
        }else {
          throw cljs.core.missing_protocol.call(null, "IMeta.-meta", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IWithMeta = {};
cljs.core._with_meta = function _with_meta(o, meta) {
  if(function() {
    var and__3822__auto____6882 = o;
    if(and__3822__auto____6882) {
      return o.cljs$core$IWithMeta$_with_meta$arity$2
    }else {
      return and__3822__auto____6882
    }
  }()) {
    return o.cljs$core$IWithMeta$_with_meta$arity$2(o, meta)
  }else {
    var x__2363__auto____6883 = o == null ? null : o;
    return function() {
      var or__3824__auto____6884 = cljs.core._with_meta[goog.typeOf(x__2363__auto____6883)];
      if(or__3824__auto____6884) {
        return or__3824__auto____6884
      }else {
        var or__3824__auto____6885 = cljs.core._with_meta["_"];
        if(or__3824__auto____6885) {
          return or__3824__auto____6885
        }else {
          throw cljs.core.missing_protocol.call(null, "IWithMeta.-with-meta", o);
        }
      }
    }().call(null, o, meta)
  }
};
cljs.core.IReduce = {};
cljs.core._reduce = function() {
  var _reduce = null;
  var _reduce__2 = function(coll, f) {
    if(function() {
      var and__3822__auto____6894 = coll;
      if(and__3822__auto____6894) {
        return coll.cljs$core$IReduce$_reduce$arity$2
      }else {
        return and__3822__auto____6894
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$2(coll, f)
    }else {
      var x__2363__auto____6895 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6896 = cljs.core._reduce[goog.typeOf(x__2363__auto____6895)];
        if(or__3824__auto____6896) {
          return or__3824__auto____6896
        }else {
          var or__3824__auto____6897 = cljs.core._reduce["_"];
          if(or__3824__auto____6897) {
            return or__3824__auto____6897
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__3 = function(coll, f, start) {
    if(function() {
      var and__3822__auto____6898 = coll;
      if(and__3822__auto____6898) {
        return coll.cljs$core$IReduce$_reduce$arity$3
      }else {
        return and__3822__auto____6898
      }
    }()) {
      return coll.cljs$core$IReduce$_reduce$arity$3(coll, f, start)
    }else {
      var x__2363__auto____6899 = coll == null ? null : coll;
      return function() {
        var or__3824__auto____6900 = cljs.core._reduce[goog.typeOf(x__2363__auto____6899)];
        if(or__3824__auto____6900) {
          return or__3824__auto____6900
        }else {
          var or__3824__auto____6901 = cljs.core._reduce["_"];
          if(or__3824__auto____6901) {
            return or__3824__auto____6901
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f, start)
    }
  };
  _reduce = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return _reduce__2.call(this, coll, f);
      case 3:
        return _reduce__3.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _reduce.cljs$lang$arity$2 = _reduce__2;
  _reduce.cljs$lang$arity$3 = _reduce__3;
  return _reduce
}();
cljs.core.IKVReduce = {};
cljs.core._kv_reduce = function _kv_reduce(coll, f, init) {
  if(function() {
    var and__3822__auto____6906 = coll;
    if(and__3822__auto____6906) {
      return coll.cljs$core$IKVReduce$_kv_reduce$arity$3
    }else {
      return and__3822__auto____6906
    }
  }()) {
    return coll.cljs$core$IKVReduce$_kv_reduce$arity$3(coll, f, init)
  }else {
    var x__2363__auto____6907 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6908 = cljs.core._kv_reduce[goog.typeOf(x__2363__auto____6907)];
      if(or__3824__auto____6908) {
        return or__3824__auto____6908
      }else {
        var or__3824__auto____6909 = cljs.core._kv_reduce["_"];
        if(or__3824__auto____6909) {
          return or__3824__auto____6909
        }else {
          throw cljs.core.missing_protocol.call(null, "IKVReduce.-kv-reduce", coll);
        }
      }
    }().call(null, coll, f, init)
  }
};
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(function() {
    var and__3822__auto____6914 = o;
    if(and__3822__auto____6914) {
      return o.cljs$core$IEquiv$_equiv$arity$2
    }else {
      return and__3822__auto____6914
    }
  }()) {
    return o.cljs$core$IEquiv$_equiv$arity$2(o, other)
  }else {
    var x__2363__auto____6915 = o == null ? null : o;
    return function() {
      var or__3824__auto____6916 = cljs.core._equiv[goog.typeOf(x__2363__auto____6915)];
      if(or__3824__auto____6916) {
        return or__3824__auto____6916
      }else {
        var or__3824__auto____6917 = cljs.core._equiv["_"];
        if(or__3824__auto____6917) {
          return or__3824__auto____6917
        }else {
          throw cljs.core.missing_protocol.call(null, "IEquiv.-equiv", o);
        }
      }
    }().call(null, o, other)
  }
};
cljs.core.IHash = {};
cljs.core._hash = function _hash(o) {
  if(function() {
    var and__3822__auto____6922 = o;
    if(and__3822__auto____6922) {
      return o.cljs$core$IHash$_hash$arity$1
    }else {
      return and__3822__auto____6922
    }
  }()) {
    return o.cljs$core$IHash$_hash$arity$1(o)
  }else {
    var x__2363__auto____6923 = o == null ? null : o;
    return function() {
      var or__3824__auto____6924 = cljs.core._hash[goog.typeOf(x__2363__auto____6923)];
      if(or__3824__auto____6924) {
        return or__3824__auto____6924
      }else {
        var or__3824__auto____6925 = cljs.core._hash["_"];
        if(or__3824__auto____6925) {
          return or__3824__auto____6925
        }else {
          throw cljs.core.missing_protocol.call(null, "IHash.-hash", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISeqable = {};
cljs.core._seq = function _seq(o) {
  if(function() {
    var and__3822__auto____6930 = o;
    if(and__3822__auto____6930) {
      return o.cljs$core$ISeqable$_seq$arity$1
    }else {
      return and__3822__auto____6930
    }
  }()) {
    return o.cljs$core$ISeqable$_seq$arity$1(o)
  }else {
    var x__2363__auto____6931 = o == null ? null : o;
    return function() {
      var or__3824__auto____6932 = cljs.core._seq[goog.typeOf(x__2363__auto____6931)];
      if(or__3824__auto____6932) {
        return or__3824__auto____6932
      }else {
        var or__3824__auto____6933 = cljs.core._seq["_"];
        if(or__3824__auto____6933) {
          return or__3824__auto____6933
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeqable.-seq", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISequential = {};
cljs.core.IList = {};
cljs.core.IRecord = {};
cljs.core.IReversible = {};
cljs.core._rseq = function _rseq(coll) {
  if(function() {
    var and__3822__auto____6938 = coll;
    if(and__3822__auto____6938) {
      return coll.cljs$core$IReversible$_rseq$arity$1
    }else {
      return and__3822__auto____6938
    }
  }()) {
    return coll.cljs$core$IReversible$_rseq$arity$1(coll)
  }else {
    var x__2363__auto____6939 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6940 = cljs.core._rseq[goog.typeOf(x__2363__auto____6939)];
      if(or__3824__auto____6940) {
        return or__3824__auto____6940
      }else {
        var or__3824__auto____6941 = cljs.core._rseq["_"];
        if(or__3824__auto____6941) {
          return or__3824__auto____6941
        }else {
          throw cljs.core.missing_protocol.call(null, "IReversible.-rseq", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ISorted = {};
cljs.core._sorted_seq = function _sorted_seq(coll, ascending_QMARK_) {
  if(function() {
    var and__3822__auto____6946 = coll;
    if(and__3822__auto____6946) {
      return coll.cljs$core$ISorted$_sorted_seq$arity$2
    }else {
      return and__3822__auto____6946
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq$arity$2(coll, ascending_QMARK_)
  }else {
    var x__2363__auto____6947 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6948 = cljs.core._sorted_seq[goog.typeOf(x__2363__auto____6947)];
      if(or__3824__auto____6948) {
        return or__3824__auto____6948
      }else {
        var or__3824__auto____6949 = cljs.core._sorted_seq["_"];
        if(or__3824__auto____6949) {
          return or__3824__auto____6949
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-sorted-seq", coll);
        }
      }
    }().call(null, coll, ascending_QMARK_)
  }
};
cljs.core._sorted_seq_from = function _sorted_seq_from(coll, k, ascending_QMARK_) {
  if(function() {
    var and__3822__auto____6954 = coll;
    if(and__3822__auto____6954) {
      return coll.cljs$core$ISorted$_sorted_seq_from$arity$3
    }else {
      return and__3822__auto____6954
    }
  }()) {
    return coll.cljs$core$ISorted$_sorted_seq_from$arity$3(coll, k, ascending_QMARK_)
  }else {
    var x__2363__auto____6955 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6956 = cljs.core._sorted_seq_from[goog.typeOf(x__2363__auto____6955)];
      if(or__3824__auto____6956) {
        return or__3824__auto____6956
      }else {
        var or__3824__auto____6957 = cljs.core._sorted_seq_from["_"];
        if(or__3824__auto____6957) {
          return or__3824__auto____6957
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-sorted-seq-from", coll);
        }
      }
    }().call(null, coll, k, ascending_QMARK_)
  }
};
cljs.core._entry_key = function _entry_key(coll, entry) {
  if(function() {
    var and__3822__auto____6962 = coll;
    if(and__3822__auto____6962) {
      return coll.cljs$core$ISorted$_entry_key$arity$2
    }else {
      return and__3822__auto____6962
    }
  }()) {
    return coll.cljs$core$ISorted$_entry_key$arity$2(coll, entry)
  }else {
    var x__2363__auto____6963 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6964 = cljs.core._entry_key[goog.typeOf(x__2363__auto____6963)];
      if(or__3824__auto____6964) {
        return or__3824__auto____6964
      }else {
        var or__3824__auto____6965 = cljs.core._entry_key["_"];
        if(or__3824__auto____6965) {
          return or__3824__auto____6965
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-entry-key", coll);
        }
      }
    }().call(null, coll, entry)
  }
};
cljs.core._comparator = function _comparator(coll) {
  if(function() {
    var and__3822__auto____6970 = coll;
    if(and__3822__auto____6970) {
      return coll.cljs$core$ISorted$_comparator$arity$1
    }else {
      return and__3822__auto____6970
    }
  }()) {
    return coll.cljs$core$ISorted$_comparator$arity$1(coll)
  }else {
    var x__2363__auto____6971 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____6972 = cljs.core._comparator[goog.typeOf(x__2363__auto____6971)];
      if(or__3824__auto____6972) {
        return or__3824__auto____6972
      }else {
        var or__3824__auto____6973 = cljs.core._comparator["_"];
        if(or__3824__auto____6973) {
          return or__3824__auto____6973
        }else {
          throw cljs.core.missing_protocol.call(null, "ISorted.-comparator", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IPrintable = {};
cljs.core._pr_seq = function _pr_seq(o, opts) {
  if(function() {
    var and__3822__auto____6978 = o;
    if(and__3822__auto____6978) {
      return o.cljs$core$IPrintable$_pr_seq$arity$2
    }else {
      return and__3822__auto____6978
    }
  }()) {
    return o.cljs$core$IPrintable$_pr_seq$arity$2(o, opts)
  }else {
    var x__2363__auto____6979 = o == null ? null : o;
    return function() {
      var or__3824__auto____6980 = cljs.core._pr_seq[goog.typeOf(x__2363__auto____6979)];
      if(or__3824__auto____6980) {
        return or__3824__auto____6980
      }else {
        var or__3824__auto____6981 = cljs.core._pr_seq["_"];
        if(or__3824__auto____6981) {
          return or__3824__auto____6981
        }else {
          throw cljs.core.missing_protocol.call(null, "IPrintable.-pr-seq", o);
        }
      }
    }().call(null, o, opts)
  }
};
cljs.core.IPending = {};
cljs.core._realized_QMARK_ = function _realized_QMARK_(d) {
  if(function() {
    var and__3822__auto____6986 = d;
    if(and__3822__auto____6986) {
      return d.cljs$core$IPending$_realized_QMARK_$arity$1
    }else {
      return and__3822__auto____6986
    }
  }()) {
    return d.cljs$core$IPending$_realized_QMARK_$arity$1(d)
  }else {
    var x__2363__auto____6987 = d == null ? null : d;
    return function() {
      var or__3824__auto____6988 = cljs.core._realized_QMARK_[goog.typeOf(x__2363__auto____6987)];
      if(or__3824__auto____6988) {
        return or__3824__auto____6988
      }else {
        var or__3824__auto____6989 = cljs.core._realized_QMARK_["_"];
        if(or__3824__auto____6989) {
          return or__3824__auto____6989
        }else {
          throw cljs.core.missing_protocol.call(null, "IPending.-realized?", d);
        }
      }
    }().call(null, d)
  }
};
cljs.core.IWatchable = {};
cljs.core._notify_watches = function _notify_watches(this$, oldval, newval) {
  if(function() {
    var and__3822__auto____6994 = this$;
    if(and__3822__auto____6994) {
      return this$.cljs$core$IWatchable$_notify_watches$arity$3
    }else {
      return and__3822__auto____6994
    }
  }()) {
    return this$.cljs$core$IWatchable$_notify_watches$arity$3(this$, oldval, newval)
  }else {
    var x__2363__auto____6995 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____6996 = cljs.core._notify_watches[goog.typeOf(x__2363__auto____6995)];
      if(or__3824__auto____6996) {
        return or__3824__auto____6996
      }else {
        var or__3824__auto____6997 = cljs.core._notify_watches["_"];
        if(or__3824__auto____6997) {
          return or__3824__auto____6997
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(function() {
    var and__3822__auto____7002 = this$;
    if(and__3822__auto____7002) {
      return this$.cljs$core$IWatchable$_add_watch$arity$3
    }else {
      return and__3822__auto____7002
    }
  }()) {
    return this$.cljs$core$IWatchable$_add_watch$arity$3(this$, key, f)
  }else {
    var x__2363__auto____7003 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____7004 = cljs.core._add_watch[goog.typeOf(x__2363__auto____7003)];
      if(or__3824__auto____7004) {
        return or__3824__auto____7004
      }else {
        var or__3824__auto____7005 = cljs.core._add_watch["_"];
        if(or__3824__auto____7005) {
          return or__3824__auto____7005
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(function() {
    var and__3822__auto____7010 = this$;
    if(and__3822__auto____7010) {
      return this$.cljs$core$IWatchable$_remove_watch$arity$2
    }else {
      return and__3822__auto____7010
    }
  }()) {
    return this$.cljs$core$IWatchable$_remove_watch$arity$2(this$, key)
  }else {
    var x__2363__auto____7011 = this$ == null ? null : this$;
    return function() {
      var or__3824__auto____7012 = cljs.core._remove_watch[goog.typeOf(x__2363__auto____7011)];
      if(or__3824__auto____7012) {
        return or__3824__auto____7012
      }else {
        var or__3824__auto____7013 = cljs.core._remove_watch["_"];
        if(or__3824__auto____7013) {
          return or__3824__auto____7013
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-remove-watch", this$);
        }
      }
    }().call(null, this$, key)
  }
};
cljs.core.IEditableCollection = {};
cljs.core._as_transient = function _as_transient(coll) {
  if(function() {
    var and__3822__auto____7018 = coll;
    if(and__3822__auto____7018) {
      return coll.cljs$core$IEditableCollection$_as_transient$arity$1
    }else {
      return and__3822__auto____7018
    }
  }()) {
    return coll.cljs$core$IEditableCollection$_as_transient$arity$1(coll)
  }else {
    var x__2363__auto____7019 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____7020 = cljs.core._as_transient[goog.typeOf(x__2363__auto____7019)];
      if(or__3824__auto____7020) {
        return or__3824__auto____7020
      }else {
        var or__3824__auto____7021 = cljs.core._as_transient["_"];
        if(or__3824__auto____7021) {
          return or__3824__auto____7021
        }else {
          throw cljs.core.missing_protocol.call(null, "IEditableCollection.-as-transient", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ITransientCollection = {};
cljs.core._conj_BANG_ = function _conj_BANG_(tcoll, val) {
  if(function() {
    var and__3822__auto____7026 = tcoll;
    if(and__3822__auto____7026) {
      return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2
    }else {
      return and__3822__auto____7026
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
  }else {
    var x__2363__auto____7027 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____7028 = cljs.core._conj_BANG_[goog.typeOf(x__2363__auto____7027)];
      if(or__3824__auto____7028) {
        return or__3824__auto____7028
      }else {
        var or__3824__auto____7029 = cljs.core._conj_BANG_["_"];
        if(or__3824__auto____7029) {
          return or__3824__auto____7029
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientCollection.-conj!", tcoll);
        }
      }
    }().call(null, tcoll, val)
  }
};
cljs.core._persistent_BANG_ = function _persistent_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____7034 = tcoll;
    if(and__3822__auto____7034) {
      return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1
    }else {
      return and__3822__auto____7034
    }
  }()) {
    return tcoll.cljs$core$ITransientCollection$_persistent_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____7035 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____7036 = cljs.core._persistent_BANG_[goog.typeOf(x__2363__auto____7035)];
      if(or__3824__auto____7036) {
        return or__3824__auto____7036
      }else {
        var or__3824__auto____7037 = cljs.core._persistent_BANG_["_"];
        if(or__3824__auto____7037) {
          return or__3824__auto____7037
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientCollection.-persistent!", tcoll);
        }
      }
    }().call(null, tcoll)
  }
};
cljs.core.ITransientAssociative = {};
cljs.core._assoc_BANG_ = function _assoc_BANG_(tcoll, key, val) {
  if(function() {
    var and__3822__auto____7042 = tcoll;
    if(and__3822__auto____7042) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3
    }else {
      return and__3822__auto____7042
    }
  }()) {
    return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, key, val)
  }else {
    var x__2363__auto____7043 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____7044 = cljs.core._assoc_BANG_[goog.typeOf(x__2363__auto____7043)];
      if(or__3824__auto____7044) {
        return or__3824__auto____7044
      }else {
        var or__3824__auto____7045 = cljs.core._assoc_BANG_["_"];
        if(or__3824__auto____7045) {
          return or__3824__auto____7045
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientAssociative.-assoc!", tcoll);
        }
      }
    }().call(null, tcoll, key, val)
  }
};
cljs.core.ITransientMap = {};
cljs.core._dissoc_BANG_ = function _dissoc_BANG_(tcoll, key) {
  if(function() {
    var and__3822__auto____7050 = tcoll;
    if(and__3822__auto____7050) {
      return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2
    }else {
      return and__3822__auto____7050
    }
  }()) {
    return tcoll.cljs$core$ITransientMap$_dissoc_BANG_$arity$2(tcoll, key)
  }else {
    var x__2363__auto____7051 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____7052 = cljs.core._dissoc_BANG_[goog.typeOf(x__2363__auto____7051)];
      if(or__3824__auto____7052) {
        return or__3824__auto____7052
      }else {
        var or__3824__auto____7053 = cljs.core._dissoc_BANG_["_"];
        if(or__3824__auto____7053) {
          return or__3824__auto____7053
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientMap.-dissoc!", tcoll);
        }
      }
    }().call(null, tcoll, key)
  }
};
cljs.core.ITransientVector = {};
cljs.core._assoc_n_BANG_ = function _assoc_n_BANG_(tcoll, n, val) {
  if(function() {
    var and__3822__auto____7058 = tcoll;
    if(and__3822__auto____7058) {
      return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3
    }else {
      return and__3822__auto____7058
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, n, val)
  }else {
    var x__2363__auto____7059 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____7060 = cljs.core._assoc_n_BANG_[goog.typeOf(x__2363__auto____7059)];
      if(or__3824__auto____7060) {
        return or__3824__auto____7060
      }else {
        var or__3824__auto____7061 = cljs.core._assoc_n_BANG_["_"];
        if(or__3824__auto____7061) {
          return or__3824__auto____7061
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientVector.-assoc-n!", tcoll);
        }
      }
    }().call(null, tcoll, n, val)
  }
};
cljs.core._pop_BANG_ = function _pop_BANG_(tcoll) {
  if(function() {
    var and__3822__auto____7066 = tcoll;
    if(and__3822__auto____7066) {
      return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1
    }else {
      return and__3822__auto____7066
    }
  }()) {
    return tcoll.cljs$core$ITransientVector$_pop_BANG_$arity$1(tcoll)
  }else {
    var x__2363__auto____7067 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____7068 = cljs.core._pop_BANG_[goog.typeOf(x__2363__auto____7067)];
      if(or__3824__auto____7068) {
        return or__3824__auto____7068
      }else {
        var or__3824__auto____7069 = cljs.core._pop_BANG_["_"];
        if(or__3824__auto____7069) {
          return or__3824__auto____7069
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientVector.-pop!", tcoll);
        }
      }
    }().call(null, tcoll)
  }
};
cljs.core.ITransientSet = {};
cljs.core._disjoin_BANG_ = function _disjoin_BANG_(tcoll, v) {
  if(function() {
    var and__3822__auto____7074 = tcoll;
    if(and__3822__auto____7074) {
      return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2
    }else {
      return and__3822__auto____7074
    }
  }()) {
    return tcoll.cljs$core$ITransientSet$_disjoin_BANG_$arity$2(tcoll, v)
  }else {
    var x__2363__auto____7075 = tcoll == null ? null : tcoll;
    return function() {
      var or__3824__auto____7076 = cljs.core._disjoin_BANG_[goog.typeOf(x__2363__auto____7075)];
      if(or__3824__auto____7076) {
        return or__3824__auto____7076
      }else {
        var or__3824__auto____7077 = cljs.core._disjoin_BANG_["_"];
        if(or__3824__auto____7077) {
          return or__3824__auto____7077
        }else {
          throw cljs.core.missing_protocol.call(null, "ITransientSet.-disjoin!", tcoll);
        }
      }
    }().call(null, tcoll, v)
  }
};
cljs.core.IComparable = {};
cljs.core._compare = function _compare(x, y) {
  if(function() {
    var and__3822__auto____7082 = x;
    if(and__3822__auto____7082) {
      return x.cljs$core$IComparable$_compare$arity$2
    }else {
      return and__3822__auto____7082
    }
  }()) {
    return x.cljs$core$IComparable$_compare$arity$2(x, y)
  }else {
    var x__2363__auto____7083 = x == null ? null : x;
    return function() {
      var or__3824__auto____7084 = cljs.core._compare[goog.typeOf(x__2363__auto____7083)];
      if(or__3824__auto____7084) {
        return or__3824__auto____7084
      }else {
        var or__3824__auto____7085 = cljs.core._compare["_"];
        if(or__3824__auto____7085) {
          return or__3824__auto____7085
        }else {
          throw cljs.core.missing_protocol.call(null, "IComparable.-compare", x);
        }
      }
    }().call(null, x, y)
  }
};
cljs.core.IChunk = {};
cljs.core._drop_first = function _drop_first(coll) {
  if(function() {
    var and__3822__auto____7090 = coll;
    if(and__3822__auto____7090) {
      return coll.cljs$core$IChunk$_drop_first$arity$1
    }else {
      return and__3822__auto____7090
    }
  }()) {
    return coll.cljs$core$IChunk$_drop_first$arity$1(coll)
  }else {
    var x__2363__auto____7091 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____7092 = cljs.core._drop_first[goog.typeOf(x__2363__auto____7091)];
      if(or__3824__auto____7092) {
        return or__3824__auto____7092
      }else {
        var or__3824__auto____7093 = cljs.core._drop_first["_"];
        if(or__3824__auto____7093) {
          return or__3824__auto____7093
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunk.-drop-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IChunkedSeq = {};
cljs.core._chunked_first = function _chunked_first(coll) {
  if(function() {
    var and__3822__auto____7098 = coll;
    if(and__3822__auto____7098) {
      return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1
    }else {
      return and__3822__auto____7098
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_first$arity$1(coll)
  }else {
    var x__2363__auto____7099 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____7100 = cljs.core._chunked_first[goog.typeOf(x__2363__auto____7099)];
      if(or__3824__auto____7100) {
        return or__3824__auto____7100
      }else {
        var or__3824__auto____7101 = cljs.core._chunked_first["_"];
        if(or__3824__auto____7101) {
          return or__3824__auto____7101
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunkedSeq.-chunked-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._chunked_rest = function _chunked_rest(coll) {
  if(function() {
    var and__3822__auto____7106 = coll;
    if(and__3822__auto____7106) {
      return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1
    }else {
      return and__3822__auto____7106
    }
  }()) {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }else {
    var x__2363__auto____7107 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____7108 = cljs.core._chunked_rest[goog.typeOf(x__2363__auto____7107)];
      if(or__3824__auto____7108) {
        return or__3824__auto____7108
      }else {
        var or__3824__auto____7109 = cljs.core._chunked_rest["_"];
        if(or__3824__auto____7109) {
          return or__3824__auto____7109
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunkedSeq.-chunked-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IChunkedNext = {};
cljs.core._chunked_next = function _chunked_next(coll) {
  if(function() {
    var and__3822__auto____7114 = coll;
    if(and__3822__auto____7114) {
      return coll.cljs$core$IChunkedNext$_chunked_next$arity$1
    }else {
      return and__3822__auto____7114
    }
  }()) {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }else {
    var x__2363__auto____7115 = coll == null ? null : coll;
    return function() {
      var or__3824__auto____7116 = cljs.core._chunked_next[goog.typeOf(x__2363__auto____7115)];
      if(or__3824__auto____7116) {
        return or__3824__auto____7116
      }else {
        var or__3824__auto____7117 = cljs.core._chunked_next["_"];
        if(or__3824__auto____7117) {
          return or__3824__auto____7117
        }else {
          throw cljs.core.missing_protocol.call(null, "IChunkedNext.-chunked-next", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.identical_QMARK_ = function identical_QMARK_(x, y) {
  return x === y
};
cljs.core._EQ_ = function() {
  var _EQ_ = null;
  var _EQ___1 = function(x) {
    return true
  };
  var _EQ___2 = function(x, y) {
    var or__3824__auto____7119 = x === y;
    if(or__3824__auto____7119) {
      return or__3824__auto____7119
    }else {
      return cljs.core._equiv.call(null, x, y)
    }
  };
  var _EQ___3 = function() {
    var G__7120__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ_.call(null, x, y))) {
          if(cljs.core.next.call(null, more)) {
            var G__7121 = y;
            var G__7122 = cljs.core.first.call(null, more);
            var G__7123 = cljs.core.next.call(null, more);
            x = G__7121;
            y = G__7122;
            more = G__7123;
            continue
          }else {
            return _EQ_.call(null, y, cljs.core.first.call(null, more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7120 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7120__delegate.call(this, x, y, more)
    };
    G__7120.cljs$lang$maxFixedArity = 2;
    G__7120.cljs$lang$applyTo = function(arglist__7124) {
      var x = cljs.core.first(arglist__7124);
      var y = cljs.core.first(cljs.core.next(arglist__7124));
      var more = cljs.core.rest(cljs.core.next(arglist__7124));
      return G__7120__delegate(x, y, more)
    };
    G__7120.cljs$lang$arity$variadic = G__7120__delegate;
    return G__7120
  }();
  _EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ___1.call(this, x);
      case 2:
        return _EQ___2.call(this, x, y);
      default:
        return _EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ_.cljs$lang$maxFixedArity = 2;
  _EQ_.cljs$lang$applyTo = _EQ___3.cljs$lang$applyTo;
  _EQ_.cljs$lang$arity$1 = _EQ___1;
  _EQ_.cljs$lang$arity$2 = _EQ___2;
  _EQ_.cljs$lang$arity$variadic = _EQ___3.cljs$lang$arity$variadic;
  return _EQ_
}();
cljs.core.nil_QMARK_ = function nil_QMARK_(x) {
  return x == null
};
cljs.core.type = function type(x) {
  if(x == null) {
    return null
  }else {
    return x.constructor
  }
};
cljs.core.instance_QMARK_ = function instance_QMARK_(t, o) {
  return o instanceof t
};
cljs.core.IHash["null"] = true;
cljs.core._hash["null"] = function(o) {
  return 0
};
cljs.core.ILookup["null"] = true;
cljs.core._lookup["null"] = function() {
  var G__7125 = null;
  var G__7125__2 = function(o, k) {
    return null
  };
  var G__7125__3 = function(o, k, not_found) {
    return not_found
  };
  G__7125 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7125__2.call(this, o, k);
      case 3:
        return G__7125__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7125
}();
cljs.core.IAssociative["null"] = true;
cljs.core._assoc["null"] = function(_, k, v) {
  return cljs.core.hash_map.call(null, k, v)
};
cljs.core.INext["null"] = true;
cljs.core._next["null"] = function(_) {
  return null
};
cljs.core.ICollection["null"] = true;
cljs.core._conj["null"] = function(_, o) {
  return cljs.core.list.call(null, o)
};
cljs.core.IReduce["null"] = true;
cljs.core._reduce["null"] = function() {
  var G__7126 = null;
  var G__7126__2 = function(_, f) {
    return f.call(null)
  };
  var G__7126__3 = function(_, f, start) {
    return start
  };
  G__7126 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__7126__2.call(this, _, f);
      case 3:
        return G__7126__3.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7126
}();
cljs.core.IPrintable["null"] = true;
cljs.core._pr_seq["null"] = function(o) {
  return cljs.core.list.call(null, "nil")
};
cljs.core.ISet["null"] = true;
cljs.core._disjoin["null"] = function(_, v) {
  return null
};
cljs.core.ICounted["null"] = true;
cljs.core._count["null"] = function(_) {
  return 0
};
cljs.core.IStack["null"] = true;
cljs.core._peek["null"] = function(_) {
  return null
};
cljs.core._pop["null"] = function(_) {
  return null
};
cljs.core.ISeq["null"] = true;
cljs.core._first["null"] = function(_) {
  return null
};
cljs.core._rest["null"] = function(_) {
  return cljs.core.list.call(null)
};
cljs.core.IEquiv["null"] = true;
cljs.core._equiv["null"] = function(_, o) {
  return o == null
};
cljs.core.IWithMeta["null"] = true;
cljs.core._with_meta["null"] = function(_, meta) {
  return null
};
cljs.core.IMeta["null"] = true;
cljs.core._meta["null"] = function(_) {
  return null
};
cljs.core.IIndexed["null"] = true;
cljs.core._nth["null"] = function() {
  var G__7127 = null;
  var G__7127__2 = function(_, n) {
    return null
  };
  var G__7127__3 = function(_, n, not_found) {
    return not_found
  };
  G__7127 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7127__2.call(this, _, n);
      case 3:
        return G__7127__3.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7127
}();
cljs.core.IEmptyableCollection["null"] = true;
cljs.core._empty["null"] = function(_) {
  return null
};
cljs.core.IMap["null"] = true;
cljs.core._dissoc["null"] = function(_, k) {
  return null
};
Date.prototype.cljs$core$IEquiv$ = true;
Date.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var and__3822__auto____7128 = cljs.core.instance_QMARK_.call(null, Date, other);
  if(and__3822__auto____7128) {
    return o.toString() === other.toString()
  }else {
    return and__3822__auto____7128
  }
};
cljs.core.IHash["number"] = true;
cljs.core._hash["number"] = function(o) {
  return o
};
cljs.core.IEquiv["number"] = true;
cljs.core._equiv["number"] = function(x, o) {
  return x === o
};
cljs.core.IHash["boolean"] = true;
cljs.core._hash["boolean"] = function(o) {
  if(o === true) {
    return 1
  }else {
    return 0
  }
};
cljs.core.IHash["_"] = true;
cljs.core._hash["_"] = function(o) {
  return goog.getUid(o)
};
cljs.core.inc = function inc(x) {
  return x + 1
};
cljs.core.ci_reduce = function() {
  var ci_reduce = null;
  var ci_reduce__2 = function(cicoll, f) {
    var cnt__7141 = cljs.core._count.call(null, cicoll);
    if(cnt__7141 === 0) {
      return f.call(null)
    }else {
      var val__7142 = cljs.core._nth.call(null, cicoll, 0);
      var n__7143 = 1;
      while(true) {
        if(n__7143 < cnt__7141) {
          var nval__7144 = f.call(null, val__7142, cljs.core._nth.call(null, cicoll, n__7143));
          if(cljs.core.reduced_QMARK_.call(null, nval__7144)) {
            return cljs.core.deref.call(null, nval__7144)
          }else {
            var G__7153 = nval__7144;
            var G__7154 = n__7143 + 1;
            val__7142 = G__7153;
            n__7143 = G__7154;
            continue
          }
        }else {
          return val__7142
        }
        break
      }
    }
  };
  var ci_reduce__3 = function(cicoll, f, val) {
    var cnt__7145 = cljs.core._count.call(null, cicoll);
    var val__7146 = val;
    var n__7147 = 0;
    while(true) {
      if(n__7147 < cnt__7145) {
        var nval__7148 = f.call(null, val__7146, cljs.core._nth.call(null, cicoll, n__7147));
        if(cljs.core.reduced_QMARK_.call(null, nval__7148)) {
          return cljs.core.deref.call(null, nval__7148)
        }else {
          var G__7155 = nval__7148;
          var G__7156 = n__7147 + 1;
          val__7146 = G__7155;
          n__7147 = G__7156;
          continue
        }
      }else {
        return val__7146
      }
      break
    }
  };
  var ci_reduce__4 = function(cicoll, f, val, idx) {
    var cnt__7149 = cljs.core._count.call(null, cicoll);
    var val__7150 = val;
    var n__7151 = idx;
    while(true) {
      if(n__7151 < cnt__7149) {
        var nval__7152 = f.call(null, val__7150, cljs.core._nth.call(null, cicoll, n__7151));
        if(cljs.core.reduced_QMARK_.call(null, nval__7152)) {
          return cljs.core.deref.call(null, nval__7152)
        }else {
          var G__7157 = nval__7152;
          var G__7158 = n__7151 + 1;
          val__7150 = G__7157;
          n__7151 = G__7158;
          continue
        }
      }else {
        return val__7150
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__2.call(this, cicoll, f);
      case 3:
        return ci_reduce__3.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__4.call(this, cicoll, f, val, idx)
    }
    throw"Invalid arity: " + arguments.length;
  };
  ci_reduce.cljs$lang$arity$2 = ci_reduce__2;
  ci_reduce.cljs$lang$arity$3 = ci_reduce__3;
  ci_reduce.cljs$lang$arity$4 = ci_reduce__4;
  return ci_reduce
}();
cljs.core.array_reduce = function() {
  var array_reduce = null;
  var array_reduce__2 = function(arr, f) {
    var cnt__7171 = arr.length;
    if(arr.length === 0) {
      return f.call(null)
    }else {
      var val__7172 = arr[0];
      var n__7173 = 1;
      while(true) {
        if(n__7173 < cnt__7171) {
          var nval__7174 = f.call(null, val__7172, arr[n__7173]);
          if(cljs.core.reduced_QMARK_.call(null, nval__7174)) {
            return cljs.core.deref.call(null, nval__7174)
          }else {
            var G__7183 = nval__7174;
            var G__7184 = n__7173 + 1;
            val__7172 = G__7183;
            n__7173 = G__7184;
            continue
          }
        }else {
          return val__7172
        }
        break
      }
    }
  };
  var array_reduce__3 = function(arr, f, val) {
    var cnt__7175 = arr.length;
    var val__7176 = val;
    var n__7177 = 0;
    while(true) {
      if(n__7177 < cnt__7175) {
        var nval__7178 = f.call(null, val__7176, arr[n__7177]);
        if(cljs.core.reduced_QMARK_.call(null, nval__7178)) {
          return cljs.core.deref.call(null, nval__7178)
        }else {
          var G__7185 = nval__7178;
          var G__7186 = n__7177 + 1;
          val__7176 = G__7185;
          n__7177 = G__7186;
          continue
        }
      }else {
        return val__7176
      }
      break
    }
  };
  var array_reduce__4 = function(arr, f, val, idx) {
    var cnt__7179 = arr.length;
    var val__7180 = val;
    var n__7181 = idx;
    while(true) {
      if(n__7181 < cnt__7179) {
        var nval__7182 = f.call(null, val__7180, arr[n__7181]);
        if(cljs.core.reduced_QMARK_.call(null, nval__7182)) {
          return cljs.core.deref.call(null, nval__7182)
        }else {
          var G__7187 = nval__7182;
          var G__7188 = n__7181 + 1;
          val__7180 = G__7187;
          n__7181 = G__7188;
          continue
        }
      }else {
        return val__7180
      }
      break
    }
  };
  array_reduce = function(arr, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return array_reduce__2.call(this, arr, f);
      case 3:
        return array_reduce__3.call(this, arr, f, val);
      case 4:
        return array_reduce__4.call(this, arr, f, val, idx)
    }
    throw"Invalid arity: " + arguments.length;
  };
  array_reduce.cljs$lang$arity$2 = array_reduce__2;
  array_reduce.cljs$lang$arity$3 = array_reduce__3;
  array_reduce.cljs$lang$arity$4 = array_reduce__4;
  return array_reduce
}();
cljs.core.IndexedSeq = function(a, i) {
  this.a = a;
  this.i = i;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 166199546
};
cljs.core.IndexedSeq.cljs$lang$type = true;
cljs.core.IndexedSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/IndexedSeq")
};
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7189 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$INext$_next$arity$1 = function(_) {
  var this__7190 = this;
  if(this__7190.i + 1 < this__7190.a.length) {
    return new cljs.core.IndexedSeq(this__7190.a, this__7190.i + 1)
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7191 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__7192 = this;
  var c__7193 = coll.cljs$core$ICounted$_count$arity$1(coll);
  if(c__7193 > 0) {
    return new cljs.core.RSeq(coll, c__7193 - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.IndexedSeq.prototype.toString = function() {
  var this__7194 = this;
  var this__7195 = this;
  return cljs.core.pr_str.call(null, this__7195)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__7196 = this;
  if(cljs.core.counted_QMARK_.call(null, this__7196.a)) {
    return cljs.core.ci_reduce.call(null, this__7196.a, f, this__7196.a[this__7196.i], this__7196.i + 1)
  }else {
    return cljs.core.ci_reduce.call(null, coll, f, this__7196.a[this__7196.i], 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__7197 = this;
  if(cljs.core.counted_QMARK_.call(null, this__7197.a)) {
    return cljs.core.ci_reduce.call(null, this__7197.a, f, start, this__7197.i)
  }else {
    return cljs.core.ci_reduce.call(null, coll, f, start, 0)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__7198 = this;
  return this$
};
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__7199 = this;
  return this__7199.a.length - this__7199.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(_) {
  var this__7200 = this;
  return this__7200.a[this__7200.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(_) {
  var this__7201 = this;
  if(this__7201.i + 1 < this__7201.a.length) {
    return new cljs.core.IndexedSeq(this__7201.a, this__7201.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7202 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__7203 = this;
  var i__7204 = n + this__7203.i;
  if(i__7204 < this__7203.a.length) {
    return this__7203.a[i__7204]
  }else {
    return null
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__7205 = this;
  var i__7206 = n + this__7205.i;
  if(i__7206 < this__7205.a.length) {
    return this__7205.a[i__7206]
  }else {
    return not_found
  }
};
cljs.core.IndexedSeq;
cljs.core.prim_seq = function() {
  var prim_seq = null;
  var prim_seq__1 = function(prim) {
    return prim_seq.call(null, prim, 0)
  };
  var prim_seq__2 = function(prim, i) {
    if(prim.length === 0) {
      return null
    }else {
      return new cljs.core.IndexedSeq(prim, i)
    }
  };
  prim_seq = function(prim, i) {
    switch(arguments.length) {
      case 1:
        return prim_seq__1.call(this, prim);
      case 2:
        return prim_seq__2.call(this, prim, i)
    }
    throw"Invalid arity: " + arguments.length;
  };
  prim_seq.cljs$lang$arity$1 = prim_seq__1;
  prim_seq.cljs$lang$arity$2 = prim_seq__2;
  return prim_seq
}();
cljs.core.array_seq = function() {
  var array_seq = null;
  var array_seq__1 = function(array) {
    return cljs.core.prim_seq.call(null, array, 0)
  };
  var array_seq__2 = function(array, i) {
    return cljs.core.prim_seq.call(null, array, i)
  };
  array_seq = function(array, i) {
    switch(arguments.length) {
      case 1:
        return array_seq__1.call(this, array);
      case 2:
        return array_seq__2.call(this, array, i)
    }
    throw"Invalid arity: " + arguments.length;
  };
  array_seq.cljs$lang$arity$1 = array_seq__1;
  array_seq.cljs$lang$arity$2 = array_seq__2;
  return array_seq
}();
cljs.core.IReduce["array"] = true;
cljs.core._reduce["array"] = function() {
  var G__7207 = null;
  var G__7207__2 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__7207__3 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__7207 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__7207__2.call(this, array, f);
      case 3:
        return G__7207__3.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7207
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__7208 = null;
  var G__7208__2 = function(array, k) {
    return array[k]
  };
  var G__7208__3 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__7208 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7208__2.call(this, array, k);
      case 3:
        return G__7208__3.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7208
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__7209 = null;
  var G__7209__2 = function(array, n) {
    if(n < array.length) {
      return array[n]
    }else {
      return null
    }
  };
  var G__7209__3 = function(array, n, not_found) {
    if(n < array.length) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__7209 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7209__2.call(this, array, n);
      case 3:
        return G__7209__3.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7209
}();
cljs.core.ICounted["array"] = true;
cljs.core._count["array"] = function(a) {
  return a.length
};
cljs.core.ISeqable["array"] = true;
cljs.core._seq["array"] = function(array) {
  return cljs.core.array_seq.call(null, array, 0)
};
cljs.core.RSeq = function(ci, i, meta) {
  this.ci = ci;
  this.i = i;
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850570
};
cljs.core.RSeq.cljs$lang$type = true;
cljs.core.RSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/RSeq")
};
cljs.core.RSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7210 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.RSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7211 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.RSeq.prototype.toString = function() {
  var this__7212 = this;
  var this__7213 = this;
  return cljs.core.pr_str.call(null, this__7213)
};
cljs.core.RSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7214 = this;
  return coll
};
cljs.core.RSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__7215 = this;
  return this__7215.i + 1
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7216 = this;
  return cljs.core._nth.call(null, this__7216.ci, this__7216.i)
};
cljs.core.RSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7217 = this;
  if(this__7217.i > 0) {
    return new cljs.core.RSeq(this__7217.ci, this__7217.i - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.RSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7218 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.RSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, new_meta) {
  var this__7219 = this;
  return new cljs.core.RSeq(this__7219.ci, this__7219.i, new_meta)
};
cljs.core.RSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7220 = this;
  return this__7220.meta
};
cljs.core.RSeq;
cljs.core.seq = function seq(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__7224__7225 = coll;
      if(G__7224__7225) {
        if(function() {
          var or__3824__auto____7226 = G__7224__7225.cljs$lang$protocol_mask$partition0$ & 32;
          if(or__3824__auto____7226) {
            return or__3824__auto____7226
          }else {
            return G__7224__7225.cljs$core$ASeq$
          }
        }()) {
          return true
        }else {
          if(!G__7224__7225.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ASeq, G__7224__7225)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ASeq, G__7224__7225)
      }
    }()) {
      return coll
    }else {
      return cljs.core._seq.call(null, coll)
    }
  }
};
cljs.core.first = function first(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__7231__7232 = coll;
      if(G__7231__7232) {
        if(function() {
          var or__3824__auto____7233 = G__7231__7232.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____7233) {
            return or__3824__auto____7233
          }else {
            return G__7231__7232.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__7231__7232.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7231__7232)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7231__7232)
      }
    }()) {
      return cljs.core._first.call(null, coll)
    }else {
      var s__7234 = cljs.core.seq.call(null, coll);
      if(s__7234 == null) {
        return null
      }else {
        return cljs.core._first.call(null, s__7234)
      }
    }
  }
};
cljs.core.rest = function rest(coll) {
  if(!(coll == null)) {
    if(function() {
      var G__7239__7240 = coll;
      if(G__7239__7240) {
        if(function() {
          var or__3824__auto____7241 = G__7239__7240.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____7241) {
            return or__3824__auto____7241
          }else {
            return G__7239__7240.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__7239__7240.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7239__7240)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7239__7240)
      }
    }()) {
      return cljs.core._rest.call(null, coll)
    }else {
      var s__7242 = cljs.core.seq.call(null, coll);
      if(!(s__7242 == null)) {
        return cljs.core._rest.call(null, s__7242)
      }else {
        return cljs.core.List.EMPTY
      }
    }
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.next = function next(coll) {
  if(coll == null) {
    return null
  }else {
    if(function() {
      var G__7246__7247 = coll;
      if(G__7246__7247) {
        if(function() {
          var or__3824__auto____7248 = G__7246__7247.cljs$lang$protocol_mask$partition0$ & 128;
          if(or__3824__auto____7248) {
            return or__3824__auto____7248
          }else {
            return G__7246__7247.cljs$core$INext$
          }
        }()) {
          return true
        }else {
          if(!G__7246__7247.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.INext, G__7246__7247)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.INext, G__7246__7247)
      }
    }()) {
      return cljs.core._next.call(null, coll)
    }else {
      return cljs.core.seq.call(null, cljs.core.rest.call(null, coll))
    }
  }
};
cljs.core.second = function second(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.ffirst = function ffirst(coll) {
  return cljs.core.first.call(null, cljs.core.first.call(null, coll))
};
cljs.core.nfirst = function nfirst(coll) {
  return cljs.core.next.call(null, cljs.core.first.call(null, coll))
};
cljs.core.fnext = function fnext(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.nnext = function nnext(coll) {
  return cljs.core.next.call(null, cljs.core.next.call(null, coll))
};
cljs.core.last = function last(s) {
  while(true) {
    var sn__7250 = cljs.core.next.call(null, s);
    if(!(sn__7250 == null)) {
      var G__7251 = sn__7250;
      s = G__7251;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.IEquiv["_"] = true;
cljs.core._equiv["_"] = function(x, o) {
  return x === o
};
cljs.core.not = function not(x) {
  if(cljs.core.truth_(x)) {
    return false
  }else {
    return true
  }
};
cljs.core.conj = function() {
  var conj = null;
  var conj__2 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__3 = function() {
    var G__7252__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__7253 = conj.call(null, coll, x);
          var G__7254 = cljs.core.first.call(null, xs);
          var G__7255 = cljs.core.next.call(null, xs);
          coll = G__7253;
          x = G__7254;
          xs = G__7255;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__7252 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7252__delegate.call(this, coll, x, xs)
    };
    G__7252.cljs$lang$maxFixedArity = 2;
    G__7252.cljs$lang$applyTo = function(arglist__7256) {
      var coll = cljs.core.first(arglist__7256);
      var x = cljs.core.first(cljs.core.next(arglist__7256));
      var xs = cljs.core.rest(cljs.core.next(arglist__7256));
      return G__7252__delegate(coll, x, xs)
    };
    G__7252.cljs$lang$arity$variadic = G__7252__delegate;
    return G__7252
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__2.call(this, coll, x);
      default:
        return conj__3.cljs$lang$arity$variadic(coll, x, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__3.cljs$lang$applyTo;
  conj.cljs$lang$arity$2 = conj__2;
  conj.cljs$lang$arity$variadic = conj__3.cljs$lang$arity$variadic;
  return conj
}();
cljs.core.empty = function empty(coll) {
  return cljs.core._empty.call(null, coll)
};
cljs.core.accumulating_seq_count = function accumulating_seq_count(coll) {
  var s__7259 = cljs.core.seq.call(null, coll);
  var acc__7260 = 0;
  while(true) {
    if(cljs.core.counted_QMARK_.call(null, s__7259)) {
      return acc__7260 + cljs.core._count.call(null, s__7259)
    }else {
      var G__7261 = cljs.core.next.call(null, s__7259);
      var G__7262 = acc__7260 + 1;
      s__7259 = G__7261;
      acc__7260 = G__7262;
      continue
    }
    break
  }
};
cljs.core.count = function count(coll) {
  if(cljs.core.counted_QMARK_.call(null, coll)) {
    return cljs.core._count.call(null, coll)
  }else {
    return cljs.core.accumulating_seq_count.call(null, coll)
  }
};
cljs.core.linear_traversal_nth = function() {
  var linear_traversal_nth = null;
  var linear_traversal_nth__2 = function(coll, n) {
    if(coll == null) {
      throw new Error("Index out of bounds");
    }else {
      if(n === 0) {
        if(cljs.core.seq.call(null, coll)) {
          return cljs.core.first.call(null, coll)
        }else {
          throw new Error("Index out of bounds");
        }
      }else {
        if(cljs.core.indexed_QMARK_.call(null, coll)) {
          return cljs.core._nth.call(null, coll, n)
        }else {
          if(cljs.core.seq.call(null, coll)) {
            return linear_traversal_nth.call(null, cljs.core.next.call(null, coll), n - 1)
          }else {
            if("\ufdd0'else") {
              throw new Error("Index out of bounds");
            }else {
              return null
            }
          }
        }
      }
    }
  };
  var linear_traversal_nth__3 = function(coll, n, not_found) {
    if(coll == null) {
      return not_found
    }else {
      if(n === 0) {
        if(cljs.core.seq.call(null, coll)) {
          return cljs.core.first.call(null, coll)
        }else {
          return not_found
        }
      }else {
        if(cljs.core.indexed_QMARK_.call(null, coll)) {
          return cljs.core._nth.call(null, coll, n, not_found)
        }else {
          if(cljs.core.seq.call(null, coll)) {
            return linear_traversal_nth.call(null, cljs.core.next.call(null, coll), n - 1, not_found)
          }else {
            if("\ufdd0'else") {
              return not_found
            }else {
              return null
            }
          }
        }
      }
    }
  };
  linear_traversal_nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return linear_traversal_nth__2.call(this, coll, n);
      case 3:
        return linear_traversal_nth__3.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  linear_traversal_nth.cljs$lang$arity$2 = linear_traversal_nth__2;
  linear_traversal_nth.cljs$lang$arity$3 = linear_traversal_nth__3;
  return linear_traversal_nth
}();
cljs.core.nth = function() {
  var nth = null;
  var nth__2 = function(coll, n) {
    if(coll == null) {
      return null
    }else {
      if(function() {
        var G__7269__7270 = coll;
        if(G__7269__7270) {
          if(function() {
            var or__3824__auto____7271 = G__7269__7270.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____7271) {
              return or__3824__auto____7271
            }else {
              return G__7269__7270.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__7269__7270.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__7269__7270)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__7269__7270)
        }
      }()) {
        return cljs.core._nth.call(null, coll, Math.floor(n))
      }else {
        return cljs.core.linear_traversal_nth.call(null, coll, Math.floor(n))
      }
    }
  };
  var nth__3 = function(coll, n, not_found) {
    if(!(coll == null)) {
      if(function() {
        var G__7272__7273 = coll;
        if(G__7272__7273) {
          if(function() {
            var or__3824__auto____7274 = G__7272__7273.cljs$lang$protocol_mask$partition0$ & 16;
            if(or__3824__auto____7274) {
              return or__3824__auto____7274
            }else {
              return G__7272__7273.cljs$core$IIndexed$
            }
          }()) {
            return true
          }else {
            if(!G__7272__7273.cljs$lang$protocol_mask$partition0$) {
              return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__7272__7273)
            }else {
              return false
            }
          }
        }else {
          return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__7272__7273)
        }
      }()) {
        return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
      }else {
        return cljs.core.linear_traversal_nth.call(null, coll, Math.floor(n), not_found)
      }
    }else {
      return not_found
    }
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__2.call(this, coll, n);
      case 3:
        return nth__3.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  nth.cljs$lang$arity$2 = nth__2;
  nth.cljs$lang$arity$3 = nth__3;
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__2 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__3 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__2.call(this, o, k);
      case 3:
        return get__3.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  get.cljs$lang$arity$2 = get__2;
  get.cljs$lang$arity$3 = get__3;
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__3 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__4 = function() {
    var G__7277__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__7276 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__7278 = ret__7276;
          var G__7279 = cljs.core.first.call(null, kvs);
          var G__7280 = cljs.core.second.call(null, kvs);
          var G__7281 = cljs.core.nnext.call(null, kvs);
          coll = G__7278;
          k = G__7279;
          v = G__7280;
          kvs = G__7281;
          continue
        }else {
          return ret__7276
        }
        break
      }
    };
    var G__7277 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__7277__delegate.call(this, coll, k, v, kvs)
    };
    G__7277.cljs$lang$maxFixedArity = 3;
    G__7277.cljs$lang$applyTo = function(arglist__7282) {
      var coll = cljs.core.first(arglist__7282);
      var k = cljs.core.first(cljs.core.next(arglist__7282));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7282)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7282)));
      return G__7277__delegate(coll, k, v, kvs)
    };
    G__7277.cljs$lang$arity$variadic = G__7277__delegate;
    return G__7277
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__3.call(this, coll, k, v);
      default:
        return assoc__4.cljs$lang$arity$variadic(coll, k, v, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__4.cljs$lang$applyTo;
  assoc.cljs$lang$arity$3 = assoc__3;
  assoc.cljs$lang$arity$variadic = assoc__4.cljs$lang$arity$variadic;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__1 = function(coll) {
    return coll
  };
  var dissoc__2 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__3 = function() {
    var G__7285__delegate = function(coll, k, ks) {
      while(true) {
        var ret__7284 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__7286 = ret__7284;
          var G__7287 = cljs.core.first.call(null, ks);
          var G__7288 = cljs.core.next.call(null, ks);
          coll = G__7286;
          k = G__7287;
          ks = G__7288;
          continue
        }else {
          return ret__7284
        }
        break
      }
    };
    var G__7285 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7285__delegate.call(this, coll, k, ks)
    };
    G__7285.cljs$lang$maxFixedArity = 2;
    G__7285.cljs$lang$applyTo = function(arglist__7289) {
      var coll = cljs.core.first(arglist__7289);
      var k = cljs.core.first(cljs.core.next(arglist__7289));
      var ks = cljs.core.rest(cljs.core.next(arglist__7289));
      return G__7285__delegate(coll, k, ks)
    };
    G__7285.cljs$lang$arity$variadic = G__7285__delegate;
    return G__7285
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__1.call(this, coll);
      case 2:
        return dissoc__2.call(this, coll, k);
      default:
        return dissoc__3.cljs$lang$arity$variadic(coll, k, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__3.cljs$lang$applyTo;
  dissoc.cljs$lang$arity$1 = dissoc__1;
  dissoc.cljs$lang$arity$2 = dissoc__2;
  dissoc.cljs$lang$arity$variadic = dissoc__3.cljs$lang$arity$variadic;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(function() {
    var G__7293__7294 = o;
    if(G__7293__7294) {
      if(function() {
        var or__3824__auto____7295 = G__7293__7294.cljs$lang$protocol_mask$partition0$ & 131072;
        if(or__3824__auto____7295) {
          return or__3824__auto____7295
        }else {
          return G__7293__7294.cljs$core$IMeta$
        }
      }()) {
        return true
      }else {
        if(!G__7293__7294.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__7293__7294)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__7293__7294)
    }
  }()) {
    return cljs.core._meta.call(null, o)
  }else {
    return null
  }
};
cljs.core.peek = function peek(coll) {
  return cljs.core._peek.call(null, coll)
};
cljs.core.pop = function pop(coll) {
  return cljs.core._pop.call(null, coll)
};
cljs.core.disj = function() {
  var disj = null;
  var disj__1 = function(coll) {
    return coll
  };
  var disj__2 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__3 = function() {
    var G__7298__delegate = function(coll, k, ks) {
      while(true) {
        var ret__7297 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__7299 = ret__7297;
          var G__7300 = cljs.core.first.call(null, ks);
          var G__7301 = cljs.core.next.call(null, ks);
          coll = G__7299;
          k = G__7300;
          ks = G__7301;
          continue
        }else {
          return ret__7297
        }
        break
      }
    };
    var G__7298 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7298__delegate.call(this, coll, k, ks)
    };
    G__7298.cljs$lang$maxFixedArity = 2;
    G__7298.cljs$lang$applyTo = function(arglist__7302) {
      var coll = cljs.core.first(arglist__7302);
      var k = cljs.core.first(cljs.core.next(arglist__7302));
      var ks = cljs.core.rest(cljs.core.next(arglist__7302));
      return G__7298__delegate(coll, k, ks)
    };
    G__7298.cljs$lang$arity$variadic = G__7298__delegate;
    return G__7298
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__1.call(this, coll);
      case 2:
        return disj__2.call(this, coll, k);
      default:
        return disj__3.cljs$lang$arity$variadic(coll, k, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__3.cljs$lang$applyTo;
  disj.cljs$lang$arity$1 = disj__1;
  disj.cljs$lang$arity$2 = disj__2;
  disj.cljs$lang$arity$variadic = disj__3.cljs$lang$arity$variadic;
  return disj
}();
cljs.core.string_hash_cache = {};
cljs.core.string_hash_cache_count = 0;
cljs.core.add_to_string_hash_cache = function add_to_string_hash_cache(k) {
  var h__7304 = goog.string.hashCode(k);
  cljs.core.string_hash_cache[k] = h__7304;
  cljs.core.string_hash_cache_count = cljs.core.string_hash_cache_count + 1;
  return h__7304
};
cljs.core.check_string_hash_cache = function check_string_hash_cache(k) {
  if(cljs.core.string_hash_cache_count > 255) {
    cljs.core.string_hash_cache = {};
    cljs.core.string_hash_cache_count = 0
  }else {
  }
  var h__7306 = cljs.core.string_hash_cache[k];
  if(!(h__7306 == null)) {
    return h__7306
  }else {
    return cljs.core.add_to_string_hash_cache.call(null, k)
  }
};
cljs.core.hash = function() {
  var hash = null;
  var hash__1 = function(o) {
    return hash.call(null, o, true)
  };
  var hash__2 = function(o, check_cache) {
    if(function() {
      var and__3822__auto____7308 = goog.isString(o);
      if(and__3822__auto____7308) {
        return check_cache
      }else {
        return and__3822__auto____7308
      }
    }()) {
      return cljs.core.check_string_hash_cache.call(null, o)
    }else {
      return cljs.core._hash.call(null, o)
    }
  };
  hash = function(o, check_cache) {
    switch(arguments.length) {
      case 1:
        return hash__1.call(this, o);
      case 2:
        return hash__2.call(this, o, check_cache)
    }
    throw"Invalid arity: " + arguments.length;
  };
  hash.cljs$lang$arity$1 = hash__1;
  hash.cljs$lang$arity$2 = hash__2;
  return hash
}();
cljs.core.empty_QMARK_ = function empty_QMARK_(coll) {
  return cljs.core.not.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.coll_QMARK_ = function coll_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__7312__7313 = x;
    if(G__7312__7313) {
      if(function() {
        var or__3824__auto____7314 = G__7312__7313.cljs$lang$protocol_mask$partition0$ & 8;
        if(or__3824__auto____7314) {
          return or__3824__auto____7314
        }else {
          return G__7312__7313.cljs$core$ICollection$
        }
      }()) {
        return true
      }else {
        if(!G__7312__7313.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, G__7312__7313)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, G__7312__7313)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__7318__7319 = x;
    if(G__7318__7319) {
      if(function() {
        var or__3824__auto____7320 = G__7318__7319.cljs$lang$protocol_mask$partition0$ & 4096;
        if(or__3824__auto____7320) {
          return or__3824__auto____7320
        }else {
          return G__7318__7319.cljs$core$ISet$
        }
      }()) {
        return true
      }else {
        if(!G__7318__7319.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ISet, G__7318__7319)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, G__7318__7319)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var G__7324__7325 = x;
  if(G__7324__7325) {
    if(function() {
      var or__3824__auto____7326 = G__7324__7325.cljs$lang$protocol_mask$partition0$ & 512;
      if(or__3824__auto____7326) {
        return or__3824__auto____7326
      }else {
        return G__7324__7325.cljs$core$IAssociative$
      }
    }()) {
      return true
    }else {
      if(!G__7324__7325.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, G__7324__7325)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, G__7324__7325)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var G__7330__7331 = x;
  if(G__7330__7331) {
    if(function() {
      var or__3824__auto____7332 = G__7330__7331.cljs$lang$protocol_mask$partition0$ & 16777216;
      if(or__3824__auto____7332) {
        return or__3824__auto____7332
      }else {
        return G__7330__7331.cljs$core$ISequential$
      }
    }()) {
      return true
    }else {
      if(!G__7330__7331.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, G__7330__7331)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, G__7330__7331)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var G__7336__7337 = x;
  if(G__7336__7337) {
    if(function() {
      var or__3824__auto____7338 = G__7336__7337.cljs$lang$protocol_mask$partition0$ & 2;
      if(or__3824__auto____7338) {
        return or__3824__auto____7338
      }else {
        return G__7336__7337.cljs$core$ICounted$
      }
    }()) {
      return true
    }else {
      if(!G__7336__7337.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, G__7336__7337)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, G__7336__7337)
  }
};
cljs.core.indexed_QMARK_ = function indexed_QMARK_(x) {
  var G__7342__7343 = x;
  if(G__7342__7343) {
    if(function() {
      var or__3824__auto____7344 = G__7342__7343.cljs$lang$protocol_mask$partition0$ & 16;
      if(or__3824__auto____7344) {
        return or__3824__auto____7344
      }else {
        return G__7342__7343.cljs$core$IIndexed$
      }
    }()) {
      return true
    }else {
      if(!G__7342__7343.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__7342__7343)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IIndexed, G__7342__7343)
  }
};
cljs.core.reduceable_QMARK_ = function reduceable_QMARK_(x) {
  var G__7348__7349 = x;
  if(G__7348__7349) {
    if(function() {
      var or__3824__auto____7350 = G__7348__7349.cljs$lang$protocol_mask$partition0$ & 524288;
      if(or__3824__auto____7350) {
        return or__3824__auto____7350
      }else {
        return G__7348__7349.cljs$core$IReduce$
      }
    }()) {
      return true
    }else {
      if(!G__7348__7349.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7348__7349)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7348__7349)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(x == null) {
    return false
  }else {
    var G__7354__7355 = x;
    if(G__7354__7355) {
      if(function() {
        var or__3824__auto____7356 = G__7354__7355.cljs$lang$protocol_mask$partition0$ & 1024;
        if(or__3824__auto____7356) {
          return or__3824__auto____7356
        }else {
          return G__7354__7355.cljs$core$IMap$
        }
      }()) {
        return true
      }else {
        if(!G__7354__7355.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IMap, G__7354__7355)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, G__7354__7355)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var G__7360__7361 = x;
  if(G__7360__7361) {
    if(function() {
      var or__3824__auto____7362 = G__7360__7361.cljs$lang$protocol_mask$partition0$ & 16384;
      if(or__3824__auto____7362) {
        return or__3824__auto____7362
      }else {
        return G__7360__7361.cljs$core$IVector$
      }
    }()) {
      return true
    }else {
      if(!G__7360__7361.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IVector, G__7360__7361)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, G__7360__7361)
  }
};
cljs.core.chunked_seq_QMARK_ = function chunked_seq_QMARK_(x) {
  var G__7366__7367 = x;
  if(G__7366__7367) {
    if(cljs.core.truth_(function() {
      var or__3824__auto____7368 = null;
      if(cljs.core.truth_(or__3824__auto____7368)) {
        return or__3824__auto____7368
      }else {
        return G__7366__7367.cljs$core$IChunkedSeq$
      }
    }())) {
      return true
    }else {
      if(!G__7366__7367.cljs$lang$protocol_mask$partition$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedSeq, G__7366__7367)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedSeq, G__7366__7367)
  }
};
cljs.core.js_obj = function() {
  var js_obj = null;
  var js_obj__0 = function() {
    return{}
  };
  var js_obj__1 = function() {
    var G__7369__delegate = function(keyvals) {
      return cljs.core.apply.call(null, goog.object.create, keyvals)
    };
    var G__7369 = function(var_args) {
      var keyvals = null;
      if(goog.isDef(var_args)) {
        keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__7369__delegate.call(this, keyvals)
    };
    G__7369.cljs$lang$maxFixedArity = 0;
    G__7369.cljs$lang$applyTo = function(arglist__7370) {
      var keyvals = cljs.core.seq(arglist__7370);
      return G__7369__delegate(keyvals)
    };
    G__7369.cljs$lang$arity$variadic = G__7369__delegate;
    return G__7369
  }();
  js_obj = function(var_args) {
    var keyvals = var_args;
    switch(arguments.length) {
      case 0:
        return js_obj__0.call(this);
      default:
        return js_obj__1.cljs$lang$arity$variadic(cljs.core.array_seq(arguments, 0))
    }
    throw"Invalid arity: " + arguments.length;
  };
  js_obj.cljs$lang$maxFixedArity = 0;
  js_obj.cljs$lang$applyTo = js_obj__1.cljs$lang$applyTo;
  js_obj.cljs$lang$arity$0 = js_obj__0;
  js_obj.cljs$lang$arity$variadic = js_obj__1.cljs$lang$arity$variadic;
  return js_obj
}();
cljs.core.js_keys = function js_keys(obj) {
  var keys__7372 = [];
  goog.object.forEach(obj, function(val, key, obj) {
    return keys__7372.push(key)
  });
  return keys__7372
};
cljs.core.js_delete = function js_delete(obj, key) {
  return delete obj[key]
};
cljs.core.array_copy = function array_copy(from, i, to, j, len) {
  var i__7376 = i;
  var j__7377 = j;
  var len__7378 = len;
  while(true) {
    if(len__7378 === 0) {
      return to
    }else {
      to[j__7377] = from[i__7376];
      var G__7379 = i__7376 + 1;
      var G__7380 = j__7377 + 1;
      var G__7381 = len__7378 - 1;
      i__7376 = G__7379;
      j__7377 = G__7380;
      len__7378 = G__7381;
      continue
    }
    break
  }
};
cljs.core.array_copy_downward = function array_copy_downward(from, i, to, j, len) {
  var i__7385 = i + (len - 1);
  var j__7386 = j + (len - 1);
  var len__7387 = len;
  while(true) {
    if(len__7387 === 0) {
      return to
    }else {
      to[j__7386] = from[i__7385];
      var G__7388 = i__7385 - 1;
      var G__7389 = j__7386 - 1;
      var G__7390 = len__7387 - 1;
      i__7385 = G__7388;
      j__7386 = G__7389;
      len__7387 = G__7390;
      continue
    }
    break
  }
};
cljs.core.lookup_sentinel = {};
cljs.core.false_QMARK_ = function false_QMARK_(x) {
  return x === false
};
cljs.core.true_QMARK_ = function true_QMARK_(x) {
  return x === true
};
cljs.core.undefined_QMARK_ = function undefined_QMARK_(x) {
  return void 0 === x
};
cljs.core.seq_QMARK_ = function seq_QMARK_(s) {
  if(s == null) {
    return false
  }else {
    var G__7394__7395 = s;
    if(G__7394__7395) {
      if(function() {
        var or__3824__auto____7396 = G__7394__7395.cljs$lang$protocol_mask$partition0$ & 64;
        if(or__3824__auto____7396) {
          return or__3824__auto____7396
        }else {
          return G__7394__7395.cljs$core$ISeq$
        }
      }()) {
        return true
      }else {
        if(!G__7394__7395.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7394__7395)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7394__7395)
    }
  }
};
cljs.core.seqable_QMARK_ = function seqable_QMARK_(s) {
  var G__7400__7401 = s;
  if(G__7400__7401) {
    if(function() {
      var or__3824__auto____7402 = G__7400__7401.cljs$lang$protocol_mask$partition0$ & 8388608;
      if(or__3824__auto____7402) {
        return or__3824__auto____7402
      }else {
        return G__7400__7401.cljs$core$ISeqable$
      }
    }()) {
      return true
    }else {
      if(!G__7400__7401.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, G__7400__7401)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, G__7400__7401)
  }
};
cljs.core.boolean$ = function boolean$(x) {
  if(cljs.core.truth_(x)) {
    return true
  }else {
    return false
  }
};
cljs.core.string_QMARK_ = function string_QMARK_(x) {
  var and__3822__auto____7405 = goog.isString(x);
  if(and__3822__auto____7405) {
    return!function() {
      var or__3824__auto____7406 = x.charAt(0) === "\ufdd0";
      if(or__3824__auto____7406) {
        return or__3824__auto____7406
      }else {
        return x.charAt(0) === "\ufdd1"
      }
    }()
  }else {
    return and__3822__auto____7405
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3822__auto____7408 = goog.isString(x);
  if(and__3822__auto____7408) {
    return x.charAt(0) === "\ufdd0"
  }else {
    return and__3822__auto____7408
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3822__auto____7410 = goog.isString(x);
  if(and__3822__auto____7410) {
    return x.charAt(0) === "\ufdd1"
  }else {
    return and__3822__auto____7410
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber(n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction(f)
};
cljs.core.ifn_QMARK_ = function ifn_QMARK_(f) {
  var or__3824__auto____7415 = cljs.core.fn_QMARK_.call(null, f);
  if(or__3824__auto____7415) {
    return or__3824__auto____7415
  }else {
    var G__7416__7417 = f;
    if(G__7416__7417) {
      if(function() {
        var or__3824__auto____7418 = G__7416__7417.cljs$lang$protocol_mask$partition0$ & 1;
        if(or__3824__auto____7418) {
          return or__3824__auto____7418
        }else {
          return G__7416__7417.cljs$core$IFn$
        }
      }()) {
        return true
      }else {
        if(!G__7416__7417.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IFn, G__7416__7417)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IFn, G__7416__7417)
    }
  }
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3822__auto____7420 = cljs.core.number_QMARK_.call(null, n);
  if(and__3822__auto____7420) {
    return n == n.toFixed()
  }else {
    return and__3822__auto____7420
  }
};
cljs.core.contains_QMARK_ = function contains_QMARK_(coll, v) {
  if(cljs.core._lookup.call(null, coll, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
    return false
  }else {
    return true
  }
};
cljs.core.find = function find(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3822__auto____7423 = coll;
    if(cljs.core.truth_(and__3822__auto____7423)) {
      var and__3822__auto____7424 = cljs.core.associative_QMARK_.call(null, coll);
      if(and__3822__auto____7424) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3822__auto____7424
      }
    }else {
      return and__3822__auto____7423
    }
  }())) {
    return cljs.core.PersistentVector.fromArray([k, cljs.core._lookup.call(null, coll, k)], true)
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___1 = function(x) {
    return true
  };
  var distinct_QMARK___2 = function(x, y) {
    return!cljs.core._EQ_.call(null, x, y)
  };
  var distinct_QMARK___3 = function() {
    var G__7433__delegate = function(x, y, more) {
      if(!cljs.core._EQ_.call(null, x, y)) {
        var s__7429 = cljs.core.PersistentHashSet.fromArray([y, x]);
        var xs__7430 = more;
        while(true) {
          var x__7431 = cljs.core.first.call(null, xs__7430);
          var etc__7432 = cljs.core.next.call(null, xs__7430);
          if(cljs.core.truth_(xs__7430)) {
            if(cljs.core.contains_QMARK_.call(null, s__7429, x__7431)) {
              return false
            }else {
              var G__7434 = cljs.core.conj.call(null, s__7429, x__7431);
              var G__7435 = etc__7432;
              s__7429 = G__7434;
              xs__7430 = G__7435;
              continue
            }
          }else {
            return true
          }
          break
        }
      }else {
        return false
      }
    };
    var G__7433 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7433__delegate.call(this, x, y, more)
    };
    G__7433.cljs$lang$maxFixedArity = 2;
    G__7433.cljs$lang$applyTo = function(arglist__7436) {
      var x = cljs.core.first(arglist__7436);
      var y = cljs.core.first(cljs.core.next(arglist__7436));
      var more = cljs.core.rest(cljs.core.next(arglist__7436));
      return G__7433__delegate(x, y, more)
    };
    G__7433.cljs$lang$arity$variadic = G__7433__delegate;
    return G__7433
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___1.call(this, x);
      case 2:
        return distinct_QMARK___2.call(this, x, y);
      default:
        return distinct_QMARK___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___3.cljs$lang$applyTo;
  distinct_QMARK_.cljs$lang$arity$1 = distinct_QMARK___1;
  distinct_QMARK_.cljs$lang$arity$2 = distinct_QMARK___2;
  distinct_QMARK_.cljs$lang$arity$variadic = distinct_QMARK___3.cljs$lang$arity$variadic;
  return distinct_QMARK_
}();
cljs.core.compare = function compare(x, y) {
  if(x === y) {
    return 0
  }else {
    if(x == null) {
      return-1
    }else {
      if(y == null) {
        return 1
      }else {
        if(cljs.core.type.call(null, x) === cljs.core.type.call(null, y)) {
          if(function() {
            var G__7440__7441 = x;
            if(G__7440__7441) {
              if(cljs.core.truth_(function() {
                var or__3824__auto____7442 = null;
                if(cljs.core.truth_(or__3824__auto____7442)) {
                  return or__3824__auto____7442
                }else {
                  return G__7440__7441.cljs$core$IComparable$
                }
              }())) {
                return true
              }else {
                if(!G__7440__7441.cljs$lang$protocol_mask$partition$) {
                  return cljs.core.type_satisfies_.call(null, cljs.core.IComparable, G__7440__7441)
                }else {
                  return false
                }
              }
            }else {
              return cljs.core.type_satisfies_.call(null, cljs.core.IComparable, G__7440__7441)
            }
          }()) {
            return cljs.core._compare.call(null, x, y)
          }else {
            return goog.array.defaultCompare(x, y)
          }
        }else {
          if("\ufdd0'else") {
            throw new Error("compare on non-nil objects of different types");
          }else {
            return null
          }
        }
      }
    }
  }
};
cljs.core.compare_indexed = function() {
  var compare_indexed = null;
  var compare_indexed__2 = function(xs, ys) {
    var xl__7447 = cljs.core.count.call(null, xs);
    var yl__7448 = cljs.core.count.call(null, ys);
    if(xl__7447 < yl__7448) {
      return-1
    }else {
      if(xl__7447 > yl__7448) {
        return 1
      }else {
        if("\ufdd0'else") {
          return compare_indexed.call(null, xs, ys, xl__7447, 0)
        }else {
          return null
        }
      }
    }
  };
  var compare_indexed__4 = function(xs, ys, len, n) {
    while(true) {
      var d__7449 = cljs.core.compare.call(null, cljs.core.nth.call(null, xs, n), cljs.core.nth.call(null, ys, n));
      if(function() {
        var and__3822__auto____7450 = d__7449 === 0;
        if(and__3822__auto____7450) {
          return n + 1 < len
        }else {
          return and__3822__auto____7450
        }
      }()) {
        var G__7451 = xs;
        var G__7452 = ys;
        var G__7453 = len;
        var G__7454 = n + 1;
        xs = G__7451;
        ys = G__7452;
        len = G__7453;
        n = G__7454;
        continue
      }else {
        return d__7449
      }
      break
    }
  };
  compare_indexed = function(xs, ys, len, n) {
    switch(arguments.length) {
      case 2:
        return compare_indexed__2.call(this, xs, ys);
      case 4:
        return compare_indexed__4.call(this, xs, ys, len, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  compare_indexed.cljs$lang$arity$2 = compare_indexed__2;
  compare_indexed.cljs$lang$arity$4 = compare_indexed__4;
  return compare_indexed
}();
cljs.core.fn__GT_comparator = function fn__GT_comparator(f) {
  if(cljs.core._EQ_.call(null, f, cljs.core.compare)) {
    return cljs.core.compare
  }else {
    return function(x, y) {
      var r__7456 = f.call(null, x, y);
      if(cljs.core.number_QMARK_.call(null, r__7456)) {
        return r__7456
      }else {
        if(cljs.core.truth_(r__7456)) {
          return-1
        }else {
          if(cljs.core.truth_(f.call(null, y, x))) {
            return 1
          }else {
            return 0
          }
        }
      }
    }
  }
};
cljs.core.sort = function() {
  var sort = null;
  var sort__1 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__2 = function(comp, coll) {
    if(cljs.core.seq.call(null, coll)) {
      var a__7458 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort(a__7458, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__7458)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__1.call(this, comp);
      case 2:
        return sort__2.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  sort.cljs$lang$arity$1 = sort__1;
  sort.cljs$lang$arity$2 = sort__2;
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__2 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__3 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__2.call(this, keyfn, comp);
      case 3:
        return sort_by__3.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  sort_by.cljs$lang$arity$2 = sort_by__2;
  sort_by.cljs$lang$arity$3 = sort_by__3;
  return sort_by
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__2 = function(f, coll) {
    var temp__3971__auto____7464 = cljs.core.seq.call(null, coll);
    if(temp__3971__auto____7464) {
      var s__7465 = temp__3971__auto____7464;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__7465), cljs.core.next.call(null, s__7465))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__3 = function(f, val, coll) {
    var val__7466 = val;
    var coll__7467 = cljs.core.seq.call(null, coll);
    while(true) {
      if(coll__7467) {
        var nval__7468 = f.call(null, val__7466, cljs.core.first.call(null, coll__7467));
        if(cljs.core.reduced_QMARK_.call(null, nval__7468)) {
          return cljs.core.deref.call(null, nval__7468)
        }else {
          var G__7469 = nval__7468;
          var G__7470 = cljs.core.next.call(null, coll__7467);
          val__7466 = G__7469;
          coll__7467 = G__7470;
          continue
        }
      }else {
        return val__7466
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__2.call(this, f, val);
      case 3:
        return seq_reduce__3.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  seq_reduce.cljs$lang$arity$2 = seq_reduce__2;
  seq_reduce.cljs$lang$arity$3 = seq_reduce__3;
  return seq_reduce
}();
cljs.core.shuffle = function shuffle(coll) {
  var a__7472 = cljs.core.to_array.call(null, coll);
  goog.array.shuffle(a__7472);
  return cljs.core.vec.call(null, a__7472)
};
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__2 = function(f, coll) {
    if(function() {
      var G__7479__7480 = coll;
      if(G__7479__7480) {
        if(function() {
          var or__3824__auto____7481 = G__7479__7480.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____7481) {
            return or__3824__auto____7481
          }else {
            return G__7479__7480.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__7479__7480.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7479__7480)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7479__7480)
      }
    }()) {
      return cljs.core._reduce.call(null, coll, f)
    }else {
      return cljs.core.seq_reduce.call(null, f, coll)
    }
  };
  var reduce__3 = function(f, val, coll) {
    if(function() {
      var G__7482__7483 = coll;
      if(G__7482__7483) {
        if(function() {
          var or__3824__auto____7484 = G__7482__7483.cljs$lang$protocol_mask$partition0$ & 524288;
          if(or__3824__auto____7484) {
            return or__3824__auto____7484
          }else {
            return G__7482__7483.cljs$core$IReduce$
          }
        }()) {
          return true
        }else {
          if(!G__7482__7483.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7482__7483)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReduce, G__7482__7483)
      }
    }()) {
      return cljs.core._reduce.call(null, coll, f, val)
    }else {
      return cljs.core.seq_reduce.call(null, f, val, coll)
    }
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__2.call(this, f, val);
      case 3:
        return reduce__3.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  reduce.cljs$lang$arity$2 = reduce__2;
  reduce.cljs$lang$arity$3 = reduce__3;
  return reduce
}();
cljs.core.reduce_kv = function reduce_kv(f, init, coll) {
  return cljs.core._kv_reduce.call(null, coll, f, init)
};
cljs.core.Reduced = function(val) {
  this.val = val;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32768
};
cljs.core.Reduced.cljs$lang$type = true;
cljs.core.Reduced.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Reduced")
};
cljs.core.Reduced.prototype.cljs$core$IDeref$_deref$arity$1 = function(o) {
  var this__7485 = this;
  return this__7485.val
};
cljs.core.Reduced;
cljs.core.reduced_QMARK_ = function reduced_QMARK_(r) {
  return cljs.core.instance_QMARK_.call(null, cljs.core.Reduced, r)
};
cljs.core.reduced = function reduced(x) {
  return new cljs.core.Reduced(x)
};
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___0 = function() {
    return 0
  };
  var _PLUS___1 = function(x) {
    return x
  };
  var _PLUS___2 = function(x, y) {
    return x + y
  };
  var _PLUS___3 = function() {
    var G__7486__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__7486 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7486__delegate.call(this, x, y, more)
    };
    G__7486.cljs$lang$maxFixedArity = 2;
    G__7486.cljs$lang$applyTo = function(arglist__7487) {
      var x = cljs.core.first(arglist__7487);
      var y = cljs.core.first(cljs.core.next(arglist__7487));
      var more = cljs.core.rest(cljs.core.next(arglist__7487));
      return G__7486__delegate(x, y, more)
    };
    G__7486.cljs$lang$arity$variadic = G__7486__delegate;
    return G__7486
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___0.call(this);
      case 1:
        return _PLUS___1.call(this, x);
      case 2:
        return _PLUS___2.call(this, x, y);
      default:
        return _PLUS___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___3.cljs$lang$applyTo;
  _PLUS_.cljs$lang$arity$0 = _PLUS___0;
  _PLUS_.cljs$lang$arity$1 = _PLUS___1;
  _PLUS_.cljs$lang$arity$2 = _PLUS___2;
  _PLUS_.cljs$lang$arity$variadic = _PLUS___3.cljs$lang$arity$variadic;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___1 = function(x) {
    return-x
  };
  var ___2 = function(x, y) {
    return x - y
  };
  var ___3 = function() {
    var G__7488__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__7488 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7488__delegate.call(this, x, y, more)
    };
    G__7488.cljs$lang$maxFixedArity = 2;
    G__7488.cljs$lang$applyTo = function(arglist__7489) {
      var x = cljs.core.first(arglist__7489);
      var y = cljs.core.first(cljs.core.next(arglist__7489));
      var more = cljs.core.rest(cljs.core.next(arglist__7489));
      return G__7488__delegate(x, y, more)
    };
    G__7488.cljs$lang$arity$variadic = G__7488__delegate;
    return G__7488
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___1.call(this, x);
      case 2:
        return ___2.call(this, x, y);
      default:
        return ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___3.cljs$lang$applyTo;
  _.cljs$lang$arity$1 = ___1;
  _.cljs$lang$arity$2 = ___2;
  _.cljs$lang$arity$variadic = ___3.cljs$lang$arity$variadic;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___0 = function() {
    return 1
  };
  var _STAR___1 = function(x) {
    return x
  };
  var _STAR___2 = function(x, y) {
    return x * y
  };
  var _STAR___3 = function() {
    var G__7490__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__7490 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7490__delegate.call(this, x, y, more)
    };
    G__7490.cljs$lang$maxFixedArity = 2;
    G__7490.cljs$lang$applyTo = function(arglist__7491) {
      var x = cljs.core.first(arglist__7491);
      var y = cljs.core.first(cljs.core.next(arglist__7491));
      var more = cljs.core.rest(cljs.core.next(arglist__7491));
      return G__7490__delegate(x, y, more)
    };
    G__7490.cljs$lang$arity$variadic = G__7490__delegate;
    return G__7490
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___0.call(this);
      case 1:
        return _STAR___1.call(this, x);
      case 2:
        return _STAR___2.call(this, x, y);
      default:
        return _STAR___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___3.cljs$lang$applyTo;
  _STAR_.cljs$lang$arity$0 = _STAR___0;
  _STAR_.cljs$lang$arity$1 = _STAR___1;
  _STAR_.cljs$lang$arity$2 = _STAR___2;
  _STAR_.cljs$lang$arity$variadic = _STAR___3.cljs$lang$arity$variadic;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___1 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___2 = function(x, y) {
    return x / y
  };
  var _SLASH___3 = function() {
    var G__7492__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__7492 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7492__delegate.call(this, x, y, more)
    };
    G__7492.cljs$lang$maxFixedArity = 2;
    G__7492.cljs$lang$applyTo = function(arglist__7493) {
      var x = cljs.core.first(arglist__7493);
      var y = cljs.core.first(cljs.core.next(arglist__7493));
      var more = cljs.core.rest(cljs.core.next(arglist__7493));
      return G__7492__delegate(x, y, more)
    };
    G__7492.cljs$lang$arity$variadic = G__7492__delegate;
    return G__7492
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___1.call(this, x);
      case 2:
        return _SLASH___2.call(this, x, y);
      default:
        return _SLASH___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___3.cljs$lang$applyTo;
  _SLASH_.cljs$lang$arity$1 = _SLASH___1;
  _SLASH_.cljs$lang$arity$2 = _SLASH___2;
  _SLASH_.cljs$lang$arity$variadic = _SLASH___3.cljs$lang$arity$variadic;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___1 = function(x) {
    return true
  };
  var _LT___2 = function(x, y) {
    return x < y
  };
  var _LT___3 = function() {
    var G__7494__delegate = function(x, y, more) {
      while(true) {
        if(x < y) {
          if(cljs.core.next.call(null, more)) {
            var G__7495 = y;
            var G__7496 = cljs.core.first.call(null, more);
            var G__7497 = cljs.core.next.call(null, more);
            x = G__7495;
            y = G__7496;
            more = G__7497;
            continue
          }else {
            return y < cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7494 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7494__delegate.call(this, x, y, more)
    };
    G__7494.cljs$lang$maxFixedArity = 2;
    G__7494.cljs$lang$applyTo = function(arglist__7498) {
      var x = cljs.core.first(arglist__7498);
      var y = cljs.core.first(cljs.core.next(arglist__7498));
      var more = cljs.core.rest(cljs.core.next(arglist__7498));
      return G__7494__delegate(x, y, more)
    };
    G__7494.cljs$lang$arity$variadic = G__7494__delegate;
    return G__7494
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___1.call(this, x);
      case 2:
        return _LT___2.call(this, x, y);
      default:
        return _LT___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___3.cljs$lang$applyTo;
  _LT_.cljs$lang$arity$1 = _LT___1;
  _LT_.cljs$lang$arity$2 = _LT___2;
  _LT_.cljs$lang$arity$variadic = _LT___3.cljs$lang$arity$variadic;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___1 = function(x) {
    return true
  };
  var _LT__EQ___2 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___3 = function() {
    var G__7499__delegate = function(x, y, more) {
      while(true) {
        if(x <= y) {
          if(cljs.core.next.call(null, more)) {
            var G__7500 = y;
            var G__7501 = cljs.core.first.call(null, more);
            var G__7502 = cljs.core.next.call(null, more);
            x = G__7500;
            y = G__7501;
            more = G__7502;
            continue
          }else {
            return y <= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7499 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7499__delegate.call(this, x, y, more)
    };
    G__7499.cljs$lang$maxFixedArity = 2;
    G__7499.cljs$lang$applyTo = function(arglist__7503) {
      var x = cljs.core.first(arglist__7503);
      var y = cljs.core.first(cljs.core.next(arglist__7503));
      var more = cljs.core.rest(cljs.core.next(arglist__7503));
      return G__7499__delegate(x, y, more)
    };
    G__7499.cljs$lang$arity$variadic = G__7499__delegate;
    return G__7499
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___1.call(this, x);
      case 2:
        return _LT__EQ___2.call(this, x, y);
      default:
        return _LT__EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___3.cljs$lang$applyTo;
  _LT__EQ_.cljs$lang$arity$1 = _LT__EQ___1;
  _LT__EQ_.cljs$lang$arity$2 = _LT__EQ___2;
  _LT__EQ_.cljs$lang$arity$variadic = _LT__EQ___3.cljs$lang$arity$variadic;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___1 = function(x) {
    return true
  };
  var _GT___2 = function(x, y) {
    return x > y
  };
  var _GT___3 = function() {
    var G__7504__delegate = function(x, y, more) {
      while(true) {
        if(x > y) {
          if(cljs.core.next.call(null, more)) {
            var G__7505 = y;
            var G__7506 = cljs.core.first.call(null, more);
            var G__7507 = cljs.core.next.call(null, more);
            x = G__7505;
            y = G__7506;
            more = G__7507;
            continue
          }else {
            return y > cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7504 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7504__delegate.call(this, x, y, more)
    };
    G__7504.cljs$lang$maxFixedArity = 2;
    G__7504.cljs$lang$applyTo = function(arglist__7508) {
      var x = cljs.core.first(arglist__7508);
      var y = cljs.core.first(cljs.core.next(arglist__7508));
      var more = cljs.core.rest(cljs.core.next(arglist__7508));
      return G__7504__delegate(x, y, more)
    };
    G__7504.cljs$lang$arity$variadic = G__7504__delegate;
    return G__7504
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___1.call(this, x);
      case 2:
        return _GT___2.call(this, x, y);
      default:
        return _GT___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___3.cljs$lang$applyTo;
  _GT_.cljs$lang$arity$1 = _GT___1;
  _GT_.cljs$lang$arity$2 = _GT___2;
  _GT_.cljs$lang$arity$variadic = _GT___3.cljs$lang$arity$variadic;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___1 = function(x) {
    return true
  };
  var _GT__EQ___2 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___3 = function() {
    var G__7509__delegate = function(x, y, more) {
      while(true) {
        if(x >= y) {
          if(cljs.core.next.call(null, more)) {
            var G__7510 = y;
            var G__7511 = cljs.core.first.call(null, more);
            var G__7512 = cljs.core.next.call(null, more);
            x = G__7510;
            y = G__7511;
            more = G__7512;
            continue
          }else {
            return y >= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7509 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7509__delegate.call(this, x, y, more)
    };
    G__7509.cljs$lang$maxFixedArity = 2;
    G__7509.cljs$lang$applyTo = function(arglist__7513) {
      var x = cljs.core.first(arglist__7513);
      var y = cljs.core.first(cljs.core.next(arglist__7513));
      var more = cljs.core.rest(cljs.core.next(arglist__7513));
      return G__7509__delegate(x, y, more)
    };
    G__7509.cljs$lang$arity$variadic = G__7509__delegate;
    return G__7509
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___1.call(this, x);
      case 2:
        return _GT__EQ___2.call(this, x, y);
      default:
        return _GT__EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___3.cljs$lang$applyTo;
  _GT__EQ_.cljs$lang$arity$1 = _GT__EQ___1;
  _GT__EQ_.cljs$lang$arity$2 = _GT__EQ___2;
  _GT__EQ_.cljs$lang$arity$variadic = _GT__EQ___3.cljs$lang$arity$variadic;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__1 = function(x) {
    return x
  };
  var max__2 = function(x, y) {
    return x > y ? x : y
  };
  var max__3 = function() {
    var G__7514__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__7514 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7514__delegate.call(this, x, y, more)
    };
    G__7514.cljs$lang$maxFixedArity = 2;
    G__7514.cljs$lang$applyTo = function(arglist__7515) {
      var x = cljs.core.first(arglist__7515);
      var y = cljs.core.first(cljs.core.next(arglist__7515));
      var more = cljs.core.rest(cljs.core.next(arglist__7515));
      return G__7514__delegate(x, y, more)
    };
    G__7514.cljs$lang$arity$variadic = G__7514__delegate;
    return G__7514
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__1.call(this, x);
      case 2:
        return max__2.call(this, x, y);
      default:
        return max__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__3.cljs$lang$applyTo;
  max.cljs$lang$arity$1 = max__1;
  max.cljs$lang$arity$2 = max__2;
  max.cljs$lang$arity$variadic = max__3.cljs$lang$arity$variadic;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__1 = function(x) {
    return x
  };
  var min__2 = function(x, y) {
    return x < y ? x : y
  };
  var min__3 = function() {
    var G__7516__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__7516 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7516__delegate.call(this, x, y, more)
    };
    G__7516.cljs$lang$maxFixedArity = 2;
    G__7516.cljs$lang$applyTo = function(arglist__7517) {
      var x = cljs.core.first(arglist__7517);
      var y = cljs.core.first(cljs.core.next(arglist__7517));
      var more = cljs.core.rest(cljs.core.next(arglist__7517));
      return G__7516__delegate(x, y, more)
    };
    G__7516.cljs$lang$arity$variadic = G__7516__delegate;
    return G__7516
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__1.call(this, x);
      case 2:
        return min__2.call(this, x, y);
      default:
        return min__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__3.cljs$lang$applyTo;
  min.cljs$lang$arity$1 = min__1;
  min.cljs$lang$arity$2 = min__2;
  min.cljs$lang$arity$variadic = min__3.cljs$lang$arity$variadic;
  return min
}();
cljs.core.fix = function fix(q) {
  if(q >= 0) {
    return Math.floor.call(null, q)
  }else {
    return Math.ceil.call(null, q)
  }
};
cljs.core.int$ = function int$(x) {
  return cljs.core.fix.call(null, x)
};
cljs.core.long$ = function long$(x) {
  return cljs.core.fix.call(null, x)
};
cljs.core.mod = function mod(n, d) {
  return n % d
};
cljs.core.quot = function quot(n, d) {
  var rem__7519 = n % d;
  return cljs.core.fix.call(null, (n - rem__7519) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__7521 = cljs.core.quot.call(null, n, d);
  return n - d * q__7521
};
cljs.core.rand = function() {
  var rand = null;
  var rand__0 = function() {
    return Math.random.call(null)
  };
  var rand__1 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__0.call(this);
      case 1:
        return rand__1.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  rand.cljs$lang$arity$0 = rand__0;
  rand.cljs$lang$arity$1 = rand__1;
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return cljs.core.fix.call(null, cljs.core.rand.call(null, n))
};
cljs.core.bit_xor = function bit_xor(x, y) {
  return x ^ y
};
cljs.core.bit_and = function bit_and(x, y) {
  return x & y
};
cljs.core.bit_or = function bit_or(x, y) {
  return x | y
};
cljs.core.bit_and_not = function bit_and_not(x, y) {
  return x & ~y
};
cljs.core.bit_clear = function bit_clear(x, n) {
  return x & ~(1 << n)
};
cljs.core.bit_flip = function bit_flip(x, n) {
  return x ^ 1 << n
};
cljs.core.bit_not = function bit_not(x) {
  return~x
};
cljs.core.bit_set = function bit_set(x, n) {
  return x | 1 << n
};
cljs.core.bit_test = function bit_test(x, n) {
  return(x & 1 << n) != 0
};
cljs.core.bit_shift_left = function bit_shift_left(x, n) {
  return x << n
};
cljs.core.bit_shift_right = function bit_shift_right(x, n) {
  return x >> n
};
cljs.core.bit_shift_right_zero_fill = function bit_shift_right_zero_fill(x, n) {
  return x >>> n
};
cljs.core.bit_count = function bit_count(v) {
  var v__7524 = v - (v >> 1 & 1431655765);
  var v__7525 = (v__7524 & 858993459) + (v__7524 >> 2 & 858993459);
  return(v__7525 + (v__7525 >> 4) & 252645135) * 16843009 >> 24
};
cljs.core._EQ__EQ_ = function() {
  var _EQ__EQ_ = null;
  var _EQ__EQ___1 = function(x) {
    return true
  };
  var _EQ__EQ___2 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___3 = function() {
    var G__7526__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.next.call(null, more)) {
            var G__7527 = y;
            var G__7528 = cljs.core.first.call(null, more);
            var G__7529 = cljs.core.next.call(null, more);
            x = G__7527;
            y = G__7528;
            more = G__7529;
            continue
          }else {
            return _EQ__EQ_.call(null, y, cljs.core.first.call(null, more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__7526 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7526__delegate.call(this, x, y, more)
    };
    G__7526.cljs$lang$maxFixedArity = 2;
    G__7526.cljs$lang$applyTo = function(arglist__7530) {
      var x = cljs.core.first(arglist__7530);
      var y = cljs.core.first(cljs.core.next(arglist__7530));
      var more = cljs.core.rest(cljs.core.next(arglist__7530));
      return G__7526__delegate(x, y, more)
    };
    G__7526.cljs$lang$arity$variadic = G__7526__delegate;
    return G__7526
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___1.call(this, x);
      case 2:
        return _EQ__EQ___2.call(this, x, y);
      default:
        return _EQ__EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___3.cljs$lang$applyTo;
  _EQ__EQ_.cljs$lang$arity$1 = _EQ__EQ___1;
  _EQ__EQ_.cljs$lang$arity$2 = _EQ__EQ___2;
  _EQ__EQ_.cljs$lang$arity$variadic = _EQ__EQ___3.cljs$lang$arity$variadic;
  return _EQ__EQ_
}();
cljs.core.pos_QMARK_ = function pos_QMARK_(n) {
  return n > 0
};
cljs.core.zero_QMARK_ = function zero_QMARK_(n) {
  return n === 0
};
cljs.core.neg_QMARK_ = function neg_QMARK_(x) {
  return x < 0
};
cljs.core.nthnext = function nthnext(coll, n) {
  var n__7534 = n;
  var xs__7535 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3822__auto____7536 = xs__7535;
      if(and__3822__auto____7536) {
        return n__7534 > 0
      }else {
        return and__3822__auto____7536
      }
    }())) {
      var G__7537 = n__7534 - 1;
      var G__7538 = cljs.core.next.call(null, xs__7535);
      n__7534 = G__7537;
      xs__7535 = G__7538;
      continue
    }else {
      return xs__7535
    }
    break
  }
};
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___0 = function() {
    return""
  };
  var str_STAR___1 = function(x) {
    if(x == null) {
      return""
    }else {
      if("\ufdd0'else") {
        return x.toString()
      }else {
        return null
      }
    }
  };
  var str_STAR___2 = function() {
    var G__7539__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__7540 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__7541 = cljs.core.next.call(null, more);
            sb = G__7540;
            more = G__7541;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__7539 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7539__delegate.call(this, x, ys)
    };
    G__7539.cljs$lang$maxFixedArity = 1;
    G__7539.cljs$lang$applyTo = function(arglist__7542) {
      var x = cljs.core.first(arglist__7542);
      var ys = cljs.core.rest(arglist__7542);
      return G__7539__delegate(x, ys)
    };
    G__7539.cljs$lang$arity$variadic = G__7539__delegate;
    return G__7539
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___0.call(this);
      case 1:
        return str_STAR___1.call(this, x);
      default:
        return str_STAR___2.cljs$lang$arity$variadic(x, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___2.cljs$lang$applyTo;
  str_STAR_.cljs$lang$arity$0 = str_STAR___0;
  str_STAR_.cljs$lang$arity$1 = str_STAR___1;
  str_STAR_.cljs$lang$arity$variadic = str_STAR___2.cljs$lang$arity$variadic;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__0 = function() {
    return""
  };
  var str__1 = function(x) {
    if(cljs.core.symbol_QMARK_.call(null, x)) {
      return x.substring(2, x.length)
    }else {
      if(cljs.core.keyword_QMARK_.call(null, x)) {
        return cljs.core.str_STAR_.call(null, ":", x.substring(2, x.length))
      }else {
        if(x == null) {
          return""
        }else {
          if("\ufdd0'else") {
            return x.toString()
          }else {
            return null
          }
        }
      }
    }
  };
  var str__2 = function() {
    var G__7543__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__7544 = sb.append(str.call(null, cljs.core.first.call(null, more)));
            var G__7545 = cljs.core.next.call(null, more);
            sb = G__7544;
            more = G__7545;
            continue
          }else {
            return cljs.core.str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str.call(null, x)), ys)
    };
    var G__7543 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__7543__delegate.call(this, x, ys)
    };
    G__7543.cljs$lang$maxFixedArity = 1;
    G__7543.cljs$lang$applyTo = function(arglist__7546) {
      var x = cljs.core.first(arglist__7546);
      var ys = cljs.core.rest(arglist__7546);
      return G__7543__delegate(x, ys)
    };
    G__7543.cljs$lang$arity$variadic = G__7543__delegate;
    return G__7543
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__0.call(this);
      case 1:
        return str__1.call(this, x);
      default:
        return str__2.cljs$lang$arity$variadic(x, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__2.cljs$lang$applyTo;
  str.cljs$lang$arity$0 = str__0;
  str.cljs$lang$arity$1 = str__1;
  str.cljs$lang$arity$variadic = str__2.cljs$lang$arity$variadic;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__2 = function(s, start) {
    return s.substring(start)
  };
  var subs__3 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__2.call(this, s, start);
      case 3:
        return subs__3.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  subs.cljs$lang$arity$2 = subs__2;
  subs.cljs$lang$arity$3 = subs__3;
  return subs
}();
cljs.core.format = function() {
  var format__delegate = function(fmt, args) {
    return cljs.core.apply.call(null, goog.string.format, fmt, args)
  };
  var format = function(fmt, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return format__delegate.call(this, fmt, args)
  };
  format.cljs$lang$maxFixedArity = 1;
  format.cljs$lang$applyTo = function(arglist__7547) {
    var fmt = cljs.core.first(arglist__7547);
    var args = cljs.core.rest(arglist__7547);
    return format__delegate(fmt, args)
  };
  format.cljs$lang$arity$variadic = format__delegate;
  return format
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__1 = function(name) {
    if(cljs.core.symbol_QMARK_.call(null, name)) {
      name
    }else {
      if(cljs.core.keyword_QMARK_.call(null, name)) {
        cljs.core.str_STAR_.call(null, "\ufdd1", "'", cljs.core.subs.call(null, name, 2))
      }else {
      }
    }
    return cljs.core.str_STAR_.call(null, "\ufdd1", "'", name)
  };
  var symbol__2 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__1.call(this, ns);
      case 2:
        return symbol__2.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  symbol.cljs$lang$arity$1 = symbol__1;
  symbol.cljs$lang$arity$2 = symbol__2;
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__1 = function(name) {
    if(cljs.core.keyword_QMARK_.call(null, name)) {
      return name
    }else {
      if(cljs.core.symbol_QMARK_.call(null, name)) {
        return cljs.core.str_STAR_.call(null, "\ufdd0", "'", cljs.core.subs.call(null, name, 2))
      }else {
        if("\ufdd0'else") {
          return cljs.core.str_STAR_.call(null, "\ufdd0", "'", name)
        }else {
          return null
        }
      }
    }
  };
  var keyword__2 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__1.call(this, ns);
      case 2:
        return keyword__2.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  keyword.cljs$lang$arity$1 = keyword__1;
  keyword.cljs$lang$arity$2 = keyword__2;
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.sequential_QMARK_.call(null, y) ? function() {
    var xs__7550 = cljs.core.seq.call(null, x);
    var ys__7551 = cljs.core.seq.call(null, y);
    while(true) {
      if(xs__7550 == null) {
        return ys__7551 == null
      }else {
        if(ys__7551 == null) {
          return false
        }else {
          if(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__7550), cljs.core.first.call(null, ys__7551))) {
            var G__7552 = cljs.core.next.call(null, xs__7550);
            var G__7553 = cljs.core.next.call(null, ys__7551);
            xs__7550 = G__7552;
            ys__7551 = G__7553;
            continue
          }else {
            if("\ufdd0'else") {
              return false
            }else {
              return null
            }
          }
        }
      }
      break
    }
  }() : null)
};
cljs.core.hash_combine = function hash_combine(seed, hash) {
  return seed ^ hash + 2654435769 + (seed << 6) + (seed >> 2)
};
cljs.core.hash_coll = function hash_coll(coll) {
  return cljs.core.reduce.call(null, function(p1__7554_SHARP_, p2__7555_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__7554_SHARP_, cljs.core.hash.call(null, p2__7555_SHARP_, false))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll), false), cljs.core.next.call(null, coll))
};
cljs.core.hash_imap = function hash_imap(m) {
  var h__7559 = 0;
  var s__7560 = cljs.core.seq.call(null, m);
  while(true) {
    if(s__7560) {
      var e__7561 = cljs.core.first.call(null, s__7560);
      var G__7562 = (h__7559 + (cljs.core.hash.call(null, cljs.core.key.call(null, e__7561)) ^ cljs.core.hash.call(null, cljs.core.val.call(null, e__7561)))) % 4503599627370496;
      var G__7563 = cljs.core.next.call(null, s__7560);
      h__7559 = G__7562;
      s__7560 = G__7563;
      continue
    }else {
      return h__7559
    }
    break
  }
};
cljs.core.hash_iset = function hash_iset(s) {
  var h__7567 = 0;
  var s__7568 = cljs.core.seq.call(null, s);
  while(true) {
    if(s__7568) {
      var e__7569 = cljs.core.first.call(null, s__7568);
      var G__7570 = (h__7567 + cljs.core.hash.call(null, e__7569)) % 4503599627370496;
      var G__7571 = cljs.core.next.call(null, s__7568);
      h__7567 = G__7570;
      s__7568 = G__7571;
      continue
    }else {
      return h__7567
    }
    break
  }
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__7592__7593 = cljs.core.seq.call(null, fn_map);
  if(G__7592__7593) {
    var G__7595__7597 = cljs.core.first.call(null, G__7592__7593);
    var vec__7596__7598 = G__7595__7597;
    var key_name__7599 = cljs.core.nth.call(null, vec__7596__7598, 0, null);
    var f__7600 = cljs.core.nth.call(null, vec__7596__7598, 1, null);
    var G__7592__7601 = G__7592__7593;
    var G__7595__7602 = G__7595__7597;
    var G__7592__7603 = G__7592__7601;
    while(true) {
      var vec__7604__7605 = G__7595__7602;
      var key_name__7606 = cljs.core.nth.call(null, vec__7604__7605, 0, null);
      var f__7607 = cljs.core.nth.call(null, vec__7604__7605, 1, null);
      var G__7592__7608 = G__7592__7603;
      var str_name__7609 = cljs.core.name.call(null, key_name__7606);
      obj[str_name__7609] = f__7607;
      var temp__3974__auto____7610 = cljs.core.next.call(null, G__7592__7608);
      if(temp__3974__auto____7610) {
        var G__7592__7611 = temp__3974__auto____7610;
        var G__7612 = cljs.core.first.call(null, G__7592__7611);
        var G__7613 = G__7592__7611;
        G__7595__7602 = G__7612;
        G__7592__7603 = G__7613;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return obj
};
cljs.core.List = function(meta, first, rest, count, __hash) {
  this.meta = meta;
  this.first = first;
  this.rest = rest;
  this.count = count;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 65413358
};
cljs.core.List.cljs$lang$type = true;
cljs.core.List.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/List")
};
cljs.core.List.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7614 = this;
  var h__2192__auto____7615 = this__7614.__hash;
  if(!(h__2192__auto____7615 == null)) {
    return h__2192__auto____7615
  }else {
    var h__2192__auto____7616 = cljs.core.hash_coll.call(null, coll);
    this__7614.__hash = h__2192__auto____7616;
    return h__2192__auto____7616
  }
};
cljs.core.List.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7617 = this;
  if(this__7617.count === 1) {
    return null
  }else {
    return this__7617.rest
  }
};
cljs.core.List.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7618 = this;
  return new cljs.core.List(this__7618.meta, o, coll, this__7618.count + 1, null)
};
cljs.core.List.prototype.toString = function() {
  var this__7619 = this;
  var this__7620 = this;
  return cljs.core.pr_str.call(null, this__7620)
};
cljs.core.List.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7621 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__7622 = this;
  return this__7622.count
};
cljs.core.List.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__7623 = this;
  return this__7623.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__7624 = this;
  return coll.cljs$core$ISeq$_rest$arity$1(coll)
};
cljs.core.List.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7625 = this;
  return this__7625.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7626 = this;
  if(this__7626.count === 1) {
    return cljs.core.List.EMPTY
  }else {
    return this__7626.rest
  }
};
cljs.core.List.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7627 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7628 = this;
  return new cljs.core.List(meta, this__7628.first, this__7628.rest, this__7628.count, this__7628.__hash)
};
cljs.core.List.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7629 = this;
  return this__7629.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7630 = this;
  return cljs.core.List.EMPTY
};
cljs.core.List;
cljs.core.EmptyList = function(meta) {
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 65413326
};
cljs.core.EmptyList.cljs$lang$type = true;
cljs.core.EmptyList.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/EmptyList")
};
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7631 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7632 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7633 = this;
  return new cljs.core.List(this__7633.meta, o, null, 1, null)
};
cljs.core.EmptyList.prototype.toString = function() {
  var this__7634 = this;
  var this__7635 = this;
  return cljs.core.pr_str.call(null, this__7635)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7636 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__7637 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__7638 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__7639 = this;
  throw new Error("Can't pop empty list");
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7640 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7641 = this;
  return cljs.core.List.EMPTY
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7642 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7643 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7644 = this;
  return this__7644.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7645 = this;
  return coll
};
cljs.core.EmptyList;
cljs.core.List.EMPTY = new cljs.core.EmptyList(null);
cljs.core.reversible_QMARK_ = function reversible_QMARK_(coll) {
  var G__7649__7650 = coll;
  if(G__7649__7650) {
    if(function() {
      var or__3824__auto____7651 = G__7649__7650.cljs$lang$protocol_mask$partition0$ & 134217728;
      if(or__3824__auto____7651) {
        return or__3824__auto____7651
      }else {
        return G__7649__7650.cljs$core$IReversible$
      }
    }()) {
      return true
    }else {
      if(!G__7649__7650.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IReversible, G__7649__7650)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IReversible, G__7649__7650)
  }
};
cljs.core.rseq = function rseq(coll) {
  return cljs.core._rseq.call(null, coll)
};
cljs.core.reverse = function reverse(coll) {
  if(cljs.core.reversible_QMARK_.call(null, coll)) {
    return cljs.core.rseq.call(null, coll)
  }else {
    return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
  }
};
cljs.core.list = function() {
  var list = null;
  var list__0 = function() {
    return cljs.core.List.EMPTY
  };
  var list__1 = function(x) {
    return cljs.core.conj.call(null, cljs.core.List.EMPTY, x)
  };
  var list__2 = function(x, y) {
    return cljs.core.conj.call(null, list.call(null, y), x)
  };
  var list__3 = function(x, y, z) {
    return cljs.core.conj.call(null, list.call(null, y, z), x)
  };
  var list__4 = function() {
    var G__7652__delegate = function(x, y, z, items) {
      return cljs.core.conj.call(null, cljs.core.conj.call(null, cljs.core.conj.call(null, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, cljs.core.reverse.call(null, items)), z), y), x)
    };
    var G__7652 = function(x, y, z, var_args) {
      var items = null;
      if(goog.isDef(var_args)) {
        items = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__7652__delegate.call(this, x, y, z, items)
    };
    G__7652.cljs$lang$maxFixedArity = 3;
    G__7652.cljs$lang$applyTo = function(arglist__7653) {
      var x = cljs.core.first(arglist__7653);
      var y = cljs.core.first(cljs.core.next(arglist__7653));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7653)));
      var items = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7653)));
      return G__7652__delegate(x, y, z, items)
    };
    G__7652.cljs$lang$arity$variadic = G__7652__delegate;
    return G__7652
  }();
  list = function(x, y, z, var_args) {
    var items = var_args;
    switch(arguments.length) {
      case 0:
        return list__0.call(this);
      case 1:
        return list__1.call(this, x);
      case 2:
        return list__2.call(this, x, y);
      case 3:
        return list__3.call(this, x, y, z);
      default:
        return list__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  list.cljs$lang$maxFixedArity = 3;
  list.cljs$lang$applyTo = list__4.cljs$lang$applyTo;
  list.cljs$lang$arity$0 = list__0;
  list.cljs$lang$arity$1 = list__1;
  list.cljs$lang$arity$2 = list__2;
  list.cljs$lang$arity$3 = list__3;
  list.cljs$lang$arity$variadic = list__4.cljs$lang$arity$variadic;
  return list
}();
cljs.core.Cons = function(meta, first, rest, __hash) {
  this.meta = meta;
  this.first = first;
  this.rest = rest;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 65405164
};
cljs.core.Cons.cljs$lang$type = true;
cljs.core.Cons.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Cons")
};
cljs.core.Cons.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7654 = this;
  var h__2192__auto____7655 = this__7654.__hash;
  if(!(h__2192__auto____7655 == null)) {
    return h__2192__auto____7655
  }else {
    var h__2192__auto____7656 = cljs.core.hash_coll.call(null, coll);
    this__7654.__hash = h__2192__auto____7656;
    return h__2192__auto____7656
  }
};
cljs.core.Cons.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7657 = this;
  if(this__7657.rest == null) {
    return null
  }else {
    return cljs.core._seq.call(null, this__7657.rest)
  }
};
cljs.core.Cons.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7658 = this;
  return new cljs.core.Cons(null, o, coll, this__7658.__hash)
};
cljs.core.Cons.prototype.toString = function() {
  var this__7659 = this;
  var this__7660 = this;
  return cljs.core.pr_str.call(null, this__7660)
};
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7661 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7662 = this;
  return this__7662.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7663 = this;
  if(this__7663.rest == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__7663.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7664 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7665 = this;
  return new cljs.core.Cons(meta, this__7665.first, this__7665.rest, this__7665.__hash)
};
cljs.core.Cons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7666 = this;
  return this__7666.meta
};
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7667 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__7667.meta)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, coll) {
  if(function() {
    var or__3824__auto____7672 = coll == null;
    if(or__3824__auto____7672) {
      return or__3824__auto____7672
    }else {
      var G__7673__7674 = coll;
      if(G__7673__7674) {
        if(function() {
          var or__3824__auto____7675 = G__7673__7674.cljs$lang$protocol_mask$partition0$ & 64;
          if(or__3824__auto____7675) {
            return or__3824__auto____7675
          }else {
            return G__7673__7674.cljs$core$ISeq$
          }
        }()) {
          return true
        }else {
          if(!G__7673__7674.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7673__7674)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, G__7673__7674)
      }
    }
  }()) {
    return new cljs.core.Cons(null, x, coll, null)
  }else {
    return new cljs.core.Cons(null, x, cljs.core.seq.call(null, coll), null)
  }
};
cljs.core.list_QMARK_ = function list_QMARK_(x) {
  var G__7679__7680 = x;
  if(G__7679__7680) {
    if(function() {
      var or__3824__auto____7681 = G__7679__7680.cljs$lang$protocol_mask$partition0$ & 33554432;
      if(or__3824__auto____7681) {
        return or__3824__auto____7681
      }else {
        return G__7679__7680.cljs$core$IList$
      }
    }()) {
      return true
    }else {
      if(!G__7679__7680.cljs$lang$protocol_mask$partition0$) {
        return cljs.core.type_satisfies_.call(null, cljs.core.IList, G__7679__7680)
      }else {
        return false
      }
    }
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IList, G__7679__7680)
  }
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__7682 = null;
  var G__7682__2 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__7682__3 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__7682 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__7682__2.call(this, string, f);
      case 3:
        return G__7682__3.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7682
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__7683 = null;
  var G__7683__2 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__7683__3 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__7683 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7683__2.call(this, string, k);
      case 3:
        return G__7683__3.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7683
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__7684 = null;
  var G__7684__2 = function(string, n) {
    if(n < cljs.core._count.call(null, string)) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__7684__3 = function(string, n, not_found) {
    if(n < cljs.core._count.call(null, string)) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__7684 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7684__2.call(this, string, n);
      case 3:
        return G__7684__3.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7684
}();
cljs.core.ICounted["string"] = true;
cljs.core._count["string"] = function(s) {
  return s.length
};
cljs.core.ISeqable["string"] = true;
cljs.core._seq["string"] = function(string) {
  return cljs.core.prim_seq.call(null, string, 0)
};
cljs.core.IHash["string"] = true;
cljs.core._hash["string"] = function(o) {
  return goog.string.hashCode(o)
};
cljs.core.Keyword = function(k) {
  this.k = k;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 1
};
cljs.core.Keyword.cljs$lang$type = true;
cljs.core.Keyword.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Keyword")
};
cljs.core.Keyword.prototype.call = function() {
  var G__7696 = null;
  var G__7696__2 = function(this_sym7687, coll) {
    var this__7689 = this;
    var this_sym7687__7690 = this;
    var ___7691 = this_sym7687__7690;
    if(coll == null) {
      return null
    }else {
      var strobj__7692 = coll.strobj;
      if(strobj__7692 == null) {
        return cljs.core._lookup.call(null, coll, this__7689.k, null)
      }else {
        return strobj__7692[this__7689.k]
      }
    }
  };
  var G__7696__3 = function(this_sym7688, coll, not_found) {
    var this__7689 = this;
    var this_sym7688__7693 = this;
    var ___7694 = this_sym7688__7693;
    if(coll == null) {
      return not_found
    }else {
      return cljs.core._lookup.call(null, coll, this__7689.k, not_found)
    }
  };
  G__7696 = function(this_sym7688, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7696__2.call(this, this_sym7688, coll);
      case 3:
        return G__7696__3.call(this, this_sym7688, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7696
}();
cljs.core.Keyword.prototype.apply = function(this_sym7685, args7686) {
  var this__7695 = this;
  return this_sym7685.call.apply(this_sym7685, [this_sym7685].concat(args7686.slice()))
};
cljs.core.Keyword;
String.prototype.cljs$core$IFn$ = true;
String.prototype.call = function() {
  var G__7705 = null;
  var G__7705__2 = function(this_sym7699, coll) {
    var this_sym7699__7701 = this;
    var this__7702 = this_sym7699__7701;
    return cljs.core._lookup.call(null, coll, this__7702.toString(), null)
  };
  var G__7705__3 = function(this_sym7700, coll, not_found) {
    var this_sym7700__7703 = this;
    var this__7704 = this_sym7700__7703;
    return cljs.core._lookup.call(null, coll, this__7704.toString(), not_found)
  };
  G__7705 = function(this_sym7700, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__7705__2.call(this, this_sym7700, coll);
      case 3:
        return G__7705__3.call(this, this_sym7700, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__7705
}();
String.prototype.apply = function(this_sym7697, args7698) {
  return this_sym7697.call.apply(this_sym7697, [this_sym7697].concat(args7698.slice()))
};
String.prototype.apply = function(s, args) {
  if(cljs.core.count.call(null, args) < 2) {
    return cljs.core._lookup.call(null, args[0], s, null)
  }else {
    return cljs.core._lookup.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__7707 = lazy_seq.x;
  if(lazy_seq.realized) {
    return x__7707
  }else {
    lazy_seq.x = x__7707.call(null);
    lazy_seq.realized = true;
    return lazy_seq.x
  }
};
cljs.core.LazySeq = function(meta, realized, x, __hash) {
  this.meta = meta;
  this.realized = realized;
  this.x = x;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850700
};
cljs.core.LazySeq.cljs$lang$type = true;
cljs.core.LazySeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/LazySeq")
};
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__7708 = this;
  var h__2192__auto____7709 = this__7708.__hash;
  if(!(h__2192__auto____7709 == null)) {
    return h__2192__auto____7709
  }else {
    var h__2192__auto____7710 = cljs.core.hash_coll.call(null, coll);
    this__7708.__hash = h__2192__auto____7710;
    return h__2192__auto____7710
  }
};
cljs.core.LazySeq.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__7711 = this;
  return cljs.core._seq.call(null, coll.cljs$core$ISeq$_rest$arity$1(coll))
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__7712 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.toString = function() {
  var this__7713 = this;
  var this__7714 = this;
  return cljs.core.pr_str.call(null, this__7714)
};
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7715 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7716 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7717 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7718 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__7719 = this;
  return new cljs.core.LazySeq(meta, this__7719.realized, this__7719.x, this__7719.__hash)
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7720 = this;
  return this__7720.meta
};
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__7721 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__7721.meta)
};
cljs.core.LazySeq;
cljs.core.ChunkBuffer = function(buf, end) {
  this.buf = buf;
  this.end = end;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 2
};
cljs.core.ChunkBuffer.cljs$lang$type = true;
cljs.core.ChunkBuffer.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/ChunkBuffer")
};
cljs.core.ChunkBuffer.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__7722 = this;
  return this__7722.end
};
cljs.core.ChunkBuffer.prototype.add = function(o) {
  var this__7723 = this;
  var ___7724 = this;
  this__7723.buf[this__7723.end] = o;
  return this__7723.end = this__7723.end + 1
};
cljs.core.ChunkBuffer.prototype.chunk = function(o) {
  var this__7725 = this;
  var ___7726 = this;
  var ret__7727 = new cljs.core.ArrayChunk(this__7725.buf, 0, this__7725.end);
  this__7725.buf = null;
  return ret__7727
};
cljs.core.ChunkBuffer;
cljs.core.chunk_buffer = function chunk_buffer(capacity) {
  return new cljs.core.ChunkBuffer(cljs.core.make_array.call(null, capacity), 0)
};
cljs.core.ArrayChunk = function(arr, off, end) {
  this.arr = arr;
  this.off = off;
  this.end = end;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 524306
};
cljs.core.ArrayChunk.cljs$lang$type = true;
cljs.core.ArrayChunk.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/ArrayChunk")
};
cljs.core.ArrayChunk.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__7728 = this;
  return cljs.core.ci_reduce.call(null, coll, f, this__7728.arr[this__7728.off], this__7728.off + 1)
};
cljs.core.ArrayChunk.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__7729 = this;
  return cljs.core.ci_reduce.call(null, coll, f, start, this__7729.off)
};
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$ = true;
cljs.core.ArrayChunk.prototype.cljs$core$IChunk$_drop_first$arity$1 = function(coll) {
  var this__7730 = this;
  if(this__7730.off === this__7730.end) {
    throw new Error("-drop-first of empty chunk");
  }else {
    return new cljs.core.ArrayChunk(this__7730.arr, this__7730.off + 1, this__7730.end)
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, i) {
  var this__7731 = this;
  return this__7731.arr[this__7731.off + i]
};
cljs.core.ArrayChunk.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, i, not_found) {
  var this__7732 = this;
  if(function() {
    var and__3822__auto____7733 = i >= 0;
    if(and__3822__auto____7733) {
      return i < this__7732.end - this__7732.off
    }else {
      return and__3822__auto____7733
    }
  }()) {
    return this__7732.arr[this__7732.off + i]
  }else {
    return not_found
  }
};
cljs.core.ArrayChunk.prototype.cljs$core$ICounted$_count$arity$1 = function(_) {
  var this__7734 = this;
  return this__7734.end - this__7734.off
};
cljs.core.ArrayChunk;
cljs.core.array_chunk = function() {
  var array_chunk = null;
  var array_chunk__1 = function(arr) {
    return array_chunk.call(null, arr, 0, arr.length)
  };
  var array_chunk__2 = function(arr, off) {
    return array_chunk.call(null, arr, off, arr.length)
  };
  var array_chunk__3 = function(arr, off, end) {
    return new cljs.core.ArrayChunk(arr, off, end)
  };
  array_chunk = function(arr, off, end) {
    switch(arguments.length) {
      case 1:
        return array_chunk__1.call(this, arr);
      case 2:
        return array_chunk__2.call(this, arr, off);
      case 3:
        return array_chunk__3.call(this, arr, off, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  array_chunk.cljs$lang$arity$1 = array_chunk__1;
  array_chunk.cljs$lang$arity$2 = array_chunk__2;
  array_chunk.cljs$lang$arity$3 = array_chunk__3;
  return array_chunk
}();
cljs.core.ChunkedCons = function(chunk, more, meta) {
  this.chunk = chunk;
  this.more = more;
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 27656296
};
cljs.core.ChunkedCons.cljs$lang$type = true;
cljs.core.ChunkedCons.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/ChunkedCons")
};
cljs.core.ChunkedCons.prototype.cljs$core$ICollection$_conj$arity$2 = function(this$, o) {
  var this__7735 = this;
  return cljs.core.cons.call(null, o, this$)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__7736 = this;
  return coll
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__7737 = this;
  return cljs.core._nth.call(null, this__7737.chunk, 0)
};
cljs.core.ChunkedCons.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__7738 = this;
  if(cljs.core._count.call(null, this__7738.chunk) > 1) {
    return new cljs.core.ChunkedCons(cljs.core._drop_first.call(null, this__7738.chunk), this__7738.more, this__7738.meta)
  }else {
    if(this__7738.more == null) {
      return cljs.core.List.EMPTY
    }else {
      return this__7738.more
    }
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__7739 = this;
  if(this__7739.more == null) {
    return null
  }else {
    return this__7739.more
  }
};
cljs.core.ChunkedCons.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__7740 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ChunkedCons.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__7741 = this;
  return new cljs.core.ChunkedCons(this__7741.chunk, this__7741.more, m)
};
cljs.core.ChunkedCons.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__7742 = this;
  return this__7742.meta
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__7743 = this;
  return this__7743.chunk
};
cljs.core.ChunkedCons.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__7744 = this;
  if(this__7744.more == null) {
    return cljs.core.List.EMPTY
  }else {
    return this__7744.more
  }
};
cljs.core.ChunkedCons;
cljs.core.chunk_cons = function chunk_cons(chunk, rest) {
  if(cljs.core._count.call(null, chunk) === 0) {
    return rest
  }else {
    return new cljs.core.ChunkedCons(chunk, rest, null)
  }
};
cljs.core.chunk_append = function chunk_append(b, x) {
  return b.add(x)
};
cljs.core.chunk = function chunk(b) {
  return b.chunk()
};
cljs.core.chunk_first = function chunk_first(s) {
  return cljs.core._chunked_first.call(null, s)
};
cljs.core.chunk_rest = function chunk_rest(s) {
  return cljs.core._chunked_rest.call(null, s)
};
cljs.core.chunk_next = function chunk_next(s) {
  if(function() {
    var G__7748__7749 = s;
    if(G__7748__7749) {
      if(cljs.core.truth_(function() {
        var or__3824__auto____7750 = null;
        if(cljs.core.truth_(or__3824__auto____7750)) {
          return or__3824__auto____7750
        }else {
          return G__7748__7749.cljs$core$IChunkedNext$
        }
      }())) {
        return true
      }else {
        if(!G__7748__7749.cljs$lang$protocol_mask$partition$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedNext, G__7748__7749)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IChunkedNext, G__7748__7749)
    }
  }()) {
    return cljs.core._chunked_next.call(null, s)
  }else {
    return cljs.core.seq.call(null, cljs.core._chunked_rest.call(null, s))
  }
};
cljs.core.to_array = function to_array(s) {
  var ary__7753 = [];
  var s__7754 = s;
  while(true) {
    if(cljs.core.seq.call(null, s__7754)) {
      ary__7753.push(cljs.core.first.call(null, s__7754));
      var G__7755 = cljs.core.next.call(null, s__7754);
      s__7754 = G__7755;
      continue
    }else {
      return ary__7753
    }
    break
  }
};
cljs.core.to_array_2d = function to_array_2d(coll) {
  var ret__7759 = cljs.core.make_array.call(null, cljs.core.count.call(null, coll));
  var i__7760 = 0;
  var xs__7761 = cljs.core.seq.call(null, coll);
  while(true) {
    if(xs__7761) {
      ret__7759[i__7760] = cljs.core.to_array.call(null, cljs.core.first.call(null, xs__7761));
      var G__7762 = i__7760 + 1;
      var G__7763 = cljs.core.next.call(null, xs__7761);
      i__7760 = G__7762;
      xs__7761 = G__7763;
      continue
    }else {
    }
    break
  }
  return ret__7759
};
cljs.core.long_array = function() {
  var long_array = null;
  var long_array__1 = function(size_or_seq) {
    if(cljs.core.number_QMARK_.call(null, size_or_seq)) {
      return long_array.call(null, size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_.call(null, size_or_seq)) {
        return cljs.core.into_array.call(null, size_or_seq)
      }else {
        if("\ufdd0'else") {
          throw new Error("long-array called with something other than size or ISeq");
        }else {
          return null
        }
      }
    }
  };
  var long_array__2 = function(size, init_val_or_seq) {
    var a__7771 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__7772 = cljs.core.seq.call(null, init_val_or_seq);
      var i__7773 = 0;
      var s__7774 = s__7772;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____7775 = s__7774;
          if(and__3822__auto____7775) {
            return i__7773 < size
          }else {
            return and__3822__auto____7775
          }
        }())) {
          a__7771[i__7773] = cljs.core.first.call(null, s__7774);
          var G__7778 = i__7773 + 1;
          var G__7779 = cljs.core.next.call(null, s__7774);
          i__7773 = G__7778;
          s__7774 = G__7779;
          continue
        }else {
          return a__7771
        }
        break
      }
    }else {
      var n__2527__auto____7776 = size;
      var i__7777 = 0;
      while(true) {
        if(i__7777 < n__2527__auto____7776) {
          a__7771[i__7777] = init_val_or_seq;
          var G__7780 = i__7777 + 1;
          i__7777 = G__7780;
          continue
        }else {
        }
        break
      }
      return a__7771
    }
  };
  long_array = function(size, init_val_or_seq) {
    switch(arguments.length) {
      case 1:
        return long_array__1.call(this, size);
      case 2:
        return long_array__2.call(this, size, init_val_or_seq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  long_array.cljs$lang$arity$1 = long_array__1;
  long_array.cljs$lang$arity$2 = long_array__2;
  return long_array
}();
cljs.core.double_array = function() {
  var double_array = null;
  var double_array__1 = function(size_or_seq) {
    if(cljs.core.number_QMARK_.call(null, size_or_seq)) {
      return double_array.call(null, size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_.call(null, size_or_seq)) {
        return cljs.core.into_array.call(null, size_or_seq)
      }else {
        if("\ufdd0'else") {
          throw new Error("double-array called with something other than size or ISeq");
        }else {
          return null
        }
      }
    }
  };
  var double_array__2 = function(size, init_val_or_seq) {
    var a__7788 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__7789 = cljs.core.seq.call(null, init_val_or_seq);
      var i__7790 = 0;
      var s__7791 = s__7789;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____7792 = s__7791;
          if(and__3822__auto____7792) {
            return i__7790 < size
          }else {
            return and__3822__auto____7792
          }
        }())) {
          a__7788[i__7790] = cljs.core.first.call(null, s__7791);
          var G__7795 = i__7790 + 1;
          var G__7796 = cljs.core.next.call(null, s__7791);
          i__7790 = G__7795;
          s__7791 = G__7796;
          continue
        }else {
          return a__7788
        }
        break
      }
    }else {
      var n__2527__auto____7793 = size;
      var i__7794 = 0;
      while(true) {
        if(i__7794 < n__2527__auto____7793) {
          a__7788[i__7794] = init_val_or_seq;
          var G__7797 = i__7794 + 1;
          i__7794 = G__7797;
          continue
        }else {
        }
        break
      }
      return a__7788
    }
  };
  double_array = function(size, init_val_or_seq) {
    switch(arguments.length) {
      case 1:
        return double_array__1.call(this, size);
      case 2:
        return double_array__2.call(this, size, init_val_or_seq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  double_array.cljs$lang$arity$1 = double_array__1;
  double_array.cljs$lang$arity$2 = double_array__2;
  return double_array
}();
cljs.core.object_array = function() {
  var object_array = null;
  var object_array__1 = function(size_or_seq) {
    if(cljs.core.number_QMARK_.call(null, size_or_seq)) {
      return object_array.call(null, size_or_seq, null)
    }else {
      if(cljs.core.seq_QMARK_.call(null, size_or_seq)) {
        return cljs.core.into_array.call(null, size_or_seq)
      }else {
        if("\ufdd0'else") {
          throw new Error("object-array called with something other than size or ISeq");
        }else {
          return null
        }
      }
    }
  };
  var object_array__2 = function(size, init_val_or_seq) {
    var a__7805 = cljs.core.make_array.call(null, size);
    if(cljs.core.seq_QMARK_.call(null, init_val_or_seq)) {
      var s__7806 = cljs.core.seq.call(null, init_val_or_seq);
      var i__7807 = 0;
      var s__7808 = s__7806;
      while(true) {
        if(cljs.core.truth_(function() {
          var and__3822__auto____7809 = s__7808;
          if(and__3822__auto____7809) {
            return i__7807 < size
          }else {
            return and__3822__auto____7809
          }
        }())) {
          a__7805[i__7807] = cljs.core.first.call(null, s__7808);
          var G__7812 = i__7807 + 1;
          var G__7813 = cljs.core.next.call(null, s__7808);
          i__7807 = G__7812;
          s__7808 = G__7813;
          continue
        }else {
          return a__7805
        }
        break
      }
    }else {
      var n__2527__auto____7810 = size;
      var i__7811 = 0;
      while(true) {
        if(i__7811 < n__2527__auto____7810) {
          a__7805[i__7811] = init_val_or_seq;
          var G__7814 = i__7811 + 1;
          i__7811 = G__7814;
          continue
        }else {
        }
        break
      }
      return a__7805
    }
  };
  object_array = function(size, init_val_or_seq) {
    switch(arguments.length) {
      case 1:
        return object_array__1.call(this, size);
      case 2:
        return object_array__2.call(this, size, init_val_or_seq)
    }
    throw"Invalid arity: " + arguments.length;
  };
  object_array.cljs$lang$arity$1 = object_array__1;
  object_array.cljs$lang$arity$2 = object_array__2;
  return object_array
}();
cljs.core.bounded_count = function bounded_count(s, n) {
  if(cljs.core.counted_QMARK_.call(null, s)) {
    return cljs.core.count.call(null, s)
  }else {
    var s__7819 = s;
    var i__7820 = n;
    var sum__7821 = 0;
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3822__auto____7822 = i__7820 > 0;
        if(and__3822__auto____7822) {
          return cljs.core.seq.call(null, s__7819)
        }else {
          return and__3822__auto____7822
        }
      }())) {
        var G__7823 = cljs.core.next.call(null, s__7819);
        var G__7824 = i__7820 - 1;
        var G__7825 = sum__7821 + 1;
        s__7819 = G__7823;
        i__7820 = G__7824;
        sum__7821 = G__7825;
        continue
      }else {
        return sum__7821
      }
      break
    }
  }
};
cljs.core.spread = function spread(arglist) {
  if(arglist == null) {
    return null
  }else {
    if(cljs.core.next.call(null, arglist) == null) {
      return cljs.core.seq.call(null, cljs.core.first.call(null, arglist))
    }else {
      if("\ufdd0'else") {
        return cljs.core.cons.call(null, cljs.core.first.call(null, arglist), spread.call(null, cljs.core.next.call(null, arglist)))
      }else {
        return null
      }
    }
  }
};
cljs.core.concat = function() {
  var concat = null;
  var concat__0 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    }, null)
  };
  var concat__1 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    }, null)
  };
  var concat__2 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__7830 = cljs.core.seq.call(null, x);
      if(s__7830) {
        if(cljs.core.chunked_seq_QMARK_.call(null, s__7830)) {
          return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, s__7830), concat.call(null, cljs.core.chunk_rest.call(null, s__7830), y))
        }else {
          return cljs.core.cons.call(null, cljs.core.first.call(null, s__7830), concat.call(null, cljs.core.rest.call(null, s__7830), y))
        }
      }else {
        return y
      }
    }, null)
  };
  var concat__3 = function() {
    var G__7834__delegate = function(x, y, zs) {
      var cat__7833 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__7832 = cljs.core.seq.call(null, xys);
          if(xys__7832) {
            if(cljs.core.chunked_seq_QMARK_.call(null, xys__7832)) {
              return cljs.core.chunk_cons.call(null, cljs.core.chunk_first.call(null, xys__7832), cat.call(null, cljs.core.chunk_rest.call(null, xys__7832), zs))
            }else {
              return cljs.core.cons.call(null, cljs.core.first.call(null, xys__7832), cat.call(null, cljs.core.rest.call(null, xys__7832), zs))
            }
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        }, null)
      };
      return cat__7833.call(null, concat.call(null, x, y), zs)
    };
    var G__7834 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7834__delegate.call(this, x, y, zs)
    };
    G__7834.cljs$lang$maxFixedArity = 2;
    G__7834.cljs$lang$applyTo = function(arglist__7835) {
      var x = cljs.core.first(arglist__7835);
      var y = cljs.core.first(cljs.core.next(arglist__7835));
      var zs = cljs.core.rest(cljs.core.next(arglist__7835));
      return G__7834__delegate(x, y, zs)
    };
    G__7834.cljs$lang$arity$variadic = G__7834__delegate;
    return G__7834
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__0.call(this);
      case 1:
        return concat__1.call(this, x);
      case 2:
        return concat__2.call(this, x, y);
      default:
        return concat__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__3.cljs$lang$applyTo;
  concat.cljs$lang$arity$0 = concat__0;
  concat.cljs$lang$arity$1 = concat__1;
  concat.cljs$lang$arity$2 = concat__2;
  concat.cljs$lang$arity$variadic = concat__3.cljs$lang$arity$variadic;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___1 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___2 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___3 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___4 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___5 = function() {
    var G__7836__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__7836 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__7836__delegate.call(this, a, b, c, d, more)
    };
    G__7836.cljs$lang$maxFixedArity = 4;
    G__7836.cljs$lang$applyTo = function(arglist__7837) {
      var a = cljs.core.first(arglist__7837);
      var b = cljs.core.first(cljs.core.next(arglist__7837));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7837)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7837))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7837))));
      return G__7836__delegate(a, b, c, d, more)
    };
    G__7836.cljs$lang$arity$variadic = G__7836__delegate;
    return G__7836
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___1.call(this, a);
      case 2:
        return list_STAR___2.call(this, a, b);
      case 3:
        return list_STAR___3.call(this, a, b, c);
      case 4:
        return list_STAR___4.call(this, a, b, c, d);
      default:
        return list_STAR___5.cljs$lang$arity$variadic(a, b, c, d, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___5.cljs$lang$applyTo;
  list_STAR_.cljs$lang$arity$1 = list_STAR___1;
  list_STAR_.cljs$lang$arity$2 = list_STAR___2;
  list_STAR_.cljs$lang$arity$3 = list_STAR___3;
  list_STAR_.cljs$lang$arity$4 = list_STAR___4;
  list_STAR_.cljs$lang$arity$variadic = list_STAR___5.cljs$lang$arity$variadic;
  return list_STAR_
}();
cljs.core.transient$ = function transient$(coll) {
  return cljs.core._as_transient.call(null, coll)
};
cljs.core.persistent_BANG_ = function persistent_BANG_(tcoll) {
  return cljs.core._persistent_BANG_.call(null, tcoll)
};
cljs.core.conj_BANG_ = function conj_BANG_(tcoll, val) {
  return cljs.core._conj_BANG_.call(null, tcoll, val)
};
cljs.core.assoc_BANG_ = function assoc_BANG_(tcoll, key, val) {
  return cljs.core._assoc_BANG_.call(null, tcoll, key, val)
};
cljs.core.dissoc_BANG_ = function dissoc_BANG_(tcoll, key) {
  return cljs.core._dissoc_BANG_.call(null, tcoll, key)
};
cljs.core.pop_BANG_ = function pop_BANG_(tcoll) {
  return cljs.core._pop_BANG_.call(null, tcoll)
};
cljs.core.disj_BANG_ = function disj_BANG_(tcoll, val) {
  return cljs.core._disjoin_BANG_.call(null, tcoll, val)
};
cljs.core.apply_to = function apply_to(f, argc, args) {
  var args__7879 = cljs.core.seq.call(null, args);
  if(argc === 0) {
    return f.call(null)
  }else {
    var a__7880 = cljs.core._first.call(null, args__7879);
    var args__7881 = cljs.core._rest.call(null, args__7879);
    if(argc === 1) {
      if(f.cljs$lang$arity$1) {
        return f.cljs$lang$arity$1(a__7880)
      }else {
        return f.call(null, a__7880)
      }
    }else {
      var b__7882 = cljs.core._first.call(null, args__7881);
      var args__7883 = cljs.core._rest.call(null, args__7881);
      if(argc === 2) {
        if(f.cljs$lang$arity$2) {
          return f.cljs$lang$arity$2(a__7880, b__7882)
        }else {
          return f.call(null, a__7880, b__7882)
        }
      }else {
        var c__7884 = cljs.core._first.call(null, args__7883);
        var args__7885 = cljs.core._rest.call(null, args__7883);
        if(argc === 3) {
          if(f.cljs$lang$arity$3) {
            return f.cljs$lang$arity$3(a__7880, b__7882, c__7884)
          }else {
            return f.call(null, a__7880, b__7882, c__7884)
          }
        }else {
          var d__7886 = cljs.core._first.call(null, args__7885);
          var args__7887 = cljs.core._rest.call(null, args__7885);
          if(argc === 4) {
            if(f.cljs$lang$arity$4) {
              return f.cljs$lang$arity$4(a__7880, b__7882, c__7884, d__7886)
            }else {
              return f.call(null, a__7880, b__7882, c__7884, d__7886)
            }
          }else {
            var e__7888 = cljs.core._first.call(null, args__7887);
            var args__7889 = cljs.core._rest.call(null, args__7887);
            if(argc === 5) {
              if(f.cljs$lang$arity$5) {
                return f.cljs$lang$arity$5(a__7880, b__7882, c__7884, d__7886, e__7888)
              }else {
                return f.call(null, a__7880, b__7882, c__7884, d__7886, e__7888)
              }
            }else {
              var f__7890 = cljs.core._first.call(null, args__7889);
              var args__7891 = cljs.core._rest.call(null, args__7889);
              if(argc === 6) {
                if(f__7890.cljs$lang$arity$6) {
                  return f__7890.cljs$lang$arity$6(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890)
                }else {
                  return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890)
                }
              }else {
                var g__7892 = cljs.core._first.call(null, args__7891);
                var args__7893 = cljs.core._rest.call(null, args__7891);
                if(argc === 7) {
                  if(f__7890.cljs$lang$arity$7) {
                    return f__7890.cljs$lang$arity$7(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892)
                  }else {
                    return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892)
                  }
                }else {
                  var h__7894 = cljs.core._first.call(null, args__7893);
                  var args__7895 = cljs.core._rest.call(null, args__7893);
                  if(argc === 8) {
                    if(f__7890.cljs$lang$arity$8) {
                      return f__7890.cljs$lang$arity$8(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894)
                    }else {
                      return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894)
                    }
                  }else {
                    var i__7896 = cljs.core._first.call(null, args__7895);
                    var args__7897 = cljs.core._rest.call(null, args__7895);
                    if(argc === 9) {
                      if(f__7890.cljs$lang$arity$9) {
                        return f__7890.cljs$lang$arity$9(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896)
                      }else {
                        return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896)
                      }
                    }else {
                      var j__7898 = cljs.core._first.call(null, args__7897);
                      var args__7899 = cljs.core._rest.call(null, args__7897);
                      if(argc === 10) {
                        if(f__7890.cljs$lang$arity$10) {
                          return f__7890.cljs$lang$arity$10(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898)
                        }else {
                          return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898)
                        }
                      }else {
                        var k__7900 = cljs.core._first.call(null, args__7899);
                        var args__7901 = cljs.core._rest.call(null, args__7899);
                        if(argc === 11) {
                          if(f__7890.cljs$lang$arity$11) {
                            return f__7890.cljs$lang$arity$11(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900)
                          }else {
                            return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900)
                          }
                        }else {
                          var l__7902 = cljs.core._first.call(null, args__7901);
                          var args__7903 = cljs.core._rest.call(null, args__7901);
                          if(argc === 12) {
                            if(f__7890.cljs$lang$arity$12) {
                              return f__7890.cljs$lang$arity$12(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902)
                            }else {
                              return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902)
                            }
                          }else {
                            var m__7904 = cljs.core._first.call(null, args__7903);
                            var args__7905 = cljs.core._rest.call(null, args__7903);
                            if(argc === 13) {
                              if(f__7890.cljs$lang$arity$13) {
                                return f__7890.cljs$lang$arity$13(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904)
                              }else {
                                return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904)
                              }
                            }else {
                              var n__7906 = cljs.core._first.call(null, args__7905);
                              var args__7907 = cljs.core._rest.call(null, args__7905);
                              if(argc === 14) {
                                if(f__7890.cljs$lang$arity$14) {
                                  return f__7890.cljs$lang$arity$14(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906)
                                }else {
                                  return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906)
                                }
                              }else {
                                var o__7908 = cljs.core._first.call(null, args__7907);
                                var args__7909 = cljs.core._rest.call(null, args__7907);
                                if(argc === 15) {
                                  if(f__7890.cljs$lang$arity$15) {
                                    return f__7890.cljs$lang$arity$15(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908)
                                  }else {
                                    return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908)
                                  }
                                }else {
                                  var p__7910 = cljs.core._first.call(null, args__7909);
                                  var args__7911 = cljs.core._rest.call(null, args__7909);
                                  if(argc === 16) {
                                    if(f__7890.cljs$lang$arity$16) {
                                      return f__7890.cljs$lang$arity$16(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910)
                                    }else {
                                      return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910)
                                    }
                                  }else {
                                    var q__7912 = cljs.core._first.call(null, args__7911);
                                    var args__7913 = cljs.core._rest.call(null, args__7911);
                                    if(argc === 17) {
                                      if(f__7890.cljs$lang$arity$17) {
                                        return f__7890.cljs$lang$arity$17(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912)
                                      }else {
                                        return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912)
                                      }
                                    }else {
                                      var r__7914 = cljs.core._first.call(null, args__7913);
                                      var args__7915 = cljs.core._rest.call(null, args__7913);
                                      if(argc === 18) {
                                        if(f__7890.cljs$lang$arity$18) {
                                          return f__7890.cljs$lang$arity$18(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912, r__7914)
                                        }else {
                                          return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912, r__7914)
                                        }
                                      }else {
                                        var s__7916 = cljs.core._first.call(null, args__7915);
                                        var args__7917 = cljs.core._rest.call(null, args__7915);
                                        if(argc === 19) {
                                          if(f__7890.cljs$lang$arity$19) {
                                            return f__7890.cljs$lang$arity$19(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912, r__7914, s__7916)
                                          }else {
                                            return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912, r__7914, s__7916)
                                          }
                                        }else {
                                          var t__7918 = cljs.core._first.call(null, args__7917);
                                          var args__7919 = cljs.core._rest.call(null, args__7917);
                                          if(argc === 20) {
                                            if(f__7890.cljs$lang$arity$20) {
                                              return f__7890.cljs$lang$arity$20(a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912, r__7914, s__7916, t__7918)
                                            }else {
                                              return f__7890.call(null, a__7880, b__7882, c__7884, d__7886, e__7888, f__7890, g__7892, h__7894, i__7896, j__7898, k__7900, l__7902, m__7904, n__7906, o__7908, p__7910, q__7912, r__7914, s__7916, t__7918)
                                            }
                                          }else {
                                            throw new Error("Only up to 20 arguments supported on functions");
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
cljs.core.apply = function() {
  var apply = null;
  var apply__2 = function(f, args) {
    var fixed_arity__7934 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7935 = cljs.core.bounded_count.call(null, args, fixed_arity__7934 + 1);
      if(bc__7935 <= fixed_arity__7934) {
        return cljs.core.apply_to.call(null, f, bc__7935, args)
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__3 = function(f, x, args) {
    var arglist__7936 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__7937 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7938 = cljs.core.bounded_count.call(null, arglist__7936, fixed_arity__7937 + 1);
      if(bc__7938 <= fixed_arity__7937) {
        return cljs.core.apply_to.call(null, f, bc__7938, arglist__7936)
      }else {
        return f.cljs$lang$applyTo(arglist__7936)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__7936))
    }
  };
  var apply__4 = function(f, x, y, args) {
    var arglist__7939 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__7940 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7941 = cljs.core.bounded_count.call(null, arglist__7939, fixed_arity__7940 + 1);
      if(bc__7941 <= fixed_arity__7940) {
        return cljs.core.apply_to.call(null, f, bc__7941, arglist__7939)
      }else {
        return f.cljs$lang$applyTo(arglist__7939)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__7939))
    }
  };
  var apply__5 = function(f, x, y, z, args) {
    var arglist__7942 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__7943 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      var bc__7944 = cljs.core.bounded_count.call(null, arglist__7942, fixed_arity__7943 + 1);
      if(bc__7944 <= fixed_arity__7943) {
        return cljs.core.apply_to.call(null, f, bc__7944, arglist__7942)
      }else {
        return f.cljs$lang$applyTo(arglist__7942)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__7942))
    }
  };
  var apply__6 = function() {
    var G__7948__delegate = function(f, a, b, c, d, args) {
      var arglist__7945 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__7946 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        var bc__7947 = cljs.core.bounded_count.call(null, arglist__7945, fixed_arity__7946 + 1);
        if(bc__7947 <= fixed_arity__7946) {
          return cljs.core.apply_to.call(null, f, bc__7947, arglist__7945)
        }else {
          return f.cljs$lang$applyTo(arglist__7945)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__7945))
      }
    };
    var G__7948 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__7948__delegate.call(this, f, a, b, c, d, args)
    };
    G__7948.cljs$lang$maxFixedArity = 5;
    G__7948.cljs$lang$applyTo = function(arglist__7949) {
      var f = cljs.core.first(arglist__7949);
      var a = cljs.core.first(cljs.core.next(arglist__7949));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7949)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7949))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7949)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7949)))));
      return G__7948__delegate(f, a, b, c, d, args)
    };
    G__7948.cljs$lang$arity$variadic = G__7948__delegate;
    return G__7948
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__2.call(this, f, a);
      case 3:
        return apply__3.call(this, f, a, b);
      case 4:
        return apply__4.call(this, f, a, b, c);
      case 5:
        return apply__5.call(this, f, a, b, c, d);
      default:
        return apply__6.cljs$lang$arity$variadic(f, a, b, c, d, cljs.core.array_seq(arguments, 5))
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__6.cljs$lang$applyTo;
  apply.cljs$lang$arity$2 = apply__2;
  apply.cljs$lang$arity$3 = apply__3;
  apply.cljs$lang$arity$4 = apply__4;
  apply.cljs$lang$arity$5 = apply__5;
  apply.cljs$lang$arity$variadic = apply__6.cljs$lang$arity$variadic;
  return apply
}();
cljs.core.vary_meta = function() {
  var vary_meta__delegate = function(obj, f, args) {
    return cljs.core.with_meta.call(null, obj, cljs.core.apply.call(null, f, cljs.core.meta.call(null, obj), args))
  };
  var vary_meta = function(obj, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return vary_meta__delegate.call(this, obj, f, args)
  };
  vary_meta.cljs$lang$maxFixedArity = 2;
  vary_meta.cljs$lang$applyTo = function(arglist__7950) {
    var obj = cljs.core.first(arglist__7950);
    var f = cljs.core.first(cljs.core.next(arglist__7950));
    var args = cljs.core.rest(cljs.core.next(arglist__7950));
    return vary_meta__delegate(obj, f, args)
  };
  vary_meta.cljs$lang$arity$variadic = vary_meta__delegate;
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___1 = function(x) {
    return false
  };
  var not_EQ___2 = function(x, y) {
    return!cljs.core._EQ_.call(null, x, y)
  };
  var not_EQ___3 = function() {
    var G__7951__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__7951 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__7951__delegate.call(this, x, y, more)
    };
    G__7951.cljs$lang$maxFixedArity = 2;
    G__7951.cljs$lang$applyTo = function(arglist__7952) {
      var x = cljs.core.first(arglist__7952);
      var y = cljs.core.first(cljs.core.next(arglist__7952));
      var more = cljs.core.rest(cljs.core.next(arglist__7952));
      return G__7951__delegate(x, y, more)
    };
    G__7951.cljs$lang$arity$variadic = G__7951__delegate;
    return G__7951
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___1.call(this, x);
      case 2:
        return not_EQ___2.call(this, x, y);
      default:
        return not_EQ___3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___3.cljs$lang$applyTo;
  not_EQ_.cljs$lang$arity$1 = not_EQ___1;
  not_EQ_.cljs$lang$arity$2 = not_EQ___2;
  not_EQ_.cljs$lang$arity$variadic = not_EQ___3.cljs$lang$arity$variadic;
  return not_EQ_
}();
cljs.core.not_empty = function not_empty(coll) {
  if(cljs.core.seq.call(null, coll)) {
    return coll
  }else {
    return null
  }
};
cljs.core.every_QMARK_ = function every_QMARK_(pred, coll) {
  while(true) {
    if(cljs.core.seq.call(null, coll) == null) {
      return true
    }else {
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, coll)))) {
        var G__7953 = pred;
        var G__7954 = cljs.core.next.call(null, coll);
        pred = G__7953;
        coll = G__7954;
        continue
      }else {
        if("\ufdd0'else") {
          return false
        }else {
          return null
        }
      }
    }
    break
  }
};
cljs.core.not_every_QMARK_ = function not_every_QMARK_(pred, coll) {
  return!cljs.core.every_QMARK_.call(null, pred, coll)
};
cljs.core.some = function some(pred, coll) {
  while(true) {
    if(cljs.core.seq.call(null, coll)) {
      var or__3824__auto____7956 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3824__auto____7956)) {
        return or__3824__auto____7956
      }else {
        var G__7957 = pred;
        var G__7958 = cljs.core.next.call(null, coll);
        pred = G__7957;
        coll = G__7958;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.not_any_QMARK_ = function not_any_QMARK_(pred, coll) {
  return cljs.core.not.call(null, cljs.core.some.call(null, pred, coll))
};
cljs.core.even_QMARK_ = function even_QMARK_(n) {
  if(cljs.core.integer_QMARK_.call(null, n)) {
    return(n & 1) === 0
  }else {
    throw new Error([cljs.core.str("Argument must be an integer: "), cljs.core.str(n)].join(""));
  }
};
cljs.core.odd_QMARK_ = function odd_QMARK_(n) {
  return!cljs.core.even_QMARK_.call(null, n)
};
cljs.core.identity = function identity(x) {
  return x
};
cljs.core.complement = function complement(f) {
  return function() {
    var G__7959 = null;
    var G__7959__0 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__7959__1 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__7959__2 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__7959__3 = function() {
      var G__7960__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__7960 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__7960__delegate.call(this, x, y, zs)
      };
      G__7960.cljs$lang$maxFixedArity = 2;
      G__7960.cljs$lang$applyTo = function(arglist__7961) {
        var x = cljs.core.first(arglist__7961);
        var y = cljs.core.first(cljs.core.next(arglist__7961));
        var zs = cljs.core.rest(cljs.core.next(arglist__7961));
        return G__7960__delegate(x, y, zs)
      };
      G__7960.cljs$lang$arity$variadic = G__7960__delegate;
      return G__7960
    }();
    G__7959 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__7959__0.call(this);
        case 1:
          return G__7959__1.call(this, x);
        case 2:
          return G__7959__2.call(this, x, y);
        default:
          return G__7959__3.cljs$lang$arity$variadic(x, y, cljs.core.array_seq(arguments, 2))
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__7959.cljs$lang$maxFixedArity = 2;
    G__7959.cljs$lang$applyTo = G__7959__3.cljs$lang$applyTo;
    return G__7959
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__7962__delegate = function(args) {
      return x
    };
    var G__7962 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__7962__delegate.call(this, args)
    };
    G__7962.cljs$lang$maxFixedArity = 0;
    G__7962.cljs$lang$applyTo = function(arglist__7963) {
      var args = cljs.core.seq(arglist__7963);
      return G__7962__delegate(args)
    };
    G__7962.cljs$lang$arity$variadic = G__7962__delegate;
    return G__7962
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__0 = function() {
    return cljs.core.identity
  };
  var comp__1 = function(f) {
    return f
  };
  var comp__2 = function(f, g) {
    return function() {
      var G__7970 = null;
      var G__7970__0 = function() {
        return f.call(null, g.call(null))
      };
      var G__7970__1 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__7970__2 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__7970__3 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__7970__4 = function() {
        var G__7971__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__7971 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7971__delegate.call(this, x, y, z, args)
        };
        G__7971.cljs$lang$maxFixedArity = 3;
        G__7971.cljs$lang$applyTo = function(arglist__7972) {
          var x = cljs.core.first(arglist__7972);
          var y = cljs.core.first(cljs.core.next(arglist__7972));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7972)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7972)));
          return G__7971__delegate(x, y, z, args)
        };
        G__7971.cljs$lang$arity$variadic = G__7971__delegate;
        return G__7971
      }();
      G__7970 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__7970__0.call(this);
          case 1:
            return G__7970__1.call(this, x);
          case 2:
            return G__7970__2.call(this, x, y);
          case 3:
            return G__7970__3.call(this, x, y, z);
          default:
            return G__7970__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7970.cljs$lang$maxFixedArity = 3;
      G__7970.cljs$lang$applyTo = G__7970__4.cljs$lang$applyTo;
      return G__7970
    }()
  };
  var comp__3 = function(f, g, h) {
    return function() {
      var G__7973 = null;
      var G__7973__0 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__7973__1 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__7973__2 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__7973__3 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__7973__4 = function() {
        var G__7974__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__7974 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7974__delegate.call(this, x, y, z, args)
        };
        G__7974.cljs$lang$maxFixedArity = 3;
        G__7974.cljs$lang$applyTo = function(arglist__7975) {
          var x = cljs.core.first(arglist__7975);
          var y = cljs.core.first(cljs.core.next(arglist__7975));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7975)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7975)));
          return G__7974__delegate(x, y, z, args)
        };
        G__7974.cljs$lang$arity$variadic = G__7974__delegate;
        return G__7974
      }();
      G__7973 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__7973__0.call(this);
          case 1:
            return G__7973__1.call(this, x);
          case 2:
            return G__7973__2.call(this, x, y);
          case 3:
            return G__7973__3.call(this, x, y, z);
          default:
            return G__7973__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7973.cljs$lang$maxFixedArity = 3;
      G__7973.cljs$lang$applyTo = G__7973__4.cljs$lang$applyTo;
      return G__7973
    }()
  };
  var comp__4 = function() {
    var G__7976__delegate = function(f1, f2, f3, fs) {
      var fs__7967 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__7977__delegate = function(args) {
          var ret__7968 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__7967), args);
          var fs__7969 = cljs.core.next.call(null, fs__7967);
          while(true) {
            if(fs__7969) {
              var G__7978 = cljs.core.first.call(null, fs__7969).call(null, ret__7968);
              var G__7979 = cljs.core.next.call(null, fs__7969);
              ret__7968 = G__7978;
              fs__7969 = G__7979;
              continue
            }else {
              return ret__7968
            }
            break
          }
        };
        var G__7977 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__7977__delegate.call(this, args)
        };
        G__7977.cljs$lang$maxFixedArity = 0;
        G__7977.cljs$lang$applyTo = function(arglist__7980) {
          var args = cljs.core.seq(arglist__7980);
          return G__7977__delegate(args)
        };
        G__7977.cljs$lang$arity$variadic = G__7977__delegate;
        return G__7977
      }()
    };
    var G__7976 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__7976__delegate.call(this, f1, f2, f3, fs)
    };
    G__7976.cljs$lang$maxFixedArity = 3;
    G__7976.cljs$lang$applyTo = function(arglist__7981) {
      var f1 = cljs.core.first(arglist__7981);
      var f2 = cljs.core.first(cljs.core.next(arglist__7981));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7981)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7981)));
      return G__7976__delegate(f1, f2, f3, fs)
    };
    G__7976.cljs$lang$arity$variadic = G__7976__delegate;
    return G__7976
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__0.call(this);
      case 1:
        return comp__1.call(this, f1);
      case 2:
        return comp__2.call(this, f1, f2);
      case 3:
        return comp__3.call(this, f1, f2, f3);
      default:
        return comp__4.cljs$lang$arity$variadic(f1, f2, f3, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__4.cljs$lang$applyTo;
  comp.cljs$lang$arity$0 = comp__0;
  comp.cljs$lang$arity$1 = comp__1;
  comp.cljs$lang$arity$2 = comp__2;
  comp.cljs$lang$arity$3 = comp__3;
  comp.cljs$lang$arity$variadic = comp__4.cljs$lang$arity$variadic;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__2 = function(f, arg1) {
    return function() {
      var G__7982__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__7982 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__7982__delegate.call(this, args)
      };
      G__7982.cljs$lang$maxFixedArity = 0;
      G__7982.cljs$lang$applyTo = function(arglist__7983) {
        var args = cljs.core.seq(arglist__7983);
        return G__7982__delegate(args)
      };
      G__7982.cljs$lang$arity$variadic = G__7982__delegate;
      return G__7982
    }()
  };
  var partial__3 = function(f, arg1, arg2) {
    return function() {
      var G__7984__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__7984 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__7984__delegate.call(this, args)
      };
      G__7984.cljs$lang$maxFixedArity = 0;
      G__7984.cljs$lang$applyTo = function(arglist__7985) {
        var args = cljs.core.seq(arglist__7985);
        return G__7984__delegate(args)
      };
      G__7984.cljs$lang$arity$variadic = G__7984__delegate;
      return G__7984
    }()
  };
  var partial__4 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__7986__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__7986 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__7986__delegate.call(this, args)
      };
      G__7986.cljs$lang$maxFixedArity = 0;
      G__7986.cljs$lang$applyTo = function(arglist__7987) {
        var args = cljs.core.seq(arglist__7987);
        return G__7986__delegate(args)
      };
      G__7986.cljs$lang$arity$variadic = G__7986__delegate;
      return G__7986
    }()
  };
  var partial__5 = function() {
    var G__7988__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__7989__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__7989 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__7989__delegate.call(this, args)
        };
        G__7989.cljs$lang$maxFixedArity = 0;
        G__7989.cljs$lang$applyTo = function(arglist__7990) {
          var args = cljs.core.seq(arglist__7990);
          return G__7989__delegate(args)
        };
        G__7989.cljs$lang$arity$variadic = G__7989__delegate;
        return G__7989
      }()
    };
    var G__7988 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__7988__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__7988.cljs$lang$maxFixedArity = 4;
    G__7988.cljs$lang$applyTo = function(arglist__7991) {
      var f = cljs.core.first(arglist__7991);
      var arg1 = cljs.core.first(cljs.core.next(arglist__7991));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7991)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7991))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__7991))));
      return G__7988__delegate(f, arg1, arg2, arg3, more)
    };
    G__7988.cljs$lang$arity$variadic = G__7988__delegate;
    return G__7988
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__2.call(this, f, arg1);
      case 3:
        return partial__3.call(this, f, arg1, arg2);
      case 4:
        return partial__4.call(this, f, arg1, arg2, arg3);
      default:
        return partial__5.cljs$lang$arity$variadic(f, arg1, arg2, arg3, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__5.cljs$lang$applyTo;
  partial.cljs$lang$arity$2 = partial__2;
  partial.cljs$lang$arity$3 = partial__3;
  partial.cljs$lang$arity$4 = partial__4;
  partial.cljs$lang$arity$variadic = partial__5.cljs$lang$arity$variadic;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__2 = function(f, x) {
    return function() {
      var G__7992 = null;
      var G__7992__1 = function(a) {
        return f.call(null, a == null ? x : a)
      };
      var G__7992__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b)
      };
      var G__7992__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b, c)
      };
      var G__7992__4 = function() {
        var G__7993__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b, c, ds)
        };
        var G__7993 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7993__delegate.call(this, a, b, c, ds)
        };
        G__7993.cljs$lang$maxFixedArity = 3;
        G__7993.cljs$lang$applyTo = function(arglist__7994) {
          var a = cljs.core.first(arglist__7994);
          var b = cljs.core.first(cljs.core.next(arglist__7994));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7994)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7994)));
          return G__7993__delegate(a, b, c, ds)
        };
        G__7993.cljs$lang$arity$variadic = G__7993__delegate;
        return G__7993
      }();
      G__7992 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__7992__1.call(this, a);
          case 2:
            return G__7992__2.call(this, a, b);
          case 3:
            return G__7992__3.call(this, a, b, c);
          default:
            return G__7992__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7992.cljs$lang$maxFixedArity = 3;
      G__7992.cljs$lang$applyTo = G__7992__4.cljs$lang$applyTo;
      return G__7992
    }()
  };
  var fnil__3 = function(f, x, y) {
    return function() {
      var G__7995 = null;
      var G__7995__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__7995__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b == null ? y : b, c)
      };
      var G__7995__4 = function() {
        var G__7996__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b == null ? y : b, c, ds)
        };
        var G__7996 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7996__delegate.call(this, a, b, c, ds)
        };
        G__7996.cljs$lang$maxFixedArity = 3;
        G__7996.cljs$lang$applyTo = function(arglist__7997) {
          var a = cljs.core.first(arglist__7997);
          var b = cljs.core.first(cljs.core.next(arglist__7997));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__7997)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__7997)));
          return G__7996__delegate(a, b, c, ds)
        };
        G__7996.cljs$lang$arity$variadic = G__7996__delegate;
        return G__7996
      }();
      G__7995 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__7995__2.call(this, a, b);
          case 3:
            return G__7995__3.call(this, a, b, c);
          default:
            return G__7995__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7995.cljs$lang$maxFixedArity = 3;
      G__7995.cljs$lang$applyTo = G__7995__4.cljs$lang$applyTo;
      return G__7995
    }()
  };
  var fnil__4 = function(f, x, y, z) {
    return function() {
      var G__7998 = null;
      var G__7998__2 = function(a, b) {
        return f.call(null, a == null ? x : a, b == null ? y : b)
      };
      var G__7998__3 = function(a, b, c) {
        return f.call(null, a == null ? x : a, b == null ? y : b, c == null ? z : c)
      };
      var G__7998__4 = function() {
        var G__7999__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, a == null ? x : a, b == null ? y : b, c == null ? z : c, ds)
        };
        var G__7999 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__7999__delegate.call(this, a, b, c, ds)
        };
        G__7999.cljs$lang$maxFixedArity = 3;
        G__7999.cljs$lang$applyTo = function(arglist__8000) {
          var a = cljs.core.first(arglist__8000);
          var b = cljs.core.first(cljs.core.next(arglist__8000));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8000)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8000)));
          return G__7999__delegate(a, b, c, ds)
        };
        G__7999.cljs$lang$arity$variadic = G__7999__delegate;
        return G__7999
      }();
      G__7998 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__7998__2.call(this, a, b);
          case 3:
            return G__7998__3.call(this, a, b, c);
          default:
            return G__7998__4.cljs$lang$arity$variadic(a, b, c, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__7998.cljs$lang$maxFixedArity = 3;
      G__7998.cljs$lang$applyTo = G__7998__4.cljs$lang$applyTo;
      return G__7998
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__2.call(this, f, x);
      case 3:
        return fnil__3.call(this, f, x, y);
      case 4:
        return fnil__4.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  fnil.cljs$lang$arity$2 = fnil__2;
  fnil.cljs$lang$arity$3 = fnil__3;
  fnil.cljs$lang$arity$4 = fnil__4;
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__8016 = function mapi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____8024 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8024) {
        var s__8025 = temp__3974__auto____8024;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__8025)) {
          var c__8026 = cljs.core.chunk_first.call(null, s__8025);
          var size__8027 = cljs.core.count.call(null, c__8026);
          var b__8028 = cljs.core.chunk_buffer.call(null, size__8027);
          var n__2527__auto____8029 = size__8027;
          var i__8030 = 0;
          while(true) {
            if(i__8030 < n__2527__auto____8029) {
              cljs.core.chunk_append.call(null, b__8028, f.call(null, idx + i__8030, cljs.core._nth.call(null, c__8026, i__8030)));
              var G__8031 = i__8030 + 1;
              i__8030 = G__8031;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__8028), mapi.call(null, idx + size__8027, cljs.core.chunk_rest.call(null, s__8025)))
        }else {
          return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__8025)), mapi.call(null, idx + 1, cljs.core.rest.call(null, s__8025)))
        }
      }else {
        return null
      }
    }, null)
  };
  return mapi__8016.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____8041 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____8041) {
      var s__8042 = temp__3974__auto____8041;
      if(cljs.core.chunked_seq_QMARK_.call(null, s__8042)) {
        var c__8043 = cljs.core.chunk_first.call(null, s__8042);
        var size__8044 = cljs.core.count.call(null, c__8043);
        var b__8045 = cljs.core.chunk_buffer.call(null, size__8044);
        var n__2527__auto____8046 = size__8044;
        var i__8047 = 0;
        while(true) {
          if(i__8047 < n__2527__auto____8046) {
            var x__8048 = f.call(null, cljs.core._nth.call(null, c__8043, i__8047));
            if(x__8048 == null) {
            }else {
              cljs.core.chunk_append.call(null, b__8045, x__8048)
            }
            var G__8050 = i__8047 + 1;
            i__8047 = G__8050;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__8045), keep.call(null, f, cljs.core.chunk_rest.call(null, s__8042)))
      }else {
        var x__8049 = f.call(null, cljs.core.first.call(null, s__8042));
        if(x__8049 == null) {
          return keep.call(null, f, cljs.core.rest.call(null, s__8042))
        }else {
          return cljs.core.cons.call(null, x__8049, keep.call(null, f, cljs.core.rest.call(null, s__8042)))
        }
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__8076 = function keepi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____8086 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8086) {
        var s__8087 = temp__3974__auto____8086;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__8087)) {
          var c__8088 = cljs.core.chunk_first.call(null, s__8087);
          var size__8089 = cljs.core.count.call(null, c__8088);
          var b__8090 = cljs.core.chunk_buffer.call(null, size__8089);
          var n__2527__auto____8091 = size__8089;
          var i__8092 = 0;
          while(true) {
            if(i__8092 < n__2527__auto____8091) {
              var x__8093 = f.call(null, idx + i__8092, cljs.core._nth.call(null, c__8088, i__8092));
              if(x__8093 == null) {
              }else {
                cljs.core.chunk_append.call(null, b__8090, x__8093)
              }
              var G__8095 = i__8092 + 1;
              i__8092 = G__8095;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__8090), keepi.call(null, idx + size__8089, cljs.core.chunk_rest.call(null, s__8087)))
        }else {
          var x__8094 = f.call(null, idx, cljs.core.first.call(null, s__8087));
          if(x__8094 == null) {
            return keepi.call(null, idx + 1, cljs.core.rest.call(null, s__8087))
          }else {
            return cljs.core.cons.call(null, x__8094, keepi.call(null, idx + 1, cljs.core.rest.call(null, s__8087)))
          }
        }
      }else {
        return null
      }
    }, null)
  };
  return keepi__8076.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__1 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__0 = function() {
        return true
      };
      var ep1__1 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8181 = p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8181)) {
            return p.call(null, y)
          }else {
            return and__3822__auto____8181
          }
        }())
      };
      var ep1__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8182 = p.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8182)) {
            var and__3822__auto____8183 = p.call(null, y);
            if(cljs.core.truth_(and__3822__auto____8183)) {
              return p.call(null, z)
            }else {
              return and__3822__auto____8183
            }
          }else {
            return and__3822__auto____8182
          }
        }())
      };
      var ep1__4 = function() {
        var G__8252__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____8184 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____8184)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3822__auto____8184
            }
          }())
        };
        var G__8252 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__8252__delegate.call(this, x, y, z, args)
        };
        G__8252.cljs$lang$maxFixedArity = 3;
        G__8252.cljs$lang$applyTo = function(arglist__8253) {
          var x = cljs.core.first(arglist__8253);
          var y = cljs.core.first(cljs.core.next(arglist__8253));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8253)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8253)));
          return G__8252__delegate(x, y, z, args)
        };
        G__8252.cljs$lang$arity$variadic = G__8252__delegate;
        return G__8252
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__0.call(this);
          case 1:
            return ep1__1.call(this, x);
          case 2:
            return ep1__2.call(this, x, y);
          case 3:
            return ep1__3.call(this, x, y, z);
          default:
            return ep1__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__4.cljs$lang$applyTo;
      ep1.cljs$lang$arity$0 = ep1__0;
      ep1.cljs$lang$arity$1 = ep1__1;
      ep1.cljs$lang$arity$2 = ep1__2;
      ep1.cljs$lang$arity$3 = ep1__3;
      ep1.cljs$lang$arity$variadic = ep1__4.cljs$lang$arity$variadic;
      return ep1
    }()
  };
  var every_pred__2 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__0 = function() {
        return true
      };
      var ep2__1 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8196 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8196)) {
            return p2.call(null, x)
          }else {
            return and__3822__auto____8196
          }
        }())
      };
      var ep2__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8197 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8197)) {
            var and__3822__auto____8198 = p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____8198)) {
              var and__3822__auto____8199 = p2.call(null, x);
              if(cljs.core.truth_(and__3822__auto____8199)) {
                return p2.call(null, y)
              }else {
                return and__3822__auto____8199
              }
            }else {
              return and__3822__auto____8198
            }
          }else {
            return and__3822__auto____8197
          }
        }())
      };
      var ep2__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8200 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8200)) {
            var and__3822__auto____8201 = p1.call(null, y);
            if(cljs.core.truth_(and__3822__auto____8201)) {
              var and__3822__auto____8202 = p1.call(null, z);
              if(cljs.core.truth_(and__3822__auto____8202)) {
                var and__3822__auto____8203 = p2.call(null, x);
                if(cljs.core.truth_(and__3822__auto____8203)) {
                  var and__3822__auto____8204 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____8204)) {
                    return p2.call(null, z)
                  }else {
                    return and__3822__auto____8204
                  }
                }else {
                  return and__3822__auto____8203
                }
              }else {
                return and__3822__auto____8202
              }
            }else {
              return and__3822__auto____8201
            }
          }else {
            return and__3822__auto____8200
          }
        }())
      };
      var ep2__4 = function() {
        var G__8254__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____8205 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____8205)) {
              return cljs.core.every_QMARK_.call(null, function(p1__8051_SHARP_) {
                var and__3822__auto____8206 = p1.call(null, p1__8051_SHARP_);
                if(cljs.core.truth_(and__3822__auto____8206)) {
                  return p2.call(null, p1__8051_SHARP_)
                }else {
                  return and__3822__auto____8206
                }
              }, args)
            }else {
              return and__3822__auto____8205
            }
          }())
        };
        var G__8254 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__8254__delegate.call(this, x, y, z, args)
        };
        G__8254.cljs$lang$maxFixedArity = 3;
        G__8254.cljs$lang$applyTo = function(arglist__8255) {
          var x = cljs.core.first(arglist__8255);
          var y = cljs.core.first(cljs.core.next(arglist__8255));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8255)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8255)));
          return G__8254__delegate(x, y, z, args)
        };
        G__8254.cljs$lang$arity$variadic = G__8254__delegate;
        return G__8254
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__0.call(this);
          case 1:
            return ep2__1.call(this, x);
          case 2:
            return ep2__2.call(this, x, y);
          case 3:
            return ep2__3.call(this, x, y, z);
          default:
            return ep2__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__4.cljs$lang$applyTo;
      ep2.cljs$lang$arity$0 = ep2__0;
      ep2.cljs$lang$arity$1 = ep2__1;
      ep2.cljs$lang$arity$2 = ep2__2;
      ep2.cljs$lang$arity$3 = ep2__3;
      ep2.cljs$lang$arity$variadic = ep2__4.cljs$lang$arity$variadic;
      return ep2
    }()
  };
  var every_pred__3 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__0 = function() {
        return true
      };
      var ep3__1 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8225 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8225)) {
            var and__3822__auto____8226 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____8226)) {
              return p3.call(null, x)
            }else {
              return and__3822__auto____8226
            }
          }else {
            return and__3822__auto____8225
          }
        }())
      };
      var ep3__2 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8227 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8227)) {
            var and__3822__auto____8228 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____8228)) {
              var and__3822__auto____8229 = p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____8229)) {
                var and__3822__auto____8230 = p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____8230)) {
                  var and__3822__auto____8231 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____8231)) {
                    return p3.call(null, y)
                  }else {
                    return and__3822__auto____8231
                  }
                }else {
                  return and__3822__auto____8230
                }
              }else {
                return and__3822__auto____8229
              }
            }else {
              return and__3822__auto____8228
            }
          }else {
            return and__3822__auto____8227
          }
        }())
      };
      var ep3__3 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3822__auto____8232 = p1.call(null, x);
          if(cljs.core.truth_(and__3822__auto____8232)) {
            var and__3822__auto____8233 = p2.call(null, x);
            if(cljs.core.truth_(and__3822__auto____8233)) {
              var and__3822__auto____8234 = p3.call(null, x);
              if(cljs.core.truth_(and__3822__auto____8234)) {
                var and__3822__auto____8235 = p1.call(null, y);
                if(cljs.core.truth_(and__3822__auto____8235)) {
                  var and__3822__auto____8236 = p2.call(null, y);
                  if(cljs.core.truth_(and__3822__auto____8236)) {
                    var and__3822__auto____8237 = p3.call(null, y);
                    if(cljs.core.truth_(and__3822__auto____8237)) {
                      var and__3822__auto____8238 = p1.call(null, z);
                      if(cljs.core.truth_(and__3822__auto____8238)) {
                        var and__3822__auto____8239 = p2.call(null, z);
                        if(cljs.core.truth_(and__3822__auto____8239)) {
                          return p3.call(null, z)
                        }else {
                          return and__3822__auto____8239
                        }
                      }else {
                        return and__3822__auto____8238
                      }
                    }else {
                      return and__3822__auto____8237
                    }
                  }else {
                    return and__3822__auto____8236
                  }
                }else {
                  return and__3822__auto____8235
                }
              }else {
                return and__3822__auto____8234
              }
            }else {
              return and__3822__auto____8233
            }
          }else {
            return and__3822__auto____8232
          }
        }())
      };
      var ep3__4 = function() {
        var G__8256__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3822__auto____8240 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3822__auto____8240)) {
              return cljs.core.every_QMARK_.call(null, function(p1__8052_SHARP_) {
                var and__3822__auto____8241 = p1.call(null, p1__8052_SHARP_);
                if(cljs.core.truth_(and__3822__auto____8241)) {
                  var and__3822__auto____8242 = p2.call(null, p1__8052_SHARP_);
                  if(cljs.core.truth_(and__3822__auto____8242)) {
                    return p3.call(null, p1__8052_SHARP_)
                  }else {
                    return and__3822__auto____8242
                  }
                }else {
                  return and__3822__auto____8241
                }
              }, args)
            }else {
              return and__3822__auto____8240
            }
          }())
        };
        var G__8256 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__8256__delegate.call(this, x, y, z, args)
        };
        G__8256.cljs$lang$maxFixedArity = 3;
        G__8256.cljs$lang$applyTo = function(arglist__8257) {
          var x = cljs.core.first(arglist__8257);
          var y = cljs.core.first(cljs.core.next(arglist__8257));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8257)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8257)));
          return G__8256__delegate(x, y, z, args)
        };
        G__8256.cljs$lang$arity$variadic = G__8256__delegate;
        return G__8256
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__0.call(this);
          case 1:
            return ep3__1.call(this, x);
          case 2:
            return ep3__2.call(this, x, y);
          case 3:
            return ep3__3.call(this, x, y, z);
          default:
            return ep3__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__4.cljs$lang$applyTo;
      ep3.cljs$lang$arity$0 = ep3__0;
      ep3.cljs$lang$arity$1 = ep3__1;
      ep3.cljs$lang$arity$2 = ep3__2;
      ep3.cljs$lang$arity$3 = ep3__3;
      ep3.cljs$lang$arity$variadic = ep3__4.cljs$lang$arity$variadic;
      return ep3
    }()
  };
  var every_pred__4 = function() {
    var G__8258__delegate = function(p1, p2, p3, ps) {
      var ps__8243 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__0 = function() {
          return true
        };
        var epn__1 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__8053_SHARP_) {
            return p1__8053_SHARP_.call(null, x)
          }, ps__8243)
        };
        var epn__2 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__8054_SHARP_) {
            var and__3822__auto____8248 = p1__8054_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____8248)) {
              return p1__8054_SHARP_.call(null, y)
            }else {
              return and__3822__auto____8248
            }
          }, ps__8243)
        };
        var epn__3 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__8055_SHARP_) {
            var and__3822__auto____8249 = p1__8055_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3822__auto____8249)) {
              var and__3822__auto____8250 = p1__8055_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3822__auto____8250)) {
                return p1__8055_SHARP_.call(null, z)
              }else {
                return and__3822__auto____8250
              }
            }else {
              return and__3822__auto____8249
            }
          }, ps__8243)
        };
        var epn__4 = function() {
          var G__8259__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3822__auto____8251 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3822__auto____8251)) {
                return cljs.core.every_QMARK_.call(null, function(p1__8056_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__8056_SHARP_, args)
                }, ps__8243)
              }else {
                return and__3822__auto____8251
              }
            }())
          };
          var G__8259 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__8259__delegate.call(this, x, y, z, args)
          };
          G__8259.cljs$lang$maxFixedArity = 3;
          G__8259.cljs$lang$applyTo = function(arglist__8260) {
            var x = cljs.core.first(arglist__8260);
            var y = cljs.core.first(cljs.core.next(arglist__8260));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8260)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8260)));
            return G__8259__delegate(x, y, z, args)
          };
          G__8259.cljs$lang$arity$variadic = G__8259__delegate;
          return G__8259
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__0.call(this);
            case 1:
              return epn__1.call(this, x);
            case 2:
              return epn__2.call(this, x, y);
            case 3:
              return epn__3.call(this, x, y, z);
            default:
              return epn__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__4.cljs$lang$applyTo;
        epn.cljs$lang$arity$0 = epn__0;
        epn.cljs$lang$arity$1 = epn__1;
        epn.cljs$lang$arity$2 = epn__2;
        epn.cljs$lang$arity$3 = epn__3;
        epn.cljs$lang$arity$variadic = epn__4.cljs$lang$arity$variadic;
        return epn
      }()
    };
    var G__8258 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__8258__delegate.call(this, p1, p2, p3, ps)
    };
    G__8258.cljs$lang$maxFixedArity = 3;
    G__8258.cljs$lang$applyTo = function(arglist__8261) {
      var p1 = cljs.core.first(arglist__8261);
      var p2 = cljs.core.first(cljs.core.next(arglist__8261));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8261)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8261)));
      return G__8258__delegate(p1, p2, p3, ps)
    };
    G__8258.cljs$lang$arity$variadic = G__8258__delegate;
    return G__8258
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__1.call(this, p1);
      case 2:
        return every_pred__2.call(this, p1, p2);
      case 3:
        return every_pred__3.call(this, p1, p2, p3);
      default:
        return every_pred__4.cljs$lang$arity$variadic(p1, p2, p3, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__4.cljs$lang$applyTo;
  every_pred.cljs$lang$arity$1 = every_pred__1;
  every_pred.cljs$lang$arity$2 = every_pred__2;
  every_pred.cljs$lang$arity$3 = every_pred__3;
  every_pred.cljs$lang$arity$variadic = every_pred__4.cljs$lang$arity$variadic;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__1 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__0 = function() {
        return null
      };
      var sp1__1 = function(x) {
        return p.call(null, x)
      };
      var sp1__2 = function(x, y) {
        var or__3824__auto____8342 = p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8342)) {
          return or__3824__auto____8342
        }else {
          return p.call(null, y)
        }
      };
      var sp1__3 = function(x, y, z) {
        var or__3824__auto____8343 = p.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8343)) {
          return or__3824__auto____8343
        }else {
          var or__3824__auto____8344 = p.call(null, y);
          if(cljs.core.truth_(or__3824__auto____8344)) {
            return or__3824__auto____8344
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__4 = function() {
        var G__8413__delegate = function(x, y, z, args) {
          var or__3824__auto____8345 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____8345)) {
            return or__3824__auto____8345
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__8413 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__8413__delegate.call(this, x, y, z, args)
        };
        G__8413.cljs$lang$maxFixedArity = 3;
        G__8413.cljs$lang$applyTo = function(arglist__8414) {
          var x = cljs.core.first(arglist__8414);
          var y = cljs.core.first(cljs.core.next(arglist__8414));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8414)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8414)));
          return G__8413__delegate(x, y, z, args)
        };
        G__8413.cljs$lang$arity$variadic = G__8413__delegate;
        return G__8413
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__0.call(this);
          case 1:
            return sp1__1.call(this, x);
          case 2:
            return sp1__2.call(this, x, y);
          case 3:
            return sp1__3.call(this, x, y, z);
          default:
            return sp1__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__4.cljs$lang$applyTo;
      sp1.cljs$lang$arity$0 = sp1__0;
      sp1.cljs$lang$arity$1 = sp1__1;
      sp1.cljs$lang$arity$2 = sp1__2;
      sp1.cljs$lang$arity$3 = sp1__3;
      sp1.cljs$lang$arity$variadic = sp1__4.cljs$lang$arity$variadic;
      return sp1
    }()
  };
  var some_fn__2 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__0 = function() {
        return null
      };
      var sp2__1 = function(x) {
        var or__3824__auto____8357 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8357)) {
          return or__3824__auto____8357
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__2 = function(x, y) {
        var or__3824__auto____8358 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8358)) {
          return or__3824__auto____8358
        }else {
          var or__3824__auto____8359 = p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____8359)) {
            return or__3824__auto____8359
          }else {
            var or__3824__auto____8360 = p2.call(null, x);
            if(cljs.core.truth_(or__3824__auto____8360)) {
              return or__3824__auto____8360
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__3 = function(x, y, z) {
        var or__3824__auto____8361 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8361)) {
          return or__3824__auto____8361
        }else {
          var or__3824__auto____8362 = p1.call(null, y);
          if(cljs.core.truth_(or__3824__auto____8362)) {
            return or__3824__auto____8362
          }else {
            var or__3824__auto____8363 = p1.call(null, z);
            if(cljs.core.truth_(or__3824__auto____8363)) {
              return or__3824__auto____8363
            }else {
              var or__3824__auto____8364 = p2.call(null, x);
              if(cljs.core.truth_(or__3824__auto____8364)) {
                return or__3824__auto____8364
              }else {
                var or__3824__auto____8365 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____8365)) {
                  return or__3824__auto____8365
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__4 = function() {
        var G__8415__delegate = function(x, y, z, args) {
          var or__3824__auto____8366 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____8366)) {
            return or__3824__auto____8366
          }else {
            return cljs.core.some.call(null, function(p1__8096_SHARP_) {
              var or__3824__auto____8367 = p1.call(null, p1__8096_SHARP_);
              if(cljs.core.truth_(or__3824__auto____8367)) {
                return or__3824__auto____8367
              }else {
                return p2.call(null, p1__8096_SHARP_)
              }
            }, args)
          }
        };
        var G__8415 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__8415__delegate.call(this, x, y, z, args)
        };
        G__8415.cljs$lang$maxFixedArity = 3;
        G__8415.cljs$lang$applyTo = function(arglist__8416) {
          var x = cljs.core.first(arglist__8416);
          var y = cljs.core.first(cljs.core.next(arglist__8416));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8416)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8416)));
          return G__8415__delegate(x, y, z, args)
        };
        G__8415.cljs$lang$arity$variadic = G__8415__delegate;
        return G__8415
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__0.call(this);
          case 1:
            return sp2__1.call(this, x);
          case 2:
            return sp2__2.call(this, x, y);
          case 3:
            return sp2__3.call(this, x, y, z);
          default:
            return sp2__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__4.cljs$lang$applyTo;
      sp2.cljs$lang$arity$0 = sp2__0;
      sp2.cljs$lang$arity$1 = sp2__1;
      sp2.cljs$lang$arity$2 = sp2__2;
      sp2.cljs$lang$arity$3 = sp2__3;
      sp2.cljs$lang$arity$variadic = sp2__4.cljs$lang$arity$variadic;
      return sp2
    }()
  };
  var some_fn__3 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__0 = function() {
        return null
      };
      var sp3__1 = function(x) {
        var or__3824__auto____8386 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8386)) {
          return or__3824__auto____8386
        }else {
          var or__3824__auto____8387 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____8387)) {
            return or__3824__auto____8387
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__2 = function(x, y) {
        var or__3824__auto____8388 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8388)) {
          return or__3824__auto____8388
        }else {
          var or__3824__auto____8389 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____8389)) {
            return or__3824__auto____8389
          }else {
            var or__3824__auto____8390 = p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____8390)) {
              return or__3824__auto____8390
            }else {
              var or__3824__auto____8391 = p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____8391)) {
                return or__3824__auto____8391
              }else {
                var or__3824__auto____8392 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____8392)) {
                  return or__3824__auto____8392
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__3 = function(x, y, z) {
        var or__3824__auto____8393 = p1.call(null, x);
        if(cljs.core.truth_(or__3824__auto____8393)) {
          return or__3824__auto____8393
        }else {
          var or__3824__auto____8394 = p2.call(null, x);
          if(cljs.core.truth_(or__3824__auto____8394)) {
            return or__3824__auto____8394
          }else {
            var or__3824__auto____8395 = p3.call(null, x);
            if(cljs.core.truth_(or__3824__auto____8395)) {
              return or__3824__auto____8395
            }else {
              var or__3824__auto____8396 = p1.call(null, y);
              if(cljs.core.truth_(or__3824__auto____8396)) {
                return or__3824__auto____8396
              }else {
                var or__3824__auto____8397 = p2.call(null, y);
                if(cljs.core.truth_(or__3824__auto____8397)) {
                  return or__3824__auto____8397
                }else {
                  var or__3824__auto____8398 = p3.call(null, y);
                  if(cljs.core.truth_(or__3824__auto____8398)) {
                    return or__3824__auto____8398
                  }else {
                    var or__3824__auto____8399 = p1.call(null, z);
                    if(cljs.core.truth_(or__3824__auto____8399)) {
                      return or__3824__auto____8399
                    }else {
                      var or__3824__auto____8400 = p2.call(null, z);
                      if(cljs.core.truth_(or__3824__auto____8400)) {
                        return or__3824__auto____8400
                      }else {
                        return p3.call(null, z)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      var sp3__4 = function() {
        var G__8417__delegate = function(x, y, z, args) {
          var or__3824__auto____8401 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3824__auto____8401)) {
            return or__3824__auto____8401
          }else {
            return cljs.core.some.call(null, function(p1__8097_SHARP_) {
              var or__3824__auto____8402 = p1.call(null, p1__8097_SHARP_);
              if(cljs.core.truth_(or__3824__auto____8402)) {
                return or__3824__auto____8402
              }else {
                var or__3824__auto____8403 = p2.call(null, p1__8097_SHARP_);
                if(cljs.core.truth_(or__3824__auto____8403)) {
                  return or__3824__auto____8403
                }else {
                  return p3.call(null, p1__8097_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__8417 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__8417__delegate.call(this, x, y, z, args)
        };
        G__8417.cljs$lang$maxFixedArity = 3;
        G__8417.cljs$lang$applyTo = function(arglist__8418) {
          var x = cljs.core.first(arglist__8418);
          var y = cljs.core.first(cljs.core.next(arglist__8418));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8418)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8418)));
          return G__8417__delegate(x, y, z, args)
        };
        G__8417.cljs$lang$arity$variadic = G__8417__delegate;
        return G__8417
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__0.call(this);
          case 1:
            return sp3__1.call(this, x);
          case 2:
            return sp3__2.call(this, x, y);
          case 3:
            return sp3__3.call(this, x, y, z);
          default:
            return sp3__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__4.cljs$lang$applyTo;
      sp3.cljs$lang$arity$0 = sp3__0;
      sp3.cljs$lang$arity$1 = sp3__1;
      sp3.cljs$lang$arity$2 = sp3__2;
      sp3.cljs$lang$arity$3 = sp3__3;
      sp3.cljs$lang$arity$variadic = sp3__4.cljs$lang$arity$variadic;
      return sp3
    }()
  };
  var some_fn__4 = function() {
    var G__8419__delegate = function(p1, p2, p3, ps) {
      var ps__8404 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__0 = function() {
          return null
        };
        var spn__1 = function(x) {
          return cljs.core.some.call(null, function(p1__8098_SHARP_) {
            return p1__8098_SHARP_.call(null, x)
          }, ps__8404)
        };
        var spn__2 = function(x, y) {
          return cljs.core.some.call(null, function(p1__8099_SHARP_) {
            var or__3824__auto____8409 = p1__8099_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____8409)) {
              return or__3824__auto____8409
            }else {
              return p1__8099_SHARP_.call(null, y)
            }
          }, ps__8404)
        };
        var spn__3 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__8100_SHARP_) {
            var or__3824__auto____8410 = p1__8100_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3824__auto____8410)) {
              return or__3824__auto____8410
            }else {
              var or__3824__auto____8411 = p1__8100_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3824__auto____8411)) {
                return or__3824__auto____8411
              }else {
                return p1__8100_SHARP_.call(null, z)
              }
            }
          }, ps__8404)
        };
        var spn__4 = function() {
          var G__8420__delegate = function(x, y, z, args) {
            var or__3824__auto____8412 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3824__auto____8412)) {
              return or__3824__auto____8412
            }else {
              return cljs.core.some.call(null, function(p1__8101_SHARP_) {
                return cljs.core.some.call(null, p1__8101_SHARP_, args)
              }, ps__8404)
            }
          };
          var G__8420 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__8420__delegate.call(this, x, y, z, args)
          };
          G__8420.cljs$lang$maxFixedArity = 3;
          G__8420.cljs$lang$applyTo = function(arglist__8421) {
            var x = cljs.core.first(arglist__8421);
            var y = cljs.core.first(cljs.core.next(arglist__8421));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8421)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8421)));
            return G__8420__delegate(x, y, z, args)
          };
          G__8420.cljs$lang$arity$variadic = G__8420__delegate;
          return G__8420
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__0.call(this);
            case 1:
              return spn__1.call(this, x);
            case 2:
              return spn__2.call(this, x, y);
            case 3:
              return spn__3.call(this, x, y, z);
            default:
              return spn__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__4.cljs$lang$applyTo;
        spn.cljs$lang$arity$0 = spn__0;
        spn.cljs$lang$arity$1 = spn__1;
        spn.cljs$lang$arity$2 = spn__2;
        spn.cljs$lang$arity$3 = spn__3;
        spn.cljs$lang$arity$variadic = spn__4.cljs$lang$arity$variadic;
        return spn
      }()
    };
    var G__8419 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__8419__delegate.call(this, p1, p2, p3, ps)
    };
    G__8419.cljs$lang$maxFixedArity = 3;
    G__8419.cljs$lang$applyTo = function(arglist__8422) {
      var p1 = cljs.core.first(arglist__8422);
      var p2 = cljs.core.first(cljs.core.next(arglist__8422));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8422)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8422)));
      return G__8419__delegate(p1, p2, p3, ps)
    };
    G__8419.cljs$lang$arity$variadic = G__8419__delegate;
    return G__8419
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__1.call(this, p1);
      case 2:
        return some_fn__2.call(this, p1, p2);
      case 3:
        return some_fn__3.call(this, p1, p2, p3);
      default:
        return some_fn__4.cljs$lang$arity$variadic(p1, p2, p3, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__4.cljs$lang$applyTo;
  some_fn.cljs$lang$arity$1 = some_fn__1;
  some_fn.cljs$lang$arity$2 = some_fn__2;
  some_fn.cljs$lang$arity$3 = some_fn__3;
  some_fn.cljs$lang$arity$variadic = some_fn__4.cljs$lang$arity$variadic;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__2 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____8441 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8441) {
        var s__8442 = temp__3974__auto____8441;
        if(cljs.core.chunked_seq_QMARK_.call(null, s__8442)) {
          var c__8443 = cljs.core.chunk_first.call(null, s__8442);
          var size__8444 = cljs.core.count.call(null, c__8443);
          var b__8445 = cljs.core.chunk_buffer.call(null, size__8444);
          var n__2527__auto____8446 = size__8444;
          var i__8447 = 0;
          while(true) {
            if(i__8447 < n__2527__auto____8446) {
              cljs.core.chunk_append.call(null, b__8445, f.call(null, cljs.core._nth.call(null, c__8443, i__8447)));
              var G__8459 = i__8447 + 1;
              i__8447 = G__8459;
              continue
            }else {
            }
            break
          }
          return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__8445), map.call(null, f, cljs.core.chunk_rest.call(null, s__8442)))
        }else {
          return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__8442)), map.call(null, f, cljs.core.rest.call(null, s__8442)))
        }
      }else {
        return null
      }
    }, null)
  };
  var map__3 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__8448 = cljs.core.seq.call(null, c1);
      var s2__8449 = cljs.core.seq.call(null, c2);
      if(function() {
        var and__3822__auto____8450 = s1__8448;
        if(and__3822__auto____8450) {
          return s2__8449
        }else {
          return and__3822__auto____8450
        }
      }()) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__8448), cljs.core.first.call(null, s2__8449)), map.call(null, f, cljs.core.rest.call(null, s1__8448), cljs.core.rest.call(null, s2__8449)))
      }else {
        return null
      }
    }, null)
  };
  var map__4 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__8451 = cljs.core.seq.call(null, c1);
      var s2__8452 = cljs.core.seq.call(null, c2);
      var s3__8453 = cljs.core.seq.call(null, c3);
      if(function() {
        var and__3822__auto____8454 = s1__8451;
        if(and__3822__auto____8454) {
          var and__3822__auto____8455 = s2__8452;
          if(and__3822__auto____8455) {
            return s3__8453
          }else {
            return and__3822__auto____8455
          }
        }else {
          return and__3822__auto____8454
        }
      }()) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__8451), cljs.core.first.call(null, s2__8452), cljs.core.first.call(null, s3__8453)), map.call(null, f, cljs.core.rest.call(null, s1__8451), cljs.core.rest.call(null, s2__8452), cljs.core.rest.call(null, s3__8453)))
      }else {
        return null
      }
    }, null)
  };
  var map__5 = function() {
    var G__8460__delegate = function(f, c1, c2, c3, colls) {
      var step__8458 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__8457 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__8457)) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__8457), step.call(null, map.call(null, cljs.core.rest, ss__8457)))
          }else {
            return null
          }
        }, null)
      };
      return map.call(null, function(p1__8262_SHARP_) {
        return cljs.core.apply.call(null, f, p1__8262_SHARP_)
      }, step__8458.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__8460 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__8460__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__8460.cljs$lang$maxFixedArity = 4;
    G__8460.cljs$lang$applyTo = function(arglist__8461) {
      var f = cljs.core.first(arglist__8461);
      var c1 = cljs.core.first(cljs.core.next(arglist__8461));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8461)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8461))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8461))));
      return G__8460__delegate(f, c1, c2, c3, colls)
    };
    G__8460.cljs$lang$arity$variadic = G__8460__delegate;
    return G__8460
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__2.call(this, f, c1);
      case 3:
        return map__3.call(this, f, c1, c2);
      case 4:
        return map__4.call(this, f, c1, c2, c3);
      default:
        return map__5.cljs$lang$arity$variadic(f, c1, c2, c3, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__5.cljs$lang$applyTo;
  map.cljs$lang$arity$2 = map__2;
  map.cljs$lang$arity$3 = map__3;
  map.cljs$lang$arity$4 = map__4;
  map.cljs$lang$arity$variadic = map__5.cljs$lang$arity$variadic;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(n > 0) {
      var temp__3974__auto____8464 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8464) {
        var s__8465 = temp__3974__auto____8464;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__8465), take.call(null, n - 1, cljs.core.rest.call(null, s__8465)))
      }else {
        return null
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.drop = function drop(n, coll) {
  var step__8471 = function(n, coll) {
    while(true) {
      var s__8469 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____8470 = n > 0;
        if(and__3822__auto____8470) {
          return s__8469
        }else {
          return and__3822__auto____8470
        }
      }())) {
        var G__8472 = n - 1;
        var G__8473 = cljs.core.rest.call(null, s__8469);
        n = G__8472;
        coll = G__8473;
        continue
      }else {
        return s__8469
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__8471.call(null, n, coll)
  }, null)
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__1 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__2 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__1.call(this, n);
      case 2:
        return drop_last__2.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  drop_last.cljs$lang$arity$1 = drop_last__1;
  drop_last.cljs$lang$arity$2 = drop_last__2;
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__8476 = cljs.core.seq.call(null, coll);
  var lead__8477 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(lead__8477) {
      var G__8478 = cljs.core.next.call(null, s__8476);
      var G__8479 = cljs.core.next.call(null, lead__8477);
      s__8476 = G__8478;
      lead__8477 = G__8479;
      continue
    }else {
      return s__8476
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__8485 = function(pred, coll) {
    while(true) {
      var s__8483 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3822__auto____8484 = s__8483;
        if(and__3822__auto____8484) {
          return pred.call(null, cljs.core.first.call(null, s__8483))
        }else {
          return and__3822__auto____8484
        }
      }())) {
        var G__8486 = pred;
        var G__8487 = cljs.core.rest.call(null, s__8483);
        pred = G__8486;
        coll = G__8487;
        continue
      }else {
        return s__8483
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__8485.call(null, pred, coll)
  }, null)
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____8490 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____8490) {
      var s__8491 = temp__3974__auto____8490;
      return cljs.core.concat.call(null, s__8491, cycle.call(null, s__8491))
    }else {
      return null
    }
  }, null)
};
cljs.core.split_at = function split_at(n, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take.call(null, n, coll), cljs.core.drop.call(null, n, coll)], true)
};
cljs.core.repeat = function() {
  var repeat = null;
  var repeat__1 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    }, null)
  };
  var repeat__2 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__1.call(this, n);
      case 2:
        return repeat__2.call(this, n, x)
    }
    throw"Invalid arity: " + arguments.length;
  };
  repeat.cljs$lang$arity$1 = repeat__1;
  repeat.cljs$lang$arity$2 = repeat__2;
  return repeat
}();
cljs.core.replicate = function replicate(n, x) {
  return cljs.core.take.call(null, n, cljs.core.repeat.call(null, x))
};
cljs.core.repeatedly = function() {
  var repeatedly = null;
  var repeatedly__1 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    }, null)
  };
  var repeatedly__2 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__1.call(this, n);
      case 2:
        return repeatedly__2.call(this, n, f)
    }
    throw"Invalid arity: " + arguments.length;
  };
  repeatedly.cljs$lang$arity$1 = repeatedly__1;
  repeatedly.cljs$lang$arity$2 = repeatedly__2;
  return repeatedly
}();
cljs.core.iterate = function iterate(f, x) {
  return cljs.core.cons.call(null, x, new cljs.core.LazySeq(null, false, function() {
    return iterate.call(null, f, f.call(null, x))
  }, null))
};
cljs.core.interleave = function() {
  var interleave = null;
  var interleave__2 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__8496 = cljs.core.seq.call(null, c1);
      var s2__8497 = cljs.core.seq.call(null, c2);
      if(function() {
        var and__3822__auto____8498 = s1__8496;
        if(and__3822__auto____8498) {
          return s2__8497
        }else {
          return and__3822__auto____8498
        }
      }()) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__8496), cljs.core.cons.call(null, cljs.core.first.call(null, s2__8497), interleave.call(null, cljs.core.rest.call(null, s1__8496), cljs.core.rest.call(null, s2__8497))))
      }else {
        return null
      }
    }, null)
  };
  var interleave__3 = function() {
    var G__8500__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__8499 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__8499)) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__8499), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__8499)))
        }else {
          return null
        }
      }, null)
    };
    var G__8500 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8500__delegate.call(this, c1, c2, colls)
    };
    G__8500.cljs$lang$maxFixedArity = 2;
    G__8500.cljs$lang$applyTo = function(arglist__8501) {
      var c1 = cljs.core.first(arglist__8501);
      var c2 = cljs.core.first(cljs.core.next(arglist__8501));
      var colls = cljs.core.rest(cljs.core.next(arglist__8501));
      return G__8500__delegate(c1, c2, colls)
    };
    G__8500.cljs$lang$arity$variadic = G__8500__delegate;
    return G__8500
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__2.call(this, c1, c2);
      default:
        return interleave__3.cljs$lang$arity$variadic(c1, c2, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__3.cljs$lang$applyTo;
  interleave.cljs$lang$arity$2 = interleave__2;
  interleave.cljs$lang$arity$variadic = interleave__3.cljs$lang$arity$variadic;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__8511 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3971__auto____8509 = cljs.core.seq.call(null, coll);
      if(temp__3971__auto____8509) {
        var coll__8510 = temp__3971__auto____8509;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__8510), cat.call(null, cljs.core.rest.call(null, coll__8510), colls))
      }else {
        if(cljs.core.seq.call(null, colls)) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    }, null)
  };
  return cat__8511.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__2 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__3 = function() {
    var G__8512__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__8512 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8512__delegate.call(this, f, coll, colls)
    };
    G__8512.cljs$lang$maxFixedArity = 2;
    G__8512.cljs$lang$applyTo = function(arglist__8513) {
      var f = cljs.core.first(arglist__8513);
      var coll = cljs.core.first(cljs.core.next(arglist__8513));
      var colls = cljs.core.rest(cljs.core.next(arglist__8513));
      return G__8512__delegate(f, coll, colls)
    };
    G__8512.cljs$lang$arity$variadic = G__8512__delegate;
    return G__8512
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__2.call(this, f, coll);
      default:
        return mapcat__3.cljs$lang$arity$variadic(f, coll, cljs.core.array_seq(arguments, 2))
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__3.cljs$lang$applyTo;
  mapcat.cljs$lang$arity$2 = mapcat__2;
  mapcat.cljs$lang$arity$variadic = mapcat__3.cljs$lang$arity$variadic;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____8523 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____8523) {
      var s__8524 = temp__3974__auto____8523;
      if(cljs.core.chunked_seq_QMARK_.call(null, s__8524)) {
        var c__8525 = cljs.core.chunk_first.call(null, s__8524);
        var size__8526 = cljs.core.count.call(null, c__8525);
        var b__8527 = cljs.core.chunk_buffer.call(null, size__8526);
        var n__2527__auto____8528 = size__8526;
        var i__8529 = 0;
        while(true) {
          if(i__8529 < n__2527__auto____8528) {
            if(cljs.core.truth_(pred.call(null, cljs.core._nth.call(null, c__8525, i__8529)))) {
              cljs.core.chunk_append.call(null, b__8527, cljs.core._nth.call(null, c__8525, i__8529))
            }else {
            }
            var G__8532 = i__8529 + 1;
            i__8529 = G__8532;
            continue
          }else {
          }
          break
        }
        return cljs.core.chunk_cons.call(null, cljs.core.chunk.call(null, b__8527), filter.call(null, pred, cljs.core.chunk_rest.call(null, s__8524)))
      }else {
        var f__8530 = cljs.core.first.call(null, s__8524);
        var r__8531 = cljs.core.rest.call(null, s__8524);
        if(cljs.core.truth_(pred.call(null, f__8530))) {
          return cljs.core.cons.call(null, f__8530, filter.call(null, pred, r__8531))
        }else {
          return filter.call(null, pred, r__8531)
        }
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.remove = function remove(pred, coll) {
  return cljs.core.filter.call(null, cljs.core.complement.call(null, pred), coll)
};
cljs.core.tree_seq = function tree_seq(branch_QMARK_, children, root) {
  var walk__8535 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    }, null)
  };
  return walk__8535.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__8533_SHARP_) {
    return!cljs.core.sequential_QMARK_.call(null, p1__8533_SHARP_)
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  if(function() {
    var G__8539__8540 = to;
    if(G__8539__8540) {
      if(function() {
        var or__3824__auto____8541 = G__8539__8540.cljs$lang$protocol_mask$partition1$ & 1;
        if(or__3824__auto____8541) {
          return or__3824__auto____8541
        }else {
          return G__8539__8540.cljs$core$IEditableCollection$
        }
      }()) {
        return true
      }else {
        if(!G__8539__8540.cljs$lang$protocol_mask$partition1$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IEditableCollection, G__8539__8540)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IEditableCollection, G__8539__8540)
    }
  }()) {
    return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, cljs.core._conj_BANG_, cljs.core.transient$.call(null, to), from))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, to, from)
  }
};
cljs.core.mapv = function() {
  var mapv = null;
  var mapv__2 = function(f, coll) {
    return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, function(v, o) {
      return cljs.core.conj_BANG_.call(null, v, f.call(null, o))
    }, cljs.core.transient$.call(null, cljs.core.PersistentVector.EMPTY), coll))
  };
  var mapv__3 = function(f, c1, c2) {
    return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, cljs.core.map.call(null, f, c1, c2))
  };
  var mapv__4 = function(f, c1, c2, c3) {
    return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, cljs.core.map.call(null, f, c1, c2, c3))
  };
  var mapv__5 = function() {
    var G__8542__delegate = function(f, c1, c2, c3, colls) {
      return cljs.core.into.call(null, cljs.core.PersistentVector.EMPTY, cljs.core.apply.call(null, cljs.core.map, f, c1, c2, c3, colls))
    };
    var G__8542 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__8542__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__8542.cljs$lang$maxFixedArity = 4;
    G__8542.cljs$lang$applyTo = function(arglist__8543) {
      var f = cljs.core.first(arglist__8543);
      var c1 = cljs.core.first(cljs.core.next(arglist__8543));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8543)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8543))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__8543))));
      return G__8542__delegate(f, c1, c2, c3, colls)
    };
    G__8542.cljs$lang$arity$variadic = G__8542__delegate;
    return G__8542
  }();
  mapv = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapv__2.call(this, f, c1);
      case 3:
        return mapv__3.call(this, f, c1, c2);
      case 4:
        return mapv__4.call(this, f, c1, c2, c3);
      default:
        return mapv__5.cljs$lang$arity$variadic(f, c1, c2, c3, cljs.core.array_seq(arguments, 4))
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapv.cljs$lang$maxFixedArity = 4;
  mapv.cljs$lang$applyTo = mapv__5.cljs$lang$applyTo;
  mapv.cljs$lang$arity$2 = mapv__2;
  mapv.cljs$lang$arity$3 = mapv__3;
  mapv.cljs$lang$arity$4 = mapv__4;
  mapv.cljs$lang$arity$variadic = mapv__5.cljs$lang$arity$variadic;
  return mapv
}();
cljs.core.filterv = function filterv(pred, coll) {
  return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, function(v, o) {
    if(cljs.core.truth_(pred.call(null, o))) {
      return cljs.core.conj_BANG_.call(null, v, o)
    }else {
      return v
    }
  }, cljs.core.transient$.call(null, cljs.core.PersistentVector.EMPTY), coll))
};
cljs.core.partition = function() {
  var partition = null;
  var partition__2 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__3 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____8550 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8550) {
        var s__8551 = temp__3974__auto____8550;
        var p__8552 = cljs.core.take.call(null, n, s__8551);
        if(n === cljs.core.count.call(null, p__8552)) {
          return cljs.core.cons.call(null, p__8552, partition.call(null, n, step, cljs.core.drop.call(null, step, s__8551)))
        }else {
          return null
        }
      }else {
        return null
      }
    }, null)
  };
  var partition__4 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____8553 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____8553) {
        var s__8554 = temp__3974__auto____8553;
        var p__8555 = cljs.core.take.call(null, n, s__8554);
        if(n === cljs.core.count.call(null, p__8555)) {
          return cljs.core.cons.call(null, p__8555, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__8554)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__8555, pad)))
        }
      }else {
        return null
      }
    }, null)
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__2.call(this, n, step);
      case 3:
        return partition__3.call(this, n, step, pad);
      case 4:
        return partition__4.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partition.cljs$lang$arity$2 = partition__2;
  partition.cljs$lang$arity$3 = partition__3;
  partition.cljs$lang$arity$4 = partition__4;
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__2 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__3 = function(m, ks, not_found) {
    var sentinel__8560 = cljs.core.lookup_sentinel;
    var m__8561 = m;
    var ks__8562 = cljs.core.seq.call(null, ks);
    while(true) {
      if(ks__8562) {
        var m__8563 = cljs.core._lookup.call(null, m__8561, cljs.core.first.call(null, ks__8562), sentinel__8560);
        if(sentinel__8560 === m__8563) {
          return not_found
        }else {
          var G__8564 = sentinel__8560;
          var G__8565 = m__8563;
          var G__8566 = cljs.core.next.call(null, ks__8562);
          sentinel__8560 = G__8564;
          m__8561 = G__8565;
          ks__8562 = G__8566;
          continue
        }
      }else {
        return m__8561
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__2.call(this, m, ks);
      case 3:
        return get_in__3.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  get_in.cljs$lang$arity$2 = get_in__2;
  get_in.cljs$lang$arity$3 = get_in__3;
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__8567, v) {
  var vec__8572__8573 = p__8567;
  var k__8574 = cljs.core.nth.call(null, vec__8572__8573, 0, null);
  var ks__8575 = cljs.core.nthnext.call(null, vec__8572__8573, 1);
  if(cljs.core.truth_(ks__8575)) {
    return cljs.core.assoc.call(null, m, k__8574, assoc_in.call(null, cljs.core._lookup.call(null, m, k__8574, null), ks__8575, v))
  }else {
    return cljs.core.assoc.call(null, m, k__8574, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__8576, f, args) {
    var vec__8581__8582 = p__8576;
    var k__8583 = cljs.core.nth.call(null, vec__8581__8582, 0, null);
    var ks__8584 = cljs.core.nthnext.call(null, vec__8581__8582, 1);
    if(cljs.core.truth_(ks__8584)) {
      return cljs.core.assoc.call(null, m, k__8583, cljs.core.apply.call(null, update_in, cljs.core._lookup.call(null, m, k__8583, null), ks__8584, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__8583, cljs.core.apply.call(null, f, cljs.core._lookup.call(null, m, k__8583, null), args))
    }
  };
  var update_in = function(m, p__8576, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__8576, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__8585) {
    var m = cljs.core.first(arglist__8585);
    var p__8576 = cljs.core.first(cljs.core.next(arglist__8585));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8585)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8585)));
    return update_in__delegate(m, p__8576, f, args)
  };
  update_in.cljs$lang$arity$variadic = update_in__delegate;
  return update_in
}();
cljs.core.Vector = function(meta, array, __hash) {
  this.meta = meta;
  this.array = array;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32400159
};
cljs.core.Vector.cljs$lang$type = true;
cljs.core.Vector.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Vector")
};
cljs.core.Vector.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8588 = this;
  var h__2192__auto____8589 = this__8588.__hash;
  if(!(h__2192__auto____8589 == null)) {
    return h__2192__auto____8589
  }else {
    var h__2192__auto____8590 = cljs.core.hash_coll.call(null, coll);
    this__8588.__hash = h__2192__auto____8590;
    return h__2192__auto____8590
  }
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8591 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8592 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8593 = this;
  var new_array__8594 = this__8593.array.slice();
  new_array__8594[k] = v;
  return new cljs.core.Vector(this__8593.meta, new_array__8594, null)
};
cljs.core.Vector.prototype.call = function() {
  var G__8625 = null;
  var G__8625__2 = function(this_sym8595, k) {
    var this__8597 = this;
    var this_sym8595__8598 = this;
    var coll__8599 = this_sym8595__8598;
    return coll__8599.cljs$core$ILookup$_lookup$arity$2(coll__8599, k)
  };
  var G__8625__3 = function(this_sym8596, k, not_found) {
    var this__8597 = this;
    var this_sym8596__8600 = this;
    var coll__8601 = this_sym8596__8600;
    return coll__8601.cljs$core$ILookup$_lookup$arity$3(coll__8601, k, not_found)
  };
  G__8625 = function(this_sym8596, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8625__2.call(this, this_sym8596, k);
      case 3:
        return G__8625__3.call(this, this_sym8596, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8625
}();
cljs.core.Vector.prototype.apply = function(this_sym8586, args8587) {
  var this__8602 = this;
  return this_sym8586.call.apply(this_sym8586, [this_sym8586].concat(args8587.slice()))
};
cljs.core.Vector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8603 = this;
  var new_array__8604 = this__8603.array.slice();
  new_array__8604.push(o);
  return new cljs.core.Vector(this__8603.meta, new_array__8604, null)
};
cljs.core.Vector.prototype.toString = function() {
  var this__8605 = this;
  var this__8606 = this;
  return cljs.core.pr_str.call(null, this__8606)
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__8607 = this;
  return cljs.core.ci_reduce.call(null, this__8607.array, f)
};
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__8608 = this;
  return cljs.core.ci_reduce.call(null, this__8608.array, f, start)
};
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8609 = this;
  if(this__8609.array.length > 0) {
    var vector_seq__8610 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < this__8609.array.length) {
          return cljs.core.cons.call(null, this__8609.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      }, null)
    };
    return vector_seq__8610.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8611 = this;
  return this__8611.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8612 = this;
  var count__8613 = this__8612.array.length;
  if(count__8613 > 0) {
    return this__8612.array[count__8613 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8614 = this;
  if(this__8614.array.length > 0) {
    var new_array__8615 = this__8614.array.slice();
    new_array__8615.pop();
    return new cljs.core.Vector(this__8614.meta, new_array__8615, null)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__8616 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8617 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8618 = this;
  return new cljs.core.Vector(meta, this__8618.array, this__8618.__hash)
};
cljs.core.Vector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8619 = this;
  return this__8619.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8620 = this;
  if(function() {
    var and__3822__auto____8621 = 0 <= n;
    if(and__3822__auto____8621) {
      return n < this__8620.array.length
    }else {
      return and__3822__auto____8621
    }
  }()) {
    return this__8620.array[n]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8622 = this;
  if(function() {
    var and__3822__auto____8623 = 0 <= n;
    if(and__3822__auto____8623) {
      return n < this__8622.array.length
    }else {
      return and__3822__auto____8623
    }
  }()) {
    return this__8622.array[n]
  }else {
    return not_found
  }
};
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8624 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__8624.meta)
};
cljs.core.Vector;
cljs.core.Vector.EMPTY = new cljs.core.Vector(null, [], 0);
cljs.core.Vector.fromArray = function(xs) {
  return new cljs.core.Vector(null, xs, null)
};
cljs.core.VectorNode = function(edit, arr) {
  this.edit = edit;
  this.arr = arr
};
cljs.core.VectorNode.cljs$lang$type = true;
cljs.core.VectorNode.cljs$lang$ctorPrSeq = function(this__2310__auto__) {
  return cljs.core.list.call(null, "cljs.core/VectorNode")
};
cljs.core.VectorNode;
cljs.core.pv_fresh_node = function pv_fresh_node(edit) {
  return new cljs.core.VectorNode(edit, cljs.core.make_array.call(null, 32))
};
cljs.core.pv_aget = function pv_aget(node, idx) {
  return node.arr[idx]
};
cljs.core.pv_aset = function pv_aset(node, idx, val) {
  return node.arr[idx] = val
};
cljs.core.pv_clone_node = function pv_clone_node(node) {
  return new cljs.core.VectorNode(node.edit, node.arr.slice())
};
cljs.core.tail_off = function tail_off(pv) {
  var cnt__8627 = pv.cnt;
  if(cnt__8627 < 32) {
    return 0
  }else {
    return cnt__8627 - 1 >>> 5 << 5
  }
};
cljs.core.new_path = function new_path(edit, level, node) {
  var ll__8633 = level;
  var ret__8634 = node;
  while(true) {
    if(ll__8633 === 0) {
      return ret__8634
    }else {
      var embed__8635 = ret__8634;
      var r__8636 = cljs.core.pv_fresh_node.call(null, edit);
      var ___8637 = cljs.core.pv_aset.call(null, r__8636, 0, embed__8635);
      var G__8638 = ll__8633 - 5;
      var G__8639 = r__8636;
      ll__8633 = G__8638;
      ret__8634 = G__8639;
      continue
    }
    break
  }
};
cljs.core.push_tail = function push_tail(pv, level, parent, tailnode) {
  var ret__8645 = cljs.core.pv_clone_node.call(null, parent);
  var subidx__8646 = pv.cnt - 1 >>> level & 31;
  if(5 === level) {
    cljs.core.pv_aset.call(null, ret__8645, subidx__8646, tailnode);
    return ret__8645
  }else {
    var child__8647 = cljs.core.pv_aget.call(null, parent, subidx__8646);
    if(!(child__8647 == null)) {
      var node_to_insert__8648 = push_tail.call(null, pv, level - 5, child__8647, tailnode);
      cljs.core.pv_aset.call(null, ret__8645, subidx__8646, node_to_insert__8648);
      return ret__8645
    }else {
      var node_to_insert__8649 = cljs.core.new_path.call(null, null, level - 5, tailnode);
      cljs.core.pv_aset.call(null, ret__8645, subidx__8646, node_to_insert__8649);
      return ret__8645
    }
  }
};
cljs.core.array_for = function array_for(pv, i) {
  if(function() {
    var and__3822__auto____8653 = 0 <= i;
    if(and__3822__auto____8653) {
      return i < pv.cnt
    }else {
      return and__3822__auto____8653
    }
  }()) {
    if(i >= cljs.core.tail_off.call(null, pv)) {
      return pv.tail
    }else {
      var node__8654 = pv.root;
      var level__8655 = pv.shift;
      while(true) {
        if(level__8655 > 0) {
          var G__8656 = cljs.core.pv_aget.call(null, node__8654, i >>> level__8655 & 31);
          var G__8657 = level__8655 - 5;
          node__8654 = G__8656;
          level__8655 = G__8657;
          continue
        }else {
          return node__8654.arr
        }
        break
      }
    }
  }else {
    throw new Error([cljs.core.str("No item "), cljs.core.str(i), cljs.core.str(" in vector of length "), cljs.core.str(pv.cnt)].join(""));
  }
};
cljs.core.do_assoc = function do_assoc(pv, level, node, i, val) {
  var ret__8660 = cljs.core.pv_clone_node.call(null, node);
  if(level === 0) {
    cljs.core.pv_aset.call(null, ret__8660, i & 31, val);
    return ret__8660
  }else {
    var subidx__8661 = i >>> level & 31;
    cljs.core.pv_aset.call(null, ret__8660, subidx__8661, do_assoc.call(null, pv, level - 5, cljs.core.pv_aget.call(null, node, subidx__8661), i, val));
    return ret__8660
  }
};
cljs.core.pop_tail = function pop_tail(pv, level, node) {
  var subidx__8667 = pv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__8668 = pop_tail.call(null, pv, level - 5, cljs.core.pv_aget.call(null, node, subidx__8667));
    if(function() {
      var and__3822__auto____8669 = new_child__8668 == null;
      if(and__3822__auto____8669) {
        return subidx__8667 === 0
      }else {
        return and__3822__auto____8669
      }
    }()) {
      return null
    }else {
      var ret__8670 = cljs.core.pv_clone_node.call(null, node);
      cljs.core.pv_aset.call(null, ret__8670, subidx__8667, new_child__8668);
      return ret__8670
    }
  }else {
    if(subidx__8667 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        var ret__8671 = cljs.core.pv_clone_node.call(null, node);
        cljs.core.pv_aset.call(null, ret__8671, subidx__8667, null);
        return ret__8671
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector = function(meta, cnt, shift, root, tail, __hash) {
  this.meta = meta;
  this.cnt = cnt;
  this.shift = shift;
  this.root = root;
  this.tail = tail;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 167668511
};
cljs.core.PersistentVector.cljs$lang$type = true;
cljs.core.PersistentVector.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentVector")
};
cljs.core.PersistentVector.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__8674 = this;
  return new cljs.core.TransientVector(this__8674.cnt, this__8674.shift, cljs.core.tv_editable_root.call(null, this__8674.root), cljs.core.tv_editable_tail.call(null, this__8674.tail))
};
cljs.core.PersistentVector.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8675 = this;
  var h__2192__auto____8676 = this__8675.__hash;
  if(!(h__2192__auto____8676 == null)) {
    return h__2192__auto____8676
  }else {
    var h__2192__auto____8677 = cljs.core.hash_coll.call(null, coll);
    this__8675.__hash = h__2192__auto____8677;
    return h__2192__auto____8677
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8678 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.PersistentVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8679 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.PersistentVector.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8680 = this;
  if(function() {
    var and__3822__auto____8681 = 0 <= k;
    if(and__3822__auto____8681) {
      return k < this__8680.cnt
    }else {
      return and__3822__auto____8681
    }
  }()) {
    if(cljs.core.tail_off.call(null, coll) <= k) {
      var new_tail__8682 = this__8680.tail.slice();
      new_tail__8682[k & 31] = v;
      return new cljs.core.PersistentVector(this__8680.meta, this__8680.cnt, this__8680.shift, this__8680.root, new_tail__8682, null)
    }else {
      return new cljs.core.PersistentVector(this__8680.meta, this__8680.cnt, this__8680.shift, cljs.core.do_assoc.call(null, coll, this__8680.shift, this__8680.root, k, v), this__8680.tail, null)
    }
  }else {
    if(k === this__8680.cnt) {
      return coll.cljs$core$ICollection$_conj$arity$2(coll, v)
    }else {
      if("\ufdd0'else") {
        throw new Error([cljs.core.str("Index "), cljs.core.str(k), cljs.core.str(" out of bounds  [0,"), cljs.core.str(this__8680.cnt), cljs.core.str("]")].join(""));
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentVector.prototype.call = function() {
  var G__8730 = null;
  var G__8730__2 = function(this_sym8683, k) {
    var this__8685 = this;
    var this_sym8683__8686 = this;
    var coll__8687 = this_sym8683__8686;
    return coll__8687.cljs$core$ILookup$_lookup$arity$2(coll__8687, k)
  };
  var G__8730__3 = function(this_sym8684, k, not_found) {
    var this__8685 = this;
    var this_sym8684__8688 = this;
    var coll__8689 = this_sym8684__8688;
    return coll__8689.cljs$core$ILookup$_lookup$arity$3(coll__8689, k, not_found)
  };
  G__8730 = function(this_sym8684, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8730__2.call(this, this_sym8684, k);
      case 3:
        return G__8730__3.call(this, this_sym8684, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8730
}();
cljs.core.PersistentVector.prototype.apply = function(this_sym8672, args8673) {
  var this__8690 = this;
  return this_sym8672.call.apply(this_sym8672, [this_sym8672].concat(args8673.slice()))
};
cljs.core.PersistentVector.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(v, f, init) {
  var this__8691 = this;
  var step_init__8692 = [0, init];
  var i__8693 = 0;
  while(true) {
    if(i__8693 < this__8691.cnt) {
      var arr__8694 = cljs.core.array_for.call(null, v, i__8693);
      var len__8695 = arr__8694.length;
      var init__8699 = function() {
        var j__8696 = 0;
        var init__8697 = step_init__8692[1];
        while(true) {
          if(j__8696 < len__8695) {
            var init__8698 = f.call(null, init__8697, j__8696 + i__8693, arr__8694[j__8696]);
            if(cljs.core.reduced_QMARK_.call(null, init__8698)) {
              return init__8698
            }else {
              var G__8731 = j__8696 + 1;
              var G__8732 = init__8698;
              j__8696 = G__8731;
              init__8697 = G__8732;
              continue
            }
          }else {
            step_init__8692[0] = len__8695;
            step_init__8692[1] = init__8697;
            return init__8697
          }
          break
        }
      }();
      if(cljs.core.reduced_QMARK_.call(null, init__8699)) {
        return cljs.core.deref.call(null, init__8699)
      }else {
        var G__8733 = i__8693 + step_init__8692[0];
        i__8693 = G__8733;
        continue
      }
    }else {
      return step_init__8692[1]
    }
    break
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8700 = this;
  if(this__8700.cnt - cljs.core.tail_off.call(null, coll) < 32) {
    var new_tail__8701 = this__8700.tail.slice();
    new_tail__8701.push(o);
    return new cljs.core.PersistentVector(this__8700.meta, this__8700.cnt + 1, this__8700.shift, this__8700.root, new_tail__8701, null)
  }else {
    var root_overflow_QMARK___8702 = this__8700.cnt >>> 5 > 1 << this__8700.shift;
    var new_shift__8703 = root_overflow_QMARK___8702 ? this__8700.shift + 5 : this__8700.shift;
    var new_root__8705 = root_overflow_QMARK___8702 ? function() {
      var n_r__8704 = cljs.core.pv_fresh_node.call(null, null);
      cljs.core.pv_aset.call(null, n_r__8704, 0, this__8700.root);
      cljs.core.pv_aset.call(null, n_r__8704, 1, cljs.core.new_path.call(null, null, this__8700.shift, new cljs.core.VectorNode(null, this__8700.tail)));
      return n_r__8704
    }() : cljs.core.push_tail.call(null, coll, this__8700.shift, this__8700.root, new cljs.core.VectorNode(null, this__8700.tail));
    return new cljs.core.PersistentVector(this__8700.meta, this__8700.cnt + 1, new_shift__8703, new_root__8705, [o], null)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__8706 = this;
  if(this__8706.cnt > 0) {
    return new cljs.core.RSeq(coll, this__8706.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_key$arity$1 = function(coll) {
  var this__8707 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 0)
};
cljs.core.PersistentVector.prototype.cljs$core$IMapEntry$_val$arity$1 = function(coll) {
  var this__8708 = this;
  return coll.cljs$core$IIndexed$_nth$arity$2(coll, 1)
};
cljs.core.PersistentVector.prototype.toString = function() {
  var this__8709 = this;
  var this__8710 = this;
  return cljs.core.pr_str.call(null, this__8710)
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$2 = function(v, f) {
  var this__8711 = this;
  return cljs.core.ci_reduce.call(null, v, f)
};
cljs.core.PersistentVector.prototype.cljs$core$IReduce$_reduce$arity$3 = function(v, f, start) {
  var this__8712 = this;
  return cljs.core.ci_reduce.call(null, v, f, start)
};
cljs.core.PersistentVector.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8713 = this;
  if(this__8713.cnt === 0) {
    return null
  }else {
    return cljs.core.chunked_seq.call(null, coll, 0, 0)
  }
};
cljs.core.PersistentVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8714 = this;
  return this__8714.cnt
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8715 = this;
  if(this__8715.cnt > 0) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, this__8715.cnt - 1)
  }else {
    return null
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8716 = this;
  if(this__8716.cnt === 0) {
    throw new Error("Can't pop empty vector");
  }else {
    if(1 === this__8716.cnt) {
      return cljs.core._with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__8716.meta)
    }else {
      if(1 < this__8716.cnt - cljs.core.tail_off.call(null, coll)) {
        return new cljs.core.PersistentVector(this__8716.meta, this__8716.cnt - 1, this__8716.shift, this__8716.root, this__8716.tail.slice(0, -1), null)
      }else {
        if("\ufdd0'else") {
          var new_tail__8717 = cljs.core.array_for.call(null, coll, this__8716.cnt - 2);
          var nr__8718 = cljs.core.pop_tail.call(null, coll, this__8716.shift, this__8716.root);
          var new_root__8719 = nr__8718 == null ? cljs.core.PersistentVector.EMPTY_NODE : nr__8718;
          var cnt_1__8720 = this__8716.cnt - 1;
          if(function() {
            var and__3822__auto____8721 = 5 < this__8716.shift;
            if(and__3822__auto____8721) {
              return cljs.core.pv_aget.call(null, new_root__8719, 1) == null
            }else {
              return and__3822__auto____8721
            }
          }()) {
            return new cljs.core.PersistentVector(this__8716.meta, cnt_1__8720, this__8716.shift - 5, cljs.core.pv_aget.call(null, new_root__8719, 0), new_tail__8717, null)
          }else {
            return new cljs.core.PersistentVector(this__8716.meta, cnt_1__8720, this__8716.shift, new_root__8719, new_tail__8717, null)
          }
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__8722 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.PersistentVector.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8723 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentVector.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8724 = this;
  return new cljs.core.PersistentVector(meta, this__8724.cnt, this__8724.shift, this__8724.root, this__8724.tail, this__8724.__hash)
};
cljs.core.PersistentVector.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8725 = this;
  return this__8725.meta
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8726 = this;
  return cljs.core.array_for.call(null, coll, n)[n & 31]
};
cljs.core.PersistentVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8727 = this;
  if(function() {
    var and__3822__auto____8728 = 0 <= n;
    if(and__3822__auto____8728) {
      return n < this__8727.cnt
    }else {
      return and__3822__auto____8728
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.PersistentVector.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8729 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__8729.meta)
};
cljs.core.PersistentVector;
cljs.core.PersistentVector.EMPTY_NODE = cljs.core.pv_fresh_node.call(null, null);
cljs.core.PersistentVector.EMPTY = new cljs.core.PersistentVector(null, 0, 5, cljs.core.PersistentVector.EMPTY_NODE, [], 0);
cljs.core.PersistentVector.fromArray = function(xs, no_clone) {
  var l__8734 = xs.length;
  var xs__8735 = no_clone === true ? xs : xs.slice();
  if(l__8734 < 32) {
    return new cljs.core.PersistentVector(null, l__8734, 5, cljs.core.PersistentVector.EMPTY_NODE, xs__8735, null)
  }else {
    var node__8736 = xs__8735.slice(0, 32);
    var v__8737 = new cljs.core.PersistentVector(null, 32, 5, cljs.core.PersistentVector.EMPTY_NODE, node__8736, null);
    var i__8738 = 32;
    var out__8739 = cljs.core._as_transient.call(null, v__8737);
    while(true) {
      if(i__8738 < l__8734) {
        var G__8740 = i__8738 + 1;
        var G__8741 = cljs.core.conj_BANG_.call(null, out__8739, xs__8735[i__8738]);
        i__8738 = G__8740;
        out__8739 = G__8741;
        continue
      }else {
        return cljs.core.persistent_BANG_.call(null, out__8739)
      }
      break
    }
  }
};
cljs.core.vec = function vec(coll) {
  return cljs.core._persistent_BANG_.call(null, cljs.core.reduce.call(null, cljs.core._conj_BANG_, cljs.core._as_transient.call(null, cljs.core.PersistentVector.EMPTY), coll))
};
cljs.core.vector = function() {
  var vector__delegate = function(args) {
    return cljs.core.vec.call(null, args)
  };
  var vector = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return vector__delegate.call(this, args)
  };
  vector.cljs$lang$maxFixedArity = 0;
  vector.cljs$lang$applyTo = function(arglist__8742) {
    var args = cljs.core.seq(arglist__8742);
    return vector__delegate(args)
  };
  vector.cljs$lang$arity$variadic = vector__delegate;
  return vector
}();
cljs.core.ChunkedSeq = function(vec, node, i, off, meta) {
  this.vec = vec;
  this.node = node;
  this.i = i;
  this.off = off;
  this.meta = meta;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 27525356
};
cljs.core.ChunkedSeq.cljs$lang$type = true;
cljs.core.ChunkedSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/ChunkedSeq")
};
cljs.core.ChunkedSeq.prototype.cljs$core$INext$_next$arity$1 = function(coll) {
  var this__8743 = this;
  if(this__8743.off + 1 < this__8743.node.length) {
    var s__8744 = cljs.core.chunked_seq.call(null, this__8743.vec, this__8743.node, this__8743.i, this__8743.off + 1);
    if(s__8744 == null) {
      return null
    }else {
      return s__8744
    }
  }else {
    return coll.cljs$core$IChunkedNext$_chunked_next$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8745 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8746 = this;
  return coll
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8747 = this;
  return this__8747.node[this__8747.off]
};
cljs.core.ChunkedSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8748 = this;
  if(this__8748.off + 1 < this__8748.node.length) {
    var s__8749 = cljs.core.chunked_seq.call(null, this__8748.vec, this__8748.node, this__8748.i, this__8748.off + 1);
    if(s__8749 == null) {
      return cljs.core.List.EMPTY
    }else {
      return s__8749
    }
  }else {
    return coll.cljs$core$IChunkedSeq$_chunked_rest$arity$1(coll)
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedNext$_chunked_next$arity$1 = function(coll) {
  var this__8750 = this;
  var l__8751 = this__8750.node.length;
  var s__8752 = this__8750.i + l__8751 < cljs.core._count.call(null, this__8750.vec) ? cljs.core.chunked_seq.call(null, this__8750.vec, this__8750.i + l__8751, 0) : null;
  if(s__8752 == null) {
    return null
  }else {
    return s__8752
  }
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8753 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, m) {
  var this__8754 = this;
  return cljs.core.chunked_seq.call(null, this__8754.vec, this__8754.node, this__8754.i, this__8754.off, m)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IWithMeta$_meta$arity$1 = function(coll) {
  var this__8755 = this;
  return this__8755.meta
};
cljs.core.ChunkedSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8756 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.EMPTY, this__8756.meta)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_first$arity$1 = function(coll) {
  var this__8757 = this;
  return cljs.core.array_chunk.call(null, this__8757.node, this__8757.off)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IChunkedSeq$_chunked_rest$arity$1 = function(coll) {
  var this__8758 = this;
  var l__8759 = this__8758.node.length;
  var s__8760 = this__8758.i + l__8759 < cljs.core._count.call(null, this__8758.vec) ? cljs.core.chunked_seq.call(null, this__8758.vec, this__8758.i + l__8759, 0) : null;
  if(s__8760 == null) {
    return cljs.core.List.EMPTY
  }else {
    return s__8760
  }
};
cljs.core.ChunkedSeq;
cljs.core.chunked_seq = function() {
  var chunked_seq = null;
  var chunked_seq__3 = function(vec, i, off) {
    return chunked_seq.call(null, vec, cljs.core.array_for.call(null, vec, i), i, off, null)
  };
  var chunked_seq__4 = function(vec, node, i, off) {
    return chunked_seq.call(null, vec, node, i, off, null)
  };
  var chunked_seq__5 = function(vec, node, i, off, meta) {
    return new cljs.core.ChunkedSeq(vec, node, i, off, meta)
  };
  chunked_seq = function(vec, node, i, off, meta) {
    switch(arguments.length) {
      case 3:
        return chunked_seq__3.call(this, vec, node, i);
      case 4:
        return chunked_seq__4.call(this, vec, node, i, off);
      case 5:
        return chunked_seq__5.call(this, vec, node, i, off, meta)
    }
    throw"Invalid arity: " + arguments.length;
  };
  chunked_seq.cljs$lang$arity$3 = chunked_seq__3;
  chunked_seq.cljs$lang$arity$4 = chunked_seq__4;
  chunked_seq.cljs$lang$arity$5 = chunked_seq__5;
  return chunked_seq
}();
cljs.core.Subvec = function(meta, v, start, end, __hash) {
  this.meta = meta;
  this.v = v;
  this.start = start;
  this.end = end;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32400159
};
cljs.core.Subvec.cljs$lang$type = true;
cljs.core.Subvec.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Subvec")
};
cljs.core.Subvec.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8763 = this;
  var h__2192__auto____8764 = this__8763.__hash;
  if(!(h__2192__auto____8764 == null)) {
    return h__2192__auto____8764
  }else {
    var h__2192__auto____8765 = cljs.core.hash_coll.call(null, coll);
    this__8763.__hash = h__2192__auto____8765;
    return h__2192__auto____8765
  }
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8766 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8767 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, key, val) {
  var this__8768 = this;
  var v_pos__8769 = this__8768.start + key;
  return new cljs.core.Subvec(this__8768.meta, cljs.core._assoc.call(null, this__8768.v, v_pos__8769, val), this__8768.start, this__8768.end > v_pos__8769 + 1 ? this__8768.end : v_pos__8769 + 1, null)
};
cljs.core.Subvec.prototype.call = function() {
  var G__8795 = null;
  var G__8795__2 = function(this_sym8770, k) {
    var this__8772 = this;
    var this_sym8770__8773 = this;
    var coll__8774 = this_sym8770__8773;
    return coll__8774.cljs$core$ILookup$_lookup$arity$2(coll__8774, k)
  };
  var G__8795__3 = function(this_sym8771, k, not_found) {
    var this__8772 = this;
    var this_sym8771__8775 = this;
    var coll__8776 = this_sym8771__8775;
    return coll__8776.cljs$core$ILookup$_lookup$arity$3(coll__8776, k, not_found)
  };
  G__8795 = function(this_sym8771, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8795__2.call(this, this_sym8771, k);
      case 3:
        return G__8795__3.call(this, this_sym8771, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8795
}();
cljs.core.Subvec.prototype.apply = function(this_sym8761, args8762) {
  var this__8777 = this;
  return this_sym8761.call.apply(this_sym8761, [this_sym8761].concat(args8762.slice()))
};
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8778 = this;
  return new cljs.core.Subvec(this__8778.meta, cljs.core._assoc_n.call(null, this__8778.v, this__8778.end, o), this__8778.start, this__8778.end + 1, null)
};
cljs.core.Subvec.prototype.toString = function() {
  var this__8779 = this;
  var this__8780 = this;
  return cljs.core.pr_str.call(null, this__8780)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$2 = function(coll, f) {
  var this__8781 = this;
  return cljs.core.ci_reduce.call(null, coll, f)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce$arity$3 = function(coll, f, start) {
  var this__8782 = this;
  return cljs.core.ci_reduce.call(null, coll, f, start)
};
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8783 = this;
  var subvec_seq__8784 = function subvec_seq(i) {
    if(i === this__8783.end) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__8783.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }, null))
    }
  };
  return subvec_seq__8784.call(null, this__8783.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8785 = this;
  return this__8785.end - this__8785.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8786 = this;
  return cljs.core._nth.call(null, this__8786.v, this__8786.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8787 = this;
  if(this__8787.start === this__8787.end) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__8787.meta, this__8787.v, this__8787.start, this__8787.end - 1, null)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(coll, n, val) {
  var this__8788 = this;
  return coll.cljs$core$IAssociative$_assoc$arity$3(coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8789 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8790 = this;
  return new cljs.core.Subvec(meta, this__8790.v, this__8790.start, this__8790.end, this__8790.__hash)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8791 = this;
  return this__8791.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8792 = this;
  return cljs.core._nth.call(null, this__8792.v, this__8792.start + n)
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8793 = this;
  return cljs.core._nth.call(null, this__8793.v, this__8793.start + n, not_found)
};
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8794 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__8794.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__2 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__3 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end, null)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__2.call(this, v, start);
      case 3:
        return subvec__3.call(this, v, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  subvec.cljs$lang$arity$2 = subvec__2;
  subvec.cljs$lang$arity$3 = subvec__3;
  return subvec
}();
cljs.core.tv_ensure_editable = function tv_ensure_editable(edit, node) {
  if(edit === node.edit) {
    return node
  }else {
    return new cljs.core.VectorNode(edit, node.arr.slice())
  }
};
cljs.core.tv_editable_root = function tv_editable_root(node) {
  return new cljs.core.VectorNode({}, node.arr.slice())
};
cljs.core.tv_editable_tail = function tv_editable_tail(tl) {
  var ret__8797 = cljs.core.make_array.call(null, 32);
  cljs.core.array_copy.call(null, tl, 0, ret__8797, 0, tl.length);
  return ret__8797
};
cljs.core.tv_push_tail = function tv_push_tail(tv, level, parent, tail_node) {
  var ret__8801 = cljs.core.tv_ensure_editable.call(null, tv.root.edit, parent);
  var subidx__8802 = tv.cnt - 1 >>> level & 31;
  cljs.core.pv_aset.call(null, ret__8801, subidx__8802, level === 5 ? tail_node : function() {
    var child__8803 = cljs.core.pv_aget.call(null, ret__8801, subidx__8802);
    if(!(child__8803 == null)) {
      return tv_push_tail.call(null, tv, level - 5, child__8803, tail_node)
    }else {
      return cljs.core.new_path.call(null, tv.root.edit, level - 5, tail_node)
    }
  }());
  return ret__8801
};
cljs.core.tv_pop_tail = function tv_pop_tail(tv, level, node) {
  var node__8808 = cljs.core.tv_ensure_editable.call(null, tv.root.edit, node);
  var subidx__8809 = tv.cnt - 2 >>> level & 31;
  if(level > 5) {
    var new_child__8810 = tv_pop_tail.call(null, tv, level - 5, cljs.core.pv_aget.call(null, node__8808, subidx__8809));
    if(function() {
      var and__3822__auto____8811 = new_child__8810 == null;
      if(and__3822__auto____8811) {
        return subidx__8809 === 0
      }else {
        return and__3822__auto____8811
      }
    }()) {
      return null
    }else {
      cljs.core.pv_aset.call(null, node__8808, subidx__8809, new_child__8810);
      return node__8808
    }
  }else {
    if(subidx__8809 === 0) {
      return null
    }else {
      if("\ufdd0'else") {
        cljs.core.pv_aset.call(null, node__8808, subidx__8809, null);
        return node__8808
      }else {
        return null
      }
    }
  }
};
cljs.core.editable_array_for = function editable_array_for(tv, i) {
  if(function() {
    var and__3822__auto____8816 = 0 <= i;
    if(and__3822__auto____8816) {
      return i < tv.cnt
    }else {
      return and__3822__auto____8816
    }
  }()) {
    if(i >= cljs.core.tail_off.call(null, tv)) {
      return tv.tail
    }else {
      var root__8817 = tv.root;
      var node__8818 = root__8817;
      var level__8819 = tv.shift;
      while(true) {
        if(level__8819 > 0) {
          var G__8820 = cljs.core.tv_ensure_editable.call(null, root__8817.edit, cljs.core.pv_aget.call(null, node__8818, i >>> level__8819 & 31));
          var G__8821 = level__8819 - 5;
          node__8818 = G__8820;
          level__8819 = G__8821;
          continue
        }else {
          return node__8818.arr
        }
        break
      }
    }
  }else {
    throw new Error([cljs.core.str("No item "), cljs.core.str(i), cljs.core.str(" in transient vector of length "), cljs.core.str(tv.cnt)].join(""));
  }
};
cljs.core.TransientVector = function(cnt, shift, root, tail) {
  this.cnt = cnt;
  this.shift = shift;
  this.root = root;
  this.tail = tail;
  this.cljs$lang$protocol_mask$partition0$ = 275;
  this.cljs$lang$protocol_mask$partition1$ = 22
};
cljs.core.TransientVector.cljs$lang$type = true;
cljs.core.TransientVector.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/TransientVector")
};
cljs.core.TransientVector.prototype.call = function() {
  var G__8861 = null;
  var G__8861__2 = function(this_sym8824, k) {
    var this__8826 = this;
    var this_sym8824__8827 = this;
    var coll__8828 = this_sym8824__8827;
    return coll__8828.cljs$core$ILookup$_lookup$arity$2(coll__8828, k)
  };
  var G__8861__3 = function(this_sym8825, k, not_found) {
    var this__8826 = this;
    var this_sym8825__8829 = this;
    var coll__8830 = this_sym8825__8829;
    return coll__8830.cljs$core$ILookup$_lookup$arity$3(coll__8830, k, not_found)
  };
  G__8861 = function(this_sym8825, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8861__2.call(this, this_sym8825, k);
      case 3:
        return G__8861__3.call(this, this_sym8825, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8861
}();
cljs.core.TransientVector.prototype.apply = function(this_sym8822, args8823) {
  var this__8831 = this;
  return this_sym8822.call.apply(this_sym8822, [this_sym8822].concat(args8823.slice()))
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8832 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, null)
};
cljs.core.TransientVector.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8833 = this;
  return coll.cljs$core$IIndexed$_nth$arity$3(coll, k, not_found)
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$2 = function(coll, n) {
  var this__8834 = this;
  if(this__8834.root.edit) {
    return cljs.core.array_for.call(null, coll, n)[n & 31]
  }else {
    throw new Error("nth after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$IIndexed$_nth$arity$3 = function(coll, n, not_found) {
  var this__8835 = this;
  if(function() {
    var and__3822__auto____8836 = 0 <= n;
    if(and__3822__auto____8836) {
      return n < this__8835.cnt
    }else {
      return and__3822__auto____8836
    }
  }()) {
    return coll.cljs$core$IIndexed$_nth$arity$2(coll, n)
  }else {
    return not_found
  }
};
cljs.core.TransientVector.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8837 = this;
  if(this__8837.root.edit) {
    return this__8837.cnt
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3 = function(tcoll, n, val) {
  var this__8838 = this;
  if(this__8838.root.edit) {
    if(function() {
      var and__3822__auto____8839 = 0 <= n;
      if(and__3822__auto____8839) {
        return n < this__8838.cnt
      }else {
        return and__3822__auto____8839
      }
    }()) {
      if(cljs.core.tail_off.call(null, tcoll) <= n) {
        this__8838.tail[n & 31] = val;
        return tcoll
      }else {
        var new_root__8844 = function go(level, node) {
          var node__8842 = cljs.core.tv_ensure_editable.call(null, this__8838.root.edit, node);
          if(level === 0) {
            cljs.core.pv_aset.call(null, node__8842, n & 31, val);
            return node__8842
          }else {
            var subidx__8843 = n >>> level & 31;
            cljs.core.pv_aset.call(null, node__8842, subidx__8843, go.call(null, level - 5, cljs.core.pv_aget.call(null, node__8842, subidx__8843)));
            return node__8842
          }
        }.call(null, this__8838.shift, this__8838.root);
        this__8838.root = new_root__8844;
        return tcoll
      }
    }else {
      if(n === this__8838.cnt) {
        return tcoll.cljs$core$ITransientCollection$_conj_BANG_$arity$2(tcoll, val)
      }else {
        if("\ufdd0'else") {
          throw new Error([cljs.core.str("Index "), cljs.core.str(n), cljs.core.str(" out of bounds for TransientVector of length"), cljs.core.str(this__8838.cnt)].join(""));
        }else {
          return null
        }
      }
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientVector$_pop_BANG_$arity$1 = function(tcoll) {
  var this__8845 = this;
  if(this__8845.root.edit) {
    if(this__8845.cnt === 0) {
      throw new Error("Can't pop empty vector");
    }else {
      if(1 === this__8845.cnt) {
        this__8845.cnt = 0;
        return tcoll
      }else {
        if((this__8845.cnt - 1 & 31) > 0) {
          this__8845.cnt = this__8845.cnt - 1;
          return tcoll
        }else {
          if("\ufdd0'else") {
            var new_tail__8846 = cljs.core.editable_array_for.call(null, tcoll, this__8845.cnt - 2);
            var new_root__8848 = function() {
              var nr__8847 = cljs.core.tv_pop_tail.call(null, tcoll, this__8845.shift, this__8845.root);
              if(!(nr__8847 == null)) {
                return nr__8847
              }else {
                return new cljs.core.VectorNode(this__8845.root.edit, cljs.core.make_array.call(null, 32))
              }
            }();
            if(function() {
              var and__3822__auto____8849 = 5 < this__8845.shift;
              if(and__3822__auto____8849) {
                return cljs.core.pv_aget.call(null, new_root__8848, 1) == null
              }else {
                return and__3822__auto____8849
              }
            }()) {
              var new_root__8850 = cljs.core.tv_ensure_editable.call(null, this__8845.root.edit, cljs.core.pv_aget.call(null, new_root__8848, 0));
              this__8845.root = new_root__8850;
              this__8845.shift = this__8845.shift - 5;
              this__8845.cnt = this__8845.cnt - 1;
              this__8845.tail = new_tail__8846;
              return tcoll
            }else {
              this__8845.root = new_root__8848;
              this__8845.cnt = this__8845.cnt - 1;
              this__8845.tail = new_tail__8846;
              return tcoll
            }
          }else {
            return null
          }
        }
      }
    }
  }else {
    throw new Error("pop! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__8851 = this;
  return tcoll.cljs$core$ITransientVector$_assoc_n_BANG_$arity$3(tcoll, key, val)
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__8852 = this;
  if(this__8852.root.edit) {
    if(this__8852.cnt - cljs.core.tail_off.call(null, tcoll) < 32) {
      this__8852.tail[this__8852.cnt & 31] = o;
      this__8852.cnt = this__8852.cnt + 1;
      return tcoll
    }else {
      var tail_node__8853 = new cljs.core.VectorNode(this__8852.root.edit, this__8852.tail);
      var new_tail__8854 = cljs.core.make_array.call(null, 32);
      new_tail__8854[0] = o;
      this__8852.tail = new_tail__8854;
      if(this__8852.cnt >>> 5 > 1 << this__8852.shift) {
        var new_root_array__8855 = cljs.core.make_array.call(null, 32);
        var new_shift__8856 = this__8852.shift + 5;
        new_root_array__8855[0] = this__8852.root;
        new_root_array__8855[1] = cljs.core.new_path.call(null, this__8852.root.edit, this__8852.shift, tail_node__8853);
        this__8852.root = new cljs.core.VectorNode(this__8852.root.edit, new_root_array__8855);
        this__8852.shift = new_shift__8856;
        this__8852.cnt = this__8852.cnt + 1;
        return tcoll
      }else {
        var new_root__8857 = cljs.core.tv_push_tail.call(null, tcoll, this__8852.shift, this__8852.root, tail_node__8853);
        this__8852.root = new_root__8857;
        this__8852.cnt = this__8852.cnt + 1;
        return tcoll
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientVector.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__8858 = this;
  if(this__8858.root.edit) {
    this__8858.root.edit = null;
    var len__8859 = this__8858.cnt - cljs.core.tail_off.call(null, tcoll);
    var trimmed_tail__8860 = cljs.core.make_array.call(null, len__8859);
    cljs.core.array_copy.call(null, this__8858.tail, 0, trimmed_tail__8860, 0, len__8859);
    return new cljs.core.PersistentVector(null, this__8858.cnt, this__8858.shift, this__8858.root, trimmed_tail__8860, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientVector;
cljs.core.PersistentQueueSeq = function(meta, front, rear, __hash) {
  this.meta = meta;
  this.front = front;
  this.rear = rear;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850572
};
cljs.core.PersistentQueueSeq.cljs$lang$type = true;
cljs.core.PersistentQueueSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentQueueSeq")
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8862 = this;
  var h__2192__auto____8863 = this__8862.__hash;
  if(!(h__2192__auto____8863 == null)) {
    return h__2192__auto____8863
  }else {
    var h__2192__auto____8864 = cljs.core.hash_coll.call(null, coll);
    this__8862.__hash = h__2192__auto____8864;
    return h__2192__auto____8864
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8865 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.toString = function() {
  var this__8866 = this;
  var this__8867 = this;
  return cljs.core.pr_str.call(null, this__8867)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8868 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8869 = this;
  return cljs.core._first.call(null, this__8869.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8870 = this;
  var temp__3971__auto____8871 = cljs.core.next.call(null, this__8870.front);
  if(temp__3971__auto____8871) {
    var f1__8872 = temp__3971__auto____8871;
    return new cljs.core.PersistentQueueSeq(this__8870.meta, f1__8872, this__8870.rear, null)
  }else {
    if(this__8870.rear == null) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__8870.meta, this__8870.rear, null, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8873 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8874 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__8874.front, this__8874.rear, this__8874.__hash)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8875 = this;
  return this__8875.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8876 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__8876.meta)
};
cljs.core.PersistentQueueSeq;
cljs.core.PersistentQueue = function(meta, count, front, rear, __hash) {
  this.meta = meta;
  this.count = count;
  this.front = front;
  this.rear = rear;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31858766
};
cljs.core.PersistentQueue.cljs$lang$type = true;
cljs.core.PersistentQueue.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentQueue")
};
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8877 = this;
  var h__2192__auto____8878 = this__8877.__hash;
  if(!(h__2192__auto____8878 == null)) {
    return h__2192__auto____8878
  }else {
    var h__2192__auto____8879 = cljs.core.hash_coll.call(null, coll);
    this__8877.__hash = h__2192__auto____8879;
    return h__2192__auto____8879
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__8880 = this;
  if(cljs.core.truth_(this__8880.front)) {
    return new cljs.core.PersistentQueue(this__8880.meta, this__8880.count + 1, this__8880.front, cljs.core.conj.call(null, function() {
      var or__3824__auto____8881 = this__8880.rear;
      if(cljs.core.truth_(or__3824__auto____8881)) {
        return or__3824__auto____8881
      }else {
        return cljs.core.PersistentVector.EMPTY
      }
    }(), o), null)
  }else {
    return new cljs.core.PersistentQueue(this__8880.meta, this__8880.count + 1, cljs.core.conj.call(null, this__8880.front, o), cljs.core.PersistentVector.EMPTY, null)
  }
};
cljs.core.PersistentQueue.prototype.toString = function() {
  var this__8882 = this;
  var this__8883 = this;
  return cljs.core.pr_str.call(null, this__8883)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8884 = this;
  var rear__8885 = cljs.core.seq.call(null, this__8884.rear);
  if(cljs.core.truth_(function() {
    var or__3824__auto____8886 = this__8884.front;
    if(cljs.core.truth_(or__3824__auto____8886)) {
      return or__3824__auto____8886
    }else {
      return rear__8885
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__8884.front, cljs.core.seq.call(null, rear__8885), null)
  }else {
    return null
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8887 = this;
  return this__8887.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek$arity$1 = function(coll) {
  var this__8888 = this;
  return cljs.core._first.call(null, this__8888.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop$arity$1 = function(coll) {
  var this__8889 = this;
  if(cljs.core.truth_(this__8889.front)) {
    var temp__3971__auto____8890 = cljs.core.next.call(null, this__8889.front);
    if(temp__3971__auto____8890) {
      var f1__8891 = temp__3971__auto____8890;
      return new cljs.core.PersistentQueue(this__8889.meta, this__8889.count - 1, f1__8891, this__8889.rear, null)
    }else {
      return new cljs.core.PersistentQueue(this__8889.meta, this__8889.count - 1, cljs.core.seq.call(null, this__8889.rear), cljs.core.PersistentVector.EMPTY, null)
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__8892 = this;
  return cljs.core.first.call(null, this__8892.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__8893 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8894 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8895 = this;
  return new cljs.core.PersistentQueue(meta, this__8895.count, this__8895.front, this__8895.rear, this__8895.__hash)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8896 = this;
  return this__8896.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8897 = this;
  return cljs.core.PersistentQueue.EMPTY
};
cljs.core.PersistentQueue;
cljs.core.PersistentQueue.EMPTY = new cljs.core.PersistentQueue(null, 0, null, cljs.core.PersistentVector.EMPTY, 0);
cljs.core.NeverEquiv = function() {
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 2097152
};
cljs.core.NeverEquiv.cljs$lang$type = true;
cljs.core.NeverEquiv.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/NeverEquiv")
};
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var this__8898 = this;
  return false
};
cljs.core.NeverEquiv;
cljs.core.never_equiv = new cljs.core.NeverEquiv;
cljs.core.equiv_map = function equiv_map(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.map_QMARK_.call(null, y) ? cljs.core.count.call(null, x) === cljs.core.count.call(null, y) ? cljs.core.every_QMARK_.call(null, cljs.core.identity, cljs.core.map.call(null, function(xkv) {
    return cljs.core._EQ_.call(null, cljs.core._lookup.call(null, y, cljs.core.first.call(null, xkv), cljs.core.never_equiv), cljs.core.second.call(null, xkv))
  }, x)) : null : null)
};
cljs.core.scan_array = function scan_array(incr, k, array) {
  var len__8901 = array.length;
  var i__8902 = 0;
  while(true) {
    if(i__8902 < len__8901) {
      if(k === array[i__8902]) {
        return i__8902
      }else {
        var G__8903 = i__8902 + incr;
        i__8902 = G__8903;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.obj_map_compare_keys = function obj_map_compare_keys(a, b) {
  var a__8906 = cljs.core.hash.call(null, a);
  var b__8907 = cljs.core.hash.call(null, b);
  if(a__8906 < b__8907) {
    return-1
  }else {
    if(a__8906 > b__8907) {
      return 1
    }else {
      if("\ufdd0'else") {
        return 0
      }else {
        return null
      }
    }
  }
};
cljs.core.obj_map__GT_hash_map = function obj_map__GT_hash_map(m, k, v) {
  var ks__8915 = m.keys;
  var len__8916 = ks__8915.length;
  var so__8917 = m.strobj;
  var out__8918 = cljs.core.with_meta.call(null, cljs.core.PersistentHashMap.EMPTY, cljs.core.meta.call(null, m));
  var i__8919 = 0;
  var out__8920 = cljs.core.transient$.call(null, out__8918);
  while(true) {
    if(i__8919 < len__8916) {
      var k__8921 = ks__8915[i__8919];
      var G__8922 = i__8919 + 1;
      var G__8923 = cljs.core.assoc_BANG_.call(null, out__8920, k__8921, so__8917[k__8921]);
      i__8919 = G__8922;
      out__8920 = G__8923;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, cljs.core.assoc_BANG_.call(null, out__8920, k, v))
    }
    break
  }
};
cljs.core.obj_clone = function obj_clone(obj, ks) {
  var new_obj__8929 = {};
  var l__8930 = ks.length;
  var i__8931 = 0;
  while(true) {
    if(i__8931 < l__8930) {
      var k__8932 = ks[i__8931];
      new_obj__8929[k__8932] = obj[k__8932];
      var G__8933 = i__8931 + 1;
      i__8931 = G__8933;
      continue
    }else {
    }
    break
  }
  return new_obj__8929
};
cljs.core.ObjMap = function(meta, keys, strobj, update_count, __hash) {
  this.meta = meta;
  this.keys = keys;
  this.strobj = strobj;
  this.update_count = update_count;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 15075087
};
cljs.core.ObjMap.cljs$lang$type = true;
cljs.core.ObjMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/ObjMap")
};
cljs.core.ObjMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__8936 = this;
  return cljs.core.transient$.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null), coll))
};
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8937 = this;
  var h__2192__auto____8938 = this__8937.__hash;
  if(!(h__2192__auto____8938 == null)) {
    return h__2192__auto____8938
  }else {
    var h__2192__auto____8939 = cljs.core.hash_imap.call(null, coll);
    this__8937.__hash = h__2192__auto____8939;
    return h__2192__auto____8939
  }
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8940 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8941 = this;
  if(function() {
    var and__3822__auto____8942 = goog.isString(k);
    if(and__3822__auto____8942) {
      return!(cljs.core.scan_array.call(null, 1, k, this__8941.keys) == null)
    }else {
      return and__3822__auto____8942
    }
  }()) {
    return this__8941.strobj[k]
  }else {
    return not_found
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8943 = this;
  if(goog.isString(k)) {
    if(function() {
      var or__3824__auto____8944 = this__8943.update_count > cljs.core.ObjMap.HASHMAP_THRESHOLD;
      if(or__3824__auto____8944) {
        return or__3824__auto____8944
      }else {
        return this__8943.keys.length >= cljs.core.ObjMap.HASHMAP_THRESHOLD
      }
    }()) {
      return cljs.core.obj_map__GT_hash_map.call(null, coll, k, v)
    }else {
      if(!(cljs.core.scan_array.call(null, 1, k, this__8943.keys) == null)) {
        var new_strobj__8945 = cljs.core.obj_clone.call(null, this__8943.strobj, this__8943.keys);
        new_strobj__8945[k] = v;
        return new cljs.core.ObjMap(this__8943.meta, this__8943.keys, new_strobj__8945, this__8943.update_count + 1, null)
      }else {
        var new_strobj__8946 = cljs.core.obj_clone.call(null, this__8943.strobj, this__8943.keys);
        var new_keys__8947 = this__8943.keys.slice();
        new_strobj__8946[k] = v;
        new_keys__8947.push(k);
        return new cljs.core.ObjMap(this__8943.meta, new_keys__8947, new_strobj__8946, this__8943.update_count + 1, null)
      }
    }
  }else {
    return cljs.core.obj_map__GT_hash_map.call(null, coll, k, v)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__8948 = this;
  if(function() {
    var and__3822__auto____8949 = goog.isString(k);
    if(and__3822__auto____8949) {
      return!(cljs.core.scan_array.call(null, 1, k, this__8948.keys) == null)
    }else {
      return and__3822__auto____8949
    }
  }()) {
    return true
  }else {
    return false
  }
};
cljs.core.ObjMap.prototype.call = function() {
  var G__8971 = null;
  var G__8971__2 = function(this_sym8950, k) {
    var this__8952 = this;
    var this_sym8950__8953 = this;
    var coll__8954 = this_sym8950__8953;
    return coll__8954.cljs$core$ILookup$_lookup$arity$2(coll__8954, k)
  };
  var G__8971__3 = function(this_sym8951, k, not_found) {
    var this__8952 = this;
    var this_sym8951__8955 = this;
    var coll__8956 = this_sym8951__8955;
    return coll__8956.cljs$core$ILookup$_lookup$arity$3(coll__8956, k, not_found)
  };
  G__8971 = function(this_sym8951, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8971__2.call(this, this_sym8951, k);
      case 3:
        return G__8971__3.call(this, this_sym8951, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8971
}();
cljs.core.ObjMap.prototype.apply = function(this_sym8934, args8935) {
  var this__8957 = this;
  return this_sym8934.call.apply(this_sym8934, [this_sym8934].concat(args8935.slice()))
};
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__8958 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.toString = function() {
  var this__8959 = this;
  var this__8960 = this;
  return cljs.core.pr_str.call(null, this__8960)
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__8961 = this;
  if(this__8961.keys.length > 0) {
    return cljs.core.map.call(null, function(p1__8924_SHARP_) {
      return cljs.core.vector.call(null, p1__8924_SHARP_, this__8961.strobj[p1__8924_SHARP_])
    }, this__8961.keys.sort(cljs.core.obj_map_compare_keys))
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__8962 = this;
  return this__8962.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__8963 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__8964 = this;
  return new cljs.core.ObjMap(meta, this__8964.keys, this__8964.strobj, this__8964.update_count, this__8964.__hash)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__8965 = this;
  return this__8965.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__8966 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__8966.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__8967 = this;
  if(function() {
    var and__3822__auto____8968 = goog.isString(k);
    if(and__3822__auto____8968) {
      return!(cljs.core.scan_array.call(null, 1, k, this__8967.keys) == null)
    }else {
      return and__3822__auto____8968
    }
  }()) {
    var new_keys__8969 = this__8967.keys.slice();
    var new_strobj__8970 = cljs.core.obj_clone.call(null, this__8967.strobj, this__8967.keys);
    new_keys__8969.splice(cljs.core.scan_array.call(null, 1, k, new_keys__8969), 1);
    cljs.core.js_delete.call(null, new_strobj__8970, k);
    return new cljs.core.ObjMap(this__8967.meta, new_keys__8969, new_strobj__8970, this__8967.update_count + 1, null)
  }else {
    return coll
  }
};
cljs.core.ObjMap;
cljs.core.ObjMap.EMPTY = new cljs.core.ObjMap(null, [], {}, 0, 0);
cljs.core.ObjMap.HASHMAP_THRESHOLD = 32;
cljs.core.ObjMap.fromObject = function(ks, obj) {
  return new cljs.core.ObjMap(null, ks, obj, 0, null)
};
cljs.core.HashMap = function(meta, count, hashobj, __hash) {
  this.meta = meta;
  this.count = count;
  this.hashobj = hashobj;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 15075087
};
cljs.core.HashMap.cljs$lang$type = true;
cljs.core.HashMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/HashMap")
};
cljs.core.HashMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__8975 = this;
  var h__2192__auto____8976 = this__8975.__hash;
  if(!(h__2192__auto____8976 == null)) {
    return h__2192__auto____8976
  }else {
    var h__2192__auto____8977 = cljs.core.hash_imap.call(null, coll);
    this__8975.__hash = h__2192__auto____8977;
    return h__2192__auto____8977
  }
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__8978 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__8979 = this;
  var bucket__8980 = this__8979.hashobj[cljs.core.hash.call(null, k)];
  var i__8981 = cljs.core.truth_(bucket__8980) ? cljs.core.scan_array.call(null, 2, k, bucket__8980) : null;
  if(cljs.core.truth_(i__8981)) {
    return bucket__8980[i__8981 + 1]
  }else {
    return not_found
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__8982 = this;
  var h__8983 = cljs.core.hash.call(null, k);
  var bucket__8984 = this__8982.hashobj[h__8983];
  if(cljs.core.truth_(bucket__8984)) {
    var new_bucket__8985 = bucket__8984.slice();
    var new_hashobj__8986 = goog.object.clone(this__8982.hashobj);
    new_hashobj__8986[h__8983] = new_bucket__8985;
    var temp__3971__auto____8987 = cljs.core.scan_array.call(null, 2, k, new_bucket__8985);
    if(cljs.core.truth_(temp__3971__auto____8987)) {
      var i__8988 = temp__3971__auto____8987;
      new_bucket__8985[i__8988 + 1] = v;
      return new cljs.core.HashMap(this__8982.meta, this__8982.count, new_hashobj__8986, null)
    }else {
      new_bucket__8985.push(k, v);
      return new cljs.core.HashMap(this__8982.meta, this__8982.count + 1, new_hashobj__8986, null)
    }
  }else {
    var new_hashobj__8989 = goog.object.clone(this__8982.hashobj);
    new_hashobj__8989[h__8983] = [k, v];
    return new cljs.core.HashMap(this__8982.meta, this__8982.count + 1, new_hashobj__8989, null)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__8990 = this;
  var bucket__8991 = this__8990.hashobj[cljs.core.hash.call(null, k)];
  var i__8992 = cljs.core.truth_(bucket__8991) ? cljs.core.scan_array.call(null, 2, k, bucket__8991) : null;
  if(cljs.core.truth_(i__8992)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.call = function() {
  var G__9017 = null;
  var G__9017__2 = function(this_sym8993, k) {
    var this__8995 = this;
    var this_sym8993__8996 = this;
    var coll__8997 = this_sym8993__8996;
    return coll__8997.cljs$core$ILookup$_lookup$arity$2(coll__8997, k)
  };
  var G__9017__3 = function(this_sym8994, k, not_found) {
    var this__8995 = this;
    var this_sym8994__8998 = this;
    var coll__8999 = this_sym8994__8998;
    return coll__8999.cljs$core$ILookup$_lookup$arity$3(coll__8999, k, not_found)
  };
  G__9017 = function(this_sym8994, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9017__2.call(this, this_sym8994, k);
      case 3:
        return G__9017__3.call(this, this_sym8994, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9017
}();
cljs.core.HashMap.prototype.apply = function(this_sym8973, args8974) {
  var this__9000 = this;
  return this_sym8973.call.apply(this_sym8973, [this_sym8973].concat(args8974.slice()))
};
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__9001 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.toString = function() {
  var this__9002 = this;
  var this__9003 = this;
  return cljs.core.pr_str.call(null, this__9003)
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9004 = this;
  if(this__9004.count > 0) {
    var hashes__9005 = cljs.core.js_keys.call(null, this__9004.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__8972_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__9004.hashobj[p1__8972_SHARP_]))
    }, hashes__9005)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9006 = this;
  return this__9006.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9007 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9008 = this;
  return new cljs.core.HashMap(meta, this__9008.count, this__9008.hashobj, this__9008.__hash)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9009 = this;
  return this__9009.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9010 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__9010.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__9011 = this;
  var h__9012 = cljs.core.hash.call(null, k);
  var bucket__9013 = this__9011.hashobj[h__9012];
  var i__9014 = cljs.core.truth_(bucket__9013) ? cljs.core.scan_array.call(null, 2, k, bucket__9013) : null;
  if(cljs.core.not.call(null, i__9014)) {
    return coll
  }else {
    var new_hashobj__9015 = goog.object.clone(this__9011.hashobj);
    if(3 > bucket__9013.length) {
      cljs.core.js_delete.call(null, new_hashobj__9015, h__9012)
    }else {
      var new_bucket__9016 = bucket__9013.slice();
      new_bucket__9016.splice(i__9014, 2);
      new_hashobj__9015[h__9012] = new_bucket__9016
    }
    return new cljs.core.HashMap(this__9011.meta, this__9011.count - 1, new_hashobj__9015, null)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, {}, 0);
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__9018 = ks.length;
  var i__9019 = 0;
  var out__9020 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(i__9019 < len__9018) {
      var G__9021 = i__9019 + 1;
      var G__9022 = cljs.core.assoc.call(null, out__9020, ks[i__9019], vs[i__9019]);
      i__9019 = G__9021;
      out__9020 = G__9022;
      continue
    }else {
      return out__9020
    }
    break
  }
};
cljs.core.array_map_index_of = function array_map_index_of(m, k) {
  var arr__9026 = m.arr;
  var len__9027 = arr__9026.length;
  var i__9028 = 0;
  while(true) {
    if(len__9027 <= i__9028) {
      return-1
    }else {
      if(cljs.core._EQ_.call(null, arr__9026[i__9028], k)) {
        return i__9028
      }else {
        if("\ufdd0'else") {
          var G__9029 = i__9028 + 2;
          i__9028 = G__9029;
          continue
        }else {
          return null
        }
      }
    }
    break
  }
};
cljs.core.PersistentArrayMap = function(meta, cnt, arr, __hash) {
  this.meta = meta;
  this.cnt = cnt;
  this.arr = arr;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 16123663
};
cljs.core.PersistentArrayMap.cljs$lang$type = true;
cljs.core.PersistentArrayMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentArrayMap")
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__9032 = this;
  return new cljs.core.TransientArrayMap({}, this__9032.arr.length, this__9032.arr.slice())
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9033 = this;
  var h__2192__auto____9034 = this__9033.__hash;
  if(!(h__2192__auto____9034 == null)) {
    return h__2192__auto____9034
  }else {
    var h__2192__auto____9035 = cljs.core.hash_imap.call(null, coll);
    this__9033.__hash = h__2192__auto____9035;
    return h__2192__auto____9035
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__9036 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__9037 = this;
  var idx__9038 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__9038 === -1) {
    return not_found
  }else {
    return this__9037.arr[idx__9038 + 1]
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__9039 = this;
  var idx__9040 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__9040 === -1) {
    if(this__9039.cnt < cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
      return new cljs.core.PersistentArrayMap(this__9039.meta, this__9039.cnt + 1, function() {
        var G__9041__9042 = this__9039.arr.slice();
        G__9041__9042.push(k);
        G__9041__9042.push(v);
        return G__9041__9042
      }(), null)
    }else {
      return cljs.core.persistent_BANG_.call(null, cljs.core.assoc_BANG_.call(null, cljs.core.transient$.call(null, cljs.core.into.call(null, cljs.core.PersistentHashMap.EMPTY, coll)), k, v))
    }
  }else {
    if(v === this__9039.arr[idx__9040 + 1]) {
      return coll
    }else {
      if("\ufdd0'else") {
        return new cljs.core.PersistentArrayMap(this__9039.meta, this__9039.cnt, function() {
          var G__9043__9044 = this__9039.arr.slice();
          G__9043__9044[idx__9040 + 1] = v;
          return G__9043__9044
        }(), null)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__9045 = this;
  return!(cljs.core.array_map_index_of.call(null, coll, k) === -1)
};
cljs.core.PersistentArrayMap.prototype.call = function() {
  var G__9077 = null;
  var G__9077__2 = function(this_sym9046, k) {
    var this__9048 = this;
    var this_sym9046__9049 = this;
    var coll__9050 = this_sym9046__9049;
    return coll__9050.cljs$core$ILookup$_lookup$arity$2(coll__9050, k)
  };
  var G__9077__3 = function(this_sym9047, k, not_found) {
    var this__9048 = this;
    var this_sym9047__9051 = this;
    var coll__9052 = this_sym9047__9051;
    return coll__9052.cljs$core$ILookup$_lookup$arity$3(coll__9052, k, not_found)
  };
  G__9077 = function(this_sym9047, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9077__2.call(this, this_sym9047, k);
      case 3:
        return G__9077__3.call(this, this_sym9047, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9077
}();
cljs.core.PersistentArrayMap.prototype.apply = function(this_sym9030, args9031) {
  var this__9053 = this;
  return this_sym9030.call.apply(this_sym9030, [this_sym9030].concat(args9031.slice()))
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__9054 = this;
  var len__9055 = this__9054.arr.length;
  var i__9056 = 0;
  var init__9057 = init;
  while(true) {
    if(i__9056 < len__9055) {
      var init__9058 = f.call(null, init__9057, this__9054.arr[i__9056], this__9054.arr[i__9056 + 1]);
      if(cljs.core.reduced_QMARK_.call(null, init__9058)) {
        return cljs.core.deref.call(null, init__9058)
      }else {
        var G__9078 = i__9056 + 2;
        var G__9079 = init__9058;
        i__9056 = G__9078;
        init__9057 = G__9079;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__9059 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentArrayMap.prototype.toString = function() {
  var this__9060 = this;
  var this__9061 = this;
  return cljs.core.pr_str.call(null, this__9061)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9062 = this;
  if(this__9062.cnt > 0) {
    var len__9063 = this__9062.arr.length;
    var array_map_seq__9064 = function array_map_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(i < len__9063) {
          return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([this__9062.arr[i], this__9062.arr[i + 1]], true), array_map_seq.call(null, i + 2))
        }else {
          return null
        }
      }, null)
    };
    return array_map_seq__9064.call(null, 0)
  }else {
    return null
  }
};
cljs.core.PersistentArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9065 = this;
  return this__9065.cnt
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9066 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9067 = this;
  return new cljs.core.PersistentArrayMap(meta, this__9067.cnt, this__9067.arr, this__9067.__hash)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9068 = this;
  return this__9068.meta
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9069 = this;
  return cljs.core._with_meta.call(null, cljs.core.PersistentArrayMap.EMPTY, this__9069.meta)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__9070 = this;
  var idx__9071 = cljs.core.array_map_index_of.call(null, coll, k);
  if(idx__9071 >= 0) {
    var len__9072 = this__9070.arr.length;
    var new_len__9073 = len__9072 - 2;
    if(new_len__9073 === 0) {
      return coll.cljs$core$IEmptyableCollection$_empty$arity$1(coll)
    }else {
      var new_arr__9074 = cljs.core.make_array.call(null, new_len__9073);
      var s__9075 = 0;
      var d__9076 = 0;
      while(true) {
        if(s__9075 >= len__9072) {
          return new cljs.core.PersistentArrayMap(this__9070.meta, this__9070.cnt - 1, new_arr__9074, null)
        }else {
          if(cljs.core._EQ_.call(null, k, this__9070.arr[s__9075])) {
            var G__9080 = s__9075 + 2;
            var G__9081 = d__9076;
            s__9075 = G__9080;
            d__9076 = G__9081;
            continue
          }else {
            if("\ufdd0'else") {
              new_arr__9074[d__9076] = this__9070.arr[s__9075];
              new_arr__9074[d__9076 + 1] = this__9070.arr[s__9075 + 1];
              var G__9082 = s__9075 + 2;
              var G__9083 = d__9076 + 2;
              s__9075 = G__9082;
              d__9076 = G__9083;
              continue
            }else {
              return null
            }
          }
        }
        break
      }
    }
  }else {
    return coll
  }
};
cljs.core.PersistentArrayMap;
cljs.core.PersistentArrayMap.EMPTY = new cljs.core.PersistentArrayMap(null, 0, [], null);
cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD = 16;
cljs.core.PersistentArrayMap.fromArrays = function(ks, vs) {
  var len__9084 = cljs.core.count.call(null, ks);
  var i__9085 = 0;
  var out__9086 = cljs.core.transient$.call(null, cljs.core.PersistentArrayMap.EMPTY);
  while(true) {
    if(i__9085 < len__9084) {
      var G__9087 = i__9085 + 1;
      var G__9088 = cljs.core.assoc_BANG_.call(null, out__9086, ks[i__9085], vs[i__9085]);
      i__9085 = G__9087;
      out__9086 = G__9088;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__9086)
    }
    break
  }
};
cljs.core.TransientArrayMap = function(editable_QMARK_, len, arr) {
  this.editable_QMARK_ = editable_QMARK_;
  this.len = len;
  this.arr = arr;
  this.cljs$lang$protocol_mask$partition1$ = 14;
  this.cljs$lang$protocol_mask$partition0$ = 258
};
cljs.core.TransientArrayMap.cljs$lang$type = true;
cljs.core.TransientArrayMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/TransientArrayMap")
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientMap$_dissoc_BANG_$arity$2 = function(tcoll, key) {
  var this__9089 = this;
  if(cljs.core.truth_(this__9089.editable_QMARK_)) {
    var idx__9090 = cljs.core.array_map_index_of.call(null, tcoll, key);
    if(idx__9090 >= 0) {
      this__9089.arr[idx__9090] = this__9089.arr[this__9089.len - 2];
      this__9089.arr[idx__9090 + 1] = this__9089.arr[this__9089.len - 1];
      var G__9091__9092 = this__9089.arr;
      G__9091__9092.pop();
      G__9091__9092.pop();
      G__9091__9092;
      this__9089.len = this__9089.len - 2
    }else {
    }
    return tcoll
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__9093 = this;
  if(cljs.core.truth_(this__9093.editable_QMARK_)) {
    var idx__9094 = cljs.core.array_map_index_of.call(null, tcoll, key);
    if(idx__9094 === -1) {
      if(this__9093.len + 2 <= 2 * cljs.core.PersistentArrayMap.HASHMAP_THRESHOLD) {
        this__9093.len = this__9093.len + 2;
        this__9093.arr.push(key);
        this__9093.arr.push(val);
        return tcoll
      }else {
        return cljs.core.assoc_BANG_.call(null, cljs.core.array__GT_transient_hash_map.call(null, this__9093.len, this__9093.arr), key, val)
      }
    }else {
      if(val === this__9093.arr[idx__9094 + 1]) {
        return tcoll
      }else {
        this__9093.arr[idx__9094 + 1] = val;
        return tcoll
      }
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__9095 = this;
  if(cljs.core.truth_(this__9095.editable_QMARK_)) {
    if(function() {
      var G__9096__9097 = o;
      if(G__9096__9097) {
        if(function() {
          var or__3824__auto____9098 = G__9096__9097.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____9098) {
            return or__3824__auto____9098
          }else {
            return G__9096__9097.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__9096__9097.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__9096__9097)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__9096__9097)
      }
    }()) {
      return tcoll.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll, cljs.core.key.call(null, o), cljs.core.val.call(null, o))
    }else {
      var es__9099 = cljs.core.seq.call(null, o);
      var tcoll__9100 = tcoll;
      while(true) {
        var temp__3971__auto____9101 = cljs.core.first.call(null, es__9099);
        if(cljs.core.truth_(temp__3971__auto____9101)) {
          var e__9102 = temp__3971__auto____9101;
          var G__9108 = cljs.core.next.call(null, es__9099);
          var G__9109 = tcoll__9100.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3(tcoll__9100, cljs.core.key.call(null, e__9102), cljs.core.val.call(null, e__9102));
          es__9099 = G__9108;
          tcoll__9100 = G__9109;
          continue
        }else {
          return tcoll__9100
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__9103 = this;
  if(cljs.core.truth_(this__9103.editable_QMARK_)) {
    this__9103.editable_QMARK_ = false;
    return new cljs.core.PersistentArrayMap(null, cljs.core.quot.call(null, this__9103.len, 2), this__9103.arr, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__9104 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, k, null)
};
cljs.core.TransientArrayMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__9105 = this;
  if(cljs.core.truth_(this__9105.editable_QMARK_)) {
    var idx__9106 = cljs.core.array_map_index_of.call(null, tcoll, k);
    if(idx__9106 === -1) {
      return not_found
    }else {
      return this__9105.arr[idx__9106 + 1]
    }
  }else {
    throw new Error("lookup after persistent!");
  }
};
cljs.core.TransientArrayMap.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__9107 = this;
  if(cljs.core.truth_(this__9107.editable_QMARK_)) {
    return cljs.core.quot.call(null, this__9107.len, 2)
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientArrayMap;
cljs.core.array__GT_transient_hash_map = function array__GT_transient_hash_map(len, arr) {
  var out__9112 = cljs.core.transient$.call(null, cljs.core.ObjMap.EMPTY);
  var i__9113 = 0;
  while(true) {
    if(i__9113 < len) {
      var G__9114 = cljs.core.assoc_BANG_.call(null, out__9112, arr[i__9113], arr[i__9113 + 1]);
      var G__9115 = i__9113 + 2;
      out__9112 = G__9114;
      i__9113 = G__9115;
      continue
    }else {
      return out__9112
    }
    break
  }
};
cljs.core.Box = function(val) {
  this.val = val
};
cljs.core.Box.cljs$lang$type = true;
cljs.core.Box.cljs$lang$ctorPrSeq = function(this__2310__auto__) {
  return cljs.core.list.call(null, "cljs.core/Box")
};
cljs.core.Box;
cljs.core.key_test = function key_test(key, other) {
  if(goog.isString(key)) {
    return key === other
  }else {
    return cljs.core._EQ_.call(null, key, other)
  }
};
cljs.core.mask = function mask(hash, shift) {
  return hash >>> shift & 31
};
cljs.core.clone_and_set = function() {
  var clone_and_set = null;
  var clone_and_set__3 = function(arr, i, a) {
    var G__9120__9121 = arr.slice();
    G__9120__9121[i] = a;
    return G__9120__9121
  };
  var clone_and_set__5 = function(arr, i, a, j, b) {
    var G__9122__9123 = arr.slice();
    G__9122__9123[i] = a;
    G__9122__9123[j] = b;
    return G__9122__9123
  };
  clone_and_set = function(arr, i, a, j, b) {
    switch(arguments.length) {
      case 3:
        return clone_and_set__3.call(this, arr, i, a);
      case 5:
        return clone_and_set__5.call(this, arr, i, a, j, b)
    }
    throw"Invalid arity: " + arguments.length;
  };
  clone_and_set.cljs$lang$arity$3 = clone_and_set__3;
  clone_and_set.cljs$lang$arity$5 = clone_and_set__5;
  return clone_and_set
}();
cljs.core.remove_pair = function remove_pair(arr, i) {
  var new_arr__9125 = cljs.core.make_array.call(null, arr.length - 2);
  cljs.core.array_copy.call(null, arr, 0, new_arr__9125, 0, 2 * i);
  cljs.core.array_copy.call(null, arr, 2 * (i + 1), new_arr__9125, 2 * i, new_arr__9125.length - 2 * i);
  return new_arr__9125
};
cljs.core.bitmap_indexed_node_index = function bitmap_indexed_node_index(bitmap, bit) {
  return cljs.core.bit_count.call(null, bitmap & bit - 1)
};
cljs.core.bitpos = function bitpos(hash, shift) {
  return 1 << (hash >>> shift & 31)
};
cljs.core.edit_and_set = function() {
  var edit_and_set = null;
  var edit_and_set__4 = function(inode, edit, i, a) {
    var editable__9128 = inode.ensure_editable(edit);
    editable__9128.arr[i] = a;
    return editable__9128
  };
  var edit_and_set__6 = function(inode, edit, i, a, j, b) {
    var editable__9129 = inode.ensure_editable(edit);
    editable__9129.arr[i] = a;
    editable__9129.arr[j] = b;
    return editable__9129
  };
  edit_and_set = function(inode, edit, i, a, j, b) {
    switch(arguments.length) {
      case 4:
        return edit_and_set__4.call(this, inode, edit, i, a);
      case 6:
        return edit_and_set__6.call(this, inode, edit, i, a, j, b)
    }
    throw"Invalid arity: " + arguments.length;
  };
  edit_and_set.cljs$lang$arity$4 = edit_and_set__4;
  edit_and_set.cljs$lang$arity$6 = edit_and_set__6;
  return edit_and_set
}();
cljs.core.inode_kv_reduce = function inode_kv_reduce(arr, f, init) {
  var len__9136 = arr.length;
  var i__9137 = 0;
  var init__9138 = init;
  while(true) {
    if(i__9137 < len__9136) {
      var init__9141 = function() {
        var k__9139 = arr[i__9137];
        if(!(k__9139 == null)) {
          return f.call(null, init__9138, k__9139, arr[i__9137 + 1])
        }else {
          var node__9140 = arr[i__9137 + 1];
          if(!(node__9140 == null)) {
            return node__9140.kv_reduce(f, init__9138)
          }else {
            return init__9138
          }
        }
      }();
      if(cljs.core.reduced_QMARK_.call(null, init__9141)) {
        return cljs.core.deref.call(null, init__9141)
      }else {
        var G__9142 = i__9137 + 2;
        var G__9143 = init__9141;
        i__9137 = G__9142;
        init__9138 = G__9143;
        continue
      }
    }else {
      return init__9138
    }
    break
  }
};
cljs.core.BitmapIndexedNode = function(edit, bitmap, arr) {
  this.edit = edit;
  this.bitmap = bitmap;
  this.arr = arr
};
cljs.core.BitmapIndexedNode.cljs$lang$type = true;
cljs.core.BitmapIndexedNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/BitmapIndexedNode")
};
cljs.core.BitmapIndexedNode.prototype.edit_and_remove_pair = function(e, bit, i) {
  var this__9144 = this;
  var inode__9145 = this;
  if(this__9144.bitmap === bit) {
    return null
  }else {
    var editable__9146 = inode__9145.ensure_editable(e);
    var earr__9147 = editable__9146.arr;
    var len__9148 = earr__9147.length;
    editable__9146.bitmap = bit ^ editable__9146.bitmap;
    cljs.core.array_copy.call(null, earr__9147, 2 * (i + 1), earr__9147, 2 * i, len__9148 - 2 * (i + 1));
    earr__9147[len__9148 - 2] = null;
    earr__9147[len__9148 - 1] = null;
    return editable__9146
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__9149 = this;
  var inode__9150 = this;
  var bit__9151 = 1 << (hash >>> shift & 31);
  var idx__9152 = cljs.core.bitmap_indexed_node_index.call(null, this__9149.bitmap, bit__9151);
  if((this__9149.bitmap & bit__9151) === 0) {
    var n__9153 = cljs.core.bit_count.call(null, this__9149.bitmap);
    if(2 * n__9153 < this__9149.arr.length) {
      var editable__9154 = inode__9150.ensure_editable(edit);
      var earr__9155 = editable__9154.arr;
      added_leaf_QMARK_.val = true;
      cljs.core.array_copy_downward.call(null, earr__9155, 2 * idx__9152, earr__9155, 2 * (idx__9152 + 1), 2 * (n__9153 - idx__9152));
      earr__9155[2 * idx__9152] = key;
      earr__9155[2 * idx__9152 + 1] = val;
      editable__9154.bitmap = editable__9154.bitmap | bit__9151;
      return editable__9154
    }else {
      if(n__9153 >= 16) {
        var nodes__9156 = cljs.core.make_array.call(null, 32);
        var jdx__9157 = hash >>> shift & 31;
        nodes__9156[jdx__9157] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
        var i__9158 = 0;
        var j__9159 = 0;
        while(true) {
          if(i__9158 < 32) {
            if((this__9149.bitmap >>> i__9158 & 1) === 0) {
              var G__9212 = i__9158 + 1;
              var G__9213 = j__9159;
              i__9158 = G__9212;
              j__9159 = G__9213;
              continue
            }else {
              nodes__9156[i__9158] = !(this__9149.arr[j__9159] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, cljs.core.hash.call(null, this__9149.arr[j__9159]), this__9149.arr[j__9159], this__9149.arr[j__9159 + 1], added_leaf_QMARK_) : this__9149.arr[j__9159 + 1];
              var G__9214 = i__9158 + 1;
              var G__9215 = j__9159 + 2;
              i__9158 = G__9214;
              j__9159 = G__9215;
              continue
            }
          }else {
          }
          break
        }
        return new cljs.core.ArrayNode(edit, n__9153 + 1, nodes__9156)
      }else {
        if("\ufdd0'else") {
          var new_arr__9160 = cljs.core.make_array.call(null, 2 * (n__9153 + 4));
          cljs.core.array_copy.call(null, this__9149.arr, 0, new_arr__9160, 0, 2 * idx__9152);
          new_arr__9160[2 * idx__9152] = key;
          new_arr__9160[2 * idx__9152 + 1] = val;
          cljs.core.array_copy.call(null, this__9149.arr, 2 * idx__9152, new_arr__9160, 2 * (idx__9152 + 1), 2 * (n__9153 - idx__9152));
          added_leaf_QMARK_.val = true;
          var editable__9161 = inode__9150.ensure_editable(edit);
          editable__9161.arr = new_arr__9160;
          editable__9161.bitmap = editable__9161.bitmap | bit__9151;
          return editable__9161
        }else {
          return null
        }
      }
    }
  }else {
    var key_or_nil__9162 = this__9149.arr[2 * idx__9152];
    var val_or_node__9163 = this__9149.arr[2 * idx__9152 + 1];
    if(key_or_nil__9162 == null) {
      var n__9164 = val_or_node__9163.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__9164 === val_or_node__9163) {
        return inode__9150
      }else {
        return cljs.core.edit_and_set.call(null, inode__9150, edit, 2 * idx__9152 + 1, n__9164)
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__9162)) {
        if(val === val_or_node__9163) {
          return inode__9150
        }else {
          return cljs.core.edit_and_set.call(null, inode__9150, edit, 2 * idx__9152 + 1, val)
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return cljs.core.edit_and_set.call(null, inode__9150, edit, 2 * idx__9152, null, 2 * idx__9152 + 1, cljs.core.create_node.call(null, edit, shift + 5, key_or_nil__9162, val_or_node__9163, hash, key, val))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_seq = function() {
  var this__9165 = this;
  var inode__9166 = this;
  return cljs.core.create_inode_seq.call(null, this__9165.arr)
};
cljs.core.BitmapIndexedNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__9167 = this;
  var inode__9168 = this;
  var bit__9169 = 1 << (hash >>> shift & 31);
  if((this__9167.bitmap & bit__9169) === 0) {
    return inode__9168
  }else {
    var idx__9170 = cljs.core.bitmap_indexed_node_index.call(null, this__9167.bitmap, bit__9169);
    var key_or_nil__9171 = this__9167.arr[2 * idx__9170];
    var val_or_node__9172 = this__9167.arr[2 * idx__9170 + 1];
    if(key_or_nil__9171 == null) {
      var n__9173 = val_or_node__9172.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
      if(n__9173 === val_or_node__9172) {
        return inode__9168
      }else {
        if(!(n__9173 == null)) {
          return cljs.core.edit_and_set.call(null, inode__9168, edit, 2 * idx__9170 + 1, n__9173)
        }else {
          if(this__9167.bitmap === bit__9169) {
            return null
          }else {
            if("\ufdd0'else") {
              return inode__9168.edit_and_remove_pair(edit, bit__9169, idx__9170)
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__9171)) {
        removed_leaf_QMARK_[0] = true;
        return inode__9168.edit_and_remove_pair(edit, bit__9169, idx__9170)
      }else {
        if("\ufdd0'else") {
          return inode__9168
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.ensure_editable = function(e) {
  var this__9174 = this;
  var inode__9175 = this;
  if(e === this__9174.edit) {
    return inode__9175
  }else {
    var n__9176 = cljs.core.bit_count.call(null, this__9174.bitmap);
    var new_arr__9177 = cljs.core.make_array.call(null, n__9176 < 0 ? 4 : 2 * (n__9176 + 1));
    cljs.core.array_copy.call(null, this__9174.arr, 0, new_arr__9177, 0, 2 * n__9176);
    return new cljs.core.BitmapIndexedNode(e, this__9174.bitmap, new_arr__9177)
  }
};
cljs.core.BitmapIndexedNode.prototype.kv_reduce = function(f, init) {
  var this__9178 = this;
  var inode__9179 = this;
  return cljs.core.inode_kv_reduce.call(null, this__9178.arr, f, init)
};
cljs.core.BitmapIndexedNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__9180 = this;
  var inode__9181 = this;
  var bit__9182 = 1 << (hash >>> shift & 31);
  if((this__9180.bitmap & bit__9182) === 0) {
    return not_found
  }else {
    var idx__9183 = cljs.core.bitmap_indexed_node_index.call(null, this__9180.bitmap, bit__9182);
    var key_or_nil__9184 = this__9180.arr[2 * idx__9183];
    var val_or_node__9185 = this__9180.arr[2 * idx__9183 + 1];
    if(key_or_nil__9184 == null) {
      return val_or_node__9185.inode_find(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__9184)) {
        return cljs.core.PersistentVector.fromArray([key_or_nil__9184, val_or_node__9185], true)
      }else {
        if("\ufdd0'else") {
          return not_found
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_without = function(shift, hash, key) {
  var this__9186 = this;
  var inode__9187 = this;
  var bit__9188 = 1 << (hash >>> shift & 31);
  if((this__9186.bitmap & bit__9188) === 0) {
    return inode__9187
  }else {
    var idx__9189 = cljs.core.bitmap_indexed_node_index.call(null, this__9186.bitmap, bit__9188);
    var key_or_nil__9190 = this__9186.arr[2 * idx__9189];
    var val_or_node__9191 = this__9186.arr[2 * idx__9189 + 1];
    if(key_or_nil__9190 == null) {
      var n__9192 = val_or_node__9191.inode_without(shift + 5, hash, key);
      if(n__9192 === val_or_node__9191) {
        return inode__9187
      }else {
        if(!(n__9192 == null)) {
          return new cljs.core.BitmapIndexedNode(null, this__9186.bitmap, cljs.core.clone_and_set.call(null, this__9186.arr, 2 * idx__9189 + 1, n__9192))
        }else {
          if(this__9186.bitmap === bit__9188) {
            return null
          }else {
            if("\ufdd0'else") {
              return new cljs.core.BitmapIndexedNode(null, this__9186.bitmap ^ bit__9188, cljs.core.remove_pair.call(null, this__9186.arr, idx__9189))
            }else {
              return null
            }
          }
        }
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__9190)) {
        return new cljs.core.BitmapIndexedNode(null, this__9186.bitmap ^ bit__9188, cljs.core.remove_pair.call(null, this__9186.arr, idx__9189))
      }else {
        if("\ufdd0'else") {
          return inode__9187
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__9193 = this;
  var inode__9194 = this;
  var bit__9195 = 1 << (hash >>> shift & 31);
  var idx__9196 = cljs.core.bitmap_indexed_node_index.call(null, this__9193.bitmap, bit__9195);
  if((this__9193.bitmap & bit__9195) === 0) {
    var n__9197 = cljs.core.bit_count.call(null, this__9193.bitmap);
    if(n__9197 >= 16) {
      var nodes__9198 = cljs.core.make_array.call(null, 32);
      var jdx__9199 = hash >>> shift & 31;
      nodes__9198[jdx__9199] = cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      var i__9200 = 0;
      var j__9201 = 0;
      while(true) {
        if(i__9200 < 32) {
          if((this__9193.bitmap >>> i__9200 & 1) === 0) {
            var G__9216 = i__9200 + 1;
            var G__9217 = j__9201;
            i__9200 = G__9216;
            j__9201 = G__9217;
            continue
          }else {
            nodes__9198[i__9200] = !(this__9193.arr[j__9201] == null) ? cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, cljs.core.hash.call(null, this__9193.arr[j__9201]), this__9193.arr[j__9201], this__9193.arr[j__9201 + 1], added_leaf_QMARK_) : this__9193.arr[j__9201 + 1];
            var G__9218 = i__9200 + 1;
            var G__9219 = j__9201 + 2;
            i__9200 = G__9218;
            j__9201 = G__9219;
            continue
          }
        }else {
        }
        break
      }
      return new cljs.core.ArrayNode(null, n__9197 + 1, nodes__9198)
    }else {
      var new_arr__9202 = cljs.core.make_array.call(null, 2 * (n__9197 + 1));
      cljs.core.array_copy.call(null, this__9193.arr, 0, new_arr__9202, 0, 2 * idx__9196);
      new_arr__9202[2 * idx__9196] = key;
      new_arr__9202[2 * idx__9196 + 1] = val;
      cljs.core.array_copy.call(null, this__9193.arr, 2 * idx__9196, new_arr__9202, 2 * (idx__9196 + 1), 2 * (n__9197 - idx__9196));
      added_leaf_QMARK_.val = true;
      return new cljs.core.BitmapIndexedNode(null, this__9193.bitmap | bit__9195, new_arr__9202)
    }
  }else {
    var key_or_nil__9203 = this__9193.arr[2 * idx__9196];
    var val_or_node__9204 = this__9193.arr[2 * idx__9196 + 1];
    if(key_or_nil__9203 == null) {
      var n__9205 = val_or_node__9204.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
      if(n__9205 === val_or_node__9204) {
        return inode__9194
      }else {
        return new cljs.core.BitmapIndexedNode(null, this__9193.bitmap, cljs.core.clone_and_set.call(null, this__9193.arr, 2 * idx__9196 + 1, n__9205))
      }
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__9203)) {
        if(val === val_or_node__9204) {
          return inode__9194
        }else {
          return new cljs.core.BitmapIndexedNode(null, this__9193.bitmap, cljs.core.clone_and_set.call(null, this__9193.arr, 2 * idx__9196 + 1, val))
        }
      }else {
        if("\ufdd0'else") {
          added_leaf_QMARK_.val = true;
          return new cljs.core.BitmapIndexedNode(null, this__9193.bitmap, cljs.core.clone_and_set.call(null, this__9193.arr, 2 * idx__9196, null, 2 * idx__9196 + 1, cljs.core.create_node.call(null, shift + 5, key_or_nil__9203, val_or_node__9204, hash, key, val)))
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__9206 = this;
  var inode__9207 = this;
  var bit__9208 = 1 << (hash >>> shift & 31);
  if((this__9206.bitmap & bit__9208) === 0) {
    return not_found
  }else {
    var idx__9209 = cljs.core.bitmap_indexed_node_index.call(null, this__9206.bitmap, bit__9208);
    var key_or_nil__9210 = this__9206.arr[2 * idx__9209];
    var val_or_node__9211 = this__9206.arr[2 * idx__9209 + 1];
    if(key_or_nil__9210 == null) {
      return val_or_node__9211.inode_lookup(shift + 5, hash, key, not_found)
    }else {
      if(cljs.core.key_test.call(null, key, key_or_nil__9210)) {
        return val_or_node__9211
      }else {
        if("\ufdd0'else") {
          return not_found
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.BitmapIndexedNode;
cljs.core.BitmapIndexedNode.EMPTY = new cljs.core.BitmapIndexedNode(null, 0, cljs.core.make_array.call(null, 0));
cljs.core.pack_array_node = function pack_array_node(array_node, edit, idx) {
  var arr__9227 = array_node.arr;
  var len__9228 = 2 * (array_node.cnt - 1);
  var new_arr__9229 = cljs.core.make_array.call(null, len__9228);
  var i__9230 = 0;
  var j__9231 = 1;
  var bitmap__9232 = 0;
  while(true) {
    if(i__9230 < len__9228) {
      if(function() {
        var and__3822__auto____9233 = !(i__9230 === idx);
        if(and__3822__auto____9233) {
          return!(arr__9227[i__9230] == null)
        }else {
          return and__3822__auto____9233
        }
      }()) {
        new_arr__9229[j__9231] = arr__9227[i__9230];
        var G__9234 = i__9230 + 1;
        var G__9235 = j__9231 + 2;
        var G__9236 = bitmap__9232 | 1 << i__9230;
        i__9230 = G__9234;
        j__9231 = G__9235;
        bitmap__9232 = G__9236;
        continue
      }else {
        var G__9237 = i__9230 + 1;
        var G__9238 = j__9231;
        var G__9239 = bitmap__9232;
        i__9230 = G__9237;
        j__9231 = G__9238;
        bitmap__9232 = G__9239;
        continue
      }
    }else {
      return new cljs.core.BitmapIndexedNode(edit, bitmap__9232, new_arr__9229)
    }
    break
  }
};
cljs.core.ArrayNode = function(edit, cnt, arr) {
  this.edit = edit;
  this.cnt = cnt;
  this.arr = arr
};
cljs.core.ArrayNode.cljs$lang$type = true;
cljs.core.ArrayNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/ArrayNode")
};
cljs.core.ArrayNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__9240 = this;
  var inode__9241 = this;
  var idx__9242 = hash >>> shift & 31;
  var node__9243 = this__9240.arr[idx__9242];
  if(node__9243 == null) {
    var editable__9244 = cljs.core.edit_and_set.call(null, inode__9241, edit, idx__9242, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_));
    editable__9244.cnt = editable__9244.cnt + 1;
    return editable__9244
  }else {
    var n__9245 = node__9243.inode_assoc_BANG_(edit, shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__9245 === node__9243) {
      return inode__9241
    }else {
      return cljs.core.edit_and_set.call(null, inode__9241, edit, idx__9242, n__9245)
    }
  }
};
cljs.core.ArrayNode.prototype.inode_seq = function() {
  var this__9246 = this;
  var inode__9247 = this;
  return cljs.core.create_array_node_seq.call(null, this__9246.arr)
};
cljs.core.ArrayNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__9248 = this;
  var inode__9249 = this;
  var idx__9250 = hash >>> shift & 31;
  var node__9251 = this__9248.arr[idx__9250];
  if(node__9251 == null) {
    return inode__9249
  }else {
    var n__9252 = node__9251.inode_without_BANG_(edit, shift + 5, hash, key, removed_leaf_QMARK_);
    if(n__9252 === node__9251) {
      return inode__9249
    }else {
      if(n__9252 == null) {
        if(this__9248.cnt <= 8) {
          return cljs.core.pack_array_node.call(null, inode__9249, edit, idx__9250)
        }else {
          var editable__9253 = cljs.core.edit_and_set.call(null, inode__9249, edit, idx__9250, n__9252);
          editable__9253.cnt = editable__9253.cnt - 1;
          return editable__9253
        }
      }else {
        if("\ufdd0'else") {
          return cljs.core.edit_and_set.call(null, inode__9249, edit, idx__9250, n__9252)
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.ArrayNode.prototype.ensure_editable = function(e) {
  var this__9254 = this;
  var inode__9255 = this;
  if(e === this__9254.edit) {
    return inode__9255
  }else {
    return new cljs.core.ArrayNode(e, this__9254.cnt, this__9254.arr.slice())
  }
};
cljs.core.ArrayNode.prototype.kv_reduce = function(f, init) {
  var this__9256 = this;
  var inode__9257 = this;
  var len__9258 = this__9256.arr.length;
  var i__9259 = 0;
  var init__9260 = init;
  while(true) {
    if(i__9259 < len__9258) {
      var node__9261 = this__9256.arr[i__9259];
      if(!(node__9261 == null)) {
        var init__9262 = node__9261.kv_reduce(f, init__9260);
        if(cljs.core.reduced_QMARK_.call(null, init__9262)) {
          return cljs.core.deref.call(null, init__9262)
        }else {
          var G__9281 = i__9259 + 1;
          var G__9282 = init__9262;
          i__9259 = G__9281;
          init__9260 = G__9282;
          continue
        }
      }else {
        return null
      }
    }else {
      return init__9260
    }
    break
  }
};
cljs.core.ArrayNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__9263 = this;
  var inode__9264 = this;
  var idx__9265 = hash >>> shift & 31;
  var node__9266 = this__9263.arr[idx__9265];
  if(!(node__9266 == null)) {
    return node__9266.inode_find(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode.prototype.inode_without = function(shift, hash, key) {
  var this__9267 = this;
  var inode__9268 = this;
  var idx__9269 = hash >>> shift & 31;
  var node__9270 = this__9267.arr[idx__9269];
  if(!(node__9270 == null)) {
    var n__9271 = node__9270.inode_without(shift + 5, hash, key);
    if(n__9271 === node__9270) {
      return inode__9268
    }else {
      if(n__9271 == null) {
        if(this__9267.cnt <= 8) {
          return cljs.core.pack_array_node.call(null, inode__9268, null, idx__9269)
        }else {
          return new cljs.core.ArrayNode(null, this__9267.cnt - 1, cljs.core.clone_and_set.call(null, this__9267.arr, idx__9269, n__9271))
        }
      }else {
        if("\ufdd0'else") {
          return new cljs.core.ArrayNode(null, this__9267.cnt, cljs.core.clone_and_set.call(null, this__9267.arr, idx__9269, n__9271))
        }else {
          return null
        }
      }
    }
  }else {
    return inode__9268
  }
};
cljs.core.ArrayNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__9272 = this;
  var inode__9273 = this;
  var idx__9274 = hash >>> shift & 31;
  var node__9275 = this__9272.arr[idx__9274];
  if(node__9275 == null) {
    return new cljs.core.ArrayNode(null, this__9272.cnt + 1, cljs.core.clone_and_set.call(null, this__9272.arr, idx__9274, cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_)))
  }else {
    var n__9276 = node__9275.inode_assoc(shift + 5, hash, key, val, added_leaf_QMARK_);
    if(n__9276 === node__9275) {
      return inode__9273
    }else {
      return new cljs.core.ArrayNode(null, this__9272.cnt, cljs.core.clone_and_set.call(null, this__9272.arr, idx__9274, n__9276))
    }
  }
};
cljs.core.ArrayNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__9277 = this;
  var inode__9278 = this;
  var idx__9279 = hash >>> shift & 31;
  var node__9280 = this__9277.arr[idx__9279];
  if(!(node__9280 == null)) {
    return node__9280.inode_lookup(shift + 5, hash, key, not_found)
  }else {
    return not_found
  }
};
cljs.core.ArrayNode;
cljs.core.hash_collision_node_find_index = function hash_collision_node_find_index(arr, cnt, key) {
  var lim__9285 = 2 * cnt;
  var i__9286 = 0;
  while(true) {
    if(i__9286 < lim__9285) {
      if(cljs.core.key_test.call(null, key, arr[i__9286])) {
        return i__9286
      }else {
        var G__9287 = i__9286 + 2;
        i__9286 = G__9287;
        continue
      }
    }else {
      return-1
    }
    break
  }
};
cljs.core.HashCollisionNode = function(edit, collision_hash, cnt, arr) {
  this.edit = edit;
  this.collision_hash = collision_hash;
  this.cnt = cnt;
  this.arr = arr
};
cljs.core.HashCollisionNode.cljs$lang$type = true;
cljs.core.HashCollisionNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/HashCollisionNode")
};
cljs.core.HashCollisionNode.prototype.inode_assoc_BANG_ = function(edit, shift, hash, key, val, added_leaf_QMARK_) {
  var this__9288 = this;
  var inode__9289 = this;
  if(hash === this__9288.collision_hash) {
    var idx__9290 = cljs.core.hash_collision_node_find_index.call(null, this__9288.arr, this__9288.cnt, key);
    if(idx__9290 === -1) {
      if(this__9288.arr.length > 2 * this__9288.cnt) {
        var editable__9291 = cljs.core.edit_and_set.call(null, inode__9289, edit, 2 * this__9288.cnt, key, 2 * this__9288.cnt + 1, val);
        added_leaf_QMARK_.val = true;
        editable__9291.cnt = editable__9291.cnt + 1;
        return editable__9291
      }else {
        var len__9292 = this__9288.arr.length;
        var new_arr__9293 = cljs.core.make_array.call(null, len__9292 + 2);
        cljs.core.array_copy.call(null, this__9288.arr, 0, new_arr__9293, 0, len__9292);
        new_arr__9293[len__9292] = key;
        new_arr__9293[len__9292 + 1] = val;
        added_leaf_QMARK_.val = true;
        return inode__9289.ensure_editable_array(edit, this__9288.cnt + 1, new_arr__9293)
      }
    }else {
      if(this__9288.arr[idx__9290 + 1] === val) {
        return inode__9289
      }else {
        return cljs.core.edit_and_set.call(null, inode__9289, edit, idx__9290 + 1, val)
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(edit, 1 << (this__9288.collision_hash >>> shift & 31), [null, inode__9289, null, null])).inode_assoc_BANG_(edit, shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_seq = function() {
  var this__9294 = this;
  var inode__9295 = this;
  return cljs.core.create_inode_seq.call(null, this__9294.arr)
};
cljs.core.HashCollisionNode.prototype.inode_without_BANG_ = function(edit, shift, hash, key, removed_leaf_QMARK_) {
  var this__9296 = this;
  var inode__9297 = this;
  var idx__9298 = cljs.core.hash_collision_node_find_index.call(null, this__9296.arr, this__9296.cnt, key);
  if(idx__9298 === -1) {
    return inode__9297
  }else {
    removed_leaf_QMARK_[0] = true;
    if(this__9296.cnt === 1) {
      return null
    }else {
      var editable__9299 = inode__9297.ensure_editable(edit);
      var earr__9300 = editable__9299.arr;
      earr__9300[idx__9298] = earr__9300[2 * this__9296.cnt - 2];
      earr__9300[idx__9298 + 1] = earr__9300[2 * this__9296.cnt - 1];
      earr__9300[2 * this__9296.cnt - 1] = null;
      earr__9300[2 * this__9296.cnt - 2] = null;
      editable__9299.cnt = editable__9299.cnt - 1;
      return editable__9299
    }
  }
};
cljs.core.HashCollisionNode.prototype.ensure_editable = function(e) {
  var this__9301 = this;
  var inode__9302 = this;
  if(e === this__9301.edit) {
    return inode__9302
  }else {
    var new_arr__9303 = cljs.core.make_array.call(null, 2 * (this__9301.cnt + 1));
    cljs.core.array_copy.call(null, this__9301.arr, 0, new_arr__9303, 0, 2 * this__9301.cnt);
    return new cljs.core.HashCollisionNode(e, this__9301.collision_hash, this__9301.cnt, new_arr__9303)
  }
};
cljs.core.HashCollisionNode.prototype.kv_reduce = function(f, init) {
  var this__9304 = this;
  var inode__9305 = this;
  return cljs.core.inode_kv_reduce.call(null, this__9304.arr, f, init)
};
cljs.core.HashCollisionNode.prototype.inode_find = function(shift, hash, key, not_found) {
  var this__9306 = this;
  var inode__9307 = this;
  var idx__9308 = cljs.core.hash_collision_node_find_index.call(null, this__9306.arr, this__9306.cnt, key);
  if(idx__9308 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test.call(null, key, this__9306.arr[idx__9308])) {
      return cljs.core.PersistentVector.fromArray([this__9306.arr[idx__9308], this__9306.arr[idx__9308 + 1]], true)
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.inode_without = function(shift, hash, key) {
  var this__9309 = this;
  var inode__9310 = this;
  var idx__9311 = cljs.core.hash_collision_node_find_index.call(null, this__9309.arr, this__9309.cnt, key);
  if(idx__9311 === -1) {
    return inode__9310
  }else {
    if(this__9309.cnt === 1) {
      return null
    }else {
      if("\ufdd0'else") {
        return new cljs.core.HashCollisionNode(null, this__9309.collision_hash, this__9309.cnt - 1, cljs.core.remove_pair.call(null, this__9309.arr, cljs.core.quot.call(null, idx__9311, 2)))
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.inode_assoc = function(shift, hash, key, val, added_leaf_QMARK_) {
  var this__9312 = this;
  var inode__9313 = this;
  if(hash === this__9312.collision_hash) {
    var idx__9314 = cljs.core.hash_collision_node_find_index.call(null, this__9312.arr, this__9312.cnt, key);
    if(idx__9314 === -1) {
      var len__9315 = this__9312.arr.length;
      var new_arr__9316 = cljs.core.make_array.call(null, len__9315 + 2);
      cljs.core.array_copy.call(null, this__9312.arr, 0, new_arr__9316, 0, len__9315);
      new_arr__9316[len__9315] = key;
      new_arr__9316[len__9315 + 1] = val;
      added_leaf_QMARK_.val = true;
      return new cljs.core.HashCollisionNode(null, this__9312.collision_hash, this__9312.cnt + 1, new_arr__9316)
    }else {
      if(cljs.core._EQ_.call(null, this__9312.arr[idx__9314], val)) {
        return inode__9313
      }else {
        return new cljs.core.HashCollisionNode(null, this__9312.collision_hash, this__9312.cnt, cljs.core.clone_and_set.call(null, this__9312.arr, idx__9314 + 1, val))
      }
    }
  }else {
    return(new cljs.core.BitmapIndexedNode(null, 1 << (this__9312.collision_hash >>> shift & 31), [null, inode__9313])).inode_assoc(shift, hash, key, val, added_leaf_QMARK_)
  }
};
cljs.core.HashCollisionNode.prototype.inode_lookup = function(shift, hash, key, not_found) {
  var this__9317 = this;
  var inode__9318 = this;
  var idx__9319 = cljs.core.hash_collision_node_find_index.call(null, this__9317.arr, this__9317.cnt, key);
  if(idx__9319 < 0) {
    return not_found
  }else {
    if(cljs.core.key_test.call(null, key, this__9317.arr[idx__9319])) {
      return this__9317.arr[idx__9319 + 1]
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.HashCollisionNode.prototype.ensure_editable_array = function(e, count, array) {
  var this__9320 = this;
  var inode__9321 = this;
  if(e === this__9320.edit) {
    this__9320.arr = array;
    this__9320.cnt = count;
    return inode__9321
  }else {
    return new cljs.core.HashCollisionNode(this__9320.edit, this__9320.collision_hash, count, array)
  }
};
cljs.core.HashCollisionNode;
cljs.core.create_node = function() {
  var create_node = null;
  var create_node__6 = function(shift, key1, val1, key2hash, key2, val2) {
    var key1hash__9326 = cljs.core.hash.call(null, key1);
    if(key1hash__9326 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__9326, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___9327 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc(shift, key1hash__9326, key1, val1, added_leaf_QMARK___9327).inode_assoc(shift, key2hash, key2, val2, added_leaf_QMARK___9327)
    }
  };
  var create_node__7 = function(edit, shift, key1, val1, key2hash, key2, val2) {
    var key1hash__9328 = cljs.core.hash.call(null, key1);
    if(key1hash__9328 === key2hash) {
      return new cljs.core.HashCollisionNode(null, key1hash__9328, 2, [key1, val1, key2, val2])
    }else {
      var added_leaf_QMARK___9329 = new cljs.core.Box(false);
      return cljs.core.BitmapIndexedNode.EMPTY.inode_assoc_BANG_(edit, shift, key1hash__9328, key1, val1, added_leaf_QMARK___9329).inode_assoc_BANG_(edit, shift, key2hash, key2, val2, added_leaf_QMARK___9329)
    }
  };
  create_node = function(edit, shift, key1, val1, key2hash, key2, val2) {
    switch(arguments.length) {
      case 6:
        return create_node__6.call(this, edit, shift, key1, val1, key2hash, key2);
      case 7:
        return create_node__7.call(this, edit, shift, key1, val1, key2hash, key2, val2)
    }
    throw"Invalid arity: " + arguments.length;
  };
  create_node.cljs$lang$arity$6 = create_node__6;
  create_node.cljs$lang$arity$7 = create_node__7;
  return create_node
}();
cljs.core.NodeSeq = function(meta, nodes, i, s, __hash) {
  this.meta = meta;
  this.nodes = nodes;
  this.i = i;
  this.s = s;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850572
};
cljs.core.NodeSeq.cljs$lang$type = true;
cljs.core.NodeSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/NodeSeq")
};
cljs.core.NodeSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9330 = this;
  var h__2192__auto____9331 = this__9330.__hash;
  if(!(h__2192__auto____9331 == null)) {
    return h__2192__auto____9331
  }else {
    var h__2192__auto____9332 = cljs.core.hash_coll.call(null, coll);
    this__9330.__hash = h__2192__auto____9332;
    return h__2192__auto____9332
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9333 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.NodeSeq.prototype.toString = function() {
  var this__9334 = this;
  var this__9335 = this;
  return cljs.core.pr_str.call(null, this__9335)
};
cljs.core.NodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__9336 = this;
  return this$
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9337 = this;
  if(this__9337.s == null) {
    return cljs.core.PersistentVector.fromArray([this__9337.nodes[this__9337.i], this__9337.nodes[this__9337.i + 1]], true)
  }else {
    return cljs.core.first.call(null, this__9337.s)
  }
};
cljs.core.NodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9338 = this;
  if(this__9338.s == null) {
    return cljs.core.create_inode_seq.call(null, this__9338.nodes, this__9338.i + 2, null)
  }else {
    return cljs.core.create_inode_seq.call(null, this__9338.nodes, this__9338.i, cljs.core.next.call(null, this__9338.s))
  }
};
cljs.core.NodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9339 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.NodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9340 = this;
  return new cljs.core.NodeSeq(meta, this__9340.nodes, this__9340.i, this__9340.s, this__9340.__hash)
};
cljs.core.NodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9341 = this;
  return this__9341.meta
};
cljs.core.NodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9342 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__9342.meta)
};
cljs.core.NodeSeq;
cljs.core.create_inode_seq = function() {
  var create_inode_seq = null;
  var create_inode_seq__1 = function(nodes) {
    return create_inode_seq.call(null, nodes, 0, null)
  };
  var create_inode_seq__3 = function(nodes, i, s) {
    if(s == null) {
      var len__9349 = nodes.length;
      var j__9350 = i;
      while(true) {
        if(j__9350 < len__9349) {
          if(!(nodes[j__9350] == null)) {
            return new cljs.core.NodeSeq(null, nodes, j__9350, null, null)
          }else {
            var temp__3971__auto____9351 = nodes[j__9350 + 1];
            if(cljs.core.truth_(temp__3971__auto____9351)) {
              var node__9352 = temp__3971__auto____9351;
              var temp__3971__auto____9353 = node__9352.inode_seq();
              if(cljs.core.truth_(temp__3971__auto____9353)) {
                var node_seq__9354 = temp__3971__auto____9353;
                return new cljs.core.NodeSeq(null, nodes, j__9350 + 2, node_seq__9354, null)
              }else {
                var G__9355 = j__9350 + 2;
                j__9350 = G__9355;
                continue
              }
            }else {
              var G__9356 = j__9350 + 2;
              j__9350 = G__9356;
              continue
            }
          }
        }else {
          return null
        }
        break
      }
    }else {
      return new cljs.core.NodeSeq(null, nodes, i, s, null)
    }
  };
  create_inode_seq = function(nodes, i, s) {
    switch(arguments.length) {
      case 1:
        return create_inode_seq__1.call(this, nodes);
      case 3:
        return create_inode_seq__3.call(this, nodes, i, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  create_inode_seq.cljs$lang$arity$1 = create_inode_seq__1;
  create_inode_seq.cljs$lang$arity$3 = create_inode_seq__3;
  return create_inode_seq
}();
cljs.core.ArrayNodeSeq = function(meta, nodes, i, s, __hash) {
  this.meta = meta;
  this.nodes = nodes;
  this.i = i;
  this.s = s;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850572
};
cljs.core.ArrayNodeSeq.cljs$lang$type = true;
cljs.core.ArrayNodeSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/ArrayNodeSeq")
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9357 = this;
  var h__2192__auto____9358 = this__9357.__hash;
  if(!(h__2192__auto____9358 == null)) {
    return h__2192__auto____9358
  }else {
    var h__2192__auto____9359 = cljs.core.hash_coll.call(null, coll);
    this__9357.__hash = h__2192__auto____9359;
    return h__2192__auto____9359
  }
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9360 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.ArrayNodeSeq.prototype.toString = function() {
  var this__9361 = this;
  var this__9362 = this;
  return cljs.core.pr_str.call(null, this__9362)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__9363 = this;
  return this$
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(coll) {
  var this__9364 = this;
  return cljs.core.first.call(null, this__9364.s)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(coll) {
  var this__9365 = this;
  return cljs.core.create_array_node_seq.call(null, null, this__9365.nodes, this__9365.i, cljs.core.next.call(null, this__9365.s))
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9366 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9367 = this;
  return new cljs.core.ArrayNodeSeq(meta, this__9367.nodes, this__9367.i, this__9367.s, this__9367.__hash)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9368 = this;
  return this__9368.meta
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9369 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__9369.meta)
};
cljs.core.ArrayNodeSeq;
cljs.core.create_array_node_seq = function() {
  var create_array_node_seq = null;
  var create_array_node_seq__1 = function(nodes) {
    return create_array_node_seq.call(null, null, nodes, 0, null)
  };
  var create_array_node_seq__4 = function(meta, nodes, i, s) {
    if(s == null) {
      var len__9376 = nodes.length;
      var j__9377 = i;
      while(true) {
        if(j__9377 < len__9376) {
          var temp__3971__auto____9378 = nodes[j__9377];
          if(cljs.core.truth_(temp__3971__auto____9378)) {
            var nj__9379 = temp__3971__auto____9378;
            var temp__3971__auto____9380 = nj__9379.inode_seq();
            if(cljs.core.truth_(temp__3971__auto____9380)) {
              var ns__9381 = temp__3971__auto____9380;
              return new cljs.core.ArrayNodeSeq(meta, nodes, j__9377 + 1, ns__9381, null)
            }else {
              var G__9382 = j__9377 + 1;
              j__9377 = G__9382;
              continue
            }
          }else {
            var G__9383 = j__9377 + 1;
            j__9377 = G__9383;
            continue
          }
        }else {
          return null
        }
        break
      }
    }else {
      return new cljs.core.ArrayNodeSeq(meta, nodes, i, s, null)
    }
  };
  create_array_node_seq = function(meta, nodes, i, s) {
    switch(arguments.length) {
      case 1:
        return create_array_node_seq__1.call(this, meta);
      case 4:
        return create_array_node_seq__4.call(this, meta, nodes, i, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  create_array_node_seq.cljs$lang$arity$1 = create_array_node_seq__1;
  create_array_node_seq.cljs$lang$arity$4 = create_array_node_seq__4;
  return create_array_node_seq
}();
cljs.core.PersistentHashMap = function(meta, cnt, root, has_nil_QMARK_, nil_val, __hash) {
  this.meta = meta;
  this.cnt = cnt;
  this.root = root;
  this.has_nil_QMARK_ = has_nil_QMARK_;
  this.nil_val = nil_val;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 16123663
};
cljs.core.PersistentHashMap.cljs$lang$type = true;
cljs.core.PersistentHashMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentHashMap")
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__9386 = this;
  return new cljs.core.TransientHashMap({}, this__9386.root, this__9386.cnt, this__9386.has_nil_QMARK_, this__9386.nil_val)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9387 = this;
  var h__2192__auto____9388 = this__9387.__hash;
  if(!(h__2192__auto____9388 == null)) {
    return h__2192__auto____9388
  }else {
    var h__2192__auto____9389 = cljs.core.hash_imap.call(null, coll);
    this__9387.__hash = h__2192__auto____9389;
    return h__2192__auto____9389
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__9390 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__9391 = this;
  if(k == null) {
    if(this__9391.has_nil_QMARK_) {
      return this__9391.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__9391.root == null) {
      return not_found
    }else {
      if("\ufdd0'else") {
        return this__9391.root.inode_lookup(0, cljs.core.hash.call(null, k), k, not_found)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__9392 = this;
  if(k == null) {
    if(function() {
      var and__3822__auto____9393 = this__9392.has_nil_QMARK_;
      if(and__3822__auto____9393) {
        return v === this__9392.nil_val
      }else {
        return and__3822__auto____9393
      }
    }()) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__9392.meta, this__9392.has_nil_QMARK_ ? this__9392.cnt : this__9392.cnt + 1, this__9392.root, true, v, null)
    }
  }else {
    var added_leaf_QMARK___9394 = new cljs.core.Box(false);
    var new_root__9395 = (this__9392.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__9392.root).inode_assoc(0, cljs.core.hash.call(null, k), k, v, added_leaf_QMARK___9394);
    if(new_root__9395 === this__9392.root) {
      return coll
    }else {
      return new cljs.core.PersistentHashMap(this__9392.meta, added_leaf_QMARK___9394.val ? this__9392.cnt + 1 : this__9392.cnt, new_root__9395, this__9392.has_nil_QMARK_, this__9392.nil_val, null)
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__9396 = this;
  if(k == null) {
    return this__9396.has_nil_QMARK_
  }else {
    if(this__9396.root == null) {
      return false
    }else {
      if("\ufdd0'else") {
        return!(this__9396.root.inode_lookup(0, cljs.core.hash.call(null, k), k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel)
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.call = function() {
  var G__9419 = null;
  var G__9419__2 = function(this_sym9397, k) {
    var this__9399 = this;
    var this_sym9397__9400 = this;
    var coll__9401 = this_sym9397__9400;
    return coll__9401.cljs$core$ILookup$_lookup$arity$2(coll__9401, k)
  };
  var G__9419__3 = function(this_sym9398, k, not_found) {
    var this__9399 = this;
    var this_sym9398__9402 = this;
    var coll__9403 = this_sym9398__9402;
    return coll__9403.cljs$core$ILookup$_lookup$arity$3(coll__9403, k, not_found)
  };
  G__9419 = function(this_sym9398, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9419__2.call(this, this_sym9398, k);
      case 3:
        return G__9419__3.call(this, this_sym9398, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9419
}();
cljs.core.PersistentHashMap.prototype.apply = function(this_sym9384, args9385) {
  var this__9404 = this;
  return this_sym9384.call.apply(this_sym9384, [this_sym9384].concat(args9385.slice()))
};
cljs.core.PersistentHashMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__9405 = this;
  var init__9406 = this__9405.has_nil_QMARK_ ? f.call(null, init, null, this__9405.nil_val) : init;
  if(cljs.core.reduced_QMARK_.call(null, init__9406)) {
    return cljs.core.deref.call(null, init__9406)
  }else {
    if(!(this__9405.root == null)) {
      return this__9405.root.kv_reduce(f, init__9406)
    }else {
      if("\ufdd0'else") {
        return init__9406
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__9407 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentHashMap.prototype.toString = function() {
  var this__9408 = this;
  var this__9409 = this;
  return cljs.core.pr_str.call(null, this__9409)
};
cljs.core.PersistentHashMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9410 = this;
  if(this__9410.cnt > 0) {
    var s__9411 = !(this__9410.root == null) ? this__9410.root.inode_seq() : null;
    if(this__9410.has_nil_QMARK_) {
      return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([null, this__9410.nil_val], true), s__9411)
    }else {
      return s__9411
    }
  }else {
    return null
  }
};
cljs.core.PersistentHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9412 = this;
  return this__9412.cnt
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9413 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9414 = this;
  return new cljs.core.PersistentHashMap(meta, this__9414.cnt, this__9414.root, this__9414.has_nil_QMARK_, this__9414.nil_val, this__9414.__hash)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9415 = this;
  return this__9415.meta
};
cljs.core.PersistentHashMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9416 = this;
  return cljs.core._with_meta.call(null, cljs.core.PersistentHashMap.EMPTY, this__9416.meta)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__9417 = this;
  if(k == null) {
    if(this__9417.has_nil_QMARK_) {
      return new cljs.core.PersistentHashMap(this__9417.meta, this__9417.cnt - 1, this__9417.root, false, null, null)
    }else {
      return coll
    }
  }else {
    if(this__9417.root == null) {
      return coll
    }else {
      if("\ufdd0'else") {
        var new_root__9418 = this__9417.root.inode_without(0, cljs.core.hash.call(null, k), k);
        if(new_root__9418 === this__9417.root) {
          return coll
        }else {
          return new cljs.core.PersistentHashMap(this__9417.meta, this__9417.cnt - 1, new_root__9418, this__9417.has_nil_QMARK_, this__9417.nil_val, null)
        }
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentHashMap;
cljs.core.PersistentHashMap.EMPTY = new cljs.core.PersistentHashMap(null, 0, null, false, null, 0);
cljs.core.PersistentHashMap.fromArrays = function(ks, vs) {
  var len__9420 = ks.length;
  var i__9421 = 0;
  var out__9422 = cljs.core.transient$.call(null, cljs.core.PersistentHashMap.EMPTY);
  while(true) {
    if(i__9421 < len__9420) {
      var G__9423 = i__9421 + 1;
      var G__9424 = cljs.core.assoc_BANG_.call(null, out__9422, ks[i__9421], vs[i__9421]);
      i__9421 = G__9423;
      out__9422 = G__9424;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__9422)
    }
    break
  }
};
cljs.core.TransientHashMap = function(edit, root, count, has_nil_QMARK_, nil_val) {
  this.edit = edit;
  this.root = root;
  this.count = count;
  this.has_nil_QMARK_ = has_nil_QMARK_;
  this.nil_val = nil_val;
  this.cljs$lang$protocol_mask$partition1$ = 14;
  this.cljs$lang$protocol_mask$partition0$ = 258
};
cljs.core.TransientHashMap.cljs$lang$type = true;
cljs.core.TransientHashMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/TransientHashMap")
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientMap$_dissoc_BANG_$arity$2 = function(tcoll, key) {
  var this__9425 = this;
  return tcoll.without_BANG_(key)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientAssociative$_assoc_BANG_$arity$3 = function(tcoll, key, val) {
  var this__9426 = this;
  return tcoll.assoc_BANG_(key, val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, val) {
  var this__9427 = this;
  return tcoll.conj_BANG_(val)
};
cljs.core.TransientHashMap.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__9428 = this;
  return tcoll.persistent_BANG_()
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, k) {
  var this__9429 = this;
  if(k == null) {
    if(this__9429.has_nil_QMARK_) {
      return this__9429.nil_val
    }else {
      return null
    }
  }else {
    if(this__9429.root == null) {
      return null
    }else {
      return this__9429.root.inode_lookup(0, cljs.core.hash.call(null, k), k)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, k, not_found) {
  var this__9430 = this;
  if(k == null) {
    if(this__9430.has_nil_QMARK_) {
      return this__9430.nil_val
    }else {
      return not_found
    }
  }else {
    if(this__9430.root == null) {
      return not_found
    }else {
      return this__9430.root.inode_lookup(0, cljs.core.hash.call(null, k), k, not_found)
    }
  }
};
cljs.core.TransientHashMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9431 = this;
  if(this__9431.edit) {
    return this__9431.count
  }else {
    throw new Error("count after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.conj_BANG_ = function(o) {
  var this__9432 = this;
  var tcoll__9433 = this;
  if(this__9432.edit) {
    if(function() {
      var G__9434__9435 = o;
      if(G__9434__9435) {
        if(function() {
          var or__3824__auto____9436 = G__9434__9435.cljs$lang$protocol_mask$partition0$ & 2048;
          if(or__3824__auto____9436) {
            return or__3824__auto____9436
          }else {
            return G__9434__9435.cljs$core$IMapEntry$
          }
        }()) {
          return true
        }else {
          if(!G__9434__9435.cljs$lang$protocol_mask$partition0$) {
            return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__9434__9435)
          }else {
            return false
          }
        }
      }else {
        return cljs.core.type_satisfies_.call(null, cljs.core.IMapEntry, G__9434__9435)
      }
    }()) {
      return tcoll__9433.assoc_BANG_(cljs.core.key.call(null, o), cljs.core.val.call(null, o))
    }else {
      var es__9437 = cljs.core.seq.call(null, o);
      var tcoll__9438 = tcoll__9433;
      while(true) {
        var temp__3971__auto____9439 = cljs.core.first.call(null, es__9437);
        if(cljs.core.truth_(temp__3971__auto____9439)) {
          var e__9440 = temp__3971__auto____9439;
          var G__9451 = cljs.core.next.call(null, es__9437);
          var G__9452 = tcoll__9438.assoc_BANG_(cljs.core.key.call(null, e__9440), cljs.core.val.call(null, e__9440));
          es__9437 = G__9451;
          tcoll__9438 = G__9452;
          continue
        }else {
          return tcoll__9438
        }
        break
      }
    }
  }else {
    throw new Error("conj! after persistent");
  }
};
cljs.core.TransientHashMap.prototype.assoc_BANG_ = function(k, v) {
  var this__9441 = this;
  var tcoll__9442 = this;
  if(this__9441.edit) {
    if(k == null) {
      if(this__9441.nil_val === v) {
      }else {
        this__9441.nil_val = v
      }
      if(this__9441.has_nil_QMARK_) {
      }else {
        this__9441.count = this__9441.count + 1;
        this__9441.has_nil_QMARK_ = true
      }
      return tcoll__9442
    }else {
      var added_leaf_QMARK___9443 = new cljs.core.Box(false);
      var node__9444 = (this__9441.root == null ? cljs.core.BitmapIndexedNode.EMPTY : this__9441.root).inode_assoc_BANG_(this__9441.edit, 0, cljs.core.hash.call(null, k), k, v, added_leaf_QMARK___9443);
      if(node__9444 === this__9441.root) {
      }else {
        this__9441.root = node__9444
      }
      if(added_leaf_QMARK___9443.val) {
        this__9441.count = this__9441.count + 1
      }else {
      }
      return tcoll__9442
    }
  }else {
    throw new Error("assoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.without_BANG_ = function(k) {
  var this__9445 = this;
  var tcoll__9446 = this;
  if(this__9445.edit) {
    if(k == null) {
      if(this__9445.has_nil_QMARK_) {
        this__9445.has_nil_QMARK_ = false;
        this__9445.nil_val = null;
        this__9445.count = this__9445.count - 1;
        return tcoll__9446
      }else {
        return tcoll__9446
      }
    }else {
      if(this__9445.root == null) {
        return tcoll__9446
      }else {
        var removed_leaf_QMARK___9447 = new cljs.core.Box(false);
        var node__9448 = this__9445.root.inode_without_BANG_(this__9445.edit, 0, cljs.core.hash.call(null, k), k, removed_leaf_QMARK___9447);
        if(node__9448 === this__9445.root) {
        }else {
          this__9445.root = node__9448
        }
        if(cljs.core.truth_(removed_leaf_QMARK___9447[0])) {
          this__9445.count = this__9445.count - 1
        }else {
        }
        return tcoll__9446
      }
    }
  }else {
    throw new Error("dissoc! after persistent!");
  }
};
cljs.core.TransientHashMap.prototype.persistent_BANG_ = function() {
  var this__9449 = this;
  var tcoll__9450 = this;
  if(this__9449.edit) {
    this__9449.edit = null;
    return new cljs.core.PersistentHashMap(null, this__9449.count, this__9449.root, this__9449.has_nil_QMARK_, this__9449.nil_val, null)
  }else {
    throw new Error("persistent! called twice");
  }
};
cljs.core.TransientHashMap;
cljs.core.tree_map_seq_push = function tree_map_seq_push(node, stack, ascending_QMARK_) {
  var t__9455 = node;
  var stack__9456 = stack;
  while(true) {
    if(!(t__9455 == null)) {
      var G__9457 = ascending_QMARK_ ? t__9455.left : t__9455.right;
      var G__9458 = cljs.core.conj.call(null, stack__9456, t__9455);
      t__9455 = G__9457;
      stack__9456 = G__9458;
      continue
    }else {
      return stack__9456
    }
    break
  }
};
cljs.core.PersistentTreeMapSeq = function(meta, stack, ascending_QMARK_, cnt, __hash) {
  this.meta = meta;
  this.stack = stack;
  this.ascending_QMARK_ = ascending_QMARK_;
  this.cnt = cnt;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 31850570
};
cljs.core.PersistentTreeMapSeq.cljs$lang$type = true;
cljs.core.PersistentTreeMapSeq.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentTreeMapSeq")
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9459 = this;
  var h__2192__auto____9460 = this__9459.__hash;
  if(!(h__2192__auto____9460 == null)) {
    return h__2192__auto____9460
  }else {
    var h__2192__auto____9461 = cljs.core.hash_coll.call(null, coll);
    this__9459.__hash = h__2192__auto____9461;
    return h__2192__auto____9461
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9462 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentTreeMapSeq.prototype.toString = function() {
  var this__9463 = this;
  var this__9464 = this;
  return cljs.core.pr_str.call(null, this__9464)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  var this__9465 = this;
  return this$
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9466 = this;
  if(this__9466.cnt < 0) {
    return cljs.core.count.call(null, cljs.core.next.call(null, coll)) + 1
  }else {
    return this__9466.cnt
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_first$arity$1 = function(this$) {
  var this__9467 = this;
  return cljs.core.peek.call(null, this__9467.stack)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$ISeq$_rest$arity$1 = function(this$) {
  var this__9468 = this;
  var t__9469 = cljs.core.first.call(null, this__9468.stack);
  var next_stack__9470 = cljs.core.tree_map_seq_push.call(null, this__9468.ascending_QMARK_ ? t__9469.right : t__9469.left, cljs.core.next.call(null, this__9468.stack), this__9468.ascending_QMARK_);
  if(!(next_stack__9470 == null)) {
    return new cljs.core.PersistentTreeMapSeq(null, next_stack__9470, this__9468.ascending_QMARK_, this__9468.cnt - 1, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9471 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9472 = this;
  return new cljs.core.PersistentTreeMapSeq(meta, this__9472.stack, this__9472.ascending_QMARK_, this__9472.cnt, this__9472.__hash)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9473 = this;
  return this__9473.meta
};
cljs.core.PersistentTreeMapSeq;
cljs.core.create_tree_map_seq = function create_tree_map_seq(tree, ascending_QMARK_, cnt) {
  return new cljs.core.PersistentTreeMapSeq(null, cljs.core.tree_map_seq_push.call(null, tree, null, ascending_QMARK_), ascending_QMARK_, cnt, null)
};
cljs.core.balance_left = function balance_left(key, val, ins, right) {
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins)) {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.left)) {
      return new cljs.core.RedNode(ins.key, ins.val, ins.left.blacken(), new cljs.core.BlackNode(key, val, ins.right, right, null), null)
    }else {
      if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.right)) {
        return new cljs.core.RedNode(ins.right.key, ins.right.val, new cljs.core.BlackNode(ins.key, ins.val, ins.left, ins.right.left, null), new cljs.core.BlackNode(key, val, ins.right.right, right, null), null)
      }else {
        if("\ufdd0'else") {
          return new cljs.core.BlackNode(key, val, ins, right, null)
        }else {
          return null
        }
      }
    }
  }else {
    return new cljs.core.BlackNode(key, val, ins, right, null)
  }
};
cljs.core.balance_right = function balance_right(key, val, left, ins) {
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins)) {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.right)) {
      return new cljs.core.RedNode(ins.key, ins.val, new cljs.core.BlackNode(key, val, left, ins.left, null), ins.right.blacken(), null)
    }else {
      if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, ins.left)) {
        return new cljs.core.RedNode(ins.left.key, ins.left.val, new cljs.core.BlackNode(key, val, left, ins.left.left, null), new cljs.core.BlackNode(ins.key, ins.val, ins.left.right, ins.right, null), null)
      }else {
        if("\ufdd0'else") {
          return new cljs.core.BlackNode(key, val, left, ins, null)
        }else {
          return null
        }
      }
    }
  }else {
    return new cljs.core.BlackNode(key, val, left, ins, null)
  }
};
cljs.core.balance_left_del = function balance_left_del(key, val, del, right) {
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, del)) {
    return new cljs.core.RedNode(key, val, del.blacken(), right, null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, right)) {
      return cljs.core.balance_right.call(null, key, val, del, right.redden())
    }else {
      if(function() {
        var and__3822__auto____9475 = cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right);
        if(and__3822__auto____9475) {
          return cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, right.left)
        }else {
          return and__3822__auto____9475
        }
      }()) {
        return new cljs.core.RedNode(right.left.key, right.left.val, new cljs.core.BlackNode(key, val, del, right.left.left, null), cljs.core.balance_right.call(null, right.key, right.val, right.left.right, right.right.redden()), null)
      }else {
        if("\ufdd0'else") {
          throw new Error("red-black tree invariant violation");
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.balance_right_del = function balance_right_del(key, val, left, del) {
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, del)) {
    return new cljs.core.RedNode(key, val, left, del.blacken(), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, left)) {
      return cljs.core.balance_left.call(null, key, val, left.redden(), del)
    }else {
      if(function() {
        var and__3822__auto____9477 = cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, left);
        if(and__3822__auto____9477) {
          return cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, left.right)
        }else {
          return and__3822__auto____9477
        }
      }()) {
        return new cljs.core.RedNode(left.right.key, left.right.val, cljs.core.balance_left.call(null, left.key, left.val, left.left.redden(), left.right.left), new cljs.core.BlackNode(key, val, left.right.right, del, null), null)
      }else {
        if("\ufdd0'else") {
          throw new Error("red-black tree invariant violation");
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.tree_map_kv_reduce = function tree_map_kv_reduce(node, f, init) {
  var init__9481 = f.call(null, init, node.key, node.val);
  if(cljs.core.reduced_QMARK_.call(null, init__9481)) {
    return cljs.core.deref.call(null, init__9481)
  }else {
    var init__9482 = !(node.left == null) ? tree_map_kv_reduce.call(null, node.left, f, init__9481) : init__9481;
    if(cljs.core.reduced_QMARK_.call(null, init__9482)) {
      return cljs.core.deref.call(null, init__9482)
    }else {
      var init__9483 = !(node.right == null) ? tree_map_kv_reduce.call(null, node.right, f, init__9482) : init__9482;
      if(cljs.core.reduced_QMARK_.call(null, init__9483)) {
        return cljs.core.deref.call(null, init__9483)
      }else {
        return init__9483
      }
    }
  }
};
cljs.core.BlackNode = function(key, val, left, right, __hash) {
  this.key = key;
  this.val = val;
  this.left = left;
  this.right = right;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32402207
};
cljs.core.BlackNode.cljs$lang$type = true;
cljs.core.BlackNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/BlackNode")
};
cljs.core.BlackNode.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9486 = this;
  var h__2192__auto____9487 = this__9486.__hash;
  if(!(h__2192__auto____9487 == null)) {
    return h__2192__auto____9487
  }else {
    var h__2192__auto____9488 = cljs.core.hash_coll.call(null, coll);
    this__9486.__hash = h__2192__auto____9488;
    return h__2192__auto____9488
  }
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__9489 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.BlackNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__9490 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.BlackNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__9491 = this;
  return cljs.core.assoc.call(null, cljs.core.PersistentVector.fromArray([this__9491.key, this__9491.val], true), k, v)
};
cljs.core.BlackNode.prototype.call = function() {
  var G__9539 = null;
  var G__9539__2 = function(this_sym9492, k) {
    var this__9494 = this;
    var this_sym9492__9495 = this;
    var node__9496 = this_sym9492__9495;
    return node__9496.cljs$core$ILookup$_lookup$arity$2(node__9496, k)
  };
  var G__9539__3 = function(this_sym9493, k, not_found) {
    var this__9494 = this;
    var this_sym9493__9497 = this;
    var node__9498 = this_sym9493__9497;
    return node__9498.cljs$core$ILookup$_lookup$arity$3(node__9498, k, not_found)
  };
  G__9539 = function(this_sym9493, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9539__2.call(this, this_sym9493, k);
      case 3:
        return G__9539__3.call(this, this_sym9493, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9539
}();
cljs.core.BlackNode.prototype.apply = function(this_sym9484, args9485) {
  var this__9499 = this;
  return this_sym9484.call.apply(this_sym9484, [this_sym9484].concat(args9485.slice()))
};
cljs.core.BlackNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__9500 = this;
  return cljs.core.PersistentVector.fromArray([this__9500.key, this__9500.val, o], true)
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__9501 = this;
  return this__9501.key
};
cljs.core.BlackNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__9502 = this;
  return this__9502.val
};
cljs.core.BlackNode.prototype.add_right = function(ins) {
  var this__9503 = this;
  var node__9504 = this;
  return ins.balance_right(node__9504)
};
cljs.core.BlackNode.prototype.redden = function() {
  var this__9505 = this;
  var node__9506 = this;
  return new cljs.core.RedNode(this__9505.key, this__9505.val, this__9505.left, this__9505.right, null)
};
cljs.core.BlackNode.prototype.remove_right = function(del) {
  var this__9507 = this;
  var node__9508 = this;
  return cljs.core.balance_right_del.call(null, this__9507.key, this__9507.val, this__9507.left, del)
};
cljs.core.BlackNode.prototype.replace = function(key, val, left, right) {
  var this__9509 = this;
  var node__9510 = this;
  return new cljs.core.BlackNode(key, val, left, right, null)
};
cljs.core.BlackNode.prototype.kv_reduce = function(f, init) {
  var this__9511 = this;
  var node__9512 = this;
  return cljs.core.tree_map_kv_reduce.call(null, node__9512, f, init)
};
cljs.core.BlackNode.prototype.remove_left = function(del) {
  var this__9513 = this;
  var node__9514 = this;
  return cljs.core.balance_left_del.call(null, this__9513.key, this__9513.val, del, this__9513.right)
};
cljs.core.BlackNode.prototype.add_left = function(ins) {
  var this__9515 = this;
  var node__9516 = this;
  return ins.balance_left(node__9516)
};
cljs.core.BlackNode.prototype.balance_left = function(parent) {
  var this__9517 = this;
  var node__9518 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, node__9518, parent.right, null)
};
cljs.core.BlackNode.prototype.toString = function() {
  var G__9540 = null;
  var G__9540__0 = function() {
    var this__9519 = this;
    var this__9521 = this;
    return cljs.core.pr_str.call(null, this__9521)
  };
  G__9540 = function() {
    switch(arguments.length) {
      case 0:
        return G__9540__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9540
}();
cljs.core.BlackNode.prototype.balance_right = function(parent) {
  var this__9522 = this;
  var node__9523 = this;
  return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__9523, null)
};
cljs.core.BlackNode.prototype.blacken = function() {
  var this__9524 = this;
  var node__9525 = this;
  return node__9525
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__9526 = this;
  return cljs.core.ci_reduce.call(null, node, f)
};
cljs.core.BlackNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__9527 = this;
  return cljs.core.ci_reduce.call(null, node, f, start)
};
cljs.core.BlackNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__9528 = this;
  return cljs.core.list.call(null, this__9528.key, this__9528.val)
};
cljs.core.BlackNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__9529 = this;
  return 2
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__9530 = this;
  return this__9530.val
};
cljs.core.BlackNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__9531 = this;
  return cljs.core.PersistentVector.fromArray([this__9531.key], true)
};
cljs.core.BlackNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__9532 = this;
  return cljs.core._assoc_n.call(null, cljs.core.PersistentVector.fromArray([this__9532.key, this__9532.val], true), n, v)
};
cljs.core.BlackNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9533 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.BlackNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__9534 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.fromArray([this__9534.key, this__9534.val], true), meta)
};
cljs.core.BlackNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__9535 = this;
  return null
};
cljs.core.BlackNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__9536 = this;
  if(n === 0) {
    return this__9536.key
  }else {
    if(n === 1) {
      return this__9536.val
    }else {
      if("\ufdd0'else") {
        return null
      }else {
        return null
      }
    }
  }
};
cljs.core.BlackNode.prototype.cljs$core$IIndexed$_nth$arity$3 = function(node, n, not_found) {
  var this__9537 = this;
  if(n === 0) {
    return this__9537.key
  }else {
    if(n === 1) {
      return this__9537.val
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.BlackNode.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(node) {
  var this__9538 = this;
  return cljs.core.PersistentVector.EMPTY
};
cljs.core.BlackNode;
cljs.core.RedNode = function(key, val, left, right, __hash) {
  this.key = key;
  this.val = val;
  this.left = left;
  this.right = right;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32402207
};
cljs.core.RedNode.cljs$lang$type = true;
cljs.core.RedNode.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/RedNode")
};
cljs.core.RedNode.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9543 = this;
  var h__2192__auto____9544 = this__9543.__hash;
  if(!(h__2192__auto____9544 == null)) {
    return h__2192__auto____9544
  }else {
    var h__2192__auto____9545 = cljs.core.hash_coll.call(null, coll);
    this__9543.__hash = h__2192__auto____9545;
    return h__2192__auto____9545
  }
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$2 = function(node, k) {
  var this__9546 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, null)
};
cljs.core.RedNode.prototype.cljs$core$ILookup$_lookup$arity$3 = function(node, k, not_found) {
  var this__9547 = this;
  return node.cljs$core$IIndexed$_nth$arity$3(node, k, not_found)
};
cljs.core.RedNode.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(node, k, v) {
  var this__9548 = this;
  return cljs.core.assoc.call(null, cljs.core.PersistentVector.fromArray([this__9548.key, this__9548.val], true), k, v)
};
cljs.core.RedNode.prototype.call = function() {
  var G__9596 = null;
  var G__9596__2 = function(this_sym9549, k) {
    var this__9551 = this;
    var this_sym9549__9552 = this;
    var node__9553 = this_sym9549__9552;
    return node__9553.cljs$core$ILookup$_lookup$arity$2(node__9553, k)
  };
  var G__9596__3 = function(this_sym9550, k, not_found) {
    var this__9551 = this;
    var this_sym9550__9554 = this;
    var node__9555 = this_sym9550__9554;
    return node__9555.cljs$core$ILookup$_lookup$arity$3(node__9555, k, not_found)
  };
  G__9596 = function(this_sym9550, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9596__2.call(this, this_sym9550, k);
      case 3:
        return G__9596__3.call(this, this_sym9550, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9596
}();
cljs.core.RedNode.prototype.apply = function(this_sym9541, args9542) {
  var this__9556 = this;
  return this_sym9541.call.apply(this_sym9541, [this_sym9541].concat(args9542.slice()))
};
cljs.core.RedNode.prototype.cljs$core$ICollection$_conj$arity$2 = function(node, o) {
  var this__9557 = this;
  return cljs.core.PersistentVector.fromArray([this__9557.key, this__9557.val, o], true)
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_key$arity$1 = function(node) {
  var this__9558 = this;
  return this__9558.key
};
cljs.core.RedNode.prototype.cljs$core$IMapEntry$_val$arity$1 = function(node) {
  var this__9559 = this;
  return this__9559.val
};
cljs.core.RedNode.prototype.add_right = function(ins) {
  var this__9560 = this;
  var node__9561 = this;
  return new cljs.core.RedNode(this__9560.key, this__9560.val, this__9560.left, ins, null)
};
cljs.core.RedNode.prototype.redden = function() {
  var this__9562 = this;
  var node__9563 = this;
  throw new Error("red-black tree invariant violation");
};
cljs.core.RedNode.prototype.remove_right = function(del) {
  var this__9564 = this;
  var node__9565 = this;
  return new cljs.core.RedNode(this__9564.key, this__9564.val, this__9564.left, del, null)
};
cljs.core.RedNode.prototype.replace = function(key, val, left, right) {
  var this__9566 = this;
  var node__9567 = this;
  return new cljs.core.RedNode(key, val, left, right, null)
};
cljs.core.RedNode.prototype.kv_reduce = function(f, init) {
  var this__9568 = this;
  var node__9569 = this;
  return cljs.core.tree_map_kv_reduce.call(null, node__9569, f, init)
};
cljs.core.RedNode.prototype.remove_left = function(del) {
  var this__9570 = this;
  var node__9571 = this;
  return new cljs.core.RedNode(this__9570.key, this__9570.val, del, this__9570.right, null)
};
cljs.core.RedNode.prototype.add_left = function(ins) {
  var this__9572 = this;
  var node__9573 = this;
  return new cljs.core.RedNode(this__9572.key, this__9572.val, ins, this__9572.right, null)
};
cljs.core.RedNode.prototype.balance_left = function(parent) {
  var this__9574 = this;
  var node__9575 = this;
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9574.left)) {
    return new cljs.core.RedNode(this__9574.key, this__9574.val, this__9574.left.blacken(), new cljs.core.BlackNode(parent.key, parent.val, this__9574.right, parent.right, null), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9574.right)) {
      return new cljs.core.RedNode(this__9574.right.key, this__9574.right.val, new cljs.core.BlackNode(this__9574.key, this__9574.val, this__9574.left, this__9574.right.left, null), new cljs.core.BlackNode(parent.key, parent.val, this__9574.right.right, parent.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, node__9575, parent.right, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.toString = function() {
  var G__9597 = null;
  var G__9597__0 = function() {
    var this__9576 = this;
    var this__9578 = this;
    return cljs.core.pr_str.call(null, this__9578)
  };
  G__9597 = function() {
    switch(arguments.length) {
      case 0:
        return G__9597__0.call(this)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9597
}();
cljs.core.RedNode.prototype.balance_right = function(parent) {
  var this__9579 = this;
  var node__9580 = this;
  if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9579.right)) {
    return new cljs.core.RedNode(this__9579.key, this__9579.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__9579.left, null), this__9579.right.blacken(), null)
  }else {
    if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, this__9579.left)) {
      return new cljs.core.RedNode(this__9579.left.key, this__9579.left.val, new cljs.core.BlackNode(parent.key, parent.val, parent.left, this__9579.left.left, null), new cljs.core.BlackNode(this__9579.key, this__9579.val, this__9579.left.right, this__9579.right, null), null)
    }else {
      if("\ufdd0'else") {
        return new cljs.core.BlackNode(parent.key, parent.val, parent.left, node__9580, null)
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.blacken = function() {
  var this__9581 = this;
  var node__9582 = this;
  return new cljs.core.BlackNode(this__9581.key, this__9581.val, this__9581.left, this__9581.right, null)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$2 = function(node, f) {
  var this__9583 = this;
  return cljs.core.ci_reduce.call(null, node, f)
};
cljs.core.RedNode.prototype.cljs$core$IReduce$_reduce$arity$3 = function(node, f, start) {
  var this__9584 = this;
  return cljs.core.ci_reduce.call(null, node, f, start)
};
cljs.core.RedNode.prototype.cljs$core$ISeqable$_seq$arity$1 = function(node) {
  var this__9585 = this;
  return cljs.core.list.call(null, this__9585.key, this__9585.val)
};
cljs.core.RedNode.prototype.cljs$core$ICounted$_count$arity$1 = function(node) {
  var this__9586 = this;
  return 2
};
cljs.core.RedNode.prototype.cljs$core$IStack$_peek$arity$1 = function(node) {
  var this__9587 = this;
  return this__9587.val
};
cljs.core.RedNode.prototype.cljs$core$IStack$_pop$arity$1 = function(node) {
  var this__9588 = this;
  return cljs.core.PersistentVector.fromArray([this__9588.key], true)
};
cljs.core.RedNode.prototype.cljs$core$IVector$_assoc_n$arity$3 = function(node, n, v) {
  var this__9589 = this;
  return cljs.core._assoc_n.call(null, cljs.core.PersistentVector.fromArray([this__9589.key, this__9589.val], true), n, v)
};
cljs.core.RedNode.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9590 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.RedNode.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(node, meta) {
  var this__9591 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentVector.fromArray([this__9591.key, this__9591.val], true), meta)
};
cljs.core.RedNode.prototype.cljs$core$IMeta$_meta$arity$1 = function(node) {
  var this__9592 = this;
  return null
};
cljs.core.RedNode.prototype.cljs$core$IIndexed$_nth$arity$2 = function(node, n) {
  var this__9593 = this;
  if(n === 0) {
    return this__9593.key
  }else {
    if(n === 1) {
      return this__9593.val
    }else {
      if("\ufdd0'else") {
        return null
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.cljs$core$IIndexed$_nth$arity$3 = function(node, n, not_found) {
  var this__9594 = this;
  if(n === 0) {
    return this__9594.key
  }else {
    if(n === 1) {
      return this__9594.val
    }else {
      if("\ufdd0'else") {
        return not_found
      }else {
        return null
      }
    }
  }
};
cljs.core.RedNode.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(node) {
  var this__9595 = this;
  return cljs.core.PersistentVector.EMPTY
};
cljs.core.RedNode;
cljs.core.tree_map_add = function tree_map_add(comp, tree, k, v, found) {
  if(tree == null) {
    return new cljs.core.RedNode(k, v, null, null, null)
  }else {
    var c__9601 = comp.call(null, k, tree.key);
    if(c__9601 === 0) {
      found[0] = tree;
      return null
    }else {
      if(c__9601 < 0) {
        var ins__9602 = tree_map_add.call(null, comp, tree.left, k, v, found);
        if(!(ins__9602 == null)) {
          return tree.add_left(ins__9602)
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var ins__9603 = tree_map_add.call(null, comp, tree.right, k, v, found);
          if(!(ins__9603 == null)) {
            return tree.add_right(ins__9603)
          }else {
            return null
          }
        }else {
          return null
        }
      }
    }
  }
};
cljs.core.tree_map_append = function tree_map_append(left, right) {
  if(left == null) {
    return right
  }else {
    if(right == null) {
      return left
    }else {
      if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, left)) {
        if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right)) {
          var app__9606 = tree_map_append.call(null, left.right, right.left);
          if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, app__9606)) {
            return new cljs.core.RedNode(app__9606.key, app__9606.val, new cljs.core.RedNode(left.key, left.val, left.left, app__9606.left, null), new cljs.core.RedNode(right.key, right.val, app__9606.right, right.right, null), null)
          }else {
            return new cljs.core.RedNode(left.key, left.val, left.left, new cljs.core.RedNode(right.key, right.val, app__9606, right.right, null), null)
          }
        }else {
          return new cljs.core.RedNode(left.key, left.val, left.left, tree_map_append.call(null, left.right, right), null)
        }
      }else {
        if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, right)) {
          return new cljs.core.RedNode(right.key, right.val, tree_map_append.call(null, left, right.left), right.right, null)
        }else {
          if("\ufdd0'else") {
            var app__9607 = tree_map_append.call(null, left.right, right.left);
            if(cljs.core.instance_QMARK_.call(null, cljs.core.RedNode, app__9607)) {
              return new cljs.core.RedNode(app__9607.key, app__9607.val, new cljs.core.BlackNode(left.key, left.val, left.left, app__9607.left, null), new cljs.core.BlackNode(right.key, right.val, app__9607.right, right.right, null), null)
            }else {
              return cljs.core.balance_left_del.call(null, left.key, left.val, left.left, new cljs.core.BlackNode(right.key, right.val, app__9607, right.right, null))
            }
          }else {
            return null
          }
        }
      }
    }
  }
};
cljs.core.tree_map_remove = function tree_map_remove(comp, tree, k, found) {
  if(!(tree == null)) {
    var c__9613 = comp.call(null, k, tree.key);
    if(c__9613 === 0) {
      found[0] = tree;
      return cljs.core.tree_map_append.call(null, tree.left, tree.right)
    }else {
      if(c__9613 < 0) {
        var del__9614 = tree_map_remove.call(null, comp, tree.left, k, found);
        if(function() {
          var or__3824__auto____9615 = !(del__9614 == null);
          if(or__3824__auto____9615) {
            return or__3824__auto____9615
          }else {
            return!(found[0] == null)
          }
        }()) {
          if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, tree.left)) {
            return cljs.core.balance_left_del.call(null, tree.key, tree.val, del__9614, tree.right)
          }else {
            return new cljs.core.RedNode(tree.key, tree.val, del__9614, tree.right, null)
          }
        }else {
          return null
        }
      }else {
        if("\ufdd0'else") {
          var del__9616 = tree_map_remove.call(null, comp, tree.right, k, found);
          if(function() {
            var or__3824__auto____9617 = !(del__9616 == null);
            if(or__3824__auto____9617) {
              return or__3824__auto____9617
            }else {
              return!(found[0] == null)
            }
          }()) {
            if(cljs.core.instance_QMARK_.call(null, cljs.core.BlackNode, tree.right)) {
              return cljs.core.balance_right_del.call(null, tree.key, tree.val, tree.left, del__9616)
            }else {
              return new cljs.core.RedNode(tree.key, tree.val, tree.left, del__9616, null)
            }
          }else {
            return null
          }
        }else {
          return null
        }
      }
    }
  }else {
    return null
  }
};
cljs.core.tree_map_replace = function tree_map_replace(comp, tree, k, v) {
  var tk__9620 = tree.key;
  var c__9621 = comp.call(null, k, tk__9620);
  if(c__9621 === 0) {
    return tree.replace(tk__9620, v, tree.left, tree.right)
  }else {
    if(c__9621 < 0) {
      return tree.replace(tk__9620, tree.val, tree_map_replace.call(null, comp, tree.left, k, v), tree.right)
    }else {
      if("\ufdd0'else") {
        return tree.replace(tk__9620, tree.val, tree.left, tree_map_replace.call(null, comp, tree.right, k, v))
      }else {
        return null
      }
    }
  }
};
cljs.core.PersistentTreeMap = function(comp, tree, cnt, meta, __hash) {
  this.comp = comp;
  this.tree = tree;
  this.cnt = cnt;
  this.meta = meta;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 418776847
};
cljs.core.PersistentTreeMap.cljs$lang$type = true;
cljs.core.PersistentTreeMap.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentTreeMap")
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9624 = this;
  var h__2192__auto____9625 = this__9624.__hash;
  if(!(h__2192__auto____9625 == null)) {
    return h__2192__auto____9625
  }else {
    var h__2192__auto____9626 = cljs.core.hash_imap.call(null, coll);
    this__9624.__hash = h__2192__auto____9626;
    return h__2192__auto____9626
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, k) {
  var this__9627 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, k, null)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, k, not_found) {
  var this__9628 = this;
  var n__9629 = coll.entry_at(k);
  if(!(n__9629 == null)) {
    return n__9629.val
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_assoc$arity$3 = function(coll, k, v) {
  var this__9630 = this;
  var found__9631 = [null];
  var t__9632 = cljs.core.tree_map_add.call(null, this__9630.comp, this__9630.tree, k, v, found__9631);
  if(t__9632 == null) {
    var found_node__9633 = cljs.core.nth.call(null, found__9631, 0);
    if(cljs.core._EQ_.call(null, v, found_node__9633.val)) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__9630.comp, cljs.core.tree_map_replace.call(null, this__9630.comp, this__9630.tree, k, v), this__9630.cnt, this__9630.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__9630.comp, t__9632.blacken(), this__9630.cnt + 1, this__9630.meta, null)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_$arity$2 = function(coll, k) {
  var this__9634 = this;
  return!(coll.entry_at(k) == null)
};
cljs.core.PersistentTreeMap.prototype.call = function() {
  var G__9668 = null;
  var G__9668__2 = function(this_sym9635, k) {
    var this__9637 = this;
    var this_sym9635__9638 = this;
    var coll__9639 = this_sym9635__9638;
    return coll__9639.cljs$core$ILookup$_lookup$arity$2(coll__9639, k)
  };
  var G__9668__3 = function(this_sym9636, k, not_found) {
    var this__9637 = this;
    var this_sym9636__9640 = this;
    var coll__9641 = this_sym9636__9640;
    return coll__9641.cljs$core$ILookup$_lookup$arity$3(coll__9641, k, not_found)
  };
  G__9668 = function(this_sym9636, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9668__2.call(this, this_sym9636, k);
      case 3:
        return G__9668__3.call(this, this_sym9636, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9668
}();
cljs.core.PersistentTreeMap.prototype.apply = function(this_sym9622, args9623) {
  var this__9642 = this;
  return this_sym9622.call.apply(this_sym9622, [this_sym9622].concat(args9623.slice()))
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IKVReduce$_kv_reduce$arity$3 = function(coll, f, init) {
  var this__9643 = this;
  if(!(this__9643.tree == null)) {
    return cljs.core.tree_map_kv_reduce.call(null, this__9643.tree, f, init)
  }else {
    return init
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, entry) {
  var this__9644 = this;
  if(cljs.core.vector_QMARK_.call(null, entry)) {
    return coll.cljs$core$IAssociative$_assoc$arity$3(coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__9645 = this;
  if(this__9645.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__9645.tree, false, this__9645.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.toString = function() {
  var this__9646 = this;
  var this__9647 = this;
  return cljs.core.pr_str.call(null, this__9647)
};
cljs.core.PersistentTreeMap.prototype.entry_at = function(k) {
  var this__9648 = this;
  var coll__9649 = this;
  var t__9650 = this__9648.tree;
  while(true) {
    if(!(t__9650 == null)) {
      var c__9651 = this__9648.comp.call(null, k, t__9650.key);
      if(c__9651 === 0) {
        return t__9650
      }else {
        if(c__9651 < 0) {
          var G__9669 = t__9650.left;
          t__9650 = G__9669;
          continue
        }else {
          if("\ufdd0'else") {
            var G__9670 = t__9650.right;
            t__9650 = G__9670;
            continue
          }else {
            return null
          }
        }
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_sorted_seq$arity$2 = function(coll, ascending_QMARK_) {
  var this__9652 = this;
  if(this__9652.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__9652.tree, ascending_QMARK_, this__9652.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__9653 = this;
  if(this__9653.cnt > 0) {
    var stack__9654 = null;
    var t__9655 = this__9653.tree;
    while(true) {
      if(!(t__9655 == null)) {
        var c__9656 = this__9653.comp.call(null, k, t__9655.key);
        if(c__9656 === 0) {
          return new cljs.core.PersistentTreeMapSeq(null, cljs.core.conj.call(null, stack__9654, t__9655), ascending_QMARK_, -1, null)
        }else {
          if(cljs.core.truth_(ascending_QMARK_)) {
            if(c__9656 < 0) {
              var G__9671 = cljs.core.conj.call(null, stack__9654, t__9655);
              var G__9672 = t__9655.left;
              stack__9654 = G__9671;
              t__9655 = G__9672;
              continue
            }else {
              var G__9673 = stack__9654;
              var G__9674 = t__9655.right;
              stack__9654 = G__9673;
              t__9655 = G__9674;
              continue
            }
          }else {
            if("\ufdd0'else") {
              if(c__9656 > 0) {
                var G__9675 = cljs.core.conj.call(null, stack__9654, t__9655);
                var G__9676 = t__9655.right;
                stack__9654 = G__9675;
                t__9655 = G__9676;
                continue
              }else {
                var G__9677 = stack__9654;
                var G__9678 = t__9655.left;
                stack__9654 = G__9677;
                t__9655 = G__9678;
                continue
              }
            }else {
              return null
            }
          }
        }
      }else {
        if(stack__9654 == null) {
          return new cljs.core.PersistentTreeMapSeq(null, stack__9654, ascending_QMARK_, -1, null)
        }else {
          return null
        }
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_entry_key$arity$2 = function(coll, entry) {
  var this__9657 = this;
  return cljs.core.key.call(null, entry)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__9658 = this;
  return this__9658.comp
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9659 = this;
  if(this__9659.cnt > 0) {
    return cljs.core.create_tree_map_seq.call(null, this__9659.tree, true, this__9659.cnt)
  }else {
    return null
  }
};
cljs.core.PersistentTreeMap.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9660 = this;
  return this__9660.cnt
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9661 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9662 = this;
  return new cljs.core.PersistentTreeMap(this__9662.comp, this__9662.tree, this__9662.cnt, meta, this__9662.__hash)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9663 = this;
  return this__9663.meta
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9664 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentTreeMap.EMPTY, this__9664.meta)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IMap$_dissoc$arity$2 = function(coll, k) {
  var this__9665 = this;
  var found__9666 = [null];
  var t__9667 = cljs.core.tree_map_remove.call(null, this__9665.comp, this__9665.tree, k, found__9666);
  if(t__9667 == null) {
    if(cljs.core.nth.call(null, found__9666, 0) == null) {
      return coll
    }else {
      return new cljs.core.PersistentTreeMap(this__9665.comp, null, 0, this__9665.meta, null)
    }
  }else {
    return new cljs.core.PersistentTreeMap(this__9665.comp, t__9667.blacken(), this__9665.cnt - 1, this__9665.meta, null)
  }
};
cljs.core.PersistentTreeMap;
cljs.core.PersistentTreeMap.EMPTY = new cljs.core.PersistentTreeMap(cljs.core.compare, null, 0, null, 0);
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in__9681 = cljs.core.seq.call(null, keyvals);
    var out__9682 = cljs.core.transient$.call(null, cljs.core.PersistentHashMap.EMPTY);
    while(true) {
      if(in__9681) {
        var G__9683 = cljs.core.nnext.call(null, in__9681);
        var G__9684 = cljs.core.assoc_BANG_.call(null, out__9682, cljs.core.first.call(null, in__9681), cljs.core.second.call(null, in__9681));
        in__9681 = G__9683;
        out__9682 = G__9684;
        continue
      }else {
        return cljs.core.persistent_BANG_.call(null, out__9682)
      }
      break
    }
  };
  var hash_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return hash_map__delegate.call(this, keyvals)
  };
  hash_map.cljs$lang$maxFixedArity = 0;
  hash_map.cljs$lang$applyTo = function(arglist__9685) {
    var keyvals = cljs.core.seq(arglist__9685);
    return hash_map__delegate(keyvals)
  };
  hash_map.cljs$lang$arity$variadic = hash_map__delegate;
  return hash_map
}();
cljs.core.array_map = function() {
  var array_map__delegate = function(keyvals) {
    return new cljs.core.PersistentArrayMap(null, cljs.core.quot.call(null, cljs.core.count.call(null, keyvals), 2), cljs.core.apply.call(null, cljs.core.array, keyvals), null)
  };
  var array_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return array_map__delegate.call(this, keyvals)
  };
  array_map.cljs$lang$maxFixedArity = 0;
  array_map.cljs$lang$applyTo = function(arglist__9686) {
    var keyvals = cljs.core.seq(arglist__9686);
    return array_map__delegate(keyvals)
  };
  array_map.cljs$lang$arity$variadic = array_map__delegate;
  return array_map
}();
cljs.core.obj_map = function() {
  var obj_map__delegate = function(keyvals) {
    var ks__9690 = [];
    var obj__9691 = {};
    var kvs__9692 = cljs.core.seq.call(null, keyvals);
    while(true) {
      if(kvs__9692) {
        ks__9690.push(cljs.core.first.call(null, kvs__9692));
        obj__9691[cljs.core.first.call(null, kvs__9692)] = cljs.core.second.call(null, kvs__9692);
        var G__9693 = cljs.core.nnext.call(null, kvs__9692);
        kvs__9692 = G__9693;
        continue
      }else {
        return cljs.core.ObjMap.fromObject.call(null, ks__9690, obj__9691)
      }
      break
    }
  };
  var obj_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return obj_map__delegate.call(this, keyvals)
  };
  obj_map.cljs$lang$maxFixedArity = 0;
  obj_map.cljs$lang$applyTo = function(arglist__9694) {
    var keyvals = cljs.core.seq(arglist__9694);
    return obj_map__delegate(keyvals)
  };
  obj_map.cljs$lang$arity$variadic = obj_map__delegate;
  return obj_map
}();
cljs.core.sorted_map = function() {
  var sorted_map__delegate = function(keyvals) {
    var in__9697 = cljs.core.seq.call(null, keyvals);
    var out__9698 = cljs.core.PersistentTreeMap.EMPTY;
    while(true) {
      if(in__9697) {
        var G__9699 = cljs.core.nnext.call(null, in__9697);
        var G__9700 = cljs.core.assoc.call(null, out__9698, cljs.core.first.call(null, in__9697), cljs.core.second.call(null, in__9697));
        in__9697 = G__9699;
        out__9698 = G__9700;
        continue
      }else {
        return out__9698
      }
      break
    }
  };
  var sorted_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return sorted_map__delegate.call(this, keyvals)
  };
  sorted_map.cljs$lang$maxFixedArity = 0;
  sorted_map.cljs$lang$applyTo = function(arglist__9701) {
    var keyvals = cljs.core.seq(arglist__9701);
    return sorted_map__delegate(keyvals)
  };
  sorted_map.cljs$lang$arity$variadic = sorted_map__delegate;
  return sorted_map
}();
cljs.core.sorted_map_by = function() {
  var sorted_map_by__delegate = function(comparator, keyvals) {
    var in__9704 = cljs.core.seq.call(null, keyvals);
    var out__9705 = new cljs.core.PersistentTreeMap(comparator, null, 0, null, 0);
    while(true) {
      if(in__9704) {
        var G__9706 = cljs.core.nnext.call(null, in__9704);
        var G__9707 = cljs.core.assoc.call(null, out__9705, cljs.core.first.call(null, in__9704), cljs.core.second.call(null, in__9704));
        in__9704 = G__9706;
        out__9705 = G__9707;
        continue
      }else {
        return out__9705
      }
      break
    }
  };
  var sorted_map_by = function(comparator, var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return sorted_map_by__delegate.call(this, comparator, keyvals)
  };
  sorted_map_by.cljs$lang$maxFixedArity = 1;
  sorted_map_by.cljs$lang$applyTo = function(arglist__9708) {
    var comparator = cljs.core.first(arglist__9708);
    var keyvals = cljs.core.rest(arglist__9708);
    return sorted_map_by__delegate(comparator, keyvals)
  };
  sorted_map_by.cljs$lang$arity$variadic = sorted_map_by__delegate;
  return sorted_map_by
}();
cljs.core.keys = function keys(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.first, hash_map))
};
cljs.core.key = function key(map_entry) {
  return cljs.core._key.call(null, map_entry)
};
cljs.core.vals = function vals(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.second, hash_map))
};
cljs.core.val = function val(map_entry) {
  return cljs.core._val.call(null, map_entry)
};
cljs.core.merge = function() {
  var merge__delegate = function(maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      return cljs.core.reduce.call(null, function(p1__9709_SHARP_, p2__9710_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3824__auto____9712 = p1__9709_SHARP_;
          if(cljs.core.truth_(or__3824__auto____9712)) {
            return or__3824__auto____9712
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), p2__9710_SHARP_)
      }, maps)
    }else {
      return null
    }
  };
  var merge = function(var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return merge__delegate.call(this, maps)
  };
  merge.cljs$lang$maxFixedArity = 0;
  merge.cljs$lang$applyTo = function(arglist__9713) {
    var maps = cljs.core.seq(arglist__9713);
    return merge__delegate(maps)
  };
  merge.cljs$lang$arity$variadic = merge__delegate;
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__9721 = function(m, e) {
        var k__9719 = cljs.core.first.call(null, e);
        var v__9720 = cljs.core.second.call(null, e);
        if(cljs.core.contains_QMARK_.call(null, m, k__9719)) {
          return cljs.core.assoc.call(null, m, k__9719, f.call(null, cljs.core._lookup.call(null, m, k__9719, null), v__9720))
        }else {
          return cljs.core.assoc.call(null, m, k__9719, v__9720)
        }
      };
      var merge2__9723 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__9721, function() {
          var or__3824__auto____9722 = m1;
          if(cljs.core.truth_(or__3824__auto____9722)) {
            return or__3824__auto____9722
          }else {
            return cljs.core.ObjMap.EMPTY
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__9723, maps)
    }else {
      return null
    }
  };
  var merge_with = function(f, var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return merge_with__delegate.call(this, f, maps)
  };
  merge_with.cljs$lang$maxFixedArity = 1;
  merge_with.cljs$lang$applyTo = function(arglist__9724) {
    var f = cljs.core.first(arglist__9724);
    var maps = cljs.core.rest(arglist__9724);
    return merge_with__delegate(f, maps)
  };
  merge_with.cljs$lang$arity$variadic = merge_with__delegate;
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__9729 = cljs.core.ObjMap.EMPTY;
  var keys__9730 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(keys__9730) {
      var key__9731 = cljs.core.first.call(null, keys__9730);
      var entry__9732 = cljs.core._lookup.call(null, map, key__9731, "\ufdd0'cljs.core/not-found");
      var G__9733 = cljs.core.not_EQ_.call(null, entry__9732, "\ufdd0'cljs.core/not-found") ? cljs.core.assoc.call(null, ret__9729, key__9731, entry__9732) : ret__9729;
      var G__9734 = cljs.core.next.call(null, keys__9730);
      ret__9729 = G__9733;
      keys__9730 = G__9734;
      continue
    }else {
      return ret__9729
    }
    break
  }
};
cljs.core.PersistentHashSet = function(meta, hash_map, __hash) {
  this.meta = meta;
  this.hash_map = hash_map;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 1;
  this.cljs$lang$protocol_mask$partition0$ = 15077647
};
cljs.core.PersistentHashSet.cljs$lang$type = true;
cljs.core.PersistentHashSet.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentHashSet")
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEditableCollection$_as_transient$arity$1 = function(coll) {
  var this__9738 = this;
  return new cljs.core.TransientHashSet(cljs.core.transient$.call(null, this__9738.hash_map))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9739 = this;
  var h__2192__auto____9740 = this__9739.__hash;
  if(!(h__2192__auto____9740 == null)) {
    return h__2192__auto____9740
  }else {
    var h__2192__auto____9741 = cljs.core.hash_iset.call(null, coll);
    this__9739.__hash = h__2192__auto____9741;
    return h__2192__auto____9741
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__9742 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__9743 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__9743.hash_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentHashSet.prototype.call = function() {
  var G__9764 = null;
  var G__9764__2 = function(this_sym9744, k) {
    var this__9746 = this;
    var this_sym9744__9747 = this;
    var coll__9748 = this_sym9744__9747;
    return coll__9748.cljs$core$ILookup$_lookup$arity$2(coll__9748, k)
  };
  var G__9764__3 = function(this_sym9745, k, not_found) {
    var this__9746 = this;
    var this_sym9745__9749 = this;
    var coll__9750 = this_sym9745__9749;
    return coll__9750.cljs$core$ILookup$_lookup$arity$3(coll__9750, k, not_found)
  };
  G__9764 = function(this_sym9745, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9764__2.call(this, this_sym9745, k);
      case 3:
        return G__9764__3.call(this, this_sym9745, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9764
}();
cljs.core.PersistentHashSet.prototype.apply = function(this_sym9736, args9737) {
  var this__9751 = this;
  return this_sym9736.call.apply(this_sym9736, [this_sym9736].concat(args9737.slice()))
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9752 = this;
  return new cljs.core.PersistentHashSet(this__9752.meta, cljs.core.assoc.call(null, this__9752.hash_map, o, null), null)
};
cljs.core.PersistentHashSet.prototype.toString = function() {
  var this__9753 = this;
  var this__9754 = this;
  return cljs.core.pr_str.call(null, this__9754)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9755 = this;
  return cljs.core.keys.call(null, this__9755.hash_map)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__9756 = this;
  return new cljs.core.PersistentHashSet(this__9756.meta, cljs.core.dissoc.call(null, this__9756.hash_map, v), null)
};
cljs.core.PersistentHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9757 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9758 = this;
  var and__3822__auto____9759 = cljs.core.set_QMARK_.call(null, other);
  if(and__3822__auto____9759) {
    var and__3822__auto____9760 = cljs.core.count.call(null, coll) === cljs.core.count.call(null, other);
    if(and__3822__auto____9760) {
      return cljs.core.every_QMARK_.call(null, function(p1__9735_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__9735_SHARP_)
      }, other)
    }else {
      return and__3822__auto____9760
    }
  }else {
    return and__3822__auto____9759
  }
};
cljs.core.PersistentHashSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9761 = this;
  return new cljs.core.PersistentHashSet(meta, this__9761.hash_map, this__9761.__hash)
};
cljs.core.PersistentHashSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9762 = this;
  return this__9762.meta
};
cljs.core.PersistentHashSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9763 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentHashSet.EMPTY, this__9763.meta)
};
cljs.core.PersistentHashSet;
cljs.core.PersistentHashSet.EMPTY = new cljs.core.PersistentHashSet(null, cljs.core.hash_map.call(null), 0);
cljs.core.PersistentHashSet.fromArray = function(items) {
  var len__9765 = cljs.core.count.call(null, items);
  var i__9766 = 0;
  var out__9767 = cljs.core.transient$.call(null, cljs.core.PersistentHashSet.EMPTY);
  while(true) {
    if(i__9766 < len__9765) {
      var G__9768 = i__9766 + 1;
      var G__9769 = cljs.core.conj_BANG_.call(null, out__9767, items[i__9766]);
      i__9766 = G__9768;
      out__9767 = G__9769;
      continue
    }else {
      return cljs.core.persistent_BANG_.call(null, out__9767)
    }
    break
  }
};
cljs.core.TransientHashSet = function(transient_map) {
  this.transient_map = transient_map;
  this.cljs$lang$protocol_mask$partition0$ = 259;
  this.cljs$lang$protocol_mask$partition1$ = 34
};
cljs.core.TransientHashSet.cljs$lang$type = true;
cljs.core.TransientHashSet.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/TransientHashSet")
};
cljs.core.TransientHashSet.prototype.call = function() {
  var G__9787 = null;
  var G__9787__2 = function(this_sym9773, k) {
    var this__9775 = this;
    var this_sym9773__9776 = this;
    var tcoll__9777 = this_sym9773__9776;
    if(cljs.core._lookup.call(null, this__9775.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return null
    }else {
      return k
    }
  };
  var G__9787__3 = function(this_sym9774, k, not_found) {
    var this__9775 = this;
    var this_sym9774__9778 = this;
    var tcoll__9779 = this_sym9774__9778;
    if(cljs.core._lookup.call(null, this__9775.transient_map, k, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
      return not_found
    }else {
      return k
    }
  };
  G__9787 = function(this_sym9774, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9787__2.call(this, this_sym9774, k);
      case 3:
        return G__9787__3.call(this, this_sym9774, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9787
}();
cljs.core.TransientHashSet.prototype.apply = function(this_sym9771, args9772) {
  var this__9780 = this;
  return this_sym9771.call.apply(this_sym9771, [this_sym9771].concat(args9772.slice()))
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(tcoll, v) {
  var this__9781 = this;
  return tcoll.cljs$core$ILookup$_lookup$arity$3(tcoll, v, null)
};
cljs.core.TransientHashSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(tcoll, v, not_found) {
  var this__9782 = this;
  if(cljs.core._lookup.call(null, this__9782.transient_map, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel) {
    return not_found
  }else {
    return v
  }
};
cljs.core.TransientHashSet.prototype.cljs$core$ICounted$_count$arity$1 = function(tcoll) {
  var this__9783 = this;
  return cljs.core.count.call(null, this__9783.transient_map)
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientSet$_disjoin_BANG_$arity$2 = function(tcoll, v) {
  var this__9784 = this;
  this__9784.transient_map = cljs.core.dissoc_BANG_.call(null, this__9784.transient_map, v);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_conj_BANG_$arity$2 = function(tcoll, o) {
  var this__9785 = this;
  this__9785.transient_map = cljs.core.assoc_BANG_.call(null, this__9785.transient_map, o, null);
  return tcoll
};
cljs.core.TransientHashSet.prototype.cljs$core$ITransientCollection$_persistent_BANG_$arity$1 = function(tcoll) {
  var this__9786 = this;
  return new cljs.core.PersistentHashSet(null, cljs.core.persistent_BANG_.call(null, this__9786.transient_map), null)
};
cljs.core.TransientHashSet;
cljs.core.PersistentTreeSet = function(meta, tree_map, __hash) {
  this.meta = meta;
  this.tree_map = tree_map;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 417730831
};
cljs.core.PersistentTreeSet.cljs$lang$type = true;
cljs.core.PersistentTreeSet.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/PersistentTreeSet")
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IHash$_hash$arity$1 = function(coll) {
  var this__9790 = this;
  var h__2192__auto____9791 = this__9790.__hash;
  if(!(h__2192__auto____9791 == null)) {
    return h__2192__auto____9791
  }else {
    var h__2192__auto____9792 = cljs.core.hash_iset.call(null, coll);
    this__9790.__hash = h__2192__auto____9792;
    return h__2192__auto____9792
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$2 = function(coll, v) {
  var this__9793 = this;
  return coll.cljs$core$ILookup$_lookup$arity$3(coll, v, null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ILookup$_lookup$arity$3 = function(coll, v, not_found) {
  var this__9794 = this;
  if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__9794.tree_map, v))) {
    return v
  }else {
    return not_found
  }
};
cljs.core.PersistentTreeSet.prototype.call = function() {
  var G__9820 = null;
  var G__9820__2 = function(this_sym9795, k) {
    var this__9797 = this;
    var this_sym9795__9798 = this;
    var coll__9799 = this_sym9795__9798;
    return coll__9799.cljs$core$ILookup$_lookup$arity$2(coll__9799, k)
  };
  var G__9820__3 = function(this_sym9796, k, not_found) {
    var this__9797 = this;
    var this_sym9796__9800 = this;
    var coll__9801 = this_sym9796__9800;
    return coll__9801.cljs$core$ILookup$_lookup$arity$3(coll__9801, k, not_found)
  };
  G__9820 = function(this_sym9796, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9820__2.call(this, this_sym9796, k);
      case 3:
        return G__9820__3.call(this, this_sym9796, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9820
}();
cljs.core.PersistentTreeSet.prototype.apply = function(this_sym9788, args9789) {
  var this__9802 = this;
  return this_sym9788.call.apply(this_sym9788, [this_sym9788].concat(args9789.slice()))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICollection$_conj$arity$2 = function(coll, o) {
  var this__9803 = this;
  return new cljs.core.PersistentTreeSet(this__9803.meta, cljs.core.assoc.call(null, this__9803.tree_map, o, null), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IReversible$_rseq$arity$1 = function(coll) {
  var this__9804 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core.rseq.call(null, this__9804.tree_map))
};
cljs.core.PersistentTreeSet.prototype.toString = function() {
  var this__9805 = this;
  var this__9806 = this;
  return cljs.core.pr_str.call(null, this__9806)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq$arity$2 = function(coll, ascending_QMARK_) {
  var this__9807 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core._sorted_seq.call(null, this__9807.tree_map, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_sorted_seq_from$arity$3 = function(coll, k, ascending_QMARK_) {
  var this__9808 = this;
  return cljs.core.map.call(null, cljs.core.key, cljs.core._sorted_seq_from.call(null, this__9808.tree_map, k, ascending_QMARK_))
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_entry_key$arity$2 = function(coll, entry) {
  var this__9809 = this;
  return entry
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISorted$_comparator$arity$1 = function(coll) {
  var this__9810 = this;
  return cljs.core._comparator.call(null, this__9810.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISeqable$_seq$arity$1 = function(coll) {
  var this__9811 = this;
  return cljs.core.keys.call(null, this__9811.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ISet$_disjoin$arity$2 = function(coll, v) {
  var this__9812 = this;
  return new cljs.core.PersistentTreeSet(this__9812.meta, cljs.core.dissoc.call(null, this__9812.tree_map, v), null)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$ICounted$_count$arity$1 = function(coll) {
  var this__9813 = this;
  return cljs.core.count.call(null, this__9813.tree_map)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(coll, other) {
  var this__9814 = this;
  var and__3822__auto____9815 = cljs.core.set_QMARK_.call(null, other);
  if(and__3822__auto____9815) {
    var and__3822__auto____9816 = cljs.core.count.call(null, coll) === cljs.core.count.call(null, other);
    if(and__3822__auto____9816) {
      return cljs.core.every_QMARK_.call(null, function(p1__9770_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__9770_SHARP_)
      }, other)
    }else {
      return and__3822__auto____9816
    }
  }else {
    return and__3822__auto____9815
  }
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(coll, meta) {
  var this__9817 = this;
  return new cljs.core.PersistentTreeSet(meta, this__9817.tree_map, this__9817.__hash)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IMeta$_meta$arity$1 = function(coll) {
  var this__9818 = this;
  return this__9818.meta
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(coll) {
  var this__9819 = this;
  return cljs.core.with_meta.call(null, cljs.core.PersistentTreeSet.EMPTY, this__9819.meta)
};
cljs.core.PersistentTreeSet;
cljs.core.PersistentTreeSet.EMPTY = new cljs.core.PersistentTreeSet(null, cljs.core.sorted_map.call(null), 0);
cljs.core.hash_set = function() {
  var hash_set = null;
  var hash_set__0 = function() {
    return cljs.core.PersistentHashSet.EMPTY
  };
  var hash_set__1 = function() {
    var G__9825__delegate = function(keys) {
      var in__9823 = cljs.core.seq.call(null, keys);
      var out__9824 = cljs.core.transient$.call(null, cljs.core.PersistentHashSet.EMPTY);
      while(true) {
        if(cljs.core.seq.call(null, in__9823)) {
          var G__9826 = cljs.core.next.call(null, in__9823);
          var G__9827 = cljs.core.conj_BANG_.call(null, out__9824, cljs.core.first.call(null, in__9823));
          in__9823 = G__9826;
          out__9824 = G__9827;
          continue
        }else {
          return cljs.core.persistent_BANG_.call(null, out__9824)
        }
        break
      }
    };
    var G__9825 = function(var_args) {
      var keys = null;
      if(goog.isDef(var_args)) {
        keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__9825__delegate.call(this, keys)
    };
    G__9825.cljs$lang$maxFixedArity = 0;
    G__9825.cljs$lang$applyTo = function(arglist__9828) {
      var keys = cljs.core.seq(arglist__9828);
      return G__9825__delegate(keys)
    };
    G__9825.cljs$lang$arity$variadic = G__9825__delegate;
    return G__9825
  }();
  hash_set = function(var_args) {
    var keys = var_args;
    switch(arguments.length) {
      case 0:
        return hash_set__0.call(this);
      default:
        return hash_set__1.cljs$lang$arity$variadic(cljs.core.array_seq(arguments, 0))
    }
    throw"Invalid arity: " + arguments.length;
  };
  hash_set.cljs$lang$maxFixedArity = 0;
  hash_set.cljs$lang$applyTo = hash_set__1.cljs$lang$applyTo;
  hash_set.cljs$lang$arity$0 = hash_set__0;
  hash_set.cljs$lang$arity$variadic = hash_set__1.cljs$lang$arity$variadic;
  return hash_set
}();
cljs.core.set = function set(coll) {
  return cljs.core.apply.call(null, cljs.core.hash_set, coll)
};
cljs.core.sorted_set = function() {
  var sorted_set__delegate = function(keys) {
    return cljs.core.reduce.call(null, cljs.core._conj, cljs.core.PersistentTreeSet.EMPTY, keys)
  };
  var sorted_set = function(var_args) {
    var keys = null;
    if(goog.isDef(var_args)) {
      keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return sorted_set__delegate.call(this, keys)
  };
  sorted_set.cljs$lang$maxFixedArity = 0;
  sorted_set.cljs$lang$applyTo = function(arglist__9829) {
    var keys = cljs.core.seq(arglist__9829);
    return sorted_set__delegate(keys)
  };
  sorted_set.cljs$lang$arity$variadic = sorted_set__delegate;
  return sorted_set
}();
cljs.core.sorted_set_by = function() {
  var sorted_set_by__delegate = function(comparator, keys) {
    return cljs.core.reduce.call(null, cljs.core._conj, new cljs.core.PersistentTreeSet(null, cljs.core.sorted_map_by.call(null, comparator), 0), keys)
  };
  var sorted_set_by = function(comparator, var_args) {
    var keys = null;
    if(goog.isDef(var_args)) {
      keys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return sorted_set_by__delegate.call(this, comparator, keys)
  };
  sorted_set_by.cljs$lang$maxFixedArity = 1;
  sorted_set_by.cljs$lang$applyTo = function(arglist__9831) {
    var comparator = cljs.core.first(arglist__9831);
    var keys = cljs.core.rest(arglist__9831);
    return sorted_set_by__delegate(comparator, keys)
  };
  sorted_set_by.cljs$lang$arity$variadic = sorted_set_by__delegate;
  return sorted_set_by
}();
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.vector_QMARK_.call(null, coll)) {
    var n__9837 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3971__auto____9838 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3971__auto____9838)) {
        var e__9839 = temp__3971__auto____9838;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__9839))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__9837, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__9830_SHARP_) {
      var temp__3971__auto____9840 = cljs.core.find.call(null, smap, p1__9830_SHARP_);
      if(cljs.core.truth_(temp__3971__auto____9840)) {
        var e__9841 = temp__3971__auto____9840;
        return cljs.core.second.call(null, e__9841)
      }else {
        return p1__9830_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__9871 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__9864, seen) {
        while(true) {
          var vec__9865__9866 = p__9864;
          var f__9867 = cljs.core.nth.call(null, vec__9865__9866, 0, null);
          var xs__9868 = vec__9865__9866;
          var temp__3974__auto____9869 = cljs.core.seq.call(null, xs__9868);
          if(temp__3974__auto____9869) {
            var s__9870 = temp__3974__auto____9869;
            if(cljs.core.contains_QMARK_.call(null, seen, f__9867)) {
              var G__9872 = cljs.core.rest.call(null, s__9870);
              var G__9873 = seen;
              p__9864 = G__9872;
              seen = G__9873;
              continue
            }else {
              return cljs.core.cons.call(null, f__9867, step.call(null, cljs.core.rest.call(null, s__9870), cljs.core.conj.call(null, seen, f__9867)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    }, null)
  };
  return step__9871.call(null, coll, cljs.core.PersistentHashSet.EMPTY)
};
cljs.core.butlast = function butlast(s) {
  var ret__9876 = cljs.core.PersistentVector.EMPTY;
  var s__9877 = s;
  while(true) {
    if(cljs.core.next.call(null, s__9877)) {
      var G__9878 = cljs.core.conj.call(null, ret__9876, cljs.core.first.call(null, s__9877));
      var G__9879 = cljs.core.next.call(null, s__9877);
      ret__9876 = G__9878;
      s__9877 = G__9879;
      continue
    }else {
      return cljs.core.seq.call(null, ret__9876)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.string_QMARK_.call(null, x)) {
    return x
  }else {
    if(function() {
      var or__3824__auto____9882 = cljs.core.keyword_QMARK_.call(null, x);
      if(or__3824__auto____9882) {
        return or__3824__auto____9882
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }()) {
      var i__9883 = x.lastIndexOf("/");
      if(i__9883 < 0) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__9883 + 1)
      }
    }else {
      if("\ufdd0'else") {
        throw new Error([cljs.core.str("Doesn't support name: "), cljs.core.str(x)].join(""));
      }else {
        return null
      }
    }
  }
};
cljs.core.namespace = function namespace(x) {
  if(function() {
    var or__3824__auto____9886 = cljs.core.keyword_QMARK_.call(null, x);
    if(or__3824__auto____9886) {
      return or__3824__auto____9886
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }()) {
    var i__9887 = x.lastIndexOf("/");
    if(i__9887 > -1) {
      return cljs.core.subs.call(null, x, 2, i__9887)
    }else {
      return null
    }
  }else {
    throw new Error([cljs.core.str("Doesn't support namespace: "), cljs.core.str(x)].join(""));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__9894 = cljs.core.ObjMap.EMPTY;
  var ks__9895 = cljs.core.seq.call(null, keys);
  var vs__9896 = cljs.core.seq.call(null, vals);
  while(true) {
    if(function() {
      var and__3822__auto____9897 = ks__9895;
      if(and__3822__auto____9897) {
        return vs__9896
      }else {
        return and__3822__auto____9897
      }
    }()) {
      var G__9898 = cljs.core.assoc.call(null, map__9894, cljs.core.first.call(null, ks__9895), cljs.core.first.call(null, vs__9896));
      var G__9899 = cljs.core.next.call(null, ks__9895);
      var G__9900 = cljs.core.next.call(null, vs__9896);
      map__9894 = G__9898;
      ks__9895 = G__9899;
      vs__9896 = G__9900;
      continue
    }else {
      return map__9894
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__2 = function(k, x) {
    return x
  };
  var max_key__3 = function(k, x, y) {
    if(k.call(null, x) > k.call(null, y)) {
      return x
    }else {
      return y
    }
  };
  var max_key__4 = function() {
    var G__9903__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__9888_SHARP_, p2__9889_SHARP_) {
        return max_key.call(null, k, p1__9888_SHARP_, p2__9889_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__9903 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9903__delegate.call(this, k, x, y, more)
    };
    G__9903.cljs$lang$maxFixedArity = 3;
    G__9903.cljs$lang$applyTo = function(arglist__9904) {
      var k = cljs.core.first(arglist__9904);
      var x = cljs.core.first(cljs.core.next(arglist__9904));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9904)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9904)));
      return G__9903__delegate(k, x, y, more)
    };
    G__9903.cljs$lang$arity$variadic = G__9903__delegate;
    return G__9903
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__2.call(this, k, x);
      case 3:
        return max_key__3.call(this, k, x, y);
      default:
        return max_key__4.cljs$lang$arity$variadic(k, x, y, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__4.cljs$lang$applyTo;
  max_key.cljs$lang$arity$2 = max_key__2;
  max_key.cljs$lang$arity$3 = max_key__3;
  max_key.cljs$lang$arity$variadic = max_key__4.cljs$lang$arity$variadic;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__2 = function(k, x) {
    return x
  };
  var min_key__3 = function(k, x, y) {
    if(k.call(null, x) < k.call(null, y)) {
      return x
    }else {
      return y
    }
  };
  var min_key__4 = function() {
    var G__9905__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__9901_SHARP_, p2__9902_SHARP_) {
        return min_key.call(null, k, p1__9901_SHARP_, p2__9902_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__9905 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__9905__delegate.call(this, k, x, y, more)
    };
    G__9905.cljs$lang$maxFixedArity = 3;
    G__9905.cljs$lang$applyTo = function(arglist__9906) {
      var k = cljs.core.first(arglist__9906);
      var x = cljs.core.first(cljs.core.next(arglist__9906));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__9906)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__9906)));
      return G__9905__delegate(k, x, y, more)
    };
    G__9905.cljs$lang$arity$variadic = G__9905__delegate;
    return G__9905
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__2.call(this, k, x);
      case 3:
        return min_key__3.call(this, k, x, y);
      default:
        return min_key__4.cljs$lang$arity$variadic(k, x, y, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__4.cljs$lang$applyTo;
  min_key.cljs$lang$arity$2 = min_key__2;
  min_key.cljs$lang$arity$3 = min_key__3;
  min_key.cljs$lang$arity$variadic = min_key__4.cljs$lang$arity$variadic;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__2 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__3 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____9909 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____9909) {
        var s__9910 = temp__3974__auto____9909;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__9910), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__9910)))
      }else {
        return null
      }
    }, null)
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__2.call(this, n, step);
      case 3:
        return partition_all__3.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partition_all.cljs$lang$arity$2 = partition_all__2;
  partition_all.cljs$lang$arity$3 = partition_all__3;
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____9913 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____9913) {
      var s__9914 = temp__3974__auto____9913;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__9914)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__9914), take_while.call(null, pred, cljs.core.rest.call(null, s__9914)))
      }else {
        return null
      }
    }else {
      return null
    }
  }, null)
};
cljs.core.mk_bound_fn = function mk_bound_fn(sc, test, key) {
  return function(e) {
    var comp__9916 = cljs.core._comparator.call(null, sc);
    return test.call(null, comp__9916.call(null, cljs.core._entry_key.call(null, sc, e), key), 0)
  }
};
cljs.core.subseq = function() {
  var subseq = null;
  var subseq__3 = function(sc, test, key) {
    var include__9928 = cljs.core.mk_bound_fn.call(null, sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._GT_, cljs.core._GT__EQ_]).call(null, test))) {
      var temp__3974__auto____9929 = cljs.core._sorted_seq_from.call(null, sc, key, true);
      if(cljs.core.truth_(temp__3974__auto____9929)) {
        var vec__9930__9931 = temp__3974__auto____9929;
        var e__9932 = cljs.core.nth.call(null, vec__9930__9931, 0, null);
        var s__9933 = vec__9930__9931;
        if(cljs.core.truth_(include__9928.call(null, e__9932))) {
          return s__9933
        }else {
          return cljs.core.next.call(null, s__9933)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while.call(null, include__9928, cljs.core._sorted_seq.call(null, sc, true))
    }
  };
  var subseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____9934 = cljs.core._sorted_seq_from.call(null, sc, start_key, true);
    if(cljs.core.truth_(temp__3974__auto____9934)) {
      var vec__9935__9936 = temp__3974__auto____9934;
      var e__9937 = cljs.core.nth.call(null, vec__9935__9936, 0, null);
      var s__9938 = vec__9935__9936;
      return cljs.core.take_while.call(null, cljs.core.mk_bound_fn.call(null, sc, end_test, end_key), cljs.core.truth_(cljs.core.mk_bound_fn.call(null, sc, start_test, start_key).call(null, e__9937)) ? s__9938 : cljs.core.next.call(null, s__9938))
    }else {
      return null
    }
  };
  subseq = function(sc, start_test, start_key, end_test, end_key) {
    switch(arguments.length) {
      case 3:
        return subseq__3.call(this, sc, start_test, start_key);
      case 5:
        return subseq__5.call(this, sc, start_test, start_key, end_test, end_key)
    }
    throw"Invalid arity: " + arguments.length;
  };
  subseq.cljs$lang$arity$3 = subseq__3;
  subseq.cljs$lang$arity$5 = subseq__5;
  return subseq
}();
cljs.core.rsubseq = function() {
  var rsubseq = null;
  var rsubseq__3 = function(sc, test, key) {
    var include__9950 = cljs.core.mk_bound_fn.call(null, sc, test, key);
    if(cljs.core.truth_(cljs.core.PersistentHashSet.fromArray([cljs.core._LT_, cljs.core._LT__EQ_]).call(null, test))) {
      var temp__3974__auto____9951 = cljs.core._sorted_seq_from.call(null, sc, key, false);
      if(cljs.core.truth_(temp__3974__auto____9951)) {
        var vec__9952__9953 = temp__3974__auto____9951;
        var e__9954 = cljs.core.nth.call(null, vec__9952__9953, 0, null);
        var s__9955 = vec__9952__9953;
        if(cljs.core.truth_(include__9950.call(null, e__9954))) {
          return s__9955
        }else {
          return cljs.core.next.call(null, s__9955)
        }
      }else {
        return null
      }
    }else {
      return cljs.core.take_while.call(null, include__9950, cljs.core._sorted_seq.call(null, sc, false))
    }
  };
  var rsubseq__5 = function(sc, start_test, start_key, end_test, end_key) {
    var temp__3974__auto____9956 = cljs.core._sorted_seq_from.call(null, sc, end_key, false);
    if(cljs.core.truth_(temp__3974__auto____9956)) {
      var vec__9957__9958 = temp__3974__auto____9956;
      var e__9959 = cljs.core.nth.call(null, vec__9957__9958, 0, null);
      var s__9960 = vec__9957__9958;
      return cljs.core.take_while.call(null, cljs.core.mk_bound_fn.call(null, sc, start_test, start_key), cljs.core.truth_(cljs.core.mk_bound_fn.call(null, sc, end_test, end_key).call(null, e__9959)) ? s__9960 : cljs.core.next.call(null, s__9960))
    }else {
      return null
    }
  };
  rsubseq = function(sc, start_test, start_key, end_test, end_key) {
    switch(arguments.length) {
      case 3:
        return rsubseq__3.call(this, sc, start_test, start_key);
      case 5:
        return rsubseq__5.call(this, sc, start_test, start_key, end_test, end_key)
    }
    throw"Invalid arity: " + arguments.length;
  };
  rsubseq.cljs$lang$arity$3 = rsubseq__3;
  rsubseq.cljs$lang$arity$5 = rsubseq__5;
  return rsubseq
}();
cljs.core.Range = function(meta, start, end, step, __hash) {
  this.meta = meta;
  this.start = start;
  this.end = end;
  this.step = step;
  this.__hash = __hash;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 32375006
};
cljs.core.Range.cljs$lang$type = true;
cljs.core.Range.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Range")
};
cljs.core.Range.prototype.cljs$core$IHash$_hash$arity$1 = function(rng) {
  var this__9961 = this;
  var h__2192__auto____9962 = this__9961.__hash;
  if(!(h__2192__auto____9962 == null)) {
    return h__2192__auto____9962
  }else {
    var h__2192__auto____9963 = cljs.core.hash_coll.call(null, rng);
    this__9961.__hash = h__2192__auto____9963;
    return h__2192__auto____9963
  }
};
cljs.core.Range.prototype.cljs$core$INext$_next$arity$1 = function(rng) {
  var this__9964 = this;
  if(this__9964.step > 0) {
    if(this__9964.start + this__9964.step < this__9964.end) {
      return new cljs.core.Range(this__9964.meta, this__9964.start + this__9964.step, this__9964.end, this__9964.step, null)
    }else {
      return null
    }
  }else {
    if(this__9964.start + this__9964.step > this__9964.end) {
      return new cljs.core.Range(this__9964.meta, this__9964.start + this__9964.step, this__9964.end, this__9964.step, null)
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICollection$_conj$arity$2 = function(rng, o) {
  var this__9965 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.toString = function() {
  var this__9966 = this;
  var this__9967 = this;
  return cljs.core.pr_str.call(null, this__9967)
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$2 = function(rng, f) {
  var this__9968 = this;
  return cljs.core.ci_reduce.call(null, rng, f)
};
cljs.core.Range.prototype.cljs$core$IReduce$_reduce$arity$3 = function(rng, f, s) {
  var this__9969 = this;
  return cljs.core.ci_reduce.call(null, rng, f, s)
};
cljs.core.Range.prototype.cljs$core$ISeqable$_seq$arity$1 = function(rng) {
  var this__9970 = this;
  if(this__9970.step > 0) {
    if(this__9970.start < this__9970.end) {
      return rng
    }else {
      return null
    }
  }else {
    if(this__9970.start > this__9970.end) {
      return rng
    }else {
      return null
    }
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$_count$arity$1 = function(rng) {
  var this__9971 = this;
  if(cljs.core.not.call(null, rng.cljs$core$ISeqable$_seq$arity$1(rng))) {
    return 0
  }else {
    return Math.ceil((this__9971.end - this__9971.start) / this__9971.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$_first$arity$1 = function(rng) {
  var this__9972 = this;
  return this__9972.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest$arity$1 = function(rng) {
  var this__9973 = this;
  if(!(rng.cljs$core$ISeqable$_seq$arity$1(rng) == null)) {
    return new cljs.core.Range(this__9973.meta, this__9973.start + this__9973.step, this__9973.end, this__9973.step, null)
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(rng, other) {
  var this__9974 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta$arity$2 = function(rng, meta) {
  var this__9975 = this;
  return new cljs.core.Range(meta, this__9975.start, this__9975.end, this__9975.step, this__9975.__hash)
};
cljs.core.Range.prototype.cljs$core$IMeta$_meta$arity$1 = function(rng) {
  var this__9976 = this;
  return this__9976.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$2 = function(rng, n) {
  var this__9977 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__9977.start + n * this__9977.step
  }else {
    if(function() {
      var and__3822__auto____9978 = this__9977.start > this__9977.end;
      if(and__3822__auto____9978) {
        return this__9977.step === 0
      }else {
        return and__3822__auto____9978
      }
    }()) {
      return this__9977.start
    }else {
      throw new Error("Index out of bounds");
    }
  }
};
cljs.core.Range.prototype.cljs$core$IIndexed$_nth$arity$3 = function(rng, n, not_found) {
  var this__9979 = this;
  if(n < rng.cljs$core$ICounted$_count$arity$1(rng)) {
    return this__9979.start + n * this__9979.step
  }else {
    if(function() {
      var and__3822__auto____9980 = this__9979.start > this__9979.end;
      if(and__3822__auto____9980) {
        return this__9979.step === 0
      }else {
        return and__3822__auto____9980
      }
    }()) {
      return this__9979.start
    }else {
      return not_found
    }
  }
};
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty$arity$1 = function(rng) {
  var this__9981 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__9981.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__0 = function() {
    return range.call(null, 0, Number.MAX_VALUE, 1)
  };
  var range__1 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__2 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__3 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step, null)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__0.call(this);
      case 1:
        return range__1.call(this, start);
      case 2:
        return range__2.call(this, start, end);
      case 3:
        return range__3.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  range.cljs$lang$arity$0 = range__0;
  range.cljs$lang$arity$1 = range__1;
  range.cljs$lang$arity$2 = range__2;
  range.cljs$lang$arity$3 = range__3;
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____9984 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____9984) {
      var s__9985 = temp__3974__auto____9984;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__9985), take_nth.call(null, n, cljs.core.drop.call(null, n, s__9985)))
    }else {
      return null
    }
  }, null)
};
cljs.core.split_with = function split_with(pred, coll) {
  return cljs.core.PersistentVector.fromArray([cljs.core.take_while.call(null, pred, coll), cljs.core.drop_while.call(null, pred, coll)], true)
};
cljs.core.partition_by = function partition_by(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3974__auto____9992 = cljs.core.seq.call(null, coll);
    if(temp__3974__auto____9992) {
      var s__9993 = temp__3974__auto____9992;
      var fst__9994 = cljs.core.first.call(null, s__9993);
      var fv__9995 = f.call(null, fst__9994);
      var run__9996 = cljs.core.cons.call(null, fst__9994, cljs.core.take_while.call(null, function(p1__9986_SHARP_) {
        return cljs.core._EQ_.call(null, fv__9995, f.call(null, p1__9986_SHARP_))
      }, cljs.core.next.call(null, s__9993)));
      return cljs.core.cons.call(null, run__9996, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__9996), s__9993))))
    }else {
      return null
    }
  }, null)
};
cljs.core.frequencies = function frequencies(coll) {
  return cljs.core.persistent_BANG_.call(null, cljs.core.reduce.call(null, function(counts, x) {
    return cljs.core.assoc_BANG_.call(null, counts, x, cljs.core._lookup.call(null, counts, x, 0) + 1)
  }, cljs.core.transient$.call(null, cljs.core.ObjMap.EMPTY), coll))
};
cljs.core.reductions = function() {
  var reductions = null;
  var reductions__2 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3971__auto____10011 = cljs.core.seq.call(null, coll);
      if(temp__3971__auto____10011) {
        var s__10012 = temp__3971__auto____10011;
        return reductions.call(null, f, cljs.core.first.call(null, s__10012), cljs.core.rest.call(null, s__10012))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    }, null)
  };
  var reductions__3 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3974__auto____10013 = cljs.core.seq.call(null, coll);
      if(temp__3974__auto____10013) {
        var s__10014 = temp__3974__auto____10013;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__10014)), cljs.core.rest.call(null, s__10014))
      }else {
        return null
      }
    }, null))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__2.call(this, f, init);
      case 3:
        return reductions__3.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  reductions.cljs$lang$arity$2 = reductions__2;
  reductions.cljs$lang$arity$3 = reductions__3;
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__1 = function(f) {
    return function() {
      var G__10017 = null;
      var G__10017__0 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__10017__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__10017__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__10017__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__10017__4 = function() {
        var G__10018__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__10018 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10018__delegate.call(this, x, y, z, args)
        };
        G__10018.cljs$lang$maxFixedArity = 3;
        G__10018.cljs$lang$applyTo = function(arglist__10019) {
          var x = cljs.core.first(arglist__10019);
          var y = cljs.core.first(cljs.core.next(arglist__10019));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10019)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10019)));
          return G__10018__delegate(x, y, z, args)
        };
        G__10018.cljs$lang$arity$variadic = G__10018__delegate;
        return G__10018
      }();
      G__10017 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__10017__0.call(this);
          case 1:
            return G__10017__1.call(this, x);
          case 2:
            return G__10017__2.call(this, x, y);
          case 3:
            return G__10017__3.call(this, x, y, z);
          default:
            return G__10017__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10017.cljs$lang$maxFixedArity = 3;
      G__10017.cljs$lang$applyTo = G__10017__4.cljs$lang$applyTo;
      return G__10017
    }()
  };
  var juxt__2 = function(f, g) {
    return function() {
      var G__10020 = null;
      var G__10020__0 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__10020__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__10020__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__10020__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__10020__4 = function() {
        var G__10021__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__10021 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10021__delegate.call(this, x, y, z, args)
        };
        G__10021.cljs$lang$maxFixedArity = 3;
        G__10021.cljs$lang$applyTo = function(arglist__10022) {
          var x = cljs.core.first(arglist__10022);
          var y = cljs.core.first(cljs.core.next(arglist__10022));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10022)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10022)));
          return G__10021__delegate(x, y, z, args)
        };
        G__10021.cljs$lang$arity$variadic = G__10021__delegate;
        return G__10021
      }();
      G__10020 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__10020__0.call(this);
          case 1:
            return G__10020__1.call(this, x);
          case 2:
            return G__10020__2.call(this, x, y);
          case 3:
            return G__10020__3.call(this, x, y, z);
          default:
            return G__10020__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10020.cljs$lang$maxFixedArity = 3;
      G__10020.cljs$lang$applyTo = G__10020__4.cljs$lang$applyTo;
      return G__10020
    }()
  };
  var juxt__3 = function(f, g, h) {
    return function() {
      var G__10023 = null;
      var G__10023__0 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__10023__1 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__10023__2 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__10023__3 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__10023__4 = function() {
        var G__10024__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__10024 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10024__delegate.call(this, x, y, z, args)
        };
        G__10024.cljs$lang$maxFixedArity = 3;
        G__10024.cljs$lang$applyTo = function(arglist__10025) {
          var x = cljs.core.first(arglist__10025);
          var y = cljs.core.first(cljs.core.next(arglist__10025));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10025)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10025)));
          return G__10024__delegate(x, y, z, args)
        };
        G__10024.cljs$lang$arity$variadic = G__10024__delegate;
        return G__10024
      }();
      G__10023 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__10023__0.call(this);
          case 1:
            return G__10023__1.call(this, x);
          case 2:
            return G__10023__2.call(this, x, y);
          case 3:
            return G__10023__3.call(this, x, y, z);
          default:
            return G__10023__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10023.cljs$lang$maxFixedArity = 3;
      G__10023.cljs$lang$applyTo = G__10023__4.cljs$lang$applyTo;
      return G__10023
    }()
  };
  var juxt__4 = function() {
    var G__10026__delegate = function(f, g, h, fs) {
      var fs__10016 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__10027 = null;
        var G__10027__0 = function() {
          return cljs.core.reduce.call(null, function(p1__9997_SHARP_, p2__9998_SHARP_) {
            return cljs.core.conj.call(null, p1__9997_SHARP_, p2__9998_SHARP_.call(null))
          }, cljs.core.PersistentVector.EMPTY, fs__10016)
        };
        var G__10027__1 = function(x) {
          return cljs.core.reduce.call(null, function(p1__9999_SHARP_, p2__10000_SHARP_) {
            return cljs.core.conj.call(null, p1__9999_SHARP_, p2__10000_SHARP_.call(null, x))
          }, cljs.core.PersistentVector.EMPTY, fs__10016)
        };
        var G__10027__2 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__10001_SHARP_, p2__10002_SHARP_) {
            return cljs.core.conj.call(null, p1__10001_SHARP_, p2__10002_SHARP_.call(null, x, y))
          }, cljs.core.PersistentVector.EMPTY, fs__10016)
        };
        var G__10027__3 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__10003_SHARP_, p2__10004_SHARP_) {
            return cljs.core.conj.call(null, p1__10003_SHARP_, p2__10004_SHARP_.call(null, x, y, z))
          }, cljs.core.PersistentVector.EMPTY, fs__10016)
        };
        var G__10027__4 = function() {
          var G__10028__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__10005_SHARP_, p2__10006_SHARP_) {
              return cljs.core.conj.call(null, p1__10005_SHARP_, cljs.core.apply.call(null, p2__10006_SHARP_, x, y, z, args))
            }, cljs.core.PersistentVector.EMPTY, fs__10016)
          };
          var G__10028 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__10028__delegate.call(this, x, y, z, args)
          };
          G__10028.cljs$lang$maxFixedArity = 3;
          G__10028.cljs$lang$applyTo = function(arglist__10029) {
            var x = cljs.core.first(arglist__10029);
            var y = cljs.core.first(cljs.core.next(arglist__10029));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10029)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10029)));
            return G__10028__delegate(x, y, z, args)
          };
          G__10028.cljs$lang$arity$variadic = G__10028__delegate;
          return G__10028
        }();
        G__10027 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__10027__0.call(this);
            case 1:
              return G__10027__1.call(this, x);
            case 2:
              return G__10027__2.call(this, x, y);
            case 3:
              return G__10027__3.call(this, x, y, z);
            default:
              return G__10027__4.cljs$lang$arity$variadic(x, y, z, cljs.core.array_seq(arguments, 3))
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__10027.cljs$lang$maxFixedArity = 3;
        G__10027.cljs$lang$applyTo = G__10027__4.cljs$lang$applyTo;
        return G__10027
      }()
    };
    var G__10026 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__10026__delegate.call(this, f, g, h, fs)
    };
    G__10026.cljs$lang$maxFixedArity = 3;
    G__10026.cljs$lang$applyTo = function(arglist__10030) {
      var f = cljs.core.first(arglist__10030);
      var g = cljs.core.first(cljs.core.next(arglist__10030));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10030)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10030)));
      return G__10026__delegate(f, g, h, fs)
    };
    G__10026.cljs$lang$arity$variadic = G__10026__delegate;
    return G__10026
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__1.call(this, f);
      case 2:
        return juxt__2.call(this, f, g);
      case 3:
        return juxt__3.call(this, f, g, h);
      default:
        return juxt__4.cljs$lang$arity$variadic(f, g, h, cljs.core.array_seq(arguments, 3))
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__4.cljs$lang$applyTo;
  juxt.cljs$lang$arity$1 = juxt__1;
  juxt.cljs$lang$arity$2 = juxt__2;
  juxt.cljs$lang$arity$3 = juxt__3;
  juxt.cljs$lang$arity$variadic = juxt__4.cljs$lang$arity$variadic;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__1 = function(coll) {
    while(true) {
      if(cljs.core.seq.call(null, coll)) {
        var G__10033 = cljs.core.next.call(null, coll);
        coll = G__10033;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__2 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3822__auto____10032 = cljs.core.seq.call(null, coll);
        if(and__3822__auto____10032) {
          return n > 0
        }else {
          return and__3822__auto____10032
        }
      }())) {
        var G__10034 = n - 1;
        var G__10035 = cljs.core.next.call(null, coll);
        n = G__10034;
        coll = G__10035;
        continue
      }else {
        return null
      }
      break
    }
  };
  dorun = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return dorun__1.call(this, n);
      case 2:
        return dorun__2.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dorun.cljs$lang$arity$1 = dorun__1;
  dorun.cljs$lang$arity$2 = dorun__2;
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__1 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__2 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__1.call(this, n);
      case 2:
        return doall__2.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  doall.cljs$lang$arity$1 = doall__1;
  doall.cljs$lang$arity$2 = doall__2;
  return doall
}();
cljs.core.regexp_QMARK_ = function regexp_QMARK_(o) {
  return o instanceof RegExp
};
cljs.core.re_matches = function re_matches(re, s) {
  var matches__10037 = re.exec(s);
  if(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__10037), s)) {
    if(cljs.core.count.call(null, matches__10037) === 1) {
      return cljs.core.first.call(null, matches__10037)
    }else {
      return cljs.core.vec.call(null, matches__10037)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__10039 = re.exec(s);
  if(matches__10039 == null) {
    return null
  }else {
    if(cljs.core.count.call(null, matches__10039) === 1) {
      return cljs.core.first.call(null, matches__10039)
    }else {
      return cljs.core.vec.call(null, matches__10039)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__10044 = cljs.core.re_find.call(null, re, s);
  var match_idx__10045 = s.search(re);
  var match_str__10046 = cljs.core.coll_QMARK_.call(null, match_data__10044) ? cljs.core.first.call(null, match_data__10044) : match_data__10044;
  var post_match__10047 = cljs.core.subs.call(null, s, match_idx__10045 + cljs.core.count.call(null, match_str__10046));
  if(cljs.core.truth_(match_data__10044)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__10044, re_seq.call(null, re, post_match__10047))
    }, null)
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  var vec__10054__10055 = cljs.core.re_find.call(null, /^(?:\(\?([idmsux]*)\))?(.*)/, s);
  var ___10056 = cljs.core.nth.call(null, vec__10054__10055, 0, null);
  var flags__10057 = cljs.core.nth.call(null, vec__10054__10055, 1, null);
  var pattern__10058 = cljs.core.nth.call(null, vec__10054__10055, 2, null);
  return new RegExp(pattern__10058, flags__10057)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray([begin], true), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.PersistentVector.fromArray([sep], true), cljs.core.map.call(null, function(p1__10048_SHARP_) {
    return print_one.call(null, p1__10048_SHARP_, opts)
  }, coll))), cljs.core.PersistentVector.fromArray([end], true))
};
cljs.core.string_print = function string_print(x) {
  cljs.core._STAR_print_fn_STAR_.call(null, x);
  return null
};
cljs.core.flush = function flush() {
  return null
};
cljs.core.pr_seq = function pr_seq(obj, opts) {
  if(obj == null) {
    return cljs.core.list.call(null, "nil")
  }else {
    if(void 0 === obj) {
      return cljs.core.list.call(null, "#<undefined>")
    }else {
      if("\ufdd0'else") {
        return cljs.core.concat.call(null, cljs.core.truth_(function() {
          var and__3822__auto____10068 = cljs.core._lookup.call(null, opts, "\ufdd0'meta", null);
          if(cljs.core.truth_(and__3822__auto____10068)) {
            var and__3822__auto____10072 = function() {
              var G__10069__10070 = obj;
              if(G__10069__10070) {
                if(function() {
                  var or__3824__auto____10071 = G__10069__10070.cljs$lang$protocol_mask$partition0$ & 131072;
                  if(or__3824__auto____10071) {
                    return or__3824__auto____10071
                  }else {
                    return G__10069__10070.cljs$core$IMeta$
                  }
                }()) {
                  return true
                }else {
                  if(!G__10069__10070.cljs$lang$protocol_mask$partition0$) {
                    return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__10069__10070)
                  }else {
                    return false
                  }
                }
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, G__10069__10070)
              }
            }();
            if(cljs.core.truth_(and__3822__auto____10072)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3822__auto____10072
            }
          }else {
            return and__3822__auto____10068
          }
        }()) ? cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["^"], true), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.PersistentVector.fromArray([" "], true)) : null, function() {
          var and__3822__auto____10073 = !(obj == null);
          if(and__3822__auto____10073) {
            return obj.cljs$lang$type
          }else {
            return and__3822__auto____10073
          }
        }() ? obj.cljs$lang$ctorPrSeq(obj) : function() {
          var G__10074__10075 = obj;
          if(G__10074__10075) {
            if(function() {
              var or__3824__auto____10076 = G__10074__10075.cljs$lang$protocol_mask$partition0$ & 536870912;
              if(or__3824__auto____10076) {
                return or__3824__auto____10076
              }else {
                return G__10074__10075.cljs$core$IPrintable$
              }
            }()) {
              return true
            }else {
              if(!G__10074__10075.cljs$lang$protocol_mask$partition0$) {
                return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, G__10074__10075)
              }else {
                return false
              }
            }
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, G__10074__10075)
          }
        }() ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.truth_(cljs.core.regexp_QMARK_.call(null, obj)) ? cljs.core.list.call(null, '#"', obj.source, '"') : "\ufdd0'else" ? cljs.core.list.call(null, "#<", [cljs.core.str(obj)].join(""), ">") : null)
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_sb = function pr_sb(objs, opts) {
  var sb__10096 = new goog.string.StringBuffer;
  var G__10097__10098 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, cljs.core.first.call(null, objs), opts));
  if(G__10097__10098) {
    var string__10099 = cljs.core.first.call(null, G__10097__10098);
    var G__10097__10100 = G__10097__10098;
    while(true) {
      sb__10096.append(string__10099);
      var temp__3974__auto____10101 = cljs.core.next.call(null, G__10097__10100);
      if(temp__3974__auto____10101) {
        var G__10097__10102 = temp__3974__auto____10101;
        var G__10115 = cljs.core.first.call(null, G__10097__10102);
        var G__10116 = G__10097__10102;
        string__10099 = G__10115;
        G__10097__10100 = G__10116;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__10103__10104 = cljs.core.seq.call(null, cljs.core.next.call(null, objs));
  if(G__10103__10104) {
    var obj__10105 = cljs.core.first.call(null, G__10103__10104);
    var G__10103__10106 = G__10103__10104;
    while(true) {
      sb__10096.append(" ");
      var G__10107__10108 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__10105, opts));
      if(G__10107__10108) {
        var string__10109 = cljs.core.first.call(null, G__10107__10108);
        var G__10107__10110 = G__10107__10108;
        while(true) {
          sb__10096.append(string__10109);
          var temp__3974__auto____10111 = cljs.core.next.call(null, G__10107__10110);
          if(temp__3974__auto____10111) {
            var G__10107__10112 = temp__3974__auto____10111;
            var G__10117 = cljs.core.first.call(null, G__10107__10112);
            var G__10118 = G__10107__10112;
            string__10109 = G__10117;
            G__10107__10110 = G__10118;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____10113 = cljs.core.next.call(null, G__10103__10106);
      if(temp__3974__auto____10113) {
        var G__10103__10114 = temp__3974__auto____10113;
        var G__10119 = cljs.core.first.call(null, G__10103__10114);
        var G__10120 = G__10103__10114;
        obj__10105 = G__10119;
        G__10103__10106 = G__10120;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return sb__10096
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  return[cljs.core.str(cljs.core.pr_sb.call(null, objs, opts))].join("")
};
cljs.core.prn_str_with_opts = function prn_str_with_opts(objs, opts) {
  var sb__10122 = cljs.core.pr_sb.call(null, objs, opts);
  sb__10122.append("\n");
  return[cljs.core.str(sb__10122)].join("")
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var G__10141__10142 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, cljs.core.first.call(null, objs), opts));
  if(G__10141__10142) {
    var string__10143 = cljs.core.first.call(null, G__10141__10142);
    var G__10141__10144 = G__10141__10142;
    while(true) {
      cljs.core.string_print.call(null, string__10143);
      var temp__3974__auto____10145 = cljs.core.next.call(null, G__10141__10144);
      if(temp__3974__auto____10145) {
        var G__10141__10146 = temp__3974__auto____10145;
        var G__10159 = cljs.core.first.call(null, G__10141__10146);
        var G__10160 = G__10141__10146;
        string__10143 = G__10159;
        G__10141__10144 = G__10160;
        continue
      }else {
      }
      break
    }
  }else {
  }
  var G__10147__10148 = cljs.core.seq.call(null, cljs.core.next.call(null, objs));
  if(G__10147__10148) {
    var obj__10149 = cljs.core.first.call(null, G__10147__10148);
    var G__10147__10150 = G__10147__10148;
    while(true) {
      cljs.core.string_print.call(null, " ");
      var G__10151__10152 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__10149, opts));
      if(G__10151__10152) {
        var string__10153 = cljs.core.first.call(null, G__10151__10152);
        var G__10151__10154 = G__10151__10152;
        while(true) {
          cljs.core.string_print.call(null, string__10153);
          var temp__3974__auto____10155 = cljs.core.next.call(null, G__10151__10154);
          if(temp__3974__auto____10155) {
            var G__10151__10156 = temp__3974__auto____10155;
            var G__10161 = cljs.core.first.call(null, G__10151__10156);
            var G__10162 = G__10151__10156;
            string__10153 = G__10161;
            G__10151__10154 = G__10162;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3974__auto____10157 = cljs.core.next.call(null, G__10147__10150);
      if(temp__3974__auto____10157) {
        var G__10147__10158 = temp__3974__auto____10157;
        var G__10163 = cljs.core.first.call(null, G__10147__10158);
        var G__10164 = G__10147__10158;
        obj__10149 = G__10163;
        G__10147__10150 = G__10164;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.newline = function newline(opts) {
  cljs.core.string_print.call(null, "\n");
  if(cljs.core.truth_(cljs.core._lookup.call(null, opts, "\ufdd0'flush-on-newline", null))) {
    return cljs.core.flush.call(null)
  }else {
    return null
  }
};
cljs.core._STAR_flush_on_newline_STAR_ = true;
cljs.core._STAR_print_readably_STAR_ = true;
cljs.core._STAR_print_meta_STAR_ = false;
cljs.core._STAR_print_dup_STAR_ = false;
cljs.core.pr_opts = function pr_opts() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'flush-on-newline", "\ufdd0'readably", "\ufdd0'meta", "\ufdd0'dup"], {"\ufdd0'flush-on-newline":cljs.core._STAR_flush_on_newline_STAR_, "\ufdd0'readably":cljs.core._STAR_print_readably_STAR_, "\ufdd0'meta":cljs.core._STAR_print_meta_STAR_, "\ufdd0'dup":cljs.core._STAR_print_dup_STAR_})
};
cljs.core.pr_str = function() {
  var pr_str__delegate = function(objs) {
    return cljs.core.pr_str_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr_str__delegate.call(this, objs)
  };
  pr_str.cljs$lang$maxFixedArity = 0;
  pr_str.cljs$lang$applyTo = function(arglist__10165) {
    var objs = cljs.core.seq(arglist__10165);
    return pr_str__delegate(objs)
  };
  pr_str.cljs$lang$arity$variadic = pr_str__delegate;
  return pr_str
}();
cljs.core.prn_str = function() {
  var prn_str__delegate = function(objs) {
    return cljs.core.prn_str_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var prn_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn_str__delegate.call(this, objs)
  };
  prn_str.cljs$lang$maxFixedArity = 0;
  prn_str.cljs$lang$applyTo = function(arglist__10166) {
    var objs = cljs.core.seq(arglist__10166);
    return prn_str__delegate(objs)
  };
  prn_str.cljs$lang$arity$variadic = prn_str__delegate;
  return prn_str
}();
cljs.core.pr = function() {
  var pr__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr__delegate.call(this, objs)
  };
  pr.cljs$lang$maxFixedArity = 0;
  pr.cljs$lang$applyTo = function(arglist__10167) {
    var objs = cljs.core.seq(arglist__10167);
    return pr__delegate(objs)
  };
  pr.cljs$lang$arity$variadic = pr__delegate;
  return pr
}();
cljs.core.print = function() {
  var cljs_core_print__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var cljs_core_print = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return cljs_core_print__delegate.call(this, objs)
  };
  cljs_core_print.cljs$lang$maxFixedArity = 0;
  cljs_core_print.cljs$lang$applyTo = function(arglist__10168) {
    var objs = cljs.core.seq(arglist__10168);
    return cljs_core_print__delegate(objs)
  };
  cljs_core_print.cljs$lang$arity$variadic = cljs_core_print__delegate;
  return cljs_core_print
}();
cljs.core.print_str = function() {
  var print_str__delegate = function(objs) {
    return cljs.core.pr_str_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var print_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return print_str__delegate.call(this, objs)
  };
  print_str.cljs$lang$maxFixedArity = 0;
  print_str.cljs$lang$applyTo = function(arglist__10169) {
    var objs = cljs.core.seq(arglist__10169);
    return print_str__delegate(objs)
  };
  print_str.cljs$lang$arity$variadic = print_str__delegate;
  return print_str
}();
cljs.core.println = function() {
  var println__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var println = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println__delegate.call(this, objs)
  };
  println.cljs$lang$maxFixedArity = 0;
  println.cljs$lang$applyTo = function(arglist__10170) {
    var objs = cljs.core.seq(arglist__10170);
    return println__delegate(objs)
  };
  println.cljs$lang$arity$variadic = println__delegate;
  return println
}();
cljs.core.println_str = function() {
  var println_str__delegate = function(objs) {
    return cljs.core.prn_str_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var println_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println_str__delegate.call(this, objs)
  };
  println_str.cljs$lang$maxFixedArity = 0;
  println_str.cljs$lang$applyTo = function(arglist__10171) {
    var objs = cljs.core.seq(arglist__10171);
    return println_str__delegate(objs)
  };
  println_str.cljs$lang$arity$variadic = println_str__delegate;
  return println_str
}();
cljs.core.prn = function() {
  var prn__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var prn = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn__delegate.call(this, objs)
  };
  prn.cljs$lang$maxFixedArity = 0;
  prn.cljs$lang$applyTo = function(arglist__10172) {
    var objs = cljs.core.seq(arglist__10172);
    return prn__delegate(objs)
  };
  prn.cljs$lang$arity$variadic = prn__delegate;
  return prn
}();
cljs.core.printf = function() {
  var printf__delegate = function(fmt, args) {
    return cljs.core.print.call(null, cljs.core.apply.call(null, cljs.core.format, fmt, args))
  };
  var printf = function(fmt, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return printf__delegate.call(this, fmt, args)
  };
  printf.cljs$lang$maxFixedArity = 1;
  printf.cljs$lang$applyTo = function(arglist__10173) {
    var fmt = cljs.core.first(arglist__10173);
    var args = cljs.core.rest(arglist__10173);
    return printf__delegate(fmt, args)
  };
  printf.cljs$lang$arity$variadic = printf__delegate;
  return printf
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__10174 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__10174, "{", ", ", "}", opts, coll)
};
cljs.core.IPrintable["number"] = true;
cljs.core._pr_seq["number"] = function(n, opts) {
  return cljs.core.list.call(null, [cljs.core.str(n)].join(""))
};
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Subvec.prototype.cljs$core$IPrintable$ = true;
cljs.core.Subvec.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.ChunkedCons.prototype.cljs$core$IPrintable$ = true;
cljs.core.ChunkedCons.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentTreeMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__10175 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__10175, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentArrayMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__10176 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__10176, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#queue [", " ", "]", opts, cljs.core.seq.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.LazySeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.RSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.RSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentTreeSet.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeSet.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.IPrintable["boolean"] = true;
cljs.core._pr_seq["boolean"] = function(bool, opts) {
  return cljs.core.list.call(null, [cljs.core.str(bool)].join(""))
};
cljs.core.IPrintable["string"] = true;
cljs.core._pr_seq["string"] = function(obj, opts) {
  if(cljs.core.keyword_QMARK_.call(null, obj)) {
    return cljs.core.list.call(null, [cljs.core.str(":"), cljs.core.str(function() {
      var temp__3974__auto____10177 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3974__auto____10177)) {
        var nspc__10178 = temp__3974__auto____10177;
        return[cljs.core.str(nspc__10178), cljs.core.str("/")].join("")
      }else {
        return null
      }
    }()), cljs.core.str(cljs.core.name.call(null, obj))].join(""))
  }else {
    if(cljs.core.symbol_QMARK_.call(null, obj)) {
      return cljs.core.list.call(null, [cljs.core.str(function() {
        var temp__3974__auto____10179 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3974__auto____10179)) {
          var nspc__10180 = temp__3974__auto____10179;
          return[cljs.core.str(nspc__10180), cljs.core.str("/")].join("")
        }else {
          return null
        }
      }()), cljs.core.str(cljs.core.name.call(null, obj))].join(""))
    }else {
      if("\ufdd0'else") {
        return cljs.core.list.call(null, cljs.core.truth_((new cljs.core.Keyword("\ufdd0'readably")).call(null, opts)) ? goog.string.quote(obj) : obj)
      }else {
        return null
      }
    }
  }
};
cljs.core.NodeSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.NodeSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.RedNode.prototype.cljs$core$IPrintable$ = true;
cljs.core.RedNode.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.ChunkedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.ChunkedSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentHashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentHashMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__10181 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__10181, "{", ", ", "}", opts, coll)
};
cljs.core.Vector.prototype.cljs$core$IPrintable$ = true;
cljs.core.Vector.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.PersistentHashSet.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentHashSet.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.List.prototype.cljs$core$IPrintable$ = true;
cljs.core.List.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["array"] = true;
cljs.core._pr_seq["array"] = function(a, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#<Array [", ", ", "]>", opts, a)
};
cljs.core.IPrintable["function"] = true;
cljs.core._pr_seq["function"] = function(this$) {
  return cljs.core.list.call(null, "#<", [cljs.core.str(this$)].join(""), ">")
};
cljs.core.EmptyList.prototype.cljs$core$IPrintable$ = true;
cljs.core.EmptyList.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.list.call(null, "()")
};
cljs.core.BlackNode.prototype.cljs$core$IPrintable$ = true;
cljs.core.BlackNode.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
Date.prototype.cljs$core$IPrintable$ = true;
Date.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(d, _) {
  var normalize__10183 = function(n, len) {
    var ns__10182 = [cljs.core.str(n)].join("");
    while(true) {
      if(cljs.core.count.call(null, ns__10182) < len) {
        var G__10185 = [cljs.core.str("0"), cljs.core.str(ns__10182)].join("");
        ns__10182 = G__10185;
        continue
      }else {
        return ns__10182
      }
      break
    }
  };
  return cljs.core.list.call(null, [cljs.core.str('#inst "'), cljs.core.str(d.getUTCFullYear()), cljs.core.str("-"), cljs.core.str(normalize__10183.call(null, d.getUTCMonth() + 1, 2)), cljs.core.str("-"), cljs.core.str(normalize__10183.call(null, d.getUTCDate(), 2)), cljs.core.str("T"), cljs.core.str(normalize__10183.call(null, d.getUTCHours(), 2)), cljs.core.str(":"), cljs.core.str(normalize__10183.call(null, d.getUTCMinutes(), 2)), cljs.core.str(":"), cljs.core.str(normalize__10183.call(null, d.getUTCSeconds(), 
  2)), cljs.core.str("."), cljs.core.str(normalize__10183.call(null, d.getUTCMilliseconds(), 3)), cljs.core.str("-"), cljs.core.str('00:00"')].join(""))
};
cljs.core.Cons.prototype.cljs$core$IPrintable$ = true;
cljs.core.Cons.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Range.prototype.cljs$core$IPrintable$ = true;
cljs.core.Range.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ArrayNodeSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.ArrayNodeSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ObjMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.ObjMap.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  var pr_pair__10184 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__10184, "{", ", ", "}", opts, coll)
};
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentTreeMapSeq.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.PersistentVector.prototype.cljs$core$IComparable$ = true;
cljs.core.PersistentVector.prototype.cljs$core$IComparable$_compare$arity$2 = function(x, y) {
  return cljs.core.compare_indexed.call(null, x, y)
};
cljs.core.Atom = function(state, meta, validator, watches) {
  this.state = state;
  this.meta = meta;
  this.validator = validator;
  this.watches = watches;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 2690809856
};
cljs.core.Atom.cljs$lang$type = true;
cljs.core.Atom.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Atom")
};
cljs.core.Atom.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__10186 = this;
  return goog.getUid(this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches$arity$3 = function(this$, oldval, newval) {
  var this__10187 = this;
  var G__10188__10189 = cljs.core.seq.call(null, this__10187.watches);
  if(G__10188__10189) {
    var G__10191__10193 = cljs.core.first.call(null, G__10188__10189);
    var vec__10192__10194 = G__10191__10193;
    var key__10195 = cljs.core.nth.call(null, vec__10192__10194, 0, null);
    var f__10196 = cljs.core.nth.call(null, vec__10192__10194, 1, null);
    var G__10188__10197 = G__10188__10189;
    var G__10191__10198 = G__10191__10193;
    var G__10188__10199 = G__10188__10197;
    while(true) {
      var vec__10200__10201 = G__10191__10198;
      var key__10202 = cljs.core.nth.call(null, vec__10200__10201, 0, null);
      var f__10203 = cljs.core.nth.call(null, vec__10200__10201, 1, null);
      var G__10188__10204 = G__10188__10199;
      f__10203.call(null, key__10202, this$, oldval, newval);
      var temp__3974__auto____10205 = cljs.core.next.call(null, G__10188__10204);
      if(temp__3974__auto____10205) {
        var G__10188__10206 = temp__3974__auto____10205;
        var G__10213 = cljs.core.first.call(null, G__10188__10206);
        var G__10214 = G__10188__10206;
        G__10191__10198 = G__10213;
        G__10188__10199 = G__10214;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_add_watch$arity$3 = function(this$, key, f) {
  var this__10207 = this;
  return this$.watches = cljs.core.assoc.call(null, this__10207.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch$arity$2 = function(this$, key) {
  var this__10208 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__10208.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(a, opts) {
  var this__10209 = this;
  return cljs.core.concat.call(null, cljs.core.PersistentVector.fromArray(["#<Atom: "], true), cljs.core._pr_seq.call(null, this__10209.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$_meta$arity$1 = function(_) {
  var this__10210 = this;
  return this__10210.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__10211 = this;
  return this__10211.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(o, other) {
  var this__10212 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__1 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__2 = function() {
    var G__10226__delegate = function(x, p__10215) {
      var map__10221__10222 = p__10215;
      var map__10221__10223 = cljs.core.seq_QMARK_.call(null, map__10221__10222) ? cljs.core.apply.call(null, cljs.core.hash_map, map__10221__10222) : map__10221__10222;
      var validator__10224 = cljs.core._lookup.call(null, map__10221__10223, "\ufdd0'validator", null);
      var meta__10225 = cljs.core._lookup.call(null, map__10221__10223, "\ufdd0'meta", null);
      return new cljs.core.Atom(x, meta__10225, validator__10224, null)
    };
    var G__10226 = function(x, var_args) {
      var p__10215 = null;
      if(goog.isDef(var_args)) {
        p__10215 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__10226__delegate.call(this, x, p__10215)
    };
    G__10226.cljs$lang$maxFixedArity = 1;
    G__10226.cljs$lang$applyTo = function(arglist__10227) {
      var x = cljs.core.first(arglist__10227);
      var p__10215 = cljs.core.rest(arglist__10227);
      return G__10226__delegate(x, p__10215)
    };
    G__10226.cljs$lang$arity$variadic = G__10226__delegate;
    return G__10226
  }();
  atom = function(x, var_args) {
    var p__10215 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__1.call(this, x);
      default:
        return atom__2.cljs$lang$arity$variadic(x, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__2.cljs$lang$applyTo;
  atom.cljs$lang$arity$1 = atom__1;
  atom.cljs$lang$arity$variadic = atom__2.cljs$lang$arity$variadic;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3974__auto____10231 = a.validator;
  if(cljs.core.truth_(temp__3974__auto____10231)) {
    var validate__10232 = temp__3974__auto____10231;
    if(cljs.core.truth_(validate__10232.call(null, new_value))) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str("Validator rejected reference state"), cljs.core.str("\n"), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 6440))))].join(""));
    }
  }else {
  }
  var old_value__10233 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__10233, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___2 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___3 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___4 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___5 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___6 = function() {
    var G__10234__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__10234 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__10234__delegate.call(this, a, f, x, y, z, more)
    };
    G__10234.cljs$lang$maxFixedArity = 5;
    G__10234.cljs$lang$applyTo = function(arglist__10235) {
      var a = cljs.core.first(arglist__10235);
      var f = cljs.core.first(cljs.core.next(arglist__10235));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10235)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10235))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10235)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10235)))));
      return G__10234__delegate(a, f, x, y, z, more)
    };
    G__10234.cljs$lang$arity$variadic = G__10234__delegate;
    return G__10234
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___2.call(this, a, f);
      case 3:
        return swap_BANG___3.call(this, a, f, x);
      case 4:
        return swap_BANG___4.call(this, a, f, x, y);
      case 5:
        return swap_BANG___5.call(this, a, f, x, y, z);
      default:
        return swap_BANG___6.cljs$lang$arity$variadic(a, f, x, y, z, cljs.core.array_seq(arguments, 5))
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___6.cljs$lang$applyTo;
  swap_BANG_.cljs$lang$arity$2 = swap_BANG___2;
  swap_BANG_.cljs$lang$arity$3 = swap_BANG___3;
  swap_BANG_.cljs$lang$arity$4 = swap_BANG___4;
  swap_BANG_.cljs$lang$arity$5 = swap_BANG___5;
  swap_BANG_.cljs$lang$arity$variadic = swap_BANG___6.cljs$lang$arity$variadic;
  return swap_BANG_
}();
cljs.core.compare_and_set_BANG_ = function compare_and_set_BANG_(a, oldval, newval) {
  if(cljs.core._EQ_.call(null, a.state, oldval)) {
    cljs.core.reset_BANG_.call(null, a, newval);
    return true
  }else {
    return false
  }
};
cljs.core.deref = function deref(o) {
  return cljs.core._deref.call(null, o)
};
cljs.core.set_validator_BANG_ = function set_validator_BANG_(iref, val) {
  return iref.validator = val
};
cljs.core.get_validator = function get_validator(iref) {
  return iref.validator
};
cljs.core.alter_meta_BANG_ = function() {
  var alter_meta_BANG___delegate = function(iref, f, args) {
    return iref.meta = cljs.core.apply.call(null, f, iref.meta, args)
  };
  var alter_meta_BANG_ = function(iref, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return alter_meta_BANG___delegate.call(this, iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$maxFixedArity = 2;
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__10236) {
    var iref = cljs.core.first(arglist__10236);
    var f = cljs.core.first(cljs.core.next(arglist__10236));
    var args = cljs.core.rest(cljs.core.next(arglist__10236));
    return alter_meta_BANG___delegate(iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$arity$variadic = alter_meta_BANG___delegate;
  return alter_meta_BANG_
}();
cljs.core.reset_meta_BANG_ = function reset_meta_BANG_(iref, m) {
  return iref.meta = m
};
cljs.core.add_watch = function add_watch(iref, key, f) {
  return cljs.core._add_watch.call(null, iref, key, f)
};
cljs.core.remove_watch = function remove_watch(iref, key) {
  return cljs.core._remove_watch.call(null, iref, key)
};
cljs.core.gensym_counter = null;
cljs.core.gensym = function() {
  var gensym = null;
  var gensym__0 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__1 = function(prefix_string) {
    if(cljs.core.gensym_counter == null) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, [cljs.core.str(prefix_string), cljs.core.str(cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc))].join(""))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__0.call(this);
      case 1:
        return gensym__1.call(this, prefix_string)
    }
    throw"Invalid arity: " + arguments.length;
  };
  gensym.cljs$lang$arity$0 = gensym__0;
  gensym.cljs$lang$arity$1 = gensym__1;
  return gensym
}();
cljs.core.fixture1 = 1;
cljs.core.fixture2 = 2;
cljs.core.Delay = function(state, f) {
  this.state = state;
  this.f = f;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 1073774592
};
cljs.core.Delay.cljs$lang$type = true;
cljs.core.Delay.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/Delay")
};
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_$arity$1 = function(d) {
  var this__10237 = this;
  return(new cljs.core.Keyword("\ufdd0'done")).call(null, cljs.core.deref.call(null, this__10237.state))
};
cljs.core.Delay.prototype.cljs$core$IDeref$_deref$arity$1 = function(_) {
  var this__10238 = this;
  return(new cljs.core.Keyword("\ufdd0'value")).call(null, cljs.core.swap_BANG_.call(null, this__10238.state, function(p__10239) {
    var map__10240__10241 = p__10239;
    var map__10240__10242 = cljs.core.seq_QMARK_.call(null, map__10240__10241) ? cljs.core.apply.call(null, cljs.core.hash_map, map__10240__10241) : map__10240__10241;
    var curr_state__10243 = map__10240__10242;
    var done__10244 = cljs.core._lookup.call(null, map__10240__10242, "\ufdd0'done", null);
    if(cljs.core.truth_(done__10244)) {
      return curr_state__10243
    }else {
      return cljs.core.ObjMap.fromObject(["\ufdd0'done", "\ufdd0'value"], {"\ufdd0'done":true, "\ufdd0'value":this__10238.f.call(null)})
    }
  }))
};
cljs.core.Delay;
cljs.core.delay_QMARK_ = function delay_QMARK_(x) {
  return cljs.core.instance_QMARK_.call(null, cljs.core.Delay, x)
};
cljs.core.force = function force(x) {
  if(cljs.core.delay_QMARK_.call(null, x)) {
    return cljs.core.deref.call(null, x)
  }else {
    return x
  }
};
cljs.core.realized_QMARK_ = function realized_QMARK_(d) {
  return cljs.core._realized_QMARK_.call(null, d)
};
cljs.core.js__GT_clj = function() {
  var js__GT_clj__delegate = function(x, options) {
    var map__10265__10266 = options;
    var map__10265__10267 = cljs.core.seq_QMARK_.call(null, map__10265__10266) ? cljs.core.apply.call(null, cljs.core.hash_map, map__10265__10266) : map__10265__10266;
    var keywordize_keys__10268 = cljs.core._lookup.call(null, map__10265__10267, "\ufdd0'keywordize-keys", null);
    var keyfn__10269 = cljs.core.truth_(keywordize_keys__10268) ? cljs.core.keyword : cljs.core.str;
    var f__10284 = function thisfn(x) {
      if(cljs.core.seq_QMARK_.call(null, x)) {
        return cljs.core.doall.call(null, cljs.core.map.call(null, thisfn, x))
      }else {
        if(cljs.core.coll_QMARK_.call(null, x)) {
          return cljs.core.into.call(null, cljs.core.empty.call(null, x), cljs.core.map.call(null, thisfn, x))
        }else {
          if(cljs.core.truth_(goog.isArray(x))) {
            return cljs.core.vec.call(null, cljs.core.map.call(null, thisfn, x))
          }else {
            if(cljs.core.type.call(null, x) === Object) {
              return cljs.core.into.call(null, cljs.core.ObjMap.EMPTY, function() {
                var iter__2462__auto____10283 = function iter__10277(s__10278) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__10278__10281 = s__10278;
                    while(true) {
                      if(cljs.core.seq.call(null, s__10278__10281)) {
                        var k__10282 = cljs.core.first.call(null, s__10278__10281);
                        return cljs.core.cons.call(null, cljs.core.PersistentVector.fromArray([keyfn__10269.call(null, k__10282), thisfn.call(null, x[k__10282])], true), iter__10277.call(null, cljs.core.rest.call(null, s__10278__10281)))
                      }else {
                        return null
                      }
                      break
                    }
                  }, null)
                };
                return iter__2462__auto____10283.call(null, cljs.core.js_keys.call(null, x))
              }())
            }else {
              if("\ufdd0'else") {
                return x
              }else {
                return null
              }
            }
          }
        }
      }
    };
    return f__10284.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__10285) {
    var x = cljs.core.first(arglist__10285);
    var options = cljs.core.rest(arglist__10285);
    return js__GT_clj__delegate(x, options)
  };
  js__GT_clj.cljs$lang$arity$variadic = js__GT_clj__delegate;
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__10290 = cljs.core.atom.call(null, cljs.core.ObjMap.EMPTY);
  return function() {
    var G__10294__delegate = function(args) {
      var temp__3971__auto____10291 = cljs.core._lookup.call(null, cljs.core.deref.call(null, mem__10290), args, null);
      if(cljs.core.truth_(temp__3971__auto____10291)) {
        var v__10292 = temp__3971__auto____10291;
        return v__10292
      }else {
        var ret__10293 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__10290, cljs.core.assoc, args, ret__10293);
        return ret__10293
      }
    };
    var G__10294 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__10294__delegate.call(this, args)
    };
    G__10294.cljs$lang$maxFixedArity = 0;
    G__10294.cljs$lang$applyTo = function(arglist__10295) {
      var args = cljs.core.seq(arglist__10295);
      return G__10294__delegate(args)
    };
    G__10294.cljs$lang$arity$variadic = G__10294__delegate;
    return G__10294
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__1 = function(f) {
    while(true) {
      var ret__10297 = f.call(null);
      if(cljs.core.fn_QMARK_.call(null, ret__10297)) {
        var G__10298 = ret__10297;
        f = G__10298;
        continue
      }else {
        return ret__10297
      }
      break
    }
  };
  var trampoline__2 = function() {
    var G__10299__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__10299 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__10299__delegate.call(this, f, args)
    };
    G__10299.cljs$lang$maxFixedArity = 1;
    G__10299.cljs$lang$applyTo = function(arglist__10300) {
      var f = cljs.core.first(arglist__10300);
      var args = cljs.core.rest(arglist__10300);
      return G__10299__delegate(f, args)
    };
    G__10299.cljs$lang$arity$variadic = G__10299__delegate;
    return G__10299
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__1.call(this, f);
      default:
        return trampoline__2.cljs$lang$arity$variadic(f, cljs.core.array_seq(arguments, 1))
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__2.cljs$lang$applyTo;
  trampoline.cljs$lang$arity$1 = trampoline__1;
  trampoline.cljs$lang$arity$variadic = trampoline__2.cljs$lang$arity$variadic;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__0 = function() {
    return rand.call(null, 1)
  };
  var rand__1 = function(n) {
    return Math.random.call(null) * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__0.call(this);
      case 1:
        return rand__1.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  rand.cljs$lang$arity$0 = rand__0;
  rand.cljs$lang$arity$1 = rand__1;
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return Math.floor.call(null, Math.random.call(null) * n)
};
cljs.core.rand_nth = function rand_nth(coll) {
  return cljs.core.nth.call(null, coll, cljs.core.rand_int.call(null, cljs.core.count.call(null, coll)))
};
cljs.core.group_by = function group_by(f, coll) {
  return cljs.core.reduce.call(null, function(ret, x) {
    var k__10302 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__10302, cljs.core.conj.call(null, cljs.core._lookup.call(null, ret, k__10302, cljs.core.PersistentVector.EMPTY), x))
  }, cljs.core.ObjMap.EMPTY, coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.EMPTY, "\ufdd0'descendants":cljs.core.ObjMap.EMPTY, "\ufdd0'ancestors":cljs.core.ObjMap.EMPTY})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___2 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___3 = function(h, child, parent) {
    var or__3824__auto____10311 = cljs.core._EQ_.call(null, child, parent);
    if(or__3824__auto____10311) {
      return or__3824__auto____10311
    }else {
      var or__3824__auto____10312 = cljs.core.contains_QMARK_.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h).call(null, child), parent);
      if(or__3824__auto____10312) {
        return or__3824__auto____10312
      }else {
        var and__3822__auto____10313 = cljs.core.vector_QMARK_.call(null, parent);
        if(and__3822__auto____10313) {
          var and__3822__auto____10314 = cljs.core.vector_QMARK_.call(null, child);
          if(and__3822__auto____10314) {
            var and__3822__auto____10315 = cljs.core.count.call(null, parent) === cljs.core.count.call(null, child);
            if(and__3822__auto____10315) {
              var ret__10316 = true;
              var i__10317 = 0;
              while(true) {
                if(function() {
                  var or__3824__auto____10318 = cljs.core.not.call(null, ret__10316);
                  if(or__3824__auto____10318) {
                    return or__3824__auto____10318
                  }else {
                    return i__10317 === cljs.core.count.call(null, parent)
                  }
                }()) {
                  return ret__10316
                }else {
                  var G__10319 = isa_QMARK_.call(null, h, child.call(null, i__10317), parent.call(null, i__10317));
                  var G__10320 = i__10317 + 1;
                  ret__10316 = G__10319;
                  i__10317 = G__10320;
                  continue
                }
                break
              }
            }else {
              return and__3822__auto____10315
            }
          }else {
            return and__3822__auto____10314
          }
        }else {
          return and__3822__auto____10313
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___2.call(this, h, child);
      case 3:
        return isa_QMARK___3.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  isa_QMARK_.cljs$lang$arity$2 = isa_QMARK___2;
  isa_QMARK_.cljs$lang$arity$3 = isa_QMARK___3;
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__1 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__2 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core._lookup.call(null, (new cljs.core.Keyword("\ufdd0'parents")).call(null, h), tag, null))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__1.call(this, h);
      case 2:
        return parents__2.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  parents.cljs$lang$arity$1 = parents__1;
  parents.cljs$lang$arity$2 = parents__2;
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__1 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__2 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core._lookup.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, null))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__1.call(this, h);
      case 2:
        return ancestors__2.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  ancestors.cljs$lang$arity$1 = ancestors__1;
  ancestors.cljs$lang$arity$2 = ancestors__2;
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__1 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__2 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core._lookup.call(null, (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h), tag, null))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__1.call(this, h);
      case 2:
        return descendants__2.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  descendants.cljs$lang$arity$1 = descendants__1;
  descendants.cljs$lang$arity$2 = descendants__2;
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__2 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 6724))))].join(""));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__3 = function(h, tag, parent) {
    if(cljs.core.not_EQ_.call(null, tag, parent)) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 6728))))].join(""));
    }
    var tp__10329 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var td__10330 = (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h);
    var ta__10331 = (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h);
    var tf__10332 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core._lookup.call(null, targets, k, cljs.core.PersistentHashSet.EMPTY), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3824__auto____10333 = cljs.core.contains_QMARK_.call(null, tp__10329.call(null, tag), parent) ? null : function() {
      if(cljs.core.contains_QMARK_.call(null, ta__10331.call(null, tag), parent)) {
        throw new Error([cljs.core.str(tag), cljs.core.str("already has"), cljs.core.str(parent), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      if(cljs.core.contains_QMARK_.call(null, ta__10331.call(null, parent), tag)) {
        throw new Error([cljs.core.str("Cyclic derivation:"), cljs.core.str(parent), cljs.core.str("has"), cljs.core.str(tag), cljs.core.str("as ancestor")].join(""));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, (new cljs.core.Keyword("\ufdd0'parents")).call(null, h), tag, cljs.core.conj.call(null, cljs.core._lookup.call(null, tp__10329, tag, cljs.core.PersistentHashSet.EMPTY), parent)), "\ufdd0'ancestors":tf__10332.call(null, (new cljs.core.Keyword("\ufdd0'ancestors")).call(null, h), tag, td__10330, parent, ta__10331), "\ufdd0'descendants":tf__10332.call(null, 
      (new cljs.core.Keyword("\ufdd0'descendants")).call(null, h), parent, ta__10331, tag, td__10330)})
    }();
    if(cljs.core.truth_(or__3824__auto____10333)) {
      return or__3824__auto____10333
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__2.call(this, h, tag);
      case 3:
        return derive__3.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  derive.cljs$lang$arity$2 = derive__2;
  derive.cljs$lang$arity$3 = derive__3;
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__2 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__3 = function(h, tag, parent) {
    var parentMap__10338 = (new cljs.core.Keyword("\ufdd0'parents")).call(null, h);
    var childsParents__10339 = cljs.core.truth_(parentMap__10338.call(null, tag)) ? cljs.core.disj.call(null, parentMap__10338.call(null, tag), parent) : cljs.core.PersistentHashSet.EMPTY;
    var newParents__10340 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__10339)) ? cljs.core.assoc.call(null, parentMap__10338, tag, childsParents__10339) : cljs.core.dissoc.call(null, parentMap__10338, tag);
    var deriv_seq__10341 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__10321_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__10321_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__10321_SHARP_), cljs.core.second.call(null, p1__10321_SHARP_)))
    }, cljs.core.seq.call(null, newParents__10340)));
    if(cljs.core.contains_QMARK_.call(null, parentMap__10338.call(null, tag), parent)) {
      return cljs.core.reduce.call(null, function(p1__10322_SHARP_, p2__10323_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__10322_SHARP_, p2__10323_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__10341))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__2.call(this, h, tag);
      case 3:
        return underive__3.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  underive.cljs$lang$arity$2 = underive__2;
  underive.cljs$lang$arity$3 = underive__3;
  return underive
}();
cljs.core.reset_cache = function reset_cache(method_cache, method_table, cached_hierarchy, hierarchy) {
  cljs.core.swap_BANG_.call(null, method_cache, function(_) {
    return cljs.core.deref.call(null, method_table)
  });
  return cljs.core.swap_BANG_.call(null, cached_hierarchy, function(_) {
    return cljs.core.deref.call(null, hierarchy)
  })
};
cljs.core.prefers_STAR_ = function prefers_STAR_(x, y, prefer_table) {
  var xprefs__10349 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3824__auto____10351 = cljs.core.truth_(function() {
    var and__3822__auto____10350 = xprefs__10349;
    if(cljs.core.truth_(and__3822__auto____10350)) {
      return xprefs__10349.call(null, y)
    }else {
      return and__3822__auto____10350
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3824__auto____10351)) {
    return or__3824__auto____10351
  }else {
    var or__3824__auto____10353 = function() {
      var ps__10352 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.count.call(null, ps__10352) > 0) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__10352), prefer_table))) {
          }else {
          }
          var G__10356 = cljs.core.rest.call(null, ps__10352);
          ps__10352 = G__10356;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3824__auto____10353)) {
      return or__3824__auto____10353
    }else {
      var or__3824__auto____10355 = function() {
        var ps__10354 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.count.call(null, ps__10354) > 0) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__10354), y, prefer_table))) {
            }else {
            }
            var G__10357 = cljs.core.rest.call(null, ps__10354);
            ps__10354 = G__10357;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3824__auto____10355)) {
        return or__3824__auto____10355
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3824__auto____10359 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3824__auto____10359)) {
    return or__3824__auto____10359
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__10377 = cljs.core.reduce.call(null, function(be, p__10369) {
    var vec__10370__10371 = p__10369;
    var k__10372 = cljs.core.nth.call(null, vec__10370__10371, 0, null);
    var ___10373 = cljs.core.nth.call(null, vec__10370__10371, 1, null);
    var e__10374 = vec__10370__10371;
    if(cljs.core.isa_QMARK_.call(null, dispatch_val, k__10372)) {
      var be2__10376 = cljs.core.truth_(function() {
        var or__3824__auto____10375 = be == null;
        if(or__3824__auto____10375) {
          return or__3824__auto____10375
        }else {
          return cljs.core.dominates.call(null, k__10372, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__10374 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__10376), k__10372, prefer_table))) {
      }else {
        throw new Error([cljs.core.str("Multiple methods in multimethod '"), cljs.core.str(name), cljs.core.str("' match dispatch value: "), cljs.core.str(dispatch_val), cljs.core.str(" -> "), cljs.core.str(k__10372), cljs.core.str(" and "), cljs.core.str(cljs.core.first.call(null, be2__10376)), cljs.core.str(", and neither is preferred")].join(""));
      }
      return be2__10376
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__10377)) {
    if(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__10377));
      return cljs.core.second.call(null, best_entry__10377)
    }else {
      cljs.core.reset_cache.call(null, method_cache, method_table, cached_hierarchy, hierarchy);
      return find_and_cache_best_method.call(null, name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy)
    }
  }else {
    return null
  }
};
cljs.core.IMultiFn = {};
cljs.core._reset = function _reset(mf) {
  if(function() {
    var and__3822__auto____10382 = mf;
    if(and__3822__auto____10382) {
      return mf.cljs$core$IMultiFn$_reset$arity$1
    }else {
      return and__3822__auto____10382
    }
  }()) {
    return mf.cljs$core$IMultiFn$_reset$arity$1(mf)
  }else {
    var x__2363__auto____10383 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10384 = cljs.core._reset[goog.typeOf(x__2363__auto____10383)];
      if(or__3824__auto____10384) {
        return or__3824__auto____10384
      }else {
        var or__3824__auto____10385 = cljs.core._reset["_"];
        if(or__3824__auto____10385) {
          return or__3824__auto____10385
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(function() {
    var and__3822__auto____10390 = mf;
    if(and__3822__auto____10390) {
      return mf.cljs$core$IMultiFn$_add_method$arity$3
    }else {
      return and__3822__auto____10390
    }
  }()) {
    return mf.cljs$core$IMultiFn$_add_method$arity$3(mf, dispatch_val, method)
  }else {
    var x__2363__auto____10391 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10392 = cljs.core._add_method[goog.typeOf(x__2363__auto____10391)];
      if(or__3824__auto____10392) {
        return or__3824__auto____10392
      }else {
        var or__3824__auto____10393 = cljs.core._add_method["_"];
        if(or__3824__auto____10393) {
          return or__3824__auto____10393
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____10398 = mf;
    if(and__3822__auto____10398) {
      return mf.cljs$core$IMultiFn$_remove_method$arity$2
    }else {
      return and__3822__auto____10398
    }
  }()) {
    return mf.cljs$core$IMultiFn$_remove_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____10399 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10400 = cljs.core._remove_method[goog.typeOf(x__2363__auto____10399)];
      if(or__3824__auto____10400) {
        return or__3824__auto____10400
      }else {
        var or__3824__auto____10401 = cljs.core._remove_method["_"];
        if(or__3824__auto____10401) {
          return or__3824__auto____10401
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(function() {
    var and__3822__auto____10406 = mf;
    if(and__3822__auto____10406) {
      return mf.cljs$core$IMultiFn$_prefer_method$arity$3
    }else {
      return and__3822__auto____10406
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefer_method$arity$3(mf, dispatch_val, dispatch_val_y)
  }else {
    var x__2363__auto____10407 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10408 = cljs.core._prefer_method[goog.typeOf(x__2363__auto____10407)];
      if(or__3824__auto____10408) {
        return or__3824__auto____10408
      }else {
        var or__3824__auto____10409 = cljs.core._prefer_method["_"];
        if(or__3824__auto____10409) {
          return or__3824__auto____10409
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(function() {
    var and__3822__auto____10414 = mf;
    if(and__3822__auto____10414) {
      return mf.cljs$core$IMultiFn$_get_method$arity$2
    }else {
      return and__3822__auto____10414
    }
  }()) {
    return mf.cljs$core$IMultiFn$_get_method$arity$2(mf, dispatch_val)
  }else {
    var x__2363__auto____10415 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10416 = cljs.core._get_method[goog.typeOf(x__2363__auto____10415)];
      if(or__3824__auto____10416) {
        return or__3824__auto____10416
      }else {
        var or__3824__auto____10417 = cljs.core._get_method["_"];
        if(or__3824__auto____10417) {
          return or__3824__auto____10417
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(function() {
    var and__3822__auto____10422 = mf;
    if(and__3822__auto____10422) {
      return mf.cljs$core$IMultiFn$_methods$arity$1
    }else {
      return and__3822__auto____10422
    }
  }()) {
    return mf.cljs$core$IMultiFn$_methods$arity$1(mf)
  }else {
    var x__2363__auto____10423 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10424 = cljs.core._methods[goog.typeOf(x__2363__auto____10423)];
      if(or__3824__auto____10424) {
        return or__3824__auto____10424
      }else {
        var or__3824__auto____10425 = cljs.core._methods["_"];
        if(or__3824__auto____10425) {
          return or__3824__auto____10425
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(function() {
    var and__3822__auto____10430 = mf;
    if(and__3822__auto____10430) {
      return mf.cljs$core$IMultiFn$_prefers$arity$1
    }else {
      return and__3822__auto____10430
    }
  }()) {
    return mf.cljs$core$IMultiFn$_prefers$arity$1(mf)
  }else {
    var x__2363__auto____10431 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10432 = cljs.core._prefers[goog.typeOf(x__2363__auto____10431)];
      if(or__3824__auto____10432) {
        return or__3824__auto____10432
      }else {
        var or__3824__auto____10433 = cljs.core._prefers["_"];
        if(or__3824__auto____10433) {
          return or__3824__auto____10433
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(function() {
    var and__3822__auto____10438 = mf;
    if(and__3822__auto____10438) {
      return mf.cljs$core$IMultiFn$_dispatch$arity$2
    }else {
      return and__3822__auto____10438
    }
  }()) {
    return mf.cljs$core$IMultiFn$_dispatch$arity$2(mf, args)
  }else {
    var x__2363__auto____10439 = mf == null ? null : mf;
    return function() {
      var or__3824__auto____10440 = cljs.core._dispatch[goog.typeOf(x__2363__auto____10439)];
      if(or__3824__auto____10440) {
        return or__3824__auto____10440
      }else {
        var or__3824__auto____10441 = cljs.core._dispatch["_"];
        if(or__3824__auto____10441) {
          return or__3824__auto____10441
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__10444 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__10445 = cljs.core._get_method.call(null, mf, dispatch_val__10444);
  if(cljs.core.truth_(target_fn__10445)) {
  }else {
    throw new Error([cljs.core.str("No method in multimethod '"), cljs.core.str(cljs.core.name), cljs.core.str("' for dispatch value: "), cljs.core.str(dispatch_val__10444)].join(""));
  }
  return cljs.core.apply.call(null, target_fn__10445, args)
};
cljs.core.MultiFn = function(name, dispatch_fn, default_dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  this.name = name;
  this.dispatch_fn = dispatch_fn;
  this.default_dispatch_val = default_dispatch_val;
  this.hierarchy = hierarchy;
  this.method_table = method_table;
  this.prefer_table = prefer_table;
  this.method_cache = method_cache;
  this.cached_hierarchy = cached_hierarchy;
  this.cljs$lang$protocol_mask$partition0$ = 4194304;
  this.cljs$lang$protocol_mask$partition1$ = 64
};
cljs.core.MultiFn.cljs$lang$type = true;
cljs.core.MultiFn.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/MultiFn")
};
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__10446 = this;
  return goog.getUid(this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset$arity$1 = function(mf) {
  var this__10447 = this;
  cljs.core.swap_BANG_.call(null, this__10447.method_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__10447.method_cache, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__10447.prefer_table, function(mf) {
    return cljs.core.ObjMap.EMPTY
  });
  cljs.core.swap_BANG_.call(null, this__10447.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method$arity$3 = function(mf, dispatch_val, method) {
  var this__10448 = this;
  cljs.core.swap_BANG_.call(null, this__10448.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__10448.method_cache, this__10448.method_table, this__10448.cached_hierarchy, this__10448.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method$arity$2 = function(mf, dispatch_val) {
  var this__10449 = this;
  cljs.core.swap_BANG_.call(null, this__10449.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__10449.method_cache, this__10449.method_table, this__10449.cached_hierarchy, this__10449.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method$arity$2 = function(mf, dispatch_val) {
  var this__10450 = this;
  if(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__10450.cached_hierarchy), cljs.core.deref.call(null, this__10450.hierarchy))) {
  }else {
    cljs.core.reset_cache.call(null, this__10450.method_cache, this__10450.method_table, this__10450.cached_hierarchy, this__10450.hierarchy)
  }
  var temp__3971__auto____10451 = cljs.core.deref.call(null, this__10450.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3971__auto____10451)) {
    var target_fn__10452 = temp__3971__auto____10451;
    return target_fn__10452
  }else {
    var temp__3971__auto____10453 = cljs.core.find_and_cache_best_method.call(null, this__10450.name, dispatch_val, this__10450.hierarchy, this__10450.method_table, this__10450.prefer_table, this__10450.method_cache, this__10450.cached_hierarchy);
    if(cljs.core.truth_(temp__3971__auto____10453)) {
      var target_fn__10454 = temp__3971__auto____10453;
      return target_fn__10454
    }else {
      return cljs.core.deref.call(null, this__10450.method_table).call(null, this__10450.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method$arity$3 = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__10455 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__10455.prefer_table))) {
    throw new Error([cljs.core.str("Preference conflict in multimethod '"), cljs.core.str(this__10455.name), cljs.core.str("': "), cljs.core.str(dispatch_val_y), cljs.core.str(" is already preferred to "), cljs.core.str(dispatch_val_x)].join(""));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__10455.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core._lookup.call(null, old, dispatch_val_x, cljs.core.PersistentHashSet.EMPTY), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__10455.method_cache, this__10455.method_table, this__10455.cached_hierarchy, this__10455.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods$arity$1 = function(mf) {
  var this__10456 = this;
  return cljs.core.deref.call(null, this__10456.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers$arity$1 = function(mf) {
  var this__10457 = this;
  return cljs.core.deref.call(null, this__10457.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch$arity$2 = function(mf, args) {
  var this__10458 = this;
  return cljs.core.do_dispatch.call(null, mf, this__10458.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__10460__delegate = function(_, args) {
    var self__10459 = this;
    return cljs.core._dispatch.call(null, self__10459, args)
  };
  var G__10460 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__10460__delegate.call(this, _, args)
  };
  G__10460.cljs$lang$maxFixedArity = 1;
  G__10460.cljs$lang$applyTo = function(arglist__10461) {
    var _ = cljs.core.first(arglist__10461);
    var args = cljs.core.rest(arglist__10461);
    return G__10460__delegate(_, args)
  };
  G__10460.cljs$lang$arity$variadic = G__10460__delegate;
  return G__10460
}();
cljs.core.MultiFn.prototype.apply = function(_, args) {
  var self__10462 = this;
  return cljs.core._dispatch.call(null, self__10462, args)
};
cljs.core.remove_all_methods = function remove_all_methods(multifn) {
  return cljs.core._reset.call(null, multifn)
};
cljs.core.remove_method = function remove_method(multifn, dispatch_val) {
  return cljs.core._remove_method.call(null, multifn, dispatch_val)
};
cljs.core.prefer_method = function prefer_method(multifn, dispatch_val_x, dispatch_val_y) {
  return cljs.core._prefer_method.call(null, multifn, dispatch_val_x, dispatch_val_y)
};
cljs.core.methods$ = function methods$(multifn) {
  return cljs.core._methods.call(null, multifn)
};
cljs.core.get_method = function get_method(multifn, dispatch_val) {
  return cljs.core._get_method.call(null, multifn, dispatch_val)
};
cljs.core.prefers = function prefers(multifn) {
  return cljs.core._prefers.call(null, multifn)
};
cljs.core.UUID = function(uuid) {
  this.uuid = uuid;
  this.cljs$lang$protocol_mask$partition1$ = 0;
  this.cljs$lang$protocol_mask$partition0$ = 543162368
};
cljs.core.UUID.cljs$lang$type = true;
cljs.core.UUID.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.core/UUID")
};
cljs.core.UUID.prototype.cljs$core$IHash$_hash$arity$1 = function(this$) {
  var this__10463 = this;
  return goog.string.hashCode(cljs.core.pr_str.call(null, this$))
};
cljs.core.UUID.prototype.cljs$core$IPrintable$_pr_seq$arity$2 = function(_10465, _) {
  var this__10464 = this;
  return cljs.core.list.call(null, [cljs.core.str('#uuid "'), cljs.core.str(this__10464.uuid), cljs.core.str('"')].join(""))
};
cljs.core.UUID.prototype.cljs$core$IEquiv$_equiv$arity$2 = function(_, other) {
  var this__10466 = this;
  var and__3822__auto____10467 = cljs.core.instance_QMARK_.call(null, cljs.core.UUID, other);
  if(and__3822__auto____10467) {
    return this__10466.uuid === other.uuid
  }else {
    return and__3822__auto____10467
  }
};
cljs.core.UUID.prototype.toString = function() {
  var this__10468 = this;
  var this__10469 = this;
  return cljs.core.pr_str.call(null, this__10469)
};
cljs.core.UUID;
goog.provide("clojure.string");
goog.require("cljs.core");
goog.require("goog.string.StringBuffer");
goog.require("goog.string");
clojure.string.seq_reverse = function seq_reverse(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
};
clojure.string.reverse = function reverse(s) {
  return s.split("").reverse().join("")
};
clojure.string.replace = function replace(s, match, replacement) {
  if(cljs.core.string_QMARK_.call(null, match)) {
    return s.replace(new RegExp(goog.string.regExpEscape(match), "g"), replacement)
  }else {
    if(cljs.core.truth_(match.hasOwnProperty("source"))) {
      return s.replace(new RegExp(match.source, "g"), replacement)
    }else {
      if("\ufdd0'else") {
        throw[cljs.core.str("Invalid match arg: "), cljs.core.str(match)].join("");
      }else {
        return null
      }
    }
  }
};
clojure.string.replace_first = function replace_first(s, match, replacement) {
  return s.replace(match, replacement)
};
clojure.string.join = function() {
  var join = null;
  var join__1 = function(coll) {
    return cljs.core.apply.call(null, cljs.core.str, coll)
  };
  var join__2 = function(separator, coll) {
    return cljs.core.apply.call(null, cljs.core.str, cljs.core.interpose.call(null, separator, coll))
  };
  join = function(separator, coll) {
    switch(arguments.length) {
      case 1:
        return join__1.call(this, separator);
      case 2:
        return join__2.call(this, separator, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  join.cljs$lang$arity$1 = join__1;
  join.cljs$lang$arity$2 = join__2;
  return join
}();
clojure.string.upper_case = function upper_case(s) {
  return s.toUpperCase()
};
clojure.string.lower_case = function lower_case(s) {
  return s.toLowerCase()
};
clojure.string.capitalize = function capitalize(s) {
  if(cljs.core.count.call(null, s) < 2) {
    return clojure.string.upper_case.call(null, s)
  }else {
    return[cljs.core.str(clojure.string.upper_case.call(null, cljs.core.subs.call(null, s, 0, 1))), cljs.core.str(clojure.string.lower_case.call(null, cljs.core.subs.call(null, s, 1)))].join("")
  }
};
clojure.string.split = function() {
  var split = null;
  var split__2 = function(s, re) {
    return cljs.core.vec.call(null, [cljs.core.str(s)].join("").split(re))
  };
  var split__3 = function(s, re, limit) {
    if(limit < 1) {
      return cljs.core.vec.call(null, [cljs.core.str(s)].join("").split(re))
    }else {
      var s__10908 = s;
      var limit__10909 = limit;
      var parts__10910 = cljs.core.PersistentVector.EMPTY;
      while(true) {
        if(cljs.core._EQ_.call(null, limit__10909, 1)) {
          return cljs.core.conj.call(null, parts__10910, s__10908)
        }else {
          var temp__3971__auto____10911 = cljs.core.re_find.call(null, re, s__10908);
          if(cljs.core.truth_(temp__3971__auto____10911)) {
            var m__10912 = temp__3971__auto____10911;
            var index__10913 = s__10908.indexOf(m__10912);
            var G__10914 = s__10908.substring(index__10913 + cljs.core.count.call(null, m__10912));
            var G__10915 = limit__10909 - 1;
            var G__10916 = cljs.core.conj.call(null, parts__10910, s__10908.substring(0, index__10913));
            s__10908 = G__10914;
            limit__10909 = G__10915;
            parts__10910 = G__10916;
            continue
          }else {
            return cljs.core.conj.call(null, parts__10910, s__10908)
          }
        }
        break
      }
    }
  };
  split = function(s, re, limit) {
    switch(arguments.length) {
      case 2:
        return split__2.call(this, s, re);
      case 3:
        return split__3.call(this, s, re, limit)
    }
    throw"Invalid arity: " + arguments.length;
  };
  split.cljs$lang$arity$2 = split__2;
  split.cljs$lang$arity$3 = split__3;
  return split
}();
clojure.string.split_lines = function split_lines(s) {
  return clojure.string.split.call(null, s, /\n|\r\n/)
};
clojure.string.trim = function trim(s) {
  return goog.string.trim(s)
};
clojure.string.triml = function triml(s) {
  return goog.string.trimLeft(s)
};
clojure.string.trimr = function trimr(s) {
  return goog.string.trimRight(s)
};
clojure.string.trim_newline = function trim_newline(s) {
  var index__10920 = s.length;
  while(true) {
    if(index__10920 === 0) {
      return""
    }else {
      var ch__10921 = cljs.core._lookup.call(null, s, index__10920 - 1, null);
      if(function() {
        var or__3824__auto____10922 = cljs.core._EQ_.call(null, ch__10921, "\n");
        if(or__3824__auto____10922) {
          return or__3824__auto____10922
        }else {
          return cljs.core._EQ_.call(null, ch__10921, "\r")
        }
      }()) {
        var G__10923 = index__10920 - 1;
        index__10920 = G__10923;
        continue
      }else {
        return s.substring(0, index__10920)
      }
    }
    break
  }
};
clojure.string.blank_QMARK_ = function blank_QMARK_(s) {
  var s__10927 = [cljs.core.str(s)].join("");
  if(cljs.core.truth_(function() {
    var or__3824__auto____10928 = cljs.core.not.call(null, s__10927);
    if(or__3824__auto____10928) {
      return or__3824__auto____10928
    }else {
      var or__3824__auto____10929 = cljs.core._EQ_.call(null, "", s__10927);
      if(or__3824__auto____10929) {
        return or__3824__auto____10929
      }else {
        return cljs.core.re_matches.call(null, /\s+/, s__10927)
      }
    }
  }())) {
    return true
  }else {
    return false
  }
};
clojure.string.escape = function escape(s, cmap) {
  var buffer__10936 = new goog.string.StringBuffer;
  var length__10937 = s.length;
  var index__10938 = 0;
  while(true) {
    if(cljs.core._EQ_.call(null, length__10937, index__10938)) {
      return buffer__10936.toString()
    }else {
      var ch__10939 = s.charAt(index__10938);
      var temp__3971__auto____10940 = cljs.core._lookup.call(null, cmap, ch__10939, null);
      if(cljs.core.truth_(temp__3971__auto____10940)) {
        var replacement__10941 = temp__3971__auto____10940;
        buffer__10936.append([cljs.core.str(replacement__10941)].join(""))
      }else {
        buffer__10936.append(ch__10939)
      }
      var G__10942 = index__10938 + 1;
      index__10938 = G__10942;
      continue
    }
    break
  }
};
goog.provide("hiccups.runtime");
goog.require("cljs.core");
goog.require("clojure.string");
hiccups.runtime.re_tag = /([^\s\.#]+)(?:#([^s\.#]+))?(?:\.([^\s#]+))?/;
hiccups.runtime.character_escapes = cljs.core.PersistentArrayMap.fromArrays(["&", "<", ">", '"'], ["&amp;", "&lt;", "&gt;", "&quot;"]);
hiccups.runtime.container_tags = cljs.core.PersistentHashSet.fromArray(["dd", "head", "a", "b", "body", "pre", "form", "iframe", "dl", "em", "fieldset", "i", "h1", "h2", "span", "h3", "script", "html", "h4", "h5", "h6", "table", "dt", "div", "style", "label", "option", "ul", "strong", "canvas", "textarea", "li", "ol"]);
hiccups.runtime.as_str = function as_str(x) {
  if(function() {
    var or__3824__auto____10722 = cljs.core.keyword_QMARK_.call(null, x);
    if(or__3824__auto____10722) {
      return or__3824__auto____10722
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }()) {
    return cljs.core.name.call(null, x)
  }else {
    return[cljs.core.str(x)].join("")
  }
};
hiccups.runtime._STAR_html_mode_STAR_ = "\ufdd0'xml";
hiccups.runtime.xml_mode_QMARK_ = function xml_mode_QMARK_() {
  return cljs.core._EQ_.call(null, hiccups.runtime._STAR_html_mode_STAR_, "\ufdd0'xml")
};
hiccups.runtime.in_mode = function in_mode(mode, f) {
  var _STAR_html_mode_STAR_10726__10727 = hiccups.runtime._STAR_html_mode_STAR_;
  try {
    hiccups.runtime._STAR_html_mode_STAR_ = mode;
    return f.call(null)
  }finally {
    hiccups.runtime._STAR_html_mode_STAR_ = _STAR_html_mode_STAR_10726__10727
  }
};
hiccups.runtime.escape_html = function escape_html(text) {
  return clojure.string.escape.call(null, hiccups.runtime.as_str.call(null, text), hiccups.runtime.character_escapes)
};
hiccups.runtime.h = hiccups.runtime.escape_html;
hiccups.runtime.end_tag = function end_tag() {
  if(cljs.core.truth_(hiccups.runtime.xml_mode_QMARK_.call(null))) {
    return" />"
  }else {
    return">"
  }
};
hiccups.runtime.xml_attribute = function xml_attribute(name, value) {
  return[cljs.core.str(" "), cljs.core.str(hiccups.runtime.as_str.call(null, name)), cljs.core.str('="'), cljs.core.str(hiccups.runtime.escape_html.call(null, value)), cljs.core.str('"')].join("")
};
hiccups.runtime.render_attribute = function render_attribute(p__10729) {
  var vec__10734__10735 = p__10729;
  var name__10736 = cljs.core.nth.call(null, vec__10734__10735, 0, null);
  var value__10737 = cljs.core.nth.call(null, vec__10734__10735, 1, null);
  if(value__10737 === true) {
    if(cljs.core.truth_(hiccups.runtime.xml_mode_QMARK_.call(null))) {
      return hiccups.runtime.xml_attribute.call(null, name__10736, name__10736)
    }else {
      return[cljs.core.str(" "), cljs.core.str(hiccups.runtime.as_str.call(null, name__10736))].join("")
    }
  }else {
    if(cljs.core.not.call(null, value__10737)) {
      return""
    }else {
      if("\ufdd0'else") {
        return hiccups.runtime.xml_attribute.call(null, name__10736, value__10737)
      }else {
        return null
      }
    }
  }
};
hiccups.runtime.render_attr_map = function render_attr_map(attrs) {
  return cljs.core.apply.call(null, cljs.core.str, cljs.core.sort.call(null, cljs.core.map.call(null, hiccups.runtime.render_attribute, attrs)))
};
hiccups.runtime.normalize_element = function normalize_element(p__10738) {
  var vec__10753__10754 = p__10738;
  var tag__10755 = cljs.core.nth.call(null, vec__10753__10754, 0, null);
  var content__10756 = cljs.core.nthnext.call(null, vec__10753__10754, 1);
  if(!function() {
    var or__3824__auto____10757 = cljs.core.keyword_QMARK_.call(null, tag__10755);
    if(or__3824__auto____10757) {
      return or__3824__auto____10757
    }else {
      var or__3824__auto____10758 = cljs.core.symbol_QMARK_.call(null, tag__10755);
      if(or__3824__auto____10758) {
        return or__3824__auto____10758
      }else {
        return cljs.core.string_QMARK_.call(null, tag__10755)
      }
    }
  }()) {
    throw[cljs.core.str(tag__10755), cljs.core.str(" is not a valid tag name")].join("");
  }else {
  }
  var vec__10759__10760 = cljs.core.re_matches.call(null, hiccups.runtime.re_tag, hiccups.runtime.as_str.call(null, tag__10755));
  var ___10761 = cljs.core.nth.call(null, vec__10759__10760, 0, null);
  var tag__10762 = cljs.core.nth.call(null, vec__10759__10760, 1, null);
  var id__10763 = cljs.core.nth.call(null, vec__10759__10760, 2, null);
  var class__10764 = cljs.core.nth.call(null, vec__10759__10760, 3, null);
  var tag_attrs__10765 = cljs.core.ObjMap.fromObject(["\ufdd0'id", "\ufdd0'class"], {"\ufdd0'id":id__10763, "\ufdd0'class":cljs.core.truth_(class__10764) ? class__10764.replace(".", " ") : null});
  var map_attrs__10766 = cljs.core.first.call(null, content__10756);
  if(cljs.core.map_QMARK_.call(null, map_attrs__10766)) {
    return cljs.core.PersistentVector.fromArray([tag__10762, cljs.core.merge.call(null, tag_attrs__10765, map_attrs__10766), cljs.core.next.call(null, content__10756)], true)
  }else {
    return cljs.core.PersistentVector.fromArray([tag__10762, tag_attrs__10765, content__10756], true)
  }
};
hiccups.runtime.render_element = function render_element(element) {
  var vec__10773__10774 = hiccups.runtime.normalize_element.call(null, element);
  var tag__10775 = cljs.core.nth.call(null, vec__10773__10774, 0, null);
  var attrs__10776 = cljs.core.nth.call(null, vec__10773__10774, 1, null);
  var content__10777 = cljs.core.nth.call(null, vec__10773__10774, 2, null);
  if(cljs.core.truth_(function() {
    var or__3824__auto____10778 = content__10777;
    if(cljs.core.truth_(or__3824__auto____10778)) {
      return or__3824__auto____10778
    }else {
      return hiccups.runtime.container_tags.call(null, tag__10775)
    }
  }())) {
    return[cljs.core.str("<"), cljs.core.str(tag__10775), cljs.core.str(hiccups.runtime.render_attr_map.call(null, attrs__10776)), cljs.core.str(">"), cljs.core.str(hiccups.runtime.render_html.call(null, content__10777)), cljs.core.str("</"), cljs.core.str(tag__10775), cljs.core.str(">")].join("")
  }else {
    return[cljs.core.str("<"), cljs.core.str(tag__10775), cljs.core.str(hiccups.runtime.render_attr_map.call(null, attrs__10776)), cljs.core.str(hiccups.runtime.end_tag.call(null))].join("")
  }
};
hiccups.runtime.render_html = function render_html(x) {
  if(cljs.core.vector_QMARK_.call(null, x)) {
    return hiccups.runtime.render_element.call(null, x)
  }else {
    if(cljs.core.seq_QMARK_.call(null, x)) {
      return cljs.core.apply.call(null, cljs.core.str, cljs.core.map.call(null, render_html, x))
    }else {
      if("\ufdd0'else") {
        return hiccups.runtime.as_str.call(null, x)
      }else {
        return null
      }
    }
  }
};
goog.provide("cljs.reader");
goog.require("cljs.core");
goog.require("goog.string");
cljs.reader.PushbackReader = {};
cljs.reader.read_char = function read_char(reader) {
  if(function() {
    var and__3822__auto____10475 = reader;
    if(and__3822__auto____10475) {
      return reader.cljs$reader$PushbackReader$read_char$arity$1
    }else {
      return and__3822__auto____10475
    }
  }()) {
    return reader.cljs$reader$PushbackReader$read_char$arity$1(reader)
  }else {
    var x__2363__auto____10476 = reader == null ? null : reader;
    return function() {
      var or__3824__auto____10477 = cljs.reader.read_char[goog.typeOf(x__2363__auto____10476)];
      if(or__3824__auto____10477) {
        return or__3824__auto____10477
      }else {
        var or__3824__auto____10478 = cljs.reader.read_char["_"];
        if(or__3824__auto____10478) {
          return or__3824__auto____10478
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.read-char", reader);
        }
      }
    }().call(null, reader)
  }
};
cljs.reader.unread = function unread(reader, ch) {
  if(function() {
    var and__3822__auto____10483 = reader;
    if(and__3822__auto____10483) {
      return reader.cljs$reader$PushbackReader$unread$arity$2
    }else {
      return and__3822__auto____10483
    }
  }()) {
    return reader.cljs$reader$PushbackReader$unread$arity$2(reader, ch)
  }else {
    var x__2363__auto____10484 = reader == null ? null : reader;
    return function() {
      var or__3824__auto____10485 = cljs.reader.unread[goog.typeOf(x__2363__auto____10484)];
      if(or__3824__auto____10485) {
        return or__3824__auto____10485
      }else {
        var or__3824__auto____10486 = cljs.reader.unread["_"];
        if(or__3824__auto____10486) {
          return or__3824__auto____10486
        }else {
          throw cljs.core.missing_protocol.call(null, "PushbackReader.unread", reader);
        }
      }
    }().call(null, reader, ch)
  }
};
cljs.reader.StringPushbackReader = function(s, index_atom, buffer_atom) {
  this.s = s;
  this.index_atom = index_atom;
  this.buffer_atom = buffer_atom
};
cljs.reader.StringPushbackReader.cljs$lang$type = true;
cljs.reader.StringPushbackReader.cljs$lang$ctorPrSeq = function(this__2309__auto__) {
  return cljs.core.list.call(null, "cljs.reader/StringPushbackReader")
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$ = true;
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$read_char$arity$1 = function(reader) {
  var this__10487 = this;
  if(cljs.core.empty_QMARK_.call(null, cljs.core.deref.call(null, this__10487.buffer_atom))) {
    var idx__10488 = cljs.core.deref.call(null, this__10487.index_atom);
    cljs.core.swap_BANG_.call(null, this__10487.index_atom, cljs.core.inc);
    return this__10487.s[idx__10488]
  }else {
    var buf__10489 = cljs.core.deref.call(null, this__10487.buffer_atom);
    cljs.core.swap_BANG_.call(null, this__10487.buffer_atom, cljs.core.rest);
    return cljs.core.first.call(null, buf__10489)
  }
};
cljs.reader.StringPushbackReader.prototype.cljs$reader$PushbackReader$unread$arity$2 = function(reader, ch) {
  var this__10490 = this;
  return cljs.core.swap_BANG_.call(null, this__10490.buffer_atom, function(p1__10470_SHARP_) {
    return cljs.core.cons.call(null, ch, p1__10470_SHARP_)
  })
};
cljs.reader.StringPushbackReader;
cljs.reader.push_back_reader = function push_back_reader(s) {
  return new cljs.reader.StringPushbackReader(s, cljs.core.atom.call(null, 0), cljs.core.atom.call(null, null))
};
cljs.reader.whitespace_QMARK_ = function whitespace_QMARK_(ch) {
  var or__3824__auto____10492 = goog.string.isBreakingWhitespace(ch);
  if(cljs.core.truth_(or__3824__auto____10492)) {
    return or__3824__auto____10492
  }else {
    return"," === ch
  }
};
cljs.reader.numeric_QMARK_ = function numeric_QMARK_(ch) {
  return goog.string.isNumeric(ch)
};
cljs.reader.comment_prefix_QMARK_ = function comment_prefix_QMARK_(ch) {
  return";" === ch
};
cljs.reader.number_literal_QMARK_ = function number_literal_QMARK_(reader, initch) {
  var or__3824__auto____10497 = cljs.reader.numeric_QMARK_.call(null, initch);
  if(or__3824__auto____10497) {
    return or__3824__auto____10497
  }else {
    var and__3822__auto____10499 = function() {
      var or__3824__auto____10498 = "+" === initch;
      if(or__3824__auto____10498) {
        return or__3824__auto____10498
      }else {
        return"-" === initch
      }
    }();
    if(cljs.core.truth_(and__3822__auto____10499)) {
      return cljs.reader.numeric_QMARK_.call(null, function() {
        var next_ch__10500 = cljs.reader.read_char.call(null, reader);
        cljs.reader.unread.call(null, reader, next_ch__10500);
        return next_ch__10500
      }())
    }else {
      return and__3822__auto____10499
    }
  }
};
cljs.reader.reader_error = function() {
  var reader_error__delegate = function(rdr, msg) {
    throw new Error(cljs.core.apply.call(null, cljs.core.str, msg));
  };
  var reader_error = function(rdr, var_args) {
    var msg = null;
    if(goog.isDef(var_args)) {
      msg = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return reader_error__delegate.call(this, rdr, msg)
  };
  reader_error.cljs$lang$maxFixedArity = 1;
  reader_error.cljs$lang$applyTo = function(arglist__10501) {
    var rdr = cljs.core.first(arglist__10501);
    var msg = cljs.core.rest(arglist__10501);
    return reader_error__delegate(rdr, msg)
  };
  reader_error.cljs$lang$arity$variadic = reader_error__delegate;
  return reader_error
}();
cljs.reader.macro_terminating_QMARK_ = function macro_terminating_QMARK_(ch) {
  var and__3822__auto____10505 = !(ch === "#");
  if(and__3822__auto____10505) {
    var and__3822__auto____10506 = !(ch === "'");
    if(and__3822__auto____10506) {
      var and__3822__auto____10507 = !(ch === ":");
      if(and__3822__auto____10507) {
        return cljs.reader.macros.call(null, ch)
      }else {
        return and__3822__auto____10507
      }
    }else {
      return and__3822__auto____10506
    }
  }else {
    return and__3822__auto____10505
  }
};
cljs.reader.read_token = function read_token(rdr, initch) {
  var sb__10512 = new goog.string.StringBuffer(initch);
  var ch__10513 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(function() {
      var or__3824__auto____10514 = ch__10513 == null;
      if(or__3824__auto____10514) {
        return or__3824__auto____10514
      }else {
        var or__3824__auto____10515 = cljs.reader.whitespace_QMARK_.call(null, ch__10513);
        if(or__3824__auto____10515) {
          return or__3824__auto____10515
        }else {
          return cljs.reader.macro_terminating_QMARK_.call(null, ch__10513)
        }
      }
    }()) {
      cljs.reader.unread.call(null, rdr, ch__10513);
      return sb__10512.toString()
    }else {
      var G__10516 = function() {
        sb__10512.append(ch__10513);
        return sb__10512
      }();
      var G__10517 = cljs.reader.read_char.call(null, rdr);
      sb__10512 = G__10516;
      ch__10513 = G__10517;
      continue
    }
    break
  }
};
cljs.reader.skip_line = function skip_line(reader, _) {
  while(true) {
    var ch__10521 = cljs.reader.read_char.call(null, reader);
    if(function() {
      var or__3824__auto____10522 = ch__10521 === "n";
      if(or__3824__auto____10522) {
        return or__3824__auto____10522
      }else {
        var or__3824__auto____10523 = ch__10521 === "r";
        if(or__3824__auto____10523) {
          return or__3824__auto____10523
        }else {
          return ch__10521 == null
        }
      }
    }()) {
      return reader
    }else {
      continue
    }
    break
  }
};
cljs.reader.int_pattern = cljs.core.re_pattern.call(null, "([-+]?)(?:(0)|([1-9][0-9]*)|0[xX]([0-9A-Fa-f]+)|0([0-7]+)|([1-9][0-9]?)[rR]([0-9A-Za-z]+)|0[0-9]+)(N)?");
cljs.reader.ratio_pattern = cljs.core.re_pattern.call(null, "([-+]?[0-9]+)/([0-9]+)");
cljs.reader.float_pattern = cljs.core.re_pattern.call(null, "([-+]?[0-9]+(\\.[0-9]*)?([eE][-+]?[0-9]+)?)(M)?");
cljs.reader.symbol_pattern = cljs.core.re_pattern.call(null, "[:]?([^0-9/].*/)?([^0-9/][^/]*)");
cljs.reader.re_find_STAR_ = function re_find_STAR_(re, s) {
  var matches__10525 = re.exec(s);
  if(matches__10525 == null) {
    return null
  }else {
    if(matches__10525.length === 1) {
      return matches__10525[0]
    }else {
      return matches__10525
    }
  }
};
cljs.reader.match_int = function match_int(s) {
  var groups__10533 = cljs.reader.re_find_STAR_.call(null, cljs.reader.int_pattern, s);
  var group3__10534 = groups__10533[2];
  if(!function() {
    var or__3824__auto____10535 = group3__10534 == null;
    if(or__3824__auto____10535) {
      return or__3824__auto____10535
    }else {
      return group3__10534.length < 1
    }
  }()) {
    return 0
  }else {
    var negate__10536 = "-" === groups__10533[1] ? -1 : 1;
    var a__10537 = cljs.core.truth_(groups__10533[3]) ? [groups__10533[3], 10] : cljs.core.truth_(groups__10533[4]) ? [groups__10533[4], 16] : cljs.core.truth_(groups__10533[5]) ? [groups__10533[5], 8] : cljs.core.truth_(groups__10533[7]) ? [groups__10533[7], parseInt(groups__10533[7])] : "\ufdd0'default" ? [null, null] : null;
    var n__10538 = a__10537[0];
    var radix__10539 = a__10537[1];
    if(n__10538 == null) {
      return null
    }else {
      return negate__10536 * parseInt(n__10538, radix__10539)
    }
  }
};
cljs.reader.match_ratio = function match_ratio(s) {
  var groups__10543 = cljs.reader.re_find_STAR_.call(null, cljs.reader.ratio_pattern, s);
  var numinator__10544 = groups__10543[1];
  var denominator__10545 = groups__10543[2];
  return parseInt(numinator__10544) / parseInt(denominator__10545)
};
cljs.reader.match_float = function match_float(s) {
  return parseFloat(s)
};
cljs.reader.re_matches_STAR_ = function re_matches_STAR_(re, s) {
  var matches__10548 = re.exec(s);
  if(function() {
    var and__3822__auto____10549 = !(matches__10548 == null);
    if(and__3822__auto____10549) {
      return matches__10548[0] === s
    }else {
      return and__3822__auto____10549
    }
  }()) {
    if(matches__10548.length === 1) {
      return matches__10548[0]
    }else {
      return matches__10548
    }
  }else {
    return null
  }
};
cljs.reader.match_number = function match_number(s) {
  if(cljs.core.truth_(cljs.reader.re_matches_STAR_.call(null, cljs.reader.int_pattern, s))) {
    return cljs.reader.match_int.call(null, s)
  }else {
    if(cljs.core.truth_(cljs.reader.re_matches_STAR_.call(null, cljs.reader.ratio_pattern, s))) {
      return cljs.reader.match_ratio.call(null, s)
    }else {
      if(cljs.core.truth_(cljs.reader.re_matches_STAR_.call(null, cljs.reader.float_pattern, s))) {
        return cljs.reader.match_float.call(null, s)
      }else {
        return null
      }
    }
  }
};
cljs.reader.escape_char_map = function escape_char_map(c) {
  if(c === "t") {
    return"\t"
  }else {
    if(c === "r") {
      return"\r"
    }else {
      if(c === "n") {
        return"\n"
      }else {
        if(c === "\\") {
          return"\\"
        }else {
          if(c === '"') {
            return'"'
          }else {
            if(c === "b") {
              return"\u0008"
            }else {
              if(c === "f") {
                return"\u000c"
              }else {
                if("\ufdd0'else") {
                  return null
                }else {
                  return null
                }
              }
            }
          }
        }
      }
    }
  }
};
cljs.reader.read_2_chars = function read_2_chars(reader) {
  return(new goog.string.StringBuffer(cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader))).toString()
};
cljs.reader.read_4_chars = function read_4_chars(reader) {
  return(new goog.string.StringBuffer(cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader), cljs.reader.read_char.call(null, reader))).toString()
};
cljs.reader.unicode_2_pattern = cljs.core.re_pattern.call(null, "[0-9A-Fa-f]{2}");
cljs.reader.unicode_4_pattern = cljs.core.re_pattern.call(null, "[0-9A-Fa-f]{4}");
cljs.reader.validate_unicode_escape = function validate_unicode_escape(unicode_pattern, reader, escape_char, unicode_str) {
  if(cljs.core.truth_(cljs.core.re_matches.call(null, unicode_pattern, unicode_str))) {
    return unicode_str
  }else {
    return cljs.reader.reader_error.call(null, reader, "Unexpected unicode escape \\", escape_char, unicode_str)
  }
};
cljs.reader.make_unicode_char = function make_unicode_char(code_str) {
  var code__10551 = parseInt(code_str, 16);
  return String.fromCharCode(code__10551)
};
cljs.reader.escape_char = function escape_char(buffer, reader) {
  var ch__10554 = cljs.reader.read_char.call(null, reader);
  var mapresult__10555 = cljs.reader.escape_char_map.call(null, ch__10554);
  if(cljs.core.truth_(mapresult__10555)) {
    return mapresult__10555
  }else {
    if(ch__10554 === "x") {
      return cljs.reader.make_unicode_char.call(null, cljs.reader.validate_unicode_escape.call(null, cljs.reader.unicode_2_pattern, reader, ch__10554, cljs.reader.read_2_chars.call(null, reader)))
    }else {
      if(ch__10554 === "u") {
        return cljs.reader.make_unicode_char.call(null, cljs.reader.validate_unicode_escape.call(null, cljs.reader.unicode_4_pattern, reader, ch__10554, cljs.reader.read_4_chars.call(null, reader)))
      }else {
        if(cljs.reader.numeric_QMARK_.call(null, ch__10554)) {
          return String.fromCharCode(ch__10554)
        }else {
          if("\ufdd0'else") {
            return cljs.reader.reader_error.call(null, reader, "Unexpected unicode escape \\", ch__10554)
          }else {
            return null
          }
        }
      }
    }
  }
};
cljs.reader.read_past = function read_past(pred, rdr) {
  var ch__10557 = cljs.reader.read_char.call(null, rdr);
  while(true) {
    if(cljs.core.truth_(pred.call(null, ch__10557))) {
      var G__10558 = cljs.reader.read_char.call(null, rdr);
      ch__10557 = G__10558;
      continue
    }else {
      return ch__10557
    }
    break
  }
};
cljs.reader.read_delimited_list = function read_delimited_list(delim, rdr, recursive_QMARK_) {
  var a__10565 = cljs.core.transient$.call(null, cljs.core.PersistentVector.EMPTY);
  while(true) {
    var ch__10566 = cljs.reader.read_past.call(null, cljs.reader.whitespace_QMARK_, rdr);
    if(cljs.core.truth_(ch__10566)) {
    }else {
      cljs.reader.reader_error.call(null, rdr, "EOF")
    }
    if(delim === ch__10566) {
      return cljs.core.persistent_BANG_.call(null, a__10565)
    }else {
      var temp__3971__auto____10567 = cljs.reader.macros.call(null, ch__10566);
      if(cljs.core.truth_(temp__3971__auto____10567)) {
        var macrofn__10568 = temp__3971__auto____10567;
        var mret__10569 = macrofn__10568.call(null, rdr, ch__10566);
        var G__10571 = mret__10569 === rdr ? a__10565 : cljs.core.conj_BANG_.call(null, a__10565, mret__10569);
        a__10565 = G__10571;
        continue
      }else {
        cljs.reader.unread.call(null, rdr, ch__10566);
        var o__10570 = cljs.reader.read.call(null, rdr, true, null, recursive_QMARK_);
        var G__10572 = o__10570 === rdr ? a__10565 : cljs.core.conj_BANG_.call(null, a__10565, o__10570);
        a__10565 = G__10572;
        continue
      }
    }
    break
  }
};
cljs.reader.not_implemented = function not_implemented(rdr, ch) {
  return cljs.reader.reader_error.call(null, rdr, "Reader for ", ch, " not implemented yet")
};
cljs.reader.read_dispatch = function read_dispatch(rdr, _) {
  var ch__10577 = cljs.reader.read_char.call(null, rdr);
  var dm__10578 = cljs.reader.dispatch_macros.call(null, ch__10577);
  if(cljs.core.truth_(dm__10578)) {
    return dm__10578.call(null, rdr, _)
  }else {
    var temp__3971__auto____10579 = cljs.reader.maybe_read_tagged_type.call(null, rdr, ch__10577);
    if(cljs.core.truth_(temp__3971__auto____10579)) {
      var obj__10580 = temp__3971__auto____10579;
      return obj__10580
    }else {
      return cljs.reader.reader_error.call(null, rdr, "No dispatch macro for ", ch__10577)
    }
  }
};
cljs.reader.read_unmatched_delimiter = function read_unmatched_delimiter(rdr, ch) {
  return cljs.reader.reader_error.call(null, rdr, "Unmached delimiter ", ch)
};
cljs.reader.read_list = function read_list(rdr, _) {
  return cljs.core.apply.call(null, cljs.core.list, cljs.reader.read_delimited_list.call(null, ")", rdr, true))
};
cljs.reader.read_comment = cljs.reader.skip_line;
cljs.reader.read_vector = function read_vector(rdr, _) {
  return cljs.reader.read_delimited_list.call(null, "]", rdr, true)
};
cljs.reader.read_map = function read_map(rdr, _) {
  var l__10582 = cljs.reader.read_delimited_list.call(null, "}", rdr, true);
  if(cljs.core.odd_QMARK_.call(null, cljs.core.count.call(null, l__10582))) {
    cljs.reader.reader_error.call(null, rdr, "Map literal must contain an even number of forms")
  }else {
  }
  return cljs.core.apply.call(null, cljs.core.hash_map, l__10582)
};
cljs.reader.read_number = function read_number(reader, initch) {
  var buffer__10589 = new goog.string.StringBuffer(initch);
  var ch__10590 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(cljs.core.truth_(function() {
      var or__3824__auto____10591 = ch__10590 == null;
      if(or__3824__auto____10591) {
        return or__3824__auto____10591
      }else {
        var or__3824__auto____10592 = cljs.reader.whitespace_QMARK_.call(null, ch__10590);
        if(or__3824__auto____10592) {
          return or__3824__auto____10592
        }else {
          return cljs.reader.macros.call(null, ch__10590)
        }
      }
    }())) {
      cljs.reader.unread.call(null, reader, ch__10590);
      var s__10593 = buffer__10589.toString();
      var or__3824__auto____10594 = cljs.reader.match_number.call(null, s__10593);
      if(cljs.core.truth_(or__3824__auto____10594)) {
        return or__3824__auto____10594
      }else {
        return cljs.reader.reader_error.call(null, reader, "Invalid number format [", s__10593, "]")
      }
    }else {
      var G__10595 = function() {
        buffer__10589.append(ch__10590);
        return buffer__10589
      }();
      var G__10596 = cljs.reader.read_char.call(null, reader);
      buffer__10589 = G__10595;
      ch__10590 = G__10596;
      continue
    }
    break
  }
};
cljs.reader.read_string_STAR_ = function read_string_STAR_(reader, _) {
  var buffer__10599 = new goog.string.StringBuffer;
  var ch__10600 = cljs.reader.read_char.call(null, reader);
  while(true) {
    if(ch__10600 == null) {
      return cljs.reader.reader_error.call(null, reader, "EOF while reading string")
    }else {
      if("\\" === ch__10600) {
        var G__10601 = function() {
          buffer__10599.append(cljs.reader.escape_char.call(null, buffer__10599, reader));
          return buffer__10599
        }();
        var G__10602 = cljs.reader.read_char.call(null, reader);
        buffer__10599 = G__10601;
        ch__10600 = G__10602;
        continue
      }else {
        if('"' === ch__10600) {
          return buffer__10599.toString()
        }else {
          if("\ufdd0'default") {
            var G__10603 = function() {
              buffer__10599.append(ch__10600);
              return buffer__10599
            }();
            var G__10604 = cljs.reader.read_char.call(null, reader);
            buffer__10599 = G__10603;
            ch__10600 = G__10604;
            continue
          }else {
            return null
          }
        }
      }
    }
    break
  }
};
cljs.reader.special_symbols = function special_symbols(t, not_found) {
  if(t === "nil") {
    return null
  }else {
    if(t === "true") {
      return true
    }else {
      if(t === "false") {
        return false
      }else {
        if("\ufdd0'else") {
          return not_found
        }else {
          return null
        }
      }
    }
  }
};
cljs.reader.read_symbol = function read_symbol(reader, initch) {
  var token__10606 = cljs.reader.read_token.call(null, reader, initch);
  if(cljs.core.truth_(goog.string.contains(token__10606, "/"))) {
    return cljs.core.symbol.call(null, cljs.core.subs.call(null, token__10606, 0, token__10606.indexOf("/")), cljs.core.subs.call(null, token__10606, token__10606.indexOf("/") + 1, token__10606.length))
  }else {
    return cljs.reader.special_symbols.call(null, token__10606, cljs.core.symbol.call(null, token__10606))
  }
};
cljs.reader.read_keyword = function read_keyword(reader, initch) {
  var token__10616 = cljs.reader.read_token.call(null, reader, cljs.reader.read_char.call(null, reader));
  var a__10617 = cljs.reader.re_matches_STAR_.call(null, cljs.reader.symbol_pattern, token__10616);
  var token__10618 = a__10617[0];
  var ns__10619 = a__10617[1];
  var name__10620 = a__10617[2];
  if(cljs.core.truth_(function() {
    var or__3824__auto____10622 = function() {
      var and__3822__auto____10621 = !(void 0 === ns__10619);
      if(and__3822__auto____10621) {
        return ns__10619.substring(ns__10619.length - 2, ns__10619.length) === ":/"
      }else {
        return and__3822__auto____10621
      }
    }();
    if(cljs.core.truth_(or__3824__auto____10622)) {
      return or__3824__auto____10622
    }else {
      var or__3824__auto____10623 = name__10620[name__10620.length - 1] === ":";
      if(or__3824__auto____10623) {
        return or__3824__auto____10623
      }else {
        return!(token__10618.indexOf("::", 1) === -1)
      }
    }
  }())) {
    return cljs.reader.reader_error.call(null, reader, "Invalid token: ", token__10618)
  }else {
    if(function() {
      var and__3822__auto____10624 = !(ns__10619 == null);
      if(and__3822__auto____10624) {
        return ns__10619.length > 0
      }else {
        return and__3822__auto____10624
      }
    }()) {
      return cljs.core.keyword.call(null, ns__10619.substring(0, ns__10619.indexOf("/")), name__10620)
    }else {
      return cljs.core.keyword.call(null, token__10618)
    }
  }
};
cljs.reader.desugar_meta = function desugar_meta(f) {
  if(cljs.core.symbol_QMARK_.call(null, f)) {
    return cljs.core.ObjMap.fromObject(["\ufdd0'tag"], {"\ufdd0'tag":f})
  }else {
    if(cljs.core.string_QMARK_.call(null, f)) {
      return cljs.core.ObjMap.fromObject(["\ufdd0'tag"], {"\ufdd0'tag":f})
    }else {
      if(cljs.core.keyword_QMARK_.call(null, f)) {
        return cljs.core.PersistentArrayMap.fromArrays([f], [true])
      }else {
        if("\ufdd0'else") {
          return f
        }else {
          return null
        }
      }
    }
  }
};
cljs.reader.wrapping_reader = function wrapping_reader(sym) {
  return function(rdr, _) {
    return cljs.core.list.call(null, sym, cljs.reader.read.call(null, rdr, true, null, true))
  }
};
cljs.reader.throwing_reader = function throwing_reader(msg) {
  return function(rdr, _) {
    return cljs.reader.reader_error.call(null, rdr, msg)
  }
};
cljs.reader.read_meta = function read_meta(rdr, _) {
  var m__10630 = cljs.reader.desugar_meta.call(null, cljs.reader.read.call(null, rdr, true, null, true));
  if(cljs.core.map_QMARK_.call(null, m__10630)) {
  }else {
    cljs.reader.reader_error.call(null, rdr, "Metadata must be Symbol,Keyword,String or Map")
  }
  var o__10631 = cljs.reader.read.call(null, rdr, true, null, true);
  if(function() {
    var G__10632__10633 = o__10631;
    if(G__10632__10633) {
      if(function() {
        var or__3824__auto____10634 = G__10632__10633.cljs$lang$protocol_mask$partition0$ & 262144;
        if(or__3824__auto____10634) {
          return or__3824__auto____10634
        }else {
          return G__10632__10633.cljs$core$IWithMeta$
        }
      }()) {
        return true
      }else {
        if(!G__10632__10633.cljs$lang$protocol_mask$partition0$) {
          return cljs.core.type_satisfies_.call(null, cljs.core.IWithMeta, G__10632__10633)
        }else {
          return false
        }
      }
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IWithMeta, G__10632__10633)
    }
  }()) {
    return cljs.core.with_meta.call(null, o__10631, cljs.core.merge.call(null, cljs.core.meta.call(null, o__10631), m__10630))
  }else {
    return cljs.reader.reader_error.call(null, rdr, "Metadata can only be applied to IWithMetas")
  }
};
cljs.reader.read_set = function read_set(rdr, _) {
  return cljs.core.set.call(null, cljs.reader.read_delimited_list.call(null, "}", rdr, true))
};
cljs.reader.read_regex = function read_regex(rdr, ch) {
  return cljs.core.re_pattern.call(null, cljs.reader.read_string_STAR_.call(null, rdr, ch))
};
cljs.reader.read_discard = function read_discard(rdr, _) {
  cljs.reader.read.call(null, rdr, true, null, true);
  return rdr
};
cljs.reader.macros = function macros(c) {
  if(c === '"') {
    return cljs.reader.read_string_STAR_
  }else {
    if(c === ":") {
      return cljs.reader.read_keyword
    }else {
      if(c === ";") {
        return cljs.reader.not_implemented
      }else {
        if(c === "'") {
          return cljs.reader.wrapping_reader.call(null, "\ufdd1'quote")
        }else {
          if(c === "@") {
            return cljs.reader.wrapping_reader.call(null, "\ufdd1'deref")
          }else {
            if(c === "^") {
              return cljs.reader.read_meta
            }else {
              if(c === "`") {
                return cljs.reader.not_implemented
              }else {
                if(c === "~") {
                  return cljs.reader.not_implemented
                }else {
                  if(c === "(") {
                    return cljs.reader.read_list
                  }else {
                    if(c === ")") {
                      return cljs.reader.read_unmatched_delimiter
                    }else {
                      if(c === "[") {
                        return cljs.reader.read_vector
                      }else {
                        if(c === "]") {
                          return cljs.reader.read_unmatched_delimiter
                        }else {
                          if(c === "{") {
                            return cljs.reader.read_map
                          }else {
                            if(c === "}") {
                              return cljs.reader.read_unmatched_delimiter
                            }else {
                              if(c === "\\") {
                                return cljs.reader.read_char
                              }else {
                                if(c === "%") {
                                  return cljs.reader.not_implemented
                                }else {
                                  if(c === "#") {
                                    return cljs.reader.read_dispatch
                                  }else {
                                    if("\ufdd0'else") {
                                      return null
                                    }else {
                                      return null
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
cljs.reader.dispatch_macros = function dispatch_macros(s) {
  if(s === "{") {
    return cljs.reader.read_set
  }else {
    if(s === "<") {
      return cljs.reader.throwing_reader.call(null, "Unreadable form")
    }else {
      if(s === '"') {
        return cljs.reader.read_regex
      }else {
        if(s === "!") {
          return cljs.reader.read_comment
        }else {
          if(s === "_") {
            return cljs.reader.read_discard
          }else {
            if("\ufdd0'else") {
              return null
            }else {
              return null
            }
          }
        }
      }
    }
  }
};
cljs.reader.read = function read(reader, eof_is_error, sentinel, is_recursive) {
  while(true) {
    var ch__10638 = cljs.reader.read_char.call(null, reader);
    if(ch__10638 == null) {
      if(cljs.core.truth_(eof_is_error)) {
        return cljs.reader.reader_error.call(null, reader, "EOF")
      }else {
        return sentinel
      }
    }else {
      if(cljs.reader.whitespace_QMARK_.call(null, ch__10638)) {
        var G__10641 = reader;
        var G__10642 = eof_is_error;
        var G__10643 = sentinel;
        var G__10644 = is_recursive;
        reader = G__10641;
        eof_is_error = G__10642;
        sentinel = G__10643;
        is_recursive = G__10644;
        continue
      }else {
        if(cljs.reader.comment_prefix_QMARK_.call(null, ch__10638)) {
          var G__10645 = cljs.reader.read_comment.call(null, reader, ch__10638);
          var G__10646 = eof_is_error;
          var G__10647 = sentinel;
          var G__10648 = is_recursive;
          reader = G__10645;
          eof_is_error = G__10646;
          sentinel = G__10647;
          is_recursive = G__10648;
          continue
        }else {
          if("\ufdd0'else") {
            var f__10639 = cljs.reader.macros.call(null, ch__10638);
            var res__10640 = cljs.core.truth_(f__10639) ? f__10639.call(null, reader, ch__10638) : cljs.reader.number_literal_QMARK_.call(null, reader, ch__10638) ? cljs.reader.read_number.call(null, reader, ch__10638) : "\ufdd0'else" ? cljs.reader.read_symbol.call(null, reader, ch__10638) : null;
            if(res__10640 === reader) {
              var G__10649 = reader;
              var G__10650 = eof_is_error;
              var G__10651 = sentinel;
              var G__10652 = is_recursive;
              reader = G__10649;
              eof_is_error = G__10650;
              sentinel = G__10651;
              is_recursive = G__10652;
              continue
            }else {
              return res__10640
            }
          }else {
            return null
          }
        }
      }
    }
    break
  }
};
cljs.reader.read_string = function read_string(s) {
  var r__10654 = cljs.reader.push_back_reader.call(null, s);
  return cljs.reader.read.call(null, r__10654, true, null, false)
};
cljs.reader.zero_fill_right = function zero_fill_right(s, width) {
  if(cljs.core._EQ_.call(null, width, cljs.core.count.call(null, s))) {
    return s
  }else {
    if(width < cljs.core.count.call(null, s)) {
      return s.substring(0, width)
    }else {
      if("\ufdd0'else") {
        var b__10656 = new goog.string.StringBuffer(s);
        while(true) {
          if(b__10656.getLength() < width) {
            var G__10657 = b__10656.append("0");
            b__10656 = G__10657;
            continue
          }else {
            return b__10656.toString()
          }
          break
        }
      }else {
        return null
      }
    }
  }
};
cljs.reader.divisible_QMARK_ = function divisible_QMARK_(num, div) {
  return num % div === 0
};
cljs.reader.indivisible_QMARK_ = function indivisible_QMARK_(num, div) {
  return cljs.core.not.call(null, cljs.reader.divisible_QMARK_.call(null, num, div))
};
cljs.reader.leap_year_QMARK_ = function leap_year_QMARK_(year) {
  var and__3822__auto____10660 = cljs.reader.divisible_QMARK_.call(null, year, 4);
  if(cljs.core.truth_(and__3822__auto____10660)) {
    var or__3824__auto____10661 = cljs.reader.indivisible_QMARK_.call(null, year, 100);
    if(cljs.core.truth_(or__3824__auto____10661)) {
      return or__3824__auto____10661
    }else {
      return cljs.reader.divisible_QMARK_.call(null, year, 400)
    }
  }else {
    return and__3822__auto____10660
  }
};
cljs.reader.days_in_month = function() {
  var dim_norm__10666 = cljs.core.PersistentVector.fromArray([null, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], true);
  var dim_leap__10667 = cljs.core.PersistentVector.fromArray([null, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], true);
  return function(month, leap_year_QMARK_) {
    return cljs.core._lookup.call(null, cljs.core.truth_(leap_year_QMARK_) ? dim_leap__10667 : dim_norm__10666, month, null)
  }
}();
cljs.reader.parse_and_validate_timestamp = function() {
  var timestamp__10668 = /(\d\d\d\d)(?:-(\d\d)(?:-(\d\d)(?:[T](\d\d)(?::(\d\d)(?::(\d\d)(?:[.](\d+))?)?)?)?)?)?(?:[Z]|([-+])(\d\d):(\d\d))?/;
  var check__10670 = function(low, n, high, msg) {
    if(function() {
      var and__3822__auto____10669 = low <= n;
      if(and__3822__auto____10669) {
        return n <= high
      }else {
        return and__3822__auto____10669
      }
    }()) {
    }else {
      throw new Error([cljs.core.str("Assert failed: "), cljs.core.str([cljs.core.str(msg), cljs.core.str(" Failed:  "), cljs.core.str(low), cljs.core.str("<="), cljs.core.str(n), cljs.core.str("<="), cljs.core.str(high)].join("")), cljs.core.str("\n"), cljs.core.str(cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'<=", "\ufdd1'low", "\ufdd1'n", "\ufdd1'high"), cljs.core.hash_map("\ufdd0'line", 474))))].join(""));
    }
    return n
  };
  return function(ts) {
    var temp__3974__auto____10671 = cljs.core.map.call(null, cljs.core.vec, cljs.core.split_at.call(null, 8, cljs.core.re_matches.call(null, timestamp__10668, ts)));
    if(cljs.core.truth_(temp__3974__auto____10671)) {
      var vec__10672__10675 = temp__3974__auto____10671;
      var vec__10673__10676 = cljs.core.nth.call(null, vec__10672__10675, 0, null);
      var ___10677 = cljs.core.nth.call(null, vec__10673__10676, 0, null);
      var years__10678 = cljs.core.nth.call(null, vec__10673__10676, 1, null);
      var months__10679 = cljs.core.nth.call(null, vec__10673__10676, 2, null);
      var days__10680 = cljs.core.nth.call(null, vec__10673__10676, 3, null);
      var hours__10681 = cljs.core.nth.call(null, vec__10673__10676, 4, null);
      var minutes__10682 = cljs.core.nth.call(null, vec__10673__10676, 5, null);
      var seconds__10683 = cljs.core.nth.call(null, vec__10673__10676, 6, null);
      var milliseconds__10684 = cljs.core.nth.call(null, vec__10673__10676, 7, null);
      var vec__10674__10685 = cljs.core.nth.call(null, vec__10672__10675, 1, null);
      var ___10686 = cljs.core.nth.call(null, vec__10674__10685, 0, null);
      var ___10687 = cljs.core.nth.call(null, vec__10674__10685, 1, null);
      var ___10688 = cljs.core.nth.call(null, vec__10674__10685, 2, null);
      var V__10689 = vec__10672__10675;
      var vec__10690__10693 = cljs.core.map.call(null, function(v) {
        return cljs.core.map.call(null, function(p1__10665_SHARP_) {
          return parseInt(p1__10665_SHARP_, 10)
        }, v)
      }, cljs.core.map.call(null, function(p1__10663_SHARP_, p2__10662_SHARP_) {
        return cljs.core.update_in.call(null, p2__10662_SHARP_, cljs.core.PersistentVector.fromArray([0], true), p1__10663_SHARP_)
      }, cljs.core.PersistentVector.fromArray([cljs.core.constantly.call(null, null), function(p1__10664_SHARP_) {
        if(cljs.core._EQ_.call(null, p1__10664_SHARP_, "-")) {
          return"-1"
        }else {
          return"1"
        }
      }], true), V__10689));
      var vec__10691__10694 = cljs.core.nth.call(null, vec__10690__10693, 0, null);
      var ___10695 = cljs.core.nth.call(null, vec__10691__10694, 0, null);
      var y__10696 = cljs.core.nth.call(null, vec__10691__10694, 1, null);
      var mo__10697 = cljs.core.nth.call(null, vec__10691__10694, 2, null);
      var d__10698 = cljs.core.nth.call(null, vec__10691__10694, 3, null);
      var h__10699 = cljs.core.nth.call(null, vec__10691__10694, 4, null);
      var m__10700 = cljs.core.nth.call(null, vec__10691__10694, 5, null);
      var s__10701 = cljs.core.nth.call(null, vec__10691__10694, 6, null);
      var ms__10702 = cljs.core.nth.call(null, vec__10691__10694, 7, null);
      var vec__10692__10703 = cljs.core.nth.call(null, vec__10690__10693, 1, null);
      var offset_sign__10704 = cljs.core.nth.call(null, vec__10692__10703, 0, null);
      var offset_hours__10705 = cljs.core.nth.call(null, vec__10692__10703, 1, null);
      var offset_minutes__10706 = cljs.core.nth.call(null, vec__10692__10703, 2, null);
      var offset__10707 = offset_sign__10704 * (offset_hours__10705 * 60 + offset_minutes__10706);
      return cljs.core.PersistentVector.fromArray([cljs.core.not.call(null, years__10678) ? 1970 : y__10696, cljs.core.not.call(null, months__10679) ? 1 : check__10670.call(null, 1, mo__10697, 12, "timestamp month field must be in range 1..12"), cljs.core.not.call(null, days__10680) ? 1 : check__10670.call(null, 1, d__10698, cljs.reader.days_in_month.call(null, mo__10697, cljs.reader.leap_year_QMARK_.call(null, y__10696)), "timestamp day field must be in range 1..last day in month"), cljs.core.not.call(null, 
      hours__10681) ? 0 : check__10670.call(null, 0, h__10699, 23, "timestamp hour field must be in range 0..23"), cljs.core.not.call(null, minutes__10682) ? 0 : check__10670.call(null, 0, m__10700, 59, "timestamp minute field must be in range 0..59"), cljs.core.not.call(null, seconds__10683) ? 0 : check__10670.call(null, 0, s__10701, cljs.core._EQ_.call(null, m__10700, 59) ? 60 : 59, "timestamp second field must be in range 0..60"), cljs.core.not.call(null, milliseconds__10684) ? 0 : check__10670.call(null, 
      0, ms__10702, 999, "timestamp millisecond field must be in range 0..999"), offset__10707], true)
    }else {
      return null
    }
  }
}();
cljs.reader.parse_timestamp = function parse_timestamp(ts) {
  var temp__3971__auto____10719 = cljs.reader.parse_and_validate_timestamp.call(null, ts);
  if(cljs.core.truth_(temp__3971__auto____10719)) {
    var vec__10720__10721 = temp__3971__auto____10719;
    var years__10722 = cljs.core.nth.call(null, vec__10720__10721, 0, null);
    var months__10723 = cljs.core.nth.call(null, vec__10720__10721, 1, null);
    var days__10724 = cljs.core.nth.call(null, vec__10720__10721, 2, null);
    var hours__10725 = cljs.core.nth.call(null, vec__10720__10721, 3, null);
    var minutes__10726 = cljs.core.nth.call(null, vec__10720__10721, 4, null);
    var seconds__10727 = cljs.core.nth.call(null, vec__10720__10721, 5, null);
    var ms__10728 = cljs.core.nth.call(null, vec__10720__10721, 6, null);
    var offset__10729 = cljs.core.nth.call(null, vec__10720__10721, 7, null);
    return new Date(Date.UTC(years__10722, months__10723 - 1, days__10724, hours__10725, minutes__10726, seconds__10727, ms__10728) - offset__10729 * 60 * 1E3)
  }else {
    return cljs.reader.reader_error.call(null, null, [cljs.core.str("Unrecognized date/time syntax: "), cljs.core.str(ts)].join(""))
  }
};
cljs.reader.read_date = function read_date(s) {
  if(cljs.core.string_QMARK_.call(null, s)) {
    return cljs.reader.parse_timestamp.call(null, s)
  }else {
    return cljs.reader.reader_error.call(null, null, "Instance literal expects a string for its timestamp.")
  }
};
cljs.reader.read_queue = function read_queue(elems) {
  if(cljs.core.vector_QMARK_.call(null, elems)) {
    return cljs.core.into.call(null, cljs.core.PersistentQueue.EMPTY, elems)
  }else {
    return cljs.reader.reader_error.call(null, null, "Queue literal expects a vector for its elements.")
  }
};
cljs.reader.read_uuid = function read_uuid(uuid) {
  if(cljs.core.string_QMARK_.call(null, uuid)) {
    return new cljs.core.UUID(uuid)
  }else {
    return cljs.reader.reader_error.call(null, null, "UUID literal expects a string as its representation.")
  }
};
cljs.reader._STAR_tag_table_STAR_ = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject(["inst", "uuid", "queue"], {"inst":cljs.reader.read_date, "uuid":cljs.reader.read_uuid, "queue":cljs.reader.read_queue}));
cljs.reader.maybe_read_tagged_type = function maybe_read_tagged_type(rdr, initch) {
  var tag__10733 = cljs.reader.read_symbol.call(null, rdr, initch);
  var temp__3971__auto____10734 = cljs.core._lookup.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_), cljs.core.name.call(null, tag__10733), null);
  if(cljs.core.truth_(temp__3971__auto____10734)) {
    var pfn__10735 = temp__3971__auto____10734;
    return pfn__10735.call(null, cljs.reader.read.call(null, rdr, true, null, false))
  }else {
    return cljs.reader.reader_error.call(null, rdr, "Could not find tag parser for ", cljs.core.name.call(null, tag__10733), " in ", cljs.core.pr_str.call(null, cljs.core.keys.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_))))
  }
};
cljs.reader.register_tag_parser_BANG_ = function register_tag_parser_BANG_(tag, f) {
  var tag__10738 = cljs.core.name.call(null, tag);
  var old_parser__10739 = cljs.core._lookup.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_), tag__10738, null);
  cljs.core.swap_BANG_.call(null, cljs.reader._STAR_tag_table_STAR_, cljs.core.assoc, tag__10738, f);
  return old_parser__10739
};
cljs.reader.deregister_tag_parser_BANG_ = function deregister_tag_parser_BANG_(tag) {
  var tag__10742 = cljs.core.name.call(null, tag);
  var old_parser__10743 = cljs.core._lookup.call(null, cljs.core.deref.call(null, cljs.reader._STAR_tag_table_STAR_), tag__10742, null);
  cljs.core.swap_BANG_.call(null, cljs.reader._STAR_tag_table_STAR_, cljs.core.dissoc, tag__10742);
  return old_parser__10743
};
goog.provide("jayq.util");
goog.require("cljs.core");
jayq.util.map__GT_js = function map__GT_js(m) {
  var out__10877 = {};
  var G__10878__10879 = cljs.core.seq.call(null, m);
  if(G__10878__10879) {
    var G__10881__10883 = cljs.core.first.call(null, G__10878__10879);
    var vec__10882__10884 = G__10881__10883;
    var k__10885 = cljs.core.nth.call(null, vec__10882__10884, 0, null);
    var v__10886 = cljs.core.nth.call(null, vec__10882__10884, 1, null);
    var G__10878__10887 = G__10878__10879;
    var G__10881__10888 = G__10881__10883;
    var G__10878__10889 = G__10878__10887;
    while(true) {
      var vec__10890__10891 = G__10881__10888;
      var k__10892 = cljs.core.nth.call(null, vec__10890__10891, 0, null);
      var v__10893 = cljs.core.nth.call(null, vec__10890__10891, 1, null);
      var G__10878__10894 = G__10878__10889;
      out__10877[cljs.core.name.call(null, k__10892)] = v__10893;
      var temp__3974__auto____10895 = cljs.core.next.call(null, G__10878__10894);
      if(temp__3974__auto____10895) {
        var G__10878__10896 = temp__3974__auto____10895;
        var G__10897 = cljs.core.first.call(null, G__10878__10896);
        var G__10898 = G__10878__10896;
        G__10881__10888 = G__10897;
        G__10878__10889 = G__10898;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return out__10877
};
jayq.util.wait = function wait(ms, func) {
  return setTimeout(func, ms)
};
jayq.util.log = function() {
  var log__delegate = function(v, text) {
    var vs__10900 = cljs.core.string_QMARK_.call(null, v) ? cljs.core.apply.call(null, cljs.core.str, v, text) : v;
    return console.log(vs__10900)
  };
  var log = function(v, var_args) {
    var text = null;
    if(goog.isDef(var_args)) {
      text = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return log__delegate.call(this, v, text)
  };
  log.cljs$lang$maxFixedArity = 1;
  log.cljs$lang$applyTo = function(arglist__10901) {
    var v = cljs.core.first(arglist__10901);
    var text = cljs.core.rest(arglist__10901);
    return log__delegate(v, text)
  };
  log.cljs$lang$arity$variadic = log__delegate;
  return log
}();
goog.provide("jayq.core");
goog.require("cljs.core");
goog.require("jayq.util");
goog.require("jayq.util");
goog.require("clojure.string");
jayq.core.crate_meta = function crate_meta(func) {
  return func.prototype._crateGroup
};
jayq.core.__GT_selector = function __GT_selector(sel) {
  if(cljs.core.string_QMARK_.call(null, sel)) {
    return sel
  }else {
    if(cljs.core.fn_QMARK_.call(null, sel)) {
      return[cljs.core.str("[crateGroup="), cljs.core.str(jayq.core.crate_meta.call(null, sel)), cljs.core.str("]")].join("")
    }else {
      if(cljs.core.keyword_QMARK_.call(null, sel)) {
        return cljs.core.name.call(null, sel)
      }else {
        if("\ufdd0'else") {
          return sel
        }else {
          return null
        }
      }
    }
  }
};
jayq.core.$ = function() {
  var $__delegate = function(sel, p__10744) {
    var vec__10748__10749 = p__10744;
    var context__10750 = cljs.core.nth.call(null, vec__10748__10749, 0, null);
    if(cljs.core.not.call(null, context__10750)) {
      return jQuery(jayq.core.__GT_selector.call(null, sel))
    }else {
      return jQuery(jayq.core.__GT_selector.call(null, sel), context__10750)
    }
  };
  var $ = function(sel, var_args) {
    var p__10744 = null;
    if(goog.isDef(var_args)) {
      p__10744 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return $__delegate.call(this, sel, p__10744)
  };
  $.cljs$lang$maxFixedArity = 1;
  $.cljs$lang$applyTo = function(arglist__10751) {
    var sel = cljs.core.first(arglist__10751);
    var p__10744 = cljs.core.rest(arglist__10751);
    return $__delegate(sel, p__10744)
  };
  $.cljs$lang$arity$variadic = $__delegate;
  return $
}();
jQuery.prototype.cljs$core$IReduce$ = true;
jQuery.prototype.cljs$core$IReduce$_reduce$arity$2 = function(this$, f) {
  return cljs.core.ci_reduce.call(null, jayq.core.coll, f, cljs.core.first.call(null, this$), cljs.core.count.call(null, this$))
};
jQuery.prototype.cljs$core$IReduce$_reduce$arity$3 = function(this$, f, start) {
  return cljs.core.ci_reduce.call(null, jayq.core.coll, f, start, jayq.core.i)
};
jQuery.prototype.cljs$core$ILookup$ = true;
jQuery.prototype.cljs$core$ILookup$_lookup$arity$2 = function(this$, k) {
  var or__3824__auto____10752 = this$.slice(k, k + 1);
  if(cljs.core.truth_(or__3824__auto____10752)) {
    return or__3824__auto____10752
  }else {
    return null
  }
};
jQuery.prototype.cljs$core$ILookup$_lookup$arity$3 = function(this$, k, not_found) {
  return cljs.core._nth.call(null, this$, k, not_found)
};
jQuery.prototype.cljs$core$ISequential$ = true;
jQuery.prototype.cljs$core$IIndexed$ = true;
jQuery.prototype.cljs$core$IIndexed$_nth$arity$2 = function(this$, n) {
  if(n < cljs.core.count.call(null, this$)) {
    return this$.slice(n, n + 1)
  }else {
    return null
  }
};
jQuery.prototype.cljs$core$IIndexed$_nth$arity$3 = function(this$, n, not_found) {
  if(n < cljs.core.count.call(null, this$)) {
    return this$.slice(n, n + 1)
  }else {
    if(void 0 === not_found) {
      return null
    }else {
      return not_found
    }
  }
};
jQuery.prototype.cljs$core$ICounted$ = true;
jQuery.prototype.cljs$core$ICounted$_count$arity$1 = function(this$) {
  return this$.size()
};
jQuery.prototype.cljs$core$ISeq$ = true;
jQuery.prototype.cljs$core$ISeq$_first$arity$1 = function(this$) {
  return this$.slice(0, 1)
};
jQuery.prototype.cljs$core$ISeq$_rest$arity$1 = function(this$) {
  if(cljs.core.count.call(null, this$) > 1) {
    return this$.slice(1)
  }else {
    return cljs.core.list.call(null)
  }
};
jQuery.prototype.cljs$core$ISeqable$ = true;
jQuery.prototype.cljs$core$ISeqable$_seq$arity$1 = function(this$) {
  if(cljs.core.truth_(this$.get(0))) {
    return this$
  }else {
    return null
  }
};
jQuery.prototype.call = function() {
  var G__10753 = null;
  var G__10753__2 = function(_, k) {
    return cljs.core._lookup.call(null, this, k)
  };
  var G__10753__3 = function(_, k, not_found) {
    return cljs.core._lookup.call(null, this, k, not_found)
  };
  G__10753 = function(_, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10753__2.call(this, _, k);
      case 3:
        return G__10753__3.call(this, _, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10753
}();
jayq.core.anim = function anim(elem, props, dur) {
  return elem.animate(jayq.util.map__GT_js.call(null, props), dur)
};
jayq.core.text = function text($elem, txt) {
  return $elem.text(txt)
};
jayq.core.css = function css($elem, opts) {
  if(cljs.core.keyword_QMARK_.call(null, opts)) {
    return $elem.css(cljs.core.name.call(null, opts))
  }else {
    return $elem.css(jayq.util.map__GT_js.call(null, opts))
  }
};
jayq.core.attr = function() {
  var attr__delegate = function($elem, a, p__10754) {
    var vec__10759__10760 = p__10754;
    var v__10761 = cljs.core.nth.call(null, vec__10759__10760, 0, null);
    var a__10762 = cljs.core.name.call(null, a);
    if(cljs.core.not.call(null, v__10761)) {
      return $elem.attr(a__10762)
    }else {
      return $elem.attr(a__10762, v__10761)
    }
  };
  var attr = function($elem, a, var_args) {
    var p__10754 = null;
    if(goog.isDef(var_args)) {
      p__10754 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return attr__delegate.call(this, $elem, a, p__10754)
  };
  attr.cljs$lang$maxFixedArity = 2;
  attr.cljs$lang$applyTo = function(arglist__10763) {
    var $elem = cljs.core.first(arglist__10763);
    var a = cljs.core.first(cljs.core.next(arglist__10763));
    var p__10754 = cljs.core.rest(cljs.core.next(arglist__10763));
    return attr__delegate($elem, a, p__10754)
  };
  attr.cljs$lang$arity$variadic = attr__delegate;
  return attr
}();
jayq.core.data = function() {
  var data__delegate = function($elem, k, p__10764) {
    var vec__10769__10770 = p__10764;
    var v__10771 = cljs.core.nth.call(null, vec__10769__10770, 0, null);
    var k__10772 = cljs.core.name.call(null, k);
    if(cljs.core.not.call(null, v__10771)) {
      return $elem.data(k__10772)
    }else {
      return $elem.data(k__10772, v__10771)
    }
  };
  var data = function($elem, k, var_args) {
    var p__10764 = null;
    if(goog.isDef(var_args)) {
      p__10764 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return data__delegate.call(this, $elem, k, p__10764)
  };
  data.cljs$lang$maxFixedArity = 2;
  data.cljs$lang$applyTo = function(arglist__10773) {
    var $elem = cljs.core.first(arglist__10773);
    var k = cljs.core.first(cljs.core.next(arglist__10773));
    var p__10764 = cljs.core.rest(cljs.core.next(arglist__10773));
    return data__delegate($elem, k, p__10764)
  };
  data.cljs$lang$arity$variadic = data__delegate;
  return data
}();
jayq.core.add_class = function add_class($elem, cl) {
  var cl__10775 = cljs.core.name.call(null, cl);
  return $elem.addClass(cl__10775)
};
jayq.core.remove_class = function remove_class($elem, cl) {
  var cl__10777 = cljs.core.name.call(null, cl);
  return $elem.removeClass(cl__10777)
};
jayq.core.append = function append($elem, content) {
  return $elem.append(content)
};
jayq.core.prepend = function prepend($elem, content) {
  return $elem.prepend(content)
};
jayq.core.remove = function remove($elem) {
  return $elem.remove()
};
jayq.core.hide = function() {
  var hide__delegate = function($elem, p__10778) {
    var vec__10783__10784 = p__10778;
    var speed__10785 = cljs.core.nth.call(null, vec__10783__10784, 0, null);
    var on_finish__10786 = cljs.core.nth.call(null, vec__10783__10784, 1, null);
    return $elem.hide(speed__10785, on_finish__10786)
  };
  var hide = function($elem, var_args) {
    var p__10778 = null;
    if(goog.isDef(var_args)) {
      p__10778 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return hide__delegate.call(this, $elem, p__10778)
  };
  hide.cljs$lang$maxFixedArity = 1;
  hide.cljs$lang$applyTo = function(arglist__10787) {
    var $elem = cljs.core.first(arglist__10787);
    var p__10778 = cljs.core.rest(arglist__10787);
    return hide__delegate($elem, p__10778)
  };
  hide.cljs$lang$arity$variadic = hide__delegate;
  return hide
}();
jayq.core.show = function() {
  var show__delegate = function($elem, p__10788) {
    var vec__10793__10794 = p__10788;
    var speed__10795 = cljs.core.nth.call(null, vec__10793__10794, 0, null);
    var on_finish__10796 = cljs.core.nth.call(null, vec__10793__10794, 1, null);
    return $elem.show(speed__10795, on_finish__10796)
  };
  var show = function($elem, var_args) {
    var p__10788 = null;
    if(goog.isDef(var_args)) {
      p__10788 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return show__delegate.call(this, $elem, p__10788)
  };
  show.cljs$lang$maxFixedArity = 1;
  show.cljs$lang$applyTo = function(arglist__10797) {
    var $elem = cljs.core.first(arglist__10797);
    var p__10788 = cljs.core.rest(arglist__10797);
    return show__delegate($elem, p__10788)
  };
  show.cljs$lang$arity$variadic = show__delegate;
  return show
}();
jayq.core.fade_out = function() {
  var fade_out__delegate = function($elem, p__10798) {
    var vec__10803__10804 = p__10798;
    var speed__10805 = cljs.core.nth.call(null, vec__10803__10804, 0, null);
    var on_finish__10806 = cljs.core.nth.call(null, vec__10803__10804, 1, null);
    return $elem.fadeOut(speed__10805, on_finish__10806)
  };
  var fade_out = function($elem, var_args) {
    var p__10798 = null;
    if(goog.isDef(var_args)) {
      p__10798 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return fade_out__delegate.call(this, $elem, p__10798)
  };
  fade_out.cljs$lang$maxFixedArity = 1;
  fade_out.cljs$lang$applyTo = function(arglist__10807) {
    var $elem = cljs.core.first(arglist__10807);
    var p__10798 = cljs.core.rest(arglist__10807);
    return fade_out__delegate($elem, p__10798)
  };
  fade_out.cljs$lang$arity$variadic = fade_out__delegate;
  return fade_out
}();
jayq.core.fade_in = function() {
  var fade_in__delegate = function($elem, p__10808) {
    var vec__10813__10814 = p__10808;
    var speed__10815 = cljs.core.nth.call(null, vec__10813__10814, 0, null);
    var on_finish__10816 = cljs.core.nth.call(null, vec__10813__10814, 1, null);
    return $elem.fadeIn(speed__10815, on_finish__10816)
  };
  var fade_in = function($elem, var_args) {
    var p__10808 = null;
    if(goog.isDef(var_args)) {
      p__10808 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return fade_in__delegate.call(this, $elem, p__10808)
  };
  fade_in.cljs$lang$maxFixedArity = 1;
  fade_in.cljs$lang$applyTo = function(arglist__10817) {
    var $elem = cljs.core.first(arglist__10817);
    var p__10808 = cljs.core.rest(arglist__10817);
    return fade_in__delegate($elem, p__10808)
  };
  fade_in.cljs$lang$arity$variadic = fade_in__delegate;
  return fade_in
}();
jayq.core.slide_up = function() {
  var slide_up__delegate = function($elem, p__10818) {
    var vec__10823__10824 = p__10818;
    var speed__10825 = cljs.core.nth.call(null, vec__10823__10824, 0, null);
    var on_finish__10826 = cljs.core.nth.call(null, vec__10823__10824, 1, null);
    return $elem.slideUp(speed__10825, on_finish__10826)
  };
  var slide_up = function($elem, var_args) {
    var p__10818 = null;
    if(goog.isDef(var_args)) {
      p__10818 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return slide_up__delegate.call(this, $elem, p__10818)
  };
  slide_up.cljs$lang$maxFixedArity = 1;
  slide_up.cljs$lang$applyTo = function(arglist__10827) {
    var $elem = cljs.core.first(arglist__10827);
    var p__10818 = cljs.core.rest(arglist__10827);
    return slide_up__delegate($elem, p__10818)
  };
  slide_up.cljs$lang$arity$variadic = slide_up__delegate;
  return slide_up
}();
jayq.core.slide_down = function() {
  var slide_down__delegate = function($elem, p__10828) {
    var vec__10833__10834 = p__10828;
    var speed__10835 = cljs.core.nth.call(null, vec__10833__10834, 0, null);
    var on_finish__10836 = cljs.core.nth.call(null, vec__10833__10834, 1, null);
    return $elem.slideDown(speed__10835, on_finish__10836)
  };
  var slide_down = function($elem, var_args) {
    var p__10828 = null;
    if(goog.isDef(var_args)) {
      p__10828 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return slide_down__delegate.call(this, $elem, p__10828)
  };
  slide_down.cljs$lang$maxFixedArity = 1;
  slide_down.cljs$lang$applyTo = function(arglist__10837) {
    var $elem = cljs.core.first(arglist__10837);
    var p__10828 = cljs.core.rest(arglist__10837);
    return slide_down__delegate($elem, p__10828)
  };
  slide_down.cljs$lang$arity$variadic = slide_down__delegate;
  return slide_down
}();
jayq.core.bind = function bind($elem, ev, func) {
  return $elem.bind(cljs.core.name.call(null, ev), func)
};
jayq.core.find = function find($elem, selector) {
  return $elem.find(cljs.core.name.call(null, selector))
};
jayq.core.trigger = function trigger($elem, ev) {
  return $elem.trigger(cljs.core.name.call(null, ev))
};
jayq.core.delegate = function delegate($elem, sel, ev, func) {
  return $elem.delegate(jayq.core.__GT_selector.call(null, sel), cljs.core.name.call(null, ev), func)
};
jayq.core.inner = function inner($elem, v) {
  return $elem.html(v)
};
jayq.core.empty = function empty($elem) {
  return $elem.empty()
};
jayq.core.val = function() {
  var val__delegate = function($elem, p__10838) {
    var vec__10842__10843 = p__10838;
    var v__10844 = cljs.core.nth.call(null, vec__10842__10843, 0, null);
    if(cljs.core.truth_(v__10844)) {
      return $elem.val(v__10844)
    }else {
      return $elem.val()
    }
  };
  var val = function($elem, var_args) {
    var p__10838 = null;
    if(goog.isDef(var_args)) {
      p__10838 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return val__delegate.call(this, $elem, p__10838)
  };
  val.cljs$lang$maxFixedArity = 1;
  val.cljs$lang$applyTo = function(arglist__10845) {
    var $elem = cljs.core.first(arglist__10845);
    var p__10838 = cljs.core.rest(arglist__10845);
    return val__delegate($elem, p__10838)
  };
  val.cljs$lang$arity$variadic = val__delegate;
  return val
}();
jayq.core.queue = function queue($elem, callback) {
  return $elem.queue(callback)
};
jayq.core.dequeue = function dequeue(elem) {
  return jayq.core.$.call(null, elem).dequeue()
};
jayq.core.xhr = function xhr(p__10846, content, callback) {
  var vec__10852__10853 = p__10846;
  var method__10854 = cljs.core.nth.call(null, vec__10852__10853, 0, null);
  var uri__10855 = cljs.core.nth.call(null, vec__10852__10853, 1, null);
  var params__10856 = jayq.util.map__GT_js.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'data", "\ufdd0'success"], {"\ufdd0'type":clojure.string.upper_case.call(null, cljs.core.name.call(null, method__10854)), "\ufdd0'data":jayq.util.map__GT_js.call(null, content), "\ufdd0'success":callback}));
  return jQuery.ajax(uri__10855, params__10856)
};
goog.provide("mx.interware.cljs.cbot");
goog.require("cljs.core");
goog.require("hiccups.runtime");
goog.require("jayq.util");
goog.require("jayq.core");
goog.require("cljs.reader");
mx.interware.cljs.cbot.testv = cljs.core.atom.call(null, null);
mx.interware.cljs.cbot.test = function test(e) {
  return alert("Le picaste al save!")
};
jayq.core.$.call(null, document).ready(function() {
  return alert("ClojureScript running!")
});
