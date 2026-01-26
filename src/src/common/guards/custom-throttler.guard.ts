/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerRequest } from '@nestjs/throttler/dist/throttler.guard.interface';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.headers && req.headers['x-api-key']) {
      return req.headers['x-api-key'];
    }
    
    return req.ips.length ? req.ips[0] : req.ip; 
  }

  protected async throwThrottlingException(context: ExecutionContext, throttlerLimitDetail: ThrottlerRequest): Promise<void> {
    const tracker = await this.getTracker(context.switchToHttp().getRequest());
    
    throw new Error(
      `Rate limit exceeded for ${tracker}. Limit: ${throttlerLimitDetail.limit}, TTL: ${throttlerLimitDetail.ttl}`
    );
  }
}