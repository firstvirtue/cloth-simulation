/*
2차원 벡터 클래스, three.js 사용 이전에 만든 클래스로 three.js에서 사용하는 벡터 클래스로 대체 가능
*/

'use strict';

class Vector {
  constructor(x, y, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  normalize() {
    let m = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

    this.x /= m;
    this.y /= m;
    this.z /= m;
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  addScaledVector(vector, scale) {
    this.x += vector.x * scale;
    this.y += vector.y * scale;
    this.z += vector.z * scale;
  }

  negative() {
    return new Vector(-this.x, -this.y, -this.z);
  }

  add(v) {
    if(v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
    else return new Vector(this.x + v, this.y + v, this.z + v);
  }

  subtract(vector) {
    let v = new Vector(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    return v;
  }

  multiply(v) {
    if(v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
    else return new Vector(this.x * v, this.y * v, this.z * v);
  }

  clear() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}

export default Vector;
