import { Knex } from "knex";

const TabNameMovieServiceShowtimeSlot = "movie_service_showtime_slot_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceShowtimeSlot).del();

    await knex(TabNameMovieServiceShowtimeSlot).insert([
        { showtime_slot_id: 1, display_name: "Before 5 pm" },
        { showtime_slot_id: 2, display_name: "After 5 pm" },
    ]);
};
