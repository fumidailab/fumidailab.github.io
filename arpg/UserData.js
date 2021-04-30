
import * as THREE from '../three.js-master/build/three.module.js';
import { Data } from './Data.js';

const friend_name = [
	"tamami","ayame","karin"
];
var UserData = function (options) {
	var scope = this;
	var status_store = null;
	var status = {
		//セーブ
		mapno : 0,		//現在のマップ
		map_prev : 0,	//移動用
		position : null,	//座標
		rotation : 0,
		select_chara : 0,
//		friend_call : 0,	//戦闘開始時、仲間を呼ぶ
		cam_rot : new THREE.Vector3(Math.PI/-8,Math.PI/2,0),
		mapping : {},		//マッピングデータ
		gotitem : {},		//宝箱回収
		enemy_flag : {},	//エンカウント
		drop_flag : [],		//お守り（現マップのみ）
//		date:"",
		game_time:0,
		travel : -1,
		
		//状態
		life : [100,100,100],
		life_max : [100,100,100],
		skill : [10,10,10],
		skill_max : [10,10,10],

		amulet : 0,			//お守り
		cost_point  : 10,	//霊魂

		combo_time : 0,
		combo_count : 0,
		
		//イベントフラグ
		event_flag : {},
		trade_point : 0,	//ほたる交換用
		
		//所有アイテム
		item : {
			//仮
			'0' :3,
			'3' :1,
		},
		//スキル割り当て
		skill_assign : {
			"0": {	//tamami
				"10":1,
				"11":1,
				"18":1,
				"70":1,
				"72":1,
			},
			"1": {	//ayame
				"10":1,
				"11":1,
				"13":1,
				"80":1,
				"81":1,
			},
			"2": {	//karin
				"10":1,
				"11":1,
				"16":1,
				"90":1,
				"91":1,
			},
		},
		//ボタン割り当て
		attack_assign : [
			[	//tamami
				70,
				72,
				-1,
			],
			[	//ayame
				80,
				81,
				-1,
			],
			[	//karin
				90,
				91,
				-1,
			],
		],
	};
	var statusDebug = {
		//セーブ
		mapno : 0,		//現在のマップ
		map_prev : 0,	//移動用
		position : null,	//座標
		rotation : 0,
		select_chara : 0,
		cam_rot : new THREE.Vector3(Math.PI/-8,Math.PI/2,0),
		mapping : {},		//マッピングデータ
		gotitem : {},		//宝箱回収
		enemy_flag : {},	//エンカウント
		drop_flag : [],		//お守り（現マップのみ）
		game_time:0,
		travel : 27,
		
		//状態
		life : [100,100,100],
		life_max : [100,100,100],
		skill : [10,10,10],
		skill_max : [10,10,10],

		amulet : 0,			//お守り
		cost_point  : 1000,	//霊魂

		combo_time : 0,
		combo_count : 0,
		
		//イベントフラグ
		event_flag : {},
		trade_point : 0,	//ほたる交換用
		
		//所有アイテム
		item : {
			//仮
			'0' :5,
			'1' :2,
			'2' :1,
		},
		//スキル割り当て
		skill_assign : {
			"0": {	//tamami
				"10":9,
				"11":9,
				"12":1,
				"13":3,
				"14":5,
				"15":5,
				"16":3,
				"17":1,
				"18":1,
				"20":5,
				"21":3,
				"70":1,
				"71":1,
				"72":1,
				"73":1,
				"74":1,
				"79":1,
			},
			"1": {	//ayame
				"10":9,
				"11":9,
				"12":1,
				"13":3,
				"14":5,
				"15":5,
				"16":3,
				"17":1,
				"18":1,
				"20":5,
				"21":3,
				"80":1,
				"81":1,
				"82":1,
				"83":1,
				"84":1,
				"89":1,
			},
			"2": {	//karin
				"10":9,
				"11":9,
				"12":1,
				"13":3,
				"14":5,
				"15":5,
				"16":3,
				"17":1,
				"18":1,
				"20":5,
				"21":3,
				"90":1,
				"91":1,
				"92":1,
				"93":1,
				"94":1,
				"99":1,
			},
		},
		//ボタン割り当て
		attack_assign : [
			[	//tamami
				70,
				71,
				72,
			],
			[	//ayame
				80,
				81,
				82,
			],
			[	//karin
				90,
				91,
				93,
			],
		],
	};
	function addSkill(chara, no, value) {
		if (this.status.skill_assign[chara][no] == undefined) {
			this.status.skill_assign[chara][no] = 0;
		}
		else {
			this.status.skill_assign[chara][no]++;
		}
	}
	function getSkill(name, no) {
		let chara = Number(name);
		if(isNaN(chara)) {
			chara = 0;
			for(let fn of friend_name) {
				if(fn == name) break;
				chara++;
			}
		}
		if (this.status.skill_assign[chara] != undefined) {
			if (this.status.skill_assign[chara][no] != undefined) {
				return this.status.skill_assign[chara][no];
			}
		}
		else {
			console.log("error getSkill "+name);
		}
		return 0;
	}
	function setAttack(chara, index, value) {
		this.status.skill_assign[chara][index] = value;
	}
	const typeName = ["回復","特技の書","武術の書","武術の書","武術の書","素材"];

	function getName(index, prefix) {
		for(let i=0;i<Data.Item.length;i++) {
			if(Data.Item[i].index == index) {
				if(prefix == true) {
					let type = Data.Item[i].type;
					if(type == 0 && Data.Item[i].cost > 0) type = 5;
					return "【" + typeName[type] + "】" + Data.Item[i].name;
				}
				else {
					return Data.Item[i].name;
				}
			}
		}
		return "不明";
	}
	function getInfo(index) {
		for(let i=0;i<Data.Item.length;i++) {
			if(Data.Item[i].index == index) {
				return Data.Item[i];
			}
		}
		return -1;
	}
	//アイテムを増やす
	function addItem(index,count) {
		const type = getInfo(index).type;
		if(count == undefined) count = 1;
		if(type == 0) {
			//道具
			if (this.status.item[index] != undefined) {
				this.status.item[index] += count;
			}
			else {
				//持っていなかった場合
				this.status.item[index] = count;
			}
		}
		else {
			//スキルのあるアイテムはパラメータに追加
			for(let i=0;i<3;i++) {
				if(this.status.skill_assign[i][index] == undefined) {
					if(type == 1 || type == 2+i) {
						this.status.skill_assign[i][index] = 0;
					}
				}
			}
		}
	}
	//道具リスト
	function getItemList() {
		let list = [];
		for(let k in this.status.item) {
			if(getInfo(k).type == 0 && this.status.item[k] > 0) {
				list[k] = this.status.item[k];
			}
		}
		return list;
	}
	//特技・武術リスト
	function getSkillList(chara, all) {
		let list = [];
		for(let k in this.status.skill_assign[chara]) {
			const info = getInfo(k);
			if(all == undefined || all == true) {
				//すべて列挙
				if(info.type == 1 || info.type == 2+chara) {
					list[k] = this.status.skill_assign[chara][k];
				}
			}
			else {
				//段位のある武術
				if(this.status.skill_assign[chara][k] >= 0 && info.type == 2+chara) {
					list[k] = this.status.skill_assign[chara][k];
				}
			}
		}
		return list;
	}
	//武術割り当て
	function getAttackAssign(name, i) {
		let chara = Number(name);
		if(isNaN(chara)) {
			chara = 0;
			for(let fn of friend_name) {
				if(fn == name) break;
				chara++;
			}
		}
		return this.status.attack_assign[chara][i];
	}
	function setAttackAssign(chara, i, idx) {
		this.status.attack_assign[chara][i] = idx;
	}
	function setStatus(src, store) {
		if(store)
			this.status_store = src;
		else
			this.status = src;
	}

scope.getName = getName;
scope.getInfo = getInfo;
scope.addItem = addItem;
scope.getItemList = getItemList;
scope.status = status;
scope.statusDebug = statusDebug;
scope.setStatus = setStatus;
scope.setAttack = setAttack;
scope.addSkill = addSkill;
scope.getSkill = getSkill;
scope.getSkillList = getSkillList;
scope.getAttackAssign = getAttackAssign;
scope.setAttackAssign = setAttackAssign;
};


UserData.prototype = Object.create(null);
UserData.prototype.constructor = UserData;

export { UserData };
