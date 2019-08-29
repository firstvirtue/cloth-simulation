<template>
  <section class="container">
    <div>
      <canvas id="canvas"></canvas>
    </div>
  </section>
</template>

<script>
import Spring from '~/assets/js/module/spring.js';
import Point from '~/assets/js/module/point.js';
import Vector from '~/assets/js/module/vector.js';
import RenderEngine from '~/assets/js/module/render-engine.js';

export default {
  components: { },
  mounted() {
    const buoyancy = new Vector(0, 3.4);
    const TIME = 0.05 * 0.8;
    // const TIME = 0.05 * 0.41;

    let cloth = {};

    cloth.spacing = 60;
    cloth.clothW = 20;
    cloth.clothH = 20;

    cloth.particles = [];
    let currentParticle;
    const self = this;

    //  시뮬레이션 모델 생성
    for (var y = 0; y < cloth.clothW; y++) {
      for (var x = 0; x < cloth.clothH; x++) {
        let point = new Point(x * cloth.spacing - (cloth.clothW * cloth.spacing / 2), y * cloth.spacing - (cloth.clothH * cloth.spacing / 2));

        x!==0 && point.attach(cloth.particles[cloth.particles.length - 1], cloth.spacing); // X
        y!==0 && point.attach(cloth.particles[(x) + (y - 1) * (cloth.clothW)], cloth.spacing); // Y
        cloth.particles.push(point);
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
    let renderEngine = new RenderEngine();
    renderEngine.init(canvas, cloth);

    let getClosestParticle = function(vertex) {
      if(vertex === undefined) return;

      let dist,
        minDist = 200,
        minParticle = null;

      const vVertex = new Vector(vertex.point.x, vertex.point.y);

      cloth.particles.forEach(particle => {
        dist = particle.vPosition.subtract(vVertex).magnitude();

        if(dist < minDist) {
          minDist = dist;
          minParticle = particle;
        }
      });

      return minParticle;
    }

    canvas.onmousedown = (e) => {
      mouse.down = true;

      currentParticle = getClosestParticle(renderEngine.raycast(e));
      // console.log(self.raycast(e));
      if(currentParticle !== undefined && currentParticle !== null) {
        currentParticle.setCurrent();
      }
    };

    canvas.onmousemove = mousemove;

    canvas.onmouseup = () => {
      mouse.down = false;
      if(currentParticle !== undefined) {
        currentParticle.free();
      }
    }

    function mousemove(e) {
      if(mouse.down) {
        if(currentParticle) {
          mouse.vPosition = renderEngine.getMouse(e);
          // [TODO] 마우스 좌표
          currentParticle.setPosition(mouse.vPosition);
        }
      }
    }

    let mouse = {
      down: false,
      influence: 26,
      vPosition: new Vector(0, 0)
    }

    ;(function update(time) {
      // [힘 계산 -> 적분 -> 렌더링]

      // 1. 힘 계산
      cloth.particles.forEach((particle, i) => {
        particle.addForce(buoyancy);
        particle.updateFluidDrag();
        particle.updateSpring();
      });

      // 2. 적분
      cloth.particles.forEach((particle) => {
        particle.updateStep(TIME);
      });

      // 3. 렌더링
      renderEngine.render(cloth.particles);

      window.requestAnimFrame(update);
    })(0);

  },
  methods: {

  }
}

</script>

<style>
.container {
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
