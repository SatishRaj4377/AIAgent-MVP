import { TestBed } from '@angular/core/testing';

import { ChatAgentService } from './chat-agent.service';

describe('ChatAgentService', () => {
  let service: ChatAgentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatAgentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
