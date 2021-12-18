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
    fetch("scripts/main.wasm")
        .then((response) => response.arrayBuffer())
        .then((bytes) => WebAssembly.instantiate(bytes, go.importObject))
        .then((result) => {
            go.run(result.instance);
        });
};

initialize();
