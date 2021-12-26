import {
    setupIconButtons,
    setupOnWindowResize,
    setupSideBar,
} from "./eventHandler";
import { Graph } from "./graph";

const initialize = () => {
    // Document colour scheme
    document.documentElement.className = "dark";

    const graph = new Graph(document.querySelector("canvas"));
    initWasm(graph);

    setUpElementEvents(graph);
};

const initWasm = (graph: Graph) => {
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

const setUpElementEvents = (graph: Graph) => {
    setupIconButtons(graph);
    setupOnWindowResize(graph);
    setupSideBar(graph);
};

initialize();
