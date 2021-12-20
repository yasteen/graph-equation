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

    // Set up button onclicks
    const eqPanelButton = document.getElementById(
        "equation-panel-hide"
    ) as HTMLDivElement;
    eqPanelButton.addEventListener("click", (_ev) => {
        const r = document.querySelector("html");
        if (r.style.getPropertyValue("--panel-length") === "0px") {
            r.style.setProperty(
                "--panel-length",
                r.style.getPropertyValue("--saved-panel-length")
            );
            eqPanelButton.innerHTML = "▼";
        } else {
            r.style.setProperty("--panel-length", "0px");
            eqPanelButton.innerHTML = "▲";
        }
    });

    // Set up WASM
    const go = new Go();
    WebAssembly.instantiateStreaming(
        fetch("scripts/main.wasm", {
            headers: {
                "Content-Security-Policy": "script-src self;",
            },
        }),
        go.importObject
    ).then((result) => {
        go.run(result.instance);
    });
};

initialize();
