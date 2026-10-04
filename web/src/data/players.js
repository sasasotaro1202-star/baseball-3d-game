
// Clean-room player database.
// Current NPB status is aligned to the 2026 NPB player / All-Star lists.
// Ratings are original game values, not copied from any proprietary baseball game.
const clamp=(v)=>Math.max(1,Math.min(99,Math.round(v)));
const appearance=(id,build='athletic',batting='right')=>({
  skinColor:0xc98262,
  build,
  batting,
  signature:'standard',
  height:build==='tall'?1.04:build==='lean'?0.99:1
});
const makePlayer=(id,name,pos,rank,stats,meta={})=>({
  id,name,pos,rank,
  rarity:meta.rarity||({S:'STAR',A:'PRO',B:'ROOKIE',C:'DEVELOPMENT',D:'DEVELOPMENT',F:'DEVELOPMENT'}[rank]||'DEVELOPMENT'),
  league:meta.league||'NPB',
  status:meta.status||'ACTIVE',
  team:meta.team||'NPB',
  teamCode:meta.teamCode||'NPB',
  era:meta.era||'2026',
  origin:meta.origin||'JAPAN',
  gachaWeight:meta.gachaWeight||1,
  featuredTag:meta.featuredTag||'',
  achievements:meta.achievements||[],
  abilities:meta.abilities||[],
  ...appearance(id,meta.build||'athletic',meta.batting||'right'),
  ...Object.fromEntries(Object.entries({power:70,contact:70,field:70,speed:70,arm:70,control:70,stamina:70,vision:70,...stats}).map(([k,v])=>[k,clamp(v)]))
});

// ---- NPB 2026 core: IDs 1-19 are intentionally stable because the match controller uses them.
export const NPB_ACTIVE_PLAYERS=[
makePlayer(1,'宮城 大弥','P','S',{power:48,contact:28,field:72,speed:52,arm:78,control:94,stamina:91,vision:88},{team:'オリックス・バファローズ',teamCode:'B',batting:'left',featuredTag:'ACE',abilities:[['velocity',.06],['consistency',.06]]}),
makePlayer(2,'森下 翔太','OF','S',{power:86,contact:82,field:74,speed:72,arm:77,control:42,stamina:87,vision:82},{team:'阪神タイガース',teamCode:'T',featuredTag:'STAR',abilities:[['power_hitter',.06],['big_game',.04]]}),
makePlayer(3,'佐藤 輝明','3B','S',{power:92,contact:72,field:72,speed:76,arm:86,control:44,stamina:90,vision:75},{team:'阪神タイガース',teamCode:'T',batting:'left',featuredTag:'STAR',abilities:[['power_hitter',.08],['strong_arm',.05]]}),
makePlayer(4,'牧 秀悟','2B','S',{power:86,contact:84,field:78,speed:62,arm:77,control:46,stamina:88,vision:85},{team:'横浜DeNAベイスターズ',teamCode:'DB',featuredTag:'STAR',abilities:[['contact_hitter',.06],['clutch',.04]]}),
makePlayer(5,'近本 光司','OF','A',{power:61,contact:87,field:82,speed:91,arm:68,control:40,stamina:92,vision:91},{team:'阪神タイガース',teamCode:'T',batting:'left',featuredTag:'LEADOFF',abilities:[['leadoff',.06],['speedster',.07]]}),
makePlayer(6,'中村 悠平','C','A',{power:55,contact:73,field:88,speed:42,arm:91,control:40,stamina:82,vision:86},{team:'東京ヤクルトスワローズ',teamCode:'S',featuredTag:'CATCHER',abilities:[['strong_arm',.06],['leadership',.05]]}),
makePlayer(7,'近藤 健介','OF','S',{power:82,contact:94,field:82,speed:64,arm:72,control:40,stamina:90,vision:96},{team:'福岡ソフトバンクホークス',teamCode:'H',featuredTag:'STAR',build:'lean',abilities:[['contact_hitter',.08],['walk_machine',.06],['vision',.05]]}),
makePlayer(8,'柳田 悠岐','OF','S',{power:91,contact:82,field:79,speed:73,arm:88,control:40,stamina:82,vision:84},{team:'福岡ソフトバンクホークス',teamCode:'H',featuredTag:'VETERAN_STAR',build:'tall',abilities:[['power_hitter',.07],['big_game',.05],['strong_arm',.04]]}),
makePlayer(9,'周東 佑京','OF','A',{power:48,contact:74,field:84,speed:98,arm:73,control:40,stamina:91,vision:82},{team:'福岡ソフトバンクホークス',teamCode:'H',batting:'left',featuredTag:'SPEED',abilities:[['speedster',.09],['base_running',.08]]}),
makePlayer(10,'清宮 幸太郎','1B','A',{power:84,contact:78,field:72,speed:54,arm:71,control:40,stamina:89,vision:79},{team:'北海道日本ハムファイターズ',teamCode:'F',batting:'left',featuredTag:'BREAKOUT',abilities:[['power_hitter',.06],['clutch',.04]]}),
makePlayer(11,'中野 拓夢','2B','A',{power:55,contact:82,field:88,speed:89,arm:70,control:42,stamina:93,vision:88},{team:'阪神タイガース',teamCode:'T',batting:'left',featuredTag:'LEADOFF',abilities:[['range',.05],['base_running',.06]]}),
makePlayer(12,'長岡 秀樹','SS','A',{power:48,contact:77,field:92,speed:72,arm:80,control:40,stamina:91,vision:80},{team:'東京ヤクルトスワローズ',teamCode:'S',batting:'left',featuredTag:'GLOVE',abilities:[['range',.07],['first_step',.06]]}),
makePlayer(13,'栗原 陵矢','IF','A',{power:80,contact:79,field:82,speed:61,arm:88,control:41,stamina:88,vision:82},{team:'福岡ソフトバンクホークス',teamCode:'H',batting:'left',featuredTag:'UTILITY',abilities:[['clutch',.05],['strong_arm',.04]]}),
makePlayer(14,'万波 中正','OF','S',{power:91,contact:68,field:81,speed:82,arm:94,control:39,stamina:90,vision:72},{team:'北海道日本ハムファイターズ',teamCode:'F',build:'tall',featuredTag:'POWER',abilities:[['power_hitter',.08],['strong_arm',.07]]}),
makePlayer(15,'西川 龍馬','OF','A',{power:72,contact:86,field:77,speed:68,arm:74,control:40,stamina:87,vision:88},{team:'オリックス・バファローズ',teamCode:'B',batting:'left',featuredTag:'CONTACT',abilities:[['contact_hitter',.07],['consistency',.05]]}),
makePlayer(16,'坂倉 将吾','C','A',{power:78,contact:84,field:84,speed:42,arm:82,control:41,stamina:86,vision:87},{team:'広島東洋カープ',teamCode:'C',batting:'left',featuredTag:'CATCHER',abilities:[['contact_hitter',.05],['clutch',.04]]}),
makePlayer(17,'大山 悠輔','1B','A',{power:80,contact:78,field:81,speed:52,arm:72,control:40,stamina:92,vision:83},{team:'阪神タイガース',teamCode:'T',featuredTag:'VETERAN',abilities:[['clutch',.06],['durability',.05]]}),
makePlayer(18,'伊藤 大海','P','S',{power:52,contact:30,field:75,speed:50,arm:80,control:93,stamina:94,vision:89},{team:'北海道日本ハムファイターズ',teamCode:'F',batting:'left',featuredTag:'ACE',abilities:[['velocity',.06],['consistency',.07]]}),
makePlayer(19,'才木 浩人','P','S',{power:46,contact:26,field:74,speed:50,arm:82,control:91,stamina:96,vision:88},{team:'阪神タイガース',teamCode:'T',build:'tall',featuredTag:'ACE',abilities:[['velocity',.07],['stamina',.06]]}),
makePlayer(20,'高橋 遥人','P','S',{power:45,contact:25,field:73,speed:48,arm:80,control:95,stamina:89,vision:90},{team:'阪神タイガース',teamCode:'T',batting:'left',featuredTag:'ELITE',abilities:[['consistency',.08],['strikeout',.05]]}),
makePlayer(21,'戸郷 翔征','P','A',{power:44,contact:24,field:71,speed:50,arm:79,control:87,stamina:92,vision:84},{team:'読売ジャイアンツ',teamCode:'G',featuredTag:'ACE'}),
makePlayer(22,'大勢','P','A',{power:42,contact:22,field:70,speed:47,arm:91,control:88,stamina:78,vision:85},{team:'読売ジャイアンツ',teamCode:'G',featuredTag:'CLOSER',abilities:[['velocity',.08],['clutch',.05]]}),
makePlayer(23,'東 克樹','P','A',{power:38,contact:22,field:70,speed:46,arm:74,control:92,stamina:91,vision:87},{team:'横浜DeNAベイスターズ',teamCode:'DB',batting:'left',featuredTag:'CONTROL',abilities:[['consistency',.07]]}),
makePlayer(24,'平良 海馬','P','A',{power:50,contact:20,field:72,speed:55,arm:95,control:89,stamina:87,vision:85},{team:'埼玉西武ライオンズ',teamCode:'L',featuredTag:'POWER_ARM',abilities:[['velocity',.09],['strong_arm',.03]]}),
makePlayer(25,'北山 亘基','P','A',{power:41,contact:21,field:73,speed:52,arm:83,control:88,stamina:88,vision:83},{team:'北海道日本ハムファイターズ',teamCode:'F',featuredTag:'BREAKOUT'}),
makePlayer(26,'武内 夏暉','P','A',{power:43,contact:23,field:72,speed:47,arm:81,control:91,stamina:90,vision:86},{team:'埼玉西武ライオンズ',teamCode:'L',batting:'left',featuredTag:'BREAKOUT'}),
makePlayer(27,'今井 達也','P','S',{power:47,contact:21,field:72,speed:48,arm:94,control:90,stamina:93,vision:87},{team:'埼玉西武ライオンズ',teamCode:'L',featuredTag:'ACE',abilities:[['velocity',.09],['strikeout',.07]]}),
makePlayer(28,'松山 晋也','P','A',{power:41,contact:18,field:71,speed:45,arm:91,control:90,stamina:79,vision:83},{team:'中日ドラゴンズ',teamCode:'D',featuredTag:'CLOSER'}),
makePlayer(29,'田宮 裕涼','C','A',{power:61,contact:81,field:82,speed:68,arm:83,control:40,stamina:84,vision:85},{team:'北海道日本ハムファイターズ',teamCode:'F',batting:'left',featuredTag:'BREAKOUT'}),
makePlayer(30,'太田 椋','2B','A',{power:76,contact:80,field:83,speed:72,arm:78,control:39,stamina:85,vision:82},{team:'オリックス・バファローズ',teamCode:'B',featuredTag:'BREAKOUT'}),
makePlayer(31,'村松 開人','SS','A',{power:50,contact:79,field:87,speed:76,arm:79,control:39,stamina:88,vision:84},{team:'中日ドラゴンズ',teamCode:'D',batting:'left',featuredTag:'BREAKOUT'}),
makePlayer(32,'水野 達稀','SS','B',{power:54,contact:75,field:84,speed:75,arm:80,control:38,stamina:87,vision:80},{team:'北海道日本ハムファイターズ',teamCode:'F',batting:'left',featuredTag:'NEXT'}),
makePlayer(33,'滝澤 夏央','2B','B',{power:39,contact:72,field:90,speed:91,arm:68,control:38,stamina:84,vision:78},{team:'埼玉西武ライオンズ',teamCode:'L',batting:'left',featuredTag:'NEXT',build:'lean'}),
makePlayer(34,'西川 史礁','OF','B',{power:72,contact:75,field:76,speed:82,arm:78,control:38,stamina:86,vision:78},{team:'千葉ロッテマリーンズ',teamCode:'M',featuredTag:'ROOKIE'}),
makePlayer(35,'浦田 俊輔','SS','B',{power:43,contact:70,field:82,speed:88,arm:75,control:38,stamina:85,vision:79},{team:'読売ジャイアンツ',teamCode:'G',batting:'left',featuredTag:'ROOKIE'}),
makePlayer(36,'今朝丸 裕喜','P','B',{power:43,contact:18,field:67,speed:46,arm:78,control:82,stamina:83,vision:78},{team:'阪神タイガース',teamCode:'T',featuredTag:'ROOKIE',build:'tall'}),
makePlayer(37,'門別 啓人','P','B',{power:39,contact:18,field:67,speed:47,arm:77,control:84,stamina:82,vision:79},{team:'阪神タイガース',teamCode:'T',batting:'left',featuredTag:'NEXT'}),
makePlayer(38,'中村 優斗','P','B',{power:42,contact:18,field:68,speed:48,arm:87,control:82,stamina:80,vision:77},{team:'東京ヤクルトスワローズ',teamCode:'S',featuredTag:'ROOKIE',build:'tall'}),
makePlayer(39,'泉口 友汰','SS','B',{power:45,contact:73,field:83,speed:72,arm:74,control:38,stamina:86,vision:78},{team:'読売ジャイアンツ',teamCode:'G',batting:'left',featuredTag:'NEXT'}),
makePlayer(40,'大津 亮介','P','A',{power:38,contact:18,field:68,speed:44,arm:75,control:89,stamina:88,vision:82},{team:'福岡ソフトバンクホークス',teamCode:'H',featuredTag:'BREAKOUT'}),
makePlayer(41,'椋木 蓮','P','B',{power:44,contact:18,field:68,speed:45,arm:83,control:85,stamina:79,vision:79},{team:'オリックス・バファローズ',teamCode:'B',featuredTag:'COMEBACK'}),
makePlayer(42,'横山 陸人','P','B',{power:40,contact:18,field:68,speed:45,arm:86,control:84,stamina:78,vision:78},{team:'千葉ロッテマリーンズ',teamCode:'M',featuredTag:'NEXT'}),
makePlayer(43,'岩城 颯空','P','B',{power:42,contact:18,field:67,speed:44,arm:81,control:81,stamina:76,vision:76},{team:'埼玉西武ライオンズ',teamCode:'L',batting:'left',featuredTag:'ROOKIE'}),
makePlayer(44,'松尾 汐恩','C','B',{power:64,contact:72,field:79,speed:58,arm:87,control:37,stamina:82,vision:78},{team:'横浜DeNAベイスターズ',teamCode:'DB',featuredTag:'NEXT'}),
makePlayer(45,'小園 海斗','SS','A',{power:64,contact:83,field:83,speed:80,arm:81,control:39,stamina:91,vision:85},{team:'広島東洋カープ',teamCode:'C',featuredTag:'STAR'}),
makePlayer(46,'宮﨑 敏郎','3B','A',{power:78,contact:88,field:80,speed:36,arm:80,control:38,stamina:83,vision:91},{team:'横浜DeNAベイスターズ',teamCode:'DB',featuredTag:'VETERAN',build:'stocky'}),
makePlayer(47,'菊池 涼介','2B','A',{power:55,contact:72,field:97,speed:70,arm:88,control:38,stamina:90,vision:82},{team:'広島東洋カープ',teamCode:'C',featuredTag:'GLOVE',abilities:[['range',.09],['first_step',.08]]}),
makePlayer(48,'紅林 弘太郎','SS','B',{power:62,contact:70,field:80,speed:57,arm:88,control:37,stamina:87,vision:77},{team:'オリックス・バファローズ',teamCode:'B',featuredTag:'NEXT'}),
makePlayer(49,'村林 一輝','SS','B',{power:44,contact:74,field:86,speed:78,arm:79,control:38,stamina:88,vision:79},{team:'東北楽天ゴールデンイーグルス',teamCode:'E',featuredTag:'NEXT'}),
makePlayer(50,'小川 龍成','2B','B',{power:40,contact:72,field:84,speed:83,arm:72,control:37,stamina:85,vision:79},{team:'千葉ロッテマリーンズ',teamCode:'M',batting:'left',featuredTag:'NEXT'})
];

// Fresh / breakout depth: real 2026 NPB players that can live below the superstar tier.
// They are deliberately lower-rank and appear in the NEXT / standard pools.
export const NPB_BREAKOUT_PLAYERS=[
makePlayer(101,'赤星 優志','P','C',{power:35,contact:16,field:64,speed:45,arm:71,control:79,stamina:78,vision:75},{team:'読売ジャイアンツ',teamCode:'G',featuredTag:'NEXT'}),
makePlayer(102,'及川 雅貴','P','C',{power:36,contact:16,field:64,speed:46,arm:76,control:78,stamina:80,vision:74},{team:'阪神タイガース',teamCode:'T',batting:'left',featuredTag:'NEXT'}),
makePlayer(103,'奥川 恭伸','P','B',{power:38,contact:17,field:65,speed:46,arm:79,control:83,stamina:77,vision:76},{team:'東京ヤクルトスワローズ',teamCode:'S',featuredTag:'COMEBACK'}),
makePlayer(104,'友杉 篤輝','SS','C',{power:37,contact:68,field:82,speed:87,arm:67,control:36,stamina:84,vision:75},{team:'千葉ロッテマリーンズ',teamCode:'M',featuredTag:'NEXT'}),
makePlayer(105,'中川 圭太','IF','B',{power:57,contact:76,field:80,speed:73,arm:72,control:37,stamina:89,vision:82},{team:'オリックス・バファローズ',teamCode:'B',featuredTag:'UTILITY'}),
makePlayer(106,'野口 智哉','IF','C',{power:48,contact:66,field:78,speed:69,arm:77,control:36,stamina:84,vision:73},{team:'オリックス・バファローズ',teamCode:'B',featuredTag:'NEXT'}),
makePlayer(107,'中島 大輔','OF','C',{power:42,contact:69,field:76,speed:89,arm:65,control:36,stamina:80,vision:74},{team:'東北楽天ゴールデンイーグルス',teamCode:'E',batting:'left',featuredTag:'SPEED'}),
makePlayer(108,'秋広 優人','IF','B',{power:66,contact:67,field:72,speed:64,arm:75,control:36,stamina:85,vision:73},{team:'福岡ソフトバンクホークス',teamCode:'H',batting:'left',featuredTag:'BREAKOUT',build:'tall'}),
makePlayer(109,'浅野 翔吾','OF','B',{power:62,contact:70,field:75,speed:77,arm:75,control:36,stamina:81,vision:76},{team:'読売ジャイアンツ',teamCode:'G',featuredTag:'NEXT'}),
makePlayer(110,'荒巻 悠','IF','C',{power:57,contact:64,field:72,speed:65,arm:71,control:35,stamina:79,vision:71},{team:'読売ジャイアンツ',teamCode:'G',featuredTag:'ROOKIE'}),
makePlayer(111,'大川 慈英','P','C',{power:34,contact:14,field:62,speed:43,arm:74,control:77,stamina:72,vision:72},{team:'北海道日本ハムファイターズ',teamCode:'F',featuredTag:'ROOKIE'}),
makePlayer(112,'大内 誠弥','P','C',{power:36,contact:14,field:63,speed:44,arm:76,control:78,stamina:74,vision:71},{team:'東北楽天ゴールデンイーグルス',teamCode:'E',featuredTag:'ROOKIE'}),
makePlayer(113,'杉山 遙希','P','C',{power:35,contact:14,field:63,speed:43,arm:75,control:80,stamina:73,vision:72},{team:'埼玉西武ライオンズ',teamCode:'L',batting:'left',featuredTag:'ROOKIE'}),
makePlayer(114,'佐野 恵太','OF','A',{power:73,contact:83,field:71,speed:49,arm:70,control:36,stamina:89,vision:86},{team:'横浜DeNAベイスターズ',teamCode:'DB',batting:'left',featuredTag:'VETERAN'}),
makePlayer(115,'岡林 勇希','OF','A',{power:45,contact:83,field:85,speed:89,arm:71,control:36,stamina:92,vision:84},{team:'中日ドラゴンズ',teamCode:'D',batting:'left',featuredTag:'CONTACT'}),
makePlayer(116,'松本 剛','OF','B',{power:51,contact:80,field:82,speed:72,arm:73,control:36,stamina:91,vision:81},{team:'北海道日本ハムファイターズ',teamCode:'F',featuredTag:'CONTACT'}),
makePlayer(117,'岩田 幸宏','OF','B',{power:39,contact:70,field:84,speed:94,arm:69,control:35,stamina:85,vision:76},{team:'東京ヤクルトスワローズ',teamCode:'S',batting:'left',featuredTag:'SPEED',build:'lean'}),
makePlayer(118,'吉川 尚輝','2B','A',{power:48,contact:79,field:93,speed:86,arm:80,control:36,stamina:91,vision:83},{team:'読売ジャイアンツ',teamCode:'G',batting:'left',featuredTag:'GLOVE'}),
makePlayer(119,'木浪 聖也','SS','B',{power:40,contact:73,field:86,speed:63,arm:78,control:35,stamina:84,vision:78},{team:'阪神タイガース',teamCode:'T',featuredTag:'GLOVE'}),
makePlayer(120,'堂林 翔太','IF','C',{power:59,contact:63,field:73,speed:60,arm:76,control:35,stamina:82,vision:71},{team:'広島東洋カープ',teamCode:'C',featuredTag:'VETERAN'}),
makePlayer(121,'並木 秀尊','OF','C',{power:31,contact:65,field:81,speed:97,arm:66,control:34,stamina:79,vision:72},{team:'東京ヤクルトスワローズ',teamCode:'S',featuredTag:'SPEED',build:'lean'}),
makePlayer(122,'中島 卓也','SS','C',{power:28,contact:67,field:91,speed:79,arm:67,control:34,stamina:80,vision:75},{team:'北海道日本ハムファイターズ',teamCode:'F',batting:'left',featuredTag:'VETERAN'}),
makePlayer(123,'大塚 瑠晏','SS','C',{power:36,contact:60,field:75,speed:77,arm:72,control:34,stamina:75,vision:70},{team:'北海道日本ハムファイターズ',teamCode:'F',featuredTag:'ROOKIE'}),
makePlayer(124,'大友 宗','C','C',{power:42,contact:59,field:72,speed:50,arm:73,control:34,stamina:71,vision:68},{team:'福岡ソフトバンクホークス',teamCode:'H',featuredTag:'ROOKIE'})
];

// ---- NPB history: stars whose reputations are genuinely all-time / franchise defining.
export const NPB_LEGENDS=[
makePlayer(200,'王 貞治','1B','S',{power:97,contact:91,field:75,speed:44,arm:67,control:40,stamina:93,vision:98},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1960s-1980s',origin:'JAPAN',rarity:'LEGEND',gachaWeight:1.2,featuredTag:'NPB LEGEND',build:'athletic',batting:'left',abilities:[['power_hitter',.10],['walk_machine',.08],['clutch',.06]]}),
makePlayer(201,'長嶋 茂雄','3B','S',{power:88,contact:93,field:90,speed:71,arm:87,control:40,stamina:92,vision:94},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1950s-1970s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB LEGEND',abilities:[['contact_hitter',.08],['clutch',.09],['big_game',.08]]}),
makePlayer(202,'野村 克也','C','S',{power:87,contact:85,field:95,speed:35,arm:96,control:40,stamina:94,vision:99},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1950s-1980s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB LEGEND',abilities:[['strong_arm',.09],['leadership',.10],['clutch',.08]]}),
makePlayer(203,'落合 博満','1B/3B','S',{power:94,contact:93,field:74,speed:38,arm:70,control:40,stamina:95,vision:97},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1980s-1990s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB LEGEND',abilities:[['power_hitter',.09],['contact_hitter',.09],['consistency',.08]]}),
makePlayer(204,'張本 勲','OF','S',{power:79,contact:96,field:76,speed:72,arm:73,control:40,stamina:95,vision:98},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1960s-1980s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB LEGEND',batting:'left',abilities:[['contact_hitter',.11],['consistency',.09],['leadoff',.06]]}),
makePlayer(205,'山本 浩二','OF','S',{power:87,contact:84,field:89,speed:74,arm:86,control:40,stamina:93,vision:92},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1970s-1980s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB LEGEND',abilities:[['power_hitter',.08],['range',.07],['clutch',.07]]}),
makePlayer(206,'野茂 英雄','P','S',{power:55,contact:20,field:75,speed:49,arm:95,control:89,stamina:96,vision:92},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1990s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB→MLB',build:'tall',abilities:[['velocity',.10],['strikeout',.10]]}),
makePlayer(207,'イチロー','OF','S',{power:70,contact:98,field:96,speed:97,arm:95,control:40,stamina:99,vision:99},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1990s-2010s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB→MLB',batting:'left',build:'lean',abilities:[['contact_hitter',.12],['speedster',.10],['range',.09],['strong_arm',.07]]}),
makePlayer(208,'松井 秀喜','OF','S',{power:93,contact:88,field:82,speed:58,arm:84,control:40,stamina:95,vision:94},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1990s-2000s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB→MLB',build:'tall',batting:'left',abilities:[['power_hitter',.10],['big_game',.08],['clutch',.07]]}),
makePlayer(209,'佐々木 主浩','P','S',{power:50,contact:18,field:76,speed:44,arm:98,control:94,stamina:82,vision:91},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1990s-2000s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'CLOSER',abilities:[['velocity',.10],['clutch',.08]]}),
makePlayer(210,'古田 敦也','C','S',{power:74,contact:87,field:97,speed:55,arm:97,control:40,stamina:94,vision:95},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1990s-2000s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'CATCHER',abilities:[['strong_arm',.10],['leadership',.09],['contact_hitter',.06]]}),
makePlayer(211,'山田 哲人','2B','S',{power:88,contact:83,field:89,speed:90,arm:84,control:40,stamina:92,vision:90},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'2010s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'TRIPLE_THREAT',abilities:[['power_hitter',.08],['speedster',.08],['base_running',.07]]}),
makePlayer(212,'金田 正一','P','S',{power:52,contact:18,field:79,speed:43,arm:96,control:92,stamina:99,vision:91},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1950s-1960s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB LEGEND',batting:'left',build:'tall',abilities:[['velocity',.09],['stamina',.09]]}),
makePlayer(213,'江夏 豊','P','S',{power:45,contact:18,field:82,speed:44,arm:94,control:95,stamina:90,vision:94},{team:'NPB HISTORY',teamCode:'NPB',status:'LEGEND',era:'1960s-1980s',origin:'JAPAN',rarity:'LEGEND',featuredTag:'NPB LEGEND',batting:'left',abilities:[['strikeout',.10],['control',.09]]})
];

// ---- MLB: only genuine historical icons, separated from Japanese current players.
export const MLB_LEGENDS=[
makePlayer(300,'Babe Ruth','OF/P','S',{power:99,contact:90,field:72,speed:58,arm:82,control:78,stamina:88,vision:97},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1910s-1930s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',build:'stocky',batting:'left',abilities:[['power_hitter',.12],['walk_machine',.10],['big_game',.08]]}),
makePlayer(301,'Willie Mays','OF','S',{power:94,contact:92,field:99,speed:94,arm:97,control:40,stamina:98,vision:96},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1950s-1970s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',abilities:[['legend_complete',.10],['range',.10],['power_hitter',.07]]}),
makePlayer(302,'Hank Aaron','OF','S',{power:96,contact:94,field:83,speed:71,arm:86,control:40,stamina:99,vision:97},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1950s-1970s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',abilities:[['power_hitter',.11],['consistency',.10],['durability',.09]]}),
makePlayer(303,'Ty Cobb','OF','S',{power:70,contact:99,field:91,speed:98,arm:79,control:40,stamina:99,vision:99},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1900s-1920s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',batting:'left',build:'lean',abilities:[['contact_hitter',.12],['speedster',.10],['base_running',.10]]}),
makePlayer(304,'Jackie Robinson','OF/2B','S',{power:73,contact:91,field:91,speed:95,arm:86,control:40,stamina:97,vision:94},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1940s-1950s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',abilities:[['contact_hitter',.09],['speedster',.09],['leadership',.08]]}),
makePlayer(305,'Lou Gehrig','1B','S',{power:95,contact:96,field:86,speed:63,arm:76,control:40,stamina:99,vision:98},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1920s-1930s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',abilities:[['power_hitter',.10],['contact_hitter',.10],['durability',.10]]}),
makePlayer(306,'Ted Williams','OF','S',{power:97,contact:99,field:80,speed:50,arm:75,control:40,stamina:95,vision:99},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1940s-1960s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',batting:'left',abilities:[['contact_hitter',.13],['power_hitter',.10],['walk_machine',.10]]}),
makePlayer(307,'Mickey Mantle','OF','S',{power:98,contact:90,field:93,speed:95,arm:92,control:40,stamina:94,vision:96},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1950s-1960s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',build:'athletic',batting:'left',abilities:[['power_hitter',.11],['speedster',.08],['big_game',.09]]}),
makePlayer(308,'Sandy Koufax','P','S',{power:42,contact:18,field:82,speed:43,arm:97,control:95,stamina:92,vision:96},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1960s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',batting:'left',abilities:[['velocity',.10],['strikeout',.12],['control',.08]]}),
makePlayer(309,'Nolan Ryan','P','S',{power:45,contact:16,field:82,speed:45,arm:99,control:90,stamina:99,vision:94},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1960s-1990s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',build:'tall',abilities:[['velocity',.13],['strikeout',.12],['stamina',.09]]}),
makePlayer(310,'Cy Young','P','S',{power:43,contact:17,field:84,speed:42,arm:96,control:96,stamina:99,vision:98},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1890s-1910s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',abilities:[['consistency',.11],['stamina',.11],['control',.10]]}),
makePlayer(311,'Walter Johnson','P','S',{power:45,contact:16,field:86,speed:43,arm:99,control:97,stamina:99,vision:98},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1900s-1920s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',build:'tall',abilities:[['velocity',.12],['control',.10],['stamina',.10]]}),
makePlayer(312,'Greg Maddux','P','S',{power:38,contact:17,field:86,speed:42,arm:88,control:99,stamina:98,vision:99},{league:'MLB',team:'MLB HISTORY',teamCode:'MLB',status:'LEGEND',era:'1980s-2000s',origin:'USA',rarity:'LEGEND',featuredTag:'MLB ICON',abilities:[['control',.13],['consistency',.11],['vision',.08]]})
];

// ---- Japanese players currently in MLB in 2026.
export const MLB_ACTIVE_JAPAN=[
makePlayer(400,'大谷 翔平','DH/P','S',{power:98,contact:84,field:52,speed:91,arm:91,control:89,stamina:92,vision:96},{league:'MLB',team:'Los Angeles Dodgers',teamCode:'LAD',status:'ACTIVE',era:'2020s',origin:'JAPAN',rarity:'STAR',featuredTag:'JAPAN MLB',batting:'left',build:'athletic',abilities:[['two_way',.13],['power_hitter',.10],['speedster',.05]]}),
makePlayer(401,'山本 由伸','P','S',{power:45,contact:18,field:82,speed:47,arm:95,control:97,stamina:94,vision:96},{league:'MLB',team:'Los Angeles Dodgers',teamCode:'LAD',status:'ACTIVE',era:'2020s',origin:'JAPAN',rarity:'STAR',featuredTag:'JAPAN MLB',batting:'right',abilities:[['control',.10],['velocity',.09],['consistency',.09]]}),
makePlayer(402,'鈴木 誠也','OF','S',{power:89,contact:83,field:74,speed:68,arm:83,control:38,stamina:90,vision:85},{league:'MLB',team:'Chicago Cubs',teamCode:'CHC',status:'ACTIVE',era:'2020s',origin:'JAPAN',rarity:'STAR',featuredTag:'JAPAN MLB',batting:'right',abilities:[['power_hitter',.08],['clutch',.05]]}),
makePlayer(403,'村上 宗隆','3B/1B','S',{power:96,contact:76,field:72,speed:56,arm:84,control:38,stamina:89,vision:82},{league:'MLB',team:'Chicago White Sox',teamCode:'CWS',status:'ACTIVE',era:'2020s',origin:'JAPAN',rarity:'STAR',featuredTag:'JAPAN MLB',batting:'left',build:'athletic',abilities:[['power_hitter',.10],['clutch',.05]]}),
makePlayer(404,'岡本 和真','1B/3B','S',{power:93,contact:82,field:76,speed:49,arm:78,control:38,stamina:91,vision:84},{league:'MLB',team:'Toronto Blue Jays',teamCode:'TOR',status:'ACTIVE',era:'2020s',origin:'JAPAN',rarity:'STAR',featuredTag:'JAPAN MLB',abilities:[['power_hitter',.09],['consistency',.05]]}),
makePlayer(405,'菊池 雄星','P','A',{power:43,contact:18,field:77,speed:43,arm:88,control:89,stamina:91,vision:88},{league:'MLB',team:'Los Angeles Angels',teamCode:'LAA',status:'ACTIVE',era:'2010s-2020s',origin:'JAPAN',rarity:'PRO',featuredTag:'JAPAN MLB',batting:'left',abilities:[['velocity',.06],['strikeout',.06]]})
];

// Limited cards are original game variants, built from the new NPB/MLB pool.
export const LIMITED_PLAYERS=[
makePlayer(500,'王 貞治 — LEGEND SELECTION','1B','S',{power:99,contact:94,field:79,speed:48,arm:70,control:40,stamina:95,vision:99},{league:'NPB',team:'NPB HISTORY',teamCode:'NPB',status:'LIMITED',era:'LEGEND SELECTION',origin:'JAPAN',rarity:'LEGEND',featuredTag:'SELECTION',batting:'left',abilities:[['power_hitter',.13],['walk_machine',.10],['clutch',.08]]}),
makePlayer(501,'佐藤 輝明 — STAR MOMENT','3B','S',{power:95,contact:76,field:76,speed:79,arm:90,control:40,stamina:93,vision:79},{league:'NPB',team:'阪神タイガース',teamCode:'T',status:'LIMITED',era:'STAR MOMENT',origin:'JAPAN',rarity:'LEGEND',featuredTag:'MOMENT',abilities:[['power_hitter',.10],['strong_arm',.06],['big_game',.07]]}),
makePlayer(502,'近藤 健介 — BEST NINE','OF','S',{power:86,contact:97,field:85,speed:67,arm:74,control:40,stamina:92,vision:99},{league:'NPB',team:'福岡ソフトバンクホークス',teamCode:'H',status:'LIMITED',era:'BEST NINE',origin:'JAPAN',rarity:'LEGEND',featuredTag:'BEST 9',batting:'right',abilities:[['contact_hitter',.11],['walk_machine',.08],['vision',.07]]}),
makePlayer(503,'宮城 大弥 — ACE EDITION','P','S',{power:49,contact:18,field:77,speed:52,arm:82,control:97,stamina:95,vision:92},{league:'NPB',team:'オリックス・バファローズ',teamCode:'B',status:'LIMITED',era:'ACE EDITION',origin:'JAPAN',rarity:'LEGEND',featuredTag:'ACE EDITION',batting:'left',abilities:[['control',.10],['velocity',.08],['stamina',.07]]}),
makePlayer(504,'大谷 翔平 — TWO-WAY ICON','DH/P','S',{power:99,contact:87,field:55,speed:93,arm:94,control:93,stamina:95,vision:98},{league:'MLB',team:'Los Angeles Dodgers',teamCode:'LAD',status:'LIMITED',era:'TWO-WAY ICON',origin:'JAPAN',rarity:'LEGEND',featuredTag:'TWO-WAY',batting:'left',abilities:[['two_way',.16],['power_hitter',.12],['velocity',.10]]})
];

export const HISTORIC_PLAYERS=[...NPB_LEGENDS,...MLB_LEGENDS];
export const MOB_PLAYERS=NPB_BREAKOUT_PLAYERS;
export const ALL_PLAYERS=[...NPB_ACTIVE_PLAYERS,...NPB_BREAKOUT_PLAYERS,...NPB_LEGENDS,...MLB_ACTIVE_JAPAN,...MLB_LEGENDS,...LIMITED_PLAYERS];
