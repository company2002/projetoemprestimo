@echo off
setlocal enabledelayedexpansion

echo Instalando Cloudflared...
powershell -Command "& {Invoke-WebRequest -Uri https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe -OutFile cloudflared.exe}"

echo Criando diretório para Cloudflared...
mkdir "%USERPROFILE%\.cloudflared" 2>nul

echo Configurando serviço Cloudflared...
cloudflared.exe service install

echo Gerando configuração do tunnel...
(
echo tunnel: sistema-emprestimo
echo credentials-file: %USERPROFILE%\.cloudflared\credentials.json
echo.
echo ingress:
echo   - hostname: sistema-emprestimo.exemplo.com
echo     service: http://localhost:10000
echo   - service: http_status:404
) > config.yml

move config.yml "%USERPROFILE%\.cloudflared\"

echo.
echo ======================================
echo Instalação concluída! Para iniciar:
echo 1. Execute: cloudflared tunnel login
echo 2. Execute: cloudflared tunnel create sistema-emprestimo
echo 3. Execute: cloudflared tunnel route dns sistema-emprestimo sistema-emprestimo.exemplo.com
echo 4. Execute: cloudflared tunnel run sistema-emprestimo
echo ======================================

pause 