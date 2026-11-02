const test = require('node:test');
const assert = require('node:assert/strict');
const promotions = require('../js/promotions.js');

test('Habagat includes its first and final advertised days in Philippine time', () => {
  assert.equal(promotions.isActive('habagat', '2026-06-30T23:59:59.999+08:00'), false);
  assert.equal(promotions.isActive('habagat', '2026-07-01T00:00:00+08:00'), true);
  assert.equal(promotions.isActive('habagat', '2026-11-30T23:59:59.999+08:00'), true);
  assert.equal(promotions.isActive('habagat', '2026-12-01T00:00:00+08:00'), false);
});

test('Christmas is bookable before December and expires at New Year', () => {
  assert.equal(promotions.isActive('christmas', '2026-10-31T23:59:59.999+08:00'), false);
  assert.equal(promotions.isActive('christmas', '2026-11-01T00:00:00+08:00'), true);
  assert.equal(promotions.isActive('christmas', '2026-11-02T12:00:00+08:00'), true);
  assert.equal(promotions.isActive('christmas', '2026-12-31T23:59:59.999+08:00'), true);
  assert.equal(promotions.isActive('christmas', '2027-01-01T00:00:00+08:00'), false);
});

test('the same cutoff applies to visitors in other time zones', () => {
  for (const instant of ['2026-11-30T16:00:00Z', '2026-11-30T08:00:00-08:00', '2026-12-01T01:00:00+09:00']) {
    assert.equal(promotions.isActive('habagat', instant), false);
    assert.equal(promotions.isActive('christmas', instant), true);
  }
  assert.equal(promotions.isActive('habagat', '2026-11-30T15:59:59.999Z'), true);
});

test('offers do not return next year and unknown or invalid dates fail closed', () => {
  assert.equal(promotions.isActive('habagat', '2027-07-01T00:00:00+08:00'), false);
  assert.equal(promotions.isActive('christmas', '2027-12-01T00:00:00+08:00'), false);
  assert.equal(promotions.isActive('unknown', '2026-11-02T00:00:00+08:00'), false);
  assert.equal(promotions.isActive('constructor', '2026-11-02T00:00:00+08:00'), false);
  assert.equal(promotions.isActive('habagat', new Date(NaN)), false);
});

test('an inactive room offer returns no replacement price', () => {
  const room = { promotionId: 'habagat', promoPrice: '₱5,000 - ₱6,000' };
  assert.equal(promotions.getRoomPromoPrice(room, '2026-11-30T23:59:59+08:00'), room.promoPrice);
  assert.equal(promotions.getRoomPromoPrice(room, '2026-12-01T00:00:00+08:00'), null);
  assert.equal(promotions.getRoomPromoPrice(room, '2026-06-01T00:00:00+08:00'), null);
});

test('the next scheduled refresh advances across starts, expirations, and the last offer', () => {
  assert.equal(promotions.getNextChange('2026-06-01T00:00:00+08:00'), Date.parse('2026-07-01T00:00:00+08:00'));
  assert.equal(promotions.getNextChange('2026-10-01T00:00:00+08:00'), Date.parse('2026-11-01T00:00:00+08:00'));
  assert.equal(promotions.getNextChange('2026-11-02T00:00:00+08:00'), Date.parse('2026-12-01T00:00:00+08:00'));
  assert.equal(promotions.getNextChange('2026-12-01T00:00:00+08:00'), Date.parse('2027-01-01T00:00:00+08:00'));
  assert.equal(promotions.getNextChange('2027-01-01T00:00:00+08:00'), null);
});

// A minimal document fixture exercises the actual visibility and price updater.
function makeElement() {
  const classes = new Set();
  let text = '';
  let children = [];
  return {
    hidden: true,
    dataset: {},
    classList: {
      contains: name => classes.has(name),
      toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); }
    },
    ownerDocument: { createElement: () => makeElement() },
    set textContent(value) { text = value; children = []; },
    get textContent() { return text + children.map(child => typeof child === 'string' ? child : child.textContent).join(''); },
    append(...nodes) { children.push(...nodes); }
  };
}

function makePage() {
  const cards = ['christmas', 'habagat'].map(id => {
    const card = makeElement();
    card.dataset.promotion = id;
    return card;
  });
  const rooms = {};
  const badges = [];
  const prices = [];
  const roomCards = ['lion', 'lizard', 'turtle', 'shark', 'stingray', 'gecko'].map(id => {
    rooms[id] = { promotionId: 'habagat', promoPrice: '₱2,000 - ₱2,500' };
    const badge = makeElement();
    badge.dataset.promotion = 'habagat';
    badges.push(badge);
    const price = makeElement();
    prices.push(price);
    const card = makeElement();
    card.dataset.roomId = id;
    card.querySelector = selector => {
      assert.equal(selector, '.room-price');
      return price;
    };
    return card;
  });
  const grid = makeElement();
  grid.querySelectorAll = selector => {
    assert.equal(selector, '.promo-card:not([hidden])');
    return cards.filter(card => !card.hidden);
  };
  const empty = makeElement();
  const modal = makeElement();
  modal.dataset.roomId = 'lion';
  const modalPrice = makeElement();
  const root = {
    querySelectorAll(selector) {
      if (selector === '[data-promotion]') return [...cards, ...badges];
      if (selector === '.room-card[data-room-id]') return roomCards;
      throw new Error(`Unexpected selector: ${selector}`);
    },
    querySelector(selector) {
      assert.equal(selector, '.promos-grid');
      return grid;
    },
    getElementById(id) {
      return { promotionsEmpty: empty, roomModal: modal, roomModalPrice: modalPrice }[id];
    }
  };
  return { root, rooms, cards, badges, prices, grid, empty, modal, modalPrice };
}

test('both active offers and all six room badges and rates appear without duplicating nightly labels', () => {
  const page = makePage();
  for (let refresh = 0; refresh < 2; refresh++) {
    promotions.refreshPage(page.root, page.rooms, new Date('2026-11-30T23:59:59+08:00'));
    assert.equal(page.grid.dataset.activePromotions, 2);
    assert.equal(page.empty.hidden, true);
    assert.equal(page.grid.hidden, false);
    assert.ok(page.cards.every(card => !card.hidden));
    assert.ok(page.badges.every(badge => !badge.hidden));
    assert.ok(page.prices.every(price => price.textContent === '₱2,000 - ₱2,500 / night'));
  }
});

test('midnight expiration updates cards, six room rates, and an already-open room modal', () => {
  const page = makePage();
  page.modal.classList.toggle('active', true);
  promotions.refreshPage(page.root, page.rooms, new Date('2026-11-30T23:59:59+08:00'));
  assert.equal(page.modalPrice.textContent, '₱2,000 - ₱2,500 / night');

  promotions.refreshPage(page.root, page.rooms, new Date('2026-12-01T00:00:00+08:00'));
  assert.deepEqual(page.cards.map(card => card.hidden), [false, true]);
  assert.equal(page.grid.dataset.activePromotions, 1);
  assert.equal(page.empty.hidden, true);
  assert.ok(page.badges.every(badge => badge.hidden));
  assert.ok(page.prices.every(price => price.textContent === 'Check current rates' && price.classList.contains('rate-unavailable')));
  assert.equal(page.modalPrice.textContent, 'Check current rates');
  assert.equal(page.modal.classList.contains('active'), true);
});

test('after the final offer, the availability fallback replaces the empty grid', () => {
  const page = makePage();
  promotions.refreshPage(page.root, page.rooms, new Date('2027-01-01T00:00:00+08:00'));
  assert.equal(page.grid.hidden, true);
  assert.equal(page.grid.dataset.activePromotions, 0);
  assert.equal(page.empty.hidden, false);
  assert.ok(page.cards.every(card => card.hidden));
  assert.ok(page.badges.every(badge => badge.hidden));
});

test('before Christmas booking opens, the Habagat card is the only offer', () => {
  const page = makePage();
  promotions.refreshPage(page.root, page.rooms, new Date('2026-08-01T00:00:00+08:00'));
  assert.deepEqual(page.cards.map(card => card.hidden), [true, false]);
  assert.equal(page.grid.dataset.activePromotions, 1);
  assert.equal(page.empty.hidden, true);
});
