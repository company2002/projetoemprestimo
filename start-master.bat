@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Iniciando Servidor Principal (Master)
echo ========================================

REM Obter IP da máquina
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r "IPv4.*[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*"') do (
    set "SERVER_IP=%%a"
    set "SERVER_IP=!SERVER_IP:~1!"
    goto :found_ip
)
:found_ip

echo.
echo IP do Servidor: %SERVER_IP%
echo.

REM Verificar se há processos usando as portas
echo Verificando portas em uso...
netstat -ano | findstr ":10000" > nul
if %errorlevel% equ 0 (
    echo Encerrando processos na porta 10000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":10000"') do (
        taskkill /F /PID %%a
    )
)

REM Iniciar servidor
echo.
echo Iniciando servidor principal...
echo.

cd "%~dp0"
start "Servidor Principal" cmd /c "npm run prod"

echo.
echo ========================================
echo Servidor iniciado com sucesso!
echo.
echo URLs de acesso:
echo - API: http://%SERVER_IP%:10000
echo - Painel Master: http://localhost:10000/master
echo - Status: http://%SERVER_IP%:10000/status
echo.
echo Para encerrar o servidor:
echo 1. Feche esta janela
echo 2. O servidor será encerrado automaticamente
echo ========================================
echo.

REM Aguardar comando para encerrar
echo Pressione CTRL+C para encerrar o servidor...
pause > nul

REM Encerrar processos ao fechar
taskkill /F /IM node.exe
echo Servidor encerrado.
pause 