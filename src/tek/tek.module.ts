import { Module } from '@nestjs/common';
import { TekService } from './tek.service';
import { TekmetricApiService } from './api.service';
import { BottleneckProvider } from './tekbottleneck.provider';
import { TekmetricCustomerService } from './tek.api.getcustomers.service';
import { TekmetricJobsService } from './tek.api.getjobs.service';
import { TekShopService } from './tek.api.getshops.service';

@Module({
  providers: [
    BottleneckProvider,
    TekService,
    TekmetricApiService,
    TekmetricJobsService,
    TekmetricCustomerService,
    TekShopService
  ],
  exports: [
    BottleneckProvider,
    TekService,
    TekmetricApiService,
    TekmetricJobsService,
    TekmetricCustomerService,
    TekShopService
  ]
})
export class TekModule {}
