import { Graph } from "./graph";

export const initializeCanvasResizeListeners = (graph: Graph) => {
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
