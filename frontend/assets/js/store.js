const Store = {
  homePage: document.getElementById('homePage'),
  projectPage: document.getElementById('projectPage'),
  textPage: document.getElementById('textPage'),
  passwordPage: document.getElementById('passwordPage'),
  loginPage: document.getElementById('loginPage'),

  messageDiv: document.getElementById('message'),

  currentClose: null,
  password: null,
  project: {},
  loggedIn: false,
  os: 'Mac',
}

export default Store
