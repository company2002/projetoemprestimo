#define MyAppName "Sistema de Empréstimos"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Sua Empresa"
#define MyAppURL "https://github.com/company2002/projetoemprestimo"
#define MyAppExeName "sistema-emprestimo.exe"

[Setup]
AppId={{B8F62C70-8F36-4F25-8AE1-F8C4E3C3D2B9}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=installer
OutputBaseFilename=sistema-emprestimo-setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; Node.js
Source: "downloads\node.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall
; MySQL
Source: "downloads\mysql.msi"; DestDir: "{tmp}"; Flags: deleteafterinstall
; Arquivos do projeto
Source: "backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "frontend\*"; DestDir: "{app}\frontend"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "package.json"; DestDir: "{app}"
Source: ".env"; DestDir: "{app}"
Source: "start.bat"; DestDir: "{app}"

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\start.bat"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\start.bat"; Tasks: desktopicon

[Run]
; Instalar Node.js
Filename: "msiexec.exe"; Parameters: "/i ""{tmp}\node.msi"" /qn ADDLOCAL=ALL"; StatusMsg: "Instalando Node.js..."
; Instalar MySQL
Filename: "msiexec.exe"; Parameters: "/i ""{tmp}\mysql.msi"" /qn ADDLOCAL=ALL"; StatusMsg: "Instalando MySQL..."
; Instalar dependências
Filename: "{sys}\cmd.exe"; Parameters: "/c cd ""{app}"" && npm install"; StatusMsg: "Instalando dependências..."
; Configurar banco de dados
Filename: "{sys}\cmd.exe"; Parameters: "/c cd ""{app}"" && mysql -u root -p415263 < backend\src\config\database.sql"; StatusMsg: "Configurando banco de dados..."
; Iniciar aplicação
Filename: "{app}\start.bat"; Description: "Iniciar o Sistema de Empréstimos"; Flags: postinstall nowait

[Code]
// Verificar portas em uso
function CheckPorts: Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  if not Exec('netstat', '-an | findstr ":3000"', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
  begin
    if ResultCode = 0 then
    begin
      MsgBox('A porta 3000 está em uso. Por favor, feche outros aplicativos que possam estar usando esta porta.', mbError, MB_OK);
      Result := False;
    end;
  end;
end;

// Verificar requisitos antes da instalação
function InitializeSetup(): Boolean;
begin
  Result := CheckPorts;
end;

// Verificar se Node.js está instalado
function IsNodeJSInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('node', '--version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

// Verificar se MySQL está instalado
function IsMySQLInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('mysql', '--version', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end; 