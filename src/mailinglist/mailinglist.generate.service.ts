import { Injectable } from '@nestjs/common';
import { MailinglistCountsService } from './mailinglist.counts.service';
import { MailinglistMaxListService } from './mailinglist.maxlists.service';
import { customerObject } from '../bdayappend/bdayappend.service';

interface CountDetails {
    wsId: string;
    software: string;
    shopname: string;
    totalBdaymo: number;
    bdaymo: number[];
    totalTdaymo: number;
    tdaymo: number[];
}

type CountMap = {
    [shopname: string]: CountDetails;
};


@Injectable()
export class MailinglistGenerateService {
    constructor (
        private readonly mailinglistCountsService: MailinglistCountsService,
        private readonly mailinglistMaxListService: MailinglistMaxListService
    ) {}

    async limitBasedonAnnalCounts (filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string) {
        const customers = await this.mailinglistCountsService.assignTBday(filePath, stPath, bdayPath, storePath);
        const annualCounts = (await this.mailinglistMaxListService.getDeltaLists(limitPath)).slice(2);

        const newCustomer = customers
            .sort((a, b) => {
                const wsIDDiff = Number(a.wsId) - Number(b.wsId);

                if (wsIDDiff !== 0) {
                return wsIDDiff;
                } else {
                const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

                if (mbdaymoDiff !== 0) {
                    return mbdaymoDiff;
                } else {
                    const dateDiff = new Date(a.authdate).getTime() - new Date(b.authdate).getTime();
                    return dateDiff;
                }
                }
            });
        
        const counts: CountMap = {};

        for (const item of newCustomer) {

            if (item.wsId === `1024`) {
                item.shopname = "Aero Auto Repair Vista";
            }

            if (item.shopId === "2734") {
                item.wsId = '1060';
              }

            if (!counts[item.wsId]) {

                counts[item.wsId] = {
                    wsId: item.wsId,
                    software: item.software,
                    shopname: item.shopname,
                    totalBdaymo: 0,
                    bdaymo: Array(12).fill(0),
                    totalTdaymo: 0,
                    tdaymo: Array(12).fill(0),
                }
            }

            if (Number(item.mbdaymo) !== 0) {
                counts[item.wsId].totalBdaymo ++;
                counts[item.wsId].bdaymo[parseInt(item.mbdaymo) - 1] ++;
            }

            if (Number(item.tbdaymo) !== 0) {
                counts[item.wsId].totalTdaymo ++;
                counts[item.wsId].tdaymo[parseInt(item.tbdaymo) - 1] ++;
            }
        }

        let limitedCustomers: any[] = [];

        for (const wsId in counts) {
            let shopData = counts[wsId];
            const contractCounts = annualCounts.filter((item) => item.shopId === wsId );
            const bdayCustomersForShop = newCustomer.filter((customer) => customer.wsId === wsId && Number(customer.mbdaymo)  !== 0);
            const tdayCustomersForShop = newCustomer.filter((customer) => customer.wsId === wsId && Number (customer.tbdaymo) !== 0);

            if (contractCounts[0].contract === 0 ) {
                contractCounts[0].deltaValue = 0;
            } else {

                contractCounts[0].deltaValue = shopData.totalBdaymo + shopData.totalTdaymo - contractCounts[0].contract;
            }

            if (contractCounts[0].deltaValue <= 0) {

                limitedCustomers.push(bdayCustomersForShop);
                limitedCustomers.push(tdayCustomersForShop);

                continue;
            } 

            if (contractCounts[0].deltaValue > shopData.totalTdaymo) {

                let deductedCount = contractCounts[0].deltaValue - shopData.totalTdaymo;

                while (1) {
                    let deductedForMonth = deductedCount >= 12 ? Math.floor(deductedCount / 12) : Math.floor(deductedCount / 12) + 1;
                    shopData.tdaymo.fill(0);

                    for (let i = 0 ; i< 12; i ++) {

                        if (deductedCount <= 0) {
                            break;
                        }

                        if (shopData.bdaymo[i] > deductedForMonth) {
                            shopData.bdaymo[i] = shopData.bdaymo[i] - deductedForMonth;
                            deductedCount = deductedCount - deductedForMonth;
                        } else {
                            deductedCount = deductedCount - shopData.bdaymo[i]
                            shopData.bdaymo[i] = 0;
                        }
                    }

                    if (deductedCount <= 0) {
                        break;
                    }
                }


            } else {

                let deductedCount = contractCounts[0].deltaValue;

                while (1) {
                    let deductedForMonth = deductedCount >= 12 || deductedCount === 0 ? Math.floor(deductedCount / 12) : Math.floor(deductedCount / 12) + 1;

                    for (let i = 0 ; i< 12; i ++) {

                        if (deductedCount <= 0) {
                            break;
                        }

                        if (shopData.tdaymo[i] > deductedForMonth) {
                            shopData.tdaymo[i] = shopData.tdaymo[i] - deductedForMonth;
                            deductedCount = deductedCount - deductedForMonth;
                        } else {
                            deductedCount = deductedCount - shopData.tdaymo[i]
                            shopData.tdaymo[i] = 0;
                        }
                    }

                    if (deductedCount <= 0) {
                        break;
                    }

                }
            }

            for (let month = 1; month <= 12; month++) {
                const bdayCustomerForMonth = bdayCustomersForShop.filter((customer) => Number(customer.mbdaymo) === month);
                const tdayCustomerForMonth = tdayCustomersForShop.filter((customer) => Number(customer.tbdaymo) === month);
                limitedCustomers.push(bdayCustomerForMonth.slice(bdayCustomerForMonth.length - shopData.bdaymo[month - 1]));
                limitedCustomers.push(tdayCustomerForMonth.slice(tdayCustomerForMonth.length - shopData.tdaymo[month - 1]));
            }
        }
        
        return limitedCustomers.flat()
    }

    async limitBasedMaxCount(filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string){ 
        const customers = await this.mailinglistCountsService.assignTBday(filePath, stPath, bdayPath, storePath);
        const maxLists = (await this.mailinglistMaxListService.getMaxLists(limitPath)).slice(1);

        const newCustomers = customers
            .filter(customer => 
                Number(customer.mbdaymo) === 11 ||
                Number(customer.mbdaymo) === 5 ||
                Number(customer.tbdaymo) === 5 || 
                Number(customer.tbdaymo) === 11
            )
            .sort((a, b) => {
                const wsIDDiff = Number(a.wsId) - Number(b.wsId);

                if (wsIDDiff !== 0) {
                return wsIDDiff;
                } else {
                const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

                if (mbdaymoDiff !== 0) {
                    return mbdaymoDiff;
                } else {
                    const dateDiff = new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
                    return dateDiff;
                }
                }
            });

        const newResult = newCustomers.reduce((result, customer) => {
            if (!result[customer.wsId]) {
                result = {
                    ...result,
                    [customer.wsId]: []
                }
            }
            const limit = Number( maxLists.find((shop) => {
                return shop.shopid === customer.wsId
            })?.values ?? 999999)
            
            if (limit > result[customer.wsId].length) {
                result = {
                    ...result,
                    [customer.wsId]: [...result[customer.wsId], customer] 
                }
            }
            return result
        }, {} as Record<string, any>)
        
        return newResult;
    };

    async limitBasedDeltaCount(filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string, isAllMos: boolean, mo: number) {
        const customers = await this.mailinglistCountsService.assignTBday(filePath, stPath, bdayPath, storePath);
        const deltaValuses = await this.mailinglistMaxListService.getDeltaLists(limitPath);

        let newCustomers = []

        if (isAllMos) {
            newCustomers = customers.sort((a, b) => {
                const wsIDDiff = Number(a.wsId) - Number(b.wsId);

                if (wsIDDiff !== 0) {
                return wsIDDiff;
                } else {
                const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

                if (mbdaymoDiff !== 0) {
                    return mbdaymoDiff;
                } else {
                    const dateDiff = new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
                    return dateDiff;
                }
                }
            });
        } else {
            newCustomers = customers
                .filter(customer => 
                    Number(customer.mbdaymo) === mo ||
                    Number(customer.mbdaymo) === mo - 6 ||
                    Number(customer.tbdaymo) === mo - 6 || 
                    Number(customer.tbdaymo) === mo
                )
                .sort((a, b) => {
                    const wsIDDiff = Number(a.wsId) - Number(b.wsId);
    
                    if (wsIDDiff !== 0) {
                    return wsIDDiff;
                    } else {
                    const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);
    
                    if (mbdaymoDiff !== 0) {
                        return mbdaymoDiff;
                    } else {
                        const dateDiff = new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
                        return dateDiff;
                    }
                    }
                });
        }


        let limitedCustomers = [];

        for (const delta of deltaValuses) {
            const filteredCustomers = newCustomers.filter(c => c.shopname === delta.shopName);
            if (delta.deltaValue >= 0) {
                limitedCustomers.push(...filteredCustomers.slice(delta.deltaValue))
            } else {
                limitedCustomers.push(...filteredCustomers);
            }
        }

        return limitedCustomers;
        
    }

    async generateMailingLists(filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string, mo: number) {
        const customers = await this.limitBasedonAnnalCounts(filePath, stPath, bdayPath, storePath, limitPath);

        const newCustomers = customers
        .filter(customer => 
            Number(customer.mbdaymo) === mo ||
            Number(customer.mbdaymo) === mo - 6 ||
            Number(customer.tbdaymo) === mo - 6 || 
            Number(customer.tbdaymo) === mo
        )
        .sort((a, b) => {
            const wsIDDiff = Number(a.wsId) - Number(b.wsId);

            if (wsIDDiff !== 0) {
            return wsIDDiff;
            } else {
            const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

            if (mbdaymoDiff !== 0) {
                return mbdaymoDiff;
            } else {
                const dateDiff = new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
                return dateDiff;
            }
            }
        });

        const combinedArray = ([] as any[]).concat(...Object.values(newCustomers));

        const updatedCustomers = combinedArray.map(customer => {
                if (Number(customer.mbdaymo) === mo - 6) {
                    return {
                        ...customer,
                        ListName: `HDayList ${mo}`
                    };
                } else if ( Number(customer.mbdaymo) === mo) {
                    return {
                        ...customer,
                        ListName: `BDayList ${mo}`
                    }
                } else if (Number(customer.tbdaymo) === mo || Number(customer.tbdaymo) === mo - 6){
                    return {
                        ...customer,
                        ListName: `THDayList ${mo}`
                    }
                } else {
                    return {
                        ...customer,
                        ListName: "",
                    }
                }
        })

        return updatedCustomers;
    }

    async generateMailingListsPerShop(filePath: string, stPath: string, bdayPath: string, storePath: string, limitPath: string, mo: number) {
        const customers = await this.generateMailingLists(filePath, stPath, bdayPath, storePath, limitPath, mo);

        const wsidListname = new Map<string, any []>();
        const keys = new Map<string, number>()
        customers.forEach((customer) => {
            const {wsId, ListName, shopname} = customer;

            if (ListName != "") {
                const key  = `${wsId}-${ListName}-${shopname}`
                keys.set(key, (keys.get(key) || 0) + 1);
                if(!wsidListname.has(key)) {
                    wsidListname.set(key, []);
                }
                wsidListname.get(key)?.push(customer)
            }
            
        })
        
        return Array.from(wsidListname.values());
    }
}
