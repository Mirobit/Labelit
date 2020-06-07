## Installation

Follow the official instructions to install the [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/).

## Change database storage path

Usually MongoDB stores the database on the disk (e.g. /data/db). But you can change the path to an external device.

**Warning:** The database is not automatically copied to the new location. So do this before starting a project.

### Linux

Open `/etc/mongod.conf` with a texteditor and look for the line `dbpath=/some/path`.
Change the line to `dbpath=/your/new/path` and save the file.
After restarting `mongod`, the new path is used as storage location.

### Mac

If you installed MongoDB via homebrew, open `/usr/local/etc/mongod.conf` with a texteditor and look for the line `dbpath=/some/path`.
Change the line to `dbpath=/your/new/path` and save the file.
Restart MongoDB to apply the changes: `brew services stop mongodb-community` and then `brew services start mongodb-community`

### Windows

Open `C:/Program Files/MongoDB/Server/4.2/bin/mongod.cfg` (the first part can be different, depeneding on your system) with a texteditor and look for the line `dbpath=/some/path`.
Change the line to `dbpath=D:/your/new/path` and save the file.
After restarting MongoDB, the new path is used as storage location. To do this open the Windows Services App, right-click on `MongoDB Database Server (MongoDB)` and select restart.
