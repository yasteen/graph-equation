import { resetAndDrawGrid, Graph, newGraph, runGraph, redraw } from "./graph";

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

    const iconToggleMode = document.getElementById(
        "icon-toggle-mode"
    ) as HTMLDivElement;
    iconToggleMode.addEventListener("click", (_ev) => {
        var theme: "light" | "dark";
        if (document.documentElement.className === "dark") {
            theme = "light";
            iconToggleMode.innerText = "☀️";
        } else {
            theme = "dark";
            iconToggleMode.innerText = "🌙";
        }
        document.documentElement.className = theme;
        redraw(graph);
    });

    // const eqPanelButton = document.getElementById(
    //     "equation-panel-hide"
    // ) as HTMLDivElement;
    // eqPanelButton.addEventListener("click", (_ev) => {
    //     const r = document.querySelector("html");
    //     if (r.style.getPropertyValue("--panel-length") === "0px") {
    //         r.style.setProperty(
    //             "--panel-length",
    //             r.style.getPropertyValue("--saved-panel-length")
    //         );
    //         eqPanelButton.innerHTML = "▼";
    //     } else {
    //         r.style.setProperty("--panel-length", "0px");
    //         eqPanelButton.innerHTML = "▲";
    //     }
    // });

    // Set up resizing
    setupResizeBar(graph);

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

const setupResizeBar = (graph: Graph) => {
    const BORDER_WIDTH = 4;
    const sideBar = document.getElementById("equation-panel") as HTMLDivElement;

    let m_pos: number;
    const resize = (e: MouseEvent) => {
        const dx = m_pos - e.x;
        m_pos = e.x;
        sideBar.style.width =
            parseInt(getComputedStyle(sideBar, "").width) + dx + "px";
        graph.canvas.style.width =
            parseInt(getComputedStyle(graph.canvas, "").width) - dx + "px";
    };

    sideBar.addEventListener(
        "mousedown",
        (e) => {
            if (e.offsetX < BORDER_WIDTH) {
                m_pos = e.x;
                document.addEventListener("mousemove", resize, false);
            }
        },
        false
    );

    document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", resize, false);
    });
};

const createEquation = (graph: Graph) => {
    const id = graph.currentEquationId;
    const eqnContainer = document.getElementById(
        "equations-container"
    ) as HTMLDivElement;
    const newEqn = document.createElement("div");
    const graphButton = document.createElement("button");
    const graphField = document.createElement("input");
    newEqn.className = "equation noselect";
    newEqn.id = "equation-" + id;

    const graphCallback = () => {
        graph.equations[id] = graphField.value;
        runGraph(graph, id);
        redraw(graph);
    };

    graphButton.addEventListener("click", graphCallback);
    graphButton.innerText = "Graph";
    graphField.addEventListener("keypress", (event) => {
        if (event.key === "Enter") graphCallback();
    });

    newEqn.appendChild(graphField);
    newEqn.appendChild(graphButton);
    eqnContainer.appendChild(newEqn);
    graph.equations[id] = "";
    graph.currentEquationId++;
};

initialize();
