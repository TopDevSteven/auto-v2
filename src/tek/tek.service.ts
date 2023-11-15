import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";

export type customerObject = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  authDate: Date;
  byear: string | null;
  bmonth: string | null;
  bday: string | null;
  shopName: string | null;
  shopPhone: string | null;
  shopEmail: string | null;
  software: string;
  wowShopId: number;
  chainId: number | null;
  shopId: number | string | null;
};

@Injectable()
export class TekService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async fetchCustomers(
    shopId: number,
    wowShopId: number,
    chainId: number,
    software: string,
    period: number,
    isAll: boolean = false,
  ): Promise<customerObject[]> {
    const tableId = Math.floor(shopId / 500);
    const res = await this.db.query(
      `
            SELECT 
                c.id as id,
                c.firstname as firstName,
                c.lastname as lastName,
                c.address1 as address, 
                c.address2 as address2, 
                c.address_city as city, 
                c.address_state as state,
                c.address_zip as zip,
                j.lastauthorized_date as authDate,
                b.b_year as byear,
                b.b_month as bmonth,
                b.b_day as bday,
                s.name as shopName,
                s.phone as shopPhone,
                s.email as shopEmail
            FROM tekcustomer${tableId} AS c
            LEFT JOIN(
                SELECT customerid, MAX(authorizedDate) as lastauthorized_date
                FROM tekjob${tableId}
                GROUP BY customerid
            ) as j
            ON c.id = j.customerid
            LEFT JOIN tekbday b ON
            CASE
            WHEN b.id ~ '^[0-9]+$' THEN CAST(b.id AS INTEGER)
            ELSE NULL
            END = c.id
            LEFT JOIN tekshop as s
            ON c.shopId = s.id
            WHERE (${isAll} OR (j.lastauthorized_date >= DATE(NOW() - INTERVAL '${period} MONTH')))
            AND c.shopId = '${shopId}';
            `,
    );

    return res.rows.map((row) => ({
      id: row.id,
      firstName: row.firstname,
      lastName: row.lastname,
      address: row.address,
      address2: row.address2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      authDate: new Date(row.authdate === null ? 0 : row.authdate),
      byear: row.byear,
      bmonth: row.bmonth,
      bday: row.bday,
      shopName: row.shopname,
      shopPhone: row.shopphone,
      shopEmail: row.shopemail,
      software: software,
      wowShopId: wowShopId,
      chainId: chainId,
      shopId: shopId,
    }));
  }
}
