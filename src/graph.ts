import { initializeCanvasResizeListeners } from "./eventHandler";

export class Graph {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    equations: { [id: number]: string };
    currentEquationId: number;
    canvas: HTMLCanvasElement;
    outputValues: { [index: number]: number[] };

    constructor(canvas: HTMLCanvasElement) {
        this.minX = -1;
        this.maxX = 1;
        this.minY = -1;
        this.maxY = 1;
        this.equations = {};
        this.currentEquationId = 0;
        this.canvas = canvas;
        this.outputValues = {};

        initializeCanvasResizeListeners(this);
    }

    // Runs the WASM function on the given equation
    runGraph(index: number) {
        if (typeof window["graph"] === "function") {
            if (this.equations[index] === "") return;
            const step = this.getStep();
            this.outputValues[index] = window["graph"](
                this.equations[index],
                this.minX,
                step,
                this.maxX,
                "x"
            );
            this.drawEqn(index);
        } else {
            console.error("Failed to detect WASM graph function");
        }
    }

    redraw() {
        this.canvas.getContext("2d").strokeStyle = getComputedStyle(
            document.documentElement
        ).getPropertyValue("--canvas-line");
        this.resetGrid();
        for (const i of Object.keys(this.outputValues)) {
            this.drawEqn(Number(i));
        }
    }

    // Clears canvas, and draws axes and grid
    resetAndDrawGrid() {
        this.resetGrid();
        Object.keys(this.equations).forEach((key) => {
            delete this.equations[key];
        });
        Object.keys(this.outputValues).forEach((key) => {
            delete this.outputValues[key];
        });
    }

    // Graphs the equation
    drawEqn(index: number) {
        if (!this.outputValues[index]) return;
        const ctx = this.canvas.getContext("2d");
        const [_, startY] = this.coordToGraph(
            this.minX,
            this.outputValues[index][0]
        );
        let drawing = false;
        if (!isNaN(startY)) {
            drawing = true;
            ctx.beginPath();
            ctx.moveTo(0, startY);
        }
        const step = this.canvas.width / this.outputValues[index].length;
        let curX = 0;
        for (const curY of this.outputValues[index]) {
            const [_, y] = this.coordToGraph(curX, curY);
            if (isNaN(y)) {
                if (drawing) ctx.stroke();
                drawing = false;
            } else {
                if (!drawing) ctx.beginPath();
                ctx.lineTo(curX, isNaN(y) ? this.coordToGraph(0, 0)[1] : y);
                drawing = true;
            }
            curX += step;
        }
        ctx.stroke();
    }

    // ***** Helpers *****

    // Recalculates for all the graphs
    runAllGraphs() {
        for (let i of Object.keys(this.equations)) this.runGraph(Number(i));
    }

    // Resize proportionally based on given width
    resizeProportionally = (halfWidth: number) => {
        const mid = (this.minY + this.maxY) / 2;
        const halfHeight =
            (halfWidth / (this.canvas.width || 0)) * this.canvas.height;
        this.minX = -halfWidth;
        this.maxX = halfWidth;
        this.minY = mid - halfHeight;
        this.maxY = mid + halfHeight;
    };

    // Resets the canvas inner size to the outer size
    resizeGraph() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.resizeProportionally(3);
        this.redraw();
    }

    // Converts math coordinates to on-screen pixel coordinates
    coordToGraph(x: number, y: number) {
        return [
            ((x - this.minX) * this.canvas.width) / (this.maxX - this.minX),
            ((this.maxY - y) * this.canvas.height) / (this.maxY - this.minY),
        ];
    }

    graphToCoord(x: number, y: number) {
        return [
            (x * (this.maxX - this.minX)) / this.canvas.width + this.minX,
            this.maxY - (y * (this.maxY - this.minY)) / this.canvas.height,
        ];
    }

    // Returns the step-size used in the WASM module
    getStep() {
        const resolution = 2;
        return (resolution / this.canvas.width) * (this.maxX - this.minX);
    }

    resetGrid() {
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const [xint, yint] = this.coordToGraph(0, 0);
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, yint);
        ctx.lineTo(this.canvas.width, yint);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xint, 0);
        ctx.lineTo(xint, this.canvas.height);
        ctx.stroke();
    }
}
