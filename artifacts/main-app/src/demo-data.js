import Papa from "papaparse";
import menuCsv from "./menu.csv?raw";
import eventsCsv from "./events.csv?raw";

function parseMenu(csv) {
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const dishMap = new Map();

  for (const row of data) {
    const id = row["dish_id"];
    if (!id) continue;

    if (!dishMap.has(id)) {
      dishMap.set(id, {
        id,
        name: row["dish_name"],
        category: row["category"],
        prepItems: [],
      });
    }

    const prepId = row["prep_item_id"];
    if (prepId) {
      dishMap.get(id).prepItems.push({
        id: prepId,
        name: row["prep_item_name"],
        defaultQty: row["default_qty"] || "",
        allergyNote: row["allergy_note"] || "",
      });
    }
  }

  return Array.from(dishMap.values());
}

function parseEvents(csv) {
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const eventMap = new Map();

  for (const row of data) {
    const eventId = row["event_id"];
    if (!eventId) continue;

    if (!eventMap.has(eventId)) {
      eventMap.set(eventId, {
        id: eventId,
        name: row["event_name"],
        client: "",
        date: row["date"],
        startTime: row["start_time"],
        guestCount: row["guests"],
        venue: row["address"],
        onsiteContact: row["onsite_contact"],
        allergies: row["allergies"],
        notes: "",
        dishes: [],
        savedAt: new Date().toISOString(),
      });
    }

    const ev = eventMap.get(eventId);
    const dishId = row["dish_id"];
    if (!dishId) continue;

    let dish = ev.dishes.find((d) => d.dishId === dishId);
    if (!dish) {
      dish = {
        dishId,
        name: row["dish_name"],
        category: row["category"],
        subNote: row["sub_note"] || "",
        prepItems: [],
      };
      ev.dishes.push(dish);
    }

    const prepId = row["prep_item_id"];
    if (prepId) {
      dish.prepItems.push({
        prepItemId: prepId,
        name: row["prep_item_name"],
        qty: row["qty"] || "",
        location: row["location"] || "",
        allergyNote: row["allergy_note"] || "",
      });
    }
  }

  return Array.from(eventMap.values());
}

export const DEMO_MENU = parseMenu(menuCsv);
export const DEMO_EVENTS = parseEvents(eventsCsv);
