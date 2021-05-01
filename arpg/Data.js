
const Data = {
	Item : [
/*
		{
			index:0,
			type:0,	//0=消耗アイテム
			name:"お団子",
			life:100,
			str:"質素なお団子。味方全員の生命力を100回復させる",
		},
		{
			index:1,
			type:0,	//0=消耗アイテム
			name:"みたらし団子",
			life:250,
			str:"おいしいお団子。味方全員の生命力を250回復させる",
		},
		{
			index:2,
			type:0,	//0=消耗アイテム
			name:"三色団子",
			life:10000,
			str:"特別なお団子。味方全員の生命力を全回復させる",
		},
		{
			index:3,
			type:0,	//0=消耗アイテム
			name:"丸薬",
			skill:20,
			str:"味方全員の技力を20回復させる",
		},
		{
			index:4,
			type:0,	//0=消耗アイテム
			name:"秘伝の丸薬",
			skill:1000,
			str:"味方全員の技力を全回復させる",
		},
*/
		{	//ショートカット↑
			index:0,
			type:0,	//0=消耗アイテム
			name:"お団子",
			life:50,
			str:"おいしいお団子。味方全員の生命力を合計50回復",
		},
		{	//ショートカット↓
			index:1,
			type:0,	//0=消耗アイテム
			name:"おはぎ",
			attack_up:450,	//効果時間
			str:"あまーいOHG。戦闘中、しばらく味方全員の攻撃力をアップさせる\n使った分だけ効果時間延長",
		},
		{	//ショートカット→
			index:2,
			type:0,	//0=消耗アイテム
			name:"煎餅",
			defence_up:1,
			str:"盾になりそうなくらい固いおせんべい。体験版では使えません",
		},
		{	//ショートカット←
			index:3,
			type:0,	//0=消耗アイテム
			name:"丸薬",
			skill:20,
			str:"良薬口に苦し。味方全員の技力を合計20回復",
		},
		{
			index:4,
			type:0,	//0=消耗アイテム
			name:"カビた団子",
			str:"没アイテム",
		},
		{
			index:5,
			type:0,	//0=消耗アイテム
			name:"命の薬",
			life:50,
			recover:1,
			str:"戦闘不能になった仲間全員をすぐさま復帰させる",
		},

		{
			index:6,
			type:0,	//0=消耗アイテム
			name:"鬼の牙",
			cost:5,
			str:"【使用不可】霊魂と交換できる",
		},
		{
			index:7,
			type:0,	//0=消耗アイテム
			name:"鬼の角",
			cost:10,
			str:"【使用不可】霊魂と交換できる",
		},
		{
			index:8,
			type:0,	//0=消耗アイテム
			name:"鬼の心臓",
			cost:20,
			str:"【使用不可】霊魂と交換できる。とても希少。",
		},
		{
			index:9,
			type:0,	//0=消耗アイテム
			name:"鬼のパンツ",
			cost:30,
			str:"【使用不可】霊魂と交換できる。いいパンツ。強いぞ。",
		},

		{
			index:10,
			type:1,	//1=技の書
			name:"生命力",
			str:"多いほど敵からの攻撃に耐えられ、０になるとしばらく戦闘不能になります。",
			cost:10,max:9,
		},
		{
			index:11,
			type:1,	//1=技の書
			name:"技力",
			str:"一部の武術で消費します。多いほどたくさん使用できます。",
			cost:10,max:9,
		},
		{
			index:12,
			type:1,	//1=技の書
			name:"縮地",
			str:"防御中にスティック操作で瞬間移動できる",
			cost:10,max:1,
		},
		{
			index:13,
			type:1,	//1=技の書
			name:"風見鶏",
			str:"攻撃時、敵の方向を向く",
			cost:1,max:3,
		},
		{
			index:14,
			type:1,	//1=技の書
			name:"鎧砕き",
			str:"連撃数が上がるほど相手の防御が早く崩れる。段位で性能アップ",
			cost:5,max:5,
		},
		{
			index:15,
			type:1,	//1=技の書
			name:"受け身",
			str:"自身が攻撃中に受けた敵からの攻撃で防御が崩れない／お守りを消費しない。段位で確率アップ",
			cost:5,max:5,
		},
		/*{
			index:16,
			type:1,	//1=技の書
			name:"天の恵み",
			str:"非戦闘時、生命力が徐々に回復",
			cost:15,max:3,
		},*/
		{
			index:16,
			type:1,	//1=技の書
			name:"気功",
			str:"技力が低いとき徐々に回復。段位で効果アップ",
			cost:15,max:3,
		},
		{
			index:17,
			type:1,	//1=技の書
			name:"気合い",
			str:"技力が足りない時でも技力を消費する攻撃系の武術が使える。ただし威力は控えめ",
			cost:10,max:1,
		},
		{
			index:18,
			type:1,	//1=技の書
			name:"溜め攻撃",
			str:"溜め攻撃ができる。段位で威力アップ。【溜可】のある武術のみ",
			cost:15,max:2,
		},
		{
			index:20,
			type:1,	//1=技の書
			name:"絆の力",
			str:"BREAK中、１体に対し３人攻撃時にダメージアップ",
			cost:15,max:1,
		},
		/*{
			index:20,
			type:1,	//1=技の書
			name:"幸運の熊手",
			str:"敵を倒したときに素材を落としやすくなる。段位で確率アップ",
			cost:20,max:5,
		},*/
		{
			index:21,
			type:1,	//1=技の書
			name:"抜刀",
			str:"戦闘開始時に敵全体へダメージ。雑魚の掃討などに。段位で威力アップ",
			cost:20,max:3,
			base:50, rate:10,
		},

	/////////////////////////////////////////////////////////////////////////
		//攻撃技系
		//base:ダメージ基本値
		//rate:段位アップ値
		{
			index:70,
			type:2,	//1=技の書
			name:"三段斬り",
			str:"【珠美専用】基本の三段攻撃。段位で威力アップ【溜可】",
			cost:10,max:5,
			base:25, rate:10,
			attack_area : 1.2,
		},
		{
			index:71,
			type:2,	//1=技の書
			name:"風巻",
			str:"【珠美専用】回転しながら敵を打ち上げる。段位で威力アップ",
			cost:15,max:5,
			base:10, rate:5,
			attack_area : 1.2,
		},
		{
			index:72,
			type:2,	//1=技の書
			name:"旋風",
			str:"【珠美専用】周囲にいる敵をなぎ倒す。段位で威力アップ【溜可】",
			cost:12,max:5,
			base:30, rate:10,
			attack_area : 1.2,
		},
		{
			index:73,
			type:2,	//1=技の書
			name:"嶺渡し",
			str:"【珠美専用】高く飛び上がり強力な一撃を叩きつける。段位で威力アップ\n技力-5",
			cost:25,max:5,
			base:50, rate:15,
			attack_area : 1.2,
			skill:5,
		},
		{
			index:74,
			type:2,	//1=技の書
			name:"疾風",
			str:"【珠美専用】前方に突進する攻撃。段位で威力アップ【溜可】\n技力-2",
			cost:20,max:5,
			base:40, rate:12,
			attack_area : 2,
			skill:2,
		},
		{
			index:79,
			type:2,	//1=技の書
			name:"散花",
			str:"【珠美専用】目に見えない早さで敵に連撃をたたき込む。段位で威力アップ\n技力-20",
			cost:30,max:5,
			base:35, rate:10,
			skill:20,
			attack_area : 2,
		},
		{
			index:77,
			type:3,	//1=技の書
			name:"散花",
			str:"朋花用",
			cost:1,max:1,
			base:50, rate:10,
		},


		{
			index:80,
			type:3,	//1=技の書
			name:"連撃掌",
			str:"【あやめ専用】忍者にとって基本の空手の技。段位で威力アップ",
			cost:10,max:5,
			base:20, rate:10,
			attack_area : 1,
		},
		{
			index:81,
			type:3,	//1=技の書
			name:"手裏剣",
			str:"【あやめ専用】前方に手裏剣を投げる。段位で命中率と威力アップ\n技力-1",
			cost:12,max:5,
			base:50, rate:10,
			skill:1,
			attack_area : 4,
		},
		{
			index:82,
			type:3,	//1=技の書
			name:"昇り三日月",
			str:"【あやめ専用】別名さまーそると。段位で威力アップ【溜可】",
			base:25, rate:10,
			cost:12,max:5,
			attack_area : 1.5,
		},
		{
			index:83,
			type:3,	//1=技の書
			name:"錐揉み",
			str:"【あやめ専用】ドリルは浪漫。空手？段位で威力と貫通力アップ【溜可】",
			base:35, rate:10,
			cost:12,max:5,
			attack_area : 2,
		},
		{
			index:84,
			type:3,	//1=技の書
			name:"焙烙玉",
			str:"【あやめ専用】ほうろくだま。前方に爆弾を投げる。段位で威力アップ\n技力-5【溜可】",
			cost:15,max:5,
			base:5, rate:2,
			skill:5,
			attack_area : 3,
		},
		{
			index:89,
			type:3,	//1=技の書
			name:"影分身",
			str:"【あやめ専用】自動で戦う分身を作る。段位で耐久力アップ\n技力-20",
			cost:30,max:5,
			base:0, rate:0,
			skill:20,
		},
		{
			index:87,
			type:3,	//1=技の書
			name:"手裏剣大回転",
			str:"エミリー用",
			cost:1,max:1,
			base:50, rate:10,
		},

		{
			index:90,
			type:4,	//1=技の書
			name:"棒術",
			str:"【歌鈴専用】錫杖（しゃくじょう）は振り回すものではありません。段位で威力アップ",
			base:20, rate:10,
			cost:7,max:5,
			attack_area : 1.4,
		},
		{
			index:91,
			type:4,	//1=技の書
			name:"陽炎",
			str:"【歌鈴専用】神聖な火での範囲攻撃。段位で威力アップ\n技力-2",
			cost:10,max:5,
			base:30, rate:10,
			skill:2,
			attack_area : 2,
		},
		{
			index:92,
			type:4,	//1=技の書
			name:"守護殿",
			str:"【歌鈴専用】全員を守護する光の円、いわゆるバリアを作る。段位で持続時間アップ\n技力-5",
			cost:5,max:5,
			base:0, rate:0,
			skill:5,
		},
		{
			index:93,
			type:4,	//1=技の書
			name:"裁きの雷",
			str:"【歌鈴専用】ダメージ＋しばらく敵の動きを止める。段位で威力アップ\n技力-5",
			cost:15,max:5,
			base:120, rate:15,
			skill:5,
			attack_area : 4,
		},
		/*{
			index:94,
			type:4,	//1=技の書
			name:"清めの水",
			str:"【歌鈴専用】技力消費し、しばらくの間味方２人の攻撃力アップ。段位で性能アップ",
			cost:5,max:5,
			base:50, rate:25,
			skill:10,
		},*/
		{
			index:94,
			type:4,	//1=技の書
			name:"土地神の札",
			str:"【歌鈴専用】触れた者に大地の一撃を与えるお札を設置する。段位で威力アップ\n技力-3",
			cost:15,max:5,
			base:50, rate:25,
			skill:3,
			attack_area : 1.1,
		},
		{
			index:97,
			type:4,	//1=技の書
			name:"氷の刃",
			str:"紬専用",
			cost:1,max:1,
			base:50, rate:25,
		},
		{
			index:99,
			type:4,	//1=技の書
			name:"聖なる光",
			str:"【歌鈴専用】聖なる光(線)で敵を浄化。段位で威力アップ\n技力-25",
			cost:30,max:5,
			base:15, rate:5,
			skill:25,
			attack_area : 3,
		},
	],
	
	LocationName : [
		"スズランの村",		//0
		"スズラン街道 壱",
		"スズラン街道 弐",
		"スズラン街道 ?",	//3予備
		"ヤマユリ谷 壱",	//4
		"ヤマユリ谷 弐",
		"ヤマユリ谷 参",
		"ヤマユリ谷 ?",		//7予備
		"ヤマユリ滝",		//8

		"カタクリ海岸",	//9
		"カタクリ盆地 壱",
		"カタクリ盆地 弐",
		"カタクリ盆地 ?",		//12予備
		"ススキ草原 壱",
		"ススキ草原 弐",
		"ススキ草原 参",
		"ススキ草原 ?",		//16予備
		"ススキ砦跡",		//17

		"キキョウ街道 壱",		//18
		"キキョウ街道 弐",
		"キキョウ街道 参",
		"キキョウ街道 四",		//21
		"キキョウの里",
		"キキョウの里 ?",		//23予備
		"キキョウの里 ?",		//24予備
		"キキョウの里 決戦",	//25
		"混沌の間",				//26
		"イベント：桃子邸(?)",	//27
	],
	//ファストトラベル情報
	Travel : [
		{
			name:"スズランの村",
			mapno:0,
			prev:-1,
			unlock:9,
		},
		{
			name:"ヤマユリ谷",
			mapno:4,
			prev:-1,
			unlock:9,
		},
		{
			name:"ヤマユリ滝前",
			mapno:6,
			prev:2,
			unlock:9,
		},
		{
			name:"カタクリ海岸",
			mapno:9,
			prev:-1,
			unlock:9,
		},
		{
			name:"ススキ草原",
			mapno:13,
			prev:-2,
			unlock:18,
		},
		{
			name:"ススキ砦前",
			mapno:15,
			prev:2,
			unlock:18,
		},
		{
			name:"キキョウ街道",
			mapno:18,
			prev:-1,
			unlock:18,
		},
		{
			name:"キキョウの里",
			mapno:22,
			prev:-1,
			unlock:22,
		},
	],
	//進行先がボスステージかどうかの確認用
	BossCheck : {
		"8"  : 0,
		"17" : 1,
		"25" : 2,
		"26" : 3,
	},
	CharaName : {
		"tamami"  : "珠美",
		"ayame"   : "あやめ",
		"karin"   : "歌鈴",
		"hotaru"  : "ほたる",
		"momoko"  : "桃子",
		"emily"   : "エミリー",
		"tomoka"  : "朋花",
		"tsumugi" : "紬",
		"enemy00" : "骸鬼",
		"enemy01" : "骸鬼・投",
		"enemy02" : "骸鬼・這",
		"enemy03" : "骸鬼・羽",
		"enemy04" : "骸鬼・棒",
		"enemy10" : "剛骸鬼",
		"kumo"    : "怨毒の大蜘蛛",
	},
	
	Enemy : {
		
		//鬼通常
		"enemy00" : {
			life : 160,
			attack : 10,
			step : 1,
			drop : 6,	//牙
			cost : 1,
			item : [0],	//お団子
		},
		//投石
		"enemy01" : {
			life : 180,
			attack : 12,
			step : 1,
			drop : 6,	//牙
			cost : 1.1,
			item : [0,0,3],	//お団子・丸薬
		},
		//這い
		"enemy02" : {
			life : 180,
			attack : 14,
			step : 1,
			drop : 7,	//角
			cost : 1.2,
			item : [0,1,3],	//お団子・丸薬
		},
		//羽
		"enemy03" : {
			life : 180,
			attack : 12,
			step : 1,
			drop : 8,	//心臓
			cost : 1.5,
			item : [0,1,1],	//お団子
		},
		//棒
		"enemy04" : {
			life : 210,
			attack : 16,
			step : 1,
			drop : 7,	//角
			cost : 1.3,
			item : [0,0,3],	//お団子
		},
		//剛
		"enemy10" : {
			life : 260,
			attack : 22,
			step : 1,
			drop : 9,	//パンツ
			cost : 2,
			item : [0,1,3],	//三色団子
		},
		"emily" : {
			life : 2000,
			attack : 23,
			step : 1,
			drop : 5,	//命の薬
			cost : 50,
			item2 : [5,84],	//必ず落とす
		},
		"tsumugi" : {
			life : 2800,
			attack : 27,
			step : 1,
			drop : 5,	//命の薬
			cost : 75,
			item2 : [5,79],	//必ず落とす
		},
		"tomoka" : {
			life : 3300,
			attack : 33,
			step : 1,
			drop : 5,	//命の薬
			cost : 100,
			item2 : [5],	//必ず落とす
		},
		"kumo" : {
			life : 5000,
			attack : 40,
			step : 1,
		},
	},
	MapItemName : [
		"bamboo",	//0
		"bridge",	//1
		"itembox",	//2
		"drop",		//3
		"tree",		//4
		"house",	//5
		"",			//6
		"",			//7
		"npc",		//8
		"enemy",	//9
		"start",	//10
		"move",		//11
	],
};

/*							武術			特技			敵		

0	x	"スズランの村",						風見鶏			通常	石			春			昼
1	x	"スズラン街道 1"	歌1:盾												春
2	x	"スズラン街道 2"	珠1:巻			縮地								春
3
4	x	"ヤマユリ谷 1",		あ1:錐			溜め攻撃		這い				夏（竹林）	夜
5	x	"ヤマユリ谷 2",						気功
6	x	"ヤマユリ谷 3",		珠2:疾風		
7
8	x	"ヤマユリ滝",		あ2:爆												＊			昼
9	x	"カタクリ海岸1",	歌2:地							棒					夏（海岸）	昼
10	x	"カタクリ平原2",					鎧砕き								夏
11	x	"カタクリ平原3",	あ3:蹴												夏
12
13	x	"ススキ平 1",		珠3:嶺渡		破れか								秋			夜
14	x	"ススキ平 2",		歌3:雷							羽					秋
15		"ススキ平 3",						受け身								秋
16
17	x	"ススキ砦",			珠4													＊			夜
18		"ソバナ街道 壱",	あ4				抜刀			剛					冬			昼
19		"ソバナ街道 弐",	歌4													冬
20		"ソバナ街道 参",														冬
21		"ソバナ街道 四",					熊手								冬
//21		"キキョウ街道 1"													春			夜
22		"キキョウの里"															春
23
24
25		キキョウの里															＊
26		混沌の間
27		イベント用
*/

export { Data };

