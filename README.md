# cloth-simulation
천 휘두르기 시뮬레이션/렌더링

> 부제: 첫술에 배부르랴

## Build Setup
Nuxt 기본 프로젝트 세팅

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

## 기술 스택
- 물리 시뮬레이션
- Three.js(렌더링)

#### 물리 시뮬레이션
천 또는 그와 비슷한 물질의 움직임을 시뮬레이션하기 위해서는 파티클이 필요하다. 일반적으로 쓰이는 파티클은 랜덤한 무수히 많은 점들의 움직임을 계산하는데 천(cloth)을 만들기 위해서는 점과 점의 관계를 구성해 이들이 유기적으로 움직이도록 만들어야 한다. 그래서 파티클 뿐만 아니라 그 사이 관계를 가지는 클래스가 필요하고 이 클래스가 이번 물리 시뮬레이션의 핵심이며 내부 알고리즘은 훅의 법칙을 사용했다.

> 훅 법칙(영어: Hooke’s law)은 용수철과 같이 탄성이 있는 물체가 외력에 의해 늘어나거나 줄어드는 등 변형되었을 때 자신의 원래 모습으로 돌아오려고 저항하는 복원력의 크기와 변형의 정도의 관계를 나타내는 물리 법칙이다.
https://ko.wikipedia.org/wiki/%ED%9B%85_%EB%B2%95%EC%B9%99

먼저 기반이 되는 시뮬레이션 모델의 구조를 설명하고 훅의 법칙을 살펴보도록 하자.
```
//  시뮬레이션 모델 생성
for (var y = 0; y < cloth.clothW; y++) {
  for (var x = 0; x < cloth.clothH; x++) {
    let point = new Point(x * cloth.spacing - (cloth.clothW * cloth.spacing / 2), y * cloth.spacing - (cloth.clothH * cloth.spacing / 2));

    x!==0 && point.attach(cloth.particles[cloth.particles.length - 1], cloth.spacing); // X
    y!==0 && point.attach(cloth.particles[(x) + (y - 1) * (cloth.clothW)], cloth.spacing); // Y
    cloth.particles.push(point);
  }
}
```

정해진 가로, 세로 크기만큼 루프를 돌며 파티클을 생성하고 인접 파티클과의 관계를 정의한다.(attach)
2차원 배열을 생각하면 되며 각 점 당 좌측과 상단의 점과 연결된다. 이 연결된 관계는 훅의 법칙이 적용된다.
훅 법칙의 식은 F = -kx 인데 이 단순한 식을 그대로 쓸 수는 없고 실제론 감쇠 함수등이 포함된 물리엔진 도서에서 소개된 스프링-댐퍼 방정식이 사용되었다.


```
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
```

최상단의 springConstant는 스프링 상수로 스프링의 늘어나고 줄어드는 움직임의 정도를 조정하며 dampingConstant는 저항의 역할을 한다. 직접 조절할 수 있는 값은 마우스 움직임을 제외하면 이 값들이 유일하다.

아래부터는 2개의 점을 훅 법칙으로 묶는 코드다.
vr은 각 점의 속도를 차를 구한 상대 속도이며 r은 상대 위치다. 스프링 길이의 대한 변화값은 dl에 저장한다. r.magnitude()는 현재 두 점의 거리이고 restLength는 원래 거리인데 차를 구해 음수가 되면 두 점은 압축된 상태이므로 서로 밀어내며 양수일 경우라면 스프링이 늘어났다는 의미로 서로 잡아 당기게 된다.
여기까지 왔다면 식에 사용될 모든 변수를 구했다.
그 다음은 스프링-댐퍼 방정식에 대입하는 것인데 add, subtract, multiply 등의 함수는 벡터 연산 함수이다. 스프링-댐퍼 방정식을 통해 구한 결과 값 또한 벡터로 이 힘을 이용해 두 점의 위치를 갱신한다. .negative()는 벡터 값을 반대로 전환하는 것으로 움직임이 반대여야 하기 때문에 사용한다.

참고했던 자바스크립트 천 시뮬레이션 샘플들도 아마 내부적으론 비슷한 류의 식을 만들어 사용한 것으로 보인다. 다만 이를 그대로 가져다 사용할 수는 없었는데 중점적으로 참고했던 물리 엔진 책의 코드 구조에 대입하기 까다로웠기 때문이다. 샘플들의 코드는 움직임의 계산이 하나로 뭉쳐져 있다면 물리 엔진은 그렇지 않았다.
물리엔진의 구조는 [힘 계산 -> 적분 -> 렌더링]의 구조로 힘 계산과 적분과정이 나뉘어져 있어 물체에 중력, 부력과 같은 또 다른 힘을 쉽게 추가하거나 뺄 수 있다.
가까운 시일내로는 모르겠지만 언젠가 이런 인터랙션이 웹사이트에 들어가게 된다면 물리엔진 구조로 코드를 작성하고 익숙해 지는것이 좋지 않을까 생각해본다.

```
렌더링 루프의 구조를 표현한 의사 코드
requestAnimationFrame => {
  1. 힘 계산

  2. 적분

  3. 렌더링
}
```

힘 계산이 모두 끝났다면 다음은 적분을 할 차례다. 적분이라고 해서 거창한 식이 들어가는 것은 아니고 힘을 통해 구할 수 있는 가속도(F = m*a)를 적분하여 속도를 구하고 속도를 적분하여 갱신된 위치 값을 구하는 것이다.
이 위치 값이 매 루프마다 갱신되어 애니메이션 된다.

```
updateStep(time) {
  if(! this.isCurrent) {
    this.vPosition.addScaledVector(this.vVelocity, time);

    // F = m * a
    this.vAcceleration = this.vForce.multiply(this.mass);

    this.vVelocity.addScaledVector(this.vAcceleration, time);
  }

  this.vForce.clear();
}
```
addScaledVector는 벡터에 스칼라를 곱하는 함수이다. 이 함수를 통해 적분한다.
> 속도 = 가속도 * 시간
위치 = 속도 * 시간

여기서는 렌더링 루프마다 들어오는 임의의 변수를 시간으로 계산하고 있다. 이 값의 변화에 따라 전체적인 애니메이션의 빠르기가 변화한다. 값이 너무 크거나 작아지면 식의 오차범위가 초과하여 의도하지 않은 움직임이 발생하고 오브젝트가 사방팔방 난리가 난다. 참고로 이는 힘 계산할 때 스프링 상수와 댐핑 상수의 값 또한 마찬가지다.
isCurrent는 마우스로 선택되었다는 것을 의미하며 마우스 좌표에 종속되기에 계산에서 제외시킨다. 마지막으로 계산이 끝난 현재 힘은 초기화한다.

#### three.js(렌더링)
이제 절반이 끝났다. 처음 구현 시 렌더링은 canvas의 라인을 이용해서 표현했다. (마치 여러 자바스크립트 샘플들 처럼) 그러나 이것으로는 목표로 한 시뮬레이션을 표현할 수는 없기 때문에 three.js를 사용했다.
파티클과 그 관계가 그럭저럭 잘 작동하고 있었기 때문에 렌더링은 좀 수월할 줄 알았으나.. 이 또한 비슷한 시간이 걸린것 같다.

렌더링에 관련된 모든 코드는 render-engine.js에 들어가 있다.
init() 함수는 three.js의 scene, camera, light, object등 여러 필수 구성 요소들을 세팅한다. 먼저 모델의 기하구조를 생성하는 코드를 살펴보면 아래와 같이 PlaneGeometry로 천의 가로, 세로 크기를 파라미터로 넣고 정의한다.

```
// 모델의 뼈대, 기하구조를 생성
this.clothGeometry = new THREE.PlaneGeometry(cloth.clothW * cloth.spacing, cloth.clothH * cloth.spacing , cloth.clothW - 1, cloth.clothH - 1);

// 지오메트리와 머티리얼을 이용해 실제 그려질 메쉬를 생성하여 씬에 넣음
this.object = new THREE.Mesh(this.clothGeometry, clothMaterial);
```

코드상으론 그에 앞서 텍스쳐를 먼저 로드 하였는데 로드된 텍스쳐 매터리얼을 지오메트리와 함께 넣어 메시를 생성한다. 이것이 렌더링 될 천 오브젝트이다. 가로/세로 크기 정보는 앞선 물리 모델과 동일해야 한다. 물리 모델의 좌표와 정점이 1:1로 매핑될 것이기 때문이다.
이렇게 장면의 필수 구성요소들을 넣고 렌더러를 실행하면 화면이 그려질 것이다. 부력때문에 조금씩 둥둥 뜨게 되는데 마우스 입력이 있어야만 제대로된 천 시뮬레이션을 확인할 수 있다.

three.js에서 마우스 좌표는 canvas의 좌표계와 다르기 때문에 변형해 주어야 한다. 2가지 작업이 필요했는데 피킹(선택)과 마우스 좌표대로 선택된 정점 위치를 매핑해 주는 것이다. 피킹의 경우 canvas로 처음 그릴 때는 다른 코드를 참고하여 직접 구현했었는데 three.js에서는 raycaster라는 기능이 있어 마우스 피킹을 지원해 준다. 만약 요게 없었다면..
3D 피킹은 2D 피킹과 다르게 좌표 정보로 단순히 계산해서는 안되고 광선 추적 기법을 사용해야 한다...
아무튼 이것을 통해 정점을 선택할 수 있었다. 다음으로는 마우스 좌표로 선택된 정점 좌표를 갱신해 주어야 하는데 좌표계가 다르기 때문에 변형 작업이 필요하다.

```
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
```
확인해 보니 거의 공식과 같은 마우스 위치 정보 함수다.
마우스의 최초 위치 설정은 -1 ~ 1까지로 px단위의 좌표랑은 상이한데 이는 카메라 좌표계를 역으로 이용하기 위한 것으로 보인다. 이렇게 하여 원하는 픽셀 단위의 좌표를 가져와 그 위치로 선택된 정점의 위치를 갱신한다.
이렇게 되면 선택된 정점과 연결된 점이 따라 올 것이고 또 그에 연결된 점들이 순차적으로 따라오게 된다. 스프링-댐퍼 방정식에 의해 마치 스프링처럼 원래 길이보다 크면 줄어들고 작으면 늘어나는 힘의 작용을 통해 천 시뮬레이션이 완성된다.

## 문제점
가장 큰 문제는 마우스의 움직임이 시뮬레이션에 바로 적용하기에 너무 빠르다는 것이다. 정말 스프링처럼 쭈욱 늘어나는 현상을 막기 위해서 적분 과정에서 더 변수를 크게 하거나(시간 변수를 크게) 스프링-댐퍼 방정식의 상수들을 크게 하면 시뮬레이션의 오차범위를 벗어나 오브젝트가 난리치며 사라진다.
확인해 보니 여러 물리 시뮬레이션의 숙제같은 문제점이라고 하긴 하는데..어떻게 해결할 수 있을까?

## 참고 사이트
#### 물리 관련
- https://codepen.io/dissimulate/pen/eZxEBO
- http://andrew.wang-hoyer.com/experiments/cloth/
- https://burakkanber.com/blog/physics-in-javascript-car-suspension-part-1-spring-mass-damper/

#### 렌더링 관련
- https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene (기초 렌더링)
- https://riptutorial.com/three-js/example/17088/object-picking---raycasting (오브젝트 피킹/선택)
- https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z (마우스의 월드 좌표 구하기)
- https://stackoverflow.com/questions/29583881/raycaster-intersection-isnt-accurate-after-moving-vertices (움직이는 객체의 위치 정보 갱신)

## 참고 도서
- 게임 개발자를 위한 물리 (spring.js의 update() 메서드 알고리즘)
- 게임 물리 엔진 개발
