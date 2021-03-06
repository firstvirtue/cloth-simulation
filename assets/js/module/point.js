/*
시뮬레이션 될 천(cloth) 모델의 구성요소인 점 모델
위치, 속도, 가속도, 질량 등의 변수와 점과 점의 관계 요소인 spring 객체를 가짐
*/

'use strict';

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
    this.mass = 0.7;
    this.isCurrent = false;
  }

  attach(p, spacing) {
    this.springs.push(new Spring(this, p, spacing));
  }

  setPosition(v) {
    if(this.isCurrent) {

      // const springConstant = 20;
      // const restLength = 20;
      //
      // let diff = this.vPosition.subtract(v);
      //
      // let m = diff.magnitude();
      // let dl = m - restLength;
      //
      // if(dl > 40) {
      //   dl = restLength;
      // }
      //
      // dl = dl * springConstant;
      // diff.normalize();
      // let force = diff.multiply(-dl);
      //
      // // console.log(force);
      //
      // this.addForce(force);
      //
      // // diff.normalize();
      //
      // // console.log(diff.multiply(50).negative());



      this.vPosition.x = v.x;
      this.vPosition.y = v.y;
      this.vPosition.z = v.z;
    }
  }

  setCurrent() {
    this.isCurrent = true;
  }

  free() {
    this.isCurrent = false;
  }

  updateSpring() {
    // if(this.isCurrent) return;

    this.springs.forEach(spring => {
      spring.update();
      // spring.update2();
      // spring.update3();
    });
  }

  updateFluidDrag() {
    let f = this.vVelocity.multiply(-0.2);
    // let f = this.vVelocity.multiply(-1.0);
    // let f = this.vVelocity.multiply(-0.5);
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
