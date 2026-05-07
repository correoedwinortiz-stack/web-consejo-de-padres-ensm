@echo off
echo Iniciando servidor local para la web del Consejo de Padres...
echo La web se abrira en http://localhost:3000
echo.
start http://localhost:3000
python -m http.server 3000
pause
