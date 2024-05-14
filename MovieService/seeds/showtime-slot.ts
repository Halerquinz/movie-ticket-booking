import { Knex } from "knex";

const TabNameMovieServiceShowtimeSlot = "movie_service_showtime_slot_tab";

export async function seed(knex: Knex): Promise<void> {
    const exists = await knex(TabNameMovieServiceShowtimeSlot).first();
    if (!exists) {
        await knex(TabNameMovieServiceShowtimeSlot).insert([
            { showtime_slot_id: 1, display_name: "Before 5 pm" },
            { showtime_slot_id: 2, display_name: "After 5 pm" },
        ]);
        console.log("Showtime Slot Seeding initialization finish");
    } else {
        console.log("Showtime Slot initialization finish");
    }
};
