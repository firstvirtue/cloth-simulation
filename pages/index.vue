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
    const spacing = 10;
    const clothX = 35;
    const clothY = 35;
    const gravity = new Vector(0, 31.4);

    let particles = [];

    // 관계 생성
    for (var y = 0; y < clothY; y++) {
      for (var x = 0; x < clothX; x++) {
        let point = new Point(x*spacing, y*spacing);

        x!==0 && point.attach(particles[particles.length - 1]); // X
        y!==0 && point.attach(particles[(x) + (y-1) * (clothX)]); // Y
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


    canvas.onmousedown = (e) => {
      mouse.down = true;
    };

    canvas.onmousemove = mousemove;
    canvas.onmouseup = () => { mouse.down = false; }

    function mousemove(e) {
      let rect = canvas.getBoundingClientRect()
      mouse.px = mouse.x
      mouse.py = mouse.y
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    let mouse = {
      down: false,
      x: 0,
      y: 0,
      influence: 26
    }

    ;(function update(time) {

      // 힘 계산
      particles.forEach((particle, i) => {
        particle.updateMouse(mouse);
        // particle.addForce(gravity);

        particle.updateSpring();
      });

      // 적분기
      particles.forEach((particle) => {
        particle.updateStep(0.016);
      });

      // 그리기
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      particles.forEach((particle) => {
        particle.draw();
      });
      ctx.stroke();

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
  }

  attach(p) {
    this.springs.push(new Spring(this, p));
  }

  updateMouse(mouse) {
    if (mouse.down) {

      let dx = this.vPosition.x - mouse.x;
      let dy = this.vPosition.y - mouse.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.influence) {

        // console.log(`mouse.x: ${mouse.x}, mouse.px: ${mouse.px}`);
        // console.log(`pointx: ${this.vPosition.x}, mousex: ${mouse.x}`);

        this.addForce(new Vector((mouse.x - mouse.px), (mouse.y - mouse.py)), 10000);
        // this.addForce(new Vector(mouse.x - this.vPosition.x, mouse.y - this.vPosition.y), 50);

        // console.log(this.vPosition.x - mouse.x);
      }
    }
  }

  updateSpring() {
    this.springs.forEach(spring => {
      spring.update();
    });
  }

  addForce(force, scale = 1) {
    this.vForce.addScaledVector(force, scale);
  }

  resolve() {

  }

  updateStep(time) {
    this.vPosition.addScaledVector(this.vVelocity, time);

    let mass = 0.2;
    // F = m * a
    this.vAcceleration = this.vForce.multiply(mass);

    this.vVelocity.addScaledVector(this.vAcceleration, time);

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
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  update() {
    const restLength = 10;
    const springConstant = 200;
    const springDamping = 50;

    let pt1 = this.p1.vPosition;
    let v1 = this.p1.vVelocity;

    let pt2 = this.p2.vPosition;
    let v2 = this.p2.vVelocity;

    let vr = v2.subtract(v1);
    let r = pt2.subtract(pt1);

    let dl = r.magnitude() - restLength;
    let f = springConstant * dl;
    r.normalize();

    let vForce = r.multiply(f).add(vr.multiply(r).multiply(springDamping).multiply(r));
    // let vForce = vr.multiply(r).multiply(springDamping).multiply(r);

    this.p1.addForce(vForce);
    this.p2.addForce(vForce.negative());
  }

  update2() {
    const restLength = 10;
    const springConstant = 2;
    const springDamping = 100;

    let pt1 = this.p1.vPosition;
    let pt2 = this.p2.vPosition;

    let vForce = pt2.subtract(pt1);
    let magnitude = vForce.magnitude();

    magnitude = magnitude - restLength;
    magnitude *= springConstant;
    vForce.normalize();

    vForce = vForce.multiply(-magnitude);

    this.p1.addForce(vForce);
    this.p2.addForce(vForce.negative());
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
