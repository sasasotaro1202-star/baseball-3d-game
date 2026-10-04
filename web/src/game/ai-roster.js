import {ALL_PLAYERS} from '../data/players.js';

const ACTIVE_NPB = ALL_PLAYERS.filter(player => player.status === 'ACTIVE' && player.league === 'NPB');
const HITTER_IDS = new Set([2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017]);
const PITCHER_IDS = new Set([2001,2018,2019]);

function assertRosterIds(ids, predicate, label) {
  const players = ids.map(id => ALL_PLAYERS.find(player => player.id === id));
  if (players.some(player => !player || !predicate(player))) {
    throw new Error(`Invalid ${label} catalog mapping`);
  }
  return Object.freeze(ids);
}

export const AI_TEAM_LINEUP = assertRosterIds(
  [...HITTER_IDS],
  player => ACTIVE_NPB.includes(player) && !String(player.pos || '').includes('P'),
  'AI lineup'
);

export const AI_TEAM_PITCHERS = assertRosterIds(
  [...PITCHER_IDS],
  player => ACTIVE_NPB.includes(player) && String(player.pos || '').includes('P'),
  'AI pitchers'
);
