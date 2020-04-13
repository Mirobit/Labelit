# Labelit

Labelit is a tool to anonymize data. Just create a project, import your data (text), create categories and start replacing sensitive information with predefined words.

**Warning:** The software is still in development and currently only works in a local enviroment.

## Installation

**Requirements**

- Node.js >=12.13.0
- MongoDB >=4.2

Make sure that you installed Node.js and MongoDB is running.

```bash
$ git clone https://github.com/Mirobit/Labelit.git
$ cd labelit
$ npm install
```

To start the app, simply run:

```bash
$ npm start
```

Go to your browser and enter `http://localhost:8000/`

## Features

- Create projects, with custom categories
- Easy to use texteditor, with single click, keyboard shortcuts and duplicate dection
- All texts can be checked against previously found words that need to be replaced
- Lightweight single-page application (no heavy frontend framework -> 12 vs ~80 mb, 126 vs ~2400 dependencies)

## TODO

- User system (inclusive CSRF protection)
- Be able to host server remotely and upload text data
- Enable to classification of texts (for ML)
- Better error handling
- Subfolder support
- Import JSON file
