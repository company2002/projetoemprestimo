@echo off
title Verificação de Pré-requisitos
setlocal enabledelayedexpansion

echo ===================================
echo Verificando Pré-requisitos
echo ===================================
echo.

set /a REQUIREMENTS_MET=1

:: Verificar espaço em disco (mínimo 5GB)
echo Verificando espaço em disco...
for /f "tokens=3" %%a in ('dir /-c 2^>nul') do set SPACE=%%a
if %SPACE% LSS 5368709120 (
    echo [X] ERRO: É necessário pelo menos 5GB de espaço livre
    set /a REQUIREMENTS_MET=0
) else (
    echo [✓] Espaço em disco OK
)

:: Verificar se a porta 3000 está livre
echo Verificando porta 3000...
netstat -an | find "3000" > nul
if %ERRORLEVEL% EQU 0 (
    echo [X] ERRO: A porta 3000 está em uso
    set /a REQUIREMENTS_MET=0
) else (
    echo [✓] Porta 3000 OK
)

:: Verificar se tem acesso à internet
echo Verificando conexão com a internet...
ping 8.8.8.8 -n 1 > nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] ERRO: Sem conexão com a internet
    set /a REQUIREMENTS_MET=0
) else (
    echo [✓] Conexão com a internet OK
)

:: Verificar privilégios de administrador
echo Verificando privilégios de administrador...
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] ERRO: É necessário executar como administrador
    set /a REQUIREMENTS_MET=0
) else (
    echo [✓] Privilégios de administrador OK
)

echo.
if %REQUIREMENTS_MET% EQU 0 (
    echo ===================================
    echo ATENÇÃO: Alguns requisitos não foram atendidos.
    echo Por favor, corrija os problemas acima antes de continuar.
    echo ===================================
    pause
    exit /b 1
) else (
    echo ===================================
    echo Todos os requisitos foram atendidos!
    echo Você pode prosseguir com a instalação.
    echo ===================================
    
    choice /C SN /M "Deseja iniciar a instalação agora"
    if !ERRORLEVEL! EQU 1 (
        call setup.bat
    ) else (
        echo.
        echo Instalação cancelada pelo usuário.
        pause
    )
) 