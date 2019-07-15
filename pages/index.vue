<template>
  <section class="container">
    <div>
      <canvas id="canvas" width="600" height="600"></canvas>
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
    // 의사코드
    const point = 4;
    const spacing = 50;
    const clothX = 5;
    const clothY = 5;
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

      particles.forEach((e) => {
        e.update(mouse);
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      particles.forEach((e) => {
        // console.log(e);
        e.springs.forEach(spring => {
          spring.draw();
        });
      });

      ctx.stroke();

      window.requestAnimFrame(update);
    })(0);

  }
}

class Vector2 {
  constructor() {

  }

  normalize() {

  }

  magnitude() {

  }
}

// 또는 particle
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.springs = [];
  }

  attach(p) {
    this.springs.push(new Spring(this, p));
  }

  update(mouse) {
    if (mouse.down) {

      let dx = this.x - mouse.x
      let dy = this.y - mouse.y
      let dist = Math.sqrt(dx * dx + dy * dy)

      console.log(dist);

      if (dist < mouse.influence) {
      //   this.px = this.x - (mouse.x - mouse.px)
      //   this.py = this.y - (mouse.y - mouse.py)
      // } else if (dist < mouse.cut) {
      //   this.constraints = []

        this.x = mouse.x;
        this.y = mouse.y;
      }
    }
  }
}

// 또는 constraint
class Spring {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }

  update() {

  }

  draw() {
    let ctx = canvas.getContext('2d');

    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
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
