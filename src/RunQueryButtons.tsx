import React, { useEffect, useState } from 'react';
import { HorizontalGroup, Button, Spinner } from '@grafana/ui';
import { DataQuery, LoadingState } from '@grafana/data';

interface RunQueryButtonsProps<TQuery extends DataQuery> {
  onRunQuery: () => void;
  onCancelQuery: (query: TQuery) => void;
  query: TQuery;
  state?: LoadingState;
}

export const RunQueryButtons = <TQuery extends DataQuery>(props: RunQueryButtonsProps<TQuery>) => {
  const { state } = props;
  const [running, setRunning] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [lastState, setLastState] = useState(state);
  const [lastQuery, setLastQuery] = useState(props.query);

  useEffect(() => {
    if (state && lastState !== state && state !== LoadingState.Loading) {
      setRunning(false);
      setStopping(false);
    }

    setLastState(state);
  }, [state, lastState]);

  const onRunQuery = () => {
    setRunning(true);
    setLastQuery(props.query);
    props.onRunQuery();
  };

  const onCancelQuery = () => {
    props.onCancelQuery(lastQuery);
    setStopping(true);
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
