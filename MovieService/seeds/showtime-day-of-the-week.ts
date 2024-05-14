import { Knex } from "knex";

const TabNameMovieServiceShowtimeDayOfTheWeek = "movie_service_showtime_day_of_the_week_tab";

export async function seed(knex: Knex): Promise<void> {
    const exists = await knex(TabNameMovieServiceShowtimeDayOfTheWeek).first();
    if (!exists) {
        await knex(TabNameMovieServiceShowtimeDayOfTheWeek).insert([
            { showtime_day_of_the_week_id: 1, display_name: "Monday To Thursday" },
            { showtime_day_of_the_week_id: 2, display_name: "Friday To Sunday" },
        ]);
        console.log("Showtime Day Of The Week Seeding initialization finish");
    } else {
        console.log("Showtime Day Of The Week skipped: data already exists.");
    }
};
