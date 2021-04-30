import { Data } from './Data.js';
import { Battle } from './battle.js';
import { Sound } from './sound.js';
import { Menu } from './menu.js';

var Event = function (options) {
	var scope = this;
	var GameParam = options.GameParam;
	var sound = options.sound;
	var Input = options.Input;
	var InputOnes = options.InputOnes;
	var btl = options.Battle;
	var menu = options.Menu;
//	var image_icons = options.image_icons;

	let S = options.MenuScale;

	var message = {
		caption : "",
		lists : null,
		index : 0,
		count : 0,
	};
	const messageSpeed = 0.2;

	var event = {
		task : null,
		
		index : 0,
		stat : 0,
		count : 0,
		default_dir : 0,
		camera_enable : false,
	//	camera_chara : null,
		camera : null,
	};

var canvas;
function setCanvas(_canvas, scale) {
	canvas = _canvas;
	S = scale;
}

function start(task) {
	message.lists = null;
	event.task = task;
	event.index = 0;
	event.stat  = "init";
	event.count = 0;
	event.camera_enable = false;
	GameParam.GamePause = "event";
	btl.actionResetAll();
}

//特定の地点まで歩かせる簡易関数
function eventWalk(p, pos, rotation) {
	let x = pos.x - p.mesh.position.x;
	let z = pos.z - p.mesh.position.z;
	let r = Math.atan2(x,z);
	let l = Math.sqrt(x*x+z*z);
	if(l < 0.1) {
		p.walk_pow = 0;
		if(rotation) {
			//回転
			let r = Number(rotation);
			if(isNaN(r)) {	//特定の相手を見る
				const p2 = btl.get(rotation);
				if(p2) {
					x = p2.mesh.position.x - p.mesh.position.x;
					z = p2.mesh.position.z - p.mesh.position.z;
					r = Math.atan2(x,z);
				}
				else {
					r = p.mesh.rotation.y + Math.PI;
				}
			}
			
			//向き変更
			p.dir_lock = false;	//
			p.move_dir = r;
			//終わればtrue
			const off = btl.getNearRotation(p.mesh.rotation.y, r + Math.PI) - p.mesh.rotation.y;
			if(Math.abs(off) < 0.06) {
				return true;
			}
		}
		else {
			return true;
		}
	}
	else {
		//歩いて近づく
//		btl.Walk(p, r, 1.0);
		p.move_dir = r;
		p.walk_pow = (l > 0.3) ? 1.0 : 0.5;
	}
	return false;
}

const SEQ_EVENT_TALK = 20;
const FLAG_EVENT_MOVE = (1<<6);	//イベント用

function eventMoveInit(task) {
	const p = btl.get(task.owner);
	if(p) {
		p.flag |= FLAG_EVENT_MOVE;
//		p.physicsBody.collisionFilterGroup = 1;	//引っかからないようにするため地面以外の当たりを消す

		//同期処理にするためタイマーイベントを発行
		let pos;
		let rot = task.rotation;
		//移動先の座標
		if(task.point != undefined) {	//イベントポイント
			const ptr = GameParam.getEventPoint(task.point);
			pos = ptr.pos;
			if(rot == undefined) rot = ptr.rot;
		}
		else if(task.base != undefined) {	//キャラ中心
			pos = btl.get(task.base).mesh.position.clone();
		}
		else if(task.position != undefined) {	//絶対位置
			pos = task.position.clone();
		}
		else {
			pos = p.mesh.position.clone();
		}
		if(task.offset) {	//相対位置
			pos.add(task.offset);
		}
		btl.setTimerEvent(
			"event",
			60*8,
			function() {
				return eventWalk(p, pos, rot);
			},
			function() {
//				p.physicsBody.collisionFilterGroup = p.physicsBody.collisionFilterMask;
				p.walk_pow = 0;
				p.flag &= ~FLAG_EVENT_MOVE;
			}
		);
	}
}
function eventMoveUpdate(task) {
	return true;
}
//会話イベントの準備
function eventMeetingInit(task) {

	//会話主（NPC）の視線の先に3人を展開
	const owner = btl.get(task.owner);
	let base_pos = owner.mesh.position.clone();
	const S = task.distance;
	const r = owner.mesh.rotation.y + Math.PI;
	base_pos.add( new THREE.Vector3(Math.sin(r)*S,0,Math.cos(r)*S) );	//ベース

	const rt = [ 0, 0.9, 1.8 ];	//配置角

	for(let i=0;i<3;i++) {
		const p = btl.get(i);
		p.sequence = 0;
		p.flag |= FLAG_EVENT_MOVE;
//		p.physicsBody.collisionFilterGroup = 1;	//引っかからないようにするため地面以外の当たりを消す
//		p.physicsBody.collisionFilterMask = 1;

		//同期処理にするためタイマーイベントを発行
		let pos = base_pos.clone();

		const S = task.distance;
		const r = owner.mesh.rotation.y + Math.PI + rt[i];
		pos.add( new THREE.Vector3(Math.sin(r)*S,0,Math.cos(r)*S) );	//ベース
		
		btl.setTimerEvent(
			"event",
			-1,
			function() {
				return eventWalk(p, pos, task.owner);
			},
			function() {
//				p.physicsBody.collisionFilterGroup = 2;
//				p.physicsBody.collisionFilterMask = 1|2;
				p.flag &= ~FLAG_EVENT_MOVE;
			}
		);
	}
}
function eventMeetingUpdate(task) {

	//終わるまで待つ
	return (!btl.checkEventMove());	//まだ動いている人がいないか
}

function eventTalkInit(task) {
	message.caption = (task.unknown != undefined) ? "？？？" : Data.CharaName[ task.owner ];
	message.index = 0;
	event.count = 0;
	if(task.owner != undefined) {
		let p = btl.get(task.owner);
		event.default_dir = p.move_dir;
		
		if(task.target) {
			const p2 = btl.get(task.target);
			if(p2) {
				const x = p2.mesh.position.x - p.mesh.position.x;
				const z = p2.mesh.position.z - p.mesh.position.z;
				//向き変更
				p.move_dir = Math.atan2(x,z);
				p.dir_lock = false;
			}
		}
		if(task.look) {
			p.look = task.look;
		}
	}
}
function eventTalkUpdate(task) {
	
	const p = btl.get(task.owner);
//	if(message.count == 0) event.count = 30
	if(event.count < 30 && ++event.count == 30) {
		if(task.callback != null)
			message.lists = task.callback();
		else
			message.lists = task.text;
		message.count = 0;
		//ui_needsUpdate = true;

		if(p && task.silent == undefined) {
			p.count = -15;
			p.sequence = SEQ_EVENT_TALK;
		}
	}
	if(p) {
		if(event.camera_enable) {
			//camera用timerの後で上書きされる
			event.camera.target.copy( p.mesh.position );
			event.camera.target.y += 1;
		}

		//おしゃべり
		if(message.lists) {
			const str = message.lists[message.index];
			if(p.count > Math.floor(str.length/2)*20) {
				p.sequence = 0;
			}
		}
	}
	if(message.lists) {
		return updateMessage();
	}
	return false;
}
function eventTalkEnd(task) {
	const p = btl.get(task.owner);
	if(p) {
		//ui_needsUpdate = true;
		p.sequence = 0;
		p.look = null;
		if(task.reset_dir != undefined) {
			btl.get(task.owner).move_dir = event.default_dir;
		}
	}
}

function eventWaitInit(task) {
	event.count = (task.count != undefined) ? task.count : 0;
}
function eventWaitUpdate(task) {
	if(event.count > 0) {
		event.count--;
	}
	else {
		if(task.chara == true) {
			if(!btl.checkEventMove()) {	//まだ動いている人がいないか
				return true;
			}
		}
		else {
			return true;
		}
	}
	return false;
}

function eventCameraInit(task) {
	if(task.disable == undefined || task.disable == false) {
		event.camera_enable = true;
		event.camera = {
			target  : new THREE.Vector3(),
			eye     : new THREE.Vector3(),
			rotation: new THREE.Vector3(),
			zoom: 1,
			fov : 50,
			rate: 1.25,
		};
	}
	else {
		//カメラ解除
		event.camera_enable = false;
		btl.clearTimerEvent("event_camera_infinity");
		btl.clearTimerEvent("event_camera");
	}
}
function eventCameraUpdate(task) {
	if(!event.camera_enable) return true;
	btl.clearTimerEvent("event_camera_infinity");	//古いのを消す
	btl.setTimerEvent(
		(task.chase == undefined) ? "event_camera" : "event_camera_infinity",
		-1,		//永続・実質スレッド
		function() {
			//イベントの間ずっとカメラ位置を更新
			event.camera.target.copy(btl.get(task.chara[0]).mesh.position);
			event.camera.target.y += 1.0;
			let p2 = null;
			if(task.chara[1]) {	//2人目がいたら間をとる
				if(p2 = btl.get(task.chara[1])) {
					event.camera.target.add(p2.mesh.position);
					event.camera.target.y += 1.0;
					event.camera.target.multiplyScalar(0.5);
				}
			}
			event.camera.eye.copy(event.camera.target);	//キャラ中心
			if(task.zoom != undefined) event.camera.zoom = task.zoom;
			if(task.fov  != undefined) event.camera.fov  = task.fov;
			event.camera.rotation.set(task.rotation.x, btl.get(task.chara[0]).move_dir + Math.PI + task.rotation.y, task.rotation.z);
			return false;
		},
		null
	);
	return true;
}

function eventSelectInit(task) {
	event.count = 0;
	menu.setYesNo(task.text, false, function(){
		event.count = 1;
		return true;
	});
	//ui_needsUpdate = true;
}
function eventSelectUpdate(task) {
	if(menu.update()) {
		//ui_needsUpdate = true;

		//ラベルジャンプ
		for(let i=0;i<event.task.length;i++) {
			const t = event.task[ i ];
			if(t.name == "label") {
				if((event.count == 1 && t.label == task.yes)
				|| (event.count == 0 && t.label == task.no)) {
					event.index = i;
					break;
				}
			}
		}
		
		return true;
	}
	return false;
}
function eventFuncInit(task) {
	if(task.callback) {
		task.callback();
	}
}
/*
イベント命令
	move 
	{name:"move", target:"tamami", base:"hotaru", offset:new THREE.Vector3(1,0,0), rotation: "hotaru"},
	{name:"camera", chara:["hotaru","tamami"], rotation:new THREE.Vector3(Math.PI/-8, Math.PI/2, 0), zoom:1 },
	{name:"meeting", owner:"hotaru", distance:2.0},
	{name:"wait", chara:true, count:0},
	{name:"talk", name:"hotaru", text:["メッセージです"]},
*/
const eventFunc = {
	"move"		: {init:eventMoveInit,		update:eventMoveUpdate		},
	"talk"		: {init:eventTalkInit,		update:eventTalkUpdate,		end:eventTalkEnd	},
	"wait"		: {init:eventWaitInit,		update:eventWaitUpdate		},
	"camera"	: {init:eventCameraInit,	update:eventCameraUpdate	},
	"meeting"	: {init:eventMeetingInit,	update:eventMeetingUpdate	},
	"select"	: {init:eventSelectInit,	update:eventSelectUpdate	},
	"func"		: {init:eventFuncInit	},
	"exit"		: null,
};

function draw() {

	if(event.index >= event.task.length) {
		return false;
	}
	const t = event.task[ event.index ];
	let ret = false;

	switch(t.name) {
	case "talk":
		drawMessage();
		break;
	case "select":
		{
			let context_win = canvas.menu.getContext('2d');
			context_win.clearRect(0,0,canvas.menu.width,canvas.menu.height);
			ret = true;	//drawMenuTopを呼ぶ
		}
		break;
	}
	return ret;
}
function exit() {
	GameParam.GamePause = "";
	btl.clearTimerEvent("event");
	btl.clearTimerEvent("event_camera");
	btl.clearTimerEvent("event_camera_infinity");	//古いのを消す
}
function update(skip) {
	
	if(event.index >= event.task.length) {
		exit();
		return true;	//終了
	}
	const t = event.task[ event.index ];
	
	if(t.name == "exit") {
		exit();
		return true;	//終了
	}

	let func = eventFunc[t.name];
	if(func != null) {
		switch(event.stat) {
		case "init":
			if(func.init != null) {
				func.init(t);
			}
			event.stat = "update";
//			break;
		case "update":
			if(func.update == null || func.update(t) || skip) {
				event.stat = "end";
			}
			else {
				break;
			}
		case "end":
			if(func.end != null) {
				func.end(t);
			}
			event.index++;
			event.stat = "init";
			break;
		}
	}
	else {
		//未定義もしくはlabel
		event.index++;
		event.stat = "init";
	}
	return false;
}

function drawMessage() {
	if(message.lists == null) return;

	const scl = Math.min(canvas.main.width / (canvas.menu.width*1.0), canvas.main.height / canvas.menu.height, 2);
	const w = canvas.menu.width  * scl;
	const h = canvas.menu.height * scl;

	let context = canvas.main.getContext('2d');
	context.fillStyle = "rgb(0,192,0,0.75)";
	let context_win = canvas.menu.getContext('2d');
	
	context_win.clearRect(0,0,canvas.menu.width,canvas.menu.height);

	let x = 10,y = 10;
	let w2 = 256*3;
	let h2 = 256;
	drawWindow(context_win, x,y, w2-10,h2-10, "rgba(128,128,128,0.75)");
	
	x += 20;
	y += 15;
	//発言者（キャプション）
	if(message.caption) {
		context_win.font = "30px 'Shippori Mincho', sans-serif";
		drawFont(context_win, message.caption, x,y);
		y += 35;
	}
	y += 5;
	
	const str = message.lists[message.index];
	const cnt = Math.floor(Math.min(message.count, str.length));
	context_win.font = "28px 'M PLUS 1p', sans-serif";
	drawFont(context_win, str.substr(0,cnt), x,y);

	//ボタン入力
	if(message.count >= str.length+5 && GameParam.Assign != null) {
		const button_img = GameParam.getButtonImage();
		const no = GameParam.Assign["enter"];
		//ボタンアイコン
		if(no >= 0 && no <= 15) {
			const u = (no% 4) * (256/4);
			const v = (no>>2) * (256/4);
			context_win.globalAlpha = (Math.sin(GameParam.count/10)+1)/2;
			context_win.drawImage(button_img, u,v,(256/4),(256/4), w2-80,h2-70,32*2,32*2);
		}
	}
	context_win.globalAlpha = 1.0;
	
	//下半分メッセージ周辺だけ消す
	x = (canvas.main.width-w2*scl)/2;
	y = (canvas.main.height-h2*scl)-16;
	context.clearRect(x,y, w,h);
	context.drawImage(canvas.menu, x,y, w,h);
}
function updateMessage() {
	if(message.lists == null) return true;
	
	const str = message.lists[message.index];
	message.count += messageSpeed;
	if(InputOnes.enter || InputOnes.clickL) {
		//メッセージ飛ばし
		message.count = Math.max(message.count, str.length);
	}
	
	if(message.count > str.length+5) {
		if(InputOnes.enter || InputOnes.cancel || InputOnes.clickL) {
			if(++message.index >= message.lists.length) {
				sound.play("menu_enter");
				message.lists = null;	//おわり
				return true;
			}
			else {
				message.count = 0;	//次のメッセージ
			}
		}
	}
	else {
	}
	return false;
}
function setMessage(msgs, caption) {
	if(GameParam.BattleMode == 0) {
		btl.actionResetAll();
	}
	message.caption = caption;
	message.lists = msgs;
	message.index = 0;
	message.count = 0;
	message.caption = null;
	GameParam.GamePause = "message";
	//ui_needsUpdate = true;
}

//テロップ
function drawTelop(x, y, offy) {
	if(message.lists == null) return true;

	const scl = Math.min(canvas.main.width / (canvas.menu.width*1.0), canvas.main.height / canvas.menu.height, 2);
	const w = canvas.menu.width  * scl;
	const h = canvas.menu.height * scl;

	let context = canvas.main.getContext('2d');
//	context.fillStyle = "rgb(0,192,0,0.75)";
	let context_win = canvas.menu.getContext('2d');
	
	context_win.clearRect(0,0,canvas.menu.width,canvas.menu.height);
//	context_win.fillStyle = "rgba(192,192,0,0.33)";
//	context_win.fillRect(0,0,canvas.menu.width,canvas.menu.height);

//	let x = 10,y = 10;
//	const str = message.lists[message.index];
//	const cnt = Math.floor(Math.min(message.count, str.length));
	context_win.font = (24*S)+"px 'M PLUS 1p', sans-serif";
	for(let i=0;i<=message.index && i < message.lists.length;i++) {
//		const fontWidth  = context_win.measureText(message.lists[i]).width / S;
		if(i == message.index) {
			context_win.globalAlpha = Math.min(1.0, message.count / 30);
		}
		else {
			context_win.globalAlpha = 1.0;
		}
		drawFont(context_win, message.lists[i], x*S,(y+i*offy)*S, "rgb(255,255,255)");
	}
	context_win.globalAlpha = 1.0;

	//ボタン入力
	if(GameParam.Assign != null && message.index == message.lists.length) {
		const button_img = GameParam.getButtonImage();
		const no = GameParam.Assign["enter"];
		//ボタンアイコン
		if(no >= 0 && no <= 15) {
			const u = (no% 4) * (256/4);
			const v = (no>>2) * (256/4);
			context_win.globalAlpha = (Math.sin(GameParam.count/10)+1)/2;
			context_win.drawImage(button_img, u,v,(256/4),(256/4), (960)*S,(600)*S,32*2,32*2);
		}
	}
	
	//反映
	{
		const scl = Math.min(canvas.main.width / canvas.menu.width, canvas.main.height / canvas.menu.height, 2);// / MenuScale;
		const w = canvas.menu.width  * scl;
		const h = canvas.menu.height * scl;

//		menu.setRect((canvas.main.width-w)/2,(canvas.main.height-h)/2, w,h);
//		menu.draw();

		context.drawImage(canvas.menu, (canvas.main.width-w)/2,(canvas.main.height-h)/2, w,h);
	}
}
function updateTelop() {
	if(message.lists == null) return false;

	const enter = (message.count >= 15) && (InputOnes.enter || InputOnes.cancel || InputOnes.clickL);

	message.count++;
	if(message.index >= message.lists.length) {
		if(enter) {
			message.lists = null;	//おわり
			return true;
		}
		GameParam.count++;
	}
	else if(message.count >= 60 || enter) {
		message.index++;
		message.count = 0;	//次のメッセージ
	}
	
	return false;
}


function getCameraInfo() {
	if(event.camera_enable) {
		return event.camera;
	}
	return null;
}
function drawFont(context,text,x,y,color) {
	menu.drawFont(context,text,x/S,y/S,color,4/S);
//	menu.drawFont(context,text,x/S,y/S,"rgb(0,0,0)",4/S);
}
function drawWindow(context, lx,ly,rx,ry, color, line_color, thin) {
	menu.drawWindow(context, lx/S,ly/S,rx/S,ry/S, color, line_color, thin);
}

scope.setCanvas = setCanvas;
scope.start = start;
scope.update = update;
scope.draw = draw;
scope.exit = exit;
scope.drawMessage = drawMessage;
scope.updateMessage = updateMessage;
scope.setMessage = setMessage;
scope.getCameraInfo = getCameraInfo;
scope.updateTelop = updateTelop;
scope.drawTelop = drawTelop;
};


Event.prototype = Object.create(null);
Event.prototype.constructor = Menu;

export { Event };

