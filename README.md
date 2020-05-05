# Labelit

<img align="left" height="200" src="https://raw.githubusercontent.com/Mirobit/Labelit/master/frontend/assets/images/logo.svg">Labelit is a simple and straightforward tool for fast anonymization or pseudonymization and labeling of text data. This is particularly relevant if you're planning to work with text corpora (e.g. twitter posts) that contain a lot of personal references. Labelit allows you to remove personal information while maintaining the informational and semantical content. On top of that, with Labelit you can label text corpora with self-selected classes - a necessary preprocessing step for all kinds of quantitive analyses.  
Just create a project, import your data (text files), create categories for named entities and start replacing sensitive information with your predefined words.

**Warning:** The software is still in early development and currently only works in a local enviroment. Do not use it on a remote server, there is no fileupload yet.

## Features

- Create projects with custom categories and wordlists
- Texts and replaced words are stored encrypted (AES-256) in the database
- Easy to use texteditor: single click selection, keyboard shortcuts and duplicate detection
- All texts can be checked against previously found sensitive words (project based wordlist)
- Lightweight single-page application (no heavy frontend framework -> 12 vs ~80 mb, 180 vs ~2400 dependencies)
- Not a feature, more a notice: ES6 -> IE 11 not supported (on purpose, IE needs be to vanished from the web)

<img src="https://i.imgur.com/JduLdHt.png" width="400" style="margin-left: 20px"> <img src="https://i.imgur.com/zE1ChFB.png" width="400">

## Installation

**Requirements**

- Node.js 12.13.0+
- MongoDB 4.2+

Make sure that you installed [Node.js](https://nodejs.org/en/download/) and [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) is running:

```bash
git clone https://github.com/Mirobit/Labelit.git
cd Labelit
npm install
```

Now open the `.env.example` file and follow the instructions.

To start the app, simply run:

```bash
npm start
```

Go to your browser and enter `http://localhost:8000/`. You can login with `admin` and the password from the `.env` file

## How To

See [GUIDE.md](https://github.com/Mirobit/Labelit/blob/master/GUIDE.md)

## ToDo

- User system
- Be able to host server remotely and upload text data
- ~~Enable classification of texts (for ML)~~
- ~~Better error handling~~
- ~~Subfolder support~~
- Import JSON file
- Testing with ava
