import { Injectable } from '@nestjs/common';
const csvWriter = require("csv-writer");
import path from "path";
import * as fs from 'fs';
import { MailinglistCountsService } from './mailinglist.counts.service';
import { MailinglistGenerateService } from './mailinglist.generate.service';

@Injectable()
export class MailinglistSaveCSVService {
    constructor (
        private readonly mailinglistCountService: MailinglistCountsService,
        private readonly mailinglistGenerateService: MailinglistGenerateService
    ) {}

    async mailinigCustomers(filePath: string, stPath: string, bdayPath: string, storePath: string) {
        const customers = await this.mailinglistCountService.dedupe(filePath, stPath, bdayPath, storePath);

        // customers.forEach(customer => {
        //     if (customer.wsId === '1060' || customer.wsId === '1061') {
        //         customer.wsId = '0';
        //     }
        // })


        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, "./mailinglist/mailingCustomers.csv"),
            header: [
                { id: "shopname", title: "Shop Name"},
                { id: "software", title: "Software" },
                { id: "shopId", title: "SID" },
                { id: "customerId", title: "CID" },
                { id: "wcId", title: "WCID"},
                { id: "wsId", title: "WSID" },
                { id: "wcaId", title: "WCAID" },
                { id: "authdate", title: "Last AuthDate"},
                { id: "latitude", title: "Latitude"},
                { id: "logitude", title: "Longitude"},
                { id: "distance", title: "Distance"},
                { id: "isMailable", title: "IsMailable"},
                { id: "mbdayyr", title: "MBdayYr"},
                { id: "mbdaymo", title: "MBdayMo" },
                { id: "tbdaymo", title: "TBdayMo"},
                { id: "firstName", title: "First" },
                { id: "lastName", title: "Last" },
                { id: "address", title: "Address" },
                { id: "address2", title: "Address2"},
                { id: "city", title: "City" },
                { id: "state", title: "St" },
                { id: "zip", title: "Zip" },
            ],
        });
      
        await writer.writeRecords(customers.filter(c => c.wsId === `1018`)).then(() => {
        console.log("Done!");
        });
    }

    async saveMailinglist(filePath: string, stPath: string, bdayPath: string, storePath: string) {
        const customers = await this.mailinglistCountService.assignTBday(filePath, stPath, bdayPath, storePath);

        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, "./mailinglist/mailing_list.csv"),
            header: [
                { id: "shopname", title: "Shop Name"},
                { id: "software", title: "Software" },
                { id: "shopId", title: "SID" },
                { id: "customerId", title: "CID" },
                { id: "wcId", title: "WCID"},
                { id: "wsId", title: "WSID" },
                { id: "wcaId", title: "WCAID" },
                { id: "authdate", title: "Last AuthDate"},
                { id: "mbdayyr", title: "MBdayYr"},
                { id: "mbdaymo", title: "MBdayMo" },
                { id: "tbdaymo", title: "TBdayMo"},
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

    async saveMailinglistForMon(filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string, mo: number) {
        const customers = await this.mailinglistGenerateService.generateMailingLists(filePath, stPath, bdayPath, storePath, limitPath, mo);

        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, "./mailinglist/mailing_list_thismon.csv"),
            header: [
                { id: "shopname", title: "Shop Name"},
                { id: "software", title: "Software" },
                { id: "shopId", title: "SID" },
                { id: "customerId", title: "CID" },
                { id: "wcId", title: "WCID"},
                { id: "wsId", title: "WSID" },
                { id: "wcaId", title: "WCAID" },
                { id: "authdate", title: "Last AuthDate"},
                { id: "mbdayyr", title: "MBdayYr"},
                { id: "mbdaymo", title: "MBdayMo" },
                { id: "tbdaymo", title: "TBdayMo"},
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

    async saveTBdaylist(filePath: string, stPath: string, bdayPath: string, storePath: string) {
        const customers = await this.mailinglistCountService.assignTBday(filePath, stPath, bdayPath, storePath);

        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, "./mailinglist/tbday_list.csv"),
            header: [
                { id: "id", title: "Shop Id"},
                { id: "mbdaymo", title: "BirthDay Month" },
                { id: "bdaymo", title: "BDay Counts" },
                { id: "tbdaymo", title: "TDay Counts" },
                { id: "all", title: "All Counts"},
            ],
        });
      
        await writer.writeRecords(customers).then(() => {
        console.log("Done!");
        });
    }

    async saveMailingListsPerShop(customers: any [],filename:string) {
        const writer = csvWriter.createObjectCsvWriter({
          path: path.resolve(__dirname, `./mailinglistpershop/${filename}.csv`),
          header: [
            { id: "shopname", title: "Shop Name"},
            { id: "software", title: "Software" },
            { id: "shopId", title: "SID" },
            { id: "customerId", title: "CID" },
            { id: "wcId", title: "WCID"},
            { id: "wsId", title: "WSID" },
            { id: "wcaId", title: "WCAID" },
            { id: "authdate", title: "Last AuthDate"},
            { id: "mbdayyr", title: "MBdayYr"},
            { id: "mbdaymo", title: "MBdayMo" },
            { id: "tbdaymo", title: "TBdayMo"},
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

    async createWholeShopsCSV(filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string, mo: number) {
        const customers = await this.mailinglistGenerateService.generateMailingListsPerShop(filePath, stPath, bdayPath, storePath, limitPath,mo);
        
        await Promise.all(
            customers.map(item => this.saveMailingListsPerShop(item,`${item[0].wsId}-${item[0].shopname}-${item[0].ListName}-${item.length}`))
        )
    }

}