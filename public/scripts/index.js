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
        const eqPanelButton = document.getElementById("equation-panel-hide");
        eqPanelButton.addEventListener("click", (_ev) => {
            const r = document.querySelector("html");
            if (r.style.getPropertyValue("--panel-length") === "0px") {
                r.style.setProperty("--panel-length", r.style.getPropertyValue("--saved-panel-length"));
                eqPanelButton.innerHTML = "▼";
            }
            else {
                r.style.setProperty("--panel-length", "0px");
                eqPanelButton.innerHTML = "▲";
            }
        });
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("scripts/main.wasm", {
            headers: {
                "Content-Security-Policy": "script-src self;",
            },
        }), go.importObject).then((result) => {
            go.run(result.instance);
        });
    };
    initialize();
});
