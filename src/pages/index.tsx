import React, { useState, useEffect } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import styled from 'styled-components';

const StyledButton = styled.button`
  background: purple;
  color: white;
  border: none;
  pointer: cursor;

  &:disabled {
    pointer: not-allowed;
    background: red;
  }
  &.active {
    background: green;
  }
`;

const wsPath = 'ws://localhost:4455';

const obs = new OBSWebSocket();

//not a particularly important key
//replaced with env var in production
const pwd = 'abc1234';

const connect = async () => {
  await obs.connect(wsPath, pwd);
  console.log('connected');
};
const getOBSData = async () => {
  await connect();
  const obsData = await obs.call('GetSceneList').then((data) => data);
  return obsData;
};

const setScene = async (sceneName) => {
  await connect();

  obs.call('SetCurrentProgramScene', { sceneName: sceneName });
};

// markup
const IndexPage = () => {
  const [stateWSPath, setStateWSPath] = useState(wsPath);
  const [stateScenes, setStateScenes] = useState([]);
  const [stateConnected, setStateConnected] = useState(false);
  const [stateActiveScene, setStateActiveScene] = useState('');

  const onCurrentSceneChanged = (data) => {
    setStateActiveScene(data.sceneName);
  };
  useEffect(async () => {
    const obsData = await getOBSData();
    setStateScenes(obsData.scenes);
    setStateActiveScene(obsData.currentProgramSceneName);
    obs.on('CurrentProgramSceneChanged', onCurrentSceneChanged);
    obs.onClose(() => {
      console.log('obs onclose');
      setStateConnected(false);
    });
    setStateConnected(true);
    return () => {
      obs.disconnect();
    };
  }, []);

  return (
    <main>
      <title>Home Page</title>
      <h1>OBS Websocket Test</h1>
      <input
        type="text"
        value={stateWSPath}
        onChange={(e) => setStateWSPath(e.target.value)}
      />
      <StyledButton
        disabled={stateConnected !== false}
        onClick={getOBSData}
      >
        Connect
      </StyledButton>
      <br />
      {stateScenes.map((scene) => {
        return (
          <StyledButton
            key={scene.sceneName}
            onClick={() => {
              setScene(scene.sceneName);
            }}
            className={
              scene.sceneName === stateActiveScene ? 'active' : ''
            }
          >
            Scene:{scene.sceneName}
          </StyledButton>
        );
      })}
    </main>
  );
};

export default IndexPage;
