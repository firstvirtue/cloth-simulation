
'use strict';
import * as THREE from 'three';

class RenderEngine {
  constructor() {

  }

  init(canvas, cloth) {
    //  three.js 초기화
    // scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcce0ff);
    this.scene.fog = new THREE.Fog(0xcce0ff, 500, 10000);

    // camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 10, 10000);
    this.camera.lookAt(this.scene.position);
    this.camera.position.set(0, 0, 1000);

    // light
    this.setDirectionalLight();
    // this.setPointLight();

    // 모델에 입힐 이미지 텍스쳐를 로드한다.
    // [TODO] Material을 수정하여 사실적인 질감을 줄 수 있음.
    let loader = new THREE.TextureLoader();
    let clothTexture = loader.load('textures/patterns/black-linen.png');
    clothTexture.anisotropy = 16;
    clothTexture.wrapS = THREE.RepeatWrapping;
    clothTexture.wrapT = THREE.RepeatWrapping;
    clothTexture.magFilter = THREE.NearestFilter;
    let clothMaterial = new THREE.MeshPhongMaterial({
      map: clothTexture,
      specular: 0x222222,
      side: THREE.DoubleSide,
      shininess: 30,
      transparent: true,
      flatShading: true
    });

    // 모델의 뼈대, 기하구조를 생성
    this.clothGeometry = new THREE.PlaneGeometry(cloth.clothW * cloth.spacing, cloth.clothH * cloth.spacing , cloth.clothW - 1, cloth.clothH - 1);

    // 지오메트리와 머티리얼을 이용해 실제 그려질 메쉬를 생성하여 씬에 넣음
    this.object = new THREE.Mesh(this.clothGeometry, clothMaterial);
    this.object.position.set(0, 0, 0);
    this.object.castShadow = true;
    this.scene.add(this.object);

    let geometry = new THREE.BoxBufferGeometry(100, 100, 100);
    let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 10);
    // this.scene.add(mesh);

    // 렌더러 선언
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.raycaster = new THREE.Raycaster();
    this.mouse = { x: 0, y: 0 };
  }

  setDirectionalLight() {
    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(0, 200, 500);
    this.light.target.position.set( 0, 0, 0);
    this.scene.add(this.light);
  }

  setPointLight() {
    let bulbGeometry = new THREE.SphereBufferGeometry( 14.02, 16, 8 );
		let bulbLight = new THREE.PointLight( 0xffee88, 1, 100000000, 1 );
		let bulbMat = new THREE.MeshStandardMaterial({
			emissive: 0xffffee,
			emissiveIntensity: 1,
			color: 0x000000
		});
		bulbLight.add(new THREE.Mesh( bulbGeometry, bulbMat ));
		bulbLight.position.set( 0, 200, 20 );
		bulbLight.castShadow = true;

    this.light = bulbLight;
    this.light.position.set(10, 200, 100);
    this.scene.add(this.light);
  }

  render(particles) {

    // light
    // let time = Date.now() * 0.0005;
		// this.light.position.y = Math.cos(time) * 100.75 + 1.25;

    // cloth
    this.clothGeometry.verticesNeedUpdate  = true; //  vertex를 움직일 수 있는 플래그
    this.clothGeometry.computeVertexNormals();
    for (let i = 0; i < particles.length; i++) {
      let v = particles[i].vPosition;
      this.clothGeometry.vertices[i].x = v.x;
      this.clothGeometry.vertices[i].y = v.y;
      this.clothGeometry.vertices[i].z = v.z;
    }
    this.renderer.render(this.scene, this.camera);
  }

  raycast(e) {
    // 마우스 좌표를 통해 3D 모델이 피킹 되었는지를 판별
    this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 버텍스 위치가 움직이기 때문에 raycater가 재계산 할 수 있도록 초기화 해야 한다고 함
    this.clothGeometry.boundingSphere = null;
    this.clothGeometry.boundingBox = null;
    // let intersects = this.raycaster.intersectObjects(this.scene.children);
    let intersects = this.raycaster.intersectObject(this.object);

    if(intersects.length > 0) {
      return intersects[0];
    }
  }

  getMouse(e) {
    let vec = new THREE.Vector3();
    let pos = new THREE.Vector3();

    vec.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      - (e.clientY / window.innerHeight) * 2 + 1,
      0.5
    );

    vec.unproject(this.camera);
    vec.sub(this.camera.position).normalize();
    let distance = - this.camera.position.z / vec.z;
    pos.copy(this.camera.position).add(vec.multiplyScalar(distance));

    return {
      x: pos.x,
      y: pos.y,
      z: 0
    }
  }
}

export default RenderEngine;
