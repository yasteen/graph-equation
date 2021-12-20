import { resetAndDrawGrid, Graph, newGraph, runGraph } from "./graph";
const initialize = () => {
    // Document colour scheme
    document.documentElement.className = "dark";

    const graph = newGraph(document.querySelector("canvas"));
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

    // Set up textField events
    const minX = document.getElementById("minX") as HTMLInputElement;
    const maxX = document.getElementById("maxX") as HTMLInputElement;
    const minY = document.getElementById("minY") as HTMLInputElement;
    const maxY = document.getElementById("maxY") as HTMLInputElement;
    // minX.addEventListener("change", onHandle)
    document
        .getElementById("equation-panel-top-clear")
        .addEventListener("click", () => resetAndDrawGrid(graph));
    document
        .getElementById("equation-panel-top-add")
        .addEventListener("click", () => createEquation(graph));

    // Set up equation graphing
    createEquation(graph);
};

const createEquation = (graph: Graph) => {
    const id = graph.equations.length;
    const eqnContainer = document.getElementById(
        "equations-container"
    ) as HTMLDivElement;
    const newEqn = document.createElement("div");
    const graphButton = document.createElement("button");
    const graphField = document.createElement("input");
    newEqn.className = "equation";
    newEqn.id = "equation-" + id;

    const graphCallback = () => {
        graph.equations[id] = graphField.value;
        runGraph(graph, id);
    };

    graphButton.addEventListener("click", graphCallback);
    graphButton.innerText = "Graph";
    graphField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") graphCallback();
    });

    newEqn.appendChild(graphField);
    newEqn.appendChild(graphButton);
    eqnContainer.appendChild(newEqn);
    graph.equations.push("");
};

initialize();
