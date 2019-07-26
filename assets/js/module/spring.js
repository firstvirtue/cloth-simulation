// 또는 constraint
class Spring {
  constructor(p1, p2, spacing) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = spacing;
  }

  update() {
    const springConstant = 58;
    const dampingConstant = 15;

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
    // const springConstant = 318;
    const springConstant = 618;
    const dampingConstant = 20;

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
    const springConstant = 2;
    const dampingConstant = 100;
    const squaredRestLength = this.restLength * this.restLength;

    let pt1 = this.p1.vPosition;
    let pt2 = this.p2.vPosition;
    let length = pt2.subtract(pt1);

    let d = length.squaredMagnitude();

    let diff = (-1 * springConstant) * (Math.abs(d) - squaredRestLength) * squaredRestLength;

    this.p1.addForce(this.p1.vPosition.multiply(-diff));
    this.p2.addForce(this.p2.vPosition.multiply(diff));
  }

  draw() {
    let ctx = canvas.getContext('2d');

    ctx.moveTo(this.p1.vPosition.x, this.p1.vPosition.y);
    ctx.lineTo(this.p2.vPosition.x, this.p2.vPosition.y);
  }
}

export default Spring;
