/* Seasonal offers use explicit Philippine time and never repeat automatically. */
const PiliPromotions = (() => {
  // endsAt is exclusive: midnight immediately after the last advertised day.
  const schedule = Object.freeze({
    habagat: Object.freeze({
      startsAt: '2026-07-01T00:00:00+08:00',
      endsAt: '2026-12-01T00:00:00+08:00'
    }),
    christmas: Object.freeze({
      startsAt: '2026-11-01T00:00:00+08:00',
      endsAt: '2027-01-01T00:00:00+08:00'
    })
  });

  function isActive(promotionId, now = new Date()) {
    if (!Object.hasOwn(schedule, promotionId)) return false;
    const promotion = schedule[promotionId];
    const time = new Date(now).getTime();
    return time >= Date.parse(promotion.startsAt) && time < Date.parse(promotion.endsAt);
  }

  function getRoomPromoPrice(room, now = new Date()) {
    return isActive(room.promotionId, now) ? room.promoPrice : null;
  }

  function getNextChange(now = new Date()) {
    const time = new Date(now).getTime();
    const upcoming = Object.values(schedule)
      .flatMap(promotion => [Date.parse(promotion.startsAt), Date.parse(promotion.endsAt)])
      .filter(boundary => boundary > time);
    return upcoming.length ? Math.min(...upcoming) : null;
  }

  function renderRoomPrice(element, room, now = new Date()) {
    const price = getRoomPromoPrice(room, now);
    element.classList.toggle('rate-unavailable', !price);
    element.textContent = price || 'Check current rates';
    if (price) {
      const period = element.ownerDocument.createElement('span');
      period.textContent = '/ night';
      element.append(' ', period);
    }
  }

  function refreshPage(root, rooms, now = new Date()) {
    root.querySelectorAll('[data-promotion]').forEach(element => {
      element.hidden = !isActive(element.dataset.promotion, now);
    });

    const promoGrid = root.querySelector('.promos-grid');
    const activeCount = promoGrid.querySelectorAll('.promo-card:not([hidden])').length;
    promoGrid.dataset.activePromotions = activeCount;
    promoGrid.hidden = activeCount === 0;
    root.getElementById('promotionsEmpty').hidden = activeCount > 0;

    root.querySelectorAll('.room-card[data-room-id]').forEach(card => {
      renderRoomPrice(card.querySelector('.room-price'), rooms[card.dataset.roomId], now);
    });

    const roomModal = root.getElementById('roomModal');
    if (roomModal.classList.contains('active')) {
      renderRoomPrice(root.getElementById('roomModalPrice'), rooms[roomModal.dataset.roomId], now);
    }
  }

  return Object.freeze({ schedule, isActive, getRoomPromoPrice, getNextChange, renderRoomPrice, refreshPage });
})();

// Share the browser's scheduling rules with dependency-free Node tests.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PiliPromotions;
}
