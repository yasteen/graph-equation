import { resizeCanvas } from "./canvas";
const initialize = () => {
    // Document colour scheme
    document.documentElement.className = "dark";
    // Set up canvas
    var doResize: NodeJS.Timeout;
    new ResizeObserver(() => {
        clearTimeout(doResize);
        doResize = setTimeout(resizeCanvas, 100);
    }).observe(document.querySelector("canvas"));
    resizeCanvas();

    const go = new Go();
    WebAssembly.instantiateStreaming(
        fetch("scripts/main.wasm"),
        go.importObject
    ).then((result) => {
        go.run(result.instance);
    });
};

initialize();
