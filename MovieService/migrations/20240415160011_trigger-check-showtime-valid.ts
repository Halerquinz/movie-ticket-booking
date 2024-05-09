import type { Knex } from "knex";

const TabNameMovieServiceShowtime = "movie_service_showtime_tab";
const ColNameMovieServiceShowtimeOfMovieId = "of_movie_id";
const ColNameMovieServiceShowtimeOfScreenId = "of_screen_id";
const ColNameMovieServiceShowtimeTimeStart = "time_start";
const ColNameMovieServiceShowtimeTimeEnd = "time_end";
const ColNameMovieServiceShowtimeType = "showtime_type";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE OR REPLACE FUNCTION check_showtime_overlap()
        RETURNS trigger as $$

        DECLARE
        overlapping_showtime_count INT;

        BEGIN

        SELECT COUNT(*)
        INTO overlapping_showtime_count
        FROM ${TabNameMovieServiceShowtime}
        WHERE ${ColNameMovieServiceShowtimeOfScreenId} = NEW.${ColNameMovieServiceShowtimeOfScreenId}
        AND NOT (
        NEW.${ColNameMovieServiceShowtimeTimeStart} >= ${ColNameMovieServiceShowtimeTimeEnd}
        OR NEW.${ColNameMovieServiceShowtimeTimeEnd} <= ${ColNameMovieServiceShowtimeTimeStart}
        );

        IF overlapping_showtime_count > 0 THEN
        RAISE EXCEPTION 'There is already a showtime scheduled for this screen during the provided time slot.';

        END IF;

        RETURN NEW;
        END $$ LANGUAGE plpgsql;


        CREATE TRIGGER check_showtime_overlap
            BEFORE INSERT ON public.${TabNameMovieServiceShowtime}
            FOR EACH ROW
            EXECUTE PROCEDURE check_showtime_overlap();
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        DROP FUNCTION check_showtime_overlap() CASCADE;
    `);
}

