<template>
  <section class="container">
    <div>
      <canvas id="canvas"></canvas>
    </div>
  </section>
</template>

<script>
import * as THREE from 'three';
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
    // const spacing = 20;
    // const clothX = 35;
    // const clothY = 35;
    const gravity = new Vector(0, 3.4);
    // const TIME = 0.016;
    const TIME = 0.05 * 0.5;

    this.spacing = 20;
    this.clothW = 25;
    this.clothH = 25;

    let particles = [];
    let currentParticle;
    const self = this;

    // 관계 생성
    for (var y = 0; y < this.clothW; y++) {
      for (var x = 0; x < this.clothH; x++) {
        let point = new Point(x*this.spacing, y*this.spacing);

        x!==0 && point.attach(particles[particles.length - 1], this.spacing); // X
        y!==0 && point.attach(particles[(x) + (y-1) * (this.clothW)], this.spacing); // Y
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
    // let ctx = canvas.getContext('2d');
    // ctx.strokeStyle = '#555';

    this.init(canvas);

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
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ctx.beginPath();
      // particles.forEach((particle) => {
      //   particle.draw();
      // });
      // ctx.stroke();

      for (var i = 0; i < particles.length; i++) {
        let v = particles[i].vPosition;

        self.clothGeometry.vertices[i].x = v.x;
        self.clothGeometry.vertices[i].y = v.y;
      }

      console.log(`particle: ${particles.length}, vertices: ${self.clothGeometry.vertices.length}`);

      //
      self.clothGeometry.verticesNeedUpdate  = true;
      self.clothGeometry.computeVertexNormals();
      self.renderer.render(self.scene, self.camera);

      // DEBUG
      //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      // if(currentParticle) {
        // console.log(currentParticle.vPosition);
      // }
      //★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

      window.requestAnimFrame(update);
    })(0);

  },
  methods: {
    init(canvas) {

      // scene
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xcce0ff);
      this.scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

      // camera
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
      this.camera.position.set(0, 0, 500);

      // light
      this.scene.add(new THREE.AmbientLight(0x666666));

      let light = new THREE.DirectionalLight(0xdfebff, 1);
      light.position.set(50, 200, 100);
      light.position.multiplyScalar(1.3);
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;

      let d = 300;

      light.shadow.camera.left = -d;
      light.shadow.camera.right = d;
      light.shadow.camera.top = d;
      light.shadow.camera.bottom = -d;

      light.shadow.camera.far = 1000;

      this.scene.add(light);

      var restDistance = 25;
			var xSegs = 10;
			var ySegs = 10;
			var clothFunction = plane(restDistance * xSegs, restDistance * ySegs);
      function plane(width, height) {
				return function (u, v, target) {
					var x = (u - 0.5) * width;
					var y = (v + 0.5) * height;
					var z = 0;
					target.set(x, y, z);
				};
			}

      var geometry = new THREE.BoxGeometry(1, 1, 1);
      var cubematerial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      var cube = new THREE.Mesh(geometry, cubematerial);
      this.scene.add(cube);

      var loader = new THREE.TextureLoader();
      var clothTexture = loader.load('textures/patterns/circuit_pattern.png');
      clothTexture.anisotropy = 16;
      var clothMaterial = new THREE.MeshLambertMaterial({
        map: clothTexture,
        side: THREE.DoubleSide,
        alphaTest: 0.5
      });

      this.clothGeometry = new THREE.PlaneGeometry(this.clothW * this.spacing, this.clothH * this.spacing , this.clothW - 1, this.clothH - 1);
      const material = new THREE.MeshBasicMaterial({ color: '#ff3030' });

      // cloth mesh
			this.object = new THREE.Mesh(this.clothGeometry, clothMaterial);
      this.object.position.set( 0, 0, 0 );
      this.object.castShadow = true;
      this.scene.add(this.object);

      // renderer
      this.renderer = new THREE.WebGLRenderer( { antialias: true, canvas: canvas } );
			this.renderer.setPixelRatio( window.devicePixelRatio );
			this.renderer.setSize( window.innerWidth, window.innerHeight );

      // this.renderer.gammaInput = true;
			// this.renderer.gammaOutput = true;
			// this.renderer.shadowMap.enabled = true;

    }
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
