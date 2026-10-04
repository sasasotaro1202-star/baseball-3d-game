
function installPremiumDesignSystem(){
  if(document.getElementById('premium-design-system-v2')) return;
  const style=document.createElement('style');
  style.id='premium-design-system-v2';
  style.textContent=String.raw`
    :root{
      --ui-navy:#07111d;
      --ui-navy-2:#0b1725;
      --ui-navy-3:#101f2f;
      --ui-line:rgba(255,255,255,.12);
      --ui-line-strong:rgba(255,255,255,.20);
      --ui-text:#f4f7fa;
      --ui-muted:#94a4b2;
      --ui-gold:#d7b45a;
      --ui-gold-hi:#f2d889;
      --ui-green:#43c978;
    }
    body.premium-ui{background:var(--ui-navy);color:var(--ui-text)}
    body.premium-ui .panel{padding-left:max(12px,env(safe-area-inset-left));padding-right:max(12px,env(safe-area-inset-right))}
    body.premium-ui .top{height:46px}
    body.premium-ui .brand{font-size:12px;letter-spacing:.20em;font-weight:900;text-shadow:0 1px 12px #000}
    body.premium-ui .currency{
      padding:7px 10px;border-radius:8px;border:1px solid var(--ui-line-strong);
      background:linear-gradient(180deg,#142335e8,#07101ae8);font-weight:850;box-shadow:0 8px 22px #0008
    }
    body.premium-ui .home{justify-content:flex-end;gap:9px;padding-bottom:calc(env(safe-area-inset-bottom) + 16px)}
    body.premium-ui .hero{padding-top:48px;margin-bottom:auto}
    body.premium-ui .hero h1{font-size:40px;line-height:.95;letter-spacing:-.045em;margin:5px 0 8px;text-shadow:0 10px 35px #000}
    body.premium-ui .hero p{color:#aebbc8;max-width:290px;line-height:1.55;font-size:11px}
    body.premium-ui .home:after{
      content:'SEASON 2026  ·  BASEBALL 3D';
      position:absolute;top:calc(env(safe-area-inset-top) + 63px);left:0;right:0;
      text-align:center;letter-spacing:.18em;font-size:7px;color:#8d9aa8;pointer-events:none
    }
    body.premium-ui .match-mode-grid{gap:8px;margin-bottom:8px}
    body.premium-ui .match-mode-card{
      min-height:112px;border-radius:10px;border:1px solid var(--ui-line-strong);
      box-shadow:0 12px 28px #0009;padding:12px;background:
        radial-gradient(circle at 85% 15%,#ffffff10,transparent 35%),linear-gradient(145deg,#102237,#07101a)
    }
    body.premium-ui .match-mode-card strong{font-size:19px;letter-spacing:-.02em}
    body.premium-ui .match-mode-card small{font-size:9px}
    body.premium-ui .match-mode-card span{font-size:6px;letter-spacing:.18em;color:#8e9ca9}
    body.premium-ui .ai-match-card{background:radial-gradient(circle at 100% 0,#3d9a681c,transparent 42%),linear-gradient(145deg,#143524,#07140e)}
    body.premium-ui .online-match-card{background:radial-gradient(circle at 100% 0,#4f9bd91c,transparent 42%),linear-gradient(145deg,#112f48,#07111b)}
    body.premium-ui .menu-secondary{gap:6px}
    body.premium-ui .menu-secondary button,.screen .action{
      min-height:43px;border:1px solid var(--ui-line);border-radius:7px;
      background:linear-gradient(180deg,#102031,#07101a);color:#e9eef2;font-weight:850;
      box-shadow:0 7px 15px #0006
    }
    body.premium-ui .menu-secondary button:active,.screen .action:active{transform:translateY(1px);filter:brightness(1.12)}
    body.premium-ui #view .card{
      border:1px solid var(--ui-line);border-radius:11px;
      background:linear-gradient(180deg,#0b1724f5,#060d15f5);box-shadow:0 16px 45px #000a;
    }

    body.premium-ui .gacha-title{font-size:28px;line-height:1;margin:3px 0 3px;letter-spacing:-.035em}
    body.premium-ui .gacha-shell{display:grid;gap:10px}
    body.premium-ui .gacha-topline{display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
    body.premium-ui .gacha-kicker{font-size:7px;letter-spacing:.18em;color:var(--ui-gold);font-weight:900}
    body.premium-ui .gacha-balance{
      display:flex!important;align-items:center;gap:7px!important;margin:0!important;padding:7px 9px!important;
      border:1px solid var(--ui-line)!important;border-radius:8px!important;
      background:linear-gradient(180deg,#0f1d2c,#07101a)!important;font-size:8px!important
    }
    body.premium-ui .gacha-balance b{font-size:13px;color:#fff}
    body.premium-ui .gacha-balance span:last-child{color:var(--ui-gold-hi)}
    body.premium-ui .gacha-tabs{
      display:flex!important;gap:6px!important;overflow-x:auto!important;padding:1px 0 3px!important;
      scrollbar-width:none!important
    }
    body.premium-ui .gacha-tabs::-webkit-scrollbar{display:none}
    body.premium-ui .gacha-tab{
      flex:0 0 auto!important;min-width:112px!important;padding:8px 9px!important;border-radius:7px!important;
      border:1px solid var(--ui-line)!important;background:#08121d!important;color:#9fadb9!important;text-align:left!important
    }
    body.premium-ui .gacha-tab.selected{
      color:#fff!important;border-color:#bfa05b!important;background:linear-gradient(180deg,#26351f,#131b16)!important;
      box-shadow:inset 0 0 0 1px #dec36a33,0 7px 18px #0007
    }
    body.premium-ui .gacha-tab b{display:block;font-size:9px;white-space:nowrap}
    body.premium-ui .gacha-tab small{display:block;font-size:7px;color:#7f8d99;margin-top:2px;white-space:nowrap}
    body.premium-ui .gacha-tab em{display:inline-block;font-style:normal;font-size:6px;letter-spacing:.14em;margin-top:5px;color:var(--ui-gold)}
    body.premium-ui .gacha-banner-card{
      position:relative;overflow:hidden;min-height:228px;border-radius:12px;border:1px solid #ffffff18;
      background:radial-gradient(circle at 84% 20%,#d5b55a22,transparent 35%),linear-gradient(140deg,#11253b,#07101a);
      box-shadow:0 16px 35px #0009
    }
    body.premium-ui .gacha-banner-card:before{
      content:'';position:absolute;inset:0;background:linear-gradient(100deg,#06101ad9 0 34%,transparent 72%),linear-gradient(160deg,#ffffff08,transparent 50%);pointer-events:none
    }
    body.premium-ui .gacha-banner-copy{position:absolute;z-index:2;left:14px;top:15px;width:42%}
    body.premium-ui .gacha-banner-copy small{font-size:7px;letter-spacing:.18em;color:var(--ui-gold);font-weight:900}
    body.premium-ui .gacha-banner-copy h3{font-size:21px;line-height:1.05;margin:7px 0 5px}
    body.premium-ui .gacha-banner-copy p{font-size:9px;color:#b6c2cd;line-height:1.45;margin:0 0 10px}
    body.premium-ui .gacha-banner-copy>b{display:inline-block;padding:5px 7px;border:1px solid #e2c76e33;border-radius:5px;background:#1a1b14cc;color:#e8ce76;font-size:7px}
    body.premium-ui .gacha-featured{position:absolute;z-index:2;right:9px;bottom:9px;display:flex;gap:6px;align-items:flex-end}
    body.premium-ui .gacha-feature-card{
      width:92px;overflow:hidden;border-radius:7px;border:1px solid #ffffff17;background:linear-gradient(180deg,#162535dd,#08111bdd);
      box-shadow:0 10px 22px #000a;transform:perspective(500px) rotateY(-5deg)
    }
    body.premium-ui .gacha-feature-card:nth-child(2){transform:perspective(500px) rotateY(4deg) translateY(-8px)}
    body.premium-ui .gacha-feature-card img,.gacha-feature-card .gacha-fallback{
      display:block;width:100%;height:103px;object-fit:cover;background:linear-gradient(145deg,#172d45,#0a111a)
    }
    body.premium-ui .gacha-feature-card strong{display:block;padding:6px 6px 0;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.premium-ui .gacha-feature-card small{display:block;padding:2px 6px 7px;color:#8f9ca8;font-size:6px}
    body.premium-ui .gacha-feature-card.limited{border-color:#d9bc5a80;box-shadow:0 0 0 1px #d9bc5a22,0 10px 24px #000b}
    body.premium-ui .gacha-feature-card.limited small{color:#d8bb65}
    body.premium-ui .gacha-actions{display:grid!important;grid-template-columns:1fr 1.42fr!important;gap:7px!important}
    body.premium-ui .gacha-actions button{
      min-height:53px!important;border-radius:8px!important;padding:6px 9px!important;
      border:1px solid #ffffff19!important;background:linear-gradient(180deg,#101e2b,#071019)!important;color:#fff!important;
      font-weight:950!important;box-shadow:0 9px 18px #0008!important
    }
    body.premium-ui .gacha-actions .gacha-pull-ten{
      border-color:#d9bc5a66!important;background:linear-gradient(180deg,#c5a34a,#80621e)!important;color:#171208!important
    }
    body.premium-ui .gacha-actions button span{display:block;font-size:7px;opacity:.66;margin-top:3px;font-weight:700}
    body.premium-ui .gacha-actions .gacha-pull-ten span{opacity:.78}
    body.premium-ui .banner-info{
      padding:9px 10px;border:1px solid var(--ui-line);border-radius:8px;background:#050c14c9
    }
    body.premium-ui .banner-info-head{display:flex;justify-content:space-between;gap:8px;font-size:8px}
    body.premium-ui .banner-info-head span{color:var(--ui-gold);font-size:7px}
    body.premium-ui .banner-info>strong{display:block;margin-top:3px;font-size:11px}
    body.premium-ui .banner-info>small{display:block;color:#8795a2;font-size:7px;margin-top:2px}
    body.premium-ui .rate-row{display:flex;gap:3px;margin-top:7px}
    body.premium-ui .rate-row span{flex:1;text-align:center;padding:5px 1px;border-radius:4px;background:#0c1825;color:#9ba8b3;font-size:6px}
    body.premium-ui .rate-row span:first-child{color:#f1d16d;background:#201c10}
    body.premium-ui .banner-note{margin-top:6px;color:#7f8d98;font-size:6px;line-height:1.35}
    body.premium-ui .gacha-results{padding:0!important}
    body.premium-ui .gacha-result-feature{
      display:grid;grid-template-columns:90px 1fr;gap:10px;margin-top:8px;
      border:1px solid #d7b45a44;border-radius:9px;overflow:hidden;
      background:linear-gradient(135deg,#17283a,#08111a);box-shadow:0 9px 22px #0008
    }
    body.premium-ui .gacha-result-feature-art{min-height:112px;background:linear-gradient(145deg,#18334b,#081018)}
    body.premium-ui .gacha-result-feature-art img,.gacha-result-feature-art .gacha-fallback{width:100%;height:100%;min-height:112px;object-fit:cover;display:grid;place-items:center}
    body.premium-ui .gacha-result-feature-copy{display:flex;flex-direction:column;justify-content:center;padding:9px 9px 9px 0}
    body.premium-ui .gacha-result-feature-copy small{font-size:6px;letter-spacing:.15em;color:#d8bd67;font-weight:900}
    body.premium-ui .gacha-result-feature-copy strong{font-size:17px;margin-top:4px;line-height:1.05}
    body.premium-ui .gacha-result-feature-copy span{font-size:7px;color:#95a4b1;margin-top:3px}
    body.premium-ui .gacha-result-feature-copy button{
      align-self:flex-start;margin-top:8px;padding:5px 8px;border-radius:5px;border:1px solid #ffffff18;
      background:#0b1724;color:#e7edf2;font-size:7px;font-weight:900
    }
    body.premium-ui .results-head{
      display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:3px 1px 6px;border-bottom:1px solid var(--ui-line)
    }
    body.premium-ui .results-head b{font-size:10px}.results-head small{font-size:7px;color:#8997a3}
    body.premium-ui .gacha-result-grid{display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:5px!important;margin-top:7px}
    body.premium-ui .gacha-result-card{
      min-width:0;border-radius:6px!important;overflow:hidden!important;border:1px solid #ffffff12!important;
      background:linear-gradient(180deg,#132233,#071019)!important;box-shadow:0 6px 13px #0007!important;padding:0!important
    }
    body.premium-ui .gacha-result-card img,.gacha-result-card .gacha-fallback{width:100%;height:72px;object-fit:cover;display:block}
    body.premium-ui .gacha-result-card strong{display:block;padding:4px 4px 0;font-size:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.premium-ui .gacha-result-card small{display:block;padding:2px 4px 5px;color:#82909c;font-size:5px}
    body.premium-ui .result-badge{position:absolute;margin:3px;padding:2px 3px;border-radius:3px;font-size:6px;font-weight:950;background:#0b1118d9;border:1px solid #ffffff20;z-index:2}
    body.premium-ui .gacha-result-card.rank-S{border-color:#e2c863aa!important;box-shadow:0 0 0 1px #e2c8632b,0 6px 16px #0008!important}
    body.premium-ui .gacha-result-card.rank-A{border-color:#7da8d66b!important}
    body.premium-ui .gacha-result-card.limited{border-color:#cfb04d88!important}
    body.premium-ui .gacha-result-card em{
      display:block;margin:0 4px 5px;padding:3px;border-radius:3px;background:#2c2613;color:#d6b960;font-style:normal;font-size:5px
    }
    body.premium-ui .gacha-empty,.gacha-error{
      min-height:76px;display:grid;place-content:center;text-align:center;border:1px solid var(--ui-line);
      border-radius:8px;background:#050c14;color:#9aa7b3
    }
    body.premium-ui .gacha-empty b,.gacha-error b{font-size:9px;color:#dbe2e8}.gacha-empty small,.gacha-error small{font-size:7px;margin-top:3px}
    body.premium-ui .back{margin-top:2px}

    body.premium-ui .sc-player-grid{gap:7px!important}
    body.premium-ui .collection-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:8px}
    body.premium-ui .collection-head h2{font-size:27px;line-height:1;margin:4px 0 5px;letter-spacing:-.03em}
    body.premium-ui .collection-head p{margin:0;color:#8796a3;font-size:8px;line-height:1.45;max-width:260px}
    body.premium-ui .collection-count{min-width:72px;padding:8px;border:1px solid #ffffff12;border-radius:8px;background:#07111be8;text-align:right}
    body.premium-ui .collection-count strong{display:block;font-size:22px;line-height:1;color:#f1d77e}
    body.premium-ui .collection-count span{font-size:8px;color:#7f8d99}
    body.premium-ui .collection-count small{display:block;margin-top:3px;color:#71808d;font-size:5px;letter-spacing:.14em}
    body.premium-ui .collection-filter-row{display:flex;gap:5px;overflow:auto;padding:0 0 6px;scrollbar-width:none}
    body.premium-ui .collection-filter-row::-webkit-scrollbar{display:none}
    body.premium-ui .collection-filter{
      flex:0 0 auto;height:28px;padding:0 10px;border-radius:5px;border:1px solid #ffffff12;
      background:#07111b;color:#8f9daa;font-size:7px;font-weight:850;letter-spacing:.04em
    }
    body.premium-ui .collection-filter.selected{background:#c5a54f;color:#181309;border-color:#e1c773}
    body.premium-ui .sc-player-card{
      border-radius:9px!important;border:1px solid #ffffff14!important;background:linear-gradient(180deg,#122131,#071019)!important;
      box-shadow:0 9px 20px #0007!important;overflow:hidden!important
    }
    body.premium-ui .sc-player-card.rank-S{border-color:#dbbf63aa!important}
    body.premium-ui .sc-player-card.rank-A{border-color:#7ea9d35e!important}
    body.premium-ui .sc-card-ribbon{background:linear-gradient(90deg,#0b1117f2,#101b27cc)!important;border-bottom:1px solid #ffffff10}
    body.premium-ui .sc-card-ribbon span{color:#e7cb75!important}
    body.premium-ui .sc-card-main{padding:8px!important}
    body.premium-ui .sc-card-portrait{border-radius:6px!important;overflow:hidden}
    body.premium-ui .sc-card-stats{background:#06101ae8!important;border-top:1px solid #ffffff0c!important}
    body.premium-ui .sc-card-stats span{border-right:1px solid #ffffff08!important}
    body.premium-ui .sc-card-stats b{color:#f1f4f6}
    body.premium-ui .sc-card-bottom{padding:6px 7px!important}

    body.premium-ui #presentation{
      font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif!important
    }
    body.premium-ui #presentation .gacha-stage{
      background:
        radial-gradient(circle at 50% 36%,#274766 0,transparent 24%),
        radial-gradient(circle at 50% 82%,#091c31 0 18%,transparent 43%),
        linear-gradient(180deg,#02070d,#081626 60%,#031019)!important;
    }
    body.premium-ui #presentation .gacha-sky{filter:brightness(.9) saturate(.85)}
    @keyframes scout-stage-pulse{0%,100%{filter:brightness(.90);transform:scale(1)}50%{filter:brightness(1.08);transform:scale(1.025)}}
    @keyframes scout-ball-spin{to{transform:rotate(360deg)}}
    @keyframes scout-shine{0%{transform:translateX(-130%) skewX(-18deg);opacity:0}15%{opacity:.65}38%{opacity:0}100%{transform:translateX(150%) skewX(-18deg);opacity:0}}
    body.premium-ui #presentation .gacha-stage{animation:scout-stage-pulse 2.8s ease-in-out infinite;overflow:hidden}
    body.premium-ui #presentation .gacha-ball{animation:scout-ball-spin 1.35s linear infinite;filter:drop-shadow(0 0 18px #e6cc7138)}
    body.premium-ui #presentation .pres-card-frame{position:relative;overflow:hidden}
    body.premium-ui #presentation .pres-card-frame:after{
      content:'';position:absolute;inset:-20% 45%;background:linear-gradient(90deg,transparent,#fff8d84c,transparent);
      transform:translateX(-130%) skewX(-18deg);pointer-events:none;animation:scout-shine 3.8s .4s ease-in-out infinite
    }
    body.premium-ui #presentation #gacha-result-banner{padding:6px 9px;border:1px solid #d8bc654d;border-radius:7px;background:#050b12c8;backdrop-filter:blur(6px);box-shadow:0 10px 28px #0008}
    body.premium-ui #presentation .gacha-result-rank{font-size:22px;font-weight:1000;letter-spacing:.04em}
    body.premium-ui #presentation .gacha-result-status{font-size:7px;color:#d8bd67;letter-spacing:.14em;font-weight:900}
    body.premium-ui #presentation .gacha-result-type{font-size:6px;color:#8593a0;margin-top:2px}
    body.premium-ui #presentation .gacha-field{
      background:radial-gradient(ellipse at center,#163b2d,#06150e 72%)!important;
      opacity:.92
    }
    body.premium-ui #presentation .pres-card-frame{
      border-radius:12px!important;border:1px solid #e4cc786a!important;
      box-shadow:0 20px 55px #000d,0 0 0 1px #ffffff14,0 0 60px #d5b14e2b!important;
      background:linear-gradient(160deg,#142435,#06101a)!important
    }
    body.premium-ui #presentation .pres-card-art{background:linear-gradient(145deg,#0c2134,#06101a)!important}
    body.premium-ui #presentation .pres-card-top span{color:#d8bd67!important}
    body.premium-ui #presentation .pres-card-top b{color:#fff!important}
    body.premium-ui #presentation .pres-stat-row i{background:#091522!important;border:1px solid #ffffff12!important}
    body.premium-ui #presentation .pres-stat-row b{color:#f2d983!important}
    body.premium-ui #presentation .gacha-result-banner{filter:drop-shadow(0 10px 30px #000)}
    @media(max-width:390px){
      body.premium-ui .gacha-banner-card{min-height:216px}
      body.premium-ui .gacha-result-feature{grid-template-columns:76px 1fr}
      body.premium-ui .gacha-result-feature-art,.gacha-result-feature-art img,.gacha-result-feature-art .gacha-fallback{min-height:96px}
      body.premium-ui .gacha-result-feature-copy strong{font-size:15px}
      body.premium-ui .gacha-feature-card{width:78px}
      body.premium-ui .gacha-feature-card img,.gacha-feature-card .gacha-fallback{height:88px}
      body.premium-ui .gacha-banner-copy{width:46%}
      body.premium-ui .gacha-result-grid{grid-template-columns:repeat(5,1fr)!important}
      body.premium-ui .gacha-result-card img,.gacha-result-card .gacha-fallback{height:64px}
    }
  `;
  document.head.appendChild(style);
  document.body.classList.add('premium-ui');
}
installPremiumDesignSystem();

function installPremiumDesignSystemV3(){if(document.getElementById('premium-design-system-v3'))return;const style=document.createElement('style');style.id='premium-design-system-v3';style.textContent="\n/* Premium sports-game UI v3 — clean-room baseball game styling. */\n:root{--u-bg:#040910;--u-p:#091522;--u-p2:#102238;--u-p3:#173653;--u-line:rgba(255,255,255,.14);--u-text:#f5f7fa;--u-muted:#92a1ae;--u-gold:#dfbf64;--u-gold2:#f5dd8d;--u-blue:#6bbcf0;--u-green:#52cf87}\nbody.premium-ui{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}\nbody.premium-ui button,body.premium-ui input,body.premium-ui textarea{font-family:-apple-system,BlinkMacSystemFont,\"SF Pro Display\",\"Hiragino Kaku Gothic ProN\",sans-serif}\n\n/* Home */\nbody.premium-ui .top{height:44px!important;border-color:var(--u-line)!important;background:linear-gradient(180deg,#0c1b2cf5,#040a11f2)!important;box-shadow:0 9px 24px #0007,inset 0 1px 0 #fff1!important}\nbody.premium-ui .brand{font-size:11px!important;letter-spacing:.22em!important}.record{font-size:9px!important}\nbody.premium-ui .currency{min-width:78px!important;padding:7px 10px!important;border-radius:8px!important;font-size:12px!important;font-weight:900!important;font-variant-numeric:tabular-nums;color:var(--u-gold2)!important;border-color:#dfbf6466!important;background:linear-gradient(180deg,#17263a,#09121c)!important}\nbody.premium-ui .home{background:linear-gradient(180deg,transparent,#06111de8 73%,#03070c)!important}\nbody.premium-ui .home-premium-shell{inset:48px 8px 72px!important;padding-top:7px!important}\nbody.premium-ui .home-hero-card{min-height:418px!important;border-radius:18px!important;border:1px solid #fff2!important;background:radial-gradient(circle at 84% 14%,#5db4f03d,transparent 29%),radial-gradient(circle at 20% 86%,#47aa691f,transparent 30%),linear-gradient(145deg,#17344e,#091827 58%,#050c13)!important;box-shadow:0 20px 48px #0009,inset 0 1px 0 #fff2!important}\nbody.premium-ui .home-hero-card:after{content:\"\";position:absolute;left:-20%;right:-20%;bottom:-25%;height:54%;background:repeating-linear-gradient(90deg,#fff06 0 1px,transparent 1px 44px),linear-gradient(180deg,transparent,#02060ccc);transform:perspective(640px) rotateX(60deg);transform-origin:50% 100%;pointer-events:none}\nbody.premium-ui .home-hero-content{padding:19px!important}.home-kicker{font-size:9px!important}.home-kicker b{font-size:8px!important}\nbody.premium-ui .home-hero-card h1{font-size:42px!important;margin-top:18px!important;letter-spacing:-.055em!important}.home-hero-card p{font-size:12px!important;color:#bac7d2!important}\nbody.premium-ui .home-record-row{max-width:none!important;gap:6px!important;margin:20px 0 11px!important}.home-record-row>div{padding:10px!important;border-radius:8px!important;background:#03080eb0!important;border-color:#fff1!important}\nbody.premium-ui .home-record-row small{font-size:7px!important}.home-record-row strong{font-size:13px!important}\nbody.premium-ui .hero-play-button{width:100%!important;height:62px!important;border-radius:10px!important;border:1px solid #f0d684!important;box-shadow:0 10px 26px #000a,inset 0 1px 0 #fff8!important}\nbody.premium-ui .hero-play-button b{font-size:17px!important}.hero-play-button small{font-size:8px!important}.hero-play-button em{font-size:22px!important}\nbody.premium-ui .home-quick-row{width:100%!important;gap:7px!important}.home-quick-card{min-height:70px!important;border-radius:10px!important;padding:10px!important;background:linear-gradient(145deg,#10273b,#07121c)!important}\nbody.premium-ui .home-quick-card span{width:28px!important;height:28px!important;border-radius:8px!important;font-size:15px!important;background:#14344d!important;color:#9ed7ff!important}\nbody.premium-ui .home-quick-card.scout span{background:#3b301d!important;color:#f3d87f!important}.home-quick-card b{font-size:11px!important}.home-quick-card small{font-size:8px!important}\nbody.premium-ui .home-section-title{margin:16px 3px 7px!important}.home-section-title span{font-size:8px!important}.home-section-title b{font-size:12px!important}\nbody.premium-ui .home-command-grid{gap:7px!important}.home-command-grid button{min-height:80px!important;border-radius:10px!important;padding:10px!important;background:linear-gradient(180deg,#12273d,#08131f)!important;border-color:#fff2!important;box-shadow:0 8px 18px #0004!important}\nbody.premium-ui .command-icon{width:30px!important;height:30px!important;border-radius:8px!important;font-size:14px!important;background:#16354d!important;color:#a2d9ff!important}.home-command-grid b{font-size:11px!important}.home-command-grid small{font-size:8px!important}\nbody.premium-ui .home-difficulty{min-height:56px!important;padding:10px!important;border-radius:10px!important;background:linear-gradient(180deg,#0a1723,#05101a)!important}.home-difficulty span{font-size:10px!important}.home-difficulty b{font-size:7px!important}.home-difficulty button{height:32px!important;font-size:8px!important;border-radius:7px!important}\nbody.premium-ui .home-bottom-nav{height:68px!important;padding:5px 5px calc(env(safe-area-inset-bottom) + 3px)!important}.home-bottom-nav button{border-radius:8px!important}.home-bottom-nav button span{font-size:18px!important}.home-bottom-nav button b{font-size:8px!important}.home-bottom-nav button.selected{color:var(--u-gold2)!important;background:#dfbf641a!important}\n\n/* Secondary screens */\nbody.premium-ui #view .card{padding:calc(env(safe-area-inset-top) + 58px) 14px calc(env(safe-area-inset-bottom) + 22px)!important;background:radial-gradient(circle at 50% -5%,#4a82a71a,transparent 34%),linear-gradient(180deg,#0b1724,#050b12 80%)!important}\nbody.premium-ui #view .card h2{font-size:30px!important;line-height:1.05!important;margin:0 2px 6px!important;letter-spacing:-.035em!important}.view .card>p{font-size:11px!important;line-height:1.45!important;color:#8ea0af!important}.view .back{height:48px!important;border-radius:10px!important;font-size:12px!important}\n\n/* Scout */\nbody.premium-ui .gacha-shell{gap:12px!important;width:min(100%,760px)!important;margin:auto!important}.gacha-title{font-size:30px!important}.gacha-kicker{font-size:8px!important;letter-spacing:.2em!important}\nbody.premium-ui .gacha-balance{min-width:104px!important;border-radius:9px!important;padding:8px 10px!important}.gacha-balance span{font-size:7px!important}.gacha-balance b{font-size:16px!important}\nbody.premium-ui .gacha-tabs{gap:7px!important;padding:1px 0 4px!important}.gacha-tab{flex:0 0 126px!important;min-height:56px!important;padding:8px 10px!important;border-radius:9px!important;background:linear-gradient(180deg,#0e1d2c,#07111a)!important}.gacha-tab b{font-size:10px!important}.gacha-tab small{font-size:7px!important}.gacha-tab em{font-size:6px!important}\nbody.premium-ui .gacha-tab.selected{background:linear-gradient(180deg,#1a344c,#091824)!important;border-color:#73bdf0!important;box-shadow:inset 0 0 0 1px #73bdf033,0 8px 18px #0005!important}\nbody.premium-ui .gacha-banner-card{min-height:268px!important;border-radius:14px!important;border-color:#fff2!important;background:radial-gradient(circle at 82% 18%,#dfbf6438,transparent 29%),radial-gradient(circle at 14% 74%,#4aa86a1a,transparent 28%),linear-gradient(138deg,#15354e,#07131f 66%,#04090f)!important;box-shadow:0 18px 42px #000b!important}\nbody.premium-ui .gacha-banner-copy{left:15px!important;top:16px!important;width:39%!important}.gacha-banner-copy h3{font-size:25px!important;margin:8px 0 6px!important}.gacha-banner-copy p{font-size:10px!important}.gacha-banner-copy>b{font-size:8px!important;padding:6px 8px!important}\nbody.premium-ui .gacha-featured{right:10px!important;bottom:10px!important;gap:7px!important}.gacha-feature-card{width:96px!important;border-radius:9px!important;box-shadow:0 13px 28px #0009!important}.gacha-feature-card:first-child{width:108px!important}\nbody.premium-ui .gacha-feature-card img,.gacha-feature-card .gacha-fallback{height:132px!important;background:linear-gradient(145deg,#234966,#091421)!important}.gacha-feature-card:first-child img,.gacha-feature-card:first-child .gacha-fallback{height:150px!important}\nbody.premium-ui .gacha-feature-card strong{font-size:9px!important;padding:7px 7px 0!important}.gacha-feature-card small{font-size:7px!important;padding:3px 7px 8px!important}\nbody.premium-ui .gacha-feature-card.limited{border-color:#e0bd62!important}.gacha-feature-rank{position:absolute!important;left:6px!important;top:6px!important;z-index:4!important;min-width:28px!important;height:28px!important;display:grid!important;place-items:center!important;border-radius:7px!important;background:#02070de6!important;border:1px solid #fff4!important;color:var(--u-gold2)!important;font-size:12px!important;font-weight:1000!important}\nbody.premium-ui .gacha-feature-meta b{display:block!important;font-size:8px!important;color:#f1d67f!important;padding:2px 7px 0!important}\nbody.premium-ui .gacha-banner-footer{position:absolute!important;left:14px!important;right:14px!important;bottom:9px!important;display:flex!important;align-items:center!important;gap:7px!important;color:#8998a6!important;font-size:6px!important}.gacha-banner-footer i{flex:1;height:1px;background:#fff2!important}\nbody.premium-ui .gacha-actions{grid-template-columns:1fr 1.55fr!important;gap:8px!important}.gacha-actions button{min-height:62px!important;border-radius:10px!important;padding:7px 10px!important;font-size:13px!important;box-shadow:0 10px 22px #0008!important}.gacha-actions button span{font-size:8px!important}\nbody.premium-ui .gacha-actions .gacha-pull-ten{background:linear-gradient(180deg,#ecd57e,#a87d25)!important;border-color:#f5de92!important;color:#171208!important}\nbody.premium-ui .banner-info{padding:11px 12px!important;border-radius:10px!important;background:linear-gradient(180deg,#08151f,#050c13)!important}.banner-info-head{font-size:10px!important}.banner-info>strong{font-size:13px!important}.banner-info>small{font-size:8px!important}.rate-row{gap:4px!important}.rate-row span{padding:6px 2px!important;font-size:7px!important}.rate-row span b{font-size:8px!important}.banner-note{font-size:7px!important}\nbody.premium-ui .gacha-result-feature{grid-template-columns:102px 1fr!important;min-height:126px!important;border-radius:11px!important;background:linear-gradient(135deg,#132b41,#07111a)!important;border-color:#dfbf6447!important}.gacha-result-feature-art,.gacha-result-feature-art img,.gacha-result-feature-art .gacha-fallback{min-height:126px!important}.gacha-result-feature-copy{padding:11px 11px 11px 0!important}.gacha-result-feature-copy small{font-size:7px!important}.gacha-result-feature-copy strong{font-size:19px!important}.gacha-result-feature-copy span{font-size:8px!important}.gacha-result-feature-copy button{margin-top:9px!important;padding:6px 9px!important;font-size:8px!important}\nbody.premium-ui .gacha-result-grid{gap:6px!important;margin-top:9px!important}.gacha-result-card{border-radius:7px!important}.gacha-result-card img,.gacha-result-card .gacha-fallback{height:82px!important}.gacha-result-card strong{font-size:7px!important;padding:5px 4px 0!important}.gacha-result-card small{font-size:6px!important;padding:2px 4px 6px!important}.result-badge{font-size:8px!important}.gacha-result-card em{font-size:6px!important}\n\n/* Collection/cards */\nbody.premium-ui .collection-head h2{font-size:30px!important}.collection-head p{font-size:10px!important}.collection-count{min-width:84px!important;padding:9px!important;border-radius:9px!important}.collection-count strong{font-size:25px!important}.collection-filter{height:32px!important;padding:0 12px!important;font-size:8px!important;border-radius:7px!important}\nbody.premium-ui .sc-player-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.sc-player-card{border-radius:10px!important;background:linear-gradient(180deg,#13273b,#07111a)!important;border-color:#fff2!important;box-shadow:0 10px 24px #0008!important}.sc-card-ribbon{min-height:27px!important;padding:5px 7px!important}.sc-card-ribbon span{font-size:8px!important}.sc-card-ribbon b{font-size:6px!important}.sc-card-main{padding:8px!important}.sc-card-portrait{height:178px!important;border-radius:7px!important}.sc-card-copy h3{font-size:14px!important;margin:4px 0!important}.sc-card-rating strong{font-size:29px!important}.sc-card-stats{grid-template-columns:repeat(5,1fr)!important}.sc-card-stats span{padding:6px 2px!important}.sc-card-stats small{font-size:6px!important}.sc-card-stats b{font-size:11px!important}\n\n/* Order / training / settings */\nbody.premium-ui .order-field{min-height:430px!important;border-radius:14px!important;background:radial-gradient(circle at 50% 44%,#468b52eb,#164127f2 52%,#07110b)!important;box-shadow:inset 0 0 0 1px #fff1,0 16px 34px #0008!important}.premium-lineup-slot{min-width:116px!important;padding:7px 8px!important;border-radius:9px!important;background:linear-gradient(145deg,#12263a,#07111a)!important;box-shadow:0 7px 16px #0008!important}.lineup-slot-top b{font-size:7px!important}.lineup-slot-body img,.lineup-avatar{width:30px!important;height:36px!important;flex-basis:30px!important}.lineup-slot-body strong{font-size:8px!important}.lineup-slot-body small{font-size:6px!important}\nbody.premium-ui .training-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important}.training-player{padding:8px!important;border-radius:10px!important}.training-portrait{height:142px!important;border-radius:7px!important}.training-player .player-head strong{font-size:12px!important}.training-player .player-head b{font-size:10px!important}.training-player .mini-stats span{font-size:8px!important;padding:4px 2px!important}.training-player .train{min-height:34px!important;font-size:9px!important;border-radius:7px!important}\nbody.premium-ui .settings-row{min-height:52px!important;padding:12px!important;border-radius:9px!important;background:linear-gradient(180deg,#0a1724,#06111a)!important}.settings-row>span{font-size:12px!important}.settings-segment button{min-height:32px!important;font-size:9px!important;border-radius:6px!important}\n\n/* Match */\nbody.premium-ui #match-ui .match-topbar{top:7px!important;left:8px!important;right:8px!important;height:48px!important;grid-template-columns:72px 1fr 96px!important;gap:5px!important}.match-topbar .score-pill{min-height:48px!important;border-radius:8px!important;font-size:11px!important;background:linear-gradient(180deg,#081019f5,#02060af2)!important;border-color:#fff2!important}.scoreboard{font-size:17px!important}\nbody.premium-ui #match-ui .matchhud{top:58px!important;font-size:9px!important;padding:4px 9px!important}.atbat-card{top:112px!important;left:9px!important;width:154px!important;padding:8px!important;border-radius:9px!important}.atbat-card strong{font-size:12px!important}.atbat-card .small{font-size:8px!important}.pitch-readout{font-size:9px!important}\nbody.premium-ui #match-ui .aim-area{width:92px!important;height:126px!important}.strike-zone{width:84px!important;height:118px!important}\nbody.premium-ui #match-ui .pitch-control{bottom:71px!important;width:min(94vw,380px)!important;height:38px!important;gap:5px!important}.pitch-control button{height:38px!important;border-radius:8px!important;font-size:8px!important}.pitch-control button.selected{background:linear-gradient(180deg,#193a55,#10283b)!important;border-color:#69b9ee!important}\nbody.premium-ui #match-ui .match-action-pad{bottom:7px!important;left:8px!important;right:8px!important;height:60px!important;grid-template-columns:74px 1fr 74px!important;gap:7px!important}.match-action-pad button{min-height:60px!important;border-radius:10px!important;font-size:12px!important}.match-action-pad span{font-size:14px!important}.match-action-pad small{font-size:7px!important}.match-action-pad .swing-main{min-height:66px!important;background:linear-gradient(180deg,#c59a3a,#765718)!important;border-color:#edcc70!important}\nbody.premium-ui #match-ui .bat-mode-pill{bottom:72px!important;border-radius:8px!important}.bat-mode-pill button{min-width:48px!important;height:27px!important;font-size:8px!important}.steal-button{top:111px!important;height:34px!important;font-size:9px!important}.bullpen-button{top:62px!important;height:30px!important;font-size:8px!important}.fielding-console{bottom:76px!important}.fielding-pad{width:82px!important;height:82px!important}.throw-grid button{height:34px!important;font-size:8px!important;border-radius:7px!important}\n@media(max-width:390px){.home-hero-card{min-height:398px!important}.home-hero-card h1{font-size:38px!important}.gacha-banner-card{min-height:250px!important}.gacha-banner-copy{width:41%!important}.gacha-feature-card{width:82px!important}.gacha-feature-card:first-child{width:92px!important}.gacha-feature-card img,.gacha-feature-card .gacha-fallback{height:112px!important}.gacha-feature-card:first-child img,.gacha-feature-card:first-child .gacha-fallback{height:126px!important}.sc-card-portrait{height:156px!important}.training-portrait{height:126px!important}#match-ui .match-topbar{grid-template-columns:61px 1fr 84px!important}#match-ui .atbat-card{width:142px!important}#match-ui .aim-area{width:86px!important;height:118px!important}.strike-zone{width:78px!important;height:110px!important}#match-ui .match-action-pad{grid-template-columns:67px 1fr 67px!important}}\n@media(max-width:360px){.sc-player-grid{grid-template-columns:1fr!important}.sc-card-portrait{height:210px!important}.training-grid{grid-template-columns:1fr!important}.training-portrait{height:175px!important}}\n";document.head.appendChild(style)}
installPremiumDesignSystemV3();

const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
export function ensurePresentationLayer(){let el=document.getElementById('presentation');if(el)return el;el=document.createElement('div');el.id='presentation';el.innerHTML='<div class="gacha-stage"><div class="gacha-sky"></div><div class="gacha-lights"></div><div class="gacha-field"></div><div class="gacha-ball"></div><div class="gacha-card-slot"><div id="pres-card" class="pres-card"></div></div><div class="gacha-particles"></div></div><div class="pres-vignette"></div><div id="gacha-result-banner" class="gacha-result-banner"><div id="gacha-result-rank" class="gacha-result-rank"></div><div id="gacha-result-status" class="gacha-result-status"></div><div id="gacha-result-type" class="gacha-result-type"></div></div><div id="pres-kicker" class="pres-kicker"></div><div id="pres-title" class="pres-title"></div><div id="pres-sub" class="pres-sub"></div><div id="pres-flash" class="pres-flash"></div>';document.body.appendChild(el);return el;}
export function gachaRevealType(result){if(result?.duplicate)return'DUPLICATE';if(result?.limited&&result?.rank==='S')return'LIMITED_S';if(result?.rank==='S')return'S_GUARANTEED';if(result?.rank==='A')return'A_HIGH';if(result?.rarity==='LEGEND')return'LEGEND';if(result?.rarity==='STAR')return'STAR';if(result?.rarity==='PRO')return'PRO';return'ROOKIE';}
export async function playGachaReveal({rarity,name,image,rank,limited,duplicate=false,banner,cardType,limitedTheme,overall,position,stats}){
 const root=ensurePresentationLayer(),k=document.getElementById('pres-kicker'),t=document.getElementById('pres-title'),s=document.getElementById('pres-sub'),flash=document.getElementById('pres-flash'),pc=document.getElementById('pres-card');
 const type=gachaRevealType({rarity,name,image,rank,limited,duplicate,banner});
 const special=limited?'limited':rank==='S'?'s-rank':rank==='A'?'a-rank':rarity==='LEGEND'?'legend':rarity==='STAR'?'star':'normal';
 root.className='pres-show gacha-page gacha-opening '+type.toLowerCase()+' '+special+(limited?' limited-card ':'')+' '+String(cardType||'').toLowerCase();
 k.textContent='SCOUT';t.textContent='';s.textContent='PLAYER ACQUISITION';
 if(pc)pc.innerHTML='';
 await wait(180);
 root.classList.add('gacha-stadium');
 await wait(limited?1800:rank==='S'?1900:type==='ROOKIE'?900:type==='PRO'?1150:1450);
 root.classList.remove('gacha-opening');root.classList.add('gacha-reveal');
 k.textContent=limited?(limitedTheme||cardType||'LIMITED CARD'):(type==='S_GUARANTEED'||type==='LIMITED_S'?'SPECIAL':'RESULT'); root.classList.add('gacha-rank-'+(rank==='S'?'s':rank==='A'?'a':rank==='B'?'b':'lower'));if(limited)root.classList.add('gacha-limited-result');const rb=document.getElementById('gacha-result-banner'),rr=document.getElementById('gacha-result-rank'),rs=document.getElementById('gacha-result-status'),rt=document.getElementById('gacha-result-type');if(rr)rr.textContent=(rank||rarity||'—')+' RANK';if(rs)rs.textContent=limited?'LIMITED':'NORMAL';if(rt)rt.textContent=limited?(limitedTheme||cardType||'LIMITED CARD'):'STANDARD CARD';
 t.textContent=name||'PLAYER';s.textContent=(limited?'LIMITED CARD · ':'')+((rank||rarity||'').toString())+' · '+(banner||'SCOUT');
 if(pc)pc.innerHTML='<div class="pres-card-frame"><div class="pres-card-top"><span>'+((limitedTheme||cardType||'BASEBALL 3D'))+'</span><b>'+((rank||rarity||'—'))+'</b></div><div class="pres-card-art">'+(image?'<img src="'+image+'" alt="">':'<div class="no-card">PLAYER</div>')+'</div><div class="pres-card-info"><small>'+((position||'PLAYER')+' · OVR '+(overall??'—'))+'</small><strong>'+((name||'PLAYER'))+'</strong><div class="pres-stat-row">'+Object.entries(stats||{}).slice(0,4).map(([k,v])=>'<i><em>'+k.toUpperCase()+'</em><b>'+v+'</b></i>').join('')+'</div></div></div>';
 flash.className='pres-flash active';setTimeout(()=>flash.className='pres-flash',limited||rank==='S'?520:260);
 await wait(limited?3000:rank==='S'?2800:type==='S_GUARANTEED'||type==='LIMITED_S'?2100:type==='LEGEND'?1800:1450);
 root.className='';return type;
}
export async function playMatchEvent(type,detail=''){ensurePresentationLayer();const root=document.getElementById('presentation'),k=document.getElementById('pres-kicker'),t=document.getElementById('pres-title'),s=document.getElementById('pres-sub');const map={inning:['GAME PRESENTATION',detail||'PLAY BALL'],pitch:['PITCH',detail||'投球開始'],single:['HIT','SINGLE'],double:['HIT','DOUBLE'],triple:['HIT','TRIPLE'],home_run:['HOME RUN','GOING DEEP'],strikeout:['STRIKEOUT','BATTER OUT'],out:['OUT','PLAY MADE'],walk:['BASE ON BALLS','TAKE YOUR BASE']};const v=map[type]||['PLAY',''+detail];root.className='pres-show match-event '+(type||'');k.textContent=v[0];t.textContent=v[1];s.textContent=detail&&detail!==v[1]?detail:'';await wait(type==='home_run'?1700:850);root.className='';}
