import { Knex } from "knex";

const TabNameMovieServiceSeatType = "movie_service_seat_type_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceSeatType).del();

    await knex(TabNameMovieServiceSeatType).insert([
        {
            seat_type_id: 1,
            display_name: "Normal"
        },
        {
            seat_type_id: 2,
            display_name: "Vip"
        }
    ]);
};