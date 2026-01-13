# Data Management & Backup Guide

This guide explains how to backup and restore the BusSewa database, ensuring your data is safe during deployments and updates.

## Current Database Configuration

*   **Database Engine**: SQLite
*   **Production File**: `/home/ubuntu/BusSewa/backend/db.sqlite3`
*   **Backup Method**: JSON Export (Database Agnostic) or File Copy

## Using the Management Script

We have created a robust script `manage_data.py` in the backend directory to handle exports and imports safely.

### 1. Data Backup (Export)

To export the entire database to a JSON file:

```bash
cd /home/ubuntu/BusSewa/backend
python3 manage_data.py export > backup_$(date +%F).json
```
*   This command creates a file like `backup_2024-01-13.json`.
*   **When to run**: Before any redeployment, update, or major data operation.

### 2. Data Restore (Import)

To restore data from a backup file:

```bash
cd /home/ubuntu/BusSewa/backend
python3 manage_data.py import < your_backup_file.json
```
*   **Note**: This will update existing records and create new ones. It uses a transaction, so if an error occurs, no changes are made.

## Alternative: Full File Backup (SQLite Only)

Since the production system currently uses SQLite, you can simply copy the database file for an instant snapshot.

**Backup:**
```bash
cp /home/ubuntu/BusSewa/backend/db.sqlite3 /home/ubuntu/BusSewa/backend/db.sqlite3.backup_$(date +%F)
```

**Restore:**
```bash
# Stop the service first to ensure no writes occur
sudo systemctl stop bussewa
cp /home/ubuntu/BusSewa/backend/db.sqlite3.backup_2024-01-XX /home/ubuntu/BusSewa/backend/db.sqlite3
sudo systemctl start bussewa
```

## When to use what?

| Scenario | Recommended Method | Why? |
| :--- | :--- | :--- |
| **Routine Backup** | `manage_data.py export` | creates portable JSON, good for version control |
| **Before Deployment** | **BOTH** | File copy for speed/safety, Export for portability |
| **Moving Servers** | `manage_data.py export` | JSON can be imported into Postgres/MySQL later |
| **Quick Undo** | File Copy | Fastest way to revert a bad change on the same server |

## Handling New Features (Volunteer/Attendance)

The `manage_data.py` script automatically detects all fields in the models. Since we added `is_volunteer` and attendance fields to the standard `Booking` model, they are **automatically included** in the backup. No manual changes are needed to the script when adding simple fields.
