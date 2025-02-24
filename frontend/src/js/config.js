// Configurações globais do sistema
export const API_URL = 'https://sistema-emprestimo.onrender.com';

// Configurações de tema
export const THEME = {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    successColor: '#28a745',
    dangerColor: '#dc3545',
    warningColor: '#ffc107',
    infoColor: '#17a2b8',
    lightColor: '#f8f9fa',
    darkColor: '#343a40'
};

// Configurações de autenticação
export const AUTH_CONFIG = {
    tokenExpirationTime: '24h',
    refreshTokenTime: '7d',
    tokenKey: 'authToken',
    userDataKey: 'userData'
};

// Configurações de paginação
export const PAGINATION = {
    itemsPerPage: 10,
    maxPagesShown: 5
};

// Configurações de formatação
export const FORMAT = {
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm:ss',
    currencyLocale: 'pt-BR',
    currencyCode: 'BRL'
};

// Configurações de validação
export const VALIDATION = {
    minPasswordLength: 8,
    maxPasswordLength: 20,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phonePattern: /^\(\d{2}\) \d{5}-\d{4}$/,
    cpfPattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
};

// Configurações de upload
export const UPLOAD = {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFiles: 5
};

// Configurações de notificação
export const NOTIFICATION = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
};

// Configurações de cache
export const CACHE = {
    enabled: true,
    duration: 60 * 60 * 1000, // 1 hora
    prefix: 'app_cache_'
};

// Configurações de logs
export const LOGS = {
    enabled: true,
    level: 'info',
    maxSize: 10 * 1024 * 1024 // 10MB
};

// Configurações de backup
export const BACKUP = {
    autoBackup: true,
    interval: 24 * 60 * 60 * 1000, // 24 horas
    maxBackups: 7,
    compressionEnabled: true
};

// Configurações de segurança
export const SECURITY = {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    requireCaptcha: true,
    sessionTimeout: 30 * 60 * 1000 // 30 minutos
};

// Configurações de performance
export const PERFORMANCE = {
    enableCache: true,
    minifyAssets: true,
    compressionEnabled: true,
    lazyLoading: true
};

// Configurações de relatórios
export const REPORTS = {
    defaultFormat: 'pdf',
    availableFormats: ['pdf', 'xlsx', 'csv'],
    maxRows: 1000,
    enableExport: true
};

// Configurações de gamificação
export const GAMIFICATION = {
    enabled: true,
    levels: [
        { name: 'Bronze', minScore: 0, maxScore: 299 },
        { name: 'Prata', minScore: 300, maxScore: 599 },
        { name: 'Ouro', minScore: 600, maxScore: 899 },
        { name: 'Platina', minScore: 900, maxScore: 1000 }
    ],
    rewards: {
        loginStreak: 10,
        profileComplete: 50,
        firstLoan: 100,
        paymentOnTime: 20
    }
};

// Configurações de empréstimo
export const LOAN = {
    minValue: 500,
    maxValue: 50000,
    minTerm: 6,
    maxTerm: 48,
    interestRates: {
        bronze: 2.99,
        silver: 2.49,
        gold: 1.99,
        platinum: 1.49
    },
    scoreLimits: {
        minimum: 300,
        good: 600,
        excellent: 900
    }
}; 