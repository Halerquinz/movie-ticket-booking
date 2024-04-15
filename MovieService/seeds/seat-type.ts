import { Knex } from "knex";

const TabNameMovieServiceSeatType = "movie_service_seat_type_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceSeatType).del();

    await knex(TabNameMovieServiceSeatType).insert([
        {
            display_name: "Normal"
        },
        {
            display_name: "Vip"
        }
    ]);
};
