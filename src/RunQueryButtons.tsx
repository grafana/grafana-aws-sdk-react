import React, { useEffect, useState } from 'react';
import { HorizontalGroup, Button, Spinner } from '@grafana/ui';
import { LoadingState } from '@grafana/data';

interface RunQueryButtonsProps {
  state?: LoadingState;
  onRunQuery: () => void;
  onCancelQuery: () => void;
}

export const RunQueryButtons = (props: RunQueryButtonsProps) => {
  const { state } = props;
  const [running, setRunning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [lastState, setLastState] = useState(state);

  useEffect(() => {
    if (state && lastState !== state && state !== LoadingState.Loading) {
      setRunning(false);
      setStopping(false);
    }

    setLastState(state);
  }, [state, lastState]);

  const onRunQuery = () => {
    setRunning(true);
    props.onRunQuery();
  };

  const onCancelQuery = () => {
    setStopping(true);
    props.onCancelQuery();
  };

  return (
    <HorizontalGroup>
      <Button icon={running ? undefined : 'play'} disabled={running} onClick={onRunQuery}>
        {running && !stopping ? (
          <HorizontalGroup>
            <Spinner /> Running
          </HorizontalGroup>
        ) : (
          'Run'
        )}
      </Button>
      <Button icon={running ? undefined : 'square-shape'} disabled={!running || stopping} onClick={onCancelQuery}>
        {stopping ? (
          <HorizontalGroup>
            <Spinner /> Stopping
          </HorizontalGroup>
        ) : (
          'Stop'
        )}
      </Button>
    </HorizontalGroup>
  );
};
