'use strict'
require('./init')

const test = require('ava')

const db = require('./db')
const projectServices = require('../services/projects')
const Text = require('../models/Text')
const Project = require('../models/Project')
const { hash } = require('../utils/crypter')

test.before(async (t) => {
  await db.connect()
  t.context.projectR = await new Project({
    name: 'Test Project',
    description: 'Test description',
    inputMode: 'folder',
    inputPath: './examples/raw_txt_files',
    password: hash('ava'),
    classActive: true,
    textCount: 0,
  }).save()

  t.context.project2 = await new Project({
    name: 'Test Project 2',
    description: 'Test description',
    inputMode: 'folder',
    inputPath: './examples/raw_txt_files',
    password: hash('ava'),
    classActive: false,
    textCount: 0,
  }).save()

  t.context.project3 = await new Project({
    name: 'Test Project 3',
    description: 'Test description',
    inputMode: 'folder',
    inputPath: './examples/raw_txt_files',
    password: hash('ava'),
    classActive: false,
    textCount: 0,
  }).save()

  t.context.project4 = await new Project({
    name: 'Test Project 4',
    description: 'Test description',
    inputMode: 'folder',
    inputPath: './examples/raw_txt_files',
    password: hash('ava'),
    classActive: false,
    textCount: 0,
  }).save()

  t.context.projectC = {
    name: 'New Project',
    description: 'Test description',
    inputMode: 'folder',
    inputPath: './examples/raw_txt_files',
    password: 'ava',
  }

  t.context.projectE = {
    name: 'New Project 2',
    description: 'Test description',
    inputMode: 'folder',
    inputPath: './notexistingfolder',
    password: 'ava',
  }

  t.context.cat1 = {
    name: 'Person',
    key: 'p',
    keyUp: 'P',
    color: 'green',
    colorHex: '#ffffff',
  }
  t.context.cat2 = {
    name: 'Company',
    key: 'c',
    keyUp: 'C',
    color: 'green',
    colorHex: '#ffffff',
  }
  t.context.cat3 = {
    name: 'Company',
    key: 'd',
    keyUp: 'D',
    color: 'green',
    colorHex: '#ffffff',
  }
  t.context.cat4 = {
    name: 'Entity',
    key: 'e',
    keyUp: 'E',
    color: 'green',
    colorHex: '#ffffff',
  }
  t.context.cat5 = {
    name: 'Country',
    key: 'e',
    keyUp: 'E',
    color: 'green',
    colorHex: '#ffffff',
  }
  t.context.catR = {
    name: 'Names',
    key: 'n',
    keyUp: 'N',
    color: 'green',
    colorHex: '#ffffff',
  }

  t.context.clasC = {
    name: 'Good',
  }
  t.context.clasD1 = {
    name: 'Bad',
  }
  t.context.clasD2 = {
    name: 'Bad',
  }
  t.context.clasR = {
    name: 'Good',
  }
})
test('Project: Create', async (t) => {
  await projectServices.create(t.context.projectC)
  const project = await projectServices.get(t.context.projectC.name)
  t.is(project.name, t.context.projectC.name)
})

test('Project: Create: Invalid path', async (t) => {
  const error = await t.throwsAsync(projectServices.create(t.context.projectE))
  t.is(error.message, 'Project path does not exist')
})

test('Project: List all', async (t) => {
  const projects = await projectServices.list()
  t.is(projects.length, 4)
})

test('Project: Show by name', async (t) => {
  const project = await projectServices.get(t.context.projectR.name)
  t.is(project.name, t.context.projectR.name)
})

test('Project: Check valid password', async (t) => {
  const result = await projectServices.checkPassword(
    t.context.projectR.name,
    'ava'
  )
  t.is(result, true)
})

test('Project: Check password: Invalid password', async (t) => {
  const error = await t.throwsAsync(
    projectServices.checkPassword(t.context.projectR.name, 'vav')
  )
  t.is(error.message, 'Invalid project password')
})

test('Project: Remove by id', async (t) => {
  await projectServices.remove(t.context.projectR._id)
  const result = await projectServices.get(t.context.projectR.name)
  t.is(result, null)
})

test('Project: Add category', async (t) => {
  await projectServices.addCategory(t.context.project2._id, t.context.cat1)
  const project = await projectServices.get(t.context.project2.name)
  delete project.categories[0]._id
  t.deepEqual(project.categories[0], t.context.cat1)
})

test('Project: Add category: Duplicate Name', async (t) => {
  await projectServices.addCategory(t.context.project2._id, t.context.cat2)
  const error = await t.throwsAsync(
    projectServices.addCategory(t.context.project2._id, t.context.cat3)
  )
  t.is(error.message, 'Duplicate category name')
})

test('Project: Add category: Duplicate Key', async (t) => {
  await projectServices.addCategory(t.context.project2._id, t.context.cat4)
  const error = await t.throwsAsync(
    projectServices.addCategory(t.context.project2._id, t.context.cat5)
  )
  t.is(error.message, 'Duplicate category shortcut key')
})

test('Project: Update category', async (t) => {
  await projectServices.addCategory(t.context.project3._id, t.context.cat1)
  const categoryId = String(
    (await projectServices.get(t.context.project3.name)).categories.find(
      (cat) => cat.name === t.context.cat1.name
    )._id
  )
  await projectServices.updateCategory(
    t.context.project3._id,
    categoryId,
    t.context.catR
  )
  const categoryNew = (
    await projectServices.get(t.context.project3.name)
  ).categories.find((cat) => cat.name === t.context.catR.name)
  delete categoryNew._id

  t.deepEqual(categoryNew, t.context.catR)
})

test('Project: Update category: Duplicate Name', async (t) => {
  await projectServices.addCategory(t.context.project4._id, t.context.cat1)
  await projectServices.addCategory(t.context.project4._id, t.context.cat2)

  const categoryId = String(
    (await projectServices.get(t.context.project4.name)).categories.find(
      (cat) => cat.name === t.context.cat1.name
    )._id
  )
  const error = await t.throwsAsync(
    projectServices.updateCategory(
      t.context.project4._id,
      categoryId,
      t.context.cat2
    )
  )
  t.is(error.message, 'Duplicate category name')
})

test('Project: Update category: Duplicate Key', async (t) => {
  await projectServices.addCategory(t.context.project4._id, t.context.catR)
  await projectServices.addCategory(t.context.project4._id, t.context.cat4)

  const categoryId = String(
    (await projectServices.get(t.context.project4.name)).categories.find(
      (cat) => cat.name === t.context.catR.name
    )._id
  )
  const error = await t.throwsAsync(
    projectServices.updateCategory(
      t.context.project4._id,
      categoryId,
      t.context.cat5
    )
  )
  t.is(error.message, 'Duplicate category shortcut key')
})

test('Project: Remove category', async (t) => {
  await projectServices.addCategory(t.context.project2._id, t.context.catR)
  const categories = (await projectServices.get(t.context.project2.name))
    .categories
  const category = categories.find((cat) => cat.name === t.context.catR.name)
  await projectServices.removeCategory(t.context.project2._id, category._id)
  const project = await projectServices.get(t.context.project2.name)
  const result = project.categories.some((cat) => cat._id === category._id)
  t.deepEqual(result, false)
})

test('Project: Add classification', async (t) => {
  await projectServices.addClassification(
    t.context.project2._id,
    t.context.clasC
  )
  const project = await projectServices.get(t.context.project2.name)
  delete project.classifications[0]._id
  t.deepEqual(project.classifications[0], t.context.clasC)
})

test('Project: Add classification: Duplicate Name', async (t) => {
  await projectServices.addClassification(
    t.context.project2._id,
    t.context.clasD1
  )
  const error = await t.throwsAsync(
    projectServices.addClassification(t.context.project2._id, t.context.clasD2)
  )
  t.is(error.message, 'Duplicate classification')
})

test('Project: Update classification: Duplicate Name', async (t) => {
  await projectServices.addClassification(
    t.context.project4._id,
    t.context.clasC
  )
  await projectServices.addClassification(
    t.context.project4._id,
    t.context.clasD1
  )

  const classificationId = String(
    (await projectServices.get(t.context.project4.name)).classifications.find(
      (clas) => clas.name === t.context.clasC.name
    )._id
  )
  const error = await t.throwsAsync(
    projectServices.updateClassification(
      t.context.project4._id,
      classificationId,
      t.context.clasD1
    )
  )
  t.is(error.message, 'Duplicate classification')
})

test('Project: Remove classification', async (t) => {
  await projectServices.addClassification(
    t.context.project2._id,
    t.context.clasR
  )
  const classifications = (await projectServices.get(t.context.project2.name))
    .classifications
  const classification = classifications.find(
    (clas) => clas.name === t.context.clasR.name
  )
  await projectServices.removeClassification(
    t.context.project2._id,
    classification._id
  )
  const project = await projectServices.get(t.context.project2.name)
  const result = project.categories.some(
    (clas) => clas._id === classification._id
  )
  t.deepEqual(result, false)
})

test.after(async (t) => {
  await db.close()
})
