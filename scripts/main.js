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
particles,
count,
gravityConst;

// Setup
domElement = document.getElementById('threeTarget');
roomLength = 1000;
particles = [];
count = 100;
gravityConst = 30;
stats = new Stats();

domElement.appendChild( stats.dom );

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
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
roomMaterial = new THREE.MeshLambertMaterial( { color: 0x555555,side: THREE.BackSide, wireframe: false} );
roomMesh = new THREE.Mesh(roomGeometry, roomMaterial);
scene.add(roomMesh);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

Atom = function() {
  // this.size = 5;
  this.size = random(5, 15);
  this.mass = Math.PI * this.size * this.size * this.size * 0.001;
  var randomMax = 10;
  var geometry = new THREE.SphereBufferGeometry(this.size, 32, 32);
  var material = new THREE.MeshPhongMaterial({ color: 'hsl(' + random(0, 360) + ', 70%, 60%)' });
  this.mesh = new THREE.Mesh(geometry, material);
  this.mesh.position.set(
    random( - (roomLength / 2) + this.size, (roomLength / 2) - this.size),
    random( - (roomLength / 2) + this.size, (roomLength / 2) - this.size),
    random( - (roomLength / 2) + this.size, (roomLength / 2) - this.size),
  );
  this.acceleration = new THREE.Vector3(0, 0, 0);
  // this.acceleration = new THREE.Vector3(random(- randomMax, randomMax), random(- randomMax, randomMax), random(- randomMax , randomMax));
  this.velocity = new THREE.Vector3(0, 0, 0);
}

Atom.prototype.update = function() {
  this.velocity.add(this.acceleration);
  // this.velocity.clampLength(0, 50);
  this.mesh.position.add(this.velocity);
  this.acceleration.multiplyScalar(0);
}

Atom.prototype.applyForce = function(force) {
  var f = force.clone();
  f.divideScalar(this.mass);
  this.acceleration.add(f);
}

Atom.prototype.bounceWalls = function() {
  // right wall
  const velocityDamp = -1;
  const scalerDamp = 0.8;
  if (this.mesh.position.x > roomLength / 2 - this.size) {
    this.velocity.x *= velocityDamp;
    this.velocity.multiplyScalar(scalerDamp);
    this.mesh.position.x = roomLength / 2 - this.size;
  }
  // left wall
  if (this.mesh.position.x < - roomLength / 2 + this.size) {
    this.velocity.x *= velocityDamp;
    this.velocity.multiplyScalar(scalerDamp);
    this.mesh.position.x = - roomLength / 2 + this.size;
  }
  // top wall
  if (this.mesh.position.y > roomLength / 2 - this.size) {
    this.velocity.y *= velocityDamp;
    this.velocity.multiplyScalar(scalerDamp);
    this.mesh.position.y = roomLength / 2 - this.size;
  }
  // bottom wall
  if (this.mesh.position.y < - roomLength / 2 + this.size) {
    this.velocity.y *= velocityDamp;
    this.velocity.multiplyScalar(scalerDamp);
    this.mesh.position.y = - roomLength / 2 + this.size;
  }
  // back wall
  if (this.mesh.position.z < - roomLength / 2 + this.size) {
    this.velocity.z *= velocityDamp;
    this.velocity.multiplyScalar(scalerDamp);
    this.mesh.position.z = - roomLength / 2 + this.size;
  }
  // front wall
  if (this.mesh.position.z > roomLength / 2 - this.size) {
    this.velocity.z *= velocityDamp;
    this.velocity.multiplyScalar(scalerDamp);
    this.mesh.position.z = roomLength / 2 - this.size;
  }
}

Atom.prototype.attract = function(atom) {
  if (atom !== this) {
    var force = atom.mesh.position.clone();
    force.sub(this.mesh.position);
    var distance = force.length();
    force.normalize();
    if (distance > this.size + atom.size) {
      var strength = (gravityConst * this.mass * atom.mass) / (distance * distance);
      force.multiplyScalar(strength);
      return force;
    }
  }
  return new THREE.Vector3(0, 0, 0);
}

// dust = new Atom();
// scene.add(dust.mesh);
// console.log(dust);

for (var i = 0; i < count; i++) {
  var newAtom = new Atom();
  particles.push(newAtom);
  scene.add(newAtom.mesh);
}

new THREE.OrbitControls(camera);

for (var i = 0; i < particles.length; i++) {
  for (var j = 0; j < particles.length; j++) {
    particles[i].attract(particles[j]);    
  }
}

function animate() {
  stats.begin();
  // dust.bounceWalls();
  // dust.update();
  for (let i = 0; i < particles.length; i++) {
    var sumForce = new THREE.Vector3(0, 0, 0);
    for (var j = 0; j < particles.length; j++) {
      var force = particles[i].attract(particles[j]);
      sumForce.add(force);
    }
    particles[i].applyForce(sumForce);
    particles[i].bounceWalls();
    // particles[i].checkArray(particles);
    particles[i].update();
  }
  stats.end();
  requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
animate();