//import * as THREE from '../three.js-master/build/three.module.js';
import { Data } from './Data.js';
import { Sound } from './sound.js';

var Menu = function (options) {
	var scope = this;
	var GameParam = options.GameParam;
	var sound = options.sound;
	var Input = options.Input;
	var InputOnes = options.InputOnes;
//	var image_icons = options.image_icons;

	var frame_top = new Array();
	var key_count = 0;
	var cur_count = 0;
	var menu_exit = 0;	//半強制的にメニュー終了

	
	let S = options.MenuScale;
	const MENU_H  = 26;	//サイズ
	const MENU_H2 = 32*1.3;	//縦
	let FONT_SIZE = 18*S;
	const BUTTON_W = 200;
	const TEXT_CENTER = 2000;
	const SUB_Y = 40+MENU_H2*9;

	const MENU_ROWS = 10;
	let menu_rows = MENU_ROWS;

	const friend_name_short = [
		Data.CharaName["tamami"],
		Data.CharaName["ayame"],
		Data.CharaName["karin"],
	];

function getButtonX(button, i) {
	return button.x + ((button.w == undefined) ? 0 : Math.floor(i/menu_rows) * button.w);
}
function getButtonY(button, i) {
	return button.y + Math.floor(i%menu_rows) * MENU_H2;
}
var canvas;
function setCanvas(_canvas, scale) {
	canvas = _canvas;
	S = scale;
	FONT_SIZE = 18*S;
}

let menu_top = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		let player = GameParam.getPlayableChara();

		context.clearRect(0,0,canvas.menu.width,canvas.menu.height);
		
		if(active) {
			//地図を表示する
			const scl = Math.min(canvas.minimap.width / (GameParam.MapSizeX+1), canvas.minimap.height / (GameParam.MapSizeZ+1))*S;
			const aspect = (GameParam.MapSizeX+1) / (GameParam.MapSizeZ+1);

			const w = 512*S;
			const h = 512*S;
			const h2 = (GameParam.MapSizeZ+1)*scl;
			let x = (canvas.menu.width - w)/2*1.4;
			let y = (canvas.menu.height- h2)/2;
			//回転をかけて描画
	//		context.clearRect(0,0,canvas.menu.width,canvas.menu.height);
			context.save();
			context.drawImage(canvas.minimap, x,y, w,h);
			context.globalCompositeOperation = "destination-in";	//重なったところだけ描画
			context.drawImage(canvas.minimap_walk, x,y, w,h);
			context.restore();

			context.strokeStyle = "rgb(192,192,192)";
			context.strokeRect(x-1,y-1, w+2,h2+2);
			
			//自分の位置
			context.fillStyle = "rgb(255,0,0)";
			context.beginPath();
			context.arc(x+player.mesh.position.x*scl, y+player.mesh.position.z*scl, 4, 0, Math.PI*2);
			context.fill();

			//現在のステータスなど
			x = 900;
			y = 10;
			drawWindow(context, x, y, x+255,y+96, 1.0);
			drawFont(context, "所持霊魂:"+GameParam.user.status.cost_point,
						x+10,y+ 8       , active?"rgb(0,0,0)":"rgb(128,128,128)");
			drawFont(context, "現在地:"+Data.LocationName[GameParam.user.status.mapno],
						x+10,y+ 8+MENU_H, active?"rgb(0,0,0)":"rgb(128,128,128)");
			drawFont(context, (menu_top.itembox_cnt >= 0) ? "（宝箱回収率:"+menu_top.itembox_cnt+"％）" : "（宝箱なし）",
						x+10,y+ 8+MENU_H*2, active?"rgb(0,0,0)":"rgb(128,128,128)");
		}

//		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
	},
	update:function(select, cursor) {
		switch(select) {
		case 0:
			menu_item.cursor = 0;
			if(createItemMenu()) {
				menu_item.cursor = 0;
				frame_top.push(menu_item);
			}
			else {
				setMessage("道具を持っていません");
			}
			break;
		case 1:
			//武術
			/*if(GameParam.BattleMode) {
				setMessage("戦闘中は選択できません");
			}
			else*/ {
				menu_chara.cursor = 0;
				frame_top.push(menu_chara);
			}
			break;
		case 2:
			//強化
			if(GameParam.BattleMode) {
				setMessage("戦闘中は選択できません");
			}
			else {
				menu_chara.cursor = 0;
				frame_top.push(menu_chara);
			}
			break;
		case 3:
			//超速旅
			if(GameParam.debug && !Input.L2) {
//				GameParam.user.status.travel = 20;
				menu_rows = 9;
				let list = [];
				for(let i=0;i<Data.LocationName.length;i++) {
					list.push({
						text:Data.LocationName[i],
						mapno:i,
						prev:-1,
					});
				}
				menu_travel.buttons.list = list;
				menu_travel.cursor = 0;
				frame_top.push(menu_travel);
			}
			else if(GameParam.BattleMode) {
				setMessage("戦闘中は選択できません");
			}
			else if(GameParam.user.status.travel < 9) {
				setMessage("現在は使えません");
			}
			else {
				let list = [];
				for(let t of Data.Travel) {
					if(GameParam.user.status.travel >= t.mapno) {
						list.push({text:t.name, mapno:t.mapno, prev:t.prev});
					}
				}
				
				if(list.length > 0) {
//					list.push({text:"やめる",mapno:-1});
					menu_travel.buttons.list = list;
					menu_travel.cursor = 0;
					frame_top.push(menu_travel);
				}
			}
			break;
		case 4:
			setYesNo("現在の状態は失われます。\nマップの最初からやり直しますか？",false, function(){
				if(storageLoad(9, true)) {
					GameParam.orderMapMove(1000);
					menu_exit = true;
				}
				return true;
			});
			break;
		case 5:
			if(GameParam.BattleMode) {
				setMessage("戦闘中はセーブできません");
			}
			else {
				menu_slot.init("game-save");
				menu_slot.cursor = 0;
				frame_top.push(menu_slot);
			}
			break;
		case 6:
			menu_slot.init("game-load");
			menu_slot.cursor = 0;
			frame_top.push(menu_slot);
			break;
		case 7:	//オプション
			menu_option.cursor = 0;
			frame_top.push(menu_option);
			break;
		default:
			break;
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:70,
		y:40,
		list:[
			{text:"道具", help:"回復アイテムを使います。"},
//			{text:"武術", help:"キャラクタごとの武術を装備します。戦闘中は変更できません。"},
			{text:"武術", help:"キャラクタごとの武術を装備します。"},
			{text:"強化", help:"キャラクタごとの武術や特技の強化を行います。"},
			{text:"超速旅", help:"いわゆるファストトラベル。\n進行度により一度訪れた場所へ瞬時に移動できます。"},
			{text:"やり直し", help:"現在のマップの最初からやり直します。"},
			{text:"セーブ", help:"現在の状態をブラウザストレージにセーブします。"},
			{text:"ロード", help:"ブラウザストレージからロードします。"},
			{text:"オプション", help:"ゲームに関する設定を確認・変更します。"},
		],
	},
	/*window:{
		x:50,
		y:20,
		w:240,
		h:150,
	},*/
	cursor:0,
	itembox_cnt:-1,
};
let menu_slot = {
	draw:function(active) {
//		let context = canvas.menu.getContext('2d');
	},
	update:function(select, cursor) {
		if(select >= 0) {
			switch(menu_slot.mode) {
			case "game-load":	//ゲーム中メニューからのロード
				setYesNo("現在の状態は失われます。\nロードしますか？",false, function(){
					sound.play("menu_load");
					if(storageLoad(select+1, true)) {
						GameParam.orderMapMove(1000);
						menu_exit = true;
					}
					return true;
				});
				break;
			case "game-save":	//ゲーム中メニューからのセーブ
				setYesNo("セーブデータ"+(select+1)+" に上書きします。\nよろしいですか？",false, function(){
					if(storageSave(select+1)) {
						sound.play("menu_save");
						menu_slot.init(menu_slot.mode);
					}
					return true;
				});
				break;
			case "title":	//タイトルからのロード
				sound.stop("ONES");
				sound.play("menu_load");
				if(storageLoad(select+1, false)) {
					GameParam.stopGame();
					GameParam.startMapMove(function(){
						GameParam.restartGame();
						menu_exit = true;
					});
				}
				break;
			}
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:320,
		y:70,
		list:[
			{text:"セーブデータ1", help:""},
			{text:"セーブデータ2", help:""},
			{text:"セーブデータ3", help:""},
		],
	},
	/*window:{
		x:50,
		y:20,
		w:240,
		h:150,
	},*/
	cursor:0,
	mode : "",
	init:function(name) {
		menu_slot.mode = name;
		for(let i=0;i<menu_slot.buttons.list.length;i++) {
			menu_slot.buttons.list[i].help = "データがありません";
			let data = localStorage.getItem("info"+(i+1));
			if(data != null) {
				let info = JSON.parse(data);
				if(info != null && info.date != null) {
					menu_slot.buttons.list[i].help = "最終日付:"+info.date+" / プレイ時間:"+info.time+" / 場所:"+Data.LocationName[info.mapno];
				}
			}
		}
	}
};

//const code = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !#()=~|`{+*}<>_@[;:],./-^";

//マッピング情報を作成
function createMapping() {
	let mapping = "";	//localStorageに保存するため文字列に置き換える
	let context = canvas.minimap_walk.getContext('2d');
	const img = context.getImageData(0,0,canvas.minimap_walk.width,canvas.minimap_walk.height);
	let i;
	for(let i=0;i<mapping.length;i++) mapping[i] = 0;
	i=0;
	let flg=0;
	for(let y=0;y<canvas.minimap_walk.height;y++) {
		for(let x=0;x<canvas.minimap_walk.width;x++) {
			let b = (img.data[(x+y*canvas.minimap_walk.width)*4+3] < 127) ? 0 : 1;
			flg |= b << (i%8);
			if(i%8 == 7) {
				mapping += String.fromCharCode(flg);
				flg = 0;
			}
			i++;
		}
	}
	return mapping;
}
//現在のマッピング情報を保存領域に（セーブ前・移動前など）
function saveMapping() {
	GameParam.user.status.mapping[ GameParam.user.status.mapno ] = createMapping();
}
function loadMapping() {
	let mpdata = GameParam.user.status.mapping[ GameParam.user.status.mapno ];//localStorage.getItem("Mapping");
	if(mpdata != null) {
		let mapping = mpdata.toString();
		let context = canvas.minimap_walk.getContext('2d');
		let img = context.getImageData(0,0,canvas.minimap_walk.width,canvas.minimap_walk.height);
		let i=0,j=0;
		for(let y=0;y<canvas.minimap_walk.height;y++) {
			for(let x=0;x<canvas.minimap_walk.width;x++) {
				const a = mapping.charCodeAt(Math.floor(j/8));
				const r = ((a >> (j%8)) & 1) * 255;
				j++;
				img.data[i++] = r;
				img.data[i++] = r;
				img.data[i++] = r;
				img.data[i++] = r;
			}
		}
//		context.clearRect(0,0,canvas.minimap_walk.width,canvas.minimap_walk.height);
		context.putImageData(img, 0, 0);
	}
}

function storageSave(slot_id) {
	let user = 0;
	if(slot_id > 0 && slot_id < 9) {
		//現在の状態
		let player = GameParam.getPlayableChara();
		GameParam.user.status.position = new THREE.Vector3(player.physicsBody.position.x, player.physicsBody.position.y, player.physicsBody.position.z);
		GameParam.user.status.rotation = player.mesh.rotation.y;
		saveMapping();
		user = 1;
	}

	let json;
	try {
		//メイン
		json = JSON.stringify(GameParam.user.status);
		localStorage.setItem("slot"+slot_id,json);
	} catch (error) {
		if(user) {
			setMessage("セーブデータ"+slot_id+" に保存できませんでした", true);
		}
		return false;
	}

	//情報
	if(user) {
		//今日の日付
		const sec = Math.round(GameParam.user.status.game_time);	//秒
		const hour = 60*60;
		let time;
		if(sec < hour) {
			time = Math.floor(sec/60)+"分";
		}
		else {
			time = Math.floor(sec/hour)+"時間"+Math.floor(sec/60%60)+"分";
		}

		let info = {
			date : (new Date()).toLocaleString(),
			time : time,
			mapno : GameParam.user.status.mapno,
		};
		json = JSON.stringify(info);
		localStorage.setItem("info"+slot_id,json);
	
		setMessage("セーブデータ"+slot_id+" に保存しました", true);
		
	}
	return true;
}
function storageLoad(slot_id, store) {
	let data;
	let success = false;
	if(data = localStorage.getItem("slot"+slot_id)) {
		GameParam.user.setStatus(JSON.parse(data), store);
		if(slot_id > 0) {
			setMessage("セーブデータ"+slot_id+" からロードしました", true);
		}
		success = true;
	}
	if(!success) {
		if(slot_id > 0) {
			setMessage("ロードできませんでした");
		}
	}
	return success;
}
function init() {
	//起動直後の状態を0番にセーブ
	storageSave(0);
	quickSave();
}
function quickSave() {
	//マップ移動直後の状態を9番にセーブ
	storageSave(9);
}

function createItemMenu() {
	//アイテム一覧を作る
	let list = [];
	const org = GameParam.user.getItemList();
	for(let k in org) {
		if(GameParam.user.status.item[k] > 0) {
			list.push({
				text:GameParam.user.getName(k),
				suffix:"×"+GameParam.user.status.item[k],
				help:GameParam.user.getInfo(k).str,
				param:k,
			});
		}
	}
	menu_item.buttons.list = list;
	if(menu_item.cursor >= list.length) {
		menu_item.cursor = list.length-1;
	}
	return (list.length > 0);
}

//アイテム使用チェック
let result = new Array(3);
function useItemCheck(no, isMsg) {
	let str = "";
	const info = GameParam.user.getInfo(no);
	let party = GameParam.getPlayableList();
	let max = 0;
	if(GameParam.user.status.item[no] == 0) {
		//未所持
	}
	else if(info.life != undefined) {
		//消費割合を見る
		for(let i=0;i<3;i++) {
			if(party[i].lost != 0 && info.recover == undefined) {
				result[i] = 0;
				continue;
			}
			result[i] = Math.max(0, GameParam.user.status.life_max[i] - GameParam.user.status.life[i]);
			max += result[i];
		}
		if(max > 0) {
			for(let i=0;i<3;i++) {
				result[i] = Math.min(GameParam.user.status.life_max[i], GameParam.user.status.life[i] + Math.round(info.life * result[i] / max));
				if(GameParam.user.status.life[i] != result[i]) {
					if(isMsg) {
						str += "\n"+friend_name_short[i]+"の生命力 "+GameParam.user.status.life[i]+"→"+result[i];
					}
				}
			}
		}
		if(max == 0 && isMsg) {
			str += "生命力が満タンなので回復する必要はありません";
		}
	}
	else if(info.skill != undefined) {
		//消費割合を見る
		for(let i=0;i<3;i++) {
			if(party[i].lost != 0) {
				result[i] = 0;
				continue;
			}
			result[i] = Math.max(0, GameParam.user.status.skill_max[i] - GameParam.user.status.skill[i]);
			max += result[i];
		}
		if(max > 0) {
			for(let i=0;i<3;i++) {
//						result[i] = Math.min(GameParam.user.status.skill_max[i], GameParam.user.status.skill[i] + info.skill);
				result[i] = Math.min(GameParam.user.status.skill_max[i], GameParam.user.status.skill[i] + Math.round(info.skill * result[i] / max));
				if(GameParam.user.status.skill[i] != result[i]) {
					if(isMsg) {
						str += "\n"+friend_name_short[i]+"の技力 "+GameParam.user.status.skill[i]+"→"+result[i];
					}
				}
			}
		}
		if(max == 0 && isMsg) {
			str += "技力が満タンなので回復する必要はありません";
		}
	}
	else if(info.attack_up != undefined) {
		if(GameParam.BattleMode != 0) {
			for(let i=0;i<3;i++) {
				if(party[i].lost != 0) {
					result[i] = 0;
					continue;
				}
				result[i] = info.attack_up;
				max++;
			}
			if(max == 0 && isMsg) {
//				str += "既に使用中です";
			}
		}
		else if(isMsg) {
			str += "戦闘中しか使えません";
		}
	}
	return [(max > 0), str];
}
function useItemExec(no, isMsg, callback) {
	const info = GameParam.user.getInfo(no);
	let str2 = "";
	let flg = 0;
	let party = GameParam.getPlayableList();
	//使った
	if(info.life != undefined) {
		for(let i=0;i<3;i++) {
			let ptr = result[i]-GameParam.user.status.life[i];
			if(ptr > 0 && isMsg) {
				str2 += friend_name_short[i];
				if (party[i].lost > 0 && info.recover != undefined) {
					party[i].lost = 1;	//蘇生
					str2 += "が戦闘不能から復帰し、";
				}
				else {
					str2 += "の";
				}
				str2 += "生命力が"+(ptr)+"回復した！\n";
			}
			GameParam.user.status.life[i] = result[i];
			if(ptr > 0) {
				flg = 1;
				if(callback != undefined) callback(party[i]);
			}
		}
		if(flg && GameParam.user.status.item[no] > 0) GameParam.user.status.item[no]--;
	}
	else if(info.skill != undefined) {
		let str2 = "";
		for(let i=0;i<3;i++) {
			let ptr = result[i]-GameParam.user.status.skill[i];
			if(ptr > 0 && isMsg) {
				str2 += friend_name_short[i]+"の技力が"+(ptr)+"回復した！\n"
			}
			GameParam.user.status.skill[i] = result[i];
			if(ptr > 0) {
				flg = 1;
				if(callback != undefined) callback(party[i]);
			}
		}
		if(flg && GameParam.user.status.item[no] > 0) GameParam.user.status.item[no]--;
	}
	else if(info.attack_up != undefined) {
		let str2 = "";
		for(let i=0;i<3;i++) {
			let ptr = result[i];
			if(ptr > 0 && isMsg) {
				str2 += friend_name_short[i]+"の攻撃力が上昇した！\n"
			}
			if(ptr > 0) {
				flg = 1;
				if(callback != undefined) callback(party[i]);
				party[i].attack_up += ptr;
			}
		}
		if(flg && GameParam.user.status.item[no] > 0) GameParam.user.status.item[no]--;
	}
	return [flg, str2];
}

//道具
let menu_item = {
	draw:function(active) {
//		let context = canvas.menu.getContext('2d');
//		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
	},
	update:function(select, cursor) {
		if(menu_item.buttons.list.length == 0) return true;
		if(select >= 0) {
			const no = menu_item.buttons.list[menu_item.cursor].param;
			let str = GameParam.user.getName(no)+"を使いますか？\n";
			let flg;
			let str2;
			[flg, str2] = useItemCheck(no, true);

			if(flg == 0) {
				setMessage(str2);
			}
			else {
				setYesNo(str+str2, false, function(){
					sound.play("field_cure");
					[flg,str2] = useItemExec(no, true);
					setMessage(str2);
					createItemMenu();
					return true;
				});
			}
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:320,
		y:70,
		w:200,
		list:[],	//自動生成
	},
	cursor:0,
};

let menu_option = {
	draw:function(active) {
	},
	update:function(select, cursor) {
		switch(select) {
		case 0:
			menu_button.cursor = 0;
			menu_rows = 9;
			frame_top.push(menu_button);
			break;
		case 1:
			menu_config.cursor = 0;
			frame_top.push(menu_config);
			break;
		default:
			break;
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:70,
		y:SUB_Y,
		list:[
			{text:"コントローラ割当", help:"ゲームコントローラーのアサインを設定します"},
			{text:"環境設定", help:"ゲームに関する設定を変更します"},
		],
	},
	cursor:0,
};

let menu_config = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
		{
			let i = 0;
			let x = getButtonX(menu_config.buttons,i);
			let y = getButtonY(menu_config.buttons,i);
			drawFont(context, (menu_config.PerfMode  == 0) ? "軽量":"通常", x+BUTTON_W+5,y+10        , active?"rgb(255,255,255)":"rgb(64,64,64)");
			drawFont(context, (GameParam.Config.TPSMode != 0) ? "有効":"無効", x+BUTTON_W+5,y+10+MENU_H2*1, active?"rgb(255,255,255)":"rgb(64,64,64)");
			drawFont(context, (GameParam.Config.CameraH == 0) ? "通常":"反転", x+BUTTON_W+5,y+10+MENU_H2*2, active?"rgb(255,255,255)":"rgb(64,64,64)");
			drawFont(context, (GameParam.Config.CameraV == 0) ? "通常":"反転", x+BUTTON_W+5,y+10+MENU_H2*3, active?"rgb(255,255,255)":"rgb(64,64,64)");
			drawFont(context, (GameParam.Config.UseItem == 0) ? "移動":"道具使用", x+BUTTON_W+5,y+10+MENU_H2*4, active?"rgb(255,255,255)":"rgb(64,64,64)");
		}
	},
	update:function(select, cursor) {
		switch(select) {
		case 0:
			{
				menu_config.PerfMode = 1-menu_config.PerfMode;
				localStorage.setItem("PerfMode", menu_config.PerfMode);
			}
			break;
		case 1:
			{
				if(GameParam.Config.TPSMode == undefined) GameParam.Config.TPSMode = 1;
				GameParam.Config.TPSMode = 1 - GameParam.Config.TPSMode;
				localStorage.setItem("Config", JSON.stringify(GameParam.Config));
			}
			break;
		case 2:
			{
				GameParam.Config.CameraH = 1 - GameParam.Config.CameraH;
				localStorage.setItem("Config", JSON.stringify(GameParam.Config));
			}
			break;
		case 3:
			{
				GameParam.Config.CameraV = 1 - GameParam.Config.CameraV;
				localStorage.setItem("Config", JSON.stringify(GameParam.Config));
			}
			break;
		case 4:
			{
				GameParam.Config.UseItem = 1 - GameParam.Config.UseItem;
				localStorage.setItem("Config", JSON.stringify(GameParam.Config));
			}
			break;
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:320,
		y:70,
		list:[
			{text:"パフォーマンス", help:"ゲームが重い場合は軽量を選択してください。\n再起動後に有効になります"},
			{text:"TPSモード",  help:"キーボードとマウスで遊べるTPSライクのモードです。\n「無効」にするとマウスポインタのロックをしません。"},//ゲームコントローラを使う場合は不要です。"},
			{text:"カメラ（水平）", help:"カメラ操作の右左を入れ替えます"},
			{text:"カメラ（垂直）", help:"カメラ操作の上下を入れ替えます"},
			{text:"十字ボタンの挙動", help:"アナログスティックのないコントローラの場合「移動」にします"},
		],
	},
	/*window:{
		x:50,
		y:20,
		w:240,
		h:150,
	},*/
	cursor:0,
	PerfMode : GameParam.PerfMode,
	init:function(name) {
	}
};

const assign_name = [
	"enter",
	"cancel",

	"attack1",	//□
	"attack2",	//△
	"attack3",	//○
	"jump",		//×
	"guard",
	"change",
	"pause",

	"up",
	"down",
	"left",
	"right",

	"move_h",	//axes
	"move_v",	//axes
	"camera_h",	//axes
	"camera_v",	//axes
];
/*
	"jump" : 0,		//×
	"attack1" : 2,	//□
	"attack2" : 3,	//△
	"attack3" : 1,	//○
	"guard" : 5,
	"special" : 4,
	"pause" : 9,
	"change" : 8,
	"up"    : 12,
	"down"  : 13,
	"left"  : 14,
	"right" : 15,
*/
const button_warn = "！特殊なゲームコントローラー用の設定です。\n　正常に動いているのであれば特に変更の必要はありません";
	
let menu_button = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
//		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
		context.save();
		context.font = (12*S)+"px 'M PLUS 1p', sans-serif";

		const button_img = GameParam.getButtonImage();
		let y = 30+10;
		for(let i=0;i<assign_name.length;i++) {
			let x = getButtonX(menu_button.buttons,i) + BUTTON_W;
			let y = getButtonY(menu_button.buttons,i) + 10;
			if(GameParam.Assign == null) {
				drawFont(context, "未接続", x,y+3);
			}
			else if(i<13) {
				const no = GameParam.Assign[assign_name[i]];
				drawFont(context, "ボタン"+no, x+38,y+3, "rgb(255,255,255)");
				
				//ボタンアイコン
				if(no >= 0 && no <= 15) {
					const no2 = no;
					const u = (no2% 4) * (256/4);
					const v = (no2>>2) * (256/4);
					context.drawImage(button_img, u,v,(256/4),(256/4), x*S,y*S,32*S,32*S);
				}
			}else{
				const no = GameParam.Assign[assign_name[i]];
				drawFont(context, "スティック"+no, x+38,y, "rgb(255,255,255)");
				//スティックアイコン
				if(no >= 0 && no <= 3) {
					const u = ((no<=1)?2:3) * (256/4);
					const v = 2 * (256/4);
					context.drawImage(button_img, u,v,(256/4),(256/4), x*S,y*S,32*S,32*S);
				}
			}
			y += MENU_H2;
		}
		context.restore();
	},
	update:function(select, cursor) {
		if(GameParam.Assign) {
			if(select == menu_button.buttons.list.length-1) {	//リセット
				GameParam.resetDefaultGamePadAssign(GameParam.Assign.index);
			}
			else if(select >= 0) {
				menu_input.cursor = 0;
				frame_top.push(menu_input);	//入力待ち
				key_count = 30;
			}
		}
		if(InputOnes.cancel || Input.clickR) {
			if(GameParam.Assign) {
				let json = JSON.stringify(GameParam.Assign);
				localStorage.setItem("Assign",json);
			}
			return true;
		}
		return false
	},
	buttons:{
		x:310,
		y:30,
		w:320,
		list:[
			{text:"決定", },		//0
			{text:"キャンセル", },	//1

			{text:"武術１", },		//2
			{text:"武術２", },
			{text:"武術３", },
			{text:"ジャンプ", },
			{text:"防御／縮地", },
			{text:"キャラ切り替え", },
			{text:"ポーズメニュー", },

			{text:"上", help:button_warn },	//9
			{text:"下", help:button_warn },
			{text:"左", help:button_warn },
			{text:"右", help:button_warn },

			{text:"移動左右", help:button_warn },	//13
			{text:"移動上下", help:button_warn },
			{text:"カメラ左右", help:button_warn },
			{text:"カメラ上下", help:button_warn },

			{text:"デフォルトに戻す", },	//17
		],
	},
	cursor:0,
};

let menu_input = {
	draw:function(active) {
	},
	update:function(select, cursor) {

		let button = -1;
		let axes_idx = -1;
		let axes_val = 0.6;
		if(navigator.getGamepads){
			let gamepad_list = navigator.getGamepads();

			if(gamepad_list && gamepad_list.length > 0) {
				for(let i=0;i<gamepad_list.length;i++) {
					let gamepad = gamepad_list[i];
					if(!gamepad || !gamepad.connected) {
						continue;
					}
					//押したボタンの判定
					if(gamepad.buttons) {
						for(let j=0;j<gamepad.buttons.length;j++) {
							if(gamepad.buttons[j].pressed) {
								button = j;
								GameParam.Assign.index = i;
							}
						}
					}
					if(gamepad.axes && gamepad.axes.length > 0) {
						for(let j=0;j<gamepad.buttons.length && j<9;j++) {
							const ax = Math.abs(gamepad.axes[j]);
							if(axes_val < ax) {	//最も入力の大きい
								axes_idx = j;
								axes_val = ax;
								GameParam.Assign.index = i;
							}
						}
					}
				}
			}
		}
		
		if(key_count == 0) {
			if(menu_button.cursor <= 9) {
				if(button >= 0) {
					const current = assign_name[menu_button.cursor];
					let st;
					let en;
					if(menu_button.cursor <= 1) {
						//決定・キャンセル
						st = 0;
						en = 1;
					}
					else {	//攻撃ボタンなどレバー以外
						st = 2;
						en = 8;
					}
					//同じ番号なら入れ替え
					for(let i=st;i<=en;i++) {
						const k = assign_name[i];
						if(k != current && GameParam.Assign[k] == button) {
							GameParam.Assign[k] = GameParam.Assign[current];
						}
					}
					
					//アサイン情報に反映
					GameParam.Assign[current] = button;
					key_count = 30;
					return true;
				}
			}
			else {
				if(axes_idx >= 0) {
					const current = assign_name[menu_button.cursor];

					let st = 9;
					let en = st+7;
					//同じ番号なら入れ替え
					for(let i=st;i<=en;i++) {
						const k = assign_name[i];
						if(k != current && GameParam.Assign[k] == axes_idx) {
							GameParam.Assign[k] = GameParam.Assign[current];
						}
					}

					GameParam.Assign[current] = axes_idx;
					key_count = 30;
					return true;
				}
			}
		}
		//キーで出られるようにする
		return false;
	},
	buttons:{
		x:320,
		y:70,
		list:[],
	},
	cursor:0,
};

let menu_chara = {
	draw:function(active) {
	},
	update:function(select, cursor) {
		if(select >= 0) {
			switch(menu_top.cursor) {
			case 0:
				//道具
				break;
			case 1:
				//戦闘術
				menu_attack_assign.cursor = 0;
				updateAttackAssign();
				frame_top.push(menu_attack_assign);
				break;
			case 2:
				//技
				menu_skill.cursor = 0;
				menu_rows = 10;
				updateMenuSkill();
				frame_top.push(menu_skill);
				break;
			}
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:70,
		y:SUB_Y,
		list:[
			{text:"脇山珠美", },
			{text:"浜口あやめ", },
			{text:"道明寺歌鈴", },
		],
	},
	cursor:0,
};
function updateMenuSkill() {
	//一覧を作る
	let list = [];
	const org = GameParam.user.getSkillList(menu_chara.cursor, true);	//持っている技すべて
	for(let k in org) {
		const info = GameParam.user.getInfo(k);
		let suffix;
		if(org[k] == 0) suffix = "未取得";
		else if(org[k] == info.max) suffix = "皆伝";
		else suffix = org[k]+"/"+info.max+"段"

		list.push({
			text:GameParam.user.getName(k),
			suffix:suffix,
			help:info.str,
			param:k,
		});
	}
	menu_skill.buttons.list = list;
}

function updateAttackAssign() {
	menu_attack_assign.buttons.list = [];
	for(let i=0;i<3;i++) {
		const no = GameParam.user.getAttackAssign(menu_chara.cursor,i);
		menu_attack_assign.buttons.list.push({
			text:(no <= 0) ? "なし" : GameParam.user.getName(no),
//			suffix:(no <= 0) ? "" : GameParam.user.getInfo(no).str,
			help:(no <= 0) ? "" : GameParam.user.getInfo(no).str,
		});
	}
}

//装備スロットの選択
let menu_attack_assign = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
		drawFont(context, "ボタン割り当て", 300,50, "rgb(255,255,255)");
		for(let i=0;i<3;i++) {
			drawBtn(context, "attack"+(i+1), 300,50+MENU_H2*(i+1));
			drawFont(context, "武術"+(i+1), 340,50+MENU_H2*(i+1), "rgb(255,255,255)");
		}
		if(active) {
			drawFont(context, "変更不可", 605,50+MENU_H2*1, "rgb(192,32,32)");
		}
	},
	update:function(select, cursor) {
		if(select > 0) {	//0は変更不可
			//一覧を作る
			const org = GameParam.user.getSkillList(menu_chara.cursor, false);
			let list = [];
			list.push({text:"なし",param:0});	//外せるように
			for(let k in org) {
				if(k % 10 == 0) continue;	//通常
				list.push({
					text:GameParam.user.getName(k),
//					suffix:org[k]+"段",
					suffix:(org[k]==0)?"未取得":null,
					help:GameParam.user.getInfo(k).str,
					param:k,
				});
			}
			if(list.length > 1) {	//なければ何もしない
				menu_battle_select.buttons.list = list;
				menu_battle_select.cursor = 0;
				frame_top.push(menu_battle_select);
			}
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:400,
		y:40+MENU_H2,
		list:[],
	},
	cursor:0,
};

//持っている武術の選択
let menu_battle_select = {
	draw:function(active) {
	},
	update:function(select, cursor) {
		if(select >= 0) {
			const no = menu_battle_select.buttons.list[select].param;

			const info = GameParam.user.getInfo(no);
			if(no > 0) {
				const lv = GameParam.user.status.skill_assign[menu_chara.cursor][no];
				if(lv == 0) {	//段位０
					setMessage("装備するには「強化」で会得する必要があります", true);
					return true;
				}
			}
			
			const i1 = menu_attack_assign.cursor;
			if(i1 > 0 && no > 0) {
				//もし他と被っていれば入れ替え
				const i2 = 3-i1;
				if (GameParam.user.getAttackAssign(menu_chara.cursor,i2) == no) {
					GameParam.user.setAttackAssign(menu_chara.cursor,i2, GameParam.user.getAttackAssign(menu_chara.cursor,i1));
				}
			}
			GameParam.user.setAttackAssign(menu_chara.cursor,i1, no);
			updateAttackAssign();
			sound.play("menu_equip");
			return true;
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:600,
		y:40+MENU_H2,
		list:[],
	},
	cursor:0,
};

let menu_skill = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
		for(let i=0;i<menu_skill.buttons.list.length;i++) {
			let x = getButtonX(menu_skill.buttons,i);
			let y = getButtonY(menu_skill.buttons,i);
			if(GameParam.user.getInfo(menu_skill.buttons.list[i].param).type == 1) {
				drawFont(context, "特 技", x-50,y+10, active?"rgb(192,192,64)":"rgb(96,96,0)");
			}
			else {
				drawFont(context, "武 術", x-50,y+10, active?"rgb(192,64,192)":"rgb(96,0,96)");
			}
			if(i%menu_rows==0)
				drawFont(context, "消費霊魂", x+BUTTON_W-15,y+15-MENU_H2, active?"rgb(255,255,255)":"rgb(64,64,64)");
			const cost = GameParam.user.getInfo(menu_skill.buttons.list[i].param).cost;
			if(cost != undefined) {
				if(menu_skill.buttons.list[i].suffix != "皆伝") {
					drawFont(context, cost, x+BUTTON_W+5,y+10, active?"rgb(255,255,255)":"rgb(64,64,64)");
				}
			}
		}
		const x = 1000;
		const y = 10;
		drawWindow(context, x, y, x+155,y+40, 1.0);
		drawFont(context, "所持霊魂:"+GameParam.user.status.cost_point, x+10,y+8, active?"rgb(0,0,0)":"rgb(128,128,128)");
	},
	update:function(select, cursor) {
		if(select >= 0) {
			const no = menu_skill.buttons.list[select].param;
			const lv = GameParam.user.status.skill_assign[menu_chara.cursor][no];
			if(lv < GameParam.user.getInfo(no).max) {
				const cost = GameParam.user.getInfo(no).cost;
				menu_training.buttons.list[0].suffix = cost;
				menu_training.cursor = 0;
				frame_top.push(menu_training);
			}
			else {
				setMessage("これ以上段位を上げられません");
			}
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:340,
		y:90,
		w:350,
		list:[],	//自動生成
	},
	cursor:0,
};

//強化確認
let menu_training = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
		const x = menu_training.buttons.x;
		const y = menu_training.buttons.y-165;
		const no = menu_skill.buttons.list[menu_skill.cursor].param;
		const info = GameParam.user.getInfo(no);

		drawWindow(context, x-20, y, x+220,y+MENU_H*10.5, 1.0);
		const lv = GameParam.user.status.skill_assign[menu_chara.cursor][no];
		if(lv == 0) {
			drawFont(context, GameParam.user.getName(no)+"\n を会得します", x+10,y+20);
		}
		else {
			drawFont(context, GameParam.user.getName(no)+"\n を強化します", x+10,y+20);
			drawFont(context, "段位 ", x+10,y+20+MENU_H*2.5);

			let str = lv+"段→"+(lv+1)+"段";
			drawFont(context, str, x+BUTTON_W-context.measureText(str).width-10,y+20+MENU_H*2.5);
		}

		let str = GameParam.user.status.cost_point;
		drawFont(context, "所持霊魂", x+10,y+20+MENU_H*4);
		drawFont(context, str, x+BUTTON_W-context.measureText(str).width-10,y+20+MENU_H*4);
	},
	update:function(select, cursor) {
		if(select >= 0) {
			if(select == 0) {
				const no = menu_skill.buttons.list[menu_skill.cursor].param;
				const lv = GameParam.user.status.skill_assign[menu_chara.cursor][no];
				const cost = GameParam.user.getInfo(no).cost;
				let str;
				if(GameParam.user.status.cost_point >= cost) {
					str = GameParam.user.getName(no);
					if(lv == 0) {
						str += "を会得しました！";
					}
					else {
						str += "の段位が上がった！";
					}
//					GameParam.user.status.skill_assign[menu_chara.cursor][no] += 1;
					GameParam.user.addSkill(menu_chara.cursor, no, 1);
					GameParam.user.status.cost_point -= cost;
					sound.play("menu_skillup");

					updateMenuSkill();
				}
				else {
					str = "霊魂が足りません";
				}
				setMessage(str, true);
			}
			return true;
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
//		x:420,
		x:(1200-220)/2,
		y:240,
		list:[
			{text:"消費霊魂"},
			{text:"やめる"},
		],
	},
	cursor:0,
};

let menu_title = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		context.clearRect(0,0,canvas.menu.width,canvas.menu.height);
	},
	update:function(select, cursor) {
		switch(select) {
		case 0:
			sound.stop("ONES");
			sound.play("menu_load");
			if(storageLoad(0, false)) {
				GameParam.stopGame();
				GameParam.startMapMove(function(){
					GameParam.restartGame();
					menu_exit = true;
				});
			}
			break;
		case 1:
			menu_slot.init("title");
			menu_slot.cursor = 0;
			frame_top.push(menu_slot);
//			return true;
			break;
		case 2:	//オプション
			menu_button.cursor = 0;
			menu_rows = 9;
			frame_top.push(menu_option);
			break;
		default:
			break;
		}
		return false;
	},
	buttons:{
		x:70,
		y:40,
		list:[
			{text:"始めから", help:""},
			{text:"続きから", help:""},
			{text:"オプション", help:""},
		],
	},
	cursor:0,
};


let menu_travel = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
	},
	update:function(select, cursor) {
		if(select >= 0) {
			const list = menu_travel.buttons.list[select];
			setYesNo("移動しますか？",false, function(){
				GameParam.orderMapMove(list.mapno, list.mapno+list.prev, true);
				menu_exit = true;
				return true;
			});
//			return true;
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:320,
		y:70,
		w:200,
		list:[],
	},
	cursor:0,
};

function setMessage(str, back, callback) {
	msg_str = str;
	if(msg_str[msg_str.length-1] == "\n") {
		msg_str = msg_str.substr(0,msg_str.length-2);	//末尾の改行
	}
	menu_message.buttons.list = [];
	menu_message.cursor = 0;
	menu_message.callback = callback;
	if(back != undefined && back) {
		frame_top.splice(frame_top.length-1,0,menu_message);	//最後に追加すると消されてしまうので、この画面の１個前に追加
	}else{
		menu_message.cursor = 0;
		frame_top.push(menu_message);
	}
}
function setYesNo(str, back, callback) {
	msg_str = str;
	menu_message.buttons.list = [
		{text:"はい"},
		{text:"いいえ"},
	];
	menu_message.cursor = 0;
	menu_message.callback = callback;
	if(back != undefined && back) {
		frame_top.splice(frame_top.length-1,0,menu_message);	//最後に追加すると消されてしまうので、この画面の１個前に追加
	}else{
		menu_message.cursor = 0;
		frame_top.push(menu_message);
	}
	key_count = 15;
}

let msg_str;
let menu_message = {
	draw:function(active) {
		let context = canvas.menu.getContext('2d');
		context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";
		let h = 80 + (menu_message.buttons.list.length ? (MENU_H2*2+20) : 0);
		for(let c of msg_str) {
			if(c == "\n") h += FONT_SIZE;	//改行数
		}
//		menu_message.buttons.y = (512-80-MENU_H2*2)/2+60;
		const x = (canvas.menu.width /S-400)/2;
		const y = (canvas.menu.height/S-h  )/2;

		drawWindow(context, x-20, y, x+420,y+h, 1.0);
		drawFont(context, msg_str, TEXT_CENTER,y+30);
	},
	update:function(select, cursor) {
		if(menu_message.buttons.list.length == 0) {
			if(InputOnes.enter) return true;
		}
		else {
			if(select == 0) {	//はい
				if (menu_message.callback != undefined) {
					return menu_message.callback();
				}
			}
			if(select > 0) {
				return true;
			}
		}
		return InputOnes.cancel || Input.clickR;
	},
	buttons:{
		x:(1200-BUTTON_W)/2,
		y:(1200/16*9-80-MENU_H2*2)/2+75,
		list:[],
	},
	cursor:0,
//	callback:null,
};


var menuRect;

function setPoint(x,y, ms_click) {
	if(menuRect == undefined) return ms_click;
	if(frame_top.length == 0) return ms_click;

	x = (x- menuRect[0]) * canvas.menu.width  / menuRect[2];
	y = (y- menuRect[1]) * canvas.menu.height / menuRect[3];
	
	let frame = frame_top[frame_top.length-1];
	for(let i=0;i<frame.buttons.list.length;i++) {
		let sx = getButtonX(frame.buttons, i) * S;
		let sy = getButtonY(frame.buttons, i) * S;
		if(sx < x && sy < y && sx+BUTTON_W * S > x && sy+(MENU_H2+5) * S > y) {
			frame.cursor = i;
			return ms_click;	//ms_clickを保持
		}
	}
	if(ms_click == 1) {	//外側を左クリック＝キャンセルに変換
		return 3;
	}
	return ms_click;	//ms_clickを保持
}

function setRect(x,y,w,h) {
	menuRect = [x,y,w,h];
}

function start() {
	if(frame_top.length != 0) return;
	//トップメニュー
	menu_top.cursor = 0;
	frame_top.push(menu_top);
	key_count = 15;

	//宝箱回収率を取得
	let current,max;
	[current,max] = GameParam.getItemBoxCount();
	if(max == 0) {
		menu_top.itembox_cnt = -1;
	}
	else {
		menu_top.itembox_cnt = Math.round(current/max*100);
	}
}

function title() {
	if(frame_top.length != 0) return;
	//トップメニュー
	menu_title.cursor = 0;
	frame_top.push(menu_title);
	key_count = 15;
}

//メニュー共通
function updateFrame(frame) {
	let enter = -1;
	if(cur_count == 0 && frame.buttons.list.length > 0 && !menu_exit) {
		let x = Math.floor(frame.cursor/menu_rows);
		let y = Math.floor(frame.cursor%menu_rows);
		const w = Math.floor(frame.buttons.list.length / menu_rows);
		const h = (x < w) ? menu_rows : (frame.buttons.list.length % menu_rows);
		if(Input.up) {
			if(--y < 0) y = h-1;
			cur_count = 10;
		}
		if(Input.down) {
			if(++y >= h) y = 0;
			cur_count = 10;
		}
		if(Input.right) {
			if(++x > w) x = 0;
			cur_count = 10;
		}
		if(Input.left) {
			if(--x < 0) x = w;
			cur_count = 10;
		}
		if(cur_count > 0) {
			const c = x * menu_rows + y;
			frame.cursor = c;
			if(frame.cursor < 0) frame.cursor = 0;
			if(frame.cursor >= frame.buttons.list.length) frame.cursor = frame.buttons.list.length-1;
			if(frame.cursor != c) sound.play("menu_cursor");
		}
		if(InputOnes.enter || Input.clickL) {
			enter = frame.cursor;
			cur_count = 10;
			sound.play("menu_enter");
		}
	}
	if(menu_exit || frame.update(enter, frame.cursor)) {
		if(InputOnes.cancel || Input.clickR) {
			sound.play("menu_cancel");
		}
		frame_top.pop();	//末端（現在アクティブ）のframeを削除
	}
}
function drawFrame(frame, active) {
	let context = canvas.menu.getContext('2d');
	context.font = FONT_SIZE+"px 'M PLUS 1p', sans-serif";

	if (frame.draw != null) {
		frame.draw(active);
	}
	const w = frame.window;
	if(w) {
		//汎用ウィンドウ
		drawWindow(context, w.x, w.y, w.w, w.h, 1.0);
	}

	
	const b = frame.buttons;
	if(b.list.length > 0) {
		let c = Math.floor(Math.sin(GameParam.count/1%60/60*Math.PI)*255);
		//ボタン下地
		for(let i=0;i<b.list.length;i++) {
			let sx = getButtonX(frame.buttons, i);
			let sy = getButtonY(frame.buttons, i);
			drawButton(context, sx, sy, sx+BUTTON_W, sy+16+MENU_H, (active || (i == frame.cursor))? 1.0 : 0.5 );
		}


		for(let i=0;i<b.list.length;i++) {
			let sx = getButtonX(frame.buttons, i);
			let sy = getButtonY(frame.buttons, i);
			const active2 = active || (i == frame.cursor);
			if(i == frame.cursor) {
				//カーソル
				drawCursor(context, sx, sy, sx+BUTTON_W, sy+16+MENU_H, active);
				//ヘルプテキスト
				if(b.list[i].help != undefined && active) {
					drawFont(context, b.list[i].help, 270, canvas.menu.height/S-80,"rgb(255,255,255)");
				}
			}
			//ボタン文字
			drawFont(context, b.list[i].text, sx+10, sy+10, active2?undefined:"rgb(64,64,64)");
			if(b.list[i].suffix != undefined) {
				const fontWidth  = context.measureText(b.list[i].suffix).width/S;
				drawFont(context, b.list[i].suffix, sx+BUTTON_W-fontWidth-10, sy+10, active2?undefined:"rgb(128,128,128)");
			}
		}
	}
}
//gameから呼ばれる
function update() {
	
	if(cur_count > 0) cur_count--;
	if(key_count > 0) {
		InputOnes.enter = InputOnes.cancel = Input.clickR = Input.clickL = false;
		key_count--;
	}
	if(frame_top.length > 0) {
		updateFrame(frame_top[frame_top.length-1]);

		/*if(frame_top.length > 0) {
			if(frame_top[frame_top.length-1].buttons.list.length > 0) {
				if(InputOnes.cancel && key_count == 0) {	//×
					key_count = 10;
					frame_top.pop();	//末端（現在アクティブ）のframeを削除
				}
			}
		}*/
		if(frame_top.length != 0) {
			if(InputOnes.enter || InputOnes.cancel || Input.clickR || Input.clickL) {
				key_count = 10;
			}
		}
	}
	else if(key_count == 0) {
		menu_exit = false;
		return true;
	}
	
	return false;
}
function draw() {
	if(menu_exit) return;
	for(let i=0;i<frame_top.length;i++) {
		drawFrame(frame_top[i], i == (frame_top.length-1));
	}
}

//汎用
function drawFont(context, text, x, y, color, spc) {
	context.save();
	if(color == undefined) {
		context.lineWidth = 1;
//		context.strokeStyle = "rgb(255,255,255)";
		context.strokeStyle = "rgb(64,64,64)";
		context.fillStyle = "rgb(32,32,32)";
	}
	else {
		context.lineWidth = 1;
		context.strokeStyle = "rgb(64,64,64)";
		context.fillStyle = color;
	}

	let textList = (new String(text)).split('\n');
	if(x == TEXT_CENTER) {	//センター寄せ
		let w = 0;
		for(let i=0;i<textList.length;i++) {
			w = Math.max(w, context.measureText(textList[i]).width);
		}
		x = (context.canvas.width - w) / 2;
	}
	else {
		x *= S;
	}
	y *= S;

	const font_h = context.measureText("A").actualBoundingBoxAscent * 1.38;
	for(let i=0;i<textList.length;i++) {
		y += font_h;
		context.strokeText(textList[i],x,y);
		context.fillText(textList[i],x,y);
		y += ((spc == undefined) ? 1 : spc*S);
	}

	context.restore();
}

/*
function drawWindow(context, lx,ly,rx,ry, color, line_color, thin) {
	lx *= S;
	ly *= S;
	rx *= S;
	ry *= S;

//	let pattern = context.createPattern(GameParam.getCanvasImage("window"), 'no-repeat');

	context.save();
	if(0) {
		const rnd = 10*S;
		const rh = rnd/2;
		lx += rnd+3*S;
		ly += rnd+3*S;
		rx -= rh+3*S;
		ry -= rh+3*S;

		context.fillStyle = (color == undefined) ? "rgba(0,0,255,0.5)" : color;
		context.beginPath();
		context.arc(lx,ly+rh, rnd, Math.PI*1.0, Math.PI*1.5);
		context.arc(rx-rh,ly+rh, rnd, Math.PI*1.5, Math.PI*2.0);
		context.arc(rx-rh,ry-rh, rnd, Math.PI*0.0, Math.PI*0.5);
		context.arc(lx,ry-rh, rnd, Math.PI*0.5, Math.PI*1.0);
		context.fill();

		context.lineWidth = (thin == undefined) ? 2 : thin;
		context.strokeStyle = (line_color == undefined) ? "rgba(0,0,128,0.75)" : line_color;
		context.beginPath();
		context.arc(lx,ly+rh, rnd, Math.PI*1.0, Math.PI*1.5);
		context.arc(rx-rh,ly+rh, rnd, Math.PI*1.5, Math.PI*2.0);
		context.arc(rx-rh,ry-rh, rnd, Math.PI*0.0, Math.PI*0.5);
		context.arc(lx,ry-rh, rnd, Math.PI*0.5, Math.PI*1.0);
		context.lineTo(lx-rnd,ly+rh);
		context.stroke();
	}
	else {
		//和紙ウィンドウ
		const rh = 5*S;
		rx -= rh;
		ry -= rh;
		lx += rh;
		ly += rh;

		context.drawImage(GameParam.getCanvasImage("window"), 0,0,512,512, lx,ly,rx-lx,ry-ly);
	}
	
	context.restore();
}
*/
function drawWindow(context, lx,ly,rx,ry, alpha) {
	lx *= S;
	ly *= S;
	rx *= S;
	ry *= S;

//	let pattern = context.createPattern(GameParam.getCanvasImage("window"), 'no-repeat');

	context.save();
	if(0) {
		const rnd = 10*S;
		const rh = rnd/2;
		lx += rnd+3*S;
		ly += rnd+3*S;
		rx -= rh+3*S;
		ry -= rh+3*S;

		context.fillStyle = (color == undefined) ? "rgba(0,0,255,0.5)" : color;
		context.beginPath();
		context.arc(lx,ly+rh, rnd, Math.PI*1.0, Math.PI*1.5);
		context.arc(rx-rh,ly+rh, rnd, Math.PI*1.5, Math.PI*2.0);
		context.arc(rx-rh,ry-rh, rnd, Math.PI*0.0, Math.PI*0.5);
		context.arc(lx,ry-rh, rnd, Math.PI*0.5, Math.PI*1.0);
		context.fill();

		context.lineWidth = 1;//(thin == undefined) ? 2 : thin;
		context.strokeStyle = (line_color == undefined) ? "rgba(0,0,128,0.75)" : line_color;
		context.beginPath();
		context.arc(lx,ly+rh, rnd, Math.PI*1.0, Math.PI*1.5);
		context.arc(rx-rh,ly+rh, rnd, Math.PI*1.5, Math.PI*2.0);
		context.arc(rx-rh,ry-rh, rnd, Math.PI*0.0, Math.PI*0.5);
		context.arc(lx,ry-rh, rnd, Math.PI*0.5, Math.PI*1.0);
		context.lineTo(lx-rnd,ly+rh);
		context.stroke();
	}
	else {
		//和紙ウィンドウ
		const rh = 5*S;
//		lx -= rh;
//		ly -= rh;
//		rx += rh;
//		ry += rh;

		context.drawImage(GameParam.getCanvasImage("window"), 0,0,512,512, lx,ly,rx-lx,ry-ly);
	}
	
	context.restore();
}

function drawButton(context, lx,ly,rx,ry, alpha) {
	lx *= S;
	ly *= S;
	rx *= S;
	ry *= S;

	context.save();
	const rh = 5*S;
	rx -= rh;
	ry -= rh;
	lx += rh;
	ly += rh;
	context.globalAlpha = alpha;

	context.drawImage(GameParam.getCanvasImage("button"), 0,0,512,64, lx,ly,rx-lx,ry-ly);
	
	context.restore();
}

var cursor_cnt = 0;
function drawCursor(context, lx,ly,rx,ry, active) {
	lx *= S;
	ly *= S;
	rx *= S;
	ry *= S;

	context.save();
	const rh = 5*S;
	rx -= rh;
	ry -= rh;
	lx += rh;
	ly += rh;

	const s2 = 25*S;
	const img = GameParam.getCanvasImage("cursor");
	context.globalAlpha = 1.0;
	context.drawImage(img, 0,160*0,640,160, lx-s2,ly-s2,(rx-lx)+s2*2,(ry-ly)+s2*2);
	context.globalAlpha = active ? (Math.sin(cursor_cnt/60*Math.PI)+1.0)/2.0 : 1.0;
	context.drawImage(img, 0,160*1,640,160, lx-s2,ly-s2,(rx-lx)+s2*2,(ry-ly)+s2*2);
	
	context.restore();
	if(active) {
		cursor_cnt++;
		if(cur_count >= 10) cursor_cnt = 30;
	}
}

function drawBtn(context, name, x,y, name_key) {
	const button_img = GameParam.getButtonImage();
	if(GameParam.Assign != null) {
		const no = GameParam.Assign[name];
		if(no != undefined && no >= 0 && no <= 15) {
			const u = (no% 4) * (256/4);
			const v = (no>>2) * (256/4);
			context.drawImage(button_img, u,v,(256/4),(256/4), x*S,y*S,38*S,38*S);
			return;
		}
	}
	//ボタンが出せない場合キーを表示
	if(name_key != undefined) {
		drawFont(context, "["+name_key+"]",x,y, "rgb(255,255,255)");
	}
}


scope.start = start;
scope.update = update;
scope.draw = draw;
scope.drawFont = drawFont;
scope.drawWindow = drawWindow;
scope.setPoint = setPoint;
scope.setRect = setRect;
scope.setCanvas = setCanvas;
scope.title = title;
scope.init = init;
scope.saveMapping = saveMapping;
scope.loadMapping = loadMapping;
scope.quickSave = quickSave;
scope.setYesNo = setYesNo;
scope.useItemCheck = useItemCheck;
scope.useItemExec = useItemExec;
scope.drawBtn = drawBtn;
};


Menu.prototype = Object.create(null);
Menu.prototype.constructor = Menu;

export { Menu };

