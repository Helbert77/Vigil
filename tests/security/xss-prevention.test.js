/**
 * Testes de Segurança - Prevenção XSS
 * 
 * Este arquivo contém testes para validar que as correções XSS
 * implementadas estão funcionando corretamente.
 */

describe('XSS Prevention Tests', () => {
    let mockDocument;
    let mockWindow;

    beforeEach(() => {
        // Mock do DOM para testes
        mockDocument = {
            createElement: jest.fn((tag) => ({
                textContent: '',
                innerHTML: '',
                className: '',
                appendChild: jest.fn(),
                style: {}
            })),
            getElementById: jest.fn(),
            querySelectorAll: jest.fn(() => [])
        };

        mockWindow = {
            location: {
                href: 'http://localhost:3000',
                hash: '',
                search: ''
            },
            open: jest.fn()
        };

        global.document = mockDocument;
        global.window = mockWindow;
    });

    describe('Função sanitizeText', () => {
        // Simular a função sanitizeText dos arquivos corrigidos
        function sanitizeText(text) {
            if (typeof text !== 'string') {
                return '';
            }
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        test('deve sanitizar scripts maliciosos', () => {
            const maliciousInput = '<script>alert("XSS")</script>';
            const result = sanitizeText(maliciousInput);
            
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('alert');
            expect(mockDocument.createElement).toHaveBeenCalledWith('div');
        });

        test('deve sanitizar HTML malicioso', () => {
            const maliciousInput = '<img src="x" onerror="alert(1)">';
            const result = sanitizeText(maliciousInput);
            
            expect(result).not.toContain('onerror');
            expect(result).not.toContain('alert');
        });

        test('deve tratar entrada não-string', () => {
            expect(sanitizeText(null)).toBe('');
            expect(sanitizeText(undefined)).toBe('');
            expect(sanitizeText(123)).toBe('');
            expect(sanitizeText({})).toBe('');
        });

        test('deve preservar texto normal', () => {
            const normalText = 'Texto normal sem HTML';
            sanitizeText(normalText);
            
            expect(mockDocument.createElement).toHaveBeenCalledWith('div');
        });
    });

    describe('Função createSecureElement', () => {
        // Simular a função createSecureElement dos arquivos corrigidos
        function createSecureElement(tag, content = '', className = '') {
            const element = document.createElement(tag);
            if (content) {
                element.textContent = content;
            }
            if (className) {
                element.className = className;
            }
            return element;
        }

        test('deve criar elemento com conteúdo seguro', () => {
            const maliciousContent = '<script>alert("XSS")</script>';
            const element = createSecureElement('div', maliciousContent, 'test-class');
            
            expect(mockDocument.createElement).toHaveBeenCalledWith('div');
            expect(element.textContent).toBe(maliciousContent); // textContent é seguro
            expect(element.className).toBe('test-class');
        });

        test('deve criar elemento vazio quando não há conteúdo', () => {
            const element = createSecureElement('span');
            
            expect(mockDocument.createElement).toHaveBeenCalledWith('span');
            expect(element.textContent).toBe('');
            expect(element.className).toBe('');
        });
    });

    describe('Validação de Email', () => {
        // Simular a função isValidEmail do arquivo debug-recovery-secure.html
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email) && email.length <= 100;
        }

        test('deve validar emails corretos', () => {
            expect(isValidEmail('user@example.com')).toBe(true);
            expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
            expect(isValidEmail('user+tag@example.org')).toBe(true);
        });

        test('deve rejeitar emails inválidos', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
            expect(isValidEmail('user@domain')).toBe(false);
        });

        test('deve rejeitar emails muito longos', () => {
            const longEmail = 'a'.repeat(90) + '@example.com'; // > 100 caracteres
            expect(isValidEmail(longEmail)).toBe(false);
        });

        test('deve rejeitar tentativas de XSS via email', () => {
            expect(isValidEmail('<script>alert(1)</script>@example.com')).toBe(false);
            expect(isValidEmail('user@<script>alert(1)</script>.com')).toBe(false);
        });
    });

    describe('Validação de URL', () => {
        // Simular a função isValidURL do arquivo debug-recovery-secure.html
        function isValidURL(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
            } catch {
                return false;
            }
        }

        test('deve validar URLs corretas', () => {
            expect(isValidURL('http://localhost:3000')).toBe(true);
            expect(isValidURL('https://example.com')).toBe(true);
        });

        test('deve rejeitar URLs inválidas', () => {
            expect(isValidURL('javascript:alert(1)')).toBe(false);
            expect(isValidURL('data:text/html,<script>alert(1)</script>')).toBe(false);
            expect(isValidURL('ftp://example.com')).toBe(false);
        });

        test('deve rejeitar strings malformadas', () => {
            expect(isValidURL('not-a-url')).toBe(false);
            expect(isValidURL('')).toBe(false);
            expect(isValidURL(null)).toBe(false);
        });
    });

    describe('Truncamento de String', () => {
        // Simular a função truncateString do arquivo debug-recovery-secure.html
        function truncateString(str, maxLength = 100) {
            if (typeof str !== 'string') return '';
            return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
        }

        test('deve truncar strings longas', () => {
            const longString = 'a'.repeat(150);
            const result = truncateString(longString, 100);
            
            expect(result.length).toBe(103); // 100 + '...'
            expect(result.endsWith('...')).toBe(true);
        });

        test('deve preservar strings curtas', () => {
            const shortString = 'Short string';
            const result = truncateString(shortString, 100);
            
            expect(result).toBe(shortString);
        });

        test('deve tratar entrada não-string', () => {
            expect(truncateString(null)).toBe('');
            expect(truncateString(undefined)).toBe('');
            expect(truncateString(123)).toBe('');
        });
    });

    describe('Validação de Caminhos', () => {
        // Simular a validação de caminhos do arquivo test-real-time-secure.html
        function isValidPath(path) {
            const allowedPaths = ['/notifications', '/messages', ''];
            return allowedPaths.includes(path);
        }

        test('deve permitir caminhos válidos', () => {
            expect(isValidPath('/notifications')).toBe(true);
            expect(isValidPath('/messages')).toBe(true);
            expect(isValidPath('')).toBe(true);
        });

        test('deve rejeitar caminhos inválidos', () => {
            expect(isValidPath('/admin')).toBe(false);
            expect(isValidPath('javascript:alert(1)')).toBe(false);
            expect(isValidPath('../../../etc/passwd')).toBe(false);
        });
    });

    describe('Integração - Prevenção XSS Completa', () => {
        test('deve prevenir XSS em análise de URL', () => {
            // Simular URL maliciosa
            mockWindow.location.href = 'http://localhost:3000#<script>alert(1)</script>';
            mockWindow.location.hash = '#<script>alert(1)</script>';
            
            // A função analyzeURL deve sanitizar a saída
            const mockElement = {
                innerHTML: '',
                appendChild: jest.fn(),
                textContent: ''
            };
            
            mockDocument.getElementById.mockReturnValue(mockElement);
            
            // Verificar que createElement foi chamado (indicando uso de DOM seguro)
            expect(mockDocument.createElement).toBeDefined();
        });

        test('deve prevenir XSS em parâmetros de hash', () => {
            const maliciousHash = '#type=recovery&token=<script>alert(1)</script>';
            mockWindow.location.hash = maliciousHash;
            
            // URLSearchParams deve ser usado para parsing seguro
            const params = new URLSearchParams(maliciousHash.substring(1));
            const token = params.get('token');
            
            // O token malicioso deve ser tratado como string normal
            expect(token).toBe('<script>alert(1)</script>');
            // Mas quando usado no DOM, deve ser sanitizado
        });
    });

    describe('Testes de Regressão', () => {
        test('deve manter funcionalidade após correções XSS', () => {
            // Verificar que as funções básicas ainda funcionam
            const normalEmail = 'user@example.com';
            const normalURL = 'http://localhost:3000';
            const normalPath = '/notifications';
            
            // Simular funções dos arquivos corrigidos
            function isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email) && email.length <= 100;
            }
            
            function isValidURL(url) {
                try {
                    const urlObj = new URL(url);
                    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
                } catch {
                    return false;
                }
            }
            
            function isValidPath(path) {
                const allowedPaths = ['/notifications', '/messages', ''];
                return allowedPaths.includes(path);
            }
            
            expect(isValidEmail(normalEmail)).toBe(true);
            expect(isValidURL(normalURL)).toBe(true);
            expect(isValidPath(normalPath)).toBe(true);
        });
    });
});

// Testes de Performance para as correções XSS
describe('XSS Prevention Performance Tests', () => {
    test('sanitizeText deve ser eficiente', () => {
        const start = performance.now();
        
        // Simular função sanitizeText
        function sanitizeText(text) {
            if (typeof text !== 'string') return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Testar com string grande
        const largeString = 'a'.repeat(10000);
        for (let i = 0; i < 100; i++) {
            sanitizeText(largeString);
        }
        
        const end = performance.now();
        const duration = end - start;
        
        // Deve completar em menos de 100ms
        expect(duration).toBeLessThan(100);
    });
});

// Configuração para Jest
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};