/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./node_modules/ts-loader/index.js!./src/worker.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/ts-loader/index.js!./src/worker.ts":
/*!************************************************!*\
  !*** ./node_modules/ts-loader!./src/worker.ts ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nvar ctx = self;\nvar offscreenCanvas = null;\nvar context = null;\nvar fontSize = 28;\nvar defaultCollor = 'rgb(250, 246, 240)';\nvar nounCollor = 'rgb(250, 217, 175)';\nvar verbColor = 'rgb(250, 186, 175)';\nvar melodyDefaultColor = ['rgba(243, 217, 133, 1)', 'rgba(253, 77, 10, 0)'];\nvar melodyChorusColor = ['rgba(3, 236, 252, 1)', 'rgba(10, 217, 253, 0)'];\nvar melodyColor = melodyDefaultColor;\nvar bgDefaultColor = 'rgb(82, 57, 57)';\nvar bgChorusColor = 'rgb(57, 81, 82)';\nvar bgColor = bgDefaultColor;\nvar fontStyle = fontSize + \"px 'Hannari', '游明朝体', 'YuMincho', serif\";\nctx.addEventListener('message', function (event) {\n    if (!offscreenCanvas) {\n        if (event.data.action !== 'init') {\n            console.log('You need to call init first');\n        }\n        offscreenCanvas = event.data.canvas;\n        context = offscreenCanvas.getContext(\"2d\");\n    }\n    if (offscreenCanvas === null || context === null) {\n        console.log(\"couldn't get the offscreenCanvas or couldn't get the OffscreenCanvasRenderingContext2D\");\n        return;\n    }\n    var width = event.data.size.width;\n    var height = event.data.size.height;\n    var moveLyricInstance = null;\n    var x = 0, y = 0, charText = '', partOfSpeech = 'X', isChorus = false;\n    if (event.data.moveLyricInstance) {\n        moveLyricInstance = event.data.moveLyricInstance;\n        if (moveLyricInstance === null) {\n            console.log(\"moveLyricInstance is null\");\n            return;\n        }\n        x = moveLyricInstance.x;\n        y = moveLyricInstance.y;\n        charText = moveLyricInstance.charText;\n        partOfSpeech = moveLyricInstance.partOfSpeech;\n        isChorus = moveLyricInstance.isChorus;\n    }\n    var fontColor = defaultCollor;\n    if (partOfSpeech === 'N' || partOfSpeech === 'PN') {\n        fontColor = nounCollor;\n    }\n    else if (partOfSpeech === 'V' || partOfSpeech === 'U' || partOfSpeech === 'S') {\n        fontColor = verbColor;\n    }\n    if (event.data.action === 'setChar' || event.data.action === 'fallLyric') {\n        var nowMelodyColor = isChorus ? melodyChorusColor : melodyDefaultColor;\n        var nowBgColor = isChorus ? bgChorusColor : bgDefaultColor;\n        if (bgColor !== nowBgColor) {\n            bgColor = nowBgColor;\n            context.fillStyle = bgColor;\n            context.fillRect(0, 0, width, height);\n            drawLight(width, melodyColor);\n        }\n        if (melodyColor !== nowMelodyColor) {\n            melodyColor = nowMelodyColor;\n            drawLight(width, melodyColor);\n        }\n    }\n    switch (event.data.action) {\n        case 'init':\n            var time_1 = 0;\n            var fadeIn_1 = function () {\n                if (context === null) {\n                    return;\n                }\n                context.fillStyle = 'rgba(82, 57, 57, ' + Math.min(time_1, 1) + ')';\n                context.fillRect(0, 0, width, height);\n                time_1 += 0.05;\n                var callbackId = requestAnimationFrame(fadeIn_1);\n                if (1 <= time_1) {\n                    cancelAnimationFrame(callbackId);\n                    drawLight(width, melodyColor);\n                }\n            };\n            fadeIn_1();\n            break;\n        case 'setChar':\n            if (moveLyricInstance === null) {\n                console.log(\"'setChar' requires a moveLyricInstance\");\n                return;\n            }\n            context.font = fontStyle;\n            context.fillStyle = fontColor;\n            context.fillText(charText, x, y);\n            break;\n        case 'fallLyric':\n            if (moveLyricInstance === null) {\n                console.log(\"'fallLyric' requires a moveLyricInstance\");\n                return;\n            }\n            fall(charText, x, y, height, fontColor);\n            break;\n        default:\n            console.log('undefind action');\n    }\n});\nvar drawLight = function (width, melodyColor) {\n    if (context !== null) {\n        var x = width / 2;\n        var y = 0;\n        var gradRadius = width / 6;\n        var light = context.createRadialGradient(x, -gradRadius / 1.7, gradRadius, x, -gradRadius / 1.7, gradRadius * 1.3);\n        light.addColorStop(0, melodyColor[0]);\n        light.addColorStop(0.9, melodyColor[1]);\n        context.beginPath();\n        context.arc(x, -gradRadius / 4, gradRadius * 1.3, 0, Math.PI * 2, false);\n        context.fillStyle = light;\n        context.fill();\n    }\n};\nvar fall = function (charText, x, y, height, fontColor) {\n    loop();\n    y = Math.floor(y);\n    function loop() {\n        if (context !== null) {\n            var callbackId = requestAnimationFrame(loop);\n            var diffY = Math.floor(height / 130) * easeInOutSine(y / height);\n            context.fillStyle = bgColor;\n            context.fillRect(x, y - (diffY + fontSize), fontSize, fontSize);\n            context.font = fontStyle;\n            context.fillStyle = fontColor;\n            context.fillText(charText, x, y);\n            y += diffY;\n            if (height + fontSize < y) {\n                context.fillStyle = bgColor;\n                context.fillRect(x, y - (diffY + fontSize), fontSize, fontSize);\n                cancelAnimationFrame(callbackId);\n            }\n        }\n    }\n};\nfunction easeInOutSine(x) {\n    return Math.sin((x * Math.PI) / 2);\n}\n/* harmony default export */ __webpack_exports__[\"default\"] = (ctx);\n\n\n//# sourceURL=webpack:///./src/worker.ts?./node_modules/ts-loader");

/***/ })

/******/ });