@echo off
echo ========================================
echo Fixing GitHub Push Issues
echo ========================================
echo.

echo Step 1: Pulling changes from GitHub...
git pull origin main --allow-unrelated-histories

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Committing...
git commit -m "Complete upload with frontend and all features"

echo.
echo Step 4: Force pushing to GitHub...
git push origin main --force

echo.
echo ========================================
echo Done! Check GitHub to verify.
echo ========================================
pause
