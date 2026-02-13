@echo off
REM ============================================
REM NAPANGA Restore Script for Windows
REM ============================================
REM Usage: restore.bat <backup_directory> [options]
REM Options:
REM   --force    Overwrite existing files without prompting
REM   --dry-run  Show what would be restored without making changes
REM ============================================

SETLOCAL EnableDelayedExpansion

REM Configuration
SET PROJECT_NAME=NAPANGA
SET FORCE=false
SET DRY_RUN=false
SET BACKUP_SOURCE=%~1

REM Parse arguments
:parse_args
IF "%~1"=="" goto :end_parse
IF /I "%~1"=="--force" SET FORCE=true
IF /I "%~1"=="--dry-run" SET DRY_RUN=true
SHIFT
goto :parse_args
:end_parse

echo.
echo ========================================
echo   %PROJECT_NAME% Restore Utility
echo ========================================
echo.

REM Check if backup source is provided
if "%BACKUP_SOURCE%"=="" (
    echo ERROR: No backup directory specified
    echo.
    echo Usage: restore.bat ^<backup_directory^> [options]
    echo.
    echo Available backups:
    if exist "backups" (
        dir /b /o-d "backups" 2>nul
    ) else (
        echo   No backups found
    )
    echo.
    echo Options:
    echo   --force    Overwrite existing files without prompting
    echo   --dry-run  Show what would be restored without making changes
    echo.
    exit /b 1
)

REM Check if backup source exists
if not exist "%BACKUP_SOURCE%" (
    echo ERROR: Backup directory not found: %BACKUP_SOURCE%
    exit /b 1
)

REM Handle ZIP files
if "%BACKUP_SOURCE:~-4%"==".zip" (
    echo Extracting ZIP backup...
    powershell -Command "Expand-Archive -Path '%BACKUP_SOURCE%' -DestinationPath 'temp_restore' -Force"
    SET BACKUP_SOURCE=temp_restore
)

echo Backup Source: %BACKUP_SOURCE%
echo Force Mode: %FORCE%
echo Dry Run: %DRY_RUN%
echo.

REM Verify backup integrity
echo [1/4] Verifying backup integrity...
if not exist "%BACKUP_SOURCE%\index.html" (
    echo ERROR: Invalid backup - missing index.html
    if exist "temp_restore" rmdir /s /q "temp_restore"
    exit /b 1
)
if not exist "%BACKUP_SOURCE%\backup-manifest.json" (
    echo WARNING: Missing backup-manifest.json - proceeding anyway
)
echo Backup verified successfully.

REM Show backup info if available
if exist "%BACKUP_SOURCE%\backup-info.txt" (
    echo.
    echo Backup Information:
    type "%BACKUP_SOURCE%\backup-info.txt"
    echo.
)

REM Confirm restore (unless force mode)
if "%FORCE%"=="false" (
    if "%DRY_RUN%"=="false" (
        set /p CONFIRM="Proceed with restore? (Y/N): "
        if /I "!CONFIRM!" neq "Y" (
            echo Restore cancelled.
            if exist "temp_restore" rmdir /s /q "temp_restore"
            exit /b 0
        )
    )
)

REM Restore core files
echo [2/4] Restoring core files...
if "%DRY_RUN%"=="true" (
    echo   [DRY RUN] Would copy: %BACKUP_SOURCE%\index.html
    echo   [DRY RUN] Would copy: %BACKUP_SOURCE%\backup-manifest.json
) else (
    copy "%BACKUP_SOURCE%\index.html" ".\" >nul
    copy "%BACKUP_SOURCE%\backup-manifest.json" ".\" >nul
    echo   Restored: index.html
    echo   Restored: backup-manifest.json
)

REM Restore CSS
echo [3/4] Restoring stylesheets...
if exist "%BACKUP_SOURCE%\css" (
    if "%DRY_RUN%"=="true" (
        echo   [DRY RUN] Would copy CSS files
    ) else (
        if not exist "css" mkdir "css"
        copy "%BACKUP_SOURCE%\css\*.css" "css\" >nul
        echo   Restored: CSS files
    )
) else (
    echo   No CSS files to restore
)

REM Restore JavaScript
echo [4/4] Restoring JavaScript files...
if exist "%BACKUP_SOURCE%\js" (
    if "%DRY_RUN%"=="true" (
        echo   [DRY RUN] Would copy JS files
    ) else (
        if not exist "js" mkdir "js"
        copy "%BACKUP_SOURCE%\js\*.js" "js\" >nul
        echo   Restored: JavaScript files
    )
) else (
    echo   No JavaScript files to restore
)

REM Restore Assets
if exist "%BACKUP_SOURCE%\Assets" (
    echo.
    echo Restoring assets...
    if "%DRY_RUN%"=="true" (
        echo   [DRY RUN] Would copy Assets folder
    ) else (
        if exist "Assets" (
            echo   Existing Assets folder found
            if "%FORCE%"=="true" (
                xcopy "%BACKUP_SOURCE%\Assets" "Assets\" /E /I /Q /Y >nul
                echo   Restored: Assets (overwritten)
            ) else (
                echo   Skipping Assets (use --force to overwrite)
            )
        ) else (
            xcopy "%BACKUP_SOURCE%\Assets" "Assets\" /E /I /Q >nul
            echo   Restored: Assets
        )
    )
)

REM Cleanup temp directory
if exist "temp_restore" (
    echo.
    echo Cleaning up temporary files...
    rmdir /s /q "temp_restore"
)

echo.
echo ========================================
if "%DRY_RUN%"=="true" (
    echo   Dry run completed!
    echo   No files were modified.
) else (
    echo   Restore completed successfully!
)
echo ========================================
echo.

REM Update manifest timestamp
if "%DRY_RUN%"=="false" (
    echo Updating backup manifest...
    powershell -Command "(Get-Content 'backup-manifest.json') -replace '\"lastModified\": \"[^\"]+\"', '\"lastModified\": \"%date%T%time%\"' | Set-Content 'backup-manifest.json'"
)

echo Done!
exit /b 0
