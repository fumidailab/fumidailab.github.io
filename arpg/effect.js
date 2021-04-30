
import { LineMaterial } from '../three.js-master/examples/jsm/lines/LineMaterial.js';
import { Wireframe } from '../three.js-master/examples/jsm/lines/Wireframe.js';
import { WireframeGeometry2 } from '../three.js-master/examples/jsm/lines/WireframeGeometry2.js';

var Effect = function (options) {
	var scope = this;
	var GameParam = options.GameParam;
	var bladePos = [new Array(),new Array()];
	var blade_mesh = [null, null];

	var list = new Array();

	const BLADE_EFF_NUM = 8;
	var attack_eff = null;
	{
		var geometry = new THREE.CylinderGeometry( 4, 20, 40, 8,1, true );
		var material = new THREE.MeshBasicMaterial( {color: 0xffffff, map:GameParam.getTexture("lineeffect"), transparent: true, side: THREE.DoubleSide } );
		attack_eff = new THREE.Mesh( geometry, material );
		attack_eff.visible = false;
		attack_eff.renderOrder += GameParam.AlphaOrder+1;
		GameParam.world_view.add(attack_eff);
	}
	var attack_count = 0;

function update() {
	for(let i=0;i<list.length;i++) {
		let e = list[i];
		if(!e.enable) continue;
		switch(e.name) {
		case "hit":
			{
				const max = 12;
				let tex = e.mesh.material.map;
				tex.offset.set(1/5*Math.floor(e.count*5/max), 1/4*1);
				tex.repeat.set(1/5, 1/4);
				tex.wrapT = THREE.ClampToEdgeWrapping;
				if(e.count >= max) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "circle":
			{
				const max = 15;
				const s = 1 + (e.count / max) * 0.5;
				e.mesh.scale.set(s,s,s);
				e.mesh.material.opacity = 1 - Math.sin(e.count / max * Math.PI/2);
				if(e.count >= max) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "grass":
		case "sand":
		case "water":
			{
				const max = (e.name == "water") ? 15 : 30;
				const scale = 0.03 + (e.mesh.scale.x - 0.3) * 0.03;
				e.mesh.position.x += Math.sin(e.param.dir) * scale;
				e.mesh.position.y += Math.sin(e.count/max*Math.PI*2) * (0.015 + scale * e.param.pow);
				e.mesh.position.z += Math.cos(e.param.dir) * scale;
				if(e.count > max) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "cure":
			{
				const max1 = 6*6;	//anim
				const max2 = max1*2;	//time
				let j = Math.floor(e.count*max1/max2);
				let u = Math.floor(j%6);
				let v = 5-Math.floor(j/6);
				let tex = e.mesh.material.map;
				tex.offset.set(1/6*u, 1/6*v);
				tex.repeat.set(1/6, 1/6);
				tex.wrapT = THREE.ClampToEdgeWrapping;
				e.mesh.position.copy( e.param.mesh.position );
				e.mesh.position.y += e.param.height + 0.0;

				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "powerup":
			{
				const max1 = 5*5;		//anim
//				const max2 = e.time;	//time
				let j = Math.floor(e.count%max1);
				let u = Math.floor(j%5);
				let v = 4-Math.floor(j/5);
				let tex = e.mesh.material.map;
				tex.offset.set(1/5*u, 1/5*v);
				tex.repeat.set(1/5, 1/5);
				tex.wrapT = THREE.ClampToEdgeWrapping;
				e.mesh.position.copy( e.param.mesh.position );
				e.mesh.position.y += e.param.height + 0.5;

//				if(e.count >= max2 || !e.param.enable) {
				if(e.param.attack_up <= 0 || !e.param.enable) {	//attack_upを見て消す
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "shield3d":
			{
				const max2 = e.time;	//time
				e.mesh.rotation.y += 0.04;
				let s = 1;
				if(e.count < 30) {
					s *= e.count/30;
				} else if(e.count > max2-30) {
					s *= (max2-e.count)/30;
				}
				{
					e.param.mesh.updateMatrixWorld(true);
					let mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
//					(new THREE.Matrix4()).multiplyMatrices(mat0, findBone(player.mesh,"J_Bip_C_Hips").matrixWorld);
					let mat1 = e.param.mesh.children[0].children[0].matrixWorld;
					mat0 = (new THREE.Matrix4()).multiplyMatrices(mat0, mat1);
					let pos = (new THREE.Vector3()).setFromMatrixPosition(mat0);
					//pos.y += e.param.height;
					e.mesh.position.copy( pos );
				}

				e.mesh.scale.set(s,s,s);
				if(e.count >= max2 || !e.param.enable) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "defence":
			{
				const max1 = 5*5;		//anim
				let j = Math.floor(e.count%max1);
				let u = Math.floor(j%5);
				let v = 4-Math.floor(j/5);
				let tex = e.mesh.material.map;
				tex.offset.set(1/5*u, 1/5*v);
				tex.repeat.set(1/5, 1/5);
				tex.wrapT = THREE.ClampToEdgeWrapping;
				e.mesh.position.copy( e.param.mesh.position );
				e.mesh.position.y += e.param.height + 0.5;

				if(e.count >= max1) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "punch":
			{
				const max1 = 3*4;		//anim
				let j = Math.floor(e.count%max1);
				let u = Math.floor(j%3);
				let v = 3-Math.floor(j/3);
				let tex = e.mesh.material.map;
				tex.offset.set(1/3*u, 1/4*v);
				tex.repeat.set(1/3, 1/4);
				tex.wrapT = THREE.ClampToEdgeWrapping;
//				e.mesh.position.copy( e.param.mesh.position );
//				e.mesh.position.y += e.param.height + 0.5;

				if(e.count >= max1) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "special1":
			{
				const max1 = 6*9;		//anim
				const max2 = max1*0.75;		//anim
				let j = Math.floor(e.count*max1/max2);
				let u = Math.floor(j%6);
				let v = 8-Math.floor(j/6);
				let tex = e.mesh.material.map;
				tex.offset.set(1/6*u, 1/9*v);
				tex.repeat.set(1/6, 1/9);
				tex.wrapT = THREE.ClampToEdgeWrapping;
				e.mesh.position.copy( e.param.mesh.position );
				e.mesh.position.y += e.param.height + 0.0;

				let scale = 3 + e.count/max2*2;
				e.mesh.scale.set(scale,scale,scale);

				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "attackeff":
			{
				const max1 = 4*3;		//anim
				const max2 = max1*1;		//anim
				let j = Math.floor(e.count/max2*max1);
				let u = Math.floor(j%4);
				let v = 2-Math.floor(j/4);
				let tex = e.mesh.material[0].map;
				tex.offset.set(1/4*u, 1/3*v);
				tex.repeat.set(1/4, 1/3);
				tex.wrapT = THREE.ClampToEdgeWrapping;

				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "slash":
			{
				const max1 = 2*2;		//anim
				const max2 = max1*3;		//anim
				let j = Math.floor(e.count/max2*max1);
				let u = Math.floor(j%2);
				let v = 1-Math.floor(j/2);
				let tex = e.mesh.material.map;
				tex.offset.set(1/2*u, 1/2*v);
				tex.repeat.set(1/2, 1/2);
				tex.wrapT = THREE.ClampToEdgeWrapping;

				let scale = 2 + e.count/max2*3;
				e.mesh.scale.set(scale,scale,scale);
//				e.mesh.material.opacity = Math.sin(e.count/max2*Math.PI);
				if(e.count <= 5)
					e.mesh.material.opacity = e.count/5;
				else if(e.count > max2-5)
					e.mesh.material.opacity = (max2-e.count)/5;
				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "smoke":
			{
				const max1 = 3*4;		//anim
				const max2 = max1*2;	//anim
				let j = Math.floor(e.count/max2*max1);
				let u = Math.floor(j%3);
				let v = 3-Math.floor(j/3);
				let tex = e.mesh.material.map;
				tex.offset.set(1/3*u, 1/4*v);
				tex.repeat.set(1/3, 1/4);
				tex.wrapT = THREE.ClampToEdgeWrapping;

//				obj.mesh.scale.set(2.5,2,2);
				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "break":
			{
				const max1 = 5*4;		//anim
				const max2 = max1*2+15;	//anim
				let j = Math.floor(Math.max((e.count-15)/2, 0));
				let u = Math.floor(j%5);
				let v = 3-Math.floor(j/5);
				let tex = e.mesh.material.map;
				tex.offset.set(1/5*u, 1/4*v);
				tex.repeat.set(1/5, 1/4);
				tex.wrapT = THREE.ClampToEdgeWrapping;

				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "slash2":
			{
				const max1 = 1*5;		//anim
				const max2 = max1*1.5;	//anim
				let j = Math.floor(e.count/max2*max1);
				let u = 0;
				let v = 4-Math.floor(j%5);
				let tex = e.mesh.material.map;
				tex.offset.set(1/1*u, 1/5*v);
				tex.repeat.set(1/1, 1/5);
				tex.wrapT = THREE.ClampToEdgeWrapping;

				e.mesh.scale.set(4,2,2);
				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "sakura":
			{
				if(e.count % 3 == 0) {
					let j = Math.floor(Math.random()*4);
					let u = j%2;
					let v = Math.floor(j/2);
					let tex = e.mesh.material.map;
					tex.offset.set(1/2*u, 1/2*v);
					tex.repeat.set(1/2, 1/2);
//					tex.rotation += Math.PI/4;

//					tex.center.set(1/4,1/4);
				}
//				let vertices = e.mesh.geometry.vertices;
				let vertices = e.mesh.geometry.attributes.position.array;
				for(let i=0;i<e.param.length;i++) {
					let p = e.param[i].pow * 0.75 + Math.random() * 0.25;
					p *= 0.033;
					vertices[i*3+0] += Math.sin(e.param[i].dir) * p;
					if(e.param[i].count>90)
						vertices[i*3+1] -= 0.05;
					else
						vertices[i*3+1]  = Math.sin(e.param[i].count/90*Math.PI) * (e.param[i].pow2 + 0.5) + 0.5;
					vertices[i*3+2] += Math.cos(e.param[i].dir) * p;

					let spd = 1;
					if(e.param[i].count< 45) {
						spd = 2;
					}

					vertices[i*3+0] -= Math.sin(e.param[i].dir2) * 0.03 * spd;
					vertices[i*3+2] -= Math.cos(e.param[i].dir2) * 0.03 * spd;
					
					e.param[i].count += spd + Math.random();
				}
				if(e.count > 60-15) {
					e.mesh.material.opacity = (60-e.count)/15;
				}
				else {
					e.mesh.material.opacity = 1;
				}
//				e.mesh.geometry.verticesNeedUpdate = true;
				e.mesh.geometry.attributes.position.needsUpdate = true;
				if(e.count > 60) {
					e.enable = false;
					e.mesh.visible = false;
				}
			}
			break;
		case "stun":
			{
				let j = Math.floor(e.count/3)%18;
				let u =   Math.floor(j%6);
				let v = 2-Math.floor(j/6);
				let tex = e.mesh.material.map;
				tex.offset.set(1/6*u, 1/3*v);
				tex.repeat.set(1/6, 1/3);
				tex.wrapT = THREE.ClampToEdgeWrapping;

				e.mesh.position.copy(e.param.mesh.position);
				e.mesh.position.y += e.param.height;
				if(e.param.sequence != 8/*SEQ_STUN*/) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		case "quake":
			{
				const max1 = 5*5;
				const max2 = max1*2;
				let tex = e.mesh.material.map;
				const j = Math.floor(e.count/2);
				let u =   Math.floor(j%5);
				let v = 4-Math.floor(j/5);
				tex.offset.set(1/5*u, 1/5*v);
				tex.repeat.set(1/5, 1/5);
				if(e.count >= max2) {
					e.enable = false;
					e.mesh.visible = false;
					continue;
				}
			}
			break;
		}
		e.count++;
	}
	if(attack_count > 0) {
		attack_eff.visible = true;
		attack_eff.material.opacity = Math.sin((1-attack_count/20)*Math.PI/2);
		let s = attack_count/20 * 0.15;
		attack_eff.scale.set(s,s,s);
		if(attack_count++ >= 20) {
			attack_count = 0;
		}
	}
	else {
		attack_eff.visible = false;
	}
	updateBlade();

}

//全削除
function clearAll() {
	for(let e of list) {
		if(e.enable) {
			GameParam.world_view.remove(e.mesh);
		}
	}
	list = new Array();
}

function set(name, position, option) {

	if(GameParam.PerfMode == 0) {
		switch(name) {
		case "grass":
		case "sand":
		case "water":
			return;
		}
	}
	let mat;
	let scale = 1.0;
	let param = null;
	let tex_clone = 0;
	let spr = 1;
	let rotate = null;
	let geometry = null;
	let mesh = null;
	let mesh2 = null;
	let obj = null;
	for(let i=0;i<list.length;i++) {	//再利用可能か？
		if(!list[i].enable) {
			if(name == list[i].name) {
				obj = list[i];
				mesh = obj.mesh;
				break;
			}
		}
	}
	if(obj == null) {
		list.push(obj = {
			enable : true,
			name : name,
			mesh : null,
			count : 0,
			param : null,
			time : 0,
		});
	}
	switch(name) {
	case "hit":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff , map: GameParam.getTexture("hiteffect") , transparent: true, /*blending: THREE.AdditiveBlending,*/ alphaTest:0.1 } );
		}
		scale = 1.2;
		tex_clone = 1;
		break;
	case "circle":
		if(!mesh) {
			mat = new THREE.MeshBasicMaterial( { color:0xffffff , map: GameParam.getTexture("circle") , transparent: true, depthTest:false, depthWrite:false, side:THREE.DoubleSide } );
		}
		spr = 0;
		rotate = new THREE.Euler(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI, 'XYZ');
		break;
	case "grass":
		if(GameParam.PerfMode == 0) return;
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xa0ffa0 , map: GameParam.getTexture("sand") , transparent: true, opacity:0.75 } );
		}
		param = {dir:(Math.random()-0.5) * Math.PI + option.dir, pow:Math.random()};
		scale = 0.3;
		break;
	case "sand":
		if(GameParam.PerfMode == 0) return;
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffa0 , map: GameParam.getTexture("sand") , transparent: true, opacity:0.75 } );
		}
		param = {dir:(Math.random()-0.5) * Math.PI + option.dir, pow:Math.random()};
		scale = 0.3 * ((option.scale != undefined) ? option.scale : 1);
		break;
	case "water":
		if(GameParam.PerfMode == 0) return;
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xd0d0ff , map: GameParam.getTexture("sand") , transparent: true, opacity:0.75 } );
		}
		param = {dir:(Math.random()-0.5) * Math.PI + option.dir, pow:Math.random()};
		scale = 0.3;
		break;
	case "cure":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff , map: GameParam.getTexture(name) , transparent: true, depthTest:false, depthWrite:false, blending: THREE.AdditiveBlending } );
		}
		scale = 2;
		tex_clone = 1;
		param = option.player;
		break;
	case "powerup":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xff0000 , map: GameParam.getTexture(name), blending: THREE.AdditiveBlending, transparent:true  } );
		}
		scale = 3;
		tex_clone = 1;
		param = option.player;
		break;
	case "shield3d":
		if(!mesh) {
		geometry = new THREE.IcosahedronGeometry(0.8, 1);
		mat = new LineMaterial( { color:0x00ffff , linewidth:3, blending: THREE.AdditiveBlending, transparent:true, opacity:0.5 } );
		mesh2 = new Wireframe( new WireframeGeometry2( geometry ),mat );
//		mesh2.computeLineDistances();
		}
		else {
			mat = mesh.material;
		}
		mat.resolution.set( window.innerWidth, window.innerHeight ); // resolution of the viewport
		param = option.player;
		obj.time = option.time;
		break;
	case "defence":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff , map: GameParam.getTexture(name) , transparent: true, depthTest:false, depthWrite:false } );
		}
		scale = 1.3;
		tex_clone = 1;
		param = option.player;
		break;
	case "punch":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff , map: GameParam.getTexture(name), transparent: true, blending: THREE.AdditiveBlending } );
		}
		scale = 2.5;
		tex_clone = 1;
		param = option.player;
		break;
	case "special1":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff , map: GameParam.getTexture(name), transparent: true/*, depthTest:false, depthWrite:false*/ } );
		}
		scale = 3;
		tex_clone = 1;
		param = option.player;
		break;
	case "attackeff":
		if(!mesh) {
			mesh2 = GameParam.getMesh("attackeff");
			mat = new THREE.MeshBasicMaterial( { color:0xffffff , map: GameParam.getTexture(name), transparent: true, side:THREE.DoubleSide, blending: THREE.AdditiveBlending } );
			mesh2.material[0] = mat;
			mesh2.children[0].renderOrder += GameParam.AlphaOrder;
		}
		rotate = new THREE.Euler(0,option.player.mesh.rotation.y+option.ry+Math.PI,0, 'XYZ');
		tex_clone = 1;
		param = option.player;
//		scale = 1/100;
		break;
	case "slash":
		if(!mesh) {
			mat = new THREE.MeshBasicMaterial( { color:0xffffff , map: GameParam.getTexture(name), transparent: true, /*depthTest:false, depthWrite:false,*/ side:THREE.DoubleSide, blending: THREE.AdditiveBlending } );
		}
		spr = 0;
		rotate = new THREE.Euler(option.rx, option.player.mesh.rotation.y+option.ry, option.rz, 'YXZ');
		break;
	case "smoke":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:option.color , map: GameParam.getTexture(name), transparent: true, depthTest:false, depthWrite:false } );
		}
		else {
			mesh.material.color.setHex(option.color);
		}
		scale = 2;
		tex_clone = 1;
		param = option.player;
		break;
	case "break":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff, map: GameParam.getTexture(name), transparent: true, depthTest:false, depthWrite:false } );
		}
		scale = 3;
		tex_clone = 1;
		param = option.player;
		break;
	case "slash2":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff , map: GameParam.getTexture(name), transparent: true, depthTest:false, depthWrite:false } );
		}
		tex_clone = 1;
		param = option.player;
		break;
	case "sakura":
		param = new Array();
		for(let i=0;i<5;i++) {
			let r = Math.random() * Math.PI*2;
			param.push({
				dir : r,
				pow : Math.random(),
				pow2 : Math.random(),
				count : 0,
				dir2 : option.ry + (Math.random()-0.5),
			});
		}
		position = position.clone().add(new THREE.Vector3(-Math.sin(option.ry),0,-Math.cos(option.ry)));
		if(!mesh) {
			mat = new THREE.PointsMaterial({
				// 一つ一つのサイズ
				size: 0.3,
				// 色
				color: 0xffffff,
				map: GameParam.getTexture("sakura"),
				transparent: true,
			});
			const geometry = new THREE.BufferGeometry();
//			for(let i=0;i<param.length;i++) {
//				geometry.vertices.push(new THREE.Vector3(0,0,0));
//			}
			geometry.dynamic = true;
			geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(param.length*3), 3 ) );
			
			mesh2 = new THREE.Points(geometry, mat);
		}
		else {
			mesh2 = mesh;
		}
		for(let i=0;i<param.length*3;i++) {
			mesh2.geometry.attributes.position.array[i] = 0;
		}
		mesh2.geometry.attributes.position.needsUpdate = true;
		tex_clone = 1;
		break;
	case "stun":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff, map: GameParam.getTexture(name), transparent: true, depthTest:false, depthWrite:false } );
		}
		scale = 1.5;
		tex_clone = 1;
		param = option.player;
		break;
	case "quake":
		if(!mesh) {
			mat = new THREE.SpriteMaterial( { color:0xffffff, map: GameParam.getTexture(name), transparent: true/*, depthTest:false, depthWrite:false*/ } );
		}
		scale = 2.5;
		tex_clone = 1;
		param = option.player;
		break;
	}
	if(mesh == null) {
		//UVアニメーションは複製する必要がある
		if(tex_clone) {
			mat.map = mat.map.clone();
			mat.map.repeat.set(0,0);	//非表示
			mat.map.needsUpdate = true;
		}

		if(mesh2)
			obj.mesh = mesh2;
		else if(spr)
			obj.mesh = new THREE.Sprite( mat );
		else
			obj.mesh = new THREE.Mesh( new THREE.PlaneGeometry( 1,1 ),mat );
		obj.mesh.renderOrder += GameParam.AlphaOrder;
		GameParam.world_view.add(obj.mesh);
	}
	obj.param = param;
	obj.mesh.visible = true;
	obj.mesh.scale.set(scale,scale,scale);
	obj.enable = true;
	obj.count = 0;
	if(rotate) {
		obj.mesh.rotation.copy(rotate);
	}
	obj.mesh.position.copy(position);
}
//剣エフェクト
function setBlade(index, matrix, back) {

	var mat0,mat1;
	mat0 = (new THREE.Matrix4().makeTranslation(-GameParam.world_view.position.x,GameParam.world_view.position.y,-GameParam.world_view.position.z));
	mat0.multiplyMatrices(mat0, matrix);
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeRotationZ(-Math.PI/2));
	mat1 = mat0.clone();
	mat0.multiplyMatrices(mat0,(new THREE.Matrix4()).makeTranslation((0.6)/31,(2)/31,-0.25));
	mat1.multiplyMatrices(mat1,(new THREE.Matrix4()).makeTranslation((0.6)/31,(2)/31,-1.1));

	if(back == undefined) {
		bladePos[index].push(
			[
				(new THREE.Vector3()).setFromMatrixPosition(mat0),
				(new THREE.Vector3()).setFromMatrixPosition(mat1),
			]
		);
	}
	else {
		bladePos[index].splice(
			bladePos[index].length-back, 0,
			[
				(new THREE.Vector3()).setFromMatrixPosition(mat0),
				(new THREE.Vector3()).setFromMatrixPosition(mat1),
			]
		);
	}
	if(bladePos[index].length >= BLADE_EFF_NUM) {
		bladePos[index].shift();
	}
}
function clearBlade(index, count) {
	if(count < 0) {
		bladePos[index].length = 0;
	}
	else if(bladePos[index].length > 0) {
		bladePos[index].shift();
	}
}
function updateBlade() {
	
	for(let index=0;index<2;index++) {
		if(bladePos[index].length < 2) {
			if(blade_mesh[index] != null) {
				blade_mesh[index].visible = false;
			}
			return;
		}
		if(blade_mesh[index] == null) {
			var geometry = new THREE.BufferGeometry();
			geometry.dynamic = true;
			geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array((BLADE_EFF_NUM-1)*3*6), 3 ) );
			geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array((BLADE_EFF_NUM-1)*2*6), 2 ) );
			blade_mesh[index] = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide, transparent:true, map: GameParam.getTexture("whitefade")}));
			blade_mesh[index].renderOrder += GameParam.AlphaOrder;
			GameParam.world_view.add(blade_mesh[index]);
		}
		blade_mesh[index].visible = true;

		let vertices = blade_mesh[index].geometry.attributes.position.array;
		let uvs = blade_mesh[index].geometry.attributes.uv.array;

		/*
			0-1  5
			|/  /|
			2  4-3
		*/
		for(let i=0;i<bladePos[index].length-1;i++) {
			let iv = i*3*6;
			let it = i*2*6;

			let tbl = [
				[i  ,0],
				[i  ,1],
				[i+1,0],
				[i+1,1],
				[i+1,0],
				[i  ,1],
			];
			for(let j=0;j<6;j++) {
				vertices[iv++] = bladePos[index][tbl[j][0]][tbl[j][1]].x;
				vertices[iv++] = bladePos[index][tbl[j][0]][tbl[j][1]].y;
				vertices[iv++] = bladePos[index][tbl[j][0]][tbl[j][1]].z;
				uvs[it++] = tbl[j][1];
				uvs[it++] = tbl[j][0] / (bladePos[index].length);
			}
		}
		//残りカス
		for(let i=bladePos[index].length-1;i<BLADE_EFF_NUM;i++) {
			let iv = i*3*6;
			for(let j=0;j<6*3;j++) {
				vertices[iv++] = 0;
			}
		}
		blade_mesh[index].geometry.attributes.position.needsUpdate = true;
		blade_mesh[index].geometry.attributes.uv.needsUpdate = true;
		blade_mesh[index].geometry.computeBoundingSphere();
//		geometry.computeBoundingSphere();
	}
}

function setAttackEff(eye, target, vertical) {

	attack_eff.position.copy(eye);
	attack_eff.position.y += 0.77;
	attack_eff.quaternion.setFromEuler(new THREE.Euler((vertical == undefined) ? -Math.PI/2 : vertical, target.y, 0, "YXZ"));
	attack_eff.scale.set(0,0,0);
	attack_count = 1;
}
/*function setSand(x,y,z) {
	//砂埃
	let cnt = 8;
	for(let i=0;i<sand_param.length && cnt > 0;i++) {
		if(sand_param[i].count < 0) {
			sand_param[i].count = 0;
			sand_param[i].position.set(x,y,z);
			sand_param[i].power = Math.random();
			//足
//			sand_param[i].type = (anim_user[id].run > 0) ? 1 : 2;
			sand_param[i].rotation = r;
			sand_param[i].rotation += (Math.random()*2-1)*0.9;
			sand_param[i].position.x += Math.random()*2-1;
			sand_param[i].position.z += Math.random()*2-1;
			cnt--;
		}
	}
}*/
//////////
scope.update = update;
scope.clearAll = clearAll;
scope.setBlade = setBlade;
scope.clearBlade = clearBlade;
scope.setAttackEff = setAttackEff;
scope.set = set;
};


Effect.prototype = Object.create(null);
Effect.prototype.constructor = Effect;

export { Effect };

