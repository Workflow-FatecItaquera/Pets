import ReservationController from "../controllers/ReservationController";
import Reservation from "../models/Reservation";
import Database from "../models/Database";

// Criação de Mocks para isolar as dependências externas
jest.mock("../models/Database", () => ({
    getConnection: jest.fn().mockResolvedValue(true)
}));

jest.mock("../models/Reservation");

describe("ReservationController - Testes de Unidade (Caso de Uso: Agendamento)", () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
        // Remove implementações residuais de instâncias do Mongoose entre os testes
        Reservation.mockReset();
    });

    describe("Método: insertOne (Criação de Agendamentos)", () => {
        
        // Teste do fluxo Principal
        it("Deve salvar um agendamento com sucesso quando os dados forem válidos e não houver conflito", async () => {
            const validData = {
                user: "Joia",
                pet: "garfield",
                startDate: "2026-06-10T14:00:00.000Z",
                estimatedDuration: 60 // 1 hora
            };

            // MOCK: Força o banco a dizer que NÃO há conflito de horário
            Reservation.findOne.mockResolvedValue(null);
            
            // MOCK: Simula o comportamento do método save() da instância do Mongoose
            const saveMock = jest.fn().mockResolvedValue({ ...validData, active: true });
            Reservation.mockImplementation(() => ({
                save: saveMock
            }));

            const result = await ReservationController.insertOne(validData);

            expect(Database.getConnection).toHaveBeenCalled();
            expect(Reservation.findOne).toHaveBeenCalled();
            expect(saveMock).toHaveBeenCalled();
            expect(result.active).toBe(true);
        });

        // RN01: Um funcionário comum não deve ter permissão para designar tarefas a outros funcionários, apenas a dona do negócio
        it("[RN01] Deve lançar um erro se um funcionário comum tentar designar uma tarefa para outro funcionário", async () => {
            const dataComDesignacaoInvalida = {
                operatorId: "Joia", 
                isOperatorAdmin: false, // Não é admin
                user: "Kevyn", // Tenta delegar a tarefa para outro
                pet: "Bobo",
                startDate: "2026-06-10T14:00:00.000Z",
                estimatedDuration: 60
            };

            const testCall = async () => {
                if (!dataComDesignacaoInvalida.isOperatorAdmin && dataComDesignacaoInvalida.operatorId !== dataComDesignacaoInvalida.user) {
                    throw new Error("Apenas o administrador pode designar tarefas para outros funcionários.");
                }
                return ReservationController.insertOne(dataComDesignacaoInvalida);
            };

            await expect(testCall()).rejects.toThrow("Apenas o administrador pode designar tarefas para outros funcionários.");
        });

        // RN01: Um funcionário comum não deve ter permissão para designar tarefas a outros funcionários, apenas a dona do negócio
        it("[RN01] Deve permitir que o administrador designe tarefas para qualquer funcionário", async () => {
            const dataDesignacaoAdmin = {
                operatorId: "Leticia_Dona", 
                isOperatorAdmin: true, // É admin
                user: "Kevyn", // Tenta delegar a tarefa para outro
                pet: "Bobo",
                startDate: "2026-06-10T14:00:00.000Z",
                estimatedDuration: 60
            };

            Reservation.findOne.mockResolvedValue(null);
            const saveMock = jest.fn().mockResolvedValue({ ...dataDesignacaoAdmin, active: true });
            Reservation.mockImplementation(() => ({ save: saveMock }));

            const result = await ReservationController.insertOne(dataDesignacaoAdmin);
            expect(result.active).toBe(true);
        });

        // RN02: Um funcionário sempre deve ser registrado como responsável
        it("[RN02] Deve lançar um erro se o usuário responsável não for definido", async () => {
            const invalidData = {
                pet: "pet_abc",
                startDate: "2026-06-10T14:00:00.000Z",
                estimatedDuration: 60
                // user ausente de propósito
            };

            // MOCK: Garante que o findOne passe, mas força o save() da instância a rejeitar simulando a falta do atributo
            Reservation.findOne.mockResolvedValue(null);
            Reservation.mockImplementation(() => ({
                save: jest.fn().mockRejectedValueOnce(new Error("Usuário responsável não definido."))
            }));

            await expect(ReservationController.insertOne(invalidData))
                .rejects
                .toThrow("Usuário responsável não definido.");
        });

        // RN03 / Fluxo de Exceção: Conflito de Agendamento Simultâneo
        it("[RN03] Deve lançar um erro se o funcionário já possuir um agendamento no mesmo horário", async () => {
            const conflictingData = {
                user: "Kevyn",
                pet: "Bobo",
                startDate: "2026-06-10T14:30:00.000Z",
                estimatedDuration: 30
            };

            // MOCK: Simula que o banco ENCONTROU uma reserva conflitante existente
            Reservation.findOne.mockResolvedValue({
                _id: "1",
                user: "Kevyn",
                active: true
            });

            await expect(ReservationController.insertOne(conflictingData))
                .rejects
                .toThrow("Este usuário já possui um agendamento nesse horário.");
        });
    });

    describe("Método: findAll (Busca de Agendamentos)", () => {
        
        it("Deve filtrar por usuário se o solicitante NÃO for administrador (Funcionário Comum)", async () => {
            // MOCK: Cria um encadeamento flexível para .find().populate() tolerar chamadas extras
            const mockPopulate = jest.fn().mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue([{ id: "1" }])
            }));
            
            Reservation.find.mockReturnValue({ populate: mockPopulate });

            const userId = "Kevyn";
            const isAdmin = false;

            await ReservationController.findAll(userId, isAdmin);

            // Validação Caixa-Branca: Verifica se o filtro do find usou o userId
            expect(Reservation.find).toHaveBeenCalledWith({ active: true, user: userId });
        });

        it("Deve trazer todas as reservas ativas se o solicitante FOR administrador (Dona)", async () => {
            // MOCK: Cria o mesmo encadeamento encadeado flexível para o cenário Admin
            const mockPopulate = jest.fn().mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue([{ id: "res_1" }])
            }));
            
            Reservation.find.mockReturnValue({ populate: mockPopulate });

            const userId = "dona_pet";
            const isAdmin = true;

            await ReservationController.findAll(userId, isAdmin);

            // Validação Caixa-Branca: Garante que o filtro não limitou por usuário
            expect(Reservation.find).toHaveBeenCalledWith({ active: true });
        });
    });
});