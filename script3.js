// הגדרת משתנים
let scene, camera, renderer, player, cubes = [];
let playerSpeed = 0.1;
let cubeSpeed = 0.05;
let score = 0;
let hitCount = 0;
let boundery = 3;
let intervalId; // הגדרה של intervalId בהיקף הגלובלי
let newTime = 1500; //זמן ברירת מחדל ליצירת מטוסים
let deviceOrientation3a = { alpha: 0, beta: 0, gamma: 0 }; // משתנה לשמירת נתוני הטיית המכשיר
let isMobile = true;

function isMobileDevice() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile;
}
  

// אתחול סצנה, מצלמה ורנדר
function init() {
    isMobile = isMobileDevice();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 4); // שינוי מיקום המצלמה
    camera.lookAt(0, 0, -10); // כיוון המצלמה למרכז הסצנה

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

	// יצירת DirectionalLight
	const directionalLight = new THREE.DirectionalLight(0xf0f0ff, 1); // צבע לבן, עוצמה 1
	// מיקום האור
	directionalLight.position.set(15, 5, 5); // מיקום האור ב-x, y, z
	// הוספת האור לסצנה
	scene.add(directionalLight);
	
	// יצירת HemisphereLight
	const hemisphereLight = new THREE.HemisphereLight(0xffffcc, 0x080820, 1);
	// הוספת האור לסצנה
	scene.add(hemisphereLight);

	// יצירת מטוס שחקן
    player = createAirplane();
	
    scene.add(player);

    if (isMobile) {
        // טיפול באירועי הטיית מכשיר
        window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
        // טיפול באירועי מקלדת
        document.addEventListener('keydown', onKeyDown, false);
    }

    // יצירת קוביות
    // setInterval(createCube, 1000);
    intervalId = setInterval(createEnemyAirplane, newTime); // שמירה של מזהה ה-interval במשתנה הגלובלי

    animate();
}

// פונקציה ליצירת מטוס
function createAirplane() {
    const airplane = new THREE.Group();

    // גוף המטוס
    const bodyGeometry = new THREE.BoxGeometry(0.2, 0.2, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xdd0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    airplane.add(body);

    // כנפיים
    const wingGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.2);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const wing1 = new THREE.Mesh(wingGeometry, wingMaterial);
    wing1.position.y = 0.15;
    airplane.add(wing1);

    const wing2 = new THREE.Mesh(wingGeometry, wingMaterial);
    wing2.position.y = -0.15;
    airplane.add(wing2);

    // זנב
    const tailGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.1);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x88ff00 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = 0.35;
	tail.position.y = 0.1;

    airplane.add(tail);

    return airplane;
}

// פונקציית אנימציה
function animate() {
    requestAnimationFrame(animate);

    // תנועת קוביות
    cubes.forEach(cube => {
        cube.position.z += cubeSpeed;
        if (cube.position.z > 5) {
            // קוביה עברה את השחקן מאחור
            scene.remove(cube);
            cubes.splice(cubes.indexOf(cube), 1);
            score++;
            // console.log("Score: " + score);
        } else if (checkCollision(player, cube)) {
            // התנגשות עם שחקן
            playSound();
            scene.remove(cube);
            cubes.splice(cubes.indexOf(cube), 1);
        }
    });
	
    // עדכון מידע על המסך
    updateInfo();
    checkStatus();
    
    // עדכון מיקום השחקן בהתאם להטיית המכשיר
    if (isMobile) {
        updatePlayerPositionByOrientation();
    }
    
    renderer.render(scene, camera);
}

// פונקציה לבדיקת סטטוס המשחק
function checkStatus() {
    if (hitCount >= 10) {
        gameOver();
    }
    if (score == 10) {
        changeEnemySpawnRate(1000); // קצב חדש לאחר 10 נקודות
    }
    if (score == 20) {
        changeEnemySpawnRate(500); // קצב חדש לאחר 20 נקודות
    }
}

// פונקציה לשינוי קצב יצירת מטוסי אויב
function changeEnemySpawnRate(newTime) {
    clearInterval(intervalId); // ניקוי ה-interval הקיים
    intervalId = setInterval(createEnemyAirplane, newTime); // יצירת interval חדש עם הזמן החדש
}

// פונקציה להפסקת המשחק והצגת "Game Over"
function gameOver() {

    if (isMobile) {
        // עצירת הטיפול באירועי הטיית מכשיר
        window.removeEventListener('deviceorientation', handleOrientation, true);
    } else {
        // עצירת הטיפול באירועי מקלדת
        document.removeEventListener('keydown', onKeyDown, false);
    }
    
    // הסתרת כל המטוסים הקיימים
    cubes.forEach(cube => {
        scene.remove(cube);
    });
    cubes = []; // ריקון המערך

    // עצירת האנימציה
    // ביצוע באמצעות הסרת interval
    clearInterval(intervalId);

    // הצגת "Game Over" על המסך
    const gameOverDiv = document.createElement('div');
    gameOverDiv.id = 'gameOver';
    gameOverDiv.style.position = 'absolute';
    gameOverDiv.style.top = '50%';
    gameOverDiv.style.left = '50%';
    gameOverDiv.style.transform = 'translate(-50%, -50%)';
    gameOverDiv.style.fontSize = '48px';
    gameOverDiv.style.direction = 'rtl';
    gameOverDiv.style.fontFamily = '48px';
    gameOverDiv.style.color = 'red';
    gameOverDiv.style.fontWeight = 'bold';
    gameOverDiv.textContent = 'אתה מת!!!';
    document.body.appendChild(gameOverDiv);
}


// פונקציה ליצירת מטוס אויב
function createEnemyAirplane() {
    const airplane = new THREE.Group();
    const EnemyColor = Math.random() * 0xffffff; // צבע אקראי

    // גוף המטוס (ארוך יותר)
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: EnemyColor }); 
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    airplane.add(body);

    // כנף ראשית
    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.4);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: EnemyColor }); 
    const wing = new THREE.Mesh(wingGeometry, wingMaterial);
    wing.position.y = 0.2;
    wing.position.z = 0.3;
    airplane.add(wing);

    // זנב אנכי
    const verTailGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const verTailMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // ירוק
    const verTail = new THREE.Mesh(verTailGeometry, verTailMaterial);
    verTail.position.z = -0.8;
    verTail.position.y = 0.35;
    airplane.add(verTail);

    // זנב אופקי
    const tailGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.2);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -0.8;
    airplane.add(tail);

    // מיקום וסיבוב אקראי
    airplane.position.x = Math.random() * boundery * 2 - boundery;
    airplane.position.z = -25;
    // airplane.rotation.y = Math.PI; // לסובב את המטוס שיטוס לכיוון השחקן 
    scene.add(airplane);
    cubes.push(airplane);
}


// פונקציה ליצירת קוביה
function createCube() {
	
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const color = Math.random() * 0xffffff; // צבע אקראי
    const material = new THREE.MeshPhongMaterial({ color: color });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = Math.random() * boundery*2 - boundery;
    cube.position.z = -25;
    scene.add(cube);
    cubes.push(cube);
}

// פונקציה לבדיקת התנגשות
function checkCollision(object1, object2) {
    const box1 = new THREE.Box3().setFromObject(object1);
    const box2 = new THREE.Box3().setFromObject(object2);
    return box1.intersectsBox(box2);
}

// פונקציה להשמעת צליל
function playSound() {
    const audio = new Audio('beep.wav');
    audio.play();
	hitCount++; // הגדלת מונה פגיעות
}

// פונקציה לטיפול באירועי מקלדת
function onKeyDown(event) {
    switch (event.keyCode) {
        case 37: // חץ שמאלה
            player.position.x -= playerSpeed;
			if (player.position.x < -boundery){ player.position.x = -boundery};
            break;
        case 39: // חץ ימינה
            player.position.x += playerSpeed;
			if (player.position.x > boundery){ player.position.x = boundery};
            break;
    }
}

// פונקציה לעדכון מידע על המסך
function updateInfo() {
    const infoDiv = document.getElementById('info');
    infoDiv.innerHTML = `מטוסי אוייב : ${cubes.length}
                        <br>נקודות: ${score}
                        <br>gama: ${deviceOrientation3a.gamma}
                        <br>פגיעות: ${hitCount}`;
}

// פונקציה לטיפול באירועי הטיית מכשיר
function handleOrientation(event) {
    deviceOrientation3a.alpha = event.alpha;
    deviceOrientation3a.beta = event.beta;
    deviceOrientation3a.gamma = event.gamma;
}

// פונקציה לעדכון מיקום השחקן בהתאם להטיית המכשיר
function updatePlayerPositionByOrientation() {
    // שימוש ב-gamma (הטיה מצד לצד) לשליטה בתנועה ימינה ושמאלה
    // gamma נע בין -90 ל-90, נמפה את זה לטווח של -boundery עד boundery
    let newX = (deviceOrientation3a.gamma / 90) * boundery;

    // הגבלת התנועה לגבולות
    if (newX < -boundery) {
        newX = -boundery;
    } else if (newX > boundery) {
        newX = boundery;
    }

    player.position.x = newX;
}
init();