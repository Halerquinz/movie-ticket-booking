import { Knex } from "knex";

const TabNameMovieServiceTheater = "movie_service_theater_tab";

export async function seed(knex: Knex): Promise<void> {
    await knex(TabNameMovieServiceTheater).del();

    await knex(TabNameMovieServiceTheater).insert([
        { display_name: "Cantavil", location: "Tầng 7, Cantavil Premier, Số 1 đường Song Hành, Xa lộ Hà Nội, P.An Phú, Q.2, TP.HCM, Việt Nam" },
        { display_name: "Cộng hoà", location: "Tầng 4, Pico Plaza, 20 Cộng Hòa, P.12, Q.Tân Bình, TP.HCM, Việt Nam" },
        { display_name: "Gò vấp", location: "Tầng 3, Lotte Mart Gò Vấp, 242 Nguyễn Văn Lượng, Q.Gò Vấp, TP.HCM, Việt Nam" },
        { display_name: "Gold View", location: "Tầng 3 TTTM TNL Plaza, Số 346 Đường Bến Vân Đồn, Phường 1, Quận 4, TP. Hồ Chí Minh, Việt Nam" },
        { display_name: "Moonlight", location: "Tầng 2 Moonlight Residences, Số 102 Đặng Văn Bi, P. Bình Thọ, Q. Thủ Đức, TP. Hồ Chí Minh, Việt Nam" },
    ]);
};
