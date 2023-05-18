/* eslint-disable no-unused-expressions */
import { Button, makeStyles, shorthands } from '@fluentui/react-components';
import React from 'react';
import Section from './components/section';
import Field from './components/field';
import './App.css';

const useStyles = makeStyles({
  root: {
    ...shorthands.padding('12px'),
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '24px',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    columnGap: '12px',
  },
});

interface Data {
  website?: string;
  spiderScript?: string;
  spiderInterval?: string;
  refreshScript?: string;
  cookies?: string;
}

const cachedData = JSON.parse(localStorage.getItem('data') ?? '{}') as Data;

export default function App() {
  const classes = useStyles();
  const [data, setData] = React.useState<Data>(cachedData);
  const [isWorking, setIsWorking] = React.useState(false);
  const webview = document.getElementById('webview');

  const refreshInterval = React.useRef<ReturnType<typeof setInterval>>();
  const executeInteval = React.useRef<ReturnType<typeof setInterval>>();

  const gotoWebsite = () => {
    document
      .getElementById('webview')
      ?.setAttribute('src', data.website ?? 'about:blank');
  };

  const setDateFactory = (key: keyof Data) => (value: string) => {
    const newData = {
      ...data,
      [key]: value,
    };
    setData(newData);
    localStorage.setItem('data', JSON.stringify(newData));
  };

  const execute = React.useCallback(async () => {
    executeInteval.current && clearInterval(executeInteval.current);
    executeInteval.current = setInterval(() => {
      (webview as any)
        .executeJavaScript(data.spiderScript)
        .then((result: string) => {
          if (result) {
            window.electron.ipcRenderer.sendMessage('ipc-example', [result]);
          }
          return null;
        })
        .catch((e: any) => {
          console.log('execute error', e);
        });
    }, parseInt(data.spiderInterval ?? '10', 10) * 1000);
  }, [data.spiderScript, webview, data.spiderInterval]);

  const start = async () => {
    (webview as any).openDevTools();
    setIsWorking(true);
    refreshInterval.current = setInterval(() => {
      (webview as any).executeJavaScript(`window.location.reload()`);
    }, parseInt(data.refreshScript ?? '10', 10) * 1000);
    execute();
    await (webview as any).addEventListener('dom-ready', execute);
  };

  const stop = async () => {
    if (!isWorking) {
      return;
    }
    setIsWorking(false);
    refreshInterval.current && clearInterval(refreshInterval.current);
    executeInteval.current && clearInterval(executeInteval.current);
    await (webview as any).removeEventListener('dom-ready', execute);
    await (webview as any).executeJavaScript(`window.location.reload()`);
  };

  return (
    <div className={classes.root}>
      <Section title="访问设置">
        <Field
          title="网址"
          name="website"
          value={data.website}
          onChange={setDateFactory('website')}
        />
        <div className={classes.buttonGroup}>
          <Button
            appearance="primary"
            onClick={gotoWebsite}
            disabled={isWorking}
          >
            Go
          </Button>
        </div>
      </Section>
      <Section title="脚本设置">
        <Field
          title="爬虫脚本"
          name="spider-script"
          type="textarea"
          value={data.spiderScript}
          onChange={setDateFactory('spiderScript')}
          disabled={isWorking}
        />
        <Field
          title="爬虫间隔 (秒)"
          name="spider-interval"
          type="input"
          value={data.spiderInterval}
          onChange={setDateFactory('spiderInterval')}
          disabled={isWorking}
          inputType="number"
        />
        <Field
          title="刷新间隔 (秒)"
          name="refresh-script"
          type="input"
          value={data.refreshScript}
          onChange={setDateFactory('refreshScript')}
          disabled={isWorking}
          inputType="number"
        />
        <div className={classes.buttonGroup}>
          <Button appearance="primary" onClick={start} disabled={isWorking}>
            开始
          </Button>
          <Button appearance="secondary" onClick={stop}>
            停止
          </Button>
        </div>
      </Section>
    </div>
  );
}
