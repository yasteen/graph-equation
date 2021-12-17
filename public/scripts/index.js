define("canvas", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.redraw = exports.resizeCanvas = void 0;
    var resizeCanvas = function () {
        var canvas = document.querySelector("canvas");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        var ctx = canvas.getContext("2d");
        (0, exports.redraw)();
    };
    exports.resizeCanvas = resizeCanvas;
    var redraw = function () {
        var canvas = document.querySelector("canvas");
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 150, 100);
    };
    exports.redraw = redraw;
});
define("index", ["require", "exports", "canvas"], function (require, exports, canvas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    document.documentElement.className = "dark";
    (0, canvas_1.resizeCanvas)();
    (function () {
        var throttled = false;
        var timeout = false;
        window.addEventListener("resize", function () {
            if (!throttled) {
                if (timeout !== false)
                    clearTimeout(timeout);
                timeout = setTimeout(function () {
                    onResize();
                    console.log("resize");
                }, 200);
                throttled = true;
                setTimeout(function () {
                    throttled = false;
                    console.log("damn");
                }, 200);
            }
        });
        var onResize = function () {
            (0, canvas_1.resizeCanvas)();
        };
    })();
});
