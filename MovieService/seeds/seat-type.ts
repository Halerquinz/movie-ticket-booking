import { Knex } from "knex";

const TabNameMovieServiceSeatType = "movie_service_seat_type_tab";

export async function seed(knex: Knex): Promise<void> {
    const exists = await knex(TabNameMovieServiceSeatType).first();
    if (!exists) {
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
        console.log("Seat Type Seeding initialization finish");
    } else {
        console.log("Seat Type Seeding skipped: data already exists.");
    }
};