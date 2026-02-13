@echo off
REM ============================================
REM NAPANGA Backup Script for Windows
REM ============================================
REM Usage: backup.bat [options]
REM Options:
REM   --full     Create full backup (includes all assets)
REM   --quick    Create quick backup (code only)
REM   --compress Compress backup into ZIP file
REM ============================================

SETLOCAL EnableDelayedExpansion

REM Configuration
SET PROJECT_NAME=NAPANGA
SET BACKUP_ROOT=backups
SET TIMESTAMP=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
SET TIMESTAMP=%TIMESTAMP: =0%
SET BACKUP_DIR=%BACKUP_ROOT%\%TIMESTAMP%
SET COMPRESS=false
SET BACKUP_TYPE=full

REM Parse arguments
:parse_args
IF "%~1"=="" goto :end_parse
IF /I "%~1"=="--compress" SET COMPRESS=true
IF /I "%~1"=="--quick" SET BACKUP_TYPE=quick
IF /I "%~1"=="--full" SET BACKUP_TYPE=full
SHIFT
goto :parse_args
:end_parse

echo.
echo ========================================
echo   %PROJECT_NAME% Backup Utility
echo ========================================
echo.
echo Timestamp: %TIMESTAMP%
echo Backup Type: %BACKUP_TYPE%
echo Compress: %COMPRESS%
echo.

REM Create backup directory
echo [1/5] Creating backup directory...
if not exist "%BACKUP_ROOT%" mkdir "%BACKUP_ROOT%"
mkdir "%BACKUP_DIR%"
if errorlevel 1 (
    echo ERROR: Failed to create backup directory
    exit /b 1
)

REM Backup core files
echo [2/5] Backing up core files...
copy "index.html" "%BACKUP_DIR%\" >nul
copy "backup-manifest.json" "%BACKUP_DIR%\" >nul

REM Backup CSS
echo [3/5] Backing up stylesheets...
if not exist "%BACKUP_DIR%\css" mkdir "%BACKUP_DIR%\css"
copy "css\*.css" "%BACKUP_DIR%\css\" >nul

REM Backup JavaScript
echo [4/5] Backing up JavaScript files...
if not exist "%BACKUP_DIR%\js" mkdir "%BACKUP_DIR%\js"
copy "js\*.js" "%BACKUP_DIR%\js\" >nul

REM Backup Assets (if full backup)
if "%BACKUP_TYPE%"=="full" (
    echo [5/5] Backing up assets...
    if exist "Assets" (
        xcopy "Assets" "%BACKUP_DIR%\Assets\" /E /I /Q >nul
    )
) else (
    echo [5/5] Skipping assets (quick backup)...
)

REM Create backup metadata
echo. > "%BACKUP_DIR%\backup-info.txt"
echo Backup Information >> "%BACKUP_DIR%\backup-info.txt"
echo ================== >> "%BACKUP_DIR%\backup-info.txt"
echo Project: %PROJECT_NAME% >> "%BACKUP_DIR%\backup-info.txt"
echo Timestamp: %TIMESTAMP% >> "%BACKUP_DIR%\backup-info.txt"
echo Type: %BACKUP_TYPE% >> "%BACKUP_DIR%\backup-info.txt"
echo Created: %date% %time% >> "%BACKUP_DIR%\backup-info.txt"

REM Compress if requested
if "%COMPRESS%"=="true" (
    echo.
    echo Compressing backup...
    powershell -Command "Compress-Archive -Path '%BACKUP_DIR%\*' -DestinationPath '%BACKUP_DIR%.zip' -Force"
    if errorlevel 1 (
        echo WARNING: Compression failed, keeping uncompressed backup
    ) else (
        echo Removing uncompressed backup...
        rmdir /s /q "%BACKUP_DIR%"
        SET BACKUP_DIR=%BACKUP_DIR%.zip
    )
)

echo.
echo ========================================
echo   Backup completed successfully!
echo ========================================
echo.
echo Backup location: %BACKUP_DIR%
echo.

REM Cleanup old backups (keep last 10)
echo Cleaning up old backups...
set count=0
for /f "skip=10 delims=" %%F in ('dir /b /o-d "%BACKUP_ROOT%\backup_*" 2^>nul') do (
    rmdir /s /q "%BACKUP_ROOT%\%%F" 2>nul
    del /q "%BACKUP_ROOT%\%%F" 2>nul
    set /a count+=1
)
if !count! gtr 0 echo Removed !count! old backup(s)

echo.
echo Done!
exit /b 0
