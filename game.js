"use strict";

var ag_x = 0;
var ag_y = 0;
var ms_flg = 0;
var ms_x;
var ms_y;
var X = 0;
var Y = 1;
var Z = 2;

var isActive = 1;

var scr_scale = 1.0;

var cam_rot_y = 0;
var cam_rot_x = 0;
var cam_rot_z = 0;

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
var old_q,old_a,old_w,old_s,old_e,old_d;
var count = 0;
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
var action_type=0;
var action_count=0;

const ACTION_DELAY = -200;	//次のアクションまでの待機時間
const ACTION_YUBISASI = 1;
const ACTION_AKUBI = 2;
const ACTION_AIDUCHI = 3;
const ACTION_SMILE = 4;
const ACTION_NEAR_START = 5;
const ACTION_NEAR_END = 6;
const ACTION_SLEEP = 7;

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
	const FACE_HAW		= faceCount++;	//
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

const width = 960;
const height = 540;
var camera_x = 0;
var camera_y = 0;
var camera_z = 0;
var controller;//, controllerGrip, tempMatrix = new THREE.Matrix4();
var INTERSECTED;
var polyfill = new WebXRPolyfill();

var near_mode = 0;

var point_light;

/*
import { MMDLoader } from './three.js-master/examples/jsm/loaders/MMDLoader.js';
import { MMDAnimationHelper } from './three.js-master/examples/jsm/animation/MMDAnimationHelper.js';
import { OutlineEffect } from './three.js-master/examples/jsm/effects/OutlineEffect.js';
import { MMDPhysics } from './three.js-master/examples/jsm/animation/MMDPhysics.js';
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './three.js-master/examples/jsm/webxr/XRControllerModelFactory.js';
import { Reflector } from './three.js-master/examples/jsm/objects/Reflector.js';
*/
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

//	document.addEventListener("DOMContentLoaded", init);
//	Ammo = null;
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

function findBonePhysics(physics,name/*,nest*/)
{
	var i;
	document.getElementById("debugOut").innerHTML = ""
	for(i=0;i<physics.bodies.length;i++) {
		var ptr = findBonePhysics2(physics.bodies[i].bone, name);
		if(ptr){
			return ptr;
		}
	}
	document.getElementById("debugOut").innerHTML += "<br>見つからない:"+name+"<br>"
	return null;
}

function findBonePhysics2(bone,name/*,nest*/)
{
//	document.getElementById("debugOut").innerHTML += bone.name+"/"
	if(bone.name == name) {
		return bone;
	}
	if(bone.name.indexOf(name) != -1) {
		return bone;
	}
	var i;
	for(i=0;i<bone.children.length;i++) {
		var ptr = findBonePhysics2(bone.children[i], name);
		if(ptr) {
			return ptr;
		}
	}
	return null;
}


function init() {

	LoadingDisp();

	//非VR版
	if(window.location.search == "?noVR")
		isVR = 0;

	if(!isVR) {
		window.addEventListener('mousedown', mousedown, false );
		window.addEventListener('mouseup', mousemove, false );
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

	user.add(camera);
	scene.add(user);

	//キャラクターの初期位置
	chr_x = chr_default_x = camera_x + 8;
	chr_y = chr_default_y = camera_y - 19;
	chr_z = chr_default_z = camera_z + 0;

	//test
//	camera_x = 4;
//	camera_y = 22;	//chr_y
//	camera_z = chr_default_z - 10;

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
		eye_texture = new Array(2);
		eye_texture[0] = new THREE.TextureLoader().load( 'eye_star.jpg' );
		eye_texture[0].repeat.set( 0.166, 0.1 );
		eye_texture[0].rotation = 0; // rotation is around [ 0.5, 0.5 ]
		eye_texture[0].wrapS = eye_texture[0].wrapT = THREE.RepeatWrapping;
		eye_texture[1] = new THREE.TextureLoader().load( 'okzmmd/heart.png' );
		eye_texture[1].offset.set( 0,0 );

		//目のテクスチャ更新
		near_mode = -1;
		ChangeNear(0);
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
	const directionalLight = new THREE.DirectionalLight(
		0xffffff,0.2
	);
	directionalLight.position.set(0.5, 2, 3.5);
	// シーンに追加
//	scene.add(directionalLight);

//	const amb_light = new THREE.AmbientLight(0xFFFFFF, 0.2);
//	scene.add(amb_light);	
//	const amb_light = new THREE.AmbientLight(0,1);
//	scene.add(amb_light);	

	point_light = new THREE.PointLight(0xFFFFFF, 1, 100, 2);	//(色, 光の強さ, 距離, 光の減衰率)
	point_light.position.set(0, 60, 30);
	scene.add(point_light);
	
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
	document.body.appendChild( renderer.domElement );
	if(isVR) {
		document.body.appendChild( VRButton.createButton( renderer ) );
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
function ChangeNear(mode) {
	var i;
	//目のテクスチャ更新
	for(i=0;i<2;i++) {
		if(mode == 0 && near_mode != 0) {
			eye_mesh[i].material.map = eye_texture[0];
		}
		else if(mode != 0 && near_mode == 0) {
			eye_mesh[i].material.map = eye_texture[1];
		}
	}
	near_mode = mode;
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

	//ローディング終了
	if(count == 0 && chr_mesh) {
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
		var yuka_material = new THREE.MeshBasicMaterial( {
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
				sofa_clone.rotation.y = Math.PI;// +*/ -Math.atan2(y,x)/*Math.PI/2*/;
//				sofa_clone.scale.x = 2.6;
				scene.add(sofa_clone);
			}
			//座席段差
			var yuka_mesh = new THREE.Mesh(yuka_geometry, yuka_material);
			yuka_mesh.position.set(0,(y+8)*3-8,(y/10)*160+1);
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
		LoadEnd();		//ロード終わったのでUIの追加
		count++;
	}

	var delta = clock.getDelta();
	tickCount += delta;
	if(tickCount > 5) tickCount = 5;
//	document.getElementById("debugOut").innerHTML = "delta="+tickCount;
	while(tickCount >= 1.0/60.0)
	{
	document.getElementById("debugOut").innerHTML = "";
	count++;
	tickCount -= 1.0/60.0;
	if(helper) {
		helper.update( 0.0166 );
	}
	var offset_base = null;
	if(!old_q && key_q) adj_x += 0.02;
	if(!old_a && key_a) adj_x -= 0.02;
	if(!old_w && key_w) adj_y += 0.02;
	if(!old_s && key_s) adj_y -= 0.02;
	if(!old_e && key_e) adj_z += 0.02;
	if(!old_d && key_d) adj_z -= 0.02;
	old_q = key_q;
	old_a = key_a;
	old_w = key_w;
	old_s = key_s;
	old_e = key_e;
	old_d = key_d;


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
//		document.getElementById("debugOut").innerHTML = "adj "+adj_x+","+adj_y+","+adj_z+"<br>";
//		neck_r = 0.7;
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
		
	//ひざ
	var knee_zl = Math.PI/2*0.1;
	var knee_zr = knee_zl;

	
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
	if(action_type == 0 && action_count >= 0 && 1) {
		//すり寄り
		if(Math.random()<0.004) {
			if(near_mode == 0) {
				action_type = ACTION_NEAR_START;
				action_count = 0;
			}
			else {
				action_type = ACTION_NEAR_END;
				action_count = 0;
			}
		}
		//指さし
		else if(Math.random()<0.01) {
			action_type = ACTION_YUBISASI;
			action_count = 0;
		}
		//あくび
		else if(Math.random()<0.005) {
			action_type = ACTION_AKUBI;
			action_count = 0;
		}
		//相づち
		else if(Math.random()<0.01) {
			action_type = ACTION_AIDUCHI;
			action_count = 0;
		}
		//にっこり
		else if(Math.random()<0.01) {
			action_type = ACTION_SMILE;
			action_count = 0;
		}
		
	}
	else {
		action_count++;
	}
	//動作
	switch(action_type) {
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
			if(near_mode != 0 && Math.random()<0.4) {
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
			ChangeNear((action_type == ACTION_NEAR_START)?1:0);
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
		else if(action_count >= 1000-60) {
			nk = (action_count-(1000-60))/60;
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
		if(action_count >= 1000) {
//			ActionEnd();
			action_count = 0;
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
	findBone(target,"右腰C",0)   .rotation.set(-Math.PI/2*0.8 , 0,-Math.PI/2*0.01);
	findBone(target,"左腰C",0)   .rotation.set(-Math.PI/2*0.8 , 0, Math.PI/2*0.01);
	findBone(target,"右ひざ＋",0).rotation.set( Math.PI/2*0.65, 0,-knee_zl);
	findBone(target,"左ひざ＋",0).rotation.set( Math.PI/2*0.65, 0, knee_zr);
	findBone(target,"右足首＋",0).rotation.set( Math.PI/2*0.4, Math.PI/2*0.1,-Math.PI/2*0);
	findBone(target,"左足首＋",0).rotation.set( Math.PI/2*0.4,-Math.PI/2*0.1, Math.PI/2*0);

	//

	document.getElementById("debugOut").innerHTML += "adj:("+adj_x+","+adj_y+","+adj_z+")<br>";
//				document.getElementById("debugOut").innerHTML = "action("+action_type+"):"+action_count+"<br>";

	//指さししながら何かしゃべる
	var yubisasi = 0;
	var talk = 0;
	if(action_type == ACTION_YUBISASI) {
		yubisasi = action_count;
		if (yubisasi < 60) yubisasi = yubisasi / 60.0;
		else if(yubisasi < 300-60) yubisasi = 1.0;
		else yubisasi = (300-yubisasi)/60.0;

		if(action_count <= 240) talk = 1;
		if(action_count >= 300) {
			ActionEnd();
		}

		yubisasi = Math.sin(yubisasi * Math.PI/2);
		arm_l1[0] *= (1.0-yubisasi);
		arm_l1[1] *= (1.0-yubisasi);
		arm_l1[2] *= (1.0-yubisasi);
		arm_l2[0] *= (1.0-yubisasi);
		arm_l2[1] *= (1.0-yubisasi);
		arm_l2[2] *= (1.0-yubisasi);
		arm_l3[0] *= (1.0-yubisasi);
		arm_l3[1] *= (1.0-yubisasi);
		arm_l3[2] *= (1.0-yubisasi);

		arm_l1[0] += (-0.75)*yubisasi;
		arm_l1[1] += (-0.05)*yubisasi;
		arm_l1[2] += ( 0.7 )*yubisasi;
		arm_l2[0] += ((0)*yubisasi);
		arm_l2[1] += ((1.6-neck_r*0.3)*yubisasi);
		arm_l2[2] += ((-0.4-neck_r*0.3)*yubisasi);
		arm_l3[1] += ((0.5)*yubisasi);
	}
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
		var nigiri = 0.7 + Math.round(i/3)*0.1;
		findBone(target,"右"+finger_name[i],0).rotation.z	=  Math.PI/2*((nigiri*(1-hand_par[0])) + (0.1 * hand_par[0]));

		if(i<3) nigiri *= (1.0-yubisasi*0.85);
		findBone(target,"左"+finger_name[i],0).rotation.z	= -Math.PI/2*((nigiri*(1-hand_par[1])) + (0.1 * hand_par[1]));
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
		cam_rot_z = 100;
	}
	else {
		var rx = (ms_x - width /2) * Math.PI / width * 1.2;
		var ry = (ms_y - height/2) * Math.PI / height;
		cam_rot_x = Math.sin(rx) * -100;
		cam_rot_y = Math.sin(ry) * -100;
		cam_rot_z = Math.cos(ry) * -100 * Math.cos(rx);
	}

	user.position.set(camera_x, camera_y, camera_z);
	user.lookAt(new THREE.Vector3(camera_x + cam_rot_x, camera_y + cam_rot_y, camera_z + cam_rot_z));
//	camera.lookAt(new THREE.Vector3(cam_rot_x, cam_rot_y, cam_rot_z));

	
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
	point_light.position.set(0, 30+Math.sin(count/40)*30, 30);


	if(near_mode == 0) {
		//目の中を星が流れる
		//Reflectorを使わない方法
		for(i=0;i<2;i++) {
			var texture = eye_mesh[i].material.map;
	//		texture.offset.set( 1.0 - (count%600)/600,0 );
			var rx = astro_layer[0].rotation.x / (Math.PI) * 1.3;
			var ry = astro_layer[0].rotation.y / (Math.PI) * 1.3;
			if(i==1) x += 0.9;	//視差分ずらす
			while(rx > 1.0) rx -= 1.0;
			while(ry > 1.0) ry -= 1.0;
			texture.offset.set( 1.0 - ry, 1.0 - rx );
		}
	}
	//1.0超えてないかチェック
	for(i=0;i<faceCount;i++) {
		if (chr_mesh.morphTargetInfluences[i] > 1.0)
			chr_mesh.morphTargetInfluences[i] = 1.0;
	}

	//手付けモーションがすべて終わってから一度マトリクスを更新し再度座標をとる
	chr_mesh.updateMatrixWorld( true );

	//体の部位に合わせて移動・位置調整
	{
		var list = [
			//目の反射
			{name:"左目2", mesh:eye_mesh[0], translate:[ 0.06,-0.04,-0.03], rotation:[ 0.06, 0.48, 0], scale:[1,0.7], order:-1},
			{name:"右目2", mesh:eye_mesh[1], translate:[-0.06,-0.04,-0.0 ], rotation:[ 0.06,-0.48, 0], scale:[1,0.7], order:-1},
/*
			{name:"左目2", mesh:eye_mesh[0], translate:[ 0.02,-0.02,0.05], rotation:[ 0.04, 0.4, 0], scale:[1,0.6], order:-1},
			{name:"右目2", mesh:eye_mesh[1], translate:[-0.02,-0.02,0.05], rotation:[-0.04,-0.4, 0], scale:[1,0.6], order:-1},
*/
			//桜髪飾り
			{name:"頭", mesh:obj_mesh[OBJ_SAKURA], translate:[1.22+adj_x*0, 1.74+adj_y*0, 0.84+adj_z*0], rotation:[0.9+adj_x*0, 0.82+adj_y*0, -0.72+adj_z*0], scale:[1,1], order:0},
			//腕時計（めり込む。却下）
//			{name:"左手首", mesh:obj_mesh[OBJ_WATCH], translate:[adj_x*0,adj_y*0,adj_z*0], rotation:[adj_x,adj_y,adj_z], scale:0.025, order:0},
		];
		if(near_mode != 0) {	//ハート
			for(i=0;i<2;i++) {
				list[i].scale[0] = 
				list[i].scale[1] = 0.2;
			}
//			list[0].translate[X] += eye_yr * adj_x;
			list[0].translate[X] += eye_yr * 0;
			list[0].translate[Y] += eye_yr * 0;
			list[0].translate[Z] += eye_yr * 0.04;

			list[1].translate[X] += eye_yr * 1.12;
			list[1].translate[Y] += eye_yr * 0.06;
			list[1].translate[Z] += eye_yr * 0.22;
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
				if(near_mode == 0)
					scy = eye;
				else if(eye < 0.3)	//目を閉じたら消す
					scy = 0;
				break;
			}
			var bone = findBone(chr_mesh,list[i].name);
			mat0 = (new THREE.Matrix4()).copy(bone.parent.matrixWorld);	//親のマトリクス＋自身のtranslationで位置調整。回転が加わると向きがおかしなことになるため
			mat1 = (new THREE.Matrix4()).copyPosition(bone.matrix);
			mat2 = (new THREE.Matrix4()).makeTranslation(list[i].translate[0],list[i].translate[1]+(1-scy)*-0.22,list[i].translate[2]);
			mat3 = (new THREE.Matrix4()).makeRotationZ(list[i].rotation[2]);
			mat4 = (new THREE.Matrix4()).makeRotationY(list[i].rotation[1]);
			mat5 = (new THREE.Matrix4()).makeRotationX(list[i].rotation[0]);
			mat6 = (new THREE.Matrix4()).makeScale(list[i].scale[0],list[i].scale[1]*scy,list[i].scale[1]);
			mat5.multiply(mat6);
			mat4.multiply(mat5);
			mat3.multiply(mat4);
			mat2.multiply(mat3);
			mat1.multiply(mat2);
			mat0.multiply(mat1);
/*			//回転だけ適用されない
			var item_pos = (new THREE.Vector3()   ).setFromMatrixPosition(mat0);
			var item_rot = (new THREE.Quaternion()).setFromRotationMatrix(mat0);
			var item_scl = (new THREE.Vector3()   ).setFromMatrixScale(mat0);
			list[i].mesh.scale.set(item_scl.x, item_scl.y, item_scl.z);
			list[i].mesh.quaternion.set(item_rot.x, item_rot.y, item_rot.z, item_rot.w);
			list[i].mesh.position.set(item_pos.x, item_pos.y, item_pos.z);
*/
			//すべて適用
			list[i].mesh.matrix = mat0;
			list[i].mesh.matrixAutoUpdate = false;
			if(list[i].order) eye_mesh[i].renderOrder = list[i].order;
			
			//@note	目のまわりに透明の膜のようなものがある（まぶた？）
			//		そこにかかるとデプスバッファの関係でeye_meshが欠ける
			//		renderOrder=-1で描画優先度を変えると欠けなくなるが今度はハイライトが負けて消える
		}
	}
//	obj_mesh[OBJ_WATCH].rotation.x+=adj_x;
	obj_mesh[OBJ_SOFA].position.set(0,chr_default_y+6.5,chr_default_z-1);
	obj_mesh[OBJ_SOFA].rotation.y=Math.PI;
	obj_mesh[OBJ_SOFA].morphTargetInfluences[2] = 1.8;	//横長さ

	findBone(chr_mesh,"左目").rotation.set(eye_xr,eye_yr,0);
	findBone(chr_mesh,"右目").rotation.set(eye_xr,eye_yr,0);
//	findBone(chr_mesh,"左目").rotation.y += eye_yr;
//	findBone(chr_mesh,"右目").rotation.y += eye_yr;
	
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
	ms_x = event.layerX / scr_scale;
	ms_y = event.layerY / scr_scale;
	ms_x = event.clientX;
	ms_y = event.clientY;
	down(0);
}

function down(hantei) {
	if(ms_flg == 0) {
		ag_x = ms_x;
		ag_y = ms_y;
		ms_flg = 1;
	}

//	document.getElementById("debugOut").innerHTML = "ms_x="+ms_x+" ms_y="+ms_y+" <br>";
//	document.getElementById("debugOut").innerHTML += "ag_x="+ag_x+" ag_y="+ag_y+" <br>";
}

//MouseMove
function mousemove(event) {
	ms_x = event.layerX / scr_scale;
	ms_y = event.layerY / scr_scale;
	ms_x = event.clientX;
	ms_y = event.clientY;
}


//MouseUp
function mouseup(event) {
	if(ms_flg == 1) {
		mousemove(event);
	}
	touchend();
}
function touchend() {
	if(ms_flg == 1) {
		ms_flg = 0;
	}
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

