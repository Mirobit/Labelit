# User Guide for the Labelit Platform

This document will tell you how to use the Labelit Platform. If you have problems installing or running Labelit check [README.md](https://github.com/Mirobit/Labelit/blob/master/README.md).

## 1. Landing Page

![homepage](https://user-images.githubusercontent.com/50407361/81276241-080d5c00-9053-11ea-8cba-e280278c8eac.png)

### 1.1 New Project

To create a new project, enter the project details into the "New Project" section. The project description is optional.

#### 1.1.1 Project Password
The project password is not the same as your user password - it's project-specific and cannot be changed at a later point since it's used for database encription. You have to enter it every time you start to work on a project.  

#### 1.1.2 Text Import
Depending on how your text data are stored you can choose .csv import or import from a folder with separate text files.
If you choose import from a folder with separate text files just enter the path to this folder into the project folder field. Both LINUX / MAC and Windows paths are supported. Files can be of any text format (.txt, .json, ...). Make sure that your project folder does not contain other non-text files, that you don't want to have in your Labelit project.

If you choose import from a .csv file you should enter the path to this file.
**Attention**: the first column of your .csv file will be used as an ID, and the second column should contain your texts. Make sure to convert your .csv file accordingly before using it for import.

Check the [examples folder](https://github.com/Mirobit/Labelit/tree/master/examples) for examples of correct import formats.

#### 1.1.3 Classification
If you want to enable whole text classification on top of your text anonymization (e.g. for machine learning purposes) confirm the corresponding checkbox and click "Create Project".
**Attention**: If you enable text classification you have to specifiy classes (e.g. "Happy text", "Sad text"), and choose at least one class for every text file you're editing.

### 1.2 Project List
On the right you have an overview of all the projects you have created on your local Labelit account. On the small overview you can see the number of text found in your project folder. If the number does not match with the number of actual text files check your project path. The progress bar shows the amount of texts you have edited with the Labelit tool.

To start working on a project simply click on the title and enter your project password.

## 2. Project Page

### 2.1 Information and Export
In the Information Section on the left you can view and edit project details. Enter a path to the desired export folder. The Export path can be the same as the project path, since a new subfolder for the labeled and classified text files will be created. Edited texts can be saved as .json, .csv or .txt file.

### 2.2 Categories for Anonymization
Here you can define all the categories for the anonymization of named entities (e.g. person, localization, ...). Chosen entities (e.g. names) will be replaced with the selected category (e.g. person). You can create as many categories as you want. Categories can be changed at a later point.

Choose a category name (e.g. "Person"), a key for the keyboard shortcut (e.g. "p") and a category color (e.g. blue). You can label named entities fastly by marking them and clicking the selected key. They will be replaced with the selected category name.

### 2.3 Classifications
Here you can define the classes for text classification (e.g. "happy", "sad", "neutral"). You can define as many classes as you want.

### 2.4 Text Overview
As soon as you have set up your labels and (optionally) classifications you can start editing your texts by clicking on one of the text files.

## 3. Text editing
Click on a word once to mark it. If you want to mark several words click on the first and the last word while holding Shift on your keyboard.
You can choose a category by Clicking the respective Category Button on the right or using your selected keyboard shortcut. Click on the ![cross](https://user-images.githubusercontent.com/50407361/81275697-52daa400-9052-11ea-80d6-d54196b12da2.png) Button to redo a categorization.

Categorized words will be stored (hashed) in the database. For all following appearances of the word, replacement with the selected category will be suggested. You can accept ![checkmark](https://user-images.githubusercontent.com/50407361/81275754-64bc4700-9052-11ea-90e7-fd25c4cf8e05.png) or reject ![cross](https://user-images.githubusercontent.com/50407361/81275697-52daa400-9052-11ea-80d6-d54196b12da2.png) the suggestion.
Make sure to save your changes before proceeding to the next text.

When you're done with editing the project texts you can press the *Check* Button on the Project Page. This will automatically compare the databse entries with all project texts to check if there are unlabeled named entities.
