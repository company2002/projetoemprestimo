@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Instalacao do Painel Admin
echo ========================================

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js nao encontrado. Instalando...
    powershell -Command "& {Invoke-WebRequest https://nodejs.org/dist/v18.18.0/node-v18.18.0-x64.msi -OutFile node.msi}"
    msiexec /i node.msi /qn
    del node.msi
)

REM Criar diretório do projeto
set "INSTALL_DIR=%USERPROFILE%\Desktop\sistema-emprestimo-admin"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
cd "%INSTALL_DIR%"

echo.
echo Criando diretorio do projeto em: %INSTALL_DIR%
echo.

REM Baixar arquivos necessários
echo Baixando arquivos do projeto...
git clone https://github.com/company2002/sistema-emprestimo.git .

REM Configurar conexão com servidor principal
echo.
echo Configurando conexao com servidor principal...
echo.

set /p SERVER_IP=Digite o IP do servidor principal: 

echo NODE_ENV=production> .env
echo PORT=3002>> .env
echo MAIN_SERVER=http://%SERVER_IP%:10000>> .env
echo ADMIN_MODE=true>> .env

REM Instalar dependências
echo.
echo Instalando dependencias...
call npm install

REM Criar script de inicialização
echo @echo off > start-admin.bat
echo echo Iniciando Painel Admin... >> start-admin.bat
echo cd "%INSTALL_DIR%" >> start-admin.bat
echo npm run admin >> start-admin.bat
echo pause >> start-admin.bat

echo.
echo ========================================
echo Instalacao concluida com sucesso!
echo.
echo Para iniciar o painel admin:
echo 1. Execute o arquivo start-admin.bat
echo 2. Acesse http://localhost:3002 no navegador
echo 3. Use suas credenciais para fazer login
echo ========================================
echo.

pause 