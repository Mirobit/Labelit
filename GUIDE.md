# User Guide for the Labelit Platform

This document will tell you how to use the Labelit Platform. If you have problems installing or running Labelit check [README.md](https://github.com/Mirobit/Labelit/blob/master/README.md).

## 1. Landing Page

### 1.1 New Project

To create a new project, enter the project details into the "New Project" section. The project description is optional.

### 1.1.1 Project Password
The project password is not the same as your user password - it's project-specific and cannot be changed at a later point since it's used for database encription. You have to enter it every time you start to work on a project.  

### 1.1.2 Text Import
Depending on how your text data are stored you can choose .csv import or import from a folder with separate text files.
If you choose import from a folder with separate text files just enter the path to this folder into the project folder field. Both LINUX / MAC and Windows paths are supported. Files can be of any text format (.txt, .json, ...). Make sure that your project folder does not contain other non-text files, that you don't want to have in your Labelit project.

If you choose import from a .csv file you should enter the path to this file. **Attention**: the first column of your .csv file will be used as an ID, and the second column should contain your texts. Make sure to convert your .csv file accordingly before using it for import.

### 1.1.3 Classification
If you want to enable whole text classification on top of your text anonymization (e.g. for machine learning purposes) confirm the corresponding checkbox and click "Create Project". **Attention**: if you enable text classification you have to specifiy classes (e.g. "Happy text", "Sad text"), and choose at least one class for every text file you're editing.

### 1.2 Project List
On the right you have an overview of all the projects you have created on your local Labelit account. On the small overview you can see the number of text found in your project folder. If the number does not match with the number of actual text files check your project path. The progress bar shows the amount of texts you have edited with the Labelit tool.

To start working on a project simply click on the title and enter your project password.

## 2. Project Page

### 2.1 Information and Export
In the Information Section on the left you can view and edit project details. Enter a path to the desired export folder. Export path can be the same as the project path, since a new subfolder for the labeled and classified text files will be created. Edited texts will be saved as .json files or as .csv file.

### 2.2 Categories for Anonymization
Here you can define all the categories for the anonymization of named entities (e.g. person, localization, ...). Chosen entities (e.g. names) will be replaced with the selected category (e.g. person). You can create as many categories as you want. Categories can be changed at a later point.

Choose a category name (e.g. "Person"), a key for the keyboard shortcut (e.g. "p") and a category color (e.g. blue). You can label named entities fastly by marking them and clicking the selected key. They will be replaced with the selected category name.

### 2.3 Classifications
Here you can define the classes for text classification (e.g. "happy", "sad", "neutral").

### 2.4 Text Overview
As soon as you have set up your labels and (optionally) classifications you can start editing your texts by clicking on one of the text files.

## 3. Text editing
Click on a word once to mark it. If you want to mark several words click on the first and then the last word while holding the Shift key on your keyboard.
You can choose a category by
