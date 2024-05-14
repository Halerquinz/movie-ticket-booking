import { Knex } from "knex";

const TabNameMovieServiceMovieType = "movie_service_movie_type_tab";

export async function seed(knex: Knex): Promise<void> {
    const exists = await knex(TabNameMovieServiceMovieType).first();
    if (!exists) {
        await knex(TabNameMovieServiceMovieType).insert([
            { movie_type_id: 1, display_name: "2D Subtile" },
            { movie_type_id: 2, display_name: "2D Dubbing" },
            { movie_type_id: 3, display_name: "3D Subtitle" },
            { movie_type_id: 4, display_name: "3D Dubbing" }
        ]);
        console.log("Movie Type Seeding initialization finish");
    } else {
        console.log("Movie Type Seeding skipped: data already exists.");
    }
};