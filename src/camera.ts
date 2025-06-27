import Vec3, {AXIS_Y} from "./vec3";
import Vec2 from "./vec2";
import Renderer from "./renderer";

export default class Camera {
    direction = new Vec3;
    up = new Vec3;
    right = new Vec3;

    constructor(public position = new Vec3, direction = new Vec3(0, 0, 1), public fov = 60, public near = 0.1, public far = 100) {
        this.setDirection(direction);
    };

    setDirection(direction: Vec3) {
        this.direction.set(direction).normalize();
        this.updateUpRight();
    };

    updateUpRight() {
        this.right.set(this.direction).cross(AXIS_Y).normalize();
        this.up.set(this.right).cross(this.direction).normalize();
    };

    setDirectionFromAngles(yaw: number, pitch: number) {
        const cosPitch = Math.cos(pitch);
        this.direction.x = Math.cos(yaw) * cosPitch;
        this.direction.y = Math.sin(pitch);
        this.direction.z = Math.sin(yaw) * cosPitch;
        this.direction.normalize();
        this.updateUpRight();
    };

    getScreenPosition(renderer: Renderer, point: Vec3) {
        const zAxis = this.direction.copy().scale(-1);
        const xAxis = this.up.copy().cross(zAxis).normalize();
        const yAxis = zAxis.copy().cross(xAxis);

        const tx = -xAxis.dot(this.position);
        const ty = -yAxis.dot(this.position);
        const tz = -zAxis.dot(this.position);

        const viewMatrix = [
            xAxis.x, yAxis.x, zAxis.x, 0,
            xAxis.y, yAxis.y, zAxis.y, 0,
            xAxis.z, yAxis.z, zAxis.z, 0,
            tx, ty, tz, 1
        ];

        const f = 1 / Math.tan((this.fov / 2) * (Math.PI / 180));
        const rangeInv = 1 / (this.near - this.far);

        const projectionMatrix = [
            f / renderer.aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (this.near + this.far) * rangeInv, -1,
            0, 0, 2 * this.near * this.far * rangeInv, 0
        ];

        const {x, y, z} = point;
        const px = x * viewMatrix[0] + y * viewMatrix[4] + z * viewMatrix[8] + viewMatrix[12];
        const py = x * viewMatrix[1] + y * viewMatrix[5] + z * viewMatrix[9] + viewMatrix[13];
        const pz = x * viewMatrix[2] + y * viewMatrix[6] + z * viewMatrix[10] + viewMatrix[14];
        const pw = x * viewMatrix[3] + y * viewMatrix[7] + z * viewMatrix[11] + viewMatrix[15];

        const cx = px * projectionMatrix[0] + py * projectionMatrix[4] + pz * projectionMatrix[8] + pw * projectionMatrix[12];
        const cy = px * projectionMatrix[1] + py * projectionMatrix[5] + pz * projectionMatrix[9] + pw * projectionMatrix[13];
        // const cz = px * projectionMatrix[2] + py * projectionMatrix[6] + pz * projectionMatrix[10] + pw * projectionMatrix[14];
        const cw = px * projectionMatrix[3] + py * projectionMatrix[7] + pz * projectionMatrix[11] + pw * projectionMatrix[15];

        const ndcX = cx / cw;
        const ndcY = cy / cw;

        const screenX = (ndcX + 1) / 2 * renderer.width;
        const screenY = (1 - ndcY) / 2 * renderer.height;

        return new Vec2(screenX, screenY);
    };

    canSee(renderer: Renderer, point: Vec3) {
        const toPoint = point.copy().sub(this.position);
        const distance = toPoint.length();
        if (distance < this.near || distance > this.far) return false;

        const directionToPoint = toPoint.copy().normalize();
        const angle = Math.acos(this.direction.dot(directionToPoint));

        const verticalFovRad = (this.fov * Math.PI) / 180;
        const horizontalFovRad = 2 * Math.atan(Math.tan(verticalFovRad / 2) * renderer.aspect);
        const maxAngle = Math.sqrt(horizontalFovRad ** 2 + verticalFovRad ** 2) / 2;

        return angle <= maxAngle;
    }
}