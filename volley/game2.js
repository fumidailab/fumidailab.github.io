"use strict";

//Man to Spike! 未央とビーチバレー

const debug = 0;
const game_end_score = 10;	//ゲームセット点数
const game_scale = 15.0;
var game_view = 1;		//0:一人称（対戦）モード 1:ノーマル（ゲーム） 2:観戦モード
var game_player = 1;		//操作するキャラ 
const isOcean = 0;

var tutorial = {			//チュートリアルモード
	enable : false,
	pause : 0,		//一時停止
	step : -1,
	msg_count : 0,
	count : 0,
	wait : 0,
	org_msg : "",
	select : -1,
};
var option;/* = {
	sound : 0,
	camera_mode : 0,
	move_mode : 0,
	tutorial_flag : 0,
	light_mode : 0,
};*/
const default_data = {
	"game_level"	: 1,
	"sound"			: 0,
	"camera_mode"	: 0,
	"move_mode"		: 1,
	"tutorial_flag"	: 0,
	"light_mode"	: 0,
};

var container;

var ms_button = -1;
var ms_cur_x = 0;
var ms_cur_y = 0;
var ms_last_x;
var ms_last_y;
var ms_wheel = 2.5;
var ms_click = 0;
var ms_court = null;//THREE.Vector3(0,0,0);	//マーカー
var ms_sp = 0;
var ms_msg_click = 0;

const stage_rotate_x = 0.092;

var stats;
var postprocessing = {};

var enableUI = false;
var isOption = 0;
var PauseFlag = 0;
var isActive = 1;
var debug_mode1 = 0;
var camera_default_x;
var camera_default_y;
var camera_default_z;

var cam_rot_y = 0;
var cam_rot_x = 0;
var cam_rot_z = 0;
var cam_vec_y = 0;
var cam_vec_x = 0;
const cam_default_rot_x = Math.PI/-8;
const cam_default_rot_y = Math.PI/-2;
var game_camera = {
	position: new THREE.Vector3(0,200,-200),
	rotation: new THREE.Vector3(0,0,0),
	zoom: 8,
	rate: 1,
};
var next_camera = {
	position: null,
	rotation: null,
	zoom: -1,
	rate: 1,
};
var court_center;
var chair_pos = new THREE.Vector3(230,-7.5,-50);
//var chair_meshs;
const chair_index = 18;
var org_light_mode = 0;

var load_progress = 0;
var load_progress2 = 0;
var load_seq;
var chr_mesh;
var player_mesh;
var chr_anim = new Array();
var obj_mesh = new Array();
var helper,ikHelper;
var ikSolver;
var outline_renderer;
var chr_default_x = 0;
var chr_default_y = 0;
var chr_default_z = 0;
var key_a,key_s,key_d,key_w,key_q,key_e,key_shift=false,key_sp=false;
var key_r,key_f,key_t,key_g,key_y,key_h;
var old_q,old_a,old_w,old_s,old_e,old_d,old_sp;
var old_r,old_f,old_t,old_g,old_y,old_h;
var count = 0;
var count2 = 0;
var count3 = 0;
var scene;
var camera;
var renderer;
var clock = new THREE.Clock();;
var mmd_loader;
var fbx_loader;
var vrm_loader;
var isVR=0;
var world_view;
var ball;
var debug_obj1;	//デバッグ用Mesh
var debug_obj2;	//デバッグ用Mesh
//var ground_max_height;
//var guide_mesh;
var foot_physics = new Array(4);	//足跡
var foot_meshs;
var surf_body;
var surf_meshs;
var lensflare;
var is_night = 0;
var butterfly_meshs;
var firefly_meshs;
var guide_meshs = new Array();
var sand_meshs;
var sand_param = new Array(40);
var ocean;

var audio = new Array();
var audio_listener;
//var sound_enable = 0;
var audio_pause = new Array();

var camera_x = 0;
var camera_y = 0;
var camera_z = 0;
var player_x = 0;
var player_y = 0;
var player_z = 0;
var cameraLock = 0;
var hand_pos = new THREE.Vector3();
//var polyfill = new WebXRPolyfill();

var sun_position = new THREE.Vector3(0,150,0);	//太陽の場所
var pointLight;
var directionalLight;
var ambientLight;
var physics;
const physics_speed = 3;
var court_net;
var net_atari = 0;//new Array();

const GROUP_GROUND = 1|2|4|8;
const GROUP_BALL = 1|2;		//ボール
const GROUP_HAND = 2;		//手
const GROUP_FOOT = 4;		//足
const GROUP_OBJ  = 1|4|8;	//オブジェ

//ゲーム部
var chrs = [player_mesh, chr_mesh];
var life_damage = [0,0];	//疲労度
var damage_flag = [0,0];	//疲労解除
var game_mode = 0;
var game_count = 0;
var atari_disable = 0;	//ブロック失敗時に使う
var judge_flag = -1;
var game_rally = 0;

const MODE_BEGIN   = 0;		//落ちているボールをとりにいく
const MODE_PICKUP  = 1;		//拾う
const MODE_INCOURT = 2;		//コート内へ移動
const MODE_SERVE   = 3;		//サーブ
const MODE_RALLY   = 4;		//ラリー状態

var serve_player = 1;	//サーブ権を持つ側（対戦時は常に1=相手側）
var ball_start  = new THREE.Vector3();
var ball_target = new THREE.Vector3();
var ball_drop1  = new THREE.Vector3();	//相手用
var ball_drop2  = new THREE.Vector3();	//自分用
var hand_debug_mesh = null;
var hand_physics;
var ball_time_max = 0;	//落下予測時間（最大）
var ball_time_cur = 0;	//落下予測時間（現在）
var last_shot_pos = new Array();

var text_geo;
var text_mesh;
var score = [0,0];		//獲得スコア 0:自分 1:相手
var score_plus = [0,0];	//加算
var touch_type = -1;	//最後に触った 0:自分 1:相手
var score_anim = 0;
var day_time = 8;		//時刻（0-24）

var hit_effects;
var hit_param;
var ball_effect;

var attack_circle;
var attack_hit = 0;		//クリーンヒット
var attack_flag = 0;	//カーソル出してる
var attack_next = 0;	//相手にアタックさせるか？ 0:通常レシーブ 1:アタックさせる（チャンスボール） 2:ブロック
var attack_on = 0;		//アタックした
var effect = new Array(10);	//effect

var contact_mat;
var hand_mat;
var ball_mat;
var wall_mat;
var ground_mat;

var ball_turn_count=0;		//プレイヤーが跳ね返したカウンタ
var ball_ground_count = 0;	//地面についた
var ball_flying = 0;		//飛んでいる
var atk_mot_count = [0,0];
var atk_mot_start = [0,0];

//const court_w = 160;
//const court_h = 80;
const court_w = 140;
const court_h = 70;

const wall_w = court_w * 2.5;
const wall_h = court_h * 2.5;

const player_h = 15;	//目線の高さ

//local
import { MMDLoader } from '../three.js-master/examples/jsm/loaders/MMDLoader.js';
//import { FBXLoader } from '../three.js-master/examples/jsm/loaders/FBXLoader.js';
//import { VRMLoader } from "../three.js-master/examples/jsm/loaders/VRMLoader.js";
import { MMDAnimationHelper } from '../three.js-master/examples/jsm/animation/MMDAnimationHelper.js';
import { OutlineEffect } from '../three.js-master/examples/jsm/effects/OutlineEffect.js';
//import { MMDPhysics } from '../three.js-master/examples/jsm/animation/MMDPhysics.js';
import { VRButton } from '../three.js-master/examples/jsm/webxr/VRButton.js';
//import { XRControllerModelFactory } from '../three.js-master/examples/jsm/webxr/XRControllerModelFactory.js';
//import { Reflector } from '../three.js-master/examples/jsm/objects/Reflector.js';
//import { CANNON } from '../three.js-master/examples/js/libs/cannon.js';
import { CannonPhysics } from './CannonPhysics.js';	//改造版
import { CCDIKSolver } from '../three.js-master/examples/jsm/animation/CCDIKSolver.js';
//import Stats from '../three.js-master/examples/jsm/libs/stats.module.js';
import { Lensflare, LensflareElement } from '../three.js-master/examples/jsm/objects/Lensflare.js';
//import { Ocean } from '../three.js-master/examples/jsm/misc/Ocean.js';

//import { EffectComposer } from '../three.js-master/examples/jsm/postprocessing/EffectComposer.js';
//import { RenderPass } from '../three.js-master/examples/jsm/postprocessing/RenderPass.js';
//import { BokehPass } from '../three.js-master/examples/jsm/postprocessing/BokehPass.js';

var modelFile = "./mioMizugi/mioMizugi3.pmx";
//var modelFile = "./mioStar/mioStar.pmx";
//var modelFile = "./Kotori_SW301/Kotori_SW301.pmx";
//var modelFile = "../three.js-master/examples/models/mmd/miku/miku_v2.pmd";
var modelFile2 = "./player/suitp.pmx";
//var modelFile3 = "./butterfly/butterfly.pmx";


var objFiles = [
//	"stage/stage.pmx",
//	"mmd_batokin_island/skydome.pmx",
	"beach/skydome.pmx",
	"beach/beach4.pmx",
//	"beach/sea.pmx",
//	"mmd_batokin_island/batokin_island5.pmx",
	"model/beachball.pmx",
	"model/beachset.pmx",
	"model/yashitree.pmx",
	"model/pinya_surf.pmx",
	"./butterfly/butterfly.pmx",
//	"tamachan.vrm",
//	"model/Yashinoki.pmx",
//	"ship/ship.pmx",
];
//vmdのファイルPATHとそれに対応するタグの配列
var	vmdFiles = [
//	"../three.js-master/examples/models/mmd/vmds/wavefile_v2.vmd",
	"./motion/stand.vmd",
];

var tex_list = new Array();
const TEX_STAR = 0;
const TEX_BUBBLE = 1;
const TEX_FLARE0 = 2;
const TEX_FLARE3 = 3;
const TEX_WHITEFADE = 4;
const TEX_TEXTFONT1 = 5;
const TEX_TEXTFONT2 = 6;
const TEX_BALLEFFECT = 7;
const TEX_FIREFLY = 8;
const TEX_FACE = 9;
const TEX_SAND = 10;

var texFiles = [
//	"./texture/my_hand.png",
	"./texture/star128.png",
	"./texture/bubble.png",
	"./texture/lensflare0.png",
	"./texture/lensflare3.png",
	"./texture/whitefade.png",
	"./texture/textfont.png",
	"./texture/textfont.png",
	"./texture/balleff.png",
	"./texture/firefly.png",
	"./texture/faceicon.png",
	"./texture/sand.png",

	//モデルテクスチャの先読み
	"./texture/stripe.png",
	"./texture/surf_paint.jpg",
	"./texture/tx_palm1.png",
	"./texture/tx_palm2.png",

	"./mioMizugi/textures/HAIR.png",
	"./mioMizugi/textures/HB.png",
	"./mioMizugi/textures/SW07B.png",
	"./mioMizugi/textures/SW7.png",
	"./mioMizugi/textures/body.png",
	"./mioMizugi/textures/eye.png",
	"./mioMizugi/textures/eyeR.png",
	"./mioMizugi/textures/face.png",
	"./mioMizugi/textures/hair-b.bmp",
	"./mioMizugi/textures/kuti.png",
	"./mioMizugi/textures/mayu.png",
	"./mioMizugi/textures/tere.png",

	//
	"./player/eyehige.png",
	"./player/foot.png",
	"./player/other.png",
	"./player/ribbon.png",
	"./player/skin.png",
	"./player/wear.png",

	//beach
	"./beach/Grass2.jpg",
	"./beach/FarMountain.png",
	"./beach/korokoro.png",
	"./beach/milkyway.png",
	"./beach/moon.png",
	"./beach/Mountain01.png",
	"./beach/Mountain02.png",
	"./beach/Mountain03.png",
	"./beach/Mountain04.png",
	"./beach/Mountain05.png",
	"./beach/Mountain06.png",
	"./beach/Rock01.png",
	"./beach/Rock02.png",
	"./beach/Rock03.png",
	"./beach/Sand.png",
	"./beach/skydome.png",
	"./beach/starysky.png",
//	"./beach/TreeLeaves.png",
	"./beach/Water.png",
	"./beach/Water01Wave.png",
	"./beach/Water02Wave.png",
//	"./beach/Wood.png",
//	"./beach/Wood01.png",
];
const SOUND_BGM  = 0;
const SOUND_RUN  = 1;
const SOUND_BALL = 2;
const SOUND_WHISTLE_BEGIN = 3;
const SOUND_WHISTLE_END = 4;
const SOUND_CHEER = 5;
const SOUND_BLOCK = 6;
const SOUND_SPIKE = 7;
const SOUND_CIRCLE = 8;
var audioFile = [
	"sound/bgm_maoudamashii_acoustic34.mp3",
	"sound/run.mp3",
	"sound/ball.mp3",
	"sound/whistle1.mp3",
	"sound/whistle2.mp3",
	"sound/people-performance-cheer1.mp3",
	"sound/heavy_punch1.mp3",
	"sound/game_explosion3.mp3",
	"sound/cutin.mp3",
];
const volumeTbl = [
	0.1,	//BGM
	0.1,	//RUN
	1.0,	//BALL
	1.0,	//WHISTLE_BEGIN
	1.0,	//WHISTLE_END
	1.0,	//CHEER
//	0.2,	//HIT
	1.0,	//BLOCK
	1.0,	//SPIKE
	0.7,	//CIRCLE
];

var anim_current = 0;
var anim_prev = -1;
var anim_count = 0;
var anim_ones = 0;
var objNum=0;
const OBJ_SKYDOME = objNum++;	//お空
const OBJ_STAGE = objNum++;		//島（大）
//const OBJ_SEA = objNum++;		//海
const OBJ_BALL = objNum++;		//ビーチボール
const OBJ_BEACHSET = objNum++;		//パラソル・チェア
const OBJ_TREE = objNum++;		//やしの木
const OBJ_SURF = objNum++;		//サーフボード
const OBJ_BUTTERFLY = objNum++;		//ちょうちょ
//const OBJ_SHIP = objNum++;		//ふね
//const OBJ_TAMAMI = objNum++;		//

//手付けモーション
var anim_user = new Array(2);

/*onload = function()*/{

//	MessageWindowDisp(false);

	//MMDPhysicsで使う
	/*Ammo().then( function ( AmmoLib ) {
		Ammo = AmmoLib;
	} );*/

	init();
	animate();

	//ウィンドウの表示・非表示状態をチェック
	document.addEventListener('webkitvisibilitychange', function(){
	if ( document.webkitHidden ) {
		if(isActive && option.sound) SoundPause();
		// 非表示状態
		isActive = 0;
	} else {
		if(!isActive && option.sound) SoundRestart();
		// 表示状態
		isActive = 1;
	}
	}, false);

}

/*function initPostprocessing() {

	var renderPass = new RenderPass( scene, camera );

	var bokehPass = new BokehPass( scene, camera, {
		focus: 1.0,
		aperture: 0.025,
		maxblur: 0.01,

		width : window.innerWidth,
		height: window.innerHeight
	} );

	var composer = new EffectComposer( renderer );

	composer.addPass( renderPass );
	composer.addPass( bokehPass );

	postprocessing.composer = composer;
	postprocessing.bokeh = bokehPass;

}*/

/**
 * ユーティリティ
 * @returns {{shape2mesh: shape2mesh}}
 * @constructor
 */
function Utility() {

	return {
		shape2mesh: shape2mesh
	};

	// cannon.jsで作成したbodyからthree.js用のmeshを作成
	function shape2mesh(params){
		var body = params.body;
		var color = params.color;
		//
		if (!color && color != 0) color = 0xdddddd;
		var obj = new THREE.Object3D();
		for (var l = 0; l < body.shapes.length; l++) {
			var shape = body.shapes[l];
			var mesh;
			var geometry;
			var i;
			switch(shape.type){
				case CANNON.Shape.types.SPHERE:
					geometry = new THREE.SphereGeometry(shape.radius, 8, 8);
					mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
					break;
				case CANNON.Shape.types.PARTICLE:
					mesh = new THREE.Mesh(this.particleGeo, this.particleMaterial);
					mesh.scale.set(10 , 10, 10);
					break;
				case CANNON.Shape.types.PLANE:
					geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
					mesh = new THREE.Object3D();
					var submesh = new THREE.Object3D();
					var ground = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
					ground.scale.set(100, 100, 100);
					submesh.add(ground);
					ground.castShadow = true;
					ground.receiveShadow = true;
					mesh.add(submesh);
					break;
				case CANNON.Shape.types.BOX:
					geometry = new THREE.BoxGeometry(shape.halfExtents.x*2, shape.halfExtents.y*2, shape.halfExtents.z*2);
					mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
					break;
				case CANNON.Shape.types.CONVEXPOLYHEDRON:
					geometry = new THREE.Geometry();
					for (i = 0; i < shape.vertices.length; i++) {
						var v = shape.vertices[i];
						geometry.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
					}
					for(i=0; i < shape.faces.length; i++){
						var face = shape.faces[i];
						var a = face[0];
						for (j = 1; j < face.length - 1; j++) {
							var b = face[j];
							var c = face[j + 1];
							geometry.faces.push(new THREE.Face3(a, b, c));
						}
					}
					geometry.computeBoundingSphere();
					geometry.computeFaceNormals();
					mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
					break;
				case CANNON.Shape.types.HEIGHTFIELD:
					geometry = new THREE.Geometry();
					var v0 = new CANNON.Vec3();
					var v1 = new CANNON.Vec3();
					var v2 = new CANNON.Vec3();
					for (var xi = 0; xi < shape.data.length - 1; xi++) {
						for (var yi = 0; yi < shape.data[xi].length - 1; yi++) {
							for (var k = 0; k < 2; k++) {
								shape.getConvexTrianglePillar(xi, yi, k===0);
								v0.copy(shape.pillarConvex.vertices[0]);
								v1.copy(shape.pillarConvex.vertices[1]);
								v2.copy(shape.pillarConvex.vertices[2]);
								v0.vadd(shape.pillarOffset, v0);
								v1.vadd(shape.pillarOffset, v1);
								v2.vadd(shape.pillarOffset, v2);
								geometry.vertices.push(
										new THREE.Vector3(v0.x, v0.y, v0.z),
										new THREE.Vector3(v1.x, v1.y, v1.z),
										new THREE.Vector3(v2.x, v2.y, v2.z)
								);
								i = geometry.vertices.length - 3;
								geometry.faces.push(new THREE.Face3(i, i+1, i+2));
							}
						}
					}
					geometry.computeBoundingSphere();
					geometry.computeFaceNormals();
					mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
					break;
			}
			mesh.receiveShadow = true;
			mesh.castShadow = true;
			if(mesh.children){
				for(i=0; i<mesh.children.length; i++){
					mesh.children[i].castShadow = true;
					mesh.children[i].receiveShadow = true;
					if(mesh.children[i]){
						for(var j=0; j<mesh.children[i].length; j++){
							mesh.children[i].children[j].castShadow = true;
							mesh.children[i].children[j].receiveShadow = true;
						}
					}
				}
			}
			var o = body.shapeOffsets[l];
			var q = body.shapeOrientations[l];
			mesh.position.set(o.x, o.y, o.z);
			mesh.quaternion.set(q.x, q.y, q.z, q.w);
			obj.add(mesh);
		}
		return obj;
	}

}

function init() {

	DispGameUI(false);
	StorageLoad();
	
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	//非VR版
	if(window.location.search == "?isVR") {
		isVR = 1;
		game_view = 0;
		game_player = 0;
	}
	else if(window.location.search == "?auto") {
		game_view = 2;
	}

//	if(isVR || game_view != 1) {
		//使わないボタンを非表示に
		document.getElementById( 'Move' ).style.display = "none";
		document.getElementById( 'Camera' ).style.display = "none";
//	}
	
	// レンダラーを作成
	renderer = new THREE.WebGLRenderer({
		antialias: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = true;
	if(isVR) {
		renderer.xr.enabled = true;
		renderer.xr.setReferenceSpaceType( 'local' );
		//renderer.outputEncoding = THREE.sRGBEncoding;	//なんか白っぽくなる
	}	
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	
	// シーンを作成
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xa0a0ff );

	world_view = new THREE.Object3D();
	// カメラを作成
	var camera_scale = (isVR) ? 1 : game_scale;
	camera = new THREE.PerspectiveCamera(	//(視野角, アスペクト比, near, far)
		50,	//FOV
		window.innerWidth / window.innerHeight,
		0.1*camera_scale,
		500*camera_scale,
	);
//	camera.position.set(0,0,0);
//	camera.lookAt(new THREE.Vector3(0,0,-20));
//	scene.add(camera);

	//キャラクターの初期位置
	chr_default_x = court_w/4;
	chr_default_y = 15;
	chr_default_z = 0;//court_h * (Math.random()-0.5) * 2;

	camera_x = court_w * -0.3;	//真ん中より少し前
	camera_y = 15;
	camera_z = 0;
	camera_default_x = camera_x;
	camera_default_y = camera_y;
	camera_default_z = camera_z;

	// 平行光源
	directionalLight = new THREE.DirectionalLight(
		0xffffff,0.4
	);
	directionalLight.position.copy(sun_position);
	// シーンに追加
	world_view.add(directionalLight);

	//アンビエントの強度を上げてポイントライトの強度を下げると影が薄くなる
	ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
	world_view.add(ambientLight);	

//	pointLight = new THREE.PointLight(0xFFFFFF, 0.4, 200, 1.2);	//(色, 光の強さ, 距離, 光の減衰率)
//	pointLight.position.set(camera_x+5,camera_y+5,camera_z-5);
//	world_view.add(pointLight);

	if(1){
		var light = directionalLight;
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width  = 1024*2;		// default
		light.shadow.mapSize.height = 1024*2;		// default
		light.shadow.camera.near  *= camera_scale;	// default
		light.shadow.camera.far   *= camera_scale;	// default
		light.shadow.camera.left   = -15*camera_scale;		//有効範囲
		light.shadow.camera.top	= -15*camera_scale;
		light.shadow.camera.right  =  15*camera_scale;
		light.shadow.camera.bottom =  15*camera_scale;
	}
	//マップのテクスチャを読まない
	if(org_light_mode == 2) {
		objFiles[OBJ_STAGE] = objFiles[OBJ_BALL];
		objFiles[OBJ_SKYDOME] = objFiles[OBJ_BALL];
		while(1) {
			var last = texFiles[texFiles.length-1];
			if(last.indexOf("/beach/") != -1) {
				texFiles.pop();
			}
			else {
				break;
			}
		}
	}

	load_seq = 0;
	load_progress = 0;
	outline_renderer = new OutlineEffect( renderer );
	if(outline_renderer) {
		outline_renderer.enabled = true;
		outline_renderer.setSize(window.innerWidth,window.innerHeight);
	}
	// モデルとモーションの読み込み準備
	helper = new MMDAnimationHelper( {
		afterglow: 0.0
	} );

	mmd_loader = new MMDLoader();
//	fbx_loader = new FBXLoader();
//	vrm_loader = new VRMLoader();

	//物理
	physics = new CannonPhysics();
	
	container.appendChild( renderer.domElement );
	if(debug) {
		stats = new Stats();
//		container.appendChild( stats.dom );
	}

	//initPostprocessing();
	
}	//init()

function MessageWindowDisp(enable)
{
	var msgwin = document.getElementById( 'window' );
	if(enable) {
		msgwin.style.display = "";
		msgwin.style.top = "65%";
		msgwin.style.bottom = "5%";
	}
	else {
		msgwin.style.display = "none";
	}
}

function OptionWindowDisp(enable)
{
	var msgwin = document.getElementById( 'window' );
	var optwin = document.getElementById( 'option' );
	if(enable) {
		msgwin.style.display = "";
		optwin.style.display = "";
		msgwin.style.top = "10%";
		msgwin.style.bottom = "10%";
		PauseFlag |= 2;
		isOption = true;
		document.getElementById("message").innerHTML = "";
		
		function setChecked(name, index) {
			var e,i;
			e = document.getElementsByName(name);
			for(i=0;i<e.length;i++) e[i].checked = (i == index);
		}
		setChecked("game_level", option.game_level);
		setChecked("camera", option.camera_mode);
		setChecked("move", option.move_mode);
		setChecked("tutorial", option.tutorial_flag);
		setChecked("light", option.light_mode);

		document.getElementById( 'ok' ).addEventListener( 'click', function(){OptionWindowClose(true);} );
		document.getElementById( 'cancel' ).addEventListener( 'click', function(){OptionWindowClose(false);} );
	}
	else {
		msgwin.style.display = "none";
		optwin.style.display = "none";
		PauseFlag &= ~2;
		isOption = false;
		document.getElementById("message").innerHTML = "";
	}
}

function OptionWindowClose(update) {
	if(update) {
		function getChecked(name, index) {
			var e,i;
			e = document.getElementsByName(name);
			for(i=0;i<e.length;i++) {
				if(e[i].checked) return i;
			}
			return -1;
		}
		option.game_level	= getChecked("game_level");
		option.camera_mode	= getChecked("camera");
		option.move_mode	= getChecked("move");
		option.tutorial_flag= getChecked("tutorial");
		option.light_mode	= getChecked("light");
		StorageSave();
	}
	OptionWindowDisp(false);
}

var controller1;
function onSelectStart() {
	key_sp = true;
}
function onSelectEnd() {
	key_sp = false;
}

function onUIArea(name, x, y)
{
	var obj = document.getElementById( name );
	if(obj.display != "none") {
		if(x > obj.offsetLeft
		&& x < obj.offsetLeft+obj.offsetWidth
		&& y > obj.offsetTop
		&& y < obj.offsetTop+obj.offsetHeight) {
			return true;
		}
	}
	return false;
}

function isMessageWin(x,y) {
	ms_msg_click = 0;
	if(tutorial.enable || isOption) {
		if(onUIArea("window",x,y)) {
			ms_msg_click = 1;
			return true;
		}
	}
	return false;
}
//スマホタッチ
function isUIAreaTouch(event) {
	if(event.changedTouches.length == 1) {
		var x = event.changedTouches[0].clientX;// / window.innerWidth;
		var y = event.changedTouches[0].clientY;// / window.innerHeight;
		if(isMessageWin(x,y)) {
			return true;
		}
		if(onUIArea("ui",x,y)) {	//画面右上
			if(isOption) {
				return false;
			}else{
				return true;
			}
		}
		if(onUIArea("select1",x,y)) {//ボタン
			return true;
		}
		if(onUIArea("select2",x,y)) {//ボタン
			return true;
		}
	}
	return false;
}
//マウス操作
function isUIArea(event) {
	var x = event.clientX;// / window.innerWidth;
	var y = event.clientY;// / window.innerHeight;
	if(isMessageWin(x,y)) {
		return true;
	}
	if(onUIArea("ui",x,y)) {	//画面右上
		if(isOption) {
			return false;
		}else{
			return true;
		}
	}
	if(onUIArea("select1",x,y)) {//ボタン
		return true;
	}
	if(onUIArea("select2",x,y)) {//ボタン
		return true;
	}
	return false;
}

function LoadEnd()
{
	if(isVR) {
		container.appendChild( VRButton.createButton( renderer ) );

		controller1 = renderer.xr.getController( 0 );
		controller1.addEventListener( 'selectstart', onSelectStart );
		controller1.addEventListener( 'selectend', onSelectEnd );
	}
	else {
		//スマホ対応
		window.addEventListener('touchstart', function(event) {
			if(isUIAreaTouch(event)) {
				return;
			}
			event.preventDefault();
//			document.getElementById("debugOut").innerHTML = "touch down="+event.touches.length+" <br>";
			if(event.changedTouches.length == 1) {
				onTouchDown(event.changedTouches[0].clientX, event.changedTouches[0].clientY, true);
			} else {
				onTouchDown2(event);
			}
		}, {passive: false});
		window.addEventListener('touchmove', function(event) {
//			document.getElementById("debugOut").innerHTML = "touch move="+event.changedTouches.length+" <br>";
			if(isUIAreaTouch(event)) {
				return;
			}
			event.preventDefault();
			if(event.changedTouches.length == 1) {
				onTouchMove(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
			}
			else {
				onTouchMove2(event);
			}
		}, {passive: false});
		window.addEventListener('touchend', function(event) {
			if(isUIAreaTouch(event)) {
				return;
			}
			event.preventDefault();
			onTouchEnd(true);
		}, {passive: false});
		window.addEventListener('touchcancel', function(event) {
			if(isUIAreaTouch(event)) {
				return;
			}
			event.preventDefault();
			onTouchEnd(true);
		}, {passive: false});

		//ブラウザ
		window.addEventListener('mousedown', mousedown, false );
		window.addEventListener('mouseup', mouseup, false );
		window.addEventListener('mousemove', mousemove, false );
		window.addEventListener('wheel', mousewheel, false );
		window.addEventListener('keydown',keydown, false);
		window.addEventListener('keyup',keyup, false);
		
		window.addEventListener('contextmenu', function(e){e.preventDefault();}, true);	//右クリックメニューを封じる
	}
	window.addEventListener( 'resize', onWindowResize, false );
	WindowCheck();

	//buttonテキスト更新のため
	SoundSW(0);
	//PauseSW(0);
	//CameraSW(0);
	//MoveSW(0);
	document.getElementById("ui_caption").innerHTML = "";
	
	document.getElementById( 'Sound' ).addEventListener( 'click', function(){SoundSW(1);} );
	document.getElementById( 'Pause' ).addEventListener( 'click', function(){PauseSW(1);} );
	document.getElementById( 'Camera' ).addEventListener( 'click', function(){CameraSW(1);} );
	document.getElementById( 'Move' ).addEventListener( 'click', function(){MoveSW(1);} );
	document.getElementById( 'Option' ).addEventListener( 'click', function(){OptionWindowDisp(!isOption);} );
	document.getElementById( 'FullScreen' ).addEventListener( 'click', function(){FullScreenSW();} );

	document.getElementById( 'Sound' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "サウンド";} );
	document.getElementById( 'Pause' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "ポーズ";}  );
	document.getElementById( 'Camera' ).addEventListener( 'mouseover', function(e){CameraSW(0);}  );
	document.getElementById( 'Move' ).addEventListener( 'mouseover', function(e){MoveSW(0);}  );//Aフルオート Nニュートラル
	document.getElementById( 'Option' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "オプション";} );
	document.getElementById( 'FullScreen' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "フルスクリーン";} );

	if(enabledFullScreen()) {
		document.getElementById( 'FullScreen' ).style.display = "";
	}
}

//操作可能な状態のボタン表示
function DispGameUI(flag) {
	enableUI = flag;
	if(flag) {
		document.getElementById( 'Pause' ).style.display = "";
		PauseSW(0);
//		CameraSW(0);
//		MoveSW(0);
	}
	else {
		document.getElementById( 'Pause' ).style.display = "none";
//		document.getElementById( 'Camera' ).style.display = "none";
//		document.getElementById( 'Move' ).style.display = "none";
	}
}

function FullScreenSW() {
	if(getFullScreenObject()) {
		endFullScreen();
	}else{
		beginFullScreen();
	}
}

function PauseSW(flg) {
	if(isOption) return;
	if(!enableUI) return;
	if(flg) {
		if(PauseFlag&1) PauseFlag &= ~1;
		else PauseFlag |= 1;
	}
	var uiButton2 = document.getElementById( 'Pause' );
	//25B6
	if(PauseFlag&1) {
		if(flg) ambientLight.intensity = 0.2;
		uiButton2.innerHTML = "&#x23F8;";	//停止
	}
	else {
		if(flg) {
			ambientLight.intensity = 0.5;
			clock.getDelta();
		}
		uiButton2.innerHTML = "&#x25B6;";	//再生
	}
	
}

function SoundSW(flg) {
	if(flg) {
		option.sound = !option.sound;
		if(option.sound) {
			if(audio_listener == null) {
				SoundInit();
			}
			else {
				SoundRestart();
			}
		}
		else {
			SoundPause();
		}
	}
	var uiButton1 = document.getElementById( 'Sound' );
	if(option.sound) {
		uiButton1.innerHTML = "&#x1F50A;";	//スピーカーOFF
	}else {
		uiButton1.innerHTML = "&#x1F507;";	//スピーカーON
	}
}

function CameraSW(flg) {
	if(isOption) return;
	if(!enableUI) return;
	const str = [
		"N", "M", "F",
	];
	const cap = [
		"ニュートラル","マニュアル","固定"
	];
	option.camera_mode = (option.camera_mode + flg) % 3;
	var uiButton3 = document.getElementById( 'Camera' );
	uiButton3.innerHTML = "&#x1f3a5;"+str[option.camera_mode];

	document.getElementById("ui_caption").innerHTML = "カメラ:"+cap[option.camera_mode]
	
	if(flg != 0) {
		if(option.camera_mode == 2) {
			cam_rot_x = 0;
			cam_rot_y = 0;
			ms_wheel = 2.5;
		}
		StorageSave();
	}
}

function MoveSW(flg) {
	if(isOption) return;
	if(!enableUI) return;
	const str = [
		"A", "N", "M",
	];
	const cap = [
		"フルオート", "ニュートラル", "マニュアル"
	];
	option.move_mode = (option.move_mode + flg) % 3;
	document.getElementById( 'Move' ).innerHTML = "&#x1F3C3;"+str[option.move_mode];
	document.getElementById("ui_caption").innerHTML = "移動モード:"+cap[option.move_mode]
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

function animate() {
	if(isActive) {
		renderer.setAnimationLoop( render );
	}
}
function onProgressMdl( xhr ) {
	if ( xhr.lengthComputable ) {
		load_progress = (xhr.loaded / xhr.total);
//		console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
	}
}

var loadbox0,loadbox1,loadbox2;
var promise = null;
//ローディングゲージ
function LoadingInit()
{
	loadbox0 = new THREE.Object3D();
	loadbox0.position.set(0,0,-20);
	loadbox0.scale.set(0.7,0.7,0.7);

	scene.add(loadbox0);

	var geometry1 = new THREE.BoxBufferGeometry( 5.1, 1.1, 0.4 );
	var material1 = new THREE.MeshBasicMaterial( {color: 0xa0a0a0, vertexColors: true} );
	clearOutline(material1);
	loadbox1 = new THREE.Mesh( geometry1, material1 );
	loadbox0.add(loadbox1);

	var geometry2 = new THREE.BoxBufferGeometry( 4.8, 0.9, 0.42 );
	var material2 = new THREE.MeshBasicMaterial( {color: 0xffffff, vertexColors: true} );
	clearOutline(material2);
	loadbox2 = new THREE.Mesh( geometry2, material2 );
	loadbox1.add(loadbox2);
	load_progress = 0;

	var num = geometry1.attributes.position.count;
	geometry1.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( num * 3 ), 3 ) );
	geometry2.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array( num * 3 ), 3 ) );
	var colors1 = geometry1.attributes.color;
	var colors2 = geometry2.attributes.color;
	for ( var i = 0; i < num; i ++ ) {
		var x1 = (i%2)*0.5 + 0.5;
		var x2 = (i%2);
		colors1.setXYZ( i, x1,x1,x1 );
		colors2.setXYZ( i, x2/2,1-x2/2,x2/2+0.5 );
		if(Math.floor(i/4)==4) {
			colors1.setXYZ( i, 0.3,0.3,0.3 );
		}
	}
}

function LoadingUpdate(delta)
{
	if(load_seq != -1 && load_seq <= 10) {
		if(loadbox0 == null) {
			LoadingInit();
		}
		else {
			count3 += /*clock.getDelta()*/ delta * 1.6;
			loadbox0.rotation.x = Math.sin(count3  )/5;
			loadbox0.rotation.y = Math.sin(count3+1)/10;
			loadbox0.rotation.z = Math.sin(count3+2)/10;
		}
//		var max = 4;
	}

	switch(load_seq) {
	case 0:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				tex_list.push( new THREE.TextureLoader().load(texFiles[tex_list.length]) );
				load_progress = 0;
				resolve();
			});
		}
		load_progress2 = tex_list.length/texFiles.length + load_progress;
		promise.then(function(value) {
			if(tex_list.length >= texFiles.length) {
				load_seq = 1;
				load_progress2 = load_seq;
				//count = 0;
			}
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	case 1:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				load_progress = 0;
				mmd_loader.load( modelFile, /*vmdFiles,*/ function ( mmd ) {
					chr_mesh = mmd;			//SkinnedMesh
					resolve();
				}, onProgressMdl, function(e){reject()} );
			});
		}
		load_progress2 = 1 + load_progress;
		promise.then(function(value) {
			load_seq = 2;
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	case 2:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				load_progress = 0;
				mmd_loader.loadAnimation( [vmdFiles[chr_anim.length]], chr_mesh, function ( vmd ) {
					vmd.name = vmdFiles[chr_anim.length];
					chr_anim.push(vmd);
					resolve();
				}, onProgressMdl, function(e){reject()} );
			});
		}
		load_progress2 = 2 + chr_anim.length/vmdFiles.length + load_progress;
		promise.then(function(value) {
			if(chr_anim.length >= vmdFiles.length) {
				load_seq = 3;
			}
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	case 3:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				load_progress = 0;
				if(objFiles[obj_mesh.length].indexOf("pmx") > 0) {
					mmd_loader.load( objFiles[obj_mesh.length], function ( mmd ) {
						obj_mesh.push(mmd);
						resolve();
					}, onProgressMdl, null );
				}
				else if(objFiles[obj_mesh.length].indexOf("vrm") > 0) {
					vrm_loader.load( objFiles[obj_mesh.length], function ( vrm ) {

						// VRMLoader doesn't support VRM Unlit extension yet so
						// converting all materials to THREE.MeshBasicMaterial here as workaround so far.
						vrm.scene.traverse( function ( object ) {

							if ( object.material ) {

								if ( Array.isArray( object.material ) ) {

									for ( var i = 0, il = object.material.length; i < il; i ++ ) {

										var material = new THREE.MeshLambertMaterial();
										THREE.Material.prototype.copy.call( material, object.material[ i ] );
										material.color.copy( object.material[ i ].color );
										material.map = object.material[ i ].map;
										material.skinning = object.material[ i ].skinning;
										material.morphTargets = object.material[ i ].morphTargets;
										material.morphNormals = object.material[ i ].morphNormals;
										object.material[ i ] = material;

									}

								} else {

									var material = new THREE.MeshLambertMaterial();
									THREE.Material.prototype.copy.call( material, object.material );
									material.color.copy( object.material.color );
									material.map = object.material.map;
									material.skinning = object.material.skinning;
									material.morphTargets = object.material.morphTargets;
									material.morphNormals = object.material.morphNormals;
									material.emissive = new THREE.Color(0.3,0.3,0.3);
									object.material = material;

								}

							}

						} );
						
						obj_mesh.push( vrm.scene );
						vrm.scene.scale.set(15,15,15);
						resolve();

					}, onProgressMdl, function(e){reject()} );
				}
				else if(objFiles[obj_mesh.length].indexOf("fbx") > 0) {
					fbx_loader.load( objFiles[obj_mesh.length], function ( fbx ) {
						obj_mesh.push(fbx);
	//					fbx.scale.set(0.01,0.01,0.01);
						resolve();
					}, onProgressMdl, function(e){reject()} );
				}
			});
		}
		load_progress2 = 3 + obj_mesh.length/objFiles.length + load_progress;
		promise.then(function(value) {
			if(obj_mesh.length >= objFiles.length) {
				load_seq = 4;
				load_progress2 = load_seq;
				//count = 0;
			}
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	case 4:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				load_progress = 0;
				mmd_loader.loadWithAnimation( modelFile2, [vmdFiles[0]], function ( mmd ) {
					player_mesh = mmd.mesh;			//SkinnedMesh

					if(game_view == 0) {
						helper.add(player_mesh, {
							physics: false,
							ik:true
						});
					}
					else {
						helper.add(player_mesh, {
							animation: mmd.animation,
							physics: false,
							ik:true
						});
					}
					var ikHelper = helper.objects.get( player_mesh ).ikSolver.createHelper();
					ikHelper.visible = false;
					world_view.add( ikHelper );

					resolve();
				}, onProgressMdl, function(e){reject()} );
			});
		}
		load_progress2 = 4 + load_progress;
		promise.then(function(value) {
			load_seq = 5;
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	case 5:
	{
		load_seq = 6;
		break;
	}
	case 6:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				load_progress = 0;
				var i;
				
				//ローディング終了（初回）
				helper.add(chr_mesh, {
					animation: chr_anim[0],
					physics: false,
					ik:true
				});
				ikHelper = helper.objects.get( chr_mesh ).ikSolver.createHelper();
				ikHelper.visible = false;
				//if(debug) ikHelper.visible = true;
				world_view.add( ikHelper );


				selectAnimation(chr_mesh, chr_anim[0], true);
				//selectAnimation(player_mesh, 0, true);


				//アウトラインを細く
				for(i=0;i<chr_mesh.material.length;i++) {
					if(chr_mesh.material[i].userData) {
						/*= {	//outline_rendererのアウトラインを消す
							thickness: 0,
							color: [ 0, 0, 0 ],
							alpha: 0,
							visible: false,
							keepAlive: true
						};*/
					}
				}
				//mmd_batokin_island
				/*for(j=0;j<obj_mesh.length;j++) {
					if(obj_mesh[j].material) {
						var mats = obj_mesh[j].material;
						for(i=0;i<mats.length;i++) {
							if (mats[i].color.r == 0 && mats[i].color.g == 0 && mats[i].color.b == 0) {
								mats[i].color.r =
								mats[i].color.g =
								mats[i].color.b = 1.0;
							}
						}
					}
				}*/
				//ボールの生成
				{
		//			var geometry = new THREE.SphereBufferGeometry( 2, 15,12 );
		//			var material = new THREE.MeshLambertMaterial( {color: 0xffff00} );
		//			ball = new THREE.Mesh( geometry, material );
					ball = obj_mesh[OBJ_BALL];
					ball.scale.set(0.18,0.18,0.18);
					ball.position.set( 5,20, 0 );
					ball.castShadow = true;
				}
				//ガイド（ボールの位置を示す）
				if(0){
					var geometry = new THREE.ConeGeometry( 0.2, 1,8 );
					var material = new THREE.MeshLambertMaterial( {color: 0xff0000, transparent:true, opacity:0.5} );
					guide_mesh = new THREE.Mesh( geometry, material );
					world_view.add(guide_mesh);
				}
				
				//落下地点（デバッグ用）
				if(debug) {
					var geometry = new THREE.SphereBufferGeometry( 1, 6,6 );
					debug_obj1 = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0xff0000} ) );
					debug_obj2 = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0x0000ff} ) );
					debug_obj1.castShadow = true;
					debug_obj2.castShadow = true;
					world_view.add(debug_obj1);
					world_view.add(debug_obj2);
//					debug_obj1.position.y = getGround(0.1,0.1) + 35;
					clearOutline(debug_obj1.material);
					clearOutline(debug_obj2.material);
				}


				if(game_view == 0) {
					//腕のShapeを作る
					var hand_shape = new CANNON.Sphere(4);
					hand_mat = new CANNON.Material("hand");
					if(debug && 0){
						var geometry = new THREE.SphereBufferGeometry( 4,20,20 );
		//				var material = new THREE.MeshLambertMaterial( {color: 0x000000,transparent:true,opacity:0.3} );
						var material = new THREE.MeshLambertMaterial( {color: 0x808080} );
						hand_debug_mesh = new THREE.Mesh( geometry, material );
						world_view.add(hand_debug_mesh);
						hand_shape = null;
					}
					hand_physics = physics.addMesh(hand_debug_mesh, hand_shape, 0, hand_mat, GROUP_HAND/*group*/);	//0は固定物
					hand_physics.addEventListener("collide", function(e) {
						var contact = e.contact;
						var name1 = contact.bi.material.name;
						var name2 = contact.bj.material.name;
//						console.log("hit "+name1+"+"+name2+" count="+count);
						if(name1 == "ball" || name2 == "ball") {
							touch_type = 0;
							SoundPlay(SOUND_BALL);
							HitEffectInit(1, 0);
						}
					});
				}
				//ボール
				ball_mat = new CANNON.Material("ball");
				var ball_shape = new CANNON.Sphere(1.8);
				var ball_p = physics.addMesh( ball, ball_shape, 1 /*mass*/, ball_mat, GROUP_BALL/*group*/ );
				if(hand_mat) {
					contact_mat = new CANNON.ContactMaterial(
						hand_mat,	//腕
						ball_mat,	//ボール
						{
						friction:0.1,		//friction 摩擦
						restitution:1.10	//restitution 反発
	//					restitution:1.05	//restitution 反発
						}
					);
					physics.world.addContactMaterial(contact_mat);
				}

				/*ball_p.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					console.log("ball hit "+name1+"+"+name2);
				});*/

				if(org_light_mode == 0) {
					//足物理
					for(i=0;i<4;i++) {
						var ball_shape = new CANNON.Sphere(1);
						var foot_mat = new CANNON.Material("foot"+i);
						/*var geometry = new THREE.SphereBufferGeometry( 1,6,5 );
						var material = new THREE.MeshBasicMaterial( {color: 0x808080} );
						var mesh = new THREE.Mesh( geometry, material );
						foot_stamp[i] = mesh;
						world_view.add(mesh);
						*/

						foot_physics[i] = physics.addMesh( null, ball_shape, 5 /*mass*/, foot_mat, GROUP_FOOT/*group*/ );
					}

					initFootStamp();
				}
				
				//コートを作成
				if(org_light_mode != 2) {	//浜辺の傾きを強制的にいじる
					obj_mesh[OBJ_STAGE].rotation.set(stage_rotate_x,0,0);	//ボールがZ方向に転がらない角度
				}
				createCourt();
				court_center = new THREE.Vector3(0,getGround(0,0.1),0);	//コートの中心（高さ）

				contact_mat = new CANNON.ContactMaterial(
					wall_mat,	//壁
					ball_mat,	//ボール
					{
					restitution:0.0		//restitution
					}
				);
				physics.world.addContactMaterial(contact_mat);

				//ヒットエフェクト
				hit_effects = new Array();
				hit_param = new Array();
				var size = 0.16;
				if(isVR) size *= 0.5;
				else size *= game_scale*3;
				var hit_mat1 = new THREE.PointsMaterial( { size: size*0.75, map: tex_list[TEX_BUBBLE], transparent: true } );
				var hit_mat2 = new THREE.PointsMaterial( { size: size*1.0 , map: tex_list[TEX_STAR]  , transparent: true /*, blending: THREE.AdditiveBlending*/ } );
				var geometry = new THREE.BufferGeometry();
				geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [0,0,0], 3 ) );
				for(i=0;i<10;i++) {
					var point = new THREE.Points( geometry, (i%2==0)?hit_mat1:hit_mat2 );
//					point.position.set((Math.random()-0.5)*court_w, 15, (Math.random()-0.5)*court_h);
//					point.renderOrder = 2;
					hit_effects.push(point);
					world_view.add(point);
					hit_param.push({
						vec: new THREE.Vector3(),
						count: 0,
					});
				}
				//ボールエフェクト
				{
					var geometry = new THREE.CylinderGeometry( 4, 20, 40, 8,1, true );
					var material = new THREE.MeshBasicMaterial( {color: 0xffffff, map:tex_list[TEX_BALLEFFECT], transparent: true, side: THREE.DoubleSide } );
					
					clearOutline(material);
					ball_effect = new THREE.Mesh( geometry, material );
					ball_effect.visible = false;
					world_view.add(ball_effect);
				}
				
				//汎用エフェクト
				EffectInit();
				
				if(game_view == 1) {
					//アタックサークル
					const cnt=32;
					geometry = new THREE.BufferGeometry();
					material = new THREE.MeshBasicMaterial( {color:0x0000ff, side: THREE.DoubleSide, /*vertexColors: true,*/ transparent: true, map:tex_list[TEX_WHITEFADE] } );
					var iv = 0, ii = 0, ic = 0;
					var vertices = new Float32Array((cnt+1)*2*3);
					var uvs	  = new Float32Array((cnt+1)*2*2);
					var indices  = new Uint16Array(cnt*6);
					for(i=0;i<=cnt;i++) {
						if(i<cnt) {
							indices[ii++] = (iv/3+0);
							indices[ii++] = (iv/3+1);
							indices[ii++] = (iv/3+2);

							indices[ii++] = (iv/3+3);
							indices[ii++] = (iv/3+2);
							indices[ii++] = (iv/3+1);
						}
						for(j=0;j<2;j++) {

							vertices[iv++] = 0;
							vertices[iv++] = 0;
							vertices[iv++] = 0;

							uvs[ic++] = i%2;
							uvs[ic++] = (j)?0.0:0.4;
						}
					}
					geometry.dynamic = true;
					geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
					geometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
					geometry.setIndex( new THREE.BufferAttribute( indices , 1 ) );
					attack_circle = new THREE.Mesh( geometry, material );
					world_view.add(attack_circle);
					attack_circle.visible = false;
				}

				//ビーチパラソル・チェアのコピペ
				if(org_light_mode == 0)	{
					var size = 3;
					var meshs,meshs2;
					var torus_geometry = new THREE.TorusGeometry(size, size/2.5, 10,13, Math.PI*2);
					var torus_material = new THREE.MeshLambertMaterial( { color:0xffe0e0, transparent:true,opacity:0.95} );
					clearOutline(torus_material);
					meshs  = new THREE.InstancedMesh( obj_mesh[OBJ_BEACHSET].geometry, obj_mesh[OBJ_BEACHSET].material, 40 );
					meshs2 = new THREE.InstancedMesh( torus_geometry, torus_material, meshs.count );
					for(i=0;i<meshs.count;i++) {
						var x,y,z;
						if(i==chair_index) {
							//１セットだけ位置固定
							x = (i/meshs.count*2.0-0.7)*1300-30;
							z = -50;
						}
						else {
							do {
								x = ((i+Math.random()-0.5)/meshs.count*2.0-0.7)*1300;
								z = (Math.random()*1  )*450-150;
							}while(x > -wall_w && x < wall_w && z > -wall_h && z < wall_h);
						}
						y = getStageHeight(x,z);	//範囲が広いのでgetGroundではなくgetStageHeight

						{
							var matrix = (new THREE.Matrix4()).makeTranslation(x,y,z);
							if(i == chair_index) {
								chair_pos = new THREE.Vector3(x,y,z);
								matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(-0.5*Math.PI/2));
							}else {
								matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(Math.random()*0.5-0.5));
							}
							meshs.setMatrixAt(i,matrix);
						}
						//浮き輪
						//パラソルの近くに置く
						var ry = 0,rx = 0;
						if(Math.random()<0.66) {	//立てかけ
							if(Math.random() < 0.5)
								x += 12.5;
							else
								x -= 12.5;
							y = getStageHeight(x,z);
							y += size*1.4;
							z += (Math.random())*-6;
							ry = Math.PI/2;
						}
						else {	//地面
							x += (Math.random()*2-1)*12;
							if(Math.random() < 0.5)
								z += -24;
							else
								z += 24;
							y = getStageHeight(x,z);
							y += 1;
							rx = Math.PI/2*0.95;
						}
						if(i != chair_index) {
							var matrix = (new THREE.Matrix4()).makeTranslation(x,y,z);
							matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(ry));
							matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationX(rx));
							meshs2.setMatrixAt(i,matrix);
						}
					}
					meshs.castShadow = true;
//					chair_meshs = meshs;
//					chair_meshs.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
					world_view.add(meshs);	//パラソルセット
					world_view.add(meshs2);	//浮き輪

					//やしの木
					meshs = new THREE.InstancedMesh( obj_mesh[OBJ_TREE].geometry, obj_mesh[OBJ_TREE].material, 35 );
					for(i=0;i<meshs.count;i++) {
						var x = ((i-0.5)/meshs.count*2.0-0.75)*1550;
						var z = (Math.random()*1  )*150+250;
						if(i<10) {
							z += (1-i/10) * -500;
						}
						else if(i>meshs.count-10) {
							z += (1-(meshs.count-i)/10) * -700;
						}
						var y = getStageHeight(x,z);
						var matrix = (new THREE.Matrix4()).makeTranslation(x,y,z);
						matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(Math.random()*Math.PI*2));
						meshs.setMatrixAt(i,matrix);
					}
					world_view.add(meshs);
				}
				//サーフボード
				if(org_light_mode == 0) {
					//debug&shape
					if(0) {
						var geometry = new THREE.BoxBufferGeometry( 8,30,2 );
						var material = new THREE.MeshLambertMaterial( {color: 0x808080} );
						surf_meshs  = new THREE.InstancedMesh( geometry, material, 6 );
					}
					else {
						surf_meshs  = new THREE.InstancedMesh( obj_mesh[OBJ_SURF].geometry, obj_mesh[OBJ_SURF].material, 6 );
					}
					world_view.add(surf_meshs);
					surf_meshs.castShadow = true;					//出
					surf_body = new Array(surf_meshs.count);
					var box_shape = [];
					var surf_tbl;
					if(game_view == 0) {
						surf_tbl = [	//配置
							  80, court_h*1.2,
							  90, court_h*1.2,
							 100, court_h*1.2,

							- 80,-court_h*1.2,
							- 90,-court_h*1.2,
							-100,-court_h*1.2,
						];
					}
					else {
						surf_tbl = [	//配置
							 court_w*1.2, 50,
							 court_w*1.2, 60,
							 court_w*1.2, 70,

							-court_w*1.2,-50,
							-court_w*1.2,-60,
							-court_w*1.2,-70,
						];
					}
					for(i=0;i<2;i++) {	//右と左で別
						var sx = (game_view == 0)?5:1;
						var sz = (game_view == 0)?1:5;
						var j = (i==0) ? 1*2 : 4*2;
						var y1 = getGround(surf_tbl[j+0], surf_tbl[j+1]-sz);
						var y2 = getGround(surf_tbl[j+0], surf_tbl[j+1]+sz);
						var y0 = ((y1<y2)?y1:y2)-0;
						y1 -= y0;
						y2 -= y0;
						var sy = 30/2;
						var shape_vertices = [
							new CANNON.Vec3(-sx,y1-sy,-sz),
							new CANNON.Vec3( sx,y1-sy,-sz),
							new CANNON.Vec3( sx,y1+sy,-sz),
							new CANNON.Vec3(-sx,y1+sy,-sz),
							new CANNON.Vec3(-sx,y2-sy, sz),
							new CANNON.Vec3( sx,y2-sy, sz),
							new CANNON.Vec3( sx,y2+sy, sz),
							new CANNON.Vec3(-sx,y2+sy, sz)
						];

						var shape_indices = [
							[3,2,1,0], // -z
							[4,5,6,7], // +z
							[5,4,0,1], // -y
							[2,3,7,6], // +y
							[0,4,7,3], // -x
							[1,2,6,5], // +x
						];
						box_shape[i] = new CANNON.ConvexPolyhedron(shape_vertices, shape_indices);
					}

					var surf_mat = new CANNON.Material("surf");
					for(i=0;i<surf_body.length;i++) {
						surf_body[i] = physics.addMesh( null, box_shape[Math.floor(i/3)%2], 0.5/*mass*/, surf_mat, GROUP_OBJ/*group*/ );
						surf_body[i].position.x = surf_tbl[i*2+0];
						surf_body[i].position.z = surf_tbl[i*2+1];
						surf_body[i].position.y = getGround(surf_body[i].position.x, surf_body[i].position.z)+15.01;
					}
					SurfUpdate();
				}
				//ちょうちょ
				if(org_light_mode == 0)	{

					var meshs;
					if(0) {
					meshs  = new THREE.InstancedMesh( obj_mesh[OBJ_BUTTERFLY].geometry, obj_mesh[OBJ_BUTTERFLY].material, 10 );
					for(i=0;i<meshs.count;i++) {
						var x,y,z;
						x = (Math.random()-0.5)*wall_w;
						z = (Math.random()-0.5)*wall_h;
						y = getGround(x,z)+10+Math.random()*10;

						var matrix = (new THREE.Matrix4()).makeTranslation(x,y,z);
						matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationX(1));
						matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(Math.random()*0.5-0.5));
						matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(4,4,4));
						meshs.setMatrixAt(i,matrix);
					}
					meshs.castShadow = true;
					world_view.add(meshs);
					butterfly_meshs = meshs;
					}
					else {
						butterfly_meshs = new Array(8);
						for(i=0;i<butterfly_meshs.length;i++) {
							var x,y,z;
							x = (Math.random()-0.5)*wall_w*2;
							z = (Math.random()-0.5)*wall_h*2;
							y = getGround(x,z)+10+Math.random()*20;

							butterfly_meshs[i] = cloneAnimated(obj_mesh[OBJ_BUTTERFLY]);
							butterfly_meshs[i].position.set(x,y,z);
							butterfly_meshs[i].scale.set(4,4,4);
							butterfly_meshs[i].castShadow = true;
							butterfly_meshs[i].rotation.y = Math.PI*2*Math.random();
							butterfly_meshs[i].visible = false;
							world_view.add(butterfly_meshs[i]);
						}
					}

				
					//ほたる
					firefly_meshs = new Array(24);
					var geometry = new THREE.BufferGeometry();
					geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [0,0,0], 3 ) );
					for(i=0;i<firefly_meshs.length;i++) {
						var x,z;
						x = (Math.random()-0.5)*wall_w*2;
						z = (Math.random()-0.5)*wall_h*2;

						var material = new THREE.PointsMaterial( { size: game_scale*1.0, map: tex_list[TEX_FIREFLY], transparent: true } );
						var point = new THREE.Points( geometry, material );
						firefly_meshs[i] = point;
						point.position.set(x,0,z);
						point.visible = false;
						world_view.add(point);
					}
				}
				//ガイド用オブジェクト
				if(game_view == 1) {
					//移動ポインタ
					var geometry = new THREE.SphereGeometry( 0.75, 5,5 );
					var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0x00ff00, emissive:0x606060} ) );
					clearOutline(mesh.material);
					guide_meshs.push(mesh);
					world_view.add(mesh);

					//キャラカーソル(?)
					geometry = new THREE.ConeGeometry( 2, 4, 4 );
					geometry.rotateX(Math.PI);
					mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0xff6000, emissive:0x606060} ) );
					clearOutline(mesh.material);
					guide_meshs.push(mesh);
					mesh.visible = false;
					world_view.add(mesh);

					//体力
//					var geometry = new THREE.SphereGeometry( 1.5, 8,8 );
					for(i=0;i<2;i++) {
//						var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0xffffff, emissive:0x606060, map:tex_list[TEX_FACE]} ) );
						var mesh = new THREE.Sprite( new THREE.SpriteMaterial( {map:tex_list[TEX_FACE], transparent:true} ) );
						mesh.scale.set(3,3,1);
						clearOutline(mesh.material);
						guide_meshs.push(mesh);
						mesh.visible = false;
						world_view.add(mesh);
					}
				}
				//砂埃
				if(org_light_mode == 0) {
					var positions = new Float32Array(sand_param.length*3);
					for(i=0;i<sand_param.length;i++) {
						sand_param[i] = {
							count : -1,
							type : 0,
							position : new THREE.Vector3(),
							rotation : 0,
							power : 0,
						};
						positions[i*3+1] = -100;
					}
					var geometry = new THREE.BufferGeometry();
					geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

					var material = new THREE.PointsMaterial( { size: game_scale*0.4, map: tex_list[TEX_SAND], transparent: true } );
					if(isVR) material.size /= game_scale;
					sand_meshs = new THREE.Points( geometry, material );
					world_view.add(sand_meshs);
				}

				//レンズフレア
				if(org_light_mode == 0) {
					lensflare = new Lensflare();
					lensflare.addElement( new LensflareElement( tex_list[TEX_FLARE0], 700, 0, directionalLight.color ) );
					lensflare.addElement( new LensflareElement( tex_list[TEX_FLARE3], 60*1.2, 0.6 ) );
					lensflare.addElement( new LensflareElement( tex_list[TEX_FLARE3], 70*1.2, 0.7 ) );
					lensflare.addElement( new LensflareElement( tex_list[TEX_FLARE3], 120*1.2, 0.9 ) );
					lensflare.addElement( new LensflareElement( tex_list[TEX_FLARE3], 70*1.2, 1 ) );
					directionalLight.add( lensflare );
				}
				resetGame(false);
				//ロードが終わってからメッシュの追加
				for(i=0;i<obj_mesh.length;i++) {
		//			if(i == OBJ_SEA) continue;
					if(i == OBJ_SURF) continue;
					if(i == OBJ_TREE) continue;
					if(i == OBJ_BEACHSET) continue;
					if(i == OBJ_BUTTERFLY) continue;
					if(org_light_mode == 2) {
//						if(i == OBJ_STAGE) continue;
						if(i == OBJ_SKYDOME) continue;
					}
					world_view.add( obj_mesh[i] );
				}
//				obj_mesh[OBJ_BEACHSET].position.y -= 100;;
				world_view.add( chr_mesh );
				world_view.add( player_mesh );

				mmd_loader = null;
				fbx_loader = null;
				LoadEnd();		//ロード終わったのでUIの追加
				
				//立ち位置（高さ）
				camera_y = camera_default_y = getGround(camera_x, camera_z) + player_h + 3;
				/*chr_mesh.position.x = chr_default_x;
				chr_mesh.position.z = chr_default_z;
				chr_mesh.position.y = chr_default_y = getGround(chr_mesh.position.x,chr_mesh.position.z);
//				chr_mesh.scale.set(0.8,0.8,0.8);
				chr_mesh.rotation.y = -Math.PI/2;*/
				chr_mesh.castShadow = true;					//出
				

				player_x = camera_default_x;
				player_z = camera_default_z;
				player_y = getGround(player_x,player_z)-0.2;
				/*player_mesh.position.x = player_x = camera_default_x;
				player_mesh.position.z = player_z = camera_default_z;
				player_mesh.position.y = player_y = getGround(player_x,player_z)-0.2;*/
				if(game_view != 0) {
					player_mesh.castShadow = true;
				}
				
				count = 0;

				resolve();
			});
		}
		load_progress2 = 6;
		promise.then(function(value) {
			load_seq = 7;
			load_progress2 = load_seq;
			count = 0;
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	case 7:
		loadbox1.remove(loadbox2);
		loadbox0.remove(loadbox1);
//		scene.remove(loadbox0);
//		loadbox0 = null;
		loadbox1 = null;
		loadbox2 = null;
		createTitle();
		game_mode = -1;
		scene.add(world_view);
		load_seq++;

		//タイトル準備
		chrs = [player_mesh, chr_mesh];
		if(debug < 3) {
			anim_user[0].stanby = 15;
			anim_user[1].vacation = 1;
			stopAnimation();

			chr_mesh.position.copy(chair_pos);
			chr_mesh.position.add(new THREE.Vector3(5.8, -4.8, -12.6));

			player_mesh.position.set(-41,-14,-187);
			player_mesh.rotation.y = Math.PI;
		}

		loadbox0.position.copy(chair_pos);
		loadbox0.position.x += 0;
		loadbox0.position.y += 6;
		loadbox0.position.z += -29;

		obj_mesh[OBJ_SKYDOME].renderOrder += 0.1;
		my_update(1/60);
		break;

	case 8:
		if(text_mesh != null) {
			loadbox0.add(text_mesh);
			text_mesh.scale.set(0.5,0.5,0.5);
			text_mesh.position.set(-14,0,0);
			load_seq = 10;
		}
		break;

	case 10:
		//Press Start
		//キャラセレ
		if(game_player == 1) {
			loadbox0.position.copy(chair_pos);
			loadbox0.position.y += 6;
			loadbox0.position.z += -29;
			loadbox0.rotation.y += Math.PI*0.2;

			if(cam_vec_x > 0.03) game_player = 0;
		}
		else {
			loadbox0.position.copy(player_mesh.position);
			loadbox0.position.x += -19;
			loadbox0.position.y += 22;
			loadbox0.rotation.y += Math.PI*1.2;

			if(cam_vec_x < -0.03) game_player = 1;
		}
		if((ms_click || debug >= 3) && !isOption) {

			SoundPlay(SOUND_BALL);
			scene.remove(loadbox0);
			loadbox0 = null;
			resetGame(true);
			anim_user[1].vacation = 1;
			game_mode = -1;

			next_camera.position = null;	//nullは操作キャラ
			load_seq++;
			count3 = 0;
		}
		return true;
		break;
		
	case 11:	//定位置につく
		count3++;
		var flg = 0;
		if(count3 >= 10 && anim_user[1].vacation != 0) {
			anim_user[1].vacation = 0;
			chr_mesh.rotation.x = chr_mesh.rotation.z = 0;
			selectAnimation(chr_mesh, chr_anim[0], true);
		}
		for(var i=0;i<2;i++) {
			if(i == 1 && count3 < 10) continue;
			var dir = (i==0)?-1:1;
			var walk = walkUpdateTarget(i, dir*court_w/2, 0, 1.2, 2);
			if(walk < 2) {
				if(rotateUpdate(i, -dir*court_w, 0)) {
					if(anim_user[i].stanby == 0) anim_user[i].stanby = 1;
					flg++;
				}
			}
			else {
				rotateUpdate(i, dir*court_w/2, 0);
			}
		}

		if(flg >= 2) {
			load_seq = -1;

			if(!option.tutorial_flag) {
				if(game_view == 1) {
					tutorial.enable = true;
				}
			}
			if(!tutorial.enable) {
//				document.getElementById( 'ui' ).style.display = "";
				game_mode = MODE_BEGIN;
				DispGameUI(true);
			}
			else {
				game_mode = -1;
				tutorial.step = TUTORIAL_START;	//チュートリアルを開始する
			}
		
		}
		return true;
		
	case -1:
		return true;
	}
	if(loadbox2) {
		loadbox2.position.x = -(1-(load_progress2/6))*2.4;
		loadbox2.scale.x = load_progress2/6;
	}
	return false;
}

//https://stackoverflow.com/questions/45393765/how-to-clone-a-skinned-mesh
function cloneAnimated( source ) {

	var cloneLookup = new Map();

	var clone = source.clone();

	parallelTraverse( source, clone, function ( sourceNode, clonedNode ) {

		cloneLookup.set( sourceNode, clonedNode );

	} );

	source.traverse( function ( sourceMesh ) {

		if ( ! sourceMesh.isSkinnedMesh ) return;

		var sourceBones = sourceMesh.skeleton.bones;
		var clonedMesh = cloneLookup.get( sourceMesh );

		clonedMesh.skeleton = sourceMesh.skeleton.clone();

		clonedMesh.skeleton.bones = sourceBones.map( function ( sourceBone ) {

			if ( ! cloneLookup.has( sourceBone ) ) {

				throw new Error( 'THREE.AnimationUtils: Required bones are not descendants of the given object.' );

			}

			return cloneLookup.get( sourceBone );

		} );

		clonedMesh.bind( clonedMesh.skeleton, sourceMesh.bindMatrix );

	} );

	return clone;

}

function parallelTraverse( a, b, callback ) {

	callback( a, b );

	for ( var i = 0; i < a.children.length; i ++ ) {

		parallelTraverse( a.children[ i ], b.children[ i ], callback );

	}

}
////////////

function createCourt() {
	//ステージを読み込まないかわりにシンプルな地面を作る
	if(org_light_mode == 2) {
		var geometry = new THREE.PlaneGeometry( court_w*2, court_h*2, 4 );
		geometry.rotateX(-Math.PI/2);
		var material = new THREE.MeshLambertMaterial( {color: 0xffffff} );
		obj_mesh[OBJ_STAGE] = new THREE.Mesh( geometry, material );
	}
	else {
		obj_mesh[OBJ_STAGE].position.set(0,-14,0);
		obj_mesh[OBJ_STAGE].updateMatrixWorld( true );

		obj_mesh[OBJ_SKYDOME].position.set(0,-14,0);
		obj_mesh[OBJ_SKYDOME].updateMatrixWorld( true );
	}
	//影
	obj_mesh[OBJ_STAGE].receiveShadow = true;	//受け
	
	//コートのラインを作成
	if(1){
		world_view.matrixWorld = new THREE.Matrix4();
		world_view.matrixAutoUpdate = true;
		var h = court_h;
		var w = court_w;
		PolyLine(-w-1,-h, 0,-h, 0,1);
		PolyLine( 0,-h, w+1,-h, 0,1);
		PolyLine(-w-1, h, 0, h, 0,1);
		PolyLine( 0, h, w+1, h, 0,1);

		PolyLine( w,-h+1, w, 0, 1,0);
		PolyLine( w, 0, w, h-1, 1,0);
		PolyLine(-w,-h+1,-w, 0, 1,0);
		PolyLine(-w, 0,-w, h-1, 1,0);

		if(!isVR) {
			PolyLine(0,-h+1, 0,0, 1,0);
			PolyLine(0, 0, 0,h-1, 1,0);
		}

		function PolyLine(x1,z1,x2,z2, bx,bz) {
			/*function PolyLineBox(x1,z1,x2,z2) {
				var geometry = new THREE.BoxGeometry( 1, 1,1 );
				var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
				var mesh = new THREE.Mesh( geometry, material );
				var y1 = getStageHeight(x1,z1);
				var y2 = getStageHeight(x2,z2);
				mesh.position.set((x1+x2)/2,(y1+y2)/2,(z1+z2)/2);
				var xx = x2-x1;
				var yy = y2-y1;
				var zz = z2-z1;
				var len = Math.sqrt(xx*xx + yy*yy + zz*zz);
				mesh.scale.set(0.1,2,len);
				mesh.rotation.x = -Math.atan2(yy,zz);//+Math.PI*0.5*1;
				mesh.rotation.y = -Math.atan2(zz,xx)+Math.PI/2;
				world_view.add(mesh);
//					console.log("atan2 zy="+Math.atan2(zz,yy)+" yz="+Math.atan2(yy,zz));
			}*/
			var geometry = new THREE.BufferGeometry();
			var material = new THREE.MeshLambertMaterial( {color: 0xffffff, emissive:0x606060/*, transparent:true*/} );
			var y1 = getStageHeight(x1,z1);
			var y2 = getStageHeight(x2,z2);
			y1 += 0.5;
			y2 += 0.5;
			var vertices = new Float32Array( [
				x1+bx, y1, z1-bz,
				x1-bx, y1, z1+bz,
				x2+bx, y2, z2-bz,

				x1-bx, y1, z1+bz,
				x2-bx, y2, z2+bz,
				x2+bx, y2, z2-bz,
				] );
			
			geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
			var mesh = new THREE.Mesh( geometry, material );
//			mesh.renderOrder = -1;
			mesh.receiveShadow = true;	//受け
			world_view.add(mesh);
		}
	}

	//物理
	//追加できるのはPlane/Box/SphereBufferGeometryのみ
	//それ以外の形状はshapeを作る
	const size1 = 17;
	const size2 = size1+1;
	var shape;
	var low_h = 100;
	//h_center = getStageHeight(0,0);
	//地面のShapeを作る（見えない）
	if(0) {
		var shape_verts = new Array(size2*size2);
		var shape_indices = new Array();
		for(var y=0;y<size2;y++) {
			for(var x=0;x<size2;x++) {
				var i = (y*size2) + (x);
				var v = new CANNON.Vec3();
				v.x = (x - size1/2)/size1 * (wall_w*2);	//コートの外もカバー
				v.z = (y - size1/2)/size1 * (wall_h*2);
				v.y = getStageHeight(v.x, v.z)+0.1;
				shape_verts[i] = v;
			}
		}

		for(var y=0;y<size1;y++) {
			for(var x=0;x<size1;x++) {
				var j = (y*size2) + (x);
				shape_indices.push([j+0, j+size2, j+1+size2, j+1]);
			}
		}
		//裏を向いているという警告やら出るが一応当たるので無視
		console.groupCollapsed();
		shape = new CANNON.ConvexPolyhedron(shape_verts, shape_indices);
		if(!debug) console.clear();
		console.groupEnd()
		low_h = center_h;
	}
	else {
		//CANNON.Heightfieldを使う
		//Plane同様、初期状態は垂直に立っているので後で回転の必要あり
		var hmap = [];
		for(var x = 0; x < size2; x++) {
			hmap.push([]);
			for(var y = 0; y < size2; y++) {
				var x2 = ((x - size1/2) / size1) * (wall_w*2);
				var z2 = ((y - size1/2) / size1) * (wall_w*2);
//				var y2 = getStageHeight(x2, z2) + 0.1 - h_center;	//(0,0)を回転中心にするのでオフセット
				var y2 = getStageHeight(x2, z2);	//(0,0)を回転中心にするのでオフセット
				if(low_h > y2) low_h = y2;	//一番低いところ
				y2 += 0.1;
				hmap[x].push(y2);
			}
		}
		//一番低い位置を基準にする
		//マイナスがあるとその領域に入った瞬間当たりがバグるらしい
		for(var x = 0; x < size2; x++) {
			for(var y = 0; y < size2; y++) {
				hmap[x][y] -= low_h;
			}
		}
		shape = new CANNON.Heightfield(hmap, {elementSize: (wall_w*2) / size1});	//1要素あたりのピッチ
	}
	{
		ground_mat = new CANNON.Material("ground");
		var body = physics.addMesh(null, shape, 0, ground_mat, GROUP_GROUND/*group*/);	//0は固定物
		//Heightfield
		if(shape.type == CANNON.Shape.types.HEIGHTFIELD) {
			body.quaternion.setFromEuler(Math.PI*1.5,0,Math.PI*1.0, "XYZ");
			body.position.set(wall_w, /*h_center*/low_h, -wall_w);
		}

		if(0){	//見えるように
			var mesh = Utility().shape2mesh({
				body: body,
				color: 0x666666
			});
			/*
			-5,0,10,
			400,-4,-400
			*/
			mesh.quaternion.setFromEuler( new THREE.Euler(Math.PI*1.5,0,Math.PI*1.0, "XYZ") );
			mesh.position.set(wall_w, /*h_center*/low_h+0.1, -wall_w);
			world_view.add(mesh);
			//test_mesh = mesh;
		}
	}
	body.addEventListener("collide", function(e) {
//			var body = e.with;
		var contact = e.contact;
		var name1 = contact.bi.material.name;
		var name2 = contact.bj.material.name;
//			console.log("hit "+name1+"+"+name2+" count="+count);
		//ボールと地面
		if(name1 == "ball" || name2 == "ball") {
			if(ball_flying) {
				Judge(false);
				ball_flying = 0;
			}
			if(foot_meshs !== undefined) {
				addFootStamp(ball.position.x, ball.position.y, ball.position.z, 0, 0);
			}
		}
		if(foot_meshs !== undefined) {
			//足あとをつける	foot_physics
			var f1 = (name1.indexOf("foot") >= 0);
			var f2 = (name2.indexOf("foot") >= 0);
			if(f1 || f2) {
				var name0 = (f1) ? name1 : name2;
				var body = f1 ? contact.bi : contact.bj;
				var type = Number(name0.substr(4,1));	//01=player 23=cpu
				addFootStamp(body.position.x, body.position.y, body.position.z, chrs[Math.floor(type/2)].rotation.y, type+1);
			}
		}
	});
	//ネット
	var wall = 200;		//壁の高さ
	var net_tbl = [
	//	size					offset
		[0.1,  29, court_h*2.2,	 0.0, 0, 0 ],	//center
		[0.1, wall, wall_h*2.0, -wall_w, 50, 0 ],	//back
		[0.1, wall, wall_h*2.0,  wall_w, 50, 0 ],	//back
		[wall_w*2.0, wall, 0.1,  0, 50, wall_h ],	//side
		[wall_w*2.0, wall, 0.1,  0, 50,-wall_h ],	//side
		[wall_w*2.0, 0.1, wall_h*2.0,  0, wall-50,0 ],	//天井
	];
	if(game_view == 0) {
		net_tbl[0][4] = -13;
	}
	court_net = new Array();
	wall_mat = new CANNON.Material("wall");
	for(var i=0;i<net_tbl.length; i++) {
		var shape = new CANNON.Box(new CANNON.Vec3( net_tbl[i][0]/2,net_tbl[i][1]/2,net_tbl[i][2]/2 ));
		var body = physics.addMesh( null, shape, 0, wall_mat, GROUP_GROUND/*group*/ );
		
		if(i==0) {
			body.addEventListener("collide", function(e) {
				var contact = e.contact;
				var name1 = contact.bi.material.name;
				var name2 = contact.bj.material.name;
				if(name1 == "ball" || name2 == "ball") {
					//ゲーム外は無視
					if (game_mode == MODE_RALLY && net_atari == 0) {
						if(game_view == 0) {
							net_atari = 1;
							court_net[0].visible = true;
						}

						if(ball_flying) {
							Judge(true);
							//console.log("Net hit");
							ball_flying = 0;
						}
					}
				}
			});
		}
		body.position.x += net_tbl[i][3];
		body.position.y += net_tbl[i][4];
		body.position.z += net_tbl[i][5];
	}
	var net_group = new THREE.Object3D();
	var i = 0;
	//VRモードは半透明板
	if(game_view == 0) {
		var geometry = new THREE.BoxBufferGeometry( net_tbl[i][0],net_tbl[i][1],net_tbl[i][2] );
		var material = new THREE.MeshLambertMaterial( {color: 0x000080,transparent:true,opacity:0.5} );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.y += net_tbl[i][1]/2;
		mesh.visible = false;
		mesh.renderOrder += 0.1;
		court_net.push(mesh);
		net_group.add(mesh);
	}
	else {
	//ノーマルモードは物理ネット
		const net_w = 6;
		const net_h = 70;
		var indices = new Uint16Array( (net_w+net_h) * 2 );
		var positions = new Float32Array( (net_w+net_h) * 2 * 3 );
		
		var k,j;
		var iv = 0, ii = 0;
		for(k=0;k<net_h;k++) {
			indices[ii++] = iv / 3 + 0;
			indices[ii++] = iv / 3 + 1;
			for(j=0;j<2;j++) {
				positions[iv++] = 0;
				positions[iv++] = net_tbl[i][1] * (j * 0.5 - 0.0) - 2;
				positions[iv++] = net_tbl[i][2] * (((k+1) / (net_h+1)) - 0.5);
			}
		}
		for(k=0;k<net_w;k++) {
			indices[ii++] = iv / 3 + 0;
			indices[ii++] = iv / 3 + 1;
			for(j=0;j<2;j++) {
				positions[iv++] = 0;
				positions[iv++] = net_tbl[i][1] * (((k+1) / (net_w+1)) * 0.5 - 0.0) - 2;
				positions[iv++] = net_tbl[i][2] * (j - 0.5);
			}
		}

		var geometry = new THREE.BufferGeometry();
		geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
		geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

		mesh = new THREE.LineSegments( geometry, new THREE.LineBasicMaterial( { color: 0x606060 } ) );
		mesh.castShadow = true;
		net_group.add(mesh);

		//
		//上下の白い帯
		geometry = new THREE.PlaneGeometry( net_tbl[i][2], 1, 2 );
		geometry.rotateY(-Math.PI/2);
		material = new THREE.MeshLambertMaterial( {color: 0xffffff, emissive:0x606060, side: THREE.DoubleSide} );
		clearOutline(material);

		var tapes = new THREE.InstancedMesh( geometry, material, 2 );
		tapes.setMatrixAt(0, (new THREE.Matrix4()).makeTranslation(0, net_tbl[i][1] * 0.5 + 0.5 - 2, 0));
		tapes.setMatrixAt(1, (new THREE.Matrix4()).makeTranslation(0, net_tbl[i][1] * 0.0 - 0.5 - 2, 0));

		tapes.castShadow = true;
		net_group.add(tapes);
		
		//ポール
		geometry = new THREE.CylinderGeometry( 1,1, net_tbl[i][1]+1, 8,1 );
		material = new THREE.MeshLambertMaterial( {color: 0x8080ff, emissive:0x303030} );
		clearOutline(material);
		var poles = new THREE.InstancedMesh( geometry, material, 2 );
		poles.setMatrixAt(0, (new THREE.Matrix4()).makeTranslation(0, 0, court_h*1.1));
		poles.setMatrixAt(1, (new THREE.Matrix4()).makeTranslation(0, 0,-court_h*1.1));

		poles.castShadow = true;
		net_group.add(poles);
		net_group.position.y += 15; //補正
	}
//	if(!noStage) net_group.rotation.x += -0.1;
	net_group.position.x += net_tbl[i][3];
	net_group.position.z += net_tbl[i][5];
	net_group.position.y += net_tbl[i][4] + getGround(net_group.position.x, net_group.position.z);
	world_view.add(net_group);

	//海
	if(isOcean) {
		var gsize = 5000;	//実寸
		var res = 1024;
		var gres = res/2;
	//		var origx = - gsize / 2;
	//		var origz = - gsize / 2;
		ocean = new Ocean( renderer, camera, scene,
			{
				USE_HALF_FLOAT: false,
				INITIAL_SIZE: 2048.0,
				INITIAL_WIND: [ 20.0, 0.0 ],
				INITIAL_CHOPPINESS: 1.5,
				CLEAR_COLOR: [ 1.0, 1.0, 1.0, 0.0 ],
	//				GEOMETRY_ORIGIN: [ origx, origz ],
				SUN_DIRECTION: [ - 1.0, 1.0, 1.0 ],
				OCEAN_COLOR: new THREE.Vector3( 0.004, 0.016, 0.047 ),
				SKY_COLOR: new THREE.Vector3( 3.2, 9.6, 12.8 ),
				EXPOSURE: 0.35,
				GEOMETRY_RESOLUTION: gres,
				GEOMETRY_SIZE: gsize,
				RESOLUTION: res
			} );
		ocean.materialOcean.uniforms[ "u_projectionMatrix" ] = { value: camera.projectionMatrix };
		ocean.materialOcean.uniforms[ "u_viewMatrix" ] = { value: camera.matrixWorldInverse };
		ocean.materialOcean.uniforms[ "u_cameraPosition" ] = { value: camera.position };
		world_view.add( ocean.oceanMesh );
		if(0){
			var geometry = new THREE.BufferGeometry();
			var org = obj_mesh[OBJ_SEA].geometry;
			var vtx = org.attributes.position.array;
			var vertices = new Float32Array(vtx.length);
			for(var i=0;i<vtx.length;i++) { vertices[i] = vtx[i]; }
			geometry.index = org.index;
			geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	//			geometry.setAttribute( 'index'   , new THREE.BufferAttribute( indices, 1 ) );	//廃止？
			ocean.oceanMesh.geometry = geometry;
		}
		else {
			ocean.oceanMesh.geometry.translate(0,-26,-2600);
			ocean.oceanMesh.geometry.rotateX(stage_rotate_x);
			ocean.oceanMesh.renderOrder -= 2;
		}
		ocean.changed = true;
	}
}	//createCourt

//足跡メッシュ
var foot_count = 0;
var foot_pos = Array(3*5);	//0:ball 1,2=足1 3,4=足2
function initFootStamp() {
	var geometry = new THREE.CircleGeometry( 1,10 );
	geometry.rotateX(-Math.PI/2);
	var material = new THREE.MeshLambertMaterial( {color: 0xD0B999, transparent:true,opacity:0.6} );
	foot_meshs = new THREE.InstancedMesh( geometry, material, 200 );
	foot_meshs.instanceMatrix.setUsage( THREE.DynamicDrawUsage );
	for(var i=0;i<foot_meshs.count;i++) {
		var matrix = (new THREE.Matrix4()).makeTranslation(0,-100,0);
		foot_meshs.setMatrixAt(i, matrix);
	}
	world_view.add(foot_meshs);
	foot_meshs.receiveShadow = true;
}
//foot_physics
//type: 0=ボール 1234=右左
function addFootStamp(x,y,z, r, type) {
	//右左で別扱い
	var len = Math.sqrt((foot_pos[type*3+0]-x)*(foot_pos[type*3+0]-x) + (foot_pos[type*3+1]-z)*(foot_pos[type*3+1]-z));
	if(len < 2 && type > 0) {	//近すぎるので
		var r2 = Math.abs(foot_pos[type*3+2] - r);	//角度差
		if(r2 < 0.5) {
			return;
		}
	}
	else if(len < 0.3) {	//ボール
		return;
	}
	var id = 0;
	if(type > 0) {
		id = (type < 3) ? 0 : 1;
	}
//	console.log("foot len:",len);
	foot_pos[type*3+0] = x;
	foot_pos[type*3+1] = z;
	foot_pos[type*3+2] = r;
	y = getGround(x,z)+0.1;
	var matrix = (new THREE.Matrix4()).makeTranslation(x,y,z);
//	matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationX(-0.07));
	matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(r));
	if(type > 0) {	//足の形状
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(0.5, 1, 1.5));	//未央
		if(chrs[id] == player_mesh) {	//プレイヤー(P)
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(1.4, 1, 1.2));
		}
//	console.log("foot type:",type);
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeTranslation(0,0,1));
	}
	else {
		//ボール跡
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(1.2, 1.2, 1.2));
	}
	foot_meshs.setMatrixAt(foot_count, matrix);
	foot_count = (foot_count+1) % foot_meshs.count;
	foot_meshs.instanceMatrix.needsUpdate = true;
	//音を出す
//	if(type == 0)	//ボール
	SoundPlay(SOUND_RUN);

	//砂埃
	var cnt = 8;
	for(var i=0;i<sand_param.length && cnt > 0;i++) {
		if(sand_param[i].count < 0) {
			sand_param[i].count = 0;
			sand_param[i].position.set(x,y,z);
			sand_param[i].power = Math.random();
			if(type == 0) {
				//ボール
				var v = physics.getBody( ball ).velocity;
				var r2 = Math.atan2(v.x, v.z);	//ボールの飛ぶ方向
//				sand_param[i].type = 0;
				sand_param[i].rotation = r2+Math.PI;
				var p2 = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
				//ボールの威力が高いときは量と勢いを増やす
				sand_param[i].power += (p2 / 15) * (Math.random()*0.8+0.2);
				if(p2 > 10) cnt += 0.5;
			}	
			else {
				//足
//				sand_param[i].type = (anim_user[id].run > 0) ? 1 : 2;
				sand_param[i].rotation = r;
				if(anim_user[id].run == 0) {	//走ってないときは弱く
					sand_param[i].power = 0;
					cnt--;
				}
			}
			sand_param[i].rotation += (Math.random()*2-1)*0.9;
			sand_param[i].position.x += Math.random()*2-1;
			sand_param[i].position.z += Math.random()*2-1;
			cnt--;
		}
	}
}
function SandUpdate()
{
	if(sand_meshs == undefined) return;
	for(var i=0;i<sand_param.length;i++) {
		if(sand_param[i].count < 0) continue;

		var s = sand_param[i];
		const max = (s.power == 0) ? 20 : 60;
		var vx = 0;	//飛ぶ方向
		var vz = (s.count/max) * -(4+s.power*2) - 1;
		var vy = Math.sin((s.count/max)*Math.PI) * (1.5+s.power*2);
		var matrix = (new THREE.Matrix4()).makeTranslation(s.position.x, s.position.y+1, s.position.z);
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(s.rotation));
//		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(2,2,2));
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeTranslation(vx,vy,vz));
		//sand_meshs.setMatrixAt(i,matrix);
		var positions = sand_meshs.geometry.attributes.position.array;
		var p = (new THREE.Vector3()).setFromMatrixPosition(matrix);
		positions[i*3+0] = p.x;
		positions[i*3+1] = p.y;
		positions[i*3+2] = p.z;
		
		if(++s.count >= max) {
			s.count = -1;
			positions[i*3+1] = -100;
		}
	}
//	sand_meshs.instanceMatrix.needsUpdate = true;
	sand_meshs.geometry.attributes.position.needsUpdate = true;

	//ライティングが暗いときに浮かないように
	var alpha1 = 1.0;
	var alpha2 = 0.3;
	if(day_time < 5) {
		alpha1 = alpha2;
	}
	else if(day_time < 6) {
		alpha1 = alpha1 * (day_time-5) + alpha2 * (6-day_time);
	}
	else if(day_time < 18) {
	}
	else if(day_time < 19) {
		alpha1 = alpha1 * (19-day_time) + alpha2 * (day_time-18);
	}
	else {
		alpha1 = alpha2;
	}
	sand_meshs.material.opacity = alpha1;
}

const score_home = new THREE.Vector3(-2.5*5, 22, -court_h*1.1);
//var score_plus = new THREE.Vector3(-2.5*3, 13, 0);
function createText(text, material) {
	var loader = new THREE.FontLoader();
	loader.load( '../three.js-master/examples/fonts/helvetiker_regular.typeface.json',
		function ( font ) {
			text_geo = new THREE.TextGeometry( text, {
				font: font,
				size: 8,
				height: 0.5,	//厚さ
			} );
			if(text_mesh != null) {
				world_view.remove(text_mesh);
				text_mesh = null;
			}
			text_mesh = new THREE.Mesh( text_geo, material );
			text_mesh.position.copy(score_home);
			clearOutline(text_mesh.material);
			world_view.add(text_mesh);
		},
		function ( xhr ) {},
		function ( err ) {}
	);
}
//スコア
function createScore() {
	var score_text = score[0]+"-"+score[1];
	if(score[0] < 10) score_text = " "+score_text;
	createText(score_text, new THREE.MeshLambertMaterial( {color: 0xff4040} ));

}
function createTitle() {
	
	createText("Press Start", new THREE.MeshLambertMaterial( {color: 0x40ff40} ) );
}

//判定
function Judge(isNet) {

	if(touch_type < 0) return;
//	console.log("Judge "+isNet);

	var is_court = 2;	//コート外
	if(ball.position.z >= -court_h
	&& ball.position.z <=  court_h
	&& ball.position.x >= -court_w
	&& ball.position.x <=  court_w
	) {
		if(ball.position.x < 0) {	//相手側コート内
			is_court = 1;
		}
		else {						//プレイヤー側コート内
			is_court = 0;
		}
	}
	if(isNet) {	//どちらに落ちても最後に触ったほうの負け
		is_court = 1-touch_type;
	}
	//当たり判定中なのでUpdateに渡す
	judge_flag = is_court;
}
function JudgeCheck() {
	if(judge_flag < 0) return;

	SoundPlay(SOUND_WHISTLE_END);
	score_plus[0] = score_plus[1] = 0;
//	console.log("is_court:"+is_court);
	//0:相手
	//1:プレイヤー
	if(touch_type == 0) {	//最後に相手が触って
		if(judge_flag == 0) {	//プレイヤー側に落ちた
			serve_player = 0;
		}
		else {				//それ以外
			serve_player = 1;
		}
	}
	else {	//最後にプレイヤーが触って
		if(judge_flag == 1) {	//相手側に落ちた
			serve_player = 1;
		}
		else {				//それ以外
			serve_player = 0;
		}
	}
	if(game_view == 1) {
		attack_flag = 0;
		attack_circle.visible = false;
	}
	//serve_player:加点→サーブ権
	score_plus[serve_player]++;
	anim_user[serve_player].joy = 1;
	anim_user[serve_player].run_stop = 1;
	anim_user[serve_player].walk_stop = 1;
	anim_user[1-serve_player].regret = 1;
	anim_user[1-serve_player].run_stop = 1;
	anim_user[1-serve_player].walk_stop = 1;

	//回収
	game_mode = MODE_BEGIN;
	game_count = 0;

	if(game_view == 0) serve_player = 1;
	if(tutorial.step == 20) serve_player = game_player;
	if(game_view != 2) {
		//点数入る演出＆ゲームセットで停止
		score_anim = 1;
		if (score[0]+score_plus[0] >= game_end_score ||
			score[1]+score_plus[1] >= game_end_score) {
			game_mode = -1;
		}
	}
	else {
		//鑑賞モードでは得点を即反映
		score[1] += score_plus[1];
		score[0] += score_plus[0];
		score_plus[0] =
		score_plus[1] = 0;
		createScore();
		SoundPlay(SOUND_CHEER);
	}

//	console.log("len:"+len);
//	anim_user[1-serve_player].run_stop = 1;
//	anim_user[1-serve_player].walk_stop = 1;
	judge_flag = -1;
	resetTurn();
}

function resetTurn()
{
	game_rally = 0;
	attack_next = 0;
	attack_on = 0;
	touch_type = -1;
	life_damage[0] = 0;
	life_damage[1] = 0;
	EffectErase("attack");
	EffectErase("block");
}

function resetGame(flg)
{
	score[0]=score[1] = 0;
	if(flg) createScore();
	touch_type = -1;
	game_mode = MODE_BEGIN;
	game_count = 0;
	if(game_view != 0) {
		serve_player = game_player;
	}
	last_shot_pos[0] = new THREE.Vector3(-court_w/2,0,0);
	last_shot_pos[1] = new THREE.Vector3( court_w/2,0,0);

	for(var i=0;i<2;i++) {
		anim_user[i] = {
			walk : 0,		//歩く
			walk_stop : 0,	//止まるフラグ
			walk_back : 0,	//後ろ歩き
			run : 0,		//走る
			run_stop : 0,	//止まるフラグ
			receive : 0,	//レシーブ
			pickup : 0,		//拾う
			serve2 : 0,		//からのサーブ
			serve2_sw : 0,	//トリガー
			stanby : 0,		//(サーブ後)待機
			gohoubi : 0,	//ごほうびモード 1:なでなで 2:でこぴん 3:なげキッス 5:おわり
			nade : 0,		//ごほうびカウンタ
			winflg : 0,		//勝利の舞（移動）
			win : 0,		//勝利の舞
			joy : 0,		//加点＆↑兼用
			regret : 0,		//残念
			attack : 0,		//アタック
			vacation : 0,	//タイトル
		};
	}
}

function HitEffectInit(type, id) {
	var p = (new THREE.Vector3());
	if(type == 1) {
		p.copy(hand_pos);
	}
	else {
		p.setFromMatrixPosition(findBone(chrs[id],"右中指１").matrixWorld);
	}
	p.add(ball.position);
	p.multiplyScalar(0.5);
	for(var i=0;i<hit_effects.length;i++) {
		hit_effects[i].position.copy(p);
		hit_param[i].vec.set(Math.random()-0.5, Math.random()/2, Math.random()-0.5);
		hit_param[i].vec.multiplyScalar(0.6);
	}
	hit_effects[0].material.opacity = 1.0;
	hit_effects[1].material.opacity = 1.0;
}
function HitEffectUpdate(type) {
	for(var i=0;i<hit_effects.length;i++) {
		hit_param[i].vec.y -= 0.0075;
		hit_effects[i].position.add(hit_param[i].vec);
	}
	if(hit_effects[0].material.opacity >= 0.015) {
		hit_effects[0].material.opacity -= 0.015;
	}
	if(hit_effects[1].material.opacity >= 0.015) {
		hit_effects[1].material.opacity -= 0.015;
	}
}

const HAND_OFF_Y = -1.2;
const HAND_OFF_Z = -8.0
//腕の場所
function HandUpdate() {
	const eye_h = 3.0;	//目線の高さ（誤差修正）
	var mat0 = new THREE.Matrix4();
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(player_x,player_y+player_h,player_z));
	if(controller1) {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_default_rot_y));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationFromQuaternion( controller1.quaternion ));
	}
	else if(debug_mode1) {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_default_rot_y));
	}
	else {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(cam_rot_z));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_rot_y + cam_default_rot_y));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(cam_rot_x));
	}
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,HAND_OFF_Y,HAND_OFF_Z));
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY( Math.PI ));

	//腕のbodyも更新
	var t = (new THREE.Vector3()).setFromMatrixPosition(mat0);
	var q = (new THREE.Quaternion()).setFromRotationMatrix(mat0);
	if(hand_debug_mesh) {
		hand_debug_mesh.position.copy(t);
		hand_debug_mesh.quaternion.copy(q);
	}
	hand_pos.copy(t);
	if(hand_physics) {
		hand_physics.position.copy(t);
		hand_physics.quaternion.copy(q);
	}
//	document.getElementById("debugOut").innerHTML += "t "+t.x+","+t.y+","+t.z+"<br>";
	
	//ボディに反映
	mat0 = new THREE.Matrix4();
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(player_x,player_y+player_h+eye_h,player_z));
	if(controller1) {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_default_rot_y));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationFromQuaternion( controller1.quaternion ));
	}
	else if(debug_mode1) {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_default_rot_y));
	}
	else {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(cam_rot_z));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_rot_y + cam_default_rot_y));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(cam_rot_x));
	}
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY( Math.PI ));
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,-player_h-eye_h,-0.6));
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeScale( 0.93,0.93,0.93 ));
	player_mesh.matrix = mat0;	
	player_mesh.matrixAutoUpdate = false;

	//ガイド
	/*if(guide_mesh) {
		mat0 = new THREE.Matrix4();
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(camera_x,camera_y,camera_z));
		if(controller1) {
			mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationFromQuaternion( controller1.quaternion ));
		}
		else {
			mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(cam_rot_z));
			mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_rot_y + cam_default_rot_y));
			mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(cam_rot_x));
		}
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(-3+adj_x*0,-2.5*0+adj_y*0,-8+adj_z*0));
//		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,0,-8));
//		var base = (new THREE.Vector3()).setFromMatrixPosition(mat0);
//		base.subVectors(ball.position);
		var arrow = (new THREE.Vector3()).setFromMatrixPosition(mat0);
			

		mat0 = (new THREE.Matrix4()).makeTranslation(arrow.x, arrow.y, arrow.z);
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).lookAt( arrow, ball.position, new THREE.Vector3(0,1,0) ));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX( Math.PI*-0.5 ));

		guide_mesh.matrix = mat0;
		guide_mesh.matrixAutoUpdate = false;
	}*/
}
function getStageHeight(x,z) {
	if(org_light_mode == 2) return 0;
	var TopOverPos = new THREE.Vector3(x, 100, z); //1.はるか上空のポイントを用意
	var downVect = new THREE.Vector3(0,-1,0);	 //下向きのベクトルのみが入ったVector3を用意
	var ray = new THREE.Raycaster(TopOverPos, downVect);  //2.真下に向かう線がコレ

	var objs = ray.intersectObjects([obj_mesh[OBJ_STAGE]]);   //衝突点検出！
	var tgt_y = -100;
	for (var i = 0; i < objs.length; i++) {
		if(tgt_y <  objs[i].point.y) {
			tgt_y = objs[i].point.y;
			
		}
	}
	if(objs.length > 0) {
		return tgt_y;
	}
	return 0;
}
//物理地面の高さを調べる。軽量版
function getGround(x,z) {
	if(org_light_mode == 2) return 0;
	var from = new CANNON.Vec3(x, 100,z);
	var to   = new CANNON.Vec3(x,-100,z);
	var result = new CANNON.RaycastResult();;
	var option_ground = {	//地面にだけ反応する
		collisionFilterMask:1|2|4|8,
		collisionFilterGroup:1|2|4|8,
		skipBackfaces:false,
		checkCollisonResponse:true,
	};
	if(physics.world.raycastAny(from, to, option_ground, result)) {
		return from.y - result.distance;
	}
	//console.log("getGround failed("+x+","+z+")");

	return 0;
}

//プレイヤーに向けて飛ばす
function shootToPlayer() {
	//飛ぶ先はプレイヤー周囲のどこか
	//できるだけHandUpdateと同じ計算式で
	var mat0 = new THREE.Matrix4();
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(player_x,player_y+player_h,player_z));
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(-Math.PI*0.5));	//真ん中
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY((Math.random()/2-0.5)*0.75*Math.PI/2));	//真ん中
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,HAND_OFF_Y,HAND_OFF_Z+2.5));
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY( Math.PI ));
	var pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);	//飛ぶ先
	shootToTarget(1, pos, 0);
}

function getCPULevel() {
	var rnd = Math.random();
	if(game_view == 1) {
		switch(option.game_level) {
		case 0:
			return rnd;
		case 2:
			if(Math.random() < 0.8) {
				return (1-Math.sin(Math.sin(rnd*Math.PI/2)*Math.PI/2));	//0に近くなる傾向
			}
		}
	}
	return (Math.cos(rnd*Math.PI/2));
}

//CPUvsCPU用。コートのどこかランダム
//id:打つ側 0:プレイヤー（代理） 1:相手
function shootToRandom(id) {
	var not_cpu = (id == game_player && game_view == 1);
	var level = not_cpu ? attack_hit : getCPULevel();
	if(!not_cpu) {
		console.log("cpu level:"+level);
	}

	if(tutorial.enable && not_cpu && tutorial.step < 25) {
		level = 0.7;
	}
//		EffectErase('balleffect');
//		EffectCreate('balleffect', ball.position);
	EffectErase("attack");
	EffectErase("block");
	attack_on = 0;
	//アタックさせるか？
	if(attack_next == 1) {	//チャンスボール→アタック
		attack_next = 0;
		attack_on = 1;
		level *= 0.5;
		//ネットに当たらないよう、最低限の高さに調整
		ball.position.y = physics.getBody(ball).position.y = getGround(ball.position.x, ball.position.z) + 35;
		if(tutorial.enable && (tutorial.step < 25 || tutorial.step == 26 && game_rally <= 1)) {
			attack_hit = not_cpu ? 0 : 0;	//プレイヤー:ブロックされない
		}
	}
	else {
		//次はアタックされる
		if(attack_next == 0) {
			var chance = 0;
			//CPUは20%で、プレイヤーは目押し失敗時に30%
			if(not_cpu) {	///player
				if(level > 0.9 && Math.random()<0.3) chance = 1;
			}
			else {	//CPU
				if(level > 0.8) chance = 1;
			}
			if(tutorial.enable && tutorial.step <= 25) {
				chance = 0;
				if(game_rally > 3 && id != game_player && tutorial.step == 16) {
					chance = 1;
				}
				if(id == game_player && tutorial.step >= 22) {
					chance = 1;
				}
			}
			//if(debug==2)
			//chance = 1;	//debug
			if(chance) {
				attack_next = 1;	//チャンスボール
				level = 0;
			}
		}
		else {
			attack_next = 0;
		}
		level *= 0.8;	//1はほぼ動かないので
	}

	var dir = ((id == 0) ? 1 : -1);
	var pos = new THREE.Vector3();
	var len = (1 - Math.sin(level*Math.PI/2));
	var base_x = last_shot_pos[1-id].x;
	var base_z = last_shot_pos[1-id].z;
	//かんたん→現在位置寄り
	//むずかし→前ターン寄り
	var level2 = (not_cpu) ? 1 : level;
	base_x = (base_x * (1-level2)) + (chrs[1-id].position.x * (level2));
	base_z = (base_z * (1-level2)) + (chrs[1-id].position.z * (level2));
	var len2 = len;
	var pwx = 0.6*court_w;
	var pwz = 1.8*court_h;
	if(not_cpu) pwz *= 1.3;
	do {
		var r = Math.random()*Math.PI*2;
		pos.x = base_x + Math.sin(r)*len2*pwx;
		pos.z = base_z + Math.cos(r)*len2*pwz;
		len2 *= 0.99;
	}
	while((pos.z >  court_h*0.95
		|| pos.z < -court_h*0.95
		|| pos.x*dir > court_w*0.95
		|| pos.x*dir < court_w*0.35)
		&& len2 > 0.01);
	if(len2 <= 0.01) {
		pos.x = base_x;
		pos.z = base_z;
	}
	else {
//		console.log("len:"+len+"->"+len2);
	}
	//アタックさせるか？
	if(attack_on && attack_next != 2) {	//アタックを受けた
		pos.x = (pos.x+court_w*dir)/2;
		//console.log("attack ball");
	}
	else if(attack_next == 1) {	//チャンスボールの落下地点
		//次はアタックされる
		pos.x = court_w*0.15*dir;
		//console.log("chance ball");
	}

	pos.y = getGround(pos.x, pos.z) + 1;
	ball_target.copy(pos);
	shootToTarget(id, pos, level);
	if(attack_on) {	//アタックに対してブロック（疑似アタック）
		attack_next = 2;
	}else {
//		attack_next = 0;
	}
	PredictionBall(1-id);

}
//（対戦・観戦共通）相手に向けて飛ばす
function shootToTarget(id, pos, level) {
	last_shot_pos[id] = chrs[id].position.clone();	//最後に打った場所
	shotBallTarget(id, pos, level);
	ball_flying = 1;
	touch_type = id;
	atari_disable = 0;
	HitEffectInit(0, id);
	SoundPlay(SOUND_BALL);

	var av = physics.getBody(ball).angularVelocity;
	av.x = (Math.random()*2-1)*1.6;
	av.y = (Math.random()*2-1)*1.6;
	av.z = (Math.random()*2-1)*1.6;
}

//座標を指定して飛ばす
//垂直方向の力（高さ）を自由に決められる
//向きに対する力は距離をシミュレートして計算
function shotBallTarget(id, target, level) {
	var up;// = Math.sqrt(len * 5.1);	//垂直にかける力
	//高さ
	if(game_view != 0) {
		if(!attack_on || attack_next == 2) {	//ブロック時
			up = 19;
			//遠いときは少し上げる
			up += Math.abs(ball.position.x / court_w) * 4.0;
			if(attack_next != 0) {
				up += 10;
				target.z = chrs[1-id].position.z * 0.8 + target.z * 0.2;	//相手側に近づけることでアタックに間に合いやすくする
				target.y += 25;	//高くないとネットに当たってしまう
			}
			else {
				up += Math.random()*7+(1-level)*7;
			}
		}
		else {
			up = 0;
		}
	}
	else {
		//一人称モードでは低め
		up = 14+Math.random()*5;
	}
	var v = (new THREE.Vector3()).subVectors(target, ball.position);
	v.y = 0;
	var len = v.length();
	if(len <= 0) {
		return;
	}
	v.normalize();

	while(true) {
		var y = ball.position.y;
		var f = 0;
		var vy = up;
		const gravity = -9.8;
		var dt = 0.0166*2;	//精度
		while(y >= target.y || vy > 0) {	//シミュレートしてかかるフレームを取得
			vy += gravity * dt;
			y += vy * dt;
			f++;
		}
		if(f > 0) {
			f = (len/f)/dt;
			v.x *= f;
			v.z *= f;
			physics.getBody( ball ).velocity = new CANNON.Vec3(v.x, up, v.z);
			return;
		}
	}
}

function CheckWall(pos) {
	if (pos.x > court_w*2) {
		pos.x = court_w*2;
	}
	else if (pos.x < -court_w*2) {
		pos.x = -court_w*2;
	}
	if (pos.z > court_h*1.6) {
		pos.z = court_h*1.6;
	}
	else if (pos.z < -court_h*1.6) {
		pos.z = -court_h*1.6;
	}
}

//ボールが通過する地点と落ちる地点を予測
//id:相手側
function PredictionBall(id) {
	var body = physics.getBody( ball );
	var velo = body.velocity.clone();
	var pos  = body.position.clone();
	var dir = ((id == 0) ? 1 : -1);
	var dt = 0.0166*1;	//精度
	const gravity = -9.8;
	var flg = 0;
	var tm = 0;
	var height2 = 12;
	if(attack_next != 0) height2 += 19+9;
	while(1) {
		for(var i=0;i<physics_speed;i++) {
			velo.y += gravity * dt;
			pos.x += velo.x * dt;
			pos.y += velo.y * dt;
			pos.z += velo.z * dt;
		}
		tm += dt;
		//CheckWall(pos);

		if(velo.y < 0 && pos.x*dir < court_h*-0.08) {
			dt = 0.0166;
			var height = getGround(pos.x, pos.z);
			var drop = ball_drop1;
			if(pos.x < 0 && id == 1) {	//自陣に落ちる
				drop = ball_drop2;
			}
			if(pos.x > 0 && id == 0) {	//自陣に落ちる
				drop = ball_drop2;
			}
			//else 相手陣に落ちる
			//通過（キャラ追いかけ用）
			else if(pos.y < height2+height && flg == 0 && velo.y < 0) {
				flg = 1;
				ball_target.x = pos.x;
				ball_target.y = pos.y;
				ball_target.z = pos.z;
				var frm = tm / 0.0166;
				atk_mot_start[id] = 1;
				if(attack_next != 0)
					atk_mot_count[id] = frm - (20+20);
				else
					atk_mot_count[id] = frm - (10+20+10-9);
				if(id == game_player) {
					/*if(attack_next != 1)*/ {
						ball_time_max = frm-5;	//5f前
						ball_time_cur = 0;
						if(attack_next == 0) {
							attack_hit = 1;
						}
						attack_flag = 1;	//アタックカーソルを出す
						if(game_view == 1) {
							EffectCreate("attack", ball_target, (attack_next == 0) ? 13 : 0);
							if(attack_next) {
								SoundPlay(SOUND_CIRCLE);
							}
						}
					}
					//console.log("attack_next"+attack_next);

 					if(tutorial.enable && (tutorial.step == 8) && tutorial.count == 0) {
						tutorial.count = 1;
					}
				}
				else if(attack_next == 1) {	//チャンスボール
					ball_time_max = frm-5;	//5f前
					ball_time_cur = 0;
					attack_hit = 1;
					attack_flag = 1;	//アタックカーソルを出す
					if(game_view == 1) {
						EffectCreate("block", ball_target);	//ブロックしろ！
						SoundPlay(SOUND_CIRCLE);
					}
				}
				if(atk_mot_count[id] < 0) {
					atk_mot_start[id] = -atk_mot_count[id];
					atk_mot_count[id] = 1;
				}
				if(debug) {
					debug_obj1.position.copy(ball_target);	//赤
				}
			}
			//落下地点
			if(pos.y < height+1) {
				drop.x = pos.x;
				drop.y = pos.y;
				drop.z = pos.z;
				if(debug) {
					debug_obj2.position.copy(drop);	//青
				}
				return;
			}
		}
		if(court_center.y-10 > pos.y) {	//緊急処理
			break;
		}
	}
}
/*function getStandPos(left) {
	var name = (left !== undefined || !left) ? "右つま先" : "左つま先";
	var pos = (new THREE.Vector3()).setFromMatrixPosition(findBone(chr_mesh,name,0).matrixWorld);
	return pos;	//立ち位置
}*/

//プレイヤーのカメラが相手を見ているか？
//視線ベクトルを内積して調べる
function isPlayerLook() {
	if(game_view != 0) return true;
	var chv = new THREE.Vector3(chr_mesh.position.x-player_x, chr_mesh.position.y-player_y, chr_mesh.position.z-player_z);
	chv.normalize();

	var mat0 = new THREE.Matrix4();
	if(controller1) {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_default_rot_y));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationFromQuaternion( controller1.quaternion ));
	}
	else {
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(cam_rot_z));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(cam_rot_y + cam_default_rot_y));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(cam_rot_x));
	}
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY( Math.PI ));
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,0,10));
	var myv = (new THREE.Vector3()).setFromMatrixPosition(mat0);
	myv.normalize();
	
//	console.log("dot="+myv.dot(chv));
	if(myv.dot(chv) > 0.4) {	//みてる
		return true;
	}
	return false;	//みてない
}


function walkUpdateTarget(id, x, z, speed, near) {
	var zz = (z - chrs[id].position.z);
	var xx = (x - chrs[id].position.x);
	var len = Math.sqrt(zz*zz+xx*xx);
	var r = Math.atan2(zz,xx);
	if(near == undefined) near = 8;	//default
	if(len >= near) {
		//走る
		if(speed > 0.75) {
			if(anim_user[id].run == 0 || anim_user[id].walk) {
				anim_user[id].run  = 1;
				anim_user[id].walk = 0;
			}
			anim_user[id].run_stop = 0;
		}else {
			if(anim_user[id].walk == 0 || anim_user[id].run) {
				anim_user[id].run  = 0;
				anim_user[id].walk = 1;
			}
			anim_user[id].walk_stop = 0;
		}
		walkUpdate(id, r, speed);
	}
	else {
		//止まる
		if(anim_user[id].run > 0 && anim_user[id].run_stop == 0) {
			anim_user[id].run_stop = 1;
		}
		if(anim_user[id].walk > 0 && anim_user[id].walk_stop == 0) {
			anim_user[id].walk_stop = 1;
		}
	}
	return len;
}
function walkUpdate(id, r, speed) {
	chrs[id].position.x += Math.cos(r)*0.75*speed;
	chrs[id].position.z += Math.sin(r)*0.75*speed;
	//立ち位置（高さ）
	chrs[id].position.y = getGround(chrs[id].position.x,chrs[id].position.z);
}

function rotateUpdate(id, x, z, spd) {
	var zz = (z-chrs[id].position.z);
	var xx = (x-chrs[id].position.x);
	var r = Math.atan2(zz,xx);
	r = -r+Math.PI/2;

	while(chrs[id].rotation.y < -Math.PI) chrs[id].rotation.y += Math.PI*2
	while(chrs[id].rotation.y >  Math.PI) chrs[id].rotation.y -= Math.PI*2
	while(r < -Math.PI) r += Math.PI*2
	while(r >  Math.PI) r -= Math.PI*2
	if		(r < -Math.PI/2 && chrs[id].rotation.y >  Math.PI/2) r += Math.PI*2;
	else if	(r >  Math.PI/2 && chrs[id].rotation.y < -Math.PI/2) r -= Math.PI*2;

	var stp = 0.1;
	if(spd !== undefined) stp *= spd;
	if(r > chrs[id].rotation.y+stp) {
		chrs[id].rotation.y += stp;
	}
	else if(r < chrs[id].rotation.y-stp) {
		chrs[id].rotation.y -= stp;
	}
	else {
		return true;
	}
	return false;
}
function SurfUpdate() {
	if(surf_meshs == undefined) return;
	for(var i=0;i<surf_meshs.count;i++) {
		var body = surf_body[i];
		var matrix;
		matrix = (new THREE.Matrix4()).makeTranslation(body.position.x, body.position.y, body.position.z);
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationFromQuaternion( new THREE.Quaternion(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w) ));
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationZ(Math.PI/2));
//		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(Math.PI/2));
		matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationX(Math.PI/2*(i<3?-1:1)));
		if(game_view != 0)
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationX(Math.PI/2));
		surf_meshs.setMatrixAt(i, matrix);
	}
	surf_meshs.instanceMatrix.needsUpdate = true;
}
function DayUpdate() {

	if(org_light_mode == 2) return;
	if(!tutorial.enable && load_seq < 0) {
		day_time += 0.01/15;
		if(day_time >= 24) day_time = 0;
	}
	if(count % 15 != 0) return;	//1秒に4回

	const light_tbl = [
	//	direction				ambient				skydome color
		[1.00, 1.00, 1.00,		1.00, 1.00, 1.00,	1.00, 1.00, 1.00 ],	//昼
		[1.00, 0.93, 0.87,		1.0 , 0.37, 0.0,	1.00, 0.5 , 0	],	//夕方
		[0.50, 0.50, 0.90,		0.3, 0.3, 0.75,	0.00, 0.00, 0.2  ],	//夜
	];
	var day_vol = [0,0,0];

	//夜
	if(day_time < 5) {
		day_vol[2] = 1;
	}
	else if(day_time < 6) {	//夜→日中
		day_vol[2] = (6-day_time)/2;
		day_vol[0] = 1 - day_vol[2];
	}
	else if(day_time < 17) {	//日中
		day_vol[0] = 1;
	}
	else if(day_time < 18) {	//日中→夕暮れ
		day_vol[1] = (day_time-17);
		day_vol[0] = 1 - day_vol[1];
	}
	else if(day_time < 19) {	//日中→夕暮れ
		day_vol[1] = 1;
	}
	else if(day_time < 19.5) {	//夕暮れ→夜
		day_vol[2] = (day_time-19)*2;
		day_vol[1] = 1 - day_vol[2];
	}
	else {	//夜
		day_vol[2] = 1;
	}
	var col = new Array(9);
	for(var i=0;i<9;i++) {
		col[i] = 0;
		for(var j=0;j<3;j++) {
			col[i] += light_tbl[j][i] * day_vol[j];
		}
		if(col[i] > 1.0) col[i] = 1.0;
	}
	
	var night = 0;
	if(day_vol[2] > 0.9) {	//夜とそれ以外
		night = 1;
		obj_mesh[OBJ_SKYDOME].material[0].map.offset.set(0,0.5);			//お空のUV
		col[6] = col[7] = col[8] = 1.0;
	}
	else {
		obj_mesh[OBJ_SKYDOME].material[0].map.offset.set(0,0);				//お空のUV
	}
	
	directionalLight.color = new THREE.Color(col[0],col[1],col[2]);
	ambientLight.color = new THREE.Color(col[3],col[4],col[5]);

	obj_mesh[OBJ_SKYDOME].material[0].color = new THREE.Color(col[6],col[7],col[8]);	//お空の色
	{	//night
		obj_mesh[OBJ_SKYDOME].morphTargetInfluences[0] = day_vol[2];
		obj_mesh[OBJ_SKYDOME].morphTargetInfluences[1] = night;
		obj_mesh[OBJ_SKYDOME].morphTargetInfluences[2] = day_vol[2];
		obj_mesh[OBJ_SKYDOME].morphTargetInfluences[4] = day_vol[2];
		obj_mesh[OBJ_SKYDOME].morphTargetInfluences[5] = day_vol[2];
	}

	//太陽の位置更新
	{
		var r = (day_time+(-6)) / 13;
//		while(r >= 1.0) r -= 1.0;
		r += 0.05;
		
		if(day_time >= 19.5 || day_time < 6) {
			r = 0.66;
			if(!is_night) {
				directionalLight.remove( lensflare );
			}
			is_night = true;
		}else {
			if(is_night) {
				directionalLight.add( lensflare );
			}
			is_night = false;
		}
		
		var mat0 = new THREE.Matrix4();
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(-0.2*Math.PI));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(r*-(Math.PI*0.91)));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,0,4000));
		sun_position.setFromMatrixPosition(mat0);
		directionalLight.position.copy(sun_position);

		//ライトの位置が急に変わるので影が不自然にならないよう移動する前後にフェードで消す
		if(day_time >= 19.4 && day_time <= 19.6) {	//不自然な影を消す（夕暮れ）
			directionalLight.intensity = 0.4 * (Math.cos((day_time-19.4)/0.2 * Math.PI*2)/2+0.5);
		}
		if(day_time >= 5 && day_time < 6) {	//不自然な影を消す（朝1）
			directionalLight.intensity = 0.4 * (Math.cos((day_time-5)*0.5 * Math.PI*2)/2+0.5);
		}
		else if(day_time >= 6 && day_time <= 6.2) {	//不自然な影を消す（朝2）
			directionalLight.intensity = 0.4 * (Math.cos((day_time-6+1)*0.5 * Math.PI*2)/2+0.5);
		}
	}
//	day_time += adj_x/3;
//	adj_x = 0;
}

//const effect_count = 10;

function EffectInit() {
/*	for(var i=0;i<effect_count;i++) {
//		var material = new THREE.PointsMaterial( { size: 1.0, map: tex_list[TEX_FLARE0], transparent: true, opacity:0.99, blending: THREE.AdditiveBlending } );
		var material = new THREE.PointsMaterial( { size: 1.0 } );
		var geometry = new THREE.BufferGeometry();
		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [0,0,0], 3 ) );
		effect[i] = {
			name : "",
			obj : new THREE.Points( geometry, material ),
			count : 0,
			visible : false,
		};
		world_view.add(effect[i].obj);
	}
*/
}

function EffectCreate(_name, pos, offset_y) {
	const effect_material_param = [
	/*
		{	//template
			name : '',
			color : 0xffffff,
			size : 1.0,
			map : null,
		},
	*/
		{
			name : 'flash',
			color : 0xffffff,
			map: tex_list[TEX_FLARE0],
			transparent: true,
			blending: THREE.AdditiveBlending,
			userData : {
				size : game_scale,
			}
		},
		{
			name : 'attack',
			color : 0xffffff,
			map: tex_list[TEX_TEXTFONT1],
			transparent: true,
			userData : {
				size : game_scale*0.6,
				option : { offset: [0, 4*0.2], repeat: [1,0.2], scale:[4,1]  },
			}
		},
		{
			name : 'block',
			color : 0xffffff,
			map: tex_list[TEX_TEXTFONT1],
			transparent: true,
			userData : {
				size : game_scale*0.6,
				option : { offset: [0, 3*0.2], repeat: [1,0.2], scale:[4,1]  },
			}
		},
		{
			name : 'smash',
			color : 0xffffff,
			map: tex_list[TEX_TEXTFONT2],
			transparent: true,
			userData : {
				size : game_scale*0.5,
				option : { offset: [0, 2*0.2], repeat: [1,0.2], scale:[4,1]  },
			}
		},
		{
			name : 'perfect',
			color : 0xffffff,
			map: tex_list[TEX_TEXTFONT2],
			transparent: true,
			userData : {
				size : game_scale*0.3,
				option : { offset: [0, 1*0.2], repeat: [1,0.2], scale:[4,1]  },
			}
		},
		{
			name : 'miss',
			color : 0xffffff,
			map: tex_list[TEX_TEXTFONT2],
			transparent: true,
			userData : {
				size : game_scale*0.3,
				option : { offset: [0, 0*0.2], repeat: [1,0.2], scale:[4,1]  },
			}
		},
		/*{
			name : 'balleffect',
			color : 0xffffff,
			size : game_scale*2,
			map: tex_list[TEX_BALLEFFECT],
			transparent: true,
			opacity:0.5,
		},*/
	];

	for(var i=0;i<effect.length;i++) {
		if(effect[i] == null) {
			var param = null;
			for(var j=0;j<effect_material_param.length;j++) {
				if(effect_material_param[j].name == _name) {
					param = effect_material_param[j];
					break;
				}
			}
			if(param == null) break;;
			var _obj = new THREE.Sprite( new THREE.SpriteMaterial( param ) );
			_obj.scale.set(param.userData.size, param.userData.size,1);
			if(param.userData.option !== undefined) {
				var s = param.userData.option;
				var tex = _obj.material.map;
				tex.offset.set(s.offset[0], s.offset[1]);
				tex.repeat.set(s.repeat[0], s.repeat[1]);
				tex.wrapT = THREE.ClampToEdgeWrapping;
				_obj.scale.set(param.userData.size*s.scale[0], param.userData.size*s.scale[1],1);
			}

			_obj.position.copy(pos);
			if(offset_y !== undefined) _obj.position.y += offset_y;
			_obj.visible = false;

			effect[i] = {
				name : _name,
				obj : _obj,
				count : 0,
			};
			world_view.add(_obj);
			break;
		}
	}
}
function EffectUpdate() {
	for(var i=0;i<effect.length;i++) {
		if(effect[i] == null) continue;
		effect[i].obj.visible = true;

		switch(effect[i].name) {
		case 'flash':
			if(effect[i].count < 10) {
				var alpha = effect[i].count / 10 * 2;
				if(alpha > 1.0) alpha = 2.0 - alpha;
				effect[i].obj.material.opacity = alpha;
			}
			else {
				EffectErase(effect[i].name);
			}
			break;
		case 'attack':
			var a = Math.sin((effect[i].count%30/15)*Math.PI/2);
			effect[i].obj.material.color = new THREE.Color(1,a,a);
			break;
		case 'block':
			var a = Math.sin((effect[i].count%30/15)*Math.PI/2);
			effect[i].obj.material.color = new THREE.Color(a,0.75+a*0.25,a);
			break;
		case 'perfect':
			var a = Math.sin((effect[i].count%20/10)*Math.PI/2);
			effect[i].obj.material.color = new THREE.Color(1,1,a);
			effect[i].obj.material.opacity = effect[i].count / 30;
			effect[i].obj.position.y += 0.05;
			if(effect[i].count > 30) {
				EffectErase(effect[i].name);
			}
			break;
		case 'smash':
			var a = Math.sin((effect[i].count%10/5)*Math.PI/2);
			effect[i].obj.material.color = new THREE.Color(1,a,1);
			effect[i].obj.material.opacity = effect[i].count / 40;
			if(effect[i].count % 2 == 0) {
				effect[i].obj.position.copy(ball_target);
				effect[i].obj.position.x += (Math.random()-0.5)*1;
				effect[i].obj.position.y += (Math.random()-0.5)*1;
				effect[i].obj.position.z += (Math.random()-0.5)*1;
			}
			if(effect[i].count > 40) {
				EffectErase(effect[i].name);
			}
			break;
		case 'miss':
			var a = Math.sin((effect[i].count%20/10)*Math.PI/2);
			a = a*0.5+0.5;
			effect[i].obj.material.color = new THREE.Color(a,a,a);
			effect[i].obj.material.opacity = effect[i].count / 30;
			effect[i].obj.position.y += 0.05;
			if(effect[i].count > 30) {
				EffectErase(effect[i].name);
			}
			break;
		/*case 'balleffect':
			if(ball_flying) {
				effect[i].obj.position.copy(ball.position);
				effect[i].obj.material.rotation = Math.random()*Math.PI*2;
			}
			else {
//				EffectErase(effect[i].name);
			}
			break;*/
		}
		if(effect[i]) {
			effect[i].count++;
		}
		
	}
}
function EffectErase(name) {
	for(var i=0;i<effect.length;i++) {
		if (effect[i] != null && effect[i].name == name) {
			world_view.remove(effect[i].obj);
			effect[i].obj = null;
			effect[i] = null;
		}
	}
}
function clearOutline(material) {
	material.userData.outlineParameters = {	//outline_rendererのアウトラインを消す
		thickness: 0,
		color: [ 0, 0, 0 ],
		alpha: 0,
		visible: false,
		keepAlive: true
	};
}

//蝶・ほたる
function InsectUpdate() {
	if(butterfly_meshs == undefined) return;
	var i;
	//蝶
	if(day_time >= 6 && day_time < 19) {
		var alpha = 1;
		if(day_time <= 6.1) {
			alpha = (day_time-6.0)/0.1;
		}
		else if(day_time >= 19.5-0.1) {
			alpha = (19.5-day_time)/0.1;
		}
		for(i=0;i<butterfly_meshs.length;i++) {
			var rot = Math.sin(count/3+i)*Math.PI*0.4;
			findBone(butterfly_meshs[i],"右羽上").rotation.y =
			findBone(butterfly_meshs[i],"右羽下").rotation.y = rot;
			findBone(butterfly_meshs[i],"左羽上").rotation.y =
			findBone(butterfly_meshs[i],"左羽下").rotation.y = -rot;
			findBone(butterfly_meshs[i],"すべての親").rotation.x = 1*Math.PI/2/2;
			if((count+i)%15==0) butterfly_meshs[i].rotation.y += (Math.random()-0.5)*0.5;
			butterfly_meshs[i].position.x += Math.sin(butterfly_meshs[i].rotation.y) * 0.15;
			butterfly_meshs[i].position.z += Math.cos(butterfly_meshs[i].rotation.y) * 0.15;
			if (butterfly_meshs[i].position.x < -wall_w) {
				butterfly_meshs[i].position.x = -wall_w;
				butterfly_meshs[i].rotation.y += Math.PI;
			}
			if (butterfly_meshs[i].position.x >  wall_w) {
				butterfly_meshs[i].position.x =  wall_w;
				butterfly_meshs[i].rotation.y += Math.PI;
			}
			if (butterfly_meshs[i].position.z < -wall_h) {
				butterfly_meshs[i].position.z = -wall_h;
				butterfly_meshs[i].rotation.y += Math.PI;
			}
			if (butterfly_meshs[i].position.z >  wall_h) {
				butterfly_meshs[i].position.z =  wall_h;
				butterfly_meshs[i].rotation.y += Math.PI;
			}
			butterfly_meshs[i].material[0].opacity = alpha;
			butterfly_meshs[i].material[1].opacity = alpha;
			butterfly_meshs[i].visible = true;
		}
	}
	else {
		for(i=0;i<butterfly_meshs.length;i++) {
			butterfly_meshs[i].visible = false;
		}
	}
	
	//ほたる
	if(day_time < 6 || day_time >= 19) {
		var alpha = 1;
		if(day_time >= 6-0.1 && day_time <= 6) {
			alpha = (6.0-day_time)/0.1;
		}
		else if(day_time >= 19 && day_time <= 19+0.1) {
			alpha = (day_time-19)/0.1;
		}
		for(i=0;i<firefly_meshs.length;i++) {
			firefly_meshs[i].material.opacity = Math.sin((count+i*1.5)/24*Math.PI/2)*0.3+0.3;
			if((count+i)%30==0) firefly_meshs[i].rotation.y += (Math.random()-0.5)*1.0;
			firefly_meshs[i].position.x += Math.sin(firefly_meshs[i].rotation.y) * 0.2;
			firefly_meshs[i].position.z += Math.cos(firefly_meshs[i].rotation.y) * 0.2;
			firefly_meshs[i].position.y = 15 + (Math.sin((count+i*(24))/300*Math.PI/2)*20);
			if (firefly_meshs[i].position.x < -wall_w) {
				firefly_meshs[i].position.x = -wall_w;
				firefly_meshs[i].rotation.y += Math.PI;
			}
			if (firefly_meshs[i].position.x >  wall_w) {
				firefly_meshs[i].position.x =  wall_w;
				firefly_meshs[i].rotation.y += Math.PI;
			}
			if (firefly_meshs[i].position.z < -wall_h) {
				firefly_meshs[i].position.z = -wall_h;
				firefly_meshs[i].rotation.y += Math.PI;
			}
			if (firefly_meshs[i].position.z >  wall_h) {
				firefly_meshs[i].position.z =  wall_h;
				firefly_meshs[i].rotation.y += Math.PI;
			}
			firefly_meshs[i].material.opacity *= alpha;
			firefly_meshs[i].visible = true;
		}
	}
	else {
		for(i=0;i<firefly_meshs.length;i++) {
			firefly_meshs[i].visible = false;
		}
	}
}

function TutorialMessage(msg, toggle) {
	const msg_spd = 4;
	var cnt = Math.floor(tutorial.msg_count/msg_spd);
	var inpt = 0;
	if(toggle == undefined) {	//点滅する▼を出す
		toggle = ms_msg_click;
		inpt = 1;
	}
	ms_msg_click = 0;
	if(toggle && tutorial.wait >= 45) {
		document.getElementById("message").innerHTML = "";
		tutorial.msg_count = 0;
		tutorial.wait = 0;
		if(inpt) SoundPlay(SOUND_BALL);
		return true;
	}
	if(cnt > msg.length) {
		tutorial.wait++;
		if(inpt /*&& tutorial.wait > 40*/) {
			if(tutorial.wait % 40 < 20) {
				document.getElementById("message").innerHTML = tutorial.org_msg + " &#x25BC;";
			}else {
				document.getElementById("message").innerHTML = tutorial.org_msg;
			}
		}
	}
	else {
		var str = msg.substr(0,cnt);
		str = str.replace(/\n/g,'<br>');
//				str = str.replace(/@/,'&#x25BC;');
		if(str.endsWith('。')) {
			if(++tutorial.wait < 45) {
				tutorial.msg_count--;
			}
		}
		else {
			tutorial.wait = 0;
		}
		tutorial.msg_count++;
		tutorial.org_msg = str;
		var w = document.getElementById("message");
		if(w) w.innerHTML = str;
	}
	return false;
}

const TUTORIAL_END = 99;
const TUTORIAL_START = 100;

function TutorialUpdate() {
	if(!tutorial.enable) return;

//	option.camera_mode = 0;
//	option.move_mode = 1;

	switch(tutorial.step) {
	case TUTORIAL_START:
		tutorial.step = 0;
		tutorial.count = 0;
		tutorial.wait = 0;
//		tutorial.pause = 1;
		tutorial.msg_count = 0;
		MessageWindowDisp(true);
		break;
	case 0:
		var s1 = document.getElementById( 'select1' );
		var s2 = document.getElementById( 'select2' );
		if(tutorial.wait > 0 && tutorial.count == 0) {
			tutorial.select = -1;
			tutorial.count = 1;
			s1.style.display = "";
			s2.style.display = "";
			s1.addEventListener( 'click', function(){tutorial.select = 0;} );
			s2.addEventListener( 'click', function(){tutorial.select = 1;} );
		}
		if(TutorialMessage("チュートリアルを始めますか？",false)) {
		}
		if(tutorial.select == 0) {	//はい
			s1.style.display = "none";
			s2.style.display = "none";
			tutorial.step+=1;
//			tutorial.pause = 0;
		}
		else if(tutorial.select == 1) {	//いいえ
			s1.style.display = "none";
			s2.style.display = "none";
			tutorial.step = TUTORIAL_END;
		}
		break;
	case 1:
		if(TutorialMessage("ノーマルモードの基本的な操作を説明します。\nこのゲームはマウス・タッチ操作だけで行える、CPUと１対１で行う新しい形式のビーチバレーです。")) {
			tutorial.step+=1;
			tutorial.count = 0;
		}
		break;
	case 2:
		//カメラ移動待ち
		if(tutorial.count > 0) tutorial.count++;
		if(TutorialMessage("PCではマウスの右クリック＋ドラッグ、スマートフォンでは２指タッチ＋上下左右でカメラを動かすことができます。\nまずは動かしてみてください。", (tutorial.count > 30))) {
			tutorial.step+=2;
			tutorial.count = 0;
			serve_player = 1 - game_player;
			game_mode = 0;
		}
		break;
	case 4:
		if(tutorial.count > 0) tutorial.count++;
		if(TutorialMessage("操作キャラの頭の上に▼が出ている間はマウスの右クリック、もしくは画面上タッチでコート内を移動することができます。\nまずは動かしてみてください。", (tutorial.count > 60))) {
			tutorial.step+=1;
			tutorial.count = 0;
		}
		break;
	case 5:
		if(TutorialMessage("移動モードには「フルオート」「ニュートラル」「マニュアル」があります。\n移動の方法を説明しましたが、慣れないないうちはフルオートでやってもいいでしょう。\n詳細については追って説明します。")) {
			tutorial.step+=1;
			tutorial.count = 0;
		}
		break;
	case 6:
		tutorial.pause = 1;
		anim_user[game_player].run_stop = 1;
		if(TutorialMessage("最初はサーブ権のある人がサーブを打ちます。\n相手がボールを打つのを待ちましょう。")) {
			tutorial.pause = 0;
			tutorial.step+=2;
			tutorial.count = 0;
		}
		break;
	case 8:
		if(tutorial.count > 0) {
			tutorial.count++;
			if(tutorial.count > 10) {
				anim_user[game_player].run_stop = 1;
				tutorial.pause = 1;
				if(TutorialMessage("ボールの落下地点にサークルが出現し、プレイヤーはオートで落下地点に向かいます。（移動モード：フルオート・ニュートラルのみ）\nサークルが青いうちは距離が離れているので打てません。")) {
					tutorial.step+=2;
					tutorial.count = 0;
					tutorial.pause = 0;
				}
			}
		}
		break;
	case 10:
		if(tutorial.count > 0) {
			tutorial.pause = 1;
			if(TutorialMessage("サークルが黄色→赤になりました。\n画面のどこでもいいので、赤になったタイミングでマウスの左クリック、\nもしくはスマートフォンの画面をタッチしてください。")) {
				tutorial.step+=2;
				tutorial.count = 0;
				tutorial.pause = 0;
			}
		}
		break;
	case 12:
		if(attack_hit == 0) {
			tutorial.pause = 1;
			if(TutorialMessage("黄色・赤の状態であれば目押しを外しても必ず当たります。\nサークルが小さいタイミングほど相手に不利なレシーブになり、\n離れた位置にボールが飛びます。")) {
				tutorial.step+=1;
				tutorial.count = 0;
			}
		}
		break;
	case 13:
		if(TutorialMessage("黄色で押してしまうか押しそこねるとミスとなり、相手に有利なボールになってしまいます。")) {
			tutorial.step+=1;
			tutorial.count = 0;
		}
		break;
	case 14:
		if(TutorialMessage("落下地点であるサークルから離れていると間に合わないことがあります。\n自由に動ける時にできるだけコートの中央へ移動させておくと、相手のアタックに対応しやすくなります。")) {
			tutorial.step+=2;
			tutorial.count = 0;
			tutorial.pause = 0;
		}
		break;
	case 16:
		if(tutorial.count > 0) {
			tutorial.pause = 1;
			if(TutorialMessage("時々、ネットのそばに虹色のサークルが出ることがあります。\n「チャンスボール」と呼び、こちらが強力なスパイクを打てるチャンスです。")) {
				tutorial.step+=2;
				tutorial.count = 0;
			}
		}
		break;
	case 18:
		if(TutorialMessage("チャンスボールでも操作は同じですが、赤のタイミングで成功させるとスパイクが発動し、ボールを必ず相手のコートに落とすことが可能です。\nミスすれば相手にブロックされ、跳ね返されます。")) {
			tutorial.step+=2;
			tutorial.count = 0;
			tutorial.pause = 0;
		}
		break;
	case 20:
		if(score[0]+score[1] > 0) {
//					tutorial.pause = 1;
			if(TutorialMessage("スパイクが決まり、こちらに得点が入りました。\n"+game_end_score+"点先取したほうが勝ちになります。")) {
				tutorial.step+=2;
				tutorial.count = 0;
				tutorial.pause = 0;
			}
		}
		break;
	case 22:
		if(TutorialMessage("点を入れたほうがサーブを行えます。\nサーブは通常と同じですが、押すまで進行しません。", ball_flying)) {
			tutorial.step+=1;
			tutorial.count = 0;
		}
		break;
	case 23:
		if(tutorial.count > 0) {
			tutorial.pause = 1;
			if(TutorialMessage("ミスをすると相手側にもチャンスボールを与えてしまうことがあります。\n相手もスパイクを打ってきますので、ブロックしてください。")) {
				tutorial.step+=1;
				tutorial.count = 0;
			}
		}
		break;
	case 24:
		if(TutorialMessage("便宜上サークルと呼びますが、チャンスボール（ブロック）時のサークルは四角で表示されます。\nこちらも距離があると間に合わないことがあるので、位置には注意してください。")) {
			tutorial.step+=1;
			tutorial.count = 0;
			tutorial.pause = 0;
		}
		break;
	case 25:
		if(tutorial.count > 0) {
			tutorial.count++;
			if(tutorial.count > 30) {
				tutorial.pause = 1;
				if(TutorialMessage("ブロックに成功しました。")) {
					tutorial.step+=1;
					tutorial.count = 0;
					tutorial.pause = 0;
					game_rally = 0;
				}
			}
		}
		break;
	case 26:
		if(game_rally > 4 || !ball_flying) {
			tutorial.pause = 1;
			if(TutorialMessage("ちなみに、サークル出現中の移動は疲労度が増えていきます。\n（それ以外の間は自然に回復していきます）\n次のボールで疲労が残っていると、しばらくの間移動速度が落ちます。")) {
				tutorial.step+=1;
				tutorial.count = 0;
			}
		}
		break;
	case 27:
		if(TutorialMessage("ブロック時、もしくはサークルが出ていない時の移動では疲労度は増えません。\n疲労状態はキャラの頭の上に表示されます。\n赤いほど疲労度が高く、回復すると徐々に緑に、０になると消えます。")) {
			tutorial.step+=1;
			tutorial.count = 0;
		}
		break;
	case 28:
		if(TutorialMessage("効果的なボールを打ち続けていると相手を余計に走らせることになるので、スパイクが出なくても疲労によるミスを誘うことができます。")) {
			tutorial.step+=2;
			tutorial.count = 0;
			tutorial.pause = 0;
		}
		break;
	case 30:
		if(game_mode == 0 || game_rally > 10) {
			tutorial.pause = 1;
//			document.getElementById( 'ui' ).style.display = "";
			if(TutorialMessage("画面右上にあるアイコンでポーズ、サウンドのON/OFF、オプションの設定ができます。\nカメラ・移動モードはオプションから変えられます。")) {
				tutorial.step++;
				tutorial.count = 0;
			}
		}
		break;
	case 31:
		if(TutorialMessage("移動モード\nフルオート：全部オートで移動してくれます。CPUと同じ動きをします。\nニュートラル：サークル出現時だけオートで向かってくれます。\nマニュアル：サークルへの移動も全部手動で行う必要がありますが、疲労度が増えにくくなります。")) {
			tutorial.step++;
		}
		break;
	case 32:
		if(TutorialMessage("カメラのタイプは\nニュートラル：チャンスボール時にアップにしてくれます。\nマニュアル：ユーザー操作で自由に動かせます。\n固定：コート中心の見下ろし型の視点になります。")) {
			tutorial.step+=1;
		}
		break;
	case 33:
		if(TutorialMessage("移動モード「マニュアル」は慣れてきた人向けの設定です。サークル出現時に動かしにくくなるのでカメラを固定にしておくのがおすすめです。")) {
			tutorial.step+=1;
		}
		break;
	case 34:
		if(TutorialMessage("チュートリアルは以上です。ゲームをお楽しみください。")) {
			tutorial.step = TUTORIAL_END;
		}
		break;
	case TUTORIAL_END:	//終了
		tutorial.step = -1;
		tutorial.count = 0;
		tutorial.pause = 0;
		tutorial.enable = false;
		game_rally = 0;
		resetGame(true);
		MessageWindowDisp(false);
//		document.getElementById( 'ui' ).style.display = "";
		DispGameUI(true);

		option.tutorial_flag = 1;	//次からはチュートリアルの確認をしない
		StorageSave();
		break;
	}
}

var adj_x=0;
var adj_y=0;
var adj_z=0;
var adj2_x=0;
var adj2_y=0;
var adj2_z=0;
var adj3_x=0;
var adj3_y=0;
var adj3_z=0;
var tickCount = 0;

var old_ball_position = new THREE.Vector3();

function my_update(delta) {

	var upd_count = 0;
	tickCount += delta;
	if(tickCount > 3.0) tickCount = 3.0;
	var i,j,k;


	while(tickCount >= 1.0/60.0)
	{
		if(upd_count == 0) {	//ループ１回だけ
			world_view.matrixWorld = new THREE.Matrix4();
			world_view.matrixAutoUpdate = true;

			if(debug != 3 && game_view == 0) HandUpdate();
			
			var time = Math.floor(tickCount / (1.0/60.0)) * (1.0/60.0);

			if(helper) {
				helper.update( time );
			}
			//サーフボード（Body→InstancedMeshへの反映）
			SurfUpdate();
		}
		//時間による太陽の変化
		DayUpdate();

		old_ball_position.copy(ball.position);
		if(!tutorial.pause) {
			physics.update( (1.0/60.0) * physics_speed );
		}
		upd_count++;

		//蝶・ほたる
		InsectUpdate();

		//ヒットエフェクトパーティクル
		HitEffectUpdate();

		//汎用エフェクト
		EffectUpdate();
		
		//砂埃
		SandUpdate();
		
		//ボールエフェクト
		ball_effect.visible = false;
		if(ball_flying) {
			var body = physics.getBody( ball );
			var v = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
//			if(v.length() > 20) {
			if(attack_on) {
				v.normalize();
				var matrix = (new THREE.Matrix4()).makeTranslation(ball.position.x, ball.position.y, ball.position.z);
				matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).lookAt(new THREE.Vector3(), v, new THREE.Vector3(0,1,0)));
				matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationX(-Math.PI/2));
				matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(count/-4));
				matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeTranslation(0,-25,0));
				ball_effect.matrix = matrix;
				ball_effect.matrixAutoUpdate = false;
				ball_effect.visible = true;
			}
		}


		if(ocean) {
			if(ocean.changed) {
				ocean.materialOcean.uniforms[ "u_size" ].value = ocean.size;
				ocean.materialOcean.uniforms[ "u_sunDirection" ].value.set( ocean.sunDirectionX, ocean.sunDirectionY, ocean.sunDirectionZ );
				ocean.materialOcean.uniforms[ "u_exposure" ].value = ocean.exposure;
				ocean.changed = true;

				ocean.materialOcean.uniforms[ "u_normalMap" ].value = ocean.normalMapFramebuffer.texture;
				ocean.materialOcean.uniforms[ "u_displacementMap" ].value = ocean.displacementMapFramebuffer.texture;
				//ocean.materialOcean.uniforms[ "u_projectionMatrix" ].value = camera.projectionMatrix;
				//ocean.materialOcean.uniforms[ "u_viewMatrix" ].value = camera.matrixWorldInverse;
				//ocean.materialOcean.uniforms[ "u_cameraPosition" ].value = camera.position;
				ocean.materialOcean.depthTest = true;
				
				ocean.materialOcean.transparent = true;
				ocean.materialOcean.blending = 1;
			}

			ocean.deltaTime = delta*1.5;
			ocean.render( ocean.deltaTime );
			ocean.overrideMaterial = ocean.materialOcean;
		}
		//疲労
		if(game_view == 1) {
			for(i=0;i<2;i++) {
				var m = guide_meshs[2+i];
				var dmg = life_damage[i]/150;
				if(dmg > 1.0) dmg = 1.0;
				if(life_damage[i] <= 0) {
					m.visible = false;
				}
				else {
					m.position.copy(chrs[i].position);
					m.position.z -= 5;
					m.position.y += 22;
					m.visible = true;
					if(damage_flag[i]) {
						m.material.color = new THREE.Color(0.5*dmg,1.0-dmg*0.5,0.5*dmg);
						m.material.map.offset.set(0.5,0);
					}
					else {
						m.material.color = new THREE.Color(dmg,1-dmg,0);
						m.material.map.offset.set(0,0);
					}
					m.material.map.repeat.set(0.5,1);
					m.material.map.wrapS = THREE.ClampToEdgeWrapping;
				}
			}
		}
		
		//スコア表示アニメーション
		if(score_anim > 0 && text_mesh != null) {
			score_anim++;
			var l = 1;
			text_mesh.rotation.y = 0;
			if(score_anim < 15) {
				l = score_anim/15;
			}
			else if(score_anim < 15+30) {
				text_mesh.rotation.y += ((score_anim-15)/30*2)*( Math.PI*2 );
			}
			else if(score_anim < 15+30+60) {
				if(score_plus[0] || score_plus[1]) {
					score[0] += score_plus[0];
					score[1] += score_plus[1];
					score_plus[0] = 0;
					score_plus[1] = 0;
					createScore();
					SoundPlay(SOUND_CHEER);
				}
			}
			else {
				l = 1-(score_anim-(15+30+60))/15;
				if(l <= 0) {
					score_anim = 0;

					if(score[1] >= game_end_score) {	//相手の勝ち
						anim_user[1].win = 1;
					}
					else if(score[0] >= game_end_score) {	//プレイヤーの勝ち
						if(isVR)
							anim_user[1].gohoubi = 1;
						else
							anim_user[0].win = 1;
					}
				}
			}
			if(game_view != 0)
				text_mesh.scale.set(1+l*2,1+l*2,1+l*2);
			else
				text_mesh.position.y = score_home.y - l*15;

			text_mesh.rotation.y += -Math.PI/2 * l;
			if(game_player == 1) text_mesh.rotation.y *= -1;
			text_mesh.position.z = score_home.z * (1-l) + Math.sin(-text_mesh.rotation.y)*(-(90)/8)*(text_mesh.scale.z);
			text_mesh.position.x =						Math.cos(-text_mesh.rotation.y)*(-(90)/8)*(text_mesh.scale.x);
		}

		if(debug && 1) {
			document.getElementById("debugOut").innerHTML = "";
			document.getElementById("debugOut").innerHTML = "adj1 "+adj_x+","+adj_y+","+adj_z+"<br>";
			document.getElementById("debugOut").innerHTML += "adj2 "+adj2_x+","+adj2_y+","+adj2_z+"<br>";
			document.getElementById("debugOut").innerHTML += "adj3 "+adj3_x+","+adj3_y+","+adj3_z+"<br>";
//			document.getElementById("debugOut").innerHTML += "attack_next "+attack_next+"<br>";
			
//			document.getElementById("debugOut").innerHTML += "damage "+Math.floor(life_damage[0],2)+"/"+Math.floor(life_damage[1],2)+"<br>";
			/*for(var i=0;i<2;i++) {
				document.getElementById("debugOut").innerHTML += "damage ";
				for(var j=0;j<Math.floor(life_damage[i]/5);j++) {
					document.getElementById("debugOut").innerHTML += ":";
				}
				document.getElementById("debugOut").innerHTML += "<br>";
			}*/
		}
		
		if(debug) {
			if(key_shift == false) {
			if(!old_q && key_q) adj_x += 1;
			if(!old_a && key_a) adj_x -= 1;
			if(!old_w && key_w) adj_y += 1;
			if(!old_s && key_s) adj_y -= 1;
			if(!old_e && key_e) adj_z += 1;
			if(!old_d && key_d) adj_z -= 1;

			if(!old_r && key_r) adj3_x += 1;
			if(!old_f && key_f) adj3_x -= 1;
			if(!old_t && key_t) adj3_y += 1;
			if(!old_g && key_g) adj3_y -= 1;
			if(!old_y && key_y) adj3_z += 1;
			if(!old_h && key_h) adj3_z -= 1;
			}
			else {
			if(!old_q && key_q) adj2_x += 1;
			if(!old_a && key_a) adj2_x -= 1;
			if(!old_w && key_w) adj2_y += 1;
			if(!old_s && key_s) adj2_y -= 1;
			if(!old_e && key_e) adj2_z += 1;
			if(!old_d && key_d) adj2_z -= 1;
			}

			if(!old_sp && key_sp) {
				debug_mode1 = !debug_mode1;
				if(debug_mode1) {
					camera_x = 0;
					camera_y = 70;
					camera_z = 150;
				}
				else {
					camera_x = camera_default_x ;
					camera_y = camera_default_y ;
					camera_z = camera_default_z ;
				}

			}
		}
		old_q = key_q;
		old_a = key_a;
		old_w = key_w;
		old_s = key_s;
		old_e = key_e;
		old_d = key_d;
		old_r = key_r;
		old_f = key_f;
		old_t = key_t;
		old_g = key_g;
		old_y = key_y;
		old_h = key_h;
		old_sp = key_sp;

		count = Math.floor(count+1);
		tickCount -= 1.0/60.0;

		/*var mh = helper.objects.get(chr_mesh);
		var mixer = mh.mixer;

		if ( mixer && 1 ) {	//prevからcurrentへモーフアニメ
			if(anim_prev != anim_current) {
				var action1 = mixer.clipAction( chr_anim[anim_prev] );
				var action2 = mixer.clipAction( chr_anim[anim_current] );
				action2.weight = (anim_count/10);
				action1.weight = 1-action2.weight;
				if(++anim_count > 10) {
					anim_prev = anim_current
					anim_count = 0;
				}
			}
	//		document.getElementById("debugOut").innerHTML += "action.time="+action.time+"<br>";
		}*/
		
		if(1) {
			//0-9まゆ
			chr_mesh.morphTargetInfluences[0] = 1;		//眉にこり
			//10-17目
	//		chr_mesh.morphTargetInfluences[16] = 0.2;
			//18-37口
			chr_mesh.morphTargetInfluences[19] = 1;		//ω
			//38頬
//			chr_mesh.morphTargetInfluences[38] = 0.0;	//
		}

//		player_mesh.morphTargetInfluences[1] = 1;
//		player_mesh.updateMorphTargets();

		/*if(test_mesh && 0) {
			test_mesh.quaternion.setFromEuler( new THREE.Euler(Math.PI*adj_x/10,Math.PI*adj_y/10,Math.PI*adj_z/10, "XYZ") );
			test_mesh.position.set(adj3_x, adj3_y, adj3_z*10);
		}*/
		
		//アタックサークルなどの処理
		if(game_view == 1) {
			var size = [0,0];
			const cnt = 32;

			var ground_y = getGround(0.1,0.1) + 15;
			if(attack_flag != 0) {
				/*if(attack_flag == 2 && ball_time_cur >= ball_time_max) {
					//ヒットエフェクト
					var cc = ball_time_cur-ball_time_max;
					if(attack_hit < 1.0) {
//						if (attack_effect.position.y <= -100)
//							attack_effect.position.y += 100;

						var s = Math.sin(cc/10*Math.PI);// * 100;
						attack_effect.material.opacity = s;
					}
					if(cc > 10) {
						attack_effect.position.y = -100;
						attack_flag = 0;
					}
				}*/
				if(attack_flag == 1){
					var dir = (game_player == 0) ? -1 : 1;
					if(ball_time_max > 0) {
						size[0] = (Math.sin((ball_time_cur/ball_time_max+1)*Math.PI/2))*30;
						size[1] = size[0]+3;
					}
					else {
						size[0] = 0;
						size[1] = 0.1;
					}
					var is_block = 0;
					var is_attack = 0;
					var attack_pos = ball_target.clone();
					if(attack_next == 1) {	//通常以外のボール
						if(touch_type == game_player){	//ブロック
							attack_pos.x = court_w*0.05*dir;
							is_block = 1;
						}
						else {	//アタック
							is_attack = 1;
						}
						attack_pos.y = getGround(attack_pos.x, attack_pos.z)+20;
					}
					if(getMoveMode() == 2) {
						//マニュアルモードは見た目のずれが生じるので
						attack_pos.y = getGround(attack_pos.x, attack_pos.z)+1;
					}
					attack_circle.position.copy(attack_pos);
					attack_circle.visible = true;
					var vec = attack_circle.geometry.attributes.position.array;
					var iv = 0;
					for(i=0;i<=cnt;i++) {
						for(j=0;j<2;j++) {
							var r = i/cnt;
							if(is_block){	//ブロック
								r = Math.floor(r*4)/4;	//ブロック時は四角くなる
							}
							r *= Math.PI*2
							vec[iv++] = Math.sin(r) * size[j];
							vec[iv++] = 0;
							vec[iv++] = Math.cos(r) * size[j];
						}
					}
					attack_circle.geometry.attributes.position.needsUpdate = true;
					attack_circle.geometry.computeBoundingSphere();

					if(touch_type != game_player || is_block) {
						var zz,xx;
						xx = attack_pos.x - chrs[game_player].position.x + dir*4;
						zz = attack_pos.z - chrs[game_player].position.z;
						var len = Math.sqrt(zz*zz + xx*xx);
						if(len < 8) {
							var div = [20, 15, 12];
							var aa = (ball_time_max - ball_time_cur - 1) / div[option.game_level];
							if(attack_next != 0) aa *= 2.2;
							if(aa < 0) aa = 0;
							if((ms_click && !tutorial.enable)
							|| (aa == 0  && (tutorial.step == 12 || tutorial.step == 20))
							|| (ms_click && (tutorial.step == 16 || tutorial.step == 22 || tutorial.step >= 26))) {
								attack_hit = aa;	//0に近いほど良い
								if(attack_hit >= 1.0) {
									attack_hit = 1.0;
								} else if(ball_flying) {
									EffectCreate("flash", ball_target);
									//SoundPlay(SOUND_HIT);
								}
								attack_flag = 0;
								EffectErase("attack");
								EffectErase("block");
//								console.log("click timing:"+(aa));
								ms_click = 0;
							}
							if(aa < 1)
								attack_circle.material.color = new THREE.Color(1,0,0);
							else {
								attack_circle.material.color = new THREE.Color(1,1,0);
							}
							if(aa < 1) {
								if((tutorial.step == 10) && tutorial.count == 0) {
									tutorial.count = 1;
								}
//								if((tutorial.step == 24) && tutorial.count == 0) {
//									tutorial.count = 1;
//								}
							}
							attack_circle.material.opacity = 1.0;
						}
						else {
							attack_circle.material.color = new THREE.Color(0,0,1);
							attack_circle.material.opacity = 0.5;
						}
						//アタック時は光る
						if(is_attack){
							if((tutorial.step == 16) && tutorial.count == 0) {
								tutorial.count = 1;
							}
							if(count%2 == 0) {
								attack_circle.material.color = new THREE.Color(Math.random(),Math.random(),Math.random());
							}
						}
						if((tutorial.step == 23) && tutorial.count == 0) {
							tutorial.count = 1;
						}
					}
					if(ball_time_cur >= ball_time_max || attack_flag != 1) {
	//					ball_time_cur = ball_time_max+1;
						attack_circle.visible = false;
						if(attack_flag == 1) {
							attack_flag = 0;
							EffectErase("attack");
						}
					}
				}
				if(!tutorial.pause) ball_time_cur++;
			}
		}
		
		if(debug == 3) {	//@test なにもしないテスト
			if(/*anim_user_gohoubi == 0 &&*/ 0) {
//				chr_mesh.position.x = -12;
//				chr_mesh.position.z = 0;
//				chr_mesh.position.y = getGround(chr_mesh.position.x,chr_mesh.position.z);
				chr_mesh.rotation.set(0,Math.PI/2*1.0,0);
				chr_mesh.updateMatrixWorld( true );
			}

			var obj = obj_mesh[OBJ_TAMAMI];
//			findBone(obj,"Root").rotation.set(adj_x,adj_y,adj_z);
//			findBone(obj,"J_Bip_L_Shoulder").rotation.set(adj2_x,adj2_y,adj2_z);
			
			obj.position.x = 20;
			obj.position.y = getGround(obj.position.x, obj.position.z);
			count2++;
			if(1){
			var w = 1;
			var stp = count2 / 8;
			var r = (Math.sin(stp));
			var l = (Math.cos(stp));
			var r2 = (Math.sin(stp*2));
			var l2 = (Math.cos(stp*2));
			var body = findBone(obj,"Root");
//			body.position.y = (Math.abs(r) * 1) * w;
//			body.rotation.x = 0.1 * w;

			var body2 = findBone(obj,"J_Bip_C_Chest");	//上半身
			body2.rotation.x = (r2 * 0.05 + 0.05) * w;
			body2.rotation.y = r*0.1 * w;
			var body4 = findBone(obj,"J_Bip_C_UpperChest");	//上半身2
			body4.rotation.x = (r2 * 0.02) * w;
			var body3 = findBone(obj,"J_Bip_C_Hips");	//下半身
			body3.rotation.x = -(r2 * 0.05 - 0.05) * w;
			body3.rotation.y = r*-0.1 * w;
			
			var foot1 = findBone(obj,"J_Bip_L_UpperLeg");
			var foot2 = findBone(obj,"J_Bip_R_UpperLeg");
			foot1.rotation.x = (r*-0.5) * w;
			foot2.rotation.x = (r* 0.5) * w;

//			obj.updateMatrixWorld( true );
//			helper.objects.get( obj ).ikSolver.update();

			var neck = findBone(obj,"J_Bip_C_Neck");
			neck.rotation.x = -r2*0.15 * w;

			var knee1 = findBone(obj,"J_Bip_L_LowerLeg");
			var knee2 = findBone(obj,"J_Bip_R_LowerLeg");
			knee1.rotation.x = -((Math.cos(stp+Math.PI)/2+0.5)*Math.PI/2)*w;
			knee2.rotation.x = -((Math.cos(stp)/2+0.5)*Math.PI/2)*w;

			//腕ふり、ボール持ちや特殊モーションは無効
//			if(anim_user[id].pickup == 0 && (anim_user[id].win == 0 || anim_user[id].winflg != 2) && anim_user[id].joy == 0) {
				var sho1 = findBone(obj,"J_Bip_L_UpperArm");
				var sho2 = findBone(obj,"J_Bip_R_UpperArm");
//				sho2.rotation.x = ( r*0.66) * w;
				sho1.rotation.z =  Math.PI/2*0.8;
				sho2.rotation.z = -Math.PI/2*0.8;
				var elb1 = findBone(obj,"J_Bip_L_LowerArm");
				var elb2 = findBone(obj,"J_Bip_R_LowerArm");
//				elb2.rotation.x = (-Math.PI/2+r*0.1)*0.4 * w;
//				elb2.rotation.y = (-Math.PI/2+r*0.1)*0.4 * w;
				//if(anim_user[id].attack == 0) {
//				sho1.rotation.x = (-r*0.66) * w;
//				elb1.rotation.x = (-Math.PI/2+r*0.1)*0.4 * w;
//				elb1.rotation.y = ( Math.PI/2+r*0.1)*0.4 * w;
				//}
//			}

		}
			
			
			continue;
		}
		

		//地面に着いているか
		if(!ball_flying) {
			//砂地を表現した(?)特殊摩擦
			//地面に着いていればx,zのvelocityを消す
			//傾いていようが最終的には止まるようにする
			//すぐ止まれば不自然、なかなか止まらないと遠くにいってしまう
			if((++ball_ground_count)%3 == 0) {
//				var c = ball_ground_count/8;
				var a = 0.9;//(c<=60)?(60-c)/60:0;
//				var v = physics.getBody(ball).velocity;
//				v.x *= a;
//				v.z *= a;

				//回転も止める
				var av = physics.getBody(ball).angularVelocity;
				av.x *= a;
				av.y *= a;
				av.z *= a;
			}
		}
		else {
			ball_ground_count = 0;
		}
		if(game_view == 0) {	//一人称モード
			//自陣内で
			if(ball.position.x > -court_w
			&& ball.position.x < 0
			&& ball.position.z > -court_h
			&& ball.position.z <  court_h) {
				//上向き
				if(physics.getBody(ball).velocity.y > 0) {
					ball_turn_count++;
					//打ち返して3fあたりで着弾予測
					//setBallTargetと違い初回だけだが打ち出しの瞬間から予測可
					if(ball_turn_count == 3) {
						PredictionBall(1);
					}
				}
				else {
					ball_turn_count = 0;
				}
			}
			else {
				ball_turn_count = 0;
			}
		}

		//ネットに当たった
		if(net_atari > 0 && game_view == 0) {
			var mat = court_net[0].material;
			if(++net_atari < 240) {
				var alpha = (Math.cos(net_atari/15)+1.0)/2 * (1-net_atari/240);
				mat.opacity = 0.0 + alpha*0.7;
			}
			else {
//				mat.opacity = 0.1;
				net_atari = 0;
				court_net[0].visible = false;
			}
		}
//		document.getElementById("debugOut").innerHTML += "ball="+ball.position.x+",<br>"+ball.position.y+",<br>"+ball.position.z+"<br>";


		if(org_light_mode != 2) {
			if(isOcean) {
//				obj_mesh[OBJ_STAGE].material[12].visible = false;
				obj_mesh[OBJ_STAGE].material[14].visible = false;
				obj_mesh[OBJ_STAGE].material[15].visible = false;
			}
			else {
				var spd = 1-((count%3000)/3000);	//波アニメの表現
				for(i=0;i<2;i++) {	//wave1-3
		//			obj_mesh[OBJ_STAGE].material[19+i].map.offset.set(0,spd);			//mmd_batokin_island
					obj_mesh[OBJ_STAGE].material[14+i].map.offset.set(0,spd);	
				}
			}
		}
		//チュートリアル
		TutorialUpdate();


		if(!(tutorial.enable && tutorial.pause)) {		//チュートリアル一時停止
			count2++;
			//ゲーム判定
			JudgeCheck();

			//CPU/プレイヤー処理
			PlayerUpdate(serve_player);
			PlayerUpdate(1-serve_player);
		}

	}	//update loop
	ms_click = 0;
	
	//マトリクスに依存する処理
	if(upd_count > 0) {
		if(tutorial.pause) upd_count = 0;

		MotionUpdate(upd_count);

		var eye,target;
		if(game_view != 0) {
			//距離に応じて適切な回転とズームの指定
			function camZoomRot() {
				var xx = chrs[game_player].position.x - ball_target.x;
				var zz = chrs[game_player].position.z - ball_target.z;
				var l = Math.sqrt(xx*xx+zz*zz) / 60;
				if(l > 1.0) l = 1.0;
				next_camera.zoom = (l*0.4)+1;
				next_camera.rotation = new THREE.Vector3((5-l*4)/-10*Math.PI/2,Math.PI/2,0);
				/*	zoom	r		距離
					0		5		0
					2		3		30
					4		1		60
					*/
			}

			//カメラ動き指定
			var cam_stop = (tutorial.enable && tutorial.step < 25);
			if(tutorial.step == 8 || tutorial.step == 16) cam_stop = 0;
			var dir = (game_player == 0 ? 1 : -1);
			var default_position;
			var default_zoom = ms_wheel;
			var default_rot_x = cam_rot_x + cam_default_rot_x;
			var default_rot_y = cam_rot_y + cam_default_rot_y * dir;

			next_camera.rate = 1;
			next_camera.position = null;
			next_camera.rotation = null;
			next_camera.zoom = -1;
			var cm = getCameraMode();
			switch(cm) {
			case 0:
			case 1:
			case 4:
				{
//					default_position = chrs[game_player].position;
					var jump_h = findBone(chrs[game_player],"センター").position.y;
					if(cm != 4)
						default_position = chrs[game_player].position.clone();
					else
						default_position = new THREE.Vector3(court_w/2*-dir,court_center.y,0);
					if(jump_h < 10) jump_h = 10;
					default_position.y += jump_h*1.5;
				}
				break;
			case 2:	//固定
				default_position = court_center;
				default_zoom = ms_wheel*1.5;
				default_rot_x = cam_rot_x + cam_default_rot_x -0.0*Math.PI/2;
				default_rot_y = cam_rot_y+0;
				break;
				
			case 10:	//タイトル
				default_position = chrs[game_player].position.clone();
				default_position.y += player_h-1;
				if(chrs[game_player] == chr_mesh) {
					default_zoom = 1.5+-8/10;
					default_rot_x = -1/10 + cam_default_rot_x +(0.3)*Math.PI/2;
					default_rot_y = -0.5*Math.PI/4+16/10;
				}
				else {
					default_zoom = 1.5+-3/10;
					default_rot_x = 0/10 + cam_default_rot_x +(0.3)*Math.PI/2;
					default_rot_y = -0.5*Math.PI/4+-21/10;
				}
				if(load_seq != 10) {
					next_camera.rate = 1.0 / 0.06;
				}else{
					next_camera.rate = 3.0;
				}
				break;
			}
			if(!cam_stop && getCameraMode() == 0) {
				if(attack_on) {
					next_camera.position = ball.position.clone();
					next_camera.zoom = 1;
					next_camera.rate = 1.5;
					next_camera.rotation = new THREE.Vector3(-0.2*Math.PI/2,Math.PI/2,0);
				}
				else if(attack_next != 0) {
					if(ball_time_max> 0) {
						next_camera.position = ball_target.clone();
						next_camera.position.y += 10;
						next_camera.position.add(chrs[game_player].position);
						next_camera.position.multiplyScalar(0.5);
//						next_camera.zoom = 0.6;
						next_camera.rate = 1;
//						next_camera.rotation = new THREE.Vector3(-0.2/10*Math.PI/2,Math.PI/2,0);
						camZoomRot();
					}
				}
			}


			//カメラ補間で動かす(game_camera→next_camera)
			for(i=0;i<upd_count;i++) {
				var v1 = game_camera.position.clone();	//from
				var v2;	//to
				if(next_camera.position == null) {
					v2 = default_position.clone();
//					v2.y += 15;
				}
				else {
					v2 = next_camera.position.clone();
				}
				v2.sub(v1);
				v2.multiplyScalar(0.06*next_camera.rate);
				game_camera.position.add(v2);

				//カメラ角度デフォルト
				var rx = default_rot_x;
				var ry = default_rot_y;
				if(next_camera.rotation != null) {
					rx = next_camera.rotation.x;
					ry = next_camera.rotation.y;
				}
				rx = rx - game_camera.rotation.x;
				ry = ry - game_camera.rotation.y;
				if(ry >  Math.PI*1)
					ry -= Math.PI*2;
				if(ry < -Math.PI*1)
					ry += Math.PI*2;
				game_camera.rotation.x += rx * 0.06 * next_camera.rate;
				game_camera.rotation.y += ry * 0.06 * next_camera.rate;
				
				var z1 = (game_camera.zoom < 0) ? default_zoom : game_camera.zoom;
				var z2 = (next_camera.zoom < 0) ? default_zoom : next_camera.zoom;
				game_camera.zoom += (z2-z1)*0.06*next_camera.rate;
			}
			

			var target = game_camera.position;
			var rotation = game_camera.rotation;
			var mat1 = new THREE.Matrix4();
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeTranslation(target.x, target.y, target.z));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeRotationY(rotation.y));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeRotationX(rotation.x));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeTranslation(0,0, game_scale*4*game_camera.zoom));
			eye = (new THREE.Vector3()).setFromMatrixPosition(mat1);
		}
		else {
			//VRモード
			eye = new THREE.Vector3(camera_x, camera_y, camera_z);

			var mat1 = new THREE.Matrix4();
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeTranslation(eye.x, eye.y, eye.z));
//			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeRotationZ(cam_rot_z));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeRotationY(cam_rot_y + cam_default_rot_y*1));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeRotationX(cam_rot_x*1));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeTranslation(0, 0, -20));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeScale(game_scale,game_scale,game_scale));
			target = (new THREE.Vector3()).setFromMatrixPosition(mat1);
		}
		//VRモードではcameraを使わず、world_viewを変形させる
		if(isVR) {
			//観戦モード
			if(game_view != 0) {

				var mat0 = new THREE.Matrix4();
				mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(eye.x,eye.y,eye.z));
				mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).lookAt(eye, target, new THREE.Vector3(0,1,0)));
				mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeScale(game_scale,game_scale,game_scale));
				mat0 = (new THREE.Matrix4()).getInverse(mat0);
			
				world_view.matrix = mat0;
				world_view.matrixAutoUpdate = false;
			}
			/*else if(camMode == 1) {
				//デバッグ用
				setCameraMatrix(
					world_view,
					new THREE.Vector3(camera_x+5, camera_y, camera_z),
					new THREE.Vector3(camera_x+5, camera_y-0, camera_z-20),
					new THREE.Vector3(-0.28+cam_rot_x,0,0),
	//				new THREE.Vector3(cam_rot_x,cam_rot_y,cam_rot_z),
					game_scale);
			}*/
			else {
				//通常時
				setCameraMatrix(
					world_view,
					new THREE.Vector3(camera_x, camera_y, camera_z),
					new THREE.Vector3(camera_x, camera_y, camera_z-20),
					new THREE.Vector3(cam_rot_x,cam_rot_y,cam_rot_z),
					game_scale);
			}
		}
		else {
			camera.position.copy(eye);
			camera.lookAt(target);

//			world_view.matrix.makeScale(1.0/scale,1.0/scale,1.0/scale);
		}
	}
	
	
	//コート上のどこをクリックしたか
	courtClick();
	
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
		if(ms_button == 2) {	//右クリック
			cam_vec_x += ((ms_cur_x - ms_last_x) / window.innerWidth ) * -0.4;
			cam_vec_y += ((ms_cur_y - ms_last_y) / window.innerHeight) * -0.4;
			
			if(tutorial.step == 2) tutorial.count = 1;
		}
		cam_rot_y += cam_vec_x;
		cam_rot_x += cam_vec_y;

		//カメラ移動制限（下から見えないように）
		if(!debug || 1) {
			if(cam_rot_x + cam_default_rot_x > 0) {
				cam_rot_x = -cam_default_rot_x;
			}
			if(cam_rot_x + cam_default_rot_x < -Math.PI/2) {
				cam_rot_x =  - Math.PI/2 - cam_default_rot_x;
			}
		}
		
		if(cam_rot_y < -Math.PI*1) cam_rot_y += Math.PI*2;
		if(cam_rot_y >  Math.PI*1) cam_rot_y -= Math.PI*2;
		
		ms_last_x = ms_cur_x;
		ms_last_y = ms_cur_y;
	}
	return upd_count;

}	//my_update

function setCameraMatrix(matrix, eye, target, add_rot, scale) {
	var mat0 = new THREE.Matrix4();
	if(0){
		var near = 1;
		var far = 2000;
		var fov = 30+count;
		var top = near * Math.tan( (Math.PI/180.0) * 0.5 * fov ),
			height = 2 * top,
			width = (window.innerWidth / window.innerHeight) * height,
			left = - 0.5 * width;
		var right  = left + width;
		var bottom = top + height;
  		var mat1 = (new THREE.Matrix4()).makePerspective(left,right,bottom,top,near,far);
		mat0.multiplyMatrices(mat0,mat1);
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(eye.x, eye.y, eye.z));
		document.getElementById("debugOut").innerHTML += "top="+top+"<br>";
	}
	else if(1){
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(eye.x, eye.y, eye.z));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).lookAt(eye, target, new THREE.Vector3(0,1,0)));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(add_rot.z * (1-cameraLock)));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(add_rot.y * (1-cameraLock) + cam_default_rot_y));
		mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(add_rot.x * (1-cameraLock)));
		if(cameraLock > 0 && isVR) {
			var qt = (new THREE.Quaternion()).slerp( controller1.quaternion, cameraLock );
			var mat1 = (new THREE.Matrix4()).makeRotationFromQuaternion( qt );
			mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).getInverse(mat1));
		}
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeScale(scale,scale,scale));
	mat0 = (new THREE.Matrix4()).getInverse(mat0);
	}
	matrix.matrix = mat0;
	matrix.matrixAutoUpdate = false;
}

function PlayerUpdate(id) {
	var i,j;
	var body = physics.getBody( ball );
	var is_cpu = (id != game_player || game_view == 2);
	var is_serve = (id == serve_player);
	var free_move = !(is_serve && game_mode != MODE_RALLY);	//CPU:自動 プレイヤー:操作可
	var is_run = 0;
	var dir = (id==0) ? -1 : 1;
	
	//debug
	if(debug >= 3 && !is_cpu) {
		free_move = 1;
	}

	//フルオート
	else if(id == game_player && game_view == 1 && getMoveMode() == 0) {
		is_cpu = 2;
		guide_meshs[1].visible = false;
	}

	//落ちているボールをとりにいく
	if(game_mode == MODE_BEGIN && is_serve) {
		//喜びモーションが終わってから回収に向かう
		if(anim_user[id].joy == 0 && anim_user[id].regret == 0 /*&& anim_user[1-id].regret == 0*/) {
			if(game_view != 0) {
				//ボールがコート外にあったらワープして戻す
				if(game_count == 0) {
					var body = physics.getBody( ball );
					ball.position.x = body.position.x = court_w*0.2*dir;
					ball.position.z = body.position.z = 0;
					ball.position.y = body.position.y = getGround(ball.position.x, ball.position.z) + 25;
					body.velocity.x = body.velocity.y = body.velocity.z = 0;
				}
			}
			game_count++;

			var len = walkUpdateTarget(id, ball.position.x, ball.position.z, 1.0, 4);
			var rot_end = rotateUpdate(id, ball.position.x, ball.position.z);

			if(len < 4 && rot_end && game_count > 60) {
				//ボール取得
				ball_start.x = 0.75*court_w*dir;
				ball_start.z = 0;
				game_mode = MODE_PICKUP;
				game_count = 0;
				anim_user[id].pickup = 1;
				if(anim_user[id].run_stop == 0) {
//					anim_user[id].run_stop = 1;
				}
				body.velocity.x = body.velocity.y = body.velocity.z = 0;
			}
		}
	}
	//旋回と持ち上げ
	else if(game_mode == MODE_PICKUP && is_serve) {
		if(++game_count >= 60) {
			game_mode = MODE_INCOURT;
			game_count = 0;
		}
	}
	//一旦コート内へ移動
	else if(game_mode == MODE_INCOURT && is_serve) {
		var len = walkUpdateTarget(serve_player, ball_start.x, ball_start.z, 1.0);

		if(len < 9) {	//shoot-range
			//ボール取得
			if(rotateUpdate(id, chrs[1-id].position.x, chrs[1-id].position.z)) {
				var start = isPlayerLook();
				if(tutorial.enable) {
					//サーブ止め
//					if(tutorial.step <= 5 && tutorial.count == 0) tutorial.count = 1;
					if(tutorial.step <= 5 || tutorial.step == 20) {
						start = 0;
					}
				}
				if(start) {	//プレイヤーが相手を見るまで進行しない
					//サーブ
					game_mode = MODE_SERVE;
					game_count = 0;
					SoundPlay(SOUND_WHISTLE_BEGIN);
				}
//				if(anim_user[id].walk != 0) anim_user[id].walk_stop = 1;
			}
			else {
//				if(anim_user[id].walk == 0) anim_user[id].walk = 1;
			}
		}
		else {
			rotateUpdate(serve_player, ball_start.x, ball_start.z);
		}
	}
	//トス・サーブをあげる
	else if(game_mode == MODE_SERVE && is_serve) {
		if(++game_count == 1) {
			anim_user[serve_player].serve2 = 1;
			anim_user[serve_player].serve2_sw = 0;
			ball_start.y = getGround(ball.position.x, ball.position.z) + 19;	//頭の高さ
			body.velocity.x = 0;
			body.velocity.y = 0;
			body.velocity.z = 0;
		}
		else if(game_count < 30) {
			if(game_count == 25) {
				if(game_view == 1 && game_player == id) {
					ball_time_max = 90;
					ball_time_cur = 0;
					attack_hit = 1;
					attack_flag = 1;	//アタックカーソルを出す
					attack_next = 0;
					game_count++;
					ball_target.copy(chrs[id].position);
					ball_target.y += 13;
					EffectCreate("attack", ball_target, 13);
				}
				else {
					attack_flag = 0;
				}
			}
			else if(game_count > 25) {
				if(attack_flag == 0) {
					anim_user[serve_player].serve2_sw = 1;
					if(game_view == 1 && game_player == id) {
						ball_time_max = 0;
						if(attack_hit > 0.9) {
							EffectCreate("miss", ball_target, 10);
						}
						else {
							EffectCreate("perfect", ball_target, 10);
						}
					}
				}
				else {
					game_count--;
					if(ball_time_cur == ball_time_max) ball_time_cur = 0;
				}
			}
			//入力待ち
		}
		else if(game_count == 30) {
			body.velocity.x = 0;
			body.velocity.y = 20;
			body.velocity.z = (serve_player == 1) ? -1 : 1;	//左右
			ball_flying = 1;	//抵抗が入ってしまうので
		}
		else {
			if(body.velocity.y < 0) {
				if(ball.position.y < ball_start.y) {
					game_mode = MODE_RALLY;
					game_count = 0;
				}
			
			}
			if(game_count == (82+27)-(15)) {	//モーションはじめ
				anim_user[serve_player].serve2_sw = 2;
			}
			if (ball.position.y < ball_start.y && body.velocity.y > 0) {
				ball.position.y = ball_start.y;
				body.position.y = ball_start.y;
			}
		}
	}
	//ラリー状態
	//ボールが飛ぶ
	//返されたボールを追いかけ、打ち返す
	else if(game_mode == MODE_RALLY) {
		if(is_serve) {
			if(game_count == 0) {
				ball_start.copy(ball.position);
				if(game_view == 0) {
					shootToPlayer();
				}else {
					if(id == game_player && game_view == 1) {
					}
					else {
						attack_hit = 0.5;	//サーブのヒット値(CPU)
						if(tutorial.enable && tutorial.step < 16) attack_hit = 0.8;
					}
					shootToRandom(serve_player);
					attack_hit = 1.0;	//
				}
				anim_user[serve_player].run = 0;
			}
			game_count++;
		}

		{
//			if(game_view == 0 && id == 0) continue;
			var in_court = 0;
			if(ball_drop1.z <  court_h*1.02
			&& ball_drop1.z > -court_h*1.02
			&& ball_drop1.x*dir < court_w*1.02	//少し外側でも打ちに行く
			&& ball_drop1.x*dir > 0) {
				in_court = 1;
			}

			len = 100;
			if(game_count < 10 && touch_type == id) {
				//打った後の硬直
				free_move = 0;
			}
			else {
				var xx,zz;
				var len = -1;
				if(attack_next == 1) {	//チャンスボール
					xx = (5+court_w*0.05)*dir;
					zz = ball_target.z;
					
				}
				else if(body.velocity.x*dir > 0) {
					xx = ball_target.x+dir*5;
					zz = ball_target.z;
				}
				if(xx !== undefined) {
					var x2 = xx - chrs[id].position.x;
					var z2 = zz - chrs[id].position.z;
					len = Math.sqrt(x2*x2 + z2*z2);
					if(getMoveMode() == 2 && game_view == 1 && game_player == id && len > 25) {	//マニュアルモードで、落下地点に近いときだけオート
						//近くでなければマニュアル
						if(body.velocity.x*dir > 0) {
							if(ball_target.x*dir > 0) {	//落下地点は自陣側か
								if(len >= 2 && !damage_flag[id]) {
									is_run = 1;	//疲労
								}
							}
						}
					}
					else if(attack_next == 1) {	//チャンスボール
						//ブロック予定
						free_move = 0;	//自動追尾のため操作不可
						len = walkUpdateTarget(id, xx, zz, damage_flag[id] ? 0.55 : 1.0, 2);
						rotateUpdate(id, 0, ball_target.z);
					}
					//こっち向かってきたらボール追いかける もしくはブロック予定
					else if(body.velocity.x*dir > 0) {
						free_move = 0;	//自動追尾のため操作不可
						if(ball_target.x*dir > 0) {	//落下地点は自陣側か
							len = walkUpdateTarget(id, xx, zz, damage_flag[id] ? 0.55 : 1.0, 2);
							if(len >= 2 && !damage_flag[id]) {
								is_run = 1;
							}
						}
						rotateUpdate(id, ball_target.x, ball_target.z);
					}
				}
			}
			//モーション
			if(atk_mot_count[id] > 0) {
				if(--atk_mot_count[id] <= 0) {
					var zz = ball_target.z - chrs[id].position.z;
					var xx = ball_target.x - chrs[id].position.x;
					var len = Math.sqrt(zz*zz + xx*xx);
					if ( in_court && len < 65 && anim_user[id].attack == 0 && anim_user[id].receive == 0 ) {
						if(attack_next != 0)
							anim_user[id].attack = atk_mot_start[id];
						else
							anim_user[id].receive = atk_mot_start[id];
					}
				}
			}

			//落下地点はコート内か？
			if(in_court && ball.position.x*dir > 0 && !atari_disable) {
//				var zz = ball.position.z - chrs[id].position.z;
//				var xx = ball.position.x - chrs[id].position.x;
				var len;// = Math.sqrt(zz*zz + xx*xx);
				//当たる
				var height = 10;
				var range = 10;	//範囲
				if(attack_next != 0) {
					height += 17;	//28
					range += 1.5;
				}
				/*if(ball.position.y < chrs[id].position.y+15+height
				&&(ball.position.y > chrs[id].position.y+8 +height		//間に合った（低め）
				|| old_ball_position.y <= chrs[id].position.y+8+height))*/ {	//貫通した場合のチェック
					var yy;
					function getHandPos(id, height) {
						var mat0 = new THREE.Matrix4();
						mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(chrs[id].position.x, chrs[id].position.y, chrs[id].position.z));
						mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(chrs[id].rotation.y));
						mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,height,5));
						return (new THREE.Vector3()).setFromMatrixPosition(mat0);
					}
//					zz = ball_target.z - chrs[id].position.z;
//					xx = ball_target.x - chrs[id].position.x;
					var hand = getHandPos(id, height);
					if(debug) {
						if(id == 0)
							debug_obj1.position.copy(hand);
						else
							debug_obj2.position.copy(hand);
					}
					xx = ball.position.x - hand.x;
					yy = ball.position.y - hand.y;	//if(attack_next != 0) yy *= 0.75;	//範囲を少し広く
					zz = ball.position.z - hand.z;
					len = Math.sqrt(xx*xx + yy*yy + zz*zz);
					if(len >= range && len < 15) {
						var v1 = old_ball_position;	//prev
						var v2 = ball.position;		//now
						if(hand.y < v1.y && hand.y > v2.y) {	//貫通した場合
//							len2 = Math.sqrt(zz*zz + xx*xx);
							//補間する
							var m = (v1.y - v2.y);	//高さ
							var h = (hand.y - v2.y) / m;
							xx = (v1.x * h) + (v2.x * (1-h));
							zz = (v1.z * h) + (v2.z * (1-h));
							xx -= hand.x;
							zz -= hand.z;
							len = Math.sqrt(xx*xx + zz*zz);
						}
					}
					if(len < range	//shoot-range
					&&((anim_user[id].attack > 20+10 && anim_user[id].attack < 20+20+10+20)
					|| (anim_user[id].receive > 20))) {
						var shot = 1;
						if(game_view == 0) {
							game_count = 0;
							shot = 2;
						}
						else if(game_view == 1) {
							//ブロックを失敗させる
							if(attack_next == 2) {
//								console.log("shoot:"+id+" attack_next:"+attack_next+" hit:"+attack_hit);
								if(id == game_player) {
									if(tutorial.step == 25) {
										tutorial.count++;
										attack_hit = 0;
									}
									//自分がブロックを成功させるか
									if(attack_hit > 0.7) {
										shot = 0;
										EffectCreate("miss", ball_target);
										//console.log("ブロック失敗");
									}else {
										shot = 1;
										EffectCreate("perfect", ball_target);
										//console.log("ブロック成功");
										SoundStop(SOUND_SPIKE);
										SoundPlay(SOUND_BLOCK);
									}
								}
								else {
									//敵がブロックを成功させるか
									if(attack_hit > 0.7) {
										shot = 1;
										//console.log("アタック失敗");
										SoundStop(SOUND_SPIKE);
										SoundPlay(SOUND_BLOCK);
									}else {
										shot = 0;
										//console.log("アタック成功");
									}
								}
								attack_hit = 1;	//値が残るのでリセット
							}
							else if(attack_next == 1) {
								//チャンスボール
								if(id == game_player) {
									if(attack_hit > 0.7) {
										EffectCreate("miss", ball_target);	//ブロックされる模様
									}
									else {
										EffectCreate("smash", ball_target);	//アタック確定
									}
								}
								SoundPlay(SOUND_SPIKE);
							}
							else {
								if(id == game_player) {
									if(attack_hit > 0.9) {
										EffectCreate("miss", ball_target, 10);
									}
									else {
										EffectCreate("perfect", ball_target, 10);
									}
								}
							}
						}
						else {	//game_view == 2
							//観戦時はランダムで
							if(attack_next == 2) {
								if(Math.random()<0.5) shot = 0;
							}
						}

						if(shot == 1) {
							shootToRandom(id);
							game_count = 1;

							//相手の疲労状況を反映
							if(!tutorial.enable || tutorial.step >= 26) {
								damage_flag[1-id] = (life_damage[1-id] > 0);
							}
							game_rally++;
						}
						else if(shot == 0) {
							//次に打ち出すまで当たらない
							atari_disable = 1;
							touch_type = id;
							//console.log("touch_type="+touch_type);
//								body.velocity.y = Math.abs(body.velocity.y);	//跳ね返らないほうが見栄えはいい
						}
					}
				}
			}
		}
	}
	if(!is_cpu) {
		if(game_view == 1) {
			guide_meshs[1].visible = false;
		}
	}

	if(load_seq != -1) {
	}
	else if(anim_user[id].joy > 0) {
		rotateUpdate(id, chrs[1-id].position.x, chrs[1-id].position.z);
	}
	else if(anim_user[id].regret == 0 && free_move) {
		if(!is_cpu && anim_user[1-id].win == 0) {
			//指示した場所へ移動
			var len = 0;
			if(ms_court && ms_button == 0) {
				len = walkUpdateTarget(id, ms_court.x, ms_court.z, damage_flag[id] ? 0.55 : 1.0, 1);
//				len = walkUpdateTarget(id, ms_court.x, ms_court.z, damage_flag[id] ? 1.55 : 2.0, 1);
				if(tutorial.enable && tutorial.step == 4 && tutorial.count == 0) {
					tutorial.count++;
				}
			}
			else {
				//止まる
				if(anim_user[id].run > 0 && anim_user[id].run_stop == 0) {
					anim_user[id].run_stop = 1;
				}
				if(anim_user[id].walk > 0 && anim_user[id].walk_stop == 0) {
					anim_user[id].walk_stop = 1;
				}
			}
			if(len <= 1) {
				//相手を見る
				rotateUpdate(id, chrs[1-id].position.x, chrs[1-id].position.z);
			}
			else {
//				if(!damage_flag[id]) is_run = 1;
				//進行方向
				rotateUpdate(id, ms_court.x, ms_court.z);
			}
			//矢印
			if(game_view == 1) {
				guide_meshs[1].visible = true;
				guide_meshs[1].position.copy(chrs[id].position);
				guide_meshs[1].position.y += 35-Math.abs(count/8%8);
			}
		}
		//CPUはとりあえずコートの中心に移動する
		else {
			//コートの中心から外れていたら真ん中へ移動
			if(chrs[id].position.z <  court_h*0.1
			&& chrs[id].position.z > -court_h*0.1
			&& chrs[id].position.x*dir < court_w*0.6
			&& chrs[id].position.x*dir > court_w*0.4)
			{	//コート内に入ったら
				//相手を見る
	//			rotateUpdate(id, chrs[1-id].position.x, chrs[1-id].position.z);
				//ボールを見る
				var rot_end;
				if(anim_user[1-id].win > 0){
					rot_end = rotateUpdate(id, court_w*-dir, 0);
				}else {
					rot_end = rotateUpdate(id, ball.position.x,ball.position.z);
				}
				//止まる
				if(anim_user[id].run > 0 && anim_user[id].run_stop == 0) {
					anim_user[id].run_stop = 1;
				}
				if(anim_user[id].walk > 0 && anim_user[id].walk_stop == 0) {
					anim_user[id].walk_stop = 1;
				}
				//待機モーション
				if(rot_end && anim_user[id].stanby == 0 && game_mode != MODE_RALLY) {
					anim_user[id].stanby = 1;
				}
			}
			else {
				//移動
				if(walkUpdateTarget(id, court_w*0.5*dir, 0, 0.55) >= 20) {	//CPUはホームに戻るのが遅い
//				if(walkUpdateTarget(id, court_w*0.5*dir, 0, 1.0) >= 20) {
					rotateUpdate(id, court_w*0.5*dir, 0);
				}
			}
		}
	}
	//走ると体力消費
	if(is_run) {
		if(game_view == 1 && id == game_player && getMoveMode() == 2) {	//マニュアルは疲労しにくい
			life_damage[id] += 1.5;
		}
		else {
			life_damage[id] += 2.5;
		}
	}
	else {
		//疲労回復
		if(option.game_level == 0 && id == game_player && game_view == 1) {
			life_damage[id] -= 1.5;
		}else {
			life_damage[id] -= 1;
		}
		if (life_damage[id] < 0) {
			life_damage[id] = 0;
			damage_flag[id] = 0;
		}
	}

	{
		i = id;
		if(anim_user[i].receive > 0) {
			anim_user[i].receive++;
		}
		if(anim_user[i].serve2 > 0) {
			anim_user[i].pickup = 0;
			anim_user[i].serve2++;
		}
		if(anim_user[i].pickup > 0) {
			anim_user[i].pickup++;
		}

		if(anim_user[i].stanby > 0) {
			if(anim_user[i].run != 0 || anim_user[i].walk != 0 || anim_user[i].regret != 0) {
				//ラン開始による待機解除?
				anim_user[i].stanby--;
			}else {
				anim_user[i].stanby++;
			}
		}
		if(anim_user[i].walk > 0) {
			var w = 0;
			if(anim_user[i].walk_stop == 0) {
				anim_user[i].walk++;
			}
			else {
				anim_user[i].walk--;
			}
		}
		else {
			anim_user[i].walk_stop = 0;
		}
		if(anim_user[i].run > 0) {
			if(anim_user[i].run_stop == 0) {
				anim_user[i].run++;
			}
			else {
				anim_user[i].run--;
			}
		}
		else {
			anim_user[i].run_stop = 0;
		}
		if(anim_user[i].nade > 0) {
			anim_user[i].nade++;
		}
		if(anim_user[i].win > 0) {
			anim_user[i].win++;
		}
		if(anim_user[i].joy > 0) {
			anim_user[i].joy++;
		}
		if(anim_user[i].regret > 0) {
			anim_user[i].regret++;
		}
		if(anim_user[i].attack > 0) {
			anim_user[i].attack++;
		}

		//ホールド中は動きを止める
		if(is_ballhold(i))
		{
			var v = physics.getBody( ball ).velocity;
			v.x = v.y = v.z = 0;
		}
	}
}
//手付けモーション処理
function MotionUpdate(upd_count) {
	//プレイヤー
	if(game_view == 0){
		var l = 1;
		if(anim_user[1].nade > 0) {
			if(anim_user[1].nade < 10) l = 1 - anim_user[1].nade/10;
			else if(anim_user[1].nade < 300-10) l = 0;
			else l = (anim_user[1].nade-290)/10;
		}
		var arm1 = findBone(player_mesh,"右肩C");
		var arm2 = findBone(player_mesh,"左肩C");
		arm1.rotation.set((-1.4)*l, 0,(adj_z/50+1.2)*l);
		arm2.rotation.set((-1.4)*l, 0,(-adj_z/50-1.2)*l);
		var hiji1 = findBone(player_mesh,"右ひじ");
		var hiji2 = findBone(player_mesh,"左ひじ");
		hiji1.rotation.set(-0.04, 0.08,-0.02);
		hiji2.rotation.set(-0.04,-0.12, 0.02);
		var hand1 = findBone(player_mesh,"右手首");
		var hand2 = findBone(player_mesh,"左手首");
		hand1.rotation.set( 0.14, 0.08, 0.04);
		hand2.rotation.set( 0.14,-0.08,-0.04);
	}
	for(var id=0;id<2;id++) {
		if(game_view == 0 && id == 0) continue;
	
		var hand_par = 0.0;
		if(chrs[id] == player_mesh) {
//				findBone(chrs[id],"右肩").rotation.z += 0.5;
//				findBone(chrs[id],"左肩").rotation.z += 0.5;
		}else{
			findBone(chrs[id],"右肩").rotation.z -= 0.1;
			findBone(chrs[id],"左肩").rotation.z += 0.1;
		}

		//とりあえず動かさない
		findBone(chrs[id],"頭").rotation.set(0,0,0);
		findBone(chrs[id],"上半身").rotation.y = 0;
//		findBone(chrs[id],"上半身2").rotation.y = 0;
		findBone(chrs[id],"右目").rotation.set(0,0,0);
		findBone(chrs[id],"左目").rotation.set(0,0,0);
		
		//ボールのあるほうを向く
		if(((game_mode == MODE_PICKUP || game_mode == MODE_SERVE) && id == serve_player)	//持ち運び時
		|| anim_user[id].gohoubi != 0 || anim_user[1-id].win > 0 || anim_user[id].stanby != 0 ) {
			findBone(chrs[id],"首").rotation.set(0,0,0);
		}
		else //if(camMode == 0)
		{
			var target = ball.position;
			if(anim_user[id].win > 0) {	//プレイヤーのほう
				target = new THREE.Vector3(chrs[1-id].position.x, chrs[1-id].position.y+16, chrs[1-id].position.z);
			}
			var xx = (target.x- chrs[id].position.x);
			var yy = (target.y-(chrs[id].position.y+16));
			var zz = (target.z- chrs[id].position.z);
			var len = Math.sqrt(xx*xx + zz*zz);
			var rx = Math.atan2(yy,-len);
			var ry = Math.atan2(zz,xx);
			ry += chrs[id].rotation.y;
			ry = -ry+Math.PI/2;
			rx = rx+Math.PI;

			while(ry < -Math.PI) ry += Math.PI*2
			while(ry >  Math.PI) ry -= Math.PI*2
			while(rx >  Math.PI) rx -= Math.PI*2
			//首ふり限界
			if(ry >  Math.PI*0.33) ry =  Math.PI*0.33;
			if(ry < -Math.PI*0.33) ry = -Math.PI*0.33;
			if(rx >  Math.PI*0.1 ) rx =  Math.PI*0.1;
			if(rx < -Math.PI*0.1 ) rx = -Math.PI*0.1;

			findBone(chrs[id],"首").rotation.set(rx,ry,0);
		}
		
		


		
		//サーブ
		if(anim_user[id].serve2 > 0) {
			var a;	//上半身Zひねり
			var l = 1;
			var r = 1;	//左手（ボール持ち）
			var s = 0;	//サーブカウンタ
			var b = 0;	//上体ひねり
			var t = 0;	//左手トス
			var f = 0;	//開脚
			if(anim_user[id].serve2_sw == 0) {
				if(anim_user[id].serve2 >= 26) {
					anim_user[id].serve2 = 26;
				}
			}
			else if(anim_user[id].serve2_sw == 1) {
				if(anim_user[id].serve2 >= 39) {
					anim_user[id].serve2 = 39;
				}
			}
			var cat = 0;	//持ち状態 1→0
			if(anim_user[id].serve2 < 40) {
				//use r b
				b = 1;
				if(anim_user[id].serve2 < 20) {
					r = Math.sin(anim_user[id].serve2/20*Math.PI/2);
					cat = 1 - r;
					b = (anim_user[id].serve2 - 0)/20;
				}
				else if(anim_user[id].serve2 < 27) {
					//一時停止
					r = 1;
				}
				else if(anim_user[id].serve2 < 27+8) {
					r = 1;//+Math.sin((anim_user[id].serve2-27)/8*Math.PI/2)*1.2;
					t = (anim_user[id].serve2-27)/8;
				}
				else {	//35-39
//					r = Math.sin((1 - (anim_user[id].serve2 - (27+8))/5)*Math.PI/2)*1.4;
					r = 1;// - Math.sin((anim_user[id].serve2 - (27+8))/5*Math.PI/2)*2.2;
					t = 1;
				}
				//ボール持ち（移動）中
				morphBoneRotLR(id, "肩",cat, -0.25, 0,0);
				morphBoneRotLR(id, "ひじ",cat, -0.5+0.12, 0, 0.25-0.16);
				morphBoneRotLR(id, "手首",cat, 0.12, 0.16, 0.08);
				f = b;
				a = Math.sin(t*Math.PI/2);	//上半身Zひねり
				morphBoneRot(id, "左肩",r, -0.4,0,0);
			}
			else {
				t = 1;
				r = 1- (anim_user[id].serve2-40)/26;
				if(r < 0) r = 0;
				a = 1-(anim_user[id].serve2-40)/26*2;	//上半身Zひねり
				if(a < -1) a=-1;
				if(anim_user[id].serve2 < 40+75) {
					morphBoneRot(id, "左肩",r, -0.4,0,0);
				}
			}
			b *= 0.9;

			morphBoneRot(id, "左腕",r, 0,0.075,0, 1);
			morphBoneRot(id, "左ひじ",r, (-0.33)*t,(-0.13)*t,(-0.13)*t);
			morphBoneRot(id, "左手首",r, -0.4,0,0.25);

			if(anim_user[id].serve2 >= 40) {
				s = anim_user[id].serve2-40;
				f = 1.0;
				if(chrs[id] == chr_mesh) {	//表情
					var e = 1;
					if(s < 10) {
						e = s/10;
					} else if(s >= 75-10) {
						e = (75-s)/10;
					}
					chr_mesh.morphTargetInfluences[19] *= 1-e;		//ω
					chr_mesh.morphTargetInfluences[21] = e*0.8;		//口あけ
				}
				if(s >= 75) {
					anim_user[id].serve2 = 0;
					anim_user[id].serve2_sw = 0;
					anim_user[id].serve2 = 0;
//					s = 75;
					//@anim_user[id].stanby = 1;	//待機移行
				}
				
				var tbl = [
					[ 0.04*2,	-0.08*2,	-0.1 *2],
					[-0.02*2,	 0.22*2,	-0.18*2],
					[-0.18*2,	 0.06*2,	-0.14*2],
					[-0.02*2,	 0.22*2,	-0.18*2],
					[-0.12*2,	-0.08*2,	-0.06*2],
					[ 0.04*2,	 0.22*2,	 0.08*2],
				];

				var a1=1,a2=0,a3=0;
				b = 0.9 + -1.8*s/30;
				if(b < -0.9) b = -0.9;
				if(s < 20) {
					a1 = Math.sin((1-s/20)*Math.PI/2);
					a2 = 1-a1;
					a3 = 0;
				}
				else if(s < 30) {
					a3 = Math.sin((s-20)/10*Math.PI/2);
					a2 = 1-a3;
					a1 = 0;
				}
				else if(s < 35) {
					a1 = a2 = 0;
					a3 = 1;
				}
				else if(s <= 75) {
					a1 = a2 = 0;
					a3 = 1;
					l = Math.sin((75-s)/40*Math.PI/2);
//					r *= 1-l;
					b *= l;
//					f *= l;
					a *= l;
				}
				var x,y,z;
				x = tbl[0][0]*a1 + tbl[2][0]*a2 + tbl[4][0]*a3;
				y = tbl[0][1]*a1 + tbl[2][1]*a2 + tbl[4][1]*a3;
				z = tbl[0][2]*a1 + tbl[2][2]*a2 + tbl[4][2]*a3;
				morphBoneRot(id, "右肩",l, x,y,z);
				x = tbl[1][0]*a1 + tbl[3][0]*a2 + tbl[5][0]*a3;
				y = tbl[1][1]*a1 + tbl[3][1]*a2 + tbl[5][1]*a3;
				z = tbl[1][2]*a1 + tbl[3][2]*a2 + tbl[5][2]*a3;
				morphBoneRot(id, "右ひじ",l, x,y,z);
//				morphBoneRot(id, "右肩",1, adj_x*2,adj_y*2,adj_z*2);
//				morphBoneRot(id, "右ひじ",1, adj2_x*2,adj2_y*2,adj2_z*2);
				findBone(chrs[id],"左肩").rotation.z += (l)*1;
//				morphBoneRot(id, "左肩",l, -0.4,0,(1-r)*1);
			}
			else {
			}
			
			findBone(chrs[id],"上半身").rotation.z  += 0.07*a;
			findBone(chrs[id],"上半身2").rotation.z += 0.10*a;
			findBone(chrs[id],"上半身").rotation.y  += -b*0.8;
			findBone(chrs[id],"下半身").rotation.y  += -b/4;
			findBone(chrs[id],"左肩").rotation.z	+= b;
			findBone(chrs[id],"首").rotation.y += b;

			//開脚
			findBone(chrs[id],"センター").position.y += -f/3;
			findBone(chrs[id],"右足ＩＫ").position.x += -f*1;
			findBone(chrs[id],"左足ＩＫ").position.x +=  f*1;

			chrs[id].updateMatrixWorld( true );
			helper.objects.get( chrs[id] ).ikSolver.update();
		}
		//待機
		else if(anim_user[id].stanby > 0) {
			var f = 1;	//開脚
			var c = (anim_user[1-id].win > 0) ? 0 : Math.abs(Math.sin(count/11));
			if(anim_user[id].stanby > 15) anim_user[id].stanby = 15;
			var l = anim_user[id].stanby/15;

			//腕組み
			if(chrs[id] == player_mesh) {
				morphBoneRotLR(id, "肩",l, -0.4+0/20, 0/20, 1/20);
				morphBoneRot(id, "右ひじ",l, (0-2)/20, (0-1)/20, 0.6+(1-1)/20);
				morphBoneRot(id, "左ひじ",l, -0.8/20, 0/20, -0.6+0/20);
				morphBoneRot(id, "右手首",l, 10/20, 2/20, 1/20);
				morphBoneRot(id, "左手首",l, 5/20, -1/20, 0/20);
				f = 1.3;
			}
			else if(chrs[id] == chr_mesh) {
				morphBoneRotLR(id, "肩",l, c*0.1-0.1,0,-0.1-0.1*(1-c));
				morphBoneRotLR(id, "ひじ",l, -0.62*1.2, 0, 0.38*1.4);
				c *= l;
				findBone(chrs[id],"首").rotation.x += c*-0.2;

				findBone(chrs[id],"上半身").rotation.x  += c*0.1;
				findBone(chrs[id],"上半身2").rotation.x += c*0.05;
	//			findBone(chrs[id],"下半身").rotation.x  += c*0.1;
	//			findBone(chrs[id],"センター").rotation.x += c*-0.1;
			}

			//開脚
			findBone(chrs[id],"センター").position.y += -f/3;
			findBone(chrs[id],"右足ＩＫ").position.x += -f*1;
			findBone(chrs[id],"左足ＩＫ").position.x +=  f*1;

			chrs[id].updateMatrixWorld( true );
			helper.objects.get( chrs[id] ).ikSolver.update();
		}
//					anim_user[id].stanby = 1;	//待機移行
		//レシーブ
		if(anim_user[id].receive > 0) {
			var l = 1;
			var uderot = 0;
			var body_mov = 1;
			if(anim_user[id].receive < 10) {	//かまえ
				l = anim_user[id].receive/10;
				uderot = 0;
				body_mov = l/3.0;
			}
			else if(anim_user[id].receive < 10+20) {	//
				uderot = Math.sin((anim_user[id].receive-10)/20*Math.PI/2)*0.2;
				body_mov = anim_user[id].receive/30;
			}
			else if(anim_user[id].receive < 10+20+10) {
				uderot = 0.2-Math.sin((anim_user[id].receive-30)/10*Math.PI/2)*0.66;
			}
			else if(anim_user[id].receive < 10+20+10+20) {
				uderot = 0.2-0.66;
				l = 1-(anim_user[id].receive - (10+20+10))/20;
				body_mov = l*1.5-0.5;
			}
			else {
				anim_user[id].receive = 0;
				l = 0;
				body_mov = 0;
				//@anim_user[id].stanby = 1;
			}
			{
				var r = Math.sin(body_mov*Math.PI/2)*-0.75*l;
//				var bust = findBone(chrs[id],"上半身2");
//				bust.rotation.x += r/3;

				var waist = findBone(chrs[id],"下半身");
				waist.rotation.x += r/2;
				var body = findBone(chrs[id],"センター");
				body.rotation.x += -r;
				body.position.y += r/1;
				body.position.z += r*4;

				var knee1 = findBone(chrs[id],"右ひざ");
				var knee2 = findBone(chrs[id],"左ひざ");
				knee1.rotation.x += -r/1;
				knee2.rotation.x += -r/1;
				
				var leg1 = findBone(chrs[id],"右足");
				var leg2 = findBone(chrs[id],"左足");
				leg1.rotation.x += r;
				leg2.rotation.x += r;
				var foot1 = findBone(chrs[id],"右足ＩＫ");
				var foot2 = findBone(chrs[id],"左足ＩＫ");
				foot1.position.x += r*3;
				foot2.position.x += -r*3;

				chrs[id].updateMatrixWorld( true );
				//IK変形しなくても地面に対して足首曲げてくれたりする
				helper.objects.get( chrs[id] ).ikSolver.update();
			}
			//下半身	お腹
			//グルーブ	太もものあたり？	センター
			morphBoneRot(id, "上半身",l,(uderot+0.25)/5,0,0);
			morphBoneRotLR(id, "肩",l, -0.34+uderot,0,0);
			morphBoneRotLR(id, "ひじ",l, 0,0,0.14);
			if(chrs[id] == chr_mesh) {	//表情
				chr_mesh.morphTargetInfluences[19] *= 1-l;		//ω
				chr_mesh.morphTargetInfluences[21] = l*0.8;		//口あけ
			}
		}
		//ボール拾う
		if(anim_user[id].pickup > 0) {
			var body_mov = 0;
			var l = 0;
			var cat = 0;
			if(anim_user[id].pickup < 30) {	//ボールをとる
				body_mov = anim_user[id].pickup/30;
				l = body_mov;
			}
			else if(anim_user[id].pickup < 60) {	//持ち上げる
				body_mov = 1-(anim_user[id].pickup-30)/30;
				l = body_mov;
				cat = (anim_user[id].pickup-30)/30;
			}
			else {
				//ボール持ったまま静止
				body_mov = 0;
				l = 0;
				cat = 1;
				//この後サーブに繋げる
			}
			{
				var r = Math.sin(body_mov*Math.PI/2)*-1;

				var waist = findBone(chrs[id],"下半身");
				waist.rotation.x += r;
				var body = findBone(chrs[id],"センター");
				body.rotation.x += -r*2;
				body.position.y += r*-4;
				body.position.z += r*2;
				if(chrs[id] == player_mesh) {
					body.position.y += r*-5;
					body.position.z += r*2;
				}

				var leg1 = findBone(chrs[id],"右足");
				var leg2 = findBone(chrs[id],"左足");
				leg1.rotation.x += r/1;
				leg2.rotation.x += r/1;
				var foot1 = findBone(chrs[id],"右足ＩＫ");
				var foot2 = findBone(chrs[id],"左足ＩＫ");
				foot1.position.x += r*2;
				foot2.position.x += -r*2;

				var ude = anim_user[id].pickup/4;
				if(ude >= 1.0) ude = 1.0;
				morphBoneRotLR(id, "肩",l, ude*-0.6, 0, 0);	//拾い上げ
				morphBoneRotLR(id, "肩",cat, -0.25, 0, (chrs[id] == player_mesh)?0.06:0);	//ボール持ち（移動）中
				morphBoneRotLR(id, "ひじ",cat, -0.5+0.12, 0, 0.25-0.16);
				morphBoneRotLR(id, "手首",cat, 0.12, 0.16, 0.08);

				chrs[id].updateMatrixWorld( true );
				//IK変形しなくても地面に対して足首曲げてくれたりする
				helper.objects.get( chrs[id] ).ikSolver.update();
			}
		}
		//ごほうびモード推移
		if(anim_user[id].gohoubi != 0) {
			if(anim_user[id].gohoubi <= 2) {
				//プレイヤーのもとに向かう
				var rot = rotateUpdate(1, player_x, player_z, upd_count);
				if(walkUpdateTarget(1, player_x+(-1),player_z, 1.0*upd_count) < 8 && rot) {
					anim_user[id].nade++;
					anim_user[id].run = 0;
				}
			}
			else if(anim_user[id].gohoubi >= 5) {
				var rot = rotateUpdate(1, ball.position.x,ball.position.z, upd_count);
				if(walkUpdateTarget(1, ball.position.x,ball.position.z, 1.0*upd_count) < 8 && rot) {
					anim_user[id].run = 0;
					anim_user[id].nade = 0;
					anim_user[id].gohoubi = 0;
					cameraLock = 0;
				}
			}
		}

//		anim_user[id].nade++;
//		if(anim_user[id].gohoubi == 0) anim_user[id].gohoubi = 1;
		//なでなで
		if(anim_user[id].nade > 0 && anim_user[id].gohoubi == 1) {
			var l = 0;
			var l2 = 0;
//			anim_user[id].run = 0;

			if(anim_user[id].nade < 30) {
				if(anim_user[id].nade > 30-10) {
					l2 = (anim_user[id].nade-30)/10;
				}
			}
			else if(anim_user[id].nade < 60) {
				l = (anim_user[id].nade-30)/30;
			}
			else if(anim_user[id].nade < 300-30) {
				l = 1;
				l2 = 1;
			}
			else {
				l = (300-anim_user[id].nade)/30;
				if(anim_user[id].nade < 300-20) {
					l2 = (280-anim_user[id].nade)/10;
				}
				if(anim_user[id].nade >= 300) {
//					anim_user[id].gohoubi = 5;	//終わり
					anim_user[id].gohoubi = 3;	//終わり（後ずさり→投げキッス）
					anim_user[id].nade = 1;
				}
			}
			camera_y = camera_default_y - l*3;	//頭を下げる
			playerOffset(0, -l*3, 0);

			function playerOffset(x,y,z) {
				player_mesh.matrix.multiplyMatrices((new THREE.Matrix4()).makeTranslation(x,y,z),player_mesh.matrix);
				player_mesh.updateMatrixWorld( true );
			}
//			player_mesh.updateMatrixWorld( false );
//			chrs[id].position.x = -12*(1-l) + (player_x+7)*l;

			var nade = Math.sin(count/7)*l;
			var bust = findBone(chrs[id],"上半身");
			bust.rotation.z += l*-0.1;
			bust = findBone(chrs[id],"上半身2");
			bust.rotation.z += l*-0.2;
			var arm = findBone(chrs[id],"右肩");
			arm.rotation.x += l*(-0.15)*5;
			arm.rotation.y += l*(-0.0)*5;
			arm.rotation.z += 0;
			var arm = findBone(chrs[id],"右腕");
			arm.rotation.x += l*(-0.18)*5;//-1.6;
			arm.rotation.y += l*( 0.22)*5 + nade*-0.1;
			arm.rotation.z += l*( 0.08)*5;// 0.4;
			var arm2 = findBone(chrs[id],"右ひじ");
			arm2.rotation.x += 0*5;
			arm2.rotation.y += l*(0.08)*5 + nade*l*0.4;
			arm2.rotation.z += l*(-0.28)*5;
			var arm3 = findBone(chrs[id],"右手首");
			arm3.rotation.x += 0*5 + nade*l*-0.1;
			arm3.rotation.y += 0*5;
			arm3.rotation.z += l*0.14*5;

			if(chrs[id] == chr_mesh) {
				//目
				chrs[id].morphTargetInfluences[16] = 0.2 + l2*0.8;
				chrs[id].morphTargetInfluences[15] *= 1-l2;	//まばたき無効
				//口
				chrs[id].morphTargetInfluences[19] = 1*(1-l2);
				chrs[id].morphTargetInfluences[31] = 1*(l2);
			}
				
			chrs[id].updateMatrixWorld( true );
			//IK変形しなくても地面に対して足首曲げてくれたりする
			helper.objects.get( chrs[id] ).ikSolver.update();
		}
		//罰ゲーム（でこぴん）
		if(anim_user[id].nade > 0 && anim_user[id].gohoubi == 2) {
			var l = 0;
			var l2 = 0;	//表情
			var l3 = 0;	//腕
			if(anim_user[id].nade < 30) {
				if(anim_user[id].nade > 20) {
					l2 = (anim_user[id].nade-20)/10;
				}
			}
			else if(anim_user[id].nade < 120) {
				l = l2 = 1;
				if(anim_user[id].nade < 60) {
					l = (anim_user[id].nade-30)/30;
					cameraLock = l;
				}
				l3 = (anim_user[id].nade-30)/90;
			}
			else if(anim_user[id].nade < 300-30) {
				l = l2 = l3 = 1;
			}
			else {
				l = l3 = (300-anim_user[id].nade)/30;
				cameraLock = l;
				if(anim_user[id].nade < 280) {	//270-280
					l2 = (280-anim_user[id].nade)/10;
				}
				if(anim_user[id].nade >= 300) {
					anim_user[id].gohoubi = 5;	//終わり
				}
			}
			camera_y = camera_default_y - l*1;	//頭を下げる
			playerOffset(0, -l*1, 0);

			function playerOffset(x,y,z) {
				player_mesh.matrix.multiplyMatrices((new THREE.Matrix4()).makeTranslation(x,y,z),player_mesh.matrix);
			}
//			player_mesh.updateMatrixWorld( false );
//			chrs[id].position.x = -12*(1-l) + (player_x+7)*l;

			var arm = findBone(chrs[id],"右肩");
			arm.rotation.x += l3*(-0.15)*5;
			arm.rotation.y += l3*(-0.0)*5;
			arm.rotation.z += 0;
			var arm = findBone(chrs[id],"右腕");
			arm.rotation.x += l3*(-0.18)*5;
			arm.rotation.y += l3*( 0.22)*5;
			arm.rotation.z += l3*( 0.08)*5;
			var arm2 = findBone(chrs[id],"右ひじ");
//			arm2.rotation.x += adj2_x*5;
			arm2.rotation.y += l3*( 0.1 )*5;
			arm2.rotation.z += l3*(-0.32)*5;
			var arm3 = findBone(chrs[id],"右手首");
			arm3.rotation.x += 0*5;
			arm3.rotation.y += 0*5;
			arm3.rotation.z += l3*0.14*5;
			if(anim_user[id].nade > 180) {
				arm3.rotation.z -= l3*0.1;
			}

			if(chrs[id] == chr_mesh) {
				//まゆ
				chrs[id].morphTargetInfluences[0] *= 1-l2;
				chrs[id].morphTargetInfluences[1] = l2;
				//目
				chrs[id].morphTargetInfluences[15] *= 1-l2;	//まばたき無効
				chrs[id].morphTargetInfluences[15] += (l2)*0.5;
				//口
				chrs[id].morphTargetInfluences[19] += l2*0.8;
				chrs[id].morphTargetInfluences[32] = l2*0.6;
	//				chrs[id].morphTargetInfluences[37] = (l2);
			}
				
			chrs[id].updateMatrixWorld( true );
			//IK変形しなくても地面に対して足首曲げてくれたりする
			helper.objects.get( chrs[id] ).ikSolver.update();
		}
		/*if(anim_user[id].gohoubi == 0) {	//debug
			anim_user[id].gohoubi = 1;
			anim_user[id].nade = 0;
		}*/
		//なげキッス
		if(anim_user[id].nade > 0 && anim_user[id].gohoubi == 3) {
			var l1 = 0;
			var l2 = 0;	//表情
			var l3 = 0;	//腕
			if(anim_user[id].nade < 60) {
				l1 = (anim_user[id].nade)/60;
				l1 = Math.sin(l1*Math.PI/2);
				if(anim_user[id].walk == 0) {
					anim_user[id].walk = 1;
					anim_user[id].walk_back = 1;
				}
				//後ろ歩き＆横向き
				chrs[id].rotation.y = (l1-1)*Math.PI/2;
				walkUpdate(1, 0, 0.2);
			}
			else if(anim_user[id].nade < 100) {	//まち
				if(anim_user[id].walk != 0) {
					anim_user[id].walk_stop = 1;
				}
				l1 = 1;
			}
			else if(anim_user[id].nade < 130) {
				l1 = 1;
				l2 = (anim_user[id].nade-100) / 30;
				l2 = Math.sin(l2*Math.PI/2);
				if(chrs[id] == chr_mesh) {
					chrs[id].morphTargetInfluences[19] = 0;		//ω
					chrs[id].morphTargetInfluences[23] = 1;		//う
				}
			}
			else if(anim_user[id].nade <= 130+60) {
//				l1 = l2 = 1-Math.sin((anim_user[id].nade-180) / 60*Math.PI/2);
				l1 = l2 = 1-((anim_user[id].nade-130) / 60);
				if(chrs[id] == chr_mesh) {
					chrs[id].morphTargetInfluences[23] = 0;		//う
				}

				//立ち去り
				var rot = rotateUpdate(1, ball.position.x,ball.position.z, upd_count);
				if(walkUpdateTarget(1, ball.position.x,ball.position.z, 1.0*upd_count) < 8 && rot) {
				}
				if(anim_user[id].run == 0) anim_user[id].run = 1;
				if(anim_user[id].nade >= 130+60) {
					anim_user[id].gohoubi = 0;
					anim_user[id].nade = 0;
					resetGame(true);	//通常のゲームに戻る
				}
			}
			var bust = findBone(chrs[id],"上半身");
			bust.rotation.y += l1*-0.3;
			bust = findBone(chrs[id],"上半身2");
			bust.rotation.y += l1*-0.3;
			var neck = findBone(chrs[id],"首");
			neck.rotation.x += l2*-0.2;
			neck.rotation.y += l1*-0.76;

			var arm = findBone(chrs[id],"右肩");
			arm.rotation.x += l1*(-14)*0.1;
			arm.rotation.y += l1*( -2)*0.1;
			arm.rotation.z += l1*( -1)*0.1;
			var arm = findBone(chrs[id],"右腕");
			arm.rotation.x += l1*(-1 + 2*l2)*0.1;
			arm.rotation.y += l1*(-2)*0.1;
			arm.rotation.z += l1*(-8)*0.1;
			var arm2 = findBone(chrs[id],"右ひじ");
			arm2.rotation.x += l1*(-1)*0.1;
			arm2.rotation.y += l1*(-5)*0.1;
			arm2.rotation.z += l1*(25+-7*l2)*0.1;
			var arm3 = findBone(chrs[id],"右手首",1);
			arm3.rotation.x += ( 5)*0.1;
			arm3.rotation.y += ( 6)*0.1;
			arm3.rotation.z += ( 2*l1 + -21*l2)*0.1;

			if(chrs[id] == chr_mesh) {
				//まゆ
	//			chrs[id].morphTargetInfluences[0] *= 1-l2;
	//			chrs[id].morphTargetInfluences[1] = l2;
				//目
				chrs[id].morphTargetInfluences[15] *= 1-l1;	//まばたき無効
				chrs[id].morphTargetInfluences[11] = (l1)*4;	//ウインク
				//口
	//			chrs[id].morphTargetInfluences[19] += l2*0.8;
	//			chrs[id].morphTargetInfluences[32] = l2*0.6;
	//				chrs[id].morphTargetInfluences[37] = (l2);
			}
				
			chrs[id].updateMatrixWorld( true );
			//IK変形しなくても地面に対して足首曲げてくれたりする
			helper.objects.get( chrs[id] ).ikSolver.update();
		}
		//喜び
		if(anim_user[id].win > 0) {

			{
				//移動制御
				/*if(anim_user[id].run == 0) {
					anim_user[id].run = 1;	//走りモーション
					ball_start.copy(chrs[id].position);
				}*/

				var dir = (id==0) ? -1 : 1;
				const range = 30;
				var target_x;
				var target_z;
				if(anim_user[id].winflg != 2) {
					anim_user[id].win = 1;
					switch(anim_user[id].winflg) {
					case 0:	//コート外相手サイドへ
						target_x = 0;
						target_z = court_h*1.3*dir;
						break;
					case 3:	//コート外自サイドへ
						target_x = 0;
						target_z = -court_h*1.3*dir;
						break;

					case 4:	//センター
						target_x = court_w/2*dir;
						target_z = 0;
						break;

					case 1:	//相手の横
						target_x = chrs[1-id].position.x;
						target_z = chrs[1-id].position.z + range*dir;
						break;
					}
					var len = walkUpdateTarget(id, target_x, target_z, 0.8*upd_count, 2);
					var rot_end = rotateUpdate(id, target_x, target_z, upd_count);
					if(len <= 2) {
						anim_user[id].run_stop = 0;
						if(++anim_user[id].winflg > 4) {
							anim_user[id].winflg = 0
							anim_user[id].win = 0;
							resetGame(true);	//通常のゲームに戻る
						}
					}
				}
				else {
					/*if(adj_z != 0) {
						anim_user[id].win = 1;
						chrs[id].position.x = chrs[1-id].position.x;
						chrs[id].position.z = chrs[1-id].position.z + range;
						adj_z = 0;
					}*/
					for(i=0;i<upd_count;i++) {
						var rot = (anim_user[id].win/(range*4)+(id?1:0))*Math.PI;
						
						walkUpdate(id, rot, 1.0);
						chrs[id].rotation.y = -(rot+0.66) + Math.PI/2;
					}
					
					if(anim_user[id].win >= range*12) anim_user[id].winflg++;
				}
			}
			if(chrs[id] == chr_mesh) {
				chrs[id].morphTargetInfluences[0] = u;	//眉にこり
				chrs[id].morphTargetInfluences[6] = d;	//眉てれ

				chrs[id].morphTargetInfluences[15] = 0.5-u*0.5;	//まばたき
				chrs[id].morphTargetInfluences[16] = u;	//まばたき

				chrs[id].morphTargetInfluences[19] = 0;	//くち
				chrs[id].morphTargetInfluences[32] = d;	//閉じる
				chrs[id].morphTargetInfluences[31] = u;	//にたり
				chrs[id].morphTargetInfluences[21] = u*0.8;	//口をあける
			}
		}
		//バンザイ
		if(anim_user[id].joy > 0 || anim_user[id].win > 0) {
			
			var d = 0;	//下げ
			var u = 0;	//上げ
			var yorokobi = 0;
			if(anim_user[id].win > 0) {
				//勝利の舞
				if(anim_user[id].winflg == 2) {
					yorokobi = (anim_user[id].win * 3/2)%120;
				}
			}
			else {
				//得点時
				yorokobi = (anim_user[id].joy) * 3/2;
				if (yorokobi >= 120) {	//１回で終わり
					anim_user[id].joy = 0;
				}
			}
			if(yorokobi < 60) {
				d = yorokobi / 60;
			}
			else if(yorokobi < 60+30) {
				d = (90-yorokobi)/30;
			}
			if(yorokobi < 60) {
				u = 0;
			}
			else if(yorokobi < 60+30) {
				u = (yorokobi-60)/30;
			}
			else {
				u = (120-yorokobi)/30;
			}
			if(anim_user[id].joy > 0 && chrs[id] == chr_mesh) {
				chrs[id].morphTargetInfluences[15] = 1-u;	//まばたき
				chrs[id].morphTargetInfluences[16] = u;	//にっこり

				chrs[id].morphTargetInfluences[19] = 1-u;	//くち
				chrs[id].morphTargetInfluences[21] = u*0.8;	//口をあける
			}

			//バンザイモーション
			if(1){
				//↓
				var r = Math.sin(d*Math.PI/2)*-0.2;
				var waist = findBone(chrs[id],"下半身");
				waist.rotation.x += r;
				var body = findBone(chrs[id],"センター");
				body.rotation.x += -r*2*0;
				body.position.y += r*4;
				body = findBone(chrs[id],"上半身");
				body.rotation.x += r*-1;
				body = findBone(chrs[id],"上半身2");
				body.rotation.x += r*-1;
				var neck = findBone(chrs[id],"首");
				neck.rotation.x += r*0.5;

				morphBoneRotLR(id, "ひじ",d, -0.62*1.2, 0, 0.38*1.4);

				var leg1 = findBone(chrs[id],"右足");
				var leg2 = findBone(chrs[id],"左足");
				leg1.rotation.x += r/1;
				leg2.rotation.x += r/1;
			}
			{
				//↑
				var r = Math.sin(u*Math.PI/2);
				var waist = findBone(chrs[id],"下半身");
				waist.rotation.x += r*0.2;
				var body = findBone(chrs[id],"センター");
				body.rotation.x += -r*0.2*0;
				body.position.y += r*3*2;
				body = findBone(chrs[id],"上半身");
				body.rotation.x += r*-0.1;
				body = findBone(chrs[id],"上半身2");
				body.rotation.x += r*-0.1;
				var neck = findBone(chrs[id],"首");
				neck.rotation.x += -r*0.5;

				var u2 = u*2.0;
				if(u2 > 1.0) u2 = 1.0;
				morphBoneRotLR(id, "肩",u2, -0.8, 0, -0.0, 1);
				morphBoneRotLR(id, "腕",u2, 0, 0.2, 0.2, 1);
				morphBoneRotLR(id, "ひじ",u, -0.4, 0, 0.1, 1);
				morphBoneRotLR(id, "手首",u, 0.4, 0.2, -0.3);

				if(chrs[id] == chr_mesh) {
					var c = (yorokobi/10+1.1)*Math.PI/2;
					var r2 = (Math.sin(c));
					var l2 = (Math.cos(c));
					var w = 0.5+d*1.5;
					var bust1 = findBone(chrs[id],"左胸上");
					bust1.position.y += ((r2+0.75) * 0.1) * w;
					bust1.position.z -= (l2 * 0.05-0.05) * w;
					var bust2 = findBone(chrs[id],"右胸上");
					bust2.position.y += ((r2+0.75) * 0.1) * w;
					bust2.position.z -= (l2 * 0.05-0.05) * w;
				}
			}
			
			chrs[id].updateMatrixWorld( true );
			//IK変形しなくても地面に対して足首曲げてくれたりする
			helper.objects.get( chrs[id] ).ikSolver.update();
		}
		//残念
//		anim_user[id].regret++;
		if(anim_user[id].regret > 0) {
			var d = 1;
			const max = 240;
			if(anim_user[id].regret < 90) {
				d = anim_user[id].regret/90;
			}
			else if(anim_user[id].regret >= max-30) {
				d = (max-anim_user[id].regret)/30;
				if(anim_user[id].regret >= max) anim_user[id].regret = 0;
			}
			var r = (Math.sin(anim_user[id].regret/30*Math.PI/2)*0.05-0.3)*d;
//			var waist = findBone(chrs[id],"下半身");
			var body = findBone(chrs[id],"センター");
			body.rotation.x += -r*(2+-3/10);
			body.position.z += r*7;
			body.position.y += r;
			body = findBone(chrs[id],"上半身");
			body.rotation.x += r*-17/10;
			body = findBone(chrs[id],"上半身2");
			body.rotation.x += r*-17/10;
//			var neck = findBone(chrs[id],"首");
//			neck.rotation.x += r*1/2+d*-12/10;
//			neck.rotation.y = 0;

			morphBoneRotLR(id, "腕",d, ((15)/10)*r, (1)/10, (2.5)/10, 0);

			chrs[id].updateMatrixWorld( true );
			//IK変形しなくても地面に対して足首曲げてくれたりする
			helper.objects.get( chrs[id] ).ikSolver.update();

			if(chrs[id] == chr_mesh) {
				chr_mesh.morphTargetInfluences[0] *= 1-d;		//眉
				chr_mesh.morphTargetInfluences[4] = d;			//困る

				chr_mesh.morphTargetInfluences[12] = d;		//じと
				chr_mesh.morphTargetInfluences[15] = d*0.3;		//まばたき
				
				chr_mesh.morphTargetInfluences[19] *= 1-d;		//ω
				chr_mesh.morphTargetInfluences[29] = d;	//口
			}
		}
		//スパイク
//		anim_user[id].run++;
//		if(anim_user[id].attack == 0) anim_user[id].attack+=1.0;
		if(anim_user[id].attack > 0) {
			var d = 0;	//下げ
			var u = 0;	//上げ
			var at = 0;
			var jump = 0;
//			const spd = 0.75;
			jump = anim_user[id].attack;
			if (jump >= (20+20+10+20+20)) {	//１回で終わり
//				anim_user[id].attack = 0;
//				jump = (60+20+15+20+20);
//				if(anim_user[id].attack > jump) {
					anim_user[id].attack = 0;
//				}
			}

			if(jump < 20) {
				u = 0;
				d = jump / 20;
			}
			else if(jump < 20+20) {
				u = (jump-20)/20;
				d = ((20+20+10)-jump)/20;
				hand_par = 0.95*u;
			}
			else if(jump < 20+20+10) {
				u = 1;
				at = (jump - (20+20))/10;
				hand_par = 0.95;
			}
			else if(jump < 20+20+10+20) {
				u = ((20+20+10+20)-jump)/20;
				hand_par = 0.95*u;
				at = u*0.75+0.25;
				d = (jump-(20+20+10))/20;
				findBone(chrs[id],"右肩").rotation.z -= 0.3*d;	//右手めりこみ防止
			}
			else {
				d = ((20+20+10+20+20)-jump)/20;
				at = d*0.25;
				findBone(chrs[id],"右肩").rotation.z -= 0.3*d;
			}

			//バンザイモーション
			if(1){
				//↓
				var r = Math.sin(d*Math.PI/2)*-0.2;
				var waist = findBone(chrs[id],"下半身");
				waist.rotation.x += r;
				var body = findBone(chrs[id],"センター");
				body.rotation.x += -r*2*0;
				body.position.y += r*4;
				body = findBone(chrs[id],"上半身");
				body.rotation.x += r*-1;
				body = findBone(chrs[id],"上半身2");
				body.rotation.x += r*-1;
				var neck = findBone(chrs[id],"首");
				neck.rotation.x += r*0.5;
				neck.rotation.y = 0;

				morphBoneRotLR(id, "ひじ",d, -0.62*1.2, 0, 0.38*1.4);

				var leg1 = findBone(chrs[id],"右足");
				var leg2 = findBone(chrs[id],"左足");
				leg1.rotation.x += r/1;
				leg2.rotation.x += r/1;
			}
			{
				//↑
				var r = Math.sin(u*Math.PI/2);
				var waist = findBone(chrs[id],"下半身");
				waist.rotation.x += r*0.2;
				var body = findBone(chrs[id],"センター");
//				body.rotation.x += -r*0.5 + at*0.5;
				body.rotation.y += r*-0.5 + at*1;
				body.position.y += r*18;			//ジャンプの高さ
				body = findBone(chrs[id],"上半身");
				body.rotation.x += r*-0.5 + at*0.2;
				body.rotation.y += r*-0.3 + at*0.6;
				body.rotation.z += r*-0.4 + at*0.8;
				body = findBone(chrs[id],"上半身2");
				body.rotation.x += r*-0.1 + at*0.4;
				body.rotation.y += r*-0.3 + at*0.6;
				var neck = findBone(chrs[id],"首");
//				neck.rotation.x += -r*0.5;
				neck.rotation.x *= 1-u;
				neck.rotation.x += 0;
				neck.rotation.y += r*0.6 + at*-1.2;

				var u2 = u*2.0;
				if(u2 > 1.0) u2 = 1.0;
				morphBoneRot(id, "右肩",u2, -0.8, 0, 0);
				morphBoneRot(id, "右腕",u2, 0+at*7/10, 0.2+at*-6/10, 0.2+at*0/10);
//				morphBoneRotLR(id, "ひじ",u, -0.4, 0, 0.1, 1);
				morphBoneRot(id, "右ひじ",u, at*1/10, at*-2/10, at*2/10);
//				morphBoneRot(id, "右手首",u, 0.4*(1-at), 0.2*(1-at), -0.3*(1-at));
				morphBoneRot(id, "右手首",u, 0.4, 0.2, -0.3);
			}
			var ft = (u > 0.5) ? ((u-0.5)*2.0) : 0;
//			findBone(chrs[id],"左足ＩＫ").rotation.z += r*adj_z/2;
			var foot = findBone(chrs[id],"右足ＩＫ");
			foot.position.z += ft*24+r*adj_z*0;
			
			chrs[id].updateMatrixWorld( true );
			//IK変形しなくても地面に対して足首曲げてくれたりする
			helper.objects.get( chrs[id] ).ikSolver.update();

			var knee = findBone(chrs[id],"右ひざ");
			knee.rotation.x += ft * 2;
			knee.rotation.z += body.rotation.y * 2;
		}
		if(anim_user[id].vacation > 0) {
//			morphBoneRot(id, "センター",1, (-5+adj_z*0)/20, 2*Math.PI/2, 0);
			if(org_light_mode == 0) {
				//椅子あり
				morphBoneRot(id, "下半身",1, (-5)/20, 0, 0);
				chr_mesh.rotation.x = ((12)/20)*Math.PI/2;
				chr_mesh.rotation.y = ((33)/20)*Math.PI/2;
				chr_mesh.rotation.z = (-8/20)*Math.PI/2;
			}
			else {
				//椅子なし
				//軽量モードではビーチチェアがないので地べたに寝る
				morphBoneRot(id, "下半身",1, (-2)/20, 0, 0);
				chr_mesh.rotation.x = ((21)/20)*Math.PI/2;
				chr_mesh.rotation.y = ((39)/20)*Math.PI/2;
				chr_mesh.rotation.z = (-8/20)*Math.PI/2;
			}

			var neck = findBone(chrs[id], "首");
			neck.rotation.x = 0.4*Math.PI/2;
			neck.rotation.y = 0;

			morphBoneRotLR(id, "肩",1, -4/10, 2/10, -3/10);
			morphBoneRotLR(id, "ひじ",1, -7.5/10, 0/10, 4/10);


			if(org_light_mode == 0) {
				morphBoneRot(id, "右ひざ",1, 3/20, 0, 1.5/20);
				morphBoneRot(id, "左ひざ",1, 1/20, 0, -1.5/20);
				findBone(chrs[id], "右足ＩＫ").position.add(new THREE.Vector3((14)/10,(27+8)/10,(67-9)/10));
				findBone(chrs[id], "左足ＩＫ").position.add(new THREE.Vector3((-22)/10,(8)/10,(84)/10));
			}
			else {
				findBone(chrs[id], "右足ＩＫ").position.add(new THREE.Vector3((15)/10,(22)/10,(-0)/10));
				findBone(chrs[id], "左足ＩＫ").position.add(new THREE.Vector3((-25)/10,(-26)/10,(0)/10));
			}

			chr_mesh.morphTargetInfluences[15] = 1;

			chrs[id].updateMatrixWorld( true );
			helper.objects.get( chrs[id] ).ikSolver.update();
			if(org_light_mode != 0) {
				morphBoneRot(id, "右足首",1, (1)/10, -1/10, (0)/10);
			}

			var breath = Math.sin(count/24);
			var bust = findBone(chrs[id], "上半身");

			findBone(chrs[id],"上半身").rotation.x		+= (breath)*0.0+0.2;
			findBone(chrs[id],"上半身2").rotation.x		-= (breath)*0.02;
			findBone(chrs[id],"上半身").position.z		+= (breath)*0.05;
			findBone(chrs[id],"上半身2").position.y		+= (breath)*0.03;

			findBone(chrs[id], "左胸上").position.y += breath*0.03;
			findBone(chrs[id], "右胸上").position.y += breath*0.03;
		}
		//歩く
//		anim_user[id].walk++;
		if(anim_user[id].walk > 0) {
			var w = 0;
			const max = 10;
			if(anim_user[id].walk > max) anim_user[id].walk = max;
			w = anim_user[id].walk / max;
			var stp = count2 / 12;
			if(anim_user[id].walk_back) stp *= -0.75;
			var r = (Math.sin(stp));
			var l = (Math.cos(stp));
			var r2 = (Math.sin(stp*2));
			var l2 = (Math.cos(stp*2));
			var body = findBone(chrs[id],"センター");
			body.position.y += (Math.abs(r) * 0.3) * w;

			var body2 = findBone(chrs[id],"上半身");
			body2.rotation.x += (r2 * 0.03 + 0.03) * w;
			body2.rotation.y += r*0.1 * w;
			var body4 = findBone(chrs[id],"上半身2");
			body4.rotation.x += (r2 * 0.01) * w;
			var body3 = findBone(chrs[id],"下半身");
			body3.rotation.x -= (r2 * 0.03 - 0.03) * w;
			body3.rotation.y += r*-0.1 * w;
			
			var neck = findBone(chrs[id],"首");
			if(damage_flag[id] && anim_user[id].attack == 0) {	//疲労歩き
				var r2 = -0.18*w;
				body.rotation.x += -r2*(2+-3/10);
				body.position.z += r2*7;
				body.position.y += r2*0/10;
				body2.rotation.x += r2*-17/10;
				body4.rotation.x += r2*-17/10;
				neck.rotation.x += (r2/2-0.6)*w;
				neck.rotation.y *= 1-w;
				morphBoneRotLR(id, "腕",w, ((15)/10)*r2, (1)/10, (2.5)/10, 0);
			}

			var foot1 = findBone(chrs[id],"右足ＩＫ");
			var foot2 = findBone(chrs[id],"左足ＩＫ");
			foot1.position.z += (r*-3) * w;
			foot2.position.z += (r* 3) * w;
			
			chrs[id].updateMatrixWorld( true );
			helper.objects.get( chrs[id] ).ikSolver.update();

			neck.rotation.x -= r2*0.05 * w;

			foot1 = findBone(chrs[id],"右足首");
			foot2 = findBone(chrs[id],"左足首");
			foot1.rotation.x += (-Math.cos(stp+Math.PI)/2-0.5)*0.5 * w;
			foot2.rotation.x += (-Math.cos(stp		)/2-0.5)*0.5 * w;

			var knee1 = findBone(chrs[id],"右ひざ");
			var knee2 = findBone(chrs[id],"左ひざ");
			knee1.rotation.x += ((Math.cos(stp+Math.PI)/2+0.5)*Math.PI/2/4)*w;
			knee2.rotation.x += ((Math.cos(stp		)/2+0.5)*Math.PI/2/4)*w;

			//腕ふり、ボール持ちや特殊モーションは無効
			if(anim_user[id].pickup == 0 && (anim_user[id].win == 0 || anim_user[id].winflg != 2) && anim_user[id].joy == 0 && !damage_flag[id]) {
				var sho1 = findBone(chrs[id],"右肩");
				var sho2 = findBone(chrs[id],"左肩");
				sho2.rotation.x += ( r*0.25) * w;
				var elb1 = findBone(chrs[id],"右ひじ");
				var elb2 = findBone(chrs[id],"左ひじ");
				elb2.rotation.x += (-Math.PI/2+r*0.1)*0.1 * w;
				elb2.rotation.y += (-Math.PI/2+r*0.1)*0.1 * w;
				if(anim_user[id].attack == 0) {
				sho1.rotation.x += (-r*0.25) * w;
				elb1.rotation.x += (-Math.PI/2+r*0.1)*0.1 * w;
				elb1.rotation.y += ( Math.PI/2+r*0.1)*0.1 * w;
				}
			}
		}
		//走る
		//IKをupdateしたくないので最後
//		if(anim_user[id].run == 0) anim_user[id].run = 1;
		if(anim_user[id].run > 0) {
			var w = 0;
			const max = 15;
			if(anim_user[id].run > max) anim_user[id].run = max;
			w = anim_user[id].run / max;
			var stp = count2 / 8;
			var r = (Math.sin(stp));
			var l = (Math.cos(stp));
			var r2 = (Math.sin(stp*2));
			var l2 = (Math.cos(stp*2));
			var body = findBone(chrs[id],"センター");
			body.position.y += (Math.abs(r) * 1) * w;
			body.rotation.x += 0.1 * w;

			var body2 = findBone(chrs[id],"上半身");
			body2.rotation.x += (r2 * 0.05 + 0.05) * w;
			body2.rotation.y += r*0.1 * w;
			var body4 = findBone(chrs[id],"上半身2");
			body4.rotation.x += (r2 * 0.02) * w;
			var body3 = findBone(chrs[id],"下半身");
			body3.rotation.x -= (r2 * 0.05 - 0.05) * w;
			body3.rotation.y += r*-0.1 * w;

			if(chrs[id] == chr_mesh) {
				var bust1 = findBone(chrs[id],"左胸上");
				bust1.position.y += ((r2+0.75) * 0.1) * w;
				bust1.position.z -= (l2 * 0.05-0.05) * w;
				var bust2 = findBone(chrs[id],"右胸上");
				bust2.position.y += ((r2+0.75) * 0.1) * w;
				bust2.position.z -= (l2 * 0.05-0.05) * w;
			}
			
			var foot1 = findBone(chrs[id],"右足ＩＫ");
			var foot2 = findBone(chrs[id],"左足ＩＫ");
			foot1.position.z += (r*-6) * w;
			foot2.position.z += (r* 6) * w;

			chrs[id].updateMatrixWorld( true );
			helper.objects.get( chrs[id] ).ikSolver.update();

			var neck = findBone(chrs[id],"首");
			neck.rotation.x -= r2*0.15 * w;

			var knee1 = findBone(chrs[id],"右ひざ");
			var knee2 = findBone(chrs[id],"左ひざ");
			knee1.rotation.x += ((Math.cos(stp+Math.PI)/2+0.5)*Math.PI/2)*w;
			knee2.rotation.x += ((Math.cos(stp)/2+0.5)*Math.PI/2)*w;

			//腕ふり、ボール持ちや特殊モーションは無効
			if(anim_user[id].pickup == 0 && (anim_user[id].win == 0 || anim_user[id].winflg != 2) && anim_user[id].joy == 0) {
				var sho1 = findBone(chrs[id],"右肩");
				var sho2 = findBone(chrs[id],"左肩");
				sho2.rotation.x += ( r*0.66) * w;
				var elb1 = findBone(chrs[id],"右ひじ");
				var elb2 = findBone(chrs[id],"左ひじ");
				elb2.rotation.x += (-Math.PI/2+r*0.1)*0.4 * w;
				elb2.rotation.y += (-Math.PI/2+r*0.1)*0.4 * w;
				if(anim_user[id].attack == 0) {
				sho1.rotation.x += (-r*0.66) * w;
				elb1.rotation.x += (-Math.PI/2+r*0.1)*0.4 * w;
				elb1.rotation.y += ( Math.PI/2+r*0.1)*0.4 * w;
				}
			}
		}
		if(is_ballhold(id))
		{	//ボールを持ち上げる
			//右手と左手の中間
//			chrs[id].position.set(chrs[id].position.x,chrs[id].position.y,chrs[id].position.z);
			chrs[id].updateMatrixWorld( true );
//			var pos2 = (new THREE.Vector3()).setFromMatrixPosition(findBone(chrs[id],"右手首").matrixWorld);
//			var pos1 = (new THREE.Vector3()).setFromMatrixPosition(findBone(chrs[id],"左手首").matrixWorld);
			var pos2 = (new THREE.Vector3()).setFromMatrixPosition(findBone(chrs[id],"右中指１").matrixWorld);
			var pos1 = (new THREE.Vector3()).setFromMatrixPosition(findBone(chrs[id],"左中指１").matrixWorld);
			if(anim_user[id].serve2 > 0) {
				var a= anim_user[id].serve2/8;
				if(a > 1.0) a = 1.0;
				var b = 0.5 + a * 0.5;
				pos1.multiplyScalar(b);
				pos2.multiplyScalar(1-b);
				pos1.add(pos2);
				pos1.y += 2;
			}
			else {
				pos1.add(pos2);
				pos1.multiplyScalar(0.5);
				pos1.y += 1;
			}
			ball.position.x = pos1.x;
			ball.position.y = pos1.y;
			ball.position.z = pos1.z;
			physics.setMeshPosition( ball, ball.position );
		}		
		//指ぐー
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
		if(anim_user[id].serve || anim_user[id].serve2) {
			hand_par = 0.9;
		}
		if(anim_user[id].pickup > 0) {
			hand_par = anim_user[id].pickup/20;
			if(hand_par > 0.95) hand_par = 0.95;
		}
		if(anim_user[id].nade > 0 && anim_user[id].gohoubi == 1) {
			hand_par = 0.9;
		}
		if(anim_user[id].nade > 0 && anim_user[id].gohoubi == 2) {
			if(anim_user[id].nade < 180) {	//ホールド
				hand_par = 0.7;
			}else{
				hand_par = 0.73;
			}
		}
		if(anim_user[id].winflg == 2 && (anim_user[id].win*3/2)%120 > 60) {
			hand_par = 1;
		}
		if(anim_user[id].joy > 0) {
			hand_par = 1;
		}
		if(anim_user[id].regret > 0 || anim_user[id].walk > 0 && damage_flag[id]) {
			hand_par = 0.9;
		}
		for(i=0;i<finger_name.length;i++) {
			var nigiri_r = 0.95 + Math.round(i/3)*0.1;
			var nigiri_l = nigiri_r;
			var yr,yl;
			yr = findBone(chrs[id],"右"+finger_name[i])
			yl = findBone(chrs[id],"左"+finger_name[i]);
			yr.rotation.z	=  Math.PI/2*((nigiri_r*(1-hand_par)) + (0.1 * hand_par));
			yl.rotation.z	= -Math.PI/2*((nigiri_l*(1-hand_par)) + (0.1 * hand_par));
			
			if(game_view == 0) {
				//プレイヤー
				yr = findBone(player_mesh,"右"+finger_name[i])
				yl = findBone(player_mesh,"左"+finger_name[i]);
				yr.rotation.z	=  Math.PI/2*0.95;
				yl.rotation.z	= -Math.PI/2*0.95;
			}
		}
		//でこぴん
		if(anim_user[id].nade > 0 && anim_user[id].gohoubi == 2) {
			morphBoneRot(id, "右親指１",1,0.26,-0.02,0.16);
			morphBoneRot(id, "右親指２",1,0,-0.5,0);
			if(anim_user[id].nade < 180) {	//ホールド
				findBone(chrs[id],"右中指１").rotation.z = Math.PI/2*0.6;
				findBone(chrs[id],"右中指２").rotation.z = Math.PI/2*0.9;
				findBone(chrs[id],"右中指３").rotation.z = Math.PI/2*0.9;
			}
			else {	//リリース
				findBone(chrs[id],"右中指１").rotation.z = 0.4;
				findBone(chrs[id],"右中指２").rotation.z = 0;
				findBone(chrs[id],"右中指３").rotation.z = 0;
			}
		}
		//投げキッス
		if(anim_user[id].nade > 60 && anim_user[id].gohoubi == 3) {
			findBone(chrs[id],"右中指２").rotation.z = 0;
			findBone(chrs[id],"右中指３").rotation.z = 0;
			findBone(chrs[id],"右人指２").rotation.z = 0;
			findBone(chrs[id],"右人指３").rotation.z = 0;

			var r = 0.5;
			if(anim_user[id].nade >= 0 && anim_user[id].nade < 100) {
			}
			else if(anim_user[id].nade < 130) {
				r = r - (anim_user[id].nade-100)/30*r;
			}
			else {
				r = 0;
			}
			findBone(chrs[id],"右中指１").rotation.z = r * Math.PI/2;
			findBone(chrs[id],"右人指１").rotation.z = r * Math.PI/2;
		}

		//表情補正
		for(var i=0;i<chrs[id].morphTargetInfluences.length;i++) {
			if(chrs[id] == player_mesh) {
				chrs[id].morphTargetInfluences[i] = 0;	//無表情
			}
			else {
				if (chrs[id].morphTargetInfluences[i] < 0)
					chrs[id].morphTargetInfluences[i] = 0;
				if (chrs[id].morphTargetInfluences[i] > 1)
					chrs[id].morphTargetInfluences[i] = 1;
			}
		}

		//足跡の当たり判定
		if(foot_meshs !== undefined) {
			chrs[id].updateMatrixWorld( true );
			for(i=0;i<2;i++) {
				var foot = findBone(chrs[id],(i==0)?"右足首":"左足首");
				var pos = (new THREE.Vector3()).setFromMatrixPosition(foot.matrixWorld);
				var j = i + id*2;
				foot_physics[j].position.set(pos.x, pos.y+((chrs[id] == player_mesh)?-1:0), pos.z);
			}
		}
	}
}

//簡易関数
function morphBoneRot(id, name, level, rx, ry, rz, no_add) {
	var r = findBone(chrs[id],name).rotation;
	if(no_add == undefined || no_add == 0) {
		r.x *= (1-level);
		r.y *= (1-level);
		r.z *= (1-level);
	}

	r.x += (level)*rx*Math.PI;
	r.y += (level)*ry*Math.PI;
	r.z += (level)*rz*Math.PI;
}
//右左対応
function morphBoneRotLR(id, name, level, rx, ry, rz) {
	morphBoneRot(id, "右"+name,level, rx, ry, rz);
	morphBoneRot(id, "左"+name,level, rx,-ry,-rz);
}
//ボールを保持している
function is_ballhold(id) {
	if(anim_user[id].pickup >= 30 || (anim_user[id].serve2 > 0 && anim_user[id].serve2 < 27+3)) {
		if(id == serve_player) {
			return true;
		}
	}
	return false;
}
function courtClick() {
	if(game_view == 1) {
		guide_meshs[0].visible = false;
	}
	if(ms_button != 0) return;
	if(game_view != 1) return;

	var dir = (game_player == 0) ? -1 : 1;
	var raycaster = new THREE.Raycaster();
	var x = (ms_cur_x / window.innerWidth ) * 2 - 1;
	var y = (ms_cur_y / window.innerHeight) * 2 - 1;
	raycaster.setFromCamera( new THREE.Vector2(x,y*-1), camera );
	var objs = raycaster.intersectObjects([obj_mesh[OBJ_STAGE]]);   //衝突点検出！

	if(objs != undefined && objs.length > 0) {
		var j = 0;
		for (var i = 1; i < objs.length; i++) {
			if(objs[j].point.y < objs[i].point.y) {
				j = i;
			}
		}
		ms_court = objs[j].point.clone();
//		if(!ms_sp) {
			if(ms_court.x*dir > court_w*1.0)	ms_court.x = court_w*1.0*dir;
			if(ms_court.x*dir < 0)				ms_court.x = 0;
			if(ms_court.z >  court_h*1.0)		ms_court.z =  court_h*1.0;
			if(ms_court.z < -court_h*1.0)		ms_court.z = -court_h*1.0;
		/*}else {
			//スマートフォン版ではコート外をタッチで右クリック扱い
			if(ms_court.x*dir > court_w*1.0)	ms_button = 2;
			if(ms_court.x*dir < 0)				ms_button = 2;
			if(ms_court.z >  court_h*1.0)		ms_button = 2;
			if(ms_court.z < -court_h*1.0)		ms_button = 2;
		}*/
		ms_court.y = getGround(ms_court.x, ms_court.z);
		if(game_view == 1) {
			guide_meshs[0].position.copy(ms_court);
			guide_meshs[0].visible = true;
		}
	}
	
//	ms_click = 0;
}

function render() {
	var delta = clock.getDelta();
	if(!isActive) return;

	if(LoadingUpdate(delta)) {
		if(PauseFlag == 0) {
			my_update(delta*1);
		}
	}

	/*if(postprocessing) {
		postprocessing.composer.render( 0.1 );
	}
 	else*/ if(outline_renderer)
		outline_renderer.render( scene, camera );
	else
		renderer.render(scene, camera);

	if(debug) {
		stats.update();
	}
}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	WindowCheck();
}

/*function nextAnimation(index, once)
{
	if(anim_current == index) return;	//変化なし
	if(anim_prev != anim_current) {
		stopAnimation();	//モーフィング中なら一旦リセット
	}
	var mixer = helper.objects.get(chr_mesh).mixer;
	var action1 = mixer.clipAction( chr_anim[anim_prev] );
	var action2 = mixer.clipAction( chr_anim[anim_current] );
	action1.weight = 1;
	action2.weight = 0;
	if(once) {
		action2.reset();
		action2.time = 0;
		action2.loop = THREE.LoopOnce;
	}
	else {
		action2.loop = THREE.LoopRepeat;
	}
	anim_prev = anim_current;
	anim_current = index;
	anim_count = 0;
	action2.play();
}*/
function selectAnimation(mesh, clip, loop)
{
//	anim_current = anim_prev = index;
//	anim_count=0;

	var mixer = helper.objects.get(mesh).mixer;

	if ( mixer ) {

		if(!loop) {
//			mixer.existingAction(clip).setLoop(THREE.LoopOnce);
		}
		else {
//			mixer.addEventListener( 'loop', function( e ) {
//			} );
		}

//		mixer.stopAllAction();
		var action = mixer.clipAction( clip );
		action.weight = 1.0;
//		action.reset();
		action.play();
		if(!loop) {
			action.loop = THREE.LoopOnce;
			action.repetitions = 0;	//繰り返し数
		}
		else {
			action.loop = THREE.LoopRepeat;
		}
//		action.setDuration(vmdFrame[index]*0.0166);
//		action.setDuration(30*0.0166);
//		action.timeScale = 1;
	}


//	return mixer;
}

function stopAnimation()
{
	var _mesh = helper.objects.get(chr_mesh);
	var mixer = _mesh.mixer;
	var i;
	for(i=0;i<chr_anim.length;i++) {
		var action = mixer.clipAction( chr_anim[i] );
		action.weight = 0.0;
	}
}

function onProgress( xhr ) {

	if ( xhr.lengthComputable ) {

		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

	}

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

	if(event.keyCode == 82) {	//r
		key_r = true;
	}
	if(event.keyCode == 70) {	//f
		key_f = true;
	}
	if(event.keyCode == 84) {	//t
		key_t = true;
	}
	if(event.keyCode == 71) {	//g
		key_g = true;
	}
	if(event.keyCode == 89) {	//y
		key_y = true;
	}
	if(event.keyCode == 72) {	//h
		key_h = true;
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
	if(event.keyCode == 82) {	//r
		key_r = false;
	}
	if(event.keyCode == 70) {	//f
		key_f = false;
	}
	if(event.keyCode == 84) {	//t
		key_t = false;
	}
	if(event.keyCode == 71) {	//g
		key_g = false;
	}
	if(event.keyCode == 89) {	//y
		key_y = false;
	}
	if(event.keyCode == 72) {	//h
		key_h = false;
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
//InstancedMesh用
function findBone2(mesh, name)
{
	var i;
	for(i=0;i<mesh.geometry.bones.length;i++) {
		if(mesh.geometry.bones[i].name == name) {
			return mesh.geometry.bones[i];
		}
	}
	return null;
}

//MouseDown
function mousedown(event) {
	//console.log("mousedown");
	if(isUIArea(event)) {
		return;
	}
	event.preventDefault();
	onTouchDown(event.clientX, event.clientY, false);
}

function onTouchDown(_x,_y, sp) {
	ms_cur_x = _x;
	ms_cur_y = _y;
	if(!sp) {
		//マウス
		if(ms_button == -1 && event.button == 0) {
			ms_click = 1;
	//		console.log("click");
		}
		ms_button = event.button;
	}else {
		//スマートフォン
		if(ms_button == -1) {
			ms_click = 1;
		}
		ms_button = 0;
	}
	ms_sp = sp;

//	document.getElementById("debugOut").innerHTML = "cr_x="+ms_cur_x+" cr_y="+ms_cur_y+" <br>";
//	document.getElementById("debugOut").innerHTML += "st_x="+ms_start_x+" st_y="+ms_start_y+" <br>";
}
//2タッチ
var touch_pos = [[0,0], [0,0]];
function onTouchDown2(event) {
	var touches = event.changedTouches;
//	document.getElementById("debugOut").innerHTML = "touch down="+event.touches.length+" <br>";
	for(var i=0;i<2 && i<event.touches.length; i++) {
		touch_pos[i][0] = touches[i].clientX;
		touch_pos[i][1] = touches[i].clientY;
	}
	if(event.touches.length > 1) ms_button = -1;
}
function onTouchMove2(event) {
	var touches = event.changedTouches;
	if(event.touches.length == 2) {
		var x,y;
		//回転Y : ２タッチ回転
		/*x = touch_pos[0][0] - touch_pos[1][0];
		y = touch_pos[0][1] - touch_pos[1][1];
		var nejire1 = Math.atan2(x,y);

		x = touches[0].clientX - touches[1].clientX;
		y = touches[0].clientY - touches[1].clientY;
		var nejire2 = Math.atan2(x,y);
		
	  	var nejire0 = (nejire2 - nejire1) / 10;
	  	if(Math.abs(nejire0) < 1.0) {
//			cam_vec_x += nejire0;
	  	}*/
//		document.getElementById("debugOut").innerHTML += "nejire="+(cam_vec_x)+" <br>";
//		document.getElementById("debugOut").innerHTML += "nejire="+(nejire0)+" <br>";

		x = ((touch_pos[0][0] - touches[0].clientX) + (touch_pos[1][0] - touches[1].clientX))/2;
		y = ((touch_pos[0][1] - touches[0].clientY) + (touch_pos[1][1] - touches[1].clientY))/2;
		//回転Y : ２タッチ左右（平均とる）
		x /= 800;
		if(Math.abs(x) < 0.05) {
			cam_vec_x += x;
			if(x != 0) {
				if(tutorial.step == 2) tutorial.count = 1;
			}
		}
		//回転X : ２タッチ上下（平均とる）
//			document.getElementById("debugOut").innerHTML += "nejire="+(x)+" <br>";
//		x = touches[0].clientX + touches[1].clientX;
//		y = touches[0].clientY + touches[1].clientY;
		y /= 800;
		if(Math.abs(y) < 0.05) {
			cam_vec_y += y;
//			document.getElementById("debugOut").innerHTML += "updown="+(cam_vec_y)+" <br>";
			if(y != 0) {
				if(tutorial.step == 2) tutorial.count = 1;
			}
		}

		//ズーム : ２タッチ距離
		x = (touch_pos[0][0] - touch_pos[1][0]);
		y = (touch_pos[0][1] - touch_pos[1][1]);
		var len1 = Math.sqrt(x*x + y*y);
		x = (touches[0].clientX - touches[1].clientX);
		y = (touches[0].clientY - touches[1].clientY);
		var len2 = Math.sqrt(x*x + y*y);
		var len0 = (len1-len2) / 100;
		if(Math.abs(len0) < 1.0) {
			ms_wheel += len0;
//			document.getElementById("debugOut").innerHTML += "zoom="+((len2-len1) / 100)+"/"+len1+" <br>";
			if(ms_wheel < 0.4) ms_wheel = 0.4;
			if(ms_wheel > 4.0) ms_wheel = 4.0;
			if(len0 != 0) {
				if(tutorial.step == 2) tutorial.count = 1;
			}
		}
	}
	for(var i=0;i<2 && i<event.touches.length; i++) {
		touch_pos[i][0] = touches[i].clientX;
		touch_pos[i][1] = touches[i].clientY;
	}
	if(event.touches.length > 1) ms_button = -1;
}
	
//MouseMove
function mousemove(event) {
//	if(isUIArea(event)) {
//		return;
//	}
	onTouchMove(event.clientX, event.clientY);
}
function onTouchMove(_x,_y) {
	ms_cur_x = _x;
	ms_cur_y = _y;
//	document.getElementById("debugOut").innerHTML = "touch="+ms_cur_x+","+ms_cur_y+" <br>";
}


//MouseUp
function mouseup(event) {
	if(isUIArea(event)) {
		return;
	}
	event.preventDefault();
	onTouchEnd(false);
}
function onTouchEnd(sp) {
//	if(ms_button == 0) ms_click = 1;
	ms_button = -1;
}

function mousewheel(event) {
	if(PauseFlag == 0) {
		ms_wheel += event.wheelDelta / 1000;
		if(ms_wheel < 0.4) ms_wheel = 0.4;
		if(ms_wheel > 4.0) ms_wheel = 4.0;
		if(event.wheelDelta != 0 && tutorial.step == 2) tutorial.count = 1;
	}
	return false;
}

//サウンド
function SoundInit() {
	//サウンド読み込み
	//タッチに反応しないと作れない
	if(audio_listener == null) {
		audio_listener = new THREE.AudioListener();
		var audio_loader = new THREE.AudioLoader();
		function audioLoad(index, resolve) {
			audio_loader.load( audioFile[index], function ( buffer ) {
				audio[index] = new THREE.Audio( audio_listener );
				audio[index].setBuffer( buffer );
				//BGM開始
				if(index == SOUND_BGM)
					SoundPlay(SOUND_BGM, true);
				resolve();
			}, null, function(e){reject()} );
		}
//		var promise;
		for(var i=0;i<audioFile.length;i++) {
			audio_pause[i] = false;
			new Promise(function(resolve, reject) {
				audioLoad(i, resolve);
			}).then(function(value) {
//				promise = null;
			}).catch(function(e) {
				console.log('error: ', e);
			});
		}
	}
}
function SoundPlay(id, loop) {
	if(!option.sound) return;
	if(audio !== undefined) {
		if(audio[id] !== undefined) {
			if(!audio[id].isPlaying) {
				audio[id].offset = 0;
				if(loop == undefined) loop = false;
				audio[id].setLoop(loop);
				audio[id].play();
				audio[id].setVolume(volumeTbl[id]);
			}
		}
	}
}
function SoundStop(id) {
	if(!option.sound) return;
	if(audio !== undefined) {
		if(audio[id] !== undefined) {
			if(audio[id].isPlaying) {
				audio[id].stop();
//				audio[id].setVolume(0);
			}
		}
	}
}
function SoundPause() {
	if(audio !== undefined) {
		for(var id=0;id<audio.length;id++) {
			audio_pause[id] = false;
			if(audio[id] == undefined) continue
			if(!audio[id].isPlaying) continue;
			audio_pause[id] = true;
			audio[id].pause();
		}
	}
}
function SoundRestart() {
	if(audio !== undefined) {
		for(var id=0;id<audio.length;id++) {
			if(audio[id] == undefined) continue
			if(audio[id].isPlaying) continue;
			if(!audio_pause[id]) continue;
			audio[id].play();
		}
	}
}

/*
	保存したい項目
	カメラ位置？
	勝敗数
*/
function StorageSave() {
	localStorage.setItem("sound",option.sound);
	localStorage.setItem("game_level",option.game_level);
	localStorage.setItem("camera_mode",option.camera_mode);
	localStorage.setItem("move_mode",option.move_mode);
	localStorage.setItem("light_mode",option.light_mode);
	localStorage.setItem("tutorial_flag",option.tutorial_flag);
}


function getStorageNum(name) {
	var data;
	if(data = localStorage.getItem(name)) {
		return Number(data);
	}
	return default_data[name];
	
}

function StorageLoad() {
//	option.sound		= getStorageNum("sound");
	option = {
		sound : 0,
		game_level	: getStorageNum("game_level"),
		camera_mode	: getStorageNum("camera_mode"),
		move_mode	: getStorageNum("move_mode"),
		light_mode	: getStorageNum("light_mode"),
		tutorial_flag : getStorageNum("tutorial_flag"),
	};
	org_light_mode = option.light_mode;
}
//	option.camera_mode = 0;
//	option.move_mode = 1;

function getCameraMode() {
	if(load_seq > 0 && load_seq <= 10) {
		return 10;
	}
	if(load_seq > 10) {
		if(option.camera_mode != 2 && game_player == 1) {
			return 4;	//先行
		}
	}
	if(tutorial.enable) {
		return 0;
	}
	return option.camera_mode;
}
function getMoveMode() {
	if(tutorial.enable) {
		return 1;
	}
	return option.move_mode;
}


/**
 * フルスクリーンが利用できるか
 *
 * @return {boolean}
 */
function enabledFullScreen(){
  return(
	document.fullscreenEnabled || document.mozFullScreenEnabled || document.documentElement.webkitRequestFullScreen || document.msFullscreenEnabled
  );
}

/**
 * フルスクリーンにする
 *
 * @param {object} [element]
 */
function beginFullScreen(element=null){
  const doc = window.document;
  const docEl = (element === null)?  doc.documentElement:element;
  let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  requestFullScreen.call(docEl);
}

/**
 * フルスクリーンをやめる
 */
function endFullScreen(){
  const doc = window.document;
  const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  cancelFullScreen.call(doc);
}

/**
 * フルスクリーン中のオブジェクトを返却
 */
function getFullScreenObject(){
  const doc = window.document;
  const objFullScreen = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
  return(objFullScreen);
}


function listupBone(mesh, nest)
{
	if(nest > 0) {
		nest++;
		var i;
		var str = "";
		for(i=0;i<nest-1;i++) {
			str+="_";
		}
		str+="["+mesh.name+"]";
		console.log(str);
	}
	if(mesh == null) {
		return nulll;
	}
	
	if(mesh.children != null) {
		var i;
		for(i=0;i<mesh.children.length;i++) {
			var ptr = listupBone(mesh.children[i], nest);
			if(ptr) {
				return ptr;
			}
		}
	}
	return null;
}
//listupBone(obj_mesh[OBJ_TAMAMI], 1);
