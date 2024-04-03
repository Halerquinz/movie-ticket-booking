import type { Knex } from "knex";

const TabNameMovieServiceMovieGenre = "movie_service_movie_genre_tab";
const TabNameMovieServiceMovie = "movie_service_movie_tab";
const TabNameMovieServiceMovieHasMovieGenre = "movie_service_movie_has_movie_genre_tab";
const TabNameMovieServiceMovieTrailer = "movie_service_movie_trailer_tab";
const TabNameMovieServiceMoviePoster = "movie_service_movie_poster_tab";
const TabNameMovieServiceMovieImage = "movie_service_movie_image_tab";
const TabNameMovieServiceTheater = "movie_service_theater_tab";
const TabNameMovieServiceScreen = "movie_service_screen_tab";
const TabNameMovieServiceScreenType = "movie_service_screen_type_tab";
const TabNameMovieServiceSeat = "movie_service_seat_tab";
const TabNameMovieServiceShowtime = "movie_service_showtime_tab";

export async function up(knex: Knex): Promise<void> {
    if (!(await knex.schema.hasTable(TabNameMovieServiceMovie))) {
        await knex.schema.createTable(TabNameMovieServiceMovieGenre, (table) => {
            table.increments("movie_genre_id", { primaryKey: true });

            table.string("display_name", 256).notNullable().unique();

            table.index(["display_name"], "movie_service_movie_genre_display_name_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceMovie))) {
        await knex.schema.createTable(TabNameMovieServiceMovie, (table) => {
            table.increments("movie_id", { primaryKey: true });

            table.string("title", 256).notNullable().unique();
            table.text("description").notNullable();
            table.string("duration", 256);
            table.bigInteger("release_date").notNullable();

            table.index(["title"], "movie_service_movie_title_idx");
            table.index(["release_date"], "movie_service_movie_release_date_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceMovieHasMovieGenre))) {
        await knex.schema.createTable(TabNameMovieServiceMovieHasMovieGenre, (table) => {
            table.integer("movie_id");
            table.integer("movie_genre_id");

            table.foreign("movie_id")
                .references("movie_id")
                .inTable(TabNameMovieServiceMovie);
            table.foreign("movie_genre_id")
                .references("movie_genre_id")
                .inTable(TabNameMovieServiceMovieGenre)
                .onDelete("CASCADE");

            table.unique(["movie_id", "movie_genre_id"]);
            table.index(["movie_id"], "movie_service_movie_has_movie_genre_movie_id_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceMovieTrailer))) {
        await knex.schema.createTable(TabNameMovieServiceMovieTrailer, (table) => {
            table.integer("of_movie_id");
            table.string('youtube_link_url', 256).notNullable();

            table.primary(["of_movie_id"]);
            table.foreign("of_movie_id")
                .references("movie_id")
                .inTable(TabNameMovieServiceMovie)
                .onDelete("CASCADE");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceMoviePoster))) {
        await knex.schema.createTable(TabNameMovieServiceMoviePoster, (table) => {
            table.integer("of_movie_id");
            table.string("original_filename", 256).notNullable();
            table.string("original_image_filename", 256).notNullable();
            table.string("thumbnail_image_filename", 256).notNullable();

            table.primary(["of_movie_id"]);
            table.foreign("of_movie_id")
                .references("movie_id")
                .inTable(TabNameMovieServiceMovie)
                .onDelete("CASCADE");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceMovieImage))) {
        await knex.schema.createTable(TabNameMovieServiceMovieImage, (table) => {
            table.increments("image_id", { primaryKey: true });
            table.integer("of_movie_id");

            table.string("original_file_name", 256).notNullable().defaultTo("");
            table.string("original_image_filename", 256).notNullable();
            table.string("thumbnail_image_filename", 256).notNullable();

            table.foreign("of_movie_id")
                .references("movie_id")
                .inTable(TabNameMovieServiceMovie)
                .onDelete("CASCADE");

            table.index(["of_movie_id"], "movie_service_movie_has_image_of_movie_id_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceTheater))) {
        await knex.schema.createTable(TabNameMovieServiceTheater, (table) => {
            table.increments("theater_id", { primaryKey: true });

            table.string("name", 256).notNullable();
            table.string("location", 256).notNullable();
            table.integer("screen_count").defaultTo(0);
            table.integer("seat_count").defaultTo(0);

            table.index(["name"], "movie_service_theater_name_idx");
            table.index(["location"], "movie_service_theater_location_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceScreenType))) {
        await knex.schema.createTable(TabNameMovieServiceScreenType, (table) => {
            table.increments("screen_type_id", { primaryKey: true });

            table.string("name", 256).notNullable();
            table.string("description", 256).notNullable();
            table.integer("seat_count").notNullable();

            table.index(["name"], "movie_service_screen_type_name_idx");
            table.index(["description"], "movie_service_screen_type_description_idx");
            table.index(["seat_count"], "movie_service_screen_type_seat_count_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceScreen))) {
        await knex.schema.createTable(TabNameMovieServiceScreen, (table) => {
            table.increments("screen_id", { primaryKey: true });
            table.integer("of_theater_id");
            table.integer("of_screen_type_id");

            table.foreign("of_theater_id")
                .references("theater_id")
                .inTable(TabNameMovieServiceTheater)
                .onDelete("CASCADE");
            table.foreign("of_screen_type_id")
                .references("screen_type_id")
                .inTable(TabNameMovieServiceScreenType)
                .onDelete("CASCADE");

            table.index(["of_theater_id"], "movie_service_screen_of_theater_id_idx");
            table.index(["of_screen_type_id"], "movie_service_screen_of_screen_type_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceSeat))) {
        await knex.schema.createTable(TabNameMovieServiceSeat, (table) => {
            table.increments("seat_id", { primaryKey: true });
            table.integer("of_screen_id", 256);

            table.string("column", 256).notNullable();
            table.integer("row", 256).notNullable();
            table.string("no", 256).notNullable();
            table.smallint("status").notNullable().defaultTo(0);

            table.foreign("of_screen_id")
                .references("screen_id")
                .inTable(TabNameMovieServiceScreen)
                .onDelete("CASCADE");

            table.index(["of_screen_id"], "movie_service_seat_of_screen_id_idx");
            table.index(["status"], "movie_service_seat_of_screen_status_idx");
        });
    }

    if (!(await knex.schema.hasTable(TabNameMovieServiceShowtime))) {
        await knex.schema.createTable(TabNameMovieServiceShowtime, (table) => {
            table.increments("showtime_id", { primaryKey: true });
            table.integer("of_movie_id", 256);
            table.integer("of_screen_id", 256);

            table.bigInteger("time_start").notNullable();
            table.bigInteger("time_end").notNullable();
            table.smallint("showtime_type").notNullable().defaultTo(0);

            table.foreign("of_movie_id")
                .references("movie_id")
                .inTable(TabNameMovieServiceMovie)
                .onDelete("CASCADE");
            table.foreign("of_screen_id")
                .references("screen_id")
                .inTable(TabNameMovieServiceScreen)
                .onDelete("CASCADE");

            table.index(["of_movie_id"], "movie_service_showtime_of_movie_id_idx");
            table.index(["of_screen_id"], "movie_service_showtime_of_screen_id_idx");
            table.index(["time_start"], "movie_service_showtime_time_start");
        });
    }
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists(TabNameMovieServiceMovie);
    await knex.schema.dropTableIfExists(TabNameMovieServiceMovieGenre);
    await knex.schema.dropTableIfExists(TabNameMovieServiceMovieTrailer);
    await knex.schema.dropTableIfExists(TabNameMovieServiceMoviePoster);
    await knex.schema.dropTableIfExists(TabNameMovieServiceMovieImage);
    await knex.schema.dropTableIfExists(TabNameMovieServiceTheater);
    await knex.schema.dropTableIfExists(TabNameMovieServiceScreenType);
    await knex.schema.dropTableIfExists(TabNameMovieServiceScreen);
    await knex.schema.dropTableIfExists(TabNameMovieServiceSeat);
    await knex.schema.dropTableIfExists(TabNameMovieServiceShowtime);
}


