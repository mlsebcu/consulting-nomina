import { Test, TestingModule } from '@nestjs/testing';
import { ConceptosController } from './conceptos.controller';
import { ConceptosService } from './conceptos.service';

describe('ConceptosController', () => {
  let controller: ConceptosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConceptosController],
      providers: [ConceptosService],
    }).compile();

    controller = module.get<ConceptosController>(ConceptosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
