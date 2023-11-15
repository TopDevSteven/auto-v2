import { Injectable, Inject } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
import path from "path";
import { Pool } from "pg";

@Injectable()
export class BdayWriteToDBService {
  constructor (
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async readBdays(filePath: string = "./bday_append_output/bdyinput_nov.csv"): Promise<any []> {
      const results: any = [];
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (data) => results.push(data))
          .on("end", () => {
            resolve(results);
          })
          .on('error', (error) => {
            reject(error);
          })
      });
  };

  async writeTekBdayToDB() {
    const bdays = await this.readBdays();
    const tekBdays = bdays.filter(bday => bday['Software'] === 'Tek');
    
    for (const item of tekBdays) {
      const cid = item['CID'].trim();
      const shopId = item['SID'].trim();
      const byear = item['DOB-Mo'].trim();
      const bmonth = item['DOB-Yr'].trim();

      const existingCustomer = await this.db.query(
        `SELECT id FROM tekbday WHERE id = $1`,
        [cid]
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE tekbday SET b_year = $1, b_month = $2, shopid = $3 WHERE id = $4`,
          [byear, bmonth, shopId,  cid]
        );
      } else {
        await this.db.query(
          `INSERT INTO tekbday (id, shopid, b_year, b_month, b_day) VALUES ($1, $2, $3, $4, $5)`,
          [cid, shopId, byear, bmonth, ""]
        )
      };
    };
  };

  async writeProBdayToDB() {
    const bdays = await this.readBdays();
    const proBdays = bdays.filter(bday => bday['Software'] === 'pro');

    for (const item of proBdays) {
      const cid = item['CID'].trim();
      const shopName = item['Shop Name'].trim();
      const byear = item['DOB-Mo'].trim();
      const bmonth = item['DOB-Yr'].trim();

      const existingCustomer = await this.db.query(
        `SELECT id FROM protractorbday WHERE id = $1`,
        [cid]
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE protractorbday SET b_year = $1, b_month = $2 WHERE id = $3`,
          [byear, bmonth, cid]
        );
      } else {
        await this.db.query(
          `INSERT INTO protractorbday (id, shopname, b_year, b_month, b_day) VALUES ($1, $2, $3, $4, $5)`,
          [cid, shopName, byear, bmonth, ""]
        )
      };
    };
  };

  async writeSWBdayToDB() {
    const bdays = await this.readBdays();
    const swBdays = bdays.filter(bday => bday['Software'] === 'SW');

    for (const item of swBdays) {
      const cid = item['CID'].trim();
      const shopId = item['SID'].trim();
      const byear = item['DOB-Mo'].trim();
      const bmonth = item['DOB-Yr'].trim();

      const existingCustomer = await this.db.query(
        `SELECT id FROM shopwarebday WHERE id = $1`,
        [cid]
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE shopwarebday SET b_year = $1, b_month = $2 WHERE id = $3`,
          [byear, bmonth, cid]
        );
      } else {
        await this.db.query(
          `INSERT INTO shopwarebday (id, shopid, b_year, b_month, b_day) VALUES ($1, $2, $3, $4, $5)`,
          [cid, shopId, byear, bmonth, ""]
        )
      };
    };
  };

  async writeNapBdayToDB() {
    const bdays = await this.readBdays();
    const napBdays = bdays.filter(bday => bday['Software'] === 'nap')

    for (const item of napBdays) {
      const cid = item['CID'].trim();
      const byear = item['DOB-Mo'].trim();
      const bmonth = item['DOB-Yr'].trim();

      await this.db.query(
        `UPDATE napcustomer SET year_ = $1, month_ = $2 WHERE id = $3`,
        [byear, bmonth, cid]
      );
    };
  };

  async writeMitBdayToDB() {
    const bdays = await this.readBdays();
    const mitBdays = bdays.filter(bday => bday['Software'] === 'mit' && bday['Shop Name'] !== 'St. Joseph Automotive & Diesel');

    for (const item of mitBdays) {
      const cid = item['CID'].trim();
      const byear = item['DOB-Mo'].trim();
      const bmonth = item['DOB-Yr'].trim();

      await this.db.query(
        `UPDATE mitcustomer SET year_ = $1, month_ = $2 WHERE id = $3`,
        [byear, bmonth, cid]
      );
    };
  }
}