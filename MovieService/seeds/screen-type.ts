import { Knex } from "knex";

const TabNameMovieServiceScreenType = "movie_service_screen_type_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceScreenType).del();

    await knex(TabNameMovieServiceScreenType).insert([
        {
            screen_type_id: 1,
            display_name: "2D Small",
            description: "Small screen 2d room",
            seat_count: 90,
            row_count: 9,
            seat_of_row_count: 10
        },
        {
            screen_type_id: 2,
            display_name: "2D Medium",
            description: "Medium screen 2d room",
            seat_count: 120,
            row_count: 10,
            seat_of_row_count: 12
        },
        {
            screen_type_id: 3,
            display_name: "2D Large",
            description: "Large screen 2d room",
            seat_count: 150,
            row_count: 10,
            seat_of_row_count: 15
        },
        {
            screen_type_id: 4,
            display_name: "3D Small",
            description: "Small screen 2d room",
            seat_count: 90,
            row_count: 9,
            seat_of_row_count: 10
        },
        {
            screen_type_id: 5,
            display_name: "3D Medium",
            description: "Medium screen 2d room",
            seat_count: 120,
            row_count: 10,
            seat_of_row_count: 12
        },
        {
            screen_type_id: 6,
            display_name: "3D Large",
            description: "Large screen 2d room",
            seat_count: 150,
            row_count: 10,
            seat_of_row_count: 15
        }
    ]);
};