import Camera from "./camera";
import Shape3D from "./shape";

export default class Renderer {
    readonly ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    aspect: number;
    backgroundColor: string = "#000000FF";
    readonly shapes: Shape3D[] = [];

    constructor(public readonly canvas: HTMLCanvasElement, public readonly camera: Camera) {
        this.ctx = canvas.getContext("2d");
        if (!this.ctx) throw new Error("Failed to get 2D context from canvas");
        this.width = canvas.width;
        this.height = canvas.height;
        this.aspect = canvas.width / canvas.height;
    };

    resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.aspect = width / height;
    };

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        for (const shape of this.shapes) {
            shape.draw(this, this.camera);
        }
    };

    addShape(shape: Shape3D) {
        this.shapes.push(shape);
    };
}
