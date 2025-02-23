@echo off
title Instalador do Sistema de Emprestimos
setlocal enabledelayedexpansion

echo ===================================
echo Instalador do Sistema de Emprestimos
echo ===================================
echo.

:: Criar diretório temporário
set "TEMP_DIR=%TEMP%\sistema-emprestimo-setup"
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
cd "%TEMP_DIR%"

:: Baixar repositório do GitHub
echo Baixando arquivos do sistema...
powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/company2002/projetoemprestimo/archive/main.zip' -OutFile 'sistema.zip'}"
powershell -Command "& {Expand-Archive -Path 'sistema.zip' -DestinationPath '.'}"
cd projetoemprestimo-main

:: Criar diretório de downloads
if not exist "downloads" mkdir downloads
cd downloads

:: Baixar Node.js
echo Baixando Node.js...
powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi' -OutFile 'node.msi'}"

:: Baixar MySQL
echo Baixando MySQL...
powershell -Command "& {Invoke-WebRequest -Uri 'https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.36.0.msi' -OutFile 'mysql.msi'}"

:: Instalar Node.js silenciosamente
echo Instalando Node.js...
start /wait msiexec /i node.msi /quiet InstallAllUsers=1 AddToPath=1

:: Instalar MySQL silenciosamente
echo Instalando MySQL...
start /wait msiexec /i mysql.msi /quiet INSTALLDIR="%ProgramFiles%\MySQL" PASSWORD="415263"

:: Instalar dependências do projeto
echo Instalando dependências do projeto...
cd ..
call npm install

:: Configurar banco de dados
echo Configurando banco de dados...
mysql -u root -p415263 < backend\src\config\database.sql

:: Criar atalhos
echo Criando atalhos...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\Sistema de Empréstimos.lnk'); $Shortcut.TargetPath = '%~dp0start.bat'; $Shortcut.Save()"

:: Iniciar o sistema
echo Iniciando o sistema...
start start.bat

echo.
echo ===================================
echo Instalação concluída com sucesso!
echo O sistema foi instalado e configurado.
echo Um atalho foi criado na área de trabalho.
echo.
echo Pressione qualquer tecla para sair...
pause >nul 