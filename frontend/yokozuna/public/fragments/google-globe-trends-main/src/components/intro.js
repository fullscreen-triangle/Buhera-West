import React from 'react';

import { useStateValue } from '../state';
import Button from './button';
import Description from './description';
import Fade from './fade';

export default function Intro() {
  const [{ hasLoaded, start }, dispatch] = useStateValue();

  return (
    <Fade className="intro" show={!start}>
      <h1>Google Globe Trends</h1>
      <p>
        <Description />
      </p>
      <Fade show={hasLoaded}>
        <Button label="Explore" onClick={() => dispatch({ type: 'START' })} />
      </Fade>
    </Fade>
  );
}
