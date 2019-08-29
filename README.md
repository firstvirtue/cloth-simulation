# cloth-simulation

> 천 휘두르기 시뮬레이션/렌더링
> 부제: 첫술에 배부르랴

## 기술 스택
- 피직스 시뮬레이션 - 훅의 법칙
파티클 - 파티클 사이의 스프링 관계식
- Three.js
파티클을 정점으로 만든 메시와 재질 렌더링
- Shader

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

## 참고
### 사이트
물리 관련
- https://codepen.io/dissimulate/pen/eZxEBO
- http://andrew.wang-hoyer.com/experiments/cloth/
- https://burakkanber.com/blog/physics-in-javascript-car-suspension-part-1-spring-mass-damper/

렌더링 관련
- https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene (기초 렌더링)
- https://riptutorial.com/three-js/example/17088/object-picking---raycasting (오브젝트 피킹/선택)
- https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z (마우스의 월드 좌표 구하기)
- https://stackoverflow.com/questions/29583881/raycaster-intersection-isnt-accurate-after-moving-vertices (움직이는 객체의 위치 정보 갱신)

### 도서
- 게임 개발자를 위한 물리 (spring.js의 update() 메서드 알고리즘)
- 게임 물리 엔진 개발
