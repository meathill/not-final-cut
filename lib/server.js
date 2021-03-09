const {
  promises: {
    writeFile,
  },
} = require('fs');
const express = require('express');
const app = new express();
const config = require('./config');

let _projectFile;

app.use(express.json({limit: '10mb'}));
app.use('/', express.static('dist'));

app.post('/api/save', async(req, res) => {
  let project = req.body;
  project = JSON.stringify(project);
  if (project.length < 100) {
    return res.error({
      code: 1,
      message: '内容太少',
    });
  }
  await writeFile(_projectFile, project, 'utf8');
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
