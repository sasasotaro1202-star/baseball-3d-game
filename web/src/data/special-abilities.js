// Original, clean-room baseball-game special-ability system.
// Exactly 40 ability types. Each ability has a base activation probability.
// Player assignments are curated from documented career traits/achievements;
// they are game-design translations, not a copy of any proprietary database.

export const SPECIAL_ABILITIES = [
{id:'power_hitter',name:'パワーヒッター',kind:'bat',baseRate:.34},
{id:'contact_hitter',name:'アベレージヒッター',kind:'bat',baseRate:.42},
{id:'clutch',name:'勝負強さ',kind:'bat',baseRate:.24},
{id:'situational_hitter',name:'チャンスメーカー',kind:'bat',baseRate:.30},
{id:'walk_machine',name:'選球眼',kind:'bat',baseRate:.38},
{id:'plate_discipline',name:'粘り打ち',kind:'bat',baseRate:.31},
{id:'pull_power',name:'引っ張り強打',kind:'bat',baseRate:.27},
{id:'opposite_field',name:'広角打撃',kind:'bat',baseRate:.29},
{id:'leadoff',name:'先頭打者適性',kind:'bat',baseRate:.33},
{id:'two_strike',name:'追い込まれ強さ',kind:'bat',baseRate:.26},
{id:'speedster',name:'盗塁王',kind:'run',baseRate:.31},
{id:'base_running',name:'走塁巧者',kind:'run',baseRate:.36},
{id:'first_step',name:'初動反応',kind:'field',baseRate:.34},
{id:'range',name:'守備範囲',kind:'field',baseRate:.35},
{id:'sure_hands',name:'堅守',kind:'field',baseRate:.39},
{id:'strong_arm',name:'強肩',kind:'field',baseRate:.33},
{id:'quick_throw',name:'送球精度',kind:'field',baseRate:.35},
{id:'relay_master',name:'中継巧者',kind:'field',baseRate:.28},
{id:'center_field',name:'センター適性',kind:'field',baseRate:.32},
{id:'corner_defense',name:'コーナー守備',kind:'field',baseRate:.30},
{id:'ace',name:'エース気質',kind:'pitch',baseRate:.22},
{id:'strikeout',name:'奪三振',kind:'pitch',baseRate:.27},
{id:'groundball',name:'ゴロ打球誘発',kind:'pitch',baseRate:.30},
{id:'flyball',name:'フライ打球誘発',kind:'pitch',baseRate:.25},
{id:'control_artist',name:'制球術',kind:'pitch',baseRate:.34},
{id:'stamina',name:'スタミナ',kind:'pitch',baseRate:.29},
{id:'velocity',name:'球威',kind:'pitch',baseRate:.28},
{id:'pitch_mix',name:'配球術',kind:'pitch',baseRate:.32},
{id:'comeback',name:'逆境',kind:'mental',baseRate:.18},
{id:'late_inning',name:'終盤強さ',kind:'mental',baseRate:.21},
{id:'durability',name:'鉄人',kind:'mental',baseRate:.20},
{id:'consistency',name:'安定感',kind:'mental',baseRate:.36},
{id:'big_game',name:'大舞台',kind:'mental',baseRate:.17},
{id:'leadership',name:'リーダーシップ',kind:'mental',baseRate:.23},
{id:'two_way',name:'二刀流',kind:'unique',baseRate:.18},
{id:'legend_power',name:'伝説級長打',kind:'special',baseRate:.10},
{id:'legend_contact',name:'伝説級打撃',kind:'special',baseRate:.11},
{id:'legend_speed',name:'伝説級走塁',kind:'special',baseRate:.10},
{id:'legend_field',name:'伝説級守備',kind:'special',baseRate:.10},
{id:'legend_complete',name:'歴代級オールラウンド',kind:'special',baseRate:.08}
];

const A=Object.fromEntries(SPECIAL_ABILITIES.map(x=>[x.id,x]));
export function ability(id){return A[id]||null}
export function abilityRate(id,modifier=0){const a=A[id];return a?Math.max(.01,Math.min(.95,a.baseRate+modifier)):0}
export function resolveAbility(id,rng=Math.random,modifier=0){return rng()<abilityRate(id,modifier)}
