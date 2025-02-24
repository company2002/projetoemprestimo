@echo off
setlocal enabledelayedexpansion

echo Iniciando servidor local e Cloudflare Tunnel...

:: Iniciar servidor Node.js em uma nova janela
start "Sistema de Empréstimo - Servidor" cmd /c "npm run dev"

:: Aguardar alguns segundos para o servidor iniciar
timeout /t 5

:: Iniciar Cloudflare Tunnel em uma nova janela
start "Sistema de Empréstimo - Tunnel" cmd /c "cloudflared tunnel run sistema-emprestimo"

echo.
echo ==========================================
echo Servidor local iniciado em: http://localhost:10000
echo.
echo Painéis disponíveis:
echo - Cliente (Online): https://company2002.github.io
echo - Admin (Local): http://localhost:10000/admin
echo - Master (Local): http://localhost:10000/master
echo.
echo Tunnel Cloudflare ativo em: https://sistema-emprestimo.exemplo.com
echo ==========================================
echo.
echo Pressione qualquer tecla para encerrar todos os serviços...
pause >nul

:: Encerrar processos
taskkill /F /IM node.exe
taskkill /F /IM cloudflared.exe

echo Serviços encerrados com sucesso! 