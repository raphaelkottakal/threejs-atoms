var stats,
scene,
camera,
renderer,
domElement,
Atom,
dust,
roomLength,
roomGeometry,
roomMaterial,
roomMesh,
lampOne,
lampTwo,
ambientLight,
particles;

// Setup
domElement = document.getElementById('threeTarget');
roomLength = 1000;
particles = [];
stats = new Stats();

domElement.appendChild( stats.dom );

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = roomLength

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
domElement.appendChild(renderer.domElement);

// Lighting
ambientLight = new THREE.AmbientLight( 0xffffff, 0.25 );

lampOne = new THREE.PointLight( 0xffffff, 0.375 );
lampOne.position.set( roomLength / 3, 0, roomLength / 3 );

lampTwo = new THREE.PointLight( 0xffffff, 0.375 );
lampTwo.position.set( - roomLength / 3, 0, roomLength / 3 );

scene.add( ambientLight );
scene.add( lampOne );
scene.add( lampTwo );
scene.add( new THREE.PointLightHelper( lampOne, 5 ) );
scene.add( new THREE.PointLightHelper( lampTwo, 5 ) );



// Make room
roomGeometry = new THREE.BoxBufferGeometry( roomLength, roomLength, roomLength)
roomMaterial = new THREE.MeshLambertMaterial( { color: 0x00aaaa,side: THREE.BackSide, wireframe: false} );
roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
scene.add(roomMesh);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

Atom = function() {
  this.size = 10;
  var randomMax = 10;
  var geometry = new THREE.SphereBufferGeometry(this.size, 32, 32);
  var material = new THREE.MeshPhongMaterial({ color: 'hsl(' + random(0, 360) + ', 100%, 60%)' });
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.set(
    random( - (roomLength / 2) + this.size, (roomLength / 2) - this.size),
    random( - (roomLength / 2) + this.size, (roomLength / 2) - this.size),
    random( - (roomLength / 2) + this.size, (roomLength / 2) - this.size),
  );
  // this.acceleration = new THREE.Vector3(0, 0, 0);
  this.acceleration = new THREE.Vector3(random(- randomMax, randomMax), random(- randomMax, randomMax), random(- randomMax , randomMax));
  this.velocity = new THREE.Vector3(0, 0, 0);
}

Atom.prototype.update = function() {
  this.velocity.add(this.acceleration);
  this.velocity.clampLength(0, 10);
  this.mesh.position.add(this.velocity);
  this.acceleration.multiplyScalar(0);
}

Atom.prototype.bounceWalls = function() {
  // right wall
  if (this.mesh.position.x > roomLength / 2 - this.size) {
    this.velocity.x *= -1;
    this.mesh.position.x = roomLength / 2 - this.size;
  }
  // left wall
  if (this.mesh.position.x < - roomLength / 2 + this.size) {
    this.velocity.x *= -1;
    this.mesh.position.x = - roomLength / 2 + this.size;
  }
  // top wall
  if (this.mesh.position.y > roomLength / 2 - this.size) {
    this.velocity.y *= -1;
    this.mesh.position.y = roomLength / 2 - this.size;
  }
  // bottom wall
  if (this.mesh.position.y < - roomLength / 2 + this.size) {
    this.velocity.y *= -1;
    this.mesh.position.y = - roomLength / 2 + this.size;
  }
  // back wall
  if (this.mesh.position.z < - roomLength / 2 + this.size) {
    this.velocity.z *= -1;
    this.mesh.position.z = - roomLength / 2 + this.size;
  }
  // front wall
  if (this.mesh.position.z > roomLength / 2 - this.size) {
    this.velocity.z *= -1;
    this.mesh.position.z = roomLength / 2 - this.size;
  }
}

dust = new Atom();
scene.add(dust.mesh);
console.log(dust);

for (var i = 0; i < 100; i++) {
  var newAtom = new Atom();
  particles.push(newAtom);
  scene.add(newAtom.mesh);
}

new THREE.OrbitControls(camera);

function animate() {
  stats.begin();
  dust.bounceWalls();
  dust.update();
  for (let i = 0; i < particles.length; i++) {
    particles[i].bounceWalls();
    particles[i].update();
  }
  stats.end();
  requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();