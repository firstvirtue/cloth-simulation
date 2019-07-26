class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  normalize() {
    let m = Math.sqrt(this.x*this.x + this.y*this.y);

    this.x /= m;
    this.y /= m;
  }

  magnitude() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  squaredMagnitude() {
    return (this.x*this.x) + (this.y*this.y);
  }

  addScaledVector(vector, scale) {
    this.x += vector.x * scale;
    this.y += vector.y * scale;
  }

  negative() {
    return new Vector(-this.x, -this.y);
  }

  add(v) {
    if(v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y);
    else return new Vector(this.x + v, this.y + v);
  }

  subtract(vector) {
    let v = new Vector(this.x - vector.x, this.y - vector.y);
    return v;
  }

  multiply(v) {
    if(v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y);
    else return new Vector(this.x * v, this.y * v);
  }

  clear() {
    this.x = 0;
    this.y = 0;
  }
}

export default Vector;
