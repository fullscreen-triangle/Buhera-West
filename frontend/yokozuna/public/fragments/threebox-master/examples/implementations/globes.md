<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React from 'react';
  import { createRoot } from 'react-dom';

  // Gen random data
  const N = 20;
  const arcsData = [...Array(N).keys()].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]]
  }));

  createRoot(document.getElementById('globeViz')).render(
    <Globe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
      arcsData={arcsData}
      arcColor={'color'}
      arcDashLength={() => Math.random()}
      arcDashGap={() => Math.random()}
      arcDashAnimateTime={() => Math.random() * 4000 + 500}
      />
  );
</script>
</body>


this is another 

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useEffect, useRef } from 'react';
  import { createRoot } from 'react-dom';
  import { csvParseRows } from 'https://esm.sh/d3-dsv';
  import indexBy from 'https://esm.sh/index-array-by';

  const COUNTRY = 'Portugal';
  const MAP_CENTER = { lat: 37.6, lng: -16.6, altitude: 0.4 };
  const OPACITY = 0.3;

  const airportParse = ([airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]) => ({ airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source });
  const routeParse = ([airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment]) => ({ airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment});

  const World = () => {
    const globeEl = useRef();
    const [airports, setAirports] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [hoverArc, setHoverArc] = useState();

    useEffect(() => {
      // load data
      Promise.all([
        fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat').then(res => res.text())
          .then(d => csvParseRows(d, airportParse)),
        fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat').then(res => res.text())
          .then(d => csvParseRows(d, routeParse))
      ]).then(([airports, routes]) => {

        const filteredAirports = airports.filter(d => d.country === COUNTRY);
        const byIata = indexBy(filteredAirports, 'iata', false);

        const filteredRoutes = routes
          .filter(d => byIata.hasOwnProperty(d.srcIata) && byIata.hasOwnProperty(d.dstIata)) // exclude unknown airports
          .filter(d => d.stops === '0') // non-stop flights only
          .map(d => Object.assign(d, {
            srcAirport: byIata[d.srcIata],
            dstAirport: byIata[d.dstIata]
          }))
          .filter(d => d.srcAirport.country === COUNTRY && d.dstAirport.country === COUNTRY); // domestic routes within country

        setAirports(filteredAirports);
        setRoutes(filteredRoutes);

        globeEl.current.pointOfView(MAP_CENTER, 4000);
      });
    }, []);

    return <Globe
      ref={globeEl}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"

      arcsData={routes}
      arcLabel={d => `${d.airline}: ${d.srcIata} &#8594; ${d.dstIata}`}
      arcStartLat={d => +d.srcAirport.lat}
      arcStartLng={d => +d.srcAirport.lng}
      arcEndLat={d => +d.dstAirport.lat}
      arcEndLng={d => +d.dstAirport.lng}
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={1500}
      arcsTransitionDuration={0}
      arcColor={d => {
        const op = !hoverArc ? OPACITY : d === hoverArc ? 0.9 : OPACITY / 4;
        return [`rgba(0, 255, 0, ${op})`, `rgba(255, 0, 0, ${op})`];
      }}
      onArcHover={setHoverArc}

      pointsData={airports}
      pointColor={() => 'orange'}
      pointAltitude={0}
      pointRadius={0.04}
      pointsMerge={true}
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style>
    body { margin: 0; }

    #time {
      position: absolute;
      bottom: 8px;
      left: 8px;
      color: lightblue;
      font-family: monospace;
    }
  </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useEffect, useCallback } from 'react';
  import { createRoot } from 'react-dom';
  import { TextureLoader, ShaderMaterial, Vector2 } from 'https://esm.sh/three';
  import * as solar from 'https://esm.sh/solar-calculator';

  const VELOCITY = 1; // minutes per frame

  // Custom shader:  Blends night and day images to simulate day/night cycle
  const dayNightShader = {
    vertexShader: `
      varying vec3 vNormal;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      #define PI 3.141592653589793
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform vec2 sunPosition;
      uniform vec2 globeRotation;
      varying vec3 vNormal;
      varying vec2 vUv;

      float toRad(in float a) {
        return a * PI / 180.0;
      }

      vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
        float theta = toRad(90.0 - c.x);
        float phi = toRad(90.0 - c.y);
        return vec3( // x,y,z
          sin(phi) * cos(theta),
          cos(phi),
          sin(phi) * sin(theta)
        );
      }

      void main() {
        float invLon = toRad(globeRotation.x);
        float invLat = -toRad(globeRotation.y);
        mat3 rotX = mat3(
          1, 0, 0,
          0, cos(invLat), -sin(invLat),
          0, sin(invLat), cos(invLat)
        );
        mat3 rotY = mat3(
          cos(invLon), 0, sin(invLon),
          0, 1, 0,
          -sin(invLon), 0, cos(invLon)
        );
        vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
        float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        float blendFactor = smoothstep(-0.1, 0.1, intensity);
        gl_FragColor = mix(nightColor, dayColor, blendFactor);
      }
    `
  };

  const sunPosAt = dt => {
    const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
    const t = solar.century(dt);
    const longitude = (day - dt) / 864e5 * 360 - 180;
    return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
  };

  const World = () => {
    const [dt, setDt] = useState(+new Date());
    const [globeMaterial, setGlobeMaterial] = useState();

    useEffect(() => {
      (function iterateTime() {
        setDt(dt => dt + VELOCITY * 60 * 1000);
        requestAnimationFrame(iterateTime);
      })();
    }, []);

    useEffect(() => {
      Promise.all([
        new TextureLoader().loadAsync('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg'),
        new TextureLoader().loadAsync('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
      ]).then(([dayTexture, nightTexture]) => {
        setGlobeMaterial(new ShaderMaterial({
          uniforms: {
            dayTexture: {value: dayTexture},
            nightTexture: {value: nightTexture},
            sunPosition: {value: new Vector2()},
            globeRotation: {value: new Vector2()}
          },
          vertexShader: dayNightShader.vertexShader,
          fragmentShader: dayNightShader.fragmentShader
        }));
      });
    }, []);

    useEffect(() => {
      // Update Sun position
      globeMaterial?.uniforms.sunPosition.value.set(...sunPosAt(dt));
    }, [dt, globeMaterial]);

    return <div>
      <Globe
        globeMaterial={globeMaterial}
        backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        // Update globe rotation on shader
        onZoom={useCallback(({ lng, lat }) => globeMaterial?.uniforms.globeRotation.value.set(lng, lat), [globeMaterial])}
      />
      <div id="time">{new Date(dt).toLocaleString()}</div>
    </div>;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useEffect, useMemo } from 'react';
  import { createRoot } from 'react-dom';

  const World = () => {
    const [rise, setRise] = useState(false);

    useEffect(() => {
      setTimeout(() => setRise(true), 6000);
    }, []);

    // Gen random paths
    const N_PATHS = 10;
    const MAX_POINTS_PER_LINE = 10000;
    const MAX_STEP_DEG = 1;
    const MAX_STEP_ALT = 0.015;
    const gData = useMemo(() => [...Array(N_PATHS).keys()].map(() => {
        let lat = (Math.random() - 0.5) * 90;
        let lng = (Math.random() - 0.5) * 360;
        let alt = 0;

        return [[lat, lng, alt], ...[...Array(Math.round(Math.random() * MAX_POINTS_PER_LINE)).keys()].map(() => {
          lat += (Math.random() * 2 - 1) * MAX_STEP_DEG;
          lng += (Math.random() * 2 - 1) * MAX_STEP_DEG;
          alt += (Math.random() * 2 - 1) * MAX_STEP_ALT;
          alt = Math.max(0, alt);

          return [lat, lng, alt];
        })];
      }),
      []
    );

    return <Globe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      pathsData={gData}
      pathColor={() => ['rgba(0,0,255,0.6)', 'rgba(255,0,0,0.6)']}
      pathDashLength={0.01}
      pathDashGap={0.004}
      pathDashAnimateTime={100000}
      pathPointAlt={rise ? pnt => pnt[2] : undefined}
      pathTransitionDuration={rise ? 4000 : undefined}
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useEffect, useRef } from 'react';
  import { createRoot } from 'react-dom';
  import * as THREE from 'https://esm.sh/three';

  const World = () => {
    const globeEl = useRef();

    useEffect(() => {
      const globe = globeEl.current;

      // Auto-rotate
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.35;

      // Add clouds sphere
      const CLOUDS_IMG_URL = './clouds.png'; // from https://github.com/turban/webgl-earth
      const CLOUDS_ALT = 0.004;
      const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

      new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
          new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
        );
        globe.scene().add(clouds);

        (function rotateClouds() {
          clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
          requestAnimationFrame(rotateClouds);
        })();
      });
    }, []);

    return <Globe
      ref={globeEl}
      animateIn={false}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useEffect, useRef } from 'react';
  import { createRoot } from 'react-dom';
  import { csvParseRows } from 'https://esm.sh/d3-dsv';
  import indexBy from 'https://esm.sh/index-array-by';

  const COUNTRY = 'United States';
  const OPACITY = 0.22;

  const airportParse = ([airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source]) => ({ airportId, name, city, country, iata, icao, lat, lng, alt, timezone, dst, tz, type, source });
  const routeParse = ([airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment]) => ({ airline, airlineId, srcIata, srcAirportId, dstIata, dstAirportId, codeshare, stops, equipment});

  const World = () => {
    const globeEl = useRef();
    const [airports, setAirports] = useState([]);
    const [routes, setRoutes] = useState([]);

    useEffect(() => {
      // load data
      Promise.all([
        fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat').then(res => res.text())
          .then(d => csvParseRows(d, airportParse)),
        fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/routes.dat').then(res => res.text())
          .then(d => csvParseRows(d, routeParse))
      ]).then(([airports, routes]) => {

        const byIata = indexBy(airports, 'iata', false);

        const filteredRoutes = routes
          .filter(d => byIata.hasOwnProperty(d.srcIata) && byIata.hasOwnProperty(d.dstIata)) // exclude unknown airports
          .filter(d => d.stops === '0') // non-stop flights only
          .map(d => Object.assign(d, {
            srcAirport: byIata[d.srcIata],
            dstAirport: byIata[d.dstIata]
          }))
          .filter(d => d.srcAirport.country === COUNTRY && d.dstAirport.country !== COUNTRY); // international routes from country

        setAirports(airports);
        setRoutes(filteredRoutes);
      });
    }, []);

    useEffect(() => {
      // aim at continental US centroid
      globeEl.current.pointOfView({ lat: 39.6, lng: -98.5, altitude: 2 });
    }, []);

    return <Globe
      ref={globeEl}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"

      arcsData={routes}
      arcLabel={d => `${d.airline}: ${d.srcIata} &#8594; ${d.dstIata}`}
      arcStartLat={d => +d.srcAirport.lat}
      arcStartLng={d => +d.srcAirport.lng}
      arcEndLat={d => +d.dstAirport.lat}
      arcEndLng={d => +d.dstAirport.lng}
      arcDashLength={0.25}
      arcDashGap={1}
      arcDashInitialGap={() => Math.random()}
      arcDashAnimateTime={4000}
      arcColor={d => [`rgba(0, 255, 0, ${OPACITY})`, `rgba(255, 0, 0, ${OPACITY})`]}
      arcsTransitionDuration={0}

      pointsData={airports}
      pointColor={() => 'orange'}
      pointAltitude={0}
      pointRadius={0.02}
      pointsMerge={true}
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style>
    body { margin: 0; }

    #time-log {
      position: absolute;
      font-size: 12px;
      font-family: sans-serif;
      padding: 5px;
      border-radius: 3px;
      background-color: rgba(200, 200, 200, 0.1);
      color: lavender;
      bottom: 10px;
      right: 10px;
    }
  </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
  import { createRoot } from 'react-dom';
  import * as satellite from 'https://esm.sh/satellite.js';

  const EARTH_RADIUS_KM = 6371; // km
  const TIME_STEP = 3 * 1000; // per frame

  const World = () => {
    const globeEl = useRef();
    const [satData, setSatData] = useState();
    const [globeRadius, setGlobeRadius] = useState();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
      // time ticker
      (function frameTicker() {
        requestAnimationFrame(frameTicker);
        setTime(time => new Date(+time + TIME_STEP));
      })();
    }, []);

    useEffect(() => {
      // load satellite data
      fetch('//cdn.jsdelivr.net/npm/globe.gl/example/datasets/space-track-leo.txt').then(r => r.text()).then(rawData => {
        const tleData = rawData.replace(/\r/g, '')
          .split(/\n(?=[^12])/)
          .filter(d => d)
          .map(tle => tle.split('\n'));
        const satData = tleData.map(([name, ...tle]) => ({
          satrec: satellite.twoline2satrec(...tle),
          name: name.trim().replace(/^0 /, '')
        }))
        // exclude those that can't be propagated
        .filter(d => !!satellite.propagate(d.satrec, new Date())?.position);

        setSatData(satData);
      });
    }, []);

    const particlesData = useMemo(() => {
      if (!satData) return [];

      // Update satellite positions
      const gmst = satellite.gstime(time);
      return [
        satData.map(d => {
          const eci = satellite.propagate(d.satrec, time);
          if (eci?.position) {
            const gdPos = satellite.eciToGeodetic(eci.position, gmst);
            const lat = satellite.radiansToDegrees(gdPos.latitude);
            const lng = satellite.radiansToDegrees(gdPos.longitude);
            const alt = gdPos.height / EARTH_RADIUS_KM;
            return { ...d, lat, lng, alt };
          } else {
            // explicitly handle invalid position
            d.lat = NaN;
            d.lng = NaN;
            d.alt = NaN;
          }
          return d;
        }).filter(d => !isNaN(d.lat) && !isNaN(d.lng) && !isNaN(d.alt))
      ];
    }, [satData, time]);

    useEffect(() => {
      setGlobeRadius(globeEl.current.getGlobeRadius());
      globeEl.current.pointOfView({ altitude: 3.5 });
    }, []);

    return <div>
      <Globe
        ref={globeEl}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        particlesData={particlesData}
        particleLabel="name"
        particleLat="lat"
        particleLng="lng"
        particleAltitude="alt"
        particlesColor={useCallback(() => 'palegreen', [])}
      />
      <div id="time-log">{time.toString()}</div>
    </div>;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useEffect, useRef } from 'react';
  import { createRoot } from 'react-dom';
  import * as THREE from 'https://esm.sh/three';

  const World = () => {
    const globeEl = useRef();

    useEffect(() => {
      const globe = globeEl.current;

      // Auto-rotate
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.35;

      // Add clouds sphere
      const CLOUDS_IMG_URL = './clouds.png'; // from https://github.com/turban/webgl-earth
      const CLOUDS_ALT = 0.004;
      const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

      new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
        const clouds = new THREE.Mesh(
          new THREE.SphereGeometry(globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
          new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
        );
        globe.scene().add(clouds);

        (function rotateClouds() {
          clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
          requestAnimationFrame(rotateClouds);
        })();
      });
    }, []);

    return <Globe
      ref={globeEl}
      animateIn={false}
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useRef, useCallback } from 'react';
  import { createRoot } from 'react-dom';

  const ARC_REL_LEN = 0.4; // relative to whole arc
  const FLIGHT_TIME = 1000;
  const NUM_RINGS = 3;
  const RINGS_MAX_R = 5; // deg
  const RING_PROPAGATION_SPEED = 5; // deg/sec

  const World = () => {
    const [arcsData, setArcsData] = useState([]);
    const [ringsData, setRingsData] = useState([]);

    const prevCoords = useRef({ lat: 0, lng: 0 });
    const emitArc = useCallback(({ lat: endLat, lng: endLng }) => {
      const { lat: startLat, lng: startLng } = prevCoords.current;
      prevCoords.current = { lat: endLat, lng: endLng };

      // add and remove arc after 1 cycle
      const arc = { startLat, startLng, endLat, endLng };
      setArcsData(curArcsData => [...curArcsData, arc]);
      setTimeout(() => setArcsData(curArcsData => curArcsData.filter(d => d !== arc)), FLIGHT_TIME * 2);

      // add and remove start rings
      const srcRing = { lat: startLat, lng: startLng };
      setRingsData(curRingsData => [...curRingsData, srcRing]);
      setTimeout(() => setRingsData(curRingsData => curRingsData.filter(r => r !== srcRing)), FLIGHT_TIME * ARC_REL_LEN);

      // add and remove target rings
      setTimeout(() => {
        const targetRing = { lat: endLat, lng: endLng };
        setRingsData(curRingsData => [...curRingsData, targetRing]);
        setTimeout(() => setRingsData(curRingsData => curRingsData.filter(r => r !== targetRing)), FLIGHT_TIME * ARC_REL_LEN);
      }, FLIGHT_TIME);
    }, []);

    return <Globe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
      onGlobeClick={emitArc}
      arcsData={arcsData}
      arcColor={() => 'darkOrange'}
      arcDashLength={ARC_REL_LEN}
      arcDashGap={2}
      arcDashInitialGap={1}
      arcDashAnimateTime={FLIGHT_TIME}
      arcsTransitionDuration={0}
      ringsData={ringsData}
      ringColor={() => t => `rgba(255,100,50,${1-t})`}
      ringMaxRadius={RINGS_MAX_R}
      ringPropagationSpeed={RING_PROPAGATION_SPEED}
      ringRepeatPeriod={FLIGHT_TIME * ARC_REL_LEN / NUM_RINGS}
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React from 'react';
  import { createRoot } from 'react-dom';

  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

  // Gen random data
  const N = 30;
  const gData = [...Array(N).keys()].map(() => ({
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    size: 7 + Math.random() * 30,
    color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
  }));

  createRoot(document.getElementById('globeViz')).render(
    <Globe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
      htmlElementsData={gData}
      htmlElement={d => {
        const el = document.createElement('div');
        el.innerHTML = markerSvg;
        el.style.color = d.color;
        el.style.width = `${d.size}px`;
        el.style.transition = 'opacity 250ms';

        el.style['pointer-events'] = 'auto';
        el.style.cursor = 'pointer';
        el.onclick = () => console.info(d);
        return el;
      }}
      htmlElementVisibilityModifier={(el, isVisible) => el.style.opacity = isVisible ? 1 : 0}
  />
  );
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React from 'react';
  import { createRoot } from 'react-dom';

  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

  // Gen random data
  const N = 30;
  const gData = [...Array(N).keys()].map(() => ({
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    size: 7 + Math.random() * 30,
    color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
  }));

  createRoot(document.getElementById('globeViz')).render(
    <Globe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
      htmlElementsData={gData}
      htmlElement={d => {
        const el = document.createElement('div');
        el.innerHTML = markerSvg;
        el.style.color = d.color;
        el.style.width = `${d.size}px`;
        el.style.transition = 'opacity 250ms';

        el.style['pointer-events'] = 'auto';
        el.style.cursor = 'pointer';
        el.onclick = () => console.info(d);
        return el;
      }}
      htmlElementVisibilityModifier={(el, isVisible) => el.style.opacity = isVisible ? 1 : 0}
  />
  );
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useEffect } from 'react';
  import { createRoot } from 'react-dom';

  const World = () => {
    const [cablePaths, setCablePaths] = useState([]);

    useEffect(() => {
      // from https://www.submarinecablemap.com
      fetch('//http-proxy.vastur.com?url=https://www.submarinecablemap.com/api/v3/cable/cable-geo.json')
        .then(r => r.json())
        .then(cablesGeo => {
          let cablePaths = [];
          cablesGeo.features.forEach(({ geometry, properties }) => {
            geometry.coordinates.forEach(coords => cablePaths.push({ coords, properties }));
          });

          setCablePaths(cablePaths);
        });
    }, []);

    return <Globe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
      pathsData={cablePaths}
      pathPoints="coords"
      pathPointLat={p => p[1]}
      pathPointLng={p => p[0]}
      pathColor={path => path.properties.color}
      pathLabel={path => path.properties.name}
      pathDashLength={0.1}
      pathDashGap={0.008}
      pathDashAnimateTime={12000}
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>

<head>
  <style> body { margin: 0; } </style>

  <script type="importmap">{ "imports": {
    "react": "https://esm.sh/react",
    "react-dom": "https://esm.sh/react-dom/client"
  }}</script>

<!--  <script type="module">import * as React from 'react'; window.React = React;</script>-->
<!--  <script src="../../dist/react-globe.gl.js" defer></script>-->
</head>

<body>
<div id="globeViz"></div>

<script src="//unpkg.com/@babel/standalone"></script>
<script type="text/jsx" data-type="module">
  import Globe from 'https://esm.sh/react-globe.gl?external=react';
  import React, { useState, useEffect } from 'react';
  import { createRoot } from 'react-dom';

  const World = () => {
    const [cablePaths, setCablePaths] = useState([]);

    useEffect(() => {
      // from https://www.submarinecablemap.com
      fetch('//http-proxy.vastur.com?url=https://www.submarinecablemap.com/api/v3/cable/cable-geo.json')
        .then(r => r.json())
        .then(cablesGeo => {
          let cablePaths = [];
          cablesGeo.features.forEach(({ geometry, properties }) => {
            geometry.coordinates.forEach(coords => cablePaths.push({ coords, properties }));
          });

          setCablePaths(cablePaths);
        });
    }, []);

    return <Globe
      globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
      pathsData={cablePaths}
      pathPoints="coords"
      pathPointLat={p => p[1]}
      pathPointLng={p => p[0]}
      pathColor={path => path.properties.color}
      pathLabel={path => path.properties.name}
      pathDashLength={0.1}
      pathDashGap={0.008}
      pathDashAnimateTime={12000}
    />;
  };

  createRoot(document.getElementById('globeViz'))
    .render(<World />);
</script>
</body>