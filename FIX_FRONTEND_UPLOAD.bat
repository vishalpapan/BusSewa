@echo off
echo ========================================
echo Fixing Frontend Upload Issue
echo ========================================
echo.

echo Problem: Frontend was a Git submodule (had its own .git folder)
echo Solution: Removed frontend/.git folder
echo.

echo Step 1: Removing frontend from git cache...
git rm -r --cached frontend

echo.
echo Step 2: Adding frontend as regular folder...
git add frontend

echo.
echo Step 3: Committing changes...
git commit -m "Fix: Add frontend folder (removed submodule)"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Frontend should now upload properly.
echo Check GitHub - arrow mark should be gone!
echo ========================================
pause
