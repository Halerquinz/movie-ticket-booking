import { Knex } from "knex";

const TabNameMovieServiceMovieType = "movie_service_movie_type_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceMovieType).del();

    await knex(TabNameMovieServiceMovieType).insert([
        { display_name: "2D Subtile" },
        { display_name: "2D Dubbing" },
        { display_name: "3D Subtitle" },
        { display_name: "3D Dubbing" }
    ]);
};