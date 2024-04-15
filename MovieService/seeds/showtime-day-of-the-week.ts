import { Knex } from "knex";

const TabNameMovieServiceShowtimeDayOfTheWeek = "movie_service_showtime_day_of_the_week_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceShowtimeDayOfTheWeek).del();

    await knex(TabNameMovieServiceShowtimeDayOfTheWeek).insert([
        { display_name: "Monday To Thursday" },
        { display_name: "Friday To Sunday" },
    ]);
};
