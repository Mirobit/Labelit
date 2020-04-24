# User Guide for the Labelit Platform

This document will tell you how to use the Labelit Platform. If you have problems installing or running Labelit check [README.md](https://github.com/Mirobit/Labelit/blob/master/README.md).

## Landing Page

### New Project
To create a new project, enter the project details into the "New Project" section. The project description is optional.
The project password is not the same as your user password - it's project-specific and cannot be changed at a later point since it's used for database encription. You have to enter it every time you start to work on a project.  

Please enter the path to the folder where your text files are located into the projectfolder field. Both LINUX / MAC and Windows paths are supported. Files can be of any text format (.txt, .json, ...). Make sure that your project folder does not contain other non-text files, that you don't want to have in your Labelit project.

If you want to enable whole text classification on top of your text anonymization (e.g. for machine learning purposes) confirm the corresponding checkbox and click "Create Project". Attention: if you enable text classification you have to specifiy classes (e.g. "Happy text", "Sad text"), and choose at least one class for every text file you're editing.

### Project List
On the right you have an overview of all the projects you have created on your local Labelit account. On the small overview you can see the number of text found in your project folder. If the number does not match with the number of actual text files check your project path. The progress bar shows the amount of texts you have edited with the Labelit tool.

To start working on a project simply click on the title and enter your project password.

## Project Page

### Information and Export
In the Information Section on the left you can view and edit project details. Enter a path to the desired export folder. Export path can be the same as the project path, since a new subfolder for the labeled and classified text files will be created. Edited texts will be saved as .json files.

### Categories
Here you can define all the categories for the anonymization of named entities (e.g. person, localization, ...). Chosen entities (e.g. names) will be replaced with the selected category (e.g. person). Categories can be changed at a later point.

### Classifications
Here you can define the classes for text classification (e.g. "happy", "sad", "neutral").

### Texts
As soon as you have set up your labels and (optionally) classifications you can start editing your texts by clicking on one of the text files. Have fun!
