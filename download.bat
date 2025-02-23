@echo off
chcp 65001 > nul
title Sistema de Empréstimos - Download
color 0A

echo ===================================
echo Sistema de Empréstimos - Download
echo ===================================
echo.

:: Verificar privilégios de administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este instalador precisa ser executado como Administrador!
    echo Por favor, clique com o botão direito e selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)

:: Verificar conexão com a internet
echo Verificando conexão com a internet...
ping 8.8.8.8 -n 1 -w 1000 >nul
if %errorlevel% neq 0 (
    echo [ERRO] Sem conexão com a internet!
    echo Por favor, verifique sua conexão e tente novamente.
    echo.
    pause
    exit /b 1
)

:: Verificar espaço em disco (mínimo 5GB = 5368709120 bytes)
echo Verificando espaço em disco...
for /f "tokens=2" %%a in ('wmic LogicalDisk where "DeviceID='%~d0'" get FreeSpace /value') do set "free=%%a"
if %free% lss 5368709120 (
    echo [ERRO] Espaço insuficiente em disco!
    echo É necessário pelo menos 5GB de espaço livre.
    echo.
    pause
    exit /b 1
)

:: Criar diretório de instalação
set "INSTALL_DIR=%USERPROFILE%\Desktop\Sistema-Emprestimo"
echo.
echo O sistema será instalado em: %INSTALL_DIR%
choice /C SN /M "Deseja continuar com a instalação"
if %errorlevel% neq 1 (
    echo.
    echo Instalação cancelada pelo usuário.
    pause
    exit /b 0
)

:: Criar e limpar diretório
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%"
mkdir "%INSTALL_DIR%"
cd "%INSTALL_DIR%"

echo.
echo Baixando arquivos necessários...
echo [Etapa 1/1] Baixando instalador...

:: Baixar setup.bat
powershell -Command "& {$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/company2002/projetoemprestimo/main/setup.bat' -OutFile 'setup.bat'}"

if not exist "setup.bat" (
    echo.
    echo [ERRO] Falha ao baixar os arquivos!
    echo Por favor, verifique sua conexão e tente novamente.
    pause
    exit /b 1
)

echo.
echo ===================================
echo Download concluído com sucesso!
echo.
echo Os arquivos foram baixados para:
echo %INSTALL_DIR%
echo.
echo PRÓXIMOS PASSOS:
echo 1. Execute o arquivo 'setup.bat' como administrador
echo 2. Aguarde a instalação automática
echo 3. O sistema iniciará automaticamente após a instalação
echo.
echo IMPORTANTE: O processo de instalação pode levar alguns minutos.
echo            Não feche nenhuma janela durante a instalação.
echo ===================================
echo.
choice /C SN /M "Deseja executar o instalador agora"
if %errorlevel% equ 1 (
    start /wait cmd /c "runas /user:administrator "%INSTALL_DIR%\setup.bat""
)

echo.
echo Pressione qualquer tecla para sair...
pause >nul 