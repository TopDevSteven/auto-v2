import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { TekModule } from "../tek/tek.module";
import { SwModule } from "../sw/sw.module";
import { ProModule } from "../pro/pro.module";
import { NapModule } from "../nap/nap.module";
import { MitModule } from "../mit/mit.module";
import { ListcleanupModule } from "../listcleanup/listcleanup.module";
import { MailinglistModule } from "../mailinglist/mailinglist.module";
import { BdayappendModule } from "../bdayappend/bdayappend.module";
import { ReportModule } from "../report/report.module";

@Module({
  imports: [
    TekModule,
    SwModule,
    ProModule,
    NapModule,
    MitModule,
    ListcleanupModule,
    MailinglistModule,
    BdayappendModule,
    ReportModule
  ],
  providers: [JobsService],
})
export class JobsModule {}
