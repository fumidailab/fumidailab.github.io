/*
	マップ（地形・アイテム・剛体作成など）
*/

//import { Ocean } from '../three.js-master/examples/jsm/misc/Ocean.js';
import { Water } from '../three.js-master/examples/jsm/objects/Water.js';
import { ImprovedNoise } from '../three.js-master/examples/jsm/math/ImprovedNoise.js';
import { Data } from './Data.js';


var Stage = function (options) {
	var scope = this;
	var GameParam = options.GameParam;
	var terrain_data = options.data;
	var isWater = (GameParam.PerfMode != 0);	//水モード
//	var obj_mesh = options.obj_mesh;

	var editor = (options.editor == undefined) ? false : options.editor;
//	var season = "winter";	//autumn,winter
	//var season = "autumn";
	
	var count = 0;	//風用
	var count2 = 0;

function setTerrain(data) {
	terrain_data = data;

	//省略データの展開
	for(let i=0;i<terrain_data.length;i++) {
		if(terrain_data[i].h != undefined) {
			terrain_data[i].height = terrain_data[i].h;
			terrain_data[i].h = undefined;
		}
		if(terrain_data[i].a != undefined) {
			terrain_data[i].atari = terrain_data[i].a;
			terrain_data[i].a = undefined;
		}
		else if(terrain_data[i].atari == undefined) {
			terrain_data[i].atari = terrain_data[i].height;
		}
		if(terrain_data[i].s != undefined) {
			terrain_data[i].sand = terrain_data[i].s;
			terrain_data[i].s = undefined;
		}
		else if(terrain_data[i].sand == undefined) {
			terrain_data[i].sand = 0;
		}

		if(terrain_data[i].kind == undefined) {
			terrain_data[i].kind = 0;
		}
		if(terrain_data[i].item == undefined) {
			terrain_data[i].item = 0;
		}
		if(terrain_data[i].name == undefined) {
			const type = terrain_data[i].item & 0xff;
			if(type > 0 && type <= Data.MapItemName.length) {
				terrain_data[i].name = Data.MapItemName[type-1];
			}
			else {
				terrain_data[i].name = "";
			}
		}
	}

	if(!editor) {
		isWater = 0;//(GameParam.PerfMode != 0);
		//水なし地形かチェック
		let low_h = 0;
		for(let i=0;i<terrain_data.length;i++) {
			if(terrain_data[i] != undefined) {
				if(low_h > terrain_data[i].height) low_h = terrain_data[i].height;
			}
		}
//		if(low_h > GameParam.WaterLine/GameParam.HeightScale) {
		if(low_h >= 0) {
			isWater = -1;
		}
	}
	else {
		isWater = 0;
	}
}
function getTerrainOne(x,y) {
	if(x < 0) x = 0;
	if(y < 0) y = 0;
	if(x > GameParam.MapSizeX) x = GameParam.MapSizeX;
	if(y > GameParam.MapSizeZ) y = GameParam.MapSizeZ;
	return terrain_data[ (x + y * (GameParam.MapSizeX+1)) ];
}
//terrainをもとに頂点・UV情報を作り直す
function createTerrain() {
	//terrain
	let size = (GameParam.MapSizeX+1)*(GameParam.MapSizeZ+1);
	let geometry = new THREE.BufferGeometry();
	let vertices = new Float32Array(size*3*6);
	let uvs	  = new Float32Array(size*2*6);
	let colors = new Float32Array(size*3*6);
	let normals = new Float32Array(size*3*6);

	geometry.dynamic = true;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	geometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
	geometry.setAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

	if(!GameParam.mesh.terrain) {
		let material = new THREE.MeshLambertMaterial( {
			color: 0xaaaaaa, 
			emissive:0x303030,
			vertexColors: true,
			transparent:true,
			map:GameParam.getTexture("mapchip"),
		} );
		GameParam.mesh.terrain = new THREE.Mesh( geometry, material );
		GameParam.mesh.terrain.scale.set(GameParam.MapScale,1,GameParam.MapScale);
		GameParam.mesh.terrain.receiveShadow = true;
		//GameParam.mesh.terrain.castShadow = true;
		
		if(GameParam.season == "winter") {
			let material = new THREE.MeshLambertMaterial( {
				color: 0xc0c0c0, 
				emissive:0x0,
//				vertexColors: true,
//				transparent:true,
				side:THREE.DoubleSide,
				map:null,
			} );

			GameParam.mesh.snow = new THREE.Mesh( createSnowGeometry(), material );
			GameParam.mesh.snow.scale.set(GameParam.MapScale,1,GameParam.MapScale);
			GameParam.mesh.snow.receiveShadow = true;

			GameParam.world_view.add(GameParam.mesh.snow);
		}
	}
	else {
		GameParam.mesh.terrain.geometry = geometry;
	}
	if(GameParam.mesh.mountain == null && !editor) {
		let mtTex = GameParam.getTexture("mountain");
		const C = 300;
		let geometry = new THREE.CylinderGeometry( 1, 1, 25/C, 12,1, true );
		let material = new THREE.MeshBasicMaterial( {
//				fog:false,
				side:THREE.BackSide,
				map:mtTex,
				transparent:true,
			} );
		mtTex.repeat.set(4,1);
		mtTex.wrapS = THREE.RepeatWrapping;
		let mesh = new THREE.Mesh( geometry, material );
		GameParam.world_view.add(mesh);
		GameParam.mesh.mountain = mesh;
	}
	updateTerrain();
	GameParam.mesh.terrain.name = "terrain";

	GameParam.world_view.add(GameParam.mesh.terrain);
}


function createSnowGeometry() {
	const density = 2;
	let geometry = new THREE.BufferGeometry();
	let indices  = new Uint32Array((GameParam.MapSizeX*density)*(GameParam.MapSizeZ*density)*6);
	let j=0;
	for(let y=0;y<GameParam.MapSizeZ*density;y++) {
		for(let x=0;x<GameParam.MapSizeX*density;x++) {
			let i = (x + y * (GameParam.MapSizeX*density+1));
			indices[j++] = i+0;
			indices[j++] = i+1;
			indices[j++] = i+0+(GameParam.MapSizeX*density+1);
			indices[j++] = i+1+(GameParam.MapSizeX*density+1);
			indices[j++] = i+0+(GameParam.MapSizeX*density+1);
			indices[j++] = i+1;
		}
	}
	let vertices = new Float32Array((GameParam.MapSizeX*density+1)*(GameParam.MapSizeZ*density+1)*3);
	j=0;
	for(let y=0;y<=GameParam.MapSizeZ*density;y++) {
		for(let x=0;x<=GameParam.MapSizeX*density;x++) {
			vertices[j++] = x/density;
			vertices[j++] = 0;
			vertices[j++] = y/density;
		}
	}
	geometry.dynamic = true;
	geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.setIndex( new THREE.BufferAttribute( indices , 1 ) );
	geometry.computeVertexNormals(true);
	return geometry;
}

var normal_base = new Array((GameParam.MapSizeX+1)*(GameParam.MapSizeX+1));
function updateTerrain(dirty, ax,ay,bx,by) {
	let obj = GameParam.mesh.terrain;
	let geometry = GameParam.mesh.terrain.geometry;
	let vertices = geometry.attributes.position.array;
	let colors = geometry.attributes.color.array;
	let uvs = geometry.attributes.uv.array;
	let normals = geometry.attributes.normal.array;
	let atari = null;
	let snow = null;
	if(editor) {
		atari = GameParam.mesh.atari.geometry.attributes.position.array;
	}
	else if(GameParam.mesh.snow) {
		snow = GameParam.mesh.snow.geometry.attributes.position.array;
	}
	let perlin = new ImprovedNoise();

	const vtx = [
		/*
			0-1  5
			|/  /|
			2  4-3
		*/
		[ [0,0], [0,1], [1,0], [1,1], [1,0], [0,1] ],
		/*
			3  1-2
			|    |
			5-4  0
		*/
		[ [1,1], [1,0], [0,0], [0,0], [0,1], [1,1] ],
	];
	const ivs = [
		[
		//	x  y   j
			 0, 0, 0,
			 0, 0, 1,
			 0, 0, 2,
			 0,-1, 3,
			 0,-1, 4,
			 0,-1, 5,
			-1,-1, 3,
			-1,-1, 4,
			-1,-1, 5,
			-1, 0, 0,
			-1, 0, 1,
			-1, 0, 2,
		],
		[
			 0, 0, 0,
			 0, 0, 1,
			 0, 0, 2,
			 0, 0, 3,
			 0, 0, 4,
			 0, 0, 5,
			 0,-1, 0,
			 0,-1, 1,
			 0,-1, 2,
			 0,-1, 3,
			 0,-1, 4,
			 0,-1, 5,
			-1,-1, 0,
			-1,-1, 1,
			-1,-1, 2,
			-1,-1, 3,
			-1,-1, 4,
			-1,-1, 5,
			-1, 0, 0,
			-1, 0, 1,
			-1, 0, 2,
			-1, 0, 3,
			-1, 0, 4,
			-1, 0, 5,
		]
	];
	//ポリゴンの補間
	if(editor) {
		for(let y=0;y<=(GameParam.MapSizeZ);y++) {
			for(let x=0;x<=GameParam.MapSizeX;x++) {
				let t0 = getTerrainOne(x,y);
				let tl = (x > 0)					? getTerrainOne(x-1,y).kind : 0;
				let tr = (x < GameParam.MapSizeX)	? getTerrainOne(x+1,y).kind : 0;
				let tu = (y > 0)					? getTerrainOne(x,y-1).kind : 0;
				let td = (y < GameParam.MapSizeZ)	? getTerrainOne(x,y+1).kind : 0;

				if((t0.kind & 3) != 3) {	//塗りつぶしでない
					let old = t0.kind;
					t0.kind = 0;
					let side = 0;
					if((tl & 3) == 3 && (tu & 3) == 3 && (tr & 3) == 0 && (td & 3) == 0) {
						t0.kind = 1;
					}
					if((tl & 3) == 0 && (tu & 3) == 0 && (tr & 3) == 3 && (td & 3) == 3) {
						t0.kind = 2;
					}
					if((tl & 3) == 0 && (tu & 3) == 3 && (tr & 3) == 3 && (td & 3) == 0) {
						t0.kind = 5;
					}
					if((tl & 3) == 3 && (tu & 3) == 0 && (tr & 3) == 0 && (td & 3) == 3) {
						t0.kind = 6;
					}
					if((tl & 3) == 3 && (tr & 3) == 3) {
						t0.kind = 3;
					}
					if((tu & 3) == 3 && (td & 3) == 3) {
						t0.kind = 3;
					}
					if(old != t0.kind) {
						if(ax > x) ax = x-1;
						if(ay > y) ay = y-1;
						if(bx < x) bx = x+1;
						if(by < y) by = y+1;
					}
				}
				else {
					t0.kind = 3;
				}
			}
		}
	}
	let SANDR  = 0.9;
	let SANDG  = 0.8;
	let SANDB  = 0.6;
	let GREENR = 0.3;
	let GREENG = 0.8;
	let GREENB = 0.3;
	if(GameParam.season == "winter") {
		GREENR = 1.0;
		GREENG = 1.0;
		GREENB = 1.0;
		SANDR  = (170/255);
		SANDG  = (155/255);
		SANDB  = (108/255);
	}
	else if(GameParam.season == "autumn") {
		SANDR  = 0.9;
		SANDG  = 0.8;
		SANDB  = 0.6;
		GREENR = 0.9;
		GREENG = 0.9;
		GREENB = 0.7;
	}

	for(let y=0;y<(GameParam.MapSizeZ);y++) {
		if(ay != undefined) {
			if(y < ay || y > by) continue;
		}
		for(let x=0;x<GameParam.MapSizeX;x++) {
			if(ax != undefined) {
				if(x < ax || x > bx) continue;
			}
			let i = (x + y * (GameParam.MapSizeX+1));
			let iv = i * 3 * 6;			//vertices
			let it = i * 2 * 6;			//uv
//			let k = ((x%2) == (y%2)) ? 0 : 1;
			let t0 = getTerrainOne(x,y);
			let k = (t0.kind < 4) ? 0 : 1;
			for(let j=0;j<6*3;j+=3) {
				normals[iv+j+0] = 0;
				normals[iv+j+1] = 1;
				normals[iv+j+2] = 0;
			}
			if(!editor){
				if(snow != null) {
					const density = 2;
					const q = 0.3/density;
					for(let y2=0;y2<density;y2++) {
						for(let x2=0;x2<density;x2++) {
							const x3 = x * density + x2;
							const y3 = y * density + y2;
							const j = (x3 + y3 * (GameParam.MapSizeX*density+1)) * 3;
							let h = 0.3 + perlin.noise(x3*q, 0, y3*q) * 0.25;
							let h2 = getHeightf(x3/density,y3/density);
							if(h2 < 0) h += Math.max(-1, 1.8*h2);
							snow[j+1] = h2 * GameParam.HeightScale + h;
						}
					}
				}
			}
			else {
				if(atari != null) {
					let j = (x + y * (GameParam.MapSizeX+1)) * 3;
					atari[j+1] = Math.min(50,t0.atari) * GameParam.HeightScale;
					
					if(x == GameParam.MapSizeX-1) {
						let t1 = getTerrainOne(x+1,y);
						let j2 = j+3;
						atari[j2+1] = Math.min(50,t1.atari) * GameParam.HeightScale;
					}
					if(y == GameParam.MapSizeZ-1) {
						let t1 = getTerrainOne(x,y+1);
						let j2 = j+(GameParam.MapSizeX+1)*3;
						atari[j2+1] = Math.min(50,t1.atari) * GameParam.HeightScale;
					}
				}
			}
			for(let j=0;j<6;j++) {
				let t1 = getTerrainOne(x+vtx[k][j][0], y+vtx[k][j][1]);
				let t1h = t1.height;
				let xx,yy;
				vertices[iv+j*3+0] = xx = x + vtx[k][j][0];
				vertices[iv+j*3+1] = t1h * GameParam.HeightScale;
				vertices[iv+j*3+2] = yy = y + vtx[k][j][1];

				let ofu = 0;
				let ofv = 0;
//				const off = 6/256.0;		//ぎりぎりにすると遠景で細い線が出る
				{
					ofu = vtx[k][j][0];
					ofv = vtx[k][j][1];
//					if		(ofu <= 0.1)	ofu += off;
//					else if	(ofu >= 0.9)	ofu -= off;
//					if		(ofv <= 0.1)	ofv += off;
//					else if	(ofv >= 0.9)	ofv -= off;
					let col;
					if(j <= 2)
						col = (t0.kind & 1) ? 1 : 0;
					else
						col = (t0.kind & 2) ? 1 : 0;

					if(col == 0) {
						ofu = (ofu+x%2)/2;
						ofv = (ofv+y%2)/2;
						const sand = t1.sand;
						colors[iv+j*3+0] = GREENR * (1-sand) + SANDR * sand;
						colors[iv+j*3+1] = GREENG * (1-sand) + SANDG * sand;
						colors[iv+j*3+2] = GREENB * (1-sand) + SANDB * sand;
					}
					else if(col == 1) {
						ofu = (ofu+x%5)/5;
						ofv = (ofv+y%5)/5;
						colors[iv+j*3+0] = 1;
						colors[iv+j*3+1] = 1;
						colors[iv+j*3+2] = 1;
						ofu += 1.0;
					}
					/*if(dirty != undefined) {
						let i2 = Math.floor(x+0.5) + Math.floor(y+0.5) * (GameParam.MapSizeX+1);
						if(dirty[i2]) {
							colors[iv+j*3+0] = (colors[iv+j*3+0]+1)/2;
							colors[iv+j*3+1] *= 0.5;
							colors[iv+j*3+2] *= 0.5;
						}
					}*/
					/*if(xx > GameParam.MapSizeX-15) {
						let rate = Math.sin((GameParam.MapSizeX-xx)/15 * Math.PI/2);
						colors[iv+j*3+0] *= rate;
						colors[iv+j*3+1] *= rate;
						colors[iv+j*3+2] *= rate;
					}*/

//					uvs[it+j*2+0] = (0+ofu) / 4;
//					uvs[it+j*2+1] = 1 - ofv / 2;
					uvs[it+j*2+0] = (0+ofu) / 2;
					uvs[it+j*2+1] = 1 - ofv / 1;
				}
			}
			{
				//法線
				let base = new THREE.Vector3(0,0,0);
				for(let j=0;j<ivs[k].length;j+=9) {
					let ax = x + ivs[k][ j+0 ];
					let ay = y + ivs[k][ j+1 ];
					if(ax < 0 || ax > GameParam.MapSizeX+1 || ay < 0 || ay > GameParam.MapSizeZ+1) continue;
					let ia = (ax + ay*(GameParam.MapSizeX+1))*3*6 + ivs[k][ j+0+2 ]*3;
					let ib = (ax + ay*(GameParam.MapSizeX+1))*3*6 + ivs[k][ j+3+2 ]*3;
					let ic = (ax + ay*(GameParam.MapSizeX+1))*3*6 + ivs[k][ j+6+2 ]*3;
					let ab = new THREE.Vector3(vertices[ib+0]-vertices[ia+0], vertices[ib+1]-vertices[ia+1], vertices[ib+2]-vertices[ia+2]);
					let ca = new THREE.Vector3(vertices[ic+0]-vertices[ia+0], vertices[ic+1]-vertices[ia+1], vertices[ic+2]-vertices[ia+2]);
					base.add( (new THREE.Vector3()).crossVectors(ab,ca) );
				}
				base.add( (new THREE.Vector3(Math.random()*0.4-0.2,Math.random()*0.4,Math.random()*0.4-0.2)) );	//地面の凸凹?
				base.normalize();
				normal_base[i] = base;
			}
		}
	}
	if(0) {	//テスト
	for(let y=0;y<=(GameParam.MapSizeZ);y++) {
		for(let x=0;x<=GameParam.MapSizeX;x++) {
			let i = (x + y * (GameParam.MapSizeX+1));
			let iv = i * 3 * 6;			//vertices
			let it = i * 2 * 6;			//uv
			let t0 = getTerrainOne(x,y);
			let k = (t0.kind < 4) ? 0 : 1;
			for(let j=0;j<6;j++) {
//				let t1 = getTerrainOne(x+vtx[k][j][0], y+vtx[k][j][1]);
				let col;
				if(j <= 2)
					col = (t0.kind & 1) ? 1 : 0;
				else
					col = (t0.kind & 2) ? 1 : 0;

				let gray = 1;
				let x1 = x + vtx[k][j][0];
				let y1 = y + vtx[k][j][1];
				if(col == 0) {
					gray = 1;
					for(let x2=x1-3;x2<x1+3;x2++) {
						for(let y2=y1-3;y2<y1+3;y2++) {
							let x0 = x1-x2;
							let y0 = y1-y2;
							let len = (Math.sqrt(x0*x0 + y0*y0)-1) / 3;
							if((getTerrainOne(x2,y2).kind & 3) != 0) {
								if(len < gray) gray = len;
							}
						}
					}
					if(gray < 0) gray = 0;
					colors[iv+j*3+0] = colors[iv+j*3+0]*(gray)+1.0*(1-gray);
					colors[iv+j*3+1] = colors[iv+j*3+1]*(gray)+0.9*(1-gray);
					colors[iv+j*3+2] = colors[iv+j*3+2]*(gray)+0.8*(1-gray);
				}
				else {
					gray = 1;
					for(let x2=x1-3;x2<x1+3;x2++) {
						for(let y2=y1-3;y2<y1+3;y2++) {
							let x0 = x1-x2;
							let y0 = y1-y2;
							let len = (Math.sqrt(x0*x0 + y0*y0)) / 2;
							if((getTerrainOne(x2,y2).kind & 3) != 3) {
								if(len < gray) gray = len;
							}
						}
					}
					if(gray < 0) gray = 0;
					colors[iv+j*3+0] = colors[iv+j*3+0]*(gray)+0.5*(1-gray);
					colors[iv+j*3+1] = colors[iv+j*3+1]*(gray)+1.0*(1-gray);
					colors[iv+j*3+2] = colors[iv+j*3+2]*(gray)+0.5*(1-gray);
				}
				/*if(gray < 0) gray = 0;
				colors[iv+j*3+0] *= gray;
				colors[iv+j*3+1] *= gray;
				colors[iv+j*3+2] *= gray;
				*/
			}
		}
	}
	}
	for(let y=GameParam.MapSizeZ+1;y<=GameParam.MapSizeX;y++) {
		for(let x=0;x<=GameParam.MapSizeX;x++) {
			let i = (x + y * (GameParam.MapSizeX+1));
			let iv = i * 3 * 6;			//vertices
			for(let j=0;j<6;j++) {
				vertices[iv+j*3+0] = 0;
				vertices[iv+j*3+1] = 0;
				vertices[iv+j*3+2] = 0;
			}
		}
	}
	{
		for(let y=0;y<=GameParam.MapSizeZ;y++) {
			if(ay != undefined) {
				if(y < ay || y > by) continue;
			}
			for(let x=0;x<=GameParam.MapSizeX;x++) {
				if(ax != undefined) {
					if(x < ax || x > bx) continue;
				}
				let i = (x + y * (GameParam.MapSizeX+1));
				let iv = i * 3 * 6;			//vertices
				let k = (getTerrainOne(x,y).kind < 4) ? 0 : 1;
				for(let j=0;j<6;j++) {
					let n = ((x+vtx[k][j][0]) + (y+vtx[k][j][1]) * (GameParam.MapSizeX+1));
					if(n >= 0 && n < normal_base.length && normal_base[n] != null) {
						normals[iv+j*3+0] = normal_base[n].x;
						normals[iv+j*3+1] = normal_base[n].y;
						normals[iv+j*3+2] = normal_base[n].z;
					}
				}
			}
		}
	}
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.uv.needsUpdate = true;
	geometry.attributes.color.needsUpdate = true;
	
		geometry.attributes.normal.needsUpdate = true;
//		geometry.computeVertexNormals();
	if(!editor){
		if(snow) {
			GameParam.mesh.snow.geometry.attributes.position.needsUpdate = true;
			GameParam.mesh.snow.geometry.computeVertexNormals();
		}
	}
	else {
		GameParam.mesh.atari.geometry.attributes.position.needsUpdate = true;
	}
}	//updateTerrain

function createWater(renderer, camera, scene) {
	
	//Oceanには凸凹表現があるが、WaterはReflectを使っているため重い
	if(isWater == 1) {
		// Water
		let waterGeometry;
		if(1) {
			waterGeometry = new THREE.BufferGeometry();
			//地面の低いところだけ構成するgeometry
			//Reflectは面積が小さいほど軽いはずなので
			let size = 0;
			let vertices = new Array();
			for(let y=0;y<=GameParam.MapSizeZ;y++) {
				let left=-1;
				for(let x=0;x<=GameParam.MapSizeX+1;x++) {

					let flg=0;
					for(let ay=y-2;ay<=y+2 && !flg;ay++) {
						for(let ax=x-2;ax<=x+2 && !flg;ax++) {
							if(ax >= 0 && ax <= GameParam.MapSizeX && ay >= 0 && ay < GameParam.MapSizeZ) {
								if(getTerrainOne(ax,ay).height < 0) flg = 1;
							}
						}
					}
					if(x <= GameParam.MapSizeX
					&&(flg)) {
						if(left < 0) {
							left = x;
						}
					}
					else if(left >= 0) {
						let pos = [left,x, 0,0, y,y+1];
						/*
							0-1  5
							|/  /|
							2  4-3
						*/
						const tbl = [	//6x3
							0,2,4,
							0,2,5,
							1,2,4,
						
							1,2,5,
							1,2,4,
							0,2,5,
						];
						for(let j=0;j<tbl.length;j++) {
							vertices.push(pos[tbl[j]]);
						}
						left = -1;
					}
				}
			}
			let vertices_f32 = new Float32Array(vertices.length);
			for(let i=0;i<vertices.length;i++) vertices_f32[i] = vertices[i];
	//		waterGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
			waterGeometry.setAttribute( 'position', new THREE.BufferAttribute( vertices_f32, 3 ) );
		}
		else {
			waterGeometry = new THREE.PlaneBufferGeometry( GameParam.MapSizeX, GameParam.MapSizeZ, 1,1 );
			waterGeometry.rotateX(-Math.PI / 2);
			waterGeometry.translate((GameParam.MapSizeX)/2, 0, (GameParam.MapSizeZ)/2);
		}

		let water = new Water(
			waterGeometry,
			{
				textureWidth : 128,
				textureHeight: 128,
				waterNormals: new THREE.TextureLoader().load( 'texture/waternormals.jpg', function ( texture ) {

					texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

				} ),
				alpha: 0.75,
				sunDirection: new THREE.Vector3(),
				sunColor: 0xffffff,
				waterColor: 0x80ffff,
				distortionScale: 3.7,
				size : 1,
//				fog: scene.fog !== undefined
			}
		);

		water.renderOrder += GameParam.AlphaOrder;
		water.scale.set(GameParam.MapScale,1,GameParam.MapScale);
	
		water.position.set(0,0.9+GameParam.WaterLine,0);
		water.name = "water";
		GameParam.mesh.water = water;
		return water;
	}
	else if(isWater == 2) {
		//海
		let water = new Ocean( renderer, camera, scene,
			{
				USE_HALF_FLOAT: false,
				INITIAL_SIZE: 2048.0/4,		//？
				INITIAL_WIND: [ 0.8*5,0.8*5 ],
				INITIAL_CHOPPINESS: 1.5/1,	//途切れ
				CLEAR_COLOR: [ 1.0, 1.0, 1.0, 0.0 ],
				SUN_DIRECTION: [ - 1.0, 10.0, 1.0 ],
				OCEAN_COLOR: new THREE.Vector3( 0.004, 0.016, 0.047 ),
				SKY_COLOR: new THREE.Vector3( 3.2, 9.6, 12.8 ),
				EXPOSURE: 0.25,			//露出
//				GEOMETRY_ORIGIN: [ 1,2 ],
				GEOMETRY_RESOLUTION: 32,		//geometryのポリゴン数
				GEOMETRY_SIZE: GameParam.MapSizeX/2,	//実寸
				RESOLUTION: 512/2,				//テクスチャの？解像度
			} );
		water.materialOcean.uniforms[ "u_projectionMatrix" ] = { value: camera.projectionMatrix };
		water.materialOcean.uniforms[ "u_viewMatrix" ] = { value: camera.matrixWorldInverse };
		water.materialOcean.uniforms[ "u_cameraPosition" ] = { value: camera.position };

		water.oceanMesh.geometry.translate(0,-0.5, 0);
		water.oceanMesh.renderOrder += GameParam.AlphaOrder;
//		water.oceanMesh.receiveShadow = true;

		water.changed = true;

		GameParam.mesh.water = water;
		return water.oceanMesh;
	}
	return null;
}
function updateWater(delta) {
	let water = GameParam.mesh.water;
	if(isWater == 1) {
		water.material.uniforms[ 'time' ].value += delta/2;
//		water.material.uniforms[ 'sunDirection' ].value.copy( sun_position ).normalize();
//		water.material.opacity = 0.1;
		water.material.transparent = true;
	}
	else if(isWater == 2) {
		// Ocean
		if(water.changed) {
			water.materialOcean.uniforms[ "u_size" ].value = water.size;
			water.materialOcean.uniforms[ "u_sunDirection" ].value.set( water.sunDirectionX, water.sunDirectionY, water.sunDirectionZ );
			water.materialOcean.uniforms[ "u_exposure" ].value = water.exposure;

			water.materialOcean.uniforms[ "u_normalMap" ].value = water.normalMapFramebuffer.texture;
			water.materialOcean.uniforms[ "u_displacementMap" ].value = water.displacementMapFramebuffer.texture;
			//water.materialOcean.uniforms[ "u_projectionMatrix" ].value = camera.projectionMatrix;
			//water.materialOcean.uniforms[ "u_viewMatrix" ].value = camera.matrixWorldInverse;
			//water.materialOcean.uniforms[ "u_cameraPosition" ].value = camera.position;
			water.materialOcean.depthTest = true;
			
			water.materialOcean.transparent = true;
			water.materialOcean.blending = 1;
		}

		water.deltaTime = delta;
		water.render( water.deltaTime );
		water.overrideMaterial = water.materialOcean;
		water.changed = false;
	}
}
const weed_lv = 8;		//１本の頂点数
//const weed_count = 48;	//１束あたりの本数
let weed_count;	//１束あたりの本数
var weed_info;			//情報
var weed_vertices;		//オリジナルの頂点

function createWeed() {
	
	let mat;
	switch(GameParam.season) {
	default:
		mat = new THREE.PointsMaterial({
			// 一つ一つのサイズ
			size: 0.5,
			// 色
			color: 0x20ff20,	//葉
			map: GameParam.getTexture("sakura"),
			transparent: true,
		});
		break;
	case "winter":
		mat = new THREE.PointsMaterial({
			// 一つ一つのサイズ
			size: 0.25,
			// 色
			color: 0xffffff,	//雪
		});
		break;
	case "autumn":
		mat = new THREE.PointsMaterial({
			// 一つ一つのサイズ
			size: 0.5,
			// 色
			color: 0xd0d020,	//枯れ葉
			map: GameParam.getTexture("sakura"),
			transparent: true,
		});
		break;
	case "spring":
		mat = new THREE.PointsMaterial({
			// 一つ一つのサイズ
			size: 0.5,
			// 色
			color: 0xffffff,	//桜
			map: GameParam.getTexture("sakura"),
			transparent: true,
		});
	}
	if(GameParam.PerfMode != 0) {
		const max = 500;
		const leaf_geometry = new THREE.BufferGeometry();
		let leaf_vertices = new Float32Array(3*max);
		for(let i=0;i<max;i++) {
			leaf_vertices[i*3+0] = (Math.random() - 0.5) * 80;
			leaf_vertices[i*3+1] = Math.random() * 20 - 5;
			leaf_vertices[i*3+2] = (Math.random() - 0.5) * 80;
		}
		leaf_geometry.setAttribute( 'position', new THREE.BufferAttribute( leaf_vertices, 3 ) );
		leaf_geometry.dynamic = true;
		GameParam.mesh.leaf = new THREE.Points(leaf_geometry, mat);
		GameParam.mesh.leaf.renderOrder += GameParam.AlphaOrder-1;
		GameParam.mesh.leaf.position.z = GameParam.MapSizeZ;
		GameParam.world_view.add(GameParam.mesh.leaf);
	}
	
	if(GameParam.season == "winter") {
		return;
	}
	//草を生やす領域
	let perlin = new ImprovedNoise();
	const q = 0.3;
	let mp = new Array();
	let a = 0;
	//除草
	let herbicide = new Array();
	for(let z=0;z<GameParam.MapSizeZ;z+=1) {
		for(let x=0;x<GameParam.MapSizeX;x+=1) {
			const t = getTerrainOne(x,z);
			if(t.name == "house") {	//建物
				herbicide.push([x,z, 8.5]);
			}
			else if(t.name == "itembox") {	//宝箱
				herbicide.push([x,z, 1.5]);
			}
			else if(GameParam.season == "autumn") {	//木の下にススキを生やさない
				if(t.name == "tree" || t.name == "bamboo") {
					herbicide.push([x,z, 3]);
				}
			}
		}
	}
	for(let z=0;z<GameParam.MapSizeZ;z+=0.333,a=1-a) {
		let x = a * 0.333/2;
		for(;x<GameParam.MapSizeX;x+=0.333) {

//			let p = perlin.noise( x*q, 0, (z*GameParam.MapSizeZ/GameParam.MapSizeX)*q );
			let p = perlin.noise( x*q, 0, z*q );
			if(Math.random()/2 > p) {
//			if(0.1 > p) {
				continue;
			}

			let x0 = Math.floor(x);
			let z0 = Math.floor(z);
			let t1 = getTerrainOne(x0  ,z0);
			const sand = getSandf(x,z);
			if(sand > Math.random()*0.75 || t1.item != 0) {
				continue;
			}
			if(GameParam.season == "autumn") {
				if(Math.random() < 0.25 || sand > 0.2) {	//間引き
					continue;
				}
			}
			//草を生やさない領域
			let flg = 0;
			for(let h of herbicide) {
				const x2 = x - h[0];
				const y2 = z - h[1];
				if(Math.sqrt(x2*x2+y2*y2) < h[2]) {
					flg = 1;
					break;
				}
			}
			if(flg) continue;
			let t2 = getTerrainOne(x0+1,z0);
			let t3 = getTerrainOne(x0  ,z0+1);
			let t4 = getTerrainOne(x0+1,z0+1);
			if(t1.kind != 0 || t2.kind != 0 || t3.kind != 0 || t4.kind != 0) {
				continue;
			}
			mp.push([x,z]);
		}
	}

	//	const size = Math.floor(GameParam.MapSizeX*GameParam.MapSizeZ*1);
	const size = Math.floor(mp.length*1);
	weed_info = new Array();
	let weed_geometry = new THREE.BufferGeometry();
	let weed_material = new THREE.MeshLambertMaterial( {
//		color:0xffffff,
//		emissive:0x303030,
		color: 0xaaaaaa, 
		emissive:0x303030,
//		transparent:true,
		vertexColors: true,
		side: THREE.DoubleSide} );

	if(GameParam.season != "autumn") {
		weed_count = 32;
	}
	else {
		weed_count = 16;
	}
	let vertices = new Float32Array(3*weed_lv*weed_count);
	let colors   = new Float32Array(3*weed_lv*weed_count);
	let indices  = new Uint32Array(3*(weed_lv/2-1)*weed_count);
	
//	updateWeed(0,1, true);
	{
		const w = 0.25*0.33;
		const h = (GameParam.season == "autumn") ? 0.8 : 0.33;
		const weed_vtx = [
			 0.01*w, h*1.0, 0.13,
			-0.01*w, h*1.0, 0.13,

			 0.2*w, h*0.66, 0.05,
			-0.2*w, h*0.66, 0.05,

			 0.2*w, h*0.33, 0,
			-0.2*w, h*0.33, 0,

			 0.15*w, h*0.0, 0,
			-0.15*w, h*0.0, 0,
		];
		let i,j;
		let iv = 0;
		let ic = 0;
		let ii = 0;
		for(i=0;i<weed_count;i++) {

			let rx = Math.random() * 0.6 - 0.0;	//おじぎ
			let ry = Math.random() * Math.PI*2;	//回転
//			let ry = i / weed_count * Math.PI*2 + Math.random()*0.5;	//回転
			let sc = 0.75 + Math.random() * 0.75;	//大きさ
			let l = Math.random() * 0.3;	//距離
			if(GameParam.season == "autumn") {
//				sc += 1.5;
				l  *= 0.3;
			}
			for(j=0;j<weed_lv;j++) {
				let v = (new THREE.Vector3()).fromArray(weed_vtx,j*3);
				let mat0 = new THREE.Matrix4();
//				mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeTranslation(GameParam.MapSizeX/2,0,GameParam.MapSizeZ/2));
				mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeRotationY(ry));
				mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeTranslation(0,0,l));
				mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeScale(sc,sc,sc));
				mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeRotationX(rx));
				v.applyMatrix4(mat0);
				
				vertices[iv++] = v.x;
				vertices[iv++] = v.y;
				vertices[iv++] = v.z;
			}

			if(GameParam.season == "autumn") {
				for(j=0;j<weed_lv;j++) {
					const rate = (j)/(weed_lv-1);
					colors[ic++] = ((160/255) * (1-rate)) + (0.4 * rate);
					colors[ic++] = ((192/255) * (1-rate)) + (0.5 * rate);
					colors[ic++] = ((145/255) * (1-rate)) + (0.3 * rate);
				}
			}
			else {
				for(j=0;j<weed_lv;j++) {
					const rate = (j)/(weed_lv-1);
					colors[ic++] = (0.3 * (1-rate)) + (0.1 * rate);
					colors[ic++] = (0.9 * (1-rate)) + (0.3 * rate);
					colors[ic++] = (0.2 * (1-rate)) + (0.0 * rate);
				}
			}

			let iv2 = iv/3;
			for(j=0;j<weed_lv/2-1;j++) {
				indices[ii++] = iv2;
				indices[ii++] = iv2+2;
				indices[ii++] = iv2+1;
				indices[ii++] = iv2+3;
				indices[ii++] = iv2+1;
				indices[ii++] = iv2+2;
				iv2 += 2;
			}
		}
	}

	weed_geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	weed_geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	weed_geometry.setIndex( new THREE.BufferAttribute( indices , 1 ) );
	weed_geometry.computeVertexNormals();
//	weed_geometry.dynamic = true;
	GameParam.mesh.weed = new THREE.InstancedMesh( weed_geometry, weed_material, size );
	GameParam.mesh.weed.scale.set(GameParam.MapScale,1,GameParam.MapScale);
//	GameParam.mesh.weed.castShadow = true;

	if(GameParam.season == "autumn") {
		let susuki_geometry = new THREE.PlaneGeometry(1,2.5).translate(0.5, 1.25, 0).rotateY(Math.PI/2);
		let susuki_material = new THREE.MeshLambertMaterial( {
			color: 0xffffff, 
			emissive:0x404040,
			transparent:true,
//			blending: THREE.AdditiveBlending,
			alphaTest:0.3,
			map : GameParam.getTexture("susuki"),
			side: THREE.DoubleSide} );
		GameParam.mesh.susuki = new THREE.InstancedMesh( susuki_geometry, susuki_material, size );
		GameParam.mesh.susuki.scale.set(GameParam.MapScale,1,GameParam.MapScale);
		GameParam.mesh.susuki.renderOrder += GameParam.AlphaOrder;
	}
	
	for(let i=0;i<size && mp.length > 0;i++) {
		
		let x = Math.random();
		let z = Math.random();
		let j = Math.floor(Math.random() * mp.length);
		x = mp[j][0];
		z = mp[j][1];
		mp.splice(j,1);

		let x0 = Math.floor(x);
		let z0 = Math.floor(z);
		let t  = getTerrainOne(x0  ,z0);
		let y;
		y = getHeightf(x,z) * GameParam.HeightScale;

		//法線を傾きに
		let x1 = x0+1;
		let z1 = z0+0;
		let x2 = x0+0;
		let z2 = z0+1;
		let y0 = getTerrainOne(x0,z0).height;
		let y1 = getTerrainOne(x1,z1).height;
		let y2 = getTerrainOne(x2,z2).height;
//		let y4 = getTerrainOne(x3,z3).height;
		let ab = new THREE.Vector3(x1-x0, y1-y0, z1-z0);
		let ca = new THREE.Vector3(x2-x0, y2-y0, z2-z0);
		let nrm = (new THREE.Vector3()).crossVectors(ab,ca);
		nrm.normalize();

		let mat0 = (new THREE.Matrix4()).makeTranslation(x,y,z);
		var qrot = new THREE.Quaternion();
		qrot.setFromUnitVectors(new THREE.Vector3(0,-1,0),nrm);	// (unit vectors)
		mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeRotationFromQuaternion(qrot));
		mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeRotationY(Math.random()*Math.PI*0.66));
		weed_info.push({
			matrix : mat0,
			pos : new THREE.Vector3(x,y,z),
			cnt : 0,
		});
		
		GameParam.mesh.weed.setMatrixAt(i,mat0);
		
		//ススキを草のあるところに生成
		if(GameParam.mesh.susuki) {
			GameParam.mesh.susuki.setMatrixAt(i,mat0);
		}
	}
	GameParam.mesh.weed.instanceMatrix.needsUpdate = true;
	GameParam.mesh.weed.name = "weeds";
	weed_vertices = {...vertices};	//clone

	GameParam.world_view.add(GameParam.mesh.weed);

	if(GameParam.mesh.susuki) {
		GameParam.mesh.susuki.instanceMatrix.needsUpdate = true;
		GameParam.mesh.susuki.name = "susuki";
		GameParam.world_view.add(GameParam.mesh.susuki);
	}
}

//高さを取得（小数点以下は補間）
function getHeightf(x,z) {
	let x0 = Math.floor(x);
	let z0 = Math.floor(z);
	let t1 = getTerrainOne(x0  ,z0).height;
	let t2 = getTerrainOne(x0+1,z0).height;
	let t3 = getTerrainOne(x0  ,z0+1).height;
	let t4 = getTerrainOne(x0+1,z0+1).height;
	let x1 = x - x0;	//0-1
	let z1 = z - z0;	//0-1

	return (t1 * (1-x1) + t2 * (x1)) * (1-z1) +
		   (t3 * (1-x1) + t4 * (x1)) * (  z1);
}
function getAtarif(x,z) {
	let x0 = Math.floor(x);
	let z0 = Math.floor(z);
	let t1 = getTerrainOne(x0  ,z0).atari;
	let t2 = getTerrainOne(x0+1,z0).atari;
	let t3 = getTerrainOne(x0  ,z0+1).atari;
	let t4 = getTerrainOne(x0+1,z0+1).atari;
	let x1 = x - x0;	//0-1
	let z1 = z - z0;	//0-1

	return (t1 * (1-x1) + t2 * (x1)) * (1-z1) +
		   (t3 * (1-x1) + t4 * (x1)) * (  z1);
}
function getSandf(x,z) {
	let x0 = Math.floor(x);
	let z0 = Math.floor(z);
	let t1 = getTerrainOne(x0  ,z0).sand;
	let t2 = getTerrainOne(x0+1,z0).sand;
	let t3 = getTerrainOne(x0  ,z0+1).sand;
	let t4 = getTerrainOne(x0+1,z0+1).sand;
	let x1 = x - x0;	//0-1
	let z1 = z - z0;	//0-1

	return (t1 * (1-x1) + t2 * (x1)) * (1-z1) +
		   (t3 * (1-x1) + t4 * (x1)) * (  z1);
}
	
function getKind(x,z) {
	let x0 = Math.floor(x);
	let z0 = Math.floor(z);
	let kind = getTerrainOne(x0,z0).kind;
	let x1 = x - x0;	//0-1
	let z1 = z - z0;	//0-1
	
	if(kind < 4) {	// "/"
		if(x1 < (1-z1)) {	//左上
			return (kind & 1) != 0;
		}
		else {
			return (kind & 2) != 0;
		}
	}
	else {
		if(x1 > z1) {	//右上
			return (kind & 1) != 0;
		}
		else {
			return (kind & 2) != 0;
		}
	}
}

function updateWeed(player_pos, first) {
	if(!editor){
		//風でなびく
		let wind = Math.sin(Math.cos(count) * Math.PI) * 0.6+0.2;
		if(GameParam.season == "autumn") wind *= 0.5;
		if(GameParam.mesh.weed) {
			if(count2 % 2 == 0) {
				let vertices = GameParam.mesh.weed.geometry.attributes.position.array;
				let i,j;
				let iv = 0;
				for(i=0;i<weed_count;i++) {

					for(j=0;j<weed_lv;j++) {
						let v = (new THREE.Vector3()).fromArray(weed_vertices, iv);
						let rate = v.y + (i/weed_count-0.5)*0.5;
						let mat0 = new THREE.Matrix4();
						mat0 = mat0.multiplyMatrices(mat0, (new THREE.Matrix4()).makeRotationX(rate * wind));
						v.applyMatrix4(mat0);
						
						vertices[iv++] = v.x;
						vertices[iv++] = v.y;
						vertices[iv++] = v.z;
					}
				}
				GameParam.mesh.weed.geometry.attributes.position.needsUpdate = true;
			}
/*			
			//踏むとつぶれる
			let flg = 0;
			for(let i=0;i<weed.length;i++) {
				let c = weed[i].cnt;
				if(weed[i].cnt > 0) weed[i].cnt--;
				let plist = GameParam.getPlayableList();
				for(let p of plist) {
					let l = weed[i].pos.distanceTo(p.mesh.position);
					if(l < 0.5) {
						weed[i].cnt = Math.max(weed[i].cnt, (1-l/0.5)*8);
					}
				}
				if(c != weed[i].cnt) {
					let mat0 = (new THREE.Matrix4()).multiplyMatrices(
						weed[i].matrix,
						(new THREE.Matrix4()).makeScale(1,1-weed[i].cnt/8,1)
					);
					GameParam.mesh.weed.setMatrixAt(i, mat0);
					flg = 1;
				}
			}
			if(flg) {
				GameParam.mesh.weed.instanceMatrix.needsUpdate = true;
			}
*/
			if(GameParam.mesh.susuki) {
				let wind2 =[
//					Math.sin(Math.cos(count+0.0) * Math.PI) * 0.06+0.02,
//					Math.sin(Math.cos(count+0.0) * Math.PI) * 0.06+0.02,
//					Math.sin(Math.cos(count+0.0) * Math.PI) * 0.06+0.02,
					wind * 0.5,
					wind * 0.5,
					wind * 0.5,
				];
				for(let i=0;i<weed_info.length;i++) {
					if(weed_info[i].pos.distanceTo(player_pos) < 30) {
						let mat0 = (new THREE.Matrix4()).multiplyMatrices(
							weed_info[i].matrix,
							(new THREE.Matrix4()).makeRotationX(wind2[i%3])
						);
						GameParam.mesh.susuki.setMatrixAt(i, mat0);
					}
				}
				GameParam.mesh.susuki.instanceMatrix.needsUpdate = true;
			}
		}

		//落ち葉
		if(GameParam.mesh.leaf) {
			if(GameParam.BattleMode == 0) {
	//			GameParam.mesh.leaf.position.copy(player_pos);
	//		let wind = Math.sin(Math.cos(count) * Math.PI) * 0.6+0.2;
				wind += 0.2;
				const r = 0.005;
				let max = GameParam.mesh.leaf.geometry.attributes.position.count;
				let vertices = GameParam.mesh.leaf.geometry.attributes.position.array;
				GameParam.mesh.leaf.position.set(
					player_pos.x*r + GameParam.mesh.leaf.position.x*(1-r),
					player_pos.y*r + GameParam.mesh.leaf.position.y*(1-r),
					player_pos.z*r + GameParam.mesh.leaf.position.z*(1-r));
				for(let i=0;i<max;i++) {
					let r = (1 + (i%30-15)/15 * 0.25) * Math.PI;
					let wv = (wind*0.02 + 0.02 + Math.random() * 0.0);
					vertices[i*3+0] += Math.sin(r) * wv;
					vertices[i*3+2] += Math.cos(r) * wv;
					vertices[i*3+1] -= 0.02 + (Math.sin(i/1)+1) * 0.02;
					if(vertices[i*3+2] < -40) {
						vertices[i*3+2] += 80;
					}
					if(vertices[i*3+0] < -40) {
						vertices[i*3+0] += 80;
					}
					if(vertices[i*3+0] > 40) {
						vertices[i*3+0] -= 80;
					}
					if(vertices[i*3+1] < -5) {
						vertices[i*3+1] += 25;
					}
				}
				GameParam.mesh.leaf.geometry.attributes.position.needsUpdate = true;

				if(count2 % 12 == 0) {
					let tex = GameParam.mesh.leaf.material.map;
					if(tex) {
						let j = Math.floor(Math.random()*4);
						let u = j%2;
						let v = Math.floor(j/2);
						tex.offset.set(1/2*u, 1/2*v);
						tex.repeat.set(1/2, 1/2);
					}
				}
				GameParam.mesh.leaf.visible = true;
			}
			else {
				GameParam.mesh.leaf.visible = false;
			}
		}
	}

}

//樹木などのアイテム
function createItems() {
	let i,j;
	if(GameParam.mesh.items != null) {
		GameParam.world_view.remove(GameParam.mesh.items);
	}
	if(!editor){
		//treeのテクスチャ入れ替え
		let material = GameParam.getMesh("tree").material[0];
		switch(GameParam.season) {
		case "winter":
			material.map = GameParam.getTexture("tree_winter");
			break;
		case "autumn":
			material.map = GameParam.getTexture("tree_autumn");
			break;
		case "spring":
			material.map = GameParam.getTexture("tree_spring");
			break;
		default:
		case "summer":
			material.map = GameParam.getTexture("tree_summer");
			break;
		}
		material.needsUpdate = true;
		material.map.needsUpdate = true;
	}

	let meshs = new THREE.Object3D();
	let matrics = [];
	let item_nums = new Array();
	let enemy_nums = new Array();
	let npc_nums = new Array();
	let point_nums = new Array();
	let map_nums = new Array();
	for(i=0;i<terrain_data.length;i++) {
		if(terrain_data[i].name == undefined) continue;
//		let type = terrain_data[i].item & 0xff;
		let param = terrain_data[i].item >> 8;
		let x = i % (GameParam.MapSizeX+1);
		let z = Math.floor(i / (GameParam.MapSizeX+1));
		let y = getHeightf(x+0.5, z+0.5) * GameParam.HeightScale;

		let matrix = (new THREE.Matrix4()).makeTranslation(x*GameParam.MapScale,y/*GameParam.MapScale*/,z*GameParam.MapScale);
		const name = terrain_data[i].name;
		//座標や大きさのみ
		switch(name) {
		case "bamboo":	//竹
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeTranslation(0.5,Math.random()*-3.5,0.5));
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(0.1,0.1,0.1));
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(Math.random()*Math.PI*2));
			break;
		case "tree":	//樹木
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeTranslation(0.5,1.0-0.6,0.5));
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(0.1,0.1,0.1));
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(Math.random()*Math.PI*2));
			break;
		case "drop":	//ドロップアイテム
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeTranslation(0.5,(GameParam.mesh.snow)?1.0:0.0,0.5));
			if(matrics[name] != undefined) {
				matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(matrics[name].length / 3));
			}
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(0.15,0.15,0.15));
			break;
		case "bridge":	//橋
			let start = new THREE.Vector3(x*GameParam.MapScale,y,z*GameParam.MapScale);
			let target = new THREE.Vector3(
				(param % (GameParam.MapSizeX+1))*GameParam.MapScale,
				terrain_data[param].height * GameParam.HeightScale /* GameParam.MapScale*/,
				Math.floor(param / (GameParam.MapSizeX+1))*GameParam.MapScale);
			let off = target.clone().sub(start);
			let half = target.clone().add(start).multiplyScalar(0.5);

			let len = off.length() / 4;
			matrix = (new THREE.Matrix4()).makeTranslation(half.x, half.y+0.1, half.z);
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).lookAt(half, start, new THREE.Vector3(0,1,0)));
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(Math.PI/2));
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(0.2*len,0.2,0.2));
			break;
		case "itembox":	//宝箱
			item_nums.push((param >> 8)&0xff);
		case "house":	//民家
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeRotationY(param * Math.PI*2 / 255));
//			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeTranslation(0.2,1.0,-0.2));
//			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(0.01, 0.01, 0.01));
			matrix.multiplyMatrices(matrix,(new THREE.Matrix4()).makeScale(0.01, 0.01, 0.01));
			break;

		case "npc":	//NPC
			npc_nums.push((param>>0)&0xff);
			break;
		case "point":	//NPC
			point_nums.push((param>>0)&0xff);
			break;
		case "enemy":	//敵
			enemy_nums.push([(param)&0xff,(param>>8)&0xff,(param>>16)&0xff]);
			break;
		case "start":	//スタート
			break;
		case "move":	//移動
			map_nums.push(param);
			break;
		}
		if(matrics[name] == undefined) matrics[name] = new Array();
		matrics[name].push(matrix);
	}
	function addSymbolMesh(matrics, geometry, rotx, roty, rotz, color, mat) {
		geometry.rotateX(rotx);
		geometry.rotateY(roty);
		geometry.rotateZ(rotz);
		geometry.translate(0,1,0);
		let meshs = new THREE.Object3D();
		if(mat == undefined) mat = new THREE.MeshBasicMaterial( {color: color, side: THREE.DoubleSide} );
		for(let i=0;i<matrics.length;i++) {
			let m = new THREE.Mesh(geometry.clone(), mat );
			m.matrix = matrics[i];
			m.matrixAutoUpdate = false;
			meshs.add( m );
		}
		return meshs;
	}
	let item_meshs = [];
//	for(let n=0;n<matrics.length;n++) {
	for(let name in matrics) {
		const mtx = matrics[name];
		//生成・配置ルール
		if(mtx != null && mtx.length > 0) {
			let geo,obj;
			switch(name) {
//			default:
			case "bamboo":	//樹木
			case "tree":	//樹木
			case "bridge":	//橋
			case "drop":	//ドロップアイテム
			case "house":	//民家
				obj = GameParam.getMesh(name);
				item_meshs[name] = new THREE.InstancedMesh( obj.geometry, obj.material, mtx.length );
				for(i=0;i<item_meshs[name].count;i++) {
					if(!editor && name == "drop") {
						//ロード後にdropを復活させない
						if(GameParam.user.status.drop_flag.includes(i)) {
							mtx[i].identity();	//消去
						}
					}
					item_meshs[name].setMatrixAt(i,mtx[i]);
				}
				if(name == "drop") {
					item_meshs[name].instanceMatrix.setUsage( THREE.DynamicDrawUsage );
				}
				break;
			case "itembox":	//宝箱
				obj = GameParam.getMesh(name);
				item_meshs[name] = new THREE.Object3D();
				for(i=0;i<mtx.length;i++) {
					if(!editor) {
						if(GameParam.user.status.gotitem[ GameParam.user.status.mapno ].includes(i)) {
							//取得済み
							continue;
						}
					}

					let m = cloneAnimated(obj);
					if(editor) {
						m.matrix = mtx[i];
						m.matrixAutoUpdate = false;
					}
					m.name = "itembox-"+i;
					m.castShadow = true;
					item_meshs[name].add(m);
					if(editor) {
						for(let i=0;i<mtx.length;i++) {
							let pos = (new THREE.Vector3()).setFromMatrixPosition(mtx[i]);
							pos.y += 1.2;
							item_meshs[name].add(GameParam.AddDebug3DText(["ItemNo"+item_nums[i]],pos));
						}
					}
				}
				break;
				
			//シンボルのみ、通常は表示しない
			case "npc":	//NPC
				if(editor) {
					item_meshs[name] = new THREE.Object3D();
					item_meshs[name].add(addSymbolMesh(mtx, new THREE.BoxGeometry(0.3,0.3,0.3), Math.PI/4, 0, Math.PI/4, 0x00ff00 ));
					for(let i=0;i<mtx.length;i++) {
						let pos = (new THREE.Vector3()).setFromMatrixPosition(mtx[i]);
						pos.y += 1.5;
						item_meshs[name].add(GameParam.AddDebug3DText(["NPC No"+npc_nums[i]],pos));
					}
				}
				break;
			case "point":	//NPC
				if(editor) {
					item_meshs[name] = new THREE.Object3D();
					item_meshs[name].add(addSymbolMesh(mtx, new THREE.BoxGeometry(0.3,0.3,0.3), Math.PI/4, 0, Math.PI/4, 0x00ffff ));
					for(let i=0;i<mtx.length;i++) {
						let pos = (new THREE.Vector3()).setFromMatrixPosition(mtx[i]);
						pos.y += 1.5;
						item_meshs[name].add(GameParam.AddDebug3DText(["Point No"+point_nums[i]],pos));
					}
				}
				break;
			case "enemy":	//敵
				if(editor) {
					item_meshs[name] = new THREE.Object3D();
					item_meshs[name].add(addSymbolMesh(mtx, new THREE.BoxGeometry(0.3,0.3,0.3), Math.PI/4, 0, Math.PI/4, 0xffff00 ));
					item_meshs[name].add(addSymbolMesh(mtx, new THREE.CylinderGeometry(GameParam.BattleArea/2,GameParam.BattleArea/2,0.3,12,1,true), 0, 0, 0, 0xff0000 ));
					for(let i=0;i<mtx.length;i++) {
						let pos = (new THREE.Vector3()).setFromMatrixPosition(mtx[i]);
						pos.y += 1.5;
						item_meshs[name].add(GameParam.AddDebug3DText(["EnemyNo"+enemy_nums[i][0],"EnemyNo"+enemy_nums[i][1],"EnemyNo"+enemy_nums[i][2]],pos));
					}
				}
				break;
			case "start":
				if(editor) {
					item_meshs[name] = addSymbolMesh(mtx, new THREE.ConeGeometry(0.3,1), Math.PI, 0, 0, 0x0000ff );
				}
				break;
			case "move":	//移動壁/ゲート
				{
					if(editor) {
						item_meshs[name] = addSymbolMesh(mtx, new THREE.ConeGeometry(0.3,1), Math.PI, 0, 0, 0xff0000 );

						for(let i=0;i<mtx.length;i++) {
							let pos = (new THREE.Vector3()).setFromMatrixPosition(mtx[i]);
							pos.y += 1.2;
							let mapno = (map_nums[i] >> 16);
							item_meshs[name].add(GameParam.AddDebug3DText(["MapNo"+mapno],pos));
						}
					}
					else {
						item_meshs[name] = new THREE.Object3D();
					}
					let mat = new THREE.MeshBasicMaterial( {color: 0xffffff, side: editor ? THREE.DoubleSide : THREE.FrontSide, transparent:true, map:GameParam.getTexture("whitefade") } );
					mat.map.center.set(0.5, 0.5);
					mat.map.rotation = 0;
					mat.map.offset.set(0.0, 0.5);
					mat.map.repeat.set(1, 2);
					mat.map.wrapS = mat.map.wrapT = THREE.MirroredRepeatWrapping;
					for(let i=0;i<mtx.length;i++) {
						let sx = ((map_nums[i] >> 8) & 0xff) - 0x7f;
						let sy = ((map_nums[i] >> 0) & 0xff) - 0x7f;
						let r = Math.PI/2;
						if(sx < 0 && sy < 0)	r += Math.PI*0.0
						if(sx > 0 && sy < 0)	r += Math.PI*1.5;
						if(sx > 0 && sy > 0)	r += Math.PI*1.0;
						if(sx < 0 && sy > 0)	r += Math.PI*0.5;
//						let w = Math.max(sx,sy) * 2 + 1;
						let w = Math.max(Math.abs(sx),Math.abs(sy)) * 2 + 1;
						for(let j=0;j<6;j++) {
							let mat2 = mat.clone();
							mat2.opacity = (j+2) / 5;
							let m = new THREE.Mesh(
//								new THREE.PlaneGeometry(1,1).scale(w,20,1).translate(0,1,-j*0.75).rotateY(r),
								new THREE.PlaneGeometry(1,1).scale(w,20,1).translate(0,1,1-j*1.25).rotateY(r),
								mat2 );
							m.matrix = mtx[i];
							m.matrixAutoUpdate = false;
							m.renderOrder = GameParam.AlphaOrder-1-j;
							item_meshs[name].add(m);
						}

					}
				}
				break;
			}
			if(item_meshs[name] != null) {
//				item_meshs[name].name = "item("+(n+1)+")";
				item_meshs[name].name = name;
				meshs.add(item_meshs[name]);
				item_meshs[name].castShadow = true;
			}
		}
	}
	if (item_meshs["bridge"] != undefined) {
		item_meshs["bridge"].receiveShadow = true;	//橋
		item_meshs["bridge"].castShadow = false;
	}
	meshs.name = "itemgroup";

	GameParam.mesh.items = meshs;
	GameParam.world_view.add(meshs);
}


//SkinnedMeshのコピー
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

function update(delta, player_pos) {
	updateWater(delta);
	
	count2++;
	count += delta;

	updateWeed(player_pos, false);
}

//キャラ固有
function updatePersonal(pos) {
	let type = "";
	//雪を踏む
	if(GameParam.mesh.snow != null) {
		let snow = GameParam.mesh.snow.geometry.attributes.position.array;
		const ax = Math.floor(Math.max(pos.x - 3, 0));
		const ay = Math.floor(Math.max(pos.z - 3, 0));
		const bx = Math.floor(Math.min(pos.x + 3, GameParam.MapSizeX));
		const by = Math.floor(Math.min(pos.z + 3, GameParam.MapSizeZ));
		const density = 2;
		let flg = 0;
		for(let y=ay;y<by;y+=1/density) {
			for(let x=ax;x<bx;x+=1/density) {
				const t0 = getTerrainOne(Math.floor(x),Math.floor(y));
				const i = (x*density + y*density * (GameParam.MapSizeX*density+1)) * 3;
				const x0 = x         - pos.x;
				const y0 = t0.height - pos.y;
				const z0 = y         - pos.z;
				const len = Math.sqrt(x0*x0+y0*y0+z0*z0);
				if(len < 1.0) {
					const h = t0.height + 0.3 - 1.2 * (1.0 - Math.sin(len/1.0*Math.PI/2));
					let h2 = snow[i+1];
					snow[i+1] = Math.min(h2, h);
					if(h2 > snow[i+1]) {
						type = "snow";
						flg = 1;
					}
				}
			}
		}
		if(flg) {
	//		GameParam.mesh.snow.geometry.computeVertexNormals();
			GameParam.mesh.snow.geometry.attributes.position.needsUpdate = true;
		}
	}

	//雑草
	if(GameParam.mesh.weed != null) {
		//踏むとつぶれる
		let flg = 0;
		for(let i=0;i<weed_info.length;i++) {
			let c = weed_info[i].cnt;
			if(weed_info[i].cnt > 0) weed_info[i].cnt--;
			let l = weed_info[i].pos.distanceTo(pos);
			if(l < 0.5) {
				weed_info[i].cnt = Math.max(weed_info[i].cnt, (1-l/0.5)*8);
				type = "weed";
			}
			if(c != weed_info[i].cnt) {
				let mat0 = (new THREE.Matrix4()).multiplyMatrices(
					weed_info[i].matrix,
					(new THREE.Matrix4()).makeScale(1,1-weed_info[i].cnt/8,1)
				);
				GameParam.mesh.weed.setMatrixAt(i, mat0);
				flg = 1;
			}
		}
		if(flg) {
			GameParam.mesh.weed.instanceMatrix.needsUpdate = true;
		}
	}
	return type;
}
scope.createTerrain = createTerrain;
scope.createWater = createWater;
scope.createWeed = createWeed;
scope.createItems = createItems;
//scope.updateWater = updateWater;
scope.update = update;
scope.getHeightf = getHeightf;
scope.getSandf = getSandf;
scope.getKind = getKind;
scope.getAtarif = getAtarif;
	

//mapedit
scope.updateTerrain = updateTerrain;
scope.updateWeed = updateWeed;
scope.getTerrainOne = getTerrainOne;
scope.setTerrain = setTerrain;
scope.updatePersonal = updatePersonal;
};

Stage.prototype = Object.create(null);
Stage.prototype.constructor = Stage;

export { Stage };
