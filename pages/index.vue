<template>
  <section class="container">
    <div>
      <canvas id="canvas"></canvas>
    </div>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'

export default {
  components: {
    AppLogo

  },
  mounted() {
    // 변수 선언
    const spacing = 20;
    const clothX = 35;
    const clothY = 35;
    const gravity = new Vector(0, 3.4);
    // const TIME = 0.016;
    const TIME = 0.05 * 0.5;

    let particles = [];
    let currentParticle;

    // 관계 생성
    for (var y = 0; y < clothY; y++) {
      for (var x = 0; x < clothX; x++) {
        let point = new Point(x*spacing, y*spacing);

        x!==0 && point.attach(particles[particles.length - 1], spacing); // X
        y!==0 && point.attach(particles[(x) + (y-1) * (clothX)], spacing); // Y
        particles.push(point);
      }
    }

    window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1e3 / 60)
    }

    let canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;

    let ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#555';

    let getClosestParticle = function(mouse) {
      let dist,
        minDist = 200,
        minParticle = null;

      particles.forEach(particle => {
        dist = particle.vPosition.subtract(mouse.vPosition).magnitude();

        if(dist < minDist) {
          minDist = dist;
          minParticle = particle;
        }
      });

      return minParticle;
    }

    canvas.onmousedown = (e) => {
      mouse.down = true;
      getMouse(e);

      currentParticle = getClosestParticle(mouse);
      currentParticle.setCurrent();
    };

    canvas.onmousemove = mousemove;

    canvas.onmouseup = () => {
      mouse.down = false;
      currentParticle.free();
    }

    function mousemove(e) {
      getMouse(e);

      if(currentParticle)
        currentParticle.setPosition(mouse.vPosition);
    }

    function getMouse(e) {
      let rect = canvas.getBoundingClientRect()

      mouse.vPosition.x = e.clientX - rect.left
      mouse.vPosition.y = e.clientY - rect.top
    }

    let mouse = {
      down: false,
      influence: 26,
      vPosition: new Vector(0, 0)
    }

    ;(function update(time) {

      // 힘 계산
      particles.forEach((particle, i) => {
        // particle.addForce(gravity);
        particle.updateFluidDrag();
        particle.updateSpring();
      });

      // 적분기
      particles.forEach((particle) => {
        particle.updateStep(TIME);
      });

      // 그리기
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      particles.forEach((particle) => {
        particle.draw();
      });
      ctx.stroke();

      // DEBUG
      //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      // if(currentParticle) {
        // console.log(currentParticle.vPosition);
      // }
      //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

      window.requestAnimFrame(update);
    })(0);

  }
}

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

class DebugObject {
  constructor() {

  }
}

// 또는 particle
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
      // spring.update3();
    });
  }

  updateFluidDrag() {
    let f = this.vVelocity.multiply(-0.8);
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
    const springConstant = 318;
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
</script>

<style>
.container {
  /* min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center; */
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
