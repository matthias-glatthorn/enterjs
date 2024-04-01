import { TestBed } from '@angular/core/testing';

import { EnterjsService } from './enterjs.service';

describe('EnterjsService', () => {
  let service: EnterjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnterjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
