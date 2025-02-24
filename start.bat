@echo off
title Sistema de Emprestimos

echo Iniciando o Sistema de Emprestimos...
echo.

:: Verificar se o MySQL está rodando
net start MySQL80 >nul 2>&1
if errorlevel 1 (
    echo Iniciando MySQL...
    net start MySQL80
)

:: Iniciar o servidor Node.js
echo Iniciando o servidor...
start /MIN cmd /c "cd %~dp0 && node backend/server.js"

:: Aguardar o servidor iniciar
timeout /t 5 /nobreak >nul

:: Abrir o navegador com o sistema
echo Abrindo o sistema...
start http://localhost:3000/login.html

echo.
echo Sistema iniciado com sucesso!
echo Não feche esta janela enquanto estiver usando o sistema.
echo. 