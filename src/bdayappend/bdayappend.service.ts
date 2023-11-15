import { Injectable } from '@nestjs/common';
import { BdayAppendDistanceService } from './bdayappend.distance.service';
import * as fs from "fs";
import csv from "csv-parser";
const csvWriter = require("csv-writer");
import path from "path";

export type customerObject = {
    id: any;
    wsId: string;
    wcaId: string;
    software: string;
    shopId: string;
    shopName: string;
    customerId: string;
    authdate: string;
    mbdayyr: string;
    mbdaymo: string;
    tbdaymo: string;
    firstName: string;
    lastName: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    status: string;
    latitude: number;
    logitude: number;
}

type storePositionObject = {
    software : string;
    wsid: string;
    name: string;
    latitude: number;
    logitude: number;
}

export type bdayCustomerObject = {
    wsId: string;
    wcaId: string;
    software: string;
    shopId: string;
    customerId: string;
    authdate: string;
    mbdayyr: string;
    mbdaymo: string;
    tbdaymo: string;
    firstName: string;
    lastName: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    status: string;
    latitude: number;
    logitude: number;
    wcId: string;
    distance: number | null;
    isMailable: boolean;
    shopname: string;
}

@Injectable()
export class BdayappendService {
    constructor (
        private readonly bdayAppendDistanceService: BdayAppendDistanceService
    ) {}

    async readAccuzipResult(filePath: string): Promise <customerObject []> {
        const results: any = [];
        return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on(
            "data",
            (data: {
                wsid: string;
                wcaid: string;
                software: string;
                sid: string;
                shop_name: string;
                cid: string;
                authdate: string;
                mbdayyr: string;
                mbdaymo: string;
                tbdaymo: string;
                first: string;
                last: string;
                address: string;
                address2: string;
                city: string;
                st: string;
                zip: string;
                status_: string;
                latitude_: string;
                longitude_: string;
            }) => {
                if (data["status_"]?.trim() === "V") {
                results.push({
                    wsId: data["wsid"].trim(),
                    wcaId: data["wcaid"].trim(),
                    software: data["software"].trim(),
                    shopId: data["sid"].trim(),
                    shopName: data["shop_name"] ? data["shop_name"].trim() : "",
                    customerId: data["cid"].trim(),
                    authdate: data["authdate"].trim(),
                    mbdayyr: data["mbdayyr"].trim(),
                    mbdaymo: data["mbdaymo"].trim(),
                    tbdaymo: data["tbdaymo"].trim(),
                    firstName: data["first"].trim(),
                    lastName: data["last"].trim(),
                    address: data["address"].trim(),
                    address2: data["address2"].trim(),
                    city: data["city"].trim(),
                    state: data["st"].trim(),
                    zip: data["zip"].trim(),
                    status: data["status_"].trim(),
                    latitude: Number(data["latitude_"].trim()),
                    logitude: Number(data["longitude_"].trim())
                });
                }
            },
            )
            .on("end", () => {
            resolve(results);
            })

            .on("error", (error) => {
            reject(error);
            });
        });
    };

    async getStorePosition(filePath: string): Promise <storePositionObject []> {
        const results: any = [];
        return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on(
            "data",
            (data: {
                Software: string,
                WSID: string,
                name: string,
                Latitude: string,
                Longitude: string
            }) => {
                results.push({
                    software: data["Software"].trim(),
                    wsid: data["WSID"].trim(),
                    name: data["name"].trim(),
                    latitude: Number(data["Latitude"].trim()),
                    logitude: Number(data["Longitude"].trim()),
                });
            },
            )
            .on("end", () => {
            resolve(results);
            })

            .on("error", (error) => {
            reject(error);
            });
        });
    }

    async noBdayCustomers(filePath1: string, stShopPath: string, filePath2: string, bday: boolean): Promise <bdayCustomerObject []> {
        const customers1 = await this.readAccuzipResult(filePath1);
        const customers2 = await this.readAccuzipResult(stShopPath);

        console.log(customers1[customers1.length - 1])

        customers2.map((customer) => {
            if (customer.wsId === "") {
                customer.wsId = "1056"
            };
        });

        const customers = [
            ...customers1,
            ...customers2
        ]

        const storePosition = await this.getStorePosition(filePath2);

        const newCustomers = await Promise.all(
            customers.map(customer => {
                const customerLat = customer.latitude;
                const customerLon = customer.logitude;

                
                let shop = null;

                if (customer.wsId == "0") {
                    shop = storePosition.find(shop => shop.name.trim().toLowerCase() == customer.shopName.trim().toLowerCase());
                } else {
                    shop = storePosition.find(shop => shop.wsid == customer.wsId);
                }
                
                let distance = null
                let isMailable = false
                if (shop){
                    const shopLat = shop.latitude;
                    const shopLon = shop.logitude;
                    distance = this.bdayAppendDistanceService.calculateDistance(customerLat, customerLon, shopLat, shopLon);
                    
                    if (distance * 0.621371 <= 50) {
                        isMailable = true;
                    }
                    
                    if ((shop.wsid === "1054" || shop.wsid === "1008" ) && distance * 0.621371 <= 25) {
                        isMailable = true;
                    }
                }

                return {
                    ...customer,
                    wcId: "",
                    distance: distance != null? distance *  0.621371 : null,
                    isMailable: isMailable,
                    shopname: shop? shop.name: ""
                }
            })
        )

        const bdayCustomers = bday ? newCustomers.filter(customer => customer.isMailable === true && customer.mbdaymo === "")
                                     : newCustomers.filter(customer => customer.isMailable === true)

        return bdayCustomers;
    }

    async saveBdayInputFile(filePath1: string, stShopPath: string, filePath2: string) {
        const customers = await this.noBdayCustomers(filePath1, stShopPath, filePath2, false);
        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, `./Bdayinput/BdayInput.csv`),
            header: [
              { id: "shopname", title: "Shop Name"},
              { id: "software", title: "Software" },
              { id: "shopId", title: "SID" },
              { id: "customerId", title: "CID" },
              { id: "wcId", title: "WCID"},
              { id: "wsId", title: "WSID" },
              { id: "wcaId", title: "WCAID" },
              { id: "mbdayyr", title: "MBdayYr"},
              { id: "mbdaymo", title: "MBdayMo" },
              { id: "firstName", title: "First" },
              { id: "lastName", title: "Last" },
              { id: "address", title: "Address" },
              { id: "address2", title: "Address2"},
              { id: "city", title: "City" },
              { id: "state", title: "St" },
              { id: "zip", title: "Zip" },
            ],
          });
      
          await writer.writeRecords(customers).then(() => {
            console.log("Done!");
          });
    }
}
