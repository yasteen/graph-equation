define("graph", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.drawEqn = exports.resetAndDrawGrid = exports.redraw = exports.runGraph = exports.newGraph = void 0;
    const newGraph = (canvas) => {
        const graph = {
            minX: -2,
            maxX: 2,
            minY: -2,
            maxY: 2,
            equations: [],
            canvas: canvas,
            outputValues: [],
        };
        var doResize;
        new ResizeObserver(() => {
            clearTimeout(doResize);
            doResize = setTimeout(() => resizeGraph(graph), 100);
        }).observe(canvas);
        resizeGraph(graph);
        return graph;
    };
    exports.newGraph = newGraph;
    const runGraph = (graph, index) => {
        if (typeof window["graph"] === "function") {
            const step = getStep(graph);
            graph.outputValues[index] = window["graph"](graph.equations[index], graph.minX, step, graph.maxX, "x");
            (0, exports.drawEqn)(graph, index);
        }
        else {
            console.error("Failed to detect WASM graph function");
        }
    };
    exports.runGraph = runGraph;
    const redraw = (graph) => {
        (0, exports.resetAndDrawGrid)(graph);
        for (const i of Object.keys(graph.outputValues)) {
            (0, exports.drawEqn)(graph, Number(i));
        }
    };
    exports.redraw = redraw;
    const resetAndDrawGrid = (graph) => {
        const ctx = graph.canvas.getContext("2d");
        ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
        const [xint, yint] = coordToGraph(0, 0, graph);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(0, yint);
        ctx.lineTo(graph.canvas.width, yint);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xint, 0);
        ctx.lineTo(xint, graph.canvas.height);
        ctx.stroke();
    };
    exports.resetAndDrawGrid = resetAndDrawGrid;
    const drawEqn = (graph, index) => {
        if (!graph.outputValues[index]) {
            return;
        }
        const ctx = graph.canvas.getContext("2d");
        const [_, startY] = coordToGraph(graph.minX, graph.outputValues[index][0], graph);
        let drawing = false;
        if (!isNaN(startY)) {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(0, startY);
        }
        const step = graph.canvas.width / graph.outputValues[index].length;
        let curX = 0;
        for (const curY of graph.outputValues[index]) {
            const [_, y] = coordToGraph(curX, curY, graph);
            if (isNaN(y)) {
                if (drawing)
                    ctx.stroke();
                drawing = false;
            }
            else {
                if (!drawing)
                    ctx.beginPath();
                ctx.lineTo(curX, isNaN(y) ? coordToGraph(0, 0, graph)[1] : y);
                drawing = true;
            }
            curX += step;
        }
        ctx.stroke();
    };
    exports.drawEqn = drawEqn;
    const resizeGraph = (graph) => {
        graph.canvas.width = graph.canvas.clientWidth;
        graph.canvas.height = graph.canvas.clientHeight;
        (0, exports.redraw)(graph);
    };
    const coordToGraph = (x, y, graph) => {
        return [
            ((x - graph.minX) * graph.canvas.width) / (graph.maxX - graph.minX),
            ((graph.maxY - y) * graph.canvas.height) / (graph.maxY - graph.minY),
        ];
    };
    const getStep = (graph) => {
        const resolution = 2;
        return (resolution / graph.canvas.width) * (graph.maxX - graph.minX);
    };
});
define("index", ["require", "exports", "graph"], function (require, exports, graph_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const initialize = () => {
        document.documentElement.className = "dark";
        const graph = (0, graph_1.newGraph)(document.querySelector("canvas"));
        initWasm(graph);
        setUpElementEvents(graph);
    };
    const initWasm = (graph) => {
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("scripts/main.wasm", {
            headers: {
                "Content-Security-Policy": "script-src self;",
            },
        }), go.importObject).then((result) => {
            go.run(result.instance);
        });
    };
    const setUpElementEvents = (graph) => {
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
        const minX = document.getElementById("minX");
        const maxX = document.getElementById("maxX");
        const minY = document.getElementById("minY");
        const maxY = document.getElementById("maxY");
        document
            .getElementById("equation-panel-top-clear")
            .addEventListener("click", () => (0, graph_1.resetAndDrawGrid)(graph));
        document
            .getElementById("equation-panel-top-add")
            .addEventListener("click", () => createEquation(graph));
        createEquation(graph);
    };
    const createEquation = (graph) => {
        const id = graph.equations.length;
        const eqnContainer = document.getElementById("equations-container");
        const newEqn = document.createElement("div");
        const graphButton = document.createElement("button");
        const graphField = document.createElement("input");
        newEqn.className = "equation";
        newEqn.id = "equation-" + id;
        const graphCallback = () => {
            graph.equations[id] = graphField.value;
            (0, graph_1.runGraph)(graph, id);
        };
        graphButton.addEventListener("click", graphCallback);
        graphButton.innerText = "Graph";
        graphField.addEventListener("keypress", (event) => {
            if (event.key === "Enter")
                graphCallback();
        });
        newEqn.appendChild(graphField);
        newEqn.appendChild(graphButton);
        eqnContainer.appendChild(newEqn);
        graph.equations.push("");
    };
    initialize();
});
