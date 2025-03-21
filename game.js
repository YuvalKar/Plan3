const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

    // מצלמה
    const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 2, -10), scene);
    camera.setTarget(new BABYLON.Vector3(0, 2, 0));
    camera.attachControl(canvas, true);
    camera.speed = 0.3; // מהירות תנועה קדימה קבועה

    //camera.keysUp =;
    //camera.keysDown =;
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D
    camera.angularSensibility = 0;
    camera.rotation.x = 0;
    camera.rotation.z = 0;

    // רצפה
    const ground = BABYLON.MeshBuilder.CreateBox("ground", { width: 200, height: 0.1, depth: 200 }, scene);
    ground.rotation.x = Math.PI / 2;
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    ground.material = groundMaterial;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    // תאורה
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // צליל צפצוף
    const beepSound = new BABYLON.Sound("beep", "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3", scene); // החלף לקישור לקובץ צפצוף אמיתי

    const obstacles ='';
    const obstacleCreationInterval = 50; // יצירת מכשול כל 50 פריימים בערך
    let frameCounter = 0;
    const obstacleDistance = 50; // מרחק מהמצלמה ליצירת מכשול

    function createObstacle() {
        const isCube = Math.random() < 0.5;
        const size = Math.random() * 2 + 1;
        const radius = size / 2;
        const color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        let obstacle;

        if (isCube) {
            obstacle = BABYLON.MeshBuilder.CreateBox("obstacle", { size: size }, scene);
            obstacle.physicsImpostor = new BABYLON.PhysicsImpostor(obstacle, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.5 }, scene);
        } else {
            obstacle = BABYLON.MeshBuilder.CreateSphere("obstacle", { diameter: radius * 2 }, scene);
            obstacle.physicsImpostor = new BABYLON.PhysicsImpostor(obstacle, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.5 }, scene);
        }

        const obstacleMaterial = new BABYLON.StandardMaterial("obstacleMaterial", scene);
        obstacleMaterial.diffuseColor = color;
        obstacle.material = obstacleMaterial;

        const x = Math.random() * 30 - 15;
        const z = camera.position.z + obstacleDistance;
        obstacle.position.x = x;
        obstacle.position.y = isCube ? size / 2 : radius;
        obstacle.position.z = z;
        obstacles.push(obstacle);

        obstacle.physicsImpostor.registerOnPhysicsCollide(camera.physicsImpostor, function (main, collided) {
            beepSound.play();
            // כאן תוכל להוסיף לוגיקה נוספת לאחר התנגשות
        });
    }

    camera.physicsImpostor = new BABYLON.PhysicsImpostor(camera, BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 1, restitution: 0 }, scene);
    //camera.physicsImpostor.physicsBody.setAngularFactor(new CANNON.Vec3(0, 0, 0));

    scene.onBeforeRenderObservable.add(() => {
        camera.position.z += camera.speed;

        frameCounter++;
        if (frameCounter % obstacleCreationInterval === 0) {
            createObstacle();
            frameCounter = 0;
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (obstacles[i].position.z < camera.position.z - 20) {
                obstacles[i].dispose();
                obstacles.splice(i, 1);
            }
        }
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});