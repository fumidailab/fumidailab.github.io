var Sound = function () {
	var scope = this;
	var audio_info = new Array();
	var audio_listener;
	var mute = true;

	var audioSetting = [
		{name:"bgm_battle1",                volume:0.3, count:1 },
		{name:"bgm_battle2",                volume:0.3, count:1 },
		{name:"bgm_battle3",                volume:0.3, count:1 },
		{name:"bgm_battle4",                volume:0.3, count:1 },
		{name:"bgm_ending",                 volume:0.3, count:1 },
		{name:"bgm_spring",                 volume:0.3, count:1 },
		{name:"bgm_summer",                 volume:0.3, count:1 },
		{name:"bgm_autumn",					volume:0.3, count:1 },
		{name:"bgm_winter",                 volume:0.3, count:1 },
		{name:"bgm_event",                  volume:0.3, count:1 },
		{name:"bgm_title",                  volume:0.3, count:1 },
		{name:"atk_boss",                   volume:1.0, count:1 },
		{name:"atk_drill",                  volume:1.0, count:1 },
		{name:"atk_enemy",                  volume:1.0, count:6 },
		{name:"atk_kick1",                  volume:1.0, count:2 },
		{name:"atk_kick2",                  volume:1.0, count:2 },
		{name:"atk_punch",                  volume:1.0, count:3 },
		{name:"atk_rod",                    volume:1.0, count:2 },
		{name:"atk_slash1",                 volume:1.0, count:2 },
		{name:"atk_slash2",                 volume:1.0, count:2 },
		{name:"atk_slash3",                 volume:1.0, count:2 },
		{name:"atk_slash4",                 volume:1.0, count:2 },
		{name:"atk_slash5",                 volume:1.0, count:2 },
		{name:"atk_slash6",                 volume:1.0, count:2 },
		{name:"atk_slash7",                 volume:1.0, count:2 },
		{name:"battle_battou",              volume:1.0, count:3 },
		{name:"battle_break",               volume:1.0, count:3 },
		{name:"battle_dead",                volume:1.0, count:3 },
		{name:"battle_down",                volume:1.0, count:3 },
		{name:"battle_firstAttack",         volume:1.0, count:3 },
		{name:"battle_gameover",            volume:1.0, count:1 },
		{name:"battle_revive",              volume:1.0, count:2 },
		{name:"battle_start",               volume:1.0, count:1 },
		{name:"battle_cure",                volume:1.0, count:2 },
		{name:"battle_cure2",               volume:1.0, count:2 },
		{name:"battle_attack_up",           volume:1.0, count:1 },
		{name:"bomb_explosion",             volume:1.0, count:2 },
		{name:"bomb_throw",                 volume:1.0, count:2 },
		{name:"bossclear",                  volume:1.0, count:1 },
		{name:"dron",                       volume:1.0, count:3 },
		{name:"field_cure",                 volume:1.0, count:1 },
		{name:"field_drop",                 volume:1.0, count:3 },
		{name:"field_itembox",              volume:1.0, count:3 },
		{name:"field_itemtrade",            volume:1.0, count:1 },
		{name:"field_jump1",                volume:1.0, count:3 },
		{name:"field_jump2",                volume:1.0, count:3 },
		{name:"field_move",                 volume:1.0, count:1 },
		{name:"field_swim",                 volume:1.0, count:3 },
		{name:"field_walk_grass",           volume:0.5, count:3 },
		{name:"field_walk_sand",            volume:0.5, count:3 },
		{name:"field_walk_snow",            volume:1.0, count:3 },
		{name:"field_walk_weed",            volume:0.3, count:3 },
		{name:"field_walk_rock",            volume:1.0, count:3 },
//		{name:"field_walk_wood",            volume:1.0, count:1 },
		{name:"guard_enemy",                volume:1.0, count:3 },
		{name:"guard_punch",                volume:1.0, count:2 },
		{name:"guard_slash",                volume:1.0, count:2 },
		{name:"hit_drill",                  volume:1.0, count:1 },
		{name:"hit_enemy",                  volume:1.0, count:3 },
		{name:"hit_fall",                   volume:1.0, count:1 },
		{name:"hit_ice",                    volume:1.0, count:2 },
		{name:"hit_kick1",                  volume:1.0, count:2 },
		{name:"hit_kick2",                  volume:1.0, count:2 },
		{name:"hit_punch",                  volume:1.0, count:2 },
		{name:"hit_rod",                    volume:1.0, count:2 },
		{name:"hit_slash1",                 volume:1.0, count:2 },
		{name:"hit_slash2",                 volume:1.0, count:2 },
		{name:"hit_slash3",                 volume:1.0, count:2 },
		{name:"hit_slash4",                 volume:1.0, count:2 },
		{name:"hit_thunder",                volume:1.0, count:1 },
		{name:"menu_cancel",                volume:1.0, count:2 },
		{name:"menu_cursor",                volume:1.0, count:3 },
		{name:"menu_enter",                 volume:1.0, count:2 },
		{name:"menu_equip",                 volume:1.0, count:1 },
		{name:"menu_load",                  volume:1.0, count:1 },
		{name:"menu_pause",                 volume:1.0, count:1 },
		{name:"menu_save",                  volume:1.0, count:1 },
		{name:"menu_skillup",               volume:1.0, count:2 },
		{name:"roar_boss1",                 volume:1.0, count:1 },
		{name:"roar_boss2",                 volume:1.0, count:1 },
		{name:"roar_enemy1",                volume:1.0, count:3 },
		{name:"roar_enemy2",                volume:1.0, count:2 },
		{name:"shuriken1",                  volume:1.0, count:6 },
		{name:"shuriken2",                  volume:1.0, count:4 },
		{name:"spell_beam",                 volume:1.0, count:1 },
		{name:"spell_fire",                 volume:1.0, count:3 },
		{name:"spell_ground",               volume:1.0, count:3 },
		{name:"spell_ice",                  volume:1.0, count:3 },
		{name:"spell_shield",               volume:1.0, count:1 },
		{name:"spell_thunder",              volume:1.0, count:1 },
		{name:"sp_tamami1",                 volume:1.0, count:1 },
		{name:"sp_tamami2",                 volume:1.0, count:1 },
		{name:"sp_tomoka1",                 volume:1.0, count:1 },
		{name:"sp_tomoka2",                 volume:1.0, count:1 },
	];

	var currentBGM = null;
	var BGMInfo = {
		"ONES"   : null,
		"FIELD"  : null,
		"BATTLE" : null,
	};

function load() {
	//サウンド読み込み
	//タッチに反応しないと作れない
	audio_listener = new THREE.AudioListener();
	let audio_loader = new THREE.AudioLoader();
	function audioLoad(index, resolve) {
		audio_loader.load( "sound/"+audioSetting[index].name+".mp3", function ( buffer ) {
			audio_info[index] = {
				name : audioSetting[index].name,
				audio : new Array(),
				pause : false,
				defaultVol : audioSetting[index].volume,
//						BGMType : null,
			};
			for(let i=0;i<audioSetting[index].count;i++) {
				let a;
				audio_info[index].audio[i] = a = new THREE.Audio( audio_listener );
				a.setBuffer( buffer );
			}
			resolve();
		}, null, function(e){reject()} );
	}
	for(let i=0;i<audioSetting.length;i++) {
		new Promise(function(resolve, reject) {
			audioLoad(i, resolve);
		}).then(function(value) {
//				promise = null;
		}).catch(function(e) {
			console.log('error: ', e);
		});
	}
}
function loadCount() {
	const max = audioSetting.length;
	let cnt = 0;
	for(let info of audio_info) {
		if(info != null) cnt++;
	}
	return cnt/max;
}

//サウンドボタンのON/OFF
function enable() {
	mute = false;
	//BGM開始
	const bgmName = BGMInfo[currentBGM];
	const info = getInfo(bgmName);
	if(info != null) {
		if(info.pause) {
			restart(bgmName);
		}
		else {
			play(bgmName, currentBGM);
		}
	}
}
function disable() {

	const bgmName = BGMInfo[currentBGM];
	pause(bgmName);

	for(let info of audio_info) {
		if(info == null) continue
		if(info.name == bgmName) continue;
		for(let a of info.audio) {
			if (a.isPlaying) {
				a.stop();
			}
		}
	}
	mute = true;
}

function getInfo(name) {
	if(audio_info != null) {
		let no = Number(name);
		if(isNaN(no)) {
			for(let i=0;i<audio_info.length;i++) {
				if(audio_info[i] != null && audio_info[i].name == name) {
					return audio_info[i];
				}
			}
		}
		else {
			return audio_info[no];
		}
	}
	return null;
}

function play(name, bgmType) {
	
	let info = getInfo(name);
	if(info != null && !mute) {
		for(let a of info.audio) {
			if(!a.isPlaying) {
				a.offset = 0;
				a.setLoop((bgmType != null && bgmType != "ONES"));
				a.play();
				a.setVolume(info.defaultVol);
				break;
			}
		}
	}
//	if(loopBGM) currentBGM = name;
	if(bgmType != null) {
		currentBGM = bgmType;
		BGMInfo[currentBGM] = name;
	}
}
function stop(name) {
	if(BGMInfo[name] != null) {
		if(currentBGM == name) 		currentBGM = null;
		name = BGMInfo[name];
	}

	let info = getInfo(name);
	if(info != null) {
		for(let a of info.audio) {
			if(a !== undefined) {
				if(a.isPlaying) {
					a.stop();
				}
			}
		}
	}
}
function pause(name) {
	if(BGMInfo[name] != null) name = BGMInfo[name];

	let info = getInfo(name);
	if(info != null) {
		info.pause = false;
		for(let a of info.audio) {
			if(a !== undefined) {
				if(a.isPlaying) {
					info.pause = true;
					a.pause();
				}
			}
		}
	}
}
function pauseAll() {
	for(let i=0;i<audio_info.length;i++) {
		pause(i);
	}
}
function restart(name) {
	if(BGMInfo[name] != null) name = BGMInfo[name];

	let info = getInfo(name);
	if(info != null && !mute) {
		if(info.pause) {
			for(let a of info.audio) {
				if(a !== undefined) {
					if(!a.isPlaying) {
						a.play();
					}
				}
			}
		}
		info.pause = false;
	}
}
function restartAll() {
	for(let i=0;i<audio_info.length;i++) {
		restart(i);
	}
}

function update(delta) {
}

//////////
scope.load = load;
scope.loadCount = loadCount;
scope.enable = enable;
scope.disable = disable;
scope.update = update;
scope.play = play;
scope.stop = stop;
scope.pause = pause;
scope.restart = restart;
scope.pauseAll = pauseAll;
scope.restartAll = restartAll;

};

Sound.prototype = Object.create(null);
Sound.prototype.constructor = Sound;

export { Sound };

