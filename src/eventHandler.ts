import { Graph } from "./graph";

const updateLayout = (
    graph: Graph,
    previous: "landscape" | "portrait" | "force"
) => {
    var nextMode: "landscape" | "portrait" | "force" = "force";
    const equationPanel = document.getElementById(
        "equation-panel"
    ) as HTMLDivElement;
    if (window.innerWidth < window.innerHeight) {
        // Portrait
        const defaultHeight = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--default-portrait-panel-height");
        if (previous != "portrait") {
            equationPanel.style.width = "100vw";
            equationPanel.style.height = defaultHeight;
        }
        graph.canvas.style.width = "100vw";
        graph.canvas.style.height = `calc(100vh - ${defaultHeight})`;
        nextMode = "portrait";
    } else {
        // Landscape
        const defaultWidth = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--default-landscape-panel-width");
        if (previous != "landscape") {
            equationPanel.style.width = defaultWidth;
            equationPanel.style.height = "100vh";
        }
        graph.canvas.style.width = `calc(100vw - ${defaultWidth})`;
        graph.canvas.style.height = "100vh";
        nextMode = "landscape";
    }
    graph.resizeGraph();
    return nextMode;
};

export const setupOnWindowResize = (graph: Graph) => {
    var doResize: NodeJS.Timeout;
    var isPrevLandscape: "landscape" | "portrait" | "force" = "force";
    window.addEventListener("resize", () => {
        clearTimeout(doResize);
        doResize = setTimeout(() => {
            isPrevLandscape = updateLayout(graph, isPrevLandscape);
        }, 100);
    });
    isPrevLandscape = updateLayout(graph, isPrevLandscape);
};

export const initializeCanvasScrolling = (graph: Graph) => {
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
    var doResize: NodeJS.Timeout;

    let m_pos: number;
    const resize = (e: MouseEvent) => {
        if (window.innerWidth < window.innerHeight) {
            var dy = m_pos - e.y;
            if (
                sideBar.clientHeight <
                Number(
                    getComputedStyle(document.documentElement)
                        .getPropertyValue("--min-portrait-panel-height")
                        .replace("px", "")
                )
            ) {
                dy = dy < 0 ? 0 : dy;
            }
            m_pos = e.y;
            sideBar.style.height =
                parseInt(getComputedStyle(sideBar, "").height) + dy + "px";
            graph.canvas.style.height =
                parseInt(getComputedStyle(graph.canvas, "").height) - dy + "px";
        } else {
            var dx = m_pos - e.x;
            if (
                sideBar.clientWidth <
                Number(
                    getComputedStyle(document.documentElement)
                        .getPropertyValue("--min-landscape-panel-width")
                        .replace("px", "")
                )
            ) {
                dx = dx < 0 ? 0 : dx;
            }
            m_pos = e.x;
            sideBar.style.width =
                parseInt(getComputedStyle(sideBar, "").width) + dx + "px";
            graph.canvas.style.width =
                parseInt(getComputedStyle(graph.canvas, "").width) - dx + "px";
        }
        clearTimeout(doResize);
        doResize = setTimeout(() => {
            graph.resizeGraph();
        }, 100);
    };

    sideBar.addEventListener(
        "mousedown",
        (e) => {
            var offset: number, pos: number;
            if (window.innerWidth < window.innerHeight) {
                offset = e.offsetY;
                pos = e.y;
            } else {
                offset = e.offsetX;
                pos = e.x;
            }
            if (offset < BORDER_WIDTH) {
                m_pos = pos;
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
