export interface Graph {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    equation: string;
    canvas: HTMLCanvasElement;
    outputValues: number[];
}

// Constructs a new Graph object
export const newGraph = (canvas: HTMLCanvasElement) => {
    const graph: Graph = {
        minX: -2,
        maxX: 2,
        minY: -2,
        maxY: 2,
        equation: "0",
        canvas: canvas,
        outputValues: null,
    };

    var doResize: NodeJS.Timeout;
    new ResizeObserver(() => {
        clearTimeout(doResize);
        doResize = setTimeout(() => resizeGraph(graph), 100);
    }).observe(canvas);
    resizeGraph(graph);
    return graph;
};

// Runs the WASM function on the given equation
export const runGraph = (graph: Graph) => {
    if (typeof window["graph"] === "function") {
        const step = getStep(graph);
        graph.outputValues = window["graph"](
            graph.equation,
            graph.minX,
            step,
            graph.maxX,
            "x"
        );
        redraw(graph);
    } else {
        console.error("Failed to detect WASM graph function");
    }
};

export const redraw = (graph: Graph) => {
    resetAndDrawGrid(graph);
    drawEqn(graph);
};

// Clears canvas, and draws axes and grid
export const resetAndDrawGrid = (graph: Graph) => {
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

// Graphs the equation
export const drawEqn = (graph: Graph) => {
    if (graph.outputValues) {
        const ctx = graph.canvas.getContext("2d");
        const [_, startY] = coordToGraph(
            graph.minX,
            graph.outputValues[0],
            graph
        );
        let drawing = false;
        if (!isNaN(startY)) {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(0, startY);
        }
        const step = graph.canvas.width / graph.outputValues.length;
        let curX = 0;
        for (const curY of graph.outputValues) {
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
    }
};

// ** Helpers **

// Resets the canvas inner size to the outer size
const resizeGraph = (graph: Graph) => {
    graph.canvas.width = graph.canvas.clientWidth;
    graph.canvas.height = graph.canvas.clientHeight;
    redraw(graph);
};

// Converts math coordinates to on-screen pixel coordinates
const coordToGraph = (x: number, y: number, graph: Graph) => {
    return [
        ((x - graph.minX) * graph.canvas.width) / (graph.maxX - graph.minX),
        ((graph.maxY - y) * graph.canvas.height) / (graph.maxY - graph.minY),
    ];
};

// Returns the step-size used in the WASM module
const getStep = (graph: Graph) => {
    const resolution = 2; // pixels
    return (resolution / graph.canvas.width) * (graph.maxX - graph.minX);
};
