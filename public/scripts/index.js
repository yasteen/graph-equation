define("canvas", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resizeCanvas = void 0;
    var resizeCanvas = function () {
        var canvas = document.querySelector("canvas");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 150, 100);
    };
    exports.resizeCanvas = resizeCanvas;
});
define("index", ["require", "exports", "canvas"], function (require, exports, canvas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    document.documentElement.className = "dark";
    (function () {
        var throttled = false;
        window.addEventListener("resize", function () {
            if (!throttled) {
                console.log(throttled);
                onResize();
                throttled = true;
                setTimeout(function () {
                    throttled = false;
                }, 200);
            }
        });
        var onResize = function () {
            (0, canvas_1.resizeCanvas)();
        };
    })();
});
