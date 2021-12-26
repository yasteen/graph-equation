import { Graph } from "./graph";

export const initializeCanvasScrolling = (graph: Graph) => {
    var doResize: number;
    window.addEventListener("resize", () => {
        clearTimeout(doResize);
        doResize = setTimeout(() => {
            graph.resizeGraph();
        }, 100);
    });
    graph.resizeGraph();
    let x: number, y: number;
    const down = (ev: MouseEvent | TouchEvent) => {
        if (ev instanceof MouseEvent) {
            [x, y] = graph.graphToCoord(ev.clientX, ev.clientY);
        } else {
            [x, y] = graph.graphToCoord(
                ev.changedTouches[0].clientX,
                ev.changedTouches[0].clientY
            );
        }
    };
    const up = (ev: MouseEvent | TouchEvent) => {
        if (x === undefined || y === undefined) return;
        let newX: number, newY: number;
        if (ev instanceof MouseEvent) {
            [newX, newY] = graph.graphToCoord(ev.clientX, ev.clientY);
        } else {
            [newX, newY] = graph.graphToCoord(
                ev.changedTouches[0].clientX,
                ev.changedTouches[0].clientY
            );
        }
        const dx = -(newX - x),
            dy = -(newY - y);
        graph.minX += dx;
        graph.maxX += dx;
        graph.minY += dy;
        graph.maxY += dy;
        graph.runAllGraphs();
        graph.redraw();
    };
    graph.canvas.addEventListener("mousedown", down);
    graph.canvas.addEventListener("touchstart", down);
    graph.canvas.addEventListener("mouseup", up);
    graph.canvas.addEventListener("touchend", up);
};

export const setupSideBar = (graph: Graph) => {
    setupResizeBar(graph);

    document
        .getElementById("equation-panel-top-clear")
        .addEventListener("click", () => graph.resetAndDrawGrid());
    document
        .getElementById("equation-panel-top-add")
        .addEventListener("click", () => createSideBarEquation(graph));
    createSideBarEquation(graph);
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

const createSideBarEquation = (graph: Graph) => {
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
        graph.runGraph(id);
        graph.redraw();
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

export const setupIconButtons = (graph: Graph) => {
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
        graph.redraw();
    });
};
