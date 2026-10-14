import { Module } from '@nestjs/common';
import { BatchModule } from './batch/batch.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, BatchModule],
})
export class AppModule {}
