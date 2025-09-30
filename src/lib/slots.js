// Office hours format:
// [{ day: 0-6 (0=Sun), start: "HH:MM", end: "HH:MM", slotMinutes: 15 }]
// We generate 4 weeks of 15-min slots from today, in local time.

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(n => parseInt(n, 10));
    return h * 60 + m;
  }
  
  function dateAtLocal(dayjs, hhmm) {
    const [h, m] = hhmm.split(":").map(n => parseInt(n, 10));
    const d = new Date(dayjs);
    d.setHours(h, m, 0, 0);
    return d;
  }
  
  export function generateUpcomingSlots(officeHours = [], weeks = 4) {
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + weeks * 7);
  
    const days = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
  
    const slots = [];
    for (const day of days) {
      const dow = day.getDay(); // 0-6
      const todays = officeHours.filter(oh => Number(oh.day) === Number(dow));
      for (const oh of todays) {
        const startM = toMinutes(oh.start);
        const endM = toMinutes(oh.end);
        const step = Number(oh.slotMinutes || 15);
        for (let t = startM; t + step <= endM; t += step) {
          const h = Math.floor(t / 60);
          const m = t % 60;
          const slotStart = new Date(day);
          slotStart.setHours(h, m, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + step);
          // Only future
          if (slotEnd > now) {
            const slotId = `${slotStart.toISOString()}_${slotEnd.toISOString()}`;
            slots.push({
              slotId,
              startISO: slotStart.toISOString(),
              endISO: slotEnd.toISOString(),
            });
          }
        }
      }
    }
  
    // Sort ascending
    slots.sort((a, b) => new Date(a.startISO) - new Date(b.startISO));
    return slots;
  }
  