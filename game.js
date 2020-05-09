"use strict";

var ms_flg = 0;
var ms_start_x;
var ms_start_y;
var ms_cur_x = 0;
var ms_cur_y = 0;
var ms_last_x;
var ms_last_y;
var X = 0;
var Y = 1;
var Z = 2;

var isActive = 1;
var debug = 0;
var debug_mode1 = 0;
var camera_default_x;
var camera_default_y;
var camera_default_z;

var cam_rot_y = 0;
var cam_rot_x = 0;
var cam_rot_z = 0;
var cam_vec_y = 0;
var cam_vec_x = 0;

//操作
var camera_scale = 1.0;

var load_flag = 0;
var chr_mesh;
var chr_anim = new Array();
var obj_mesh = new Array();
var eye_mesh = new Array(2);
var eye_mirror = new Array(2);
var astro_mesh;
var helper,ikHelper;
var effect;
var chr_x = 0;
var chr_y = 0;
var chr_z = 0;
var chr_default_x = 0;
var chr_default_y = 0;
var chr_default_z = 0;
var key_a,key_s,key_d,key_w,key_q,key_e,key_shift,key_sp;
var old_q,old_a,old_w,old_s,old_e,old_d,old_sp;
var count = 0;
var initFlag = 0;
var scene;
var camera;
var renderer;
var clock = new THREE.Clock();;
//var physicsHelper;
//var chr_physics;
var loader;
var isVR=1;
var user;
var eye_texture;
var loading_count = 0;

var astro_layer = new Array(3*10);
var action_type=1;
var action_count=0;

const ACTION_DELAY = -500;	//次のアクションまでの待機時間
const ACTION_YUBISASI	= action_type++;	//指さし
const ACTION_AKUBI		= action_type++;	//あくび
const ACTION_AIDUCHI	= action_type++;	//相づち
const ACTION_SMILE		= action_type++;	//にっこり（手ひらひら）
const ACTION_NEAR_START	= action_type++;	//すり寄り
const ACTION_NEAR_END	= action_type++;	//戻る
const ACTION_SLEEP		= action_type++;	//おねむ
const ACTION_NOBI		= action_type++;	//のび
const ACTION_KAKIKAKI	= action_type++;	//頭かく
const ACTION_TOKIMEKI	= action_type++;	//ときめき
const ACTION_TERE		= action_type++;	//照れ
const ACTION_GOMEN		= action_type++;	//ごめん
const ACTION_SACHIKO	= action_type++;	//謎スマイル
const ACTION_SKIRT		= action_type++;	//スカートすそ直し

action_type=0;

var faceCount=0;
const FACE_NORMAL	= faceCount++;	//真面目
const FACE_KOMARU	= faceCount++;	//
const FACE_SMILE	= faceCount++;	//
const FACE_ANGRY	= faceCount++;	//
const FACE_MAYU_UP	= faceCount++;	//
const FACE_MAYU_BT	= faceCount++;	//
const FACE_MABATAKI	= faceCount++;	//
const FACE_WARAU	= faceCount++;	//
const FACE_WINKL1	= faceCount++;	//
const FACE_WINKL2	= faceCount++;	//
const FACE_WINKR1	= faceCount++;	//
const FACE_WINKR2	= faceCount++;	//
const FACE_HAW		= faceCount++;	//目 ＞＜
const FACE_BIKKURI	= faceCount++;	//
const FACE_NAGOMI	= faceCount++;	//
const FACE_JITO		= faceCount++;	//
const FACE_EYE_S	= faceCount++;	//
const FACE_A		= faceCount++;	//
const FACE_I		= faceCount++;	//
const FACE_U		= faceCount++;	//
const FACE_O		= faceCount++;	//
const FACE_A2		= faceCount++;	//
const FACE_O2		= faceCount++;	//
const FACE_MOU1		= faceCount++;	//くち△
const FACE_MOU2		= faceCount++;	//くち∧
const FACE_MOU3		= faceCount++;	//くちω
const FACE_MOU4		= faceCount++;	//くちω開
const FACE_PERO		= faceCount++;	//
const FACE_EE		= faceCount++;	//えー
const FACE_NIYARI	= faceCount++;	//にやり
const FACE_HI1		= faceCount++;	//
const FACE_HI2		= faceCount++;	//
const FACE_HI3		= faceCount++;	//
const FACE_HI4		= faceCount++;	//
const FACE_CHEEK	= faceCount++;	//

//const width = 960;
//const height = 540;
var camera_x = 0;
var camera_y = 0;
var camera_z = 0;
var controller;//, controllerGrip, tempMatrix = new THREE.Matrix4();
var INTERSECTED;
var polyfill = new WebXRPolyfill();

var near_mode = 0;

var pointLight;
var directionalLight;
var lightHelper, shadowCameraHelper;

//local
/*
import { MMDLoader } from './three.js-master/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from './three.js-master/examples/jsm/animation/MMDAnimationHelper.js';
import { OutlineEffect } from './three.js-master/examples/jsm/effects/OutlineEffect.js';
import { MMDPhysics } from './three.js-master/examples/jsm/animation/MMDPhysics.js';
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './three.js-master/examples/jsm/webxr/XRControllerModelFactory.js';
import { Reflector } from './three.js-master/examples/jsm/objects/Reflector.js';
*/
//online
import { MMDLoader } from 'https://threejs.org/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'https://threejs.org/examples/jsm/animation/MMDAnimationHelper.js';
import { OutlineEffect } from 'https://threejs.org/examples/jsm/effects/OutlineEffect.js';
import { MMDPhysics } from 'https://threejs.org/examples/jsm/animation/MMDPhysics.js';
import { VRButton } from 'https://threejs.org/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'https://threejs.org/examples/jsm/webxr/XRControllerModelFactory.js';
import { Reflector } from 'https://threejs.org/examples/jsm/objects/Reflector.js';


var modelFile = "./okzmmd/okz.pmx";
//var modelFile = "./syaro/extra.pmx";
//var modelFile = "./okzmmd2/okz.pmd";
//var modelFile = "./mmkmmd/momoko.pmd";
//var modelFile = "./three.js-master/examples/models/mmd/miku/miku_v2.pmd";

//var stageFile = "./stage/stage.pmx";
//var stageFile = "./mmkmmd/momoko.pmd";
//var stageFile = "./gekijou/mio-lite.pmx";
var objFiles = [
	"touei.pmx",
	"wall.pmx",
	"sakura/sakura.pmx",
//	"watch/watch1.pmx",
	"marusofa/marusofa.pmx",
//	"sachiko/sachiko.pmx",
];
//vmdのファイルPATHとそれに対応するタグの配列
var vmdFiles = [
//	"./stand.vmd",
	"mmo_stand/stand2.vmd",
];
var objNum=0;
const OBJ_PROJECTOR = objNum++;		//投影機
const OBJ_WALL = objNum++;			//壁
const OBJ_SAKURA = objNum++;		//桜髪飾り
//const OBJ_WATCH = objNum++;		//腕時計
const OBJ_SOFA = objNum;			//ソファ

/*onload = function()*/{

	Ammo().then( function ( AmmoLib ) {
		Ammo = AmmoLib;
	} );

	init();
	animate();

	//ウィンドウの表示・非表示状態をチェック
	document.addEventListener('webkitvisibilitychange', function(){
	if ( document.webkitHidden ) {
		// 非表示状態
		isActive = 0;
	} else {
		// 表示状態
		isActive = 1;
	}
	}, false);

}




function init() {

	LoadingDisp();

	//非VR版
	if(window.location.search == "?noVR")
		isVR = 0;

	if(!isVR) {
		window.addEventListener('mousedown', mousedown, false );
		window.addEventListener('mouseup', mouseup, false );
		window.addEventListener('mousemove', mousemove, false );
		window.addEventListener('wheel', mousewheel, false );
		window.addEventListener('keydown',keydown, false);
		window.addEventListener('keyup',keyup, false);
	}

	// レンダラーを作成
	renderer = new THREE.WebGLRenderer({
//		antialias: true,
//		canvas: document.querySelector("#main_canvas")
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = false;
	if(isVR) {
		renderer.xr.enabled = true;
		renderer.xr.setReferenceSpaceType( 'local' );
		//renderer.outputEncoding = THREE.sRGBEncoding;	//なんか白っぽくなる
		
	}
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	//renderer.shadowMap.type = THREE.BasicShadowMap;
	
	
	// シーンを作成
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x000010 );

	user = new THREE.Object3D();
	scene.add( user );
	// カメラを作成
	camera = new THREE.PerspectiveCamera(	//(視野角, アスペクト比, near, far)
		((isVR != 0) ? 20 : 45),
		window.innerWidth / window.innerHeight,
		0.001,
		100000
	);

	camera_x = -4;
	camera_y = 28;	//chr_y
	camera_z = -14;

	user.position.set(camera_x, camera_y, camera_z);
//	camera.layers.enable( 1 );
	user.scale.set(20,20,20);	//カメラを大きくすることで視差が出る
	user.up = new THREE.Vector3(0,1,0);

	user.add(camera);
	scene.add(user);

	//キャラクターの初期位置
	chr_x = chr_default_x = camera_x + 8;
	chr_y = chr_default_y = camera_y - 19;
	chr_z = chr_default_z = camera_z + 0;

	// 箱を作成
/*	var texture = new THREE.TextureLoader().load( 'test.png' );

	const box_geo = new THREE.BoxGeometry(30, 30, 30);
	var geometry = new THREE.PlaneBufferGeometry( 10000, 10000, 32 - 1, 32 - 1 );
	geometry.rotateX( - Math.PI / 2 );

	var vertices = geometry.attributes.position.array;

	var i,j;
	for(j=0;j<15000;j++) {
		i = Math.floor(Math.random()*vertices.length/3)*3;

		vertices[ i + 1 ] += 10;

	}
	geometry.computeFaceNormals();
	geometry.computeVertexNormals();
	const material = new THREE.MeshStandardMaterial({
		map: texture
	});
	const box_material = new THREE.MeshStandardMaterial({
		color: 0xa0a0a0
	});
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

//	const mesh2 = new THREE.Mesh(box_geo, box_material);
//	scene.add(mesh2);
*/
	//天体
	if(0){
		var texture = new THREE.TextureLoader().load( '2981303_l.jpg' );
		var geometry = new THREE.SphereGeometry( 120, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {
			side: THREE.BackSide,
			map: texture,
			color: 0xffffff
		} );
		astro_mesh = new THREE.Mesh( geometry, material );
		astro_mesh.scale.z = 0.9;
		astro_mesh.rotation.x = Math.PI/2;
		scene.add( astro_mesh );
	}
	//じゅうたん
	if(0){
		var i;
		var texture = new THREE.TextureLoader().load( 'floor.png' );
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 10,10 );
		var geometry = new THREE.CircleGeometry( 100, 30 );
		var material = new THREE.MeshBasicMaterial( {
			side: THREE.FrontSide,
			map: texture,
//			transparent : true,
//			blending: THREE.AdditiveBlending,
		} );
/*		material.userData.outlineParameters = {	//effectのアウトラインを消す
			thickness: 0,
			color: [ 0, 0, 0 ],
			alpha: 0,
			visible: false,
			keepAlive: true
		};*/
		var mesh = new THREE.Mesh( geometry, material );
		mesh.rotation.set(Math.PI/-2,0,0);
		scene.add( mesh );
	}
	//壁
	if(0){
		var i;
		var texture = new THREE.TextureLoader().load( 'floor.png' );
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 10,3 );
		var geometry = new THREE.CylinderGeometry( 100, 100, 10, 16,1, false );
		var material = new THREE.MeshBasicMaterial( {
			side: THREE.BackSide,
			map: texture,
			color: 0x808080
		} );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(0,20,0);
		scene.add( mesh );
	}
	
	//目の上にかけるレイヤー
	if(1){
		var i;
		var geometry = new THREE.CircleGeometry( 0.24, 20 );
		var material = new THREE.MeshBasicMaterial( {
			side: THREE.FrontSide,
			transparent : true,
			blending: THREE.AdditiveBlending,
		} );
/*		material.userData.outlineParameters = {	//effectのアウトラインを消す
			thickness: 0,
			color: [ 0, 0, 0 ],
			alpha: 0,
			visible: false,
			keepAlive: true
		};*/
		for(i=0;i<2;i++) {
			if(0) {
				//実際に反射させたものを投影する。スマホだと重い
				eye_mirror[i] = new Reflector(
					geometry,
					{
						clipBias: 0.003,
						textureWidth: window.innerWidth/2,
						textureHeight: window.innerHeight/2,
						color: 0x303030
					}
				);
				eye_mirror[i].material.blending = THREE.AdditiveBlending;
				eye_mirror[i].material.transparent = true;
				eye_mesh[i] = eye_mirror[i];
			}
			else {
				eye_mesh[i] = new THREE.Mesh( geometry, material );
			}
			scene.add( eye_mesh[i] );
		}
		eye_texture = new Array(3);
		eye_texture[0] = new THREE.TextureLoader().load( 'eye_star.jpg' );
		eye_texture[0].repeat.set( 0.166, 0.1 );
		eye_texture[0].wrapS = eye_texture[0].wrapT = THREE.RepeatWrapping;

		eye_texture[1] = new THREE.TextureLoader().load( 'okzmmd/heart.png' );
		eye_texture[1].offset.set( 0,0 );

		eye_texture[2] = new THREE.TextureLoader().load( 'eye_kira.jpg' );
		eye_texture[2].repeat.set( 0.5, 0.5 );
		eye_texture[2].wrapS = eye_texture[2].wrapT = THREE.RepeatWrapping;
//		eye_texture[2].offset.set( 0,0 );

		//目のテクスチャ更新
		EyeTextureUpdate(0);
	}
	LoadingDisp();
	var stars_tex = [
		new THREE.TextureLoader().load( 'star_white4.png' ),
		new THREE.TextureLoader().load( 'star_purple4.png' ),
		new THREE.TextureLoader().load( 'star_red4.png' ),
		new THREE.TextureLoader().load( 'star_green4.png' ),
	];
	var i,j,k;
	for(k=0;k<3;k++) {
	for(j=0;j<10;j++) {
		// 形状データを作成
		const geometry = new THREE.Geometry();
		// 配置する個数
		var LENGTH = 100+k*800;
		if(j == 9) LENGTH = 5000+k*40000;
		for (i = 0; i < LENGTH; i++) {
			var rx,ry,l;
			rx = Math.random() * Math.PI * 2;
			ry = Math.random() * Math.PI * 2;
			if(j==9 && ry > Math.PI*0.95) ry *= -1;
			l  = 200 + Math.random() * 300 + j * 450;
			geometry.vertices.push(new THREE.Vector3(
				Math.sin(rx) * l,
				Math.sin(ry) * l,
				Math.cos(ry) * Math.cos(rx) * l
			));
		}
		var color = [
			0xffa000,
			0x90f0ff,
			0xffffff,

			0x804000,
			0x608080,
			0x808080,
		];
		// マテリアルを作成
		var material;
		if(j <= 5) {
			material = new THREE.PointsMaterial({
				// 一つ一つのサイズ
				size: (j < 2) ? 0.2 : 0.05,
				// 色
				color: 0xffffff,
				map: stars_tex[Math.floor(Math.random()*4)],
				blending: THREE.AdditiveBlending,
				transparent: true
			});
		}
		else {
			material = new THREE.PointsMaterial({
				// 一つ一つのサイズ
				size: (j>=8) ? 0.5 : 0.02,
				// 色
				color: (j==9) ? color[k+3] : color[k],
			});
		}

		astro_layer[k*10+j] = new THREE.Points(geometry, material);
		scene.add(astro_layer[k*10+j]);
	}
	}
	LoadingDisp();
	

	// 平行光源
	directionalLight = new THREE.DirectionalLight(
		0xffffff,0.6
	);
	directionalLight.position.set(0, 35, -25);
	// シーンに追加
//	scene.add(directionalLight);

	//アンビエントの強度を上げてポイントライトの強度を下げると影が薄くなる
	const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
	scene.add(ambientLight);	

	pointLight = new THREE.PointLight(0xFFFFFF, 0.15, 200, 1.2);	//(色, 光の強さ, 距離, 光の減衰率)
	scene.add(pointLight);

	if(1){
		var light = pointLight;
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 1024*2;  // default
		light.shadow.mapSize.height = 1024*2; // default
		light.shadow.camera.near = 0.1;      // default
		light.shadow.camera.far = 200;     // default
		light.shadow.camera.top = -10;
		light.shadow.camera.bottom = 10;
		light.shadow.camera.left = -10;
		light.shadow.camera.right = 10;
//		light.shadow.bias = 0.0;
		//Create a helper for the shadow camera (optional)
		//shadowCameraHelper = new THREE.CameraHelper( light.shadow.camera );
		//scene.add( shadowCameraHelper );

//		lightHelper = new THREE.DirectionalLightHelper( light );
		//lightHelper = new THREE.PointLightHelper( light );
		//scene.add( lightHelper );
	}

	//var world = new CANNON.World(); // world が物理世界になる
	//world.gravity.set(0, 0, -9.82); // m/s² // x y z それぞれにかかる力（重力）を設定
	
	if(0){
		var geometry = new THREE.BoxBufferGeometry( 0.15, 0.15, 0.15 );

		for ( var i = 0; i < 100; i ++ ) {

			var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

			object.position.x = Math.random() * 60 - 30;
			object.position.y = Math.random() * 30;
			object.position.z = Math.random() * 60 - 30;
			object.scale.set(20,20,20);

			scene.add(object);
		}
	}

	load_flag = 0;
	effect = new OutlineEffect( renderer );
	effect.enabled = true;
	effect.setSize(window.innerWidth,window.innerHeight);
	// モデルとモーションの読み込み準備
	helper = new MMDAnimationHelper( {
		afterglow: 2.0
	} );
	//helper.sharedPhysics = true;

	loader = new MMDLoader();

//		loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {
	loader.load( modelFile, /*vmdFiles,*/ function ( mmd ) {

		chr_mesh = mmd;//.mesh;			//SkinnedMesh
//			chr_mesh.scale.set(10,10,10);
		scene.add( chr_mesh );

		/*helper.add(chr_mesh, {
			animation: mmd.animation,
			physics: true
		});
		/*helper.add( chr_mesh, {
			animation: mmd.animation,
			physics: true
		} );
		physicsHelper = helper.objects.get( chr_mesh ).physics.createHelper();
		chr_physics = helper.objects.get( chr_mesh ).physics;
		physicsHelper.visible = false;
		scene.add( physicsHelper );*/

		/*ikHelper = helper.objects.get( mmd ).ikSolver.createHelper();
		ikHelper.visible = false;
		scene.add( ikHelper );*/

		//helper.enable( 'animation', true );

		/*var radius = 1; // m
		var sphereBody = new CANNON.Body({
		mass: 5, // kg // massは重さ。
		position: new CANNON.Vec3(0, 0, 10), // m
		shape: new CANNON.Sphere(radius)  // shapeはthree.jsのものと同じ
		});*/
		load_flag |= 1;

	}, null, null );

	LoadingDisp();
	my_update();
}	//init()

function LoadEnd()
{
	LoadingDisp();
	document.body.appendChild( renderer.domElement );
	if(isVR) {
		document.body.appendChild( VRButton.createButton( renderer ) );
	}
	else {
		//スマホ対応
		window.addEventListener('touchstart', function(event) {
			event.preventDefault();
			onTouchDown(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
		}, {passive: false});
		window.addEventListener('touchmove', function(event) {
			event.preventDefault();
			onTouchMove(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
		}, {passive: false});
		window.addEventListener('touchend', function(event) {
			event.preventDefault();
			onTouchEnd();
		}, {passive: false});
	}
	window.addEventListener( 'resize', onWindowResize, false );
	WindowCheck();

}

function WindowCheck() {
	document.getElementById("MessageOut").innerHTML = "";
	if(isVR) {
		document.getElementById("MessageOut").innerHTML += "<font size=-1>リロードしても[ENTER VR]が出ないときは非対応の環境です</font><br>";
		if(window.innerWidth < window.innerHeight) {
			document.getElementById("MessageOut").innerHTML += "<font size=-1>焦点が合わない場合、自動回転を有効にし端末を横に向けてから始めてみてください</font><br>";
		}
	}
}

var animIndex=0;
var objIndex=0;
function animate() {
//	if(isVR)
		renderer.setAnimationLoop( render );
}

function ActionEnd() {
	action_type = 0;
	action_count = ACTION_DELAY;
	var i;
	for(i=0;i<faceCount;i++) {
		if(i==FACE_MABATAKI) continue;
		chr_mesh.morphTargetInfluences[i] = 0;
	}
}
function EyeTextureUpdate(type) {
	var i;
	//目のテクスチャ更新
	for(i=0;i<2;i++) {
		eye_mesh[i].material.map = eye_texture[type];
	}
}
function LoadingDisp() {
	document.getElementById("MessageOut").innerHTML = "Loading "+Math.floor((loading_count/8)*100)+"%<br>";
	loading_count++;
}
	
var adj_x=0;
var adj_y=0;
var adj_z=0;
var tickCount = 0;

function my_update() {
	if(!isVR) 
	{
//		requestAnimationFrame(my_update);
	}
	

	/*if(load_flag == (1|4)) {
		if(chr_anim.length >= vmdFiles.length) {
			load_flag |= 2;
		}
		else if(animIndex == chr_anim.length && loader) {
			loader.loadAnimation( [vmdFiles[animIndex]], chr_mesh, function ( vmd ) {

				chr_anim.push(vmd);
				//document.getElementById("debugOut").innerHTML += "animIndex="+chr_anim.length;
				
			}, null, null );
			animIndex++;
		}
		return;
	}*/
	load_flag |= 2;
	if(load_flag == (1|2)) {
		if(obj_mesh.length >= objFiles.length) {
			load_flag |= 4;
		}
		else if(objIndex == obj_mesh.length && loader) {
			loader.load( objFiles[objIndex], function ( mmd ) {

				obj_mesh.push(mmd);
				scene.add( mmd );

				helper.add( mmd, {
					physics: false
				} );
			});
			objIndex++;
			LoadingDisp();
		}
		return;
	}

	if(load_flag != (1|2|4) || Ammo == null) {
		return;
	}

//	if(chr_anim.length < vmdFiles.length) return;
//	document.getElementById("debugOut").innerHTML = "start";

	//ローディング終了（初回）
	if(initFlag == 0) {
		helper.add(chr_mesh, {
			animation: chr_anim,
//			ik: true,
			physics: false
		});
//		var ph = helper.objects.get( chr_mesh ).physics.createHelper();
//		helper.objects.get( chr_mesh ).physics.setGravity(0.98);
//		ph.visible = false;
//		scene.add( ph );

		/*ikHelper = helper.objects.get( chr_mesh ).ikSolver.createHelper();
		ikHelper.visible = false;
		scene.add( ikHelper );*/

//		document.getElementById("debugOut").innerHTML = "停止<br>";
//		selectAnimation(chr_mesh, 0, true);
		
//		helper.update(200);
//		helper.objects.get( chr_mesh ).physics.warmup(45);
//		stopAnimation(chr_mesh);

		//ソファの複製
		//ジオメトリが単一なのでコピペできるぽい
		var sofa_set = new Array();
		var clone_geo = obj_mesh[OBJ_SOFA].geometry.clone();
		var clone_mat = obj_mesh[OBJ_SOFA].material[0].clone();
		//床
		var yuka_geometry = new THREE.BoxGeometry( 200,5,20 );
		var yuka_texture = new THREE.TextureLoader().load( 'floor.png' );
		yuka_texture.wrapS = yuka_texture.wrapT = THREE.RepeatWrapping;
		yuka_texture.repeat.set( 10,1 );
		var yuka_material = new THREE.MeshPhongMaterial( {	//Basicだと影が映らない
			side: THREE.FrontSide,
			map: yuka_texture,
		} );

		var x,y;
		for(y=-7;y<=8;y++) {
			for(x=-8;x<=8;x++) {
				if(x == -5 || x == 5) continue;	//通路
				if(y == -1 && x >= -1 && x <= 1) continue;	//自分
				if(y >= 7 && x >= -1 && x <= 1) continue;	//投影機スペース
				var sofa_clone = new THREE.Mesh(clone_geo, clone_mat);
				sofa_set.push(sofa_clone);
				sofa_clone.position.set(
					(x/10)*110,
					(y+8)*3-5,
					(y/10)*160);
				sofa_clone.rotation.y = Math.PI;
//				sofa_clone.scale.x = 2.6;
//				sofa_clone.castShadow = true;
//				sofa_clone.receiveShadow = true;
				scene.add(sofa_clone);
			}
			//座席段差
			var yuka_mesh = new THREE.Mesh(yuka_geometry, yuka_material);
			yuka_mesh.position.set(0,(y+8)*3-8,(y/10)*160+1);
//			yuka_mesh.castShadow = true;
			if(y == -1){	//自分のいる段だけ有効
				yuka_mesh.receiveShadow = true;
			}
			scene.add(yuka_mesh);
		}
		obj_mesh[OBJ_WALL].scale.set(2.9, 1.8, 2.9);
		obj_mesh[OBJ_WALL].rotation.y = Math.PI;
		obj_mesh[OBJ_WALL].position.y = 30;
		
		obj_mesh[OBJ_PROJECTOR].position.set(0, 38, 120);
		obj_mesh[OBJ_PROJECTOR].rotation.y = Math.PI/2;
		obj_mesh[OBJ_PROJECTOR].scale.set(2.3,2.3,2.3);

		var mat = obj_mesh[OBJ_PROJECTOR].material[2].map;
		mat.wrapS = mat.wrapT = THREE.RepeatWrapping;
		mat.repeat.set( 2,1.5 );

		//shadow
		chr_mesh.castShadow = true;
		obj_mesh[OBJ_SOFA].receiveShadow = true;
///		obj_mesh[OBJ_SOFA].castShadow = true;
		directionalLight.target = chr_mesh;
		
		LoadEnd();		//ロード終わったのでUIの追加
		initFlag++;
	}

	var delta = clock.getDelta();
	tickCount += delta;
	if(tickCount > 5) tickCount = 5;
//	document.getElementById("debugOut").innerHTML = "delta="+tickCount;
	while(tickCount >= 1.0/60.0)
	{
		if(debug) {
			document.getElementById("debugOut").innerHTML = "";
			document.getElementById("debugOut").innerHTML = "adj "+adj_x+","+adj_y+","+adj_z+"<br>";
		}
	count++;
	tickCount -= 1.0/60.0;
	if(helper) {
		helper.update( 0.0166 );
	}
	if(debug) {
		if(!old_q && key_q) adj_x += 0.02;
		if(!old_a && key_a) adj_x -= 0.02;
		if(!old_w && key_w) adj_y += 0.02;
		if(!old_s && key_s) adj_y -= 0.02;
		if(!old_e && key_e) adj_z += 0.02;
		if(!old_d && key_d) adj_z -= 0.02;

		if(!old_sp && key_sp) {
			debug_mode1 = !debug_mode1;

			//視点変更
			if(debug_mode1 != 0) {
				camera_default_x = camera_x;
				camera_default_y = camera_y;
				camera_default_z = camera_z;
				camera_x = 4;
				camera_y = 26;	//chr_y
				camera_z = chr_default_z - 10;
				cam_rot_x = Math.PI*1.0
			}
			else {
				camera_x = camera_default_x;
				camera_y = camera_default_y;
				camera_z = camera_default_z;
				cam_rot_x = Math.PI*-0.5
			}
		}
	}
	old_q = key_q;
	old_a = key_a;
	old_w = key_w;
	old_s = key_s;
	old_e = key_e;
	old_d = key_d;
	old_sp = key_sp;

	//まばたきカウンタ
	var mabataki = count % 200;	//24以下

//	document.getElementById("debugOut").innerHTML = "";
	var target = chr_mesh;
	var neck_r = Math.sin(count/120) / 3.0;
	var neck_up = 0;
	var breath = Math.sin(count / 30);
	var armr = (breath)*-0.03;
	var arm_l1 = [-Math.PI/2*0.15-armr, 0,  Math.PI/2*0.4];				//肩
	var arm_l2 = [ Math.PI/2*0.15, Math.PI/2*(0.8), 0];					//ひじ
	var arm_l3 = [ Math.PI/2*0.2 , Math.PI/2*(0.2), -Math.PI/2*(0.4)];	//手首
	var arm_r1 = arm_l1.slice();
	var arm_r2 = arm_l2.slice();
	var arm_r3 = arm_l3.slice();
	var hand_par=[0,0];
	var free_koyubi = 0;
	var near_neck_r = 0.6 + Math.sin(count/180) / 8.0;
	var near_neck_up = -0.1;
	if(near_mode != 0) {
		neck_r = near_neck_r;
		neck_up = near_neck_up;
	}
	//目の向き
	var eye_xr = 0;
	var eye_yr = neck_r/10;
	//前屈み
	var kagami = 0;
		
	var mata = 1;	//股開き
	//ひざ
	var knee_xl = 0.65;	//X軸曲げ
	var knee_xr = 0.65;
	var knee_zl = Math.PI/2*0.1;	//左右
	var knee_zr = knee_zl;

	//スカートを座った状態で固定
	{
		var skirt_tbl = [
		[
			[Math.PI/2*-0.6/*0.0107*/,-0.0014,0.0009],
			[Math.PI/2*-0.55/*0.0088*/,-0.0039,-0.0063],
			[0.0023,-0.0025,-0.0095],
			[-0.003,0.0068,-0.0025],
			[-0.0115,-0.0021,-0.0006],
			[-0.0023,-0.0069,0.003],
			[0.002,0.0022,0.0102],
			[Math.PI/2*-0.55/*0.0088*/,0.0036,0.0073],
		],
		[
			[0.0166,0.0007,-0.0007],
			[-0.0003,-0.0078,0.0018],
			[-0.0009,0.0019,0.0116],
			[-0.0078,0.009,-0.0035],
			[-0.0231,0.0003,0.0016],
			[-0.008,-0.0098,0.0045],
			[0.0001,-0.0026,-0.0127],
			[-0.0001,0.0077,-0.0023],
		],
		[
			[-0.0204,0.0005,0.0002],
			[-0.0146,0.0006,0.014],
			[0.0024,0.002,-0.0061],
			[-0.0129,0.008,-0.0073],
			[0.0049,-0.0019,-0.0026],
			[-0.0141,-0.0104,0.0054],
			[-0.0004,0.0054,0.0066],
			[-0.0148,0.0007,-0.0135],
		],
		[
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
			[0,0,0],
		],
		];
		for(i=0;i<4;i++) {
			for(j=0;j<8;j++) {
				var obj = findBone(chr_mesh,"スカート_"+i+"_"+j,0);
				obj.rotation.set(skirt_tbl[i][j][0], skirt_tbl[i][j][1], skirt_tbl[i][j][2]);
			}
		}
	}
	//ランダムで足が動く
	if(action_count < 0) {	//アクションとかぶらないように待機中のみ
		var nk = 1;	//1->0->1
		if(action_count < ACTION_DELAY+60) {
		}
		else if(action_count < ACTION_DELAY+60+60) {
			nk = 1-(action_count - (ACTION_DELAY+60))/60;
		}
		else if(action_count < -60) {
			nk = 0;
		}
		else {
			nk = (action_count+60)/60;
		}
//		knee_xl *= nk;
//		knee_xr *= nk;

		knee_xl += ((Math.sin(count/30  )-1.0)*0.05)*(1-nk);
		knee_xr += ((Math.sin(count/30+1)-1.0)*0.05)*(1-nk);
	}
	
	//表情
	if(mabataki <= 24) {
		//目の動きだけ
		var mabataki2 = Math.abs(Math.sin(mabataki/12*Math.PI*1.0));
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] = mabataki2;
	}
	else {
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] = 0;
	}
	if(near_mode) {
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] *= 0.9;	//まばたき打ち消し
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] += 0.1;
		chr_mesh.material[ 23 ].opacity *= 0.99;		//morphTargetInfluencesによるマテリアルの変化がきかないので直接透明度をいじる
		chr_mesh.material[ 23 ].opacity += 0.01*0.6;
		chr_mesh.morphTargetInfluences[ FACE_NIYARI ] = 0.2;
	}
	else {
		chr_mesh.material[ 23 ].opacity *= 0.99;
		chr_mesh.material[ 23 ].opacity += 0.01*0.2;
	}
	
		
	//開始
	if(action_type == 0 && action_count >= 0) {
		if(count % 120 == 0) {	//120fに１回抽選
			var random_count = Math.floor(Math.random()*100);
			function Lot(count) {
				if(random_count < count && random_count >= 0) {
					random_count = -1;
					return true;
				}
				random_count -= count;
			}
			//スカートすそ
			if(Lot(2)) {
				action_type = ACTION_SKIRT;
				action_count = 0;
			}
			//幸子スマイル
			if(Lot(1)) {
				action_type = ACTION_SACHIKO;
				action_count = 0;
			}
			//ときめき
			if(Lot(4)) {
				action_type = ACTION_TOKIMEKI;
				action_count = 0;
			}
			//あたまかく
			if(Lot(8)) {
				action_type = ACTION_KAKIKAKI;
				action_count = 0;
			}
			//指さし
			if(Lot(12)) {
				action_type = ACTION_YUBISASI;
				action_count = 0;
			}
			//あくび
			if(Lot(3)) {
				action_type = ACTION_AKUBI;
				action_count = 0;
			}
			//相づち
			if(Lot(10)) {
				action_type = ACTION_AIDUCHI;
				action_count = 0;
			}
			//にっこり
			if(Lot(5)) {
				action_type = ACTION_SMILE;
				action_count = 0;
			}
			//のび
			if(Lot(4)) {
				action_type = ACTION_NOBI;
				action_count = 0;
			}
			//すり寄り終了
			if(near_mode != 0) {
				if(Lot(3)) {
					action_type = ACTION_NEAR_END;
					action_count = 0;
				}
			}
			//すり寄り
			else if(Lot(1+debug*0)) {
				action_type = ACTION_NEAR_START;
				action_count = 0;
			}
		}
	}
	else {
		action_count++;
	}
	var yubisasi = [0,0];	//0:右 1:左
	var talk = 0;
	//動作
	switch(action_type) {
	//指さししながら何かしゃべる
	case ACTION_YUBISASI:
		var yb = action_count;
		if (yb < 60) yb = yb / 60.0;
		else if(yb < 300-60) yb = 1.0;
		else yb = (300-yb)/60.0;

		if(action_count <= 240) talk = 1;
		if(action_count >= 300) {
			ActionEnd();
		}

		yb = Math.sin(yb * Math.PI/2);
		arm_l1[0] *= (1.0-yb);
		arm_l1[1] *= (1.0-yb);
		arm_l1[2] *= (1.0-yb);
		arm_l2[0] *= (1.0-yb);
		arm_l2[1] *= (1.0-yb);
		arm_l2[2] *= (1.0-yb);
		arm_l3[0] *= (1.0-yb);
		arm_l3[1] *= (1.0-yb);
		arm_l3[2] *= (1.0-yb);

		arm_l1[0] += (-0.75)*yb;
		arm_l1[1] += (-0.05)*yb;
		arm_l1[2] += ( 0.7 )*yb;
		arm_l2[0] += ((0)*yb);
		arm_l2[1] += ((1.6-neck_r*0.3)*yb);
		arm_l2[2] += ((-0.4-neck_r*0.3)*yb);
		arm_l3[1] += ((0.5)*yb);
		yubisasi[1] = yb;	//左手指さし
		break;
	
	case ACTION_AKUBI:
		var akubi = 0;
		if(action_count<60)
			akubi = action_count/60;
		else if(action_count < 300-60)
			akubi = 1;
		else
			akubi = (300-action_count)/60;
		akubi = Math.sin(akubi*Math.PI/2);
		chr_mesh.morphTargetInfluences[ FACE_O ] = 0.6*akubi;
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] += akubi;
		neck_r *= (1-akubi);
		neck_up *= (1-akubi);
		neck_up += akubi*-0.2;

		arm_l1[0] *= (1.0-akubi);
		arm_l1[1] *= (1.0-akubi);
		arm_l1[2] *= (1.0-akubi);
		arm_l2[0] *= (1.0-akubi);
		arm_l2[1] *= (1.0-akubi);
		arm_l2[2] *= (1.0-akubi);
		arm_l3[0] *= (1.0-akubi);
		arm_l3[1] *= (1.0-akubi);
		arm_l3[2] *= (1.0-akubi);
		
		arm_l1[0] += (-0.95)*akubi;
		arm_l1[1] += (-0.05)*akubi;
		arm_l1[2] += ( 0.7 )*akubi;
		arm_l2[0] += (-1.7 +adj_x*0)*akubi;
		arm_l2[1] += (-0.15+adj_y*0)*akubi;
		arm_l2[2] += ( 1.8 +adj_z*0)*akubi;
		arm_l3[0] += (-0.5+adj_x*0)*akubi;
		arm_l3[1] += (-0.25+adj_y*0)*akubi;
		arm_l3[2] += (-0.1 +adj_z*0)*akubi;
		hand_par[0] *= 1;			//右
		hand_par[1] = akubi;		//左
		if(action_count >= 300) {
			ActionEnd();
			if(near_mode != 0 && Math.random()<0.2) {
				action_type = ACTION_SLEEP;
				action_count = 0;
			}
		}
		break;
		
	case ACTION_AIDUCHI:
		var aiduchi;
		var count2 = 0;
		if(action_count<90)
			aiduchi = action_count/90;
		else if(action_count < 300-90)
			aiduchi = 1;
		else
			aiduchi = (300-action_count)/90;
		aiduchi = Math.sin(aiduchi*Math.PI/2);
		if(action_count >= 105 && action_count <= 175) {
			count2 = action_count-105;
		}
		else {
			count2 = 175-105;
		}
//			chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] = 0.9*aiduchi;
		chr_mesh.morphTargetInfluences[ FACE_NIYARI ] = 0.2;
		neck_r *= (1-aiduchi);
		neck_r += Math.PI/2 * 0.4*aiduchi;
//			mabataki = 25;
		neck_up *= (1-aiduchi);
		neck_up += (Math.sin(count2/20*Math.PI)*0.1+0.2)*aiduchi;
		if(action_count >= 300) {
			ActionEnd();
		}
		break;

	case ACTION_SMILE:
		var aiduchi;
		var count2 = 0;
		if(action_count<90)
			aiduchi = action_count/90;
		else if(action_count < 300-90)
			aiduchi = 1;
		else
			aiduchi = (300-action_count)/90;
		aiduchi = Math.sin(aiduchi*Math.PI/2);
		if(action_count >= 105 && action_count <= 175) {
			count2 = action_count-105;
		}
		else {
			count2 = 175-105;
		}
		var smile=0;
		if(action_count >= 105) {
			smile = (action_count-105)/20;
			if(smile > 1.0) smile = 1.0;
			if(action_count >= 300-30)
				smile = (300-action_count) / 30;
			smile = Math.sin(smile*Math.PI/2);
		}
//		smile=1;
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] *= (1.0-aiduchi);
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] *= (1.0-smile);	//消す
		chr_mesh.morphTargetInfluences[ FACE_WARAU ] += smile;
		chr_mesh.morphTargetInfluences[ FACE_A ] = 0.1*smile;
		chr_mesh.morphTargetInfluences[ FACE_CHEEK ]  = 0.1*smile;
		neck_r *= (1-aiduchi);
		neck_r += Math.PI/2 * 0.4*aiduchi;

		arm_r1[0] *= (1.0-smile);
		arm_r1[1] *= (1.0-smile);
		arm_r1[2] *= (1.0-smile);
		arm_r2[0] *= (1.0-smile);
		arm_r2[1] *= (1.0-smile);
		arm_r2[2] *= (1.0-smile);
		arm_r3[0] *= (1.0-smile);
		arm_r3[1] *= (1.0-smile);
		arm_r3[2] *= (1.0-smile);
		
		var r = -Math.sin(count/8) * 0.1;
		var r2 = Math.sin((count+5)/8) * 0.1;
		arm_r1[0] += (-0.15+adj_x*0)*smile;
		arm_r1[1] += ( 0.4 +adj_y*0+r/10)*smile;
		arm_r1[2] += ( 0.6 +adj_z*0+r/10)*smile;
		arm_r2[0] += (-0.9 +adj_x*0)*smile;
		arm_r2[1] += ( 2.06+adj_y*0-r/3)*smile;
		arm_r2[2] += (-0.3 +adj_z*0+r/3)*smile;
		arm_r3[0] += (-0.6 +adj_x+0*r2*10)*smile;
		arm_r3[1] += (-0.4 +adj_y+(0.5+0)*r2*10)*smile;
		arm_r3[2] += (-1.0 +adj_z+0*r2*10)*smile;
		hand_par[0] = smile;	//右
		hand_par[1] *= 1;		//左

		if(action_count >= 300) {
			ActionEnd();
		}
		break;

	case ACTION_NEAR_START:
	case ACTION_NEAR_END:
//		var end_x = (camera_x+3);
		var end_x = 1.5;
		var x = 0;
		var count2 = action_count;
		if(action_type == ACTION_NEAR_END) {
			count2 = 330 - action_count;
		}
		var nk = 0;
		if(action_count < 60) {
			nk = (1-action_count/60);
		}
		else if(action_count >= 330-60) {
			nk = (action_count-(330-60))/60;
			near_mode = (action_type == ACTION_NEAR_START);
			EyeTextureUpdate(near_mode ? 1 : 0);
		}
		else {
			nk = 0;
		}
		nk = Math.sin(nk*Math.PI/2);
		neck_r *= nk;
		neck_up *= nk;
//		neck_up += (1-nk)*0.4;
		
		arm_l1[X] *= nk;
		arm_l1[Y] *= nk;
		arm_l1[Z] *= nk;
		arm_l2[X] *= nk;
		arm_l2[Y] *= nk;
		arm_l2[Z] *= nk;

		arm_r1[X] *= nk;
		arm_r1[Y] *= nk;
		arm_r1[Z] *= nk;
		arm_r2[X] *= nk;
		arm_r2[Y] *= nk;
		arm_r2[Z] *= nk;

		knee_zl *= nk;
		knee_zr *= nk;
		
		{	//移動
			var armx = 0;	//0=曲げ 1=伸ばし
			if(count2 < 60) {
				armx = 0;
			}
			else if(count2 < 60+60) {
				armx = (count2-60)/60;
				x = Math.abs(Math.sin(armx * Math.PI/2)) * 0.4;
			}
			else if(count2 < 60+60+15) {
				armx = 1-(count2-60-60)/15;
				x = 0.4;
			}
			else if(count2 < 60+60+15+60) {
				armx = (count2-60-60-15)/60;
				x = Math.abs(Math.sin((count2-60-60-15)/60 * Math.PI/2))*0.4 + 0.4;
			}
			else if(count2 < 60+60+15+60+15) {
				armx = 1-(count2-60-60-15-60)/15;
				x = 0.8;
			}
			else if(count2 < 60+60+15+60+15+60) {
				armx = (count2-60-60-15-60-15)/60;
				x = Math.abs(Math.sin((count2-60-60-15-60-15)/60 * Math.PI/2))*0.2 + 0.8;
			}
			else {
				armx = 1;
				x = 1;
			}
			{
				var b;
//				armx=0;
				var armx1 = (  armx) * (1-nk);
				var armx2 = (1-armx) * (1-nk);
				kagami = 1.0*(1-nk);
				arm_l1[0] += ( 0.05)*armx1;
				arm_l1[1] += ( 0.84)*armx1;
				arm_l1[2] += ( 0.30)*armx1;
				arm_l2[0] += (-0.67)*armx1;
				arm_l2[1] += ( 0.5 )*armx1;
				arm_l2[2] += (-0.42)*armx1;
				arm_l3[0] += ( 0.1 )*armx1;
				arm_l3[1] += (-0.12)*armx1;
				arm_l3[2] += (-0.8 )*armx1;

				arm_l1[0] += (-0.34)*armx2;
				arm_l1[1] += ( 0.54)*armx2;
				arm_l1[2] += ( 0.1 )*armx2;
				arm_l3[0] += (-0.3 )*armx2;
				arm_l3[1] += ( 0.0 )*armx2;
				arm_l3[2] += (-0.6 )*armx2;
				
				//右手
				arm_r1[0] += ( 0.05)*armx2;
				arm_r1[1] += ( 0.84)*armx2;
				arm_r1[2] += ( 0.30)*armx2;
				arm_r2[0] += (-0.67)*armx2;
				arm_r2[1] += ( 0.5 )*armx2;
				arm_r2[2] += (-0.42)*armx2;
				arm_r3[0] += ( 0.1 )*armx2;
				arm_r3[1] += (-0.12)*armx2;
				arm_r3[2] += (-0.8 )*armx2;

				arm_r1[0] += (-0.34)*armx1;
				arm_r1[1] += ( 0.54)*armx1;
				arm_r1[2] += ( 0.1 )*armx1;
				arm_r3[0] += (-0.3 )*armx1;
				arm_r3[1] += ( 0.0 )*armx1;
				arm_r3[2] += (-0.6 )*armx1;

				//ひざ動作
				knee_zl +=  0.2*armx1;
				knee_zr += -0.2*armx1;
			}
			//呼吸動作は止める
			breath *= nk;
		}
		var c = 1-nk;
		c = 1 - Math.sin((c+1)*Math.PI/2);
//		document.getElementById("debugOut").innerHTML += "c="+c+"<br>";
		chr_x = chr_default_x * (1-x) + end_x * (x);
		chr_y = chr_default_y * (1-c) + (chr_default_y+0.95) * c;
		chr_z = chr_default_z * (1-kagami) + (chr_default_z+2) * kagami;
		if(action_count >= 330) {
			ActionEnd();

//			action_type = ACTION_SLEEP;
//			action_count = 0;
		}
		break;
	case ACTION_SLEEP:
		var nk = 0;
		if(action_count < 200) {
			nk = (1-action_count/200);
		}
		else if(action_count >= 1500-60) {
			nk = (action_count-(1500-60))/60;
		}
		else {
			nk = 0;
		}
		nk = Math.sin(nk*Math.PI/2);
		neck_r *= nk;
		neck_up *= nk;
//		neck_up += (1-nk)*0.4;
		
//		arm_l1[X] *= nk;
//		arm_l1[Y] *= nk;
//		arm_l1[Z] *= nk;
		arm_l2[X] *= nk;
		arm_l2[Y] *= nk;
		arm_l2[Z] *= nk;

//		arm_r1[X] *= nk;
//		arm_r1[Y] *= nk;
//		arm_r1[Z] *= nk;
		arm_r2[X] *= nk;
		arm_r2[Y] *= nk;
		arm_r2[Z] *= nk;

		//寄り添う
		findBone(target,"首",0).rotation.z		-= (1-nk)* 0.2;
		
		findBone(target,"腰",0).rotation.z		+= (1-nk)*-0.15;
		findBone(target,"上半身",0).rotation.z	+= (1-nk)*-0.3;
		findBone(target,"上半身2",0).rotation.z	+= (1-nk)* 0.3;

		//少し体を縮める
		findBone(target,"上半身",0).position.y	-= (1-nk)*0.2;
		findBone(target,"上半身2",0).position.y	-= (1-nk)*0.1;

		hand_par[0] = (1-nk)*0.5;	//右
		hand_par[1] = (1-nk)*0.5;	//左
		neck_up += (1-nk)*-0.25;
		neck_r  += (1-nk)* 0.36;
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] += 1-nk;
		chr_mesh.morphTargetInfluences[ FACE_O ] = (1-nk)*0.2;
		{
			var b;
//				armx=0;
			var armx1 = 1-nk;
			var armx2 = 1-nk;
			arm_l1[0] += ( 0.06)*armx1;	//-0.67
			arm_l1[1] += (-0.54)*armx1;	// 0.5
			arm_l1[2] += (-0.08)*armx1;	//-0.42
			arm_l2[0] += (0.08+0)*armx1;	//-0.67
			arm_l2[1] += (0.50+0)*armx1;	// 0.5
			arm_l2[2] += (-0.1+0)*armx1;	//-0.42
			arm_l3[0] += ( 0.56)*armx1;
			arm_l3[1] += (-0.10)*armx1;
			arm_l3[2] += (-0.94)*armx1;
/*
			arm_l3[0] += (-0.3 )*armx2;
			arm_l3[1] += ( 0.0 )*armx2;
			arm_l3[2] += (-0.6 )*armx2;
*/			
			//右手
//			arm_r2[0] += (-0.67)*armx2;
//			arm_r2[1] += ( 0.5 )*armx2;
//			arm_r2[2] += (-0.42)*armx2;
//			arm_r3[0] += ( 0.1 )*armx2;
//			arm_r3[1] += (-0.12)*armx2;
//			arm_r3[2] += (-0.8 )*armx2;
/*
			arm_r1[0] += (-0.34)*armx1;
			arm_r1[1] += ( 0.54)*armx1;
			arm_r1[2] += ( 0.1 )*armx1;
			arm_r3[0] += (-0.3 )*armx1;
			arm_r3[1] += ( 0.0 )*armx1;
			arm_r3[2] += (-0.6 )*armx1;
*/		}
		if(action_count >= 1500) {
			ActionEnd();
			action_count = 0;
			if(Math.random() < 0.25) {
				action_type = ACTION_TERE;
			}
			else {
				action_type = ACTION_GOMEN;
			}
		}
		break;
	case ACTION_NOBI:
		var nk = 0;
		if(action_count < 120) {
			nk = (1-action_count/120);
		}
		else if(action_count >= 560-60) {
			nk = (action_count-(560-60))/60;
		}
		else {
			nk = 0;
		}
		nk = Math.sin(nk*Math.PI/2);
		neck_r *= nk;
		neck_up *= nk;
		
		arm_l1[X] *= nk;
		arm_l1[Y] *= nk;
		arm_l1[Z] *= nk;
		arm_l2[X] *= nk;
		arm_l2[Y] *= nk;
		arm_l2[Z] *= nk;
		arm_l3[X] *= nk;
		arm_l3[Y] *= nk;
		arm_l3[Z] *= nk;

		arm_r1[X] *= nk;
		arm_r1[Y] *= nk;
		arm_r1[Z] *= nk;
		arm_r2[X] *= nk;
		arm_r2[Y] *= nk;
		arm_r2[Z] *= nk;
		arm_r3[X] *= nk;
		arm_r3[Y] *= nk;
		arm_r3[Z] *= nk;

		//呼吸動作は止める
		breath *= nk;
		
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] *= nk;
		chr_mesh.morphTargetInfluences[ FACE_NAGOMI ] += 1-nk;
		chr_mesh.morphTargetInfluences[ FACE_MOU2 ] = (1-nk)*0.6;
		{
			var b;
			var armx1 = 1-nk;
			var yori = Math.sin(action_count/30)*0.1;
			neck_up -= (1-nk)*(0.6+yori*4);

			arm_l1[0] += (-2.16-yori*3)*armx1;
			arm_l1[1] += ( 0.26+adj_y*0)*armx1;
			arm_l1[2] += ( 0.85+adj_z*0)*armx1;
			arm_l2[0] += (0.0+adj_x*0)*armx1;	//-0.67
			arm_l2[1] += (0.0+adj_y*0)*armx1;	// 0.5
			arm_l2[2] += (0.0+adj_z*0)*armx1;	//-0.42
			arm_l3[0] += ( 1.82+adj_x*0)*armx1;
			arm_l3[1] += ( 0.33+adj_y*0)*armx1;
			arm_l3[2] += (-2.24+adj_z*0)*armx1;
			
			findBone(target,"左手捩",0).rotation.x		+=    1*armx1;
			findBone(target,"左手捩",0).rotation.y		+= -0.5*armx1;
			findBone(target,"左手捩",0).rotation.z		+=  0.5*armx1;

			arm_r1[0] += (-2.16-yori*3)*armx1;
			arm_r1[1] += ( 0.26)*armx1;
			arm_r1[2] += ( 0.85)*armx1;
			arm_r2[0] += ( 0.0 )*armx1;
			arm_r2[1] += ( 0.0 )*armx1;
			arm_r2[2] += ( 0.0 )*armx1;
			arm_r3[0] += ( 1.82)*armx1;
			arm_r3[1] += ( 0.33)*armx1;
			arm_r3[2] += (-2.24)*armx1;

			findBone(target,"右手捩",0).rotation.x		+=    1*armx1;
			findBone(target,"右手捩",0).rotation.y		+=  0.5*armx1;
			findBone(target,"右手捩",0).rotation.z		+= -0.5*armx1;
			
			findBone(target,"上半身",0).rotation.x		+= (1-nk)*(1.0+yori);
			findBone(target,"上半身2",0).rotation.x		+= (1-nk)*(0.5+yori);

//			hand_par[0] = 1-nk;
//			hand_par[1] = 1-nk;
			hand_par[0] =
			hand_par[1] = armx1*1.3;
			
			knee_xl *= nk;
			knee_xr *= nk;
			knee_xl += armx1*(0.4-yori/3);
			knee_xr += armx1*(0.4-yori/3);
			mata *= nk;
			mata += armx1*-1;
		}
		//おわ
		if(action_count >= 560) {
			ActionEnd();
		}
		break;
		
	case ACTION_KAKIKAKI:
		var nk = 0;
		if(action_count < 60) {
			nk = (1-action_count/60);
		}
		else if(action_count >= 300-60) {
			nk = (action_count-(300-60))/60;
		}
		else {
			nk = 0;
		}
		nk = Math.sin(nk*Math.PI/2);
		neck_r *= nk;
		neck_up *= nk;

		arm_r1[X] *= nk;
		arm_r1[Y] *= nk;
		arm_r1[Z] *= nk;
		arm_r2[X] *= nk;
		arm_r2[Y] *= nk;
		arm_r2[Z] *= nk;
		arm_r3[X] *= nk;
		arm_r3[Y] *= nk;
		arm_r3[Z] *= nk;
		
		{
			var b;
			var armx1 = 1-nk;
			neck_r  += (1-nk)*(0.1);
			neck_up += (1-nk)*(0.5);
			var kaki = Math.sin(count/5)*0.4*(1-nk);

			arm_r1[0] += (-1.2+adj_x*0+kaki/10)*armx1;
			arm_r1[1] += (-0.7+adj_y*0)*armx1;
			arm_r1[2] += ( 0.5+adj_z*0)*armx1;
			arm_r2[0] += ( 1.04+adj_x*0)*armx1;
			arm_r2[1] += ( 2.64+adj_y*0)*armx1;
			arm_r2[2] += (-1.46+adj_z*0)*armx1;
			arm_r3[0] += (-0.5+adj_x*0)*armx1;
			arm_r3[1] += ( 0.2+adj_y*0)*armx1;
			arm_r3[2] += (-0.0+adj_z*0)*armx1;

//			findBone(target,"右手捩",0).rotation.x		+=    1*armx1;
//			findBone(target,"右手捩",0).rotation.y		+=  0.5*armx1;
//			findBone(target,"右手捩",0).rotation.z		+= -0.5*armx1;
			
			findBone(target,"上半身2",0).rotation.x		+= (1-nk)*(0.1);

//			hand_par[0] = 1-nk;
//			hand_par[1] = 1-nk;
			yubisasi[0] += (1-nk)*0.5;
		}
		//おわ
		if(action_count >= 300) {
			ActionEnd();
		}
		break;
	case ACTION_TOKIMEKI:
		var tkmk = 0;
		if(action_count<60)
			tkmk = action_count/60;
		else if(action_count < 800-60)
			tkmk = 1;
		else
			tkmk = (800-action_count)/60;
		tkmk = Math.sin(tkmk*Math.PI/2);
		neck_r *= (1-tkmk);
		neck_up *= (1-tkmk);
		neck_up += tkmk*0.25;
		findBone(target,"頭",0).rotation.x = tkmk*-0.25;	//少し前のめり
		if(action_count == 60)
			EyeTextureUpdate(2);
		else if(action_count == 800-60)
			EyeTextureUpdate(near_mode ? 1 : 0);

		arm_l1[0] *= (1.0-tkmk);
		arm_l1[1] *= (1.0-tkmk);
		arm_l1[2] *= (1.0-tkmk);
		arm_l2[0] *= (1.0-tkmk);
		arm_l2[1] *= (1.0-tkmk);
		arm_l2[2] *= (1.0-tkmk);
		arm_l3[0] *= (1.0-tkmk);
		arm_l3[1] *= (1.0-tkmk);
		arm_l3[2] *= (1.0-tkmk);

		arm_r1[0] *= (1.0-tkmk);
		arm_r1[1] *= (1.0-tkmk);
		arm_r1[2] *= (1.0-tkmk);
		arm_r2[0] *= (1.0-tkmk);
		arm_r2[1] *= (1.0-tkmk);
		arm_r2[2] *= (1.0-tkmk);
		arm_r3[0] *= (1.0-tkmk);
		arm_r3[1] *= (1.0-tkmk);
		arm_r3[2] *= (1.0-tkmk);
		
		arm_l1[0] += (-0.85+adj_x*0)*tkmk;
		arm_l1[1] += (-0.05+adj_y*0)*tkmk;
		arm_l1[2] += ( 0.7 +adj_z*0)*tkmk;
		arm_l2[0] += (-1.6 +adj_x*0)*tkmk;
		arm_l2[1] += (-0.40+adj_y*0)*tkmk;
		arm_l2[2] += ( 2.07+adj_z*0)*tkmk;
		arm_l3[0] += (-0.08+adj_x*1)*tkmk;
		arm_l3[1] += (-0.11+adj_y*1)*tkmk;
		arm_l3[2] += (-0.54+adj_z*1)*tkmk;
		
		arm_r1[0] += (-0.85)*tkmk;
		arm_r1[1] += (-0.05)*tkmk;
		arm_r1[2] += ( 0.7 )*tkmk;
		arm_r2[0] += (-1.6 +adj_x*0)*tkmk;
		arm_r2[1] += (-0.4 +adj_y*0)*tkmk;
		arm_r2[2] += ( 2.07+adj_z*0)*tkmk;
		arm_r3[0] += (-0.5 +adj_x*1)*tkmk;
		arm_r3[1] += (-0.13+adj_y*1)*tkmk;
		arm_r3[2] += (-0.54+adj_z*1)*tkmk;
		hand_par[0] = tkmk*1.2;		//右
		hand_par[1] = tkmk*1.2;		//左
		if(action_count >= 800) {
			ActionEnd();
//			action_count = 0;
		}
		break;
	case ACTION_TERE:
		var tere = 0;
		var count2 = 0;
		if(action_count<40)
			tere = action_count/40;
		else if(action_count < 240-60) {
			tere = 1;
			count2 = action_count-40;
		}
		else {
			tere = (240-action_count)/60;
			count2 = 240-60;
		}
//		tere = Math.sin(tere*Math.PI/2);
		neck_r *= (1-tere);
		neck_up *= (1-tere);
		neck_up += tere*0.25;
		chr_mesh.morphTargetInfluences[ FACE_KOMARU ] = tere;
		chr_mesh.morphTargetInfluences[ FACE_MOU1 ] = tere*0.6;
		chr_mesh.material[ 23 ].opacity = 0.7 * tere;
		eye_xr -= 0.05*tere;
		eye_yr += 0.05*tere;

		arm_l1[0] *= (1.0-tere);
		arm_l1[1] *= (1.0-tere);
		arm_l1[2] *= (1.0-tere);
		arm_l2[0] *= (1.0-tere);
		arm_l2[1] *= (1.0-tere);
		arm_l2[2] *= (1.0-tere);
		arm_l3[0] *= (1.0-tere);
		arm_l3[1] *= (1.0-tere);
		arm_l3[2] *= (1.0-tere);

		arm_r1[0] *= (1.0-tere);
		arm_r1[1] *= (1.0-tere);
		arm_r1[2] *= (1.0-tere);
		arm_r2[0] *= (1.0-tere);
		arm_r2[1] *= (1.0-tere);
		arm_r2[2] *= (1.0-tere);
		arm_r3[0] *= (1.0-tere);
		arm_r3[1] *= (1.0-tere);
		arm_r3[2] *= (1.0-tere);
		
		arm_l1[0] += (-0.85+adj_x*0)*tere;
		arm_l1[1] += (-0.05+adj_y*0)*tere;
		arm_l1[2] += ( 0.7 +adj_z*0)*tere;
		arm_l2[0] += (-1.6 +adj_x*0)*tere;
		arm_l2[1] += (-0.40+adj_y*0)*tere;
		arm_l2[2] += ( 2.07+adj_z*0)*tere;
		arm_l3[0] += (-0.08-0.28)*tere;
		arm_l3[1] += (-0.11+0.1 )*tere;
		arm_l3[2] += (-0.54-0.06)*tere;
		
		arm_r1[0] += (-0.85)*tere;
		arm_r1[1] += (-0.05)*tere;
		arm_r1[2] += ( 0.7 )*tere;
		arm_r2[0] += (-1.6 +adj_x*0)*tere;
		arm_r2[1] += (-0.4 +adj_y*0)*tere;
		arm_r2[2] += ( 2.07+adj_z*0)*tere;
		arm_r3[0] += (-0.08-0.28)*tere;
		arm_r3[1] += (-0.11+0.1 )*tere;
		arm_r3[2] += (-0.54-0.06)*tere;
		hand_par[0] = tere*1.2;		//右
		hand_par[1] = tere*1.2;		//左

		var yure = (Math.sin(count2/6)+1.5) * 0.2;
		findBone(target,"上半身",0).rotation.x		+= (tere)*(0.1);
		findBone(target,"上半身",0).rotation.y		+= (tere)*(yure);
		findBone(target,"上半身2",0).rotation.x		+= (tere)*(0.1);
		findBone(target,"上半身2",0).rotation.y		+= (tere)*(yure/2);

		if(action_count >= 240) {
			ActionEnd();
//			action_count = 0;
		}
		break;

	case ACTION_GOMEN:
		var gomen = 0;
		var count2 = 0;
		if(action_count<40)
			gomen = action_count/40;
		else if(action_count < 240-60) {
			gomen = 1;
			count2 = action_count-40;
			talk = 1;
		}
		else {
			gomen = (240-action_count)/60;
			count2 = 240-60;
		}
//		gomen = Math.sin(gomen*Math.PI/2);
		neck_r *= (1-gomen);
		neck_up *= (1-gomen);
		neck_up += gomen*0.25;
		chr_mesh.morphTargetInfluences[ FACE_KOMARU ] = gomen;
//		chr_mesh.morphTargetInfluences[ FACE_MOU1 ] = gomen*0.3;
		eye_xr -= 0.05*gomen;
		eye_yr += 0.05*gomen;

		arm_l1[0] *= (1.0-gomen);
		arm_l1[1] *= (1.0-gomen);
		arm_l1[2] *= (1.0-gomen);
		arm_l2[0] *= (1.0-gomen);
		arm_l2[1] *= (1.0-gomen);
		arm_l2[2] *= (1.0-gomen);
		arm_l3[0] *= (1.0-gomen);
		arm_l3[1] *= (1.0-gomen);
		arm_l3[2] *= (1.0-gomen);

		arm_r1[0] *= (1.0-gomen);
		arm_r1[1] *= (1.0-gomen);
		arm_r1[2] *= (1.0-gomen);
		arm_r2[0] *= (1.0-gomen);
		arm_r2[1] *= (1.0-gomen);
		arm_r2[2] *= (1.0-gomen);
		arm_r3[0] *= (1.0-gomen);
		arm_r3[1] *= (1.0-gomen);
		arm_r3[2] *= (1.0-gomen);
		
		arm_l1[0] += (-0.6+adj_x*0)*gomen;
		arm_l1[1] += ( 0.4+adj_y*0)*gomen;
		arm_l1[2] += (-0.2+adj_z*0)*gomen;
		arm_l2[0] += (-0.4+adj_x*0)*gomen;
		arm_l2[1] += (-0.8+adj_y*0)*gomen;
		arm_l2[2] += ( 2.2+adj_z*0)*gomen;
		arm_l3[0] += ( 2.1+adj_x*0)*gomen;
		arm_l3[1] += ( 1.0+adj_y*0)*gomen;
		arm_l3[2] += (-2.1+adj_z*0)*gomen;
		
		arm_r1[0] += (-1.0+adj_x*0)*gomen;
		arm_r1[1] += ( 1.0+adj_y*0)*gomen;
		arm_r1[2] += ( 0.6+adj_z*0)*gomen;
		arm_r2[0] += (-0.38+adj_x*0)*gomen;
		arm_r2[1] += (-1.02+adj_y*0)*gomen;
		arm_r2[2] += ( 2.22+adj_z*0)*gomen;
		arm_r3[0] += ( 2.32+adj_x*0)*gomen;
		arm_r3[1] += ( 0.54+adj_y*0)*gomen;
		arm_r3[2] += (-2.30+adj_z*0)*gomen;
		hand_par[0] = gomen*1.1;		//右
		hand_par[1] = gomen*1.1;		//左

		var c2 = Math.sin(count2/15)*0.5+0.5;
		var yure = (Math.sin(c2*Math.PI/2)+1.0) * 0.15;
		findBone(target,"上半身",0).rotation.x		+= (gomen)*(yure);
		findBone(target,"上半身",0).rotation.y		+= (gomen)*(0.6);
		findBone(target,"上半身2",0).rotation.x		+= (gomen)*(yure);
		findBone(target,"上半身2",0).rotation.y		+= (gomen)*(0.1);
		neck_r += gomen*0.3;

		if(action_count >= 240) {
			ActionEnd();
//			action_count = 0;
		}
		break;

	case ACTION_SACHIKO:
		var smile = 0;
		if(action_count<30)
			smile = action_count/30;
		else if(action_count < 240-30) {
			smile = 1;
		}
		else {
			smile = (240-action_count)/30;
		}
//		smile = Math.sin(smile*Math.PI/2);
		neck_r *= (1-smile);
		neck_up *= (1-smile);
		neck_up += smile*0.25;
		chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] *= (1.0-smile);
		chr_mesh.morphTargetInfluences[ FACE_WARAU ] = smile;
		chr_mesh.morphTargetInfluences[ FACE_MOU3 ] = smile*0.8;
		chr_mesh.material[ 23 ].opacity = 0.3 * smile;
		eye_xr -= 0.05*smile;
		eye_yr += 0.05*smile;

		arm_l1[0] *= (1.0-smile);
		arm_l1[1] *= (1.0-smile);
		arm_l1[2] *= (1.0-smile);
		arm_l2[0] *= (1.0-smile);
		arm_l2[1] *= (1.0-smile);
		arm_l2[2] *= (1.0-smile);
		arm_l3[0] *= (1.0-smile);
		arm_l3[1] *= (1.0-smile);
		arm_l3[2] *= (1.0-smile);

		arm_r1[0] *= (1.0-smile);
		arm_r1[1] *= (1.0-smile);
		arm_r1[2] *= (1.0-smile);
		arm_r2[0] *= (1.0-smile);
		arm_r2[1] *= (1.0-smile);
		arm_r2[2] *= (1.0-smile);
		arm_r3[0] *= (1.0-smile);
		arm_r3[1] *= (1.0-smile);
		arm_r3[2] *= (1.0-smile);
		
		arm_l1[0] += (-0.34+adj_x*0)*smile;
		arm_l1[1] += (-0.4 +adj_y*0)*smile;
		arm_l1[2] += (-1.05+adj_z*0)*smile;
		arm_l2[0] += (-1.6 +adj_x*0)*smile;
		arm_l2[1] += (-0.05+adj_y*0)*smile;
		arm_l2[2] += ( 1.5 +adj_z*0)*smile;
		arm_l3[0] += (-0.18+adj_x*0)*smile;
		arm_l3[1] += ( 0.30+adj_y*0)*smile;
		arm_l3[2] += (-0.88+adj_z*0)*smile;
		findBone(target,"左手捩",0).rotation.x		+= ( 1.6+adj_x*0)*smile;
		findBone(target,"左手捩",0).rotation.y		+= (-0.65+adj_y*0)*smile;
		findBone(target,"左手捩",0).rotation.z		+= ( 0.98+adj_z*0)*smile;

		arm_r1[0] += (-0.24+adj_x*1)*smile;
		arm_r1[1] += (-0.06+adj_y*1)*smile;
		arm_r1[2] += (-0.9 +adj_z*1)*smile;
		arm_r2[0] += (-1.6 +adj_x*0)*smile;
		arm_r2[1] += (-0.05+adj_y*0)*smile;
		arm_r2[2] += ( 1.5 +adj_z*0)*smile;
		arm_r3[0] += (-0.18+adj_x*0)*smile;
		arm_r3[1] += ( 0.30+adj_y*0)*smile;
		arm_r3[2] += (-0.88+adj_z*0)*smile;
		findBone(target,"右手捩",0).rotation.x		+= ( 1.6+adj_x*0)*smile;
		findBone(target,"右手捩",0).rotation.y		+= ( 0.65+adj_y*0)*smile;
		findBone(target,"右手捩",0).rotation.z		+= (-0.98+adj_z*0)*smile;

		yubisasi[0] = smile*1.1;		//右
		yubisasi[1] = smile*1.1;		//左

		var kosi = 0.4;
		findBone(target,"腰",0).position.y			+= smile* kosi;
		findBone(target,"腰",0).position.z			+= smile*kosi*-2;
		findBone(target,"下半身",0).rotation.x		-= smile*kosi;
		findBone(target,"腰",0).rotation.x			+= smile*kosi;
		findBone(target,"上半身",0).rotation.x		+= (smile)*(0.3);
		findBone(target,"上半身",0).rotation.y		+= (smile)*(0.45);
		findBone(target,"上半身2",0).rotation.x		+= (smile)*(-0.2);
		findBone(target,"上半身2",0).rotation.y		+= (smile)*(0.45);
		neck_r += smile*0.3;

		if(action_count >= 240) {
//			ActionEnd();
			action_count = 0;
			action_type = ACTION_TERE;
		}
		break;
	//スカートすそ
	case ACTION_SKIRT:
		var sk = 0;
		var count2= 0;
		if(action_count < 60) {
			sk = (1-action_count/60);
		}
		else if(action_count < 360-60) {
			sk = 0;
			count2 = action_count-60;
		}
		else {
			sk = (action_count-(360-60))/60;
			count2 = 360-60;
		}
//		sk = Math.sin(sk*Math.PI/2);
		neck_r *= sk;
		neck_up *= sk;
		neck_up += 0.5*(1-sk);
		
		arm_l1[X] *= sk;
		arm_l1[Y] *= sk;
		arm_l1[Z] *= sk;
		arm_l2[X] *= sk;
		arm_l2[Y] *= sk;
		arm_l2[Z] *= sk;
		arm_l3[X] *= sk;
		arm_l3[Y] *= sk;
		arm_l3[Z] *= sk;

		arm_r1[X] *= sk;
		arm_r1[Y] *= sk;
		arm_r1[Z] *= sk;
		arm_r2[X] *= sk;
		arm_r2[Y] *= sk;
		arm_r2[Z] *= sk;
		arm_r3[X] *= sk;
		arm_r3[Y] *= sk;
		arm_r3[Z] *= sk;

		//呼吸動作は止める
		breath *= sk;
		
		{
			var b;
			var armx1 = 1-sk;
			var yori = (Math.sin(count2/10)+1.0)*0.3;

			function sign(_a) {
				if(_a == 0) return 0;
				if(_a < 0) return -1;
				return 1;
			}
			arm_l1[0] += (-0.70+adj_x+yori/2)*armx1;
			arm_l1[1] += ( 0.22+adj_y*1)*armx1;
			arm_l1[2] += ( 0.85+adj_z*1)*armx1;
			arm_l2[0] += (-0.04+adj_x*0-yori*2.0)*armx1;	//-0.67
			arm_l2[1] += ( 0.0 +adj_y*0-yori*0.5)*armx1;	// 0.5
			arm_l2[2] += ( 0.0 +adj_z*0+yori* 0)*armx1;	//-0.42
			arm_l3[0] += ( 1.00+adj_x*0+yori*2)*armx1;
			arm_l3[1] += ( 0.60+adj_y*0+yori/3)*armx1;
			arm_l3[2] += (-0.70+adj_z*0-yori*1.8)*armx1;
			
			arm_r1[0] += (-0.70+yori/2)*armx1;
			arm_r1[1] += ( 0.22)*armx1;
			arm_r1[2] += ( 0.85)*armx1;
			arm_r2[0] += (-0.04 -yori*2.0)*armx1;
			arm_r2[1] += ( 0.0  -yori*0.5)*armx1;
			arm_r2[2] += ( 0.0 )*armx1;
			arm_r3[0] += ( 1.00+yori*2)*armx1;
			arm_r3[1] += ( 0.60+yori/3)*armx1;
			arm_r3[2] += (-0.70-yori*1.8)*armx1;

//			findBone(target,"右手捩",0).rotation.x		+=    1*armx1;
//			findBone(target,"右手捩",0).rotation.y		+=  0.5*armx1;
//			findBone(target,"右手捩",0).rotation.z		+= -0.5*armx1;
			
			kagami = 0.1*armx1;
			findBone(target,"腰",0).position.y			+= kagami*0.7;
			findBone(target,"腰",0).position.z			+= kagami*-2;

			hand_par[0] =
			hand_par[1] = armx1*0.3;
			
			//スカートひらめく
			for(j=0;j<3;j++) {	//周
				var j2 = j;		//0,1,7
				if(j==2) j2=7;
				for(i=0;i<4;i++) {	//上下層
					var obj = findBone(chr_mesh,"スカート_"+i+"_"+j2,0);
//					obj.rotation.set(skirt_tbl[i][j][0], skirt_tbl[i][j][1], skirt_tbl[i][j][2]);
					
//					obj.rotation.x += (Math.sin(1.5+i*Math.PI)+adj_z)*adj_x-yori*adj_y;
					if(i==0) {
						if(sk == 0) 
							obj.rotation.x -= yori/2;
					}
				}
			}
			free_koyubi = armx1;
		}
		//おわ
		if(action_count >= 360) {
			ActionEnd();
		}
		break;
	}

	//反映
	var neck = findBone(target,"首",0);
	neck.rotation.y = neck_r;
	neck.rotation.x = neck_up;

	findBone(target,"下半身",0).rotation.x		-= kagami;
	findBone(target,"腰",0).rotation.x			+= -0.4+kagami;
	findBone(target,"上半身",0).rotation.x		+= (breath)*0.00+0.2-0;
	findBone(target,"上半身",0).rotation.y		+= neck_r*0.1;
	findBone(target,"上半身2",0).rotation.x		-= (breath)*0.02-kagami/4;
	findBone(target,"上半身2",0).rotation.y		+= neck_r*0.2;
	findBone(target,"上半身",0).position.z		+= (breath)*0.05;
	findBone(target,"上半身2",0).position.y		+= (breath)*0.03;
	neck.rotation.x += Math.sin(-count/40)*0.03;
	findBone(target,"右腰C",0)   .rotation.set(-Math.PI/2*0.8 , 0,-Math.PI/2*mata/100);
	findBone(target,"左腰C",0)   .rotation.set(-Math.PI/2*0.8 , 0, Math.PI/2*mata/100);
	findBone(target,"右ひざ＋",0).rotation.set( Math.PI/2*knee_xl, Math.PI/2*(1-mata)/10,-knee_zl);
	findBone(target,"左ひざ＋",0).rotation.set( Math.PI/2*knee_xr,-Math.PI/2*(1-mata)/10, knee_zr);
	findBone(target,"右足首＋",0).rotation.set( Math.PI/2*0.4, Math.PI/2*0.1,-Math.PI/2*0);
	findBone(target,"左足首＋",0).rotation.set( Math.PI/2*0.4,-Math.PI/2*0.1, Math.PI/2*0);

	//

//	document.getElementById("debugOut").innerHTML += "action("+action_type+"):"+action_count+"<br>";


	//カウンタにあわせて何かしゃべる
	if(action_type != 0 && talk) {
		//くちぱく
		if(action_count%20 == 0) {
			if(action_count%120 >= 20) {
				chr_mesh.morphTargetInfluences[ FACE_A+Math.floor(Math.random()*4) ] = 0.3;
			}
		}
		if(action_count%20 >= 15) {
			for(i=0;i<5;i++) {
				chr_mesh.morphTargetInfluences[ FACE_A+i ] *= 0.7;
			}
		}
//				document.getElementById("debugOut").innerHTML = "yubisasi:"+yubisasi+"<br>";
	}

	findBone(target,"右肩",0)    .rotation.set(arm_r1[0], arm_r1[1], +arm_r1[2]);
	findBone(target,"左肩",0)    .rotation.set(arm_l1[0],-arm_l1[1], -arm_l1[2]);
	findBone(target,"右ひじ",0)  .rotation.set(arm_r2[0], arm_r2[1],  arm_r2[2]);
	findBone(target,"左ひじ",0)  .rotation.set(arm_l2[0],-arm_l2[1], -arm_l2[2]);
	findBone(target,"右手首",0)  .rotation.set(arm_r3[0], arm_r3[1],  arm_r3[2]);
	findBone(target,"左手首",0)  .rotation.set(arm_l3[0],-arm_l3[1], -arm_l3[2]);
	var i,j;
//			document.getElementById("debugOut").innerHTML = "";
	var finger_name = [
		"人指１",
		"人指２",
		"人指３",
		"中指１",
		"中指２",
		"中指３",
		"薬指１",
		"薬指２",
		"薬指３",
		"小指１",
		"小指２",
		"小指３",
	];
	for(i=0;i<finger_name.length;i++) {
		var nigiri_r = 0.7 + Math.round(i/3)*0.1;
		var nigiri_l = nigiri_r;
		if(i<3) {
			nigiri_r *= (1.0-yubisasi[0]*0.85);
			nigiri_l *= (1.0-yubisasi[1]*0.85);
		}
		var yr,yl;
		yr = findBone(target,"右"+finger_name[i],0)
		yl = findBone(target,"左"+finger_name[i],0);
		yr.rotation.z	=  Math.PI/2*((nigiri_r*(1-hand_par[0])) + (0.1 * hand_par[0]));
		yl.rotation.z	= -Math.PI/2*((nigiri_l*(1-hand_par[1])) + (0.1 * hand_par[1]));
		yr.rotation.z *= (1-free_koyubi);
		yl.rotation.z *= (1-free_koyubi);
		yr.rotation.z += (1-Math.floor(i/3)/3)*(free_koyubi);
		yl.rotation.z -= (1-Math.floor(i/3)/3)*(free_koyubi);
	}
	findBone(target,"右親指２",0).rotation.set(0,-Math.PI/2*0.9, Math.PI/2*0.1);
	findBone(target,"左親指２",0).rotation.set(0, Math.PI/2*0.9,-Math.PI/2*0.1);


	/*document.getElementById("debugOut").innerHTML = "";
	for(i=0;i<4;i++) {
		document.getElementById("debugOut").innerHTML += "{<br>";
		for(j=0;j<8;j++) {
			var r = findBone(chr_mesh,"スカート_"+i+"_"+j,0).rotation;
				document.getElementById("debugOut").innerHTML += "{"+Math.floor(r.x*1000)/10000+","+Math.floor(r.y*1000)/10000+","+Math.floor(r.z*1000)/10000+"},<br>";
		}
		document.getElementById("debugOut").innerHTML += "},<br>";
	}*/


	//キャラクターの位置・向き
	if(helper != null && chr_mesh) {
		chr_mesh.position.set(chr_x,chr_y,chr_z);
		chr_mesh.rotation.x = Math.PI*0.02;	//少し後ろに寄りかかる
		chr_mesh.rotation.y = Math.PI*1.0;
	}

	//カメラ（cam_rotは非VR）
	if(isVR) {
		cam_rot_x = 0;
		cam_rot_y = 0;
		cam_rot_z = 0;
	}
	else {
		//マウスドラッグでカメラ回転
		//なめらかにする
		cam_vec_x *= 0.9;
		cam_vec_y *= 0.9;
		if(ms_flg != 0) {
			cam_vec_x += ((ms_cur_x - ms_last_x) / window.innerWidth ) * 0.15;
			cam_vec_y += ((ms_cur_y - ms_last_y) / window.innerHeight) * 0.15;
		}
		cam_rot_x += cam_vec_x;
		cam_rot_y += cam_vec_y;

		if		(cam_rot_x < -Math.PI) cam_rot_x += Math.PI*2;
		else if	(cam_rot_x >  Math.PI) cam_rot_x -= Math.PI*2;
		if		(cam_rot_y < -Math.PI/2) cam_rot_y = -Math.PI/2;
		else if	(cam_rot_y >  Math.PI/2) cam_rot_y =  Math.PI/2;
		ms_last_x = ms_cur_x;
		ms_last_y = ms_cur_y;
	}
	var cam_at = new THREE.Vector3(
		camera_x + Math.sin(cam_rot_x) * Math.cos(cam_rot_y) * 100,
		camera_y + Math.sin(cam_rot_y) * -100,
		camera_z + Math.cos(cam_rot_x) * Math.cos(cam_rot_y) * 100
	);
	user.position.set(camera_x, camera_y, camera_z);
	user.lookAt(cam_at);

	
	//天体
	if(astro_mesh) {
		astro_mesh.rotation.z = count/600.0;
	}
	if(astro_layer) {
		var k;
		for(k=0;k<3;k++) {
			for(i=0;i<10;i++) {
				var speed = count / (1000+i*50);
				astro_layer[k*10+i].rotation.y = speed;
	//			astro_layer[k*10+i].rotation.x = Math.sin(count/4000+i/1000) * Math.PI;
	//			astro_layer[k*10+i].rotation.z = Math.cos(count/4000+i/1000) * Math.PI;
			}
		}
	}
	var astr_x = astro_layer[0].rotation.x / (Math.PI) * 1.3;
	var astr_y = astro_layer[0].rotation.y / (Math.PI) * 1.3;
	pointLight.position.set(
		chr_x+Math.sin(astro_layer[0].rotation.y*1)*20,
		chr_y+60,
		chr_z+Math.cos(astro_layer[0].rotation.y*1)*20);
//	directionalLight.position.set(chr_x+Math.sin(astro_layer[0].rotation.y*10)*200, chr_y+180, chr_z+Math.cos(astro_layer[0].rotation.y*10)*200);
		

	/*if(near_mode == 0)*/ {
		while(astr_x > 1.0) astr_x -= 1.0;
		while(astr_y > 1.0) astr_y -= 1.0;
		//目の中を星が流れる
		//Reflectorを使わない方法
		eye_texture[0].offset.set( 1.0 - astr_y, 1.0 - astr_x );
		var c = Math.floor(count/10);
		eye_texture[2].offset.set( c%2/2, Math.floor(c/2)/2 );
	}
	//1.0超えてないかチェック
	for(i=0;i<faceCount;i++) {
		if (chr_mesh.morphTargetInfluences[i] > 1.0)
			chr_mesh.morphTargetInfluences[i] = 1.0;
	}

//		eye_mesh[0].material.map = eye_texture[1];
//		eye_mesh[1].material.map = eye_texture[1];
//	eye_yr += 0.05*Math.sin(count/10);
//	eye_xr += 0.05*Math.cos(count/10);
	//ハート目は視線に追従したいのでマトリクスに適用する。
	//それ以外はデフォルトの状態で取得される
	if(eye_mesh[0].material.map == eye_texture[1]) {
		findBone(chr_mesh,"左目").rotation.set(eye_xr,eye_yr,0);
		findBone(chr_mesh,"右目").rotation.set(eye_xr,eye_yr,0);
	}

		//手付けモーションがすべて終わってから一度マトリクスを更新し再度座標をとる
	chr_mesh.updateMatrixWorld( true );

	//体の部位に合わせて移動・位置調整
	{
		var list = [
			//目の反射
			{name:"左目2", mesh:eye_mesh[0], translate:[ 0.01+adj_x*0,-0.04, 0.01+adj_z*0], rotation:[ 0.06+adj_x, 0.38+adj_y*1, 0], scale:[1,0.8], order:-1},
			{name:"右目2", mesh:eye_mesh[1], translate:[-0.01-adj_x*0,-0.04, 0.01+adj_z*0], rotation:[ 0.06+adj_x,-0.38-adj_y*1, 0], scale:[1,0.8], order:-1},
/*
			{name:"左目2", mesh:eye_mesh[0], translate:[ 0.02,-0.02,0.05], rotation:[ 0.04, 0.4, 0], scale:[1,0.6], order:-1},
			{name:"右目2", mesh:eye_mesh[1], translate:[-0.02,-0.02,0.05], rotation:[-0.04,-0.4, 0], scale:[1,0.6], order:-1},
*/
			//桜髪飾り
			{name:"頭", mesh:obj_mesh[OBJ_SAKURA], translate:[1.22+adj_x*0, 1.74+adj_y*0, 0.84+adj_z*0], rotation:[0.9+adj_x*0, 0.82+adj_y*0, -0.72+adj_z*0], scale:[1,1], order:0},
			//腕時計（めり込む。却下）
//			{name:"左手首", mesh:obj_mesh[OBJ_WATCH], translate:[adj_x*0,adj_y*0,adj_z*0], rotation:[adj_x,adj_y,adj_z], scale:0.025, order:0},
		];
		//きらきら目（補正）
		if(eye_mesh[0].material.map == eye_texture[2]) {
			for(i=0;i<2;i++) {
				list[i].scale[0] = 0.6;
				list[i].scale[1] = 0.8;
				list[i].translate[Y] += 0.015;
				list[i].translate[Z] += 0.015;
				list[i].rotation[Y] += (i==0)? -0.1 : 0.1;
			}
		}
		//ハート目（補正）
		if(eye_mesh[0].material.map == eye_texture[1]) {
			for(i=0;i<2;i++) {
				list[i].scale[0] = 
				list[i].scale[1] = 0.2;
			}
//			list[0].translate[X] += adj_x;
			list[0].translate[Y] += 0.04;
//			list[0].translate[Z] += adj_z;

//			list[1].translate[X] += adj_x;
			list[1].translate[Y] += 0.04;
//			list[1].translate[Z] += adj_z;
		}

		var mat0,mat1,mat2,mat3,mat4,mat5,mat6;
		for(i=0;i<list.length;i++) {
			var scy = 1;
			switch(i) {
			case 0:
			case 1:
				//目の開閉状態でeye_meshの縦サイズを変える
				var eye = 1 - (chr_mesh.morphTargetInfluences[ FACE_MABATAKI ] + chr_mesh.morphTargetInfluences[ FACE_WARAU ]) * 1.2;
				if(eye < 0) eye = 0;
				if(eye < 0.6)	//目を閉じたら消す
					list[i].translate[2] -= 1;
				break;
			}
			var bone = findBone(chr_mesh,list[i].name);
			if(i<2 && 0) {
				mat0 = (new THREE.Matrix4()).copy(bone.parent.matrixWorld);	//親のマトリクス＋自身のtranslationで位置調整。回転が加わると向きがおかしなことになるため
				mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).copyPosition(bone.matrix));
			}
			else {
				mat0 = (new THREE.Matrix4()).copy(bone.matrixWorld);
			}
			mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(list[i].translate[0],list[i].translate[1]+(1-scy)*-0.22,list[i].translate[2]));
			mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeScale(list[i].scale[0], list[i].scale[1]*scy, list[i].scale[0]));
			mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(list[i].rotation[2]));
			mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(list[i].rotation[1]));
			mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(list[i].rotation[0]));
			//すべて適用
			list[i].mesh.matrix = mat0;
			list[i].mesh.matrixAutoUpdate = false;
			if(list[i].order) eye_mesh[i].renderOrder = list[i].order;
			
			//@note	目のまわりに透明の膜のようなものがある（まぶた？）
			//		そこにかかるとデプスバッファの関係でeye_meshが欠ける
			//		renderOrder=-1で描画優先度を変えると欠けなくなるが今度はハイライトが負けて消える
		}
//		findBone(chr_mesh,"左目Hi1").renderOrder
//		findBone(chr_mesh,"左目Hi2").renderOrder
//		findBone(chr_mesh,"右目Hi1").renderOrder
//		findBone(chr_mesh,"右目Hi2").renderOrder = 1;
	}
//	obj_mesh[OBJ_WATCH].rotation.x+=adj_x;
	obj_mesh[OBJ_SOFA].position.set(0,chr_default_y+6.5,chr_default_z-2.0);
	obj_mesh[OBJ_SOFA].scale.y = 0.9;	//頭が当たらないよう下げる
	obj_mesh[OBJ_SOFA].rotation.y=Math.PI;
	obj_mesh[OBJ_SOFA].morphTargetInfluences[2] = 1.8;	//横長さ

	//白目の部分も回転させているのでよくないかもだが
	if(eye_mesh[0].material.map != eye_texture[1]) {
		findBone(chr_mesh,"左目").rotation.set(eye_xr,eye_yr,0);
		findBone(chr_mesh,"右目").rotation.set(eye_xr,eye_yr,0);
	}
	
//	obj_mesh[OBJ_SOFA+1].position.set(0,chr_default_y+6.5,chr_default_z-20);
//	obj_mesh[OBJ_SOFA+1].rotation.y=count/60;
	}	//update loop
	// レンダリング
	//renderer.render(scene, camera);
	if(!isVR) {
		effect.render(scene, camera);
	}
	else {
		//window.requestAnimationFrame(render);
	}
}

function render() {
	/*if(isVR)*/ {
		my_update();
//		renderer.render(scene, camera);
		if(lightHelper) lightHelper.update();
		if(shadowCameraHelper) shadowCameraHelper.update();
		effect.render( scene, camera );
	}
}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	WindowCheck();
}


var firstBones = null;

function selectAnimation(mesh, index, loop)
{
	stopAnimation(mesh);
	

	var clip = chr_anim[index];
//		if(clip = null) return;
//		clip.resetDuration();

	//if(helper != null) {
	if(0) {
	//helper = new MMDAnimationHelper({ afterglow: 2.0, resetPhysicsOnLoop: true });
	//helper.enable( 'physics', true );
		helper.add(mesh, {
			animation: clip,
			physics: true
		});
		chr_physics = helper.objects.get( mesh ).physics;
		chr_physics.setGravity(0.98);
		if(physicsHelper == null) {
		physicsHelper = helper.objects.get( mesh ).physics.createHelper();
		physicsHelper.visible = false;
		scene.add( physicsHelper );
		}

//		mesh.updateMatrixWorld( true );
	}
		
	var mh = helper.objects.get(mesh);
	var mixer = mh.mixer;

	if ( mixer ) {

		if(!loop) {
			mixer.existingAction(clip).setLoop(THREE.LoopOnce);
		}
		else {
		}

//		mixer.stopAllAction();
		var action = mixer.clipAction( clip );
		action.weight = 1.0;
		action.play();
//		action.reset();
		if(!loop) {
			action.loop = THREE.LoopOnce;
			action.repetitions = 0;
		}
	}
	if(firstBones == null) {
//		helper.update(0.0166);
//		firstBones = helper.objects.get(mesh).backupBones;
	}
	else {
//		helper.objects.get(mesh).backupBones = firstBones;
//		helper.update(0.0166);
	}


//	return mixer;
}

function stopAnimation(mesh)
{
	var _mesh = helper.objects.get(mesh);
	if(_mesh == null) return;

	var mixer = _mesh.mixer;

	if ( mixer ) {
		var i;
		for(i=0;i<chr_anim.length;i++) {
			var action = mixer.clipAction( chr_anim[i] );
			if (action) {
				action.weight = 0.0;
				action.stop();
			}
		}

		mixer.stopAllAction();
//		mixer.setTime(0);
		//document.getElementById("debugOut").innerHTML += "stop ("+count+")<br>";
	}
	if(firstBones != null) {
//		helper.objects.get(mesh).backupBones = firstBones;
//		helper.update(0.0166);
	}
//	if(chr_physics != null {
//		physicsHelper = chr_physics.createHelper();
//	}
	if(physicsHelper != null) {
		//scene.add( physicsHelper );
	}
//	var clip = chr_anim[index];
//	helper.remove(mesh);

}



function keydown(event)
{
	if(event.keyCode == 87) {	//w
		key_w = true;
	}
	if(event.keyCode == 65) {	//a
		key_a = true;
	}
	if(event.keyCode == 83) {	//s
		key_s = true;
	}
	if(event.keyCode == 68) {	//d
		key_d = true;
	}

	if(event.keyCode == 81) {	//q
		key_q = true;
	}
	if(event.keyCode == 69) {	//e
		key_e = true;
	}

	if(event.keyCode == 16) {	//shift
		key_shift = true;
	}
	if(event.keyCode == 32) {	//space
		key_sp = true;
	}
//	document.getElementById("debugOut").innerHTML += "keydown="+event.keyCode;
}
function keyup(event)
{
	if(event.keyCode == 87) {	//w
		key_w = false;
	}
	if(event.keyCode == 65) {	//a
		key_a = false;
	}
	if(event.keyCode == 83) {	//s
		key_s = false;
	}
	if(event.keyCode == 68) {	//d
		key_d = false;
	}
	if(event.keyCode == 81) {	//q
		key_q = false;
	}
	if(event.keyCode == 69) {	//e
		key_e = false;
	}
	if(event.keyCode == 16) {	//shift
		key_shift = false;
	}
	if(event.keyCode == 32) {	//space
		key_sp = false;
	}
}
function findBone(mesh,name/*,nest*/)
{
	/*if(nest > 0) {
		nest++;
		var i;
		for(i=0;i<nest-1;i++) {
			document.getElementById("debugOut").innerHTML+="_";
		}
		document.getElementById("debugOut").innerHTML+="["+mesh.name+"]<br>";
	}*/
	if(mesh.name == name) {
		return mesh;
	}
	if(mesh == null) {
		return nulll;
	}
	
	if(mesh.children != null) {
		var i;
		for(i=0;i<mesh.children.length;i++) {
			var ptr = findBone(mesh.children[i], name/*,nest*/);
			if(ptr) {
				return ptr;
			}
		}
	}
	return null;
}

//線と線の交点チェック
function cross_check(xa,ya, xb,yb, xc,yc, xd,yd)
{
	var b = (xb - xa) * (yd - yc) - (yb - ya) * (xd - xc);
	if(b == 0) return false;
	
	var xac = xc - xa;
	var yac = yc - ya;
	var r = ((yd - yc) * xac - (xd - xc) * yac) / b;
	var s = ((yb - ya) * xac - (xb - xa) * yac) / b;

	cross_x = xa + r * (xb - xa);
	cross_y = ya + r * (yb - ya);

	if(r >= 0 && r <= 1 && s >= 0 && s <= 1) {
	return true;
	}
	return false;
}

//MouseDown
function mousedown(event) {
	onTouchDown(event.clientX, event.clientY);
}

function onTouchDown(_x,_y) {
	ms_cur_x = _x;
	ms_cur_y = _y;
	if(ms_flg == 0) {
		ms_start_x = ms_last_x = ms_cur_x;
		ms_start_y = ms_last_y = ms_cur_y;
	}
	ms_flg = 1;

//	document.getElementById("debugOut").innerHTML = "cr_x="+ms_cur_x+" cr_y="+ms_cur_y+" <br>";
//	document.getElementById("debugOut").innerHTML += "st_x="+ms_start_x+" st_y="+ms_start_y+" <br>";
}

//MouseMove
function mousemove(event) {
	onTouchMove(event.clientX, event.clientY);
}
function onTouchMove(_x,_y) {
	ms_cur_x = _x;
	ms_cur_y = _y;
//	document.getElementById("debugOut").innerHTML = "touch="+ms_cur_x+","+ms_cur_y+" <br>";
}


//MouseUp
function mouseup(event) {
	onTouchEnd();
}
function onTouchEnd() {
	ms_flg = 0;
	document.getElementById("debugOut").innerHTML = "";
}

function mousewheel(event) {
	var a = event.wheelDelta;
	camera_scale += a / 1400;
	if(camera_scale < 0.3) camera_scale = 0.3;
	if(camera_scale > 5.0) camera_scale = 5.0;
	//document.getElementById("debugOut").innerHTML = "wheel="+camera_scale;
	return false;
}

function CrossXZ(a, b) {

	return (a[X]*b[Z] - a[Z]*b[X]);
}
function CrossXY(a, b) {

	return (a[X]*b[Y] - a[Y]*b[X]);
}
function CrossYZ(a, b) {

	return (a[Y]*b[Z] - a[Z]*b[Y]);
}

function Dot(a, b) {

	var ax = a[X];
	var ay = a[Z];
	var bx = b[X];
	var by = b[Z];

	return (ax*bx + ay*by);
}

function polygon_side_check2d(a, b, c)
{
	//外積
	var d = Cross2D(b[X]-a[X], b[Y]-a[Y], c[X]-a[X], c[Y]-a[Y]);
	
	if(d <= 0) {
		return 1;
	}
	return 0;
}

function polygon_side_check3d(a, b, c, v)
{
	var ab = [b[X] - a[X], b[Y] - a[Y], b[Z] - a[Z]];
	var bc = [c[X] - a[X], c[Y] - a[Y], c[Z] - a[Z]];
	//AB,BC外積
	var c = Cross3D(ab, bc);
	var len = Math.sqrt(c[X]*c[X] + c[Y]*c[Y] + c[Z]*c[Z]);
	//内積
	var d = (c[X] * v[X]) + (c[Y] * v[Y]) + (c[Z] * v[Z]);

	if(len > 0) {
		return d / len;
	}
	return d;
}



function Cross2D(ax,ay, bx,by) {
	return ax*by - bx*ay;
}

function Cross3D(a,b) {
	return [
		a[Y]*b[Z] - a[Z]*b[Y],
		a[Z]*b[X] - a[X]*b[Z],
		a[X]*b[Y] - a[Y]*b[X]
	];
}

function Normalize(v) {
	var len = Math.sqrt(v[X]*v[X]+ v[Y]*v[Y]+ v[Z]*v[Z]);
	return [ v[X]/len, v[Y]/len, v[Z]/len ];
}
function Normalize2D(vx,vy) {
	var len = Math.sqrt(vx*vx+ vy*vy);
	return [ vx/len, vy/len ];
}

	
/*	
function RotMatX(m, rot) {
	var mat = m.elements;
	var s = Math.sin(rot);
	var c = Math.cos(rot);
	return [
		mat[ 0],mat[ 1],mat[ 2],mat[ 3],
		mat[ 4]*c+mat[8]*s,	mat[ 5]*c+mat[9]*s,	mat[ 6]*c+mat[10]*s,	mat[ 7]*c+mat[11]*s,
		mat[ 8]*c-mat[4]*s,	mat[ 9]*c-mat[5]*s,	mat[10]*c-mat[ 6]*s,	mat[11]*c-mat[ 7]*s,
		mat[12],			mat[13],			mat[14],				mat[15]
	];
}
function RotMatY(m, rot) {
	var mat = m.elements;
	var s = Math.sin(rot);
	var c = Math.cos(rot);
	return [
		mat[ 0]*c-mat[8]*s,	mat[ 1]*c-mat[9]*s,	mat[ 2]*c-mat[10]*s,	mat[ 3]*c-mat[11]*s,
		mat[ 4],			mat[ 5],			mat[ 6],				mat[ 7],
		mat[ 8]*c+mat[0]*s,	mat[ 9]*c+mat[1]*s,	mat[10]*c+mat[ 2]*s,	mat[11]*c+mat[ 3]*s,
		mat[12],			mat[13],			mat[14],				mat[15]
	];
}
*/
