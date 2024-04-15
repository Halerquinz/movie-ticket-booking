import { Knex } from "knex";

const TabNameMovieServiceMovieGenre = "movie_service_movie_genre_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceMovieGenre).del();

    await knex(TabNameMovieServiceMovieGenre).insert([
        { display_name: "Action" },
        { display_name: "Adventure" },
        { display_name: "Comedy" },
        { display_name: "Crime" },
        { display_name: "Drama" },
        { display_name: "Fantasy" },
        { display_name: "Historical" },
        { display_name: "Horror" },
        { display_name: "Mystery" },
        { display_name: "Romance" },
        { display_name: "Science Fiction" },
        { display_name: "Thriller" },
        { display_name: "Western" },
        { display_name: "Animation" },
        { display_name: "Documentary" },
        { display_name: "Musical" },
        { display_name: "War" },
        { display_name: "Biographical" }
    ]);
};
