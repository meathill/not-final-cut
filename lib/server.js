const {
  promises: {
    writeFile,
  },
} = require('fs');
const express = require('express');
const app = new express();
const config = require('./config');

let _projectFile;

app.use(express.json());
app.use('/', express.static('dist'));

app.post('/api/save', async(req, res) => {
  const project = req.body;
  await writeFile(_projectFile, JSON.stringify(project), 'utf8');
  return res.json({
    code: 0,
    data: 'ok',
  });
});
app.post('/api/export', (req, res) => {

});


function createServer(project) {
  const {
    port,
    projectFile,
    cwd,
  } = config.get();
  _projectFile = projectFile;
  app.use('/source', express.static(cwd));
  app.get('/api/project.json', (req, res) => {
    res.json(project);
  });
  app.listen(port, () => {
    console.log(`Not Final Cut are running at http://localhost:${port}`);
  });
}

module.exports = createServer;
