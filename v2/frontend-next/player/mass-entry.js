// Both Player and website run the same mass schedule and signed-in self-service components.
import {mountPublicMassSchedule} from '../shared/mass-schedule-ui.js';
import {mountMassSelfService} from '../shared/mass-self-ui.js';
mountPublicMassSchedule(document.getElementById('massPublicMount'));
mountMassSelfService(document.getElementById('massSelfMount'));
