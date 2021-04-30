
//import * as THREE from '../three.js-master/build/three.module.js';
import { Effect } from './effect.js';
import { LineMaterial } from '../three.js-master/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from '../three.js-master/examples/jsm/lines/Wireframe.js';
import { WireframeGeometry2 } from '../three.js-master/examples/jsm/lines/WireframeGeometry2.js';
import { Data } from './Data.js';

var debugRot = new THREE.Vector3();
var debugPos = new THREE.Vector3();

var Battle = function (options) {
	var scope = this;
	var GameParam = options.GameParam;
	var sound = options.sound;
	var physics = options.physics;
	var effect = new Effect({GameParam:GameParam});
	//animation
	var animation_data = null;
	var animation_list = options.animation_list;
	var chara_info = new Array();
	const SEQ_NONE		= -1;
	const SEQ_WALK		= 0;
	const SEQ_ATTACK	= 1;
	const SEQ_WEAPON	= 2;	//武器を持つ・構える（戦闘開始終了）
	const SEQ_STEP		= 3;	//ステップ移動
	const SEQ_GUARD		= 4;	//ガード
	const SEQ_STOP		= 5;	//なにもしない
	const SEQ_BREAK		= 6;	//ボス用BREAK
	const SEQ_HOLD		= 7;	//拘束
	const SEQ_STUN		= 8;	//動けない
	const SEQ_DAMAGE	= 10;
	const SEQ_DAMAGE_DOWN = 11;
	const SEQ_DEAD		= 12;
	const SEQ_DEAD_END	= SEQ_DEAD+1;
	const SEQ_LOSE		= SEQ_DEAD+2;	//ボス用
	const SEQ_EVENT_TALK = 20;
	//flag
	const FLAG_JUMP       = (1<<0);	//未使用？
	const FLAG_JUMP_END   = (1<<1);
	const FLAG_SLOW_DOWN  = (1<<2);	//落下遅くなる
	const FLAG_MOVE_FORCE = (1<<3);	//攻撃中でも強制移動
	const FLAG_DIR_CTRL   = (1<<4);	//攻撃中でも途中で向きを変えられる
	const FLAG_STOP_DOWN  = (1<<5);	//落下止める
	const FLAG_EVENT_MOVE = (1<<6);	//イベント用
	//attack_flag
	const ATTACK_UPPER   = (1<<0);	//打ち上げ
	const ATTACK_STRONG  = (1<<1);	//強攻撃
	const ATTACK_ROLLING = (1<<2);	//水平回転
	const ATTACK_RUSH    = (1<<3);	//突進（強制移動）
	const ATTACK_CHARGE  = (1<<4);	//チャージ攻撃
	const ATTACK_NOGUARD = (1<<5);	//防御無視
	const ATTACK_SKILL_DOWN = (1<<6);	//「気合い」使用中
	
	const RECOVER_TIME = 60*15;	
	const RECOVER_LIFE = 0.33;	//回復値
	const STUN_TIME = 120;

	var old_body = {
		"J_Bip_C_Hips"       : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_C_Spine"      : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_C_Chest"      : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_C_UpperChest" : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_C_Neck"       : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_L_Shoulder"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_L_UpperArm"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_L_LowerArm"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_L_Hand"       : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_R_Shoulder"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_R_UpperArm"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_R_LowerArm"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_R_Hand"       : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_L_UpperLeg"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_L_LowerLeg"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_L_Foot"       : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_R_UpperLeg"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_R_LowerLeg"   : {x:  0.0, y:  0.0, z:  0.0},
		"J_Bip_R_Foot"       : {x:  0.0, y:  0.0, z:  0.0},
	};
	
	/*var body_list = [
		{ name:"root",              x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_C_Hips",      x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_C_Spine",     x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_C_Chest",     x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_C_UpperChest",x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_C_Neck",      x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_L_Shoulder",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_L_UpperArm",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_L_LowerArm",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_L_Hand",      x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_R_Shoulder",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_R_UpperArm",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_R_LowerArm",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_R_Hand",      x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_L_UpperLeg",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_L_LowerLeg",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_L_Foot",      x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_R_UpperLeg",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_R_LowerLeg",  x:  0.0, y:  0.0, z:  0.0 },
		{ name:"J_Bip_R_Foot",      x:  0.0, y:  0.0, z:  0.0 },
	];
	var face_list = [
		{ name:"blink_r",	rate: 0.0, param:null },
		{ name:"blink_l",	rate: 0.0, param:null },
		{ name:"fun",		rate: 0.0, param:null },
		{ name:"joy",		rate: 0.0, param:null },
		{ name:"sorrow",	rate: 0.0, param:null },
		{ name:"angry",		rate: 0.0, param:null },
		{ name:"a",			rate: 0.0, param:null },
		{ name:"i",			rate: 0.0, param:null },
		{ name:"u",			rate: 0.0, param:null },
		{ name:"e",			rate: 0.0, param:null },
		{ name:"o",			rate: 0.0, param:null },
	];*/
	var yubi_list = [
		"J_Bip_L_Index1",
		"J_Bip_L_Index2",
		"J_Bip_L_Index3",
		"J_Bip_L_Index3_end",
		"J_Bip_L_Middle1",
		"J_Bip_L_Middle2",
		"J_Bip_L_Middle3",
		"J_Bip_L_Middle3_end",
		"J_Bip_L_Ring1",
		"J_Bip_L_Ring2",
		"J_Bip_L_Ring3",
		"J_Bip_L_Ring3_end",
		"J_Bip_L_Little1",
		"J_Bip_L_Little2",
		"J_Bip_L_Little3",
		"J_Bip_L_Little3_end",
//					"J_Bip_L_Thumb1",
//					"J_Bip_L_Thumb2",
//					"J_Bip_L_Thumb3",
//					"J_Bip_L_Thumb3_end",

		"J_Bip_R_Index1",
		"J_Bip_R_Index2",
		"J_Bip_R_Index3",
		"J_Bip_R_Index3_end",
		"J_Bip_R_Middle1",
		"J_Bip_R_Middle2",
		"J_Bip_R_Middle3",
		"J_Bip_R_Middle3_end",
		"J_Bip_R_Ring1",
		"J_Bip_R_Ring2",
		"J_Bip_R_Ring3",
		"J_Bip_R_Ring3_end",
		"J_Bip_R_Little1",
		"J_Bip_R_Little2",
		"J_Bip_R_Little3",
		"J_Bip_R_Little3_end",
//					"J_Bip_R_Thumb1",
//					"J_Bip_R_Thumb2",
//					"J_Bip_R_Thumb3",
//					"J_Bip_R_Thumb3_end",
	];
	const boss_ik = [
		"右前足IK",
		"右中足IK",
		"右後足IK",
		"左前足IK",
		"左中足IK",
		"左後足IK",
//		"右腕",
//		"左腕",
	];
	var boss_org_pos = [];	//蜘蛛専用

	var atkobj = new Array();
	
const StepFrame = 38;

//初期状態をセットする
function setChara(name, enable, x,y,z) {

	let i = Number(name);
	if(isNaN(i)) {
		for(let j=0;j<chara_info.length;j++) {
			if(chara_info[j].name == name) {
				i = j;
				break;
			}
		}
		if(isNaN(i)) return;
	}

	let p = chara_info[i];
	p.enable = enable;
	if(enable) {
		p.visible = true;
		p.mesh.position.set(x,y,z);
		p.physicsBody.position.set(x,y,z);
		p.physicsBody.wakeUp();
		p.physicsBody.velocity.set(0,0,0);
		p.physicsBody.force.set(0,0,0);
		p.lost = 0;
		p.hold_weapon = 0;
		
		if(p.npc) {
			p.life = p.life_max = 100000;

			//NPC当たり
			if (p.hitBall == null) {
				p.hitBall = new THREE.Sphere(p.mesh.position, 1.0);
			}
		}
		else if(p.playable) {
			if(GameParam.user.status.select_chara == i)
				p.friend = false;
			else
				p.friend = true;
		}
		else {
			//仮
//			p.life = p.life_max = p.boss*2000 + 400;
			p.life = p.life_max = 500;
			const data = Data.Enemy[p.type];
			if(data != undefined) {
				p.life = p.life_max = (data.life + (GameParam.user.status.mapno * data.step * 5));
			}
			p.friend = false;
			if(p.weapon != null) {
				p.weapon.visible = true;
				p.hold_weapon = 1;
			}
		}
		//初期化
		//p.sequence = 0;
		p.count = 0;
		p.walk_pow = 0;
		p.jump_count = 0;
		p.swim_count = p.is_swim = 0;

		if(!p.npc) {
			GameParam.SetLife(p);

			p.attackBody.wakeUp();
			p.damageBody.wakeUp();
		}
		actionReset(p);

		if(p.name == "kumo" && p.mesh != null) {
			for(let ik of boss_ik) {
				let bone = findBone(p.mesh, ik);
				if(bone && bone.position) {
					boss_org_pos[ik] = bone.position.clone();
				}
			}
		}
	}
	else {
		actionReset(p);
		p.visible = false;
		p.physicsBody.position.set(0,-100,0);
		p.physicsBody.sleep();
		if(p.weapon != null) {
			p.weapon.visible = false;
		}
		if(p.marukage) {
			p.marukage.visible = false;
		}
	}
}
//煙とともに現れる
function setArrive(name) {
	let player = get(name);
	if(player != null && player.enable) {
		effect.set("smoke", player.mesh.position, {player:player, color:(player.playable)?0xffffff:0x000000});
		player.visible = false;
		setTimerEvent(
			null,
			10,
			null,
			function(){
				player.visible = true;
//				console.log("arrive "+player.name+" count:"+GameParam.count);
			});
	}
}
//world_view上のキャラを削除。initCharaの前に
function clearEnemyNPC() {
	for(let i=0;i<chara_info.length;i++) {
		if(chara_info[i].playable && !chara_info[i].npc) continue;
		const meshs = [
			chara_info[i].mesh,
			chara_info[i].debug_atari0,
			chara_info[i].debug_atari1,
			chara_info[i].debug_atari2,
			chara_info[i].marukage,
			chara_info[i].sub_obj,
			chara_info[i].weapon,
		];
		const bodys = [
			chara_info[i].physicsBody,
			chara_info[i].damageBody,
			chara_info[i].attackBody,
		];
		let j;
		for(j=0;j<meshs.length;j++) {
			if(meshs[j] != undefined && meshs[j] != null) {
				GameParam.world_view.remove(meshs[j]);
			}
		}
		for(j=0;j<bodys.length;j++) {
			if(bodys[j] != null) {
				physics.removeBody(bodys[j]);
			}
		}
	}
	for(let i=0;i<chara_info.length;i++) {
		if(chara_info[i].playable && !chara_info[i].npc) continue;
		chara_info.splice(i, 1);	//リストから削除
		i--;
	}
}

function createCharaInfo(name, mesh) {
	
	//共通
	let marukage = null;
	if(GameParam.PerfMode == 0) {
		marukage = new THREE.Mesh(
			new THREE.CircleGeometry(0.35, 12).rotateX(-Math.PI/2),
			new THREE.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.5, map:GameParam.getTexture("marukage")}));
		marukage.renderOrder += GameParam.AlphaOrder;
		GameParam.world_view.add(marukage);
	}

	return {
		type : "",
		playable : false,
		friend : false,
		physicsBody : null,
		damageBody : null,
		attackBody : null,
		name : name,
		mesh : mesh,
		marukage : marukage,
		enable : false,
		height : 0,
		move_count : 0,
		walk_count : 0,
		move_dir : 0,
		dir_lock : false,
		jump_count : 0,
		old_position : null,
		not_drop : 0,
		walk_pow : 0,
		swim_count : 0,
		is_swim : 0,
		hold_weapon : 0,
		weapon : null,
		rengeki : false,
		damage_count : 0,
		attack_enable : false,
		attack_flag : 0,
		fix_count : 0,
		flag : 0,
		atari_bone : null,
		rush_pow : 0,
		step_dir : 0,
		step_count : 0,
		guard_count : 0,
		charge_type : 0,
		charge_count : 0,
		attack_type : 0,
		mini_damage : 0,
		sub_type: "",
		sub_obj : null,
		root_bone : "J_Bip_C_Hips",
		damage_down : 0,
		talk : "a",
		look : null,
		walk_type : "",
		hitSnd : "",
		dmg_table : [],

		life : 0,
		life_max : 0,
		armor : 0,
		armor_break : 0,
		muteki : 0,
		attack_up : 0,
		lost : 0,
		skill : 0,
		skill_max : 0,
		stun:0,
		
		weapon_offset : 0,
		
		sequence : SEQ_WALK,
		anim_from  : -1,
		anim_to    : -1,
		anim_end_func : null,
		anim_update_func : null,
		anim_play  : 0,
		anim_frame : 0,
		max_frame  : 0,
		nameraka   : false,
		anim_type  : 0,
		anim_rate : 1,
		count : 0,
		
		step2_vec : new THREE.Vector3(0,0,0),
		step2_count : 0,
		step2_max : 0,
		
		//CPU用
		npc : false,		//非戦闘キャラ
		hitBall : null,
		hitNPC  : null,
		target : -1,
		enemy_mode : 0,		//移動状態
		next_attack : -1,	//次の攻撃パターン
		boss_attack_count : 0,		//ボス用
		capture : null,		//捕獲対象
		
		debug_atari0 : null,
		debug_atari1 : null,
		debug_atari2 : null,
		dps : 0,	//防御前
		dps2 : 0,	//防御後
		dpsTime : 0,
	};
}
//共通配置設定
const assignChara = [
	{
		name:"tamami",
		weapon:"blade",
		clone:false,
		playable:true,
	},
	{
		name:"ayame",
		weapon:null,
		clone:false,
		playable:true,
	},
	{
		name:"karin",
		weapon:"cane",
		clone:false,
		playable:true,
	},
	//分身
	{
		name:"ayame",
		weapon:null,
		clone:true,
		playable:true,
	},
	{
		name:"ayame",
		weapon:null,
		clone:true,
		playable:true,
	},
];
//キャラ剛体とか
let chara_mat  = new CANNON.Material("chara");
let damage_mat = new CANNON.Material("damage");
let attack_mat = new CANNON.Material("attack");
//let MoveShape      = new CANNON.Sphere(GameParam.AtariSize);
//let MoveShapeLarge = new CANNON.Sphere(GameParam.AtariSize*5);
//let DmgShape       = new CANNON.Box(new CANNON.Vec3(0.2,0.75,0.2));
let AtkShapeEnemy1 = new CANNON.Sphere(GameParam.AtariSize*0.75);
let AtkShapeEnemy2 = new CANNON.Sphere(GameParam.AtariSize*1.5);
let AtkShapeNormal = new CANNON.Sphere(GameParam.AtariSize*1.25);
let AtkShapeBlade  = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.8));	//刀
let AtkShapeCane   = new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 1.2));	//杖
//let AtkShapeClub   = new CANNON.Box(new CANNON.Vec3(0.15, 0.15, 0.4));	//こん棒
let AtkShapeLarge  = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1.5));	//ラスボス用

function createBody(chara) {
	let mesh = chara.mesh;
	if(mesh == null) return;

	if(chara.type == "kumo") {
		chara.root_bone = "センター";
	}
	else {
		chara.root_bone = "J_Bip_C_Hips";
	}
	chara.height = findBone(mesh, chara.root_bone).position.y;
//	let enemy = (chara.type.indexOf("enemy") >= 0) ? 4 : 0;	//敵専用当たり
	let enemy = (!chara.playable) ? 4 : 0;	//敵専用当たり

	let mass = 100;
	let scale = 1.0;
	if(chara.boss == 2) {
		scale = 5;
		mass *= 5;
	}
	chara.AtariSize = GameParam.AtariSize * scale;
	let MoveShape = new CANNON.Sphere(chara.AtariSize);
	chara.physicsBody = physics.addBody(  MoveShape, mass, chara_mat, 2/*group*/, 1|2/*mask*/ );
	chara.physicsBody.sleep();
	chara.physicsBody.addEventListener("collide", function(e) {
		var contact = e.contact;
		var name1 = contact.bi.material.name;
		var name2 = contact.bj.material.name;
		/*
		if(name2.indexOf("itembox-") >= 0) {
			//GameParam.OpenItemBox(name2);
		}*/
		/*if(name2 == "field")*/ {
			let player;
			for(let i=0;i<chara_info.length;i++) {
				player = chara_info[i];
				if(player.physicsBody == contact.bi) {
					if(player.jump_count > 0 && !(player.flag & FLAG_JUMP_END) && contact.bi.velocity.y <= 0) {
						player.flag |= FLAG_JUMP_END;
						if(player.jump_count > 10) player.jump_count = 10;
					}
					break;
				}
			}
		}
	});

	if(!chara.npc) {
	let AtkShape;
	if(chara.type == "tamami" || chara.type == "tomoka") {
		AtkShape = AtkShapeBlade;
	}
	else if(chara.type == "karin" || chara.type == "tsumugi") {
		AtkShape = AtkShapeCane;
	}
	else if(chara.playable || chara.npc) {
		AtkShape = AtkShapeNormal;
	}
	else {
		AtkShape = AtkShapeEnemy1;
		if(chara.boss == 2) {
			AtkShape = AtkShapeLarge;
		}
		/*if(chara.weapon != null) {
			AtkShape = AtkShapeClub;
		}*/
		else if(chara.type == "enemy10" || chara.boss) {	//大型用
			AtkShape = AtkShapeEnemy2;
		}
	}

	//mass=0同士では当たらないらしい
	//片方が0だと時々当たらないことがある
	let friend_mask = (!chara.playable) ? 8 : 16;
	let enemy_mask  = (!chara.playable) ? 16 : 8;
	let DmgShape       = (chara.boss == 2) ? new CANNON.Sphere(GameParam.AtariSize*2.5) : new CANNON.Box(new CANNON.Vec3(0.2,chara.height,0.2));
	chara.damageBody = physics.addBody( DmgShape, 100/*mass*/, damage_mat, friend_mask|enemy/*group*/, friend_mask|enemy/*mask*/ );
	chara.attackBody = physics.addBody( AtkShape, 100/*mass*/, attack_mat, 0/*group*/, enemy_mask|32/*mask*/ );
//	chara.damageBody.sleep();
//	chara.attackBody.sleep();

	chara.damageBody.addEventListener("collide", function(e) {
		var contact = e.contact;
		var name1 = contact.bi.material.name;
		var name2 = contact.bj.material.name;
		if(name2 == "attack") {
			DamageHit(contact.bi, contact.bj, false);
		}
	});
	chara.attackBody.addEventListener("collide", function(e) {
		var contact = e.contact;
		var name1 = contact.bi.material.name;
		var name2 = contact.bj.material.name;
		if(name2 == "damage") {
			DamageHit(contact.bj, contact.bi, false);
		}
		if(name2.indexOf("itembox-") >= 0) {
			GameParam.OpenItemBox(name2);
		}
	});
	if(GameParam.AtariDebug & 1) {
		let dbg0 = Utility().shape2mesh({
			body: chara.physicsBody,
			color: 0x006666,
		});
		dbg0.children[0].material.transparent = true;
		dbg0.children[0].material.opacity = 0.5;
		dbg0.children[0].renderOrder += GameParam.AlphaOrder;
		chara.debug_atari0 = dbg0;
		GameParam.world_view.add(dbg0);
	}
	if(GameParam.AtariDebug & 2) {
		let dbg1 = Utility().shape2mesh({
			body: chara.attackBody,
			color: 0x660066,
		});
		dbg1.children[0].material.transparent = true;
		dbg1.children[0].material.opacity = 0.5;
		dbg1.children[0].renderOrder += GameParam.AlphaOrder;
		chara.debug_atari1 = dbg1;
		GameParam.world_view.add(dbg1);

		let dbg2 = Utility().shape2mesh({
			body: chara.damageBody,
			color: 0x666600,
		});
		dbg2.children[0].material.transparent = true;
		dbg2.children[0].material.opacity = 0.5;
		dbg2.children[0].renderOrder += GameParam.AlphaOrder;
		chara.debug_atari2 = dbg2;
		GameParam.world_view.add(dbg2);
	}
	}
}

function getEnemyName(id, index) {
	if(id >= 40) {
		const boss_name = [
			"emily","tsumugi","tomoka","kumo",
		];
		return boss_name[id-40];
	}

	const types = ['A','B','C'];
	let name = "enemy";
	if(id < 10) name += "0";
	name += ""+(id);	//0始まり
	if(index != undefined) name += types[index];
	return name;
}
//terrainから作成
function initChara(terrain, init) {
	
	if(init) {
		chara_info = new Array();
		//コモン
		for(let i=0;i<assignChara.length;i++) {
			let org_mesh = GameParam.getMesh(assignChara[i].name);
			let mesh = assignChara[i].clone ? cloneAnimated(org_mesh) : (org_mesh);
			let chara = createCharaInfo(assignChara[i].name, mesh);
			if(assignChara[i].playable) {
				chara.playable = true;
				if(i != GameParam.user.status.select_chara) {
					chara.friend = true;	//自動で戦う
				}
			}
			chara.type = assignChara[i].name;
			if(assignChara[i].clone) chara.name += "_clone";
			createBody(chara);
			if(assignChara[i].weapon != null) {
				chara.weapon = cloneAnimated( GameParam.getMesh(assignChara[i].weapon) );
				GameParam.world_view.add(chara.weapon);
			}
			chara_info.push(chara);
			setChara(chara_info.length-1, false);
			GameParam.world_view.add(chara.mesh);
		}
	}
	//スタート地点を探す
	{
		let x,z,dir;
		[x,z,dir] = GameParam.getStartPoint(GameParam.user.status.map_prev);
		GameParam.user.status.map_prev = -1;
		
		const y = GameParam.stage.getHeightf(x,z) * GameParam.HeightScale + GameParam.AtariSize;
		if(GameParam.Party3Mode) {
			setChara(0, true, x-0.4,y,z  );
			setChara(1, true, x+0.4,y,z-0.65);
			setChara(2, true, x+0.4,y,z+0.65);
		}
		else {
			setChara(0, (GameParam.user.status.select_chara == 0), x,y,z);
			setChara(1, (GameParam.user.status.select_chara == 1), x,y,z-1);
			setChara(2, (GameParam.user.status.select_chara == 2), x,y,z+1);
		}
		if(dir != -1) {
			get(0).move_dir = dir;
			get(1).move_dir = dir;
			get(2).move_dir = dir;
		}
	}
	//マップ上から敵を検索、assignEnemyに同時出現数だけ列挙
	let assignEnemy = new Uint8Array(100);
	for(let i=0;i<terrain.length;i++) {
		if(terrain[i].name != "enemy") continue;
		let enemy_no = [
			(terrain[i].item >>  8) & 0xff,
			(terrain[i].item >> 16) & 0xff,
			(terrain[i].item >> 24) & 0xff,
		];
		let cnt = new Uint8Array(100);
		for (let no of enemy_no) {
			cnt[no]++;
			if (assignEnemy[no] < cnt[no])
				assignEnemy[no] = cnt[no];
		}
	}
	//敵の登録（非表示）
	for(let i=0;i<assignEnemy.length;i++) {
		for(let j=0;j<assignEnemy[i];j++) {
			let name = getEnemyName(i,j);
			let mesh;
			let boss = 0;
			if(i < 40) {
				const mesh_name = getEnemyName(Math.floor(i/10)*10);
				mesh = cloneAnimated(GameParam.getMesh(mesh_name));
			}
			else {
				//ボス用
				mesh = GameParam.getMesh(name);
				boss = 1;
			}
			let chara = createCharaInfo(name, mesh);
			chara.type = boss ? name : getEnemyName(i);
			switch(chara.type) {
			case "enemy03":
				chara.sub_type = "wing";
				chara.sub_obj = cloneAnimated( GameParam.getMesh("wing") );
				GameParam.world_view.add(chara.sub_obj);
				break;
			case "enemy04":
				chara.weapon = cloneAnimated( GameParam.getMesh("club") );
				GameParam.world_view.add(chara.weapon);
				break;

			case "tsumugi":	//紬
				chara.weapon = cloneAnimated( GameParam.getMesh("cane") );
				GameParam.world_view.add(chara.weapon);
				break;
			case "tomoka":	//朋花
				chara.weapon = cloneAnimated( GameParam.getMesh("blade") );
				GameParam.world_view.add(chara.weapon);
				break;
			case "kumo":	//ラスボス
				boss = 2;
				break;
			}
			chara.boss = boss;

			createBody(chara);
			chara_info.push(chara);
			setChara(chara_info.length-1, false);
			GameParam.world_view.add(chara.mesh);
		}
	}
	//NPCの登録
	const npc_name = [
		"hotaru","momoko",
		"emily","tsumugi","tomoka","kumo",
	];
	for(let i=0;i<terrain.length;i++) {
		if(terrain[i].name != "npc") continue;
		
		const no = (terrain[i].item >> 8)&0xff;
		if(no >= npc_name.length) {
			continue;
		}
		const name = npc_name[no];
		const mesh = GameParam.getMesh(name);
		let chara = createCharaInfo(name, mesh);
		chara.npc = true;
		chara.playable = true;
		chara.type = name;
		createBody(chara);
		chara_info.push(chara);

		let x = (           i % (GameParam.MapSizeX+1)) * GameParam.MapScale;
		let z = (Math.floor(i / (GameParam.MapSizeX+1)))* GameParam.MapScale;
		let y = terrain[i].height * GameParam.HeightScale + GameParam.AtariSize;
		
		setChara(chara_info.length-1, true, x,y,z);
		GameParam.world_view.add(chara.mesh);
		chara.move_dir = chara.step_dir = ((terrain[i].item>>16)&0xff)*Math.PI*2/255;	//step_dirはデフォルト向き

	}
}
//ダメージ計算
function calcDamagePlayer(player, objname) {
	let damage;
	let guard = 1;
	//ItemNoをとる
	let no = player.attack_type;
	switch(objname) {
	case "fire":
		no = 1;	//91 陽炎
		break;
	case "thunder":
		no = 3;	//93 裁きの雷
		break;
	case "beam":
		no = 9;	//99 聖なる光
		break;
	case "ice":
		no = 7;	//97 氷の刃
		sound.play("hit_ice");
		break;
	case "quake":
		no = 4;	//94 
//		guard = 0;
		break;

	case "shuriken":
		no = 1;	//81 手裏剣
		break;
	case "explosion":
		no = 4;	//84 焙烙玉
		break;
	case "first_attack":
		no = 21;	//21 抜刀
//		guard = 0;
		break;
	}
	if(no < 10) {
		if(player.type == "tamami") no += 70;
		if(player.type == "ayame" ) no += 80;
		if(player.type == "karin" ) no += 90;
	}

	const info = GameParam.user.getInfo(no);
	const skill = GameParam.user.getSkill(player.type, no);
	damage = info.base;
	if(skill != undefined && skill > 1) damage += info.rate * (skill-1);

	if(objname == undefined) {	//通常攻撃
		if(player.attack_flag & ATTACK_STRONG) damage *= 2.5;
	}
	if(player.attack_flag & ATTACK_CHARGE) {	//溜め攻撃
		const sk2 = GameParam.user.getSkill(player.type, 18);
		if(sk2 > 0) {
			damage *= 0.75 + sk2*0.5;
		}
	}
	if(player.attack_flag & ATTACK_SKILL_DOWN) {	//気合い使用によるパワーダウン
		damage *= 0.7;
	}
	if(player.attack_up > 0) {	//攻撃力アップ
		damage *= 1.15;
	}
	return { damage: (damage * (0.9 + Math.random()*0.3)), guard:guard };
}
function calcDamageEnemy(player, objname) {

	let no = 0;
	switch(objname) {
	case "fire":
		no = 1;	//91 陽炎
		break;
	case "thunder":
		no = 3;	//93 裁きの雷
		break;
	case "ice":
		no = 7;	//97 氷の刃
		break;
	case "beam":
		no = 9;	//99 聖なる光
		break;
	case "tomoka":
		no = 7;	//77 散花
		break;

	case "shuriken":
		no = 1;	//81 手裏剣
		break;
	case "explosion":
		no = 4;	//84 焙烙玉
		break;
		
	default:
		if(!player.boss) {
			let damage = 20;	//旧仕様
			const data = Data.Enemy[player.type];
			if(data != undefined) {
				damage = data.attack + (GameParam.user.status.mapno * data.step*2);
			}
			if(player.attack_flag & ATTACK_STRONG) damage *= 1.4;
			damage = damage * 0.9 + damage * (Math.random()*0.15);
			return { damage: damage, guard:1 };
		}
		no = player.attack_type;
	}
	//ボス用
	if(player.type == "tomoka" ) no += 70;
	if(player.type == "emily"  ) no += 80;
	if(player.type == "tsumugi") no += 90;
	if(player.type == "kumo") no += 70;

	const info = GameParam.user.getInfo(no);
	return { damage: (0.9 + Math.random()*0.3 * (info.base + info.rate * 4)), guard:1 };
}


function calcDamage(player, objname) {
	
	if(player.playable) {
		return calcDamagePlayer(player, objname);
	}
	else {
		return calcDamageEnemy(player, objname);
	}
}
function getCharaFromDamageBody(body) {
	for(let player of chara_info) {
		if(player.damageBody == body) {
			return player;
		}
	}
	return null;
}

function DamageHit(dmgBody, atkBody/*, offset*/, force, objname) {
	let hit = false;
	let attack_player;
	let damage_player;
	for(let i=0;i<chara_info.length;i++) {
		if(chara_info[i].attackBody == atkBody) {
			attack_player = chara_info[i];
		}
	}
	damage_player = getCharaFromDamageBody(dmgBody);
	if(damage_player == null) return false;

	if (damage_player.attackBody != atkBody &&
		((attack_player.attack_enable && damage_player.sequence <= SEQ_DAMAGE_DOWN) || force) &&
		damage_player.muteki == 0 &&
		attack_player.name != damage_player.name)
	{
		hit = true;
		//ヒットエフェクト
		let p1 = damage_player.mesh.position.clone();
//				let p2 = new THREE.Vector3(atkBody.position.x, atkBody.position.y, atkBody.position.z);
		p1.y += damage_player.height;
//				p2.sub(p1);
//				p2.multiplyScalar(0.5);
//				p1.add(p2);
		let p2 = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5);
		p1.add(p2.multiplyScalar(0.66));
		effect.set("hit",p1);	//ヒットエフェクト
		
		//固有エフェクト
		switch(attack_player.type) {
		case "ayame":
		case "emily":
			if(objname == undefined) {	//打撃
				effect.set("attackeff", p1, {player:attack_player, ry:Math.PI});	//衝撃エフェクト
			}
			break;
		}

		if(attack_player.playable) {
			effect.set("circle",p1);	//ヒットエフェクト（プレイヤー用）

			damage_player.dmg_table[ attack_player.type ] = true;	//３人攻撃判定用
		}
		if(damage_player.muteki < 5) damage_player.muteki = 5;
		if(damage_player.playable) {
			//敵の攻撃
		}
		else {
			//味方の攻撃
			GameParam.user.status.combo_time = 0;
			GameParam.user.status.combo_hit++;
		}
		let p = calcDamage(attack_player, objname);
		let damage = p.damage;
		let guard = p.guard;

		//armor値が一定に達するとのけぞり・防御ダウン
		attack_player.dps += Math.round(damage+0.5);
		if(guard) {
			if(!damage_player.playable) {
				if(damage_player.armor_break == 0) {
					const enemy_guard = damage_player.life_max*0.75;	//最大HPの75%以下から減衰
					let dmg=0;
					let guard_rate = 0.75;
					let armor_rate = 1;
					if(damage_player.boss) {
						guard_rate = 1;
						armor_rate = 0.3;
					}
					//鎧砕き
					const sk = GameParam.user.getSkill(attack_player.type,13);
					if(sk > 0) {
						armor_rate += Math.min(GameParam.user.status.combo_hit/(50-sk*5),1);
					}

					if(damage < enemy_guard) {
						dmg = Math.log10(10-damage/enemy_guard*9)*(damage) * guard_rate;	//防御時のダメージ計算
						damage -= dmg;
					}
					damage_player.armor += (((damage) * 3.0 / damage_player.life_max) / 10 + 0.1) * armor_rate;
					if(damage_player.armor > 1.0) {
						damage_player.armor_break = GameParam.ArmorRecoverTime;
						damage_player.armor = 0;
						effect.set("break", p1, {player:damage_player});
						guard = 0;
						sound.play("battle_break");
					}
					if(attack_player.attack_flag & ATTACK_NOGUARD) {
						guard = 0;
					}
				}
				else {
					//BREAK時
					guard = 0;
				}
				GameParam.SetArmor(damage_player, true);
				if(guard) {
					let pos = damage_player.mesh.position.clone();
					pos.y += damage_player.height+0.5;
					effect.set("defence", pos, {player:damage_player});
					
					if(attack_player.hitSnd != "") {
						if(attack_player.hitSnd.indexOf("slash") >= 0) {
							sound.play("guard_slash");
						}
						else {
							sound.play("guard_punch");
						}
					}
				}
				else {
					let cnt=0;
					for(let dmg of damage_player.dmg_table) {
						if(dmg) cnt++;
					}
					if(cnt >= 3) {
						//義勇忍侠花吹雪
						const sk = GameParam.user.getSkill(attack_player.type,20);
						if(sk > 0) {
							damage *= 1.3;
							effect.set("sakura",damage_player.mesh.position,{ry:attack_player.mesh.rotation.y});
//							effect.set("sakura",damage_player.mesh.position,{ry:attack_player.mesh.rotation.y});
							damage_player.dmg_table = [];
						}
					}
				}
				if(attack_player.hitSnd != "") {
					sound.play(attack_player.hitSnd);
				}
			}
			else {
				let guard_flag = 0;
				//ガード状態
				if(damage_player.sequence == SEQ_GUARD) {
					guard_flag = 1;
				}
				else {
					//受け身
					const sk = GameParam.user.getSkill(damage_player.type,15);
 					if(sk > 0 && Math.random() < sk*0.05) {
						guard_flag = 1;
					}
					//お守りで守られる
					else if(GameParam.user.status.amulet >= GameParam.AmuletRate) {
						GameParam.user.status.amulet -= GameParam.AmuletRate;
						guard_flag = 1;
					}
				}

				if(guard_flag) {
					damage *= 0.2;
					sound.play("guard_enemy");
				}
				else {
					guard = 0;
					//素受け
					if(attack_player.hitSnd != "") {
						sound.play(attack_player.hitSnd);
					}
				}
			}
		}

		damage = Math.round(damage+0.5);
		if(attack_player.playable) {
			attack_player.dps2 += damage;
		}
		GameParam.DamageText(damage, damage_player.mesh.position, damage_player.playable);
		damage_player.life -= damage;
		GameParam.SetLife(damage_player, true);
		if(!guard || damage_player.life <= 0 || attack_player.attack_flag & ATTACK_STRONG) {
			if(damage_player.sequence < SEQ_DAMAGE)
				damage_player.damage_count = 0;
			actionReset(damage_player);
			if(damage_player.life <= 0) {
				damage_player.sequence = SEQ_DEAD;
				damage_player.life = 0;
				if(damage_player.boss == 1) {
					damage_player.swim_count = 0;
					damage_player.sequence = SEQ_LOSE;
				}
				
				if(damage_player.playable) {
					sound.play("battle_dead");
				}
			}
			else {
				if(damage_player.boss && damage_player.armor_break > 0) {
					damage_player.swim_count = 0;
					damage_player.sequence = SEQ_BREAK;
				}
				else if(damage_player.sequence != SEQ_STUN) {
					damage_player.sequence = SEQ_DAMAGE;
				}
			}
			if(attack_player.attack_flag & ATTACK_RUSH) {
				if(attack_player.rush_pow-- <= 0) {
					attack_player.attack_flag &= ~ATTACK_RUSH;	//何回か当たると止まる
				}
			}
			if(attack_player.playable) {
				effect.set("sakura",damage_player.mesh.position,{ry:attack_player.mesh.rotation.y});
			}
//@					damage_player.attack_enable = false;
			let v = attack_player.mesh.position.clone();
			v.sub(damage_player.mesh.position);
			v.y = 0;
			v.normalize();
			
			//一定時間内にダメージが蓄積すると吹き飛びに移る
			damage_player.damage_down += damage / (damage_player.life_max * 0.15) * 90;
			if(damage_player.playable) {
//				console.log(damage_player.name+":"+damage_player.damage_down);
			}
 			if(damage_player.sequence == SEQ_DAMAGE &&
 				damage_player.playable &&
 				damage_player.damage_down >= 90) {

 				damage_player.sequence = SEQ_DAMAGE_DOWN;	//吹き飛び
				if(damage_player.playable) {
					sound.play("battle_down");
				}

 				let r = Math.atan2(v.x, v.z);
				let spd = -1.5 * (4/GameParam.physics_speed)/2;
				damage_player.step2_vec.set(Math.sin(r)*spd, spd*-0.3, Math.cos(r)*spd);
				damage_player.step2_count = 1;
				damage_player.step2_max = 45;
				damage_player.mesh.rotation.y = r + Math.PI;
			}
			else if(attack_player.attack_flag & ATTACK_STRONG) {
				if(damage_player.playable) {
					v.multiplyScalar(-20);
				}
				else {
					v.multiplyScalar(-16);
				}
				damage_player.physicsBody.velocity.set(v.x, v.y, v.z);
			}
			else if(damage_player.playable) {
				v.multiplyScalar(-8);
				damage_player.physicsBody.velocity.set(v.x, v.y, v.z);
			}
			else if(attack_player.attack_flag & ATTACK_UPPER) {
				let r = Math.atan2(v.x, v.z);
				r = getNearRotation(attack_player.mesh.rotation.y, r);
//						attack_player.mesh.rotation.y = r;

//						v.multiplyScalar(-4);
				v.x = 0;
				v.z = 0;
				v.y = 6;
				if(isGround(damage_player) || isGround(attack_player)) {
					damage_player.physicsBody.velocity.set(v.x, v.y, v.z);
					//attack_player.physicsBody.velocity.set(v.x, v.y, v.z);
				}

			}
		}
		else {
			//小ダメージ（攻撃などはキャンセルしないがのけぞる）
			if(!damage_player.playable && damage_player.mini_damage == 0) {
				damage_player.mini_damage = 1;
			}
		}
		if(objname == "thunder" && damage_player.sequence != SEQ_BREAK && damage_player.sequence != SEQ_STUN&& damage_player.sequence < SEQ_DEAD) {	//スタン状態へ
			damage_player.sequence = SEQ_STUN;
			damage_player.stun = STUN_TIME / (1+damage_player.boss);
			effect.set("stun",damage_player.mesh.position, {player:damage_player});
			sound.play("hit_thunder");
		}
		GameParam.updateLife(damage_player.name, false);
		attack_player.hitSnd = "";
	}
	return hit;
}
function setAnimationData(name) {
	animation_data = null;
	for(let i=0;i<animation_list.length;i++) {
		if(animation_list[i].name == name) {
			animation_data = animation_list[i].data;
		}
	}
	if(animation_data == null) {
		setAnimationData("tamami");
	}
}

function get(name) {
	let no = Number(name);
	if(isNaN(no)) {
		no = getId(name);
		if(isNaN(no)) return null;
	}

	if(no < chara_info.length) {
		return chara_info[no];
	}
	return null;
}
function getId(name) {
	for(let j=0;j<chara_info.length;j++) {
		if(chara_info[j].name == name) {
			return j;
		}
	}
	return -1;
}
function preUpdate() {
	for(let i=0;i<chara_info.length;i++) {
		if(chara_info[i].physicsBody != null) {
			chara_info[i].old_position = chara_info[i].physicsBody.position.clone();
		}
	}
}
function postUpdate() {

	//イベントでタイマーからキャラを動かすので前に
	updateTimerEvent();

	for(let i=0;i<chara_info.length;i++) {
		updatePersonal(chara_info[i]);
	}

	//エフェクト系
	effect.update();
	updateAttackObject();
}

function isGround(player, height) {
	let position = player.physicsBody.position;
	if(1) {
	var from = new CANNON.Vec3(position.x, position.y-0  , position.z);
	var to   = new CANNON.Vec3(position.x, position.y-1.25-player.AtariSize, position.z);
	var result = new CANNON.RaycastResult();
	var option_ground = {	//地面にだけ反応する
		collisionFilterMask :1,
		collisionFilterGroup:1,
		skipBackfaces:true,
	};
	if(physics.world.raycastClosest(from, to, option_ground, result)) {
//		console.log("dis="+result.distance);
		if (result.distance < player.AtariSize*1.2) {
			return true;
		} else {	//少し離れたところに地面があるが、落下していない
			if(player.not_drop > 10 /*&& height == undefined*/) return true;
		}
	}
	}
	else {
		const h = GameParam.stage.getHeightf(position.x, position.z);
		if(h > position.y - player.AtariSize - 0.25) {
			return true;
		}
	}
//	console.log("false");
	return false;
}
function Jump(player, force) {
	if((player.jump_count <= 0 && player.sequence == 0) || force == true) {
		if(player.swim_count >= 30 || player.swim_count == 0 && player.mesh.position.y >= GameParam.WaterLine+0.3 || !player.playable) {
			if(isGround(player)) {
				sound.play("field_jump1");
				player.jump_count = 1;
				player.flag &= ~FLAG_JUMP;
				player.flag &= ~FLAG_JUMP_END;
				return true;
			}
		}
	}
	return false;
}
//from→toへアニメーション
function animStart(player, from, to, frame, nameraka, func) {
	player.anim_from  = from;
	player.anim_to    = to;
	player.anim_frame = 0;
	player.max_frame  = frame;
	player.nameraka   = nameraka;
	player.anim_end_func = func;
	player.anim_type  = 0;	//fromからtoへ順番に補間
}
function animStart2(player, from, to, frame, nameraka, func) {
	animStart(player, from, to, frame, nameraka, func)
	player.anim_type  = 1;	//fromからtoへ飛ぶ（連続しない）
}
//toの状態で止める
function animStop(player, frame, func) {
	player.anim_from  = player.anim_to;
	player.anim_frame = 0;
	player.anim_end_func = func;
	player.max_frame  = frame;
	player.anim_type  = 0;
}
//ポーズを解除する
function animEnd(player, frame, func) {
	player.anim_from  = player.anim_to;
	player.anim_to    = -1;
	player.anim_frame = 0;
	player.anim_end_func = func;
	player.max_frame  = frame;
	player.nameraka   = true;
	player.anim_type  = 0;
}
function Attack_SP_Tamami(player, pos, count, prev)
{
	player.sequence = SEQ_ATTACK;
	//１段目攻撃
//	player.attack_enable = false;
	player.attack_enable = true;
	player.rengeki = false;
	const animtbl = [
		[3,6],
		[7,8],
		[28,30],
		[9,13],
		[26,27],
		[20,22],
		[14,16],
	];
	let no;
	do {
		no = Math.floor(Math.random() * (animtbl.length-1));
	}while(no == prev);
	let enemy_list = [];
	for(let enemy of chara_info) {
		if(enemy.playable || !enemy.enable || enemy.life <= 0 || enemy.npc) continue;
		enemy_list.push(enemy);
	}
	if(enemy_list.length > 0) {
		pos = enemy_list[Math.floor(Math.random()*enemy_list.length)].mesh.position.clone();
	}

	let spd = -12 * (4/GameParam.physics_speed);
	let r = player.mesh.rotation.y;
	if(Math.random() < 0.5) r += Math.PI/4;
	else r -= Math.PI/4;
	let walk_vec = new THREE.Vector3(Math.sin(r)*spd,0,Math.cos(r)*spd);
	player.physicsBody.velocity.x = walk_vec.x;
	player.physicsBody.velocity.y = 1;
	player.physicsBody.velocity.z = walk_vec.z;

	player.attack_flag |= ATTACK_NOGUARD;
	player.visible = false;
	if(player.muteki < 20) player.muteki = 20;
	animStart(player, -1,animtbl[no][0], 3, true, function() {
		let x = pos.x - player.mesh.position.x;
		let z = pos.z - player.mesh.position.z;
		player.mesh.rotation.y = Math.atan2(x,z) + Math.PI;
		effect.setAttackEff(player.mesh.position.clone(), player.mesh.rotation);
		player.visible = true;
//		sound.play("attack_a00");
		player.hitSnd = "hit_slash1";
		animStart(player, animtbl[no][0],animtbl[no][1], 6, true, function() {
//			effect.set("sakura",player.mesh.position,{ry:player.mesh.rotation.y});
			if(count > 0) {
				Attack_SP_Tamami(player, pos, count-1, no);
			}
			else {
				//終わり
				player.mesh.rotation.y += Math.PI;
				player.attack_enable = false;
				if(player.muteki<15) player.muteki = 15;
				animStart(player, -1,30, 6, true, function() {
					FrontStep(player,7);
					animStop(player, 30, function() {
						animEnd(player, 12, function() {
							actionReset(player);
						});
					});
				});
			}
		});
	});
}
function Attack_Normal_Tamami(player)
{
	const speed = 0.7;

//		effect.set("sakura",player.mesh.position,{ry:player.mesh.rotation.y});
//		effect.set("sakura",player.mesh.position,{ry:player.mesh.rotation.y});
	player.sequence = SEQ_ATTACK;
	//１段目攻撃
	player.attack_enable = false;
	player.rengeki = false;
	animStart(player, 2,3, 10*speed, true, function() {
		//溜め攻撃、30秒まで
		animStop(player, 60*30, null);
		setTimerEvent(
			player.name,
			60*30,
			function() {
				if(player.charge_count == 0) return true;
				return false;
			},
			//離した瞬間に呼ばれる
			function() {
				if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
				/*if(player.attack_flag & ATTACK_CHARGE) {
					player.attack_flag |= ATTACK_STRONG;
					FrontStep(player, 4);
					effect.setAttackEff(player.mesh.position, player.mesh.rotation);
				}*/
		AttackSlashEffect(player, 0,0.5, 0, 1.5, 0.5);
		//当たり判定ここから
		FrontStep(player, 1.5);
		player.attack_enable = true;
		player.hitSnd = "hit_slash1";
		sound.play("atk_slash1");
		animStart(player, 3,6, 7*speed, false, function() {
			player.attack_enable = false;
			player.rengeki = false;
			animStop(player, 12*speed, function() {
				//２段目
				if(player.rengeki) {
					animStart(player, 6,7, 10*speed, true, function() {
						//当たり判定ここから
						AttackSlashEffect(player, 0,0.5, 1.75, 0.5, 0);
						FrontStep(player, 1.5);
						player.attack_enable = true;
						sound.play("atk_slash2");
						player.hitSnd = "hit_slash1";
						animStart(player, 7,8, 7*speed, false, function() {
							//攻撃止め
							player.attack_enable = false;
							player.rengeki = false;
							animStop(player, 12*speed, function() {
								//３段目
								if(player.rengeki) {
									animStart2(player, 8,28, 10*speed, true, function() {
										FrontStep(player,4);
										//当たり判定ここから
										AttackSlashEffect(player, 0,0.5, 0.25, 0.5, 0);
										player.attack_enable = true;
										sound.play("atk_slash3");
										player.hitSnd = "hit_slash1";
										animStart(player, 28,30, 7*speed, false, function() {
											//攻撃止め
											player.attack_enable = false;
											player.rengeki = false;
											animStop(player, 16*speed, function() {
												animEnd(player, 10, function() {
													actionReset(player);
												});
											});
										});
									});
								}
								else {
									animEnd(player, 10, function() {
										actionReset(player);
									});
								}
							});
						});
					});
				}
				else {
					animEnd(player, 10, function() {
						actionReset(player);
					});
				}
			});
		});
		});
	});
}
//突進
function FrontStep(player, step) {
//	let spd = -step * (4/GameParam.physics_speed);
//	let walk_vec = new THREE.Vector3(Math.sin(player.mesh.rotation.y)*spd,0,Math.cos(player.mesh.rotation.y)*spd);
//	player.physicsBody.velocity.x = walk_vec.x;
//	player.physicsBody.velocity.z = walk_vec.z;
	let spd = -step * (4/GameParam.physics_speed)/2;
	player.step2_vec.set(Math.sin(player.mesh.rotation.y)*spd,0,Math.cos(player.mesh.rotation.y)*spd);
	player.step2_count = 1;
	player.step2_max = 5;
}
	
function AttackPunchEffect(player) {
//							player.atari_bone = "J_Bip_R_Hand";
	player.mesh.updateMatrixWorld(false);

	let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
	mat0 = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,player.atari_bone).matrixWorld);
	let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);
	effect.set("punch", pos, {player:player});	//
}
function AttackSlashEffect(player, ofy, ofz, rx,ry,rz) {
	let pos = player.mesh.position.clone();
	const r = player.mesh.rotation.y;
	pos.add( new THREE.Vector3(Math.sin(r)*-ofz, player.height+ofy, Math.cos(r)*-ofz) );
	effect.set("slash", pos, {player:player, rx:Math.PI*rx,ry:Math.PI*ry,rz:Math.PI*rz});	//
}

function Attack_Normal_Ayame(player)
{
	const speed = 0.7;
	player.sequence = SEQ_ATTACK;
	//１段目攻撃
	player.attack_enable = false;
	player.rengeki = false;
	//当たり判定ここから
	
	//１段目右
	player.attack_enable = true;
	player.atari_bone = "J_Bip_R_Hand";
	player.hitSnd = "hit_punch";
	sound.play("atk_punch");
	FrontStep(player, 1.5);
	animStart(player, 0,1, 7*speed, false, function() {
		player.attack_enable = false;
		AttackPunchEffect(player);
		animStart(player, 1,0, 12*speed, true, function() {
			//２段目左
			if(player.rengeki) {
				player.rengeki = false;
				//当たり判定ここから
				player.atari_bone = "J_Bip_L_Hand";
				player.attack_enable = true;
				player.hitSnd = "hit_punch";
				sound.play("atk_punch");
				FrontStep(player, 1.5);

				animStart(player, 2,4, 10*speed, false, function() {
					player.attack_enable = false;
					AttackPunchEffect(player);
					animStart(player, 4,2, 15*speed, true, function() {
						//３段目右
						if(player.rengeki) {
							player.rengeki = false;
							player.attack_enable = true;
							player.atari_bone = "J_Bip_R_Hand";
							player.hitSnd = "hit_punch";
							sound.play("atk_punch");
							FrontStep(player, 1.5);
							animStart(player, 0,1, 7*speed, false, function() {
								player.attack_enable = false;
								AttackPunchEffect(player);
								animStart(player, 1,0, 12*speed, true, function() {
									if(player.rengeki) {
										player.rengeki = false;
										player.atari_bone = "J_Bip_L_Hand";
										player.attack_enable = true;
										player.hitSnd = "hit_punch";
										sound.play("atk_punch");

										animStart(player, 2,4, 10*speed, false, function() {
											//攻撃止め
											player.attack_enable = false;
											AttackPunchEffect(player);
											if(player.rengeki) {
												player.rengeki = false;
												player.hitSnd = "hit_kick1";
												sound.play("atk_kick1");
												player.atari_bone = "J_Bip_L_Foot";
												//蹴り
												animStart(player, 5,6, 8*speed, false, function() {
													//フィニッシュ
													effect.setAttackEff(player.mesh.position, player.mesh.rotation);
													player.attack_flag |= ATTACK_STRONG;
													player.attack_enable = true;
													FrontStep(player, 4);
													AttackSlashEffect(player, 0.3,0, 0.5, 0.5, 0);
													animStart(player, 6,8, 19*speed, true, function() {
														player.attack_enable = false;
//														AttackPunchEffect(player);
														//animStop(player, 2, function() {
															animStart(player, 8,9, 20*speed, true, function() {
																animEnd(player, 15, function() {
																	actionReset(player);
																});
															});
														//});
													});
												});
											}
											else {
												animStop(player, 10*speed, function() {
													animEnd(player, 12, function() {
														actionReset(player);
													});
												});
											}
										});
									}
									else {
										animEnd(player, 10, function() {
											actionReset(player);
										});
									}
								});
							});
						}
						else {
							animEnd(player, 10, function() {
								actionReset(player);
							});
						}
					});
				});
			}
			else {
				animEnd(player, 10, function() {
					actionReset(player);
				});
			}
		});
	});
}
function Attack(player, type) {

//	if(GameParam.BattleMode == 0) return;	//攻撃不可

	if(type == undefined || type < 0) type = 0;

	//武器を構える
	/*if(player.hold_weapon == 0) {
		if(player.name == "tamami") {
			return;
		}
	}*/
	
	//攻撃中にもう一度呼ぶと２連撃、３連撃と続く
	if(player.sequence == SEQ_ATTACK) {
		if(player.playable || player.boss) {
			player.rengeki = true;
		}
		return;
	}
	if(player.sequence == SEQ_WALK) {
		player.attack_flag = 0;//ATTACK_UPPER
		
		if(player.playable) {
			const auto_dir = GameParam.user.getSkill(player.type,13);
			if(auto_dir != 0) {	//風見鶏

				let near_enemy = null;
				let near_rot = Math.PI*0.66*auto_dir/3;	//真後ろには攻撃しないように
				let target_rot;
				const r2 = player.mesh.rotation.y;
				for(let enemy of chara_info) {
					if(enemy.playable || !enemy.enable || enemy.life <= 0 || enemy.npc) continue;
					let x = player.mesh.position.x - enemy.mesh.position.x;
					let z = player.mesh.position.z - enemy.mesh.position.z;
					const len = Math.sqrt(x*x + z*z);
					const r1 = Math.atan2(x,z);
					const rot = getNearRotation(r2, r1);
					const near = Math.abs(r2-rot);
					if(len < 2 && near < near_rot) {
						near_enemy = enemy;
						near_rot = near;
						target_rot = rot;
					}
				}
				if(near_enemy) {
					player.mesh.rotation.y = target_rot;
					player.move_dir = target_rot - Math.PI;
				}

			}
		}
		function firstAttackStart(player) {
			for(let enemy of chara_info) {
				if(enemy.enable && enemy != player /*&& !enemy.playable*/&& !enemy.npc) {	//敵味方全員の動きを止める
					if(enemy.sequence == 0) {
						if(enemy.playable && GameParam.user.getSkill(enemy.name,21) > 0) {
							//抜刀
						}
						else {
							enemy.sequence = SEQ_STOP;
						}
					}
				}
			}
		}
		function firstAttackHit() {
			let t=1;
			for(let enemy of chara_info) {
				if(enemy.enable && !enemy.playable && !enemy.npc) {
					setTimerEvent(
						player.name,
						t,
						null,
						function(){
							sound.play("battle_firstAttack");
							//強制ヒット
							enemy.sequence = 0;
							enemy.muteki = 0;
							DamageHit(enemy.damageBody, player.attackBody, true, "first_attack");
							let pos = enemy.mesh.position.clone();
							pos.y += enemy.height;
							effect.set("slash2", pos, {player:enemy});
						});
					t+=5;
				}
				if(enemy.enable && enemy.playable && !enemy.npc) {
					setTimerEvent(
						player.name,
						5*3,
						null,
						function(){
							if(enemy.playable && GameParam.user.getSkill(enemy.name,21) > 0) {
								//抜刀
							}
							else {
								enemy.sequence = 0;
							}
						});
				}
			}
		}

		let ret_cost = 0;	//使わなかった場合の処置
		let no_use = 0;
		player.attack_type = type;
		if(player.playable) {
			let no = 0;
			if(player.type == "tamami") no += 70;
			if(player.type == "ayame" ) no += 80;
			if(player.type == "karin" ) no += 90;
			if(GameParam.BattleMode == 0 && type == 9) return;	//奥義は非戦闘時使用不可
			if(player.name.indexOf("clone") >= 0) no = 0;	//分身は消費なし
			if(GameParam.BattleMode == 0) no = 0;			//非戦闘時
			if(no > 0 &&  type != 8) {
				//技力のチェック
				const info = GameParam.user.getInfo(no+type);
				if(info && info.skill != undefined) {
					if (player.skill >= info.skill) {
						player.skill -= info.skill;
						GameParam.SetSkill(player);
						GameParam.updateLife(player.name, false);
						ret_cost = info.skill;
					}
					else {
						const sk = GameParam.user.getSkill(player.type,17);
						if(sk > 0 && type < 8) {
							//気合い使用状態
							player.attack_flag |= ATTACK_SKILL_DOWN;
						}
						else {
							return;	//使用不可
						}
					}
				}
			}
		}

		const speed = 0.7;
		//攻撃アニメーション
		if(player.type == "tamami" || player.type == "tomoka") {
			
			//剣の軌道を0.5fずつ進めてsetBlade
			player.anim_rate = 0.5;
			player.anim_update_func = function() {
				const index = (player.type == "tamami") ? 0 : 1;
				if(player.attack_enable) {
					player.mesh.updateMatrixWorld(false);
					effect.setBlade(index, findBone(player.mesh,"J_Bip_R_Hand").matrixWorld);
				}
				else {
					effect.clearBlade(index);
				}
			}
			if(type == 8) {
				//抜刀
				player.sequence = SEQ_ATTACK;
				player.charge_count = 0;	//溜め非対応
				firstAttackStart(player);
				animStart(player, -1,30, 6, true, function() {
					firstAttackHit();
					animStop(player, 60, function() {
						animEnd(player, 12, function() {
							actionReset(player);
						});
					});
				});
			}
			//
			else if(type == 4) {
				player.sequence = SEQ_ATTACK;
				//疾風（突き）
				animStart(player, -1,9, 5, true, function() {
					//溜め攻撃、30秒まで
					animStop(player, 60*30, null);
					setTimerEvent(
						player.name,
						60*30,
						function() {
							if(player.charge_count == 0) return true;
							return false;
						},
						//離した瞬間に呼ばれる
						function() {
							if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
							//当たり判定ここから
							player.attack_flag |= ATTACK_STRONG;
							player.attack_enable = true;
							player.hitType = "hit_slash3";
							sound.play("atk_slash7");

							/*if(player.attack_flag & ATTACK_CHARGE1) {
								FrontStep(player, 9);
							}
							else*/ {
								FrontStep(player, 6);
							}
							effect.setAttackEff(player.mesh.position, player.mesh.rotation);
							animStart(player, 9,13, 20*speed, false, function() {
								//攻撃止め
								player.attack_enable = false;
								player.rengeki = false;
								animStop(player, 30*speed, function() {
									animEnd(player, 12, function() {
										actionReset(player);
									});
								});
							});
					});
				});
			}
			else if(type == 3) {
				//嶺渡し（兜割り）
				if(isGround(player)) Jump(player);
				player.rengeki = false;
				player.sequence = SEQ_ATTACK;
				player.attack_flag |= ATTACK_STRONG;
				player.charge_count = 0;	//溜め非対応
				animStart(player, 25,26, 30, true, function() {
					player.attack_enable = true;
					player.attack_flag |= ATTACK_STRONG;
					player.hitType = "hit_slash4";
					sound.play("atk_slash5");
					//攻撃
					AttackSlashEffect(player, -0.5,0.25, 0, 1.5, 0.5);
					animStart(player, 26,27, 6, false, function() {
						let pos = new THREE.Vector3(Math.sin(player.mesh.rotation.y)*-1,0,Math.cos(player.mesh.rotation.y)*-1).add(player.mesh.position);
						effect.setAttackEff(pos, player.mesh.rotation, Math.PI);
						player.attack_enable = false;
						animStop(player, 30, function() {
							animEnd(player, 10, function() {
								actionReset(player);
							});
						});
					});
				});
			}
			else if(type == 2 /*&& isGround(player)*/) {
				//旋風（水平回転切り）
				player.rengeki = false;
				player.sequence = SEQ_ATTACK;
				player.flag |= FLAG_SLOW_DOWN;
				player.attack_flag |= ATTACK_ROLLING;
				animStart(player, -1,20, 5, true, function() {
					//溜め攻撃、30秒まで
					animStop(player, 60*30, null);
					setTimerEvent(
						player.name,
						60*30,
						function() {
							if(player.charge_count == 0) return true;
							return false;
						},
						//離した瞬間に呼ばれる
						function() {
							if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
							player.attack_enable = true;
//							player.attack_flag |= ATTACK_STRONG;
							player.hitType = "hit_slash2";
							sound.play("atk_slash6");
							AttackSlashEffect(player, 0.3,0, 1.5, 0.5, 0);
							//攻撃
							animStart(player, 20,23, 20, false, function() {
								player.attack_enable = false;
								animEnd(player, 10, function() {
									actionReset(player);
								});
							});
						});
				});
			}
			else if(type == 1) {
				//風巻（バク転切り）
				if(isGround(player)) Jump(player);
				player.sequence = SEQ_ATTACK;
				player.attack_flag |= ATTACK_UPPER;
				player.attack_enable = true;
				player.rengeki = false;
				player.flag |= FLAG_SLOW_DOWN
				player.charge_count = 0;	//溜め非対応
				player.hitType = "hit_slash2";
				sound.play("atk_slash4");
				//１段目攻撃
				AttackSlashEffect(player, 0,0, 1, 1.5, 1.0);
				animStart(player, 14,18, 30*speed, false, function() {
					player.attack_flag &= ~ATTACK_UPPER;
					/*if(player.rengeki) {
						Attack_Normal_Tamami(player);
					}
					else*/ {
						AttackSlashEffect(player, 0,0, 1, 1.5, 1.0);
						animStart(player, 15,18, 24*speed, false, function() {
							player.attack_enable = false;
							animEnd(player, 10, function() {
								actionReset(player);
							});
						});
					}
				});
			}
			else if(type == 7) {
				//朋花大技
				let target_list = [];
				for(let i=0;i<3;i++) {
					let target = get((GameParam.user.status.select_chara+i)%3);
					if(!target.enable || target.life <= 0 || target.npc) continue;
					target_list.push(target);
				}
				function Attack_Tomoka(player, index) {
					let target = target_list[index];
					const time = 120;
					player.muteki = time+30;
					setTimerEvent(
						player.name,
						100-30,
						function() {
							let x = player.mesh.position.x - target.mesh.position.x;
							let z = player.mesh.position.z - target.mesh.position.z;
							const r1 = Math.atan2(x,z);
							const r2 = player.mesh.rotation.y;
							const rot = getNearRotation(r2, r1);
							player.mesh.rotation.y = r2*0.9 + rot*0.1;
						},
						null);
					//30f前で確定
					let targetPos = target.mesh.position.clone();
					setTimerEvent(
						player.name,
						100-30,
						null,
						function() {
							sound.play("sp_tomoka1");
							targetPos.copy(target.mesh.position);
						});
					setTimerEvent(
						player.name,
						100-3,
						null,
						function() {
							player.attack_enable = true;
							player.hitSnd = "hit_slash4";
							sound.play("sp_tomoka2");
						});
					animStop(player, 100, function() {
						//攻撃
						let pos = targetPos.clone();
						const len = targetPos.clone().sub(target.mesh.position).length();
						let is_hit = false;
						if(len < 2.0) {
							is_hit = true;
							pos.copy(target.mesh.position);
						}

						let x = player.mesh.position.x - pos.x;
						let z = player.mesh.position.z - pos.z;
						const r1 = Math.atan2(x,z) - Math.PI/4;
						pos.x += Math.sin(r1)*-1.0;
						pos.z += Math.cos(r1)*-1.0;
						pos.y = GameParam.stage.getHeightf(pos.x, pos.z) + player.AtariSize;
						player.physicsBody.position.set(pos.x, pos.y, pos.z);
						animStart(player, 28,30, 2, false, function() {
							AttackSlashEffect(player, 0.3,0, 1.5, 0.5, 0);
							player.attack_enable = false;
							//通常の物理当たり判定は使わず、一定範囲内なら強制的にダメージ
							if(is_hit) {
								player.attack_flag |= ATTACK_STRONG;
								DamageHit(target.damageBody, player.attackBody, true, "first_attack");
							}
							animStop(player, 30, function() {
								if(index < target_list.length-1) {
									animStart2(player, 30,28, 15, true, function() {
										Attack_Tomoka(player, index+1);
									});
								}
								else {
									animEnd(player, 20, function() {
										actionReset(player);
										player.muteki = 0;
									});
								}
							});
						});
					});
				}
				if(target_list.length > 0) {
					player.sequence = SEQ_ATTACK;
					animStart(player, -1,28, 15, true, function() {
						Attack_Tomoka(player, 0);
					});
				}
			}
			else if(type == 9) {
				//散花
				let pos = player.mesh.position.clone();
				const r = player.mesh.rotation.y;
				pos.add( new THREE.Vector3(Math.sin(r)*-1, 0, Math.cos(r)*-1) );
				
				sound.play("sp_tamami1");
				player.sequence = SEQ_ATTACK;
				player.charge_count = 0;	//溜め非対応
				effect.set("special1", pos, {player:player});	//
				animStart(player, -1,28, 10, true, function() {
					animStop(player, 20, function() {
						sound.play("sp_tamami2");
						Attack_SP_Tamami(player, pos, 24, -1);
					});
				});
			}
			else {
				//通常３段
				Attack_Normal_Tamami(player);
			}
		}
		if(player.type == "ayame" || player.type == "emily") {
			//手裏剣
			function throwShuriken(org_pos, dir, down) {
				const r = player.mesh.rotation.y;
				let pos = org_pos.clone();
				let r2 = r + dir;
				let obj = createAttackObject("shuriken", pos, player.playable, {player:player,rx:Math.PI/2, ry:r2, rz:(Math.random()-0.5)*Math.PI});
				const speed = 0.8;// + ((down != undefined) ? down : 0.0);
				obj.move.set(Math.sin(r2)*-speed, (down != undefined) ? down : 0.0, Math.cos(r2)*-speed);

				player.hitSnd = "";
				sound.play("shuriken1");
			}
			if(type == 0) {
				Attack_Normal_Ayame(player);
			}
			else if(type == 8) {
				//抜刀
				player.sequence = SEQ_ATTACK;
				player.charge_count = 0;	//溜め非対応
				firstAttackStart(player);
				animStart(player, -1,6, 6, true, function() {
					effect.setAttackEff(player.mesh.position, player.mesh.rotation);
					AttackSlashEffect(player, 0.3,0, 0.5, 0.5, 0);
					firstAttackHit();
					animStart(player, 6,8, 19*speed, true, function() {
						animStart(player, 8,9, 20*speed, true, function() {
							animEnd(player, 15, function() {
								actionReset(player);
							});
						});
					});
				});
			}
			else if(type == 2) {
				player.sequence = SEQ_ATTACK;
				//サマーソルト
				animStart(player, -1,10, 7*speed, false, function() {
					//溜め攻撃、30秒まで
					animStop(player, 60*30, null);
					setTimerEvent(
						player.name,
						60*30,
						function() {
							if(player.charge_count == 0) return true;
							return false;
						},
						//離した瞬間に呼ばれる
						function() {
							if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
							if(isGround(player)) Jump(player,true);
							player.attack_flag |= ATTACK_UPPER;
							player.attack_enable = true;
							player.rengeki = false;
			//				player.flag |= FLAG_SLOW_DOWN
							player.atari_bone = "J_Bip_L_Foot";
							player.hitSnd = "hit_kick2";
							sound.play("atk_kick2");
							//１段目攻撃
							FrontStep(player, 3);
							AttackSlashEffect(player, 0,0, 1, 1.5, 1.0);
							animStart(player, 10,14, 25*speed, false, function() {
								player.attack_enable = false;
								animEnd(player, 10, function() {
									actionReset(player);
								});
							});
						});
				});
			}
			else if(type == 3) {
				//ドリル
				player.sequence = SEQ_ATTACK;
				animStart(player, -1,10, 7*speed, false, function() {
					//溜め攻撃、30秒まで
					animStop(player, 60*30, null);
					setTimerEvent(
						player.name,
						60*30,
						function() {
							if(player.charge_count == 0) return true;
							return false;
						},
						//離した瞬間に呼ばれる
						function() {
							if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
							if(isGround(player)) Jump(player,true);
							player.sequence = SEQ_ATTACK;
			//				player.attack_flag |= ATTACK_UPPER;
							player.attack_flag |= /*ATTACK_STRONG |*/ ATTACK_RUSH;
							player.attack_enable = false;
							player.rengeki = false;
			//				player.flag |= FLAG_SLOW_DOWN
							player.atari_bone = "J_Bip_L_Foot";
							player.hitSnd = "hit_drill";
							sound.play("atk_drill");
							player.rush_pow = 3;
							//１段目攻撃
							animStart(player, 15,16, 7*speed, false, function() {
								let p = player.mesh.position.clone();
								p.y += 0.15;
								effect.setAttackEff(p, player.mesh.rotation);
								player.attack_enable = true;
								animStart(player, 16,22, 33*speed, false, function() {
									player.attack_enable = false;
									animEnd(player, 10, function() {
										actionReset(player);
									});
								});
							});
						});
				});
			}
			else if(type == 4) {
				//焙烙玉

				player.sequence = SEQ_ATTACK;
				animStart(player, -1,33, 10, true, function() {

					//前方に爆弾を投げる
					const r = player.mesh.rotation.y;
					let pos = player.mesh.position.clone();
					pos.y += player.height;
					let obj = createAttackObject("bomb", pos, player.playable, {player:player});
					obj.body.sleep();
					
					function holdBomb() {
						//爆弾の座標設定
						player.mesh.updateMatrixWorld(true);
						let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
						let matL = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_L_Hand").matrixWorld);
						let matR = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_R_Hand").matrixWorld);
						let posL = (new THREE.Vector3()).setFromMatrixPosition(matL);
						let posR = (new THREE.Vector3()).setFromMatrixPosition(matR);
						posL.add(posR);
						posL.multiplyScalar(0.5);
						obj.body.position.set(posL.x, posL.y+0.15, posL.z);
						obj.body.quaternion.setFromEuler(0,player.mesh.rotation.y,0, "YXZ");
					}

					if(player.playable) {
						player.flag |= FLAG_DIR_CTRL;
					}
					//溜め攻撃、30秒まで
					animStop(player, 60*30, null);
					setTimerEvent(
						player.name,
						60*30,
						function() {
							holdBomb();

							if(player.charge_count == 0) return true;
							return false;
						},
						//離した瞬間に呼ばれる
						function() {
							player.flag &= ~FLAG_DIR_CTRL;
							if(player.sequence != SEQ_ATTACK) {
								obj.die = true;
								return;	//攻撃キャンセルされたら終わる
							}
							player.hitSnd = "";
							sound.play("bomb_throw");
							//飛ぶ
							setTimerEvent(
								null,
								5,
								holdBomb(),
								function(){
									const r = player.mesh.rotation.y;
									const pow = 5.0;
									obj.body.velocity.x = Math.sin(r) * -pow;
									obj.body.velocity.z = Math.cos(r) * -pow;
									obj.body.velocity.y = pow*0.4;
									obj.body.wakeUp();
								});
							animStart(player, 33,34, 10, true, function() {
								
								animStop(player, 10, function() {
									animEnd(player, 10, function() {
										if(GameParam.DpsCheck) {
											//DPSチェックのため爆発が終わるまで硬直
										}
										else {
											actionReset(player);
										}
									});
								});
							});
						});
				});
			}
			else if(type == 1) {	//手裏剣
				player.rengeki = false;
				player.sequence = SEQ_ATTACK;
				animStart(player, 25,26, 4, true, function() {
					player.rengeki = false;
					FrontStep(player, 1);
					
					player.mesh.updateMatrixWorld(true);
					let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
					mat0.multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_L_Hand").matrixWorld);
					let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);

					throwShuriken(pos, 0);
					animStop(player, 5, function() {
						if(player.rengeki) {
							player.rengeki = false;
							animStart(player, 26,27, 8, true, function() {
								animStart(player, 27,28, 4, true, function() {
									FrontStep(player, 1);

									player.mesh.updateMatrixWorld(true);
									let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
									mat0.multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_R_Hand").matrixWorld);
									let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);
									throwShuriken(pos,0);

									animStop(player, 5, function() {
										if(player.rengeki) {
											player.rengeki = false;
											animStart(player, 28,29, 15, true, function() {
												FrontStep(player, -2);
												if(isGround(player)) Jump(player,true);
												animStart(player, 29,30, 8, true, function() {
													FrontStep(player, -2);

													player.mesh.updateMatrixWorld(true);
													let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
													let matL = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_L_Hand").matrixWorld);
													let matR = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_R_Hand").matrixWorld);
													let posL = (new THREE.Vector3()).setFromMatrixPosition(matL);
													let posR = (new THREE.Vector3()).setFromMatrixPosition(matR);
													
													throwShuriken(posR,-0.3,-0.2);
													throwShuriken(posL, 0.3,-0.2);
													throwShuriken(posL.add(posR).multiplyScalar(0.5), 0,-0.2);
													animStart(player, 30,31, 5, true, function() {
														animStop(player, 5, function() {
															animStart(player, 31,32, 5, true, function() {
																animEnd(player, 15, function() {
																	actionReset(player);
																});
															});
														});
													});
												});
											});
										}
										else {
											animEnd(player, 15, function() {
												actionReset(player);
											});
										}
									});
								});
							});
						}
						else {
							animEnd(player, 15, function() {
								actionReset(player);
							});
						}
					});
				});
			}
			else if(type == 9) {	//影分身の術
				let use = 0;
				player.charge_count = 0;	//溜め非対応
				let target = getBunshinTarget(player.mesh.position);
				if(target.length > 0) {
					let j = 0;
					for(let i=0;i<chara_info.length;i++) {
						if(chara_info[i].name == "ayame_clone" && !chara_info[i].enable) {
							const r = player.mesh.rotation.y - Math.PI/2 + Math.PI*j;
							let x = player.mesh.position.x + Math.sin(r);
							let z = player.mesh.position.z + Math.cos(r);
							let y = GameParam.stage.getHeightf(x,z) + player.height + 0.5;	//少し高い位置から
							const sk = GameParam.user.getSkill(player.type,89);
							const rate = 0.25 + sk / 5 * 0.75;
							chara_info[i].life_max = chara_info[i].life = player.max_life * rate;
							setChara(i, true, x,y,z);
							chara_info[i].hold_weapon = 1;
							setArrive(i);
							chara_info[i].target = target[j].index;
							j = (j + 1) % target.length;
							use = 1;
						}
					}
				}
				if(use) {
					sound.play("dron");
				}
				else {
					no_use = 1;
				}
			}
			else if(type == 7) {	//エミリー用大技
				player.rengeki = false;
				player.sequence = SEQ_ATTACK;

				Jump(player,true);
				setTimerEvent(	//
					player.name,
					30,
					null,
					function() {
						if(player.sequence != SEQ_ATTACK) return;
						player.flag |= FLAG_STOP_DOWN;
						player.physicsBody.sleep();	//落下しないようにする
						player.muteki = 10;

						let throw2 = function(player, func, count) {
							if(count < 0) {
								player.flag &= ~FLAG_STOP_DOWN;
								player.physicsBody.wakeUp();
								animEnd(player, 15, function() {
									actionReset(player);
								});
								return;
							}
							player.muteki = 10;
							animStart(player, 30,31, 5, true, function() {
								player.mesh.updateMatrixWorld(true);
								let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
								mat0.multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_L_Hand").matrixWorld);
								let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);

								const stp =  (1/10)*Math.PI*2;
								throwShuriken(pos, -stp/4, -0.32);
								throwShuriken(pos,  stp/4, -0.28);

								//回転
								setTimerEvent(
									player.name,
									8,
									function(){
										player.mesh.rotation.y += stp/7;
										return false;
									},null);
								animStart2(player, 31,30, 8, true, function() {
									func(player, func, count-1);
								});
							});
						};
						animStart(player, -1,30, 5, false, function() {
//							animStart(player, 25,26, 5, true, function() {
								throw2(player, throw2, 10);
//							});
						});
					});

			}
		}
		if(player.type == "karin" || player.type == "tsumugi") {

			player.attack_flag &= ~ATTACK_STRONG;
			if(type == 0) {
				const speed = 0.7;
				player.sequence = SEQ_ATTACK;
				//１段目攻撃
				player.attack_enable = false;
				player.rengeki = false;
				player.weapon_offset = 0;
				AttackSlashEffect(player, 0,0.5, 0, 1.5, 0.5);
				FrontStep(player, 2);
				animStart(player, -1,4, 10*speed, true, function() {
					//当たり判定ここから
					player.attack_enable = true;
					player.hitSnd = "hit_rod";
					sound.play("atk_rod");
					animStart(player, 4,5, 7*speed, false, function() {
						player.attack_enable = false;
						player.rengeki = false;
						animStop(player, 12*speed, function() {
							//２段目
							if(player.rengeki) {
								animStart2(player, 5,1, 6*speed, true, function() {
									//当たり判定ここから
									player.attack_enable = true;
									player.hitSnd = "hit_rod";
									sound.play("atk_rod");

									FrontStep(player, 4);
									let pos = player.mesh.position.clone();
									const r = player.mesh.rotation.y;
									pos.add( new THREE.Vector3(Math.sin(r)*-2, player.height-0.15, Math.cos(r)*-2) );
									effect.set("attackeff", pos, {player:player, ry:0});	//衝撃エフェクト
									
									animStart(player, 1,3, 10*speed, false, function() {
										//攻撃止め
										player.attack_enable = false;
										player.rengeki = false;
										animStop(player, 12*speed, function() {
											animEnd(player, 10, function() {
												actionReset(player);
											});
										});
									});
								});
							}
							else {
								animEnd(player, 10, function() {
									actionReset(player);
								});
							}
						});
					});
				});
			}
			else if(type == 4) {
				//御札の設置
				player.sequence = SEQ_ATTACK;
				player.charge_count = 0;	//溜め非対応
				animStart(player, -1,12, 15, true, function() {
					animStop(player, 30, function() {
						let target = player.mesh.position.clone();
						const r = player.mesh.rotation.y;
						target.add( new THREE.Vector3(Math.sin(r)*-0.3, 0.3, Math.cos(r)*-0.3) );
						let obj = createAttackObject("ofuda", target, player.playable, {player:player, rotation:r});
						animEnd(player, 15, function() {
							actionReset(player);
						});
					});
				});
			}
			else if(type == 8) {
				//抜刀
				player.sequence = SEQ_ATTACK;
				player.charge_count = 0;	//溜め非対応
				firstAttackStart(player);
				animStart(player, -1,6, 15, true, function() {
					animStart(player, 6,7, 15, false, function() {
						effect.setAttackEff(player.mesh.position, player.mesh.rotation);
						AttackSlashEffect(player, 0.3,0, 0.5, 0.5, 0);
						firstAttackHit();
						animStop(player, 30, function() {
							animEnd(player, 15, function() {
								actionReset(player);
							});
						});
					});
				});
			}
			else if(type == 9) {
				//浄化ビーム
				player.sequence = SEQ_ATTACK;
				player.attack_enable = false;
				player.charge_count = 0;	//溜め非対応
				animStart(player, -1,8, 15, true, function() {
					player.weapon_offset = 1.5;
					animStart(player, 8,10, 15, false, function() {
						player.flag |= FLAG_DIR_CTRL;
						let time = 210;

						player.hitSnd = "";
						sound.play("spell_beam");
						let target = player.mesh.position.clone();
						const r = player.mesh.rotation.y;
						//target.add( new THREE.Vector3(Math.sin(r)*-7, 0, Math.cos(r)*-7) );
						target.y += 0.7*0;
						let obj = createAttackObject("beam", target, player.playable, {player:player});

						animStop(player, time, function() {
							sound.stop("spell_beam");
							player.flag &= ~FLAG_DIR_CTRL;
							animEnd(player, 10, function() {
								actionReset(player);
							});
						});
					});
				});
			}
			else if(type == 7) {
				//紬・大技
				const speed = 0.7;
				player.sequence = SEQ_ATTACK;
				player.attack_enable = false;
				player.rengeki = false;
				player.weapon_offset = 0;
//				player.charge_count = 0;	//溜め非対応
				animStart(player, -1,6, 15, true, function() {
					//溜め攻撃、30秒まで
					animStop(player, 60*30, null);
						player.weapon_offset = 1;
						animStart(player, 6,7, 15, true, function() {
							
							const org = player.mesh.position;
							const time = 45*8;
							player.muteki = time;
							//炎オブジェクトの生成
							for(let i=0;i<time/60;i++) {
								//誘導する氷の刃
								setTimerEvent(
									player.name,
									i*60,
									null,
									function() {
//										if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
										let target = getPlayable();
										for(let j=0;j<3;j++) {
											setTimerEvent(
												player.name,
												j*7,
												null,
												function() {
													let obj = createAttackObject("ice", target.mesh.position, player.playable, {player:player, target:target, index:j});
													obj.move.set(0,0,0);
												});
										}
									});
							}
							
							animStop(player, time, function() {
								player.weapon_offset = 0;
								animEnd(player, 10, function() {
									actionReset(player);
								});
							});
						});
				});
			}
			else {
				//詠唱
				const speed = 0.7;
				player.sequence = SEQ_ATTACK;
				player.attack_enable = false;
				player.rengeki = false;
				player.weapon_offset = 0;
//				player.charge_count = 0;	//溜め非対応
				animStart(player, -1,6, 15, true, function() {
					//溜め攻撃、30秒まで
					animStop(player, 60*30, null);
					setTimerEvent(
						player.name,
						60*30,
						function() {
							if(player.charge_count == 0) return true;
							return false;
						},
						//離した瞬間に呼ばれる
						function() {
							if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
							player.weapon_offset = 1;
							animStart(player, 6,7, 15, true, function() {
								
								const org = player.mesh.position;
								let time = 60;
								if(type == 2) {
									time = 90;
									sound.play("spell_shield");
									//守護殿
									for(let p of chara_info) {
										if(p.enable && player.playable == p.playable && p.life > 0 && !p.npc) {	//生きている仲間が対象
											let pos = p.mesh.position.clone();
											effect.set("shield3d", pos, {player:p, time:210});	//
//											let obj = createAttackObject("shield", pos, true, {player:p});
											p.muteki = 210;
											if(player.playable) {
												const sk = GameParam.user.getSkill(player.type,92);
												if(sk > 0) p.muteki += 45 * (sk-1);
												if(player.flag & FLAG_SKILL_DOWN) {	//時間半分
													p.muteki = Math.floor(p.muteki/2);
												}
											}
										}
									}
								}
								/*else if(type == 4) {
									time = 90;
									//清めの水
									for(let p of chara_info) {
										if(p.enable && p.playable && p.life > 0) {
											let pos = player.mesh.position.clone();
											pos.y += player.height+0.5;
											effect.set("powerup", pos, {player:p, time:450});
											p.attack_up = 450;
										}
									}
								}*/
								else if(type == 3) {
									//雷
									time = 100;
									sound.play("spell_thunder");

									//敵のほうに誘導
									let near_enemy = null;
									const auto_dir = player.playable ? GameParam.user.getSkill(player.type,13) : 1;
									let near_rot = Math.PI*(0.4 * auto_dir/3 + 0.1);
									for(let enemy of chara_info) {
										if(enemy.playable == player.playable || !enemy.enable || enemy.npc) continue;
										let x = org.x - enemy.mesh.position.x;
										let y = org.y - enemy.mesh.position.y;
										let z = org.z - enemy.mesh.position.z;
										const len = Math.sqrt(x*x + z*z);
										let r1 = Math.atan2(-x,-z);
										let r2 = player.mesh.rotation.y;
										let rot = Math.abs(r2-getNearRotation(r2, r1));
										if(rot < near_rot) {
											near_enemy = enemy;
											near_rot = rot;
										}
									}
									let target;
									if(near_enemy) {
										target = near_enemy.mesh.position.clone();
									}
									else {
										target = org.clone();
										const r = player.mesh.rotation.y;
										target.add( new THREE.Vector3(Math.sin(r)*-3, 0, Math.cos(r)*-3) );
									}
									target.y += 1.5;
									let obj = createAttackObject("thunder", target, player.playable, {player:player});
								}
								else if(type == 1) {
									time = 150;
									//炎オブジェクトの生成
									let max = 13;
									sound.play("spell_fire");
									for(let i=0;i<max;i++) {
										//10fごとに炎を生成する
										setTimerEvent(
											player.name,
											i*10,
											null,
											function() {
												if(player.sequence != SEQ_ATTACK) return;	//攻撃キャンセルされたら終わる
												let pos = org.clone();
												const r = player.mesh.rotation.y + Math.sin(i/max*Math.PI*2);
												pos.add( new THREE.Vector3(Math.sin(r)*-1.5, player.height*1.25, Math.cos(r)*-1.5) );
												
												let obj = createAttackObject("fire", pos, player.playable, {player:player, rotation:r});
												obj.move.set(Math.sin(r)*-0.05, 0.0, Math.cos(r)*-0.05);
											});
			//							obj.offset = i * 5 + 1;
									}
								}
								
								animStop(player, time, function() {
									player.weapon_offset = 0;
									animEnd(player, 10, function() {
										actionReset(player);
									});
								});
							});
						});
				});
			}
		}

		//敵キャラ
		//攻撃アニメーション
		if(player.name.indexOf("enemy") >= 0) {	//鬼系のみ
			player.atari_bone = "J_Bip_R_Hand";
			player.sequence = SEQ_ATTACK;
			if(player.type == "enemy00") {
				sound.play("roar_enemy1");
				animStart(player, -1,4, 20, true, function() {
					animStop(player, 20, function() {
						//当たり判定ここから
						player.attack_enable = true;
						player.hitSnd = "hit_enemy";
						sound.play("atk_enemy");
						//１段目攻撃
						animStart(player, 4,5, 12, false, function() {
							//１段目終了
							//攻撃止め
							player.attack_enable = false;
							animStop(player, 30, function() {
								animEnd(player, 10, function() {
									actionReset(player);
								});
							});
						});
					});
				});
			}
			else if(player.type == "enemy01") {
				player.sequence = SEQ_ATTACK;
				animStart(player, -1,4, 10, true, function() {

					//前方に石を投げる
					const r = player.mesh.rotation.y;
					let pos = player.mesh.position.clone();
					pos.y += player.height;
					let obj = createAttackObject("stone", pos, false, {player:player});
					obj.body.angularVelocity.set(0,0,0);
					obj.body.sleep();
					obj.body.collisionFilterGroup = 0;
					
					function holdStone() {
						//石の座標設定
						player.mesh.updateMatrixWorld(true);
						let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
						let matL = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_L_Hand").matrixWorld);
						let matR = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_R_Hand").matrixWorld);
						let posL = (new THREE.Vector3()).setFromMatrixPosition(matL);
						let posR = (new THREE.Vector3()).setFromMatrixPosition(matR);
						posL.add(posR);
						posL.multiplyScalar(0.5);
						obj.body.position.set(posL.x, posL.y+0.15, posL.z);
						obj.body.quaternion.setFromEuler(0,player.mesh.rotation.y,0, "YXZ");
						obj.body.velocity.set(0,0,0);
					}

					setTimerEvent(
						null,
						30+45,
						null,
						function() {
							obj.die = true;
						});
					sound.play("roar_enemy1");
					setTimerEvent(
						player.name,
						30,
						function() {
							holdStone();
							return false;
						},
						function() {
							if(player.sequence != SEQ_ATTACK) {
								obj.die = true;
								return;	//攻撃キャンセルされたら終わる
							}
							//飛ぶ
							setTimerEvent(
								player.name,
								5,
								function() {
									holdStone();
									return false;
								},
								function(){
									const r = player.mesh.rotation.y;
									const pow = 3;
									obj.body.velocity.x = Math.sin(r) * -pow;
									obj.body.velocity.z = Math.cos(r) * -pow;
									obj.body.velocity.y = pow*1.5;
									obj.body.wakeUp();
									obj.body.collisionFilterGroup = obj.body.collisionFilterMask;
								});
							animStart(player, 4,5, 12, false, function() {
								animStop(player, 10, function() {
									animEnd(player, 10, function() {
										actionReset(player);
									});
								});
							});
						});
				});
			}
			else if(player.type == "enemy02") {
				sound.play("roar_enemy1");
				setTimerEvent(	//後退
					player.name,
					50,
					function() {
						Walk(player, player.move_dir, -1);
						return false;
					},
					function() {
						if(player.sequence != SEQ_ATTACK) return;
						player.attack_enable = true;
						player.hitSnd = "hit_enemy";
						sound.play("atk_enemy");
						setTimerEvent(	//飛びかかる
							player.name,
							15,
							function() {
								FrontStep(player, 2.5);
								return false;
							},
							null);
						animStart(player, -1,4, 12, false, function() {
							player.attack_enable = false;
							animEnd(player, 10, function() {
								actionReset(player);
							});
						});
					});
			}
			else if(player.type == "enemy03") {
				//飛行タイプは連続攻撃
				sound.play("roar_enemy1");
				animStart(player, -1,19, 20, true, function() {
					//当たり判定ここから
					player.atari_bone = "J_Bip_R_Hand";
					player.attack_enable = true;
					player.hitSnd = "hit_enemy";
					sound.play("atk_enemy");
					//１段目攻撃
					animStart(player, 19,20, 8, false, function() {
						//１段目終了
						player.attack_enable = false;
						animStart(player, 20,21, 18, true, function() {
							player.atari_bone = "J_Bip_L_Hand";
							player.attack_enable = true;
							player.hitSnd = "hit_enemy";
							sound.play("atk_enemy");
							//２段目攻撃
							animStart(player, 21,22, 8, false, function() {
								//２段目終了
								player.attack_enable = false;
								animStop(player, 10, function() {
									animEnd(player, 30, function() {
										actionReset(player);
									});
								});
							});
						});
					});
				});
			}
			else if(player.type == "enemy04") {
				sound.play("roar_enemy1");
				if(type == 0) {
					//振りかぶる
					animStart(player, -1,27, 20, true, function() {
						animStop(player, 20, function() {
							//当たり判定ここから
							player.attack_enable = true;
							player.hitSnd = "hit_enemy";
							sound.play("atk_enemy");
							//１段目攻撃
							animStart(player, 27,28, 7, false, function() {
								//１段目終了
								//攻撃止め
								player.attack_enable = false;
								animStop(player, 30, function() {
									animEnd(player, 10, function() {
										actionReset(player);
									});
								});
							});
						});
					});
				}
				else {
					//振り回す
					animStart(player, -1,29, 25, true, function() {
						animStop(player, 25, function() {
							//当たり判定ここから
							player.attack_enable = true;
							player.hitSnd = "hit_enemy";
							sound.play("atk_enemy");
							//１段目攻撃
							animStart(player, 29,30, 12, false, function() {
								//１段目終了
								//攻撃止め
								player.attack_enable = false;
								animStop(player, 50, function() {
									animEnd(player, 10, function() {
										actionReset(player);
									});
								});
							});
						});
					});
				}
			}
			else if(player.type == "enemy10") {
				player.attack_flag |= ATTACK_STRONG;
				switch(type) {
				case 0:
					player.flag |= FLAG_MOVE_FORCE;
					Jump(player,true);
					setTimerEvent(	//ジャンプ中移動
						player.name,
						40,
						function() {
							player.walk_pow = 1;
							return false;
						},
						null
					);
					sound.play("roar_enemy2");
					animStart(player, -1,9, 40, true, function() {
						//当たり判定ここから
						player.attack_enable = true;
						player.hitSnd = "hit_enemy";
						sound.play("atk_enemy");
						//１段目攻撃
						animStart(player, 9,10, 20, true, function() {
							player.flag = 0;
							let pos = player.mesh.position.clone();
							pos.add( new THREE.Vector3(Math.sin(player.mesh.rotation.y)*-1, 0, Math.cos(player.mesh.rotation.y)*-1) );
							effect.setAttackEff(pos, player.mesh.rotation, Math.PI);
							animStop(player, 60, function() {
								player.attack_enable = false;
								animEnd(player, 20, function() {
									actionReset(player);
								});
							});
						});
					});
					break;
				case 1:	//地面パンチ
					player.atari_bone = "J_Bip_L_Hand";
					animStart(player, -1,11, 30, true, function() {
						sound.play("roar_enemy2");
						animStop(player, 45, function() {
							//当たり判定ここから
							FrontStep(player, 2);
							player.attack_enable = true;
							player.hitSnd = "hit_enemy";
							sound.play("atk_enemy");
							let pos = player.mesh.position.clone();
							pos.add( new THREE.Vector3(Math.sin(player.mesh.rotation.y)*-1, 0, Math.cos(player.mesh.rotation.y)*-1) );
							effect.setAttackEff(pos, player.mesh.rotation, Math.PI);
							//１段目攻撃
							animStart(player, 11,12, 12, false, function() {
								player.attack_enable = false;
								animStop(player, 45, function() {
									animEnd(player, 10, function() {
										actionReset(player);
									});
								});
							});
						});
					});
					break;
				case 2:	//ロングパンチ
					animStart(player, -1,13, 30, true, function() {
						sound.play("roar_enemy2");
						animStop(player, 45, function() {
							//当たり判定ここから
							FrontStep(player, 9);
							player.attack_enable = true;
							player.hitSnd = "hit_enemy";
							sound.play("atk_enemy");
							effect.setAttackEff(player.mesh.position, player.mesh.rotation);
							//１段目攻撃
							animStart(player, 13,14, 12, false, function() {
								player.attack_enable = false;
								animStop(player, 45, function() {
									animEnd(player, 10, function() {
										actionReset(player);
									});
								});
							});
						});
					});
					break;
				}
			}
		}
		if(player.name == "kumo") {
			player.sequence = SEQ_ATTACK;
			if(type == 0) {
				sound.play("roar_boss1");
				player.attack_flag |= ATTACK_STRONG;
				animStart(player, -1,1, 10, true, function() {
					animStop(player, 20, function() {
						//当たり判定ここから
						player.atari_bone = "右手首先";
						player.attack_enable = true;
						player.hitSnd = "hit_enemy";
						sound.play("atk_boss");
						//１段目攻撃
						animStart(player, 1,2, 8, false, function() {
							animStop(player, 10, function() {
								//１段目終了
								player.attack_enable = false;
								animStart2(player, 2,5, 10, true, function() {
									player.atari_bone = "左手首先";
									player.attack_enable = true;
									player.hitSnd = "hit_enemy";
									sound.play("atk_boss");
									//２段目攻撃
									animStart(player, 5,6, 8, false, function() {
										animStop(player, 5, function() {
											animStart2(player, 6,5, 8, true, function() {
												//２段目終了
												player.attack_enable = false;
												animStop(player, 10, function() {
													animEnd(player, 30, function() {
														actionReset(player);
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			}
			else if(type == 1) {
				const time = 210;
				player.atari_bone = "顎";	//発射ポイント

				let target = player.mesh.position.clone();
				const r = player.mesh.rotation.y;
//				target.y += 0.7;
				player.muteki = time+70;

				sound.play("roar_boss2");
				animStart(player, -1,7, 60, false, function() {
					let obj = createAttackObject("beam", target, player.playable, {player:player});
					sound.stop("beam");
					animStop(player, time, function() {
						animEnd(player, 10, function() {
							actionReset(player);
						});
					});
				});
			}
			else if(type == 2) {	//スピン攻撃
				const time = 180*2;
//				player.atari_bone = "下半身";
				player.atari_bone = "右手首先";

				sound.play("roar_boss1");
				let target = player.mesh.position.clone();
				const r = player.mesh.rotation.y;
				player.muteki = time+40;
				const org_cg = player.physicsBody.collisionFilterGroup;
				player.physicsBody.collisionFilterGroup |= 16;	//当たりを大きくするため本体にも

				player.attack_flag |= ATTACK_STRONG;
				animStart(player, -1,8, 35, false, function() {
					player.attack_enable = true;
					player.hitSnd = "hit_enemy";
					sound.play("atk_boss");
					animStop(player, time, function() {
						player.attack_enable = false;
						player.physicsBody.collisionFilterGroup &= ~16;
						animEnd(player, 10, function() {
							actionReset(player);
						});
					});
				});
			}
			else if(type == 3) {	//蜘蛛の糸
				sound.play("roar_boss1");
				animStart(player, -1,7, 5, false, function() {
					animStop(player, 15, function() {
						const r = player.mesh.rotation.y;
						let pos = player.mesh.position.clone();
						let r2 = r + 0;
						pos.add(new THREE.Vector3(Math.sin(r)*-2, 1.0, Math.cos(r)*-2));
						let obj = createAttackObject("web", pos, player.playable, {player:player, rotation:r});
						const speed = 0.3;
						obj.move.set(Math.sin(r2)*-speed, 0.0, Math.cos(r2)*-speed);
						player.capture = null;
						sound.play("atk_boss");
						animEnd(player, 10, function() {
							actionReset(player);
						});
					});
				});
			}
			else if(type == 4) {	//爆撃(?)
				animStart(player, -1,8, 5, false, function() {
					let count = 0;
					setTimerEvent(
						player.name,
						90,
						function(){
							if(++count%4 == 0) {
								if(Math.floor(count/4)%2)
									player.mesh.rotation.z+=0.1;
								else
									player.mesh.rotation.z-=0.1;
							}
						},
						function() {
							sound.play("roar_boss1");
							player.mesh.rotation.z = 0;
							count = 0;
							Jump(player,true);
							animStop(player, 50, function() {
								for(let i=0;i<15;i++) {
									let pos = player.mesh.position.clone();
									const r = i/15 * Math.PI*2;
									const len = 1.5;
									pos.add(new THREE.Vector3(Math.sin(r)*len, 0, Math.cos(r)*len));
									effect.set("sand", pos, {dir:r, scale:5});	//砂埃
								}
								animEnd(player, 10, function() {
									let old_player = getPlayable().mesh.position.clone();
									setTimerEvent(
										player.name,
										250,
										function() {
											if(++count%10 == 0) {
												let pos = player.mesh.position.clone();
												const r = Math.floor(Math.random()*12)/12 * Math.PI*2;
												const len = Math.random() * 10 + 3;
												if(Math.random() < 0.3) {
													//時々プレイヤーを狙う
//													let i = Math.floor(count/8)%3;
//													pos.copy(get(i).mesh.position);
													pos.copy(old_player);
													old_player = getPlayable().mesh.position.clone();
												}
												else {
													pos.add(new THREE.Vector3(Math.sin(r)*len, 0, Math.cos(r)*len));
												}
												pos.y += 10;
												let obj = createAttackObject("bomb", pos, player.playable, {player:player});
												obj.move.set(0,-0.0,0);
												obj.body.collisionFilterGroup &= 1;	//地面だけ
											}
										},
										function() {
											actionReset(player);
										});
								});
							});
						});
				});
			}
		}
		//もし使わなければ技力を戻す
		if(no_use && player.playable) {
			player.skill += ret_cost;
			if(player.skill >= player.skill_max) {
				player.skill = player.skill_max;
			}
			GameParam.updateLife(player.name, false);
		}
	}
}

function Walk(player, r, speed) {
	if(Math.abs(speed) > 0.4) {
		if(player.walk_pow <= speed || speed < 0) {
			player.move_dir = r;
			player.walk_pow = speed;
		}
	}
}
//ステップ移動
function Step(player, r, force) {
	if(force || isGround(player) && player.sequence == SEQ_WALK) {
		player.sequence = SEQ_STEP;
		player.step_count = 0;
		player.step_dir = r;
		player.jump_count = 0;
		player.flag &= ~FLAG_JUMP;
	}
}
function Guard(player) {
	if(isGround(player) && player.sequence == SEQ_WALK) {
		player.sequence = SEQ_GUARD;
	}
	if(player.sequence == SEQ_GUARD) {
		player.guard_count += 2;
		if(player.guard_count > 5) player.guard_count = 5;
	}
}
function resetAnimation(player) {
	const no1 = 0;
	let vrm = GameParam.getVRM(player.name);
	for(let i=0;i<animation_data[no1].length;i++) {
		if(i == 0) {
			let bn = findBone(player.mesh,player.root_bone);
			bn.position.x = 0;
			bn.position.y = player.height;
			bn.position.z = 0;
		}
		else {
			if(animation_data[no1][i].x != undefined) {
				let bn = findBone(player.mesh, animation_data[no1][i].name);
				if(bn != undefined) {
					bn.rotation.x = 0;
					bn.rotation.y = 0;
					bn.rotation.z = 0;
				}
			}
			else if(animation_data[no1][i].rate != undefined) {
				//顔モーションもリセット
				if(vrm != null) {
					vrm.blendShapeProxy.setValue(animation_data[no1][i].name , 0);
				}
			}
		}
	}
}

//アニメーションの合成
function morphAnimationVRM(player, rate, no1, no2, cur_frame, max_frame, nameraka, type) {
	let obj = player.mesh;
	let rate2 = 0;
	if(no2 == undefined) {
		no2 = no1;
	}
	else if(no1 != no2) {
		if(type == 0 || type == undefined) {
			//順番に行う
			let w,b;
			if(no2 < no1) {
				let t = no1;
				no1 = no2;
				no2 = t;
				w = max_frame / (no2-no1);
				b = max_frame - cur_frame;
			}
			else {
				w = max_frame / (no2-no1);
				b = cur_frame;
			}
			let c = 0;
			while(b >= w) {
				b -= w;
				c++;
			}
			no1 = no1 + c;
			no2 = no1+1;
			rate2 = b / w;
		}
		else {
			//no1からno2へ飛ぶ
			rate2 = cur_frame / max_frame;
		}
		if(nameraka) {	//なめらか
			rate2 = Math.sin((rate2) * (Math.PI/2));
			rate2 = 1-Math.sin((1-rate2) * (Math.PI/2));
		}
	}
	rate  = Math.min(Math.max(rate , 0), 1);
	rate2 = Math.min(Math.max(rate2, 0), 1);
	if(animation_data.length <= no1) {
		console.log("animation error "+player.name+" no:"+no1);
		return;
	}
	for(let i=0;i<animation_data[no1].length;i++) {
		if(i == 0) {
			let bn = findBone(obj,player.root_bone);
			bn.position.x *= (1-rate);
			bn.position.y *= (1-rate);
			bn.position.z *= (1-rate);
			bn.position.x += rate * ((animation_data[no1][i].x * (1-rate2)) + (animation_data[no2][i].x * rate2));
			bn.position.y += rate * ((animation_data[no1][i].y * (1-rate2)) + (animation_data[no2][i].y * rate2)+player.height);
			bn.position.z += rate * ((animation_data[no1][i].z * (1-rate2)) + (animation_data[no2][i].z * rate2));
		}
		else {
			if(animation_data[no1][i].x != undefined) {
				let bn = findBone(obj, animation_data[no1][i].name);
				if(bn != undefined) {
					bn.rotation.x *= (1-rate);
					bn.rotation.y *= (1-rate);
					bn.rotation.z *= (1-rate);
					let x0 = bn.rotation.x;
					let y0 = bn.rotation.y;
					let z0 = bn.rotation.z;
					let x1 = animation_data[no1][i].x;
					let y1 = animation_data[no1][i].y;
					let z1 = animation_data[no1][i].z;
					let x2 = animation_data[no2][i].x;
					let y2 = animation_data[no2][i].y;
					let z2 = animation_data[no2][i].z;
					x2 = getNearRotation(x1,x2);
					y2 = getNearRotation(y1,y2);
					z2 = getNearRotation(z1,z2);
					bn.rotation.x += getNearRotation(x0, rate * ((x1 * (1-rate2)) + (x2 * rate2)));
					bn.rotation.y += getNearRotation(y0, rate * ((y1 * (1-rate2)) + (y2 * rate2)));
					bn.rotation.z += getNearRotation(z0, rate * ((z1 * (1-rate2)) + (z2 * rate2)));
				}
			}
			else if(animation_data[no1][i].rate != undefined) {
				const r1 = animation_data[no1][i].rate;
				const r2 = animation_data[no2][i].rate;
				let vrm = GameParam.getVRM(player.mesh.name);
				if(vrm) {
					vrm.blendShapeProxy.setValue(animation_data[no1][i].name , ((r1 * (1-rate2)) + (r2 * rate2)) );
				}
			}
		}
	}
}

//動かしたい部位を指定してアニメーション
function morphSingleVRM(player, rate, no1, range) {
	let obj = player.mesh;
	for(let j=0;j<range.length;j++) {
		let bn = null;
		let i;
		for(i=0;i<animation_data[no1].length;i++) {
			if(range[j] == animation_data[no1][i].name) {
				bn = findBone(obj, animation_data[no1][i].name);
				break;
			}
		}
		if(bn != null) {
			if(bn.name == "root") {
				let bn = findBone(obj,player.root_bone);
				bn.position.x *= (1-rate);
				bn.position.y *= (1-rate);
				bn.position.z *= (1-rate);
				bn.position.x += rate * animation_data[no1][i].x;
				bn.position.y += rate * animation_data[no1][i].y;
				bn.position.z += rate * animation_data[no1][i].z;
			}
			else {
				bn.rotation.x *= (1-rate);
				bn.rotation.y *= (1-rate);
				bn.rotation.z *= (1-rate);
				let x0 = bn.rotation.x;
				let y0 = bn.rotation.y;
				let z0 = bn.rotation.z;
				let x1 = animation_data[no1][i].x;
				let y1 = animation_data[no1][i].y;
				let z1 = animation_data[no1][i].z;
				bn.rotation.x += getNearRotation(x0, rate * x1);
				bn.rotation.y += getNearRotation(y0, rate * y1);
				bn.rotation.z += getNearRotation(z0, rate * z1);
			}
		}
	}
}

//敵共通
function update_enemy_common(player, option)
{
	if(GameParam.GamePause != "") return;
	let target = option.target;
	if(target == undefined) {
		target = getPlayableEnemy();
		for(let obj of chara_info) {
			if(obj.enable && obj.playable && obj.target > 0 && !obj.npc) {
				if(chara_info[obj.target] == player) {	//逆にターゲットにされていたら対象を変える
					target = obj;
					break;
				}
			}
		}
	}
	switch(player.sequence) {
	case SEQ_WALK:
		{
			const x = target.mesh.position.x - player.mesh.position.x;
			const z = target.mesh.position.z - player.mesh.position.z;
			let   r = Math.atan2(x,z);
			const l = Math.sqrt(x*x+z*z);
			const r2 = getNearRotation(player.mesh.rotation.y, r + Math.PI);
			player.dir_lock = !player.boss;
			
			switch(player.enemy_mode) {
			case 0:	//一定距離まで近づく
				player.walk_pow = 0;
				if(l < option.caution_area) {
					player.count = 0;
					if(Math.random()<0.5)	player.enemy_mode+=2;
					else					player.enemy_mode++;
				}
				else {
//					Walk(player, r, option.speed);
					player.move_dir = r;
					player.walk_pow = option.speed;
				}
				break;

			case 1:	//警戒
				r -= Math.PI;
			case 2:
				r += Math.PI/2;
				if(player.boss) {
					Step(player, r, true);
					player.count += option.caution_time;//StepFrame;
				}
				else {
					player.move_dir = r;
					player.walk_pow = option.speed;
				}
				if(player.count++ >= option.caution_time) {
					player.count = 0;
					player.enemy_mode = 3;
					//攻撃パターンを決める
					player.next_attack = (option.attack == undefined) ? 0 : Math.floor(Math.random() * option.attack.length);
				}
				break;

			case 3:	//攻撃をしかける
				const attack_area = (option.attack_area == undefined) ? 0.6 : option.attack_area[player.next_attack];
				if(l < attack_area-0.3 &&
					option.caution_area < attack_area) {
					//警戒範囲より攻撃距離のほうが大きいなら離れる
					player.move_dir = -r;
					player.walk_pow = option.speed;
				}
				else if(l > attack_area) {
					player.move_dir = r;
					player.walk_pow = option.speed;
				}
				else {
					player.count = 90;
				}
				if(player.count++ >= 90) {
					player.count = 0;
					player.enemy_mode++;
					player.move_dir = r;	//前をむき直す
				}
				break;

			case 4:	//攻撃待機
				if(player.boss && player.count < 10) {
					player.dir_lock = true;
				}
				player.walk_pow = 0;
				if(option.attack_time == undefined || player.count++ > option.attack_time) {
					if(player.boss) {
						player.charge_count = 1;
						player.boss_attack_count++;
					}
					player.attack_type = option.attack[player.next_attack];
					Attack(player, player.attack_type);
					player.count = 0;
					player.enemy_mode++;	//攻撃終了後に待避
				}
				break;

			case 5:	//待避
				if(l > option.caution_area || player.count++ > 60) {
					player.count = 0;
					player.enemy_mode = 0;
				}
				else {
					player.move_dir = r;
					player.walk_pow = -option.speed;
				}
				break;
			}
			if(player.dir_lock) {
				player.mesh.rotation.y = player.mesh.rotation.y * 0.75 + r2 * 0.25;
			}
		}
		break;
	case SEQ_ATTACK:
		if(player.boss) {
			if(option.charge_time != undefined && player.charge_count++ >= option.charge_time) {
				player.charge_count = 0;
			}
			player.rengeki = true;
		}
		
	default:
		player.dir_lock = false;
		break;
	}
}

//ラスボス
function update_enemy_kumo(player, option)
{
	if(GameParam.GamePause != "") return;
	let target = option.target;
	if(target == undefined) {
		target = getPlayableEnemy();
		for(let obj of chara_info) {
			if(obj.enable && obj.playable && obj.target > 0 && !obj.npc) {
				if(chara_info[obj.target] == player) {	//逆にターゲットにされていたら対象を変える
					target = obj;
					break;
				}
			}
		}
	}
	switch(player.sequence) {
	case SEQ_WALK:
		{
			const x = target.mesh.position.x - player.mesh.position.x;
			const z = target.mesh.position.z - player.mesh.position.z;
			let   r = Math.atan2(x,z);
			const l = Math.sqrt(x*x+z*z);
			const r2 = getNearRotation(player.mesh.rotation.y, r + Math.PI);
			player.dir_lock = 1;
			
			switch(player.enemy_mode) {
			case 0:	//一定距離まで近づく
				player.walk_pow = 0;
				if(l < option.caution_area) {
					player.count = 0;
					if(Math.random()<0.5)	player.enemy_mode+=2;
					else					player.enemy_mode++;
				}
				else {
//					Walk(player, r, option.speed);
					player.move_dir = r;
					player.walk_pow = option.speed;
				}
				break;

			case 1:	//警戒
				r -= Math.PI;
			case 2:
				r += Math.PI/2;
				player.move_dir = r;
				player.walk_pow = option.speed;
				if(player.count++ >= option.caution_time) {
					player.count = 0;
					player.enemy_mode = 3;
					//攻撃パターンを決める
					player.next_attack = (option.attack == undefined) ? 0 : Math.floor(Math.random() * option.attack.length);
				}
				break;

			case 3:	//攻撃をしかける
				const attack_near = option.attack_near[player.next_attack];
				const attack_far  = option.attack_far [player.next_attack];
				if(l < attack_near &&
					option.caution_area < attack_far) {
					//警戒範囲より攻撃距離のほうが大きいなら離れる
					player.move_dir = r;
					player.walk_pow = -option.speed*2;
					player.walk_count --;
				}
				else if(l > attack_far) {
					player.move_dir = r;
					player.walk_pow = option.speed*2;
					player.walk_count ++;
				}
				else {
					player.count = 90;
				}
				if(player.count++ >= 90) {
					player.count = 0;
					player.enemy_mode++;
					player.move_dir = r;	//前をむき直す
				}
				break;

			case 4:	//攻撃待機
				if(player.count < 10) {
					player.dir_lock = true;
				}
				player.walk_pow = 0;
				if(option.attack_time == undefined || player.count++ > option.attack_time) {
					player.charge_count = 1;
					player.boss_attack_count++;

					player.attack_type = option.attack[player.next_attack];
					Attack(player, player.attack_type);
					player.count = 0;
					player.enemy_mode++;	//攻撃終了後に待避
				}
				break;

			case 5:	//待避
				if(l > option.caution_area || player.count++ > 60) {
					player.count = 0;
					player.enemy_mode = 0;
				}
				else {
					player.move_dir = r;
					player.walk_pow = -option.speed;
				}
				break;
			}
			if(player.dir_lock) {
				player.mesh.rotation.y = player.mesh.rotation.y * 0.95 + r2 * 0.05;
			}
		}
		break;
	case SEQ_ATTACK:
		if(player.boss) {
			if(option.charge_time != undefined && player.charge_count++ >= option.charge_time) {
				player.charge_count = 0;
			}
			player.rengeki = true;
			
			if(player.attack_type == 2) {
				player.count++;
				//回転アタック
				let spd = 2 * (4/GameParam.physics_speed)/2;
				let r = player.count / 30;
				player.step2_vec.set(Math.sin(r)*spd,0,Math.cos(r)*spd);
				player.step2_count = 1;
				player.step2_max = 5;
				player.dir_lock = false;
				player.mesh.rotation.y += Math.PI/10;
			}
		}
	default:
		player.dir_lock = false;
		break;
	}
}


//友軍（分身）
function update_friend(player)
{
	player.walk_pow = 0;
	if(GameParam.BattleMode != 0) {
		//戦闘中にターゲットを失った（プレイヤー交代により）
		if(player.target < 0) {
			let target = getBunshinTarget(player);
			if(target.length > 0) {
				player.target = target[1 % target.length].index;	//２番目
			}
		}
	}
	let walk_spd = 1.0;
	if(GameParam.BattleMode == 0 && GameParam.GamePause == "") {
		walk_spd *= 1.5;
	}
	
	if(player.target < 0) {
//		const pno = getId(getPlayable().name);
//		if(isNaN(pno)) return;
		const lentbl = {
			"tamami": {"ayame" :1.33, "karin" :2.8},
			"ayame" : {"tamami":1.33, "karin" :2.8},
			"karin" : {"ayame" :1.33, "tamami":2.8},
		};
		const movlen = lentbl[getPlayable().type][player.name];	//操作キャラからとる距離。重ならないようずらす
		//とりあえずプレイヤーについていく
		let pos = getPlayable().mesh.position.clone();
		pos.sub(player.mesh.position);
		let r = Math.atan2(pos.x, pos.z);
		let l = Math.sqrt(pos.x*pos.x + (pos.y*pos.y)/5 + pos.z*pos.z);
		switch(player.sequence) {
		case SEQ_WALK:
			player.move_dir = r;
			if(l > movlen) {	//近い場合は歩かない
				Walk(player, r, walk_spd);
			}
			break;
		}
		
		//離れすぎるとワープ
		if(l > 10) {
			const parent = getPlayable().mesh.position;
			//操作キャラの周囲で高さが一番近いところ
			let h = 1;
			const h1 = GameParam.stage.getAtarif(parent.x, parent.z);
			const r3 = getPlayable().move_dir;
			let pos = new THREE.Vector3();
			for(let r=0;r<8;r++) {
				let r2 = r/8 * Math.PI*2;
				let x = parent.x + Math.sin(r2)*3.5;
				let z = parent.z + Math.cos(r2)*3.5;
				let r4 = Math.abs(r3-getNearRotation(r3, r2));	//進路妨害しにくく
				if(r4 > Math.PI/4) {
					const h0 = GameParam.stage.getAtarif(x,z);
					const h2 = Math.abs(h0 - h1);
					if (h > h2) {
						h = h2;
						pos.set(x,GameParam.stage.getHeightf(x,z),z);
					}
				}
			}
			if( h < 1 ) {	//1m以内
				pos.y += 0.5;
				player.mesh.position.copy(pos);
				pos.y += player.AtariSize;
				player.physicsBody.position.set(pos.x, pos.y, pos.z);
				//位置を決定
				setArrive(player.name);
				player.physicsBody.wakeUp();
				player.jump_count = 0;
				player.swim_count = player.is_swim = 0;
				sound.play("dron");
			}
		}

		return;
	}
	const enemy = chara_info[player.target];
	let x = enemy.mesh.position.x - player.mesh.position.x;
	let z = enemy.mesh.position.z - player.mesh.position.z;
	let r = Math.atan2(x,z);
	let l = Math.sqrt(x*x+z*z);
	switch(player.sequence) {
	case SEQ_WALK:
		if(player.next_attack < 0) {
			let no;
			let idx = 0;
			do {
				if(Math.random() < 0.33) {
					idx = (Math.random() < 0.5) ? 1 : 2;
				}
				no = GameParam.user.getAttackAssign(player.type, idx);

				if(player.name == "ayame_clone") {
					if(no == 89) continue;
				}
			} while(no < 70 || GameParam.user.getSkill(player.type,no) == 0);	//非所持は使わない

			player.next_attack = idx;
			player.attack_type = no;
		}
		player.move_dir = r;
		const info = GameParam.user.getInfo(player.attack_type);
		const area = ((info.attack_area == undefined) ? 0.5 : info.attack_area) + enemy.AtariSize;
		if(l > area+0.1) {	//遠ければ移動
			Walk(player, r, 1);
			player.count = 0;
		}
		else if(l < area-0.1) {	//近すぎるなら離れる
			Walk(player, r, -1);
			player.count = 0;
		}
		else if(enemy.sequence == SEQ_ATTACK && player.name != "ayame_clone" && l < 3) {	//敵が攻撃したら回避運動
			if(enemy.attack_enable) {
				Guard(player);
			}
			else {
				Step(player, r + Math.PI);
			}
		}
		else {
			if(enemy.mesh.position.y > player.mesh.position.y+0.5) {
				Jump(player);
				player.count = 5;
			}
			if(player.count <= 0) {
				Attack(player, player.attack_type%10);
				player.count = 15;
				player.next_attack = -1;
			}
			else {
				player.count--;
			}
		}
		break;
	case SEQ_ATTACK:
		//敵の動きを見て対応
		if(enemy.sequence == SEQ_WALK) {
			player.rengeki = (Math.random() < 0.95) ? true : false;
		}
		break;
	case SEQ_GUARD:
		if(enemy.sequence == SEQ_ATTACK) {
			Guard(player);	//攻撃中はガードを解かない
		}
		break;
	}
	if(player.target >= 0) {
		if(!enemy.enable || enemy.life <= 0) {
			//もし対象がやられたら切り替え
			let target = getBunshinTarget(player);
			if(target.length > 0) {
				player.target = target[0].index;
			}
			else {
				//相手がいない
				player.target = -1;
			}
		}
	}
}

//影分身の術
function getBunshinTarget(position) {
	//positionから遠い順に生きている敵を探索
	let target = [];
	for(let i=0;i<chara_info.length;i++) {
		let p = chara_info[i];
		if(!p.playable && p.enable && p.life > 0 && !p.npc) {
			const x = position.x + p.mesh.position.x;
			const z = position.z + p.mesh.position.z;
			target.push({
				index: i,
				len : Math.sqrt(x*x + z*z)
			});
		}
	}
	target.sort(function(a,b){	//距離の遠い順に別々の相手
		return (a.len > b.len);
	});
	return target;
}

//プレイヤー（操作）キャラを取得
function getPlayable() {
	return chara_info[GameParam.user.status.select_chara];
}
//クローンがいたらそちらを優先
function getPlayableEnemy() {
	for(let e of chara_info) {
		if(e.playable && e.enable &&  !e.npc) {
			if(e.name.indexOf("_clone") >= 0) {
				return e;
			}
		}
	}
	return getPlayable();
}


function updatePersonal(player) {

	if(!player.enable) {
		return;
	}
	if(player.sequence == SEQ_DEAD_END) {
		if(player.playable) {
			player.physicsBody.sleep();
			player.physicsBody.velocity.set(0,0,0);
			if(++player.lost >= GameParam.RecoverTime || GameParam.BattleMode == 0) {
				player.life = Math.max(player.life, Math.floor(player.life_max * RECOVER_LIFE));
				player.lost = 0;
				if(GameParam.BattleMode == 0) {
					player.hold_weapon = 0;
				}
				GameParam.updateLife(player.name, false);
				actionReset(player);

				//ターゲット再探索
				let target = getBunshinTarget(player);
				if(target.length > 0) {
					player.target = target[0].index;
				}
				
				sound.play("battle_revive");
			}
			GameParam.SetLife(player);	//lost反映

			//physicsBodyをmeshに反映
			player.mesh.position.set(
				player.physicsBody.position.x,
				player.physicsBody.position.y-player.AtariSize,
				player.physicsBody.position.z);
		}
		return;
	}
	if(GameParam.AtariDebug & 1) {
		player.debug_atari0.position.copy(player.physicsBody.position);
		player.debug_atari0.quaternion.copy(player.physicsBody.quaternion);
	}
	if(GameParam.AtariDebug & 2) {
		player.debug_atari1.position.copy(player.attackBody.position);
		player.debug_atari1.quaternion.copy(player.attackBody.quaternion);
		player.debug_atari2.position.copy(player.damageBody.position);
		player.debug_atari2.quaternion.copy(player.damageBody.quaternion);
	}

	let obj = player.mesh;

	player.walk_type = GameParam.stage.updatePersonal(obj.position);
	
	if(player.npc) {
		setAnimationData("common");

		//近接判定
		if(player.hitBall) {
			const target = getPlayable();
			if(player.hitBall.containsPoint(target.mesh.position)) {
				target.hitNPC = player;
			}
			else {
				target.hitNPC = null;
			}
		}
		
		//押して動かないように、自発的に動かなければ静止させる
		if(player.walk_pow == 0) {
			player.physicsBody.position.copy(player.old_position);
		}
	}
	else if(player.playable) {
		if(GameParam.BattleMode == 0) {
			if(player.name.indexOf("clone") >= 0) {	//非バトル時なにもしない
				return;
			}
		}
		setAnimationData(player.type);
		if(GameParam.GamePause == "") {
			//気功
			const sk = GameParam.user.getSkill(player.type,16);
			if(sk > 0 && player.sequence == 0) {
				const rate = 1 - (player.skill / (player.skill_max/2));
				if(rate >= 0.0) {	//半分以下のとき
					if(GameParam.count % Math.floor(300 + rate*300 - sk*40) == 0) {
						player.skill++;
						GameParam.SetSkill(player);
						GameParam.updateLife(player.name, false);
					}
				}
			}

			//いろいろ行動
			if(player.friend) {
				update_friend(player);
			}
		}
	}
	else if(player.type == "enemy00") {
		//敵：通常
		setAnimationData("enemy00");
		update_enemy_common(player, {
	//		target,
			caution_area : 3.0,
			caution_time : 30,
			speed : 0.5,
			attack_time : 30,
			attack_area : [0.5],
			attack : [0],
		});
	}
	else if(player.type == "enemy01") {
		//投石
		setAnimationData("enemy00");
		update_enemy_common(player, {
	//		target,
			caution_area : 4.5,
			caution_time : 90,
			speed : 0.33,
			attack_time : 15,
			attack_area : [4.0],
			attack : [0],
		});
	}
	else if(player.type == "enemy02") {
		// G
		setAnimationData("enemy00");
		update_enemy_common(player, {
	//		target,
			caution_area : 4.0,
			caution_time : 30,
			speed : 1.0,
			attack_area : [0.5],
			attack : [0],
		});
	}
	else if(player.type == "enemy03") {
		//飛行
		setAnimationData("enemy00");
		update_enemy_common(player, {
	//		target,
			caution_area : 5.0,
			caution_time : 150,
			speed : 0.75,
			attack_area : [0.75],
			attack : [0],
		});
	}
	else if(player.type == "enemy04") {
		//棒
		setAnimationData("enemy00");
		update_enemy_common(player, {
	//		target,
			caution_area : 3.0,
			caution_time : 115,
			speed : 0.5,
			attack_time : 30,
			attack_area : [1.0, 1.0, 1.0],
			attack : [0, 0, 1],
		});
	}
	else if(player.type == "enemy10") {
		//敵：マッチョタイプ
		setAnimationData("enemy10");
		update_enemy_common(player, {
	//		target,
			caution_area : 2.5,
			caution_time : 15,
			speed : 0.5,
			attack_time : 20,
			attack_area : [4, 0.75, 2],
			attack : [0, 1, 2],
			//0:ジャンプ攻撃
			//1:地面パンチ
			//2:ロングパンチ
		});
	}
	else if(player.name == "emily") {
		//ボス：エミリー
		setAnimationData("ayame");
		if(player.boss_attack_count%5 < 4) {
			update_enemy_common(player, {
				target : getPlayableEnemy(),
				caution_area : 4.0,
				caution_time : 45,
				speed : 1.4,
				attack_time : 10,
				attack_area : [0.8, 0.8, 4, 1, 2.5],
				attack :      [0,   0,   1, 2, 3  ],
				charge_time : 45,
			});
		}
		else {
			//特殊攻撃（大技）
			update_enemy_common(player, {
				target : getPlayableEnemy(),
				caution_area : 4.0,
				caution_time : 5,
				speed : 1.0,
				attack_time : 30,
				attack_area : [6],
				attack :      [7],
				charge_time : 0,
			});
		}
	}
	else if(player.name == "tsumugi") {
		//ボス：紬
		setAnimationData("karin");
		if(player.boss_attack_count%5 < 4 && 1) {
			if(player.life < player.life_max/3) {	//体力が減ったら雷→バリア
				update_enemy_common(player, {
					target : getPlayableEnemy(),
					caution_area : 4.0,
					caution_time : 45,
					speed : 1.4,
					attack_time : 10,
					attack :      [0,   1  , 1  , 2],
					attack_area : [1.2, 1.4, 1.4, 4],
					charge_time : 45,
				});
			}
			else {
				update_enemy_common(player, {
					target : getPlayableEnemy(),
					caution_area : 4.0,
					caution_time : 45,
					speed : 1.4,
					attack_time : 10,
					attack :      [0,   0,   1,   3],
					attack_area : [1.2, 1.2, 1.4, 4],
					charge_time : 45,
				});
			}
		}
		else {
			//特殊攻撃（大技）
			update_enemy_common(player, {
				target : getPlayableEnemy(),
				caution_area : 4.0,
				caution_time : 5,
				speed : 1.0,
				attack_time : 30,
				attack_area : [6],
				attack :      [7],
				charge_time : 0,
			});
		}
	}
	else if(player.name == "tomoka") {
		//ボス：朋花
		setAnimationData("tamami");
		if(player.boss_attack_count%5 < 4) {
			update_enemy_common(player, {
				target : getPlayableEnemy(),
				caution_area : 4.0,
				caution_time : 45,
				speed : 1.4,
				attack_time : 10,
				attack_area : [0.8, 0.8, 4, 1, 2.5],
				attack :      [0,   0,   1, 2, 3  ],
				charge_time : 45,
			});
		}
		else {
			//特殊攻撃（大技）
			update_enemy_common(player, {
				target : getPlayable(),		//プレイヤーを狙うため正確に
				caution_area : 4.0,
				caution_time : 5,
				speed : 1.0,
				attack_time : 1,
				attack_area : [6],
				attack :      [7],
				charge_time : 0,
			});
		}
	}
	else if(player.name == "kumo") {
		//
		setAnimationData("kumo");
		if(player.capture) {
			//捕獲状態
			update_enemy_kumo(player, {
				target : getPlayableEnemy(),
				caution_area : 4.0,
				caution_time : 1,
				speed : 1.25,
				attack :      [0  ],
				attack_near : [2.7],
				attack_far  : [3.2],
				charge_time : 45,
			});
		}
		else {
			update_enemy_kumo(player, {
				target : getPlayableEnemy(),
				caution_area : 4.0,
				caution_time : 45,
				speed : 0.9,
	//			attack_time : 10,
				attack :      [0,   1,  2, 3, 4 ],
				attack_near : [2.7, 3,  2, 2, 1 ],
				attack_far  : [3.2, 20, 5, 8, 12],
				charge_time : 45,
			});
			/*
				0 : 近距離通常
				1 : ビーム
				2 : スピン
				3 : 糸
				4 : 爆撃
			*/
		}
	}
	else {
		return;
	}
	if(player.muteki > 0) player.muteki--;	//無敵時間
	if(player.attack_up > 0) player.attack_up--;	//バフ
	if(player.armor_break > 0) player.armor_break--;	//防御
	if(player.damage_down > 0) player.damage_down--;

	//物理BodyのY座標が動いていなければ地面にいる
	if(player.physicsBody != null) {
		if(Math.abs(player.physicsBody.position.y - player.old_position.y) < 0.01) {
			player.not_drop++;
		}
		else {
			//坂を滑っている可能性もある
			player.not_drop = 0;
		}
		
		//地面に埋まっていないか定期的にチェック
		if(GameParam.count%30 == 0) {
			const h = GameParam.stage.getHeightf(player.physicsBody.position.x, player.physicsBody.position.z) + player.AtariSize;
			if(player.physicsBody.position.y < h-0.5) {
				player.physicsBody.position.y = h;
			}
		}
	}

	//ジャンプする
	if(player.jump_count > 0) {
		if(player.flag & FLAG_JUMP_END) {
			if((player.jump_count-=2)<=0) {
				player.flag &= ~FLAG_JUMP_END;
				player.jump_count = 0;
			}
		}
		else {
			const jump_frame = 33;	//長さ
			player.jump_count++;

			if(player.not_drop && player.jump_count > 3) {
				player.jump_count = jump_frame;
				if(isGround(player)) {
					player.flag |= FLAG_JUMP_END;
					player.jump_count = 10;
				}
			}
			else {
				//ジャンプ力
				if(player.jump_count <= jump_frame) {
					//ジャンプの高さ
//					player.physicsBody.velocity.y = Math.sin((player.jump_count/jump_frame+1)*Math.PI/2)*(8/GameParam.physics_speed);
					player.physicsBody.velocity.y = Math.sin((player.jump_count/jump_frame+1)*Math.PI/2)*(6/GameParam.physics_speed);
					if(player.boss == 2) {
//						player.physicsBody.velocity.y *= 10;
					}
				}
			}
		}
	}
	//着水
	if(player.playable) {
		if(obj.position.y < GameParam.WaterLine+0.1) {
			player.is_swim = 1;
			if(player.swim_count < 30) player.swim_count++;
		}
		else {
			player.is_swim = 0;
			if(player.swim_count > 0) player.swim_count--;
		}
		//泳ぐときは減速
		if(player.is_swim || player.swim_count > 0) {
			let r = Math.sin(GameParam.count/GameParam.SwimFrame+Math.PI)/2+0.5;
			player.walk_pow *= r*0.6 + 0.2;
		}
	}
	//歩く
	if((player.walk_pow < -0.1 || player.walk_pow > 0.1) && (player.sequence == SEQ_WALK || (player.flag & FLAG_MOVE_FORCE))) {
		let spd = player.walk_pow * (4/GameParam.physics_speed) * 1500;
//		spd *= player.physicsBody.mass / 100;
//		if(player.name == "ayame") spd *= 1.25;
		let walk_vec = new THREE.Vector3(Math.sin(player.move_dir)*spd, 0, Math.cos(player.move_dir)*spd);
		player.physicsBody.force.x = walk_vec.x;
		player.physicsBody.force.z = walk_vec.z;
		
		if(player.walk_pow > 0) {
			player.walk_pow -= 0.1;
			if(player.walk_pow < 0) player.walk_pow = 0;
			if(player.walk_pow > 1) player.walk_pow = 1;
		}
		else {
			player.walk_pow += 0.1;
			if(player.walk_pow > 0) player.walk_pow = 0;
			if(player.walk_pow < -1) player.walk_pow = -1;
		}
		if(!player.dir_lock) {	//移動方向に対して向く
//			let r = Math.atan2(-walk_vec.x, -walk_vec.z);
//			r = getNearRotation(player.mesh.rotation.y, r);
//			let r = getNearRotation(player.mesh.rotation.y, player.move_dir + Math.PI);
//			player.mesh.rotation.y = player.mesh.rotation.y * 0.75 + r * 0.25;
		}
		if(player.move_count < 10) player.move_count++;

		if(player.jump_count == 0 && player.playable) {
			if(player.is_swim) {
				let r = Math.sin(GameParam.count/GameParam.SwimFrame);
//				if(r < -0.9 || r > 0.9) {
				if(r > 0.2 && r < 0.4 || r < -0.2 && r > -0.4) {
					let l = 0.7;
					let pos = player.mesh.position.clone();
					pos.x += Math.sin(player.mesh.rotation.y) * l;
					pos.y += player.height+0.1;
					pos.z += Math.cos(player.mesh.rotation.y) * l;
					effect.set("water", pos, {dir:player.mesh.rotation.y,scale:1});	//
				}
			}
			else if(GameParam.PerfMode != 0 && GameParam.season != "") {
				let stp = player.walk_count/7;
				let r = Math.sin(stp);
				if(r < -0.95 || r > 0.95) {
					let h = GameParam.stage.getHeightf(player.mesh.position.x, player.mesh.position.z);
					if(player.mesh.position.y < h + 0.5) {	//地面から離れていたら無視（橋の上など）
						if(!GameParam.stage.getKind(player.mesh.position.x, player.mesh.position.z)) {	//岩場以外
							let name = "sand";
							if(GameParam.stage.getSandf(player.mesh.position.x, player.mesh.position.z) < 0.5) {
								name = "grass";
							}
							effect.set(name, player.mesh.position, {dir:player.mesh.rotation.y, scale:1});	//砂埃
						}
					}
				}
			}
		}
	}
	else if(player.move_count > 0) {
		player.move_count--;
	}
	if(player.sequence == SEQ_WALK && !player.dir_lock) {
		let r = getNearRotation(player.mesh.rotation.y, player.move_dir + Math.PI);
		player.mesh.rotation.y = player.mesh.rotation.y * 0.75 + r * 0.25;
	}
	//方向転換だけ有効
	else if(player.flag & FLAG_DIR_CTRL && player.walk_pow > 0.2) {
		let r = getNearRotation(player.mesh.rotation.y, player.move_dir + Math.PI);
		player.mesh.rotation.y = player.mesh.rotation.y * 0.96 + r * 0.04;	//遅め
	}

	//ステップ移動
	if(player.sequence == SEQ_STEP) {
		if(++player.step_count <= StepFrame) {
			if(player.step_count <= StepFrame/2) {
				player.step_count++;
				let spd = Math.sin(player.step_count/StepFrame*Math.PI) * (4/GameParam.physics_speed) * 4;
				let walk_vec = new THREE.Vector3(Math.sin(player.step_dir)*spd, spd*0.2, Math.cos(player.step_dir)*spd);
				player.physicsBody.velocity.set(walk_vec.x, walk_vec.y, walk_vec.z);
			}
		}
		else {
			player.sequence = SEQ_WALK;
		}
	}
	//ステップ２
	if(player.step2_count > 0) {

		const rate  = Math.cos((player.step2_count/player.step2_max)*Math.PI/2);
		let   rate2 = Math.cos((player.step2_count/player.step2_max*2)*Math.PI/2);
		if(rate2 < 0) rate2 = 0;
		player.physicsBody.velocity.x += player.step2_vec.x * rate;
		player.physicsBody.velocity.y += player.step2_vec.y * rate2;
		player.physicsBody.velocity.z += player.step2_vec.z * rate;
		
		if(++player.step2_count > player.step2_max) {
			player.step2_count = 0;
		}
	}

	//抵抗
	player.physicsBody.velocity.x *= 0.7;
	player.physicsBody.velocity.z *= 0.7;

	//飛行タイプ
	if(player.type == "enemy03") {	//羽
		const s = 0.66;
		let h = GameParam.stage.getHeightf(player.mesh.position.x, player.mesh.position.z);
		if(player.sequence == SEQ_WALK) {
			h += 1.5 + Math.sin(GameParam.count/15) * s;	//目標の高さ
			if(player.armor_break > 0) {	//Break中は低く
				h -= 1;
			}
			player.physicsBody.velocity.y = -(player.mesh.position.y - h);
		}
		else if(player.sequence == SEQ_ATTACK) {
			h += 0.5;	//目標の高さ
			player.physicsBody.velocity.y = -(player.mesh.position.y - h) * 3;
		}
		else {
		}
	}
	if(player.flag & FLAG_STOP_DOWN) {
		player.physicsBody.velocity.y = 0;
	}
	else if((player.flag & FLAG_SLOW_DOWN) ||  player.sequence == SEQ_DAMAGE) {
		if(player.physicsBody.velocity.y < 0)
			player.physicsBody.velocity.y *= 0.2;
	}
	//ある程度自発的な移動がなくなったらsleepさせて動かなくする
	if(1){
		let x = player.physicsBody.velocity.x;
		let y = player.physicsBody.velocity.y;
		let z = player.physicsBody.velocity.z;
		let a = Math.sqrt(x*x + y*y + z*z);
		x = player.physicsBody.force.x;
		y = player.physicsBody.force.y;
		z = player.physicsBody.force.z;
		let b = Math.sqrt(x*x + y*y + z*z);
		if(a > 0.3 || b > 200) {
			player.physicsBody.wakeUp();
			player.fix_count = 0;
		}
		//空中停止してしまうので空中ではsleepしない
		else if(isGround(player) && !(player.flag & FLAG_SLOW_DOWN)) {
			player.fix_count++;
			player.physicsBody.velocity.x = 
			player.physicsBody.velocity.y = 
			player.physicsBody.velocity.z = 0;
			if(player.fix_count == 30) {
				player.physicsBody.sleep();
			}
		}
		else {
			player.fix_count = 0;
		}
	}

	//physicsBodyをmeshに反映
	player.mesh.position.set(player.physicsBody.position.x,player.physicsBody.position.y-player.AtariSize,player.physicsBody.position.z);
	if(!player.npc) {
		//攻撃受ける当たり判定
		player.damageBody.position.set(player.mesh.position.x, player.mesh.position.y+(0.75), player.mesh.position.z);
	}

	//リセット前の状態を覚える
	for(let key in old_body) {
		const s = findBone(obj, key);
		if(s) {
			let d = old_body[key];
			d.x = s.rotation.x;
			d.y = s.rotation.y;
			d.z = s.rotation.z;
		}
	}
	resetAnimation(player);

	let standup = true;
		
	//敵は泳がないのでswim_countを個別のカウンタとして使い回す
	if(player.type == "enemy00") {
		const max_frame = 15*5;
		if(player.sequence == SEQ_WALK) {
			if(player.swim_count++ >= max_frame) {
				player.swim_count = 0;
			}
		}
		morphAnimationVRM(player, 1.0, 0,2, player.swim_count, max_frame, true);

	}
	else if(player.type == "enemy01") {
		const max_frame = 15*5;
		if(player.sequence == SEQ_WALK) {
			if(player.swim_count++ >= max_frame) {
				player.swim_count = 0;
			}
		}
		morphAnimationVRM(player, 1.0, 0,2, player.swim_count, max_frame, true);

	}
	else if(player.type == "enemy02") {
		const max_frame = 15;
		if(player.sequence == SEQ_WALK) {
			if(player.swim_count++ >= max_frame) {
				player.swim_count = 0;
			}
		}
		morphAnimationVRM(player, 1.0, 8,11, player.swim_count, max_frame, true);

	}
	else if(player.type == "enemy03") {
		const max_frame = 15*5;
		if(player.sequence == SEQ_WALK) {
			if(player.swim_count++ >= max_frame) {
				player.swim_count = 0;
			}
		}
		morphAnimationVRM(player, 1.0, 16,18, player.swim_count, max_frame, true);

	}
	else if(player.type == "enemy04") {
		const max_frame = 15*5;
		if(player.sequence == SEQ_WALK) {
			if(player.swim_count++ >= max_frame) {
				player.swim_count = 0;
			}
		}
		morphAnimationVRM(player, 1.0, 24,26, player.swim_count, max_frame, true);

	}
	else if(player.type == "enemy10") {
		const max_frame = 15*5;
		if(player.sequence == SEQ_WALK) {
			if(player.swim_count++ >= max_frame) {
				player.swim_count = 0;
			}
		}
		morphAnimationVRM(player, 1.0, 0,2, player.swim_count, max_frame, true);
	}
	let is_weapon = 0;
	//呼吸のみ
	if(player.npc && !standup) {
		var breath = Math.sin(GameParam.count / 20);
		var body2 = findBone(obj,"J_Bip_C_Chest");	//上半身
		body2.rotation.x += breath*0.02;
		var body4 = findBone(obj,"J_Bip_C_UpperChest");	//上半身2
		body4.rotation.x += breath*0.02;
		
		//立ち
		var neck = findBone(obj,"J_Bip_C_Neck");
		neck.rotation.x += breath*-0.02;
	}
	//立ち＆歩きモーション
	if((player.playable || player.boss == 1 || player.npc) && player.name != "kumo" && standup) {
		var jmp = player.jump_count/10;
		var w = player.move_count/10;
		var stp = player.walk_count / 7;
		var r = (Math.sin(stp));
		var l = (Math.cos(stp));
		var r2 = (Math.sin(stp*2));
		var l2 = (Math.cos(stp*2));
		var body = findBone(obj,"Root");
		
		//歩行モーション
		if(player.swim_count < 30 || player.boss) {
			var breath = Math.sin(GameParam.count / 20);
			var hip = findBone(obj,player.root_bone);
			hip.position.y = player.height+0.02*w*r2;
			
			if(player.sequence == SEQ_STEP) {
				if(player.step_count < 5)
					jmp = player.step_count / 5;
				else if(player.step_count >= StepFrame-5)
					jmp = (StepFrame - player.step_count)/5;
				else
					jmp = 1;

				const dir = obj.rotation.y;		//向き
				let rot = dir - getNearRotation(dir, player.step_dir);

				if(rot < -Math.PI*0.75 || rot > Math.PI*0.75 || (rot >= -Math.PI*0.25 && rot < Math.PI*0.25)) {	// 前転/バク転
					jmp *= 2;
				}
			}
			else {
				/*if(player.jump_count >= 25)
					jmp = (35 - player.jump_count)/10;
				else*/ if(jmp > 1)
					jmp = 1;
				if(jmp < 0) jmp = 0;
			}
			if(jmp < 1.0) {
				player.walk_count ++;	//ジャンプ中は足を動かさない
				
				//足音
				if(player.playable && !player.friend && w > 0.5) {
					if(player.walk_type == "weed") {
						if(player.walk_count % 35 == 0) {
							sound.play("field_walk_weed");
						}
					}
					else if(player.walk_type == "snow") {
						if(player.walk_count % 40 == 0) {
							sound.play("field_walk_snow");
						}
					}
					else if(player.walk_count % 40 == 0) {
						if(GameParam.stage.getKind(player.mesh.position.x,player.mesh.position.z) != 0) {
							sound.play("field_walk_rock");
						}
						else if(GameParam.stage.getSandf(player.mesh.position.x,player.mesh.position.z) < 0.5) {
							sound.play("field_walk_grass");
						}
						else {
							sound.play("field_walk_sand");
						}
					}
				}
			}
			let ninja = 0;
			if(player.type == "ayame" && GameParam.BattleMode == 0) {
				ninja = (w > 0);
				breath *= (1-w);
			}

			var body2 = findBone(obj,"J_Bip_C_Chest");	//上半身
			body2.rotation.x = (r2 * 0.05 - 0.05) * w + breath*0.02;
			body2.rotation.y = r*0.1 * w;
//			body2.position.z += r*0.1 * w;
			var body4 = findBone(obj,"J_Bip_C_UpperChest");	//上半身2
			body4.rotation.x = (r2 * 0.02) * w + jmp * -0.5 + breath*0.02;
			hip.rotation.x = -(r2 * 0.05 + 0.15) * w;
			hip.rotation.y = r*-0.1 * w;
			
			var foot1 = findBone(obj,"J_Bip_L_UpperLeg");
			var foot2 = findBone(obj,"J_Bip_R_UpperLeg");
			foot1.rotation.x = (r*-(0.5) + 0.3) * w + jmp * 0.5;
			foot2.rotation.x = (r* (0.5) + 0.3) * w + jmp * 0.5;
			
			//立ち
			foot1.rotation.z = (-0.15) * (1-w) * (1-jmp*0.5);
			foot2.rotation.z = ( 0.15) * (1-w) * (1-jmp*0.5);
			findBone(obj,"J_Bip_R_Foot").rotation.z = (-0.15) * (1-w);
			findBone(obj,"J_Bip_L_Foot").rotation.z = ( 0.15) * (1-w);

			var neck = findBone(obj,"J_Bip_C_Neck");
			neck.rotation.x = -r2*0.05 * w + breath*-0.02;

			var knee1 = findBone(obj,"J_Bip_L_LowerLeg");
			var knee2 = findBone(obj,"J_Bip_R_LowerLeg");
			knee1.rotation.x = -((Math.cos(stp+Math.PI)/2+0.5)*Math.PI/2)*w - jmp;
			knee2.rotation.x = -((Math.cos(stp)        /2+0.5)*Math.PI/2)*w - jmp;

			//腕ふり
			var sho1 = findBone(obj,"J_Bip_L_UpperArm");
			var sho2 = findBone(obj,"J_Bip_R_UpperArm");
			if(ninja) {

				foot1.rotation.x = ((Math.cos(stp*2+Math.PI)+1)*0.5*Math.PI/2)*w;
				foot2.rotation.x = ((Math.cos(stp*2)        +1)*0.5*Math.PI/2)*w;
				knee1.rotation.x = -foot1.rotation.x;
				knee2.rotation.x = -foot2.rotation.x;

				findBone(obj,"J_Bip_R_Foot").rotation.x = -0.5*w;
				findBone(obj,"J_Bip_L_Foot").rotation.x = -0.5*w;

				hip.rotation.x *= (1-w);
				hip.rotation.y *= (1-w);
				body2.rotation.x *= (1-w)*0.5+0.5;
				body2.rotation.y *= (1-w);
				body4.rotation.x *= (1-w);

				neck.rotation.x = 0.66 * w;
				hip.rotation.x -= 0.5*w*Math.PI/2;
//				hip.position.y = player.height-0.05*w;
				hip.position.y -= 0.05;

				//忍者走り
				let r3 = Math.PI/2 * (-0.25) * w;
				let r4 = Math.PI/2 * (0.8 + w*0.0);
				sho1.rotation.x =  r3 + jmp*0.5 - breath*0.04;
				sho2.rotation.x =  r3 + jmp*0.5 - breath*0.04;
				sho1.rotation.z =  r4 - jmp*0.5;
				sho2.rotation.z = -r4 + jmp*0.5;
			}
			else {
				sho1.rotation.x = ( r*0.66) * w + jmp*0.5 - breath*0.04;
				sho2.rotation.x = (-r*0.66) * w + jmp*0.5 - breath*0.04;
				sho1.rotation.z =  Math.PI/2*0.8 - jmp*0.5;
				sho2.rotation.z = -Math.PI/2*0.8 + jmp*0.5;
				var elb1 = findBone(obj,"J_Bip_L_LowerArm");
				var elb2 = findBone(obj,"J_Bip_R_LowerArm");
				elb1.rotation.y = -(Math.PI/2+r*0.2)*0.4 * w - jmp*0.5;
				elb2.rotation.y =  (Math.PI/2+r*0.2)*0.4 * w + jmp*0.5;
			}
		}
		//泳ぎモーション
		if(player.swim_count > 0 && player.playable) {
			
			let w = player.swim_count/30;
			let iw = 1-w;

			if(player.playable && !player.friend && w > 0.5) {
				if(GameParam.count % 40 == 0) {
					sound.play("field_swim");
				}
			}

			var hip = findBone(obj,player.root_bone);
			hip.rotation.x = (iw*hip.rotation.x) + w*(Math.sin(w*Math.PI/2)*-Math.PI/2*0.9);
			hip.position.y = w*Math.sin(w*Math.PI/2)*(player.height+Math.cos(GameParam.count/GameParam.SwimFrame)*0.03-0.01);

			var neck = findBone(obj,"J_Bip_C_Neck");
			neck.rotation.x = (iw*neck.rotation.x) + w*(0.7);

			var body2 = findBone(obj,"J_Bip_C_Chest");	//上半身
			body2.rotation.x = (iw*body2.rotation.x) + w*(0.1);
			var body4 = findBone(obj,"J_Bip_C_UpperChest");	//上半身2
			body4.rotation.x = (iw*body4.rotation.x) + w*(0.3);
			var foot1 = findBone(obj,"J_Bip_L_UpperLeg");
			var foot2 = findBone(obj,"J_Bip_R_UpperLeg");
			foot1.rotation.x = (iw*foot1.rotation.x) + w*( Math.sin(GameParam.count/GameParam.SwimFrame)*0.2+0.05);
			foot2.rotation.x = (iw*foot2.rotation.x) + w*(-Math.sin(GameParam.count/GameParam.SwimFrame)*0.2+0.05);
			var foot1 = findBone(obj,"J_Bip_L_LowerLeg");
			var foot2 = findBone(obj,"J_Bip_R_LowerLeg");
			foot1.rotation.x = (iw*foot1.rotation.x) + w*( Math.sin(GameParam.count/GameParam.SwimFrame)*0.2);
			foot2.rotation.x = (iw*foot2.rotation.x) + w*(-Math.sin(GameParam.count/GameParam.SwimFrame)*0.2);
			var foot1 = findBone(obj,"J_Bip_L_Foot");
			var foot2 = findBone(obj,"J_Bip_R_Foot");
			foot1.rotation.x = (iw*foot1.rotation.x) + w*(-0.8);
			foot2.rotation.x = (iw*foot2.rotation.x) + w*(-0.8);

			var sho1 = findBone(obj,"J_Bip_L_UpperArm");
			var sho2 = findBone(obj,"J_Bip_R_UpperArm");
			let r = Math.sin(GameParam.count/GameParam.SwimFrame);
			sho1.rotation.z = (iw*sho1.rotation.z) + w*(-1.2*r);
			sho2.rotation.z = (iw*sho2.rotation.z) + w*( 1.2*r);
			sho1.rotation.y = (iw*sho1.rotation.y) + w*(-0.8*r);
			sho2.rotation.y = (iw*sho2.rotation.y) + w*( 0.8*r);
			sho1.rotation.x = (iw*sho1.rotation.x) + w*(-0.3);
			sho2.rotation.x = (iw*sho2.rotation.x) + w*(-0.3);
		}
		
		//構えモーション
		//上半身だけ適用
		if(player.hold_weapon != 0) {
			const bust = [
				/*"root",              
				"J_Bip_C_Hips",      
				"J_Bip_C_Spine",     
				"J_Bip_C_Chest",     
				"J_Bip_C_UpperChest",
				"J_Bip_C_Neck",      
*/				"J_Bip_L_Shoulder",  
				"J_Bip_L_UpperArm",  
				"J_Bip_L_LowerArm",  
				"J_Bip_L_Hand",      
				"J_Bip_R_Shoulder",  
				"J_Bip_R_UpperArm",  
				"J_Bip_R_LowerArm",  
				"J_Bip_R_Hand",      
			];
			if(player.type == "tamami" || player.type == "tomoka") {
				morphSingleVRM(player, 1-jmp, 2, bust);
			}
			if(player.type == "ayame" || player.type == "emily") {
				morphSingleVRM(player, 1-jmp, 0, bust);
			}
		}
	}
	//敵・歩行
	if (player.type == "enemy00" ||
		player.type == "enemy01" ||
		player.type == "enemy04" ||
		player.type == "enemy10") {

//		var jmp = player.jump_count/10;
		let w = player.move_count/10;
		var stp = player.walk_count / 7;
		var r = (Math.sin(stp));
		if(player.sequence == SEQ_WALK) {
			player.walk_count ++;
		}
		
		//歩行モーション
		let foot1 = findBone(obj,"J_Bip_L_UpperLeg");
		let foot2 = findBone(obj,"J_Bip_R_UpperLeg");
		foot1.rotation.x += (r*-0.3) * w;// + jmp * 0.5;
		foot2.rotation.x += (r* 0.3) * w;// + jmp * 0.5;
	}
	//ボス・歩行
	if(player.name == "kumo") {
//		let w = player.move_count/10;
//		var stp = player.walk_count / 7;
//		var r = (Math.sin(stp));
		let r = player.walk_count / -10;
		if(player.sequence == SEQ_WALK) {
			if(player.walk_pow >= 0)
				player.walk_count ++;
			else
				player.walk_count --;
		}
		findBone(obj, "全ての親").rotation.y = Math.PI;

		for(let name of boss_ik) {
			let bone = findBone(obj, name);
			if(bone && bone.position) {
				bone.position.copy(boss_org_pos[name]);
				bone.position.add(new THREE.Vector3(0,Math.sin(r)*7.5,Math.cos(r)*7.5));
				r += 1;
			}
		}
		const boss_arm = ["右腕","左腕"];
		for(let name of boss_arm) {
			let bone = findBone(obj, name);
			if(bone && bone.rotation) {
				bone.rotation.x = Math.sin(r*2)*0.1;
				r += 1;
			}
		}
	}
	
	//NPCの動き
	if(player.npc) {
		if(player.name == "hotaru") {	//ほたる用ポーズ

			//立ち状態指定
			let w = Math.min(player.move_count/10, 1.0);
			morphAnimationVRM(player, 1-w, 9);
			
			//首の向き指定
			if(GameParam.GamePause == "") {	//通常時
				if(getPlayable().hitNPC) {
					player.look = getPlayable().name;
				}
				else {
					player.look = null;
				}
			}
		}
	}
	//首と上半身を指定のほうに向ける／戻す
	if(GameParam.BattleMode == 0 && player.name != "kumo") {
		let neck_rot = 0;
		let body_rot = 0;
		const neck = findBone(obj,"J_Bip_C_Neck");
		const body = findBone(obj,"J_Bip_C_Spine");
		const neck_org = old_body["J_Bip_C_Neck" ].y;
		const body_org = old_body["J_Bip_C_Spine"].y;
		if(player.look) {
			const target = get(player.look).mesh;
			let x = obj.position.x - target.position.x;
			let z = obj.position.z - target.position.z;
			let r1 = Math.atan2(-x,-z);
			let rot = 0;
			if(GameParam.GamePause == "") {	//NPC.相手の向きに依存
				let r2 = target.rotation.y;
				rot = Math.abs(r2-getNearRotation(r2, r1));
			}
			if(rot < Math.PI*0.33) {
				neck_rot = -getNearRotation(0, obj.rotation.y - r1 + Math.PI) * 0.5;
				if(neck_rot < -Math.PI*0.33) neck_rot = -Math.PI*0.33;
				if(neck_rot >  Math.PI*0.33) neck_rot =  Math.PI*0.33;

				body_rot = neck_rot * 0.5;
				if(body_rot < -Math.PI*0.33) body_rot = -Math.PI*0.33;
				if(body_rot >  Math.PI*0.33) body_rot =  Math.PI*0.33;
			}
		}
		const R = (GameParam.GamePause == "") ? 0.95 : 0.8;
		neck.rotation.y = neck_org * R + getNearRotation(neck_org, neck_rot) * (1-R);
		body.rotation.y = body_org * R + getNearRotation(body_org, body_rot) * (1-R);
	}

	//アニメーション処理
	if(player.sequence > 0 && player.sequence < SEQ_STEP && (player.anim_from >= 0 || player.anim_to >= 0)) {
		let f = 0;
		do {
			if(player.anim_from < 0) {
				//animStart（デフォルトからtoへ）
				morphAnimationVRM(player, player.anim_frame/player.max_frame, player.anim_to);
			}
			else if(player.anim_to < 0) {
				//animEnd
				morphAnimationVRM(player, 1-player.anim_frame/player.max_frame, player.anim_from);
			}
			else if(player.anim_from == player.anim_to) {
				//animStop
				morphAnimationVRM(player, 1.0, player.anim_from);
			}
			else /*if(player.anim_from < player.anim_to)*/ {
				//animStart
				morphAnimationVRM(player, 1.0, player.anim_from,player.anim_to, player.anim_frame, player.max_frame, player.nameraka, (player.anim_type == 1));
			}

			f += player.anim_rate
			player.anim_frame += player.anim_rate;
			if(player.anim_update_func != null) {
				player.anim_update_func();
			}
			if(player.anim_frame > player.max_frame) {
				player.anim_frame = player.max_frame;
				if(player.anim_end_func != null) {
					let func = player.anim_end_func;
					player.anim_end_func = null;
					func();
				}
				break;
			}
		}while(f < 1.0);
	}

	//武器を所持している＆表示する条件
	if(player.hold_weapon != 0 || player.sequence == SEQ_WEAPON|| player.sequence == SEQ_ATTACK) {
		if(player.weapon != null) {
			is_weapon = 1;
		}
	}
	switch(player.sequence) {
	case SEQ_WALK:	//walk
		player.flag &= ~FLAG_SLOW_DOWN
		
		if(GameParam.DpsCheck) {
			if(player.dps > 0) {
				if(GameParam.DpsCheck == 1 && player.playable || GameParam.DpsCheck == 2) {
					if(player.dpsTime > 0) {
						let dps1 = Math.round(player.dps  / player.dpsTime * 60);
						let dps2 = Math.round(player.dps2 / player.dpsTime * 60);
						console.log(player.name+":dps="+dps1+"/"+dps2+" total="+player.dps+"/"+player.dps2);
					}
					else {
						console.log(player.name+": total="+player.dps+"/"+player.dps2);
					}
				}
			}
			player.dps = 0;
			player.dps2 = 0;
			player.dpsTime = 0;
		}
		if(player.life <= 0) {	//ねんのため
			if(player.boss == 0)
				player.sequence = SEQ_DEAD;
			else
				player.sequence = SEQ_LOSE;
		}
		break;
	case SEQ_ATTACK:	//attack
		{
			if(player.attack_enable && player.attack_flag & ATTACK_RUSH) {
				FrontStep(player, 2 * (player.rush_pow/3));
			}
			player.dpsTime++;
		}
		break;
	case SEQ_STEP:
		//ステップ移動で回転する
		{
			const dir = obj.rotation.y;		//向き
			let rot = dir - getNearRotation(dir, player.step_dir);// 前転/バク転
			let cnt = player.step_count / StepFrame;
			let cnt2 = Math.sin(cnt * Math.PI) * 0.5;
			if(cnt >= 0.5) cnt2 = 0.5 + (0.5-cnt2);

			let hr = findBone(obj,player.root_bone).rotation;
			if(rot < -Math.PI*0.75 || rot > Math.PI*0.75) {	//前
				hr.x = -cnt2 * Math.PI * 2;
			}
			else if(rot < -Math.PI*0.25) {	//左
				hr.y = -cnt * Math.PI * 2;
			}
			else if(rot < Math.PI*0.25) {	//後ろ
				hr.x =  cnt2 * Math.PI * 2;
			}
			else {	//右
				hr.y =  cnt * Math.PI * 2;
			}
		}
		break;
	case SEQ_GUARD:
		if(--player.guard_count <= 0) {
			player.sequence = SEQ_WALK;
		}
		else {
//			if(player.muteki < 2) player.muteki = 2;

			let old = animation_data;
			setAnimationData("common");
			if(player.guard_count < 5)
				morphAnimationVRM(player, Math.sin(player.guard_count/5*Math.PI/2), 1);
			else
				morphAnimationVRM(player, 1, 1);
			animation_data = old;
		}
		break;
	case SEQ_DAMAGE:
		player.anim_from = -1;	//攻撃などのアクションをキャンセル
		player.anim_to = -1;
		player.anim_end_func = null;

		if(player.playable || player.boss == 1) {
			let old = animation_data;
			setAnimationData("common");
			morphAnimationVRM(player, Math.sin(player.damage_count/16*Math.PI/2), 2);
			animation_data = old;
		}
		else if(player.boss == 0) {
			morphAnimationVRM(player, Math.sin(player.damage_count/16*Math.PI/2), 49);
		}

		if(player.damage_count++>32) {
			player.sequence = 0;
		}
		break;
	case SEQ_DAMAGE_DOWN:
		{
		player.anim_from = -1;	//攻撃などのアクションをキャンセル
		player.anim_to = -1;
		player.anim_end_func = null;

		const cnt = player.damage_count;
		const S1 = 30;	//ダウン
		const S2 = 30;	//止め
		const S3 = 15;	//起き上がる
		let r;
		if(cnt < S1) {
			r = Math.sin(cnt/S1*Math.PI/2);
		}
		else if(cnt < S1+S2) {
			r = 1
		}
		else {
			r = Math.sin(((cnt-S1-S2)/S3+1)*Math.PI/2);
		}

		if(player.playable || player.boss == 1) {
			let old = animation_data;
			setAnimationData("common");
			//起き上がりのアニメ
			if(cnt < S1+S2-S3) {
				morphAnimationVRM(player, r, 2);
			}
			else if(cnt < S1+S2) {
				morphAnimationVRM(player, 1, 2, 4, cnt-(S1+S2-S3),S3, true,1);	//ダウン→起き上がり
			}
			else {
				morphAnimationVRM(player, r, 4);	//起き上がり→デフォルト
			}
			animation_data = old;
		}
		else if(player.boss == 0) {
			morphAnimationVRM(player, r, 49);
		}
		{
			const hip = findBone(obj,player.root_bone);
			hip.rotation.x *= 1-r;
			hip.rotation.x += r * Math.PI/2;
			hip.position.y *= 1-r;
			hip.position.y += r*0.1;
		}

		if(player.damage_count++>=S1+S2+S3) {
			player.sequence = 0;
		}
		player.muteki++;	//ダウン中は無敵
		}
		break;
	case SEQ_DEAD:
		{
		player.anim_from = -1;	//攻撃などのアクションをキャンセル
		player.anim_to = -1;
		player.anim_end_func = null;

		const frame = 40;
		let r = player.damage_count/frame;
		if(player.playable) {
			if(player.name.indexOf("_clone") >= 0) {	//クローン体がやられた
				sound.play("dron");
				effect.set("smoke", player.mesh.position, {player:player, color:0xffffff});
				setTimerEvent(
					null,
					10,
					null,
					function(){
						let i=0;
						for(let e of chara_info) {
							if(e == player) setChara(i, false);
							i++;
						}
					});
				player.sequence = SEQ_NONE;
				break;
			}
			else {
				let old = animation_data;
				setAnimationData("common");
				morphAnimationVRM(player, Math.sin(player.damage_count/(frame)*Math.PI/2), 3);
				animation_data = old;
			}
		}
		else {
			//倒れ込む
			morphAnimationVRM(player, Math.sin(player.damage_count/(frame)*Math.PI/2), 49);
			let hip = findBone(obj,player.root_bone);
			hip.rotation.x *= 1-r;
			hip.rotation.x += r * Math.PI/2;
			hip.position.y *= 1-r;
			hip.position.y += r*0.1;
		}

		/*if(player.damage_count%10 < 5) {
			player.visible = false;
		}
		else {
			player.visible = true;
		}*/
		if(player.damage_count++>frame) {
			player.physicsBody.sleep();
			player.lost = 0;
			player.target = -1;
			
			player.sequence = SEQ_DEAD_END;
			if(player.playable) {
				//倒れるだけなのでそのまま
			}
			else {
				//消える
				setChara(player.name,false);
			}
		}
		}
		break;
	case SEQ_LOSE:
	case SEQ_BREAK:	//ボス用BREAK
		player.anim_from = -1;	//攻撃などのアクションをキャンセル
		player.anim_to = -1;
		player.anim_end_func = null;

		const max_frame = 90;
		player.swim_count++;
		let rate = (player.armor_break < 10) ? (player.armor_break/10): 1.0;
		let old = animation_data;
		if(player.boss == 1) {
			setAnimationData("common");
		}
		if(player.sequence == SEQ_LOSE) {
			rate = Math.min(1.0, player.swim_count/15);
		}
		player.physicsBody.velocity.set(0,0,0);
		morphAnimationVRM(player, rate, 47,49, player.swim_count%max_frame, max_frame, true);
		animation_data = old;

		if(player.armor_break <= 0) {
			player.swim_count = 0;
			actionReset(player);	//復帰
		}
		break;
	case SEQ_STUN:
		if(--player.stun <= 0) {
			player.sequence = SEQ_WALK;	//解除
			break;
		}
	case SEQ_HOLD:
		if(player.playable || player.boss == 1) {
			let old = animation_data;
			setAnimationData("common");
			morphAnimationVRM(player, 1.0, 5,7, (player.count++)%20,20, true);
			animation_data = old;
		}
		break;
	//イベント用
	case SEQ_EVENT_TALK:
		{
			let vrm = GameParam.getVRM(player.mesh.name);
			if(vrm != null) {
				//口ぱくアニメ
//				let r = (Math.sin(player.count%26/26*Math.PI)+1) / 2.0;
				let a = player.count % 20;
				if(a == 0) {
					const mouth = ["a","i","u","e","o"];
					player.talk = mouth[Math.floor(Math.random()*5)];
				}
				if(a >= 10) a = 20 - a;
				let r = a/20;
				if(player.count >= 0) {
					vrm.blendShapeProxy.setValue(player.talk, r);
				}
				player.count++;
			}
		}
		break;
	}
	//小ダメージ
	if(!player.playable && !player.boss && player.mini_damage > 0 && (player.sequence != SEQ_DAMAGE || player.sequence != SEQ_DAMAGE_DOWN)) {
		morphAnimationVRM(player, Math.sin(player.mini_damage/10*Math.PI) * 0.2, 49);
		if(++player.mini_damage >= 10) {
			player.mini_damage = 0;
		}
	}

	//指
	if(player.name != "kumo"){
		let obj = player.mesh;
		const yubi2 = [
			0.3,0.2,0.1,0.0,
		];
		for(var i=0;i<yubi_list.length;i++) {
			let body = findBone(obj,yubi_list[i]);	//指
			let yubi_y = 0;
			let yubi_opn = (is_weapon) ? 0.7 : 0.9;		//武器持ち手

			let ninja = 0;
			if(player.type == "ayame" && GameParam.BattleMode == 0) {	//忍者走り
				const w = Math.min(1, player.move_count/10);
//				yubi_opn *= 1.0-w;
				if(w > 0) ninja = 1;
			}

			if(player.is_swim || player.name == "hotaru" || ninja) {
				//泳ぎ中/指をそろえる
				if(i%4 == 0) {
					yubi_y = -1.2*yubi2[3-Math.floor(i/4)%4];
				}
				if(i<yubi_list.length/2) {
					body.rotation.set(0, yubi_y, Math.PI/2*0.0);
				}else{
					body.rotation.set(0,-yubi_y,-Math.PI/2*0.0);
				}
			}
			else if(i<yubi_list.length/2) {
				body.rotation.set(0, yubi_y, Math.PI/2*yubi_opn);
			}else{
				body.rotation.set(0,-yubi_y,-Math.PI/2*yubi_opn);
			}
		}
		//親指
		findBone(obj,"J_Bip_R_Thumb1").rotation.set(-12/10,-3/10,5/10);
		findBone(obj,"J_Bip_L_Thumb1").rotation.set(-12/10,3/10,-5/10);

		if(is_weapon) {	//武器持ち手親指
			findBone(obj,"J_Bip_R_Thumb1").rotation.set(-4/10,  5/10,0/10);
			findBone(obj,"J_Bip_R_Thumb2").rotation.set( 3/10,-14/10,0/10);

			findBone(obj,"J_Bip_L_Thumb1").rotation.set(-4/10, -5/10,0/10);
			findBone(obj,"J_Bip_L_Thumb2").rotation.set( 3/10, 14/10,0/10);
		}
	}

	//戦闘キャラ用
	if(!player.npc) {
		if (player.weapon_offset > 0 && player.weapon_offset < 15) {
			player.weapon_offset++;
		}
		
		player.attackBody.collisionFilterGroup = 0;
		if(!player.weapon) {
			//武器がない場合
			//手とか足に当たり判定をつける
			if(player.atari_bone && player.attack_enable) {
				obj.updateMatrixWorld(true);
				let body = findBone(obj,player.atari_bone);
				let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
				mat0.multiplyMatrices(mat0, body.matrixWorld);
				if(player.boss == 2) {
					mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(debugPos.x,debugPos.y-8,debugPos.z));
					mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationFromEuler(new THREE.Euler( 1.8+debugRot.x,debugRot.y,debugRot.z, 'XYZ' )));
				}

				let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);
				let eul = (new THREE.Euler()).setFromRotationMatrix(mat0,"XYZ");
				
				player.attackBody.position.set(pos.x, pos.y, pos.z);
				player.attackBody.quaternion.setFromEuler(eul.x, eul.y, eul.z, "XYZ");
				player.attackBody.collisionFilterGroup = player.attackBody.collisionFilterMask;
			}
		}
		else {
			//武器がある
			//武器モデルの位置調整＆当たり判定
			let weapon_obj = player.weapon;
			if(weapon_obj != null) {
				if(is_weapon != 0) {
					obj.updateMatrixWorld(false);
					var hand = findBone(obj,"J_Bip_R_Hand");
					var mat0;
					mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
					mat0.multiplyMatrices(mat0, hand.matrixWorld);

					if(weapon_obj.name == "blade") {
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(-Math.PI/2));
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation((0.6)/31,(-0.4)/31,(-6)/31));
					}
					if(weapon_obj.name == "cane") {
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(-Math.PI/2));
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation((1.8)/31,(-13-12*player.weapon_offset/15)/31,(-1)/31));
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(-Math.PI/2*player.weapon_offset/15));
					}
					if(weapon_obj.name == "club") {
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationX(Math.PI));
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0.075,0.03,0.1));
						mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeScale(0.7,0.7,0.7));
					}
					mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeScale(0.1,0.1,0.1));

					weapon_obj.matrix = mat0;
					weapon_obj.matrixAutoUpdate = false;
					if(player.playable) weapon_obj.visible = true;
					weapon_obj.castShadow = true;
		//			effect.setBlade(hand.matrixWorld);

					if(player.attack_enable) {
						let le = (player.playable) ? 18 : 18;
						mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
						mat0.multiplyMatrices(mat0, hand.matrixWorld);
						mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(-Math.PI/2));
						mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation((0.6)/31,(-0.4)/31,(-le)/31));

						let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);
						let eul = (new THREE.Euler()).setFromRotationMatrix(mat0,"XYZ");
						player.attackBody.position.set(pos.x, pos.y, pos.z);
						player.attackBody.quaternion.setFromEuler(eul.x, eul.y, eul.z, "XYZ");
						player.attackBody.collisionFilterGroup = player.attackBody.collisionFilterMask;
					}
					else {
					}
				}
				else {
					weapon_obj.visible = false;
				}
			}
		}

		//羽根
		if(player.sub_type == "wing") {
			let wing_obj = player.sub_obj;
			if(wing_obj != null) {
				player.mesh.updateMatrixWorld(false);
				let bust = findBone(player.mesh,"J_Bip_C_UpperChest");
				let mat0;
				mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
				mat0.multiplyMatrices(mat0, bust.matrixWorld);

				mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationY(Math.PI));
				mat0 = mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation(0,-1,-0.04));

				mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeScale(0.08,0.08,0.08));

				wing_obj.matrix = mat0;
				wing_obj.matrixAutoUpdate = false;
//				wing_obj.visible = true;
				
				let cnt = Math.sin(GameParam.count/10)-0.4;
				findBone(wing_obj,"左羽位置角度調整").rotation.y = cnt/2;
				findBone(wing_obj,"左羽03").rotation.y = cnt;
				findBone(wing_obj,"右羽位置角度調整").rotation.y = -cnt/2;
				findBone(wing_obj,"右羽03").rotation.y = -cnt;
			}
		}

		if(player.attack_enable) {
			if(player.name.indexOf("enemy") >= 0 && player.weapon == null) {
				let matw = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
				let mat1 = (new THREE.Matrix4()).copy(findBone(obj,"J_Bip_R_Hand").matrixWorld);
				let mat2 = (new THREE.Matrix4()).copy(findBone(obj,"J_Bip_L_Hand").matrixWorld);
				mat1.multiplyMatrices(matw, mat1);
				mat2.multiplyMatrices(matw, mat2);
				let pos1 = (new THREE.Vector3()).setFromMatrixPosition(mat1);
				let pos2 = (new THREE.Vector3()).setFromMatrixPosition(mat2);
				pos1.add(pos2);
				pos1.multiplyScalar(0.5);
				player.attackBody.position.set(pos1.x, pos1.y, pos1.z);
			}
		}
		else {
	//		player.attackBody.position.set(0,100,0);
		}
		player.attackBody.velocity.set(0,0,0);
		player.attackBody.angularVelocity.set(0,0,0);
		player.attackBody.force.set(0,0,0);
		player.damageBody.velocity.set(0,0,0);
		player.damageBody.angularVelocity.set(0,0,0);
		player.damageBody.force.set(0,0,0);
		player.damageBody.quaternion.setFromEuler(0,0,0,"XYZ");
	}
	//丸影の反映
	if(player.marukage) {
		player.marukage.visible = false;
		if(player.visible && player.enable && !player.is_swim) {

			let position = player.physicsBody.position;
			var from = new CANNON.Vec3(position.x, position.y, position.z);
			var to   = new CANNON.Vec3(position.x, 0, position.z);
			var result = new CANNON.RaycastResult();
			var option_ground = {	//地面にだけ反応する
				collisionFilterMask :1,
				collisionFilterGroup:1,
				skipBackfaces:true,
			};
			if(physics.world.raycastClosest(from, to, option_ground, result)) {
				player.marukage.visible = true;
				player.marukage.position.copy(player.mesh.position);
				player.marukage.position.y -= result.distance - 0.35;
				player.marukage.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),result.hitNormalWorld);	//地面の傾きに合わせる
			}
		}
		else {
		}
	}

}	//updatePersonal

//戦闘突入
function BattleStart() {
	let player = getPlayable();
	let list = [];
	let j = 0;
//	let ftk_time = 0;
	function firstAttack(player) {
		//抜刀
		const first_atk = GameParam.user.getSkill(player.type,21);
		if(first_atk > 0) {
			Attack(player, 8);
//			ftk_time += 90;
		}
	}

	sound.play("battle_battou");
	for(let i=0;i<3;i++) {
		let p = chara_info[i];
		if(p.playable && !p.npc) {
//			if(GameParam.user.status.friend_call && i != GameParam.user.status.select_chara) {
			if(GameParam.Party3Mode != 0 && i != GameParam.user.status.select_chara) {
				const r = player.mesh.rotation.y + ((j == 0) ? Math.PI/2 : -Math.PI/2);
				let x = player.mesh.position.x + Math.sin(r);
				let z = player.mesh.position.z + Math.cos(r);
				let y = GameParam.stage.getHeightf(x,z) + player.height;
				setChara(i, true, x,y,z);
				setArrive(i);
				p.friend = true;
				list.push(i);
				j++;
			}
			//構え
			if(p.enable /*&& p.hold_weapon == 0*/) {
				p.sequence = SEQ_WEAPON;
				if(p.name == "tamami") {
					animStart(p, -1,0, 5, true, function() {
						animStart(p, 0,2, 25, true, function() {
							p.sequence = SEQ_WALK;
							p.hold_weapon = 1;
							firstAttack(p);
						});
					});
				}
				else {	//ayame,karin
					animStart(p, -1,0, 30, true, function() {
						p.sequence = SEQ_WALK;
						p.hold_weapon = 1;
						firstAttack(p);
					});
				}
			}
		}
	}
	GameParam.user.status.combo_hit = 0;
	GameParam.user.status.combo_time = 0;

	setTimerEvent(null,20,null,function(){
		let target = getBunshinTarget(player.mesh.position);
		if(target.length > 0) {
			let j = 0;
			for(let i of list) {
				chara_info[i].target = target[j].index;
				j = (j + 1) % target.length;
			}
		}
	});
}
function BattleEnd() {
	clearAttackObject();
	clearTimerEvent();
	for(let i=0;i<chara_info.length;i++) {
		let p = chara_info[i];
		if(p.playable) {
			//死んでたら復帰
			if(p.life <= 0) {
				p.life = Math.floor(p.life_max * RECOVER_LIFE);
				p.lost = 0;
				p.hold_weapon = 0;
				GameParam.updateLife(p.name, false);

				if(p != getPlayable() && !GameParam.Party3Mode) {
					if(p.name.indexOf("_clone") < 0) {
						setChara(i, false);
					}
				}
				continue;
			}
			if(p.charge_count > 0) {	//溜めは解除
				p.sequence = 0;
			}
			
			//構え解除
			setTimerEvent(null,60*10,
				function(){
					return (p.sequence == SEQ_WALK);	//通常に戻るまで待つ（攻撃中断できないため）
				},
				function(){
					p.sequence = SEQ_WEAPON;
					if(p.name == "tamami") {
						animStart(p, 2,0, 25, true, function() {
							animEnd(p, 5, function() {
								p.sequence = SEQ_WALK;
								p.hold_weapon = 0;
								if(p != getPlayable() && !GameParam.Party3Mode)
									setChara(i, false);
								else
									actionReset(p);
							});
						});
					}
					else if(p.name == "ayame") {
						animStart(p, 0,-1, 25, true, function() {
							p.sequence = SEQ_WALK;
							p.hold_weapon = 0;
							if(p != getPlayable() && !GameParam.Party3Mode)
								setChara(i, false);
							else
								actionReset(p);
						});
					}
					else if(p.name.indexOf("clone") >= 0) {
						effect.set("smoke", p.mesh.position, {player:p, color:0xffffff});
						sound.play("dron");
						setTimerEvent(
							null,
							10,
							null,
							function(){
								setChara(i, false);
							});
					}
					else {	//karin
//						animEnd(p, 20, function() {
							p.sequence = SEQ_WALK;
							p.hold_weapon = 0;
							if(p != getPlayable() && !GameParam.Party3Mode)
								setChara(i, false);
							else
								actionReset(p);
//						});
					}
				});
		}
	}
}
//被ダメージ・切り替え時などに呼ぶ
function actionReset(player) {
	if(player.life <= 0) {
	}
	else {
		player.sequence = 0;
	}
	player.attack_enable = false;
	player.flag = 0;
	player.attack_flag = 0;
	player.anim_from  = -1;
	player.anim_to = -1;
	player.weapon_offset = 0;
	player.charge_count = 0;
	player.anim_update_func = null;
	player.anim_end_func = null;
	player.anim_rate = 1;

	player.step2_vec.set(0,0,0);
	player.step2_count = 0;
	clearTimerEvent(player.name);
	if(player.name == "tamami") effect.clearBlade(0, -1);
	if(player.name == "tomoka") effect.clearBlade(1, -1);
	
	
}
//全員／非戦闘時など
function actionResetAll() {
	for(let p of chara_info) {
		actionReset(p);
		p.jump_count = 0;
		p.walk_pow = 0;
	}
}

//当たり判定と挙動を持った攻撃オブジェクト
function createAttackObject(name, pos, playable, option) {
	let obj = null;
	for(let obj2 of atkobj) {
		if(obj2.enable) continue;
		if(obj2.name == name && obj2.playable == playable) {
			obj = obj2;
			break;
		}
	}
	if(obj == null) {	//新規割り当て
		let mesh,body;
		let mat = new CANNON.Material("atkobj-"+name);
		const enemy_mask  = (!playable) ? 16 : 8;
		let debug_obj = null;
		switch(name) {
		case "fire":
			{
				let tex = GameParam.getTexture("fire").clone();
				tex.needsUpdate = true;
				mesh = new THREE.Sprite( new THREE.SpriteMaterial( { color:0xffffff , map: tex , transparent: true, blending:THREE.AdditiveBlending } ) );
				mesh.scale.set(2.5, 2.5, 2.5);
				body = physics.createBody( new CANNON.Sphere(GameParam.AtariSize*2), 0/*mass*/, mat, enemy_mask/*group*/, enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					if(name2 == "damage") {
						DamageHit(contact.bj, /*contact.bi*/option.player.attackBody, true, name);	//当たったのは別のbodyだが、ダメージ判定がしやすいよう発動者のattackBodyにすり替え
					}
					else if(name1 == "damage") {	//動的なので逆？
						DamageHit(contact.bi, option.player.attackBody, true, name);
					}
					/*if(name2.indexOf("itembox-") >= 0) {
						GameParam.OpenItemBox(name2);
					}*/
				});
			}
			break;
			
		case "shuriken":
			{
				mesh = new THREE.Object3D();
				//手裏剣の本体
				//children[0]
				mesh.add( new THREE.Mesh(
					new THREE.PlaneGeometry(0.5,0.5).rotateX(-Math.PI/2),
					new THREE.MeshBasicMaterial( { color:0xffffff , map: GameParam.getTexture("shuriken") , transparent: true, side: THREE.DoubleSide, alphaTest: 0.3 } ) )
				);
				//軌道線
				//children[1]
				mesh.add( new THREE.Mesh(
//					new THREE.PlaneGeometry(0.15,3).translate(0,-2.5,0).rotateX(-Math.PI/2),
					new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2).translate(0,0,0.5),
					new THREE.MeshBasicMaterial( { color:0xffffff , map: GameParam.getTexture("whitefade"), transparent: true, side: THREE.DoubleSide } ) )
				);
				body = physics.createBody( new CANNON.Sphere(0.1), 1/*mass*/, mat, 1|enemy_mask/*group*/, 1|enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					if(!obj.die) {
						let hit = false;
						if(name2 == "damage") {
							hit = DamageHit(contact.bj, /*contact.bi*/option.player.attackBody, true, name);	//当たったのは別のbodyだが、ダメージ判定がしやすいよう発動者のattackBodyにすり替え
						}
						else if(name1 == "damage") {	//動的なので逆？
							hit = DamageHit(contact.bi, option.player.attackBody, true, name);
						}
						else if(name1 == "field" || name2 == "field") {
							hit = true;
						}
						if(hit) {
							//刺さる
							sound.play("shuriken2");
							obj.move.set(0,0,0);
							obj.mesh.children[1].visible = false;	//軌道
							obj.count = 80-8;
							obj.body.sleep();
						}
					}
					/*if(name2.indexOf("itembox-") >= 0) {
						GameParam.OpenItemBox(name2);
					}*/
				});
				/*GameParam.world_view.add(
					debug_obj = Utility().shape2mesh({
						body: body,
						color: 0x808080,
					})
				);*/
			}
			break;

		case "thunder":
			{
				let tex = GameParam.getTexture("thunder").clone();
				tex.needsUpdate = true;
				mesh = new THREE.Sprite( new THREE.SpriteMaterial( { color:0xffffff , map: tex , transparent: true, blending:THREE.AdditiveBlending } ) );
				mesh.scale.set(3,3,3);
				body = physics.createBody( new CANNON.Sphere(GameParam.AtariSize*2), 0/*mass*/, mat, enemy_mask/*group*/, enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					if(name2 == "damage") {
						DamageHit(contact.bj, /*contact.bi*/option.player.attackBody, true, name);	//当たったのは別のbodyだが、ダメージ判定がしやすいよう発動者のattackBodyにすり替え
					}
					else if(name1 == "damage") {	//動的なので逆？
						DamageHit(contact.bi, option.player.attackBody, true, name);
					}
					/*if(name2.indexOf("itembox-") >= 0) {
						GameParam.OpenItemBox(name2);
					}*/
				});
			}
			break;
			
		case "beam":
			{
				mesh = cloneAnimated(GameParam.getMesh("beam"));
//				mesh = GameParam.getMesh("beam");
				let alpha = 1.0;
				for(let mat of mesh.material) {
					mat.transparent = true;
					mat.blending = THREE.AdditiveBlending;
					mat.side = THREE.FrontSide;
					mat.opacity = alpha;
					alpha /= 2;
				}
				mesh.material[3].side = THREE.DoubleSide;
				mesh.material[3].opacity = 1.0;
//				mesh.rotation.x = Math.PI/2;

				//動きながらでも当たりやすいように長く
				body = physics.createBody( new CANNON.Box(new CANNON.Vec3(0.75,50/2,1.5)), 0/*mass*/, mat, enemy_mask/*group*/, enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					let hit = false;
					if(name2 == "damage") {
						hit = DamageHit(contact.bj, /*contact.bi*/option.player.attackBody, true, name);	//当たったのは別のbodyだが、ダメージ判定がしやすいよう発動者のattackBodyにすり替え
					}
					else if(name1 == "damage") {	//動的なので逆？
						hit = DamageHit(contact.bi, option.player.attackBody, true, name);
					}
				});
				/*GameParam.world_view.add(
					debug_obj = Utility().shape2mesh({
						body: body,
						color: 0x808080,
					})
				);
				debug_obj.children[0].material.transparent = true;
				debug_obj.children[0].material.opacity = 0.3;*/
			}
			break;

		case "bomb":
			{
				const size = 0.2;
				let geometry = new THREE.SphereGeometry(size, 8, 8);
				mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0x404040}));
				mesh.castShadow = true;

				//投げるだけなので敵と地面に当たるがダメージなし
//				body = physics.createBody( new CANNON.Sphere(size), 1/*mass*/, mat, 1|enemy_mask/*group*/, 1|enemy_mask/*mask*/ );
				body = physics.createBody( new CANNON.Sphere(size), 1/*mass*/, mat, 1|32/*group*/, 1|32/*mask*/ );	//DamageBodyに反応

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					if((name1 == "field" || name2 == "field" || name1 == "damage" || name2 == "damage") && !obj.die) {
						if(obj.parent.damageBody == contact.bi || obj.parent.damageBody == contact.bj) {
							//投げた本人
						}
						else {
							//爆発
							sound.play("bomb_explosion");
							let pos = new THREE.Vector3(body.position.x,0,body.position.z);
							pos.y = GameParam.stage.getHeightf(pos.x,pos.z) + 3;
							createAttackObject("explosion", pos, playable, option);
							obj.die = true;
						}
					}
				});
			}
			break;

		case "stone":
			{
				mesh = cloneAnimated( GameParam.getMesh("stone") );
//				mesh.scale.set(0.04,0.04,0.04);
				mesh.castShadow = true;

				//投げるだけなので敵と地面に当たるがダメージなし
				body = physics.createBody( new CANNON.Sphere(0.3), 1/*mass*/, mat, 1|enemy_mask/*group*/, 1|enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					let hit = false;
					if(obj.parent.damageBody == contact.bi || obj.parent.damageBody == contact.bj) {
						//投げた本人
					}
					else if(name2 == "damage") {
						obj.die = DamageHit(contact.bj, /*contact.bi*/option.player.attackBody, true, name);	//当たったのは別のbodyだが、ダメージ判定がしやすいよう発動者のattackBodyにすり替え
					}
					else if(name1 == "damage") {	//動的なので逆？
						obj.die = DamageHit(contact.bi, option.player.attackBody, true, name);
					}
				});
			}
			break;

		case "explosion":
			{
				let tex = GameParam.getTexture("explosion").clone();
				tex.needsUpdate = true;
				mesh = new THREE.Sprite( new THREE.SpriteMaterial( { color:0xffffff , map: tex , transparent: true, blending:THREE.AdditiveBlending } ) );
				mesh.scale.set(6,6,6);
				body = physics.createBody( new CANNON.Sphere(playable ? 7 : 2), 0/*mass*/, mat, enemy_mask/*group*/, enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					if(name2 == "damage") {
						DamageHit(contact.bj, /*contact.bi*/option.player.attackBody, true, name);	//当たったのは別のbodyだが、ダメージ判定がしやすいよう発動者のattackBodyにすり替え
					}
					else if(name1 == "damage") {	//動的なので逆？
						DamageHit(contact.bi, option.player.attackBody, true, name);
					}
				});
			}
			break;
			
		case "shield":
			{
				let geometry = new THREE.IcosahedronGeometry(1,1);
				let lineMat = new LineMaterial( { color:0x00ffff , linewidth:3, blending: THREE.AdditiveBlending, transparent:true, opacity:0.5 } );
				lineMat.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport
				mesh = new Wireframe( new WireframeGeometry2( geometry ),lineMat );

				const mask = 4;	//敵だけに当たる
				body = physics.createBody( new CANNON.Sphere(1), 5/*mass*/, mat, mask/*group*/, mask/*mask*/ );
			}
			break;

		case "web":
			{
				mesh = GameParam.getMesh("web");
				mesh.scale.set(0.04,0.04,0.04);
				mesh.castShadow = true;

				body = physics.createBody( new CANNON.Sphere(0.5), 0/*mass*/, mat, enemy_mask/*group*/, enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					if(obj.parent.capture == null) {
						//捕獲前
						let p = null;
						if(name2 == "damage") {
							p = getCharaFromDamageBody(contact.bj);
						}
						else if(name1 == "damage") {	//動的なので逆？
							p = getCharaFromDamageBody(contact.bi);
						}
						//捕獲成功か
						if(p != null && p.playable) {
							sound.play("hit_thunder");
							obj.parent.capture = p;
							obj.move.set(0,0,0);
							p.sequence = SEQ_HOLD;
							const enemy_mask2  = (playable) ? 16 : 8;
							obj.body.collisionFilterGroup = enemy_mask2;	//攻撃対象になる
						}
					}
					else {
						//捕獲後
						let hit = false;
						if(name2 == "attack") {
							hit = true;
						}
						else if(name1 == "damage") {	//動的なので逆？
							hit = true;
						}
						//破壊
						if(hit != null) {
							if(option.player.capture.sequence == SEQ_HOLD)
								option.player.capture.sequence = SEQ_WALK;
						}
					}
				});
			}
			break;
		case "ice":
			{
				mesh = cloneAnimated( GameParam.getMesh("ice") );
//				mesh = new THREE.Mesh( new THREE.SphereGeometry(0.3), new THREE.MeshBasicMaterial() );
				mesh.castShadow = true;
				mesh.scale.set(0.015,0.015,0.015);

				body = physics.createBody( new CANNON.Sphere(0.2), 0/*mass*/, mat, enemy_mask/*group*/, enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					let hit = false;
					if(name2 == "damage") {
						hit = DamageHit(contact.bj, /*contact.bi*/option.player.attackBody, true, "ice");	//当たったのは別のbodyだが、ダメージ判定がしやすいよう発動者のattackBodyにすり替え
					}
					else if(name1 == "damage") {	//動的なので逆？
						hit = DamageHit(contact.bi, option.player.attackBody, true, "ice");
					}
					if(hit) {
//						obj.move.set(0,0,0);
						obj.count = 200-10;
//						obj.die = true;
						obj.body.collisionFilterGroup = 0;	//当たり無効
					}
				});
			}
			break;
		case "ofuda":
			{
				const size = 0.2;
				let geometry = new THREE.PlaneGeometry(size, size*2);
				mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0xffffff, map:GameParam.getTexture("ofuda"), transparent:true, side:THREE.DoubleSide}));
				mesh.castShadow = true;

				body = physics.createBody( new CANNON.Sphere(0.5), 0/*mass*/, mat, enemy_mask/*group*/, enemy_mask/*mask*/ );

				body.addEventListener("collide", function(e) {
					var contact = e.contact;
					var name1 = contact.bi.material.name;
					var name2 = contact.bj.material.name;
					let dmgBody = null
					if(name2 == "damage") {
						dmgBody = contact.bj;
					}
					else if(name1 == "damage") {	//動的なので逆？
						dmgBody = contact.bi;
					}
					if(dmgBody) {
						let damage_player = getCharaFromDamageBody(dmgBody);
						if(damage_player != null && damage_player.playable != obj.playable) {
							obj.die = true;
							let pos = damage_player.mesh.position.clone();
							pos.y = GameParam.stage.getHeightf(pos.x, pos.z) + damage_player.height + 0.5;
							effect.set("quake", pos, {player:damage_player});	//
							damage_player.physicsBody.velocity.y = 1*(3/GameParam.physics_speed);
							sound.play("spell_ground");
							for(let i=0;i<5;i++) {
								setTimerEvent(obj.player, 5+8*i,null,function() {
									let af = obj.parent.attack_flag;
									if(i==0) obj.parent.attack_flag |= ATTACK_STRONG|ATTACK_UPPER;
									DamageHit(dmgBody, obj.parent.attackBody, true, "quake");
									obj.parent.attack_flag = af;
								});
							}
						}
					}
				});
			}
			break;
		}
		obj = {
			enable : true,
			name : name,
			mesh : mesh,
			body : body,
			playable : playable,
			count : 0,
			position : new THREE.Vector3(),
			//offset : 0,	//生成オフセット
			move : new THREE.Vector3(),
			debug_obj : debug_obj,
			die : false,
			parent : null,
			moveFlag : 0,
			param : null,
		};
		atkobj.push(obj);
		mesh.renderOrder += GameParam.AlphaOrder;
		for(let c of mesh.children) {
			c.renderOrder += GameParam.AlphaOrder;
		}
		GameParam.world_view.add(mesh);
	}
	obj.mesh.visible = false;
	obj.enable = true;
	obj.body.position.set(pos.x, pos.y, pos.z);
	obj.body.velocity.set(0,0,0);
	obj.body.wakeUp();
	obj.body.collisionFilterGroup = obj.body.collisionFilterMask;
	obj.count = 0;
	obj.move.set(0,0,0);
	obj.die = false;
	obj.moveFlag = 0;
	switch(name) {
	case "shuriken":
		obj.body.quaternion.setFromEuler(option.rx, option.ry, option.rz*0, "YXZ");
		obj.mesh.children[1].visible = false;	//軌道
		obj.mesh.children[1].renderOrder += 1;
		//obj.mesh.children[1].rotation.set(0, option.ry, option.rz*0, "XYZ");
		obj.mesh.children[0].rotation.set(0, option.ry, option.rz*1, "XYZ");
		//obj.debug_obj.rotation.set(option.rx, option.ry, option.rz, "YXZ");
		obj.mesh.children[0].castShadow = true;
		obj.moveFlag = 1;
		obj.parent = option.player;
		break;
	case "web":
	case "fire":
	case "ofuda":
		obj.mesh.rotation.set(0,option.rotation + Math.PI,0);
//		break;
	case "beam":
	case "explosion":
	case "shield":
	case "thunder":
	case "bomb":
	case "stone":
		obj.parent = option.player;
		break;
	case "ice":
		obj.param = {index:option.index, target:option.target};
		obj.parent = option.player;
		obj.body.collisionFilterGroup = 0;	//最初は当たりなし
		break;
	default:
		break;
	}
	physics.world.addBody( obj.body );
	return obj;
}

function clearAttackObject() {
	for(let obj of atkobj) {
		if(obj.enable) {
			physics.world.removeBody( obj.body );
		}
		GameParam.world_view.remove( obj.mesh );
	}
	atkobj = new Array();
}
function updateAttackObject() {
	for(let obj of atkobj) {
		if(!obj.enable) continue;
		let skip = false;

		switch(obj.name) {
		case "fire":
			/*if(obj.offset > 0) {
				if(--obj.offset == 0) {
					//活性化
					physics.world.addBody( obj.body );
					obj.count = 0;
				}
				continue;
			}
			else*/ {
				const max = 60;
//				let tex = obj.mesh.children[0].material.map;
				let tex = obj.mesh.material.map;
				const j = Math.floor(obj.count*20/max);		//20枚
				let u =   Math.floor(j%4);
				let v = 4-Math.floor(j/4);
				tex.offset.set(1/4*u, 1/5*v);
				tex.repeat.set(1/4, 1/5);
				obj.mesh.material.rotation = Math.PI/4;
				tex.wrapT = THREE.ClampToEdgeWrapping;
				if(obj.count >= max) {
					obj.enable = false;
					obj.mesh.visible = false;
					physics.world.removeBody( obj.body );
					continue;
				}
			}
			break;
		case "shuriken":
			if(!obj.die && obj.count < 80-8) {
				//obj.debug_obj.position.set(obj.body.position.x, obj.body.position.y, obj.body.position.z);
//				obj.mesh.children[0].rotation.y += 0.5;
				//敵のほうに誘導
				let vec = new THREE.Vector3();
				let near_rot = 10;
				for(let enemy of chara_info) {
					if(enemy.playable == obj.parent.playable || !enemy.enable || enemy.life <= 0 || enemy.npc) continue;
					let x = obj.body.position.x - enemy.mesh.position.x;
					let y = obj.body.position.y -(enemy.mesh.position.y + 0.7);
					let z = obj.body.position.z - enemy.mesh.position.z;
					let r1 = Math.atan2(-x,-z);
					let r2 = Math.atan2(obj.move.x, obj.move.z);
					let rot = Math.abs(r2-getNearRotation(r2, r1));
					if(rot < Math.PI/2 && rot < near_rot) {	//最も角度の小さい
						near_rot = rot;
						vec.set(-x,-y,-z);
					}
				}
				if(near_rot < 10) {
					let R = 1;	//誘導率（0に近いほど強い）

					if(obj.parent.playable) {
						const auto_dir = GameParam.user.getSkill(obj.parent.type,13);
						if(auto_dir != 0) {	//風見鶏
							R = 1 - (auto_dir/3);
						}
					}
					const speed = 0.8;
					obj.move.y = vec.y / vec.length() * speed;
					vec.y = 0;
					vec.normalize();
					vec.x *= (1-R);
					vec.z *= (1-R);
					vec.multiplyScalar(speed);

					obj.move.x = obj.move.x * R + vec.x;
					obj.move.z = obj.move.z * R + vec.z;
				}
				vec.copy(obj.body.position);
				vec.sub(obj.parent.mesh.position);
				let len = Math.min(3, vec.length()-0.4);

				let matrix = (new THREE.Matrix4()).lookAt(new THREE.Vector3(), obj.move, new THREE.Vector3(0,-1,0));
				matrix.multiplyMatrices(matrix, (new THREE.Matrix4()).makeScale(0.15,1,len));
				obj.mesh.children[1].matrix = matrix;
				obj.mesh.children[1].matrixAutoUpdate = false;
				obj.mesh.children[1].visible = true;
			}

			if(obj.count > 60 /*|| obj.die*/) {
				obj.enable = false;
				obj.mesh.visible = false;
				physics.world.removeBody( obj.body );
				continue;
			}
			break;
		case "thunder":
			{
				const max = 90;
				let tex = obj.mesh.material.map;
				const j = Math.floor(obj.count*42/max);		//6x7=42枚
				let u =   Math.floor(j%6);
				let v = 6-Math.floor(j/6);
				tex.offset.set(1/6*u, 1/7*v);
				tex.repeat.set(1/6, 1/7);
				obj.mesh.material.rotation = Math.PI/2 + Math.PI/6;
				tex.wrapT = THREE.ClampToEdgeWrapping;
				if(obj.count >= max) {
					obj.enable = false;
					obj.mesh.visible = false;
					physics.world.removeBody( obj.body );
					continue;
				}
			}
			break;
		case "beam":
			{
				const max = 210;
				let size = 1;
				if(obj.count < 60) {
					size = Math.sin(obj.count/60*Math.PI/2);
				}
				else if(obj.count > max-60) {
					size = Math.sin((obj.count-max)/60*Math.PI/2);
				}
				size *= 5;
				size += (Math.random()-0.5)*0.25;
				const s = 1/10;
				obj.mesh.scale.set(s*size,s*size,s*5);
				
				//当たりグループを切り替えることにより多段ヒットさせる
				if(obj.count % 45 == 0) {
					obj.body.collisionFilterGroup = 0;
				}else if(obj.count > 0) {
					obj.body.collisionFilterGroup = obj.body.collisionFilterMask;
				}

				if(obj.count >= max) {
					obj.enable = false;
					obj.mesh.visible = false;
					physics.world.removeBody( obj.body );
					continue;
				}
				else {
					//発動者の向きによって位置・回転を反映
//					let target = obj.parent.position.clone();
					let target;
					let ofs = 0;
					if(obj.parent.weapon == null) {
						obj.parent.mesh.updateMatrixWorld(true);
						let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
						mat0 = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(obj.parent.mesh, obj.parent.atari_bone).matrixWorld);

//						target = (new THREE.Vector3()).setFromMatrixPosition(findBone(obj.parent.mesh, obj.parent.atari_bone).matrix);
						target = (new THREE.Vector3()).setFromMatrixPosition(mat0);
						//あごのあたり
						ofs = 0.2;
						target.y -= 0.1;
					}
					else {
						target = (new THREE.Vector3()).setFromMatrixPosition(obj.parent.weapon.matrix);
						//杖の先
						ofs = 1.3;
					}

					const r = obj.parent.mesh.rotation.y;
					const len = (50/2)+ofs;
					target.add( new THREE.Vector3(Math.sin(r)*-len, 0, Math.cos(r)*-len) );
					let r2 = r+Math.PI/2;
					let l2 = 1/len*3;
					target.add( new THREE.Vector3(Math.sin(r2)*-l2, 0, Math.cos(r2)*-l2) );
					
					obj.body.position.x = target.x;
					obj.body.position.y = target.y;
					obj.body.position.z = target.z;

					obj.body.quaternion.setFromEuler(Math.PI/2,r,0, "YXZ");
					//obj.debug_obj.rotation.set(Math.PI/2,r,0, "YXZ");
					obj.mesh.rotation.y = r;

					obj.mesh.rotation.z = obj.count/8;
				}
			}
			break;
		case "explosion":
			{
				const max = 45;
				let tex = obj.mesh.material.map;
				const j = Math.floor(obj.count*13/max)+3;		//16枚
				let u =   Math.floor(j%4);
				let v = 4-Math.floor(j/4);
				tex.offset.set(1/4*u, 1/4*v);
				tex.repeat.set(1/4, 1/4);
				tex.wrapT = THREE.ClampToEdgeWrapping;

				//座標を切り替えることにより多段ヒットさせる
				if(obj.count %2) {
					obj.body.collisionFilterGroup = 0;
				}else if(obj.count > 0) {
					obj.body.collisionFilterGroup = obj.body.collisionFilterMask;
				}
				
				if(obj.count >= max) {
					obj.enable = false;
					obj.mesh.visible = false;
					physics.world.removeBody( obj.body );
					if(GameParam.DpsCheck) {
						obj.parent.sequence = 0;
					}
					continue;
				}
			}
			break;
		case "shield":
			{
				const max2 = 210;	//time
				obj.mesh.rotation.y += 0.04;
				let s = 1;
				if(obj.count < 30) {
					s *= obj.count/30;
				} else if(obj.count > max2-30) {
					s *= (max2-obj.count)/30;
				}
				{
					obj.parent.mesh.updateMatrixWorld(true);
					let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
					mat0 = (new THREE.Matrix4()).multiplyMatrices(mat0, findBone(obj.parent.mesh,obj.parent.root_bone).matrixWorld);
//					let mat1 = e.parent.children[0].children[0].matrixWorld;
//					mat0 = (new THREE.Matrix4()).multiplyMatrices(mat0, mat1);
					let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);
					obj.body.position.copy( pos );
				}

				obj.mesh.scale.set(s,s,s);
				obj.body.shapes[0].radius = s;
				obj.body.updateBoundingRadius();
				
				if(obj.count >= max2) {
					obj.enable = false;
					obj.mesh.visible = false;
					physics.world.removeBody( obj.body );
					continue;
				}
			}
			break;
		case "web":
			if(obj.parent.capture != null) {
				obj.mesh.rotation.set(Math.PI/2,0,0);
				let p = obj.parent.capture.mesh.position;
				obj.body.position.set(p.x, p.y+0.45, p.z);
				if(obj.parent.capture.sequence != SEQ_HOLD) {	//自力解除した
					obj.die = true;
				}
			}
			else if(obj.count++ > 60) {
				obj.die = true;
			}
			if(obj.die) {
				obj.parent.capture = null;
				obj.enable = false;
				obj.mesh.visible = false;
				physics.world.removeBody( obj.body );
				continue;
			}
			break;
		case "ice":
			if(obj.count++ < 60) {
				//狙いを定める
				const t = obj.param.target.mesh;
				let pos = t.position.clone();
				const r = obj.param.index/3 * Math.PI*2;
				const len = 3.0;
				pos.add(new THREE.Vector3(Math.sin(r)*len,len+1,Math.cos(r)*len));
				const n=0.1;
				if(obj.count > 0) {
					pos.x *= n;
					pos.x += obj.body.position.x * (1-n);
					pos.z *= n;
					pos.z += obj.body.position.z * (1-n);
				}
				obj.body.position.set(pos.x, pos.y, pos.z);

				pos.sub(t.position);
				pos.y -= obj.param.target.height;
				pos.normalize();
				var qrot = (new THREE.Quaternion()).setFromUnitVectors(new THREE.Vector3(0,-1,0), pos);
				obj.mesh.quaternion.copy(qrot);
				
				//対象に向かって飛ぶ
				if(obj.count == 60-1) {
					pos.multiplyScalar(-0.05);
					obj.move.copy(pos);
					obj.body.collisionFilterGroup = obj.body.collisionFilterMask;	//当たり有効
					sound.play("spell_ice");
				}
			}
			else if(obj.count > 200) {
				obj.die = true;
			}
			else if(obj.count < 200-60 && obj.body.position.y <= 0.275) {	//地面に刺さる
				obj.move.set(0,0,0);
				obj.count = 200-60;
				sound.play("shuriken2");
			}
			else {
				//加速
				if(obj.move.length() < 0.3) {
					obj.move.multiplyScalar(1.075);
				}
			}
			if(obj.die) {
				obj.enable = false;
				obj.mesh.visible = false;
				physics.world.removeBody( obj.body );
				continue;
			}
			break;
		case "ofuda":
			if(obj.count > 600-20) {
				obj.mesh.scale.y = (600-obj.count)/20;
				if(obj.count >= 600) obj.die = true;
				obj.move.y = -0.01;
			}
			else {
				obj.mesh.scale.set(1,1,1);
				obj.move.y = Math.sin(obj.count/18)*0.01;
			}
			obj.mesh.rotation.y += 0.015;
		case "stone":
			if(obj.body.velocity.x != 0 || obj.body.velocity.z != 0) {
				obj.mesh.rotation.set(-obj.count/5,obj.parent.mesh.rotation.y,0, "YXZ");
			}
		default:
			if(obj.die) {
				obj.enable = false;
				obj.mesh.visible = false;
				physics.world.removeBody( obj.body );
				continue;
			}
			break;
		}
		obj.mesh.visible = true;
		if(!obj.die && !skip) {
			obj.mesh.position.set(obj.body.position.x, obj.body.position.y, obj.body.position.z);
			if(obj.moveFlag == 0) {
				obj.body.position.x += obj.move.x;
				obj.body.position.y += obj.move.y;
				obj.body.position.z += obj.move.z;
			}
			else {
				let s = 10;
				obj.body.velocity.x = obj.move.x * s;
				obj.body.velocity.y = obj.move.y * s;
				obj.body.velocity.z = obj.move.z * s;
			}

			if (obj.debug_obj != null) {
				obj.debug_obj.position.set(obj.body.position.x, obj.body.position.y, obj.body.position.z);
			}
		}
		obj.count++;
	}
}

//検索
function findBone(mesh, name)
{
	if(mesh.name == name) {
		return mesh;
	}
	if(mesh == null) {
		return nulll;
	}
	
	if(mesh.children != null) {
		var i;
		for(i=0;i<mesh.children.length;i++) {
			var ptr = findBone(mesh.children[i], name);
			if(ptr) {
				return ptr;
			}
		}
	}
	return null;
}
//r1に近いr2の角度を求める
function getNearRotation(r1,r2) {
	while(1) {
		let a = r1 - r2;
		if(Math.abs(a) <= Math.PI) {
			return r2;
		}
		else {
			if(a < 0)
				r2 -= Math.PI*2;
			else
				r2 += Math.PI*2;
		}
	}
}

var timer_event = new Array();
//汎用タイマーイベント
function setTimerEvent(name, time, upd_func, end_func) {
	timer_event.push({
		time : time,
		upd_func : upd_func,
		end_func : end_func,
		name : name
	});
}
function updateTimerEvent() {
	for(let i=0;i<timer_event.length;i++) {
		let e = timer_event[i];
		let die = false;
		if(e.time >= 0 && --e.time <= 0) {
			die = true;
		}
		else if(e.upd_func != null) {
		    try {
				if(e.upd_func()) {
					die = true;
				}
		    } catch (error) {
		    	console.log("TimerEvent "+e.name);
		    	console.log(error.message);
				die = true;
		    }
		}
		if(die) {
			if(e.end_func != null) {
				e.end_func();
			}
			timer_event.splice(i,1);	//リストから削除
			i--;
		}
	}
}
function clearTimerEvent(name) {
	for(let i=0;i<timer_event.length;i++) {
		let e = timer_event[i];
		if(name == undefined || e.name == name) {
			timer_event.splice(i,1);	//リストから削除
			i--;
		}
	}
}
//https://stackoverflow.com/questions/45393765/how-to-clone-a-skinned-mesh
function cloneAnimated( source ) {

	if(source == null) {
		return null;
	}
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
				case CANNON.Shape.types.CYLINDER:
				/*Cylinder ( radiusTop  radiusBottom  height  numSegments )*/
					geometry = new THREE.Cylinder(shape.radiusTop, shape.radiusBottom, shape.height, shape.numSegments);
					mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
					break;
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
				{
					geometry = new THREE.BufferGeometry();
					geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(shape.vertices.length*3), 3 ) );
					for (i = 0; i < shape.vertices.length; i++) {
						var v = shape.vertices[i];
						//geometry.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
						geometry.attributes.position.array[i*3+0] = v.x;
						geometry.attributes.position.array[i*3+1] = v.y;
						geometry.attributes.position.array[i*3+2] = v.z;
					}
					let count = 0;
					for(i=0; i < shape.faces.length; i++){
						var face = shape.faces[i];
						count += (face.length - 1) * 3;
					}
					let indices;
					geometry.setIndex( new THREE.BufferAttribute( indices = new Uint32Array(count) , 1 ) );
					count = 0;
					for(i=0; i < shape.faces.length; i++){
						var face = shape.faces[i];
						var a = face[0];
						for (j = 1; j < face.length - 1; j++) {
							var b = face[j];
							var c = face[j + 1];
							indices[count++] = a;
							indices[count++] = b;
							indices[count++] = c;
							geometry.faces.push(new THREE.Face3(a, b, c));
						}
					}
					geometry.computeBoundingSphere();
					geometry.computeFaceNormals();
					mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
					break;
				}
				case CANNON.Shape.types.HEIGHTFIELD:
				{
					geometry = new THREE.BufferGeometry();
					let count = 0;
					for (var xi = 0; xi < shape.data.length - 1; xi++) {
						count += (shape.data[xi].length - 1) * 2 * 3;
					}
					geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(count * 3), 3 ) );
					let indices;
					geometry.setIndex( new THREE.BufferAttribute( indices = new Uint32Array(count) , 1 ) );

					var v0 = new CANNON.Vec3();
					var v1 = new CANNON.Vec3();
					var v2 = new CANNON.Vec3();
					count = 0;
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
//								geometry.vertices.push(
//										new THREE.Vector3(v0.x, v0.y, v0.z),
//										new THREE.Vector3(v1.x, v1.y, v1.z),
//										new THREE.Vector3(v2.x, v2.y, v2.z)
//								);
								i = geometry.vertices.length - 3;
								indices[count++] = i;
								indices[count++] = i+1;
								indices[count++] = i+2;
//								geometry.faces.push(new THREE.Face3(i, i+1, i+2));
							}
						}
					}
					geometry.computeBoundingSphere();
					geometry.computeFaceNormals();
					mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: color}));
//					mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: color}));
					break;
				}
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
		obj.position.set(body.position.x, body.position.y, body.position.z);
		obj.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
		return obj;
	}

}
function clear() {
	clearAttackObject();
	effect.clearAll();
	clearEnemyNPC();
}

//FLAG_EVENT_MOVE持ちがいるか
function checkEventMove() {
	for(let p of chara_info) {
		if(p.enable) {
			if(p.flag & FLAG_EVENT_MOVE) {
				return true;
			}
		}
	}
	return false;
}

//visibleの反映とカメラ処理
function setVisible(camera_eye) {
	for(let p of chara_info) {
		if(p.mesh) {
			p.mesh.visible = p.visible;
			
			let camera2 = camera_eye.clone();
			camera2.y -= p.height;
			if(p.mesh.position.distanceTo(camera2) < 1.1) {
				p.mesh.visible = false;
			}
			if(p.sub_obj) {
				p.sub_obj.visible = p.visible;
			}
		}
	}
}
function isDead(player) {
	if(!player.enable) {
		return true;
	}
	if(player.sequence >= SEQ_DEAD_END) {
		return true;
	}
	return false;
}
//////////
scope.preUpdate = preUpdate;
scope.postUpdate = postUpdate;
scope.Jump = Jump;
scope.Attack = Attack;
scope.Walk = Walk;
scope.Step = Step;
scope.Guard = Guard;
scope.get = get;
scope.getNearRotation = getNearRotation;
scope.findBone = findBone;
scope.Utility = Utility;
scope.setChara = setChara;
scope.initChara = initChara;
scope.getEnemyName = getEnemyName;
scope.BattleStart = BattleStart;
scope.BattleEnd = BattleEnd;
scope.setTimerEvent = setTimerEvent;
scope.clearTimerEvent = clearTimerEvent;
scope.setArrive = setArrive;
scope.clear = clear;
scope.cloneAnimated = cloneAnimated;
scope.checkEventMove = checkEventMove;
scope.setVisible = setVisible;
scope.actionResetAll = actionResetAll;
scope.isDead = isDead;
scope.effect = effect;
};


Battle.prototype = Object.create(null);
Battle.prototype.constructor = Battle;

export { Battle };

