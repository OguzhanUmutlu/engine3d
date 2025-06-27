export default class Vec3 {
    constructor(public x = 0, public y = 0, public z = 0) {
    };

    length() {
        return Math.hypot(this.x, this.y, this.z);
    };

    add(other: Vec3) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    };

    sub(other: Vec3) {
        this.x -= other.x;
        this.y -= other.y;
        this.z -= other.z;
        return this;
    };

    scale(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    };

    dot(other: Vec3) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    };

    cross(other: Vec3) {
        const newX = this.y * other.z - this.z * other.y;
        const newY = this.z * other.x - this.x * other.z;
        const newZ = this.x * other.y - this.y * other.x;
        this.x = newX;
        this.y = newY;
        this.z = newZ;
        return this;
    };

    normalize() {
        const len = this.length();
        this.x /= len;
        this.y /= len;
        this.z /= len;
        return this;
    };

    rotateAround(axis: Vec3, theta: number) {
        if (theta % (2 * Math.PI) === 0) return this;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const dot = this.dot(axis);
        const cross = this.copy().cross(axis);

        this.x = this.x * cos + cross.x * sin + axis.x * dot * (1 - cos);
        this.y = this.y * cos + cross.y * sin + axis.y * dot * (1 - cos);
        this.z = this.z * cos + cross.z * sin + axis.z * dot * (1 - cos);
        return this;
    };

    applyRotation(rotation: Vec3) {
        return this.rotateAround(AXIS_X, rotation.x)
            .rotateAround(AXIS_Y, rotation.y)
            .rotateAround(AXIS_Z, rotation.z);
    };

    copy() {
        return new Vec3(this.x, this.y, this.z);
    };

    set(other: Vec3) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        return this;
    };
}

export const AXIS_X = new Vec3(1, 0, 0);
export const AXIS_Y = new Vec3(0, 1, 0);
export const AXIS_Z = new Vec3(0, 0, 1);