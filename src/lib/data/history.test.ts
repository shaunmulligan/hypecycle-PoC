import {startRide, stopRide} from '../ride';
import {
  updateRealTimeRecordRandom,
  getOrCreateRealtimeRecord,
  onSnapshotEvent,
} from './realtime';
import {generateTCX, saveTCX} from './history';
import {TrainingCenterDatabase} from 'tcx-builder';
import * as strava from '../strava';

it('generate a tcx from ride history', async () => {
  const snapshotCount = 5;
  const realtime = await getOrCreateRealtimeRecord();
  const ride = await startRide();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (let _x in [...Array(snapshotCount).keys()]) {
    await onSnapshotEvent();
    await updateRealTimeRecordRandom(realtime);
  }

  await stopRide(ride);
  const tcx = await generateTCX(ride);
  const fileURI = await saveTCX(tcx);
  const upload = await strava.upload(tcx);

  expect(tcx).toBeInstanceOf(TrainingCenterDatabase);
  expect(tcx.Activities?.Activity![0].Laps[0].Track?.TrackPoints.length).toBe(
    snapshotCount,
  );
});
