import assert from 'node:assert/strict';

import {
  ACTIVITY_MENU_GROUPS,
  CURRENT_ACTIVITY_FESTIVAL_ID,
  FESTIVAL_CHECKIN_BLESSINGS,
  FESTIVAL_CULTURES,
  FESTIVAL_TEMPLATES,
} from '../src/pages/activityData.ts';

const festivalGroup = ACTIVITY_MENU_GROUPS.find((group) => group.id === 'festival-events');

assert.ok(festivalGroup, 'festival-events menu group should exist');
assert.deepEqual(festivalGroup.festivalIds, [
  'lantern-festival-2026',
  'guangxi-sanyuesan-2026',
  'graduation-season-2026',
  'mid-autumn-2026',
]);

const sanyuesanFestival = FESTIVAL_TEMPLATES.find((festival) => festival.id === 'guangxi-sanyuesan-2026');
const springFestival = FESTIVAL_TEMPLATES.find((festival) => festival.id === 'spring-equinox-2026');

assert.ok(sanyuesanFestival, 'Guangxi Sanyuesan festival should exist');
assert.ok(springFestival, 'Spring equinox festival should exist');
assert.equal(CURRENT_ACTIVITY_FESTIVAL_ID, 'guangxi-sanyuesan-2026');
assert.equal(sanyuesanFestival.menuLabel, '三月三');
assert.equal(sanyuesanFestival.title, '广西三月三歌圩活动季');
assert.equal(sanyuesanFestival.subtitle, '山歌民俗任务中心');
assert.equal(sanyuesanFestival.backgroundImage, 'images/festivals/guangxi-sanyuesan-2026-bg.png');

assert.deepEqual(sanyuesanFestival.tasks.map((task) => task.id), ['checkin', 'guess-song', 'festival-message']);
assert.equal(sanyuesanFestival.rewards.length, 3);

assert.deepEqual(FESTIVAL_CULTURES['guangxi-sanyuesan-2026']?.customs, ['对山歌', '抛绣球', '五色糯米饭', '竹竿舞']);
assert.equal(
  FESTIVAL_CULTURES['guangxi-sanyuesan-2026']?.summary,
  '广西三月三把山歌、壮锦、绣球和团聚宴席连在一起，是热闹又鲜活的民族节庆。'
);
assert.deepEqual(sanyuesanFestival.theme, springFestival.theme);
assert.deepEqual(
  sanyuesanFestival.tasks.map((task) => ({
    id: task.id,
    iconColor: task.iconColor,
    bgColor: task.bgColor,
  })),
  springFestival.tasks.map((task) => ({
    id: task.id,
    iconColor: task.iconColor,
    bgColor: task.bgColor,
  }))
);
assert.equal(
  FESTIVAL_CULTURES['guangxi-sanyuesan-2026']?.cultureCardClass,
  FESTIVAL_CULTURES['spring-equinox-2026']?.cultureCardClass
);
assert.equal(
  FESTIVAL_CULTURES['guangxi-sanyuesan-2026']?.customTagClass,
  FESTIVAL_CULTURES['spring-equinox-2026']?.customTagClass
);
assert.deepEqual(FESTIVAL_CHECKIN_BLESSINGS['guangxi-sanyuesan-2026'], [
  '山歌正好，愿你今天把欢喜唱给春天听。',
  '三月三喜乐，愿你的心意都被温柔接住。',
  '绣球轻轻一抛，把好运和好心情都接个满怀。',
  '歌圩签到成功，愿你在八桂春色里尽兴而归。',
]);
