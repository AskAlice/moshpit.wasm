import React, { useState } from 'react';
import logo from './logo.svg';
import styled from 'styled-components';
import { AppBar, Toolbar, IconButton, Typography, Button } from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import './wasm_exec.js';
import main from '../../main.wasm';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const AppContainer = styled.section`
  width: 100vw;
  height: 100vh;
`;

const Main = styled.main`
  width: 100%;
  height: 100%;
  margin: 2em;
`;

const Bar = styled(AppBar)`
  flex-grow: 1;
  .MenuButton {
    margin-right: 1em;
  }
  h6 {
    flex-grow: 1;
  }
`;
Object.assign(self, {
  process,
  global: self,
});
const readFromBlobOrFile = (blob) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = ({
      target: {
        error: { code },
      },
    }) => {
      reject(Error(`File could not be read! Code=${code}`));
    };
    fileReader.readAsArrayBuffer(blob);
  });
declare global {
  interface Window {
    showOpenFilePicker: any;
    Go: any;
  }
}
function App() {
  const [count, setCount] = useState(0);
  const [fileContents, setFileContents] = useState(null);
  const go = new window.Go();
  const initWasm = async () => {
    const mod = await main(go.importObject);
    go.run(mod);
    // test.run();
    // let { instance, module } = await WebAssembly.instantiateStreaming(fetch('src/main.wasm'), go.importObject);
    // await go.run(instance);
  };
  const handleClick = async () => {
    await initWasm();
    setCount(count + 1);
    let fileHandle;
    [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    await ffmpeg.load();
    setMessage('Start transcoding');
    ffmpeg.FS('writeFile', file.name, await fetchFile(await file.arrayBuffer()));
    await ffmpeg.run('-i', file.name, 'test.avi');
    setMessage('Complete transcoding');
    const data = ffmpeg.FS('readFile', 'test.avi');
    setVideoSrc(URL.createObjectURL(new Blob([data.buffer], { type: 'video/avi' })));
    setFileContents(contents);
  };
  const [videoSrc, setVideoSrc] = useState('');
  const [message, setMessage] = useState('Click Start to transcode');
  const ffmpeg = createFFmpeg({
    log: true,
  });
  const doTranscode = async () => {
    setMessage('Loading ffmpeg-core.js');
  };
  return (
    <AppContainer className="App">
      <header className="App-header">
        <Bar position="static">
          <Toolbar>
            <IconButton className="MenuButton" edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">News</Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </Bar>
      </header>
      <Main>
        <p>Hello Vite + React!</p>
        <Button color="primary" variant="contained" onClick={handleClick}>
          count is: {count}
        </Button>
        <section>
          <video src={videoSrc} controls></video>
          <br />
        </section>
      </Main>
    </AppContainer>
  );
}

export default App;
