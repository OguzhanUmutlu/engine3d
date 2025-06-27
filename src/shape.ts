import Vec3 from "./vec3";
import Camera from "./camera";
import Renderer from "./renderer";
import Vec2 from "./vec2";

const U32MAX = 0xFFFFFFFF as const;
export const EFFECT_FILL_STYLE = U32MAX;
export const EFFECT_STROKE_STYLE = U32MAX - 1;

export default class Shape3D {
    constructor(public position: Vec3, public vertices: Vec3[], public map: Uint32Array, public rotation = new Vec3) {
    };

    draw(renderer: Renderer, camera: Camera) {
        const ctx = renderer.ctx;
        const transformed = this.vertices.map(vertex => vertex.copy().add(this.position).applyRotation(this.rotation));
        let canSeeAny = false;
        const drawStack: Vec2[] = [];
        const test: number[] = [];
        for (let i = 0; i < this.map.length; i++) {
            const edge = this.map[i];
            if (edge === EFFECT_FILL_STYLE || edge === EFFECT_STROKE_STYLE) {
                if (!canSeeAny) {
                    i++;
                    drawStack.length = 0;
                    test.length = 0;
                    continue;
                }
                const action = edge === EFFECT_FILL_STYLE ? "fill" : "stroke";
                ctx[action + "Style"] = `#${this.map[++i].toString(16).padStart(8, "0")}`;
                ctx.beginPath();
                ctx.moveTo(drawStack[0].x, drawStack[0].y);
                for (let i = 1; i < drawStack.length; i++) {
                    const point = drawStack[i];
                    ctx.lineTo(point.x, point.y);
                }
                if (action === "fill") ctx.lineTo(drawStack[0].x, drawStack[0].y);
                ctx[action]();
                ctx.closePath();
                for (let i = 0; i < drawStack.length; i++) {
                    const point = drawStack[i];
                    ctx.fillStyle = "white";
                    ctx.fillText(test[i].toString(), point.x, point.y);
                }
                drawStack.length = 0;
                test.length = 0;
                canSeeAny = false;
                continue;
            }

            const point = transformed[edge];
            const pos = camera.getScreenPosition(renderer, point);
            drawStack.push(pos);
            test.push(edge);
            if (!canSeeAny && camera.canSee(renderer, point)) canSeeAny = true;
        }
    };
}