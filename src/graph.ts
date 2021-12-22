export interface Graph {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    equations: string[];
    canvas: HTMLCanvasElement;
    outputValues: { [index: number]: number[] };
}

// Constructs a new Graph object
export const newGraph = (canvas: HTMLCanvasElement) => {
    const graph: Graph = {
        minX: -1,
        maxX: 1,
        minY: -1,
        maxY: 1,
        equations: [],
        canvas: canvas,
        outputValues: [],
    };

    var doResize: NodeJS.Timeout;
    new ResizeObserver(() => {
        clearTimeout(doResize);
        doResize = setTimeout(() => resizeGraph(graph), 100);
    }).observe(canvas);
    resizeGraph(graph);
    let x: number, y: number;
    const down = (ev: MouseEvent | TouchEvent) => {
        if (ev instanceof MouseEvent) {
            [x, y] = graphToCoord(ev.clientX, ev.clientY, graph);
        } else {
            [x, y] = graphToCoord(
                ev.changedTouches[0].clientX,
                ev.changedTouches[0].clientY,
                graph
            );
        }
    };
    const up = (ev: MouseEvent | TouchEvent) => {
        if (x === undefined || y === undefined) return;
        let newX: number, newY: number;
        if (ev instanceof MouseEvent) {
            [newX, newY] = graphToCoord(ev.clientX, ev.clientY, graph);
        } else {
            [newX, newY] = graphToCoord(
                ev.changedTouches[0].clientX,
                ev.changedTouches[0].clientY,
                graph
            );
        }
        const dx = -(newX - x),
            dy = -(newY - y);
        graph.minX += dx;
        graph.maxX += dx;
        graph.minY += dy;
        graph.maxY += dy;
        runAllGraphs(graph);
        redraw(graph);
    };
    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("touchstart", down);
    canvas.addEventListener("mouseup", up);
    canvas.addEventListener("touchend", up);
    return graph;
};

// Runs the WASM function on the given equation
export const runGraph = (graph: Graph, index: number) => {
    if (typeof window["graph"] === "function") {
        if (graph.equations[index] === "") return;
        const step = getStep(graph);
        graph.outputValues[index] = window["graph"](
            graph.equations[index],
            graph.minX,
            step,
            graph.maxX,
            "x"
        );
        drawEqn(graph, index);
    } else {
        console.error("Failed to detect WASM graph function");
    }
};

export const redraw = (graph: Graph) => {
    graph.canvas.getContext("2d").strokeStyle = getComputedStyle(
        document.documentElement
    ).getPropertyValue("--canvas-line");
    resetGrid(graph);
    for (const i of Object.keys(graph.outputValues)) {
        drawEqn(graph, Number(i));
    }
};

// Clears canvas, and draws axes and grid
export const resetAndDrawGrid = (graph: Graph) => {
    resetGrid(graph);

    Object.keys(graph.outputValues).forEach((key) => {
        delete graph.outputValues[key];
    });
};

// Graphs the equation
export const drawEqn = (graph: Graph, index: number) => {
    if (!graph.outputValues[index]) {
        return;
    }

    const ctx = graph.canvas.getContext("2d");
    const [_, startY] = coordToGraph(
        graph.minX,
        graph.outputValues[index][0],
        graph
    );
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
            if (drawing) ctx.stroke();
            drawing = false;
        } else {
            if (!drawing) ctx.beginPath();
            ctx.lineTo(curX, isNaN(y) ? coordToGraph(0, 0, graph)[1] : y);
            drawing = true;
        }
        curX += step;
    }
    ctx.stroke();
};

// ***** Helpers *****

// Recalculates for all the graphs
const runAllGraphs = (graph: Graph) => {
    for (let i = 0; i < graph.equations.length; i++) runGraph(graph, i);
};

// Resize proportionally based on given width
const resizeProportionally = (graph: Graph, halfWidth: number) => {
    const mid = (graph.minY + graph.maxY) / 2;
    const halfHeight =
        (halfWidth / (graph.canvas.width || 0)) * graph.canvas.height;
    graph.minX = -halfWidth;
    graph.maxX = halfWidth;
    graph.minY = mid - halfHeight;
    graph.maxY = mid + halfHeight;
};

// Resets the canvas inner size to the outer size
const resizeGraph = (graph: Graph) => {
    graph.canvas.width = graph.canvas.clientWidth;
    graph.canvas.height = graph.canvas.clientHeight;
    resizeProportionally(graph, 3);
    redraw(graph);
};

// Converts math coordinates to on-screen pixel coordinates
const coordToGraph = (x: number, y: number, graph: Graph) => {
    return [
        ((x - graph.minX) * graph.canvas.width) / (graph.maxX - graph.minX),
        ((graph.maxY - y) * graph.canvas.height) / (graph.maxY - graph.minY),
    ];
};

const graphToCoord = (x: number, y: number, graph: Graph) => {
    return [
        (x * (graph.maxX - graph.minX)) / graph.canvas.width + graph.minX,
        graph.maxY - (y * (graph.maxY - graph.minY)) / graph.canvas.height,
    ];
};

// Returns the step-size used in the WASM module
const getStep = (graph: Graph) => {
    const resolution = 2; // pixels
    return (resolution / graph.canvas.width) * (graph.maxX - graph.minX);
};

const resetGrid = (graph: Graph) => {
    const ctx = graph.canvas.getContext("2d");
    ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
    const [xint, yint] = coordToGraph(0, 0, graph);
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, yint);
    ctx.lineTo(graph.canvas.width, yint);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(xint, 0);
    ctx.lineTo(xint, graph.canvas.height);
    ctx.stroke();
};
