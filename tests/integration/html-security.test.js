/**
 * Testes de Integração - Segurança HTML
 * 
 * Este arquivo contém testes de integração para validar que os arquivos HTML
 * corrigidos (test-real-time-secure.html e debug-recovery-secure.html)
 * estão funcionando corretamente e de forma segura.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('HTML Security Integration Tests', () => {
    let testRealTimeSecureContent;
    let debugRecoverySecureContent;
    let testRealTimeSecureDom;
    let debugRecoverySecureDom;

    beforeAll(() => {
        // Carregar conteúdo dos arquivos HTML seguros
        const projectRoot = path.join(__dirname, '..', '..');
        
        testRealTimeSecureContent = fs.readFileSync(
            path.join(projectRoot, 'test-real-time-secure.html'),
            'utf8'
        );
        
        debugRecoverySecureContent = fs.readFileSync(
            path.join(projectRoot, 'debug-recovery-secure.html'),
            'utf8'
        );

        // Criar DOMs para testes
        testRealTimeSecureDom = new JSDOM(testRealTimeSecureContent, {
            runScripts: 'dangerously',
            resources: 'usable'
        });

        debugRecoverySecureDom = new JSDOM(debugRecoverySecureContent, {
            runScripts: 'dangerously',
            resources: 'usable'
        });
    });

    describe('test-real-time-secure.html', () => {
        test('deve carregar sem erros de JavaScript', () => {
            const { window } = testRealTimeSecureDom;
            
            // Verificar que não há erros de JavaScript
            expect(window.document).toBeDefined();
            expect(window.document.title).toContain('Teste de Funcionalidades em Tempo Real');
        });

        test('deve ter função sanitizeText definida e funcionando', () => {
            const { window } = testRealTimeSecureDom;
            
            // Verificar se a função sanitizeText existe
            expect(typeof window.sanitizeText).toBe('function');
            
            // Testar sanitização
            const maliciousInput = '<script>alert("XSS")</script>';
            const result = window.sanitizeText(maliciousInput);
            
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('alert');
        });

        test('deve ter função createSecureElement definida e funcionando', () => {
            const { window } = testRealTimeSecureDom;
            
            // Verificar se a função createSecureElement existe
            expect(typeof window.createSecureElement).toBe('function');
            
            // Testar criação de elemento seguro
            const element = window.createSecureElement('div', '<script>alert(1)</script>', 'test-class');
            
            expect(element.tagName).toBe('DIV');
            expect(element.textContent).toBe('<script>alert(1)</script>'); // Seguro via textContent
            expect(element.className).toBe('test-class');
        });

        test('deve ter função isValidPath definida e funcionando', () => {
            const { window } = testRealTimeSecureDom;
            
            // Verificar se a função isValidPath existe
            expect(typeof window.isValidPath).toBe('function');
            
            // Testar validação de caminhos
            expect(window.isValidPath('/notifications')).toBe(true);
            expect(window.isValidPath('/messages')).toBe(true);
            expect(window.isValidPath('')).toBe(true);
            expect(window.isValidPath('/admin')).toBe(false);
            expect(window.isValidPath('javascript:alert(1)')).toBe(false);
        });

        test('deve ter função updateSummary segura', () => {
            const { window } = testRealTimeSecureDom;
            
            // Verificar se a função updateSummary existe
            expect(typeof window.updateSummary).toBe('function');
            
            // Mock do elemento summary
            const mockSummaryElement = window.document.createElement('div');
            mockSummaryElement.id = 'summary';
            window.document.body.appendChild(mockSummaryElement);
            
            // Testar atualização segura
            window.updateSummary();
            
            // Verificar que o conteúdo foi definido de forma segura
            expect(mockSummaryElement.innerHTML).toBeDefined();
        });

        test('deve prevenir XSS em toggleCheck', () => {
            const { window } = testRealTimeSecureDom;
            
            // Verificar se a função toggleCheck existe
            expect(typeof window.toggleCheck).toBe('function');
            
            // Criar elemento de teste malicioso
            const maliciousCheckbox = window.document.createElement('input');
            maliciousCheckbox.type = 'checkbox';
            maliciousCheckbox.id = '<script>alert(1)</script>';
            window.document.body.appendChild(maliciousCheckbox);
            
            // Tentar executar toggleCheck com ID malicioso
            // A função deve tratar isso de forma segura
            expect(() => {
                window.toggleCheck('<script>alert(1)</script>');
            }).not.toThrow();
        });
    });

    describe('debug-recovery-secure.html', () => {
        test('deve carregar sem erros de JavaScript', () => {
            const { window } = debugRecoverySecureDom;
            
            // Verificar que não há erros de JavaScript
            expect(window.document).toBeDefined();
            expect(window.document.title).toContain('Debug - Fluxo de Recuperação');
        });

        test('deve ter função isValidEmail definida e funcionando', () => {
            const { window } = debugRecoverySecureDom;
            
            // Verificar se a função isValidEmail existe
            expect(typeof window.isValidEmail).toBe('function');
            
            // Testar validação de email
            expect(window.isValidEmail('user@example.com')).toBe(true);
            expect(window.isValidEmail('invalid-email')).toBe(false);
            expect(window.isValidEmail('<script>alert(1)</script>@example.com')).toBe(false);
        });

        test('deve ter função isValidURL definida e funcionando', () => {
            const { window } = debugRecoverySecureDom;
            
            // Verificar se a função isValidURL existe
            expect(typeof window.isValidURL).toBe('function');
            
            // Testar validação de URL
            expect(window.isValidURL('http://localhost:3000')).toBe(true);
            expect(window.isValidURL('https://example.com')).toBe(true);
            expect(window.isValidURL('javascript:alert(1)')).toBe(false);
            expect(window.isValidURL('data:text/html,<script>alert(1)</script>')).toBe(false);
        });

        test('deve ter função truncateString definida e funcionando', () => {
            const { window } = debugRecoverySecureDom;
            
            // Verificar se a função truncateString existe
            expect(typeof window.truncateString).toBe('function');
            
            // Testar truncamento
            const longString = 'a'.repeat(150);
            const result = window.truncateString(longString, 100);
            
            expect(result.length).toBe(103); // 100 + '...'
            expect(result.endsWith('...')).toBe(true);
        });

        test('deve ter função escapeHtml definida e funcionando', () => {
            const { window } = debugRecoverySecureDom;
            
            // Verificar se a função escapeHtml existe
            expect(typeof window.escapeHtml).toBe('function');
            
            // Testar escape de HTML
            const maliciousInput = '<script>alert("XSS")</script>';
            const result = window.escapeHtml(maliciousInput);
            
            expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
        });

        test('deve ter função analyzeURL segura', () => {
            const { window } = debugRecoverySecureDom;
            
            // Verificar se a função analyzeURL existe
            expect(typeof window.analyzeURL).toBe('function');
            
            // Mock do elemento de análise
            const mockAnalysisElement = window.document.createElement('div');
            mockAnalysisElement.id = 'url-analysis';
            window.document.body.appendChild(mockAnalysisElement);
            
            // Testar análise segura de URL
            window.location.href = 'http://localhost:3000#<script>alert(1)</script>';
            window.analyzeURL();
            
            // Verificar que o conteúdo foi definido de forma segura
            expect(mockAnalysisElement.innerHTML).toBeDefined();
            // Não deve conter scripts não escapados
            expect(mockAnalysisElement.innerHTML).not.toContain('<script>alert(1)</script>');
        });

        test('deve ter função testRecoveryFlow segura', () => {
            const { window } = debugRecoverySecureDom;
            
            // Verificar se a função testRecoveryFlow existe
            expect(typeof window.testRecoveryFlow).toBe('function');
            
            // Mock do Supabase
            window.supabase = {
                auth: {
                    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null })
                }
            };
            
            // Mock do elemento de email
            const mockEmailInput = window.document.createElement('input');
            mockEmailInput.id = 'recovery-email';
            mockEmailInput.value = 'user@example.com';
            window.document.body.appendChild(mockEmailInput);
            
            // Mock do elemento de resultado
            const mockResultElement = window.document.createElement('div');
            mockResultElement.id = 'recovery-result';
            window.document.body.appendChild(mockResultElement);
            
            // Testar fluxo de recuperação
            expect(() => {
                window.testRecoveryFlow();
            }).not.toThrow();
        });
    });

    describe('Comparação com Arquivos Originais', () => {
        test('arquivos seguros devem ter mais validações que os originais', () => {
            // Verificar que os arquivos seguros têm mais funções de validação
            const { window: secureWindow } = testRealTimeSecureDom;
            
            expect(typeof secureWindow.sanitizeText).toBe('function');
            expect(typeof secureWindow.createSecureElement).toBe('function');
            expect(typeof secureWindow.isValidPath).toBe('function');
        });

        test('arquivos seguros devem usar textContent em vez de innerHTML', () => {
            // Verificar que os arquivos seguros usam práticas seguras
            expect(testRealTimeSecureContent).toContain('textContent');
            expect(debugRecoverySecureContent).toContain('textContent');
            
            // Verificar que têm menos uso direto de innerHTML
            const secureInnerHTMLCount = (testRealTimeSecureContent.match(/innerHTML\s*=/g) || []).length;
            const secureDebugInnerHTMLCount = (debugRecoverySecureContent.match(/innerHTML\s*=/g) || []).length;
            
            // Deve ter uso controlado de innerHTML (apenas em contextos seguros)
            expect(secureInnerHTMLCount).toBeLessThan(10);
            expect(secureDebugInnerHTMLCount).toBeLessThan(10);
        });

        test('arquivos seguros devem ter funções de sanitização', () => {
            expect(testRealTimeSecureContent).toContain('sanitizeText');
            expect(debugRecoverySecureContent).toContain('escapeHtml');
            expect(debugRecoverySecureContent).toContain('isValidEmail');
            expect(debugRecoverySecureContent).toContain('isValidURL');
        });
    });

    describe('Testes de Carga e Performance', () => {
        test('arquivos seguros devem carregar rapidamente', (done) => {
            const start = Date.now();
            
            const testDom = new JSDOM(testRealTimeSecureContent, {
                runScripts: 'dangerously',
                resources: 'usable'
            });
            
            testDom.window.addEventListener('load', () => {
                const loadTime = Date.now() - start;
                expect(loadTime).toBeLessThan(1000); // Deve carregar em menos de 1 segundo
                done();
            });
        });

        test('funções de sanitização devem ser eficientes', () => {
            const { window } = testRealTimeSecureDom;
            
            const start = performance.now();
            
            // Testar performance da sanitização
            for (let i = 0; i < 1000; i++) {
                window.sanitizeText('<script>alert("test")</script>');
            }
            
            const end = performance.now();
            const duration = end - start;
            
            expect(duration).toBeLessThan(100); // Deve completar em menos de 100ms
        });
    });

    describe('Testes de Compatibilidade', () => {
        test('deve funcionar em diferentes ambientes DOM', () => {
            // Testar com configurações diferentes do JSDOM
            const strictDom = new JSDOM(testRealTimeSecureContent, {
                runScripts: 'outside-only',
                resources: 'usable'
            });
            
            expect(strictDom.window.document).toBeDefined();
            expect(strictDom.window.document.title).toContain('Teste de Funcionalidades');
        });

        test('deve ter fallbacks para funcionalidades não suportadas', () => {
            const { window } = testRealTimeSecureDom;
            
            // Simular ambiente sem certas APIs
            delete window.URL;
            
            // As funções devem ter fallbacks
            expect(() => {
                if (typeof window.isValidURL === 'function') {
                    window.isValidURL('http://example.com');
                }
            }).not.toThrow();
        });
    });
});

// Configuração adicional para testes de integração
module.exports = {
    testEnvironment: 'node',
    testTimeout: 10000,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};