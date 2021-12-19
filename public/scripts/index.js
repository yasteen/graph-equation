define("canvas", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.redraw = exports.resizeCanvas = void 0;
    const resizeCanvas = () => {
        const canvas = document.querySelector("canvas");
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        (0, exports.redraw)();
    };
    exports.resizeCanvas = resizeCanvas;
    const redraw = () => {
        const canvas = document.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "green";
        ctx.fillRect(10, 10, 150, 100);
    };
    exports.redraw = redraw;
});
define("index", ["require", "exports", "canvas"], function (require, exports, canvas_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const initialize = () => {
        document.documentElement.className = "dark";
        var doResize;
        new ResizeObserver(() => {
            clearTimeout(doResize);
            doResize = setTimeout(canvas_1.resizeCanvas, 100);
        }).observe(document.querySelector("canvas"));
        (0, canvas_1.resizeCanvas)();
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("scripts/main.wasm"), go.importObject).then((result) => {
            go.run(result.instance);
        });
    };
    initialize();
});
