// Event Storage Service Interface

import { EmergencyTransferEvent, EventFilters } from '@/types/emergency-transfer';

export interface IEventStorageService {
  /**
   * Stores emergency transfer event
   */
  storeEmergencyEvent(event: EmergencyTransferEvent): Promise<void>;
  
  /**
   * Retrieves emergency events for analytics
   */
  getEmergencyEvents(filters: EventFilters): Promise<EmergencyTransferEvent[]>;
}
