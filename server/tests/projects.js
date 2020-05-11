const test = require('ava')

const db = require('./db')
const projectServices = require('../services/projects')
const Text = require('../models/Text')
const Project = require('../models/Project')

test.before(async (t) => {
  await db.connect()
  const project = await new Project({
    name: 'Test Project',
    description: 'Test description',
    inputMode: 'folder',
    inputPath: './examples/raw_txt_files',
    password: 'ava',
    classActive: true,
    textCount: 0,
  }).save()
  t.context.project = project
})

test('Project: List all', async (t) => {
  const projects = await projectServices.list()
  t.is(projects.length, 1)
})

test('Project: Show by name', async (t) => {
  const project = await projectServices.get(t.context.project.name)
  t.is(project.name, t.context.project.name)
})

test('Project: Remove by id', async (t) => {
  const lengthBefore = (await projectServices.list()).length
  const project = await projectServices.remove(t.context.project._id)
  const lengthAfter = (await projectServices.list()).length
  t.is(lengthAfter, lengthBefore - 1)
})

test.after(async (t) => {
  await db.close()
})
