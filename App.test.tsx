import App from './App';
import renderer, {ReactTestRenderer} from 'react-test-renderer';
import Home from './src/screens/Home';
import * as Location from 'expo-location';
import {getOrCreateRealtimeRecord} from './src/lib/data';
import {startRide} from './src/lib/ride';

it('App renders correctly for signed user.', async () => {
  // check the home pages renders
  let tree!: ReactTestRenderer;
  await renderer.act(() => {
    tree = renderer.create(<App />);
  });
  tree.root.findByType(Home);
  tree.unmount();
});

it('App registers location service and logs to db with distance calculated with active ride', async () => {
  let tree!: ReactTestRenderer;
  await renderer.act(() => {
    tree = renderer.create(<App />);
  });
  tree.root.findByType(Home);
  const newLocation = {
    timestamp: new Date().getUTCMilliseconds(),
    mocked: true,
    coords: {
      accuracy: 110,
      latitude: 41.4027,
      longitude: 2.1743,
      heading: 10,
      speed: 5,
      altitude: 41.0,
      altitudeAccuracy: 0,
    },
  };

  // Trigger a location update.
  await renderer.act(async () => {
    // ensure there is an active ride
    await startRide();
    // @ts-ignore
    // this is a mock method
    Location._emitLocation(newLocation);
  });

  let record = await getOrCreateRealtimeRecord();
  expect(record.distance).toBe(0);
  expect(record.latitude).toBe(newLocation.coords.latitude);
  expect(record.longitude).toBe(newLocation.coords.longitude);

  const nextLocation = {
    timestamp: new Date().getUTCMilliseconds() + 1000,
    mocked: true,
    coords: {
      accuracy: 110,
      latitude: 41.4035,
      longitude: 2.1732,
      heading: 10,
      speed: 5,
      altitude: 49.0,
      altitudeAccuracy: 0,
    },
  };

  // Trigger a location update.
  await renderer.act(() => {
    // @ts-ignore
    // this is a mock method
    Location._emitLocation(nextLocation);
  });

  let updatedRecord = await getOrCreateRealtimeRecord();
  expect(updatedRecord.distance).toBeCloseTo(128.0, 0);
  expect(updatedRecord.latitude).toBe(nextLocation.coords.latitude);
  expect(updatedRecord.longitude).toBe(nextLocation.coords.longitude);

  // Now check for record in realtime db.
  tree.unmount();
});

it('App registers location service and logs to db with movingTime calculated with active ride', async () => {
  let tree!: ReactTestRenderer;
  const coords = {
    accuracy: 110,
    latitude: 41.4027,
    longitude: 2.1743,
    heading: 10,
    altitude: 41.0,
    altitudeAccuracy: 0,
  };

  await renderer.act(async () => {
    tree = renderer.create(<App />);
  });

  tree.root.findByType(Home);

  // Trigger a location update.
  await renderer.act(async () => {
    // ensure there is an active ride
    await startRide();
    // @ts-ignore
    // this is a mock method
  });

  const record = await getOrCreateRealtimeRecord();
  expect(record.movingTime).toBe(0);
  expect(record.lastLocationAt).toBe(null);
  const startTime = Date.now();
  // Trigger a location update.
  await renderer.act(async () => {
    // @ts-ignore
    // this is a mock method
    await Location._emitLocation({
      timestamp: startTime,
      mocked: true,
      coords: {
        ...coords,
        speed: 1,
      },
    });
  });

  expect(record.movingTime).toBe(0);

  // Trigger a location update.
  await renderer.act(async () => {
    // @ts-ignore
    // this is a mock method
    await Location._emitLocation({
      timestamp: startTime + 1000,
      mocked: true,
      coords: {
        ...coords,
        speed: 1,
      },
    });
  });

  // check that
  expect(record.movingTime).toBe(1000);

  // Trigger a location update.
  await renderer.act(async () => {
    // @ts-ignore
    // this is a mock method
    await Location._emitLocation({
      timestamp: startTime + 2000,
      mocked: true,
      coords: {
        ...coords,
        speed: 1,
      },
    });
  });

  // check that
  expect(record.movingTime).toBe(2000);

  // Trigger a location update.
  await renderer.act(async () => {
    // @ts-ignore
    // this is a mock method
    await Location._emitLocation({
      timestamp: startTime + 3000,
      mocked: true,
      coords: {
        ...coords,
        speed: 0,
      },
    });
  });

  // should not have incremented
  // because speed is == 0
  expect(record.movingTime).toBe(2000);

  // Now check for record in realtime db.
  tree.unmount();
});

it('App registers location service and logs to db with without movingTime calculated with inactive ride', async () => {
  let tree!: ReactTestRenderer;
  const coords = {
    accuracy: 110,
    latitude: 41.4027,
    longitude: 2.1743,
    heading: 10,
    altitude: 41.0,
    altitudeAccuracy: 0,
  };

  await renderer.act(async () => {
    tree = renderer.create(<App />);
  });

  tree.root.findByType(Home);

  const record = await getOrCreateRealtimeRecord();
  expect(record.movingTime).toBe(0);
  expect(record.lastLocationAt).toBe(null);

  const startTime = Date.now();
  // Trigger a location update.
  await renderer.act(async () => {
    // @ts-ignore
    // this is a mock method
    await Location._emitLocation({
      timestamp: startTime,
      mocked: true,
      coords: {
        ...coords,
        speed: 1,
      },
    });
  });

  expect(record.movingTime).toBe(0);

  // Trigger a location update.
  await renderer.act(async () => {
    // @ts-ignore
    // this is a mock method
    await Location._emitLocation({
      timestamp: startTime + 1000,
      mocked: true,
      coords: {
        ...coords,
        speed: 1,
      },
    });
  });

  // should still be 0.
  expect(record.movingTime).toBe(0);

  tree.unmount();
});

it('App registers location service and logs to db without distance calculated with inactive ride', async () => {
  let tree!: ReactTestRenderer;
  await renderer.act(() => {
    tree = renderer.create(<App />);
  });
  tree.root.findByType(Home);
  const newLocation = {
    timestamp: new Date().getUTCMilliseconds(),
    mocked: true,
    coords: {
      accuracy: 110,
      latitude: 41.4027,
      longitude: 2.1743,
      heading: 10,
      speed: 5,
      altitude: 41.0,
      altitudeAccuracy: 0,
    },
  };

  // Trigger a location update.
  await renderer.act(async () => {
    // @ts-ignore
    // this is a mock method
    Location._emitLocation(newLocation);
  });

  let record = await getOrCreateRealtimeRecord();

  expect(record.distance).toBe(0);
  expect(record.latitude).toBe(newLocation.coords.latitude);
  expect(record.longitude).toBe(newLocation.coords.longitude);

  const nextLocation = {
    timestamp: new Date().getUTCMilliseconds() + 1000,
    mocked: true,
    coords: {
      accuracy: 110,
      latitude: 41.4035,
      longitude: 2.1732,
      heading: 10,
      speed: 5,
      altitude: 49.0,
      altitudeAccuracy: 0,
    },
  };

  // Trigger a location update.
  await renderer.act(() => {
    // @ts-ignore
    // this is a mock method
    Location._emitLocation(nextLocation);
  });

  let updatedRecord = await getOrCreateRealtimeRecord();
  expect(updatedRecord.distance).toBeCloseTo(0);
  expect(updatedRecord.latitude).toBe(nextLocation.coords.latitude);
  expect(updatedRecord.longitude).toBe(nextLocation.coords.longitude);

  // Now check for record in realtime db.
  tree.unmount();
});
