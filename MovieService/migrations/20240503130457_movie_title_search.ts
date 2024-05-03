import type { Knex } from "knex";

const ColNameMovieServiceMovieFullTextSearchDocument = "full_text_search_document";
const TabNameMovieServiceMovieTab = "movie_service_movie_tab";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
        ALTER TABLE public.${TabNameMovieServiceMovieTab} ADD ${ColNameMovieServiceMovieFullTextSearchDocument} tsvector;
    
        UPDATE public.${TabNameMovieServiceMovieTab} SET ${ColNameMovieServiceMovieFullTextSearchDocument} = to_tsvector(title || '' || description);

        CREATE FUNCTION movie_tab_write_trigger_function() 
        RETURNS trigger AS $$
        BEGIN
            NEW.${ColNameMovieServiceMovieFullTextSearchDocument} := to_tsvector(NEW."title" || '' || NEW."description");
            RETURN NEW;
        END $$ LANGUAGE 'plpgsql';

        CREATE TRIGGER movie_tab_write_trigger
        BEFORE INSERT ON public.${TabNameMovieServiceMovieTab}
        FOR EACH ROW
        EXECUTE PROCEDURE movie_tab_write_trigger_function();

        CREATE TRIGGER movie_tab_update_trigger
        BEFORE UPDATE ON public.${TabNameMovieServiceMovieTab}
        FOR EACH ROW
        EXECUTE PROCEDURE movie_tab_write_trigger_function();

        CREATE INDEX movie_service_movie_full_text_search_idx ON public.${TabNameMovieServiceMovieTab} USING GIN(full_text_search_document);
    `
    );
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(TabNameMovieServiceMovieTab, (tab) => {
        tab.dropColumn("full_text_search_document");
    });
    await knex.schema.raw(`
        DROP FUNCTION movie_tab_write_trigger_function() CASCADE;
    `);
}

