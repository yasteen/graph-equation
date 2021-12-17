import { resizeCanvas } from "./canvas";
document.documentElement.className = "dark";

// On window resize
(() => {
  var throttled = false;
  window.addEventListener("resize", () => {
    if (!throttled) {
      console.log(throttled);
      onResize();
      throttled = true;
      setTimeout(() => {
        throttled = false;
      }, 200);
    }
  });
  const onResize = () => {
    resizeCanvas();
  };
})();
