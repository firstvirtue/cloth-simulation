/*
점과 점의 관계를 훅의 법칙(Hooke's law)을 통해 정의하는 클래스
constraint라는 이름이 더 적절할 수 있겠다.(다른 샘플들을 보면 이렇게 많이 사용함)
*/

'use strict';

class Spring {
  constructor(p1, p2, spacing) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = spacing;
  }

  update() {
    const springConstant = 35;
    const dampingConstant = 10;

    let pt1 = this.p1.vPosition;
    let v1 = this.p1.vVelocity;

    let pt2 = this.p2.vPosition;
    let v2 = this.p2.vVelocity;

    let vr = v2.subtract(v1);
    let r = pt2.subtract(pt1);

    let dl = r.magnitude() - this.restLength;

    let f = springConstant * Math.floor(dl);
    r.normalize();

    let vForce = r.multiply(f).add(vr.multiply(r).multiply(dampingConstant).multiply(r));

    this.p1.addForce(vForce);
    this.p2.addForce(vForce.negative());

    // DEBUG
    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // console.log(Math.floor(dl));
    //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  }

  update2() {
    const springConstant = 1018;
    // const springConstant = 618;
    const dampingConstant = 25;

    let pt1 = this.p1.vPosition;
    let pt2 = this.p2.vPosition;

    let v1 = this.p1.vVelocity;
    let v2 = this.p2.vVelocity;

    let vr = v2.subtract(v1);
    let r = pt2.subtract(pt1);

    let dl = r.magnitude() - this.restLength;

    r.normalize();

    let vSpring = r.multiply(Math.floor(dl) * springConstant);
    let vDamper = vr.multiply(dampingConstant);

    // vForce.normalize();
    // let magnitude = vForce.magnitude();

    let vForce = vDamper.add(vSpring);

    this.p1.addForce(vForce);
    this.p2.addForce(vForce.negative());
  }


  update3() {
    const springConstant = 200;
    const dampingConstant = 10;

    let pt1 = this.p1.vPosition;
    let pt2 = this.p2.vPosition;
    let diff = pt2.subtract(pt1);

    let dist = diff.magnitude();

    if(dist === 0) return;

    let correction = diff.multiply(1 - this.restLength / dist);
    let half = correction.multiply(0.5);

    this.p1.addForce(this.p1.vPosition.multiply(-correction));
    this.p2.addForce(this.p2.vPosition.multiply(correction));
  }

  draw() {
    let ctx = canvas.getContext('2d');

    ctx.moveTo(this.p1.vPosition.x, this.p1.vPosition.y);
    ctx.lineTo(this.p2.vPosition.x, this.p2.vPosition.y);
  }
}

export default Spring;
