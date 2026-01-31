import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { AuditLoggerService } from '../common/logger/audit-logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, AuditLoggerService],
})
export class TransactionsModule {}
