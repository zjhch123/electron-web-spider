import React from 'react';
import { Card, Title3, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '12px',
  },
});

export default function Section(
  props: React.PropsWithChildren<{
    title: string;
  }>
) {
  const classes = useStyles();

  return (
    <div className={classes.section}>
      <Title3>{props.title}</Title3>
      <Card>{props.children}</Card>
    </div>
  );
}
