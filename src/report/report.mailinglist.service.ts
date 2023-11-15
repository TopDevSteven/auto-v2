import { Injectable } from '@nestjs/common';
import { ReportService } from './report.service';
import { MailinglistCountsService } from '../mailinglist/mailinglist.counts.service';
import { MailinglistGenerateService } from '../mailinglist/mailinglist.generate.service';

interface CountDetails {
    wsId: string;
    software: string;
    shopname: string;
    totalCounts: number;
    totalBdaymo: number;
    bdaymo: number[];
    totalTdaymo: number;
    tdaymo: number[];
}

type CountMap = {
    [shopname: string]: CountDetails;
};

@Injectable()
export class ReportMailingListService {

    constructor (
        private readonly reportService: ReportService,
        private readonly mailingListCountsService: MailinglistCountsService,
        private readonly mailingListGenerateService: MailinglistGenerateService,
    ) {}

    async calculateCountsPerShop(filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string, isAllMos: boolean, mo: number): Promise<CountMap> {
        const customers = await this.mailingListGenerateService.limitBasedonAnnalCounts(filePath, stPath, bdayPath, storePath, limitPath);
        const counts: CountMap = {};

        for (const item of customers) {
            if (item.wsId === `1024`) {
                item.shopname = "Aero Auto Repair Vista";
            }

            if (!counts[item.shopname]) {

                counts[item.shopname] = {
                    wsId: item.wsId,
                    software: item.software,
                    shopname: item.shopname,
                    totalCounts: 0,
                    totalBdaymo: 0,
                    bdaymo: Array(12).fill(0),
                    totalTdaymo: 0,
                    tdaymo: Array(12).fill(0),
                }
            }

            if (Number(item.mbdaymo) !== 0) {
                counts[item.shopname].totalBdaymo ++;
                counts[item.shopname].bdaymo[parseInt(item.mbdaymo) - 1] ++;
            }

            if (Number(item.tbdaymo) !== 0) {
                counts[item.shopname].totalTdaymo ++;
                counts[item.shopname].tdaymo[parseInt(item.tbdaymo) - 1] ++;
            }
        }

        return counts;
    }


    async appendCountsPerShop(counts: CountMap): Promise<void> {
        const data = [];

        for (let shopname in counts) {
            const row = [];
            const shopData = counts[shopname];
            row.push(shopData.wsId, shopData.software, shopData.shopname, shopData.totalBdaymo + shopData.totalTdaymo, shopData.totalBdaymo, ...shopData.bdaymo, shopData.totalTdaymo, ...shopData.tdaymo);
            data.push(row)
        }

        const spreadSheetId = "1JOz-1KterCPSONW2JzFxyiGuacpNA6VlSxNa5VJLBl8";
        const range = this.reportService.getRangeForData(data);

        await this.reportService.updateSheet(spreadSheetId, range, data);
    };

    
}
