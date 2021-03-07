const {
  promises: {
    writeFile,
  },
} = require('fs');
const express = require('express');
const app = new express();

let _projectFile;

app.use(express.json());
app.use('/', express.static('dist'));
app.use('/source', express.static(process.cwd()));

app.post('/api/save', async (req, res) => {
  const project = req.body;
  await writeFile(_projectFile, project, 'utf8');
  return res.json({
    code: 0,
    data: 'ok',
  });
});
app.post('/api/export', (req, res) => {

});


function createServer(port, project, projectFile) {
  _projectFile = projectFile;
  app.get('/project.json', (req, res) => {
    res.json(project);
  });
  app.listen(port, () => {
    console.log('Not Final Cut are running at http://localhost:${port');
  });
}

module.exports = createServer;
