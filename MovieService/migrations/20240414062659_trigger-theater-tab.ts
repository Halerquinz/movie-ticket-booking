import type { Knex } from "knex";

const TabNameMovieServiceTheater = "movie_service_theater_tab";
const TabNameMovieServiceScreenType = "movie_service_screen_type_tab";
const TabNameMovieServiceScreen = "movie_service_screen_tab";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        CREATE FUNCTION theater_tab_update_trigger_function()
        RETURNS trigger as $$
        BEGIN
        
        UPDATE ${TabNameMovieServiceTheater}
        SET screen_count = screen_count + 1 WHERE theater_id = NEW.of_theater_id;

        UPDATE ${TabNameMovieServiceTheater}
        SET seat_count = seat_count + (SELECT seat_count from ${TabNameMovieServiceScreenType} WHERE screen_type_id = NEW.of_screen_type_id)
        WHERE theater_id = NEW.of_theater_id;

        RETURN NEW;
        END $$ LANGUAGE 'plpgsql';

        CREATE TRIGGER theater_tab_update_trigger
            BEFORE INSERT ON public.${TabNameMovieServiceScreen}
            FOR EACH ROW
            EXECUTE PROCEDURE theater_tab_update_trigger_function();
    `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        DROP FUNCTION theater_tab_update_trigger_function() CASCADE;
    `);
}

