/*
시뮬레이션 될 천(cloth) 모델의 구성요소인 점 모델
위치, 속도, 가속도, 질량 등의 변수와 점과 점의 관계 요소인 spring 객체를 가짐
*/

import Vector from '~/assets/js/module/vector.js';
import DebugObject from '~/assets/js/module/debug-object.js';
import Spring from '~/assets/js/module/spring.js';

class Point extends DebugObject {
  constructor(x, y) {
    super();

    this.vPosition = new Vector(x, y);
    this.vForce = new Vector(0, 0);
    this.vVelocity = new Vector(0, 0);
    this.vAcceleration = new Vector(0, 0);
    this.springs = [];
    this.mass = 0.5;
    this.isCurrent = false;
  }

  attach(p, spacing) {
    this.springs.push(new Spring(this, p, spacing));
  }

  setPosition(v) {
    if(this.isCurrent) {
      this.vPosition.x = v.x;
      this.vPosition.y = v.y;
    }
  }

  setCurrent() {
    this.isCurrent = true;
  }

  free() {
    this.isCurrent = false;
  }

  updateSpring() {
    this.springs.forEach(spring => {
      // spring.update();
      spring.update2();
    });
  }

  updateFluidDrag() {
    // let f = this.vVelocity.multiply(-0.8);
    // let f = this.vVelocity.multiply(-1.0);
    let f = this.vVelocity.multiply(-0.5);
    this.addForce(f);
  }

  addForce(force, scale = 1) {
    this.vForce.addScaledVector(force, scale);
  }

  resolve() {

  }

  updateStep(time) {
    if(! this.isCurrent) {
      this.vPosition.addScaledVector(this.vVelocity, time);

      // F = m * a
      this.vAcceleration = this.vForce.multiply(this.mass);

      this.vVelocity.addScaledVector(this.vAcceleration, time);
    }

    this.vForce.clear();
  }

  draw() {
    this.springs.forEach(spring => {
      spring.draw();
    });
  }
}

export default Point;
