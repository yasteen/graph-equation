import { resizeCanvas } from "./canvas";
document.documentElement.className = "dark";

resizeCanvas();
// On window resize
(() => {
    var throttled = false;
    var timeout: false | number = false;
    window.addEventListener("resize", () => {
        if (!throttled) {
            if (timeout !== false) clearTimeout(timeout);
            timeout = setTimeout(() => {
                onResize();
                console.log("resize");
            }, 200);
            throttled = true;
            setTimeout(() => {
                throttled = false;
                console.log("damn");
            }, 200);
        }
    });
    const onResize = () => {
        resizeCanvas();
    };
})();
