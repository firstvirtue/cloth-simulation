<template>
  <section class="container">
    <div>
      <canvas id="canvas"></canvas>
    </div>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue';
import Spring from '~/assets/js/module/spring.js';
import Point from '~/assets/js/module/point.js';
import Vector from '~/assets/js/module/vector.js';

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
        particle.addForce(gravity);
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
