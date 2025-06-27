import Vec3 from "./vec3";
import Camera from "./camera";
import Shape3D, {EFFECT_STROKE_STYLE} from "./shape";
import Renderer from "./renderer";

const cubeVertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
].map(i => new Vec3(...i));

const canvas = document.querySelector("canvas");

const camera = new Camera(new Vec3(0, 0, -5));

const renderer = new Renderer(canvas, camera);

const colors = [
    0xFF0000FF, // Red
    0xFFA500FF, // Orange
    0xFFFF00FF, // Yellow
    0x00FF00FF, // Lime
    0x00FFFFFF, // Cyan
    0x0000FFFF, // Blue
    0xFF00FFFF, // Magenta
    0xFF1493FF, // Deep Pink
    0x00FF7FFF, // Spring Green
    0x1E90FFFF, // Dodger Blue
    0xFF6347FF, // Tomato
    0xDA70D6FF  // Orchid
];

const strokes = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
].map((i, j) => [...i, EFFECT_STROKE_STYLE, colors[j]]).flat();

const cube = new Shape3D(new Vec3(0, 0, 0), cubeVertices, new Uint32Array(strokes));

renderer.addShape(cube);

let angle = 0;
let fps: number[] = [];

function render() {
    const now = performance.now();
    fps = fps.filter(f => now - f < 1000);
    const dt = (now - (fps[fps.length - 1] || now)) / 1000;
    fps.push(now);

    cube.rotation.set(new Vec3(angle * 0.5, angle, 0));

    if (keys.w) camera.position.add(camera.direction.copy().scale(0.1));
    if (keys.s) camera.position.sub(camera.direction.copy().scale(0.1));
    if (keys.d) camera.position.add(camera.right.copy().scale(0.1));
    if (keys.a) camera.position.sub(camera.right.copy().scale(0.1));
    if (keys[" "]) camera.position.add(camera.up.copy().scale(0.1));
    if (keys.shift) camera.position.sub(camera.up.copy().scale(0.1));

    if (keys.c) angle += dt;

    renderer.render();

    renderer.ctx.fillStyle = "white";
    renderer.ctx.font = "30px monospace";
    renderer.ctx.fillText(`FPS: ${fps.length}`, 0, 30);
    renderer.ctx.fillText(`Controls: WASD, Shift, Space, C`, 0, 60);

    if (document.pointerLockElement !== canvas) {
        const text = "Click to lock pointer";
        const met = renderer.ctx.measureText(text);
        const [x, y] = [canvas.width / 2 - met.width / 2, canvas.height / 2 - met.actualBoundingBoxAscent / 2];
        renderer.ctx.fillStyle = "black";
        renderer.ctx.fillRect(x - 10, y - 40, met.width + 20, met.actualBoundingBoxAscent + 40);
        renderer.ctx.fillStyle = "white";
        renderer.ctx.fillText(text, canvas.width / 2 - met.width / 2, canvas.height / 2 - met.actualBoundingBoxAscent / 2);
    }

    requestAnimationFrame(render);
}

const keys: Record<string, boolean> = {};

render();

renderer.resize(innerWidth, innerHeight);
addEventListener("resize", () => renderer.resize(innerWidth, innerHeight));
addEventListener("keydown", e => {
    const key = e.key.toLowerCase();
    keys[key] = true;
});
addEventListener("keyup", e => {
    const key = e.key.toLowerCase();
    delete keys[key];
});
canvas.addEventListener("click", () => canvas.requestPointerLock());

let yaw = Math.PI / 2, pitch = 0;
addEventListener("mousemove", e => {
    if (document.pointerLockElement !== canvas) return;
    const sensitivity = 0.002;
    yaw += e.movementX * sensitivity;
    pitch -= e.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch)); // prevent gimbal lock
    camera.setDirectionFromAngles(yaw, pitch);
});