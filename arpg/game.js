"use strict";

//
//import * as THREE from '../three.js-master/build/three.module.js';

const debug = 0;
/*
	PerfMode
	0	最も軽量
	1	
	2	ハイパフォーマンス
*/
let MenuScale = 1;	//メニュー解像度比率

//共通固定値
var GameParam = {
	PerfMode : 1,
	Party3Mode : 1,		//３人モード
	physics_speed : 2,
	MapSizeX : 50,
	MapSizeZ : 50,
	MapScale : 1,		//地形倍率
	HeightScale : 1.0,
	AtariSize : 0.33,
	WaterLine : -1.4,
	SwimFrame : 15,
	AlphaOrder : 3000,	//VRM中で使われているrenderOrder値より大きいもの
	EncountArea : 14,	//敵エンカウント範囲
	BattleArea  : 21,	//戦闘範囲
	RecoverTime : 60*30,	//戦闘不能状態からの復帰時間
	ComboLimit : 150,
	ArmorRecoverTime : 600,
	FadeTime : 45,
	Config : {
		TPSMode : 1,
		CameraH : 0,
		CameraV : 0,
		UseItem : 1,
	},
	MouseLock : 0,
	AmuletLimit : 99,	//お守り所持限界
	AmuletRate : 5,		//１ダメあたりの消費
	AttackUpTime : 450,	//攻撃力UPの持続時間

	season : "",
	
	scene : null,
	world_view : null,
	debug_obj1 : null,
	count : 0,
	BattleMode : 0,
	stage : null,
	GamePause : "",
	
	AtariDebug : 0,
	DpsCheck : 0,

	DamageText : DamageText,
	SetLife : SetLife,
	SetArmor : SetArmor,
	SetSkill : SetSkill,
	OpenItemBox : OpenItemBox,
	resetDefaultGamePadAssign : resetDefaultGamePadAssign,
	getPlayableChara : getPlayableChara,
	updateLife : updateLife,
	getMesh : getMesh,
	getVRM  : getVRM,
	getTexture : getTexture,
	getPlayableList : getPlayableList,
	orderMapMove : orderMapMove,
	startMapMove : startMapMove,
	restartGame : restartGame,
	stopGame : stopGame,
	getCanvasImage : getCanvasImage,
	getButtonImage : getButtonImage,
	getStartPoint : getStartPoint,
	getEventPoint : getEventPoint,
	getItemBoxCount : getItemBoxCount,
	
	Assign : null,

	//ユーザーの情報すべて、セーブデータの元
	user : null,

	//mesh
	mesh : {
		terrain	: null,
		weed	: null,
		items	: null,
		water	: null,
		leaf	: null,
		stage	: null,
		mountain: null,
		snow    : null,
		susuki	: null,
	},
	debug : debug,
};

//入力情報（アサイン後）
var Input = {
	enter : false,
	cancel : false,
	attack1 : false,
	attack2 : false,
	attack3 : false,
	jump : false,
	guard : false,
	start : false,
	select : false,
	stickL : {x:0,y:0},
	stickR : {x:0,y:0},
	up : false,
	down : false,
	left : false,
	right : false,
	clickL : false,
	clickR : false,
	clickC : false,

	//デバッグor拡張
	L1 : false,
	R1 : false,
	L2 : false,
	R2 : false,
	L3 : false,
	R3 : false,
};
var InputOnes = {
};
var InputCount = {
};
//ボタンアサイン
const Assign_PS3 = {
	//PS3 controller
	"enter" : 1,
	"cancel" : 2,

	"jump" : 2,		//×
	"attack1" : 3,	//□
	"attack2" : 0,	//△
	"attack3" : 1,	//○
	"guard" : 7,
	"change": 6,
	"pause" : 8,
	"up"    : -1,
	"down"  : -1,
	"left"  : -1,
	"right" : -1,

	"move_h" : 0,	//axes
	"move_v" : 1,	//axes
	"camera_h" : 2,	//axes
	"camera_v" : 5,	//axes
	
	"L2" : 4,
	"R2" : 5,
	"L3" : 10,
	"R3" : 11,

	index : -1,	//最初に見つけた
};
const Assign_Default = {	//XBOX
	//XBOX controller
	"enter" : 1,
	"cancel" : 0,

	"jump" : 0,		//A
	"attack1" : 2,	//X
	"attack2" : 3,	//Y
	"attack3" : 1,	//B
	"guard" : 5,	//RB
	"change": 4,	//LB
	"pause" : 9,	//menu
	"up"    : 12,
	"down"  : 13,
	"left"  : 14,
	"right" : 15,

	"move_h" : 0,	//axes
	"move_v" : 1,	//axes
	"camera_h" : 2,	//axes
	"camera_v" : 3,	//axes
	
	"L2" : 6,
	"R2" : 7,
	"L3" : 10,
	"R3" : 11,

	index : -1,	//最初に見つけた
};
/*let Assign_Unknown = {	//不詳（10ボタン以内）
	"enter" : 1,
	"cancel" : 0,

	"jump" : 0,		//×
	"attack1" : 2,	//□
	"attack2" : 3,	//△
	"attack3" : 1,	//○
	"guard" : 4,
	"special" : 5,
	"pause" : 6,
	"change" : 7,

	"move_h" : 0,	//axes
	"move_v" : 1,	//axes
	"camera_h" : 2,	//axes
	"camera_v" : 3,	//axes

	index : -1,	//最初に見つけた
};*/
var icon_type = "xbox";



var cameraHelper;

var container;

var canvas_2d;
var canvas_ui;	//画面の上下
var canvas_minimap;			//全体
var canvas_minimap_sub;		//表示範囲
var canvas_minimap_walk;	//歩いた領域
var canvas_menu;
var canvas_ui2;	//コンボなど
var image_minimap;
var image_icons = new Array();

var ms_button = -1;
var ms_cur_x = 0;
var ms_cur_y = 0;
var ms_last_x = 0;
var ms_last_y = 0;
var ms_mom_x = 0;
var ms_mom_y = 0;
var ms_wheel = 1.0;
var ms_click = 0;
var ms_sp = 0;

var stats,gui;

//var PauseFlag = 0;
var isActive = 1;
var cam_action_fov = -1;

var enableUI = false;
var isOption = 0;
var option = {
	sound : 0,
};
var sound = new Sound();

var cam_vec_y = 0;
var cam_vec_x = 0;
var game_camera = {
	target  : new THREE.Vector3(0,0,0),
	eye     : new THREE.Vector3(0,0,0),
	rotation: new THREE.Vector3(0,0,0),
	zoom: 8,
	fov : 50,
	rate: 1,
};
var next_camera = {
	target  : new THREE.Vector3(0,0,0),
	eye     : new THREE.Vector3(0,0,0),
	rotation: new THREE.Vector3(0,0,0),
	zoom: -1,
	fov : 50,
	rate: 1,
};

var load_progress = 0;
var load_progress2 = 0;
var load_seq;
var obj_mesh = new Array();
//var physicsBody = new Array();
var org_vrm = new Array();
var helper;
var key = {};
var press = {};
var old_key = {};
var use_vrm = 0;
var use_shadow;
var requestPause = 0;

var battle_index = 0;
var battle_count = 0;
var battle_mesh;
var battle_area;	//physics body
var enemy_search_list;
var move_search_list;
var npc_search_list;

var drop_items_list;
var active_tree = new Array();

var next_map = -1;
var prev_map = -1;

var ctex_info = new Array();
var ctex_group = new THREE.Object3D();

var count3;
var scene;
var camera;
var renderer;
var clock = new THREE.Clock();;
var file_loader;
var mmd_loader;
var fbx_loader;
var vrm_loader;
var x_loader;
var obj_loader;
var load_manager;

var world_view;
var debug_obj1;	//デバッグ用Mesh
var debug_obj2;	//デバッグ用Mesh

var sun_position = new THREE.Vector3(1,1,1);	//太陽の場所
var directionalLight;
var ambientLight;
var physics;

//battle
var btl = null;
var animation_list = new Array();
var animation_data;
var animFiles = [
	'common',
	'tamami',
	'ayame',
	'karin',
	'enemy00',
	'enemy10',
	'kumo',
];

//map editor
var stage = null;
var terrain_data;
//var mountain_data;

var item_reset = false;	//ドロップ・エンカウント情報をリセットするか（true:マップ移動でクリアされる）
var change_chara = 0;
const friend_name = [
	"tamami","ayame","karin"
];

var event;
var menu;
var fadein_function = null;
var fadeout_function = null;
var fade_count = 0;

//local
import { LoadingManager }		from '../three.js-master-0.126/src/loaders/LoadingManager.js';
import { FileLoader }			from '../three.js-master-0.126/src/loaders/FileLoader.js';
import { MMDLoader }			from '../three.js-master-0.126/examples/jsm/loaders/MMDLoader.js';
import { FBXLoader }			from '../three.js-master-0.126/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader }			from '../three.js-master-0.126/examples/jsm/loaders/GLTFLoader.js';
import { XLoader }				from '../three.js-master-0.126/examples/jsm/loaders/XLoader.js';
import { OBJLoader }			from '../three.js-master-0.126/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader }			from '../three.js-master-0.126/examples/jsm/loaders/MTLLoader.js';
import { MMDAnimationHelper }	from '../three.js-master-0.126/examples/jsm/animation/MMDAnimationHelper.js';
import Stats					from '../three.js-master-0.126/examples/jsm/libs/stats.module.js';
import { CannonPhysics }		from './CannonPhysics.js';	//改造版

import { Stage } from './stage.js';
import { Battle } from './battle.js';
import { Sound } from './sound.js';
import { Menu } from './menu.js';
import { Event } from './event.js';

import { Data } from './Data.js';

import { UserData } from './UserData.js';

//マップ上にひとつだけならadd=true
//クローン作るならfalse
var objInfo = [
	{ name:"bamboo",	path:"model/bamboo.pmd",			visible:true, add:false },
	{ name:"tree",		path:"model/tree2101.pmx",			visible:true, add:false },
	{ name:"bridge",	path:"model/bridge.pmx",			visible:true, add:false },
	{ name:"itembox",	path:"model/itembox.fbx",			visible:true, add:false },
	{ name:"drop",		path:"model/drop.pmd",				visible:true, add:false },
	{ name:"house",		path:"model/house1.pmd",			visible:true, add:false },

	{ name:"skydome",	path:"model/skydome.pmx",			visible:true, add:true  },
	{ name:"blade",		path:"model/blade/blade.pmx",		visible:false,add:false },
	{ name:"cane",		path:"model/cane/cane.pmx",			visible:false,add:false },
	{ name:"beam",		path:"model/beam.pmd",				visible:false,add:false },
	{ name:"attackeff",	path:"model/attackEff.pmd",			visible:false,add:true  },
	{ name:"stone",		path:"model/stone.pmd",				visible:false,add:false },
	{ name:"wing",		path:"model/wing.pmx",				visible:false,add:false },
	{ name:"club",		path:"model/club.pmx",				visible:false,add:false },
	{ name:"web",		path:"model/web.pmd",				visible:false,add:true  },
	{ name:"ice",		path:"model/ice.pmd",				visible:false,add:false },


	{ name:"tamami",	path:"vrm/tamami.vrm",				visible:true, add:false },
	{ name:"ayame",		path:"vrm/ayame.vrm",				visible:true, add:false },
	{ name:"karin",		path:"vrm/karin.vrm",				visible:true, add:false },
	{ name:"enemy00",	path:"vrm/enemy00.vrm",				visible:true, add:false },
	{ name:"enemy10",	path:"vrm/enemy10.vrm",				visible:true, add:false },

	{ name:"emily",		path:"vrm/emily.vrm",				visible:false,add:false },
	{ name:"tsumugi",	path:"vrm/tsumugi.vrm",				visible:false,add:false },
	{ name:"tomoka",	path:"vrm/tomoka.vrm",				visible:false,add:false },
	{ name:"kumo",		path:"model/kumo.pmx",				visible:false,add:false },
	{ name:"momoko",	path:"vrm/momoko.vrm",				visible:false,add:false },

	{ name:"hotaru",	path:"vrm/hotaru.vrm",				visible:false,add:false },
];

var tex_list = new Array();

var texFiles = [
//	"stage/maptex2.png",
	"texture/mapchip.png",
	"texture/hiteffect.png",
	"texture/whitefade.png",
	"texture/lineeffect.png",
	"texture/marukage.png",
	"texture/sand.png",
	"texture/mountain.png",
	"texture/circle.png",
	"texture/break.png",
	"texture/water.png",
	"texture/waternormals.jpg",
	"texture/fire.png",
	"texture/shuriken.png",
	"texture/thunder.png",
	"texture/explosion.png",
	"texture/cure.png",
	"texture/powerup.png",
	"texture/defence.png",
	"texture/punch.png",
	"texture/special1.png",
	"texture/attackeff.png",
	"texture/slash.png",
	"texture/slash2.png",
	"texture/smoke.png",
	"texture/sakura.png",
	"texture/stun.png",
	"texture/ofuda.png",
	"texture/quake.png",
	"texture/susuki.png",

	"texture/tree_spring.png",
	"texture/tree_summer.png",
	"texture/tree_autumn.png",
	"texture/tree_winter.png",
//	"stage/fiveTone.jpg",
	"texture/fbx_itembox.jpg",
];

//canvas用
var iconFiles = [
	"texture/title_logo.png",
	"texture/makimono.png",
	"texture/sakura.png",
	"texture/title_back.jpg",
	"texture/window.png",
	"texture/button.png",
	"texture/cursor.png",
	"texture/opbg.jpg",
	"texture/xbox_buttons.png",
	"texture/ps_buttons.png",
];


function gtag(){dataLayer.push(arguments);}

/*onload = function()*/{

	init();
	animate();

	window.dataLayer = window.dataLayer || [];

	//ウィンドウの表示・非表示状態をチェック
	document.addEventListener('webkitvisibilitychange', function(){
	if ( document.webkitHidden ) {
		if(isActive && option.sound) sound.pauseAll();
		// 非表示状態
		isActive = 0;

		for(let _code in key) {	//押しっぱなし解除
			key[_code] = false;
		}
	} else {
		if(!isActive && option.sound) sound.restartAll();
		// 表示状態
		isActive = 1;
	}
	}, false);

	
}



function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	let flag;
	if(flag = localStorage.getItem("PerfMode")) {
		GameParam.PerfMode = Number(flag);
	}
	else {
		localStorage.setItem("PerfMode", GameParam.PerfMode);
	}
	if(document.exitPointerLock) {
		let json = localStorage.getItem("Config");
		if(json) {
			GameParam.Config = JSON.parse(json);
		}
		else {
			localStorage.setItem("Config", JSON.stringify(GameParam.Config));
		}
	}
	
	use_shadow = (GameParam.PerfMode != 0);

	// レンダラーを作成
	renderer = new THREE.WebGLRenderer({
		antialias: (GameParam.PerfMode != 0),
	});
	let windowSize = Math.max(window.innerWidth, window.innerHeight);
	let pixelRate = window.devicePixelRatio;
	pixelRate = (GameParam.PerfMode == 0) ? 0.75 : 1;	//解像度が高い端末だとやたら重い
	renderer.setPixelRatio(pixelRate);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = true;
//	renderer.gammaOutput = true;
//	renderer.outputEncoding = THREE.GammaEncoding;//THREE.sRGBEncoding;	//なんか白っぽくなる
	if(use_shadow) {
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	}
	
	// シーンを作成
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffffff );
	GameParam.scene = scene;

	world_view = new THREE.Object3D();
	// カメラを作成
	camera = new THREE.PerspectiveCamera(	//(視野角, アスペクト比, near, far)
		50,	//FOV
		window.innerWidth / window.innerHeight,
		0.5,
		(GameParam.PerfMode == 0) ? 150 : 1500,
	);
	GameParam.world_view = world_view;

	// 平行光源
	directionalLight = new THREE.DirectionalLight(
		0x808080, 1.5
	);
	sun_position.set(20,20,20);
//	sun_position.normalize();
	directionalLight.position.copy(sun_position);
	// シーンに追加
	scene.add(directionalLight);

	//アンビエントの強度を上げてポイントライトの強度を下げると影が薄くなる
	ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
	scene.add(ambientLight);

	if(use_shadow){
		var light = directionalLight;
//		var light = pointLight;
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width  = 1024*3;		// default
		light.shadow.mapSize.height = 1024*3;		// default
		/*light.shadow.camera.near = 0.5;    // default
		light.shadow.camera.far = 100;     // default
		*/
		let sc1 = -50;
		let sc2 = 50;
		light.shadow.camera.left   = sc1;		//有効範囲
		light.shadow.camera.top    = sc1;
		light.shadow.camera.right  =  sc2;
		light.shadow.camera.bottom =  sc2;

		if(debug) {
			//cameraHelper = new THREE.CameraHelper(light.shadow.camera);
			//scene.add(cameraHelper);
		}
	}
	
	scene.fog = new THREE.Fog(0x0, 5,100);
	camera.position.set(0,0,0);
	camera.lookAt(new THREE.Vector3(0,0,-20));
//	scene.add(camera);

	load_seq = 0;
	load_progress = 0;

	// モデルとモーションの読み込み準備
	file_loader = new FileLoader();
	mmd_loader = new MMDLoader();
	fbx_loader = new FBXLoader();
	vrm_loader = new GLTFLoader();
	x_loader   = new XLoader();
	obj_loader = new OBJLoader();
	load_manager = new LoadingManager();
	helper = new MMDAnimationHelper( {
		afterglow: 2.0
	} );

	vrm_loader.crossOrigin = 'anonymous';

	//物理
	physics = new CannonPhysics();
	
	container.appendChild( renderer.domElement );
	if(debug) {
		stats = new Stats();
		container.appendChild( stats.dom );
//		gui = new GUI();
	}
	
	for(let i=0;i<iconFiles.length;i++) {
		image_icons[i] = new Image();
		image_icons[i].src = iconFiles[i];
		image_icons[i].onload = function() {};
	}
	
	canvas_init(true);

	GameParam.user = new UserData();
	
	//メニュー
	menu = new Menu(
		{
			GameParam:GameParam,
			sound:sound,
			Input:Input,
			InputOnes:InputOnes,
//			image_icons:image_icons,
			MenuScale : MenuScale,
		}
	);
	menu.setCanvas({menu:canvas_menu, minimap:null, minimap_walk:null}, MenuScale);

	SoundSW(0);
	if(flag = localStorage.getItem("sound")) {
		if(flag == "true") {
			SoundSW(1);
		}
	}

	sound.load();

}	//init()

//2D表示物用のcanvasを作る
var container_2d = null;
var ui_needsUpdate = false;


function canvas_init(first) {

	//初回
	if(first) {
		//2Dcanvas（画面全体を等倍解像度のcanvasで覆う）
		container_2d = document.createElement( 'div' );
		container_2d.style.position = "absolute";
		container_2d.style.background = "transparent";
		container_2d.style.zIndex = 1;
		container_2d.style.left = 0;
		container_2d.style.top = 0;
		document.body.appendChild(container_2d);

		canvas_ui = document.createElement("canvas");
		canvas_ui.width  = 1024;
		canvas_ui.height = 1024;
		canvas_ui2 = document.createElement("canvas");
		canvas_ui2.width  = 512;
		canvas_ui2.height = 512;

		canvas_2d = document.createElement("canvas");
		container_2d.appendChild(canvas_2d);

		canvas_menu = document.createElement("canvas");
	}
	MenuScale = Math.min(Math.max(window.innerWidth, window.innerHeight) / 1024, 1.5);
	canvas_menu.width  = 1200*MenuScale;
	canvas_menu.height = canvas_menu.width/16*9;

	//ウィンドウサイズが変わるごとに更新
	canvas_2d.width  = window.innerWidth;
	canvas_2d.height = window.innerHeight;

	//memo	canvas_2dは環境（ウィンドウサイズ）によって変化するため、フォントなど直接サイズを指定して描画するのは非推奨
	//		必ず別の固定サイズのcanvas上に描画して、スケーリングしてからcanvas_2dに描くこと
	
	ui_needsUpdate = true;

	if(menu != null) {
		menu.setCanvas({menu:canvas_menu, minimap:canvas_minimap, minimap_walk:canvas_minimap_walk}, MenuScale);
	}
	if(event != null) {
		event.setCanvas({menu:canvas_menu, main:canvas_2d}, MenuScale);
	}
}
function drawPadButton(name, x, y) {
}
function drawFont(context,text,x,y,color) {
	menu.drawFont(context,text,x/MenuScale,y/MenuScale,color);
}
function drawWindow(context, lx,ly,rx,ry, color, line_color, thin) {
	menu.drawWindow(context, lx/MenuScale,ly/MenuScale,rx/MenuScale,ry/MenuScale, color, line_color, thin);
}

var short_time = 0;
var short_msg = new Array();
function setShortMessage(str, add) {
	short_time = 180;
	ui_needsUpdate = true;

	if(short_msg.length > 0 && add != undefined) {
		let last = short_msg[short_msg.length-1];
		if(last.indexOf(str) == 0) {
			//文面が同じなら修正して+1する
			let idx = last.lastIndexOf("+");
			let num = 1;
			if(idx >= 0) {
				num = Number(last.slice(idx+1));
			}
			num += add;
			short_msg.pop();
			short_msg.push(str+" +"+num);
			return;
		}
	}

	if(short_msg.length >= 4) short_msg.shift();
	short_msg.push(str);
}

function drawUI() {

	//画面上
	let context_ui = canvas_ui.getContext('2d');
	let player = getPlayableChara();
	context_ui.clearRect(0,0,canvas_ui.width,canvas_ui.height);

	//最初にLifeを描画
	let y1 = 10;
	let y2 = 10 + canvas_ui.height / 4;
	for(let i=0;i<ctex_info.length;i++) {
		let t = ctex_info[i];
		if(!t.enable) continue;
		if(t.type == "life" || t.type == "skill") {
			const chara = t.param3;
			if(!chara.playable) continue;
			if(chara.name == "ayame_clone") continue;
			//プレイヤー用
			let j = 0;
			if(chara.name == "ayame") j = 1;
			else if(chara.name == "karin") j = 2;
			let x = 190*2;
			let w = 300*2;
			let h = 24 *2;
			let f = 18*2;
			if(player != chara) {
//				w = 150;
				h = 12*2;
				f = 12*2;
			}
			context_ui.font = (f)+"px sans-serif";
			if(t.type == "life") {
				//生命力
				context_ui.drawImage(t.canvas, 1,0,t.canvas.width-2,t.canvas.height/2,  x,y1, w,h);

				if(chara.lost > 0)
					drawFont(context_ui,"残り "+Math.floor((GameParam.RecoverTime - chara.lost) / 60), x+10*2,y1-1, "rgb(255,64,64)");
				else
					drawFont(context_ui,chara.life+"/"+chara.life_max, x+5*2,y1-1, "rgb(255,255,255)");

				drawFont(context_ui,Data.CharaName[chara.name], x-context_ui.measureText(Data.CharaName[chara.name]).width-5*2,y1, "rgb(255,255,255)");

				y1 += h+2;
			}
			else {
				x -= 130*2;
				w *= 0.75;
//				h *= 0.75;
				//技力
				context_ui.drawImage(t.canvas, 1,0,t.canvas.width-2,t.canvas.height/2,  x,y2, w,h);

				drawFont(context_ui,chara.skill+"/"+chara.skill_max, x+10*2,y2-1, "rgb(255,255,255)");
				context_ui.drawImage(getCanvasImage("makimono"), 64,0,64,64,  x-f*1.5-4*2,y2-4*2, f*1.5,f*1.5);

				y2 += h+2*2;
			}
		}
	}

	const plate2 = canvas_ui.height / 4 * 1;
	//お守り
	context_ui.font = (20*2)+"px sans-serif";
	context_ui.drawImage(getCanvasImage("makimono"), 0,64,64,64, (390-45)*2,plate2, 48*2,48*2);
	drawFont(context_ui,"x"+GameParam.user.status.amulet,(422-45)*2,plate2+22*2, "rgb(255,255,255)");

	//context_ui.strokeStyle = "rgb(0,0,0)";
	//context_ui.strokeRect(0,plate2,canvas_ui.width-2,canvas_ui.height/4-2);
	
	if(GameParam.GamePause == "") {
	
		let fnt1 = (28)+"px 'M PLUS 1p', sans-serif";
		let fnt2 = (20)+"px 'M PLUS 1p', sans-serif";
		context_ui.font = fnt1;
		//簡易ログ（ショートメッセージ）
		const plate3 = canvas_ui.height / 4 * 2;
		if(short_msg.length != 0) {
			drawWindow(context_ui, 0,plate3+5, 512*1.2,plate3+120*2, "rgba(0,0,0,0.25)");
			for(let i=0;i<short_msg.length;i++) {
				drawFont(context_ui,short_msg[i],25*2,plate3+(i*22+18)*2);
			}
		}
		else if(GameParam.Config.UseItem != 0 /*&& GameParam.BattleMode != 0*/) {
			let x = 40*2;
			let y = plate3 + 5*2;
			const item = GameParam.user.status.item;
			let no;
			let cnt;
			let col;
			const lx = x+65;
			const rx = x+230;
			context_ui.font = fnt2;
			drawFont(context_ui, "道具", lx,y);
			y += 25*2;
			if(item[0] != undefined) {
				menu.drawBtn(context_ui, 'up', x/MenuScale,y/MenuScale, "1");
				cnt = (item[0] != undefined) ? item[0] : 0;
				col = (cnt>0) ? "rgb(255,255,255)":"rgb(128,128,128)";
				context_ui.font = fnt1;
				drawFont(context_ui, "お団子x"+cnt, lx,y+3, col);
				context_ui.font = fnt2;
				drawFont(context_ui, "/ 生命力", rx,y+13, col);
			}
			y += 25*2;
			if(item[3] != undefined) {
				menu.drawBtn(context_ui, 'left', x/MenuScale,y/MenuScale, "2");
				cnt = (item[3] != undefined) ? item[3] : 0;
				col = (cnt>0) ? "rgb(255,255,255)":"rgb(128,128,128)";
				context_ui.font = fnt1;
				drawFont(context_ui, "丸薬　x"+cnt, lx,y+3, col);
				context_ui.font = fnt2;
				drawFont(context_ui, "/ 技力", rx,y+13, col);
			}
			y += 25*2;
			if(item[1] != undefined) {
				menu.drawBtn(context_ui, 'down', x/MenuScale,y/MenuScale, "3");
				cnt = (item[1] != undefined) ? item[1] : 0;
				col = (cnt>0 && GameParam.BattleMode != 0) ? "rgb(255,255,255)":"rgb(128,128,128)";
				context_ui.font = fnt1;
				drawFont(context_ui, "おはぎx"+cnt, lx,y+3, col);
				context_ui.font = fnt2;
				drawFont(context_ui, "/ 攻撃力", rx,y+13, col);
			}
		}
	}
	const plate4 = canvas_ui.height / 4 * 3;
	
	let context_ui2 = canvas_ui2.getContext('2d');
	context_ui2.clearRect(0,0,canvas_ui2.width,canvas_ui2.height);
	//コンボ
	if(GameParam.BattleMode != 0 && GameParam.user.status.combo_hit > 1) {
		const time = GameParam.user.status.combo_time;
		let x = canvas_ui2.width - 200;
		let y = 100;
		let text = GameParam.user.status.combo_hit+"連撃!!";
		let rate = Math.sin(Math.max(1 - time/15, 0) * Math.PI);	//最初=1 おわり=0
		context_ui2.save();
//		context_ui2.font = "30px 'M PLUS 1p', sans-serif";
		context_ui2.font = Math.floor(50 + rate * 10)+"px 'M PLUS 1p', sans-serif";
		context_ui2.lineWidth = 4;
		context_ui2.strokeStyle = "rgb(0,0,0)";
		context_ui2.fillStyle   = "rgb("+Math.floor(192+rate*63)+","+Math.floor(rate*255)+","+Math.floor(rate*255)+")";

		x += -context_ui2.measureText(text).width / 2;
		y += -context_ui2.measureText("A").actualBoundingBoxAscent * 1.38 / 2;
		context_ui2.strokeText(text,x,y);
		context_ui2.fillText(text,x,y);
		context_ui2.restore();
	}
	

	//全消去
	let context_2d = canvas_2d.getContext('2d');
	context_2d.clearRect(0,0,canvas_2d.width,canvas_2d.height);
	//適切なサイズにスケールを調整して配置
	const scl = Math.min(canvas_2d.width / (canvas_ui.width*2), /*canvas_2d.height / canvas_ui.height,*/ 1.2);
	const w = canvas_ui.width  * scl;
	const h = canvas_ui.height * scl;
	const w0 = canvas_ui.width / 1;
	const h4 = canvas_ui.height / 4;

	context_2d.drawImage(canvas_ui, /*src*/ 0,h4*0, w0,h4, /*dst*/(canvas_2d.width)/2-w, 0 + 8, w, h/4);
	context_2d.drawImage(canvas_ui, /*src*/ 0,h4*1, w0,h4, /*dst*/(canvas_2d.width)/2  , 0 + 8, w, h/4);

	if(GameParam.GamePause == "") {	//通常
		context_2d.drawImage(canvas_ui, /*src*/ 0,h4*2, w0,h4, /*dst*/(canvas_2d.width)/2-w, canvas_2d.height - h/4 - 8, w, h/4);
		context_2d.drawImage(canvas_ui, /*src*/ 0,h4*3, w0,h4, /*dst*/(canvas_2d.width)/2  , canvas_2d.height - h/4 - 8, w, h/4);
	}

	//コンボ数
	context_2d.drawImage(canvas_ui2, /*src*/ 0,0, canvas_ui2.width,canvas_ui2.height/2, /*dst*/(canvas_2d.width-canvas_ui2.width), (canvas_2d.height-canvas_ui2.height)/2, canvas_ui2.width,canvas_ui2.height/2);
	
}
function drawMiniMap() {

	let player = getPlayableChara();
	
	const scl2 = 0.2;
	const wh = Math.min(canvas_2d.width, canvas_2d.height) * scl2;
	const x = canvas_2d.width  - wh - 16;
	const y = canvas_2d.height - wh - 16;

	let context_2d = canvas_2d.getContext('2d');
	context_2d.clearRect(x-2, y-2, canvas_minimap_sub.width+4,canvas_minimap_sub.height+4);
	if(GameParam.BattleMode) return;	//戦闘中は消す
	
	const scl = Math.min(image_minimap.width / (GameParam.MapSizeX+1), image_minimap.height / (GameParam.MapSizeZ+1));

	//歩いた領域を塗りつぶす
	let context_walk = canvas_minimap_walk.getContext('2d');
	const sclw = scl * canvas_minimap_walk.width / canvas_minimap.width;
	context_walk.fillStyle = "rgb(255,255,255)";
	context_walk.beginPath();
	context_walk.arc(player.mesh.position.x*sclw,player.mesh.position.z*sclw, 40*canvas_minimap_walk.width / canvas_minimap.width, 0, Math.PI*2);
	context_walk.fill();

	//回転をかけて描画
	let context = canvas_minimap_sub.getContext('2d');
	context.clearRect(0,0,canvas_minimap_sub.width,canvas_minimap_sub.height);
	context.save();
	context.translate(canvas_minimap_sub.width/2, canvas_minimap_sub.height/2);
	context.rotate(GameParam.user.status.cam_rot.y);//player.mesh.rotation.y);
	context.drawImage(canvas_minimap, -player.mesh.position.x*scl,-player.mesh.position.z*scl);
	context.globalCompositeOperation = "destination-in";	//重なったところだけ描画
	context.drawImage(canvas_minimap_walk, -player.mesh.position.x*scl,-player.mesh.position.z*scl, canvas_minimap.width, canvas_minimap.height);
	context.restore();

	//自分の位置
	context.fillStyle = "rgb(255,0,0)";
	context.beginPath();
	context.arc(canvas_minimap_sub.width/2, canvas_minimap_sub.height/2, 4, 0, Math.PI*2);
	context.fill();

	//描画反映
	context_2d.fillStyle = "rgba(0,0,0,0.33)";
	context_2d.fillRect(x, y, wh,wh);
	context_2d.drawImage(canvas_minimap_sub, x, y, wh,wh);
	context_2d.lineWidth = 1;
	context_2d.strokeStyle = "rgba(0,0,0,1)";
	context_2d.strokeRect(x, y, wh-1,wh-1);
}


function drawMenuTop(bg) {
	const scl = Math.min(canvas_2d.width / canvas_menu.width, canvas_2d.height / canvas_menu.height, 2);
	const w = canvas_menu.width  * scl;
	const h = canvas_menu.height * scl;

	menu.setRect((canvas_2d.width-w)/2,(canvas_2d.height-h)/2, w,h);
	menu.draw();

	let context = canvas_2d.getContext('2d');
	context.fillStyle = "rgb(0,0,0,0.75)";
	context.clearRect(0,0,canvas_2d.width,canvas_2d.height);
	if(bg == undefined || bg == true) {
		context.fillRect((canvas_2d.width-w)/2,(canvas_2d.height-h)/2, w,h);
	}
	context.drawImage(canvas_menu, (canvas_2d.width-w)/2,(canvas_2d.height-h)/2, w,h);

}


function createMiniMap() {
	if(canvas_minimap == null) {
		canvas_minimap = document.createElement("canvas");
		canvas_minimap.width  = 512;
		canvas_minimap.height = 512;

		canvas_minimap_sub = document.createElement("canvas");	//実際に表示する領域（トリミング後）
		canvas_minimap_sub.width  = 256;
		canvas_minimap_sub.height = 256;

		canvas_minimap_walk = document.createElement("canvas");	//歩いた領域（合成に使う）
		canvas_minimap_walk.width  = 256;
		canvas_minimap_walk.height = 256;
		
		let context = canvas_minimap.getContext('2d');
		image_minimap = context.createImageData(512,512);
		
		menu.setCanvas({menu:canvas_menu, minimap:canvas_minimap, minimap_walk:canvas_minimap_walk}, MenuScale);
	}
	else {
		let context = canvas_minimap_walk.getContext('2d');
		context.clearRect(0,0,canvas_minimap_walk.width,canvas_minimap_walk.height);
	}
	if(terrain_data == null) return;
	let context = canvas_minimap.getContext('2d');
	let img = image_minimap;
	const scl = Math.min(img.width / (GameParam.MapSizeX+1), img.height / (GameParam.MapSizeZ+1));
//	context.clearRect(0,0,img.width,img.height);
	context.clearRect(0,0,canvas_minimap.width,canvas_minimap.height);

	//全体を作成
	for(let py=0;py<img.height;py+=1) {
		for(let px=0;px<img.width;px+=1) {
			let x = Math.floor(px/scl);
			let y = Math.floor(py/scl);
			/*if(x < GameParam.MapSizeX && y < GameParam.MapSizeZ)*/ {
				let s = (x + y * (GameParam.MapSizeX+1));
				let d = (px + py * img.width) * 4;
				let r=0,g=0,b=0;
				if(terrain_data[s] == null) continue;
				if(terrain_data[s].kind == undefined) continue;
				if(terrain_data[s].height < 0) {	//水
					r = 64;
					g = 255;
					b = 255;
				}
				/*else if(terrain_data[s].item) {
					r = 0;
					g = 0;
					b = 0;
				}*/
				else if((terrain_data[s].kind & 3) == 3) {	//岩
					let h = (terrain_data[s].height - 0) / 30;
					if(h < 0) h = 0;
					if(h > 1) h = 1;
					h = Math.floor(h*8)/8;
					r = 128 + 127*h;
					g = r;
					b = r;
				}
				else {
					const snd = Math.floor(terrain_data[s].sand*5)/5;;
					r = 192 * (snd) + 32  * (1-snd);
					g = 224 * (snd) + 255 * (1-snd);
					b = 32;
				}
				img.data[d++] = r;
				img.data[d++] = g;
				img.data[d++] = b;
				img.data[d++] = 255;
			}
		}
	}
	context.putImageData(img, 0, 0);
	
	//配置物（アイテム）を書き込む
	let item_id = 0;
	let enemy_id = 0;
	let drop_id = 0;
	for(let y=0;y<=GameParam.MapSizeZ;y+=1) {
		for(let x=0;x<=GameParam.MapSizeX;x+=1) {
			let x2 = (x*scl);
			let y2 = (y*scl);
			let i = x  + y  * (GameParam.MapSizeX+1);
			let drawC = 0;
			let param = (terrain_data[i].item >> 8);
			switch(terrain_data[i].name) {
			case "tree":	//樹木
				context.fillStyle = "rgb(16,160,16)";
				drawC = 3*scl;
				break;
			case "bamboo":	//竹
				context.fillStyle = "rgb(16,160,16)";
				drawC = 1.5*scl;
				break;
			case "bridge":	//橋
				{
					let ax = (param % (GameParam.MapSizeX+1));
					let ay = Math.floor(param / (GameParam.MapSizeX+1));
					context.lineWidth = 3*scl;
					context.strokeStyle = "rgb(192,128,0)";
					context.beginPath();
					context.moveTo(x2,y2);
					context.lineTo(ax*scl,ay*scl);
					context.closePath();
					context.stroke();
				}
				break;
			case "itembox":	//宝箱
				if(GameParam.user.status.gotitem[ GameParam.user.status.mapno ].includes(item_id)) {
					item_id++;
					break;
				}
				item_id++;
				context.lineWidth = 1;
				context.strokeStyle = "rgb(64,64,0)";
				context.beginPath();
				context.arc(x2, y2, 1*scl+1, 0, Math.PI*2);
				context.stroke();

				context.fillStyle = "rgb(255,255,0)";
				drawC = 1*scl;
				break;
			case "house":	//民家
				context.fillStyle = "rgb(192,64,64)";
				context.fillRect(x2-5*scl, y2-5*scl, 10*scl,10*scl);
				break;
			case "enemy":	//敵
				if(GameParam.user.status.enemy_flag[ GameParam.user.status.mapno ].includes(enemy_id)) {
					//発見済みなら×をつける
					context.strokeStyle = "rgb(192,0,0)";

					context.lineWidth = 1;
					context.beginPath();
					context.moveTo(x2-3, y2-3);
					context.lineTo(x2+3, y2+3);
					context.closePath();
					context.stroke();

					context.beginPath();
					context.moveTo(x2+3, y2-3);
					context.lineTo(x2-3, y2+3);
					context.closePath();
					context.stroke();

					context.beginPath();
					context.arc(x2, y2, GameParam.EncountArea*scl/2, 0, Math.PI*2);
					context.stroke();
				}
				enemy_id++;
				break;
			case "move":	//移動
//				context.fillStyle = "rgb(192,64,64)";
//				context.fillRect(x2-5*scl, y2-5*scl, 10*scl,10*scl);
				context.font = "bold "+(7*scl)+"px 'M PLUS 1p', sans-serif";

				context.fillStyle = "rgb(0,0,0)";
				const mapno = ((param>>16) & 0xff);
				if(GameParam.user.status.mapno < mapno)
					context.fillText("次",x2-5,y2+5);
				else
					context.fillText("戻",x2-5,y2+5);
				break;
			}
			if(drawC) {
				context.beginPath();
				context.arc(x2, y2, drawC, 0, Math.PI*2);
				context.fill();
			}
		}
	}
}
function drawFade(clear) {
	let context = canvas_2d.getContext('2d');
	if(clear) context.clearRect(0,0, canvas_2d.width, canvas_2d.height);
	context.fillStyle = "rgba(0,0,0,"+(fade_count/GameParam.FadeTime)+")";
	context.fillRect(0,0, canvas_2d.width, canvas_2d.height);
}
function fadeOut(func) {
	GameParam.GamePause = "fadeout";
	fadeout_function = func;
}
function fadeIn(func) {
	fade_count = GameParam.FadeTime;
	GameParam.GamePause = "fadein";
	fadein_function = func;
}
function drawGameOver() {
	const context = canvas_2d.getContext('2d');
	const x = canvas_2d.width/2;
	const y = canvas_2d.height/2;
	const size = Math.min(x,y) * 0.2;
	const fontSize = Math.floor(size/3+1);

//	context.clearRect(0,0,canvas_2d.width,canvas_2d.height);

	context.font = fontSize+"px 'M PLUS 1p', sans-serif";
//	const str = "ゲームコンローラーのボタンorENTERを押してください";
	const str = "その後、珠美達の姿を見たものはいなかった…";
	drawFont(context, str, x-context.measureText(str).width/2,y, "rgb(255,255,255)");
}
function drawGameEnd() {
	const context = canvas_2d.getContext('2d');
	const x = canvas_2d.width/2;
	const y = canvas_2d.height/2;
	const size = Math.min(x,y) * 0.2;
	const fontSize = Math.floor(size/4+1);

	context.font = fontSize+"px 'M PLUS 1p', sans-serif";
	const str = "可惜夜月たちの運命やいかに！？\n\n"+
				"（体験版はここまでです。ありがとうございました。\n"+
				"　バランス調整とエンディングまで含めた完全版は\n"+
				"　５末～６月のリリースを予定しております）";
	drawFont(context, str, x-size*1.4*2,y, "rgb(255,255,255)");
}

/*function getBodyParam(name) {
	for(var i=0;i<body_list.length;i++) {
		if(body_list[i].name == name) {
			return body_list[i];
		}
	}
	return null;
}*/

//画面全体の色替え（戦闘時など）
function setAmbientColor(dark) {
	let fc = 0.9 * (1-dark) + 0.1 * (dark);
	scene.fog.color.setRGB(fc,fc,fc);
	scene.fog.near = GameParam.BattleArea*0.75;
	scene.fog.far  = 150 * (1-dark) + 20 * dark;

	const c = (1-dark) * 0.666 + (dark) * 0.333;
	if(GameParam.mesh.terrain) {
		GameParam.mesh.terrain.material.color.setRGB(c,c,c);
	}
	if(GameParam.mesh.weed) {
		GameParam.mesh.weed.material.color.setRGB(c,c,c);
	}

	GameParam.mesh.items.visible = (dark < 0.5);
	getMesh("skydome").visible = (dark < 0.5);

//	const bg = (1-dark) * 0.666 + (dark) * 0.15;
//	scene.background.setRGB( bg,bg,bg * 1.5 );
	const bg = (1-dark) * 1 + (dark) * 0.15;
	scene.background.setRGB( bg,bg,bg );
}

function InitUI()
{
	{
		//スマホ対応
		window.addEventListener('touchstart', function(event) {
			if(isUIAreaTouch(event)) {
				return;
			}
			event.preventDefault();
//			document.getElementById("debugOut").innerHTML = "touch down="+event.touches.length+" <br>";
			if(event.changedTouches.length == 1) {
				onTouchDown(event, event.changedTouches[0].clientX, event.changedTouches[0].clientY, true);
			} else {
				onTouchDown2(event);
			}
		}, {passive: false});
		window.addEventListener('touchmove', function(event) {
			if(isUIAreaTouch(event)) {
				return;
			}
//			document.getElementById("debugOut").innerHTML = "touch move="+event.changedTouches.length+" <br>";
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
	}
	{
		//ブラウザ
		document.addEventListener('mousedown', mousedown, false );
		document.addEventListener('mouseup', mouseup, false );
		document.addEventListener('mousemove', mousemove, false );
		document.addEventListener('wheel', mousewheel, false );
		document.addEventListener('keydown',keydown, false);
		document.addEventListener('keyup',keyup, false);
		document.addEventListener('keypress',keypress, false);
		
		document.addEventListener('contextmenu', function(e){e.preventDefault();}, true);	//右クリックメニューを封じる

		//ポインタロック通知
		if ("onpointerlockchange" in document) {
			document.addEventListener('pointerlockchange', lockChangeNotify, false);
		} else if ("onmozpointerlockchange" in document) {
			document.addEventListener('mozpointerlockchange', lockChangeNotify, false);
		}
	}
	window.addEventListener( 'resize', onWindowResize, false );

//	SoundSW(0);
	document.getElementById( 'Sound' ).addEventListener( 'click', function(){SoundSW(1);} );
//	document.getElementById( 'Pause' ).addEventListener( 'click', function(){PauseSW(1);} );
//	document.getElementById( 'Option' ).addEventListener( 'click', function(){OptionWindowDisp(!isOption);} );
	document.getElementById( 'FullScreen' ).addEventListener( 'click', function(){FullScreenSW();} );

	document.getElementById( 'Sound' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "サウンド";} );
//	document.getElementById( 'Pause' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "ポーズ";}  );
//	document.getElementById( 'Option' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "オプション";} );
	document.getElementById( 'FullScreen' ).addEventListener( 'mouseover', function(e){document.getElementById("ui_caption").innerHTML = "全画面";} );

	if(enabledFullScreen()) {
		document.getElementById( 'FullScreen' ).style.display = "";
	}
}


function animate() {
	if(isActive) {
//		renderer.setAnimationLoop( render );
		requestAnimationFrame( animate );

	var delta = clock.getDelta();
	if(!isActive) return;

	InputUpdate(delta/(1/60));
	let upd = 1;
	if(LoadingUpdate(delta)) {
		//if(PauseFlag == 0) {
			upd = gameUpdate(delta);
		//}
	}
	ms_click = 0;

//	if(upd)
	renderer.render(scene, camera);

	if(debug && stats) {
		stats.update();
	}
	}
}
function onProgressMdl( xhr ) {
	if ( xhr.lengthComputable ) {
		load_progress = (xhr.loaded / xhr.total);
//		console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
	}
}

var promise = null;

function drawTitleLogo(context, x,y,scale) {
	const timg = getCanvasImage("title_logo");
	const tw = timg.width;
	const th = timg.height;

	const size = Math.min(x,y) * 0.2 * scale;
	let asp,size2;
	//可惜夜月
	asp = (tw*0.75)/(th*0.375);
	size2 = size*1.5;
	context.drawImage(timg, tw*0,th*0,tw*0.75,th*0.375, x-size2*asp/2, y-size2*2.0, size2*asp,size2 );

	//VS
	asp = (tw*0.375)/(th*0.4375);
	size2 = size*1.5;
	context.drawImage(timg, tw*0.0,th*0.375,tw*(0.375),th*0.4375, x-size2*asp/2, y-size2*1.35, size2*asp,size2 );

	//花咲夜
	asp = (tw*(1-0.375))/(th*0.375);
	size2 = size*1.5;
	context.drawImage(timg, tw*0.375,th*0.375,tw*(1-0.375),th*0.375, x-size2*asp/2, y-size2*0.75, size2*asp,size2 );

	//時代活劇
	asp = (tw*0.3125)/(th*(1-0.8125));
	size2 = size*0.5;
	context.drawImage(timg, tw*0.0,th*0.8125,tw*(0.3125),th*(1-0.8125), x-size*1.15*asp, y-size*(2.0+1.5), size2*asp,size2 );

	//六花双輪
	asp = (tw*0.3125)/(th*(1-0.8125));
	size2 = size*0.75;
	context.drawImage(timg, tw*0.375,th*0.8125,tw*(0.3125),th*(1-0.8125), x-size2*asp/2, y+size2*0.75, size2*asp,size2 );

	const str = "体験版";
	drawFont(context, str, x-context.measureText(str).width/2,y+size2*1.6, "rgb(255,255,255)");
}

function LoadingUpdate(delta)
{

	//ロード～タイトル背景
	if(load_seq >= 0 && load_seq < 30) {
		const context = canvas_2d.getContext('2d');
		const x = canvas_2d.width/2;
		const y = canvas_2d.height/2;
		const size = Math.min(x,y) * 0.2;
		context.clearRect(0,0,canvas_2d.width,canvas_2d.height);
		//背景
		const title_img = getCanvasImage("title_back");
		if(title_img != null) {
//			const x2 = title_img.width;
//			const y2 = title_img.height;
			const asp1 = canvas_2d.width / canvas_2d.height;
			const asp2 = 1.5;
			if(asp1 > asp2) {	//横長（左右に合わせる）
				let x3 = canvas_2d.width;
				let y3 = canvas_2d.width / asp2;
				context.drawImage(title_img, (x-x3/2),(y-y3/2), x3,y3);
			}
			else {	//縦長（上下に合わせる）
				let x3 = canvas_2d.height * asp2;
				let y3 = canvas_2d.height;
				context.drawImage(title_img, (x-x3/2),(y-y3/2), x3,y3);
			}
		}
	}

	switch(load_seq) {
	case 0:
	{
		let cnt = sound.loadCount();
		load_progress2 = 0 + cnt;
		if(cnt == 1.0) {
			load_seq++;
		}
		break;
	}
	case 1:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				tex_list.push( new THREE.TextureLoader().load(texFiles[tex_list.length]) );
				load_progress = 0;
				resolve();
			});
		}
		load_progress2 = 1 + (tex_list.length + load_progress)/texFiles.length;
		promise.then(function(value) {
			if(tex_list.length >= texFiles.length) {
				load_seq++;
				//count = 0;
			}
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
				if(objInfo[obj_mesh.length].path.indexOf(".pmx") > 0
				|| objInfo[obj_mesh.length].path.indexOf(".pmd") > 0) {
					mmd_loader.load( objInfo[obj_mesh.length].path, function ( mmd ) {
						switch(objInfo[obj_mesh.length].name) {
						case "beam":
						case "ice":
						case "attackeff":
							break;
						case "kumo":
							helper.add( mmd, {
								physics: false,
								ik:true,
							} );
//							helper.enable( 'ik', true );
							convertLambertMaterial(mmd,true);
							break;
						case "bamboo":
						case "tree":
						case "web":
							findMaterial(mmd,function(mat){mat.side = THREE.DoubleSide;});
						default:
							convertLambertMaterial(mmd,true);
							break;
						}
						mmd.scale.set(0.1,0.1,0.1);
						obj_mesh.push(mmd);
						resolve();
					}, onProgressMdl, null );
				}
				else if(objInfo[obj_mesh.length].path.indexOf(".vrm") > 0) {
					
					vrm_loader.load(

						// URL of the VRM you want to load
						objInfo[obj_mesh.length].path,

						// called when the resource is loaded
						( gltf ) => {
							THREE.VRMUtils.removeUnnecessaryJoints( gltf.scene );

							// generate a VRM instance from gltf
							THREE.VRM.from( gltf, /*{

								materialImporter: new THREE.VRMMaterialImporter( {

									// specifies input colorspace
									encoding: THREE.sRGBEncoding//THREE.sRGBEncoding

								} )

							}*/ ).then( ( vrm ) => {

								// add the loaded vrm to the scene
								org_vrm[obj_mesh.length] = vrm;
								obj_mesh.push( vrm.scene );
								convertVRMMaterial(vrm.scene, true);
								vrm.materials = null;	//使わないので消す

								if(obj_mesh.length==12) {
									vrm.springBoneManager.springBoneGroupList.splice(1,1);	//揺れ消去
								}
								resolve();
								use_vrm = true;

								// deal with vrm features
//								console.log( vrm );
							} );

						},

						// called while loading is progressing
//						( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),
						( progress ) => onProgressMdl( progress ),
						

						// called when loading has errors
//						( error ) => console.error( error )
						( error ) => reject()

					);
				}
				else if(objInfo[obj_mesh.length].path.indexOf(".fbx") > 0) {
					fbx_loader.load( objInfo[obj_mesh.length].path, function ( fbx ) {
						obj_mesh.push(fbx);
						convertFBXMaterial(fbx);
						fbx.scale.set(0.01,0.01,0.01);
						resolve();
					}, onProgressMdl, function(e){reject()} );
				}
				/*else if(objInfo[obj_mesh.length].path.indexOf(".obj") > 0) {
					new MTLLoader( load_manager )
						.setPath( 'model/'+objInfo[obj_mesh.length].name+'/' )
						.load( objInfo[obj_mesh.length].name+'.mtl', function ( materials ) {

							materials.preload();

							obj_loader
								.setMaterials( materials )
								.setPath( 'model/'+objInfo[obj_mesh.length].name+'/' )
								.load( objInfo[obj_mesh.length].name+'.obj', function ( obj ) {

									obj_mesh.push(obj);
									resolve();

								}, onProgressMdl, function(e){reject()} );

						} );
				}*/
				/*else if(objInfo[obj_mesh.length].path.indexOf(".x") > 0) {	//△ポリゴンでないと機能しない
					x_loader.load( [objInfo[obj_mesh.length].path, { putPos: false, putScl: false }], function ( dx ) {
						var modelRoot;
						if(dx.models.length >= 1) {
							modelRoot = new THREE.Object3D();
							for(var i=0;i<dx.models.length;i++) {
								dx.models[i].scale.x *= -1;
								modelRoot.add(dx.models[i]);
							}
						}
						else {
							modelRoot = dx.models[0];
						}
						obj_mesh.push(modelRoot);
						resolve();
					}, onProgressMdl, null );
				}*/
				else {
					console.log("unknown filetype");
				}
			});
		}
		load_progress2 = 2 + (obj_mesh.length + load_progress)/objInfo.length * 3;
		promise.then(function(value) {
			if(obj_mesh.length >= objInfo.length) {
				load_seq = 4;
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
				file_loader.setResponseType('json');
				file_loader.load(
					'motion/'+animFiles[animation_list.length]+'.json',
					function(data) {
						animation_list.push(
							{
								name: animFiles[animation_list.length],
								data: data,
							}
						);
						resolve();
					});
			});
		}
		load_progress2 = 5;
		promise.then(function(value) {
			if(animation_list.length >= animFiles.length) {
				load_seq = 7;
			}
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	/*case 5:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				file_loader.setResponseType('json');
				file_loader.load(
					'mountain.json',
					function(data) {
						mountain_data = data;
						resolve();
					});
			});
		}
		promise.then(function(value) {
			load_seq = 6;
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}*/
	/*case 6:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				file_loader.setResponseType('json');
				file_loader.load(
					'map4.json',
					function(data) {
						if(data.SizeX == undefined) {
							terrain_data = data;
						}
						else {
							GameParam.MapSizeX = data.SizeX;
							GameParam.MapSizeZ = data.SizeZ;
							terrain_data = data.terrain;
						}
						resolve();
					});
			});
		}
		load_progress2 = 5;
		promise.then(function(value) {
			load_seq = 7;
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}*/
	case 7:
	{
		if(promise == null) {
			promise = new Promise(function(resolve, reject) {
				load_progress = 0;
				var i;

				//落下地点（デバッグ用）
				if(debug && 0) {
					var geometry = new THREE.SphereBufferGeometry( GameParam.AtariSize, 8,8 );
					debug_obj1 = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0xff0000} ) );
					debug_obj2 = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {color: 0x0000ff} ) );
					debug_obj1.castShadow = true;
					debug_obj2.castShadow = true;
					world_view.add(debug_obj1);
					world_view.add(debug_obj2);
//					debug_obj1.position.y = getGround(0.1,0.1) + 35;
					GameParam.debug_obj1 = debug_obj1;
					GameParam.debug_obj2 = debug_obj2;
				}
				setMaterialFogDisable(getMesh("skydome"), false);
				getMesh("skydome").position.y -= 80;

				//ロードが終わってからメッシュの追加
				for(i=0;i<obj_mesh.length;i++) {
					obj_mesh[i].name = objInfo[i].name;
					obj_mesh[i].visible = objInfo[i].visible;
					if(objInfo[i].add) {
						world_view.add( obj_mesh[i] );
					}
				}


				//戦闘・キャラ
				btl = new Battle({
					GameParam:GameParam,
					physics:physics,
					animation_list:animation_list,
					sound:sound,
				});

				//イベント
				event = new Event(
					{
						GameParam:GameParam,
						sound:sound,
						Input:Input,
						InputOnes:InputOnes,
						Battle:btl,
						Menu:menu,
						MenuScale : MenuScale,
					}
				);
				event.setCanvas({menu:canvas_menu, main:canvas_2d}, MenuScale);

				//戦闘領域
				console.groupCollapsed();
				{
					var shape_vertices = new Array();
					var shape_indices = new Array();
					const max = 15;
					for(let i=0;i<max;i++) {
						let r = i / (max-1) * Math.PI*2;
						let x = Math.sin(r) * GameParam.BattleArea / 2;
						let z = Math.cos(r) * GameParam.BattleArea / 2;
						shape_vertices.push(new CANNON.Vec3(x, 8,z));
						shape_vertices.push(new CANNON.Vec3(x,-3,z));
						if(i<max-1) shape_indices.push([i*2+0, i*2+2, i*2+3, i*2+1]);
					}
					let shape = new CANNON.ConvexPolyhedron(shape_vertices, shape_indices);
					battle_area = physics.addBody( shape, 0/*mass*/, new CANNON.Material("wall"), 0/*group*/, 7/*mask*/ );
					/*battle_mesh.add(btl.Utility().shape2mesh({
						body: battle_area,
						color: 0xffffff,
					}));*/

					let geometry = new THREE.BufferGeometry();
					var vertices = new Float32Array(max*6 + 3);
					var indices  = new Uint16Array((max-1)*6 + (max-1)*3);
					let iv = 0;
					let ii = 0;
					for(let i=0;i<max;i++) {
						vertices[iv++] = shape_vertices[i*2+0].x*8;
						vertices[iv++] = 50;
						vertices[iv++] = shape_vertices[i*2+0].z*8;
						vertices[iv++] = shape_vertices[i*2+1].x;
						vertices[iv++] = 0;
						vertices[iv++] = shape_vertices[i*2+1].z;
						if(i < max-1) {
							indices[ii++] = i*2+0;
							indices[ii++] = i*2+1;
							indices[ii++] = i*2+2;
							indices[ii++] = i*2+3;
							indices[ii++] = i*2+2;
							indices[ii++] = i*2+1;
						}
					}
					vertices[iv++] = 0;
					vertices[iv++] = 50;
					vertices[iv++] = 0;
					//蓋
					for(let i=0;i<max-1;i++) {
						indices[ii++] = iv/3-1;
						indices[ii++] = (i+0)*2;
						indices[ii++] = (i+1)*2;
					}
					geometry.dynamic = true;
					geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
					geometry.setIndex( new THREE.BufferAttribute( indices , 1 ) );

//					battle_mesh = new THREE.Mesh(new THREE.CylinderGeometry(50,GameParam.BattleArea/2,30,15,1,true).translate(0,15,0), new THREE.MeshBasicMaterial({color:0x404040, side:THREE.BackSide, transparent:true, opacity:0.75}));
					battle_mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color:0x101010, side:THREE.BackSide, transparent:true, opacity:0.85}));
					battle_mesh.visible = false;
					battle_mesh.renderOrder += GameParam.AlphaOrder-1;
					world_view.add(battle_mesh);
				}
				if(!debug) console.clear();
				console.groupEnd()

				stage = new Stage({
					GameParam	: GameParam,
					obj_mesh	: obj_mesh,
				});
				//stage.setTerrain(terrain_data);
				getTexture("mapchip").anisotropy= 1;
				GameParam.stage = stage;
				

				//水面
				{
					GameParam.mesh.water = new THREE.Mesh(
						new THREE.PlaneGeometry(1,1).rotateX(Math.PI/-2),
						new THREE.MeshStandardMaterial( {color:0xffffff, map:getTexture("water"), normalMap:getTexture("waternormals"), transparent:true, opacity:0.66}));
					GameParam.mesh.water.renderOrder += GameParam.AlphaOrder-1;
					world_view.add(GameParam.mesh.water);
				}
				
				//木の当たり判定
				//プレイヤーのまわりだけ動的に配置することでシェイプの数を最小限に
				active_tree = new Array();
				for(let i=0;i<18;i++) {
					const h = 5 * GameParam.HeightScale;
					let shape = new CANNON.Cylinder((i<9)?0.24:0.5, 0.0, h, 8);	//竹
					let body = physics.addBody( shape, 0/*mass*/, new CANNON.Material("tree"), 1/*group*/, 7/*mask*/ );
					body.position.set(0,0,0);
					body.quaternion.setFromEuler(Math.PI/2,0,0,"XYZ");
					active_tree.push( body );
				}

				menu.init();
				
				world_view.add(ctex_group);	//ones

				//mmd_loader = null;
				fbx_loader = null;
				vrm_loader = null;
				x_loader = null;
				vrm_loader = null;
				obj_loader = null;
				
				GameParam.count = 0;

				scene.add(world_view);
				resolve();
			});
		}
		load_progress2 = 6;
		promise.then(function(value) {
			InitUI();		//ロード終わったのでUIの追加
			load_seq = 10;	//タイトル
			sound.play("bgm_title","ONES");
			promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
		break;
	}
	//タイトル画面
	case 10:
		{
			const context = canvas_2d.getContext('2d');
			const x = canvas_2d.width/2;
			const y = canvas_2d.height/2;
			const size = Math.min(x,y) * 0.2;

			let fontSize = Math.floor(size/4+1);
			context.font = fontSize+"px 'Shippori Mincho', sans-serif";

			drawTitleLogo(context, x,y, 1.0);

			const str = "ゲームコンローラーのボタンorENTERを押してください";
			drawFont(context, str, x-context.measureText(str).width/2,y+size*3, "rgb(255,255,255)");

			if(InputOnes.enter || InputOnes.clickL) {
				load_seq++;
				menu.title();
				sound.play("menu_enter");
				GameParam.count=0;
			}
		}
		break;
	//タイトルメニュー
	case 11:
		{
			const context = canvas_2d.getContext('2d');
			let rate = Math.min(++GameParam.count/10, 1.0);
			const x = canvas_2d.width/2;
			const y = canvas_2d.height/2;
			const size = Math.min(x,y) * 0.2;

			context.globalAlpha = 0.5*rate + 1.0*(1-rate);
			drawTitleLogo(context, x+size*0.5*rate,y, 0.75*rate + 1.0*(1-rate));
			context.globalAlpha = 1.0;

			if(menu.update()) {
				//何か決定した
				MouseLockStart();
				load_seq++;
				fadeOut(function(){load_seq++;});
//				sound.stop("ONES");
				sound.stop("menu_enter");
//				sound.play("menu_load");
			}
			else {
				const scl = Math.min(canvas_2d.width / canvas_menu.width, canvas_2d.height / canvas_menu.height, 2);// / MenuScale;
				const w = canvas_menu.width  * scl;
				const h = canvas_menu.height * scl;

				menu.setRect((canvas_2d.width-w)/2,(canvas_2d.height-h)/2, w,h);
				menu.draw();

				context.drawImage(canvas_menu, (canvas_2d.width-w)/2,(canvas_2d.height-h)/2, w,h);
			}
		}
	case 12:
		FadeUpdate(false);
		break;

	case 13:
		FadeUpdate(false);
		if(GameParam.user.status.event_flag["opening"] == undefined) {
			load_seq = 14;
			//専用オープニング処理
			fadeIn(function(){
				openingInit();
				sound.play("bgm_event","FIELD");
			});
		}
		else {
			load_seq = 15;
		}
		break;

	case 14:
		openingUpdate();
		FadeUpdate(false);
		if(debug && Input.L2 && InputOnes.enter) {	//イベント強制終了
			event.setMessage(null);
			load_seq++;
		}
		break;

	case 15:
		//ゲームへ
		FadeUpdate(false);
		load_seq = -1;
		GameParam.count = 0;
		fadeIn(EventStart_Map);
		return true;

	//ゲームオーバー
	case 20:
		if(InputOnes.enter || InputOnes.clickL) {
			load_seq++;
			fadeIn(function(){
				menu.title();
				load_seq = 11;
//				fadeOut(null);
			});
		}

		FadeUpdate(false);

		drawGameOver();
		break;

	//体験版おわり
	case 22:
		if(InputOnes.enter || InputOnes.clickL) {
			load_seq++;
			fadeIn(function(){
				menu.title();
				load_seq = 11;
			});
		}

		FadeUpdate(false);

		drawGameEnd();
		break;

	case 21:
	case 23:
	case 30:
		FadeUpdate(false);
		break;

	case -1:
		return true;
	}
	if(load_seq >= 0 && load_seq < 10) {	//ロードゲージ
		const context = canvas_2d.getContext('2d');
		const x = canvas_2d.width/2;
		let y = canvas_2d.height/2;

//		context.clearRect(0,0,canvas_2d.width,canvas_2d.height);
		let size = Math.min(x,y) * 0.2;

		context.fillStyle   = "rgb(30,30,128)";
		context.beginPath();
		context.arc(x,y, size, 0, (load_progress2/5)*Math.PI*2);
		context.lineTo(x,y);
		context.fill();

		y -= size/8;
		context.fillStyle   = "rgb(80,80,255)";
		context.beginPath();
		context.arc(x,y, size, 0, (load_progress2/5)*Math.PI*2);
		context.lineTo(x,y);
		context.fill();

		context.font = "28px 'M PLUS 1p', sans-serif";
		const str = "読み込み中…";
		
		drawFont(context, str, x-context.measureText(str).width/2,y+size*1.5, "rgb(255,255,255)");
	}
	return false;
}

//オープニングデモ
function openingInit() {
	event.setMessage([
		"今は昔─",
		"この時代にはごくありふれた山奥の農村「スズランの村」",
		"のどかで、飢えや災い、争いもなく、",
		"”決して”不幸が訪れなかったこの村の平穏は終わりを告げる。",
		"",
		"これは呪われた運命を打ち砕く",
		"”アイドルではなかった”少女達の物語。",
	]);

	//初期設定とかここで
	let p;
	p = btl.get("tamami");	/*p.mesh.rotation.y =*/ p.move_dir = Math.PI*2*(0.25);
	p = btl.get("ayame") ;	/*p.mesh.rotation.y =*/ p.move_dir = Math.PI*2*(0.25-0.33);
	p = btl.get("karin") ;	/*p.mesh.rotation.y =*/ p.move_dir = Math.PI*2*(0.25-0.66);
}
function openingUpdate() {
	
	const context = canvas_2d.getContext('2d');
	const x = canvas_2d.width/2;
	const y = canvas_2d.height/2;
	const size = Math.min(x,y) * 0.2;
	context.clearRect(0,0,canvas_2d.width,canvas_2d.height);
	//背景
	const title_img = getCanvasImage("opbg");
	if(title_img != null) {
		const asp1 = canvas_2d.width / canvas_2d.height;
		const asp2 = 16/9;
		if(asp1 > asp2) {	//横長（左右に合わせる）
			let x3 = canvas_2d.width;
			let y3 = canvas_2d.width / asp2;
			context.drawImage(title_img, (x-x3/2),(y-y3/2), x3,y3);
		}
		else {	//縦長（上下に合わせる）
			let x3 = canvas_2d.height * asp2;
			let y3 = canvas_2d.height;
			context.drawImage(title_img, (x-x3/2),(y-y3/2), x3,y3);
		}
	}

	event.drawTelop(270,100, 75);
	if(event.updateTelop()) {
		fadeOut(function(){load_seq++;});
	}
}

//restartGameが呼ばれるまでゲームを止める
let last_seq = -1;
function stopGame() {
	last_seq = load_seq;
	load_seq = 30;
}
function restartGame() {
	load_seq = last_seq;
}

var body_list = null;
function updateStage(stage_mesh) {
	const init = (body_list == null);

	event.setMessage(null);
	
	//宝箱回収情報
	if(GameParam.user.status.gotitem[ GameParam.user.status.mapno ] == undefined) {
		GameParam.user.status.gotitem[ GameParam.user.status.mapno ] = [];
	}
	if(GameParam.user.status.enemy_flag[ GameParam.user.status.mapno ] == undefined) {
		GameParam.user.status.enemy_flag[ GameParam.user.status.mapno ] = [];
	}
	
	//古いmeshをremove
	const remove_list = [
		"terrain","leaf","weed","items","stage","snow","susuki",
	];
	for(let rm of remove_list) {
		if(GameParam.mesh[rm]) {
			world_view.remove(GameParam.mesh[rm]);
			GameParam.mesh[rm] = null;
		}
	}
	btl.clear();
	
	//季節
	const season_str = [
		"spring","summer","autumn","winter","",
	];
	const season_tbl = [
		0,0,0,4,1,1,1,4,4,	//スズラン～ヤマユリ
		1,1,1,4,2,2,2,4,4,	//カタクリ～ススキ
		3,3,3,3,0,0,0,4,4,	//ソバナ～キキョウ
		4,
	];
	let old_season = GameParam.season;
	GameParam.season = season_str[season_tbl[GameParam.user.status.mapno]];

	world_view.position.set(-(GameParam.MapSizeX+1)/2*GameParam.MapScale, 0, -(GameParam.MapSizeZ+1)/2*GameParam.MapScale);
	let is_mesh = false;
	if(stage_mesh == undefined || stage_mesh == null) {
		//地形
		//GameParam.mesh.terrain
		stage.createTerrain();
		//草・落ち葉
		//GameParam.mesh.weed
		//GameParam.mesh.leaf
		stage.createWeed();
	}
	else {
		world_view.add(stage_mesh);
		GameParam.mesh.stage = stage_mesh;
		is_mesh = true;
		stage_mesh.position.set(-world_view.position.x,0,-world_view.position.z);
	}
	//木や宝箱など
	//GameParam.mesh.items
	stage.createItems();

	let wt = GameParam.mesh.water.material.map;
	wt.repeat.set(128,128*GameParam.MapSizeZ/GameParam.MapSizeX);
	wt.wrapT = THREE.RepeatWrapping;
	wt.wrapS = THREE.RepeatWrapping;
	wt.needsUpdate = true;

	GameParam.mesh.water.position.set(-world_view.position.x,0.9+GameParam.WaterLine,-world_view.position.z);
	GameParam.mesh.water.scale.set(GameParam.MapSizeX,1,GameParam.MapSizeZ);

	{
//		const S1 = Math.max(GameParam.MapSizeX, GameParam.MapSizeZ);
//		const S2 = Math.sqrt(S1*S1*2);
		const S2 = Math.sqrt(GameParam.MapSizeX*GameParam.MapSizeX + GameParam.MapSizeZ*GameParam.MapSizeZ);
		GameParam.mesh.mountain.scale.set(S2,S2,S2);
//		GameParam.mesh.mountain.position.set((GameParam.MapSizeX)/2 - GameParam.mesh.mountain.scale.x/4,0,(GameParam.MapSizeZ)/2 - GameParam.mesh.mountain.scale.z/4);
		GameParam.mesh.mountain.position.set((GameParam.MapSizeX)/2,0,(GameParam.MapSizeZ)/2);
	}

	if(GameParam.mesh.snow) {
		GameParam.mesh.snow.position.set(0,0.3,0);
	}
	if(body_list) {
		for(let body of body_list) {
			physics.removeBody(body);
		}
	}
	body_list = new Array();

	//当たり判定
	{
		let field_mat = new CANNON.Material("field");

		//地面
		let map = [];
		for(let y=0;y<GameParam.MapSizeZ;y+=1) {
			map.push([]);
			for(let x=0;x<=GameParam.MapSizeX;x+=1) {
				const t = terrain_data[x+y*(GameParam.MapSizeX+1)];
				let h = t.atari;
				h = h * GameParam.HeightScale - GameParam.WaterLine;
				if(h < 0) h = 0;	//水面
				if(x == 0 || y == 0 || x == GameParam.MapSizeX-1 || y == GameParam.MapSizeZ-1) {	//画面端
					h = 100;
				}
				
				map[y].push(h);
			}
		}
		let shape = new CANNON.Heightfield(map, {elementSize: GameParam.MapScale});	//1要素あたりのピッチ
		let body = physics.addBody( shape, 0/*mass*/, field_mat, 1/*group*/, 7/*mask*/ );
		body.quaternion.setFromEuler(Math.PI*1.5,0,Math.PI*1.5, "XYZ");
		body.position.set(0, GameParam.WaterLine, 0);
		body_list.push(body);

		/*GameParam.world_view.add( btl.Utility().shape2mesh({
			body: body,
			color: 0xa00000,
		}));
	    body.aabbNeedsUpdate = true;	//動かしたら必要
*/
		/*let contact_mat = new CANNON.ContactMaterial(
			chara_mat,	//キャラ
			field_mat,	//地面
			{
			friction:1,		//friction 摩擦
			restitution:0.1,	//restitution 反発
//						contactEquationRelaxation: 0,	// 接触式の緩和性
			frictionEquationRelaxation: 1,	//摩擦式の剛性
			}
		);
		physics.world.addContactMaterial(contact_mat);*/

		/*body.addEventListener("collide", function(e) {
			var contact = e.contact;
			var name1 = contact.bi.material.name;
			var name2 = contact.bj.material.name;
			//キャラと地面
			if(name1 == "chara") {
			}
		});*/
		let dropid = {
			"itembox":0,
			"drop":0,
		};
		drop_items_list = new Array();
		//アイテム当たり
		for(let y=0;y<GameParam.MapSizeZ;y+=1) {
			for(let x=0;x<=GameParam.MapSizeX;x+=1) {
				let item = terrain_data[x+y*(GameParam.MapSizeX+1)].item;
				const name = terrain_data[x+y*(GameParam.MapSizeX+1)].name;
				let param = item >> 8;
				if(name == undefined) continue;
				let h = stage.getHeightf(x+0.5, y+0.5);
				let start = new THREE.Vector3(x+0.5,h * GameParam.HeightScale,y+0.5);
				let itemno = 0;
				switch(name) {
				case "bamboo":	//樹木
				case "tree":	//樹木
				if(0){	//重すぎるのでfieldのほうに入れる
					const h = 5 * GameParam.HeightScale;
//					let shape = new CANNON.Cylinder(0.75,0.0, h, 8);
					let shape = new CANNON.Cylinder(0.25,0.0, h, 8);	//竹
					let body = physics.addBody( shape, 0/*mass*/, new CANNON.Material("tree"), 1/*group*/, 7/*mask*/ );
					body.position.set(start.x, start.y + h/2, start.z);
					body.quaternion.setFromEuler(Math.PI/2,0,0,"XYZ");

					/*GameParam.world_view.add( btl.Utility().shape2mesh({
						body: body,
						color: 0xa00000,
					}));*/
//				    body.aabbNeedsUpdate = true;	//動かしたら必要
					body_list.push(body);
				}
				break;
				case "bridge":	//橋
				{
					let x2 = (param % (GameParam.MapSizeX+1));
					let z2 = Math.floor(param / (GameParam.MapSizeX+1));
					let y2 = terrain_data[x2 + z2*(GameParam.MapSizeX+1)].height;
					let target = new THREE.Vector3(x2,y2 * GameParam.HeightScale / GameParam.MapScale,z2);
					let start2 = new THREE.Vector3(x,start.y / GameParam.MapScale,y);
					let off = target.clone().sub(start2);
					let half = target.clone().add(start2).multiplyScalar(0.5);
					let len = off.length()/2 / GameParam.MapScale;
					let shape = new CANNON.Box(new CANNON.Vec3(2,0.5,len));
					let body = physics.addBody( shape, 0/*mass*/, /*field_mat*/new CANNON.Material("bridge"), 1/*group*/, 7/*mask*/ );
					let matrix = (new THREE.Matrix4()).makeTranslation(half.x, half.y+(0.1-0.5)/GameParam.MapScale, half.z);
					matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).lookAt(start2, target, new THREE.Vector3(0,-1,0)));

					let q = (new THREE.Quaternion()).setFromRotationMatrix( matrix );
					let t = (new THREE.Vector3()).setFromMatrixPosition( matrix );
					body.quaternion.set(q.x, q.y, q.z, q.w);
					t.x = (t.x) * GameParam.MapScale;
					t.y = (t.y) * GameParam.MapScale;
					t.z = (t.z) * GameParam.MapScale;
					body.position.set(t.x, t.y, t.z);
				    body.aabbNeedsUpdate = true;	//動かしたら必要

					/*GameParam.world_view.add( btl.Utility().shape2mesh({
						body: body,
						color: 0xa00000,
					}));*/
					body_list.push(body);
					break;
				}
				case "itembox":	//宝箱
				{
					if(GameParam.user.status.gotitem[ GameParam.user.status.mapno ].includes(dropid[name])) {
						//取得済み
						dropid[name]++;
						break;
					}
					const h = 0.4;
					let item_mat = new CANNON.Material("itembox-"+dropid[name]);
					let shape = new CANNON.Box(new CANNON.Vec3(0.5,h,0.4));
					let body = physics.addBody( shape, 0/*mass*/, item_mat, 1|2|8/*group*/, 1|2|8/*mask*/ );	//8=攻撃に当たる
					start.x = (start.x) * GameParam.MapScale;
					start.z = (start.z) * GameParam.MapScale;
					body.position.set(start.x, start.y+h/2+0.2, start.z);
					body.quaternion.setFromEuler(0,(param&0xff)*Math.PI*2/255,0,"XYZ");
					body.fixedRotation = true;
					/*GameParam.world_view.add( btl.Utility().shape2mesh({
						body: body,
						color: 0xa00000,
					}));*/
//								break;
					//ドロップアイテムリストに追加する
					itemno = (param >> 8) & 0xff;
					body_list.push(body);
				}
				case "drop":	//ドロップアイテム
				{
					if(name == "drop") {
						if(GameParam.user.status.drop_flag.includes(dropid[name])) {	//回収済み
							dropid[name]++;
							break;
						}
					}
					let obj = new THREE.Sphere(
//									new THREE.Vector3((start.x + 0.5) * GameParam.MapScale, start.y+0.5, (start.z+0.5) * GameParam.MapScale),
						new THREE.Vector3((start.x + 0) * GameParam.MapScale, start.y+0.5, (start.z+0) * GameParam.MapScale),
//						(type == 3) ? 0.01 : 1);	//radius : 宝箱はリスト登録するだけなので小さく
						3);
					drop_items_list.push({obj:obj, name:name, id:dropid[name]++, open:0, itemno:itemno});
					break;
				}
				case "house":	//民家
				{
					let item_mat = new CANNON.Material("house");
//					let shape = new CANNON.Box(new CANNON.Vec3(6,10,5.5));
					let shape = new CANNON.Box(new CANNON.Vec3(6.3+0.5,5,4.8+0.5));
					let body = physics.addBody( shape, 0/*mass*/, item_mat, 1|2/*group*/, 1|2/*mask*/ );
					start.x = (start.x) * GameParam.MapScale;
					start.z = (start.z) * GameParam.MapScale;
					body.position.set(start.x-0.5, start.y, start.z-0.5);
					body.quaternion.setFromEuler(0,(param&0xff)*Math.PI*2/255,0,"XYZ");
					body.fixedRotation = true;
				    body.aabbNeedsUpdate = true;	//動かしたら必要
					body_list.push(body);
					/*GameParam.world_view.add( btl.Utility().shape2mesh({
						body: body,
						color: 0xa00000,
					}));*/
					break;
				}
				}	//switch
			}
		}
	}
	//敵リスト・移動リスト作成
	enemy_search_list = new Array();
	move_search_list = new Array();
//	npc_search_list = new Array();
	let eid = 0;
	for(let y=0;y<=GameParam.MapSizeZ;y++) {
		for(let x=0;x<=GameParam.MapSizeX;x++) {
			let item = stage.getTerrainOne(x,y).item;
			let name = stage.getTerrainOne(x,y).name;
			//敵のエンカウント情報を作成
			if(name == "enemy") {
				let cnt = new Uint8Array(100);
				let enemy_no = [(item >> 8) & 0xff, (item >> 16) & 0xff, (item >> 24) & 0xff];	//配置（敵No）
				let names = new Array();
				let boss_no = 0;
				for (const no of enemy_no) {
					names.push(btl.getEnemyName(no, cnt[no]));
					cnt[no]++;
					if(no >= 40) boss_no = 1 + (no%10);
				}
				let add = true;
				if(!item_reset) {
					//配置情報から取り消す
					if(GameParam.user.status.enemy_flag[ GameParam.user.status.mapno ].includes(eid)) {
						add = false;
					}
				}
				if(add) {
					enemy_search_list.push({
						x : x,			//座標
						y : y,
						name : names,	//名前
						id : eid,		//配置ID
						boss : boss_no,
					});
				}
				eid++;
			}
			else if(name == "move") {
				let no =  (item >> 24) & 0xff;
				let sx = ((item >> 16) & 0xff) - 0x7f;
				let sy = ((item >>  8) & 0xff) - 0x7f;
				/*let r = Math.PI/2;
				if(sx < 0 && sy < 0) r += Math.PI*0.0
				if(sx > 0 && sy < 0) r += Math.PI*0.5;
				if(sx > 0 && sy > 0) r += Math.PI*1.0;
				if(sx < 0 && sy > 0) r += Math.PI*1.5;
				let w = Math.max(sx,sy) * 2 + 1;*/

				move_search_list.push([
					x, y,	//座標
					sx,sy,no	//情報
				]);
			}
		}
	}

	//キャラ配置
	btl.initChara(terrain_data, init);
	
	let player = getPlayableChara();
	if(GameParam.user.status.position != null) {
		//座標指定（ロード後など）
		player.physicsBody.position.set(GameParam.user.status.position.x, GameParam.user.status.position.y, GameParam.user.status.position.z);
		player.mesh.position.set(GameParam.user.status.position.x, GameParam.user.status.position.y-GameParam.AtariSize, GameParam.user.status.position.z);
		player.mesh.rotation.y = GameParam.user.status.rotation;
	}
	else {
		//マップ移動
		//カメラ向き
		GameParam.user.status.cam_rot.y = player.move_dir - Math.PI;
	}

	//ミニマップ
	createMiniMap();
	
	menu.loadMapping();

	//仕上げ
	if(init) {
		for(let i=0;i<GameParam.mesh.items.children.length;i++) {
			if(GameParam.mesh.items.children[i] != null) {
				setMaterialAlphaTest(GameParam.mesh.items.children[i], 0.3);
			}
		}
	}
	clearCanvasTexture();
	setAmbientColor(0);
	
	battle_mesh.visible = false;
	battle_area.collisionFilterGroup = 0;	//壁を無効にする

	calcStatus();

	item_reset = false;
	GameParam.BattleMode = 0;


	if(GameParam.user.status.event_flag["opening"]) {
		if(GameParam.season != "") {
			if(old_season != GameParam.season) {
				sound.stop("FIELD");
				sound.play("bgm_"+GameParam.season, "FIELD");
			}
		}
		else {
			sound.stop("FIELD");
		}
	}
	
	if (GameParam.user.status.travel < GameParam.user.status.mapno) {
		GameParam.user.status.travel = GameParam.user.status.mapno;

		//Google Analytics
		if(debug == 0) {
			gtag('js', new Date());
			gtag('config', 'G-15B38ETHT9');
			gtag('event', 'action',
				{	'event_category': 'category',
					'event_label': 'event_name',
					'value': GameParam.user.status.mapno
				});
		}
	}
}

function getStartPoint(prev_map) {
	let x = GameParam.MapSizeX/2;
	let z = GameParam.MapSizeZ/2;
	let dir = -1;
	//スタートポイントがある
	for(let i=0;i<terrain_data.length;i++) {
		if(terrain_data[i].name != "start") continue;
		x = (           i % (GameParam.MapSizeX+1)) * GameParam.MapScale;
		z = (Math.floor(i / (GameParam.MapSizeX+1)))* GameParam.MapScale;
		break;
	}
	//前のマップの移動ポイント
	for(let i=0;i<terrain_data.length;i++) {
		if(terrain_data[i].name != "move") continue;
		const mapno = ((terrain_data[i].item>>24) & 0xff);
		const sx    = ((terrain_data[i].item>>16) & 0xff) - 0x7f;
		const sy    = ((terrain_data[i].item>> 8) & 0xff) - 0x7f;
		if(mapno == prev_map) {
			x = (           i % (GameParam.MapSizeX+1)) * GameParam.MapScale;
			z = (Math.floor(i / (GameParam.MapSizeX+1)))* GameParam.MapScale;
			//重ならないようにずらす
			if(sx < 0 && sy < 0) { x += 2.5; dir = Math.PI*0.5; }
			if(sx > 0 && sy < 0) { z += 2.5; dir = Math.PI*0.0; }
			if(sx > 0 && sy > 0) { x -= 2.5; dir = Math.PI*1.5; }
			if(sx < 0 && sy > 0) { z -= 2.5; dir = Math.PI*1.0; }
			break;
		}
	}
	return [x,z,dir];
}

//world_view内からitemboxを検索し、同名のphysicsbodyの座標を反映
function itemUpdate(mesh) {

	//宝箱のMesh位置補正
	if(mesh.name.indexOf("itembox") >= 0) {
		for(let i=0;i<physics.world.bodies.length;i++) {
			let body = physics.world.bodies[i];
			let mat = body.material;
			if(mat.name == mesh.name) {
				mesh.position.copy(body.position);
				body.angularVelocity.set(0,0,0);
				mesh.quaternion.copy(body.quaternion);
				mesh.position.y -= 0.45;
				break;
			}
		}
	}
	if(mesh == null) {
		return null;
	}
	
	if(mesh.children != null) {
		var i;
		for(i=0;i<mesh.children.length;i++) {
			var ptr = itemUpdate(mesh.children[i]);
			if(ptr) {
				return ptr;
			}
		}
	}
	return null;
	
}

function getPlayableChara() {
	return btl.get(friend_name[GameParam.user.status.select_chara]);
}
function getPlayableList() {
	return [btl.get(0),btl.get(1),btl.get(2)];
}

//指定の宝箱を開ける
function OpenItemBox(name) {
	for(let i=0;i<drop_items_list.length;i++) {
		if(drop_items_list[i].open != 0) {	//開閉中があれば開けない
			return;
		}
	}
	for(let i=0;i<drop_items_list.length;i++) {
		let lst = drop_items_list[i];
		if(name == "itembox-"+lst.id && lst.name == "itembox") {
			lst.open = 1;
			sound.play("field_itembox");
			break;
		}
	}
}
//宝箱の回収率
function getItemBoxCount() {
	const got = GameParam.user.status.gotitem[ GameParam.user.status.mapno ];
	let current = got.length;
	let rest = 0;
	for(let drop of drop_items_list) {	//回収するとリストから消えるので未所持分がカウントされる
		if(drop.name == "itembox") {
			rest++;
		}
	}
	return [current, rest+current];
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
var step_info = new Array();
var step_count = 0;

var vrmLoad = 0;
var oldInput;
function InputUpdate(step) {
	if(GameParam.Assign == null) {
		resetDefaultGamePadAssign();
	}

	for(let _code in key) {
		press[_code] = (!old_key[_code] && key[_code]);
		old_key[_code] = key[_code];
	}
	oldInput = {...Input};
	for(let i in Input) {
		if(Input[i].x == undefined) {
			Input[i] = false;
		}else{
			Input[i].x = 0;
			Input[i].y = 0;
		}
	}
	Input.clickL = (ms_click == 1);
	Input.clickC = (ms_click == 2);
	Input.clickR = (ms_click == 3);

	//カメラに対して右左を決定
	if(key["A"] || key["left"]) {
//		Input.left = true;
		Input.stickL.x = -1;
	}
	else if(key["D"] || key["right"]) {
//		Input.right = true;
		Input.stickL.x =  1;
	}
	if(key["W"] || key["up"]) {
//		Input.up = true;
		Input.stickL.y = -1;
	}
	else if(key["S"] || key["down"]) {
//		Input.down = true;
		Input.stickL.y =  1;
	}
	if(press[' ']) {
		Input.jump = true;
	}
	Input.stickR.x = 0;
	Input.stickR.y = 0;
	if(GameParam.MouseLock) {
		if(Input.clickL) {
			Input.attack1 = true;
		}
		else if(Input.clickR) {
			Input.attack2 = true;
		}
		else if(Input.clickC) {
			Input.attack3 = true;
		}

		cam_vec_x *= 0.9;
		cam_vec_y *= 0.9;
		cam_vec_x += ((ms_mom_x) / window.innerWidth ) * 30 * step;
		cam_vec_y += ((ms_mom_y) / window.innerHeight) * 30 * step;
		Input.stickR.x += cam_vec_x;
		Input.stickR.y += cam_vec_y;
		ms_mom_x = ms_mom_y = 0;
	}
	else {
		//メニュー以外でクリックされたら
		if(Input.clickL) {
			if(GameParam.GamePause != "menu" && GameParam.GamePause != "event" && load_seq == -1) {
				MouseLockStart();
			}
		}
	}
	if(press["tab"]) {
		Input.select = true;
	}
	if(key["ctrl"]) {
		Input.L2 = true;
	}
	if(key["shift"]) {
		Input.guard = true;
	}
	if(press["Z"] || press["enter"]) {
		Input.enter = true;
	}
	else if(press["C"]) {
		Input.start = true;
	}
	else if(press["X"]) {
		Input.cancel = true;
	}
	if(GameParam.Config.UseItem != 0 && GameParam.GamePause == "" && load_seq == -1) {
		if(key["1"]) {
			Input.up = true;
		}
		if(key["2"]) {
			Input.left = true;
		}
		if(key["3"]) {
			Input.down = true;
		}
		if(key["4"]) {
			Input.right = true;
		}
	}
	if(debug) {
		if(press["P"]) {
			let old = GameParam.user.status;
			GameParam.user.status = {...GameParam.user.statusDebug};

			GameParam.user.status.mapping		= old.mapping;		//マッピングデータ
			GameParam.user.status.gotitem		= old.gotitem;		//宝箱回収
			GameParam.user.status.enemy_flag	= old.enemy_flag;	//エンカウント
			GameParam.user.status.drop_flag		= old.drop_flag;	//お守り（現マップのみ）
			GameParam.user.status.event_flag	= old.event_flag;
			
			calcStatus();
			ui_needsUpdate = true;
			sound.play("menu_load");
		}
	}

	// getGamepads メソッドに対応している
	if(navigator.getGamepads && GameParam.Assign != null){
		const gamepad_list = navigator.getGamepads();

		const A = GameParam.Assign;
		if(gamepad_list && gamepad_list.length > 0) {
			for(let i=0;i<gamepad_list.length;i++) {
				const gamepad = gamepad_list[i];
				if(!gamepad || !gamepad.connected) {
					continue;
				}
				if(A.index >= 0 && A.index != gamepad.index) {
					continue;
				}
				if(gamepad.buttons && gamepad.buttons.length > 0) {
					if(A.enter < gamepad.buttons.length && gamepad.buttons[A.enter].pressed) {	//○
						Input.enter = true;
					}
					if(A.cancel < gamepad.buttons.length && gamepad.buttons[A.cancel].pressed) {	//×
						Input.cancel = true;
					}

					//ジャンプ
					if(A.jump < gamepad.buttons.length && gamepad.buttons[A.jump].pressed) {
						Input.jump = true;
					}
					//攻撃
					if(A.attack3 < gamepad.buttons.length && gamepad.buttons[A.attack3].pressed) {	//○
						Input.attack3 = true;
					}
					else if(A.attack2 < gamepad.buttons.length && gamepad.buttons[A.attack2].pressed) {	//△
						Input.attack2 = true;
					}
					else if(A.attack1 < gamepad.buttons.length && gamepad.buttons[A.attack1].pressed) {	//□
						Input.attack1 = true;
					}
					if(A.guard < gamepad.buttons.length && gamepad.buttons[A.guard].touched) {	//R1(RB)
						Input.guard = true;
					}
					if(A.change < gamepad.buttons.length && gamepad.buttons[A.change].pressed) {	//L1(LB)
						Input.select = true;
					}
					if(A.pause < gamepad.buttons.length && gamepad.buttons[A.pause].pressed) {	//START
						Input.start = true;
					}

					if(A.up >= 0 && A.up < gamepad.buttons.length && gamepad.buttons[A.up].touched) {	//↑
						Input.up = true;
					}
					if(A.down >= 0 && A.down < gamepad.buttons.length && gamepad.buttons[A.down].touched) {	//↓
						Input.down = true;
					}
					if(A.left >= 0 && A.left < gamepad.buttons.length && gamepad.buttons[A.left].touched) {	//←
						Input.left = true;
					}
					if(A.right >= 0 && A.right < gamepad.buttons.length && gamepad.buttons[A.right].touched) {	//→
						Input.right = true;
					}

					//拡張
					if(A.L2 < gamepad.buttons.length && gamepad.buttons[A.L2].touched) {
						Input.L2 = true;
					}
					if(A.R2 < gamepad.buttons.length && gamepad.buttons[A.R2].touched) {
						Input.R2 = true;
					}
					if(A.L3 < gamepad.buttons.length && gamepad.buttons[A.L3].pressed) {
						Input.L3 = true;
					}
					if(A.R3 < gamepad.buttons.length && gamepad.buttons[A.R3].pressed) {
						Input.R3 = true;
					}
				}

				if(gamepad.axes && gamepad.axes.length > 0) {
					//移動
					if(A.move_h < gamepad.axes.length) Input.stickL.x += gamepad.axes[A.move_h];
					if(A.move_v < gamepad.axes.length) Input.stickL.y += gamepad.axes[A.move_v];
					//カメラ
					if(A.camera_h < gamepad.axes.length) Input.stickR.x += gamepad.axes[A.camera_h];
					if(A.camera_v < gamepad.axes.length) Input.stickR.y += gamepad.axes[A.camera_v];

					//ズーム
					if(debug) {
						/*if(gamepad.axes[3] < 0) {//L2
							ms_wheel += 0.1;
							if(ms_wheel > 6.0) ms_wheel = 6.0;
						}
						if(gamepad.axes[4] < 0) {//R2
							ms_wheel -= 0.1;
							if(ms_wheel < 0.5) ms_wheel = 0.5
						}*/
					}
				}
				break;
			}
		}
	}
	if(GameParam.GamePause != "" || load_seq != -1) {
		//（メニュー中のみ）stickLを上下左右に
		const x = Input.stickL.x;
		const y = Input.stickL.y;
		const scr = Math.sqrt(x*x+y*y);	//ニュートラル、つまり入力が入っていない時は明後日のほうを向いているのでscrが低いときはrは使わない
		if(scr > 0.5) {
			const r = Math.floor(Math.atan2(x,y) / (Math.PI/2) + 0.5);
			if(r == -1) Input.left = true;
			else if(r ==  1) Input.right = true;
			else if(r ==  0) Input.down = true;
			else Input.up = true;	//2 or -2
		}
	}
	
	for(let k in Input) {
		if(k.x != undefined) continue;

		if (InputCount[k] == undefined)
			InputCount[k] = 0;
		InputOnes[k] = false;
/*
		if(Input[k]) {
			InputCount[k]++;
		}
		else {
			//if(InputCount[k] > 0) console.log(InputCount[k]);
			if(InputCount[k] > 0 && InputCount[k] < 20) {
				InputOnes[k] = true;
			}
			InputCount[k] = 0;
		}
*/
		if(InputCount[k] > 0) {
			if(Input[k]) {
			}
			else {
				InputCount[k]-=step;
			}
		}
		else if(Input[k]) {
			InputOnes[k] = true;
			InputCount[k] = 10;
		}
	}
}
function FadeUpdate(clear) {
	if(GameParam.GamePause == "fadeout") {
		if(fade_count < GameParam.FadeTime) {
			if(++fade_count == GameParam.FadeTime) {
				if(fadeout_function != null) {
					fadeout_function();
					fadeout_function = null;
				}
			}
		}
		drawFade(clear);
	}
	else if(GameParam.GamePause == "fadein") {
		if(--fade_count <= 0) {
			GameParam.GamePause = "";
			if(fadein_function != null) {
				fadein_function();
				fadein_function = null;
			}
			ui_needsUpdate = true;
		}
		drawFade(clear);
	}
}

//戦闘の配置だけ行う。まだ何もしない
function BattleInit(index) {
	const list = enemy_search_list[index];
	let x = list.x;
	let z = list.y;
	let y = stage.getTerrainOne(x,z).height * GameParam.HeightScale;

	//敵を配置
	/*const offset = [
		[ 0.0, 0.8],
		[-0.5,-0.5],
		[ 0.5,-0.5]
	];*/
	const offset = [	//弓状
		[Math.PI* 0.6, 2.5],
		[Math.PI* 0.0, 0.0],
		[Math.PI* 1.4, 2.5],
	];
	//プレイヤーのほうを向く
	let pos_ply = getPlayableChara().mesh.position;
	let x2 = x - pos_ply.x;
	let z2 = z - pos_ply.z;
	const dir = Math.atan2(x2,z2);

	function arrive(no,pos){
		btl.setChara(no, true, pos.x,pos.y,pos.z);
		btl.setArrive(no);
		btl.get(no).mesh.rotation.y = dir;
		btl.get(no).move_dir = dir + Math.PI;
		if(debug) {
			console.log("エンカウント ["+Data.CharaName[btl.get(no).type]+"]");
		}
	}
	let boss = "";
	for (let j=0;j<3;j++) {
		const len = offset[j][1] * (list.boss != 0) ? 3 : 2;
		let pos = new THREE.Vector3(
			x + Math.sin(dir + offset[j][0]) * len,
			y + 2,
			z + Math.cos(dir + offset[j][0]) * len);
		if(list.boss == 0) {
			//時間差で登場
			btl.setTimerEvent(
				null,
				5+5*j,
				null,
				function(){
					arrive(list.name[j], pos);
				});
		}
		else {
			//ボスステージでの配置
			pos.y = stage.getHeightf(pos.x,pos.z) + GameParam.AtariSize;
			arrive(list.name[j], pos);
		}
		
	}
	//お互いを向き合うように
	for (let j=0;j<6;j++) {
		let p = btl.get(j);
		let d2 = (j<3) ? dir : (dir+Math.PI);
		p.move_dir = d2;
		p.mesh.rotation.y = d2 - Math.PI;
	}
	//敵エリア情報
	if(!GameParam.user.status.enemy_flag[ GameParam.user.status.mapno ].includes(list.id)) {
		GameParam.user.status.enemy_flag[ GameParam.user.status.mapno ].push(list.id);
	}
	
	switch(list.boss) {
	case 0:
		sound.play("bgm_battle1", "BATTLE");
		break;
	case 1:
	case 2:
		sound.play("bgm_battle2", "BATTLE");
		break;
	case 3:
		sound.play("bgm_battle3", "BATTLE");
		break;
	case 4:
		sound.play("bgm_battle4", "BATTLE");
		break;
	}
}

//戦闘の開始処理
function BattleStart(index) {

	const list = enemy_search_list[index];
	GameParam.BattleMode = (list.boss != 0) ? 2 : 1;
	battle_index = index;
	battle_count = 1;
	//GameParam.mesh.water.visible = false;

	if(!list.boss) {	//雑魚戦
		{
			let y = stage.getTerrainOne(list.x, list.y).height;
			//バトルエリア設定
			battle_mesh.position.set(list.x * GameParam.MapScale, y, list.y * GameParam.MapScale);
			battle_area.position.set(battle_mesh.position.x, battle_mesh.position.y, battle_mesh.position.z);
		}

		//ドームの底を接地
		const max = 15;
		let vec = battle_mesh.geometry.attributes.position.array;
		for(let i=0;i<max;i++) {
			let y = stage.getHeightf(battle_mesh.position.x + vec[i*6+3], battle_mesh.position.z + vec[i*6+5]) - battle_mesh.position.y;
			vec[i*6+4] = y;
		}
		battle_mesh.geometry.attributes.position.needsUpdate = true;
		GameParam.mesh.items.visible = false;
	}

	sound.pause("FIELD");
	
	btl.BattleStart();
}
//戦闘終了
function BattleEnd(index) {
	const list = enemy_search_list[index];
	GameParam.mesh.items.visible = true;
	//GameParam.mesh.water.visible = true;
	sound.stop("BATTLE");
	
	//報酬
	let cost_cnt = 0;
	let drop = [];
	let eflag = GameParam.user.status.event_flag;
	for(let nm of list.name) {
		//霊魂
		const data = Data.Enemy[btl.get(nm).type];
		if(data != undefined) {
			cost_cnt += data.cost * (0.4 + GameParam.user.status.mapno*0.1);

			//確率で素材を落とす
			if(Math.random() < 0.1 && data.drop != undefined) {
				const no = data.drop;	//鬼の○○
				if(drop[no] == undefined) drop[no] = 0;
				drop[no]++;
			}
			//低確率で回復アイテムを落とす
			if(Math.random() < 0.02 && data.item != undefined) {
				const no = data.item[ Math.floor(Math.random()*data.item.length) ];
				if(drop[no] == undefined) drop[no] = 0;
				drop[no]++;
			}
			//必ず落とす
			if(data.item2 != undefined) {
				for(let no of data.item2) {
					if(drop[no] == undefined) drop[no] = 0;
					drop[no]++;
				}
			}
		}
	}
	//初回は必ず牙を落とす
	if (drop[6] == undefined && eflag["battle_first2"] == undefined) {
		drop[6] = 1;
	}

	cost_cnt = Math.round(cost_cnt);
	setShortMessage("霊魂 +"+(cost_cnt));
	GameParam.user.status.cost_point += cost_cnt;
	GameParam.user.status.cost_point = Math.round(GameParam.user.status.cost_point);

	if(list.boss) {
		const boss_no = list.boss;
		//ボス撃破イベント（初回）
		if(eflag["clear_boss"+list.boss] == undefined) {
			//構えや攻撃などが終わるまで待つ
			btl.setTimerEvent(null,60*10,
				function() {
					for(let i=0;i<3;i++) {
						if(btl.get(i).sequence != 0) return false;
					}
					return true;
				},
				function() {
					fadeOut(function(){
						EventLoadPosition();
						fadeIn(function() {
							EventStart_BossClear(boss_no);
						});
					});
				}
			);
			//撃破フラグをたてる
			eflag["clear_boss"+list.boss] = true;
		}
		else {
			//次のステージへ
			orderMapMove(GameParam.user.status.mapno+1, GameParam.user.status.mapno, true);
		}
		enemy_search_list.splice(index, 1);	//再検索されないようリストから消す
	}
	else {
	}
	for(let itemno in drop) {
		const name = GameParam.user.getName(itemno, true);
		setShortMessage(name+" +"+drop[itemno]);
		GameParam.user.addItem(itemno, drop[itemno]);
	}
}

function gameUpdate(delta) {

	var upd_count = 0;
	tickCount += delta;
	if(tickCount > (1/60)*10) {
//		console.log("frame down "+tickCount+" count:"+GameParam.count);
		tickCount = (1/60)*3;
	}
	else if(vrmLoad < 10) {
		//一時的にvisibleにすることにより、VRMの読み込みを完全に完了させる（裏でなんかやってるらしい）
		let player = getPlayableChara();
		if(vrmLoad == 0) {
			for(let i=0;;i++) {
				let p = btl.get(i);
				if(p == null) break;
				if(p.mesh && p != player) {
					p.visible = true;
				}
			}
		}
		if(++vrmLoad>=10) {
			for(let i=0;;i++) {
				let p = btl.get(i);
				if(p == null) break;
				if(p.mesh && p != player && !p.npc) {
					if(GameParam.Party3Mode && p.friend && i < 3) {
						continue;
					}
					p.visible = false;
				}
			}
		}
	}
	var i,j,k;
	
	if(0){
		let r = 0;	//GameParam.count/1000
		sun_position.set(Math.sin(r)*30,30,Math.cos(r)*30);
//		sun_position.add(world_view.position);
//		sun_position.normalize();
		directionalLight.position.copy(sun_position);
	}
	if(0){
		let position = btl.get(0).physicsBody.position.clone();
		var from = new CANNON.Vec3(position.x, position.y+ adj_x/10, position.z);
		var to   = new CANNON.Vec3(position.x, position.y+ adj_y/10, position.z);
		var result = new CANNON.RaycastResult();
		var option_ground = {	//地面にだけ反応する
			collisionFilterMask :1,
			collisionFilterGroup:1,
			skipBackfaces:false,
		};
		if(physics.world.raycastClosest(from, to, option_ground, result)) {
//			console.log("dis="+result.distance);
			debug_obj1.material.color.set(0x0000ff);
		}
		else {
			debug_obj1.material.color.set(0xff0000);
		}
			adj3_z = result.distance;
		debug_obj1.position.copy(position);
		debug_obj1.position.y += adj_y/10+GameParam.AtariSize;
	}

	if(GameParam.GamePause == "" || GameParam.GamePause == "event") {	//通常
		if(GameParam.PerfMode != 0) {
			stage.update(delta, getPlayableChara().mesh.position);
		}
		GameParam.mesh.water.material.map.offset.set(GameParam.count%240/240,Math.sin(GameParam.count/240*Math.PI)*0.2);

//		GameParam.mesh.water.material.map.repeat.set(adj2_x*(1+adj2_z),adj2_y*(1+adj2_z)*GameParam.MapSizeZ/GameParam.MapSizeX);
	}
	
	if(GameParam.GamePause == "") {
		//プレイヤーの近くの樹木を動的に配置
		let player = getPlayableChara();
		const px = Math.min(Math.max(1, Math.floor(player.mesh.position.x - 0.5)), GameParam.MapSizeX-1);
		const py = Math.min(Math.max(1, Math.floor(player.mesh.position.z - 0.5)), GameParam.MapSizeZ-1);
		let idx = 0;
		for(let y=py-1;y<=py+1;y+=1) {
			for(let x=px-1;x<=px+1;x+=1,idx++) {
				const t0 = terrain_data[x+y*(GameParam.MapSizeX+1)];
				if(t0.name == undefined || t0.name == "") continue;
				let h = stage.getHeightf(x+0.5, y+0.5);
				let start = new THREE.Vector3(x+0.5,h * GameParam.HeightScale,y+0.5);
				if(t0.name == "bamboo") {	//竹
					active_tree[idx].position.copy(start);
				}
				else if(t0.name == "tree") {	//樹木
					active_tree[idx+9].position.copy(start);
				}
			}
		}
	}

	if(debug) {
		if(press['Q']) adj_x += 1;
		if(press['A']) adj_x -= 1;
		if(press['W']) adj_y += 1;
		if(press['S']) adj_y -= 1;
		if(press['E']) adj_z += 1;
		if(press['D']) adj_z -= 1;
		if(press['R']) adj2_x += 1;
		if(press['F']) adj2_x -= 1;
		if(press['T']) adj2_y += 1;
		if(press['G']) adj2_y -= 1;
		if(press['Y']) adj2_z += 1;
		if(press['H']) adj2_z -= 1;
		if(press['U']) adj3_x += 1;
		if(press['J']) adj3_x -= 1;
		if(press['I']) adj3_y += 1;
		if(press['K']) adj3_y -= 1;
		if(press['O']) adj3_z += 1;
		if(press['L']) adj3_z -= 1;
	}
	if(debug && 1) {
		document.getElementById("debugOut").innerHTML = "<br><br>";
		document.getElementById("debugOut").innerHTML += "adj1 "+adj_x+","+adj_y+","+adj_z+"<br>";
		document.getElementById("debugOut").innerHTML += "adj2 "+adj2_x+","+adj2_y+","+adj2_z+"<br>";
		document.getElementById("debugOut").innerHTML += "adj3 "+adj3_x+","+adj3_y+","+adj3_z+"<br>";
	}

	GameParam.user.status.game_time += tickCount;

	let player = getPlayableChara();

	/*if(adj_x && load_seq != 20) {
		fadeOut(function(){
			load_seq = 20;
		});
	}*/
	
	while(tickCount >= 1.0/60.0 /*|| upd_count == 0*/)
	{
		tickCount -= 1.0/60.0;
		upd_count++;
		
		if(next_map != -1 && GameParam.GamePause == "") {
			fadeOut(function() {
				if(GameParam.user.status_store != null) {
					//ロード後の適用
					GameParam.user.status = GameParam.user.status_store;
					GameParam.user.status_store = null;
					item_reset = true;
				}
				else {
					//通常のマップ移動
					GameParam.user.status.mapno = next_map;
					GameParam.user.status.map_prev = (prev_map != undefined) ? prev_map : -1;
				}
				startMapMove(
					function(){
						//暗転中の処理
						for(let i=0;i<enemy_search_list.length;i++) {
							if(enemy_search_list[i].boss) {
								//ボスが設定されている・撃破済みならイベントを挟まず即戦闘
								BattleInit(i);	//キャラ配置
							}
						}
						EventInit();
						
						fadeIn(EventStart_Map);
					});
				next_map = -1;
			});
		}

		updateCanvasTexture()
		
		GameParam.count = Math.floor(GameParam.count+1);

		if(GameParam.GamePause == "menu") {

			if(menu.update()) {
				calcStatus();
				//true:メニューを出る
				GameParam.GamePause = "";
				ui_needsUpdate = true;
				MouseLockStart();
			}
			continue;
		}

		//コンボ数
		if(GameParam.BattleMode != 0) {
			if(GameParam.user.status.combo_hit > 0) {
				if(++GameParam.user.status.combo_time > GameParam.ComboLimit) {
					GameParam.user.status.combo_hit = 0;
					ui_needsUpdate = true;
				}
				else if(GameParam.user.status.combo_time <= 15) {
					ui_needsUpdate = true;
				}
			}
		}

		btl.preUpdate();

		physics.update( (1.0/60.0) * GameParam.physics_speed );
//		physics.update( delta * GameParam.physics_speed );
		
		btl.postUpdate();

		itemUpdate(GameParam.mesh.items);
		
function changeChara(next_chara) {
	let player = getPlayableChara();
	let body = player.physicsBody;
	let old_name = friend_name[GameParam.user.status.select_chara];
	let old = btl.get(old_name);
	
	/*if(GameParam.BattleMode == 0) {
		GameParam.user.status.select_chara = next_chara;
		let next = btl.get(friend_name[GameParam.user.status.select_chara]);
		btl.setChara(friend_name[GameParam.user.status.select_chara],true, body.position.x,body.position.y,body.position.z);
		next.mesh.rotation.copy(player.mesh.rotation);
		player = next;
		player.friend = false;
		btl.setChara(old_name, false);	//消す
	}
	else*/ {
//		if(GameParam.BattleMode != 0) {
			old.friend = true;
//		}
		let next;
		for(let i=0;i<3;i++) {
			next = btl.get(friend_name[next_chara]);
			if(next.lost == 0)
				break;
			else
				next_chara = (next_chara+1)%3;
		}
		GameParam.user.status.select_chara = next_chara;
		player = next;
		player.friend = false;

		//非戦闘時
		if(GameParam.BattleMode == 0 && !GameParam.Party3Mode) {
			//活性化
			const p = old.physicsBody.position;
			btl.setChara(friend_name[next_chara],true, p.x,p.y,p.z);
			player.mesh.rotation.copy(old.mesh.rotation);

			//消去
			btl.setChara(old_name, false);
		}
		sound.play("battle_battou");
	}
	ui_needsUpdate = true;
	return player;
}
		if(player != null){
			let body = player.physicsBody;
			player.dir_lock = false;
//			player.walk_pow = 0;

			//へんしん！
			if(player.lost > 0) {
				//やられたら次のキャラに切り替え
				player = changeChara((GameParam.user.status.select_chara+1)%3);
			}
			else if(change_chara > 0) {
				if(player.sequence == 0) {
					change_chara++;
					if(GameParam.BattleMode == 0 && !GameParam.Party3Mode) {
						const TM = 20;
						if(change_chara <= TM) {
	//						player.mesh.rotation.y += change_chara / TM;
							if(change_chara >= TM) {
								player = changeChara((GameParam.user.status.select_chara+1)%3);
							}
							else {
								btl.findBone(player.mesh,"J_Bip_C_Hips").rotation.y = change_chara / TM * Math.PI * 2;
							}
						}
						else {
	//						player.mesh.rotation.y += (TM*2 - change_chara) / TM;
							btl.findBone(player.mesh,"J_Bip_C_Hips").rotation.y = change_chara / TM * Math.PI * 2;
							if(change_chara >= TM*2) {
								change_chara = 0;
							}
						}
					}
					else {
						//戦闘中
						if(change_chara >= 5) {
							player = changeChara((GameParam.user.status.select_chara+1)%3);
							change_chara = 0;
						}
					}
				}
			}
			//プレイヤーを動かす
			else if(body) {
				let controll_enable = true;
				if(battle_count > 0) {
					controll_enable = false;
				}
				if(GameParam.GamePause == "event") {
					let skip = false;
					if(debug && Input.L2) {	//イベント強制終了
						skip = true;
					}
					if(event.update(skip)) {
						ui_needsUpdate = true;
					}
					controll_enable = false;
					/*if(debug && Input.L2 && InputOnes.enter) {	//イベント強制終了
						GameParam.GamePause = "";
						event.setMessage(null);
						ui_needsUpdate = true;
					}*/
				}
				else if(GameParam.GamePause == "message") {
					if(event.updateMessage()) {
						GameParam.GamePause = "";
						ui_needsUpdate = true;
					}
					controll_enable = false;
				}
				else if(GameParam.GamePause == "fadein" || GameParam.GamePause == "fadeout") {
					controll_enable = false;
				}
				if(controll_enable) {

					if(!oldInput.start && Input.start || requestPause != 0) {
						GameParam.GamePause = "menu";
						menu.start();
						ui_needsUpdate = true;
						controll_enable = false;
						sound.play("menu_pause");
						MouseLockEnd();
					}
				}
				if(controll_enable) {
					const x = Input.stickL.x;
					const y = Input.stickL.y;
					let scr = Math.sqrt(x*x+y*y);	//ニュートラル、つまり入力が入っていない時は明後日のほうを向いているのでscrが低いときはrは使わない
					let r = Math.atan2(x,y) + GameParam.user.status.cam_rot.y;
					if(Input.guard) {
//						if(oldInput.jump && Input.jump) {
						let mi=2,mx=0;
						let mr = player.move_dir;
						for(let i=0;i<step_info.length;i++) {
							mi = Math.min(mi, step_info[i][0]);
							if(mx < step_info[i][0]) {
								mx = step_info[i][0];
								mr = step_info[i][1];
							}
						}
						//adj_x = mi;
						//adj2_x = mx;
						if(mx > 0.8 && mi < 0.2 && GameParam.user.getSkill(player.name,12) != 0) {	//縮地を持っているか
							sound.play("field_jump1");
							btl.Step(player, mr);
						}
						else {
							btl.Guard(player);
						}
					}
//						if(player.sequence == 0/*SEQ_WALK*/) {
					else {
						if(debug) {
							if(Input.L2) scr *= 6;
						}
						if(GameParam.BattleMode == 0 && GameParam.GamePause == "") {
							scr *= 1.5;
						}
						btl.Walk(player, r, scr);
					}
					step_info.push([scr, r]);
					if(step_info.length > 10) {
						step_info.shift();	//減らす
					}

					//ジャンプ
					if(!oldInput.jump && Input.jump) {
	 					btl.Jump(player);
					}
					//近くにNPCがいる
					if(player.hitNPC != null) {
						if(InputOnes.enter || InputOnes.clickL) {
							EventStart_TalkNPC(player.hitNPC.name);
						}
					}
					else if(/*GameParam.BattleMode != 0 ||*/ 1) {
						let attack_type = -1;
						if(Input.attack1) attack_type = 0;
						else if(Input.attack2)	attack_type = 1;
						else if(Input.attack3)	attack_type = 2;

						//チャージ攻撃
						if(GameParam.user.getSkill(player.name,18) != 0) {	//溜めスキルを所持
							if(attack_type >= 0) {
								player.charge_count++;
								if(player.charge_type != attack_type)
									player.charge_count = 0;
								player.charge_type = attack_type;
							}
							else {
								if(player.charge_type >= 0 && player.charge_count > 60) {
									/*console.log("charge "+player.charge_type);
									const no = GameParam.user.getAttackAssign(GameParam.user.status.select_chara, player.charge_type);
									if(no != 0) {
										btl.Attack(player, no);
									}*/
									player.attack_flag |= (1<<4);//ATTACK_CHARGE;
								}
								player.charge_count = 0;
							}
						}

						//攻撃
						if(!oldInput.attack3 && Input.attack3) {	//○
							const no = GameParam.user.getAttackAssign(GameParam.user.status.select_chara, 2);
							btl.Attack(player, (no < 0) ? 0 : no%10);
							player.charge_type = attack_type;
						}
						else if(!oldInput.attack2 && Input.attack2) {	//△
							const no = GameParam.user.getAttackAssign(GameParam.user.status.select_chara, 1);
							btl.Attack(player, (no < 0) ? 0 : no%10);
							player.charge_type = attack_type;
						}
						else if(!oldInput.attack1 && Input.attack1) {	//□
							btl.Attack(player, 0);
							player.charge_type = attack_type;
						}
						
					}
					if(!oldInput.select && Input.select) {
						change_chara = 1;
					}
					//アイテムショートカット
					if(GameParam.Config.UseItem != 0 /*&& GameParam.BattleMode != 0*/) {
						function useItem(no, sound_name, callback) {
							let flg;
							let str;
							[flg, str] = menu.useItemCheck(no, false);

							if(flg == 0) {
								sound.play("menu_cancel");
							}
							else {
								sound.play(sound_name);
								[flg,str] = menu.useItemExec(no, false, callback);
								//反映
								calcStatus();
								ui_needsUpdate = true;
							}
						}
						if(InputOnes.up) {
							useItem(0, "battle_cure",
								function(p){
									let pos = p.mesh.position;
									btl.effect.set("cure", pos, {player:p});
								});
						}
						else if(InputOnes.left) {
							useItem(3, "battle_cure2",
								function(p){
									let pos = p.mesh.position;
									btl.effect.set("cure", pos, {player:p});
								});
						}
						else if(InputOnes.down) {
							if(GameParam.BattleMode != 0) {
								useItem(1, "battle_attack_up",
									function(p){
										if(p.attack_up == 0) {
											let pos = p.mesh.position;
											btl.effect.set("powerup", pos, {player:p});
										}
									});
							}
							else {
								sound.play("menu_cancel");
							}
						}
					}
				}
				if(controll_enable || debug && Input.L2) {

					let cam_rot = GameParam.user.status.cam_rot;
					if(Math.abs(Input.stickR.x) > 0.1) {	//左右
						const rev = (GameParam.Config.CameraH == 0) ? -1 : 1;
						cam_rot.y += Input.stickR.x/40 * rev;
					}
					const rmax = player.is_swim ? -0.1 : 0.2;
					const rmin = -Math.PI/2+0.2;
					let zm = 0;
					if(Math.abs(Input.stickR.y) > 0.1) {	//上下
						const rev = (GameParam.Config.CameraV == 0) ? -1 : 1;
						cam_rot.x += Input.stickR.y/40 * rev;
						zm = 1;
					}
					if(cam_rot.x > rmax) cam_rot.x = rmax;
					if(cam_rot.x < rmin) cam_rot.x = rmin;
					if(zm) {
						const r = (cam_rot.x - rmin) / (rmax-rmin);
						ms_wheel = 0.5 * r + 2 * (1-r);
						if(ms_wheel > 1.4) ms_wheel = 1.4;
					}
					if(debug && Input.L2) player.muteki = 10;
				}
				/*if(player.attack_flag & (1<<1) && player.sequence == 1) {
					cam_action_fov = 30;
				}else{
					cam_action_fov = 50;
				}*/
				if(GameParam.GamePause == "") {
					//非戦闘モード：敵を探す
					if(GameParam.BattleMode == 0) {
						
						if(battle_count == 0) {
							for(let i=0;i<enemy_search_list.length;i++) {
								let x = enemy_search_list[i].x;
								let z = enemy_search_list[i].y;
								let x1 = x - player.mesh.position.x;
								let z1 = z - player.mesh.position.z;
								let len = Math.sqrt(x1*x1 + z1*z1);
								let boss = enemy_search_list[i].boss;
								if(boss) {
									//ボスが設定されている・撃破済みならイベントを挟まず即戦闘
									if(GameParam.user.status.event_flag["clear_boss"+boss]) {
									}
									else {
										boss = 0;
									}
								}
								//エンカウント領域に入った
								if(len < GameParam.EncountArea/2 || boss) {
									BattleInit(i);
									BattleStart(i);
									break;
								}
							}
						}
						else {
							//戦闘終了
							const max = 30;
							const s = 1-battle_count/max;
							battle_mesh.scale.set(s,s,s);
							battle_mesh.material.opacity = 0.75*s;
							setAmbientColor(s);
							if(++battle_count >= max) {
								battle_mesh.visible = false;
								battle_count = 0;
								battle_area.collisionFilterGroup = 0;	//壁を無効にする
								enemy_search_list.splice(battle_index, 1);	//再検索されないようリストから消す
								sound.restart("FIELD");
								btl.BattleEnd();

								//ざこ
								//最初の戦闘
								let eflag = GameParam.user.status.event_flag;
								if(eflag["battle_first2"] == undefined) {
									btl.setTimerEvent(null,60*2,null,function() {
										event.setMessage([
											"敵を倒すと「霊魂」がもらえます。\n"+
											"（まれに回復アイテムや素材を落とすこともあります）",

											"「霊魂」はメニューの「強化」から武術や特技、\n"+
											"いわゆるスキルを上げるのに使うことができます。",

											"「武術」は攻撃スキルです。\n"+
											"ボタンに割り当てて使うことがきます。\n"+
											"武術はキャラごとに固有になっています。",

											"武術の中には「技力」、いわゆるMPのようなものを\n"+
											"消費して使う武術もあります。\n"+
											"非戦闘時は技力が減らないので、試し打ちができます。",

											"「特技」はステータス・パッシブスキルです。\n"+
											"レベルや経験値はありませんので、霊魂を使って\n"+
											"仲間を強化しましょう。"
											]);
									});
									eflag["battle_first2"] = true;
								}
							
							}
						}
					}
					
					else {
						//戦闘中
						if(battle_count == 0) {
							//全滅したか
							let live_e = 0;
							let live_p = 0;
							let cnt = 0;
							for(let i=0;i<3;i++) {
								let p = btl.get(enemy_search_list[battle_index].name[i]);
								if(p != null) {
									cnt++;
									if(!btl.isDead(p)) {
										live_e = 1;
										
										if(debug && Input.R2 && p.life > 2) {
											p.life-=10;
											SetLife(p,true);
										}
									}
								}
								p = btl.get(i);
								if(p != null) {
									if(!btl.isDead(p)) {
										live_p = 1;
									}
								}
							}
							if(live_p == 0) {
								sound.stop("FIELD");
								sound.stop("BATTLE");
								fadeOut(function(){
									load_seq = 20;
									sound.play("battle_gameover");
								});
							}
							else if(live_e == 0) {
								//戦闘終了
								if(GameParam.BattleMode == 1) {
									battle_count = 1;
								}
								else {
									//即終了
//									sound.restart("bgm_field1");
									btl.BattleEnd();	//この中でタイマー消しちゃう
								}
								BattleEnd(battle_index);
								GameParam.BattleMode = 0;
							}
						}
						else {
							//戦闘突入
							const max = 30;
							const s = battle_count/max;
							if(GameParam.BattleMode == 1) {
								battle_mesh.visible = true;
								battle_mesh.scale.set(s,s,s);
								battle_mesh.material.opacity = 0.75*s;
								setAmbientColor(s);
								sound.play("battle_start");
							}
							if(++battle_count >= max) {
								//戦闘開始
								battle_count = 0;
								if(GameParam.BattleMode == 1) {
									battle_area.collisionFilterGroup = 1;	//壁を有効にする
								}

								//最初の戦闘
								if(GameParam.user.status.event_flag["battle_first"] == undefined) {
									event.setMessage([
										"敵[骸鬼]と戦闘状態に入りました。",

										"敵に「GUARD」と表示されているうちは防御力が高く、\n"+
										"有効なダメージが与えられません。\n"+
										"攻撃し続けるとゲージを削ることができます。",

										"青いゲージがなくなると「BREAK」状態になり、\n"+
										"大きなダメージを与えることができますが、\n"+
										"時間経過により黄色のゲージが回復すると再び\n"+
										"GUARD状態に戻ります。",

										"全員倒すと戦闘終了です。\n"+
										"なお、このゲームでは戦闘から逃げられません。\n"+
										"（TIPS：水場や林の中など、道の隅を歩いていれば\n"+
										"　敵と遭遇しにくくなります）",

										"味方の生命力が０になると戦闘不能状態に陥り、\n"+
										"一定時間が経過するまで戦闘に参加できません。\n"+
										"全員戦闘不能になるとゲームオーバーになります。"
										]);
									GameParam.user.status.event_flag["battle_first"] = true;
								}
							}
						}
					}	//BattleMode
				}	//GameParam.GamePause

			}
		}
		if(GameParam.GamePause == "") {
			//宝箱orドロップアイテム
			for(let i=0;i<drop_items_list.length;i++) {
				let lst = drop_items_list[i];
				let obj = lst.obj;
				let hit = false;
				if(obj.containsPoint(player.mesh.position)) {
					hit = true;
				}
				if(1) {
					let del = false;
					for(let j=0;j<GameParam.mesh.items.children.length;j++) {
						let obj = GameParam.mesh.items.children[j];
						if(obj.name == lst.name) {
							if(lst.name == "drop") {
								if(hit && GameParam.user.status.amulet < GameParam.AmuletLimit) {
									//ドロップアイテム
									let pos = lst.obj.center.clone();
									pos.sub(player.mesh.position);
									pos.y -= player.height;
//									const len = pos.length();
									const vec = pos.clone().multiplyScalar(-1.0/10.0);
									btl.setTimerEvent(null,10,
										function() {
											//吸い寄せられる
											let mat = new THREE.Matrix4();
											obj.getMatrixAt(lst.id, mat);
											mat.multiplyMatrices((new THREE.Matrix4()).makeTranslation(vec.x, vec.y, vec.z),mat);
											obj.setMatrixAt(lst.id, mat);
											obj.instanceMatrix.needsUpdate = true;
											return false;
										},
										function() {
											sound.play("field_drop");
											obj.setMatrixAt(lst.id, (new THREE.Matrix4()).makeScale(0,0,0));	//マトリクスで消滅
											obj.instanceMatrix.needsUpdate = true;
											GameParam.user.status.amulet++;
											if(!GameParam.user.status.drop_flag.includes(lst.id)) {
												GameParam.user.status.drop_flag.push(lst.id);
											}
											ui_needsUpdate = true;
											if(GameParam.user.status.event_flag["amulet_first"] == undefined) {
												event.setMessage(["お守りは"+GameParam.AmuletRate+"個で1回、敵からのダメージを\n軽減してくれるアイテムです。\nなくなるまで自動的に防御状態と同じ効果を持ちます。",GameParam.AmuletLimit+"個以上は持つことはできません。"]);
												GameParam.user.status.event_flag["amulet_first"] = true;
											}
											else {
												setShortMessage("お守り", 1);
											}
										}
									);
									del = true;
								}
								else {
									//くるくる
									let mat = new THREE.Matrix4();
									obj.getMatrixAt(lst.id, mat);
									mat.multiplyMatrices(mat,(new THREE.Matrix4()).makeRotationY(1/20));
									obj.setMatrixAt(lst.id, mat);
									obj.instanceMatrix.needsUpdate = true;
								}
//								lst.open = 0;
								break;
							}
							else if(lst.name == "itembox" && hit && GameParam.user.status.event_flag["itembox_first"] == undefined) {
								event.setMessage([
									"宝箱は攻撃すると開けることができます。\n"+
									"回復アイテムのほか、武術・特技の書などが\n"+
									"入っていることがあります。",
									"メニューを開くとそのマップにある宝箱の回収率が\n"+
									"表示されます。くまなく探してみましょう。"]);
								GameParam.user.status.event_flag["itembox_first"] = true;
							}
							else if(lst.name == "itembox" && lst.open > 0) {
								//宝箱
								//開ける
								for(let c of obj.children) {
									if(c.name == "itembox-"+lst.id) {	//回収分は抜けているため名前で検索
										lst.open++;
										if(lst.open <= 45) {
											c.children[2].rotation.x = (3-Math.sin(lst.open/45*Math.PI/2)) * Math.PI/2;
										}
										else if(lst.open <= 60) {
											c.children[2].position.y -= Math.sin((lst.open-45)/15*Math.PI/2)/15*85;	//x0.01
										}
										else {
											ui_needsUpdate = true;

											del = true;
//											event.setMessage([GameParam.user.getName(lst.itemno)+"を手に入れた"]);
											setShortMessage(GameParam.user.getName(lst.itemno,true));
											GameParam.user.addItem(lst.itemno);

											//取得情報
											GameParam.user.status.gotitem[ GameParam.user.status.mapno ].push( lst.id )
										}
										break;
									}
								}
							}
							break;
						}
					}
					if(del) {
						drop_items_list.splice(i, 1);	//再検索されないようリストから消す
						i--;
					}
				}
			}
			
			//移動
			let flg = 0;
			for(let i=0;i<move_search_list.length;i++) {
				let x  = move_search_list[i][0];
				let y  = move_search_list[i][1];
				let sx = move_search_list[i][2];
				let sy = move_search_list[i][3];
				let no = move_search_list[i][4];

				let area = null;
				if(sx < 0 && sy < 0) area = [x+sx, y+sy, x+ 1, y-sy,  1, 0 ];	//左
				if(sx > 0 && sy < 0) area = [x-sx, y+sy, x+sx, y+ 1,  0, 1 ];	//上
				if(sx > 0 && sy > 0) area = [x- 1, y-sy, x+sx, y+sy, -1, 0 ];	//右
				if(sx < 0 && sy > 0) area = [x+sx, y- 1, x-sx, y+sy,  0,-1 ];	//下
				if(area) {
					let p = getPlayableChara().mesh.position;
					if(p.x >= area[0] && p.z >= area[1] && p.x < area[2] && p.z < area[3]) {
						if(GameParam.user.status.mapno != no && next_map != no) {
							
							function nextStageMove() {
								orderMapMove(no, GameParam.user.status.mapno, true);
							}
							if(Data.BossCheck[no] != undefined && GameParam.user.status.event_flag["clear_boss"+(Data.BossCheck[no]+1)] == undefined) {	//移動先がボス戦かつ未クリア
								//進行するか確認
								event.start([
									{name:"select", text:"強敵が待ち受けているようだ。\n進みますか？", no:"select_no" },
									{name:"func", callback:function(){nextStageMove();event.exit();}},
									{name:"exit"},
									{name:"label", label:"select_no" },
									{name:"move", owner:"tamami", offset:new THREE.Vector3(area[4],0,area[5])},	//邪魔になるので３人同時
									{name:"move", owner:"ayame",  offset:new THREE.Vector3(area[4],0,area[5])},
									{name:"move", owner:"karin",  offset:new THREE.Vector3(area[4],0,area[5])},
									{name:"wait", chara:true},
									{name:"exit"},
								]);
							}
							else {
								nextStageMove();
							}
						}
					}
				}
			}
		}
		/*{
			let obj = obj_mesh[OBJ_ITEMBOX];
			let bone = obj.children[2];
			obj.position.set(GameParam.MapSizeX/2*GameParam.MapScale,0,GameParam.MapSizeZ/2*GameParam.MapScale);
			let mat = obj.children[0].material;
//			obj.scale.set(1,1,1);
//			obj.children[0].rotation.set(Math.random(),0,0);
			bone.rotation.set(-Math.sin(GameParam.count%60/30*Math.PI/2)-Math.PI/2,0,0);
//			mat.needsUpdate = true;
		}*/

		//VRMの更新(揺れもの)
		if(GameParam.PerfMode != 0) {
			for(let i=0;i<org_vrm.length;i++) {
				if(org_vrm[i] != null) {
					if(obj_mesh[i].name.indexOf("enemy") >= 0) continue;	//敵は固定

					obj_mesh[i].updateMatrixWorld(false);	//フレームが飛ぶと急な動きで揺れものがピクピクするのでVRM更新前に必要
					org_vrm[i].update( 1.0/60.0 );
				}
			}
		}

		//MMDの更新(IK)
		for(let mmd of helper.meshes) {
			if(mmd.visible) {
				mmd.updateMatrixWorld( true );
				helper.objects.get( mmd ).ikSolver.update();
			}
		}
	}	//update loop
//	console.log("upd_count:"+upd_count);

	//マトリクスに依存する処理
	if(upd_count > 0) {

		let eye,target;
		if(1){
			//デフォルトは操作系を基準
			next_camera.rate = 1;
			next_camera.target.copy(getPlayableChara().mesh.position);
			next_camera.target.y += 1.0;
			next_camera.eye.copy(next_camera.target);	//キャラ中心に動く
			next_camera.zoom = ms_wheel;
//			next_camera.rotation = new THREE.Vector3(GameParam.user.status.cam_rot.x, GameParam.user.status.cam_rot.y, GameParam.user.status.cam_rot.z);
			next_camera.rotation.copy(GameParam.user.status.cam_rot);
			next_camera.fov = 50;

			if(GameParam.GamePause == "event") {
				let ecam = event.getCameraInfo();
				if(ecam != null) {
					//イベントカメラ
					next_camera.target.copy( ecam.target );
					next_camera.eye.copy( ecam.eye );
					next_camera.rotation.copy( ecam.rotation );
					next_camera.zoom = ecam.zoom;
					next_camera.fov  = ecam.fov;
					next_camera.rate = ecam.rate;
					if(debug && Input.L2) {
						//デバッグでカメラ動かす
						adj_x = GameParam.user.status.cam_rot.x;
						adj2_x = GameParam.user.status.cam_rot.y;
						adj3_x = ms_wheel-0.1;	//ecam.zoom;
						next_camera.rotation.x += adj_x;
						next_camera.rotation.y += adj2_x;
						next_camera.zoom += adj3_x;
						next_camera.fov += adj_z*5;
						adj_x  = Math.floor((next_camera.rotation.x)*100)/100;
						adj2_x = Math.floor((next_camera.rotation.y)*100)/100;
						adj3_x = Math.floor((next_camera.zoom)*100)/100;
					}

					if(ecam.target.distanceTo(game_camera.target) < 0.01) {
						btl.clearTimerEvent("event_camera");
					}
				}
			}
			else if(debug && Input.L2) {
				next_camera.rate = 2;
			}

			//カメラ補間で動かす(game_camera→next_camera)
			for(i=0;i<upd_count;i++) {
				let v1 = game_camera.target.clone();	//注視点
				let v2 = next_camera.target.clone();
				v2.sub(v1);
				if(v2.length() < 10) {
					v2.multiplyScalar(0.1*next_camera.rate);
					game_camera.target.add(v2);
				}
				else {
					//距離が離れすぎていたら瞬間移動
					game_camera.target.copy(next_camera.target);
				}

				v1 = game_camera.eye.clone();	//視点
				v2 = next_camera.eye.clone();
				v2.sub(v1);
				if(v2.length() < 10) {
					v2.multiplyScalar(0.5*next_camera.rate);
					game_camera.eye.add(v2);
				}
				else {
					//距離が離れすぎていたら瞬間移動
					game_camera.eye.copy(next_camera.eye);
				}
				
				//カメラ角度
				let rx = next_camera.rotation.x - game_camera.rotation.x;
				let ry = next_camera.rotation.y - game_camera.rotation.y;
				if (ry >  Math.PI*1)
					ry -= Math.PI*2;
				if (ry < -Math.PI*1)
					ry += Math.PI*2;
				game_camera.rotation.x += rx * 0.25 * next_camera.rate;
				game_camera.rotation.y += ry * 0.25 * next_camera.rate;
				
				//ズーム
				let z1 = game_camera.zoom;
				let z2 = next_camera.zoom;
				game_camera.zoom += (z2 - z1) * 0.125 * next_camera.rate;

				let fov1 = game_camera.fov;
				let fov2 = next_camera.fov;
				game_camera.fov += (fov2-fov1)*0.06*1*next_camera.rate;
			}
			

			let target = game_camera.target.clone();
			const eye_base = game_camera.eye;
			const rotation = game_camera.rotation;
			let mat1 = new THREE.Matrix4();
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeTranslation(eye_base.x, eye_base.y, eye_base.z));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeRotationY(rotation.y));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeRotationX(rotation.x));
			mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeTranslation(0,0, 1*4*game_camera.zoom));
			eye = (new THREE.Vector3()).setFromMatrixPosition(mat1);
			if(1) {	//めりこみ対策
				let h = stage.getHeightf(eye.x, eye.z) + 1;
				if(eye.x < 3 || eye.z < 3 || eye.x > GameParam.MapSizeX-3 || eye.z > GameParam.MapSizeZ-3) {
//					h += 10;
				}
				if(GameParam.BattleMode == 1) {
					//バトルエリア内に補正
					let pos = battle_mesh.position.clone();
					pos.y = eye.y;
					let len = pos.clone().sub(eye).length() - (GameParam.BattleArea/2);
					if(len > 0) {
						len *= 3;
						if(len > 10) len = 10;
						h += len;
					}
				}
				if(eye.y < h) {
					eye.y = h;
				}
			}
			btl.setVisible(eye);

			target.multiply(world_view.scale);
			eye.multiply(world_view.scale);
			target.add(world_view.position);
			eye.add(world_view.position);
			camera.position.copy(eye);
			camera.lookAt(target);
			camera.fov = game_camera.fov;
			camera.updateProjectionMatrix();

		}
	}
	
	

	
	//カメラ（cam_rotは非VR）
	{
		//マウスドラッグでカメラ回転
		//なめらかにする
		if(0) {
			cam_vec_x *= 0.9;
			cam_vec_y *= 0.9;
			if(GameParam.MouseLock) {
				cam_vec_x += ((ms_mom_x) / window.innerWidth );
				cam_vec_y += ((ms_mom_y) / window.innerHeight);
			}
			else if(ms_button == 3 && debug) {	//右クリック
				cam_vec_x += ((ms_cur_x - ms_last_x) / window.innerWidth ) * -0.4;
				cam_vec_y += ((ms_cur_y - ms_last_y) / window.innerHeight) * -0.4;
			}
			ms_mom_x = 0;
			ms_mom_y = 0;
			GameParam.user.status.cam_rot.y += cam_vec_x;
			GameParam.user.status.cam_rot.x += cam_vec_y;
		}

		//カメラ移動制限（下から見えないように）
		if(!debug && 0) {
			if(GameParam.user.status.cam_rot.x > 0) {
				GameParam.user.status.cam_rot.x = 0;
			}
			if(GameParam.user.status.cam_rot.x + 0 < -Math.PI/2) {
				GameParam.user.status.cam_rot.x =  - Math.PI/2 - 0;
			}
		}
		
		
		ms_last_x = ms_cur_x;
		ms_last_y = ms_cur_y;
	}

	if(0){
		let pos = player.mesh.position;
		const n = 0.2;
		world_view.position.set(
			world_view.position.x * n - pos.x * (1-n),
			world_view.position.y * n - pos.y * (1-n),
			world_view.position.z * n - pos.z * (1-n)
		);
//		world_view.updateMatrixWorld(true);
	}

	if(upd_count > 0) {
		if(short_time > 0) {	//ログ消す
			if(--short_time == 0) {
				ui_needsUpdate = true;
				short_msg.length = 0;
			}
		}
		if(GameParam.GamePause == "fadeout" || GameParam.GamePause == "fadein") {
			FadeUpdate(true);
		}
		else {
			//必要な時だけUI更新
			if(ui_needsUpdate) {
				drawUI();
				ui_needsUpdate = false;
			}
			//2D表示物
			if(GameParam.GamePause == "") {
				drawMiniMap();
			}
			else if(GameParam.GamePause == "menu") {
				//メニュー
				drawMenuTop();
			}
			else if(GameParam.GamePause == "message") {
				//メッセージ
				event.drawMessage();
			}
			else if(GameParam.GamePause == "event") {
				if(event.draw()) {
					drawMenuTop(false);
				}
			}
		}

		{
			//太陽の位置を常にキャラに合わせることにより、shadowMapを効率的に使う
			let player = getPlayableChara();
			let pos = player.mesh.position.clone();
			let pos2 = pos.clone();
			pos.add(world_view.position);
//			let pos3 = pos.clone();
			pos.add(sun_position);
			directionalLight.position.copy(pos);
			directionalLight.target = player.mesh;
			//directionalLight.shadow.camera.updateProjectionMatrix();

			if(debug && cameraHelper) {
				cameraHelper.update();
			}
		}
		
	}

	return upd_count;

}	//gameUpdate


function render() {
	if(0) {
	var delta = clock.getDelta();
	if(!isActive) return;

	if(LoadingUpdate(delta)) {
		//if(PauseFlag == 0) {
			gameUpdate(delta*1);
		//}
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
}
function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	canvas_init(false);

	renderer.setSize( window.innerWidth, window.innerHeight );
}



function onProgress( xhr ) {

	if ( xhr.lengthComputable ) {

		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

	}

}

//キャラがフリーになったら移動開始
function orderMapMove(no, prev, move) {
	next_map = no;
	prev_map = prev;
	
	if(move) {
		GameParam.user.status.position = null;	//座標指定なし
		menu.saveMapping();	//現在のマッピングを保存
		GameParam.user.status.drop_flag = [];
		item_reset = true;
		sound.play("field_move");
	}
//	else ロード・やり直し後など
}

//直接マップ移動
function startMapMove(end_func) {
	
	//新しいマップを読み込む
	function nextStage(data, mesh) {
		GameParam.MapSizeX = data.SizeX;
		GameParam.MapSizeZ = data.SizeZ;
		stage.setTerrain(terrain_data = data.terrain);
		updateStage(mesh);
		end_func();
		menu.quickSave();	//マップ移動直後の状態を保存
		
		//地名表記
		setShortMessage(Data.LocationName[GameParam.user.status.mapno]);
	}
	//前のマップに戻る
	function prevStage() {
		if(GameParam.user.status.map_prev >= 0) {
			setShortMessage("ステージ読み込みエラー:"+Data.LocationName[GameParam.user.status.mapno]);
			//立ち位置をちょっとだけ修正
			let x,z;
			[x,z] = getStartPoint(GameParam.user.status.mapno);
			GameParam.user.status.mapno = GameParam.user.status.map_prev;
			GameParam.user.status.map_prev = -1;
			const y = stage.getHeightf(x,z) + GameParam.AtariSize;
			getPlayableChara().physicsBody.position.set(x,y,z);
		}
		end_func();
	}
	//マップチェンジ
	new Promise(function(resolve, reject) {
		file_loader.setResponseType('json');
		file_loader.load(
			'map/map'+GameParam.user.status.mapno+'.json',
			function(data) {

				if(data.mesh_path) {
					mmd_loader.load( "model/"+data.mesh_path, function ( mmd ) {
						convertLambertMaterial(mmd,false);
						if(data.mesh_path.indexOf("boss2")>= 0) {
							mmd.scale.set(0.1,0.1*0.66,0.1);
						}
						else {
							mmd.scale.set(0.1,0.1,0.1);
						}
						mmd.receiveShadow = true;
						obj_mesh.push(mmd);

						nextStage(data, mmd);

						if(data.waterline) {
							GameParam.mesh.water.position.y = data.waterline;
						}
						
						resolve();
					}, null,
						//MMDの読み込み失敗したので戻る
						function() {
							prevStage();
							resolve();
						}
					);
				}
				else {
					//通常の推移
					nextStage(data, null);
					resolve();
				}
			},
			null,
			//json読み込み失敗
			prevStage
		);
	});
}


//TextSprite
const CTEX_W = 128;
const CTEX_H = 32;
function drawText(canvas, text, color, clear) {
	let context = canvas.getContext('2d');
	context.font = "24px sans-serif";
	if(clear== undefined || clear) {
		context.clearRect(0,0,canvas.width,canvas.height);
	}

	context.fillStyle = (color == undefined) ? "rgba(255,255,255,1)" : color;
	context.strokeStyle = "rgba(0,0,0,1)";
	context.lineWidth = 2;
	
	const fontWidth  = context.measureText(text).width;
	const fontHeight = context.measureText("A").width;
	const x = (canvas.width  - fontWidth )/2;
	const y = (canvas.height + fontHeight)/2;
	context.strokeText(text, x,y);
	context.fillText(text, x,y);
}

function createCanvasTexture(canvas) {

	let texture = new THREE.Texture(canvas);
	let material = new THREE.SpriteMaterial({map: texture});
	let sprite = new THREE.Sprite(material);
	sprite.renderOrder += GameParam.AlphaOrder;
	sprite.scale.set(1,CTEX_H/CTEX_W,1);
	material.depthWrite = false;
	material.depthTest = false;
	material.map.needsUpdate = true;

	return sprite;
}


//CanvasTextureを生成
//空きがあればそこを使う
function getCanvasTexure(uid, w, h) {

	let w2 = (w == undefined) ? CTEX_W : w
	let h2 = (h == undefined) ? CTEX_H : h
	for(let i=0;i<ctex_info.length;i++) {
		let t = ctex_info[i];
		if(uid == undefined) {
			if(!t.enable && t.canvas.width == w2 && t.canvas.height == h2) {
				return t;
			}
		}
		else if(uid == t.uid) {
			return t;
		}
	}

	let mesh;
	let canvas = document.createElement('canvas');
	canvas.width  = w2;
	canvas.height = h2;

	ctex_group.add( mesh = createCanvasTexture(canvas) );
	ctex_info.push(
		{
			enable : true,
			canvas : canvas,
			mesh : mesh,
			count : 0,
			type : null,
			param1 : 0,
			param2 : 0,
			param3 : 0,
			uid : uid,
		}
	);
	return ctex_info[ ctex_info.length-1 ];
}
function updateCanvasTexture() {
	for(let i=0;i<ctex_info.length;i++) {
		let t = ctex_info[i];
		if(!t.enable) continue;
		if(t.type == "damage") {
			t.count++;
			if(t.count < 30) {
				t.mesh.position.y += 0.01;
			}
			else if(t.count < 60) {
			}
			else if(t.count < 90) {
				t.mesh.position.y += 0.01;
				t.mesh.material.opacity = (90 - t.count) / 30;
			}
			else {
				t.mesh.visible = false;
				t.enable = false;
			}
		}
		if(t.type == "life") {
			let upd = false;
//			const isEnemy = (t.uid != "player");
			if(t.count < 20) {
				if(t.count++ == 0) upd = true;
			}
			else {
				let old = t.param2;
				t.param2 = Math.max(t.param2 - (1.0/120.0), t.param1);	//ダメージで減る
				if(t.param2 <= 0 && !t.param3.playable) {	//死んでしばらくしたら消える
					if(++t.count > 60) {
						t.mesh.visible = false;
						t.enable = false;
					}
				}
				if(old != t.param2) {
					upd = true;
				}
			}

			/*if(isEnemy)*/ {
				const chara = t.param3;
				if(upd) {
					DrawLife(t.canvas, t.param1, t.param2, (chara.lost > 0));
					t.mesh.material.map.needsUpdate = true;
				}
				//位置更新
				if(chara.life > 0) {
					t.mesh.position.copy(chara.mesh.position);
					t.mesh.position.y += 1.5;
				}
				if(chara.playable) {
					t.mesh.visible = false;
					if(upd) ui_needsUpdate = true;
				}
			}
			/*else {
				if(upd) {
					//プレイヤー用
					//DrawLife(canvas_ui, t.param1, t.param2, 160,10,200,24);
					ui_needsUpdate = true;
				}
			}*/
		}
		if(t.type == "armor") {
			const chara = t.param3;
			{
				let context = t.canvas.getContext('2d');
				let old = t.param1;
				if(chara.armor_break == 0) {
					t.param1 = chara.armor;
					context.fillStyle = "rgba(0,0,255,0.6)";
				} else {
					t.param1 = chara.armor_break / GameParam.ArmorRecoverTime;
					context.fillStyle = "rgba(255,255,0,0.6)";
				}
				if(old != t.param1) {
					context.clearRect(0,0, t.canvas.width,t.canvas.height);
					context.beginPath();
					let x = t.canvas.width/2, y = t.canvas.height/2;
					context.arc(x,y, y, 0, (1-t.param1)*Math.PI*2);
					context.lineTo(x,y);
					context.fill();

					if(chara.armor_break == 0) {
						drawText(t.canvas,"Guard","rgb(255,255,255)",false);
					}
					else {
						drawText(t.canvas,"Break","rgb(255,0,0)",false);
					}

					t.mesh.material.map.needsUpdate = true;
				}
				//位置更新
				if(chara.life > 0) {
					t.mesh.position.copy(chara.mesh.position);
					t.mesh.position.y += 1.5;
				}
			}
			if(chara.life <= 0 || !chara.enable) {
				t.mesh.visible = false;
				t.enable = false;
			}
		}
	}
}
function clearCanvasTexture() {
	for(let i=0;i<ctex_info.length;i++) {
		let t = ctex_info[i];
		if(!t.enable) continue;
		if(t.mesh) t.mesh.visible = false;
	}
}
function DamageText(damage_pt, pos, playable) {
	pos = pos.clone();
	pos.x += (Math.random() - 0.5) * 1.1;
	pos.y += (Math.random() - 0.0) * 0.6;
	pos.z += (Math.random() - 0.5) * 1.1;
	let damage_text = damage_pt + "!";
	
	let ctex = getCanvasTexure();

	drawText(ctex.canvas, damage_text, playable ? "rgb(128,192,255)" : "rgb(255,255,255)");
	ctex.mesh.material.opacity = 1;
	ctex.mesh.material.map.needsUpdate = true;
	ctex.mesh.position.copy(pos);
	ctex.mesh.scale.set(1,CTEX_H/CTEX_W,1);
	ctex.mesh.visible = true;
	ctex.enable = true;
	ctex.count = 0;
	ctex.type = "damage";
}

function DrawLife(canvas, low, high, lost, x, y, aw, ah, clear) {
	const waku = 2;
	const w = ((aw == undefined) ? canvas.width    : aw) - waku*2;	//ゲージの大きさ
	const h = ((ah == undefined) ? canvas.height/2 : ah) - waku*2;
	let context = canvas.getContext('2d');
	if(clear == undefined || clear == true) {
		context.clearRect(0,0,canvas.width,canvas.height);
	}
	x = (x == undefined) ? 0 : x;
	y = (y == undefined) ? 0 : y;

	
	context.lineWidth = 0;
	context.fillStyle = "rgb(192,192,192)";
	context.fillRect(x,y,w+waku*2,h+waku*2);
	context.fillStyle = "rgb(64,0,64)";
	context.fillRect(x+waku,y+waku,w,h);

	if(lost == 0 || lost == undefined) {
		//ダメージ
		if(high > 0) {
			context.fillStyle = "rgb(192,0,0)";
			context.fillRect(x+waku,y+waku,w*high,h);
		}
		//現在
		if(low > 0) {
			let gradient = context.createLinearGradient(x,0,x+w,0);
		    gradient.addColorStop(0.0 , 'rgb(0,128,128)');
		    gradient.addColorStop(1.0 , 'rgb(0,255,0)');

			context.beginPath();
			context.fillStyle = gradient;//"rgb(0,192,0)";
	//		context.fillRect(x+waku,y+waku,w*low,h);
			context.rect(x+waku,y+waku,w*low,h);
			context.fill();
		}
	}
	else {
		context.fillStyle = "rgb(255,255,0)";
		context.fillRect(x+waku,y+waku,w*low,h);
	}
}
function DrawSkill(canvas, now, max, clear) {
	const waku = 2;
	const x = 0;
	const y = 0;
	const w = canvas.width    - waku*2;	//ゲージの大きさ
	const h = canvas.height/2 - waku*2;
	let context = canvas.getContext('2d');
	if(clear == undefined || clear == true) {
		context.clearRect(0,0,canvas.width,canvas.height);
	}
	if(max == 0) return;

	context.lineWidth = 0;
	context.fillStyle = "rgb(192,192,192)";
	context.fillRect(x,y,w+waku*2,h+waku*2);
	context.fillStyle = "rgb(32,32,32)";
	context.fillRect(x+waku,y+waku,w,h);

	let gradient = context.createLinearGradient(x,0,x+w,0);
    gradient.addColorStop(1.0 , 'rgb(64,64,255)');
    gradient.addColorStop(0.0 , 'rgb(0,0,64)');

	context.beginPath();
	context.fillStyle = gradient;
	context.rect(x+waku,y+waku,w*(now/max),h);
	context.fill();
}
//damage == undefined 初回
function SetLife(chara, damage) {
	let ctex;
	//if(!chara.playable || getPlayableChara() != chara) {
		let pos = chara.mesh.position.clone();
		pos.y += chara.height*2;
		
		ctex = getCanvasTexure(chara.name);

		ctex.mesh.material.opacity = 1;
		ctex.mesh.material.map.needsUpdate = true;
//		ctex.mesh.position.copy(pos);
		ctex.mesh.scale.set(1/2,CTEX_H/CTEX_W/2,1);
		ctex.mesh.visible = (damage == undefined) ? false : damage;
	/*}
	else {
		for(let i=0;i<ctex_info.length;i++) {
			let t = ctex_info[i];
			if(t.uid == "player") {
				ctex = t;
			}
		}
		if(ctex == undefined) {
			ctex_info.push(
				{
					enable : true,
					canvas : null,//canvas_ui,
					mesh : null,
					count : 0,
					type : null,
					param1 : 0,
					param2 : 0,
					param3 : 0,
					uid : "player",
				}
			);
			ctex = ctex_info[ ctex_info.length-1 ];
		}
	}*/
	ctex.enable = true;
	ctex.count = 0;
	ctex.type = "life";
	
	if(chara.playable && chara.lost > 0) {
		ctex.param1 = Math.min(chara.lost / GameParam.RecoverTime, 1);
	}
	else {
		ctex.param1 = (chara.life_max != 0) ? (chara.life / chara.life_max) : 1;
	}
	if(ctex.param1 < 0) ctex.param1 = 0;
	if(damage == undefined) ctex.param2 = ctex.param1;
	ctex.param3 = chara;
}
function SetArmor(chara) {
	if(chara.playable || !chara.enable || chara.life <= 0) return;

	let ctex;
	let pos = chara.mesh.position.clone();
//	pos.x += 0.5;
	pos.y += chara.height*2 - 0.25;
	
	ctex = getCanvasTexure(chara.name+"-armor", 128,64);

	ctex.mesh.material.opacity = 1;
//	ctex.mesh.material.map.needsUpdate = true;
//	ctex.mesh.position.copy(pos);
	ctex.mesh.scale.set(0.25*2,0.25,1);
	ctex.mesh.visible = true;
	ctex.enable = true;
	ctex.count = 0;
	ctex.type = "armor";
	
	ctex.param1 = 0;
	ctex.param2 = 0;
	ctex.param3 = chara;
}
function SetSkill(chara) {
	if(!chara.playable) return;

	let ctex;
	ctex = getCanvasTexure(chara.name+"-skill");

	ctex.enable = true;
	ctex.count = 0;
	ctex.type = "skill";
	
	ctex.param1 = 0;
	ctex.param2 = 0;
	ctex.param3 = chara;
	
	DrawSkill(ctex.canvas, chara.skill, chara.skill_max, true);
	ui_needsUpdate = true;
}

function SetDebugText(text, pos) {
	if(debug) {
		let ctex = getCanvasTexure();

		drawText(ctex.canvas, text);
		ctex.mesh.material.opacity = 1;
		ctex.mesh.material.map.needsUpdate = true;
		ctex.mesh.position.copy(pos);
		ctex.mesh.scale.set(1,CTEX_H/CTEX_W,1);
		ctex.mesh.visible = true;
		ctex.enable = true;
		ctex.count = 0;
		ctex.type = "debug";
	}
}

//flag : true=statusからchara_infoへ false=chara_infoからstatusへ
function updateLife(name, flag) {
	let i = 0;
	for(let f of friend_name) {
		if(f == name) break;
		else i++;
	}
	if(i < 3) {
		let player = btl.get(name);
		if(flag) {
			player.life_max = GameParam.user.status.life_max[i];
			player.life     = GameParam.user.status.life[i];

			player.skill_max = GameParam.user.status.skill_max[i];
			player.skill     = GameParam.user.status.skill[i];
		}
		else {
			GameParam.user.status.life_max[i] = player.life_max;
			GameParam.user.status.life[i]     = player.life;

			GameParam.user.status.skill_max[i] = player.skill_max;
			GameParam.user.status.skill[i]     = player.skill;
		}
	}
}

//特技の段位から生命力や技力を計算
function calcStatus() {
	for(let i=0;i<3;i++) {
		let player = btl.get(friend_name[i]);
		let old_life = GameParam.user.status.life_max[i];
		let nxt_life;
		let old_skill = GameParam.user.status.skill_max[i];
		let nxt_skill;
		GameParam.user.status.life_max[i] = nxt_life = 150 + (GameParam.user.getSkill(i,10)-1) * 25;	//特技：生命力
		if(old_life != 0 && nxt_life > old_life) {	//最大値が増えた分だけ回復
			GameParam.user.status.life[i] += nxt_life - old_life;
		}

		GameParam.user.status.skill_max[i] = nxt_skill = 10 + (GameParam.user.getSkill(i,11)-1) * 5;	//特技：集中力
		if(old_skill != 0 && nxt_skill > old_skill) {	//最大値が増えた分だけ回復
			GameParam.user.status.skill[i] += nxt_skill - old_skill;
		}
		//ライフの反映
		updateLife(friend_name[i], true);

		//描画反映
		SetLife(player);
		SetSkill(player);
	}
/*	let skill_max = 0;
	let skill_old = GameParam.user.status.skill_max;
	skill_max += GameParam.user.getSkill(i,11)-1;	//集中力 10+3人x1x9 = 
	skill_max = Math.round(10+skill_max*40/(3*8));
	GameParam.user.status.skill_max = skill_max;
	if(skill_old != 0 && skill_max > skill_old) {	//最大値が増えた分だけ回復
		GameParam.user.status.skill_point += skill_max - skill_old;
	}
*/
}

function cureAll() {
	for(let i=0;i<3;i++) {
		GameParam.user.status.life[i]  = GameParam.user.status.life_max[i];
		GameParam.user.status.skill[i] = GameParam.user.status.skill_max[i];
	}
	calcStatus();
	ui_needsUpdate = true;
}
//フェードインする前にやっておきたいこと（配置など）
function EventInit() {
	const mapno = GameParam.user.status.mapno;
	switch(mapno) {
	case 27:
		sound.play("bgm_event","FIELD");
		btl.get("hotaru").visible = false;
		btl.get("kumo").visible = false;
		break;
	}
}
//イベント：マップ開始時
//ロード後にも通るため必ずevent_flagでチェックすること
function EventStart_Map() {
	const mapno = GameParam.user.status.mapno;
	let event_flag = GameParam.user.status.event_flag;

	//ボス戦ならそちらへ
	for(let i=0;i<enemy_search_list.length;i++) {
		const boss = enemy_search_list[i].boss;
		if(boss) {
			//ボスが設定されている・撃破済みならイベントを挟まず即戦闘
			if(GameParam.user.status.event_flag["clear_boss"+boss]) {
			}
			else {
				EventStart_BossBegin(i);
				return;
			}
		}
	}
	const button_name = {
		"xbox":[
			"A","B","X","Y","LB","RB","LT","RT","OPTION","MENU","L3","R3",
		],
		"ps":[
//			"△","○","×","□","L2","R2","L1","R1","OPTION","SHARE","L3","R3",
			"×","○","□","△","L1","R1","L2","R2","SHARE","OPTION","L3","R3",
		],
	};
	function Btn(name) {
		const no = GameParam.Assign[name];
		if(no != undefined) {
			if(no < button_name[icon_type].length) {
				return button_name[icon_type][no] + "ボタン";
			}
			return no + "ボタン";
		}
		return "?ボタン";
	}
	
	switch(mapno) {
	case 0:
		if(event_flag["opening"] == undefined) {
			let btn_help = [
				"操作方法",
				"（キーボード・マウス使用時）\n"+
				"移動：ASDWもしくは十字キー\n"+
				"決定：Z　キャンセル：X\n"+
				"操作キャラ変更：TAB　メニュー：C\n"+
				"武術による攻撃：左／右クリック・ホイールクリック\n"+
				"ジャンプ：スペース　防御：SHIFT\n"
				];
			if(GameParam.Assign != null) {
				btn_help.push(
					"（ゲームコントローラ使用時）\n"+
					"決定："+Btn("enter")+"　キャンセル："+Btn("cancel")+"\n"+
					"操作キャラ変更："+Btn("change")+"　メニュー："+Btn("pause")+"\n"+
					"武術による攻撃："+Btn("attack1")+"・"+Btn("attack2")+"・"+Btn("attack3")+"\n"+
					"ジャンプ："+Btn("jump")+"　防御："+Btn("guard")+"\n"
				);
			}
			else {
				btn_help.push(
					"DualShock(PS4以降推奨)やXBOX用などの\n"+
					"XInputに対応したゲームコントローラがあれば、\n"+
					"USBやBluetoothで繋いで遊ぶこともできます。"
				);
			}

			event.start([
/*				{name:"move", owner:"tamami", rotation:"ayame"},
				{name:"move", owner:"ayame", rotation:"karin"},
				{name:"move", owner:"karin", rotation:"tamami"},
*/				{name:"move", owner:"hotaru", rotation:"tamami"},
				{name:"wait", chara:true, count:0},
				{name:"talk", owner:"hotaru", text:["みなさん！大変です！"]},
//				{name:"camera", chara:["hotaru","tamami"], rotation:new THREE.Vector3(Math.PI*0.0, Math.PI*1.75, 0), zoom:0.6, chase:true },
				{name:"camera", chara:["hotaru"], rotation:new THREE.Vector3(Math.PI*0.0, Math.PI*1.75, 0), zoom:0.6, chase:true },
//				{name:"move", owner:"hotaru", base:"tamami", offset:new THREE.Vector3(0,0,3), rotation:"tamami"},	//駆け寄る
				{name:"move", owner:"tamami", point:0, rotation:"hotaru"},	//駆け寄る
				{name:"move", owner:"ayame",  point:1, rotation:"hotaru"},
				{name:"move", owner:"karin",  point:2, rotation:"hotaru"},
				{name:"move", owner:"hotaru", point:3, rotation:"tamami"},	//駆け寄る
				{name:"wait", chara:true, count:0},
//				{name:"meeting", owner:"hotaru", distance:1.0},
				{name:"camera", chara:["hotaru","tamami"], rotation:new THREE.Vector3(0, Math.PI*1.75, 0), zoom:0.4 },
				{name:"talk", owner:"hotaru", text:["倉に保管されていた、龍神様の宝玉が\n盗まれてしまいました！"]},
				{name:"talk", owner:"karin", text:["それって、ご加護で村を守っていたという…"]},
				{name:"talk", owner:"tamami", text:["とてもまずいことになるのでは！？"]},
				{name:"talk", owner:"hotaru", text:["龍神様は長い間飢餓や災害、病魔から\nこの村を守ってきました。","しばらくの間は大丈夫だとは思いますが、\nじきにこの村は厄災に見舞われるでしょう。"]},
				{name:"talk", owner:"ayame", text:["犯人に心当たりは？"]},
				{name:"talk", owner:"hotaru", text:["宝玉のあった保管庫の近くに、こんなものが…"]},
				{name:"wait", count:45},
				{name:"talk", owner:"tamami", text:["衣服の切れ端でしょうか？"]},
				{name:"move", owner:"hotaru", rotation:"ayame"},
				{name:"talk", owner:"ayame",  text:["これは… 「キキョウの里」の忍び装束です。\n間違いありません！"]},
				{name:"talk", owner:"hotaru", text:["奪還をお願いできますか？\n私もこの病の身でなければ力になれたのですが…"]},
				{name:"talk", owner:"karin",  text:["ほたるちゃんは家でゆっくりしていてください。"]},
				{name:"move", owner:"hotaru", rotation:"tamami"},
				{name:"talk", owner:"tamami", text:["私達の力で、取り戻してみせましょう！"]},
				{name:"talk", owner:"hotaru", text:["ありがとうございます。\nでは、お気をつけて…。"]},
				{name:"camera", disable:true },
				{name:"func", callback:function(){	//イベントBGM→ステージBGM
					sound.stop("FIELD");
					sound.play("bgm_spring", "FIELD");
				}},
				{name:"talk", text:btn_help},
				]);
			event_flag["opening"] = true;
		}
		break;
	
	case 9:	//海岸
		if(event_flag["fast_travel"] == undefined) {
			event.setMessage(["メニューから「超速旅」が使えるようになりました。","いわゆるファストトラベルです。\n一度訪れた場所へ瞬時に移動できます。"]);
			event_flag["fast_travel"] = true;
		}
		break;

		//ラスト前イベント
	case 27:
		event.start([
//			{name:"func", callback:function(){btl.get("kumo").visible=false;}},
//			{name:"camera", chara:["tamami"], rotation:new THREE.Vector3(0, 0, 0), zoom:0.5, chase:true, fov:50 },
			{name:"move", owner:"tamami", point:0, rotation:"tomoka"},	//駆け寄る
			{name:"move", owner:"ayame",  point:2, rotation:"tomoka"},
			{name:"move", owner:"karin",  point:1, rotation:"tomoka"},
//			{name:"wait", count:180},
			{name:"camera", chara:["emily","ayame"], rotation:new THREE.Vector3(0, 0, 0), zoom:0.3, chase:true, fov:30 },
			{name:"talk", owner:"momoko", text:["！？ どうして連れてきちゃったの！？"], target:"tomoka"},
			{name:"talk", owner:"tomoka", text:["もういいでしょう。桃子ちゃん"],target:"tamami", look:"momoko"},
			{name:"talk", owner:"tomoka", text:["事を収めるには３人のお力がどうしても必要でした。"]},
			{name:"talk", owner:"tsumugi", text:["衣装の切れ端を落としておいたのは、\nあなたたちをここに連れてくるためです。"],target:"tamami"},
			{name:"talk", owner:"emily", text:["乱暴なことして、すみましぇん…"],target:"tamami"},
			{name:"talk", owner:"momoko", text:["３人とも聞いてないよ！\nお姉ちゃんのために宝玉を取ってきてくれたんじゃ\nなかったの！？"]},
			{name:"talk", owner:"tsumugi", text:["桃子にはあのようなつらい目に\nあってほしくなかったのです。"],target:"tamami",look:"momoko"},

			{name:"talk", owner:"tamami", text:["先ほどから話しが見えないのですが…"]},
			{name:"talk", owner:"emily", text:["あの宝玉は村に幸を呼び込むのはご存じでしゅね"]},
			{name:"talk", owner:"tomoka", text:["その代償として、ひとりの人間が\n呪いを受けることは知らないでしょう？","ですよね？──さん。"]},
			{name:"talk", owner:"karin", text:["えっ…！？ それって…"]},

			{name:"func", callback:function(){btl.get("hotaru").visible=true;}},
			{name:"move", owner:"hotaru", point:3},	//ほたる現れる
			{name:"camera", chara:["hotaru"], rotation:new THREE.Vector3(0, -1, 0), zoom:0.7, fov:30, chase:true },
			{name:"wait", chara:true},
			{name:"wait", count:120},
			{name:"move", owner:"tamami", point:0, rotation:"hotaru"},	//向き変更
			{name:"move", owner:"ayame",  point:2, rotation:"hotaru"},
			{name:"move", owner:"karin",  point:1, rotation:"hotaru"},
			{name:"camera", chara:["emily","ayame"], rotation:new THREE.Vector3(0, 0, 0), zoom:0.3, chase:true, fov:30 },

			{name:"talk", owner:"momoko", text:["ほたるお姉ちゃん…！"], target:"hotaru"},
			{name:"talk", owner:"tamami", text:["えええっ？！"]},
			{name:"talk", owner:"karin", text:["桃子ちゃんが"]},
			{name:"talk", owner:"ayame", text:["ほたる殿の妹！？"]},

			{name:"talk", owner:"hotaru", text:["久しぶり。","とはいっても随分合ってないから\n顔も覚えていないんだけど。\n姉妹だから分かるよ。"],look:"momoko"},
			{name:"talk", owner:"hotaru", text:["真実を話しましょう。\n私達の一族は代々その宝玉の呪いを\n引き継いできました。",
												"宝玉の力によって村から不幸は消えてなくなります。\nでも、その代償として血縁者の体の自由を奪います。",
												"妹…桃子が生まれてまもなく、当時の桃子は呪いに\n耐えられるほど体が強くなく、",
												"死なせないために母方とともに呪いの影響を受けない、\n遠く離れた「キキョウの里」に移り住むことを\n決めました。",
												"こうして私達姉妹は離ればなれになりました。"],look:"ayame"},
			{name:"talk", owner:"ayame", text:["お母様はほたる殿が幼い頃に亡くなられたと\n聞きましたが、そんなことが…"], look:"hotaru"},

			{name:"talk", owner:"hotaru", text:["ええ、本当のことは家の外の者には\n秘密だったのですが。"], look:"tamami"},
			{name:"talk", owner:"tamami", text:["ほたる殿の体がずっと病に冒されていたのは…"], look:"hotaru"},
			{name:"talk", owner:"hotaru", text:["呪いの影響です。\n皮肉なことにも、宝玉が村を離れたおかげでここまで\n歩いてこれるくらいには回復しましたが"]},
			{name:"talk", owner:"tomoka", text:["桃子ちゃんはその呪いを引き受けるために\n私たちに宝玉を持ってくるようお願いされまして。"], look:"hotaru"},
			{name:"talk", owner:"momoko", text:["桃子には…\nこの呪いを引き継がせてくれないの？"], target:"hotaru"},
			{name:"talk", owner:"hotaru", text:["いけません。\nお姉ちゃんの言うことは素直に聞くことです。"], target:"momoko"},
			{name:"talk", owner:"momoko", text:["ずるいよ…"], target:"kumo"},

			{name:"talk", owner:"tsumugi", text:["私達は桃子の母方の願いで、ずっと桃子を守り\n村から遠ざけてきました。呪いが及ばないように"]},
			{name:"talk", owner:"tomoka", text:["どこかであなたたちの村の噂を聞きつけたのか…\nというわけで私達３人でひと芝居打ったという\nわけですね"]},
			{name:"talk", owner:"ayame", text:["どうして話してくれなかったのですか？\n言っていただければ、他にやり方はあったでしょう"], look:"tomoka"},
			{name:"talk", owner:"tomoka", text:["村の処遇はこちらで決めることではありませんから、\nあなたたちの力を試していました。",
												"呪いの宿命を背負うだけの器であるかどうかを。"]},
			{name:"func", callback:function(){
				sound.stop("FIELD");
				fadeOut(function(){
					load_seq = 22;
					sound.play("battle_gameover");
				});
			}},
			{name:"exit"},
/*
			{name:"talk", owner:"kumo", text:["クッ、そろそろ潮時か…\n代わりの宿主も見つかったことだし\n乗り移るとするか"], unknown:true},

			{name:"move", owner:"tamami", point:0, rotation:"kumo"},	//向き変更
			{name:"move", owner:"ayame",  point:2, rotation:"kumo"},
			{name:"move", owner:"karin",  point:1, rotation:"kumo"},
			{name:"func", callback:function(){btl.get("kumo").visible=true;}},

			{name:"talk", owner:"hotaru", text:["お出ましのようです。"],target:"kumo"},
			{name:"func", callback:function(){sound.play("roar_boss2");}},
			{name:"camera", chara:["kumo"], rotation:new THREE.Vector3(0, 1, 0), zoom:1.0, fov:40 },
			{name:"wait", chara:true, count:180},
			{name:"camera", chara:["emily","ayame"], rotation:new THREE.Vector3(0, 0, 0), zoom:0.3, chase:true, fov:30 },
			{name:"talk", owner:"tamami", text:["こいつは…！"],target:"kumo"},
			{name:"talk", owner:"hotaru", text:["龍神というのは隠すためのおとぎ話です。\n宝玉の中に封じられていた【怨毒の大蜘蛛】は\n不幸を餌とする存在です。",
												"スズランの村が平穏だったのは\nこの大蜘蛛のおかげでもあるのですが…",
												"でも、私一人ならよかったのですが、\n妹に手を出すなら絶対に許しません！"]},
			{name:"talk", owner:"ayame", text:["ほたる殿一人にそんな重荷を背負わせていたなんて…\n知らなかったとはいえ、不甲斐ない！"], target:"kumo"},

			{name:"talk", owner:"kumo", text:["もう姉は用済みだ！\nいくら病にしてもこいつから吸える不幸が\nありゃしねぇよ！"]},

			{name:"talk", owner:"karin", text:["花咲夜のみなさんも力を貸していただけますか！？"],target:"kumo"},
			{name:"func", callback:function(){sound.play("battle_battou");}},
			{name:"talk", owner:"emily", text:["もちろんでしゅ！"],target:"kumo"},
			{name:"func", callback:function(){sound.play("battle_battou");}},
			{name:"talk", owner:"tsumugi", text:["もとよりそのつもりでいました！"],target:"kumo"},
			{name:"func", callback:function(){sound.play("battle_battou");}},
			{name:"talk", owner:"tomoka", text:["蜘蛛さんにはおしおきが必要ですね～"],target:"kumo"},
			{name:"talk", owner:"tamami", text:["桃子殿には指一本触れさせません。\n珠美より背の小さい子は味方です！"],target:"kumo"},
			{name:"talk", owner:"tsumugi", text:["（えっ、やはり私たちは敵だと…？）"],look:"tamami"},
			{name:"talk", owner:"tomoka", text:["紬さん？\n今勘違いをしてないですか？"],look:"tsumugi"},
			{name:"talk", owner:"tsumugi", text:["…はっ！？"],look:"tomoka"},
*/
			{name:"exit"},
		]);
		break;
		
	}
}
/*
{"name":"blink_r","rate":0},
{"name":"blink_l","rate":0},
{"name":"fun","rate":0},
{"name":"joy","rate":0},
{"name":"sorrow","rate":0},
{"name":"angry","rate":0},
*/
//イベント：会話スタート
function EventStart_TalkNPC(name)
{
	const mapno = GameParam.user.status.mapno;
	let event_flag = GameParam.user.status.event_flag;

	switch(name) {
	case "hotaru":
		if(mapno == 0) {
			//OPイベント後
			event.start([
				{name:"talk", owner:"hotaru", text:["みなさん、お気をつけて…。"]},
				]);
		}
		else if(event_flag["clear_boss2"] &&
			event_flag["hotaru_boss3clear"] == undefined) {
			//紬 撃破後はじめてほたるに合う
			event.start([
				{name:"camera", chara:["hotaru","tamami"], rotation:new THREE.Vector3(0, Math.PI/2, 0), zoom:0.4 },
				{name:"meeting", owner:"hotaru", distance:1.3},
				{name:"wait", chara:true, count:0},
				{name:"talk", owner:"hotaru", text:["あ、みなさん…"]},
				{name:"talk", owner:"tamami", text:["ほたる殿、本当に体は大丈夫なのですか？\nどうしてここまで…"]},
				{name:"talk", owner:"karin",  text:["私たちに何か隠してない？"]},
				{name:"talk", owner:"hotaru", text:["ごめんなさい…\n今は言えません。"]},
				{name:"talk", owner:"ayame",  text:["疑ってるわけじゃなくて、ほたる殿が心配なんです。","誰かのためにつらいのを我慢しているような、\nそんな目をしています。"]},
				{name:"talk", owner:"tamami", text:["珠美達はほたる殿を信じます。","だから、珠美達をもっと頼ってください。"]},
				{name:"talk", owner:"hotaru", text:["みなさん、ありがとう…","宝玉と…桃子ちゃんにお会いしたら必ずお話します。\nお約束します。"]},
				{name:"func", callback:function(){event_flag["hotaru_boss3clear"] = true;}},
				{name:"exit"},
			]);
		}
		else if(event_flag["hotaru_first"] == undefined) {
			//外ではじめて会話
			event.start([
				{name:"camera", chara:["hotaru","tamami"], rotation:new THREE.Vector3(0, Math.PI/2, 0), zoom:0.4 },
				{name:"meeting", owner:"hotaru", distance:1.3},
				{name:"wait", chara:true, count:0},
				{name:"talk", owner:"hotaru", text:["あ、みなさんお疲れです…"]},
				{name:"talk", owner:"tamami", text:["ほたる殿！？お体は大丈夫なのですか？"]},
				{name:"talk", owner:"hotaru", text:["ええ、今日は体の調子がよくて\nみなさんの助けになればとここまで来てしまいました。"]},
				{name:"talk", owner:"ayame", text:["助けだなんて、お家で休んでてください。"]},
				{name:"talk", owner:"hotaru", text:["本当に大丈夫です。\nずっと家の中にいるのもかえって体によくないですし。"]},
				{name:"wait", count:45},
				{name:"talk", owner:"hotaru", text:["ところで、それ…"]},
				{name:"talk", owner:"tamami", text:["鬼が落とした牙ですね。\n不思議な力を感じたのでとりあえず持ってきて\nしまったのですが…"]},
				{name:"talk", owner:"hotaru", text:["それ、完全に鬼の魂が抜けきっていないようなのです。"]},
				{name:"talk", owner:"karin", text:["うえっ？！　それ大丈夫なの？！"]},
				{name:"talk", owner:"hotaru", text:["適当に捨てたりしますと、そこからまた鬼が\n生まれてきてしまいます。"]},
				{name:"talk", owner:"ayame", text:["まるで作物の種ですね…\nとても危ないのでは？"]},
				{name:"talk", owner:"hotaru", text:["この状態から鬼になるまで何年もかかりますが、\n危険であることには変わりありません。","おじいちゃんから家に代々伝わる儀式で、\n成仏させることができます。\nやってみましょうか？"]},
				{name:"talk", owner:"tamami", text:["ええ、ぜひお願いします！"]},
				{name:"func", callback:function(){trade_item();}},
				{name:"wait", count:45},
				{name:"talk", owner:"karin", text:["なんか体があったかい…"]},
				{name:"talk", owner:"hotaru", text:["成仏した鬼の魂は生命の源、「霊魂」になります。"]},
				{name:"talk", text:["「霊魂」はメニューの「強化」で仲間の特技や武術の\n段位を上げるのに使えます。"]},
				{name:"talk", owner:"tamami", text:["助かりました。ほたる殿。"]},
				{name:"talk", owner:"hotaru", text:["困ったことがあればいつでも言ってください。"]},
				{name:"func", callback:function(){event_flag["hotaru_first"] = true;}},
				{name:"exit"},
			]);
		}
		else {
			//交換屋ほたる
			let task = [
				{name:"talk", owner:"hotaru", text:["みなさんお疲れ様です。"]},
			];
			if(GameParam.user.status.trade_point >= 10) {
				//交換回数が10回を超えていて、かつ生命力・技力が減っている
				for(let i=0;i<3;i++) {
					if (GameParam.user.status.life_max[i] != GameParam.user.status.life[i] ||
						GameParam.user.status.skill_max[i] != GameParam.user.status.skill[i]) {
						task.push(
							{name:"talk", owner:"hotaru", text:["これよかったら食べてください。"]},
							{name:"func", callback:function(){
								cureAll();
								GameParam.user.status.trade_point -= 10;
								sound.play("field_cure");
							}},
							{name:"talk", text:["特製おにぎりを食べて体力・技力が完全回復した！"]},
						);
						break;
					}
				}
			}
			const item_list = GameParam.user.getItemList();
			let cost_point = 0;
			let count = 0;
			for(let n in item_list) {
				const info = GameParam.user.getInfo(n);
				if(info.index >= 6 && info.index <= 9) {
					cost_point += info.cost * GameParam.user.status.item[n];
					count++;
				}
			}
			if(count == 0) {
				//鬼素材を持っていない
				task.push(
					{name:"talk", owner:"hotaru", text:["鬼の牙とかあったらまたお願いしますね。"]},
				);
			}
			else {
				task.push(
					{name:"select", text:"鬼の素材 "+count+"個を\n霊魂 "+cost_point+"に変えますか？", no:"select_no" },
					{name:"func", callback:function(){trade_item();}},
					
					{name:"talk", callback:function(){ return ["霊魂が "+cost_point+"増えた！"]; }},
					{name:"talk", owner:"hotaru", text:["困ったことがあればいつでも言ってください。"]},
					{name:"exit"},
					{name:"label", label:"select_no" },
					{name:"talk", owner:"hotaru", text:["そうですか…\nでは、気をつけて。"]},
				);
			}
			task.push({name:"exit"});
			event.start(task);
		}
		break;
	}
	ui_needsUpdate = true;
}
//鬼素材を交換する
function trade_item() {
	const item_list = GameParam.user.getItemList();
	let count = 0;
	for(let n in item_list) {
		const info = GameParam.user.getInfo(n);
		if(info.index >= 6 && info.index <= 9) {
			//鬼素材
			count += info.cost * GameParam.user.status.item[n];
			GameParam.user.status.item[n] = 0;
			GameParam.user.status.trade_point++;
		}
	}
	GameParam.user.status.cost_point += count;
	sound.play("field_itemtrade");
	return count;
}
//ボス戦前会話
function EventStart_BossBegin(index) {
	const boss_no = enemy_search_list[index].boss;
	switch(boss_no) {
	default:
	case 1:	//boss1 エミリー
		event.start([
			{name:"camera", chara:["ayame"], rotation:new THREE.Vector3(0, 1, 0), zoom:0.5, chase:true, fov:50 },
			{name:"move", owner:"tamami", point:0},	//駆け寄る
			{name:"move", owner:"ayame",  point:2},
			{name:"move", owner:"karin",  point:1},
			{name:"wait", chara:true, count:0},
//			{name:"wait", count:0},
			{name:"camera", chara:["emily"], rotation:new THREE.Vector3(0, Math.PI/2+1, 0), zoom:0.5, fov:30 },
			{name:"wait", count:180},
			{name:"camera", chara:["ayame","emily"], rotation:new THREE.Vector3(0, Math.PI/2, 0), zoom:0.5, chase:true, fov:30 },
			{name:"func", callback:function() { EventStorePosition(["emily"]); }},
			{name:"talk", owner:"ayame", text:["あなたが宝玉を盗んだ、キキョウの里の使者ですね？"]},
			{name:"talk", owner:"emily", text:["見つかってしまいましたね。"]},
			{name:"talk", owner:"karin", text:["金色の、髪…"]},
			{name:"talk", owner:"emily", text:["龍神の宝玉は私達『花咲夜』がいただきました。"]},
			{name:"talk", owner:"tamami",text:["あれを返してください！\nあれがなければスズランの村は…"]},
			{name:"talk", owner:"emily", text:["返す…？\nあれは私達主のものです。","それに、宝玉は仲間に渡しました。\nわたしはあなたたちを足止めしなくてはなりません。\n大和撫子として。"]},
			{name:"talk", owner:"ayame", text:["人の大事なものを盗んで、なにが大和撫子ですか！"]},
			{name:"talk", owner:"karin", text:["無駄な争いはしたくないのですが…"]},
			{name:"talk", owner:"emily", text:["花咲夜・エミリー、参りましゅ！"]},
			{name:"func", callback:function() {
				BattleStart(index);
				//混乱しないようメインとイベントカメラの差異を小さく
				let ecam = event.getCameraInfo();
//				GameParam.user.status.cam_rot.x = ecam.rotation.x;
				GameParam.user.status.cam_rot.y = ecam.rotation.y + Math.PI/2*0;
//				ms_wheel = ecam.zoom;
			}},
			{name:"exit"},
		]);
		break;
	case 2:	//boss2 紬
		event.start([
			{name:"camera", chara:["karin"], rotation:new THREE.Vector3(0, 1, 0), zoom:0.5, chase:true, fov:50 },
//			{name:"move", owner:"tamami", base:"tsumugi", offset:new THREE.Vector3(-10.0,0,-4), rotation:"tsumugi"},	//駆け寄る
//			{name:"move", owner:"ayame",  base:"tsumugi", offset:new THREE.Vector3(-10.5,0,-3), rotation:"tsumugi"},
//			{name:"move", owner:"karin",  base:"tsumugi", offset:new THREE.Vector3(-11.0,0,-2), rotation:"tsumugi"},
			{name:"move", owner:"tamami", point:0},	//駆け寄る
			{name:"move", owner:"ayame",  point:1},
			{name:"move", owner:"karin",  point:2},
			{name:"wait", chara:true, count:0},
			{name:"camera", chara:["tsumugi"], rotation:new THREE.Vector3(0, Math.PI/2+1, 0), zoom:0.5, fov:30 },
			{name:"wait", count:180},
			{name:"camera", chara:["karin","tsumugi"], rotation:new THREE.Vector3(0, Math.PI/2, 0), zoom:0.3, chase:true, fov:30 },
			{name:"func", callback:function() { EventStorePosition(["tsumugi"]); }},
			{name:"talk", owner:"karin",   text:["あなたが紬さんですね？"]},
			{name:"talk", owner:"tamami",  text:["龍神の宝玉を悪用しようとしているのであれば、\n珠美達は許しません！"]},
			{name:"talk", owner:"tsumugi", text:["悪用、ですか…","そもそも貴方たちはあの宝玉に込められた\n真実をご存じで？"]},
			{name:"talk", owner:"karin",   text:["それは一体どういう…？"]},
/*			{name:"talk", owner:"tsumugi", text:["あんなもののために、桃子はんは…"]},
			{name:"talk", owner:"ayame",   text:["その子が依頼主の名なのですか？"]},
*/
			{name:"talk", owner:"tsumugi", text:["桃子はんにどれだけ心配させたか知らないで、\nぶつぶつ…","そもそも龍神なんてものはおとぎ話の…はっ"]},
			{name:"talk", owner:"ayame",   text:["龍神様がなんと？"]},
			{name:"talk", owner:"tsumugi", text:["聞かれてしまったからには堪忍や－！","花咲夜・紬、参ります！"]},
			{name:"func", callback:function() {
				BattleStart(index);
				//混乱しないようメインとイベントカメラの差異を小さく
				let ecam = event.getCameraInfo();
				GameParam.user.status.cam_rot.y = ecam.rotation.y - Math.PI/2*0;
			}},
			{name:"exit"},
		]);
		break;
	case 3:	//boss3 ともか
		event.start([
//			{name:"camera", chara:["tamami"], rotation:new THREE.Vector3(0, 0, 0), zoom:0.5, chase:true, fov:50 },
			{name:"move", owner:"tamami", point:0},	//駆け寄る
			{name:"move", owner:"ayame",  point:2},
			{name:"move", owner:"karin",  point:1},
			{name:"camera", chara:["tomoka"], rotation:new THREE.Vector3(0, Math.PI/2+1, 0), zoom:0.5, fov:30 },
			{name:"wait", chara:true, count:180},
//			{name:"wait", count:180},
			{name:"camera", chara:["tamami","tomoka"], rotation:new THREE.Vector3(0, Math.PI/2, 0), zoom:0.3, chase:true, fov:30 },
			{name:"talk", owner:"tomoka",   text:["宝玉はこの先です。今は言葉はいりません。\n剣で語りあいましょう。","花咲夜・朋花、参る！"]},
			{name:"func", callback:function() { EventStorePosition(["tomoka"]); }},
			{name:"func", callback:function() {
				BattleStart(index);
				//混乱しないようメインとイベントカメラの差異を小さく
				let ecam = event.getCameraInfo();
				GameParam.user.status.cam_rot.y = ecam.rotation.y - Math.PI/2*0;
			}},
			{name:"exit"},
		]);
	}
}
//撃破
function EventStart_BossClear(boss_no) {
	switch(boss_no) {
	default:
	case 1:	//boss1 エミリー
		event.start([
			{name:"camera", chara:["ayame","emily"], rotation:new THREE.Vector3(0, Math.PI/2, 0), zoom:0.5, chase:true, fov:30 },
//			{name:"wait", chara:true, count:0},
			{name:"func", callback:function() {
				let npc = btl.get("momoko");
				let parent = btl.get("emily");
				npc.physicsBody.position.copy(getEventPoint(3).pos);
				npc.physicsBody.position.y += GameParam.AtariSize;
				
				let x = npc.physicsBody.position.x - btl.get("tamami").mesh.position.x;
				let z = npc.physicsBody.position.z - btl.get("tamami").mesh.position.z;
				let r = Math.atan2(x,z);
				npc.mesh.rotation.y = r;
				npc.move_dir = r + Math.PI;
			}},
			{name:"talk", owner:"emily",  text:["完敗でしゅ…"]},
			{name:"talk", owner:"momoko", text:["へぇ、あなたたちがスズラン村の。"], unknown:true},
			{name:"talk", owner:"tamami", text:["小さい女の子…？"]},
			{name:"talk", owner:"ayame",  text:["（珠美殿と背丈はあまり違いませんが…\n空気を読んで黙っておきましょう）"], silent:true, look:"tamami" },
			{name:"talk", owner:"momoko", text:["あの宝玉のおかげでおいしい思いをしてるんでしょ。\nいい気味だわ。"], unknown:true},
			{name:"talk", owner:"tamami", text:["なっ…！"]},
			{name:"talk", owner:"momoko", text:["キキョウの里の桃子よ。","宝玉はいただいたわ。\n桃子にかかれば、もっとうまく使ってやるんだから。"]},
			{name:"talk", owner:"tamami", text:["ぐぬぬ…"]},
			{name:"talk", owner:"ayame",  text:["戦に勝って、勝負に負けたというやつですね…"]},
/*
			{name:"talk", owner:"ayame", text:["あなたからはあの宝玉をただの私利私欲のために使う、\nそんな忍術は感じませんでした。"]},
			{name:"talk", owner:"tamami", text:["一体何をしようとしているのですか？"]},
			{name:"talk", owner:"emily", text:["それは今はまだ言えません。","ですがここは貴方たちに道を譲りましょう。"]},
			{name:"talk", owner:"karin", text:["本当は悪い人じゃないのかな…"]},
*/
			{name:"func", callback:function() {
				orderMapMove(GameParam.user.status.mapno+1);
				cureAll();
			}},
			{name:"exit"},
		]);
		break;
	case 2:	//boss2 紬
		event.start([
			{name:"camera", chara:["karin","tsumugi"], rotation:new THREE.Vector3(0, Math.PI/4, 0), zoom:0.5, fov:30 },
//			{name:"meeting", owner:"tsumugi", distance:1.6},
			{name:"wait", chara:true, count:0},
			{name:"talk", owner:"karin",  text:["やはりあなた方は悪い人には思えません。\n本当の目的を話してもらえないでしょうか？"]},
			{name:"talk", owner:"ayame",  text:["エミリー殿からもあれを私利私欲のために使う、\nそんな忍術は感じませんでした。"]},
			{name:"talk", owner:"tsumugi",text:["ひとつだけ教えましょう。","桃子はんは…\nあれを悪いことにだけは使わないことを約束します。"]},
			{name:"talk", owner:"karin",  text:["じゃあ最初から言ってくれれば、\n村の人や、ほたるちゃんなら宝玉の力を\n貸してくれたんじゃないかな？"]},
			{name:"talk", owner:"tsumugi",text:["村の大事な宝玉を手放すとお思いで？"]},
			{name:"talk", owner:"karin",  text:["どうしてそんなことを！？","ほたるちゃんの優しさはみんな知っています！"]},
			{name:"talk", owner:"tsumugi",text:["そうですね…。その優しさが…\nどうしてもそうはいかない理由なのですけどね…"]},
			{name:"talk", owner:"tamami", text:["えっ…？"]},
			{name:"talk", owner:"tsumugi",text:["見ての通り、宝玉はここにはありません。","キキョウの里で私たちの仲間…\n朋花さんが待っています。"]},
			{name:"talk", owner:"karin",  text:["ほたるちゃんは… 何かを知ってるの…？"]},
			{name:"func", callback:function() {
				orderMapMove(GameParam.user.status.mapno+1);
				cureAll();
			}},
			{name:"exit"},
		]);
		break;
	case 3:	//boss2 朋花
		event.start([
			{name:"camera", chara:["tamami","tomoka"], rotation:new THREE.Vector3(0, Math.PI/4, 0), zoom:0.5, fov:30 },
			{name:"wait", chara:true, count:0},
			{name:"talk", owner:"tomoka",  text:["お見事です。\nでは、ご案内しましょう。","宝玉と、私たちの依頼主、そして、真実へ。"]},
			{name:"func", callback:function() {
//				orderMapMove(GameParam.user.status.mapno+1);
				orderMapMove(27);	//イベント用マップへ
				cureAll();
			}},
			{name:"exit"},
		]);
		break;
	}
}
//所定の位置を覚えておく／呼び出す
var event_pos_list
function EventStorePosition(npc_list){
	event_pos_list = [];
	let plist = getPlayableList();
	for(let p of plist) {
		event_pos_list[p.name] = {
			pos : p.physicsBody.position.clone(),
			rot : p.mesh.rotation.y
		};
	}
	for(let npc of npc_list) {
		let p = btl.get(npc);
		event_pos_list[p.name] = {
			pos : p.physicsBody.position.clone(),
			rot : p.mesh.rotation.y
		};
	}
}
function EventLoadPosition()
{
	for(let nm in event_pos_list) {
		let p = btl.get(nm);
		p.physicsBody.position.copy(event_pos_list[nm].pos);
		p.mesh.position.x = event_pos_list[nm].pos.x;
		p.mesh.position.z = event_pos_list[nm].pos.z;
		p.move_dir = event_pos_list[nm].rot + Math.PI;
		p.mesh.rotation.y = event_pos_list[nm].rot;
	}
}

function getEventPoint(id) {
	for(let i=0;i<terrain_data.length;i++) {
		if(terrain_data[i].name != "point") continue;
		
		const no = (terrain_data[i].item >> 8)&0xff;
		if(no != id) continue;

		return {
			pos : new THREE.Vector3(
				(           i % (GameParam.MapSizeX+1)) * GameParam.MapScale,
				terrain_data[i].height * GameParam.HeightScale,
				(Math.floor(i / (GameParam.MapSizeX+1)))* GameParam.MapScale),
			rot : ((terrain_data[i].item>>16)&0xff)*Math.PI*2/255// + Math.PI
		};
	}
	return null;
}

function keypress(event) {
	if(event.keyCode == 17) {	//ctrl
		if(GameParam.MouseLock) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
}
function keydown(event)
{
	if(event.keyCode >= 65 && event.keyCode <= 90) {	//a-z
		key[String.fromCharCode(event.keyCode)] = true;
	}
	if(event.keyCode >= 48 && event.keyCode <= 57) {	//0-9
		key[String.fromCharCode(event.keyCode)] = true;
	}
	if(event.keyCode == 9) {	//tab
		key["tab"] = true;
	}
	if(event.keyCode == 13) {	//enter
		key["enter"] = true;
	}
	if(event.keyCode == 27) {	//ESC
		key["esc"] = true;
	}
	if(event.keyCode == 16) {	//shift
		key["shift"] = true;
	}
	if(event.keyCode == 32) {	//space
		key[" "] = true;
	}
	if(event.keyCode == 37) {	//left
		key["left"] = true;
	}
	if(event.keyCode == 38) {	//up
		key["up"] = true;
	}
	if(event.keyCode == 39) {	//right
		key["right"] = true;
	}
	if(event.keyCode == 40) {	//down
		key["down"] = true;
	}
	if(event.keyCode == 17) {	//ctrl
		if(GameParam.MouseLock) {
			event.preventDefault();
			event.stopPropagation();
		}
		key["ctrl"] = true;
	}
//	document.getElementById("debugOut").innerHTML += "keydown="+event.keyCode;
	console.log("keydown="+event.keyCode);
}
function keyup(event)
{
	if(event.keyCode >= 65 && event.keyCode <= 90) {	//a-z
		key[String.fromCharCode(event.keyCode)] = false;
	}
	if(event.keyCode >= 48 && event.keyCode <= 57) {	//0-9
		key[String.fromCharCode(event.keyCode)] = false;
	}
	if(event.keyCode == 9) {	//tab
		key["tab"] = false;
	}
	if(event.keyCode == 13) {	//enter
		key["enter"] = false;
	}
	if(event.keyCode == 27) {	//ESC
		key["esc"] = false;
	}
	if(event.keyCode == 16) {	//shift
		key["shift"] = false;
	}
	if(event.keyCode == 32) {	//space
		key[" "] = false;
	}
	if(event.keyCode == 37) {	//left
		key["left"] = false;
	}
	if(event.keyCode == 38) {	//up
		key["up"] = false;
	}
	if(event.keyCode == 39) {	//right
		key["right"] = false;
	}
	if(event.keyCode == 40) {	//down
		key["down"] = false;
	}
	if(event.keyCode == 17) {	//ctrl
		key["ctrl"] = false;
	}
}
function getMesh(name) {
	for(let i=0;i<objInfo.length;i++) {
		if(objInfo[i].name == name) return obj_mesh[i];
	}
	for(let i=0;i<obj_mesh.length;i++) {
		if(obj_mesh[i].name == name) return obj_mesh[i];
	}
	console.log("getMesh "+name+" not found.");
	return null;
}
function getVRM(name) {
	for(let i=0;i<obj_mesh.length;i++) {
		if(obj_mesh[i].name == name) return org_vrm[i];
	}
//	console.log("getVRM "+name+" not found.");
	return null;
}
function getTexture(name) {
	for(let i=0;i<tex_list.length;i++) {
		if(texFiles[i].indexOf(name) == texFiles[i].indexOf("/")+1)
			return tex_list[i];
	}
	return null;
}

var make_mat=0;
//VRMで使用されるMToonMaterialをthree.jsのマテリアルに置き換える
function convertVRMMaterial(mesh, castShadow)
{
	if(mesh.castShadow !== undefined) {
		mesh.castShadow = castShadow;
//		mesh.receiveShadow = castShadow;
	}
	if(mesh.material !== undefined) {
		if(mesh.material.length && 1) {
			for(let i=0;i<mesh.material.length;i++) {
				let new_mat = new THREE.MeshToonMaterial();
/*				let new_mat = new THREE.MeshPhongMaterial( {
					color: 0x808080,
					specular: 0xffffff,
					reflectivity: 10,
					shininess: 10,
					transparent:true,
				} );
*/
				let old_mat = mesh.material[i];
				new_mat.name     = old_mat.name;
				new_mat.map      = old_mat.map;
				new_mat.skinning = old_mat.skinning;
//				new_mat.clipShadows = true;//old_mat.clipShadows;
				new_mat.color    = new THREE.Color(old_mat.color.x*0.8, old_mat.color.y*0.8, old_mat.color.z*0.8);
				new_mat.emissive    = new THREE.Color(old_mat.emissionColor.x, old_mat.emissionColor.y, old_mat.emissionColor.z);
//				new_mat.emissive    = new THREE.Color(0,0,0);
//				new_mat.emissiveIntensity = 0.0;
//				new_mat.emissive    = new THREE.Color(0.5,0.5,0.5);
				new_mat.emissiveMap      = old_mat.emissiveMap;
//				new_mat.shininess       = 30;
				new_mat.transparent		= old_mat.transparent;		//このあたりは固定
				new_mat.side			= old_mat.side;
				new_mat.alphaTest		= 0.3;//old_mat.alphaTest;			//透過優先度問題
				new_mat.morphTargets	= old_mat.morphTargets;
				new_mat.morphNormals	= old_mat.morphNormals;
				/*new_mat.gradientMap     = tex_list[TEX_MTOON];
				tex_list[TEX_MTOON].minFilter = THREE.NearestFilter;
				tex_list[TEX_MTOON].magFilter = THREE.NearestFilter;
				*/

				mesh.material[i] = new_mat;
				make_mat++;
			}
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			convertVRMMaterial(mesh.children[i], castShadow);
		}
	}
}
function convertLambertMaterial(mesh, castShadow)
{
	if(mesh.castShadow !== undefined) {
		mesh.castShadow = castShadow;
	}
	if(mesh.material !== undefined) {
		if(mesh.material.length && 1) {
			for(let i=0;i<mesh.material.length;i++) {
				let new_mat = new THREE.MeshLambertMaterial();
				let old_mat = mesh.material[i];
				new_mat.name     = old_mat.name;
				new_mat.map      = old_mat.map;
				new_mat.skinning = old_mat.skinning;
				new_mat.color    = old_mat.color;
				new_mat.emissive    = old_mat.emissive;
				new_mat.emissiveMap      = old_mat.emissiveMap;
				new_mat.transparent		= old_mat.transparent;		//このあたりは固定
				new_mat.side			= old_mat.side;
				new_mat.alphaTest		= 0.3;//old_mat.alphaTest;			//透過優先度問題
				new_mat.morphTargets	= old_mat.morphTargets;
				new_mat.morphNormals	= old_mat.morphNormals;
//				new_mat.vertexColors	= old_mat.vertexColors;
				new_mat.opacity    = old_mat.opacity;
				mesh.material[i] = new_mat;
				make_mat++;
			}
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			convertLambertMaterial(mesh.children[i], castShadow);
		}
	}
}
function convertFBXMaterial(mesh, transparent)
{
	if(transparent) {
		mesh.renderOrder += GameParam.AlphaOrder;
	}
	if(mesh.material !== undefined) {
		let mat = mesh.material;
		mat.side = THREE.DoubleSide;
		for(let j=0;j<tex_list.length;j++) {
			if(texFiles[j].indexOf("/"+mat.name) > 0) {
				mesh.material = mesh.material.clone();	//複製しないと競合?を起こしてバグる
				mat = mesh.material;
				mat.shininess = 0;
				mat.specular = new THREE.Color(0x0);
				if(transparent != undefined) {
					mat.transparent = transparent;
				}
				mat.map = tex_list[j];
				break;
			}
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			convertFBXMaterial(mesh.children[i], transparent);
		}
	}
}
function setMaterialAlphaTest(mesh, alphaTest)
{
	if(mesh.material !== undefined) {
		if(mesh.material.length) {
			for(let i=0;i<mesh.material.length;i++) {
				mesh.material[i].alphaTest = alphaTest;
			}
		}
		else {
			mesh.material.alphaTest = alphaTest;
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			setMaterialAlphaTest(mesh.children[i], alphaTest);
		}
	}
}
function setMaterialFogDisable(mesh, flag)
{
	if(mesh.material !== undefined) {
		if(mesh.material.length) {
			for(let i=0;i<mesh.material.length;i++) {
				mesh.material[i].fog = flag;
			}
		}
		else {
			mesh.material.fog = flag;
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			setMaterialFogDisable(mesh.children[i], flag);
		}
	}
}
/*function enableShadow(mesh)
{
	if(mesh.castShadow !== undefined) {
		mesh.castShadow = true;
	}
	if(mesh.receiveShadow !== undefined) {
//		mesh.receiveShadow = false;
	}
	if(mesh.material !== undefined) {
//		mesh.material.castShadow = true;
		if(mesh.material.length) {
			for(let i=0;i<mesh.material.length;i++) {
				mesh.material[i].castShadow = true;
			}
		}
	}
	if(mesh.materials !== undefined) {
		for(let i=0;i<mesh.materials.length;i++) {
			mesh.materials[i].castShadow = true;
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			enableShadow(mesh.children[i]);
		}
	}
}*/
function changeSkinColor(mesh, color)
{
	if(mesh.material !== undefined) {
		if(mesh.material.length) {
			for(let i=0;i<mesh.material.length;i++) {
				if(mesh.material[i].name.indexOf("CLOTH") < 0) {
//					mesh.material[i] = mesh.material[i].clone();
					mesh.material[i].color = color;
//					mesh.material[i].needsUpdate = true;
				}
			}
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			changeSkinColor(mesh.children[i], color);
		}
	}
}
function findMaterial(mesh, func)
{
	if(mesh.material !== undefined) {
		if(mesh.material.length) {
			for(let i=0;i<mesh.material.length;i++) {
				func(mesh.material[i]);
			}
		}
	}
	
	if(mesh.children != null) {
		for(let i=0;i<mesh.children.length;i++) {
			findMaterial(mesh.children[i], func);
		}
	}
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
//	if(debug != 3)
	event.preventDefault();
	onTouchDown(event, event.clientX, event.clientY, false);
}

function onTouchDown(event, _x,_y, sp) {

	//UI回避
//	if(window.innerWidth-280 < _x) {
//		return;
//	}
	ms_cur_x = _x;
	ms_cur_y = _y;
	if(!sp) {
		//マウス
		console.log("ms_button"+ms_button);
		if(ms_button == -1) {
			if(event.button == 0) {
				ms_click = 1;
			}
			if(event.button == 1) {	//中ボタン
				ms_click = 2;
			}
			if(event.button == 2) {	//右クリック
				ms_click = 3;
			}
		}
		ms_button = event.button;

	}else {
		//スマートフォン
		if(ms_button == -1) {
			ms_click = 1;
		}
		ms_button = 0;
	}
	if(!GameParam.MouseLock) {
		ms_click = menu.setPoint(_x,_y, ms_click);
	}
	ms_sp = sp;
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
//				if(tutorial.step == 2) tutorial.count = 1;
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
//				if(tutorial.step == 2) tutorial.count = 1;
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
//				if(tutorial.step == 2) tutorial.count = 1;
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
	onTouchMove(event.clientX, event.clientY);
	ms_mom_x += (event.movementX || event.webkitMovementX || event.mozMovementX || 0);
	ms_mom_y += (event.movementY || event.webkitMovementY || event.mozMovementY || 0);
}
function onTouchMove(_x,_y) {
	ms_cur_x = _x;
	ms_cur_y = _y;
	if(!GameParam.MouseLock) {
		menu.setPoint(_x,_y, false);
	}
}


//MouseUp
function mouseup(event) {
//	if(debug != 3)
	event.preventDefault();
	onTouchEnd(false);
}
function onTouchEnd(sp) {
//	if(ms_button == 0) ms_click = 1;
	ms_button = -1;
}

function mousewheel(event) {
	if(debug) {
		ms_wheel += event.wheelDelta / 1000;
//		if(ms_wheel > 12.0) ms_wheel = 12.0;
		if(ms_wheel < 0.1) ms_wheel = 0.1;
	}

	return false;
}

//スマホタッチ
function isUIAreaTouch(event) {
	if(event.changedTouches.length == 1) {
		var x = event.changedTouches[0].clientX;// / window.innerWidth;
		var y = event.changedTouches[0].clientY;// / window.innerHeight;
		if(onUIArea("ui",x,y)) {	//画面右上
			return true;
		}
	}
	return false;
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

function getCanvasImage(name) {
	for(let icon of image_icons) {
		if(icon.src.indexOf("/"+name) >= 0) {
			return icon;
		}
	}
	return null;
}

function getButtonImage(name) {
	return getCanvasImage( icon_type+"_buttons" );
}
//操作可能な状態のボタン表示

function FullScreenSW() {
	if(getFullScreenObject()) {
		endFullScreen();
	}else{
		beginFullScreen();
	}
}


function SoundSW(flg) {
	if(flg) {
		option.sound = !option.sound;
		if(option.sound) {
			sound.enable();
		}
		else {
			sound.disable();
		}
		
		try {
			//メイン
			localStorage.setItem("sound", option.sound);
		} catch (error) {
		}
	}
	let uiButton1 = document.getElementById( 'Sound' );
	if(option.sound) {
		uiButton1.innerHTML = "&#x1F50A;";	//スピーカーOFF
	}else {
		uiButton1.innerHTML = "&#x1F507;";	//スピーカーON
	}
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

function resetDefaultGamePadAssign(index) {
	if(navigator.getGamepads){
		var gamepad_list = navigator.getGamepads();

		if(gamepad_list && gamepad_list.length > 0) {
			for(let i=0;i<gamepad_list.length;i++) {
				var gamepad = gamepad_list[i];
				if(!gamepad || !gamepad.connected) {
					continue;
				}
				if(index == undefined || index == gamepad.index) {
					if(gamepad.buttons != undefined && gamepad.axes != undefined) {
						icon_type = "xbox";
						if(gamepad.id.indexOf("Vendor: 054c") >= 0) {	//たぶんPlayStation系
							icon_type = "ps";
							if(gamepad.id.indexOf("Product: 0268") >= 0) {	//PS3コントローラーのようなもの
								GameParam.Assign = {...Assign_PS3};
								GameParam.Assign.index = gamepad.index;
								return;
							}
						}
						GameParam.Assign = {...Assign_Default};
						GameParam.Assign.index = gamepad.index;
						return;
					}
				}
			}
		}
	}
}


//マウスロック
function MouseLockStart() {
	if(document.exitPointerLock) {
		if(GameParam.Config.TPSMode) {
			const element = window.document.documentElement;
			element.requestPointerLock();
		}
	}
}
function MouseLockEnd() {
	if(document.exitPointerLock) {
		if(GameParam.Config.TPSMode) {
			const element = window.document.documentElement;
			document.exitPointerLock();
		}
	}
}


function lockChangeNotify() {
	if(GameParam.Config.TPSMode) {
		if(document.pointerLockElement != null ||
		document.mozPointerLockElement != null) {
//			console.log('The pointer lock status is now locked');
			GameParam.MouseLock = 1;
		} else {
//			console.log('The pointer lock status is now unlocked');
			GameParam.MouseLock = 0;

			//ポインタロックが解除されたらメニューへ
			if(GameParam.GamePause == "" && load_seq == -1) {
//				requestPause = 1;
			}
		}
	}
}
